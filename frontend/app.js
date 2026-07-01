import { calculateScore, timeAgo } from "./utils.js";

// DOM References
const btnInstall = document.getElementById("btn-install");
const pwaStatus = document.getElementById("pwa-status");
const swState = document.getElementById("sw-state");
const syncTime = document.getElementById("sync-time");
const btnRunPipeline = document.getElementById("btn-run-pipeline");
const pipelineProgress = document.getElementById("pipeline-progress");
const pipelinePercentage = document.getElementById("pipeline-percentage");
const terminalBody = document.getElementById("terminal-body");

let deferredPrompt = null;
let lastSyncTimestamp = null;

// Initialize app features
document.addEventListener("DOMContentLoaded", () => {
  setupPWA();
  setupPipelineSimulator();
  updateSyncTimeIndicator();
  setInterval(updateSyncTimeIndicator, 15000); // Update sync time readable state every 15s
});

/**
 * Configure PWA installation events and Service Worker integration
 */
function setupPWA() {
  // Service Worker registration
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js")
        .then((reg) => {
          console.log("ServiceWorker registered successfully with scope: ", reg.scope);
          
          // Update UI badge
          pwaStatus.classList.remove("offline-badge");
          pwaStatus.classList.add("online-badge");
          pwaStatus.querySelector(".status-text").textContent = "PWA Active";
          swState.textContent = "Active (Offline Ready)";
          swState.className = "value text-success";
        })
        .catch((err) => {
          console.error("ServiceWorker registration failed: ", err);
          pwaStatus.querySelector(".status-text").textContent = "SW Error";
          swState.textContent = "Error";
          swState.className = "value text-danger";
        });
    });
  } else {
    pwaStatus.querySelector(".status-text").textContent = "Unsupported";
    swState.textContent = "Unsupported by Browser";
    swState.className = "value text-warning";
  }

  // Handle Install Prompt
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    btnInstall.style.display = "inline-flex";
  });

  btnInstall.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    deferredPrompt = null;
    btnInstall.style.display = "none";
  });

  window.addEventListener("appinstalled", () => {
    console.log("PWA was installed successfully!");
    btnInstall.style.display = "none";
  });
}

/**
 * Update the relative time ago representation for the Port synchronization state
 */
function updateSyncTimeIndicator() {
  if (lastSyncTimestamp) {
    syncTime.textContent = timeAgo(lastSyncTimestamp);
  } else {
    syncTime.textContent = "Never";
  }
}

/**
 * Configure the interactive CI/CD simulator
 */
function setupPipelineSimulator() {
  btnRunPipeline.addEventListener("click", async () => {
    btnRunPipeline.disabled = true;
    terminalBody.innerHTML = ""; // Clear logs
    setProgress(0);

    try {
      await runStep("LINTING", 15, [
        { type: "cmd", text: "npm run lint" },
        { type: "info", text: "eslint . --max-warnings=0" },
        { type: "info", text: "Scanning source files: index.html, index.css, app.js, sw.js, utils.js..." },
        { type: "success", text: "✔ Clean. 0 errors, 0 warnings found." }
      ]);

      await runStep("TESTING", 40, [
        { type: "cmd", text: "npm test" },
        { type: "info", text: "node --experimental-vm-modules node_modules/jest/bin/jest.js --coverage" },
        { type: "info", text: "PASS  ./app.test.js\n  Utility functions test suite\n    formatBytes\n      ✓ should format 0 bytes correctly (2 ms)\n      ✓ should format KB correctly\n      ✓ should format MB correctly\n      ✓ should handle decimal formatting (1 ms)\n    timeAgo\n      ✓ should format recent event as just now\n      ✓ should format minutes elapsed (1 ms)\n      ✓ should format hours elapsed\n      ✓ should format days elapsed\n    calculateScore\n      ✓ should return 100 with zero issues\n      ✓ should apply penalties for bugs and issues\n      ✓ should not drop below 0" },
        { type: "info", text: "--------------|---------|----------|---------|---------|-------------------" },
        { type: "info", text: "File          | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s " },
        { type: "info", text: "--------------|---------|----------|---------|---------|-------------------" },
        { type: "info", text: "All files     |     100 |      100 |     100 |     100 |                   " },
        { type: "info", text: " utils.js     |     100 |      100 |     100 |     100 |                   " },
        { type: "info", text: "--------------|---------|----------|---------|---------|-------------------" },
        { type: "success", text: "Test Suites: 1 passed, 1 total\nTests:       11 passed, 11 total\nSnapshots:   0 total\nTime:        0.842 s" },
        { type: "success", text: "✔ Coverage generated successfully at coverage/lcov.info." }
      ]);

      await runStep("SONARQUBE SCAN", 65, [
        { type: "cmd", text: "sonar-scanner" },
        { type: "info", text: "INFO: Scanner configuration file: /etc/sonar-scanner.properties" },
        { type: "info", text: "INFO: Project key: port-io-pwa-flow" },
        { type: "info", text: "INFO: Base dir: /home/runner/work/pwa/pwa" },
        { type: "info", text: "INFO: Load project repositories (done) | time=85ms" },
        { type: "info", text: "INFO: Indexing files..." },
        { type: "info", text: "INFO: 5 files indexed" },
        { type: "info", text: "INFO: Quality profile for js: Sonar way" },
        { type: "info", text: "INFO: Sensor JavaScript analysis [javascript] (done) | time=1045ms" },
        { type: "info", text: "INFO: Sensor HTML [html] (done) | time=150ms" },
        { type: "info", text: "INFO: Sensor CSS [css] (done) | time=90ms" },
        { type: "info", text: "INFO: Import coverage report from: coverage/lcov.info (done)" },
        { type: "info", text: "INFO: Analysis report generated successfully." },
        { type: "info", text: "INFO: Analysis success. Uploading payload to server..." },
        { type: "info", text: "INFO: Quality Gate Status: PASSED (Bugs: 0, Vulnerabilities: 0, Coverage: 100%)" },
        { type: "success", text: `✔ Calculated SonarQube score: ${calculateScore(0, 0, 0)}/100` }
      ]);

      await runStep("PORT CATALOG UPDATE", 85, [
        { type: "cmd", text: "uses: port-labs/port-github-action@v1" },
        { type: "info", text: "Syncing DevOps catalog entities to https://api.port.io ..." },
        { type: "info", text: "POST /v1/blueprints/microservice/entities" },
        { type: "info", text: "Payload:\n{\n  \"identifier\": \"pwa-client-app\",\n  \"title\": \"Port PWA Core Client\",\n  \"blueprint\": \"microservice\",\n  \"properties\": {\n    \"language\": \"JavaScript\",\n    \"framework\": \"Vanilla\",\n    \"qualityGate\": \"PASSED\",\n    \"bugs\": 0,\n    \"coverage\": 100\n  }\n}" },
        { type: "success", text: "✔ Entity 'pwa-client-app' upserted successfully in Port." }
      ]);

      await runStep("KUBERNETES ROLLOUT & DEPLOY", 100, [
        { type: "info", text: "docker build -t ghcr.io/jmariase/pwa-app:latest ." },
        { type: "info", text: "docker push ghcr.io/jmariase/pwa-app:latest (done)" },
        { type: "info", text: "kubectl apply -f k8s/ -n production" },
        { type: "info", text: "deployment.apps/pwa-app configured\nservice/pwa-service configured\ningress.networking.k8s.io/pwa-ingress configured" },
        { type: "info", text: "kubectl rollout status deployment/pwa-app -n production" },
        { type: "success", text: "✔ Rollout successfully finished. 2 replica pods online." },
        { type: "info", text: "POST /v1/blueprints/deployment/entities" },
        { type: "info", text: "Payload:\n{\n  \"identifier\": \"dep-run-1025\",\n  \"title\": \"K8s Deployment #1025\",\n  \"blueprint\": \"deployment\",\n  \"properties\": {\n    \"status\": \"SUCCESS\",\n    \"version\": \"1.0.0\",\n    \"namespace\": \"production\",\n    \"replicas\": 2,\n    \"imageTag\": \"3ec1a95\",\n    \"cluster\": \"k8s-production-cluster\"\n  },\n  \"relations\": {\n    \"microservice\": \"pwa-client-app\",\n    \"environment\": \"production-env\"\n  }\n}" },
        { type: "success", text: "✔ K8s Deployment registered in Port catalog." },
        { type: "success", text: "🎉 PIPELINE COMPLETE. PWA container built, passed SonarQube quality gate, cataloged in Port.io and successfully rolled out to K8s!" }
      ]);

      lastSyncTimestamp = new Date();
      updateSyncTimeIndicator();
      animatePortCatalogCard();
    } catch (err) {
      writeTerminalLine("error", `❌ Pipeline crashed: ${err.message}`);
    } finally {
      btnRunPipeline.disabled = false;
    }
  });
}

/**
 * Runs a single step of the pipeline simulation
 * @param {string} stepName The name of the pipeline step
 * @param {number} targetPercentage The target percentage in the progress bar
 * @param {Array<{type: string, text: string}>} lines Array of log strings to write
 */
async function runStep(stepName, targetPercentage, lines) {
  writeTerminalLine("system-msg", `\n--- STARTING STEP: ${stepName} ---`);
  await sleep(400);

  for (const line of lines) {
    writeTerminalLine(line.type, line.text);
    await sleep(Math.random() * 200 + 100); // Simulate network latency/processing speed
  }

  setProgress(targetPercentage);
}

/**
 * Writes a log line into the terminal emulator body
 * @param {string} type Line formatting type
 * @param {string} text Text to write
 */
function writeTerminalLine(type, text) {
  const lineDiv = document.createElement("div");
  lineDiv.className = `terminal-line ${type}`;
  lineDiv.textContent = text;
  terminalBody.appendChild(lineDiv);
  terminalBody.scrollTop = terminalBody.scrollHeight; // Scroll to bottom
}

/**
 * Utility helper to set the progress bar values
 * @param {number} percentage Progress percent (0 - 100)
 */
function setProgress(percentage) {
  pipelineProgress.style.width = `${percentage}%`;
  pipelinePercentage.textContent = `${percentage}%`;
}

/**
 * Utility helper to sleep for ms duration
 * @param {number} ms Milliseconds to sleep
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Animates the Port catalog card briefly to indicate data updates
 */
function animatePortCatalogCard() {
  const card = document.getElementById("card-port");
  card.style.borderColor = "var(--accent-secondary)";
  card.style.transform = "scale(1.02)";
  
  setTimeout(() => {
    card.style.borderColor = "";
    card.style.transform = "";
  }, 1000);
}
