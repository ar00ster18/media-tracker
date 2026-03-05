describe('Media Tracking (Movies & TV)', () => {
  beforeEach(() => {
    // Start from home, clear everything, and sign in
    cy.visit('/sign-in');
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.contains('Auto-login as Dev User').click();
    cy.url({ timeout: 20000 }).should('include', '/movies');
  });

  it('should search for and add a movie to the list', () => {
    cy.visit('/movies');
    
    // Check if the page loaded
    cy.get('h1').should('contain', 'Movies');
    
    // Search for a movie (using a popular one that likely exists in TMDB)
    cy.get('#media-search').type('Inception');
    
    // Wait for results and add to list
    cy.contains('Inception', { timeout: 15000 }).should('be.visible');
    
    // Check for ratings
    cy.contains('TMDB:', { timeout: 10000 }).should('be.visible');
    
    cy.contains('Add to My List').first().click();
    
    // Verify it's added
    cy.contains('Added').should('be.visible');
    cy.get('aside').should('contain', 'Inception');
    cy.get('aside').should('contain', '1 title added');
    
    // Change status
    cy.get('select').first().select('watching');
    cy.get('select').first().should('have.value', 'watching');

    // Add rating
    cy.get('select').last().select('9');
    cy.get('select').last().should('have.value', '9');
    
    // Remove from list
    cy.contains('Remove').click();
    cy.get('aside').should('contain', 'Your list is empty');
  });

  it('should search for and add a TV show to the list', () => {
    cy.visit('/tv');
    
    // Check if the page loaded
    cy.get('h1').should('contain', 'TV Shows');
    
    // Search for a TV show
    cy.get('#media-search').type('Breaking Bad');
    
    // Wait for results and add to list
    cy.contains('Breaking Bad', { timeout: 15000 }).should('be.visible');
    cy.contains('Add to My List').first().click();
    
    // Verify it's added
    cy.contains('Added').should('be.visible');
    cy.get('aside').should('contain', 'Breaking Bad');
    
    // Remove from list
    cy.contains('Remove').click();
    cy.get('aside').should('contain', 'Your list is empty');
  });

  it('should navigate between Movies and TV Shows via Navbar', () => {
    cy.visit('/movies');
    cy.get('nav').contains('TV Shows').click();
    cy.url().should('include', '/tv');
    cy.get('h1').should('contain', 'TV Shows');
    
    cy.get('nav').contains('Movies').click();
    cy.url().should('include', '/movies');
    cy.get('h1').should('contain', 'Movies');
  });
});
