# Sui Yield Lotto 🎲

A decentralized yield lotto built on Sui blockchain where participants deposit SUI tokens into a shared pool that gets staked to earn yield. A fair on-chain draw picks one winner who takes the yield, while every other participant gets their full deposit back—so you can play without real downside.

## 🎯 How It Works

1. **Create Pool**: Anyone can create a tontine (lotto pool) with specific parameters
2. **Join Pool**: Participants deposit the same amount of SUI tokens
3. **Stake Funds**: All deposits are automatically staked to earn yield
4. **Fair Draw**: When all participants have contributed, a random winner is selected
5. **Distribute Rewards**: Winner gets their deposit + all yield, others get their deposit back

## 🏗️ Architecture

### Core Modules

- **`Tontine.move`**: Main lotto logic, participant management, and fund distribution
- **`StakingProtocol.move`**: Handles staking of SUI tokens and yield generation
- **`Randomness.move`**: Provides fair, on-chain random number generation
- **`Invitation.move`**: Manages invitation system for joining tontines

### Key Features

- ✅ **Zero Downside**: Everyone gets their deposit back
- ✅ **Fair Selection**: Cryptographic randomness ensures fair winner selection
- ✅ **Automatic Staking**: Funds are automatically staked to earn yield
- ✅ **Transparent**: All operations are on-chain and verifiable
- ✅ **Invitation System**: Easy sharing and joining of tontines

## 🚀 Quick Start

### Prerequisites

- [Sui CLI](https://docs.sui.io/build/install) installed
- Node.js 16+ for scripts
- Sui testnet tokens for testing

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd SUI_TONTINE
```

2. Install dependencies:
```bash
cd contracts
sui move build
```

3. Deploy contracts:
```bash
cd ../scripts
node deploy.js
```

4. Interact with contracts:
```bash
node interact.js
```

## 📋 Usage Examples

### Creating a Tontine

```move
// Create a tontine with 5 participants, 100 SUI each
let tontine = contracts::tontine::create_tontine(
    string::utf8(b"My Yield Lotto"),
    string::utf8(b"A fun way to earn yield!"),
    5,                    // max participants
    100000000000,         // 100 SUI (in MIST)
    b"SUI",
    ctx
);
```

### Contributing to a Tontine

```move
// Contribute exact amount to active tontine
contracts::tontine::contribute(
    &mut tontine,
    payment_coin,
    ctx
);
```

### Selecting Winner and Distributing Funds

```move
// Select random winner
contracts::tontine::select_beneficiary(
    &mut tontine,
    &mut randomness,
    &clock,
    ctx
);

// Distribute funds (winner gets deposit + yield, others get deposit back)
contracts::tontine::distribute_funds(
    &mut tontine,
    ctx
);
```

## 🧪 Testing

Run comprehensive tests:

```bash
cd contracts
sui move test
```

### Test Coverage

- **Tontine Tests**: Creation, contribution, winner selection, fund distribution
- **Staking Protocol Tests**: Pool creation, staking, unstaking, rewards calculation
- **Randomness Tests**: Random number generation, winner selection
- **Invitation Tests**: Creation, usage, validation, expiration

## 📊 Smart Contract Functions

### Tontine Module

| Function | Description |
|----------|-------------|
| `create_tontine` | Create a new tontine with specified parameters |
| `add_participant` | Add a participant to the tontine |
| `activate_tontine` | Activate the tontine for contributions |
| `contribute` | Contribute exact amount to the tontine |
| `select_beneficiary` | Select random winner using on-chain randomness |
| `distribute_funds` | Distribute funds (winner gets deposit + yield) |
| `get_tontine_info` | Get tontine information |
| `is_participant` | Check if address is a participant |

### Staking Protocol Module

| Function | Description |
|----------|-------------|
| `create_staking_pool` | Create a new staking pool |
| `stake` | Stake SUI tokens in the pool |
| `unstake` | Unstake tokens and claim rewards |
| `calculate_rewards` | Calculate rewards for a stake |
| `claim_rewards` | Claim accumulated rewards |

### Randomness Module

| Function | Description |
|----------|-------------|
| `create_randomness` | Create randomness object |
| `generate_random_number` | Generate random number using LCG |
| `select_random_winner` | Select random winner from participants |
| `get_winner_by_index` | Get winner address by index |

## 🔒 Security Features

- **Access Control**: Only creators can manage their tontines
- **Amount Validation**: Exact contribution amounts required
- **Double Payment Prevention**: Participants can't pay twice
- **Fair Randomness**: Cryptographic random number generation
- **Fund Safety**: All funds held in escrow until distribution

## 🌐 Frontend Integration

The project includes a React/Next.js frontend for easy interaction:

- **Dashboard**: View and manage tontines
- **Create Tontine**: Easy tontine creation interface
- **Join Tontine**: Simple invitation-based joining
- **Wallet Integration**: Sui wallet connection

## 📈 Yield Generation

The staking protocol generates yield through:

- **Validator Staking**: SUI tokens are staked with validators
- **Time-based Rewards**: Rewards calculated based on staking duration
- **Compound Growth**: Yield accumulates over time
- **Fair Distribution**: All yield goes to the winner

## 🛠️ Development

### Project Structure

```
SUI_TONTINE/
├── contracts/           # Move smart contracts
│   ├── sources/        # Contract source files
│   ├── tests/          # Test files
│   └── Move.toml       # Package configuration
├── frontend/           # React/Next.js frontend
├── scripts/            # Deployment and interaction scripts
└── docs/               # Documentation
```

### Adding New Features

1. **Smart Contracts**: Add new functions to existing modules or create new modules
2. **Tests**: Write comprehensive tests for new functionality
3. **Frontend**: Update UI components to support new features
4. **Scripts**: Add interaction commands for new functions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `docs/` folder for detailed guides
- **Issues**: Report bugs and request features via GitHub issues
- **Community**: Join the Sui community for discussions

## 🎉 Acknowledgments

- Built on [Sui](https://sui.io/) blockchain
- Inspired by traditional tontines and modern DeFi yield farming
- Community feedback and contributions

---

**Happy Lotto-ing! 🎲✨**