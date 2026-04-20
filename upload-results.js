const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

async function upload() {
  const REGION = 'eu';
  const XRAY_API_BASE = `https://${REGION}.xray.cloud.getxray.app`;
  const JSON_REPORT = 'playwright-report/results.json';
  
  const clientID = process.env.XRAY_CLIENT_ID;
  const clientSecret = process.env.XRAY_CLIENT_SECRET;
  const projectKey = process.env.JIRA_PROJECT_KEY;

  if (!clientID || !clientSecret || !projectKey) {
    console.error('❌ Missing Xray credentials or Project Key');
    process.exit(1);
  }

  try {
    // 1. Authenticate
    console.log(`🔐 Authenticating with Xray EU...`);
    const authRes = await axios.post(`${XRAY_API_BASE}/api/v1/authenticate`, {
      client_id: clientID,
      client_secret: clientSecret
    });
    const token = authRes.data;

    // 2. Load and Prepare Xray JSON
    const results = JSON.parse(fs.readFileSync(JSON_REPORT, 'utf8'));
    const xrayData = {
      info: {
        summary: `Execution Results: ${new Date().toLocaleString()}`,
        description: "Automated Playwright run with bug creation and streaming evidence.",
        project: projectKey
      },
      tests: []
    };

    const form = new FormData();
    let attachmentCount = 0;

    function processSuite(suite) {
      if (suite.suites) suite.suites.forEach(processSuite);
      if (suite.specs) {
        suite.specs.forEach(spec => {
          const match = spec.title.match(/([A-Z]+-\d+)/);
          if (!match) return;
          const testKey = match[1];

          // Use only the LATEST result for each spec to save space
          const test = spec.tests[0];
          const result = test.results[test.results.length - 1]; // Last attempt
          
          const status = result.status === 'passed' ? 'PASSED' : 'FAILED';
          const xrayTest = {
            testKey: testKey,
            status: status,
            comment: result.error ? `Error: ${result.error.message}` : "Passed"
          };

          if (status === 'FAILED') {
            xrayTest.defects = [{
              fields: {
                summary: `Bug in ${testKey}: ${spec.title}`,
                description: `Failed on CI.\n${result.error?.stack || result.error?.message}`,
                issuetype: { name: "Bug" },
                project: { key: projectKey }
              }
            }];

            // Only attach evidence for FAILED tests to stay under the 413 limit
            if (result.attachments) {
              result.attachments.forEach(attachment => {
                let filePath = attachment.path;
                if (filePath && !path.isAbsolute(filePath)) filePath = path.join(process.cwd(), filePath);
                
                if (filePath && fs.existsSync(filePath)) {
                  const filename = `${testKey}_${path.basename(filePath)}`;
                  // Xray Multipart JSON expects 'file' for each attachment part
                  form.append('file', fs.createReadStream(filePath), { filename });
                  attachmentCount++;
                  console.log(`📎 Queued evidence for ${testKey}: ${filename}`);
                }
              });
            }
          }
          xrayData.tests.push(xrayTest);
        });
      }
    }

    results.suites.forEach(processSuite);

    // 3. Prepare the Multipart Request
    // The Xray Multipart JSON endpoint requires the JSON in a field named 'result'
    form.append('result', JSON.stringify(xrayData), {
        contentType: 'application/json',
        filename: 'results.json'
    });

    console.log(`🚀 Streaming ${xrayData.tests.length} results + ${attachmentCount} attachments...`);
    
    const uploadRes = await axios.post(
      `${XRAY_API_BASE}/api/v1/import/execution/multipart`,
      form,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          ...form.getHeaders()
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    console.log('🎉 Xray Upload Complete!');
    console.log('Execution Key:', uploadRes.data.key);

  } catch (error) {
    if (error.response) {
      console.error('❌ Xray API Error:', error.response.status, error.response.data);
    } else {
      console.error('❌ Upload Failed:', error.message);
    }
    process.exit(1);
  }
}

upload();
