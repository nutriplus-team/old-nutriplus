export const dateFormatValidator = (value, hasNewLetter) => {
  const fullRegex = /^\d{0,3}$|^\d{0,2}\/\d{0,3}$|^\d{0,2}\/\d{0,2}\/\d{0,4}$/;
  const monthBeginRegex = /^\d{3}$/;
  const yearBeginRegex = /^\d{0,2}\/\d{3}$/;
  if (!fullRegex.test(value)) {
    return "rejected";
  }
  if (hasNewLetter) {
    if (monthBeginRegex.test(value) || yearBeginRegex.test(value)) {
      // First month digit or year digit was just filled
      return "insertSlash";
    }
  }
  // If I didn't return up until now, I should just set state to the input
  return "accepted";
};

export const dateValidator = value => {
  const fullRegex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!fullRegex.test(value)) {
    return "A data não está no formato DD-MM-YYYY!";
  }
  const day = +value.slice(0, 2);
  const month = +value.slice(3, 5);
  const year = +value.slice(6);
  if (day === 0 || month === 0 || month > 12) {
    return "Data inválida!";
  } else if (
    (month < 8 && month % 2 === 1) ||
    (month >= 8 && month % 2 === 0)
  ) {
    if (day > 31) {
      return "Data inválida!";
    }
  } else if (month === 2) {
    if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
      if (day > 29) {
        return "Data inválida!";
      }
    } else {
      if (day > 28) {
        return "Data inválida!";
      }
    }
  } else if (day > 30) {
    return "Data inválida!";
  }
  return "Accepted";
};

export const numberValidator = (
  value,
  integerDigitsLimit = 1,
  isFloatingNumber = false,
  precisionDigitsLimit = 1
) => {
  let regex;
  if (isFloatingNumber) {
    regex = new RegExp(
      `^\\.\\d{1,${precisionDigitsLimit}}$|^\\d{1,${integerDigitsLimit}}\\.\\d{0,${precisionDigitsLimit}}$|^\\d{0,${integerDigitsLimit}}$`
    );
  } else {
    regex = new RegExp(`^\\d{1,${integerDigitsLimit}}$`);
  }
  return regex.test(value);
};
