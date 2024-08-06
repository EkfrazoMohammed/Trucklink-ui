import { useState, useEffect, useCallback, useRef } from 'react';
import { API } from "../../API/apirequest"
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Extend dayjs with the plugins
dayjs.extend(utc);
dayjs.extend(timezone);
import { DatePicker, Table, Input, Select, Space, Button, Upload, Tooltip, Breadcrumb, Col, Row, Switch, Image } from 'antd';
import moment from 'moment-timezone';
import { UploadOutlined, DownloadOutlined, EyeOutlined, DeleteOutlined, PrinterOutlined, SwapOutlined, RedoOutlined, } from '@ant-design/icons';
import backbutton_logo from "../../assets/backbutton.png"
import { useLocalStorage } from "../../localStorageContext"
import NoData from "./NoData"
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

const filterOption = (input, option) =>
  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;

const ReportsContainer = ({ onData }) => {
  const authToken = localStorage.getItem("token");
  const selectedHubId = localStorage.getItem("selectedHubID");
  const [tripData, settripData] = useState([]);
  const [showUserTable, setShowUserTable] = useState(true);
  const [rowDataForDispatchEditId, setRowDataForDispatchEditId] = useState(null);
  const [rowDataForDispatchEditName, setRowDataForDispatchEditName] = useState(null);
  const [editingChallan, setEditingChallan] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [materialType, setMaterialType] = useState('')
  const [loading, setLoading] = useState(false)
  const [startDateValue, setStartDateValue] = useState("")
  const [endDateValue, setEndDateValue] = useState("")
  const [vehicleTypeSearch, setVehicleTypeSearch] = useState(null)

  const [filters, setFilters] = useState({
    "material": "",
    "vehicle": "",
    "startDate": "",
    "endDate": "",
  })
  // Function to handle material type change
  const handleMaterialTypeChange = (value) => {
    setMaterialType(value);
    setFilters({ ...filters, material: value === "All" ? "" : value });
  };

  // Function to handle truck type change
  const handleVehicleTypeChange = (value) => {
    setVehicleTypeSearch(value)
    setFilters({ ...filters, vehicle: value === "All" ? "" : value });
  };
  // // Function to handle start date change
  // const handleStartDateChange = (date) => {
  //   setStartDateValue(date); // Update DatePicker value
  //   const startDateUnix = new Date(date).getTime(); // Convert dateString to Unix timestamp
  //   setFilters({ ...filters, startDate: startDateUnix || "" }); // Update filters state with startDate
  // };

  // // Function to handle end date change
  // const handleEndDateChange = (date) => {
  //   setEndDateValue(date); // Update DatePicker value
  //   const unixTimestamp = new Date(date).getTime();
  //   setFilters({ ...filters, endDate: unixTimestamp || "" });
  // };
  const handleStartDateChange = (date, dateString) => {
    if (date) {
      const formattedDate = dayjs(date, "DD/MM/YYYY").format("DD/MM/YYYY");
      setStartDateValue(date);
      const startOfDayInIST = dayjs(formattedDate, "DD/MM/YYYY").startOf('day').set({ hour: 5, minute: 30 }).valueOf();
      // Convert the IST timestamp to a dayjs object in IST timezone
      const istDate = dayjs(startOfDayInIST).tz("Asia/Kolkata");
      // Convert the IST date to the start of the same day in UTC and get the timestamp in milliseconds
      const utcStartOfDay = istDate.startOf('day').add(5, 'hours').add(30, 'minutes').valueOf();
      setFilters({ ...filters, startDate: utcStartOfDay || "" });
    } else {
      setStartDateValue(null);
    }
  };

  // Function to handle end date change
  const handleEndDateChange2 = (date) => {
    setEndDateValue(date); // Update DatePicker value
    const unixTimestamp = new Date(date).getTime();
    setFilters({ ...filters, endDate: unixTimestamp || "" });
  };

  const handleEndDateChange = (date, dateString) => {
    if (date) {
      const formattedDate = dayjs(date, "DD/MM/YYYY").format("DD/MM/YYYY");
      setEndDateValue(date);

      const endOfDayInIST = dayjs(formattedDate, "DD/MM/YYYY").endOf('day').set({ hour: 5, minute: 30 }).valueOf();
      setFilters({ ...filters, endDate: endOfDayInIST || "" });
    } else {
      setEndDateValue(null);
    }
  };

  // Function to build query parameters
  const buildQueryParams = (params) => {
    let queryParams = [];
    for (const param in params) {
      if (params[param] && params[param] !== "All") {
        queryParams.push(`${param}=${params[param]}`);
      }
    }
    return queryParams.length ? `?${queryParams.join("&")}` : "";
  };
  const getTableData = async (payload) => {
    const headersOb = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      }
    }
    setLoading(true)
    try {
      const searchData = searchQuery ? searchQuery : null;
      const response = searchData ? await API.post(`report-table-data?page=1&limit=5000&hubId=${selectedHubId}`, payload, headersOb)
        : await API.post(`report-table-data?page=1&limit=5000&hubId=${selectedHubId}`, payload, headersOb);
      setLoading(false)
      let allTripData;
      if (response.data.tripAggregates == 0) {
        allTripData = response.data.tripAggregates
        settripData(allTripData);
      } else {
        allTripData = response.data.tripAggregates[0].data || "";
        settripData(allTripData);
      }
    } catch (err) {
      setLoading(false)
      console.log(err)
    }
  };
  const showTable = () => {
    getTableData(filters)
  }
  const [materials, setMaterials] = useState([]);
  const fetchMaterials = async () => {
    try {
      const headersOb = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        }
      }
      const response = await API.get(`get-material/${selectedHubId}`, headersOb);
      if (response.status === 201) {
        setMaterials(response.data.materials);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };
  useEffect(() => {
    fetchMaterials();
  }, [])
  // useEffect(() => {
  //   getTableData();
  // }, [selectedHubId, materialType, vehicleType, startDate]);
  // useEffect(() => {
  //   getTableData();
  // }, [filters])
  // Truck master
  const Truck = () => {
    const onReset = () => {
      setStartDateValue("")
      setEndDateValue("")
      setSearchQuery("");
      setMaterialType(null)
      setVehicleTypeSearch(null)
      setFilters({
        "material": null,
        "vehicle": null,
        "startDate": "",
        "endDate": "",
      })
      settripData([])
    }

    return (
      <div className='flex gap-2 flex-col justify-between p-2'>
        <div className='flex gap-2 items-center'>
          {/* <Select
            name="materialType"
            value={materialType ? materialType : null}
            placeholder="Material Type*"
            size="large"
            style={{ width: "20%" }}
            onChange={handleMaterialTypeChange}
            filterOption={filterOption}
          >
            {materials.map((v, index) => (<Option key={index} value={v.materialType}>{`${v.materialType}`}</Option>))}
          </Select>
          */}
          <Select
            name="materialType"
            value={materialType ? materialType : null}
            placeholder="Material Type*"
            size="large"
            style={{ width: "20%" }}
            onChange={handleMaterialTypeChange}
            filterOption={filterOption}
          >
            <Option key="all" value="All">All</Option>
            {materials.map((v, index) => (
              <Option key={index} value={v.materialType}>
                {v.materialType}
              </Option>
            ))}
          </Select>

          <Select
            name="vehicle"
            placeholder="Truck Type*"
            size="large"
            style={{ width: "20%" }}
            value={vehicleTypeSearch}
            options={[
              { value: 'All', label: 'All' },
              { value: 'Open', label: 'Open' },
              { value: 'Bulk', label: 'Bulk' },
            ]}
            onChange={handleVehicleTypeChange}
          />
          {/* <DatePicker
            size="large"
            placeholder="Start Date"
            value={startDateValue}
            onChange={handleStartDateChange}
            style={{ marginRight: 16 }}
          /> */}
          <DatePicker
            size='large'
            onChange={handleStartDateChange}
            value={startDateValue} // Set Date object directly as the value
            placeholder="Start Date"
            format='DD/MM/YYYY' // Display format for the DatePicker
          />
          <DatePicker
            size='large'
            onChange={handleEndDateChange}
            value={endDateValue} // Set Date object directly as the value
            placeholder="End Date"
            format='DD/MM/YYYY' // Display format for the DatePicker
            style={{ marginRight: 16 }}
          />
          {startDateValue !== null && startDateValue !== "" || materialType !== "" && materialType !== null || vehicleTypeSearch !== "" && vehicleTypeSearch !== null ? <>


            {/* {materialType !== "" || vehicleTypeSearch !== "" && vehicleTypeSearch !== null ? <> */}
            <Button size='large' type="primary" onClick={showTable} >APPLY</Button>
            <Button size='large' onClick={onReset} style={{ rotate: "180deg" }} title="reset" icon={<RedoOutlined />}></Button></> : <></>}
        </div>
        <div className='flex gap-2 justify-end'>
        </div>
      </div>
    );
  };

  const handleEditTruckClick = (rowData) => {
    setRowDataForDispatchEditId(rowData.ownerDetails[0].ownerId);
    setRowDataForDispatchEditName(rowData.ownerDetails[0].ownerName);
    setShowUserTable(false);
    setEditingChallan(true);
    onData('none')
  };

  const UserInsideReport = ({ editingRowId, editingRowName }) => {
    const goBack = () => {
      onData('flex')
      setShowUserTable(true)
    }
    const componentRef = useRef(null);

    const downloadPDF = async () => {
      const input = componentRef.current;
      const canvas = await html2canvas(input);
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const padding = { top: 10, bottom: 10, left: 10, right: 10 }; // Set padding in mm

      const usableWidth = pdfWidth - padding.left - padding.right;
      const usableHeight = pdfHeight - padding.top - padding.bottom;
      const imgProps = pdf.getImageProperties(imgData);

      let imgWidth = usableWidth;
      let imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      if (imgHeight > usableHeight) {
        const scaleFactor = usableHeight / imgHeight;
        imgWidth *= scaleFactor;
        imgHeight *= scaleFactor;
      }

      pdf.addImage(imgData, 'PNG', padding.left, padding.top, imgWidth, imgHeight);
      pdf.save('report.pdf');
    };
    const exportMultipleTablesToExcel = () => {
      const workbook = XLSX.utils.book_new();

      const addSheetToWorkbook = (data, columns, sheetName) => {
        const headers = columns.map(col => col.title);
        const rows = data.map(row => columns.map(col => row[col.dataIndex]));
        const worksheetData = [headers, ...rows];
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      };
      // const formatDate = (date) => {
      //   const parsedDate = new Date(date);
      //   if (!isNaN(parsedDate)) {
      //     return parsedDate.toLocaleDateString('en-GB');
      //   }
      //   return date; // Return the original date if parsing fails
      // };
      const formatDate = (date) => {
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate)) {
          return parsedDate.toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          });
        }
        return date;
      };

      // {
      //   title: 'GR Date',
      //   dataIndex: 'grDate',

      //   render: (text) => formatDate(text),
      // },
      // Add Dispatch Table data
      const dispatchColumns = [
        {
          title: "Sl No",
          dataIndex: "slno",
          render: (text, row, index) => {
            return <span>{index + 1}</span>;
          },
          key: "name",
        },
        { title: 'Material Type', dataIndex: 'materialType' },
        { title: 'GR No', dataIndex: 'grNumber' },
        // { title: 'GR Date', dataIndex: 'grDate' },

        {
          title: 'GR Date',
          dataIndex: 'grDate',
          render: (text) => formatDate(text),
        },

        { title: 'Load Location', dataIndex: 'loadLocation' },
        { title: 'Delivery Location', dataIndex: 'deliveryLocation' },
        { title: 'Vehicle Number', dataIndex: 'vehicleNumber' },
        { title: 'Vehicle Type', dataIndex: 'vehicleType' },
        { title: 'Delivery Number', dataIndex: 'deliveryNumber' },
        { title: 'Quantity', dataIndex: 'quantityInMetricTons' },
        { title: 'Company Rate', dataIndex: 'ratePerTon' },
        { title: 'Market Rate', dataIndex: 'marketRate' },
        { title: 'Diesel', dataIndex: 'diesel' },
        { title: 'Cash', dataIndex: 'cash' },
        { title: 'Bank Transfer', dataIndex: 'bankTransfer' },
        { title: 'Shortage', dataIndex: 'shortage' },
      ];
      const dispatch = JSON.parse(localStorage.getItem("Dispatch Table")) || [];
      addSheetToWorkbook(dispatch.tripDetails, dispatchColumns, 'Dispatch');

      // Add Owner Advance Table data
      const advanceColumns = [
        {
          title: "Sl No",
          dataIndex: "slno",
          render: (text, row, index) => {
            return <span>{index + 1}</span>;
          },
          key: "name",
        },
        { title: 'Date', dataIndex: 'entryDate' },
        { title: 'Narration', dataIndex: 'narration' },
        { title: 'Debit', dataIndex: 'debit' },
        { title: 'Credit', dataIndex: 'credit' },
      ];

      // Retrieve data from localStorage and parse it as an array
      const b = JSON.parse(localStorage.getItem("advance")) || [];
      addSheetToWorkbook(b, advanceColumns, 'Advance');
      const vouchersColumns = [
        {
          title: "Sl No",
          dataIndex: "slno",
          render: (text, row, index) => {
            return <span>{index + 1}</span>;
          },
          key: "name",
        },

        {
          title: 'Narration',
          dataIndex: 'narration',
          key: 'narration',
          width: 110,
        },
        {
          title: 'Amount',
          dataIndex: 'amount',
          key: 'amount',
          width: 90,
        },
      ];
      // Retrieve data from localStorage and parse it as an array
      const c = JSON.parse(localStorage.getItem("ownersVoucher")) || [];
      addSheetToWorkbook(c, vouchersColumns, 'Voucher');
      const bankColumns = [
        {
          title: "Sl No",
          dataIndex: "slno",
          render: (text, row, index) => {
            return <span>{index + 1}</span>;
          },
          key: "name",
        },

        {
          title: 'bankName',
          dataIndex: 'bankName',
          key: 'bankName',
          width: 110,
        },
        {
          title: 'branchName',
          dataIndex: 'branchName',
          key: 'branchName',
          width: 90,
        },
        {
          title: 'ifscCode',
          dataIndex: 'ifscCode',
          key: 'ifscCode',
          width: 90,
        },
        {
          title: 'accountHolderName',
          dataIndex: 'accountHolderName',
          key: 'accountHolderName',
          width: 110,
        },
        {
          title: 'accountNumber',
          dataIndex: 'accountNumber',
          key: 'accountNumber',
          width: 90,
        },
      ];
      const d = JSON.parse(localStorage.getItem("ac")) || [];
      addSheetToWorkbook(d, bankColumns, 'Bank Accounts');

      const storedData = JSON.parse(localStorage.getItem("TripReportsExpense1")) || [];
      const storedDebitData = JSON.parse(localStorage.getItem("totalOutstandingDebit")) || [];
      const storedVoucherAmountData = JSON.parse(localStorage.getItem("ownersVoucherAmount")) || [];

      const columnsExpenses = [
        {
          title: "Particulars",
          dataIndex: "particulars",
          key: "particulars",
          width: "70%",
        },

        {
          title: "Amount (₹)",
          dataIndex: "amount",
          key: "amount",
          width: "30%",
        },
      ];

      const dataExpenses = [
        {
          particulars: "Total Amount",
          amount: storedData && storedData.totalAmount
        },
        {
          particulars: "Commision",
          amount: storedData && storedData.totalCommisionTotal
        },
        {
          particulars: "Diesel",
          amount: storedData && storedData.totalDiesel
        },
        {
          particulars: "Cash",
          amount: storedData && storedData.totalCash,
        },
        {
          particulars: "Bank Transfer",
          amount: storedData && storedData.totalBankTransfer,
        },
        {
          particulars: "Shortage",
          amount: storedData && storedData.totalShortage,
        },
        {
          particulars: "Outstanding Debit",
          amount: storedDebitData && storedDebitData.totalOutstandingDebit,
        },
        {
          particulars: "Advance Voucher",
          amount: storedVoucherAmountData && storedVoucherAmountData.ownersVoucherAmount,
        },
      ];

      addSheetToWorkbook(dataExpenses, columnsExpenses, 'Expenses');



      XLSX.writeFile(workbook, 'Report.xlsx');
    };

    const DispatchTable = () => {
      const authToken = localStorage.getItem("token");
      const [challanData, setchallanData] = useState([]);

      const { triggerUpdate } = useLocalStorage();
      const queryParams = buildQueryParams(filters);

      const getDispatchTableData = async () => {
        try {
          setLoading(true);
          const headersOb = {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${authToken}`,
            },
          };
          const searchData = queryParams ? queryParams : null;
          console.log(queryParams)
          // const a = '?material=COAL'
          const response = searchData
            ? await API.get(
              `trip-register-aggregate-values/${editingRowId}/${selectedHubId}${queryParams}`,
              headersOb
            )
            : await API.get(
              `trip-register-aggregate-values/${editingRowId}/${selectedHubId}`,
              headersOb
            );

          if (response.data.tripAggregates.length === 0) {
            setchallanData([]);
            localStorage.setItem("Dispatch Table", JSON.stringify([]));
            const saveTripReportsinLocalStorage = {
              totalAmount: 0,
              totalBankTransfer: 0,
              totalCash: 0,
              totalCommisionTotal: 0,
              totalDiesel: 0,
              totalQuantity: 0,
              totalShortage: 0,
            };
            localStorage.setItem(
              "TripReportsExpense1",
              JSON.stringify(saveTripReportsinLocalStorage)
            );
            triggerUpdate();
          } else {
            const tripData = response.data.tripAggregates[0];
            localStorage.setItem("Dispatch Table", JSON.stringify(tripData));
            setchallanData(tripData.tripDetails || []);
            const saveTripReportsinLocalStorage = {
              totalAmount: tripData.totalAmount,
              totalBankTransfer: tripData.totalBankTransfer,
              totalCash: tripData.totalCash,
              totalCommisionTotal: tripData.totalCommisionTotal,
              totalDiesel: tripData.totalDiesel,
              totalQuantity: tripData.totalQuantity,
              totalShortage: tripData.totalShortage,
            };

            localStorage.setItem(
              "TripReportsExpense1",
              JSON.stringify(saveTripReportsinLocalStorage)
            );
            triggerUpdate();
          }
          setLoading(false);
        } catch (err) {
          setLoading(false);
          console.log(err);
        }
      };

      useEffect(() => {
        if (editingRowId) {
          getDispatchTableData();
        }
      }, [editingRowId]);


      const [loading, setLoading] = useState(false)

      const formatDate = (date) => {
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate)) {
          return parsedDate.toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          });
        }
        return date; // Return the original date if parsing fails
      };
      const columns = [
        {
          title: 'Sl No',
          dataIndex: 'serialNumber',
          key: 'serialNumber',
          render: (text, record, index: any) => index + 1,
          width: 80,
          fixed: 'left',
        },
        {
          title: 'Material Type',
          dataIndex: 'materialType',
          key: 'materialType',
          width: 110,
        },
        {
          title: 'GR No',
          dataIndex: 'grNumber',
          key: 'grNumber',
          width: 110,
        },
        // {
        //   title: 'GR Date',
        //   dataIndex: 'grDate',
        //   key: 'grDate',
        //   width: 140,
        // },
        {
          title: 'GR Date',
          dataIndex: 'grDate',
          key: 'grDate',
          width: 140,
          render: (text) => formatDate(text),
        },
        {
          title: 'Load Location',
          dataIndex: 'loadLocation',
          key: 'loadLocation',
          width: 120,
        },
        {
          title: 'Delivery Location',
          dataIndex: 'deliveryLocation',
          key: 'deliveryLocation',
          width: 120,
        },
        {
          title: 'Vehicle Number',
          dataIndex: 'vehicleNumber',
          key: 'vehicleNumber',
          width: 140,
        },

        {
          title: 'Vehicle Type',
          dataIndex: 'vehicleType',
          key: 'vehicleType',
          width: 80,
        },
        {
          title: 'Delivery Number',
          dataIndex: 'deliveryNumber',
          key: 'deliveryNumber',
          width: 140,
        },
        {
          title: 'Quantity',
          dataIndex: 'quantityInMetricTons',
          key: 'quantityInMetricTons',
          width: 90,
        },
        {
          title: 'Company Rate',
          dataIndex: 'ratePerTon',
          key: 'ratePerTon',
          width: 120,
        },
        {
          title: 'Market Rate',
          dataIndex: 'marketRate',
          key: 'marketRate',
          width: 100,
        },

        {
          title: 'Total',
          width: 160,
          render: (_, record) => {
            return (record.quantityInMetricTons * record.ratePerTon).toFixed(2)
          }
        },
        {
          title: 'Commission',
          width: 190,
          render: (_, record) => {
            // Calculate percent rate commission and convert to INR
            const percentRateCommission = (record.commisionRate || 0) * (record.quantityInMetricTons * (record.ratePerTon || 0));
            const percentCommissionINR = (percentRateCommission / 100).toFixed(2);

            // Market rate commission calculation
            let marketRateCommission = 0;
            if (record.marketRate > 0) {
              marketRateCommission = (record.amount || 0) - (record.marketRate * (record.quantityInMetricTons || 0));
            } else if (!record.isMarketRate) {
              marketRateCommission = (percentRateCommission / 100).toFixed(2);
            }

            return (
              <div style={{ display: "flex", gap: "2rem", alignItems: "center", justifyContent: "center" }}>
                {record.marketRate > 0 ? (
                  <>
                    <p>-</p>
                    <p>
                      {Number(marketRateCommission).toFixed(2)}
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      {record.commisionRate == null || record.commisionRate == 0 ? '-' : `${record.commisionRate} %`}
                    </p>
                    <p>
                      {percentCommissionINR}
                    </p>
                  </>
                )}
              </div>
            );
          }
        },


        {
          title: 'Diesel',
          dataIndex: 'diesel',
          key: 'diesel',
          width: 120,
        },
        {
          title: 'Cash',
          dataIndex: 'cash',
          key: 'cash',
          width: 120,
        },
        {
          title: 'Bank Transfer',
          dataIndex: 'bankTransfer',
          key: 'bankTransfer',
          width: 120,
        },
        {
          title: 'Shortage',
          dataIndex: 'shortage',
          key: 'shortage',
          width: 120,
        },

        {
          title: 'Balance',
          width: 190,
          render: (_, record) => {
            // Ensure all values are numbers and provide default values if necessary
            const totalAmount = parseFloat(record.quantityInMetricTons * record.ratePerTon) || 0;
            const totalCom = parseFloat(record.commisionTotal) || 0;
            // const totalCommisionTotal = parseFloat(record.totalCommisionTotal) || 0;
            const totalDiesel = parseFloat(record.diesel) || 0;
            const totalCash = parseFloat(record.cash) || 0;
            const totalBankTransfer = parseFloat(record.bankTransfer) || 0;
            const totalShortage = parseFloat(record.shortage) || 0;

            // Calculate balance
            const balance = (totalAmount) - (totalCom + totalDiesel + totalCash + totalBankTransfer + totalShortage);

            // Return the formatted balance
            return balance.toFixed(2);
          }
        }

      ];
      // Calculate the sums of necessary columns
      const totalQuantity = parseFloat(challanData.reduce((sum, record) => sum + (record.quantityInMetricTons || 0), 0).toFixed(2));
      const totalAmountValue = parseFloat(challanData.reduce((sum, record) => {
        const quantity = record.quantityInMetricTons || 0;
        const rate = record.ratePerTon || 0;
        return sum + (quantity * rate);
      }, 0).toFixed(2));

      const totalPercentCommission = parseFloat(challanData.reduce((sum, record) => {
        const commissionRate = record.commisionRate || 0;
        const quantity = record.quantityInMetricTons || 0;
        const rate = record.ratePerTon || 0;
        return sum + ((commissionRate * (quantity * rate)) / 100);
      }, 0).toFixed(2));

      const totalMarketCommission = parseFloat(challanData.reduce((sum, record) => {
        const marketRate = record.marketRate || 0;
        const quantity = record.quantityInMetricTons || 0;
        const rate = record.ratePerTon || 0;
        if (marketRate > 0) {
          return sum + ((quantity * rate) - (marketRate * quantity));
        }
        return sum;
      }, 0).toFixed(2));

      // Calculate other totals
      const totalDiesel = parseFloat(challanData.reduce((sum, record) => sum + (record.diesel || 0), 0).toFixed(2));
      const totalCash = parseFloat(challanData.reduce((sum, record) => sum + (record.cash || 0), 0).toFixed(2));
      const totalBankTransfer = parseFloat(challanData.reduce((sum, record) => sum + (record.bankTransfer || 0), 0).toFixed(2));
      const totalShortage = parseFloat(challanData.reduce((sum, record) => sum + (record.shortage || 0), 0).toFixed(2));
      const totalCommission = parseFloat((totalPercentCommission + totalMarketCommission).toFixed(2));
      const totalBalance = totalAmountValue - (totalCommission + totalShortage + totalBankTransfer + totalCash + totalDiesel);
      return (
        <>
          <Table
            columns={columns}
            dataSource={challanData}
            scroll={{ x: 700 }}
            rowKey="_id"
            loading={loading}
            pagination={false}

            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell colSpan={9} align="right">Total</Table.Summary.Cell>
                <Table.Summary.Cell>{totalQuantity}</Table.Summary.Cell>
                {/* <Table.Summary.Cell>{totalCompanyRate}</Table.Summary.Cell>
                <Table.Summary.Cell>{totalMarketRate}</Table.Summary.Cell> */}
                <Table.Summary.Cell></Table.Summary.Cell>
                <Table.Summary.Cell></Table.Summary.Cell>
                <Table.Summary.Cell>{totalAmountValue}</Table.Summary.Cell>
                <Table.Summary.Cell align="center">{totalCommission}</Table.Summary.Cell>
                <Table.Summary.Cell>{totalDiesel}</Table.Summary.Cell>
                <Table.Summary.Cell>{totalCash}</Table.Summary.Cell>
                <Table.Summary.Cell>{totalBankTransfer}</Table.Summary.Cell>
                <Table.Summary.Cell>{totalShortage}</Table.Summary.Cell>
                <Table.Summary.Cell>{totalBalance.toFixed(2)}</Table.Summary.Cell>
              </Table.Summary.Row>

            )}


            // antd site header height
            sticky={{
              offsetHeader: 10,
            }}
          />
          {/* <div className="flex justify-between items-center my-1 text-md" style={{ backgroundColor: "#eee", padding: "1rem" }}>
            <div className="px-8" style={{ fontWeight: 'bold' }}>Total Outstanding</div>
            <div className="px-8" style={{ fontWeight: 'bold' }}>1</div>

          </div> */}
        </>
      );
    };

    const OwnerAdvanceTable = () => {
      const authToken = localStorage.getItem("token");
      const { triggerUpdate } = useLocalStorage();
      const [challanData, setchallanData] = useState([]);
      const [total, setTotal] = useState(0);
      const queryParams = buildQueryParams(filters)
      const getOwnerAdvanceTableData = async () => {
        const headersOb = {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          }
        }

        try {
          setLoading(true)
          const searchData = queryParams ? queryParams : null;

          const response = searchData ? await API.get(`get-ledger-data-owner/${editingRowId}${queryParams}`, headersOb)
            : await API.get(`get-ledger-data-owner/${editingRowId}`, headersOb)
          // : await API.get(`get-ledger-data-owner/${editingRowId}`, headersOb)

          // const response = await API.get(`get-ledger-data-owner/${editingRowId}`, headersOb);
          const ledgerEntries = response.data.ownersAdavance[0].ledgerDetails;
          const ownersAdavanceAmountDebit = response.data.ownersAdavance[0].totalOutstandingDebit

          setTotal(ownersAdavanceAmountDebit)
          const saveLocal = {
            "totalOutstandingDebit": ownersAdavanceAmountDebit
          }
          localStorage.setItem("totalOutstandingDebit", JSON.stringify(saveLocal));
          triggerUpdate();
          setLoading(false)
          let allChallans;
          if (ledgerEntries.length == 0) {
            allChallans = ledgerEntries
            setchallanData(allChallans);
            localStorage.setItem("advance", JSON.stringify(allChallans));
          } else {
            allChallans = ledgerEntries || "";
            setchallanData(allChallans);
            localStorage.setItem("advance", JSON.stringify(allChallans));
          }
          setLoading(false)
        } catch (err) {
          setLoading(false)
          console.log(err)
          const ownersAdavanceAmountDebit = 0

          setTotal(ownersAdavanceAmountDebit)
          const saveLocal = {
            "totalOutstandingDebit": ownersAdavanceAmountDebit
          }
          localStorage.setItem("totalOutstandingDebit", JSON.stringify(saveLocal));
          triggerUpdate();
        }
      };

      const [loading, setLoading] = useState(false)


      useEffect(() => {
        getOwnerAdvanceTableData()
      }, [])

      const columns = [
        {
          title: 'Sl No',
          dataIndex: 'serialNumber',
          key: 'serialNumber',
          render: (text, record, index: any) => index + 1,
          width: 80,
          fixed: 'left',
        },
        {
          title: 'Date',
          dataIndex: 'entryDate',
          key: 'entryDate',
          render: (text, record) => {
            return text
          },
        },
        {
          title: 'Narration',
          dataIndex: 'narration',
          key: 'narration',

        },
        {
          title: 'Debit',
          dataIndex: 'debit',
          key: 'debit',

        },
        {
          title: 'Credit',
          dataIndex: 'credit',
          key: 'credit',

        },
      ];
      return (
        <>
          <Table
            columns={columns}
            dataSource={challanData}
            // scroll={{ x: 300, y: 130 }}
            rowKey="_id"
            loading={loading}
            pagination={{
              position: ["none", "none"],
              showSizeChanger: false,
            }}

          />
          <div className="flex justify-between items-center my-1 text-md text-[#1572B6]  bg-[#eee] p-3">
            <div className="px-8" style={{ fontWeight: 'bold' }}>Total Outstanding Debit</div>
            <div className="px-8" style={{ fontWeight: 'bold' }}>{total}</div>
          </div>
        </>
      );
    };

    const OwnerVoucherTable = () => {
      const authToken = localStorage.getItem("token");
      const { triggerUpdate } = useLocalStorage();
      const [challanData, setchallanData] = useState([]);
      const [total, setTotal] = useState(0)
      const queryParams = buildQueryParams(filters)
      const getVoucherTableData = async () => {
        const headersOb = {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          }
        }
        setLoading(true)
        try {
          // const response = await API.get(`get-owner-voucher/${editingRowId}`, headersOb);
          const searchData = queryParams ? queryParams : null;

          const response = searchData ? await API.get(`get-owner-voucher/${editingRowId}${queryParams}`, headersOb)
            : await API.get(`get-owner-voucher/${editingRowId}`, headersOb)

          console.log(response.data.voucher)
          // const response = searchData ? await API.get(`get-owner-voucher/${editingRowId}?startDate=${sd}`, headersOb)
          //   : await API.get(`get-owner-voucher/${editingRowId}`, headersOb)

          if (response.data.voucher.length == 0) {
            setLoading(false)
            setTotal(0)
            const saveLocal = {
              "ownersVoucherAmount": 0
            }
            console.log(saveLocal)
            localStorage.setItem("ownersVoucherAmount", JSON.stringify(saveLocal));
          } else {
            setLoading(false)
            const ledgerEntries = response.data.voucher[0].voucherDetails;
            const ownersVoucherAmount = response.data.voucher[0].voucherDetails.length > 0 ? response.data.voucher[0].total : 0

            setTotal(response.data.voucher[0].total)
            const saveLocal = {
              "ownersVoucherAmount": ownersVoucherAmount
            }
            localStorage.setItem("ownersVoucherAmount", JSON.stringify(saveLocal));
            triggerUpdate();
            setLoading(false)
            let voucherDetails;
            if (ledgerEntries.length === 0) {
              voucherDetails = ledgerEntries;
              console.log(voucherDetails)
              setchallanData(voucherDetails);
              localStorage.setItem("ownersVoucher", JSON.stringify(voucherDetails));
            } else {
              voucherDetails = ledgerEntries || "";
              setchallanData(voucherDetails);
              localStorage.setItem("ownersVoucher", JSON.stringify(voucherDetails));
            }
          }
        } catch (err) {
          setLoading(false)
          console.log(err)
          const saveLocal = {
            "ownersVoucherAmount": 0
          }
          localStorage.setItem("ownersVoucherAmount", JSON.stringify(saveLocal));
        }
      };
      const [loading, setLoading] = useState(false)
      useEffect(() => {
        getVoucherTableData()
      }, [])

      const columns = [
        {
          title: 'Sl No',
          dataIndex: 'serialNumber',
          key: 'serialNumber',
          render: (text, record, index: any) => index + 1,
          width: 80,
          fixed: 'left',
        },

        {
          title: 'Narration',
          dataIndex: 'narration',
          key: 'narration',
          width: 110,
        },
        {
          title: 'Amount',
          dataIndex: 'amount',
          key: 'amount',
          width: 90,
        },
      ];

      return (
        <>
          <Table
            columns={columns}
            dataSource={challanData}
            // scroll={{ x: 300, y: 130 }}
            rowKey="_id"
            loading={loading}
            pagination={{
              position: ["none", "none"],
              showSizeChanger: false,
            }}
          />
          <div className="flex justify-between items-center text-md text-[#1572B6]  bg-[#eee] p-3">
            <div className="px-8" style={{ fontWeight: 'bold' }}>Total Outstanding Amount</div>
            <div className="px-8" style={{ fontWeight: 'bold' }}>{total}</div>
          </div>
        </>
      );
    };
    const ExpenseComponent = () => {
      const [totalData, setTotalData] = useState(null);
      const [ownersAdavanceAmountDebit, setOwnersAdavanceAmountDebit] = useState(null || 0);
      const [ownersVoucherAmount, setOwnersVoucherAmount] = useState(null || 0);
      const { updateCount } = useLocalStorage();

      useEffect(() => {
        const storedData = localStorage.getItem("TripReportsExpense1");
        if (storedData) {
          setTotalData(JSON.parse(storedData));
        }
        const storedDebitData = localStorage.getItem("totalOutstandingDebit");
        if (storedDebitData) {
          setOwnersAdavanceAmountDebit(JSON.parse(storedDebitData));
        } else {
          setOwnersAdavanceAmountDebit(0);
        }
        const storedVoucherAmountData = localStorage.getItem("ownersVoucherAmount") || 0;
        if (storedVoucherAmountData) {
          setOwnersVoucherAmount(JSON.parse(storedVoucherAmountData));
        } else {
          setOwnersVoucherAmount(0);
        }
      }, [updateCount]);
      const renderExpenseItem = (label, amount) => (
        <div className="flex justify-between items-center p-2 px-4">
          <div className=''>{label}</div>
          <div className="">₹ {amount.toFixed(2)}</div>
        </div>
      );

      return (
        <div className="flex flex-col gap-1 w-[30vw] " style={{ border: "1px solid #C6C6C6", boxShadow: "3px 3px 2px #eee", borderRadius: "20px" }}>
          <div className="flex justify-between text-[16px] items-center p-2 px-4 bg-[#F6F6F6] font-bold rounded-t-[20px] ">
            <div className=''>Particulars</div>
            <div className="">Amount</div>
          </div>
          {totalData && (
            <>
              {renderExpenseItem('Total amount', totalData.totalAmount)}
              <hr />
              {renderExpenseItem('Commision', totalData.totalCommisionTotal)}
              <hr />
              {renderExpenseItem('Diesel', totalData.totalDiesel)}
              <hr />
              {renderExpenseItem('Cash', totalData.totalCash)}
              <hr />
              {renderExpenseItem('Bank Transfer', totalData.totalBankTransfer)}
              <hr />
              {renderExpenseItem('Shortage', totalData.totalShortage)}
              <hr />
              {renderExpenseItem('Outstanding Debit', ownersAdavanceAmountDebit.totalOutstandingDebit || 0)}
              <hr />
              {renderExpenseItem('Advance Voucher', ownersVoucherAmount.ownersVoucherAmount || 0)}
              <hr />
              <div className="flex justify-between items-center p-2 px-4 bg-[#F6F6F6] text-[#1572B6] font-semibold rounded-b-[20px]">
                <div>Total</div>
                <div>
                  ₹ {((
                    totalData.totalAmount -
                    (totalData.totalDiesel +
                      totalData.totalCash +
                      totalData.totalBankTransfer +
                      totalData.totalShortage +
                      totalData.totalCommisionTotal +
                      (ownersAdavanceAmountDebit && ownersAdavanceAmountDebit.totalOutstandingDebit) +
                      (ownersVoucherAmount && ownersVoucherAmount.ownersVoucherAmount)
                    )
                  ).toFixed(2))}
                </div>
              </div>

            </>
          )}
        </div>
      );
    };


    const OwnerBankAccountsTable = () => {
      const authToken = localStorage.getItem("token");
      const [bankAccountData, setBankAccountData] = useState([]);
      const ownerBankAccountsData = async () => {
        const headersOb = {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          }
        }
        setLoading(true)
        try {
          const response = await API.get(`get-owner-accounts/${editingRowId}`, headersOb);
          const ledgerEntries = response.data.bankDetails;
          setLoading(false)
          let bankDetails;
          if (ledgerEntries.length === 0) {
            bankDetails = ledgerEntries;
            setBankAccountData(bankDetails);
            localStorage.setItem("ac", JSON.stringify(bankDetails));
          } else {
            bankDetails = ledgerEntries || "";
            setBankAccountData(bankDetails);
            localStorage.setItem("ac", JSON.stringify(bankDetails));
          }
        } catch (err) {
          setLoading(false)
          console.log(err)
        }
      };
      const [loading, setLoading] = useState(false)
      useEffect(() => {
        ownerBankAccountsData()
      }, [])
      return (
        <>
          <div className='flex gap-4'>
            {bankAccountData.map((v) => {
              return (
                <>
                  <div className="flex flex-col gap-4 reports-bank p-4 ">
                    <div className="flex gap-6">
                      <div className="flex flex-col">
                        <div className='text-[#625f5f]'>Bank Name</div>
                        <div className='font-semibold text-black'>{v.bankName}</div>
                      </div>
                      <div className="flex flex-col">
                        <div className='text-[#625f5f]'>ifscCode</div>
                        <div className='font-semibold text-black'>{v.ifscCode}</div>
                      </div>
                      <div className="flex flex-col">
                        <div className='text-[#625f5f]'>Branch Name</div>
                        <div className='font-semibold text-black'>{v.branchName}</div>
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <div className="flex flex-col">
                        <div className='text-[#625f5f]'>Name</div>
                        <div className='font-semibold text-black'>{v.accountHolderName}</div>
                      </div>
                      <div className="flex flex-col">
                        <div className='text-[#625f5f]'>A/C No</div>
                        <div className='font-semibold text-black'>{v.accountNumber}</div>
                      </div>
                      <div className="flex flex-col">
                        <div className='text-[#625f5f]'>Phone Number</div>
                        <div className='font-semibold text-black'>{v.accountNumber}</div>
                      </div>
                    </div>
                  </div>
                </>
              )
            })}
          </div>
        </>
      );
    };
    return (
      <>
        <div className="myuserreporttab-content">
          <div className="flex flex-col gap-2 p-2">
            <div className="flex items-center gap-4">
              <div className="flex"><img src={backbutton_logo} alt="backbutton_logo" className='w-5 h-5 object-cover cursor-pointer' onClick={goBack} /></div>
              <div className="flex justify-between gap-4 pr-2 w-[100%]">
                <div className="flex flex-col ">
                  <h1 className='font-bold' style={{ fontSize: "16px" }}>{editingRowName.charAt(0).toUpperCase() + editingRowName.slice(1)} Performance Report</h1>

                  <Breadcrumb items={[{ title: 'Print and download the Report' }]} />
                </div>
                <div>

                  <Button size='large' onClick={() => exportMultipleTablesToExcel()}><DownloadOutlined /></Button>
                  <Button size='large' onClick={downloadPDF} style={{ marginLeft: '10px' }}><PrinterOutlined /></Button>
                </div>
              </div>
            </div>
            <div ref={componentRef}>

              <div className="flex flex-col gap-2">
                {editingRowId && (
                  <Row gutter={{ xs: 8, sm: 8, md: 12, lg: 12 }}>
                    <div className="flex flex-col gap-2 h-auto w-[81vw]"><DispatchTable /></div>
                  </Row>
                )}
              </div>
              <div className="flex flex-col gap-4">
                {editingRowId && (
                  <Row gutter={{ xs: 8, sm: 8, md: 12, lg: 12 }}>
                    <div className="flex justify-between gap-4 h-auto w-[100%] pr-2">
                      <div className="flex flex-col gap-2 w-[100%]">
                        <div className='flex flex-col gap-3 py-2 my-2'>
                          <div className='font-semibold text-lg px-4'>  Advance</div>
                          <OwnerAdvanceTable />
                        </div>
                        <div className='flex flex-col gap-3 py-2 my-2'>
                          <div className='font-semibold text-lg px-4'>  Voucher</div>
                          <OwnerVoucherTable />
                        </div>
                        <div>
                        </div>
                      </div>
                      <div className='flex flex-col gap-3 py-2 my-2 w-[50%]'>
                        <div className='font-semibold text-lg px-4'> Expense</div>
                        <ExpenseComponent />
                      </div>
                    </div>
                  </Row>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {editingRowId && (
                  <Row gutter={{ xs: 8, sm: 8, md: 12, lg: 12 }}>
                    <div className="flex flex-col gap-3 h-auto w-[81vw]">
                      <div className='font-semibold text-lg px-4'>  Bank Account Details</div>
                      <OwnerBankAccountsTable />
                    </div>
                  </Row>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const UserTable = ({ onEditTruckClick }) => {



    const [currentPage, setCurrentPage] = useState(1);
    const [currentPageSize, setCurrentPageSize] = useState(10);
    const [activePageSize, setActivePageSize] = useState(10);
    const handlePageSizeChange = (newPageSize) => {
      setCurrentPageSize(newPageSize);
      setCurrentPage(1); // Reset to the first page
      setActivePageSize(newPageSize); // Update the active page size
    };


    const columns = [
      {
        title: 'Sl No',
        dataIndex: 'serialNumber',
        key: 'serialNumber',
        render: (text, record, index) => (currentPage - 1) * currentPageSize + index + 1,
        width: 80,
      },

      {
        title: 'Owner Name',
        width: 160,
        render: (_, record) => {
          return <p className='cursor-pointer' onClick={() => onEditTruckClick(record)}>{record.ownerDetails[0].ownerName !== null || record.ownerDetails[0].ownerName !== "" ? record.ownerDetails[0].ownerName.charAt(0).toUpperCase() + record.ownerDetails[0].ownerName.slice(1) : null}</p>
        }
      },
      {
        title: 'Qty',
        dataIndex: 'totalQuantity',
        key: 'totalQuantity',
        width: 100,
        render: (_, record) => {
          return record.totalQuantity.toFixed(2)
        }
      },
      {
        title: 'Company Rate',
        dataIndex: 'companyRate',
        key: 'companyRate',
        width: 110,
      },
      {
        title: 'Market Rate',
        dataIndex: 'marketRate',
        key: 'marketRate',
        width: 110,
      },
      {
        title: 'Total Amount',
        dataIndex: 'totalAmount',
        key: 'totalAmount',
        width: 120,
        render: (_, record) => {
          return record.totalAmount.toFixed(2)
        }

      },
      {
        title: 'Commission',
        dataIndex: 'totalCommisionTotal',
        key: 'totalCommisionTotal',
        width: 190,
        render: (_, record) => {
          return record.totalCommisionTotal.toFixed(2)
        }
      },
      {
        title: 'Diesel',
        dataIndex: 'totalDiesel',
        key: 'totalDiesel',
        width: 160,
      },
      {
        title: 'Cash',
        dataIndex: 'totalCash',
        key: 'totalCash',
        width: 120,
      },
      {
        title: 'Bank Transfer',
        dataIndex: 'totalBankTransfer',
        key: 'totalBankTransfer',
        width: 120,
      },
      {
        title: 'Shortage',
        dataIndex: 'totalShortage',
        key: 'totalShortage',
        width: 160,
      },
      {
        title: 'Balance',
        width: 190,
        render: (_, record) => {
          return (record.totalAmount - (record.totalCommisionTotal + record.totalDiesel + record.totalCash + record.totalBankTransfer + record.totalShortage)).toFixed(2)
        }
      },
      {
        title: 'Action',
        key: 'action',
        width: 80,
        fixed: 'right',
        render: (record: unknown) => (
          <Space size="middle">
            <Tooltip placement="top" title="Edit"><a onClick={() => onEditTruckClick(record)}><EyeOutlined /></a></Tooltip>
          </Space>
        ),
      },
    ];

    const handleDownload = () => {
      const challans = tripData;
      const ownerDetails = challans.map((challan) => ({
        "_id": challan._id,
        "ownerName": challan.ownerDetails[0].ownerName,
        "quantityInMetricTons": challan.totalQuantity.toFixed(2),
        "rate": challan.companyRate,
        "marketRate": challan.marketRate,
        "totalAmount": challan.totalAmount.toFixed(2),
        "commisionTotal": challan.totalCommisionTotal.toFixed(2),
        "diesel": challan.totalDiesel,
        "cash": challan.totalCash,
        "bankTransfer": challan.totalBankTransfer,
        "shortage": challan.totalShortage,
        "balance": (challan.totalAmount - (challan.totalCommisionTotal + challan.totalDiesel + challan.totalCash + challan.totalBankTransfer + challan.totalShortage)).toFixed(2)
      }));
      // Create a new workbook
      const wb = XLSX.utils.book_new();

      // Add the owner details sheet to the workbook
      const ownerWS = XLSX.utils.json_to_sheet(ownerDetails);
      XLSX.utils.book_append_sheet(wb, ownerWS, 'Reports');


      // Export the workbook to an Excel file
      XLSX.writeFile(wb, 'Reports.xlsx');
    };
    const handlePrint = () => {
      const totalPagesExp = "{total_pages_count_string}";
      try {
        const doc = new jsPDF("l", "mm", "a4");
        const items = tripData.map((challan, index) => [
          index + 1,
          challan.ownerDetails[0].ownerName,
          challan.totalQuantity.toFixed(2),
          challan.companyRate,
          challan.marketRate,
          challan.totalAmount.toFixed(2),
          challan.totalCommisionTotal.toFixed(2),
          challan.totalDiesel,
          challan.totalCash,
          challan.totalBankTransfer,
          challan.totalShortage,
          (challan.totalAmount - (challan.totalCommisionTotal + challan.totalDiesel + challan.totalCash + challan.totalBankTransfer + challan.totalShortage)).toFixed(2)

        ]);

        if (items.length === 0) {
          message.error("No data available to download");
        } else {
          doc.setFontSize(10);
          const d = new Date();
          const m = d.getMonth() + 1;
          const day = d.getDate();
          const year = d.getFullYear();

          doc.autoTable({
            head: [
              [
                "Sl No",
                "ownerName",
                "quantityInMetricTons",
                "rate",
                "marketRate",
                "totalAmount",
                "commisionTotal",
                "diesel",
                "cash",
                "bankTransfer",
                "shortage",
                "balance"
              ],
            ],
            body: items,
            startY: 10,
            headStyles: { fontSize: 8, fontStyle: "normal", fillColor: "#44495b" },
            bodyStyles: { fontSize: 8, textAlign: "center" },
            columnStyles: {
              0: { cellWidth: 8 },
              1: { cellWidth: 20 },
              2: { cellWidth: 20 },
              3: { cellWidth: 20 },
              4: { cellWidth: 20 },
              5: { cellWidth: 20 },
              6: { cellWidth: 20 },
              7: { cellWidth: 20 },
              8: { cellWidth: 20 },
              9: { cellWidth: 20 },
              10: { cellWidth: 20 },
              11: { cellWidth: 20 },


            },
            didDrawPage: function (data) {
              // Header
              doc.setFontSize(10);
              doc.text("Report Details", data.settings.margin.left + 0, 5);
              doc.text("Date:-", data.settings.margin.left + 155, 5);
              doc.text(
                day + "/" + m + "/" + year,
                data.settings.margin.left + 170,
                5
              );

              // Footer
              var str = "Page " + doc.internal.getNumberOfPages();
              // Total page number plugin only available in jspdf v1.0+
              if (typeof doc.putTotalPages === "function") {
                str = str + " of " + totalPagesExp;
              }
              doc.setFontSize(10);


              // jsPDF 1.4+ uses getWidth, <1.4 uses .width
              var pageSize = doc.internal.pageSize;
              var pageHeight = pageSize.height
                ? pageSize.height
                : pageSize.getHeight();
              doc.text(str, data.settings.margin.left, pageHeight - 10);
            },
            margin: { top: 10 },
          });


          if (typeof doc.putTotalPages === "function") {
            doc.putTotalPages(totalPagesExp);
          }
          doc.save("user-reports.pdf");
        }
      } catch (err) {
        message.error("Unable to Print");
      }
    };
    return (
      <>
        <div className='flex gap-2 mb-2 items-center justify-end'>
        {/* {tripData.length > 0 ? <>a</> : <>b</>} 
          //  startDateValue !== null && startDateValue !== "" || materialType !== "" && materialType !== null || vehicleTypeSearch !== "" && vehicleTypeSearch !== null
          */}
          {tripData.length > 0 
            ? <>
            <Button icon={<DownloadOutlined />} onClick={handleDownload}></Button>
            <Button icon={<PrinterOutlined />} onClick={handlePrint}></Button>
          </> : <></>}

          <div className='flex   my-paginations '>
            <span className='bg-[#F8F9FD] p-1'>
              <Button
                onClick={() => handlePageSizeChange(10)}
                style={{
                  backgroundColor: activePageSize === 10 ? 'grey' : 'white',
                  color: activePageSize === 10 ? 'white' : 'black',
                  borderRadius: activePageSize === 10 ? '6px' : '0',
                  boxShadow: activePageSize === 10 ? '0px 0px 4px 0px #00000040' : 'none',
                }}
              >
                10
              </Button>
              <Button
                onClick={() => handlePageSizeChange(25)}
                style={{
                  backgroundColor: activePageSize === 25 ? 'grey' : 'white',
                  color: activePageSize === 25 ? 'white' : 'black',
                  borderRadius: activePageSize === 25 ? '6px' : '0',
                  boxShadow: activePageSize === 25 ? '0px 0px 4px 0px #00000040' : 'none',
                }}
              >
                25
              </Button>
              <Button
                onClick={() => handlePageSizeChange(50)}
                style={{
                  backgroundColor: activePageSize === 50 ? 'grey' : 'white',
                  color: activePageSize === 50 ? 'white' : 'black',
                  borderRadius: activePageSize === 50 ? '6px' : '0',
                  boxShadow: activePageSize === 50 ? '0px 0px 4px 0px #00000040' : 'none',
                }}
              >
                50
              </Button>
              <Button
                onClick={() => handlePageSizeChange(100)}
                style={{
                  backgroundColor: activePageSize === 100 ? 'grey' : 'white',
                  color: activePageSize === 100 ? 'white' : 'black',
                  borderRadius: activePageSize === 100 ? '6px' : '0',
                  boxShadow: activePageSize === 100 ? '0px 0px 4px 0px #00000040' : 'none',
                }}
              >
                100
              </Button>
            </span>
          </div>
        </div>
        <Table
          columns={columns}
          dataSource={tripData}
          scroll={{ x: 800 }}
          rowKey="_id"
          loading={loading}
          pagination={{
            showSizeChanger: false,
            position: ['bottomCenter'],
            current: currentPage,
            pageSize: currentPageSize,
            onChange: (page) => {
              setCurrentPage(page);
            },
          }}

          onRow={(record) => ({
            onClick: () => {
              onEditTruckClick(record);
            },
            className: 'cursor-pointer',
          })}

          // antd site header height
          sticky={{
            offsetHeader: 10,
          }}
        />
      </>
    );
  };

  return (
    <>
      {showUserTable ? (
        <>
          <Truck />
          <UserTable onEditTruckClick={handleEditTruckClick} />
        </>
      ) : (
        editingChallan ? (
          <UserInsideReport editingRowId={rowDataForDispatchEditId} editingRowName={rowDataForDispatchEditName} />
        ) : null
      )}

    </>
  );
}

export default ReportsContainer