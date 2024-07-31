import { useState, useEffect } from 'react';
import type { DatePickerProps } from 'antd';
import { DatePicker, Table, Input, Select, Space, Button, Upload, Tabs, Tooltip, Breadcrumb, Col, Row, Switch, Image } from 'antd';
import { UploadOutlined, DownloadOutlined, EyeOutlined, FormOutlined, DeleteOutlined, SwapOutlined, RedoOutlined, SearchOutlined } from '@ant-design/icons';
const { Search } = Input;
import backbutton_logo from "../../assets/backbutton.png"
import { API } from "../../API/apirequest"



const filterOption = (input, option) =>
  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;

const UserMaster = ({ onData, showTabs, setShowTabs }) => {
  const authToken = localStorage.getItem("token");
  const selectedHubId = localStorage.getItem("selectedHubID");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOwnerData, setFilteredOwnerData] = useState([]);

  const [filteredTruckData, setFilteredTruckData] = useState([]);

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
      getTableData("", selectedHubId);

    } else {
      alert(`unable to delete data`)
      console.log(response.data)
    }
  }

  const getTableData = async (searchQuery, selectedHubID) => {
    console.log(searchQuery)
    const headersOb = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      }
    }
    setLoading(true);

    try {
      const searchData = searchQuery ? searchQuery : null;
      const response = searchData ? await API.get(`users`, headersOb)
        : await API.get(`users`, headersOb);

      let allUserDetails;
      if (response.data.user == 0) {
        allUserDetails = response.data.user
        setFilteredTruckData(allUserDetails);
      } else {

        allUserDetails = response.data.user || "";
        setFilteredTruckData(allUserDetails)

      }
      setLoading(false);

    } catch (err) {
      console.log(err)
      setLoading(false);
    }
    setLoading(false);

  };
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [activePageSize, setActivePageSize] = useState(10);
  // Update the useEffect hook to include currentPage and currentPageSize as dependencies
  useEffect(() => {
    getTableData(searchQuery, selectedHubId);
  }, [selectedHubId]);

  // Truck master
  const Truck = ({ onAddTruckClick }: { onAddTruckClick: () => void }) => {
    const initialSearchQuery = localStorage.getItem('searchQuery9') || '';
    const [searchQuery9, setSearchQuery9] = useState<string>(initialSearchQuery);

    // Update localStorage whenever searchQuery9 changes
    useEffect(() => {
      if (searchQuery9 !== initialSearchQuery) {
        localStorage.setItem('searchQuery9', searchQuery9);
      }
    }, [searchQuery9, initialSearchQuery]);

    const handleSearch = () => {
      getTableData(searchQuery9, selectedHubId);
    };

    const onChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery9(value);
      console.log(value);
      if (value === "") {
        onReset();
      }
    };

    const onReset = () => {
      setSearchQuery9("");
      setLoading(false)
      localStorage.removeItem('searchQuery9');
      getTableData("", selectedHubId);
    };
    return (
      <div className='flex gap-2 justify-between  py-3'>
        {loading}
        <div className='flex items-center gap-2'>
          <Search
            placeholder="Search"
            size='large'
            value={searchQuery9}
            onChange={onChangeSearch}
            onSearch={handleSearch}
            style={{ width: 320 }}
          />
          {searchQuery9 !== null && searchQuery9 !== "" ? <><Button size='large' onClick={onReset} style={{ rotate: "180deg" }} icon={<RedoOutlined />}></Button></> : <></>}
        </div>
        <div className='flex gap-2'>
          <Button onClick={onAddTruckClick} className='bg-[#1572B6] text-white'> CREATE USER</Button>
        </div>
      </div>

    );
  };

  const UserMasterForm = () => {

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
//       curl --location 'https://trucklinkuatnew.thestorywallcafe.com/prod/v1/create-user' \
// --header 'Content-Type: application/json' \
// --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MjIyMjk5NjEsImV4cCI6MTcyNDgyMTk2MSwiaXNzIjoiaHV0ZWNoc29sdXRpb25zLmNvbSIsInN1YiI6ImVtYWlsPWRocnV2YUB0cnVja2xpbmsuY29tcm9sZT1BZG1pbiIsInJvbGUiOiJBZG1pbiIsImVtYWlsIjoiZGhydXZhQHRydWNrbGluay5jb20ifQ.D1ZIkF4EUF2n2oByi9nHBqKzfrldJTvM7qVOm0ImHq0' \
// --data-raw '{
//   "countryCode": "+91",
//   "firstName": "Tayib",
//   "email": "tayibulla@aivolved.in",
//   "phoneNumber": "8550895486",
//   "name": "tayib",
//   "roleName": "Accountant",
//   "hubId": ["669e3a71ac963160781c1123"]
// }'
      console.log('save clicked')
    };



    return (
      <>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold">Create User</h1>
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
                    RC Book : {' '}
                    <Upload
                      name="rcBook"
                      onChange={handleFileChange}
                      showUploadList={false}
                      beforeUpload={() => false}
                      accept="image/jpeg,image/png,image/jpg"
                    >
                      <Button size="large">
                        <span className='flex gap-2'>
                          <UploadOutlined /> Upload
                        </span>
                      </Button>
                    </Upload>
                    {formData.rcBookProof !== null ?
                      <Image
                        src={formData.rcBookProof}
                        alt="img"
                        width={40}
                        height={40}
                        style={{ objectFit: "cover", border: "1px solid #eee", margin: "0 auto" }}
                      />
                      : null}
                  </div>
                </Col>

                <Col className="gutter-row mt-6 flex gap-2" span={8}>
                  <div>
                    {/* {formData.isCommission ? <>Commission %*</> : <>Market Rate (Rs)*</>} */}
                    {formData.isCommission ? <>Commission%</> : <>Commission%</>}
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
          <div className="section mx-2 my-1">
            <h2 className='font-semibold text-md'>Vehicle Information</h2>
            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
              <Col className="gutter-row m-1" span={5}>
                <p className='flex flex-col font-normal m-2'><span className="label text-sm font-bold font-bold">Vehicle Number</span> {filterTruckTableData.registrationNumber}</p>
              </Col>
              <Col className="gutter-row m-1" span={5}>
                <p className='flex flex-col font-normal m-2'><span className="label text-sm font-bold">Vehicle Type</span> {filterTruckTableData.truckType}</p>
              </Col>
              <Col className="gutter-row m-1" span={5}>
                <p className='flex flex-col font-normal m-2'><span className="label text-sm font-bold">Commission % </span> {filterTruckTableData.commission}</p>
              </Col>
              <Col className="gutter-row m-1" span={5}>
                <p className='flex flex-col font-normal m-2'><span className="label text-sm font-bold">Market Rate</span>
                  {filterTruckTableData.isMarketRate ? <>Yes</> : <>No</>}</p>
              </Col>
              <Col className="gutter-row m-1" span={5}>
                <p className='flex flex-col font-normal m-2'><span className="label text-sm font-bold">RC Book</span>
                  {filterTruckTableData.rcBookProof !== null ?
                    <Image src={filterTruckTableData.rcBookProof} alt="img" width={40} height={40} style={{ objectFit: "cover", border: "1px solid #eee", margin: "0 auto" }} />
                    : null}
                </p>
              </Col>
            </Row>
          </div>
          <div className="section mx-2 my-4">
            <h2 className='font-semibold text-md'>Vehicle Owner Information</h2>
            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
              <Col className="gutter-row m-1" span={5}>
                <p className='flex flex-col font-normal m-2'><span className="label text-sm font-bold">Owner Name</span> {filterTruckTableData['ownerId'][0].name}</p>
              </Col>
              <Col className="gutter-row m-1" span={5}>
                <p className='flex flex-col font-normal m-2'><span className="label text-sm font-bold">Mobile Number</span> {filterTruckTableData['ownerId'][0].phoneNumber}</p>
              </Col>
              <Col className="gutter-row m-1" span={5}>
                <p className='flex flex-col font-normal m-2'><span className="label text-sm font-bold">Email ID</span> {filterTruckTableData['ownerId'][0].email}</p>
              </Col>
              <Col className="gutter-row m-1" span={5}>
                <p className='flex flex-col font-normal m-2'><span className="label text-sm font-bold">PAN CARD No</span> {filterTruckTableData['ownerId'][0].panNumber}</p>
              </Col>
              <Col className="gutter-row m-1" span={5}>
                <p className='flex flex-col font-normal m-2'><span className="label text-sm font-bold">District</span>  {filterTruckTableData['ownerId'][0].district}</p>
              </Col>
              <Col className="gutter-row m-1" span={5}>
                <p className='flex flex-col font-normal m-2'><span className="label text-sm font-bold">State</span> {filterTruckTableData['ownerId'][0].state}</p>
              </Col>
            </Row>
          </div>

        </div>
      </>
    );
  };


  const TruckTable = ({ onEditTruckClick, onViewTruckClick, onDeleteTruckClick }) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    };


    const rowSelection = {
      selectedRowKeys,
      onChange: onSelectChange,
    };
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
        width: 30,
      },

      {
        title: 'Owner Name',
        dataIndex: 'name',
        key: 'name',
        width: 110,
        // render: (_, record) => {
        //   return  record?.firstName 
        //   ? record.firstName.charAt(0).toUpperCase() + record.firstName.slice(1) 
        //   : 'N/A'
        // }
        render: (_, record) => {
          return record?.name
            ? record.name.charAt(0).toUpperCase() + record.name.slice(1)
            : 'N/A'
        }
      },

      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        width: 110,
        render: (_, record) => {
          return record?.email
            ? record.email
            : 'N/A'
        }
      },
      {
        title: 'Phone Number',
        dataIndex: 'phoneNumber',
        key: 'phoneNumber',
        width: 60,
        render: (_, record) => {
          return record?.phoneNumber
            ? record.phoneNumber
            : 'N/A'
        }
      },

      {
        title: 'Role',
        dataIndex: 'roleName',
        key: 'roleName',
        width: 60,
        render: (_, record) => {
          return record?.roleName
            ? record.roleName.charAt(0).toUpperCase() + record.roleName.slice(1)
            : 'N/A'
        }
      },

      {
        title: 'Action',
        key: 'action',
        width: 80,
        render: (record: unknown) => (
          <Space size="middle">
              <Switch
                      // defaultChecked={formData.isCommission}
                      name="isCommission"
                      // onChange={(checked) => handleChange('isCommission', checked)}
                    />
            <Tooltip placement="top" title="Edit"><a onClick={() => onEditTruckClick(record)}><FormOutlined /></a></Tooltip>
            <Tooltip placement="top" title="Delete"><a onClick={() => onDeleteTruckClick(record)}><DeleteOutlined /></a></Tooltip>
          </Space>
        ),
      },
    ];

    return (
      <>
        <div className='flex items-items justify-end mb-2 my-paginations '>
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
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredTruckData}
          scroll={{ x: 800 }}
          rowKey="_id"
          // pagination={{
          //   showSizeChanger: true,
          //   position: ['bottomCenter'],
          //   current: currentPage,
          //   pageSize: pageSize,
          //   onChange: (page, pageSize) => {
          //     setCurrentPage(page);
          //     setPageSize(pageSize);
          //   },
          // }}
          pagination={{
            showSizeChanger: false,
            position: ['bottomCenter'],
            current: currentPage,
            pageSize: currentPageSize,
            onChange: (page) => {
              setCurrentPage(page);
            },
          }}
          // antd site header height
          sticky={{
            offsetHeader: 20,
          }}
        />
      </>
    );
  };



  const EditTruckDataRow = ({ filterTruckTableData }) => {
    const initialOwnerData = `${filterTruckTableData.ownerId[0].name} - ${filterTruckTableData.ownerId[0].phoneNumber}`;
    const initialOwnerId = { "value": filterTruckTableData.ownerId[0]._id, "ownerName": filterTruckTableData.ownerId[0].name }

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

    const initialBankData = () => {
      const headersOb = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        }
      }
      const request = API.get(`get-owner-bank-details/${initialOwnerId.value}?page=1&limit=10&hubId=${selectedHubId}`, headersOb)
        .then((res) => {
          console.log(res)
          console.log(res.data.ownerDetails[0]['accountIds'])
          setBankdata(res.data.ownerDetails[0]['accountIds'])
        })
        .catch((err) => {
          console.log(err)
        })
    }
    useEffect(() => {
      initialBankData()
    }, [])
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

      localStorage.setItem("update-vehicle-details-payload", JSON.stringify(payload))

      const res = await API.put(url, payload, headersOb)
        .then((response) => {
          console.log(response)
          if (response.status == 201) {
            alert("Truck data updated successfully");
            goBack()
            getTableData("", selectedHubId);
          } else if (response.status == 400) {
            alert("Truck data updated successfully");
            goBack()
            getTableData("", selectedHubId);
          } else {
            alert('error occured')
          }
        }).catch(error => {
          console.error('Error updating truck data:', error);
          if (error.response.data.message == "Unable to Find Challan Information") {
            alert("Truck data updated successfully");
            goBack()
            getTableData("", selectedHubId);
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
                  {bankData && bankData.length > 0 ? (
                    <Select
                      size="large"
                      placeholder="Select bank account"
                      style={{ width: '100%' }}
                      name="accountId"
                      onChange={handleChange}
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      value={bankData[0]._id} // Set initial value to the first account's _id
                    >
                      {bankData.map((bank) => (
                        <Option key={bank._id} value={bank._id}>
                          {`${bank.bankName} - ${bank.accountNumber}`}
                        </Option>
                      ))}
                    </Select>
                  ) : (
                    <div>No bank data available</div>
                  )}
                </Col>
                {/* <Col className="gutter-row mt-6" span={8}>
                  <Select
                    size='large'
                    placeholder="Select bank account"
                    style={{ width: '100%' }}
                    name="accountId"
                    onChange={(value) => handleChange('accountId', value)}
                    optionFilterProp="children"
                    filterOption={filterOption}
                   >
                    {bankData.map((bank) => (
                      <Option key={bank._id} value={bank._id}>
                        {`${bank.bankName} - ${bank.accountNumber}`}
                      </Option>
                    ))}
                  </Select>

                </Col> */}
                <Col className="gutter-row mt-6" span={8}>
                  <div className='flex items-center gap-4'>
                    RC Book : {' '}
                    <Upload
                      name="rcBook"
                      onChange={handleFileChange}
                      showUploadList={false}
                      beforeUpload={() => false}
                      accept="image/jpeg,image/png,image/jpg"
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
                    {formData.isCommission ? <>Commission %</> : <>Market Rate (Rs)</>}
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
          <TruckTable onEditTruckClick={handleEditTruckClick} onViewTruckClick={handleViewTruckClick} onDeleteTruckClick={handleDeleteTruckClick} />
        </>
      ) : (
        rowDataForTruckEdit ? (
          <>
            {showTransferForm ? <></> : (
              showTruckView ? (
                <ViewTruckDataRow filterTruckTableData={rowDataForTruckView} />
              ) : (
                <EditTruckDataRow filterTruckTableData={rowDataForTruckEdit} />
              )
            )}
          </>
        ) : (
          <UserMasterForm />
        )
      )}
    </>
  );

}



export default UserMaster