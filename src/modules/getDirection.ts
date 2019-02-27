export const getDirection = (
    event: any,
    ABSTHRESHOLD: number = 10,
    THRESHOLD: number = 0
): string => {
    let direction = 'left'
    const wheelDeltaX = event.deltaX
    const wheelDeltaY = event.deltaY
    // console.log('wheelDeltaX', wheelDeltaX);
    // console.log('wheelDeltaY', wheelDeltaY);
    const absWheelDeltaX = Math.abs(wheelDeltaX)
    const absWheelDeltaY = Math.abs(wheelDeltaY)
    // console.log('absWheelDeltaX', absWheelDeltaX);
    // console.log('absWheelDeltaY', absWheelDeltaY);

    if (
        wheelDeltaX > THRESHOLD &&
        absWheelDeltaY < ABSTHRESHOLD &&
        absWheelDeltaX > absWheelDeltaY
    ) {
        direction = 'left'
    }

    if (
        wheelDeltaX < THRESHOLD &&
        absWheelDeltaY < ABSTHRESHOLD &&
        absWheelDeltaX > absWheelDeltaY
    ) {
        direction = 'right'
    }

    if (
        wheelDeltaY > THRESHOLD &&
        absWheelDeltaX < ABSTHRESHOLD &&
        absWheelDeltaY > absWheelDeltaX
    ) {
        direction = 'up'
    }

    if (
        wheelDeltaY < THRESHOLD &&
        absWheelDeltaX < ABSTHRESHOLD &&
        absWheelDeltaY > absWheelDeltaX
    ) {
        direction = 'down'
    }

    return direction
}
