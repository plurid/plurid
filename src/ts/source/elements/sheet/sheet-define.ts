import { setId } from "../../core/utils/complex";
import { renderControls } from "../controls/controls-core";
import { initControls } from "../controls/controls-define";
import {
        setAnchorTagsId,
        setLink,
        setPluridRoots,
        } from "./sheet-core";



class PluridSheet extends HTMLElement {
    constructor() {
        super();
    }

    private connectedCallback() {
        const sheetIdNumber = setId(this, 'sheet');

        if (sheetIdNumber === 1) {
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
    set name(newName: any) {
        this.setAttribute('name', newName);
    }

    get visible() {
        return this.getAttribute('visible');
    }
    set visible(newVisible: any) {
        this.setAttribute('visible', newVisible);
    }
}

customElements.define('plurid-sheet', PluridSheet);




// To think about implementation

// class PluridSheetDouble extends HTMLElement {
//     constructor() {
//         super();
//     }
// }


// customElements.define('plurid-sheet-double', PluridSheetDouble);


// class PluridSheetDoubleFront extends HTMLElement {
//     constructor() {
//         super();
//     }
// }


// customElements.define('plurid-sheet-double-front', PluridSheetDoubleFront);


// class PluridSheetDoubleBack extends HTMLElement {
//     constructor() {
//         super();
//     }
// }


// customElements.define('plurid-sheet-double-back', PluridSheetDoubleBack);
