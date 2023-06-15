import * as bcrypt from 'bcrypt';

export const hashPwd = async (pwd: string) => {
  const salt = Number(process.env.HASH_SALT);
  return await bcrypt.hash(pwd, salt);
};
