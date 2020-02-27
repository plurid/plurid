import React from 'react';

import {
    PluridLink,
} from '@plurid/plurid-react';

import {
    StyledPage,
} from './styled';

// import pluridLogo from '../../plurid-logo.png';
import pluridLogoSVG from '../../plurid-logo.svg';



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

            <div>
                <PluridLink page="/page">self link</PluridLink>
            </div>
        </StyledPage>
    );
}


export default Page;
