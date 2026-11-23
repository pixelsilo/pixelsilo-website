"""Build local previews of the two Cambridge landing pages.

    python dev/cambridge/build.py
    python -m http.server 8765 --bind 127.0.0.1     (or the dev-static preview)
    http://127.0.0.1:8765/dev/cambridge-web-design.html
    http://127.0.0.1:8765/dev/cambridge-cgi.html

It fetches the staging site, keeps its head, header, footer, styles and scripts, and swaps <main>
for sections assembled from the site's own markup and classes. Nothing here is a new class: every
block is a pattern already on Home, Studio, Adapt or Work, so the pages can be rebuilt in Webflow
one for one. Copy comes from drafts/cambridge-pages.md; change it there first, then here.

The pages are noindex and carry a <base> pointing at staging, so nav links and assets resolve.
Don't submit the First impressions form from a local page: it posts to the real Webflow form.
"""
import html
import json
import re
import sys
import urllib.request
from pathlib import Path

STAGING = "https://pixel-silo-2026.webflow.io"
LIVE = "https://pixelsilo.net"
OUT = Path(__file__).resolve().parent.parent
# Luke's Cambridge photographs, in dev/cambridge/img. The pages carry a <base> pointing at staging,
# so local images need a full address. In Webflow these become Assets.
IMG = "http://localhost:8765/dev/cambridge/img/"
# The posters of the feature visuals (lottie/visuals.json, cam-web-* and cam-cgi-*). Locally only the
# poster shows: the animation loads from wherever site.js is served, so it plays once these are in a
# release. Watch them move at http://localhost:8765/lottie/preview.html (npm run lottie -- --preview).
POSTER = "http://localhost:8765/public/lottie/"

LINE = '<div aria-hidden="true" line="h" class="line-h"></div>'
STACK_LINE = '<div aria-hidden="true" line="h" class="line-h is-stack"></div>'
GRID = (
    '<div aria-hidden="true" class="grid-lines">'
    + "".join(f'<div line="v" class="line-v is-{n}"></div>' for n in ("start", "q1", "mid", "q3", "end"))
    + "</div>"
)
e = html.escape


def fetch(path):
    req = urllib.request.Request(STAGING + path, headers={"User-Agent": "Mozilla/5.0"})
    return urllib.request.urlopen(req, timeout=30).read().decode("utf-8")


def balanced(src, start, tag="div"):
    """The element that opens at src[start], through its matching close tag."""
    depth = 0
    for m in re.finditer(rf"<(/?){tag}\b", src[start:]):
        depth += -1 if m.group(1) else 1
        if depth == 0:
            end = src.index(">", start + m.end()) + 1
            return src[start:end]
    raise ValueError("unbalanced " + tag)


def sections(page):
    main = re.search(r"<main[^>]*>(.*)</main>", page, re.S).group(1)
    out, pos = [], 0
    for m in re.finditer(r"<section\b", main):
        if m.start() < pos:
            continue
        s = balanced(main, m.start(), "section")
        out.append(s)
        pos = m.start() + len(s)
    return out


# ---------- blocks ----------

def section(*parts, attrs='class="section"'):
    return f"<section {attrs}>" + "".join(parts) + LINE + GRID + "</section>"


def eyebrow(num, label):
    return (
        '<div class="eyebrow"><div class="text-accent"><p class="text-mono">[ ' + num + " ]</p></div>"
        f'<p class="text-mono">{e(label)}</p></div>'
    )


def head(num, label, line1, line2, aside="", icon=""):
    """icon: the site's heading sparkle (Site.sparkle), set before the first line."""
    aside = f'<p class="text-body-l">{e(aside)}</p>' if aside else ""
    if icon:
        return (
            '<div class="row"><div class="cell is-col-1">' + eyebrow(num, label) + "</div>"
            '<div class="cell is-col-2-3"><h2 split="chars" class="heading-xl">'
            f'<div>{icon}<span> {e(line1)}</span></div><div class="text-muted">{e(line2)}</div></h2></div>'
            f'<div class="cell is-col-4">{aside}</div></div>' + LINE
        )
    return (
        '<div class="row"><div class="cell is-col-1">' + eyebrow(num, label) + "</div>"
        '<div class="cell is-col-2-3"><h2 split="chars" class="heading-xl">'
        f'<div>{e(line1)}</div><div class="text-muted">{e(line2)}</div></h2></div>'
        f'<div class="cell is-col-4">{aside}</div></div>' + LINE
    )


def two_text(main, detail):
    return (
        '<div reveal-group="grid" class="row">'
        f'<div reveal-box="grid" class="cell is-col-2 is-clip"><p reveal="up" class="text-body-l">{e(main)}</p></div>'
        f'<div reveal-box="grid" class="cell is-clip">{STACK_LINE}'
        f'<div reveal="up" class="text-muted"><p class="text-body">{e(detail)}</p></div></div></div>'
    )


def band(name, alt, drift="left"):
    """A photograph across columns 2 to 4, the width of the hero film. drift: see src/modules/scroll-drift.js."""
    return (
        LINE + '<div reveal-group="grid" class="row is-panel"><div reveal-box="grid" class="cell is-col-2-4-bleed">'
        f'<div data-module="scroll-drift" data-drift="{drift}" class="media is-wide">'
        f'<img src="{IMG}{name}.webp" loading="lazy" alt="{e(alt)}" class="media_image"/>'
        "</div></div></div>"
    )


def strip(narrow, wide, wide_first=False):
    """Two photographs on the grid: one column wide and three columns wide. narrow, wide: (name, alt, drift).
    wide_first puts the wide one in columns 1 to 3 and the narrow one in column 4.
    drift is how the photo moves in its frame on scroll (src/modules/scroll-drift.js), chosen per picture."""
    def pic(cls, item):
        name, alt, drift = item
        return (
            f'<div reveal-box="grid" class="cell {cls}"><div data-module="scroll-drift" data-drift="{drift}" class="media is-wide">'
            f'<img src="{IMG}{name}.webp" loading="lazy" alt="{e(alt)}" class="media_image"/></div></div>'
        )
    cells = (
        pic("is-col-1-3-bleed", wide) + pic("is-col-4-bleed", narrow)
        if wide_first
        else pic("is-col-1 is-flush", narrow) + pic("is-col-2-4-bleed", wide)
    )
    return LINE + f'<div reveal-group="grid" class="row is-panel">{cells}</div>'


def feature_cards(prefix, items):
    """Four across with an animated schematic, the Adapt feature card. items: (title, body)."""
    out = ['<div reveal-group="grid" data-module="lottie-stagger" class="row is-panel">']
    for i, (title, body) in enumerate(items):
        name = f"{prefix}-{i + 1:02d}"
        out.append(
            '<div reveal-box="grid" class="cell is-pad is-feature">' + (STACK_LINE if i else "")
            + f'<div reveal="down" class="text-muted"><p class="text-mono">{i + 1:02d}</p></div>'
            f'<div reveal="up" data-lottie="{name}" aria-hidden="true" class="feature_visual">'
            f'<img src="{POSTER}{name}.svg" loading="lazy" alt="" class="feature_poster"/></div>'
            f'<div class="stack is-actions"><h3 reveal="up" class="title-l">{e(title)}</h3>'
            f'<div reveal="up" class="text-muted"><p class="text-body-s">{e(body)}</p></div></div></div>'
        )
    return "".join(out) + "</div>"


def stats(items):
    """Four figures that count up, the Hello pages' stat. items: (number, unit, label)."""
    out = [LINE + '<div reveal-group="grid" class="row is-panel">']
    for i, (number, unit, label) in enumerate(items):
        out.append(
            '<div reveal-box="grid" class="cell is-pad is-stat">' + (STACK_LINE if i else "")
            + f'<div reveal="up" class="stat_item"><div class="stat_value"><span count-up="">{number}</span>'
            f'<span class="stat_out">{e(unit)}</span></div>'
            f'<div class="text-muted"><p class="text-mono">{e(label)}</p></div></div></div>'
        )
    return "".join(out) + "</div>"


def cards(items):
    """Four across, the Home 'How it works' card. items: (title, body)."""
    out = ['<div reveal-group="grid" class="row is-panel">']
    for i, (title, body) in enumerate(items):
        out.append(
            '<div reveal-box="grid" class="cell is-pad">' + (STACK_LINE if i else "")
            + '<div reveal="down" class="split"><div class="text-accent">'
            f'<p class="text-mono">{i + 1:02d}</p></div>'
            f'<div class="text-muted"><p class="text-mono">/ {len(items):02d}</p></div></div>'
            f'<div class="stack is-actions"><h3 reveal="up" class="title">{e(title)}</h3>'
            f'<div reveal="up" class="text-muted"><p class="text-body-s">{e(body)}</p></div></div></div>'
        )
    return "".join(out) + "</div>"


def capabilities(items):
    """Three across from column 2, the Home 'What we do' cell. items: (name, title, body, [list])."""
    rows = []
    for r in range(0, len(items), 3):
        cells = []
        for i, (name, title, body, caps) in enumerate(items[r:r + 3]):
            n = r + i + 1
            cap = "".join(
                f'{LINE}<div reveal="up" class="cap_item"><p class="text-body-s">{e(c)}</p></div>' for c in caps
            )
            cells.append(
                f'<div reveal-box="grid" class="cell {"is-col-2 " if i == 0 else ""}is-clip">'
                + (STACK_LINE if i else "")
                + f'<div reveal="up" class="eyebrow"><div class="text-accent"><p class="text-mono">{n:02d}</p></div>'
                f'<p class="text-mono">/ {e(name)}</p></div>'
                f'<h3 reveal="up" class="title-l">{e(title)}</h3>'
                f'<div reveal="up" class="text-muted"><p class="text-body-s">{e(body)}</p></div>'
                f'<div class="cap_list">{cap}</div></div>'
            )
        rows.append('<div reveal-group="grid" class="row">' + "".join(cells) + "</div>")
    return LINE.join(rows)


def faq(num, items):
    out = [
        '<div class="row"><div class="cell is-col-1">' + eyebrow(num, "Questions") + "</div></div>" + LINE,
        '<div data-module="work-list">',
    ]
    for i, (q, a) in enumerate(items):
        is_open = i == 0
        out.append(
            '<div data-work="item" class="work_item">'
            f'<div aria-expanded="{"true" if is_open else "false"}" data-work="toggle" role="button" tabindex="0" class="row is-list">'
            f'<div class="cell is-aside"><div data-work="num" class="work_num{" is-open" if is_open else ""}">'
            f'<p class="text-mono">{i + 1:02d}</p></div></div>'
            f'<div class="cell is-col-2-3"><h3 class="heading-xs">{e(q)}</h3></div>'
            '<div class="cell is-col-4"><div class="work_meta is-end">'
            f'<p aria-hidden="true" data-work="icon" class="work_icon{" is-open" if is_open else ""}">{"−" if is_open else "+"}</p>'
            "</div></div></div>"
            f'<div data-work="panel" class="work_panel{" is-open" if is_open else ""}"><div class="row is-answer">'
            f'<div class="cell is-col-2-3"><p class="text-body">{e(a)}</p></div></div></div>' + LINE + "</div>"
        )
    return "".join(out) + "</div>"


class Site:
    """The pieces lifted from staging, unchanged."""

    def __init__(self):
        self.home = fetch("/")
        work = fetch("/work")
        s = sections(self.home)
        self.hero_src, self.clients, self.enquiries_src = s[0], s[1], s[10]
        self.studio_src = s[9]  # the light "A note from Luke" section, with the portrait
        self.sparkle = re.search(
            r'<span aria-hidden="true" class="heading_icon">.*?</svg></span>', self.home, re.S
        ).group(0)
        work_sec = s[3]
        self.items = {}
        for m in re.finditer(r'<div data-work="item" role="listitem"', work_sec):
            item = balanced(work_sec, m.start())
            self.items[re.search(r'<h3 class="heading-xs">(.*?)</h3>', item).group(1)] = item
        i = work_sec.index("[ Said about the work ]")
        self.quotes = balanced(work_sec, work_sec.rindex('<div reveal-group="grid" class="row">', 0, i))
        films_sec = sections(work)[2]
        j = films_sec.index("data-films-head")
        self.films = balanced(films_sec, films_sec.index('<div class="w-dyn-list">', j))
        self.dialog = re.search(r"<dialog\b.*?</dialog>", work, re.S).group(0)
        rows = [m.start() for m in re.finditer(r'<div class="row is-tight">', self.clients)]
        self.before_studio = (
            '<section aria-label="Before the studio" class="section">'
            + balanced(self.clients, rows[1]) + LINE + GRID + "</section>"
        )

    def hero(self, label, line1, line2, lead, primary, secondary, image=None, film=False):
        h = self.hero_src
        if film:  # the reel fills the whole hero, with the heading and buttons over it (NEW classes, see FILM_CSS)
            video = re.search(r"<video.*?</video>", h, re.S).group(0)
            if film is not True:  # a different film from the homepage reel: one MP4, no AV1, phone or poster versions
                video = re.sub(r'\sdata-(?:src|poster)[\w-]*="[^"]*"', "", video)
                video = video.replace("<video ", f'<video data-src="{film}" ', 1)
                # This reel credits each clip in its own bottom-left captions, so the "Reel 2026" label goes.
                h = h.replace(
                    '<div intro="item" class="text-muted"><div class="stack is-tight"><p class="text-mono">Reel 2026</p>'
                    '<p class="text-mono">Imagery · Motion · Web</p></div></div>', "",
                )
            h = h.replace(balanced(h, h.index('<div class="cell is-col-2-4-bleed">')), "")
            h = h.replace(
                '<section class="section is-hero">',
                '<section class="section is-hero is-film"><div aria-hidden="true" class="hero_film">'
                + video + "</div>", 1,
            )
        if image:  # a still in place of the reel: (file name, alt text, caption line 1, caption line 2)
            name, alt, cap1, cap2 = image
            h = re.sub(
                r"<video.*?</video>",
                f'<img intro="media-inner" src="{IMG}{name}.webp" alt="{e(alt)}" class="media_image"/>',
                h, flags=re.S,
            )
            h = h.replace("Reel 2026", e(cap1)).replace("Imagery · Motion · Web", e(cap2))
        # The search phrase is the page's H1, set small in the eyebrow. The display line is a div.
        # Every page on Google's first page for "cambridge web design" has the phrase in its title,
        # and most have it in the H1; this gets it there without giving up the headline.
        h = re.sub(
            r'<h1 intro="title" class="display-xl">.*?</h1>',
            lambda m: f'<div intro="title" class="{"heading-l" if film else "display-xl"}"><div>{e(line1)}</div>'
                      f'<div class="text-muted">{e(line2)}</div></div>',
            h, flags=re.S,
        )
        h = h.replace(
            '<p class="text-mono">Founder-led · Brand, web and imagery</p>', f'<h1 class="text-mono">{e(label)}</h1>'
        )
        h = re.sub(r'(<p intro="item" class="text-lead">).*?(</p>)', lambda m: m.group(1) + e(lead) + m.group(2), h)
        h = h.replace('href="/work"', f'href="{primary[1]}"').replace("<div>View the work</div>", f"<div>{e(primary[0])}</div>")
        h = h.replace('href="/contact"', f'href="{secondary[1]}"').replace("<div>Contact the studio</div>", f"<div>{e(secondary[0])}</div>")
        if film:
            # The reel fills the hero and runs behind the header, with only the eyebrow and headline on it,
            # bottom left. The lead and the buttons become a section of their own underneath.
            links = balanced(h, h.index('<div class="row is-flush">'))
            h = h.replace(LINE + links, "", 1)
            h += f'<section class="section is-hero-links">{links}{LINE}{GRID}</section>'
        return h

    def luke(self, num, label, line1, line2, lead, paragraphs):
        """The homepage's note from Luke, with this page's words."""
        s = self.studio_src.replace("[ 08 ]", f"[ {num} ]")
        s = s.replace('<p class="text-mono">The studio</p>', f'<p class="text-mono">{e(label)}</p>')
        s = re.sub(
            r'(<h2 split="chars" class="heading-xl">).*?(</h2>)',
            lambda m: f'{m.group(1)}<div>{e(line1)}</div><div class="text-muted">{e(line2)}</div>{m.group(2)}',
            s, flags=re.S,
        )
        s = re.sub(r'(<p class="heading-s">).*?(</p>)', lambda m: m.group(1) + e(lead) + m.group(2), s, flags=re.S)
        body = "".join(f'<p class="text-body">{e(x)}</p>' for x in paragraphs)
        s, n = re.subn(
            r'(<div class="text-muted"><div class="stack">).*?(</div></div>)',
            lambda m: m.group(1) + body + m.group(2), s, count=1, flags=re.S,
        )
        assert n == 1, "note from Luke: body not found"
        return s

    def work_list(self, names):
        return (
            '<div data-work-open="first" data-module="work-list" data-work-number="auto"><div class="w-dyn-list">'
            '<div role="list" class="w-dyn-items">' + "".join(self.items[n] for n in names) + "</div></div></div>"
        )

    def enquiries(self, num, line1, first_impressions=None):
        q = self.enquiries_src.replace('<section class="section">', '<section id="enquiries" class="section">', 1)
        q = q.replace("[ 09 ]", f"[ {num} ]")
        q = q.replace("If your business has outgrown your site,", e(line1))
        if first_impressions:
            q = re.sub(
                r'(<div class="text-muted"><p class="text-body-s">)Send us your site.*?(</p>)',
                lambda m: m.group(1) + e(first_impressions) + m.group(2), q,
            )
        return q

    def page(self, slug, title, description, main, schema, head_extra=""):
        p = self.home
        p = re.sub(r"<main([^>]*)>.*</main>", lambda m: f"<main{m.group(1)}>{main}</main>", p, flags=re.S)
        p = re.sub(r"<title>.*?</title>", f"<title>{e(title)}</title>", p, flags=re.S)
        for attr in ('name="description"', 'property="og:description"', 'name="twitter:description"'):
            p = re.sub(rf'<meta content="[^"]*" {attr}/>', f'<meta content="{e(description)}" {attr}/>', p)
        for attr in ('property="og:title"', 'name="twitter:title"'):
            p = re.sub(rf'<meta content="[^"]*" {attr}/>', f'<meta content="{e(title)}" {attr}/>', p)
        p = re.sub(r'<link href="[^"]*" rel="canonical"/>', f'<link href="{LIVE}/{slug}" rel="canonical"/>', p)
        # the homepage's own schema goes; this page's Service and FAQ schema replaces it
        p = re.sub(r'<script type="application/ld\+json">.*?</script>', "", p, flags=re.S)
        ld = "".join(
            '<script type="application/ld+json">' + json.dumps(s, ensure_ascii=False, indent=1) + "</script>" for s in schema
        )
        p = p.replace(
            "<head>", f'<head><base href="{STAGING}/"/><meta name="robots" content="noindex"/>', 1
        ).replace("</head>", ld + head_extra + "</head>", 1)
        (OUT / f"{slug}.html").write_text(p, encoding="utf-8", newline="\n")
        print(f"dev/{slug}.html  {len(p) // 1024} KB")


def schema(slug, name, service_type, description, questions):
    return [
        {
            "@context": "https://schema.org",
            "@type": "Service",
            "name": name,
            "serviceType": service_type,
            "description": description,
            "url": f"{LIVE}/{slug}",
            "provider": {"@type": "ProfessionalService", "name": "PIXEL SILO", "url": LIVE},
            "areaServed": [
                {"@type": "City", "name": "Cambridge"},
                {"@type": "AdministrativeArea", "name": "Cambridgeshire"},
            ],
        },
        {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in questions
            ],
        },
    ]


# ---------- page 1: Cambridge web design ----------

def web(site):
    slug = "cambridge-web-design"
    title = "Web Design Cambridge | Brand and website design studio | PIXEL SILO"
    description = (
        "Web design for Cambridge technology and science companies whose work is ahead of their website. One "
        "person from brief to launch, with scope and price fixed before design begins."
    )
    questions = [
        ("Is a studio of two sufficient for a company of our size?",
         "Yes. The person you brief is the person who designs, builds and renders the work, and no decision is "
         "taken by anyone absent from the original conversation. Before founding the studio, Luke spent fifteen "
         "years agency-side leading brand and digital work for Arm, Intel, Nvidia, AMD and Mubadala."),
        ("What does a website cost?",
         "Cost depends on what the site must do, so every project is scoped first. A written scope, a timeline and "
         "a fixed price are agreed before design begins."),
        ("How long does a project take?", "Most projects run through eight stages in roughly six weeks."),
        ("Which platform do you build on?",
         "The platform that suits how the team works. Where a marketing team needs to edit through a CMS, Webflow "
         "is one example. A smaller site that changes rarely may suit a lighter build."),
        ("Do you work only with Cambridge companies?",
         "No. Our clients are across the UK. The studio is in Cambridgeshire, which makes meeting in person "
         "straightforward."),
        ("What happens after launch?",
         "Bug fixes are free for the first month. After that, Adapt continues the work: a plan for what the site "
         "must establish next, and the studio time each month to carry it out."),
    ]
    main = "".join([
        site.hero(
            "Web design Cambridge",
            "Built in Cambridge.", "Understood everywhere.",
            "Web designers in Cambridgeshire. Brand and website design for Cambridge companies whose work is ahead "
            "of their website.",
            ("View the work", "/work"), ("Send us your site", "#first-impressions"),
            image=("cambridge-kings-parade-from-above", "King's Parade and King's College Chapel, Cambridge, from above",
                   "Cambridge", "King's Parade"),
        ),
        site.clients,
        section(two_text(
            "Cambridge companies are usually known by reputation: among peers, in the lab, across the cluster. "
            "Investors, customers and candidates elsewhere have no access to that. They have the website, and they "
            "read it closely before any conversation takes place.",
            "The work therefore begins with strategy: who the site must convince, and what it must establish. That "
            "is resolved in wireframes before design begins. Brand, website and imagery are then produced together, "
            "by the person you brief.",
        )),
        section(
            head("01", "What the site must establish", "Four jobs,", "before the first conversation."),
            feature_cards("cam-web", [
                ("Earn trust",
                 "Informed readers begin by looking for grounds to rule a company out. Each page should remove one."),
                ("Explain the work",
                 "What the company does, stated so that a newcomer follows it in a minute and a specialist is "
                 "satisfied in five."),
                ("Show the people",
                 "Investors back teams, and candidates choose them. The people, the method and the evidence belong "
                 "on the site."),
                ("Stay current",
                 "Companies here change quickly. The site is built for your team to maintain, and Adapt provides a "
                 "plan and the studio time each month to keep it accurate."),
            ]),
        ),
        section(
            head("02", "The work", "Different clients.", "The same test."),
            site.work_list(["Eschler Asset Management", "Torre Search", "Met Foods", "Throda Skincare"]),
            site.quotes,
        ),
        section(
            head("03", "Proximity", "In person,", "where it matters."),
            two_text(
                "Much of what distinguishes a company never reaches a written brief. It emerges on a tour of the "
                "lab, with the product in hand, or in how a founder explains the work to a newcomer. The studio is "
                "in Cambridgeshire, so the strategy session can take place in person.",
                "After that, most clients prefer short video updates and email, which take less of their time. "
                "Calls and visits are arranged when there is something to discuss. Every stage is recorded in your "
                "dashboard.",
            ),
            band("cambridge-kings-college-punt", "A punt on the River Cam in front of King's College Chapel, Cambridge"),
        ),
        section(
            head("04", "How it works", "Eight stages.", "Roughly six weeks."),
            cards([
                ("One person, brief to launch",
                 "Luke designs, builds and produces the imagery. Nothing is relayed second hand."),
                ("Price fixed before design",
                 "A written scope, a timeline and a fixed price, mapped onto wireframes of the site."),
                ("A defined process",
                 "Eight stages, each tracked in your dashboard, so progress is visible throughout."),
                ("Yours to maintain",
                 "Built on the platform that suits the organisation, and set up for your team to maintain "
                 "independently."),
            ]),
            stats([(15, "years", "agency-side"), (5, "years", "as a studio"),
                   (8, "stages", "in every project"), (6, "weeks", "roughly, brief to launch")]),
        ),
        site.luke(
            "05", "The studio", "The person you brief is", "the person who builds it.",
            "Most Cambridge companies I meet are better than their website suggests.",
            ["Before the studio I spent fifteen years in agencies, leading brand and digital work for Arm, Intel, "
             "Nvidia, AMD and Mubadala. Large organisations, high scrutiny, and very little tolerance for work that "
             "only looks finished.",
             "Every project starts with the same question: what does someone need to believe about you in the first "
             "five seconds, before they have read a word? We settle that in wireframes, before any design begins.",
             "We run the studio from Cambridgeshire. There are no account managers or layers between you and the "
             "work: I design, build and render it, and Zoe keeps the project moving."],
        ),
        section(faq("06", questions)),
        site.enquiries("07", "If the business has outgrown the site,"),
    ])
    site.page(slug, title, description, main,
              schema(slug, "Web design in Cambridge", "Web design", description, questions))


# ---------- page 2: Cambridge CGI ----------

# The only new classes on either page: a hero whose film fills the section. In Webflow these are a
# combo class on the hero section (is-film) and two new elements inside it (hero_film, hero_scrim).
# The section keeps the dark palette in the light theme, because the text sits on film.
# Luke's motion graphics showreel, from the old site's Showreel and "Cambridge Motion & CGI" pages
# (web.archive.org, 9 Oct 2025). 45 MB, uploaded March 2021. The old site's 2021 to 2023 Showreel
# page used pixelsilo-showreel-public-v1.mp4 (49 MB, May 2021) from the same bucket.
REEL = "https://pixelsilo.s3.eu-west-2.amazonaws.com/pixelsilo-showreel-v1_1.mp4"

FILM_CSS = """<style>
/* NEW for the CGI hero. The reel is shown clear (no scrim), behind the header.
   The file is 1920 x 1080 with black bars baked in: the picture is the middle 1920 x 800, and it
   carries Luke's credit for each clip in a caption along its bottom left.
   Tablet and up: the hero is the picture's own shape (2.4:1) at full width, whatever the window
   height, so nothing of the picture is cropped and the caption is always whole. The video is
   oversized by 1080/800 to push the bars out.
   Phone: 2.4:1 would be a sliver, so the hero is tall and the picture is cropped to fill it. The
   sides go, and the video is pushed down far enough that the bottom tenth, with the caption, goes too. */
.section.is-hero.is-film {
  --_theme---text: #f2f1ee; --_theme---text-muted: #f2f1eeb3; --_theme---hairline: #ffffff24; --_theme---line: #ffffff24;
  color: var(--_theme---text); overflow: hidden;
  display: flex; flex-direction: column; justify-content: flex-start;
  aspect-ratio: 2.4; min-height: 0; margin-top: calc(-1 * var(--site--header-height) - 1px); /* the header is its height plus a 1px line */
}  /* min-height 0: the site's hero has a screen-height minimum, which would widen a 2.4:1 box past the page */
/* The eyebrow and headline sit top left, under the logo, clear of the caption. */
.section.is-hero.is-film > .row {
  position: relative; z-index: 1; padding-top: calc(var(--site--header-height) + 1px + 1.5rem); padding-bottom: 0;
}
.section.is-hero.is-film .stack.is-hero { grid-row-gap: 1rem; text-shadow: 0 0 1.5rem #0b0b0c66; }
.hero_film { position: absolute; inset: 0; z-index: 0; background-color: #0b0b0c; overflow: hidden; }
.hero_film .media_video { height: 135%; top: -17.5%; }
@media (max-width: 767px) {
  .section.is-hero.is-film { aspect-ratio: auto; min-height: 80svh; }
  .hero_film .media_video { height: 150%; top: -19.44%; }
}
.section.is-hero-links { position: relative; }
/* The header is clear while the reel is under it, and takes its usual background once the hero has gone. */
.header { transition: background-color .3s; }
.header.is-over-film {
  --_theme---text: #f2f1ee; --_theme---text-muted: #f2f1eeb3; --_theme---hairline: #ffffff24;
  background-color: #0000; color: var(--_theme---text);
}
</style>
<script>
document.addEventListener("DOMContentLoaded", function () {
  var header = document.querySelector(".header"), hero = document.querySelector(".section.is-hero.is-film");
  if (!header || !hero) return;
  function set() { header.classList.toggle("is-over-film", hero.getBoundingClientRect().bottom > header.offsetHeight); }
  set(); window.addEventListener("scroll", set, { passive: true }); window.addEventListener("resize", set);
});
</script>"""

def cgi(site):
    slug = "cambridge-cgi"
    title = "CGI Studio Cambridge | Product CGI and 3D animation | PIXEL SILO"
    description = (
        "Product, technology and brand CGI from a founder-led studio in Cambridgeshire: films, renders, technical "
        "animation and interactive 3D, produced in-house by the person you brief."
    )
    questions = [
        ("What is required to begin?",
         "For a product: CAD where available, otherwise the product itself, or drawings and photographs. For brand "
         "work: existing guidelines, if any, and an hour of your time."),
        ("The product is not yet final. Is that an obstacle?",
         "No. Most of this work takes place before launch. Scenes are built so that a late design change is an "
         "update, not a restart."),
        ("Do you work under NDA?", "Yes. Either party's agreement can be signed before anything is shared."),
        ("What does it cost?",
         "Cost depends on how much must be built and how many pieces are produced from it. Each project is scoped "
         "first, and a fixed price is agreed before work begins."),
        ("Is a small set of stills a viable project?",
         "Yes. Stills are a sensible starting point, and everything built remains available for a film later."),
        ("Can the CGI form part of a website or brand project?",
         "Yes. Most of our imagery is produced that way: alongside the brand and the build, as one project with one "
         "price."),
        ("Do you work only with Cambridge companies?",
         "No. Our clients are across the UK. The studio is in Cambridgeshire, which makes meeting in person "
         "straightforward."),
    ]
    main = "".join([
        site.hero(
            "CGI and 3D animation studio Cambridge",
            "Every frame,", "made with purpose.",
            "A CGI studio in Cambridgeshire for products, technology and brands. Films, renders and 3D product "
            "animation, produced in-house by the person you brief.",
            ("Watch the films", "#films"), ("Contact the studio", "/contact"), film=REEL,
        ),
        site.before_studio,
        section(two_text(
            "A processor measured in nanometres. Software with no physical form. A therapy, a platform, a method. "
            "Much of what Cambridge produces cannot be placed in front of a lens, yet it must be shown to investors, "
            "customers and partners who will form a view from an image, often before reading a word.",
            "We produce that image in whatever form the purpose requires: a film, a set of stills, an animation "
            "that explains a mechanism, a visual language for the brand, or a model that can be examined on the "
            "website. All of it is made in the studio, by one person.",
        ), strip(
            ("cambridge-kings-college-chapel-street", "King's College Chapel, Cambridge, seen from a side street", "up"),  # a tall subject: rises
            ("cambridge-kings-college-punt", "A punt on the River Cam in front of King's College Chapel, Cambridge", "left"),  # a long horizon: pans
        )),
        section(
            head("01", "What we make", "Six disciplines,", "one pair of hands."),
            capabilities([
                ("Films", "Launch, campaign and investor films",
                 "Used where the account must be given in sequence: what it is, how it works, why it matters.",
                 ["Launch films", "Brand films", "Hero loops for the website", "Cut-downs for social and email"]),
                ("Stills and renders", "Where a single image carries the case",
                 "Used where photography cannot keep pace with finishes, variants or schedule, or where nothing yet "
                 "exists to photograph.",
                 ["Hero images and key visuals", "Product renders and colourways", "Packaging and bottles",
                  "Campaign and press images"]),
                ("Brand imagery and abstract 3D", "For organisations with no object to photograph",
                 "Used where the brand requires a visual language of its own, specific to the organisation.",
                 ["Identity sequences and idents", "Logo animation", "Abstract 3D and textures",
                  "Imagery for websites and decks"]),
                ("Explainer and technical animation", "For work that requires explanation",
                 "Used where the value lies inside the casing, below the visible scale, or in no object at all.",
                 ["How a product, platform or process works", "Exploded views and cutaways",
                  "Science and data, visualised", "Modelling from CAD"]),
                ("Stages and screens", "For keynotes, stands and showrooms",
                 "Used where the work must hold a large screen before an audience.",
                 ["Stage and keynote backgrounds", "Stand and exhibition content", "Showroom loops"]),
                ("Interactive 3D", "For examination by the viewer",
                 "Used where the viewer needs to rotate, open or configure the subject.",
                 ["Viewers", "Configurators", "Simulators", "Scroll-led pages"]),
            ]),
        ),
        section(
            head("02", "Build it once", "Built once.", "Used throughout."),
            two_text(
                "Whether the subject is a product model or a visual language for the brand, it is built once and "
                "built accurately. Film, stills, animation and the interactive model all derive from the same "
                "source, so they are consistent with one another, and each later request costs less than the first.",
                "Because the studio also designs and builds websites, the imagery need not end as a folder of "
                "files. It can be made for the page on which it will appear, as one project with one price.",
            ),
            strip(
                ("cambridge-river-cam-punter", "A punt passing under a bridge on the River Cam, Cambridge", "right"),  # the way the punt is heading
                ("cambridge-river-cam-punts", "Punts on the River Cam, Cambridge", "in"),  # the river runs away from you: pushes in
                wide_first=True,
            ),
        ),
        section(
            head("03", "The work", "Films, renders", "and brand imagery."),
            site.work_list(["Eschler Asset Management", "Torre Search", "Throda Skincare"]),
            site.films,
            attrs='id="films" class="section"',
        ),
        site.dialog,
        section(
            head("04", "How it is made", "AI speed.", "Traditional control.", icon=site.sparkle),
            two_text(
                "We do not make AI films. Every frame is modelled, lit and rendered in 3D, under direct "
                "control. AI is part of the workflow behind it, and it is there for one reason: better "
                "results, sooner.",
                "It gives us more options at every stage. Procedural textures are built quickly. Ideas are "
                "tested, refined and optimised while there is still time to act on them. None of it brings "
                "the inconsistency and unreliability of AI-generated imagery.",
            ),
            LINE,
            feature_cards("cam-cgi", [
                ("Speed",
                 "Experiments and iterations turn round faster, so the work reaches the right answer sooner "
                 "and leaves time to optimise it."),
                ("Options",
                 "More directions, materials and procedural textures are explored before one is chosen."),
                ("Control",
                 "Light, material and camera are set by hand, to the value. Nothing is left to a prompt."),
                ("Consistency",
                 "Every frame comes from the same 3D scene, so nothing drifts, flickers or changes between "
                 "shots."),
            ]),
        ),
        site.luke(
            "05", "Who makes it", "Fifteen years agency-side.", "Five as a studio.",
            "The render is rarely the hard part. Deciding what it has to show is.",
            ["Before the studio I spent fifteen years in agencies, leading brand and digital work for Arm, Intel and "
             "Nvidia and making launch films for Corsair. Large organisations, high scrutiny, and very little "
             "tolerance for work that only looks finished.",
             "I still do the modelling, the lighting, the animation and the edit myself. The tools have "
             "changed a great deal, and AI is now part of how I work. The judgement about what "
             "belongs in the frame has not changed at all.",
             "We run the studio from Cambridgeshire, so I can come to you, see the subject at first hand and speak "
             "to the people who built it."],
        ),
        section(
            head("06", "How it works", "Four stages.", "Each approved before the next."),
            cards([
                ("Purpose",
                 "Who will see the work, what they need to believe, and where they will see it. A launch page, a "
                 "stage and an investor deck make different demands."),
                ("Scope and price",
                 "A written scope, a timeline and a fixed price, with every film, still and format listed before "
                 "work begins."),
                ("Model, look, motion",
                 "Rough frames first, then materials and lighting, then the finished piece. Each step is approved "
                 "before the next begins."),
                ("Delivery",
                 "Every format on the list, prepared for its destination. All final renders, animations and assets "
                 "are yours outright once the project is paid in full."),
            ]),
            stats([(15, "years", "agency-side"), (5, "years", "as a studio"),
                   (6, "kinds", "of CGI work"), (1, "person", "from brief to delivery")]),
        ),
        section(faq("07", questions)),
        site.enquiries("08", "If the work has outgrown its images,"),
    ])
    site.page(slug, title, description, main,
              schema(slug, "CGI and 3D animation in Cambridge", "CGI and 3D animation", description, questions),
              head_extra=FILM_CSS)


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    site = Site()
    web(site)
    cgi(site)
