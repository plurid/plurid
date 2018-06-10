import { setLink } from "./page-core";


class PluridPage extends HTMLElement {
    constructor() {
        super();

        // Count pages from the html document
        pluridScene.metadata.pages++;
        let pageNo = pluridScene.metadata.pages

        // Set id based on page count
        // e.g. plurid-page-23
        this.id=`plurid-page-${pageNo}`;
        let pageId = this.id;

        // Establish if the current plurid-page is a root page
        let nodeName = this.parentNode.nodeName
        if (nodeName == 'BODY' || nodeName == 'PLURID-CONTAINER') {
            pluridScene.metadata.rootPages.push(pageId);
        }
    }

    connectedCallback() {
        // console.log(this);
        // setLink(this);
    }

    get name() {
        return this.getAttribute('name');
    }
    set name(newName) {
        this.setAttribute('name', newName);
    }

    get visible() {
        switch(this.getAttribute('visible')) {
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
    set visible(newVisible) {
        this.setAttribute('visible', newVisible);
    }
}


customElements.define('plurid-page', PluridPage);
