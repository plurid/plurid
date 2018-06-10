import { contentControls, setControls } from "./controls-core";



class PluridControls extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = contentControls();
        setControls(this);
    }
}


export function initControls() {
    customElements.define('plurid-controls', PluridControls);
}
