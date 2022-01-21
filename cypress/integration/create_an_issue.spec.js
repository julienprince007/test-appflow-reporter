/// <reference types="Cypress" />

context('Navigation', () => {
  const commonString = 'e2e test from create an issue '
  const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

  beforeEach(() => {
    cy.login('gardienb@sowellapp.com', '123456')
  })

  it('Create an issue', () => {
    // Listen to GET on API
    cy.server()
    cy.route('GET', '**/companies/**/categories**').as('categoriesLoaded')
    cy.route('GET', '**/checklists/**/checkpoints**').as('buildingsLoaded')
    cy.route('GET', '**/reporters/**/issues**').as('issuesLoaded')

    // ### CATEGORIES PAGE
    cy.wait('@issuesLoaded', {timeout: 5000}).its('status').should('eq', 200)
    cy.url().should('include', '/categories')
    cy.get('.items-start > .col > .q-btn').should('have.lengthOf', 2)
    cy.wait('@buildingsLoaded', {timeout: 5000}).its('status').should('eq', 200)
    cy.get('.items-start > :nth-child(1)').click()

    // ### SUB CATEGORIES PAGE
    cy.url().should('include', '/childs')
    cy.get('.sw-title').should('contain', 'Sécurité')
    cy.get('.col-6').should('have.lengthOf', 7)
    cy.get('.row.q-py-md > :nth-child(1) > .q-btn').click()

    // ### NEW ISSUE PAGE
    cy.url().should('include', '/issue')
    // Résidence
    cy.get(':nth-child(3) > .col > .q-field-content > .ui > .dropdown').click()
    cy.wait(500)
    cy.get(':nth-child(3) > .col > .q-field-content > .ui > .menu > :nth-child(1)').click()
    // Adresse
    cy.get(':nth-child(4) > .col > .q-field-content > .ui > .dropdown').click()
    cy.wait(500)
    cy.get(':nth-child(4) > .col > .q-field-content > .ui > .menu > :nth-child(1)').click()
    // Détails
    cy.get('.q-input-area').type(commonString + randomString)
    // Priorité
    cy.get('.q-slider-handle-container > :nth-child(2)').click()
    // Locale
    cy.get('[style="opacity: 1;"]').click()
    // Send issue
    cy.get('[style="padding: 15px 0px;"] > .text-center > .q-btn > .q-btn-inner').click()

    // ### HISTORY PAGE
    cy.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from
      // failing the test
      console.log('Error occured')
      console.dir(err)
      return false
    })
    cy.wait('@issuesLoaded').its('status').should('eq', 200)
    cy.url().should('include', '/history')
    cy.get(':nth-child(1) > .q-card > .q-link > .q-item-main > .comment').should('contain', randomString)
  })
})
