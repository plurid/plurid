/// <reference types="immer" />
// ^ Type-only reference (NOT a runtime `import 'immer'`): this package exports its RTK
// `createSlice` factories directly, whose inferred types reference immer's `WritableDraft`.
// Without immer in the program TS can't name those types in the emitted `.d.ts` (TS2742).
// A reference directive pulls in the types with zero runtime footprint — unlike the old
// `import 'immer'` side-effect import, it's safe under `"sideEffects": false`.

// #region exports
export * from './data/interfaces';

export * from './modules';

// Re-export the per-slice State types at the top level so downstream packages
// (e.g. plurid-ui-components-react) can NAME them when re-exporting values typed
// by them — otherwise they're only reachable via the namespace (e.g. head.HeadState)
// and TS can't emit the declaration (TS4023 / TS4082).
export type { HeadState } from './modules/head';
export type { ThemesState } from './modules/themes';
export type { NotificationsState } from './modules/notifications';
export type { ShortcutsState } from './modules/shortcuts';
export type { SittingState } from './modules/sitting';
// #endregion exports
