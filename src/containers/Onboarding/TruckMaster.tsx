import { useState, useEffect } from 'react';
import type { DatePickerProps } from 'antd';
import { DatePicker, Table, Input, Select, Space, Button, Upload, Tabs, Tooltip, Breadcrumb, Col, Row, Switch, Image } from 'antd';
import { UploadOutlined, DownloadOutlined, EyeOutlined, FormOutlined, DeleteOutlined, SwapOutlined, RedoOutlined, SearchOutlined } from '@ant-design/icons';
const { Search } = Input;
import backbutton_logo from "../../assets/backbutton.png"
import { API } from "../../API/apirequest"
import debounce from 'lodash/debounce';
import axios from 'axios';


const filterOption = (input, option) =>
  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;

const TruckMaster = ({ onData, showTabs, setShowTabs }) => {
  const authToken = localStorage.getItem("token");
  const selectedHubId = localStorage.getItem("selectedHubID");
  const [loading, setLoading] = useState(false);
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
  const goBack = () => {
    setShowTruckTable(true)
    onData('flex')
    setShowTabs(true); // Set showTabs to false when adding owner
  }
  const handleEditTruckClick = (rowData) => {
    onData('none')
    setShowTabs(false); // Set showTabs to false when adding owner
    setRowDataForTruckEdit(rowData);
    setShowTruckTable(false);
    setShowTransferForm(false);
    setShowTruckView(false)
  };
  const handleViewTruckClick = (rowData) => {
    onData('none')
    setShowTabs(false); // Set showTabs to false when adding owner
    setRowDataForTruckEdit(rowData);
    setRowDataForTruckView(rowData)
    setShowTruckTable(false);
    setShowTransferForm(false);
    setShowTruckView(true)
  };
  const handleAddTruckClick = () => {
    onData('none')
    setShowTabs(false); // Set showTabs to false when adding owner
    setRowDataForTruckEdit(null);
    setShowTruckTable(false);
  };

  const handleTransferTruckClick = (rowData) => {
    onData('none')
    setShowTabs(false); // Set showTabs to false when adding owner
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
    const response = await API.delete(`delete-vehicle-details/${vehicleId}/${oldOwnerId}`, headersOb);
    if (response.status === 201) {
      alert("deleted data")
      goBack()
      getTableData("", 1, 100000, selectedHubId);

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

      setLoading(true);
      const pages = page;
      const limitData = 100000;
      const response = await API.get(`get-owner-bank-details?page=${pages}&limit=${limitData}&hubId=${selectedHubId}`, headersOb)
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
      setLoading(false);

    } catch (err) {
      setLoading(false);

      console.log(err)

    }

  };

  const getTableData = async (searchQuery, page, limit, selectedHubID) => {
    console.log(searchQuery)
    const headersOb = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      }
    }
    setLoading(true);

    try {

      const pages = page;
      const limitData = limit ? limit : null;

      const searchData = searchQuery ? searchQuery : null;


      const response = searchData ? await API.get(`get-vehicle-details?searchVehicleNumber=${searchData}&page=${pages}&limit=${limitData}&hubId=${selectedHubId}`, headersOb)
        : await API.get(`get-vehicle-details?page=${pages}&limit=${limitData}&hubId=${selectedHubId}`, headersOb);

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
      setLoading(false);

    } catch (err) {
      console.log(err)
      setLoading(false);
    }
    setLoading(false);

  };
  // Update the useEffect hook to include currentPage and currentPageSize as dependencies
  useEffect(() => {
    getOwnerData(currentPage, currentPageSize, selectedHubId);
    getTableData(searchQuery, currentPage, currentPageSize, selectedHubId);
  }, [currentPage, currentPageSize, selectedHubId]);

  // Truck master
  const Truck = ({ onAddTruckClick }: { onAddTruckClick: () => void }) => {
    const initialSearchQuery = localStorage.getItem('searchQuery2') || '';
    const [searchQuery2, setSearchQuery2] = useState<string>(initialSearchQuery);

    // Update localStorage whenever searchQuery2 changes
    useEffect(() => {
      if (searchQuery2 !== initialSearchQuery) {
        localStorage.setItem('searchQuery2', searchQuery2);
      }
    }, [searchQuery2, initialSearchQuery]);

    const handleSearch = () => {
      getTableData(searchQuery2, 1, 100000, selectedHubId);
    };

    const onChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery2(value);
      console.log(value);
      if (value === "") {
        onReset();
      }
    };

    const onReset = () => {
      setSearchQuery2("");
      setLoading(false)
      localStorage.removeItem('searchQuery2');
      getTableData("", 1, 100000, selectedHubId);
    };
    return (
      <div className='flex gap-2 justify-between  py-3'>
        {loading}
        <div className='flex items-center gap-2'>
          <Search
            placeholder="Search by Vehicle Number"
            size='large'
            value={searchQuery2}
            onChange={onChangeSearch}
            onSearch={handleSearch}
            style={{ width: 320 }}
          />
          {searchQuery2 !== null && searchQuery2 !== "" ? <><Button size='large' onClick={onReset} style={{ rotate: "180deg" }} icon={<RedoOutlined />}></Button></> : <></>}
        </div>
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
      hubId: selectedHubId,
    });

    const onResetClick = () => {
      console.log('reset clicked')
      setFileName("");
      setFormData({
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
    }
    const [fileName, setFileName] = useState("");
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
        setFileName(file.name)
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
        const request = API.get(`get-owner-bank-details/${value}?page=1&limit=10&hubId=${selectedHubId}`, headersOb)
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
      }

      else if (name === "registrationNumber") {
        const updatedValue = value.toUpperCase();
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
        isMarketRate: formData.isMarketRate,
      };
      const headersOb = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        }
      }
      API.post('create-vehicle', payload, headersOb)
        .then((response) => {
          console.log('Truck data added successfully:', response.data);
          alert("Truck data added successfully")
          setTimeout(()=>{
            goBack()
            getTableData("", 1, 100000, selectedHubId);
          },1000)
        })
        .catch((error) => {
          console.error('Error adding truck data:', error);
          const errorResponse = error.response.data

          const errorMessages = [];

          if (errorResponse.error && errorResponse.error.err && errorResponse.error.err.errors) {
            Object.keys(errorResponse.error.err.errors).forEach((key) => {
              const errorMessage = errorResponse.error.err.errors[key].message;
              errorMessages.push(errorMessage);
            });
          }
          console.log(errorMessages)

          if (errorMessages.length > 0) {
            console.log("Error:", errorMessages.join(", "));
            alert("error occurred")
          } else if (errorResponse.error.message == "This vehicle number already exists") {
            alert("This vehicle number already exists")
            console.log('This vehicle number already exists')
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
            <img src={backbutton_logo} alt="backbutton_logo" className='w-5 h-5 object-cover cursor-pointer' onClick={goBack} />

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
                    value={formData.registrationNumber}
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
                      <Button size="large" ><span className='flex gap-2'><UploadOutlined /> Upload</span></Button>
                    </Upload>
                    {formData.rcBookProof !== null ?
                      <Image src={formData.rcBookProof} alt="img" width={40} height={40} style={{ objectFit: "cover", border: "1px solid #eee", margin: "0 auto" }} />
                      : null}
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

            <Button onClick={onResetClick}>Reset</Button>
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
      setShowTruckTable(true)
      onData('flex')
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

  const TruckTable = ({ onEditTruckClick, onTransferTruckClick, onViewTruckClick, onDeleteTruckClick }) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    };


    const rowSelection = {
      selectedRowKeys,
      onChange: onSelectChange,
    };
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10); // Default page size, adjust if needed


    const columns = [
      // {
      //   title: 'Sl No',
      //   dataIndex: 'serialNumber',
      //   key: 'serialNumber',
      //   render: (text, record, index: any) => index + 1,
      //   width: 40,
      // },
      {
        title: 'Sl No',
        dataIndex: 'serialNumber',
        key: 'serialNumber',
        render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
        width: 80,
      },
      {
        title: 'Vehicle Number',
        dataIndex: 'registrationNumber',
        key: 'registrationNumber',
        width: 60,
      },
      {
        title: 'Owner Name',
        dataIndex: 'name',
        key: 'name',
        width: 60,
        render: (_, record) => {

          return record?.ownerId[0]?.name.charAt(0).toUpperCase() + record?.ownerId[0]?.name.slice(1)
        }
      },
      {
        title: 'Vehicle Type',
        dataIndex: 'truckType',
        key: 'truckType',
        width: 80,
        render: (_, record) => {
          return record.truckType.charAt(0).toUpperCase() + record.truckType.slice(1)
        }
      },
      {
        title: 'RC Book',
        dataIndex: 'rcBookProof',
        key: 'rcBookProof',
        width: 40,
        render: rcBookProof => (
          rcBookProof ? <Image src={rcBookProof} alt="img" width={40} height={40} style={{ objectFit: "cover", border: "1px solid #eee", margin: "0 auto" }} /> : null
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

    return (
      <>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredTruckData}
          scroll={{ x: 800 }}
          rowKey="_id"
          pagination={{
            showSizeChanger: true,
            position: ['bottomCenter'],
            current: currentPage,
            pageSize: pageSize,
            onChange: (page, pageSize) => {
              setCurrentPage(page);
              setPageSize(pageSize);
            },
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
      hubId: selectedHubId
    });

    const handleResetClick = () => {
      console.log('reset clicked')
      setFileName("")
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
    const filteredOptions = filteredOwnerData.filter(owner => owner._id !== rowDataForTruckTransfer.ownerId[0]._id);
    const [fileName, setFileName] = useState("");
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
      const res = API.put(url, formData, headersOb)
        .then((res) => {
          if (res.status == 201) {
            console.log('Truck transfered successfully:', res.data);
            alert("Owner Transfered successfully")
            goBack()
            getTableData("", 1, 100000, selectedHubId);
          } else {
            console.error('Error adding truck data:', res);

            alert("error occurred")
          }
        }).catch(err => {
          console.log(err)
          if (err.response.data.message == "Please choose transfer the later than latest dispatch challan date") {
            alert("Please choose transfer the later than latest dispatch challan date")
          } else {

            alert("error occurred")
          }
        })
    };
    const goBack = () => {
      setShowTruckTable(true)
      onData('flex')
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

                <Col className="gutter-row mt-6" span={8}>
                  <div className='flex items-center gap-4'>
                    RC Book* : {' '}
                    <Upload
                      name="rcBook"
                      onChange={handleFileChange}
                      showUploadList={false}
                      beforeUpload={() => false}
                    >
                      <Button size="large" ><span className='flex gap-2'><UploadOutlined /> Upload</span></Button>

                      {/* <Button size="large" style={{ width: "110px" }} icon={<UploadOutlined />}></Button> */}
                    </Upload>
                    {formData.rcBookProof !== null ?
                      <Image src={formData.rcBookProof} alt="img" width={40} height={40} style={{ objectFit: "cover", border: "1px solid #eee", margin: "0 auto" }} />
                      : null}
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
    const initialOwnerData = `${filterTruckTableData.ownerId[0].name} - ${filterTruckTableData.ownerId[0].phoneNumber}`;
    const initialOwnerId = { "value": filterTruckTableData.ownerId[0]._id, "ownerName": filterTruckTableData.ownerId[0].name }
    // `${filterTruckTableData.ownerId[0]._id}`;

    const [formData, setFormData] = useState({
      registrationNumber: filterTruckTableData.registrationNumber,
      commission: filterTruckTableData.commission,
      ownerId: initialOwnerId.value,
      ownerName: initialOwnerId.ownerName,
      accountId: null,
      vehicleType: filterTruckTableData.truckType,
      rcBookProof: filterTruckTableData.rcBookProof || null,
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
        ownerId: initialOwnerId.value,
        ownerName: initialOwnerId.ownerName,
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
        console.log(value)
        const request = API.get(`get-owner-bank-details/${value.value}?page=1&limit=10&hubId=${selectedHubId}`, headersOb)
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
      ownerId: formData.ownerId.value,
      ownerName: formData.ownerId.ownerName,
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

      const res = await API.put(url, payload, headersOb)
        .then((response) => {
          console.log(response)
          if (response.status == 201) {
            alert("Truck data updated successfully");
            goBack()
            getTableData("", 1, 100000, selectedHubId);
          } else if (response.status == 400) {
            alert("Truck data updated successfully");
            goBack()
            getTableData("", 1, 100000, selectedHubId);
          } else {
            alert('error occured')
          }
        }).catch(error => {
          console.error('Error updating truck data:', error);
          if (error.response.data.message == "Unable to Find Challan Information") {
            alert("Truck data updated successfully");
            goBack()
            getTableData("", 1, 100000, selectedHubId);
          } else {
            alert("An error occurred while updating truck data");
          }

        })

    };

    const goBack = () => {
      setShowTruckTable(true)
      onData('flex')
      setShowTabs(true); // Set showTabs to false when adding owner
    }

    const handleOwnerChange = (value) => {
      const selectedOwner = filteredOwnerData.find(owner => owner._id === value);
      const ownerName = selectedOwner ? selectedOwner.name : '';
      console.log(ownerName)
      let ob = { value, ownerName }
      handleChange('ownerId', ob);
    };

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
            {/* {JSON.stringify(formData, null, 2)}  */}
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
                    onChange={(value) => handleOwnerChange(value)}
                    // onChange={(value) => handleChange('ownerId', value)}
                    showSearch
                    optionFilterProp="children"
                    filterOption={filterOption}
                    value={formData.ownerId == initialOwnerId ? initialOwnerData : formData.ownerId}
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
                      <Button size="large" ><span className='flex gap-2'><UploadOutlined /> Upload</span></Button>
                    </Upload>
                    {formData.rcBookProof !== null ?
                      <Image src={formData.rcBookProof} alt="img" width={40} height={40} style={{ objectFit: "cover", border: "1px solid #eee", margin: "0 auto" }} />
                      : null}
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
                <ViewTruckDataRow filterTruckTableData={rowDataForTruckView} />
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