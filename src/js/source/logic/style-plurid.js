let styleString = "rgba(194, 194, 194, 0.7) 0px 0px 6px 3px";

export function stylePlurid(plurid, stack) {
    // console.log(plurid.style.boxShadow);

    function style(stackItem) {
        if (stackItem.id === plurid.id) {
            if (plurid.style.boxShadow === styleString) {
                stackItem.style.boxShadow = "";
                plurid = document.querySelector("plurid-roots");
            } else {
                stackItem.style.boxShadow = styleString;
            }
        }

        if (stackItem.id === "plurid-roots" || stackItem.id != plurid.id) {
            stackItem.style.boxShadow = "";
        }
    }

    stack.forEach(style);

    return plurid;
}