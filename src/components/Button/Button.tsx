import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, radius, spacing, typography } from '../../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

export type ButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const Button = ({
  label,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled,
  style,
  ...rest
}: ButtonProps) => {
  const isDisabled = disabled || loading;
  const textColor = textColors[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        sizeStyles[size],
        variantStyles[variant],
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      )}
    </Pressable>
  );
};

const textColors: Record<ButtonVariant, string> = {
  primary: colors.primaryText,
  secondary: colors.secondaryText,
  danger: colors.primaryText,
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  label: typography.label,
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.5 },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: colors.primary },
  secondary: {
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  danger: { backgroundColor: colors.danger },
});

const sizeStyles = StyleSheet.create({
  small: { paddingVertical: spacing.xs + 2, paddingHorizontal: spacing.md },
  medium: { paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.lg },
  large: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl },
});
