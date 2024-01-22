import React from 'react';
import Remediations from './AppEntry';
import { createRoot } from 'react-dom/client';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<Remediations />);
