# Cambridge pages: drafts for review

Two pages for people who search with a place name. Like the sector pages, they sit under the site, not in the main menu, and link out to the work.

Second draft (22 Nov 2026). The first read like every other "Cambridge web design" page with our name on it. This one is written from the visitor's chair: what they came for, what they doubt, and what gets them to send something.

## The short design

**Why:** the studio is in Cambridgeshire and the work stands up well against what ranks for "Cambridge CGI" and "Cambridge web design" today. Neither search currently has a page of ours to land on.

**Who each page is for:**

- **Cambridge web design:** someone at a Cambridge company that is well known locally and judged from its website everywhere else. They have ten agency tabs open and every one says "award-winning".
- **Cambridge CGI:** someone at a Cambridge company with something a camera can't show: a product, a process, a piece of science, software, or a brand with no object behind it. They want to see the work in the first five seconds, find the thing they came for in a list, and know that whoever makes it has handled serious work before.

**What each page has to do, in order:** say something true about their situation that no competitor says; show the work straight away; give the real local reason (we can be in the room); remove the cost and "are you big enough" doubts; offer a first step smaller than a call.

**The small first step:** the existing First impressions form ("Send us your site and we'll show you how it reads to a serious buyer"). It's already on the site and it's a better ask than "get a quote", which is what every competitor offers.

**Approaches considered:**

1. **Two hand-written static pages (chosen).** Built from the existing classes, each with its own copy and proof.
2. **A CMS "Locations" template.** Rejected: it's the auto-generated approach Illusion CGI uses, and not worth a template for two pages.
3. **Folding Cambridge into sector pages.** Rejected: weaker for the "Cambridge CGI" search, and there's no deep tech case study yet.

**Not doing:** more towns; a place in the main menu; architectural visualisation; any change to the rest of the site's wording.

**Would make it a failure:** reading like SEO filler; "CGI" spreading beyond this one page; agency-era work passed off as studio work; an invented local client or result.

**One exception to the 1 Nov decision:** "CGI" is used on the CGI page, in its title, eyebrow and schema, because that is the word people search. Everywhere else the site keeps saying "imagery".

**Where the search words go:** in the SEO title, the eyebrow, the first line under the H1 and the schema. The H1s are written for the person, and both still carry "Cambridge".

**Build:** slugs `/cambridge-web-design` and `/cambridge-cgi`. Existing classes throughout. Each page gets a `Service` schema block with `areaServed` set to Cambridge and `provider` pointing at the studio, plus `FAQPage` for the questions. Linked from the footer and from each other. Staging only until Luke says publish.

---

## 1. Cambridge web design

Fourth draft (22 Nov 2026): rewritten in a Cambridge register. Less conversational, more exact: statements in place of questions, the reader's own nouns (investors, partners, candidates, the lab, CAD), and no asides. This section is written out from the local build (`dev/cambridge/build.py`), so it always matches the pages. Blocks lifted unchanged from the site (logo strips, case study rows, quotes, film tiles, the First impressions form) are not repeated here.

**Slug:** `/cambridge-web-design`
**SEO title:** Web Design Cambridge | Brand and website design studio | PIXEL SILO
**Meta description:** Web design for Cambridge technology and science companies whose work is ahead of their website. One person from brief to launch, with scope and price fixed before design begins.

### [ 00 ] **H1 (set small, in the eyebrow):** Web design Cambridge

**Display line (a div, not a heading):** Built in Cambridge. / Understood everywhere.

**Line under the H1:** Web designers in Cambridgeshire. Brand and website design for Cambridge companies whose work is ahead of their website.
Reel 2026
Imagery · Motion · Web

### [ Selected clients ]
5 years as a studio

### [ Before the studio ]
15 years agency-side
Cambridge companies are usually known by reputation: among peers, in the lab, across the cluster. Investors, customers and candidates elsewhere have no access to that. They have the website, and they read it closely before any conversation takes place.
The work therefore begins with strategy: who the site must convince, and what it must establish. That is resolved in wireframes before design begins. Brand, website and imagery are then produced together, by the person you brief.

### [ 01 ] What the site must establish
**Heading:** Four jobs, / before the first conversation.


**Earn trust**
Informed readers begin by looking for grounds to rule a company out. Each page should remove one.

**Explain the work**
What the company does, stated so that a newcomer follows it in a minute and a specialist is satisfied in five.

**Show the people**
Investors back teams, and candidates choose them. The people, the method and the evidence belong on the site.

**Stay current**
Companies here change quickly. The site is built for your team to maintain, and Adapt provides a plan and the studio time each month to keep it accurate.

### [ 02 ] The work
**Heading:** Different clients. / The same test.


### [ Said about the work ]
“Our new website has increased website leads by over 50% and our engagement rate by 35%, leading to more viewings and sales.”
Joel Rayney
Campaign Manager, SiteSales (now Regenta)
“Luke took the time to understand how our platform works before designing anything. The site now explains us clearly to allocators and managers, which our old one never did.”
Theron de Ris CFA CAIA
Founder, Eschler Asset Management LLP
“Their attention to detail and eye for design is unbeaten. We won't be going anywhere else.”
Harison Smith
Founder, Tidywork Studio

### [ 03 ] Proximity
**Heading:** In person, / where it matters.

Much of what distinguishes a company never reaches a written brief. It emerges on a tour of the lab, with the product in hand, or in how a founder explains the work to a newcomer. The studio is in Cambridgeshire, so the strategy session can take place in person.
After that, most clients prefer short video updates and email, which take less of their time. Calls and visits are arranged when there is something to discuss. Every stage is recorded in your dashboard.

### [ 04 ] How it works
**Heading:** Eight stages. / Roughly six weeks.


**One person, brief to launch**
Luke designs, builds and produces the imagery. Nothing is relayed second hand.

**Price fixed before design**
A written scope, a timeline and a fixed price, mapped onto wireframes of the site.

**A defined process**
Eight stages, each tracked in your dashboard, so progress is visible throughout.

**Yours to maintain**
Built on the platform that suits the organisation, and set up for your team to maintain independently.

### [ 05 ] Questions

**Is a studio of two sufficient for a company of our size?**
Yes. The person you brief is the person who designs, builds and renders the work, and no decision is taken by anyone absent from the original conversation. Before founding the studio, Luke spent fifteen years agency-side leading brand and digital work for Arm, Intel, Nvidia, AMD and Mubadala.

**What does a website cost?**
Cost depends on what the site must do, so every project is scoped first. A written scope, a timeline and a fixed price are agreed before design begins.

**How long does a project take?**
Most projects run through eight stages in roughly six weeks.

**Which platform do you build on?**
The platform that suits how the team works. Where a marketing team needs to edit through a CMS, Webflow is one example. A smaller site that changes rarely may suit a lighter build.

**Do you work only with Cambridge companies?**
No. Our clients are across the UK. The studio is in Cambridgeshire, which makes meeting in person straightforward.

**What happens after launch?**
Bug fixes are free for the first month. After that, Adapt continues the work: a plan for what the site must establish next, and the studio time each month to carry it out.

### [ 06 ] Enquiries
**Heading:** If the business has outgrown the site, / we should talk.

Currently scoping
projects for early 2027.

---

## 2. Cambridge CGI

**Slug:** `/cambridge-cgi`
**SEO title:** CGI Studio Cambridge | Product CGI and 3D animation | PIXEL SILO
**Meta description:** Product, technology and brand CGI from a founder-led studio in Cambridgeshire: films, renders, technical animation and interactive 3D, produced in-house by the person you brief.

### [ 00 ] **H1 (set small, in the eyebrow):** CGI and 3D animation studio Cambridge

**Display line (a div, not a heading):** Every frame, / made with purpose. *(chosen by Luke, 23 Nov 2026; was "Invented in Cambridge. / Made visible.")*

**Line under the H1:** A CGI studio in Cambridgeshire for products, technology and brands. Films, renders and 3D product animation, produced in-house by the person you brief.
Reel 2026
Imagery · Motion · Web

### [ Before the studio ]
15 years agency-side
A processor measured in nanometres. Software with no physical form. A therapy, a platform, a method. Much of what Cambridge produces cannot be placed in front of a lens, yet it must be shown to investors, customers and partners who will form a view from an image, often before reading a word.
We produce that image in whatever form the purpose requires: a film, a set of stills, an animation that explains a mechanism, a visual language for the brand, or a model that can be examined on the website. All of it is made in the studio, by one person.

### [ 01 ] What we make
**Heading:** Six disciplines, / one pair of hands.

*01 / Films*

**Launch, campaign and investor films**
Used where the account must be given in sequence: what it is, how it works, why it matters.
Launch films
Brand films
Hero loops for the website
Cut-downs for social and email
*02 / Stills and renders*

**Where a single image carries the case**
Used where photography cannot keep pace with finishes, variants or schedule, or where nothing yet exists to photograph.
Hero images and key visuals
Product renders and colourways
Packaging and bottles
Campaign and press images
*03 / Brand imagery and abstract 3D*

**For organisations with no object to photograph**
Used where the brand requires a visual language of its own, specific to the organisation.
Identity sequences and idents
Logo animation
Abstract 3D and textures
Imagery for websites and decks
*04 / Explainer and technical animation*

**For work that requires explanation**
Used where the value lies inside the casing, below the visible scale, or in no object at all.
How a product, platform or process works
Exploded views and cutaways
Science and data, visualised
Modelling from CAD
*05 / Stages and screens*

**For keynotes, stands and showrooms**
Used where the work must hold a large screen before an audience.
Stage and keynote backgrounds
Stand and exhibition content
Showroom loops
*06 / Interactive 3D*

**For examination by the viewer**
Used where the viewer needs to rotate, open or configure the subject.
Viewers
Configurators
Simulators
Scroll-led pages

### [ 02 ] Build it once
**Heading:** Built once. / Used throughout.

Whether the subject is a product model or a visual language for the brand, it is built once and built accurately. Film, stills, animation and the interactive model all derive from the same source, so they are consistent with one another, and each later request costs less than the first.
Because the studio also designs and builds websites, the imagery need not end as a folder of files. It can be made for the page on which it will appear, as one project with one price.

### [ 03 ] The work
**Heading:** Films, renders / and brand imagery.


### [ 04 ] Who makes it
**Heading:** Fifteen years agency-side. / Five as a studio.

Before founding the studio, Luke spent fifteen years agency-side, leading brand and digital work for Arm, Intel and Nvidia and producing launch films for Corsair: large organisations, close scrutiny, and little tolerance for work that only appears finished.
PIXEL SILO is five years old and remains two people by design. The person you brief carries out the modelling, lighting, animation and edit. The studio is in Cambridgeshire, so we can visit, see the subject at first hand and speak to the people who built it.

### [ 05 ] How it works
**Heading:** Four stages. / Each approved before the next.


**Purpose**
Who will see the work, what they need to believe, and where they will see it. A launch page, a stage and an investor deck make different demands.

**Scope and price**
A written scope, a timeline and a fixed price, with every film, still and format listed before work begins.

**Model, look, motion**
Rough frames first, then materials and lighting, then the finished piece. Each step is approved before the next begins.

**Delivery**
Every format on the list, prepared for its destination. All final renders, animations and assets are yours outright once the project is paid in full.

### [ 06 ] Questions

**What is required to begin?**
For a product: CAD where available, otherwise the product itself, or drawings and photographs. For brand work: existing guidelines, if any, and an hour of your time.

**The product is not yet final. Is that an obstacle?**
No. Most of this work takes place before launch. Scenes are built so that a late design change is an update, not a restart.

**Do you work under NDA?**
Yes. Either party's agreement can be signed before anything is shared.

**What does it cost?**
Cost depends on how much must be built and how many pieces are produced from it. Each project is scoped first, and a fixed price is agreed before work begins.

**Is a small set of stills a viable project?**
Yes. Stills are a sensible starting point, and everything built remains available for a film later.

**Can the CGI form part of a website or brand project?**
Yes. Most of our imagery is produced that way: alongside the brand and the build, as one project with one price.

**Do you work only with Cambridge companies?**
No. Our clients are across the UK. The studio is in Cambridgeshire, which makes meeting in person straightforward.

### [ 07 ] Enquiries
**Heading:** If the work has outgrown its images, / we should talk.

Currently scoping
projects for early 2027.

---

## For Luke to check

True as far as I know, but only you can confirm:

1. **The six kinds of work.** Is every one something you'd take on as a paid job from a Cambridge enquiry? Three rows have nothing on the Work page to prove them yet: explainer and technical animation, stages and screens, interactive 3D. Each needs at least one piece you can show, or it should come out.
2. **Stages and screens.** Written on the strength of the Nvidia and Arm stage backgrounds from agency days. If you can show them, they go in the previous experience row. If you can't, cut the row.
3. **"The next request costs less than the first."** The build-it-once promise. Keep it only if that's how you'd price it.
4. **"We only need a few stills. Is that too small?"** I've answered no. Say if there's a floor.
5. **NDA.** "Send yours, or we can send ours." Do you have your own to send?
6. **Visits.** Both pages say you can meet in person, and the CGI page says "we can come to you".
7. **"Rough frames first, then materials and lighting, then the finished piece."** Is that how you run a CGI job?
8. **"Making launch films for Corsair."** Split from Arm, Intel and Nvidia ("leading brand and digital work") so nothing implies you made CGI for all four. Correct the split if it's wrong.
9. **Eschler and Torre in the CGI work list.** Listed as brand imagery and motion, from their case study tags. Confirm the 3D in both is yours to show here.

Decisions:

10. **How far this goes.** A page this broad will bring in standalone CGI and motion jobs, including the kind you've said you don't much enjoy. "Build it once" steers people towards CGI as part of a brand and web project, but the enquiries will be mixed.
11. **Agencies.** Vitus and Stillpoints were built for BAAAM. I've not added a "we work with agencies" line. Add one only if you want that work.
12. **A named Cambridge client.** Arm and Secure Thingz are Cambridge companies. One true line saying so would be the strongest local proof on the page. Not written, because I don't know what you're allowed to say.
13. **The H1 pair.** "Built in Cambridge. / Understood everywhere." and "Invented in Cambridge. / Made visible." The earlier lines ("Cambridge knows how good you are.", "Cambridge makes things a camera can't show.") are the warmer alternatives.
14. **Google Business Profile and the rest of the ranking list.** See the Ranking section below. Items 7 to 9 there are yours.

---

## Ranking: what the numbers say and what gets us there

Nobody can promise a position on Google. What follows is what's in our control, in order of how much it moves things.

### What people search (UK, monthly, SE Ranking, 22 Nov 2026)

| Search | A month | Difficulty (0-100) |
|---|---|---|
| web designer cambridge | 170 | 20 |
| website designers cambridge | 170 | 16 |
| design agency cambridge | 90 | 30 |
| web design agency cambridge | 70 | 22 |
| web development cambridge | 50 | 24 |
| web design cambridgeshire | 50 | 20 |
| branding agency cambridge | 40 | 24 |
| web design cambridge / cambridge web design / website design cambridge | 10 each | 22-34 |
| 3d product animation (national) | 70 | 6 |
| product cgi (national) | 10 | 6 |
| cgi cambridge, cgi studio cambridge, 3d animation cambridge, animation studio cambridge, 3d rendering cambridge, product animation cambridge and 10 similar | too few to measure | - |

**What that means:**

- **The web page is the one with real traffic.** Around 600 searches a month across the cluster, and the difficulty scores are low. People type "web designer" and "website designers" far more than "web design", so the title and the line under the H1 now use those words.
- **The CGI page will rank without much of a fight, and bring few visitors.** Nobody measurable searches "CGI Cambridge" in a month. The page is still worth having: the few who do search are close to buying, it costs nothing to keep, and it gives the web page and the Google profile something to link to. To give it real traffic it also goes after "3D product animation", which is national, has 70 searches a month and almost no competition.

### On the pages (done in this draft or in the build)

1. Search words in the SEO title, the eyebrow, the line under the H1, one section heading and the image alt text. The H1 itself stays written for the person.
2. One page per search. Neither page competes with the homepage, which stays about the situation, not the place.
3. `Service` schema with `areaServed` Cambridge and Cambridgeshire, `FAQPage` for the questions, and `LocalBusiness` on the studio with the same name, address and phone everywhere.
4. Links in: the footer, the Studio page ("from a studio in Cambridgeshire" becomes a link), each relevant case study, and each page to the other.
5. Real content a templated competitor can't copy: the work, the quotes, the films.
6. In the sitemap, and submitted in Search Console on the day they go live.

### Off the pages (Luke's to do, and they matter more)

7. **Google Business Profile.** For "web designer cambridge", Google shows a map with three businesses above the ordinary results. That map is where most clicks go, and only a verified profile gets in. Category "Website designer", service area Cambridge, the web page as the link. Ask the three clients quoted on the site for a Google review each.
8. **Cambridge Network.** WaveFX and Cambridge Filmworks both rank through their directory pages there. Membership gets a listing and a link from the most trusted local business site.
9. **Local links.** Any Cambridge client's site crediting the studio, Cambridge Edition or Business Weekly coverage, a Cambridge chamber or co-working listing. A handful of real local links outweighs everything on the page.
10. **The address question.** The site says Cambridgeshire. Google ranks by distance from the searcher, so a studio outside the city starts behind one in CB1. A service-area profile is honest and still works. We don't claim a Cambridge address we don't have.

### How we'll know

Search Console after four to six weeks: impressions and position for the searches in the table. If the web page sits on page two, the fix is items 7 to 9, not more words on the page.

### Who is on page one for "cambridge web design" (Luke's search, 23 Nov 2026)

| Site | Ranks with | Title starts | Phrase in H1 | Words | Linking sites |
|---|---|---|---|---|---|
| Mobas | inner page | Digital Marketing Agency Cambridge | no | 2,800 | about 240 to 540 |
| Vivid Space | homepage | Cambridge Web Design | yes | 380 | about 30 to 60 |
| Chameleon Studios | homepage | Web Design Cambridge | partly | 1,840 | about 840 |
| Nettl Cambridge | location page | Web Design Cambridge | not read (redirect) | - | about 450 to 3,400 |
| KISS | inner page | Cambridge Website Design & Development Agency | no | 940 | about 220 to 790 |
| Design Monkey | homepage | Web Design Cambridge | yes | 640 | about 100 to 580 |
| i3MEDIA | inner page, /cambridge-web-design | Web Design in Cambridge | yes | 1,490 | about 180 to 590 |
| **PIXEL SILO** | inner page | Web Design Cambridge | yes (from this draft) | 1,000 | about 67 |

Linking-site counts come from two providers that count differently, so read them as rough sizes.

What it shows:

- **The exact phrase is the entry ticket.** Six of seven have "Web Design Cambridge" or close in the title. Ours now does, and the phrase is the page's H1, set small in the eyebrow so the headline stays ours.
- **A small site can be there.** Vivid Space is on page one with 380 words and fewer linking sites than pixelsilo.net. What it has that we don't is an exact-match homepage and, most likely, a Cambridge Google Business Profile.
- **An inner page can be there.** i3MEDIA and KISS both rank with one, which is what ours is.
- **Links are the gap.** Most of the page has several times our linking sites. Items 7 to 9 above close that; nothing on the page does.
- **Nobody on the page sounds like us.** "Award-winning", "bespoke", "stunning", WordPress. The meta description now says who it is for and makes two claims that can be checked, which is what earns the click once we are on the page.

### Who is on page one for "cgi cambridge" (Luke's search, 23 Nov 2026)

Google reads "CGI Cambridge" three ways, and says so in its own AI summary: architectural visualisation, CGI the IT consultancy, and the Chartered Governance Institute.

| Result | What it is |
|---|---|
| Visual Trick, 3D Cambridge, KreatiViz, Foundation CGI | Architectural visualisation for developers and architects |
| Mode Photo | Marketing CGI, shown with a housing development |
| Cambridge Creative | Marketing CGI and animation. The page ranking is their staging address, not their live site |
| cgi.com (three results) | The IT consultancy, its offices and an event |
| cgi.org.uk | The governance institute |

What it shows:

- **Nobody on the page does product, technology or brand CGI.** That is the open slot, and the two "marketing CGI" results holding it are weak: one is a photographer's property page and one is a staging site.
- **The risk is the one named at the start.** Most people typing this want buildings. The page will rank among them, so its title, H1 and description now say products, technology and brands before anyone clicks. That is what keeps architects from enquiring; no "what we don't do" line is needed.
- **Half the page is unwinnable and irrelevant.** The IT consultancy and the institute will always be there. Six or seven real places, and a different audience for most of them.
- **Volume is still tiny.** This confirms the earlier numbers. The CGI page earns its keep from "3D product animation" nationally and from being the page a Google Business Profile and the web design page can point at.

---

## Design additions (23 Nov 2026)

Added after the copy above was written out, so sections 1 and 2 don't show them. The local pages and `dev/cambridge/build.py` are current.

### What was added

| Addition | Where it comes from on the site | Web design page | CGI page |
|---|---|---|---|
| Animated schematics on cards | The Adapt feature cards (`feature_visual`, `lottie-stagger`) | The four things the site must establish | The four AI cards |
| Figures that count up | The Hello pages' stats (`stat_value`, `count-up`) | Under "How it works" | Under "How it works" |
| A note from Luke, on the light theme with the portrait | The homepage's studio section | New section 05 | Replaces "Who makes it" |
| The heading sparkle | "AI powered dashboard" on the homepage | Not used | On "AI speed." |

The eight schematics are new drawings in the existing vocabulary (8px orange marker, 2px content bars, 1px structure lines, mono labels). They live in `lottie/visuals.json` as `cam-web-01` to `04` and `cam-cgi-01` to `04`, and `npm run lottie` builds them. They only animate on the site once they are in a release: locally the pages show the finished frame, and `lottie/preview.html` plays them.

### New copy: the AI section on the CGI page

Rewritten 23 Nov 2026 on Luke's direction: the earlier version gave too much of the pipeline away. Nothing here names a tool or a method. The point is that we don't make AI films; AI is part of the workflow, and it buys better results sooner.

**[ 04 ] How it is made**
**Heading:** AI speed. / Traditional control.

We do not make AI films. Every frame is modelled, lit and rendered in 3D, under direct control. AI is part of the workflow behind it, and it is there for one reason: better results, sooner.

It gives us more options at every stage. Procedural textures are built quickly. Ideas are tested, refined and optimised while there is still time to act on them. None of it brings the inconsistency and unreliability of AI-generated imagery.

**01 Speed.** Experiments and iterations turn round faster, so the work reaches the right answer sooner and leaves time to optimise it.
**02 Options.** More directions, materials and procedural textures are explored before one is chosen.
**03 Control.** Light, material and camera are set by hand, to the value. Nothing is left to a prompt.
**04 Consistency.** Every frame comes from the same 3D scene, so nothing drifts, flickers or changes between shots.

The four diagrams were redrawn to match (`cam-cgi-01` to `04`): a staircase graph reaching the target line sooner; four procedural texture swatches with one chosen; three instrument dials for light, material and camera, each with a tick scale, a needle and a read-out; six frames with the same registration mark over a flat trace. The values on them (5600 K, R 0.35, 85 MM, DRIFT 0.00) are illustrative.

Luke's note on the CGI page changed with it: "AI now works inside Cinema 4D alongside me" is now "AI is now part of how I work".

### New copy: a note from Luke, web design page

**[ 05 ] The studio**
**Heading:** The person you brief is / the person who builds it.

**Most Cambridge companies I meet are better than their website suggests.**

Before the studio I spent fifteen years in agencies, leading brand and digital work for Arm, Intel, Nvidia, AMD and Mubadala. Large organisations, high scrutiny, and very little tolerance for work that only looks finished.

Every project starts with the same question: what does someone need to believe about you in the first five seconds, before they have read a word? We settle that in wireframes, before any design begins.

We run the studio from Cambridgeshire. There are no account managers or layers between you and the work: I design, build and render it, and Zoe keeps the project moving.

### New copy: a note from Luke, CGI page

**[ 05 ] Who makes it**
**Heading:** Fifteen years agency-side. / Five as a studio.

**The render is rarely the hard part. Deciding what it has to show is.**

Before the studio I spent fifteen years in agencies, leading brand and digital work for Arm, Intel and Nvidia and making launch films for Corsair. Large organisations, high scrutiny, and very little tolerance for work that only looks finished.

I still do the modelling, the lighting, the animation and the edit myself. The tools have changed a great deal: AI now works inside Cinema 4D alongside me. The judgement about what belongs in the frame has not changed at all.

We run the studio from Cambridgeshire, so I can come to you, see the subject at first hand and speak to the people who built it.

### Figures

Web design: 15 years agency-side, 5 years as a studio, 8 stages in every project, 6 weeks roughly from brief to launch.
CGI: 15 years agency-side, 5 years as a studio, 6 kinds of CGI work, 1 person from brief to delivery.

### For Luke to check

1. **"Every frame is modelled, lit and rendered in 3D."** True only if no delivered frame is AI-generated or AI-enhanced. If some are, this line needs softening.
2. **"Nothing is left to a prompt."** Strong, and a visitor could hold you to it. Cut it if prompts play any part in the look.
3. **"Accuracy" is gone as a card.** It was the CAD one. "Options" replaced it, to carry procedural textures. Say if you want accuracy back in place of one of the four.
6. **The two notes.** They are in your voice and under your name, so rewrite them freely. Both opening lines are mine.
7. **The CGI note is new territory.** It says AI now works inside Cinema 4D alongside you, in the first person. Earlier guidance was to keep AI to one clear statement. This page now has a whole section on it, at your request, so the rest of the page says nothing more about AI.
8. **The sparkle before "AI speed."** It pushes the first line off the left column line by the icon's width. It can sit after the words if you'd rather keep the heading flush.

### Picture strips on the CGI page (23 Nov 2026)

Two strips, two photographs each, on the four-column grid. `strip()` in `dev/cambridge/build.py`.

| Strip | Where | Column 1 | Columns 2 to 4 |
|---|---|---|---|
| First | Under the intro | King's College Chapel from a side street | Punt in front of King's College Chapel |

| Strip | Where | Columns 1 to 3 | Column 4 |
|---|---|---|---|
| Second | Under "Built once. / Used throughout." | Punts on the River Cam | Punt passing under the bridge |

Existing classes only: `cell is-col-1 is-flush` with `cell is-col-2-4-bleed`, and `cell is-col-1-3-bleed` with `cell is-col-4-bleed`, each holding a `media is-wide`. The column 4 picture is a new crop of the bridge photograph (`cambridge-river-cam-punter.webp`) so the punter stays in frame at one column wide. The punt in front of the chapel is also the web design page's strip.

### The reel in the CGI hero (23 Nov 2026)

The CGI page's hero now plays Luke's motion graphics showreel in place of the homepage reel: `https://pixelsilo.s3.eu-west-2.amazonaws.com/pixelsilo-showreel-v1_1.mp4` (`REEL` in `dev/cambridge/build.py`). Found through the web archive: the old site's Showreel page and its "Cambridge Motion & CGI" page both used this file in October 2025.

- 1 minute 22, 1920 x 1080, 45 MB, uploaded March 2021. Muted, looping, loaded after the page like the homepage reel.
- The reel credits each clip in captions at the bottom left, so the "Reel 2026 / Imagery · Motion · Web" label is removed from this hero.
- A second version is in the same bucket: `pixelsilo-showreel-public-v1.mp4` (1 minute 14, 1920 x 800, 49 MB, May 2021), used on the old site from 2021 to 2023.

For Luke:

1. **Which version.** I've used the one the old site ended on. Say if the "public" cut is the one cleared for showing.
2. **Weight.** 45 MB is about fifteen times the homepage reel, with no phone version and no poster frame. Before this goes on the live site it needs the same treatment as the homepage reel: a compressed desktop file, a phone crop and a poster, uploaded to Webflow Assets.
3. **It's from 2021.** If there's a newer cut, or you'd rather drop the oldest clips, this is the moment.
4. **No sound.** The hero plays it muted. If the reel should be watchable with sound, a "Watch the reel" button can open it in the site's existing film player.

### CGI hero layout (23 Nov 2026, later)

Luke's direction: the reel shown clearly, filling the hero, behind the nav bar; the headline smaller and in the bottom left corner; everything else underneath.

- The reel fills the first screen (`100svh`) and runs behind the header. No scrim. The grid lines stay over it.
- The header is clear while the reel is under it and takes its usual background once the hero has scrolled away (`is-over-film`, toggled by a few lines of script in the page head).
- On the reel: the eyebrow (the H1, "CGI and 3D animation studio Cambridge") and the headline at `heading-l`, bottom left, lifted 4.5rem so the reel's own caption line shows beneath it.
- Under the reel, as a section of its own: the lead paragraph and the two buttons, then the logo strip.
- The reel file has black bars baked in (1920 x 1080, picture in the middle 800). The video is oversized by 1080/800 so the bars fall outside the hero. A recompressed file should be cropped to 1920 x 800 and this rule dropped.

New for Webflow: `section.is-hero.is-film`, `hero_film`, `section.is-hero-links`, a clear header state, and the script that sets it. Everything else is existing classes.

Headline: Luke chose "Every frame, / made with purpose." on 23 Nov 2026.

### CGI hero: the reel's own shape (23 Nov 2026, later still)

Supersedes the "fills the first screen" layout above. The reel carries Luke's credit for each clip in a caption along the bottom left of the picture, and filling the screen cropped it.

- **Tablet and desktop (768px and up):** the hero is 2.4:1, the shape of the reel's picture, at full width whatever the window height. Nothing is cropped, so the caption is always whole. 594px tall at 1440 wide, 800px at 1920.
- **Phone:** 2.4:1 would be 156px tall, so the hero is 80% of the screen height and the picture is cropped to fill it. The sides go, and the video is shifted so the bottom tenth, with the caption, goes too.
- **Headline:** top left, under the logo, clear of the caption.
- **Open:** with no scrim, the white headline and nav are unreadable on the reel's white frames (the Corsair clip, for one), and the headline sits over the reel's own on-screen graphics.

### Scroll drift on the Cambridge photographs (23 Nov 2026)

Each photograph moves a little inside its frame as it crosses the screen. New module `scroll-drift` (`src/modules/scroll-drift.js`): `data-module="scroll-drift"` and `data-drift` on the `.media` frame. Same travel (3.5%) and scrub (0.8) as the case study galleries. Still under reduced motion. It needs a release before it runs on the real site.

| Photograph | Page | Motion | Why |
|---|---|---|---|
| King's College Chapel from the side street | CGI | Rises | A tall subject in a narrow frame |
| Punt in front of King's College Chapel | CGI and web design | Pans left | A long horizon |
| Punts on the River Cam | CGI | Pushes in | The river runs away from the viewer |
| Punt passing under the bridge | CGI | Pans right | The way the punt is heading |

The web design page's hero photograph is left still: it already settles from a zoom when the page loads, and a second motion on it would fight that.

---

## Where it stands (sweep, 23 Nov 2026)

This section is the current list. The "For Luke to check" lists further up were written at earlier stages and are partly out of date.

**Checked and passing on the local pages:** no dashes, no banned words in new copy, "CGI" on the CGI page only, no tool or method named in the AI section, one H1 a page, `Service` and `FAQPage` schema valid with Cambridge and Cambridgeshire as the area, both pages `noindex` with a canonical address, every image has alt text and loads, no sideways scroll at 1440, 800 or 375 wide, the reel plays, the header clears over the reel and returns after it, all diagrams and photo drifts start.

**Not done yet:**

1. Nothing is built in Webflow. Both pages exist only as local previews.
2. Nothing is committed. A release is needed before the diagrams animate and the photos drift on the real site.
3. The two pages don't link to each other, and nothing links to them (footer, Studio page, case studies). The site has no inline text link style, so this needs a decision at the Webflow build.
4. The reel is a 45 MB file from 2021 with black bars baked in, no phone version and no poster. It needs recompressing and cropping to 1920 x 800 before going live.
5. Both pages use the homepage's share image.

**For Luke to decide or confirm:**

1. Headline on the reel: unreadable on the reel's white frames with no overlay. Move it under the reel, or accept it.
2. Web design meta description says "technology and science companies", which names sectors. The rest of the site describes clients by situation.
3. Three kinds of CGI work have nothing on the Work page to prove them: explainer and technical animation, stages and screens, interactive 3D.
4. Claims to confirm on the CGI page: "Every frame is modelled, lit and rendered in 3D", "Nothing is left to a prompt", "each later request costs less than the first", "a late design change is an update, not a restart", NDA either way, a small set of stills is a viable project, "I can come to you".
5. Claims to confirm on the web design page: the strategy session can be in person; the "Is a studio of two sufficient" answer.
6. Which reel cut: `pixelsilo-showreel-v1_1.mp4` is in use; `pixelsilo-showreel-public-v1.mp4` is the other.
7. Eschler and Torre appear in the CGI page's work list as brand imagery. Confirm the 3D in both is yours to show there.
8. Google Business Profile, Cambridge Network and local links: these decide the web design ranking more than the page does.
