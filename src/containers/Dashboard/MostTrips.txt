import React, { useState } from 'react';
import { Col, Row } from 'antd';
import Chart from "react-apexcharts";

const DashboardMostTripsContainer = () => {
    const [chartOptions, setChartOptions] = useState({
        series: [
            {
                name: 'Trips',
                data: [70, 40, 60] // Values for Bengaluru, Chennai, Kolkata
            }
        ],
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
                categories: ['Bengaluru', 'Chennai', 'Kolkata'], // City labels
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

    return (
        <div className='dashboard-most-trips-container'>
            <Row gutter={24}>
                <Col className="gutter-row" span={24}>
                    <div className="flex justify-between flex-col flex-start p-2 border border-y-2 border-x-2 rounded-md px-4">
                        <div className="flex justify-between items-center p-2 font-bold text-xl">
                            <h1>Most Trips</h1>
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
