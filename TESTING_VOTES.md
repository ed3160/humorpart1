# Testing votes in Supabase

## In the app

1. **Vote loaded count** – Under the "Images" heading you’ll see **"Your votes loaded: N"**.  
   - If you’ve voted and refresh, **N should be > 0**.  
   - If N is always 0, the app isn’t getting any rows from `caption_votes` (see “In Supabase” below).

2. **Your user ID** – Same line shows **"User ID: xxxxxxxx…"** and a **"Copy full ID"** button.  
   - Use this ID in Supabase to filter rows that belong to you.

3. **After voting** – You should see **"Saved"** briefly. After a **full page refresh**, the ↑ or ↓ for that caption should stay highlighted if the vote was stored and the SELECT is working.

---

## In Supabase

### 1. Confirm your user id

- **Authentication** → **Users**  
- Find your email and copy the **User UID**.  
- It should match the ID shown in the app (use “Copy full ID”).

### 2. Check the `caption_votes` table

- **Table Editor** → open the **`caption_votes`** table.

**Columns to expect (names may vary):**

- `profile_id` (or `user_id`) – UUID of the user who voted. Should match your User UID.
- `caption_id` – UUID of the caption/image being voted on. In this app it’s the **image id** from the `images` table.
- `value` – `1` (upvote) or `-1` (downvote). (The app uses the column name `value`, not `vote`.)

**What to do:**

1. Vote on a caption in the app (and see “Saved”).
2. In Table Editor, **filter** (or sort) so you can find:
   - Rows where `profile_id` = your User UID (paste from “Copy full ID”).
3. You should see a new row (or an updated row if you changed your vote) with:
   - Your `profile_id`
   - The `caption_id` (= that image’s id)
   - `vote` = 1 or -1

If **no row appears** after voting:

- The **insert/upsert might be failing** (e.g. RLS or column names).  
- In the browser: **DevTools** → **Network** → trigger a vote and check the request to Supabase for errors.

If **rows exist** for your `profile_id` but **"Your votes loaded" stays 0**:

- The **SELECT** might be failing or returning no rows (e.g. RLS on SELECT, or wrong column names like `image_id` instead of `caption_id`).  
- Check that your table uses `caption_id` for the image/caption id. If it uses `image_id`, the app code needs to use that column name for the SELECT and the insert.

### 3. RLS (Row Level Security)

- **Table Editor** → `caption_votes` → click the **lock** icon or open **Policies**.
- You need at least:
  - One policy that allows **INSERT** for authenticated users (so votes can be saved).
  - One policy that allows **SELECT** for the current user (e.g. `auth.uid() = profile_id`) so the app can load “your votes” and show the highlights.

If SELECT is not allowed for your own rows, the app will never get any votes back, so **"Your votes loaded"** will stay 0 and arrows won’t highlight after refresh.

---

## Quick checklist

| Step | What to check |
|------|----------------|
| 1 | In app: click ↑ or ↓ → see “Saved”. |
| 2 | In app: “Copy full ID” → Supabase **Authentication** → **Users** → same UID. |
| 3 | In app: **Table Editor** → `caption_votes` → filter by your `profile_id` → new/updated row after voting. |
| 4 | In app: refresh page → “Your votes loaded” > 0 and ↑/↓ stay highlighted for captions you voted on. |
| 5 | If 3 works but 4 doesn’t: RLS or column names (e.g. `caption_id` vs `image_id`) for the SELECT. |
