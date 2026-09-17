// #region module
/** A mode the space can be in, named for the reader. */
export type PluridMode =
    | 'rotate'
    | 'translate'
    | 'scale'
    | 'grab'
    | 'fly';


/**
 * THE MODE, NAMED. The view carried it as three separate facts (the transform mode, first person,
 * grab) and nothing said which was on: a reader who pressed R by accident had a space that would
 * not read and no word for why. One name, on the view (`data-plurid-mode`), in the badge, and in the
 * live region.
 */
export const modeOf = (
    space: { transformMode?: string; firstPerson?: boolean } | undefined,
    grabMode: boolean,
): PluridMode | undefined => {
    if (space?.firstPerson) {
        return 'fly';
    }
    if (grabMode) {
        return 'grab';
    }
    switch (space?.transformMode) {
        case 'ROTATION':
            return 'rotate';
        case 'TRANSLATION':
            return 'translate';
        case 'SCALE':
            return 'scale';
        default:
            return undefined;
    }
};


export const MODE_LABEL: Record<PluridMode, string> = {
    rotate: 'rotate mode',
    translate: 'move mode',
    scale: 'scale mode',
    grab: 'grab mode',
    fly: 'fly mode',
};

/** how to leave it, in the reader's words */
export const MODE_HINT: Record<PluridMode, string> = {
    rotate: 'esc to leave',
    translate: 'esc to leave',
    scale: 'esc to leave',
    grab: 'esc to leave',
    fly: 'f to leave',
};
// #endregion module
