import type { ActivityEvent } from '../../types/activity.js';

export function renderActivityLog(events: ActivityEvent[]): string {
  if (events.length === 0) {
    return `
      <section class="activity-log" aria-label="Activity log">
        <h2 class="activity-log-heading">Activity Log</h2>
        <p class="activity-log-empty">No events yet.</p>
      </section>
    `;
  }

  return `
    <section class="activity-log" aria-label="Activity log">
      <h2 class="activity-log-heading">
        Activity Log
        <span class="activity-count">${events.length}</span>
      </h2>
      <ol class="activity-list">
        ${events.map(e => `
          <li class="activity-item activity-${e.type}">
            <time class="activity-time" datetime="${e.timestamp}">
              ${new Date(e.timestamp).toLocaleTimeString('de-DE')}
            </time>
            <span class="activity-type-badge">${formatType(e.type)}</span>
            <span class="activity-message">${e.message}</span>
            ${e.orderId ? `<code class="activity-order-id">${e.orderId}</code>` : ''}
          </li>
        `).join('')}
      </ol>
    </section>
  `;
}

function formatType(type: string): string {
  const labels: Record<string, string> = {
    'app-initialized': 'Init',
    'order-processed': 'Processed',
    'duplicate-prevented': 'Duplicate',
    'reset': 'Reset'
  };
  return labels[type] ?? type;
}
