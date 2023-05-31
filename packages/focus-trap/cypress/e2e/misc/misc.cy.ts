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

  // In the main test suite, elements in the focus trap are eterogeneous in tab index and since
  // the algorithm to find a default `initailFocus` starts by looking only at elements with a positive tab index
  // it always returns early, leaving a few lines of code uncovered.
  describe('Test behaviour of a focus trap with no elements with a positive tab index.', () => {
    it('Should give the default `initialFocus` to the first element with a zero tab index.', () => {
      // 'C' has a negative tab index.
      const ROOTS_WITH_NO_POSITIVE_TABINDEXES = ['C', 'F', 'G', 'H'];
      const ID_FIRST_ZERO_TAB_INDEX = 'F';

      cy.visitDemoAndBuildTrap(ROOTS_WITH_NO_POSITIVE_TABINDEXES);

      cy.focused().invoke('attr', 'id').should('equal', ID_FIRST_ZERO_TAB_INDEX);
    });
  });
});
