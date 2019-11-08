const utils = require('./utils');

const EventEmitter = require('events').EventEmitter;
const ufrReaderSDK = require('./ufrReaderSDK');
const reader = new ufrReaderSDK();


let fw_version = reader.GetDllVersionStr();
console.log('Dlogic Reader firmware version : ',fw_version);

//let ret = reader.ReaderOpen();

//let ret = reader.ReaderOpenEx("/dev/tty.usbserial-A631LPCL");
let ret = reader.ReaderOpen();

if(ret.is_ok==false){
    throw  ret.detail;
}


const reader_loop = new EventEmitter();
let card_uid = '';
reader_loop.removeAllListeners('next_loop');//remove all listener before


const ReaderStage = {
    SCAN_TAG: 0,
    PROCESS_TAG: 1,
}

let stage = ReaderStage.SCAN_TAG;
// let force_to_scan=false;
// let timeout_hdl;


reader_loop.on('next_loop', async (msg) => {
    try {
        switch (stage) {
            case ReaderStage.SCAN_TAG:
                ret = reader.GetCardIdEx();
                if (ret.code == reader.STATUS.UFR_OK) {
                    let ret_uid = utils.to_hex_string(ret.card_uid);
                    if ((card_uid == '') || (card_uid != ret_uid)) {
                        force_to_scan = false;
                        card_uid = ret_uid;//update new tag comming
                        stage = ReaderStage.PROCESS_TAG;
                    } else {
                       // card_uid = '';
                        stage = ReaderStage.SCAN_TAG;
                    }
                }
                break;

            case ReaderStage.PROCESS_TAG:
                ret = reader.LinearRead_PK(0, 16);
                console.log(card_uid + ' : ' + utils.to_hex_string(ret.rbuff));
                stage = ReaderStage.SCAN_TAG;
                break;
            default:
                card_uid = '';
                stage = ReaderStage.SCAN_TAG;
        }
        reader_loop.emit('next_loop');
    } catch (error) {
        //reset stage to start again
        card_uid = '';
        stage = ReaderStage.SCAN_TAG;
        reader_loop.emit('next_loop');
    }

})


reader_loop.emit('next_loop');

