import { useState, useEffect, useCallback, useRef } from 'react';
import { API } from "../../API/apirequest"
import { DatePicker, Table, Input, Select, Space, Button, Upload, Tooltip, Breadcrumb, Col, Row, Switch, Image } from 'antd';
import moment from 'moment-timezone';
import { UploadOutlined, DownloadOutlined, EyeOutlined, DeleteOutlined, PrinterOutlined, SwapOutlined, RedoOutlined, } from '@ant-design/icons';
import backbutton_logo from "../../assets/backbutton.png"
import { useLocalStorage } from "../../localStorageContext"
import NoData from "./NoData"
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
    "material": null,
    "vehicle": null,
    "startDate": null,
    "endDate": null,
  })
  // Function to handle material type change
  const handleMaterialTypeChange = (value) => {
    setMaterialType(value);
    setFilters({ ...filters, material: `(${value})` });
  };

  // Function to handle truck type change
  const handleVehicleTypeChange = (value) => {
    setVehicleTypeSearch(value)
    setFilters({ ...filters, vehicle: value });
  };
  // Function to handle start date change
  const handleStartDateChange = (date, dateString) => {
    setStartDateValue(date); // Update DatePicker value
    const startDateUnix = new Date(date).getTime(); // Convert dateString to Unix timestamp
    setFilters({ ...filters, startDate: startDateUnix }); // Update filters state with startDate
  };

  const handleEndDateChange = (date) => {
    setEndDateValue(date); // Update DatePicker value
    const unixTimestamp = new Date(date).getTime();
    setFilters({ ...filters, endDate: unixTimestamp });
  };
  const buildQueryParams = (params) => {
    let queryParams = [];
    for (const param in params) {
      if (params[param]) {
        queryParams.push(`${param}=${params[param]}`);
      }
    }
    return queryParams.length ? `?${queryParams.join("&")}` : "";
  };
  const getTableData = async () => {
    const headersOb = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      }
    }

    // setLoading(false)
    setLoading(true)

    try {
      // const queryParams = new URLSearchParams({
      //   page: '1',
      //   limit: '150',
      //   hubId: selectedHubId,
      //   ...filters
      // }).toString();
      // console.log(queryParams)
      // const response = await API.get(`report-table-data?${queryParams}`, headersOb);

      const searchData = searchQuery ? searchQuery : null;

      const response = searchData ? await API.get(`report-table-data?page=1&limit=150&hubId=${selectedHubId}`, headersOb)
        : await API.get(`report-table-data?page=1&limit=150&hubId=${selectedHubId}`, headersOb);
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
  useEffect(() => {
    getTableData();
  }, [filters])
  // Truck master
  const Truck = () => {
    const onReset = () => {
      setStartDateValue("")
      setSearchQuery("");
      setMaterialType(null)
      setVehicleTypeSearch(null)
    }

    return (
      <div className='flex gap-2 flex-col justify-between p-2'>
        <div className='flex gap-2 items-center'>
          <Select
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
          <Select
            name="vehicle"
            placeholder="Truck Type*"
            size="large"
            style={{ width: "20%" }}
            value={vehicleTypeSearch}
            options={[
              { value: 'Bag', label: 'Open' },
              { value: 'Bulk', label: 'Bulk' },
            ]}
            onChange={handleVehicleTypeChange}
          />
          <DatePicker
            size="large"
            placeholder="Start Date"
            value={startDateValue}
            onChange={handleStartDateChange}
            style={{ marginRight: 16 }}
          />
          <DatePicker
            placeholder="End Date"
            size="large"
            value={endDateValue}
            onChange={handleEndDateChange}
            style={{ marginRight: 16 }}
          />

          {startDateValue !== null && startDateValue !== "" || materialType !== "" || vehicleTypeSearch !== "" && vehicleTypeSearch !== null ? <><Button size='large' onClick={onReset} style={{ rotate: "180deg" }} title="reset" icon={<RedoOutlined />}></Button></> : <></>}
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


    const DispatchTable = () => {
      const authToken = localStorage.getItem("token");
      const [challanData, setchallanData] = useState([]);
      const { triggerUpdate } = useLocalStorage();

      const queryParams = buildQueryParams(filters)
      console.log(queryParams)
      const getDispatchTableData = async () => {


        try {
          setLoading(true);
          const headersOb = {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${authToken}`
            }
          };
          const searchData = queryParams ? queryParams : null;

          const response = searchData ? await API.get(`trip-register-aggregate-values/${editingRowId}/${selectedHubId}${queryParams}`, headersOb)
            : await API.get(`trip-register-aggregate-values/${editingRowId}/${selectedHubId}`, headersOb);
          if (response.data.tripAggregates.length === 0) {
            setLoading(false);
            setchallanData(response.data.tripAggregates);
            const saveTripReportsinLocalStorage = {
              "totalAmount": 0,
              "totalBankTransfer": 0,
              "totalCash": 0,
              "totalCommisionTotal": 0,
              "totalDiesel": 0,
              "totalQuantity": 0,
              "totalShortage": 0
            }
            localStorage.setItem("TripReportsExpense1", JSON.stringify(saveTripReportsinLocalStorage));
            triggerUpdate();
          } else {
            setLoading(false);
            setchallanData(response.data.tripAggregates[0].tripDetails || []);
            const saveTripReportsinLocalStorage = {
              "totalAmount": response.data.tripAggregates[0].totalAmount,
              "totalBankTransfer": response.data.tripAggregates[0].totalBankTransfer,
              "totalCash": response.data.tripAggregates[0].totalCash,
              "totalCommisionTotal": response.data.tripAggregates[0].totalCommisionTotal,
              "totalDiesel": response.data.tripAggregates[0].totalDiesel,
              "totalQuantity": response.data.tripAggregates[0].totalQuantity,
              "totalShortage": response.data.tripAggregates[0].totalShortage
            }
            localStorage.setItem("TripReportsExpense1", JSON.stringify(saveTripReportsinLocalStorage))
          }

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
        {
          title: 'GR Date',
          dataIndex: 'grDate',
          key: 'grDate',
          width: 140,
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
          title: 'Commission',
          width: 160,
          render: (_, record) => {
            const percentCommission = (record.commisionRate) * (record.quantityInMetricTons * record.ratePerTon)
            const percentCommissionINR = (percentCommission / 100)
            return (
              <div style={{ display: "flex", gap: "2rem", alignItems: "space-between", justifyContent: "center" }}>

                {record.marketRate > 0 ? <>
                  <p>-</p>
                  <p>
                    {`${(record.amount) - (record.marketRate * record.quantityInMetricTons)}`}
                  </p>
                </>
                  :
                  <><p>
                    {record.commisionRate == null || record.commisionRate == 0 ? <>-</> : <> {`${record.commisionRate} %`}</>}
                  </p>
                    <p>
                      {`${percentCommissionINR}`}
                    </p>
                  </>
                }

              </div>
            );
          }
        },

        {
          title: 'Diesel',
          dataIndex: 'diesel',
          key: 'diesel',
          width: 90,
        },
        {
          title: 'Cash',
          dataIndex: 'cash',
          key: 'cash',
          width: 90,
        },
        {
          title: 'Bank Transfer',
          dataIndex: 'bankTransfer',
          key: 'bankTransfer',
          width: 90,
        },
      ];

      return (
        <>
          <Table
            columns={columns}
            dataSource={challanData}
            scroll={{ x: 700, y: 130 }}
            rowKey="_id"
            loading={loading}
            pagination={{
              position: ["none", "none"],
              showSizeChanger: false,
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
      console.log(queryParams)
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
          // localStorage.setItem("totalOutstandingDebit", JSON.stringify(saveLocal))
          setLoading(false)
          let allChallans;
          if (ledgerEntries.length == 0) {
            allChallans = ledgerEntries
            setchallanData(allChallans);
          } else {
            allChallans = ledgerEntries || "";
            setchallanData(allChallans);
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
            <div className="px-8" style={{ fontWeight: 'bold' }}>Total Outstanding</div>
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

          const ledgerEntries = response.data.voucher[0].voucherDetails;
          const ownersVoucherAmount = response.data.voucher[0].total
          setTotal(response.data.voucher[0].total)
          const saveLocal = {
            "ownersVoucherAmount": ownersVoucherAmount
          }
          // localStorage.setItem("ownersVoucherAmount", JSON.stringify(saveLocal))
          localStorage.setItem("ownersVoucherAmount", JSON.stringify(saveLocal));
          triggerUpdate();
          setLoading(false)
          let truckDetails;
          if (ledgerEntries.length === 0) {
            truckDetails = ledgerEntries;
            setchallanData(truckDetails);
          } else {
            truckDetails = ledgerEntries || "";
            setchallanData(truckDetails);
          }
        } catch (err) {
          setLoading(false)
          console.log(err)
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
            <div className="px-8" style={{ fontWeight: 'bold' }}>Total Outstanding</div>
            <div className="px-8" style={{ fontWeight: 'bold' }}>{total}</div>
          </div>
        </>
      );
    };
    const ExpenseComponent = () => {
      const [totalData, setTotalData] = useState(null);
      const [ownersAdavanceAmountDebit, setOwnersAdavanceAmountDebit] = useState(null);
      const [ownersVoucherAmount, setOwnersVoucherAmount] = useState(null);
      const { updateCount } = useLocalStorage();

      useEffect(() => {
        const storedData = localStorage.getItem("TripReportsExpense1");
        if (storedData) {
          setTotalData(JSON.parse(storedData));
        }
        const storedDebitData = localStorage.getItem("totalOutstandingDebit");
        if (storedDebitData) {
          setOwnersAdavanceAmountDebit(JSON.parse(storedDebitData));
        }
        const storedVoucherAmountData = localStorage.getItem("ownersVoucherAmount");
        if (storedVoucherAmountData) {
          setOwnersVoucherAmount(JSON.parse(storedVoucherAmountData));
        }
      }, [updateCount]);
      const renderExpenseItem = (label, amount) => (
        <div className="flex justify-between items-center p-2 px-4">
          <div className=''>{label}</div>
          <div className="">₹ {amount}</div>
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
              {renderExpenseItem('Diesel', totalData.totalDiesel)}
              <hr />
              {renderExpenseItem('Cash', totalData.totalCash)}
              <hr />
              {renderExpenseItem('Bank Transfer', totalData.totalBankTransfer)}
              <hr />
              {renderExpenseItem('Shortage', totalData.totalShortage)}
              <hr />
              {renderExpenseItem('Outstanding Debit', ownersAdavanceAmountDebit.totalOutstandingDebit)}
              <hr />
              {renderExpenseItem('Advance Voucher', ownersVoucherAmount.ownersVoucherAmount)}
              <hr />
              {/* Example of a total row */}
              <div className="flex justify-between items-center p-2 px-4 bg-[#F6F6F6] text-[#1572B6] font-semibold rounded-b-[20px]">
                <div className=''>Total</div>
                <div className="">₹  {((totalData.totalAmount)) - ((totalData.totalDiesel) + (totalData.totalCash) + (totalData.totalBankTransfer) + (totalData.totalShortage) + (ownersAdavanceAmountDebit.totalOutstandingDebit) + (ownersVoucherAmount.ownersVoucherAmount))}
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
          let truckDetails;
          if (ledgerEntries.length === 0) {
            truckDetails = ledgerEntries;
            setBankAccountData(truckDetails);
          } else {
            truckDetails = ledgerEntries || "";
            setBankAccountData(truckDetails);
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
                <Button size='large' onClick={downloadPDF} style={{ marginLeft: '10px' }}><PrinterOutlined /></Button>
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
                      <div className="flex flex-col gap-2 w-[80%]">
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
        title: 'Owner Name',
        width: 160,
        render: (_, record) => {
          return <p>{record.ownerDetails[0].ownerName !== null || record.ownerDetails[0].ownerName !== "" ? record.ownerDetails[0].ownerName.charAt(0).toUpperCase() + record.ownerDetails[0].ownerName.slice(1) : null}</p>
        }
      },
      {
        title: 'Qty',
        dataIndex: 'totalQuantity',
        key: 'totalQuantity',
        width: 100,
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
      },
      {
        title: 'Commision',
        dataIndex: 'totalCommisionTotal',
        key: 'totalCommisionTotal',
        width: 160,
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

    return (
      <>
        <Table
          columns={columns}
          dataSource={tripData}
          scroll={{ x: 800, y: 410 }}
          rowKey="_id"
          loading={loading}
          pagination={{
            position: ['bottomCenter'],
            showSizeChanger: true,
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
      {/* <p>Reports Container</p> */}
      {/* <NoData /> */}

    </>
  );
}

export default ReportsContainer