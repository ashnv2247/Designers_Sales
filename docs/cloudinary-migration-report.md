# Cloudinary migration audit

## Migrated sources

- 48 product photographs from `src/assets/products`.
- 8 homepage campaign hero images.
- 4 category cover images.
- 5 designer spotlight portraits.
- 2 boutique/editorial images.
- 1 authentication/editorial hero image.
- 1 legacy general hero image retained as a seed input.

All 69 files in `public/media` matched `src/assets` byte-for-byte and were removed as duplicates.
The canonical `src/assets` files remain only as inputs for `scripts/seed.js`; production source code
does not import them.

## Extracted records

- 48 products with variants, prices, stock, colors, sizes, conditions, composition,
  measurements, provenance, and ordered galleries.
- 4 categories, 6 brands/designers, 4 merchants, and 5 colors.
- 8 homepage slides, 5 designer spotlights, homepage category/product/merchant sections,
  marketplace statistics, and site-level images.

## Content not seeded

- No static sale records existed in the application, so no unrelated sales were invented.
- No distinct variant-specific image sources existed; product variants are seeded, while their
  images continue to use the normalized product gallery.
- Users, authentication records, profiles, orders, carts, and wishlists are transactional data and
  are intentionally excluded.

## Deployment status

The extraction and validation dry run succeeds without credentials. Apply the Cloudinary media
migration, configure the documented server environment variables, and run `npm run seed` twice to
perform and verify the live upload/database migration.
