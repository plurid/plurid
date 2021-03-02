// #region imports
    // #region libraries
    import React, {
        useState,
        useContext,
        useEffect,
    } from 'react';

    import themes from '@plurid/plurid-themes';

    import {
        universal,
    } from '@plurid/plurid-ui-components-react';
    // #endregion libraries


    // #region external
    import Context from '../../context';

    import Dropdown from '../../../../components/Dropdown';
    import ItemExtensionOnOff from '../../../../components/ItemExtensionOnOff';
    import ButtonCheckmark from '../../../../components/ButtonCheckmark';
    import ButtonInline from '../../../../components/ButtonInline';

    import {
        chromeStorage,
    } from '../../../../services/utilities';

    import {
        defaultOptions,
    } from '../../../../data/constants';
    // #endregion external


    // #region internal
    import {
        StyledOptions,
        StyledOptionsContainer,
        StyledOptionsWrapper,
        StyledOptionsItemLeftRight,
        StyledStateContainer,
        StyledUIContainer,
        StyledPluridTextline,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
const {
    form: {
        FormLeftRight: PluridFormLeftRight,
        Formline: PluridFormline,
        Formitem: PluridFormitem,
    },
    typography: {
        Heading: PluridHeading,
    },
} = universal;


export interface OptionsProperties {
}

const Options: React.FC<OptionsProperties> = () => {
    // #region properties
    const context: any = useContext(Context);
    const {
        theme,
        setTheme,
        options,
    } = context;
    // #endregion properties


    // #region state
    const [
        extensionOnOff,
        setExtensionOnOff,
    ] = useState(true);

    const [
        color,
        setColor,
    ] = useState(options.color);

    const [
        border,
        setBorder,
    ] = useState(options.border);

    const [
        size,
        setSize,
    ] = useState(options.size);

    const [
        round,
        setRound,
    ] = useState(options.round as boolean);

    const [
        opacity,
        setOpacity,
    ] = useState(options.opacity);

    const [
        hideCursor,
        setHideCursor,
    ] = useState(options.hideCursor as boolean);

    const [
        followCursor,
        setFollowCursor,
    ] = useState(options.followCursor as boolean);

    const [
        bindActivation,
        setBindActivation,
    ] = useState(options.bindActivation);
    const [
        bindUp,
        setBindUp,
    ] = useState(options.bindUp);
    const [
        bindDown,
        setBindDown,
    ] = useState(options.bindDown);
    const [
        bindLeft,
        setBindLeft,
    ] = useState(options.bindLeft);
    const [
        bindRight,
        setBindRight,
    ] = useState(options.bindRight);
    const [
        bindClick,
        setBindClick,
    ] = useState(options.bindClick);
    const [
        bindReset,
        setBindReset,
    ] = useState(options.bindReset);
    // #endregion state


    // #region effects
    useEffect(() => {
        const getExtensionState = async () => {
            const { extensionOn } = await chromeStorage.get('extensionOn');
            setExtensionOnOff(!!extensionOn);
        }

        getExtensionState();
    }, []);

    useEffect(() => {
        const setExtensionState = async () => {
            await chromeStorage.set({extensionOn: extensionOnOff});
        }
        setExtensionState();
    }, [
        extensionOnOff,
    ]);

    useEffect(() => {
        const setOptions = async () => {
            const { options } = await chromeStorage.get('options');

            if (!options) {
                return;
            }

            const {
                color,
                border,
                size,
                round,
                opacity,
                hideCursor,
                followCursor,
                bindActivation,
                bindUp,
                bindDown,
                bindLeft,
                bindRight,
                bindClick,
                bindReset,
            } = options;

            setColor(color);
            setBorder(border);
            setSize(size);
            setRound(round);
            setOpacity(opacity);
            setHideCursor(hideCursor);
            setFollowCursor(followCursor);
            setBindActivation(bindActivation);
            setBindUp(bindUp);
            setBindDown(bindDown);
            setBindLeft(bindLeft);
            setBindRight(bindRight);
            setBindClick(bindClick);
            setBindReset(bindReset);
        }

        setOptions();
    }, []);

    useEffect(() => {
        const saveOptions = async () => {
            const options = {
                color,
                border,
                size,
                round,
                opacity,
                hideCursor,
                followCursor,
                bindActivation,
                bindUp,
                bindDown,
                bindLeft,
                bindRight,
                bindClick,
                bindReset,
            };

            await chromeStorage.set({options});
        }

        saveOptions();
    }, [
        color,
        border,
        size,
        round,
        opacity,
        hideCursor,
        followCursor,
        bindActivation,
        bindUp,
        bindDown,
        bindLeft,
        bindRight,
        bindClick,
        bindReset,
    ]);
    // #endregion effects


    // #region render
    return (
        <StyledOptions
            theme={theme}
        >
            <StyledOptionsContainer>
                <StyledOptionsWrapper>
                    <StyledStateContainer>
                        <PluridHeading
                            theme={theme}
                            type="h2"
                            style={{
                                padding: '0 0.7rem',
                            }}
                        >
                            state
                        </PluridHeading>

                        <ItemExtensionOnOff
                            theme={theme}
                            extensionOnOff={extensionOnOff}
                            setExtensionOnOff={() => setExtensionOnOff(!extensionOnOff)}
                        />
                    </StyledStateContainer>


                    <StyledUIContainer>
                        <PluridHeading
                            theme={theme}
                            type="h2"
                            style={{
                                padding: '0 0.7rem',
                            }}
                        >
                            interface
                        </PluridHeading>

                        <PluridFormLeftRight
                            style={{
                                padding: '0.3rem 0.7rem',
                            }}
                        >
                            <div>
                                theme
                            </div>

                            <Dropdown
                                theme={theme}
                                selected={theme.name}
                                items={Object.keys(themes)}
                                onSelect={setTheme}
                            />
                        </PluridFormLeftRight>
                    </StyledUIContainer>

                    <div
                        style={{
                            display: 'grid',
                            placeContent: 'center',
                            margin: '40px',
                        }}
                    >
                        <ButtonInline
                            theme={theme}
                            atClick={() => {
                            }}
                        >
                            reset to defaults
                        </ButtonInline>
                    </div>
                </StyledOptionsWrapper>
            </StyledOptionsContainer>
        </StyledOptions>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default Options;
// #endregion exports
