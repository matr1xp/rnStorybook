import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../../theme';
import { Button } from '../Button';

export type HeaderProps = {
  title?: string;
  user?: { name: string };
  onLogin?: () => void;
  onLogout?: () => void;
  onCreateAccount?: () => void;
};

export const Header = ({
  title = 'Acme',
  user,
  onLogin,
  onLogout,
  onCreateAccount,
}: HeaderProps) => (
  <View style={styles.wrapper}>
    <Text style={styles.title}>{title}</Text>
    <View style={styles.actions}>
      {user ? (
        <>
          <Text style={styles.welcome}>
            Welcome, <Text style={styles.userName}>{user.name}</Text>
          </Text>
          <Button
            size="small"
            variant="secondary"
            label="Log out"
            onPress={onLogout}
          />
        </>
      ) : (
        <>
          <Button
            size="small"
            variant="secondary"
            label="Log in"
            onPress={onLogin}
          />
          <Button size="small" label="Sign up" onPress={onCreateAccount} />
        </>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md - 1,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: colors.surface,
  },
  title: { ...typography.title, fontWeight: '900', color: colors.text },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  welcome: { ...typography.body, color: colors.text },
  userName: { fontWeight: '700' },
});
