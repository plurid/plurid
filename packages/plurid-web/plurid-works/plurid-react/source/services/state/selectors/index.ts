// #region imports
    // #region external
    import modules from '~services/state/modules';
    // #endregion external
// #endregion imports



// #region exports
export default {
    configuration: modules.configuration.selectors,
    space: modules.space.selectors,
    themes: modules.themes.selectors,
    ui: modules.ui.selectors,
};
// #endregion exports
