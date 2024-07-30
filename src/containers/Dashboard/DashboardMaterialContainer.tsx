import React, { useState, useEffect } from 'react';
import { Col, Row } from 'antd';
import Chart from "react-apexcharts";

import { API } from "../../API/apirequest";

const DashboardMaterialContainer = () => {
    const selectedHubId = localStorage.getItem("selectedHubID");
    const authToken = localStorage.getItem("token");
   
    const [chartOptions, setChartOptions] = useState({
        series: [],
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
        xaxis: {
            categories: ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'],
        },
        // yaxis: {
        //     title: {
        //         text: undefined
        //     },
        // },
        yaxis: {
            labels: {
                formatter: function (value) {
                    return value + " Tons";
                    // return value >= 100000 ? (value / 100000).toFixed(1) + 'L' : value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value;
                    // return (value >= 1000 ? (value / 1000).toFixed(1) + 'Tons' : value  + " Tons");
                }
            }
        },
        fill: {
            opacity: 1
        },
        legend: {
            position: 'left',
            horizontalAlign: 'left',
        },
        tooltip: {
            enabled: true,
            shared: true,
            intersect: false,
            y: {
                formatter: function (value) {
                    return value + " Tons";
                //    return (value >= 1000 ? (value / 1000).toFixed(1) + 'Tons' : value  + " Tons");
                }
            }
        }
    });
    const fetchMaterialTypesData = async () => {
        try {
          const headersOb = {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${authToken}`
            }
          }
          const response = await API.get(`get-material-type-chart?entryYear=2024`, headersOb).then((res=>{

          if (res.status == 201 || res.status == 200) {
            console.log(res)
            const { materialType } = res.data;

        // Initialize data structure
        const materials = {};

        // Initialize each month for all material types
        const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
        months.forEach((month, index) => {
            materials[month] = {};
        });

        // Process API data
        materialType.forEach(item => {
            const monthIndex = item._id.month - 1;
            const monthName = months[monthIndex];
            item.amounts.forEach(amountItem => {
                if (!materials[monthName][amountItem.materialType]) {
                    materials[monthName][amountItem.materialType] = 0;
                }
                // materials[monthName][amountItem.materialType] += amountItem.amount;
                materials[monthName][amountItem.materialType] += amountItem.quantity;
            });
        });

        // Prepare series data
        const seriesData = [];
        const materialTypes = new Set();
        months.forEach(month => {
            Object.keys(materials[month]).forEach(materialType => {
                materialTypes.add(materialType);
            });
        });

        materialTypes.forEach(materialType => {
            const data = months.map(month => materials[month][materialType] || 0);
            seriesData.push({
                name: materialType,
                data: data
            });
        });

        // Update chart options
        setChartOptions(prevOptions => ({
            ...prevOptions,
            series: seriesData
        }));
            // setloadLocations(response.data.materials);
          }
        }))
        } catch (error) {
          console.error('Error fetching materials:', error);
        }
      };
    useEffect(() => {
      

          fetchMaterialTypesData()
     
    }, []);

    return (
        <div className='dashboard-material-container'>
            <div className="cards-container">
                <Row gutter={24}>
                    <Col className="gutter-row" span={24}>
                        <div className="flex justify-between flex-col flex-start p-2 border border-y-2 border-x-2 rounded-md px-4">
                            <div className="flex justify-between items-center p-2 font-bold text-xl">
                                <h1>Material Load Trend</h1>
                            </div>
                            <Chart
                                options={chartOptions}
                                series={chartOptions.series}
                                type="bar"
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
