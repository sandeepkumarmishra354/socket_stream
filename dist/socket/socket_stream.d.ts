/// <reference types="node" />
import io from 'socket.io';
import fs from 'fs';
import stream from 'stream';
export interface FileInfo {
    name: string;
    extension?: string;
    bytes?: bigint;
    type?: string;
    createdAt?: string;
}
export interface CustomEvent {
    event: string;
    readStream: stream.Readable;
    status: 'idle' | 'busy';
    fileInfo?: FileInfo;
}
export interface FileData {
    chunk?: any;
    fileInfo?: FileInfo;
}
export declare class SocketStream {
    protected _socket: io.Socket | io.Server;
    protected readonly _EVENT_ABOUT_TO_RCV = "_EventAboutToReceive";
    protected readonly _EVENT_RCV_END = "_EventReceiveEnd";
    protected readonly _EVENT_RCV_FAIL = "_EventReceiveFail";
    protected _endCb: () => void;
    protected _failCb: () => void;
    protected readonly _customEvents: CustomEvent[];
    constructor(sio: io.Socket | io.Server);
    on(eventName: string, handler: (readStream: stream.Readable, data?: FileInfo) => void): SocketStream;
    emit(eventName: string, readStream: fs.ReadStream | stream.Readable, fileInfo: FileInfo): SocketStream;
    onReceiveEnd: (cb: () => void) => void;
    onReceiveFail: (cb: () => void) => void;
}
