/// <reference types="cypress" />
import "cypress-localstorage-commands"

describe('Login test', () => {

  // items in the cart
  var items = new Array()

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('session-username')
    it('new cookie', () => {
      cy.setCookie('session-username', 'standard_user')
    })
    cy.restoreLocalStorage()
  })

  afterEach(() => {
    cy.saveLocalStorage()
  })

  it('Succesfull login', () => {
    cy.visit('https://www.saucedemo.com')
    let username = "standard_user"
    let pw = "secret_sauce";
    cy.get('.login_wrapper-inner')
      .find('[type="text"]')
      .clear()
      .type(username)
    cy.get('.login_wrapper-inner')
      .find('[type="password"]')
      .clear()
      .type(pw)
    cy.get('[data-test="login-button"]')
      .should('contain', 'Login')
      .click()

    // confirm landing page  
    cy.url().should('equal', 'https://www.saucedemo.com/inventory.html')
  })

  it('Sort items by price', () => {
    cy.get('[data-test="product_sort_container"]')
      .select('lohi')

    // confirm the selected value
    cy.get('[data-test="product_sort_container"]')
      .should('have.value', 'lohi')
  })

  function addItem(order, index) {
    let itemIndex = ':nth-child'.concat('(', index, ') > .inventory_item_description ')
    // add item
    cy.get(itemIndex).within(() => {
      cy.get('.pricebar > .btn_primary').click({
        force: true
      })
    })
    // Rremember add item id
    cy.get(itemIndex).within(() => {
      cy.get(' .inventory_item_label > a').invoke('attr', 'id')
        .then(id => {
          items[order] = id
        })
    })
  }

  it('Add items to the cart', () => {
    // Calculate invetory list size
    cy.get('.inventory_item').then(inventoryItems => {
      // Add least expensive item (after sorting it is on position 1)
      addItem(0, 1)
      // Add most expensive item (after sorting it is on position 6)
      addItem(1, inventoryItems.length)
      // chek that 2 items are in cart  
    })

    cy.get('.shopping_cart_badge').should('contain', '2')
  })

  function checkItem(order, index) {
    cy.get(':nth-child'.concat('(', index, ') > .cart_item_label > a')).invoke('attr', 'id').should('contain', items[order])
  }


  it('Go to shoping cart', () => {
    // Enter in shoping cart
    cy.get('.shopping_cart_link').click()
    // Check previously added items
    checkItem(0, 3)
    checkItem(1, 4)

    // goto checkout
    cy.get('[data-test="checkout"]')
      .click({
        force: true
      });


    //checkout form 
    cy.get('[data-test="firstName"]').type('Vesna')
    cy.get('[data-test="lastName"]').type('Petkovic')
    cy.get('[data-test="postalCode"]').type('11000')
    cy.get('[data-test="continue"]').click();
    cy.get('[data-test="finish"]').click();
    // confirm landing page  
    cy.url().should('equal', 'https://www.saucedemo.com/checkout-complete.html')
  })

  it('Log out', () => {
    cy.get('#react-burger-menu-btn')
      .click()
    cy.get('#logout_sidebar_link')
      .click()
    // confirm landing page  
    cy.url().should('equal', 'https://www.saucedemo.com/')
  })


})