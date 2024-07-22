import React, { useState, useEffect } from 'react';
import { Col, Row, Select } from 'antd';
import Chart from 'react-apexcharts';
import axios from 'axios';
import sampleData from "./sampleExpenseData.json"

// Mapping month names to indices
const monthIndexMap = {
    "January": 0,
    "February": 1,
    "March": 2,
    "April": 3,
    "May": 4,
    "June": 5,
    "July": 6,
    "August": 7,
    "September": 8,
    "October": 9,
    "November": 10,
    "December": 11
};

// Available hub IDs and names
const hubOptions = [
    { id: '6696008c5ff154cfe3cc1a0e', name: 'Testing' },
    { id: '6696068a5ff154cfe3cc1a58', name: 'Tayib' },
    { id: '669613c3126836dd5c3c3e96', name: 'Testing_sarvani 123' },
    { id: '669e3a71ac963160781c1123', name: 'Pune' }
];

const DashboardExpenseContainer = () => {
    // const [selectedHub, setSelectedHub] = useState(localStorage.getItem("selectedHubID") || hubOptions[0].id);
    const [selectedHub, setSelectedHub] = useState(localStorage.getItem("selectedHubID"));
    const [allSeries, setAllSeries] = useState([]);
    const [selectedSeries, setSelectedSeries] = useState(null); // Initialize as null
    const [totalExpenses, setTotalExpenses] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Handle default data case if localStorage values are not set
                // const hubId = selectedHub || hubOptions[0].id;
                const hubId = selectedHub;
                const response = await axios.get(`https://trucklinkuatnew.thestorywallcafe.com/prod/v1/get-expenses-visualtion?entryYear=2024&hubId=${hubId}`, {
                    headers: {
                        Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MjE2MzI4MjUsImV4cCI6MTcyNDIyNDgyNSwiaXNzIjoiaHV0ZWNoc29sdXRpb25zLmNvbSIsInN1YiI6ImVtYWlsPWRocnV2YUB0cnVja2xpbmsuY29tcm9sZT1BZG1pbiIsInJvbGUiOiJBZG1pbiIsImVtYWlsIjoiZGhydXZhQHRydWNrbGluay5jb20ifQ.fSHdxzHtRmZASvaaQAi3zs84eMJ39XxdJR_miz9A5PE'
                    }
                });

                // const data = response.data.totalTrip;
                const data = sampleData;
                

                // Initialize arrays for each category with 0 values for each month
                const defaultData = {
                    Diesel: Array(12).fill(0),
                    Cash: Array(12).fill(0),
                    BankTransfer: Array(12).fill(0),
                    Shortage: Array(12).fill(0)
                };

                // Populate data with the API response
                data.forEach(item => {
                    const monthIndex = monthIndexMap[item.month];
                    if (monthIndex !== undefined) {
                        defaultData.Diesel[monthIndex] = item.totalDiesel;
                        defaultData.Cash[monthIndex] = item.totalCash;
                        defaultData.BankTransfer[monthIndex] = item.totalBankTransfer;
                        defaultData.Shortage[monthIndex] = item.totalShortage;
                    }
                });

                // Prepare series for the chart
                const formattedSeries = [
                    {
                        name: 'Diesel',
                        data: defaultData.Diesel,
                        color: '#FF4560'
                    },
                    {
                        name: 'Cash',
                        data: defaultData.Cash,
                        color: '#FEB019'
                    },
                    {
                        name: 'Bank Transfer',
                        data: defaultData.BankTransfer,
                        color: '#00E396'
                    },
                    {
                        name: 'Shortage',
                        data: defaultData.Shortage,
                        color: '#775DD0'
                    }
                ];

                setAllSeries(formattedSeries);

                // Calculate total expenses
                const total = formattedSeries.reduce((acc, series) => acc + series.data.reduce((a, b) => a + b, 0), 0);
                setTotalExpenses(total);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [selectedHub]);

    const chartOptions = {
        chart: {
            id: "basic-bar",
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800,
                animateGradually: {
                    enabled: true,
                    delay: 150
                },
                dynamicAnimation: {
                    enabled: true,
                    speed: 350
                }
            }
        },
        markers: {
            size: 5,
            strokeColors: '#fff',
            strokeWidth: 2,
            shape: 'circle',
            hover: {
                size: 7
            }
        },
        xaxis: {
            categories: [
                'January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December'
            ],
            labels: {
                rotate: 0,
                style: {
                    fontSize: '12px'
                }
            },
            tickAmount: 6
        },
        stroke: {
            width: 2
        },
        dataLabels: {
            enabled: false
        },
        toolbar: {
            show: false
        },
    };

    const handleCardClick = (seriesName) => {
        if (selectedSeries && selectedSeries[0].name === seriesName) {
            setSelectedSeries(null);
        } else {
            const newSeries = allSeries.filter(series => series.name === seriesName);
            setSelectedSeries(newSeries.length ? newSeries : null);
        }
    };

    const seriesToRender = selectedSeries || allSeries;

    return (
        <div className='dashboard-expense-container'>
            <div className="cards-container">
                <Row gutter={24} className='flex items-center'>
                    <Col className="gutter-row" span={6}>
                        <div className="flex justify-between items-center p-2 font-bold text-xl">
                            <h1>Monthly Expenses</h1>
                        </div>
                    </Col>
                    <Col className="gutter-row" span={18}>
                        <div className="flex items-center justify-end px-4">
                            <Select 
                                value={selectedHub} 
                                onChange={value => {
                                    setSelectedHub(value);
                                    localStorage.setItem("selectedHubID", value); // Save to localStorage
                                }}
                                style={{ width: 200 }}
                            >
                                {hubOptions.map(hub => (
                                    <Select.Option key={hub.id} value={hub.id}>
                                        {hub.name}
                                    </Select.Option>
                                ))}
                            </Select>
                            <div className="flex justify-between flex-col  p-2 ml-4">
                                <div className="category-value text-xl font-bold text-red-500">
                                    ₹ {totalExpenses.toLocaleString()}
                                </div>
                                <div className="category-title font-bold">
                                    TOTAL EXPENSES
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>

                <Row gutter={24}>
                    <Col className="gutter-row flex flex-col gap-2 p-0" span={6}>
                        {allSeries.map(series => (
                            <div key={series.name} className="gutter-row flex flex-col gap-2" onClick={() => handleCardClick(series.name)}>
                                <div className={`flex flex-col gap-2 p-2 border border-y-2 border-x-2 rounded-md  bg-white cursor-pointer ${selectedSeries && selectedSeries[0].name === series.name ? 'border-blue-500' : ''}`}>
                                    <div className={`category-value text-xl font-bold ${series.name === 'Diesel' ? 'text-red-500' : series.name === 'Cash' ? 'text-yellow-500' : series.name === 'Bank Transfer' ? 'text-green-500' : 'text-pink-500'}`}>
                                        ₹ {series.data.reduce((a, b) => a + b, 0).toLocaleString()}
                                    </div>
                                    <div className="category-title">
                                        {series.name.toUpperCase()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Col>

                    <Col className="gutter-row" span={18}>
                        <div className="flex justify-between items-center p-2 border border-y-2 border-x-2 rounded-md px-4">
                            <Chart
                                options={{ ...chartOptions, colors: seriesToRender.map(series => series.color) }}
                                series={seriesToRender}
                                type="line"
                                width="100%"
                                style={{ minWidth: '600px', width: "100%", maxWidth: '800px', margin: '0 auto' }}
                                height="350"
                            />
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default DashboardExpenseContainer;
