import React from "react";
import ReactApexChart from "react-apexcharts";
import { Typography } from "antd";

function StackChart({ data }) {
  const { Title } = Typography;

  // Extract unique alert names
  const alertNames = [...new Set(data.map(alert => alert.alert_name))];

  // Group alerts by date and count occurrences of each alert type
  const groupedData = {};
  data.forEach(alert => {
    const date = new Date(alert.recorded_date_time).toLocaleDateString();
    if (!groupedData[date]) {
      groupedData[date] = {};
    }
    alertNames.forEach(alertName => {
      if (!groupedData[date][alertName]) {
        groupedData[date][alertName] = 0;
      }
      if (alert.alert_name === alertName) {
        groupedData[date][alertName]++;
      }
    });
  });

  // Sort the dates in ascending order
  const sortedDates = Object.keys(groupedData).sort((a, b) => new Date(a) - new Date(b));

  // Prepare series data
  const seriesData = alertNames.map(alertName => ({
    name: alertName,
    data: sortedDates.map(date => groupedData[date][alertName] || 0),
    
  }));

  // Prepare data for the chart
  const chartData = {
    series: seriesData,
    options: {
      chart: {
        type: 'bar',
        height: 350,
        stacked: true,
        toolbar: {
          show: false
        },
        zoom: {
          enabled: true
        }
      },
      xaxis: {
        type: 'date',
        categories: sortedDates,
      },
      legend: {
        position: 'right',
        offsetY: 40
      },
      fill: {
        opacity: 1
      }
    },
  };

  return (
    <div>
      <div>
        <Title level={5}>Stacked Chart for Alerts</Title>
      </div>
      <ReactApexChart 
        options={chartData.options} 
        series={chartData.series} 
        type="bar" 
        height={350} 
      />
    </div>
  );
}

export default StackChart;
