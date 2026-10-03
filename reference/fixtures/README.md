# Acceptance fixtures

These are independent expected examples to turn into tests of production code, not a running application.

| File | Named scenarios |
|---|---:|
| [overtime_cases.json](overtime_cases.json) | 33 |
| [time_cases.json](time_cases.json) | 32 |
| [ledger_cases.json](ledger_cases.json) | 26 (16 deficit + 10 ledger) |
| Total | **91** |

Merge file defaults with each case; the case wins. Units are integer minutes; UTC strings end in Z. Null means unknown, not zero. Error strings identify semantic categories; map to documented API codes if necessary. Keep IDs in tests/handoffs. English JSON keys/enums are machine contracts; this paired guide explains them in both languages.

OT inputs already contain aggregated R/O. Eligible is before rounding; credited is provisional until finalization. OT-21 combines eligible 45+15 and rounds once to 60. OT-22 does not activate weekday excess 20, leaving only 16 off-calendar minutes to credit 30. OT-29 proves separate days never cross N together.

Time cases subtract confirmed excluded breaks. Complete cases default to confirmed break information; an empty list then means confirmed none. TM-32 overrides confirmation and remains pending. TM-01 is 09:00–18:00. TM-07/TM-08 cross midnight, including a split break. TM-10 aggregates 510 minutes 80 seconds to 511 whole minutes. TM-16 rejects a DST gap, TM-17 requires a fold choice, TM-18/TM-19 identify the two instants. TM-20/TM-21 count elapsed UTC time. TM-25–TM-28 distinguish old/current/finalized edits. TM-29 keeps a personal Off Tuesday in the normal calendar.

Deficit defaults describe a complete normal day. Debit is a positive magnitude that posts as a negative delta. DF-11 is unknown with no debit. DF-12 counts 120 regular+120 off-calendar toward the 480 attendance target while keeping off-calendar OT eligibility.

Ledger scenarios begin at the given posted opening balance with no reservations. Opening balance is setup, excluded from new_deltas. Duplicate sources may return an existing result or typed duplicate error, but never append again. LG-07 requires only one successful concurrent reservation; it does not choose the winner. LG-08 allows a truthful correcting negative balance, not silent new overdrafts. Approval reserves; consumption posts; label/leave_kind changes (LG-10: leave_kind ot is not a day category) and resends do neither.

Package validation checks fixture arithmetic/time/consistency. It does not execute application transactions, authorization, concurrency or email. Those remain required implementation gates.
