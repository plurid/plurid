export function getPlurid(event) {
    // let pluridToTransformId = getPluridToTransformId(event.path);
    // let pluridToTransformElement = document.querySelector(`#${pluridToTransformId}`);

    let selectedPluridRoot = getSelectedPlurids(event.path).root;
    let selectedPluridSheet = getSelectedPlurids(event.path).sheet;

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
