# Storybook Starter for React Native

A starter project for building React Native components in isolation with [Storybook for React Native](https://storybook.js.org/tutorials/intro-to-storybook/react-native/en/get-started/).

- **React Native 0.81** (bare CLI project, no Expo), TypeScript, New Architecture
- **Storybook 10** on-device UI with the Controls and Actions add-ons
- Shell components to build on: `Button`, `TextField`, `Card`, `Header`
- Shared design tokens (colors, spacing, radii, typography)

## Prerequisites

Complete the React Native [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide for the platforms you need. This project was set up with:

| Tool | Version |
| --- | --- |
| Node.js | 20 or newer |
| JDK | 17 |
| Xcode | 27 (iOS) |
| CocoaPods | 1.17 (iOS) |
| Android SDK | Platform 36, Build-Tools 36.0.0, NDK 27.1.12297006 |

## Setup

Install JavaScript dependencies:

```sh
npm install
```

### iOS

Install the CocoaPods dependencies. Run this again whenever you add or update a native dependency:

```sh
cd ios
LANG=en_US.UTF-8 pod install
cd ..
```

> If you prefer the CocoaPods version pinned in the `Gemfile`, run `bundle install` once, then use `bundle exec pod install`.

### Android

Gradle needs to know where the Android SDK lives. Either set `ANDROID_HOME` in your shell profile:

```sh
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
```

or create `android/local.properties` (it is git-ignored and machine-specific):

```properties
sdk.dir=/Users/<you>/Library/Android/sdk
```

## Running the app

Running is a two-step process: start **Metro** (the JavaScript bundler) in one terminal, then build and launch the native app from another.

### 1. Start Metro

Choose which experience to load:

```sh
# Storybook UI (browse and tweak components)
npm run storybook

# The regular app
npm start
```

Both scripts start Metro with `--reset-cache`. That is required because the Storybook switch is baked into the bundle at build time. Restart Metro whenever you switch between the two modes.

### 2. Build and launch

With Metro running, in a second terminal:

```sh
# iOS Simulator
npm run ios

# Android Emulator (start an emulator first, or connect a device)
npm run android
```

To speed up Android debug builds, compile only for the running emulator's CPU architecture:

```sh
npx react-native run-android --active-arch-only
```

You only need to rebuild the native app after changing native code or dependencies. For JavaScript changes, just reload:

- **iOS Simulator**: press <kbd>R</kbd> in the Metro terminal, or <kbd>Cmd ⌘</kbd> + <kbd>R</kbd> in the simulator.
- **Android Emulator**: press <kbd>R</kbd> in the Metro terminal, or open the Dev Menu with <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> and choose **Reload**.

> The first bundle after starting Metro is a cold build and can take several minutes, especially with Storybook enabled. Reloads after that are fast.

### Using Storybook

When the app opens in Storybook mode:

- Tap the **☰** menu at the bottom-left to browse stories.
- Tap the icon at the bottom-right to open the add-ons panel. **Controls** lets you edit a story's props live, and **Actions** logs callbacks such as `onPress`.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run storybook` | Starts Metro with Storybook enabled |
| `npm start` | Starts Metro for the regular app |
| `npm run ios` | Builds and launches the iOS app |
| `npm run android` | Builds and launches the Android app |
| `npm run storybook:generate` | Regenerates `.rnstorybook/storybook.requires.ts` |
| `npm run typecheck` | Runs the TypeScript compiler (`tsc --noEmit`) |
| `npm run lint` | Runs ESLint |
| `npm test` | Runs Jest |

## Project structure

```
.rnstorybook/
  main.ts                 # Where stories live + enabled on-device add-ons
  preview.tsx             # Global decorators and parameters for every story
  index.tsx               # Storybook UI entry point
  storybook.requires.ts   # Auto-generated story index (do not edit)
src/
  components/
    Button/               # Button.tsx, Button.stories.tsx, index.ts
    Card/
    Header/
    TextField/
    index.ts              # Re-exports all components
  theme/
    index.ts              # colors, spacing, radius, typography tokens
App.tsx                   # Renders Storybook or the app, based on STORYBOOK_ENABLED
metro.config.js           # Wraps Metro with withStorybook
babel.config.js           # Inlines STORYBOOK_ENABLED; Reanimated worklets plugin
```

### How the Storybook switch works

`npm run storybook` sets `STORYBOOK_ENABLED=true`. This has two effects:

1. `metro.config.js` turns on `withStorybook`. When it is off, Metro strips Storybook modules out of the bundle, so the regular app doesn't ship them.
2. `babel.config.js` inlines `process.env.STORYBOOK_ENABLED`, and `App.tsx` uses it to decide whether to render the Storybook UI or the app.

## Adding a component

1. Create a folder in `src/components/`, for example `src/components/Badge/`.
2. Add the component (`Badge.tsx`), an `index.ts` that re-exports it, and a story file (`Badge.stories.tsx`):

   ```tsx
   import type { Meta, StoryObj } from '@storybook/react-native';

   import { Badge } from './Badge';

   const meta = {
     title: 'Components/Badge',
     component: Badge,
     args: { label: 'New' },
   } satisfies Meta<typeof Badge>;

   export default meta;

   type Story = StoryObj<typeof meta>;

   export const Default: Story = {};
   ```

3. Export it from `src/components/index.ts`.
4. Any `*.stories.tsx` file under `src/` is picked up automatically while Metro runs in Storybook mode. If a new story doesn't appear, run `npm run storybook:generate` and reload.

Use the tokens from `src/theme` instead of hard-coded values, so components stay consistent.

## Troubleshooting

These issues came up while setting up this project. The fixes are already in place.

**`pod install` fails with `Unicode Normalization not appropriate for ASCII-8BIT`**
CocoaPods needs a UTF-8 locale. Run it as `LANG=en_US.UTF-8 pod install`, or add `export LANG=en_US.UTF-8` to your shell profile.

**Xcode build fails with "deployment target … is set to 12.4/13.4"**
Newer Xcode versions reject pods that target iOS versions below 15. The `post_install` hook in `ios/Podfile` raises them. Re-run `pod install` if you see this.

**Xcode build fails in `fmt/format-inl.h` with "call to consteval function … is not a constant expression"**
`fmt` 11, which React Native depends on, doesn't compile with the newer Clang in C++20 mode. The `ios/Podfile` compiles just the `fmt` pod as C++17. Re-run `pod install` if you see this.

**"Bundle React Native code and images" fails with `No such file or directory`**
This happens when the project path contains a space. The build phase in `ios/StorybookStarter.xcodeproj` quotes its script paths so that it works. Keep that change if you regenerate the Xcode project.

**Android build can't find the SDK**
Set `ANDROID_HOME` or create `android/local.properties` as described in [Setup](#android).

**The app shows "Storybook is disabled in the withStorybook metro wrapper"**
Metro was started without `STORYBOOK_ENABLED=true`, but the app expected Storybook, or the other way around. Stop Metro and start it again with the script for the mode you want.

For anything else, see the React Native [Troubleshooting](https://reactnative.dev/docs/troubleshooting) guide.

## Learn more

- [Storybook for React Native docs](https://github.com/storybookjs/react-native)
- [Intro to Storybook: React Native tutorial](https://storybook.js.org/tutorials/intro-to-storybook/react-native/en/get-started/)
- [React Native docs](https://reactnative.dev/docs/getting-started)
