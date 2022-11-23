# single-focus-trap

[![CI-packages](https://github.com/DaviDevMod/focus-trap/actions/workflows/ci-packages.yml/badge.svg)](https://github.com/DaviDevMod/focus-trap/actions/workflows/ci-packages.yml) [![shared-e2e](https://github.com/DaviDevMod/focus-trap/actions/workflows/shared-e2e.yml/badge.svg)](https://github.com/DaviDevMod/focus-trap/actions/workflows/shared-e2e.yml) [![codecov](https://codecov.io/gh/DaviDevMod/focus-trap/branch/main/graph/badge.svg?flag=single-focus-trap)](https://codecov.io/gh/DaviDevMod/focus-trap) [![npm version](https://badgen.net/npm/v/single-focus-trap)](https://www.npmjs.com/package/single-focus-trap) [![license](https://badgen.now.sh/badge/license/MIT)](./LICENSE)

A light and reactive focus trap, framework agnostic, written in TypeScript.

## Features

- Trap the focus within a group of HTMLElements
- Choose an element receiving the initial focus within a trap
- Decide whether to prevent clicks on elements outside of a trap
- Bind different behaviours to the `Esc` key
- Choose an element receiving the focus after a trap is left
- Build, demolish, pause and resume a trap at any time

## Installation

```bash
npm install single-focus-trap
```

## Usage

`import { singleFocusTrap } from 'single-focus-trap'` and call it with an object of type `TrapArgs`.

```ts
type Focusable = HTMLElement | SVGElement;

interface TrapConfig {
  roots: HTMLElement[];
  initialFocus?: boolean | Focusable;
  returnFocus?: boolean | Focusable;
  lock?: boolean | Function;
  escape?: boolean | Function;
}

type TrapArg =
  | { action: 'BUILD'; config: TrapConfig }
  | { action: 'DEMOLISH'; config?: never }
  | { action: 'RESUME'; config?: never }
  | { action: 'PAUSE'; config?: never };
```

Start a focus trap by providing the `"BUILD"` action along with a trap configuration object.

You can then `"PAUSE"`, `"RESUME"` or `"DEMOLISH"` the trap by calling `singleFocusTrap` with the desired action.

```javascript
import { singleFocusTrap } from 'single-focus-trap';

const myElement = document.getElementById('myElement');

const config = { root: myElement };

// Build trap
singleFocusTrap({ action: 'BUILD', config });

// Demolish trap
singleFocusTrap({ action: 'DEMOLISH' });
```

## Default behaviour

By default, i.e. if the trap is built with a `config` that only has a `root` property, this is what happens:

- Focus is given to the first tabbable element in the trap
- The `Tab` and `Shift+Tab` keys cycles through the trap's tabbable elements
- Clicks outside of the trap are prevented
- The trap is demolished when the `Esc` key is pressed
- Once the trap is demolished, focus is returned to what was the [active element](https://developer.mozilla.org/en-US/docs/Web/API/Document/activeElement) at the time the trap was built

## `TrapConfig` in detail

A closer look at the configuration object needed to build a trap:

| Property     | Required | Type                   | Default value |
| ------------ | -------- | ---------------------- | :-----------: |
| root         | Yes      | `HTMLElement[]`        |       -       |
| initialFocus | No       | `boolean \| Focusable` |    `true`     |
| returnFocus  | No       | `boolean \| Focusable` |    `true`     |
| lock         | No       | `boolean \| Function`  |    `true`     |
| escape       | No       | `boolean \| Function`  |    `true`     |

- **root**  
  It's the grop of elements within which the focus has to be trapped.  
  If it's missing or invalid, no trap is built.

- **initialFocus**  
  By default, the first tabbable element in the trap receives the focus when a trap is built.  
  You can switch off the default behaviour by giving `initialFocus` a value of `false`.  
  Alternatively, you can pass the element which will receive the initial focus.

- **returnFocus**  
  By default, once a trap is demolished, the focus is returned to what was the active element at the time the trap was built.  
  You can switch off the default behaviour by giving `returnFocus` a value of `false`.  
  Alternatively, you can specify an element, which will receive the focus after the trap is demolished.

- **lock**  
  By default, clicks on elements that are not descendant of the `root` are prevented<sup id="note-reference-1">[:placard:](#note-expansion-1)</sup>.  
  If `lock` is set to `false`, clicks will behave as usual.  
  If `lock` is provided as a funciton, it will be used as event handler for clicks outside of the trap.  
  In this last case, preventing default behaviour and other handlers is up to you.

  > <span id="note-expansion-1">[:placard:](#note-reference-1)</span> Only `mousedown`, `touchstart`, `click` and the default behavior are prevented.  
  > So, if you need to, you can make an element outside of the trap clickable even when `lock` is true, for example, by listening for `mouseup` events.

- **escape**  
  By default, the trap is demolished Whenever the `Esc` key is pressed.  
  If `escape` is set to `false`, the trap is kept running in such cases.  
  If `escape` is provided as a function, it will be used as event handler for the `Esc` key press.  
  In this last case, demolishing the trap is left up to you.

## Return value

`undefined` :shrug:

## Dependencies & Browser Support

The are no dependencies and the library runs pretty much anywhere.

The bottleneck is the [MutationObserver API](https://caniuse.com/mdn-api_mutationobserver).  
Note that even though the MutationObserver API supports IE11, some tweak would be required to make the trap IE compliant and since [Microsoft dropped support for IE](https://blogs.windows.com/windowsexperience/2022/06/15/internet-explorer-11-has-retired-and-is-officially-out-of-support-what-you-need-to-know/), **single-focus-trap** chooses not to support IE.

## Nice to know

- Traps are extremely light, dynamic and reactive :zap: they are able to aknowledge key changes to key elements of the trap and take actions against these only when required, effectively minimizing their footprint on your application.

- A focus trap may be a huge gain in matter of accessibility, but it's not strictly necessary for an application to be functional. That's why **single-focus-trap** chooses not to throw errors in production.

  Note the the error handling available in development does NOT cover type checking, which could be a problem if you are using JavaScript rather than TypeScript.

  If you want to complement **single-focus-trap** with some type checking or anything, consider writing a small wrap to enhance it with the desired features (check [use-simple-focus-trap](https://github.com/DaviDevMod/focus-trap/tree/main/packages/use-simple-focus-trap) for an example, limited to React).

- It's called **single** because:

  - It can only hold the state of one focus trap at a time, meaning that when a new trap is built, any information related to a previous trap is lost, foreva.

  - The state of the trap is kept in the singleton instance of a class, so creating multiple traps (even from different files) won't create multiple traps; a brand new trap always replaces an older trap.

## Special thanks :blue_heart:

The logic for the treatement of edge cases, in matter of browser consistency regarding tab indexes and tabbability, is took from [tabbable](https://github.com/focus-trap/tabbable).

This small library has been around for many years and, at the time of writing, can boast 180 dependant packages and one million weekly downloads while having zero open issues :scream: which makes feel safe about the reliability of the edge case logic.

The reason why _tabbable_ is not being used as a dependency is that it would be an overkill and _single-focus-trap_ aims to be as simple and lightweight as possible.

## :earth_americas: Contributions

Any kind of contribution is more than welcome! :tada:
