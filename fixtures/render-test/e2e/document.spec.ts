import {
    test,
    expect,
    Page,
} from '@playwright/test';

import {
    openHarness,
    collectConsoleErrors,
    publish,
} from './helpers';


const tree = (page: Page) => page.evaluate(() => (window as any).__rtTree());

const head = (page: Page) => page.evaluate(() => ({
    title: document.title,
    titles: document.querySelectorAll('title').length,
    description: document.querySelector('meta[name="description"]')?.getAttribute('content') ?? null,
    descriptions: document.querySelectorAll('meta[name="description"]').length,
    robots: document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? null,
    generator: document.querySelector('meta[name="generator"]')?.getAttribute('content') ?? null,
    lang: document.documentElement.getAttribute('lang'),
    jsonLd: Array.from(document.head.querySelectorAll('script[type="application/ld+json"]')).map((s) => s.textContent),
    titleInBody: !!document.body.querySelector('title'),
}));

const clickLink = (page: Page, planeID: string, route: string) => page.evaluate(({ planeID, route }) => {
    const link = document.querySelector(`[data-plurid-plane="${planeID}"] [data-plurid-link-route$="${route}"]`) as HTMLElement;
    link.click();
}, { planeID, route });

const waitForHead = (page: Page, predicate: (value: Awaited<ReturnType<typeof head>>) => boolean) =>
    page.waitForFunction((source) => {
        const value = {
            title: document.title,
            titles: document.querySelectorAll('title').length,
            description: document.querySelector('meta[name="description"]')?.getAttribute('content') ?? null,
            descriptions: document.querySelectorAll('meta[name="description"]').length,
            robots: document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? null,
            generator: document.querySelector('meta[name="generator"]')?.getAttribute('content') ?? null,
            lang: document.documentElement.getAttribute('lang'),
            jsonLd: Array.from(document.head.querySelectorAll('script[type="application/ld+json"]')).map((s) => s.textContent),
            titleInBody: !!document.body.querySelector('title'),
        };
        // eslint-disable-next-line no-new-func
        return new Function('value', 'return (' + source + ')(value)')(value);
    }, predicate.toString());


test.describe('the document head', () => {
    test('planes declare the head: one title (the deepest wins), deduped meta, lang, JSON-LD; closing a plane restores the outer layer', async ({ page }) => {
        const errors = collectConsoleErrors(page);
        await openHarness(page, '?document=1&reducedMotion=1');

        await waitForHead(page, (value) => value.title === 'GEOMETRY · rt · plurid');
        let value = await head(page);
        expect(value.titles).toBe(1);
        expect(value.description).toBe('geometry from the plane');
        expect(value.descriptions).toBe(1);
        expect(value.lang).toBe('en-rt');
        expect(value.jsonLd).toEqual(['{"@type":"Thing","name":"geometry"}']);
        expect(value.titleInBody).toBe(false);

        // open the detail plane: its children-form title wins (later render order), the template still applies;
        // its planes[].head description replaces the geometry one (planes layer merges in tree order)
        const root = (await tree(page)).find((node: any) => node.route.endsWith('/geometry'));
        await clickLink(page, root.planeID, '/geometry/detail');
        await waitForHead(page, (value) => value.title === 'DETAIL · rt · plurid');
        value = await head(page);
        expect(value.titles).toBe(1);
        expect(value.robots).toBe('noindex');
        // the detail plane's planes[].head layer is live while it is shown
        expect(value.generator).toBe('detail planes[].head');
        expect(value.descriptions).toBe(1);
        expect(value.description).toBe('geometry from the plane');
        expect(value.titleInBody).toBe(false);

        // close it: the geometry layer is the head again, the detail's meta is withdrawn
        const child = (await tree(page)).find((node: any) => node.route.endsWith('/geometry')).children[0];
        await publish(page, 'space.closePlane', { id: child.planeID });
        await waitForHead(page, (value) => value.title === 'GEOMETRY · rt · plurid' && value.robots === null);
        value = await head(page);
        expect(value.titles).toBe(1);
        expect(value.generator).toBeNull();
        expect(value.jsonLd).toHaveLength(1);
        expect(errors).toEqual([]);
    });

    test('without declarations the document is untouched', async ({ page }) => {
        await openHarness(page, '?reducedMotion=1');
        const value = await head(page);
        expect(value.titles).toBeLessThanOrEqual(1);
        expect(value.jsonLd).toEqual([]);
        expect(value.lang).not.toBe('en-rt');
    });
});
