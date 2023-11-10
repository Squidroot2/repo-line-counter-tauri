use csv::Writer;
use std::env;
use std::fs;
use std::path::PathBuf;
use std::time::Duration;
use std::time::Instant;
use tauri::State;

use crate::dto::GetNormalPathRequest;
use crate::dto::{EmptyResponse, ErrorResponse, GetChildItemsRequest, ScanDirRequest, ScanDirResponse, SimpleResponse};
use crate::filedata;
use crate::filesystem::get_directory_content;
use crate::filewriter::write_csv_a;
use crate::model::FsItemInfo;
use crate::model::FsItemType;
use crate::state::LastScan;

// TODO rename to append '_command'

/// Note: Current implementation of this command will never return an ErrorResponse
#[tauri::command(async)]
pub async fn scan_dir<'r>(request: ScanDirRequest, last_scan: State<'r, LastScan>) -> Result<ScanDirResponse, ErrorResponse> {
    println!("Request received");
    let info = CommandInfo::start("scan_dir");
    let (file_lines, summary) = filedata::scan_and_summarize(request.dir, request.ext.map(|e| e.into())).await;

    let file_lines = last_scan.set_results(file_lines);

    println!("Sending reponse (Completed in {}ms)", info.start.elapsed().as_millis());
    Ok(ScanDirResponse::create(file_lines, summary, info))
}

#[tauri::command(async)]
pub fn get_cwd() -> Result<SimpleResponse<PathBuf>, ErrorResponse> {
    let info = CommandInfo::start("get_cwd");
    match env::current_dir() {
        Ok(path) => Ok(SimpleResponse::create(path, info)),
        Err(e) => Err(ErrorResponse::create(e.to_string(), info)),
    }
}

#[tauri::command(async)]
pub fn write_csv(last_scan: State<LastScan>) -> Result<EmptyResponse, ErrorResponse> {
    let info = CommandInfo::start("write_csv");
    match write_csv_a(last_scan.get_results()) {
        Ok(_) => Ok(EmptyResponse::create(info)),
        Err(e) => Err(ErrorResponse::create(format!("{e}"), info)),
    }
}

#[tauri::command(async)]
pub fn get_child_items(request: GetChildItemsRequest) -> Result<SimpleResponse<Vec<FsItemInfo>>, ErrorResponse> {
    let info = CommandInfo::start("get_child_items");

    match get_directory_content(request.dir, request.include_files) {
        Ok(contents) => Ok(SimpleResponse::create(contents, info)),
        Err(e) => Err(ErrorResponse::create(format!("{e}"), info)),
    }
}

#[tauri::command(async)]
pub fn get_normal_path(request: GetNormalPathRequest) -> Result<SimpleResponse<PathBuf>, ErrorResponse> {
    let info = CommandInfo::start("get_normal_path"); //TODO arg_info
    let normal_path = match request.parent_path.join(request.child_name).canonicalize() {
        Ok(path) => path,
        Err(e) => {
            return Err(ErrorResponse::create(format!("Failed to canonicalize path: {}", e), info));
        }
    };
    Ok(SimpleResponse::create(normal_path, info))
}

#[tauri::command(async)]
pub fn get_item_type_command(path: PathBuf) -> SimpleResponse<FsItemType> {
    let info = CommandInfo::start_with_args("get_item_type", format!("path: {}", &path.display()));
    SimpleResponse::create(FsItemType::of(&path), info)
}

pub struct CommandInfo {
    pub start: Instant,
    pub name: String,
    pub arg_info: Option<String>,
}

impl CommandInfo {
    fn start<N>(name: N) -> Self
    where
        N: Into<String>,
    {
        CommandInfo {
            start: Instant::now(),
            name: name.into(),
            arg_info: None,
        }
    }
    fn start_with_args<N, A>(name: N, arg_info: A) -> Self
    where
        N: Into<String>,
        A: Into<String>,
    {
        CommandInfo {
            start: Instant::now(),
            name: name.into(),
            arg_info: Some(arg_info.into()),
        }
    }
}
