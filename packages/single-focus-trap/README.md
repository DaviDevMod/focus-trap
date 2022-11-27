# single-focus-trap

[![CI-packages](https://github.com/DaviDevMod/focus-trap/actions/workflows/ci-packages.yml/badge.svg)](https://github.com/DaviDevMod/focus-trap/actions/workflows/ci-packages.yml) [![shared-e2e](https://github.com/DaviDevMod/focus-trap/actions/workflows/shared-e2e.yml/badge.svg)](https://github.com/DaviDevMod/focus-trap/actions/workflows/shared-e2e.yml) [![codecov](https://codecov.io/gh/DaviDevMod/focus-trap/branch/main/graph/badge.svg?flag=single-focus-trap)](https://codecov.io/gh/DaviDevMod/focus-trap) [![npm version](https://badgen.net/npm/v/single-focus-trap)](https://www.npmjs.com/package/single-focus-trap) [![license](https://badgen.now.sh/badge/license/MIT)](./LICENSE)

A TypeScript package to trap the focus within your DOM nodes.

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

`import { singleFocusTrap } from 'single-focus-trap'` and call it with an object of type `TrapArg`.

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

Start a focus trap by providing the `'BUILD'` action along with a trap configuration object.

You can then `'PAUSE'`, `'RESUME'` or `'DEMOLISH'` the trap by calling `singleFocusTrap` with the relevant `action`.

```javascript
import { singleFocusTrap } from 'single-focus-trap';

const myElement = document.getElementById('myElement');

const config = { roots: [myElement] };

// Build trap
singleFocusTrap({ action: 'BUILD', config });

// Demolish trap
singleFocusTrap({ action: 'DEMOLISH' });
```

## Default behaviour

By default, i.e. if the trap is built with a `config` that only has a `roots` property, this is what happens:

- Focus is given to the first tabbable element in the trap
- The `Tab` and `Shift+Tab` keys cycles through the trap's tabbable elements
- Clicks outside of the trap are prevented
- The trap is demolished when the `Esc` key is pressed
- Once the trap is demolished, focus is returned to what was the [active element](https://developer.mozilla.org/en-US/docs/Web/API/Document/activeElement) at the time the trap was built

## `TrapConfig` in detail

A closer look at the configuration object needed to build a trap:

| Property     | Required | Type                   | Default value |
| ------------ | -------- | ---------------------- | :-----------: |
| roots        | Yes      | `HTMLElement[]`        |       -       |
| initialFocus | No       | `boolean \| Focusable` |    `true`     |
| returnFocus  | No       | `boolean \| Focusable` |    `true`     |
| lock         | No       | `boolean \| Function`  |    `true`     |
| escape       | No       | `boolean \| Function`  |    `true`     |

- **roots**  
   An array of elements within which the focus has to be trapped.  
   If it's missing or invalid, no trap is built.

- **initialFocus**  
  By default, the first tabbable element in the trap receives the focus when a trap is built.  
  You can switch off the default behaviour by giving `initialFocus` a value of `false`.  
  Alternatively, you can pass the element which you want to receive the initial focus.

- **returnFocus**  
  By default, once a trap is demolished, the focus is returned to what was the active element at the time the trap was built.  
  You can switch off the default behaviour by giving `returnFocus` a value of `false`.  
  Alternatively, you can specify the element which you want receive the focus after the trap is demolished.

- **lock**  
  By default, clicks on elements that are not contained in any of the `roots` elements are prevented.
  If `lock` is set to `false`, clicks will behave as usual.  
  If `lock` is provided as a funciton, it will be used as the trap's event handler for clicks outside of the trap.

  > **Note**
  > Only `mousedown`, `touchstart`, `click` and the browser default behavior are prevented.  
  > So, if you need to, you can make an element outside of the trap clickable even when `lock` is true, for example, by listening for `mouseup` events.

- **escape**  
  By default, the trap is demolished Whenever the `Esc` key is pressed.  
  If `escape` is set to `false`, the trap is kept running in such cases.  
  If `escape` is provided as a function, it will be used as the trap's event handler for `Esc` key presses.

## Return value

`undefined` :shrug:

## Dependencies & Browser Support

The are no dependencies and the library can run in any major browser.

> **Note**
> The code is actually tested only against Chromium-based browsers.
> That's because the e2e tests use [Cypress](https://www.cypress.io/), which [does not support native browser events](https://github.com/cypress-io/cypress/issues/311) (in particular [<kbd>Tab</kbd> key presses](https://github.com/cypress-io/cypress/issues/311)), problem that is solved by using the [Cypress Real Events](https://github.com/dmtrKovalenko/cypress-real-events) plugin which does allow to get native browser events in Cypress, but only in presence of Chrome Devtools.

## Nice to know

- A focus trap may be a huge gain in matter of accessibility, but it's not strictly necessary for an application to be functional. That's why **single-focus-trap** chooses not to throw errors in production.

  > **Note**
  > The library takes advantage of being written in TypeScript, by refraining from covering type checking with the error handling available in the development environment.

- It's called **single** because:

  - The internal state of the trap is kept in the singleton instance of a class, so that building multiple traps at the same time (even from different files) won't create multiple traps racing to handle DOM events. A newly built trap always replaces an existing trap.

  - It only holds the state of one single focus trap at a time. Meaning that when a new trap is built, any information related to a previous trap is lost, foreva.

## Special thanks :blue_heart:

The logic for the treatement of edge cases, in matter of browser consistency regarding tab indexes and tabbability, is took from [tabbable](https://github.com/focus-trap/tabbable).

This small library has been around for many years and, at the time of writing, can boast 180 dependant packages and one million weekly downloads while having zero open issues :scream: which makes feel safe about the reliability of the edge case logic.

The reason why _tabbable_ is not being used as a dependency is that it would be an overkill and _single-focus-trap_ aims to be as simple and lightweight as possible.

Also much obliged to the whole [focus-trap](https://github.com/focus-trap) project in general, which has been a huge point of reference.

## :earth_americas: Contributions

Any kind of contribution is more than welcome! :tada:
