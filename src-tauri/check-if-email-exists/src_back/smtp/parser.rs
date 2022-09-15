// /&&/ Reacher - Email Verification
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

//! Parse the SMTP responses to get information about the email address.

use super::error::SmtpError;
// use async_smtp::smtp::error::Error as AsyncSmtpError;

/// is_invalid checks for SMTP responses meaning that the email is invalid,
/// i.e. that the mailbox doesn;t exist.
pub fn is_invalid(e: &str) -> bool {
	// 550 Address rejected
	// 550 5.1.1 : Recipient address rejected
	// 550 5.1.1 : Recipient address rejected: User unknown in virtual alias table
	// 550 5.1.1 <user@domain.com>: Recipient address rejected: User unknown in relay recipient table
	e.contains("address rejected")
		// 550 5.1.1 : Unrouteable address
		|| e.contains("unrouteable")
		// 550 5.1.1 : The email account that you tried to reach does not exist
		|| e.contains("does not exist")
		// 550 invalid address
		// 550 User not local or invalid address – Relay denied
		|| e.contains("invalid address")
		// 5.1.1 Invalid email address
		|| e.contains("invalid email address")
		// 550 Invalid recipient
		|| e.contains("invalid recipient")
		|| e.contains("may not exist")
		|| e.contains("recipient invalid")
		// 550 5.1.1 : Recipient rejected
		|| e.contains("recipient rejected")
		// permanent: 5.1.1 Unknown recipient address
		|| e.contains("unknown recipient address")
		|| e.contains("undeliverable")
		// 550 User unknown
		// 550 5.1.1 <EMAIL> User unknown
		// 550 recipient address rejected: user unknown in local recipient table
		|| e.contains("user unknown")
		// 550 Unknown user
		|| e.contains("unknown user")
		// 5.1.1 Recipient unknown <EMAIL>
		|| e.contains("recipient unknown")
		// 550 5.1.1 No such user - pp
		// 550 No such user here
		|| e.contains("no such user")
		// permanent: 5.1.1 MXIN501 mailbox <EMAIL> unknown (on @virginmedia.com)
		// || e.contains("") TODO Use regex here?
		// 550 5.1.1 : Mailbox not found
		// 550 Unknown address error ‘MAILBOX NOT FOUND’
		|| e.contains("mailbox not found")
		// 550 5.1.1 : Invalid mailbox
		|| e.contains("invalid mailbox")
		// 550 5.1.1 Sorry, no mailbox here by that name
		|| e.contains("no mailbox")
		// 5.2.0 No such mailbox
		|| e.contains("no such mailbox")
		// 550 Requested action not taken: mailbox unavailable
		|| e.contains("mailbox unavailable")
		// 550 5.1.1 Is not a valid mailbox
		|| e.contains("not a valid mailbox")
		// No such recipient here
		|| e.contains("no such recipient")
		// 554 delivery error: This user doesn’t have an account
		|| e.contains("have an account")
		// permanent: Unknown local part <USER> in <USER@flabeg.com> (on @flabeg.com)
		|| e.contains("unknown local part")
		// 5.1.1 RCP-P1 Domain facebook.com no longer available https://www.facebook.com/postmaster/response_codes?ip=3.80.111.155#RCP-P1
		|| e.contains("no longer available")
}

/// Check that the mailbox has a full inbox.
pub fn is_full_inbox(e: &str) -> bool {
	e.contains("insufficient")
	// https://answers.microsoft.com/en-us/outlook_com/forum/all/how-do-i-interpret-the-delivery-failure-message/2f1bf9c0-8b03-4f8f-aacc-5f6ba60a73f3
	|| e.contains("mailbox full")
	// https://answers.microsoft.com/en-us/outlook_com/forum/all/how-do-i-interpret-the-delivery-failure-message/2f1bf9c0-8b03-4f8f-aacc-5f6ba60a73f3
	|| e.contains("quote exceeded")
		|| e.contains("over quota")
		// 550 user has too many messages on the server
		|| e.contains("too many messages")
}

/// Check if the email account has been disabled or blocked by the email
/// provider.
pub fn is_disabled_account(e: &str) -> bool {
	// 554 The email account that you tried to reach is disabled. Learn more at https://support.google.com/mail/?p=DisabledUser"
	e.contains("disabled")
	// 554 delivery error: Sorry your message to [email] cannot be delivered. This account has been disabled or discontinued
	|| e.contains("discontinued")
}

/// Check if the error is an IO "incomplete" error.
pub fn is_err_io_errors(e: &SmtpError) -> bool {
	match e {
		// SmtpError::SmtpError(format!("{:?}", AsyncSmtpError::Io(err))) => err.to_string() == "incomplete",
		SmtpError::SmtpError(_) => true,
		_ => false,
	}
}

/// Check if the IP is blacklisted.
pub fn is_err_ip_blacklisted(e: &SmtpError) -> bool {
	let message: Vec<String> = match e {
		// SmtpError::SmtpError(format!("{:?}",AsyncSmtpError::Transient(r)) | format!("{:?}",AsyncSmtpError::Permanent(r))) => {
		// 	r.message.as_ref()
		// }
		SmtpError::SmtpError(_) => vec![format!("{:?}",e)] ,
		_ => {
			return false;
		}
	};
	let first_line = message[0].to_lowercase();

	// Permanent errors

	// 5.7.1 IP address blacklisted by recipient
	// 5.7.1 Service unavailable; Client host [147.75.45.223] is blacklisted. Visit https://www.sophos.com/en-us/threat-center/ip-lookup.aspx?ip=147.75.45.223 to request delisting
	// 5.3.0 <aaro.peramaa@helsinki.fi>... Mail from 147.75.45.223 rejected by Abusix blacklist
	first_line.contains("blacklist") ||
	// Rejected because 23.129.64.213 is in a black list at b.barracudacentral.org
	first_line.contains("black list") ||
	// 5.7.1 Recipient not authorized, your IP has been found on a block list
	first_line.contains("block list") ||
	// Unable to add <EMAIL> because host 23.129.64.184 is listed on zen.spamhaus.org
	// 5.7.1 Service unavailable, Client host [23.129.64.184] blocked using Spamhaus.
	// 5.7.1 Email cannot be delivered. Reason: Email detected as Spam by spam filters.
	first_line.contains("spam") ||
	// host 23.129.64.216 is listed at combined.mail.abusix.zone (127.0.0.12,
		first_line.contains("abusix") ||
	// 5.7.1 Relaying denied. IP name possibly forged [45.154.35.252]
	// 5.7.1 Relaying denied: You must check for new mail before sending mail. [23.129.64.216]
	first_line.contains("relaying denied") ||
	// 5.7.1 <unknown[23.129.64.100]>: Client host rejected: Access denied
	first_line.contains("access denied") ||
	// sorry, mail from your location [5.79.109.48] is administratively denied (#5.7.1)
	first_line.contains("administratively denied") ||
	// 5.7.606 Access denied, banned sending IP [23.129.64.216]
	first_line.contains("banned") ||
	// Blocked - see https://ipcheck.proofpoint.com/?ip=23.129.64.192
	// 5.7.1 Mail from 23.129.64.183 has been blocked by Trend Micro Email Reputation Service.
	first_line.contains("blocked") ||
	// Connection rejected by policy [7.3] 38206, please visit https://support.symantec.com/en_US/article.TECH246726.html for more details about this error message.
	first_line.contains("connection rejected") ||
	// csi.mimecast.org Poor Reputation Sender. - https://community.mimecast.com/docs/DOC-1369#550 [6ATVl4DjOvSA6XNsWGoUFw.us31]
	// Your access to this mail system has been rejected due to the sending MTA\'s poor reputation. If you believe that this failure is in error, please contact the intended recipient via alternate means.
	first_line.contains("poor reputation") ||
	// JunkMail rejected - (gmail.com) [193.218.118.140]:46615 is in an RBL: http://www.barracudanetworks.com/reputation/?pr=1&ip=193.218.118.140
	first_line.contains("junkmail")||

    // Transient errors

	// Blocked - see https://www.spamcop.net/bl.shtml?23.129.64.211
	first_line.contains("blocked") ||
	// 4.7.1 <EMAIL>: Relay access denied
	first_line.contains("access denied") ||
	// relay not permitted!
	first_line.contains("relay not permitted") ||
	// 23.129.64.216 is not yet authorized to deliver mail from
	first_line.contains("not yet authorized")
}

/// Check if the IP needs a reverse DNS.
pub fn is_err_needs_rdns(e: &SmtpError) -> bool {
	let message: Vec<String> = match e {
		// SmtpError::SmtpError(AsyncSmtpError::Transient(r) | AsyncSmtpError::Permanent(r)) => {
		// 	r.message.as_ref()
		// }
		
		SmtpError::SmtpError(_) => vec![format!("{}","SmtpError")],
		_ => {
			return false;
		}
	};
	let first_line = message[0].to_lowercase();

	// 4.7.25 Client host rejected: cannot find your hostname, [147.75.45.223]
	// 4.7.1 Client host rejected: cannot find your reverse hostname, [147.75.45.223]
	// 5.7.1 Client host rejected: cannot find your reverse hostname, [23.129.64.184]
	first_line.contains("cannot find your reverse hostname") ||
	// You dont seem to have a reverse dns entry. Come back later. You are greylisted for 20 minutes. See http://www.fsf.org/about/systems/greylisting
	first_line.contains("reverse dns entry")
}

#[cfg(test)]
mod tests {

	#[test]
	fn is_invalid_works() {
		use super::is_invalid;

		assert_eq!(
			is_invalid("554 5.7.1 <mta.voipdir.net[]>: Client host rejected: Access denied"),
			false
		);
	}
}
