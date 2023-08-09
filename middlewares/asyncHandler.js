const asyncHandler = (handler) => async (req, res) => {
	try {
		await handler(req, res);
	} catch (error) {
		res.status(500).json({ error: `Something went wrong` });
		console.error(error);
	}
};

export default asyncHandler;
