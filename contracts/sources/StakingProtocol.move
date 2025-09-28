module contracts::staking_protocol {
    use sui::object::{UID};
    use sui::tx_context::TxContext;
    use sui::balance::{Self, Balance};
    use sui::sui::SUI;

    /// Stub: return accrued rewards to the caller (none for now).
    public fun claim_rewards(_pool_uid: &UID, _ctx: &mut TxContext): Balance<SUI> {
        balance::zero<SUI>()
    }

    /// Stub: unstake principal back to the caller (none for now).
    public fun unstake_all(_pool_uid: &UID, _ctx: &mut TxContext): Balance<SUI> {
        balance::zero<SUI>()
    }
}
