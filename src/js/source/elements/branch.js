class PluridBranch extends HTMLElement {
    constructor() {
        super();
    }

    get link() {
        return this.getAttribute('link');
    }
    set link(newLink) {
        this.setAttribute('link', newLink);
    }
}


customElements.define('plurid-branch', PluridBranch);



class PluridBridge extends HTMLElement {
    constructor() {
        super();
    }
}

customElements.define('plurid-bridge', PluridBridge);



class PluridScion extends HTMLElement {
    constructor() {
        super();
    }
}

customElements.define('plurid-scion', PluridScion);
