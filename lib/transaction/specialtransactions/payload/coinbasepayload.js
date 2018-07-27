var constants = require('../constants');
var Preconditions = require('../../../util/preconditions');
var BufferWriter = require('../../../encoding/bufferwriter');
var BufferReader = require('../../../encoding/bufferreader');
var AbstractPayload = require('./abstractpayload');
var utils = require('../../../util/js');

var isUnsignedInteger = utils.isUnsignedInteger;
var isHexString = utils.isHexaString;

var CURRENT_PAYLOAD_VERSION = 1;
var HASH_SIZE = constants.SHA256_HASH_SIZE;
var SIGNATURE_SIZE = constants.COMPACT_SIGNATURE_SIZE;

/**
 * @typedef {Object} CoinbasePayloadJSON
 * @property {Number} nVersion
 * @property {string} regTxId
 * @property {string} hashPrevSubTx
 * @property {Number} creditFee
 * @property {string} hashSTPacket
 * @property {string} [vchSig]
 */

/**
 * @class CoinbasePayload
 * @property {number} nVersion
 * @property {string} regTxId
 * @property {string} hashPrevSubTx
 * @property {number} creditFee
 * @property {string} hashSTPacket
 * @property {string} [vchSig]
 */
function CoinbasePayload() {
  this.nVersion = CURRENT_PAYLOAD_VERSION;
}

CoinbasePayload.prototype = Object.create(AbstractPayload.prototype);
CoinbasePayload.prototype.constructor = AbstractPayload;

/* Static methods */

/**
 * Serialize transition payload
 * @param {TransitionPayloadJSON} transitionPayload
 * @return {Buffer} serialized payload
 */
CoinbasePayload.serializeJSONToBuffer = function (transitionPayload) {
  var payloadBufferWriter = new BufferWriter();

  // TODO: credit fee size
  payloadBufferWriter
    .writeUInt16LE(transitionPayload.nVersion)
    .write(Buffer.from(transitionPayload.regTxId, 'hex'))
    .write(Buffer.from(transitionPayload.hashPrevSubTx, 'hex'))
    .writeUInt32LE(transitionPayload.creditFee)
    .write(Buffer.from(transitionPayload.hashSTPacket, 'hex'));

  if (transitionPayload.vchSig) {
    payloadBufferWriter.write(Buffer.from(transitionPayload.vchSig, 'hex'));
  }

  return payloadBufferWriter.toBuffer();
};

/**
 * Parse raw transition payload
 * @param {Buffer} rawPayload
 * @return {CoinbasePayload}
 */
CoinbasePayload.fromBuffer = function (rawPayload) {
  var payloadBufferReader = new BufferReader(rawPayload);
  var payload = new CoinbasePayload();
  payload.nVersion = payloadBufferReader.readUInt16LE();
  payload.setRegTxId(payloadBufferReader.read(HASH_SIZE).toString('hex'))
    .setHashPrevSubTx(payloadBufferReader.read(HASH_SIZE).toString('hex'))
    .setCreditFee(payloadBufferReader.readUInt32LE())
    .setHashSTPacket(payloadBufferReader.read(HASH_SIZE).toString('hex'));

  if (!payloadBufferReader.finished()) {
    payload.vchSig = payloadBufferReader.read(constants.COMPACT_SIGNATURE_SIZE).toString('hex');
  }

  CoinbasePayload.validatePayloadJSON(payload.toJSON());
  return payload;
};

/**
 * Create new instance of payload from JSON
 * @param {string|TransitionPayloadJSON} payloadJson
 * @return {CoinbasePayload}
 */
CoinbasePayload.fromJSON = function fromJSON(payloadJson) {
  CoinbasePayload.validatePayloadJSON(payloadJson);
  var payload = new CoinbasePayload();
  payload.nVersion = payloadJson.nVersion;
  payload
    .setHashSTPacket(payloadJson.hashSTPacket)
    .setCreditFee(payloadJson.creditFee)
    .setRegTxId(payloadJson.regTxId)
    .setHashPrevSubTx(payloadJson.hashPrevSubTx);
  if (Boolean(payload.vchSig)) {
    payload.vchSig = payloadJson.vchSig;
  }
  return payload;
};

/**
 * Validate payload
 * @param {TransitionPayloadJSON} blockchainUserPayload
 * @return {boolean}
 */
CoinbasePayload.validatePayloadJSON = function (blockchainUserPayload) {
  if (!blockchainUserPayload) {
    throw new Error('No Payload specified');
  }

  Preconditions.checkArgumentType(blockchainUserPayload.nVersion, 'number', 'nVersion');
  Preconditions.checkArgumentType(blockchainUserPayload.creditFee, 'number', 'creditFee');

  Preconditions.checkArgument(isUnsignedInteger(blockchainUserPayload.nVersion), 'Expect nVersion to be an unsigned integer');
  Preconditions.checkArgument(isUnsignedInteger(blockchainUserPayload.creditFee), 'Expect creditFee to be an unsigned integer');

  Preconditions.checkArgument(isHexString(blockchainUserPayload.regTxId), 'expect regTxId to be a hex string but got ' + typeof blockchainUserPayload.regTxId);
  Preconditions.checkArgument(blockchainUserPayload.regTxId.length === constants.SHA256_HASH_SIZE * 2, 'Invalid regTxId size');

  Preconditions.checkArgument(isHexString(blockchainUserPayload.hashPrevSubTx), 'expect hashPrevSubTx to be a hex string but got ' + typeof blockchainUserPayload.hashPrevSubTx);
  Preconditions.checkArgument(blockchainUserPayload.hashPrevSubTx.length === constants.SHA256_HASH_SIZE * 2, 'Invalid hashPrevSubTx size');

  Preconditions.checkArgument(isHexString(blockchainUserPayload.hashSTPacket), 'expect hashSTPacket to be a hex string but got ' + typeof blockchainUserPayload.hashSTPacket);
  Preconditions.checkArgument(blockchainUserPayload.hashSTPacket.length === constants.SHA256_HASH_SIZE * 2, 'Invalid hashSTPacket size');


  if (blockchainUserPayload.vchSig) {
    Preconditions.checkArgument(isHexString(blockchainUserPayload.vchSig), 'expect vchSig to be a hex string but got ' + typeof blockchainUserPayload.vchSig);
    Preconditions.checkArgument(blockchainUserPayload.vchSig.length === constants.COMPACT_SIGNATURE_SIZE * 2, 'Invalid vchSig size');
  }
};

/* Instance methods */

/**
 * Validates payload data
 * @return {boolean}
 */
CoinbasePayload.prototype.validate = function() {
  return CoinbasePayload.validatePayloadJSON(this.toJSON());
};

/**
 * @param {string} regTxId - Hex string
 */
CoinbasePayload.prototype.setRegTxId = function(regTxId) {
  this.regTxId = regTxId;
  return this;
};

/**
 * @param {string} hashPrevSubTx - Hex string
 * @return {CoinbasePayload}
 */
CoinbasePayload.prototype.setHashPrevSubTx = function(hashPrevSubTx) {
  this.hashPrevSubTx = hashPrevSubTx;
  return this;
};

/**
 * @param {string} hashSTPacket - Hex string
 * @return {CoinbasePayload}
 */
CoinbasePayload.prototype.setHashSTPacket = function(hashSTPacket) {
  this.hashSTPacket = hashSTPacket;
  return this;
};

/**
 * @param {number} creditFee
 * @return {CoinbasePayload}
 */
CoinbasePayload.prototype.setCreditFee = function(creditFee) {
  this.creditFee = creditFee;
  return this;
};

/**
 * Serializes payload to JSON
 * @param [options]
 * @param {boolean} options.skipSignature - skip signature part. Needed for creating new signature
 * @return {TransitionPayloadJSON}
 */
CoinbasePayload.prototype.toJSON = function toJSON(options) {
  var includeSignature = !options || (options && !options.skipSignature);
  var payloadJSON = {
    nVersion: this.nVersion,
    regTxId: this.regTxId,
    hashPrevSubTx: this.hashPrevSubTx,
    creditFee: this.creditFee,
    hashSTPacket: this.hashSTPacket
  };
  if (includeSignature && Boolean(this.vchSig)) {
    payloadJSON.vchSig = this.vchSig;
  }
  CoinbasePayload.validatePayloadJSON(payloadJSON);
  return payloadJSON;
};

/**
 * Serialize payload to buffer
 * @param [options]
 * @param {boolean} options.skipSignature - skip signature part. Needed for creating new signature
 * @return {Buffer}
 */
CoinbasePayload.prototype.toBuffer = function toBuffer(options) {
  return CoinbasePayload.serializeJSONToBuffer(this.toJSON(options));
};

/**
 * Copy payload instance
 * @return {CoinbasePayload}
 */
CoinbasePayload.prototype.copy = function copy() {
  return CoinbasePayload.fromJSON(this.toJSON());
};

module.exports = CoinbasePayload;