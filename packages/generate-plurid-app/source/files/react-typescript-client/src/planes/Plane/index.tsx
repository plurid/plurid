import React from 'react';

import {
    PluridLink,
} from '@plurid/plurid-react';

import {
    StyledPlane,
} from './styled';

import pluridLogo from '../../plurid-logo.png';



const Plane: React.FC<any> = (
    properties,
) => {
    /** properties */
    // const {
    //     plurid,
    // } = properties;


    /** render */
    return (
        <StyledPlane>
            <div>
                <a
                    href="https://plurid.com"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <img src={pluridLogo} alt="plurid logo" height={150} />
                </a>
            </div>

            <h1>
                enjoy the plurid' exploration
            </h1>

            <div>
                <PluridLink route="/plane">self link</PluridLink>
            </div>
        </StyledPlane>
    );
}


export default Plane;
