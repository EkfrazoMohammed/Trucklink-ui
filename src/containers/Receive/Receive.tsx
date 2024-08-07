import { useState, useEffect } from 'react';
import { API } from "../../API/apirequest"
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Extend dayjs with the plugins
dayjs.extend(utc);
dayjs.extend(timezone);
import { DatePicker, Table, Input, Select, Space, Button, Upload, Tooltip, Breadcrumb, Col, Row, Switch } from 'antd';

import { UploadOutlined, DownloadOutlined, EyeOutlined, RedoOutlined, FormOutlined, DeleteOutlined, PrinterOutlined, SwapOutlined } from '@ant-design/icons';
import moment from 'moment-timezone';

const { Search } = Input;
import backbutton_logo from "../../assets/backbutton.png"

import type { DatePickerProps } from 'antd';


const filterOption = (input, option) =>
    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;

const Receive = ({ onData, showTabs, setShowTabs }) => {

    const authToken = localStorage.getItem("token");

    const [showTable, setShowTable] = useState(true);
    const selectedHubId = localStorage.getItem("selectedHubID");
    // const [receive, setreceive] = useState([]);
    const [receive, setreceive] = useState<any[]>([]); // or useState<number[]>([]) if you expect numbers

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
    const goBack = () => {
        setShowTable(true)
        onData('flex')
        setShowTabs(true); // Set showTabs to false when adding owner
    }

    const convertToIST = (date) => {
        const istDate = moment.tz(date, "Asia/Kolkata");
        return istDate.valueOf();
    };

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
        //     // Calculate the start of the day in IST (5:30 AM)
        //     const startOfDayInIST = dayjs(startDate).startOf('day').set({ hour: 5, minute: 30 }).valueOf();
        //     data.startDate = startOfDayInIST;
        // }
        if (startDate) {
            // Calculate the start of the day in IST (5:30 AM)
            const startOfDayInIST = dayjs(startDate).startOf('day').set({ hour: 5, minute: 30 }).valueOf();
            // Convert the IST timestamp to a dayjs object in IST timezone
            const istDate = dayjs(startOfDayInIST).tz("Asia/Kolkata");

            // Convert the IST date to the start of the same day in UTC and get the timestamp in milliseconds
            const utcStartOfDay = istDate.startOf('day').add(5, 'hours').add(30, 'minutes').valueOf();
            data.startDate = utcStartOfDay;
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
        console.log(queryParams)
        try {
            const searchData = queryParams ? queryParams : null;

            const response = searchData ? await API.get(`get-receive-register${queryParams}&page=1?limit=100000&hubId=${selectedHubId}`, headersOb)
                : await API.get(`get-receive-register?page=1&limit=100000&hubId=${selectedHubId}`, headersOb);

            let allreceive;
            setLoading(false)
            if (response.data.dispatchData.length == 0) {
                allreceive = []; // Set to empty array when there are no dispatchData objects
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
            setLoading(false)
        }
    };
    //    // Update the useEffect hook to include currentPage and currentPageSize as dependencies
    useEffect(() => {
        getTableData();
    }, [searchQuery, currentPage, currentPageSize, selectedHubId, startDate, endDate]);
    const DispatchChallanComponent = () => {
        const initialSearchQuery = localStorage.getItem('searchQuery5') || '';
        const [searchQuery5, setSearchQuery5] = useState<string>(initialSearchQuery);

        // Update localStorage whenever searchQuery5 changes
        useEffect(() => {
            if (searchQuery5 !== initialSearchQuery) {
                localStorage.setItem('searchQuery5', searchQuery5);
            }
        }, [searchQuery5, initialSearchQuery]);

        const handleSearch = () => {
            getTableData(searchQuery5);
        };


        const onChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setSearchQuery5(value);
            console.log(value);
            if (value === "") {
                onReset();
            }
        };

        const onReset = () => {
            setSearchQuery5("");
            setStartDate("")
            setEndDate("")
            setStartDateValue("")
            setEndDateValue("")
            setLoading(false)
            getTableData("");
            localStorage.removeItem('searchQuery5');
        };
        return (
            <div className='flex gap-2 flex-col justify-between p-2'>

                <div className='flex gap-2'>
                    <Search
                        placeholder="Search by keyword"
                        size='large'
                        value={searchQuery5}
                        onChange={onChangeSearch}
                        onSearch={handleSearch}
                        style={{ width: 320 }}
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
                    {searchQuery5 !== null && searchQuery5 !== "" || startDate !== null && startDate !== "" || endDate !== null && endDate !== "" ? <><Button size='large' onClick={onReset} style={{ rotate: "180deg" }} icon={<RedoOutlined />}></Button></> : <></>}
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
        // const formatDate = (date) => {
        //     const parsedDate = new Date(date);
        //     if (!isNaN(parsedDate)) {
        //         return parsedDate.toLocaleDateString('en-GB');
        //     }
        //     return date; // Return the original date if parsing fails
        // };
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
        const [currentPageSize, setCurrentPageSize] = useState(10);
        const [activePageSize, setActivePageSize] = useState(10);
        const columns = [
            {
                title: 'Sl No',
                dataIndex: 'serialNumber',
                key: 'serialNumber',
                render: (text, record, index) => (currentPage - 1) * currentPageSize + index + 1,
                width: 80,
            },
            // {
            //     title: 'Sl No',
            //     dataIndex: 'serialNumber',
            //     key: 'serialNumber',
            //     render: (text, record, index: any) => index + 1,
            //     width: 90,
            //     fixed: 'left'

            // },
            {
                title: 'Bill No',
                dataIndex: 'billNumber',
                key: 'billNumber',
                render: (text, record, index: any) => text,
                width: 110,

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
            //         {
            //             title: 'Owner Name',

            //             width: 210,
            //             render: (_, record) => {
            //                 return <p>{record.ownerName}</p>
            //             },
            // //             sorter: (a, b) => a.record.ownerName.length - b.record.ownerName.length,
            // //   ellipsis: true,

            //         },
            {
                title: 'Owner Name',
                width: 210,
                render: (_, record) => {
                    return <p>{record.ownerName}</p>;
                },
                sorter: (a, b) => {
                    const nameA = a.ownerName ? a.ownerName.toLowerCase() : '';
                    const nameB = b.ownerName ? b.ownerName.toLowerCase() : '';
                    return nameA.localeCompare(nameB);
                },
                ellipsis: true,
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
            {
                title: 'Total',
                width: 150,
                render: (_, record) => {
                    return (record.quantityInMetricTons * record.rate).toFixed(2);
                }
            },
            {
                title: 'Commission',
                width: 160,
                render: (_, record) => {
                    const percentCommission = (record.commisionRate) * (record.quantityInMetricTons * record.rate)
                    const percentCommissionINR = (percentCommission / 100).toFixed(2);
                    return (
                        <div style={{ display: "flex", gap: "2rem", alignItems: "space-between", justifyContent: "center" }}>

                            {record.isMarketRate ? <>
                                <p>-</p>
                                <p>
                                    {`${record.commisionTotal.toFixed(2)}`}
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
                title: 'shortage',
                dataIndex: 'shortage',
                key: 'shortage',
                width: 110,
                render: (_, record) => {
                    return record.shortage
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
                            <span style={{ color: "#009f23", fontWeight: "600" }}>+ {(parseFloat(record.balance).toFixed(2))}</span>
                            :
                            <span style={{ color: "red" }}>{(parseFloat(record.balance).toFixed(2))}</span>

                        }
                    </p>
                )

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

        const totalQty = receive.reduce((sum, record) => sum + (record.quantityInMetricTons || 0), 0).toFixed(2);
        const totalAmout = receive.reduce((sum, record) => sum + ((record.quantityInMetricTons) * (record.rate) || 0), 0).toFixed(2);

        const totalDiesel = receive.reduce((sum, record) => sum + (record.diesel || 0), 0).toFixed(2);
        const totalCash = receive.reduce((sum, record) => sum + (record.cash || 0), 0).toFixed(2);
        const totalBankTransfer = receive.reduce((sum, record) => sum + (record.bankTransfer || 0), 0).toFixed(2);
        const totalShortage = receive.reduce((sum, record) => sum + (record.shortage || 0), 0).toFixed(2);
        // const totalCommission = (totalPercentCommission + totalMarketCommission);
        const totalPercentCommission = receive.reduce((sum, record) => sum + ((record.commisionRate || 0) * (record.quantityInMetricTons * record.rate) / 100), 0);
        const totalMarketCommission = receive.reduce((sum, record) => {
            if (record.marketRate !== 0) {
                return sum + (record.commisionTotal);
                // return sum + ((record.quantityInMetricTons * record.rate) - ((record.marketRate || 0) * (record.quantityInMetricTons)));
            }
            return sum;
        }, 0);

        const allTotalAmount = (totalPercentCommission + totalMarketCommission).toFixed(2);
        const totalBalance = receive.reduce((sum, record) => sum + (record.balance || 0), 0);

        const handlePageSizeChange = (newPageSize) => {
            setCurrentPageSize(newPageSize);
            setCurrentPage(1); // Reset to the first page
            setActivePageSize(newPageSize); // Update the active page size
        };

        const handleDownload = () => {
            const challans = receive;

            // Prepare data for owner details
            const ownerDetails = challans.map((challan) => (
                {
                    "_id": challan._id,
                    "quantityInMetricTons": challan.quantityInMetricTons,
                    "rate": challan.rate,
                    "commisionRate": challan.commisionRate,
                    "commisionTotal": challan.commisionTotal,
                    "totalExpense": challan.totalExpense,
                    "shortage": challan.shortage,
                    "balance": challan.balance,
                    "diesel": challan.diesel,
                    "cash": challan.cash,
                    "bankTransfer": challan.bankTransfer,
                    "recovery": challan.recovery,
                    "outstanding": challan.outstanding,
                    "isAcknowledged": challan.isAcknowledged,
                    "isReceived": challan.isReceived,
                    "isMarketRate": challan.isMarketRate,
                    "marketRate": challan.marketRate,
                    "billNumber": challan.billNumber,
                    "excel": challan.excel,
                    "materialType": challan.materialType,
                    "grDate": challan.grDate,
                    "grISODate": challan.grISODate,
                    "loadLocation": challan.loadLocation,
                    "deliveryLocation": challan.deliveryLocation,
                    "vehicleNumber": challan.vehicleNumber,
                    "ownerId": challan.ownerId,
                    "ownerName": challan.ownerName,
                    "vehicleId": challan.vehicleId,
                    "vehicleBank": challan.vehicleBank,
                    "ownerPhone": challan.ownerPhone,
                    "vehicleType": challan.vehicleType,
                    "deliveryNumber": challan.deliveryNumber,
                    "vehicleReferenceId": challan.vehicleReferenceId,
                    "vehicleBankReferenceId": challan.vehicleBankReferenceId,
                    "ownerReferenceId": challan.ownerReferenceId,
                    "hubId": challan.hubId,
                    "createdAt": challan.createdAt,
                    "modifiedAt": challan.modifiedAt,
                    "__v": 0
                    ,
                }
            ));



            // Create a new workbook
            const wb = XLSX.utils.book_new();

            // Add the owner details sheet to the workbook
            const ownerWS = XLSX.utils.json_to_sheet(ownerDetails);
            XLSX.utils.book_append_sheet(wb, ownerWS, 'receive Details');


            // Export the workbook to an Excel file
            XLSX.writeFile(wb, 'receive.xlsx');
        };
        const handlePrint = () => {
            const totalPagesExp = "{total_pages_count_string}";
            try {
                const doc = new jsPDF("l", "mm", "a4");
                const items = receive.map((challan, index) => [
                    index + 1,
                    challan.materialType || "-",
                    challan.grNumber || "-",
                    challan.grDate || "-",
                    challan.loadLocation || "-",
                    challan.deliveryLocation || "-",
                    challan.vehicleNumber || "-",
                    challan.ownerName || "-",
                    challan.vehicleType || "-",
                    challan.deliveryNumber || "-",
                    challan.quantityInMetricTons || "-",
                    challan.rate || "-",
                    challan.commisionRate || "-",
                    challan.commisionTotal || "-",
                    challan.diesel || "-",
                    challan.cash || "-",
                    challan.bankTransfer || "-",
                    // challan.totalExpense || "-",
                    challan.balance || "-",
                    challan.excel || "-",
                    challan.hubId || "-",

                ]);

                if (items.length === 0) {
                    message.error("No data available to download");
                } else {
                    doc.setFontSize(10);
                    const d = new Date();
                    const m = d.getMonth() + 1;
                    const day = d.getDate();
                    const year = d.getFullYear();

                    doc.autoTable({
                        head: [
                            [
                                "Sl No",
                                "materialType",
                                "gr No ",
                                "gr Date    ",
                                "loadLocation",
                                "deliveryLocation",
                                "Vehicle No         ",
                                "Owner Name             ",
                                "Vehicle Type           ",
                                "DO Number        ",
                                "Qty  ",
                                "rate                  ",
                                "commisionRate (%)",
                                "Total commision ",
                                "diesel ",
                                "cash",
                                "bank Transfer ",
                                // "totalExpense ",
                                "balance   ",
                                "excel   ",
                                "hubId   ",

                            ],
                        ],
                        body: items,
                        startY: 10,
                        headStyles: { fontSize: 8, fontStyle: "normal", fillColor: "#44495b" },
                        bodyStyles: { fontSize: 8, textAlign: "center" },
                        columnStyles: {
                            0: { cellWidth: 7 },
                            1: { cellWidth: 14 },
                            2: { cellWidth: 14 },
                            3: { cellWidth: 14 },
                            4: { cellWidth: 14 },
                            5: { cellWidth: 14 },
                            6: { cellWidth: 14 },
                            7: { cellWidth: 14 },
                            8: { cellWidth: 14 },
                            9: { cellWidth: 14 },
                            10: { cellWidth: 14 },
                            11: { cellWidth: 14 },
                            12: { cellWidth: 14 },
                            13: { cellWidth: 14 },
                            14: { cellWidth: 14 },
                            15: { cellWidth: 14 },
                            16: { cellWidth: 14 },
                            17: { cellWidth: 14 },
                            18: { cellWidth: 14 },
                            19: { cellWidth: 14 },
                            20: { cellWidth: 14 },
                            21: { cellWidth: 14 },
                            22: { cellWidth: 14 },
                            23: { cellWidth: 14 },
                            // 24: { cellWidth: 14 },

                        },
                        didDrawPage: function (data) {
                            // Header
                            doc.setFontSize(10);
                            doc.text("Challan Details", data.settings.margin.left + 0, 5);
                            doc.text("Date:-", data.settings.margin.left + 155, 5);
                            doc.text(
                                day + "/" + m + "/" + year,
                                data.settings.margin.left + 170,
                                5
                            );

                            // Footer
                            var str = "Page " + doc.internal.getNumberOfPages();
                            // Total page number plugin only available in jspdf v1.0+
                            if (typeof doc.putTotalPages === "function") {
                                str = str + " of " + totalPagesExp;
                            }
                            doc.setFontSize(10);


                            // jsPDF 1.4+ uses getWidth, <1.4 uses .width
                            var pageSize = doc.internal.pageSize;
                            var pageHeight = pageSize.height
                                ? pageSize.height
                                : pageSize.getHeight();
                            doc.text(str, data.settings.margin.left, pageHeight - 10);
                        },
                        margin: { top: 10 },
                    });


                    if (typeof doc.putTotalPages === "function") {
                        doc.putTotalPages(totalPagesExp);
                    }
                    doc.save("challans.pdf");
                }
            } catch (err) {
                message.error("Unable to Print");
            }
        };
        return (
            <>
                <div className='flex gap-2 mb-2 items-center justify-end'>
                    <Button icon={<DownloadOutlined />} onClick={handleDownload}></Button>
                    <Button icon={<PrinterOutlined />} onClick={handlePrint}></Button>
                    <div className='flex   my-paginations '>
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
                </div>
                <Table
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={receive}
                    scroll={{ x: 800 }}
                    rowKey="_id"
                    loading={loading}
                    // pagination={{
                    //     showSizeChanger: true,
                    //     position: ['bottomCenter'],
                    //     current: currentPage,
                    //     pageSize: pageSize,
                    //     onChange: (page, pageSize) => {
                    //         setCurrentPage(page);
                    //         setPageSize(pageSize);
                    //     },
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
                        offsetHeader: 0,
                    }}
                    summary={() => (
                        <Table.Summary.Row>
                            <Table.Summary.Cell colSpan={10} align="right">Total</Table.Summary.Cell>
                            <Table.Summary.Cell>{totalQty}</Table.Summary.Cell>
                            <Table.Summary.Cell></Table.Summary.Cell>
                            <Table.Summary.Cell></Table.Summary.Cell>
                            <Table.Summary.Cell>{totalAmout}</Table.Summary.Cell>
                            <Table.Summary.Cell>{allTotalAmount}</Table.Summary.Cell>
                            <Table.Summary.Cell>{totalDiesel}</Table.Summary.Cell>
                            <Table.Summary.Cell>{totalCash}</Table.Summary.Cell>
                            <Table.Summary.Cell>{totalBankTransfer}</Table.Summary.Cell>
                            <Table.Summary.Cell>{totalShortage}</Table.Summary.Cell>
                            <Table.Summary.Cell>
                                {totalBalance > 0 ?
                                    <span style={{ color: "#009f23", fontWeight: "600" }}>+ {(parseFloat(totalBalance).toFixed(2))}</span>
                                    :
                                    <span style={{ color: "red" }}>{(parseFloat(totalBalance).toFixed(2))}</span>

                                }
                                {/* {totalBalance} */}
                            </Table.Summary.Cell>

                        </Table.Summary.Row>
                    )}
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
                // For other fields, update state normally
                setFormData((prevFormData) => ({
                    ...prevFormData,
                    [name]: value,
                }));
            }
        };
        // const formatDate = (dateString) => {
        //     // Split the date string by '-'
        //     const parts = dateString.split('-');
        //     // Rearrange the parts in the required format
        //     const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
        //     return formattedDate;
        // };
        // // Function to handle date change
        // const handleDateChange = (date, dateString) => {
        //     const formattedGrDate = formatDate(dateString);
        //     // dateString will be in the format 'YYYY-MM-DD'
        //     handleChange('grDate', formattedGrDate);
        // };
        const formatDate = (dateString) => {

            // Split the date string by '-'
            const parts = dateString.split('-');
            // Rearrange the parts in the required format
            const formattedDate = `${parts[0]}/${parts[1]}/${parts[2]}`;
            return formattedDate;
        };
        // Function to handle date change

        const handleDateChange = (date, dateString) => {
            const formattedGrDate = formatDate(dateString);
            console.log(formattedGrDate)
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
        const [selectedvehicleId, setselectedVehicleId] = useState(null); // State to store vehicle details

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
                    goBack()
                    getTableData("");
                })
                .catch((error) => {
                    alert("error occurred")
                    console.error('Error adding truck data:', error);
                });

        }

        return (
            <>
                <div className="flex flex-col gap-2">

                    <div className="flex items-center gap-4">
                        <div className="flex"><img src={backbutton_logo} alt="backbutton_logo" className='w-5 h-5 object-cover cursor-pointer' onClick={goBack} /></div>
                        <div className="flex flex-col">
                            <h1 className='font-bold' style={{ fontSize: "16px" }}>Edit Challan</h1>
                            <Breadcrumb
                                items={[
                                    {
                                        title: 'Receive',
                                    },
                                    {
                                        title: 'Receive Register',
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
                                        showSearch
                                        optionFilterProp="children"
                                        filterOption={filterOption}
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
                                {/* <Col className="gutter-row mt-6" span={6}>

                                    <DatePicker
                                        placeholder="GR Date"
                                        size="large"
                                        style={{ width: "100%" }}
                                        onChange={handleDateChange} // Call handleDateChange function on date change
                                    />
                                </Col> */}
                                <Col className="gutter-row mt-6" span={6}>
                                    <DatePicker
                                        required
                                        placeholder="GR Date"
                                        size="large"
                                        format="DD-MM-YYYY"
                                        style={{ width: "100%" }}
                                        onChange={handleDateChange}
                                        value={dayjs(formData.grDate, 'DD/MM/YYYY')}
                                    />
                                </Col>
                                <Col className="gutter-row mt-6" span={6}>

                                    <Select
                                        showSearch
                                        optionFilterProp="children"
                                        filterOption={filterOption}
                                        name="loadLocation"
                                        onChange={(value) => handleChange('loadLocation', value)}
                                        placeholder="Load Location*"
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
                                        showSearch
                                        optionFilterProp="children"
                                        filterOption={filterOption}
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
                                        showSearch
                                        optionFilterProp="children"
                                        filterOption={filterOption}
                                        name="vehicleNumber"
                                        placeholder="Vehicle Number*"
                                        size="large"
                                        value={formData.vehicleNumber}
                                        style={{ width: '100%' }}
                                        onChange={(value) => {
                                            const selectedVehicle = vehicleDetails.find((v) => v.registrationNumber === value);
                                            if (selectedVehicle) {
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
                    <DispatchChallanComponentTable onEditChallanClick={handleEditChallanClick} />
                </>
            ) : (
                <EditableChallan editingRow={editingRow} />
            )
            }
        </>
    )

}


export default Receive