import moment from "moment";

const extractDateRange = (line) => {
  const dateRange = line.find((s) => s.indexOf(" - ") !== -1);
  let [startDate, endDate] = dateRange.split(" - ");
  startDate = moment(startDate, "DD.MM.YY");
  endDate = moment(endDate, "DD.MM.YY");
  const dateLine = [startDate];
  while (
    dateLine[dateLine.length - 1] &&
    dateLine[dateLine.length - 1].isBefore(endDate)
  ) {
    dateLine.push(dateLine[dateLine.length - 1].clone().add(1, "days"));
  }

  return dateLine;
};

const groupEventsByDay = (line, dateLine) => {
  const eventLine = [];
  let dayIndex = 0;
  line.forEach((item, i) => {
    if (i === 0) return;

    if (item === "frei" || item === "abwesend") {
      if (
        eventLine[dayIndex] !== undefined &&
        Object.keys(eventLine[dayIndex]).length > 0
      ) {
        dayIndex++;
      }
      eventLine[dayIndex] = {};
      dayIndex++;
    } else {
      const timeRange = item.substr(
        item.indexOf(" ") !== -1 ? item.indexOf(" ") : 0
      );
      let [startTime, endTime] = timeRange.split("-");
      const teamString =
        item.indexOf(" ") !== -1 ? ` ${item.split(" ")[0]}` : "";
      const eventKeys = eventLine[dayIndex]
        ? Object.keys(eventLine[dayIndex])
        : [];
      let startMoment = dateLine[dayIndex].clone();
      startMoment.set("hour", startTime.split(":")[0]);
      startMoment.set("minute", startTime.split(":")[1]);
      let endMoment = dateLine[dayIndex].clone();
      endMoment.set("hour", endTime.split(":")[0]);
      endMoment.set("minute", endTime.split(":")[1]);
      const eventName = `Decathlon${teamString} ${startMoment.format("HH:mm")}`;

      if (
        eventLine[dayIndex] === undefined ||
        eventLine[dayIndex].length === 0
      ) {
        eventLine[dayIndex] = {};
        eventLine[dayIndex][eventName] = [startMoment, endMoment];
      } else {
        const previousEvent =
          eventLine[dayIndex][eventKeys[eventKeys.length - 1]];
        if (!previousEvent[1].isSame(startMoment)) {
          dayIndex++;
          startMoment = dateLine[dayIndex].clone();
          startMoment.set("hour", startTime.split(":")[0]);
          startMoment.set("minute", startTime.split(":")[1]);
          endMoment = dateLine[dayIndex].clone();
          endMoment.set("hour", endTime.split(":")[0]);
          endMoment.set("minute", endTime.split(":")[1]);
          eventLine[dayIndex] = {};
        }
        eventLine[dayIndex][eventName] = [startMoment, endMoment];
      }
    }
  });
  return eventLine;
};

const extractCalendar = (dataArray) => {
  const dateLine = extractDateRange(dataArray[0]);

  const eventArray = {};
  dataArray.forEach((data, i) => {
    if (i === 0) return;
    eventArray[data[0]] = groupEventsByDay(data, dateLine);
  });

  return { dateLine, eventArray };
};

export { extractCalendar };
