exports.smartTrim = (str, length, delim, appendix) => {
  if (str.length < length) {
    return str;
  }

  let trimmedString = str.substr(0, length + delim.length);
  const lastDelimIndex = trimmedString.lastIndexOf(delim);
  if (lastDelimIndex >= 0) {
    trimmedString = trimmedString.substr(0, lastDelimIndex);
  }
  if (trimmedString) {
    trimmedString += appendix;
  }

  return trimmedString;
};
