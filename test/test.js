const test = require("ava");
const TimeSimmer = require("../src/timesimmer");

const LEEWAY = 100;

test("init time starts at zero", (t) => {
  const s = new TimeSimmer({
    immediate: false,
    startedAt: 0
  });
  t.is(s.isTicking, false);
  t.is(s.time, 0);
  t.is(s.startedAt, 0);
});

test("init time starts now", (t) => {
  const now = new Date().getTime()
  const s = new TimeSimmer({
    immediate: false
  });
  t.is(s.isTicking, false);
  t.is(s.time - now < 2, true);
  t.is(s.startedAt, now);
  s.start() 
  t.is(s.isTicking, true);
  s.stop()
  t.is(s.isTicking, false);
});

test("test immediate and alternative start date and rate and tickrate", (t) => {
  const now = new Date(2000, 0, 1).getTime();
  const s = new TimeSimmer({
    startedAt: now,
    rate: 5000,
    tickRate: 2000
  });
  t.is(s.isTicking, true);
  t.is(s.time, now);
  t.is(s.startedAt, now);
  t.is(s.rate, 5000)
  t.is(s.tickRate, 2000);
});

test("test events and time update and rate change", (t) => {
  const now = new Date().getTime();
  const s = new TimeSimmer({
    rate: 5000,
    tickRate: 1000,
    startedAt: now
  });
  t.is(s.isTicking, true);
  return new Promise (resolve=> 
    s.on("tick", simPack => { 
      const { time, rate, ticker, startedAt, eventName , date} = simPack
      t.is(time, s.tickRate * s.rate + now)
      t.is(eventName, 'tick')
      t.is(startedAt, now)
      t.is(ticker, 1)
      t.is(date.getTime(), s.tickRate * rate + now);
      s.off("tick")
      resolve(simPack)
    })
  ).then(pack => { 
    return new Promise(resolve => { 
      const newRate = 2000
      s.rate = newRate
      s.on("tick", (simPack) => {
        const { time, rate, ticker, startedAt, eventName, date } = simPack;
        t.is(time, pack.time + s.tickRate * s.rate);
        t.is(eventName, "tick");
        t.is(startedAt, now);
        t.is(ticker, 2);
        t.is(date.getTime(), pack.time + rate * s.tickRate);
        resolve(simPack);
      });
    })
  })

});

test("test cycle", (t) => {
  const now = new Date().getTime();
  const s = new TimeSimmer({
    // speed up time so 1 second = 1 hour 
    rate: 60 * 60,
    // tick every second
    tickRate: 10000,
    startedAt: now,
    // restart time every hour
    cycle: 60 * 60 * 1000
  });
  t.is(s.isTicking, true);
  return new Promise((resolve) =>
    s.on("tick", (simPack) => {
      const { time, rate, ticker, startedAt, eventName, date } = simPack;
      t.is(time, s.tickRate * s.rate * s.ticker + now);
      t.is(eventName, "tick");
      t.is(startedAt, now);
      t.is(date.getTime(), s.tickRate * rate * s.ticker + now);
    }).on("cycle", simPack => {
      const { time, rate, ticker, startedAt, eventName, date } = simPack;
      t.is(time, s.kickoff);
      t.is(eventName, "cycle");
      t.is(startedAt, now);
      t.is(startedAt, s.kickoff);
      t.is(ticker, 0);
      t.is(date.getTime(),  now);
      resolve(simPack);
    })
  )
});


test("test cycle 2", (t) => {
  const now = 0;
  const s = new TimeSimmer({
    // update the simtime every 2 seconds
    tickRate: 2000,
    // 1 day every minute
    rate: 60 * 60 * 24,
    // we start at time 0
    startedAt: now,
    // cycle because the schedule is 1 week
    cycle: 1000 * 60 * 60 * 24 * 7,
    immediate: false
  });
  t.is(s.isTicking, false);
  s.start()
  return new Promise((resolve) =>
    s.on("tick", (simPack) => {

      const { time, rate, ticker, startedAt, eventName, date } = simPack;
      t.is(typeof time, "number");
      t.is(time, s.tickRate * s.rate * s.ticker + now);
      t.is(eventName, "tick");
      t.is(startedAt, now);
      t.is(date.getTime(), s.tickRate * rate * s.ticker + now);
    }).on("cycle", simPack => {

      const { time, rate, ticker, startedAt, eventName, date } = simPack;
      t.is(typeof time, 'number')
      t.is(time, s.kickoff);
      t.is(eventName, "cycle");
      t.is(startedAt, now);
      t.is(startedAt, s.kickoff);
      t.is(ticker, 0);
      t.is(date.getTime(),  now);
      resolve(simPack);
    })
  )
});



