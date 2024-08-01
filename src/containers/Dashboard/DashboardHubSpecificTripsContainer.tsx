import React, { useState, useEffect } from 'react';
import { Col, Row } from 'antd';
import Chart from "react-apexcharts";
import { API } from "../../API/apirequest";

const monthIndexMap = {
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "September",
    10: "October",
    11: "November",
    12: "December"
};

const DashboardHubSpecificTripsContainer = ({ year,selectedHub,currentUserRole,loadLocation,deliveryLocation }) => {

    const [totalTrips, setTotalTrips] = useState(0);
    // const selectedHub = localStorage.getItem("selectedHubID");
    // const selectedHubName = localStorage.getItem("selectedHubName");
    const authToken = localStorage.getItem("token");
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
                categories: [], // Month labels
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

    const headersOb = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
        }
    };
    const fetchData = async () => {
        try {
            // const payload = {
            //     "hubIds": (selectedHub || currentUserRole == "Accountant" ? [selectedHub] : [])
            // };
            let payload;
            if (loadLocation !== null && loadLocation !== undefined && deliveryLocation !== null && deliveryLocation !== undefined) { 
               payload = {
                    "hubIds":(selectedHub || currentUserRole == "Accountant" ? [selectedHub] : []),
                    loadLocation:loadLocation,
                    deliveryLocation:deliveryLocation,
                };
            }else{
                payload = {
                        "hubIds": (selectedHub || currentUserRole == "Accountant" ? [selectedHub] : [])
                    };
            }
            const response = await API.post(`get-total-trips?entryYear=${year}`, payload, headersOb);
            //             setEarningData(response.data.currentEarningData);
            // const response = await API.get(`get-total-trips?entryYear=2024`, headersOb);
            const data = response.data.totalTrip;

            const monthData = Array(12).fill(0); // Initialize array for 12 months
            let total = 0;

            // Process data
            data.forEach(item => {
                const month = monthIndexMap[item._id];
                if (month) {
                    item.hubs.forEach(hub => {
                        if (hub.hubId === selectedHub) {
                            monthData[item._id - 1] += hub.tripCount;
                            total += hub.tripCount;
                        }
                    });
                }
            });

            // Prepare chart data
            const categories = Object.values(monthIndexMap);
            const seriesData = monthData;

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

            setTotalTrips(total);

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedHub,loadLocation,deliveryLocation]); // Fetch data whenever selectedHub changes

    return (
        <div className='dashboard-hub-specific-trips-container my-2'>
            <Row gutter={24}>
                <Col className="gutter-row" span={24}>
                    <div className="flex justify-between flex-col flex-start p-2 border border-y-2 border-x-2 rounded-md px-4">
                        <div className="flex justify-between items-center p-2 font-bold text-xl">
                            <h1>Monthly Trips</h1>
                            <div className="total-trips mt-4 text-xl font-bold">
                                Total Trips: {totalTrips}
                            </div>

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

export default DashboardHubSpecificTripsContainer;
