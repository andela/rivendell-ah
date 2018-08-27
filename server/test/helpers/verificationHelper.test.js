/* eslint-disable */
import chai from 'chai'
import verificationHelper from '../../utils/helpers/verificationHelper';

const { expect } = chai;

describe('Testing verification helper', () => {
  describe('Unit testing validateEmail function', () => {
    it('Should return status code 400 with an error message when no email is provided', (done) => {
      const validateEmailResponse = verificationHelper.validateEmail();
      expect(validateEmailResponse).to.have.property('status')
        .to.equal(false);
      expect(validateEmailResponse).to.have.property('statusCode')
        .to.equal(400);
      expect(validateEmailResponse).to.have.property('error')
        .to.equal('Email not provided');
      done();
    });
    it('Should return status code 400 with an error message when an invalid email is provided', (done) => {
      const validateEmailResponse = verificationHelper.validateEmail('invalid-email@mail');
      expect(validateEmailResponse).to.have.property('status')
        .to.equal(false);
      expect(validateEmailResponse).to.have.property('statusCode')
        .to.equal(400);
      expect(validateEmailResponse).to.have.property('error')
        .to.equal('Please provide a valid email');
      done();
    });
    it('Should return status of true, indicating that the email is valid', (done) => {
      const validateEmailResponse = verificationHelper.validateEmail('validEmail@gmail.com');
      expect(validateEmailResponse).to.have.property('status')
        .to.equal(true);
      done();
    });
  });
});
