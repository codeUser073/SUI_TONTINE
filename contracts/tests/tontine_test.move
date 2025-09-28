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
}