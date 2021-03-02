import React from 'react';
import themes from '@plurid/plurid-themes';

import Context from './context';

import Options from './containers/Options';

import {
    chromeStorage,
} from '../../services/utilities';

import {
    defaultOptions,
} from '../../data/constants';



class App extends React.Component<any, any> {
    constructor(props: any) {
        super(props);

        this.state = {
            theme: themes.plurid,
            setTheme: this.setTheme,
            options: {
                ...defaultOptions,
            },
        };
    }

    async componentDidMount() {
        const { theme } = await chromeStorage.get('theme');
        const { options } = await chromeStorage.get('options');

        const selectedTheme = (themes as any)[theme];

        const selectedOptions = {
        };

        const { initialOptionsSet } = await chromeStorage.get('initialOptionsSet');
        if (!initialOptionsSet) {
            await chromeStorage.set({
                options: selectedTheme,
            });
            await chromeStorage.set({
                initialOptionsSet: true,
            });
        }

        if (theme) {
            this.setState({
                theme: selectedTheme,
                options: selectedOptions,
            });
        }
    }

    public render() {
        return (
            <Context.Provider value={this.state}>
                <Options />
            </Context.Provider>
        );
    }

    private setTheme = async (theme: string) => {
        this.setState({
            theme: (themes as any)[theme],
        });

        await chromeStorage.set({theme});
    }
}


export default App;
