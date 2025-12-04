/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      login(email?: string, password?: string): Chainable<void>
      logout(): Chainable<void>
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>
      waitForIonic(): Chainable<void>
      clearAuth(): Chainable<void>
    }
  }
}

Cypress.Commands.add('login', (email?: string, password?: string) => {
  const testEmail = email || Cypress.env('testEmail');
  const testPassword = password || Cypress.env('testPassword');

  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/login`,
    body: { email: testEmail, password: testPassword },
    failOnStatusCode: false,
  }).then((response) => {
    if (response.status === 200) {
      localStorage.setItem('access_token', response.body.accessToken);
      localStorage.setItem('user_data', JSON.stringify(response.body.user));
      if (response.body.refreshToken) {
        localStorage.setItem('refresh_token', response.body.refreshToken);
      }
    }
  });
});

Cypress.Commands.add('logout', () => {
  cy.clearAuth();
  cy.visit('/login');
});

Cypress.Commands.add('getByTestId', (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`);
});

Cypress.Commands.add('waitForIonic', () => {
  cy.get('ion-app').should('be.visible');
  cy.wait(500);
});

Cypress.Commands.add('clearAuth', () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_data');
  localStorage.removeItem('refresh_token');
});

export {};