// Turns one CMS rich text into numbered cards, so a section's points are written as one field
// (a heading and a paragraph per point) and laid out in the page's four-column card rows.
// Used on the Hello template for What I noticed and the suggested fixes.
//
//   [data-module="rich-cards"]   the section
//   [data-cards="source"]        the bound Rich Text, hidden with the .cards_source class
//   [data-cards="intro"]         optional: anything before the first heading goes here (What I
//                                noticed's opening paragraphs, beside the screenshot)
//   [data-cards="row"]           card rows built in the Designer, each followed by its .line-h
//   [data-cards="card"]          a card: [data-cards="num"], [data-cards="title"], [data-cards="body"]
//
// The cards are filled, not made: Webflow's scroll reveals (reveal-group, reveal-box, reveal) only
// reach elements that exist when the page loads, so the rows and cards are built in the Designer
// and this fills them in order and removes the ones that aren't needed (and any row left empty,
// with the hairline after it). The number of cards built is the most a section can show; add a
// row in the Designer for more.
//
// Each point is an H3 (or H2/H4) followed by its paragraphs. Without headings, each bullet of a
// list becomes a card, with any bold text at its start as the title.

const HEADING = /^H[2-4]$/;

// The points in the source, as { title, body: [nodes] }, plus the nodes before the first point.
function read(source) {
  const intro = [];
  const points = [];
  const children = [...source.children];

  if (children.some((el) => HEADING.test(el.tagName))) {
    children.forEach((el) => {
      if (HEADING.test(el.tagName)) points.push({ title: el.textContent.trim(), body: [] });
      else if (points.length) points[points.length - 1].body.push(el);
      else intro.push(el);
    });
    return { intro, points };
  }

  children.forEach((el) => {
    if (el.tagName !== 'UL' && el.tagName !== 'OL') return intro.push(el);
    [...el.children].forEach((li) => {
      const lead = li.firstElementChild;
      const bold = lead && (lead.tagName === 'STRONG' || lead.tagName === 'B') && li.firstChild === lead ? lead : null;
      const title = bold ? bold.textContent.trim().replace(/[.:]$/, '') : '';
      if (bold) bold.remove();
      const p = document.createElement('p');
      p.innerHTML = li.innerHTML.trim();
      points.push({ title, body: [p] });
    });
  });
  return { intro, points };
}

// Fill a card's body slot with the point's paragraphs, each taking the slot's own class.
function fillBody(slot, nodes) {
  const paragraphs = nodes.length ? nodes : [document.createElement('p')];
  const first = paragraphs[0];
  slot.innerHTML = first.innerHTML;
  let after = slot;
  paragraphs.slice(1).forEach((node) => {
    const extra = slot.cloneNode(false);
    extra.removeAttribute('data-cards');
    extra.innerHTML = node.tagName === 'UL' || node.tagName === 'OL' ? node.outerHTML : node.innerHTML;
    after.after(extra);
    after = extra;
  });
}

export default function richCards(root) {
  const source = root.querySelector('[data-cards="source"]');
  if (!source) return;
  const { intro, points } = read(source);

  const introSlot = root.querySelector('[data-cards="intro"]');
  if (introSlot) {
    introSlot.replaceChildren(...intro);
    if (!intro.length) introSlot.remove();
  }

  const cards = [...root.querySelectorAll('[data-cards="card"]')];
  cards.forEach((card, i) => {
    const point = points[i];
    if (!point) return card.remove();
    const num = card.querySelector('[data-cards="num"]');
    const title = card.querySelector('[data-cards="title"]');
    const body = card.querySelector('[data-cards="body"]');
    if (num) num.textContent = String(i + 1).padStart(2, '0');
    if (title) {
      if (point.title) title.textContent = point.title;
      else title.remove();
    }
    if (body) fillBody(body, point.body);
  });

  // Rows left with no cards go, with the hairline after them.
  root.querySelectorAll('[data-cards="row"]').forEach((row) => {
    if (row.querySelector('[data-cards="card"]')) return;
    const rule = row.nextElementSibling;
    if (rule && rule.classList.contains('line-h')) rule.remove();
    row.remove();
  });

  source.remove();
  // The page got shorter or longer, so the scroll reveals below need their start points again.
  if (window.ScrollTrigger) requestAnimationFrame(() => window.ScrollTrigger.refresh());
}
