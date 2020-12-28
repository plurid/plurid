import React from 'react';

import {
    PluridRouterLink,
} from '@plurid/plurid-react';

import {
    StyledStatic,
} from './styled';

import Head from '../../components/Head';



const Static: React.FC<any> = () => {
    /** properties */


    /** render */
    return (
        <StyledStatic>
            <Head
                title="A Static Page | Plurid' Application"
            />

            <div>
                an example of a static page
            </div>

            <div>
                <PluridRouterLink
                    route="/"
                >
                    back to home
                </PluridRouterLink>
            </div>
        </StyledStatic>
    );
}


export default Static;
