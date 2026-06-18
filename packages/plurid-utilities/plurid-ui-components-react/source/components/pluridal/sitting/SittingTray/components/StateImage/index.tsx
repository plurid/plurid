// #region imports
    // #region libraries
    import React, {
        useState,
    } from 'react';

    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';
    import { connect } from 'react-redux';


    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        PluridIconStateShareImage,
        PluridIconCopyCurrentState,
        PluridIconCopyStateHistory,
    } from '@plurid/plurid-icons-react';
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
        StyledStateImage,
        StyledStateShareImage,
        StyledStateShareImageButtons,
        StyledStateShareImagePasteContainer,
        StyledStateShareImageButtonsCopy,
    } from './styled';
    // #endregion internal
// #endregion imports




// #region module
export interface StateImageOwnProperties {
    selectors: any;
    context: React.Context<any>;
}

export interface StateImageStateProperties {
    stateInteractionTheme: Theme;
}

export interface StateImageDispatchProperties {
}

export type StateImageProperties =
    & StateImageOwnProperties
    & StateImageStateProperties
    & StateImageDispatchProperties;


const StateImage: React.FC<StateImageProperties> = (
    properties,
) => {
    // #region state
    const [message, setMessage] = useState('');
    const [showPaste, setShowPaste] = useState(false);
    // #endregion state


    // #region handlers
    const copyCurrentState = () => {
        setMessage('copied state image');
        setTimeout(() => {
            setMessage('');
        }, 2000);
    }

    const copyStateHistory = () => {
        setMessage('copied state history');
        setTimeout(() => {
            setMessage('');
        }, 2000);
    }

    const paste = () => {
        setShowPaste(false);
    }
    // #endregion handlers


    // #region render
    return (
        <StyledStateImage>
            <StyledSittingTrayItem>
                <StyledSittingTrayItemHeader>
                    <div>
                        <h4>
                            state image
                        </h4>
                    </div>

                    <div>
                        <div
                            style={{
                                display: 'grid',
                                alignItems: 'center',
                                justifyContent: 'right',
                            }}
                        >
                            <PluridIconStateShareImage />
                        </div>
                    </div>
                </StyledSittingTrayItemHeader>

                <StyledSittingTrayItemBody>
                    <StyledStateShareImage>
                        {!message && !showPaste && (
                            <StyledStateShareImageButtons>
                                <StyledStateShareImageButtonsCopy
                                >
                                    <div
                                        onClick={copyCurrentState}
                                    >
                                        <PluridIconCopyCurrentState />
                                    </div>

                                    <div
                                        onClick={copyStateHistory}
                                    >
                                        <PluridIconCopyStateHistory />
                                    </div>
                                </StyledStateShareImageButtonsCopy>

                                <div
                                    onClick={() => setShowPaste(true)}
                                >
                                    paste
                                </div>
                            </StyledStateShareImageButtons>
                        )}

                        {message && !showPaste && (
                            <div>
                                {message}
                            </div>
                        )}

                        {showPaste && (
                            <StyledStateShareImagePasteContainer>
                                <input
                                    type="text"
                                />
                                <div
                                    onClick={paste}
                                >
                                    paste
                                </div>
                            </StyledStateShareImagePasteContainer>
                        )}
                    </StyledStateShareImage>
                </StyledSittingTrayItemBody>
            </StyledSittingTrayItem>
        </StyledStateImage>
    );
    // #endregion render
}


const mapStateToProperties = (
    state: any,
    ownProperties: any,
) => ({
    theme: ownProperties.selectors.themes.getInteractionTheme(state),
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
) => ({
});


const ConnectedStateImage = connect(
    mapStateToProperties,
    mapDispatchToProperties,
)(StateImage);
// #endregion module



// #region exports
export default ConnectedStateImage;
// #endregion exports
