const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const {
  withStorybook,
} = require('@storybook/react-native/metro/withStorybook');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  // Let Metro see packages/ui and the dependencies npm hoists to the root.
  watchFolders: [monorepoRoot],
  resolver: {
    // Resolve @matr1xp/ui to its TypeScript source instead of the lib build.
    // 'react-native' is React Native's default condition, so keep it.
    unstable_conditionNames: ['react-native', 'matr1xp-ui-source'],
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(monorepoRoot, 'node_modules'),
    ],
  },
};

// When STORYBOOK_ENABLED !== 'true', withStorybook strips Storybook modules
// from the bundle so the regular app ships without them.
module.exports = withStorybook(
  mergeConfig(getDefaultConfig(projectRoot), config),
  {
    enabled: process.env.STORYBOOK_ENABLED === 'true',
    configPath: path.resolve(projectRoot, './.rnstorybook'),
  },
);
