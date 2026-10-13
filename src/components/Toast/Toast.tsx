import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, radius, spacing, typography } from '../../theme';

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';

export type ToastProps = {
  message: string;
  title?: string;
  variant?: ToastVariant;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  style?: StyleProp<ViewStyle>;
};

export const Toast = ({
  message,
  title,
  variant = 'info',
  actionLabel,
  onAction,
  onDismiss,
  style,
}: ToastProps) => (
  <View
    accessibilityRole="alert"
    accessibilityLiveRegion="polite"
    style={[styles.toast, { borderLeftColor: accentColors[variant] }, style]}
  >
    <View style={styles.body}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <Text style={styles.message}>{message}</Text>
    </View>
    {actionLabel && onAction ? (
      <Pressable
        accessibilityRole="button"
        hitSlop={spacing.sm}
        onPress={onAction}
      >
        <Text style={[styles.action, { color: accentColors[variant] }]}>
          {actionLabel}
        </Text>
      </Pressable>
    ) : null}
    {onDismiss ? (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss"
        hitSlop={spacing.sm}
        onPress={onDismiss}
      >
        <Text style={styles.dismiss}>✕</Text>
      </Pressable>
    ) : null}
  </View>
);

const accentColors: Record<ToastVariant, string> = {
  info: colors.primary,
  success: colors.success,
  warning: colors.warning,
  error: colors.danger,
};

const styles = StyleSheet.create({
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: spacing.md,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderLeftWidth: 4,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  body: { flex: 1, gap: 2 },
  title: { ...typography.label, color: colors.text },
  message: { ...typography.body, fontSize: 14, color: colors.muted },
  action: typography.label,
  dismiss: { ...typography.body, color: colors.muted },
});
