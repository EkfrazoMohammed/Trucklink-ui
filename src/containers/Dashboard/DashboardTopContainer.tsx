import React, { useState, useEffect } from 'react';
import { Col, Row } from 'antd';

import { API } from "../../API/apirequest";
import TripIcon from "../../assets/Trips.png"
import QuantityIcon from "../../assets/Quantity.png"
import RevenueIcon from "../../assets/Revenue.png"
import CommissionIcon from "../../assets/Commission.png"

const DashboardTopContainer = ({ year }) => {
    const selectedHub = localStorage.getItem("selectedHubID");
    const selectedHubName = localStorage.getItem("selectedHubName");

    const authToken = localStorage.getItem("token");

    const [topContainerData, setTopContainerData] = useState<any>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const headersOb = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
        }
    };

    const getTopData = async (year: number) => {
        setLoading(true);
        try {
            let res;
            if(!selectedHub || selectedHub === ""){
                res= await API.get(`get-dashboard-revenue?year=${year}`, headersOb);

            }else{
                res= await API.get(`get-dashboard-revenue?year=${year}&hubId=${selectedHub}`, headersOb);

            }
            if (res.status === 201) {
                setTopContainerData(res.data.dispatchData);
            } else {
                setTopContainerData([]);
            }
        } catch (error) {
            setError("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        getTopData(year);
    }, [year, selectedHub,]); 
    useEffect(() => {
        getTopData(year);
    }, []); 


    const tripData = !topContainerData || topContainerData.length === 0 ? 0 : topContainerData[0].trips;
    const revenueData = !topContainerData || topContainerData.length === 0 ? 0 : topContainerData[0].revenue;

    const commissionData = !topContainerData || topContainerData.length === 0 ? 0 : topContainerData[0].commission;
    const quantityData = !topContainerData || topContainerData.length === 0 ? 0 : topContainerData[0].quantity;
    // Helper function to format number in Indian style
    const formatNumberToIndianStyle = (number) => {
        if (number === 0) return '0';
        return number.toLocaleString('en-IN');
    };
    // console.log(JSON.stringify(data[0].trips, null,2))
    const topData = [
        {
            title: "Trips",
            value: formatNumberToIndianStyle(tripData),
            icon: TripIcon
        },
        {
            title: "Revenue",
            value: `₹ ${formatNumberToIndianStyle(revenueData)}`,
            icon: RevenueIcon
        },
        {
            title: "Commission",
            value: `₹ ${formatNumberToIndianStyle(commissionData)}`,
            icon: CommissionIcon
        }
        , {
            title: "Quantity",
            value: formatNumberToIndianStyle(quantityData),
            icon: QuantityIcon
        }
    ]
    return (
        <div className='dashboard-top-container'>
            {!topContainerData || topContainerData.length === 0 ? <>
                <Row gutter={16}>
                    {topData.map((item, i) => {
                        return (
                            <>

                                <Col className="gutter-row" span={6}>
                                    <div className="flex justify-between items-center p-2 border border-y-2 border-x-2  rounded-md px-4">
                                        <div className="flex flex-col gap-1">
                                            <div className='flex font-semibold text-xl'>0</div>
                                            <div className='flex font-medium text-md'>{item.title}</div>
                                        </div>
                                        <div className='flex'><img src={item.icon} alt="" className='w-16 h-12' /></div>
                                    </div>

                                </Col>
                            </>
                        )
                    })}

                </Row>

            </> : <>
                <Row gutter={16}>
                    {topData.map((item, i) => {
                        return (
                            <>

                                <Col className="gutter-row" span={6}>
                                    <div className="flex justify-between  items-start p-2 bg-[#F5FCFF]  rounded-md px-4">
                                        <div className="flex flex-col gap-1">
                                            <div className='flex font-semibold text-xl'>{item.value}</div>
                                            <div className='flex font-semibold text-md'>{item.title}</div>
                                        </div>
                                        <div className='flex justify-start items-start'><img src={item.icon} alt="" className='w-8 h-8 max-w-8 max-h-8' /></div>
                                    </div>

                                </Col>
                            </>
                        )
                    })}

                </Row>
            </>}

        </div>
    )
}

export default DashboardTopContainer