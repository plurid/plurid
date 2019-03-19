import { Component, Prop } from '@stencil/core';



@Component({
    tag: 'plurid-page',
    styleUrl: 'plurid-page.scss',
    shadow: true
})
export class PluridPage {
    @Prop() name: string;
    @Prop() title: string;

    render() {
        return (
            <div>Plurid</div>
        );
    }
}
