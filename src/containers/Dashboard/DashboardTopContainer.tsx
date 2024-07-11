import React from 'react'
import { Col, Row } from 'antd';
import TripIcon from "../../assets/Trips.png"
import QuantityIcon from "../../assets/Quantity.png"
import RevenueIcon from "../../assets/Revenue.png"
import CommissionIcon from "../../assets/Commission.png"

const DashboardTopContainer = () => {

    const topData = [
        {
            title: "Trips",
            value: "10",
            icon: TripIcon
        },
        {
            title: "Revenue",
            value: `₹ ${10}`,
            icon:RevenueIcon
        },
        {
            title: "Commission",
            value: `₹ ${10}`,
            icon: CommissionIcon
        }
        , {
            title: "Quantity",
            value: "10",
            icon: QuantityIcon
        }
    ]
    return (
        <div className='dashboard-top-container'>
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
        </div>
    )
}

export default DashboardTopContainer