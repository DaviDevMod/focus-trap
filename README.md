# use-simple-focus-trap [![CI](https://github.com/DaviDevMod/use-simple-focus-trap/actions/workflows/CI.yml/badge.svg)](https://github.com/DaviDevMod/use-simple-focus-trap/actions/workflows/CI.yml) [![npm version](https://badgen.net/npm/v/use-simple-focus-trap)](https://www.npmjs.com/package/use-simple-focus-trap) [![license](https://badgen.now.sh/badge/license/MIT)](./LICENSE)

A lightweight React custom hook to trap the focus within an HTML element.

### The hook offers the possibility to:

- Choose an element receiving the initial focus
- Prevent clicks on elements outside of the trap
- Bind different behaviours to the `Esc` key
- Choose an element receiving the focus after the trap breaks
- Do not worry about edge cases and browser support
- Enjoy all of the above with little to no footprint on performance. :cherries:

It is worth noticing that the hook has no states, thus it will not cause re-renders.  
(Though the return value that will be added will be a state. But still re-renders will be minimal, just to deliver errors.)

## Installation

```bash
npm install use-simple-focus-trap
```

## Usage

Import the hook and and call it with an object having a `trapRoot` property.  
The value of `trapRoot` must be either the `HTMLElement` in which the focus has to be trapped, or its `id`.

```javascript
import { useSimpleFocusTrap } from 'use-simple-focus-trap';

function MyComponent() {
  useSimpleFocusTrap({ trapRoot: 'rootOfTheTrap' });

  return <h1>The focus is now trapped inside of an element with "rootOfTheTrap" as id</h1>;
}

export default MyComponent;
```

Dealing with `id`s rather than actual elements, allows to easily decouple the hook from the JSX that renders the elements in the trap. :zap:

It is possible to customise the beahviour of the trap by providing certain additional properties.

## Default behaviour

By default (if `trapRoot` is the only property provided with a valid value) this is what happens when the hook is called:

- Focus is given to the first tabbable element in the trap
- The `Tab` and `Shift+Tab` keys cycles through the focus trap's tabbable elements
- Clicks outside of the trap behave as usual
- The trap breaks whenever the `Esc` key is pressed
- Once the trap breaks, focus is returned to what was the [active element](https://developer.mozilla.org/en-US/docs/Web/API/Document/activeElement) at the time the hook was called

## Parameters

The hook has to be called with a single parameter being an object with the following properties:

| Name         | Required | Type                         |    Default value    |
| ------------ | -------- | ---------------------------- | :-----------------: |
| trapRoot     | **Yes**  | `string \| HTMLElement`      |          -          |
| initialFocus | No       | `FocusableElementIdentifier` |   first tabbable    |
| returnFocus  | No       | `FocusableElementIdentifier` | last activeElement  |
| locker       | No       | `boolean \| Function`        |       `false`       |
| escaper      | No       | `Escaper`                    | `{keepTrap: false}` |

Where `FocusableElementIdentifier` and `Escaper` are defined as follows:

```javascript
type FocusableElementRef = HTMLElement | SVGElement | null;

type FocusableElementIdentifier = string | FocusableElementRef;

interface Escaper {
  keepTrap?: boolean;
  custom?: Function;
  identifier?: FocusableElementIdentifier;
  focus?: boolean;
}
```

- **trapRoot**  
  It must be the `HTMLElement` in which to trap the focus, or its `id`.  
  It is required and if it doesn't point to an `HTMLElement` the hook does nothing.

- **initialFocus**  
  It is the element that will receive the initial focus within the trap.
  It must be of type `FocusableElementIdentifier` and referencing a focusable [descendant](https://developer.mozilla.org/en-US/docs/Web/API/Node/contains) of the trap's root node.  
  If it's missing or invalid, the initial focus defaults to the first tabbable element in the trap.

- **returnFocus**  
  It is the element that will receive the focus once the trap breaks.  
  It must be of type `FocusableElementIdentifier`.  
  If it's missing or invalid, the focus will be returned to what was the active element at the time the hook was called.

- **locker**  
  Must be either a `boolean` or a `Function`.  
  By default clicks on elements not belonging to the trap's root behave as usual, if `locker` is set to `true` they will not fire events<sup>[1]</sup>.  
  If instead, `locker` is provided as a funciton, this will be used as an event handler for clicks on elements outside of the trap. The function will be called with the `MouseEvent | TouchEvent` in question:

  ```javascript
  if (locker instanceof Function) locker(event);
  ```

  [1] Only `mousedown`, `touchstart`, `click` and the default behavior are prevented. So you can make a specific node outisde of the trap _clickable_ even when `locker` is `true`, for example by listening for `mouseup` events.

- **escaper**  
  By default, the trap breaks whenever the `Esc` key is pressed. The `escaper` object can be used to override this behaviour.

  - **keepTrap**  
    Must be a boolean, which if `true` prevents the trap from breaking in the event of an `Esc` key press.

  - **custom**  
    This property must be a `Function`.
    If provided, it will be executed whenever the `Esc` key is pressed.

  - **identifier** plus an optional **focus**  
    The `identifier` is meant to reference a button that when clicked closes a modal in which the focus has been trapped.  
    It must be of type `FocusableElementIdentifier` and referencing a focusable [descendant](https://developer.mozilla.org/en-US/docs/Web/API/Node/contains) of the trap's root node.  
    `focus` must be a boolean.  
    Whenever the `Esc` key is pressed, if a valid `identifier` is provided, the referenced element will fire a click event, unless `focus` is `true`, in this case the element would get focused instead.

  For completeness, this is the order in which the above properties act on the trap whenever `Esc` is pressed:

  ```javascript
  if (custom) custom();
  if (identifier) either click or focus the referenced element;
  if (!keepTrap) demolish the trap;
  ```

## Return value

`void` for the moment.

Error handling will be added and the hook will return some informative status.

## Example

You can see the hook in action by navigating to the "example" folder of this project and then running `npm start`.

The example has three main components:

- **App**  
  It conditionally renders, among the other things, a `<ChooseYourPill>` component

- **ChooseYourPill**  
  It defines a [`<fieldset>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/fieldset), which is rendered wrapped in a reusable `<Modal>` component

- **Modal**  
  It is a reusable modal component.

The hook is called directly in the `<Modal>` component. In this way the focus is trapped automatically when a modal is opened, and the hook unmounts automatically when the `<Modal>` unmounts.

An `escaper` is provided, which makes the `Esc` key fire a click on a button and the `<Modal>` component is unmounted as result of the click.

An `initialFocus` is provided too and is pointing to the same element the `escaper`'s `identifier` is pointing to. (This is a good practice [according to React](https://reactjs.org/docs/accessibility.html#programmatically-managing-focus), since it prevents "_the keyboard user from accidentally activating the success action_")

`returnFocus` and `locker` are left `undefined`.  
So the focus will be returned to what was the active element at the time the hook was called, and clicks outside of the trap are allowed (even though all they can do is closing the modal, because they are being catched by the backdrop's event handler).

There is a group of radio buttons, which requires you to [use arrow keys for interaction](https://www.w3.org/wiki/RadioButton).

## Dependencies & Browser Support

The are no dependencies.

The browser support is from IE11+. See [MutationObserver](https://caniuse.com/mdn-api_mutationobserver) and [Node.contains()](https://caniuse.com/mdn-api_node_contains) for more details.

## Special thanks

The logic for the treatement of edge cases, in matter of browser consistency regarding tabbing around in a page, is took from [tabbable](https://github.com/focus-trap/tabbable).

The reason why _tabbable_ is not being used directly as a dependency is that the hook aims to be as light and fast as possible and _tabbable_ is, for the purposes of this hook, too powerful.

The hook leaves the responsibility of choosing focusable and tabbable elements up to the browser, and only tests the tabbability of a few (from 2 to 4) key elements in the trap. The whole _tabbable_'s logic is oversimplified to about 50 lines of code.

## Development status

- Error handling is missing.

- Tests are missing.

- The example doesn't cover all the functionalities and it is not deployed.

- Features with a poor value/performance ratio may not get implemented, as the original purpose of the hook is to provide a basic, easy-to-use, light & fast :fire: focus trap.

## Contributions

Contributions are more than welcome! :rocket::rocket:
