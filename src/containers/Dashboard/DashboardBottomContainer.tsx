import React, { useState, useEffect } from 'react';
import { Col, Row } from 'antd';
import Chart from "react-apexcharts";
import DashboardRecoveryContainer from './DashboardRecoveryContainer'
import DashboardMostTripsContainer from './DashboardMostTripsContainer'
import DashboardHubSpecificTripsContainer from './DashboardHubSpecificTripsContainer';

const DashboardBottomContainer = ({year,currentUserRole}) => {
    

    const selectedHub = localStorage.getItem("selectedHubID");
    return (
        <div>
            <div className='dashboard-material-container'>
            <Row gutter={24}>

                    <Col className="gutter-row" span={24}>
                    {(selectedHub ) &&                
                        <DashboardHubSpecificTripsContainer year={year} selectedHub={selectedHub} currentUserRole={currentUserRole}/>
                    }
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col className="gutter-row" span={12}>
                        <DashboardRecoveryContainer year={year} currentUserRole={currentUserRole} />
                    </Col>
                    <Col className="gutter-row" span={12}>
                    {(!selectedHub || selectedHub === "") &&                
                        <DashboardMostTripsContainer year={year} currentUserRole={currentUserRole} />
                    }
                    </Col>
                </Row>
            </div>

        </div>
    )
}

export default DashboardBottomContainer