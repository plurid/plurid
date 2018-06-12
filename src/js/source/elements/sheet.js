import { initControls } from "./controls";
import { renderControls } from "./controls-core";
import { setLink, setAnchorTagsId } from "./sheet-core";


var sheetId = 1;

class PluridSheet extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.id=`plurid-sheet-${sheetId}`;

        if (sheetId == 1) {
            initControls();
        }
        renderControls(this, sheetId);
        setLink(this);
        setAnchorTagsId(this.id);

        this.addEventListener('click', event => {
            // let cX = event.clientX;
            // let sX = event.screenX;
            // let cY = event.clientY;
            // let sY = event.screenY;
            // let pX = event.pageX;
            // let pY = event.pageY;
            let oX = event.offsetX;
            let oY = event.offsetY;
            // let thisTop = this.offsetTop;
            // let thisLeft = this.offsetLeft;

            console.log('-----------------');
            // console.log('clientX', cX);
            // console.log('clientY', cY);
            // console.log('screenX', sX);
            // console.log('screenY', sY);
            // console.log('pageX', pX);
            // console.log('pageY', pY);
            // console.log('offsetX', oX);
            // console.log('offsetY', oY);
            // console.log('offsetThisTop', thisTop);
            // console.log('offsetThisLeft', thisLeft);

            // console.log('x', x);
            // console.log('y', y);

            // console.log('sheet right', right);
            // console.log('sheet top', top);


            // let sheet = event.path[2];
            // let rect = sheet.getBoundingClientRect();
            let rect2 = event.target.getBoundingClientRect();
            // console.log(rect2);
            // console.log('a', event);
            // console.log(event.path[2]);

            let oX2 = event.offsetX + rect2.x ;
            let oY2 = event.offsetY + rect2.y;

            // console.log('-----');
            // console.log('offsetX2', oX2);
            // console.log('offsetY2', oY2);

        });

        sheetId++;
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
