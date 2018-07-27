var expect = require('chai').expect;

describe('CoinbasePayload', function () {

  describe('.fromBuffer', function () {
    it('Should return instance of CoinbasePayload and call #validate on it', function() {

    });
    it('Should throw in case if there is some unexpected information in raw payload', function() {

    });
  });

  describe('.fromJSON', function () {
    it('Should return instance of CoinbasePayload and call #validate on it', function() {

    });
  });

  describe('#validate', function () {
    it('Should allow only unsigned integer as nVersion', function () {

    });
    it('Should allow only unsigned integer as height', function () {
      
    });
    it('Should allow only sha256 hash as merkleRootMNList', function () {

    });
  });

  describe('#toJSON', function () {
    it('Should be able to serialize payload JSON', function () {

    });
    it('Should call #validate', function () {

    });
  });

  describe('#toBuffer', function () {
    it('Should be able to serialize payload to Buffer', function () {

    });
    it('Should call #validate', function () {

    });
  });

});