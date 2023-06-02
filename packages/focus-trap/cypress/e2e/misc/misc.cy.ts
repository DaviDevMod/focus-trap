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

  // Need to tab away from elements with negative, zero and positive tab index
  // because `focusTrap` uses a different logic for each of these cases.
  describe('Test how `focusTrap` handles looking for a destination in a trap with no tabbable elements.', () => {
    beforeEach(() => {
      const ID_UNTABBABLE_ELEMENT = 'C';
      // Need `initialFocus: false` otherwise the trap would throw when looking for the `initialFocus`
      // rather than when looking for a destination.
      cy.visitDemoAndBuildTrap({ roots: [ID_UNTABBABLE_ELEMENT], initialFocus: false });
    });

    it('Should throw an error when tabbing away from an element with negative tab index.', () => {
      const ID_NEGATIVE_TAB_INDEX = 'C';
      cy.tabbingShouldThrowBecauseThereAreNoTabbables(ID_NEGATIVE_TAB_INDEX);
    });

    it('Should throw an error when tabbing away from an element with zero tab index.', () => {
      const ID_ZERO_TAB_INDEX = 'B';
      cy.tabbingShouldThrowBecauseThereAreNoTabbables(ID_ZERO_TAB_INDEX);
    });

    it('Should throw an error when tabbing away from an element with positive tab index.', () => {
      const ID_POSITIVE_TAB_INDEX = 'A';
      cy.tabbingShouldThrowBecauseThereAreNoTabbables(ID_POSITIVE_TAB_INDEX);
    });
  });
});
