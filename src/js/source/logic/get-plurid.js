export function getPlurid(event) {
    let pluridToTransformId = getPluridToTransformId(event.path);
    let pluridToTransformElement = document.querySelector(`#${pluridToTransformId}`);

    return pluridToTransformElement;
}


function getPluridToTransformId(path) {
    let pluridToTransformId = path[0].localName;

    if (pluridToTransformId === "plurid-options") {
        // no transforms are performable while cursor is over <plurid-options>
        return null;
    }

    if (pluridToTransformId === "plurid-roots"
        || pluridToTransformId === "plurid-container") {
        pluridToTransformId = "plurid-roots";
    } else {
        pluridToTransformId = searchForPluridRootId(path);
    }

    return pluridToTransformId;
}


function searchForPluridRootId(path) {
    for (let i = 0; i < path.length; i++) {
        if (path[i].localName === "plurid-root") {
            return path[i].id;
        }

        if (path[i].localName === "plurid-options") {
            return "plurid-roots";
        }
    }
}
