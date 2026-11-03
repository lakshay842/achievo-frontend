module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // NativeWind appends the Reanimated/Worklets plugin and it must stay last.
      // Turn Expo's copy off so the plugin is not registered twice.
      ['babel-preset-expo', { jsxImportSource: 'nativewind', reanimated: false }],
      'nativewind/babel',
    ],
  };
};
