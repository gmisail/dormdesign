/// <reference types="cypress" />

context('Room joining', () => {
    beforeEach(() => {
      cy.visit('http://localhost:5500')
    })
  
    it('Join room with a valid ID.', () => {
      cy.get('input[placeholder="Room ID"]').type("35e71231-3b13-49bc-b725-541d0880bb0d");
      cy.get('button[name="createRoomButton"]').contains("Join Room").click()
      
      cy.get(".room-container").should("be.visible");
    })
  
    it('Join room with an invalid ID.', () => {
        cy.get('input[placeholder="Room ID"]').type("invalid-room-id");
        cy.get('button[name="createRoomButton"]').contains("Join Room").click()
        
        cy.get(".room-container").should("not.exist");
    })
  })
  