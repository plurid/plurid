// #region imports
    // #region libraries
    import React, {
        useState,
        useEffect,
    } from 'react';

    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';
    import { connect } from 'react-redux';


    import {
        PluridIconCopy,
    } from '@plurid/plurid-icons-react';

    import {
        clipboard,
    } from '@plurid/plurid-functions';
    // #endregion libraries


    // #region external
    import {
        StyledSittingTrayItem,
        StyledSittingTrayItemHeader,
        StyledSittingTrayItemBody,
    } from '../../styled';
    // #endregion external


    // #region internal
    import {
        StyledStateLink,
        StyledStateLinkContainer,
        StyledStateLinkText,
        StyledStateLinkCopy,
    } from './styled';
    // #endregion internal
// #endregion imports




// #region module
export interface StateLinkProperties {
    theme: any;
    currentLink: string;
    context: React.Context<any>;
}

const StateLink: React.FC<StateLinkProperties> = (
    properties,
) => {
    const {
        // theme,
        currentLink,
    } = properties;

    const copyStateLink = () => {
        clipboard.copy(currentLink);
        setCurrentStateLink('copied link');
        setTimeout(() => {
            setCurrentStateLink(currentLink);
        }, 650);
    }

    const [currentStateLink, setCurrentStateLink] = useState(currentLink);

    useEffect(() => {
        setCurrentStateLink(currentLink);
    }, [
        currentLink,
    ]);

    return (
        <StyledStateLink>
            <StyledSittingTrayItem>
                <StyledSittingTrayItemHeader>
                    <div>
                        <h4>
                            state link
                        </h4>
                    </div>

                    <div
                        style={{justifySelf: 'right'}}
                    >
                        <StyledStateLinkCopy
                            onClick={copyStateLink}
                        >
                            <PluridIconCopy />
                        </StyledStateLinkCopy>
                    </div>
                </StyledSittingTrayItemHeader>

                <StyledSittingTrayItemBody>
                    <StyledStateLinkContainer>
                        <StyledStateLinkText>
                            {currentStateLink}
                        </StyledStateLinkText>
                    </StyledStateLinkContainer>
                </StyledSittingTrayItemBody>
            </StyledSittingTrayItem>
        </StyledStateLink>
    );
}


const mapStateToProperties = (
    state: any,
    ownProperties: any,
) => ({
    theme: ownProperties.selectors.themes.getInteractionTheme(state),
    currentLink: ownProperties.selectors.sitting.getCurrentLink(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
) => ({
});


const ConnectedStateLink = connect(
    mapStateToProperties,
    mapDispatchToProperties,
)(StateLink);
// #endregion module



// #region exports
export default ConnectedStateLink;
// #endregion exports
