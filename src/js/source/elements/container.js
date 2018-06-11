import { transform } from "./container-core";
import { initOptions } from "./options";
import { initShortcuts } from "../logic/shortcuts";
import { renderBranch } from "./branch-core";
import { renderOptions,
         displayOptions } from "./options-core";


var containerId = 1;

class PluridContainer extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.id=`plurid-container-${containerId}`;
        containerId++;

        transform(this);

        initOptions(this);
        renderOptions(this);
        displayOptions(this);

        initShortcuts(this);

        // renderBranch();
    }
}


customElements.define('plurid-container', PluridContainer);
