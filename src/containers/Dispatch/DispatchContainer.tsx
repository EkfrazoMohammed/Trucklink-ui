import { useState, useEffect } from 'react';
import {API} from "../../API/apirequest"
import {  DatePicker, Table, Input, Select, Space, Button, Upload,  Tooltip, Breadcrumb, Col,  Row,Switch,Image } from 'antd';
import axios from "axios"
import { UploadOutlined, DownloadOutlined, EyeOutlined, FormOutlined, DeleteOutlined,PrinterOutlined,SwapOutlined   } from '@ant-design/icons';

const { Search } = Input;
import backbutton_logo from "../../assets/backbutton.png"

import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch } from '../../redux/store'; // Import RootState and AppDispatch from your Redux store
import type { DatePickerProps } from 'antd';

const onChange: DatePickerProps['onChange'] = (date, dateString) => {
  console.log(date, dateString);
};
import { fetchOwnerData, addOwnerDataAccount } from "./../../redux/reducers/onboardingReducer";
interface RootState {
  onboarding: {
    ownerData: [];
  };
}

const DispatchContainer = () => {
    
  const selectedHubId = localStorage.getItem("selectedHubID");
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOwnerData, setFilteredOwnerData] = useState([]);

  const [challanData, setchallanData] = useState([]);

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
    
    const getTableData = async () => {
        try {
    
        
    
          const searchData = searchQuery ? searchQuery : null;
    
       
          // const response = searchData ?  await axios.post(`http://localhost:3000/prod/v1/get-challan-data?page=1&limit=50`)
          // : await axios.post(`http://localhost:3000/prod/v1/get-challan-data?page=1&limit=50`);  
          const response = searchData ?  await API.post(`get-challan-data?page=1&limit=50&hubId=${selectedHubId}`)
          : await API.post(`get-challan-data?page=1&limit=50&hubId=${selectedHubId}`);  
    
          let allChallans;
          console.log(response)
      if(response.data.disptachData == 0){
        allChallans = response.data.disptachData
        setchallanData(allChallans);
      }else{
      
      allChallans = response.data.disptachData[0].data || "";
      
          setTotalTruckData(allChallans);
    
          if (allChallans && allChallans.length > 0) {
            const arrRes = allChallans.sort(function (a, b) {
              a = a.
              registrationNumber.toLowerCase();
              b = b.
              registrationNumber.toLowerCase();
    
              return a < b ? -1 : a > b ? 1 : 0;
            });
    
            setchallanData(arrRes);
    
            return arrRes;
          }
    
        } 
      }catch (err) {
          console.log(err)
    
        }
      };
  //    // Update the useEffect hook to include currentPage and currentPageSize as dependencies
  useEffect(() => {
    getTableData();
  }, [searchQuery, currentPage, currentPageSize,selectedHubId]);
  
  // Truck master
  const Truck = ({ onAddTruckClick }: { onAddTruckClick: () => void }) => {
    return (
      <div className='flex gap-2 flex-col justify-between p-2'>

<div className='flex gap-2'>
        <Search
          placeholder="Search by Vehicle Number"
          size='large'
          onSearch={handleSearch}
          style={{ width: 320 }}
        />
         <DatePicker onChange={onChange} placeholder='From date' /> -
         <DatePicker onChange={onChange}  placeholder='To date'/>
         <Select
                    name="materialType"
                    placeholder="Material Type*"
                    size="large"
                    style={{width:"20%"}}
                    options={[
                      { value: 'cement', label: 'cement' },
                      { value: 'flyash', label: 'flyash' },
                    ]}
                    onChange={(value) => handleChange('materialType', value)}
                  />
                  <Select
                    name="truckType"
                    placeholder="Truck Type*"
                    size="large"
                    style={{width:"20%"}}
                    options={[
                      { value: 'open', label: 'Open' },
                      { value: 'bulk', label: 'Bulk' },
                    ]}
                    onChange={(value) => handleChange('vehicleType', value)}
                  />

                  </div>
        <div className='flex gap-2 justify-end'>
        <Upload>
            <Button icon={<UploadOutlined />}></Button>
          </Upload>
          
          <Upload>
            <Button icon={<DownloadOutlined />}></Button>
          </Upload>
          <Upload>
            <Button icon={<PrinterOutlined />}></Button>
          </Upload>
          <Button  onClick={onAddTruckClick} className='bg-[#1572B6] text-white'> CREATE CHALLAN</Button>
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
            <h1 className="text-xl font-bold">Create Challan</h1>
            {/* Breadcrumb component */}
            <img src={backbutton_logo} alt="backbutton_logo" className='w-5 h-5 object-cover cursor-pointer' onClick={() => setShowTruckTable(true)} />

          </div>
          <div className="flex flex-col gap-1">
            <div className="flex gap-1 justify-between">
              <div>

              <div className="text-md font-semibold">Challan Details</div>
              <div className="text-md font-normal">Enter Challan Details</div>
              </div>
              <div className='flex gap-2'>
              Market Rate
              <Switch
                      defaultChecked={formData.isCommission}
                      name="isCommission"
                      onChange={(checked) => handleChange('isCommission', checked)}
                      />
                      </div>
            </div>

            <div className="flex flex-col gap-1">
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col className="gutter-row mt-6" span={6}>
                <Select
                    name="materialType"
                    placeholder="Material Type*"
                    size="large"
                    style={{ width: '100%' }}
                    options={[
                      { value: 'cement', label: 'Cement' },
                      { value: 'others', label: 'Others' },
                    ]}
                    onChange={(value) => handleChange('materialType', value)}
                  />
                </Col>
                <Col className="gutter-row mt-6" span={6}>
                  <Input
                  type="text"
                    name="grNumber"
                    placeholder="grNumber*"
                    size="large"
                    style={{ width: '100%' }}
                    
                    onChange={(value) => handleChange('vehicleType', value)}
                  />
                </Col>
                <Col className="gutter-row mt-6" span={6}>

                  <DatePicker placeholder='GR Date' size="large" style={{width:"100%"}} />

                </Col>
                <Col className="gutter-row mt-6" span={6}>

                <Select
                    name="loadedFrom"
                    placeholder="Loaded From*"
                    size="large"
                    style={{ width: '100%' }}
                    options={[
                      { value: 'bengaluru', label: 'bengaluru' },
                      { value: 'pune', label: 'pune' },
                    ]}
                    onChange={(value) => handleChange('loadedFrom', value)}
                  />

                </Col>
              </Row>
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col className="gutter-row mt-6" span={6}>
                <Select
                    name="deliverTo"
                    placeholder="Deliver To*"
                    size="large"
                    style={{ width: '100%' }}
                    options={[
                      { value: 'chennai', label: 'chennai' },
                      { value: 'nashik', label: 'nashik' },
                    ]}
                    onChange={(value) => handleChange('deliverTo', value)}
                  />
                </Col>
                <Col className="gutter-row mt-6" span={6}>
                  <Select
                    name="vehicleNumber"
                    placeholder="Vehicle Number*"
                    size="large"
                    style={{ width: '100%' }}
                    options={[
                      { value: 'KA01AB1234', label: 'KA01AB1234' },
                      { value: 'KA01AB1234', label: 'KA01AB1234' },
                    ]}
                    onChange={(value) => handleChange('vehicleNumber', value)}
                  />
                </Col>
                <Col className="gutter-row mt-6" span={6}>

                <Select
                    name="vehicleType"
                    placeholder="Vehicle Type*"
                    size="large"
                    style={{ width: '100%' }}
                    value="open"
                    disabled
                    onChange={(value) => handleChange('vehicleNumber', value)}
                  />
                  

                </Col>
                <Col className="gutter-row mt-6" span={6}>

                <Input
                    placeholder="DeliveryNumber*"
                    size="large"
                    name="diesel"
                    onChange={(e) => handleChange('diesel', e.target.value)}
                  />
                </Col>
              </Row>
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col className="gutter-row mt-6" span={6}>
                <Input
                    placeholder="Quantity (M/T)*"
                    size="large"
                    name="diesel"
                    onChange={(e) => handleChange('diesel', e.target.value)}
                  />
                </Col>
                <Col className="gutter-row mt-6" span={6}>
                <Input
                    placeholder="Company Rate*"
                    size="large"
                    name="diesel"
                    onChange={(e) => handleChange('diesel', e.target.value)}
                  />
                </Col>
                
                <Col className="gutter-row mt-6" span={6}>
{formData.isCommission ? <>
  <Input
                    placeholder="Market Rate Rs*"
                    size="large"
                    name="diesel"
                    onChange={(e) => handleChange('diesel', e.target.value)}
                  />
</>:<></>}

                </Col>
              </Row>

              
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex gap-1 justify-between">
              <div>

              <div className="text-md font-semibold">Load Trip Expense Details</div>
              <div className="text-md font-normal">Enter Trip Details</div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col className="gutter-row mt-2" span={6}>
                <Input
                    placeholder="Diesel*"
                    size="large"
                    name="diesel"
                    onChange={(e) => handleChange('diesel', e.target.value)}
                  />
                </Col>
                <Col className="gutter-row mt-2" span={6}>
                  <Input
                    placeholder="Cash*"
                    size="large"
                    name="cash"
                    onChange={(e) => handleChange('cash', e.target.value)}
                  />
                </Col>
                <Col className="gutter-row mt-2" span={6}>
                <Input
                    placeholder="Bank Transfer*"
                    size="large"
                    name="bankTransfer"
                    onChange={(e) => handleChange('bankTransfer', e.target.value)}
                  />

                </Col>
              </Row>

              
            </div>
          </div>
          <div className="flex gap-4">
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
          <h1 className="text-xl font-bold">Edit Challan</h1>
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
    console.log(challanData)
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
        title: 'materialType',
        dataIndex: 'materialType',
        key: 'materialType',
        width: 180,
      },
      {
        title: 'grNumber',
        dataIndex: 'grNumber',
        key: 'grNumber',
        width: 180,
      },
      { 
        title: 'Invoice Proof', 
        dataIndex: 'invoiceProof', 
        key: 'invoiceProof',
        width: 80, 
        render: invoiceProof => (
          invoiceProof ? <Image src={invoiceProof} alt="Defect Image" width={50} /> : null
        )
      },
      {
        title: 'deliveryNumber',
        dataIndex: 'deliveryNumber',
        key: 'deliveryNumber',
        width: 180,
      },
      {
        title: 'deliveryLocation',
        dataIndex:  'deliveryLocation',
        key:  'deliveryLocation',
        width: 180,
      },
      {
        title: 'grNumber',
        dataIndex: 'grNumber',
        key: 'grNumber',
        width: 180,
      },
      {
        title: 'deliveryNumber',
        dataIndex: 'deliveryNumber',
        key: 'deliveryNumber',
        width: 180,
      },
      {
        title: 'materialType',
        dataIndex: 'materialType',
        key: 'materialType',
        width: 180,
      },
      {
        title: 'grNumber',
        dataIndex: 'grNumber',
        key: 'grNumber',
        width: 180,
      },
      {
        title: 'deliveryNumber',
        dataIndex: 'deliveryNumber',
        key: 'deliveryNumber',
        width: 180,
      },
      {
        title: 'deliveryLocation',
        dataIndex:  'deliveryLocation',
        key:  'deliveryLocation',
        width: 180,
      },
      {
        title: 'grNumber',
        dataIndex: 'grNumber',
        key: 'grNumber',
        width: 180,
      },
      {
        title: 'deliveryNumber',
        dataIndex: 'deliveryNumber',
        key: 'deliveryNumber',
        width: 180,
      },
      {
        title: 'Action',
        key: 'action',
        width: 80,
        fixed:'right',
        render: (record: unknown) => (
          <Space size="middle">
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
          setchallanData(newData);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
  
      const changePaginationAll = async (pageNumber, pageSize) => {
        try {
          setCurrentPage(pageNumber);
          setCurrentPageSize(pageSize);
          const newData = await getTableData(searchQuery, pageNumber, pageSize,selectedHubId);
          setchallanData(newData);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
    return (
      <>

       
         <Table
          rowSelection={rowSelection}
          columns={columns}
        //   dataSource={challanData.map(truck => ({
        //     ...truck,
        //     phoneNumber: truck.ownerId[0].phoneNumber // Assuming ownerId contains only one object
        // }))}
        dataSource={challanData}
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
  

export default DispatchContainer