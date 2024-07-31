import React, { useState, useEffect } from 'react';
import { Col, Row, Radio, Select } from 'antd';
import Chart from "react-apexcharts";

import { API } from "../../API/apirequest";

const DashboardMostTripsContainer = ({year,currentUserRole}) => {
    const [hubs, setHubs] = useState([]);
    const [select3HubId, setSelect3HubId] = useState([]);
    const handleChange = (value) => {
        if (value.length <= 3) {
            setSelect3HubId(value);
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
    
   
    const [chartOptions, setChartOptions] = useState({
        series: [],
        options: {
            chart: {
                type: 'bar',
                height: 350,
                stacked: false, // Unstacked bar chart
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    barWidth: '20px', // Width of each bar
                },
            },
            dataLabels: {
                enabled: false,
            },
            xaxis: {
                categories: [], // City labels
            },
            colors: ['#009CD0'], // Bar colors
            stroke: {
                show: true,
                width: 1,
                colors: ['#fff']
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return val + " trips"; // Tooltip format
                    }
                }
            },
            legend: {
                show: true,
            },
        }
    });
    const authToken = localStorage.getItem("token");

  
    const headersOb = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
        }
    };

    const fetchData = async () => {
        try {
            // const response = await API.get(`get-total-trips?entryYear=2024`, headersOb);

            // const data = response.data.totalTrip;
           
            const payload = {
                "hubIds": (select3HubId.length > 0 ? select3HubId : [])
            };
            const response = await API.post(`get-total-trips?entryYear=${year}`, payload, headersOb);
            //             setEarningData(response.data.currentEarningData);
            // const response = await API.get(`get-total-trips?entryYear=2024`, headersOb);
            const data = response.data.totalTrip;
            const cityData = {};
            
            // Process data
            data.forEach(item => {
                item.hubs.forEach(hub => {
                    if (cityData[hub.hubName]) {
                        cityData[hub.hubName] += hub.tripCount;
                    } else {
                        cityData[hub.hubName] = hub.tripCount;
                    }
                });
            });

            // Prepare chart data
            const categories = Object.keys(cityData);
            const seriesData = Object.values(cityData);

            setChartOptions({
                series: [
                    {
                        name: 'Trips',
                        data: seriesData
                    }
                ],
                options: {
                    ...chartOptions.options,
                    xaxis: {
                        categories: categories,
                    }
                }
            });

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        fetchData();
    }, [year, select3HubId]);

    return (
        <div className='dashboard-most-trips-container'>
            <Row gutter={24}>
                <Col className="gutter-row" span={24}>
                    <div className="flex justify-between flex-col flex-start p-2 border border-y-2 border-x-2 rounded-md px-4">
                        <div className="flex justify-between items-center p-2 font-bold text-xl">
                            <h1>Most Trips</h1>

                            {/* {(!selectedHub || selectedHub === "") && */}
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
                                {/* } */}
                        </div>
                        <Chart
                            options={chartOptions.options}
                            series={chartOptions.series}
                            type="bar"
                            width="100%"
                            style={{ minWidth: '200px', width: "100%", margin: '0 auto' }}
                            height='300'
                        />
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardMostTripsContainer;
