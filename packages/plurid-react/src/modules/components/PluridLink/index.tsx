import React, {
    useRef,
} from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    StyledPluridLink,
} from './styled';

import {
    PluridLinkOwnProperties,
} from '../../data/interfaces';

import {
    getPluridPlaneByData,
} from '../../services/logic/plane';

import { AppState } from '../../services/state/store';
// import selectors from '../../services/state/selectors';
// import actions from '../../services/state/actions';



interface PluridLinkStateProperties {
}

interface PluridLinkDispatchProperties {
}

type PluridLinkProperties = PluridLinkOwnProperties
    & PluridLinkStateProperties
    & PluridLinkDispatchProperties;

const PluridLink: React.FC<PluridLinkProperties> = (properties) => {
    const element: React.RefObject<HTMLAnchorElement> = useRef(null);

    const {
        page,
        children,
    } = properties;

    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        console.log(page);

        const pluridPlane = getPluridPlaneByData(element.current!);
        console.log('pluridPlane', pluridPlane);

        // add the page as branch to the current root
    }

    return (
        <StyledPluridLink
            onClick={(event: React.MouseEvent<HTMLAnchorElement>) => handleClick(event)}
            ref={element}
        >
            {children}
        </StyledPluridLink>
    );
}


const mapStateToProps = (state: AppState): PluridLinkStateProperties => ({
});


const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, AnyAction>): PluridLinkDispatchProperties => ({
});


export default connect(mapStateToProps, mapDispatchToProps)(PluridLink);
