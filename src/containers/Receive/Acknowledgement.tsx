import { useState, useEffect } from 'react';
import { API } from "../../API/apirequest"

import dayjs from 'dayjs';
import { DatePicker, Table, Input, Select, Space, Button, Upload, Tooltip, Breadcrumb, Col, Row, Switch } from 'antd';

import { UploadOutlined, DownloadOutlined, EyeOutlined, RedoOutlined, FormOutlined, DeleteOutlined, PrinterOutlined, SwapOutlined } from '@ant-design/icons';

import moment from 'moment-timezone';
const { Search } = Input;
import backbutton_logo from "../../assets/backbutton.png"

import type { DatePickerProps } from 'antd';

const onChange: DatePickerProps['onChange'] = (date, dateString) => {
    console.log(date, dateString);
};

const filterOption = (input, option) =>
    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;

const Acknowledgement = ({ onData, showTabs, setShowTabs }) => {
    const authToken = localStorage.getItem("token");

    const [showTable, setShowTable] = useState(true);
    const selectedHubId = localStorage.getItem("selectedHubID");
    const [acknowledgement, setAcknowledgement] = useState([]);

    // Initialize state variables for current page and page size
    const [currentPage, setCurrentPage] = useState(1);
    const [currentPageSize, setCurrentPageSize] = useState(50);
    const [totalChallanData, setTotalChallanData] = useState(100)
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [startDateValue, setStartDateValue] = useState("")
    const [endDateValue, setEndDateValue] = useState("")
    const [loading, setLoading] = useState(false);
    // const handleSearch = (e) => {
    //     setSearchQuery(e);
    // };

    const convertToIST = (date) => {
        const istDate = moment.tz(date, "Asia/Kolkata");
        return istDate.valueOf();
    };
    // const handleStartDateChange = (date, dateString) => {
    //     console.log(convertToIST(dateString))
    //     setStartDateValue(date)
    //     setStartDate(date ? convertToIST(dateString) : null);
    // };

    // const handleEndDateChange = (date, dateString) => {
    //     setEndDateValue(date)
    //     setEndDate(date ? convertToIST(dateString) : null);
    // };
    // const handleEndDateChange = (date, dateString) => {
    //     if (date) {
    //         // Set endDate to the last minute of the selected day in IST
    //         const endOfDay = moment(dateString, "YYYY-MM-DD").endOf('day').tz("Asia/Kolkata").subtract(1, 'minute');
    //         setEndDateValue(date);
    //         setEndDate(endOfDay.valueOf());
    //     } else {
    //         setEndDateValue(null);
    //         setEndDate(null);
    //     }
    // };
    const handleStartDateChange = (date, dateString) => {
        if (date) {
            // Format the date for display
            const formattedDate = dayjs(date).format("DD/MM/YYYY");
            setStartDateValue(formattedDate); // Set formatted date for display
            setStartDate(date); // Set Date object for further processing if needed
        } else {
            setStartDateValue(null);
            setStartDate(null);
        }
    };
    const handleEndDateChange = (date, dateString) => {
        if (date) {
            // Format the date for display
            const formattedDate = dayjs(date).format("DD/MM/YYYY");
            setEndDateValue(formattedDate); // Set formatted date for display
            setEndDate(date); // Set Date object for further processing if needed
        } else {
            setEndDateValue(null);
            setEndDate(null);
        }
    };
    // Disable dates before the selected start date
    const disabledEndDate = (current) => {
        return current && current < moment(startDate).startOf('day');
    };
    const buildQueryParams = (params) => {
        let queryParams = [];
        for (const param in params) {
            if (params[param]) {
                queryParams.push(`${param}=${params[param]}`);
            }
        }
        return queryParams.length ? `?${queryParams.join("&")}` : "";
    };
    const getTableData = async (searchQuery) => {
        const headersOb = {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            }
        }

        const data = {};

        if (searchQuery) {
            data.searchTDNo = [searchQuery];
        }

        // if (startDate) {
        //   data.startDate = startDate;
        // }
        if (startDate) {
            // Calculate the start of the day in IST (5:30 AM)
            const startOfDayInIST = dayjs(startDate).startOf('day').set({ hour: 5, minute: 30 }).valueOf();
            data.startDate = startOfDayInIST;
        }
        // if (endDate) {
        //   data.endDate = endDate;
        // }
        if (endDate) {
            const endOfDayInIST = dayjs(endDate).endOf('day').set({ hour: 5, minute: 30 }).valueOf();

            data.endDate = endOfDayInIST;
        }


        let queryParams = buildQueryParams(data);
        setLoading(true)
        try {
            const searchData = queryParams ? queryParams : null;
            // const response = searchData ? await API.get(`get-acknowledgement-register?page=1&limit=50&hubId=${selectedHubId}`, data, headersOb)
            // const response = searchData ? await API.get(`get-acknowledgement-register?page=1&limit=50&hubId=${selectedHubId}`, data, headersOb)
            //     : await API.get(`get-acknowledgement-register?page=1&limit=50&hubId=${selectedHubId}`, headersOb);

            const response = searchData
                ? await API.get(`get-acknowledgement-register${queryParams}&page=1&limit=50&hubId=${selectedHubId}`, headersOb)
                : await API.get(`get-acknowledgement-register?page=1&limit=50&hubId=${selectedHubId}`, headersOb);

            let allAcknowledgement;
            setLoading(false)
            if (response.data.dispatchData.length == 0) {
                allAcknowledgement = response.data.disptachData
                console.log(allAcknowledgement)
                setAcknowledgement(allAcknowledgement);
            } else {
                allAcknowledgement = response.data.dispatchData[0].data || "";
                setTotalChallanData(allAcknowledgement);

                if (allAcknowledgement && allAcknowledgement.length > 0) {
                    const arrRes = allAcknowledgement.sort(function (a, b) {
                        a = a.vehicleNumber.toLowerCase();
                        b = b.vehicleNumber.toLowerCase();
                        return a < b ? -1 : a > b ? 1 : 0;
                    });
                    setAcknowledgement(arrRes);

                    return arrRes;
                }

            }
        } catch (err) {
            setLoading(false)
            console.log(err)
        }
    };
    //    // Update the useEffect hook to include currentPage and currentPageSize as dependencies
    useEffect(() => {
        getTableData(searchQuery);
    }, [searchQuery, currentPage, currentPageSize, selectedHubId, startDate, endDate]);


    const DispatchChallanComponent = () => {
        const initialSearchQuery = localStorage.getItem('searchQuery3') || '';
        const [searchQuery3, setSearchQuery3] = useState<string>(initialSearchQuery);

        // Update localStorage whenever searchQuery3 changes
        useEffect(() => {
            if (searchQuery3 !== initialSearchQuery) {
                localStorage.setItem('searchQuery3', searchQuery3);
            }
        }, [searchQuery3, initialSearchQuery]);

        const handleSearch = () => {
            getTableData(searchQuery3);
        };


        const onChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setSearchQuery3(value);
            console.log(value);
            if (value === "") {
                onReset();
            }
        };

        const onReset = () => {
            setSearchQuery3("");
            setStartDate("")
            setEndDate("")
            setStartDateValue("")
            setEndDateValue("")
            setLoading(false)
            getTableData("");
            localStorage.removeItem('searchQuery3');
        };
        return (
            <div className='flex gap-2 flex-col justify-between p-2'>

                <div className='flex gap-2'>
                    <Search
                        placeholder="Search by Delivery Number"
                        size='large'
                        value={searchQuery3}
                        onChange={onChangeSearch}
                        onSearch={handleSearch}
                        style={{ width: 320 }}
                    />
                    <DatePicker
                        size='large'
                        onChange={handleStartDateChange}
                        value={startDate} // Set Date object directly as the value
                        placeholder='From date'
                        format='DD/MM/YYYY' // Display format for the DatePicker
                    />
                    <DatePicker
                        size='large'
                        // value={endDateValue}
                        value={endDate}
                        onChange={handleEndDateChange}
                        placeholder='To date'
                        format='DD/MM/YYYY' // Display format for the DatePicker

                    />
                    {/* <DatePicker
                        size='large'
                        value={startDateValue}
                        onChange={handleStartDateChange}
                        placeholder='From date'
                    /> -
                    <DatePicker
                        size='large'
                        value={endDateValue}
                        onChange={handleEndDateChange}
                        disabledDate={disabledEndDate}
                        placeholder='To date'
                    /> */}
                    {/* <DatePicker
                        size='large'
                        value={startDateValue}
                        onChange={handleStartDateChange}
                        placeholder='From date'
                    /> -
                    <DatePicker
                        size='large'
                        value={endDateValue}
                        onChange={handleEndDateChange}
                        disabledDate={disabledEndDate}
                        placeholder='To date'
                    /> */}

                    {searchQuery3 !== null && searchQuery3 !== "" || startDateValue !== null && startDateValue !== "" || endDateValue !== null && endDateValue !== "" ? <><Button size='large' onClick={onReset} style={{ rotate: "180deg" }} icon={<RedoOutlined />}></Button></> : <></>}
                </div>
            </div>

        );
    };

    const DispatchChallanComponentTable = ({ onEditChallanClick, onSaveAndMoveToReceive }) => {

        const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

        const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
            setSelectedRowKeys(newSelectedRowKeys);
        };


        const rowSelection = {
            selectedRowKeys,
            onChange: onSelectChange,
        };

        // const formatDate = (date) => {
        //     const parsedDate = new Date(date);
        //     if (!isNaN(parsedDate)) {
        //       return parsedDate.toLocaleDateString('en-GB');
        //     }
        //     return date; // Return the original date if parsing fails
        //   };
        const formatDate = (date) => {
            const parsedDate = new Date(date);
            if (!isNaN(parsedDate)) {
                return parsedDate.toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                });
            }
            return date; // Return the original date if parsing fails
        };

        const [currentPage, setCurrentPage] = useState(1);
        const [pageSize, setPageSize] = useState(10); // Default page size, adjust if needed

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
                    let color;

                    if (differenceInDays < 10) {
                        backgroundColor = '#34ff61';
                        color = '#000';
                    } else if (differenceInDays < 20) {
                        backgroundColor = '#FFED4A';
                        color = '#000';

                    } else if (differenceInDays >= 30) {
                        backgroundColor = '#FF0000';
                        color = '#fff';
                    } else {
                        backgroundColor = '#FFED4A'; // Default background color
                        color = '#000';
                    }

                    return {
                        id: `ageing-${record._id}`,
                        style: { backgroundColor, color, textAlign: "center" },
                    };
                },
                render: (_, record) => {
                    const givenDate = new Date(record.grISODate);
                    const today = new Date();
                    const differenceInMs = today - givenDate;
                    const differenceInDays = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));
                    console.log("givendDate=>", givenDate, "today=>", today, "difference=>", differenceInDays)
                    return (
                        <span>{differenceInDays}</span>

                    );
                },
            },
            // {
            //     title: 'Sl No',
            //     dataIndex: 'serialNumber',
            //     key: 'serialNumber',
            //     render: (text, record, index: any) => index + 1,
            //     width: 90,

            // },
            {
                title: 'Sl No',
                dataIndex: 'serialNumber',
                key: 'serialNumber',
                render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
                width: 80,
            },
            {
                title: 'GR No',
                dataIndex: 'grNumber',
                key: 'grNumber',
                width: 100,
                sorter: (a, b) => a.grNumber - b.grNumber,
            },
            // {
            //     title: 'GR Date',
            //     dataIndex: 'grDate',
            //     key: 'grDate',
            //     width: 140,
            // },
            {
                title: 'GR Date',
                dataIndex: 'grDate',
                key: 'grDate',
                width: 120,
                render: (text) => formatDate(text),
            },
            {
                title: 'Truck Number',
                dataIndex: 'vehicleNumber',
                key: 'vehicleNumber',
                width: 140,
            },
            {
                title: 'Owner Name',

                width: 160,
                render: (_, record) => {
                    return <p>{record.ownerName}</p>
                }

            },
            {
                title: 'Load Location',
                dataIndex: 'loadLocation',
                key: 'loadLocation',
                width: 180,
            },
            {
                title: 'Delivery Location',
                dataIndex: 'deliveryLocation',
                key: 'deliveryLocation',
                width: 180,
            },
            {
                title: 'Delivery No',
                dataIndex: 'deliveryNumber',
                key: 'deliveryNumber',
                width: 140,
            },

            {
                title: 'Qty',
                dataIndex: 'quantityInMetricTons',
                key: 'quantityInMetricTons',
                width: 110,
            },

            {
                title: 'Company Rate',
                dataIndex: 'rate',
                key: 'rate',
                width: 110,
            },
            {
                title: 'Market Rate',
                dataIndex: 'marketRate',
                key: 'marketRate',
                width: 110,
            },
            // {
            //     title: 'Total',
            //     dataIndex: 'commisionTotal',
            //     key: 'commisionTotal',
            //     width: 110,
            // },
            // {
            //     title: 'Commission',
            //     dataIndex: 'commisionTotal',
            //     key: 'commisionTotal',
            //     width: 140,
            // },
            {
                title: 'Total',
                width: 110,
                render: (_, record) => {
                    return (record.quantityInMetricTons * record.rate).toFixed(2);
                }
            },
            {
                title: 'Commission',
                width: 160,
                render: (_, record) => {
                    const percentCommission = (record.commisionRate) * (record.quantityInMetricTons * record.rate)
                    const percentCommissionINR = (percentCommission / 100)
                    return (
                        <div style={{ display: "flex", gap: "2rem", alignItems: "space-between", justifyContent: "center" }}>

                            {record.isMarketRate ? <>
                                <p>-</p>
                                <p>
                                    {`${record.commisionTotal}`}
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
                width: 110,
            },
            {
                title: 'Cash',
                dataIndex: 'cash',
                key: 'cash',
                width: 110,
            },
            {
                title: 'Bank Transfer',
                dataIndex: 'bankTransfer',
                key: 'bankTransfer',
                width: 110,
            },
            {
                title: 'Shortage',
                dataIndex: 'shortage',
                key: 'shortage',
                width: 110,
                render: (_, record) => {
                    return record.shortage == 0 ? <>
                        0
                        {/* <Input type="number" placeholder='Enter' />  */}
                    </> : record.shortage;
                },
            },
            {
                title: 'Balance',
                dataIndex: 'balance',
                key: 'balance',
                width: 140,
                render: (_, record: unknown) => (
                    <p>
                        {record.balance > 0 ?
                            <span style={{ color: "#009f23", fontWeight: "600" }}>+ {(record.balance)}</span>
                            :
                            <span style={{ color: "red" }}>{(record.balance)}</span>

                        }
                    </p>
                )

            },
            {
                title: 'Action',
                key: 'action',
                width: 120,
                fixed: 'right',
                render: (record: unknown) => (
                    <Space size="middle">
                        <Tooltip placement="top" title="Edit"><a onClick={() => onEditChallanClick(record)}><FormOutlined /></a></Tooltip>
                        <Tooltip placement="top" title="save"><Button type='primary' onClick={() => onSaveAndMoveToReceive(record)}>Save</Button></Tooltip>
                    </Space>
                ),
            },
        ];
        return (
            <>
                <Table
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={acknowledgement}
                    scroll={{ x: 800 }}
                    rowKey="_id"
                    loading={loading}
                    // pagination={{
                    //     position: ['bottomCenter'],
                    //     showSizeChanger: true,
                    //     current: currentPage,
                    //     total: totalChallanData,
                    //     defaultPageSize: currentPageSize, // Set the default page size
                    //     onChange: changePagination,
                    //     onShowSizeChange: changePaginationAll,
                    // }}

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

    const [editingRow, setEditingRow] = useState(null);

    const handleEditChallanClick = (rowData) => {
        setEditingRow(rowData);
        setShowTable(false);
        onData('none')
        setShowTabs(false); // Set showTabs to false when adding owner
    };

    const handleSaveAndMoveToReceiveChallan = (rowData) => {
        const headersOb = {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            }
        }
        try {
            // {{domain}}prod/v1/update-dispatch-challan-invoice/663a2e60e1d51550194c9402
            API.put(`update-challan-status/${rowData._id}/ACK`, rowData, headersOb)
                .then((response) => {
                    console.log('Challan moved to register successfully:', response.data);
                    alert("Challan moved to register successfully")
                    window.location.reload(); // Reload the page or perform any necessary action
                })
                .catch((error) => {
                    alert("error occurred")
                    console.error('Error moving challan data:', error);
                });
        } catch (error) {
            console.log(err)
        }
    }

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
                "shortage": editingRow.shortage,
            }

        );


        const onResetClick = () => {
            console.log('reset clicked')
            setFormData(
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
                    "shortage": editingRow.shortage,
                }

            );
        }

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
            const headersOb = {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`
                }
            }
            try {
                const response = await API.get(`get-material/${selectedHubId}`, headersOb);
                if (response.status === 201) {
                    setMaterials(response.data.materials);
                }
            } catch (error) {
                console.error('Error fetching materials:', error);
            }
        };
        // Function to fetch LoadLocations from the API
        const fetchLoadLocations = async () => {
            const headersOb = {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`
                }
            }
            try {
                const response = await API.get(`get-load-location/${selectedHubId}`, headersOb);
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
            const headersOb = {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`
                }
            }
            try {
                const response = await API.get(`get-delivery-location/${selectedHubId}`, headersOb);
                setDeliveryLocations(response.data.materials);
            } catch (error) {
                console.error('Error fetching materials:', error);
            }
        };
        const [vehicleDetails, setVehicleDetails] = useState([]); // State to store vehicle details
        const fetchVehicleDetails = async () => {
            const headersOb = {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`
                }
            }
            try {
                const response = await API.get(`get-vehicle-details?page=${1}&limit=${120}&hubId=${selectedHubId}`, headersOb);
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
        const [selectedvehicleId, setselectedVehicleId] = useState([]); // State to store vehicle details

        const [selectedvehicleCommission, setselectedCommission] = useState(''); // State to store vehicle details

        const fetchSelectedVehicleDetails = async (vehicleId) => {
            const headersOb = {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`
                }
            }
            try {
                const response = await API.get(`get-vehicle-details/${vehicleId}?page=${1}&limit=${120}&hubId=${selectedHubId}`, headersOb);
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
        useEffect(() => {
            fetchSelectedVehicleDetails(editingRow.vehicleId)
        }, [formData.isMarketRate])

        // Fetch materials on component mount
        useEffect(() => {
            fetchMaterials();
            fetchLoadLocations();
            fetchDeliveryLocations();
            fetchVehicleDetails();
        }, [selectedHubId]);

        const [a, setA] = useState(null);
        const handleSubmit = (e) => {
            e.preventDefault();

            let commissionTotal = 0;
            let commisionRate = 0;

            const totalIncome = parseFloat(formData.quantityInMetricTons) * parseFloat(formData.rate);

            if (formData.isMarketRate) {
                console.log("isMarketRate", formData.isMarketRate);
                const t = totalIncome;
                const m = (parseFloat(formData.quantityInMetricTons)) * parseFloat(formData.marketRate);
                commissionTotal = totalIncome - m;
                commisionRate = 0;
            } else {
                console.log("isMarketRate", formData.isMarketRate);
                const commissionTotalInPercentage = totalIncome * parseFloat(selectedvehicleCommission);
                commissionTotal = commissionTotalInPercentage / 100;
                commisionRate = parseFloat(selectedvehicleCommission);
            }


            const totalExpenses = parseFloat(formData.diesel) + parseFloat(formData.cash) + parseFloat(formData.bankTransfer) + parseFloat(formData.shortage);
            const balance = totalIncome - commissionTotal - totalExpenses;

            const payload = {
                balance: balance,
                bankTransfer: formData.bankTransfer,
                cash: formData.cash,
                deliveryLocation: formData.deliveryLocation,
                deliveryNumber: formData.deliveryNumber,
                diesel: formData.diesel,
                grDate: formData.grDate,
                grNumber: formData.grNumber,
                invoiceProof: null,
                loadLocation: formData.loadLocation,
                materialType: formData.materialType,
                ownerId: formData.ownerId,
                ownerName: formData.ownerName,
                ownerPhone: formData.ownerPhone,
                quantityInMetricTons: formData.quantityInMetricTons,
                rate: formData.rate,
                totalExpense: totalExpenses,
                vehicleBank: formData.vehicleBank,
                vehicleId: formData.vehicleId,
                vehicleNumber: formData.vehicleNumber,
                vehicleType: formData.vehicleType,
                commisionRate: commisionRate,
                commisionTotal: commissionTotal,
                isMarketRate: formData.isMarketRate,
                marketRate: formData.marketRate,
                hubId: selectedHubId,
                shortage: formData.shortage,
            };
            setA(payload);
            const headersOb = {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`
                }
            }
            API.put(`update-dispatch-challan-invoice/${editingRow._id}`, payload, headersOb)
                .then((response) => {
                    console.log('Challan updated successfully:', response.data);
                    alert("Challan updated successfully")
                    window.location.reload(); // Reload the page or perform any necessary action
                })
                .catch((error) => {
                    alert("error occurred")
                    console.error('Error adding truck data:', error);
                });

        }
        const goBack = () => {
            setShowTable(true)
            onData('flex')
            setShowTabs(true); // Set showTabs to false when adding owner
        }

        return (
            <>
                <div className="flex flex-col gap-2">

                    <div className="flex items-center gap-4">
                        <div className="flex"> <img src={backbutton_logo} alt="backbutton_logo" className='w-5 h-5 object-cover cursor-pointer' onClick={goBack} /></div>
                        <div className="flex flex-col">
                            <h1 className='font-bold' style={{ fontSize: "16px" }}>Edit Challan</h1>
                            <Breadcrumb
                                items={[
                                    {
                                        title: 'Receive',
                                    },
                                    {
                                        title: 'Acknowledgement',
                                    },
                                    {
                                        title: 'Edit',
                                    },
                                ]}
                            />
                        </div>
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
                                        showSearch
                                        optionFilterProp="children"
                                        filterOption={filterOption}
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
                                        placeholder="Load Location*"
                                        size="large"
                                        value={formData.loadLocation}
                                        style={{ width: '100%' }}
                                        showSearch
                                        optionFilterProp="children"
                                        filterOption={filterOption}
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
                                        showSearch
                                        optionFilterProp="children"
                                        filterOption={filterOption}
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
                                        showSearch
                                        optionFilterProp="children"
                                        filterOption={filterOption}
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

    return (
        <>
            {showTable ? (
                <>
                    <DispatchChallanComponent />
                    <DispatchChallanComponentTable onEditChallanClick={handleEditChallanClick} onSaveAndMoveToReceive={handleSaveAndMoveToReceiveChallan} />
                </>
            ) : (
                <EditableChallan editingRow={editingRow} />
            )
            }
        </>
    )

}


export default Acknowledgement