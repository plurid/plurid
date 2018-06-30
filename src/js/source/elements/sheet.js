import { initControls } from "./controls";
import { renderControls } from "./controls-core";
import { setLink,
         setAnchorTagsId,
         setPluridRoots } from "./sheet-core";
import { setId } from "./element-utils/utils";


class PluridSheet extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        let sheetIdNumber = setId(this, 'sheet');

        if (sheetIdNumber == 1) {
            initControls();
        }
        renderControls(this, sheetIdNumber);
        setLink(this);
        setAnchorTagsId(this.id);
        setPluridRoots(this);
    }

    get name() {
        return this.getAttribute('name');
    }
    set name(newName) {
        this.setAttribute('name', newName);
    }

    get visible() {
        return this.getAttribute('visible');
    }
    set visible(newVisible) {
        this.setAttribute('visible', newVisible);
    }
}

customElements.define('plurid-sheet', PluridSheet);




class PluridSheetDouble extends HTMLElement {
    constructor() {
        super();
    }
}


customElements.define('plurid-sheet-double', PluridSheetDouble);


class PluridSheetDoubleFront extends HTMLElement {
    constructor() {
        super();
    }
}


customElements.define('plurid-sheet-double-front', PluridSheetDoubleFront);


class PluridSheetDoubleBack extends HTMLElement {
    constructor() {
        super();
    }
}


customElements.define('plurid-sheet-double-back', PluridSheetDoubleBack);
