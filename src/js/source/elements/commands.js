import {rotatePlurid,
        translatePlurid,
        scalePlurid}
from "../logic/transforms.js";


export function transform(element) {
    element.addEventListener('wheel', event => {
        event.preventDefault();

        if(event.shiftKey) {
            rotatePlurid(event);
        }

        if(event.altKey) {
            translatePlurid(event);
        }

        if(event.metaKey) {
            scalePlurid(event);
        }
    });
}
