import type { Meta, StoryObj } from '@storybook/react-native';
import { fn } from 'storybook/test';

import { TextField } from './TextField';

const meta = {
  title: 'Components/TextField',
  component: TextField,
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
    onChangeText: fn(),
  },
} satisfies Meta<typeof TextField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHelperText: Story = {
  args: { helperText: "We'll never share your email." },
};

export const WithError: Story = {
  args: { value: 'not-an-email', errorText: 'Enter a valid email address.' },
};

export const Disabled: Story = {
  args: { editable: false, value: 'read-only@example.com' },
};
