// The client logo marquees (Logos · marquee and Logos · marquee reverse, Webflow interactions) slide
// each [marquee="track"] or [marquee="track-reverse"] by a percentage of its own width. Webflow lazy-loads the logos, and one that hasn't loaded is
// 0 wide, so on a phone, where most logos start off to the side and load one by one as they slide
// in, the track kept growing mid-loop and the logos jumped. Loading them straight away (they're
// small SVGs) keeps the track its full width from the start. The Designer's Load setting would do
// the same, but it's per image and there are two of every logo.

export default function marqueeEager() {
  document.querySelectorAll('[marquee^="track"] img[loading="lazy"]').forEach((img) => {
    img.loading = 'eager';
  });
}
