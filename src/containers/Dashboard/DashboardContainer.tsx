import React, { useState, useEffect } from 'react';
import type { DatePickerProps } from 'antd';
import { RedoOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { DatePicker, Button } from 'antd';
import DashboardTopContainer from "./DashboardTopContainer";
import DashboardEarningContainer from "./DashboardEarningContainer";
import DashboardExpenseContainer from "./DashboardExpenseContainer";
import DashboardMaterialContainer from "./DashboardMaterialContainer";
import DashboardBottomContainer from './DashboardBottomContainer';

const DashboardContainer = () => {
   // const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentYear, setCurrentYear] = useState<number>(dayjs().year());
  const onReset = () => {
    setCurrentYear(dayjs().year())
  };

  const onChange: DatePickerProps['onChange'] = (date, dateString) => {
    const selectedYear = date ? dayjs(date).year() : dayjs().year();
    setCurrentYear(selectedYear);
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

        <Button size='large' onClick={onReset} style={{ rotate: "180deg" }} icon={<RedoOutlined />}></Button>
      </div>
      <DashboardTopContainer year={currentYear} />
      <DashboardEarningContainer year={currentYear} />
      {/* <DashboardExpenseContainer year={currentYear}/>
      <DashboardMaterialContainer />
      <DashboardBottomContainer />  */}
    </>
  );
};

export default DashboardContainer;
