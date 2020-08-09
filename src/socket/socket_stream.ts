import io from 'socket.io';
import fs from 'fs';
import stream from 'stream';

export interface FileInfo {
    name: string,
    extension?: string,
    bytes?: bigint,
    type?: string,
    createdAt?: string
}

export interface CustomEvent {
    event: string,
    readStream: stream.Readable,
    status: 'idle' | 'busy',
    fileInfo?: FileInfo
}

export interface FileData {
    chunk?:any,
    fileInfo?:FileInfo
}

export class SocketStream {

    protected _socket: io.Socket | io.Server;
    protected readonly _EVENT_ABOUT_TO_RCV = '_EventAboutToReceive';
    protected readonly _EVENT_RCV_END = '_EventReceiveEnd';
    protected readonly _EVENT_RCV_FAIL = '_EventReceiveFail';
    protected _endCb!: () => void;
    protected _failCb!: () => void;
    protected readonly _customEvents = new Array<CustomEvent>();

    constructor(sio: io.Socket | io.Server) {
        this._socket = sio;
    }

    public on(eventName: string, handler: (readStream: stream.Readable, data?: FileInfo) => void): SocketStream {
        let event: CustomEvent = {
            event: eventName,
            readStream: new stream.Readable(),
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
        this._socket.on(eventName, (fileData: FileData) => {
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

    public emit(eventName: string, readStream: fs.ReadStream | stream.Readable, fileInfo: FileInfo): SocketStream {
        const fileData: FileData = {
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

    public onReceiveEnd = (cb: () => void) => {
        this._endCb = cb;
    }

    public onReceiveFail = (cb: () => void) => {
        this._failCb = cb;
    }
}