/// <reference types="cypress" />

import { RequireExactlyOne } from 'type-fest';

interface TestTrapConfig {
  roots: string[];
  initialFocus?: string;
  returnFocus?: string;
  lock?: boolean;
  escape?: boolean;
}

type DropdownOptions = RequireExactlyOne<{ optionButtonName: string; itemsText: string[] }>;

// Totally depending on the elements in the Next.js demo app
export const EXPECTED_ORDER = '0123456';

// A minimum of `2` is required to get meaningfull tests. Larger values make the tests last longer.
export const DEFAULT_TEST_CYCLE_LENGTH = 2;

// Used only by "../e2e/reactivity.cy.ts"
export const NESTED_EXPECTED_ORDER = '345';

type Direction = 'FORWARD' | 'BACKWARD';

declare global {
  namespace Cypress {
    interface Chainable {
      visitDemo: (path?: string) => void;

      openDropdownAndClickOptions: (dropdownButtonName: string, options: DropdownOptions) => void;

      toggleSwitch: (switchName: string, toggleTo: boolean) => void;

      submitForm: () => void;

      buildTrap: (config: TestTrapConfig) => void;

      getNextTabbedDatasetOrder: (direction?: Direction) => Cypress.Chainable<string>;

      getTabCycle: (
        from: JQuery<HTMLElement>,
        direction?: Direction,
        len?: number,
        firstCall?: boolean,
        cycle?: string
      ) => Cypress.Chainable<string>;

      verifyTabCycle: (collection: JQuery<HTMLElement>, direction?: Direction, order?: string, len?: number) => void;
    }
  }
}

Cypress.Commands.add('visitDemo', (path = '/') => {
  cy.visit(path);
  // Check "_app.tsx" in the demo app; https://docs.cypress.io/api/commands/window#Start-tests-when-app-is-ready
  cy.window().should('have.property', 'appReady', true);
});

Cypress.Commands.add(
  'openDropdownAndClickOptions',
  { prevSubject: ['element'] },
  (subject, dropdownButtonName, { optionButtonName, itemsText }) => {
    cy.wrap(subject).find(`button[name="${dropdownButtonName}"]`).click();

    if (optionButtonName) cy.wrap(subject).find(`button[name="${optionButtonName}"]`).click();
    else {
      for (const itemText of itemsText) cy.wrap(subject).contains('li', itemText).click();
      cy.realPress('Escape'); // Close an eventual <Listbox multiple={true}>
    }
  }
);

Cypress.Commands.add(
  'toggleSwitch',
  { prevSubject: ['element'] },
  (subject: JQuery<HTMLElement>, switchName, toggleTo) => {
    cy.wrap(subject)
      // Even though headlessui <Switch> is rendered as a <button>,
      // its `name` prop is given to an hidden <input> element.
      .find(`input[name="${switchName}"]`)
      .then(({ 0: switchInput }) => {
        if ((switchInput as HTMLInputElement).checked) {
          if (!toggleTo) switchInput.click();
        } else if (toggleTo) switchInput.click();
      });
  }
);

Cypress.Commands.add('submitForm', { prevSubject: ['element'] }, (subject: JQuery<HTMLElement>) => {
  cy.wrap(subject).find('button[type="submit"]').click();
});

// For some reason all the config props are missing `| undefined` even though only `roots` is required.
// At least TS complains about wrong calls. But still the typing is broken inside the function.
// I found no relevant issues and I have no intention to open one right now.
Cypress.Commands.add('buildTrap', ({ roots, initialFocus, returnFocus, lock, escape }) => {
  cy.get('form[name="Trap Controls"]').as('trapControls');

  cy.get('@trapControls').openDropdownAndClickOptions('Toggle Action Menu', {
    optionButtonName: 'Select BUILD Action',
  });

  cy.get('@trapControls').openDropdownAndClickOptions('Toggle roots Listbox', {
    itemsText: roots,
  });

  // By providing default values, we can forget about demolishing a trap before to build
  // a different one. As long as `lock` was given `false` otherwise clicks wouldn't work.

  cy.get('@trapControls').openDropdownAndClickOptions('Toggle initialFocus Listbox', {
    itemsText: [initialFocus ?? 'true'],
  });

  cy.get('@trapControls').openDropdownAndClickOptions('Toggle returnFocus Listbox', {
    itemsText: [returnFocus ?? 'true'],
  });

  cy.get('@trapControls').toggleSwitch('Toggle lock Switch', lock ?? true);

  cy.get('@trapControls').toggleSwitch('Toggle escape Switch', escape ?? true);

  cy.get('@trapControls').submitForm();
});

// Fire a `Tab` event and return the `dataset.order` of the element that received the focus.
Cypress.Commands.add('getNextTabbedDatasetOrder', (direction = 'FORWARD') => {
  cy.focused().then(({ 0: origin }) => {
    cy.realPress(direction === 'FORWARD' ? 'Tab' : ['Shift', 'Tab']);

    cy.focused().then(({ 0: destination }) => {
      // Check that elements outside the trap pass the focus to the right elements inside the trap.
      if (!origin.dataset.order) {
        expect(origin.dataset[direction.toLowerCase()]).to.equal(destination.dataset.order);
      }

      if (!destination.dataset.order) throw new Error('Somehow cypress would return `destinatioon`');

      return destination.dataset.order;
    });
  });
});

// Call `getNextTabbedDatasetOrder` multiple times and return a concatenation of the orders of the focused elements.
Cypress.Commands.add('getTabCycle', (origin, direction = 'FORWARD', len = 0, firstCall = true, cycle = '') => {
  if (firstCall) {
    if (len < 2) throw new Error('Please provide a tab cycle length greater than 1.');
    if (!Number.isInteger(len)) throw new Error('Please provide an integer tab cycle length.');
    cy.wrap(origin).focus();
  }
  cy.getNextTabbedDatasetOrder(direction).then((order) =>
    len === 1 ? cycle + order : cy.getTabCycle(null, direction, len - 1, false, cycle + order)
  );
});

// Call `getTabCycle` and verify that its returned tab cycle is a substring of `correctCycle`.
Cypress.Commands.add(
  'verifyTabCycle',
  (collection, direction = 'FORWARD', order = EXPECTED_ORDER, len = DEFAULT_TEST_CYCLE_LENGTH) => {
    const correctCycle = {
      FORWARD: order.repeat(Math.ceil(len / order.length) + 1),
      get BACKWARD() {
        return this.FORWARD.split('').reverse().join('');
      },
    };

    cy.wrap(collection).each((element) => {
      cy.getTabCycle(element, direction, len).then((cycle) => {
        expect(cycle).to.have.length(len);
        expect(correctCycle[direction]).to.have.string(cycle);
      });
    });
  }
);
