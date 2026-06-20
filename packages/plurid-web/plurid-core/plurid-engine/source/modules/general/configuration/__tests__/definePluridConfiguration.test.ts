// #region imports
    // #region libraries
    import {
        LAYOUT_TYPES,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        definePluridConfiguration,
    } from '../';
    // #endregion external
// #endregion imports



// #region module
describe('definePluridConfiguration', () => {
    it('returns the defaults for empty input', () => {
        const configuration = definePluridConfiguration();

        expect(configuration.space.center).toBe(false);
        expect(configuration.space.perspective).toBe(2000);
        expect(configuration.elements.plane.width).toBe(1);
        expect(configuration.global.theme).toEqual({
            general: 'plurid',
            interaction: 'plurid',
        });
    });

    it('expands flat shortcuts to their nested locations + resolves the theme', () => {
        const configuration = definePluridConfiguration({
            theme: 'plurid',
            center: true,
            firstPerson: true,
            planeWidth: 0.32,
            bridgeLength: 160,
            toolbar: false,
            layout: {
                type: LAYOUT_TYPES.ROWS,
                rows: 3,
            },
        });

        // flat → nested
        expect(configuration.space.center).toBe(true);
        expect(configuration.space.firstPerson).toBe(true);
        expect(configuration.elements.plane.width).toBe(0.32);
        expect(configuration.space.bridge?.length).toBe(160);
        expect(configuration.elements.toolbar.show).toBe(false);
        expect(configuration.space.layout.type).toBe(LAYOUT_TYPES.ROWS);

        // a string theme is resolved to the full { general, interaction } object
        expect(configuration.global.theme).toEqual({
            general: 'plurid',
            interaction: 'plurid',
        });

        // untouched fields keep their defaults
        expect(configuration.space.perspective).toBe(2000);
        expect(configuration.elements.plane.opacity).toBe(1);
        expect(configuration.elements.viewcube.show).toBe(true);
    });

    it('preserves sibling defaults when only one nested sub-field is set', () => {
        const configuration = definePluridConfiguration({
            planeControls: false,
        });

        expect(configuration.elements.plane.controls.show).toBe(false);
        // siblings under the same parent are NOT wiped
        expect(configuration.elements.plane.controls.title).toBe(true);
        expect(configuration.elements.plane.width).toBe(1);
    });

    it('`extend` is layered last — it overrides flat fields and reaches uncovered ones', () => {
        const configuration = definePluridConfiguration({
            planeWidth: 0.5,
            extend: {
                elements: {
                    plane: {
                        width: 0.9,
                    },
                },
                development: {
                    planeDebugger: true,
                },
            },
        });

        expect(configuration.elements.plane.width).toBe(0.9); // extend wins over flat 0.5
        expect(configuration.development.planeDebugger).toBe(true); // field with no flat shortcut
    });
});
// #endregion module
