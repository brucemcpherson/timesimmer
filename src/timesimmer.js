/**
 * because this is a simulation - things can run at a different rate than real time
 * this code is for both client side
 */
class TimeSimmer {
  /**
   * create a sim time manager
   * @param {Object} options - simtime options
   * @param {number} [options.rate=60] - how fast to speed up time (60= 1sec=1 min)
   * @param {number} [options.startedAt = now] - ts of when to start the simtime from
   * @param {number} [options.tickRate = 1000] - how often to update the simtime
   * @param {boolean} [options.immediate = true] - whether to autostart
   * @param {boolean} [options.cycle = 0] - how often to restart the clock
   */
  constructor({
    rate = 60,
    startedAt = new Date().getTime(),
    tickRate = 1000,
    immediate = true,
    cycle = 0
  } = {}) {
    // the istartAt is when the time should start at default is now
    // rate is the rate at which the sim runs so by default we run at 1sec = 1min with a rate of 60

    this._rate = rate;
    this._time = startedAt;
    this._events = {
      tick: [],
      cycle: [],
    };
    this._ticking = false;
    this._ticker = 0;
    this._interval = null;
    this._tickRate = tickRate;
    this._startedAt = startedAt;
    this._cycle = cycle;
    this._kickoff = startedAt;
    this._allTime = 0;
    if (immediate) this.start();
  }

  // the cycle is for handling repeating time cycles
  // and resets the startedAt time every cyclems to kickoff
  // so for example to restart time every day, set this to 1000 * 60 * 60 * 24
  get cycle() {
    return this._cycle;
  }

  set cycle(value) {
    this._cycle = value;
  }

  get kickoff() {
    return this._kickoff;
  }

  // this is the rate time is running at - so a value of 100 means time is running 100x realtime
  get rate() {
    return this._rate;
  }

  set rate(value) {
    // if the rate changes we need to fix the interval
    if (value !== this.rate) {
      this._rate = value;
      if (this.isTicking) this.start();
    }
  }

  // whether or not the ticker is running - ie. time is being counted
  get isTicking() {
    return this._ticking;
  }

  // how ofetn the sim time is updated
  get tickRate() {
    return this._tickRate;
  }

  set tickRate(value) {
    this.tickRate = value;
  }

  // when this cycle started at
  get startedAt() {
    return this._startedAt;
  }

  // get the current simmed time
  get time() {
    return this._time;
  }

  // keeps time without resetting on cycle
  get allTime() { 
    return this._allTime
  }

  // how many times the ticker has ticked
  get ticker() {
    return this._ticker;
  }

  // the current simmed time as a date
  get date() {
    return new Date(this.time);
  }

  // a shorthand to get all current interesting values
  get simPack() {
    return {
      time: this.time,
      rate: this.rate,
      ticker: this.ticker,
      startedAt: this.startedAt,
      date: this.date,
      cycle: this.cycle,
      kickoff: this.kickoff,
      tickRate: this.tickRate,
      allTime: this.allTime
    };
  }

  // set the simmed time to some new value
  set time(value) {
    this._time = value;
  }

  // this is called on every tick
  _tick() {
    if (this.cycle && this.time - this.startedAt >= this.cycle) {
      this.time = this.kickoff;
      this._ticker = 0;
    } else {
      this.time += this.rate * this._tickRate;
      this._ticker++;
    }
    this._allTime += this.rate * this._tickRate;

    // tick before recycling
    this._events.tick.forEach((func) => {
      func({
        ...this.simPack,
        eventName: "tick",
      });
    });
    if (this.cycle && this.time === this.kickoff) {
      this._events.cycle.forEach((func) =>
        func({
          ...this.simPack,
          eventName: "cycle",
        })
      );
    }
    return this;
  }

  // if a reset is needed this will cancel the timer
  _clearInterval() {
    if (this._interval) clearInterval(this._interval);
    return this;
  }

  // start counting time
  start() {
    this._clearInterval();
    this._ticking = true;
    this._interval = setInterval(() => this._tick(), this.tickRate);
    return this;
  }

  // stop counting time
  stop() {
    this._ticking = false;
    this._clearInterval();
    return this;
  }

  // remove event listerners
  off(eventName) {
    this._events[eventName] = [];
    return this;
  }

  // add am eventlistener
  on(eventName, func) {
    this._events[eventName].push(func);
    return this;
  }
}

module.exports = TimeSimmer
