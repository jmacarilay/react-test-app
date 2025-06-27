import { useEffect, useState } from "react";

declare global {
  interface Window {
    my?: any;
  }
}

export function Welcome() {
  const [message, setMessage] = useState(null);

  useEffect(() => {
    my.onMessage = function(e) {
      console.log(e);
      setMessage(e);
    };

    my.postMessage({'sendToMiniProgram': '0'});
  }, []);

  return (
    <main>
      Hello World
      {message && <p>Hello: {message}</p>}
    </main>
  );
}