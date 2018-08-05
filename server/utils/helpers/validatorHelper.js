import Validator from 'validatorjs';

const signupRules = (userInput) => {
  // Validator rules
  const rules = {
    username: 'required',
    email: 'required|email',
    password: ['required',
      'regex:^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\\W).\\S*$',
      'min:8', 'max:20'],
  };
  // Setting up customized descriptive messages
  const validation = new Validator(userInput, rules, {
    'required.username': 'Please enter a username in the specified field',
    'required.email': 'Please enter an email in the specified field',
    'email.email': 'Please enter a valid email',
    'required.password': 'Please enter a password in the specified field',
    'regex.password': 'Your password must include an uppercase'
    + ' and lowercase alphabet, a number and a special character',
    'min.password': 'Password entered should have minimum of 8 characters',
    'max.password': 'Password entered should have maximum of 20 characters',
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
    'required.email': 'Please enter an email in the specified field',
    'email.email': 'Please enter a valid email',
  });
  if (validation.fails()) {
    return validation.errors.all();
  }
  return false;
};

const resetPassowrdRules = (userInput) => {
  // Validator rules
  const rules = {
    password: ['required',
      'regex:^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\\W).\\S*$',
      'min:8', 'max:20'],
  };
  // Setting up customized descriptive messages
  const validation = new Validator(userInput, rules, {
    'required.password': 'Please enter a password in the specified field',
    'regex.password': 'Your password must include an uppercase'
    + ' and lowercase alphabet, a number and a special character',
    'min.password': 'Password entered should have minimum of 8 characters',
    'max.password': 'Password entered should have maximum of 20 characters',
  });
  if (validation.fails()) {
    return validation.errors.all();
  }
  return false;
};

export default {
  signupRules,
  forgotPasswordRules,
  resetPassowrdRules,
};
