import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase service role configuration');
}

// ✅ Admin client with service role key (bypasses RLS)
// Provide a WebSocket transport because the admin client is used in Node.js
// environments where a native WebSocket implementation is not available.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  realtime: {
    // @ts-expect-error ws WebSocket is structurally compatible with Supabase
    // realtime transport, but the TypeScript interfaces differ on event types.
    transport: WebSocket,
  },
});
