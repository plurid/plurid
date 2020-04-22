import {
    Indexed,
} from '@plurid/plurid-data';



export interface PluridRendererConfiguration {
    head: string;
    styles: string;
    content: string;
    store: string;
    root?: string;
    script?: string;
    vendorScript?: string;
    stripeScript?: string;
    htmlAttributes?: string;
    bodyAttributes?: string;
}


export interface StillerOptions {
    host: string;
    routes: string[];
}


export interface StilledSpace {
    id: string;
    html: string;
    route: string;
    pages: Indexed<StilledPage>
}


export interface StilledPage {
    route: string;
    html: string;
    stilltime: number;
}

export interface StilledMetadataEntry {
    route: string;
    name: string;
}


export interface StillsGeneratorOptions {
    server: string;
    build: string;
}
