module Datetime {
    export class Event implements IEvent {
        private _events:IEventStorage[] = [];

        trigger(eventName:string, ...params):IEvent {
            this._events
                .filter((e) => e.eventName == eventName)
                .forEach((e) => e.method.apply(e.thisArg, params));

            return this;
        }

        on(eventName:string, method:Function, thisArg?:any):IEvent {
            this._events.push({eventName, method, thisArg});

            return this;
        }
    }

    export interface IEvent {
        trigger(eventName:string, ...params):IEvent;
        on(eventName:string, method:Function, thisArg?:any):IEvent;
    }

    interface IEventStorage {
        eventName:string;
        method:Function;
        thisArg?:any;
    }

    interface IDateTimeEvent {
        __events:any;
        _on(eventName:string, cb:Function):void;
        _trigger(eventName:string, ...params:any[]):void;
    }
}