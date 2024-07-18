import React, { useState, useEffect } from 'react';
import { Col, Row } from 'antd';
import Chart from "react-apexcharts";
import DashboardRecoveryContainer from './DashboardRecoveryContainer'
import DashboardMostTripsContainer from './DashboardMostTripsContainer'

const DashboardBottomContainer = () => {
    return (
        <div>
            <div className='dashboard-material-container'>
                <Row gutter={24}>
                    <Col className="gutter-row" span={12}>
                        <DashboardRecoveryContainer />
                    </Col>
                    <Col className="gutter-row" span={12}>
                        <DashboardMostTripsContainer />
                    </Col>
                </Row>
            </div>

        </div>
    )
}

export default DashboardBottomContainer