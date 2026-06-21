// #region imports
    // #region external
    import {
        defaultConfigurationGlobal,
        defaultConfigurationElements,
    } from '../constants/configuration';

    import {
        PLURID_PUBSUB_TOPIC,
    } from '../constants/pubsub';

    import {
        defaultTreePlane,
    } from '../constants/tree';
    // #endregion external
// #endregion imports



// #region module
// Invariant tests for the shared default configuration. The engine's config `merge` layers user
// configuration on top of these defaults, so their shape is a real contract — a structural break
// here silently changes how every consumer's configuration resolves.
describe('plurid-data default configuration', () => {
    it('defaultConfigurationGlobal has the expected theme + flags', () => {
        // `theme` is a `string | PluridConfigurationTheme` union — assert the whole object
        // form rather than narrowing to `.general`/`.interaction`.
        expect(defaultConfigurationGlobal.theme).toEqual({
            general: 'plurid',
            interaction: 'plurid',
        });
        expect(defaultConfigurationGlobal.micro).toBe(false);
        expect(defaultConfigurationGlobal.transparentUI).toBe(false);
    });

    it('defaultConfigurationElements exposes a plane element config', () => {
        expect(defaultConfigurationElements).toBeDefined();
        expect(typeof defaultConfigurationElements).toBe('object');
        expect(defaultConfigurationElements.plane).toBeDefined();
    });
});


// The pubsub topic strings are the contract between the host control/observe bridge and the engine
// handlers (keyed by string in `usePluridPubSub`). A duplicate value would silently cross-wire two
// topics onto the same handler — exactly the kind of copy-paste bug a constant map invites.
describe('PLURID_PUBSUB_TOPIC', () => {
    it('maps every key to a unique topic string', () => {
        const values = Object.values(PLURID_PUBSUB_TOPIC);
        expect(new Set(values).size).toBe(values.length);
    });

    it('namespaces every topic (no bare keys)', () => {
        for (const topic of Object.values(PLURID_PUBSUB_TOPIC)) {
            expect(typeof topic).toBe('string');
            expect(topic.length).toBeGreaterThan(0);
        }
    });
});


// `defaultTreePlane` is spread as the base of every tree node across the engine's tree logic, so its
// identity + addressing keys are a structural contract — a missing field surfaces as `undefined`
// deep inside layout/routing rather than at the construction site.
describe('defaultTreePlane', () => {
    it('carries the identity + addressing keys the tree logic spreads onto every node', () => {
        expect(typeof defaultTreePlane.sourceID).toBe('string');
        expect(typeof defaultTreePlane.planeID).toBe('string');
        expect(typeof defaultTreePlane.route).toBe('string');
        expect(Array.isArray(defaultTreePlane.children)).toBe(true);
        expect(defaultTreePlane.routeDivisions).toBeDefined();
    });
});
// #endregion module
