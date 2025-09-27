# Tontine Sui Frontend

A modern frontend for decentralized collective savings on Sui blockchain.

## 🚀 Features

- **Modern UI/UX**: Beautiful, responsive design with dark theme
- **Wallet Integration**: Seamless Sui wallet connection
- **Tontine Management**: Create, join, and manage tontines
- **Real-time Updates**: Live blockchain data synchronization
- **Mobile Responsive**: Optimized for all device sizes

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui
- **Blockchain**: Sui integration via @mysten/dapp-kit
- **State Management**: React Query
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── create/            # Create tontine page
│   ├── join/              # Join tontine page
│   ├── dashboard/         # User dashboard
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── providers.tsx      # App providers
├── src/
│   ├── hooks/            # Custom React hooks
│   │   ├── useTontine.ts # Tontine smart contract interactions
│   │   └── useWallet.ts  # Wallet connection utilities
│   ├── lib/              # Utility libraries
│   │   └── networkConfig.ts # Network configuration
│   └── types/            # TypeScript type definitions
│       └── tontine.ts    # Tontine-related types
└── package.json         # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.12.0 or higher
- pnpm 8.0.0 or higher
- Sui CLI (for smart contract deployment)

### Installation

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Configure network settings**:
   Update `src/lib/networkConfig.ts` with your deployed contract package IDs:
   ```typescript
   export const TESTNET_TONTINE_PACKAGE_ID = "YOUR_PACKAGE_ID_HERE";
   ```

3. **Start development server**:
   ```bash
   pnpm dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Pages Overview

### Home Page (`/`)
- Landing page with project overview
- Statistics and features showcase
- Call-to-action buttons for create/join

### Create Tontine (`/create`)
- Form to create new tontines
- Parameter configuration (participants, amount, frequency)
- Real-time calculation preview
- Wallet connection required

### Join Tontine (`/join`)
- Invitation code input
- Tontine details preview
- Join confirmation
- Wallet connection required

### Dashboard (`/dashboard`)
- User's tontines overview
- Contribution management
- Beneficiary selection
- Statistics and progress tracking

## 🔧 Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues

## 🔗 Smart Contract Integration

The frontend integrates with Sui Move smart contracts through:

1. **Transaction Building**: Using `@mysten/sui/transactions`
2. **Wallet Integration**: Via `@mysten/dapp-kit`
3. **Data Fetching**: Real-time blockchain data queries
4. **Error Handling**: Comprehensive error management

### Key Integration Points

- **Create Tontine**: `tontine::create_tontine`
- **Join Tontine**: `tontine::join_tontine`
- **Contribute**: `tontine::contribute`
- **Select Beneficiary**: `tontine::select_beneficiary`
- **Create Invitation**: `invitation::create_invitation`

## 📦 Deployment

### Build for Production
```bash
pnpm build
```

### Environment Variables
- `NEXT_PUBLIC_SUI_NETWORK`: Network configuration (testnet/mainnet)
- `NEXT_PUBLIC_TONTINE_PACKAGE_ID`: Deployed contract package ID

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ for the Sui ecosystem
