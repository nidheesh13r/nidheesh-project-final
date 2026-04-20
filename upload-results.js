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

    // 2. Load Playwright Results
    const results = JSON.parse(fs.readFileSync(JSON_REPORT, 'utf8'));
    
    // 3. Convert to Xray JSON Format
    const xrayData = {
      info: {
        summary: `Execution Results: ${new Date().toLocaleString()}`,
        description: "Automated Playwright run with automatic Bug creation for failures.",
        project: projectKey
      },
      tests: []
    };

    const attachments = []; // To store file streams for multipart

    function processSuite(suite) {
      if (suite.suites) suite.suites.forEach(processSuite);
      if (suite.specs) {
        suite.specs.forEach(spec => {
          // Extract Jira Key from title (e.g. "TAHA-1 Hotels home")
          const match = spec.title.match(/([A-Z]+-\d+)/);
          if (!match) return;
          const testKey = match[1];

          spec.tests.forEach(test => {
            test.results.forEach(result => {
              const status = result.status === 'passed' ? 'PASSED' : 'FAILED';
              const xrayTest = {
                testKey: testKey,
                status: status,
                comment: result.error ? `Error: ${result.error.message}` : "Test passed successfully.",
                evidence: []
              };

              // If FAILED, add a Defect (BUG)
              if (status === 'FAILED') {
                xrayTest.defects = [
                  {
                    fields: {
                      summary: `Bug found in ${testKey}: ${spec.title}`,
                      description: `Test failed during automation run.\n\nError Details:\n${result.error?.stack || result.error?.message}`,
                      issuetype: { name: "Bug" },
                      project: { key: projectKey }
                    }
                  }
                ];
              }

              // Handle Evidence (Videos/Screenshots)
              if (result.attachments) {
                result.attachments.forEach(attachment => {
                  let filePath = attachment.path;
                  if (filePath && !path.isAbsolute(filePath)) {
                    filePath = path.join(process.cwd(), filePath);
                  }

                  if (filePath && fs.existsSync(filePath)) {
                    const filename = path.basename(filePath);
                    const fileContent = fs.readFileSync(filePath).toString('base64');
                    
                    xrayTest.evidence.push({
                      data: fileContent,
                      filename: filename,
                      contentType: filename.endsWith('.webm') ? 'video/webm' : 'image/png'
                    });
                    
                    console.log(`📎 Embedded evidence for ${testKey}: ${filename}`);
                  }
                });
              }

              xrayData.tests.push(xrayTest);
            });
          });
        });
      }
    }

    results.suites.forEach(processSuite);

    // 4. Upload to Xray JSON API
    console.log(`🚀 Uploading ${xrayData.tests.length} test results to Xray...`);
    
    // Using the Xray JSON API (Standard)
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
    console.log('Test Execution Key:', uploadRes.data.key);

  } catch (error) {
    if (error.response) {
      console.error('❌ Xray API Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('❌ Upload Failed:', error.message);
    }
    process.exit(1);
  }
}

upload();
