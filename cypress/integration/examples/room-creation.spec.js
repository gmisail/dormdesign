/// <reference types="cypress" />

context('Room creation', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5500')
  })

  it('Creates a new room.', () => {
    cy.get('button[name="createRoomButton"]').contains("Create New Room").click()
    cy.get('input[name="nameValue"]').type("Automated Test Room");
    cy.get('button[type="submit"]').contains("Create").click()
    
    cy.get(".room-container").should("be.visible");
  })

  it('Creates room with invalid name.', () => {
    cy.get('button[name="createRoomButton"]').contains("Create New Room").click()
    cy.get('input[name="nameValue"]').type(" ");
    cy.get('button[type="submit"]').contains("Create").click()
    
    cy.get(".room-container").should("not.exist");
  })
})
