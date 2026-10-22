import { describe, expect, it } from 'vitest';
import {
  CONTENT_WIDTH,
  LEFT_COLUMN,
  MARGIN,
  MAX_SESSION_LINES,
  PAGE_HEIGHT,
  PAGE_WIDTH,
  pdfLayout,
  rotatedLabelOrigin,
  SIGNATURE_BOX,
  WEEK_TABLE_HEIGHT,
} from '../../src/server/pdf/layout.ts';

/*
 * WP5-UX5-T02: the pure one-page geometry of the timesheet PDF against the numbers of plan Addendum 2 ("C, revised"),
 * all in points from the top of a US Letter page. Pure functions: no PDF is drawn here.
 */
const VARIANTS = [
  { timeRows: true, otRows: true },
  { timeRows: true, otRows: false },
  { timeRows: false, otRows: true },
  { timeRows: false, otRows: false },
] as const;
const LINES = [1, 2, 3, 4] as const;
const near = (actual: number, expected: number, message: string): void => expect(Math.abs(actual - expected), `${message}: ${actual} vs ${expected}`).toBeLessThanOrEqual(1);

describe('pdfLayout fits one page in every variant', () => {
  for (const variant of VARIANTS) {
    for (const sessionLines of LINES) {
      it(`time ${variant.timeRows} ot ${variant.otRows}, ${sessionLines} session line(s) a day: ends above the bottom margin, rows add up, nothing overlaps`, () => {
        const layout = pdfLayout({ ...variant, sessionLines });
        expect(layout.bottom).toBeLessThanOrEqual(PAGE_HEIGHT - MARGIN);
        const [one, two] = layout.weeks;
        for (const week of layout.weeks) {
          const parts = [week.head.height, week.category.height, week.time?.height ?? 0, week.ot?.height ?? 0];
          expect(parts.reduce((sum, value) => sum + value, 0)).toBeCloseTo(WEEK_TABLE_HEIGHT, 6);
          expect(week.bottom - week.top).toBeCloseTo(WEEK_TABLE_HEIGHT, 6);
          expect(week.category.height).toBeGreaterThanOrEqual(36);
          expect(week.category.top).toBeCloseTo(week.head.top + week.head.height, 6);
          if (week.time !== null) {
            expect(week.time.top).toBeCloseTo(week.category.top + week.category.height, 6);
            expect(week.time.height).toBeCloseTo(week.time.lines * week.time.lineHeight, 6);
          }
          if (week.ot !== null) expect(week.ot.top + week.ot.height).toBeCloseTo(week.bottom, 6);
        }
        // Reading order, top to bottom, with a gap between the blocks.
        expect(layout.header.logoTop + layout.header.logoSize).toBeLessThan(layout.titles.companyBaseline);
        expect(layout.titles.titleBaseline).toBeLessThan(layout.noteBaseline);
        expect(layout.noteBaseline).toBeLessThan(layout.fields.employeeBaseline);
        expect(layout.fields.employeeBaseline).toBeLessThan(layout.fields.periodBaseline);
        expect(layout.fields.periodBaseline).toBeLessThan(one.top);
        expect(one.bottom).toBeLessThan(two.top);
        expect(two.bottom).toBeLessThan(layout.total.baseline - 8);
        expect(layout.total.baseline).toBeLessThan(layout.signature.imageBottom - SIGNATURE_BOX.height);
        expect(layout.signature.employeeLine.y).toBeLessThan(layout.signature.managerLine.y);
        expect(layout.signature.managerLine.y + layout.signature.captionBaseline + 3).toBeLessThan(layout.footer.ruleY);
        expect(layout.footer.baseline).toBeLessThan(layout.bottom);
      });
    }
  }

  it('stacks at most four session lines and treats a missing or silly count as one', () => {
    expect(MAX_SESSION_LINES).toBe(4);
    expect(pdfLayout({ timeRows: true, otRows: true, sessionLines: 99 }).weeks[0].time?.lines).toBe(4);
    expect(pdfLayout({ timeRows: true, otRows: true, sessionLines: 0 }).weeks[0].time?.lines).toBe(1);
    expect(pdfLayout({ timeRows: true, otRows: true }).weeks[0].time?.lines).toBe(1);
  });

  it('is pure: the same input gives an equal result', () => {
    expect(pdfLayout({ timeRows: true, otRows: false, sessionLines: 3 })).toEqual(pdfLayout({ timeRows: true, otRows: false, sessionLines: 3 }));
  });
});

describe('pdfLayout matches plan Addendum 2 within 1 pt', () => {
  const full = pdfLayout({ timeRows: true, otRows: true });

  it('draws the week tables 136 pt tall with a 19 pt left column and rows of 34, 69, 16 and 17 pt at the planned tops', () => {
    near(full.weeks[0].top, 192, 'week 1 top');
    near(full.weeks[0].bottom, 328, 'week 1 bottom');
    near(full.weeks[1].top, 358, 'week 2 top');
    near(full.weeks[1].bottom, 494, 'week 2 bottom');
    for (const week of full.weeks) {
      near(week.height, 136, 'height');
      near(week.leftColumn, LEFT_COLUMN, 'left column');
      near(week.leftColumn, 19, 'left column is 19 pt');
      near(week.head.height, 34, 'header row');
      near(week.category.height, 69, 'category row');
      near(week.time?.height ?? 0, 16, 'time row');
      near(week.ot?.height ?? 0, 17, 'OT row');
      near(week.dayWidth * 7 + week.leftColumn, CONTENT_WIDTH, 'the seven columns fill the content width');
      near(week.left, MARGIN, 'table left edge');
      near(week.right, PAGE_WIDTH - MARGIN, 'table right edge');
    }
  });

  it('gives the height of a hidden row to the category row', () => {
    near(pdfLayout({ timeRows: false, otRows: true }).weeks[0].category.height, 69 + 16, 'time rows off');
    near(pdfLayout({ timeRows: true, otRows: false }).weeks[0].category.height, 69 + 17, 'OT rows off');
    near(pdfLayout({ timeRows: false, otRows: false }).weeks[0].category.height, 69 + 16 + 17, 'both off');
    near(pdfLayout({ timeRows: true, otRows: true, sessionLines: 4 }).weeks[0].category.height, 37, 'four stacked sessions');
    expect(pdfLayout({ timeRows: false, otRows: false }).weeks[0].otLabel).toBeNull();
    near(full.weeks[0].otLabel?.height ?? 0, 33, 'the OT label spans the time and OT rows');
    near(pdfLayout({ timeRows: false, otRows: true }).weeks[0].otLabel?.height ?? 0, 17, 'the OT label spans the OT row alone');
  });

  it('places the field labels 54 pt inside both margins and the header, titles, total and footer at the planned heights', () => {
    near(full.fields.left, MARGIN + 54, 'field left edge');
    near(full.fields.rightEdge, PAGE_WIDTH - MARGIN - 54, 'Payroll Date right edge');
    near(full.header.logoTop, 29, 'logo top');
    near(full.header.logoSize, 32, 'logo size');
    near(full.header.wordmarkHeight, 17.6, 'wordmark box');
    near(full.titles.companyBaseline, 84, 'title 1 baseline');
    near(full.titles.titleBaseline - full.titles.companyBaseline, 28, 'title 2 sits 28 pt below title 1');
    near(full.total.rightEdge, full.weeks[0].right - 35, 'overtime total right edge');
    near(full.footer.baseline, 752, 'footer');
    expect(full.bottom).toBeLessThanOrEqual(756);
  });

  it('draws the signature block with the reference lines: 148 pt employee line at x 55, 74 pt date line at x 443, rows 80 pt apart', () => {
    const { employeeLine, employeeDateLine, managerLine, managerDateLine } = full.signature;
    near(employeeLine.x1, 55, 'employee line x');
    near(employeeLine.x2 - employeeLine.x1, 148, 'employee line length');
    near(employeeDateLine.x1, 443, 'date line x');
    near(employeeDateLine.x2 - employeeDateLine.x1, 74, 'date line length');
    near(employeeLine.y, 600, 'employee line');
    near(managerLine.y, 680, 'manager line');
    near(managerLine.x1, employeeLine.x1, 'the lines align by column');
    near(managerLine.x2, employeeLine.x2, 'the lines align by column');
    near(managerDateLine.x1, employeeDateLine.x1, 'the date lines align by column');
    near(managerDateLine.x2, employeeDateLine.x2, 'the date lines align by column');
    expect(SIGNATURE_BOX).toEqual({ width: 152, height: 54 });
  });
});

describe('rotatedLabelOrigin', () => {
  it('centres rotated text in its cell both ways: the glyph body centre is the cell centre', () => {
    const cell = { x: 36, top: 192, width: 19, height: 34 };
    const width = 20;
    const cap = 7.65;
    const origin = rotatedLabelOrigin(cell, width, cap);
    // Reading upward: the baseline is the right side of the glyph body, whose height extends to the left.
    expect(origin.x - cap / 2).toBeCloseTo(cell.x + cell.width / 2, 6);
    expect(origin.y + width / 2).toBeCloseTo(PAGE_HEIGHT - (cell.top + cell.height / 2), 6);
  });
});
