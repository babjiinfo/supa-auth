'use client';
import { useEffect, useState } from 'react';

/**
 * Home component that displays user data stored in session storage.
 * Retrieves authentication data and displays a user table if data is available.
 * @returns {JSX.Element} The home page component.
 */
export default function Home() {
    const [userData, setUserData] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [summaryData, setSummaryData] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [securityChecks, setSecurityChecks] = useState(null);

    /**
     * Effect hook to retrieve authentication data from session storage.
     * Parses the stored data and updates the state with user details.
     */
    useEffect(() => {
        const storedData = sessionStorage.getItem('authData');
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            setUserData(parsedData.userStats?.users || []);
            setTableData(parsedData.summary?.tables || []);
            setSummaryData(parsedData.summary || null);
            setRecommendations(parsedData.recommendations || []);
            setSecurityChecks(parsedData.securityChecks || null);
        }
    }, []);

    return (
        <div className='authPage'>
            <h1 className='page-title'>Security Audit Dashboard</h1>

            {/* Summary Section */}
            {summaryData && (
                <div className='section summary-section'>
                    <h2 className='section-title'>Summary</h2>
                    <div className='grid summary-grid'>
                        <div className='summary-item'>
                            <p className='summary-label'>Total Tables</p>
                            <p className='summary-value'>{summaryData.totalTables}</p>
                        </div>
                        <div className='summary-item'>
                            <p className='summary-label'>Tables with RLS</p>
                            <p className='summary-value'>{summaryData.tablesWithRLS}</p>
                        </div>
                        <div className='summary-item'>
                            <p className='summary-label'>Tables without RLS</p>
                            <p className='summary-value'>{summaryData.tablesWithoutRLS}</p>
                        </div>
                        <div className='summary-item'>
                            <p className='summary-label'>RLS Adoption Rate</p>
                            <p className='summary-value'>{securityChecks?.rls_adoption_rate}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Security Checks */}
            {securityChecks && (
                <div className='section security-checks'>
                    <h2 className='section-title'>Security Checks</h2>
                    <div className='grid security-grid'>
                        <div className='security-item'>
                            <p className='security-label'>Auth Status</p>
                            <p className='security-value'>{securityChecks.auth_enabled ? 'Enabled' : 'Disabled'}</p>
                        </div>
                        <div className='security-item'>
                            <p className='security-label'>Total Users</p>
                            <p className='security-value'>{securityChecks.total_users}</p>
                        </div>
                        <div className='security-item'>
                            <p className='security-label'>Users with MFA</p>
                            <p className='security-value'>{securityChecks.users_with_mfa}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
                <div className='section recommendations'>
                    <h2 className='section-title'>Security Recommendations</h2>
                    {recommendations.map((rec, index) => (
                        <div key={index} className='recommendation-item'>
                            <p className='recommendation-table'>Table: {rec.table}</p>
                            <p className='recommendation-severity'>Severity: {rec.severity}</p>
                            <p className='recommendation-text'>{rec.recommendation}</p>
                            <p className='recommendation-details'>{rec.details}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Users and Tables */}
            <div className='section users-tables'>
                <h2 className='section-title'>Users and Tables</h2>
                <table className="user-table">
                    <thead>
                        <tr className='table-header'>
                            <th className='table-cell'>ID</th>
                            <th className='table-cell'>Email</th>
                            <th className='table-cell'>Has MFA</th>
                            <th className='table-cell'>Tables</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userData.map((user) => (
                            <tr key={user.id}>
                                <td className='table-cell'>{user.id}</td>
                                <td className='table-cell'>{user.email}</td>
                                <td className='table-cell'>
                                    <span className={`mfa-status ${user.hasMFA ? 'mfa-enabled' : 'mfa-disabled'}`}>
                                        {user.hasMFA ? 'Yes' : 'No'}
                                    </span>
                                </td>
                                <td className='table-cell'>
                                    {tableData.length > 0 ? (
                                        <ul className='table-list'>
                                            {tableData.map((table, index) => (
                                                <li key={index} className='table-item'>
                                                    {table.table}
                                                    <span className={`table-status ${table.hasRLS ? 'rls-enabled' : 'rls-disabled'}`}>
                                                        {table.hasRLS ? 'RLS Enabled' : 'RLS Disabled'}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        'No Tables'
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
