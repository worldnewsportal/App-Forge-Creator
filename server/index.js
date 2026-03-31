require('dotenv').config();
const express = require('express');
const multer = require('multer');
const archiver = require('archiver');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const FlutterGenerator = require('./flutter-generator');
const AIEngine = require('./ai-engine');
const AdNetworkManager = require('./ad-networks');
const LegalGenerator = require('./legal-generator');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

const upload = multer({
  dest: '/tmp/appforge-uploads/',
  limits: { fileSize: 100 * 1024 * 1024 }
});

const builds = new Map();

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Upload files
app.post('/api/upload', upload.array('files', 50), (req, res) => {
  const buildId = uuidv4();
  const buildDir = path.join('/tmp', 'appforge-builds', buildId);
  fs.mkdirSync(buildDir, { recursive: true });

  const files = [];
  if (req.files) {
    req.files.forEach(f => {
      const dest = path.join(buildDir, f.originalname);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.renameSync(f.path, dest);
      files.push({ name: f.originalname, path: dest, size: f.size });
    });
  }

  builds.set(buildId, { id: buildId, dir: buildDir, files, status: 'uploaded', createdAt: Date.now() });
  res.json({ success: true, buildId, files: files.map(f => ({ name: f.name, size: f.size })) });
});

// Write code directly
app.post('/api/code', (req, res) => {
  const { filename, content, buildId: existingId } = req.body;
  const buildId = existingId || uuidv4();
  const buildDir = existingId && builds.has(existingId)
    ? builds.get(existingId).dir
    : path.join('/tmp', 'appforge-builds', buildId);

  fs.mkdirSync(buildDir, { recursive: true });
  const filePath = path.join(buildDir, filename || 'index.html');
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);

  if (!builds.has(buildId)) {
    builds.set(buildId, { id: buildId, dir: buildDir, files: [], status: 'code-written', createdAt: Date.now() });
  }
  const build = builds.get(buildId);
  if (!build.files.find(f => f.name === (filename || 'index.html'))) {
    build.files.push({ name: filename || 'index.html', path: filePath });
  }

  res.json({ success: true, buildId });
});

// AI code generation / debug
app.post('/api/ai/generate', async (req, res) => {
  try {
    const { prompt, code, task, buildId } = req.body;
    const ai = new AIEngine();
    let result;

    switch (task) {
      case 'generate':
        result = await ai.generateCode(prompt);
        break;
      case 'debug':
        result = await ai.debugCode(code, prompt);
        break;
      case 'convert':
        result = await ai.convertToFlutter(code, prompt);
        break;
      case 'enhance':
        result = await ai.enhanceCode(code, prompt);
        break;
      case 'signal':
        result = await ai.signalAnalysis(code);
        break;
      default:
        result = await ai.generateCode(prompt);
    }

    if (buildId && builds.has(buildId)) {
      const build = builds.get(buildId);
      const outPath = path.join(build.dir, result.filename || 'generated.html');
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, result.code);
      build.files.push({ name: result.filename || 'generated.html', path: outPath });
    }

    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get ad networks info
app.get('/api/ads/networks', (req, res) => {
  const mgr = new AdNetworkManager();
  res.json({ success: true, networks: mgr.getNetworks() });
});

// Configure ads for build
app.post('/api/ads/configure', async (req, res) => {
  try {
    const { buildId, ads } = req.body;
    if (!builds.has(buildId)) return res.status(404).json({ error: 'Build not found' });

    const mgr = new AdNetworkManager();
    const adConfig = mgr.configureAds(ads);
    const build = builds.get(buildId);
    build.ads = adConfig;

    // Generate ad integration code
    const adCode = mgr.generateAdCode(adConfig);
    const adPath = path.join(build.dir, 'lib', 'ads', 'ad_manager.dart');
    fs.mkdirSync(path.dirname(adPath), { recursive: true });
    fs.writeFileSync(adPath, adCode);

    res.json({ success: true, adConfig });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Generate legal pages
app.post('/api/legal/generate', async (req, res) => {
  try {
    const { buildId, appName, appDescription, developerName, appType } = req.body;
    if (!builds.has(buildId)) return res.status(404).json({ error: 'Build not found' });

    const legal = new LegalGenerator();
    const pages = legal.generateAll({
      appName: appName || 'My App',
      appDescription: appDescription || 'A mobile application',
      developerName: developerName || 'Developer',
      appType: appType || 'general'
    });

    const build = builds.get(buildId);
    build.legal = pages;

    Object.entries(pages).forEach(([name, content]) => {
      const filePath = path.join(build.dir, 'assets', 'legal', `${name}.html`);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, content);
    });

    res.json({ success: true, pages: Object.keys(pages) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Generate Flutter project and build APK
app.post('/api/build', async (req, res) => {
  try {
    const { buildId, appName, packageName, versionName, versionCode, minSdk, targetSdk, permissions } = req.body;
    if (!builds.has(buildId)) return res.status(404).json({ error: 'Build not found' });

    const build = builds.get(buildId);
    build.status = 'building';
    build.config = {
      appName: appName || 'MyApp',
      packageName: packageName || `com.appforge.${buildId.slice(0, 8)}`,
      versionName: versionName || '1.0.0',
      versionCode: versionCode || 1,
      minSdk: minSdk || 21,
      targetSdk: targetSdk || 34,
      permissions: permissions || []
    };

    const generator = new FlutterGenerator(build.dir, build.config);
    await generator.generateProject(build.files, build.ads, build.legal);

    build.status = 'flutter-generated';

    // Create downloadable ZIP
    const zipPath = `/tmp/appforge-builds/${buildId}-flutter.zip`;
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    await new Promise((resolve, reject) => {
      output.on('close', resolve);
      archive.on('error', reject);
      archive.pipe(output);
      archive.directory(path.join(build.dir, 'flutter_app'), false);
      archive.finalize();
    });

    build.zipPath = zipPath;
    build.status = 'ready';

    res.json({
      success: true,
      buildId,
      status: 'ready',
      downloadUrl: `/api/download/${buildId}`,
      githubActionUrl: `/api/github-action/${buildId}`,
      config: build.config
    });
  } catch (err) {
    console.error('Build error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Download Flutter project ZIP
app.get('/api/download/:buildId', (req, res) => {
  const { buildId } = req.params;
  if (!builds.has(buildId)) return res.status(404).json({ error: 'Build not found' });

  const build = builds.get(buildId);
  if (!build.zipPath || !fs.existsSync(build.zipPath)) {
    return res.status(404).json({ error: 'Build not ready' });
  }

  res.download(build.zipPath, `${build.config?.appName || 'app'}-flutter.zip`);
});

// Generate GitHub Actions workflow
app.get('/api/github-action/:buildId', (req, res) => {
  const { buildId } = req.params;
  if (!builds.has(buildId)) return res.status(404).json({ error: 'Build not found' });

  const build = builds.get(buildId);
  const workflowDir = path.join(build.dir, 'flutter_app', '.github', 'workflows');
  fs.mkdirSync(workflowDir, { recursive: true });

  const workflow = generateGitHubWorkflow(build.config);
  const workflowPath = path.join(workflowDir, 'build-apk.yml');
  fs.writeFileSync(workflowPath, workflow);

  res.json({
    success: true,
    workflow: workflow,
    instructions: [
      '1. Extract the downloaded ZIP file',
      '2. Create a new GitHub repository',
      '3. Push all files to the repository',
      '4. Go to Actions tab — the build will start automatically',
      '5. Download APK/AAB from the Artifacts section'
    ]
  });
});

// Full pipeline: upload → AI enhance → generate legal → configure ads → build Flutter
app.post('/api/pipeline', upload.array('files', 50), async (req, res) => {
  try {
    const buildId = uuidv4();
    const buildDir = path.join('/tmp', 'appforge-builds', buildId);
    fs.mkdirSync(buildDir, { recursive: true });

    const config = {
      appName: req.body.appName || 'MyApp',
      packageName: req.body.packageName || `com.appforge.${buildId.slice(0, 8)}`,
      versionName: req.body.versionName || '1.0.0',
      versionCode: parseInt(req.body.versionCode) || 1,
      minSdk: parseInt(req.body.minSdk) || 21,
      targetSdk: parseInt(req.body.targetSdk) || 34,
      developerName: req.body.developerName || 'Developer',
      appDescription: req.body.appDescription || '',
      appType: req.body.appType || 'general',
      permissions: req.body.permissions ? JSON.parse(req.body.permissions) : [],
      ads: req.body.ads ? JSON.parse(req.body.ads) : [],
      aiApiKey: req.body.aiApiKey || '',
      aiProvider: req.body.aiProvider || 'gemini'
    };

    // Step 1: Collect files
    const files = [];
    if (req.files) {
      req.files.forEach(f => {
        const dest = path.join(buildDir, f.originalname);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.renameSync(f.path, dest);
        files.push({ name: f.originalname, path: dest, size: f.size });
      });
    }

    // Step 2: Collect inline code
    if (req.body.codeEntries) {
      const entries = JSON.parse(req.body.codeEntries);
      entries.forEach(entry => {
        const filePath = path.join(buildDir, entry.filename);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, entry.content);
        files.push({ name: entry.filename, path: filePath });
      });
    }

    // Step 3: AI Enhancement (if API key provided)
    let aiEnhanced = false;
    if (config.aiApiKey && files.length > 0) {
      try {
        const ai = new AIEngine(config.aiApiKey, config.aiProvider);
        for (const file of files) {
          if (file.name.match(/\.(html|css|js|dart)$/i)) {
            const content = fs.readFileSync(file.path, 'utf-8');
            const enhanced = await ai.enhanceCode(content, file.name);
            if (enhanced && enhanced.code) {
              fs.writeFileSync(file.path, enhanced.code);
              aiEnhanced = true;
            }
          }
        }
      } catch (aiErr) {
        console.error('AI enhancement failed:', aiErr.message);
      }
    }

    // Step 4: Generate legal pages
    const legal = new LegalGenerator();
    const legalPages = legal.generateAll({
      appName: config.appName,
      appDescription: config.appDescription || `${config.appName} mobile application`,
      developerName: config.developerName,
      appType: config.appType
    });
    Object.entries(legalPages).forEach(([name, content]) => {
      const filePath = path.join(buildDir, 'assets', 'legal', `${name}.html`);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, content);
    });

    // Step 5: Configure ads
    let adConfig = null;
    if (config.ads && config.ads.length > 0) {
      const adMgr = new AdNetworkManager();
      adConfig = adMgr.configureAds(config.ads);
    }

    // Step 6: Generate Flutter project
    const generator = new FlutterGenerator(buildDir, config);
    await generator.generateProject(files, adConfig, legalPages);

    // Step 7: Create ZIP
    const zipPath = `/tmp/appforge-builds/${buildId}-flutter.zip`;
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    await new Promise((resolve, reject) => {
      output.on('close', resolve);
      archive.on('error', reject);
      archive.pipe(output);
      archive.directory(path.join(buildDir, 'flutter_app'), false);
      archive.finalize();
    });

    builds.set(buildId, {
      id: buildId, dir: buildDir, files, config, ads: adConfig,
      legal: legalPages, zipPath, status: 'ready', aiEnhanced, createdAt: Date.now()
    });

    res.json({
      success: true,
      buildId,
      downloadUrl: `/api/download/${buildId}`,
      config,
      features: {
        aiEnhanced,
        legalPages: Object.keys(legalPages),
        adNetworks: adConfig ? adConfig.networks.length : 0,
        totalFiles: files.length + Object.keys(legalPages).length
      }
    });
  } catch (err) {
    console.error('Pipeline error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Build status
app.get('/api/status/:buildId', (req, res) => {
  const { buildId } = req.params;
  if (!builds.has(buildId)) return res.status(404).json({ error: 'Build not found' });
  const build = builds.get(buildId);
  res.json({ success: true, status: build.status, config: build.config });
});

function generateGitHubWorkflow(config) {
  return `name: Build Flutter APK & AAB

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.24.0'
          channel: 'stable'
          cache: true

      - name: Create keystore
        run: |
          echo "\${{ secrets.KEYSTORE_BASE64 }}" | base64 -d > android/app/release-keystore.jks || \\
          keytool -genkey -v -keystore android/app/release-keystore.jks \\
            -keyalg RSA -keysize 2048 -validity 10000 \\
            -alias key -storepass android -keypass android \\
            -dname "CN=${config.developerName || 'Developer'}, OU=Dev, O=${config.appName}, L=City, ST=State, C=US"

      - name: Create key.properties
        run: |
          echo "storePassword=android" > android/key.properties
          echo "keyPassword=android" >> android/key.properties
          echo "keyAlias=key" >> android/key.properties
          echo "storeFile=release-keystore.jks" >> android/key.properties

      - name: Get dependencies
        run: flutter pub get

      - name: Analyze
        run: flutter analyze --no-fatal-infos || true

      - name: Build APK
        run: flutter build apk --release

      - name: Build AAB
        run: flutter build appbundle --release

      - name: Upload APK
        uses: actions/upload-artifact@v4
        with:
          name: apk-release
          path: build/app/outputs/flutter-apk/app-release.apk

      - name: Upload AAB
        uses: actions/upload-artifact@v4
        with:
          name: aab-release
          path: build/app/outputs/bundle/release/app-release.aab

      - name: Create Release
        if: startsWith(github.ref, 'refs/tags/v')
        uses: softprops/action-gh-release@v1
        with:
          files: |
            build/app/outputs/flutter-apk/app-release.apk
            build/app/outputs/bundle/release/app-release.aab
`;
}

// Cleanup old builds every hour
setInterval(() => {
  const cutoff = Date.now() - 3600000;
  builds.forEach((build, id) => {
    if (build.createdAt < cutoff) {
      try { fs.rmSync(build.dir, { recursive: true, force: true }); } catch (e) {}
      if (build.zipPath) try { fs.unlinkSync(build.zipPath); } catch (e) {}
      builds.delete(id);
    }
  });
}, 3600000);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🔨 AppForge running on http://localhost:${PORT}`);
  console.log(`   Convert HTML → Native APK with Flutter + AI\n`);
});
