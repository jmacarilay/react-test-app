import { useEffect } from "react";

declare global {
  interface Window {
    my?: any;
  }
}

export function Welcome() {
  useEffect(() => {
    console.log("Welcome component mounted");

    my.getEnv(function(res: any) {
      // alert(res.miniprogram);
    });

    my.onMessage = function(e: any) {
      alert("Received message: " + JSON.stringify(e));
    };
  }, []);

  return (
    <main>
      Hello World
    </main>
  );
}