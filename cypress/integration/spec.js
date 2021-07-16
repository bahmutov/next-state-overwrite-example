/// <reference types="cypress" />

describe('Next.js app', () => {
  it('shows the default server-side greeting', () => {
    cy.visit('/')
    cy.contains('[data-cy=greeting]', 'Server-side says hello!').should(
      'be.visible',
    )
  })
})
