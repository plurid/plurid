// #region imports
    // #region libraries
    import {
        PluridRoute,
        PluridRoutePlane,
        PluridPlane,
    } from '@plurid/plurid-data';
    // #endregion libraries

    // #region external
    import IsoMatcher from '../';
    // #endregion external
// #endregion imports



// #region module
const routes: PluridRoute<string>[] = [
    {
        value: '/',
        planes: [
            [
                'pttp://foreign-origin.com/nested/parametric/:id',
                'parametric',
            ],
        ],
    },
];

const routePlanes: PluridRoutePlane<string>[] = [
    {
        value: 'pttp://foreign-origin.com',
        component: 'index',
    },
    {
        value: 'pttp://foreign-origin.com/parametric/:id',
        component: 'parametric',
    },
];

const planes: PluridPlane<string>[] = [
    {
        route: 'pttp://foreign-origin.com/p',
        component: 'index',
    },
    [
        'pttp://foreign-origin.com/p/parametric/:id',
        'parametric',
    ],
];



xdescribe('IsoMatcher foreign', () => {
    it('matches simple routes', () => {
        const isoMatcher = new IsoMatcher<string>({
            routes,
            routePlanes,
            planes,
        });

        {
            const planeResult = isoMatcher.match(
                'pttp://foreign-origin.com',
            );
            expect(planeResult).toBeTruthy();
            if (planeResult) {
                expect(planeResult.kind).toEqual('RoutePlane');

                if (planeResult.kind === 'RoutePlane') {
                    expect(planeResult.data.value).toEqual('pttp://foreign-origin.com');
                    expect(planeResult.match.value).toEqual('pttp://foreign-origin.com');
                }
            }
        }

        {
            const planeResult = isoMatcher.match(
                'pttp://foreign-origin.com/p',
            );
            expect(planeResult).toBeTruthy();
            if (planeResult) {
                expect(planeResult.kind).toEqual('Plane');

                if (planeResult.kind === 'Plane') {
                    expect(planeResult.data.route).toEqual('pttp://foreign-origin.com/p');
                    expect(planeResult.match.value).toEqual('pttp://foreign-origin.com/p');
                }
            }
        }
    });



    it('matches parametric routes', () => {
        const isoMatcher = new IsoMatcher<string>({
            routes,
            routePlanes,
            planes,
        });

        {
            const planeResult = isoMatcher.match(
                'pttp://foreign-origin.com/parametric/one',
            );
            expect(planeResult).toBeTruthy();
            if (planeResult) {
                expect(planeResult.kind).toEqual('RoutePlane');

                if (planeResult.kind === 'RoutePlane') {
                    expect(planeResult.data.value).toEqual('pttp://foreign-origin.com/parametric/:id');
                    expect(planeResult.match.value).toEqual('pttp://foreign-origin.com/parametric/one');
                    expect(planeResult.match.parameters.id).toEqual('one');
                }
            }
        }

        {
            const planeResult = isoMatcher.match(
                'pttp://foreign-origin.com/p/parametric/one',
            );
            expect(planeResult).toBeTruthy();
            if (planeResult) {
                expect(planeResult.kind).toEqual('Plane');

                if (planeResult.kind === 'Plane') {
                    expect(planeResult.data.route).toEqual('pttp://foreign-origin.com/p/parametric/:id');
                    expect(planeResult.match.value).toEqual('pttp://foreign-origin.com/p/parametric/one');
                    expect(planeResult.match.parameters.id).toEqual('one');
                }
            }
        }
    });



    it('matches queried routes', () => {
        const isoMatcher = new IsoMatcher<string>({
            routes,
            routePlanes,
            planes,
        });

        {
            const planeResult = isoMatcher.match(
                'pttp://foreign-origin.com?query1=data-value1&query2=data-value2',
            );
            expect(planeResult).toBeTruthy();
            if (planeResult) {
                expect(planeResult.kind).toEqual('RoutePlane');

                if (planeResult.kind === 'RoutePlane') {
                    expect(planeResult.data.value).toEqual('pttp://foreign-origin.com');
                    expect(planeResult.match.value).toEqual('pttp://foreign-origin.com');
                    expect(planeResult.match.query.query1).toEqual('data-value1');
                    expect(planeResult.match.query.query2).toEqual('data-value2');
                }
            }
        }

        {
            const planeResult = isoMatcher.match(
                'pttp://foreign-origin.com/p?query1=data-value1&query2=data-value2',
            );
            expect(planeResult).toBeTruthy();
            if (planeResult) {
                expect(planeResult.kind).toEqual('Plane');

                if (planeResult.kind === 'Plane') {
                    expect(planeResult.data.route).toEqual('pttp://foreign-origin.com/p');
                    expect(planeResult.match.value).toEqual('pttp://foreign-origin.com/p');
                    expect(planeResult.match.query.query1).toEqual('data-value1');
                    expect(planeResult.match.query.query2).toEqual('data-value2');
                }
            }
        }
    });
});
// #endregion module
