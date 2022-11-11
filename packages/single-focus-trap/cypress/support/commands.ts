/// <reference types="cypress" />

import { RequireExactlyOne } from 'type-fest';

interface TestTrapConfig {
  roots: string[];
  initialFocus?: string;
  returnFocus?: string;
  lock?: boolean;
  escape?: boolean;
}

interface ElementPatch {
  id: string;
  tabIndex?: string;
  disabled?: boolean;
  display?: boolean;
}

type Direction = 'FORWARD' | 'BACKWARD';

interface TabCycleConfig {
  direction?: Direction | 'EVERY';
  expectedOrder?: string;
  cycleLength?: number;
}

type DropdownOptions = RequireExactlyOne<{ optionButtonName: string; itemsText: string | string[] }>;

export const EXPECTED_ORDER_FROM_GROUPS_2_4 = '0123456';

export const EXPECTED_ORDER_FROM_F_G_H = '345';

// A minimum of `2` is required to get meaningfull tests. Larger values make the tests last longer.
export const DEFAULT_TEST_CYCLE_LENGTH = 2;

declare global {
  namespace Cypress {
    interface Chainable {
      visitDemo: (path?: string) => void;

      switchControlsFormTo: (formName: 'Trap Controls' | 'Element Controls') => void;

      openDropdownAndChoose: (dropdownButtonName: string, options: DropdownOptions) => void;

      toggleSwitch: (switchName: string, toggleTo: boolean) => void;

      resetForm: () => void;

      submitForm: () => void;

      buildTrap: (config: TestTrapConfig) => void;

      patchElement: (patch: ElementPatch) => void;

      getNextTabbedDatasetOrder: (direction?: Direction) => Cypress.Chainable<string>;

      getTabCycle: (
        from: JQuery<HTMLElement>,
        direction?: Direction,
        len?: number,
        firstCall?: boolean,
        cycle?: string
      ) => Cypress.Chainable<string>;

      assertTabCycle: (
        collection: JQuery<HTMLElement>,
        direction?: Direction,
        len?: number,
        correctCycle?: string
      ) => void;

      verifyTabCycle: (config?: TabCycleConfig) => void;
    }
  }
}

Cypress.Commands.add('visitDemo', (path = '/') => {
  cy.visit(path);
  // Check "_app.tsx" in the demo app; https://docs.cypress.io/api/commands/window#Start-tests-when-app-is-ready
  cy.window().should('have.property', 'appReady', true);
});

Cypress.Commands.add('switchControlsFormTo', (formName) => {
  cy.get('button[data-cy$=" Controls"]').as('switchControlsButton').should('have.length', 1);

  cy.get<HTMLButtonElement>('@switchControlsButton').then(({ 0: switchControlsButton }) => {
    if (switchControlsButton.dataset.cy.endsWith(formName)) switchControlsButton.click();
  });
});

Cypress.Commands.add(
  'openDropdownAndChoose',
  { prevSubject: ['element'] },
  (form, dropdownButtonName, { optionButtonName, itemsText }) => {
    cy.wrap(form).find(`button[data-cy="${dropdownButtonName}"]`).click();

    if (optionButtonName) cy.wrap(form).find(`button[data-cy="${optionButtonName}"]`).click();
    else {
      if (typeof itemsText === 'string') cy.wrap(form).contains('li', itemsText).click();
      else {
        for (const itemText of itemsText) cy.wrap(form).contains('li', itemText).click();
        cy.realPress('Escape'); // Close the <Listbox multiple={true}>
      }
    }
  }
);

Cypress.Commands.add('toggleSwitch', { prevSubject: ['element'] }, (form, switchName, toggleTo) => {
  cy.wrap(form)
    .find(`button[data-cy="${switchName}"]`)
    .then(({ 0: switchButton }) => {
      if (switchButton.dataset.headlessuiState.includes('checked') !== toggleTo) switchButton.click();
    });
});

Cypress.Commands.add('resetForm', { prevSubject: ['element'] }, (form) => {
  cy.wrap(form).find('button[type="reset"]').click({ force: true });
});

Cypress.Commands.add('submitForm', { prevSubject: ['element'] }, (form) => {
  cy.wrap(form).find('button[type="submit"]').click();
});

// For some reason all the config props are missing `| undefined` even though only `roots` is required.
// At least TS complains about wrong calls. But still the typing is broken inside the function.
// I found no relevant issues and I have no intention to open one right now.
Cypress.Commands.add('buildTrap', ({ roots, initialFocus, returnFocus, lock, escape }) => {
  // Demolish an eventual previous trap.
  // TODO: if in the previous trap `(!escape && lock)` there is no way to override the previous trap.
  cy.realPress('Escape');

  cy.switchControlsFormTo('Trap Controls');

  cy.get('form[data-cy="Trap Controls"]').as('trapControls');

  cy.get('@trapControls').resetForm();

  cy.get('@trapControls').openDropdownAndChoose('Toggle Action Menu', {
    optionButtonName: 'Select BUILD Action',
  });

  cy.get('@trapControls').openDropdownAndChoose('Toggle roots Listbox', {
    itemsText: roots,
  });

  if (initialFocus !== undefined) {
    cy.get('@trapControls').openDropdownAndChoose('Toggle initialFocus Listbox', {
      itemsText: initialFocus ?? 'true',
    });
  }

  if (returnFocus !== undefined) {
    cy.get('@trapControls').openDropdownAndChoose('Toggle returnFocus Listbox', {
      itemsText: returnFocus ?? 'true',
    });
  }

  if (lock !== undefined) cy.get('@trapControls').toggleSwitch('Toggle lock Switch', lock);

  if (escape !== undefined) cy.get('@trapControls').toggleSwitch('Toggle escape Switch', escape);

  cy.get('@trapControls').submitForm();
});

// Same as with `buildTrap`: optional properties are missing `| undefined`.
Cypress.Commands.add('patchElement', ({ id, tabIndex, disabled, display }) => {
  cy.switchControlsFormTo('Element Controls');

  cy.get('form[data-cy="Element Controls"]').as('trapElementControls');

  cy.get('@trapElementControls').openDropdownAndChoose('Toggle id Listbox', { itemsText: id });

  if (tabIndex !== undefined) {
    cy.get('@trapElementControls').openDropdownAndChoose('Toggle tabindex Listbox', { itemsText: tabIndex });
  }

  if (disabled !== undefined) cy.get('@trapElementControls').toggleSwitch('Toggle disabled Switch', disabled);

  if (display !== undefined) cy.get('@trapElementControls').toggleSwitch('Toggle display Switch', display);

  cy.get('@trapElementControls').submitForm();
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

      // Reachable by commenting out `cy.builtTrap()` in tests. Should return `undefined`. Needs some investigation.
      if (!destination.dataset.order) throw new Error('Somehow cypress would return `destinatioon`.');

      return destination.dataset.order;
    });
  });
});

// Call `getNextTabbedDatasetOrder` multiple times and return a concatenation of the orders of the focused elements.
Cypress.Commands.add('getTabCycle', (origin, direction = 'FORWARD', len = 2, firstCall = true, cycle = '') => {
  if (firstCall) {
    if (len < 2) throw new Error('Please provide a tab cycle length greater than 1.');
    if (!Number.isInteger(len)) throw new Error('Please provide an integer tab cycle length.');
    cy.wrap(origin).focus();
  }
  cy.getNextTabbedDatasetOrder(direction).then((order) =>
    len === 1 ? cycle + order : cy.getTabCycle(null, direction, len - 1, false, cycle + order)
  );
});

// Call `getTabCycle` and assert whether its returned tab cycle is a substring of `correctCycle`.
Cypress.Commands.add('assertTabCycle', (collection, direction = 'FORWARD', len = 2, correctCycle = '') => {
  cy.wrap(collection).each((element) => {
    cy.getTabCycle(element, direction, len).then((cycle) => {
      expect(cycle).to.have.length(len);
      expect(correctCycle).to.have.string(cycle);
    });
  });
});

// Call `assertTabCycle` once or twice, with the `correctTabCycle`.
Cypress.Commands.add(
  'verifyTabCycle',
  { prevSubject: ['element'] },
  (
    collection,
    { direction = 'EVERY', cycleLength = DEFAULT_TEST_CYCLE_LENGTH, expectedOrder = EXPECTED_ORDER_FROM_GROUPS_2_4 } = {
      direction: 'EVERY',
      cycleLength: DEFAULT_TEST_CYCLE_LENGTH,
      expectedOrder: EXPECTED_ORDER_FROM_GROUPS_2_4,
    }
  ) => {
    const correctCycle = {
      FORWARD: expectedOrder.repeat(Math.ceil(cycleLength / expectedOrder.length) + 1),
      get BACKWARD() {
        return this.FORWARD.split('').reverse().join('');
      },
    };

    const directions: Direction[] = direction === 'EVERY' ? ['FORWARD', 'BACKWARD'] : [direction];

    for (const d of directions) cy.assertTabCycle(collection, d, cycleLength, correctCycle[d]);
  }
);
