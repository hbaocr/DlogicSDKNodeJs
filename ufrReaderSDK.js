/*
int8        Signed 8-bit Integer
uint8       Unsigned 8-bit Integer
int16       Signed 16-bit Integer
uint16      Unsigned 16-bit Integer
int32       Signed 32-bit Integer
uint32      Unsigned 32-bit Integer
int64       Signed 64-bit Integer
uint64      Unsigned 64-bit Integer
float       Single Precision Floating Point Number (float)
double      Double Precision Floating Point Number (double)
pointer     Pointer Type
string      Null-Terminated String (char *)
*/
const status = require('./constant').STATUS;
const ntag_auth_mode = require('./constant').T2T_AUTHENTICATION;
const ntag_default_key = require('./constant').DEFAULT_KEY;

const utils = require('./utils');
const ffi = require('ffi');
const ref = require('ref');
const ArrayType = require('ref-array');

const int = ref.types.int;
const int32 = ref.types.int32;
const uint32 = ref.types.uint32;
const int_ptr = ref.refType(ref.types.int);//pointer
const int32_ptr = ref.refType(ref.types.int32);//pointer
const uint32_ptr = ref.refType(ref.types.uint32);

const int16 = ref.types.int16;
const uint16 = ref.types.uint16;
const int16_ptr = ref.refType(ref.types.int16);
const uint16_ptr = ref.refType(ref.types.uint16);

const char = ref.types.char;
const char_ptr = ref.refType(ref.types.char);
const char_array = ArrayType(char);
const string = ref.types.CString;

const void_t = ref.types.void;//// we don't know what the layout of void_t or we can use it with user defined struct
const void_ptr = ref.refType(ref.types.void);

class uFCoder {
    constructor() {

        this.STATUS=status;
        this.T2T_AUTHENTICATION=ntag_auth_mode;
        this.DEFAULT_KEY = ntag_default_key;

        const platform = process.platform;
        let mathlibLoc = null;

        if (platform === 'win32') {
            mathlibLoc = './ufr-lib-master/windows/x86_64/uFCoder-x86_64.dll';
        } else if (platform === 'linux') {
            mathlibLoc = './ufr-lib-master/linux/x86_64/libuFCoder-x86_64.so';
        } else if (platform === 'darwin') {
            mathlibLoc = './ufr-lib-master/macos/x86_64/libuFCoder-x86_64.dylib'
        } else {
            throw new Error('unsupported platform for libuFCoder')
        }
        

        this.uFRCoder = ffi.Library(mathlibLoc, {
            'GetDllVersionStr': [string, []],
            'ReaderOpen': [int, []],
            'ReaderOpenEx': [int, [uint32, string, uint32, string]],
            'ReaderClose': [int, []],
            'GetCardIdEx': [int, [char_ptr, char_ptr, char_ptr]],
            'GetDlogicCardType': [int, [char_ptr]],
            'BlockRead_PK': [int, [char_ptr, char, char, char_ptr]],
            'BlockWrite_PK': [int, [char_ptr, char, char, char_ptr]],
            'LinearRead_PK': [int, [char_ptr, uint16, uint16, uint16_ptr, char, char_ptr]],
            'LinearWrite_PK': [int, [char_ptr, uint16, uint16, uint16_ptr, char, char_ptr]],
        });
    }
    GetDescriptionFromCode(err_code){
        for(var key in status) {
            if (err_code == status[key]){
                return key;
            }
        }
        return 'UNKNOWN_CODE';
    }
    GetDllVersionStr() {
        let fc = this.uFRCoder.GetDllVersionStr();
        return fc;
    }
    // auto scan and open the reader
    ReaderOpen() {
        let ret = {
            is_ok: false,
            code: -1
        }
        let res = this.uFRCoder.ReaderOpen();
        ret.code = res;
        ret.detail = this.GetDescriptionFromCode(res)+'( 0x' + res.toString(16)+' ) : ';
        if (res == status.UFR_OK) {
            ret.is_ok = true;
            ret.detail =ret.detail +'Open OK'
        } else {
            ret.detail= ret.detail+'Open Failed'
            console.log('Err : ', '0x' + res.toString(16));
            ret.is_ok = false;
        }
        return ret;
    }


    //var fc = uFRCoder.ReaderOpenEx(1,'COM2',1,'READER_ACTIVE_ON_RTS_LOW');
    /**
 * ReaderOpenEx() is a function for opening port with
 *
 * @param reader_type : 0 : auto > same as call ReaderOpen()
 *                      1 : uFR type (1 Mbps)
 *                      2 : uFR RS232 type (115200 bps)
 *                      3 : BASE HD uFR (XRC) type (250 Kbps)
 * @param port_name : serial port name, identifier, like
 *                      "COM3" on Window or
 *                      "/dev/ttyS0" on Linux or
 *                      "/dev/tty.serial1" on OS X
 *                      or if you select FTDI
 *                      "UN123456" if Reader have integrated FTDI interface
 *                      "192.168.1.162:8881" IP adress:port for TCP/IP or UDP I/F
 * @param port_interface : type of communication interfaces
 *                      0 : auto - first try FTDI than serial if no port_name defined
 *                      1 : try serial / virtual COM port / interfaces
 *                      2 : try only FTDI communication interfaces
 *                      // Digital Logic Shields
 *                      10 : open Digital Logic Shields with RS232 uFReader on Raspberry Pi (serial interfaces with GPIO reset)
 *                      84 ('T') : TCP/IP interface 
 *                      85 ('U') : UDP interface
 * @param arg : additional settings in c-string format:
 *                      "UNIT_OPEN_RESET_DISABLE" : do not reset the reader when opening
 *                      "UNIT_OPEN_RESET_FORCE"   : force reset the reader when opening
 *                      "READER_ACTIVE_ON_RTS_LOW"  : (default) Reset the reader when RTS is high - the reader works when RTS is low
 *                      "READER_ACTIVE_ON_RTS_HIGH" : Reset the reader when RTS is low - the reader works when RTS is high
 *                      "RTS_ALWAYS_HIGH"           : not implemented yet
 *                      "RTS_ALWAYS_LOW"            : not implemented yet
 *                      "RTS_DISCONNECTED"          : disconnect RTS (RTS is not initiate nor use)
 *
 * @return
 */
    ReaderOpenEx(port_name = 'COM2', reader_type = 1, port_interface = 1, arg = 'READER_ACTIVE_ON_RTS_LOW') {
        let ret = {
            is_ok: false,
            code: -1
        }
        
        port_name = ref.allocCString(port_name);
        arg = ref.allocCString(arg);
        let res = this.uFRCoder.ReaderOpenEx(reader_type, port_name, port_interface, arg);
        ret.detail = this.GetDescriptionFromCode(res)+'( 0x' + res.toString(16)+' ) : ';
        if (res == status.UFR_OK) {
            ret.is_ok = true;
            ret.code = res;
         
        } else {
            console.log('Err : ', '0x' + res.toString(16));
            ret.is_ok = false;
            ret.code = res;
        }
        return ret;
    }
    ReaderClose() {
        let ret = {
            is_ok: false,
            code: -1,
        }

        let res = this.uFRCoder.ReaderClose();
        ret.detail = this.GetDescriptionFromCode(res)+'( 0x' + res.toString(16)+' ) : ';
        if (res == status.UFR_OK) {
            ret.is_ok = true;
            ret.code = res;
          
        } else {
            console.log('Err : ', '0x' + res.toString(16));
            ret.is_ok = false;
            ret.code = res;
        }
        return ret;
    }
    GetCardIdEx() {
        let ret = {
            is_ok: false,
            code: -1
        }
        let lpucSak = ref.alloc(char);//allocate memory for char
        let aucUid = new Buffer.alloc(12);//maX 12 byte for uuid
        let lpucUidSize = ref.alloc(char);
        let res = this.uFRCoder.GetCardIdEx(lpucSak, aucUid, lpucUidSize);
        ret.code = res;
        ret.detail = this.GetDescriptionFromCode(res)+'( 0x' + res.toString(16)+' ) : ';
        switch (res) {
            case status.UFR_OK:
                ret.is_ok = true;
                ret.detail = ret.detail + 'Detected card';
                ret.lpuc_sak = lpucSak[0];
                ret.card_uid = aucUid.slice(0, lpucUidSize[0]);
                ret.uid_size = lpucUidSize[0];
                break;
            case status.UFR_NO_CARD:
                ret.is_ok = true;
                ret.detail = ret.detail + 'No card';
                break;
            default:
                ret.is_ok = false;
                ret.detail = ret.detail + 'Error';
        }
        return ret;

    }
    GetDlogicCardType() {
        let ret = {
            is_ok: false,
            code: -1
        }
        let lpucCardType = ref.alloc(char);//allocate memory for char
        let res = this.uFRCoder.GetDlogicCardType(lpucCardType);
        ret.code = res;
          ret.detail = this.GetDescriptionFromCode(res)+'( 0x' + res.toString(16)+' ) : ';
        if (res == status.UFR_OK) {
            ret.is_ok = true;
            ret.detail = ret.detail + "OK";
            ret.card_type = lpucCardType[0];
            ret.card_name = utils.get_card_type_from_code(lpucCardType[0]);
        } else {
            ret.detail = ret.detail + "ERR";
        }
        return ret;
    }

    //for NTAG it will read 4 page_addr(16bytes) or  1 block addr  of mifare(16 bytes)
    BlockRead_PK(block_address = 0, auth_mode = ntag_auth_mode.T2T_WITHOUT_PWD_AUTH, key = ntag_default_key) {
        let ret = {
            is_ok: false,
            code: -1
        }
        let data = new Buffer.alloc(32, 0);//maximum read 32 byte
        // let page_addr = ref.alloc(char);//alloc 1 byte buffer for char
        // let auth_mode = ref.alloc(char);//alloc 1 byte buffer for char


        let res = this.uFRCoder.BlockRead_PK(data, block_address, auth_mode, key);
        ret.code = res;
          ret.detail = this.GetDescriptionFromCode(res)+'( 0x' + res.toString(16)+' ) : ';
        switch (res) {
            case status.UFR_OK:
                ret.is_ok = true;
                ret.detail = ret.detail + 'Read block';
                ret.info = data;
                break;
            case status.UFR_NO_CARD:
                ret.is_ok = false;
                ret.detail = ret.detail + 'No card';
                break;
            default:
                ret.is_ok = false;
                ret.detail = ret.detail + 'Error';
        }
        return ret;
    }
    //for NTAG it will write 1 page_addr(4 bytes) although the input is  wraped as  16 byte for compatible
    // with  1 block  mifare(16 bytes) of  Mifare  API
    BlockWrite_PK(data_buff, block_address = 4, auth_mode = ntag_auth_mode.T2T_WITHOUT_PWD_AUTH, key = ntag_default_key) {
        let ret = {
            is_ok: false,
            code: -1
        }
        data_buff = Buffer.from(data_buff);//make sure that is buffer
        if (data_buff.length > 16) {
            ret.detail = 'Invalid buffer length';
            return ret;
        }
        if (block_address > 255) {
            ret.detail = 'Invalid block_address';
            return ret;
        }


        let write_buff = new Buffer.alloc(16, 0);//padding 16bytes 0
        data_buff.copy(write_buff, 0, 0, data_buff.length);// fill the input data

        // let page_addr = ref.alloc(char);//alloc 1 byte buffer for char
        // let auth_mode = ref.alloc(char);//alloc 1 byte buffer for char


        let res = this.uFRCoder.BlockWrite_PK(write_buff, block_address, auth_mode, key);
        ret.code = res;
          ret.detail = this.GetDescriptionFromCode(res)+'( 0x' + res.toString(16)+' ) : ';
        switch (res) {
            case status.UFR_OK:
                ret.is_ok = true;
                ret.detail = ret.detail + 'Write block ok';
                ret.info = write_buff;
                break;
            case status.UFR_NO_CARD:
                ret.is_ok = false;
                ret.detail = ret.detail + 'No card';
                break;
            default:
                ret.is_ok = false;
                ret.detail = ret.detail + 'Error';
        }
        return ret;
    }


    // Linear read byte by byte of all user space memory of tag
    // the linear_addr:0 is the first userspace memory (the  first byte of block 4 NTAG)
    LinearRead_PK(linear_addr, n_read_byte = 16, auth_mode = ntag_auth_mode.T2T_WITHOUT_PWD_AUTH, key = ntag_default_key) {
        let ret = {
            is_ok: false,
            code: -1
        }

        let buff = new Buffer.alloc(8 * 1024, 0);//allocate 8kbyte for data
        if (n_read_byte > buff.length) {
            ret.detail = 'Invalid read length';
            return ret;
        }


        let n_return_len = ref.alloc(int16);//alloc 2 byte buffer for returned data len
        // let auth_mode = ref.alloc(char);//alloc 1 byte buffer for char


        let res = this.uFRCoder.LinearRead_PK(buff, linear_addr, n_read_byte, n_return_len, auth_mode, key);
        ret.code = res;
          ret.detail = this.GetDescriptionFromCode(res)+'( 0x' + res.toString(16)+' ) : ';
        switch (res) {
            case status.UFR_OK:
                ret.is_ok = true;
                let n_read_ret = n_return_len[0] + n_return_len[1] * 256;
                ret.detail = ret.detail + `linear_read ok from byte ${linear_addr} to ${linear_addr + n_read_ret} in user memory space`;
                ret.rbuff_len = n_read_ret,
                    ret.rbuff = buff.slice(0, n_read_ret);
                break;
            case status.UFR_NO_CARD:
                ret.is_ok = false;
                ret.detail = ret.detail + 'No card';
                break;
            default:
                ret.is_ok = false;
                ret.detail = ret.detail + 'Error';
        }
        return ret;
    }

    // Linear write byte by byte of all user space memory of tag
    // the linear_addr:0 is the first userspace memory (the  first byte of block 4 NTAG)
    LinearWrite_PK(data_write, linear_addr = 0, auth_mode = ntag_auth_mode.T2T_WITHOUT_PWD_AUTH, key = ntag_default_key) {
        let ret = {
            is_ok: false,
            code: -1
        }

        data_write = new Buffer.from(data_write);//make sure this is buffer
        let n_write_byte = data_write.length;

        let n_return_len = ref.alloc(int16);//alloc 2 byte buffer for returned data len
        let res = this.uFRCoder.LinearWrite_PK(data_write, linear_addr, n_write_byte, n_return_len, auth_mode, key);
        ret.code = res;
          ret.detail = this.GetDescriptionFromCode(res)+'( 0x' + res.toString(16)+' ) : ';
        switch (res) {
            case status.UFR_OK:
                ret.is_ok = true;
                let n_write_ret = n_return_len[0] + n_return_len[1] * 256;
                ret.detail = ret.detail + `linear_write ok from byte ${linear_addr} to ${linear_addr + n_write_ret} in user memory space`;
                ret.wlen = n_write_ret,
                    ret.wbuff = data_write;
                break;
            case status.UFR_NO_CARD:
                ret.is_ok = false;
                ret.detail = ret.detail + 'No card';
                break;
            default:
                ret.is_ok = false;
                ret.detail = ret.detail + 'Error';
        }
        return ret;
    }
}


module.exports = uFCoder;