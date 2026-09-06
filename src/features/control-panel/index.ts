import { mount } from 'svelte';
import ControlPanel from './ControlPanel.svelte';
import controlPanelStyles from './control-panel.css?inline';

const HOST_ID = 'tcdb-enhanced-control-panel';

export function initControlPanel(): void {
  if (document.getElementById(HOST_ID)) return;

  const host = document.createElement('div');
  host.id = HOST_ID;
  const shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = controlPanelStyles;
  shadow.append(style);
  (document.body ?? document.documentElement).append(host);

  const panel = mount(ControlPanel, { target: shadow });
  shadow.addEventListener('keydown', (event) => {
    if ((event as KeyboardEvent).key === 'Escape') panel.close();
  });
}
