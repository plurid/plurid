var rootsId = 1;

class PluridRoots extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.id=`plurid-roots-${rootsId}`;

        if (this.id == 'plurid-roots-1') {
            pluridScene.metadata.activePlurid = 'plurid-roots-1';
        }

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
