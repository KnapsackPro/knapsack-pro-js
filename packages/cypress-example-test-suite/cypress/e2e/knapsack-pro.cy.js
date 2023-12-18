describe('knapsackpro.com', () => {
  it('visits Knapsack Pro', () => {
    cy.on('uncaught:exception', (error) => {
      if (error.message.includes('Failed to resolve module specifier "application"')) {
        // knapsackpro.com polyfills ESModules,
        // but it still throws an error in the console connected with:
        // <script type="module">import "application"</script>
        return false // ignore error
      }

      return true
    })
    cy.visit('http://knapsackpro.com/')
    cy.contains('Knapsack Pro')
  })
})
