import { getPlurid } from "../logic/get-plurid.js";
import { stylePlurid as style } from "../logic/style-plurid.js"
import {rotatePlurid,
        translatePlurid,
        scalePlurid} from "../logic/transforms.js";

let pluridStack = new Set();

export function transform(element) {
    let plurid = document.querySelector("plurid-roots");

    element.addEventListener("click", event => {
        plurid = getPlurid(event);
        pluridStack.add(plurid);
        style(plurid, pluridStack);
    });

    element.addEventListener('wheel', event => {
        event.preventDefault();

        if(event.shiftKey) {
            rotatePlurid(event, plurid);
        }

        if(event.altKey) {
            translatePlurid(event, plurid);
        }

        if(event.metaKey) {
            scalePlurid(event, plurid);
        }
    });
}
