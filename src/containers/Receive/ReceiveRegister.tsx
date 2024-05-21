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


const ReceiveRegister2 = () => {

    const selectedHubId = localStorage.getItem("selectedHubID");
    const [searchQuery, setSearchQuery] = useState('');

    const [receive, setReceiveRegister] = useState([]);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleEditTruckClick = (rowData) => {
        console.log(rowData)
    };
   

    // Initialize state variables for current page and page size
    const [currentPage, setCurrentPage] = useState(1);
    const [currentPageSize, setCurrentPageSize] = useState(50);
    const [totalTruckData, setTotalTruckData] = useState(100)

    const getTableData = async () => {
        try {
            const searchData = searchQuery ? searchQuery : null;
            const response = searchData ? await API.get(`get-receive-register?page=1&limit=50&hubId=${selectedHubId}`)
                : await API.get(`get-receive-register?page=1&limit=50&hubId=${selectedHubId}`);
            // const response = searchData ?  await API.post(`get-challan-data?page=1&limit=50&hubId=6634de2e2588845228b2dbe4`)
            // : await API.post(`get-challan-data?page=1&limit=50&hubId=6634de2e2588845228b2dbe4`);  
            
            let allReceiveRegister;
           if (response.data.dispatchData.length == 0) {
                allReceiveRegister = response.data.disptachData
                console.log(allReceiveRegister)
                setReceiveRegister(allReceiveRegister);
            } else {

                allReceiveRegister = response.data.dispatchData[0].data || "";
                console.log(allReceiveRegister)
                setTotalTruckData(allReceiveRegister);

                if (allReceiveRegister && allReceiveRegister.length > 0) {
                    const arrRes = allReceiveRegister.sort(function (a, b) {
                        a = a.vehicleNumber.toLowerCase();
                        b = b.vehicleNumber.toLowerCase();

                        return a < b ? -1 : a > b ? 1 : 0;
                    });

                    setReceiveRegister(arrRes);

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

    // Truck master
    const Truck = () => {
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

    const TruckTable = ({ onEditTruckClick }) => {
        console.log(receive)
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
                title: 'deliveryNumber',
                dataIndex: 'deliveryNumber',
                key: 'deliveryNumber',
                width: 180,
            },
            {
                title: 'deliveryLocation',
                dataIndex: 'deliveryLocation',
                key: 'deliveryLocation',
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
                dataIndex: 'deliveryLocation',
                key: 'deliveryLocation',
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
                fixed: 'right',
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
                const newData = await getTableData(searchQuery, pageNumber, pageSize, selectedHubId);
                setReceiveRegister(newData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        const changePaginationAll = async (pageNumber, pageSize) => {
            try {
                setCurrentPage(pageNumber);
                setCurrentPageSize(pageSize);
                const newData = await getTableData(searchQuery, pageNumber, pageSize, selectedHubId);
                setReceiveRegister(newData);
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


    return (
        <>
            <>

                <Truck />
                <TruckTable onEditTruckClick={handleEditTruckClick} />

            </>
        </>
    )
}


export default ReceiveRegister2