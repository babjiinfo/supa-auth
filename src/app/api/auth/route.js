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
            return NextResponse.json(
                { success: false, message: "Missing Supabase URL or key" },
                { status: 400 }
            );
        }

        // Initialize Supabase client
        const supabase = createClient(url, key);

        // First verify credentials with auth check
        const { data: authCheck, error: authError } = await supabase.auth.admin.listUsers();
        if (authError) {
            return NextResponse.json(
                { success: false, message: "Invalid Supabase credentials" },
                { status: 401 }
            );
        }

        // Get schema information using REST API
        const metadataUrl = `${url}/rest/v1/?apikey=${key}`;
        const response = await fetch(metadataUrl, {
            headers: {
                'Authorization': `Bearer ${key}`,
                'apikey': key
            }
        });

        if (!response.ok) {
            return NextResponse.json(
                { success: false, message: "Failed to fetch schema information" },
                { status: 500 }
            );
        }

        const definitions = await response.json();

        // Process the table definitions
        const tables = Object.entries(definitions.definitions).map(([tableName, def]) => {
            return {
                table: tableName,
                // If table has security policies defined in the schema
                hasRLS: def['policy'] !== undefined,
                schema: 'public'
            };
        });

        // Get user information
        const { data: users } = await supabase.auth.admin.listUsers();
        const userData = users?.users?.map(user => ({
            id: user.id,
            email: user.email,
            hasMFA: user.factors?.length > 0
        }));

        // Create summary
        const summary = {
            totalTables: tables.length,
            tablesWithRLS: tables.filter(t => t.hasRLS).length,
            tablesWithoutRLS: tables.filter(t => !t.hasRLS).length,
            tables: tables.map(t => ({
                ...t,
                rls_status: t.hasRLS ? "Enabled" : "Disabled"
            }))
        };

        // Generate recommendations
        const recommendations = tables
            .filter(t => !t.hasRLS)
            .map(t => ({
                table: t.table,
                recommendation: `Enable Row Level Security (RLS) for table '${t.table}' to ensure proper access control.`,
                severity: "High",
                details: "RLS helps prevent unauthorized access to table rows based on the user making the request."
            }));

        // Additional security checks
        const securityChecks = {
            auth_enabled: true, // Supabase has auth enabled by default
            total_users: userData.length,
            users_with_mfa: userData.filter(u => u.hasMFA).length,
            rls_adoption_rate: `${((summary.tablesWithRLS / summary.totalTables) * 100).toFixed(1)}%`
        };

        return NextResponse.json({
            success: true,
            message: "Security audit completed successfully",
            summary,
            recommendations,
            userStats: {
                totalUsers: userData.length,
                users: userData
            },
            securityChecks
        }, { status: 200 });

    } catch (error) {
        console.error('Error in RLS check:', error);
        return NextResponse.json({
            success: false,
            message: error.message || "An unexpected error occurred",
            error: {
                type: error.name,
                details: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }
        }, { status: 500 });
    }
}