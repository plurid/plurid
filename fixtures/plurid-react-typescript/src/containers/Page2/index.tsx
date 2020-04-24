import React from 'react';

import {
    PluridLink,
} from '@plurid/plurid-react';



const Page2: React.FC<any> = (
    properties,
) => {
    // console.log(properties.plurid);

    return (
        <div style={{
            height: 400,
        }}>
            page 2 <PluridLink page="/page-1">link to page 1</PluridLink>

            <div style={{ marginLeft: 200, marginTop: 100}}>
                <PluridLink page="/page-1">link to page 1</PluridLink>
            </div>

            <div style={{ marginLeft: 200, marginTop: 100}}>
                <PluridLink page="/page-3">link to page 3</PluridLink>
            </div>
        </div>
    );
}


export default Page2;
