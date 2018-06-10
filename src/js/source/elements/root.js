class PluridRoots extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.id=`plurid-roots`;
    }
}


customElements.define('plurid-roots', PluridRoots);



var rootId = 1;

class PluridRoot extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.id=`plurid-root-${rootId}`;
        rootId++;
    }
}


customElements.define('plurid-root', PluridRoot);
