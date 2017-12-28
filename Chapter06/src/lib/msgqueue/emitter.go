package msgqueue

// EventEmitter describes an interface for a class that emits events
type EventEmitter interface {
	Emit(e Event) error
}
