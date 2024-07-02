
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('TAYIB-DISPATCH-DATA')
    .addItem('Fetch Hubs', 'fetchAndStoreHubs')
        .addItem('Fetch Material Types', 'fetchmaterialType')
        .addItem('Fetch LoadLocation', 'fetchLoadLocations')
        .addItem('Fetch deliveryLocation', 'fetchdeliveryLocations')
        .addItem('Fetch VehicleNumbers', 'fetchVehicleDetails')
        
    .addToUi();
}


// fetching hubs
function fetchAndStoreHubs() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('dispatch_challans');  // Change to your sheet name if different
  const hello="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MTk5MTc1NjMsImV4cCI6MTcyMjUwOTU2MywiaXNzIjoiaHV0ZWNoc29sdXRpb25zLmNvbSIsInN1YiI6ImVtYWlsPWRocnV2YUB0cnVja2xpbmsuY29tcm9sZT1BZG1pbiIsInJvbGUiOiJBZG1pbiIsImVtYWlsIjoiZGhydXZhQHRydWNrbGluay5jb20ifQ.Kyt9ZxG96ZwFBk9CawikbBr6SoZDHUCizQNr_BESaCQ"
  const headersOb = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${hello}`
        }
      }
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
    
    var hiddenSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('all_hubs');
    if (!hiddenSheet) {
      hiddenSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('all_hubs');
    }
    hiddenSheet.clear();
    hiddenSheet.getRange(1, 1, hubNames.length, 1).setValues(hubNames);  // Column A
    hiddenSheet.getRange(1, 2, hubIds.length, 1).setValues(hubIds);  // Column B
    
    // Set up dropdowns and auto-fill hub IDs
    setupDropdowns(hiddenSheet);
  }
}

// dropdown for hubName and hubId
function setupDropdowns(hiddenSheet) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('dispatch_challans');
  if (!sheet) {
    Logger.log('Sheet "dispatch_challans" not found');
    return;
  }

  var hubNamesRange = hiddenSheet.getRange('A1:A' + hiddenSheet.getLastRow());
  var hubNames = hubNamesRange.getValues().flat();

  var validationRange = sheet.getRange('C2:C' + sheet.getLastRow()); // Assuming the hubs dropdown is in column C
  var rule = SpreadsheetApp.newDataValidation().requireValueInList(hubNames).build();
  validationRange.setDataValidation(rule);

  var hubData = hiddenSheet.getRange('A1:B' + hiddenSheet.getLastRow()).getValues();

  // Iterate over each row in the dispatch_challans to find the hub name and set the corresponding hub ID
  var lastRow = sheet.getLastRow();
  for (var row = 2; row <= lastRow; row++) {
    var hubName = sheet.getRange(row, 3).getValue(); // Assuming the hubs dropdown is in column C (3th column)
    if (hubName) { // Check if there is a value in column O
      for (var i = 0; i < hubData.length; i++) {
        if (hubData[i][0] === hubName) {
          var hubId = hubData[i][1];
          sheet.getRange(row, 2).setValue(hubId); // Assuming the hub ID is to be filled in column B (2th column)
          break; // Exit the inner loop once the hub ID is found
        }
      }
    }
  }
}



// fetching materialType 
function fetchmaterialType() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('dispatch_challans');
  if (!sheet) {
    Logger.log('Sheet "dispatch_challans" not found');
    return;
  }
  var lastRow = sheet.getLastRow();
  
  const hello="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MTk5MTc1NjMsImV4cCI6MTcyMjUwOTU2MywiaXNzIjoiaHV0ZWNoc29sdXRpb25zLmNvbSIsInN1YiI6ImVtYWlsPWRocnV2YUB0cnVja2xpbmsuY29tcm9sZT1BZG1pbiIsInJvbGUiOiJBZG1pbiIsImVtYWlsIjoiZGhydXZhQHRydWNrbGluay5jb20ifQ.Kyt9ZxG96ZwFBk9CawikbBr6SoZDHUCizQNr_BESaCQ"
  const headersOb = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${hello}`
        }
      }
  
  // Loop through each row starting from row 2 (assuming row 1 is headers)
  for (var row = 2; row <= lastRow; row++) {
    var hubId = sheet.getRange(row, 2).getValue(); // Assuming hubId is in column B (2nd column)
    var hubName = sheet.getRange(row, 3).getValue(); // Assuming hubName is in column C (3rd column)
    
    var materialUrl = `https://trucklinkuatnew.thestorywallcafe.com/prod/v1/get-material/${hubId}`;
    
    // Fetch the data for material from the API
    var materialResponse = UrlFetchApp.fetch(materialUrl, headersOb);
    var materialData = JSON.parse(materialResponse.getContentText());
    
    if (materialData.message === "successfully fetched material data") {
      var materialTypes = materialData.materials;
      
      if (materialTypes.length > 0) {
        var materialTypeNames = materialTypes.map(material => [material.materialType]);
        
        var hiddenSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(`materialType_${hubName}`);
        if (!hiddenSheet) {
          hiddenSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(`materialType_${hubName}`);
          SpreadsheetApp.flush(); // Force all pending changes to be written
        }
        hiddenSheet.clear();
        hiddenSheet.getRange(1, 1, materialTypeNames.length, 1).setValues(materialTypeNames);  // Column A for location names
        
        // Set up dropdowns for delivery locations in column H of the same row
        setupmaterialTypeDropdowns(hiddenSheet, row);
      } else {
        Logger.log(`No delivery locations found for hub ID ${hubId}`);
      }
    } else {
      Logger.log(`Error fetching delivery locations: ${locationData.message}`);
    }
  }
}
// fetching materialType and showing dropdown
function setupmaterialTypeDropdowns(hiddenSheet, rowIndex) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('dispatch_challans');
  if (!sheet) {
    Logger.log('Sheet "dispatch_challans" not found');
    return;
  }

  var materialTypeNamesRange = hiddenSheet.getRange('A1:A' + hiddenSheet.getLastRow());
  var materialTypeNames = materialTypeNamesRange.getValues().flat().filter(Boolean); // Filter out empty values

  if (materialTypeNames.length === 0) {
    Logger.log('No materialType names found.');
    return;
  }

  var validationRange = sheet.getRange(rowIndex, 4); // Assuming the delivery locations dropdown is in column D, for the specific row
  var rule = SpreadsheetApp.newDataValidation().requireValueInList(materialTypeNames).build();
  validationRange.setDataValidation(rule);
}



// Fetching load locations and creating dropdowns
function fetchLoadLocations() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('dispatch_challans');  // Change to your sheet name if different
  var lastRow = sheet.getLastRow();
  const hello = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MTk5MTc1NjMsImV4cCI6MTcyMjUwOTU2MywiaXNzIjoiaHV0ZWNoc29sdXRpb25zLmNvbSIsInN1YiI6ImVtYWlsPWRocnV2YUB0cnVja2xpbmsuY29tcm9sZT1BZG1pbiIsInJvbGUiOiJBZG1pbiIsImVtYWlsIjoiZGhydXZhQHRydWNrbGluay5jb20ifQ.Kyt9ZxG96ZwFBk9CawikbBr6SoZDHUCizQNr_BESaCQ";
  const headersOb = {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${hello}`
    }
  };
  
  for (var row = 2; row <= lastRow; row++) {
    var hubId = sheet.getRange(row, 2).getValue();
    var hubName = sheet.getRange(row, 3).getValue();
    
    var locationUrl = `https://trucklinkuatnew.thestorywallcafe.com/prod/v1/get-load-location/${hubId}`;
    
    var locationResponse = UrlFetchApp.fetch(locationUrl, headersOb);
    var locationData = JSON.parse(locationResponse.getContentText());
    
    if (locationData.message === "successfully fetched location data") {
      var locations = locationData.materials;
      
      var locationNames = [];
      for (var j = 0; j < locations.length; j++) {
        locationNames.push([locations[j].location]);
      }
      
      var hiddenSheetName = `load_locations_${hubName}`;
      var hiddenSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(hiddenSheetName);
      if (!hiddenSheet) {
        hiddenSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(hiddenSheetName);
        SpreadsheetApp.flush();
      }
      hiddenSheet.clear();
      hiddenSheet.getRange(1, 1, locationNames.length, 1).setValues(locationNames);
      
      setupLocationDropdowns(hiddenSheet, row);
    }
  }
}

function setupLocationDropdowns(hiddenSheet, rowIndex) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('dispatch_challans');
  if (!sheet) {
    Logger.log('Sheet "dispatch_challans" not found');
    return;
  }

  var locationNamesRange = hiddenSheet.getRange('A1:A' + hiddenSheet.getLastRow());
  var locationNames = locationNamesRange.getValues().flat();

  var validationRange = sheet.getRange(rowIndex, 7); // Assuming the load locations dropdown is in column G, for the specific row
  var rule = SpreadsheetApp.newDataValidation().requireValueInList(locationNames).build();
  validationRange.setDataValidation(rule);
}

// Fetching delivery locations and creating dropdowns
function fetchdeliveryLocations() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('dispatch_challans');  // Change to your sheet name if different
  var lastRow = sheet.getLastRow();
  const hello = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MTk5MTc1NjMsImV4cCI6MTcyMjUwOTU2MywiaXNzIjoiaHV0ZWNoc29sdXRpb25zLmNvbSIsInN1YiI6ImVtYWlsPWRocnV2YUB0cnVja2xpbmsuY29tcm9sZT1BZG1pbiIsInJvbGUiOiJBZG1pbiIsImVtYWlsIjoiZGhydXZhQHRydWNrbGluay5jb20ifQ.Kyt9ZxG96ZwFBk9CawikbBr6SoZDHUCizQNr_BESaCQ";
  const headersOb = {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${hello}`
    }
  };
  
  for (var row = 2; row <= lastRow; row++) {
    var hubId = sheet.getRange(row, 2).getValue();
    var hubName = sheet.getRange(row, 3).getValue();
    
    var locationUrl = `https://trucklinkuatnew.thestorywallcafe.com/prod/v1/get-delivery-location/${hubId}`;
    
    var locationResponse = UrlFetchApp.fetch(locationUrl, headersOb);
    var locationData = JSON.parse(locationResponse.getContentText());
    
    if (locationData.message === "successfully fetched location data") {
      var locations = locationData.materials;
      
      var locationNames = [];
      for (var j = 0; j < locations.length; j++) {
        locationNames.push([locations[j].location]);
      }
      
      var hiddenSheetName = `delivery_locations_${hubName}`;
      var hiddenSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(hiddenSheetName);
      if (!hiddenSheet) {
        hiddenSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(hiddenSheetName);
        SpreadsheetApp.flush();
      }
      hiddenSheet.clear();
      hiddenSheet.getRange(1, 1, locationNames.length, 1).setValues(locationNames);
      
      setupDeliveryLocationDropdowns(hiddenSheet, row);
    }
  }
}

function setupDeliveryLocationDropdowns(hiddenSheet, rowIndex) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('dispatch_challans');
  if (!sheet) {
    Logger.log('Sheet "dispatch_challans" not found');
    return;
  }

  var locationNamesRange = hiddenSheet.getRange('A1:A' + hiddenSheet.getLastRow());
  var locationNames = locationNamesRange.getValues().flat();

  var validationRange = sheet.getRange(rowIndex, 8); // Assuming the load locations dropdown is in column H, for the specific row
  var rule = SpreadsheetApp.newDataValidation().requireValueInList(locationNames).build();
  validationRange.setDataValidation(rule);
}


// // fetching vehicle details
// function fetchVehicleDetails() {
//   var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('dispatch_challans');  // Change to your sheet name if different
//   if (!sheet) {
//     Logger.log('Sheet "dispatch_challans" not found');
//     return;
//   }
  
//    const hello="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MTkwODM3ODMsImV4cCI6MTcyMTY3NTc4MywiaXNzIjoiaHV0ZWNoc29sdXRpb25zLmNvbSIsInN1YiI6ImVtYWlsPWRocnV2YUB0cnVja2xpbmsuY29tcm9sZT1BZG1pbiIsInJvbGUiOiJBZG1pbiIsImVtYWlsIjoiZGhydXZhQHRydWNrbGluay5jb20ifQ.qcilDBqB0ckANsF37YfdezFWCS6nZCMchMO9f8-kadQ"
//   const headersOb = {
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${hello}`
//         }
//       }
  
//   var lastRow = sheet.getLastRow();

//   for (var row = 2; row <= lastRow; row++) {
//     var hubId = sheet.getRange(row, 2).getValue(); // Assuming hubId is in column B (2nd column)
//      var hubName = sheet.getRange(row, 3).getValue(); // Assuming hubName is in column C (3rd column)
   
//     if (hubId) { // Proceed only if hubId is not empty
//       var url = `https://trucklinkuatnew.thestorywallcafe.com/prod/v1/get-vehicle-details?page=1&limit=1000&hubId=${hubId}`;
      
//       // Fetch the data from the API
//       var response = UrlFetchApp.fetch(url, headersOb);
//       var data = JSON.parse(response.getContentText());
      
//       if (data.message === "Successfully retrived users informations") {
//         var trucks = data.truck[0].data;
//         var vehicleNames = [];
//         var vehicleIds = [];
//         var truckTypes=[]
        
//         // Prepare the data for insertion
//         for (var i = 0; i < trucks.length; i++) {
//           vehicleNames.push([trucks[i].registrationNumber]);
//           vehicleIds.push([trucks[i]._id]);
//           truckTypes.push([trucks[i].truckTypes]);
//         }
        
//         var hiddenSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(`all_vehicles_${hubName}`);
//         if (!hiddenSheet) {
//           hiddenSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(`all_vehicles_${hubName}`);
//         }
//         hiddenSheet.clear();
//         hiddenSheet.getRange(1, 1, vehicleNames.length, 1).setValues(vehicleNames);  // Column A
//         hiddenSheet.getRange(1, 2, vehicleIds.length, 1).setValues(vehicleIds);  // Column B
//         hiddenSheet.getRange(1, 3, truckTypes.length, 1).setValues(truckTypes);  // Column C
        
//         // Set up dropdowns and auto-fill vehicle IDs
//         setupVehicleDropdowns(hiddenSheet, row);
//       } else {
//         Logger.log(`Error fetching vehicle details for hubId ${hubId}: ${data.message}`);
//       }
//     } else {
//       Logger.log(`No hubId found in row ${row}`);
//     }
//   }
// }

// // setting up dropdown for vehicle names and vehicle IDs
// function setupVehicleDropdowns(hiddenSheet, rowIndex) {
//   var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('dispatch_challans');
//   if (!sheet) {
//     Logger.log('Sheet "dispatch_challans" not found');
//     return;
//   }

//   var vehicleNamesRange = hiddenSheet.getRange('A1:A' + hiddenSheet.getLastRow());
//   var vehicleNames = vehicleNamesRange.getValues().flat();

//   var validationRange = sheet.getRange(rowIndex, 9); // Assuming the vehicle dropdown is in column I (9th column)
//   var rule = SpreadsheetApp.newDataValidation().requireValueInList(vehicleNames).build();
//   validationRange.setDataValidation(rule);

//   var vehicleData = hiddenSheet.getRange('A1:B' + hiddenSheet.getLastRow()).getValues();

//   var vehicleName = sheet.getRange(rowIndex, 9).getValue(); // Assuming the vehicle dropdown is in column I (9th column)
//   if (vehicleName) { // Check if there is a value in column E
//     for (var i = 0; i < vehicleData.length; i++) {
//       if (vehicleData[i][0] === vehicleName) {
//         var vehicleId = vehicleData[i][1];
//         sheet.getRange(rowIndex, 10).setValue(vehicleId); // Assuming the vehicle ID is to be filled in column J (10th column)
//         break; // Exit the inner loop once the vehicle ID is found
//       }
//     }
//   }
// }

// Function to fetch vehicle details and setup dropdowns
function fetchVehicleDetails() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('dispatch_challans');  // Change to your sheet name if different
  if (!sheet) {
    Logger.log('Sheet "dispatch_challans" not found');
    return;
  }
  
  const hello = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MTkwODM3ODMsImV4cCI6MTcyMTY3NTc4MywiaXNzIjoiaHV0ZWNoc29sdXRpb25zLmNvbSIsInN1YiI6ImVtYWlsPWRocnV2YUB0cnVja2xpbmsuY29tcm9sZT1BZG1pbiIsInJvbGUiOiJBZG1pbiIsImVtYWlsIjoiZGhydXZhQHRydWNrbGluay5jb20ifQ.qcilDBqB0ckANsF37YfdezFWCS6nZCMchMO9f8-kadQ";
  const headersOb = {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${hello}`
    }
  };
  
  var lastRow = sheet.getLastRow();

  for (var row = 2; row <= lastRow; row++) {
    var hubId = sheet.getRange(row, 2).getValue(); // Assuming hubId is in column B (2nd column)
    var hubName = sheet.getRange(row, 3).getValue(); // Assuming hubName is in column C (3rd column)
   
    if (hubId) { // Proceed only if hubId is not empty
      var url = `https://trucklinkuatnew.thestorywallcafe.com/prod/v1/get-vehicle-details?page=1&limit=1000&hubId=${hubId}`;
      
      // Fetch the data from the API
      var response = UrlFetchApp.fetch(url, headersOb);
      var data = JSON.parse(response.getContentText());
      
      if (data.message === "Successfully retrived users informations") {
        var trucks = data.truck[0].data;
        var vehicleNames = [];
        var vehicleIds = [];
        var truckTypes = [];
        var vehicleBanks = [];
        var ownerIds = [];
        var ownerNames = [];
        var ownerPhones = [];
// ownerName	ownerPhone	ownerId
        
        // Prepare the data for insertion
        for (var i = 0; i < trucks.length; i++) {
          var truck = trucks[i];
          vehicleNames.push([truck.registrationNumber]);
          vehicleIds.push([truck._id]);
          truckTypes.push([truck.truckType]); // Adding truckType to the array
          vehicleBanks.push([truck.accountId[0]._id]); // Adding vehicleBank to the array
          ownerIds.push([truck.ownerId[0]._id]); // Adding ownerIds to the array
          ownerNames.push([truck.ownerId[0].name]); // Adding ownerNames to the array
          ownerPhones.push([truck.ownerId[0].phoneNumber]); // Adding ownerPhones to the array
        }
        
        var hiddenSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(`all_vehicles_${hubName}`);
        if (!hiddenSheet) {
          hiddenSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(`all_vehicles_${hubName}`);
        }
        hiddenSheet.clear();
        hiddenSheet.getRange(1, 1, vehicleNames.length, 1).setValues(vehicleNames);  // Column A for vehicle names
        hiddenSheet.getRange(1, 2, vehicleIds.length, 1).setValues(vehicleIds);  // Column B for vehicle IDs
        hiddenSheet.getRange(1, 3, vehicleBanks.length, 1).setValues(vehicleBanks);  // Column C for vehicleBanks
        hiddenSheet.getRange(1, 4, truckTypes.length, 1).setValues(truckTypes);  // Column D for truck types   
        hiddenSheet.getRange(1, 5, ownerIds.length, 1).setValues(ownerIds);  // Column E for ownerIds
        hiddenSheet.getRange(1, 6, ownerNames.length, 1).setValues(ownerNames);  // Column F for ownerNames     
        hiddenSheet.getRange(1, 7, ownerPhones.length, 1).setValues(ownerPhones);  // Column G for ownerPhones
        
        // Set up dropdowns and auto-fill vehicle IDs and truck types
        setupVehicleDropdowns(hiddenSheet, row);
        
      } else {
        Logger.log(`Error fetching vehicle details for hubId ${hubId}: ${data.message}`);
      }
    } else {
      Logger.log(`No hubId found in row ${row}`);
    }
  }
}

// Function to set up dropdowns for vehicle names, IDs, and truck types
function setupVehicleDropdowns(hiddenSheet, rowIndex) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('dispatch_challans');
  if (!sheet) {
    Logger.log('Sheet "dispatch_challans" not found');
    return;
  }

  var vehicleNamesRange = hiddenSheet.getRange('A1:A' + hiddenSheet.getLastRow());
  var vehicleNames = vehicleNamesRange.getValues().flat();

  var validationRange = sheet.getRange(rowIndex, 9); // Assuming the vehicle name dropdown is in column I (9th column)
  var rule = SpreadsheetApp.newDataValidation().requireValueInList(vehicleNames).build();
  validationRange.setDataValidation(rule);

  var vehicleData = hiddenSheet.getRange('A1:Z' + hiddenSheet.getLastRow()).getValues(); // Adjust range for vehicle data

  var vehicleName = sheet.getRange(rowIndex, 9).getValue(); // Assuming the vehicle dropdown is in column I (9th column)
  if (vehicleName) {
    for (var i = 0; i < vehicleData.length; i++) {
      if (vehicleData[i][0] === vehicleName) {
        sheet.getRange(rowIndex, 10).setValue(vehicleData[i][1]); // Assuming vehicle ID is in column J (10th column)
        sheet.getRange(rowIndex, 11).setValue(vehicleData[i][2]); // Assuming vehicleBanks is in column K (11th column)
        sheet.getRange(rowIndex, 12).setValue(vehicleData[i][3]); // Assuming truckType is in column L (12th column)

        sheet.getRange(rowIndex, 13).setValue(vehicleData[i][4]); // Assuming ownerId is in column M (13th column)
        sheet.getRange(rowIndex, 14).setValue(vehicleData[i][5]); // Assuming ownerName is in column N (14th column)
        sheet.getRange(rowIndex, 15).setValue(vehicleData[i][6]); // Assuming ownerPhone is in column M (15th column)
        break;
      }
    }
  }
}




