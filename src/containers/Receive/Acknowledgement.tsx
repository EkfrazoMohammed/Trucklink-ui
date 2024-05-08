import { useState, useEffect } from 'react';
import { API } from "../../API/apirequest"
import { DatePicker, Table, Input, Select, Space, Button, Upload, Tooltip, Breadcrumb, Col, Row, Switch } from 'antd';
import axios from "axios"
import { UploadOutlined, DownloadOutlined, EyeOutlined, FormOutlined, DeleteOutlined, PrinterOutlined, SwapOutlined } from '@ant-design/icons';

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

const Acknowledgement = () => {

    const selectedHubId = localStorage.getItem("selectedHubID");
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredOwnerData, setFilteredOwnerData] = useState([]);

    const [challanData, setchallanData] = useState([]);

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
            const response = searchData ? await axios.post(`http://localhost:3000/prod/v1/get-challan-data?page=1&limit=50`)
                : await axios.post(`http://localhost:3000/prod/v1/get-challan-data?page=1&limit=50`);
            // const response = searchData ?  await API.post(`get-challan-data?page=1&limit=50&hubId=6634de2e2588845228b2dbe4`)
            // : await API.post(`get-challan-data?page=1&limit=50&hubId=6634de2e2588845228b2dbe4`);  

            let allChallans;
            console.log(response)
            if (response.data.disptachData == 0) {
                allChallans = response.data.disptachData
                setchallanData(allChallans);
            } else {

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
                setchallanData(newData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        const changePaginationAll = async (pageNumber, pageSize) => {
            try {
                setCurrentPage(pageNumber);
                setCurrentPageSize(pageSize);
                const newData = await getTableData(searchQuery, pageNumber, pageSize, selectedHubId);
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


    return (
        <>
            <>

                <Truck />
                <TruckTable onEditTruckClick={handleEditTruckClick} />

            </>
        </>
    )
}


export default Acknowledgement