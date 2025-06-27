import { useEffect, useState } from 'react';

declare global {
  interface Window {
    my?: any;
  }
}

export function Welcome() {
  const [message, setMessage] = useState<string>('...waiting');

  useEffect(() => {
    if (!window.my) {
      console.warn('Not in Mini Program');
      return;
    }

    // Listen for messages FROM Mini Program
    window.my.onMessage = function (e: any) {
      console.log('✅ React received from Mini Program:', e);
      setMessage(JSON.stringify(e?.data));
    };

    // Send message TO Mini Program after slight delay
    setTimeout(() => {
      console.log('🚀 React sending to Mini Program...');
      window.my.postMessage({
        sendToMiniProgram: '0'
      });
    }, 500);
  }, []);

  return (
    <div>
      <h2>Hello WebView</h2>
      <p>Message: {message}</p>
    </div>
  );
}
