import { Component, Prop } from '@stencil/core';



@Component({
    tag: 'plurid-shadow',
    styleUrl: 'plurid-shadow.scss',
    shadow: true
})
export class PluridShadow {
    @Prop() sheet: string;

    render() {
        return (
            <div>Plurid</div>
        );
    }
}
