/** @type {import('@bacons/apple-targets').Config} */
module.exports = (config) => ({
  type: 'widget',
  name: 'RoveTtcWidget',
  displayName: 'Rove TTC Status',
  colors: {
    $widgetBackground: '#FAF9F6',
  },
  entitlements: {
    'com.apple.security.application-groups':
      config.ios.entitlements['com.apple.security.application-groups'],
  },
});
