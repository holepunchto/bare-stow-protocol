# bare-stow-protocol

Control and user data framing for `bare-stow` (<https://github.com/holepunchto/bare-stow>). The protocol multiplexes a control channel and a user data channel over any binary duplex stream, and is shared by the host side, `bare-stow-host` (<https://github.com/holepunchto/bare-stow-host>), and the bundle side, `bare-stow-runtime` (<https://github.com/holepunchto/bare-stow-runtime>).

```
npm i bare-stow-protocol
```

## Usage

```js
const protocol = require('bare-stow-protocol')

const ipc = protocol.attach(stream) // Any duplex byte stream

ipc.write(Buffer.from('payload')) // User data
ipc.send('ready') // Control frame

ipc.on('exit', (code) => {
  // The worker signaled exit.
})
```

The attached `ipc` is itself a duplex stream carrying the user data, with control frames riding alongside it on the same handle. RPC libraries (such as `bare-rpc`) bind to it just like a raw stream.

## Framing

Every frame is a 4-byte little-endian length followed by that many bytes: A 1-byte tag and the payload. The tag is `0x00` for a control frame and `0x01` for a user data frame. The payload of a user data frame is passed through as is, while that of a control frame is a UTF-8 JSON object carrying its `type` along with any further fields.

Control frames signal lifecycle events:

| Direction      | Type        | Payload              |
| :------------- | :---------- | :------------------- |
| Host -> Worker | `configure` | `{ grace }`          |
| Worker -> Host | `ready`     | -                    |
| Worker -> Host | `exit`      | `{ code }`           |
| Worker -> Host | `error`     | `{ message, stack }` |
| Host -> Worker | `terminate` | -                    |

An incoming `error` frame destroys the local `ipc` with the carried error, surfacing it as a normal stream `error` event. An `exit` frame emits `exit` with the carried `code`, and other control frames emit a regular event named after the type with the decoded payload.

## License

Apache-2.0
