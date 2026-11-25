# Locale check — launch posts (drafts)

The rules need at least 2 public posts (HN, X, Reddit or LinkedIn) with #KaneCLIHackDay. **The user posts these.** Attach the report screenshot (`docs/report-hero.png`) or a 10–20 s clip from the video. The video link is filled in.

## Post 1 — X (fits 280 characters, each link counted as 23)

Your app ships in 6 languages. Who checks the Arabic one?

Locale check: one Kane CLI test, every language. Claude Code fixes what breaks; Kane re-checks.

Kane confirmed Open Library's Arabic UI runs left-to-right.

github.com/freddy-tama/locale-check
youtu.be/1wF4Xzcs3d4
#KaneCLIHackDay

## Post 2 — LinkedIn (or Reddit r/webdev, with the same text minus hashtags but the footer)

Translations ship in batches, and nobody on the team reads all of them. String linters check that every key exists. They don't notice that the German label pushes the Pay button out of its card, that an Arabic layout puts a help bubble on top of Continue, or that the date format the page asks for is then rejected.

For the Kane CLI hackathon I built Locale check:

- You write one plain-English objective ("add a product, check out, verify each button is visible and labelled in {language}").
- Kane CLI runs it in a real browser in every language your app ships, three at a time, and a one-file report shows red or green per language with Kane's screenshot, its root cause and a replay.
- The failures Kane confirms as app bugs go to Claude Code with Kane's evidence. Claude fixes the code, and Kane re-runs only the red languages.

On a six-language demo shop it caught four locale bugs and Claude fixed them in one round. On a live open-source site, Open Library, I had spotted by hand that the Arabic page never sets dir="rtl"; a generic Kane check that names no element confirmed what users see: the Arabic interface is served left-to-right.

What I learned: write checks positively and put them at the step where they apply. And trust Kane's own triage. It labels its own missteps, so a flaky run never reaches the agent as a "bug".

Repo (MIT): https://github.com/freddy-tama/locale-check
Video: https://youtu.be/1wF4Xzcs3d4

#KaneCLIHackDay

## Optional — Show HN

**Title:** Show HN: Locale check – one Kane CLI test in every language, Claude Code fixes the red ones

**Text:** Post 2, first three paragraphs, plus the repo link. HN strips hashtags in titles; put #KaneCLIHackDay at the end of the text.
