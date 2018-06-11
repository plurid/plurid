var rootsId = 1;

class PluridRoots extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.id=`plurid-roots-${rootsId}`;
        rootsId++;
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
