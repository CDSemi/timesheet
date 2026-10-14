import { describe, expect, it } from 'vitest';
import {
  effectiveTheme,
  nextTheme,
  parseStoredTheme,
  readStoredTheme,
  THEME_KEY,
  type ThemeStorage,
  writeStoredTheme,
} from '../../src/client/components/themeModel.ts';

/** A stand-in for Storage that keeps its values in a map. */
function memoryStorage(initial: Record<string, string> = {}): ThemeStorage & { values: Map<string, string> } {
  const values = new Map(Object.entries(initial));
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
  };
}

/** A storage whose every call throws, as a blocked or private-mode browser does. */
const blockedStorage: ThemeStorage = {
  getItem: () => {
    throw new Error('blocked');
  },
  setItem: () => {
    throw new Error('blocked');
  },
};

describe('parseStoredTheme', () => {
  it('accepts exactly the two themes', () => {
    expect(parseStoredTheme('light')).toBe('light');
    expect(parseStoredTheme('dark')).toBe('dark');
  });

  it('treats everything else as no choice', () => {
    for (const value of [null, undefined, '', 'Dark', 'LIGHT', 'system', 'auto', ' dark', 'dark ', '1']) {
      expect(parseStoredTheme(value), JSON.stringify(value)).toBeNull();
    }
  });
});

describe('effectiveTheme', () => {
  it('follows the device when nothing is stored', () => {
    expect(effectiveTheme(null, true)).toBe('dark');
    expect(effectiveTheme(null, false)).toBe('light');
  });

  it('lets a stored choice win over the device in all four combinations', () => {
    expect(effectiveTheme('light', true)).toBe('light');
    expect(effectiveTheme('light', false)).toBe('light');
    expect(effectiveTheme('dark', true)).toBe('dark');
    expect(effectiveTheme('dark', false)).toBe('dark');
  });
});

describe('nextTheme', () => {
  it('switches between the two states', () => {
    expect(nextTheme('light')).toBe('dark');
    expect(nextTheme('dark')).toBe('light');
  });

  it('stores the opposite of the effective theme at the first press', () => {
    // A dark device with no stored value shows "pressed"; the first press stores light.
    expect(nextTheme(effectiveTheme(null, true))).toBe('light');
    expect(nextTheme(effectiveTheme(null, false))).toBe('dark');
  });
});

describe('stored choice', () => {
  it('uses the documented key', () => {
    expect(THEME_KEY).toBe('timesheet.theme');
  });

  it('round-trips through the storage', () => {
    const storage = memoryStorage();
    expect(readStoredTheme(storage)).toBeNull();
    expect(writeStoredTheme(storage, 'dark')).toBe(true);
    expect(storage.values.get(THEME_KEY)).toBe('dark');
    expect(readStoredTheme(storage)).toBe('dark');
    expect(writeStoredTheme(storage, 'light')).toBe(true);
    expect(readStoredTheme(storage)).toBe('light');
  });

  it('ignores a stale or foreign stored value', () => {
    expect(readStoredTheme(memoryStorage({ [THEME_KEY]: 'sepia' }))).toBeNull();
  });

  it('survives blocked storage: reads give no choice and writes report the refusal', () => {
    expect(readStoredTheme(blockedStorage)).toBeNull();
    expect(writeStoredTheme(blockedStorage, 'dark')).toBe(false);
    expect(readStoredTheme(null)).toBeNull();
    expect(writeStoredTheme(null, 'dark')).toBe(false);
  });
});
