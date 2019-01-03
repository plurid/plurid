import { initShortcuts } from "../../core/logic/shortcuts";
import { setId } from "../../core/utils/complex";

import {
        transform,
        //  setActiveContainer,
        } from "./container-core";

import { initOptions } from "../options/options-define";
import { initViewcube } from "../viewcube/viewcube-define";



class PluridContainer extends HTMLElement {
    constructor() {
        super();
    }

    private connectedCallback() {
        setId(this, 'container');

        transform(this);

        initOptions(this);
        initViewcube(this);
        initShortcuts();
    }
}


customElements.define('plurid-container', PluridContainer);
