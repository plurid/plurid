import {
    rotateMatrix,
} from '../../src';

describe('matrix computation', () => {
    it('rotates matrix', () => {
        const rotationMatrix = rotateMatrix(10, 20, 30);
        const result = [
            0.8434932686563161,
            -0.4184120444167325,
            0.33682408883346504,
            0,
            0.49240387650610395,
            0.8528685319524433,
            -0.1736481776669303,
            0,
            -0.21461017714275632,
            0.3123245560187263,
            0.9254165783983234,
            0,
            0,
            0,
            0,
            1,
        ];
        expect(rotationMatrix).toEqual(result);
    });
});
