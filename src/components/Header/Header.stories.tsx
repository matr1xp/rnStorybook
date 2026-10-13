import type { Meta, StoryObj } from '@storybook/react-native';
import { fn } from 'storybook/test';

import { Header } from './Header';

const meta = {
  title: 'Components/Header',
  component: Header,
  args: {
    onLogin: fn(),
    onLogout: fn(),
    onCreateAccount: fn(),
  },
} satisfies Meta<typeof Header>;

export default meta;

type Story = StoryObj<typeof meta>;

export const LoggedOut: Story = {};

export const LoggedIn: Story = {
  args: { user: { name: 'Jane Doe' } },
};
