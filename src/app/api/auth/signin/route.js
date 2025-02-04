import { loginLogger } from "../../../../lib/logger";
import { supabase } from "../../../../lib/supabaseClient";

export async function POST(req) {
    const { email } = await req.json();

    const { error } = await supabase.auth.signInWithOtp({
        email, options: {
            shouldCreateUser: false,
        },
    });
    if (error?.code === "otp_disabled") {
        return new Response(
            JSON.stringify({ success: false, message: "User not found" }),
            { status: 400 }
        );
    } else if (error) {
        loginLogger.error(`Login failed for email: ${email} - ${error.message}`);
        return new Response(
            JSON.stringify({ success: false, message: error.message }),
            { status: 400 }
        );
    } else {
        return new Response(
            JSON.stringify({ success: true, message: "OTP sent successfully!" }),
            { status: 200 }
        );
    }
}
