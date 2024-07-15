import React, { useState } from 'react';
import { Col, Row } from 'antd';
import Chart from 'react-apexcharts';

const DashboardExpenseContainer = () => {
    const [selectedSeries, setSelectedSeries] = useState(null);

    const allSeries = [
        {
            name: 'Diesel',
            data: [30, 40, 45, 50, 49, 60, 70, 91, 60, 38, 33, 11],
            color: '#FF4560'
        },
        {
            name: 'Cash',
            data: [20, 30, 35, 40, 39, 50, 60, 81, 50, 28, 23, 21],
            color: '#FEB019'
        },
        {
            name: 'Bank Transfer',
            data: [10, 20, 25, 30, 29, 40, 50, 71, 40, 18, 13, 1],
            color: '#00E396'
        },
        {
            name: 'Shortage',
            data: [5, 10, 15, 20, 19, 30, 40, 61, 30, 8, 3, 0],
            color: '#775DD0'
        }
    ];

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
                download: false,
                selection: false,
                zoom: false,
                zoomin: false,
                zoomout: false,
                pan: false,
                reset: false,
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

    const handleCardClick = (seriesName) => {
        if (selectedSeries && selectedSeries[0].name === seriesName) {
            setSelectedSeries(null);
        } else {
            const newSeries = allSeries.filter(series => series.name === seriesName);
            setSelectedSeries(newSeries);
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
                            <div className="flex justify-between flex-col  p-2 ">
                                <div className="category-value text-xl font-bold text-red-500">
                                    ₹ 1,20,000
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
                                        ₹ {series.data.reduce((a, b) => a + b, 0)}
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
                                style={{ minWidth: '600px',width:"100%",maxwidth: '800px',margin: '0 auto' }}
                                
                                height="350"
                            />
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    )
}

export default DashboardExpenseContainer;