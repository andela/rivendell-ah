import Validator from 'validatorjs';

const validationErrors = {
  username: {
    required: 'Please enter a username in the specified field',
    min: 'username should have a minimum of 3 characters',
    max: 'username should have a maximum of 30 characters',
  },
  email: {
    required: 'Please enter an email in the specified field',
    isEmail: 'Please enter a valid email',
  },
  password: {
    required: 'Please enter a password in the specified field',
    regex: 'Your password must include an uppercase '
      + 'and lowercase alphabet, a number and a special character',
    min: 'Password entered should have minimum of 8 characters',
    max: 'Password entered should have maximum of 100 characters',
  },
  firstName: {
    required: 'Please enter your first name in the specified field',
    min: 'first name entered should have minimum of 2 characters',
    max: 'first name entered should have maximum of 50 characters',
  },
  lastName: {
    required: 'Please enter your last name in the specified field',
    min: 'last name entered should have minimum of 2 characters',
    max: 'last name entered should have maximum of 50 characters',
  },
};

const signupRules = (userInput) => {
  // Validator rules
  const rules = {
    username: ['required', 'min:3', 'max:30'],
    email: 'required|email',
    password: ['required',
      'regex:^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\\W).\\S*$',
      'min:8', 'max:100'],
    firstName: ['required', 'min:2', 'max:50'],
    lastName: ['required', 'min:2', 'max:50'],
  };
  // Setting up customized descriptive messages
  const validation = new Validator(userInput, rules, {
    'required.username': validationErrors.username.required,
    'required.email': validationErrors.email.required,
    'email.email': validationErrors.email.isEmail,
    'required.password': validationErrors.password.required,
    'regex.password': validationErrors.password.regex,
    'min.password': validationErrors.password.min,
    'max.password': validationErrors.password.max,
    'required.firstName': validationErrors.firstName.required,
    'required.lastName': validationErrors.lastName.required,
    'min.firstName': validationErrors.firstName.min,
    'max.firstName': validationErrors.firstName.max,
    'min.lastName': validationErrors.lastName.min,
    'max.lastName': validationErrors.lastName.max,
    'min.username': validationErrors.username.min,
    'max.username': validationErrors.username.max,
  });
  if (validation.fails()) {
    return validation.errors.all();
  }
  return false;
};

const forgotPasswordRules = (userInput) => {
  // Validator rules
  const rules = {
    email: 'required|email',
  };
  // Setting up customized descriptive messages
  const validation = new Validator(userInput, rules, {
    'required.email': validationErrors.email.required,
    'email.email': validationErrors.email.isEmail,
  });
  if (validation.fails()) {
    return validation.errors.all();
  }
  return false;
};

const resetPasswordRules = (userInput) => {
  // Validator rules
  const rules = {
    password: ['required',
      'regex:^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\\W).\\S*$',
      'min:8', 'max:20'],
  };
  // Setting up customized descriptive messages
  const validation = new Validator(userInput, rules, {
    'required.password': validationErrors.password.required,
    'regex.password': validationErrors.password.regex,
    'min.password': validationErrors.password.min,
    'max.password': validationErrors.password.max,
  });
  if (validation.fails()) {
    return validation.errors.all();
  }
  return false;
};
const updateUserRules = (userInput) => {
  // Validator rules
  const rules = {
    password: [
      'regex:^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\\W).\\S*$',
      'min:8',
      'max:100',
    ],
    firstName: ['min:2', 'max:50'],
    lastName: ['min:2', 'max:50'],
    username: ['min:3', 'max:30'],
  };
  // Setting up customized descriptive messages
  const validation = new Validator(userInput, rules, {
    'regex.password': validationErrors.password.regex,
    'min.password': validationErrors.password.min,
    'max.password': validationErrors.password.max,
    'min.firstName': validationErrors.firstName.min,
    'max.firstName': validationErrors.firstName.max,
    'min.lastName': validationErrors.lastName.min,
    'max.lastName': validationErrors.lastName.max,
    'min.username': validationErrors.username.min,
    'max.username': validationErrors.username.max,
  });
  if (validation.fails()) {
    return validation.errors.all();
  }
  return false;
};

export default {
  signupRules,
  forgotPasswordRules,
  resetPasswordRules,
  updateUserRules,
};
