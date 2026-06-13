import { createOrderProvider } from '../data/mock/provider.js';
import { AppShell } from './shell.js';

const root = document.getElementById('app');
if (!root) {
  throw new Error('Root element #app not found');
}

const provider = createOrderProvider();
const shell = new AppShell({ provider, rootElement: root });
shell.init();
