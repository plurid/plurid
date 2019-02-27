import React, { Component } from 'react';

import PluridApp, { PluridPage } from 'plurid-react';


export default class App extends Component {
    render () {
        return (
            <PluridApp>
                <PluridPage>
                    Page 1
                </PluridPage>

                <PluridPage>
                    Page 2
                </PluridPage>
            </PluridApp>
        );
    }
}
