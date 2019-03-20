import { Component, Prop } from '@stencil/core';



@Component({
    tag: 'plurid-app',
    styleUrl: 'app.scss',
    shadow: true
})
export class PluridApp {
    @Prop() theme: string;

    render() {
        return (
            <div>PluridApp</div>
        );
    }
}
