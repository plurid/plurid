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
        resolveAnchor,
        sameCamera,
    } from '~services/logic/camera';

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
 * THE TOUR TOOL: a model shows the reader around, through the planes it observed by id. The stops
 * become anchors on the planes' paths; the player is the application's.
 */
const planes = [
    { route: '/one', component: () => <div>one</div> },
    { route: '/two', component: () => <div>two</div> },
    { route: '/three', component: () => <div>three</div> },
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

const render = async (
    duration = 0,
) => {
    rendered = await renderPlurid({
        planes,
        view: ['/one', '/two', '/three'],
        configuration: { space: { navigation: { motion: { duration } } } } as any,
    });
    return rendered;
};

afterEach(async () => {
    await rendered?.unmount();
    rendered = undefined;
});


describe('plurid_tour', () => {
    it('plays a tour through planes by id, steers it, and says where it is', async () => {
        const app = await render();
        const agent = createPluridAgent(app.api, { settleTimeout: 500 });
        const [one, two, three] = app.api.getSnapshot().space.tree.map((plane) => plane.planeID);

        const played = await calling(agent, 'plurid_tour', {
            action: 'play',
            stops: [{ planeID: two }, { planeID: three, view: 'dock' }, { planeID: one, dwell: 0 }],
        });
        expect(played.error).toBeUndefined();
        expect(played.ok).toBe(true);
        expect(played.summary).toBe(`the tour is dwelling at stop 1 of 3 (${two})`);
        expect(app.handle.tour.state()).toMatchObject({ status: 'dwelling', count: 3, planeID: two });

        expect((await calling(agent, 'plurid_tour', { action: 'next' })).summary).toContain(`stop 2 of 3 (${three})`);
        expect((await calling(agent, 'plurid_tour', { action: 'pause' })).summary).toContain('paused (host)');
        expect((await calling(agent, 'plurid_tour', { action: 'resume' })).summary).toContain('stop 2 of 3');
        expect((await calling(agent, 'plurid_tour', { action: 'previous' })).summary).toContain('stop 1 of 3');
        expect((await calling(agent, 'plurid_tour', { action: 'state' })).summary).toContain('dwelling at stop 1 of 3');
        const stopped = await calling(agent, 'plurid_tour', { action: 'stop' });
        expect(stopped.summary).toBe(`the tour ended (stopped) at stop 1 of 3 (${two})`);
    });

    it('`play` answers once the first stop is reached, the camera on it, through a real travel', async () => {
        const app = await render(200);
        const agent = createPluridAgent(app.api, { settleTimeout: 3000 });
        const [, two] = app.api.getSnapshot().space.tree.map((plane) => plane.planeID);
        const played = await calling(agent, 'plurid_tour', { action: 'play', stops: [{ planeID: two }] });
        expect(played.ok).toBe(true);
        expect(played.summary).toBe(`the tour is dwelling at stop 1 of 1 (${two})`);
        expect(app.handle.tour.state().status).toBe('dwelling');
        const there = resolveAnchor(app.api.getSnapshot() as any, { path: '/two' });
        expect(there.ok && sameCamera((app.api.getSnapshot() as any).space.camera, there.camera)).toBe(true);
    });

    it('answers what a model can act on: no stops, an unknown plane, a tour that is not playing', async () => {
        const app = await render();
        const agent = createPluridAgent(app.api, { settleTimeout: 300 });
        expect((await calling(agent, 'plurid_tour', { action: 'play' })).error?.code).toBe('invalid_input');
        expect((await calling(agent, 'plurid_tour', { action: 'play', stops: [{ planeID: 'nope' }] })).error?.code).toBe('not_found');
        const [one] = app.api.getSnapshot().space.tree.map((plane) => plane.planeID);
        expect((await calling(agent, 'plurid_tour', { action: 'play', stops: [{ planeID: one, dwell: -1 }] })).error?.code).toBe('invalid_input');
        // a dwell past a timer's longest delay fired at once
        const long = await calling(agent, 'plurid_tour', { action: 'play', stops: [{ planeID: one, dwell: 1e10 }] });
        expect(long.error?.code).toBe('invalid_input');
        expect(long.error?.message).toBe('input.stops[0].dwell must be from 0 to 2147483647 ms; omit it to wait for `next`');
        const many = await calling(agent, 'plurid_tour', { action: 'play', stops: Array.from({ length: 101 }, () => ({ planeID: one })) });
        expect(many.error?.code).toBe('invalid_input');
        expect(many.error?.message).toContain('at most 100 stops');
        const next = await calling(agent, 'plurid_tour', { action: 'next' });
        expect(next.error?.code).toBe('no_effect');
        expect(next.error?.message).toContain('no tour has played here');
        expect((await calling(agent, 'plurid_tour', { action: 'state' })).summary).toBe('no tour has played here');
    });
});
// #endregion module
