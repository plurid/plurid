// #region imports
    // #region libraries
    import {
        CameraState,
        ViewSize,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region internal
    import {
        encodeCameraViewpoint,
        decodeCameraViewpoint,
        decodeViewpoint,
        isViewpointV2,
        isViewpointV3,
    } from '../index';
    // #endregion internal
// #endregion imports



// #region module
/**
 * THE VIEWPOINT CODEC. Three encodings, all accepted on decode; what is WRITTEN is the version the
 * host asked for — except that a tilted horizon forces `v3`, because no earlier encoding can hold
 * it and a shared link must show the picture the reader is looking at.
 */
const view: ViewSize = { width: 1000, height: 600 };

const camera = (
    partial: Partial<CameraState> = {},
): CameraState => ({
    yaw: 24,
    pitch: -12,
    roll: 0,
    scale: 1.25,
    pivot: { x: 500, y: 300, z: 0 },
    offset: { x: 40, y: -20, z: 60 },
    perspective: 2000,
    ...partial,
});


describe('the viewpoint codec', () => {
    it('v2 is written for a level horizon and round-trips exactly', () => {
        const encoded = encodeCameraViewpoint(camera(), view, 2);
        expect(encoded.startsWith('v2|')).toBe(true);
        expect(isViewpointV2(encoded)).toBe(true);
        expect(isViewpointV3(encoded)).toBe(false);

        const decoded = decodeCameraViewpoint(encoded, view)!;
        expect(decoded.yaw).toBeCloseTo(24, 6);
        expect(decoded.pitch).toBeCloseTo(-12, 6);
        expect(decoded.roll).toBe(0);
        expect(decoded.pivot.x).toBeCloseTo(500, 6);
        expect(decoded.offset.z).toBeCloseTo(60, 6);
    });

    it('a TILTED horizon is written as v3 whatever version was asked for', () => {
        const rolled = camera({ roll: 35 });
        for (const version of [1, 2, 3] as const) {
            const encoded = encodeCameraViewpoint(rolled, view, version);
            expect(isViewpointV3(encoded)).toBe(true);
            expect(decodeCameraViewpoint(encoded, view)!.roll).toBeCloseTo(35, 6);
        }
        // and v3 is a camera encoding, so everything that reads v2 reads it
        expect(isViewpointV2(encodeCameraViewpoint(rolled, view, 2))).toBe(true);
    });

    it('version 3 writes v3 even when the horizon is level; v2 still parses as level', () => {
        const encoded = encodeCameraViewpoint(camera(), view, 3);
        expect(encoded.split('|')).toHaveLength(12);
        expect(decodeCameraViewpoint(encoded, view)!.roll).toBe(0);

        // the angles are together, in the camera's own order
        const [, yaw, pitch, roll] = encoded.split('|');
        expect(Number(yaw)).toBeCloseTo(24, 6);
        expect(Number(pitch)).toBeCloseTo(-12, 6);
        expect(Number(roll)).toBe(0);
    });

    it('every link that exists today keeps its shape and its meaning', () => {
        // v1: the six scalars, unchanged
        const legacy = encodeCameraViewpoint(camera(), view, 1);
        expect(legacy.includes('|')).toBe(false);
        expect(decodeViewpoint(legacy)).not.toBeNull();
        // a v2 string written before the horizon could tilt decodes level
        const v2 = 'v2|24|-12|1.25|500|300|0|40|-20|60|2000';
        const decoded = decodeCameraViewpoint(v2, view)!;
        expect(decoded.roll).toBe(0);
        expect(decoded.yaw).toBeCloseTo(24, 6);
    });

    it('a malformed viewpoint is ignored rather than half-read', () => {
        expect(decodeCameraViewpoint('v3|24|-12|1.25|500|300|0|40|-20|60|2000', view)).toBeNull();
        expect(decodeCameraViewpoint('v3|a|b|c|d|e|f|g|h|i|j|k', view)).toBeNull();
        expect(decodeCameraViewpoint('v2|24|-12|0|500|300|0|40|-20|60|2000', view)).toBeNull();
        expect(decodeCameraViewpoint('', view)).toBeNull();
        expect(decodeCameraViewpoint(null, view)).toBeNull();
    });

    it('reduced to the legacy scalars, a v3 viewpoint keeps its angles and drops the tilt', () => {
        const encoded = encodeCameraViewpoint(camera({ roll: 30 }), view, 3);
        const legacy = decodeViewpoint(encoded, view)!;
        expect(legacy.rotationX).toBeCloseTo(-12, 6);
        expect(legacy.rotationY).toBeCloseTo(24, 6);
    });
});
// #endregion module
