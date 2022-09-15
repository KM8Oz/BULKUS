// check-if-email-exists
// Copyright (C) 2018-2022 Reacher

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

use super::syntax::SyntaxDetails;
use serde::{Deserialize, Serialize};
use std::default::Default;

const ROLE_ACCOUNTS: &str = include_str!("./util/roles.json");

/// Miscelleanous details about the email address.
#[derive(Debug, Default,Copy, Clone, Deserialize, Serialize)]
pub struct MiscDetails {
	/// Is this a DEA (disposable email account)?
	pub is_disposable: bool,
	/// Is this email a role-based account?
	pub is_role_account: bool,
}

/// Error occured connecting to this email server via SMTP. Right now this
/// enum has no variant, as `check_misc` cannot fail. But putting a placeholder
/// right now to avoid future breaking changes.
#[derive(Debug, Serialize,Copy, Clone)]
#[serde(tag = "type", content = "message")]
pub enum MiscError {}

/// Fetch misc details about the email address, such as whether it's disposable.
pub fn check_misc(syntax: &SyntaxDetails) -> MiscDetails {
	let role_accounts: Vec<&str> =
		serde_json::from_str(ROLE_ACCOUNTS).expect("roles.json is a valid json. qed.");
	let isdispo =  !mailchecker::is_valid(
		syntax
			.address
			.as_ref()
			.unwrap()
			.to_string()
			.as_ref(),
	);
	MiscDetails {
		// mailchecker::is_valid checks also if the syntax is valid. But if
		// we're here, it means we're sure the syntax is valid, so is_valid
		// actually will only check if it's disposable.
		is_disposable: isdispo.clone(),
		is_role_account: role_accounts.contains(&syntax.username.to_lowercase().as_ref()),
	}
}
