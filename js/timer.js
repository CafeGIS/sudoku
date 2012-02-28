var timers = new Array();

Timer.prototype.tick = function() {
   this.onTick();

   if (this.onTimeout && this.timeLeft() <= 0) {
      this.onTimeout();
   } else {
      this.set();
   }
}

Timer.prototype.pause = function() {
   this.clear();

   if (this.onPause) {
      this.onPause();
   }
}

Timer.prototype.unpause = function() {
   if (this.onUnpause) {
      this.onUnpause();
   }

   this.tick();
}

Timer.prototype.set = function() {
   this.handle = setTimeout('timers[' +this.id +'].tick()', this.interval);
}

Timer.prototype.clear = function() {
   clearTimeout(this.handle);
}

function Timer(strid, conf) {
   this.interval = conf.interval;
   this.handle = 0;

   this.id = strid.hashCode();

   if (timers[this.id])
      timers[this.id].clear();

   timers[this.id] = this;

   this.timeLeft = conf.timeLeft;
   this.onTick = conf.onTick;
   this.onTimeout = conf.onTimeout;
   this.onPause = conf.onPause;
   this.onUnpause = conf.onUnpause;

   this.set();
}
