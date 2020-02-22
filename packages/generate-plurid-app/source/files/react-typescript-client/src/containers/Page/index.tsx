import React from 'react';

import {
    PluridLink,
} from '@plurid/plurid-react';



const Page: React.FC<any> = (
    properties,
) => {
    /** properties */
    const {
        plurid,
    } = properties;


    /** render */
    return (
        <div
            style={{
                padding: '1rem',
            }}
        >
            <div>
                enjoy the plurid' exploration
            </div>

            <div>
                <PluridLink page="/page">self link</PluridLink>
            </div>
        </div>
    );
}


export default Page;
