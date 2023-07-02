# @davidevmod/focus-trap

[![ci](https://github.com/DaviDevMod/focus-trap/actions/workflows/ci.yml/badge.svg)](https://github.com/DaviDevMod/focus-trap/actions/workflows/ci.yml) [![Known Vulnerabilities](https://snyk.io/test/npm/@davidevmod/focus-trap/badge.svg)](https://snyk.io/test/npm/@davidevmod/focus-trap) [![codecov](https://codecov.io/gh/DaviDevMod/focus-trap/branch/main/graph/badge.svg?token=JFA6ajmqFg)](https://codecov.io/gh/DaviDevMod/focus-trap) [![npm version](https://badgen.net/npm/v/@davidevmod/focus-trap)](https://www.npmjs.com/package/@davidevmod/focus-trap) [![license](https://badgen.now.sh/badge/license/MIT)](./LICENSE)

A tiny and performant library to trap the focus within your DOM elements.

## Features

- Trap the focus within a group of DOM elements
- Choose an element receiving the initial focus
- Prevent clicks on elements outside of the trap
- Demolish a trap after an <kbd>Esc</kbd> key press
- Focus a given element once the trap is demolished
- Build, demolish, pause and resume your focus trap

## Contents

- [1. Installation](#installation)
- [2. Usage](#usage)
- [3. Default behaviour](#default-behaviour)
- [4. API](#api)
  - [TrapConfig](#trapconfig)
  - [TrapAction](#trapaction)
  - [Return value](#return-value)
- [5. Dependencies](#dependencies)
- [6. Browser support](#browser-support)
- [7. Demo](#demo)
- [8. Contributing](#earth_americas-contributing)

## Installation

```bash
# Install with
npm add @davidevmod/focus-trap
# or
yarn add @davidevmod/focus-trap
# or
pnpm add @davidevmod/focus-trap
```

## Usage

`import { focusTrap } from '@davidevmod/focus-trap';` and call it with an argument of type [TrapArg](#api):

```ts
import { focusTrap } from '@davidevmod/focus-trap';

const myElement = document.getElementById('myID');

// You can build a focus trap in different ways:

focusTrap(['myID']);

focusTrap([myElement]);

focusTrap({ roots: ['myID'] });

focusTrap({ roots: [myElement] });

// All of the above calls would build the very same trap.

// Pause the trap.
focusTrap('PAUSE');

// Resume the trap.
focusTrap('RESUME');

// Demolish the trap.
focusTrap('DEMOLISH');
```

## Default behaviour

By default, when building a focus trap by providing only an array of `roots`, this is what happens:

- The focus is given to the first tabbable element [contained](https://developer.mozilla.org/en-US/docs/Web/API/Node/contains) in the roots
- <kbd>Tab</kbd> and <kbd>Shift</kbd>+<kbd>Tab</kbd> keys cycle through the roots' tabbable elements
- Click events outside of the focus trap are prevented
- Whenever the <kbd>Esc</kbd> key is pressed, the trap is demolished
- Once the trap is demolished, focus is returned to what was the [activeElement](https://developer.mozilla.org/en-US/docs/Web/API/Document/activeElement) at the time the trap was built

## API

```ts
type Focusable = HTMLElement | SVGElement;

type Roots = (Focusable | string)[];

interface TrapConfig {
  roots: Roots;
  initialFocus?: boolean | Focusable | string;
  returnFocus?: boolean | Focusable | string;
  lock?: boolean;
  escape?: boolean;
}

type TrapAction = 'PAUSE' | 'RESUME' | 'DEMOLISH';

type TrapArg = Roots | TrapConfig | TrapAction;
```

### TrapConfig

You can tweak the behaviour of your trap by calling `focusTrap` with a `TrapConfig` object:

| Property     | Required | Type                             | Default value |
| ------------ | -------- | -------------------------------- | :-----------: |
| roots        | Yes      | `(Focusable \| string)[]`        |       -       |
| initialFocus | No       | `boolean \| Focusable \| string` |    `true`     |
| returnFocus  | No       | `boolean \| Focusable \| string` |    `true`     |
| lock         | No       | `boolean`                        |    `true`     |
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
  The behaviour for clicks outside of the trap.  
  By default clicks on elements outside of the trap are prevented.  
  You can provide the boolean `false` to switch off the default behaviour.

  > **Note**  
  > Only `mousedown`, `touchstart`, `click` and the browser default behaviour are prevented.  
  > So, if you need to, you can make an element outside of the trap clickable even when `lock` is true, for example, by listening for `mouseup` events.

- **escape**  
  The behaviour for <kbd>Esc</kbd> key presses.  
  By default the trap is demolished Whenever the <kbd>Esc</kbd> key is pressed.  
  You can provide the boolean `false` to switch off the default behaviour.

### TrapAction

Calling `focusTrap` with `"PAUSE"`, `"RESUME"` or `"DEMOLISH"` will pause, resume or demolish the focus trap.

### Return value

A shallow copy of the `NormalisedTrapConfig` used internally by the library, which is the provided `TrapConfig` with IDs resolved to actual elements and default values set:

```ts
type Focusable = HTMLElement | SVGElement;

interface NormalisedTrapConfig {
  roots: Focusable[];
  initialFocus: boolean | Focusable;
  returnFocus: Focusable | null;
  lock: boolean;
  escape: boolean;
}
```

> **Note**  
> The normalised `roots` are updated at every <kbd>Tab</kbd> key press to account for any relevant mutation (eg, elements attached to or detached from the DOM) so they only represent a snapshot of an ever changing array of elements.

This value is rarely useful, it may be used to eg, implement a [stack](<https://en.wikipedia.org/wiki/Stack_(abstract_data_type)>) of focus traps.

## Dependencies

The library depends on [tabbable](https://github.com/focus-trap/tabbable) to determine whether a given element is tabbable.

The only other dependency is [true-myth](https://github.com/true-myth/true-myth), used to liberate functions from exceptions (as side effects) by including them in the return value.  
It makes the codebase more robust and predictable.

## Browser Support

The library can run in any major browser.

> **Note**  
> The codebase is tested only against Chromium-based browsers.
> That's because the e2e tests use [Cypress](https://www.cypress.io/), which [does not support native browser events](https://github.com/cypress-io/cypress/issues/311) (in particular <kbd>Tab</kbd> key presses), problem that is solved by using the [Cypress Real Events](https://github.com/dmtrKovalenko/cypress-real-events) plugin which does allow for native browser events in Cypress, but only in the presence of Chrome Devtools.

## Demo

There is a live demo in which you can play around with focus traps to appreciate the way they work: https://focus-trap-demo.vercel.app/

The source code can be found in [this repo](https://github.com/DaviDevMod/focus-trap/tree/main/apps/demo).

## :earth_americas: Contributing

Any kind of contribution is more than welcome.  
Check out the [CONTRIBUTING.md](https://github.com/DaviDevMod/focus-trap/blob/main/packages/focus-trap/CONTRIBUTING.md) to get started.
