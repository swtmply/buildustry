import bcrypt from 'bcryptjs';

const encryptPassword = async (password) => {
	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(password, salt);
	return hashedPassword;
};

export default encryptPassword;
