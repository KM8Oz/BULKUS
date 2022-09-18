#![allow(missing_docs, unused_must_use, dead_code)]
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
#![allow(unused_imports)]
#![allow(unused_variables)]
use std::{
    fs::{self, DirEntry, ReadDir},
    path::Path,
    str::FromStr, thread, sync::{Arc, atomic::AtomicBool, Mutex},
};

use std::sync::mpsc;
use std::sync::mpsc::{Sender, Receiver};
// use koit_toml::{FileDatabase, format::Toml};
use futures::{executor::block_on, future::ok};
use serde_json::{de, json};
use tauri::{Manager, async_runtime::RuntimeHandle};
use tauri_plugin_store::{PluginBuilder, Store, StoreBuilder};
mod database;
mod tools;
pub use database::actions::{set_smtp_config, Database};
use tokio::runtime::EnterGuard;
pub use tools::checkemail::{Reachable, Reachables};
use tools::exel::{self, Data};
use directories::{BaseDirs, UserDirs, ProjectDirs};

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct PassedData2 {
    emails: Vec<Vec<String>>,
    sender: Option<String>,
    proxyurl: Option<String>,
    smtptimout: Option<i64>,
}


#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct PassedData {
    emails: Vec<String>,
    sender: Option<String>,
    proxyurl: Option<String>,
    smtptimout: Option<i64>,
}
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct PassedState {
    loop_state: bool,
}
// #[derive(Clone, serde::Serialize)]
// struct Payload {
//   result: Vec<Reachable>,
// }
#[derive(Default)]
struct AppState {
    loop_state: std::sync::Mutex<bool>,
}
// remember to call `.manage(MyState::default())`
#[tauri::command]
async fn loop_state( 
    window: tauri::Window,
    data: PassedState,
    state: tauri::State<'_, AppState>) -> Result<(), String> {
  *window.state::<AppState>().loop_state.lock().unwrap() = data.loop_state;
  Ok(())
}

#[tauri::command]
async fn checkemails(
    window: tauri::Window,
    data: PassedData,
    database: tauri::State<'_, AppState>,
) -> Result<Vec<Reachable>, String> {
    let fetcher = Reachables {
        listemails: data.emails,
        sender: data.sender,
        proxyurl: data.proxyurl,
        smpttimeout: data.smtptimout,
    };
    // println!("{:?}", fetcher);
    let result = fetcher.checkemails().await;
    Ok(result)
}
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
struct SendedData {
    date: String,
    array: Vec<Vec<String>>,
    file_path: String,
}
#[tauri::command]
async fn export_xlsx(
    window: tauri::Window,
    data: String,
    database: tauri::State<'_, AppState>,
) -> Result<(), String> {
    let my_json =
        serde_json::from_str::<SendedData>(data.as_str()).expect("could not parse data sended!");
    let array = my_json
        .array
        .iter()
        .map(|s| (s[0].clone(), s[1].clone(), s[2].clone(), s[3].clone()))
        .collect::<Vec<(String, String, String, String)>>();
    // print!("json : {:?}", array);
    let this_data = Data {
        date: my_json.date,
        array,
    };
    exel::export_to_xlsx(this_data, my_json.file_path);
    Ok(())
}

fn main() {
    // fix_path_env::fix();
    tauri::Builder::default()
        .manage(AppState { loop_state:Mutex::new(true) })
        .plugin(PluginBuilder::default().build())
        .invoke_handler(tauri::generate_handler![
            checkemails,
            set_smtp_config,
            export_xlsx,
            loop_state
        ])
        .setup(|app| {
            if let Some(user_dirs) = UserDirs::new() {
                app.fs_scope().allow_directory(user_dirs.download_dir().unwrap(), true);
                app.fs_scope().allow_directory(user_dirs.desktop_dir().unwrap(), true);
            };
            let status = Arc::new(AtomicBool::new(false));
            // let window: &dyn raw_window_handle::HasRawWindowHandle = unsafe { std::mem::zeroed() }
            let main_window = app.get_window("main").unwrap();
            let (tx, rx): (Sender<Vec<Reachable>>, Receiver<Vec<Reachable>>) = mpsc::channel();
            // listen to the `event-name` (emitted on the `main` window)
            let main = app.get_window("main").unwrap();
            let id = main_window.listen("checkemails", move |event| {
                let data = event.payload().expect("no data passed");
                let _data:PassedData2 =  serde_json::from_str(data).expect("can't parse data!");
                for list in _data.emails {
                    // parts...
                    let this_state =  &main.state::<AppState>().loop_state;
                    let current_state = *this_state.lock().unwrap();
                    println!("still going bro , state {}", current_state);
                    if !current_state {
                        main.emit_all("job_done", "DONE".to_string()).unwrap();
                        println!("stoped bro! x{}", current_state);
                        break;
                    }
                    let fetcher = Reachables {
                        listemails: list,
                        sender: _data.sender.clone(),
                        proxyurl: _data.proxyurl.clone(),
                        smpttimeout: _data.smtptimout,
                    };
                    let thread_tx = tx.clone();
                    let child = thread::spawn(move || {
                        block_on(async {
                            // ok
                            let res = fetcher.checkemailsbulk().await;
                              // emit the `event-name` event to the `main` window
                              thread_tx.clone().send(res).unwrap();
                        });
                    });
                    let _ = child.join().unwrap();
                                         // emit the `event-name` event to the `main` window
                    let result = rx.recv().expect("oops! the recv() panicked");
                    main.emit_all("next_pack", result).unwrap();
                }
                main.emit_all("job_done", "DONE".to_string()).unwrap();
            });
            
            // unlisten to the event using the `id` returned on the `listen` function
            // an `once` API is also exposed on the `Window` struct
            // main_window.unlisten(id);
            // set_shadow(window, true).expect("Unsupported platform!");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[test]
fn export() -> Result<(), String> {
    let path = std::path::Path::new("./templates/template.xlsx");
    let export_path =
        |name: String| std::path::Path::new(format!("../{}", name).as_str()).to_path_buf();
    print!("path: {:?}", path.to_str());
    let mut template_book = umya_spreadsheet::reader::xlsx::read(path).unwrap();
    let date = "DATE: 9/14/2022, 10:05:00 PM";
    // set data in the header
    let sheet = template_book.get_active_sheet_mut();
    sheet.get_cell_mut("C6").set_value(date);
    let demo_array = vec![
        ("kimo@oldi.dev", "safe", "mx.yande.ru", "false"),
        ("kimo@oldi.dev", "risky", "mx.yande.ru", "false"),
        ("kimo@oldi.dev", "invalid", "mx.yande.ru", "false"),
    ];
    let mut i = 9;
    for (a, e, h, k) in demo_array {
        // AEHK
        let color = match e {
            "safe" => umya_spreadsheet::Color::COLOR_GREEN,
            "risky" => umya_spreadsheet::Color::COLOR_YELLOW,
            "invalid" => umya_spreadsheet::Color::COLOR_RED,
            _ => umya_spreadsheet::Color::COLOR_RED,
        };
        let mut font = umya_spreadsheet::Font::default();
        font.set_bold(true);
        sheet
            .get_cell_mut(format!("A{}", i).as_str())
            .set_value(a)
            .get_style_mut()
            .set_font(font.clone());
        sheet
            .get_cell_mut(format!("E{}", i).as_str())
            .set_value(e)
            .get_style_mut()
            .set_background_color(color)
            .set_font(font.clone());
        sheet
            .get_cell_mut(format!("H{}", i).as_str())
            .set_value(h)
            .get_style_mut()
            .set_font(font.clone());
        sheet
            .get_cell_mut(format!("K{}", i).as_str())
            .set_value(k)
            .get_style_mut()
            .set_font(font.clone());
        i += 1;
    }
    let _ = umya_spreadsheet::writer::xlsx::write(
        &template_book,
        export_path("test.xlsx".into()).as_path(),
    );
    Ok(())
    // let mut book = umya_spreadsheet::new_file();
}
