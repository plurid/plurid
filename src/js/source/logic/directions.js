let direction = "";
let threshold = 0;
let absThreshold = 10;

export function getMouseWheelDirection(event) {
    const wheelDeltaX = event.wheelDeltaX;
    const wheelDeltaY = event.wheelDeltaY;
    const absWheelDeltaX = Math.abs(wheelDeltaX)
    const absWheelDeltaY = Math.abs(wheelDeltaY)

    if (wheelDeltaX > threshold
        && absWheelDeltaY < absThreshold
        && absWheelDeltaX > absWheelDeltaY) {
        direction = "left";
    }

    if (wheelDeltaX < threshold
        && absWheelDeltaY < absThreshold
        && absWheelDeltaX > absWheelDeltaY) {
        direction = "right";
    }

    if (wheelDeltaY > threshold
        && absWheelDeltaX < absThreshold
        && absWheelDeltaY > absWheelDeltaX) {
        direction = "up";
    }

    if (wheelDeltaY < threshold
        && absWheelDeltaX < absThreshold
        && absWheelDeltaY > absWheelDeltaX) {
        direction = "down";
    }

    // if (positionX < threshold && positionY < threshold) {
    //     direction = "upleft";
    // }

    // if (positionX < threshold && positionY > threshold ) {
    //     direction = "downleft";
    // }

    // if (positionX > threshold && positionY > threshold ) {
    //     direction = "downright";
    // }

    // if (positionX > threshold && positionY < threshold ) {
    //     direction = "upright";
    // }

    // console.log('----- direction: ', direction);
    // console.log('movementX: ', event.movementX);
    // console.log('movementY: ', event.movementY);
    return direction;
}


var pluridContainer = document.getElementsByTagName("plurid-container");

pluridContainer[0].addEventListener("wheel", function(event) {
    event.preventDefault();

    var deltaX = event.deltaX;
    var deltaY = event.deltaY;
    var wheelDeltaX = event.wheelDeltaX;
    var wheelDeltaY = event.wheelDeltaY;

    // console.log(`Delta X ${deltaX}`, `Delta Y ${deltaY}`);
    // console.log(`Wheel Delta X: ${wheelDeltaX}`, `Wheel Delta Y: ${wheelDeltaY}`);

    // console.log(event);
    console.log(getMouseWheelDirection(event));
});

// console.log(pluridContainer[0]);
