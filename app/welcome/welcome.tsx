import { useEffect, useState } from "react";

declare global {
  interface Window {
    my?: any;
  }
}

export function Welcome() {
  const [message, setMessage] = useState("Testing...");

  useEffect(() => {
    my.onMessage = function(e) {
      console.log(e);
      setMessage(e);
    };

    my.postMessage({'sendToMiniProgram': '0'});
  }, []);

  return (
    <main>
      <h4 className="text-red-500">WELCOME</h4>

      {message && <p className="text-red-500">Hello: {message}</p>}
    </main>
  );
}