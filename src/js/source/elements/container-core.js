import { getPlurid } from "../logic/get-plurid";
import { stylePlurid as style } from "../logic/style-plurid";
import { rotatePlurid,
         translatePlurid,
         scalePlurid } from "../logic/transforms";
import { removeActiveSheetShadow } from "./sheet-core";


// transform receives the selected plurid
export function transform(element) {
    // let pluridStack = new Set();
    let plurid = element.children[0];

    element.addEventListener("click", event => {
        if (event.path[0].id == element.id) {
            pluridScene.metadata.activePlurid = 'plurid-roots-1';
            pluridScene.metadata.previousActiveSheet = pluridScene.metadata.activeSheet;
            pluridScene.metadata.activeSheet = "";

            removeActiveSheetShadow(pluridScene.metadata.previousActiveSheet);
        }

        plurid = getPlurid(event).root;
        // let pluridSheet = getPlurid(event).sheet;

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
