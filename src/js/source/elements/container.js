import { transform,
         setActiveContainer } from "./container-core";
import { initOptions } from "./options";
import { initShortcuts } from "../logic/shortcuts";
import { setId } from "./element-utils/utils";


class PluridContainer extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        setId(this, 'container');

        transform(this);

        initOptions(this);
        initShortcuts(this);
    }
}


customElements.define('plurid-container', PluridContainer);
