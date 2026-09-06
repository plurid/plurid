// #region imports
    // #region libraries
    import {
        /** constants */
        defaultTreePlane,
        defaultConfiguration,

        /** interfaces */
        TreePlane,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import computeColumnLayout from '../column';
    // #endregion external
// #endregion imports



// #region module
describe('computeColumnLayout', () => {
    /** handle crypto for jest - https://stackoverflow.com/a/52612372 */
    const crypto = require('crypto');
    Object.defineProperty(global, 'crypto', {
        value: {
            getRandomValues: (arr: any) => crypto.randomBytes(arr.length),
        },
    });

    Object.defineProperty(window, 'innerWidth', {
        value: 1200,
    });
    Object.defineProperty(window, 'innerHeight', {
        value: 800,
    });


    it('computes the default column layout', () => {
        const treePages: TreePlane[] = [
            {
                ...defaultTreePlane,
                sourceID: '1',
                route: '/page-1',
                planeID: '',
                show: true,
            },
            {
                ...defaultTreePlane,
                sourceID: '2',
                route: '/page-2',
                planeID: '',
                show: true,
            },
            {
                ...defaultTreePlane,
                sourceID: '3',
                route: '/page-3',
                planeID: '',
                show: true,
            },
        ]

        const locatedTree: TreePlane[] = [
            {
                ...defaultTreePlane,
                sourceID: '1',
                location: {
                    rotateX: 0,
                    rotateY: 0,
                    translateX: 0,
                    translateY: 0,
                    translateZ: 0,
                },
                route: '/page-1',
                planeID: '',
                show: true,
            },
            {
                ...defaultTreePlane,
                sourceID: '2',
                location: {
                    rotateX: 0,
                    rotateY: 0,
                    translateX: 0,
                    translateY: 850,
                    translateZ: 0,
                },
                route: '/page-2',
                planeID: '',
                show: true,
            },
            {
                ...defaultTreePlane,
                sourceID: '3',
                location: {
                    rotateX: 0,
                    rotateY: 0,
                    translateX: 0,
                    translateY: 1700,
                    translateZ: 0,
                },
                route: '/page-3',
                planeID: '',
                show: true,
                children: [],
            },
        ];

        const result = computeColumnLayout(treePages);
        const resultWithEmptyIDs = result.map(page => {
            return { ...page, planeID: ''};
        });

        expect(resultWithEmptyIDs).toStrictEqual(locatedTree);
    });

    it('computes the column layout with 3 columns and 5 pages', () => {
        const treePages: TreePlane[] = [
            {
                ...defaultTreePlane,
                sourceID: '1',
                route: '/page-1',
                planeID: '',
                show: true,
            },
            {
                ...defaultTreePlane,
                sourceID: '2',
                route: '/page-2',
                planeID: '',
                show: true,
            },
            {
                ...defaultTreePlane,
                sourceID: '3',
                route: '/page-3',
                planeID: '',
                show: true,
            },
            {
                ...defaultTreePlane,
                sourceID: '4',
                route: '/page-4',
                planeID: '',
                show: true,
            },
            {
                ...defaultTreePlane,
                sourceID: '5',
                route: '/page-5',
                planeID: '',
                show: true,
            },
        ];

        const locatedTree: TreePlane[] = [
            {
                ...defaultTreePlane,
                sourceID: '1',
                location: {
                    rotateX: 0,
                    rotateY: 0,
                    translateX: 0,
                    translateY: 0,
                    translateZ: 0,
                },
                route: '/page-1',
                planeID: '',
                show: true,
            },
            {
                ...defaultTreePlane,
                sourceID: '2',
                location: {
                    rotateX: 0,
                    rotateY: 0,
                    translateX: 0,
                    translateY: 850,
                    translateZ: 0,
                },
                route: '/page-2',
                planeID: '',
                show: true,
            },
            {
                ...defaultTreePlane,
                sourceID: '3',
                location: {
                    rotateX: 0,
                    rotateY: 0,
                    translateX: 1250,
                    translateY: 0,
                    translateZ: 0,
                },
                route: '/page-3',
                planeID: '',
                show: true,
            },
            {
                ...defaultTreePlane,
                sourceID: '4',
                location: {
                    rotateX: 0,
                    rotateY: 0,
                    translateX: 1250,
                    translateY: 850,
                    translateZ: 0,
                },
                route: '/page-4',
                planeID: '',
                show: true,
            },
            {
                ...defaultTreePlane,
                sourceID: '5',
                location: {
                    rotateX: 0,
                    rotateY: 0,
                    translateX: 2500,
                    translateY: 0,
                    translateZ: 0,
                },
                route: '/page-5',
                planeID: '',
                show: true,
            },
        ];

        const columns = 3;
        const result = computeColumnLayout(treePages, columns);
        const resultWithEmptyIDs = result.map(page => {
            return { ...page, planeID: ''};
        });

        expect(resultWithEmptyIDs).toStrictEqual(locatedTree);
    });

    it('packs mixed declared sizes per column and per row (each column as wide as its widest plane, each row as tall as its tallest)', () => {
        const sized = (id: string, width: number, height: number): TreePlane => ({
            ...defaultTreePlane,
            sourceID: id,
            route: '/' + id,
            planeID: id,
            show: true,
            width,
            height,
            sizeMode: 'declared',
        });
        // 2 columns of 2: column 0 = [a, b], column 1 = [c, d]; row 0 = [a, c], row 1 = [b, d]
        const tree = computeColumnLayout(
            [sized('a', 300, 200), sized('b', 500, 400), sized('c', 300, 300), sized('d', 300, 300)],
            2,
            undefined,
            50,
            defaultConfiguration,
            { width: 1200, height: 800 },
        );
        const at = (id: string) => tree.find((plane) => plane.planeID === id)!.location;
        expect([at('a').translateX, at('a').translateY]).toEqual([0, 0]);
        expect([at('b').translateX, at('b').translateY]).toEqual([0, 350]);   // row 0 is 300 tall (c) + gap
        expect([at('c').translateX, at('c').translateY]).toEqual([550, 0]);   // column 0 is 500 wide (b) + gap
        expect([at('d').translateX, at('d').translateY]).toEqual([550, 350]);
        expect(tree.map((plane) => plane.sizeMode)).toEqual(['declared', 'declared', 'declared', 'declared']);
    });


    it('a configured plane height pitches the rows of unmeasured planes (the page presentation)', () => {
        const configuration = {
            ...defaultConfiguration,
            elements: { ...defaultConfiguration.elements, plane: { ...defaultConfiguration.elements.plane, height: 1 } },
        };
        const tree = computeColumnLayout(
            ['a', 'b', 'c'].map((id) => ({ ...defaultTreePlane, sourceID: id, route: '/' + id, planeID: id, show: true })),
            1,
            undefined,
            50,
            configuration,
            { width: 1200, height: 800 },
        );
        expect(tree.map((plane) => plane.location.translateY)).toEqual([0, 850, 1700]);
        const half = computeColumnLayout(
            ['a', 'b'].map((id) => ({ ...defaultTreePlane, sourceID: id, route: '/' + id, planeID: id, show: true })),
            1,
            undefined,
            50,
            { ...configuration, elements: { ...configuration.elements, plane: { ...configuration.elements.plane, height: 0.5 } } },
            { width: 1200, height: 800 },
        );
        expect(half.map((plane) => plane.location.translateY)).toEqual([0, 450]);
    });

});
// #endregion module
