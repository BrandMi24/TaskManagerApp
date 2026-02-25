// babel.config.js — Expo + Reanimated configuration
// IMPORTANT: 'react-native-reanimated/plugin' must be listed LAST in the plugins array.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
