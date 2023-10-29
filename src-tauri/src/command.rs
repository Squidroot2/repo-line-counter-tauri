use csv::Writer;
use std::env;
use std::fs;
use std::path::PathBuf;
use std::time::Instant;
use tauri::State;

use crate::dto::{EmptyResponse, ErrorResponse, GetChildItemsRequest, ScanDirRequest, ScanDirResponse, SimpleResponse};
use crate::filedata;
use crate::model::FsItemInfo;
use crate::state::LastScan;

/// Note: Current implementation of this command will never return an ErrorResponse
#[tauri::command(async)]
pub async fn scan_dir<'r>(request: ScanDirRequest, last_scan: State<'r, LastScan>) -> Result<ScanDirResponse, ErrorResponse> {
    println!("Request received");
    let start = Instant::now();
    let (file_lines, summary) = filedata::scan_and_summarize(request.dir, request.ext.map(|e| e.into())).await;

    let file_lines = last_scan.set_results(file_lines);

    println!("Sending reponse (Completed in {}ms)", start.elapsed().as_millis());
    Ok(ScanDirResponse::create(file_lines, summary, start.elapsed().as_millis()))
}

#[tauri::command(async)]
pub fn get_cwd() -> Result<SimpleResponse<PathBuf>, ErrorResponse> {
    let start = Instant::now();
    match env::current_dir() {
        Ok(path) => Ok(SimpleResponse::create(path, start.elapsed().as_millis())),
        Err(e) => Err(ErrorResponse::create(e.to_string(), start.elapsed().as_millis())),
    }
}

#[tauri::command(async)]
pub fn write_csv(last_scan: State<LastScan>) -> Result<EmptyResponse, ErrorResponse> {
    let start = Instant::now();
    let cwd = match env::current_dir() {
        Ok(path) => path,
        Err(error) => {
            return Err(ErrorResponse::create(
                format!("Could not get current directory: {}", error),
                start.elapsed().as_millis(),
            ))
        }
    };
    let data_to_write_rc = match last_scan.get_results() {
        Some(arc) => arc,
        None => {
            return Err(ErrorResponse::create(
                format!("No previous scan results"),
                start.elapsed().as_millis(),
            ))
        }
    };

    let out_file = cwd.join("out.csv");
    let mut writer = match Writer::from_path(&out_file) {
        Ok(writer) => writer,
        Err(error) => {
            return Err(ErrorResponse::create(
                format!("Could not get open file ({}) for writing: {}", out_file.display(), error),
                start.elapsed().as_millis(),
            ))
        }
    };

    for fl in data_to_write_rc.as_ref() {
        if let Err(error) = writer.serialize(fl) {
            return Err(ErrorResponse::create(
                format!("Could not serialize data: {}", error),
                start.elapsed().as_millis(),
            ));
        }
    }
    if let Err(error) = writer.flush() {
        return Err(ErrorResponse::create(
            format!("Error while flushing the writer: {}", error),
            start.elapsed().as_millis(),
        ));
    }
    Ok(EmptyResponse::create(start.elapsed().as_millis()))
}

#[tauri::command(async)]
pub fn get_child_items(request: GetChildItemsRequest) -> Result<SimpleResponse<Vec<FsItemInfo>>, ErrorResponse> {
    let start = Instant::now();
    let dir = match request.dir.is_dir() {
        true => request.dir,
        false => {
            return Err(ErrorResponse::create(
                format!("'{}' is not a directory", request.dir.display()),
                start.elapsed().as_millis(),
            ))
        }
    };
    let dir = match dir.canonicalize() {
        Ok(absolute_dir) => absolute_dir,
        Err(e) => {
            return Err(ErrorResponse::create(
                format!("Failed to canonicalize directory: {e}"),
                start.elapsed().as_millis(),
            ))
        }
    };
    let dir_reader = match fs::read_dir(&dir) {
        Ok(dir_reader) => dir_reader,
        Err(e) => {
            return Err(ErrorResponse::create(
                format!("Cannot read directory: {e}"),
                start.elapsed().as_millis(),
            ))
        }
    };

    let mut contents = Vec::<FsItemInfo>::new();

    if dir.parent().is_some() {
        contents.push(FsItemInfo::parent_dir());
    }

    contents.extend(
        dir_reader
            .filter_map(Result::ok)
            .map(|entry| entry.path())
            .filter(|path| path.is_dir() || request.include_files)
            .map(|full_path| FsItemInfo::create_from_base(&full_path, &dir))
            .filter_map(Result::ok),
    );

    Ok(SimpleResponse::create(contents, start.elapsed().as_millis()))
}
