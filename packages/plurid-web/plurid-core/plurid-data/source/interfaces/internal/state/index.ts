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



export interface PluridState {
    configuration: PluridConfiguration;
    data: PluridStateData;
    shortcuts: PluridStateShortcuts;
    space: PluridStateSpace;
    themes: PluridStateThemes<any>;
    ui: PluridStateUI;
}


export interface PluridStateData {
    planeSources: Record<string, string>;
}


export interface PluridStateShortcuts {
    global: boolean;
}


export interface PluridStateSpace {
    loading: boolean;
    animatedTransform: boolean;
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


export interface PluridStateThemes<T> {
    general: T;
    interaction: T;
}


export interface PluridStateUI {
    toolbarScrollPosition: number;
}
