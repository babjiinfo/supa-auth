import { supabase } from '../../../../lib/supabaseClient';

export async function POST() {
    await supabase.auth.signOut();
    return new Response(JSON.stringify({ message: 'Logged out successfully' }), { status: 200 });
}
