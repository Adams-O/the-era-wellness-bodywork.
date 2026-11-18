# The Era Wellness & Bodywork

A static, responsive website for The Era Wellness & Bodywork in Ghana and Nigeria. The frontend is HTML, CSS, and vanilla JavaScript, with Bootstrap 5.3 delivered by CDN. Supabase provides PostgreSQL, Authentication, and Storage; Netlify hosts the site and receives booking enquiries through Netlify Forms.

## Project files

- `index.html`, `styles.css`, and `app.js` — public website and booking form.
- `admin/` — owner CMS and dashboard.
- `supabase-config.js` — public Supabase URL and publishable key placeholders.
- `database.sql` — Supabase schema, seed content, RLS policies, and gallery Storage setup.
- `netlify.toml` — static publish directory and site routing.

The site has no build step, package installation, or local database requirement.

## Supabase setup

1. Create a Supabase project.
2. In **Project Settings → API**, copy the project URL and the publishable key.
3. Edit `supabase-config.js` and replace the two placeholder values:

   ```js
   window.ERA_SUPABASE_CONFIG = {
     url: 'https://YOUR-PROJECT-REF.supabase.co',
     publishableKey: 'YOUR_SUPABASE_PUBLISHABLE_KEY'
   };
   ```

   Use the URL and publishable key from your own project; do not put a service-role or secret key in this file. The publishable key is intended for browser use and is restricted by the database's RLS policies.

4. Open **SQL Editor** in the Supabase dashboard, paste the contents of `database.sql`, and run it. This creates the services, gallery, testimonials, settings, and administrator tables; seeds the existing site content; enables RLS; and creates the `era-gallery` Storage bucket and its policies.

   The script can be run again safely for its schema, policies, and seed records. It adds the `storage_path` field to an already-created gallery table. Any previous booking records in Supabase are left in place but are no longer used by the site.

## Administrator account and security

1. In Supabase **Authentication → Users**, create the owner's account. Disable public sign-up if it is enabled; the owner account should be provisioned from the dashboard.
2. Copy that user's UUID and add it to the allowlist from the Supabase SQL Editor:

   ```sql
   insert into public.admin_users (user_id)
   values ('PASTE-AUTH-USER-UUID-HERE')
   on conflict do nothing;
   ```

   Alternatively, insert the user by email:

   ```sql
   insert into public.admin_users (user_id)
   select id
   from auth.users
   where email = 'OWNER-EMAIL-HERE'
   on conflict do nothing;
   ```

3. Visit `/admin/` on the deployed site and sign in with that Supabase account.

The CMS checks the `is_admin()` database function after authentication. RLS permits public reads only for active services, published gallery items, approved testimonials, and public website settings. CMS writes and Storage uploads/deletes are restricted to users listed in `admin_users`; being signed in alone does not grant administrator access. Booking submissions are handled by Netlify Forms, not stored in Supabase.

## Storage and CMS

The SQL script creates a public-read `era-gallery` bucket, restricted to image types and 10 MB per file. Public image display requires public read access; uploads, updates, and deletes require an allowlisted administrator. Use the CMS at `/admin/` to:

- Create, edit, hide, and delete services, including separate Ghana and Nigeria prices.
- Upload gallery images to Supabase Storage or supply an existing HTTPS image URL.
- Add, edit, approve, and remove testimonials.
- Update homepage text, Instagram and Google Maps review links, and the 50% deposit policy.
- Update country-specific locations, contact descriptions, email addresses, currencies, and WhatsApp numbers.

The `Google Maps review URL` is intentionally blank until the owner supplies the correct business link. The existing Instagram link and regional WhatsApp numbers are prefilled and can be changed in the CMS.

## Netlify deployment and booking enquiries

1. Connect the repository to Netlify and publish the repository root (`.`). No build command is required.
2. Deploy after setting the Supabase values in `supabase-config.js`.
3. In the Netlify site dashboard, confirm that form detection is enabled and that `booking-enquiry` appears under **Forms**. If it is not detected, enable form detection and trigger a new deploy.
4. Review customer submissions in **Netlify → Forms → booking-enquiry**.

The form captures name, email, phone/WhatsApp number, country, service, preferred date and time, home/hotel session type, location, notes, and acknowledgement of the 50% deposit policy. Its WhatsApp link uses the number configured for the selected country. The admin dashboard links to Netlify for booking submissions; it does not attempt to access private Netlify data from the browser.

## Existing features and setup notes

The homepage, services, reviews, gallery, contact sections, Ghana/Nigeria pricing, country-specific WhatsApp routing, Instagram link, theme toggle, and responsive layout are retained. The public website uses Supabase content when configured and includes the current content as a preview fallback before configuration or if public reads fail; check the browser console if Supabase content cannot be loaded.

Before launch, verify that the seeded testimonial text is approved for publication and replace it if needed. Add the real Google Maps review URL in the CMS. The business owner must configure the Supabase project, publishable key, administrator account, and Netlify site/forms as described above.
