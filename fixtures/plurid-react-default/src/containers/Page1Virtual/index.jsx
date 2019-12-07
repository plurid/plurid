import React from 'react';

import {
    PluridLink,
    PluridVirtualList,
} from '@plurid/plurid-react';



const Page1 = () => {
    return (
        <div style={{height: 300}}>
            <div>
                <PluridLink page="/page-2/soo/loo">link to page 2</PluridLink>
            </div>

            <PluridVirtualList
                items={data}
            />
        </div>
    );
}


export default Page1;
