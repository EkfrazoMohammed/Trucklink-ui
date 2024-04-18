import ReactApexChart from "react-apexcharts";
import { Typography } from "antd";

function LineChart({ data }) {
  const { Title } = Typography;

  // Group alerts by date and count occurrences of each alert type
  const groupedData = data.reduce((acc, alert) => {
    const date = new Date(alert.recorded_date_time).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = {};
    }
    if (!acc[date][alert.alert_name]) {
      acc[date][alert.alert_name] = 0;
    }
    acc[date][alert.alert_name]++;
    return acc;
  }, {});

  // Extract unique alert names
  const alertNames = [...new Set(data.map(alert => alert.alert_name))];

  // Prepare series data
  const seriesData = alertNames.map(alertName => ({
    name: alertName,
    data: Object.values(groupedData).map(date => date[alertName] || 0),
    color: "#ff0000",
  }));

  // Sort the dates in ascending order
  const sortedDates = Object.keys(groupedData).sort((a, b) => new Date(a) - new Date(b));

  // Prepare data for the line chart
  const chartData = {
    series: seriesData,
    options: {
      chart: {
        width: "100%",
        height: 350,
        type: "area",
        colors: ["#ff0000"],
        toolbar: {
          show: false,
        },
      },

      legend: {
        show: true, // Show legend to distinguish between different alert names
      },

      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
      },

      yaxis: {
        min: 0, // Set the minimum value of y-axis to 0
        labels: {
          style: {
            fontSize: "14px",
            fontWeight: 600,
            colors: ["#8c8c8c"],
          },
        },
      },

      xaxis: {
        labels: {
          style: {
            fontSize: "14px",
            fontWeight: 600,
            colors: ["#8c8c8c"],
          },
        },
        categories: sortedDates, // Set categories as sorted dates
      },

      tooltip: {
        y: {
          formatter: function (val) {
            return val;
          },
        },
      },
    },
  };

  return (
    <div className="linechart">
      <div>
        <Title level={5}>Alert Counts</Title>
      </div>
      <ReactApexChart
        className="full-width"
        options={chartData.options}
        series={chartData.series}
        type="line"
        height={350}
        width={"100%"}
      />
    </div>
  );
}

export default LineChart;
