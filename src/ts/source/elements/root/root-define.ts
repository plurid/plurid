import { setId } from "../../core/utils/complex";



class PluridRoots extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        setId(this, 'roots');

        if (this.id == 'plurid-roots-1') {
            (<any> window).pluridScene.meta.activePlurid = 'plurid-roots-1';
        }
    }
}


customElements.define('plurid-roots', PluridRoots);



class PluridRoot extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        setId(this, 'root');
    }
}


customElements.define('plurid-root', PluridRoot);
