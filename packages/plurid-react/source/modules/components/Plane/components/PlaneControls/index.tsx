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
    TreePlane,
    PluridConfiguration,
} from '@plurid/plurid-data';

import {
    PluridTextline,
} from '@plurid/plurid-ui-react';

import {
    PluridIconCopy,
    PluridIconLink,
} from '@plurid/plurid-icons-react';

import {
    clipboard,
} from '@plurid/plurid-functions';

import {
    StyledPlaneControls,
    StyledPlaneControlsLeft,
    StyledPlaneControlsCenter,
    StyledPlaneControlsRight,
} from './styled';

import SearchList from './components/SearchList';

import { AppState } from '../../../../services/state/store';
import StateContext from '../../../../services/state/context';
import selectors from '../../../../services/state/selectors';
// import actions from '../../../../services/state/actions';



interface PlaneControlsOwnProperties {
    plane: PluridPlane;
    treePlane: TreePlane;
    mouseOver: boolean;
}

interface PlaneControlsStateProperties {
    configuration: PluridConfiguration;
    generalTheme: Theme;
    interactionTheme: Theme;
}

interface PlaneControlsDispatchProperties {
}

type PlaneControlsProperties = PlaneControlsOwnProperties
    & PlaneControlsStateProperties
    & PlaneControlsDispatchProperties;


const PlaneControls: React.FC<PlaneControlsProperties> = (
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
        transparentUI,
        elements,
    } = configuration;

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
            const id = plane.path;
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
            const id = plane.path;
            pathbar.onKeyDown(event, id);
        }
    }

    const copyGatewayLink = () => {
        clipboard.copy(gatewayAddress);
    }


    /** render */
    return (
        <StyledPlaneControls
            theme={generalTheme}
            mouseOver={mouseOver}
            transparentUI={transparentUI}
            data-plurid-entity={PLURID_ENTITY_PLANE_CONTROLS}
        >
            <StyledPlaneControlsLeft>
            </StyledPlaneControlsLeft>

            <StyledPlaneControlsCenter>
                <PluridTextline
                    theme={interactionTheme}
                    text={showAddress ? gatewayAddress : path}
                    atChange={onPathInput}
                    atKeyDown={handleOnKeyDown}
                    ariaLabel="Plurid Pathbar"
                />

                {showSearch && (
                    <SearchList
                        hideSearch={() => setShowSearch(false)}
                    />
                )}
            </StyledPlaneControlsCenter>

            <StyledPlaneControlsRight>
                {/* <PluridIconCopy
                    atClick={() => copyGatewayLink()}
                />

                <PluridIconLink
                    atClick={() => setShowAddress(show => !show)}
                /> */}
            </StyledPlaneControlsRight>
        </StyledPlaneControls>
    );
}


const mapStateToProps = (
    state: AppState,
): PlaneControlsStateProperties => ({
    configuration: selectors.configuration.getConfiguration(state),
    generalTheme: selectors.themes.getGeneralTheme(state),
    interactionTheme: selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProps = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PlaneControlsDispatchProperties => ({
});


export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {
        context: StateContext,
    },
)(PlaneControls);