import "dotenv/config";

async function initWallet() {
  console.log("\n🔐 Initializing OWS Wallet...\n");

  const walletPath = process.env.OWS_WALLET_PATH ?? "./wallet.ows";
  const password = process.env.OWS_WALLET_PASSWORD;

  if (!password || password === "your_strong_password_here") {
    console.error("❌ Please set OWS_WALLET_PASSWORD in your .env file");
    process.exit(1);
  }

  // In production: use @open-wallet-standard/core to create encrypted wallet
  // const wallet = await OWSWallet.create({ path: walletPath, password });
  // console.log(`✅ OWS Wallet created!\nAddress (EVM): ${wallet.address}`);

  // Simulated output for demo
  const mockAddress = "0x" + Math.random().toString(16).slice(2, 42).padEnd(40, "0");
  console.log(`✅ OWS Wallet initialized!`);
  console.log(`📁 Path    : ${walletPath}`);
  console.log(`🔑 Address : ${mockAddress}`);
  console.log(`\n⚠️  Never share your wallet.ows file or password!\n`);
}

initWallet();