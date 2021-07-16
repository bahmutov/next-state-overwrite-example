/// <reference types="cypress" />

describe('Next.js app', () => {
  it('shows the default server-side greeting', () => {
    cy.visit('/')
    cy.contains('[data-cy=greeting]', 'Server-side says hello!').should(
      'be.visible',
    )
  })

  it('shows the text from the __NEXT_DATA__', () => {
    cy.visit('/')
      // visit yields the "window" object
      // and we can get nested property in a single command
      .its('__NEXT_DATA__.props.pageProps.experiments.greeting')
      .then((greeting) => {
        cy.contains('[data-cy=greeting]', greeting).should('be.visible')
      })
  })
})
