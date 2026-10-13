import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native';
import { StyleSheet, View } from 'react-native';
import { fn } from 'storybook/test';

import { spacing } from '../../theme';
import { Button } from '../Button';
import { Toast, type ToastProps } from './Toast';

const meta = {
  title: 'Components/Toast',
  component: Toast,
  args: {
    message: 'Your changes have been saved.',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error'],
    },
  },
} satisfies Meta<typeof Toast>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Info: Story = {
  args: { variant: 'info', message: 'A new version is available.' },
};

export const Success: Story = {
  args: { variant: 'success', title: 'Saved' },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Low storage',
    message: 'You have less than 500 MB left on this device.',
  },
};

// Not named `Error` to avoid shadowing the global Error constructor.
export const ErrorToast: Story = {
  name: 'Error',
  args: {
    variant: 'error',
    title: 'Upload failed',
    message: 'Check your connection and try again.',
  },
};

export const WithAction: Story = {
  args: {
    variant: 'info',
    message: 'Message archived.',
    actionLabel: 'Undo',
    onAction: fn(),
  },
};

type ToastDemoProps = ToastProps & {
  initiallyVisible?: boolean;
  autoHideMs?: number;
};

// Toast is presentational: the screen that renders it owns visibility.
// This demo plays that role so dismissing and auto-hiding can be tried out.
const ToastDemo = ({
  initiallyVisible = false,
  autoHideMs,
  onDismiss,
  ...props
}: ToastDemoProps) => {
  const [visible, setVisible] = useState(initiallyVisible);

  useEffect(() => {
    if (!visible || !autoHideMs) {
      return;
    }
    const timer = setTimeout(() => setVisible(false), autoHideMs);
    return () => clearTimeout(timer);
  }, [visible, autoHideMs]);

  const dismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  return (
    <View style={styles.demo}>
      <Button
        label="Show toast"
        disabled={visible}
        onPress={() => setVisible(true)}
      />
      {visible ? <Toast {...props} onDismiss={dismiss} /> : null}
    </View>
  );
};

export const Dismissible: Story = {
  args: {
    variant: 'success',
    title: 'Profile updated',
    message: 'Tap ✕ to dismiss.',
    onDismiss: fn(),
  },
  render: args => <ToastDemo {...args} initiallyVisible />,
};

const AUTO_HIDE_MS = 3000;

export const Interactive: Story = {
  args: {
    variant: 'success',
    title: 'Saved',
    message: `This toast hides itself after ${AUTO_HIDE_MS / 1000} seconds.`,
    onDismiss: fn(),
  },
  render: args => <ToastDemo {...args} autoHideMs={AUTO_HIDE_MS} />,
};

const styles = StyleSheet.create({
  demo: { gap: spacing.md },
});
