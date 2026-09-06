// #region imports
    // #region external
    import {
        Answers,
        Language,
        UI,
        Renderer,
        Manager,
        Versioning,
    } from '~data/interfaces';
    import {
        language as languageTypes,
        ui as uiTypes,
        renderer as rendererTypes,
        manager as managerTypes,
        versioning as versioningTypes,
        services as serviceTypes,
    } from '~data/constants';
    // #endregion external
// #endregion imports



// #region module
export interface NormalizedAnswers {
    directory: string;
    language: Language;
    ui: UI;
    renderer: Renderer;
    manager: Manager;
    services: string[];
    versioning: Versioning;
    containerize: boolean;
    deployment: boolean;
}

/** The CLI spellings and the interactive choices, each to its internal service name. */
const SERVICE_SPELLINGS: Record<string, string> = {
    graphql: serviceTypes.apollo,
    apollo: serviceTypes.apollo,
    redux: serviceTypes.redux,
    stripe: serviceTypes.stripe,
};

const pick = <T extends string>(
    name: string,
    value: unknown,
    choices: T[],
    fallback?: T,
): T => {
    if (value === undefined || value === null || value === '') {
        if (fallback !== undefined) {
            return fallback;
        }
        throw new Error(`${name} must be one of ${choices.join(', ')}.`);
    }
    const spelled = String(value).trim().toLowerCase();
    const match = choices.find((choice) => choice.toLowerCase() === spelled);
    if (!match) {
        throw new Error(`Unsupported ${name} "${String(value)}"; use one of ${choices.join(', ')}.`);
    }
    return match;
};

/**
 * Parse `services` from either form — the interactive checklist (an array of internal names) or the
 * `--services` flag (a comma-separated string, any case, `graphql` for Apollo) — into the internal
 * vocabulary; unknown names are an error (C11, 2026-09-06: Commander handed the default as a STRING
 * and `services.reduce` threw before generation).
 */
export const normalizeServices = (
    value: unknown,
): string[] => {
    const raw: unknown[] = Array.isArray(value)
        ? value
        : typeof value === 'string'
            ? value.split(',')
            : [];
    const known = Object.values(serviceTypes) as string[];
    const result: string[] = [];
    for (const item of raw) {
        const spelled = String(item).trim();
        if (!spelled) {
            continue;
        }
        const internal = SERVICE_SPELLINGS[spelled.toLowerCase()]
            ?? known.find((service) => service.toLowerCase() === spelled.toLowerCase());
        if (!internal) {
            throw new Error(`Unsupported service "${spelled}"; use any of ${Object.keys(SERVICE_SPELLINGS).join(', ')}.`);
        }
        if (!result.includes(internal)) {
            result.push(internal);
        }
    }
    return result;
};

/**
 * THE ONE normalization of the answers, whichever path produced them. Every choice is validated
 * against the vocabulary; an unsupported one is an error the caller reports with a nonzero exit.
 * Only React is implemented today, so another UI engine is refused rather than silently swapped.
 */
export const normalizeAnswers = (
    answers: Omit<Partial<Answers>, 'services'> & { services?: unknown },
): NormalizedAnswers => {
    if (!answers.directory) {
        throw new Error('The application directory (-d, --directory) must be specified.');
    }
    const ui = pick('ui', answers.ui, Object.values(uiTypes) as UI[], uiTypes.react);
    if (ui !== uiTypes.react) {
        throw new Error(`The ${ui} generator is not implemented yet; only ${uiTypes.react} is.`);
    }
    return {
        directory: answers.directory,
        language: pick('language', answers.language, Object.values(languageTypes) as Language[], languageTypes.typescript),
        ui,
        renderer: pick('renderer', answers.renderer, Object.values(rendererTypes) as Renderer[], rendererTypes.client),
        manager: pick('manager', answers.manager, Object.values(managerTypes) as Manager[], managerTypes.npm),
        services: normalizeServices(answers.services),
        versioning: pick('versioning', answers.versioning, Object.values(versioningTypes) as Versioning[], versioningTypes.none),
        containerize: !!answers.containerize,
        deployment: !!answers.deployment,
    };
};
// #endregion module
