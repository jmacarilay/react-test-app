export function Welcome() {
  const handleChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("Selected file:", file);
      // You can now upload or preview this file
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
    </main>
  );
}