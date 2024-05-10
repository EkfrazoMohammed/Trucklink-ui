import { useState, useEffect } from 'react';
import { API } from "../../API/apirequest"
import { DatePicker, Table, Input, Select, Space, Button, Upload, Tooltip, Breadcrumb, Col, Row, Switch } from 'antd';
import axios from "axios"
import { UploadOutlined, DownloadOutlined, EyeOutlined, FormOutlined, DeleteOutlined, PrinterOutlined, SwapOutlined } from '@ant-design/icons';

const { Search } = Input;
import backbutton_logo from "../../assets/backbutton.png"

import type { DatePickerProps } from 'antd';

const onChange: DatePickerProps['onChange'] = (date, dateString) => {
    console.log(date, dateString);
};
const Receive = () => {

    const [showTable, setShowTable] = useState(true);
    const selectedHubId = localStorage.getItem("selectedHubID");
    const [searchQuery, setSearchQuery] = useState('');

    const [receive, setreceive] = useState([]);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };
    // Initialize state variables for current page and page size
    const [currentPage, setCurrentPage] = useState(1);
    const [currentPageSize, setCurrentPageSize] = useState(50);
    const [totalChallanData, setTotalChallanData] = useState(100)

    const getTableData = async () => {
        try {
            const searchData = searchQuery ? searchQuery : null;
            const response = searchData ? await API.get(`get-receive-register?page=1&limit=50&hubId=${selectedHubId}`)
                : await API.get(`get-receive-register?page=1&limit=50&hubId=${selectedHubId}`);
            // const response = searchData ?  await API.post(`get-challan-data?page=1&limit=50&hubId=6634de2e2588845228b2dbe4`)
            // : await API.post(`get-challan-data?page=1&limit=50&hubId=6634de2e2588845228b2dbe4`);  

            let allreceive;
            if (response.data.dispatchData.length == 0) {
                allreceive = response.data.disptachData
                console.log(allreceive)
                setreceive(allreceive);
            } else {
                allreceive = response.data.dispatchData[0].data || "";
                setTotalChallanData(allreceive);

                if (allreceive && allreceive.length > 0) {
                    const arrRes = allreceive.sort(function (a, b) {
                        a = a.vehicleNumber.toLowerCase();
                        b = b.vehicleNumber.toLowerCase();
                        return a < b ? -1 : a > b ? 1 : 0;
                    });
                    setreceive(arrRes);
                    return arrRes;
                }

            }
        } catch (err) {
            console.log(err)

        }
    };
    //    // Update the useEffect hook to include currentPage and currentPageSize as dependencies
    useEffect(() => {
        getTableData();
    }, [searchQuery, currentPage, currentPageSize, selectedHubId]);


    const DispatchChallanComponent = () => {
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
                    <DatePicker onChange={onChange} placeholder='To date' />


                </div>

            </div>

        );
    };

    const DispatchChallanComponentTable = ({ onEditChallanClick }) => {

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
                title: 'Ageing',
                dataIndex: 'ageing',
                key: 'ageing',
                width: 80,
                fixed: 'left',
                onCell: (record) => {
                    const givenDate = new Date(record.grISODate);
                    const today = new Date();
                    const differenceInMs = today - givenDate;
                    const differenceInDays = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));

                    let backgroundColor;

                    if (differenceInDays < 10) {
                        backgroundColor = '#009F23';
                    } else if (differenceInDays < 20) {
                        backgroundColor = '#FFED4A';

                    } else if (differenceInDays >= 30) {
                        backgroundColor = '#FF0000';
                    } else {
                        backgroundColor = 'inherit'; // Default background color
                    }

                    return {
                        id: `ageing-${record._id}`,
                        style: { backgroundColor, color: "#fff", },
                    };
                },
                render: (_, record) => {
                    const givenDate = new Date(record.grISODate);
                    const today = new Date();
                    const differenceInMs = today - givenDate;
                    const differenceInDays = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));

                    return (
                        <span>{differenceInDays}</span>
                    );
                },
            },
            {
                title: 'Sl No',
                dataIndex: 'serialNumber',
                key: 'serialNumber',
                render: (text, record, index: any) => index + 1,
                width: 80,

            },
            {
                title: 'grNumber',
                dataIndex: 'grNumber',
                key: 'grNumber',
                width: 180,
            },
            {
                title: 'grDate',
                dataIndex: 'grDate',
                key: 'grDate',
                width: 180,
            },
            {
                title: 'Truck Number',
                dataIndex: 'vehicleNumber',
                key: 'vehicleNumber',
                width: 180,
            },
            {
                title: 'From',
                dataIndex: 'loadLocation',
                key: 'loadLocation',
                width: 180,
            },
            {
                title: 'Destination',
                dataIndex: 'deliveryLocation',
                key: 'deliveryLocation',
                width: 180,
            },
            {
                title: 'Delivery No',
                dataIndex: 'deliveryNumber',
                key: 'deliveryNumber',
                width: 180,
            },

            {
                title: 'QTY',
                dataIndex: 'quantityInMetricTons',
                key: 'quantityInMetricTons',
                width: 90,
            },

            {
                title: 'C.Rate',
                dataIndex: 'rate',
                key: 'rate',
                width: 120,
            },
            {
                title: 'M.Rate',
                dataIndex: 'marketRate',
                key: 'marketRate',
                width: 120,
            },
            {
                title: 'Total',
                dataIndex: 'commisionTotal',
                key: 'commisionTotal',
                width: 120,
            },
            {
                title: 'Commission',
                dataIndex: 'commisionTotal',
                key: 'commisionTotal',
                width: 120,
            },
            {
                title: 'Diesel',
                dataIndex: 'diesel',
                key: 'diesel',
                width: 80,
            },
            {
                title: 'Cash',
                dataIndex: 'cash',
                key: 'cash',
                width: 80,
            },
            {
                title: 'Bank Transfer',
                dataIndex: 'bankTransfer',
                key: 'bankTransfer',
                width: 180,
            },
            {
                title: 'shortage',
                dataIndex: 'shortage',
                key: 'shortage',
                width: 180,
                render: (text) => {
                    return text === 0 ? <><Input type="number" placeholder='Enter' /> </> : text;
                },
            },
            {
                title: 'balance',
                dataIndex: 'balance',
                key: 'balance',
                width: 120,
            },
            {
                title: 'Action',
                key: 'action',
                width: 80,
                fixed: 'right',
                render: (record: unknown) => (
                    <Space size="middle">
                        <Tooltip placement="top" title="Edit"><a onClick={() => onEditChallanClick(record)}><FormOutlined /></a></Tooltip>
                        
                    </Space>
                ),
            },
        ];
        const changePagination = async (pageNumber, pageSize) => {
            try {
                setCurrentPage(pageNumber);
                setCurrentPageSize(pageSize);
                const newData = await getTableData(searchQuery, pageNumber, pageSize, selectedHubId);
                setreceive(newData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        const changePaginationAll = async (pageNumber, pageSize) => {
            try {
                setCurrentPage(pageNumber);
                setCurrentPageSize(pageSize);
                const newData = await getTableData(searchQuery, pageNumber, pageSize, selectedHubId);
                setreceive(newData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        return (
            <>
                <Table
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={receive}
                    scroll={{ x: 800, y: 320 }}
                    rowKey="_id"
                    pagination={{
                        current: currentPage,
                        total: totalChallanData,
                        defaultPageSize: currentPageSize, // Set the default page size
                        showSizeChanger: true,
                        onChange: changePagination,
                        onShowSizeChange: changePaginationAll,
                    }}
                    />
            </>
        );
    };

    const [editingRow, setEditingRow] = useState(null);

    const handleEditChallanClick = (rowData) => {
        setEditingRow(rowData);
            setShowTable(false);
    };

    
    const EditableChallan = ({ editingRow }) => {

        const selectedHubId = localStorage.getItem("selectedHubID");
    
        const [formData, setFormData] = useState(
            {
                "balance": editingRow.balance,
                "bankTransfer": editingRow.bankTransfer,
                "cash": editingRow.cash,
                "commisionRate": editingRow.commisionRate,
                "commisionTotal": editingRow.commisionTotal,
                "deliveryLocation": editingRow.deliveryLocation,
                "deliveryNumber": editingRow.deliveryNumber,
                "diesel": editingRow.diesel,
                "grDate": editingRow.grDate,
                "grNumber": editingRow.grNumber,
                "invoiceProof": editingRow.invoiceProof,
                "loadLocation": editingRow.loadLocation,
                "materialType": editingRow.materialType,
                "ownerId": editingRow.ownerId,
                "ownerName": editingRow.ownerName,
                "ownerPhone": editingRow.ownerPhone,
                "quantityInMetricTons": editingRow.quantityInMetricTons,
                "rate": editingRow.rate,
                "totalExpense": editingRow.totalExpense,
                "vehicleBank": editingRow.vehicleBank,
                "vehicleId": editingRow.vehicleId,
                "vehicleNumber": editingRow.vehicleNumber,
                "vehicleType": editingRow.vehicleType,
                "isMarketRate": editingRow.isMarketRate,
                "marketRate": editingRow.marketRate,
                "hubId": selectedHubId,
                "shortage": 0,
            }
    
        );
    
        const handleChange = (name, value) => {
            if (name === "isMarketRate") {
                if (!value) {
                    setFormData((prevFormData) => ({
                        ...prevFormData,
                        [name]: value,
                        isMarketRate: false,
                        commission: 0,
                    }));
                } else {
                    setFormData((prevFormData) => ({
                        ...prevFormData,
                        [name]: value,
                        isMarketRate: true,
                        commission: 0,
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
        const formatDate = (dateString) => {
            // Split the date string by '-'
            const parts = dateString.split('-');
            // Rearrange the parts in the required format
            const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
            return formattedDate;
        };
        // Function to handle date change
        const handleDateChange = (date, dateString) => {
            const formattedGrDate = formatDate(dateString);
            console.log(formattedGrDate); // Output: "01/05/2024"
            // dateString will be in the format 'YYYY-MM-DD'
            handleChange('grDate', formattedGrDate);
        };
        const [materials, setMaterials] = useState([]);
        const [loadLocation, setloadLocations] = useState([]);
    
        const [deliveryLocation, setDeliveryLocations] = useState([]);
        const fetchMaterials = async () => {
            try {
                const response = await API.get(`get-material/${selectedHubId}`);
                if (response.status === 201) {
                    setMaterials(response.data.materials);
                }
            } catch (error) {
                console.error('Error fetching materials:', error);
            }
        };
        // Function to fetch LoadLocations from the API
        const fetchLoadLocations = async () => {
            try {
                const response = await API.get(`get-load-location/${selectedHubId}`);
                if (response.status == 201) {
                    setloadLocations(response.data.materials);
                } else {
                    console.log("error in fetchLoadLocations")
                }
    
            } catch (error) {
                console.error('Error fetching materials:', error);
            }
        };
        // Function to fetch DeliveryLocations from the API
        const fetchDeliveryLocations = async () => {
            try {
                const response = await API.get(`get-delivery-location/${selectedHubId}`);
                setDeliveryLocations(response.data.materials);
            } catch (error) {
                console.error('Error fetching materials:', error);
            }
        };
        const [vehicleDetails, setVehicleDetails] = useState([]); // State to store vehicle details
        const fetchVehicleDetails = async () => {
            try {
                const response = await API.get(`get-vehicle-details?page=${1}&limit=${120}&hubId=${selectedHubId}`);
                let truckDetails;
                if (response.data.truck == 0) {
                    truckDetails = response.data.truck
                    setVehicleDetails(truckDetails);
                } else {
    
                    truckDetails = response.data.truck[0].data || "";
                    setVehicleDetails(response.data.truck[0].count);
    
                    if (truckDetails && truckDetails.length > 0) {
                        const arrRes = truckDetails.sort(function (a, b) {
                            a = a.
                                registrationNumber.toLowerCase();
                            b = b.
                                registrationNumber.toLowerCase();
    
                            return a < b ? -1 : a > b ? 1 : 0;
                        });
    
                        setVehicleDetails(arrRes);
    
                        return arrRes;
                    }
                }
            } catch (error) {
                console.error('Error fetching vehicle details:', error);
                // Handle error
            }
        };
        const [selectedvehicleId, setselectedVehicleId] = useState(null); // State to store vehicle details
    
        const [selectedvehicleCommission, setselectedCommission] = useState(''); // State to store vehicle details
    
        const fetchSelectedVehicleDetails = async (vehicleId) => {
            try {
                const response = await API.get(`get-vehicle-details/${vehicleId}?page=${1}&limit=${120}&hubId=${selectedHubId}`);
                const truckDetails = response.data.truck;
                if (truckDetails && truckDetails.length > 0) {
                    const selectedVehicle = truckDetails[0];
                    // const { ownerId, ownerName, ownerPhone, vehicleBank, vehicleId, vehicleNumber, vehicleType } = selectedVehicle;
                    const ownerId = selectedVehicle.ownerId._id;
                    const ownerName = selectedVehicle.ownerId.name;
                    const ownerPhone = selectedVehicle.ownerId.phoneNumber;
                    const vehicleBank = selectedVehicle.accountId._id;
                    const vehicleId = selectedVehicle._id;
                    const vehicleNumber = selectedVehicle.registrationNumber;
                    const vehicleType = selectedVehicle.truckType;
                    setselectedCommission(selectedVehicle.commission)
                    let commissionRate;
                    if (formData.isMarketRate) {
                        console.log('first')
                        commissionRate = formData.marketRate
                    } else {
                        console.log('second')
                        commissionRate = selectedVehicle.commission
    
                    }
    
                    setFormData((prevFormData) => ({
                        ...prevFormData,
                        ownerId,
                        ownerName,
                        ownerPhone,
                        vehicleBank,
                        vehicleId,
                        vehicleNumber,
                        vehicleType,
                        commissionRate
                    }));
                }
            } catch (error) {
                console.error('Error fetching vehicle details:', error);
                // Handle error
            }
        };
        useEffect(() => {
            fetchSelectedVehicleDetails(selectedvehicleId)
        }, [formData.vehicleNumber, selectedvehicleId])
        // Fetch materials on component mount
        useEffect(() => {
            fetchMaterials();
            fetchLoadLocations();
            fetchDeliveryLocations();
            fetchVehicleDetails();
        }, [selectedHubId]);
    
        const handleSubmit = (e) => {
            e.preventDefault();
            // Calculate commissionTotal based on isMarketRate
            let commissionTotal = 0;
            if (formData.isMarketRate) {
                console.log("isMarketRate", formData.isMarketRate)
                // If isMarketRate is true, calculate commissionTotal as quantityInMetrics * marketRate
                commissionTotal = parseFloat(formData.quantityInMetricTons) * parseFloat(formData.marketRate);
            } else {
                console.log("isMarketRate", formData.isMarketRate)
                // If isMarketRate is false, calculate commissionTotal as commisionRate * rate
                const commissionTotalInPercentage = parseFloat(formData.quantityInMetricTons) * parseFloat(selectedvehicleCommission);
                commissionTotal = commissionTotalInPercentage / 100;
            }
    
            const payload = {
                // "balance": (parseFloat(formData.rate)) - (parseFloat(formData.diesel) + parseFloat(formData.cash) + parseFloat(formData.bankTransfer) + parseFloat(formData.shortage)),
                "balance": (parseFloat(formData.rate)) - (parseFloat(formData.diesel) + parseFloat(formData.cash) + parseFloat(formData.bankTransfer)),
                "bankTransfer": formData.bankTransfer,
                "cash": formData.cash,
                "deliveryLocation": formData.deliveryLocation,
                "deliveryNumber": formData.deliveryNumber,
                "diesel": formData.diesel,
                "grDate": formData.grDate,
                "grNumber": formData.grNumber,
                "invoiceProof": null,
                "loadLocation": formData.loadLocation,
                "materialType": formData.materialType,
                "ownerId": formData.ownerId,
                "ownerName": formData.ownerName,
                "ownerPhone": formData.ownerPhone,
                "quantityInMetricTons": formData.quantityInMetricTons,
                "rate": formData.rate,
                "totalExpense": parseFloat(formData.diesel) + parseFloat(formData.cash) + parseFloat(formData.bankTransfer),
                "vehicleBank": formData.vehicleBank,
                "vehicleId": formData.vehicleId,
                "vehicleNumber": formData.vehicleNumber,
                "vehicleType": formData.vehicleType,
                "commisionRate": formData.commisionRate,
                "commisionTotal": commissionTotal,
                "isMarketRate": formData.isMarketRate,
                "marketRate": formData.marketRate,
                "hubId": selectedHubId
            }
            // {{domain}}prod/v1/update-dispatch-challan-invoice/663a2e60e1d51550194c9402
            API.put(`update-dispatch-challan-invoice/${editingRow._id}`, payload)
                .then((response) => {
                    console.log('Challan updated successfully:', response.data);
                    alert("Challan updated successfully")
                    window.location.reload(); // Reload the page or perform any necessary action
                })
                .catch((error) => {
                    alert("error occurred")
                    console.error('Error adding truck data:', error);
                });
    
        };
    
        return (
            <>
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-xl font-bold">Edit Challan</h1>
                        {/* Breadcrumb component */}
                        <img src={backbutton_logo} alt="backbutton_logo" className='w-5 h-5 object-cover cursor-pointer' onClick={() => setShowTable(true)} />
    
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
                                    defaultChecked={formData.isMarketRate}
                                    name="isMarketRate"
                                    onChange={(checked) => handleChange('isMarketRate', checked)}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
    
                            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                                <Col className="gutter-row mt-6" span={6}>
    
                                    <Select
                                        name="materialType"
                                        onChange={(value) => handleChange('materialType', value)}
                                        placeholder="Material Type*"
                                        size="large"
                                        value={formData.materialType}
                                        style={{ width: '100%' }}
                                    >
                                        {materials.map((v, index) => (
                                            <Option key={index} value={v.materialType}>
                                                {`${v.materialType}`}
                                            </Option>
                                        ))}
                                    </Select>
                                </Col>
                                <Col className="gutter-row mt-6" span={6}>
                                    <Input
                                        type="text"
                                        name="grNumber"
                                        placeholder="grNumber*"
                                        size="large"
                                        value={formData.grNumber}
                                        style={{ width: '100%' }}
    
                                        onChange={(e) => handleChange('grNumber', e.target.value)}
                                    />
                                </Col>
                                <Col className="gutter-row mt-6" span={6}>
    
                                    <DatePicker
                                        placeholder="GR Date"
                                        size="large"
                                        style={{ width: "100%" }}
                                        onChange={handleDateChange} // Call handleDateChange function on date change
                                    />
                                </Col>
                                <Col className="gutter-row mt-6" span={6}>
    
                                    <Select
                                        name="loadLocation"
                                        onChange={(value) => handleChange('loadLocation', value)}
                                        placeholder="Loaded From*"
                                        size="large"
                                        value={formData.loadLocation}
                                        style={{ width: '100%' }}
                                    >
                                        {loadLocation.map((v, index) => (
                                            <Option key={index} value={v.location}>
                                                {`${v.location}`}
                                            </Option>
                                        ))}
                                    </Select>
    
                                </Col>
                            </Row>
                            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                                <Col className="gutter-row mt-6" span={6}>
                                    <Select
                                        name="deliveryLocation"
                                        onChange={(value) => handleChange('deliveryLocation', value)}
                                        placeholder="Deliver To*"
                                        size="large"
                                        value={formData.deliveryLocation}
                                        style={{ width: '100%' }}
                                    >
                                        {deliveryLocation.map((v, index) => (
                                            <Option key={index} value={v.location}>
                                                {`${v.location}`}
                                            </Option>
                                        ))}
                                    </Select>
                                </Col>
                                <Col className="gutter-row mt-6" span={6}>
                                    <Select
                                        name="vehicleNumber"
                                        placeholder="Vehicle Number*"
                                        size="large"
                                        value={formData.vehicleNumber}
                                        style={{ width: '100%' }}
                                        onChange={(value) => {
                                            const selectedVehicle = vehicleDetails.find((v) => v.registrationNumber === value);
                                            if (selectedVehicle) {
                                                console.log(selectedVehicle._id)
                                                setselectedVehicleId(selectedVehicle._id);
                                            }
                                            handleChange('vehicleNumber', value);
                                        }}
                                    >
                                        {vehicleDetails.map((v, index) => (
                                            <Option key={index} value={v.registrationNumber}>
                                                {`${v.registrationNumber}`}
                                            </Option>
                                        ))}
                                    </Select>
                                </Col>
                                <Col className="gutter-row mt-6" span={6}>
    
                                    <Select
                                        name="vehicleType"
                                        placeholder="Vehicle Type*"
                                        size="large"
                                        style={{ width: '100%' }}
                                        value={formData.vehicleType}
                                        disabled
                                    />
    
    
                                </Col>
                                <Col className="gutter-row mt-6" span={6}>
    
                                    <Input
                                        placeholder="DeliveryNumber*"
                                        size="large"
                                        name="deliveryNumber"
                                        value={formData.deliveryNumber}
                                        onChange={(e) => handleChange('deliveryNumber', e.target.value)}
                                    />
                                </Col>
                            </Row>
                            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                                <Col className="gutter-row mt-6" span={6}>
                                    <Input
                                        placeholder="Quantity (M/T)*"
                                        size="large"
                                        name="quantityInMetricTons"
                                        value={formData.quantityInMetricTons}
                                        onChange={(e) => handleChange('quantityInMetricTons', e.target.value)}
                                    />
                                </Col>
                                <Col className="gutter-row mt-6" span={6}>
                                    <Input
                                        placeholder="Company Rate*"
                                        type='number'
                                        size="large"
                                        value={formData.rate}
                                        name="rate"
                                        onChange={(e) => handleChange('rate', e.target.value)}
                                    />
                                </Col>
    
                                <Col className="gutter-row mt-6" span={6}>
                                    {formData.isMarketRate ? <>
                                        <Input
                                            type='number'
                                            placeholder="Market Rate Rs*"
                                            size="large"
                                            name="diesel"
                                            value={formData.marketRate}
                                            onChange={(e) => handleChange('marketRate', e.target.value)}
                                        />
                                    </> : <></>}
    
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
                                        type='number'
                                        placeholder="Diesel*"
                                        size="large"
                                        name="diesel"
                                        value={formData.diesel}
                                        onChange={(e) => handleChange('diesel', e.target.value)}
                                    />
                                </Col>
                                <Col className="gutter-row mt-2" span={6}>
                                    <Input
                                        type='number'
                                        placeholder="Cash*"
                                        size="large"
                                        name="cash"
                                        value={formData.cash}
                                        onChange={(e) => handleChange('cash', e.target.value)}
                                    />
                                </Col>
                                <Col className="gutter-row mt-2" span={6}>
                                    <Input
                                        type='number'
                                        placeholder="Bank Transfer*"
                                        size="large"
                                        name="bankTransfer"
                                        value={formData.bankTransfer}
                                        onChange={(e) => handleChange('bankTransfer', e.target.value)}
                                    />
    
                                </Col>
                                <Col className="gutter-row mt-2" span={6}>
                                    <Input
                                        type='text'
                                        placeholder="Shortage*"
                                        size="large"
                                        name="shortage"
                                        value={formData.shortage}
                                        onChange={(e) => handleChange('shortage', e.target.value)}
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
    
    return (
        <>
            {showTable ? (
          <>
                <DispatchChallanComponent />
                <DispatchChallanComponentTable onEditChallanClick={handleEditChallanClick} />
            </>
            ):(
                <EditableChallan editingRow={editingRow} />
            )
        }
        </>
    )

}


export default Receive