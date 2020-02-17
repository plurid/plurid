import React, {
    useRef,
} from 'react';

import {
    PluridLink,
} from '@plurid/plurid-react';



const Page1: React.FC<any> = (
    properties,
) => {
    const {
        plurid,
    } = properties;

    // console.log('aaa', properties);

    // const a = useRef(Math.random() * 800 + 100);
    // const b = useRef(Math.random() * 100 + 100);
    const a = useRef(200);
    const b = useRef(150);

    return (
        <div
            style={{
                padding: '1rem',
                // height: 300,
            }}
        >
            <div
                tabIndex={0}
                contentEditable={true}
                suppressContentEditableWarning={true}
            >
                editable
            </div>

            -- {plurid.parameters.page}

            <input />

            {/* <div>
                <PluridLink page="pageTwo">link to page 2 by id</PluridLink>
            </div> */}

            <div>
                <PluridLink page="/page-2/soo/loo">link to page 2</PluridLink>
            </div>

            <div style={{
                marginLeft: a.current,
                marginTop: b.current,
            }}>
                <PluridLink page="/page-3">link to page 3</PluridLink>
            </div>

            <div>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec id orci sit amet enim facilisis sagittis. Proin sagittis facilisis mauris, et bibendum ante dapibus at. Duis a sapien volutpat, egestas massa ac, vehicula orci. Donec vel est eros. Vivamus tellus arcu, molestie quis finibus in, euismod ut sapien. Etiam pretium eros et leo suscipit, at pharetra sapien bibendum. Integer elementum scelerisque malesuada. Curabitur rutrum iaculis justo. Vestibulum condimentum placerat neque ut <PluridLink page="/page-3">link to page 3</PluridLink> varius. <PluridLink page="/page-3">link to page 3</PluridLink> Ut at egestas augue. Ut quis elit nisl. Cras accumsan faucibus risus, quis tempor eros luctus sed. Suspendisse eu nulla sagittis, dignissim quam eget, rhoncus est. Fusce varius, sem sed vehicula rhoncus, quam turpis malesuada turpis, pretium posuere urna nunc eu ligula. Cras sapien nunc, sagittis a risus in, convallis sodales est.
                </p>
                <p>
                    Aliquam eget volutpat urna. Proin fermentum euismod libero non dictum. Integer lacus ipsum, vulputate vel magna eu, fermentum aliquet metus. Cras nisi neque, aliquam eu imperdiet in, pharetra ut nisi. Aenean porta ante elit, vitae pellentesque ante commodo a. Nullam vitae lectus lacinia lacus volutpat aliquet et a nisi. Vestibulum eget tellus consectetur ante egestas bibendum ac ut magna. Sed eget leo at sem eleifend tristique nec quis eros. <PluridLink page="/page-3">link to page 3</PluridLink>  Quisque eget orci porta quam convallis consequat id id metus.
                </p>
                <p>
                    In congue neque id ligula egestas suscipit. <PluridLink page="/page-3">link to page 3</PluridLink> Aliquam erat volutpat. Phasellus sit amet felis maximus velit rutrum dignissim mollis sed lorem. Suspendisse consectetur lobortis tortor a venenatis. Nullam ac ipsum nisi. In a diam urna. Nam pharetra sed ligula sed pulvinar. Fusce urna ante, blandit non interdum eu, auctor in velit. Aliquam quis faucibus nibh. Morbi venenatis tortor a dignissim pharetra. Donec malesuada maximus ligula non ullamcorper. Nam pellentesque ipsum sit amet nisi commodo, ac volutpat justo imperdiet.
                </p>
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
