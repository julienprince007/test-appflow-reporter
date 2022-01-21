/// <reference types="Cypress" />

context('Navigation', () => {
  beforeEach(() => {
    cy.login('gardienb@sowellapp.com', '123456')
  })

  it('Shows an existing issue', () => {
    // Listen to GET on API
    cy.server()
    cy.route('GET', '**/reporters/**/issues**').as('issuesLoaded')
    
    // ### HISTORY PAGE
    cy.wait('@issuesLoaded', {timeout: 5000}).its('status').should('eq', 200)
    cy.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from
      // failing the test
      console.log('Error occured')
      console.dir(err)
      return false
    })
    cy.get('[href="#/history"]').click()
    cy.url().should('include', '/history')
    cy.get(':nth-child(1) > .q-card > .q-link').click()
    
    // ### ISSUE DETAIL PAGE
    cy.url().should('include', '/history/')
    cy.get('.sw-title').should('contain', 'Demande')
  })
})