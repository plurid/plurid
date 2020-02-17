import React from 'react';

import {
    PluridLink,
} from '@plurid/plurid-react';



const Page3: React.FC<any> = (
    properties,
) => {
    return (
        <div
            style={{height: 400}}
        >
            page 2

            <div
                style={{ marginLeft: 200, marginTop: 100}}
            >
                <PluridLink
                    page="/page-2"
                >
                    link to page 2
                </PluridLink>
            </div>
        </div>
    );
}


export default Page3;
