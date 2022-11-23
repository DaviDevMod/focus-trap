# use-simple-focus-trap

[![CI-packages](https://github.com/DaviDevMod/use-simple-focus-trap/actions/workflows/ci-packages.yml/badge.svg)](https://github.com/DaviDevMod/focus-trap/actions/workflows/ci-packages.yml) [![npm version](https://badgen.net/npm/v/use-simple-focus-trap)](https://www.npmjs.com/package/use-simple-focus-trap) [![license](https://badgen.now.sh/badge/license/MIT)](./LICENSE) [![codecov](https://codecov.io/gh/DaviDevMod/focus-trap/branch/main/graph/badge.svg?flag=use-simple-focus-trap)](https://codecov.io/gh/DaviDevMod/focus-trap)

This React custom hook it's a tiny wrapper around [single-focus-trap](https://github.com/DaviDevMod/focus-trap/tree/main/packages/single-focus-trap), that allows you to trap the focus within a group of HTML elements.

## :sparkles: Features

The same features as [single-focus-trap]https://github.com/DaviDevMod/focus-trap/tree/main/packages/single-focus-trap):

- Trap the focus within an HTMLElement, or an array of them.
- Choose an element receiving the initial focus within a trap
- Decide whether to prevent clicks on elements outside of a trap
- Bind different behaviours to the `Esc` key
- Choose an element receiving the focus after a trap is left
- Build, demolish, pause and resume a trap at any time

But with:

- A more ergonomic API, that makes it simple to create a simple focus trap :lotus_position:
- A good layer of error handling, that makes the hook viable for plain JavaScript
- The ability to push traps into an automated [stack](<https://en.wikipedia.org/wiki/Stack_(abstract_data_type)>) of traps

## Installation

```bash
npm install use-simple-focus-trap
```

or

```
yarn add use-simple-focus-trap
```

## Usage

Import the hook and call it with an HTML element, or the id of such element, or even an array of elements and ids.  
And that's it, the focus is trapped.

The hook will stop trapping the focus as soon as it is unmounted or whenever the user presses the `Esc` key.

```javascript
import useFocusTrap from 'use-simple-focus-trap';

function MyComponent() {
  useFocusTrap('elementId');

  return <h1>The focus is now trapped inside of an HTML element with "elementId" as id</h1>;
}

export default MyComponent;
```

## Default behaviour

By default, i.e. if a valid root for the trap is provided, but a valid configuration object is missing, this is what happens when a focus trap is built:

- Focus is given to the first tabbable element in the trap
- The `Tab` and `Shift+Tab` keys cycles through the trap's tabbable elements
- Clicks outside of the trap are prevented
- The trap is demolished when the `Esc` key is pressed or the hook unmounts
- Once the trap is demolished, focus is returned to what was the [active element](https://developer.mozilla.org/en-US/docs/Web/API/Document/activeElement) at the time the hook was called

## Parameters

The hook receives a single parameter of type `TrapParam`, defined as follow:

```ts
type Focusable = HTMLElement | SVGElement;

type TrapRoot = (HTMLElement | string)[] | HTMLElement | string;

interface TrapConfig {
  root: TrapRoot;
  initialFocus?: Focusable | string;
  returnFocus?: Focusable | string;
  lock?: boolean | Function;
  escape?: boolean | Function;
}

type TrapParam = TrapRoot | TrapConfig;
```

Basically, you can either call the hook with just a group of elements and use the default behaviour, or call it with a whole configuration object. Note that any element in the configuration can be provided as id.  
Let's have a closer look at the configuration object.

| Property     | Required | Type                             | Default value |
| ------------ | -------- | -------------------------------- | :-----------: |
| root         | Yes      | `TrapRoot`                       |       -       |
| initialFocus | No       | `boolean \| Focusable \| string` |    `true`     |
| returnFocus  | No       | `boolean \| Focusable \| string` |    `true`     |
| lock         | No       | `boolean \| Function`            |    `true`     |
| escape       | No       | `boolean \| Function`            |    `true`     |

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

The return value is a funciton that can be used to push, build, demolish, pause and resume a trap.  
This function receives a single parameter of type `TrapsControllerParam`.

```ts
export type TrapsControllerParam =
  | { action: 'PUSH'; config: TrapParam }
  | { action: 'BUILD'; config: TrapParam }
  | { action: 'DEMOLISH'; config?: never }
  | { action: 'RESUME'; config?: never }
  | { action: 'PAUSE'; config?: never }
  | TrapParam
  | 'DEMOLISH'
  | 'RESUME'
  | 'PAUSE';
```

The hook automatically manages a stack of focus traps  
Whenever a new trap is built, the current trap (if any) is paused.  
Whenever a trap is demolished, the previous trap (if any) is resumed.

The difference between a `"BUILD"` and a `"PUSH"`is that the latter builds a trap on top of the current one (if any), while `"BUILD"` replaces the current trap with another one.

Note that only one trap can be active at a time. When pushing a new trap, the current is paused and will automatically resumed once the pushed trap is demolished.

When `TrapsControllerParam` is provided as a `TrapParam`, the action defaults to `"PUSH"`.

<blockquote id="note-expansion-2-warning">:warning: Properties that are provided as a function should be <a href="https://reactjs.org/docs/hooks-reference.html#usecallback">memoized</a> to avoid unintended behaviours.</blockquote>

<details>
<summary>Why?</summary>

> The hook's return value avoids building the same trap twice in a row. It does so by comparing the configuration objects received, but it only shallow-compares functions found in it.

Note that a warning will be shown if you attempt to build a trap with a configuration object that differs only in the reference of a function from the configuration object of the trap that is currently on top of the stack.  
So if you feel confortable in doing so, you can avoid memoizations until a warning shows up.

</details>

## Dependencies & Browser Support

The hook depends on [single-focus-trap](https://github.com/DaviDevMod/focus-trap/tree/main/packages/single-focus-trap), from which it eredits the [browser support](https://github.com/DaviDevMod/focus-trap/tree/main/packages/single-focus-trap#dependencies--browser-support).

## Nice to know

- The hook is stateless, so it will never cause a rerender :zap:

- Traps are extremely dynamic, light and responsive :fire: they are able to aknowledge key changes to key elements of the trap and take actions against these only when required, effectively minimizing their footprint on your application.

- A focus trap may be a huge gain in matter of accessibility, but it's not strictly necessary for an application to be functional. That's why `use-simple-focus-trap` choose to throw errors only in the development environment, avoiding to crash you application in production.

## :earth_americas: Contributions

Any kind of contribution is more than welcome! :tada:
