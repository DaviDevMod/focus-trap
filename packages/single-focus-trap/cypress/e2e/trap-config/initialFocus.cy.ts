/// <reference types="cypress" />

context('Test the `initialFocus` trap configuration option.', () => {
  before(() => cy.visitDemo());

  beforeEach(() => cy.realPress('Escape'));

  describe('An initial focus should always be given, unless `initialFocus` is set to `false`.', () => {
    // TODO: The fact is that the demo app uses `single-focus-trap` through `use-simple-focus-trap`,
    // which will `resolveConfig()` before calling `single-focus-trap` with default values already set.
    // There are many ways to solve this, but I think I'll go for unit tests just to practice with them.
    it.skip('By default, the initial focus should be given to the first tabbable in the trap.');
    it.skip(
      "When `initialfocus` is set to a string that doesn't match any `id` in the DOM, the initial focus should be given to the first tabbable in the trap."
    );
    it.skip(
      'When `initialfocus` is set to an invalid value, the initial focus should be given to the first tabbable in the trap.'
    );

    it('When `initialfocus` is set to `true`, the initial focus should be given to the first tabbable in the trap.', () => {
      // The demo app will convert the string to actual boolean before feeding the config to
      // `use-simple-focus-trap` which in turn will feed the config to `single-focus-trap`.
      cy.buildTrap({ roots: ['group 2'], initialFocus: 'true' });

      cy.focused().invoke('attr', 'id').should('equal', 'E');
    });

    it('If `initialfocus` is set to `false`, no initial focus should be given.', () => {
      cy.buildTrap({ roots: ['group 2'], initialFocus: 'false' });

      cy.get('form[data-cy="Trap Controls"]').find('button[type="submit"]').should('be.focused');
    });

    it('The initial focus should be given to the element with the specified id', () => {
      cy.buildTrap({ roots: ['group 2'], initialFocus: 'B' });

      cy.focused().invoke('attr', 'id').should('equal', 'B');
    });
  });
});
