import React, { useState, useEffect } from 'react';
import type { DatePickerProps } from 'antd';
import { DatePicker } from 'antd';
import DashboardEarningContainer from "./DashboardEarningContainer";
import DashboardExpenseContainer from "./DashboardExpenseContainer";
import DashboardMaterialContainer from "./DashboardMaterialContainer";
import DashboardTopContainer from "./DashboardTopContainer";
import { API } from "../../API/apirequest";

const DashboardContainer = () => {
  const authToken = localStorage.getItem("token");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const headersOb = {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${authToken}`
    }
  };
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [topContainerData, setTopContainerData] = useState<any>([]);

  const getTopData = async (year: number) => {
    setLoading(true);
    try {
      const res = await API.get(`get-dashboard-revenue?year=${year}`, headersOb);
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
    getTopData(currentYear);
  }, [currentYear]);
  const onChange: DatePickerProps['onChange'] = (date, dateString) => {
    const selectedYear = date ? date.year() : new Date().getFullYear();
    setCurrentYear(selectedYear);
  };

  return (
    <>
      <div>
        Dashboard Container
      </div>
      <div>
        <DatePicker onChange={onChange} picker="year" size="large" />
      </div>
      <DashboardTopContainer data={topContainerData} />
      <DashboardEarningContainer />
      <DashboardExpenseContainer />
      <DashboardMaterialContainer />
    </>
  );
};

export default DashboardContainer;
