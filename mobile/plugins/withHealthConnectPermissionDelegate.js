const { withMainActivity, withAndroidManifest, withPlugins } = require('@expo/config-plugins');

const HEALTH_CONNECT_PACKAGE = 'com.google.android.apps.healthdata';

/**
 * Two gaps left by react-native-health-connect's Expo integration in this
 * project, both needed before requestPermission() will actually show
 * Android's system permission dialog instead of silently failing:
 *
 * 1. Its Expo auto-registration module (android-expo/) is supposed to wire
 *    up HealthConnectPermissionDelegate on MainActivity automatically, but
 *    Expo's autolinking here resolves that module with zero exported
 *    modules, so it never runs. Applied manually instead, per the path the
 *    package documents for non-Expo (React Native CLI) projects.
 *
 * 2. Since Android 11 (API 30), an app can't resolve an implicit intent
 *    targeting another app's package unless it's declared under <queries>
 *    — without it, Android can't even find Health Connect to launch its
 *    permission screen, and shows "No compatible app installed" instead.
 *
 * Both idempotent — safe across repeated `expo prebuild`.
 */
const IMPORT_LINE = 'import dev.matinzd.healthconnect.permissions.HealthConnectPermissionDelegate';
const SETUP_CALL = '    HealthConnectPermissionDelegate.setPermissionDelegate(this)\n';

const withHealthConnectPermissionDelegate = (config) =>
  withMainActivity(config, (config) => {
    let { contents } = config.modResults;

    if (!contents.includes('HealthConnectPermissionDelegate')) {
      contents = contents.replace(/^(import .+\n)/m, `$1${IMPORT_LINE}\n`);
      contents = contents.replace(
        /(override fun onCreate\(savedInstanceState: Bundle\?\) \{[\s\S]*?super\.onCreate\(null\)\n)/,
        `$1${SETUP_CALL}`
      );
    }

    config.modResults.contents = contents;
    return config;
  });

const withHealthConnectPackageVisibility = (config) =>
  withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    if (!manifest.queries) manifest.queries = [{}];
    const queries = manifest.queries[0];
    if (!queries.package) queries.package = [];

    const alreadyDeclared = queries.package.some(
      (p) => p.$?.['android:name'] === HEALTH_CONNECT_PACKAGE
    );
    if (!alreadyDeclared) {
      queries.package.push({ $: { 'android:name': HEALTH_CONNECT_PACKAGE } });
    }

    return config;
  });

module.exports = (config) =>
  withPlugins(config, [withHealthConnectPermissionDelegate, withHealthConnectPackageVisibility]);
