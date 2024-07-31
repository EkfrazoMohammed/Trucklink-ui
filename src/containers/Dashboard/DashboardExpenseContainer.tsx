import React, { useState, useEffect } from 'react';
import { Col, Row } from 'antd';
import Chart from 'react-apexcharts';
import { API } from "../../API/apirequest";

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

const DashboardExpenseContainer = ({ year, currentUserRole }) => {
    const selectedHub=localStorage.getItem("selectedHubID");
    const selectedHubName=localStorage.getItem("selectedHubName");
    const authToken=localStorage.getItem("token");
    const [allSeries, setAllSeries] = useState([]);
    const [selectedSeries, setSelectedSeries] = useState(null);
    const [totalExpenses, setTotalExpenses] = useState(0);

    const headersOb = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
        }
    };

    const fetchData = async () => {
        try {
            const defaultData = {
                Diesel: Array(12).fill(0),
                Cash: Array(12).fill(0),
                BankTransfer: Array(12).fill(0),
                Shortage: Array(12).fill(0)
            };

            const url = `get-expenses-visualtion?entryYear=${year}`;
            let payload;
            if (selectedHub == "" || selectedHub == undefined || selectedHub == null) {
                payload = { "hubIds": [] }
            } else {
                payload = { "hubIds": [selectedHub] }
            }

            console.log(payload)
            const response = await API.post(url, payload, headersOb);
            const data = response.data;

            data.totalTrip.forEach(item => {
                const monthIndex = monthIndexMap[item.month];
                if (monthIndex !== undefined) {
                    defaultData.Diesel[monthIndex] = item.totalDiesel;
                    defaultData.Cash[monthIndex] = item.totalCash;
                    defaultData.BankTransfer[monthIndex] = item.totalBankTransfer;
                    defaultData.Shortage[monthIndex] = item.totalShortage;
                }
            });

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

            const total = formattedSeries.reduce((acc, series) => acc + series.data.reduce((a, b) => a + b, 0), 0);
            setTotalExpenses(total);

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
       
        fetchData();
    }, []);
    useEffect(() => {
        // Fetch data initially and whenever year or selectedHub changes
        fetchData();

    }, [year, selectedHub]);


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
                            <h1>Monthly Expenses {selectedHubName}</h1>
                        </div>
                    </Col>
                    <Col className="gutter-row" span={18}>
                        <div className="flex items-center justify-end px-4">
                            <div className="flex justify-between flex-col p-2 ml-4">
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
                                <div className={`flex flex-col gap-2 p-2 border border-y-2 border-x-2 rounded-md bg-white cursor-pointer ${selectedSeries && selectedSeries[0].name === series.name ? 'border-blue-500' : ''}`}>
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
