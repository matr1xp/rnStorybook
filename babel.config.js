module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Inlines process.env.STORYBOOK_ENABLED so App.tsx can switch to Storybook.
    // Restart Metro with --reset-cache after changing it.
    [
      'transform-inline-environment-variables',
      { include: ['STORYBOOK_ENABLED'] },
    ],
    // Must be listed last (required by react-native-reanimated 4).
    'react-native-worklets/plugin',
  ],
};
