const ufrReaderSDK = require('./ufrReaderSDK');
const reader = new ufrReaderSDK();
const utils = require('./utils');
let fw_version = reader.GetDllVersionStr();
console.log(fw_version);
let ret =  reader.ReaderOpen();
console.log(ret);

ret =  reader.LinearRead_PK(0,16);
// ret = reader.LinearWrite_PK("1234567890abcdefijklm",0);
// console.log(utils.to_hex_string(ret.wbuff));
console.log(ret);