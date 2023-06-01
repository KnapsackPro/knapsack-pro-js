describe('example.cypress.io', () => {
  it('visits Kitchen Sink', () => {
    cy.visit('https://example.cypress.io')
    cy.contains('Kitchen Sink')
  })
})