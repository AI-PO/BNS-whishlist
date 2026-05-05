# `domain_nft.scl` Entry Points

This document covers the externally callable entry points in `contracts/src/domain_nft.scl`; `_is_valid_registration_years(years: Int)` is excluded because it is an internal validation helper.

## 1. Admin functions

### `init(owner_addr: Str, token_name: Str, token_symbol: Str, token_uri_prefix: Str, payment_currency_contract_id: Str)`
Initializes the contract owner, token metadata, payment currency, and default state exactly once.

Fails and returns `0` when:
- `initialised == 1`
- Any argument is an empty string: `owner_addr`, `token_name`, `token_symbol`, `token_uri_prefix`, or `payment_currency_contract_id`

Return type: u64 — `1` on success, `0` on failure.

### `mint(to: Str, token_id: Str)`
Allows the contract owner to mint a domain NFT directly to a target address with a one-year expiry.

Fails and returns `0` when:
- `paused == 1`
- `SENDER_ADDRESS() != owner`
- `to == ""`
- `token_id == ""`
- `MAP_GET("token_exists", token_id) == 1`

Return type: u64 — `1` on success, `0` on failure.

### `set_price(new_price_per_year: Int)`
Sets the registration and renewal price charged per year.

Fails and returns `0` when:
- `SENDER_ADDRESS() != owner`
- `new_price_per_year <= 0`

Return type: u64 — `1` on success, `0` on failure.

### `pause()`
Pauses state-changing user actions such as minting, transfers, burns, purchases, and renewals.

Fails and returns `0` when:
- `SENDER_ADDRESS() != owner`

Return type: u64 — `1` on success, `0` on failure.

### `unpause()`
Re-enables state-changing user actions after a pause.

Fails and returns `0` when:
- `SENDER_ADDRESS() != owner`

Return type: u64 — `1` on success, `0` on failure.

### `transfer_ownership(new_owner: Str)`
Transfers contract-level admin control to a new owner address.

Fails and returns `0` when:
- `SENDER_ADDRESS() != owner`
- `new_owner == ""`

Return type: u64 — `1` on success, `0` on failure.

## 2. User functions

### `transfer(to: Str, token_id: Str)`
Lets the current owner of an active domain transfer that NFT to another address.

Fails and returns `0` when:
- `paused == 1`
- `MAP_GET("token_exists", token_id) != 1`
- `to == ""`
- `MAP_GET("token_expiry", token_id) <= CONTEXT_BLOCK_HEIGHT()`
- `SENDER_ADDRESS() != MAP_GET("token_owner", token_id)`
- `to == MAP_GET("token_owner", token_id)`

Return type: u64 — `1` on success, `0` on failure.

### `burn(token_id: Str)`
Deletes an existing domain NFT and decrements total supply, callable by either the contract owner or the token owner.

Fails and returns `0` when:
- `paused == 1`
- `MAP_GET("token_exists", token_id) != 1`
- `SENDER_ADDRESS()` is neither `owner` nor `MAP_GET("token_owner", token_id)`

Return type: u64 — `1` on success, `0` on failure.

### `buy_domain(token_id: Str, years: Int)`
Registers an unregistered or expired domain to the caller after collecting payment for the selected registration period.

Fails and returns `0` when:
- `paused == 1`
- `price_per_year <= 0`
- `token_id == ""`
- `_is_valid_registration_years(years) != 1` which means `years < 1` or `years > 4`
- `MAP_GET("token_expiry", token_id) > CONTEXT_BLOCK_HEIGHT()`
- `price_per_year * years <= 0`
- `CALL(currency_contract_id, "transfer", [CONTRACT_ID(), total_price]) != 1`
- `years * BLOCKS_PER_YEAR <= 0`

Return type: u64 — `1` on success, `0` on failure.

### `renew_domain(token_id: Str, years: Int)`
Extends the expiry of an already active domain owned by the caller after collecting payment.

Fails and returns `0` when:
- `paused == 1`
- `price_per_year <= 0`
- `MAP_GET("token_exists", token_id) != 1`
- `_is_valid_registration_years(years) != 1` which means `years < 1` or `years > 4`
- `SENDER_ADDRESS() != MAP_GET("token_owner", token_id)`
- `MAP_GET("token_expiry", token_id) <= CONTEXT_BLOCK_HEIGHT()`
- `price_per_year * years <= 0`
- `CALL(currency_contract_id, "transfer", [CONTRACT_ID(), total_price]) != 1`
- `years * BLOCKS_PER_YEAR <= 0`
- `MAP_GET("token_expiry", token_id) + (years * BLOCKS_PER_YEAR) > CONTEXT_BLOCK_HEIGHT() + MAX_REGISTRATION_BLOCKS`

Return type: u64 — `1` on success, `0` on failure.

## 3. Getters
### `owner_of(token_id: Str)`
Returns the stored owner address for a token id.

Return type: Str — returns the value of `MAP_GET("token_owner", token_id)` (empty string if not set).

### `token_uri(token_id: Str)`
Returns the token metadata URI by concatenating `uri_prefix` and `token_id`.

Return type: Str — the concatenated URI (`uri_prefix + token_id`); returns an empty string when the token does not exist.

### `exists(token_id: Str)`
Returns whether a token id is marked as existing in storage.

Return type: u64 — numeric flag `1` if the `token_exists` map has the entry, `0` otherwise.

### `get_name()`
Returns the NFT collection name.

Return type: Str — the collection `name`.

### `get_symbol()`
Returns the NFT collection symbol.

Return type: Str — the collection `symbol`.

### `get_uri_prefix()`
Returns the URI prefix used to build token metadata URLs.

Return type: Str — the configured `uri_prefix`.

### `get_currency_contract_id()`
Returns the configured payment token contract id.

Return type: Str — the configured payment currency contract id.

### `get_price_per_year()`
Returns the current yearly registration price.

Return type: u64 — the price per year; `0` indicates pricing has not been set.

### `get_owner()`
Returns the current contract owner address.

Return type: Str — the contract owner address.

### `get_total_supply()`
Returns the current number of existing tokens.

Return type: u64 — the total number of tokens (0 if none exist).

### `is_paused()`
Returns whether the contract is paused.

Return type: u64 — `1` indicates paused; `0` indicates not paused.

### `get_expiry(token_id: Str)`
Returns the stored expiry block height for a token id.

Return type: u64 — the expiry block height for `token_id` (0 when not set).

### `is_registered(token_id: Str)`
Returns whether a token both exists and has not yet expired.

Return type: u64 — `1` indicates the token exists and `token_expiry > CONTEXT_BLOCK_HEIGHT()`, otherwise `0`.

### `get_all_tokens()`
Returns the full `token_owner` map.

Return type: List<{ key: Str, value: Str }> — list of all `token_owner` entries where `key` is `token_id` and `value` is the owner address.

### `get_all_expiries()`
Returns the full `token_expiry` map.

Return type: List<{ key: Str, value: u64 }> — list of all `token_expiry` entries where `key` is `token_id` and `value` is the expiry block height.