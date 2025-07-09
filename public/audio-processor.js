class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    // Recommended 50ms chunks at 16kHz = 800 samples
    this.bufferSize = 800;
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
  }

  process(inputs) {
    const input = inputs[0][0];
    if (input) {
      for (let i = 0; i < input.length; i++) {
        this.buffer[this.bufferIndex++] = input[i];

        if (this.bufferIndex === this.bufferSize) {
          const pcmBuffer = this.convertTo16BitPCM(this.buffer);
          // Send raw binary data, not Base64
          this.port.postMessage({ audioData: pcmBuffer });
          this.bufferIndex = 0;
        }
      }
    }
    return true;
  }

  convertTo16BitPCM(input) {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return output.buffer;
  }
}

registerProcessor("audio-processor", AudioProcessor);
