const { SuiClient, getFullnodeUrl } = require('@mysten/sui.js/client');
const { TransactionBlock } = require('@mysten/sui.js/transactions');
const fs = require('fs');
const path = require('path');

// TODO: Load contract info
const CONTRACT_FILE = path.join(__dirname, 'contract.json');

class TontineContract {
    constructor(network = 'testnet') {
        this.client = new SuiClient({ url: getFullnodeUrl(network) });
        this.network = network;
        this.contractInfo = this.loadContractInfo();
    }

    // TODO: Load contract information
    loadContractInfo() {
        try {
            if (!fs.existsSync(CONTRACT_FILE)) {
                throw new Error('Contract not deployed. Run deploy.js first.');
            }
            return JSON.parse(fs.readFileSync(CONTRACT_FILE, 'utf8'));
        } catch (error) {
            console.error('Error loading contract info:', error.message);
            throw error;
        }
    }

    // TODO: Get package ID
    getPackageId() {
        return this.contractInfo.packageId;
    }

    // TODO: Create a new tontine
    async createTontine(signer, tontineData) {
        const txb = new TransactionBlock();
        
        // TODO: Implement tontine creation transaction
        txb.moveCall({
            target: `${this.getPackageId()}::tontine::create_tontine`,
            arguments: [
                txb.pure.string(tontineData.name),
                txb.pure.string(tontineData.description),
                txb.pure.u64(tontineData.maxParticipants),
                txb.pure.u64(tontineData.contributionAmount),
                txb.pure.u64(tontineData.deadlineInterval),
                txb.pure.string(tontineData.coinType)
            ]
        });

        const result = await this.client.signAndExecuteTransactionBlock({
            transactionBlock: txb,
            signer,
            options: {
                showEffects: true,
                showObjectChanges: true,
            },
        });

        return result;
    }

    // TODO: Join a tontine
    async joinTontine(signer, tontineId, invitationCode) {
        const txb = new TransactionBlock();
        
        // TODO: Implement tontine joining transaction
        txb.moveCall({
            target: `${this.getPackageId()}::tontine::join_tontine`,
            arguments: [
                txb.object(tontineId),
                txb.pure.string(invitationCode)
            ]
        });

        const result = await this.client.signAndExecuteTransactionBlock({
            transactionBlock: txb,
            signer,
            options: {
                showEffects: true,
                showObjectChanges: true,
            },
        });

        return result;
    }

    // TODO: Contribute to a tontine
    async contribute(signer, tontineId, paymentCoinId) {
        const txb = new TransactionBlock();
        
        // TODO: Implement contribution transaction
        txb.moveCall({
            target: `${this.getPackageId()}::tontine::contribute`,
            arguments: [
                txb.object(tontineId),
                txb.object(paymentCoinId)
            ]
        });

        const result = await this.client.signAndExecuteTransactionBlock({
            transactionBlock: txb,
            signer,
            options: {
                showEffects: true,
                showObjectChanges: true,
            },
        });

        return result;
    }

    // TODO: Select beneficiary
    async selectBeneficiary(signer, tontineId) {
        const txb = new TransactionBlock();
        
        // TODO: Implement beneficiary selection transaction
        txb.moveCall({
            target: `${this.getPackageId()}::tontine::select_beneficiary`,
            arguments: [txb.object(tontineId)]
        });

        const result = await this.client.signAndExecuteTransactionBlock({
            transactionBlock: txb,
            signer,
            options: {
                showEffects: true,
                showObjectChanges: true,
            },
        });

        return result;
    }

    // TODO: Distribute funds
    async distributeFunds(signer, tontineId, beneficiary) {
        const txb = new TransactionBlock();
        
        // TODO: Implement fund distribution transaction
        txb.moveCall({
            target: `${this.getPackageId()}::tontine::distribute_funds`,
            arguments: [
                txb.object(tontineId),
                txb.pure.address(beneficiary)
            ]
        });

        const result = await this.client.signAndExecuteTransactionBlock({
            transactionBlock: txb,
            signer,
            options: {
                showEffects: true,
                showObjectChanges: true,
            },
        });

        return result;
    }

    // TODO: Get tontine information
    async getTontineInfo(tontineId) {
        try {
            // TODO: Fetch tontine object from blockchain
            const tontineObject = await this.client.getObject({
                id: tontineId,
                options: { showContent: true }
            });

            if (tontineObject.data?.content?.dataType === 'moveObject') {
                const fields = tontineObject.data.content.fields;
                return {
                    id: tontineId,
                    creator: fields.creator,
                    name: fields.name,
                    description: fields.description,
                    maxParticipants: fields.max_participants,
                    contributionAmount: fields.contribution_amount,
                    deadlineInterval: fields.deadline_interval,
                    totalRounds: fields.total_rounds,
                    currentRound: fields.current_round,
                    status: fields.status,
                    participants: fields.participants,
                    paidParticipants: fields.paid_participants,
                    beneficiaries: fields.beneficiaries,
                    totalContributed: fields.total_contributed,
                    createdAt: fields.created_at,
                    nextDeadline: fields.next_deadline,
                    coinType: fields.coin_type,
                };
            }
            return null;
        } catch (error) {
            console.error('Error getting tontine info:', error.message);
            return null;
        }
    }

    // TODO: Get user's coins
    async getUserCoins(address) {
        try {
            // TODO: Fetch user's coins
            const coins = await this.client.getCoins({
                owner: address,
                coinType: '0x2::sui::SUI'
            });
            return coins.data;
        } catch (error) {
            console.error('Error getting user coins:', error.message);
            return [];
        }
    }

    // TODO: Get user's tontines
    async getUserTontines(address) {
        try {
            // TODO: Fetch user's tontines
            // This would typically involve querying the blockchain
            // for objects owned by the user
            return [];
        } catch (error) {
            console.error('Error getting user tontines:', error.message);
            return [];
        }
    }

    // TODO: Create invitation
    async createInvitation(signer, tontineId, invitee) {
        const txb = new TransactionBlock();
        
        // TODO: Implement invitation creation transaction
        txb.moveCall({
            target: `${this.getPackageId()}::invitation::create_invitation`,
            arguments: [
                txb.object(tontineId),
                txb.pure.address(invitee),
                txb.pure.string(this.generateInvitationCode()),
                txb.pure.string('https://tontine-sui.com')
            ]
        });

        const result = await this.client.signAndExecuteTransactionBlock({
            transactionBlock: txb,
            signer,
            options: {
                showEffects: true,
                showObjectChanges: true,
            },
        });

        return result;
    }

    // TODO: Generate invitation code
    generateInvitationCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = 'TONTINE_';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
}

// TODO: Example usage
async function example() {
    const contract = new TontineContract();
    
    console.log('Contract Package ID:', contract.getPackageId());
    console.log('Network:', contract.network);
    
    // TODO: Add example interactions
    // Example: Get user coins (replace with actual address)
    // const coins = await contract.getUserCoins('0x...');
    // console.log('User coins:', coins);
}

// TODO: Run example if this script is executed directly
if (require.main === module) {
    example().catch(console.error);
}

module.exports = { TontineContract };
