import React from 'react';

import {
    StyledStatic,
} from './styled';

import Head from '../../components/Head';



const Static: React.FC<any> = () => {
    /** properties */


    /** render */
    return (
        <StyledStatic>
            <Head />

            <div>
                an example of a static page
            </div>
        </StyledStatic>
    );
}


export default Static;
