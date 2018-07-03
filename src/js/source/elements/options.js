import { contentOptions } from "./options-core";
import { setId } from "./element-utils/utils";
import { renderOptions,
         displayOptions,
         displayMoreOptions } from "./options-core";

export function initOptions(container) {
    // TO DO
    // define only if multiple plurid-containers

    // if (container.id == 'plurid-container-1') {
        customElements.define('plurid-options', PluridOptions);
    // }

    renderOptions(container);
    displayOptions(container);
    displayMoreOptions(container);
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
