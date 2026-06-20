(function () {
  if (typeof window === "undefined") return;

  window.__CLICK_SOUND_LOADED__ = true;
  console.log("[click-sound] loaded");

  var actx = null;
  var noiseBuffer = null;

  function ensureCtx() {
    if (!actx) {
      try {
        actx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        return;
      }
      // Pre-build a short white-noise buffer for the "click" transient.
      var len = Math.floor(actx.sampleRate * 0.03);
      noiseBuffer = actx.createBuffer(1, len, actx.sampleRate);
      var data = noiseBuffer.getChannelData(0);
      for (var i = 0; i < len; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    }
  }

  function beep() {
    if (!actx) return;
    var t = actx.currentTime + 0.001;

    // Noise transient -> mechanical "click"
    var src = actx.createBufferSource();
    src.buffer = noiseBuffer;
    var bp = actx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 2200;
    bp.Q.value = 0.8;
    var ng = actx.createGain();
    ng.gain.setValueAtTime(0.0001, t);
    ng.gain.exponentialRampToValueAtTime(0.5, t + 0.002);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
    src.connect(bp);
    bp.connect(ng);
    ng.connect(actx.destination);
    src.start(t);
    src.stop(t + 0.04);

    // Short tonal body so it reads as a UI click, not just static
    var osc = actx.createOscillator();
    var og = actx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(620, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.04);
    og.gain.setValueAtTime(0.0001, t);
    og.gain.exponentialRampToValueAtTime(0.18, t + 0.004);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    osc.connect(og);
    og.connect(actx.destination);
    osc.start(t);
    osc.stop(t + 0.07);
  }

  function playClick() {
    ensureCtx();
    if (!actx) return;
    if (actx.state === "suspended") {
      // Resume on the user gesture, then play once unlocked so the
      // very first click also sounds.
      actx.resume().then(beep, function () {});
    } else {
      beep();
    }
  }

  // Mouse-click sound on every primary (left) click anywhere.
  document.addEventListener(
    "pointerdown",
    function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      playClick();
    },
    true
  );
})();
