
import crypto from 'crypto';

const hashPassword = (password, salt) => crypto
  .pbkdf2Sync(password, salt, 10000, 512, 'sha512')
  .toString('hex');

export default hashPassword;
