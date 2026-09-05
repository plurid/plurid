import { SPACE_LAYOUT } from '@plurid/plurid-react';
import type { LayoutKey } from './flags';

/**
 * Each layout reads different fields off `configuration.space.layout`. Typed loosely so the harness
 * can flip between them without fighting the config union. The labels are the panel's button
 * names (a scenario clicks `getByRole('button', { name: 'ROWS' })`).
 */
export const LAYOUTS: { key: LayoutKey; label: string; layout: any }[] = [
    { key: 'columns', label: 'COLUMNS', layout: { type: SPACE_LAYOUT.COLUMNS, columns: 3, gap: 0.06 } },
    { key: 'rows', label: 'ROWS', layout: { type: SPACE_LAYOUT.ROWS, rows: 1, gap: 0.06 } },
    { key: 'sheaves', label: 'SHEAVES', layout: { type: SPACE_LAYOUT.SHEAVES, depth: 0.5, offsetX: 60, offsetY: 42 } },
    { key: 'faceToFace', label: 'FACE·TO·FACE', layout: { type: SPACE_LAYOUT.FACE_TO_FACE, angle: 38, gap: 0.08, middle: true } },
    { key: 'zigZag', label: 'ZIG·ZAG', layout: { type: SPACE_LAYOUT.ZIG_ZAG, angle: 30, columns: 3, gap: 0.06 } },
];

/** The stress set packs into 8 columns. */
export const STRESS_LAYOUT = { type: SPACE_LAYOUT.COLUMNS, columns: 8, gap: 0.04 };

export const layoutByKey = (
    key: LayoutKey,
    stress: boolean,
): any => (stress ? STRESS_LAYOUT : (LAYOUTS.find((layout) => layout.key === key) ?? LAYOUTS[0]).layout);
