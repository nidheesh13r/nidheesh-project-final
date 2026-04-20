const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

async function upload() {
  const REGION = 'eu';
  const XRAY_API_BASE = `https://${REGION}.xray.cloud.getxray.app`;
  const JSON_REPORT = 'playwright-report/results.json';
  const JUNIT_REPORT = 'playwright-report/results.xml';

  const clientID = process.env.XRAY_CLIENT_ID;
  const clientSecret = process.env.XRAY_CLIENT_SECRET;
  const projectKey = process.env.JIRA_PROJECT_KEY;
  const jiraBaseUrl = process.env.JIRA_BASE_URL;   // e.g. https://seekernid.atlassian.net
  const jiraEmail = process.env.JIRA_EMAIL;
  const jiraApiToken = process.env.JIRA_API_TOKEN;

  if (!clientID || !clientSecret || !projectKey) {
    console.error('❌ Missing Xray credentials or Project Key');
    process.exit(1);
  }

  try {
    // ── STEP 1: Upload JUnit XML to Xray (simple, proven endpoint) ──
    console.log('🔐 Authenticating with Xray EU...');
    const authRes = await axios.post(`${XRAY_API_BASE}/api/v1/authenticate`, {
      client_id: clientID,
      client_secret: clientSecret
    });
    const token = authRes.data;
    console.log('✅ Authenticated with Xray.');

    if (!fs.existsSync(JUNIT_REPORT)) {
      throw new Error(`JUnit XML not found at ${JUNIT_REPORT}`);
    }

    console.log('📤 Uploading JUnit XML to Xray...');
    const xmlData = fs.readFileSync(JUNIT_REPORT, 'utf8');
    const xrayRes = await axios.post(
      `${XRAY_API_BASE}/api/v1/import/execution/junit?projectKey=${projectKey}`,
      xmlData,
      {
        headers: {
          'Content-Type': 'text/xml',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    console.log('🎉 Xray Upload Complete! Execution Key:', xrayRes.data.key || JSON.stringify(xrayRes.data));

    // ── STEP 2: Create Jira Bugs for failed tests ──
    if (!jiraBaseUrl || !jiraEmail || !jiraApiToken) {
      console.log('⚠️  Jira REST credentials not configured. Skipping Bug creation.');
      console.log('   To enable: add JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN as GitHub secrets.');
      return;
    }

    const jiraAuth = Buffer.from(`${jiraEmail}:${jiraApiToken}`).toString('base64');
    const jiraHeaders = {
      'Authorization': `Basic ${jiraAuth}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Parse Playwright JSON for failures
    const results = JSON.parse(fs.readFileSync(JSON_REPORT, 'utf8'));
    const failures = [];

    function findFailures(suite) {
      if (suite.suites) suite.suites.forEach(findFailures);
      if (suite.specs) {
        suite.specs.forEach(spec => {
          const match = spec.title.match(/([A-Z]+-\d+)/);
          const testAttempt = spec.tests[0];
          const result = testAttempt.results[testAttempt.results.length - 1];
          if (result.status !== 'passed') {
            failures.push({
              id: match ? match[1] : 'UNKNOWN',
              title: spec.title,
              error: result.error?.message || 'Unknown error',
              stack: result.error?.stack || '',
              attachments: result.attachments || []
            });
          }
        });
      }
    }
    results.suites.forEach(findFailures);

    console.log(`\n🐞 Found ${failures.length} failed tests. Creating Bugs in Jira...`);

    for (const fail of failures) {
      try {
        // Create Bug issue
        const bugPayload = {
          fields: {
            project: { key: projectKey },
            summary: `[Auto] Bug: ${fail.title}`,
            description: {
              type: "doc",
              version: 1,
              content: [
                {
                  type: "paragraph",
                  content: [
                    { type: "text", text: `Automated test failure detected by Playwright CI.\n\nTest: ${fail.title}\nError: ${fail.error}\n\nStack Trace:\n${fail.stack}` }
                  ]
                }
              ]
            },
            issuetype: { name: "Bug" },
            labels: ["automation-bug", "playwright"]
          }
        };

        const bugRes = await axios.post(
          `${jiraBaseUrl}/rest/api/3/issue`,
          bugPayload,
          { headers: jiraHeaders }
        );
        const bugKey = bugRes.data.key;
        console.log(`✅ Created Bug ${bugKey} for "${fail.title}"`);

        // Attach evidence files to the bug
        for (const att of fail.attachments) {
          let filePath = att.path;
          if (!filePath) continue;
          if (!path.isAbsolute(filePath)) filePath = path.join(process.cwd(), filePath);
          if (!fs.existsSync(filePath)) continue;

          // Only attach screenshots and videos (skip traces/md to save space)
          const ext = path.extname(filePath).toLowerCase();
          if (!['.png', '.webm', '.jpg', '.jpeg'].includes(ext)) continue;

          const form = new FormData();
          form.append('file', fs.createReadStream(filePath));

          await axios.post(
            `${jiraBaseUrl}/rest/api/3/issue/${bugKey}/attachments`,
            form,
            {
              headers: {
                ...form.getHeaders(),
                'Authorization': `Basic ${jiraAuth}`,
                'X-Atlassian-Token': 'no-check'
              }
            }
          );
          console.log(`  📎 Attached ${path.basename(filePath)} to ${bugKey}`);
        }
      } catch (bugErr) {
        console.error(`  ❌ Failed to create bug for "${fail.title}":`, bugErr.response?.data || bugErr.message);
      }
    }

    console.log('\n🏁 Done! All results uploaded and bugs created.');

  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('❌ Error:', error.message);
    }
    process.exit(1);
  }
}

upload();
