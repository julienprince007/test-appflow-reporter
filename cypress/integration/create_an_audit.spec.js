/// <reference types="Cypress" />

context('Navigation', () => {
  const commonString = 'e2e test from create an audit '
  const randomString =
    Math.random()
      .toString(36)
      .substring(2, 15) +
    Math.random()
      .toString(36)
      .substring(2, 15)

  beforeEach(() => {
    cy.login('gardienb@sowellapp.com', '123456')
  })

  it('Prepare an audit without submit', () => {
    // Listen to GET on API
    cy.server()
    cy.route('GET', '**/checklists/**/checkpoints**').as('auditsLoaded')
    cy.route('GET', '**/reporters/**/issues**').as('issuesLoaded')
    cy.route('POST', '**/reports').as('reportPosted')

    // ### AUDITS PAGE
    cy.wait('@auditsLoaded', { timeout: 5000 })
      .its('status')
      .should('eq', 200)
    cy.get('[href="#/audits"]').click()
    cy.url().should('include', '/audits')
    cy.get('.q-collapsible > .q-collapsible-inner > :nth-child(1)').first().click()
    cy.get(
      '.q-collapsible > .q-collapsible-inner > :nth-child(2) > .q-collapsible-sub-item > .q-collapsible > .q-collapsible-inner > :nth-child(1)'
    ).first().click()
    cy.get(
      '.q-collapsible > .q-collapsible-inner > :nth-child(2) > .q-collapsible-sub-item > .q-collapsible > .q-collapsible-inner > :nth-child(2) > .q-collapsible-sub-item > .q-link'
    ).first().click()

    // ### AUDIT PAGE
    cy.url().should('include', '/audits')
    cy.get('#q-app > div > div')
      .find('main > .justify-center')
      .each(function (e) {
        return new Cypress.Promise(resolve => {
          setTimeout(() => {
            resolve(e.find('.col-auto > :nth-child(1)').click())
          }, 300)
        })
      })
    cy.get('#q-app > div > div > main > .justify-center')
      .first()
      .find('.col-auto > :nth-child(2)')
      .first()
      .click()

    // ### NEW ISSUE PAGE
    cy.url().should('include', '/issue?checkpoint=')
    cy.get(':nth-child(5) > .col > .q-field-content > .ui > .dropdown').click()
    cy.get(':nth-child(5) > .col > .q-field-content > .ui > .menu > :nth-child(1)').click()

    // Détails
    cy.get('.q-input-area').type(commonString + randomString + ' 1 of 3')
    // Priorité
    cy.get('.q-slider-handle-container > :nth-child(4)').click()
    // Send issue
    cy.get(
      '[style="padding: 15px 0px;"] > .text-center > .q-btn > .q-btn-inner'
    ).click()

    // ### AUDITS PAGE AGAIN
    cy.url().should('not.include', '/issue')
    cy.get('#q-app > div > div > main > .justify-center')
      .first()
      .find('.col-auto > :nth-child(2)')
      .first()
      .should('have.class', 'bg-negative')
    cy.get('#q-app > div > div > main > .justify-center')
      .last()
      .find('.col-auto > :nth-child(2)')
      .first()
      .click()

    // ### NEW ISSUE PAGE
    cy.url().should('include', '/issue')
    cy.get(':nth-child(5) > .col > .q-field-content > .ui > .dropdown').click()
    cy.get(':nth-child(5) > .col > .q-field-content > .ui > .menu > :nth-child(1)').click()
    // Détails
    cy.get('.q-input-area').type(commonString + randomString + ' 2 of 3')
    // Priorité
    cy.get('.q-slider-handle-container > :nth-child(4)').click()
    // Send issue
    cy.get(
      '[style="padding: 15px 0px;"] > .text-center > .q-btn > .q-btn-inner'
    ).click()

    // ### AUDITS PAGE AGAIN
    cy.url().should('not.include', '/issue')
    cy.get('#q-app > div > div > main > .justify-center')
      .last()
      .find('.col-auto > :nth-child(2)')
      .first()
      .should('have.class', 'bg-negative')
    cy.get('#q-app > div > div > main > .justify-center')
      .last()
      .find('.col-auto > :nth-child(2)')
      .first()
      .click()

    // ### NEW ISSUE PAGE
    cy.url().should('include', '/issue')
    cy.get(':nth-child(5) > .col > .q-field-content > .ui > .dropdown').click()
    cy.get(':nth-child(5) > .col > .q-field-content > .ui > .menu > :nth-child(1)').click()
    // Détails
    cy.get('.q-input-area').type(commonString + randomString + ' 3 of 3')
    // Priorité
    cy.get('.q-slider-handle-container > :nth-child(4)').click()
    // Send issue
    cy.get(
      '[style="padding: 15px 0px;"] > .text-center > .q-btn > .q-btn-inner'
    ).click()

    // ### AUDITS PAGE AGAIN
    cy.url().should('not.include', '/issue')
    cy.get('#q-app > div > div > main > .justify-center')
      .last()
      .find('.col-auto > :nth-child(2)')
      .first()
      .should('have.class', 'bg-negative')
    // Comment report save for now
    // cy.get('.text-center > .q-btn').click()
    // cy.wait('@reportPosted', {timeout: 5000}).its('status').should('eq', 201)
    cy.get('.q-toolbar > :nth-child(1) > .q-btn-inner > .q-icon').click()
    cy.get('[href="#/history"]').click()

    // ### HISTORY PAGE
    cy.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from
      // failing the test
      console.log('Error occured')
      console.dir(err)
      return false
    })
    cy.wait('@issuesLoaded')
      .its('status')
      .should('eq', 200)
    cy.url().should('include', '/history')
    cy.get(
      ':nth-child(1) > .q-card > .q-link > .q-item-main > .comment'
    ).should('contain', randomString + ' 3 of 3')
  })
})
