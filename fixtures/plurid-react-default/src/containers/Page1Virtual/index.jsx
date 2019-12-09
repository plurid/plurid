import React from 'react';

import {
    // PluridLink,
    PluridVirtualList,
} from '@plurid/plurid-react';



const data = [];
const renderData = () => {
    for (let i = 0; i < 100; i++) {
        const el = (
            <div
                key={i}
                style={{
                    background: i % 2 == 0 ? 'slateblue' : 'slategray',
                    padding: '2rem',
                }}
            >
                <b>row {i}</b> - Aliquam pulvinar commodo libero sit amet vulputate. Donec pulvinar sem sed eleifend elementum. Morbi ac rhoncus ipsum. Morbi accumsan dolor vitae tristique pulvinar. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Interdum et malesuada fames ac ante ipsum primis in faucibus. Donec non condimentum quam. Maecenas sit amet dolor auctor, fringilla risus id, scelerisque tortor.
                Praesent maximus nibh sed risus finibus scelerisque. Suspendisse vestibulum dictum interdum. In odio mauris, congue sed felis in, molestie viverra mauris. Proin faucibus fermentum elit non accumsan. Curabitur sed porta nisi. Phasellus viverra ultrices libero. Duis commodo vel risus sit amet congue. Curabitur iaculis tortor quis sem aliquam varius. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam quam enim, facilisis eu mauris ac, convallis consectetur turpis. Curabitur venenatis tincidunt tincidunt.
            </div>
        );
        data.push(el);
    }
}
renderData();


const Page1 = () => {
    return (
        <div>
            {
                // <div>
                //     <PluridLink page="/page-2/soo/loo">link to page 2</PluridLink>
                // </div>
            }

            <PluridVirtualList
                items={data}
            />
        </div>
    );
}


export default Page1;
