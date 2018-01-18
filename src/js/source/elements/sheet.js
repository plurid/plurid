import { initControls } from "./controls.js";
import { renderControls } from "./controls-core.js";




var sheetId = 1;

var pluridSheet = Object.create(HTMLElement.prototype, {
    createdCallback: {
        value: function() {
            this.id=`plurid-sheet-${sheetId}`;

            if (sheetId == 1) {
                initControls();
            }

            renderControls(this, sheetId);

            sheetId++;
        }
    }
});

document.registerElement( "plurid-sheet", {
    prototype: pluridSheet
});



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
