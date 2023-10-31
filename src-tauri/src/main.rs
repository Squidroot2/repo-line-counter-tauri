// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod command;
mod dto;
mod filedata;
mod model;
mod pathmatcher;
mod state;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            command::scan_dir,
            command::get_cwd,
            command::write_csv,
            command::get_child_items
        ])
        .manage(state::LastScan::default())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
