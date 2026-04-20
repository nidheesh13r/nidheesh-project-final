const fs = require('fs');
const path = require('path');
const axios = require('axios'); // We'll need to add this to package.json
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
    console.log('✅ Authenticated successfully.');

    // 2. Prepare Xray Multipart Import
    // Xray Cloud JUnit Multipart endpoint expects 'file' for XML and 'info' for metadata
    const form = new FormData();
    const junitPath = path.join(process.cwd(), 'playwright-report/results.xml');
    
    if (!fs.existsSync(junitPath)) {
      throw new Error(`JUnit XML not found at ${junitPath}`);
    }

    form.append('file', fs.createReadStream(junitPath));

    // 3. Scan Playwright JSON for evidence (screenshots/videos)
    const results = JSON.parse(fs.readFileSync(JSON_REPORT, 'utf8'));
    console.log('📦 Scanning for evidence artifacts...');

    const info = {
      fields: {
        project: { key: projectKey },
        summary: `Execution Results: ${new Date().toISOString()}`,
        description: "Test execution with evidence (videos/screenshots) from Playwright CI."
      }
    };
    form.append('info', JSON.stringify(info));

    // 4. Extract and append attachments
    let attachmentCount = 0;
    
    function findAttachments(suite) {
      if (suite.suites) suite.suites.forEach(findAttachments);
      if (suite.specs) {
        suite.specs.forEach(spec => {
          spec.tests.forEach(test => {
            test.results.forEach(result => {
              if (result.attachments) {
                result.attachments.forEach(attachment => {
                  let filePath = attachment.path;
                  // Handle potential absolute paths from Playwright JSON
                  if (filePath && !path.isAbsolute(filePath)) {
                    filePath = path.join(process.cwd(), filePath);
                  }
                  
                  if (filePath && fs.existsSync(filePath)) {
                    console.log(`📎 Found artifact: ${path.basename(filePath)}`);
                    form.append('attachment', fs.createReadStream(filePath));
                    attachmentCount++;
                  }
                });
              }
            });
          });
        });
      }
    }
    
    results.suites.forEach(findAttachments);

    console.log(`🚀 Uploading results with ${attachmentCount} attachments...`);
    
    // 5. Send to Xray
    const uploadRes = await axios.post(
      `${XRAY_API_BASE}/api/v1/import/execution/junit/multipart`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${token}`
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    console.log('🎉 Xray Upload Complete!');
    console.log('Response:', JSON.stringify(uploadRes.data, null, 2));

  } catch (error) {
    console.error('❌ Upload Failed:', error.response ? error.response.data : error.message);
    process.exit(1);
  }
}

upload();
