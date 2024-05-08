import { useState, useEffect } from 'react';
import type { DatePickerProps } from 'antd';
import { DatePicker,Table, Input, Select, Space, Button, Upload, Tabs, Tooltip, Breadcrumb, Col, Row,Switch } from 'antd';
import { UploadOutlined, DownloadOutlined, EyeOutlined, FormOutlined, DeleteOutlined,SwapOutlined  } from '@ant-design/icons';
const { Search } = Input;
import backbutton_logo from "../../assets/backbutton.png"
import { API } from "../../API/apirequest"
import debounce from 'lodash/debounce';
import axios from 'axios';

  const TruckMaster = () => {
    
  const selectedHubId = localStorage.getItem("selectedHubID");
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOwnerData, setFilteredOwnerData] = useState([]);

  const [filteredTruckData, setFilteredTruckData] = useState([]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  // Debounce the handleSearch function
  // const debouncedSearch = debounce(handleSearch, 800); // Adjust the debounce delay as needed

    const [showTruckTable, setShowTruckTable] = useState(true);
    const [rowDataForTruckEdit, setRowDataForTruckEdit] = useState(null);
    const [rowDataForTruckTransfer, setRowDataForTruckTransfer] = useState(null);
    const handleEditTruckClick = (rowData) => {
      setRowDataForTruckEdit(rowData);
      setShowTruckTable(false);
      setShowTransferForm(false);
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

   // Initialize state variables for current page and page size
   const [currentPage, setCurrentPage] = useState(1);
   const [currentPageSize, setCurrentPageSize] = useState(50);
    const [totalTruckData, setTotalTruckData] = useState(100)
    const getOwnerData = async (searchQuery, page, limit,selectedHubID) => {
      try {
  
        const pages = page;
        // const limitData = limit ? limit : null;
        
        const limitData = 600;
  
        const searchData = searchQuery ? searchQuery : null;
  
        // this.setState({loading: true});
        const response = searchData ? await API.get(`get-owner-bank-details?searchOwnerName=${searchData}&page=${pages}&limit=${limitData}&hubId=${selectedHubId}`)
          : await API.get(`get-owner-bank-details?page=${pages}&limit=${limitData}&hubId=${selectedHubId}`)
        // const response = await axios.get(`${BASE_URL}get-owner-bank-details?page=${pages}&limit=50`) 
        let ownerDetails;
        if(response.data.ownerDetails.length == 0){
          ownerDetails = response.data.ownerDetails
          setFilteredOwnerData(ownerDetails);
        }else{
        
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

    const getTableData = async (searchQuery, page, limit,selectedHubID) => {
        try {
    
          const pages = page;
          const limitData = limit ? limit : null;
    
          const searchData = searchQuery ? searchQuery : null;
    
       
          const response = searchData ?  await API.get(`get-vehicle-details?searchVehicleNumber=${searchData}&page=${pages}&limit=${limitData}&hubId=${selectedHubId}`)
          : await API.get(`get-vehicle-details?page=${pages}&limit=${limitData}&hubId=${selectedHubId}`);  
    
          let truckDetails;
      if(response.data.truck == 0){
        truckDetails = response.data.truck
        setFilteredTruckData(truckDetails);
      }else{
      
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
      }catch (err) {
          console.log(err)
    
        }
      };
  //    // Update the useEffect hook to include currentPage and currentPageSize as dependencies
  useEffect(() => {
    getOwnerData(searchQuery, currentPage, currentPageSize,selectedHubId);
    getTableData(searchQuery, currentPage, currentPageSize,selectedHubId);
  }, [searchQuery, currentPage, currentPageSize,selectedHubId]);
  
  // Truck master
  const Truck = ({ onAddTruckClick }: { onAddTruckClick: () => void }) => {
    return (
      <div className='flex gap-2 justify-between p-2'>

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

    // const ownerIdSelect = filterOwnerTableData
    const [formData, setFormData] = useState({
      registrationNumber: '',
      commission: '',
      ownerId: '',
      accountId:'',
      vehicleType: '',
      rcBook: null,
      isCommission: true,
      marketRateCommission: '',
    });

    const handleChange = (name, value) => {
      if (name === "isCommission") {
        if (!value) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
            commission: "",
          }));
        } else {
          // If isCommission is true, set marketRateCommission to an empty string
          setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
            marketRateCommission: "",
          }));
        }
      } else {
        // For other fields, update state normally
        setFormData((prevFormData) => ({
          ...prevFormData,
          [name]: value,
        }));
      }
    };
    console.log(formData)

    const handleSubmit = (e) => {
      e.preventDefault();
      const payload = {
        hubId:selectedHubId,
        accountId:formData.accountId,
        commission: formData.commission,
        ownerId: formData.ownerId,
        rcBook: null,
        registrationNumber: formData.registrationNumber,
        truckType: formData.vehicleType,
        "marketRate":1000,
        "isMarketRate":true
      };
     const oldPayload= {
       "hubId":"6634de2e2588845228b2dbe4",
      "accountId": "66386d5267827a336ccac791",
"commission": "2",
"driverName": "AA",
"driverPhoneNumber": "1231231343",
"ownerId": "66386d5267827a336ccac78e",
"rcBookProof": null,
"registrationNumber": "KA01KA1287",
"truckType": "bag"
}

      axios.post('https://trucklinkuatnew.thestorywallcafe.com/prod/v1/create-vehicle', payload)
        .then((response) => {
          console.log('Truck data added successfully:', response.data);
          window.location.reload(); // Reload the page or perform any necessary action
        })
        .catch((error) => {
          console.error('Error adding truck data:', error);
        });
    };

    return (
      <>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold">Create Truck</h1>
            {/* Breadcrumb component */}
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
                      { value: 'open', label: 'Open' },
                      { value: 'bulk', label: 'Bulk' },
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
                  >
                    {filteredOwnerData.map((owner, index) => (
                      <Option key={index} value={owner._id}>
                        {`${owner.name} - ${owner.phoneNumber}`}
                      </Option>
                    ))}
                  </Select> 

                </Col>
                <Col className="gutter-row mt-6" span={8}>

                  {/* <Select
    size='large'
    placeholder="Select bank account"
    style={{ width: '100%' }}
    name="accountId"
    onChange={(value) => handleChange('accountId', value.target.value)}
>
    {filteredOwnerData.map((acc, index) => (
        acc['accountIds'].map((v, i) => (
            <Option key={v._id} value={v._id}> 
                {`${v.bankName} - ${v.accountNumber}`}
            </Option>
        ))
    ))}
</Select> */}

<Select
  size='large'
  placeholder="Select bank account"
  style={{ width: '100%' }}
  name="accountId"
  onChange={(value) => handleChange('accountId', value)}
>
  {filteredOwnerData.map((acc, index) => (
    acc['accountIds'].map((v, i) => (
      <Option key={v._id} value={v._id}> 
        {`${v.bankName} - ${v.accountNumber}`}
      </Option>
    ))
  ))}
</Select>

                </Col>
                <Col className="gutter-row mt-6" span={8}>
                  <div>
                    RC Book*: {' '}
                    <Upload name="rcBook">
                      <Button icon={<UploadOutlined />}>Upload</Button>
                    </Upload>
                  </div>
                </Col>

                <Col className="gutter-row mt-6 flex gap-2" span={8}>
                  <div>
                  {formData.isCommission ? <>Commission %*</>:<>Market Rate (Rs)*</>} 
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
                        size="large"
                        name="commission"
                        onChange={(e) => handleChange('commission', e.target.value)}
                      />
                  </>
                ) : (
                  <>
                  <Input
                        placeholder="Enter Market Rate"
                        size="large"
                        name="commission"
                        onChange={(e) => handleChange('commission', e.target.value)}
                      />
                  </>         
                )}
</Col>
              </Row>
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={() => setShowOwnerTable(true)}>Reset</Button>
            <Button type="primary" className="bg-primary" onClick={handleSubmit}>
              Save
            </Button>
          </div>
        </div>
      </>
    );
  };

  const ViewTruckDataRow = ({ filterTruckTableData }) => {
  const [formData, setFormData] = useState({
    registrationNumber: '',
    commission: '',
    ownerId: '',
    accountId:'',
    vehicleType: '',
    rcBook: null,
    isCommission: true,
    marketRateCommission: '',
  });

  const handleChange = (name, value) => {
    if (name === "isCommission") {
      if (!value) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          [name]: value,
          commission: "",
        }));
      } else {
        // If isCommission is true, set marketRateCommission to an empty string
        setFormData((prevFormData) => ({
          ...prevFormData,
          [name]: value,
          marketRateCommission: "",
        }));
      }
    } else {
      // For other fields, update state normally
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  };
  console.log(formData)
  const onDateChange: DatePickerProps['onChange'] = (date, dateString) => {
    console.log(date, dateString);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      hubId:selectedHubId,
      accountId:formData.accountId,
      commission: formData.commission,
      ownerId: formData.ownerId,
      rcBook: null,
      registrationNumber: formData.registrationNumber,
      truckType: formData.vehicleType,
      marketRateCommission: "0",
    };
   const oldPayload= {
     "hubId":"6634de2e2588845228b2dbe4",
    "accountId": "66386d5267827a336ccac791",
"commission": "2",
"driverName": "AA",
"driverPhoneNumber": "1231231343",
"ownerId": "66386d5267827a336ccac78e",
"rcBookProof": null,
"registrationNumber": "KA01KA1287",
"truckType": "bag"
}

    await API.post('create-vehicle', payload)
      .then((response) => {
        console.log('Truck data added successfully:', response.data);
        window.location.reload(); // Reload the page or perform any necessary action
      })
      .catch((error) => {
        console.error('Error adding truck data:', error);
      });
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold">Edit Truck</h1>
          {/* Breadcrumb component */}
          <img src={backbutton_logo} alt="backbutton_logo" className='w-5 h-5 object-cover cursor-pointer' onClick={() => setShowTruckTable(true)} />

        </div>
        <div className="flex flex-col gap-1">
          <div className="flex flex-col gap-1">
            <div className="text-md font-semibold">Vehicle Information</div>
            <div className="text-md font-normal">Edit Truck Details</div>
          </div>
          <p>{JSON.stringify(filterTruckTableData,null,2)}</p>
          <div className="flex flex-col gap-1">
            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
              <Col className="gutter-row mt-6" span={6}>
                <Input
                  placeholder="Vehicle Number*"
                  size="large"
                  name="registrationNumber"
                value={filterTruckTableData.registrationNumber}
                  // onChange={(e) => handleChange('registrationNumber', e.target.value)}
                />
              </Col>
              <Col className="gutter-row mt-6" span={6}>
                <Select
                  name="vehicleType"
                  placeholder="Vehicle Type*"
                  size="large"
                  style={{ width: '100%' }}
                  // options={[
                  //   { value: 'open', label: 'Open' },
                  //   { value: 'bulk', label: 'Bulk' },
                  // ]}
                  value={filterTruckTableData.truckType}
                  // onChange={(value) => handleChange('vehicleType', value)}
                />
              </Col>
              <Col className="gutter-row mt-6" span={6}>

                <Select
                  size='large'
                  placeholder="Owner Mobile Number"
                  style={{ width: '100%' }}
                  name="ownerId"
                  onChange={(value) => handleChange('ownerId', value)}
                >
                  {filteredOwnerData.map((owner, index) => (
                    <Option key={index} value={owner._id}>
                      {`${owner.name} - ${owner.phoneNumber}`}
                    </Option>
                  ))}
                </Select> 

              </Col>
              <Col className="gutter-row mt-6" span={6}>
              <DatePicker
              placeholder='Owner Transfer From Date'
              style={{width: "100%", height: "100%"}}
              size="large"
              onChange={onDateChange} 
              />
              </Col>
              <Col className="gutter-row mt-6" span={6}>
              <DatePicker
              placeholder='Owner Transfer to Date'
              style={{width: "100%", height: "100%"}}
              size="large"
              onChange={onDateChange} 
              />
              </Col>
              <Col className="gutter-row mt-6" span={6}>
                <div  style={{width:"100%"}} >
                  RC Book*: {' '}
                  <Upload name="rcBook">
                    <Button    style={{width:"100%"}} size="large" icon={<UploadOutlined />}>Upload</Button>
                  </Upload>
                </div>
              </Col>

            
            </Row>
          </div>
        </div>

        <div className="flex gap-4">
          {/* <Button onClick={() => setShowOwnerTable(true)}>Reset</Button> */}
          <Button type="primary" className="bg-primary" onClick={handleSubmit}>
            Save
          </Button>
        </div>
      </div>
    </>
  );
  };
  const [showTransferForm, setShowTransferForm] = useState(false);
 
  const TruckTable = ({  onEditTruckClick,onTransferTruckClick }) => {
    console.log(filteredTruckData)
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
      },
      // {
      //   title: 'Owner Number',
      //   dataIndex: 'phoneNumber',
      //   key: 'phoneNumber',
      //   width: 80,
      // },
      {
        title: 'Commission %',
        dataIndex: 'commission',
        key: 'commission',
        width: 80,
      },
      {
        title: 'Action',
        key: 'action',
        width: 80,
        render: (record: unknown) => (
          <Space size="middle">
            <Tooltip placement="top" title="Transfer"><a onClick={()=>handleTransferTruckClick(record)}><SwapOutlined /></a></Tooltip>
            <Tooltip placement="top" title="Preview"><a onClick={() => onEditTruckClick(record)}><EyeOutlined /></a></Tooltip>
            <Tooltip placement="top" title="Edit"><a onClick={() => onEditTruckClick(record)}><FormOutlined /></a></Tooltip>
            <Tooltip placement="top" title="Delete"><a><DeleteOutlined /></a></Tooltip>
          </Space>
        ),
      },
    ];


    // Update the changePagination and changePaginationAll functions to set currentPage and currentPageSize
    const changePagination = async (pageNumber, pageSize) => {
        try {
          setCurrentPage(pageNumber);
          setCurrentPageSize(pageSize);
          const newData = await getTableData(searchQuery, pageNumber, pageSize,selectedHubId);
          setFilteredTruckData(newData);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
  
      const changePaginationAll = async (pageNumber, pageSize) => {
        try {
          setCurrentPage(pageNumber);
          setCurrentPageSize(pageSize);
          const newData = await getTableData(searchQuery, pageNumber, pageSize,selectedHubId);
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
        //   dataSource={filteredTruckData.map(truck => ({
        //     ...truck,
        //     phoneNumber: truck.ownerId[0].phoneNumber // Assuming ownerId contains only one object
        // }))}
        dataSource={filteredTruckData}
          scroll={{ x: 800, y: 320 }}
          rowKey="_id"
          pagination={{
            current: currentPage,
            total: totalTruckData,
            defaultPageSize: currentPageSize, // Set the default page size
            showSizeChanger: true,
            onChange: changePagination,
            onShowSizeChange: changePaginationAll,
          }}
        />
      </>
    );
  };
  
  const TransferTruck = ({rowDataForTruckTransfer}) => {
    console.log(rowDataForTruckTransfer)
  
    const [formData, setFormData] = useState({
      registrationNumber: rowDataForTruckTransfer.registrationNumber,
      commission: rowDataForTruckTransfer.commission,
      ownerId: '',
      accountId:'',
      vehicleType: rowDataForTruckTransfer.truckType,
      rcBook: null,
      isMarketRate: rowDataForTruckTransfer.isMarketRate,
    marketRate:  rowDataForTruckTransfer.marketRate,
    });

    const handleChange = (name, value) => {
      if (name === "isCommission") {
        if (!value) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
            commission: "",
          }));
        } else {
          // If isCommission is true, set marketRateCommission to an empty string
          setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
            marketRateCommission: "",
          }));
        }
      } else {
        // For other fields, update state normally
        setFormData((prevFormData) => ({
          ...prevFormData,
          [name]: value,
        }));
      }
    };
    console.log(formData)
    const onDateChange: DatePickerProps['onChange'] = (date, dateString) => {
      console.log( dateString);
    };

    const handleSubmitTransfer = (e) => {
      e.preventDefault();
      const payload = {
        hubId:selectedHubId,
        accountId:formData.accountId,
        commission: formData.commission,
        ownerId: formData.ownerId,
        rcBook: null,
        registrationNumber: formData.registrationNumber,
        truckType: formData.vehicleType,
        "marketRate":1000,
"isMarketRate":true
      };
     const oldPayload= {
       "hubId":"6634de2e2588845228b2dbe4",
      "accountId": "66386d5267827a336ccac791",
"commission": "2",
"driverName": "AA",
"driverPhoneNumber": "1231231343",
"ownerId": "66386d5267827a336ccac78e",
"rcBookProof": null,
"registrationNumber": "KA01KA1287",
"truckType": "bag"
}

      axios.post('https://trucklinkuatnew.thestorywallcafe.com/prod/v1/create-vehicle', payload)
        .then((response) => {
          console.log('Truck data added successfully:', response.data);
          window.location.reload(); // Reload the page or perform any necessary action
        })
        .catch((error) => {
          console.error('Error adding truck data:', error);
        });
    };

    return (
      <>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold">Transfer Truck</h1>
            {/* Breadcrumb component */}
            <img src={backbutton_logo} alt="backbutton_logo" className='w-5 h-5 object-cover cursor-pointer' onClick={() => setShowTruckTable(true)} />

          </div>
          <div className="flex flex-col gap-1">
            <div className="flex flex-col gap-1">
              <div className="text-md font-semibold">Vehicle Information</div>
              <div className="text-md font-normal">Enter Truck Details</div>
            </div>
            <div className="flex p-2 " style={{fontSize:"1rem",borderRadius:"5px",color:"rgb(255, 40, 40)",border: "2px solid rgb(255, 40, 40)",backgroundColor: "rgba(255, 40, 40, 0.2)"}}>
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
                    // onChange={(e) => handleChange('registrationNumber', e.target.value)}
                  />
                </Col>
                <Col className="gutter-row mt-6" span={6}>
                  <Select
                    name="vehicleType"
                    placeholder="Vehicle Type*"
                    size="large"
                    style={{ width: '100%' }}
                    // options={[
                    //   { value: 'open', label: 'Open' },
                    //   { value: 'bulk', label: 'Bulk' },
                    // ]}
                    value={rowDataForTruckTransfer.truckType}
                    // onChange={(value) => handleChange('vehicleType', value)}
                  />
                </Col>
                <Col className="gutter-row mt-6" span={6}>

                  <Select
                    size='large'
                    placeholder="Owner Mobile Number"
                    style={{ width: '100%' }}
                    name="ownerId"
                    onChange={(value) => handleChange('ownerId', value)}
                  >
                    {filteredOwnerData.map((owner, index) => (
                      <Option key={index} value={owner._id}>
                        {`${owner.name} - ${owner.phoneNumber}`}
                      </Option>
                    ))}
                  </Select> 

                </Col>
                <Col className="gutter-row mt-6" span={6}>
                <DatePicker
                placeholder='Owner Transfer From Date'
                style={{width: "100%", height: "100%"}}
                size="large"
                onChange={onDateChange} 
                />
                </Col>
                <Col className="gutter-row mt-6" span={6}>
                <DatePicker
                placeholder='Owner Transfer to Date'
                style={{width: "100%", height: "100%"}}
                size="large"
                onChange={onDateChange} 
                />
                </Col>
                <Col className="gutter-row mt-6" span={6}>
                  <div  style={{width:"100%"}} >
                    RC Book*: {' '}
                    <Upload name="rcBook">
                      <Button    style={{width:"100%"}} size="large" icon={<UploadOutlined />}>Upload</Button>
                    </Upload>
                  </div>
                </Col>

              
              </Row>
            </div>
          </div>

          <div className="flex gap-4">
            {/* <Button onClick={() => setShowOwnerTable(true)}>Reset</Button> */}
            <Button type="primary" className="bg-primary" onClick={handleSubmitTransfer}>
              Save
            </Button>
          </div>
        </div>
        <>{JSON.stringify(rowDataForTruckTransfer['ownerId'],null,2)}</>
      </>
    );
  };
  
    return (
      <>
        <>
          {showTruckTable ? (
            <>
              <Truck onAddTruckClick={handleAddTruckClick} />
              <TruckTable onEditTruckClick={handleEditTruckClick} onTransferTruckClick={handleTransferTruckClick}/>
            </>
          ) : (
            rowDataForTruckEdit ? <>
              {showTransferForm ? <TransferTruck rowDataForTruckTransfer={rowDataForTruckTransfer} /> :
              <ViewTruckDataRow filterTruckTableData={rowDataForTruckEdit} />
          }
              </>
            : (
              
                  <TruckMasterForm />
            )
          )}
        </>
      </>
    )
  }
  

  
  export default TruckMaster