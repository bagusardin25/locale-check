# Free resources for the 2:45 canvas demo video (research only, nothing downloaded)

Verification: "opened" = page fetched this session. File sizes marked HEAD were read with an HTTP HEAD request (no body downloaded). Anything not shown on a page is marked "not shown".

## 1. Fonts (both SIL OFL 1.1, free for video, no credit required; keep the licence file if you redistribute the font files)

| Item | Licence | Size / format | URL (opened) | Fit |
|---|---|---|---|---|
| Inter (captions, labels) | OFL 1.1, "Copyright (c) 2016 The Inter Project Authors" | Official zip 33,707,794 bytes (Inter-4.1.zip, GitHub API). Fontsource woff2 Latin subset: 400 = 23,664 B, 600 = 24,452 B, variable (all weights) = 48,256 B (HEAD) | https://github.com/rsms/inter/releases/latest ; licence https://raw.githubusercontent.com/rsms/inter/master/LICENSE.txt ; woff2 e.g. https://cdn.jsdelivr.net/npm/@fontsource/inter@5.3.0/files/inter-latin-600-normal.woff2 ; page https://fontsource.org/fonts/inter | Screen-optimised, clear at 40-48 px caption size on 1080p |
| JetBrains Mono (terminal, diffs) | OFL 1.1 (source code Apache 2.0) | Official zip 5,622,857 bytes (v2.304, GitHub API). Fontsource woff2 Latin: 400 = 21,168 B, 500 = 21,832 B (HEAD) | https://github.com/JetBrains/JetBrainsMono ; woff2 e.g. https://cdn.jsdelivr.net/npm/@fontsource/jetbrains-mono@5.3.0/files/jetbrains-mono-latin-400-normal.woff2 | Tall x-height, ligatures optional (turn off for terminal replay), readable at 22-26 px |
| IBM Plex Sans (alternative caption face) | OFL 1.1 (not re-verified on page) | zip 9,921,777 bytes (GitHub API) | https://github.com/IBM/plex/releases | Backup only |

Notes: Canvas needs the font loaded before drawing: `new FontFace(...).load()` then `document.fonts.add`, from a local file (no network at render time). I did not open fonts.google.com licence text (page returned no body); the OFL claim rests on the GitHub LICENSE.txt and the Fontsource page.

## 2. Music

### A. Kevin MacLeod / incompetech (recommended: CC BY 4.0, credit in description)
Catalogue read from https://incompetech.com/music/royalty-free/pieces.json (lengths, ISRC, feel). Track page pattern: https://incompetech.com/music/royalty-free/index.html?isrc=<ISRC> (page is JavaScript-rendered, so I could not read it as text; length/ISRC come from pieces.json). MP3 URL pattern: https://incompetech.com/music/royalty-free/mp3-royaltyfree/<Title>.mp3 (size from HEAD).

| Track | Length | Feel (site tags) | ISRC / track page | MP3 size (HEAD) |
|---|---|---|---|---|
| Screen Saver | 3:02 | Calming, Grooving, Relaxed; synths, 120 bpm | USUAN1900046 https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1900046 | 7,417,751 B |
| Floating Cities | 3:04 | Somber, Relaxed, Mystical, Calming; synths, 120 bpm | USUAN1600018 https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1600018 | 5,892,113 B |
| Lobby Time | 3:13 | Calming, Grooving, Relaxed; vibraphone/piano/bass | USUAN1600054 https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1600054 | 6,184,700 B |
| Pleasant Porridge | 2:51 | Calming, Grooving, Relaxed; electric piano/guitar | USUAN2100004 https://incompetech.com/music/royalty-free/index.html?isrc=USUAN2100004 | 3,432,122 B |
| Space 1990-B | 2:59 | Bright, Calming, Grooving; synths, bells, 82 bpm | USUAN1200109 https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1200109 | 7,147,497 B |

All five are longer than 2:45 by 6-28 s except Pleasant Porridge (6 s over): trim and fade out. Best first listen for a "quiet tech bed": Screen Saver, Floating Cities, Space 1990-B (listen before choosing; I judged by tags only).

Licence and credit (https://incompetech.com/music/royalty-free/faq.html, opened): free under Creative Commons Attribution 4.0, monetisation allowed. Credit block, put in the YouTube description:
```
"<Title>" Kevin MacLeod (incompetech.com)
Licensed under Creative Commons: By Attribution 4.0
https://creativecommons.org/licenses/by/4.0/
```
The licences page (https://incompetech.com/music/royalty-free/licenses/) offers "Creative Commons, Free" (credit required) or a paid Standard License (no credit); it did not itself name CC BY 4.0 version, the FAQ did.

Content ID, honestly (https://incompetech.com/music/royalty-free/youtube-contentid.html, opened): claims can still happen. The page says the music is pre-registered so others cannot register it falsely, but does not promise an allow-list. Steps it gives: put the credit in the text description first, dispute inside YouTube Studio (release usually within 72 h), email help@incompetech.com if stuck. Each track has an ISRC to quote in a dispute. Risk: low-to-moderate, resolvable.

### B. Pixabay Music (Pixabay Content License: free, no credit needed, commercial OK)
Licence summary (https://pixabay.com/service/license-summary/, opened): modify allowed, attribution not required, no standalone redistribution, no trademark use.
Content ID (https://pixabay.com/service/faq/, opened): some tracks are registered with Content ID, so a claim is possible even under the licence; a claim does not hurt channel standing; dispute in YouTube Studio with the track URL. Each track page shows a "Content ID Registered" line. I checked these pages:

| Track | Artist | Length | Content ID marker | URL |
|---|---|---|---|---|
| Soft Minimalist Ambient | YuraSoop | 2:58 | not stated (best Pixabay pick) | https://pixabay.com/music/ambient-soft-minimalist-ambient-519879/ |
| Digital Technology | AtlasAudio | 2:36 | not stated | https://pixabay.com/music/corporate-digital-technology-617560/ |
| Soft Corporate | PaulYudin | 2:55 | REGISTERED, avoid | https://pixabay.com/music/corporate-soft-corporate-452237/ |
| Ambient | NastelBom | 2:31 | REGISTERED, avoid | https://pixabay.com/music/ambient-ambient-495893/ |
| Calm Minimal | Kulakovka | 2:30 | REGISTERED, avoid | https://pixabay.com/music/upbeat-calm-minimal-275611/ |
| Tech Ambient | VelarioMusic | 2:49 | REGISTERED, avoid | https://pixabay.com/music/ambient-tech-ambient-612419/ |
| LoFi Tech | The_Mountain | 2:48 | REGISTERED, avoid | https://pixabay.com/music/corporate-lofi-tech-151201/ |
| Minimal Tech | PaulYudin | 2:40 | REGISTERED, avoid | https://pixabay.com/music/corporate-minimal-tech-151898/ |

File sizes: not shown on any Pixabay page (MP3). "Not stated" is not proof of no registration; the track page shows it only for some. Pixabay is the weaker choice for Content ID.

### C. Not verified
- YouTube Audio Library: needs a signed-in YouTube Studio; I could not open it. Tracks there are safe from claims on YouTube in principle, but check each track's attribution flag.
- Free Music Archive (https://freemusicarchive.org/about, opened): CC-licensed, run by Tribe of Noise, site is mid-rebuild; no specific tracks checked, per-track CC type (BY vs BY-NC) must be read on each page, and the page says nothing about Content ID.

## 3. Sound effects

### CC0 (no credit, no Content ID concern in practice)
| Item | Licence | Size / format | URL (opened) | Fit |
|---|---|---|---|---|
| Kenney "Interface Sounds" (100 files; clicks, ticks, confirmations, errors) | CC0, credit optional (https://kenney.nl/support) | zip size not shown; direct zip links blocked (403) | https://kenney.nl/assets/interface-sounds | Single source for soft click, confirm, error in one consistent family |
| Kenney "UI Audio" (50 files) | CC0 | size not shown | https://kenney.nl/assets/ui-audio | Alternative click/switch set |
| Freesound "Heal Restore" by Qvantor | CC0 | 3.2 s, WAV 48 kHz 24-bit stereo, 911.1 KB | https://freesound.org/people/Qvantor/sounds/878621/ | Gentle rising success chime for "all green" moment |

Freesound needs a free login to download (https://freesound.org/help/faq/). Other CC0 UI results from the search (durations on that listing looked like download counts, not lengths, so do not trust them): https://freesound.org/people/TommasoMotteran/sounds/851556/ (soft confirm click), https://freesound.org/people/Jummit/sounds/528561/ (soft UI button click), https://freesound.org/people/Nomagician/sounds/833628/ (cancel/back). I did not open those pages, so I did not confirm that each is CC0 individually; the search was filtered to CC0.

### Pixabay SFX (Pixabay Content License, MP3, size not shown; Content ID marker not stated on pages opened)
- Soft click: Soft UI Click, Universfield, 0:01 https://pixabay.com/sound-effects/film-special-effects-soft-ui-click-147352/
- Soft tap: Soft App Button Tap Sound #2, Vadim_Makes_Sound, 0:01 https://pixabay.com/sound-effects/technology-soft-app-button-tap-sound-2-547872/
- Success: UI Success Chime, SoundShelfStudio, 0:01 https://pixabay.com/sound-effects/technology-ui-success-chime-513565/
- Error: Error Notification, Universfield, 0:01 https://pixabay.com/sound-effects/film-special-effects-error-notification-352286/ ; softer: Soft UI Warning Alert 1, Vadim_Makes_Sound https://pixabay.com/sound-effects/film-special-effects-soft-ui-warning-alert-1-614153/
- Whoosh: Soft luxury air whoosh #8, Sdanezis, 0:02 https://pixabay.com/sound-effects/film-special-effects-soft-luxury-air-whoosh-8-592506/ ; Minimalist Light Whoosh FX, Chrysalyn, 0:01 https://pixabay.com/sound-effects/film-special-effects-minimalist-light-whoosh-fx-547374/

Caveat: a few Pixabay uploads are re-posts ("freesound_community"); prefer original authors. I could not listen to anything; names are from titles only.

## 4. Guides and specs
| Item | What it gives | URL (opened) | Licence note |
|---|---|---|---|
| Netflix English Timed Text Style Guide | 42 characters per line, max 2 lines, up to 20 characters per second for adults, line-break rules | https://partnerhelp.netflixstudios.com/hc/en-us/articles/217350977-English-Timed-Text-Style-Guide | Reference reading; do not copy text |
| Netflix subtitle timing guidelines | Min event 5/6 s, max 7 s; frame-gap section removed in 2020 | https://partnerhelp.netflixstudios.com/hc/en-us/articles/215758617-Timed-Text-Style-Guide-Subtitle-Timing-Guidelines | same |
| YouTube recommended upload encoding | MP4, H.264 High, closed GOP of half the frame rate (15 at 30 fps), 8 Mbps for 1080p SDR 30 fps, 4:2:0, BT.709, AAC-LC 384 kbps stereo at 48 kHz, moov atom first | https://support.google.com/youtube/answer/1722171 | Official |
| YouTube loudness | No official YouTube page found. Third-party sources claim normalisation to about -14 LUFS, turning loud audio down only, keep 1-2 dBTP headroom. Verify via "Stats for nerds" | https://www.sageaudio.com/articles/mastering-for-streaming-platform-loudness-and-normalization-explained | Unofficial, flagged |
| Safe areas | Historic title-safe 80% and action-safe 90%; a 2009 SMPTE revision uses 90% for both and EBU R95 covers 16:9. Secondary sources only; EBU R95 itself not opened. Practical: keep captions inside the central 90% (about 96 px side margins, 54 px top/bottom at 1920x1080), and more for phones | https://www.provideocoalition.com/unsafe_areas/ (appeared in search; not opened in full) | Secondary |
| Storyboard templates (free 16:9 PDFs) | Boords https://boords.com/storyboard-template/video ; StudioBinder https://www.studiobinder.com/templates/storyboards/storyboarding-video-template/ | Surfaced by search; not opened, licences unchecked | Unclear, personal use likely only |
| BBC Subtitle Guidelines | Could not open (bbc.github.io returned 404 and bbc.co.uk is blocked for my fetcher). Canonical address is the BBC Subtitle Guidelines on GitHub Pages; check by hand | not verified | not verified |

## Could not do or verify
- No audio was listened to; track suitability rests on site tags and titles.
- Kenney zip sizes, Pixabay file sizes, YouTube Audio Library, FMA track pages, BBC guidelines, EBU R95, Google Fonts licence page: not obtained.
- Incompetech single-track pages are JavaScript-rendered, so per-track credit text is the FAQ template, not read from each page.
