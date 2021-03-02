import { setId } from "../../core/utils/complex";
import {
        contentViewcube,
        initViewcubeModelButtons,
        renderViewcube,
        } from './viewcube-core';


export function initViewcube(container: any) {
    // TO DO
    // define only if multiple plurid-containers

    // if (container.id == 'plurid-container-1') {
    customElements.define('plurid-viewcube', PluridViewcube);
    // }

    renderViewcube(container);

    initViewcubeModelButtons(container);
}


class PluridViewcube extends HTMLElement {
    constructor() {
        super();
    }

    private connectedCallback() {
        setId(this, 'viewcube');

        this.innerHTML = contentViewcube(this);
    }
}
