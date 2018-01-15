let styleString = "0px 0px 6px 3px rgba(194,194,194,0.7)";

export function stylePlurid(plurid, stack) {
    function style(stackItem) {
        if (stackItem.id === plurid.id) {
            stackItem.style.boxShadow = styleString;
        }

        if (stackItem.id === "plurid-roots" || stackItem.id != plurid.id) {
            stackItem.style.boxShadow = "";
        }
    }

    stack.forEach(style);
}