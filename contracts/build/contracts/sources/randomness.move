module contracts::randomness {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use sui::clock::{Self, Clock};
    use sui::vec_set::{Self, VecSet};

    // Error codes
    const EInvalidSeed: u64 = 1;
    const EEmptyParticipants: u64 = 2;
    const EInvalidIndex: u64 = 3;

    // Randomness struct for managing random number generation
    public struct Randomness has key, store {
        id: UID,
        seed: u64,
        nonce: u64,
    }

    // Events
    public struct RandomNumberGenerated has copy, drop {
        randomness_id: ID,
        seed: u64,
        nonce: u64,
        random_number: u64,
    }

    public struct WinnerSelected has copy, drop {
        randomness_id: ID,
        winner_index: u64,
        total_participants: u64,
        seed: u64,
    }

    // Initialize randomness
    public fun create_randomness(ctx: &mut TxContext): Randomness {
        Randomness {
            id: object::new(ctx),
            seed: tx_context::epoch_timestamp_ms(ctx),
            nonce: 0,
        }
    }

    // Generate a random number using a simple LCG (Linear Congruential Generator)
    public fun generate_random_number(
        randomness: &mut Randomness,
        clock: &Clock,
        ctx: &mut TxContext
    ): u64 {
        let current_time = clock::timestamp_ms(clock);
        let sender = tx_context::sender(ctx);
        
        // Combine multiple sources of entropy
        let entropy = randomness.seed + randomness.nonce + current_time + 12345; // Simplified entropy
        
        // Simple LCG: (a * x + c) mod m
        // Using constants: a = 1664525, c = 1013904223, m = 2^32
        let a: u64 = 1664525;
        let c: u64 = 1013904223;
        let m: u64 = 4294967296; // 2^32
        
        let random_number = (a * entropy + c) % m;
        
        // Update nonce for next generation
        randomness.nonce = randomness.nonce + 1;
        
        // Emit event
        event::emit(RandomNumberGenerated {
            randomness_id: object::uid_to_inner(&randomness.id),
            seed: randomness.seed,
            nonce: randomness.nonce - 1,
            random_number,
        });
        
        random_number
    }

    // Select a random winner from participants
    public fun select_random_winner(
        randomness: &mut Randomness,
        participants: &VecSet<address>,
        clock: &Clock,
        ctx: &mut TxContext
    ): u64 {
        let participant_count = vec_set::length(participants);
        assert!(participant_count > 0, EEmptyParticipants);
        
        let random_number = generate_random_number(randomness, clock, ctx);
        let winner_index = random_number % participant_count;
        
        // Emit event
        event::emit(WinnerSelected {
            randomness_id: object::uid_to_inner(&randomness.id),
            winner_index,
            total_participants: participant_count,
            seed: randomness.seed,
        });
        
        winner_index
    }

    // Get winner address by index
    public fun get_winner_by_index(
        participants: &VecSet<address>,
        winner_index: u64
    ): address {
        let participant_count = vec_set::length(participants);
        assert!(winner_index < participant_count, EInvalidIndex);
        
        let participants_vec = vec_set::into_keys(*participants);
        let winner = *vector::borrow(&participants_vec, winner_index);
        
        // Clean up
        vector::destroy_empty(participants_vec);
        
        winner
    }

    // Get randomness info
    public fun get_randomness_info(randomness: &Randomness): (u64, u64) {
        (randomness.seed, randomness.nonce)
    }

    // Update seed (for additional entropy)
    public fun update_seed(randomness: &mut Randomness, new_seed: u64) {
        randomness.seed = new_seed;
        randomness.nonce = 0; // Reset nonce when seed changes
    }
}
