import type { GranteeChange } from '../api.ts';

/**
 * One line of the owner's Review hint (WP3-C-01): how many days of the period were last changed by a
 * person the owner shares with, named by the server's display name (never an id or an address).
 */
export function granteeChangeText(change: Pick<GranteeChange, 'days' | 'display_name'>): string {
  return `${change.days} ${change.days === 1 ? 'day' : 'days'} last changed by ${change.display_name}`;
}
