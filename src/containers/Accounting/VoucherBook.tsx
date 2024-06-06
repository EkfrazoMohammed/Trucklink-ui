import { useState, useEffect } from 'react';
import type { DatePickerProps } from 'antd';
import { DatePicker, Table, Input, Select, Space, Button, Upload, Tabs, Tooltip, Breadcrumb, Col, Row, Switch, Image } from 'antd';
import { UploadOutlined, DownloadOutlined, EyeOutlined, FormOutlined, DeleteOutlined, SwapOutlined,RedoOutlined, SearchOutlined } from '@ant-design/icons';
const { Search } = Input;
import backbutton_logo from "../../assets/backbutton.png"
import { API } from "../../API/apirequest"
import debounce from 'lodash/debounce';
import axios from 'axios';


const filterOption = (input, option) =>
  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;

const VoucherBook = ({onData,showTabs,setShowTabs}) => {
  const authToken = localStorage.getItem("token");
  const selectedHubId = localStorage.getItem("selectedHubID");
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredVoucherData, setFilteredVoucherData] = useState([]);

console.log(filteredVoucherData)
  const handleSearch = (e) => {
    setSearchQuery(e);
  };
  const [showVoucherTable, setshowVoucherTable] = useState(true);
  const [showVoucherView, setshowVoucherView] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [rowDataForTruckEdit, setRowDataForTruckEdit] = useState(null);
  const [rowDataForTruckView, setRowDataForTruckView] = useState(null);
  const [rowDataForTruckTransfer, setRowDataForTruckTransfer] = useState(null);
  const handleEditVoucherClick = (rowData) => {
    //onData('none')
    setShowTabs(false); // Set showTabs to false when adding owner
    setRowDataForTruckEdit(rowData);
    setshowVoucherTable(false);
    setShowTransferForm(false);
    setshowVoucherView(false)
  };
  const handleViewVoucherClick = (rowData) => {
    //onData('none')
    setShowTabs(false); // Set showTabs to false when adding owner
    setRowDataForTruckEdit(rowData);
    setRowDataForTruckView(rowData)
    setshowVoucherTable(false);
    setShowTransferForm(false);
    setshowVoucherView(true)
  };
  const handleAddVoucherClick = () => {
    //onData('none')
    setShowTabs(false); // Set showTabs to false when adding owner
    setRowDataForTruckEdit(null);
    setshowVoucherTable(false);
  };

  const handleTransferVoucherClick = (rowData) => {
    //onData('none')
    setShowTabs(false); // Set showTabs to false when adding owner
    setShowTransferForm(true);
    setRowDataForTruckTransfer(rowData)
    setRowDataForTruckEdit(rowData);
    setshowVoucherTable(false);
  };

  const handleDeleteVoucherClick = async (rowData) => {
    console.log("deleting", rowData._id)
    const vehicleId = rowData._id
    const oldOwnerId = rowData.ownerId[0]._id;
    const headersOb = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      }
    }
    const response = await API.delete(`delete-vehicle-details/${vehicleId}/${oldOwnerId}`, headersOb);
    if (response.status === 201) {
      alert("deleted data")
        window.location.reload()
     
    } else {
      alert(`unable to delete data`)
      console.log(response.data)
    }
  }


  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(50);
  const [totalVoucherData, setTotalVoucherData] = useState(null)
  
  const getTableData = async (searchQuery) => {
    const headersOb = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      }
    }
    try {
      const searchData = searchQuery ? searchQuery : null;
      const month='6'
      const year="2024"


      // const response = searchData ? await API.get(`get-voucher-vehicles-info`, headersOb)
      //   : await API.get(`get-voucher-vehicles-info`, headersOb);
      const response = searchData ? await API.get(`get-vouchers-by-month/${month}/${year}`, headersOb)
      : await API.get(`get-vouchers-by-month/${month}/${year}`, headersOb);
      let truckDetails;
      if (response.data.vaucharEntries == 0) {
        truckDetails = response.data.vaucharEntries
        setFilteredVoucherData(truckDetails);
      } else {

        truckDetails = response.data.vaucharEntries || "";
        setTotalVoucherData(response.data.vaucharEntries.count);

        setFilteredVoucherData(truckDetails);
       
      }
    } catch (err) {
      console.log(err)

    }
  };
  // Update the useEffect hook to include currentPage and currentPageSize as dependencies
  useEffect(() => {
    getTableData("");
  }, []);
  useEffect(() => {
    getTableData(searchQuery);
  }, [selectedHubId]);

  // Truck master
  const Truck = ({ onAddVoucherClick }: { onAddVoucherClick: () => void }) => {
    const initialSearchQuery = localStorage.getItem('searchQuery2') || '';
    const [searchQuery2, setSearchQuery2] = useState<string>(initialSearchQuery);
  
    // Update localStorage whenever searchQuery2 changes
    useEffect(() => {
      localStorage.setItem('searchQuery2', searchQuery2);
    }, [searchQuery2]);
  
    const handleSearch = () => {
      getTableData(searchQuery2);
    };
  
    const onChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery2(e.target.value);
      if(e.target.value==""){
        onReset()
      }
    };
  
    const onReset=()=>{
      setSearchQuery2("");
      getTableData("");
    }
    return (
      <div className='flex gap-2 justify-between  py-3'>
     <div className='flex items-center gap-2'>      
        <Search
          placeholder="Search by Vehicle Number"
          size='large'
          value={searchQuery2}
          onChange={onChangeSearch}
          onSearch={handleSearch}
          style={{ width: 320 }}
        />
        {searchQuery2 !==null && searchQuery2 !== "" ? <><Button size='large' onClick={onReset} style={{rotate:"180deg"}} icon={<RedoOutlined />}></Button></>:<></>}
      </div>
        <div className='flex gap-2'>
          <Button onClick={onAddVoucherClick} className='bg-[#1572B6] text-white'> ADD TRUCK</Button>
        </div>
      </div>

    );
  };
  
  const VoucherBookForm = () => {
    const [formData, setFormData] = useState({
      amount: "100",
      materialId: "",
      materialType: "",
      modeOfPayment: "Bank Transfer",
      narration: "111",
      ownerId: "66557de735f213327e2c7acc",
      ownerName: "tayib",
      ownerPhone: "1231231231",
      vehicleBank: "66557de735f213327e2c7acf",
      vehicleId: "665815c16364f6342e577911",
      vehicleNumber: "MH01AB1234",
      voucherDate: "01/06/2024",
      voucherNumber: "111",
    });
  
    const handleChange = (name, value) => {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      const headersOb = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        }
      };
  
      try {
        const response = await axios.post('https://trucklinkuatnew.thestorywallcafe.com/prod/v1/create-voucher', formData, headersOb);
        console.log('Voucher created successfully:', response.data);
        alert("Voucher created successfully");
        window.location.reload();
      } catch (error) {
        console.error('Error creating voucher:', error);
        alert("An error occurred while creating the voucher. Please try again.");
      }
    };
  
    const goBack = () => {
      setshowVoucherTable(true);
      setShowTabs(true);
    };
  
    return (
      <>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold">Create Voucher</h1>
            <img src={backbutton_logo} alt="backbutton_logo" className='w-5 h-5 object-cover cursor-pointer' onClick={goBack} />
       
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-md font-semibold">Voucher Information</div>
            <div className="text-md font-normal">Enter Voucher Details</div>
          </div>
          <div className="flex flex-col gap-1">
            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
              <Col className="gutter-row mt-6" span={6}>
                <Input
                  placeholder="Amount*"
                  size="large"
                  value={formData.amount}
                  name="amount"
                  onChange={(e) => handleChange('amount', e.target.value)}
                />
              </Col>
            
              <Col className="gutter-row mt-6" span={6}>
                <Input
                  placeholder="Narration*"
                  size="large"
                  value={formData.narration}
                  name="narration"
                  onChange={(e) => handleChange('narration', e.target.value)}
                />
              </Col>
              <Col className="gutter-row mt-6" span={6}>
                <Input
                  placeholder="Owner Name*"
                  size="large"
                  value={formData.ownerName}
                  name="ownerName"
                  onChange={(e) => handleChange('ownerName', e.target.value)}
                />
              </Col>
              <Col className="gutter-row mt-6" span={6}>
                <Input
                  placeholder="Owner Phone*"
                  size="large"
                  value={formData.ownerPhone}
                  name="ownerPhone"
                  onChange={(e) => handleChange('ownerPhone', e.target.value)}
                />
              </Col>
              <Col className="gutter-row mt-6" span={6}>
                <Input
                  placeholder="Vehicle Number*"
                  size="large"
                  value={formData.vehicleNumber}
                  name="vehicleNumber"
                  onChange={(e) => handleChange('vehicleNumber', e.target.value)}
                />
              </Col>
              <Col className="gutter-row mt-6" span={6}>
                <DatePicker
                
                style={{width:"100%"}}
                  placeholder="Voucher Date*"
                  size="large"
                  format="DD/MM/YYYY"
                  onChange={(date, dateString) => handleChange('voucherDate', dateString)}
                />
              </Col>
              <Col className="gutter-row mt-6" span={6}>
                <Select
                style={{width:"100%"}}
                  placeholder="Mode of Payment*"
                  size="large"
                  value={formData.modeOfPayment}
                  onChange={(value) => handleChange('modeOfPayment', value)}
                >
                  <Option value="Bank Transfer">Bank Transfer</Option>
                  <Option value="Cash">Cash</Option>
                </Select>
              </Col>
              <Col className="gutter-row mt-6" span={6}>
                <Input
                  placeholder="Voucher Number*"
                  size="large"
                  value={formData.voucherNumber}
                  name="voucherNumber"
                  onChange={(e) => handleChange('voucherNumber', e.target.value)}
                />
              </Col>
              
            </Row>
          </div>
          <div className="flex gap-4 items-center justify-center reset-button-container">
            <Button type="primary" className="bg-primary" onClick={handleSubmit}>
              Save
            </Button>
          </div>
        </div>
      </>
    );
  };
  
  const ViewTruckDataRow = ({ filterTruckTableData }) => {
    const goBack = () => {
      setshowVoucherTable(true)
      //onData('none')
      setShowTabs(true); // Set showTabs to false when adding owner
    }

    return (
      <>
        <div className="flex flex-col gap-2">

          <div className="flex items-center gap-4">
            <div className="flex"><img src={backbutton_logo} alt="backbutton_logo" className='w-5 h-5 object-cover cursor-pointer' onClick={goBack} /> </div>
            <div className="flex flex-col">
              <h1 className='font-bold' style={{ fontSize: "16px" }}>View Truck Details</h1>
              <Breadcrumb
                items={[
                  {
                    title: 'OnBoarding',
                  },
                  {
                    title: 'Truck Master',
                  },
                  {
                    title: 'View',
                  },
                ]}
              />
            </div>
          </div>
          <div className="section mx-2 my-4">
            <h2 className='font-semibold text-md'>Vehicle Owner Information</h2>
            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
              <Col className="gutter-row m-1" span={5}>
                <p className='flex flex-col font-normal m-2'><span className="label text-sm">Owner Name</span> {filterTruckTableData['ownerId'][0].name}</p>
              </Col>
              <Col className="gutter-row m-1" span={5}>
                <p className='flex flex-col font-normal m-2'><span className="label text-sm">Mobile Number</span> {filterTruckTableData['ownerId'][0].phoneNumber}</p>
              </Col>
              <Col className="gutter-row m-1" span={5}>
                <p className='flex flex-col font-normal m-2'><span className="label text-sm">Email ID</span> {filterTruckTableData['ownerId'][0].email}</p>
              </Col>
              <Col className="gutter-row m-1" span={5}>
                <p className='flex flex-col font-normal m-2'><span className="label text-sm">PAN CARD No</span> {filterTruckTableData['ownerId'][0].panNumber}</p>
              </Col>
              <Col className="gutter-row m-1" span={5}>
                <p className='flex flex-col font-normal m-2'><span className="label text-sm">District</span>  {filterTruckTableData['ownerId'][0].district}</p>
              </Col>
              <Col className="gutter-row m-1" span={5}>
                <p className='flex flex-col font-normal m-2'><span className="label text-sm">State</span> {filterTruckTableData['ownerId'][0].state}</p>
              </Col>

            </Row>
          </div>
        </div>
      </>
    );
  };

  const TruckTable = ({ onEditVoucherClick, onTransferVoucherClick, onViewVoucherClick, onDeleteVoucherClick }) => {
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
        render: (text, record, index) => index + 1,
        width: 80,
      },
      {
        title: 'Amount',
        dataIndex: 'amount',
        key: 'amount',
        width: 90,
      },
      {
        title: 'Mode of Payment',
        dataIndex: 'modeOfPayment',
        key: 'modeOfPayment',
        width: 100,
      },
      {
        title: 'Voucher Number',
        dataIndex: 'voucherNumber',
        key: 'voucherNumber',
        width:170,
      },
      {
        title: 'Voucher Date',
        dataIndex: 'voucherDate',
        key: 'voucherDate',
        width: 120,
        render: (text) => new Date(text).toLocaleDateString(), // Convert ISO date to local date string
      },
      {
        title: 'Vehicle Number',
        dataIndex: 'vehicleNumber',
        key: 'vehicleNumber',
        width: 120,
      },
      {
        title: 'Owner Name',
        dataIndex: 'ownerName',
        key: 'ownerName',
        width: 160,
        render: (text) => text.charAt(0).toUpperCase() + text.slice(1), // Capitalize owner name
      },
      {
        title: 'Owner Phone',
        dataIndex: 'ownerPhone',
        key: 'ownerPhone',
        width: 140,
      },
      {
        title: 'Narration',
        dataIndex: 'narration',
        key: 'narration',
        width: 110,
      },
      {
        title: 'Action',
        key: 'action',
        width: 90,
        render: (record) => (
          <Space size="middle">
            <Tooltip placement="top" title="Edit">
              <a onClick={() => onEditVoucherClick(record)}><FormOutlined /></a>
            </Tooltip>
            <Tooltip placement="top" title="Delete">
              <a onClick={() => onDeleteVoucherClick(record)}><DeleteOutlined /></a>
            </Tooltip>
          </Space>
        ),
      },
    ];
    return (
      <>


        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredVoucherData}
          scroll={{ x: 800, y: 320 }}
          rowKey="_id"
          pagination={{
            showSizeChanger: false,
            current: currentPage,
            total: totalVoucherData,
            defaultPageSize: currentPageSize, // Set the default page size
           
          }}
        />
       <h1>
     {JSON.stringify(totalVoucherData)}
     </h1>
      </>
    );
  };

  const TransferTruck = ({ rowDataForTruckTransfer }) => {
    const [formData, setFormData] = useState({
      ownerId: '',
      accountId: '',
      registrationNumber: rowDataForTruckTransfer.registrationNumber,
      commission: rowDataForTruckTransfer.commission,
      truckType: rowDataForTruckTransfer.truckType,
      rcBookProof: rowDataForTruckTransfer.rcBookProof,
      phoneNumber: "",
      ownerTransferDate: "",
      ownerTransferToDate: "",
      hubId:selectedHubId
    });

    const handleResetClick = () =>{
console.log('reset clicked')
setFormData({
  ownerId: '',
  accountId: '',
  registrationNumber: rowDataForTruckTransfer.registrationNumber,
  commission: rowDataForTruckTransfer.commission,
  truckType: rowDataForTruckTransfer.truckType,
  rcBookProof: rowDataForTruckTransfer.rcBookProof,
  phoneNumber: "",
  ownerTransferDate: "",
  ownerTransferToDate: "",
});
    }
    const filteredOptions = filteredVoucherData.filter(owner => owner._id !== rowDataForTruckTransfer.ownerId[0]._id);
    const [fileName,setFileName] = useState("");
    const axiosFileUploadRequest = async (file) => {
      console.log(file)
      try {
        const formData = new FormData();
        formData.append("file", file);
        const config = {
          headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${authToken}`
          }
        };
        const response = await API.post(
          `rc-upload`,
          formData,
          config
        );
        const { rcBookProof } = response.data;
        setFileName(file.name)
        setFormData((prevFormData) => ({
          ...prevFormData,
          rcBookProof: rcBookProof,
        }));
        alert("File uploaded successfully");
      } catch (err) {
        console.log(err);
        alert("Failed to upload, retry again!");
      }
    };
    const handleFileChange = (file) => {
      console.log(file)
      axiosFileUploadRequest(file.file);

    };
    const onDateChangeOwnerTransfer = (date, dateString) => {

      // Convert dateString to Unix timestamp
      const unixTimestamp = new Date(dateString).getTime();
      console.log(unixTimestamp)
      setFormData((prevFormData) => ({
        ...prevFormData,
        ownerTransferDate: unixTimestamp,
      }));
    };

    const onDateChangeTransferToDate = (date, dateString) => {
      const unixTimestamp = new Date(dateString).getTime();
      console.log(unixTimestamp)
      setFormData((prevFormData) => ({
        ...prevFormData,
        ownerTransferToDate: unixTimestamp,
      }));
    };
    const handleChange = (name, value) => {
      const headersOb = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        }
      }
      if (name === "ownerId") {
        API.get(`get-owner-bank-details/${value}?page=1&limit=10&hubId=${selectedHubId}`, headersOb)
          .then((res) => {
            const newOwneraccountId = res.data.ownerDetails[0].accountIds[0]._id;
            const phoneNumber = res.data.ownerDetails[0].phoneNumber

            setFormData((prevFormData) => ({
              ...prevFormData,
              ownerId: value,
              accountId: newOwneraccountId,
              phoneNumber: phoneNumber,
            }));

          })
          .catch((err) => {
            console.log(err)
          })
      }
      else {
        // For other fields, update state normally
        setFormData((prevFormData) => ({
          ...prevFormData,
          [name]: value,
        }));
      }
    };



    const handleSubmitTransfer = (e) => {

      e.preventDefault();
      const vehicleId = rowDataForTruckTransfer._id
      const oldOwnerId = rowDataForTruckTransfer.ownerId[0]._id;
      const url = `update-vehicle-ownership-details/${vehicleId}/${oldOwnerId}`

      const headersOb = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        }
      }
      localStorage.setItem("transferPayload", JSON.stringify(formData))
     const res= API.put(url, formData, headersOb)
     .then((res)=>{
       if(res.status==201){
            console.log('Truck transfered successfully:', res.data);
            alert("Owner Transfered successfully")
            window.location.reload();
      }else{
            console.error('Error adding truck data:', res);
           
       alert("error occurred")
          }
     }).catch(err=>{
       console.log(err)
       if(err.response.data.message=="Please choose transfer the later than latest dispatch challan date"){
        alert("Please choose transfer the later than latest dispatch challan date")
       }else{

         alert("error occurred")
       }
     })
    };
    const goBack = () => {
      setshowVoucherTable(true)
      //onData('none')
      setShowTabs(true); // Set showTabs to false when adding owner
    }

    return (
      <>
        <div className="flex flex-col gap-2">

          <div className="flex items-center gap-4">
            <div className="flex"> <img src={backbutton_logo} alt="backbutton_logo" className='w-5 h-5 object-cover cursor-pointer' onClick={goBack} /></div>
            <div className="flex flex-col">
              <h1 className='font-bold' style={{ fontSize: "16px" }}>Transfer Truck</h1>
              <Breadcrumb
                items={[
                  {
                    title: 'OnBoarding',
                  },
                  {
                    title: 'Truck Master',
                  },
                  {
                    title: 'Transfer',
                  },
                ]}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex flex-col gap-1">
              <div className="text-md font-semibold">Vehicle Information</div>
              <div className="text-md font-normal">Enter Truck Details</div>
            </div>
            <div className="flex p-2 " style={{ fontSize: "1rem", borderRadius: "5px", color: "rgb(255, 40, 40)", border: "2px solid rgb(255, 40, 40)", backgroundColor: "rgba(255, 40, 40, 0.2)" }}>
              Please review the owner details before transferring the vehicle owner.
            </div>
            <div className="flex flex-col gap-1">
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col className="gutter-row mt-6" span={6}>
                  <Input
                    placeholder="Vehicle Number*"
                    size="large"
                    name="registrationNumber"
                    value={rowDataForTruckTransfer.registrationNumber}
                  />
                </Col>
                <Col className="gutter-row mt-6" span={6}>
                  <Select
                    name="vehicleType"
                    placeholder="Vehicle Type*"
                    size="large"
                    style={{ width: '100%' }}
                    value={rowDataForTruckTransfer.truckType}
                  />
                </Col>
                <Col className="gutter-row mt-6" span={6}>
                  <Select
                    size='large'
                    placeholder="Owner Mobile Number"
                    style={{ width: '100%' }}
                    name="ownerId"
                    showSearch
                    optionFilterProp="children"
                    filterOption={filterOption}
                    onChange={(value) => handleChange('ownerId', value)}
                  >
                    {filteredOptions.map((owner, index) => (
                      <Option key={index} value={owner._id}>
                        {`${owner.name} - ${owner.phoneNumber}`}
                      </Option>
                    ))}
                  </Select>

                </Col>
                <Col className="gutter-row mt-6" span={6}>
                  <DatePicker
                    placeholder='Owner Transfer From Date'
                    style={{ width: "100%", height: "100%" }}
                    size="large"
                    onChange={onDateChangeOwnerTransfer}
                  />
                </Col>
                <Col className="gutter-row mt-6" span={6}>
                  <DatePicker
                    placeholder='Owner Transfer to Date'
                    style={{ width: "100%", height: "100%" }}
                    size="large"
                    onChange={onDateChangeTransferToDate}
                  />
                </Col>
                <Col className="gutter-row mt-6" span={6}>
                  <div className='flex items-center gap-4'>
                    RC Book* : {' '}
                    <Upload
                      name="rcBook"
                      onChange={handleFileChange}
                      showUploadList={false}
                      beforeUpload={() => false}
                    >
                      <Button size="large" style={{ width: "80px" }} icon={<UploadOutlined />}></Button>
                    </Upload>
                    {fileName}
                  </div>
                </Col>
               


              </Row>
            </div>
          </div>


          <div className="section mx-2 my-4">
            <h2 className='font-semibold text-md'>Vehicle Owner Information</h2>
            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
              <Col className="gutter-row m-1" span={5}>
                <p className='flex flex-col font-normal m-2'><span className="label text-sm">Owner Name</span> {rowDataForTruckTransfer['ownerId'][0].name}</p>
              </Col>
              <Col className="gutter-row m-1" span={5}>
                <p className='flex flex-col font-normal m-2'><span className="label text-sm">Mobile Number</span> {rowDataForTruckTransfer['ownerId'][0].phoneNumber}</p>
              </Col>
              <Col className="gutter-row m-1" span={5}>
                <p className='flex flex-col font-normal m-2'><span className="label text-sm">Email ID</span> {rowDataForTruckTransfer['ownerId'][0].email}</p>
              </Col>
              <Col className="gutter-row m-1" span={5}>
                <p className='flex flex-col font-normal m-2'><span className="label text-sm">PAN CARD No</span> {rowDataForTruckTransfer['ownerId'][0].panNumber}</p>
              </Col>
              <Col className="gutter-row m-1" span={5}>
                <p className='flex flex-col font-normal m-2'><span className="label text-sm">District</span>  {rowDataForTruckTransfer['ownerId'][0].district}</p>
              </Col>
              <Col className="gutter-row m-1" span={5}>
                <p className='flex flex-col font-normal m-2'><span className="label text-sm">State</span> {rowDataForTruckTransfer['ownerId'][0].state}</p>
              </Col>

            </Row>
          </div>
          <div className="flex gap-4">
            <div className="flex gap-4 items-center justify-center reset-button-container">

              <Button onClick={handleResetClick}>Reset</Button>
              <Button type="primary" className="bg-primary" onClick={handleSubmitTransfer}>
                Save
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  };

  const EditTruckDataRow = ({ filterTruckTableData }) => {
    const initialVoucherData = `${filterTruckTableData.ownerId[0].name} - ${filterTruckTableData.ownerId[0].phoneNumber}` ;
    const initialOwnerId = `${filterTruckTableData.ownerId[0]._id}` ;

    const [formData, setFormData] = useState({
      registrationNumber: filterTruckTableData.registrationNumber,
      commission: filterTruckTableData.commission,
      ownerId: initialOwnerId,
      accountId: null,
      vehicleType: filterTruckTableData.truckType,
      rcBookProof: null,
      isCommission: filterTruckTableData.isCommission,
      marketRate: filterTruckTableData.marketRate,
      isMarketRate: filterTruckTableData.isMarketRate,
    });

    const handleResetClick = () => {
      console.log('reset clicked')
     setFormData({
        registrationNumber: filterTruckTableData.registrationNumber,
        commission: filterTruckTableData.commission,
        // ownerId: '',
        ownerId: initialOwnerId,
        accountId: null,
        vehicleType: filterTruckTableData.truckType,
        rcBookProof: null,
        isCommission: filterTruckTableData.isCommission,
        marketRate: filterTruckTableData.marketRate,
        isMarketRate: filterTruckTableData.isMarketRate,
      });
    }
    const [bankData, setBankdata] = useState([])
    const axiosFileUploadRequest = async (file) => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const config = {
          headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${authToken}`
          }
        };

        const response = await API.post(
          `rc-upload`,
          formData,
          config
        );
        const { rcBookProof } = response.data;
        setFormData((prevFormData) => ({
          ...prevFormData,
          rcBookProof: rcBookProof,
        }));
        alert("File uploaded successfully");
      } catch (err) {
        console.log(err);
        alert("Failed to upload, retry again!");
      }
    };
    const handleFileChange = (file) => {
      console.log(file)
      axiosFileUploadRequest(file.file);

    };
    const handleChange = (name, value) => {
      const headersOb = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        }
      }
      if (name === 'isCommission' && value === true) {
        setFormData(prevFormData => ({
          ...prevFormData,
          isCommission: true,
          isMarketRate: false,
          marketRate: "",
        }));
      }
      else if (name === 'isCommission' && value === false) {
        setFormData(prevFormData => ({
          ...prevFormData,
          isCommission: false,
          isMarketRate: true,
          commission: 0,

        }));
      }

      else if (name === "ownerId") {
        const request = API.get(`get-owner-bank-details/${value}?page=1&limit=10&hubId=${selectedHubId}`, headersOb)
          .then((res) => {
            setBankdata(res.data.ownerDetails[0]['accountIds'])
          })
          .catch((err) => {
            console.log(err)
          })
        setFormData((prevFormData) => ({
          ...prevFormData,
          [name]: value,
          accountId: null,
        }));
      }

      else if (name === "registrationNumber") {
        const updatedValue = value.toUpperCase(); // Convert to uppercase 
        setFormData((prevFormData) => ({
          ...prevFormData,
          [name]: updatedValue,
        }));
      }
      else {
        setFormData((prevFormData) => ({
          ...prevFormData,
          [name]: value,
        }));
      }
    };

    const payload = {
      hubId: selectedHubId,
      accountId: formData.accountId,
      commission: formData.commission,
      ownerId: formData.ownerId,
      rcBookProof: formData.rcBookProof,
      registrationNumber: formData.registrationNumber,
      truckType: formData.vehicleType,
      marketRate: formData.marketRate,
      isMarketRate: formData.isMarketRate,
   
    };
    const handleSubmit = async (e) => {
      e.preventDefault();
      const vehicleId = filterTruckTableData._id;
      const oldOwnerId = filterTruckTableData.ownerId[0]._id;
      const url = `update-vehicle-details/${vehicleId}/${oldOwnerId}`;
      const headersOb = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        }
      }

      localStorage.setItem("pay", JSON.stringify(payload))
      
      const res=await API.put(url, payload, headersOb)
      .then((response) => {
        if(response.status == 201){
          alert("Truck data updated successfully");
          window.location.reload();
        }else{
          alert('error occured')
        }
      }).catch(error => {
        console.error('Error updating truck data:', res);
            alert("An error occurred while updating truck data");
      })
     
    };

    const goBack = () => {
      setshowVoucherTable(true)
      //onData('none')
      setShowTabs(true); // Set showTabs to false when adding owner
    }
   
   
    return (
      <>
        <div className="flex flex-col gap-2">

          <div className="flex items-center gap-4">
            <div className="flex"><img src={backbutton_logo} alt="backbutton_logo" className='w-5 h-5 object-cover cursor-pointer' onClick={goBack} /> </div>
            <div className="flex flex-col">
              <h1 className='font-bold' style={{ fontSize: "16px" }}>Edit Truck Details</h1>
              <Breadcrumb
                items={[
                  {
                    title: 'OnBoarding',
                  },
                  {
                    title: 'Truck Master',
                  },
                  {
                    title: 'Edit',
                  },
                ]}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex flex-col gap-1">
              <div className="text-md font-semibold">Vehicle Information</div>
              <div className="text-md font-normal">Enter Truck Details</div>
            </div>
            <div className="flex flex-col gap-1">
            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
              <Col className="gutter-row mt-6" span={6}>
                <Input
                  placeholder="Amount*"
                  size="large"
                  value={formData.amount}
                  name="amount"
                  onChange={(e) => handleChange('amount', e.target.value)}
                />
              </Col>
            
              <Col className="gutter-row mt-6" span={6}>
                <Input
                  placeholder="Narration*"
                  size="large"
                  value={formData.narration}
                  name="narration"
                  onChange={(e) => handleChange('narration', e.target.value)}
                />
              </Col>
              <Col className="gutter-row mt-6" span={6}>
                <Input
                  placeholder="Owner Name*"
                  size="large"
                  value={formData.ownerName}
                  name="ownerName"
                  onChange={(e) => handleChange('ownerName', e.target.value)}
                />
              </Col>
              <Col className="gutter-row mt-6" span={6}>
                <Input
                  placeholder="Owner Phone*"
                  size="large"
                  value={formData.ownerPhone}
                  name="ownerPhone"
                  onChange={(e) => handleChange('ownerPhone', e.target.value)}
                />
              </Col>
              <Col className="gutter-row mt-6" span={6}>
                <Input
                  placeholder="Vehicle Number*"
                  size="large"
                  value={formData.vehicleNumber}
                  name="vehicleNumber"
                  onChange={(e) => handleChange('vehicleNumber', e.target.value)}
                />
              </Col>
              <Col className="gutter-row mt-6" span={6}>
                <DatePicker
                
                style={{width:"100%"}}
                  placeholder="Voucher Date*"
                  size="large"
                  format="DD/MM/YYYY"
                  onChange={(date, dateString) => handleChange('voucherDate', dateString)}
                />
              </Col>
              <Col className="gutter-row mt-6" span={6}>
                <Select
                style={{width:"100%"}}
                  placeholder="Mode of Payment*"
                  size="large"
                  value={formData.modeOfPayment}
                  onChange={(value) => handleChange('modeOfPayment', value)}
                >
                  <Option value="Bank Transfer">Bank Transfer</Option>
                  <Option value="Cash">Cash</Option>
                </Select>
              </Col>
              <Col className="gutter-row mt-6" span={6}>
                <Input
                  placeholder="Voucher Number*"
                  size="large"
                  value={formData.voucherNumber}
                  name="voucherNumber"
                  onChange={(e) => handleChange('voucherNumber', e.target.value)}
                />
              </Col>
              
            </Row>
          </div>
          </div>


          <div className="flex gap-4 items-center justify-center reset-button-container">

            <Button onClick={handleResetClick}>Reset</Button>
            <Button type="primary" className="bg-primary" onClick={handleSubmit}>
              Save
            </Button>
          </div>
        </div>
      </>
    );
  };
  return (
    <>
      {showVoucherTable ? (
        <>
          <Truck onAddVoucherClick={handleAddVoucherClick} />
          <TruckTable onEditVoucherClick={handleEditVoucherClick} onViewVoucherClick={handleViewVoucherClick} onTransferVoucherClick={handleTransferVoucherClick} onDeleteVoucherClick={handleDeleteVoucherClick} />
        </>
      ) : (
        rowDataForTruckEdit ? (
          <>
            {showTransferForm ? (
              <TransferTruck rowDataForTruckTransfer={rowDataForTruckTransfer} />
            ) : (
              showVoucherView ? (
                <ViewTruckDataRow filterTruckTableData={rowDataForTruckView} />
              ) : (
                <EditTruckDataRow filterTruckTableData={rowDataForTruckEdit} />
              )
            )}
          </>
        ) : (
          <VoucherBookForm />
        )
      )}
    </>
  );

}



export default VoucherBook