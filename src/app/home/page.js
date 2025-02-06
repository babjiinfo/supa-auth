'use client';
import { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import dynamic from 'next/dynamic';
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });
// import ReactApexChart from 'react-apexcharts';

/**
 * Home component that displays user data stored in session storage.
 * Retrieves authentication data and displays a user table if data is available.
 * @returns {JSX.Element} The home page component.
 */
export default function Home() {
    const initialChartState = {
        series: [0, 0],  // Initialize with zeros
        options: {
            chart: {
                width: 350,
                type: 'donut',
            },
            plotOptions: {
                pie: {
                    startAngle: -90,
                    endAngle: 270,
                    donut: {
                        size: '65%'
                    }
                }
            },
            dataLabels: {
                enabled: true,
            },
            fill: {
                type: 'gradient',
            },
            legend: {
                fontSize: '19px',
                fontWeight: '500',
                offsetY: 5,
                offsetX: -25,
                formatter: function (val, opts) {
                    return `${val}: ${opts.w.config.series[opts.seriesIndex]}`;
                },
                itemMargin: {
                    horizontal: 20, // Space between legend items horizontally
                    vertical: 13, // Space between legend items vertically
                },
                markers: {
                    offsetX: -2, // Move marker further left to create more space
                }
            },
            labels: ["Tables with RLS", "Tables without RLS"]
        }
    };
    const [userData, setUserData] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [summaryData, setSummaryData] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [securityChecks, setSecurityChecks] = useState(true);
    const [totalTables, setTotalTables] = useState(0);
    const [tablesWithRls, setTablesWithRls] = useState(0);
    const [rlsAcceptanceRatio, setrlsAcceptanceRatio] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0);
    const [usersWithMfa, setUsersWithMfa] = useState(0);
    const [projectData, setProjectData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [state, setState] = useState(initialChartState);


    // In your component
    /**
     * Effect hook to retrieve authentication data from session storage.
     * Parses the stored data and updates the state with user details.
     */
    useEffect(() => {
        const storedData = sessionStorage.getItem('authData');
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            setUserData(parsedData?.results || []);
            setTableData(parsedData?.rlsData || []);
            setSummaryData(parsedData.recommendations || null);
            setRecommendations(parsedData.recommendations || []);
            setSecurityChecks(parsedData.securityChecks || true);
            setTotalTables(parsedData?.totalTables || 0);
            setTablesWithRls(parsedData?.tablesWithRls || 0);
            setrlsAcceptanceRatio(parsedData?.rlsAcceptanceRatio || 1);
            setTotalUsers(parsedData?.totalUsers || 0);
            setUsersWithMfa(parsedData?.usersWithMfa || 0);
            setProjectData(parsedData?.projectData || []);
            setIsLoading(false);
        }
    }, []);
    useEffect(() => {
        if (!isLoading && totalTables !== undefined && tablesWithRls !== undefined) {
            setState(prevState => ({
                ...prevState,
                series: [
                    // totalTables,
                    tablesWithRls,
                    (totalTables - tablesWithRls)
                ]
            }));
        }
    }, [totalTables]);

    return (
        <div className='dashboardPage'>
            <div className="container"><h1 className='page-title'><span>Security</span> Audit Dashboard</h1></div>

            {/* Summary Section */}
            {summaryData && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ ease: "easeInOut", duration: 1, delay: 0.1 }} className='section summary-section'>
                    <div className="container">
                        <h2 className='section-title'> <span> Row Level </span> Security</h2>
                        <div className='grid summary-grid'>
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ ease: "easeInOut", duration: 1, delay: 0.1 }}
                                className='summary-item'>
                                <img src="table-img-1.png" className='summary-icon' alt="img" />
                                <div>
                                    <p className='summary-label'>Total Tables</p>
                                    <p className='summary-value'>{totalTables}</p>
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ ease: "easeInOut", duration: 1, delay: 0.2 }}
                                className='summary-item purple'>
                                <img src="table-img-2.png" className='summary-icon' alt="img" />
                                <div>
                                    <p className='summary-label'>Tables with RLS</p>
                                    <p className='summary-value'>{tablesWithRls}</p>
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ ease: "easeInOut", duration: 1, delay: 0.3 }}
                                className='summary-item red'>
                                <img src="table-img-3.png" className='summary-icon' alt="img" />
                                <div>
                                    <p className='summary-label'>Tables without RLS</p>
                                    <p className='summary-value'>{totalTables - tablesWithRls}</p>
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ ease: "easeInOut", duration: 1, delay: 0.4 }}
                                className='summary-item orange'>
                                <img src="table-img-4.png" className='summary-icon' alt="img" />
                                <div>
                                    <p className='summary-label'>RLS Adoption Rate</p>
                                    <p className='summary-value'>{rlsAcceptanceRatio} %</p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Security Checks */}
            {securityChecks && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ ease: "easeInOut", duration: 1.1, delay: 1 }} className='section security-checks'>
                    <div className="container">
                        <h2 className='section-title'><span>Multi Factor</span> Authentication</h2>
                        <div className='grid security-grid lg'>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ ease: "easeInOut", duration: 1, delay: 1.3 }}
                                className='security-item purple'>
                                <div>
                                    <p className='security-label'>Total Users</p>
                                    <p className='security-value'>{totalUsers}</p>
                                </div>
                                <img src="user.png" alt="img" />
                            </motion.div>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ ease: "easeInOut", duration: 1, delay: 1.4 }}
                                className='security-item red'>
                                <div>
                                    <p className='security-label'>Users with MFA</p>
                                    <p className='security-value'>{usersWithMfa}</p>
                                </div>
                                <img src="enabled.png" alt="img" />
                            </motion.div>
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ ease: "easeInOut", duration: 1, delay: 1.1 }}
                                className='security-item'>
                                <div>
                                    <p className='security-label'>Users without MFA</p>
                                    <p className='security-value'>{totalUsers - usersWithMfa}</p>
                                </div>
                                <img src="user-mfa.png" alt="img" />
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            )}


            <section className='summeryGraph'>
                <div className="container">
                    <div className="row">
                        <div className="col-left">
                            <div className='summeryGraph_left'>
                                <h2>Summary</h2>
                                <div className="summeryGraph_wrap" >
                                    {!isLoading &&
                                        <ReactApexChart options={state.options} series={state.series} type="donut" width={600} />
                                    }
                                </div>
                                <div className="summeryGraph_card">
                                    <label>RLS Adoption Rate</label>
                                    <p>{rlsAcceptanceRatio}%</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-right">
                            <div className="summeryGraph_right">
                                <div className="summeryGraph_right_inner">
                                    {recommendations.map((rec, index) => (
                                        <div key={index} className='summeryGraph-item'>
                                            <div className="summeryGraph-user">
                                                <img src="placeholder-img.png" alt="" />
                                            </div>
                                            <div>
                                                <p className='summeryGraph-table'>Table: <span>{rec.table}</span> </p>
                                                {/* <span className={`status ${user.mfaEnabled ? 'status-success' : 'status-danger'}`}></span> */}
                                                <p className='summeryGraph-severity'>Severity: <span className={`status ${rec.severity === 'Low' ? 'status-success' : 'status-danger'}`}>{rec.severity}</span></p>
                                                <p className='summeryGraph-text'>{rec.recommendation}</p>
                                                <p className='summeryGraph-details'>{rec.details}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Users and Tables */}
            <div className='section users-tables'>
                <div className="container">
                    <h2 className='section-title'><span>Users Information</span></h2>
                    <table className="user-table">
                        <thead>
                            <tr className='table-header'>
                                <th className='table-cell'>ID</th>
                                <th className='table-cell'>Email</th>
                                <th className='table-cell'>Has MFA</th>
                                {/* <th className='table-cell'>Tables</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {userData.map((user, index) => (
                                <tr key={user.id}>
                                    <td className='table-cell'>{index + 1}</td>
                                    <td className='table-cell'>{user.email}</td>
                                    <td className='table-cell'>
                                        <span className={`status ${user.mfaEnabled ? 'status-success' : 'status-danger'}`}>
                                            {user.mfaEnabled ? 'Yes' : 'No'}
                                        </span>
                                    </td>
                                    {/* <td className='table-cell'>
                                        {tableData.length > 0 ? (
                                            <ul className='table-list'>
                                                {tableData.map((table, index) => (
                                                    <li key={index} className='table-item'>
                                                        {table.table}
                                                        <span className={`status ${table.hasRLS ? 'status-success' : 'status-danger'}`}>
                                                            {table.hasRLS ? 'RLS Enabled' : 'RLS Disabled'}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            'No Tables'
                                        )}
                                    </td> */}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Project Information */}
            <div className='section users-tables'>
                <div className="container">
                    <h2 className='section-title'><span>Project Information</span></h2>
                    <table className="user-table">
                        <thead>
                            <tr className='table-header'>
                                <th className='table-cell'>ID</th>
                                <th className='table-cell'>Project Name</th>
                                <th className='table-cell'>PITR Status</th>
                                {/* <th className='table-cell'>Tables</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {projectData?.map((project, index) => (
                                <tr key={project.id}>
                                    <td className='table-cell'>{project?.projectId}</td>
                                    <td className='table-cell'>{project?.projectName}</td>
                                    <td className='table-cell'>
                                        <span className={`status ${project?.status === 'PASS' ? 'status-success' : 'status-danger'}`}>
                                            {project?.status === 'PASS' ? 'Pass' : 'Fail'}
                                        </span>
                                    </td>
                                    {/* <td className='table-cell'>
                                        {tableData.length > 0 ? (
                                            <ul className='table-list'>
                                                {tableData.map((table, index) => (
                                                    <li key={index} className='table-item'>
                                                        {table.table}
                                                        <span className={`status ${table.hasRLS ? 'status-success' : 'status-danger'}`}>
                                                            {table.hasRLS ? 'RLS Enabled' : 'RLS Disabled'}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            'No Tables'
                                        )}
                                    </td> */}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div >
    );
}
