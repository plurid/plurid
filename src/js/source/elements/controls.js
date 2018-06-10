import { contentControls, setControls } from "./controls-core";



export function initControls() {
    let pluridSheetControls = Object.create(HTMLElement.prototype, {
        createdCallback: {
            value: function() {
                this.innerHTML = contentControls();
                setControls(this);
            }
        }
    });

    document.registerElement( "plurid-controls", {
        prototype: pluridSheetControls
    });
}
