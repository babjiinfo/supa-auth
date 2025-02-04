import { supabase } from '../../../../lib/supabaseClient';

/**
 * Handles retrieving the current user's authentication session.
 *
 * @async
 * @function GET
 * @returns {Promise<Response>} A response containing the authenticated user's session or an error message.
 */
export async function GET() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400 }
        );
    }

    return new Response(
        JSON.stringify({ user: data.session?.user || null }),
        { status: 200 }
    );
}
