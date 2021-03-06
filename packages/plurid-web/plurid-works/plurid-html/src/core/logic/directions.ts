let direction = "";
const threshold = 0;
const absThreshold = 10;


export function getDirection(event: any) {
    const wheelDeltaX = event.wheelDeltaX;
    const wheelDeltaY = event.wheelDeltaY;
    // console.log(wheelDeltaX);
    // console.log(wheelDeltaY);
    const absWheelDeltaX = Math.abs(wheelDeltaX);
    const absWheelDeltaY = Math.abs(wheelDeltaY);

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
