# @sazabi/react-native

Capture what happens in your mobile app with `@sazabi/react-native`, the official Sazabi React Native SDK. It emits a session-scoped stream of screen changes, touches, console output, JavaScript errors, and network calls as OTLP log records, and injects W3C trace context into your API requests so a symptom in the app and its backend cause share a trace id.

`@sazabi/react-native` is a pure JavaScript library you install in your own React Native or Expo app. No native module, no config plugin, and it runs in Expo Go. It lets you:

- Follow a single user's session from launch to error, across launches when you give it a storage adapter
- Catch uncaught JavaScript errors, fatal ones and React render errors included, and unhandled promise rejections with stack traces
- See every touch as an episode, with taps and rage taps derived from them
- Join mobile network calls to backend logs on a shared `trace_id`
- Use AI to investigate a mobile session end to end

Designed to never break your app: every hook is wrapped, every patch is reversible, and typed text is never captured.

## Install

```sh
npm install @sazabi/react-native
# or: bun add / pnpm add / yarn add
```

Needs React Native 0.76 or later (Expo SDK 52 or later).

The package ships ES modules with a `react-native` field, so `@sazabi/react-native/register` resolves on Metro with or without package exports (React Native 0.76 to 0.78 and Expo SDK 52 have them off by default). Jest does not transform `node_modules` unless told to; React Native's Jest preset only transforms React Native's own packages, so add the SDK to the exception in your Jest config:

```js
transformIgnorePatterns: [
  "node_modules/(?!((jest-)?react-native|@react-native(-community)?|@sazabi/react-native)/)",
],
```

## Get your intake URL

Sign in to Sazabi, go to **Settings > Log streams**, choose **Sazabi React Native SDK**, and click **Add**. Sazabi shows your complete intake URL at the top of the setup screen.

That URL is all the SDK needs. It embeds a write-only public key, which is why it is safe to ship in your app bundle: it can write telemetry into your project and never read from it.

## Quick start

```ts
// Import first: a module that runs earlier can capture the native
// XMLHttpRequest methods before the SDK wraps them.
import "@sazabi/react-native/register";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { init } from "@sazabi/react-native";

init({
  intakeUrl: "https://<your-intake-host>.intake.sazabi.com",
  serviceName: "my-mobile-app",
  storage: AsyncStorage, // optional: sessions across launches, crash outbox
});
```

Wrap your app in `<SazabiRoot>` once, as the outermost component (outside your own error boundaries and providers): it observes touches and records render errors that would otherwise crash the app unrecorded.

```tsx
import { SazabiRoot, trackNavigation } from "@sazabi/react-native";

export default function App() {
  const navigationRef = useNavigationContainerRef();
  useEffect(() => trackNavigation(navigationRef), [navigationRef]);
  return (
    <SazabiRoot>
      <NavigationContainer ref={navigationRef}>{/* screens */}</NavigationContainer>
    </SazabiRoot>
  );
}
```

## Configuration

`init()` takes one object. Only `serviceName` and `intakeUrl` are needed; every other option has a default.

| Option | Default | What it does |
|--------|---------|--------------|
| `intakeUrl` | none | Your intake URL from the setup screen, with or without `/v1/logs` |
| `serviceName` | required | The name your app's events are filed under |
| `serviceVersion` | none | Your app version, such as the marketing version or a git SHA |
| `environment` | none | Deployment environment, such as `production` |
| `storage` | none | Key-value store for sessions across launches, the crash outbox, and the saved queue (see [Crashes](#crashes)). Without it, a session lasts one launch |
| `publicKey` | from `intakeUrl` | Set only for a proxy or custom endpoint whose hostname carries no key |
| `consent` | none | Function returning `true` or a promise of it; capture waits until it resolves `true` and stays off on `false` |
| `network.capture` | `true` | Record `fetch` and `XMLHttpRequest` calls |
| `network.propagateTraceContext` | `true` | Inject `traceparent` into outgoing requests |
| `network.allowlist` | every request | Hosts that get `traceparent` (see [Correlate with your backend](#correlate-with-your-backend)) |
| `network.redactQueryParams` | built-in list | Extra query parameter names to redact (see [Captured URLs](#captured-urls)) |
| `network.requestIdHeaders` | `["x-request-id", "cf-ray", "x-vercel-id", "x-amz-cf-id", "fly-request-id"]` | Response headers to read a request id from, recorded as `app.network.request_id`; set `[]` to turn this off |
| `network.sampledFlag` | `false` | Mark SDK-started traces as sampled (`-01`) for backends that sample on the parent's flag |
| `console.capture` | `true` | Mirror console output |
| `console.levels` | `["error", "warn"]` | Console levels to mirror |
| `pointer.capture` | `true` | Record touches and the taps derived from them |
| `errors.unhandledRejections` | `true` | Track unhandled promise rejections (see [Other crash reporters](#other-crash-reporters)) |
| `errors.previousRejectionTracker` | none | Another library's rejection tracker to keep running |
| `beforeSend` | none | Edit or drop each event before it is queued (see [Edit or drop events](#edit-or-drop-events)) |
| `flushIntervalMs` | `5000` | How often batches are sent |
| `maxBatchBytes` | `57344` | Soft cap on each request body, in bytes |
| `maxQueuedEvents` | `500` | Events held while the intake is unreachable, at most 1 MiB |

The package also exports `log()` and `addEvent()` for your own rows, `identify()` and `reset()` for users, `flush()` to send now, and `shutdown()` to stop capture and restore everything the SDK patched.

## What gets captured

Every event carries `session.id`, a per-launch `session.window_id`, `session.distinct_id`, and the current screen, so one user's activity reads as a single ordered timeline. The `app.event_type` attribute names the kind:

| `app.event_type` | Contents |
|------------------|----------|
| `navigation` | Screen changes from your navigation container: route name, pathname, param keys (never values) |
| `pointer` | One episode per touch from down to up: coordinates, distance, duration, pressure, concurrent touches, a shared gesture id, and a once-per-second path sample; long touches emit partial rows every ten seconds. A touch a native scroll view takes over ends there with `app.pointer.ended_by: cancel` |
| `click` / `rage_click` | Taps derived from short, still touches, named from `sazabiName`, `accessibilityLabel`, or `testID` (`app.widget.name`), and the rapid repeat taps that signal frustration |
| `error` | JavaScript errors with `exception.type`, `exception.message`, and `exception.stacktrace`; `app.error.kind` is `uncaught`, `fatal`, or `unhandledrejection`. `fatal` and `uncaught` are React Native's own `isFatal` flag: a development build reports an uncaught error as fatal even though the red box keeps the app alive. A render error caught by `<SazabiRoot>` is always `fatal`. One row per error: the `console.error` line React Native prints for it is not recorded again as a `log` row |
| `network` | Every `fetch` and `XMLHttpRequest` call with method, status, and duration, plus the trace context injected into it; sensitive query parameters are redacted in `url.full` (see [Captured URLs](#captured-urls)). Uploads to the Sazabi intake are never rows, and in development neither is traffic to the Metro dev server (LogBox symbolication, bundle status) |
| `log` | Mirrored `console.error` / `console.warn` output, plus anything you send with `log()` |
| `custom` | Marks you add with `addEvent()` |
| `lifecycle` | The app going to the background and coming back |
| `sdk_health` | The SDK's own delivery trouble, once per condition per launch (see [SDK health](#sdk-health)) |

## Correlate with your backend

By default the SDK injects a W3C `traceparent` header into every request your app makes: a native app has no origin and no CORS preflight, so there is no same-origin default to fall back on. Requests to the Sazabi intake are never injected, and in development neither are requests to the Metro dev server. Use `network.allowlist` to choose which hosts get the header, so third-party APIs never see one:

```ts
init({
  // …
  network: {
    allowlist: ["api.example.com", ".internal.example.com", /^https:\/\/edge-\d+\.example\.net\//],
  },
});
```

A string entry is a host (`api.example.com`; add the port when it is not the default), a domain with every subdomain (`.example.com` matches `example.com` and `api.example.com`), or an origin with an optional path prefix (`https://api.example.com`, `https://example.com/api`). It never matches a URL that merely contains it, so `https://evil.test/?next=api.example.com` gets no header. A RegExp is tested against the full URL. The intake exclusion works the same way: only requests to the intake's own origin are skipped.

`network.propagateTraceContext: false` turns injection off and keeps capture. `@sazabi/browser` takes the same `allowlist` option; there it defaults to same-origin requests only.

Backend log lines that run inside the extracted trace context then share a `trace_id` with the originating request. If your backend runs OpenTelemetry, that extraction already happens by default.

## Captured URLs

Network rows keep the query string in `url.full`, and navigation rows keep a deep link's query string in `url.path` and `app.screen.url`, but replace the value of every sensitive parameter with `[redacted]`: `token`, `access_token`, `refresh_token`, `id_token`, `api_key`, `apikey`, `key`, `secret`, `password`, `signature`, `sig`, `x-amz-signature`, `x-amz-credential`, `x-goog-signature`, `sentry_key`, `authorization`, `auth`, `session`, `sid`, and `code`. Names match case-insensitively, in the query and in the fragment. Credentials in the URL (`user:pass@`) are never recorded. Add your own parameter names with `network.redactQueryParams` (strings match a name exactly, RegExps are tested against the name, from the start each time, so a `g` flag is safe):

```ts
init({
  // …
  network: { redactQueryParams: ["tenant", /^x-myco-/i] },
});
```

`@sazabi/browser` takes the same option.

## Name what users touch

Taps are named from `accessibilityLabel` or `testID`. To give an element a name of your own, or to keep a name out of telemetry, set `sazabiName` or `sazabiMask` on it. Both are typed on `View`, `Pressable`, `Text`, and the `Touchable*` components as soon as you import the SDK:

```tsx
<Pressable sazabiName="Pay now" onPress={pay}>…</Pressable>
<View sazabiMask>{/* names inside here are never sent */}</View>
```

## Identify users

```ts
import { identify, reset } from "@sazabi/react-native";

identify("user_123", { plan: "pro" }); // on sign-in, use your internal id, not an email
reset(); // on sign-out
```

## Crashes

A fatal JavaScript error terminates the app once React Native's handler returns, and so does an error thrown while React renders your components. `<SazabiRoot>` catches a render error, records it as `fatal`, and rethrows it, so React Native handles it exactly as before; only errors inside `<SazabiRoot>` are seen.

With a `storage` adapter, the SDK writes the pending events (the error included) to an outbox before the app terminates, and the next launch posts them; whatever the intake does not accept stays for the launch after. A crash before the stored session has been read is saved under a fresh session.

Each crash is written under its own key (`sazabi.outbox.<id>`) and only then listed in the outbox index, so a crash writes a few kilobytes rather than rewriting every stored report.

- **Synchronous store (MMKV):** the write is on disk before the app terminates, so the crash is delivered exactly once. The dying app sends nothing it could not clear afterwards; if it is still running two seconds after the error (a development build, a handler that does not terminate), it posts the outbox itself. This is the reliable choice for crash reports.
- **AsyncStorage:** writes are asynchronous and React Native terminates the process within milliseconds of a fatal error, so a crash that happens within tens of milliseconds of a prior large write (another crash report, a big app write queued ahead of it) can be lost. The SDK also sends the batch at once. When both the write and the send land, the next launch posts the batch again; every row of one crash batch carries the same `app.outbox.id`, so the copy is recognizable.

The crash's own key and the index are two writes, and the process can die between them (seen on Android), leaving a report under its key that no index lists. When the adapter has `getAllKeys` (AsyncStorage and MMKV both do), the next launch lists the store's keys once, beside its read of the index, and treats every `sazabi.outbox.<id>` key the index does not name as a stored report: it is listed, posted, and removed like any other, and one that is not valid JSON is deleted with the same warning. Keys outside the `sazabi.outbox.` prefix are never read or touched. Without `getAllKeys` such a report is not found.

That works because every store keeps one order: a report's key is written before the index lists it and removed before the index stops listing it. A delivered report whose cleanup the process did not finish therefore leaves a listed id with no key, which the next launch drops, never an unlisted key it would post again. A key the store refuses to remove is overwritten with an empty list and goes on the next launch; only a key the store refuses to touch at all stays listed with its contents and is posted again, under the same `app.outbox.id`.

The `storage` option takes any object with `getItem`, `setItem`, and `removeItem`, plus `getAllKeys` when it has one. To use [`react-native-mmkv`](https://github.com/mrousavy/react-native-mmkv), wrap it in that shape:

```ts
import { MMKV } from "react-native-mmkv";
import { init } from "@sazabi/react-native";

const mmkv = new MMKV({ id: "sazabi" });

init({
  // …
  storage: {
    getItem: (key) => mmkv.getString(key) ?? null,
    setItem: (key, value) => mmkv.set(key, value),
    removeItem: (key) => mmkv.delete(key),
    getAllKeys: () => mmkv.getAllKeys(),
  },
});
```

Without a `storage` adapter, the SDK only attempts an immediate send.

## Other crash reporters

React Native has one slot for unhandled promise rejection tracking, and the last library to claim it silences the others. Hermes gives no way to read or wrap that slot (`HermesInternal` is frozen and its global cannot be reassigned), so `init()` replaces whatever holds it, and a library initialized after `init()` replaces the SDK's tracker in turn; neither side can tell. Your options:

- Hand the SDK a tracker to run after its own on every rejection. Most crash reporters (Sentry, Bugsnag) install theirs inline and do not expose it, so write the hand-off yourself against their capture API:

  ```ts
  init({
    // …
    errors: {
      previousRejectionTracker: {
        allRejections: true,
        onUnhandled: (id, rejection) => Sentry.captureException(rejection),
      },
    },
  });
  ```

- Leave the slot to the other SDK with `errors: { unhandledRejections: false }`; the SDK then records no `unhandledrejection` rows.
- Initialize the other SDK after `init()` and accept that the SDK records no `unhandledrejection` rows.

In development the SDK prints one note when it takes the slot with neither option set. Global error handlers (`ErrorUtils`) always chain, in any order.

Anything thrown is recorded once and never throws back into your app: a string, a plain or circular object, an `Error` with a circular `cause`, or a 300 KB message. Message and stack are cut to 4,096 characters.

Native crashes, ANRs, and app-start metrics are not captured, and release-build stack traces are Hermes bytecode offsets: the SDK does not upload source maps.

## Delivery and offline behavior

Events are batched and posted every five seconds, and whenever the app leaves the foreground. What the SDK does with a batch depends on the intake's answer:

| Intake answer | What the SDK does |
|---------------|-------------------|
| 2xx | Done |
| 408, 429, 5xx, network error, no answer in 30 s | Keeps the batch and retries with exponential backoff (1 s doubling to a 60 s cap, with jitter), or after `Retry-After` when that is longer (up to 5 minutes). `flush()` sends nothing during the backoff |
| 413 | Splits the batch in half and sends each half; a single event that is still too large is dropped. If the first half gets a retryable answer, the second half waits out the same backoff |
| Any other 4xx (400, 401, 403, 404, ...) | Drops the batch; it is never retried |

Delivery is at least once: a batch that timed out may have been accepted and is sent again.

While the device is offline, the SDK holds at most `maxQueuedEvents` events (default 500) and at most 1 MiB, and drops the oldest first; a single event larger than 1 MiB is dropped when it is captured. A dropped batch, a full queue, and an oversized event each print one `[@sazabi/react-native]` console warning per launch, and the first event delivered after a drop carries `app.sdk.dropped_events` with the number lost.

Every upload names the SDK in an `x-sazabi-sdk` header (`@sazabi/react-native/<version>`), so Sazabi can tell a misconfigured app from random traffic even when it rejects the request.

### Edit or drop events

`beforeSend` runs on every event before it is queued; return the event (edited or as given) to send it, or `null` to drop it. A request that fails with no response looks the same to the runtime whether the connection dropped or a policy refused it, so the SDK records every such failure at `ERROR`; your app can decide otherwise:

```ts
init({
  intakeUrl: "https://<key>.us-west-2.intake.sazabi.com",
  serviceName: "my-app",
  beforeSend: (event) =>
    event.type === "network" &&
    event.attributes["http.response.status_code"] === undefined &&
    Number(event.attributes["app.network.duration_ms"]) >= 10_000
      ? { ...event, severity: "DEBUG" }
      : event,
});
```

A hook that throws drops the event and prints one `[@sazabi/react-native]` console warning per launch; an event captured synchronously while the hook runs (a `log()` inside it) is dropped rather than fed back into the hook. A request the hook makes produces its own network event once it completes, which the hook sees like any other, so a hook that forwards events must exclude its own requests.

### SDK health

The SDK reports its own delivery trouble as `app.event_type: sdk_health` rows, INFO severity, with `app.sdk.diagnostic` naming the condition: `intake_rejected` (a batch refused for good with a 4xx other than 408 and 429; `app.sdk.http_status` carries the status), `intake_unreachable` (uploads failed on the network or timed out and the intake later answered; `app.sdk.attempts` counts the failed tries, with uploads that failed together counted once), `outbox_discarded` (stored crash reports dropped by the outbox caps or because they were not valid reports, reported by the launch that found them; `app.sdk.outbox_discarded` counts what is known lost, and `app.sdk.outbox_unsaved` counts events a saved queue had left out at its caps, which may or may not have been uploaded before the app was killed), and `outbox_persist_failed` (the storage adapter refused to write the crash outbox or the saved queue). Each condition is reported at most once per launch, so a row the intake refuses is never reported again and a flapping network produces one row, not one per outage. A crash that overfilled the store in a dying process is reported by the next launch; one that refused a write in a dying process is not. Nothing here changes how your events are handled, and the rows never throw into your app.

The crash outbox follows the same rules across launches. A stored report the intake refuses with a 4xx other than 408 and 429 is deleted with the same warning, and so is a stored entry that is not valid JSON. Anything retryable stays for the next launch. The outbox keeps at most 20 envelopes and 512 KB, newest first.

With a `storage` adapter, the SDK also saves the queue each time the app leaves the foreground, before it flushes, because the OS can kill a backgrounded app without warning, and an offline queue would die with it. The copy is removed as soon as everything queued has been delivered; otherwise the next launch posts it. Events whose upload is still out when the app leaves the foreground a second time (iOS passes through `inactive` to `background`) stay in the copy, and a copy whose events were dropped undelivered (a full queue, or `shutdown()` while offline) is kept for the next launch. The saved copy holds at most the newest 20 envelopes and 512 KB of the queue (a launch that replays a copy the caps cut reports how many events were left out as `app.sdk.outbox_unsaved` on its `outbox_discarded` row: the live upload sends the oldest first, so they may have reached the intake before the kill, and nothing is known lost), and events captured after the app went to the background are saved only the next time it does. If the live upload reached the intake but the app was killed before the answer came back, the next launch posts the copy too; both carry the same `app.outbox.id`.

## Device attributes

Every request carries `os.name` (`ios` or `android`) and `os.version`. On Android it also carries `device.manufacturer` and `device.model.identifier` from `Platform.constants`. On iOS it carries `device.manufacturer: "Apple"` and `device.type` (`phone`, `pad`, `tv`, `mac`, `vision`, or `carplay`): iOS exposes no model to JavaScript without a native module.

## Web builds

Under react-native-web the SDK installs nothing and warns once per launch; use [`@sazabi/browser`](https://www.npmjs.com/package/@sazabi/browser) for that build. A universal app can initialize both, and exactly one activates per platform.

## Support

Sazabi documentation is at [docs.sazabi.com](https://docs.sazabi.com). For help, email [support@sazabi.ai](mailto:support@sazabi.ai).

This package is developed in Sazabi's private monorepo. Each release is published to npm from [github.com/sazabi/react-native](https://github.com/sazabi/react-native), its release mirror.
