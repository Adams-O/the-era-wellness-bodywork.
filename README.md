# The Era Wellness & Bodywork

A static, responsive website for The Era Wellness & Bodywork in Ghana and Nigeria. The frontend is HTML, CSS, and vanilla JavaScript, with Bootstrap 5.3 delivered by CDN. Supabase provides PostgreSQL, Authentication, and Storage; Netlify hosts the site and receives booking enquiries through Netlify Forms.

## Project files

- `index.html`, `styles.css`, and `app.js` — public website and booking form.
- `admin/` — owner CMS and dashboard.
- `supabase-config.js` — the existing Supabase project URL and publishable key.
- `netlify.toml` — static publish directory and site routing.

The site has no build step, package installation, or local database requirement.

## Supabase setup

The website retains its existing Supabase project URL and publishable key in `supabase-config.js`. Do not replace them unless intentionally connecting the site to a different project. The publishable key is designed for browser use; never put a service-role or other secret key in frontend code.

Database objects and policies are managed in the Supabase Dashboard. This repository does not create, migrate, seed, or verify the live database. Use the Dashboard to create or confirm the following application contract before relying on live CMS or administrator features.

### Expected tables and columns

- `public.services`: `id` (UUID), `name` (text), `description` (text), `image_url` (text), `price_gh` and `price_ng` (numeric), `active` (boolean), `display_order` (integer), and `created_at` / `updated_at` timestamps.
- `public.gallery`: `id` (UUID), `image_url` (text), `storage_path` (nullable text), `caption` (text), `published` (boolean), `display_order` (integer), and `created_at` / `updated_at` timestamps.
- `public.testimonials`: `id` (UUID), `name` (text), `review_date` (nullable date), `rating` (integer), `source` (text), `original_url` (text), `text` (text), `approved` (boolean), and `created_at` / `updated_at` timestamps.
- `public.site_settings`: `id` (UUID), unique `key` (text), `value` (JSONB), and `updated_at` timestamp. The site reads the `site`, `ghana`, and `nigeria` settings.
- `public.admin_users`: `user_id` (UUID referencing `auth.users.id`) and `created_at` timestamp. A row identifies an account allowed to administer the CMS.

The admin app checks the signed-in user against their own row in `public.admin_users` and calls the authenticated-only `public.is_admin()` function both when restoring a session and when the auth session changes. Both checks must pass before any dashboard content is shown; signing in alone must not grant CMS access. The function must check `auth.uid()` against `public.admin_users.user_id`.

### Expected access policies

Enable Row Level Security on the application tables and configure policies in the Supabase Dashboard to match these behaviors:

- Anonymous and authenticated visitors can read active services, published gallery items, approved testimonials, and public site settings.
- Only authenticated administrators can create, edit, or delete services, gallery items, testimonials, and site settings.
- An authenticated user can read only their own `admin_users` row. Administrator membership must be managed with privileged Dashboard access, not a public frontend write policy.
- The `is_admin()` function can be called by authenticated users and must check the current user's membership.

The dashboard's UI checks are not a replacement for database security. RLS must enforce every read and write as well: public users may read only active services, published gallery images, approved testimonials, and public settings; only administrators may access unpublished/private content or write to CMS tables. Do not grant public writes to CMS tables or expose a service-role credential in this website.

## Administrator account and security

1. In Supabase **Authentication → Users**, create the owner's account. Disable public sign-up if it is enabled; the owner account should be provisioned from the dashboard.
2. Use privileged Supabase Dashboard access to add the account's UUID to `public.admin_users` and confirm the `is_admin()` function and RLS policies match the expectations above.
3. Visit `/admin/` on the deployed site and sign in with that Supabase account. An account without an `admin_users` row is signed out and denied access.

The repository does not confirm that these objects or policies exist in the live project. If they are missing or differ, public data reads, CMS writes, or administrator access may fail.
Use Supabase's available MFA controls for administrator accounts.

## Storage and CMS

Create or verify the `era-gallery` bucket in the Supabase Dashboard. The application expects public image reads, image uploads limited to JPG, PNG, WebP, or GIF files up to 10 MB, and upload/update/delete permissions restricted to authenticated administrators. Use the CMS at `/admin/` to:

- Create, edit, activate/deactivate, and delete services, including separate Ghana and Nigeria prices.
- Upload and preview JPG, PNG, WebP, or GIF gallery images up to 10 MB in `era-gallery`, or supply an existing HTTPS image URL; publish, unpublish, and delete gallery items.
- View testimonials and approve, reject, or delete them. The dashboard does not invent or edit review text.
- Update homepage text, Instagram and Google Maps review links, and the 50% deposit policy.
- Update country-specific locations, contact descriptions, email addresses, currencies, and WhatsApp numbers.

The Google Maps review links use the business profile URL supplied for this site. The owner can update that URL, the Instagram link, and regional WhatsApp numbers in the CMS. The four supplied Google review links are shown with their reviewer names; add review wording, dates, or ratings only when the exact details have been verified.

## Netlify deployment and booking enquiries

1. Connect the repository to Netlify and publish the repository root (`.`). No build command is required.
2. Before deploying, confirm `supabase-config.js` still points to the intended Supabase project and uses its publishable key.
3. In the Netlify site dashboard, confirm that form detection is enabled and that `booking-enquiry` appears under **Forms**. If it is not detected, enable form detection and trigger a new deploy.
4. Review customer submissions in **Netlify → Forms → booking-enquiry**.

`netlify.toml` applies a Content Security Policy and standard browser security headers, disables caching for `/admin/`, and marks the admin route as non-indexable. If the Supabase project URL or a CDN changes, update the matching CSP source in `netlify.toml` and redeploy.

The form captures name, phone/WhatsApp number, optional email, country, service, preferred date and time, home/hotel session type, location, notes, and acknowledgement of the 50% deposit policy. Its WhatsApp link uses the number configured for the selected country. The admin dashboard links to Netlify for booking submissions; it does not attempt to access private Netlify data from the browser.

## Existing features and setup notes

The homepage, services, reviews, gallery, contact sections, Ghana/Nigeria pricing, country-specific WhatsApp routing, Instagram link, theme toggle, and responsive layout are retained. The public website uses Supabase content when configured and includes the current content as a preview fallback before configuration or if public reads fail; check the browser console if Supabase content cannot be loaded.

Before launch, add exact customer review wording in the CMS only when it has been verified. A booking enquiry is not an appointment confirmation: the business must confirm availability and receive the required 50% deposit. The business owner must configure and verify the Supabase Dashboard objects, administrator account, and Netlify site/forms as described above.
