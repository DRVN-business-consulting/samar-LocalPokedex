// caesarCipher.js
const SHIFT = 3; // Number of positions to shift

const shiftChar = (char, shift) => {
  const code = char.charCodeAt(0);
  let newCode;

  if (char >= 'a' && char <= 'z') {
    newCode = ((code - 97 + shift) % 26) + 97;
  } else if (char >= 'A' && char <= 'Z') {
    newCode = ((code - 65 + shift) % 26) + 65;
  } else {
    return char; 
  }

  return String.fromCharCode(newCode);
};

export const encryptPassword = (password) => {
  return password.split('').map(char => shiftChar(char, SHIFT)).join('');
};

export const decryptPassword = (encryptedPassword) => {
  return encryptedPassword.split('').map(char => shiftChar(char, -SHIFT)).join('');
};
