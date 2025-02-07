'use client';
import { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import dynamic from 'next/dynamic';
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });
import Modal from 'react-bootstrap/Modal';
import { marked } from 'marked';
import { Collapse, Form, InputGroup } from 'react-bootstrap';
import toast from 'react-hot-toast';
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
                offsetX: -15,
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
            labels: ["Tables with RLS", "Tables without RLS"],
            responsive: [
                {
                    breakpoint: 991, // Adjust this value as per your requirement
                    options: {
                        chart: {
                            width: 550, // Adjust chart size for small screens
                        },
                        legend: {
                            fontSize: "16px",
                        },
                    },
                },
                {
                    breakpoint: 767, // Another smaller breakpoint for mobile screens
                    options: {
                        chart: {
                            width: 500, // Further reduce size
                        },
                        legend: {
                            fontSize: "14px",
                            position: "bottom",
                            itemMargin: {
                                horizontal: 5,
                                vertical: 0,
                            },
                        },
                    },
                },
                {
                    breakpoint: 576, // Another smaller breakpoint for mobile screens
                    options: {
                        chart: {
                            width: 300, // Further reduce size
                        },
                        legend: {
                            itemMargin: {
                                horizontal: 5,
                                vertical: 5,
                            },
                            markers: {
                                size: 6,
                            },
                        }
                    },
                },
            ],
        }
    };
    const [userData, setUserData] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [summaryData, setSummaryData] = useState(true);
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
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! How can I assist you today?", sender: 'ai' }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [tableName, setTableName] = useState('');

    // chat box
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isAILoading, setIsAILoading] = useState(false);
    const [aiTyping, setAiTyping] = useState(false);


    const handleToggle = (event) => {
        event.preventDefault();
        setIsFormVisible((prev) => !prev);
    };

    //  collapse
    const [open, setOpen] = useState(false);

    // animation mediquery
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

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
            setSummaryData(parsedData.recommendations || []);
            setRecommendations(parsedData.recommendations || []);
            setSecurityChecks(parsedData.securityChecks || true);
            setTotalTables(parsedData?.totalTables || 0);
            setTablesWithRls(parsedData?.tablesWithRls || 0);
            setrlsAcceptanceRatio(parseFloat((parsedData?.rlsAcceptanceRatio || 0).toFixed(2)));
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


    const handleRLS = async (e) => {
        e.preventDefault();
        setOpen(true);
        if (tableName === '') {
            toast.error('Table name required');
        }
        try {
            const res = await fetch('/api/auth/rls', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tableName }),
            });

            const data = await res.json();
            if (res.status == 400) {
                const errorData = await res.json();
                toast.error(errorData.message);
                return;
            }
            setTableName('');
            toast.success(data?.message || 'Row Level Security enabled successfully');

        } catch (error) {
            if (error?.code === '42P01') {
                toast.error('Table not found');
            } else {
                toast.error(error?.message || 'An unknown error occurred');
            }
        }

    };

    const handleSendMessage = async () => {
        if (inputMessage.trim() === '') return;
        const newMessage = {
            id: messages.length + 1,
            text: inputMessage,
            sender: 'user'
        };
        setMessages([...messages, newMessage]);
        setInputMessage('');
        setIsAILoading(true);
        setAiTyping(true);
        try {
            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ issue: inputMessage }),
            });
            const data = await response.json();
            const aiResponseText = data.suggestion || 'Sorry, I could not process your request. Please check your open ai key';

            const aiResponse = {
                id: messages.length + 2,
                text: aiResponseText,
                sender: 'ai'
            };

            setMessages(prev => [...prev, aiResponse]);
            setIsAILoading(false);
        } catch (error) {
            const errorResponse = {
                id: messages.length + 2,
                text: 'Sorry, something went wrong. Please try again.',
                sender: 'ai'
            };
            setIsAILoading(false);
            setMessages(prev => [...prev, errorResponse]);
        }
        setInputMessage('');
    };
    const formatMessage = (text) => {
        try {
            const formattedText = marked(text);
            return (
                <div
                    dangerouslySetInnerHTML={{
                        __html: formattedText
                    }}
                    className="markdown-content"
                />
            );
        } catch (error) {
            return text;
        }
    };
    return (
        <>
            <div className='dashboardPage'>
                <div className="container"><h1 className='page-title'><span>Security</span> Audit Dashboard</h1></div>

                {/* Summary Section */}
                {summaryData && (
                    <motion.div
                        initial={!isMobile ? { y: 20, opacity: 0 } : {}}
                        animate={!isMobile ? { y: 0, opacity: 1 } : {}}
                        transition={{ ease: "easeInOut", duration: 1, }}
                        className="section summary-section"
                    >
                        <div className="container">
                            <div className="section-head mb-4">
                                <h2 className='section-title'> <span> Row Level </span> Security</h2>
                                <button className="btn" onClick={handleShow}>
                                    Quick Fix
                                </button>
                            </div>

                            <div className='grid summary-grid'>
                                <motion.div
                                    initial={!isMobile ? { y: 20, opacity: 0 } : {}}
                                    animate={!isMobile ? { y: 0, opacity: 1 } : {}}
                                    transition={{ ease: "easeInOut", duration: 1, delay: 0.1 }}
                                    className='summary-item'>
                                    <img src="table-img-1.png" className='summary-icon' alt="img" />
                                    <div>
                                        <p className='summary-label'>Total Tables</p>
                                        <p className='summary-value mb-0'>{totalTables}</p>
                                    </div>
                                </motion.div>
                                <motion.div
                                    initial={!isMobile ? { y: 20, opacity: 0 } : {}}
                                    animate={!isMobile ? { y: 0, opacity: 1 } : {}}
                                    transition={{ ease: "easeInOut", duration: 1, delay: 0.2 }}
                                    className='summary-item purple'>
                                    <img src="table-img-2.png" className='summary-icon' alt="img" />
                                    <div>
                                        <p className='summary-label'>Tables with RLS</p>
                                        <p className='summary-value mb-0'>{tablesWithRls}</p>
                                    </div>
                                </motion.div>
                                <motion.div
                                    initial={!isMobile ? { y: 20, opacity: 0 } : {}}
                                    animate={!isMobile ? { y: 0, opacity: 1 } : {}}
                                    transition={{ ease: "easeInOut", duration: 1, delay: 0.3 }}
                                    className='summary-item red'>
                                    <img src="table-img-3.png" className='summary-icon' alt="img" />
                                    <div>
                                        <p className='summary-label'>Tables without RLS</p>
                                        <p className='summary-value mb-0'>{totalTables - tablesWithRls}</p>
                                    </div>
                                </motion.div>
                                <motion.div
                                    initial={!isMobile ? { y: 20, opacity: 0 } : {}}
                                    animate={!isMobile ? { y: 0, opacity: 1 } : {}}
                                    transition={{ ease: "easeInOut", duration: 1, delay: 0.4 }}
                                    className='summary-item orange'>
                                    <img src="table-img-4.png" className='summary-icon' alt="img" />
                                    <div>
                                        <p className='summary-label'>RLS Adoption Rate</p>
                                        <p className='summary-value mb-0'>{rlsAcceptanceRatio} %</p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Security Checks */}
                {securityChecks && (
                    <motion.div
                        initial={!isMobile ? { y: 20, opacity: 0 } : {}}
                        animate={!isMobile ? { y: 0, opacity: 1 } : {}}
                        transition={{ ease: "easeInOut", duration: 1.1, delay: 0.2 }}
                        className="section security-checks"
                    >
                        <div className="container">
                            <h2 className='section-title'><span>Multi Factor</span> Authentication</h2>
                            <div className='grid security-grid lg'>

                                <motion.div
                                    initial={!isMobile ? { y: 20, opacity: 0 } : {}}
                                    animate={!isMobile ? { y: 0, opacity: 1 } : {}}
                                    transition={{ ease: "easeInOut", duration: 1, delay: 1.3 }}
                                    className='security-item purple'>
                                    <div>
                                        <p className='security-label'>Total Users</p>
                                        <p className='security-value mb-0'>{totalUsers}</p>
                                    </div>
                                    <img src="user.png" alt="img" />
                                </motion.div>

                                <motion.div
                                    initial={!isMobile ? { y: 20, opacity: 0 } : {}}
                                    animate={!isMobile ? { y: 0, opacity: 1 } : {}}
                                    transition={{ ease: "easeInOut", duration: 1, delay: 1.4 }}
                                    className='security-item '>
                                    <div>
                                        <p className='security-label'>Users with MFA</p>
                                        <p className='security-value mb-0'>{usersWithMfa}</p>
                                    </div>
                                    <img src="enabled.png" alt="img" />
                                </motion.div>
                                <motion.div
                                    initial={!isMobile ? { y: 20, opacity: 0 } : {}}
                                    animate={!isMobile ? { y: 0, opacity: 1 } : {}}
                                    transition={{ ease: "easeInOut", duration: 1, delay: 1.1 }}
                                    className='security-item red'>
                                    <div>
                                        <p className='security-label'>Users without MFA</p>
                                        <p className='security-value mb-0'>{totalUsers - usersWithMfa}</p>
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
                                <motion.div
                                    initial={!isMobile ? { y: 20, opacity: 0 } : {}}
                                    animate={!isMobile ? { y: 0, opacity: 1 } : {}}
                                    transition={!isMobile ? { ease: "easeInOut", duration: 1, delay: 0.5 } : {}} className="summeryGraph_left">
                                    <h2 className="section-title">Summary</h2>
                                    <div className="summeryGraph_wrap" >
                                        {!isLoading &&
                                            <ReactApexChart options={state.options} series={state.series} type="donut" width={600} />
                                        }
                                    </div>
                                    {rlsAcceptanceRatio > 0 && <div className="summeryGraph_card">
                                        <label>RLS Adoption Rate</label>
                                        <p>{rlsAcceptanceRatio}%</p>
                                    </div>}
                                </motion.div>
                            </div>
                            <div className="col-right">
                                <motion.div
                                    initial={!isMobile ? { y: 20, opacity: 0 } : {}}
                                    animate={!isMobile ? { y: 0, opacity: 1 } : {}}
                                    transition={!isMobile ? { ease: "easeInOut", duration: 1, delay: 0.6 } : {}} className="summeryGraph_right">
                                    <div className="summeryGraph_right_inner">
                                        {recommendations?.length > 0 ? (
                                            recommendations?.map((rec, index) => (
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
                                            ))
                                        ) : (
                                            <span>No Recommendations</span>
                                        )}

                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Users and Tables */}
                <div className='section users-tables pb-0'>
                    <motion.div
                        initial={!isMobile ? { opacity: 0, y: 20 } : {}}
                        whileInView={!isMobile ? { opacity: 1, y: 0 } : {}}
                        transition={!isMobile ? { ease: "easeInOut", duration: 1 } : {}}
                        viewport={{ once: true, amount: 0.2 }} // Ensures animation triggers only once
                        className="container">
                        <h2 className='section-title'><span>Users </span>Information</h2>
                        <div className="users-tables-responsive">
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
                                    {userData?.length > 0 ? (
                                        userData?.map((user, index) => (
                                            <tr key={index}>
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
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="table-cell text-center">
                                                No Data
                                            </td>
                                        </tr>
                                    )}

                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>

                {/* Project Information */}
                <div className='section users-tables'>
                    <motion.div
                        initial={!isMobile ? { opacity: 0, y: 20 } : {}}
                        whileInView={!isMobile ? { opacity: 1, y: 0 } : {}}
                        transition={!isMobile ? { ease: "easeInOut", duration: 1 } : {}}
                        viewport={{ once: true, amount: 0.2 }} // Ensures animation triggers only once
                        className="container">
                        <h2 className='section-title'><span>Project </span>Information</h2>
                        <div className="users-tables-responsive">
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
                                    {projectData?.length > 0 ? (projectData?.map((project, index) => (
                                        <tr key={index}>
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
                                    ))) : (
                                        <tr>
                                            <td colSpan={3} className="table-cell text-center">
                                                No data
                                            </td>
                                        </tr>
                                    )}

                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>

            </div >

            <Modal
                show={show}
                onHide={handleClose}
                className="quickModal"
                centered
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Quick Fix</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="quickModal_cnt">
                        {/* <div className="quickModal_cnt_inner">
                            <h2 className="quickModal_title">
                                For simple login to Compliance tool
                            </h2>
                            <p className="quickModal_txt">Find your creds from below </p>
                            <img
                                src="screenshot-1.webp"
                                className="img-fluid"
                                alt="screenshot"
                            />
                        </div> */}
                        <div className="quickModal_cnt_inner">
                            <h2 className="quickModal_title">
                                For enabling Row Level Security (RLS) on a table :{"   "}{"   "}
                                {/* <button
                                    className="btn btn-sm btn_danger"
                                    onClick={() => setOpen(!open)}
                                    aria-controls="collapseText"
                                    aria-expanded={open}
                                >
                                    Fix Now
                                </button> */}
                            </h2>
                            <Collapse in={open}  >
                                <div id="collapseText">
                                    <div className="collapseInner">
                                        <Form>
                                            <InputGroup>
                                                <Form.Control
                                                    placeholder="Enter table name"
                                                    aria-describedby="basic-addon2"
                                                    value={tableName}
                                                    onChange={(e) => setTableName(e.target.value)}
                                                />
                                                <button
                                                    className="btn btn-md"
                                                    onClick={handleRLS}
                                                >Submit</button>
                                            </InputGroup>
                                        </Form>
                                    </div>
                                </div>
                            </Collapse>
                            <ul className="mb-4 ps-4">
                                <li>Log in to your Supabase dashboard.</li>
                                <li>Select your project from the dashboard</li>
                                <li>Click on <b>SQL Editor</b> from the left sidebar.</li>
                                <li>Create a function named :get_tables_rls_status </li>
                                <li>Paste the below code :</li>
                            </ul>
                            <div className="quickModal_code mb-4">
                                <code>
                                    create or replace function get_tables_rls_status()
                                    <br />
                                    returns table(name text, has_rls boolean) as $$
                                    <br />
                                    select
                                    <br />
                                    t.tablename as name,
                                    <br />
                                    case
                                    <br />
                                    when p.tablename is not null then true
                                    <br />
                                    else false
                                    <br />
                                    end as has_rls
                                    <br />
                                    from pg_tables t
                                    <br />
                                    left join (
                                    <br />
                                    select c.relname as tablename
                                    <br />
                                    from pg_policy pol
                                    <br />
                                    join pg_class c on pol.polrelid = c.oid
                                    <br />
                                    join pg_namespace n on c.relnamespace = n.oid
                                    <br />
                                    where n.nspname = 'public'
                                    <br />
                                    ) p on t.tablename = p.tablename
                                    <br />
                                    where t.schemaname = 'public';
                                    <br />
                                    $$ language sql;
                                </code>
                            </div>
                            <img
                                src="screenshot-2.webp"
                                className="img-fluid"
                                alt="screenshot"
                            />
                        </div>
                        <div className="quickModal_cnt_inner">
                            <h2 className="quickModal_title">
                                For checking whether  PITR is enabled or not :
                            </h2>
                            <ul className="mb-0 ps-4">
                                <li>Go to Supabase and log in to your account.</li>
                                <li>Navigate to the Organization Settings</li>
                                <li>Click on your organization name in the top-left corner.</li>
                                <li>Select "Settings" from the dropdown.</li>
                                <li>Find the Access Token</li>
                                <li>Under the "Access Tokens" section, you might see existing tokens or an option to create a new one.</li>
                                <li>Click "Generate a new access token" if none exist.</li>
                                <li>Copy the Token</li>
                                <li>After generating, copy the token immediately as it may not be displayed again.</li>
                            </ul>
                        </div>

                        <div className="quickModal_cnt_inner">
                            <h2 className="quickModal_title">
                                For Enabling RLS :
                            </h2>
                            <ul className="mb-0 ps-4">
                                <li>Go to Supabase and log in to your account.</li>
                                <li>Navigate to SQL Editor </li>
                                <li>Run below command </li>
                                <li>ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;</li>
                            </ul>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>

            <div className="chatBot d-flex flex-column align-items-center">
                <button type="button" id="toggleLink" aria-label="Chat Button" className="btn-link chatBot_link d-flex align-items-center justify-content-center" onClick={handleToggle}>
                    <svg width="25px" height="25px" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M0 1.49933C0 0.670226 0.671178 0 1.5 0H13.5C14.3288 0 15 0.670226 15 1.49933V10.4935C15 11.3226 14.3288 11.9928 13.5 11.9928H7.66658L3.79988 14.8909C3.64835 15.0045 3.44568 15.0227 3.27632 14.938C3.10697 14.8533 3 14.6802 3 14.4908V11.9928H1.5C0.671178 11.9928 0 11.3226 0 10.4935V1.49933ZM4 3.99738H11V4.99738H4V3.99738ZM4 6.99542H9V7.99542H4V6.99542Z" fill="#fff" />
                    </svg>
                </button>
                <div className={`chatBot_box ${isFormVisible ? "open" : ""}`}  >
                    <div className="chatBot_header">
                        <h3 >AI chat </h3>
                        <div className="closeIcon" onClick={handleToggle}></div>
                    </div>
                    <div className="chatBot_body">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`${msg.sender === 'user' ? 'chatBot_body_receive' : 'chatBot_body_send'}`}
                            >
                                {msg.sender === 'ai' && <img src="logo-1.png" alt="user" />}
                                <div className="chatBot_body_msg">
                                    <span>{msg.sender === 'ai' ? formatMessage(msg.text) : msg.text}</span>
                                </div>
                            </div>
                        ))}
                        {isAILoading && <div className="loading-spinner">Loading...</div>}
                    </div>
                    <div className="chatBot_footer">
                        <input type="text"
                            placeholder="Write your message"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            className="chat-input"
                        />
                        <button type="button"
                            className="chatBot_footer_sendBtn"
                            onClick={handleSendMessage}
                            disabled={isAILoading}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18.016" height="18.014" viewBox="0 0 18.016 18.014">
                                <path id="Path_161667" data-name="Path 161667" d="M11.549,18.015a1.655,1.655,0,0,1-1.586-1.2L8.015,10,1.2,8.052a1.659,1.659,0,0,1-.007-3.186L17.335.023a.528.528,0,0,1,.657.657L13.148,16.828A1.655,1.655,0,0,1,11.549,18.015Z" transform="translate(0.001 -0.001)" fill="#fff" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
