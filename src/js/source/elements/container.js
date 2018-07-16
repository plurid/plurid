import { transform,
         setActiveContainer } from "./container-core";
import { initOptions } from "./options";
import { initViewcube } from "./viewcube";
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
        initViewcube(this);
        initShortcuts(this);
    }
}


customElements.define('plurid-container', PluridContainer);
