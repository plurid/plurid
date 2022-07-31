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
    viewcubeBack: 'वापस',
    viewcubeLeft: 'बाएं',
    viewcubeRight: 'सही',
    viewcubeTop: 'ऊपर',
    viewcubeBase: 'आधार',

    toolbarTransformRotate: 'घुमाएँ',
    toolbarTransformScale: 'स्केल',
    toolbarTransformTranslate: 'अनुवाद करना',

    toolbarDrawerGlobalTitle: 'वैश्विक',
    toolbarDrawerGlobalGeneralTheme: 'सामान्य विषय',
    toolbarDrawerGlobalInteractionTheme: 'बातचीत का विषय',
    toolbarDrawerGlobalLanguage: 'भाषा',

    toolbarDrawerTransformTitle: 'परिवर्तन',
    toolbarDrawerTransformMultiModeTransform: 'बहु मोड परिवर्तन',
    toolbarDrawerTransformAllowRotationX: 'रोटेशन एक्स की अनुमति दें',
    toolbarDrawerTransformAllowRotationY: 'रोटेशन की अनुमति दें',
    toolbarDrawerTransformAllowTranslationX: 'अनुवाद x की अनुमति दें',
    toolbarDrawerTransformAllowTranslationY: 'अनुवाद की अनुमति दें',
    toolbarDrawerTransformAllowTranslationZ: 'अनुवाद की अनुमति दें z',
    toolbarDrawerTransformAllowScale: 'पैमाने की अनुमति दें',
    toolbarDrawerTransformTouchTransform: 'स्पर्श परिवर्तन',

    toolbarDrawerSpaceTitle: 'अंतरिक्ष',
    toolbarDrawerSpaceTransparentUserInterface: 'पारदर्शी यूजर इंटरफेस',
    toolbarDrawerSpaceShowTransformOrigin: 'परिवर्तन मूल दिखाएँ',
    toolbarDrawerSpaceTransformOriginSize: 'मूल आकार बदलना',
    toolbarDrawerSpacePlaneOpacity: 'विमान की अस्पष्टता',
    toolbarDrawerSpaceLayoutType: 'लेआउट प्रकार',

    toolbarDrawerToolbarTitle: 'उपकरण पट्टी',
    toolbarDrawerToolbarAlwaysOpaque: 'हमेशा अपारदर्शी',
    toolbarDrawerToolbarShowTransformIcons: 'तब्दील प्रतीक दिखाओ',
    toolbarDrawerToolbarShowTransformArrows: 'दिखाएँ तीर',
    toolbarDrawerToolbarConcealToolbar: 'छिपाना टूलबार',

    toolbarDrawerViewcubeTitle: 'घनक्षेत्र',
    toolbarDrawerViewcubeShowViewcube: 'घन दिखाना',
    toolbarDrawerViewcubeShowTransformButtons: 'शो ट्रांसफॉर्म बटन',
    toolbarDrawerViewcubeAlwaysOpaque: 'हमेशा अपारदर्शी',
    toolbarDrawerViewcubeConcealViewcube: 'घन छिपाना',

    toolbarDrawerTechnicalTitle: 'तकनीकी',
    toolbarDrawerTechnicalCullingDistance: 'कलिंग दूरी',

    toolbarDrawerShortcutsTitle: 'शॉर्टकट',
    toolbarDrawerShortcutsToggleFirstPerson: 'पहले व्यक्ति को टॉगल करें',
    toolbarDrawerShortcutsMoveForward: 'आगे बढ़ो',
    toolbarDrawerShortcutsMoveBackward: 'पीछे की ओर जाएं',
    toolbarDrawerShortcutsMoveLeft: 'बाएं खिसको',
    toolbarDrawerShortcutsMoveRight: 'दाएँ चले',
    toolbarDrawerShortcutsMoveUp: 'बढ़ाना',
    toolbarDrawerShortcutsMoveDown: 'नीचे की ओर',
    toolbarDrawerShortcutsTurnLeft: 'बांए मुड़िए',
    toolbarDrawerShortcutsTurnRight: 'दायें मुड़ो',
    toolbarDrawerShortcutsTurnUp: 'ऊपर करो',
    toolbarDrawerShortcutsTurnDown: 'मना करना',
    toolbarDrawerShortcutsRotateUp: 'बारी बारी से',
    toolbarDrawerShortcutsRotateDown: 'नीचे घुमाओ',
    toolbarDrawerShortcutsRotateLeft: 'बायीं ओर घुमाओ',
    toolbarDrawerShortcutsRotateRight: 'दाएं घुमाएं',
    toolbarDrawerShortcutsToggleRotate: 'घुमाना',
    toolbarDrawerShortcutsTranslateUp: 'अनुवाद करना',
    toolbarDrawerShortcutsTranslateDown: 'नीचे अनुवाद करें',
    toolbarDrawerShortcutsTranslateLeft: 'अनुवाद छोड़ दिया',
    toolbarDrawerShortcutsTranslateRight: 'सही अनुवाद करें',
    toolbarDrawerShortcutsTranslateIn: 'में अनुवाद करें',
    toolbarDrawerShortcutsTranslateOut: 'अनुवाद करें',
    toolbarDrawerShortcutsToggleTranslate: 'अनुवाद टॉगल करें',
    toolbarDrawerShortcutsScaleUp: 'स्केल अप',
    toolbarDrawerShortcutsScaleDown: 'घटाना',
    toolbarDrawerShortcutsToggleScale: 'टॉगल स्केल',
    toolbarDrawerShortcutsFocusPlane: 'फोकस प्लेन',
    toolbarDrawerShortcutsFocusParent: 'ध्यान माता-पिता',
    toolbarDrawerShortcutsRefreshPlane: 'ताज़ा विमान',
    toolbarDrawerShortcutsIsolatePlane: 'अलग विमान',
    toolbarDrawerShortcutsOpenClosedPlane: 'खुला बंद विमान',
    toolbarDrawerShortcutsClosePlane: 'बंद विमान',

    toolbarDrawerShortcutsArrowOrScrollUp: '↑ या स्क्रॉल करें',
    toolbarDrawerShortcutsArrowOrScrollDown: '↓ या नीचे स्क्रॉल करें',
    toolbarDrawerShortcutsArrowOrScrollLeft: '← या बाईं ओर स्क्रॉल करें',
    toolbarDrawerShortcutsArrowOrScrollRight: '→ या दाईं ओर स्क्रॉल करें',
};
// #endregion module



// #region exports
export default hindi;
// #endregion exports
