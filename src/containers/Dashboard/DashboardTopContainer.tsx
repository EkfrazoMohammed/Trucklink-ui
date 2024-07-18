import React from 'react'
import { Col, Row } from 'antd';
import TripIcon from "../../assets/Trips.png"
import QuantityIcon from "../../assets/Quantity.png"
import RevenueIcon from "../../assets/Revenue.png"
import CommissionIcon from "../../assets/Commission.png"

const DashboardTopContainer = ({data}) => {
   
    const tripData = !data || data.length === 0 ? 0 : data[0].trips;
    const revenueData = !data || data.length === 0 ? 0 : data[0].revenue;

    const commissionData = !data || data.length === 0 ? 0 : data[0].commission;
    const quantityData = !data || data.length === 0 ? 0 : data[0].quantity;
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
            icon:RevenueIcon
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
            {!data || data.length === 0 ? <>
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
                                    <div className='flex'><img src={item.icon} alt="" className='w-16 h-12'/></div>
                                </div>

                            </Col>
                        </>
                    )
                })}

            </Row>
            
            </>:<>
            <Row gutter={16}>
                {topData.map((item, i) => {
                    return (
                        <>

                            <Col className="gutter-row" span={6}>
                                <div className="flex justify-between items-center p-2 border border-y-2 border-x-2  rounded-md px-4">
                                    <div className="flex flex-col gap-1">
                                        <div className='flex font-semibold text-xl'>{item.value}</div>
                                        <div className='flex font-medium text-md'>{item.title}</div>
                                    </div>
                                    <div className='flex'><img src={item.icon} alt="" className='w-16 h-12'/></div>
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