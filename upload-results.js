const fs = require('fs');
const path = require('path');
const axios = require('axios');

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

    // 2. Load Playwright Results
    const results = JSON.parse(fs.readFileSync(JSON_REPORT, 'utf8'));
    
    // 3. Prepare Xray JSON
    const xrayData = {
      info: {
        summary: `Execution Results: ${new Date().toLocaleString()}`,
        description: "Automated Playwright run with bug creation and failure evidence.",
        project: projectKey
      },
      tests: []
    };

    function processSuite(suite) {
      if (suite.suites) suite.suites.forEach(processSuite);
      if (suite.specs) {
        suite.specs.forEach(spec => {
          const match = spec.title.match(/([A-Z]+-\d+)/);
          if (!match) return;
          const testKey = match[1];

          // Always take the last attempt
          const testAttempt = spec.tests[0];
          const result = testAttempt.results[testAttempt.results.length - 1];
          
          const status = result.status === 'passed' ? 'PASSED' : 'FAILED';
          const xrayTest = {
            testKey: testKey,
            status: status,
            comment: result.error ? `Error: ${result.error.message}` : "Passed",
            evidence: []
          };

          if (status === 'FAILED') {
            // Auto-create BUG
            xrayTest.defects = [{
              fields: {
                summary: `Bug in ${testKey}: ${spec.title}`,
                description: `CI Failure.\nError:\n${result.error?.stack || result.error?.message}`,
                issuetype: { name: "Bug" },
                project: { key: projectKey }
              }
            }];

            // Attach evidence ONLY for failures to stay under payload limits
            if (result.attachments) {
              result.attachments.forEach(attachment => {
                let filePath = attachment.path;
                if (filePath && !path.isAbsolute(filePath)) filePath = path.join(process.cwd(), filePath);
                
                if (filePath && fs.existsSync(filePath)) {
                  const filename = `${testKey}_${path.basename(filePath)}`;
                  const base64Data = fs.readFileSync(filePath).toString('base64');
                  
                  xrayTest.evidence.push({
                    data: base64Data,
                    filename: filename,
                    contentType: filename.endsWith('.webm') ? 'video/webm' : 'image/png'
                  });
                  console.log(`📎 Embedded evidence for failure ${testKey}: ${filename}`);
                }
              });
            }
          }
          xrayData.tests.push(xrayTest);
        });
      }
    }

    results.suites.forEach(processSuite);

    // 4. Send to Xray Standard JSON Endpoint
    console.log(`🚀 Uploading ${xrayData.tests.length} results to Xray (Direct JSON)...`);
    
    const uploadRes = await axios.post(
      `${XRAY_API_BASE}/api/v1/import/execution`,
      xrayData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    console.log('🎉 Xray Upload Complete!');
    console.log('Execution Key:', uploadRes.data.key);

  } catch (error) {
    if (error.response) {
      console.error('❌ Xray API Error:', error.response.status, JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('❌ Upload Failed:', error.message);
    }
    process.exit(1);
  }
}

upload();
