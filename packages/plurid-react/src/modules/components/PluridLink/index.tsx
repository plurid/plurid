import React from 'react';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
    StyledPluridLink,
} from './styled';

import {
    PluridLinkOwnProperties,
} from '../../data/interfaces';

import { AppState } from '../../services/state/store';
import selectors from '../../services/state/selectors';
import actions from '../../services/state/actions';



interface PluridLinkStateProperties {
}

interface PluridLinkDispatchProperties {
}

type PluridLinkProperties = PluridLinkOwnProperties
    & PluridLinkStateProperties
    & PluridLinkDispatchProperties;

const PluridLink: React.FC<PluridLinkProperties> = (properties) => {
    const {
        page,
        children,
    } = properties;

    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        console.log(page);

        // add the page as branch to the current root
    }

    return (
        <StyledPluridLink
            onClick={(event: React.MouseEvent<HTMLAnchorElement>) => handleClick(event)}
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
