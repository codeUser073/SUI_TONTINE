module contracts::staking_protocol {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin};
    use sui::clock::{Self, Clock};
    use sui::event;
    use sui::transfer;
    use sui::sui::SUI;
    use std::string::{Self, String};

    // Error codes
    const ENotAuthorized: u64 = 1;
    const EInsufficientStake: u64 = 2;
    const EStakeNotFound: u64 = 3;
    const EStakeAlreadyExists: u64 = 4;
    const EInvalidAmount: u64 = 5;
    const EStakeNotMature: u64 = 6;
    const EPoolNotFound: u64 = 7;

    // Staking configuration
    const MIN_STAKE_AMOUNT: u64 = 1000; // Minimum 1000 MIST to stake
    const STAKING_PERIOD: u64 = 86400000; // 24 hours in milliseconds
    const ANNUAL_YIELD_RATE: u64 = 500; // 5% annual yield (500 basis points)

    // Staking pool struct
    public struct StakingPool has key, store {
        id: UID,
        total_staked: u64,
        total_rewards: u64,
        created_at: u64,
        coin_type: String,
        staked_balance: Balance<SUI>,
    }

    // Individual stake struct
    public struct Stake has key, store {
        id: UID,
        staker: address,
        amount: u64,
        staked_at: u64,
        maturity_time: u64,
        pool_id: ID,
    }

    // Events
    public struct StakeCreated has copy, drop {
        stake_id: ID,
        staker: address,
        amount: u64,
        pool_id: ID,
    }

    public struct RewardsClaimed has copy, drop {
        stake_id: ID,
        staker: address,
        rewards: u64,
        pool_id: ID,
    }

    public struct StakeUnstaked has copy, drop {
        stake_id: ID,
        staker: address,
        amount: u64,
        rewards: u64,
        pool_id: ID,
    }

    // Initialize staking pool
    public fun create_staking_pool(
        coin_type: String,
        ctx: &mut TxContext
    ): StakingPool {
        StakingPool {
            id: object::new(ctx),
            total_staked: 0,
            total_rewards: 0,
            created_at: tx_context::epoch_timestamp_ms(ctx),
            coin_type,
            staked_balance: balance::zero<SUI>(),
        }
    }

    // Stake SUI tokens
    public fun stake(
        pool: &mut StakingPool,
        stake_amount: Coin<SUI>,
        staker: address,
        clock: &Clock,
        ctx: &mut TxContext
    ): Stake {
        let amount = coin::value(&stake_amount);
        
        // Validate minimum stake amount
        assert!(amount >= MIN_STAKE_AMOUNT, EInvalidAmount);
        
        // Create stake
        let current_time = clock::timestamp_ms(clock);
        let stake = Stake {
            id: object::new(ctx),
            staker,
            amount,
            staked_at: current_time,
            maturity_time: current_time + STAKING_PERIOD,
            pool_id: object::uid_to_inner(&pool.id),
        };
        
        // Update pool
        pool.total_staked = pool.total_staked + amount;
        
        // Convert coin to balance and store in pool
        let balance = coin::into_balance(stake_amount);
        balance::join(&mut pool.staked_balance, balance);
        
        // Emit event
        event::emit(StakeCreated {
            stake_id: object::uid_to_inner(&stake.id),
            staker,
            amount,
            pool_id: object::uid_to_inner(&pool.id),
        });
        
        stake
    }

    // Calculate rewards for a stake
    public fun calculate_rewards(stake: &Stake, current_time: u64): u64 {
        if (current_time < stake.maturity_time) {
            return 0
        };
        
        let time_staked_ms = current_time - stake.staked_at;
        let time_staked_seconds = time_staked_ms / 1000; // Convert ms to seconds

        // Simple linear reward calculation (amount * rate * time / total_time_in_year)
        // To avoid overflow, cast to u256 for intermediate calculation
        let rewards = ((stake.amount as u256) * (ANNUAL_YIELD_RATE as u256) * (time_staked_seconds as u256)) / ((365 * 24 * 3600 * 10000) as u256);
        
        rewards as u64
    }

    // Claim rewards (returns the rewards amount)
    public fun claim_rewards(
        stake: &mut Stake,
        pool: &mut StakingPool,
        clock: &Clock,
        ctx: &mut TxContext
    ): u64 {
        let current_time = clock::timestamp_ms(clock);
        let rewards = calculate_rewards(stake, current_time);
        
        // Update pool rewards
        pool.total_rewards = pool.total_rewards + rewards;
        
        // Emit event
        event::emit(RewardsClaimed {
            stake_id: object::uid_to_inner(&stake.id),
            staker: stake.staker,
            rewards,
            pool_id: object::uid_to_inner(&pool.id),
        });
        
        rewards
    }

    // Unstake and claim rewards
    public fun unstake(
        stake: Stake,
        pool: &mut StakingPool,
        clock: &Clock,
        ctx: &mut TxContext
    ): (u64, u64) {
        let current_time = clock::timestamp_ms(clock);
        let rewards = calculate_rewards(&stake, current_time);
        
        // Update pool
        pool.total_staked = pool.total_staked - stake.amount;
        pool.total_rewards = pool.total_rewards + rewards;
        
        // Emit event
        event::emit(StakeUnstaked {
            stake_id: object::uid_to_inner(&stake.id),
            staker: stake.staker,
            amount: stake.amount,
            rewards,
            pool_id: object::uid_to_inner(&pool.id),
        });
        
        // Destroy stake
        let Stake { id, staker: _, amount, staked_at: _, maturity_time: _, pool_id: _ } = stake;
        object::delete(id);
        
        (amount, rewards)
    }

    // Get pool info
    public fun get_pool_info(pool: &StakingPool): (u64, u64, u64) {
        (pool.total_staked, pool.total_rewards, pool.created_at)
    }

    // Get stake info
    public fun get_stake_info(stake: &Stake): (address, u64, u64, u64) {
        (stake.staker, stake.amount, stake.staked_at, stake.maturity_time)
    }

    // Check if stake is mature
    public fun is_stake_mature(stake: &Stake, current_time: u64): bool {
        current_time >= stake.maturity_time
    }

    // Simplified functions for tontine integration
    /// Return accrued rewards to the caller (simplified version)
    public fun claim_rewards_simple(pool: &mut StakingPool, ctx: &mut TxContext): Balance<SUI> {
        // For now, return a small amount of rewards (simulated)
        let rewards_amount = pool.total_staked / 1000; // 0.1% of total staked
        if (rewards_amount > 0) {
            let rewards_balance = balance::split(&mut pool.staked_balance, rewards_amount);
            pool.total_rewards = pool.total_rewards + rewards_amount;
            rewards_balance
        } else {
            balance::zero<SUI>()
        }
    }

    /// Unstake principal back to the caller (simplified version)
    public fun unstake_all_simple(pool: &mut StakingPool, ctx: &mut TxContext): Balance<SUI> {
        let total_amount = pool.total_staked;
        if (total_amount > 0) {
            let principal_balance = balance::split(&mut pool.staked_balance, total_amount);
            pool.total_staked = 0;
            principal_balance
        } else {
            balance::zero<SUI>()
        }
    }

    // Legacy functions for backward compatibility
    public fun claim_rewards_legacy(_pool_uid: &UID, _ctx: &mut TxContext): Balance<SUI> {
        balance::zero<SUI>()
    }

    public fun unstake_all_legacy(_pool_uid: &UID, _ctx: &mut TxContext): Balance<SUI> {
        balance::zero<SUI>()
    }
}
