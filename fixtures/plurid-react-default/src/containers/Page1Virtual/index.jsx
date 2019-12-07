import React from 'react';

import {
    PluridLink,
} from '@plurid/plurid-react';


const data = [];
const renderData = () => {
    for (let i = 0; i < 100; i++) {
        data.push(
            <div
                key={i}
            >
                row {i}
            </div>
        )
    }
}
renderData();


const Page1 = () => {
    return (
        <div style={{height: 300}}>
            <div>
                <PluridLink page="/page-2/soo/loo">link to page 2</PluridLink>
            </div>

            {data.map((element, index) => {
                return (
                    <div
                        key={index}
                    >
                        {element}
                    </div>
                );
            })}
        </div>
    );
}


export default Page1;
