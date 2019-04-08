interface Deltas {
    deltaX: number;
    deltaY: number;
}

export const getWheelDirection = (
    deltas: Deltas,
    ABSTHRESHOLD: number = 10,
    THRESHOLD: number = 0
): string => {
    let direction = 'left';
    const wheelDeltaX = deltas.deltaX;
    const wheelDeltaY = deltas.deltaY;
    // console.log('PluridEngine :: wheelDeltaX', wheelDeltaX);
    // console.log('PluridEngine :: wheelDeltaY', wheelDeltaY);
    const absWheelDeltaX = Math.abs(wheelDeltaX);
    const absWheelDeltaY = Math.abs(wheelDeltaY);
    // console.log('PluridEngine :: absWheelDeltaX', absWheelDeltaX);
    // console.log('PluridEngine :: absWheelDeltaY', absWheelDeltaY);

    if (
        wheelDeltaX > THRESHOLD &&
        absWheelDeltaY < ABSTHRESHOLD &&
        absWheelDeltaX > absWheelDeltaY
    ) {
        direction = 'left';
    }

    if (
        wheelDeltaX < THRESHOLD &&
        absWheelDeltaY < ABSTHRESHOLD &&
        absWheelDeltaX > absWheelDeltaY
    ) {
        direction = 'right';
    }

    if (
        wheelDeltaY > THRESHOLD &&
        absWheelDeltaX < ABSTHRESHOLD &&
        absWheelDeltaY > absWheelDeltaX
    ) {
        direction = 'up';
    }

    if (
        wheelDeltaY < THRESHOLD &&
        absWheelDeltaX < ABSTHRESHOLD &&
        absWheelDeltaY > absWheelDeltaX
    ) {
        direction = 'down';
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

    return direction;
};
