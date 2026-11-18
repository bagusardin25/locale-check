# Video craft research for the Locale check demo (2:45)

Research date 2026-11-18. Every URL below was opened (WebFetch) unless marked [search only]. Marks: [P] = primary or official, [S] = secondary/explainer, [D] = my own derivation (not a quote from anyone).

## 1. Story structure

1. Open on the stakes, not the product. Duarte: Act 1 names the audience's problem and makes the audience the hero; don't open with your own stats. [P] https://www.duarte.com/blog/business-communication-demands-3-act-story-structure/
2. Alternate "what is" and "what could be" (Duarte's Sparkline). For this video: broken grid -> fix -> green grid, with the real Open Library bug as the proof it is not a toy. [P] same URL.
3. Pixar rule 4 (story spine: world, routine, disruption, chained consequences, outcome); rule 16 (show what is lost if it fails); rule 22 (find the most economical telling, then build outward); rule 7 (decide the ending first). [S, Emma Coats's tweets as reprinted] https://tubefilter.com/2012/06/12/pixar-rules-of-storytelling/
4. Find the visuals first, then write the script around them. Joss Fong (Vox): "If you can't find them and can't make them, you don't have enough for a video story." [P, profile quote] https://www.nasw.org/node/262945
5. Build the film around one promise and test every clip against it; cut secondary features. Show the object (here: one objective) staying the same while it changes state. [S] https://open-design.ai/blog/product-launch-video-storytelling/
6. A hook window of 5-10 seconds is the advice of Ali Mattu (science YouTuber) in the same NASW piece, not Fong; lead with the most visually interesting thing. [S] https://www.nasw.org/node/262945
7. Kurzgesagt's own process page: facts behind every claim (a per-video "sourcesheet" to "prove our claims"), many script drafts, voiceover sets animation timing. Use: have a source for every number on screen. [P] https://kurzgesagt.org/youtube/

## 2. Framing and directing the eye

1. Image size should follow importance at that moment. Hitchcock: varying image size against emotional importance was the basis of his theories (Truffaut book extract). Modern one-liner "size = importance" is a paraphrase, not a verbatim quote. [S] [search only] https://www.ucg.ac.me/skladiste/blog_19506/objava_68953/fajlovi/O%20filmu%20Rope_Hitchcock%20_%20Francois%20Truffaut_extract.pdf
2. Put the new shot's key element where the eye already is. NN/g eye-tracking: viewers' eyes stay where they were after a cut ("residual fixations"). Plan each cut so the red cell / failing button sits where the last shot's focus was. [P] https://www.nngroup.com/articles/talking-head-video/
3. Overlays tied to what the narrator says get looked at (82% of the time in NN/g's study). Match caption/callout to the spoken line. Same URL. [P]
4. Murch on the screen: eye-trace may matter more than his 7% weight in fast online video; make the viewer find the key element almost instantly. [S] https://nofilmschool.com/2018/08/editing-eye-trace-mind-rule-six-incorrect
5. Rule of thirds, leading lines, balance/symmetry (centre on purpose), depth of field/rack focus to isolate one thing. Dim or blur the rest = the screen-video equivalent of shallow depth. [S] https://www.studiobinder.com/blog/rules-of-shot-composition/
6. Negative space / lead room: StudioBinder snippets only (page for it returned 404). [search only, unverified]
7. Motion needs a reason: a zoom toward the key object works; a zoom toward an arbitrary corner does not, however good the easing. [S] https://open-design.ai/blog/product-launch-video-storytelling/
8. CHI 97 guideline: use object motion to control attention; avoid animation that does not serve an important object. [search only] https://chi1997.acm.org/proceedings/paper/pf.html

## 3. Showing software on screen

1. Zoom only when the evidence will not read at playback size; otherwise use a stable crop or highlight. Treat auto zooms as suggestions: remove zooms that just follow routine cursor travel, merge nearby actions into one frame. [S] https://open-design.ai/blog/product-demo-zoom-effects/
2. Pair a context frame with a detail frame; they must share a visible object or label. Same URL.
3. Hold begins once the label is readable (the move does not count as reading time). Do not zoom out before the confirmation has been read. Same URL.
4. Recapture or crop from a higher-resolution source; a tight crop of low-res footage looks blurry. Check the exported size. Same URL. (Relevant: your canvas zooms on screenshots.)
5. Screen Studio's own feature list shows the craft it automates: zoom on click, smoothed cursor path, click ripple, hide idle cursor, dim the rest of the frame, mask sensitive data. Use as a checklist for your canvas animation. [P] https://www.screen.studio/
6. Devpost judge/organiser advice: pitch in the first seconds, then show the project running; no slide decks; about 60% explaining, 40% demoing (Nathan, 22-time winner); do not speed the audio up to fit the limit. [P] https://info.devpost.com/blog/6-tips-for-making-a-hackathon-demo-video and https://info.devpost.com/blog/user-story-nathan
7. Devpost judges: the video is often the first signal; judges want storytelling plus real depth (a polished front end with thin code is a red flag); add sound and storytelling beyond the template. [P] https://info.devpost.com/blog/hackathon-judging-tips
8. RevenueCat Shipaton guide (hackathon pitch): hook and proof in the first 60-90 s; judges are only required to watch 3 minutes; outcomes over feature list; memorable story beats a feature list. [S] https://www.revenuecat.com/blog/engineering/how-to-win-shipaton-part-4-pitching-your-app
9. Not found: first-hand "how we made it" write-ups for Stripe, Linear, Vercel, Raycast, Arc launch videos, and Apple's own words on its product films. The 9to5Mac Apple keynote piece only discusses seamless transitions, not screen presentation. Do not cite these brands as sources. https://9to5mac.com/2023/06/21/apple-keynote-videos-transitions-and-editing/
10. Minimum text size, platform guidance: Apple HIG tables could not be read (page returned only a title). Use [D]: at 1080p on a phone held landscape, treat any text under about 36 px tall as unreadable; test by viewing the export at 6 inches wide. Unverified rule of thumb.

## 4. Pacing and editing

1. Murch's priority order for a cut: emotion, story, rhythm, eye-trace, 2D plane, 3D space. If a cut cannot satisfy all, drop from the bottom. The 51% for emotion is repeated widely; the other percentages (23/10/7/5/4) were not confirmed against the book. [S] https://nofilmschool.com/2016/11/6-rules-good-cutting-according-oscar-winning-editor-walter-murch
2. Cut at the thought boundary: Murch's blink idea. Quote: "The blink is either something that helps an internal separation of thought to take place, or it is an involuntary reflex accompanying the mental separation that is taking place anyway." Use: one caption/shot per thought, cut when the thought ends. [S, quoting the book] https://www.premiumbeat.com/blog/when-and-where-to-make-the-cut-inspired-by-walter-murchs-in-the-blink-of-an-eye/ (the blink-timing and "anticipate the audience" points are on this page; the verbatim quote came via search results [search only]).
3. Anticipate what the audience needs: show the reaction/cutaway just before they need it (Murch via same article).
4. Fewer, stronger beats beat many quick cuts ("two good hits = one great hit"); Jackie Chan principles from Every Frame a Painting (the article only lists titles). Also: "Be clear in your shots", "Action and reaction in the same frame". [S] https://nofilmschool.com/2014/12/jackie-chans-9-principles-action-comedy
5. Change something visual regularly: NN/g found static sameness loses attention; changes of subject position/camera angle regain it. For screens, alternate wide report / zoomed detail / code diff. [P] https://www.nngroup.com/articles/talking-head-video/
6. Narration speed: most explainer sources say 130-160 wpm, 150 baseline; slower for technical material or when the viewer must read the screen. At 2:45 with pauses, plan about 330-380 words total [D]. [S, vendor guidance, no controlled study] search results only: https://breadnbeyond.com/how-many-words-does-a-60-seconds-explainer-video-needs/ [search only]
7. Silence and room to breathe: Murch says density should rise and fall like loudness; constant density tires as much as constant loudness. Use quiet before the green-grid payoff. [P] https://transom.org/2005/walter-murch/
8. J/L cuts and "when to hold": no verified source found. The PremiumBeat article names the L cut without explaining it.

## 5. Captions and on-screen text (muted viewing)

1. Reading speed: BBC 160-180 wpm (about 0.33-0.375 s per word); Netflix English up to 20 characters per second for adult programmes. For a muted viewer who also has to read a UI, stay near the low end [D]. [S] https://www.clevercast.com/bbc-subtitling-guidelines (BBC numbers via a secondary page; BBC's own page was blocked) and https://partnerhelp.netflixstudios.com/hc/en-us/articles/217350977-English-Timed-Text-Style-Guide [P]
2. Line length and count: Netflix 42 characters per line, 2 lines max, bottom-heavy pyramid, break after punctuation and before conjunctions/prepositions, keep names and article+noun together. [P] https://partnerhelp.netflixstudios.com/hc/en-us/articles/217350977-English-Timed-Text-Style-Guide
3. Duration: Netflix min 5/6 s (20 frames at 24 fps) for a one- or two-word subtitle, max 7 s; at least 2 frames between subtitles; do not carry a caption across a shot change unless the speech does. [P] https://partnerhelp.netflixstudios.com/hc/en-us/articles/360051554394-Timed-Text-Style-Guide-Subtitle-Timing-Guidelines and https://partnerhelp.netflixstudios.com/hc/en-us/articles/215758617-Timed-Text-Style-Guide-General-Requirements
4. Placement: BBC (secondary copy) keeps captions in the central 90% vertically and 75% horizontally for 16:9; line width at most 68% of frame width. Netflix: centred, top or bottom, move away from on-screen text if they collide. [S] https://www.clevercast.com/bbc-subtitling-guidelines
5. Safe areas: EBU R95 action-safe 93% (3.5% margins), graphics-safe 90% (5% margins) for 16:9 (figures from search result; the PDF text could not be read). [search only] https://tech.ebu.ch/docs/r/r095.pdf
6. Contrast: WCAG 1.4.3, 4.5:1 for normal text, 3:1 for large text (18 pt or 14 pt bold, roughly 24 px / 18.5 px). Apple HIG repeats it. [P] https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
7. Caption sync with the voice: overlays that match the audio get looked at (NN/g 82%). [P] https://www.nngroup.com/articles/talking-head-video/
8. The "captions add 12% view time" figure traces to Facebook's 2016 announcement via secondary sites; no current official source. Do not cite it as fact. [search only] https://www.adexchanger.com/digital-tv/facebook-adds-viewable-video-options-automated-captions-autoplay/

## 6. Sound

1. Loudness for YouTube: about -14 LUFS integrated, -1 dBTP ceiling. YouTube turns loud uploads down and does not boost quiet ones. Caveat: YouTube publishes no official number; this is observed behaviour, and YouTube's own help page returned 404. [S] https://www.forasoft.com/learn/audio-for-video/articles-audio/lufs-targets-per-platform-2026
2. Speech reads 2-3 LU louder than music at the same measured loudness (AES TD1008, via the same page): aim to leave the voice clearly on top. Same URL. [S]
3. Music under voice: rules of thumb range from music peaking -18 to -25 dB absolute, or sitting 18-24 dB below the voice (about 22-30 dB for dense tutorials); only a vendor consensus, no standard. Verify by listening on phone speakers. [S, search only] https://vidpros.com/fix-background-music-too-loud-video/ and https://www.overseeros.com/blog/background-music-volume-under-voiceover
4. Murch's "Law of Two-and-a-Half": about two and a half layers of the same kind of sound; up to about five if they span speech to music. Drop music during key dialogue. Use: voice plus one music bed plus at most one effect at a time. [P] https://transom.org/2005/walter-murch/
5. Small sound cues: Edgar Wright planning sound and music cues early, rhythm built on the music: only secondary sources found. [search only, unverified]
6. Silence works as a dynamic (Murch, same essay).
7. Devpost: fuzzy voice-overs weaken a demo; Devpost says "clear audio" matters. Check the ElevenLabs render for artefacts. [P] https://tips.hackathon.com/article/creating-the-best-demo-video-for-a-hackathon-what-to-know (organiser blog) and https://info.devpost.com/blog/6-tips-for-making-a-hackathon-demo-video

## 7. Honesty and credibility

1. Disclose inside the video, not in the description. Google's Gemini demo had a note about reduced latency only in the YouTube description; Google later said it was not live (still frames plus text prompts). CNBC reported the controversy. [S] https://www.cnbc.com/2023/12/08/google-faces-controversy-over-edited-gemini-ai-demo-video.html
2. Do not let a footnote carry what the visuals deny. The NAD found Apple's disclosures did not adequately qualify "available now" claims; Apple pulled the ad. [S] https://www.maginative.com/article/apple-pulls-available-now-claim-from-ai-ads-after-watchdog-probe/
3. Show only what the footage demonstrates; do not imply measured results (for example faster resolution) from a staged or sped-up sequence; use a plain cut if a morph would imply automation the product does not do. [S] https://open-design.ai/blog/product-launch-video-storytelling/
4. Judges reward real depth (Databricks judge: a polished front end with thin code is a red flag) so label replays and recorded logs plainly and show the real run artefacts. [P] https://info.devpost.com/blog/hackathon-judging-tips
5. Source every claim: Kurzgesagt publishes a per-video sourcesheet "to prove our claims". Use: a one-line "recorded run, [date], results.json" label on each replay, and link the source in the description. [P] https://kurzgesagt.org/youtube/
6. Showing real failures and limits builds trust: I found no primary source stating this directly (search results for YC/Seibel were only summaries). Cite the Gemini and Apple cases for the reverse. Unverified as a general principle.

## Could not verify or access
- YouTube official loudness page (404), BBC subtitle guidelines on bbc.co.uk (blocked), EBU R95 text (PDF unreadable), Apple HIG typography table, Pixar's own PDF (404), YouTube videos (network refused).
- Murch's six-criterion percentages other than 51%; Hitchcock verbatim quote; Linear/Stripe/Vercel/Raycast/Arc making-of material; J/L cuts; Edgar Wright sound-design primary material; the 12% captions figure.
- The speaking-rate figures, caption reading speeds in muted-viewing, music dB ranges are vendor guidance, not studies.
