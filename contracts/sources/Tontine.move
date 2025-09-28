module contracts::tontine {
    use sui::object::{Self, UID,ID,uid_to_inner};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::event;
    use sui::clock::{Self, Clock};
    use sui::vec_set::{Self, VecSet};
    use sui::table::{Self, Table};
    use std::string::String;
    use std::string;
    use contracts::staking_protocol;
    use contracts::randomness;
    use std::debug;
    use sui::url::{Self, Url};

    // TODO: Define tontine states
    const TONTINE_CREATED: u8 = 0;
    const TONTINE_ACTIVE: u8 = 1;
    const TONTINE_COMPLETED: u8 = 2;
    const TONTINE_CANCELLED: u8 = 3;

    // Error codes
    const ENotCreator: u64 = 0;
    const ENotParticipant: u64 = 1;
    const EAlreadyParticipant: u64 = 2;
    const EMaxParticipantsReached: u64 = 3;
    const ETontineNotActive: u64 = 4;
    const EInvalidAmount: u64 = 5;
    const ENotYourTurn: u64 = 6;
    const EAlreadyPaid: u64 = 7;
    const EInvalidDeadline: u64 = 8;
    const EInsufficientFunds: u64 = 9;
    const EInvalidInput: u64 = 42;
    const ENoWinnerSelected: u64 = 10;
    const EAlreadyDistributed: u64 = 11;
    const EInvalidWinner: u64 = 12;

    // Main tontine struct
    public struct Tontine has key, store {
        id: UID,
        creator: address,
        name: String,
        description: String,
        max_participants: u64,
        contribution_amount: u64,
        status: u8,
        participants: VecSet<address>,
        current_round: u64,
        total_rounds: u64,
        total_contributed: u64,
        // Track who has paid for each round: round -> VecSet<address>
        paid_participants: Table<u64, VecSet<address>>,
        // Escrow balance for the tontine
        escrow_balance: Balance<SUI>,
        // Beneficiaries for each round
        beneficiaries: Table<u64, address>,
        // Winner tracking for current round
        winner_selected: bool,
        winner_address: address,
        winner_index: u64,
        // Track if funds have been distributed for current round
        funds_distributed: bool,
        created_at: u64,
        coin_type: String,

        staked_assets_id : UID, // ID of the staked assets in the staking pool
    }

    // TODO: Define invitation struct
    public struct Invitation has key, store {
        id: UID,
        tontine_id: ID,
        inviter: address,
        invitee: address,
        invitation_code: String,
        is_used: bool,
        created_at: u64,
    }

    // TODO: Define contribution struct
    public struct Contribution has key, store {
        id: UID,
        tontine_id: ID,
        participant: address,
        amount: u64,
        round: u64,
        timestamp: u64,
    }

    // TODO: Define events
   public struct TontineCreated has copy, drop {
        tontine_id: ID,
        creator: address,
        name: String,
        max_participants: u64,
        contribution_amount: u64,
    }

    public struct ParticipantJoined has copy, drop {
        tontine_id: ID,
        participant: address,
        total_participants: u64,
    }

    public struct ContributionMade has copy, drop {
        tontine_id: ID,
        participant: address,
        amount: u64,
        round: u64,
    }

    public struct BeneficiarySelected has copy, drop {
        tontine_id: ID,
        beneficiary: address,
        round: u64,
        amount: u64,
    }

    public struct TontineCompleted has copy, drop {
        tontine_id: ID,
        total_rounds: u64,
        total_amount: u64,
    }

    public struct TontineStaked has copy, drop {
        tontine_id: ID,
        validator_address: address,
        amount: u64,
    }

    public struct FundsDistributed has copy, drop {
        tontine_id: ID,
        winner: address,
        winner_amount: u64,
        total_participants: u64,
        yield_amount: u64,
        round: u64,
    }

    // TODO: Implement create_tontine function
    public fun create_tontine(
        name:String,
        description: String,
        max_participants: u64,
        contribution_amount: u64,
        deadline_interval: u64,
        coin_type: vector<u8>,
        ctx: &mut TxContext
        // TODO: Faire un appel => add participant avec le createur en paramètre
    ): Tontine {
        assert!(max_participants > 0 && contribution_amount > 0, EInvalidInput);
        let id = object::new(ctx);
        let creator = tx_context::sender(ctx); // à check

        // TODO: Create tontine struct
        // la contribution doit être positive
        // maxparticipanat aussi
        //
        // TODO: Add creator as first participant
        // TODO: Emit TontineCreated event
        // TODO: Return tontine
        // Placeholder - implement this function
        // Initialize participants set with creator
        let mut participants = vec_set::empty<address>();
        participants.insert(creator);
        
        // Initialize empty tables
        let paid_participants = table::new<u64, VecSet<address>>(ctx);
        let beneficiaries = table::new<u64, address>(ctx);
        
        // Initialize escrow balance
        let escrow_balance = balance::zero<SUI>();
        
        Tontine {
            id,
            creator,
            name,
            description,
            max_participants,
            contribution_amount,
            status: TONTINE_CREATED,
            participants,
            current_round: 1,
            total_rounds: max_participants,
            total_contributed: 0,
            paid_participants,
            escrow_balance,
            beneficiaries,
            winner_selected: false,
            winner_address: @0x0,
            winner_index: 0,
            funds_distributed: false,
            created_at: tx_context::epoch_timestamp_ms(ctx),
            coin_type: string::utf8(coin_type),
            staked_assets_id : object::new(ctx),
        }
    }

    // Entry function to create tontine and transfer to sender
    public entry fun create_tontine_entry(
        name: String,
        description: String,
        max_participants: u64,
        contribution_amount: u64,
        deadline_interval: u64,
        coin_type: vector<u8>,
        ctx: &mut TxContext
    ) {
        let tontine = create_tontine(name, description, max_participants, contribution_amount, deadline_interval, coin_type, ctx);
        transfer::public_transfer(tontine, tx_context::sender(ctx));
    }

    // Join tontine using invitation code
    public fun join_tontine(
        tontine: &mut Tontine,
        invitation_code: vector<u8>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Check if tontine is active and accepting participants
        assert!(tontine.status == TONTINE_ACTIVE, ETontineNotActive);
        
        // Check if sender is not already a participant
        assert!(!vec_set::contains(&tontine.participants, &sender), EAlreadyParticipant);
        
        // Check if tontine has space for more participants
        let current_participants = vec_set::length(&tontine.participants);
        assert!(current_participants < tontine.max_participants, EMaxParticipantsReached);
        
        // TODO: Validate invitation code (for now, we'll skip validation)
        // In a real implementation, you would validate the invitation code
        // against the invitation system
        
        // Add participant to tontine
        vec_set::insert(&mut tontine.participants, sender);
        
        // Emit ParticipantJoined event
        event::emit(ParticipantJoined {
            tontine_id: uid_to_inner(&tontine.id),
            participant: sender,
            total_participants: vec_set::length(&tontine.participants),
        });
    }

    // Implement contribute function
    public fun contribute(
        tontine: &mut Tontine,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let current_round = tontine.current_round;
        
        // 1. Require active round & valid participant
        // Check if sender is a participant
        assert!(tontine.participants.contains(&sender), ENotParticipant);
        
        // Check if tontine is in active/collecting state
        assert!(tontine.status == TONTINE_ACTIVE, ETontineNotActive);
        
        // 2. Prevent double-pay
        // Check if sender has already paid for current round
        if (table::contains(&tontine.paid_participants, current_round)) {
            let paid_for_round = table::borrow_mut(&mut tontine.paid_participants, current_round);
            assert!(!paid_for_round.contains(&sender), EAlreadyPaid);
        };
        
        // 3. Amount must be exact
        let payment_amount = payment.value();
        assert!(payment_amount == tontine.contribution_amount, EInvalidAmount);
        
        // 4. Record payment
        // Mark sender as "paid" for the current round
        if (!table::contains(&tontine.paid_participants, current_round)) {
            let mut paid_set = vec_set::empty<address>();
            paid_set.insert(sender);
            table::add(&mut tontine.paid_participants, current_round, paid_set);
        } else {
            let paid_for_round = table::borrow_mut(&mut tontine.paid_participants, current_round);
            paid_for_round.insert(sender);
        };
        
        // Increment total contributed
        tontine.total_contributed = tontine.total_contributed + payment_amount;
        
        // 5. Escrow funds in contract object
        // Add payment to escrow balance
        let payment_balance = coin::into_balance(payment);
        tontine.escrow_balance.join(payment_balance);
        
        // 6. Emit ContributionMade event
        event::emit(ContributionMade {
            tontine_id: uid_to_inner(&tontine.id),
            participant: sender,
            amount: payment_amount,
            round: current_round,
        });
        // 7. If all participants have paid, lock the pool and distrubute funds

    }



    #[test_only]
    public fun test_set_status(t: &mut Tontine, s: u8) {
        t.status = s;
    }
    #[test_only]
    public fun test_tontine_active() : u8 { TONTINE_ACTIVE }
    #[test_only]
    public fun test_add_participant(t: &mut Tontine, p: address) {
        vec_set::insert(&mut t.participants, p);
    }
    #[test_only]
    public fun test_escrow_value(t: &Tontine): u64 { balance::value(&t.escrow_balance) }

    #[test_only]
    public fun test_current_round(t: &Tontine): u64 { t.current_round }

    #[test_only]
    public fun test_paid_count_for_round(t: &Tontine, r: u64): u64 {
        if (table::contains(&t.paid_participants, r)) {
            let set = table::borrow(&t.paid_participants, r);
            vec_set::size(set)
        } else { 0 }
    }
    #[test_only]
    public fun test_is_paid(t: &Tontine, r: u64, who: address): bool {
        if (table::contains(&t.paid_participants, r)) {
            let set = table::borrow(&t.paid_participants, r);
            set.contains(&who)
        } else { false }
    }





    // TODO: Implement select_beneficiary function
    public fun select_beneficiary(
        tontine: &mut Tontine,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Validate only creator can call this
        assert!(sender == tontine.creator, ENotCreator);
        
        // Check if tontine is active
        assert!(tontine.status == TONTINE_ACTIVE, ETontineNotActive);
        
        // Check if all participants have paid for current round
        let total_participants = vec_set::length(&tontine.participants);
        let paid_count = if (table::contains(&tontine.paid_participants, tontine.current_round)) {
            let paid_for_round = table::borrow(&tontine.paid_participants, tontine.current_round);
            vec_set::length(paid_for_round)
        } else {
            0
        };
        assert!(paid_count == total_participants, EInvalidInput);
        
        // Simple rotation algorithm - select next participant in order
        let participants_vec = vec_set::into_keys(tontine.participants);
        let winner_index = tontine.current_round % total_participants;
        let winner = *vector::borrow(&participants_vec, winner_index);
        
        // Set winner
        tontine.winner_address = winner;
        tontine.winner_selected = true;
        
        // Add to beneficiaries list
        table::add(&mut tontine.beneficiaries, tontine.current_round, winner);
        
        // Emit BeneficiarySelected event
        event::emit(BeneficiarySelected {
            tontine_id: uid_to_inner(&tontine.id),
            beneficiary: winner,
            round: tontine.current_round,
            amount: tontine.contribution_amount,
        });
    }

    // Create invitation (simplified version for frontend compatibility)
    public fun create_invitation(
        tontine: &mut Tontine,
        invitee: address,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Only creator can create invitations
        assert!(sender == tontine.creator, ENotCreator);
        
        // Check if tontine is active
        assert!(tontine.status == TONTINE_ACTIVE, ETontineNotActive);
        
        // Generate a simple invitation code (in real implementation, this would be more sophisticated)
        let invitation_code = string::utf8(b"INVITE_CODE_PLACEHOLDER");
        
        // Create invitation using the invitation module
        let invitation = contracts::invitation::create_invitation(
            uid_to_inner(&tontine.id),
            invitee,
            invitation_code,
            string::utf8(b"https://tontine.app/invite"),
            ctx
        );
        
        // Transfer invitation to creator (they can then share it)
        transfer::public_transfer(invitation, sender);
    }

    // Implement distribute_funds function with enhanced staking integration
    public entry fun distribute_funds(
        tontine: &mut Tontine,
        staking_pool: &mut contracts::enhanced_staking::EnhancedStakingPool,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);

        // 1) Guards
        assert!(sender == tontine.creator, ENotCreator);
        assert!(tontine.winner_selected, ENoWinnerSelected);
        assert!(!tontine.funds_distributed, EAlreadyDistributed);
        assert!(vec_set::contains(&tontine.participants, &tontine.winner_address), EInvalidWinner);

        // 2) Get staking rewards from enhanced staking pool
        let staking_rewards = contracts::enhanced_staking::get_total_rewards(staking_pool);

        // 3) Compute principal & yield
        let total_participants = vec_set::length(&tontine.participants);
        let total_principal = total_participants * tontine.contribution_amount;

        let escrow_now = balance::value(&tontine.escrow_balance);
        assert!(escrow_now >= total_principal, EInsufficientFunds);

        // Total yield includes staking rewards + any additional escrow growth
        let additional_yield = if (escrow_now > total_principal) { 
            escrow_now - total_principal 
        } else { 
            0 
        };
        let total_yield = staking_rewards + additional_yield;
        let winner_payout = tontine.contribution_amount + total_yield;

        // 4) Pay everyone: winner gets (deposit + yield), others get (deposit)
        let participants_vec = vec_set::into_keys(tontine.participants);
        let len = vector::length(&participants_vec);
        let mut i = 0;
        while (i < len) {
            let p = *vector::borrow(&participants_vec, i);
            let pay_amt = if (p == tontine.winner_address) { winner_payout } else { tontine.contribution_amount };

            let out_bal = balance::split(&mut tontine.escrow_balance, pay_amt);
            let out_coin = coin::from_balance(out_bal, ctx);
            transfer::public_transfer(out_coin, p);

            i = i + 1;
        };

        // 5) Sanity: escrow empty
        assert!(balance::value(&tontine.escrow_balance) == 0, EInsufficientFunds);

        // 6) Update state
        tontine.funds_distributed = true;
        tontine.status = TONTINE_COMPLETED;
        // If you use an Option<ID> for pool handle:
        // tontine.pool_id = option::none();

        // 7) Event
        event::emit(FundsDistributed {
            tontine_id: uid_to_inner(&tontine.id),
            winner: tontine.winner_address,
            winner_amount: winner_payout,
            total_participants,
            yield_amount: total_yield,
            round: tontine.current_round,
        });


    }



    public fun set_winner(
        tontine: &mut Tontine,
        winner_address: address,
        winner_index: u64,
        ctx: &mut TxContext
    ) {
        // Validate that winner is a participant
        assert!(vec_set::contains(&tontine.participants, &winner_address), EInvalidWinner);
        
        // Set winner information
        tontine.winner_selected = true;
        tontine.winner_address = winner_address;
        tontine.winner_index = winner_index;
        
        // Emit BeneficiarySelected event
        event::emit(BeneficiarySelected {
            tontine_id: uid_to_inner(&tontine.id),
            beneficiary: winner_address,
            round: tontine.current_round,
            amount: balance::value(&tontine.escrow_balance),
        });
    }

    // Stake tontine funds with validators using enhanced staking
    public entry fun stake_tontine_funds(
        tontine: &mut Tontine,
        staking_pool: &mut contracts::enhanced_staking::EnhancedStakingPool,
        validator_address: address,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);

        // Only creator can stake funds
        assert!(sender == tontine.creator, ENotCreator);

        // Tontine must be active
        assert!(tontine.status == TONTINE_ACTIVE, ETontineNotActive);

        // Must have participants
        let total_participants = vec_set::length(&tontine.participants);
        assert!(total_participants > 0, EInvalidInput);

        // Get escrow balance
        let escrow_balance = balance::value(&tontine.escrow_balance);
        assert!(escrow_balance > 0, EInsufficientFunds);

        // Convert balance to coin for staking
        let stake_coin = coin::from_balance(balance::split(&mut tontine.escrow_balance, escrow_balance), ctx);

        // Stake with the validator
        let stake = contracts::enhanced_staking::stake_with_validator(
            staking_pool,
            stake_coin,
            validator_address,
            sender,
            clock,
            ctx
        );

        // Transfer the stake object to the creator for management
        transfer::public_transfer(stake, sender);

        // Emit event
        event::emit(TontineStaked {
            tontine_id: uid_to_inner(&tontine.id),
            validator_address,
            amount: escrow_balance,
        });
    }

    // Helper function to check if funds have been distributed
    public fun are_funds_distributed(tontine: &Tontine): bool {
        tontine.funds_distributed
    }

    // Get tontine information
    public fun get_tontine_info(tontine: &Tontine): (address, String, u64, u64, u64, u8, u64, u64) {
        (
            tontine.creator,
            tontine.name,
            tontine.max_participants,
            tontine.contribution_amount,
            tontine.current_round,
            tontine.status,
            tontine.total_contributed,
            vec_set::length(&tontine.participants)
        )
    }

    // Get participants list
    public fun get_participants(tontine: &Tontine): VecSet<address> {
        tontine.participants
    }

    // Get beneficiaries list (for current round)
    public fun get_beneficiaries(tontine: &Tontine): vector<address> {
        if (table::contains(&tontine.beneficiaries, tontine.current_round)) {
            let beneficiary = table::borrow(&tontine.beneficiaries, tontine.current_round);
            let mut beneficiaries = vector::empty<address>();
            vector::push_back(&mut beneficiaries, *beneficiary);
            beneficiaries
        } else {
            vector::empty<address>()
        }
    }

    // Check if address is participant
    public fun is_participant(tontine: &Tontine, address: address): bool {
        vec_set::contains(&tontine.participants, &address)
    }

    // Check if participant has paid for current round
    public fun has_paid_current_round(tontine: &Tontine, address: address): bool {
        if (table::contains(&tontine.paid_participants, tontine.current_round)) {
            let paid_set = table::borrow(&tontine.paid_participants, tontine.current_round);
            vec_set::contains(paid_set, &address)
        } else {
            false
        }
    }

    // Add participant to tontine
    public fun add_participant(
        tontine: &mut Tontine,
        participant: address,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Only creator can add participants
        assert!(sender == tontine.creator, ENotCreator);
        
        // Check if not already participant
        assert!(!vec_set::contains(&tontine.participants, &participant), EAlreadyParticipant);
        
        // Check if max participants not reached
        assert!(vec_set::length(&tontine.participants) < tontine.max_participants, EMaxParticipantsReached);
        
        // Add participant
        vec_set::insert(&mut tontine.participants, participant);
    }

    // Activate tontine
    public fun activate_tontine(
        tontine: &mut Tontine,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Only creator can activate
        assert!(sender == tontine.creator, ENotCreator);
        
        // Must have participants
        assert!(vec_set::length(&tontine.participants) > 0, EInvalidInput);
        
        // Set status to active
        tontine.status = TONTINE_ACTIVE;
    }

    // Complete tontine round (when all participants have paid)
    public fun complete_round(
        tontine: &mut Tontine,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Only creator can complete round
        assert!(sender == tontine.creator, ENotCreator);
        
        // Check if all participants have paid
        let total_participants = vec_set::length(&tontine.participants);
        let paid_count = if (table::contains(&tontine.paid_participants, tontine.current_round)) {
            let paid_set = table::borrow(&tontine.paid_participants, tontine.current_round);
            vec_set::length(paid_set)
        } else {
            0
        };
        
        assert!(paid_count == total_participants, EInvalidInput);
        
        // Move to next round
        tontine.current_round = tontine.current_round + 1;
        
        // If this was the last round, mark as completed
        if (tontine.current_round > tontine.total_rounds) {
            tontine.status = TONTINE_COMPLETED;
        };
    }
}