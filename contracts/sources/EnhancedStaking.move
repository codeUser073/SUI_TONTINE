module contracts::enhanced_staking {
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::sui::SUI;
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::url;
    use sui::tx_context::TxContext;
    use sui::balance::{Self, Balance};
    use sui::event;
    use sui::clock::{Self, Clock};
    use sui::vec_set::{Self, VecSet};
    use sui::table::{Self, Table};

    use std::option;
    use std::vector;
    // Note: sui_system imports would need to be configured in Move.toml
    // For now, we'll use a simplified approach without direct sui_system integration

    // Error codes
    const EZeroAmount: u64 = 0;
    const ENotAuthorized: u64 = 1;
    const EInsufficientStake: u64 = 2;
    const EStakeNotFound: u64 = 3;
    const EStakeAlreadyExists: u64 = 4;
    const EInvalidAmount: u64 = 5;
    const EStakeNotMature: u64 = 6;
    const EPoolNotFound: u64 = 7;
    const EInvalidValidator: u64 = 8;

    // Staking configuration
    const MIN_STAKE_AMOUNT: u64 = 1000; // Minimum 1000 MIST to stake
    const STAKING_PERIOD: u64 = 86400000; // 24 hours in milliseconds

    // Enhanced staking pool struct
    public struct EnhancedStakingPool has key {
        id: UID,
        total_points: u64,
        total_staked: u64,
        total_rewards: u64,
        created_at: u64,
        staked_balance: Balance<SUI>,
        validator_addresses: VecSet<address>,
    }

    // Individual stake struct
    public struct EnhancedStake has key, store {
        id: UID,
        staker: address,
        amount: u64,
        points: u64,
        staked_at: u64,
        maturity_time: u64,
        pool_id: ID,
        validator_address: address,
    }

    // Events
    public struct StakeCreated has copy, drop {
        stake_id: ID,
        staker: address,
        amount: u64,
        points: u64,
        pool_id: ID,
        validator_address: address,
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

    public struct ValidatorAdded has copy, drop {
        pool_id: ID,
        validator_address: address,
    }

    // Initialize enhanced staking pool
    public fun create_enhanced_staking_pool(
        ctx: &mut TxContext
    ): EnhancedStakingPool {
        EnhancedStakingPool {
            id: object::new(ctx),
            total_points: 0,
            total_staked: 0,
            total_rewards: 0,
            created_at: tx_context::epoch_timestamp_ms(ctx),
            staked_balance: balance::zero<SUI>(),
            validator_addresses: vec_set::empty(),
        }
    }

    // Add validator to the pool
    public fun add_validator(
        pool: &mut EnhancedStakingPool,
        validator_address: address,
        _ctx: &mut TxContext
    ) {
        vec_set::insert(&mut pool.validator_addresses, validator_address);
        
        event::emit(ValidatorAdded {
            pool_id: object::uid_to_inner(&pool.id),
            validator_address,
        });
    }

    // Stake SUI tokens with a specific validator (simplified version)
    public fun stake_with_validator(
        pool: &mut EnhancedStakingPool,
        stake_amount: Coin<SUI>,
        validator_address: address,
        staker: address,
        clock: &Clock,
        ctx: &mut TxContext
    ): EnhancedStake {
        let amount = coin::value(&stake_amount);
        assert!(amount >= MIN_STAKE_AMOUNT, EInvalidAmount);
        assert!(vec_set::contains(&pool.validator_addresses, &validator_address), EInvalidValidator);

        // Convert coin to balance and store in pool (simplified staking simulation)
        let balance = coin::into_balance(stake_amount);
        balance::join(&mut pool.staked_balance, balance);
        
        // Update pool
        pool.total_staked = pool.total_staked + amount;
        pool.total_points = pool.total_points + amount;

        // Create stake
        let current_time = clock::timestamp_ms(clock);
        let stake = EnhancedStake {
            id: object::new(ctx),
            staker,
            amount,
            points: amount,
            staked_at: current_time,
            maturity_time: current_time + STAKING_PERIOD,
            pool_id: object::uid_to_inner(&pool.id),
            validator_address,
        };

        // Emit event
        event::emit(StakeCreated {
            stake_id: object::uid_to_inner(&stake.id),
            staker,
            amount,
            points: amount,
            pool_id: object::uid_to_inner(&pool.id),
            validator_address,
        });

        stake
    }

    // Calculate rewards for a stake (simplified - in real implementation, this would be more complex)
    public fun calculate_rewards(stake: &EnhancedStake, current_time: u64): u64 {
        if (current_time < stake.maturity_time) {
            return 0
        };

        let time_staked_ms = current_time - stake.staked_at;
        let time_staked_seconds = time_staked_ms / 1000;

        // Simple linear reward calculation
        let rewards = ((stake.amount as u256) * (time_staked_seconds as u256)) / ((365 * 24 * 3600 * 10000) as u256);
        rewards as u64
    }

    // Claim rewards (returns the rewards amount)
    public fun claim_rewards(
        stake: &mut EnhancedStake,
        pool: &mut EnhancedStakingPool,
        clock: &Clock,
        _ctx: &mut TxContext
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

    // Unstake and claim rewards (simplified version)
    public fun unstake(
        stake: EnhancedStake,
        pool: &mut EnhancedStakingPool,
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
        let EnhancedStake { id, staker: _, amount, points: _, staked_at: _, maturity_time: _, pool_id: _, validator_address: _ } = stake;
        object::delete(id);

        (amount, rewards)
    }

    // Get pool info
    public fun get_pool_info(pool: &EnhancedStakingPool): (u64, u64, u64, u64) {
        (pool.total_staked, pool.total_rewards, pool.total_points, pool.created_at)
    }

    // Get stake info
    public fun get_stake_info(stake: &EnhancedStake): (address, u64, u64, u64, address) {
        (stake.staker, stake.amount, stake.staked_at, stake.maturity_time, stake.validator_address)
    }

    // Check if stake is mature
    public fun is_stake_mature(stake: &EnhancedStake, current_time: u64): bool {
        current_time >= stake.maturity_time
    }

    // Get total staked amount
    public fun get_total_staked(pool: &EnhancedStakingPool): u64 {
        pool.total_staked
    }

    // Get total rewards
    public fun get_total_rewards(pool: &EnhancedStakingPool): u64 {
        pool.total_rewards
    }

    // Get validator addresses
    public fun get_validators(pool: &EnhancedStakingPool): VecSet<address> {
        pool.validator_addresses
    }

    // Check if validator is supported
    public fun is_validator_supported(pool: &EnhancedStakingPool, validator_address: address): bool {
        vec_set::contains(&pool.validator_addresses, &validator_address)
    }
}
