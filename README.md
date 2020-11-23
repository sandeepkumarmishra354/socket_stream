# Stream socket

> Now send streams with socket.io very easily.

Send streams or listen for streams, pipe through other streams.

## Installation

```sh
npm install stream_socket
```

## Usage example

```javascript
//client side

import { SocketStream } from "stream_socket";
import io from "socket.io-client";
import path from "path";
import fs from "fs";

const socket = io("ws://localhost:3000");

socket.on("connect", () => {
  let socket_stream = new SocketStream(socket);
  //register for event (receive file as stream)
  socket_stream.on("some-event-1", (stream, file_info) => {
    //save file
    let fileName = path.basename(file_info.name);
    stream.pipe(fs.createWriteStream(fileName));
    //you can also even send this stream as well
    socket_stream.emit('some-event-2',stream,file_info);
  });

  //emit event (send file as strean)
  socket_stream.emit("some-event-3", fs.createReadStream('my-file.jpg'), {name:'my-file.jpg'});
});
```

```javascript
//server side

import { SocketStream } from "stream_socket";
import io from "socket.io";
import path from "path";
import fs from "fs";

---------
---------
---------
---------

const sio = io(server);

const socket_stream = new SocketStream(sio);

socket.on("connect", (client) => {
  //register for event (receive file as stream)
  let client_stream = new SocketStream(client);
  client_stream.on("some-event-2", (stream, file_info) => {
    //save file
    let fileName = path.basename(file_info.name);
    strean.pipe(fs.createWriteStream(fileName));
  });

  //emit event (send file as strean)
  socket_stream.emit("some-event-1", fs.createReadStream('my-file.jpg'), {name:'my-file.jpg'});
});
```

## Meta

Sandeep mishra – dev.veerusandy@gmail.com

Distributed under the MIT license. See `LICENSE` for more information.

[github](https://github.com/sandeepkumarmishra354/socket_stream)
