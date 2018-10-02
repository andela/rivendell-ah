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
  title: {
    required: 'Please specify a title for your Article',
    string: 'Title must be a String',
  },
  description: {
    required: 'Please specify a description for your Article',
    string: 'Description must be a String',
  },
  body: {
    required: 'Please specify a body for your Article',
    string: 'Body must be a String',
  },
  commentBody: {
    required: 'Comment body is required',
    string: 'Comment body must be a string',
  },
  subcategory: {
    string: 'Subcategory must be a string',
  },
  reportType: {
    required: 'A report must contain a type',
    string: 'Must be a string',
    min: 'Report type must have a length of at least 5 characters',
    max: 'Report type must not be more than 30 characters',
  },
  reportDescription: {
    required: 'A report must contain a description',
    string: 'Must be a string',
    min: 'Report description must have a length of at least 10 characters',
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

const loginRules = (userInput) => {
  // Validator rules
  const rules = {
    email: 'required',
    password: 'required',
  };
  // Setting up customized descriptive messages
  const validation = new Validator(userInput, rules, {
    'required.email': validationErrors.email.required,
    'required.password': validationErrors.password.required,
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

const createArticleRules = (userInput) => {
  // Validator rules
  const rules = {
    title: 'required|string',
    description: 'required|string',
    body: 'required|string',
    subcategory: 'string',
  };
  // Setting up customized descriptive messages
  const validation = new Validator(userInput, rules, {
    'required.title': validationErrors.title.required,
    'string.title': validationErrors.title.string,
    'required.description': validationErrors.description.required,
    'string.description': validationErrors.description.string,
    'required.body': validationErrors.body.required,
    'string.body': validationErrors.body.string,
    'string.subcategory': validationErrors.subcategory.string,
  });
  if (validation.fails()) {
    return validation.errors.all();
  }
  return false;
};
const updateArticleRules = (userInput) => {
  // Validator rules
  const rules = {
    title: 'string',
    description: 'string',
    body: 'string',
    subcategory: 'string',
  };
  // Setting up customized descriptive messages
  const validation = new Validator(userInput, rules, {
    'string.title': validationErrors.title.string,
    'string.description': validationErrors.description.string,
    'string.body': validationErrors.body.string,
    'string.subcategory': validationErrors.subcategory.string,
  });
  if (validation.fails()) {
    return validation.errors.all();
  }
  return false;
};


const createReportArticleRules = (report) => {
  // Validator rules
  const rules = {
    description: ['required', 'min:10'],
    type: ['required', 'min:10', 'max:30'],
  };
  // Setting up customized descriptive messages
  const validation = new Validator(report, rules, {
    'string.description': validationErrors.reportDescription,
    'string.type': validationErrors.reportType,
  });
  if (validation.fails()) {
    return validation.errors.all();
  }
  return false;
};

const createCommentRules = (commentInput) => {
  // Validator rules
  const rules = {
    commentBody: 'required|string',
  };
  // Setting up customized descriptive messages
  const validation = new Validator(commentInput, rules, {
    'required.commentBody': validationErrors.commentBody.required,
    'string.commentBody': validationErrors.commentBody.string,
  });
  if (validation.fails()) {
    return validation.errors.all();
  }
  return false;
};

const updateCommentRules = (commentInput) => {
  // Validator rules
  const rules = {
    commentBody: 'string',
  };
  // Setting up customized descriptive messages
  const validation = new Validator(commentInput, rules, {
    'string.commentBody': validationErrors.commentBody.string,
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
  createArticleRules,
  updateArticleRules,
  createCommentRules,
  updateCommentRules,
  createReportArticleRules,
  loginRules,
};
