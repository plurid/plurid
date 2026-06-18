// #region imports
    // #region libraries
    import React, {
        useState,
        // useContext,
    } from 'react';

    import {
        PluridIconCopyCurrentState,
        PluridIconCopyStateHistory,
    } from '@plurid/plurid-icons-react';
    // #endregion libraries


    // #region internal
    import {
        StyledStateShareImage,
        StyledStateShareImageButtons,
        StyledStateShareImagePasteContainer,
        StyledStateShareImageButtonsCopy,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface StateShareImageProperties {
}

const StateShareImage: React.FC<StateShareImageProperties> = (
    properties,
) => {
    // const context: any = useContext(Context);

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

                    <div style={{display: 'grid', alignItems: 'center'}}>
                        {/* <img src={stateShareImageIcon} alt="state share" height={20} /> */}
                    </div>

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
    );
    // #endregion render
}
// #endregion module



// #region exports
export default StateShareImage;
// #endregion exports
