/**
 * Storybook starter app
 *
 * `npm run storybook` starts Metro with STORYBOOK_ENABLED=true, which renders
 * the on-device Storybook UI instead of the app below.
 *
 * @format
 */

import type { ComponentType } from 'react';
import { ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  Button,
  Card,
  Header,
  TextField,
  colors,
  spacing,
} from '@matr1xp/ui';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        <Card title="Welcome" subtitle="Your shell components in action">
          <TextField label="Email" placeholder="you@example.com" />
          <Button label="Continue" />
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
});

let Root: ComponentType = App;

if (process.env.STORYBOOK_ENABLED === 'true') {
  Root = require('./.rnstorybook').default;
}

export default Root;
