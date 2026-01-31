var SHEET_NAME = "cotizar_eventos"; // Change if your sheet has a different name
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getSheetByName(SHEET_NAME);
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var nextRow = sheet.getLastRow() + 1;
    var newRow = headers.map(function(header) {
      if (header === "Date") return new Date();
      if (header === "estado") return "Pending"; // Auto-set status
      var val = e.parameter[header]; 
      if (!val && e.postData && e.postData.contents) {
        try {
          var jsonData = JSON.parse(e.postData.contents);
          val = jsonData[header];
        } catch (err) {}
      }
      return val;
    });
    sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);
    return ContentService
      .createTextOutput(JSON.stringify({ "result": "success", "row": nextRow }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ "result": "error", "error": e }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  finally {
    lock.releaseLock();
  }
}