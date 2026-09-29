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
    import PluridLink from '~components/links/Link';

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
        PluridAgentSchema,
    } from '..';
    // #endregion external
// #endregion imports



// #region module
/**
 * AGENT CONTROL, end to end in jsdom: a model's tool calls, validated and run through the bus the
 * host uses, answered with the space as it is after the action.
 */
const One = () => (
    <div>
        <h1>First</h1>
        <p>The first plane.</p>
        <PluridLink route="/two">to the second</PluridLink>
    </div>
);
const Two = () => (
    <div>
        <h1>Second</h1>
        <p>The second plane.</p>
    </div>
);
const Three = () => (
    <div>
        <p>A third plane, opened by route.</p>
    </div>
);

const planes = [
    { route: '/one', component: One },
    { route: '/two', component: Two },
    { route: '/three', component: Three },
];

let rendered: RenderedPlurid | undefined;

/** A call inside `act`: the renders it causes are flushed before its answer is read. */
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
        view: ['/one'],
        configuration: { space: { navigation: { motion: { duration: 0 } } } } as any,
    });
    return rendered;
};

afterEach(async () => {
    await rendered?.unmount();
    rendered = undefined;
    delete (document as any).modelContext;
});


/** Every object names every field, and nothing a provider's strict mode rejects. */
const strictCompatible = (
    schema: PluridAgentSchema,
    path: string,
): string[] => {
    const problems: string[] = [];
    const forbidden = ['minimum', 'maximum', 'minLength', 'maxLength', 'multipleOf', 'pattern', 'minItems', 'maxItems'];
    for (const key of forbidden) {
        if (key in (schema as unknown as Record<string, unknown>)) {
            problems.push(`${path}: ${key}`);
        }
    }
    if (schema.type === 'object') {
        if (schema.additionalProperties !== false) {
            problems.push(`${path}: additionalProperties is not false`);
        }
        for (const required of schema.required ?? []) {
            if (!schema.properties?.[required]) {
                problems.push(`${path}: required ${required} is not a property`);
            }
        }
        for (const [key, property] of Object.entries(schema.properties ?? {})) {
            if (!property.description) {
                problems.push(`${path}.${key}: no description`);
            }
            problems.push(...strictCompatible(property, `${path}.${key}`));
        }
    }
    if (schema.type === 'array' && schema.items) {
        problems.push(...strictCompatible(schema.items, `${path}[]`));
    }
    return problems;
};


describe('the agent\'s catalog', () => {
    it('describes every tool for a model: a name, when to call it, and a strict-compatible schema', async () => {
        const { api } = await render();
        const agent = createPluridAgent(api);
        const tools = agent.tools();

        expect(tools.map((tool) => tool.name)).toEqual([
            'plurid_observe',
            'plurid_follow_link',
            'plurid_open_plane',
            'plurid_go_to_plane',
            'plurid_close_plane',
            'plurid_remove_plane',
            'plurid_scroll_plane',
            'plurid_camera',
            'plurid_select',
            'plurid_arrange',
            'plurid_history',
            'plurid_bookmark',
            'plurid_command',
            'plurid_configure',
        ]);
        for (const tool of tools) {
            expect(tool.name).toMatch(/^[a-z_]{1,64}$/);
            expect(tool.description.length).toBeGreaterThan(80);
            expect(strictCompatible(tool.inputSchema, tool.name)).toEqual([]);
        }
        expect(tools.find((tool) => tool.name === 'plurid_remove_plane')?.annotations).toEqual({ readOnlyHint: false, destructiveHint: true });

        const anthropic = agent.anthropicTools({ strict: true });
        expect(anthropic[0]).toEqual({
            name: 'plurid_observe',
            description: tools[0].description,
            input_schema: tools[0].inputSchema,
            strict: true,
        });
        expect(agent.anthropicTools()[0]).not.toHaveProperty('strict');
    });

    it('offers only what the host allows: an allowlist, or the reading tool alone', async () => {
        const { api } = await render();
        expect(createPluridAgent(api, { readOnly: true }).tools().map((tool) => tool.name)).toEqual(['plurid_observe']);
        expect(createPluridAgent(api, { tools: ['plurid_observe', 'plurid_camera'] }).tools().map((tool) => tool.name)).toEqual(['plurid_observe', 'plurid_camera']);

        const agent = createPluridAgent(api, { readOnly: true });
        const refused = await calling(agent, 'plurid_camera', { action: 'fit' });
        expect(refused.ok).toBe(false);
        expect(refused.error?.code).toBe('unknown_tool');
        expect(refused.error?.message).toContain('plurid_observe');
    });
});


describe('the agent\'s observation', () => {
    it('reads each plane as a reader would: its route, title, text and links', async () => {
        const { api } = await render();
        const agent = createPluridAgent(api);
        const observation = agent.observe();

        expect(observation.presentation).toBe('space');
        expect(observation.planes).toHaveLength(1);
        const [one] = observation.planes;
        expect(one.route).toBe('/one');
        expect(one.title).toBe('/one');
        expect(one.parent).toBeNull();
        expect(one.shown).toBe(true);
        expect(one.text).toContain('The first plane.');
        expect(one.links).toEqual([{ text: 'to the second', route: '/two', open: false }]);
        expect(observation.history).toEqual({ canUndo: false, canRedo: false });

        expect(agent.observe({ textLength: 0 }).planes[0].text).toBe('');
        expect(agent.observe({ textLength: 5 }).planes[0].text).toMatch(/^.{1,5}…$/);
    });
});


describe('the agent\'s calls', () => {
    it('follows a link as a click does, and answers with what changed', async () => {
        const { api } = await render();
        const agent = createPluridAgent(api);
        const one = agent.observe().planes[0];

        const result = await calling(agent, 'plurid_follow_link', { planeID: one.id, link: 'To The  Second' });
        expect(result.ok).toBe(true);
        expect(result.summary).toContain('/two');
        expect(result.changes?.opened).toHaveLength(1);
        const child = result.observation!.planes.find((plane) => plane.id === result.changes!.opened[0])!;
        expect(child.route).toBe('/two');
        expect(child.parent).toBe(one.id);
        expect(result.observation!.planes.find((plane) => plane.id === one.id)!.links[0].open).toBe(true);
        expect(result.observation!.history.canUndo).toBe(true);

        // by its route too
        const again = await calling(agent, 'plurid_follow_link', { planeID: one.id, link: '/two' });
        expect(again.ok).toBe(true);
    });

    it('opens a route as a root or as a child, and says which plane it became', async () => {
        const { api } = await render();
        const agent = createPluridAgent(api);
        const one = agent.observe().planes[0];

        const root = await calling(agent, 'plurid_open_plane', { route: '/three' });
        expect(root.ok).toBe(true);
        expect(root.changes?.opened).toHaveLength(1);
        const opened = root.observation!.planes.find((plane) => plane.id === root.changes!.opened[0])!;
        expect(opened.route).toBe('/three');
        expect(opened.parent).toBeNull();
        expect(root.summary).toContain(opened.id);

        const child = await calling(agent, 'plurid_open_plane', { route: '/two', parentPlaneID: one.id });
        expect(child.ok).toBe(true);
        const two = child.observation!.planes.find((plane) => plane.id === child.changes!.opened[0])!;
        expect(two.parent).toBe(one.id);
    });

    it('closes a plane, brings it back, removes it, and undoes', async () => {
        const { api } = await render();
        const agent = createPluridAgent(api);
        const one = agent.observe().planes[0];
        const opened = await calling(agent, 'plurid_follow_link', { planeID: one.id, link: 'to the second' });
        const childID = opened.changes!.opened[0];

        const closed = await calling(agent, 'plurid_close_plane', { planeID: childID });
        expect(closed.ok).toBe(true);
        expect(closed.changes?.closed).toEqual([childID]);
        const twice = await calling(agent, 'plurid_close_plane', { planeID: childID });
        expect(twice.error?.code).toBe('no_effect');

        const back = await calling(agent, 'plurid_go_to_plane', { planeID: childID });
        expect(back.ok).toBe(true);
        expect(back.summary).toContain('reopened');
        expect(back.observation!.planes.find((plane) => plane.id === childID)!.shown).toBe(true);

        const removed = await calling(agent, 'plurid_remove_plane', { planeID: childID });
        expect(removed.changes?.removed).toEqual([childID]);

        const undone = await calling(agent, 'plurid_history', { action: 'undo' });
        expect(undone.ok).toBe(true);
        expect(undone.observation!.planes.some((plane) => plane.id === childID)).toBe(true);
    });

    it('moves the camera, selects, and runs a keyboard command by id', async () => {
        const { api } = await render();
        const agent = createPluridAgent(api);
        const one = agent.observe().planes[0];

        const moved = await calling(agent, 'plurid_camera', { action: 'move', yaw: 30 });
        expect(moved.ok).toBe(true);
        expect(moved.observation!.camera.yaw).toBeCloseTo(30, 0);

        const selected = await calling(agent, 'plurid_select', { action: 'set', planeIDs: [one.id] });
        expect(selected.observation!.selection).toEqual([one.id]);
        const cleared = await calling(agent, 'plurid_command', { id: 'clearSelection' });
        expect(cleared.ok).toBe(true);
        expect(cleared.observation!.selection).toEqual([]);
        const all = await calling(agent, 'plurid_command', { id: 'selectAll' });
        expect(all.observation!.selection).toEqual([one.id]);
    });

    it('refuses what it cannot do, and says what to do instead', async () => {
        const { api } = await render();
        const agent = createPluridAgent(api);
        const one = agent.observe().planes[0];

        expect((await calling(agent, 'plurid_nothing')).error?.code).toBe('unknown_tool');

        const wrongType = await calling(agent, 'plurid_go_to_plane', { planeID: 7 });
        expect(wrongType.error).toEqual({ code: 'invalid_input', message: 'input.planeID must be a string, got number' });

        const extra = await calling(agent, 'plurid_go_to_plane', { planeID: one.id, zoom: 2 });
        expect(extra.error?.code).toBe('invalid_input');
        expect(extra.error?.message).toContain('input.zoom is not a field of this tool');

        const missing = await calling(agent, 'plurid_go_to_plane', { planeID: 'nowhere' });
        expect(missing.error?.code).toBe('not_found');
        expect(missing.error?.message).toContain(one.id);

        const noLink = await calling(agent, 'plurid_follow_link', { planeID: one.id, link: 'elsewhere' });
        expect(noLink.error?.code).toBe('not_found');
        expect(noLink.error?.message).toContain('"to the second" (/two)');

        const badZoom = await calling(agent, 'plurid_camera', { action: 'move', zoom: 0 });
        expect(badZoom.error?.code).toBe('invalid_input');

        const nothingToUndo = await calling(agent, 'plurid_history', { action: 'undo' });
        expect(nothingToUndo.error?.code).toBe('no_effect');

        // the bus refuses at once: no waiting out the settle time for a route nothing is registered at
        const started = Date.now();
        const unknownRoute = await calling(agent, 'plurid_open_plane', { route: '/nowhere' });
        expect(unknownRoute.error?.code).toBe('not_found');
        expect(unknownRoute.error?.message).toContain('/nowhere');
        expect(Date.now() - started).toBeLessThan(1000);
    });

    it('asks the host before every call, and a refusal reaches the model', async () => {
        const { api } = await render();
        const seen: string[] = [];
        const agent = createPluridAgent(api, {
            onCall: ({ name }) => {
                seen.push(name);
                return name !== 'plurid_remove_plane';
            },
        });
        const one = agent.observe().planes[0];
        const refused = await calling(agent, 'plurid_remove_plane', { planeID: one.id });
        expect(refused.error?.code).toBe('not_allowed');
        expect(agent.observe().planes).toHaveLength(1);
        expect((await calling(agent, 'plurid_observe')).ok).toBe(true);
        expect(seen).toEqual(['plurid_remove_plane', 'plurid_observe']);
    });

    it('runs calls one at a time, in the order they were made', async () => {
        const { api } = await render();
        const agent = createPluridAgent(api);
        const one = agent.observe().planes[0];
        let opened: PluridAgentResult | undefined;
        let selected: PluridAgentResult | undefined;
        await act(async () => {
            [opened, selected] = await Promise.all([
                agent.call('plurid_follow_link', { planeID: one.id, link: 'to the second' }),
                agent.call('plurid_select', { action: 'all' }),
            ]);
        });
        expect(opened!.ok).toBe(true);
        // the selection saw the plane the link opened: it ran after
        expect(selected!.observation!.selection).toHaveLength(2);
    });
});


describe('the agent\'s transports', () => {
    it('registers with the browser\'s WebMCP context, answers through it, and withdraws on dispose', async () => {
        const { api } = await render();
        const registered: { tool: any; signal?: AbortSignal }[] = [];
        (document as any).modelContext = {
            registerTool: async (tool: any, options?: { signal?: AbortSignal }) => {
                if (registered.some((entry) => entry.tool.name === tool.name && !entry.signal?.aborted)) {
                    throw new Error('a tool with this name exists');
                }
                registered.push({ tool, signal: options?.signal });
            },
        };
        const agent = createPluridAgent(api, { tools: ['plurid_observe', 'plurid_camera'] });
        const registration = await agent.exposeToWebMCP();
        expect(registration.available).toBe(true);
        expect(registration.registered).toEqual(['plurid_observe', 'plurid_camera']);
        expect(registered[0].tool.inputSchema).toEqual(agent.tools()[0].inputSchema);
        expect(registered[0].tool.annotations).toEqual({ readOnlyHint: true, destructiveHint: false });

        let answer: any;
        await act(async () => {
            answer = await registered[0].tool.execute({});
        });
        expect(answer.isError).toBeUndefined();
        expect(JSON.parse(answer.content[0].text).observation.planes).toHaveLength(1);
        let failed: any;
        await act(async () => {
            failed = await registered[1].tool.execute({ action: 'spin' });
        });
        expect(failed.isError).toBe(true);

        // a second agent's same names are refused, not fatal
        const second = await createPluridAgent(api, { tools: ['plurid_observe'] }).exposeToWebMCP();
        expect(second.refused.map((entry) => entry.name)).toEqual(['plurid_observe']);

        agent.dispose();
        expect(registered.slice(0, 2).every((entry) => entry.signal?.aborted)).toBe(true);
    });

    it('reports a page without WebMCP, and puts itself on window only when asked', async () => {
        const { api } = await render();
        const agent = createPluridAgent(api);
        const registration = await agent.exposeToWebMCP();
        expect(registration).toMatchObject({ available: false, registered: [] });

        expect((window as any).__PLURID_AGENT__).toBeUndefined();
        const undo = agent.exposeGlobal();
        expect(typeof (window as any).__PLURID_AGENT__.call).toBe('function');
        let viaWindow: any;
        await act(async () => {
            viaWindow = await (window as any).__PLURID_AGENT__.call('plurid_observe');
        });
        expect(viaWindow.ok).toBe(true);
        undo();
        expect((window as any).__PLURID_AGENT__).toBeUndefined();
    });
});
// #endregion module
