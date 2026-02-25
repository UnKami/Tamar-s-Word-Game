class AudioManager {
  ctx: AudioContext | null = null;
  masterGain: GainNode | null = null;
  bgmNodes: AudioNode[] = [];
  isMuted: boolean = false;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.5;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, vol: number = 0.1, detune: number = 0) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    osc.detune.value = detune;
    
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.005); // Faster attack
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playTypingSound() {
    // Phone tap style: softer, 'thocky' sound
    // Lower frequency sine wave with very short decay
    this.playTone(400, 'sine', 0.08, 0.2); 
    // Tiny high frequency tick for the initial touch contact feel
    this.playTone(2500, 'triangle', 0.01, 0.03); 
  }

  playErrorSound() {
    this.playTone(150, 'sawtooth', 0.2, 0.15);
    this.playTone(100, 'square', 0.2, 0.1);
  }

  playClearSound() {
    // Ascending chime
    const now = this.ctx?.currentTime || 0;
    this.playTone(523.25, 'sine', 0.4, 0.2); // C5
    setTimeout(() => this.playTone(659.25, 'sine', 0.4, 0.2), 50); // E5
    setTimeout(() => this.playTone(783.99, 'sine', 0.6, 0.2), 100); // G5
  }

  playBossHit() {
    // Heavy impact
    this.playTone(100, 'square', 0.3, 0.3);
    this.playTone(50, 'sawtooth', 0.4, 0.4);
    // White noise burst simulation (using randomized frequencies)
    for(let i=0; i<5; i++) {
        this.playTone(200 + Math.random()*800, 'sawtooth', 0.1, 0.1);
    }
  }

  playWaveStart() {
      this.playTone(440, 'sine', 1.0, 0.2);
  }

  playLevelFail() {
      this.playTone(100, 'sawtooth', 1.0, 0.5);
      setTimeout(() => this.playTone(80, 'sawtooth', 1.0, 0.5), 200);
  }

  startBGM() {
    if (!this.ctx || this.bgmNodes.length > 0) return;
    this.init();

    const t = this.ctx.currentTime;
    
    // Create a calm ambient drone
    const createDrone = (freq: number, type: OscillatorType, pan: number) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const panner = this.ctx.createStereoPanner();
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.value = freq;
        
        // LFO for volume breathing
        lfo.frequency.value = 0.1 + Math.random() * 0.1; // Slow breath
        lfo.connect(lfoGain);
        lfoGain.gain.value = 0.05; // Modulation depth
        lfoGain.connect(gain.gain);
        
        gain.gain.value = 0.05; // Base volume (very quiet)
        panner.pan.value = pan;

        osc.connect(gain);
        gain.connect(panner);
        panner.connect(this.masterGain);
        
        osc.start(t);
        lfo.start(t);
        
        this.bgmNodes.push(osc, gain, panner, lfo, lfoGain);
    };

    createDrone(110, 'sine', -0.5); // A2
    createDrone(164.81, 'sine', 0.5); // E3
    createDrone(220, 'triangle', 0); // A3 (Center, lower vol)
  }

  stopBGM() {
    this.bgmNodes.forEach(node => {
        try {
            if (node instanceof OscillatorNode) {
                node.stop();
            }
            node.disconnect();
        } catch (e) { /* ignore */ }
    });
    this.bgmNodes = [];
  }
}

export const audioManager = new AudioManager();