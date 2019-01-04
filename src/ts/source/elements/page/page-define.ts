// import { setLink } from "./page-core";



class PluridPage extends HTMLElement {
    constructor() {
        super();

        // Count pages from the html document
        (<any> window).pluridScene.meta.pages++;
        const pageNo = (<any> window).pluridScene.meta.pages;

        // Set id based on page count
        // e.g. plurid-page-23
        this.id = `plurid-page-${pageNo}`;
        const pageId = this.id;

        // Establish if the current plurid-page is a root page
        const nodeName = this.parentNode!.nodeName;
        if (nodeName === 'BODY' || nodeName === 'PLURID-CONTAINER') {
            (<any> window).pluridScene.meta.rootPages.push(pageId);
        }
    }

    // connectedCallback() {
    //     // console.log(this);
    //     // setLink(this);
    // }

    get name() {
        return this.getAttribute('name');
    }
    set name(newName: any) {
        this.setAttribute('name', newName);
    }

    get title() {
        return this.getAttribute('title');
    }
    set title(newTitle: any) {
        this.setAttribute('title', newTitle);
    }
}


customElements.define('plurid-page', PluridPage);
