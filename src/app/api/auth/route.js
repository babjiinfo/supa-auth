import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Handles authentication with Supabase and retrieves user and table information.
 * 
 * @param {Request} req - The incoming HTTP request.
 * @returns {Promise<Response>} A JSON response containing authentication status, user details, and table information.
 */
export async function POST(req) {
    try {
        // Parse request body
        const { url, key } = await req.json();

        // Validate input
        if (!url || !key) {
            return NextResponse.json({ error: 'Missing Supabase URL or key' }, { status: 400 });
        }

        // Initialize Supabase client
        const supabase = createClient(url, key);

        // Fetch list of users from Supabase
        const { data: users, error } = await supabase.auth.admin.listUsers();
        if (error) {
            return NextResponse.json({ error: 'Invalid Supabase credentials' }, { status: 401 });
        }

        // Extract user details
        const userData = users?.users?.map(user => ({
            id: user.id,
            email: user.email,
            hasMFA: user.factors?.length > 0
        }));

        // Retrieve Row-Level Security (RLS) policy information
        const { data: tables } = await supabase
            .from('pg_policy')
            .select('schemaname, tablename');

        // Retrieve all public tables
        const { data: allTables } = await supabase
            .from('pg_tables')
            .select('tablename')
            .eq('schemaname', 'public');

        // Format table information with RLS check
        if (allTables) {
            return allTables?.map(table => ({
                name: table.tablename,
                hasRLS: tables.some(t => t.tablename === table.tablename)
            }));
        }

        // Return success response with user and table data
        return new Response(
            JSON.stringify({
                success: true,
                message: "Authentication successful",
                usersCount: users.length,
                users,
                allTables,
                tables,
                userData
            }),
            { status: 200 }
        );
    } catch (error) {
        // Handle errors and return response
        return new Response(
            JSON.stringify({ success: false, message: error.message }),
            { status: 500 }
        );
    }
}
