import {
    general,
    interaction,
    space,
} from '@plurid/plurid-engine';

import {
    unmeasuredPage,
    viewLength,
} from '../unmeasured';



/**
 * THE UNMEASURED PAGE, placed in the view's own terms, lands where the camera docked on the page in
 * the MEASURED view puts it: the server states the pose once, for a view it never sees, and every
 * window size the browser then opens it at must read the same page as the measured render.
 */
const cameraEngine = interaction.camera;

type Vec3 = { x: number; y: number; z: number };
type View = { width: number; height: number };

const FALLBACK: View = { width: 771, height: 764 };
const WINDOWS: View[] = [
    { width: 1280, height: 800 },
    { width: 390, height: 844 },
    { width: 1920, height: 1080 },
];

const configurationOf = (partial: Record<string, any> = {}) => general.configuration.merge({
    ...partial,
    space: { presentation: 'page', ...(partial.space || {}) },
} as any);

const pageAt = (
    location: Partial<Record<'translateX' | 'translateY' | 'translateZ' | 'rotateX' | 'rotateY', number>> = {},
    size: Partial<{ width: number; height: number; sizeMode: 'measured' | 'declared' }> = {},
) => ({
    planeID: 'page',
    sourceID: 'page',
    route: '/page',
    routeDivisions: {},
    width: 0,
    height: 0,
    show: true,
    ...size,
    location: {
        translateX: 0,
        translateY: 0,
        translateZ: 0,
        rotateX: 0,
        rotateY: 0,
        ...location,
    },
}) as any;

/** The camera docked on `page` for `view` (the page at the size the configuration gives it there). */
const dockedFor = (
    configuration: any,
    page: any,
    view: View,
) => cameraEngine.dockPose(
    cameraEngine.identityCamera(view, 2000),
    cameraEngine.dockGeometry(page, space.layout.configuredPlaneSize(configuration, view)),
    view,
    cameraEngine.resolveCameraLimits(configuration.space.navigation),
    configuration.space.docking?.scale,
);

/** Apply a CSS transform list to a point, right to left; `%` of the roots' box, which is the view's. */
const applyCSS = (
    transform: string,
    view: View,
    point: Vec3,
): Vec3 => {
    const length = (value: string, extent: number) => (value.endsWith('%')
        ? parseFloat(value) / 100 * extent
        : parseFloat(value));
    const functions = [...transform.matchAll(/(\w+)\(([^)]*)\)/g)]
        .map((match) => ({ name: match[1], args: match[2].split(',').map((argument) => argument.trim()) }));
    let p = point;
    for (const { name, args } of functions.reverse()) {
        switch (name) {
            case 'translate':
                p = { x: p.x + length(args[0], view.width), y: p.y + length(args[1] ?? '0', view.height), z: p.z };
                break;
            case 'translate3d':
                p = { x: p.x + length(args[0], view.width), y: p.y + length(args[1], view.height), z: p.z + parseFloat(args[2]) };
                break;
            case 'scale3d':
                p = { x: p.x * Number(args[0]), y: p.y * Number(args[1]), z: p.z * Number(args[2]) };
                break;
            case 'rotateX':
                p = cameraEngine.transformPoint(cameraEngine.rotationXMatrix(parseFloat(args[0])), p);
                break;
            case 'rotateY':
                p = cameraEngine.transformPoint(cameraEngine.rotationYMatrix(parseFloat(args[0])), p);
                break;
            case 'rotateZ':
                p = cameraEngine.transformPoint(cameraEngine.rotationZMatrix(parseFloat(args[0])), p);
                break;
            default:
                throw new Error('a transform function the pose never writes: ' + name);
        }
    }
    return p;
};

/** The page's own transform (`Plane`: translate, then rotateX, then rotateY) on a point of its sheet. */
const worldOf = (
    page: any,
    local: Vec3,
): Vec3 => applyCSS(
    `translate3d(${page.location.translateX}px, ${page.location.translateY}px, ${page.location.translateZ}px) rotateX(${page.location.rotateX}deg) rotateY(${page.location.rotateY}deg)`,
    { width: 0, height: 0 },
    local,
);

const cornersOf = (
    width: number,
    height: number,
): Vec3[] => [
    { x: 0, y: 0, z: 0 },
    { x: width, y: 0, z: 0 },
    { x: width, y: height, z: 0 },
    { x: 0, y: height, z: 0 },
];

/**
 * The server's pose (docked for the fallback view), opened at `view`: the page's corners through the
 * pose, the page sized as its CSS lengths resolve there — against the corners the measured render
 * draws, the camera docked for `view`, the page at its configured size for `view`.
 */
const expectSamePicture = (
    configuration: any,
    page: any,
    view: View,
) => {
    const serverPage = { ...page };
    const pose = unmeasuredPage(false, configuration, [serverPage], dockedFor(configuration, serverPage, FALLBACK), 'page');
    expect(pose).toBeDefined();

    const measured = space.layout.configuredPlaneSize(configuration, view);
    const own = page.sizeMode === 'declared';
    const width = own ? page.width : measured.width;
    const height = own ? page.height : measured.height;
    const measuredPage = { ...page, width, height };
    const camera = dockedFor(configuration, measuredPage, view);
    const matrix = cameraEngine.cameraMatrix(camera, view);

    for (const corner of cornersOf(width, height)) {
        const world = worldOf(page, corner);
        const expected = cameraEngine.transformPoint(matrix, world);
        const actual = applyCSS(pose!.transform, view, world);
        expect(actual.x).toBeCloseTo(expected.x, 6);
        expect(actual.y).toBeCloseTo(expected.y, 6);
        expect(actual.z).toBeCloseTo(expected.z, 6);
    }
};


describe('the unmeasured page', () => {
    it('reads a view-sized page (the page presentation\'s default) as the measured render, at any window', () => {
        const configuration = configurationOf();
        for (const view of WINDOWS) {
            expectSamePicture(configuration, pageAt(), view);
        }
    });

    it('reads a page that is a fraction of the view, docked anywhere in the space, as the measured render', () => {
        const configuration = configurationOf({ elements: { plane: { width: 0.6 } } });
        for (const view of WINDOWS) {
            expectSamePicture(configuration, pageAt({ translateX: 821, translateY: -340 }), view);
        }
    });

    it('reads a turned page, magnified to fill, as the measured render', () => {
        const configuration = configurationOf({ elements: { plane: { width: 0.5, height: 0.5 } } });
        for (const view of WINDOWS) {
            expectSamePicture(configuration, pageAt({ translateX: 400, translateZ: -250, rotateY: 90, rotateX: 12 }), view);
        }
    });

    it('reads a page declared in px as the measured render wherever its dock scale does not depend on the view', () => {
        const configuration = configurationOf();
        expectSamePicture(configuration, pageAt({}, { width: 460, height: 0, sizeMode: 'declared' }), { width: 1280, height: 800 });
    });

    it('is only the unmeasured, docked page presentation', () => {
        const page = pageAt();
        const configuration = configurationOf();
        const camera = dockedFor(configuration, page, FALLBACK);
        expect(unmeasuredPage(true, configuration, [page], camera, 'page')).toBeUndefined();
        expect(unmeasuredPage(false, configuration, [page], camera, '')).toBeUndefined();
        expect(unmeasuredPage(false, configuration, [page], camera, 'elsewhere')).toBeUndefined();
        expect(unmeasuredPage(false, general.configuration.merge({}), [page], camera, 'page')).toBeUndefined();
        expect(unmeasuredPage(false, configuration, [page], camera, 'page')?.planeID).toBe('page');
    });

    it('states a configured dimension over the view only when it is a fraction of the view', () => {
        expect(viewLength(1)).toBe('100%');
        expect(viewLength(0.6)).toBe('60%');
        expect(viewLength(460)).toBeUndefined();
        expect(viewLength(0)).toBeUndefined();
        expect(viewLength(undefined)).toBeUndefined();
    });
});
