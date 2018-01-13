export function transform(element) {
    element.addEventListener('wheel', event => {
        // console.log(event)
        if(event.shiftKey) {
            console.log(`Rotate ${event.path[0].localName}`);
        }

        if(event.altKey) {
            console.log(`Translate ${event.path[0].localName}`);
        }

        if(event.metaKey) {
            console.log(`Scale ${event.path[0].localName}`);
        }
    });
}
