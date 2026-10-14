/*
 * Applies the stored colour theme before the first paint (WP5-UX2-T01). A classic, blocking script in
 * the head of index.html: it is a same-origin file, so the content security policy (script-src 'self')
 * allows it, and it only sets an attribute (no inline style). Without a stored choice nothing is set and
 * the page follows the device through the prefers-color-scheme media query. The key and the two values
 * are the ones of src/client/components/themeModel.ts. Blocked or absent storage must never break the page.
 */
(function applyStoredTheme() {
  try {
    var stored = window.localStorage.getItem('timesheet.theme');
    if (stored === 'light' || stored === 'dark') {
      document.documentElement.setAttribute('data-theme', stored);
    }
  } catch {
    // Storage is blocked: follow the device until the person presses the toggle.
  }
})();
