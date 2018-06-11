import { contentOptions } from "./options-core";


export function initOptions(container) {
    // TO DO
    // define only if multiple plurid-containers

    // if (container.id == 'plurid-container-1') {
        customElements.define('plurid-options', PluridOptions);
    // }
}


var optionsId = 1;

class PluridOptions extends HTMLElement {
    constructor() {
        super()
    }

    connectedCallback() {
        this.id=`plurid-options-${optionsId}`;
        optionsId++;

        this.innerHTML = contentOptions();
    }
}
