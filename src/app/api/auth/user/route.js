import { supabase } from '../../../../lib/supabaseClient';

export async function GET() {
    const { data, error } = await supabase.auth.getSession();
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });

    return new Response(JSON.stringify({ user: data.session?.user || null }), { status: 200 });
}
