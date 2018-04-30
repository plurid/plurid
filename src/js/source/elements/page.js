// import {  } from "./page-core.js";


class PluridPage extends HTMLElement {
    constructor() {
        super()

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
}



customElements.define('plurid-page', PluridPage);
