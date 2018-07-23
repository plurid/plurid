import { getPlurid } from "../logic/get-plurid";
import { stylePlurid as style } from "../logic/style-plurid";
import { rotatePlurid,
         translatePlurid,
         scalePlurid } from "../logic/transforms";
import { removeActiveSheetShadow } from "./sheet-core";
import { rotateViewcube } from "./viewcube-core";



// transform receives the selected plurid
export function transform(container) {
    // let pluridStack = new Set();
    let plurid = container.getElementsByTagName('plurid-roots')[0];

    let direction = "";
    let oldX = 0;
    let oldY = 0;

    function getDirection(event) {
        return (function (event) {
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

    container.addEventListener('mousedown', event => {
        if (event.which == 2 || event.button == 4 ) {
            if(event.shiftKey) {
                event.preventDefault();
                container.addEventListener('mousemove', rotatePluridClickThree);
            }
            if(event.altKey) {
                event.preventDefault();
                container.addEventListener('mousemove', translatePluridClickThree);
            }
        }
    });

    container.addEventListener('mouseup', event => {
        if (event.which == 2 || event.button == 4 ) {
            container.removeEventListener('mousemove', rotatePluridClickThree);
            container.removeEventListener('mousemove', translatePluridClickThree);
        }
    });

    container.addEventListener("click", event => {
        // cross-browsers eventPath
        let eventPath = event.path || (event.composedPath && event.composedPath());
        let currentPluridRoot = checkCurrentPluridRoot(eventPath);

        if (eventPath[0].id == container.id || !currentPluridRoot) {
            pluridScene.meta.activePlurid = 'plurid-roots-1';
            pluridScene.meta.previousActiveSheet = pluridScene.meta.activeSheet;
            pluridScene.meta.activeSheet = "";

            removeActiveSheetShadow(pluridScene.meta.previousActiveSheet, 'plurid-sheet-active');
            removeActiveSheetShadow(pluridScene.meta.previousActiveSheet, 'plurid-sheet-active-transform');
        }

        plurid = getPlurid(event).root;
    });

    container.addEventListener('wheel', event => {
        if(event.shiftKey) {
            event.preventDefault();

            rotatePlurid(event, plurid);
            if (plurid.nodeName == 'PLURID-ROOTS') {
                rotateViewcube(event, plurid);
            }
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
        if (verifyId == pluridScene.meta.activePlurid) {
            // console.log(verifyId);
            // console.log(pluridScene.meta.activePlurid);
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
