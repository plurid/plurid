// #region imports
    // #region libraries
    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region external
    import {
        PluridConfiguration,
    } from '../../external/configuration';

    import {
        PluridView,
    } from '../../external/view';

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
    animatedTransform: boolean;
    transformTime: number;
    scale: number;
    rotationX: number;
    rotationY: number;
    translationX: number;
    translationY: number;
    translationZ: number;
    initialTree: TreePlane[];
    tree: TreePlane[];
    activeUniverseID: string;
    camera: Coordinates;
    viewSize: ViewSize;
    spaceSize: SpaceSize;
    view: string[] | PluridView[];
    culledView: string[] | PluridView[];
}


export interface PluridStateThemes {
    general: Theme;
    interaction: Theme;
}


export interface PluridStateUI {
    toolbarScrollPosition: number;
}
// #endregion module
