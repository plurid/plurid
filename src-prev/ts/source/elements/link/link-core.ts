export function setLinkContent(element: any) {
    if (element.innerHTML === "") {
        element.innerHTML = '&#9624;';      // ▘ 'QUADRANT UPPER LEFT' (U+2598)
        // element.innerHTML = '&#9612;';   // ▌ 'LEFT HALF BLOCK' (U+258C)
        // element.innerHTML = '&#9614;';   // ▎ 'LEFT ONE QUARTER BLOCK' (U+258E)
    }
}
