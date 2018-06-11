import { getPlurid } from "../logic/get-plurid.js";
import { stylePlurid as style } from "../logic/style-plurid.js";
import { rotatePlurid,
        translatePlurid,
        scalePlurid } from "../logic/transforms.js";


// transform receives the selected plurid
export function transform(element) {
    // let pluridStack = new Set();
    // let plurid = document.getElementById(pluridScene.selectedPluridRoot);
    let plurid = document.querySelector("plurid-roots");
    // let plurid = document.getElementById("plurid-roots-1");
    // console.log(plurid);

    element.addEventListener("click", event => {
        plurid = getPlurid(event).root;
        let pluridSheet = getPlurid(event).sheet;
        // console.log("PLURID ROOT ", pluridRoot);
        // console.log("PLURID SHEET", pluridSheet);

        // pluridStack.add(pluridRoot);
        // plurid = style(pluridRoot, pluridStack);
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
