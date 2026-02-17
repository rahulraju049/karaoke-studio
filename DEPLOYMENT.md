# Deployment Guide: Karaoke Studio

To get room creation working on Vercel, you need to configure both Supabase (Database) and Vercel (Hosting).

## 1. Supabase Setup (Database)

If you haven't already, you must create the necessary tables in your Supabase project.

1. Go to your [Supabase Dashboard](https://app.supabase.com/).
2. Select your project.
3. Go to the **SQL Editor** in the left sidebar.
4. Click **New Query**.
5. Copy and paste the content of [schema.sql](file:///media/rahul-m-raju/New%20Volume/karaoke-studio/src/utils/schema.sql) into the editor.
6. Click **Run**.

## 2. Vercel Configuration (Environment Variables)

Your app needs to know how to connect to Supabase. You must add these variables to Vercel.

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Select your **karaoke-studio** project.
3. Go to **Settings** > **Environment Variables**.
4. Add the following two variables:

| Key | Value (Find in Supabase Settings > API) |
| :--- | :--- |
| `VITE_SUPABASE_URL` | Your Project URL |
| `VITE_SUPABASE_ANON_KEY` | Your `anon` `public` API key |

5. **Redeploy** your project for the changes to take effect:
   - Go to the **Deployments** tab.
   - Click the three dots `...` on the latest deployment and select **Redeploy**.

## 3. Verify

Once redeployed, open your Vercel URL:
1. Enter your "Stage Name".
2. Leave "Room Code" blank.
3. Click **Launch New Studio**.
4. If it fails, an alert will now tell you exactly why (e.g., "Missing keys" or "Table not found").
