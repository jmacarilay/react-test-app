import { useEffect, useState } from "react";

declare global {
  interface Window {
    my?: any;
  }
}

export function Welcome() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    my.onMessage = function(e) {
      setMessage(e);
    };

    my.postMessage({'sendToMiniProgram': '0'});
  }, []);

  return (
    <main>
      Hello World
      {message && <p>{message}</p>}
    </main>
  );
}