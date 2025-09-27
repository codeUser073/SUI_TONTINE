#[test_only]
module contracts::tontine_test {
    use sui::test_scenario::{Self, Scenario};
    use std::debug;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::test_utils;
    use contracts::tontine;
    use std::string;


    const ADMIN: address = @0xAD;
    const PARTICIPANT1: address = @0xA1;
    const PARTICIPANT2: address = @0xA2;

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

    #[test]
    #[expected_failure(abort_code = contracts::tontine::EInvalidInput)]
    fun test_create_tontine_withBadParameters() {
        let creator = @0x000;
        let mut scenario_val = test_scenario::begin(creator);

        let tontine = contracts::tontine::create_tontine(
            string::utf8(b"Ma Tontine"),
            string::utf8(b"Description cool"),
            0,                // <= invalide
            1_000_000,        // contribution amount
            b"COIN",
            test_scenario::ctx(&mut scenario_val)  // ✅ mutable borrow correct
        );

        transfer::public_transfer(tontine, creator);

        test_scenario::end(scenario_val);
    }


    /*


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
        #[expected_failure(abort_code = tontine::tontine::EMaxParticipantsReached)]
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
        #[expected_failure(abort_code = tontine::tontine::EAlreadyPaid)]
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
        #[expected_failure(abort_code = tontine::tontine::EInsufficientFunds)]
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
        */

}