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

use super::parser;
use super::yahoo::YahooError;
use crate::util::ser_with_display::ser_with_display;
use async_smtp::smtp::error::Error as AsyncSmtpError;
use async_std::future;
use reacher_fast_socks5::SocksError;
use serde::Serialize;


/// Error occured connecting to this email server via SMTP.
#[derive(Debug, Serialize, Clone)]
#[serde(tag = "type", content = "message")]
// #[derive(Clone)]
pub enum SmtpError {
	/// Error if we're using a SOCKS5 proxy.
	#[serde(serialize_with = "ser_with_display")]
	SocksError(String),
	/// Error when communicating with SMTP server.
	#[serde(serialize_with = "ser_with_display")]
	SmtpError(String),
	/// Time-out error.
	#[serde(serialize_with = "ser_with_display")]
	TimeoutError(future::TimeoutError),
	/// Error when verifying a Yahoo email.
	YahooError(String),
}

impl From<SocksError> for SmtpError {
	fn from(e: SocksError) -> Self {
		SmtpError::SocksError(e.to_string())
	}
}

impl From<future::TimeoutError> for SmtpError {
	fn from(e: future::TimeoutError) -> Self {
		SmtpError::TimeoutError(e)
	}
}

impl From<YahooError> for SmtpError {
	fn from(e: YahooError) -> Self {
		SmtpError::YahooError(e.to_string())
	}
}

impl SmtpError {
	/// Get a human-understandable description of the error, in form of an enum
	/// SmtpErrorDesc.
	pub fn get_description(&self) -> Option<SmtpErrorDesc> {
		match self {
			SmtpError::SmtpError(_) => {
				if parser::is_err_ip_blacklisted(self) {
					Some(SmtpErrorDesc::IpBlacklisted)
				} else if parser::is_err_needs_rdns(self) {
					Some(SmtpErrorDesc::NeedsRDNS)
				} else {
					None
				}
			}
			_ => None,
		}
	}
}

#[derive(Debug, Serialize)]
/// SmtpErrorDesc describes a description of which category the error belongs
/// to.
pub enum SmtpErrorDesc {
	/// The IP is blacklisted.
	IpBlacklisted,
	/// The IP needs a reverse DNS entry.
	NeedsRDNS,
}
