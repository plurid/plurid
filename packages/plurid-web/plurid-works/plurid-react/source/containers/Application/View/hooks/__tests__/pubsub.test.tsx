/**
 * @jest-environment jsdom
 */

// #region imports
    // #region libraries
    import React, { act } from 'react';

    import PluridPubSub from '@plurid/plurid-pubsub';

    import {
        PLURID_PUBSUB_TOPIC,
        PLURID_PUBSUB_EMITTED_TOPICS,
        PluridPubSub as IPluridPubSub,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        renderPlurid,
        RenderedPlurid,
        gestures,
    } from '../../../../../testing';

    import {
        serializeFragment,
        fragmentOf,
    } from '~services/logic/arrangement/fragment';
    // #endregion external
// #endregion imports



// #region module
/**
 * THE HOST'S TOPICS — the public surface of the library.
 *
 * Everything an embedding application can ask of a space that is not a prop goes through the pubsub
 * bus, and `usePluridPubSub` is the one place those ~40 topics become dispatches. It had NO test
 * (2026-09-13), although it is the seam a host is MOST likely to break silently: a renamed payload
 * field, a guard that returns early, a subscription made twice — each is invisible from inside
 * (every reducer still passes its own test) and total from outside (the publish simply does
 * nothing). One such drift was found this week: `SET_SELECTION` accepted `ids` alone while every
 * other plane-addressing topic takes `planeIDs`, and the browser test that should have caught it was
 * falling back to a store dispatch.
 *
 * So these tests publish as a host publishes — on the bus the application handed back — and assert
 * the STATE, never the dispatch.
 */
const Page = () => <div>page</div>;

/** A space of three roots on a bus the test owns, exactly as a host wires one. */
const render = async (
    routes = ['/a', '/b', '/c'],
    configuration: any = {},
): Promise<RenderedPlurid & { bus: IPluridPubSub; dropped: string[] }> => {
    // a COMMAND nobody is subscribed to is reported rather than warned about, so a test can tell
    // "the topic ran" from "the topic reached no one" instead of inferring it from an unchanged
    // state. The engine's own emitted topics are excluded: nobody has to listen to those.
    const dropped: string[] = [];
    const bus = new PluridPubSub({
        onDrop: (topic: string) => {
            if (!PLURID_PUBSUB_EMITTED_TOPICS.includes(topic)) {
                dropped.push(topic);
            }
        },
    });
    const rendered = await renderPlurid({
        planes: routes.map((route) => ({ route, component: Page })),
        view: routes,
        pubsub: bus,
        configuration: {
            ...configuration,
            space: {
                navigation: { motion: { duration: 0 } },
                ...configuration.space,
            },
        },
    } as any);
    return { ...rendered, bus, dropped };
};

/** Publishing is what a host does; `act` is what React needs. The two are one call here. */
const publish = async (
    bus: IPluridPubSub,
    topic: string,
    data: unknown = {},
) => {
    await act(async () => {
        bus.publish({ topic, data } as any);
    });
};

const ids = (rendered: RenderedPlurid) => rendered.api.getSnapshot().space.tree.map((plane: any) => plane.planeID);
const space = (rendered: RenderedPlurid) => rendered.api.getSnapshot().space;


describe('the host\'s topics reach the store', () => {
    it('THE SELECTION: set (by either field name), toggle, clear, all, invert', async () => {
        const rendered = await render();
        const { bus } = rendered;
        const [a, b, c] = ids(rendered);

        await publish(bus, PLURID_PUBSUB_TOPIC.SET_SELECTION, { ids: [a] });
        expect(space(rendered).selectedPlaneIDs).toEqual([a]);

        // the alias every other plane-addressing topic takes must work here too (2026-09-13)
        await publish(bus, PLURID_PUBSUB_TOPIC.SET_SELECTION, { planeIDs: [b, c] });
        expect(space(rendered).selectedPlaneIDs).toEqual([b, c]);

        await publish(bus, PLURID_PUBSUB_TOPIC.TOGGLE_SELECTION, { planeID: b });
        expect(space(rendered).selectedPlaneIDs).toEqual([c]);

        await publish(bus, PLURID_PUBSUB_TOPIC.SPACE_INVERT_SELECTION);
        expect([...space(rendered).selectedPlaneIDs].sort()).toEqual([a, b].sort());

        await publish(bus, PLURID_PUBSUB_TOPIC.SPACE_SELECT_ALL);
        expect(space(rendered).selectedPlaneIDs).toHaveLength(3);

        await publish(bus, PLURID_PUBSUB_TOPIC.CLEAR_SELECTION);
        expect(space(rendered).selectedPlaneIDs).toEqual([]);

        await rendered.unmount();
    });

    it('THE ARRANGEMENT: align, distribute and duplicate act on the selection, and one undo takes each back', async () => {
        const rendered = await render();
        const { bus } = rendered;

        await publish(bus, PLURID_PUBSUB_TOPIC.SET_SELECTION, { planeIDs: ids(rendered) });

        const edits: [string, string, unknown][] = [
            ['aligned', PLURID_PUBSUB_TOPIC.SPACE_ALIGN, { edge: 'top' }],
            ['distributed', PLURID_PUBSUB_TOPIC.SPACE_DISTRIBUTE, { axis: 'x' }],
            ['duplicated', PLURID_PUBSUB_TOPIC.SPACE_DUPLICATE, {}],
        ];
        for (const [what, topic, data] of edits) {
            const before = JSON.stringify(space(rendered).tree);
            await publish(bus, topic, data);
            expect({ what, changed: JSON.stringify(space(rendered).tree) !== before }).toEqual({ what, changed: true });

            await act(async () => { rendered.handle.history.undo(); });
            expect({ what, undone: JSON.stringify(space(rendered).tree) }).toEqual({ what, undone: before });
        }

        await rendered.unmount();
    });

    it('THE CAMERA: a delta moves it, and a viewpoint puts it exactly where the string says', async () => {
        const rendered = await render();
        const { bus } = rendered;

        await publish(bus, PLURID_PUBSUB_TOPIC.SPACE_CAMERA_DELTA, { yaw: 30, pitch: -10 });
        expect(space(rendered).camera.yaw).toBeCloseTo(30, 6);
        expect(space(rendered).camera.pitch).toBeCloseTo(-10, 6);

        const viewpoint = rendered.api.getViewpoint();
        await publish(bus, PLURID_PUBSUB_TOPIC.SPACE_CAMERA_DELTA, { yaw: 90 });
        expect(space(rendered).camera.yaw).not.toBeCloseTo(30, 6);

        await publish(bus, PLURID_PUBSUB_TOPIC.SET_VIEWPOINT, { viewpoint });
        expect(space(rendered).camera.yaw).toBeCloseTo(30, 6);
        expect(space(rendered).camera.pitch).toBeCloseTo(-10, 6);

        await rendered.unmount();
    });

    it('THE BOOKMARKS: save, go, RENAME IN PLACE, remove — the whole list through the bus alone', async () => {
        const rendered = await render();
        const { bus } = rendered;
        // the bookmarks are a record: the KEY ORDER is the list the panel shows
        const names = () => Object.keys(space(rendered).bookmarks ?? {});

        await publish(bus, PLURID_PUBSUB_TOPIC.SPACE_CAMERA_DELTA, { yaw: 12 });
        await publish(bus, PLURID_PUBSUB_TOPIC.SPACE_BOOKMARK, { name: 'first', action: 'save' });
        await publish(bus, PLURID_PUBSUB_TOPIC.SPACE_CAMERA_DELTA, { yaw: 40 });
        await publish(bus, PLURID_PUBSUB_TOPIC.SPACE_BOOKMARK, { name: 'second', action: 'save' });
        await publish(bus, PLURID_PUBSUB_TOPIC.SPACE_BOOKMARK, { name: 'third', action: 'save' });
        expect(names()).toEqual(['first', 'second', 'third']);

        // a rename is not a delete and a new save: the list KEEPS ITS ORDER, and the camera with it
        const saved = (space(rendered).bookmarks as any).second;
        await publish(bus, PLURID_PUBSUB_TOPIC.SPACE_BOOKMARK, { name: 'second', action: 'rename', to: 'renamed' });
        expect(names()).toEqual(['first', 'renamed', 'third']);
        expect((space(rendered).bookmarks as any).renamed).toBe(saved);
        expect((space(rendered).bookmarks as any).second).toBeUndefined();

        // and the renamed one is reachable under its new name, under no other
        await publish(bus, PLURID_PUBSUB_TOPIC.SPACE_CAMERA_DELTA, { yaw: 88 });
        await publish(bus, PLURID_PUBSUB_TOPIC.SPACE_BOOKMARK, { name: 'renamed', action: 'go', animate: false });
        expect(space(rendered).camera.yaw).toBeCloseTo(52, 6);

        await publish(bus, PLURID_PUBSUB_TOPIC.SPACE_BOOKMARK, { name: 'second', action: 'go', animate: false });
        expect(space(rendered).camera.yaw).toBeCloseTo(52, 6);

        await publish(bus, PLURID_PUBSUB_TOPIC.SPACE_BOOKMARK, { name: 'renamed', action: 'remove' });
        expect(names()).toEqual(['first', 'third']);

        await rendered.unmount();
    });

    it('THE CLIPBOARD: a host copies and pastes without touching the system clipboard at all', async () => {
        const rendered = await render(['/a', '/b']);
        const { bus } = rendered;
        const [a] = ids(rendered);

        await publish(bus, PLURID_PUBSUB_TOPIC.SET_SELECTION, { planeIDs: [a] });
        await publish(bus, PLURID_PUBSUB_TOPIC.SPACE_COPY);
        await publish(bus, PLURID_PUBSUB_TOPIC.SPACE_PASTE);

        const shown = space(rendered).tree.filter((plane: any) => plane.show !== false);
        expect(shown).toHaveLength(3);
        expect(shown[2].route).toBe(shown[0].route);
        expect(shown[2].planeID).not.toBe(shown[0].planeID);

        await rendered.unmount();
    });

    it('A HOST\'S CAMERA COMMAND ends grab mode when it lands docked, exactly as the rail\'s does', async () => {
        const rendered = await render(['/a', '/b'], { space: { presentation: 'page' } });
        const { bus } = rendered;

        // grab is armed the only way there is: the reader's G
        await gestures.key(rendered.view, 'KeyG');
        expect(rendered.api.getSnapshot().ui.grabMode).toBe(true);

        await publish(bus, PLURID_PUBSUB_TOPIC.SPACE_DOCK, { planeID: ids(rendered)[1], animate: false });
        expect(rendered.api.getSnapshot().ui.grabMode).toBe(false);

        // the reveal that G opens is no landing: it keeps the grab armed
        await gestures.key(rendered.view, 'KeyG');
        await publish(bus, PLURID_PUBSUB_TOPIC.SPACE_REVEAL, { animate: false });
        expect(rendered.api.getSnapshot().ui.grabMode).toBe(true);

        await rendered.unmount();
    });
});


describe('a topic never corrupts the view', () => {
    it('A MALFORMED PAYLOAD IS IGNORED: every guarded topic leaves the space exactly as it was', async () => {
        const rendered = await render();
        const { bus } = rendered;

        await publish(bus, PLURID_PUBSUB_TOPIC.SET_SELECTION, { planeIDs: ids(rendered) });
        const before = JSON.stringify(rendered.api.getSnapshot());

        const malformed: [string, unknown][] = [
            [PLURID_PUBSUB_TOPIC.SET_SELECTION, { ids: 'not-an-array' }],
            [PLURID_PUBSUB_TOPIC.SET_SELECTION, {}],
            [PLURID_PUBSUB_TOPIC.TOGGLE_SELECTION, {}],
            [PLURID_PUBSUB_TOPIC.SET_PLANE_LINKS, { links: 'nope' }],
            [PLURID_PUBSUB_TOPIC.SET_VIEWPOINT, { viewpoint: 42 }],
            [PLURID_PUBSUB_TOPIC.SET_VIEWPOINT, { viewpoint: 'not-a-viewpoint' }],
            [PLURID_PUBSUB_TOPIC.SPACE_CAMERA_DELTA, null],
            [PLURID_PUBSUB_TOPIC.SPACE_PRESET, { name: 7 }],
            [PLURID_PUBSUB_TOPIC.SPACE_PRESET, { name: 'no-such-preset' }],
            [PLURID_PUBSUB_TOPIC.SPACE_BOOKMARK, { action: 'save' }],
            [PLURID_PUBSUB_TOPIC.SPACE_BOOKMARK, { name: 'nowhere', action: 'go' }],
            [PLURID_PUBSUB_TOPIC.SPACE_ALIGN, { edge: 9 }],
            [PLURID_PUBSUB_TOPIC.SPACE_DISTRIBUTE, { axis: 'z' }],
            [PLURID_PUBSUB_TOPIC.SPACE_PASTE, { text: 'an ordinary paragraph' }],
            [PLURID_PUBSUB_TOPIC.SPACE_PASTE, { text: '{"plurid":"plurid/arrangement"' }],
        ];
        for (const [topic, data] of malformed) {
            await publish(bus, topic, data);
            expect({ topic, state: JSON.stringify(rendered.api.getSnapshot()) }).toEqual({ topic, state: before });
        }

        await rendered.unmount();
    });

    it('A PASTE FROM ANOTHER SPACE lands what this one registers and drops the rest', async () => {
        const source = await render(['/a', '/b']);
        const fragment = fragmentOf(
            space(source).tree,
            ids(source),
            space(source).links,
        )!;
        const text = serializeFragment(fragment);
        await source.unmount();

        // an application that registers only one of the two routes
        const target = await render(['/a']);
        await publish(target.bus, PLURID_PUBSUB_TOPIC.SPACE_PASTE, { text });

        const shown = space(target).tree.filter((plane: any) => plane.show !== false);
        expect(shown.map((plane: any) => plane.route.replace(/^plurid:\/\/[^/]+/, ''))).toEqual(['/a', '/a']);

        // a host may hand over the fragment itself, with no text anywhere
        await publish(target.bus, PLURID_PUBSUB_TOPIC.SPACE_PASTE, { fragment });
        expect(space(target).tree.filter((plane: any) => plane.show !== false)).toHaveLength(3);

        await target.unmount();
    });

    it('THE SUBSCRIPTION IS MADE ONCE, and is gone after the unmount', async () => {
        const rendered = await render();
        const { bus } = rendered;
        const [a, b] = ids(rendered);

        // a re-render re-runs the hook: if it re-subscribed, the toggle below would run twice and
        // cancel itself out
        await rendered.rerender({ style: { outline: 'none' } } as any);
        await publish(bus, PLURID_PUBSUB_TOPIC.SET_SELECTION, { planeIDs: [a] });
        await publish(bus, PLURID_PUBSUB_TOPIC.TOGGLE_SELECTION, { planeID: b });
        expect(space(rendered).selectedPlaneIDs).toEqual([a, b]);

        expect(rendered.dropped).toEqual([]);

        const last = JSON.stringify(rendered.api.getSnapshot().space.selectedPlaneIDs);
        await rendered.unmount();

        // the bus outlives the application: after the teardown a publish reaches NO ONE — the bus
        // says so, and the torn-down store is untouched
        await publish(bus, PLURID_PUBSUB_TOPIC.CLEAR_SELECTION);
        expect(rendered.dropped).toEqual([PLURID_PUBSUB_TOPIC.CLEAR_SELECTION]);
        expect(JSON.stringify(rendered.api.getSnapshot().space.selectedPlaneIDs)).toBe(last);
    });
});
// #endregion module
