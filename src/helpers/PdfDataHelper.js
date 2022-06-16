const isNextTeam = (i) => {
  return i && i.str && i.str.indexOf("_T") >= 0;
};

const isDate = (value) => {
  let dateFormat;
  if (toString.call(value) === "[object Date]") {
    return true;
  }
  if (typeof value.replace === "function") {
    value.replace(/^\s+|\s+$/gm, "");
  }
  // eslint-disable-next-line
  dateFormat = /(^\d{1,4}[\.|\\/|-]\d{1,2}[\.|\\/|-]\d{1,4})(\s*(?:0?[1-9]:[0-5]|1(?=[012])\d:[0-5])\d\s*[ap]m)?$/;
  return dateFormat.test(value);
};

const isNextLineTimes = (i) => {
  return (
    i[0] &&
    (i[0].indexOf("frei") >= 0 ||
      i[0].indexOf("abwesend") >= 0 ||
      i[0].indexOf("_T") >= 0 ||
      (i[0].indexOf(":") >= 0 && i[0].indexOf("-") >= 0))
  );
};

const isTimes = (i) => {
  // return false;
  return (
    i &&
    (i.indexOf("frei") >= 0 ||
      i.indexOf("abwesend") >= 0 ||
      (i.indexOf(":") >= 0 &&
        i.indexOf("-") >= 0 &&
        i.indexOf(" - ") === -1 &&
        /\d/.test(i)))
  );
};

const readPdfUrl = async (url, pdfjsLib) => {
  const doc = await pdfjsLib.getDocument(url).promise;
  const pagesContent = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    pagesContent.push(await page.getTextContent());
  }
  return pagesContent;
};

const combinePages = (pagesContent) => {
  return [].concat
    .apply(
      [],
      pagesContent.map((c) => c.items)
    )
    .filter((i) => i.str !== " ");
};

const extractDataPerLines = (items) => {
  let linesArray = [];
  let index = 0;
  items.forEach((item, i, items) => {
    if (items[i].hasEOL && (items[i].str === "" || isDate(items[i].str))) {
      if (isNextTeam(items[i + 1])) {
        return;
      }
      index++;
    } else {
      if (!linesArray[index] || linesArray[index].length === 0)
        linesArray[index] = [];
      linesArray[index].push(items[i].str);
    }
  });

  let linesArray2 = [];
  index = 0;

  linesArray.forEach((item, i, items) => {
    if (item.length === 1) {
      if (isNextLineTimes(items[i + 1])) {
        if (!linesArray2[index] || linesArray2[index].length === 0)
          linesArray2[index] = [];
        linesArray2[index] = linesArray2[index].concat(item);
      }
      return;
    }

    if (!linesArray2[index] || linesArray2[index].length === 0)
      linesArray2[index] = [];
    linesArray2[index] = linesArray2[index].concat(item);
    index++;
  });

  return linesArray2;
};

const filterNonTimeLinesAndCases = (linesArray) => {
  linesArray = linesArray.filter((l, i) => {
    if (i === 0) return true;
    return l.some((s) => isTimes(s));
  });

  linesArray.forEach((item, i) => {
    if (i === 0) return;
    linesArray[i] = item.filter((s, i2) => {
      if (i2 === 0) return true;
      return isTimes(s);
    });
  });
  return linesArray;
};

export {
  readPdfUrl,
  extractDataPerLines,
  combinePages,
  filterNonTimeLinesAndCases,
  isNextTeam,
  isDate,
  isNextLineTimes,
  isTimes,
};
