# Reference workbook template

[Timesheet_Rev8_2026.xlsx](Timesheet_Rev8_2026.xlsx) is a public sample derived from the supplied “Timesheet - Rev8 - 2026.xlsx,” renamed only for a portable path. On 2026-09-30 the owner removed all personal data and published it as a template; the personal original is not retained.

- Removed: the eight dated payroll sheets (2026.01.09 to 2026.04.17) with the attendance history, the employee name, the signature images, the author/last-modified-by properties and the local folder path Excel stores.
- Contents: three sheets — Working Infos (day labels, a time table and payroll dates from 2022-12-30 to 2035-12-28), Holiday Dates (the nine 2026 company holidays) and the Timesheet form with the company header. The “remove personal information from file properties on save” flag is set, so Excel keeps the author fields empty.
- Size 25,878 bytes; SHA-256 47ef42d5e4a9b7aea0be545ed563d3d22987609b59bd846c1c08dec2d29c6331. The historical r1.1 manifests still list the personal original (94,537 bytes, SHA-256 477984c3…a877f33).
- In Timesheet, daily formulas subtract 8.5 hours. X24 sums B16:Y16 and B23:Y23, omitting Sunday Z16/Z23. W26 uses TODAY().

Use it for report structure and, filled with synthetic dated sheets, for import preview. New requirements replace inherited formulas. It does not establish genuine historical sign-off, email delivery or opening OT balance.

Never add names, signatures, attendance history or other personal data to the tracked template, and keep it out of production images. Read without re-saving through a library that might drop Excel features. Record any deliberate change here with its new hash, and re-check the metadata after every Excel save before committing.
