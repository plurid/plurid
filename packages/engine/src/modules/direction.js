"use strict";
exports.__esModule = true;
exports.getWheelDirection = function (deltas, ABSTHRESHOLD, THRESHOLD) {
    if (ABSTHRESHOLD === void 0) { ABSTHRESHOLD = 10; }
    if (THRESHOLD === void 0) { THRESHOLD = 0; }
    var direction = 'left';
    var wheelDeltaX = deltas.deltaX;
    var wheelDeltaY = deltas.deltaY;
    var absWheelDeltaX = Math.abs(wheelDeltaX);
    var absWheelDeltaY = Math.abs(wheelDeltaY);
    if (wheelDeltaX > THRESHOLD &&
        absWheelDeltaY < ABSTHRESHOLD &&
        absWheelDeltaX > absWheelDeltaY) {
        direction = 'left';
    }
    if (wheelDeltaX < THRESHOLD &&
        absWheelDeltaY < ABSTHRESHOLD &&
        absWheelDeltaX > absWheelDeltaY) {
        direction = 'right';
    }
    if (wheelDeltaY > THRESHOLD &&
        absWheelDeltaX < ABSTHRESHOLD &&
        absWheelDeltaY > absWheelDeltaX) {
        direction = 'up';
    }
    if (wheelDeltaY < THRESHOLD &&
        absWheelDeltaX < ABSTHRESHOLD &&
        absWheelDeltaY > absWheelDeltaX) {
        direction = 'down';
    }
    return direction;
};
//# sourceMappingURL=direction.js.map