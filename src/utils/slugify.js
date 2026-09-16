// Single source of truth for turning a category/brand/subcategory NAME into
// the same slug format already used across the app (Footer, Header nav,
// ShopPage) and in the backend-generated sitemap, e.g.:
//   "Mom & Baby"      -> "mom-baby"
//   "Personal Care"   -> "personal-care"
//   "Clearance Sale"  -> "clearance-sale"
//
// Keep this logic identical everywhere a slug is built or matched -
// if it drifts, internal links and SEO URLs stop matching each other.
export const slugify = (name = '') =>
    (name || '')
        .toString()
        .toLowerCase()
        .replace(/ & /g, '-')
        .replace(/ /g, '-');