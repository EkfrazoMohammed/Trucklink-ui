import { useState, useEffect } from 'react';
import { Button, Table, Space, Form, Tooltip, Popconfirm, Input, DatePicker, message, InputNumber, Select } from 'antd';
import { UploadOutlined, DownloadOutlined, PrinterOutlined, FormOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { API } from "../../API/apirequest";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const dateFormat = "DD/MM/YYYY";

const DailyCashBook = ({ onData, showTabs, setShowTabs }) => {
  const [dataSource, setDataSource] = useState([]);
  const [amountData, setAmountData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [form] = Form.useForm();
  const [newRow, setNewRow] = useState(null);
  const [editingRowKey, setEditingRowKey] = useState(null); // State for editable row

  const currentMonth = dayjs().month() + 1;
  const currentYear = dayjs().year();
  const [selectedDate, setSelectedDate] = useState({ month: currentMonth, year: currentYear });

  const selectedHubId = localStorage.getItem("selectedHubID");
  const authToken = localStorage.getItem("token");
  const headersOb = {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${authToken}`
    }
  };

  const getTableData = async (month, year) => {
    try {
      setLoading(true);
      const response = await API.get(`get-cash-book-by-month/${month}/${year}/${selectedHubId}`, headersOb);
      const { cashBookEntries, amounts } = response.data || [];

      if (cashBookEntries && cashBookEntries.length > 0) {
        const dataSource = cashBookEntries.map((entry) => ({
          key: entry._id,
          date: entry.entryDate,
          debit: entry.debit,
          credit: entry.credit,
          narration: entry.narration,
        }));

        // Calculate the sum of debits and credits
        const currentMonthDebit = cashBookEntries.reduce((sum, entry) => sum + entry.debit, 0);
        const currentMonthCredit = cashBookEntries.reduce((sum, entry) => sum + entry.credit, 0);
        const currentMonthOutStanding = currentMonthCredit - currentMonthDebit

        // Add currentMonthDebit and currentMonthCredit to amounts
        const updatedAmounts = {
          ...amounts,
          currentMonthDebit,
          currentMonthCredit,
          currentMonthOutStanding,
        };
        console.log(updatedAmounts)

        setDataSource(dataSource);
        setCount(dataSource.length);
        setAmountData(updatedAmounts);
      } else {
        setDataSource([]);
        setAmountData([]);
      }

      setLoading(false);
    } catch (err) {
      setLoading(false);
      message.error("Error fetching data. Please try again later", 2);
    }
  };


  const createCashBookEntry = async (row) => {
    const { date, debit, credit, narration } = row;
    const formattedDate = dayjs(date).format("DD/MM/YYYY");
    try {
      await API.post(`create-cash-book`, {
        entryDate: formattedDate,
        debit: debit,
        credit: credit,
        narration: narration,
        hubId: selectedHubId
      }, headersOb)
        .then(() => {
          message.success("Successfully Added Cash Book Entry");
          const { month, year } = selectedDate;
          getTableData(month, year);
        })
        .catch((error) => {
          const { response } = error;
          const { data } = response;
          const { message: msg } = data;
          console.log(msg)

          if (msg == "Invalid ledger entry" || msg == "Invalid cash book entry." || msg == "Unable to create cash book.") {
            message.error("Enter only Debit or Credit")
          } else {
            message.error(msg)
          }
        });
    } catch (err) {
      console.log(err);
    }
  };

  const updateCashBookEntry = async (key, row) => {
    const { date, debit, credit, narration } = row;
    const formattedDate = dayjs(date).format("DD/MM/YYYY");
    try {
      await API.put(`update-cash-book/${key}`, {
        entryDate: formattedDate,
        debit: debit,
        credit: credit,
        narration: narration,
      }, headersOb)
        .then(() => {
          message.success("Successfully Updated Cash Book Entry");
          const { month, year } = selectedDate;
          getTableData(month, year);
        })
        .catch((error) => {
          const { response } = error;
          const { data } = response;
          const { message: msg } = data;
          if (msg == "Invalid ledger entry" || msg == "Invalid cash book entry.") {
            message.error("Enter only Debit or Credit")
          } else {
            message.error(msg)
          }
        });
    } catch (err) {
      console.log(err);
    }
  };
  const [selectedMonth, setSelectedMonth] = useState(null)
  const handleMonthChange = (date, dateString) => {
    if (date) {
      const month = date.month() + 1;
      const year = date.year();
      setSelectedDate({ month, year });
      const formattedDate = dayjs(date).format('YYYY-MM');
      console.log(formattedDate)
      setSelectedMonth(formattedDate)
      getTableData(month, year);

    }
  };

  useEffect(() => {
    const { month, year } = selectedDate;
    getTableData(month, year);
  }, [selectedDate]);

  const handleAdd = () => {
    const newData = {
      key: count.toString(),
      date: null,
      debit: 0,
      credit: 0,
      narration: '',
    };
    setNewRow(newData);
    setCount(count + 1);
  };

  const saveNewRow = async () => {
    try {
      await form.validateFields().then(values => {
        const newRowData = {
          ...newRow,
          ...values,
          debit: Number(values.debit),
          credit: Number(values.credit),
        };
        createCashBookEntry(newRowData);
        setNewRow(null);
      });
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const saveEditRow = async (key) => {
    try {
      await form.validateFields().then(values => {
        const updatedRowData = {
          ...dataSource.find(item => item.key === key),
          ...values,
          debit: Number(values.debit),
          credit: Number(values.credit),
        };
        updateCashBookEntry(key, updatedRowData);
        setEditingRowKey(null);
      });
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
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
      dataIndex: 'date',
      key: 'date',
      width: 160,
      render: (date, record) => {
        if ((newRow && newRow.key === record.key) || (editingRowKey && editingRowKey === record.key)) {
          return (
            <Form.Item
              name="date"
              style={{ margin: 0 }}
              rules={[{ required: true, message: 'Please input date!' }]}
            // initialValue={dayjs(date, dateFormat)}
            >
              <DatePicker format={dateFormat} />
            </Form.Item>
          );
        }
        return date;
      }
    },
    {
      title: 'Narration',
      dataIndex: 'narration',
      key: 'narration',
      width: 260,
      render: (text, record) => {
        if ((newRow && newRow.key === record.key) || (editingRowKey && editingRowKey === record.key)) {
          return (
            <Form.Item
              name="narration"
              style={{ margin: 0 }}
              rules={[{ required: true, message: 'Please input narration!' }]}
            // initialValue={text}
            >
              <Input />
            </Form.Item>
          );
        }
        return text;
      }
    },
    {
      title: 'Debit',
      dataIndex: 'debit',
      key: 'debit',
      width: '190',
      render: (text, record) => {
        if ((newRow && newRow.key === record.key) || (editingRowKey && editingRowKey === record.key)) {
          return (
            <Form.Item
              name="debit"
              style={{ margin: 0 }}
              rules={[{ required: true, message: 'Please input debit amount!' }]}
            // initialValue={text}
            >
              <InputNumber />
            </Form.Item>
          );
        }
        return text;
      }
    },
    {
      title: 'Credit',
      dataIndex: 'credit',
      key: 'credit',
      width: '190',
      render: (text, record) => {
        if ((newRow && newRow.key === record.key) || (editingRowKey && editingRowKey === record.key)) {
          return (
            <Form.Item
              name="credit"
              style={{ margin: 0 }}
              rules={[{ required: true, message: 'Please input credit amount!' }]}
            // initialValue={text}
            >
              <InputNumber />
            </Form.Item>
          );
        }
        return text;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (text, record) => {
        const editable = editingRowKey === record.key;
        const isNewRow = newRow && newRow.key === record.key;

        return isNewRow ? (
          <Space size="middle">
            <Button onClick={saveNewRow} type="link">Save</Button>
            <Button onClick={() => setNewRow(null)} type="link">Cancel</Button>
          </Space>
        ) : editable ? (
          <Space size="middle">
            <Button onClick={() => saveEditRow(record.key)} type="link">Save</Button>
            <Button onClick={() => setEditingRowKey(null)} type="link">Cancel</Button>
          </Space>
        ) : (
          <Space size="middle">
            <Tooltip placement="top" title="Edit">
              <a onClick={() => {
                setEditingRowKey(record.key);
                form.setFieldsValue({
                  date: dayjs(record.date, dateFormat),
                  narration: record.narration,
                  debit: record.debit,
                  credit: record.credit
                });
              }}><FormOutlined /></a>
            </Tooltip>
            {/* <Popconfirm
              title="Are you sure to delete?"
              onConfirm={() => handleDelete(record.key)}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip placement="top" title="Delete">
                <a><DeleteOutlined /></a>
              </Tooltip>
            </Popconfirm> */}
          </Space>
        );
      }
    }
  ];

  const handleDeleteOwnerData = async (key) => {
    try {
      await API.delete(`delete-owner-record/${key}`, headersOb)
        .then(() => {
          message.success("Successfully Deleted Ledger Entry");
          const { month, year } = selectedDate;
          getTableData(month, year);
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
  const handlePageSizeChange = (newPageSize) => {
    setCurrentPageSize(newPageSize);
    setCurrentPage(1); // Reset to the first page
    setActivePageSize(newPageSize); // Update the active page size
  };
  console.log(dataSource)

  const handleDownload = () => {
    const challans = dataSource;
    const voucherDetails = challans.map((challan) => ({

      "key": challan.key,
      "date": challan.date,
      "debit": challan.debit,
      "credit": challan.credit,
      "narration": challan.narration,
    }));
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    // Add the owner details sheet to the workbook
    const ownerWS = XLSX.utils.json_to_sheet(voucherDetails);
    XLSX.utils.book_append_sheet(wb, ownerWS, 'Daily Cashbook');
    // Export the workbook to an Excel file
    XLSX.writeFile(wb, 'Daily Cashbook.xlsx');
  };

  const handlePrint = () => {
    const totalPagesExp = "{total_pages_count_string}";
    try {
      const doc = new jsPDF("l", "mm", "a4");

      // Ensure dataSource is an array and has items
      if (!Array.isArray(dataSource) || dataSource.length === 0) {
        message.error("No data available to download");
        return;
      }

      // Transform dataSource to the format required by autoTable
      const items = dataSource.map((challan, index) => [
        index + 1,
        challan.key,
        challan.date,
        challan.debit,
        challan.credit,
        challan.narration,

      ]);

      doc.setFontSize(10);
      const d = new Date();
      const m = d.getMonth() + 1;
      const day = d.getDate();
      const year = d.getFullYear();

      // Generate table
      doc.autoTable({
        head: [
          ["Sl No",
            "key",
            "date",
            "debit",
            "credit",
            "narration",
          ],
        ],
        body: items,
        startY: 20, // Adjust starting Y position if needed
        headStyles: { fontSize: 8, fontStyle: "normal", fillColor: "#44495b" },
        bodyStyles: { fontSize: 8, textAlign: "center" },
        columnStyles: {
          0: { cellWidth: 30 },  // Adjust column widths if needed
          1: { cellWidth: 60 },
          2: { cellWidth: 40 },
          3: { cellWidth: 40 },
          4: { cellWidth: 40 },
          5: { cellWidth: 40 },
         
        },
        didDrawPage: (data) => {
          // Header
          doc.setFontSize(10);
          doc.text("Daily Cashbook", data.settings.margin.left + 10, 10);
          doc.text(`Date: ${day}/${m}/${year}`, data.settings.margin.left + 170, 10);

          // Footer
          const str = `Page ${doc.internal.getNumberOfPages()}` +
            (typeof doc.putTotalPages === "function" ? ` of ${totalPagesExp}` : '');
          doc.setFontSize(10);
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
          doc.text(str, data.settings.margin.left, pageHeight - 10);
        },
        margin: { top: 20 },
      });

      // Add total pages if necessary
      if (typeof doc.putTotalPages === "function") {
        doc.putTotalPages(totalPagesExp);
      }

      doc.save("Daily Cashbook.pdf");

    } catch (err) {
      message.error("Unable to Print");
      console.error(err); // Log the error for debugging
    }
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className='flex gap-2 items-center'>
          <DatePicker
            size='large'
            placeholder='By Month'
            picker="month"
            onChange={handleMonthChange}
            value={dayjs().month(selectedDate.month - 1).year(selectedDate.year)}

          />
        </div>
        <Button
          onClick={handleAdd}
          type="primary"
        >
          CREATE DAILY CASH

        </Button>
      </div>
      <div className='flex gap-2 mb-2 items-center justify-end'>
        {/* <Button icon={<DownloadOutlined />}></Button> */}
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
      <Form form={form} component={false}>
        <Table
          rowKey={(record) => record.key}
          bordered
          dataSource={newRow ? [newRow, ...dataSource] : dataSource}
          columns={columns}
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
            offsetHeader: 5,
          }}
          loading={loading}

        />
        <div className="flex my-4 text-md" style={{ backgroundColor: "#eee", padding: "1rem" }}>

          <div style={{ textAlign: 'right', width: '160px' }}>
          </div>
          <div style={{ textAlign: 'right', width: '260px', fontWeight: 'bold' }}>
            Current Month balance
          </div>
          <div style={{ textAlign: 'right', width: '160px', fontWeight: 'bold' }}>
            {amountData.currentMonthDebit}
          </div>
          <div style={{ fontWeight: 'bold', width: '160px' }}>
          </div>
          <div style={{ fontWeight: 'bold', width: '260px' }}>
            {amountData.currentMonthCredit}
          </div>
          <div style={{ fontWeight: 'bold', width: '160px' }}>
            {amountData.currentMonthOutStanding > 0 ? <p style={{ color: "green" }}>{amountData.currentMonthOutStanding}</p> : <p style={{ color: "red" }}>{amountData.currentMonthOutStanding}</p>}
          </div>

        </div>
      </Form>
    </div>
  );
};

export default DailyCashBook;
