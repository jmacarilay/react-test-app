import { use, useEffect, useState } from "react";

declare global {
  interface Window {
    my?: any;
  }
}

export function Welcome() {
  const [message, setMessage] = useState(null);

  useEffect(() => {
    my.onMessage = function(e: any) {
      setMessage(e);
    };

    my.postMessage({'sendToMiniProgram': '0'});
  }, []);


  useEffect(() => {
    alert('Received message: ' + JSON.stringify(message));
  }, [message]);

  return (
    <main>
      <h4 className="text-red-500">WELCOME PO!</h4>

      <p className="text-red-500">Hello: {message}</p>
    </main>
  );
}