import { useEffect } from "react";

declare global {
  interface Window {
    my?: any;
  }
}

export function Welcome() {
  useEffect(() => {
    my.getEnv(function(res: any) {
      // alert(res.miniprogram);
    });

    my.onMessage = function(e: any) {
      alert("Received message: " + e);
    };

    my.postMessage({name:"test web-view"});
  }, []);

  return (
    <main>
      Hello World
    </main>
  );
}