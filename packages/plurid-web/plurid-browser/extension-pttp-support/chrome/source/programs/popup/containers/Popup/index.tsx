// #region imports
    // #region libraries
    import React, {
        useState,
        useEffect,
        useContext,
    } from 'react';
    // #endregion libraries


    // #region external
    import Context from '../../context';

    import ButtonInline from '../../../../components/ButtonInline';

    import ItemExtensionOnOff from '../../../../components/ItemExtensionOnOff';

    import {
        chromeStorage,
    } from '../../../../services/utilities';
    // #endregion external


    // #region internal
    import {
        StyledPopup,
        StyledPopupContainer,
        StyledPopupContainerItemsView,
        StyledViewOptionsButton,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
const Popup: React.FC<any> = (
    properties,
) => {
    // #region state
    const [
        extensionOnOff,
        setExtensionOnOff,
    ] = useState(true);
    // #endregion state


    // #region handlers
    const context: any = useContext(Context);
    const {
        theme,
    } = context;

    const openOptions = () => {
        chrome.runtime.openOptionsPage();
    }
    // #endregion handlers


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
    // #endregion effects


    // #region render
    return (
        <StyledPopup
            theme={theme}
        >
            <StyledPopupContainer>
                <StyledPopupContainerItemsView>
                    <ItemExtensionOnOff
                        theme={theme}
                        extensionOnOff={extensionOnOff}
                        setExtensionOnOff={() => setExtensionOnOff(!extensionOnOff)}
                    />

                    <StyledViewOptionsButton>
                        <ButtonInline
                            theme={theme}
                            atClick={openOptions}
                        >
                            view options
                        </ButtonInline>
                    </StyledViewOptionsButton>
                </StyledPopupContainerItemsView>
            </StyledPopupContainer>
        </StyledPopup>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default Popup;
// #endregion exports
