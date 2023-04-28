/// <reference types="cypress" />

import { DEFAULT_ROOTS } from '../../support/commands';

context('Test the `lock` trap configuration option.', () => {
  beforeEach(() => {
    cy.visitDemo();
    cy.get('form[data-cy="Trap Controls"]').as('trapControls');
  });

  describe('Clicks outside of the trap should be possible only when `lock` is set to the boolean `false`.', () => {
    // TODO: Write unit tests.
    // The following cases can't be tested through the current demo app, because in it `use-simple-focus-trap`
    // is called with default values already set. Refactoring the demo would solve the problem only for
    // `use-simple-focus-trap`, which would then call `single-focus-trap` with default values already set anyway.
    it.skip('Clicks outside of the trap should be prevented by default.');
    // This is not really necessary with TS.
    it.skip('Clicks outside of the trap should be prevented when `lock` is set to an invalid value.');

    // TODO: This is just a limitation of the demo app, which may be refactored to test this case.
    it.skip('`lock` should be used as handler for clicks outside of the trap, when passed as a function');

    it('Clicks outside of the trap should be prevented when `lock` is set to `true`.', () => {
      cy.buildTrap({ roots: DEFAULT_ROOTS, lock: true });

      cy.get('@trapControls').find(`button[data-cy="Toggle Action Menu"]`).click();

      cy.get('@trapControls').find('div[data-cy="Action Menu Items"]').should('not.exist');
    });

    it('The focus trap should not interfere with clicks when `lock` is set to `true`.', () => {
      cy.buildTrap({ roots: DEFAULT_ROOTS, lock: false });

      cy.get('@trapControls').find(`button[data-cy="Toggle Action Menu"]`).click();

      cy.get('@trapControls').find('div[data-cy="Action Menu Items"]').should('exist');
    });
  });
});
