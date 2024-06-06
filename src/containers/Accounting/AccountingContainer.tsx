import { useState, useEffect } from 'react';
// Assuming states.json is located in the same directory as your component
import states from './states.json';
import { Table, Input, Select, Space, Button, Upload, Tabs, Tooltip, Breadcrumb, Col, notification, Row, Pagination } from 'antd';
import type { TabsProps } from 'antd';
import { UploadOutlined, DownloadOutlined, EyeOutlined, FormOutlined, RedoOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
const { Search } = Input;
import backbutton_logo from "../../assets/backbutton.png"
import { API } from "../../API/apirequest"
import debounce from 'lodash/debounce';
import VoucherBook from './VoucherBook';
import DailyCashBook from './DailyCashBook';
import RecoveryRegister from './RecoveryRegister';
import BillRegister from './BillRegister';
import A1ccountingContainer from './A1ccountingContainer';

const onSearch = (value: string) => {
  console.log('search:', value);
};

// Filter `option.value` match the user type `input`
const filterOption = (input: string, option?: { label: string; value: string }) =>
  (option?.value ?? '').toLowerCase().includes(input.toLowerCase());

const AccountingContainer = ({ onData }) => {
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


  const selectedHubId = localStorage.getItem("selectedHubID");
  const selectedHubName = localStorage.getItem("selectedHubName");
  const authToken = localStorage.getItem("token");


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

    try {
      const pages = page;
      const limitData = 600;
      const searchData = searchQuery || null; // Simplified conditional assignment
      const response = await API.get(
        searchData
          ? `get-owner-bank-details?searchOwnerName=${searchData}&page=${pages}&limit=${limitData}&hubId=${selectedHubId}`
          : `get-owner-bank-details?page=${pages}&limit=${limitData}&hubId=${selectedHubId}`,
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
    } catch (err) {
      console.log(err);
    }
  };


  const OwnerAdvance = ({ showTabs, setShowTabs }) => {

    return (
      <>

        <div className="mytab-content">
          <A1ccountingContainer />

        </div>
      </>
    );
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  useEffect(() => {
    getTableData(searchQuery, currentPage, currentPageSize, selectedHubId);
  }, [currentPage, currentPageSize, selectedHubId]);

  const [showTabs, setShowTabs] = useState(true);

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: `Owner Advance`,
      children: <OwnerAdvance showTabs={showTabs} setShowTabs={setShowTabs} />,
    },
    {
      key: '2',
      label: 'Voucher Book',
      children: <VoucherBook onData={onData} showTabs={showTabs} setShowTabs={setShowTabs} />,
    },
    {
      key: '3',
      label: 'Daily Cash Book',
      children: <DailyCashBook />,
    },
    {
      key: '4',
      label: 'Recovery Register',
      children: <RecoveryRegister />,
    },
    {
      key: '5',
      label: 'Bill Register',
      children: <BillRegister />,
    }
  ];

  return (
    <>

      {/* <div className={showTabs ? '' : 'onboarding-tabs-hidden'}>
        <Tabs activeKey={activeTabKey} items={items} onChange={handleTabChange} />
      </div> */}

      <h1>Accounting Container</h1>
    </>
  );
};

export default AccountingContainer;
