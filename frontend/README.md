# Darte Sui Frontend

A modern, responsive frontend for the Darte (Tontine) Sui blockchain application built with Next.js, React, and TypeScript.

## Features

- 🎨 **Modern UI**: Beautiful, responsive design with dark theme
- 🔗 **Wallet Integration**: Seamless Sui wallet connection using Dapp-Kit
- 📱 **Mobile Responsive**: Works perfectly on all device sizes
- 🎯 **Tontine Management**: Create, join, and manage collective savings pools
- 📊 **Real-time Updates**: Live blockchain data integration
- 🔔 **Notifications**: Toast notifications for user feedback
- 🎨 **Component Library**: Reusable UI components with Radix UI

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Blockchain**: Sui SDK (@mysten/sui, @mysten/dapp-kit)
- **State Management**: React Query (@tanstack/react-query)
- **Icons**: Lucide React
- **QR Codes**: qrcode library

## Getting Started

### Prerequisites

- Node.js 18.12.0 or higher
- pnpm 8.0.0 or higher
- Sui wallet (Sui Wallet, Suiet, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SUI_TONTINE/frontend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment**
   - The frontend is already configured to use the deployed smart contract
   - Package ID: `0x24faeeea07a8c6077dfa1fd481f37947a5badb29731a912f4a21a06ddb8a4394`
   - Network: Sui Testnet

4. **Start the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
frontend/
├── app/                          # Next.js app directory
│   ├── components/               # Reusable components
│   │   ├── ui/                   # Base UI components
│   │   ├── ConnectButton.tsx     # Wallet connection
│   │   ├── InvitationGenerator.tsx # QR code generation
│   │   └── TontineTemplates.tsx  # Pre-built templates
│   ├── src/
│   │   ├── hooks/                # Custom React hooks
│   │   │   ├── useTontine.ts     # Tontine contract interactions
│   │   │   └── useWallet.ts      # Wallet management
│   │   ├── lib/                  # Utility functions
│   │   │   ├── networkConfig.ts  # Network configuration
│   │   │   └── utils.ts          # Helper functions
│   │   └── types/                # TypeScript type definitions
│   │       └── tontine.ts        # Tontine-related types
│   ├── create/                   # Create tontine page
│   ├── join/                     # Join tontine page
│   ├── dashboard/                # User dashboard
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── providers.tsx             # App providers
├── package.json                  # Dependencies and scripts
└── README.md                     # This file
```

## Key Features

### 1. Wallet Integration
- Connect to Sui wallets seamlessly
- Display wallet balance and address
- Handle transaction signing and execution

### 2. Tontine Management
- **Create Tontine**: Set up new collective savings pools
- **Join Tontine**: Participate in existing pools via invitation codes
- **Contribute**: Make payments to active tontines
- **Select Beneficiary**: Choose winners for each round

### 3. User Experience
- **Templates**: Pre-built tontine configurations
- **QR Codes**: Easy sharing via QR codes
- **Real-time Updates**: Live blockchain data
- **Responsive Design**: Works on all devices

### 4. Smart Contract Integration
- Direct interaction with deployed Sui smart contracts
- Real-time data fetching from blockchain
- Transaction management and error handling

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues

## Configuration

### Network Configuration
The app is configured to use Sui Testnet by default. To change networks:

1. Update `frontend/app/src/lib/networkConfig.ts`
2. Modify the package ID and RPC URL
3. Update the default network in `providers.tsx`

### Smart Contract Integration
The frontend integrates with the deployed smart contract:

- **Package ID**: `0x24faeeea07a8c6077dfa1fd481f37947a5badb29731a912f4a21a06ddb8a4394`
- **Network**: Sui Testnet
- **Modules**: `tontine`, `invitation`, `enhanced_staking`

## Usage

### Creating a Tontine
1. Connect your wallet
2. Navigate to "Create Darte"
3. Fill in the form or select a template
4. Submit the transaction
5. Share the generated invitation code

### Joining a Tontine
1. Get an invitation code from a creator
2. Navigate to "Join Darte"
3. Enter the invitation code
4. Review tontine details
5. Join the tontine

### Managing Tontines
1. Go to "My Dartes" dashboard
2. View all your tontines
3. Contribute to active tontines
4. Select beneficiaries (if you're the creator)

## Troubleshooting

### Common Issues

1. **Wallet Connection Issues**
   - Ensure you have a Sui wallet installed
   - Check that you're on the correct network (Testnet)
   - Try refreshing the page

2. **Transaction Failures**
   - Check your wallet balance
   - Ensure you have enough SUI for gas fees
   - Verify the smart contract is deployed

3. **Build Issues**
   - Run `pnpm install` to ensure all dependencies are installed
   - Check Node.js version (18.12.0+ required)
   - Clear `.next` folder and rebuild

### Getting Help

- Check the browser console for error messages
- Verify wallet connection status
- Ensure sufficient SUI balance for transactions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Check the documentation
- Review the smart contract code
- Test with small amounts first
- Use Sui Testnet for development