import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://aojkkqfobuihrbchwtot.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_9O-aMPE28nJBt1xAq412CA_j46kVs6F';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);