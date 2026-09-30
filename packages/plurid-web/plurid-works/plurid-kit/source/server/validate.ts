// #region imports
    // #region internal
    import type {
        PluridConfig,
    } from '../index';
    // #endregion internal
// #endregion imports



// #region module
const kindOf = (
    value: unknown,
): string => {
    if (value === undefined) {
        return 'missing';
    }
    if (value === null) {
        return 'null';
    }
    if (Array.isArray(value)) {
        return 'an array';
    }
    return typeof value === 'object'
        ? 'an object'
        : `a ${typeof value}`;
};


/** A React component: a function, or an element type object (`memo`, `forwardRef`, `lazy`). */
export const isComponent = (
    value: unknown,
): boolean => typeof value === 'function'
    || (!!value && typeof value === 'object' && '$$typeof' in (value as object));


/**
 * THE CONFIG, CHECKED WHERE THE SERVER IS MADE (2026-09-29). `defineConfig` is an identity function
 * and the build is esbuild, so nothing type-checks `plurid.config.ts` on its way to production:
 * without `routes` the server booted and every page answered 404; `routes` as an object threw
 * "routes is not iterable" from inside the engine. Every problem found is listed, each with the
 * shape expected.
 */
export const validateConfig = (
    config: PluridConfig,
): void => {
    if (!config || typeof config !== 'object') {
        throw new Error(
            '[plurid-kit] the configuration must be an object: export default defineConfig({ serverName, hostname, routes })',
        );
    }

    const problems: string[] = [];
    const expect = (
        ok: boolean,
        problem: string,
    ) => {
        if (!ok) {
            problems.push(problem);
        }
    };
    const optionalArrayOf = (
        field: keyof PluridConfig,
        check: (item: unknown) => boolean,
        shape: string,
    ) => {
        const value = config[field];
        if (value === undefined) {
            return;
        }
        if (!Array.isArray(value)) {
            problems.push(`\`${String(field)}\` must be an array of ${shape}; it is ${kindOf(value)}`);
            return;
        }
        value.forEach((item, index) => {
            expect(check(item), `\`${String(field)}[${index}]\` must be ${shape}; it is ${kindOf(item)}`);
        });
    };

    if (!Array.isArray(config.routes)) {
        problems.push(
            `\`routes\` must be an array of routes, e.g. [{ value: '/', planes: [['/home', Home]], view: ['/home'] }]; it is ${kindOf(config.routes)}`,
        );
    } else {
        config.routes.forEach((route, index) => {
            expect(
                !!route && typeof route === 'object' && typeof (route as { value?: unknown }).value === 'string',
                `\`routes[${index}]\` must be a route with a path \`value\` (such as '/')`,
            );
        });
    }

    for (const field of ['serverName', 'hostname', 'root', 'publicDir', 'buildDir', 'manifest'] as const) {
        const value = config[field];
        expect(value === undefined || typeof value === 'string', `\`${field}\` must be a string; it is ${kindOf(value)}`);
    }

    optionalArrayOf('planes', (plane) => !!plane && typeof plane === 'object', 'route planes');
    optionalArrayOf(
        'services',
        (service) => !!service
            && typeof (service as { name?: unknown }).name === 'string'
            && (service as { Provider?: unknown }).Provider !== undefined,
        'services ({ name, Provider })',
    );
    optionalArrayOf('middleware', (middleware) => typeof middleware === 'function', 'middleware functions');
    optionalArrayOf('styles', (style) => typeof style === 'string', 'stylesheet hrefs');

    for (const field of ['notFound', 'errorPage'] as const) {
        const value = config[field];
        expect(
            value === undefined || typeof value === 'string' || isComponent(value),
            `\`${field}\` must be a component or a path under the public directory ('/404.html'); it is ${kindOf(value)}`,
        );
    }

    for (const field of ['document', 'handlers'] as const) {
        const value = config[field];
        expect(value === undefined || typeof value === 'function', `\`${field}\` must be a function; it is ${kindOf(value)}`);
    }

    expect(
        config.preserves === undefined || Array.isArray(config.preserves) || typeof config.preserves === 'function',
        `\`preserves\` must be an array of preserves (or a thunk importing one); it is ${kindOf(config.preserves)}`,
    );
    expect(
        config.load === undefined || typeof config.load === 'function' || (!!config.load && typeof config.load === 'object'),
        `\`load\` must be a preserve (or a thunk importing one); it is ${kindOf(config.load)}`,
    );

    if (problems.length > 0) {
        throw new Error(
            '[plurid-kit] the configuration is invalid:\n  - ' + problems.join('\n  - '),
        );
    }
};


/** A resolved server-only value checked: after a thunk ran, what it produced must fit its field. */
export const validateResolved = (
    field: string,
    value: unknown,
    ok: boolean,
    shape: string,
): void => {
    if (!ok) {
        throw new Error(
            `[plurid-kit] the configuration is invalid:\n  - \`${field}\` must be ${shape}; its thunk produced ${kindOf(value)}`,
        );
    }
};
// #endregion module
