import styled from 'styled-components';



export const StyledMoreMenu = styled.div`
    position: absolute;
    bottom: 75px;
    height: 250px;
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
                    background-color: ${props.theme ? props.theme.colorPrimary : 'white'};
                }
            `;
        }
        return '';
    }};
`;


export const StyledMoreMenuScroll = styled.div`
    height: 210px;
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
