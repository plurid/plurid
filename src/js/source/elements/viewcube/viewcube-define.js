import { setId } from "../../core/utils/utils";
import { renderViewcube,
         contentViewcube,
         initViewcubeModelButtons } from './viewcube-core';


export function initViewcube(container) {
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

    connectedCallback() {
        setId(this, 'viewcube');

        this.innerHTML = contentViewcube();
    }
}
