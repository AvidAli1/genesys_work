self.onmessage = function(e) {
  try {
    const { base64Audio, type, taskId } = e.data;
    
    if (type === 'decode') {
      // Convert base64 to ArrayBuffer
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Send back the ArrayBuffer
      self.postMessage({
        type: 'decoded',
        audioBuffer: bytes.buffer,
        taskId
      }, [bytes.buffer]);
    }
  } catch (error) {
    console.error('Worker error:', error);
    self.postMessage({ 
      type: 'error', 
      error: error.message,
      taskId
    });
  }
};