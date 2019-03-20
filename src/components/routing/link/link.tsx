import { Component, Prop } from '@stencil/core';



@Component({
    tag: 'plurid-link',
    styleUrl: 'link.scss',
    shadow: true
})
export class PluridLink {
    @Prop() page: string;
    @Prop() samepage: boolean;
    @Prop() active: boolean;
    @Prop() name: string;

    /**
     * &#9624;   ▘ 'QUADRANT UPPER LEFT' (U+2598)
     * &#9612;   ▌ 'LEFT HALF BLOCK' (U+258C)
     * &#9614;   ▎ 'LEFT ONE QUARTER BLOCK' (U+258E)
     */
    private linkSymbol = () => (<span>&#9624;</span>);

    render() {
        return (
            <div>PluridLink {this.linkSymbol()}</div>
        );
    }
}
