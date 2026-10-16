import type { User } from '../api.ts';
import { type SettingsSection, settingsSectionsFor } from './routeModel.ts';

/**
 * The sections of Settings (WP5-UX3-T03): Personal, Profile and, for administrators only, Administration. They are links
 * with their own address, not ARIA tabs: each section is a page with its own heading and the back button walks between
 * them. The link of the page shown is marked with `aria-current="page"` (and a heavier look, so the state is not shown by
 * colour alone). The nav is a convenience only; the server answers 403 on every admin route.
 */
export function SettingsNav({ role, current }: { role: User['role']; current: SettingsSection['id'] }) {
  return (
    <nav className="settings-nav" aria-label="Settings sections">
      {settingsSectionsFor(role).map((section) => (
        <a key={section.id} className="nav-link" href={section.hash} aria-current={section.id === current ? 'page' : undefined}>
          {section.label}
        </a>
      ))}
    </nav>
  );
}
