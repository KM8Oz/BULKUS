mod connect;
mod error;
#[cfg(feature = "headless")]
mod hotmail;
mod parser;
mod yahoo;

use std::default::Default;

use async_smtp::EmailAddress;
use serde::{Deserialize, Serialize};
use trust_dns_proto::rr::Name;

use crate::util::input_output::CheckEmailInput;
use connect::{ check_smtp_without_retry};
pub use error::*;

/// Details that we gathered from connecting to this email via SMTP
#[derive(Debug, Default, Deserialize, Serialize)]
pub struct SmtpDetails {
	/// Are we able to connect to the SMTP server?
	pub can_connect_smtp: bool,
	/// Is this email account's inbox full?
	pub has_full_inbox: bool,
	/// Does this domain have a catch-all email address?
	pub is_catch_all: bool,
	/// Can we send an email to this address?
	pub is_deliverable: bool,
	/// Is the email blocked or disabled by the provider?
	pub is_disabled: bool,
}

/// Get all email details we can from one single `EmailAddress`, without
/// retries.
pub async fn check_smtp(
	to_email: &EmailAddress,
	host: &Name,
	port: u16,
	domain: &str,
	input: &CheckEmailInput,
) -> Result<SmtpDetails, SmtpError> {
	let host_lowercase = host.to_lowercase().to_string();
	// FIXME Is this `contains` too lenient?
	if input.yahoo_use_api && host_lowercase.contains("yahoo") {
		return yahoo::check_yahoo(to_email, input)
			.await
			.map_err(|err| err.into());
	}
	#[cfg(feature = "headless")]
	if let Some(webdriver) = &input.hotmail_use_headless {
		if host_lowercase.contains("outlook") {
			return hotmail::check_password_recovery(to_email, webdriver)
				.await
				.map_err(|err| err.into());
		}
	}

	check_smtp_without_retry(to_email, host, port, domain, input).await
}

#[cfg(test)]
mod tests {
	use super::{check_smtp, CheckEmailInput, SmtpError};
	use async_smtp::EmailAddress;
	use std::{str::FromStr, time::Duration};
	use tokio::runtime::Runtime;
	use trust_dns_proto::rr::Name;

	#[test]
	fn should_timeout() {
		let runtime = Runtime::new().unwrap();

		let to_email = EmailAddress::from_str("foo@gmail.com").unwrap();
		let host = Name::from_str("gmail.com").unwrap();
		let mut input = CheckEmailInput::default();
		input.set_smtp_timeout(Duration::from_millis(1));

		let res = runtime.block_on(check_smtp(&to_email, &host, 25, "gmail.com", &input));
		match res {
			Err(SmtpError::TimeoutError(_)) => (),
			_ => panic!("check_smtp did not time out"),
		}
	}
}
