/// <reference types="cypress" />

context('Cover lines left behind by the main test suite.', () => {
  describe('Test behaviour of `focusTrap` when called with duplicate root elements.', () => {
    it('Should remove duplicate roots and log a warning.', () => {
      const CHOSEN_ROOT = 'A';
      const REPETITIONS = 5;
      const DUPLICATE_ROOTS = new Array(REPETITIONS).fill(CHOSEN_ROOT);

      cy.visitDemoAndBuildTrap(DUPLICATE_ROOTS);

      cy.get('@consoleWarn').should(
        'be.calledWith',
        'Duplicate elements were found in the "roots" array. They have been deduplicated.'
      );

      // This log comes from the demo app.
      // There's no other way to know whether the `roots` have been actually deduped.
      cy.get('@consoleLog').should('be.calledWith', 'roots.length: 1');
    });
  });
});
