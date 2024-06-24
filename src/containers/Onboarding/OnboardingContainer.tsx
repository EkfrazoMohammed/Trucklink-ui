import { useState, useEffect } from 'react';
// Assuming states.json is located in the same directory as your component
import states from './states.json';
import { Table, Input, Select, Space, Button, Upload, Tabs, Tooltip, Breadcrumb, Col, notification, Row, Pagination, message } from 'antd';
import type { TabsProps } from 'antd';
import { UploadOutlined, DownloadOutlined, EyeOutlined, FormOutlined, RedoOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
const { Search } = Input;
import backbutton_logo from "../../assets/backbutton.png"
import { API } from "../../API/apirequest"
import TruckMaster from './TruckMaster';
import MasterData from './MasterData';
import OwnerTransferLog from './OwnerTransferLog';
import OwnerActivityLog from './OwnerActivityLog';
import axios from "axios"

const onSearch = (value: string) => {
  console.log('search:', value);
};

// Filter `option.value` match the user type `input`
const filterOption = (input: string, option?: { label: string; value: string }) =>
  (option?.value ?? '').toLowerCase().includes(input.toLowerCase());

const OnboardingContainer = ({ onData }) => {
  const [activeTabKey, setActiveTabKey] = useState('1');

  useEffect(() => {
    const savedTabKey = localStorage.getItem('activeTabKey');
    if (savedTabKey) {
      setActiveTabKey(savedTabKey);
    }
  }, []);
  const handleTabChange = (key) => {
    setActiveTabKey(key);
    localStorage.setItem('activeTabKey', key);
  };
  const [api, contextHolder] = notification.useNotification();


  const selectedHubId = localStorage.getItem("selectedHubID");
  const selectedHubName = localStorage.getItem("selectedHubName");
  const authToken = localStorage.getItem("token");
  const [showOwnerTable, setShowOwnerTable] = useState(true);
  const [rowDataForEdit, setRowDataForEdit] = useState(null);
  const [rowDataForView, setRowDataForView] = useState(null);

  const [loading, setLoading] = useState(false);

  const [filteredOwnerData, setFilteredOwnerData] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');

  const [totalOwnerData, setTotalOwnerData] = useState(100)

  const getTableData = async (searchQuery, page, limit, selectedHubID) => {
    const headersOb = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      }
    };

    setLoading(true);
    try {
      const pages = page;
      const limitData = 600;
      console.log(`get-owner-bank-details?page=1&limit=${pages}&hubId=${selectedHubId}`)
      const searchData = searchQuery || null; // Simplified conditional assignment
      const response = await API.get(
        searchData
          ? `get-owner-bank-details?searchOwnerName=${searchData}&page=${pages}&limit=${limitData}&hubId=${selectedHubId}`
          : `get-owner-bank-details?page=1&limit=${pages}&hubId=${selectedHubId}`,
        headersOb
      );

      if (response.data.ownerDetails && response.data.ownerDetails.length > 0) {
        // Data is available
        const ownerDetails = response.data.ownerDetails[0].data;
        setTotalOwnerData(response.data.ownerDetails[0].count);
        const arrRes = ownerDetails.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
        setFilteredOwnerData(arrRes);
      } else {
        // No data available
        setTotalOwnerData(0);
        setFilteredOwnerData([]);
      }
      setLoading(false);
    } catch (err) {

      console.log(err);
      setLoading(false);
    }
  };
  const jsonToCSV = (json) => {
    const headers = Object.keys(json[0]);
    const csvRows = [];
    
    // Add the headers row
    csvRows.push(headers.join(','));
    
    // Add the data rows
    for (const row of json) {
      const values = headers.map(header => {
        const escaped = ('' + row[header]).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  };

  const downloadCSV = (data, filename = 'data.csv') => {
    const csv = jsonToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownload = () => {
    downloadCSV(filteredOwnerData, 'filteredOwnerData.csv');
  };

  const [showEditForm, setShowEditForm] = useState(false)
  const OwnerMaster = ({ showTabs, setShowTabs }) => {
    const handleAddOwnerClick = () => {
      setRowDataForEdit(null);
      setShowOwnerTable(false);
      setShowTabs(false); // Set showTabs to false when adding owner
      onData("none");
    };
    const handleEditClick = (rowData) => {
      setRowDataForEdit(rowData);
      setShowOwnerTable(false);
      setShowEditForm(true)
      setShowTabs(false); // Set showTabs to false when adding owner
      onData("none");
    };
    const handleViewClick = (rowData) => {
      const headersOb = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        }
      }
      try {
        const dispatcher = API.get(`/get-challan-data/${rowData._id}`, headersOb)

        let res = API.get(`get-owner-details/${rowData._id}`, headersOb)
          .then((res) => {

            setRowDataForEdit(res.data.ownerDetails[0]);
            setRowDataForView(res.data.ownerDetails[0]);
            setShowOwnerTable(false);
            setShowEditForm(false)
            setShowTabs(false); // Set showTabs to false when adding owner
            onData("none");
          }).catch((err) => {
            console.log(err)
          }
          )
      } catch (err) {
        console.log(err)

        setRowDataForEdit(rowData);
        setRowDataForView(rowData);
        setShowOwnerTable(true);
        setShowEditForm(true)
        setShowTabs(true); // Set showTabs to true when not - viewing owner
        onData("none");

      }

    };
    const handleDeleteClick = async (rowData) => {
      const headersOb = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        }
      }
      const response = await API.delete(`delete-owner-details/${rowData._id}`, headersOb);
      alert("deleted data")
      setTimeout(() => {
        window.location.reload()
      }, 1000)

    }
    return (
      <>

        {contextHolder}
        <div className="mytab-content">
          {showOwnerTable ? (
            <>
              <Owner onAddOwnerClick={handleAddOwnerClick} />
              <OwnerTable filteredOwnerData={filteredOwnerData} onEditClick={handleEditClick} onViewClick={handleViewClick} onDeleteClick={handleDeleteClick} />
            </>
          ) :
            (
              rowDataForEdit ? <>
                {showEditForm ? <EditTruckOwnerForm rowDataForEdit={rowDataForEdit} /> :
                  <ViewOwnerDataRow rowData={rowDataForView} />
                }
              </> : (
                <AddTruckOwnerForm />
              )
            )
          }
        </div>
      </>
    );
  };

  const Owner = ({ onAddOwnerClick }: { onAddOwnerClick: () => void }) => {
    const initialSearchQuery = localStorage.getItem('searchQuery1') || '';
    const [searchQuery1, setSearchQuery1] = useState<string>(localStorage.getItem('searchQuery1') || '');

    // Update localStorage whenever searchQuery1 changes
    // useEffect(() => {
    //   localStorage.setItem('searchQuery1', searchQuery1);
    // }, [searchQuery1]);
    // Update localStorage whenever searchQuery1 changes
    useEffect(() => {
      if (searchQuery1 !== initialSearchQuery) {
        localStorage.setItem('searchQuery1', searchQuery1);
      }
    }, [searchQuery1, initialSearchQuery]);

    const handleSearch = () => {
      getTableData(searchQuery1, 1, 600, selectedHubId);
    };

    const onChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery1(value);

      if (value === "") {
        onReset();
      }
    };
    const axiosFileUploadRequest = async (file) => {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const config = {
          headers: {
            "content-type": "multipart/form-data",
            "Authorization": `Bearer ${authToken}`
          },
        };
        console.log(formData)

        // const response = await API.post('create-owner-by-xsl', formData, config);
        const response = await axios.post(`http://localhost:3000/prod/v1/create-owner-by-xsl`, formData, config);
        console.log(response);
        message.success("Successfully Uploaded");
        setTimeout(() => {
          window.location.reload();
        }, 1000)
      } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
          message.error(error.response.data.message);
        } else {
          message.error("Network Failed, Please Try Again");
        }
      } finally {
        setLoading(false);
      }
    };

    const handleBeforeUpload = (file) => {
      axiosFileUploadRequest(file);
      return false; // Prevent automatic upload
    };
    const onReset = () => {
      setSearchQuery1("");
      localStorage.removeItem('searchQuery1');
      getTableData("", 1, 600, selectedHubId);
    };


    const data = {
      "ownerDetails": [
          {
              "count": 8,
              "data": [
                  {
                      "_id": "66790d8c4a0ed60b1435333b",
                      "countryCode": "+91",
                      "vehicleIds": [],
                      "accountIds": [
                          {
                              "_id": "66790d8c4a0ed60b1435333f",
                              "accountNumber": "955410000001",
                              "accountHolderName": "manoj",
                              "ifscCode": "CNRB0000423",
                              "bankName": "Canara Bank",
                              "branchName": "BYATARAYANAPURA,BANGALORE",
                              "ownerId": "66790d8c4a0ed60b1435333b",
                              "createdAt": "2024-06-24T06:09:16.586Z",
                              "modifiedAt": "2024-06-24T06:09:16.586Z",
                              "__v": 0
                          }
                      ],
                      "name": "manoj",
                      "email": "manoj@gmail.com",
                      "phoneNumber": "5554443322",
                      "panNumber": "manoj",
                      "address": "manoj",
                      "district": "Leh(Ladakh)",
                      "state": "JAMMU_AND_KASHMIR",
                      "hubId": "66541b73a74686d081580179",
                      "oldVehicleDetails": [],
                      "vehicleDetails": [],
                      "createdAt": "2024-06-24T06:09:16.437Z",
                      "modifiedAt": "2024-06-24T06:09:16.437Z",
                      "__v": 0
                  },
                  {
                      "_id": "66557de735f213327e2c7acc",
                      "countryCode": "+91",
                      "vehicleIds": [
                          "665815c16364f6342e577911"
                      ],
                      "accountIds": [
                          {
                              "_id": "66557de735f213327e2c7acf",
                              "accountNumber": "423",
                              "accountHolderName": "423",
                              "ifscCode": "CNRB0000423",
                              "bankName": "Canara Bank",
                              "branchName": "BYATARAYANAPURA,BANGALORE",
                              "hubId": "66541b73a74686d081580179",
                              "ownerId": "66557de735f213327e2c7acc",
                              "createdAt": "2024-05-28T06:47:03.222Z",
                              "modifiedAt": "2024-06-13T05:14:05.844Z",
                              "__v": 0
                          },
                          {
                              "_id": "666a7feb4e95f87215549c95",
                              "accountNumber": "1717",
                              "accountHolderName": "1717",
                              "ifscCode": "KVBL0001717",
                              "bankName": "Karur Vysya Bank",
                              "branchName": "MADURAI - KAMARAJAR SALAI",
                              "hubId": "66541b73a74686d081580179",
                              "ownerId": "66557de735f213327e2c7acc",
                              "createdAt": "2024-06-13T05:13:15.716Z",
                              "modifiedAt": "2024-06-13T05:14:05.845Z",
                              "__v": 0
                          }
                      ],
                      "name": "tayib",
                      "email": "tayib@gmail.com",
                      "phoneNumber": "1231231231",
                      "panNumber": "TAYIBPANCARD",
                      "address": "Tayib",
                      "district": "Bengaluru (Bangalore) Urban",
                      "state": "Karnataka",
                      "hubId": "66541b73a74686d081580179",
                      "oldVehicleDetails": [
                          {
                              "commission": 0,
                              "_id": "6656f0ac934d44286dd49f43",
                              "vehicleIds": "6655bbbb551b8f57d1837b35",
                              "ownerId": "66557de735f213327e2c7acc",
                              "ownerTransferDate": "2024-06-04T00:00:00.000Z",
                              "ownerTransferToDate": "2024-06-05T00:00:00.000Z",
                              "vehicleNumber": "KA02MT2241",
                              "truckType": "open",
                              "accountId": "66557aca35f213327e2c7a0c"
                          },
                          {
                              "commission": 0,
                              "_id": "6656f37a934d44286dd4a089",
                              "vehicleIds": "6656f312934d44286dd4a038",
                              "ownerId": "66557de735f213327e2c7acc",
                              "ownerTransferDate": "2024-05-30T00:00:00.000Z",
                              "ownerTransferToDate": "2024-05-31T00:00:00.000Z",
                              "vehicleNumber": "TN01AB1234",
                              "truckType": "bulk",
                              "accountId": "66557aca35f213327e2c7a0c"
                          },
                          {
                              "commission": 0,
                              "_id": "665703071525914c04023e85",
                              "vehicleIds": "6656f312934d44286dd4a038",
                              "ownerId": "66557de735f213327e2c7acc",
                              "ownerTransferDate": "2027-07-03T00:00:00.000Z",
                              "ownerTransferToDate": "2027-11-04T03:33:20.000Z",
                              "vehicleNumber": "TN01AB1234",
                              "truckType": "bulk",
                              "accountId": "66557aca35f213327e2c7a0c",
                              "hubId": "66541b73a74686d081580179"
                          },
                          {
                              "commission": 5,
                              "_id": "66570678cdae4f2be757e07b",
                              "vehicleIds": "6657065dcdae4f2be757e04b",
                              "ownerId": "66557de735f213327e2c7acc",
                              "ownerTransferDate": "2024-05-29T00:00:00.000Z",
                              "ownerTransferToDate": "2024-05-30T00:00:00.000Z",
                              "vehicleNumber": "KA01AB1234",
                              "truckType": "bulk",
                              "accountId": "66557aca35f213327e2c7a0c",
                              "hubId": "66541b73a74686d081580179"
                          }
                      ],
                      "vehicleDetails": [
                          {
                              "isOwnerTransfer": true,
                              "_id": "6656d340795b921fbc74644f",
                              "vehicleIds": "6655bbbb551b8f57d1837b35",
                              "ownerTransferDate": "2024-05-01T00:00:00.000Z",
                              "ownerTransferToDate": "2024-05-03T00:00:00.000Z",
                              "ownerId": "66557de735f213327e2c7acc"
                          },
                          {
                              "isOwnerTransfer": true,
                              "_id": "6656eee9934d44286dd49e84",
                              "vehicleIds": "6655bbbb551b8f57d1837b35",
                              "ownerTransferDate": "2024-06-01T00:00:00.000Z",
                              "ownerTransferToDate": "2024-06-03T00:00:00.000Z",
                              "ownerId": "66557de735f213327e2c7acc",
                              "hubId": "66541b73a74686d081580179"
                          },
                          {
                              "isOwnerTransfer": true,
                              "_id": "6656f48e934d44286dd4a0c3",
                              "vehicleIds": "6656f312934d44286dd4a038",
                              "ownerTransferDate": "2024-06-01T00:00:00.000Z",
                              "ownerTransferToDate": "2024-06-03T00:00:00.000Z",
                              "ownerId": "66557de735f213327e2c7acc",
                              "hubId": "66541b73a74686d081580179"
                          },
                          {
                              "isOwnerTransfer": true,
                              "_id": "6657062ecdae4f2be757e01b",
                              "vehicleIds": "6656f312934d44286dd4a038",
                              "ownerTransferDate": "2027-09-25T00:00:00.000Z",
                              "ownerTransferToDate": "2027-10-30T00:00:00.000Z",
                              "ownerId": "66557de735f213327e2c7acc",
                              "hubId": "66541b73a74686d081580179"
                          }
                      ],
                      "createdAt": "2024-05-28T06:47:03.148Z",
                      "modifiedAt": "2024-06-13T05:14:05.754Z",
                      "__v": 0
                  }
              ]
          }
      ]
  };
  // Function to convert JSON to CSV
const convertJSONToCSV = (data: any[]): string => {
  if (data.length === 0) {
      return '';
  }

  // Extract column headers from the first object in the array
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent =
      headers.join(',') +
      '\n' +
      data
          .map((row) => {
              return headers.map((fieldName) => {
                  let cellValue = row[fieldName];

                  // If cell value contains comma, escape it by enclosing in double quotes
                  if (typeof cellValue === 'string' && cellValue.includes(',')) {
                      cellValue = `"${cellValue}"`;
                  }

                  return cellValue;
              }).join(',');
          })
          .join('\n');

  return csvContent;
};
      const handleDownload = () => {
        const owners = data.ownerDetails[0].data;
        const csvData = owners.map((owner) => {
            return {
                id: owner._id,
                name: owner.name,
                email: owner.email,
                phoneNumber: owner.phoneNumber,
                panNumber: owner.panNumber,
                address: owner.address,
                district: owner.district,
                state: owner.state,
                hubId: owner.hubId,
                accountDetails: owner.accountIds.map((account) => ({
                    accountNumber: account.accountNumber,
                    accountHolderName: account.accountHolderName,
                    ifscCode: account.ifscCode,
                    bankName: account.bankName,
                    branchName: account.branchName,
                    createdAt: account.createdAt,
                    modifiedAt: account.modifiedAt,
                })),
                oldVehicleDetails: owner.oldVehicleDetails.map((vehicle) => ({
                    vehicleNumber: vehicle.vehicleNumber,
                    truckType: vehicle.truckType,
                    ownerTransferDate: vehicle.ownerTransferDate,
                    ownerTransferToDate: vehicle.ownerTransferToDate,
                    commission: vehicle.commission,
                })),
                vehicleDetails: owner.vehicleDetails.map((vehicle) => ({
                    vehicleNumber: vehicle.vehicleNumber,
                    truckType: vehicle.truckType,
                    ownerTransferDate: vehicle.ownerTransferDate,
                    ownerTransferToDate: vehicle.ownerTransferToDate,
                    isOwnerTransfer: vehicle.isOwnerTransfer,
                })),
                createdAt: owner.createdAt,
                modifiedAt: owner.modifiedAt,
            };
        });

        const csvContent = convertJSONToCSV(csvData);

        // Create a blob with the CSV data
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

        // Create a temporary URL for the blob
        const url = window.URL.createObjectURL(blob);

        // Create a link element
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'ownerDetails.csv');

        // Append the link to the body
        document.body.appendChild(link);

        // Trigger the download
        link.click();

        // Cleanup
        document.body.removeChild(link);
    };
      // const downloadCSV = () => {
      //     const accountDetails = data.ownerDetails[0].data.flatMap(owner => 
      //         owner.accountIds.map(account => ({
      //             accountNumber: account.accountNumber,
      //             accountHolderName: account.accountHolderName,
      //             ifscCode: account.ifscCode,
      //             bankName: account.bankName,
      //             branchName: account.branchName,
      //             ownerName: owner.name,
      //             ownerEmail: owner.email,
      //             ownerPhoneNumber: owner.phoneNumber,
      //             ownerPanNumber: owner.panNumber,
      //             ownerAddress: owner.address,
      //             ownerDistrict: owner.district,
      //             ownerState: owner.state,
      //             ownerHubId: owner.hubId
      //         }))
      //     );
  
      //     const headers = [
      //         "Account Number", 
      //         "Account Holder Name", 
      //         "IFSC Code", 
      //         "Bank Name", 
      //         "Branch Name",
      //         "Owner Name",
      //         "Owner Email",
      //         "Owner Phone Number",
      //         "Owner PAN Number",
      //         "Owner Address",
      //         "Owner District",
      //         "Owner State",
      //         "Owner Hub ID"
      //     ];
  
      //     const csvContent = [
      //         headers.join(","),
      //         ...accountDetails.map(row => 
      //             [
      //                 row.accountNumber,
      //                 row.accountHolderName,
      //                 row.ifscCode,
      //                 row.bankName,
      //                 row.branchName,
      //                 row.ownerName,
      //                 row.ownerEmail,
      //                 row.ownerPhoneNumber,
      //                 row.ownerPanNumber,
      //                 row.ownerAddress,
      //                 row.ownerDistrict,
      //                 row.ownerState,
      //                 row.ownerHubId
      //             ].join(",")
      //         )
      //     ].join("\n");
  
      //     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      //     const link = document.createElement("a");
      //     const url = URL.createObjectURL(blob);
      //     link.setAttribute("href", url);
      //     link.setAttribute("download", "account_details.csv");
      //     link.style.visibility = 'hidden';
      //     document.body.appendChild(link);
      //     link.click();
      //     document.body.removeChild(link);
      // };
    return (
      <div className='flex justify-between  py-3'>
        <div className='flex items-center gap-2'>

          <Search
            placeholder="Search by Owner Name"
            size='large'
            value={searchQuery1}
            onChange={onChangeSearch}
            onSearch={handleSearch}
            style={{ width: 320 }}
          />
          {searchQuery1 !== null && searchQuery1 !== "" ? <><Button size='large' onClick={onReset} style={{ rotate: "180deg" }} icon={<RedoOutlined />}></Button></> : <></>}
        </div>
       <div className='flex gap-2'>
          {/* <Upload>
            <Button icon={<UploadOutlined />} onClick={axiosFileUploadRequest} ></Button>
          </Upload> */}
          <Upload beforeUpload={handleBeforeUpload} showUploadList={false}>
            <Button icon={<UploadOutlined />} loading={loading}>
              {/* {loading ? "Uploading" : "Click to Upload"} */}
              {loading ? "" : ""}
            </Button>
          </Upload>
          {/* <Upload> */}
            {/* <Button icon={<DownloadOutlined />}></Button> */}
            <Button icon={<DownloadOutlined />} onClick={handleDownload}></Button>
          {/* </Upload> */}
          <Button onClick={onAddOwnerClick} className='bg-[#1572B6] text-white'> ADD TRUCK OWNER</Button>
        </div>
      </div>
    );
  };


  const ViewOwnerDataRow = ({ rowData }) => {
    const [dispatchDetails, setDispatchDetails] = useState(null);

    const getDispatchDetails = () => {
      const headersOb = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        }
      }
      try {
        const dispatcher = API.get(`/get-challan-data/${rowData._id}`, headersOb)
          .then(res => {
            if (res.status == 201) {
              // console.log(res.data.dispatchData)
              setDispatchDetails(res.data.dispatchData)
            } else {
              console.log('error')
            }
          })
          .catch(err => {
            console.log(err)
          })

      } catch (err) {
        console.log(err)
      }
    }
    useEffect(() => {

      getDispatchDetails()
    }, [])

    const aggregateDispatchData = (data) => {
      if (!data) return {};
      const aggregatedData = {};

      data.forEach((dispatch) => {
        const { vehicleNumber, createdAt } = dispatch;
        if (!aggregatedData[vehicleNumber]) {
          aggregatedData[vehicleNumber] = {
            totalTrips: 0,
            lastTrip: null
          };
        }

        aggregatedData[vehicleNumber].totalTrips += 1;
        if (!aggregatedData[vehicleNumber].lastTrip || new Date(createdAt) > new Date(aggregatedData[vehicleNumber].lastTrip)) {
          aggregatedData[vehicleNumber].lastTrip = createdAt;
        }
      });

      return aggregatedData;
    };

    const aggregatedDispatchData = aggregateDispatchData(dispatchDetails);

    const goBack = () => {
      setShowOwnerTable(true)
      setShowTabs(true);
      onData('flex')
    }

    const LastTripComponent = ({ dispatchData }) => {
      const isoDate = dispatchData;
      const date = new Date(isoDate);
      let formattedDate
      if (isoDate == "-") {
        formattedDate = `-`
      } else {
        formattedDate = `${String(date.getUTCDate()).padStart(2, '0')}/${String(date.getUTCMonth() + 1).padStart(2, '0')}/${date.getUTCFullYear()}`
      }


      return (
        <p className="flex flex-col w-100 font-normal m-2">
          <span className="label text-sm">Last trip</span>
          {formattedDate}
        </p>
      );
    };
    return (
      <div className="owner-details">
        <img src={backbutton_logo} alt="backbutton_logo" className='w-5 h-5 object-cover cursor-pointer' onClick={goBack} />
        <div className="section mx-2 my-4">
          <h2 className='font-semibold text-md'>Vehicle Owner Information</h2>

          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
            <Col className="gutter-row m-1" span={5}><p className='flex flex-col font-normal m-2'><span className="label text-sm">Owner Name</span> {rowData.name}</p></Col>
            <Col className="gutter-row m-1" span={5}><p className='flex flex-col font-normal m-2'><span className="label text-sm">Mobile Number</span> {rowData.phoneNumber}</p></Col>
            <Col className="gutter-row m-1" span={5}><p className='flex flex-col font-normal m-2'><span className="label text-sm">Email ID</span> {rowData.email}</p></Col>
            <Col className="gutter-row m-1" span={5}><p className='flex flex-col font-normal m-2'><span className="label text-sm">PAN CARD No</span> {rowData.panNumber}</p></Col>
            <Col className="gutter-row m-1" span={5}> <p className='flex flex-col font-normal m-2'><span className="label text-sm">District</span>  {rowData.district}</p></Col>
            <Col className="gutter-row m-1" span={5}> <p className='flex flex-col font-normal m-2'><span className="label text-sm">State</span> {rowData.state}</p> </Col>
            <Col className="gutter-row m-1" span={5}><p className='flex flex-col font-normal m-2'><span className="label text-sm">Address</span> {rowData.address}</p></Col>
          </Row>
        </div>
        <div className="section mx-2 my-4">
          <h2 className='font-semibold text-md'>Owner Bank Details</h2>
          {rowData.accountIds.map((account, index) => (
            <div key={index}>
              <h3>Bank Account {index + 1}</h3>
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col className="gutter-row m-1" span={5}>  <p className='flex flex-col font-normal m-2'><span className="label text-sm">IFSC Code</span> {account.ifscCode}</p> </Col>
                <Col className="gutter-row m-1" span={5}> <p className='flex flex-col font-normal m-2'><span className="label text-sm">Bank Name</span> {account.bankName}</p></Col>
                <Col className="gutter-row m-1" span={5}> <p className='flex flex-col font-normal m-2'><span className="label text-sm">Branch Name</span> {account.branchName}</p></Col>
                <Col className="gutter-row m-1" span={5}> <p className='flex flex-col font-normal m-2'><span className="label text-sm">Bank Account Number</span> {account.accountNumber}</p> </Col>
                <Col className="gutter-row m-1" span={8}> <p className='flex flex-col font-normal m-2'><span className="label text-sm">Bank Account Holder Name</span> {account.accountHolderName}</p> </Col>
              </Row>
            </div>
          ))}
        </div>

        <div className="section mx-2 my-4">
          <h2 className="font-semibold text-md">Vehicle Details</h2>
          {rowData.vehicleIds.map((vehicle, index) => {
            const dispatchData = aggregatedDispatchData[vehicle.registrationNumber] || { totalTrips: '-', lastTrip: '-' };

            return (
              <div key={index}>
                <Row gutter={{ xs: 8, sm: 16, md: 32, lg: 32 }}>
                  <Col className="gutter-row m-1 flex items-center gap-2" span={12}>
                    <p>{index + 1}</p>
                    <p className="flex flex-col w-100 font-normal m-2">
                      <span className="label text-sm">Vehicle No</span>
                      {vehicle.registrationNumber}
                    </p>
                    <p className="flex flex-col w-100 font-normal m-2">
                      <span className="label text-sm">Total trips</span>
                      {dispatchData.totalTrips}
                    </p>

                    <LastTripComponent dispatchData={dispatchData.lastTrip} />
                  </Col>
                </Row>
              </div>
            );
          })}
        </div>
      </div>
    );
  };


  const AddTruckOwnerForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      phoneNumber: '',
      countryCode: '',
      panNumber: '',
      district: '',
      state: '',
      address: selectedHubName,
      vehicleIds: [],
      hubId: selectedHubId,
      bankAccounts: Array.from({ length: 1 }, () => ({
        accountNumber: '',
        accountHolderName: '',
        ifscCode: '',
        bankName: '',
        branchName: ''
      }))
    });


    const handleOwnerFormChange = (e) => {
      const { name, value } = e.target;
      const updatedValue = name === 'panNumber' ? value.toUpperCase() : value; // Convert to uppercase only if name is 'panNumber'
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: updatedValue,
      }));
    };

    const handleBankAccountChange = (index, e) => {
      const { name, value } = e.target;
      const updatedBankAccounts = [...formData.bankAccounts];
      updatedBankAccounts[index][name] = value;
      setFormData((prevFormData) => ({
        ...prevFormData,
        bankAccounts: updatedBankAccounts
      }));
    };

    const handleAddBankAccount = () => {
      if (formData.bankAccounts.length < 2) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          bankAccounts: [
            ...prevFormData.bankAccounts,
            {
              accountNumber: '',
              accountHolderName: '',
              ifscCode: '',
              bankName: '',
              branchName: ''
            }
          ]
        }));
      } else {
        alert("Only two bank accounts are allowed")
      }
    };

    const handleRemoveBankAccount = (index) => {
      setFormData((prevFormData) => ({
        ...prevFormData,
        bankAccounts: prevFormData.bankAccounts.filter((_, i) => i !== index)
      }));
    };
    const [message, setMessage] = useState('');

    const handleChangeBank = (index, e) => {
      const { value } = e.target;
      const updatedBankAccounts = [...formData.bankAccounts];
      updatedBankAccounts[index].ifscCode = value; // Update the IFSC code value for the specific bank form
      setFormData((prevFormData) => ({
        ...prevFormData,
        bankAccounts: updatedBankAccounts
      }));
    };

    const fetchBankDetails = (index) => {
      const bankAccount = formData.bankAccounts[index];
      const { ifscCode } = bankAccount;
      if (!ifscCode) {
        setMessage('Please fill IFSC code');
        return;
      }

      fetch(`https://ifsc.razorpay.com/${ifscCode}`)
        .then(response => response.json())
        .then(data => {
          // Update formData state with bank details for the specified bank account
          setFormData(prevFormData => ({
            ...prevFormData,
            bankAccounts: prevFormData.bankAccounts.map((account, i) => {
              if (i === index) {
                return {
                  ...account,
                  bankName: data.BANK,
                  branchName: data.BRANCH
                  // You can add more fields as needed
                };
              }
              return account;
            })
          }));
        })
        .catch(error => {
          setMessage('Invalid IFSC code');
        });
    };


    const [selectedState, setSelectedState] = useState('');
    const [districts, setDistricts] = useState([]);

    const handleStateChange = (value) => {
      setSelectedState(value);
      const selectedStateData = states.find((state) => state.state === value);
      if (selectedStateData) {
        setDistricts(selectedStateData.districts);
      } else {
        setDistricts([]);
      }
    };

    const handleResetButtonClick = () => {

      setFormData({
        name: '',
        email: '',
        phoneNumber: '',
        countryCode: '',
        panNumber: '',
        district: '',
        state: '',
        address: selectedHubName,
        vehicleIds: [],
        hubId: selectedHubId,
        bankAccounts: Array.from({ length: 1 }, () => ({
          accountNumber: '',
          accountHolderName: '',
          ifscCode: '',
          bankName: '',
          branchName: ''
        }))
      });
    }
    const handleSubmit = (e) => {
      e.preventDefault();
      const payload = {
        "owner_details": {
          hubId: selectedHubId,
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          panNumber: formData.panNumber,
          address: selectedHubName,
          district: districts[0],
          state: selectedState,
        },
        "bank_details": formData.bankAccounts.slice(0, 2).map((bankAccount) => ({
          accountNumber: bankAccount.accountNumber,
          accountHolderName: bankAccount.accountHolderName,
          ifscCode: bankAccount.ifscCode,
          bankName: bankAccount.bankName,
          branchName: bankAccount.branchName,
          hubId: selectedHubId
        })),
      };
      const headersOb = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        }
      }

      const postData = async () => {
        await API.post("create-owner", payload, headersOb)
          .then((response) => {

            if (response.status == 201) {

              alert('Owner data added successfully!');
              setTimeout(() => {
                window.location.reload();
              }, 1000)

            }
          })
          .catch((error) => {
            // Log any errors that occur during the dispatch process
            console.error('Error adding owner data:', error);
            const errorMessage = error.response.data.message;
            notification.error({
              message: "error occurred",
              description: `${errorMessage}`,
              duration: 2,
            });
            setTimeout(() => {
              window.location.reload();
            }, 1000)
          });
      }


      // Validation for phone number
      if (formData.name == "") {
        alert("Owner name is required");
        return;
      }

      // Validation for phone number
      if (formData.phoneNumber.length !== 10) {
        alert("Mobile number must be at least 10 digits");
        return;
      }


      let errors = [];

      // Validation for phone number
      if (formData.phoneNumber.length !== 10) {
        errors.push("Mobile number must be exactly 10 digits");
      }

      // Validation for the first bank account
      if (!formData.bankAccounts[0].accountHolderName) {
        errors.push("First bank account: Account Holder Name is required");
      }
      if (!formData.bankAccounts[0].ifscCode) {
        errors.push("First bank account: IFSC Code is required");
      }
      if (!formData.bankAccounts[0].bankName) {
        errors.push("First bank account: Bank Name is required");
      }
      if (!formData.bankAccounts[0].branchName) {
        errors.push("First bank account: Branch Name is required");
      }

      if (!formData.bankAccounts[0].accountNumber) {
        errors.push("First bank account: Account number is required");
      }

      // Check if the second bank account exists and validate it
      if (formData.bankAccounts.length > 1) {
        if (!formData.bankAccounts[1].accountHolderName) {
          errors.push("Second bank account: Account Holder Name is required");
        }
        if (!formData.bankAccounts[1].ifscCode) {
          errors.push("Second bank account: IFSC Code is required");
        }
        if (!formData.bankAccounts[1].bankName) {
          errors.push("Second bank account: Bank Name is required");
        }
        if (!formData.bankAccounts[1].branchName) {
          errors.push("Second bank account: Branch Name is required");
        }
        if (!formData.bankAccounts[1].accountNumber) {
          errors.push("Second bank account: Account number is required");
        }
      }

      if (errors.length > 0) {
        alert(errors.join("\n"));
        return;
      }
      // Validation for bank accounts
      const noFirstAccount =
        !formData.bankAccounts[0].ifscCode ||
        !formData.bankAccounts[0].bankName ||
        !formData.bankAccounts[0].branchName ||
        !formData.bankAccounts[0].accountNumber ||
        !formData.bankAccounts[0].accountHolderName;

      if (noFirstAccount) {
        alert("Enter required bank account details for the first account");
        return;
      }

      // Check if the second bank account exists and if it has any empty required fields
      if (formData.bankAccounts.length > 1) {
        const noSecondAccount =
          !formData.bankAccounts[1].ifscCode ||
          !formData.bankAccounts[1].bankName ||
          !formData.bankAccounts[1].branchName ||
          !formData.bankAccounts[1].accountNumber ||
          !formData.bankAccounts[1].accountHolderName;

        if (noSecondAccount) {
          alert("Enter required bank account details for the second account");
          return;
        }
      }
      postData();
    }
    const goBack = () => {
      setShowOwnerTable(true)

      onData("flex");
      setShowTabs(true);
    }
    return (
      <>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <h1 className='text-xl font-bold'>Create Truck Owner</h1>
            <Breadcrumb
              items={[
                {
                  title: 'OnBoarding',
                },
                {
                  title: 'Owner Master',
                },
                {
                  title: 'Create',
                },
              ]}
            />
            <img src={backbutton_logo} alt="backbutton_logo" className='w-5 h-5 object-cover cursor-pointer' onClick={goBack} />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex flex-col gap-1">
              <div className='text-md font-semibold'>Vehicle Owner Information</div>
              <div className='text-md font-normal'>Enter Truck Registration and Owner Details</div>

            </div>
            <div className="flex flex-col gap-1">
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col className="gutter-row mt-6" span={12}>
                  <div ><Input placeholder="Owner Name*" size="large" name="name" onChange={handleOwnerFormChange} value={formData.name} /></div>
                </Col>
                <Col className="gutter-row mt-6" span={12}>
                  <div ><Input type='number' placeholder="Mobile Number*" size="large" name="phoneNumber" value={formData.phoneNumber} onChange={handleOwnerFormChange} /></div>
                </Col>
                <Col className="gutter-row mt-6" span={12}>
                  <div ><Input type='email' placeholder="Email ID" size="large" name="email" value={formData.email} onChange={handleOwnerFormChange} /></div>
                </Col>
                <Col className="gutter-row mt-6" span={12}>
                  <div ><Input placeholder="PAN Card No" size="large" name="panNumber" value={formData.panNumber} onChange={handleOwnerFormChange} /></div>
                </Col>

                <Col className="gutter-row mt-6" span={12}>
                  <div>
                    Select State : {" "}
                    <Select
                      placeholder="Select a state"
                      value={selectedState}
                      onChange={handleStateChange}
                      style={{ width: "100%" }}
                      size='large'
                      showSearch
                      optionFilterProp="children"
                      onSearch={onSearch}
                      filterOption={filterOption}
                    >
                      {states.map((state) => (
                        <Option key={state.state} value={state.state}>
                          {state.state}
                        </Option>
                      ))}
                    </Select>
                  </div>
                </Col>
                <Col className="gutter-row mt-6" span={12}>
                  <div>
                    Select District : {" "}
                    <Select
                      size='large'
                      placeholder="Districts"
                      value={districts.length > 0 ? districts[0] : ''} // Ensure that districts represents a single selected district
                      onChange={(value) => setDistricts([value])} // Wrap the value in an array to represent a single selected district
                      style={{ width: "100%" }}
                      showSearch
                      optionFilterProp="children"
                      onSearch={onSearch}
                      filterOption={filterOption}
                    >
                      {districts.map((district) => (
                        <Option key={district} value={district}>
                          {district}
                        </Option>
                      ))}
                    </Select>
                  </div>
                </Col>
              </Row>
            </div>

          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between">

              <div>

                <div className='text-md font-semibold'>Owner Bank Details</div>
                <div className='text-md font-normal'>Enter bank details</div>
              </div>
              <Button type="link" onClick={handleAddBankAccount} style={{ color: "#000" }}>+ Add Bank</Button>
            </div>



            {formData.bankAccounts.map((bankAccount, index) => (
              <div className="flex flex-col gap-1 bg-[#f6f6f6] p-4" key={index}>
                <h1>Bank {index + 1}</h1>
                <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                  <Col className="gutter-row mt-2" span={8}>

                    <Search
                      name="ifscCode"
                      placeholder="Enter IFSC Code"
                      allowClear
                      size="large"
                      value={bankAccount.ifscCode}
                      onChange={(e) => handleChangeBank(index, e)} // Pass index to handleChangeBank
                      onSearch={() => fetchBankDetails(index)} // Pass index to fetchBankDetails
                    />
                  </Col>
                  <Col className="gutter-row mt-2" span={8}>
                    <Input placeholder="Bank Name*" size="large" name="bankName" value={bankAccount.bankName} onChange={(e) => handleBankAccountChange(index, e)} />
                  </Col>
                  <Col className="gutter-row mt-2" span={8}>
                    <Input placeholder="Bank Branch*" size="large" name="branchName" value={bankAccount.branchName} onChange={(e) => handleBankAccountChange(index, e)} />
                  </Col>
                  <Col className="gutter-row mt-2" span={8}>
                    <Input placeholder="Bank Account Number*" size="large" name="accountNumber" value={bankAccount.accountNumber} onChange={(e) => handleBankAccountChange(index, e)} />
                  </Col>
                  <Col className="gutter-row mt-2" span={8}>
                    <Input placeholder="Bank Account Holder Name*" size="large" name="accountHolderName" value={bankAccount.accountHolderName} onChange={(e) => handleBankAccountChange(index, e)} />
                  </Col>
                </Row>
                {formData.bankAccounts.length > 1 && (
                  <Button onClick={() => handleRemoveBankAccount(index)} style={{ width: 200 }}>Remove Bank Account</Button>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-4 items-center justify-center reset-button-container">
            <Button onClick={handleResetButtonClick}>Reset</Button>
            <Button type="primary" className='bg-primary' onClick={handleSubmit}>Save</Button>
          </div>

        </div>
      </>
    );
  };

  const EditTruckOwnerForm = ({ rowDataForEdit }) => {
    const [formData, setFormData] = useState({
      name: rowDataForEdit.name,
      email: rowDataForEdit.email,
      phoneNumber: rowDataForEdit.phoneNumber,
      countryCode: rowDataForEdit.countryCode,
      panNumber: rowDataForEdit.panNumber,
      district: rowDataForEdit.district,
      state: rowDataForEdit.state,
      address: rowDataForEdit.address,
      vehicleIds: [],
      hubId: selectedHubId,
      bankAccounts: rowDataForEdit.accountIds.map(account => ({
        id: account._id,
        accountNumber: account.accountNumber,
        accountHolderName: account.accountHolderName,
        ifscCode: account.ifscCode,
        bankName: account.bankName,
        branchName: account.branchName,
        hubId: account.hubId,
        ownerId: account.ownerId,
      }))
    });

    const handleOwnerFormChange = (e) => {
      const { name, value } = e.target;
      const updatedValue = name === 'panNumber' ? value.toUpperCase() : value;
      setFormData(prevFormData => ({
        ...prevFormData,
        [name]: updatedValue,
      }));
    };

    const handleBankAccountChange = (index, e) => {
      const { name, value } = e.target;
      const updatedBankAccounts = [...formData.bankAccounts];
      updatedBankAccounts[index][name] = value;
      setFormData(prevFormData => ({
        ...prevFormData,
        bankAccounts: updatedBankAccounts,
      }));
    };

    const handleAddBankAccount = () => {
      if (formData.bankAccounts.length < 2) {
        setFormData(prevFormData => ({
          ...prevFormData,
          bankAccounts: [
            ...prevFormData.bankAccounts,
            {
              accountNumber: '',
              accountHolderName: '',
              ifscCode: '',
              bankName: '',
              branchName: '',
              hubId: selectedHubId,
              ownerId: rowDataForEdit._id
            },
          ],
        }));
      } else {
        console.log('Only two bank accounts are allowed');
        alert('Only two bank accounts are allowed');
      }
    };

    const handleRemoveBankAccount = (index) => {
      setFormData(prevFormData => ({
        ...prevFormData,
        bankAccounts: prevFormData.bankAccounts.filter((_, i) => i !== index),
      }));
    };

    const handleChangeBank = (index, e) => {
      const { value } = e.target;
      const updatedBankAccounts = [...formData.bankAccounts];
      updatedBankAccounts[index].ifscCode = value;
      setFormData(prevFormData => ({
        ...prevFormData,
        bankAccounts: updatedBankAccounts,
      }));
    };

    const fetchBankDetails = (index) => {
      const bankAccount = formData.bankAccounts[index];
      const { ifscCode } = bankAccount;
      if (!ifscCode) {
        setMessage('Please fill IFSC code');
        return;
      }

      fetch(`https://ifsc.razorpay.com/${ifscCode}`)
        .then(response => response.json())
        .then(data => {
          setFormData(prevFormData => ({
            ...prevFormData,
            bankAccounts: prevFormData.bankAccounts.map((account, i) => {
              if (i === index) {
                return {
                  ...account,
                  bankName: data.BANK,
                  branchName: data.BRANCH,
                };
              }
              return account;
            }),
          }));
        })
        .catch(error => {
          setMessage('Invalid IFSC code');
        });
    };

    const [selectedState, setSelectedState] = useState('');
    const [districts, setDistricts] = useState([]);
    const handleStateChange = (value) => {
      setSelectedState(value);
      setFormData(prevFormData => ({
        ...prevFormData,
        state: value,
      }));
      const selectedStateData = states.find(state => state.state === value);
      if (selectedStateData) {
        setDistricts(selectedStateData.districts);
      } else {
        setDistricts([]);
      }
    };

    const updateOwnerDetails = async () => {
      const payloadOwner = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        panNumber: formData.panNumber,
        address: selectedHubName,
        district: formData.district,
        state: formData.state,
      };

      const headersOb = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      };


      try {
        const response = await API.put(`update-owner-details/${rowDataForEdit._id}`, payloadOwner, headersOb);
        if (response.status !== 201) {
          throw new Error('Failed to update owner details');
        }
      } catch (error) {
        console.error('Error updating owner details:', error);
        if (error.response && error.response.data.keyPattern && error.response.data.keyPattern.phoneNumber === 1) {
          alert(`Mobile number ${formData.phoneNumber} already exists`);
        } else {
          alert('Error occurred while updating owner details');
        }
        throw error;
      }
    };

    const addSecondaryBankAccount = async () => {
      const secondaryBankAccount = {
        ...formData.bankAccounts[1],
        ownerId: rowDataForEdit._id,
        hubId: selectedHubId,
      };

      const payload = {
        allAccounts: [secondaryBankAccount],
      };

      const headersOb = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      };

      try {
        const response = await API.post(`create-accounts-owner/${rowDataForEdit._id}`, payload, { headers: headersOb });
        if (response.status !== 200 && response.status !== 201) {
          throw new Error('Failed to add secondary bank account');
        } else {
          alert('Secondary account added successfully');
        }
      } catch (error) {
        console.error('Error adding secondary bank account:', error);
        alert('Error adding secondary bank account');
        throw error;
      }
    };

    const updateOwnerAccounts = async () => {
      const payloadAccounts = {
        allBankDetails: formData.bankAccounts
          .filter(account => account.id)
          .map(account => ({
            accountNumber: account.accountNumber,
            accountHolderName: account.accountHolderName,
            ifscCode: account.ifscCode,
            bankName: account.bankName,
            branchName: account.branchName,
            id: account.id,
            hubId: account.hubId,
            ownerId: account.ownerId,
          })),
      };

      const headersOb = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      };

      try {
        const response = await API.put(`update-owner-accounts`, payloadAccounts, { headers: headersOb });
        if (response.status !== 200 && response.status !== 201) {
          throw new Error('Failed to update bank details');
        }
      } catch (error) {
        console.error('Error updating bank details:', error);
        alert('Error updating bank details');
        throw error;
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      if (formData.phoneNumber.length !== 10) {
        alert('Mobile number must be exactly 10 digits');
        return;
      }

      try {
        await updateOwnerDetails();

        if (formData.bankAccounts.length === 2 && !formData.bankAccounts[1].id) {
          await addSecondaryBankAccount();
        }

        await updateOwnerAccounts();

        alert('Owner data and bank details updated successfully!');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        console.error('Submission error:', error);
      }
    };

    const goBack = () => {
      setShowOwnerTable(true)
      onData("flex");
      setShowTabs(true);
    }


    return (
      <>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="flex"><img src={backbutton_logo} alt="backbutton_logo" className='w-5 h-5 object-cover cursor-pointer' onClick={goBack} /> </div>
            <div className="flex flex-col">
              <h1 className='font-bold' style={{ fontSize: "16px" }}>Edit Truck Owner</h1>
              <Breadcrumb
                items={[
                  {
                    title: 'OnBoarding',
                  },
                  {
                    title: 'Owner Master',
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
              <div className='text-md font-semibold'>Vehicle Owner Information</div>
              <div className='text-md font-normal'>Edit Truck Registration and Owner Details</div>
            </div>


            <div className="flex flex-col gap-1">
              <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col className="gutter-row mt-6" span={12}><div ><Input placeholder="Owner Name*" size="large" name="name" onChange={handleOwnerFormChange} value={formData.name} /></div></Col>
                <Col className="gutter-row mt-6" span={12}><div ><Input type='number' placeholder="Mobile Number*" size="large" name="phoneNumber" onChange={handleOwnerFormChange} value={formData.phoneNumber} /></div></Col>
                <Col className="gutter-row mt-6" span={12}><div ><Input type='email' placeholder="Email ID" size="large" name="email" onChange={handleOwnerFormChange} value={formData.email} /></div></Col>
                <Col className="gutter-row mt-6" span={12}><div ><Input placeholder="PAN Card No" size="large" name="panNumber" onChange={handleOwnerFormChange} value={formData.panNumber} /></div></Col>
                <Col className="gutter-row mt-6" span={12}>
                  <div>
                    Select State : {" "}
                    <Select placeholder="Select a state"
                      value={formData.state}
                      onChange={handleStateChange}
                      style={{ width: "100%" }}
                      size='large'
                      showSearch
                      optionFilterProp="children"
                      onSearch={onSearch}
                      filterOption={filterOption}>
                      {states.map((state) => (
                        <Option key={state.state} value={state.state}>
                          {state.state}
                        </Option>
                      ))}
                    </Select>

                  </div>
                </Col>
                <Col className="gutter-row mt-6" span={12}>
                  <div>
                    Select District : {" "}
                    <Select
                      size='large'
                      placeholder="Districts"
                      value={formData.district}
                      // onChange={(value) => setDistricts([value])}
                      onChange={(value) => setFormData((prevFormData) => ({
                        ...prevFormData,
                        district: value,
                      }))}
                      showSearch
                      optionFilterProp="children"
                      onSearch={onSearch}
                      filterOption={filterOption}
                      style={{ width: "100%" }}>
                      {districts.map((district) => (
                        <Option key={district} value={district}>
                          {district}
                        </Option>
                      ))}
                    </Select>
                  </div>
                </Col>
              </Row>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between">
              <div>
                <div className='text-md font-semibold'>Owner Bank Details</div>
                <div className='text-md font-normal'>Enter bank details</div>
              </div>
              <Button type="link" onClick={handleAddBankAccount} style={{ color: "#000" }}>+ Add Bank</Button>
            </div>
            {formData.bankAccounts.map((bankAccount, index) => (
              <div className="flex flex-col gap-1 bg-[#f6f6f6] p-4" key={index}>
                <h1>Bank {index + 1}</h1>
                <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                  <Col className="gutter-row mt-2" span={8}>
                    <Search
                      name="ifscCode"
                      placeholder="Enter IFSC Code"
                      allowClear
                      size="large"
                      value={bankAccount.ifscCode}
                      onChange={(e) => handleChangeBank(index, e)}
                      onSearch={() => fetchBankDetails(index)}
                    />
                  </Col>
                  <Col className="gutter-row mt-2" span={8}><Input placeholder="Bank Name*" size="large" name="bankName" value={bankAccount.bankName} onChange={(e) => handleBankAccountChange(index, e)} /></Col>
                  <Col className="gutter-row mt-2" span={8}><Input placeholder="Bank Branch*" size="large" name="branchName" value={bankAccount.branchName} onChange={(e) => handleBankAccountChange(index, e)} /></Col>
                  <Col className="gutter-row mt-2" span={8}><Input placeholder="Bank Account Number*" size="large" name="accountNumber" value={bankAccount.accountNumber} onChange={(e) => handleBankAccountChange(index, e)} /></Col>
                  <Col className="gutter-row mt-2" span={8}><Input placeholder="Bank Account Holder Name*" size="large" name="accountHolderName" value={bankAccount.accountHolderName} onChange={(e) => handleBankAccountChange(index, e)} /></Col>
                </Row>
                {formData.bankAccounts.length > 1 && (
                  <Button onClick={() => handleRemoveBankAccount(index)} style={{ width: 200 }}>Remove Bank Account</Button>
                )}
              </div>
            ))}
          </div>


          <div className="flex gap-4 items-center justify-center reset-button-container">
            <Button onClick={() => { setShowOwnerTable(true) }}>Reset</Button>
            <Button type="primary" className='bg-primary' onClick={handleSubmit}>Save</Button>
          </div>
        </div>
      </>
    );
  };


  const [currentPage, setCurrentPage] = useState(10);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  useEffect(() => {
    getTableData(searchQuery, currentPage, currentPageSize, selectedHubId);
  }, [currentPage, currentPageSize, selectedHubId]);
  const OwnerTable = ({ filteredOwnerData, onEditClick, onViewClick, onDeleteClick }) => {
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
        title: 'Owner Name',
        dataIndex: 'name',
        key: 'name',
        width: "auto",
        render: (_, record) => {
          return record.name.charAt(0).toUpperCase() + record.name.slice(1)
        }
      },
      {
        title: 'District',
        dataIndex: 'district',
        key: 'district',
        width: "auto",
      },
      {
        title: 'State',
        dataIndex: 'state',
        key: 'state',
        width: 210,
      },
      {
        title: 'Email ID',
        dataIndex: 'email',
        key: 'email',
        width: "auto",
      },
      {
        title: 'Action',
        key: 'action',
        width: 120,
        render: (record) => (

          <Space size="middle">
            <Tooltip placement="top" title="Preview"><a onClick={() => onViewClick(record)}><EyeOutlined /></a></Tooltip>
            <Tooltip placement="top" title="Edit"><a onClick={() => onEditClick(record)}><FormOutlined /></a></Tooltip>
            <Tooltip placement="top" title="Delete"><a onClick={() => onDeleteClick(record)}><DeleteOutlined /></a></Tooltip>
          </Space>
        ),
      },
    ];
    const changePagination = async (pageNumber, pageSize) => {
      try {
        // setCurrentPage(pageNumber);
        // setCurrentPageSize(pageSize);
        console.log("pageNumber", pageNumber)
        console.log("pageSize", pageSize);
        // const newData = await getTableData(searchQuery, pageNumber, pageSize, selectedHubId);
        // setFilteredOwnerData(newData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const changePaginationAll = async (pageNumber, pageSize) => {
      try {
        setCurrentPage(pageNumber);
        setCurrentPageSize(pageSize);
        console.log("pageNumber", pageNumber)
        console.log("pageSize", pageSize);
        // const newData = await getTableData(searchQuery, pageNumber, pageSize, selectedHubId);
        // setFilteredOwnerData(newData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    const handlePageSizeChange = async (pageNumber) => {

      setCurrentPageSize(pageNumber);
      setCurrentPage(pageNumber); // Reset to first page
      // Call your data fetching function here if needed
      console.log(pageNumber)
      try {
        // const newData = await getTableData(searchQuery, pageNumber, pageSize, selectedHubId);
        // setFilteredOwnerData(newData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const renderPaginationButtons = () => {
      const totalPages = Math.ceil(totalOwnerData / currentPageSize);
      const buttons = [];

      for (let i = 1; i <= totalPages; i++) {
        buttons.push(
          <Button
            key={i}
            type={i === currentPage ? 'primary' : 'default'}
            onClick={() => handlePageSizeChange(i)}
          >
            {i}
          </Button>
        );
      }
    }
    return (
      <>
      <div className="flex justify-end items-center">

        <div className='dashboard-table-pagination-container'>
          {/* {renderPaginationButtons()} */}
          <Button
            onClick={() => handlePageSizeChange(10)}
            style={{ backgroundColor: currentPageSize === 10 ? '#454545' : '#fff', color: currentPageSize === 10 ? '#fff' : '#000' }}
          >
            10
          </Button>

          <Button
            onClick={() => handlePageSizeChange(25)}
            style={{ backgroundColor: currentPageSize === 25 ? '#454545' : '#fff', color: currentPageSize === 25 ? '#fff' : '#000' }}
          >
            25
          </Button>
          <Button
            onClick={() => handlePageSizeChange(50)}
            style={{ backgroundColor: currentPageSize === 50 ? '#454545' : '#fff', color: currentPageSize === 50 ? '#fff' : '#000' }}
          >
            50
          </Button>

          <Button
            onClick={() => handlePageSizeChange(100)}
            style={{ backgroundColor: currentPageSize === 100 ? '#454545' : '#fff', color: currentPageSize === 100 ? '#fff' : '#000' }}
          >
          100
          </Button>
        </div>
        </div>
      
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredOwnerData}
          scroll={{ x: 800, y: 310 }}
          rowKey="_id"
          pagination={{
            position: ['bottomCenter'],
            current: currentPage,
            total: totalOwnerData,
            defaultPageSize: currentPageSize,
            // showSizeChanger: true,
            // onChange: changePagination,
            // onShowSizeChange: changePaginationAll,
          }}
          loading={loading}
        />

      </>
    );
  };


  const [showTabs, setShowTabs] = useState(true);

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: `Owner Master`,
      children: <OwnerMaster showTabs={showTabs} setShowTabs={setShowTabs} />,
    },
    {
      key: '2',
      label: 'Truck Master',
      children: <TruckMaster onData={onData} showTabs={showTabs} setShowTabs={setShowTabs} />,
    },
    {
      key: '3',
      label: 'Master Data',
      children: <MasterData />,
    },
    {
      key: '4',
      label: 'Owner Transfer Log',
      children: <OwnerTransferLog />,
    },
    {
      key: '5',
      label: 'Activity Log',
      children: <OwnerActivityLog />,
    }
  ];

  return (
    <>

      <div className={showTabs ? '' : 'onboarding-tabs-hidden'}>
        <Tabs activeKey={activeTabKey} items={items} onChange={handleTabChange} />
      </div>
    </>
  );
};

export default OnboardingContainer;
