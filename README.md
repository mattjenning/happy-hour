# Happy Hour

A phone app that shows which deals are running right now, starting with Bed-Stuy, Brooklyn. It covers drink happy hours and food specials such as wing nights.

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
| `src/app/index.tsx` | The one screen: deals on now, nearest first |
| `src/lib/deals.ts` | Pure logic: which deals are running and for how long. No screen code. |
| `src/lib/distance.ts` | Pure logic: distance between two points |
| `src/hooks/use-here.ts` | Asks the phone where it is |
| `src/data/deals.ts` | The `Deal` shape, the real deals, and the rules for adding one |
| `scripts/check-deals.mts` | Checks for the logic and for the deal data |

## Decisions

- **Expo and Expo Go.** Built on Windows, previewed on an iPhone, no Mac needed.
- **One screen.** The first version answers one question: what is on right now.
- **Logic apart from the screen.** The logic is tested without a phone.
- **Every deal carries a source link and a last-checked date.** A deal with neither is not shown as real.

- **Nearest first.** The list is ordered by distance from the phone. If location is off, it falls back to soonest-ending first and says so.
- **Location stays on the phone.** It is used to sort the list and is never sent anywhere.

- **Drinks and food.** Every deal is tagged drinks, food or both, and the list can be narrowed to either.

## Roadmap

1. Real Bed-Stuy deals, each with a source and a date. Started: 12 venues from published guides, listing sites and the bars' own Instagram posts. Next: a sweep for food specials. Next: confirm them in person.
2. Deal data moves out of the app into a file the app downloads, so data can refresh without a new build.
3. A scheduled refresh that re-checks each deal.
4. A way to flag a deal as wrong.

Later: a map, a weekly schedule, more neighborhoods, an App Store release.
