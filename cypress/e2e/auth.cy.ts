describe('Authentication lifecycle', () => {
  const uniqueId = Date.now();
  const testEmail = `testuser-${uniqueId}@example.com`;
  const testPassword = 'Password123!';
  const testName = 'Test Lifecycle User';

  it('should sign up, sign out, sign in, and delete the user via settings', () => {
    // 1. Sign Up
    cy.visit('/sign-in');
    cy.contains('Sign Up').click();
    
    cy.get('#name').type(testName);
    cy.get('#email').type(testEmail);
    cy.get('#password').type(testPassword);
    cy.get('button[type="submit"]').click();

    // 2. Verify Sign Up success
    cy.url({ timeout: 20000 }).should('include', '/movies');
    cy.get('nav', { timeout: 15000 }).should('contain', testName);

    // 3. Sign Out via menu
    cy.get('#user-menu-button').click();
    cy.contains('Sign Out').click();
    cy.url({ timeout: 15000 }).should('include', '/sign-in');

    // 4. Sign In with same user
    cy.get('#email').type(testEmail);
    cy.get('#password').type(testPassword);
    cy.get('button[type="submit"]').click();
    
    cy.url({ timeout: 20000 }).should('include', '/movies');
    cy.get('nav', { timeout: 15000 }).should('contain', testName);

    // 5. Go to Settings
    cy.get('#user-menu-button').click();
    cy.contains('Settings', { timeout: 10000 }).click();
    cy.url().should('include', '/settings');

    // 6. Change Name
    const newName = 'Updated Test Name';
    cy.get('#name').clear().type(newName);
    cy.contains('Save Changes').click();
    cy.contains('Name updated successfully', { timeout: 10000 }).should('be.visible');

    // 7. Delete Account
    cy.on('window:confirm', () => true);
    cy.get('#delete-account-btn').click();

    // 8. Verify Deletion redirect
    cy.url({ timeout: 20000 }).should('eq', Cypress.config().baseUrl + '/');
    
    // 9. Force clear storage and WAIT
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.wait(2000);

    // 10. Try to sign in again - should fail
    cy.visit('/sign-in');
    cy.get('#email').type(testEmail);
    cy.get('#password').type(testPassword);
    cy.get('button[type="submit"]').click();
    
    // Should stay on sign-in and show error
    cy.url().should('include', '/sign-in');
    cy.get('div.bg-red-50', { timeout: 10000 }).should('be.visible');
  });

  it('should allow a user to sign in using the Dev Bypass and then sign out', () => {
    // Start from home to test the navigation flow
    cy.visit('/');
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.reload();

    cy.contains('Sign In').click();
    cy.url().should('include', '/sign-in');

    cy.contains('Auto-login as Dev User').click();
    
    // In dev mode it should auto-create if not exists and redirect to /movies
    cy.url({ timeout: 20000 }).should('include', '/movies');
    cy.get('nav').should('contain', 'Dev User');
    
    // Just sign out
    cy.get('#user-menu-button').click();
    cy.contains('Sign Out').click();
    
    // After sign out from movies, it redirects to sign-in
    cy.url({ timeout: 10000 }).should('include', '/sign-in');
  });

  it('should show validation errors on the sign-in page', () => {
    cy.visit('/sign-in');
    cy.get('button[type="submit"]').click();
    cy.contains('Email is required').should('be.visible');
    
    cy.get('#email').type('invalid-email');
    cy.get('#password').type('pwd');
    cy.get('button[type="submit"]').click();
    cy.contains('Please enter a valid email address').should('be.visible');
  });

  it('should redirect guest users from settings to sign-in', () => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.visit('/settings');
    cy.url().should('include', '/sign-in');
    cy.url().should('include', 'callbackURL=/settings');
  });

  it('should redirect guest users from home to sign-in', () => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.visit('/');
    cy.url().should('include', '/sign-in');
  });
});
