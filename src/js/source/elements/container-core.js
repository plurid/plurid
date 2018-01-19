import { getPlurid } from "../logic/get-plurid.js";
import { stylePlurid as style } from "../logic/style-plurid.js";
import { rotatePlurid,
        translatePlurid,
        scalePlurid } from "../logic/transforms.js";


export function transform(element) {
    let pluridStack = new Set();
    let plurid = document.querySelector("plurid-roots");

    element.addEventListener("click", event => {
        plurid = getPlurid(event);
        pluridStack.add(plurid);
        plurid = style(plurid, pluridStack);
    });

    element.addEventListener('wheel', event => {
        if(event.shiftKey) {
            event.preventDefault();

            rotatePlurid(event, plurid);
        }

        if(event.altKey) {
            event.preventDefault();

            translatePlurid(event, plurid);
        }

        if(event.metaKey) {
            event.preventDefault();

            scalePlurid(event, plurid);
        }
    });
}
