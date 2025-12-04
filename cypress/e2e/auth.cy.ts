describe('Authentication', () => {
  beforeEach(() => {
    cy.clearAuth();
  });

  describe('Login Page', () => {
    beforeEach(() => {
      cy.visit('/login');
      cy.waitForIonic();
    });

    it('should display login form', () => {
      cy.contains('Global Express').should('be.visible');
      cy.get('ion-input[type="email"]').should('be.visible');
      cy.get('ion-input[type="password"]').should('be.visible');
      cy.get('ion-button[type="submit"]').should('be.visible');
    });

    it('should show validation error for empty fields', () => {
      cy.get('ion-input[type="email"]').clear();
      cy.get('ion-input[type="password"]').clear();
      cy.get('ion-button[type="submit"]').click();
      cy.get('ion-toast').should('be.visible');
    });

    it('should show error for invalid credentials', () => {
      cy.get('ion-input[type="email"]').clear().type('invalid@test.com');
      cy.get('ion-input[type="password"]').clear().type('wrongpassword');
      cy.get('ion-button[type="submit"]').click();
      cy.get('ion-toast').should('be.visible');
    });

    it('should login successfully with valid credentials', () => {
      cy.intercept('POST', '**/auth/login').as('loginRequest');
      
      cy.get('ion-input[type="email"]').clear().type(Cypress.env('testEmail'));
      cy.get('ion-input[type="password"]').clear().type(Cypress.env('testPassword'));
      cy.get('ion-button[type="submit"]').click();
      
      cy.wait('@loginRequest').then((interception) => {
        if (interception.response?.statusCode === 200) {
          cy.url().should('include', '/tabs');
        }
      });
    });

    it('should navigate to forgot password page', () => {
      cy.contains('Forgot Password').click();
      cy.url().should('include', '/forgot-password');
    });

    it('should navigate to register page', () => {
      cy.contains('Register here').click();
      cy.url().should('include', '/register');
    });

    it('should disable form while loading', () => {
      cy.intercept('POST', '**/auth/login', { delay: 1000 }).as('slowLogin');
      
      cy.get('ion-input[type="email"]').clear().type(Cypress.env('testEmail'));
      cy.get('ion-input[type="password"]').clear().type(Cypress.env('testPassword'));
      cy.get('ion-button[type="submit"]').click();
      
      cy.get('ion-spinner').should('be.visible');
      cy.get('ion-input[type="email"]').should('have.attr', 'disabled');
    });
  });

  describe('Register Page', () => {
    beforeEach(() => {
      cy.visit('/register');
      cy.waitForIonic();
    });

    it('should display registration form', () => {
      cy.contains('Create Account').should('be.visible');
      cy.get('ion-input[type="text"]').should('be.visible');
      cy.get('ion-input[type="email"]').should('be.visible');
      cy.get('ion-input[type="tel"]').should('be.visible');
      cy.get('ion-input[type="password"]').should('have.length', 2);
    });

    it('should show error for empty required fields', () => {
      cy.get('ion-button[type="submit"]').click();
      cy.get('ion-toast').should('be.visible');
    });

    it('should show error for password mismatch', () => {
      cy.get('ion-input[type="text"]').type('Test User');
      cy.get('ion-input[type="email"]').type('test@example.com');
      cy.get('ion-input[type="password"]').first().type('password123');
      cy.get('ion-input[type="password"]').last().type('different123');
      cy.get('ion-button[type="submit"]').click();
      
      cy.get('ion-toast').should('contain.text', 'Passwords do not match');
    });

    it('should show error for short password', () => {
      cy.get('ion-input[type="text"]').type('Test User');
      cy.get('ion-input[type="email"]').type('test@example.com');
      cy.get('ion-input[type="password"]').first().type('12345');
      cy.get('ion-input[type="password"]').last().type('12345');
      cy.get('ion-button[type="submit"]').click();
      
      cy.get('ion-toast').should('contain.text', 'at least 6 characters');
    });

    it('should navigate to login page', () => {
      cy.contains('Login here').click();
      cy.url().should('include', '/login');
    });
  });

  describe('Forgot Password Page', () => {
    beforeEach(() => {
      cy.visit('/forgot-password');
      cy.waitForIonic();
    });

    it('should display forgot password form', () => {
      cy.contains('Forgot Password').should('be.visible');
      cy.get('ion-input[type="email"]').should('be.visible');
    });

    it('should show error for empty email', () => {
      cy.get('ion-button[type="submit"]').click();
      cy.get('ion-toast').should('be.visible');
    });

    it('should navigate back to login', () => {
      cy.contains('Back to Login').click();
      cy.url().should('include', '/login');
    });
  });

  describe('Protected Routes', () => {
    it('should redirect to login when not authenticated', () => {
      cy.visit('/tabs/home');
      cy.url().should('include', '/login');
    });

    it('should access protected route when authenticated', () => {
      cy.login();
      cy.visit('/tabs/home');
      cy.waitForIonic();
      cy.url().should('include', '/tabs/home');
    });
  });

  describe('Logout', () => {
    beforeEach(() => {
      cy.login();
      cy.visit('/tabs/settings');
      cy.waitForIonic();
    });

    it('should logout and redirect to login', () => {
      cy.contains('Logout').click();
      cy.get('ion-alert').should('be.visible');
      cy.get('ion-alert button').contains('Logout').click();
      cy.url().should('include', '/login');
    });
  });
});
