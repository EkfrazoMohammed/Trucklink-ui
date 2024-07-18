import React, { useState, useEffect } from 'react';
import type { DatePickerProps } from 'antd';
import { DatePicker, Space } from 'antd';
import DashboardEarningContainer from "./DashboardEarningContainer"
import DashboardExpenseContainer from "./DashboardExpenseContainer"
import DashboardMaterialContainer from "./DashboardMaterialContainer"
import DashboardTopContainer from "./DashboardTopContainer"
import { API } from "../../API/apirequest";
const DashboardContainer = () => {

  const authToken = localStorage.getItem("token");

  const headersOb = {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${authToken}`
    }
  }
  const [topContainerData, setTopContainerData] = useState<any>([]);
  const getTopData = () => {
    try {

      const res = API.get("get-dashboard-revenue?year=2024", headersOb)
        .then((res) => {
          console.log(res)

          if (res.status == 201) {
            setTopContainerData(res.data.dispatchData)
          } else {
            setTopContainerData([])

          }
        }).catch((error) => {
          console.log(error)
        })

    } catch (err) {
      console.log(err)
    }

  }
  useEffect(() => {
    console.log('first')
    getTopData()
  }, [])
  const onChange: DatePickerProps['onChange'] = (date, dateString) => {
    console.log(date, dateString);
  };
  return (
    <>
      <div>
        Dashboard Container
      </div>
      {/* <div>
        <DatePicker onChange={onChange} picker="year" size="large" />
      </div>

      <DashboardTopContainer data={topContainerData} />
      <DashboardEarningContainer />
      <DashboardExpenseContainer />
      <DashboardMaterialContainer /> */}

    </>
  )
}

export default DashboardContainer