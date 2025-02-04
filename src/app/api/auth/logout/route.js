import { supabase } from '../../../../lib/supabaseClient';

/**
 * Handles the logout process by signing the user out from Supabase authentication.
 *
 * @async
 * @function POST
 * @returns {Promise<Response>} A response indicating the success of the logout process.
 */
export async function POST() {
    await supabase.auth.signOut();
    return new Response(JSON.stringify({ message: 'Logged out successfully' }), { status: 200 });
}
