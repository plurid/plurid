import React, { Component } from 'react';

import Plurid, { PluridPage } from 'plurid-react';


const TestComponent = (<div>test component</div>);

export default class App extends Component {
    render () {
        return (
            <Plurid.Router domain="plurid.com">
                <Plurid.App>
                    <PluridPage>
                        Page 1
                    </PluridPage>

                    <PluridPage>
                        Page 2
                        <br />
                        <Plurid.Link page="/test">Link</Plurid.Link>
                    </PluridPage>
                </Plurid.App>

                <Plurid.Route subdomain="simple-test" page="/simple-test" component={TestComponent} />

                <Plurid.Routes subdomain="test">
                    <Plurid.Route page="/test" component={TestComponent} />
                </Plurid.Routes>

                <Plurid.Routes subdomain="testing">
                    <Plurid.Route page="/test" component={TestComponent} />
                </Plurid.Routes>
            </Plurid.Router>
        );
    }
}
