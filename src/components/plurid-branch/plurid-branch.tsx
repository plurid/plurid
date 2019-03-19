import { Component, Prop } from '@stencil/core';



@Component({
    tag: 'plurid-branch',
    styleUrl: 'plurid-branch.scss',
    shadow: true
})
export class PluridBranch {
    @Prop() link: string;

    render() {
        return (
            <div>Plurid</div>
        );
    }
}
