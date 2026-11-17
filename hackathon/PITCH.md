# Locale check — idea card

> Guide: This card is the contract for the build. If a later idea changes the user, the moment, or the core loop, write a new card instead of drifting. Be concrete enough that someone could sketch the main screen from it. Delete "> Guide:" lines when done.

**One line:** {{<Product> helps <specific user> <outcome> by <mechanism>.}}

**User and moment:** {{a specific person at a specific moment, e.g. "a clinic receptionist at 8:55 a.m. when three patients cancel"}}

**Today (before):** {{what they do now, what it costs them: time, money, risk, frustration}}

**With us (after):** {{what they do instead, and what changes, by how much}}

**Core loop:** {{input}} → {{what the product does}} → {{visible result}} → {{what the user does next}}

## What a judge sees

> Guide: Describe the main screen and the demo moment with real example values, as if narrating a screenshot. Add a quick sketch, ASCII layout, or a generated concept image if it helps; label concept images as concepts.

{{3–6 sentences with sample data}}

**Wow moment:** {{the single moment that makes people lean in, and why it is real}}

## Why this needs AI and the required tech

{{The removal test: describe the loop without the AI / sponsor tech. If the result is basically the same, redesign.}}

**Data:** {{real source / public dataset / realistic sample, clearly labeled}}

## Fit to the judging criteria

| Criterion | Weight | Why this idea scores | Evidence we will show |
|---|---|---|---|
| {{...}} | {{...}} | {{...}} | {{...}} |

## Alternatives and our wedge

| Alternative (incl. "just use ChatGPT") | What it does | What it misses that we do |
|---|---|---|
| {{...}} | {{...}} | {{...}} |

## Business case (the judges' "impact" and "usefulness" questions)

> Guide: Even when no criterion says "business", impact judges ask: would people use and pay for this, and why can't they just use a mainstream tool? Use numbers where you have them, and say "estimate" when you don't.

- **Time or money saved/earned:** {{e.g. "permit reply drafted in 20 min instead of 2 weeks of consultant time"}}
- **Audience pool and beachhead:** {{who first (specific), how many like them, where it grows next}}
- **Why mainstream tools don't solve it:** {{blue-ocean check: the group, language, region, workflow or job they miss}}
- **Access advantage:** {{easier, cheaper or faster than the usual way: phone, voice, local language, inside an existing tool, no expert needed}}
- **Hard to copy:** {{encoded domain rules, curated data, an eval set, an integration, a community, or "nothing yet", said honestly}}
- **Who pays:** {{buyer and model, or the pilot partner who would adopt it}}

## DNA check

> Guide: Estimate 0–2 for each trait (run `python <skill>/scripts/pattern_fit.py --list-traits`), save as `hackathon/idea-dna.json`, then run `python <skill>/scripts/pattern_fit.py --criteria "<official criteria=weights>" --required-tech "<required technology>" --idea hackathon/idea-dna.json`. Fix the top gaps in the idea before building.

{{Paste the table-stakes check and the top gaps here}}

## Risks and scope

- **Biggest risk:** {{...}} → de-risk by {{the first spike, in the first hours}}
- **Must (core loop):** {{...}}
- **Should:** {{...}}
- **Could:** {{...}}
- **Out of scope:** {{...}}

**Selection:** {{score from score_ideas.py or the comparison table; runner-up ideas and why they lost}}
