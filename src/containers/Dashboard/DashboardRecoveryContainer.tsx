import React, { useState, useEffect } from 'react';
import { Col, Row, message } from 'antd';
import Chart from "react-apexcharts";
import { API } from "../../API/apirequest";

const formatIndianNumber = (number) => {
    if (number >= 10000000) {
        return (number / 10000000).toFixed(1) + ' Cr'; // Crore
    } else if (number >= 100000) {
        return (number / 100000).toFixed(1) + ' L'; // Lakh
    } else if (number >= 1000) {
        return (number / 1000).toFixed(1) + ' K'; // Thousand
    } else {
        return number.toString(); // Less than 1000
    }
};

const DashboardRecoveryContainer = ({year,currentUserRole}) => {
    const [recovery, setRecovery] = useState([{
        "recovery": 0, "unrecovery": 0
    }])
    const selectedHubId = localStorage.getItem("selectedHubID");
    const authToken = localStorage.getItem("token");
    const [chartOptions, setChartOptions] = useState({
        series: [],
        options: {
            chart: {
                type: 'donut',
                height: 350,
            },
            dataLabels: {
                enabled: false,
                formatter: function (val) {
                    return formatIndianNumber(val);
                },

            },
            labels: ['Recovered', 'Unrecovered'], // Labels for the donut segments
            stroke: {
                width: 1,
                colors: ['#fff']
            },
            // legend: {
            //     position: 'left',
            //     horizontalAlign: 'left',
            // },
            legend: {
                show: false, // Hide legends
                position: 'bottom',
                horizontalAlign: 'center',
                floating: false,
                fontSize: '14px',
                labels: {
                    useSeriesColors: true,
                },
                markers: {
                    width: 12,
                    height: 12,
                    radius: 12,
                },
                itemMargin: {
                    horizontal: 10,
                    vertical: 5
                },
            },
            colors: ['#D0AC09', '#009CD0'],
        }
    });
    const headersOb = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
        }
    };

    const fetchRecoveryData = async () => {
        try {
            let url;
            if(selectedHubId || currentUserRole =="Accountant"){
                url=`get-recovery-data?entryYear=${year}&hubId=${selectedHubId}`
            }else{
                url=`get-recovery-data?entryYear=${year}`
            }
            console.log(url)
            const response = await API.get(url, headersOb);
            const { data } = response;
            const recovered = data.totalRecovered;
            const unrecovered = data.totalValue;
            setRecovery([{
                "recovery": recovered, "unrecovery": unrecovered
            }])
            setChartOptions((prevOptions) => ({
                ...prevOptions,
                series: [recovered, unrecovered]
            }));
        } catch (error) {
            console.error('Failed to fetch recovery data:', error);
            message.error('Failed to fetch recovery data.');
        }
    };
    useEffect(() => {
        
        fetchRecoveryData();
    }, [selectedHubId]);

    

    return (
        <div className='dashboard-recovery-container'>
            <Row gutter={24}>
                <Col className="gutter-row" span={24}>
                    <div className="flex justify-between  flex-start p-2 border border-y-2 border-x-2 rounded-md px-4  min-h-[382px]">

                        <div className="flex flex-col gap-3 ">
                            <div className="flex justify-between items-center font-bold text-xl">
                                <h1>Recovery</h1>
                            </div>
                            <div className=" flex flex-col gap-1 font-bold text-[1rem]">
                                <span className='text-[#D0AC09] text-[1.2rem]'>
                                    {JSON.stringify(recovery[0].recovery)}
                                    </span>
                                Recovered
                            </div>
                            <div className=" flex flex-col gap-1 font-bold text-[1rem]">
                                <span className='text-[#009CD0] text-[1.2rem]'>
                                    {JSON.stringify(recovery[0].unrecovery)}
                                    </span>
                                Unrecovered
                            </div>
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
