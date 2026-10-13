import type { Meta, StoryObj } from '@storybook/react-native';
import { StyleSheet, Text } from 'react-native';
import { fn } from 'storybook/test';

import { colors, typography } from '../../theme';
import { Button } from '../Button';
import { Card } from './Card';

const styles = StyleSheet.create({
  body: { ...typography.body, color: colors.text },
});

const meta = {
  title: 'Components/Card',
  component: Card,
  args: {
    title: 'Card title',
    subtitle: 'A short supporting line',
  },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <Text style={styles.body}>
        Cards group related content and actions. Replace this text with your
        own content.
      </Text>
    ),
  },
};

export const WithActions: Story = {
  args: {
    children: <Text style={styles.body}>Do you want to save your changes?</Text>,
    footer: (
      <>
        <Button label="Save" size="small" onPress={fn()} />
        <Button
          label="Cancel"
          size="small"
          variant="secondary"
          onPress={fn()}
        />
      </>
    ),
  },
};

export const TitleOnly: Story = {
  args: { subtitle: undefined },
};
