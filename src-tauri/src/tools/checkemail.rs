#![allow(unused_imports)]
#![allow(unused_variables)]
#![allow(dead_code)]
use check_if_email_exists::{check_email,syntax,smtp ,CheckEmailInput, mx, CheckEmailInputProxy,CheckEmailOutput};
use tauri::{App, Window};
use tauri::async_runtime::block_on;
use std::fmt;
use std::time::Duration;
use rand::*;
use futures::future::{Abortable, AbortHandle, Aborted}; 
use serde::Serialize;
use std::sync::mpsc::{Sender, Receiver};
use std::sync::mpsc;
use std::thread;
#[derive(Serialize)]
pub enum ReachableType {
	/// The email is safe to send.
	Safe,
	/// The email address appears to exist, but has quality issues that may
	/// result in low engagement or a bounce. Emails are classified as risky
	/// when one of the following happens:
	/// - catch-all email,
	/// - disposable email,
	/// - role-based address,
	/// - full inbox.
	Risky,
	/// Emails that don't exist or are syntactically incorrect. Do not send to
	/// these emails.
	Invalid,
	/// We're unable to get a valid response from the recipient's email server.
	Unknown,
}
enum RequestError {
    Faild,
}

impl fmt::Debug for ReachableType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "({})", self)
    }
}
impl fmt::Display for ReachableType {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{:?}", self)
        // or, alternatively:
        // fmt::Debug::fmt(self, f)
    }
}
async fn check(input: CheckEmailInput) -> CheckEmailOutput{
    // Let's say we want to test the deliverability of someone@gmail.com.
    

    // Verify this email, using async/await syntax.
      let result = check_email(&input).await;
    // `result` is a `Vec<CheckEmailOutput>`, where the CheckEmailOutput
    // struct contains all information about our email.
    result
}
#[derive(serde::Serialize, Clone, serde::Deserialize, Debug)]
pub struct Reachable {
    email:String,
    status:String,
    data: String,
}
#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct Reachables {
   pub listemails: Vec<String>,
   pub sender: Option<String>, 
   pub proxyurl: Option<String>,
   pub smpttimeout: Option<i64>,
}

impl Reachables {
    pub async fn checkemails(&self) -> Vec<Reachable> {
        let _this = self;
        let mut results:Vec<Reachable> =  Vec::with_capacity(self.listemails.len());
        let mut children = Vec::new();
        let proxies =  vec![
            // ("205.251.66.56",7497, "", ""),
            // ("37.99.224.225", 7497, "", ""),
            // ("192.99.101.142",7497, "", ""),
            // ("103.53.228.217",7497, "", ""),
            // ("205.251.66.56",7497, "", ""),
            // ("170.238.79.2",7497, "", ""),
            ("socks5.kmoz.dev", 8318, "identityserver4", "4b2606a107223dd0d"),
            ];
        let index = (rand::random::<f32>() * proxies.len() as f32).floor() as usize;
        let myproxy = proxies[index];
        let from_email_received = match _this.sender.clone() {
            Some(m) => {
                if !m.is_empty() {
                    m
                } else {
                    "no-reply@accounts.google.com".into()
                }
            },
            None => "no-reply@accounts.google.com".into()
        };
        let smtptimeout_received = match _this.smpttimeout.clone() {
            Some(m) => {
                if m.abs() > 500 {
                    Duration::from_millis(m.abs() as u64)
                } else {
                    Duration::from_millis(900)
                }
            },
            None => Duration::from_millis(900)
        };
        let proxy_received: CheckEmailInputProxy = match _this.proxyurl.clone() {
            Some(m) => {
                // url:socks5://username:pass@host:port
                let settings_proxy = m.replace("socks5://", "");
                let settings_all: Vec<&str> = settings_proxy.split("@").collect();
                let proxy_auth: Vec<&str> = settings_all[0].split(":").collect();
                let proxy_host_port: Vec<&str> = settings_all.clone()[1].split(":").collect();
                if !proxy_host_port[0].is_empty() && !proxy_host_port[1].is_empty() {
                    if !proxy_auth[0].is_empty() && !proxy_auth[1].is_empty() {
                        // proxy with auth from settings
                         CheckEmailInputProxy {
                            host: proxy_host_port[0].to_string(),
                            port: proxy_host_port[1].parse::<u16>().expect("could not parse port in proxy"),
                            username: Some(proxy_auth[0].to_string()),
                            password: Some(proxy_auth[1].to_string()),
                        }
                    } else {
                        // proxy without auth from settings
                        CheckEmailInputProxy {
                            host: proxy_host_port[0].to_string(),
                            port: proxy_host_port[1].parse::<u16>().expect("could not parse port in proxy"),
                            username: Some("".into()),
                            password: Some("".into()),
                        }
                    }
                } else {
                    CheckEmailInputProxy {         // Use a SOCKS5 proxy to verify the email
                        host: myproxy.0.into(),
                        port: myproxy.1,
                        username: Some(myproxy.2.into()),
                        password: Some(myproxy.3.into()),
                    }
                }
            },
            None => CheckEmailInputProxy {         // Use a SOCKS5 proxy to verify the email
                host: myproxy.0.into(),
                port: myproxy.1,
                username: Some(myproxy.2.into()),
                password: Some(myproxy.3.into()),
            }
        };
        
        // for elem in &self.listemails {
        //     let foundreachable =  check(&elem.to_string(), myproxy).await;
        //     // CheckEmailOutput.is_reachable is_reachable ? is_reachable : ReachableType.Unknown
        //     let thisreachable = &foundreachable.is_reachable;
        //     let is_reachable = format!("{:?}", thisreachable);
        //     results.push(Reachable { email: elem.to_string(), status: is_reachable});
        // }
        let (tx, rx): (Sender<Reachable>, Receiver<Reachable>) = mpsc::channel();
        let __this =  _this.clone();
    for elem in _this.listemails.clone() {
        // The sender endpoint can be copied
        let mut input = CheckEmailInput::new(elem.clone().into());
    // Optionally, we can also tweak the configuration parameters used in the
    // verification.
    // println!("{}",email);
        let hello = elem.split("@").into_iter().nth(1).unwrap();
        input
        .set_from_email(from_email_received.clone()) // Used in the `MAIL FROM:` command
        .set_hello_name(hello.into())   // Used in the `EHLO` command
        .set_proxy(proxy_received.clone())
        // .set_smtp_timeout(smtptimeout_received.clone())
        ;
        let thread_tx = tx.clone();
        let child = thread::spawn(move || {
            block_on(async {
            let foundreachable =  check(input).await;
            let thisreachable = &foundreachable.is_reachable;
            let jsondata =  serde_json::to_string(&foundreachable);
            let is_reachable = format!("{:?}", thisreachable);
            thread_tx.send(Reachable { email: elem.to_string(), status: is_reachable, data: jsondata.unwrap()}).unwrap();
            })
        });
        children.push(child);
    }

    // Here, all the messages are collected
    for _ in 0.._this.listemails.clone().len() {
        // The `recv` method picks a message from the channel
        // `recv` will block the current thread if there are no messages available
        results.push(rx.recv().expect("oops! the recv() panicked"));
    }
    
    // Wait for the threads to complete any remaining work
    for child in children {
        child.join().expect("oops! the child thread panicked");
    }
       return results;
    }

    pub async fn checkemailsbulk(&self) -> Vec<Reachable> {
        let _this = self;
        let mut results:Vec<Reachable> =  Vec::with_capacity(self.listemails.len());
        let mut children = Vec::new();
        let proxies =  vec![
            // ("205.251.66.56",7497, "", ""),
            // ("37.99.224.225", 7497, "", ""),
            // ("192.99.101.142",7497, "", ""),
            // ("103.53.228.217",7497, "", ""),
            // ("205.251.66.56",7497, "", ""),
            // ("170.238.79.2",7497, "", ""),
            ("socks5.kmoz.dev", 8318, "identityserver4", "4b2606a107223dd0d"),
            ];
        let index = (rand::random::<f32>() * proxies.len() as f32).floor() as usize;
        let myproxy = proxies[index];
        let from_email_received = match _this.sender.clone() {
            Some(m) => {
                if !m.is_empty() {
                    m
                } else {
                    "no-reply@accounts.google.com".into()
                }
            },
            None => "no-reply@accounts.google.com".into()
        };
        let smtptimeout_received = match _this.smpttimeout.clone() {
            Some(m) => {
                if m.abs() > 500 {
                    Duration::from_millis(m.abs() as u64)
                } else {
                    Duration::from_millis(900)
                }
            },
            None => Duration::from_millis(900)
        };
        let proxy_received: CheckEmailInputProxy = match _this.proxyurl.clone() {
            Some(m) => {
                // url:socks5://username:pass@host:port
                let settings_proxy = m.replace("socks5://", "");
                let settings_all: Vec<&str> = settings_proxy.split("@").collect();
                let proxy_auth: Vec<&str> = settings_all[0].split(":").collect();
                let proxy_host_port: Vec<&str> = settings_all.clone()[1].split(":").collect();
                if !proxy_host_port[0].is_empty() && !proxy_host_port[1].is_empty() {
                    if !proxy_auth[0].is_empty() && !proxy_auth[1].is_empty() {
                        // proxy with auth from settings
                         CheckEmailInputProxy {
                            host: proxy_host_port[0].to_string(),
                            port: proxy_host_port[1].parse::<u16>().expect("could not parse port in proxy"),
                            username: Some(proxy_auth[0].to_string()),
                            password: Some(proxy_auth[1].to_string()),
                        }
                    } else {
                        // proxy without auth from settings
                        CheckEmailInputProxy {
                            host: proxy_host_port[0].to_string(),
                            port: proxy_host_port[1].parse::<u16>().expect("could not parse port in proxy"),
                            username: Some("".into()),
                            password: Some("".into()),
                        }
                    }
                } else {
                    CheckEmailInputProxy {         // Use a SOCKS5 proxy to verify the email
                        host: myproxy.0.into(),
                        port: myproxy.1,
                        username: Some(myproxy.2.into()),
                        password: Some(myproxy.3.into()),
                    }
                }
            },
            None => CheckEmailInputProxy {         // Use a SOCKS5 proxy to verify the email
                host: myproxy.0.into(),
                port: myproxy.1,
                username: Some(myproxy.2.into()),
                password: Some(myproxy.3.into()),
            }
        };
        
        // for elem in &self.listemails {
        //     let foundreachable =  check(&elem.to_string(), myproxy).await;
        //     // CheckEmailOutput.is_reachable is_reachable ? is_reachable : ReachableType.Unknown
        //     let thisreachable = &foundreachable.is_reachable;
        //     let is_reachable = format!("{:?}", thisreachable);
        //     results.push(Reachable { email: elem.to_string(), status: is_reachable});
        // }
        let (tx, rx): (Sender<Reachable>, Receiver<Reachable>) = mpsc::channel();
        let __this =  _this.clone();
    for elem in _this.listemails.clone() {
        // The sender endpoint can be copied
        let mut input = CheckEmailInput::new(elem.clone().into());
    // Optionally, we can also tweak the configuration parameters used in the
    // verification.
    // println!("{}",email);
        let hello = elem.split("@").into_iter().nth(1).unwrap();
        input
        .set_from_email(from_email_received.clone()) // Used in the `MAIL FROM:` command
        .set_hello_name(hello.into())   // Used in the `EHLO` command
        .set_proxy(proxy_received.clone())
        // .set_smtp_timeout(smtptimeout_received.clone())
        ;
        let thread_tx = tx.clone();
        let child = thread::spawn(move || {
            block_on(async {
            let foundreachable =  check(input).await;
            let thisreachable = &foundreachable.is_reachable;
            let jsondata =  serde_json::to_string(&foundreachable);
            let is_reachable = format!("{:?}", thisreachable);
            thread_tx.send(Reachable { email: elem.to_string(), status: is_reachable, data: jsondata.unwrap()}).unwrap();
            })
        });
        children.push(child);
    }

    // Here, all the messages are collected
    for _ in 0.._this.listemails.clone().len() {
        // The `recv` method picks a message from the channel
        // `recv` will block the current thread if there are no messages available
        results.push(rx.recv().expect("oops! the recv() panicked"));
    }
    
    // Wait for the threads to complete any remaining work
    for child in children {
        child.join().expect("oops! the child thread panicked");
    }
       return results;
    }
}
