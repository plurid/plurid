"use strict";
exports.__esModule = true;
var perf_hooks_1 = require("perf_hooks");
var src_1 = require("../../src");
var t0 = perf_hooks_1.performance.now();
for (var i = 0; i < 1000; i++) {
    var quaternionFromEuler = src_1.computeQuaternionFromEulers(120, 130, 140);
}
var t1 = perf_hooks_1.performance.now();
console.log('Call to computeQuaternionFromEulers() took ' + (t1 - t0) + ' milliseconds.');
//# sourceMappingURL=quaternion.performance.js.map