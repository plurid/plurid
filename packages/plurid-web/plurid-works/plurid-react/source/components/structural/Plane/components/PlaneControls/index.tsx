// #region imports
    // #region libraries
    import React, {
        useState,
    } from 'react';

    import { AnyAction } from 'redux';
    import { connect } from 'react-redux';
    import { ThunkDispatch } from 'redux-thunk';

    import { Theme } from '@plurid/plurid-themes';

    import {
        /** constants */
        PLURID_ENTITY_PLANE_CONTROLS,

        /** interfaces */
        PluridPlane,
        RegisteredPluridPlane,
        TreePlane,
        PluridConfiguration,
    } from '@plurid/plurid-data';

    import {
        universal,
    } from '@plurid/plurid-ui-components-react';

    import {
        PluridIconCopy,
        PluridIconLink,
    } from '@plurid/plurid-icons-react';

    import {
        clipboard,
    } from '@plurid/plurid-functions';
    // #endregion libraries


    // #region external
    import {
        PluridReactComponent,
    } from '~data/interfaces';

    import { AppState } from '~services/state/store';
    import StateContext from '~services/state/context';
    import selectors from '~services/state/selectors';
    // import actions from '~services/state/actions';
    // #endregion external


    // #region internal
    import SearchList from './components/SearchList';

    import {
        StyledPluridPlaneControls,
        StyledPluridPlaneControlsLeft,
        StyledPluridPlaneControlsCenter,
        StyledPluridPlaneControlsRight,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
const {
    inputs: {
        Textline: PluridTextline,
    },
} = universal;

export interface PluridPlaneControlsOwnProperties {
    plane: RegisteredPluridPlane<PluridReactComponent>;
    treePlane: TreePlane;
    mouseOver: boolean;
}

export interface PluridPlaneControlsStateProperties {
    configuration: PluridConfiguration;
    generalTheme: Theme;
    interactionTheme: Theme;
}

export interface PluridPlaneControlsDispatchProperties {
}

export type PluridPlaneControlsProperties = PluridPlaneControlsOwnProperties
    & PluridPlaneControlsStateProperties
    & PluridPlaneControlsDispatchProperties;


const PluridPlaneControls: React.FC<PluridPlaneControlsProperties> = (
    properties,
) => {
    /** properties */
    const {
        /** own */
        plane,
        treePlane,
        mouseOver,

        /** state */
        configuration,
        generalTheme,
        interactionTheme,
    } = properties;

    const {
        global,
        elements,
    } = configuration;

    const {
        transparentUI,
    } = global;

    const {
        pathbar,
    } = elements.plane.controls;

    const {
        route,
        routeDivisions
    } = treePlane;

    const {
        protocol,
        host,
    } = routeDivisions;

    const gateway = 'gateway';

    const gatewayAddress = `${protocol}://${host.value}/${gateway}?plurid=` + encodeURIComponent(route);


    /** state */
    const [path, setPath] = useState(routeDivisions.plane.value);
    const [showAddress, setShowAddress] = useState(false);
    const [showSearch, setShowSearch] = useState(false);


    /** handlers */
    const onPathInput = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        setPath(event.target.value);

        if (pathbar.onChange) {
            // const id = plane.id || plane.path;
            const id = plane.route.absolute;
            pathbar.onChange(event, id);
        }
    }

    const handleOnKeyDown = (
        event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (!showSearch) {
            setShowSearch(true);
        }

        if (event.key === 'Escape') {
            setShowSearch(false);
        }

        if (pathbar.onKeyDown) {
            // const id = plane.id || plane.path;
            const id = plane.route.absolute;
            pathbar.onKeyDown(event, id);
        }
    }

    const copyGatewayLink = () => {
        clipboard.copy(gatewayAddress);
    }


    /** render */
    return (
        <StyledPluridPlaneControls
            theme={generalTheme}
            mouseOver={mouseOver}
            transparentUI={transparentUI}
            data-plurid-entity={PLURID_ENTITY_PLANE_CONTROLS}
        >
            <StyledPluridPlaneControlsLeft>
            </StyledPluridPlaneControlsLeft>

            <StyledPluridPlaneControlsCenter>
                <PluridTextline
                    theme={interactionTheme}
                    // text={showAddress ? gatewayAddress : path}
                    text={plane.route.absolute}
                    atChange={onPathInput}
                    atKeyDown={handleOnKeyDown}
                    ariaLabel="Plurid Pathbar"
                />

                {/* {showSearch && (
                    <SearchList
                        hideSearch={() => setShowSearch(false)}
                    />
                )} */}
            </StyledPluridPlaneControlsCenter>

            <StyledPluridPlaneControlsRight>
                {/* <PluridIconCopy
                    atClick={() => copyGatewayLink()}
                />

                <PluridIconLink
                    atClick={() => setShowAddress(show => !show)}
                /> */}
            </StyledPluridPlaneControlsRight>
        </StyledPluridPlaneControls>
    );
}


const mapStateToProps = (
    state: AppState,
): PluridPlaneControlsStateProperties => ({
    configuration: selectors.configuration.getConfiguration(state),
    generalTheme: selectors.themes.getGeneralTheme(state),
    interactionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PluridPlaneControlsDispatchProperties => ({
});


const ConnectedPluridPlaneControls = connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PluridPlaneControls);
// #endregion module



// #region exports
export default ConnectedPluridPlaneControls;
// #endregion exports
