import { getPlurid } from "../../core/logic/get-plurid";
// import { stylePlurid as style } from "../../core/logic/style-plurid";
import {
        rotatePlurid,
        rotation,
        scalePlurid,
        translatePlurid,
        } from "../../core/logic/transforms";
import { removeActiveSheetShadow } from "../sheet/sheet-core";
// import { rotateViewcube } from "../viewcube/viewcube-core";



// transform receives the selected plurid
export function transform(container: any) {
    // let pluridStack = new Set();
    let plurid: HTMLElement | null = container.getElementsByTagName('plurid-roots')[0];

    const _transform = {
        plurid,
        container,
    };


    let direction = "";
    let oldX = 0;
    let oldY = 0;

    function getDirection(event: MouseEvent) {
        return ( (_event) => {
            if (oldX < _event.clientX) {
                direction = "right";
            } else if (oldX > _event.clientX) {
                direction = "left";
            }

            // issues with transforms
            // if (oldY < event.clientY) {
            //     direction = "down";
            // } else if (oldY > event.clientY) {
            //     direction = "up";
            // }

            oldX = _event.clientX;
            oldY = _event.clientY;

            return direction;
        })(event);
    }

    function rotatePluridClickThree(event: any) {
        if (event.shiftKey) {
            event.preventDefault();
            const _direction = getDirection(event);
            rotatePlurid(event, plurid, _direction);
            // rotateViewcube(event, plurid);
        }
    }

    function translatePluridClickThree(event: any) {
        if (event.altKey) {
            event.preventDefault();
            const _direction = getDirection(event);
            translatePlurid(event, plurid, _direction);
        }
    }

    container.addEventListener('mousedown', (event: any) => {
        if (event.which === 2 || event.button === 4 ) {
            if (event.shiftKey) {
                event.preventDefault();
                container.addEventListener('mousemove', rotatePluridClickThree);
            }
            if (event.altKey) {
                event.preventDefault();
                container.addEventListener('mousemove', translatePluridClickThree);
            }
        }
    });

    container.addEventListener('mouseup', (event: any) => {
        if (event.which === 2 || event.button === 4 ) {
            container.removeEventListener('mousemove', rotatePluridClickThree);
            container.removeEventListener('mousemove', translatePluridClickThree);
        }
    });

    container.addEventListener("click", (event: any) => {
        // cross-browsers eventPath
        const eventPath = event.path || (event.composedPath && event.composedPath());
        const currentPluridRoot = checkCurrentPluridRoot(eventPath);

        if (eventPath[0].id === container.id || !currentPluridRoot) {
            (<any> window).pluridScene.meta.activePlurid = 'plurid-roots-1';
            (<any> window).pluridScene.meta.previousActiveSheet = (<any> window).pluridScene.meta.activeSheet;
            (<any> window).pluridScene.meta.activeSheet = "";

            removeActiveSheetShadow((<any> window).pluridScene.meta.previousActiveSheet, 'plurid-sheet-active');
            removeActiveSheetShadow((<any> window).pluridScene.meta.previousActiveSheet, 'plurid-sheet-active-transform');
        }

        plurid = getPlurid(event).root;
    });

    container.addEventListener('wheel', (event: MouseEvent) => {
        if (event.shiftKey) {
            event.preventDefault();
            (<any> _transform).event = event;
            rotation(_transform);
        }

        if (event.altKey) {
            event.preventDefault();

            translatePlurid(event, plurid);
        }

        if (event.metaKey || event.ctrlKey) {
            event.preventDefault();

            scalePlurid(event, plurid);
        }
    });
}


function checkCurrentPluridRoot(eventPath: any) {
    // console.log('eventPath', eventPath);

    let pluridSheet: any;
    let pluridSheetId = '';
    // let pluridBranch;
    // let pluridBranchId = '';
    // let pluridBranchScene;

    for (const eventPathElement of eventPath) {
        if (eventPathElement.classList) {
            if (eventPathElement.classList.contains('plurid-controls-select')) {
                return true;
            }
        }

        if (eventPathElement.nodeName === 'PLURID-SHEET') {
            pluridSheet = eventPathElement;
            pluridSheetId = eventPathElement.id;
        }
    }

    for (const pluridSceneContent of (<any> window).pluridScene.content) {
        // console.log(pluridSceneContent.id);
        for (const child of pluridSceneContent.children) {
            if (child.sheetId === pluridSheetId) {
                return verifyChild(pluridSceneContent.id);
            } else {
                return recursiveCheck(child.children, pluridSceneContent.id);
            }
        }

        if (pluridSceneContent.sheetId === pluridSheetId) {
            return verifyChild(pluridSceneContent.id);
        }
    }


    function verifyChild(verifyId: any) {
        if (verifyId === (<any> window).pluridScene.meta.activePlurid) {
            // console.log(verifyId);
            // console.log(pluridScene.meta.activePlurid);
            return true;
        }
    }

    function recursiveCheck(children: any, verifyId: any): any {
        for (const child of children) {
            if (child.sheetId === pluridSheetId) {
                return verifyChild(verifyId);
            } else {
                return recursiveCheck(child.children, verifyId);
            }
        }
    }

    return false;
}
