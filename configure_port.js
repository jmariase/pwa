import fs from 'fs';
import path from 'path';

// Load credentials from environment or command-line arguments
const clientId = process.env.PORT_CLIENT_ID || process.argv[2];
const clientSecret = process.env.PORT_CLIENT_SECRET || process.argv[3];
const workspacePath = '.';

if (!clientId || !clientSecret) {
  console.error('❌ Error: Missing credentials!');
  console.log('Usage: node configure_port.js <PORT_CLIENT_ID> <PORT_CLIENT_SECRET>');
  console.log('Alternatively, set PORT_CLIENT_ID and PORT_CLIENT_SECRET environment variables.');
  process.exit(1);
}

const baseUrl = 'https://api.port.io/v1';

async function run() {
  try {
    console.log('🔑 Authenticating with Port.io...');
    const authResponse = await fetch(`${baseUrl}/auth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, clientSecret })
    });

    if (!authResponse.ok) {
      throw new Error(`Authentication failed: ${authResponse.statusText}`);
    }

    const { accessToken } = await authResponse.json();
    console.log('✅ Authenticated successfully!');

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    };

    // 1. Load and create Blueprints
    const blueprintsFile = path.join(workspacePath, '.port/blueprints.json');
    if (fs.existsSync(blueprintsFile)) {
      console.log('\n📐 Creating blueprints...');
      const blueprints = JSON.parse(fs.readFileSync(blueprintsFile, 'utf8'));

      for (const bp of blueprints) {
        console.log(`Sending blueprint: ${bp.identifier} (${bp.title})...`);
        const bpResponse = await fetch(`${baseUrl}/blueprints`, {
          method: 'POST',
          headers,
          body: JSON.stringify(bp)
        });

        if (bpResponse.ok) {
          console.log(`✅ Blueprint '${bp.identifier}' created successfully.`);
        } else if (bpResponse.status === 409) {
          console.log(`ℹ️ Blueprint '${bp.identifier}' already exists. Attempting to update...`);
          const updateResponse = await fetch(`${baseUrl}/blueprints/${bp.identifier}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(bp)
          });
          if (updateResponse.ok) {
            console.log(`✅ Blueprint '${bp.identifier}' updated successfully.`);
          } else {
            console.error(`❌ Failed to update blueprint '${bp.identifier}': ${await updateResponse.text()}`);
          }
        } else {
          console.error(`❌ Failed to create blueprint '${bp.identifier}': ${await bpResponse.text()}`);
        }
      }
    } else {
      console.warn(`⚠️ Warning: blueprints.json not found at ${blueprintsFile}`);
    }

    // 2. Load and create Actions
    const actionsFile = path.join(workspacePath, '.port/actions.json');
    if (fs.existsSync(actionsFile)) {
      console.log('\n⚙️ Creating self-service actions...');
      const actions = JSON.parse(fs.readFileSync(actionsFile, 'utf8'));

      for (const action of actions) {
        // Automatically inject user settings
        if (action.invocationMethod && action.invocationMethod.org === 'YOUR_GITHUB_ORG') {
          action.invocationMethod.org = 'jmariase';
        }
        if (action.invocationMethod && action.invocationMethod.repo === 'YOUR_GITHUB_REPO') {
          action.invocationMethod.repo = 'pwa';
        }

        console.log(`Sending action: ${action.identifier} (${action.title})...`);
        const actResponse = await fetch(`${baseUrl}/actions`, {
          method: 'POST',
          headers,
          body: JSON.stringify(action)
        });

        if (actResponse.ok) {
          console.log(`✅ Action '${action.identifier}' created successfully.`);
        } else if (actResponse.status === 409) {
          console.log(`ℹ️ Action '${action.identifier}' already exists. Attempting to update...`);
          const updateResponse = await fetch(`${baseUrl}/actions/${action.identifier}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(action)
          });
          if (updateResponse.ok) {
            console.log(`✅ Action '${action.identifier}' updated successfully.`);
          } else {
            console.error(`❌ Failed to update action '${action.identifier}': ${await updateResponse.text()}`);
          }
        } else {
          console.error(`❌ Failed to create action '${action.identifier}': ${await actResponse.text()}`);
        }
      }
    } else {
      console.warn(`⚠️ Warning: actions.json not found at ${actionsFile}`);
    }

    console.log('\n🎉 Port.io configuration script finished successfully!');

  } catch (error) {
    console.error('💥 An error occurred:', error.message);
  }
}

run();
