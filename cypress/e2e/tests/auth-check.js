describe('auth-check.js Tests', () => {
  beforeEach(() => {
    // Simulate visiting the page and clearing sessionStorage
    cy.visit('path/to/your/page', {
      onBeforeLoad(win) {
        win.sessionStorage.clear(); // Clear sessionStorage
      },
    });
  });

  it('should redirect to login page if userData is null', () => {
    cy.visit('path/to/your/page', {
      onBeforeLoad(win) {
        win.sessionStorage.setItem('user', null); // Simulate null user data
      },
    });

    
    cy.url().should('include', '../html/index.html');
  });

  it('should redirect to admin-dashboard for admin role', () => {
    cy.visit('path/to/your/page', {
      onBeforeLoad(win) {
        win.sessionStorage.setItem(
          'user',
          JSON.stringify({ role: 'admin' }) // Simulate admin role
        );
      },
    });

    
    cy.url().should('include', '../admin-dashboard.html');
  });

  it('should redirect to reviewer-dashboard for reviewer role', () => {
    cy.visit('path/to/your/page', {
      onBeforeLoad(win) {
        win.sessionStorage.setItem(
          'user',
          JSON.stringify({ role: 'reviewer' }) // Simulate reviewer role
        );
      },
    });

   
    cy.url().should('include', '../reviewer-dashboard.html');
  });

  it('should redirect to researcher-dashboard for unrecognized roles', () => {
    cy.visit('path/to/your/page', {
      onBeforeLoad(win) {
        win.sessionStorage.setItem(
          'user',
          JSON.stringify({ role: 'unknownRole' }) // Simulate unrecognized role
        );
      },
    });

   
    cy.url().should('include', '../html/researcher-dashboard.html');
  });

  it('should load the page if role matches', () => {
    cy.visit('path/to/your/page', {
      onBeforeLoad(win) {
        win.sessionStorage.setItem(
          'user',
          JSON.stringify({ role: 'researcher' }) // Simulate researcher role
        );
      },
    });

   
    cy.get('[data-testid=user-specific-content]').should('be.visible');
  });
});

  