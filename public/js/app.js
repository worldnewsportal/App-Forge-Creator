// AppForge — Frontend JavaScript
const state = {
  files: [],
  codeFiles: [],
  currentBuildId: null,
  selectedAds: [],
  adNetworks: [],
  aiTask: 'generate',
  aiProvider: 'gemini'
};

// Navigation
function toggleMobileMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
}
function closeMobileMenu() {
  document.getElementById('mobileMenu').classList.remove('open');
}
function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

// Tabs
function switchTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelector(`[data-tab="${name}"]`)?.classList.add('active');
  document.getElementById(`tab-${name}`)?.classList.add('active');
}

// File Upload
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');

uploadZone?.addEventListener('click', () => fileInput?.click());
uploadZone?.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('dragover'); });
uploadZone?.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
uploadZone?.addEventListener('drop', e => {
  e.preventDefault();
  uploadZone.classList.remove('dragover');
  handleFiles(e.dataTransfer.files);
});
fileInput?.addEventListener('change', e => handleFiles(e.target.files));

function handleFiles(fileList) {
  Array.from(fileList).forEach(file => {
    if (!state.files.find(f => f.name === file.name)) {
      state.files.push(file);
    }
  });
  renderFileList();
  updateSummary();
}

function renderFileList() {
  const container = document.getElementById('fileList');
  if (!container) return;
  container.innerHTML = state.files.map((f, i) => `
    <div class="file-item">
      <div class="file-item-icon">${getFileIcon(f.name)}</div>
      <div class="file-item-info">
        <div class="file-item-name">${esc(f.name)}</div>
        <div class="file-item-size">${formatSize(f.size)}</div>
      </div>
      <button class="file-item-remove" onclick="removeFile(${i})">×</button>
    </div>
  `).join('');
}

function removeFile(i) {
  state.files.splice(i, 1);
  renderFileList();
  updateSummary();
}

function getFileIcon(name) {
  const ext = name.split('.').pop().toLowerCase();
  const icons = { html: '🌐', css: '🎨', js: '⚡', json: '📋', png: '🖼', jpg: '🖼', svg: '✨', md: '📝', txt: '📄', dart: '🎯' };
  return icons[ext] || '📄';
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

// Code Editor
function loadTemplate(type) {
  const templates = {
    landing: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>My App</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,sans-serif;background:linear-gradient(135deg,#0f0f1a,#1a1a2e);color:#fff;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:20px}
h1{font-size:2.5rem;margin-bottom:16px;background:linear-gradient(135deg,#6C63FF,#00BCD4);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
p{color:#b0b0b0;max-width:500px;line-height:1.7;margin-bottom:32px}
.btn{display:inline-block;padding:14px 32px;background:#6C63FF;color:#fff;border-radius:12px;font-weight:600;font-size:1rem;text-decoration:none;transition:all .2s}
.btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(108,99,255,.4)}
.features{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;max-width:800px;margin-top:48px;width:100%}
.feature{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:24px}
.feature h3{font-size:1.1rem;margin-bottom:8px}
.feature p{font-size:.9rem;color:#888}
</style>
</head>
<body>
<h1>Welcome to My App</h1>
<p>A beautiful landing page built with HTML and CSS. This will become a native Android app!</p>
<a href="#" class="btn">Get Started</a>
<div class="features">
<div class="feature"><h3>🚀 Fast</h3><p>Lightning-fast performance on any device</p></div>
<div class="feature"><h3>🎨 Beautiful</h3><p>Stunning design with modern aesthetics</p></div>
<div class="feature"><h3>🔒 Secure</h3><p>Your data is always protected</p></div>
</div>
</body>
</html>`,
    webapp: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Web App</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,sans-serif;background:#0f0f1a;color:#fff;min-height:100vh}
.app{display:flex;flex-direction:column;min-height:100vh}
.header{background:#1a1a2e;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.08)}
.header h1{font-size:1.2rem}
.main{flex:1;padding:20px}
.card{background:#16213e;border-radius:16px;padding:24px;margin-bottom:16px;border:1px solid rgba(255,255,255,.06)}
.card h2{font-size:1.1rem;margin-bottom:8px}
.card p{color:#888;font-size:.9rem}
.input{width:100%;padding:12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:8px;color:#fff;font-size:.95rem;margin-bottom:12px}
.btn{padding:12px 24px;background:#6C63FF;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer;width:100%}
.list{margin-top:16px}
.list-item{padding:12px;background:rgba(255,255,255,.03);border-radius:8px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between}
.nav{display:flex;background:#1a1a2e;border-top:1px solid rgba(255,255,255,.08)}
.nav-item{flex:1;text-align:center;padding:12px 8px;font-size:.75rem;color:#888}
.nav-item.active{color:#6C63FF}
</style>
</head>
<body>
<div class="app">
<div class="header"><h1>📝 Todo App</h1><span id="count">0 items</span></div>
<div class="main">
<div class="card">
<input class="input" id="todoInput" placeholder="Add a new task...">
<button class="btn" onclick="addTodo()">Add Task</button>
</div>
<div class="list" id="todoList"></div>
</div>
<div class="nav">
<div class="nav-item active">📋 All</div>
<div class="nav-item">✅ Done</div>
<div class="nav-item">⚙️ Settings</div>
</div>
</div>
<script>
const todos=[];
function addTodo(){const v=document.getElementById('todoInput').value.trim();if(!v)return;todos.push({text:v,done:false});document.getElementById('todoInput').value='';render();}
function toggle(i){todos[i].done=!todos[i].done;render();}
function remove(i){todos.splice(i,1);render();}
function render(){const l=document.getElementById('todoList');l.innerHTML=todos.map((t,i)=>'<div class="list-item"><span style="text-decoration:'+(t.done?'line-through':'none')+';opacity:'+(t.done?.5:1)+'">'+t.text+'</span><div><button onclick="toggle('+i+')" style="background:none;border:none;cursor:pointer;font-size:1.2rem">'+(t.done?'↩️':'✅')+'</button><button onclick="remove('+i+')" style="background:none;border:none;cursor:pointer;font-size:1.2rem">🗑️</button></div></div>').join('');document.getElementById('count').textContent=todos.length+' items';}
</script>
</body>
</html>`,
    game: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
<title>Game</title>
<style>
*{margin:0;padding:0}body{background:#0f0f1a;display:flex;justify-content:center;align-items:center;min-height:100vh;font-family:-apple-system,sans-serif;overflow:hidden}canvas{border-radius:12px;touch-action:none}
#ui{position:fixed;top:20px;left:20px;color:#fff;font-size:1.2rem;z-index:10}
#restart{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);padding:16px 32px;background:#6C63FF;color:#fff;border:none;border-radius:12px;font-size:1.1rem;font-weight:600;cursor:pointer;display:none;z-index:20}
</style>
</head>
<body>
<div id="ui">Score: <span id="score">0</span></div>
<canvas id="c"></canvas>
<button id="restart" onclick="restart()">Play Again</button>
<script>
const c=document.getElementById('c'),ctx=c.getContext('2d');
let W,H;function resize(){W=c.width=Math.min(window.innerWidth-20,400);H=c.height=Math.min(window.innerHeight-20,600);}resize();
let px,py,pyv,obs,sc,over,gr;
function restart(){px=W/2-20;py=H-80;pyv=0;obs=[];sc=0;over=false;gr=0.5;document.getElementById('restart').style.display='none';loop();}
function jump(){if(over)return;pyv=-10;}
document.addEventListener('keydown',e=>{if(e.code==='Space')jump();});
document.addEventListener('touchstart',jump);
function loop(){if(over)return;
ctx.fillStyle='#0f0f1a';ctx.fillRect(0,0,W,H);
pyv+=gr;py+=pyv;if(py>H-60){py=H-60;pyv=0;}
if(Math.random()<0.02){obs.push({x:W,w:30+Math.random()*40,h:40+Math.random()*80,y:H-60});}
for(let i=obs.length-1;i>=0;i--){obs[i].x-=4;if(obs[i].x+obs[i].w<0){obs.splice(i,1);sc++;document.getElementById('score').textContent=sc;}
ctx.fillStyle='#6C63FF';ctx.beginPath();ctx.roundRect(obs[i].x,obs[i].y-obs[i].h,obs[i].w,obs[i].h,8);ctx.fill();
if(px+40>obs[i].x&&px<obs[i].x+obs[i].w&&py+40>obs[i].y-obs[i].h){over=true;document.getElementById('restart').style.display='block';}}
ctx.fillStyle='#00BCD4';ctx.beginPath();ctx.roundRect(px,py,40,40,8);ctx.fill();
ctx.fillStyle='#4CAF50';ctx.fillRect(0,H-20,W,20);
requestAnimationFrame(loop);}
restart();
</script>
</body>
</html>`,
    form: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Contact Form</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:#0f0f1a;color:#fff;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
.form-container{background:#16213e;border-radius:20px;padding:40px;width:100%;max-width:480px;border:1px solid rgba(255,255,255,.08)}
h1{font-size:1.8rem;margin-bottom:8px;text-align:center}
.subtitle{color:#888;text-align:center;margin-bottom:32px;font-size:.9rem}
.field{margin-bottom:20px}
.field label{display:block;font-size:.85rem;font-weight:600;margin-bottom:6px;color:#b0b0b0}
.field input,.field textarea,.field select{width:100%;padding:12px 16px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:10px;color:#fff;font-size:.95rem;font-family:inherit}
.field textarea{min-height:120px;resize:vertical}
.field input:focus,.field textarea:focus{outline:none;border-color:#6C63FF}
.btn{width:100%;padding:14px;background:#6C63FF;color:#fff;border:none;border-radius:10px;font-size:1rem;font-weight:600;cursor:pointer;transition:all .2s}
.btn:hover{background:#5a52e0}
.success{display:none;text-align:center;padding:40px}
.success h2{color:#4CAF50;margin-bottom:8px}
</style>
</head>
<body>
<div class="form-container">
<div id="formSection">
<h1>📬 Contact Us</h1>
<p class="subtitle">We'd love to hear from you</p>
<div class="field"><label>Name</label><input type="text" placeholder="Your name"></div>
<div class="field"><label>Email</label><input type="email" placeholder="you@example.com"></div>
<div class="field"><label>Subject</label><select><option>General Inquiry</option><option>Support</option><option>Feedback</option></select></div>
<div class="field"><label>Message</label><textarea placeholder="Write your message..."></textarea></div>
<button class="btn" onclick="document.getElementById('formSection').style.display='none';document.getElementById('successSection').style.display='block'">Send Message</button>
</div>
<div id="successSection" class="success">
<h2>✅ Sent!</h2>
<p style="color:#888">Thank you for reaching out. We'll get back to you soon.</p>
</div>
</div>
</body>
</html>`,
    dashboard: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Dashboard</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:#0f0f1a;color:#fff;min-height:100vh}
.header{background:#1a1a2e;padding:16px 20px;border-bottom:1px solid rgba(255,255,255,.08);display:flex;align-items:center;justify-content:space-between}
.header h1{font-size:1.2rem}
.container{max-width:800px;margin:0 auto;padding:20px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;margin-bottom:24px}
.stat{background:#16213e;border-radius:16px;padding:20px;border:1px solid rgba(255,255,255,.06)}
.stat-value{font-size:2rem;font-weight:800;color:#6C63FF}
.stat-label{font-size:.8rem;color:#888;margin-top:4px}
.card{background:#16213e;border-radius:16px;padding:24px;border:1px solid rgba(255,255,255,.06);margin-bottom:16px}
.card h2{font-size:1.1rem;margin-bottom:16px}
.bar{display:flex;align-items:center;gap:12px;margin-bottom:12px}
.bar-label{width:80px;font-size:.85rem;color:#888}
.bar-track{flex:1;height:8px;background:rgba(255,255,255,.05);border-radius:4px;overflow:hidden}
.bar-fill{height:100%;border-radius:4px;transition:width .5s}
.activity{display:flex;gap:12px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.05)}
.activity:last-child{border:none}
.activity-dot{width:8px;height:8px;border-radius:50%;margin-top:6px;flex-shrink:0}
.activity-text{font-size:.9rem;color:#b0b0b0}
.activity-time{font-size:.75rem;color:#666}
</style>
</head>
<body>
<div class="header"><h1>📊 Dashboard</h1></div>
<div class="container">
<div class="stats">
<div class="stat"><div class="stat-value">2.4K</div><div class="stat-label">Users</div></div>
<div class="stat"><div class="stat-value" style="color:#4CAF50">$12.8K</div><div class="stat-label">Revenue</div></div>
<div class="stat"><div class="stat-value" style="color:#FF9800">847</div><div class="stat-label">Orders</div></div>
<div class="stat"><div class="stat-value" style="color:#E91E63">98%</div><div class="stat-label">Uptime</div></div>
</div>
<div class="card"><h2>📈 Performance</h2>
<div class="bar"><span class="bar-label">Sales</span><div class="bar-track"><div class="bar-fill" style="width:78%;background:#6C63FF"></div></div></div>
<div class="bar"><span class="bar-label">Traffic</span><div class="bar-track"><div class="bar-fill" style="width:92%;background:#4CAF50"></div></div></div>
<div class="bar"><span class="bar-label">Conversion</span><div class="bar-track"><div class="bar-fill" style="width:45%;background:#FF9800"></div></div></div>
</div>
<div class="card"><h2>🕐 Recent Activity</h2>
<div class="activity"><div class="activity-dot" style="background:#4CAF50"></div><div><div class="activity-text">New user registered</div><div class="activity-time">2 minutes ago</div></div></div>
<div class="activity"><div class="activity-dot" style="background:#6C63FF"></div><div><div class="activity-text">Order #1234 completed</div><div class="activity-time">15 minutes ago</div></div></div>
<div class="activity"><div class="activity-dot" style="background:#FF9800"></div><div><div class="activity-text">Server alert resolved</div><div class="activity-time">1 hour ago</div></div></div>
</div>
</div>
</body>
</html>`,
    blank: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>My App</title>
<style>
body{font-family:-apple-system,sans-serif;background:#0f0f1a;color:#fff;min-height:100vh;display:flex;align-items:center;justify-content:center}
</style>
</head>
<body>
<h1>Hello World!</h1>
</body>
</html>`
  };
  const editor = document.getElementById('codeEditor');
  if (templates[type] && editor) editor.value = templates[type];
}

function addCodeToProject() {
  const filename = document.getElementById('codeFilename').value || 'index.html';
  const content = document.getElementById('codeEditor').value;
  if (!content.trim()) return;

  const existing = state.codeFiles.findIndex(f => f.filename === filename);
  if (existing >= 0) state.codeFiles[existing].content = content;
  else state.codeFiles.push({ filename, content });

  renderCodeFiles();
  updateSummary();
}

function renderCodeFiles() {
  const container = document.getElementById('codeFilesList');
  if (!container) return;
  container.innerHTML = state.codeFiles.map((f, i) => `
    <div class="code-file-chip">
      ${getFileIcon(f.filename)} ${esc(f.filename)}
      <button onclick="removeCodeFile(${i})">×</button>
    </div>
  `).join('');
}

function removeCodeFile(i) {
  state.codeFiles.splice(i, 1);
  renderCodeFiles();
  updateSummary();
}

// AI
function setAiTask(task) {
  state.aiTask = task;
  document.querySelectorAll('.ai-task').forEach(t => t.classList.remove('active'));
  document.querySelector(`[data-task="${task}"]`)?.classList.add('active');
}

function updateAiProvider() {
  document.getElementById('radioGemini').classList.toggle('active',
    document.querySelector('[name="aiProvider"]:checked').value === 'gemini');
  document.getElementById('radioGroq').classList.toggle('active',
    document.querySelector('[name="aiProvider"]:checked').value === 'groq');
  state.aiProvider = document.querySelector('[name="aiProvider"]:checked').value;
}

async function sendAiRequest() {
  const prompt = document.getElementById('aiPrompt').value.trim();
  const apiKey = document.getElementById('aiApiKey').value.trim();
  if (!prompt) return;

  if (!apiKey) {
    addAiMessage('user', prompt);
    addAiMessage('system', '⚠️ Please enter your API key first. You can get a free Gemini API key from <a href="https://aistudio.google.com/apikey" target="_blank">Google AI Studio</a>.');
    return;
  }

  addAiMessage('user', prompt);
  document.getElementById('aiPrompt').value = '';
  const btn = document.getElementById('aiSendBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>';

  try {
    const code = state.codeFiles.length > 0 ? state.codeFiles[0].content : document.getElementById('codeEditor').value;
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        code,
        task: state.aiTask,
        buildId: state.currentBuildId,
        aiApiKey: apiKey,
        aiProvider: state.aiProvider
      })
    });
    const data = await res.json();
    if (data.success) {
      addAiMessage('system', `✅ ${state.aiTask === 'generate' ? 'Generated' : state.aiTask === 'debug' ? 'Debugged' : state.aiTask === 'enhance' ? 'Enhanced' : state.aiTask === 'signal' ? 'Analysis' : 'Converted'} successfully!`);
      if (data.code) {
        document.getElementById('codeEditor').value = data.code;
        if (data.filename) document.getElementById('codeFilename').value = data.filename;
      }
      if (data.analysis) addAiMessage('system', data.analysis);
    } else {
      addAiMessage('system', `❌ Error: ${data.error}`);
    }
  } catch (err) {
    addAiMessage('system', `❌ Request failed: ${err.message}`);
  }
  btn.disabled = false;
  btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>`;
}

function addAiMessage(role, content) {
  const container = document.getElementById('aiMessages');
  const div = document.createElement('div');
  div.className = `ai-msg ${role === 'user' ? 'ai-msg-user' : ''}`;
  div.innerHTML = `
    <span class="ai-avatar">${role === 'user' ? '👤' : '🤖'}</span>
    <div class="ai-msg-content">${content}</div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

// Ad Networks
async function loadAdNetworks() {
  try {
    const res = await fetch('/api/ads/networks');
    const data = await res.json();
    if (data.success) {
      state.adNetworks = data.networks;
      renderAdNetworks();
    }
  } catch (e) { console.error('Failed to load ad networks:', e); }
}

function renderAdNetworks() {
  const grid = document.getElementById('adsGrid');
  if (!grid) return;
  grid.innerHTML = state.adNetworks.map(n => `
    <div class="ad-network-card ${state.selectedAds.includes(n.id) ? 'selected' : ''}" onclick="toggleAdNetwork('${n.id}')">
      <div class="ad-network-icon">${n.icon}</div>
      <div class="ad-network-name">${n.name}</div>
      <div class="ad-network-desc">${n.description}</div>
      <div class="ad-network-types">${n.types.map(t => `<span class="ad-type-tag">${t}</span>`).join('')}</div>
    </div>
  `).join('');
}

function toggleAdNetwork(id) {
  const idx = state.selectedAds.indexOf(id);
  if (idx >= 0) state.selectedAds.splice(idx, 1);
  else state.selectedAds.push(id);
  renderAdNetworks();
  showAdConfig(id);
  updateSummary();
}

function showAdConfig(id) {
  const network = state.adNetworks.find(n => n.id === id);
  if (!network) return;
  const area = document.getElementById('adsConfigArea');
  area.style.display = 'block';
  document.getElementById('adsConfigTitle').textContent = `Configure ${network.name}`;
  document.getElementById('adsConfigFields').innerHTML = network.fields.map(f => `
    <div class="form-group">
      <label>${f.label} ${f.required ? '*' : ''}</label>
      <input type="text" class="input ad-field" data-network="${id}" data-field="${f.id}" placeholder="${f.placeholder}">
    </div>
  `).join('');
  document.getElementById('adsTypes').innerHTML = `
    <label style="font-size:.85rem;font-weight:600;color:var(--text2);margin-bottom:8px;display:block">Ad Types</label>
    <div class="permissions-grid">
      ${network.types.map(t => `
        <label class="checkbox-card">
          <input type="checkbox" value="${t}" checked class="ad-type-check" data-network="${id}">
          <span>${t}</span>
        </label>
      `).join('')}
    </div>
  `;
}

function saveAdConfig() {
  const area = document.getElementById('adsConfigArea');
  area.style.display = 'none';
}

// Build
async function buildApp() {
  const modal = document.getElementById('buildModal');
  const footer = document.getElementById('modalFooter');
  modal.classList.add('open');
  footer.style.display = 'none';
  resetBuildProgress();

  const appName = document.getElementById('appName').value || 'MyApp';
  const packageName = document.getElementById('packageName').value || `com.appforge.${Date.now()}`;
  const formData = new FormData();
  formData.append('appName', appName);
  formData.append('packageName', packageName);
  formData.append('versionName', document.getElementById('versionName').value || '1.0.0');
  formData.append('versionCode', document.getElementById('versionCode').value || '1');
  formData.append('minSdk', document.getElementById('minSdk').value);
  formData.append('targetSdk', document.getElementById('targetSdk').value);
  formData.append('developerName', document.getElementById('developerName').value);
  formData.append('appDescription', document.getElementById('appDescription').value);
  formData.append('appType', document.getElementById('appType').value);
  formData.append('aiApiKey', document.getElementById('aiApiKey').value);
  formData.append('aiProvider', state.aiProvider);

  // Permissions
  const perms = [];
  document.querySelectorAll('.permissions-grid input:checked').forEach(cb => {
    if (cb.value !== 'internet') perms.push(cb.value);
  });
  formData.append('permissions', JSON.stringify(perms));

  // Ad configs
  const ads = state.selectedAds.map(id => {
    const fields = {};
    document.querySelectorAll(`.ad-field[data-network="${id}"]`).forEach(inp => {
      fields[inp.dataset.field] = inp.value;
    });
    const types = [];
    document.querySelectorAll(`.ad-type-check[data-network="${id}"]:checked`).forEach(cb => {
      types.push(cb.value);
    });
    return { networkId: id, fields, types };
  });
  formData.append('ads', JSON.stringify(ads));

  // Files
  state.files.forEach(f => formData.append('files', f));

  // Code files
  if (state.codeFiles.length > 0) {
    formData.append('codeEntries', JSON.stringify(state.codeFiles));
  }

  try {
    updateBuildStep('collect', 'active');
    updateProgress(10);

    const res = await fetch('/api/pipeline', { method: 'POST', body: formData });

    updateBuildStep('collect', 'done');
    updateBuildStep('legal', 'active');
    updateProgress(30);

    await new Promise(r => setTimeout(r, 500));
    updateBuildStep('legal', 'done');
    updateBuildStep('ads', 'active');
    updateProgress(50);

    await new Promise(r => setTimeout(r, 500));
    updateBuildStep('ads', 'done');
    updateBuildStep('ai', 'active');
    updateProgress(65);

    await new Promise(r => setTimeout(r, 500));
    updateBuildStep('ai', 'done');
    updateBuildStep('flutter', 'active');
    updateProgress(80);

    const data = await res.json();

    updateBuildStep('flutter', 'done');
    updateBuildStep('package', 'active');
    updateProgress(95);

    await new Promise(r => setTimeout(r, 500));
    updateBuildStep('package', 'done');
    updateProgress(100);

    if (data.success) {
      state.currentBuildId = data.buildId;
      document.getElementById('modalTitle').textContent = '🎉 App Ready!';
      document.getElementById('downloadBtn').href = data.downloadUrl;
      footer.style.display = 'flex';
    } else {
      document.getElementById('modalTitle').textContent = '❌ Build Failed';
      addBuildError(data.error);
    }
  } catch (err) {
    document.getElementById('modalTitle').textContent = '❌ Build Failed';
    addBuildError(err.message);
  }
}

function resetBuildProgress() {
  document.getElementById('modalTitle').textContent = 'Building Your App...';
  document.querySelectorAll('.build-step').forEach(s => {
    s.classList.remove('done', 'active');
  });
  updateProgress(0);
}

function updateBuildStep(name, status) {
  const step = document.querySelector(`[data-step="${name}"]`);
  if (!step) return;
  step.classList.remove('done', 'active');
  if (status) step.classList.add(status);
}

function updateProgress(percent) {
  const circle = document.getElementById('progressCircle');
  const text = document.getElementById('progressPercent');
  if (circle) circle.style.strokeDashoffset = 283 - (283 * percent / 100);
  if (text) text.textContent = percent + '%';
}

function addBuildError(msg) {
  const body = document.getElementById('modalBody');
  body.innerHTML += `<div style="margin-top:16px;padding:16px;background:rgba(233,30,99,.1);border:1px solid rgba(233,30,99,.3);border-radius:12px;color:#E91E63;font-size:.9rem">${esc(msg)}</div>`;
}

function closeModal() {
  document.getElementById('buildModal').classList.remove('open');
}

async function showGithubInstructions() {
  if (!state.currentBuildId) return;
  try {
    const res = await fetch(`/api/github-action/${state.currentBuildId}`);
    const data = await res.json();
    if (data.success) {
      const body = document.getElementById('modalBody');
      body.innerHTML = `
        <div class="github-instructions">
          <h3 style="margin-bottom:12px">📋 GitHub Build Instructions</h3>
          <ol>
            ${data.instructions.map(i => `<li>${i}</li>`).join('')}
          </ol>
          <h3 style="margin:20px 0 12px">Workflow YAML</h3>
          <pre style="background:var(--bg);padding:16px;border-radius:12px;overflow-x:auto;font-size:.8rem;color:var(--text2)"><code>${esc(data.workflow)}</code></pre>
        </div>
      `;
    }
  } catch (e) {
    console.error(e);
  }
}

function updateSummary() {
  const totalFiles = state.files.length + state.codeFiles.length;
  document.getElementById('summaryFiles').textContent = `${totalFiles} file${totalFiles !== 1 ? 's' : ''}`;
  document.getElementById('summaryAds').textContent = `${state.selectedAds.length} ad network${state.selectedAds.length !== 1 ? 's' : ''}`;
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

// Auto-generate package name from app name
document.getElementById('appName')?.addEventListener('input', e => {
  const name = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '');
  const pkg = document.getElementById('packageName');
  if (pkg && !pkg.dataset.manual) {
    pkg.value = `com.appforge.${name}`;
  }
});
document.getElementById('packageName')?.addEventListener('input', e => {
  e.target.dataset.manual = 'true';
});

// Init
document.addEventListener('DOMContentLoaded', () => {
  loadAdNetworks();
  updateSummary();
  loadTemplate('landing');
});
