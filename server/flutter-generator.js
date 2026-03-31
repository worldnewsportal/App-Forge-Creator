const fs = require('fs');
const path = require('path');

class FlutterGenerator {
  constructor(buildDir, config) {
    this.buildDir = buildDir;
    this.appDir = path.join(buildDir, 'flutter_app');
    this.config = config;
  }

  async generateProject(files, adConfig, legalPages) {
    this.createPubspec();
    this.createAndroidManifest();
    this.createMainDart(files, legalPages);
    this.createWebViewScreen();
    this.createHomePage(files);
    this.createSplashScreen();
    this.createSettingsPage(adConfig, legalPages);
    this.createAboutPage();
    this.createAdManager(adConfig);
    this.createBuildGradle(adConfig);
    this.createMainActivity();
    this.createAssets(files);
    this.createAppIcon();
    this.createReadme();
  }

  createPubspec() {
    const deps = [
      '  webview_flutter: ^4.8.0',
      '  webview_flutter_android: ^3.14.0',
      '  webview_flutter_wkwebview: ^3.10.0',
      '  flutter_inappwebview: ^6.0.0',
      '  share_plus: ^9.0.0',
      '  url_launcher: ^6.2.0',
      '  path_provider: ^2.1.0',
      '  permission_handler: ^11.0.0',
      '  connectivity_plus: ^6.0.0',
      '  google_mobile_ads: ^5.1.0',
      '  shared_preferences: ^2.3.0',
      '  flutter_native_splash: ^2.3.0',
      '  flutter_launcher_icons: ^0.14.0',
    ];

    if (this.config.permissions?.includes('camera')) {
      deps.push('  camera: ^0.11.0');
      deps.push('  image_picker: ^1.0.0');
    }
    if (this.config.permissions?.includes('location')) {
      deps.push('  geolocator: ^12.0.0');
      deps.push('  geocoding: ^3.0.0');
    }
    if (this.config.permissions?.includes('notification')) {
      deps.push('  firebase_messaging: ^15.0.0');
      deps.push('  flutter_local_notifications: ^18.0.0');
    }

    const content = `name: ${this.sanitizeName(this.config.appName)}
description: ${this.config.appDescription || this.config.appName + ' - Built with AppForge'}
publish_to: 'none'
version: ${this.config.versionName}+${this.config.versionCode}

environment:
  sdk: '>=3.2.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.6
${deps.join('\n')}

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0

flutter:
  uses-material-design: true
  assets:
    - assets/legal/
    - assets/icons/
    - assets/html/

flutter_native_splash:
  color: "#1a1a2e"
  image: assets/icons/splash.png
  android_12:
    color: "#1a1a2e"
    icon_background_color: "#1a1a2e"

flutter_launcher_icons:
  android: true
  ios: true
  image_path: assets/icons/app_icon.png
`;
    this.writeFile('pubspec.yaml', content);
  }

  createAndroidManifest() {
    const perms = [];
    perms.push('    <uses-permission android:name="android.permission.INTERNET"/>');
    perms.push('    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>');

    if (this.config.permissions) {
      const permMap = {
        'camera': 'android.permission.CAMERA',
        'location': 'android.permission.ACCESS_FINE_LOCATION',
        'storage': 'android.permission.READ_EXTERNAL_STORAGE',
        'notification': 'android.permission.POST_NOTIFICATIONS',
        'microphone': 'android.permission.RECORD_AUDIO',
        'contacts': 'android.permission.READ_CONTACTS',
        'phone': 'android.permission.READ_PHONE_STATE',
        'calendar': 'android.permission.READ_CALENDAR',
        'bluetooth': 'android.permission.BLUETOOTH',
        'biometric': 'android.permission.USE_BIOMETRIC'
      };
      this.config.permissions.forEach(p => {
        if (permMap[p]) perms.push(`    <uses-permission android:name="${permMap[p]}"/>`);
      });
    }

    const content = `<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${this.config.packageName}">
${perms.join('\n')}

    <application
        android:label="${this.config.appName}"
        android:name="\${applicationName}"
        android:icon="@mipmap/launcher_icon"
        android:usesCleartextTraffic="true"
        android:requestLegacyExternalStorage="true"
        android:theme="@style/LaunchTheme"
        android:hardwareAccelerated="true">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:taskAffinity=""
            android:theme="@style/LaunchTheme"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode"
            android:hardwareAccelerated="true"
            android:windowSoftInputMode="adjustResize">
            <meta-data
                android:name="io.flutter.embedding.android.NormalTheme"
                android:resource="@style/NormalTheme"/>
            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>
        <meta-data
            android:name="flutterEmbedding"
            android:value="2"/>
        <meta-data
            android:name="com.google.android.gms.ads.APPLICATION_ID"
            android:value="ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy"/>
    </application>
    <queries>
        <intent>
            <action android:name="android.intent.action.PROCESS_TEXT"/>
            <data android:mimeType="text/plain"/>
        </intent>
    </queries>
</manifest>`;
    this.writeFile('android/app/src/main/AndroidManifest.xml', content);
  }

  createMainDart(files, legalPages) {
    const hasHtml = files.some(f => f.name.match(/\.html?$/i));
    const startRoute = hasHtml ? '/webview' : '/home';

    const content = `import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'screens/home_screen.dart';
import 'screens/webview_screen.dart';
import 'screens/splash_screen.dart';
import 'screens/settings_screen.dart';
import 'screens/about_screen.dart';
import 'services/ad_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize ads
  await AdService.instance.initialize();

  // Lock orientation based on app type
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
    DeviceOrientation.landscapeLeft,
    DeviceOrientation.landscapeRight,
  ]);

  // Set system UI overlay style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Color(0xFF1a1a2e),
    ),
  );

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '${this.escapeStr(this.config.appName)}',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6C63FF),
          brightness: Brightness.dark,
        ),
        scaffoldBackgroundColor: const Color(0xFF0f0f1a),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF1a1a2e),
          elevation: 0,
          centerTitle: true,
          titleTextStyle: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),
        cardTheme: CardTheme(
          color: const Color(0xFF16213e),
          elevation: 4,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF6C63FF),
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        ),
      ),
      initialRoute: '/splash',
      routes: {
        '/splash': (context) => const SplashScreen(),
        '/home': (context) => const HomeScreen(),
        '/webview': (context) {
          final args = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;
          return WebViewScreen(
            initialUrl: args?['url'] ?? 'about:blank',
            htmlContent: args?['html'],
            title: args?['title'] ?? '${this.escapeStr(this.config.appName)}',
          );
        },
        '/settings': (context) => const SettingsScreen(),
        '/about': (context) => const AboutScreen(),
      },
    );
  }
}
`;
    this.writeFile('lib/main.dart', content);
  }

  createWebViewScreen() {
    const content = `import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:share_plus/share_plus.dart';
import '../services/ad_service.dart';

class WebViewScreen extends StatefulWidget {
  final String initialUrl;
  final String? htmlContent;
  final String title;

  const WebViewScreen({
    super.key,
    required this.initialUrl,
    this.htmlContent,
    this.title = 'App',
  });

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  InAppWebViewController? _controller;
  double _progress = 0;
  String _currentUrl = '';
  bool _canGoBack = false;
  bool _canGoForward = false;
  final TextEditingController _urlController = TextEditingController();
  bool _showUrlBar = false;

  @override
  void initState() {
    super.initState();
    _currentUrl = widget.initialUrl;
    _urlController.text = _currentUrl;
  }

  @override
  void dispose() {
    _controller?.dispose();
    _urlController.dispose();
    super.dispose();
  }

  Future<void> _handleBack() async {
    if (_controller != null && await _controller!.canGoBack()) {
      _controller!.goBack();
    } else {
      if (mounted) Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvoked: (didPop) async {
        if (!didPop) await _handleBack();
      },
      child: Scaffold(
        appBar: AppBar(
          title: _showUrlBar
              ? TextField(
                  controller: _urlController,
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    hintText: 'Enter URL...',
                    hintStyle: TextStyle(color: Colors.white.withOpacity(0.5)),
                    border: InputBorder.none,
                  ),
                  onSubmitted: (url) {
                    if (!url.startsWith('http')) url = 'https://$url';
                    _controller?.loadUrl(
                      urlRequest: URLRequest(url: WebUri(url)),
                    );
                  },
                )
              : Text(widget.title, overflow: TextOverflow.ellipsis),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: _handleBack,
          ),
          actions: [
            IconButton(
              icon: Icon(_showUrlBar ? Icons.close : Icons.link),
              onPressed: () => setState(() => _showUrlBar = !_showUrlBar),
            ),
            IconButton(
              icon: const Icon(Icons.refresh),
              onPressed: () => _controller?.reload(),
            ),
            PopupMenuButton<String>(
              onSelected: (value) async {
                switch (value) {
                  case 'share':
                    Share.share(_currentUrl);
                    break;
                  case 'open_browser':
                    await launchUrl(
                      Uri.parse(_currentUrl),
                      mode: LaunchMode.externalApplication,
                    );
                    break;
                  case 'forward':
                    _controller?.goForward();
                    break;
                }
              },
              itemBuilder: (context) => [
                const PopupMenuItem(value: 'forward', child: Text('Forward')),
                const PopupMenuItem(value: 'share', child: Text('Share')),
                const PopupMenuItem(value: 'open_browser', child: Text('Open in Browser')),
              ],
            ),
          ],
        ),
        body: Column(
          children: [
            if (_progress < 1.0)
              LinearProgressIndicator(
                value: _progress,
                backgroundColor: Colors.transparent,
                valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF6C63FF)),
              ),
            Expanded(
              child: InAppWebView(
                initialSettings: InAppWebViewSettings(
                  javaScriptEnabled: true,
                  javaScriptCanOpenWindowsAutomatically: true,
                  mediaPlaybackRequiresUserGesture: false,
                  allowsInlineMediaPlayback: true,
                  useHybridComposition: true,
                  supportZoom: true,
                  builtInZoomControls: true,
                  displayZoomControls: false,
                  allowFileAccess: true,
                  allowContentAccess: true,
                  domStorageEnabled: true,
                  databaseEnabled: true,
                  cacheMode: InAppWebViewCacheMode.LOAD_DEFAULT,
                  transparentBackground: false,
                ),
                initialUrlRequest: widget.htmlContent != null
                    ? null
                    : URLRequest(url: WebUri(widget.initialUrl)),
                initialData: widget.htmlContent != null
                    ? InAppWebViewInitialData(data: widget.htmlContent!)
                    : null,
                onWebViewCreated: (controller) {
                  _controller = controller;

                  // Add JavaScript handler for native features
                  controller.addJavaScriptHandler(
                    handlerName: 'share',
                    callback: (args) {
                      if (args.isNotEmpty) Share.share(args[0].toString());
                    },
                  );
                  controller.addJavaScriptHandler(
                    handlerName: 'showAd',
                    callback: (args) {
                      AdService.instance.showInterstitialAd();
                    },
                  );
                  controller.addJavaScriptHandler(
                    handlerName: 'showRewarded',
                    callback: (args) {
                      AdService.instance.showRewardedAd(
                        onRewarded: (reward) {
                          controller.evaluateJavascript(
                            source: "window.onRewardedAdComplete && window.onRewardedAdComplete();",
                          );
                        },
                      );
                    },
                  );
                },
                onLoadStart: (controller, url) {
                  setState(() {
                    _currentUrl = url?.toString() ?? '';
                    _urlController.text = _currentUrl;
                  });
                },
                onLoadStop: (controller, url) async {
                  setState(() {
                    _progress = 1.0;
                    _currentUrl = url?.toString() ?? '';
                  });
                  _canGoBack = await controller.canGoBack();
                  _canGoForward = await controller.canGoForward();
                },
                onProgressChanged: (controller, progress) {
                  setState(() => _progress = progress / 100);
                },
                shouldOverrideUrlLoading: (controller, navigationAction) async {
                  final url = navigationAction.request.url?.toString() ?? '';

                  // Handle external URLs
                  if (url.startsWith('tel:') ||
                      url.startsWith('mailto:') ||
                      url.startsWith('sms:') ||
                      url.startsWith('whatsapp:') ||
                      url.startsWith('geo:')) {
                    await launchUrl(Uri.parse(url));
                    return NavigationActionPolicy.CANCEL;
                  }

                  // Handle market links
                  if (url.startsWith('market://')) {
                    final playUrl = url.replaceFirst(
                      'market://details?id=',
                      'https://play.google.com/store/apps/details?id=',
                    );
                    await launchUrl(
                      Uri.parse(playUrl),
                      mode: LaunchMode.externalApplication,
                    );
                    return NavigationActionPolicy.CANCEL;
                  }

                  return NavigationActionPolicy.ALLOW;
                },
                onConsoleMessage: (controller, consoleMessage) {
                  debugPrint('[WebView] \${consoleMessage.message}');
                },
              ),
            ),
            // Ad banner
            AdService.instance.getBannerWidget(),
          ],
        ),
        floatingActionButton: FloatingActionButton(
          mini: true,
          backgroundColor: const Color(0xFF6C63FF),
          onPressed: () => _controller?.scrollTo(x: 0, y: 0),
          child: const Icon(Icons.arrow_upward, color: Colors.white),
        ),
      ),
    );
  }
}
`;
    this.writeFile('lib/screens/webview_screen.dart', content);
  }

  createHomePage(files) {
    const hasHtml = files.some(f => f.name.match(/\.html?$/i));
    const mainFile = files.find(f => f.name === 'index.html') || files[0];

    const content = `import 'package:flutter/material.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import '../services/ad_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with TickerProviderStateMixin {
  late AnimationController _animController;
  late Animation<double> _fadeAnim;
  late Animation<Offset> _slideAnim;
  bool _hasConnection = true;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _fadeAnim = CurvedAnimation(parent: _animController, curve: Curves.easeOut);
    _slideAnim = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _animController, curve: Curves.easeOutCubic));
    _animController.forward();
    _checkConnectivity();
  }

  Future<void> _checkConnectivity() async {
    final result = await Connectivity().checkConnectivity();
    setState(() => _hasConnection = result != ConnectivityResult.none);
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: FadeTransition(
          opacity: _fadeAnim,
          child: SlideTransition(
            position: _slideAnim,
            child: CustomScrollView(
              slivers: [
                SliverAppBar(
                  expandedHeight: 200,
                  floating: true,
                  pinned: true,
                  flexibleSpace: FlexibleSpaceBar(
                    title: Text(
                      '${this.escapeStr(this.config.appName)}',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        shadows: [Shadow(blurRadius: 10, color: Colors.black54)],
                      ),
                    ),
                    background: Container(
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [Color(0xFF6C63FF), Color(0xFF3F3D9E), Color(0xFF1a1a2e)],
                        ),
                      ),
                      child: Center(
                        child: Icon(Icons.apps, size: 80, color: Colors.white.withOpacity(0.3)),
                      ),
                    ),
                  ),
                  actions: [
                    IconButton(
                      icon: const Icon(Icons.settings),
                      onPressed: () => Navigator.pushNamed(context, '/settings'),
                    ),
                  ],
                ),
                if (!_hasConnection)
                  SliverToBoxAdapter(
                    child: Container(
                      margin: const EdgeInsets.all(16),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.orange.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.orange),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.wifi_off, color: Colors.orange),
                          SizedBox(width: 12),
                          Expanded(child: Text('No internet connection. Some features may be limited.')),
                        ],
                      ),
                    ),
                  ),
                SliverPadding(
                  padding: const EdgeInsets.all(16),
                  sliver: SliverGrid(
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      mainAxisSpacing: 16,
                      crossAxisSpacing: 16,
                      childAspectRatio: 1.1,
                    ),
                    delegate: SliverChildListDelegate([
                      _buildFeatureCard(
                        context,
                        icon: Icons.launch,
                        title: 'Open App',
                        subtitle: 'Launch your app',
                        color: const Color(0xFF6C63FF),
                        onTap: () => Navigator.pushNamed(
                          context,
                          '/webview',
                          arguments: {
                            'title': '${this.escapeStr(this.config.appName)}',
                            ${hasHtml ? `'html': _getLocalHtml(),` : `'url': 'https://example.com',`}
                          },
                        ),
                      ),
                      _buildFeatureCard(
                        context,
                        icon: Icons.info_outline,
                        title: 'About',
                        subtitle: 'App information',
                        color: const Color(0xFF00BCD4),
                        onTap: () => Navigator.pushNamed(context, '/about'),
                      ),
                      _buildFeatureCard(
                        context,
                        icon: Icons.description,
                        title: 'Terms',
                        subtitle: 'Terms of service',
                        color: const Color(0xFF4CAF50),
                        onTap: () => Navigator.pushNamed(
                          context,
                          '/webview',
                          arguments: {
                            'title': 'Terms of Service',
                            'html': _getLegalHtml('terms_of_service'),
                          },
                        ),
                      ),
                      _buildFeatureCard(
                        context,
                        icon: Icons.privacy_tip,
                        title: 'Privacy',
                        subtitle: 'Privacy policy',
                        color: const Color(0xFFFF9800),
                        onTap: () => Navigator.pushNamed(
                          context,
                          '/webview',
                          arguments: {
                            'title': 'Privacy Policy',
                            'html': _getLegalHtml('privacy_policy'),
                          },
                        ),
                      ),
                      _buildFeatureCard(
                        context,
                        icon: Icons.share,
                        title: 'Share',
                        subtitle: 'Share this app',
                        color: const Color(0xFFE91E63),
                        onTap: () {
                          // Share app
                        },
                      ),
                      _buildFeatureCard(
                        context,
                        icon: Icons.star,
                        title: 'Rate Us',
                        subtitle: 'Rate on Play Store',
                        color: const Color(0xFFFFD700),
                        onTap: () {
                          // Open Play Store
                        },
                      ),
                    ]),
                  ),
                ),
                const SliverToBoxAdapter(child: SizedBox(height: 80)),
              ],
            ),
          ),
        ),
      ),
      bottomNavigationBar: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          AdService.instance.getBannerWidget(),
          BottomNavigationBar(
            type: BottomNavigationBarType.fixed,
            backgroundColor: const Color(0xFF1a1a2e),
            selectedItemColor: const Color(0xFF6C63FF),
            unselectedItemColor: Colors.grey,
            items: const [
              BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
              BottomNavigationBarItem(icon: Icon(Icons.info), label: 'About'),
              BottomNavigationBarItem(icon: Icon(Icons.settings), label: 'Settings'),
            ],
            onTap: (index) {
              switch (index) {
                case 0: break;
                case 1: Navigator.pushNamed(context, '/about'); break;
                case 2: Navigator.pushNamed(context, '/settings'); break;
              }
            },
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureCard(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [color.withOpacity(0.3), color.withOpacity(0.1)],
          ),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: color.withOpacity(0.3)),
          boxShadow: [
            BoxShadow(
              color: color.withOpacity(0.2),
              blurRadius: 15,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: color.withOpacity(0.2),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 32, color: color),
            ),
            const SizedBox(height: 12),
            Text(
              title,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white),
            ),
            const SizedBox(height: 4),
            Text(
              subtitle,
              style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.6)),
            ),
          ],
        ),
      ),
    );
  }

  String _getLocalHtml() {
    return '''<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, sans-serif; background: #0f0f1a; color: #fff; min-height: 100vh; }
</style>
</head>
<body>
<div id="app-content">Loading...</div>
</body>
</html>''';
  }

  String _getLegalHtml(String type) {
    return '<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="font-family: sans-serif; padding: 20px; background: #0f0f1a; color: #fff;"><h1>Loading...</h1></body></html>';
  }
}
`;
    this.writeFile('lib/screens/home_screen.dart', content);
  }

  createSplashScreen() {
    const content = `import 'package:flutter/material.dart';
import 'dart:async';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with TickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnim;
  late Animation<double> _fadeAnim;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );
    _scaleAnim = Tween<double>(begin: 0.5, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.elasticOut),
    );
    _fadeAnim = CurvedAnimation(parent: _controller, curve: Curves.easeIn);
    _controller.forward();

    Timer(const Duration(seconds: 3), () {
      if (mounted) Navigator.pushReplacementNamed(context, '/home');
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFF1a1a2e), Color(0xFF0f0f1a)],
          ),
        ),
        child: Center(
          child: FadeTransition(
            opacity: _fadeAnim,
            child: ScaleTransition(
              scale: _scaleAnim,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 120,
                    height: 120,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(30),
                      gradient: const LinearGradient(
                        colors: [Color(0xFF6C63FF), Color(0xFF3F3D9E)],
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF6C63FF).withOpacity(0.5),
                          blurRadius: 30,
                          spreadRadius: 5,
                        ),
                      ],
                    ),
                    child: const Icon(Icons.apps, size: 60, color: Colors.white),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    '${this.escapeStr(this.config.appName)}',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                      letterSpacing: 1.5,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Powered by AppForge',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.white.withOpacity(0.5),
                    ),
                  ),
                  const SizedBox(height: 48),
                  const SizedBox(
                    width: 24,
                    height: 24,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF6C63FF)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
`;
    this.writeFile('lib/screens/splash_screen.dart', content);
  }

  createSettingsPage(adConfig, legalPages) {
    const content = `import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import '../services/ad_service.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _notificationsEnabled = true;
  bool _darkMode = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildSection('General', [
            SwitchListTile(
              title: const Text('Notifications'),
              subtitle: const Text('Receive push notifications'),
              value: _notificationsEnabled,
              onChanged: (v) => setState(() => _notificationsEnabled = v),
              activeColor: const Color(0xFF6C63FF),
              secondary: const Icon(Icons.notifications_outlined),
            ),
          ]),
          const SizedBox(height: 16),
          _buildSection('Legal', [
            ListTile(
              leading: const Icon(Icons.description),
              title: const Text('Terms of Service'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => Navigator.pushNamed(
                context,
                '/webview',
                arguments: {'title': 'Terms of Service', 'html': _loadLegal('terms_of_service')},
              ),
            ),
            ListTile(
              leading: const Icon(Icons.privacy_tip),
              title: const Text('Privacy Policy'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => Navigator.pushNamed(
                context,
                '/webview',
                arguments: {'title': 'Privacy Policy', 'html': _loadLegal('privacy_policy')},
              ),
            ),
            ListTile(
              leading: const Icon(Icons.gavel),
              title: const Text('User Agreement'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => Navigator.pushNamed(
                context,
                '/webview',
                arguments: {'title': 'User Agreement', 'html': _loadLegal('user_agreement')},
              ),
            ),
          ]),
          const SizedBox(height: 16),
          _buildSection('About', [
            ListTile(
              leading: const Icon(Icons.info),
              title: const Text('About ${this.escapeStr(this.config.appName)}'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => Navigator.pushNamed(context, '/about'),
            ),
            ListTile(
              leading: const Icon(Icons.star),
              title: const Text('Rate this App'),
              trailing: const Icon(Icons.open_in_new),
              onTap: () => launchUrl(
                Uri.parse('https://play.google.com/store/apps/details?id=${this.config.packageName}'),
                mode: LaunchMode.externalApplication,
              ),
            ),
            ListTile(
              leading: const Icon(Icons.share),
              title: const Text('Share App'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => Share.share(
                'Check out ${this.escapeStr(this.config.appName)}! https://play.google.com/store/apps/details?id=${this.config.packageName}',
              ),
            ),
          ]),
          const SizedBox(height: 16),
          _buildSection('App Info', [
            ListTile(
              leading: const Icon(Icons.tag),
              title: const Text('Version'),
              trailing: Text('${this.config.versionName}', style: const TextStyle(color: Colors.grey)),
            ),
            ListTile(
              leading: const Icon(Icons.code),
              title: const Text('Build Number'),
              trailing: Text('${this.config.versionCode}', style: const TextStyle(color: Colors.grey)),
            ),
            ListTile(
              leading: const Icon(Icons.build),
              title: const Text('Built with'),
              trailing: const Text('AppForge', style: TextStyle(color: Color(0xFF6C63FF))),
            ),
          ]),
          const SizedBox(height: 32),
          Center(
            child: Text(
              'Made with ❤️ using AppForge',
              style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSection(String title, List<Widget> children) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 16, bottom: 8),
          child: Text(
            title.toUpperCase(),
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: const Color(0xFF6C63FF),
              letterSpacing: 1.2,
            ),
          ),
        ),
        Card(
          margin: EdgeInsets.zero,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: Column(children: children),
        ),
      ],
    );
  }

  String _loadLegal(String type) {
    return '<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>'
        '<body style="font-family: -apple-system, sans-serif; padding: 20px; background: #0f0f1a; color: #fff;">'
        '<p>Loading legal document...</p></body></html>';
  }
}
`;
    this.writeFile('lib/screens/settings_screen.dart', content);
  }

  createAboutPage() {
    const content = `import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('About')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            const SizedBox(height: 20),
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(30),
                gradient: const LinearGradient(
                  colors: [Color(0xFF6C63FF), Color(0xFF3F3D9E)],
                ),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF6C63FF).withOpacity(0.4),
                    blurRadius: 25,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: const Icon(Icons.apps, size: 60, color: Colors.white),
            ),
            const SizedBox(height: 24),
            const Text(
              '${this.escapeStr(this.config.appName)}',
              style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              'Version ${this.config.versionName}',
              style: TextStyle(fontSize: 16, color: Colors.white.withOpacity(0.6)),
            ),
            const SizedBox(height: 32),
            _buildInfoCard(
              icon: Icons.description,
              title: 'About This App',
              content: '${this.escapeStr(this.config.appDescription || this.config.appName + " - A mobile application built with AppForge technology.")}',
            ),
            const SizedBox(height: 16),
            _buildInfoCard(
              icon: Icons.person,
              title: 'Developer',
              content: '${this.escapeStr(this.config.developerName || "Developer")}',
            ),
            const SizedBox(height: 16),
            _buildInfoCard(
              icon: Icons.verified,
              title: 'AppForge Certified',
              content: 'This app was built using AppForge, a platform that converts web applications into native mobile apps with Flutter technology.',
            ),
            const SizedBox(height: 32),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _buildActionButton(
                  icon: Icons.description,
                  label: 'Terms',
                  onTap: () => Navigator.pushNamed(context, '/webview', arguments: {
                    'title': 'Terms of Service',
                    'html': '<html><body><h1>Terms</h1></body></html>'
                  }),
                ),
                const SizedBox(width: 16),
                _buildActionButton(
                  icon: Icons.privacy_tip,
                  label: 'Privacy',
                  onTap: () => Navigator.pushNamed(context, '/webview', arguments: {
                    'title': 'Privacy Policy',
                    'html': '<html><body><h1>Privacy</h1></body></html>'
                  }),
                ),
              ],
            ),
            const SizedBox(height: 32),
            Text(
              '© \${DateTime.now().year} ${this.escapeStr(this.config.developerName || "Developer")}',
              style: TextStyle(color: Colors.white.withOpacity(0.4)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoCard({required IconData icon, required String title, required String content}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF16213e),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: const Color(0xFF6C63FF), size: 20),
              const SizedBox(width: 8),
              Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF6C63FF))),
            ],
          ),
          const SizedBox(height: 12),
          Text(content, style: const TextStyle(fontSize: 15, height: 1.5)),
        ],
      ),
    );
  }

  Widget _buildActionButton({required IconData icon, required String label, required VoidCallback onTap}) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        decoration: BoxDecoration(
          color: const Color(0xFF6C63FF).withOpacity(0.15),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFF6C63FF).withOpacity(0.3)),
        ),
        child: Row(
          children: [
            Icon(icon, color: const Color(0xFF6C63FF), size: 18),
            const SizedBox(width: 8),
            Text(label, style: const TextStyle(color: Color(0xFF6C63FF), fontWeight: FontWeight.w500)),
          ],
        ),
      ),
    );
  }
}
`;
    this.writeFile('lib/screens/about_screen.dart', content);
  }

  createAdManager(adConfig) {
    const hasAds = adConfig && adConfig.networks && adConfig.networks.length > 0;

    let adImports = '';
    let adInit = '';
    let bannerCode = '';
    let interstitialCode = '';
    let rewardedCode = '';
    let nativeCode = '';

    if (hasAds) {
      adImports = `import 'package:google_mobile_ads/google_mobile_ads.dart';`;

      bannerCode = `
  BannerAd? _bannerAd;
  bool _bannerLoaded = false;

  void _loadBanner() {
    _bannerAd = BannerAd(
      adUnitId: _bannerAdUnitId,
      size: AdSize.banner,
      request: const AdRequest(),
      listener: BannerAdListener(
        onAdLoaded: (_) => _bannerLoaded = true,
        onAdFailedToLoad: (ad, error) {
          ad.dispose();
          _bannerLoaded = false;
        },
      ),
    )..load();
  }

  Widget getBannerWidget() {
    if (!_bannerLoaded || _bannerAd == null) return const SizedBox.shrink();
    return Container(
      width: _bannerAd!.size.width.toDouble(),
      height: _bannerAd!.size.height.toDouble(),
      alignment: Alignment.center,
      child: AdWidget(ad: _bannerAd!),
    );
  }`;

      interstitialCode = `
  InterstitialAd? _interstitialAd;
  int _interstitialLoadAttempts = 0;

  void _loadInterstitial() {
    InterstitialAd.load(
      adUnitId: _interstitialAdUnitId,
      request: const AdRequest(),
      adLoadCallback: InterstitialAdLoadCallback(
        onAdLoaded: (ad) {
          _interstitialAd = ad;
          _interstitialLoadAttempts = 0;
        },
        onAdFailedToLoad: (error) {
          _interstitialLoadAttempts++;
          if (_interstitialLoadAttempts < 3) _loadInterstitial();
        },
      ),
    );
  }

  void showInterstitialAd() {
    if (_interstitialAd == null) return;
    _interstitialAd!.fullScreenContentCallback = FullScreenContentCallback(
      onAdDismissedFullScreenContent: (ad) {
        ad.dispose();
        _loadInterstitial();
      },
      onAdFailedToShowFullScreenContent: (ad, error) {
        ad.dispose();
        _loadInterstitial();
      },
    );
    _interstitialAd!.show();
    _interstitialAd = null;
  }`;

      rewardedCode = `
  RewardedAd? _rewardedAd;

  void _loadRewarded() {
    RewardedAd.load(
      adUnitId: _rewardedAdUnitId,
      request: const AdRequest(),
      rewardedAdLoadCallback: RewardedAdLoadCallback(
        onAdLoaded: (ad) => _rewardedAd = ad,
        onAdFailedToLoad: (_) => _rewardedAd = null,
      ),
    );
  }

  void showRewardedAd({Function(RewardItem)? onRewarded}) {
    if (_rewardedAd == null) return;
    _rewardedAd!.fullScreenContentCallback = FullScreenContentCallback(
      onAdDismissedFullScreenContent: (ad) {
        ad.dispose();
        _loadRewarded();
      },
      onAdFailedToShowFullScreenContent: (ad, error) {
        ad.dispose();
        _loadRewarded();
      },
    );
    _rewardedAd!.show(onUserEarnedReward: (_, reward) {
      if (onRewarded != null) onRewarded(reward);
    });
    _rewardedAd = null;
  }`;
    }

    const content = `import 'package:flutter/material.dart';
${adImports}

class AdService {
  AdService._();
  static final AdService instance = AdService._();

  static const String _bannerAdUnitId = 'ca-app-pub-3940256099942544/6300978111';
  static const String _interstitialAdUnitId = 'ca-app-pub-3940256099942544/1033173712';
  static const String _rewardedAdUnitId = 'ca-app-pub-3940256099942544/5224354917';
  static const String _nativeAdUnitId = 'ca-app-pub-3940256099942544/2247696110';

  bool _initialized = false;
  ${hasAds ? bannerCode : ''}
  ${hasAds ? interstitialCode : ''}
  ${hasAds ? rewardedCode : ''}

  Future<void> initialize() async {
    if (_initialized) return;
    ${hasAds ? `await MobileAds.instance.initialize();
    _loadBanner();
    _loadInterstitial();
    _loadRewarded();` : '// Ads disabled'}
    _initialized = true;
  }

  ${!hasAds ? `
  Widget getBannerWidget() => const SizedBox.shrink();
  void showInterstitialAd() {}
  void showRewardedAd({Function(dynamic)? onRewarded}) {}
  ` : ''}
}
`;
    this.writeFile('lib/services/ad_service.dart', content);
  }

  createBuildGradle(adConfig) {
    const gradleContent = `plugins {
    id "com.android.application"
    id "kotlin-android"
    id "dev.flutter.flutter-gradle-plugin"
}

android {
    namespace "${this.config.packageName}"
    compileSdk 34

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    defaultConfig {
        applicationId "${this.config.packageName}"
        minSdk ${this.config.minSdk || 21}
        targetSdk 34
        versionCode ${this.config.versionCode || 1}
        versionName "${this.config.versionName || '1.0.0'}"
    }

    signingConfigs {
        release {
            def keystoreProperties = new Properties()
            def keystorePropertiesFile = rootProject.file('key.properties')
            if (keystorePropertiesFile.exists()) {
                keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
            }
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}

flutter {
    source '../..'
}

dependencies {
    implementation "androidx.webkit:webkit:1.8.0"
    ${adConfig ? 'implementation "com.google.android.gms:play-services-ads:23.1.0"' : ''}
}
`;
    this.writeFile('android/app/build.gradle', gradleContent);

    // Project-level build.gradle
    const projectGradle = `buildscript {
    ext.kotlin_version = '1.9.22'
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.0'
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.buildDir = '../build'

subprojects {
    project.buildDir = "\${rootProject.buildDir}/\${project.name}"
}

subprojects {
    project.evaluationDependsOn(':app')
}

tasks.register("clean", Delete) {
    delete rootProject.buildDir
}
`;
    this.writeFile('android/build.gradle', projectGradle);
  }

  createMainActivity() {
    const content = `package ${this.config.packageName}

import io.flutter.embedding.android.FlutterActivity

class MainActivity: FlutterActivity() {
}
`;
    this.writeFile('android/app/src/main/kotlin/${this.config.packageName.replace(/\./g, '/')}/MainActivity.kt', content);
  }

  createAssets(files) {
    // Copy user files to assets
    files.forEach(f => {
      const destDir = path.join(this.appDir, 'assets', 'html');
      fs.mkdirSync(destDir, { recursive: true });
      try {
        fs.copyFileSync(f.path, path.join(destDir, path.basename(f.name)));
      } catch (e) {
        console.error(`Failed to copy ${f.name}: ${e.message}`);
      }
    });

    // Create placeholder icon
    const iconDir = path.join(this.appDir, 'assets', 'icons');
    fs.mkdirSync(iconDir, { recursive: true });
    // Create a simple SVG as placeholder
    fs.writeFileSync(path.join(iconDir, 'app_icon.svg'), this._generateIconSvg());
    fs.writeFileSync(path.join(iconDir, 'splash.svg'), this._generateSplashSvg());
  }

  _generateIconSvg() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6C63FF"/>
      <stop offset="100%" style="stop-color:#3F3D9E"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="100" fill="url(#bg)"/>
  <path d="M160 180h192v40H200v40h120v40H200v40h152v40H160z" fill="white"/>
</svg>`;
  }

  _generateSplashSvg() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1242" height="2436" viewBox="0 0 1242 2436">
  <rect width="1242" height="2436" fill="#1a1a2e"/>
  <text x="621" y="1300" text-anchor="middle" font-family="sans-serif" font-size="72" fill="white" font-weight="bold">${this.escapeStr(this.config.appName)}</text>
</svg>`;
  }

  createAppIcon() {
    // Create placeholder PNG files (1x1 pixel, will be replaced by real icons)
    const iconDir = path.join(this.appDir, 'assets', 'icons');
    fs.mkdirSync(iconDir, { recursive: true });
    // Placeholder - in production, these would be real icons
    const placeholder = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync(path.join(iconDir, 'app_icon.png'), placeholder);
    fs.writeFileSync(path.join(iconDir, 'splash.png'), placeholder);
  }

  createReadme() {
    const content = `# ${this.config.appName}

Built with **AppForge** — HTML to Native APK Converter

## App Details
- **Package:** ${this.config.packageName}
- **Version:** ${this.config.versionName} (${this.config.versionCode})
- **Min SDK:** ${this.config.minSdk || 21}
- **Target SDK:** 34
- **Developer:** ${this.config.developerName || 'Developer'}

## Building

### Using GitHub Actions
1. Push this repository to GitHub
2. The build workflow runs automatically
3. Download APK/AAB from the Actions artifacts

### Local Build
\`\`\`bash
flutter pub get
flutter build apk --release
\`\`\`

## Features
- Native Flutter WebView
- Responsive design
- Offline support
- Share functionality
- Settings & About pages
- Auto-generated legal pages (Terms, Privacy, User Agreement)
- Ad integration ready
- Material Design 3

## Generated by AppForge
`;
    this.writeFile('README.md', content);
  }

  writeFile(relativePath, content) {
    const fullPath = path.join(this.appDir, relativePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content);
  }

  sanitizeName(name) {
    return name.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') || 'app';
  }

  escapeStr(str) {
    return (str || '').replace(/'/g, "\\'").replace(/"/g, '\\"');
  }
}

module.exports = FlutterGenerator;
