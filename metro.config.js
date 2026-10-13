const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const {
  withStorybook,
} = require('@storybook/react-native/metro/withStorybook');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {};

// When STORYBOOK_ENABLED !== 'true', withStorybook strips Storybook modules
// from the bundle so the regular app ships without them.
module.exports = withStorybook(
  mergeConfig(getDefaultConfig(__dirname), config),
  {
    enabled: process.env.STORYBOOK_ENABLED === 'true',
    configPath: path.resolve(__dirname, './.rnstorybook'),
  },
);
