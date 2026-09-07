# uv-website

UV's marketing site, built with Next.js 16 (App Router), React 19 and Tailwind v4.

The layout and design system are modelled closely on the
[Kyndryl India homepage](https://www.kyndryl.com/in/en) — measurements taken from
its live DOM. The copy is UV's.

## Before this goes public

Two things still need doing:

1. **Fill in the placeholders.** Anything in `[square brackets]` in `content/` is
   a fact UV hasn't supplied — awards, client outcomes, team names and quotes,
   contact details. They were deliberately left visible rather than invented.
   `grep -rn '\[' content/` lists them.
2. **Replace the imagery.** Most of `public/assets` was downloaded from
   kyndryl.com as a placeholder set and is not UV's to publish. The `UV` wordmark
   in the header and footer is plain type (`Wordmark` in `components/ui`) — swap
   it for a real logo when one exists.

   **These are UV's own and can stay** — supplied for the site, converted to
   `.webp`, and absent from `scripts/fetch-assets.mjs`, so `npm run assets`
   will neither fetch nor overwrite them:

   | File | Used by |
   |---|---|
   | `story-jio-telecom.webp` | Jio customer story |
   | `story-education-project.webp` | Greycells18 / Topper customer story |
   | `about-hero-human-machine.webp` | `/about` hero |
   | `vision-ai-platform.webp` | `/about` Vision band background |
   | `mission-data-streams.webp` | `/about` Mission band background |
   | `objectives-automation-hud.webp` | `/about` Objectives band background |
   | `objective-ai-innovation.webp` | Objective 01, AI & Technology Innovation |
   | `objective-intelligent-automation.webp` | Objective 02, Intelligent Automation |
   | `objective-scalable-products.webp` | Objective 03, Build Scalable Products |
   | `objective-customer-growth.webp` | Objective 04, Customer-Centric Growth |
   | `objective-global-expansion.webp` | Objective 05, Global Expansion |
   | `foundation-people-together.webp` | `/about` Foundation |
   | `values-customer-satisfaction.webp` | `/about` Values band background |
   | `vision-mission-target.webp` | homepage Vision & mission band |
   | `spare-neon-isometric.webp` | **unused** — kept for a future slot |
   | `objectives-automation-hud.webp` | **unused** — too low-res for full bleed |

   Several came from stock sources (Pexels, and free vector/stock packs). Check
   the licence terms cover commercial use before publishing.

   Four of these are small originals — `objective-scalable-products` (480px),
   `objectives-automation-hud` (546px), `spare-neon-isometric` (554px) and
   `objective-global-expansion` (643px). They were not upscaled, since that only
   softens them. They are fine where they sit (a ~540px column, or a band
   background at 18% opacity) but are the first to replace if larger versions
   turn up.

```bash
npm install
npm run assets   # download the 57 images/videos into public/assets (~133 MB)
npm run dev      # http://localhost:3000
```

`npm run assets` must run once before the first `npm run dev`, or the page renders
without imagery. It skips files that already exist; `npm run assets -- --force`
re-fetches everything.

## Layout

```
app/
  layout.tsx          fonts + document shell
  (site)/layout.tsx   Header + Footer — every page in the group inherits it
  (site)/page.tsx     the homepage: composes the sections in order
  globals.css         design tokens (@theme), base type, marquee keyframes
components/
  layout/             Header (mega-menu, search, locale, mobile drawer), Footer
  sections/           one component per band of the homepage
  ui/                 Button, Eyebrow, ArrowLink, Section, FitText
content/
  home.ts             all homepage copy + asset paths
  nav.ts              header nav, mega-menu, locales, footer columns
scripts/
  fetch-assets.mjs    the asset manifest and downloader
```

## Contact page and enquiries (Resend)

`/contact` is where "Let's talk", the header CTA and every Contact link now
land. Before it existed, "Let's talk" pointed at `mailto:[email]` — a live
broken link that opened a mail client addressed to the literal string
`[email]` — and the header's "Talk to us" used a bare `#connect` anchor, which
does not exist on any page except the homepage.

Enquiries are **emailed**, not written to disk. That is a deliberate difference
from the careers form: a CV can wait in a folder until a hiring round, but a
sales enquiry nobody notices is a lost customer, and nothing in this project
reads those folders back.

### Setup

1. Sign up at [resend.com](https://resend.com) — the free tier is plenty
2. **API Keys → Create**, and put it in `.env.local` as `RESEND_API_KEY`
3. Set `CONTACT_TO_EMAIL` to wherever enquiries should land
4. Restart the dev server

Until a domain is verified in Resend, leave `CONTACT_FROM_EMAIL` as the sandbox
`onboarding@resend.dev` — with it, **Resend only delivers to the address that
owns the Resend account**. Verify your own domain before this goes live, or
enquiries to any other inbox will silently not arrive.

**Without the keys the page still renders**, but submitting returns a visible
error telling the visitor to email directly, and logs server-side. A contact
form that appears to send and doesn't is the worst outcome — the sender believes
they reached you.

The endpoint validates on the server regardless of the browser: required fields,
email shape, a 5000-character message cap and 200 per field. Enquirer text is
HTML-escaped before it goes into the email body. `replyTo` is set to the
enquirer, so replying from the inbox reaches them rather than the site.

### Still to fill in

The details column shows `[email]`, `[phone]` and `[city, state]`. **Do not
publish in that state** — a contact page displaying `[email]` is worse than one
showing nothing. They are in `content/contact.ts`.

## Employee login (Clerk)

`/portal` is a protected placeholder for UV's internal tools. The header shows a
quiet "Employee sign in" link, which becomes the user's avatar once signed in.

**Right now there are no keys, so none of it exists.** `/portal`, `/sign-in` and
`/sign-up` return **404**, the header shows no login link, and Clerk's
JavaScript is not even sent to the browser. The rest of the site is unaffected.
That is deliberate: *not configured* means the routes do not exist, never that
they exist and are open.

### Setup

1. Create an application at [clerk.com](https://clerk.com) (the free tier is
   enough).
2. **Set sign-ups to Restricted / invitation only** in the Clerk dashboard. This
   is what makes it employees-only — there is no allowlist in the code, on
   purpose, because a second copy of that rule would drift from the first.
3. `cp .env.example .env.local` and fill in the two keys from Clerk's **API
   keys** page.
4. Restart the dev server. Environment changes are not hot-reloaded.
5. Invite employees by email from the Clerk dashboard. Their invitation link
   lands on `/sign-up`, which is why that route exists and is public despite
   sign-up being closed.

Worth doing while you are in the dashboard: enable MFA, and turn off any social
providers you do not intend to allow.

**Never paste `CLERK_SECRET_KEY` into a chat, an issue, or a `NEXT_PUBLIC_*`
variable.** Anything prefixed `NEXT_PUBLIC_` is compiled into the JavaScript
every visitor downloads.

### How the protection is arranged

`proxy.ts` — **not `middleware.ts`**; Next 16 renamed the convention and the old
name warns on every build — establishes Clerk's request context on the auth
routes. It does **not** decide access.

The authorisation check lives in `app/(site)/portal/page.tsx`, next to the data
it protects. That follows Clerk's current guidance: it deprecated
`createRouteMatcher` in this version because middleware path matching "can
diverge from how Next.js routes requests and leave protected resources
reachable". **Any page added under `/portal` must check the session itself**
rather than inherit protection from a matcher elsewhere.

The proxy's `config.matcher` is a narrow allow-list rather than Clerk's
documented catch-all. That structurally guarantees `POST /api/apply` stays
unauthenticated — it is not listed, so nothing in the proxy can break public job
applications. The trade-off: anything calling `auth()` or `currentUser()` on the
server must have its route added to that matcher, or Clerk throws.

### `lib/auth.ts` is temporary

It exists only so the site builds before Clerk is configured. Once keys are in
place, `lib/auth.ts` and its call sites can be deleted and the branches removed.

## Careers page and CV uploads

`/careers` lists open roles (placeholders in `content/careers.ts` — replace them)
and takes applications with a CV attached.

Submissions land in **`applications/<timestamp>__<name>/`** at the project root,
each holding the CV plus an `application.json`. Two deliberate choices:

- The folder is **outside `public/`**. Anything in `public/` is served to the
  open internet, so CVs there would be downloadable by anyone guessing a URL.
- It is **gitignored**, so real applicants' data is never committed.

`app/api/apply/route.ts` validates on the server regardless of what the browser
sent: 5 MB cap, PDF/DOC/DOCX only, extension checked against the MIME type, and
the applicant's name reduced to `[a-z0-9-]` before it touches a path — so a name
like `../../etc/passwd` becomes `etc-passwd` and cannot escape the directory.

**This writes to local disk**, which works on your machine or an ordinary VPS.
Serverless hosts (Vercel, Netlify) have a read-only filesystem — deploying there
means swapping this endpoint for object storage or an email service.

## About page — vision, mission, objectives, values

`/about` is the canonical statement of what UV **is now**: an AI and technology
company. `content/about.ts` holds it — `VISION`, `MISSION`, `OBJECTIVES` (5,
three points each), `VALUES` (9), plus `FOUNDATION` and the page chrome.

**The vision, mission, fifteen objective points and nine value bodies are UV's
own wording, used verbatim** — including the unspaced em dash in "Impact" and
the ampersand in "People & Learning". Don't tidy that punctuation, and don't
pre-uppercase titles in the data; casing is CSS's job.

One thing to hold on to when editing the connective copy: the objectives are
written in the **future tense** — "Develop", "Build", "Establish". They are what
UV is working towards, not a claim about what it already ships. Surrounding copy
must not quietly turn an aim into an achievement.

Two layout decisions that look arbitrary and are not:

- **Objectives are a ledger — one full-width row each, not cards.** Five fits
  none of the site's grids (3 and 4 are the established counts); a 3- or 4-column
  grid orphans the last item. A row also gives each objective's three points
  their own sub-grid.
- **Values are a 3x3 hairline grid** (`gap-px` over a `bg-line` container).
  Nine divides only by 3, so a 2-column step would orphan the ninth on every
  screen between 475 and 1023px. They stagger by *column* (`(i % 3) * 90`) —
  staggering by index across nine items leaves the last row trailing by most of
  a second.

The homepage carries a condensed `VisionMission` band (`#vision-mission`,
between Who we are and Recognition) linking here, with a matching `SECTION_NAV`
pill. Keep that band tall: `SectionNav` picks the active pill with
`rootMargin: "-175px 0px -55% 0px"`, only a ~230px strip at a 900px viewport, so
a short band scrolls past without ever becoming current.

### History vs. present

The BPO / Jio / Tata / Greycells material is UV's **history** — the record the
technology is built on, not the current offer. The hero, `WHO_WE_ARE`,
`AI_NATIVE` and the customer-stories eyebrow ("our track record") are framed
that way deliberately. `FOUNDATION` on `/about` is where that history is stated
outright.

## Client story pages

`/stories/<slug>` renders a full story; the three that exist are prerendered at
build time from `content/stories.ts`:

| Slug | Subject |
|---|---|
| `topper-greycells18` | Topper, the curriculum channel and learning portal run by Greycells18 Media |
| `jio-territory-partner` | The Jio territory partner role — distribution, retail and field teams |
| `tata-docomo-channel-partner` | Tata Docomo channel partnership, including the DoT/TRAI framing |

Both buttons on each customer-stories slide open that slide's page —
"Read full story" at the top, "Highlights" at `#highlights`, which is placed on
the first facts-or-list block of whichever story it is.

The factual material came from UV's briefing documents. **Everything that would
be a claim about UV's own results — volumes, coverage, headcount, quotes — is
still in `[square brackets]`**, because those are facts only UV can supply and
inventing them for a real business would be worse than leaving the gap.

Adding a story is one entry in `STORIES` plus a `slug` on the matching slide in
`CUSTOMER_STORIES`; the route, metadata and next-story link follow from that.
Blocks available: `prose`, `facts`, `list`, `stats`, `image`, `quote`.

### Motion

Story pages and `/about` are where the scroll-driven animation lives:

- `components/ui/Reveal.tsx` adds `data-shown` when an element scrolls in;
  the hidden state lives in CSS so nothing flashes before hydration. It reveals
  once and then unobserves.
- `ReadingProgress.tsx` draws the coral hairline at the top, writing to a
  custom property per frame rather than through React state.
- Hero artwork drifts (`story-hero-drift`), hero text rises staggered on load
  (`story-rise`).

### The objective rows' five-beat sequence

Each row on `/about` arrives as a sequence rather than one fade:

| Beat | Element | Delay |
|---|---|---|
| 1 frame wipes open | the `Reveal variant="wipe"` — owns `clip-path` | 0 |
| 2 picture settles out of an over-scale | `.art-settle` wrapper — owns `transform` | 80ms |
| 3 numeral lands, blur clearing | `.numeral-land` | 260ms |
| 4 title rises | its own `Reveal` | 360ms |
| 5 three points cascade, rules drawing | `Reveal` + `.reveal-rule` | 460 / 570 / 680ms |

**Each beat is on a different element on purpose.** The wipe owns `clip-path` on
the frame, the settle owns `transform` on a wrapper, and the scroll parallax owns
`transform` on the image itself. Put two of those on one element and the later
one silently wins — which is why `.art-settle` exists as a wrapper rather than a
class on the `<Image>`.

`Reveal variant="none"` is the trigger-only variant: it animates nothing and
exists purely to hand `data-shown` down to children carrying their own staged
transitions (the numeral uses it).

### Why the objective rows are shaped the way they are

Everything describing an objective — numeral, title and its three points —
sits in **one** column, with the picture opposite, and the row is `items-center`.

That is the fix for a specific failure. When the numeral and title lived with the
picture, the left column stacked image + numeral + title and ran ~765px tall,
while the right column held three short paragraphs about 120px tall. The row was
sized by the taller side, so roughly half of it was empty. Now the two sides
measure 406px and 410-434px — near-equal by construction, not by luck.

The picture is capped at **520px**, 4:3, and its side **alternates** down the
ledger (`i % 2` → `lg:order-2`), so five rows read as a composition rather than
five copies of one row. The alternation is `lg:` only; below that everything
stacks picture-first, consistently.

If you change the type sizes or point lengths, re-measure both sides — the
balance is what keeps this from reverting to the sprawl it started as.

**Never nest a `Reveal` inside another `Reveal`.** Each instance observes
independently, so an inner element can be released while its ancestor is still
`opacity: 0` — the animation plays invisibly and the content then snaps in. Put
reveals on leaves only, as `StoryBody` and `/about` do.

Band artwork drifts slowly as its section crosses the viewport, and the giant
section watermarks slide with it. Both use **CSS scroll-driven animation**
(`animation-timeline: view()`), so there is no JS, no scroll listener and no
layout thrash. It is declared inside `@supports (animation-timeline: view())`
*and* `@media (prefers-reduced-motion: no-preference)`, so browsers without it
(Firefox today) simply show a still image, and readers who asked for less motion
never have the animation declared at all — which is why no reduced-motion
override is needed for it.

**Two traps worth knowing before you touch this:**

- The element clipping the artwork must use **`overflow-clip`, not
  `overflow-hidden`**. `hidden` makes an element a scroll container, and
  `view()` resolves against the nearest scroll container — the art would be
  measured against its own band, sit permanently 100% visible, and never move.
  It fails silently and looks exactly like the parallax not working.
- The `animation` shorthand resets `animation-timeline`, so the shorthand must
  come **before** the longhands.

`[data-reveal]` is **unlayered** CSS, so it outranks every Tailwind utility no
matter how specific. Its `transition` shorthand therefore has to list the colour
properties explicitly — otherwise a `hover:bg-*` or `hover:border-*` on a
`Reveal` element snaps instead of fading. (That was a live bug on the story
pages before this landed.) For the same reason, a `hover:scale-*` on a `Reveal`
element will never work: `[data-reveal][data-shown] { transform: none }` wins.
Put transforms on a child instead.

Three deliberate safeguards, because *hiding copy* is a much worse failure than
*not animating it*: the reveal falls back to a scroll listener if the observer
never delivers, reveals everything immediately if `window.innerHeight` is `0`
(a hidden tab or offscreen embed, where nothing can ever intersect), and under
`prefers-reduced-motion` the content is shown outright rather than merely
having its transitions shortened.

## Adding an inner page

Every string lives in `content/`, and the chrome lives in the route group, so a
new page is two files:

```
content/what-we-do.ts               the copy
app/(site)/what-we-do/page.tsx      composes existing section components
```

Then point the matching `href` in `content/nav.ts` at `/what-we-do`.

## Fidelity notes

Design values were measured from the live DOM at 1440px rather than eyeballed.
Kyndryl gives each section its own heading size rather than sharing one display
ladder, so `app/globals.css` names the type utilities after the role they play
(`type-hero`, `type-statement`, `type-section`, `type-band`, `type-card-lg`,
`type-card`, `type-giant`, `type-lede`, `type-body`) with the measured px as
each clamp's maximum:

| | value |
|---|---|
| hero h1 | 48 / 56, weight 300, `-0.01em` |
| statement h2 (recognition) | 44 / 46.6, weight 400 |
| section h2 (stories) | 40 / 48, weight 300 |
| section h2 (insights) | 40 / 46, weight 300 |
| band h2 (AI-native, partners) | 34 / 40, weight 400 |
| card h3 (services, team) | 32 / 40, weight 300 |
| card h3 (recognition band) | 32 / 33.9, weight 400 |
| card h2 (promo, Who we are, insights) | 24 / 30, weight 400 |
| "Let's get there together" | 84 / 112, weight 200 |
| lede | 20 / 28, weight 300 |
| card body | 16 / 24, weight 300 |
| header nav / footer link | 14 / 20 · 16 / 24, weight 400 |
| page gutter | 32px |
| hero height | 804px |
| eyebrow | 12px / 500, uppercase, `0.05em`, over a 16×2px `#FF462D` rule |
| service heading | 48px / 56px, weight 300, `#FB512F` |
| card numeral | 128px / 168px, weight 700, transparent fill, 1px `#FB512F` stroke at 80% |
| section-nav pill | 34px item on a `#F9F9F9` 32px track, in a 64px shell with `0 4px 5px rgba(0,0,0,.06)` |
| recognition accordion | 499/926 grid, 440px tall; active band `flex: 7 1 0%`, collapsed `0.444 1 0%` (778px vs 49px), `transition: flex .5s` |
| customer stories | `#F2F1EE` section; 21:9 band capped at 1776px, `background-position: top center`; 35% message column, title 36/44 weight 300; three 306×178 panels sliding up staggered 0 / .25 / .5s |
| primary CTA | `#4CDD84` fill, `#042315` label, 66px radius |
| hero CTA | 0.8px white hairline, **4px** radius |
| analyst ladder | `#1FA452 → #1B904B → #187E3F → #10592C` |

### Dropping in the award logos

Each band in **Recognition** has a slot at its foot for the awarding body's
logo. Set `logo` on that panel in `ANALYST_RECOGNITION.panels`
(`content/home.ts`) once there's a real award; `null` leaves the band clean.

### Dropping in the service-card images

Each card in **What we do** shows a giant outlined numeral that cross-fades to a
photo on hover. Put a 16:9 image in `public/assets/img` and set `image` on that
card in `HOW_WE_HELP.cards` (`content/home.ts`). Left as `null`, the numeral
stands alone — which is what the original shows until you hover it.

### Section watermarks and their contrast

The giant lowercase words between sections (`SectionWatermark`) began as a true
tone-on-tone watermark — cloud on white, white on cloud — which measured
**1.13:1**. That is below the point where the eye resolves an edge, so they
could not be read at all.

Both variants now sit at **~2.3:1** against their own band (`#b2aaa0` on white,
`#a79f96` on `#f2f1ee`), and both go *darker* than their band so the treatment
reads the same way in both places.

That is deliberately short of the 4.5:1 WCAG asks for body copy. These render at
**136–170px** at a 1440 viewport — display type, where far less contrast is
needed to read comfortably — and the real `<h2>` directly beneath runs about
9.7:1. Pushing the watermark to 4.5:1 would flatten that gap and leave two
headings competing instead of a heading over a background. If you change these
tones, keep the ratio near 2.3:1 and re-measure against the band, not the page.

### Dropping in the band artwork

Four bands take a full-bleed background photograph. All four are `null` today,
so **nothing is rendered** — no `<img>`, no empty frame, no 404 — and the band
keeps its flat background. Set the key and the art appears:

| Key in `content/about.ts` | Band | Wants |
|---|---|---|
| `VISION_MISSION_BAND.image` | homepage Vision & mission | a **dark** image |
| `VISION.image` | `/about` Vision | a **light** image |
| `OBJECTIVES.image` | `/about` Objectives | a **light** image |
| `VALUES.image` | `/about` Values | a **light** image |

The light bands lay the image at 18% under a white scrim, because they carry
dark type. The dark Vision & mission band runs its image at **full opacity**
under a lighter, left-weighted scrim — that combination is tuned for a *dark*
image and is deliberately different from the AI band's scrim, which starts at
fully opaque carbon because it covers a bright photo.

**Match the image to the band, then measure.** With the AI band's scrim, the
dark target artwork composited to within 4-12 of flat carbon on a 0-255 scale —
present in the DOM and invisible on screen. The current settings put the coral
arrow 60 away from carbon while white text still measures 8.8-11.3:1, where
4.5:1 is the requirement. If you swap this image, re-check both numbers: a
scrim heavy enough to be safe is often heavy enough to erase the picture.

Compressed `.webp` around 1400-1920px wide matches everything else in
`public/assets/img`.

`ABOUT_HERO.image`, `MISSION.image` and `FOUNDATION.image` already carry
placeholder photos and can be swapped the same way.

### The Who-we-are artwork — the one visual you never have to replace

`components/sections/WhoWeAreArt.tsx` draws that panel in SVG. **It is generated,
not photographed**, so unlike everything else under `public/assets` it needs no
licence and never needs swapping out.

It replaced six Kyndryl photographs and a "Watch" button whose `href` was `"#"`.

**What it depicts.** Fourteen dot-columns — one per year of operation — start
scattered, dim and grey on the left, then snap into alignment, warm towards
spring-green and pull to the centreline, before thinning out and handing off to
four lanes that converge through an aperture. Signal pulses run the lanes.
That is the section's own paragraph: many parallel unstructured efforts over
fourteen years resolving into a few structured flows and finally into one thing
that carries signal. There are deliberately **no dot-to-dot connectors** — the
connector mesh is the AI-graphic cliché.

Four things to know before editing it:

- **Keep `aspect-[855/481]`.** At `lg` the parent section is `py-0`, so this
  panel's ratio is the only thing setting the band's height. Shrink it and
  `SectionNav` can stop marking the "Who we are" pill active.
- **The field is deterministic on purpose.** It is generated at module scope
  with an integer `Math.imul` hash — not `Math.random()`, which would differ
  between server and client, and not the common `Math.sin(i * 12.9898)` trick,
  since `Math.sin` is not guaranteed bit-identical across JS engines.
- **Colours come from tokens via `color-mix`.** A typo'd token name yields
  *transparent* rather than an error, so check a dot's computed `fill` after any
  change.
- **Rings need both `transform-box: fill-box` and `transform-origin: 50% 50%`**
  or they pivot about SVG user-space (0,0) and fly across the panel.

Every `animation` is declared inside `@media (prefers-reduced-motion:
no-preference)`, so those readers never get it declared at all — the blanket
`animation-duration: 0.01ms !important` earlier in `globals.css` would otherwise
force each one to complete instantly and park on its *end* keyframe. The pulses
therefore carry a parked `--park` offset so the still frame is composed rather
than empty.

**If UV ever commissions a film**, this is a component rather than a content
slot — add a `<video>` here and drop the SVG. There is deliberately no
`video: null` stub waiting: an unfilled media slot is what produced the dead
"Watch" button in the first place.

Two deliberate departures:

- **Type.** Headings on the real site use **TWK Everett**, a commercial Weltkern
  face the site self-hosts. It can't be redistributed here, so **Be Vietnam Pro**
  stands in — picked by measuring, not by eye. At 100px:

  | | "Handgloves" | lowercase | cap | x-height |
  |---|---|---|---|---|
  | TWK Everett | 571 | 1401 | 76 | 53 |
  | Be Vietnam Pro | 566 | 1429 | 74 | 53 |
  | Schibsted Grotesk (was) | 478 | 1194 | 67 | 45 |

  Everett is still first in the `--font-display` stack: licence it from Weltkern,
  drop the woff2 files into `public/fonts` with matching `@font-face` rules, and
  it takes over with no other change.
- **Section watermarks.** The giant tone-on-tone words ("how kyndryl helps") are
  sized to fill the viewport, not set at a fixed size. `components/ui/FitText.tsx`
  measures and scales at runtime to match that behaviour across viewports.

## Ownership

The copy is UV's. The **design** is closely modelled on kyndryl.com, and the
**imagery** in `public/assets` is still Kyndryl's — replace it before publishing.

Partner names (Tata, Jio Communications, Greycells 18 Media) render as plain
type rather than those companies' logos, in `components/sections/PartnerMarquee.tsx`.
Using their trademarks would imply an endorsement UV would need permission for.
