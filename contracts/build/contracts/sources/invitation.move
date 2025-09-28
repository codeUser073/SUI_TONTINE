module contracts::invitation {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use std::string::{Self, String};
    use sui::vec_set::{Self, VecSet};
    use sui::table::{Self, Table};
    use std::vector;
    use sui::bcs;

    // Error codes
    const EInvitationNotFound: u64 = 0;
    const EInvitationAlreadyUsed: u64 = 1;
    const ENotInviter: u64 = 2;
    const EInvalidInvitation: u64 = 3;
    const EInvitationExpired: u64 = 4;
    const EInvalidInput: u64 = 5;

    // Invitation struct
    public struct Invitation has key, store {
        id: UID,
        tontine_id: ID,
        inviter: address,
        invitee: address,
        invitation_code: String,
        invitation_url: String,
        is_used: bool,
        created_at: u64,
        expires_at: u64,
    }

    // Invitation table struct for managing multiple invitations
    public struct InvitationTable has key {
        id: UID,
        tontine_id: ID,
        invitations: Table<String, ID>,
    }

    // Events
    public struct InvitationCreated has copy, drop {
        invitation_id: ID,
        tontine_id: ID,
        inviter: address,
        invitee: address,
        invitation_code: String,
    }

    public struct InvitationUsed has copy, drop {
        invitation_id: ID,
        tontine_id: ID,
        invitee: address,
    }

    public struct InvitationExpired has copy, drop {
        invitation_id: ID,
        tontine_id: ID,
    }

    // Create invitation
    public fun create_invitation(
        tontine_id: ID,
        invitee: address,
        invitation_code: String,
        base_url: String,
        ctx: &mut TxContext
    ): Invitation {
        let current_time = tx_context::epoch_timestamp_ms(ctx);
        let expiration_time = current_time + (7 * 24 * 60 * 60 * 1000); // 7 days in milliseconds
        
        let invitation_url = create_invitation_url(base_url, invitation_code);
        
        let invitation = Invitation {
            id: object::new(ctx),
            tontine_id,
            inviter: tx_context::sender(ctx),
            invitee,
            invitation_code,
            invitation_url,
            is_used: false,
            created_at: current_time,
            expires_at: expiration_time,
        };
        
        // Emit event
        event::emit(InvitationCreated {
            invitation_id: object::uid_to_inner(&invitation.id),
            tontine_id,
            inviter: tx_context::sender(ctx),
            invitee,
            invitation_code,
        });
        
        invitation
    }

    // Use invitation
    public fun use_invitation(
        invitation: &mut Invitation,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Validate invitee
        assert!(sender == invitation.invitee, ENotInviter);
        
        // Check if invitation is not used
        assert!(!invitation.is_used, EInvitationAlreadyUsed);
        
        // Check if invitation is not expired
        let current_time = tx_context::epoch_timestamp_ms(ctx);
        assert!(current_time < invitation.expires_at, EInvitationExpired);
        
        // Mark invitation as used
        invitation.is_used = true;
        
        // Emit event
        event::emit(InvitationUsed {
            invitation_id: object::uid_to_inner(&invitation.id),
            tontine_id: invitation.tontine_id,
            invitee: sender,
        });
    }

    // Check if invitation is valid
    public fun is_invitation_valid(invitation: &Invitation, current_time: u64): bool {
        !invitation.is_used && current_time < invitation.expires_at
    }

    // Get invitation info
    public fun get_invitation_info(invitation: &Invitation): (ID, address, address, String, bool, u64) {
        (
            object::uid_to_inner(&invitation.id),
            invitation.inviter,
            invitation.invitee,
            invitation.invitation_code,
            invitation.is_used,
            invitation.expires_at
        )
    }

    // Generate invitation code
    public fun generate_invitation_code(_tontine_id: ID, _invitee: address, ctx: &mut TxContext): String {
        // Simple code generation - just return a fixed prefix with timestamp
        let mut code = string::utf8(b"INV");
        let timestamp = tx_context::epoch_timestamp_ms(ctx);
        
        // Convert timestamp to simple string representation
        let mut temp = timestamp;
        while (temp > 0) {
            let digit = temp % 10;
            let digit_char = if (digit == 0) {
                string::utf8(b"0")
            } else if (digit == 1) {
                string::utf8(b"1")
            } else if (digit == 2) {
                string::utf8(b"2")
            } else if (digit == 3) {
                string::utf8(b"3")
            } else if (digit == 4) {
                string::utf8(b"4")
            } else if (digit == 5) {
                string::utf8(b"5")
            } else if (digit == 6) {
                string::utf8(b"6")
            } else if (digit == 7) {
                string::utf8(b"7")
            } else if (digit == 8) {
                string::utf8(b"8")
            } else {
                string::utf8(b"9")
            };
            string::append(&mut code, digit_char);
            temp = temp / 10;
        };
        
        code
    }

    // Create invitation URL
    public fun create_invitation_url(
        base_url: String,
        invitation_code: String
    ): String {
        let mut url = base_url;
        string::append(&mut url, string::utf8(b"/join/"));
        string::append(&mut url, invitation_code);
        url
    }

    // Helper function to format byte as hex
    fun format_byte_as_hex(byte: u8): String {
        let hex_chars = string::utf8(b"0123456789ABCDEF");
        let high_nibble = (byte >> 4) & 0xF;
        let low_nibble = byte & 0xF;
        
        let mut result = string::utf8(b"");
        string::append(&mut result, string::substring(&hex_chars, high_nibble as u64, 1));
        string::append(&mut result, string::substring(&hex_chars, low_nibble as u64, 1));
        result
    }

    // Create invitation table
    public fun create_invitation_table(
        tontine_id: ID,
        ctx: &mut TxContext
    ): InvitationTable {
        InvitationTable {
            id: object::new(ctx),
            tontine_id,
            invitations: table::new(ctx),
        }
    }

    // Add invitation to table
    public fun add_invitation_to_table(
        table: &mut InvitationTable,
        invitation: Invitation,
        _ctx: &mut TxContext
    ) {
        let invitation_code = invitation.invitation_code;
        let invitation_id = object::uid_to_inner(&invitation.id);
        table::add(&mut table.invitations, invitation_code, invitation_id);
        
        // Destroy the invitation object since we've extracted what we need
        let Invitation { 
            id, 
            tontine_id: _, 
            inviter: _, 
            invitee: _, 
            invitation_code: _, 
            invitation_url: _, 
            is_used: _, 
            created_at: _, 
            expires_at: _ 
        } = invitation;
        object::delete(id);
    }

    // Get invitation from table
    public fun get_invitation_from_table(
        table: &InvitationTable,
        invitation_code: String,
        _ctx: &mut TxContext
    ): ID {
        assert!(table::contains(&table.invitations, invitation_code), EInvitationNotFound);
        *table::borrow(&table.invitations, invitation_code)
    }

    // Remove invitation from table
    public fun remove_invitation_from_table(
        table: &mut InvitationTable,
        invitation_code: String,
        _ctx: &mut TxContext
    ): ID {
        assert!(table::contains(&table.invitations, invitation_code), EInvitationNotFound);
        table::remove(&mut table.invitations, invitation_code)
    }
}