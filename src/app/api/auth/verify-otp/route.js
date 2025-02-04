import { supabase } from '../../../../lib/supabaseClient';

/**
 * Handles OTP verification for user authentication.
 *
 * @async
 * @function POST
 * @param {Request} req - The incoming request object containing the email and OTP.
 * @returns {Promise<Response>} A response indicating whether the OTP verification was successful or not.
 */
export async function POST(req) {
    const { email, otp } = await req.json();

    const {
        data: { session },
        error,
    } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
    })

    if (error) {
        return new Response(
            JSON.stringify({ success: false, message: error.message }),
            { status: 400 }
        );
    }

    return new Response(
        JSON.stringify({ sucess: true, message: 'OTP verified successfully!' }),
        { status: 200 }
    );
}
