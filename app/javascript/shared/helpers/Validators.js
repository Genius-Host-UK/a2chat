export const isPhoneE164 = value => !!value.match(/^\+[1-9]\d{1,14}$/);

export const isPhoneNumberValid = (value, dialCode) => {
  const number = value.replace(dialCode, '');
  const regex = /^[0-9]{1,14}(\s*-\s*[a-zA-Z0-9\sà-ỹÀ-Ý]+)?$/;

  return !!number.match(regex);
};

export const isPhoneE164OrEmpty = value => isPhoneE164(value) || value === '';

export const isPhoneNumberValidWithDialCode = value => {
  let number = value.replace(/^\+/, ''); // Remove the '+' sign
  const isPhoneVietnam = number.startsWith('84');
  if (isPhoneVietnam) {
    number = number.replace(/^84/, '');
    number = number.replace(/^0+/, '');
    return !!number.match(/^[1-9]\d{8,9}$/);
  }

  return !!number.match(/^[1-9]\d{4,}$/); // Validate the phone number with minimum 5 digits
};

export const startsWithPlus = value => value.startsWith('+');

export const shouldBeUrl = (value = '') =>
  value ? value.startsWith('http') : true;

export const isValidPassword = value => {
  const containsUppercase = /[A-Z]/.test(value);
  const containsLowercase = /[a-z]/.test(value);
  const containsNumber = /[0-9]/.test(value);
  const containsSpecialCharacter = /[!@#$%^&*()_+\-=[\]{}|'"/\\.,`<>:;?~]/.test(
    value
  );
  return (
    containsUppercase &&
    containsLowercase &&
    containsNumber &&
    containsSpecialCharacter
  );
};

export const isNumber = value => /^\d+$/.test(value);

export const isDomain = value => {
  if (value !== '') {
    const domainRegex = /^([\p{L}0-9]+(-[\p{L}0-9]+)*\.)+[a-z]{2,}$/gmu;
    return domainRegex.test(value);
  }
  return true;
};
