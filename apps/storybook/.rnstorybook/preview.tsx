import type { Preview } from '@storybook/react-native';
import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '@matr1xp/ui';

const preview: Preview = {
  decorators: [
    Story => (
      <View style={styles.canvas}>
        <Story />
      </View>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.background,
  },
});

export default preview;
