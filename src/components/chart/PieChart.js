import React from "react";
import ReactApexChart from "react-apexcharts";
import { Typography } from "antd";

function PieChart({ data }) {
  const { Title } = Typography;

  // Group alerts by alert name and count occurrences of each alert type
  const groupedData = data.reduce((acc, alert) => {
    if (!acc[alert.alert_name]) {
      acc[alert.alert_name] = 0;
    }
    acc[alert.alert_name]++;
    return acc;
  }, {});

  // Prepare series data for the pie chart
  const seriesData = Object.values(groupedData);
  const labels = Object.keys(groupedData);

  // Prepare data for the chart
  const chartData = {
    series: seriesData,
    options: {
      chart: {
        width: 380,
        type: 'pie',
      },
      colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0'],
      labels: labels,
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: 'bottom'
          }
        }
      }]
    }
  };

  return (
    <div>
      <div>
        <Title level={5}>Pie Chart for Alerts</Title>
      </div>
      <ReactApexChart
        options={chartData.options}
        series={chartData.series}
        type="pie"
        height={350}
      />
    </div>
  );
}

export default PieChart;
