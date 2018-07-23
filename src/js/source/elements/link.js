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

    get samepage() {
        switch(this.getAttribute('samepage')) {
            case "":
                return true;
            case "true":
                return true;
            case "false":
                return false;
            default:
                return false;
        }
    }
    set samepage(newSamepage) {
        this.setAttribute('samepage', newSamepage);
    }

    get active() {
        switch(this.getAttribute('active')) {
            case "":
                return true;
            case "true":
                return true;
            case "false":
                return false;
            default:
                return false;
        }
    }
    set active(newActive) {
        this.setAttribute('active', newActive);
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
