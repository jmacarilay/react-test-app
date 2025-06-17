import { useState } from "react";

export function Welcome() {
  const [fileInfo, setFileInfo] = useState([]);

  const handleChange = (event) => {
    const file = event.target.files[0];
    console.log("File size", file.size);
    setFileInfo(file);
  };

  return (
    <main>
      <input
        type="file"
        accept="image/*"
        capture="environment" // "user" for front camera
        onChange={(e) => handleChange(e)}
      />

      <div>
        {fileInfo.size}
      </div>
    </main>
  );
}