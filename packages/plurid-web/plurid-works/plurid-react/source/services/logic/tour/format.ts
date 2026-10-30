// #region imports
    // #region libraries
    import type {
        PluridTour,
        PluridTourStep,
        PluridPlaneAnchor,
        PluridAnchorPose,
        PluridMotionEasing,
        Vec3,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
/** The format marker every tour document carries. */
export const PLURID_TOUR_FORMAT = 'plurid/tour';
/** The one version this build reads and writes. */
export const PLURID_TOUR_VERSION = 1;
/**
 * The most steps a tour holds (2026-10-30). A tour is something a reader sits through; a document
 * of more steps is a mistake or an attack, and is refused before the player walks it.
 */
export const PLURID_TOUR_MAX_STEPS = 1000;
/**
 * The longest dwell, ms: the longest delay a timer keeps (2^31 − 1, about 24.8 days). A longer one
 * fired at once in every browser and in Node; `null` is the dwell that waits for `next()`.
 */
export const PLURID_TOUR_MAX_DWELL = 2147483647;

/** A tour read from text or from an untyped value: the tour, or what is wrong with it. */
export type PluridTourParse<P = unknown> =
    | { ok: true; tour: PluridTour<P> }
    | { ok: false; error: string };

const EASINGS: readonly PluridMotionEasing[] = ['linear', 'out-cubic', 'out-quint', 'in-out-cubic', 'spring'];

const finite = (
    value: unknown,
): value is number => typeof value === 'number' && Number.isFinite(value);

/** A failure carrying the place it was found, so the message names the field. */
class TourFormatError extends Error {}

const fail = (
    where: string,
    what: string,
): never => {
    throw new TourFormatError(`${where}: ${what}`);
};

const readVector = (
    value: unknown,
    where: string,
    zDefault?: number,
): Vec3 => {
    const vector = value as Partial<Vec3> | undefined;
    if (!vector || typeof vector !== 'object') {
        return fail(where, 'must be { x, y, z }');
    }
    const z = vector.z === undefined && zDefault !== undefined ? zDefault : vector.z;
    if (!finite(vector.x) || !finite(vector.y) || !finite(z)) {
        return fail(where, 'must hold finite numbers x, y and z');
    }
    return { x: vector.x, y: vector.y, z };
};

const readPose = (
    value: unknown,
    where: string,
): PluridAnchorPose | 'dock' | 'frame' => {
    if (value === 'dock' || value === 'frame') {
        return value;
    }
    const pose = value as Partial<PluridAnchorPose> | undefined;
    if (!pose || typeof pose !== 'object') {
        return fail(where, 'must be \'dock\', \'frame\' or { yaw, pitch, scale, pivot }');
    }
    if (!finite(pose.yaw) || !finite(pose.pitch)) {
        return fail(where, 'yaw and pitch must be finite numbers of degrees');
    }
    if (pose.roll !== undefined && !finite(pose.roll)) {
        return fail(where, 'roll must be a finite number of degrees');
    }
    if (!finite(pose.scale) || pose.scale <= 0) {
        return fail(where, 'scale must be a number above 0');
    }
    return {
        yaw: pose.yaw,
        pitch: pose.pitch,
        ...(pose.roll !== undefined ? { roll: pose.roll } : {}),
        scale: pose.scale,
        // a hand-written pose may leave the plane's surface implicit
        pivot: readVector(pose.pivot, where + '.pivot', 0),
        ...(pose.offset !== undefined ? { offset: readVector(pose.offset, where + '.offset') } : {}),
    };
};

const readAnchor = (
    value: unknown,
    where: string,
): PluridPlaneAnchor => {
    const anchor = value as Partial<PluridPlaneAnchor> | undefined;
    if (!anchor || typeof anchor !== 'object') {
        return fail(where, 'must be { path, occurrence?, pose? }');
    }
    if (typeof anchor.path !== 'string' || !anchor.path.trim()) {
        return fail(where + '.path', 'must be the plane\'s path, a non-empty string');
    }
    if (anchor.occurrence !== undefined && (!Number.isInteger(anchor.occurrence) || anchor.occurrence < 0)) {
        return fail(where + '.occurrence', 'must be a whole number from 0');
    }
    return {
        path: anchor.path,
        ...(anchor.occurrence !== undefined ? { occurrence: anchor.occurrence } : {}),
        ...(anchor.pose !== undefined ? { pose: readPose(anchor.pose, where + '.pose') } : {}),
    };
};

const readDwell = (
    value: unknown,
    where: string,
): number | null => {
    if (value !== null && (!finite(value) || value < 0)) {
        return fail(where, 'must be a number of ms from 0, or null to wait for next()');
    }
    if (value !== null && value > PLURID_TOUR_MAX_DWELL) {
        return fail(where, `must be at most ${PLURID_TOUR_MAX_DWELL} ms (a timer's longest delay); null waits for next()`);
    }
    return value as number | null;
};

const readStep = (
    value: unknown,
    index: number,
    ids: Set<string>,
): PluridTourStep => {
    const step = value as Partial<PluridTourStep> | undefined;
    let where = `step ${index + 1}`;
    if (!step || typeof step !== 'object') {
        return fail(where, 'must be { id, anchor, … }');
    }
    if (typeof step.id !== 'string' || !step.id) {
        return fail(where + '.id', 'must be a non-empty string');
    }
    where += ` ('${step.id}')`;
    if (ids.has(step.id)) {
        return fail(where + '.id', 'is the id of an earlier step; a step\'s id is unique in its tour');
    }
    ids.add(step.id);
    if (step.duration !== undefined && (!finite(step.duration) || step.duration < 0)) {
        return fail(where + '.duration', 'must be a number of ms from 0');
    }
    if (step.easing !== undefined && !EASINGS.includes(step.easing)) {
        return fail(where + '.easing', 'must be one of ' + EASINGS.join(', '));
    }
    return {
        id: step.id,
        anchor: readAnchor(step.anchor, where + '.anchor'),
        ...(step.duration !== undefined ? { duration: step.duration } : {}),
        ...(step.easing !== undefined ? { easing: step.easing } : {}),
        ...(step.dwell !== undefined ? { dwell: readDwell(step.dwell, where + '.dwell') } : {}),
        // the host's own, carried as given
        ...('payload' in step ? { payload: step.payload } : {}),
    };
};


/**
 * READ A TOUR (2026-10-30): JSON text or a value (a file a host saved, a tour a model wrote, a bus
 * payload). Every field is checked the way the player reads it, and what is wrong comes back named
 * (`step 3 ('drawing').anchor.path: …`), never thrown. The tour comes back with only the fields the
 * format holds; a step's `payload` is carried as it was given.
 */
export const parseTour = <P = unknown>(
    input: unknown,
): PluridTourParse<P> => {
    let value = input;
    if (typeof input === 'string') {
        try {
            value = JSON.parse(input);
        } catch (error) {
            return { ok: false, error: 'not JSON: ' + (error instanceof Error ? error.message : String(error)) };
        }
    }

    try {
        const tour = value as Partial<PluridTour> | undefined;
        if (!tour || typeof tour !== 'object' || Array.isArray(tour)) {
            return fail('the tour', 'must be an object { plurid: \'plurid/tour\', version: 1, steps }');
        }
        if (tour.plurid !== PLURID_TOUR_FORMAT) {
            return fail('the tour', `is not one (its \`plurid\` must be '${PLURID_TOUR_FORMAT}')`);
        }
        if (tour.version !== PLURID_TOUR_VERSION) {
            return fail('the tour', `is version ${JSON.stringify(tour.version)}; this build reads version ${PLURID_TOUR_VERSION}`);
        }
        if (!Array.isArray(tour.steps)) {
            return fail('the tour', '`steps` must be an array');
        }
        if (tour.steps.length > PLURID_TOUR_MAX_STEPS) {
            return fail('the tour', `has ${tour.steps.length} steps; a tour holds at most ${PLURID_TOUR_MAX_STEPS}`);
        }
        if (tour.id !== undefined && typeof tour.id !== 'string') {
            return fail('the tour.id', 'must be a string');
        }
        if (tour.title !== undefined && typeof tour.title !== 'string') {
            return fail('the tour.title', 'must be a string');
        }
        const ids = new Set<string>();
        const steps = tour.steps.map((step, index) => readStep(step, index, ids));
        return {
            ok: true,
            tour: {
                plurid: PLURID_TOUR_FORMAT,
                version: PLURID_TOUR_VERSION,
                ...(tour.id !== undefined ? { id: tour.id } : {}),
                ...(tour.title !== undefined ? { title: tour.title } : {}),
                ...(tour.dwell !== undefined ? { dwell: readDwell(tour.dwell, 'the tour.dwell') } : {}),
                steps: steps as PluridTourStep<P>[],
            },
        };
    } catch (error) {
        if (error instanceof TourFormatError) {
            return { ok: false, error: error.message };
        }
        throw error;
    }
};


/** A tour as JSON text, four spaces deep: a document a person may read and edit. */
export const serializeTour = (
    tour: PluridTour<unknown>,
): string => JSON.stringify(tour, null, 4);
// #endregion module
