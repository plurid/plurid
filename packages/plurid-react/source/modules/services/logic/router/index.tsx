import React from 'react';

import {
    /** interfaces */
    PluridPlane,
    IndexedPluridPlane,
} from '@plurid/plurid-data';

import {
    router,
    utilities,
} from '@plurid/plurid-engine';

import PluridApplication from '../../../../Application';



export const getComponentFromRoute = (
    matchedRoute: router.MatcherResponse,
    protocol: string,
    host: string,
    indexedPlanes: Map<string, IndexedPluridPlane> | undefined,
) => {
    const {
        path,
    } = matchedRoute;

    const {
        exterior,
        spaces,
        slotted,
    } = path;

    let Exterior: React.FC<any> = () => (<></>);
    if (exterior) {
        switch (exterior.kind) {
            case 'elementql':
                break;
            case 'react':
                Exterior = exterior.element
        }
    }

    let Spaces: React.FC<any> = () => (<></>);
    const spacesArray: any[] = [];
    if (spaces) {
        for (const space of spaces) {
            const planes: PluridPlane[] = [];
            const view = [];

            for (const universe of space.universes) {
                for (const cluster of universe.clusters) {
                    for (const plane of cluster.planes) {
                        const {
                            component,
                            value,
                        } = plane;

                        const pathDivisions = [
                            protocol,
                            host,
                            path.value === '/' ? 'p' : utilities.cleanPathElement(path.value),
                            space.value === 'default' ? 's' : utilities.cleanPathElement(space.value),
                            universe.value === 'default' ? 'u' : utilities.cleanPathElement(universe.value),
                            cluster.value === 'default' ? 'c' : utilities.cleanPathElement(cluster.value),
                            utilities.cleanPathElement(value),
                        ];
                        const fullPath = pathDivisions.join('://');

                        if (component.kind === 'react') {
                            const pluridPlane: PluridPlane = {
                                component: {
                                    element: component.element,
                                },
                                path: fullPath,
                            };

                            planes.push(pluridPlane);
                            view.push(fullPath);
                        }
                    }
                }

                const App = (
                    <PluridApplication
                        key={Math.random() + ''}
                        planes={planes}
                        indexedPlanes={indexedPlanes}
                        view={view}
                    />
                );
                spacesArray.push(App);
            }
        }

        Spaces = () => (
            <>
                {spacesArray}
            </>
        );
    }

    const Component = (
        <>
            {exterior && (
                <Exterior
                    spaces={slotted ? spacesArray : undefined}
                />
            )}

            {spaces && !slotted && (
                <Spaces />
            )}
        </>
    );
    return Component;
}

