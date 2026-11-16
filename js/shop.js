/* PRINTS SHOP SETTINGS — the only file to edit to open the shop.
   Payment: Stripe Payment Links (no server, no monthly fee; Stripe keeps a small fee per sale).
   1. In Stripe, create one Payment Link per size, with "Collect customers' addresses" (shipping) turned on.
   2. Paste each link below in "link" and set the price shown on the page.
   The photo reference (IR-05…) travels with the order as client_reference_id and appears in the Stripe payment.
   A size with no link shows "Coming soon" instead of the buy button. */
window.SHOP = {
  currency: "€",
  sizes: [
    { id: "small", en: "Small", es: "Pequeña", dims: "20 × 30 cm", price: null, link: "" },
    { id: "large", en: "Large", es: "Grande",  dims: "40 × 60 cm", price: null, link: "" }
  ],
  // Leave empty to offer every photo in the gallery; or list the references on sale, e.g. ["02","19","53"].
  only: [],
  // Gallery photos NOT offered as prints.
  exclude: ["44", "72", "68", "48", "70", "75", "49", "09", "11", "46", "67", "45", "62", "47", "28", "19", "53", "34"]
};
