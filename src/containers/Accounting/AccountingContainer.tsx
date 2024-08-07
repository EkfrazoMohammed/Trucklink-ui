import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Extend dayjs with the plugins
dayjs.extend(utc);
dayjs.extend(timezone);
import { Tabs, Button, Table, Space, Form, Tooltip, Popconfirm, Input, DatePicker, message, InputNumber, Select } from 'antd';

import type { TabsProps } from 'antd';
import { UploadOutlined, DownloadOutlined, EyeOutlined, FormOutlined, RedoOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { API } from "../../API/apirequest"
const dateFormat = "DD/MM/YYYY";
import VoucherBook from './VoucherBook';
import DailyCashBook from './DailyCashBook';
import RecoveryRegister from './RecoveryRegister';
import BillRegister from './BillRegister';

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

  const getTableData = async (searchQuery, selectedHubID) => {
    const headersOb = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      }
    };

    try {
      const searchData = searchQuery || null; // Simplified conditional assignment
      const response = await API.get(
        searchData
          ? `get-owner-bank-details?searchOwnerName=${searchData}&page=1&limit=10000&hubId=${selectedHubId}`
          : `get-owner-bank-details?page=1&limit=10000&hubId=${selectedHubId}`,
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

  // const OwnerAdvanceContainer = ({ showTabs, setShowTabs }) => {
  //   return (
  //     <>

  //         <OwnerAdvance />

  //     </>
  //   );
  // };
  const OwnerAdvanceContainer = ({ showTabs, setShowTabs }) => {
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalOutstanding, setTotalOutstanding] = useState('0.00');
    const [count, setCount] = useState(0);
    const [ledgerEntries, setLedgerEntries] = useState({});
    const [form] = Form.useForm();
    const [newRow, setNewRow] = useState(null);
    const [owners, setOwners] = useState([]);  // State to manage the list of owners
    const [ownerId, setOwnerId] = useState('');  // State to manage the selected owner name

    const [startDate, setStartDate] = useState(null);  // State to manage the start date
    const [endDate, setEndDate] = useState(null);  // State to manage the end date
    const [startDateValue, setStartDateValue] = useState("");  // State to manage the start date
    const [endDateValue, setEndDateValue] = useState("");  // State to manage the end date

    const authToken = localStorage.getItem("token");
    const selectedHubId = localStorage.getItem("selectedHubID");
    const headersOb = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      }
    };

    const [filterRequest, setFilterRequest] = useState(null);
    const handleOwnerNameChange = (value) => {
      setOwnerId(value);
    };
    const handleStartDateChange = (date) => {
      setStartDateValue(date)
      const unixTimestamp = new Date(date).getTime();
      setStartDate(unixTimestamp);
    };
    const handleEndDateChange = (date, dateString) => {
      if (date) {
        const formattedDate = dayjs(date).format("DD/MM/YYYY");
        setEndDateValue(formattedDate); // Set formatted date for display
        setEndDate(date); // Set Date object for further processing if needed
      } else {
        setEndDateValue(null);
        setEndDate(null);
      }
    };
    const handleFilter = () => {
      const endOfDayInIST = dayjs(endDate).endOf('day').set({ hour: 5, minute: 30 }).valueOf();

      updateFilterAndFetchData({
        ownerId,
        startDate,
        endDate: endOfDayInIST,
      });
    };

    const getTableData = async () => {
      try {
        setLoading(true);
        const searchData = filterRequest ? filterRequest : null;
        let response;
        if (searchData) {
          response = await API.post(`get-filter-owner-advance-data?page=1&limit=100000&hubId=${selectedHubId}`, searchData, headersOb);
        } else {
          response = await API.get(`get-advance-data/${selectedHubId}`, headersOb);
        }
    
        if (response.data) {
          if (Array.isArray(response.data.disptachData) && response.data.disptachData.length === 0) {
            setTotalOutstanding("0.00");
          }
    
          if (searchData && response.data.disptachData.length > 0) {
            const dataSource = response.data.disptachData.map(dispatchItem => {
              const data = dispatchItem.data;
              const { initialDate, ownerId, ownerName, initialAmount, ledgerEntries } = data;
              console.log(data);
    
              const intDate = dayjs(initialDate, "DD-MM-YYYY");
              // Calculate the total outstanding amount from the credit
              const totalCredit = ledgerEntries.flat().reduce((sum, entry) => sum + entry.credit, 0);
              
              return {
                key: data._id,
                ownerName: ownerName[0], // Assuming ownerName is always an array with at least one item
                initialDate,
                intDate,
                IntAmount: initialAmount,
                entries: ledgerEntries[0], // Initialize with the actual ledgerEntries
                totalCredit
              };
            });
    
            const totalOutstanding = dataSource.reduce((sum, item) => sum + item.totalCredit, 0);
            setTotalOutstanding(totalOutstanding.toFixed(2));
            setDataSource(dataSource);
            setCount(dataSource.length);
    
          } else {
            const dataSource = response.data.ownersAdavance.map((data) => {
              const { ownerDetails, outStandingAmount } = data;
              const { initialDate, ownerName } = ownerDetails[0];
              const intDate = dayjs(initialDate, "DD-MM-YYYY");
              return {
                key: data._id,
                ownerName, // Assuming ownerName is not an array here
                initialDate,
                intDate,
                IntAmount: outStandingAmount,
                entries: [] // Initialize empty, will fetch on expand
              };
            });
    
            setDataSource(dataSource);
            setCount(dataSource.length);
          }
        } else {
          setDataSource([]);
        }
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setDataSource([]);
        // message.error("Error fetching data. Please try again later", 2);
      }
    };
    
    // const getTableData = async () => {
    //   try {
    //     setLoading(true);
    //     const searchData = filterRequest ? filterRequest : null;
    //     let response;
    //     if (searchData) {
    //       response = await API.post(`get-filter-owner-advance-data?page=1&limit=100000&hubId=${selectedHubId}`, searchData, headersOb);
    //     } else {
    //       response = await API.get(`get-advance-data/${selectedHubId}`, headersOb);
    //     }

    //     if (response.data) {

    //       if (Array.isArray(response.data.disptachData) && response.data.disptachData.length === 0) {
    //         setTotalOutstanding("0.00");
    //       }
    //       // Handle the structure for get-filterOwnerAdvanceData response
    //       if (searchData && response.data.disptachData.length > 0) {
    //         const dataSource = response.data.disptachData.map(dispatchItem => {
    //           const data = dispatchItem.data;

    //           const { initialDate, ownerId, ownerName, initialAmount, ledgerEntries } = data;
    //           console.log(data);

    //           const intDate = dayjs(initialDate, "DD-MM-YYYY");
    //           return {
    //             key: data._id,
    //             ownerName: ownerName[0], // Assuming ownerName is always an array with at least one item
    //             initialDate,
    //             intDate,
    //             IntAmount: initialAmount,
    //             entries: ledgerEntries[0] // Initialize with the actual ledgerEntries
    //           };
    //         });
    //         setDataSource(dataSource);
    //         setCount(dataSource.length);
    //       } else {
    //         const dataSource = response.data.ownersAdavance.map((data) => {
    //           const { ownerDetails, outStandingAmount } = data;
    //           const { initialDate, ownerName } = ownerDetails[0];
    //           const intDate = dayjs(initialDate, "DD-MM-YYYY");
    //           return {
    //             key: data._id,
    //             ownerName, // Assuming ownerName is not an array here
    //             initialDate,
    //             intDate,
    //             IntAmount: outStandingAmount,
    //             entries: [] // Initialize empty, will fetch on expand
    //           };
    //         });
    //         setDataSource(dataSource);
    //         setCount(dataSource.length);
    //       }



    //     } else {
    //       setDataSource([]);
    //     }
    //     setLoading(false);
    //   } catch (err) {
    //     setLoading(false);
    //     setDataSource([]);
    //     // message.error("Error fetching data. Please try again later", 2);
    //   }
    // };


    const updateFilterAndFetchData = async (filters) => {
      setFilterRequest(filters);
      await getTableData();
    };

    useEffect(() => {
      if (filterRequest) {
        updateFilterAndFetchData(filterRequest);
      }
    }, [filterRequest]);
    const getOutstandingData = async () => {
      try {
        const response = await API.get(`get-owner-advance-outstanding-details/${selectedHubId}`, headersOb);
        if (response.status == 201) {
          const outstandingEntries = response.data.amountData || "";
          if (outstandingEntries && outstandingEntries.length > 0) {
            setTotalOutstanding(outstandingEntries[0].outStandingAmount.toFixed(2));
          } else {
            setTotalOutstanding("0.00");
          }
        }
      } catch (err) {
        console.log(err);
      }
    };

    const getOwners = async () => {
      try {
        const response = await API.get(`get-owner-name/${selectedHubId}`, headersOb);
        if (response.status == 201) {
          setOwners(response.data.ownerDetails || []);
        }
      } catch (err) {
        console.log(err);
        setOwners([]);
      }
    };


    const createOwnerAdvance = async (row) => {
      const { date, IntAmount, ownerName, ownerId } = row;
      const vDate = dayjs(date).format("DD/MM/YYYY");
      try {
        const payload = {
          ownerId: ownerId,
          ownerName: ownerName,
          entryDate: vDate,
          credit: Number(IntAmount),
          narration: "Vehicle Advance",
          hubId: selectedHubId
        }

        await API.post(`create-owner-advance`, payload, headersOb)
          .then(() => {
            message.success("Successfully Added Owner Advance Outstanding");
            getTableData();
            getOutstandingData();
          })
          .catch((error) => {
            const { response } = error;
            const { data } = response;
            const { message: msg } = data;
            message.error(msg);
          });
      } catch (err) {
        console.log(err);
      }
    };
    const [expandedRowKeys, setExpandedRowKeys] = useState([]);

    const handleAdd = () => {
      // Reset the newRow state
      setNewRow({
        key: count.toString(),
        date: null,
        ownerName: '',
        ownerId: '',
        IntAmount: 0,
      });

      // Reset the form if you are using one
      form.resetFields();

      setCount(count + 1);
    };
    const onReset = () => {
      setStartDate(null)
      setEndDate(null)
      setFilterRequest(null);
      setStartDateValue("")
      setEndDateValue("")
      getOutstandingData();
      updateFilterAndFetchData(null);
      setDataSource([]);
      setOwnerId('')
      setOwners([])
      setTimeout(() => {
        window.location.reload();
      })

    };
    const saveNewRow = async () => {
      try {
        await form.validateFields().then(values => {
          const newRowData = {
            ...newRow,
            ...values,
            // date: values.intDate.format(dateFormat),
            credit: Number(values.IntAmount)
          };

          createOwnerAdvance(newRowData);
          setNewRow(null);
        });
      } catch (errInfo) {
        console.log("Validate Failed:", errInfo);
      }
    };

    // Function to handle cancel action
    const cancel = () => {
      setNewRow(null);  // Reset newRow to null or an empty object to close the form
      getTableData();   // Optionally fetch table data if needed
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
      {
        title: 'Date',
        dataIndex: 'intDate',
        key: 'intDate',
        render: (date, record) => {
          if (newRow && newRow.key === record.key) {
            return (
              <Form.Item
                name="date"
                style={{ margin: 0 }}
                rules={[{ required: true, message: 'Please input date!' }]}
              >
                <DatePicker format={dateFormat} />
              </Form.Item>
            );
          }
          return dayjs(date).format('DD/MM/YYYY');
        }
      },
      {
        title: 'Owner Name',
        dataIndex: 'ownerName',
        key: 'ownerName',
        render: (text, record) => {
          if (newRow && newRow.key === record.key) {
            return (
              <Form.Item
                name="ownerName"
                style={{ margin: 0 }}
              >
                <Select
                showSearch
                  onChange={(value) => {
                    const selectedOwner = owners.find(owner => owner.name === value);

                    setNewRow({
                      ...newRow,
                      ownerName: value,
                      ownerId: selectedOwner ? selectedOwner._id : '',
                    });
                  }}
                >
                  {owners.map((owner, index) => (
                    <Select.Option key={index} value={owner.name}>
                      {owner.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            );
          }
          return text;
        }
      },
      {
        title: 'Outstanding Amount',
        dataIndex: 'IntAmount',
        key: 'IntAmount',
        render: (text, record) => {
          if (newRow && newRow.key === record.key) {
            return (
              <Form.Item
                name="IntAmount"
                style={{ margin: 0 }}
                rules={[{ required: true, message: 'Please input amount!' }]}
              >
                <InputNumber />
              </Form.Item>
            );
          }
          return text;
        }
      },
      {
        title: 'Action',
        key: 'operation',
        render: (_, record) => {
          if (newRow && newRow.key === record.key) {
            return (
              <Space size="middle">
                <Button onClick={saveNewRow} type="link">Save</Button>
                <Button onClick={cancel} type="link">Cancel</Button>
              </Space>
            );
          }
          return (
            <Space size="middle">
              <Popconfirm title="Sure to delete?" onConfirm={() => handleDeleteOwnerData(record.key)}>
                <Tooltip placement="top" title="Delete">
                  <a><DeleteOutlined /></a>
                </Tooltip>
              </Popconfirm>
            </Space>
          );
        }
      }
    ];
    const handleTableRowExpand = async (expanded, record) => {
      if (expanded) {
        try {
          if (record && record.key !== "") {
            const response = await API.get(`get-ledger-data/${record.key}/${selectedHubId}`, headersOb);
            const ledgerEntries = response.data.ownersAdavance[0].ledgerEntries;

            const dataSource = ledgerEntries.map((data) => {
              const date = data.entryDate;
              // const eDate = moment(date, "DD/MM/YYYY");
              const eDate = dayjs(date, 'DD/MM/YYYY')

              return {
                ...data,
                entDate: eDate,
                IdofOwner: record.key,
                key: data._id // Ensure unique key for each ledger entry
              };
            });

            setLedgerEntries((prevEntries) => ({
              ...prevEntries,
              [record.key]: dataSource
            }));
          }
        } catch (err) {
          console.error(err);
        }
      }

      // Update expandedRowKeys state
      setExpandedRowKeys((prevKeys) =>
        expanded ? [...prevKeys, record.key] : prevKeys.filter((key) => key !== record.key)
      );
    };

    const expandedRowRender = (record) => {
      const entries = ledgerEntries[record.key] || [];
      const hideLedgerAction = entries.length - 1;
      return (
        <div className='w-100 h-auto flex flex-col gap-2 bg-gray-50'>
          <LedgerTable record={record} entries={entries} hideLedgerAction={hideLedgerAction} />
        </div>
      );
    };

    const LedgerTable = ({ record, entries, hideLedgerAction }) => {
      const [form] = Form.useForm();
      const [editingKeyIn, setEditingKeyIn] = useState("");
      const [isAddingNew, setIsAddingNew] = useState(false);
      const isEditing = (record) => record.key === editingKeyIn;

      const edit = (record) => {
        console.log(record.entryDate);

        form.setFieldsValue({
          entDate: record.entryDate,
          credit: record.credit,
          debit: record.debit,
          narration: record.narration,
          ...record,
        });
        setEditingKeyIn(record.key);
        if (record.key == 'new') {
          setIsAddingNew(true);
        } else {
          setIsAddingNew(false);
        }
      };

      const cancel = () => {
        setEditingKeyIn("");
        setIsAddingNew(false);
        getTableData()
      };

      const save = async (key) => {
        console.log(key)
        try {
          const row = await form.validateFields();
          const newData = [...entries];
          const index = newData.findIndex((item) => key === item.key);

          if (isAddingNew) {
            const newEntry = {
              key: Date.now().toString(), // Generate a unique key
              ...row,
              entryDate: dayjs(row.entDate).format("DD/MM/YYYY"),
            };
            setLedgerEntries((prevEntries) => ({
              ...prevEntries,
              [record.key]: newData,
            }));
            setEditingKeyIn("");
            const payload = {
              entryDate: newEntry.entryDate,
              debit: Number(newEntry.debit),
              credit: Number(newEntry.credit),
              narration: newEntry.narration,
              hubId: selectedHubId
            };
            await API.put(`create-owner-ledger-entry/${record.key}`, payload, headersOb)
              .then(() => {
                message.success("Successfully added Ledger Entry");
                window.location.reload();
                getTableData();
                getOutstandingData();
              })
              .catch((error) => {
                const { response } = error;
                const { data } = response;
                const { message: msg } = data;
                console.log(msg)
                if (msg == "Invalid ledger entry") {
                  message.error("Enter only Debit or Credit");
                } else {
                  message.error(msg);
                }
              });

          } else {
            if (index > -1) {
              const item = newData[index];
              newData.splice(index, 1, { ...item, ...row });
              setLedgerEntries((prevEntries) => ({
                ...prevEntries,
                [record.key]: newData,
              }));
              setEditingKeyIn("");
              const { entDate, credit, debit, narration } = row;
              const formattedDate = dayjs(entDate).format("DD/MM/YYYY");
              const payload = {
                entryDate: formattedDate,
                debit: Number(debit),
                credit: Number(credit),
                narration,
                hubId: selectedHubId,
              };
              await API.put(`update-owner-ledger-entry/${record.key}/${key}`, payload, headersOb)
                .then(() => {
                  message.success("Successfully updated Ledger Entry");
                  getTableData();
                  getOutstandingData();
                  setTimeout(() => {
                    window.location.reload();
                  }, 1000)
                })
                .catch((error) => {
                  const { response } = error;
                  const { data } = response;
                  const { message: msg } = data;
                  if (msg == "Invalid ledger entry") {
                    message.error("Enter only Debit or Credit");
                  } else {
                    message.error(msg);
                  }
                });
            }
          }
        } catch (errInfo) {
          console.log("Validate Failed:", errInfo);
        }
      };

      const handleDeleteLedgerData = async (key) => {
        try {
          await API.delete(`delete-owner-ledger/${key}`, headersOb)
            .then(() => {
              message.success("Successfully Deleted Ledger Entry");
              getTableData();
              getOutstandingData();

              // Collapse the row by updating expandedRowKeys
              setExpandedRowKeys((prevKeys) => prevKeys.filter((rowKey) => rowKey !== key));

            })
            .catch((error) => {
              const { response } = error;
              const { data } = response;
              const { message: msg } = data;
              message.error(msg);
            });
        } catch (err) {
          console.log(err);
        }
      };
      const formatDate = (dateString) => {

        // Split the date string by '-'
        const parts = dateString.split('-');
        // Rearrange the parts in the required format
        const formattedDate = `${parts[0]}/${parts[1]}/${parts[2]}`;
        return formattedDate;
      };
      const handleAddInsideRow = (record) => {
        const newEntryKey = `new`;
        const newEntry = {
          key: newEntryKey,
          entDate: null,
          narration: '',
          debit: '',
          credit: '',
          ownerOutstanding: '',
        };

        setLedgerEntries((prevEntries) => {
          const updatedEntries = {
            ...prevEntries,
            [record.key]: [newEntry, ...(prevEntries[record.key] || [])], // Add newEntry at the top
          };

          setEditingKeyIn(newEntryKey);
          form.setFieldsValue({
            entDate: null,
            credit: '',
            debit: '',
            narration: '',
            ...newEntry,
          });

          return updatedEntries;
        });

        setEditingKeyIn(newEntryKey);
      };

      const columnsInsideRow = [
        {
          title: 'Sl No',
          dataIndex: 'serialNumber',
          key: 'serialNumber',
          render: (text, record, index) => index + 1,
          width: 80,
          fixed: 'left',
        },

        {
          title: 'Date',
          dataIndex: 'entryDate',
          key: 'entryDate',
          render: (text, record) => {
            console.log(record)
            const editable = isEditing(record);
            return editable ? (
              <Form.Item
                name="entDate"
                style={{ margin: 0 }}
                rules={[{ required: true, message: 'Please input date!' }]}
              >
                {/* <DatePicker 
                /> */}
                <DatePicker
                  required
                  size="large"
                  format="DD-MM-YYYY"
                  style={{ width: "100%" }}
                  // onChange={handleDateChange}
                  value={dayjs(record.entryDate, 'DD/MM/YYYY').format('DD/MM/YYYY')}
                />
              </Form.Item>
            ) : (
              record.entryDate ? dayjs(record.entryDate, 'DD/MM/YYYY').format('DD/MM/YYYY') : 'N/A'
            );
          },
        },
        // {
        //   title: 'Date change',
        //   dataIndex: 'entryDate',
        //   key: 'entryDate',
        //   render: (text, record) => {
        //     const editable = isEditing(record);
        //     return editable ? (
        //       <Form.Item
        //         name="entDate"
        //         style={{ margin: 0 }}
        //         rules={[{ required: true, message: 'Please input date!' }]}
        //       >
        //         <DatePicker
        //           format="DD/MM/YYYY"
        //           style={{ width: '100%' }}
        //          />
        //       </Form.Item>
        //     ) : (
        //       dayjs(record.entryDate, 'DD/MM/YYYY').format('DD/MM/YYYY')
        //     );
        //   },
        // },
        {
          title: 'Narration',
          dataIndex: 'narration',
          key: 'narration',
          render: (text, record) => {
            const editable = isEditing(record);
            return editable ? (
              <Form.Item
                name="narration"
                style={{ margin: 0 }}
                rules={[{ required: true, message: 'Please input narration!' }]}
              >
                <Input />
              </Form.Item>
            ) : (
              text
            );
          },
        },
        {
          title: 'Debit',
          dataIndex: 'debit',
          key: 'debit',
          render: (text, record) => {
            const editable = isEditing(record);
            return editable ? (
              <Form.Item
                name="debit"
                style={{ margin: 0 }}
                rules={[{ required: true, message: 'Please input debit!' }]}
              >
                <InputNumber />
              </Form.Item>
            ) : (
              text
            );
          },
        },
        {
          title: 'Credit',
          dataIndex: 'credit',
          key: 'credit',
          render: (text, record) => {
            const editable = isEditing(record);
            return editable ? (
              <Form.Item
                name="credit"
                style={{ margin: 0 }}
                rules={[{ required: true, message: 'Please input credit!' }]}
              >
                <InputNumber />
              </Form.Item>
            ) : (
              text
            );
          },
        },
        {
          title: 'Outstanding',
          dataIndex: 'ownerOutstanding',
          key: 'ownerOutstanding',
        },
        {
          title: 'Action',
          key: 'operation',
          render: (_, record, index) => {
            console.log(record.key)
            const editable = isEditing(record);
            const lastRow = record.key == "new" ? hideLedgerAction + 1 : hideLedgerAction;
            return editable || index !== lastRow ? (
              <Space size="middle">
                {editable ? (
                  <>
                    <Button
                      type="link"
                      onClick={() => save(record.key)}
                      style={{ marginRight: 8 }}
                    >
                      Save
                    </Button>
                    <Button type="link" onClick={cancel}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Tooltip placement="top" title="Edit">
                      <a onClick={() => edit(record)}><FormOutlined /></a>
                    </Tooltip>
                    <Popconfirm title="Sure to delete?" onConfirm={() => handleDeleteLedgerData(record.key)}>
                      <Tooltip placement="top" title="Delete">
                        <a><DeleteOutlined /></a>
                      </Tooltip>
                    </Popconfirm>
                  </>
                )}
              </Space>
            ) : null
          },
        },

      ];

      return (
        <div className='bg-[#BBE2FF] p-4'>
          <div className="flex justify-between items-center px-2">
            <h1 className='font-bold'>Owner Advance Outstanding</h1>
            <Button
              onClick={() => handleAddInsideRow(record)}
              type="primary"
              style={{
                marginBottom: 16,
              }}
            >
              ADD NEW ENTRY
            </Button>
          </div>
          <Form form={form} component={false}>
            <Table
              className='nestedtable-account'
              rowKey={(record) => record.key}
              bordered
              dataSource={entries}
              columns={columnsInsideRow}
              pagination={false}
            />
          </Form>
        </div>
      );
    };

    const handleDeleteOwnerData = async (key) => {
      try {
        await API.delete(`delete-owner-record/${key}`, headersOb)
          .then(() => {
            message.success("Successfully Deleted Ledger Entry");

            getTableData();
            getOutstandingData();
            getOwners();
          })
          .catch((error) => {
            const { response } = error;
            const { data } = response;
            const { message: msg } = data;
            message.error(msg);
          });
      } catch (err) {
        console.log(err);
      }
    };
    useEffect(() => {
      getTableData();
      getOutstandingData();
      getOwners();
    }, []);

    const handlePageSizeChange = (newPageSize) => {
      setCurrentPageSize(newPageSize);
      setCurrentPage(1); // Reset to the first page
      setActivePageSize(newPageSize); // Update the active page size
    };
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className='flex gap-2 items-center'>

            <div className="filter-container">
              <Select
                showSearch
                placeholder="Select Owner"
                optionFilterProp="children"
                size="large"
                value={ownerId || undefined} // Set value to undefined if ownerId is '' or null
                onChange={handleOwnerNameChange}
                style={{ width: 200, marginRight: 16 }}
              >
                {owners.map((owner) => (
                  <Select.Option key={owner._id} value={owner._id} >
                    {owner.name}
                  </Select.Option>
                ))}
              </Select>
              <DatePicker
                size="large"
                placeholder="Start Date"
                value={startDateValue}
                format={dateFormat}
                onChange={handleStartDateChange}
                style={{ marginRight: 16 }}
              />

              <DatePicker
                size='large'
                placeholder="End Date"
                value={endDate}
                onChange={handleEndDateChange}
                format='DD/MM/YYYY' // Display format for the DatePicker

              />
              <Button type="primary" style={{ marginLeft: ".5rem" }} onClick={handleFilter}>
                APPLY
              </Button>
            </div>
            {ownerId !== null && ownerId !== "" || startDate !== null && startDate !== 0 || endDate !== null && endDate !== 0 ? <><Button onClick={onReset} style={{ rotate: "180deg" }} icon={<RedoOutlined />}></Button></> : <></>}
          </div>

          <Button
            onClick={handleAdd}
            type="primary"
          >
            ADD OWNER BALANCE
          </Button>
        </div>
        <div className='flex gap-2 mb-2 items-center justify-end'>
          {/* <Button icon={<DownloadOutlined />}></Button> */}

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

        <div className="myowneradvancetab-content">
          <Form form={form} component={false}>
            <Table
              rowKey={(record) => record.key}
              bordered
              dataSource={newRow ? [newRow, ...dataSource] : dataSource}
              columns={columns}
              expandable={{
                expandedRowRender: (record) => expandedRowRender(record),
                onExpand: handleTableRowExpand,
              }}

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
              loading={loading}
              expandedRowKeys={expandedRowKeys} // Pass the expandedRowKeys state here
            />

          </Form>
        </div>
        <div className="flex my-4 text-md" style={{ backgroundColor: "#eee", padding: "1rem" }}>

          <div style={{ textAlign: 'right', width: '200px' }}>
          </div>
          <div style={{ textAlign: 'right', width: '200px' }}>
          </div>
          <div style={{ fontWeight: 'bold', width: '260px' }}>
            Total Outstanding Amount
          </div>
          <div style={{ fontWeight: 'bold', width: '160px' }}>
            {totalOutstanding > 0 ? <p style={{ color: "green", fontWeight: "600" }}>{totalOutstanding}</p> : <p style={{ color: "red" }}>{totalOutstanding}</p>}
          </div>
        </div>
      </div>
    );
  };


  useEffect(() => {
    getTableData(searchQuery, selectedHubId);
  }, [selectedHubId]);

  const [showTabs, setShowTabs] = useState(true);

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: `Owner Advance`,
      children: <OwnerAdvanceContainer showTabs={showTabs} setShowTabs={setShowTabs} />,
    },
    {
      key: '2',
      label: 'Voucher Book',
      children: <VoucherBook onData={onData} showTabs={showTabs} setShowTabs={setShowTabs} />,
    },
    {
      key: '3',
      label: 'Daily Cash Book',
      children: <DailyCashBook onData={onData} showTabs={showTabs} setShowTabs={setShowTabs} />,
    },
    {
      key: '4',
      label: 'Recovery Register',
      children: <RecoveryRegister onData={onData} showTabs={showTabs} setShowTabs={setShowTabs} />,
    },
    {
      key: '5',
      label: 'Bill Register',
      children: <BillRegister onData={onData} showTabs={showTabs} setShowTabs={setShowTabs} />,
    }
  ];

  return (
    <>
      <div className={showTabs ? '' : 'onboarding-tabs-hidden'}>
        <Tabs activeKey={activeTabKey} items={items} onChange={handleTabChange} />
      </div>
      {/* <h1>Accounting Container</h1> */}
    </>
  );
};

export default AccountingContainer;
