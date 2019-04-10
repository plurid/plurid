import { performance } from 'perf_hooks';
import { multiplyMatrices } from '../../src/';



/**
 * Results
 * 1      multiplyMatrices()      0.65 ms
 * 10     multiplyMatrices()      0.73 ms
 * 100    multiplyMatrices()      1.95 ms
 * 1000   multiplyMatrices()      9.45 ms
 */

const t0 = performance.now();

for (let i = 0; i < 1000; i++) {
    const matrix1 = [
        0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7,
    ];
    const matrix2 = [
        0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7,
    ];
    const matrixMultiplication = multiplyMatrices(matrix1, matrix2);
}

const t1 = performance.now();

console.log('Call to multiplyMatrices() took ' + (t1 - t0) + ' milliseconds.');
