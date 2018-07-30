import { setId } from "../../core/utils/utils";



class PluridShadow extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        let sheetIdNumber = setId(this, 'shadow');
    }

    get sheet() {
        return this.getAttribute('sheet');
    }
    set sheet(newName) {
        this.setAttribute('sheet', newName);
    }
}

customElements.define('plurid-shadow', PluridShadow);
