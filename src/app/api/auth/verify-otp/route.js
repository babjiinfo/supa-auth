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
        return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    return new Response(JSON.stringify({ message: 'OTP verified successfully!' }), { status: 200 });
}
