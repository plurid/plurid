// #region exports
/**
 * The rest the agent waits for moved to `services/logic/rest` (2026-10-30), where the handle's
 * `whenAtRest` and the tours read it too; this path re-exports it for an importer of the old one.
 */
export {
    waitForRest,
} from '~services/logic/rest';
export type {
    PluridRestSource as PluridAgentSettleSource,
} from '~services/logic/rest';
// #endregion exports
