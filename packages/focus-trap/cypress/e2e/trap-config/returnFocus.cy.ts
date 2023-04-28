/// <reference types="cypress" />

import { DEFAULT_ROOTS } from '../../support/commands';

context('Test the `returnFocus` trap configuration option.', () => {
  beforeEach(() => cy.visitDemo());

  describe('A return focus should always be given, unless `returnFocus` is set to `false`.', () => {
    // TODO: Write unit tests.
    // The following cases can't be tested through the current demo app, because in it `use-simple-focus-trap`
    // is called with default values already set. Refactoring the demo would solve the problem only for
    // `use-simple-focus-trap`, which would then call `single-focus-trap` with default values already set anyway.
    it.skip(
      'By default, the return focus should be given to what was the active element at the time the trap was built.'
    );
    it.skip(
      "When `returnfocus` is set to a string that doesn't match any `id` in the DOM, the return focus should be given to what was the active element at the time the trap was built."
    );
    // This is not really necessary with TS.
    it.skip(
      'When `returnfocus` is set to an invalid value, the return focus should be given to what was the active element at the time the trap was built.'
    );

    it('When `returnfocus` is set to `true`, the return focus should be given to what was the active element at the time the trap was built', () => {
      // The demo app will convert the string to actual boolean before feeding the config to
      // `use-simple-focus-trap` which in turn will feed the config to `single-focus-trap`.
      cy.buildTrap({ roots: DEFAULT_ROOTS, returnFocus: 'true' });

      cy.get('form[data-cy="Trap Controls"]').find('button[type="submit"]').as('submitButton').should('not.be.focused');

      cy.realPress('Escape');

      cy.get('@submitButton').should('be.focused');
    });

    it('If `returnfocus` is set to `false`, no return focus should be given.', () => {
      cy.buildTrap({ roots: DEFAULT_ROOTS, returnFocus: 'false' });

      cy.focused().as('activeElement');

      cy.realPress('Escape');

      cy.get('@activeElement').should('be.focused');
    });

    it('The return focus should be given to the element with the specified id', () => {
      cy.buildTrap({ roots: DEFAULT_ROOTS, returnFocus: 'B' });

      cy.get('#B').as('elementB').should('not.be.focused');

      cy.realPress('Escape');

      cy.get('@elementB').should('be.focused');
    });
  });
});
