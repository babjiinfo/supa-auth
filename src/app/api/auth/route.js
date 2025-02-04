import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
    try {
        const { url, key } = await req.json();

        if (!url || !key) {
            return NextResponse.json({ error: 'Missing Supabase URL or key' }, { status: 400 });
        }
        const supabase = createClient(url, key);

        const { data: users, error } = await supabase.auth.admin.listUsers();
        if (error) {
            return NextResponse.json({ error: 'Invalid Supabase credentials' }, { status: 401 });
        }

        const userData = users?.users?.map(user => ({
            id: user.id,
            email: user.email,
            hasMFA: user.factors?.length > 0
        }));

        const { data: tables } = await supabase
            .from('pg_policy')
            .select('schemaname, tablename');

        const { data: allTables } = await supabase
            .from('pg_tables')
            .select('tablename')
            .eq('schemaname', 'public');
        if (allTables) {
            return allTables?.map(table => ({
                name: table.tablename,
                hasRLS: tables.some(t => t.tablename === table.tablename)
            }));
        }

        return new Response(
            JSON.stringify({ success: true, message: "Authentication successful ", usersCount: users.length, users, allTables, tables, userData }),
            { status: 200 }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ success: false, message: error.message }),
            { status: 500 }
        );
    }
}
