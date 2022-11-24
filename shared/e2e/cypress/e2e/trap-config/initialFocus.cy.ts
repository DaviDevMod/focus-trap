/// <reference types="cypress" />

import { DEFAULT_ROOTS } from '../../support/commands';

context('Test the `initialFocus` trap configuration option.', () => {
  before(() => cy.visitDemo());

  beforeEach(() => cy.realPress('Escape'));

  describe('An initial focus should always be given, unless `initialFocus` is set to `false`.', () => {
    // TODO: Write unit tests.
    // The following cases can't be tested through the current demo app, because in it `use-simple-focus-trap`
    // is called with default values already set. Refactoring the demo would solve the problem only for
    // `use-simple-focus-trap`, which would then call `single-focus-trap` with default values already set anyway.
    it.skip('By default, the initial focus should be given to the first tabbable in the trap.');
    it.skip(
      "When `initialfocus` is set to a string that doesn't match any `id` in the DOM, the initial focus should be given to the first tabbable in the trap."
    );
    // This is not really necessary with TS.
    it.skip(
      'When `initialfocus` is set to an invalid value, the initial focus should be given to the first tabbable in the trap.'
    );

    it('When `initialfocus` is set to `true`, the initial focus should be given to the first tabbable in the trap.', () => {
      // The demo app will convert the string to actual boolean before feeding the config to
      // `use-simple-focus-trap` which in turn will feed the config to `single-focus-trap`.
      cy.buildTrap({ roots: DEFAULT_ROOTS, initialFocus: 'true' });

      cy.focused().invoke('attr', 'id').should('equal', 'E');
    });

    it('If `initialfocus` is set to `false`, no initial focus should be given.', () => {
      cy.buildTrap({ roots: DEFAULT_ROOTS, initialFocus: 'false' });

      cy.get('form[data-cy="Trap Controls"]').find('button[type="submit"]').should('be.focused');
    });

    it('The initial focus should be given to the element with the specified id', () => {
      cy.buildTrap({ roots: DEFAULT_ROOTS, initialFocus: 'B' });

      cy.focused().invoke('attr', 'id').should('equal', 'B');
    });
  });
});
