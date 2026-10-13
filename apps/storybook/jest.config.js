module.exports = {
  preset: 'react-native',
  testEnvironmentOptions: {
    // Load @matr1xp/ui from its TypeScript source, like Metro does.
    customExportConditions: ['require', 'react-native', 'matr1xp-ui-source'],
  },
};
