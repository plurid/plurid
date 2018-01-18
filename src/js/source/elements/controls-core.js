export function renderControls(element, id) {
    var controls = document.createElement("plurid-controls");
    controls.id = `plurid-controls-${id}`;
    element.appendChild(controls);
}


export function contentControls () {
    let content = `<div>Controls</div>`

    return content;
}
