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
      console.log(e);
      setMessage(e);
    };

    my.postMessage({'sendToMiniProgram': '0'});

    my.getStorage({
      key: 'currentCity',
      success: function(res: any) {
        alert(res.data);
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