import { useEffect, useState } from "react";

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
      alert('Received message: ' + JSON.stringify(e));
    };

    my.postMessage({'sendToMiniProgram': '0'});

    my.setStorage({
      key: 'currentCity',
      data: {
        cityName: 'London',
        adCode: '330100',
        spell: ' London',
      },
    });
  }, []);

  return (
    <main>
      <h4 className="text-red-500">WELCOME</h4>

      <p className="text-red-500">Hello: {message}</p>
    </main>
  );
}