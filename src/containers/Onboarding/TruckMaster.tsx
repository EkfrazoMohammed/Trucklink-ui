import { useState, useEffect } from 'react';
import type { DatePickerProps } from 'antd';
import { DatePicker, Table, Input, Select, Space, Button, Upload, Tabs, Tooltip, Breadcrumb, Col, Row, Switch, Image } from 'antd';
import { UploadOutlined, DownloadOutlined, EyeOutlined, FormOutlined, DeleteOutlined, SwapOutlined } from '@ant-design/icons';
const { Search } = Input;
import backbutton_logo from "../../assets/backbutton.png"
import { API } from "../../API/apirequest"
import debounce from 'lodash/debounce';
import axios from 'axios';


const filterOption = (input, option) =>
  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;

const TruckMaster = () => {
  const authToken=localStorage.getItem("token");
  const selectedHubId = localStorage.getItem("selectedHubID");
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOwnerData, setFilteredOwnerData] = useState([]);

  const [filteredTruckData, setFilteredTruckData] = useState([]);

  const handleSearch = (e) => {
    setSearchQuery(e);
  };
  const [showTruckTable, setShowTruckTable] = useState(true);
  const [showTruckView, setShowTruckView] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [rowDataForTruckEdit, setRowDataForTruckEdit] = useState(null);
  const [rowDataForTruckView, setRowDataForTruckView] = useState(null);
  const [rowDataForTruckTransfer, setRowDataForTruckTransfer] = useState(null);
  const handleEditTruckClick = (rowData) => {
    setRowDataForTruckEdit(rowData);
    setShowTruckTable(false);
    setShowTransferForm(false);
    setShowTruckView(false)
  };
  const handleViewTruckClick = (rowData) => {
    setRowDataForTruckEdit(rowData);
    setRowDataForTruckView(rowData)
    setShowTruckTable(false);
    setShowTransferForm(false);
    setShowTruckView(true)
  };
  const handleAddTruckClick = () => {
    setRowDataForTruckEdit(null);
    setShowTruckTable(false);
  };

  const handleTransferTruckClick = (rowData) => {
    setShowTransferForm(true);
    setRowDataForTruckTransfer(rowData)
    setRowDataForTruckEdit(rowData);
    setShowTruckTable(false);
  };

  const handleDeleteTruckClick = async (rowData) => {
    console.log("deleting", rowData._id)
    const vehicleId = rowData._id
    const oldOwnerId = rowData.ownerId[0]._id;
    const headersOb = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      }
    }
    const response = await API.delete(`delete-vehicle-details/${vehicleId}/${oldOwnerId}`,headersOb);
    if (response.status === 201) {
      alert("deleted data")
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } else {
      alert(`unable to delete data`)
      console.log(response.data)
    }
  }


  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(50);
  const [totalTruckData, setTotalTruckData] = useState(100)
  const getOwnerData = async (page, limit, selectedHubID) => {
    const headersOb = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      }
    }
    try {

      const pages = page;
      // const limitData = limit ? limit : null;

      const limitData = 600;

      // this.setState({loading: true});
      // const response = searchData ? await API.get(`get-owner-bank-details?page=${pages}&limit=${limitData}&hubId=${selectedHubId}`)
      //   : await API.get(`get-owner-bank-details?page=${pages}&limit=${limitData}&hubId=${selectedHubId}`)
      const response = await API.get(`get-owner-bank-details?page=${pages}&limit=${limitData}&hubId=${selectedHubId}`,headersOb)
      let ownerDetails;
      if (response.data.ownerDetails.length == 0) {
        ownerDetails = response.data.ownerDetails
        setFilteredOwnerData(ownerDetails);
      } else {

        ownerDetails = response.data.ownerDetails[0].data || "";
        if (ownerDetails && ownerDetails.length > 0) {
          const arrRes = ownerDetails.sort(function (a, b) {
            a = a.name.toLowerCase();
            b = b.name.toLowerCase();

            return a < b ? -1 : a > b ? 1 : 0;
          });
          setFilteredOwnerData(arrRes);
        }
      }
    } catch (err) {
      console.log(err)

    }
  };

  const getTableData = async (searchQuery, page, limit, selectedHubID) => {
    console.log(searchQuery)
    const headersOb = {
      headers: {
        "Content-Type": "application/json",
        "Authorization":`Bearer ${authToken}`
      }
    }
    try {

      const pages = page;
      const limitData = limit ? limit : null;

      const searchData = searchQuery ? searchQuery : null;


      const response = searchData ? await API.get(`get-vehicle-details?searchVehicleNumber=${searchData}&page=${pages}&limit=${limitData}&hubId=${selectedHubId}`,headersOb)
        : await API.get(`get-vehicle-details?page=${pages}&limit=${limitData}&hubId=${selectedHubId}`,headersOb);

      let truckDetails;
      if (response.data.truck == 0) {
        truckDetails = response.data.truck
        setFilteredTruckData(truckDetails);
      } else {

        truckDetails = response.data.truck[0].data || "";
        setTotalTruckData(response.data.truck[0].count);

        if (truckDetails && truckDetails.length > 0) {
          const arrRes = truckDetails.sort(function (a, b) {
            a = a.
              registrationNumber.toLowerCase();
            b = b.
              registrationNumber.toLowerCase();

            return a < b ? -1 : a > b ? 1 : 0;
          });

          setFilteredTruckData(arrRes);

          return arrRes;
        }

      }
    } catch (err) {
      console.log(err)

    }
  };
  // Update the useEffect hook to include currentPage and currentPageSize as dependencies
  useEffect(() => {
    getOwnerData(currentPage, currentPageSize, selectedHubId);
    getTableData(searchQuery, currentPage, currentPageSize, selectedHubId);
  }, [searchQuery, currentPage, currentPageSize, selectedHubId]);

  // Truck master
  const Truck = ({ onAddTruckClick }: { onAddTruckClick: () => void }) => {
    return (
<div className='flex gap-2 justify-between  py-3'>
        <Search
          placeholder="Search by Vehicle Number"
          size='large'
          onSearch={handleSearch}
          style={{ width: 320 }}
        />
        <div className='flex gap-2'>
          <Button onClick={onAddTruckClick} className='bg-[#1572B6] text-white'> ADD TRUCK</Button>
        </div>
      </div>

    );
  };

  const TruckMasterForm = () => {

    const [formData, setFormData] = useState({
      registrationNumber: '',
      commission: 0,
      ownerId: '',
      accountId: null,
      vehicleType: '',
      rcBookProof: null,
      isCommission: true,
      marketRate: '',
      isMarketRate: false,
    });
    const [bankData, setBankdata] = useState([])
    const axiosFileUploadRequest = async (file) => {
      console.log(file)
      try {
        const formData = new FormData();
        formData.append("file", file);
       
        const config = {
          headers: {
            "content-type": "multipart/form-data",  
            "Authorization": `Bearer ${authToken}`
          },
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
          commission: 0
        }));
      }

      else if (name === "ownerId") {
        const request = API.get(`get-owner-bank-details/${value}?page=1&limit=10&hubId=${selectedHubId}`,headersOb)
          .then((res) => {
            console.log(res)

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
      } else {
        setFormData((prevFormData) => ({
          ...prevFormData,
          [name]: value,
        }));
      }
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      const payload = {
        hubId: selectedHubId,
        accountId: formData.accountId,
        commission: formData.commission,
        ownerId: formData.ownerId,
        rcBookProof: formData.rcBookProof,
        registrationNumber: formData.registrationNumber,
        truckType: formData.vehicleType,
        marketRate: formData.marketRate,
        isMarketRate: formData.isMarketRate
      };
      const headersOb = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        }
      }
      API.post('create-vehicle', payload,headersOb)
        .then((response) => {
          console.log('Truck data added successfully:', response.data);
          alert("Truck data added successfully")
          window.location.reload();
        })
        .catch((error) => {
          console.error('Error adding truck data:', error);
          let errorResponse = error.response.data

          let errorMessages = [];

          if (errorResponse.error && errorResponse.error.err && errorResponse.error.err.errors) {
            Object.keys(errorResponse.error.err.errors).forEach((key) => {
              const errorMessage = errorResponse.error.err.errors[key].message;
              errorMessages.push(errorMessage);
            });
          }


          if (errorMessages.length > 0) {
            console.log("Error:", errorMessages.join(", "));
            alert("error occurred")
          } else {
            alert("error occurred")
            console.log("Something went wrong");
          }
        });
    };

    return (
      <>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold">Create Truck</h1>
            <img src={backbutton_logo} alt="backbutton_logo" className='w-5 h-5 object-cover cursor-pointer' onClick={() => setShowTruckTable(true)} />

          </div>
          <div className="flex flex-col gap-1">
            <div className="flex flex-col gap-1">
              <div className="text-md font-semibold">Vehicle Information</div>
              <div className="text-md font-normal">Enter Truck Details</div>
            </div>
            <div className="flex flex-col gap-1">
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col className="gutter-row mt-6" span={8}>
                  <Input
                    placeholder="Vehicle Number*"
                    size="large"
                    name="registrationNumber"
                    onChange={(e) => handleChange('registrationNumber', e.target.value)}
                  />
                </Col>
                <Col className="gutter-row mt-6" span={8}>
                  <Select
                    name="vehicleType"
                    placeholder="Vehicle Type*"
                    size="large"
                    style={{ width: '100%' }}
                    options={[
                      { value: 'Open', label: 'Open' },
                      { value: 'Bulk', label: 'Bulk' },
                    ]}
                    onChange={(value) => handleChange('vehicleType', value)}
                  />
                </Col>
                <Col className="gutter-row mt-6" span={8}>

                  <Select
                    size='large'
                    placeholder="Owner Mobile Number"
                    style={{ width: '100%' }}
                    name="ownerId"
                    onChange={(value) => handleChange('ownerId', value)}
                    showSearch
                    optionFilterProp="children"
                    filterOption={filterOption}
                  >
                    {filteredOwnerData.map((owner, index) => (
                      <Option key={index} value={owner._id}>
                        {`${owner.name} - ${owner.phoneNumber}`}
                      </Option>
                    ))}
                  </Select>

                </Col>
                <Col className="gutter-row mt-6" span={8}>
                  <Select
                    size='large'
                    placeholder="Select bank account"
                    style={{ width: '100%' }}
                    name="accountId"
                    value={formData.accountId}
                    onChange={(value) => handleChange('accountId', value)}
                  >
                    {bankData.map((v, index) => (
                      <Option key={v._id} value={v._id}>
                        {`${v.bankName} - ${v.accountNumber}`}
                      </Option>
                    ))}
                  </Select>

                </Col>
                <Col className="gutter-row mt-6" span={8}>
                  <div className='flex items-center gap-4'>
                    RC Book* : {' '}
                    <Upload
                      name="rcBook"
                      onChange={handleFileChange}
                      showUploadList={false}
                      beforeUpload={() => false}
                    >
                      <Button size="large" style={{width:"110px"}} icon={<UploadOutlined />}></Button>
                    </Upload>
                  </div>
                </Col>

                <Col className="gutter-row mt-6 flex gap-2" span={8}>
                  <div>
                    {/* {formData.isCommission ? <>Commission %*</> : <>Market Rate (Rs)*</>} */}
                    {formData.isCommission ? <>Commission%*</> : <>Commission%*</>}
                    <Switch
                      defaultChecked={formData.isCommission}
                      name="isCommission"
                      onChange={(checked) => handleChange('isCommission', checked)}
                    />
                  </div>

                  {formData.isCommission ? (
                    <>
                      <Input
                        placeholder="Enter Commission %*"
                        type='number'
                        size="large"
                        maxLength={2}
                        name="commission"
                        value={formData.commission}
                        onChange={(e) => handleChange('commission', e.target.value)}
                      />
                    </>
                  ) : (
                    <>
                      {/* <Input
                        placeholder="Enter Market Rate"
                        size="large"
                        type='number'
                        name="marketRate"
                        value={formData.marketRate}
                        onChange={(e) => handleChange('marketRate', e.target.value)}
                      /> */}
                    </>
                  )}
                </Col>
              </Row>
            </div>
          </div>


          <div className="flex gap-4 items-center justify-center reset-button-container">

            <Button>Reset</Button>
            <Button type="primary" className="bg-primary" onClick={handleSubmit}>
              Save
            </Button>
          </div>
        </div>
      </>
    );
  };

  const ViewTruckDataRow = ({ filterTruckTableData }) => {

    return (
      <>
        <div className="flex flex-col gap-2">
        
          <div className="flex items-center gap-4">
            <div className="flex"><img src={backbutton_logo} alt="backbutton_logo" className='w-5 h-5 object-cover cursor-pointer' onClick={() => setShowTruckTable(true)} /> </div>
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

  const TruckTable = ({ onEditTruckClick, onTransferTruckClick, onViewTruckClick, onDeleteTruckClick }) => {
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
        width: 40,
      },
      {
        title: 'Vehicle Number',
        dataIndex: 'registrationNumber',
        key: 'registrationNumber',
        width: 80,
      },
      {
        title: 'Vehicle Type',
        dataIndex: 'truckType',
        key: 'truckType',
        width: 80,
        render:(_,record)=>{
          return record.truckType.charAt(0).toUpperCase()+record.truckType.slice(1)
        }
      },
      {
        title: 'RC Book',
        dataIndex: 'rcBookProof',
        key: 'rcBookProof',
        width: 80,
        render: rcBookProof => (
          rcBookProof ? <Image src={rcBookProof} alt="img" width={50} /> : null
        )
      },
      {
        title: 'Commission %',
        dataIndex: 'commission',
        key: 'commission',
        width: 60,
      },

      {
        title: 'Action',
        key: 'action',
        width: 80,
        render: (record: unknown) => (
          <Space size="middle">
            <Tooltip placement="top" title="Transfer"><a onClick={() => handleTransferTruckClick(record)}><SwapOutlined /></a></Tooltip>
            <Tooltip placement="top" title="Preview"><a onClick={() => onViewTruckClick(record)}><EyeOutlined /></a></Tooltip>
            <Tooltip placement="top" title="Edit"><a onClick={() => onEditTruckClick(record)}><FormOutlined /></a></Tooltip>
            <Tooltip placement="top" title="Delete"><a onClick={() => onDeleteTruckClick(record)}><DeleteOutlined /></a></Tooltip>
          </Space>
        ),
      },
    ];


    // Update the changePagination and changePaginationAll functions to set currentPage and currentPageSize
    const changePagination = async (pageNumber, pageSize) => {
      try {
        setCurrentPage(pageNumber);
        setCurrentPageSize(pageSize);
        const newData = await getTableData(searchQuery, pageNumber, pageSize, selectedHubId);
        setFilteredTruckData(newData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const changePaginationAll = async (pageNumber, pageSize) => {
      try {
        setCurrentPage(pageNumber);
        setCurrentPageSize(pageSize);
        const newData = await getTableData(searchQuery, pageNumber, pageSize, selectedHubId);
        setFilteredTruckData(newData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    return (
      <>


        <Table
          rowSelection={rowSelection}
          columns={columns}
           dataSource={filteredTruckData}
          scroll={{ x: 800, y: 320 }}
          rowKey="_id"
          pagination={{
            position: ['bottomCenter'],
            showSizeChanger: false,
            current: currentPage,
            total: totalTruckData,
            defaultPageSize: currentPageSize, // Set the default page size
            onChange: changePagination,
            onShowSizeChange: changePaginationAll,
          }}
        />
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
      // // change here
      // transferDate: "2024-04-30T10:33:29.917Z",
      // userId: "663a0e76e1d51550194c9320",

    });
    // Assuming filteredOwnerData is the filtered array of owner data
    const filteredOptions = filteredOwnerData.filter(owner => owner._id !== rowDataForTruckTransfer.ownerId[0]._id);
    const axiosFileUploadRequest = async (file) => {
      console.log(file)
      try {
        const formData = new FormData();
        formData.append("file", file);
        const config = {
          headers: {
            "content-type": "multipart/form-data",
          },
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
        API.get(`get-owner-bank-details/${value}?page=1&limit=10&hubId=${selectedHubId}`,headersOb)
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
      API.put(url, formData, headersOb)
        .then((response) => {
          console.log('Truck transfered successfully:', response.data);
          alert("Owner Transfered successfully")
          window.location.reload();
        })
        .catch((error) => {
          console.error('Error adding truck data:', error);
          alert("error occurred")
        });
    };

    return (
      <>
        <div className="flex flex-col gap-2">
          
          <div className="flex items-center gap-4">
            <div className="flex"> <img src={backbutton_logo} alt="backbutton_logo" className='w-5 h-5 object-cover cursor-pointer' onClick={() => setShowTruckTable(true)} /></div>
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
                  <div className='flex items-center  gap-4'>
                    RC Book* : {' '}
                    <Upload
                      name="rcBook"
                      onChange={handleFileChange}
                      showUploadList={false}
                      beforeUpload={() => false}
                    >
                      <Button size="large"  style={{width:"170px"}} icon={<UploadOutlined />}></Button>
                    </Upload>
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

            <Button >Reset</Button>
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
    const [formData, setFormData] = useState({
      registrationNumber: filterTruckTableData.registrationNumber,
      commission: filterTruckTableData.commission,
      // ownerId:filterTruckTableData.ownerId[0]._id,
      ownerId: '',
      accountId: null,
      vehicleType: filterTruckTableData.truckType,
      rcBookProof: null,
      isCommission: filterTruckTableData.isCommission,
      marketRate: filterTruckTableData.marketRate,
      isMarketRate: filterTruckTableData.isMarketRate,
    });
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
        const request = API.get(`get-owner-bank-details/${value}?page=1&limit=10&hubId=${selectedHubId}`,headersOb)
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
      } else {
        setFormData((prevFormData) => ({
          ...prevFormData,
          [name]: value,
        }));
      }
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      const payload = {
        hubId: selectedHubId,
        accountId: formData.accountId,
        commission: formData.commission,
        ownerId: formData.ownerId,
        rcBookProof: formData.rcBookProof,
        registrationNumber: formData.registrationNumber,
        truckType: formData.vehicleType,
        marketRate: formData.marketRate,
        isMarketRate: formData.isMarketRate
      };
      const vehicleId = filterTruckTableData._id;
      const oldOwnerId = filterTruckTableData.ownerId[0]._id;
      const url = `update-vehicle-details/${vehicleId}/${oldOwnerId}`;
      const headersOb = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        }
      }

      API.put(url, payload, headersOb)
        .then((response) => {
          alert("Truck data updated successfully");
          window.location.reload();
        })
        .catch((error) => {
          console.error('Error updating truck data:', error);
          alert("An error occurred while updating truck data");
        });
    };


    return (
      <>
        <div className="flex flex-col gap-2">
          
          <div className="flex items-center gap-4">
            <div className="flex"><img src={backbutton_logo} alt="backbutton_logo" className='w-5 h-5 object-cover cursor-pointer' onClick={() => setShowTruckTable(true)}  /> </div>
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
                <Col className="gutter-row mt-6" span={8}>
                  <Input
                    placeholder="Vehicle Number*"
                    size="large"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={(e) => handleChange('registrationNumber', e.target.value)}
                  />
                </Col>
                <Col className="gutter-row mt-6" span={8}>
                  <Select
                    name="vehicleType"
                    placeholder="Vehicle Type*"
                    size="large"
                    style={{ width: '100%' }}
                    value={formData.vehicleType}
                    options={[
                      { value: 'Open', label: 'Open' },
                      { value: 'Bulk', label: 'Bulk' },
                    ]}
                    onChange={(value) => handleChange('vehicleType', value)}
                  />
                </Col>
                <Col className="gutter-row mt-6" span={8}>

                  <Select
                    size='large'
                    placeholder="Owner Mobile Number"
                    style={{ width: '100%' }}
                    name="ownerId"
                    onChange={(value) => handleChange('ownerId', value)}
                    showSearch
                    optionFilterProp="children"
                    filterOption={filterOption}
                  >
                    {filteredOwnerData.map((owner, index) => (
                      <Option key={index} value={owner._id}>
                        {`${owner.name} - ${owner.phoneNumber}`}
                      </Option>
                    ))}
                  </Select>

                </Col>
                <Col className="gutter-row mt-6" span={8}>
                  <Select
                    size='large'
                    placeholder="Select bank account"
                    style={{ width: '100%' }}
                    name="accountId"
                    onChange={(value) => handleChange('accountId', value)}
                  >
                    {bankData.map((v, index) => (
                      <Option key={v._id} value={v._id}>
                        {`${v.bankName} - ${v.accountNumber}`}
                      </Option>
                    ))}
                  </Select>

                </Col>
                <Col className="gutter-row mt-6" span={8}>
                  <div className='flex items-center gap-4'>
                    RC Book* : {' '}
                    <Upload
                      name="rcBook"
                      onChange={handleFileChange}
                      showUploadList={false}
                      beforeUpload={() => false}
                    >
                      <Button size="large" style={{width:"110px"}} icon={<UploadOutlined />}></Button>
                    </Upload>
                  </div>
                </Col>

                <Col className="gutter-row mt-6 flex gap-2" span={8}>
                  <div>
                    {formData.isCommission ? <>Commission %*</> : <>Market Rate (Rs)*</>}
                    <Switch
                      defaultChecked={formData.isCommission}
                      name="isCommission"
                      onChange={(checked) => handleChange('isCommission', checked)}
                    />
                  </div>

                  {formData.isCommission ? (
                    <>
                      <Input
                        placeholder="Enter Commission %*"
                        type='number'
                        size="large"
                        maxLength={2}
                        name="commission"
                        value={formData.commission}
                        onChange={(e) => handleChange('commission', e.target.value)}
                      />
                    </>
                  ) : (
                    <>
                      {/* <Input
                        placeholder="Enter Market Rate"
                        size="large"
                        type='number'
                        name="marketRate"
                        value={formData.marketRate}
                        onChange={(e) => handleChange('marketRate', e.target.value)}
                      /> */}
                    </>
                  )}
                </Col>
              </Row>
            </div>
          </div>


          <div className="flex gap-4 items-center justify-center reset-button-container">

            <Button>Reset</Button>
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
      {showTruckTable ? (
        <>
          <Truck onAddTruckClick={handleAddTruckClick} />
          <TruckTable onEditTruckClick={handleEditTruckClick} onViewTruckClick={handleViewTruckClick} onTransferTruckClick={handleTransferTruckClick} onDeleteTruckClick={handleDeleteTruckClick} />
        </>
      ) : (
        rowDataForTruckEdit ? (
          <>
            {showTransferForm ? (
              <TransferTruck rowDataForTruckTransfer={rowDataForTruckTransfer} />
            ) : (
              showTruckView ? (
                <ViewTruckDataRow filterTruckTableData={rowDataForTruckEdit} />
              ) : (
                <EditTruckDataRow filterTruckTableData={rowDataForTruckEdit} />
              )
            )}
          </>
        ) : (
          <TruckMasterForm />
        )
      )}
    </>
  );

}



export default TruckMaster