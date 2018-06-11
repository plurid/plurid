export function getPlurid(event) {
    // let pluridToTransformId = getPluridToTransformId(event.path);
    // let pluridToTransformElement = document.querySelector(`#${pluridToTransformId}`);

    // let selectedPluridRoot = getSelectedPlurids(event.path).root;
    // let selectedPluridSheet = getSelectedPlurids(event.path).sheet;

    let selectedPluridRoot = document.getElementById("plurid-roots-1");
    let selectedPluridSheet = document.getElementById("plurid-sheet-1");

    return {
        root: selectedPluridRoot,
        sheet: selectedPluridSheet
    }
}


function getSelectedPlurids(path) {
    let selectedPluridRootID = path[0].localName;
    // console.log(path);

    if (selectedPluridRootID === "plurid-roots"
        || selectedPluridRootID === "plurid-container") {
        selectedPluridRootID = "plurid-roots";
    } else {
        selectedPluridRootID = searchForSelectedIDs(path).root;
    }

    let selectedPluridSheetID = searchForSelectedIDs(path).sheet;

    let selectedPluridRoot = document.querySelector(`#${selectedPluridRootID}`);
    let selectedPluridSheet = selectedPluridSheetID ? document.querySelector(`#${selectedPluridSheetID}`) : null ;

    return {
        root: selectedPluridRoot,
        sheet: selectedPluridSheet
    }
}


function searchForSelectedIDs(path) {
    let root = "";
    let sheet = "";

    for (let i = 0; i < path.length; i++) {
        if (path[i].localName === "plurid-root") {
            root = path[i].id;
            // return path[i].id;
        }

        if (path[i].localName === "plurid-sheet") {
            sheet = path[i].id;
        }

        if (path[i].localName === "plurid-options") {
             root = "plurid-roots";
        }
    }

    return {
        root: root,
        sheet: sheet
    }
}


export var activePlurid = {
    selected: 'plurid-root-2'
}

// Object.defineProperty(activePlurid, 'selected', {
//     value: document.querySelector("plurid-roots"),
//     writable: true
// });

// console.log("1", activePlurid.selected);
