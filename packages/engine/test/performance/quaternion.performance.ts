import { performance } from 'perf_hooks';
import { computeQuaternionFromEulers } from '../../src';



/**
 * Results
 * 1      computeQuaternionFromEulers()      0.66 ms
 * 10     computeQuaternionFromEulers()      0.71 ms
 * 100    computeQuaternionFromEulers()      0.85 ms
 * 1000   computeQuaternionFromEulers()      2.99 ms
 */

const t0 = performance.now();

for (let i = 0; i < 1000; i++) {
    const quaternionFromEuler = computeQuaternionFromEulers(120, 130, 140);
}

const t1 = performance.now();

console.log('Call to computeQuaternionFromEulers() took ' + (t1 - t0) + ' milliseconds.');
