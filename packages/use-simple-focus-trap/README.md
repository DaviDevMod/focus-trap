# use-simple-focus-trap

[![CI-packages](https://github.com/DaviDevMod/use-simple-focus-trap/actions/workflows/ci-packages.yml/badge.svg)](https://github.com/DaviDevMod/use-simple-focus-trap/actions/workflows/ci-packages.yml) [![npm version](https://badgen.net/npm/v/use-simple-focus-trap)](https://www.npmjs.com/package/use-simple-focus-trap) [![license](https://badgen.now.sh/badge/license/MIT)](./LICENSE)

A lightweight React custom hook to trap the focus within an HTML element.

### Features

- Create a simple focus trap :lotus_position:
- Choose an element receiving the initial focus within a trap
- Decide whether to prevent clicks on elements outside of a trap
- Bind different behaviours to the `Esc` key
- Choose an element receiving the focus after a trap is left
- Create a focus trap from inside another one
- Build, demolish, pause and resume a trap at any time

## Installation

```bash
npm install use-simple-focus-trap
```

or

```
yarn add use-simple-focus-trap
```

## Usage

All that is needed to get your simple focus trap up and running is to provide the hook with an `HTMLElement` or the `id` of such element.  
The hook will stop trapping the focus as soon as it is unmounted or whenever the user presses the `Esc` key.

```javascript
import useFocusTrap from 'use-simple-focus-trap';

function MyComponent() {
  useFocusTrap({ root: 'aValidOne' });

  return <h1>The focus is now trapped inside of an HTMLlement with "aValidOne" as id</h1>;
}

export default MyComponent;
```

## Default behaviour

By default (if `root` is the only property provided with a valid value) this is what happens when a focus trap is built:

- Focus is given to the first tabbable descendant of `root`
- The `Tab` and `Shift+Tab` keys cycles through the trap's tabbable elements
- Clicks outside of the trap are prevented
- The trap is demolished when the `Esc` key is pressed or the hook unmounts
- Once the trap is demolished, focus is returned to what was the [active element](https://developer.mozilla.org/en-US/docs/Web/API/Document/activeElement) at the time the hook was called

## Parameters

The hook receives a single parameter being an object with a few optional properties that help customize the beahviour of the trap.

| Name         | Required | Type                            |    Default value    |
| ------------ | -------- | ------------------------------- | :-----------------: |
| root         | No       | `HTMLElement \| string`         |          -          |
| initialFocus | No       | `FocusableElementRef \| string` |   first tabbable    |
| returnFocus  | No       | `FocusableElementRef \| string` | last active element |
| lock         | No       | `boolean \| Function`           |       `true`        |
| escape       | No       | `boolean \| Function`           |       `true`        |

```ts
type FocusableElementRef = HTMLElement | SVGElement | null;

interface TrapConfig {
  root?: HTMLElement | string;
  initialFocus?: FocusableElementRef | string;
  returnFocus?: FocusableElementRef | string;
  lock?: boolean | Function;
  escape?: boolean | Function;
}
```

- **root**  
  It is the element within which the focus has to be trapped.  
  If it's missing or invalid, the hook does nothing.

- **initialFocus**  
  It is the element that will receive the initial focus within the trap.  
  If it's missing or invalid, it defaults to the first tabbable element in the trap.

- **returnFocus**  
  It is the element that will receive the focus once the trap is demolished.  
  If it's missing or invalid, the focus will be returned to what was the active element at the time the trap was built.

- **lock**  
  By default, clicks on elements that are not descendant of the `root` are prevented<sup id="note-reference-1">[[1]](#note-expansion-1)</sup>.  
  If `lock` is set to `false`, clicks behave as usual.  
  If `lock` is provided as a funciton, it will be used as an event handler for clicks outside of the trap, thus it will be called with the `MouseEvent | TouchEvent` in question.

  > <span id="note-expansion-1">[[1]](#note-reference-1)</span> Only `mousedown`, `touchstart`, `click` and the default behavior are prevented. So it's possible to make a specific node outisde of the trap _clickable_ even when `lock` is `true`, for example by listening for `mouseup` events.

- **escape**  
  Whenever the `Esc` key is pressed, the trap is demolished by default.  
  If `escape` is set to `false`, the trap is kept running.  
  If `escape` is provided as a function, it will be executed. Note that in this last case the trap would be kept running, but you can easily demolish it with the help of the hook's return value.

<blockquote id="note-expansion-2-warning">:warning: When providing a property as a function you should <a href="https://reactjs.org/docs/hooks-reference.html#usecallback">memoize</a> it to avoid unintended behaviours. </blockquote>

<details>
<summary>Why?</summary>

> The <a href="#return-value">the return value</a> avoids building two identic traps one on top of the other. It does so by deep-comparing the configuration objects received, but it only shallow-compares functions found in it.  
> So if at every rerender, the return value is called with the same configuration object containing an unmemoized function, it will end up creating a pile of duplicate traps.

Note that the memoization precaution is relevant only when the return value is used to build traps, and even then it may not be necessary depending on how it is used. Furthermore a warning will be shown if two subsequent trap configurations differ only in the reference of a function. So **if you feel confortable in doing so, you can avoid the memoization until a warning shows up.**

</details>

## Return value

The return value is a funciton that can be used to build, demolish, pause and resume a trap.  
This function receives a single argument, being an object of type `TrapsControllerArgs`.

```ts
type TrapsControllerArgs =
  | { action: 'BUILD'; config: TrapConfig }
  | { action: 'DEMOLISH'; config?: never }
  | { action: 'RESUME'; config?: never }
  | { action: 'PAUSE'; config?: never };
```

The hook automatically manages a [stack](<https://en.wikipedia.org/wiki/Stack_(abstract_data_type)>) of focus traps :juggling_person:  
Whenever a new trap is built, the current trap (if any) is paused.  
Whenever a trap is demolished, the previous trap (if any) is resumed.

## Dependencies & Browser Support

The are no dependencies :cherries: and the hook can run in virtually any major browser except IE

The bottleneck is the [MutationObserver API](https://caniuse.com/mdn-api_mutationobserver), which is supported by IE11. However a couple of tweaks are required (even [from your side](https://create-react-app.dev/docs/supported-browsers-features/#supported-browsers)) to make the hook work in IE and since even Microsoft itself started to [drop support for IE](https://docs.microsoft.com/en-us/lifecycle/announcements/internet-explorer-11-end-of-support-windows-10), the hook refrains from supporting it.

## Nice to know

- Each focus trap is stateless and the hook causes rerenders only when a trap is created or demolished :zap:

- A web page can live without focus trap :speak_no_evil:

  So the hook has been built to be resilient and can, for example, be caled with `undefined` without crashing your application :shield:  
  Errors are thrown only in development, for cases like: no valid `root` is provided; at any given time there are no tabbable elements in the trap; it has been attempted to resume, pause or demolish an inexistent trap.

## Special thanks :blue_heart:

The logic for the treatement of edge cases, in matter of browser consistency regarding tab indexes and tabbability, is took from [tabbable](https://github.com/focus-trap/tabbable).

This small library has been around for many years and, at the time of writing, can boast 180 dependant packages and one million weekly downloads while having zero open issues :scream: which makes feel safe about the reliability of the edge case logic.

The reason why _tabbable_ is not being used as a dependency is that it would be an overkill and the hook aims to be as simple and lightweight as possible.

## Contributions

Any kind of contribution is more than welcome! :tada:
