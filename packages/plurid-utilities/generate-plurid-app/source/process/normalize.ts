// #region imports
    // #region external
    import {
        Answers,
        Manager,
        Versioning,
    } from '~data/interfaces';
    import {
        manager as managerTypes,
        versioning as versioningTypes,
    } from '~data/constants';
    // #endregion external
// #endregion imports



// #region module
export interface NormalizedAnswers {
    directory: string;
    manager: Manager;
    versioning: Versioning;
    install: boolean;
}

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

/** The kit's shape is TypeScript + React: another language or UI engine is refused, never silently swapped. */
const refuse = (
    name: string,
    value: unknown,
    accepted: string,
) => {
    if (value === undefined || value === null || value === '') {
        return;
    }
    if (String(value).trim().toLowerCase() !== accepted.toLowerCase()) {
        throw new Error(`The generator emits ${accepted} only (the kit's shape); "${String(value)}" is not supported as the ${name}.`);
    }
};

/**
 * THE ONE normalization of the answers, whichever path produced them. Every choice is validated
 * against the vocabulary; an unsupported one is an error the caller reports with a nonzero exit.
 */
export const normalizeAnswers = (
    answers: Partial<Answers> & { language?: unknown; ui?: unknown; renderer?: unknown },
): NormalizedAnswers => {
    if (!answers.directory) {
        throw new Error('The application directory (-d, --directory) must be specified.');
    }
    refuse('language', answers.language, 'TypeScript');
    refuse('ui', answers.ui, 'React');
    return {
        directory: answers.directory,
        manager: pick('manager', answers.manager, Object.values(managerTypes) as Manager[], managerTypes.npm),
        versioning: pick('versioning', answers.versioning, Object.values(versioningTypes) as Versioning[], versioningTypes.none),
        install: answers.install !== false,
    };
};

/** An npm-safe package name from the directory's base name. */
export const packageNameOf = (
    directory: string,
): string => {
    const base = directory.replace(/[\\/]+$/, '').split(/[\\/]/).pop() || 'plurid-app';
    const name = base.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^[._-]+|[._-]+$/g, '');
    return name || 'plurid-app';
};
// #endregion module
