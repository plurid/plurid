import React from 'react';
import {
  PluridApplication, PluridPartialConfiguration, PluridReactPlane, SPACE_LAYOUT,
} from '@plurid/plurid-react';
import Plane from './Plane';
const App = () => {
  const configuration: PluridPartialConfiguration = {
    global: { theme: 'plurid' },
    space: { layout: { type: SPACE_LAYOUT.COLUMNS, columns: 1, gap: 0.1 }, center: true },
    elements: { plane: { width: 0.5 } },
  };
  const planes: PluridReactPlane[] = [{ route: '/plane', component: Plane }];
  return <PluridApplication configuration={configuration} planes={planes} view={['/plane']} />;
};
export default App;
