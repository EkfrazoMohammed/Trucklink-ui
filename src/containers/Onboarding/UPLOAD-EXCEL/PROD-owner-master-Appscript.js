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
  if (col === 4 && row > 1) {
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

      // Apply the district list as a dropdown to the appropriate cell
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
  ui.createMenu("TRUCKLINK-Fetch Bank Details")
    .addItem("Fetch Bank Details", "fetchDetailsForAll")
    .addItem("Fetch Hubs", "fetchAndStoreHubs")
    .addItem("Validation start", "setValidation")
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
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MTk1NDg1MDAsImV4cCI6MTcyMjE0MDUwMCwiaXNzIjoiaHV0ZWNoc29sdXRpb25zLmNvbSIsInN1YiI6ImVtYWlsPWRocnV2YUB0cnVja2xpbmsuY29tcm9sZT1BZG1pbiIsInJvbGUiOiJBZG1pbiIsImVtYWlsIjoiZGhydXZhQHRydWNrbGluay5jb20ifQ.NIoKToOdcoQTZ_5iclGSVgA8YWLmQiKguyBG8nsD6Kk";
  const headersOb = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${hello}`,
    },
  };
  var url = "https://trucklink.in/prod/v1/get-hubs";

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

function setupDropdowns(hiddenSheet) {
  var sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("owner_data_sheet");
  if (!sheet) {
    Logger.log('Sheet "owner_data_sheet" not found');
    return;
  }

  var hubNamesRange = hiddenSheet.getRange("A1:A" + hiddenSheet.getLastRow());
  var hubNames = hubNamesRange.getValues().flat();

  var validationRange = sheet.getRange("O2:O" + sheet.getLastRow()); // Assuming the hubs dropdown is in column O
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(hubNames)
    .build();
  validationRange.setDataValidation(rule);

  var hubData = hiddenSheet
    .getRange("A1:B" + hiddenSheet.getLastRow())
    .getValues();

  // Iterate over each row in the owner_data_sheet to find the hub name and set the corresponding hub ID
  var lastRow = sheet.getLastRow();
  for (var row = 2; row <= lastRow; row++) {
    var hubName = sheet.getRange(row, 15).getValue(); // Assuming the hubs dropdown is in column O (15th column)
    if (hubName) {
      // Check if there is a value in column O
      for (var i = 0; i < hubData.length; i++) {
        if (hubData[i][0] === hubName) {
          var hubId = hubData[i][1];
          sheet.getRange(row, 14).setValue(hubId); // Assuming the hub ID is to be filled in column N (14th column)
          break; // Exit the inner loop once the hub ID is found
        }
      }
    }
  }
}
function setValidation() {
  var sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("owner_data_sheet");
  if (!sheet) {
    Logger.log('Sheet "owner_data_sheet" not found');
    return;
  }

  var lastRow = sheet.getLastRow();

  // PAN Card validation (10 alphanumeric characters)
  var panNumberRange = sheet.getRange("F2:F" + lastRow); // Range for PAN card numbers in column F

  // Find the actual range with data in column F
  var panValues = panNumberRange.getValues();
  var panDataRange = sheet.getRange(2, 6, panValues.length, 1); // Starting from F2, row 2 and column 6 (F)

  // Create the data validation rule using a custom formula for PAN card
  var pancardRule = SpreadsheetApp.newDataValidation()
    .requireFormulaSatisfied("=AND(LEN(F2)=10)")
    .setAllowInvalid(false)
    .setHelpText("PAN card number must be exactly 10 alphanumeric characters.")
    .build();

  panDataRange.setDataValidation(pancardRule);

  // Phone number validation (10 digits)
  var phoneNumberRange = sheet.getRange("G2:G" + lastRow); // Range for phone numbers in column G

  // Find the actual range with data in column G
  var phoneValues = phoneNumberRange.getValues();
  var phoneDataRange = sheet.getRange(2, 7, phoneValues.length, 1); // Starting from G2, row 2 and column 7 (G)

  // Create the data validation rule using a custom formula for phone numbers
  var phoneNumberRule = SpreadsheetApp.newDataValidation()
    .requireFormulaSatisfied("=AND(LEN(G2)=10, ISNUMBER(G2))")
    .setAllowInvalid(false)
    .setHelpText("Phone number must be exactly 10 digits.")
    .build();

  phoneDataRange.setDataValidation(phoneNumberRule);
}
