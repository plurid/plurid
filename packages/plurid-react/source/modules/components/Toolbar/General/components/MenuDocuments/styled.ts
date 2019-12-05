import styled from 'styled-components';



export const StyledMoreMenu = styled.div`
    position: absolute;
    bottom: 75px;
    max-height: 250px;
    width: 380px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 22.5px;
    padding: 22px;
    font-size: 0.8rem;
    overflow: hidden;

    background-color: ${(props: any) => {
        return props.theme.backgroundColorSecondary;
    }};
    box-shadow: ${(props: any) => {
        return props.theme.boxShadowUmbra;
    }};

    ul {
        padding: 0;
        list-style: none;
    }
`;


export const StyledMoreMenuItem: any = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;

    margin-bottom: ${(props: any) => {
        if (props.afterline) {
            return '30px';
        }
        return '10px';
    }};

    ${(props: any) => {
        if (props.afterline) {
            return `
                ::after {
                    position: absolute;
                    content: '';
                    left: 0;
                    right: 0;
                    bottom: -15px;
                    height: 1px;
                    background-color: white;
                }
            `;
        }
        return '';
    }};
`;


export const StyledMoreMenuScroll = styled.div`
    max-height: 210px;
    overflow: scroll;
    padding: 0 5px;

    /* Hide Scrollbar */
    scrollbar-width: none; /* Firefox 64 */
    -ms-overflow-style: none; /* Internet Explorer 11 */
    ::-webkit-scrollbar { /** WebKit */
        display: none;
    }

    h5::first-child {
        margin-top: 0;
    }
`;


export const StyledMenuDocumentsItemList: any = styled.li`
    margin: 10px 0;
    padding: 10px 20px;
    border-radius: 100px;

    cursor: ${(props: any) => {
        if (props.active) {
            return 'initial';
        }
        return 'pointer';
    }};
    background-color: ${(props: any) => {
        if (props.active) {
            return props.theme.backgroundColorTertiary;
        }
        return '';
    }};
    box-shadow: ${(props: any) => {
        if (props.active) {
            return 'inset 0px -1px 6px 0px ' + props.theme.boxShadowUmbraColor;
        }
        return '';
    }};

    :hover {
        background-color: ${(props: any) => {
            return props.theme.backgroundColorTertiary;
        }};
        box-shadow: ${(props: any) => {
            if (props.active) {
                return 'inset 0px -1px 6px 0px ' + props.theme.boxShadowUmbraColor;
            }

            return props.theme.boxShadowUmbra;
        }};
    }
`;
