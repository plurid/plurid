import { closePlurid } from "../elements/controls-core.js";
import { getPlurid } from "./get-plurid.js";
import { rotatePlurid,
         translatePlurid,
         scalePlurid } from './transforms';



export function initShortcuts() {
    document.addEventListener("keydown", (event) => {
        shortcuts(event);
    });
}

function shortcuts(event) {
    // let activePluridID = getPlurid.sheet
    // let activePluridElement = document.getElementById(activePluridID);
    let activePluridElement = getPlurid().sheet;
    let activePlurid = document.getElementById(pluridScene.meta.activePlurid);

    let ultimateKey = event.which;


    // ROTATE
    if(event.shiftKey && ultimateKey == 37) {
        // console.log("Rotate Left");
        let direction = 'left';
        rotatePlurid(event, activePlurid, direction);
    }

    if(event.shiftKey && ultimateKey == 39) {
        // console.log("Rotate Right");
        let direction = 'right';
        rotatePlurid(event, activePlurid, direction);
    }

    if(event.shiftKey && ultimateKey == 38) {
        // console.log("Rotate Up");
        let direction = 'up';
        rotatePlurid(event, activePlurid, direction);
    }

    if(event.shiftKey && ultimateKey == 40) {
        // console.log("Rotate Down");
        let direction = 'down';
        rotatePlurid(event, activePlurid, direction);
    }



    // TRANSLATE
    if(event.altKey && ultimateKey == 37) {
        // console.log("Translate Left");
        let direction = 'left';
        translatePlurid(event, activePlurid, direction);
    }

    if(event.altKey && ultimateKey == 39) {
        // console.log("Translate Right");
        let direction = 'right';
        translatePlurid(event, activePlurid, direction);
    }

    if(event.altKey && ultimateKey == 38) {
        // console.log("Translate Up");
        let direction = 'up';
        translatePlurid(event, activePlurid, direction);
    }

    if(event.altKey && ultimateKey == 40) {
        // console.log("Translate Down");
        let direction = 'down';
        translatePlurid(event, activePlurid, direction);
    }



    // SCALE
    if(event.metaKey && ultimateKey == 38) {
        // console.log("Scale Up");
        let direction = 'up';
        scalePlurid(event, activePlurid, direction);
    }

    if(event.metaKey && ultimateKey == 40) {
        // console.log("Scale Down");
        let direction = 'down';
        scalePlurid(event, activePlurid, direction);
    }



    // VIEW
    // alt/opt + 1
    if(event.altKey && ultimateKey == 49) {
        console.log("transform to normal view front plane");
    }

    // alt/opt + 2
    if(event.altKey && ultimateKey == 50) {
        console.log("transform to normal view right plane");
    }

    // alt/opt + 3
    if(event.altKey && ultimateKey == 51) {
        console.log("transform to normal view back plane");
    }

    // alt/opt + 4
    if(event.altKey && ultimateKey == 52) {
        console.log("transform to normal view left plane");
    }



    // THE REST OF THE SHORTCUTS
    // alt/opt + p
    if(event.altKey && ultimateKey == 80) {
        console.log("bring the parent of the current plurid to normal view");
    }

    // alt/opt + m
    if(event.altKey && ultimateKey == 77) {
        console.log("minimize current plurid");
    }

    // alt/opt + h
    if(event.altKey && ultimateKey == 72) {
        console.log("reduce height of current plurid");
    }

    // alt/opt + r
    if(event.altKey && ultimateKey == 82) {
        console.log("reload current plurid");
    }

    // alt/opt + e
    if(event.altKey && ultimateKey == 69 && !event.shiftKey) {
        console.log("extend positive the <plurid-bridge> of the current plurid");
    }

    // shift + e
    if(event.shiftKey && ultimateKey == 69 && !event.altKey) {
        console.log("extend negative the <plurid-bridge> of the current plurid");
    }

    // alt/opt + x
    if(event.altKey && ultimateKey == 88) {
        if (activePluridElement.parentElement.nodeName == "PLURID-ROOT") {
            activePluridElement.parentElement.style.display = "none";
        }

        if (activePluridElement.parentElement.nodeName == "PLURID-SCION") {
            activePluridElement.parentElement.parentElement.style.display = "none";
        }

        // console.log(activePluridElement.parentElement.parentElement.nodeName);
        // console.log(`close current plurid with ID: ${activePluridID}`);
    }

    // alt/opt + i
    if(event.altKey && ultimateKey == 73) {
        console.log("isolate current plurid");
    }

    // alt/opt + a
    if(event.altKey && ultimateKey == 65) {
        console.log("back to the previous web page within the same plurid");
    }

    // alt/opt + z
    if(event.altKey && ultimateKey == 90) {
        console.log("forward to the next web page within the same plurid");
    }

    // alt/opt + s
    if(event.altKey && ultimateKey == 83) {
        console.log("activate the plurid URL input");
    }

    // alt/opt + t
    if(event.altKey && ultimateKey == 84) {
        console.log("extract the current plurid to a separate <plurid-root>");
    }

    // alt/opt + n
    if(event.altKey && ultimateKey == 78) {
        console.log("open current plurid in new tab");
    }

    // alt/opt + f
    if(event.altKey && ultimateKey == 70) {
        console.log("flip the <plurid-branch> to the other side of the <plurid-insertion>");
    }

    // alt/opt + v
    if(event.altKey && ultimateKey == 86) {
        console.log("flip the content to the other side");
    }


    // console.log(ultimateKey);
}
