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

  it('removes the text from __NEXT_DATA__', () => {
    const greeting = 'Cypress say Yo!'
    cy.visit('/', {
      onBeforeLoad: (win) => {
        let nextData

        Object.defineProperty(win, '__NEXT_DATA__', {
          set(o) {
            console.log('setting __NEXT_DATA__', o)
            // here is our change to modify the injected parsed data
            o.props.pageProps.experiments.greeting = greeting
            nextData = o
          },
          get() {
            return nextData
          },
        })
      },
    })
    cy.contains('[data-cy=greeting]', greeting).should('be.visible')
    // notice there is a React warning in the DevTools console
    // because the generated client-side HTML does not match
    // the server-side generated HTML
  })

  it('patches HTML and removes the text from __NEXT_DATA__', () => {
    const greeting = 'Cypress say Yo!'
    cy.intercept('/', (req) =>
      req.continue((res) => {
        res.body = res.body.replace(
          '>Server-side says hello!</',
          `>${greeting}</`,
        )
      }),
    )

    cy.visit('/', {
      onBeforeLoad: (win) => {
        let nextData

        Object.defineProperty(win, '__NEXT_DATA__', {
          set(o) {
            console.log('setting __NEXT_DATA__', o)
            // here is our change to modify the injected parsed data
            o.props.pageProps.experiments.greeting = greeting
            nextData = o
          },
          get() {
            return nextData
          },
        })
      },
    })
    cy.contains('[data-cy=greeting]', greeting).should('be.visible')
  })

  it('modifies __NEXT_DATA__ on navigation', () => {
    // let the default greeting show on the home page
    const defaultGreeting = 'Server-side says hello!'
    cy.visit('/')
    cy.contains('[data-cy=greeting]', defaultGreeting).should('be.visible')

    // the About page will make a fetch request to get
    // the server-side props, so we need to be ready
    const greeting = 'Testing hi'
    cy.intercept('_next/data/development/about.json', (req) => {
      // prevent the server from responding with 304
      // without an actual object
      delete req.headers['if-none-match']
      return req.continue((res) => {
        // let's use the same test greeting
        res.body.pageProps.experiments.greeting = greeting
      })
    })
    cy.contains('a', 'About').click()
    cy.location('pathname').should('equal', '/about')
    cy.contains('[data-cy=greeting]', greeting).should('be.visible')
  })
})
