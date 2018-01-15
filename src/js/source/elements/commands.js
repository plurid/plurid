export function transform(element) {
    element.addEventListener('wheel', event => {
        // console.log(event)

        let pluridToTransformId = getPluridToTransformId(event.path);
        let pluridToTransformElement = document.querySelector(`#${pluridToTransformId}`);

        console.log("Plurid to Transform Element", pluridToTransformElement);

        if(event.shiftKey) {
            console.log(`Rotate ${pluridToTransformId}`);
        }

        if(event.altKey) {
            console.log(`Translate ${pluridToTransformId}`);
        }

        if(event.metaKey) {
            console.log(`Scale ${pluridToTransformId}`);
        }
    });
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
    }
}
