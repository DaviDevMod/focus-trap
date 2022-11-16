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
  tabsPerCycle?: number;
  check?: boolean;
}

type DropdownOptions = RequireExactlyOne<{ optionButtonName: string; itemsText: string | string[] }>;

export const DEFAULT_ROOTS = ['group 2', 'group 4'];

const DEFAULT_EXPECTED_ORDER = '0123456';

// A minimum of `2` is required to get meaningfull tests. Larger values make the tests last longer.
const DEFAULT_TABS_PER_CYCLE = 2;

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

      getNextTabbedDatasetOrder: (direction: Direction, check: boolean) => Cypress.Chainable<string>;

      getTabCycle: (
        $origin: JQuery<HTMLElement> | null,
        direction: Direction,
        len: number,
        check: boolean,
        firstCall: boolean,
        cycle: string
      ) => Cypress.Chainable<string>;

      assertTabCycle: (
        collection: JQuery<HTMLElement>,
        direction: Direction,
        len: number,
        repeatedOrder: string,
        check: boolean
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

  cy.get<HTMLButtonElement>('@switchControlsButton').then(($switchControlsButton) => {
    if ($switchControlsButton.get(0).dataset.cy?.endsWith(formName)) $switchControlsButton.get(0).click();
  });
});

Cypress.Commands.add(
  'openDropdownAndChoose',
  { prevSubject: ['element'] },
  (form, dropdownButtonName, { optionButtonName, itemsText }) => {
    cy.wrap(form).find(`button[data-cy="${dropdownButtonName}"]`).click();

    if (optionButtonName !== undefined) cy.wrap(form).find(`button[data-cy="${optionButtonName}"]`).click();
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
    .then(($switchButton) => {
      if ($switchButton.get(0).dataset.headlessuiState?.includes('checked') !== toggleTo) $switchButton.get(0).click();
    });
});

Cypress.Commands.add('resetForm', { prevSubject: ['element'] }, (form) => {
  cy.wrap(form).find('button[type="reset"]').click({ force: true });
});

Cypress.Commands.add('submitForm', { prevSubject: ['element'] }, (form) => {
  cy.wrap(form).find('button[type="submit"]').click();
});

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
      itemsText: initialFocus,
    });
  }

  if (returnFocus !== undefined) {
    cy.get('@trapControls').openDropdownAndChoose('Toggle returnFocus Listbox', {
      itemsText: returnFocus,
    });
  }

  if (lock !== undefined) cy.get('@trapControls').toggleSwitch('Toggle lock Switch', lock);

  if (escape !== undefined) cy.get('@trapControls').toggleSwitch('Toggle escape Switch', escape);

  cy.get('@trapControls').submitForm();
});

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
Cypress.Commands.add('getNextTabbedDatasetOrder', (direction, check) => {
  cy.focused().then(($origin) => {
    cy.realPress(direction === 'FORWARD' ? 'Tab' : ['Shift', 'Tab']);

    cy.focused().then(($destination) => {
      if (!$destination.get(0).dataset.order) {
        throw new Error("After a `Tab` key press, the focus landed on an element with no 'data-order' attribute.");
      }

      // Check that elements outside the trap pass the focus to the right elements inside the trap.
      // This check is possible only for a trap with `roots: DEFAULT_ROOTS` and no patched elements.
      // It is run exclusively by the tests in "tab-cycle.cy.ts".
      // Making it available to arbitrary traps would require some (non-trivial) logic to modify
      // the `data-forward` and `data-backward` attributes of every element in `@possibleTabbables`.
      // All the effort has been made to ensure that "tab-cycle.cy.ts" checks any possible relevant scenario.**
      // As a side note, skipping this check allows for a faster algorithm to verify the tab cycle.
      // **Actually I already know from manual testing that there's a bug in single-focus-trap that can be exposed
      // in the tests by modifying the basic setup tested by "tab-cycle.cy.ts". But that's for another commit.
      if (check && !$origin.get(0).dataset.order) {
        expect($origin.get(0).dataset[direction.toLowerCase()]).to.equal($destination.get(0).dataset.order);
      }

      return $destination.get(0).dataset.order;
    });
  });
});

// Call `getNextTabbedDatasetOrder` multiple times and return a concatenation of the orders of the focused elements.
Cypress.Commands.add('getTabCycle', (origin, direction, len, check, firstCall, cycle) => {
  if (firstCall) {
    if (len < 2) throw new Error('Please provide a tab cycle length greater than 1.');
    if (!Number.isInteger(len)) throw new Error('Please provide an integer tab cycle length.');
    cy.wrap(origin).focus();
  }
  cy.getNextTabbedDatasetOrder(direction, check).then((order) =>
    len === 1 ? cycle + order : cy.getTabCycle(null, direction, len - 1, check, false, cycle + order)
  );
});

// Call `getTabCycle` and assert whether its returned tab cycle is a substring of `repeatedOrder`.
Cypress.Commands.add('assertTabCycle', (collection, direction, len, repeatedOrder, check) => {
  cy.wrap(collection)
    .then(($collection) => (check ? $collection : $collection.slice(0, 1)))
    .each(($origin) => {
      cy.getTabCycle($origin, direction, len, check, true, '').then((cycle) => {
        expect(cycle).to.have.length(len);
        expect(repeatedOrder).to.have.string(cycle);
      });
    });
});

// Call `assertTabCycle` once or twice, with the `correctTabCycle`.
Cypress.Commands.add(
  'verifyTabCycle',
  { prevSubject: ['element'] },
  (
    collection,
    {
      direction = 'EVERY',
      tabsPerCycle = DEFAULT_TABS_PER_CYCLE,
      expectedOrder = DEFAULT_EXPECTED_ORDER,
      check = false,
    } = {
      direction: 'EVERY',
      tabsPerCycle: DEFAULT_TABS_PER_CYCLE,
      expectedOrder: DEFAULT_EXPECTED_ORDER,
      check: false,
    }
  ) => {
    if (expectedOrder.length < 1) {
      throw new Error("It's not possible to build an empty trap. Please provide a meaningful `expectedOrder`.");
    }

    const repeatedOrder = {
      FORWARD: expectedOrder.repeat(check ? Math.ceil((tabsPerCycle - 1) / expectedOrder.length) + 1 : 2),
      get BACKWARD() {
        return this.FORWARD.split('').reverse().join('');
      },
    };

    const cycleLength = check ? tabsPerCycle : expectedOrder.length;

    const directions: Direction[] = direction === 'EVERY' ? ['FORWARD', 'BACKWARD'] : [direction];

    for (const d of directions) cy.assertTabCycle(collection, d, cycleLength, repeatedOrder[d], check);
  }
);
