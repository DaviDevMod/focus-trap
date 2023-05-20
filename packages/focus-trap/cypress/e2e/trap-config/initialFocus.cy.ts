/// <reference types="cypress" />

import { DEFAULT_ROOTS } from '../../support/commands';

context('Test the `initialFocus` trap configuration option.', () => {
  describe('An initial focus should always be given, unless `initialFocus` is set to `false`.', () => {
    it('By default, the initial focus should be given to the first tabbable in the trap.', () => {
      cy.visitDemoAndBuildTrap({ roots: DEFAULT_ROOTS });

      // TODO: this hardcoded ID is no good.
      cy.focused().invoke('attr', 'id').should('equal', 'E');
    });

    it('When `initialfocus` is set to `true`, the initial focus should be given to the first tabbable in the trap.', () => {
      cy.visitDemoAndBuildTrap({ roots: DEFAULT_ROOTS, initialFocus: true });

      // TODO: this hardcoded ID is no good.
      cy.focused().invoke('attr', 'id').should('equal', 'E');
    });

    it('If `initialfocus` is set to `false`, no initial focus should be given.', () => {
      cy.visitDemoAndBuildTrap({ roots: DEFAULT_ROOTS, initialFocus: false });

      cy.focused().should('not.exist');
    });

    it('The initial focus should be given to the element with the specified id', () => {
      cy.visitDemoAndBuildTrap({ roots: DEFAULT_ROOTS, initialFocus: 'B' });

      cy.focused().invoke('attr', 'id').should('equal', 'B');
    });

    it("When `initialfocus` is set to a string that doesn't match any `id` in the DOM, the initial focus should be given to the first tabbable in the trap.", () => {
      const ID_NOT_IN_DOM = 'nonononononono';

      cy.visitDemoAndBuildTrap({ roots: DEFAULT_ROOTS, initialFocus: ID_NOT_IN_DOM });

      cy.get(`#${ID_NOT_IN_DOM}`).should('not.exist');

      // TODO: this hardcoded ID is no good.
      cy.focused().invoke('attr', 'id').should('equal', 'E');
    });
  });
});
