// #region imports
    // #region external
    import {
        InternationalizationFields,
    } from '../../interfaces/internal/internationalization';
    // #endregion external
// #endregion imports



// #region module
const internationalizationFields: InternationalizationFields = {
    viewcubeFront: 'viewcubeFront',
    viewcubeBack: 'viewcubeBack',
    viewcubeLeft: 'viewcubeLeft',
    viewcubeRight: 'viewcubeRight',
    viewcubeTop: 'viewcubeTop',
    viewcubeBase: 'viewcubeBase',

    toolbarTransformRotate: 'toolbarTransformRotate',
    toolbarTransformScale: 'toolbarTransformScale',
    toolbarTransformTranslate: 'toolbarTransformTranslate',

    toolbarDrawerGlobalTitle: 'toolbarDrawerGlobalTitle',
    toolbarDrawerGlobalGeneralTheme: 'toolbarDrawerGlobalGeneralTheme',
    toolbarDrawerGlobalInteractionTheme: 'toolbarDrawerGlobalInteractionTheme',
    toolbarDrawerGlobalLanguage: 'toolbarDrawerGlobalLanguage',

    toolbarDrawerTransformTitle: 'toolbarDrawerTransformTitle',
    toolbarDrawerTransformMultiModeTransform: 'toolbarDrawerTransformMultiModeTransform',
    toolbarDrawerTransformAllowRotationX: 'toolbarDrawerTransformAllowRotationX',
    toolbarDrawerTransformAllowRotationY: 'toolbarDrawerTransformAllowRotationY',
    toolbarDrawerTransformAllowTranslationX: 'toolbarDrawerTransformAllowTranslationX',
    toolbarDrawerTransformAllowTranslationY: 'toolbarDrawerTransformAllowTranslationY',
    toolbarDrawerTransformAllowTranslationZ: 'toolbarDrawerTransformAllowTranslationZ',
    toolbarDrawerTransformAllowScale: 'toolbarDrawerTransformAllowScale',
    toolbarDrawerTransformTouchTransform: 'toolbarDrawerTransformTouchTransform',

    toolbarDrawerSpaceTitle: 'toolbarDrawerSpaceTitle',
    toolbarDrawerSpaceTransparentUserInterface: 'toolbarDrawerSpaceTransparentUserInterface',
    toolbarDrawerSpaceShowTransformOrigin: 'toolbarDrawerSpaceShowTransformOrigin',
    toolbarDrawerSpaceTransformOriginSize: 'toolbarDrawerSpaceTransformOriginSize',
    toolbarDrawerSpacePlaneOpacity: 'toolbarDrawerSpacePlaneOpacity',
    toolbarDrawerSpaceLayoutType: 'toolbarDrawerSpaceLayoutType',

    toolbarDrawerToolbarTitle: 'toolbarDrawerToolbarTitle',
    toolbarDrawerToolbarAlwaysOpaque: 'toolbarDrawerToolbarAlwaysOpaque',
    toolbarDrawerToolbarShowTransformIcons: 'toolbarDrawerToolbarShowTransformIcons',
    toolbarDrawerToolbarShowTransformArrows: 'toolbarDrawerToolbarShowTransformArrows',
    toolbarDrawerToolbarConcealToolbar: 'toolbarDrawerToolbarConcealToolbar',

    toolbarDrawerViewcubeTitle: 'toolbarDrawerViewcubeTitle',
    toolbarDrawerViewcubeShowViewcube: 'toolbarDrawerViewcubeShowViewcube',
    toolbarDrawerViewcubeShowTransformButtons: 'toolbarDrawerViewcubeShowTransformButtons',
    toolbarDrawerViewcubeAlwaysOpaque: 'toolbarDrawerViewcubeAlwaysOpaque',
    toolbarDrawerViewcubeConcealViewcube: 'toolbarDrawerViewcubeConcealViewcube',

    toolbarDrawerTechnicalTitle: 'toolbarDrawerTechnicalTitle',
    toolbarDrawerTechnicalCullingDistance: 'toolbarDrawerTechnicalCullingDistance',

    toolbarDrawerShortcutsTitle: 'toolbarDrawerShortcutsTitle',
    toolbarDrawerShortcutsToggleFirstPerson: 'toolbarDrawerShortcutsToggleFirstPerson',
    toolbarDrawerShortcutsMoveForward: 'toolbarDrawerShortcutsMoveForward',
    toolbarDrawerShortcutsMoveBackward: 'toolbarDrawerShortcutsMoveBackward',
    toolbarDrawerShortcutsMoveLeft: 'toolbarDrawerShortcutsMoveLeft',
    toolbarDrawerShortcutsMoveRight: 'toolbarDrawerShortcutsMoveRight',
    toolbarDrawerShortcutsMoveUp: 'toolbarDrawerShortcutsMoveUp',
    toolbarDrawerShortcutsMoveDown: 'toolbarDrawerShortcutsMoveDown',
    toolbarDrawerShortcutsTurnLeft: 'toolbarDrawerShortcutsTurnLeft',
    toolbarDrawerShortcutsTurnRight: 'toolbarDrawerShortcutsTurnRight',
    toolbarDrawerShortcutsTurnUp: 'toolbarDrawerShortcutsTurnUp',
    toolbarDrawerShortcutsTurnDown: 'toolbarDrawerShortcutsTurnDown',
    toolbarDrawerShortcutsRotateUp: 'toolbarDrawerShortcutsRotateUp',
    toolbarDrawerShortcutsRotateDown: 'toolbarDrawerShortcutsRotateDown',
    toolbarDrawerShortcutsRotateLeft: 'toolbarDrawerShortcutsRotateLeft',
    toolbarDrawerShortcutsRotateRight: 'toolbarDrawerShortcutsRotateRight',
    toolbarDrawerShortcutsToggleRotate: 'toolbarDrawerShortcutsToggleRotate',
    toolbarDrawerShortcutsTranslateUp: 'toolbarDrawerShortcutsTranslateUp',
    toolbarDrawerShortcutsTranslateDown: 'toolbarDrawerShortcutsTranslateDown',
    toolbarDrawerShortcutsTranslateLeft: 'toolbarDrawerShortcutsTranslateLeft',
    toolbarDrawerShortcutsTranslateRight: 'toolbarDrawerShortcutsTranslateRight',
    toolbarDrawerShortcutsTranslateIn: 'toolbarDrawerShortcutsTranslateIn',
    toolbarDrawerShortcutsTranslateOut: 'toolbarDrawerShortcutsTranslateOut',
    toolbarDrawerShortcutsToggleTranslate: 'toolbarDrawerShortcutsToggleTranslate',
    toolbarDrawerShortcutsScaleUp: 'toolbarDrawerShortcutsScaleUp',
    toolbarDrawerShortcutsScaleDown: 'toolbarDrawerShortcutsScaleDown',
    toolbarDrawerShortcutsToggleScale: 'toolbarDrawerShortcutsToggleScale',
    toolbarDrawerShortcutsFocusPlane: 'toolbarDrawerShortcutsFocusPlane',
    toolbarDrawerShortcutsFocusParent: 'toolbarDrawerShortcutsFocusParent',

    toolbarDrawerShortcutsArrowOrScrollUp: 'toolbarDrawerShortcutsArrowOrScrollUp',
    toolbarDrawerShortcutsArrowOrScrollDown: 'toolbarDrawerShortcutsArrowOrScrollDown',
    toolbarDrawerShortcutsArrowOrScrollLeft: 'toolbarDrawerShortcutsArrowOrScrollLeft',
    toolbarDrawerShortcutsArrowOrScrollRight: 'toolbarDrawerShortcutsArrowOrScrollRight',
}
// #endregion module



// #region exports
export default internationalizationFields;
// #endregion exports
