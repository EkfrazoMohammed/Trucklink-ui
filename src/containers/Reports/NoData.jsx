// import { useState, useEffect } from 'react';
// import NoData from "./NoData";
// import { API } from "../../API/apirequest";
// import { DatePicker, Table, Input, Select, Space, Button, Upload, Tooltip, Breadcrumb, Col, Row, Switch, Image } from 'antd';
// import moment from 'moment-timezone';
// import { UploadOutlined, DownloadOutlined, EyeOutlined, DeleteOutlined, PrinterOutlined, SwapOutlined, RedoOutlined, } from '@ant-design/icons';
// import backbutton_logo from "../../assets/backbutton.png";

// const filterOption = (input, option) =>
//   option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;

// const NoData = ({ onData }) => {
//   const authToken = localStorage.getItem("token");
//   const selectedHubId = localStorage.getItem("selectedHubID");
//   const [tripData, setTripData] = useState([]);
//   const [showUserTable, setShowUserTable] = useState(true);
//   const [rowDataForDispatchEditId, setRowDataForDispatchEditId] = useState(null);
//   const [rowDataForDispatchEditName, setRowDataForDispatchEditName] = useState(null);
//   const [editingChallan, setEditingChallan] = useState(false);

//   const [currentPage, setCurrentPage] = useState(1);
//   const [currentPageSize, setCurrentPageSize] = useState(50);
//   const [totalDispatchData, setTotalDispatchData] = useState(100);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [materialType, setMaterialType] = useState('');
//   const [vehicleType, setVehicleType] = useState('');
//   const [startDate, setStartDate] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [startDateValue, setStartDateValue] = useState('');
//   const [materialSearch, setMaterialSearch] = useState('');
//   const [vehicleTypeSearch, setVehicleTypeSearch] = useState(null);

//   const handleMaterialTypeChange = (value) => {
//     setMaterialType(value);
//     setMaterialSearch(value);
//   };

//   const handleVehicleTypeChange = (value) => {
//     setVehicleType(value);
//     setVehicleTypeSearch(value);
//   };

//   const convertToIST = (date) => {
//     const istDate = moment.tz(date, "Asia/Kolkata");
//     return istDate.valueOf();
//   };

//   const handleStartDateChange = (date, dateString) => {
//     setStartDateValue(date);
//     setStartDate(date ? convertToIST(dateString) : null);
//   };

//   const getTableData = async () => {
//     const headersOb = {
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${authToken}`
//       }
//     };

//     const data = {};

//     if (vehicleType) {
//       data.vehicleType = [vehicleType];
//     }

//     if (materialType) {
//       data.materialType = [materialType];
//     }

//     if (startDate) {
//       data.startDate = startDate;
//     }

//     setLoading(true);

//     try {
//       const response = await API.get(`report-table-data?page=1&limit=50`, headersOb);

//       setLoading(false);
//       let allTripData;
//       if (response.data.tripAggregates == 0) {
//         allTripData = response.data.tripAggregates;
//         setTripData(allTripData);
//       } else {
//         allTripData = response.data.tripAggregates[0].data || "";
//         setTripData(allTripData);
//         setTotalDispatchData(allTripData.length);
//       }
//     } catch (err) {
//       setLoading(false);
//       console.log(err);
//     }
//   };

//   const [materials, setMaterials] = useState([]);

//   const fetchMaterials = async () => {
//     try {
//       const headersOb = {
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${authToken}`
//         }
//       };
//       const response = await API.get(`get-material/${selectedHubId}`, headersOb);
//       if (response.status === 201) {
//         setMaterials(response.data.materials);
//       }
//     } catch (error) {
//       console.error('Error fetching materials:', error);
//     }
//   };

//   useEffect(() => {
//     fetchMaterials();
//   }, []);

//   useEffect(() => {
//     getTableData();
//   }, [selectedHubId, materialType, vehicleType, startDate]);

//   const Truck = () => {
//     const onReset = () => {
//       setStartDateValue('');
//       setSearchQuery('');
//       setMaterialSearch('');
//       setVehicleTypeSearch('');
//       window.location.reload();
//     };

//     return (
//       <div className='flex gap-2 flex-col justify-between p-2'>
//         <div className='flex gap-2 items-center'>
//           <Select
//             name="materialType"
//             value={materialType ? materialType : null}
//             placeholder="Material Type*"
//             size="large"
//             style={{ width: "20%" }}
//             onChange={handleMaterialTypeChange}
//             filterOption={filterOption}
//           >
//             {materials.map((v, index) => (
//               <Option key={index} value={v.materialType}>
//                 {`${v.materialType}`}
//               </Option>
//             ))}
//           </Select>
//           <Select
//             name="truckType"
//             placeholder="Truck Type*"
//             size="large"
//             style={{ width: "20%" }}
//             value={vehicleTypeSearch}
//             options={[
//               { value: 'Open', label: 'Open' },
//               { value: 'Bulk', label: 'Bulk' },
//             ]}
//             onChange={handleVehicleTypeChange}
//           />
//           <DatePicker
//             size='large'
//             onChange={handleStartDateChange}
//             value={startDateValue}
//             placeholder='Select Year'
//           />
//           {(startDateValue !== null && startDateValue !== "") || materialSearch !== "" || vehicleTypeSearch !== "" ? (
//             <Button size='large' onClick={onReset} style={{ rotate: "180deg" }} title="reset" icon={<RedoOutlined />}></Button>
//           ) : null}
//         </div>
//       </div>
//     );
//   };

//   const handleEditTruckClick = (rowData) => {
//     setRowDataForDispatchEditId(rowData.ownerDetails[0].ownerId);
//     setRowDataForDispatchEditName(rowData.ownerDetails[0].ownerName);
//     setShowUserTable(false);
//     setEditingChallan(true);
//     onData('none');
//   };

//   const UserInsideReport = ({ editingRowId, editingRowName }) => {
//     const goBack = () => {
//       onData('flex');
//       setShowUserTable(true);
//     };

//     const DispatchTable = ({ editingRowId }) => {
//       const authToken = localStorage.getItem("token");
//       const [challanData, setChallanData] = useState([]);
//       const [loading, setLoading] = useState(false);
//       const [selectedRowKeys, setSelectedRowKeys] = useState([]);

//       const getDispatchTableData = async () => {
//         const headersOb = {
//           headers: {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${authToken}`
//           }
//         };

//         setLoading(true);
//         try {
//           const response = await API.get(`trip-register-aggregate-values/${editingRowId}`, headersOb);
//           setLoading(false);

//           let alltripAggregates;
//           if (response.data.tripAggregates.length === 0) {
//             alltripAggregates = response.data.tripAggregates;
//           } else {
//             alltripAggregates = response.data.tripAggregates[0].tripDetails || [];
//           }
//           setChallanData(alltripAggregates);
//           setTotalDispatchData(alltripAggregates.length);
//         } catch (err) {
//           setLoading(false);
//           console.log(err);
//         }
//       };

//       useEffect(() => {
//         if (editingRowId) {
//           getDispatchTableData();
//         }
//       }, [editingRowId]);

//       const onSelectChange = (newSelectedRowKeys) => {
//         setSelectedRowKeys(newSelectedRowKeys);
//       };

//       const rowSelection = {
//         selectedRowKeys,
//         onChange: onSelectChange,
//       };

//       const columns = [
//         { title: 'Material Type', dataIndex: 'materialType', key: 'materialType', width: 110 },
//         { title: 'GR No', dataIndex: 'grNumber', key: 'grNumber', width: 90 },
//         { title: 'GR Date', dataIndex: 'grDate', key: 'grDate', width: 100 },
//         { title: 'Load Location', dataIndex: 'loadLocation', key: 'loadLocation', width: 120 },
//         { title: 'Delivery Location', dataIndex: 'deliveryLocation', key: 'deliveryLocation', width: 120 },
//         { title: 'Vehicle Number', dataIndex: 'vehicleNumber', key: 'vehicleNumber', width: 120 },
//         { title: 'Owner Name', width: 160, render: (_, record) => <p>{record.ownerName}</p> },
//         { title: 'Vehicle Type', dataIndex: 'vehicleType', key: 'vehicleType', width: 80 },
//         { title: 'Delivery Number', dataIndex: 'deliveryNumber', key: 'deliveryNumber', width: 120 },
//         { title: 'Quantity', dataIndex: 'quantityInMetricTons', key: 'quantityInMetricTons', width: 90 },
//         { title: 'Company Rate', dataIndex: 'companyRate', key: 'companyRate', width: 100 },
//         { title: 'Owner Rate', dataIndex: 'ownerRate', key: 'ownerRate', width: 90 },
//         { title: 'Delivery Date', dataIndex: 'deliveryDate', key: 'deliveryDate', width: 120 },
//         { title: 'Challan No', dataIndex: 'challanNumber', key: 'challanNumber', width: 120 },
//         { title: 'Payment Status', dataIndex: 'paymentStatus', key: 'paymentStatus', width: 100 },
//       ];

//       return (
//         <div className="p-2">
//           <Table
//             rowSelection={rowSelection}
//             rowKey={record => record.grNumber}
//             columns={columns}
//             dataSource={challanData}
//             loading={loading}
//             pagination={{
//               current: currentPage,
//               pageSize: currentPageSize,
//               total: totalDispatchData,
//               showSizeChanger: true,
//               onShowSizeChange: (current, size) => setCurrentPageSize(size),
//               onChange: (page) => setCurrentPage(page),
//             }}
//           />
//         </div>
//       );
//     };

//     return (
//       <div className="flex gap-2 flex-col justify-between p-2">
//         <div className='flex justify-between gap-2 items-center'>
//           <div className='flex gap-2 items-center'>
//             <Image preview={false} onClick={goBack} src={backbutton_logo} width={28} />
//             <h1 className="text-xl font-semibold">{editingRowName}</h1>
//           </div>
//           <div className='flex gap-2 items-center'>
//             <Tooltip title="Print">
//               <Button
//                 size="large"
//                 icon={<PrinterOutlined />}
//                 onClick={() => window.print()}
//               />
//             </Tooltip>
//           </div>
//         </div>
//         <DispatchTable editingRowId={editingRowId} />
//       </div>
//     );
//   };

//   const columns = [
//     { title: 'Material Type', dataIndex: 'materialType', key: 'materialType', width: 110 },
//     { title: 'GR No', dataIndex: 'grNumber', key: 'grNumber', width: 90 },
//     { title: 'GR Date', dataIndex: 'grDate', key: 'grDate', width: 100 },
//     { title: 'Load Location', dataIndex: 'loadLocation', key: 'loadLocation', width: 120 },
//     { title: 'Delivery Location', dataIndex: 'deliveryLocation', key: 'deliveryLocation', width: 120 },
//     { title: 'Vehicle Number', dataIndex: 'vehicleNumber', key: 'vehicleNumber', width: 120 },
//     {
//       title: 'Owner Name', width: 160, render: (_, record) => {
//         return <p>{record.ownerName}</p>;
//       }
//     },
//     { title: 'Vehicle Type', dataIndex: 'vehicleType', key: 'vehicleType', width: 80 },
//     { title: 'Delivery Number', dataIndex: 'deliveryNumber', key: 'deliveryNumber', width: 120 },
//     { title: 'Quantity', dataIndex: 'quantityInMetricTons', key: 'quantityInMetricTons', width: 90 },
//     { title: 'Company Rate', dataIndex: 'rate', key: 'rate', width: 110 },
//     { title: 'Market Rate', dataIndex: 'marketRate', key: 'marketRate', width: 110 },
//     { title: 'Diesel', dataIndex: 'diesel', key: 'diesel', width: 90 },
//     { title: 'Cash', dataIndex: 'cash', key: 'cash', width: 90 },
//     { title: 'Bank Transfer', dataIndex: 'bankTransfer', key: 'bankTransfer', width: 90 },
//   ];

//   return (
//     <div className='p-2 flex flex-col gap-2'>
//       {showUserTable && (
//         <>
//           <Truck />
//           <div>
//             <Table
//               rowKey={record => record.grNumber}
//               columns={columns}
//               dataSource={tripData}
//               loading={loading}
//               pagination={{
//                 current: currentPage,
//                 pageSize: currentPageSize,
//                 total: totalDispatchData,
//                 showSizeChanger: true,
//                 onShowSizeChange: (current, size) => setCurrentPageSize(size),
//                 onChange: (page) => setCurrentPage(page),
//               }}
//               locale={{
//                 emptyText: <NoData />
//               }}
//             />
//           </div>
//         </>
//       )}
//       {!showUserTable && <UserInsideReport editingRowId={rowDataForDispatchEditId} editingRowName={rowDataForDispatchEditName} />}
//     </div>
//   );
// };

// export default NoData;
import React from 'react'

const NoData = () => {
  return (
    <div>ReportsContainer</div>
  )
}

export default NoData