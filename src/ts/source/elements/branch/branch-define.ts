class PluridBranch extends HTMLElement {
    constructor() {
        super();
    }

    get link() {
        return this.getAttribute('link');
    }
    set link(newLink: any) {
        this.setAttribute('link', newLink);
    }
}


customElements.define('plurid-branch', PluridBranch);
