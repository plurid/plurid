"use strict";
exports.__esModule = true;
var perf_hooks_1 = require("perf_hooks");
var src_1 = require("../../src/");
var t0 = perf_hooks_1.performance.now();
for (var i = 0; i < 1000; i++) {
    var matrix1 = [
        0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7,
    ];
    var matrix2 = [
        0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7,
    ];
    var matrixMultiplication = src_1.multiplyMatrices(matrix1, matrix2);
}
var t1 = perf_hooks_1.performance.now();
console.log('Call to multiplyMatrices() took ' + (t1 - t0) + ' milliseconds.');
//# sourceMappingURL=matrix.performance.js.map