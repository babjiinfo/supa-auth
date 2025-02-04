import { supabase } from '../../../../lib/supabaseClient';

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
