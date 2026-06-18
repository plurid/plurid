// #region imports
    // #region libraries
    import React, {
        useState,
        // useContext,
    } from 'react';

    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';
    import { connect } from 'react-redux';


    import {
        PluridIconNewStateline,
        PluridIconPlay,
        PluridIconBranch
    } from '@plurid/plurid-icons-react';
    // #endregion libraries


    // #region external
    // import Slider from '../../../../../../Slider';

    import {
        StyledSittingTrayItem,
        StyledSittingTrayItemHeader,
        StyledSittingTrayItemBody,
    } from '../../styled';
    // #endregion external


    // #region internal
    import {
        StyledStateLine,
        StyledSliderStateButton,
        StyledSliderStateSliderContainer,
        // StyledSliderStateSittings,
        StyledStateLineButtons,
        StyledStateLineButton,
        StyledStateLineContainer,
    } from './styled';
    // #endregion internal
// #endregion imports




// #region module
export interface StateLineProperties {
    theme: any;
    context: React.Context<any>;
}

const StateLine: React.FC<StateLineProperties> = (
    properties,
) => {
    // const context: InitialContext = useContext(Context);

    // const {
    //     theme,
    // } = properties;


    // #region state
    const [stateIndex, setStateIndex] = useState(0);
    // #endregion state


    // const {
        // setView,
        // recorder,
    // } = context;

    // const allStates = recorder.all();

    // const maxStateSlider = allStates.length + 5;
    const maxStateSlider = 5;
    // const maxStateSlider = allStates.length - 1;

    // const handleStateSliderInput = (value: string) => {
    //     setStateIndex(parseInt(value));
    // }


    // #region handlers
    const handleStateIndex = (
        type: string,
    ) => {
        switch (type) {
            case 'DECREASE':
                if (stateIndex - 1 >= 0) {
                    setStateIndex(stateIndex - 1);
                } else {
                    setStateIndex(0);
                }
                // recorder.previous();
                break;
            case 'INCREASE':
                if (stateIndex + 1 <= maxStateSlider) {
                    setStateIndex(stateIndex + 1);
                } else {
                    setStateIndex(maxStateSlider);
                }
                // recorder.next();
                break;
        }
    }
    // #endregion handlers


    // #region render
    return (
        <StyledStateLine>
            <StyledSittingTrayItem>
                <StyledSittingTrayItemHeader>
                    <div>
                        <h4>
                            state line
                        </h4>
                    </div>

                    <div>
                        <StyledStateLineButtons>
                            <StyledStateLineButton>
                                {/* onClick go to the end of state line  */}
                                <PluridIconPlay />
                            </StyledStateLineButton>

                            <StyledStateLineButton>
                                {/* onClick create new state branch */}
                                <PluridIconBranch />
                            </StyledStateLineButton>

                            <StyledStateLineButton>
                                {/* onClick end current sitting and start new one */}
                                <PluridIconNewStateline />
                            </StyledStateLineButton>
                        </StyledStateLineButtons>
                    </div>
                </StyledSittingTrayItemHeader>

                <StyledSittingTrayItemBody>
                    <StyledStateLineContainer>
                        <div
                            style={{display: 'grid', justifyContent: 'left'}}
                        >
                            {stateIndex !== 0 && (
                                <StyledSliderStateButton
                                    onClick={() => handleStateIndex('DECREASE')}
                                >
                                    ◀
                                </StyledSliderStateButton>
                            )}
                        </div>

                        <StyledSliderStateSliderContainer>
                            {/* {maxStateSlider !== 0 && (
                                <Slider
                                    theme={theme}
                                    value={stateIndex}
                                    min={0}
                                    max={maxStateSlider}
                                    step={1}
                                    hideValue={true}
                                    defaultValue={50}
                                    handleInput={handleStateSliderInput}
                                    width={110}
                                />
                            )} */}
                        </StyledSliderStateSliderContainer>

                        <div
                            style={{display: 'grid', justifyContent: 'right'}}
                        >
                            {stateIndex !== maxStateSlider && (
                                <StyledSliderStateButton
                                    onClick={() => handleStateIndex('INCREASE')}
                                >
                                    ▶
                                </StyledSliderStateButton>
                            )}
                        </div>
                    </StyledStateLineContainer>
                </StyledSittingTrayItemBody>
            </StyledSittingTrayItem>
        </StyledStateLine>
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


const ConnectedStateLine = connect(
    mapStateToProperties,
    mapDispatchToProperties,
)(StateLine);
// #endregion module



// #region exports
export default ConnectedStateLine;
// #endregion exports
