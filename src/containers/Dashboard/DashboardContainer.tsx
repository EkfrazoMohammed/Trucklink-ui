import React, { useState, useEffect } from 'react';
import type { DatePickerProps } from 'antd';
import { API } from "../../API/apirequest";
import { RedoOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { DatePicker, Button } from 'antd';
import DashboardEarningContainer from "./DashboardEarningContainer";
import DashboardExpenseContainer from "./DashboardExpenseContainer";
import DashboardMaterialContainer from "./DashboardMaterialContainer";
import DashboardTopContainer from "./DashboardTopContainer";
import DashboardBottomContainer from './DashboardBottomContainer';

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
  // const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentYear, setCurrentYear] = useState<number>(dayjs().year());
  const onReset = () => {
    setCurrentYear(dayjs().year())
  };
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
  }, [currentYear]); // This useEffect will run whenever currentYear changes

  const onChange: DatePickerProps['onChange'] = (date, dateString) => {
    const selectedYear = date ? dayjs(date).year() : dayjs().year();
    setCurrentYear(selectedYear);
  };
  // const onChange: DatePickerProps['onChange'] = (date, dateString) => {
  //   const selectedYear = date ? date.year() : new Date().getFullYear();
  //   setCurrentYear(selectedYear);
  // };
  // const onChange: DatePickerProps['onChange'] = (date, dateString) => {
  //   console.log(date)
  //   const selectedYear = date ? date.getFullYear() : new Date().getFullYear();
  //   setCurrentYear(selectedYear);
  // };


  return (
    <>
      <div>
        Dashboard Container
      </div>
       {/* <div className='flex items-center gap-2 my-2'>

        <DatePicker
          onChange={onChange}
          picker="year"
          size="large"
          value={dayjs(new Date(currentYear, 0, 1))}
        />

        <Button size='large' onClick={onReset} style={{ rotate: "180deg" }} icon={<RedoOutlined />}></Button>
      </div>
      <DashboardTopContainer data={topContainerData} />
      <DashboardEarningContainer year={currentYear}/>
      <DashboardExpenseContainer />
      <DashboardMaterialContainer />
      <DashboardBottomContainer />  */}
    </>
  );
};

export default DashboardContainer;
