// #region imports
    // #region external
    import modules from '~services/state/modules';
    // #endregion external
// #endregion imports



// #region exports
export default {
    configuration: modules.configuration.actions,
    general: modules.general.actions,
    shortcuts: modules.shortcuts.actions,
    space: modules.space.actions,
    themes: modules.themes.actions,
    ui: modules.ui.actions,
};
// #endregion exports
