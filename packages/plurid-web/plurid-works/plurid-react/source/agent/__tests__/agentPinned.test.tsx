/**
 * @jest-environment jsdom
 */

// #region imports
    // #region libraries
    import React, {
        act,
    } from 'react';
    // #endregion libraries


    // #region external
    import {
        renderPlurid,
    } from '../../testing';
    import type {
        RenderedPlurid,
    } from '../../testing';
    import {
        createPluridAgent,
    } from '..';
    import type {
        PluridAgent,
        PluridAgentResult,
    } from '..';
    // #endregion external
// #endregion imports



// #region module
/**
 * THE PIN AND STACK TOOLS: a model lifts a plane onto the screen and puts it back, opens a route
 * pinned, and stacks planes and unstacks them, through the bus the host uses.
 */
const planes = [
    { route: '/one', component: () => <div><p>one, the first plane</p></div> },
    { route: '/two', component: () => <div><p>two</p></div> },
    { route: '/three', component: () => <div><p>three</p></div> },
];

let rendered: RenderedPlurid | undefined;

const calling = async (
    agent: PluridAgent,
    name: string,
    input?: unknown,
): Promise<PluridAgentResult> => {
    let result: PluridAgentResult | undefined;
    await act(async () => {
        result = await agent.call(name, input);
    });
    return result!;
};

const render = async () => {
    rendered = await renderPlurid({
        planes,
        view: ['/one', '/two', '/three'],
        configuration: { space: { navigation: { motion: { duration: 0 } } } } as any,
    });
    return rendered;
};

afterEach(async () => {
    await rendered?.unmount();
    rendered = undefined;
});


describe('plurid_pin', () => {
    it('pins a plane, reads it in its frame, collapses it, and places it back', async () => {
        const { api } = await render();
        const agent = createPluridAgent(api);
        const one = api.getSnapshot().space.tree[0].planeID;

        const pinnedResult = await calling(agent, 'plurid_pin', { action: 'pin', planeID: one, rect: { x: 20, y: 20, width: 320, height: 240 } });
        expect(pinnedResult.ok).toBe(true);
        const seen = pinnedResult.observation!.planes.find((plane) => plane.id === one)!;
        expect(seen).toMatchObject({ pinned: true, collapsed: false });
        // its text is read where its content is: in the frame
        expect(seen.text).toContain('one, the first plane');

        const collapsed = await calling(agent, 'plurid_pin', { action: 'collapse', planeID: one });
        expect(collapsed.observation!.planes.find((plane) => plane.id === one)!.collapsed).toBe(true);
        await calling(agent, 'plurid_pin', { action: 'expand', planeID: one });

        const placed = await calling(agent, 'plurid_pin', { action: 'place', planeID: one });
        expect(placed.ok).toBe(true);
        expect(placed.summary).toMatch(/placed the plane/);
        expect(placed.observation!.planes.find((plane) => plane.id === one)!.pinned).toBe(false);

        const again = await calling(agent, 'plurid_pin', { action: 'place', planeID: one });
        expect(again.ok).toBe(false);
        expect(again.error!.code).toBe('no_effect');
    });

    it('opens a route pinned, and names a route nothing is registered at', async () => {
        const { api } = await render();
        const agent = createPluridAgent(api);
        const opened = await calling(agent, 'plurid_pin', { action: 'open', route: '/two' });
        expect(opened.ok).toBe(true);
        const pinnedPlanes = opened.observation!.planes.filter((plane) => plane.pinned);
        expect(pinnedPlanes).toHaveLength(1);
        expect(pinnedPlanes[0].route).toBe('/two');

        const missing = await calling(agent, 'plurid_pin', { action: 'open', route: '/nowhere' });
        expect(missing.ok).toBe(false);
        expect(missing.error!.code).toBe('not_found');
    });
});


describe('plurid_stack', () => {
    it('stacks planes front first, lists the stack, and unstacks them back where they were', async () => {
        const { api } = await render();
        const agent = createPluridAgent(api);
        const tree = api.getSnapshot().space.tree;
        const ids = tree.map((plane) => plane.planeID);
        const before = tree.map((plane) => plane.location);

        const stacked = await calling(agent, 'plurid_stack', { action: 'stack', planeIDs: ids });
        expect(stacked.ok).toBe(true);
        expect(stacked.observation!.stacks).toEqual([{ id: 'stack-1', planes: ids }]);
        expect(stacked.observation!.planes.map((plane) => plane.stack)).toEqual(['stack-1', 'stack-1', 'stack-1']);

        const unstacked = await calling(agent, 'plurid_stack', { action: 'unstack', stackID: 'stack-1' });
        expect(unstacked.ok).toBe(true);
        expect(unstacked.observation!.stacks).toEqual([]);
        expect(api.getSnapshot().space.tree.map((plane) => plane.location)).toEqual(before);
    });

    it('refuses one plane, an unknown stack, and a pinned plane', async () => {
        const { api } = await render();
        const agent = createPluridAgent(api);
        const [one, two] = api.getSnapshot().space.tree.map((plane) => plane.planeID);
        expect((await calling(agent, 'plurid_stack', { action: 'stack', planeIDs: [one] })).error!.code).toBe('invalid_input');
        expect((await calling(agent, 'plurid_stack', { action: 'unstack', stackID: 'stack-9' })).error!.code).toBe('not_found');
        await calling(agent, 'plurid_pin', { action: 'pin', planeID: two });
        const refused = await calling(agent, 'plurid_stack', { action: 'stack', planeIDs: [one, two] });
        expect(refused.error!.code).toBe('unavailable');
        expect(refused.error!.message).toMatch(/pinned/);
    });
});
// #endregion module
