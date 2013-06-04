cube-statsd-backend
===================

Major credit to dynmeth's Mongo backend (http://github.com/dynmeth/mongo-statsd-backend).


A backend StatsD library to be used with a Cube (http://github.com/square/cube) Collector. Backend library uses the Cube emitter to send data received when statsd data flushes. Use Cube Evaluator queries (http://github.com/square/cube/wiki/Queries) to pull and use data where needed. Combine with Cubism (http://github.com/square/cubism) for more entertainment.

Installation
============
From your statsd directory

```npm install cube-statsd-backend```

Add the backend and a cube emitter web socket DSN to your statsd config file, you probably additionally want to set deleteIdleStats to true so you don't fill cube with a bunch of empty data as the evaluator will take care of filling in the spaces for you already.

```
deleteIdleStats: true,
cube: {
    dsn: "ws://127.0.0.1:1080"
},
backends: ['./node_modules/cube-statsd-backend/lib/index.js']
```

Usage
======

Each collection will be prefixed with the type of statsd data that was sent (gagues, counters, etc). Make requests to the evaluator api to pull data and remmeber that statsd will send the flush interval as a part of the stat type so in the example below sums the count data from a user_login counter that was incremented and flushed every second.

```
http://localhost:1081/1.0/metric?expression=sum(counters_user_login_1(count))&step=6e4&limit=100
```


Versions
========

0.0.0: all types are operational, but counters are all that I've played with. I'm ignoring bad lines and packets received for now until I know what to do with them.

