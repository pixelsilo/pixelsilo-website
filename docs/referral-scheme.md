# Referral scheme

Agreed with Luke on 10 Nov 2026. Most PIXEL SILO work already comes through introductions, but by chance. This turns it into a scheme with a clear reward, without becoming a sales operation.

## The rewards

**Clients (current or past):** when someone they introduce signs and pays their first invoice, the client gets **one month of Adapt free**.

- Already on Adapt: their next month is free.
- Not on Adapt: one month of Adapt, sized to their site the way any plan is sized. It sits outside the three month minimum; afterwards they choose whether to carry on. It is a taste of the plan, not month one of three.

**Introducers** (PR firms, brand consultancies, advisers, anyone with no site of ours): **10% of the first project's fee**, paid once, after the new client has paid that project in full. First project only; nothing on Adapt or later work.

## How people are asked

- Luke asks past clients himself, personally, about once a quarter. Nothing automated, no outbox email for this.
- Clients see a quiet "introduce someone" card on their dashboard once their site is live.
- Every client and introducer has their own link, so an enquiry arrives tagged with who sent it.

## Words

Say "introduce someone" or "introductions". Never "referral programme", "affiliate", "kickback" or "commission" to clients. Adapt is a plan, never a retainer. "We", not "Luke will". No figures beyond the two rewards above.

## Referral links

Link format: `https://www.pixelsilo.net/contact?ref=<code>&from=<name>`

- `code`: lowercase letters, digits and hyphens, 3 to 32 characters (for example `regenta` or `smith-pr`). The dashboard owns the codes.
- The website reads `ref` from the contact page URL and sends it with the enquiry form as a hidden field named **Referred by**. Nothing is stored in the browser, so no consent is needed: the link goes straight to the contact page.
- The dashboard matches the code to a client or introducer and logs the introduction.
- `from` (added 10 Nov 2026): who sent them, as it should read on the page: the client's site name, or an introducer's company (else their own name). The dashboard adds it to every link it shows. Links without it still work, and the page says "Someone".
- With a valid code the contact page shows an Introduction strip at the top of the enquiry form ("{name} sent you our way…", editable in the Designer: `[data-intro="strip"]`, shown with `.is-visible`), gives every email link the subject "Introduced by {name}", and points the WhatsApp link at `/whatsapp/<message>` with "Hi, {name} introduced me to PIXEL SILO." That needs a second Webflow redirect: `/whatsapp/(.*)` to `https://wa.me/<number>?text=%1`. Code: `src/global/introduction.js`.

## Built where

- **Dashboard** (pixelsilo-dashboard): the studio referral tracker, the client card, the codes and links, matching enquiries to codes.
- **Website** (this repo): the Referred by hidden field on the enquiry form, filled from `?ref=`.
