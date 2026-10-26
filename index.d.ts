import { Duplex, DuplexEvents } from 'bare-stream'

/** The frame type marker identifying a control-channel frame. */
declare const CONTROL: number
/** The frame type marker identifying a user-data-channel frame. */
declare const USER: number
/** The default number of milliseconds a terminating worker gets to stop and exit. */
declare const DEFAULT_GRACE: number

/**
 * The events emitted by a `Protocol`, in addition to the standard duplex stream events. An `error`
 * control frame destroys the `Protocol` with the carried error, surfacing it as a regular `error`
 * event, and any other control frame emits an event named after its type with the decoded payload.
 */
interface ProtocolEvents extends DuplexEvents {
  /** Emitted when the host configures the worker, carrying the `grace` it gets to stop and exit. */
  configure: [payload: { grace: number }]
  /** Emitted when the worker signals it is ready. */
  ready: []
  /** Emitted when a `terminate` control frame is received. */
  terminate: []
  /** Emitted when the worker signals exit, carrying its exit `code`. */
  exit: [code: number]
}

/**
 * A duplex stream carrying user data over an underlying byte stream, with control frames riding
 * alongside it on the same handle. RPC libraries, such as `bare-rpc`, bind to it just like a raw
 * stream.
 */
interface Protocol<E extends ProtocolEvents = ProtocolEvents> extends Duplex<E> {
  /**
   * Send a control frame of `type` with an optional JSON-serializable `payload`.
   * @param type - The control frame type, for example `'ready'`, `'exit'`, `'error'`, or
   * `'terminate'`.
   * @param payload - An optional JSON-serializable payload carried with the frame.
   * @returns A promise that resolves once the underlying stream has drained.
   */
  send(type: string, payload?: object): Promise<void>
}

declare class Protocol {
  /**
   * Attach a `Protocol` to the given underlying duplex byte `stream`.
   * @param stream - The underlying duplex byte stream to multiplex the control and user-data
   * channels over.
   */
  constructor(stream: Duplex)
}

/**
 * Attach a `Protocol` to `stream`, an underlying duplex byte stream.
 * @param stream - Any duplex byte stream to attach the protocol to.
 * @returns A `Protocol` multiplexing control and user-data frames over `stream`.
 */
declare function attach(stream: Duplex): Protocol

export { type Protocol, ProtocolEvents, attach, CONTROL, USER, DEFAULT_GRACE }
