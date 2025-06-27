import { useEffect } from "react";

declare global {
  interface Window {
    my?: any;
  }
}

export function Welcome() {
  useEffect(() => {
    my.onMessage = function(e) {
      alert(e); //{'sendToWebView': '1'}
    };

    my.postMessage({'sendToMiniProgram': '0'});
  }, []);

  return (
    <main>
      Hello World
    </main>
  );
}