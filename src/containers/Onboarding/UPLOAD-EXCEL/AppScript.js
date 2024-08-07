function mainFunction() {
  fetchAndStoreHubs(); // Call the function to fetch and store hubs
  fetchDetailsForAll(); // Call the function to fetch bank details for all IFSC codes
}

function fetchBankDetails(ifscCode) {
  var url = "https://ifsc.razorpay.com/" + ifscCode;

  try {
    var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    var statusCode = response.getResponseCode();

    if (statusCode === 200) {
      var data = JSON.parse(response.getContentText());

      // Check if the response contains the required fields
      if (data.BANK && data.BRANCH) {
        return [data.BANK, data.BRANCH];
      } else {
        return ["Data Not Found", "Data Not Found"];
      }
    } else {
      Logger.log("Error: " + statusCode + " for IFSC Code: " + ifscCode);
      return ["Invalid IFSC", "Invalid IFSC"];
    }
  } catch (e) {
    // Log the error for debugging
    Logger.log("Exception: " + e.toString() + " for IFSC Code: " + ifscCode);
    return ["Error", "Error"];
  }
}

function onEdit(e) {
  var sheet = e.source.getActiveSheet();
  if (sheet.getName() !== "owner_data_sheet") return; // Change to your sheet name
  var range = e.range;
  var col = range.getColumn();
  var row = range.getRow();

  // Check if the edited cell is in the state selection column
  if (col === 4 && row > 2) {
    // Assuming the state selection column is D and headers are in row 1
    var state = range.getValue();
    var allStatesSheet = e.source.getSheetByName("ALL_STATES");
    var headers = allStatesSheet.getRange("C2:AL2").getValues()[0];
    var columnIndex = headers.indexOf(state);

    if (columnIndex !== -1) {
      var districts = allStatesSheet
        .getRange(3, columnIndex + 3, allStatesSheet.getLastRow() - 2, 1)
        .getValues();
      var districtList = [];
      for (var i = 0; i < districts.length; i++) {
        if (districts[i][0] !== "") {
          districtList.push(districts[i][0]);
        }
      }

      var validationRange = sheet.getRange(row, 5); // Assuming the districts dropdown is in column E
      var rule = SpreadsheetApp.newDataValidation()
        .requireValueInList(districtList)
        .build();
      validationRange.setDataValidation(rule);
    }
  }
}

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu("TAYIB-Fetch Bank Details")
    .addItem("Fetch Bank Details", "fetchDetailsForAll")
    .addItem("Hubs", "fetchAndStoreHubs")
    .addToUi();
}

function fetchDetailsForAll() {
  var sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("owner_data_sheet");
  if (!sheet) {
    Logger.log('Sheet "owner_data_sheet" not found');
    return;
  }

  var startRow = 2; // Start reading IFSC codes from row 2
  var lastRow = sheet.getLastRow();
  var ifscCodesRange = sheet.getRange("K2:K" + lastRow); // Range from K2 to last row in Column K
  var ifscCodes = ifscCodesRange.getValues();

  for (var i = 0; i < ifscCodes.length; i++) {
    var ifscCode = ifscCodes[i][0]; // Get IFSC code from column K
    if (ifscCode && typeof ifscCode === "string") {
      ifscCode = ifscCode.trim(); // Trim whitespace if necessary
      var details = fetchBankDetails(ifscCode);
      sheet.getRange(startRow + i, 11).setValue(ifscCode); // Column K (11th column) for IFSC Code
      sheet.getRange(startRow + i, 12).setValue(details[0]); // Column L (12th column) for Bank Name
      sheet.getRange(startRow + i, 13).setValue(details[1]); // Column M (13th column) for Branch Name
    } else {
      Logger.log(
        "IFSC Code is empty or not a valid string at row " + (startRow + i)
      );
      sheet.getRange(startRow + i, 12).setValue("Invalid IFSC");
      sheet.getRange(startRow + i, 13).setValue("Invalid IFSC");
    }
  }
}

function fetchAndStoreHubs() {
  var sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("owner_data_sheet"); // Change to your sheet name if different
  const hello =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MTkwODM3ODMsImV4cCI6MTcyMTY3NTc4MywiaXNzIjoiaHV0ZWNoc29sdXRpb25zLmNvbSIsInN1YiI6ImVtYWlsPWRocnV2YUB0cnVja2xpbmsuY29tcm9sZT1BZG1pbiIsInJvbGUiOiJBZG1pbiIsImVtYWlsIjoiZGhydXZhQHRydWNrbGluay5jb20ifQ.qcilDBqB0ckANsF37YfdezFWCS6nZCMchMO9f8-kadQ";
  const headersOb = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${hello}`,
    },
  };
  var url = "https://trucklinkuatnew.thestorywallcafe.com/prod/v1/get-hubs";

  // Fetch the data from the API
  var response = UrlFetchApp.fetch(url, headersOb);
  var data = JSON.parse(response.getContentText());

  if (data.message === "successfully fetched hub data") {
    var hubs = data.hubs;
    var hubNames = [];
    var hubIds = [];

    // Prepare the data for insertion
    for (var i = 0; i < hubs.length; i++) {
      hubNames.push([hubs[i].location]);
      hubIds.push([hubs[i]._id]);
    }

    var hiddenSheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName("hidden_hubs");
    if (!hiddenSheet) {
      hiddenSheet =
        SpreadsheetApp.getActiveSpreadsheet().insertSheet("hidden_hubs");
    }
    hiddenSheet.clear();
    hiddenSheet.getRange(1, 1, hubNames.length, 1).setValues(hubNames); // Column A
    hiddenSheet.getRange(1, 2, hubIds.length, 1).setValues(hubIds); // Column B

    // Set up dropdowns and auto-fill hub IDs
    setupDropdowns(hiddenSheet);
  }
}
