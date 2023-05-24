# @davidevmod/focus-trap

[![ci](https://github.com/DaviDevMod/focus-trap/actions/workflows/ci.yml/badge.svg)](https://github.com/DaviDevMod/focus-trap/actions/workflows/ci.yml) [![codecov](https://codecov.io/gh/DaviDevMod/focus-trap/branch/main/graph/badge.svg?token=JFA6ajmqFg)](https://codecov.io/gh/DaviDevMod/focus-trap) [![npm version](https://badgen.net/npm/v/@davidevmod/focus-trap)](https://www.npmjs.com/package/@davidevmod/focus-trap) [![license](https://badgen.now.sh/badge/license/MIT)](./LICENSE)

Trap the focus within your DOM elements.

## Features

- Trap the focus within a group of DOM elements
- Choose an element receiving the initial focus
- Customise the behaviour of clicks on elements outside of the trap
- Decide whether to demolish a trap after an <kbd>Esc</kbd> key press
- Choose an element receiving the focus after a trap is demolished
- Build, demolish, pause and resume your focus trap at any time

## Installation

```bash
yarn add @davidevmod/focus-trap
```

## Usage

`import { focusTrap } from '@davidevmod/focus-trap'` and call it with an argument of type `TrapArg`.

<details>
<summary><code>TrapArg</code> type:</summary>
<br>

```ts
type Focusable = HTMLElement | SVGElement;

type Roots = (Focusable | string)[];

interface TrapConfig {
  roots: Roots;
  initialFocus?: boolean | Focusable | string;
  returnFocus?: boolean | Focusable | string;
  lock?: boolean | Function;
  escape?: boolean;
}

type TrapAction = 'PAUSE' | 'RESUME' | 'DEMOLISH';

type TrapArg = Roots | TrapConfig | TrapAction;
```

</details>

<br>

Here is an example:

```ts
import { focusTrap } from '@davidevmod/focus-trap';

const myElement = document.getElementById('myID');

// You can build a focus trap in different ways:

focustrap({ roots: [myElement] });

focustrap({ roots: ['myID'] });

focustrap([myElement]);

focusTrap(['myID']);

// All of the above calls would build the very same trap.

// Pause the trap.
focusTrap('PAUSE');

// Resume the trap.
focusTrap('RESUME');

// Demolish the trap.
focusTrap('DEMOLISH');
```

## Default behaviour

By default, when building a focus trap by providing only `roots`, this is what happens:

- The focus is given to the first tabbable element contained in the roots
- <kbd>Tab</kbd> and <kbd>Shift</kbd>+<kbd>Tab</kbd> keys cycle through the roots' tabbable elements
- Click events outside of the focus trap are prevented
- Whenever the <kbd>Esc</kbd> key is pressed, the trap is demolished
- Once the trap is demolished, focus is returned to what was the [activeElement](https://developer.mozilla.org/en-US/docs/Web/API/Document/activeElement) at the time the trap was built

## TrapConfig

You can tweak the behaviour of your trap by providing a `TrapConfig`:

| Property     | Required | Type                             | Default value |
| ------------ | -------- | -------------------------------- | :-----------: |
| roots        | Yes      | `(Focusable \| string)[]`        |       -       |
| initialFocus | No       | `boolean \| Focusable \| string` |    `true`     |
| returnFocus  | No       | `boolean \| Focusable \| string` |    `true`     |
| lock         | No       | `boolean \| Function`            |    `true`     |
| escape       | No       | `boolean`                        |    `true`     |

- **roots**  
  The array of elements (and/or IDs) within which the focus has to be trapped.

- **initialFocus**  
  The element receiving the focus as soon as the trap is built.  
  By default it will be the first tabbable element in the trap.  
  You can provide your designated element (or ID) or the boolean `false` to switch off the default behaviour.

- **returnFocus**  
  The element that will receive the focus once the trap is demolished.  
  By default it will be the element that was the `activeElement` right before the trap was built.  
  You can provide your designated element (or ID) or the boolean `false` to switch off the default behaviour.

- **lock**  
  The behavior for clicks outside of the trap.  
  By default clicks on elements outside of the trap are prevented.  
  You can provide the boolean `false` to switch off the default behaviour or alternatively your own handler for the click events in question.

  > **Note**
  > Only `mousedown`, `touchstart`, `click` and the browser default behavior are prevented.  
  > So, if you need to, you can make an element outside of the trap clickable even when `lock` is true, for example, by listening for `mouseup` events.

- **escape**  
  The behaviour for <kbd>Esc</kbd> key presses.  
  By default the trap is demolished Whenever the <kbd>Esc</kbd> key is pressed.  
  You can provide the boolean `false` to switch off the default behaviour.

## TrapAction

They are pretty straightforward, calling `focusTrap` with `"PAUSE"`, `"RESUME"` or `"DEMOLISH"` will pause, resume or demolish the focus trap.

## Return value

An object being a shallow copy of the `NormalisedTrapConfig` used internally by the focus trap.  
That is the provided `TrapConfig` with IDs resolved to actual elements and default values set.

<details>
<summary>Here is a comparison:</summary>

<br>

```ts
type Focusable = HTMLElement | SVGElement;

type Roots = (Focusable | string)[];

// The shape of the config expected from you.
interface TrapConfig {
  roots: Roots;
  initialFocus?: boolean | Focusable | string;
  returnFocus?: boolean | Focusable | string;
  lock?: boolean | Function;
  escape?: boolean;
}

// The shape of the returned config.
interface NormalisedTrapConfig {
  roots: Focusable[];
  initialFocus: boolean | Focusable;
  returnFocus: Focusable | null;
  lock: boolean | Function;
  escape: boolean;
}
```

</details>

## Error handling

A focus trap is a huge gain in matter of accessibility, but it's not strictly necessary for an application to be functional.  
That's why **this library chooses not to throw errors in production**.

Also note that the error handling available in environments other than _production_ does not cover type checking, as the library takes advantage of being written in **TypeScript**.

## Dependencies & Browser Support

The are no dependencies and the library can run in any major browser.

> **Note**
> The codebase is tested only against Chromium-based browsers.
> That's because the e2e tests use [Cypress](https://www.cypress.io/), which [does not support native browser events](https://github.com/cypress-io/cypress/issues/311) (in particular <kbd>Tab</kbd> key presses), problem that is solved by using the [Cypress Real Events](https://github.com/dmtrKovalenko/cypress-real-events) plugin which does allow for native browser events in Cypress, but only in the presence of Chrome Devtools.

## Special thanks :heart:

The logic for the treatement of edge cases, in matter of browser consistency regarding tab indexes and tabbability, is took from [tabbable](https://github.com/focus-trap/tabbable).

This small library has been around for many years and, at the time of writing, can boast 180 dependant packages and one million weekly downloads while having zero open issues :scream: which makes feel safe about the reliability of the edge case logic.

The reason why _tabbable_ is not being used as a dependency is that it would be an overkill and _focus-trap_ aims to be as simple and lightweight as possible.

Also much obliged to the whole [focus-trap](https://github.com/focus-trap) project in general, which has been a huge point of reference.

## :earth_americas: Contributions

Any kind of contribution is more than welcome.  
Check the [CONTRIBUTING.md](https://github.com/DaviDevMod/focus-trap/blob/main/packages/focus-trap/CONTRIBUTING.md) to get started.
