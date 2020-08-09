"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketStream = void 0;
const stream_1 = __importDefault(require("stream"));
class SocketStream {
    constructor(sio) {
        this._EVENT_ABOUT_TO_RCV = '_EventAboutToReceive';
        this._EVENT_RCV_END = '_EventReceiveEnd';
        this._EVENT_RCV_FAIL = '_EventReceiveFail';
        this._customEvents = new Array();
        this.onReceiveEnd = (cb) => {
            this._endCb = cb;
        };
        this.onReceiveFail = (cb) => {
            this._failCb = cb;
        };
        this._socket = sio;
    }
    on(eventName, handler) {
        let event = {
            event: eventName,
            readStream: new stream_1.default.Readable(),
            status: 'idle'
        };
        //handles receiving fail (error)
        this._socket.on(`${eventName + this._EVENT_RCV_FAIL}`, () => {
            event.readStream.push(null);
            if (this._failCb !== undefined && this._failCb !== null)
                this._failCb();
        });
        //handles receiving end (success)
        this._socket.on(`${eventName + this._EVENT_RCV_END}`, () => {
            event.readStream.push(null);
            if (this._endCb !== undefined && this._endCb !== null)
                this._endCb();
        });
        //handles incomming file stream
        this._socket.on(eventName, (fileData) => {
            //check if first time
            if (event.status === 'idle') {
                event.status = 'busy';
                event.readStream._read = () => { };
                handler(event.readStream, fileData.fileInfo);
            }
            event.readStream.push(fileData.chunk);
        });
        this._customEvents.push(event);
        return this;
    }
    emit(eventName, readStream, fileInfo) {
        const fileData = {
            fileInfo
        };
        readStream.on('end', () => {
            this._socket.emit(`${eventName + this._EVENT_RCV_END}`);
        });
        readStream.on('error', () => {
            this._socket.emit(`${eventName + this._EVENT_RCV_FAIL}`);
        });
        readStream.on('data', (chunk) => {
            fileData.chunk = chunk;
            this._socket.emit(eventName, fileData);
        });
        return this;
    }
}
exports.SocketStream = SocketStream;
//# sourceMappingURL=socket_stream.js.map