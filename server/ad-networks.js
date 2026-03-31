class AdNetworkManager {
  constructor() {
    this.networks = [
      {
        id: 'admob',
        name: 'Google AdMob',
        icon: '📊',
        description: 'Google\'s mobile advertising platform',
        types: ['banner', 'interstitial', 'rewarded', 'native', 'app_open'],
        fields: [
          { id: 'appId', label: 'App ID', required: true, placeholder: 'ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy' },
          { id: 'bannerId', label: 'Banner Ad Unit ID', required: false, placeholder: 'ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy' },
          { id: 'interstitialId', label: 'Interstitial Ad Unit ID', required: false, placeholder: 'ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy' },
          { id: 'rewardedId', label: 'Rewarded Ad Unit ID', required: false, placeholder: 'ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy' },
          { id: 'nativeId', label: 'Native Ad Unit ID', required: false, placeholder: 'ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy' },
          { id: 'appOpenId', label: 'App Open Ad Unit ID', required: false, placeholder: 'ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy' },
        ]
      },
      {
        id: 'facebook',
        name: 'Meta Audience Network',
        icon: '📘',
        description: 'Facebook\'s ad network for mobile apps',
        types: ['banner', 'interstitial', 'rewarded', 'native'],
        fields: [
          { id: 'placementId', label: 'Placement ID', required: true, placeholder: 'xxxxxxxxxxxxxxxx_xxxxxxxxxxxxxxxx' },
        ]
      },
      {
        id: 'unity',
        name: 'Unity Ads',
        icon: '🎮',
        description: 'Best for gaming apps',
        types: ['interstitial', 'rewarded', 'banner'],
        fields: [
          { id: 'gameId', label: 'Game ID', required: true, placeholder: 'xxxxxxxxxxxx' },
          { id: 'bannerPlacement', label: 'Banner Placement', required: false, placeholder: 'Banner' },
          { id: 'videoPlacement', label: 'Video Placement', required: false, placeholder: 'video' },
          { id: 'rewardedPlacement', label: 'Rewarded Placement', required: false, placeholder: 'rewardedVideo' },
        ]
      },
      {
        id: 'applovin',
        name: 'AppLovin MAX',
        icon: '🎯',
        description: 'In-app bidding and mediation',
        types: ['banner', 'interstitial', 'rewarded', 'native', 'app_open'],
        fields: [
          { id: 'sdkKey', label: 'SDK Key', required: true, placeholder: 'xxxxxxxxxxxx' },
          { id: 'bannerId', label: 'Banner Ad Unit ID', required: false, placeholder: 'xxxxxxxxxxxx' },
          { id: 'interstitialId', label: 'Interstitial Ad Unit ID', required: false, placeholder: 'xxxxxxxxxxxx' },
          { id: 'rewardedId', label: 'Rewarded Ad Unit ID', required: false, placeholder: 'xxxxxxxxxxxx' },
        ]
      },
      {
        id: 'startapp',
        name: 'StartApp',
        icon: '🚀',
        description: 'Easy-to-integrate ad platform',
        types: ['banner', 'interstitial', 'rewarded', 'native', 'splash'],
        fields: [
          { id: 'appId', label: 'App ID', required: true, placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' },
        ]
      },
      {
        id: 'inmobi',
        name: 'InMobi',
        icon: '📱',
        description: 'Global mobile advertising platform',
        types: ['banner', 'interstitial', 'rewarded', 'native'],
        fields: [
          { id: 'accountId', label: 'Account ID', required: true, placeholder: 'xxxxxxxxxxxx' },
          { id: 'bannerPlacementId', label: 'Banner Placement ID', required: false, placeholder: 'xxxxxxxxxxxx' },
          { id: 'interstitialPlacementId', label: 'Interstitial Placement ID', required: false, placeholder: 'xxxxxxxxxxxx' },
        ]
      },
      {
        id: 'vungle',
        name: 'Liftoff (Vungle)',
        icon: '🎬',
        description: 'Video ad network',
        types: ['interstitial', 'rewarded', 'banner', 'native'],
        fields: [
          { id: 'appId', label: 'App ID', required: true, placeholder: 'xxxxxxxxxxxxxxxx' },
          { id: 'placementId', label: 'Placement ID', required: true, placeholder: 'xxxxxxxxxxxxxxxx' },
        ]
      },
      {
        id: 'ironsource',
        name: 'ironSource (Unity LevelPlay)',
        icon: '⛏️',
        description: 'Mediation and ad platform',
        types: ['banner', 'interstitial', 'rewarded', 'offerwall'],
        fields: [
          { id: 'appKey', label: 'App Key', required: true, placeholder: 'xxxxxxxxxxxx' },
        ]
      },
      {
        id: 'chartboost',
        name: 'Chartboost',
        icon: '📈',
        description: 'Mobile game monetization',
        types: ['interstitial', 'rewarded', 'banner', 'in_play'],
        fields: [
          { id: 'appId', label: 'App ID', required: true, placeholder: 'xxxxxxxxxxxxxxxx' },
          { id: 'appSignature', label: 'App Signature', required: true, placeholder: 'xxxxxxxxxxxxxxxx' },
        ]
      },
      {
        id: 'pangle',
        name: 'Pangle (TikTok Ads)',
        icon: '🎵',
        description: 'ByteDance ad network',
        types: ['banner', 'interstitial', 'rewarded', 'native', 'splash'],
        fields: [
          { id: 'appId', label: 'App ID', required: true, placeholder: 'xxxxxxxxxxxx' },
        ]
      }
    ];
  }

  getNetworks() {
    return this.networks;
  }

  configureAds(adsConfig) {
    const configured = {
      networks: [],
      adTypes: new Set(),
      totalNetworks: 0
    };

    adsConfig.forEach(ad => {
      const network = this.networks.find(n => n.id === ad.networkId);
      if (network) {
        configured.networks.push({
          ...network,
          config: ad.fields || {},
          types: ad.types || network.types
        });
        (ad.types || network.types).forEach(t => configured.adTypes.add(t));
        configured.totalNetworks++;
      }
    });

    configured.adTypes = Array.from(configured.adTypes);
    return configured;
  }

  generateAdCode(config) {
    if (!config || !config.networks || config.networks.length === 0) {
      return this._generateEmptyAdManager();
    }

    let imports = [];
    let initCode = [];
    let bannerCode = [];
    let interstitialCode = [];
    let rewardedCode = [];

    config.networks.forEach(network => {
      switch (network.id) {
        case 'admob':
          imports.push("import 'package:google_mobile_ads/google_mobile_ads.dart';");
          initCode.push(`await MobileAds.instance.initialize();`);
          break;
        case 'facebook':
          imports.push("import 'package:facebook_audience_network/facebook_audience_network.dart';");
          break;
        case 'unity':
          imports.push("import 'package:unity_ads_plugin/unity_ads_plugin.dart';");
          break;
        case 'applovin':
          imports.push("import 'package:applovin_max/applovin_max.dart';");
          break;
        case 'startapp':
          imports.push("import 'package:flutter_startapp/flutter_startapp.dart';");
          break;
      }
    });

    const primaryNetwork = config.networks[0];
    const adUnitIds = primaryNetwork.config || {};

    return `import 'package:flutter/material.dart';
${imports.join('\n')}

class AdService {
  AdService._();
  static final AdService instance = AdService._();

  // Ad Unit IDs
  static const String _bannerAdUnitId = '${adUnitIds.bannerId || adUnitIds.placementId || 'ca-app-pub-3940256099942544/6300978111'}';
  static const String _interstitialAdUnitId = '${adUnitIds.interstitialId || 'ca-app-pub-3940256099942544/1033173712'}';
  static const String _rewardedAdUnitId = '${adUnitIds.rewardedId || 'ca-app-pub-3940256099942544/5224354917'}';

  bool _initialized = false;
  BannerAd? _bannerAd;
  bool _bannerLoaded = false;
  InterstitialAd? _interstitialAd;
  RewardedAd? _rewardedAd;

  Future<void> initialize() async {
    if (_initialized) return;
    try {
      ${initCode.join('\n      ')}
      _loadBanner();
      _loadInterstitial();
      _loadRewarded();
    } catch (e) {
      debugPrint('Ad initialization failed: \$e');
    }
    _initialized = true;
  }

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
          // Retry after delay
          Future.delayed(const Duration(seconds: 30), _loadBanner);
        },
      ),
    )..load();
  }

  void _loadInterstitial() {
    InterstitialAd.load(
      adUnitId: _interstitialAdUnitId,
      request: const AdRequest(),
      adLoadCallback: InterstitialAdLoadCallback(
        onAdLoaded: (ad) => _interstitialAd = ad,
        onAdFailedToLoad: (_) => _interstitialAd = null,
      ),
    );
  }

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

  Widget getBannerWidget() {
    if (!_bannerLoaded || _bannerAd == null) return const SizedBox.shrink();
    return Container(
      width: _bannerAd!.size.width.toDouble(),
      height: _bannerAd!.size.height.toDouble(),
      alignment: Alignment.center,
      child: AdWidget(ad: _bannerAd!),
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
  }

  void dispose() {
    _bannerAd?.dispose();
    _interstitialAd?.dispose();
    _rewardedAd?.dispose();
  }
}
`;
  }

  _generateEmptyAdManager() {
    return `import 'package:flutter/material.dart';

class AdService {
  AdService._();
  static final AdService instance = AdService._();
  bool _initialized = false;

  Future<void> initialize() async {
    _initialized = true;
  }

  Widget getBannerWidget() => const SizedBox.shrink();
  void showInterstitialAd() {}
  void showRewardedAd({Function(dynamic)? onRewarded}) {}
  void dispose() {}
}
`;
  }
}

module.exports = AdNetworkManager;
