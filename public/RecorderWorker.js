// RecorderWorker.js
// This worker encodes raw PCM from Float32 to Int16 and returns base64
// RecorderWorker.js
self.onmessage = function (e) {
  try {
    const float32 = e.data;
    console.log('Worker received Float32Array of length:', float32.length);

    const int16 = new Int16Array(float32.length);

    for (let i = 0; i < float32.length; i++) {
      const sample = float32[i];
      int16[i] = !Number.isFinite(sample)
        ? 0
        : Math.max(-32768, Math.min(32767, sample * (sample < 0 ? 32768 : 32767)));
    }
    console.log('Converted to Int16Array of length:', int16.length);

    const bytes = new Uint8Array(int16.buffer);
    let binary = '';
    const chunkSize = 10000; // Process in chunks to avoid stack issues
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, chunk);
    }

    const base64 = btoa(binary);
    console.log('Generated base64 string of length:', base64.length);

    self.postMessage(base64);
  } catch (error) {
    console.error('Worker error:', error);
    self.postMessage('');
  }
};