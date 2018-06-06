import { initControls } from "./controls.js";
import { renderControls } from "./controls-core.js";



var sheetId = 1;

// var pluridSheet = Object.create(HTMLElement.prototype, {
//     createdCallback: {
//         value: function() {
//             this.id=`plurid-sheet-${sheetId}`;

//             if (sheetId == 1) {
//                 initControls();
//             }

//             renderControls(this, sheetId);

//             sheetId++;
//         }
//     }
// });

// document.registerElement( "plurid-sheet", {
//     prototype: pluridSheet
// });


class PluridSheet extends HTMLElement {
    constructor() {
        super();

        // this.id=`plurid-sheet-${sheetId}`;

        // if (sheetId == 1) {
        //     initControls();
        // }

        // renderControls(this, sheetId);

        // sheetId++;
    }


    connectedCallback() {
        this.id=`plurid-sheet-${sheetId}`;

        if (sheetId == 1) {
            initControls();
        }

        renderControls(this, sheetId);

        sheetId++;

        this.addEventListener('click', event => {
            // let cX = event.clientX;
            // let sX = event.screenX;
            // let cY = event.clientY;
            // let sY = event.screenY;
            // let pX = event.pageX;
            // let pY = event.pageY;
            // let oX = event.offsetX;
            // let oY = event.offsetY;
            // let thisTop = this.offsetTop;
            // let thisLeft = this.offsetLeft;

            // var x = event.pageX - this.offsetLeft;
            // var y = event.pageY - this.offsetTop;

            // console.log('-----------------');
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
            // console.log(event);
            // console.log(this);
            let right = this.offsetLeft + this.offsetWidth;
            let top = this.offsetTop;

            // console.log('sheet right', right);
            // console.log('sheet top', top);
        });
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




var pluridSheetDouble = Object.create(HTMLElement.prototype, {
    createdCallback: {
        value: function() {
            // console.log("pluridSheetDouble works");
        }
    }
});

document.registerElement( "plurid-sheet-double", {
    prototype: pluridSheetDouble
});



var pluridSheetDoubleFront = Object.create(HTMLElement.prototype, {
    createdCallback: {
        value: function() {
            // console.log("pluridSheetDoubleFront works");
        }
    }
});

document.registerElement( "plurid-sheet-double-front", {
    prototype: pluridSheetDoubleFront
});



var pluridSheetDoubleBack = Object.create(HTMLElement.prototype, {
    createdCallback: {
        value: function() {
            // console.log("pluridSheetDoubleBack works");
        }
    }
});

document.registerElement( "plurid-sheet-double-back", {
    prototype: pluridSheetDoubleBack
});
