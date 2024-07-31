import React, { useState, useEffect } from 'react';
import type { DatePickerProps } from 'antd';
import { RedoOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import { API } from "../../API/apirequest";
import { DatePicker, Input, Select, Space, Button, Upload, Tabs, Tooltip, Breadcrumb, Col, List, Row, Switch, Modal } from 'antd';

import DashboardTopContainer from "./DashboardTopContainer";
import DashboardEarningContainer from "./DashboardEarningContainer";
import DashboardExpenseContainer from "./DashboardExpenseContainer";
import DashboardMaterialContainer from "./DashboardMaterialContainer";
import DashboardBottomContainer from './DashboardBottomContainer';

// Filter `option.value` match the user type `input`
const filterOption = (input: string, option?: { label: string; value: string }) =>
  (option?.value ?? '').toLowerCase().includes(input.toLowerCase());

const onSearch = (value: string) => {
  console.log('search:', value);
};

const DashboardContainer = () => {
  const selectedHubId = localStorage.getItem("selectedHubID");
  
  const currentUserRole = localStorage.getItem("userRole")
  const authToken = localStorage.getItem("token");
  // const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentYear, setCurrentYear] = useState<number>(dayjs().year());

  const onChange: DatePickerProps['onChange'] = (date, dateString) => {
    const selectedYear = date ? dayjs(date).year() : dayjs().year();
    setCurrentYear(selectedYear);
  };

  const [loadLocation, setloadLocations] = useState([]);
  // Function to fetch LoadLocations from the API
  const fetchLoadLocations = async () => {
    try {
      const headersOb = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        }
      }
      const response = await API.get(`get-load-location/${selectedHubId}`, headersOb);
      if (response.status == 201) {
        setloadLocations(response.data.materials);
      } else {
        console.log("error in fetchLoadLocations")
      }

    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const [deliveryLocation, setDeliveryLocations] = useState([]);
  // Function to fetch DeliveryLocations from the API
  const fetchDeliveryLocations = async () => {
    try {
      const headersOb = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        }
      }
      const response = await API.get(`get-delivery-location/${selectedHubId}`, headersOb);
      setDeliveryLocations(response.data.materials);
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };
  // Fetch materials on component mount
  useEffect(() => {
    fetchLoadLocations();
    fetchDeliveryLocations();
  }, [selectedHubId]);

  const [formData, setFormData] = useState(
    {
      "deliveryLocation": null,
      "loadLocation": null,
    }
  );
  const handleChange = (name, value) => {

    // For other fields, update state normally
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));

  };

  const onReset = () => {
    setCurrentYear(dayjs().year())
    setloadLocations([])
    setDeliveryLocations([])
    setFormData({
      "deliveryLocation": null,
      "loadLocation": null,
    })
  };

  return (
    <>
      <div>
        Dashboard Container
      </div>
      <div className='flex items-center gap-2 my-2'>

        <DatePicker
          onChange={onChange}
          picker="year"
          size="large"
          value={dayjs(new Date(currentYear, 0, 1))}
        />
        {!selectedHubId || selectedHubId === "" ?

          <></>
          :
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
            <Col className="gutter-row">
              <Select
                name="loadLocation"
                onChange={(value) => handleChange('loadLocation', value)}
                placeholder="Load Location*"
                size="large"
                style={{ width: '100%' }}
                showSearch
                value={formData.loadLocation}
                optionFilterProp="children"
                filterOption={filterOption}
              >
                {loadLocation.map((v, index) => (
                  <Option key={index} value={v.location}>
                    {`${v.location}`}
                  </Option>
                ))}
              </Select>

            </Col>
            <Col className="gutter-row" >
              <Select
                name="deliveryLocation"
                onChange={(value) => handleChange('deliveryLocation', value)}
                placeholder="Delivery Location*"
                size="large"
                showSearch
                value={formData.deliveryLocation}
                optionFilterProp="children"
                filterOption={filterOption}
                style={{ width: '100%' }}
              >
                {deliveryLocation.map((v, index) => (
                  <Option key={index} value={v.location}>
                    {`${v.location}`}
                  </Option>
                ))}
              </Select>
            </Col>

          </Row>
        }

        <Button size='large' onClick={onReset} style={{ rotate: "180deg" }} icon={<RedoOutlined />}></Button>
      </div>
      <DashboardTopContainer year={currentYear} loadLocation={formData.loadLocation} deliveryLocation={formData.deliveryLocation} currentUserRole={currentUserRole}/>
      <DashboardEarningContainer year={currentYear} currentUserRole={currentUserRole}/>
      <DashboardExpenseContainer year={currentYear} currentUserRole={currentUserRole}/>
      <DashboardMaterialContainer year={currentYear} currentUserRole={currentUserRole}/>
      <DashboardBottomContainer year={currentYear} currentUserRole={currentUserRole} />
    </>
  );
};

export default DashboardContainer;
