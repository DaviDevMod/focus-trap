/// <reference types="cypress" />

context('Cover lines left behind by the main test suite.', () => {
  describe('Test how `focusTrap` handles looking for a destination in a trap with no tabbable elements.', () => {
    beforeEach(() => {
      const ID_UNTABBABLE_ELEMENT = 'C';
      // Need `initialFocus: false` otherwise the trap would throw when looking for the `initialFocus`
      // rather than when looking for a destination.
      cy.visitDemoAndBuildTrap({ roots: [ID_UNTABBABLE_ELEMENT], initialFocus: false });
    });

    // Need to tab away from elements with negative, zero and positive tab index
    // because `focusTrap` uses a different logic for each of these cases.

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
