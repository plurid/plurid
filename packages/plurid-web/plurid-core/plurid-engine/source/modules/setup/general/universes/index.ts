// #region imports
    // #region libraries
    import {
        uuid,
    } from '@plurid/plurid-functions';

    import {
        PluridUniverse,

        PluridInternalStateUniverse,
        PluridInternalContextUniverse,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        createInternalStatePlane,
        createInternalContextPlane,
    } from '../planes';

    import * as helpers from '../helpers';

    import {
        registerPaths,
    } from '../paths';
    // #endregion external
// #endregion imports



// #region module
/**
 * From `PluridUniverse` create `PluridInternalStateUniverse`.
 *
 * @param universe
 */
export const createInternalStateUniverse = (
    universe: PluridUniverse,
): PluridInternalStateUniverse => {
    const statePlanes = universe.planes.map(plane => {
        const internalStatePlane = createInternalStatePlane(plane);
        return internalStatePlane;
    });
    const indexedStatePlanes = helpers.createIndexed(statePlanes);

    const paths = registerPaths(statePlanes);
    const indexedPaths = helpers.createIndexed(paths);

    const stateUniverse: PluridInternalStateUniverse = {
        name: universe.name,
        planes: indexedStatePlanes,
        paths: indexedPaths,
        id: universe.id || uuid.generate(),
        ordinal: universe.ordinal || 0,
        active: universe.active || false,
    }

    return stateUniverse;
}


/**
 * From PluridUniverse create PluridInternalContextUniverse.
 *
 * @param universe
 */
export const createInternalContextUniverse = (
    universe: PluridUniverse,
): PluridInternalContextUniverse => {
    const contextPlanes = universe.planes.map(plane => {
        const internalContextPlane = createInternalContextPlane(plane);
        return internalContextPlane;
    });
    const indexedContextPlanes = helpers.createIndexed(contextPlanes);

    const contextUniverse: PluridInternalContextUniverse = {
        name: universe.name,
        planes: indexedContextPlanes,
        id: universe.id || uuid.generate(),
    }

    return contextUniverse;
}


/**
 * Get the universeID if any of the `universes` is active.
 *
 * If no universe is active, returns the id of the first universe.
 *
 * @param universes
 */
export const findActiveUniverse = (
    universes: PluridInternalStateUniverse[]
): string => {
    if (universes.length === 0) {
        return '';
    }

    let activeUniverseID = universes[0].id;

    for (const universe of universes) {
        if (universe.active) {
            activeUniverseID = universe.id;
            break;
        }
    }

    return activeUniverseID;
}
// #endregion module
