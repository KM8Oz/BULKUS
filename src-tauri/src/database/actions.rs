
use tauri;
pub struct Database;
#[derive(serde::Serialize)]
pub struct CustomResponse {
  message: String,
  other_val: usize,
}

#[tauri::command]
pub async fn set_smtp_config(
  window: tauri::Window,
  host: String,
  port: usize,
  username: String,
  password: String,
  ssl: bool,
  database: tauri::State<'_, Database>,
) -> Result<CustomResponse, String> {
//   println!("Called from {}", window.label());
//   let result: Option<String> = some_other_function().await;
    Ok(CustomResponse {
    message:"res".into(),
    other_val: 42,
  })
}