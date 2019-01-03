import { setId } from "../../core/utils/complex";
import { renderOptions,
         displayOptions,
         contentOptions,
         setButtons } from "./options-core";



export function initOptions(container) {
    // TO DO
    // define only if multiple plurid-containers

    // if (container.id == 'plurid-container-1') {
        customElements.define('plurid-options', PluridOptions);
    // }

    renderOptions(container);
    displayOptions(container);
    setButtons(container);
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
