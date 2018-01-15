let direction = "";
let threshold = 0;
let absThreshold = 10;

export function getDirection(event) {
    const wheelDeltaX = event.wheelDeltaX;
    const wheelDeltaY = event.wheelDeltaY;
    const absWheelDeltaX = Math.abs(wheelDeltaX)
    const absWheelDeltaY = Math.abs(wheelDeltaY)

    if (wheelDeltaX > threshold
        && absWheelDeltaY < absThreshold
        && absWheelDeltaX > absWheelDeltaY) {
        direction = "Left";
    }

    if (wheelDeltaX < threshold
        && absWheelDeltaY < absThreshold
        && absWheelDeltaX > absWheelDeltaY) {
        direction = "Right";
    }

    if (wheelDeltaY > threshold
        && absWheelDeltaX < absThreshold
        && absWheelDeltaY > absWheelDeltaX) {
        direction = "Up";
    }

    if (wheelDeltaY < threshold
        && absWheelDeltaX < absThreshold
        && absWheelDeltaY > absWheelDeltaX) {
        direction = "Down";
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
