
'use strict';

var options   = {},
    cube      = require('cube'),
    emitter   = false;


/**
 *	Prefix a collection name
 */
var colPrefix = function(metric_type, metric) {
	var ary = metric.split('.');
	if (options.prefix) ary.shift();
	ary.unshift(metric_type);
	return ary.join('_')+'_'+options.rate;
};

/**
 *	Aggregate the metrics
 */
var aggregate = {
	/**
	 *	Aggregate some metrics bro
	 *	@param {Number} time
	 *	@param {Stirng} key
	 *	@param {String} val
	 */
	gauges: function(time, key, val) {
		return {
			col: colPrefix('gauges', key),
			data: {
				time: time,
				gauge: val
			},
		};
	},
	/**
	 *	Aggregate some timer_data bro
	 *	@param {Number} time
	 *	@param {Stirng} key
	 *	@param {String} vals
	 */
	timer_data: function(time, key, val) {
		val.time = time;
		return {
			col: colPrefix('timers', key),
			data: val
		};
	},
	/**
	 *	Aggregate some timers bro
	 *	@param {Number} time
	 *	@param {Stirng} key
	 *	@param {String} vals
	 */
	timers: function(time, key, val) {
		return {
			col: colPrefix('timers', key),
			data: {
				time: time,
				durations: val
			},
		};
	},
	/**
	 *	Aggregate some counters bro
	 *	@param {Number} time
	 *	@param {Stirng} key
	 *	@param {String} val
	 */
	counters: function(time, key, val) {
		return {
			col: colPrefix('counters', key),
			data: {
				time: time,
				count: val
			},
		};
	},
	/**
	 *	Aggregate some sets bro
	 *	@param {Number} time
	 *	@param {Stirng} key
	 *	@param {String} val
	 */
	sets: function(time, key, val) {
		return {
			col: colPrefix('sets', key),
			data: {
				time: time,
				set: val
			},
		};
	}
};

/**
 *	our `flush` event handler
 */
var onFlush = function(time, metrics) {
	var metricTypes = ['gauges', 'timer_data', 'timers', 'counters', 'sets'];

	metricTypes.forEach(function(type, i){
		var obj;

		for (var key in metrics[type]) {

			obj = aggregate[type](time, key, metrics[type][key]);

      var utcSeconds  = obj.data.time,
          date        = new Date(0);
      date.setUTCSeconds(utcSeconds);
      delete(obj.data.time);

      if(obj.data.count > 0) {
        emitter.send({
          type: obj.col,
          time: date,
          data: obj.data
        });
      }
		};
	});
};

/**
 *	Expose our init function to StatsD
 *	@param {Number} startup_time
 *	@param {Object} config
 *	@param {Object} events
 */
exports.init = function(startup_time, config, events) {
	if (!startup_time || !config || !events) return false;

	options.debug = config.debug;

  emitter = cube.emitter(config.cube.dsn);

	options.rate = parseInt(config.flushInterval/1000, 10);
	// options.max = config.mongoMax ? parseInt(config.mongoMax, 10) : 2160;
	// options.host = config.mongoHost || '127.0.0.1';
	// options.prefix = typeof config.mongoPrefix == 'boolean' ? config.mongoPrefix : true;
	// options.name = config.mongoName;
	// options.port = config.mongoPort || options.port;

	events.on('flush', onFlush);

	return true;
};
