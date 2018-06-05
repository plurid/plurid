import { transform } from "./container-core.js";
import { initOptions } from "./options.js";
import { initShortcuts } from "../logic/shortcuts.js";
import { renderBranch } from "./branch-core.js";
import { renderOptions,
         displayOptions } from "./options-core.js";


class PluridContainer extends HTMLElement {
    constructor() {
        super()
    }

    connectedCallback() {
        transform(this);

        initOptions()
        renderOptions(this);
        displayOptions(this);

        initShortcuts(this);

        // renderBranch();
    }
}


customElements.define('plurid-container', PluridContainer);
