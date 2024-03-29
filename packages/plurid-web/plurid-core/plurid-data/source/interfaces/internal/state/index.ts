// #region imports
    // #region libraries
    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region external
    import {
        PluridApplicationView,
    } from '../../external/application';

    import {
        PluridConfiguration,
    } from '../../external/configuration';

    import {
        TreePlane,
    } from '../tree';

    import {
        Coordinates,
        ViewSize,
        SpaceSize,
    } from '../utilities';
    // #endregion external
// #endregion imports



// #region module
export interface PluridState {
    configuration: PluridConfiguration;
    shortcuts: PluridStateShortcuts;
    space: PluridStateSpace;
    themes: PluridStateThemes;
    ui: PluridStateUI;
}



export interface PluridStateShortcuts {
    global: boolean;
}


export interface PluridStateSpace {
    loading: boolean;
    resolvedLayout: boolean;
    animatedTransform: boolean;
    transformTime: number;
    scale: number;
    rotationX: number;
    rotationY: number;
    translationX: number;
    translationY: number;
    translationZ: number;
    transform: string;
    tree: TreePlane[];
    activeUniverseID: string;
    camera: Coordinates;
    viewSize: ViewSize;
    spaceSize: SpaceSize;
    view: PluridApplicationView;
    culledView: PluridApplicationView;
    activePlaneID: string;
    isolatePlane: string;
    lastClosedPlane: string;
}


export interface PluridStateThemes {
    general: Theme;
    interaction: Theme;
}


export interface PluridStateUI {
    toolbarScrollPosition: number;
}
// #endregion module
