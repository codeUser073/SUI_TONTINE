#[test_only]
module contracts::tontine_test {
    use sui::test_scenario::{Self, Scenario};
    use std::debug;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::vec_set::{Self, VecSet};
    use sui::table::{Self, Table};
    use contracts::tontine::Tontine;

    use std::string;


    const ADMIN: address = @0xAD;
    const PARTICIPANT1: address = @0xA1;
    const PARTICIPANT2: address = @0xA2;

    // Helper: mint SUI for the current tx sender


    // Helper: activate and add participants
    fun prime_active_with(s: &mut Scenario, p: address) {
        let mut t = test_scenario::take_from_sender<Tontine>(s);

        // Use the public test-only APIs instead of touching fields/consts directly
        contracts::tontine::test_add_participant(&mut t, p);
        contracts::tontine::test_set_status(&mut t, contracts::tontine::test_tontine_active());

        test_scenario::return_to_sender(s, t);
    }

    #[test]
    fun test_create_tontine() {
        use sui::test_scenario;

        // Adresse du créateur de la tontine
        let creator = @0x000;

        // Démarre un scénario de test avec le créateur
        let mut scenario = test_scenario::begin(creator);

        {
            // Appelle la fonction de création de la tontine
            let tontine = contracts::tontine::create_tontine(
                string::utf8(b"Ma Tontine"),
                string::utf8(b"Description cool"),
                5,
                100,
                b"COIN",
                scenario.ctx()
            );
            // Transfère la tontine au créateur (optionnel selon ton design)
            transfer::public_transfer(tontine, creator);
        };

        scenario.end();
    }
/*
    //======================================================================================================================================
    // CONTRIBUTE TESTS
    //======================================================================================================================================
    #[test]
    fun contribute_happy_path() {
        let creator = @0xA11CE;
        let mut sc = test_scenario::begin(creator);
        let ctx = test_scenario::ctx(&mut sc);

        // create
        let t = contracts::tontine::create_tontine(
            string::utf8(b"Pool"),
            string::utf8(b"desc"),
            2,            // max participants
            100,          // contribution amount
            b"SUI",
            ctx
        );
        transfer::public_transfer(t, creator);

        // add second participant & activate
        let participant = @0xB0B;
        prime_active_with(&mut sc, participant);

        // creator pays
        let pay1 = mint_coin_for_test(&mut sc, 100);
        {
            let mut t2 = test_scenario::take_from_sender<Tontine>(&mut sc);
            contracts::tontine::contribute(&mut t2, pay1, ctx);
            test_scenario::return_to_sender(&mut sc, t2);
        };

        // switch to participant & pay
        test_scenario::next_tx(&mut sc, participant);
        let pay2 = mint_coin_for_test(&mut sc, 100);
        {
            let mut t3 = test_scenario::take_from_sender<Tontine>(&mut sc);
            contracts::tontine::contribute(&mut t3, pay2, ctx);
            // escrow should equal 200 now
            let escrow = contracts::tontine::test_escrow_value(&t3);
            let expected = 200; // e.g., 2 participants * 100 each
            assert!(escrow == expected, 0);
            test_scenario::return_to_sender(&mut sc, t3);
        };

        test_scenario::end(sc);
    }

    #[test]
    #[expected_failure(abort_code = contracts::tontine::EInvalidAmount)]
    fun contribute_wrong_amount_fails() {
        let creator = @0xA11CE;
        let mut sc = test_scenario::begin(creator);
        let ctx = test_scenario::ctx(&mut sc);

        let t = contracts::tontine::create_tontine(
            string::utf8(b"Pool"),
            string::utf8(b"desc"),
            2, 100, b"SUI", ctx
        );
        transfer::public_transfer(t, creator);

        prime_active_with(&mut sc, @0xB0B);

        let wrong = mint_coin_for_test(&mut sc, 50);
        {
            let mut t2 = test_scenario::take_from_sender<Tontine>(&mut sc);
            contracts::tontine::contribute(&mut t2, wrong, ctx); // should abort
            test_scenario::return_to_sender(&mut sc, t2);
        };

        test_scenario::end(sc);
    }
//======================================================================================================================================
                                    // CONTRIBUTE TESTS
//======================================================================================================================================



        #[test]
        fun test_join_tontine() {
            let scenario_val = test_scenario::begin(ADMIN);
            let scenario = &mut scenario_val;
            let ctx = test_scenario::ctx(scenario);
            // TODO: Test joining a tontine
            // 1. Create a tontine
            // 2. Create invitation for participant
            // 3. Have participant join using invitation
            // 4. Verify participant is added
            // 5. Check tontine status updates

            test_scenario::end(scenario_val);
        }

        #[test]
        fun test_contribute_to_tontine() {
            let scenario_val = test_scenario::begin(ADMIN);
            let scenario = &mut scenario_val;
            let ctx = test_scenario::ctx(scenario);

            // TODO: Test contribution to tontine
            // 1. Create and setup tontine with participants
            // 2. Have participants contribute
            // 3. Verify contributions are recorded
            // 4. Check total contributed amount
            // 5. Verify events are emitted

            test_scenario::end(scenario_val);
        }

        #[test]
        fun test_select_beneficiary() {
            let scenario_val = test_scenario::begin(ADMIN);
            let scenario = &mut scenario_val;
            let ctx = test_scenario::ctx(scenario);

            // TODO: Test beneficiary selection
            // 1. Create tontine with all participants
            // 2. Have all participants contribute
            // 3. Select beneficiary for current round
            // 4. Verify beneficiary is selected correctly
            // 5. Check rotation algorithm works
            // 6. Verify events are emitted

            test_scenario::end(scenario_val);
        }

        #[test]
        fun test_distribute_funds() {
            let scenario_val = test_scenario::begin(ADMIN);
            let scenario = &mut scenario_val;
            let ctx = test_scenario::ctx(scenario);

            // TODO: Test fund distribution
            // 1. Setup tontine with contributions
            // 2. Select beneficiary
            // 3. Distribute funds to beneficiary
            // 4. Verify funds are transferred correctly
            // 5. Check tontine state is updated

            test_scenario::end(scenario_val);
        }

        #[test]
        fun test_tontine_completion() {
            let scenario_val = test_scenario::begin(ADMIN);
            let scenario = &mut scenario_val;
            let ctx = test_scenario::ctx(scenario);

            // TODO: Test tontine completion
            // 1. Create tontine with multiple rounds
            // 2. Complete all rounds
            // 3. Verify tontine status is completed
            // 4. Check all participants received funds
            // 5. Verify final events are emitted

            test_scenario::end(scenario_val);
        }

        #[test]
        #[expected_failure(abort_code = contract::tontine::EMaxParticipantsReached)]
        fun test_max_participants_limit() {
            let scenario_val = test_scenario::begin(ADMIN);
            let scenario = &mut scenario_val;
            let ctx = test_scenario::ctx(scenario);

            // TODO: Test maximum participants limit
            // 1. Create tontine with max participants
            // 2. Try to add one more participant
            // 3. Verify it fails with correct error

            test_scenario::end(scenario_val);
        }

        #[test]
        #[expected_failure(abort_code = contracts::tontine::EAlreadyPaid)]
        fun test_double_contribution() {
            let scenario_val = test_scenario::begin(ADMIN);
            let scenario = &mut scenario_val;
            let ctx = test_scenario::ctx(scenario);

            // TODO: Test double contribution prevention
            // 1. Create tontine and participant
            // 2. Have participant contribute once
            // 3. Try to contribute again in same round
            // 4. Verify it fails with correct error
            test_scenario::end(scenario_val);
        }

        #[test]
        #[expected_failure(abort_code = contracts::tontine::EInsufficientFunds)]
        fun test_insufficient_contribution() {
            let scenario_val = test_scenario::begin(ADMIN);
            let scenario = &mut scenario_val;
            let ctx = test_scenario::ctx(scenario);

            // TODO: Test insufficient contribution amount
            // 1. Create tontine with specific contribution amount
            // 2. Try to contribute with less amount
            // 3. Verify it fails with correct error

            test_scenario::end(scenario_val);
        }


}