// #region imports
    // #region libraries
    import React from 'react';

    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';
    import { connect } from 'react-redux';


    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        DispatchAction,
        sitting,
    } from '@plurid/plurid-ui-state-react';

    import {
        PluridIconSpeak,
        PluridIconStateShareImage,
    } from '@plurid/plurid-icons-react';
    // #endregion libraries


    // #region external
    import {
        ToolbarButton,
    } from '~data/interfaces';

    import {
        HorizontalPositions,
    } from '~data/enumerations';

    import ToolbarSpecific from '../ToolbarSpecific';
    import VerticalToolbarButton from '../VerticalToolbarButton';
    import SittingTray from '~components/pluridal/sitting/SittingTray';
    // #endregion external
// #endregion imports



// #region module
export interface ToolbarGeneralOwnProperties {
    // #region required
        // #region values
        buttons: ToolbarButton[],
        selectors: any;
        context: React.Context<any>;
        // #endregion values

        // #region methods
        handleClick: (type: any) => void;
        // #endregion methods
    // #endregion required

    // #region optional
        // #region values
        speakButton?: boolean;
        sittingButton?: boolean;
        // #endregion values

        // #region methods
        // #endregion methods
    // #endregion optional
}

export interface ToolbarGeneralStateProperties {
    stateView: string;
    stateToolbars: any;
    stateSittingTray: boolean;
    stateInteractionTheme: Theme;
}

export interface ToolbarGeneralDispatchProperties {
    dispatchToggleSittingTray: DispatchAction<typeof sitting.actions.toggleSittingTray>;
}

export type ToolbarGeneralProperties = ToolbarGeneralOwnProperties
    & ToolbarGeneralStateProperties
    & ToolbarGeneralDispatchProperties;


const ToolbarGeneral: React.FC<ToolbarGeneralProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region required
            // #region values
            buttons,
            selectors,
            context,
            // #endregion values

            // #region methods
            handleClick,
            // #endregion methods
        // #endregion required

        // #region optional
            // #region values
            speakButton,
            sittingButton: sittingButtonProperty,
            // #endregion values

            // #region methods
            // #endregion methods
        // #endregion optional


        // #region state
        stateView,
        stateSittingTray,
        stateToolbars,
        stateInteractionTheme,
        // #endregion state


        // #region dispatch
        dispatchToggleSittingTray,
        // #endregion dispatch
    } = properties;

    const {
        scaleIcons,
        showNames,
    } = stateToolbars;

    const iconTextLeft = false;

    const sittingButton = sittingButtonProperty ?? true;
    // #endregion properties


    // #region render
    return (
        <ToolbarSpecific
            buttons={buttons}
            handleClick={handleClick}
            activeType={stateView}
            position={HorizontalPositions.left}
            selectors={selectors}
            context={context}
        >
            {speakButton && (
                <VerticalToolbarButton
                    atClick={() => {}}
                    icon={PluridIconSpeak}
                    active={false}
                    text="speak"
                    textLeft={iconTextLeft}
                    showText={showNames}
                    scaleIcon={scaleIcons}
                    theme={stateInteractionTheme}
                />
            )}

            {sittingButton && (
                <>
                    <VerticalToolbarButton
                        atClick={() => dispatchToggleSittingTray()}
                        icon={PluridIconStateShareImage}
                        active={stateSittingTray}
                        text="sitting"
                        textLeft={iconTextLeft}
                        showText={showNames}
                        scaleIcon={scaleIcons}
                        theme={stateInteractionTheme}
                        last={true}
                    />

                    {stateSittingTray && (
                        <SittingTray
                            selectors={selectors}
                            context={context}
                        />
                    )}
                </>
            )}
        </ToolbarSpecific>
    );
    // #endregion render
}


const mapStateToProperties = (
    state: any,
    ownProperties: any,
): ToolbarGeneralStateProperties => ({
    stateView: ownProperties.selectors.views?.getGeneralView(state),
    stateToolbars: ownProperties.selectors.product?.getProductUI(state)?.toolbars,
    stateSittingTray: ownProperties.selectors.sitting?.getTray(state),
    stateInteractionTheme: ownProperties.selectors.themes?.getInteractionTheme(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): ToolbarGeneralDispatchProperties => ({
    dispatchToggleSittingTray: () => dispatch(
        sitting.actions.toggleSittingTray(),
    ),
});


const ConnectedToolbarGeneral = connect(
    mapStateToProperties,
    mapDispatchToProperties,
)(ToolbarGeneral);
// #endregion module



// #region exports
export default ConnectedToolbarGeneral;
// #endregion exports
