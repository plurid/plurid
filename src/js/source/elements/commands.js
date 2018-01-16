import { getPlurid } from "../logic/get-plurid.js";
import { stylePlurid as style } from "../logic/style-plurid.js"
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


export function displayOptions(element) {
    element.addEventListener("mousemove", event => {
        let cursorYLocation = event.pageY;
        let containerHeight = element.clientHeight;
        let optionsDisplayLimitOn = 80;
        let optionsDisplayLimitOff = 100;
        let optionsTag = document.getElementsByTagName("plurid-options");

        if (cursorYLocation > (containerHeight - optionsDisplayLimitOn)) {
            for (let optionsElement of optionsTag) {
                optionsElement.style.display = "block";
            }
        }

        if (cursorYLocation < (containerHeight - optionsDisplayLimitOff)){
            for (let optionsElement of optionsTag) {
                optionsElement.style.display = "none";
            }
        }
    })
}
