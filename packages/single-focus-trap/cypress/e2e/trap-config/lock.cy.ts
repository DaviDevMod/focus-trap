/// <reference types="cypress" />

context('Test the `lock` trap configuration option.', () => {
  before(() => cy.visitDemo());

  beforeEach(() => {
    cy.realPress('Escape');
    cy.get('form[data-cy="Trap Controls"]').as('trapControls');
  });

  describe('Clicks outside of the trap should be possible only when `lock` is set to the boolean `false`.', () => {
    // TODO: The fact is that the demo app uses `single-focus-trap` through `use-simple-focus-trap`,
    // which will `resolveConfig()` before calling `single-focus-trap` with default values already set.
    // There are many ways to solve this, but I think I'll go for unit tests just to practice with them.
    it.skip('Clicks outside of the trap should be prevented by default.');
    // This is not strictly necessary cause TS would prevent it, but it's still good for JS and non-typesafe code.
    it.skip('Clicks outside of the trap should be prevented when `lock` is set to an invalid value.');

    // TODO: This is just a limitation of the demo app, again, I gotta do some practice with unit testing.
    it.skip('`lock` should be used as handler for clicks outside of the trap, when passed as a function');

    it('Clicks outside of the trap should be prevented when `lock` is set to `true`.', () => {
      cy.buildTrap({ roots: ['group 2'], lock: true });

      cy.get('@trapControls').find(`button[data-cy="Toggle Action Menu"]`).click();

      cy.get('@trapControls').find('div[data-cy="Action Menu Items"]').should('not.exist');
    });

    it('The focus trap should not interfere with clicks when `lock` is set to `true`.', () => {
      cy.buildTrap({ roots: ['group 2'], lock: false });

      cy.get('@trapControls').find(`button[data-cy="Toggle Action Menu"]`).click();

      cy.get('@trapControls').find('div[data-cy="Action Menu Items"]').should('exist');
    });
  });
});
