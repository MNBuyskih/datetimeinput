module Datetime {
    export class EventGen implements IEventGen {
        private _events:IEventStorage[] = [];

        trigger(eventName:string, ...params):IEventGen {
            this._events
                .filter((e) => e.eventName == eventName)
                .forEach((e) => e.method.apply(e.thisArg, params));

            return this;
        }

        on(eventName:string, method:Function, thisArg?:any):IEventGen {
            this._events.push({eventName, method, thisArg});

            return this;
        }
    }

    interface IEventGen {
        trigger(eventName:string, ...params);
        on(eventName:string, method:Function, thisArg?:any);
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