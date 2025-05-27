# BUSK Radio

A decentralized AI-powered radio station with advertising capabilities and Web3 payments.

## Features

- 🎵 AI-powered radio shows with different hosts and personalities
- 📢 Advertising system with dynamic pricing and slot selection
- 💰 Web3 payments using Coinbase OnchainKit
- 🎙️ Interactive features (shoutouts, dedications, call-ins)
- 📊 Analytics dashboard for advertisers
- 🌐 Once-per-day station intro
- 🎨 Clean, modern UI with responsive design

## Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- A Coinbase OnchainKit API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/lillylight/Bunny-Test.git
cd busk-main
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory and add your OnchainKit API key:

```env
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_onchainkit_api_key_here
```

To get an OnchainKit API key:
1. Go to [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)
2. Create a new project
3. Get your API key from the project settings

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Wallet Connection Issues

If you see a loading spinner on the wallet connect button:

1. **Check API Key**: Ensure you have added your OnchainKit API key to `.env.local`
2. **Restart Server**: After adding the API key, restart the development server
3. **Clear Cache**: Try clearing your browser cache and localStorage
4. **Check Console**: Look for any error messages in the browser console

## Advertising System

The advertising system features:
- **Dynamic Pricing**: 
  - 10s ads: $0.05 (standard), $50 (branded/week)
  - 20s ads: $30 (standard), $60 (branded/week)
  - 30s ads: $50 (standard), $100 (branded/week)
- **Time Slot Selection**: Choose when your ad plays (beginning, middle, end of show)
- **2-Step Modal**: Easy-to-use interface for creating ads
- **Real-time Availability**: Only shows available slots

## Technologies Used

- Next.js 15
- TypeScript
- Tailwind CSS
- Coinbase OnchainKit
- Wagmi
- Framer Motion
- OpenAI API (for AI hosts)

## Contributing

Feel free to submit issues and pull requests!

## License

MIT
