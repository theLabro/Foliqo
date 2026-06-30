/* ============================================================
   Foliqo — Supabase connection (supabase-client.js)
   Creates the Supabase client and exposes it as window.GF_supabase.
   Load this BEFORE auth.js and store.js.
   ============================================================ */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://kldgckajlfgnaevwtyhg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_7cXnGJekPOmEwYOANCfX3Q_YQdnZoLL";

window.GF_supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// quick connection check — remove later once everything's working
window.GF_supabase.auth.getSession().then(({ error }) => {
  if (error) {
    console.error("Supabase connection failed:", error.message);
  } else {
    console.log("✅ Supabase connected successfully");
  }
});
