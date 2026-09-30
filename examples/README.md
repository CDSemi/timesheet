# Configuration examples

[policy.example.json](policy.example.json) is a specification example, not an importable production configuration yet. Implement validated forms/API and document any mapping. All addresses use example.invalid; no SMTP credentials are supplied.

The unsigned-deadline preference is true while production sending is false, outbound is dry-run and activation is null. These separate controls do not authorize a real send.

Default break offsets from arrival are 120/240/390 minutes and durations 15/30/15. At 08:00 they begin 10:00/12:00/14:30; at 09:00 they begin 11:00/13:00/15:30. Confirm actual breaks or none; unknown is pending.

[holidays.2026.example.json](holidays.2026.example.json) transcribes the nine company dates in the reference workbook template with source rows/hash. It is not a statutory calendar or a guarantee for next year. English names preserve the original, name_vi translates them. Annual review remains required.

Configure real sender/recipients, employee name, templates and signature privately in setup. Unknown template variables fail validation. The sample email is generic.
