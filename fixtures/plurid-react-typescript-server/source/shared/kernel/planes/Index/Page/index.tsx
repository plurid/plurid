import React from 'react';

import {
    PluridLink,
    PluridRouterLink,
} from '@plurid/plurid-react';

import {
    StyledPage,
} from './styled';

// import pluridLogo from './assets/plurid-logo.png';
import pluridLogoSVG from './assets/plurid-logo.svg';



const Page: React.FC<any> = (
    properties,
) => {
    /** properties */
    // const {
    //     plurid,
    // } = properties;


    /** render */
    return (
        <StyledPage>
            <div>
                <a
                    href="https://plurid.com"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <img src={pluridLogoSVG} alt="plurid logo" height={250} />
                    {/* <img src={pluridLogo} alt="plurid logo" height={250} /> */}
                </a>
            </div>

            <h1>
                enjoy the plurid' exploration
            </h1>

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                }}
            >
                <PluridLink
                    route="/plane"
                    style={{
                        color: '#ccc',
                    }}
                >
                    plurid self link
                </PluridLink>

                <PluridRouterLink
                    route="/static"
                    style={{
                        color: '#ccc',
                    }}
                >
                    router link to static page
                </PluridRouterLink>
            </div>
        </StyledPage>
    );
}


export default Page;
