exports.userSignupValidator = (req, res, next) => {
    req.check('name',  'Name is Required Idiot').notEmpty()
    req.check('email', 'Email Must Be between 3 to 32 Characters')
        .matches(/.+\@.+\..+/)
        .withMessage('Email must constain @')
        .isLength({
            min:4, 
            Max: 32
        });
        req.check('password', 'Password is required').notEmpty();
        req.check('password')
            .isLength({ min:6 })
            .withMessage ('Password must contain atleast 6 characters dumbass!')
            .matches(/\d/)
            .withMessage("Password must contain a number also");
            const errors = req.validationErrors()
            if(errors) {
                const firstError = errors.map(error => error.msg) [0];
                return res.status(400).json ({error: firstError});
            }
            next();
};