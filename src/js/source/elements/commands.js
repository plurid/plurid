export function transform(element) {
    element.addEventListener('wheel', event => {
        // console.log(event)
        // console.log(event.path);
        // console.log(searchForRootId(event.path));

        let pluridToTransform = getPluridToTransform(event.path)

        if(event.shiftKey) {
            console.log(`Rotate ${pluridToTransform}`);
        }

        if(event.altKey) {
            console.log(`Translate ${pluridToTransform}`);
        }

        if(event.metaKey) {
            console.log(`Scale ${pluridToTransform}`);
        }
    });
}


function getPluridToTransform(path) {
    let pluridToTransform = path[0].localName;

    if (pluridToTransform === "plurid-options") {
        // do nothing
    }

    if (pluridToTransform === "plurid-roots" || pluridToTransform === "plurid-container") {
        pluridToTransform = "plurid-roots";
    } else {
        // console.log(searchForRootId(path));
        pluridToTransform = searchForRootId(path);
    }

    return pluridToTransform;
}



function searchForRootId(path) {
    // console.log(path.length);
    for (var i = 0; i < path.length; i++) {
        // console.log(path[i]);
        if (path[i].localName === "plurid-root") {
            return path[i].id;
        }
    }
}
