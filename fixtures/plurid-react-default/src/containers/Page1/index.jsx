import React, {
    useRef,
} from 'react';

import {
    PluridLink,
} from '@plurid/plurid-react';



const Page1 = () => {
    // const a = useRef(Math.random() * 800 + 100);
    // const b = useRef(Math.random() * 100 + 100);
    const a = useRef(200);
    const b = useRef(150);

    return (
        <div style={{height: 300}}>
            <div
                tabIndex={0}
                contentEditable={true}
                suppressContentEditableWarning={true}
            >
                editable
            </div>

            page 1

            <input />

            <div>
                <PluridLink page="/page-2/soo/loo">link to page 2</PluridLink>
            </div>

            <div style={{
                marginLeft: a.current,
                marginTop: b.current,
            }}>
                <PluridLink page="/page-3">link to page 3</PluridLink>
            </div>

            {
                // <div style={{ marginLeft: 630, marginTop: 130}}>
                //     <PluridLink page="/page-2">link to page 2</PluridLink>
                // </div>
            }
        </div>
    );
}


export default Page1;
