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

    let direction = "";
    let oldX = 0;
    let oldY = 0;

    function getDirection(event) {

        return (function (event) {
            // console.log(oldX);
            // console.log(oldY);

            if (oldX < event.clientX) {
                direction = "right";
            } else if (oldX > event.clientX) {
                direction = "left";
            }

            // issues with transforms
            // if (oldY < event.clientY) {
            //     direction = "down";
            // } else if (oldY > event.clientY) {
            //     direction = "up";
            // }

            oldX = event.clientX;
            oldY = event.clientY;

            return direction;
        })(event);
    }

    function rotatePluridClickThree(event) {
        if(event.shiftKey) {
            event.preventDefault();
            let direction = getDirection(event);
            rotatePlurid(event, plurid, direction);
            rotateViewcube(event, plurid);
        }
    }

    function translatePluridClickThree(event) {
        if(event.altKey) {
            event.preventDefault();
            let direction = getDirection(event);
            translatePlurid(event, plurid, direction);
        }
    }

    element.addEventListener('mousedown', event => {
        if (event.which == 2 || event.button == 4 ) {
            if(event.shiftKey) {
                event.preventDefault();
                element.addEventListener('mousemove', rotatePluridClickThree);
            }
            if(event.altKey) {
                event.preventDefault();
                element.addEventListener('mousemove', translatePluridClickThree);
            }
        }
    });

    element.addEventListener('mouseup', event => {
        if (event.which == 2 || event.button == 4 ) {
            element.removeEventListener('mousemove', rotatePluridClickThree);
            element.removeEventListener('mousemove', translatePluridClickThree);
        }
    });

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

        if(event.metaKey || event.ctrlKey) {
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
