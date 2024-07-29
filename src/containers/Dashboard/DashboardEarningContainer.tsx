import React, { useEffect, useState } from 'react';
import { Col, Row, Radio, Select } from 'antd';
import Chart from 'react-apexcharts';
import { API } from "../../API/apirequest";

const { Option } = Select;

const DashboardEarningContainer = ({ year }) => {
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

    const selectedHub = localStorage.getItem("selectedHubID");
    const selectedHubName = localStorage.getItem("selectedHubName");
    const authToken = localStorage.getItem("token");

    const [earningData, setEarningData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState("amount");
    const [series, setSeries] = useState([]);
    const [totalEarningsAllHubs, setTotalEarningsAllHubs] = useState(0);
    const [hubs, setHubs] = useState([]);
    const [select3HubId, setSelect3HubId] = useState([]);

    const headersOb = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
        }
    };

    const fetchHubs = async () => {
        try {
            const response = await API.get('get-hubs', headersOb);
            setHubs(response.data.hubs);
        } catch (error) {
            console.error('Error fetching hub data:', error);
        }
    };

    useEffect(() => {
        fetchHubs();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const payload = {
                    "hubIds": select3HubId.length > 0 ? select3HubId : (selectedHub ? [selectedHub] : [])
                };
                const response = await API.post(`get-earning-visualtion?entryYear=${year}`, payload, headersOb);
                setEarningData(response.data.currentEarningData);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [year, selectedHub, select3HubId]);


    useEffect(() => {
        const hubsData = {};
        const monthlyTotals = Array(12).fill(0);
        let totalEarnings = 0;

        earningData.forEach(earning => {
            if (!hubsData[earning.hubId]) {
                hubsData[earning.hubId] = Array(12).fill(0);
            }
            const monthIndex = monthIndexMap[earning.month] ?? 0;
            hubsData[earning.hubId][monthIndex] += earning.totalEarning;
            monthlyTotals[monthIndex] += earning.totalEarning;
            totalEarnings += earning.totalEarning;
        });

        setTotalEarningsAllHubs(totalEarnings);

        const percentageHubs = {};
        Object.keys(hubsData).forEach(hubId => {
            percentageHubs[hubId] = hubsData[hubId].map(earning =>
                totalEarnings > 0 ? (earning / totalEarnings * 100).toFixed(2) : '0'
            );
        });

        const updatedSeries = Object.keys(hubsData).map(hubId => ({
            name: hubs.find(hub => hub._id === hubId)?.location || hubId,
            data: viewMode === "amount" ? hubsData[hubId] : percentageHubs[hubId].map(value => parseFloat(value))
        }));

        setSeries(updatedSeries);
    }, [earningData, viewMode, year, hubs]);

    // Aggregated earnings for display
    const aggregatedEarnings = earningData.reduce((acc, earning) => {
        if (!acc[earning.hubId]) {
            acc[earning.hubId] = { ...earning, totalEarning: 0 };
        }
        acc[earning.hubId].totalEarning += earning.totalEarning;
        return acc;
    }, {});

    const earningsArray = Object.values(aggregatedEarnings);

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
            colors: ['#eee'],
            strokeColors: '#fff',
            strokeWidth: 2,
            shape: 'circle',
            hover: {
                size: 7
            }
        },
        xaxis: {
            categories: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUNE', 'JULY', 'AUG', 'SEPT', 'OCT', 'NOV', 'DEC'],
            labels: {
                rotate: 0,
                style: {
                    fontSize: '12px'
                }
            },
            tickAmount: 12
        },
        yaxis: {
            labels: {
                formatter: function (value) {
                    return viewMode === "amount" ? (value >= 100000 ? (value / 100000).toFixed(1) + 'L' : value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value) : value.toFixed(2) + '%';
                }
            }
        },
        stroke: {
            width: 2
        },
        dataLabels: {
            enabled: false
        },
        toolbar: {
            show: false,
            offsetX: 0,
            offsetY: 0,
            tools: {
                download: true,
                selection: true,
                zoom: true,
                zoomin: true,
                zoomout: true,
                pan: true,
                reset: true,
                customIcons: []
            },
            export: {
                csv: {
                    filename: undefined,
                    columnDelimiter: ',',
                    headerCategory: 'category',
                    headerValue: 'value',
                    categoryFormatter(x) {
                        return new Date(x).toDateString();
                    },
                    valueFormatter(y) {
                        return y;
                    }
                },
                svg: {
                    filename: undefined,
                },
                png: {
                    filename: undefined,
                }
            },
            autoSelected: 'zoom'
        },
    };

    const handleChange = (value) => {
        if (value.length <= 3) {
            setSelect3HubId(value);
        }
    };

    return (
        <div className='dashboard-earning-container'>
            <div className="cards-container">
                <Row gutter={24} className='flex items-center'>
                    <Col className="gutter-row" span={6}>
                        <div className="flex justify-between items-center p-2 font-bold text-xl">
                            <h1>Monthly Earning</h1>
                        </div>
                    </Col>
                    <Col className="gutter-row" span={18}>
                        <div className="flex items-center justify-end px-4">
                            <div className="flex gap-4">
                                {(!selectedHub || selectedHub === "") &&
                                    <Select
                                        mode="multiple"
                                        placeholder="Select hubs"
                                        value={select3HubId}
                                        maxCount={3}
                                        onChange={handleChange}
                                        style={{ width: '200px', maxHeight: '100px' }}
                                    >
                                        {hubs.map(hub => (
                                            <Option key={hub._id} value={hub._id}>
                                                {hub.location}
                                            </Option>
                                        ))}
                                    </Select>
                                }
                                <Radio.Group onChange={(e) => setViewMode(e.target.value)} value={viewMode}>
                                    <Radio.Button value="amount">Amount</Radio.Button>
                                    <Radio.Button value="percentage">%</Radio.Button>
                                </Radio.Group>

                            </div>
                        </div>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col className="gutter-row flex flex-col gap-2" span={6}>
                        {(!selectedHub || selectedHub === "") ? (
                            earningsArray.map((earning, index) => {
                                const value = viewMode === "amount" ? earning.totalEarning.toFixed(2) : ((earning.totalEarning / totalEarningsAllHubs) * 100).toFixed(2) + ' %';
                                return (
                                    <div key={index} className="flex justify-between flex-col gap-2 p-2 border border-y-2 border-x-2 rounded-md px-4 bg-white">
                                        <div className={`category-value text-xl font-bold text-${index === 0 ? 'red' : index === 1 ? 'yellow' : 'green'}-500`}>
                                            {hubs.find(hub => hub._id === earning.hubId)?.location || earning.hubId}
                                        </div>
                                        <div className="category-title">
                                            {value}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div key={selectedHub} className="flex justify-between flex-col gap-2 p-2 border border-y-2 border-x-2 rounded-md px-4 bg-white">
                                <div className={`category-value text-xl font-bold text-red-500`}>
                                    {selectedHubName}
                                </div>
                                <div className="category-title">
                                    {earningsArray && earningsArray.length > 0 ? (
                                        <p>{JSON.stringify(earningsArray[0].totalEarning, null, 2)}</p>
                                    ) : (
                                        <p>0</p>
                                    )}
                                </div>
                            </div>

                        )}
                    </Col>
                    {/* <Col className="gutter-row flex flex-col gap-2" span={6}>
                        {(!selectedHub || selectedHub === "") ? (
                            earningData.map((earning, index) => {
                                const value = viewMode === "amount" ? earning.totalEarning.toFixed(2) : ((earning.totalEarning / totalEarningsAllHubs) * 100).toFixed(2) + ' %';
                                return (
                                    <div key={index} className="flex justify-between flex-col gap-2 p-2 border border-y-2 border-x-2 rounded-md px-4 bg-white">
                                        <div className={`category-value text-xl font-bold text-${index === 0 ? 'red' : index === 1 ? 'yellow' : 'green'}-500`}>
                                            {value}
                                        </div>
                                        <div className="category-title">
                                            {hubs.find(hub => hub._id === earning.hubId)?.location || earning.hubId}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div key={selectedHub} className="flex justify-between flex-col gap-2 p-2 border border-y-2 border-x-2 rounded-md px-4 bg-white">
                                <div className={`category-value text-xl font-bold text-red-500`}>
                                    {selectedHubName}
                                </div>
                                <div className="category-title">
                                    0
                                </div>
                            </div>
                        )}
                    </Col> */}
                    <Col className="gutter-row" span={18}>
                        <div className="flex justify-between items-center p-2 border border-y-2 border-x-2 rounded-md px-4">
                            <Chart
                                options={chartOptions}
                                series={series}
                                type="line"
                                width="100%"
                                style={{ minWidth: '600px', width: "100%", maxWidth: '800px', margin: '0 auto' }}
                                height='300'
                            />
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default DashboardEarningContainer;
