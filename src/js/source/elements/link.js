import { setLinkContent } from './link-core';
import { setId } from "./element-utils/utils";

class PluridLink extends HTMLElement {
    constructor() {
        super();

        setId(this, 'link');
        setLinkContent(this);
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
