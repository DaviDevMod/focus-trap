/// <reference types="cypress" />

import { RequireExactlyOne } from 'type-fest';
import { TrapConfig } from '../../src/types';
import { keyCodeDefinitions } from 'cypress-real-events/keyCodeDefinitions';

type DropdownOptions = RequireExactlyOne<{ optionButtonName: string; itemsText: string[] }>;

// "cypress-real-events/commands/realPress" declares `KeyOrShortcut` locally, but it is not exported.
type KeyOrShortcut = (keyof typeof keyCodeDefinitions)[];

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

      buildTrap: (config?: TrapConfig) => void;

      openDropdownAndClickOptions: (dropdownButtonName: string, options: DropdownOptions) => void;

      submitForm: () => void;

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

// Even though chaining a child command to `cy` throws an error during tests, TS doesn't forbid this usage.
// Also the type annotation of the `subject` is completely ignored, hence it's purely documenting.
Cypress.Commands.add(
  'openDropdownAndClickOptions',
  { prevSubject: true },
  (subject: JQuery<HTMLElement>, dropdownButtonName, { optionButtonName, itemsText }) => {
    cy.wrap(subject).find(`button[name="${dropdownButtonName}"]`).click();

    if (optionButtonName) cy.wrap(subject).find(`button[name="${optionButtonName}"]`).click();
    else for (const itemText of itemsText) cy.wrap(subject).contains('li', itemText).click();
  }
);

Cypress.Commands.add('submitForm', { prevSubject: true }, (subject: JQuery<HTMLElement>) => {
  cy.wrap(subject).find('button[type="submit"]').click();
});

Cypress.Commands.add('buildTrap', (config) => {
  cy.get('form[name="Trap Controls"]').as('trapControls');

  cy.get('@trapControls').openDropdownAndClickOptions('Toggle Action Menu', {
    optionButtonName: 'Select BUILD Action',
  });

  cy.get('@trapControls').openDropdownAndClickOptions('Toggle roots Listbox', {
    itemsText: ['group 2', 'group 4'],
  });

  cy.get('@trapControls').submitForm();
});

// Fire a `Tab` event and return the `dataset.order` of the element that received the focus.
Cypress.Commands.add('getNextTabbedDatasetOrder', (direction = 'FORWARD') => {
  cy.focused().then(({ 0: origin }) => {
    const keysPressed: KeyOrShortcut = direction === 'FORWARD' ? ['Tab'] : ['Shift', 'Tab'];

    cy.realPress(keysPressed);

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
