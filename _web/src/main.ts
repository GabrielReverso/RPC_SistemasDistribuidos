async function main() {
  const response = await fetch("http://localhost:3000/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ a: 10, b: 32 }),
  });
  const data = await response.json();
  console.log("Resultado da soma:", data.result);
}

main();