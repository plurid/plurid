import { contentOptions } from "./options-core";
import { setId } from "./element-utils/utils";


export function initOptions(container) {
    // TO DO
    // define only if multiple plurid-containers

    // if (container.id == 'plurid-container-1') {
        customElements.define('plurid-options', PluridOptions);
    // }
}


class PluridOptions extends HTMLElement {
    constructor() {
        super()
    }

    connectedCallback() {
        setId(this, 'options');

        this.innerHTML = contentOptions();
    }
}
