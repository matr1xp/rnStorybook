import type { ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, radius, spacing, typography } from '../../theme';

export type CardProps = {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  footer?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const Card = ({ title, subtitle, children, footer, style }: CardProps) => (
  <View style={[styles.card, style]}>
    {title || subtitle ? (
      <View style={styles.header}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    ) : null}
    {children}
    {footer ? <View style={styles.footer}>{footer}</View> : null}
  </View>
);

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  header: { gap: spacing.xs },
  title: { ...typography.title, color: colors.text },
  subtitle: { ...typography.body, color: colors.muted },
  footer: { flexDirection: 'row', gap: spacing.sm },
});
