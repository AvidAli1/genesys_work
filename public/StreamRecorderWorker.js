// StreamRecorderWorker.js
self.onmessage = function(e) {
  const float32 = e.data;
  const int16 = new Int16Array(float32.length);
  
  for (let i = 0; i < float32.length; i++) {
    const sample = float32[i];
    int16[i] = !Number.isFinite(sample)
      ? 0
      : Math.max(-32768, Math.min(32767, sample * (sample < 0 ? 32768 : 32767)));
  }
  
  const bytes = new Uint8Array(int16.buffer);
  let binary = '';
  const chunkSize = 10000;
  
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk);
  }
  
  const base64 = btoa(binary);
  self.postMessage(base64);
};