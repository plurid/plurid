// #region imports
    // #region libraries
    import {
        createSlice,
        PayloadAction,
    } from '@reduxjs/toolkit';

    import {
        PluridConfiguration,
        InternationalizationLanguageType,

        SIZES,
        TRANSFORM_MODES,
        TRANSFORM_TOUCHES,
        TOOLBAR_DRAWERS,
        LAYOUT_TYPES,

        defaultConfiguration,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region internal
    import type {
        AppState,
    } from '~services/state/store';
    // #endregion internal
// #endregion imports



// #region module
export interface ConfigurationState extends PluridConfiguration {
}


const initialState: ConfigurationState = {
    ...defaultConfiguration,
};


export const configuration = createSlice({
    name: 'configuration',
    initialState,
    reducers: {
        setConfiguration: (
            _state,
            action: PayloadAction<PluridConfiguration>,
        ) => {
            return {
                ...action.payload,
            };
        },
        setConfigurationMicro: (
            state,
        ) => {
            state.elements.toolbar.show = false;
            state.elements.plane.controls.show = false;
            state.elements.viewcube.show = false;
        },
        setConfigurationPlaneControls: (
            state,
            action: PayloadAction<boolean>
        ) => {
            state.elements.plane.controls.show = action.payload;
        },
        setConfigurationPlaneOpacity: (
            state,
            action: PayloadAction<number>,
        ) => {
            state.elements.plane.opacity = action.payload;
        },
        setConfigurationThemeGeneral: (
            state,
            action: PayloadAction<string>,
        ) => {
            const updatedTheme: any = {
                general: action.payload,
                interaction: typeof state.global.theme === 'object'
                    ? state.global.theme.interaction
                    : 'plurid',
            };

            state.global.theme = updatedTheme;
        },
        setConfigurationThemeInteraction: (
            state,
            action: PayloadAction<string>,
        ) => {
            const updatedTheme: any = {
                general: typeof state.global.theme === 'object'
                    ? state.global.theme.general
                    : 'plurid',
                interaction: action.payload,
            };

            state.global.theme = updatedTheme;
        },
        setConfigurationLanguage: (
            state,
            action: PayloadAction<InternationalizationLanguageType>,
        ) => {
            state.global.language = action.payload;
        },
        toggleConfigurationViewcubeHide: (
            state,
            action: PayloadAction<boolean>,
        ) => {
            state.elements.viewcube.show = action.payload;
        },
        toggleConfigurationViewcubeButtons: (
            state,
            action: PayloadAction<boolean>,
        ) => {
            state.elements.viewcube.buttons = action.payload;
        },
        toggleConfigurationViewcubeOpaque: (
            state,
            action: PayloadAction<boolean>,
        ) => {
            state.elements.viewcube.opaque = action.payload;
        },
        toggleConfigurationViewcubeConceal: (
            state,
        ) => {
            const {
                conceal,
            } = state.elements.viewcube;

            state.elements.viewcube.conceal = !conceal;
        },
        toggleConfigurationToolbarConceal: (
            state,
        ) => {
            const {
                conceal,
            } = state.elements.toolbar;

            state.elements.toolbar.conceal = !conceal;
        },
        toggleConfigurationToolbarTransformIcons: (
            state,
        ) => {
            const {
                transformIcons,
            } = state.elements.toolbar;

            state.elements.toolbar.transformIcons = !transformIcons;
        },
        toggleConfigurationToolbarTransformButtons: (
            state,
        ) => {
            const {
                transformButtons,
            } = state.elements.toolbar;

            state.elements.toolbar.transformButtons = !transformButtons;
        },
        toggleConfigurationShowTransformOrigin: (
            state,
        ) => {
            const {
                show,
            } = state.space.transformOrigin;

            state.space.transformOrigin.show = !show;
        },
        toggleConfigurationToolbarOpaque: (
            state,
        ) => {
            const {
                opaque,
            } = state.elements.toolbar;

            state.elements.toolbar.opaque = !opaque;
        },
        toggleConfigurationSpaceTransparentUI: (
            state,
        ) => {
            state.global.transparentUI = !state.global.transparentUI;
        },
        setConfigurationSpaceTransformOriginSize: (
            state,
            action: PayloadAction<SIZES>,
        ) => {
            state.space.transformOrigin.size = action.payload;
        },
        setConfigurationSpaceTransformMode: (
            state,
            action: PayloadAction<TRANSFORM_MODES>,
        ) => {
            if (
                state.space.transformMode !== action.payload
            ) {
                state.space.transformMode = action.payload;
            } else {
                state.space.transformMode = TRANSFORM_MODES.ALL;
            }
        },
        toggleConfigurationSpaceTransformMultimode: (
            state,
            action: PayloadAction<boolean>,
        ) => {
            state.space.transformMultimode = action.payload;
        },
        setConfigurationSpaceTransformTouch: (
            state,
            action: PayloadAction<TRANSFORM_TOUCHES>,
        ) => {
            state.space.transformTouch = action.payload;
        },
        toggleConfigurationSpaceFirstPerson: (
            state,
        ) => {
            const {
                firstPerson,
            } = state.space;

            state.space.firstPerson = !firstPerson;
        },
        toggleConfigurationToolbarToggleDrawer: (
            state,
            action: PayloadAction<TOOLBAR_DRAWERS>,
        ) => {
            const {
                toggledDrawers,
            } = state.elements.toolbar;

            if (toggledDrawers.includes(action.payload)) {
                const updatedDrawers = toggledDrawers.filter(el => el !== action.payload);
                state.elements.toolbar.toggledDrawers = [...updatedDrawers];
            } else {
                state.elements.toolbar.toggledDrawers = [
                    ...toggledDrawers,
                    action.payload,
                ];
            }
        },
        setConfigurationSpaceTransformLocks: (
            state,
            action: PayloadAction<any>,
        ) => {
            const {
                transformLocks,
            } = state.space;

            const updatedTransformLocks: any = {
                ...transformLocks,
            };
            updatedTransformLocks[action.payload] = !(transformLocks as any)[action.payload];
            state.space.transformLocks = {
                ...updatedTransformLocks,
            };
        },
        setConfigurationSpaceLayout: (
            state,
            action: PayloadAction<any>,
        ) => {
            const layout: any = {
                type: (LAYOUT_TYPES as any)[action.payload],
            };

            state.space.layout = {
                ...layout,
            };
        },
        setConfigurationSpaceCullingDistance: (
            state,
            action: PayloadAction<number>,
        ) => {
            state.space.cullingDistance = action.payload;
        },
    },
});
// #endregion module



// #region exports
export const actions = configuration.actions;


export const getConfiguration = (state: AppState) => state.configuration;

export const selectors = {
    getConfiguration,
};


export const reducer = configuration.reducer;
// #endregion exports
