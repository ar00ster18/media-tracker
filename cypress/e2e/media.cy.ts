const uniqueId = Date.now();
const testEmail = `testuser-${uniqueId}@example.com`;
const testPassword = 'Password123!';
const testName = 'Test User';

describe('Media Tracking (Movies & TV)', () => {
  before(() => {
    // Sign up the test user
    cy.visit('/sign-in');
    cy.contains('Sign Up').click();
    
    cy.get('#name').type(testName);
    cy.get('#email').type(testEmail);
    cy.get('#password').type(testPassword);
    cy.get('button[type="submit"]').click();

    // Verify sign up success
    cy.url({ timeout: 20000 }).should('include', '/movies');
  });

  beforeEach(() => {
    // Reset state and login before each test
    cy.visit('/sign-in');
    cy.clearLocalStorage();
    cy.clearCookies();
    
    // Sign in as test user
    cy.get('#email').type(testEmail);
    cy.get('#password').type(testPassword);
    cy.get('button[type="submit"]').click();
    
    // Ensure we are on the movies page and session is loaded
    cy.url({ timeout: 20000 }).should('include', '/movies');
    cy.get('nav', { timeout: 15000 }).should('be.visible');
  });

  it('should search for, add, update and remove a movie', () => {
    // 1. Search for a movie
    cy.get('#media-search').clear().type('Inception');
    
    // 2. Wait for the specific result to appear
    cy.contains('Inception', { timeout: 15000 }).should('exist');
    
    // 3. Add to list using a robust click (bypassing clipping checks)
    cy.contains('button', 'Add to My List').first().click({ force: true });
    
    // 4. Verify added state
    cy.contains('Added', { timeout: 10000 }).should('be.visible');
    
    // 5. Verify it appears in the watchlist aside
    cy.get('aside', { timeout: 15000 }).within(() => {
      cy.contains('Inception').should('be.visible');
      cy.contains(/1 titles? added/i).should('be.visible');
      
      // 6. Change status
      cy.get('select').first().select('watching');
      cy.get('select').first().should('have.value', 'watching');

      // 7. Add rating
      cy.get('select').last().select('9');
      cy.get('select').last().should('have.value', '9');
      
      // 8. Remove from list
      cy.contains('button', 'Remove').click({ force: true });
      
      // 9. Verify empty state
      cy.contains('Your list is empty').should('be.visible');
    });
  });

  it('should search for and add a TV show', () => {
    cy.visit('/tv');
    cy.get('h1').should('contain', 'TV Shows');
    
    // 1. Search for TV show
    cy.get('#media-search').clear().type('Breaking Bad');
    
    // 2. Wait and Add
    cy.contains('Breaking Bad', { timeout: 15000 }).should('be.visible');
    cy.contains('button', 'Add to My List').first().click({ force: true });
    
    // 3. Verify in aside
    cy.get('aside', { timeout: 15000 }).within(() => {
      cy.contains('Breaking Bad').should('be.visible');
      
      // 4. Remove
      cy.contains('button', 'Remove').click({ force: true });
      cy.contains('Your list is empty').should('be.visible');
    });
  });

  it('should navigate between categories correctly', () => {
    // From Movies to TV
    cy.get('nav').contains('TV Shows').click();
    cy.url().should('include', '/tv');
    cy.get('h1').should('contain', 'TV Shows');
    
    // From TV back to Movies
    cy.get('nav').contains('Movies').click();
    cy.url().should('include', '/movies');
    cy.get('h1').should('contain', 'Movies');
  });

  after(() => {
    // Sign in and delete the test user
    cy.visit('/sign-in');
    cy.get('#email').type(testEmail);
    cy.get('#password').type(testPassword);
    cy.get('button[type="submit"]').click();
    
    cy.url({ timeout: 20000 }).should('include', '/movies');

    // Go to Settings
    cy.get('#user-menu-button').click();
    cy.contains('Settings', { timeout: 10000 }).click();
    cy.url().should('include', '/settings');

    // Delete Account
    cy.on('window:confirm', () => true);
    cy.get('#delete-account-btn').click();

    // Verify Deletion redirect
    cy.url({ timeout: 20000 }).should('eq', Cypress.config().baseUrl + '/');
  });
});
