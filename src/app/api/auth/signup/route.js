import { signupLogger } from '../../../../lib/logger';
import { supabase } from '../../../../lib/supabaseClient';


/**
 * Handles user sign-up via Supabase.
 *
 * @async
 * @function POST
 * @param {Request} req - The incoming request object containing the user's email.
 * @returns {Promise<Response>} A response indicating the success or failure of the sign-up process.
 */
export async function POST(req) {
    const { email, password, name, phoneNumber } = await req.json();

    const { data, error } = await supabase.auth.signUp({
        email, password, options: {
            data: {
                first_name: name,
                phoneNumber,
            },
        },
    });
    const userObject = data;
    if (error) {
        signupLogger.error(`Signup failed for email: ${email} - ${error.message}`);
        return new Response(
            JSON.stringify({ success: false, message: error.message }),
            { status: 400 }
        );
    }
    else {
        const obj = {
            id: userObject.user.id,
            email,
            name,
            phone_number: phoneNumber,
            password
        }

        const { data, error } = await supabase.from('user').insert([obj]);
        if (error) {
            signupLogger.error(`Signup failed for email: ${email} - ${error.message}`);
            return new Response(
                JSON.stringify({ success: false, message: "Signup failed!" }),
                { status: 400 }
            );
        } else {
            signupLogger.info(`Signup successful for email: ${email}`);
            return new Response(
                JSON.stringify({ success: true, message: "Signup successful!" }),
                { status: 200 }
            );
        }
    }
}
