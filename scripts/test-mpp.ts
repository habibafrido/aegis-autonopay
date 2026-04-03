async function main(): Promise<void> {
  const charge = await fetch("http://localhost:3001/pay", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: 15, recipient: "0xABC123", purpose: "MPP charge test" }),
  });
  console.log("mpp-charge:", await charge.json());

  const session = await fetch("http://localhost:3001/pay", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: 0.001, recipient: "0xABC123", purpose: "MPP session test", frequency: "streaming" }),
  });
  console.log("mpp-session:", await session.json());
}

main();

export {};
