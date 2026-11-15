# Happy Hour

A phone app that shows which happy hours are running right now, starting with Bed-Stuy, Brooklyn.

The deal data is gathered and refreshed by AI, then spot-checked by a person. That pipeline is the point of the project.

## Run it

```
npx expo start
```

Scan the QR code with an iPhone that has Expo Go. The computer and the phone must be signed in to the same Expo account and on the same Wi-Fi.

## Check it

```
node scripts/check-deals.mts          # logic checks
node node_modules/typescript/bin/tsc --noEmit   # type check
```

Both must pass before any change counts as done.

## Layout

| Path | What it holds |
| --- | --- |
| `src/app/index.tsx` | The one screen: deals on now, soonest-ending first |
| `src/lib/deals.ts` | Pure logic: which deals are running and for how long. No screen code. |
| `src/data/sample-deals.ts` | The `Deal` shape and invented sample deals |
| `scripts/check-deals.mts` | Checks for the logic |

## Decisions

- **Expo and Expo Go.** Built on Windows, previewed on an iPhone, no Mac needed.
- **One screen.** The first version answers one question: what is on right now.
- **Logic apart from the screen.** The logic is tested without a phone.
- **Every deal carries a source link and a last-checked date.** A deal with neither is not shown as real.

## Roadmap

1. Real Bed-Stuy deals, each with a source and a date.
2. Deal data moves out of the app into a file the app downloads, so data can refresh without a new build.
3. A scheduled refresh that re-checks each deal.
4. A way to flag a deal as wrong.

Later: a map, a weekly schedule, more neighborhoods, an App Store release.
