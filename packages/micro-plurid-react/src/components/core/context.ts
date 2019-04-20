import React from 'react';

export const PluridContext = React.createContext( {
    roots: {
        matrix3d: '',
        rotX: 0,
        rotY: 0,
        rotZ: 0,
        transX: 0,
        transY: 0,
        transZ: 0,
    }
});
