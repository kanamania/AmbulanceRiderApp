describe('Navigation', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/tabs/home');
    cy.waitForIonic();
  });

  describe('Tab Navigation', () => {
    it('should navigate to Home tab', () => {
      cy.get('ion-tab-button').contains('Home').click();
      cy.url().should('include', '/tabs/home');
    });

    it('should navigate to Activity tab', () => {
      cy.get('ion-tab-button').contains('Activity').click();
      cy.url().should('include', '/tabs/activity');
    });

    it('should navigate to Settings tab', () => {
      cy.get('ion-tab-button').contains('Settings').click();
      cy.url().should('include', '/tabs/settings');
    });
  });

  describe('Settings Page', () => {
    beforeEach(() => {
      cy.visit('/tabs/settings');
      cy.waitForIonic();
    });

    it('should display settings options', () => {
      cy.contains('Settings').should('be.visible');
    });

    it('should navigate to profile', () => {
      cy.contains('Profile').click();
      cy.url().should('include', '/profile');
    });

    it('should show theme toggle', () => {
      cy.get('ion-toggle').should('exist');
    });

    it('should show language selector', () => {
      cy.get('ion-select').should('exist');
    });
  });

  describe('Profile Page', () => {
    beforeEach(() => {
      cy.visit('/profile');
      cy.waitForIonic();
    });

    it('should display user profile', () => {
      cy.contains('Profile').should('be.visible');
    });

    it('should show user information', () => {
      cy.get('ion-input, ion-item').should('exist');
    });

    it('should allow profile editing', () => {
      cy.get('ion-button').contains('Edit').should('exist');
    });
  });

  describe('Notifications', () => {
    beforeEach(() => {
      cy.visit('/notifications');
      cy.waitForIonic();
    });

    it('should display notifications page', () => {
      cy.contains('Notifications').should('be.visible');
    });
  });
});

describe('Admin Navigation', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/admin');
    cy.waitForIonic();
  });

  it('should display admin dashboard', () => {
    cy.url().should('include', '/admin');
  });

  it('should navigate to users management', () => {
    cy.contains('Users').click();
    cy.url().should('include', '/admin/users');
  });

  it('should navigate to vehicles management', () => {
    cy.contains('Vehicles').click();
    cy.url().should('include', '/admin/vehicles');
  });

  it('should navigate to trips management', () => {
    cy.contains('Trips').click();
    cy.url().should('include', '/admin/trips');
  });

  it('should navigate to locations management', () => {
    cy.contains('Locations').click();
    cy.url().should('include', '/admin/locations');
  });

  it('should navigate to trip types management', () => {
    cy.contains('Trip Types').click();
    cy.url().should('include', '/admin/trip-types');
  });
});

describe('Responsive Design', () => {
  beforeEach(() => {
    cy.login();
  });

  it('should display correctly on mobile viewport', () => {
    cy.viewport('iphone-x');
    cy.visit('/tabs/home');
    cy.waitForIonic();
    cy.get('ion-tab-bar').should('be.visible');
  });

  it('should display correctly on tablet viewport', () => {
    cy.viewport('ipad-2');
    cy.visit('/tabs/home');
    cy.waitForIonic();
    cy.get('ion-content').should('be.visible');
  });

  it('should display correctly on desktop viewport', () => {
    cy.viewport(1280, 720);
    cy.visit('/tabs/home');
    cy.waitForIonic();
    cy.get('ion-content').should('be.visible');
  });
});
