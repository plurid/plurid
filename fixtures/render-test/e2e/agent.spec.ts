import {
    test,
    expect,
    Page,
} from '@playwright/test';

import {
    openHarness,
    collectConsoleErrors,
} from './helpers';


/**
 * AGENT CONTROL (`@plurid/plurid-react/agent`), in a real browser: the harness with `?agent=1` puts
 * the agent on `window.__PLURID_AGENT__` (and registers its tools with a WebMCP context when the page
 * has one), and every step here is a tool call a model would make — observe, follow a link, close,
 * reopen, undo, move the camera — answered with the space as it is once it comes to rest.
 */

interface AgentResult {
    ok: boolean;
    tool: string;
    summary?: string;
    settled?: boolean;
    changes?: { opened: string[]; closed: string[]; removed: string[]; docked?: { from: string | null; to: string | null } };
    observation?: {
        presentation: 'page' | 'space';
        docked: string | null;
        planes: { id: string; route: string; title: string; parent: string | null; shown: boolean; docked: boolean; onScreen: boolean; text: string; links: { text: string; route: string; open: boolean }[] }[];
        selection: string[];
        history: { canUndo: boolean; canRedo: boolean };
    };
    error?: { code: string; message: string };
}

const call = (
    page: Page,
    name: string,
    input?: unknown,
): Promise<AgentResult> => page.evaluate(
    ({ name, input }) => (window as any).__PLURID_AGENT__.call(name, input),
    { name, input },
);

const openWithAgent = async (
    page: Page,
    query: string,
) => {
    await openHarness(page, query);
    await page.waitForFunction(() => typeof (window as any).__PLURID_AGENT__?.call === 'function');
};


test.describe('agent control', () => {
    test('an agent reads the space, follows a link, closes, reopens and undoes', async ({ page }) => {
        const errors = collectConsoleErrors(page);
        await openWithAgent(page, '?agent=1&reducedMotion=1');

        const first = await call(page, 'plurid_observe');
        expect(first.ok).toBe(true);
        expect(first.observation!.presentation).toBe('space');
        const geometry = first.observation!.planes.find((plane) => plane.route === '/geometry')!;
        expect(geometry, 'the GEOMETRY root is listed').toBeTruthy();
        expect(geometry.parent).toBeNull();
        expect(geometry.text).toContain('GEOMETRY');
        expect(geometry.links.map((link) => link.route)).toContain('/geometry/detail');

        // follow the link by its text, as a model reading the observation would
        const followed = await call(page, 'plurid_follow_link', { planeID: geometry.id, link: 'open detail' });
        expect(followed.ok, JSON.stringify(followed.error)).toBe(true);
        expect(followed.settled).toBe(true);
        expect(followed.changes!.opened).toHaveLength(1);
        const detailID = followed.changes!.opened[0];
        const detail = followed.observation!.planes.find((plane) => plane.id === detailID)!;
        expect(detail.route).toBe('/geometry/detail');
        expect(detail.parent).toBe(geometry.id);
        expect(detail.links.map((link) => link.route)).toEqual(['/geometry/detail/mesh', '/geometry/detail/uv', '/geometry/detail/lod']);
        expect(detail.links.map((link) => link.text)).toEqual(['mesh →', 'uv →', 'lod →']);
        expect(followed.observation!.planes.find((plane) => plane.id === geometry.id)!.links.find((link) => link.route === '/geometry/detail')!.open).toBe(true);
        // the DOM agrees: the child is rendered and measured
        await expect(page.locator(`[data-plurid-plane="${detailID}"]`)).toHaveCount(1);

        const closed = await call(page, 'plurid_close_plane', { planeID: detailID });
        expect(closed.ok).toBe(true);
        expect(closed.changes!.closed).toEqual([detailID]);

        const again = await call(page, 'plurid_close_plane', { planeID: detailID });
        expect(again.ok).toBe(false);
        expect(again.error!.code).toBe('no_effect');

        const reopened = await call(page, 'plurid_go_to_plane', { planeID: detailID });
        expect(reopened.ok).toBe(true);
        expect(reopened.summary).toMatch(/reopened/);
        expect(reopened.changes!.opened).toEqual([detailID]);
        expect(reopened.observation!.planes.find((plane) => plane.id === detailID)!.onScreen).toBe(true);

        const selected = await call(page, 'plurid_select', { action: 'set', planeIDs: [geometry.id, detailID] });
        expect(selected.observation!.selection.sort()).toEqual([geometry.id, detailID].sort());

        const fit = await call(page, 'plurid_camera', { action: 'fit' });
        expect(fit.ok).toBe(true);
        expect(fit.settled).toBe(true);

        expect(reopened.observation!.history.canUndo).toBe(true);
        const undone = await call(page, 'plurid_history', { action: 'undo' });
        expect(undone.ok).toBe(true);

        // the errors a model acts on: a plane that is not there, an input that does not fit
        const missing = await call(page, 'plurid_go_to_plane', { planeID: 'nope' });
        expect(missing.error!.code).toBe('not_found');
        expect(missing.error!.message).toContain(geometry.id);
        const invalid = await call(page, 'plurid_camera', { action: 'spin' });
        expect(invalid.error!.code).toBe('invalid_input');

        expect(errors).toEqual([]);
    });

    test('an agent drives the page presentation: follows a link to a page, goes back, scrolls', async ({ page }) => {
        const errors = collectConsoleErrors(page);
        await openWithAgent(page, '?agent=1&presentation=page&pages=3&reducedMotion=1');

        const first = await call(page, 'plurid_observe');
        expect(first.observation!.presentation).toBe('page');
        const home = first.observation!.planes.find((plane) => plane.route === '/page-1')!;
        expect(first.observation!.docked).toBe(home.id);
        // the pages the camera is not on are read too: inert and hidden, still in the document
        const second = first.observation!.planes.find((plane) => plane.route === '/page-2')!;
        expect(second.docked).toBe(false);
        expect(second.text).toContain('SITE 02');

        const followed = await call(page, 'plurid_follow_link', { planeID: home.id, link: 'about' });
        expect(followed.ok, JSON.stringify(followed.error)).toBe(true);
        const about = followed.observation!.planes.find((plane) => plane.route === '/page-1/about')!;
        expect(followed.changes!.docked).toEqual({ from: home.id, to: about.id });
        expect(followed.observation!.docked).toBe(about.id);
        await expect.poll(() => page.evaluate(() => location.pathname)).toBe('/page-1/about');

        // the whole text of the long page, without scrolling it
        const read = await call(page, 'plurid_observe', { planeID: about.id });
        expect(read.observation!.planes).toHaveLength(1);
        expect(read.observation!.planes[0].text.length).toBeGreaterThan(followed.observation!.planes.find((plane) => plane.id === about.id)!.text.length);

        const scrolled = await call(page, 'plurid_scroll_plane', { planeID: about.id, to: 'bottom' });
        expect(scrolled.ok, JSON.stringify(scrolled.error)).toBe(true);
        expect(scrolled.summary).toMatch(/scrolled the plane .* to (\d+) of \1 px/);

        const back = await call(page, 'plurid_go_to_plane', { planeID: home.id });
        expect(back.ok).toBe(true);
        expect(back.changes!.docked).toEqual({ from: about.id, to: home.id });
        await expect.poll(() => page.evaluate(() => location.pathname)).toBe('/page-1');

        expect(errors).toEqual([]);
    });

    test('the tools register with a WebMCP context and answer through it', async ({ page }) => {
        const errors = collectConsoleErrors(page);
        // a WebMCP context, as a browser with the proposal offers one: the page's tools by name
        await page.addInitScript(() => {
            const tools = new Map<string, any>();
            (window as any).__fakeWebMCP = tools;
            Object.defineProperty(document, 'modelContext', {
                configurable: true,
                value: {
                    registerTool: (tool: any, options?: { signal?: AbortSignal }) => {
                        if (tools.has(tool.name)) {
                            throw new Error(`a tool named ${tool.name} is registered`);
                        }
                        tools.set(tool.name, tool);
                        options?.signal?.addEventListener('abort', () => tools.delete(tool.name));
                    },
                },
            });
        });
        await openWithAgent(page, '?agent=1&reducedMotion=1');
        await page.waitForFunction(() => (window as any).__rtWebMCP?.registered?.length > 0);

        const registration = await page.evaluate(() => (window as any).__rtWebMCP);
        expect(registration.available).toBe(true);
        expect(registration.refused).toEqual([]);
        expect(registration.registered).toContain('plurid_observe');
        expect(registration.registered).toContain('plurid_follow_link');

        const answered = await page.evaluate(async () => {
            const tools = (window as any).__fakeWebMCP as Map<string, any>;
            const observe = await tools.get('plurid_observe').execute({});
            const missing = await tools.get('plurid_go_to_plane').execute({ planeID: 'nope' });
            const schema = tools.get('plurid_follow_link').inputSchema;
            return {
                observe: { isError: !!observe.isError, result: JSON.parse(observe.content[0].text) },
                missing: { isError: !!missing.isError, result: JSON.parse(missing.content[0].text) },
                required: schema.required,
            };
        });
        expect(answered.observe.isError).toBe(false);
        expect(answered.observe.result.ok).toBe(true);
        expect(answered.observe.result.observation.planes.length).toBeGreaterThan(0);
        expect(answered.missing.isError).toBe(true);
        expect(answered.missing.result.error.code).toBe('not_found');
        expect(answered.required).toEqual(['planeID', 'link']);

        expect(errors).toEqual([]);
    });
});
