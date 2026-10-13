import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { colors, radius, spacing, typography } from '../../theme';

export type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label?: string;
  helperText?: string;
  errorText?: string;
  style?: StyleProp<ViewStyle>;
};

export const TextField = ({
  label,
  helperText,
  errorText,
  editable = true,
  style,
  onFocus,
  onBlur,
  ...rest
}: TextFieldProps) => {
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(errorText);

  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        accessibilityLabel={label}
        editable={editable}
        placeholderTextColor={colors.muted}
        style={[
          styles.input,
          focused && styles.inputFocused,
          hasError && styles.inputError,
          !editable && styles.inputDisabled,
        ]}
        onFocus={e => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={e => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...rest}
      />
      {hasError ? (
        <Text style={[styles.hint, styles.errorText]}>{errorText}</Text>
      ) : helperText ? (
        <Text style={styles.hint}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: spacing.xs, alignSelf: 'stretch' },
  label: { ...typography.label, color: colors.text },
  input: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md - 4,
  },
  inputFocused: { borderColor: colors.primary },
  inputError: { borderColor: colors.danger },
  inputDisabled: { backgroundColor: colors.secondary, color: colors.muted },
  hint: { ...typography.caption, color: colors.muted },
  errorText: { color: colors.danger },
});
