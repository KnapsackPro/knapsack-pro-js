describe('knapsackpro.com', () => {
  it('visits Knapsack Pro', () => {
    cy.visit('http://knapsackpro.com/')
    cy.contains('Knapsack Pro')
  })
})
