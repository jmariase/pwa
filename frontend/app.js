import { timeAgo } from "./utils.js";

// DOM References
const btnInstall = document.getElementById("btn-install");
const pwaStatus = document.getElementById("pwa-status");
const swState = document.getElementById("sw-state");
const syncTime = document.getElementById("sync-time");
const btnRunPipeline = document.getElementById("btn-run-pipeline");
const selectPipelineType = document.getElementById("select-pipeline-type");
const pipelineProgress = document.getElementById("pipeline-progress");
const pipelinePercentage = document.getElementById("pipeline-percentage");
const terminalBody = document.getElementById("terminal-body");
const portEntityList = document.getElementById("port-entity-list");

let deferredPrompt = null;
let lastSyncTimestamp = null;

// Portal Catalog State (Simulated)
const portalState = {
  microservices: [
    { id: "pwa-client-app", title: "Port PWA Core Client", language: "JavaScript", framework: "Vanilla JS" },
    { id: "pwa-backend-app", title: "Port PWA Backend API", language: "JavaScript", framework: "Express.js" }
  ],
  environments: [
    { id: "qa", title: "QA Environment", type: "staging" },
    { id: "prod", title: "Production Environment", type: "production" }
  ],
  deployments: [
    { id: "dep-client-qa", service: "pwa-client-app", env: "qa", replicas: 2, version: "1.0.0", status: "SUCCESS" },
    { id: "dep-backend-prod", service: "pwa-backend-app", env: "prod", replicas: 2, version: "1.0.0", status: "SUCCESS" }
  ]
};

// Initialize app features
document.addEventListener("DOMContentLoaded", () => {
  setupPWA();
  renderCatalog();
  setupPipelineSimulator();
  updateSyncTimeIndicator();
  setInterval(updateSyncTimeIndicator, 15000); // Update sync time readable state every 15s
});

/**
 * Render the simulated Developer Portal Catalog in the UI
 */
function renderCatalog() {
  if (!portEntityList) return;
  portEntityList.innerHTML = "";

  // 1. Render microservices header
  const msHeader = document.createElement("div");
  msHeader.className = "entity-item";
  msHeader.style.background = "rgba(129, 140, 248, 0.05)";
  msHeader.style.borderLeft = "3px solid var(--accent-primary)";
  msHeader.innerHTML = `<strong>📐 Blueprints: microservice (${portalState.microservices.length})</strong>`;
  portEntityList.appendChild(msHeader);

  portalState.microservices.forEach(ms => {
    const item = document.createElement("div");
    item.className = "entity-item";
    item.style.paddingLeft = "1.5rem";
    item.innerHTML = `
      <span>${ms.id} <span style="color:#64748b; font-size:0.75rem;">(${ms.language} - ${ms.framework})</span></span>
      <span class="entity-status registered">Registered</span>
    `;
    portEntityList.appendChild(item);
  });

  // 2. Render environments header
  const envHeader = document.createElement("div");
  envHeader.className = "entity-item";
  envHeader.style.background = "rgba(16, 185, 129, 0.05)";
  envHeader.style.borderLeft = "3px solid var(--color-success)";
  envHeader.innerHTML = `<strong>🌱 Blueprints: environment (${portalState.environments.length})</strong>`;
  portEntityList.appendChild(envHeader);

  portalState.environments.forEach(env => {
    const item = document.createElement("div");
    item.className = "entity-item";
    item.style.paddingLeft = "1.5rem";
    item.innerHTML = `
      <span>${env.id} <span style="color:#64748b; font-size:0.75rem;">(${env.type})</span></span>
      <span class="entity-status registered" style="color:var(--color-success); background:rgba(16,185,129,0.1); border-color:rgba(16,185,129,0.2);">Active</span>
    `;
    portEntityList.appendChild(item);
  });

  // 3. Render deployments header
  const depHeader = document.createElement("div");
  depHeader.className = "entity-item";
  depHeader.style.background = "rgba(236, 72, 153, 0.05)";
  depHeader.style.borderLeft = "3px solid var(--accent-secondary)";
  depHeader.innerHTML = `<strong>⚙️ Blueprints: deployment (${portalState.deployments.length})</strong>`;
  portEntityList.appendChild(depHeader);

  portalState.deployments.forEach(dep => {
    const item = document.createElement("div");
    item.className = "entity-item";
    item.style.paddingLeft = "1.5rem";
    item.innerHTML = `
      <div>
        <div style="font-weight: 500;">${dep.id} <span style="color:#64748b; font-size:0.75rem;">(${dep.version})</span></div>
        <div style="color:#94a3b8; font-size:0.75rem; margin-top: 0.1rem;">
          svc: <strong>${dep.service}</strong> | env: <strong>${dep.env}</strong> | pods: <strong>${dep.replicas}</strong>
        </div>
      </div>
      <span class="entity-status registered" style="color:var(--color-success); background:rgba(16,185,129,0.1); border-color:rgba(16,185,129,0.2);">${dep.status}</span>
    `;
    portEntityList.appendChild(item);
  });
}

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
 * Configure the interactive CI/CD pipeline simulator
 */
function setupPipelineSimulator() {
  btnRunPipeline.addEventListener("click", async () => {
    btnRunPipeline.disabled = true;
    selectPipelineType.disabled = true;
    terminalBody.innerHTML = ""; // Clear logs
    setProgress(0);

    const pipelineType = selectPipelineType.value;

    try {
      if (pipelineType === "scaffold") {
        await runScaffoldPipeline();
      } else if (pipelineType === "ci-cd") {
        await runCICDPipeline();
      } else if (pipelineType === "scale") {
        await runScalePipeline();
      } else if (pipelineType === "teardown") {
        await runTeardownPipeline();
      }

      lastSyncTimestamp = new Date();
      updateSyncTimeIndicator();
      animatePortCatalogCard();
    } catch (err) {
      writeTerminalLine("error", `❌ Pipeline crashed: ${err.message}`);
    } finally {
      btnRunPipeline.disabled = false;
      selectPipelineType.disabled = false;
    }
  });
}

/**
 * Action: Day 1 - Scaffold Microservice
 */
async function runScaffoldPipeline() {
  await runStep("INITIALIZATION", 15, [
    { type: "system-msg", text: "GitHub Workflow triggered by Port action: scaffold_microservice" },
    { type: "cmd", text: "uses: port-labs/port-github-action@v1" },
    { type: "info", text: "PATCH /v1/runs/run-9371/status -> IN_PROGRESS" },
    { type: "info", text: "logMessage: Initializing scaffolding for 'notification-service' (TypeScript/Express.js)..." },
    { type: "success", text: "✔ Port run status initialized successfully." }
  ]);

  await runStep("TEMPLATING", 50, [
    { type: "info", text: "Generating folder structure 'services/notification-service'..." },
    { type: "info", text: "Copying boilerplates and writing config files..." },
    { type: "info", text: "Generating services/notification-service/package.json" },
    { type: "info", text: "Generating services/notification-service/index.ts" },
    { type: "info", text: "Generating services/notification-service/Dockerfile" },
    { type: "success", text: "✔ Scaffolding template files created." }
  ]);

  await runStep("GIT COMMIT & PUSH", 75, [
    { type: "cmd", text: "git config user.name 'port-idp-bot'" },
    { type: "cmd", text: "git commit -m 'Scaffold microservice notification-service'" },
    { type: "info", text: "pushing branch 'feature/scaffold-notification-service' to origin..." },
    { type: "success", text: "✔ Pull Request automatically generated: #42" }
  ]);

  await runStep("PORT CATALOG REGISTRATION", 100, [
    { type: "cmd", text: "POST /v1/blueprints/microservice/entities" },
    { type: "info", text: "Upserting entity 'notification-service'..." },
    { type: "success", text: "✔ Entity 'notification-service' cataloged." },
    { type: "info", text: "PATCH /v1/runs/run-9371/status -> SUCCESS" },
    { type: "success", text: "🎉 SCAFFOLDING COMPLETE. Service created and registered in Port!" }
  ]);

  // Update dynamic catalog state
  const alreadyExists = portalState.microservices.some(ms => ms.id === "notification-service");
  if (!alreadyExists) {
    portalState.microservices.push({
      id: "notification-service",
      title: "Service: notification-service",
      language: "TypeScript",
      framework: "Express.js"
    });
    renderCatalog();
  }
}

/**
 * Action: Day 2 - CI/CD Deploy to QA/Prod
 */
async function runCICDPipeline() {
  await runStep("LINTING & QUALITY GATE", 20, [
    { type: "system-msg", text: "GitHub Workflow triggered by Port action: deploy_pwa (service=pwa-client-app, env=prod)" },
    { type: "info", text: "PATCH /v1/runs/run-1025/status -> IN_PROGRESS" },
    { type: "cmd", text: "npm run lint" },
    { type: "success", text: "✔ ESLint check passed. 0 warnings." },
    { type: "cmd", text: "sonar-scanner" },
    { type: "info", text: "Quality Gate Status: PASSED (Bugs: 0, Coverage: 100%)" }
  ]);

  await runStep("DOCKER BUILD & PUSH", 50, [
    { type: "cmd", text: "docker build -t ghcr.io/jmariase/pwa-frontend:3ec1a95 ." },
    { type: "info", text: "Pushing image to GitHub Container Registry (GHCR)..." },
    { type: "success", text: "✔ Image successfully pushed. Tag: 3ec1a95" }
  ]);

  await runStep("KUBERNETES ROLLOUT (PROD)", 80, [
    { type: "info", text: "Rendering deployment manifests for namespace 'prod'..." },
    { type: "cmd", text: "kubectl apply -f k8s/deployment_rendered.yaml -n prod" },
    { type: "info", text: "deployment.apps/pwa-app configured" },
    { type: "info", text: "kubectl rollout status deployment/pwa-app -n prod" },
    { type: "success", text: "✔ Rollout completed. 2 replica pods online." }
  ]);

  await runStep("PORT CATALOG UPDATE", 100, [
    { type: "cmd", text: "POST /v1/blueprints/deployment/entities" },
    { type: "info", text: "Upserting entity 'dep-client-prod' connected to service 'pwa-client-app' and env 'prod'..." },
    { type: "success", text: "✔ K8s Deployment registered in Port catalog." },
    { type: "info", text: "PATCH /v1/runs/run-1025/status -> SUCCESS" },
    { type: "success", text: "🎉 PIPELINE COMPLETE. Application deployed to Prod namespace and cataloged in Port!" }
  ]);

  // Update dynamic catalog state
  const alreadyExists = portalState.deployments.some(dep => dep.id === "dep-client-prod");
  if (!alreadyExists) {
    portalState.deployments.push({
      id: "dep-client-prod",
      service: "pwa-client-app",
      env: "prod",
      replicas: 2,
      version: "1.0.0",
      status: "SUCCESS"
    });
    renderCatalog();
  }
}

/**
 * Action: Day 2 - Scale Pods
 */
async function runScalePipeline() {
  await runStep("VERIFY TARGET DEPLOYMENT", 30, [
    { type: "system-msg", text: "GitHub Workflow triggered by Port action: scale_service (deployment=dep-client-qa, replicas=5)" },
    { type: "info", text: "PATCH /v1/runs/run-4482/status -> IN_PROGRESS" },
    { type: "info", text: "Fetching deployment specifications for 'dep-client-qa'..." },
    { type: "info", text: "Found deployment 'pwa-app' in namespace 'qa' currently running 2 replicas." }
  ]);

  await runStep("APPLY SCALE IN KUBERNETES", 70, [
    { type: "cmd", text: "kubectl scale deployment/pwa-app --replicas=5 -n qa" },
    { type: "info", text: "Waiting for replica scaling to complete..." },
    { type: "info", text: "Scaling: 2 -> 3 -> 4 -> 5 active pods." },
    { type: "success", text: "✔ Kubernetes scaling finished successfully. 5 pods ready." }
  ]);

  await runStep("PORT CATALOG UPDATE", 100, [
    { type: "cmd", text: "POST /v1/blueprints/deployment/entities" },
    { type: "info", text: "Updating entity 'dep-client-qa' with replicas=5..." },
    { type: "success", text: "✔ Entity 'dep-client-qa' replica count updated to 5 in Port." },
    { type: "info", text: "PATCH /v1/runs/run-4482/status -> SUCCESS" },
    { type: "success", text: "🎉 SCALING COMPLETE. Pod count adjusted successfully via Port self-service!" }
  ]);

  // Update dynamic catalog state
  const dep = portalState.deployments.find(d => d.id === "dep-client-qa");
  if (dep) {
    dep.replicas = 5;
    renderCatalog();
  }
}

/**
 * Action: Day 2 - Teardown Environment
 */
async function runTeardownPipeline() {
  await runStep("VERIFY TEARDOWN COMMAND", 25, [
    { type: "system-msg", text: "GitHub Workflow triggered by Port action: teardown_environment (env=prod, confirm=true)" },
    { type: "info", text: "PATCH /v1/runs/run-7711/status -> IN_PROGRESS" },
    { type: "warning", text: "⚠️ WARNING: Teardown request received for Environment 'prod'!" },
    { type: "info", text: "Teardown confirmed. Initializing destruction sequence..." }
  ]);

  await runStep("DESTROY K8S RESOURCES", 65, [
    { type: "cmd", text: "kubectl delete deployment --all -n prod" },
    { type: "info", text: "Deleting replica sets and active pods..." },
    { type: "cmd", text: "kubectl delete service --all -n prod" },
    { type: "cmd", text: "kubectl delete ingress --all -n prod" },
    { type: "success", text: "✔ Kubernetes resources deleted in namespace 'prod'." }
  ]);

  await runStep("PORT CATALOG CLEANUP", 100, [
    { type: "cmd", text: "DELETE /v1/blueprints/environment/entities/prod" },
    { type: "info", text: "Removing environment entity 'prod' and cascading associated deployments..." },
    { type: "success", text: "✔ Port developer portal catalog cleaned successfully." },
    { type: "info", text: "PATCH /v1/runs/run-7711/status -> SUCCESS" },
    { type: "success", text: "🎉 TEARDOWN COMPLETE. Environment 'prod' decommissioned successfully!" }
  ]);

  // Update dynamic catalog state
  portalState.environments = portalState.environments.filter(env => env.id !== "prod");
  portalState.deployments = portalState.deployments.filter(dep => dep.env !== "prod");
  renderCatalog();
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
