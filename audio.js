var AudioManager = {
  ctx: null,
  enabled: false,
  initialized: false,

  init: function() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
    } catch(e) {
      this.enabled = false;
    }
  },

  _playTone: function(freq, duration, type, volume, ramp) {
    if (!this.enabled || !this.ctx) return;
    var osc = this.ctx.createOscillator();
    var gain = this.ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    gain.gain.value = volume || 0.15;
    if (ramp) {
      gain.gain.setValueAtTime(volume || 0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    }
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + duration);
  },

  _playNoise: function(duration, volume) {
    if (!this.enabled || !this.ctx) return;
    var bufferSize = this.ctx.sampleRate * duration;
    var buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    var source = this.ctx.createBufferSource();
    source.buffer = buffer;
    var gain = this.ctx.createGain();
    gain.gain.value = volume || 0.05;
    source.connect(gain);
    gain.connect(this.ctx.destination);
    source.start();
  },

  playCardSound: function() {
    this._playTone(800, 0.08, 'square', 0.08, true);
    this._playNoise(0.05, 0.03);
  },

  playDamageSound: function(amount) {
    var vol = Math.min(0.2, 0.05 + (amount || 0) * 0.01);
    this._playTone(150, 0.15, 'sawtooth', vol, true);
    this._playNoise(0.1, vol * 0.5);
  },

  playBlockSound: function() {
    this._playTone(600, 0.1, 'triangle', 0.1, true);
    this._playTone(900, 0.08, 'triangle', 0.06, true);
  },

  playHealSound: function() {
    this._playTone(523, 0.15, 'sine', 0.1, true);
    setTimeout(function() {
      AudioManager._playTone(659, 0.15, 'sine', 0.1, true);
    }, 80);
    setTimeout(function() {
      AudioManager._playTone(784, 0.2, 'sine', 0.08, true);
    }, 160);
  },

  playVictorySound: function() {
    var notes = [523, 659, 784, 1047];
    for (var i = 0; i < notes.length; i++) {
      (function(n, delay) {
        setTimeout(function() {
          AudioManager._playTone(n, 0.3, 'sine', 0.1, true);
        }, delay);
      })(notes[i], i * 120);
    }
  },

  playDeathSound: function() {
    this._playTone(300, 0.3, 'sawtooth', 0.15, true);
    setTimeout(function() {
      AudioManager._playTone(200, 0.4, 'sawtooth', 0.12, true);
    }, 200);
    setTimeout(function() {
      AudioManager._playTone(100, 0.6, 'sawtooth', 0.1, true);
    }, 400);
  },

  playButtonClick: function() {
    this._playTone(1200, 0.04, 'square', 0.05, true);
  },

  playDrawCard: function() {
    this._playNoise(0.03, 0.04);
    this._playTone(2000, 0.03, 'sine', 0.03, true);
  },

  playPotionSound: function() {
    // Glass clink: high-pitched sine + short noise burst
    this._playTone(1800, 0.06, 'sine', 0.1, true);
    this._playTone(2400, 0.04, 'sine', 0.06, true);
    this._playNoise(0.03, 0.04);
  },

  playRelicSound: function() {
    // Magical chime: ascending sine tones
    var notes = [880, 1108, 1318, 1760];
    for (var i = 0; i < notes.length; i++) {
      (function(n, delay) {
        setTimeout(function() {
          AudioManager._playTone(n, 0.2, 'sine', 0.08, true);
        }, delay);
      })(notes[i], i * 70);
    }
  },

  playEnemyDeathSound: function() {
    // Deeper death sound than player death
    this._playTone(200, 0.2, 'sawtooth', 0.12, true);
    this._playNoise(0.15, 0.06);
    setTimeout(function() {
      AudioManager._playTone(120, 0.3, 'sawtooth', 0.1, true);
    }, 120);
    setTimeout(function() {
      AudioManager._playTone(60, 0.4, 'sawtooth', 0.08, true);
    }, 250);
  },

  playShieldSound: function() {
    // Metallic clang when block absorbs all damage
    this._playTone(800, 0.08, 'square', 0.1, true);
    this._playTone(1200, 0.06, 'square', 0.06, true);
    this._playTone(600, 0.1, 'triangle', 0.08, true);
    this._playNoise(0.04, 0.05);
  }
};

// Initialize on first user interaction
document.addEventListener('click', function() {
  AudioManager.init();
}, { once: true });
