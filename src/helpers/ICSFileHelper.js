import moment from "moment";
import { v4 as uuid } from "uuid";

const downloadFile = (str, fileName) => {
  const blobObject = new Blob([str], {
    type: "text/calendar",
  });
  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(blobObject, fileName);
  } else {
    const a = window.document.createElement("a");
    a.download = fileName;
    a.href = window.URL.createObjectURL(blobObject);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};

const generateICSFile = (events) => {
  // 20091130T213238Z
  const icsDateFormat = "YYYYMMDDTHHmmss";
  let fileStr =
    "BEGIN:VCALENDAR\r\n" +
    "VERSION:2.0\r\n" +
    "PRODID:-//Pdf2Cal v0.1//NONSGML iCal Writer//EN\r\n" +
    "CALSCALE:GREGORIAN\r\n" +
    "BEGIN:VTIMEZONE\r\n" +
    "TZID:Europe/Berlin\r\n" +
    "X-LIC-LOCATION:Europe/Berlin\r\n" +
    "BEGIN:DAYLIGHT\r\n" +
    "TZOFFSETFROM:+0100\r\n" +
    "TZOFFSETTO:+0200\r\n" +
    "TZNAME:CEST\r\n" +
    "DTSTART:19700329T020000\r\n" +
    "RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=3\r\n" +
    "END:DAYLIGHT\r\n" +
    "BEGIN:STANDARD\r\n" +
    "TZOFFSETFROM:+0200\r\n" +
    "TZOFFSETTO:+0100\r\n" +
    "TZNAME:CET\r\n" +
    "DTSTART:19701025T030000\r\n" +
    "RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=10\r\n" +
    "END:STANDARD\r\n" +
    "END:VTIMEZONE\r\n" +
    "METHOD:PUBLISH\r\n";

  let icsEvents = events.map((e) => {
    return Object.keys(e).map((k) => {
      return {
        description: k,
        start: e[k][0].format(icsDateFormat),
        end: e[k][1].format(icsDateFormat),
      };
    });
  });
  icsEvents = [].concat.apply([], icsEvents);
  const nowDate = moment().format(icsDateFormat) + "Z";
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  icsEvents.forEach((e) => {
    fileStr =
      fileStr +
      "BEGIN:VEVENT\r\n" +
      "DTSTART;TZID=" +
      tz +
      ":" +
      e.start +
      "\r\n" +
      "DTEND;TZID=" +
      tz +
      ":" +
      e.end +
      "\r\n" +
      "DTSTAMP:" +
      nowDate +
      "\r\n" +
      "UID:" +
      uuid() +
      "\r\n" +
      "CREATED:" +
      nowDate +
      "\r\n" +
      "DESCRIPTION:" +
      e.description +
      "\r\n" +
      "LAST-MODIFIED:" +
      nowDate +
      "\r\n" +
      "SEQUENCE:0\r\n" +
      "STATUS:CONFIRMED\r\n" +
      "SUMMARY:" +
      e.description +
      "\r\n" +
      "TRANSP:OPAQUE\r\n" +
      "END:VEVENT\r\n";
  });

  fileStr = fileStr + "END:VCALENDAR";
  return fileStr;
};

export { downloadFile, generateICSFile };
