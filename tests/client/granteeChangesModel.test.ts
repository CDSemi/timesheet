import { describe, expect, it } from 'vitest';
import { granteeChangeText } from '../../src/client/components/granteeChangesModel.ts';

describe('the owner Review hint (WP3-C-01)', () => {
  it('words the count and the grantee by name, singular and plural', () => {
    expect(granteeChangeText({ days: 1, display_name: 'Synthetic Grantee' })).toBe('1 day last changed by Synthetic Grantee');
    expect(granteeChangeText({ days: 3, display_name: 'Synthetic Grantee' })).toBe('3 days last changed by Synthetic Grantee');
  });
});
