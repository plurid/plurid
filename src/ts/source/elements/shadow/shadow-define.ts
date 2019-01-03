import { setId } from "../../core/utils/complex";



class PluridShadow extends HTMLElement {
    constructor() {
        super();
    }

    private connectedCallback() {
        const sheetIdNumber = setId(this, 'shadow');
    }

    get sheet() {
        return this.getAttribute('sheet');
    }
    set sheet(newName: any) {
        this.setAttribute('sheet', newName);
    }
}

customElements.define('plurid-shadow', PluridShadow);
