import { useState } from "react";

export function Welcome() {
  const [fileInfo, setFileInfo] = useState([]);

  const handleChange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      setFileInfo(file);
    }
  };

  return (
    <main>
      <input
        type="file"
        accept="image/*"
        capture="environment" // "user" for front camera
        onChange={handleChange}
      />

      <div>
        {fileInfo}
      </div>
    </main>
  );
}