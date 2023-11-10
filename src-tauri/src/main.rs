// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod command;
mod dto;
mod filedata;
mod filesystem;
mod filewriter;
mod model;
mod pathmatcher;
mod state;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            command::scan_dir_command,
            command::get_cwd_command,
            command::write_csv_command,
            command::get_child_items_command,
            command::get_normal_path_command,
            command::get_item_type_command,
        ])
        .manage(state::LastScan::default())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
