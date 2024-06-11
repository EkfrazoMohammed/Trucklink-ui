import React, {useState, useEffect} from "react";
import {
  Table,
  Input,
  InputNumber,
  Button,
  Popconfirm,
  Form,
  Col,
  DatePicker,
  message,
} from "antd";
import axios from "axios";
import {BASE_URL} from "../../../constants/constants";
import Editicon from "../../../assests/images/edit.svg";
import dateicon from "../../../assests/images/dateicon.svg";
import Deleteicon from "../../../assests/images/delete.svg";
import auth from "../../../utils/auth";
import moment from "moment";
const originData = [];
const dateFormat = "DD/MM/YYYY";
const userDetails = auth.getAuthToken().userDetails;
const numInput = (event) => {
  const val = event.target.value;
  var digit = /^[0-9]*\.?[0-9]*$/.test(val);
  if (/^[0-9]*\.?[0-9]*$/.test(val) && event.key !== "Backspace") {
    var with2Decimals = val.toString().match(/^-?\d+(?:\.\d{0,1})?/);
    if (with2Decimals) {
      event.target.value = with2Decimals[0];
    }
  } else {
    return true;
  }
};

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  // const inputNode = inputType === "number" ? <InputNumber /> : <Input />;
  let inputNode =
    inputType === "number" ? (
      <InputNumber />
    ) : (
      <Input
        onKeyPress={(event) => {
          if (
            numInput(event) &&
            !/^[0-9]*\.?[0-9]*$/.test(event.key) &&
            event.key !== "Backspace"
          ) {
            event.preventDefault();
          }
        }}
        maxLength={10}
      />
    );
  if (dataIndex === "narration") {
    inputNode = <Input />;
  }
  if (dataIndex === "entryDate") {
    inputNode = (
      <DatePicker
        format={dateFormat}
        suffixIcon={<img src={dateicon} alt="dateIcon" />}
        allowClear={false}
        autoComplete="off"
      />
    );
  }
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex === "entryDate" ? "entDate" : dataIndex}
          style={{
            margin: 0,
          }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const EditableTable = (TableData, OwnerDetails, parentFn) => {
  const [form] = Form.useForm();
  const [data, setData] = useState("");
  const [editingKey, setEditingKey] = useState("");
  const [ownerName, setownerName] = useState("");
  const [ownerId, setownerId] = useState("");
  const [EditingRowId, setEditingRowId] = useState("");
  const [detailsofOwner, setdetailsofOwner] = useState("");
  const [refreshValue, setrefreshValue] = useState(false);
  // const [parentFun, setParentFun] = useState("");

  const isEditing = (record) => record._id === editingKey;

  const edit = (record) => {
    form.setFieldsValue({
      entryDate: "",
      naration: "",
      debit: "",
      credit: "",
      ...record,
    });
    setEditingKey(record._id);
    setEditingRowId(record._id);
  };

  const deleteLedger = async (record) => {
    const {_id} = record;
    try {
      await axios.delete(`${BASE_URL}delete-owner-ledger/${_id}`);
      message.success("Removed entry from owner ledger");
      gettableData().then(function (response) {
        setData(response);
      });
      setrefreshValue(true);
    } catch (err) {
      console.log(err);
      message.error("Cannot remove entry from owner ledger");
    }
  };
  const handleCancel = (key) => {
    const dataSource = [...data];
    const dataof = dataSource.filter((item) => item.key !== key);
    setData(dataof);
    setEditingKey("");
  };
  const Cancel = () => {
    setEditingKey("");
  };
  const gettableData = async () => {
    try {
      if (detailsofOwner) {
        const response = await axios.get(
          `${BASE_URL}get-ledger-data/${detailsofOwner.ledgerId}`
        );
        const ledgerEntries = response.data.ownersAdavance[0].ledgerEntries;
        const dataSource = ledgerEntries.map((data, index) => {
          const date = data.entryDate;
          var eDate = moment(date, "DD/MM/YYYY");
          return {
            ...data,
            entDate: eDate,
          };
        });
        return dataSource;
      }
    } catch (err) {
      console.log(err);
    }
  };
  const addRow = () => {
    const newData = {
      entryDate: "",
      narration: "",
      debit: "0",
      credit: "0",
      _id: 1,
      key: 1,
    };
    const datasource = [newData, ...data];
    setData(datasource);
    form.setFieldsValue({
      entryDate: "",
      narration: "",
      debit: "0",
      credit: "0",
      _id: 1,
      key: 1,
    });
    setEditingKey(1);
  };

  useEffect(() => {
    const Tdata = TableData.TableData;
    if (Tdata) {
      if (Tdata.length > 0) {
        if (!data && refreshValue !== true) {
          setData(Tdata);
          setdetailsofOwner(TableData.OwnerDetails[0]);
        }
        if (refreshValue === true) {
          gettableData().then(function (response) {
            setData(response);
          });
          setrefreshValue(false);
          TableData.parentFn();
        }
        // setrefreshValue(false);
        // setParentFun(TableData.parentFn);
      }
    }
  }, [data, TableData, OwnerDetails, parentFn, refreshValue]);
  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const {entDate, debit, credit, narration} = row;
      var DateString = moment(entDate).format("DD/MM/YYYY");
      var startDate = moment(DateString, "DD/MM/YYYY");
      var eDate = startDate._i;
      await axios.put(
        `${BASE_URL}update-owner-ledger-entry/${detailsofOwner.ledgerId}/${EditingRowId}`,
        {
          entryDate: eDate,
          debit: Number(debit),
          credit: Number(credit),
          narration,
        }
      );
      message.success("Successfully Updated Ledger details");
      setEditingKey("");
      setrefreshValue(true);
      gettableData().then(function (response) {
        setData(response);
      });
    } catch (errInfo) {
      message.error("Enter only Debit or Credit");
    }
  };

  const CreateLedger = async (key) => {
    try {
      const row = await form.validateFields();
      const {entDate, debit, credit, narration} = row;
      var DateString = moment(entDate).format("DD/MM/YYYY");
      var startDate = moment(DateString, "DD/MM/YYYY");
      var eDate = startDate._i;
      await axios
        .put(`${BASE_URL}create-owner-ledger-entry/${detailsofOwner.ownerId}`, {
          entryDate: eDate,
          debit: Number(debit),
          credit: Number(credit),
          narration,
        })
        .then(() => {
          message.success("Successfully Added Ledger details");
          setrefreshValue(true);
          setEditingKey("");
        })
        .catch((error) => {
          const {response} = error;
          const {data} = response;
          const {message: msg} = data;
          message.error(msg);
        });
    } catch (errInfo) {
      message.error("Enter either debit or credit");
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "entryDate",
      editable: true,
      width: "20%",
    },
    {
      title: "Naration",
      dataIndex: "narration",
      key: "narration",
      width: "30%",
      editable: true,
      render: (text, record) => (
        <span style={{textTransform: "capitalize"}}>{record.narration}</span>
      ),
    },
    {
      title: "Debit",
      dataIndex: "debit",
      width: "15%",
      editable: true,
    },
    {
      title: "Credit",
      dataIndex: "credit",
      width: "15%",
      editable: true,
    },
    {
      title: "Outstanding",
      dataIndex: "ownerOutstanding",
      width: "15%",
    },
    {
      title: "",
      dataIndex: "operation",
      width: "20%",
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <div style={{marginTop: "5px"}}>
              {record._id === 1 ? (
                <div style={{display: "flex"}}>
                  <div>
                    <Button
                      type="primary"
                      className="savebtn"
                      onClick={() => CreateLedger(record.key)}
                      style={{
                        height: "27px",
                        padding: "5px",
                        width: "60px",
                      }}
                    >
                      SAVE
                    </Button>
                  </div>
                  <div>
                    <Button
                      type="primary"
                      className="cancelCashbook"
                      onClick={() => handleCancel(record.key)}
                      style={{
                        height: "27px",
                        padding: "5px",
                        width: "60px",
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div style={{display: "flex"}}>
                  <div>
                    <Button
                      type="primary"
                      className="savebtn"
                      onClick={() => save(record.key)}
                      style={{
                        height: "27px",
                        padding: "5px",
                        width: "60px",
                      }}
                    >
                      SAVE
                    </Button>
                  </div>
                  <div>
                    <Button
                      type="primary"
                      className="cancelCashbook"
                      onClick={() => Cancel(record.key)}
                      style={{
                        height: "27px",
                        padding: "5px",
                        width: "60px",
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* <Button onClick={cancel}>X</Button> */}
          </span>
        ) : (
          <div style={{display: "flex"}}>
            <div>
              <Button
                onClick={() => edit(record)}
                disabled={editingKey !== ""}
                style={{
                  border: "none",
                  outline: "none",
                  backgroundColor: "transparent",
                  boxShadow: "none",
                  padding: "5px",
                }}
              >
                <img src={Editicon} style={{cursor: "pointer"}} />
              </Button>
            </div>
            {data[data.length - 1]._id !== record._id && (
              <div>
                {userDetails && userDetails.roleName === "Admin" ? (
                  <Popconfirm
                    title="Are you sure?"
                    onConfirm={() => deleteLedger(record)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <img
                      src={Deleteicon}
                      alt="del"
                      style={{padding: "5px", cursor: "pointer"}}
                    />
                  </Popconfirm>
                ) : (
                  ""
                )}
              </div>
            )}
          </div>
        );
      },
    },
  ];
  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });
  return (
    <div style={{margin: "0 40px"}}>
      <div className="cashBookHeader">
        <h2 style={{fontSize: "14px", fontWeight: "600"}}>
          {detailsofOwner ? detailsofOwner.ownerName : ""} Advance Ledger
        </h2>
        <Col xs={12} sm={12} md={9} lg={9} xl={9}>
          <div style={{display: "flex", float: "right"}}>
            <div style={{padding: "10px 0px 10px 10px"}}>
              <Button
                type="primary"
                onClick={addRow}
                disabled={editingKey !== ""}
              >
                ADD ENTRY
              </Button>
            </div>
          </div>
        </Col>
      </div>
      {/* <Button onClick={addRow} disabled={editingKey !== ""}>
        Add
      </Button> */}
      {/* <Form form={form} component={false}>
        <Table
          className="nestedTable"
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          dataSource={data}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={false}
          rowKey="_id"
        />
      </Form> */}
    </div>
  );
};

export default EditableTable;
