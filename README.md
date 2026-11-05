# @sazabi/react-native

Capture what happens in your mobile app with `@sazabi/react-native`, the official Sazabi React Native SDK. It emits a session-scoped stream of screen changes, touches, console output, JavaScript errors, and network calls as OTLP log records, and injects W3C trace context into your API requests so a symptom in the app and its backend cause share a trace id.

Pure JavaScript, no native module, runs in Expo Go. Documentation: [docs.sazabi.com/reference/react-native-sdk](https://docs.sazabi.com/reference/react-native-sdk).

## Install

```sh
npm install @sazabi/react-native
```

The SDK has no dependencies. The quick start below also installs
`@react-native-async-storage/async-storage` so sessions survive a relaunch and
a crash is saved for the next one; any key-value store with `getItem`,
`setItem`, and `removeItem` works, and `storage` can be left out entirely.

```sh
npm install @react-native-async-storage/async-storage
```

## Quick start

```ts
import "@sazabi/react-native/register";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { init } from "@sazabi/react-native";

init({
  intakeUrl: "https://<your-intake-host>.intake.sazabi.com",
  serviceName: "my-mobile-app",
  storage: AsyncStorage,
});
```

Wrap your root in `<SazabiRoot>` and pass your navigation container ref to `trackNavigation()` to capture touches and screens. The full guide is at [docs.sazabi.com/guides/instrument/react-native](https://docs.sazabi.com/guides/instrument/react-native).

## About this repository

This is a release mirror. The SDK is developed in the private Sazabi monorepo; each release lands here as the exact content published to npm via trusted publishing (OIDC). Do not commit directly: content flows here through the release pipeline and direct commits are overwritten on the next release.
