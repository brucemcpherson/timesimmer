# timesimmer

A sim time simulation that supports
- adjustable rate and tickrate
- events
- cycling within a fixed period
- resetting of rates within a period

Timesimmer will create a continuous timer that runs at any rate x real time. Because it keeps a separate clock going, you can change the rate while it's running without affecting elapsed time that has gone before. An example use case might be
- your app runs a simulation at 60 * real time - so 1 hour passes in 1 minute
- it also provides a slider to adjust the rate
- the timer needs to remember how long has passed at every rate, so it's not just a matter of multiplying the elapsed time ny the new rate.



More details on qottle can be found at https://ramblings.mcpher.com/gassnippets2/timesimmer/

## Installation

````
yarn add timesimmer
````

## Usage

````
const TimeSimmer = require('timesimmer');

````
You can use the default options or add options on the constructor such as 
````
const s = new TimeSimmer({
    // speed up time so 1 second = 10 minutes
    rate: 60 * 10,
    // tick every second
    tickRate: 1000,
    // when the timer should start from
    startedAt: new Date(2001, 0,1).getTime(),
    // restart time every hour
    cycle: 60 * 60 * 1000
})
````

## Cycling

Normally time is counted from the startedAt option (or now by default). For some use cases, it's possible that the time cycles within a given period (for example a weekly schedule), so you can use the cycle option to say at what point to reset the time back to the startedAt value
    this._rate = rate;
    this._time = startedAt;
    this._events = {
      tick: [],
      cycle: []
    };
    this._ticking = false;
    this._ticker = 0;
    this._interval = null;
    this._tickRate = tickRate;
    this._startedAt = startedAt;
    this._cycle = cycle;
    this._kickoff = startedAt;
    if (autoStart) this.start();

## Options
Most options can be applied when the timer is initialized, or set while the timer is running
| option | default | purpose |
| ---- | ---- | ---- |
| rate | 60  | Factor for how much to speed up time by - so 60 makes a minute pass in a second |
| tickRate | 1000 | How often to update the simulated time. This also controls how often the tick event is fired |
| startedAt | new Date().getTime() | The time to start the timer from |
| immediate | true | whether to start the timer immediately on instanciation |
| cycle | 0 | if non-zero, the timer will be restarted to startedAt on the tick event that detects these number of ms have passed |


## Events

Events are checked for triggering at every tick event. Adding events like this adds to existing events - so multiple listeners can be activated by a single event. 
````
  s.on("tick", (simPack) => {
    console.log(`tick number ${simPack.ticker} was triggered at sim time ${simPack.date.toString()}`)
  });
````
or 
````
  s.on("cycle", (simPack) => {
    console.log(`recycled to sim time ${simPack.date.toString()}`)
  });
````
To clear all registered events for a given eventName use .off, eg..
````
  s.off("cycle")
````

| eventName | triggered on |
| ---- |  ---- |
| tick | every tickRate ms |
| cycle | there's been a reset of the timer back to start. A tick event will also be fired on a recycle, but its ticker value will be 0 |


### Simpack

A simPack is retured as an event payload

| property | content |
| ---- |  ---- |
| time | the current sim time in ms |
| rate | the current rate |
| ticker | how many times there's been a tick event. This is reset on a cycle event and will be 0|
| startedAt | when the current cycle started in real time |
| cycle | the current cycle option value |
| kickoff | the original startedAt time. It will be equal to startedAt if cycle is 0 |
| tickRate | how often the time is updated in ms |
| eventName | the event |


## properties
A simPack (described earlier) is a collection of properties returned in a single object. Each can also be set (except date & ticker ) or get individually, for example
````
  s.rate = 20
  console.log(s.date)
````

## methods


| property | content | returns |
| ---- |  ---- | ---- |
| stop () | stop the timer| self |
| start() | start the timer| self |
| on(eventName: string, listener: function) | add a listener to be executed when a given eventName triggers| self |
| off(eventName: string) | remove all listeners for the given eventName | self |


## Examples 

See the test.js for many examples 


### Simple time speed up

This example makes an hour pass in a second, and you can use the ticker event to update a simulated clock every 500ms, where the start date is now

set up the timer
````
  const s = new TimeSimmer({
    rate: 60 * 60,
    tickRate: 500
  });
````
add a tick event
````
  s.on("tick", simPack => {
    updateYourUiClock(simPack.date)
  })
````


### recycler

This example could be used to re-use a hourly schedule. A minute will pass in a second, and it will reset every hour, and tick every 2 seconds

set up the timer
````
  const s = new TimeSimmer({
    rate: 60,
    tickRate: 2000,
    cycle: 1000 * 60 * 60,
    startedAt: new Date(2001, 11, 17, 8, 0, 0).getTime()
  });
````
add tick events
````
  s.on("tick", simPack => {
    // will fire every 2 secs, and 2 minutes will have passed
    reuseYourSchedule(simPack.date)
  })
  s.on("cycle", ({date})=> {
    console.log(`the timer restarted back to ${date.toString()})
  })
````

