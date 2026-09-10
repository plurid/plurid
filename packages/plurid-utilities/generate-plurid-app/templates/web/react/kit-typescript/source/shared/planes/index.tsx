import React from 'react';

import {
    PluridLink,
    usePluridPlane,
} from '@plurid/plurid-react';



/** The first page of the site: a plurid link opens the second one behind it. */
export const Home: React.FC = () => (
    <main style={{ padding: '48px 56px', maxWidth: 720 }}>
        <h1 style={{ margin: 0, fontSize: 32 }}>__#APP_NAME#__</h1>
        <p>A plurid application. This page is a plane in a 3D space; press <kbd>G</kbd> to reveal the space, <kbd>Escape</kbd> to come back.</p>
        <p>
            <PluridLink route="/about">about →</PluridLink>
        </p>
    </main>
);

/** A page that reads its own place through the plane lens. */
export const About: React.FC = () => {
    const { docked } = usePluridPlane();
    return (
        <main style={{ padding: '48px 56px', maxWidth: 720 }}>
            <h1 style={{ margin: 0, fontSize: 32 }}>about</h1>
            <p>{docked ? 'You are reading this page.' : 'This page floats in the space.'}</p>
            <p>
                <PluridLink route="/home">← home</PluridLink>
            </p>
        </main>
    );
};
