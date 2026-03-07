// ============================
// Enhanced Detox Page
// ============================
let focusActive = false;
let focusStartTime = null;
let focusInterval = null;
let focusElapsed = 0;
let focusDuration = 25 * 60; // default 25 min in seconds
let focusSound = 'none';
let focusAudio = null;
let blockedSites = ['facebook.com', 'youtube.com', 'instagram.com', 'twitter.com', 'tiktok.com'];
let studyResources = [];
let activeResourceIdx = 0;
let resourceTab = 'youtube';

// Web Audio API sound generators (no external URLs needed)
let audioCtx = null;
let audioNodes = [];

function createRainSound(ctx) {
  // Layer 1: Deep brown noise rumble (low-freq rain body)
  const bufSize = 2 * ctx.sampleRate;
  const brownBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const brownData = brownBuf.getChannelData(0);
  let lastOut = 0;
  for (let i = 0; i < bufSize; i++) {
    const w = Math.random() * 2 - 1;
    brownData[i] = (lastOut + 0.02 * w) / 1.02;
    lastOut = brownData[i];
    brownData[i] *= 3.5;
  }
  const brownSrc = ctx.createBufferSource();
  brownSrc.buffer = brownBuf;
  brownSrc.loop = true;
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 400;
  const brownGain = ctx.createGain();
  brownGain.gain.value = 0.5;
  brownSrc.connect(lowpass).connect(brownGain).connect(ctx.destination);
  brownSrc.start();

  // Layer 2: High-freq patter (raindrop crackle)
  const pinkBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const pinkData = pinkBuf.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < bufSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    pinkData[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    pinkData[i] *= 0.11;
    b6 = white * 0.115926;
  }
  const pinkSrc = ctx.createBufferSource();
  pinkSrc.buffer = pinkBuf;
  pinkSrc.loop = true;
  const bandpass = ctx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.value = 2500;
  bandpass.Q.value = 0.3;
  const pinkGain = ctx.createGain();
  pinkGain.gain.value = 0.35;
  pinkSrc.connect(bandpass).connect(pinkGain).connect(ctx.destination);
  pinkSrc.start();

  return [brownSrc, lowpass, brownGain, pinkSrc, bandpass, pinkGain];
}

function createWhiteNoiseSound(ctx) {
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  const gain = ctx.createGain();
  gain.gain.value = 0.15;
  source.connect(gain).connect(ctx.destination);
  source.start();
  return [source, gain];
}

function createLofiSound(ctx) {
  // Warm sine chord with slow vibrato
  const notes = [261.6, 329.6, 392.0]; // C4, E4, G4
  const nodes = [];
  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.12;
  masterGain.connect(ctx.destination);
  notes.forEach(freq => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.3 + Math.random() * 0.2;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 2;
    lfo.connect(lfoGain).connect(osc.frequency);
    const oscGain = ctx.createGain();
    oscGain.gain.value = 0.3;
    osc.connect(oscGain).connect(masterGain);
    osc.start();
    lfo.start();
    nodes.push(osc, lfo, lfoGain, oscGain);
  });
  nodes.push(masterGain);
  return nodes;
}

function startFocusSound(type) {
  stopFocusSound();
  if (type === 'none') return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (type === 'rain') audioNodes = createRainSound(audioCtx);
    else if (type === 'white') audioNodes = createWhiteNoiseSound(audioCtx);
    else if (type === 'lofi') audioNodes = createLofiSound(audioCtx);
  } catch (e) { console.warn('[Detox] Audio failed:', e); }
}

function stopFocusSound() {
  audioNodes.forEach(n => { try { n.stop ? n.stop() : n.disconnect(); } catch (e) { } });
  audioNodes = [];
  if (audioCtx) { try { audioCtx.close(); } catch (e) { } audioCtx = null; }
}

function getTreeStage() {
  const sessions = Storage.getFocusSessions();
  const totalMin = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  if (totalMin >= 600) return 5;
  if (totalMin >= 300) return 4;
  if (totalMin >= 120) return 3;
  if (totalMin >= 30) return 2;
  return 1;
}

function getTreeSVG(stage) {
  const colors = ['#1a4a1a', '#22662a', '#2d8a38', '#34d058', '#00ff88'];
  const c = colors[stage - 1];
  const sizes = [20, 28, 36, 44, 52];
  const s = sizes[stage - 1];
  return `
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <circle cx="60" cy="60" r="55" fill="${c}22" stroke="${c}" stroke-width="2"/>
      <polygon points="60,${65 - s} ${60 + s / 2},${65 + s / 4} ${60 - s / 2},${65 + s / 4}" fill="${c}" opacity="0.9"/>
      ${stage >= 2 ? `<polygon points="60,${55 - s} ${60 + s / 2 + 4},${55 + s / 4 + 4} ${60 - s / 2 - 4},${55 + s / 4 + 4}" fill="${c}" opacity="0.6"/>` : ''}
      ${stage >= 3 ? `<polygon points="60,${45 - s} ${60 + s / 2 + 8},${45 + s / 4 + 8} ${60 - s / 2 - 8},${45 + s / 4 + 8}" fill="${c}" opacity="0.4"/>` : ''}
      <rect x="57" y="${65 + s / 4}" width="6" height="16" rx="2" fill="#8B6914"/>
    </svg>`;
}

function renderDetox(container) {
  if (focusActive) {
    renderActiveFocus(container);
    return;
  }

  const stage = getTreeStage();
  const sessions = Storage.getFocusSessions();
  const totalMin = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const totalHrs = (totalMin / 60).toFixed(1);

  container.innerHTML = `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1>Detox</h1>
          <p class="page-desc">Lock in. Eliminate distractions. Grow your focus tree.</p>
        </div>
        <button class="btn-green focus-start-btn" onclick="showFocusSetup()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          START FOCUS
        </button>
      </div>

      <!-- Focus Setup Modal (hidden by default) -->
      <div class="glass-card focus-setup-card" id="focus-setup" style="display:none">
        <h3 style="color:var(--accent);margin-bottom:16px">⚡ Configure Focus Session</h3>
        
        <div class="focus-section">
          <label class="focus-label">FOCUS DURATION</label>
          <div class="duration-buttons">
            <button class="dur-btn active" onclick="setDuration(25, this)">25m</button>
            <button class="dur-btn" onclick="setDuration(50, this)">50m</button>
            <button class="dur-btn" onclick="setDuration(90, this)">90m</button>
            <div class="dur-custom">
              <input type="number" id="custom-dur" placeholder="Custom" min="1" max="240" 
                     onfocus="clearDurButtons()" onchange="setDuration(parseInt(this.value), null)">
              <span>min</span>
            </div>
          </div>
        </div>

        <div class="focus-section">
          <label class="focus-label">🎵 FOCUS SOUNDS</label>
          <div class="sound-buttons">
            <button class="sound-btn active" onclick="setSound('none', this)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
              NONE
            </button>
            <button class="sound-btn" onclick="setSound('rain', this)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"/><path d="M8 16l-2 3M12 18l-2 3M16 16l-2 3"/></svg>
              RAIN
            </button>
            <button class="sound-btn" onclick="setSound('white', this)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h2M6 8l1.5 8M10 5l1.5 14M14 8l1.5 8M18 3l1.5 18M22 12h-2"/></svg>
              WHITE
            </button>
            <button class="sound-btn" onclick="setSound('lofi', this)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="5.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="15.5" r="2.5"/><path d="M8 17V5l12-2v12"/></svg>
              LOFI
            </button>
          </div>
        </div>

        <div class="focus-section">
          <label class="focus-label">📚 STUDY RESOURCES</label>
          <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:8px">ADD MATERIALS TO VIEW DURING FOCUS</p>
          <div class="resource-tabs" id="resource-tabs">
            <button class="res-tab-btn ${resourceTab === 'youtube' ? 'active' : ''}" onclick="switchResourceTab('youtube')">▶ YouTube</button>
            <button class="res-tab-btn ${resourceTab === 'pdf' ? 'active' : ''}" onclick="switchResourceTab('pdf')">📄 PDF</button>
            <button class="res-tab-btn ${resourceTab === 'image' ? 'active' : ''}" onclick="switchResourceTab('image')">🖼 Image</button>
          </div>
          <div class="resource-form" id="resource-form">
            <input class="input-simple" id="res-title" placeholder="Resource title" style="margin-bottom:8px" />
            <div id="res-url-field">
              <input class="input-simple" id="res-url" placeholder="${resourceTab === 'youtube' ? 'YouTube URL' : resourceTab === 'pdf' ? 'PDF URL' : 'Image URL'}" style="margin-bottom:8px" />
            </div>
            ${resourceTab !== 'youtube' ? `
              <label class="upload-label" style="display:flex;align-items:center;gap:8px;cursor:pointer;color:var(--accent);font-size:0.8rem;margin-bottom:8px">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                Upload from device
                <input type="file" accept="${resourceTab === 'pdf' ? '.pdf' : 'image/*'}" onchange="handleResourceUpload(event)" style="display:none" />
              </label>
            ` : ''}
            <button class="btn-outline" style="width:100%" onclick="addStudyResource()">+ Add to Library</button>
          </div>
          ${studyResources.length > 0 ? `
            <div class="resource-list" style="margin-top:12px">
              ${studyResources.map((r, i) => `
                <div class="resource-item">
                  <span class="resource-type-badge">${r.type === 'youtube' ? '▶' : r.type === 'pdf' ? '📄' : '🖼'}</span>
                  <span style="flex:1;font-size:0.85rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.title}</span>
                  <button class="chip-x" onclick="removeStudyResource(${i})" style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:1rem">×</button>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <div class="focus-section">
          <label class="focus-label">🛡️ DISTRACTION GUARD</label>
          <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:8px">BLOCKED DOMAINS (REMINDERS)</p>
          <div class="blocked-sites" id="blocked-sites-list">
            ${blockedSites.map((s, i) => `
              <span class="blocked-chip">${s.toUpperCase()} <span class="chip-x" onclick="removeBlockedSite(${i})">×</span></span>
            `).join('')}
            <button class="add-site-btn" onclick="addBlockedSite()">+ ADD SITE</button>
          </div>
        </div>

        <div style="display:flex;gap:12px;margin-top:20px">
          <button class="btn-green" style="flex:1" onclick="startFocus()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            BEGIN SESSION
          </button>
          <button class="btn-outline" onclick="hideSetup()">CANCEL</button>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="detox-stats-row">
        <div class="glass-card detox-stat-card">
          <div class="detox-stat-value" style="color:var(--accent)">${sessions.length}</div>
          <div class="detox-stat-label">TOTAL SESSIONS</div>
        </div>
        <div class="glass-card detox-stat-card">
          <div class="detox-stat-value" style="color:#a855f7">${totalHrs}h</div>
          <div class="detox-stat-label">FOCUS TIME</div>
        </div>
        <div class="glass-card detox-stat-card">
          <div class="detox-stat-value" style="color:#f59e0b">${stage}/5</div>
          <div class="detox-stat-label">TREE STAGE</div>
        </div>
      </div>

      <!-- Focus Tree -->
      <div class="glass-card" style="text-align:center;padding:30px">
        <div class="focus-tree-display">
          ${getTreeSVG(stage)}
        </div>
        <div style="margin-top:12px">
          <span class="tree-stage-badge">STAGE ${stage}/5</span>
        </div>
        <p style="color:var(--text-muted);font-size:0.8rem;margin-top:8px">Keep focusing to grow your tree 🌳</p>
      </div>

      <!-- Focus History -->
      <div class="glass-card" style="margin-top:24px">
        <h3 style="margin-bottom:16px">📊 Recent Sessions</h3>
        ${renderFocusHistory()}
      </div>
    </div>
  `;
}

function renderActiveFocus(container) {
  const remaining = Math.max(0, focusDuration - focusElapsed);
  const m = String(Math.floor(remaining / 60)).padStart(2, '0');
  const s = String(remaining % 60).padStart(2, '0');
  const progress = focusDuration > 0 ? ((focusElapsed / focusDuration) * 100).toFixed(1) : 0;
  const stage = getTreeStage();

  container.innerHTML = `
    <div class="focus-active-view">
      <div class="focus-active-header">
        <div>
          <h2 style="color:var(--accent);margin:0">🛡️ Detox</h2>
          <p style="color:var(--text-muted);font-size:0.8rem;margin:0">DISTRACTIONS BLOCKED</p>
        </div>
        <div class="focus-active-timer">
          <span class="timer-min" id="focus-timer-min">${m}</span>
          <span class="timer-sep">:</span>
          <span class="timer-sec" id="focus-timer-sec">${s}</span>
        </div>
        <button class="btn-danger focus-exit-btn" onclick="stopFocus()">EXIT</button>
      </div>

      <div class="focus-active-body">
        <div class="focus-active-sidebar">
          <div style="text-align:center;padding:20px">
            ${getTreeSVG(stage)}
            <div style="margin-top:8px"><span class="tree-stage-badge">STAGE ${stage}/5</span></div>
            <p style="color:var(--text-muted);font-size:0.75rem;margin-top:6px">KEEP FOCUSING TO GROW YOUR TREE</p>
          </div>
        </div>

        <div class="focus-active-main">
          ${studyResources.length > 0 ? `
            <!-- Resource Tabs -->
            <div class="focus-resource-tabs">
              ${studyResources.map((r, i) => `
                <button class="focus-res-tab ${i === activeResourceIdx ? 'active' : ''}" onclick="switchActiveResource(${i})">
                  ${r.type === 'youtube' ? '▶' : r.type === 'pdf' ? '📄' : '🖼'} ${r.title}
                </button>
              `).join('')}
              <button class="focus-res-tab add-res-btn" onclick="quickAddResource()">+</button>
            </div>
            <!-- Resource Viewer -->
            <div class="focus-resource-viewer" id="resource-viewer">
              ${renderResourceViewer(studyResources[activeResourceIdx])}
            </div>
          ` : `
            <div class="focus-shield-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M9 12l2 2 4-4" stroke="var(--accent)" stroke-width="2"/>
              </svg>
            </div>
            <h2 style="color:var(--text-primary);margin:16px 0 8px">Deep Focus Active</h2>
            <p style="color:var(--text-muted);font-size:0.9rem">Stay focused. All distractions are blocked.</p>
          `}

          <div class="focus-active-stats">
            <div class="focus-active-stat-card">
              <div class="focus-active-stat-val" id="focus-level">${progress}%</div>
              <div class="focus-active-stat-lbl">FOCUS LEVEL</div>
            </div>
            <div class="focus-active-stat-card">
              <div class="focus-active-stat-val">${blockedSites.length}</div>
              <div class="focus-active-stat-lbl">SITES BLOCKED</div>
            </div>
          </div>

          <!-- Progress bar -->
          <div class="focus-progress-bar">
            <div class="focus-progress-fill" id="focus-progress-fill" style="width:${progress}%"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  if (!focusInterval) {
    focusInterval = setInterval(updateFocusCountdown, 1000);
  }
}

// Setup UI
function showFocusSetup() {
  document.getElementById('focus-setup').style.display = 'block';
}

function hideSetup() {
  document.getElementById('focus-setup').style.display = 'none';
}

function setDuration(mins, btn) {
  if (!mins || mins < 1) return;
  focusDuration = mins * 60;
  if (btn) {
    document.querySelectorAll('.dur-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const customInput = document.getElementById('custom-dur');
    if (customInput) customInput.value = '';
  }
}

function clearDurButtons() {
  document.querySelectorAll('.dur-btn').forEach(b => b.classList.remove('active'));
}

function setSound(sound, btn) {
  focusSound = sound;
  document.querySelectorAll('.sound-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

function removeBlockedSite(index) {
  blockedSites.splice(index, 1);
  const list = document.getElementById('blocked-sites-list');
  if (list) {
    list.innerHTML = blockedSites.map((s, i) => `
      <span class="blocked-chip">${s.toUpperCase()} <span class="chip-x" onclick="removeBlockedSite(${i})">×</span></span>
    `).join('') + '<button class="add-site-btn" onclick="addBlockedSite()">+ ADD SITE</button>';
  }
}

function addBlockedSite() {
  const site = prompt('Enter domain to block (e.g. reddit.com):');
  if (site && site.trim()) {
    blockedSites.push(site.trim().toLowerCase());
    navigateTo('detox');
    showFocusSetup();
  }
}

// Study Resources
function switchResourceTab(tab) {
  resourceTab = tab;
  navigateTo('detox');
  showFocusSetup();
}

function addStudyResource() {
  const title = document.getElementById('res-title');
  const url = document.getElementById('res-url');
  if (!title || !title.value.trim()) { alert('Please enter a title'); return; }
  if (!url || !url.value.trim()) { alert('Please enter a URL'); return; }

  let finalUrl = url.value.trim();
  // Convert YouTube watch URL to embed URL
  if (resourceTab === 'youtube') {
    const match = finalUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([a-zA-Z0-9_-]{11})/);
    if (match) finalUrl = 'https://www.youtube.com/embed/' + match[1];
  }

  studyResources.push({ type: resourceTab, title: title.value.trim(), url: finalUrl });
  title.value = '';
  url.value = '';
  navigateTo('detox');
  showFocusSetup();
}

function handleResourceUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const title = document.getElementById('res-title');
  if (title && !title.value.trim()) title.value = file.name;

  const reader = new FileReader();
  reader.onload = function (e) {
    const urlInput = document.getElementById('res-url');
    if (urlInput) urlInput.value = e.target.result;
  };
  reader.readAsDataURL(file);
}

function removeStudyResource(i) {
  studyResources.splice(i, 1);
  if (activeResourceIdx >= studyResources.length) activeResourceIdx = Math.max(0, studyResources.length - 1);
  navigateTo('detox');
  if (!focusActive) showFocusSetup();
}

function switchActiveResource(i) {
  activeResourceIdx = i;
  const viewer = document.getElementById('resource-viewer');
  if (viewer && studyResources[i]) {
    viewer.innerHTML = renderResourceViewer(studyResources[i]);
  }
  document.querySelectorAll('.focus-res-tab').forEach((t, idx) => {
    t.classList.toggle('active', idx === i);
  });
}

function renderResourceViewer(resource) {
  if (!resource) return '<p style="color:var(--text-muted);text-align:center">No resource selected</p>';

  if (resource.type === 'youtube') {
    var idMatch = resource.url.match(/embed\/([a-zA-Z0-9_-]{11})/);
    var videoId = idMatch ? idMatch[1] : '';
    var watchUrl = videoId ? 'https://www.youtube.com/watch?v=' + videoId : resource.url;
    var thumbUrl = videoId ? 'https://img.youtube.com/vi/' + videoId + '/maxresdefault.jpg' : '';
    var thumbFallback = videoId ? 'https://img.youtube.com/vi/' + videoId + '/hqdefault.jpg' : '';

    // Use iframe on http/https, clickable card on file://
    if (window.location.protocol === 'file:') {
      return '<a href="' + watchUrl + '" target="_blank" rel="noopener" style="display:block;position:relative;width:100%;height:100%;background:#000;border-radius:8px;overflow:hidden;text-decoration:none">'
        + (thumbUrl ? '<img src="' + thumbUrl + '" onerror="this.src=\'' + thumbFallback + '\'" style="width:100%;height:100%;object-fit:cover;opacity:0.85" />' : '')
        + '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,0.25)">'
        + '<div style="width:72px;height:50px;background:#ff0000;border-radius:14px;display:flex;align-items:center;justify-content:center"><svg width="28" height="28" viewBox="0 0 24 24" fill="white"><polygon points="9 6 18 12 9 18"/></svg></div>'
        + '<span style="color:#fff;font-size:0.9rem;margin-top:14px;font-weight:600">' + resource.title + '</span>'
        + '<span style="color:rgba(255,255,255,0.5);font-size:0.7rem;margin-top:4px">Tap to watch on YouTube</span>'
        + '</div></a>';
    }
    return '<iframe src="' + resource.url + '" style="width:100%;height:100%;border:none;border-radius:8px" allowfullscreen></iframe>';

  } else if (resource.type === 'pdf') {
    return '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:16px;padding:20px">'
      + '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>'
      + '<h3 style="color:var(--text-primary);margin:0">' + resource.title + '</h3>'
      + '<button onclick="window.open(\'' + resource.url.replace(/'/g, "\\'") + '\',\'_blank\')" style="padding:14px 36px;background:var(--accent);color:#000;border:none;border-radius:8px;font-family:inherit;font-weight:700;font-size:0.95rem;cursor:pointer;display:flex;align-items:center;gap:10px">'
      + '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>'
      + 'Open PDF</button>'
      + '<p style="color:var(--text-muted);font-size:0.75rem;margin:0">Opens in a new browser tab</p>'
      + '</div>';

  } else {
    return '<div style="display:flex;align-items:center;justify-content:center;height:100%;padding:12px">'
      + '<img src="' + resource.url + '" alt="' + resource.title + '" style="max-width:100%;max-height:100%;object-fit:contain;border-radius:8px" />'
      + '</div>';
  }
}

function quickAddResource() {
  const url = prompt('Paste YouTube, PDF, or Image URL:');
  if (!url || !url.trim()) return;
  const title = prompt('Give it a title:') || 'Untitled';
  let type = 'image';
  if (url.includes('youtube.com') || url.includes('youtu.be')) type = 'youtube';
  else if (url.endsWith('.pdf')) type = 'pdf';

  let finalUrl = url.trim();
  if (type === 'youtube') {
    const match = finalUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([a-zA-Z0-9_-]{11})/);
    if (match) finalUrl = 'https://www.youtube.com/embed/' + match[1];
  }
  studyResources.push({ type, title: title.trim(), url: finalUrl });
  activeResourceIdx = studyResources.length - 1;
  navigateTo('detox');
}

// Focus Session Control
function startFocus() {
  focusActive = true;
  focusStartTime = Date.now();
  focusElapsed = 0;

  // Play sound via Web Audio API
  startFocusSound(focusSound);

  navigateTo('detox');
}

function stopFocus() {
  focusActive = false;
  clearInterval(focusInterval);
  focusInterval = null;

  stopFocusSound();

  const duration = Math.floor((Date.now() - focusStartTime) / 60000);
  if (duration > 0) {
    Storage.addFocusSession({ date: new Date().toISOString(), duration });
    Storage.addXP(Math.max(5, duration));
  }

  focusStartTime = null;
  focusElapsed = 0;
  navigateTo('detox');
}

// Keep the old toggleFocus for compatibility
function toggleFocus() {
  if (focusActive) {
    stopFocus();
  } else {
    showFocusSetup();
  }
}

function updateFocusCountdown() {
  if (!focusActive || !focusStartTime) return;
  focusElapsed = Math.floor((Date.now() - focusStartTime) / 1000);

  const remaining = Math.max(0, focusDuration - focusElapsed);
  const m = String(Math.floor(remaining / 60)).padStart(2, '0');
  const s = String(remaining % 60).padStart(2, '0');
  const progress = focusDuration > 0 ? ((focusElapsed / focusDuration) * 100).toFixed(1) : 0;

  const minEl = document.getElementById('focus-timer-min');
  const secEl = document.getElementById('focus-timer-sec');
  const levelEl = document.getElementById('focus-level');
  const fillEl = document.getElementById('focus-progress-fill');

  if (minEl) minEl.textContent = m;
  if (secEl) secEl.textContent = s;
  if (levelEl) levelEl.textContent = Math.min(100, progress) + '%';
  if (fillEl) fillEl.style.width = Math.min(100, progress) + '%';

  // Session complete
  if (remaining <= 0) {
    stopFocus();
    alert('🎉 Focus session complete! Great work!');
  }
}

function renderFocusHistory() {
  const sessions = Storage.getFocusSessions().slice().reverse().slice(0, 10);
  if (sessions.length === 0) {
    return '<p style="color:var(--text-muted);font-size:0.9rem">No focus sessions yet. Start your first one!</p>';
  }
  return sessions.map(s => `
    <div class="focus-history-row">
      <span style="color:var(--text-secondary)">${formatDate(s.date)}</span>
      <span class="focus-duration-badge">${s.duration} min</span>
    </div>
  `).join('');
}
