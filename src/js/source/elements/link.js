import { setLinkContent } from './link-core';

var linkId = 1;

class PluridLink extends HTMLElement {
    constructor() {
        super();
        this.id=`plurid-link-${linkId}`;
        setLinkContent(this);

        linkId++;
    }

    get page() {
        return this.getAttribute('page');
    }
    set page(newPage) {
        this.setAttribute('page', newPage);
    }

    getNamedPage(pageName) {
        let pluridPages = document.getElementsByTagName('plurid-page');

        for (let pluridPage of pluridPages) {
            if (pluridPage.name == pageName) {
                return pluridPage;
            }
        }
    }
}


customElements.define('plurid-link', PluridLink);
