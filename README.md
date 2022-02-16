# use-simple-focus-trap [![CI](https://github.com/DaviDevMod/use-simple-focus-trap/actions/workflows/CI.yml/badge.svg)](https://github.com/DaviDevMod/use-simple-focus-trap/actions/workflows/CI.yml) [![npm version](https://badgen.net/npm/v/use-simple-focus-trap)](https://www.npmjs.com/package/use-simple-focus-trap) [![license](https://badgen.now.sh/badge/license/MIT)](./LICENSE)

A lightweight custom hook to trap the focus within an HTML element.

#### Features:

_useSimpleFocusTrap_ gives you the possibility to:

- Choose an element receiving the initial focus
- Prevent clicks outside of the trap
- Bind different behaviours to the `Esc` key
- Choose an element receiving the focus after the trap breaks
- Enjoy a flexible and dynamic focus trap, built around the [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) API

All of this with an imperceptible footprint on size and performance. :cherries:

## Installation

```bash
npm install use-simple-focus-trap
```

## Usage

Import the hook and and call it with an object having a `trapRoot` property.  
The value of `trapRoot` must be either the `HTMLElement` in which you want to trap the focus, or its `id`.

```javascript
import { useSimpleFocusTrap } from 'use-simple-focus-trap';

function MyComponent() {
  useSimpleFocusTrap({ trapRoot: 'rootOfTheTrap' });

  return <h1>The focus is now trapped inside of an element with "rootOfTheTrap" as id</h1>;
}

export default MyComponent;
```

Having to deal with `id`s rather than actual elements, allows you to easily decouple the hook from the JSX that renders the elements in the trap. :zap:  
This makes it easy to implement the trap in a reusable component, in which you would most likely want to call the hook in this more reusable way:

```javascript
import { useSimpleFocusTrap } from 'use-simple-focus-trap';

function MyReusableComponent(props) {
  useSimpleFocusTrap(props.trapConfig);

  return <h1>The focus is now trapped inside of the element referenced by `trapRoot`</h1>;
}

export default MyComponent;
```

Where _MyReusableComponent_ would be used like so:

```javascript
import MyReusableComponent from '../UI/MyReusableComponent';

const trapConfig = { trapRoot: 'rootOfTheTrap' };

function AnotherComponent() {

  return <MyReusableComponent trapConfig={trapConfig}>;
}

export default AnotherComponent;
```

The `trapConfig` object can receive five more properties that help customising the behaviour of the trap, but they are not required.

## Default behaviour

By default (ie, if only a valid `trapRoot` is provided) this is what happens when the hook is called:

- Focus is given to the first tabbable element in the trap
- The `Tab` and `Shift+Tab` keys cycles through the focus trap's [tabbable](https://github.com/focus-trap/tabbable) elements
- Clicks outside of the trap behave as usual
- The trap breaks whenever the `Esc` key is pressed
- Once the trap breaks, focus is returned to what was the active element at the time the hook was called

## Parameters

The hook receives a single parameter being an object whose properties are listed below.

| Name           | Required | Type                           |
| -------------- | -------- | ------------------------------ |
| trapRoot       | Yes      | string \| HTMLElement          |
| escaper        | No       | Escaper                        |
| initialFocus   | No       | FocusableElementIdentifier     |
| returnFocus    | No       | FocusableElementIdentifier     |
| locked         | No       | boolean \| Function            |
| tabbableConfig | No       | TabbableOptions & CheckOptions |

Where `FocusableElementIdentifier` and `Escaper` are defined as follows:

```javascript
type FocusableElementRef = HTMLElement | SVGElement | null;

type FocusableElementIdentifier = string | FocusableElementRef;

interface Escaper {
  custom?: Function;
  keepTrap?: boolean;
  identifier?: FocusableElementIdentifier;
  beGentle?: boolean;
}
```

- **trapRoot**  
  It must be the `HTMLElement` in which you want to trap the focus, or its `id`.  
  If it's missing or invalid, the hook does nothing.

* **escaper**  
  For accessibility purposes, it is recommended to provide the user with a keyboard shortcut to leave the trap.  
  The `escaper` object is meant to aid on defining the behaviour bounded to the `Esc` key press.

  - **keepTrap**  
    By default the trap breaks when `Esc` is pressed.  
    `keepTrap` must be a boolean, which if `true` prevents the trap from breaking in the event of an `Esc` key press.

  - **custom**  
    This property must be a `Function`.
    If provided, it will be executed whenever the `Esc` key is pressed.

  - **identifier** plus an optional **beGentle**  
    The `identifier` is meant to reference a button that when clicked closes a modal in which the focus was trapped.  
    It must be of type `FocusableElementIdentifier` and referencing a [focusable](https://github.com/focus-trap/tabbable#isfocusable) [descendant](https://developer.mozilla.org/en-US/docs/Web/API/Node/contains) of the trap's root node.  
    `beGentle` must be a boolean.  
    If a valid `identifier` is provided, anytime the `Esc` key is pressed, the referenced element will fire a click event; unless `beGentle` is `true`, in this case the element would get focused instead.  
    Notice that the click event would not fire if the element is not clickable.

  It should not matter for the logic of your particular implementation, but for completeness, this is the order in which the above properties act on the trap whenever `Esc` is pressed:

  ```javascript
  if (custom) custom();
  if (identifier) either click or focus the referenced element;
  if (!keepTrap) demolish the trap;
  ```

* **initialFocus**  
  It is the element that will receive the initial focus within the trap.
  It must be of type `FocusableElementIdentifier` and referencing a [focusable](https://github.com/focus-trap/tabbable#isfocusable) [descendant](https://developer.mozilla.org/en-US/docs/Web/API/Node/contains) of the trap's root node.  
  If it's missing or invalid, the initial focus defaults to the first focusable element in the trap.

* **returnFocus**  
  It is the element that will receive the focus once the trap breaks.  
  It must be of type `FocusableElementIdentifier`.  
  If it's missing or invalid, the focus will be returned to what was the active element at the time the hook was called.

* **locked**  
  Must be either a `boolean` or a `Function`.  
  By default clicks on elements ouside of the trap behave as usual.
  If `locked` is `true` clicks on elements not belonging to the trap's root are blocked, they do not fire any event.  
  If instead, `locked` is provided as a funciton, this will be used as an event handler for clicks on elements outside of the trap. The function will be [bounded](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Function/bind) with the `MouseEvent` in question:

  ```javascript
  if (locked instanceof Function) locked.bind(null, event);
  ```

* **tabbableConfig**  
  The hook outsources the treatment of edge cases in matter of browser consistency regarding tabbing around in a page, to [tabbable](https://github.com/focus-trap/tabbable). This utility accepts [configuration options](https://github.com/focus-trap/tabbable#options-3) defaulting to:

  ```javascript
  {includeContainer: false, displayCheck: 'full'}
  ```

  They are overridden in the hook as follows:

  ```javascript
  {includeContainer: false, displayCheck: 'non-zero-area'}
  ```

  You can re-override them by providing the desired tabbable configuration.

## Return value

`void` for the moment.

Error handling will be added and the hook will return some informative status.

## Example

In the "example" folder of this repo you can see the hook in action.  
The example has three main components:

- **App**  
  It conditionally renders, among the other things, a `<ChooseYourPill>` component

- **ChooseYourPill**  
  It defines a [`<fieldset>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/fieldset), which is rendered wrapped in a reusable `<Modal>` component

- **Modal**  
  A reusable modal component.

The hook is called directly in the `<Modal>` component. In this way the focus is trapped automatically when a modal is opened, and the trap breaks whenever the modal unmounts.

An `escaper` is provided, which makes the `Esc` key close the modal and, by doing so, unmount the hook.

An `initialFocus` is provided too and is pointing to the same element the `escapers`'s `identifier` is pointing to.

`returnFocus`, `locked` and `tabbableConfig` are left `undefined`.  
So focus is returned to what was the active element at the time the hook was called, and clicks outside of the trap are allowed; even though all they can do is closing the modal, because they are being catched by the backdrop's event handler.

There is a group of radio buttons, which requires you to [use arrow keys for interaction](https://www.w3.org/wiki/RadioButton).

It is worth noticing that when the hook is being called in the `<Modal>`, there is no element in the DOM with an `id` corresponding to the one provided as `identifier` and `initialFocus`; however thanks to the [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) API, the hook is dynamic and flexible enough to pick up elements whenever they appear.

## Dependencies and browser support

The hook has React as peer dependency and [tabbable](https://github.com/focus-trap/tabbable) as dependency.

The browser support should be around 95%. See [Node.contains()](https://caniuse.com/mdn-api_node_contains) and [MutationObserver](https://caniuse.com/mutationobserver).

## Known bugs and limitations

- The hooks doesn't handle, yet, cases of non-trivial elements as first or last tabbable element in in the trap.

  Eg: in the example provided, there is no tabbable element before the radio group and the first tabbable element should be considered the current checked radio input, instead at the moment it's just the first radio input; this means that by checking the second input and then shift-tabbing back, it's possible to leave the trap.

  Another example is the case of elements with negative `tabIndex` as first or last element in the trap; after such element is focused (by means other than the keyboard) it is possible to leave the trap from the keyboard.

- Error handling is missing.

- Tests are missing.

- The example doesn't cover all the functionalities and it is not deployed.

- Features requiring a substantial addition in logic (and therefore most probably in size and speed) would not get implemented, since they would defeat the original purpose of the hook.

## Contributions

Contributions are more than welcome! :rocket::rocket:
