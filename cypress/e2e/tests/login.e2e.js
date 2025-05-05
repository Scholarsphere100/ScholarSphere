describe('Google Login Flow', () => {
  it('should login successfully and redirect to the correct page', () => {
    // Visit the login page
    cy.visit('/login'); // Adjust to your login page URL

    // Mocking Google login by intercepting the network request (optional)
    cy.intercept('POST', '**/auth/signInWithPopup', {
      fixture: 'google-login-success.json', // Assuming you have a fixture for this
    }).as('googleLogin');

    // Simulate clicking the login button
    cy.get('#google-login').click(); // Your button with id 'google-login'

    // Wait for the login to finish (if using mock or real network call)
    cy.wait('@googleLogin');

    // Check if the alert is called
    cy.on('window:alert', (alertText) => {
      expect(alertText).to.include('Google login successful');
    });

    // Check if session storage was set (if your app does that)
    cy.window().then((win) => {
      expect(win.sessionStorage.getItem('user')).to.include('Test User');
    });

    // Check if the URL has been redirected correctly
    cy.url().should('include', '/admin.html');  // Assuming admin is the redirect page after login
  });
});
