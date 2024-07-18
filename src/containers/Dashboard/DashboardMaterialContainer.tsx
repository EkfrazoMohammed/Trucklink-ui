import React, { useState } from 'react';
import { Col, Row } from 'antd';
import Chart from "react-apexcharts";

const DashboardMaterialContainer = () => {
    const [chartOptions, setChartOptions] = useState({
        series: [
            {
                name: 'CEMENT',
                data: [44, 55, 41, 37, 22, 43, 21,5,22,43,11,23]
            },
            {
                name: 'FLYASH',
                data: [25, 12, 19, 32, 25, 24, 10,44, 55, 41, 37]
            },
            {
                name: 'GYPSUM',
                data: [53, 32, 33, 52, 12, 19, 32, 25, 24, 10,44]
            },
            {
                name: 'COAL',
                data: [12,32, 33, 52, 12, 19, 32, 25,  15, 11, 20,33]
            },
            {
                name: 'SAND',
                data: [9,53, 32, 33, 52, 12, 19, 32, 25,]
            },
            
        ],
        chart: {
            type: 'bar',
            height: 350,
            stacked: true,
        },
        plotOptions: {
            bar: {
                horizontal: false,
                dataLabels: {
                    total: {
                        enabled: false,
                        offsetX: 0,
                        style: {
                            fontSize: '13px',
                            fontWeight: 900
                        }
                    }
                }
            },
        },
        stroke: {
            width: 1,
            colors: ['#fff']
        },
        // title: {
        //     text: 'Fiction Books Sales'
        // },
        xaxis: {
            categories: ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'],
          
            // labels: {
            //     formatter: function (val) {
            //         return val + "K";
            //     }
            // }
        },
        yaxis: {
            title: {
                text: undefined
            },
        },
        tooltip: {
            // y: {
            //     formatter: function (val) {
            //         return val + "K";
            //     }
            // }
        },
        fill: {
            opacity: 1
        },
        legend: {
            position: 'left',
            horizontalAlign: 'left',
            // offsetX: 40
        }
    });

    return (
        <div className='dashboard-material-container'>
            <div className="cards-container">
                <Row gutter={24} className='flex items-center'>
                   
                </Row>
                <Row gutter={24}>
                    <Col className="gutter-row" span={24}>

                        <div className="flex justify-between flex-col flex-start p-2 border border-y-2 border-x-2 rounded-md px-4">
                        <div className="flex justify-between items-center p-2 font-bold text-xl">
                            <h1>Material Load Trend</h1>
                        </div>
                            <Chart
                                options={chartOptions}
                                series={chartOptions.series} // Add series here
                                type="bar" // Add chart type here
                                width="100%"
                                style={{ minWidth: '600px', width: "100%", margin: '0 auto' }}
                                height='300'
                            />
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default DashboardMaterialContainer;
