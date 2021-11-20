import events from "events";

export class GameEvent {
	static eventEmitter = new events.EventEmitter();
}
