import { supabase } from '../../../../lib/supabaseClient';
import { NextResponse } from 'next/server';

/**
 * Enables Row Level Security (RLS) for a given table in the Supabase database.
 * 
 * This handler expects a POST request with a JSON body containing the `tableName` property. 
 * It attempts to enable RLS for the specified table using Supabase's RPC (Remote Procedure Call).
 * If successful, it responds with a success message, otherwise, it returns an error message.
 * 
 * @param {Request} req - The incoming request object, which is expected to contain the `tableName` in the body.
 * 
 * @returns {NextResponse} The response object, containing a success or error message and the appropriate status code.
 * 
 * @throws {Error} If there is any unexpected error during the execution, it will be caught and an error message will be returned.
 */
export async function POST(req) {
    try {
        const { tableName } = await req.json();

        if (!tableName) {
            return NextResponse.json({ success: false, message: 'Table name is required' }, { status: 400 });
        }

        // Enable Row Level Security
        const { error, data } = await supabase.rpc('enable_rls', { table_name: tableName });

        if (error) {
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: false, message: `Row level security enabled for ${tableName}` }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error?.message }, { status: 500 });
    }
}

