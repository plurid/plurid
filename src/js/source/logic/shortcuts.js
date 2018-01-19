export function initShortcuts(element) {
    document.addEventListener("keydown", (event) => {
        shortcuts(event);
    });
}

function shortcuts(event, keys) {
    let ultimateKey = event.which;

    // ROTATE
    if(event.shiftKey && ultimateKey == 37) {
        console.log("Rotate Left");
    }

    if(event.shiftKey && ultimateKey == 39) {
        console.log("Rotate Right");
    }

    if(event.shiftKey && ultimateKey == 38) {
        console.log("Rotate Up");
    }

    if(event.shiftKey && ultimateKey == 40) {
        console.log("Rotate Down");
    }



    // TRANSLATE
    if(event.altKey && ultimateKey == 37) {
        console.log("Translate Left");
    }

    if(event.altKey && ultimateKey == 39) {
        console.log("Translate Right");
    }

    if(event.altKey && ultimateKey == 38) {
        console.log("Translate Up");
    }

    if(event.altKey && ultimateKey == 40) {
        console.log("Translate Down");
    }



    // SCALE
    if(event.metaKey && ultimateKey == 38) {
        console.log("Scale Up");
    }

    if(event.metaKey && ultimateKey == 40) {
        console.log("Scale Down");
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
        console.log("close current plurid");
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
