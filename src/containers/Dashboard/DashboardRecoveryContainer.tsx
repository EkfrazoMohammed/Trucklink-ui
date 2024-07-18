import React, { useState, useEffect } from 'react';
import { Col, Row } from 'antd';
import Chart from "react-apexcharts";

const DashboardRecoveryContainer = () => {
    const a = [30, 70]
   
    const [chartOptions, setChartOptions] = useState({
        series: a,
        options: {
            chart: {
                type: 'donut',
                height: 350,
            },
            dataLabels: {
                enabled: true,
                formatter: function (val) {
                    return val + "K"
                },
            },
            labels: ['Recovered', 'Unrecovered'], // Labels for the donut segments
            stroke: {
                width: 1,
                colors: ['#fff']
            },
            legend: {
                position: 'left',
                horizontalAlign: 'left',
            },
            colors: ['#D0AC09','#009CD0'],
          
        }
    });


    return (
        <div className='dashboard-recovery-container'>
            <Row gutter={24}>
                <Col className="gutter-row" span={24}>
                        <div className="flex justify-between flex-col flex-start p-2 border border-y-2 border-x-2 rounded-md px-4">
                            <div className="flex justify-between items-center p-2 font-bold text-xl">
                                <h1>Recovery</h1>
                            </div>
                            <Chart
                                options={chartOptions.options}
                                series={chartOptions.series}
                                type="donut"
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

export default DashboardRecoveryContainer;
