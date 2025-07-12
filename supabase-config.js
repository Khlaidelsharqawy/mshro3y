import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js';

export const supabase = createClient(
  "https://rmdeenawhnlzelljqxgl.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtZGVlbmF3aG5semVsbGpxeGdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNzk3MjksImV4cCI6MjA2Nzg1NTcyOX0.T_-IMi56hrEytfYExdHmp8xnEHAMi4VYq-NRom4znkI",
  {
    auth: {
      flowType: 'sms',
      detectSessionInUrl: true,
      redirectTo: window.location.origin + '/verify.html' // صفحة التحقق
    }
  }
);