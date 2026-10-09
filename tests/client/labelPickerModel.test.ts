import { describe, expect, it } from 'vitest';
import type { DayBatchPreview, DayEntry, DayView } from '../../src/client/api.ts';
import { currentLabelChoice, LABEL_CHOICES, labelEntry, labelPreviewOutcome } from '../../src/client/components/labelPickerModel.ts';

function day(overrides: Partial<DayView> = {}): DayView {
  return {
    work_date: '2026-11-30',
    classification: { day_class: 'normal', reason: 'scheduled_weekday', name: null },
    default_category: 'Worked',
    category: 'Worked',
    category_source: 'default',
    attendance_expected: true,
    leave_minutes: 0,
    leave_kind: null,
    wfh: false,
    ot_leave: { kind_minutes: 0, consumed_minutes: 0, reversed_minutes: 0, mismatch: false },
    entry: null,
    sessions: [],
    calculation: null,
    calculation_error: null,
    deficit_minutes: null,
    edit: { period_relation: 'current', reason_required: false },
    ...overrides,
  };
}

function preview(overrides: Partial<DayBatchPreview> = {}): DayBatchPreview {
  return {
    mode: 'preview',
    can_commit: true,
    changed_count: 1,
    reason_required: false,
    reason_required_dates: [],
    requires_conflict_confirmation: false,
    conflicts: [],
    entries: [],
    ...overrides,
  };
}

function entry(version: number): DayEntry {
  return {
    id: 'e1',
    work_date: '2026-11-30',
    category: 'Worked',
    category_source: 'explicit',
    leave_minutes: 0,
    leave_kind: null,
    wfh: false,
    notes: '',
    version,
  };
}

describe('in-cell label picker (E-3 a)', () => {
  it('offers the app categories in order, then Work from home', () => {
    expect(LABEL_CHOICES).toEqual(['Worked', 'Off', 'Vacation', 'Sick', 'Holiday', 'Shutdown', 'Work from home']);
  });

  it('shows the current label, with Work from home for a worked WFH day and none without a category', () => {
    expect(currentLabelChoice(day())).toBe('Worked');
    expect(currentLabelChoice(day({ wfh: true }))).toBe('Work from home');
    expect(currentLabelChoice(day({ category: 'Vacation', wfh: true }))).toBe('Vacation');
    expect(currentLabelChoice(day({ category: null }))).toBeNull();
  });

  it('builds one batch entry with the version the page loaded; only Worked and Work from home touch WFH', () => {
    expect(labelEntry(day(), 'Vacation')).toEqual({ work_date: '2026-11-30', category: 'Vacation', expected_version: null });
    expect(labelEntry(day({ entry: entry(7) }), 'Off')).toEqual({ work_date: '2026-11-30', category: 'Off', expected_version: 7 });
    expect(labelEntry(day({ entry: entry(2) }), 'Work from home')).toEqual({ work_date: '2026-11-30', category: 'Worked', wfh: true, expected_version: 2 });
    expect(labelEntry(day({ wfh: true }), 'Worked')).toEqual({ work_date: '2026-11-30', category: 'Worked', wfh: false, expected_version: null });
    // Leave and notes are never sent: the server keeps them as stored.
    const sent = labelEntry(day({ leave_minutes: 240, leave_kind: 'vacation' }), 'Sick');
    expect(Object.keys(sent).sort()).toEqual(['category', 'expected_version', 'work_date']);
  });

  it('commits straight away only when the preview needs neither a reason nor a conflict confirmation', () => {
    expect(labelPreviewOutcome(preview())).toBe('commit');
    expect(labelPreviewOutcome(preview({ changed_count: 0 }))).toBe('unchanged');
  });

  it('opens the review dialog for a reason (AC-04), a conflict with recorded work, or a date that cannot change', () => {
    expect(labelPreviewOutcome(preview({ reason_required: true, reason_required_dates: ['2026-11-30'] }))).toBe('review');
    expect(labelPreviewOutcome(preview({ requires_conflict_confirmation: true }))).toBe('review');
    expect(labelPreviewOutcome(preview({ can_commit: false }))).toBe('review');
    expect(labelPreviewOutcome(preview({ can_commit: false, changed_count: 0 }))).toBe('review');
  });
});
