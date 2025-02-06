import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * @typedef {Object} SecurityAuditResponse
 * @property {boolean} success - Indicates if the audit was successful
 * @property {string} message - Status message of the audit
 * @property {Array<Object>} recommendations - List of security recommendations
 * @property {number} totalUsers - Total number of users in the system
 * @property {number} totalTables - Total number of tables in the database
 * @property {number} tablesWithRls - Number of tables with RLS enabled
 * @property {number} usersWithMfa - Number of users with MFA enabled
 * @property {number} rlsAcceptanceRatio - Percentage of tables with RLS enabled
 * @property {Array<Object>} rlsData - Raw RLS status data for each table
 * @property {Array<Object>} results - User security status data
 * @property {Array<Object>} projectData - Project configuration data
 * @property {boolean} securityChecks - Overall security check status
 */

/**
 * @typedef {Object} RequestBody
 * @property {string} url - Supabase project URL
 * @property {string} key - Supabase project API key
 */

/**
 * Performs a security audit of a Supabase project.
 * Checks for RLS implementation, MFA adoption, and PITR status.
 * 
 * @async
 * @param {Request} req - The incoming HTTP request
 * @returns {Promise<NextResponse>} JSON response with security audit results
 * 
 * @throws {Error} When credentials are missing
 * @throws {Error} When RLS status fetch fails
 * @throws {Error} When user list fetch fails
 * @throws {Error} When project data fetch fails
 * 
 * @example
 * // Request body
 * {
 *   "url": "https://your-project.supabase.co",
 *   "key": "your-api-key"
 * }
 */
export async function POST(req) {
    try {
        const { url, key } = await req.json();

        // Validate required credentials
        if (!url || !key) {
            return NextResponse.json({ success: false, message: 'Missing credentials' }, { status: 400 });
        }

        // Initialize Supabase client
        const supabase = createClient(url, key);

        // Fetch RLS status for all tables
        const { data: rlsData, error: rlsError } = await supabase.rpc('get_tables_rls_status');
        if (rlsError) {
            return NextResponse.json({ success: false, message: 'Failed to fetch RLS status' }, { status: 500 });
        }

        // Fetch user list and MFA status
        const { data: users, error: userError } = await supabase.auth.admin.listUsers();
        if (userError) {
            return NextResponse.json({ success: false, message: 'Failed to fetch users' }, { status: 500 });
        }

        // Process user data and MFA status
        const results = users?.users.map((user) => ({
            userId: user.id,
            email: user.email,
            mfaEnabled: user?.user_metadata?.mfa_enabled || false,
            status: user?.user_metadata?.mfa_enabled ? 'PASS' : 'FAIL',
        }));

        // Fetch project configuration data
        const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
        const response = await fetch('https://api.supabase.io/v1/projects', {
            headers: { Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}` },
        });

        if (!response.ok) {
            return NextResponse.json({ success: false, message: `Failed to fetch projects. Status: ${response.status}` }, { status: 500 });
        }

        // Process project data and PITR status
        const projects = await response.json();
        const projectData = projects?.map((proj) => ({
            projectId: proj.id,
            projectName: proj.name,
            pitrEnabled: proj?.pitr_enabled,
            status: proj.pitr_enabled ? 'PASS' : 'FAIL',
        }));

        // Generate security recommendations
        const recommendations = rlsData?.map((t) => ({
            table: t.name,
            recommendation: t.has_rls
                ? `Great job! RLS is enabled for table '${t.name}', ensuring proper access control.`
                : `Enable Row Level Security (RLS) for table '${t.name}' to ensure proper access control.`,
            severity: t.has_rls ? "Low" : "High",
            details: t.has_rls
                ? "RLS is correctly implemented to prevent unauthorized access."
                : "RLS helps prevent unauthorized access to table rows based on the user making the request.",
        }));

        // Return comprehensive security audit results
        return NextResponse.json({
            success: true,
            message: "Security audit completed successfully",
            recommendations,
            totalUsers: users?.users?.length || 0,
            totalTables: rlsData?.length || 0,
            tablesWithRls: rlsData?.filter((t) => t.has_rls)?.length || 0,
            usersWithMfa: results?.filter((u) => u.mfaEnabled)?.length || 0,
            rlsAcceptanceRatio: rlsData?.length
                ? (rlsData.filter((t) => t.has_rls).length / rlsData.length) * 100
                : 1,
            rlsData,
            results,
            projectData,
            securityChecks: true
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
