// #region imports
    // #region exports
    import {
        Internationalization,
    } from '../../../interfaces/external/internationalization';
    // #endregion exports
// #endregion imports



// #region module
const hindi: Internationalization = {
    viewcubeFront: 'सामने',
    viewcubeBack: 'पीछे',
    viewcubeLeft: 'बाएँ',
    viewcubeRight: 'दाएँ',
    viewcubeTop: 'ऊपर',
    viewcubeBase: 'नीचे',

    toolbarTransformRotate: 'घुमाव',
    toolbarTransformScale: 'स्केल',
    toolbarTransformTranslate: 'स्थानांतरण',

    toolbarDrawerGlobalTitle: 'सामान्य',
    toolbarDrawerGlobalGeneralTheme: 'सामान्य थीम',
    toolbarDrawerGlobalInteractionTheme: 'इंटरैक्शन थीम',
    toolbarDrawerGlobalLanguage: 'भाषा',

    toolbarDrawerTransformTitle: 'रूपांतरण',
    toolbarDrawerTransformMultiModeTransform: 'बहु-मोड रूपांतरण',
    toolbarDrawerTransformAllowRotationX: 'x घुमाव की अनुमति',
    toolbarDrawerTransformAllowRotationY: 'y घुमाव की अनुमति',
    toolbarDrawerTransformAllowTranslationX: 'x स्थानांतरण की अनुमति',
    toolbarDrawerTransformAllowTranslationY: 'y स्थानांतरण की अनुमति',
    toolbarDrawerTransformAllowTranslationZ: 'z स्थानांतरण की अनुमति',
    toolbarDrawerTransformAllowScale: 'स्केल की अनुमति',
    toolbarDrawerTransformTouchTransform: 'स्पर्श रूपांतरण',

    toolbarDrawerSpaceTitle: 'स्थान',
    toolbarDrawerSpaceTransparentUserInterface: 'पारदर्शी इंटरफ़ेस',
    toolbarDrawerSpaceShowTransformOrigin: 'रूपांतरण मूल दिखाएँ',
    toolbarDrawerSpaceTransformOriginSize: 'मूल का आकार',
    toolbarDrawerSpacePlaneOpacity: 'तल की अपारदर्शिता',
    toolbarDrawerSpaceLayoutType: 'लेआउट प्रकार',

    toolbarDrawerToolbarTitle: 'टूलबार',
    toolbarDrawerToolbarAlwaysOpaque: 'हमेशा अपारदर्शी',
    toolbarDrawerToolbarShowTransformIcons: 'रूपांतरण चिह्न दिखाएँ',
    toolbarDrawerToolbarShowTransformArrows: 'रूपांतरण तीर दिखाएँ',
    toolbarDrawerToolbarConcealToolbar: 'टूलबार छिपाएँ',

    toolbarDrawerViewcubeTitle: 'व्यू क्यूब',
    toolbarDrawerViewcubeShowViewcube: 'क्यूब दिखाएँ',
    toolbarDrawerViewcubeShowTransformButtons: 'रूपांतरण बटन दिखाएँ',
    toolbarDrawerViewcubeAlwaysOpaque: 'हमेशा अपारदर्शी',
    toolbarDrawerViewcubeConcealViewcube: 'क्यूब छिपाएँ',

    toolbarDrawerMinimapTitle: 'मिनीमैप',
    toolbarDrawerMinimapShowMinimap: 'मिनीमैप दिखाएँ',
    toolbarDrawerMinimapTransparent: 'पारदर्शी',

    toolbarDrawerTechnicalTitle: 'तकनीकी',
    toolbarDrawerTechnicalCullingDistance: 'कलिंग दूरी',

    toolbarDrawerShortcutsTitle: 'शॉर्टकट',
    toolbarDrawerHistoryTitle: 'इतिहास',
    toolbarDrawerBookmarksTitle: 'बुकमार्क',
    toolbarDrawerShortcutsToggleFirstPerson: 'प्रथम पुरुष टॉगल करें',
    toolbarDrawerShortcutsMoveForward: 'आगे बढ़ें',
    toolbarDrawerShortcutsMoveBackward: 'पीछे जाएँ',
    toolbarDrawerShortcutsMoveLeft: 'बाएँ जाएँ',
    toolbarDrawerShortcutsMoveRight: 'दाएँ जाएँ',
    toolbarDrawerShortcutsMoveUp: 'ऊपर जाएँ',
    toolbarDrawerShortcutsMoveDown: 'नीचे जाएँ',
    toolbarDrawerShortcutsTurnLeft: 'बाएँ मुड़ें',
    toolbarDrawerShortcutsTurnRight: 'दाएँ मुड़ें',
    toolbarDrawerShortcutsTurnUp: 'ऊपर मुड़ें',
    toolbarDrawerShortcutsTurnDown: 'नीचे मुड़ें',
    toolbarDrawerShortcutsRotateUp: 'ऊपर घुमाएँ',
    toolbarDrawerShortcutsRotateDown: 'नीचे घुमाएँ',
    toolbarDrawerShortcutsRotateLeft: 'बाएँ घुमाएँ',
    toolbarDrawerShortcutsRotateRight: 'दाएँ घुमाएँ',
    toolbarDrawerShortcutsToggleRotate: 'घुमाव टॉगल करें',
    toolbarDrawerShortcutsTranslateUp: 'ऊपर खिसकाएँ',
    toolbarDrawerShortcutsTranslateDown: 'नीचे खिसकाएँ',
    toolbarDrawerShortcutsTranslateLeft: 'बाएँ खिसकाएँ',
    toolbarDrawerShortcutsTranslateRight: 'दाएँ खिसकाएँ',
    toolbarDrawerShortcutsTranslateIn: 'अंदर खिसकाएँ',
    toolbarDrawerShortcutsTranslateOut: 'बाहर खिसकाएँ',
    toolbarDrawerShortcutsToggleTranslate: 'स्थानांतरण टॉगल करें',
    toolbarDrawerShortcutsScaleUp: 'बड़ा करें',
    toolbarDrawerShortcutsScaleDown: 'छोटा करें',
    toolbarDrawerShortcutsToggleScale: 'स्केल टॉगल करें',

    toolbarDrawerShortcutsFocusPlane: 'तल फोकस करें',
    toolbarDrawerShortcutsFocusParent: 'जनक तल फोकस करें',
    toolbarDrawerShortcutsRefreshPlane: 'तल ताज़ा करें',
    toolbarDrawerShortcutsIsolatePlane: 'तल अलग करें',
    toolbarDrawerShortcutsOpenClosedPlane: 'बंद तल खोलें',
    toolbarDrawerShortcutsClosePlane: 'तल बंद करें',
    toolbarDrawerShortcutsPreviousRoot: 'पिछली जड़',
    toolbarDrawerShortcutsNextRoot: 'अगली जड़',
    toolbarDrawerShortcutsFocusRoot: 'जड़ फोकस करें',

    toolbarDrawerShortcutsArrowOrScrollUp: '↑ या ऊपर स्क्रॉल',
    toolbarDrawerShortcutsArrowOrScrollDown: '↓ या नीचे स्क्रॉल',
    toolbarDrawerShortcutsArrowOrScrollLeft: '← या बाएँ स्क्रॉल',
    toolbarDrawerShortcutsArrowOrScrollRight: '→ या दाएँ स्क्रॉल',
};
// #endregion module



// #region exports
export default hindi;
// #endregion exports
