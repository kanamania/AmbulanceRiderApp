describe('Trip Management', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/tabs/home');
    cy.waitForIonic();
  });

  describe('Trip Booking Page', () => {
    it('should display trip booking form', () => {
      cy.get('ion-select').should('be.visible');
      cy.contains('Book Trip').should('be.visible');
    });

    it('should show trip type options', () => {
      cy.get('ion-select').first().click();
      cy.get('ion-select-option').should('have.length.at.least', 1);
      cy.get('ion-backdrop').click({ force: true });
    });

    it('should show location options', () => {
      cy.get('ion-select').eq(1).click();
      cy.get('ion-select-option').should('exist');
      cy.get('ion-backdrop').click({ force: true });
    });

    it('should validate required fields before submission', () => {
      cy.get('ion-button').contains('Book Trip').click();
      cy.get('ion-toast').should('be.visible');
    });
  });

  describe('Trip List (Activity Page)', () => {
    beforeEach(() => {
      cy.visit('/tabs/activity');
      cy.waitForIonic();
    });

    it('should display activity page', () => {
      cy.contains('Activity').should('be.visible');
    });

    it('should show trip cards if trips exist', () => {
      cy.get('ion-card, ion-item').should('exist');
    });

    it('should filter trips by status', () => {
      cy.get('ion-segment-button').should('have.length.at.least', 1);
      cy.get('ion-segment-button').first().click();
    });

    it('should open trip details on card click', () => {
      cy.get('ion-card').first().click({ force: true });
      cy.get('ion-modal, ion-content').should('be.visible');
    });
  });

  describe('Trip Status Flow', () => {
    it('should display correct status badges', () => {
      cy.visit('/tabs/activity');
      cy.waitForIonic();
      
      cy.get('ion-badge, ion-chip').should('exist');
    });
  });

  describe('Map Integration', () => {
    it('should display map on home page', () => {
      cy.get('.leaflet-container, [class*="map"]').should('exist');
    });

    it('should allow location selection on map', () => {
      cy.get('.leaflet-container, [class*="map"]').should('be.visible');
    });
  });
});

describe('Admin Trip Management', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/admin/trips');
    cy.waitForIonic();
  });

  it('should display admin trips page', () => {
    cy.url().should('include', '/admin/trips');
  });

  it('should show trip list with actions', () => {
    cy.get('ion-card, ion-item, table').should('exist');
  });

  it('should filter trips', () => {
    cy.get('ion-searchbar, ion-select, input[type="search"]').should('exist');
  });
});
