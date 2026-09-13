// #region imports
    // #region exports
    import {
        Internationalization,
    } from '../../../interfaces/external/internationalization';
    // #endregion exports
// #endregion imports



// #region module
const arabic: Internationalization = {
    viewcubeFront: 'الأمام',
    viewcubeBack: 'الخلف',
    viewcubeLeft: 'اليسار',
    viewcubeRight: 'اليمين',
    viewcubeTop: 'الأعلى',
    viewcubeBase: 'الأسفل',

    toolbarTransformRotate: 'تدوير',
    toolbarTransformScale: 'تحجيم',
    toolbarTransformTranslate: 'إزاحة',

    toolbarDrawerGlobalTitle: 'عام',
    toolbarDrawerGlobalGeneralTheme: 'السمة العامة',
    toolbarDrawerGlobalInteractionTheme: 'سمة التفاعل',
    toolbarDrawerGlobalLanguage: 'اللغة',

    toolbarDrawerTransformTitle: 'التحويل',
    toolbarDrawerTransformMultiModeTransform: 'تحويل متعدد الأوضاع',
    toolbarDrawerTransformAllowRotationX: 'السماح بالتدوير x',
    toolbarDrawerTransformAllowRotationY: 'السماح بالتدوير y',
    toolbarDrawerTransformAllowTranslationX: 'السماح بالإزاحة x',
    toolbarDrawerTransformAllowTranslationY: 'السماح بالإزاحة y',
    toolbarDrawerTransformAllowTranslationZ: 'السماح بالإزاحة z',
    toolbarDrawerTransformAllowScale: 'السماح بالتحجيم',
    toolbarDrawerTransformTouchTransform: 'التحويل باللمس',

    toolbarDrawerSpaceTitle: 'الفضاء',
    toolbarDrawerSpaceTransparentUserInterface: 'واجهة شفافة',
    toolbarDrawerSpaceShowTransformOrigin: 'إظهار نقطة الأصل',
    toolbarDrawerSpaceTransformOriginSize: 'حجم نقطة الأصل',
    toolbarDrawerSpacePlaneOpacity: 'شفافية المستوى',
    toolbarDrawerSpaceLayoutType: 'نوع التخطيط',

    toolbarDrawerToolbarTitle: 'شريط الأدوات',
    toolbarDrawerToolbarAlwaysOpaque: 'معتم دائمًا',
    toolbarDrawerToolbarShowTransformIcons: 'إظهار أيقونات التحويل',
    toolbarDrawerToolbarShowTransformArrows: 'إظهار أسهم التحويل',
    toolbarDrawerToolbarConcealToolbar: 'إخفاء شريط الأدوات',

    toolbarDrawerViewcubeTitle: 'مكعب العرض',
    toolbarDrawerViewcubeShowViewcube: 'إظهار المكعب',
    toolbarDrawerViewcubeShowTransformButtons: 'إظهار أزرار التحويل',
    toolbarDrawerViewcubeAlwaysOpaque: 'معتم دائمًا',
    toolbarDrawerViewcubeConcealViewcube: 'إخفاء المكعب',

    toolbarDrawerMinimapTitle: 'الخريطة المصغرة',
    toolbarDrawerMinimapShowMinimap: 'إظهار الخريطة المصغرة',
    toolbarDrawerMinimapTransparent: 'شفافة',

    toolbarDrawerTechnicalTitle: 'تقني',
    toolbarDrawerTechnicalCullingDistance: 'مسافة الإخفاء',

    toolbarDrawerShortcutsTitle: 'الاختصارات',
    toolbarDrawerHistoryTitle: 'السجل',
    toolbarDrawerBookmarksTitle: 'العلامات المرجعية',
    toolbarDrawerShortcutsToggleFirstPerson: 'تبديل منظور الشخص الأول',
    toolbarDrawerShortcutsMoveForward: 'التحرك للأمام',
    toolbarDrawerShortcutsMoveBackward: 'التحرك للخلف',
    toolbarDrawerShortcutsMoveLeft: 'التحرك يسارًا',
    toolbarDrawerShortcutsMoveRight: 'التحرك يمينًا',
    toolbarDrawerShortcutsMoveUp: 'التحرك للأعلى',
    toolbarDrawerShortcutsMoveDown: 'التحرك للأسفل',
    toolbarDrawerShortcutsTurnLeft: 'الالتفات يسارًا',
    toolbarDrawerShortcutsTurnRight: 'الالتفات يمينًا',
    toolbarDrawerShortcutsTurnUp: 'الالتفات للأعلى',
    toolbarDrawerShortcutsTurnDown: 'الالتفات للأسفل',
    toolbarDrawerShortcutsRotateUp: 'التدوير للأعلى',
    toolbarDrawerShortcutsRotateDown: 'التدوير للأسفل',
    toolbarDrawerShortcutsRotateLeft: 'التدوير يسارًا',
    toolbarDrawerShortcutsRotateRight: 'التدوير يمينًا',
    toolbarDrawerShortcutsToggleRotate: 'تبديل التدوير',
    toolbarDrawerShortcutsTranslateUp: 'الإزاحة للأعلى',
    toolbarDrawerShortcutsTranslateDown: 'الإزاحة للأسفل',
    toolbarDrawerShortcutsTranslateLeft: 'الإزاحة يسارًا',
    toolbarDrawerShortcutsTranslateRight: 'الإزاحة يمينًا',
    toolbarDrawerShortcutsTranslateIn: 'الإزاحة للداخل',
    toolbarDrawerShortcutsTranslateOut: 'الإزاحة للخارج',
    toolbarDrawerShortcutsToggleTranslate: 'تبديل الإزاحة',
    toolbarDrawerShortcutsScaleUp: 'تكبير',
    toolbarDrawerShortcutsScaleDown: 'تصغير',
    toolbarDrawerShortcutsToggleScale: 'تبديل التحجيم',

    toolbarDrawerShortcutsFocusPlane: 'تركيز المستوى',
    toolbarDrawerShortcutsFocusParent: 'تركيز المستوى الأب',
    toolbarDrawerShortcutsRefreshPlane: 'تحديث المستوى',
    toolbarDrawerShortcutsIsolatePlane: 'عزل المستوى',
    toolbarDrawerShortcutsOpenClosedPlane: 'فتح مستوى مغلق',
    toolbarDrawerShortcutsClosePlane: 'إغلاق المستوى',
    toolbarDrawerShortcutsPreviousRoot: 'الجذر السابق',
    toolbarDrawerShortcutsNextRoot: 'الجذر التالي',
    toolbarDrawerShortcutsFocusRoot: 'تركيز الجذر',

    toolbarDrawerShortcutsArrowOrScrollUp: '↑ أو التمرير للأعلى',
    toolbarDrawerShortcutsArrowOrScrollDown: '↓ أو التمرير للأسفل',
    toolbarDrawerShortcutsArrowOrScrollLeft: '← أو التمرير يسارًا',
    toolbarDrawerShortcutsArrowOrScrollRight: '→ أو التمرير يمينًا',
};
// #endregion module



// #region exports
export default arabic;
// #endregion exports
