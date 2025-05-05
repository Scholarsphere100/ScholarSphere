describe('Google Login Flow (Dummy Tests)', () => {
  beforeEach(() => {
    cy.visit('/login.html'); // Simulate visiting the login page
  });

  it('should display the Google login button', () => {
    
    cy.get('#google-login').should('exist').and('contain.text', 'Google');
  });

  it('should call Google login and redirect based on user role', () => {
    
    cy.window().then((win) => {
      const mockUser = { uid: 'test-user-1', displayName: 'Test User' };
      const mockCredential = { accessToken: 'dummy-token' };

      // Stubbing login and Firestore behavior
      cy.stub(win.firebase.auth.Auth.prototype, 'signInWithPopup').resolves({
        user: mockUser,
        credential: mockCredential,
      });

      cy.stub(win.firebase.firestore.Firestore.prototype, 'collection')
        .returns({
          doc: () => ({
            get: () => Promise.resolve({
              exists: true,
              data: () => ({
                isAccepted: true,
                isResearcher: true,
              }),
            }),
          }),
        });

      cy.get('#google-login').click();

      
      cy.wait(500);
      cy.url().should('include', 'researcher-dashboard.html');
    });
  });

  it('should redirect to accountUnderReview if pending', () => {
    n
    cy.window().then((win) => {
      const mockUser = { uid: 'test-user-2' };

      cy.stub(win.firebase.auth.Auth.prototype, 'signInWithPopup').resolves({
        user: mockUser,
        credential: { accessToken: 'dummy-token' },
      });

      cy.stub(win.firebase.firestore.Firestore.prototype, 'collection')
        .returns({
          doc: () => ({
            get: () => Promise.resolve({
              exists: true,
              data: () => ({
                isPending: true,
              }),
            }),
          }),
        });

      cy.get('#google-login').click();

     
      cy.wait(500);
      cy.url().should('include', 'accountUnderReview.html');
    });
  });

  it('should alert and redirect to signup if user doc doesn’t exist', () => {
    
    cy.window().then((win) => {
      const mockUser = { uid: 'unknown-user' };

      cy.stub(win.firebase.auth.Auth.prototype, 'signInWithPopup').resolves({
        user: mockUser,
        credential: { accessToken: 'dummy-token' },
      });

      cy.stub(win.firebase.firestore.Firestore.prototype, 'collection')
        .returns({
          doc: () => ({
            get: () => Promise.resolve({
              exists: false,
            }),
          }),
        });

      cy.get('#google-login').click();

     
      cy.on('window:alert', (txt) => {
        expect(txt).to.contains('Your account does not exist');
      });
      cy.wait(500);
      cy.url().should('include', 'SignUp.html');
    });
  });
});
