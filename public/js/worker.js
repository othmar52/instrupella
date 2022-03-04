/*
 thanks to https://stackoverflow.com/questions/10576106/setintervalfunction-time-change-time-on-runtime#62927821
 instead of setInterval() we use setTimout()
 so we can change the tempo during runtime without getting out sync

 TODO
   send playbackRate, tempo, currentTime to worker as well
   so we can ensure the tick matches the beatgrid instead of using metronome start as reference
*/

const timer = {
	time: 500,
	_time: null,
	_timeout: null,
	onNextCycle: () => {
		// console.log("sending tick");
		postMessage("tick");
	},
	start() {
	  if (this._timeout == null) {
		const self = this;
		this.onNextCycle();
		this._timeout = setTimeout(function repeater() {
		  self.onNextCycle();
		  self._timeout = setTimeout(repeater, self.time);
		}, this.time);
	  }
	},
	stop() {
	  const timeout = this._timeout;
	  this._timeout = null;
	  clearTimeout(timeout);
	},
	setIntervalTime(time) {
	  if (this._time == null) this._time = this.time;
  
	  this.time = (time) ? time : this._time

	},
  };

self.onmessage=function(e){
	if (e.data=="start") {
		timer.setIntervalTime(interval)
		timer.start()
	}
	else if (e.data.interval) {
		interval=e.data.interval;
		timer.setIntervalTime(interval)
	}
	else if (e.data=="stop") {
		timer.stop()
	}
};
