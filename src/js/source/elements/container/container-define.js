import { transform,
         setActiveContainer } from "./container-core";
import { initOptions } from "../options/options-define";
import { initViewcube } from "../viewcube/viewcube-define";
import { initShortcuts } from "../../core/logic/shortcuts";
import { setId } from "../../core/utils/complex";



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
