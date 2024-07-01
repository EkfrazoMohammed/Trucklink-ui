import { useState, useEffect, useCallback } from 'react';
import { API } from "../../API/apirequest"
import { DatePicker, Table, Input, Select, Space, Button, Upload, Tooltip, Breadcrumb, Col, Row, Switch, Image } from 'antd';
import moment from 'moment-timezone';
import { UploadOutlined, DownloadOutlined, EyeOutlined, DeleteOutlined, PrinterOutlined, SwapOutlined, RedoOutlined, } from '@ant-design/icons';
import backbutton_logo from "../../assets/backbutton.png"
import { useLocalStorage } from "../../localStorageContext"
import NoData from "./NoData"

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

  // Initialize state variables for current page and page size
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(50);
  const [totalDispatchData, setTotalDispatchData] = useState(100)
  const [searchQuery, setSearchQuery] = useState('');
  const [materialType, setMaterialType] = useState('')
  const [vehicleType, setVehicleType] = useState("")
  const [startDate, setStartDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [startDateValue, setStartDateValue] = useState("")
  const [materialSearch, setMaterialSearch] = useState("")
  const [vehicleTypeSearch, setVehicleTypeSearch] = useState(null)

  const handleMaterialTypeChange = (value) => {
    setMaterialType(value);
    setMaterialSearch(value)
  };

  const handleVehicleTypeChange = (value) => {
    setVehicleType(value);
    setVehicleTypeSearch(value)
  };

  const convertToIST = (date) => {
    const istDate = moment.tz(date, "Asia/Kolkata");
    return istDate.valueOf();
  };
  const handleStartDateChange = (date, dateString) => {
    setStartDateValue(date)
    setStartDate(date ? convertToIST(dateString) : null);
  };

  const getTableData = async () => {
    const headersOb = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      }
    }
    const data = {};
    if (vehicleType) {
      data.vehicleType = [vehicleType];
    }
    if (materialType) {
      data.materialType = [materialType];
    }
    if (startDate) {
      data.startDate = startDate;
    }
    setLoading(true)
    try {
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
        setTotalDispatchData(allTripData.length);
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
  useEffect(() => {
    getTableData();
  }, [selectedHubId, materialType, vehicleType, startDate]);

  // Truck master
  const Truck = () => {
    const onReset = () => {
      setStartDateValue("")
      setSearchQuery("");
      setMaterialSearch("")
      setVehicleTypeSearch("")
      window.location.reload()
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
            {materials.map((v, index) => (
              <Option key={index} value={v.materialType}>
                {`${v.materialType}`}
              </Option>
            ))}
          </Select>
          <Select
            name="truckType"
            placeholder="Truck Type*"
            size="large"
            style={{ width: "20%" }}
            value={vehicleTypeSearch}
            options={[
              { value: 'Open', label: 'Open' },
              { value: 'Bulk', label: 'Bulk' },
            ]}
            onChange={handleVehicleTypeChange}
          />
          <DatePicker
            size='large'
            onChange={handleStartDateChange}
            value={startDateValue}
            placeholder='Select Year'
          />
          {startDateValue !== null && startDateValue !== "" || materialSearch !== "" || vehicleTypeSearch !== "" ? <><Button size='large' onClick={onReset} style={{ rotate: "180deg" }} title="reset" icon={<RedoOutlined />}></Button></> : <></>}
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

    const ExpenseComponent = () => {
      const [totalData, setTotalData] = useState(null);
      const [ownersAdavanceAmountDebit, setOwnersAdavanceAmountDebit] = useState(null);
      const [ownersVoucherAmount, setOwnersVoucherAmount] = useState(null);
      const { updateCount } = useLocalStorage();

      useEffect(() => {
        // Fetch data from localStorage
        const storedData = localStorage.getItem("TripReportsExpense1");
        if (storedData) {
          setTotalData(JSON.parse(storedData));
        }
        // Fetch data from localStorage
        const storedDebitData = localStorage.getItem("totalOutstandingDebit");
        if (storedDebitData) {
          setOwnersAdavanceAmountDebit(JSON.parse(storedDebitData));
        }
        // Fetch data from localStorage
        const storedVoucherAmountData = localStorage.getItem("ownersVoucherAmount");
        if (storedVoucherAmountData) {
          setOwnersVoucherAmount(JSON.parse(storedVoucherAmountData));
        }
      }, [updateCount]);
      // useEffect(() => {
      //   // Fetch data from localStorage
      //   const storedData = localStorage.getItem("TripReportsExpense1");
      //   if (storedData) {
      //     setTotalData(JSON.parse(storedData));
      //   }
      //   // Fetch data from localStorage
      //   const storedDebitData = localStorage.getItem("totalOutstandingDebit");
      //   if (storedDebitData) {
      //     setOwnersAdavanceAmountDebit(JSON.parse(storedDebitData));
      //   }

      //   // Fetch data from localStorage
      //   const storedVoucherAmountData = localStorage.getItem("ownersVoucherAmount");
      //   if (storedVoucherAmountData) {
      //     setOwnersVoucherAmount(JSON.parse(storedVoucherAmountData));
      //   }
      // }, []);

      // Function to render each expense item
      const renderExpenseItem = (label, amount) => (
        <div className="flex justify-between items-center p-2 px-4">
          <div className=''>
            {label}
          </div>
          <div className="">
            ₹ {amount}
          </div>
        </div>
      );

      return (
        <div className="flex flex-col gap-1 w-[30vw] " style={{ border: "1px solid #C6C6C6", boxShadow: "3px 3px 2px #eee", borderRadius: "20px" }}>

          {/* Example of a total row */}
          <div className="flex justify-between text-[16px] items-center p-2 px-4 bg-[#F6F6F6] font-bold rounded-t-[20px] ">

            <div className=''>
              Particulars
            </div>
            <div className="">
              {/* You can calculate and display the total amount here */}
              Amount
            </div>
          </div>
          {/* Render each expense item with dynamic amounts */}
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

                <div className=''>
                  Total
                </div>
                <div className="">
                  {/* You can calculate and display the total amount here */}
                  ₹  {((totalData.totalAmount)) - ((totalData.totalDiesel) + (totalData.totalCash) + (totalData.totalBankTransfer) + (totalData.totalShortage) + (ownersAdavanceAmountDebit.totalOutstandingDebit) + (ownersVoucherAmount.ownersVoucherAmount))}
                </div>
              </div>
            </>
          )}
        </div>
      );
    };

    const DispatchTable = () => {
      const authToken = localStorage.getItem("token");
      const [challanData, setchallanData] = useState([]);
      const { triggerUpdate } = useLocalStorage();
      const getDispatchTableData = async () => {

        try {
          setLoading(true);
          const headersOb = {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${authToken}`
            }
          };
          const response = await API.get(`trip-register-aggregate-values/${editingRowId}/${selectedHubId}`, headersOb);
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
          // Ensure setTotalDispatchData is defined and used appropriately
          // setTotalDispatchData(alltripAggregates.length);
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
      const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
      const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
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
          <div className="flex justify-between items-center my-1 text-md" style={{ backgroundColor: "#eee", padding: "1rem" }}>
            <div className="px-8" style={{ fontWeight: 'bold' }}>
              Total Outstanding
            </div>


            <div className="px-8" style={{ fontWeight: 'bold' }}>
              1
              {/* {totalMonthlyAmount} */}
              {/* {totalOutstanding > 0 ? <p style={{ color: "green", fontWeight: "600" }}>{totalOutstanding}</p> : <p style={{ color: "red" }}>{totalOutstanding}</p>} */}
            </div>

          </div>
        </>
      );
    };

    const OwnerAdvanceTable = () => {
      const authToken = localStorage.getItem("token");
      const selectedHubId = localStorage.getItem("selectedHubID");
      const { triggerUpdate } = useLocalStorage();
      const [challanData, setchallanData] = useState([]);
      const [total, setTotal] = useState(0);
      const getOwnerAdvanceTableData = async () => {
        const headersOb = {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          }
        }

        try {
          setLoading(true)
          const response = await API.get(`get-ledger-data-owner/${editingRowId}`, headersOb);
          console.log(response)
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
            setTotalDispatchData(allChallans.length);


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
      const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
      const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
      };


      const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
      };
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
            scroll={{ x: 300, y: 130 }}
            rowKey="_id"
            loading={loading}
            pagination={{
              position: ["none", "none"],
              showSizeChanger: false,
            }}
          />
          <div className="flex justify-between items-center my-1 text-md text-[#1572B6]  bg-[#eee] p-3">
            <div className="px-8" style={{ fontWeight: 'bold' }}>
              Total Outstanding
            </div>


            <div className="px-8" style={{ fontWeight: 'bold' }}>
              {total}
              {/* {totalMonthlyAmount} */}
              {/* {totalOutstanding > 0 ? <p style={{ color: "green", fontWeight: "600" }}>{totalOutstanding}</p> : <p style={{ color: "red" }}>{totalOutstanding}</p>} */}
            </div>

          </div>

        </>
      );
    };

    const OwnerVoucherTable = () => {
      const authToken = localStorage.getItem("token");
      const selectedHubId = localStorage.getItem("selectedHubID");
      const { triggerUpdate } = useLocalStorage();
      const [challanData, setchallanData] = useState([]);
      const [total, setTotal] = useState(0)
      const getVoucherTableData = async () => {
        const headersOb = {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          }
        }
        setLoading(true)
        try {
          const response = await API.get(`get-owner-voucher/${editingRowId}`, headersOb);
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
      const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
      const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
      };

      const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
      };
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
            scroll={{ x: 300, y: 130 }}
            rowKey="_id"
            loading={loading}
            pagination={{
              position: ["none", "none"],
              showSizeChanger: false,
            }}
          />
          <div className="flex justify-between items-center text-md text-[#1572B6]  bg-[#eee] p-3">
            <div className="px-8" style={{ fontWeight: 'bold' }}>
              Total Outstanding
            </div>


            <div className="px-8" style={{ fontWeight: 'bold' }}>
              {total}
              {/* {totalMonthlyAmount} */}
              {/* {totalOutstanding > 0 ? <p style={{ color: "green", fontWeight: "600" }}>{totalOutstanding}</p> : <p style={{ color: "red" }}>{totalOutstanding}</p>} */}
            </div>

          </div>
        </>
      );
    };

    const OwnerBankAccountsTable = () => {
      const authToken = localStorage.getItem("token");
      const selectedHubId = localStorage.getItem("selectedHubID");
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
                        <div className='text-[#625f5f]'>
                          Bank Name
                        </div>
                        <div className='font-semibold text-black'>
                          {v.bankName}
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <div className='text-[#625f5f]'>
                          ifscCode
                        </div>
                        <div className='font-semibold text-black'>
                          {v.ifscCode}
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <div className='text-[#625f5f]'>
                          Branch Name
                        </div>
                        <div className='font-semibold text-black'>
                          {v.branchName}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <div className="flex flex-col">
                        <div className='text-[#625f5f]'>
                          Name
                        </div>
                        <div className='font-semibold text-black'>
                          {v.accountHolderName}
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <div className='text-[#625f5f]'>
                          A/C No
                        </div>
                        <div className='font-semibold text-black'>
                          {v.accountNumber}
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <div className='text-[#625f5f]'>
                          Phone Number
                        </div>
                        <div className='font-semibold text-black'>
                          {v.accountNumber}
                        </div>
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
              <div className="flex flex-col">
                <h1 className='font-bold' style={{ fontSize: "16px" }}>{editingRowName.charAt(0).toUpperCase() + editingRowName.slice(1)} Performance Report</h1>
                <Breadcrumb
                  items={[
                    {
                      title: 'Print and download the Report',
                    }
                  ]}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {editingRowId && (
                <Row gutter={{ xs: 8, sm: 8, md: 12, lg: 12 }}>
                  <div className="flex flex-col gap-2 h-auto w-[81vw]">
                    <DispatchTable />
                  </div>
                </Row>
              )}
            </div>
            <div className="flex flex-col gap-4">
              {editingRowId && (
                <Row gutter={{ xs: 8, sm: 8, md: 12, lg: 12 }}>
                  <div className="flex justify-between gap-4 h-auto w-[100%] pr-2">
                    <div className="flex flex-col gap-2 w-[80%]">
                      <div className='flex flex-col py-2 my-2'>
                        <div className='font-semibold text-lg'>  Advance</div>
                        <OwnerAdvanceTable />
                      </div>
                      <div className='flex flex-col py-2 my-2'>
                        <div className='font-semibold text-lg'>  Voucher</div>
                        <OwnerVoucherTable />
                      </div>
                      <div>
                      </div>
                    </div>
                    <div className='flex flex-col py-2 my-2 w-[50%]'>
                      <div className='font-semibold text-lg'> Expense</div>
                      <ExpenseComponent />
                    </div>
                  </div>
                </Row>
              )}
            </div>


            <div className="flex flex-col gap-2">
              {editingRowId && (
                <Row gutter={{ xs: 8, sm: 8, md: 12, lg: 12 }}>
                  <div className="flex flex-col gap-2 h-auto w-[81vw]">
                    <div className='font-semibold text-lg'>  Bank Account Details</div>
                    <OwnerBankAccountsTable />
                  </div>
                </Row>
              )}
            </div>
          </div>
        </div>
      </>
    );
  };

  const UserTable = ({ onEditTruckClick }) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    };


    const rowSelection = {
      selectedRowKeys,
      onChange: onSelectChange,
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
        title: 'Owner Name',
        width: 160,
        render: (_, record) => {
          return <p>{record.ownerDetails[0].ownerName}</p>
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
    const changePagination = async (pageNumber, pageSize) => {
      try {
        setCurrentPage(pageNumber);
        setCurrentPageSize(pageSize);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const changePaginationAll = async (pageNumber, pageSize) => {
      try {
        setCurrentPage(pageNumber);
        setCurrentPageSize(pageSize);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    return (
      <>
        <Table

          columns={columns}
          dataSource={tripData}
          scroll={{ x: 800, y: 410 }}
          rowKey="_id"
          loading={loading}
          pagination={{
            position: ['none', 'none'],
            showSizeChanger: false,
            // current: currentPage,
            // total: totalDispatchData,
            // defaultPageSize: currentPageSize, // Set the default page size
            // onChange: changePagination,
            // onShowSizeChange: changePaginationAll,
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
      {/* <NoData /> */}

    </>
  );
}

export default ReportsContainer