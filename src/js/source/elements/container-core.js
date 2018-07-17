import { getPlurid } from "../logic/get-plurid";
import { stylePlurid as style } from "../logic/style-plurid";
import { rotatePlurid,
         translatePlurid,
         scalePlurid } from "../logic/transforms";
import { removeActiveSheetShadow } from "./sheet-core";
import { rotateViewcube } from "./viewcube-core";



// transform receives the selected plurid
export function transform(element) {
    // let pluridStack = new Set();
    let plurid = element.children[0];

    element.addEventListener("click", event => {
        // cross-browsers eventPath
        let eventPath = event.path || (event.composedPath && event.composedPath());
        let currentPluridRoot = checkCurrentPluridRoot(eventPath);

        if (eventPath[0].id == element.id || !currentPluridRoot) {
        // if (!currentPluridRoot) {
            pluridScene.metadata.activePlurid = 'plurid-roots-1';
            pluridScene.metadata.previousActiveSheet = pluridScene.metadata.activeSheet;
            pluridScene.metadata.activeSheet = "";

            removeActiveSheetShadow(pluridScene.metadata.previousActiveSheet, 'plurid-sheet-active');
            removeActiveSheetShadow(pluridScene.metadata.previousActiveSheet, 'plurid-sheet-active-transform');
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
            rotateViewcube(event, plurid);
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


function checkCurrentPluridRoot(eventPath) {
    // console.log('eventPath', eventPath);

    let pluridSheet;
    let pluridSheetId = '';
    let pluridBranch;
    let pluridBranchId = '';
    let pluridBranchScene;

    for (let eventPathElement of eventPath) {
        if (eventPathElement.classList) {
            if (eventPathElement.classList.contains('plurid-controls-select')) {
                return true;
            }
        }

        if (eventPathElement.nodeName == 'PLURID-SHEET') {
            pluridSheet = eventPathElement;
            pluridSheetId = eventPathElement.id;
        }
    }

    for (let pluridSceneContent of pluridScene.content) {
        // console.log(pluridSceneContent.id);
        for (let child of pluridSceneContent.children) {
            if (child.sheetId == pluridSheetId) {
                return verifyChild(pluridSceneContent.id);
            } else {
                return recursiveCheck(child.children, pluridSceneContent.id);
            }
        }

        if (pluridSceneContent.sheetId == pluridSheetId) {
            return verifyChild(pluridSceneContent.id);
        }
    }


    function verifyChild(verifyId) {
        if (verifyId == pluridScene.metadata.activePlurid) {
            // console.log(verifyId);
            // console.log(pluridScene.metadata.activePlurid);
            return true;
        }
    }

    function recursiveCheck(children, verifyId) {
        for (let child of children) {
            if (child.sheetId == pluridSheetId) {
                return verifyChild(verifyId);
            } else {
                return recursiveCheck(child.children, verifyId);
            }
        }
    }

    return false;
}
