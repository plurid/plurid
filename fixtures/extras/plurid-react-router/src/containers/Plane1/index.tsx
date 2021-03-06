import React, {
    useRef,
} from 'react';

import {
    PluridLink,
    PluridPlaneConfigurator,
} from '@plurid/plurid-react';



const Page1: React.FC<any> = (
    properties,
) => {
    const {
        plurid,
    } = properties;

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
            <PluridPlaneConfigurator />

            <h1>
                Plane 1
            </h1>

            <div>
                {/* <div>
                    <PluridLink path="https://origin.com://route://a-space://a-universe://a-cluster://a-plane">full link</PluridLink>
                </div> */}

                <div>
                    {/* <PluridLink path="://route://a-space://a-universe://a-cluster://a-plane">partial link</PluridLink> */}
                    {/* <PluridLink path="://a-space://a-universe://a-cluster://a-plane">partial link</PluridLink> */}
                    {/* <PluridLink path="://a-universe://a-cluster://a-plane">partial link</PluridLink> */}
                    {/* <PluridLink path="://a-cluster://a-plane">partial link</PluridLink> */}
                    {/* <PluridLink path="://a-plane">partial link</PluridLink> */}
                    {/* <PluridLink path="/a-plane">partial link</PluridLink> */}

                    {/* <PluridLink path="/one">one</PluridLink>
                    <br />
                    <PluridLink path="/two">two</PluridLink>
                    <br />
                    <PluridLink path="/://static">static relative</PluridLink>
                    <PluridLink path={`${window.location.protocol}//${window.location.host}://static`}>static absolute</PluridLink> */}
                </div>

                <div>
                    <h2>
                        parametric links
                    </h2>

                    <p>
                        <PluridLink path="/://path1/one://a-space://a-universe://a-cluster://one">path1 one - full</PluridLink>
                    </p>

                    <p>
                        <PluridLink path="/://path1/one://one">path1 one - partial, will go to default</PluridLink>
                    </p>

                    <p>
                        <PluridLink path="/://path1/two">path1 two</PluridLink>
                    </p>
                </div>
            </div>
        </div>
    );
}


export default Page1;
