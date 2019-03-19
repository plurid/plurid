import { Component } from '@stencil/core';



@Component({
    tag: 'plurid-shadow',
    styleUrl: 'plurid-shadow.scss',
    shadow: true
})
export class PluridShadow {

    render() {
        return (
            <div>Plurid</div>
        );
    }
}
