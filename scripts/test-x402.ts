async function main(): Promise<void> {
  const res = await fetch("http://localhost:3001/pay", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: 2, recipient: "0xABC123", purpose: "x402 test" }),
  });
  console.log("x402:", await res.json());
}

main();
