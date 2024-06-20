export const validateSchema = (schema) => async (req, res, next) => {
    try {
        await schema.parseAsync(req.body);
        next();
    } catch (error) {
        const errors = {};

        error.errors.forEach((err) => {
            const fieldName = err.path.join('.');
            errors[fieldName] = err.message;
        });

        return res.status(400).json(errors);
    }
};
