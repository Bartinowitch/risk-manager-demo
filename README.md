# Risk Manager demo

A browser-only demo of the [Risk Manager](https://atinote.ch/work/risk-manager/) with a made-up product launch: risk register, heat map, scoring and mitigations.

**Try it:** [atinote.ch/tools/risk-manager/demo](https://atinote.ch/tools/risk-manager/demo/)

| | Live tool | This demo |
|---|---|---|
| Data | Postgres with Row Level Security, shared by the team | This browser only (`localStorage`) |
| Access | Invitation only | Anyone, no login |
| AI coach | Claude | None |

`rm-demo.js` replaces the live tool's database layer. It exports the same functions but works on `localStorage`. `index.html` and `risk-manager.js` are generated from the live tool. Main differences: a demo banner, "Reset demo" instead of "Log out", fixed coach texts instead of Claude, and no invitation emails.

Run it with any static web server, for example `python3 -m http.server`, then open `http://localhost:8000`.

Inter font: SIL Open Font License, see `fonts/OFL.txt`.
