# Sharing the UI components across projects

This guide turns the components in this repo into a versioned package that any number of React Native apps can install. Each app chooses which version it uses and when to upgrade. Work on `main` reaches an app only when that app upgrades.

> The package is published as `@matr1xp/ui`. GitHub Packages requires the scope to match the account that owns the repo, which here is `matr1xp` ([matr1xp/rnStorybook](https://github.com/matr1xp/rnStorybook)).
>
> Steps 1 and 2 have already been done in this repo. They stay in this guide as a record of what changed and why. Start at step 3 to publish.

## Contents

- [How it works](#how-it-works)
- [1. Restructure this repo into workspaces](#1-restructure-this-repo-into-workspaces)
- [2. Build the package with Bob](#2-build-the-package-with-bob)
- [3. Set up the registry](#3-set-up-the-registry)
- [4. Version and release with Changesets](#4-version-and-release-with-changesets)
- [5. Use the package in an app](#5-use-the-package-in-an-app)
- [6. Fixing an older major version](#6-fixing-an-older-major-version)
- [Adding more packages](#adding-more-packages)
- [Release checklist](#release-checklist)
- [Troubleshooting](#troubleshooting)
- [References](#references)

## How it works

```
packages/ui  (source on main, developed in Storybook)
     │
     │  npx changeset version  →  npx changeset publish
     ▼
GitHub Packages   1.2.0      1.3.0      1.4.0-next.0  (dist-tag "next")
                    ▲          ▲            ▲
                  app-a      app-b        app-c, trying a prerelease
```

Three things keep the apps unaffected by work on `main`:

1. **Apps install from the registry, not from this repo.** Committing to `main` doesn't change anything in the registry. A new version exists only after you run the release step.
2. **Published versions never change.** The registry refuses to publish the same version number twice, so `1.3.0` always contains the same code.
3. **Apps pin an exact version.** With `"@matr1xp/ui": "1.3.0"` (not `^1.3.0`), not even `npm update` moves an app to a newer release. Upgrading is a deliberate change in that app's repo.

Storybook (`apps/storybook`) is the workbench where components are built and reviewed. It reads the package's TypeScript source directly, so it always shows what's on `main`. It is never published.

### Why these components package easily

The components import only `react`, `react-native` and the theme. They use no native modules, so apps that install the package need no CocoaPods or Gradle changes. The native libraries in this repo's `package.json` (Reanimated, Gesture Handler, SVG and others) are used by the Storybook app, not by the components.

Keep it that way if you can. A component that needs a native library makes that library a peer dependency, and every app then has to install and link it.

## 1. Restructure this repo into workspaces

The repo becomes an npm workspace with two parts: the package and the Storybook app.

```
<repo root>/
├── package.json             # workspace root (private)
├── package-lock.json        # the only lockfile
├── .changeset/              # created in step 4
├── .eslintrc.js  .prettierrc.js  .watchmanconfig  .gitignore  .npmrc
├── docs/
├── packages/
│   └── ui/                  # @matr1xp/ui, the published package
│       ├── package.json
│       ├── tsconfig.json
│       ├── CHANGELOG.md     # written by Changesets
│       └── src/
│           ├── index.ts
│           ├── components/  # components and their stories
│           └── theme/
└── apps/
    └── storybook/           # this app: ios/, android/, .rnstorybook/, App.tsx
```

Run commands from the repo root unless a step says otherwise.

### 1.1 Move the files

```bash
mkdir -p apps/storybook packages/ui/src

# The components and the theme become the package
mv src/components packages/ui/src/components
mv src/theme packages/ui/src/theme
rmdir src

# Everything else that belongs to the app, including vendor/ (gems installed by Bundler)
mv .bundle .rnstorybook __tests__ android ios \
  App.tsx Gemfile Gemfile.lock app.json babel.config.js index.js \
  jest.config.js metro.config.js package.json tsconfig.json vendor \
  apps/storybook/

# Install output; the new layout regenerates it
rm -rf node_modules apps/storybook/ios/Pods apps/storybook/ios/build \
  apps/storybook/android/app/build apps/storybook/android/build
```

Plain `mv` also moves files git doesn't track yet, such as a new component. Git detects the moves as renames when you commit.

These files stay at the root: `.eslintrc.js`, `.prettierrc.js`, `.watchmanconfig`, `.gitignore`, `package-lock.json`, `README.md` and `docs/`.

- ESLint and Prettier look for their config in parent folders, so one copy covers every workspace.
- Keeping `package-lock.json` lets `npm install` reuse the versions it has already resolved.

In `.gitignore`, two patterns start with `/`, so they only match at the root. Change them so they also match inside `apps/storybook`:

```diff
-/vendor/bundle/
+**/vendor/bundle/
-/coverage
+**/coverage
```

### 1.2 Create the root `package.json`

```json
{
  "name": "storybook-workspace",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "start": "npm start -w apps/storybook",
    "storybook": "npm run storybook -w apps/storybook",
    "storybook:generate": "npm run storybook:generate -w apps/storybook",
    "ios": "npm run ios -w apps/storybook",
    "android": "npm run android -w apps/storybook",
    "lint": "npm run lint --workspaces --if-present",
    "typecheck": "npm run typecheck --workspaces --if-present",
    "test": "npm run test --workspaces --if-present"
  },
  "engines": {
    "node": ">=20"
  }
}
```

### 1.3 Create `packages/ui`

For now the package exposes its TypeScript source and is marked private, so it can't be published by accident. Step 2 makes it publishable.

`packages/ui/package.json`:

```json
{
  "name": "@matr1xp/ui",
  "version": "0.1.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  },
  "peerDependencies": {
    "react": "*",
    "react-native": "*"
  },
  "devDependencies": {
    "@react-native/typescript-config": "0.81.6",
    "@storybook/react-native": "^10.6.2",
    "@types/jest": "^29.5.13",
    "@types/react": "^19.1.4",
    "storybook": "^10.6.2",
    "typescript": "^5.8.3"
  }
}
```

- List `react` and `react-native` **only** as peer dependencies. If either appears in `dependencies` or `devDependencies`, the package can end up with its own copy of React, and the components crash with "Invalid hook call".
- The devDependencies are what the story files and `tsc` need. Use the same versions as `apps/storybook/package.json`, so npm installs a single copy of each.

`packages/ui/tsconfig.json`:

```json
{
  "extends": "@react-native/typescript-config",
  "include": ["src"]
}
```

`packages/ui/src/index.ts`:

```ts
export * from './components';
export * from './theme';
```

The components' own imports, such as `'../../theme'` and `'../Button'`, still work because `components/` and `theme/` moved together.

### 1.4 Point `apps/storybook` at the package

**`apps/storybook/package.json`:** add the package to `dependencies`. npm links a workspace package when its version matches the range, and `"*"` matches any version. npm doesn't support the `workspace:` protocol that Yarn and pnpm use.

```json
"@matr1xp/ui": "*"
```

**`apps/storybook/App.tsx`:** replace the two relative imports:

```diff
-import { Button, Card, Header, TextField } from './src/components';
-import { colors, spacing } from './src/theme';
+import { Button, Card, Header, TextField, colors, spacing } from '@matr1xp/ui';
```

**`apps/storybook/.rnstorybook/preview.tsx`:** the canvas decorator uses the theme, so change its import too:

```diff
-import { colors, spacing } from '../src/theme';
+import { colors, spacing } from '@matr1xp/ui';
```

**`apps/storybook/.rnstorybook/main.ts`:** the `stories` glob is relative to `.rnstorybook/`, so it goes up three levels to the repo root:

```ts
stories: ['../../../packages/ui/src/**/*.stories.?(ts|tsx|js|jsx)'],
```

**`apps/storybook/metro.config.js`:** Metro follows the workspace symlinks by itself, but it only sees files inside the project folder and `watchFolders`. Add the repo root:

```js
const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const {
  withStorybook,
} = require('@storybook/react-native/metro/withStorybook');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  // Let Metro see packages/ui and the dependencies npm hoists to the root.
  watchFolders: [monorepoRoot],
  resolver: {
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(monorepoRoot, 'node_modules'),
    ],
  },
};

// When STORYBOOK_ENABLED !== 'true', withStorybook strips Storybook modules
// from the bundle so the regular app ships without them.
module.exports = withStorybook(
  mergeConfig(getDefaultConfig(projectRoot), config),
  {
    enabled: process.env.STORYBOOK_ENABLED === 'true',
    configPath: path.resolve(projectRoot, './.rnstorybook'),
  },
);
```

### 1.5 Fix the Android paths

npm installs `react-native` and `@react-native/*` into the root `node_modules`. The Gradle files still look in `apps/storybook/node_modules`.

In `apps/storybook/android/settings.gradle`, fix both lines that include the Gradle plugin:

```diff
-pluginManagement { includeBuild("../node_modules/@react-native/gradle-plugin") }
+pluginManagement { includeBuild("../../../node_modules/@react-native/gradle-plugin") }
```

```diff
-includeBuild('../node_modules/@react-native/gradle-plugin')
+includeBuild('../../../node_modules/@react-native/gradle-plugin')
```

In `apps/storybook/android/app/build.gradle`, inside the `react { … }` block, uncomment these three settings and point them at the root:

```gradle
reactNativeDir = file("../../../../node_modules/react-native")
codegenDir = file("../../../../node_modules/@react-native/codegen")
cliFile = file("../../../../node_modules/react-native/cli.js")
```

Leave `root` at its default (`../../`, the folder that holds the app's `package.json`).

iOS needs no edits. The `Podfile` finds `react-native` through Node's module resolution, and `pod install` updates `REACT_NATIVE_PATH` in the Xcode project to point at the root.

### 1.6 Install and check

```bash
npm install
npm ls react react-native
(cd apps/storybook/ios && LANG=en_US.UTF-8 pod install)
npm run storybook:generate -w apps/storybook
npm run lint && npm run typecheck && npm run test
```

`npm ls` should show one version each of `react` and `react-native`, with other entries marked "deduped".

Start Storybook (`npm run storybook`). Then, in a second terminal, build the app (`npm run ios` or `npm run android`). Every component in `packages/ui` should be listed. Edit a component in `packages/ui/src` and check that Fast Refresh shows the change.

Then update the commands and paths in `README.md` to match the new layout.

## 2. Build the package with Bob

Apps should install compiled JavaScript and type definitions, not the raw TypeScript source. [react-native-builder-bob](https://oss.callstack.com/react-native-builder-bob/build) is Callstack's build tool for React Native libraries.

### 2.1 Add Bob

```bash
npm install --save-dev react-native-builder-bob -w packages/ui
```

Then add the build config and a `prepare` script to `packages/ui/package.json` (shown in full in step 2.2):

```json
"scripts": {
  "prepare": "bob build"
},
"react-native-builder-bob": {
  "source": "src",
  "output": "lib",
  "targets": [["module", { "esm": true }], "typescript"]
}
```

Build once and look at where the files land, because the entry points in step 2.2 must match:

```bash
npm run prepare -w packages/ui
find packages/ui/lib -maxdepth 2
```

With Bob 0.43, the JavaScript goes to `lib/module/` and the type definitions to `lib/typescript/` (for example `lib/typescript/index.d.ts`).

`npx react-native-builder-bob@latest init`, run inside `packages/ui`, can write this config for you, but it asks its questions interactively.

### 2.2 Finish `packages/ui/package.json`

The finished file:

```json
{
  "name": "@matr1xp/ui",
  "version": "0.1.0",
  "description": "Shared React Native UI components",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/matr1xp/rnStorybook.git",
    "directory": "packages/ui"
  },
  "main": "./lib/module/index.js",
  "types": "./lib/typescript/index.d.ts",
  "exports": {
    ".": {
      "matr1xp-ui-source": "./src/index.ts",
      "types": "./lib/typescript/index.d.ts",
      "default": "./lib/module/index.js"
    },
    "./package.json": "./package.json"
  },
  "files": ["lib", "src", "CHANGELOG.md", "!**/*.stories.*", "!**/__tests__"],
  "scripts": {
    "prepare": "bob build",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  },
  "react-native-builder-bob": {
    "source": "src",
    "output": "lib",
    "targets": [["module", { "esm": true }], "typescript"]
  },
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  },
  "peerDependencies": {
    "react": "^19.1.0",
    "react-native": ">=0.81.0"
  },
  "devDependencies": {
    "@react-native/typescript-config": "0.81.6",
    "@storybook/react-native": "^10.6.2",
    "@types/jest": "^29.5.13",
    "@types/react": "^19.1.4",
    "react-native-builder-bob": "^0.43.2",
    "storybook": "^10.6.2",
    "typescript": "^5.8.3"
  }
}
```

The `lib/...` paths match what Bob 0.43 builds for this package. After upgrading Bob, rebuild and check them with `npm pack --dry-run` (step 2.5). Compared with step 1.3, the changes are:

- **`"private": true` is removed**, so the package can be published.
- **`exports` starts with a `matr1xp-ui-source` condition** pointing at `./src/index.ts`. Storybook asks for this condition (step 2.3) and gets the live source. Apps don't, so they get the compiled `lib` build. The condition is named after the package so it never matches another library's condition. Bob's own generated libraries use the same pattern.
- **`files`** lists what goes into the published tarball. The `!` patterns leave out stories and tests in both `src` and `lib`. `CHANGELOG.md` is included so app developers can read it from `node_modules`.
- **`repository`** must match this repo's GitHub URL. GitHub uses it to link the package to the repo, and the package then inherits the repo's access permissions.
- **`publishConfig.registry`** sends `npm publish` to GitHub Packages instead of the public npm registry.
- **`peerDependencies`** state which React and React Native versions the package supports. List only versions you've tested. Before widening the range for an app on an older React Native, test that app against a prerelease (step 4.6).

### 2.3 Keep Storybook on the source

Without these settings, Storybook would load the last `lib` build, and edits to components wouldn't show up.

In `apps/storybook/metro.config.js`, add the condition inside `resolver`. `react-native` is React Native's default condition, so keep it in the list:

```js
  resolver: {
    unstable_conditionNames: ['react-native', 'matr1xp-ui-source'],
    nodeModulesPaths: [
      // …unchanged
    ],
  },
```

In `apps/storybook/tsconfig.json`, do the same for TypeScript. The base config sets `["react-native"]`, and this replaces it:

```json
{
  "extends": "@react-native/typescript-config",
  "compilerOptions": {
    "customConditions": ["react-native", "matr1xp-ui-source"]
  },
  "include": ["**/*.ts", "**/*.tsx", ".rnstorybook/**/*"],
  "exclude": ["**/node_modules", "**/Pods"]
}
```

In `apps/storybook/jest.config.js`, do the same for Jest. The React Native preset's defaults are `require` and `react-native`:

```js
module.exports = {
  preset: 'react-native',
  testEnvironmentOptions: {
    customExportConditions: ['require', 'react-native', 'matr1xp-ui-source'],
  },
};
```

### 2.4 Ignore the build output

Add this to `.gitignore`:

```
packages/*/lib/
```

Add this to `.eslintrc.js`:

```js
module.exports = {
  root: true,
  extends: '@react-native',
  ignorePatterns: ['lib/'],
};
```

### 2.5 Build and inspect

```bash
npm run prepare -w packages/ui
npm pack --dry-run -w packages/ui
```

`npm pack --dry-run` lists the files that would be published. Check that:

- every path in `main`, `types` and `exports` appears in the list
- no `.stories.` files are listed

## 3. Set up the registry

These steps use GitHub Packages. Any npm-compatible private registry works the same way; only the URL and the login step change.

**Visibility.** A newly published package is private, even though `matr1xp/rnStorybook` is a public repo. Linking a package to a repo passes on the repo's access permissions, not its visibility. You can make the package public later in its settings on GitHub, but that can't be undone. Either way, installing from GitHub Packages always requires a token, even for public packages.

### 3.1 Create a token

GitHub Packages accepts only a **personal access token (classic)**:

- To publish, the token needs the `write:packages` scope, which includes `read:packages`.
- To install, each developer of an app needs a token with `read:packages`.

[Create a classic token with these scopes pre-selected](https://github.com/settings/tokens/new?scopes=write:packages&description=GitHub%20Packages%20npm). Set an expiry date, and copy the token when GitHub shows it; it's displayed only once.

### 3.2 Log in

Each machine that publishes or installs runs this once:

```bash
npm login --scope=@matr1xp --auth-type=legacy --registry=https://npm.pkg.github.com
```

Enter your GitHub username, and paste the token as the password. npm saves the token in your user-level `~/.npmrc`, outside the repo.

Check that it worked; this prints your GitHub username:

```bash
npm whoami --registry=https://npm.pkg.github.com
```

### 3.3 Map the scope to the registry

Create `.npmrc` at the repo root and commit it. It contains no secrets:

```ini
@matr1xp:registry=https://npm.pkg.github.com
```

To confirm npm picks it up, run `npm config get @matr1xp:registry`, which should print `https://npm.pkg.github.com`. Before the first real release, `npm publish --dry-run -w packages/ui` shows the registry and the files a publish would use, without uploading anything.

## 4. Version and release with Changesets

[Changesets](https://changesets.dev) records each change and its version bump in a small file committed with that change. At release time it combines those files into a new version number and a `CHANGELOG.md`, publishes the package, and tags the release in git. Private workspaces such as `apps/storybook` are never versioned or published.

### 4.1 Set up

```bash
npm install --save-dev @changesets/cli
npx changeset init
```

npm picks the newest Changesets version that supports your Node version. Changesets 3 requires Node 22.11+, 24 or 26+, so on Node 25 npm installs the maintained 2.x line (2.31 here). The commands in this guide work the same in both.

`init` creates a `.changeset/` folder containing a config file. Check that the config has `"baseBranch": "main"` and `"access": "restricted"`, and add `privatePackages` so the Storybook app (a private workspace) is never versioned or tagged:

```json
"privatePackages": { "version": false, "tag": false }
```

Changesets 3 already behaves this way by default, but 2.x versions private packages unless told not to.

Add these scripts to the root `package.json`:

```json
"changeset": "changeset",
"version-packages": "changeset version",
"release": "changeset publish"
```

### 4.2 Record a change

After changing anything in `packages/ui`, run:

```bash
npx changeset
```

Select `@matr1xp/ui`, choose the bump type (step 4.3), and write a one-line summary for app developers. This creates a file in `.changeset/`. Commit it together with the code change.

For a change that doesn't affect apps (a story, a comment, Storybook-only code), skip the changeset, or run `npx changeset --empty` if CI requires one. `npx changeset status` exits with an error when a package changed without a changeset, so you can use it as a CI check on pull requests.

### 4.3 Choose the bump

Apps pin exact versions, so a bump type doesn't move any app by itself. It tells app developers how careful an upgrade needs to be.

| Change                                                                    | Bump  |
| ------------------------------------------------------------------------- | ----- |
| Fix a bug without changing props or the intended look                     | patch |
| Add a component, a prop, a variant or a token                             | minor |
| Restyle that keeps sizes and spacing (for example, a color refinement)    | minor |
| Remove or rename a component, prop, variant or token                      | major |
| Change a prop's type or default value                                     | major |
| Change sizes or spacing that apps lay out around                          | major |
| Raise the minimum `react` or `react-native` version in `peerDependencies` | major |

Release `1.0.0` when the first app starts depending on the package. Below `1.0.0`, npm's `^` ranges treat every minor version as breaking, which makes version numbers harder to read.

### 4.4 Release

```bash
git switch main && git pull
npx changeset version
npm install
```

`changeset version` bumps the version in `packages/ui/package.json`, adds the pending changesets to `packages/ui/CHANGELOG.md`, and deletes the changeset files. `npm install` updates `package-lock.json` to the new version.

Review the diff and commit it, for example as "Release @matr1xp/ui 1.3.0". Then publish and push the tag:

```bash
npx changeset publish
git push --follow-tags
```

`changeset publish` runs `npm publish`, which runs `prepare` (the Bob build) first. It then creates the git tag `@matr1xp/ui@1.3.0`.

### 4.5 Automate releases (optional)

The [Changesets GitHub Action](https://github.com/changesets/action) automates step 4.4:

1. It keeps a "Version Packages" pull request open with the pending version bump and changelog.
2. Merging that pull request publishes the release.

In GitHub Actions, the workflow's `GITHUB_TOKEN` can publish packages that belong to the same repository, if the workflow is granted `packages: write`.

### 4.6 Prereleases

A prerelease lets one app try upcoming changes while the other apps stay on the stable version. Make a stable release first, so older changesets don't end up in the prerelease. Then:

```bash
npx changeset pre enter next
npx changeset version        # for example 1.4.0-next.0
npm install
npx changeset publish        # published under the "next" dist-tag
```

`npm install @matr1xp/ui` keeps resolving to the latest stable version. The app that wants the prerelease installs it by number (step 5.2). Each further `version` + `publish` while in pre mode produces `1.4.0-next.1`, and so on. To return to normal releases:

```bash
npx changeset pre exit
```

Prerelease mode changes how `changeset version` behaves until you exit it. If you just need to check one change in one app, packing a build (step 4.7) is simpler.

### 4.7 Try a build in an app without publishing

```bash
npm pack -w packages/ui
```

This builds the package and writes `matr1xp-ui-<version>.tgz` to the repo root. In the app:

```bash
npm install /path/to/repo/matr1xp-ui-<version>.tgz
```

When you're done testing, go back to a published version (`npm install --save-exact @matr1xp/ui@<version>`), and don't commit the tarball dependency.

## 5. Use the package in an app

Do this once in each app's repo.

### 5.1 Configure npm

Add the same `.npmrc` as in step 3.3 to the app's repo root:

```ini
@matr1xp:registry=https://npm.pkg.github.com
```

Each developer runs the `npm login` command from step 3.2 once, with a token that has `read:packages`.

### 5.2 Install a pinned version

```bash
npm install --save-exact @matr1xp/ui@1.3.0
```

`--save-exact` writes `"1.3.0"` to `package.json` instead of `"^1.3.0"`, so the app stays on that version until someone changes it.

The app's `react` and `react-native` versions must be within the package's `peerDependencies`. npm reports an error if they aren't.

### 5.3 Import components

```tsx
import { Button, Card, colors, spacing } from '@matr1xp/ui';
```

No Metro, Babel or native changes are needed. The package is compiled JavaScript with no native code.

### 5.4 Jest

The React Native Jest preset only transforms `react-native` and `@react-native` packages from `node_modules`. Add `@matr1xp` so Jest can load the ESM build:

```js
module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@matr1xp)/)',
  ],
};
```

If the app already has `transformIgnorePatterns`, add `|@matr1xp` to its existing pattern.

### 5.5 CI

The app's CI needs read access to the package. Use one of:

- A classic token with `read:packages`, stored as a CI secret and written to `.npmrc` before `npm ci`.
- In GitHub Actions, the workflow's `GITHUB_TOKEN`, after you grant the app's repository read access in the package's settings on GitHub.

### 5.6 Upgrade

```bash
npm view @matr1xp/ui versions
```

1. Read `packages/ui/CHANGELOG.md` in this repo, or `node_modules/@matr1xp/ui/CHANGELOG.md` after installing, for the versions between the app's current one and the target.
2. Install the target version:

   ```bash
   npm install --save-exact @matr1xp/ui@1.4.0
   ```

3. Run the app's checks, and look at the screens that use the components that changed.

Each app upgrades on its own schedule. An app on `1.2.0` is unaffected when another app moves to `2.0.0`.

## 6. Fixing an older major version

Sometimes an app that can't move to `2.x` yet needs a fix in `1.x`. Fix it on a maintenance branch that starts at the last `1.x` release tag:

```bash
git switch -c release/1.x @matr1xp/ui@1.6.2
```

Make the fix, add a patch changeset, run `npx changeset version` and `npm install`, and commit. Then publish with a dist-tag other than `latest`, so `latest` keeps pointing at `2.x`:

```bash
npx changeset publish --tag maintenance
git push --follow-tags origin release/1.x
```

The app then installs the fix with `npm install --save-exact @matr1xp/ui@1.6.3`. Cherry-pick the fix to `main` too if it applies there.

## Adding more packages

To split the components into several packages later (for example `@matr1xp/ui`, `@matr1xp/icons` and `@matr1xp/tokens`), add each one under `packages/` with the same setup as `packages/ui`.

- npm workspaces link them to each other and to the Storybook app.
- Changesets versions and publishes each package separately. To release a group of packages in lockstep with the same version number, list them in Changesets' `fixed` option.

## Release checklist

- [ ] `npm run lint`, `npm run typecheck` and `npm run test` pass.
- [ ] Each changed component has been reviewed in Storybook on iOS and Android.
- [ ] `npm pack --dry-run -w packages/ui` lists `lib`, `src` and `CHANGELOG.md`, and no stories.
- [ ] The new `CHANGELOG.md` entries make sense to someone upgrading an app.
- [ ] Any major bump explains in its changelog entry what apps need to change.

## Troubleshooting

**"Invalid hook call" or "Cannot read property 'useState' of null"**
Two copies of React are loaded.

- In this repo, `npm ls react react-native` should show one version of each, and `packages/ui` must list them only in `peerDependencies`.
- In an app, check that it doesn't also bundle the package's React (`npm ls react`).

**Storybook can't resolve `@matr1xp/ui`**

1. Run `npm install` at the repo root, so `node_modules/@matr1xp/ui` links to `packages/ui`.
2. Check `watchFolders` in `apps/storybook/metro.config.js`.
3. Restart Metro. The `storybook` script already passes `--reset-cache`.

**Metro fails with `EADDRINUSE: address already in use :::8081`**
Another Metro server is running, for example one started before the restructure. That server can't build the app anymore, because the repo root no longer contains `index.js` or `metro.config.js`. Stop it. To run both at once, start Metro with `npm run storybook -w apps/storybook -- --port 8082`, and build the iOS app with the matching `RCT_METRO_PORT=8082` build setting.

**Storybook doesn't show component edits**
Metro is loading the `lib` build instead of the source. Check that `unstable_conditionNames` in `apps/storybook/metro.config.js` includes `matr1xp-ui-source`, and that `exports` in `packages/ui/package.json` lists that condition first.

**A story is missing**
Run `npm run storybook:generate -w apps/storybook` and reload. Check that the `stories` glob in `.rnstorybook/main.ts` points at `packages/ui`.

**Android build can't find `@react-native/gradle-plugin` or `react-native`**
A Gradle path still points at `apps/storybook/node_modules`. Find it with `grep -rn node_modules apps/storybook/android` and point it at the root `node_modules` (step 1.5).

**iOS build fails with `react-native-xcode.sh: No such file or directory`**
`REACT_NATIVE_PATH` still points at the old location. Run `pod install` in `apps/storybook/ios` again.

**`npm install` in an app fails with 401, 403 or 404 from npm.pkg.github.com**
One of these is missing:

- the `npm login` from step 3.2
- the `read:packages` scope on the token
- the scope line in the app's `.npmrc`

Without the scope line, npm looks for the package on the public registry and reports 404.

**`npm publish` fails because the version already exists**
Published versions can't be replaced. Add a changeset and release a new version.

**Jest fails with `SyntaxError: Cannot use import statement outside a module` in an app**
Add `@matr1xp` to `transformIgnorePatterns` (step 5.4).

## References

- [Metro configuration](https://metrobundler.dev/docs/configuration): `watchFolders`, `nodeModulesPaths`, package exports and conditions
- [react-native-builder-bob: Build](https://oss.callstack.com/react-native-builder-bob/build) and [ESM support](https://oss.callstack.com/react-native-builder-bob/esm)
- [Changesets: CLI](https://changesets.dev/guide/cli), [config](https://changesets.dev/guide/config) and [prereleases](https://changesets.dev/guide/prereleases)
- [GitHub Packages: working with the npm registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)
- [Storybook for React Native](https://github.com/storybookjs/react-native)
