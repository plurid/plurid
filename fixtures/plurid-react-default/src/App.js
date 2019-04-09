import React, { Component } from 'react';

import Plurid from '@plurid/react';


const TestComponent = () => (<div>test component</div>);

const Routing = () => (
    <Plurid.Routes>
        <Plurid.Route page="/default-domain-path" component={TestComponent} />

        <Plurid.Route subDomain="simple-test" page="/simple-test" component={TestComponent} />

        <Plurid.Routes subDomain="test">
            <Plurid.Route page="/test" component={TestComponent} />
        </Plurid.Routes>

        <Plurid.Routes subDomain="testing">
            <Plurid.Route page="/test" component={TestComponent} />
        </Plurid.Routes>

        <Plurid.Routes domain="plurid.org">
            <Plurid.Route page="/test" component={TestComponent} />
            <Plurid.Route subDomain="simple-test" page="/simple-test" component={TestComponent} />

            <Plurid.Routes subDomain="testing">
                <Plurid.Route page="/test" component={TestComponent} />
            </Plurid.Routes>
        </Plurid.Routes>
    </Plurid.Routes>
);


export default class App extends Component {
    render () {
        return (
            <Plurid.Router domain="plurid.com">
                <Plurid.App>
                    <Plurid.Page>
                        Page 1
                        <br />
                        <Plurid.Link page="/testings1">Link 1</Plurid.Link>
                        <Plurid.Link follow page="/testings2">Link 2</Plurid.Link>
                        <Plurid.Link newTab page="/testings3">Link 3</Plurid.Link>
                    </Plurid.Page>

                    {
                        // <Plurid.Document name="/foo">
                        //     content
                        // </Plurid.Document>
                    }

                    {
                        // <Plurid.Page>
                        //     Page 2
                        // </Plurid.Page>
                    }
                </Plurid.App>

                <Routing />
            </Plurid.Router>
        );
    }
}
