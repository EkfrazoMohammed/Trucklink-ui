
import React from 'react'
import { Col, Row, Radio, Select, Space } from 'antd';

import Chart from "react-apexcharts";

const DashboardEarningContainer = () => {
  
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
            categories: ['0', 'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'],
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
                        return new Date(x).toDateString()
                    },
                    valueFormatter(y) {
                        return y
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
    const series = [
        {
            name: "%",
            data: [0, 30, 40, 45, 50, 49, 60, 70, 91, 60, 38, 33, 11]
        }
    ]

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
                                <Radio.Group >
                                    <Radio.Button value="middle">%</Radio.Button>
                                    <Radio.Button value="large">Amount</Radio.Button>

                                </Radio.Group>

                            </div>

                        </div>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col className="gutter-row flex flex-col gap-2" span={6}>

                        <div className="flex justify-between flex-col gap-2  p-2 border border-y-2 border-x-2  rounded-md px-4 bg-white">
                            <div className="category-value text-xl font-bold text-red-500">
                                20 %
                            </div>
                            <div className="category-title">
                                BENGALURU
                            </div>
                        </div>
                        <div className="flex justify-between flex-col gap-2  p-2 border border-y-2 border-x-2  rounded-md px-4 bg-white">
                            <div className="category-value text-xl font-bold text-yellow-500">
                                20 %
                            </div>
                            <div className="category-title">
                                CHENNAI
                            </div>
                        </div>
                        <div className="flex justify-between flex-col gap-2  p-2 border border-y-2 border-x-2  rounded-md px-4 bg-white">
                            <div className="category-value text-xl font-bold text-green-500">
                                20 %
                            </div>
                            <div className="category-title">
                                HYDERABAD
                            </div>
                        </div>

                    </Col>
                    <Col className="gutter-row" span={18}>

                        <div className="flex justify-between items-center p-2 border border-y-2 border-x-2  rounded-md px-4">
                            <Chart
                                options={chartOptions}
                                series={series}
                                type="line"
                                width="100%"
                                style={{ minWidth: '600px',width:"100%",maxwidth: '800px',margin: '0 auto' }}
                                height='300'
                            />
                        </div>
                    </Col>
                </Row>
            </div>

        </div>
    )
}

export default DashboardEarningContainer

