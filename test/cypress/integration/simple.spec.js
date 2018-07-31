describe('Visit test main-page-2', function() {
    it('visits /test/examples/pages/main-page-2.html', function() {
        cy.visit('/test/examples/pages/main-page-2.html');
    });

    // it('clicks viewcube front-top-left zone', function() {
    //     cy.visit('/test/examples/pages/main-page-2.html');

    //     // weird effect of scrolling
    //     cy.get('.plurid-viewcube-model-transform-cube')
    //         .get('.plurid-viewcube-model-transform-top-left')
    //         .get('.plurid-viewcube-model-transform-front-top-left')
    //         .click();
    // });
});
