# single-focus-trap

[![CI-packages](https://github.com/DaviDevMod/focus-trap/actions/workflows/ci-packages.yml/badge.svg)](https://github.com/DaviDevMod/focus-trap/actions/workflows/ci-packages.yml) [![npm version](https://badgen.net/npm/v/single-focus-trap)](https://www.npmjs.com/package/single-focus-trap) [![license](https://badgen.now.sh/badge/license/MIT)](./LICENSE)

A light and reactive JavaScript focus trap.
It's framework agnostic and comes with types out of the box.

It's called **single** because it can only hold the state of a single focus trap, meaning that when a new trap is built, `single-focus-trap` loses any information related to a precedent trap.

Furthermore, creating traps from different files won't create multiple traps, a new trap always overwrite previously existing ones. This is necessary to avoid conflicts between event handlers.

## :sparkles: Features

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

or

```
yarn add single-focus-trap
```

## Usage

`import { singleTrap } from 'single-focus-trap'` and call it with an object of type `SingleTrapControllerArgs`.

Here is a definition of `SingleTrapControllerArgs`:

```ts
type Focusable = HTMLElement | SVGElement;

interface SingleTrapConfig {
  root: HTMLElement[] | HTMLElement;
  initialFocus?: Focusable;
  returnFocus?: Focusable;
  lock?: boolean | Function;
  escape?: boolean | Function;
}

type SingleTrapControllerArgs =
  | { action: 'BUILD'; config: SingleTrapConfig }
  | { action: 'DEMOLISH'; config?: never }
  | { action: 'RESUME'; config?: never }
  | { action: 'PAUSE'; config?: never };
```

Start a focus trap by providing the `"BUILD"` action along with a trap configuration object.

You can then `"PAUSE"`, or `"DEMOLISH"` the trap by calling the method again with the desired action.  
The trap is also automatically demolished whenever the user presses the `Esc` key.

```javascript
import { singleTrap } from 'single-focus-trap';

const myElement = document.getElementById('myElement');

const config = { root: myElement };

// Build trap
singleTrap({ action: 'BUILD', config });

// Demolish trap
singleTrap({ action: 'DEMOLISH' });
```

## Default behaviour

By default, i.e. if the trap is built with a `config` that only has a `root` property, this is what happens:

- Focus is given to the first tabbable element in the trap
- The `Tab` and `Shift+Tab` keys cycles through the trap's tabbable elements
- Clicks outside of the trap are prevented
- The trap is demolished when the `Esc` key is pressed
- Once the trap is demolished, focus is returned to what was the [active element](https://developer.mozilla.org/en-US/docs/Web/API/Document/activeElement) at the time the trap was built

## `SingleTrapConfig` in detail 🔍

Let's have a closer look at the configuration object needed to build a trap.

| Property     | Required | Type                           | Default value |
| ------------ | -------- | ------------------------------ | :-----------: |
| root         | Yes      | `HTMLElement \| HTMLElement[]` |       -       |
| initialFocus | No       | `boolean \| Focusable`         |    `true`     |
| returnFocus  | No       | `boolean \| Focusable`         |    `true`     |
| lock         | No       | `boolean \| Function`          |    `true`     |
| escape       | No       | `boolean \| Function`          |    `true`     |

- **root**  
  It's the grop of elements within which the focus has to be trapped.  
  If it's missing or invalid, no trap is built.

- **initialFocus**  
  By default, the first tabbable element in the trap receives the focus when a trap is built.  
  You can switch off the default behaviour by giving `initialFocus` a value of `false`.  
  Alternatively, you can specify an element, or the id of an element, which will receive the initial focus.

- **returnFocus**  
  By default, once a trap is demolished, the focus is returned to what was the active element at the time the trap was built.  
  You can switch off the default behaviour by giving `returnFocus` a value of `false`.  
  Alternatively, you can specify an element, or the id of an element, which will receive the focus once the trap is demolished.

- **lock**  
  By default, clicks on elements that are not descendant of the `root` are prevented<sup id="note-reference-1">[:placard:](#note-expansion-1)</sup>.  
  If `lock` is set to `false`, clicks will behave as usual.  
  If `lock` is provided as a funciton, it will be used as an event handler for clicks outside of the trap.  
  In this last case, preventing default behaviour and other handlers is up to you.

  > <span id="note-expansion-1">[:placard:](#note-reference-1)</span> Only `mousedown`, `touchstart`, `click` and the default behavior are prevented.  
  > So, if you want, you can make an element outside of the trap clickable even when `lock` is true, for example, by listening for `mouseup` events.

- **escape**  
  By default, the trap is demolished Whenever the `Esc` key is pressed.  
  If `escape` is set to `false`, the trap is kept running in such cases.  
  If `escape` is provided as a function, it will be used as an event handler.  
  In this last case, demolishing the trap is up to you.

## Return value

`void` :shrug:

## Dependencies & Browser Support

The are no dependencies and the hook can run pretty much anywhere except for IE.

The bottleneck is the [MutationObserver API](https://caniuse.com/mdn-api_mutationobserver), which is supported by IE11. However some tweak would be required and since even [Microsoft itself started to drop support for IE](https://docs.microsoft.com/en-us/lifecycle/announcements/internet-explorer-11-end-of-support-windows-10), I chose not to support it.

## Nice to know

- Traps are extremely dynamic, light and responsive :fire: they are able to aknowledge key changes to key elements of the trap and take actions against these only when required, effectively minimizing their footprint on your application.

- A focus trap may be a huge gain in matter of accessibility, but it's not strictly necessary for an application to be functional. That's why `single-focus-trap` choose to throw errors only in the development environment, avoiding to crash you application in production.

  Though you should note that the error handling only covers cases like: at a certain point there are no tabbable elements in the trap, or it has been attempted to resume, pause, demolish an inexistent trap.  
  Which ideally would be enough if the libraty is used in a typesafe environment (though that's not necessarily the case).

  If you want further protection, for cases like calling `singleTrap()` with a missing or invalid parameter, consider writing a small wrap around `single-focus-trap` enhancing it with the desired features (check [use-simple-focus-trap](https://github.com/DaviDevMod/focus-trap/tree/main/packages/use-simple-focus-trap) for an example, which is limited to React).

## Special thanks :blue_heart:

The logic for the treatement of edge cases, in matter of browser consistency regarding tab indexes and tabbability, is took from [tabbable](https://github.com/focus-trap/tabbable).

This small library has been around for many years and, at the time of writing, can boast 180 dependant packages and one million weekly downloads while having zero open issues :scream: which makes feel safe about the reliability of the edge case logic.

The reason why _tabbable_ is not being used as a dependency is that it would be an overkill and the hook aims to be as simple and lightweight as possible.

## :earth_americas: Contributions

Any kind of contribution is more than welcome! :tada:
