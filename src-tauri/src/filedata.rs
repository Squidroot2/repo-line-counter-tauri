use futures::stream::{FuturesUnordered, StreamExt};
use std::collections::VecDeque;
use std::ffi::OsString;
use std::fs;
use std::path::PathBuf;
use std::sync::Arc;
use tauri::async_runtime::Sender;
use tokio::fs::File;
use tokio::io::{AsyncBufReadExt, BufReader};

use crate::model::{FileLineSummary, FileLines};
use crate::pathmatcher::{self, AlwaysMatch, PathMatcher};

pub async fn scan_and_summarize(dir: PathBuf, ext_option: Option<OsString>) -> (Vec<FileLines>, FileLineSummary) {
    let mut file_lines = match ext_option {
        Some(ext) => {
            let matcher = pathmatcher::ext_matcher(ext);
            scan_for_file_lines(dir, matcher).await
        }
        None => scan_for_file_lines(dir, AlwaysMatch::new()).await,
    };
    file_lines.sort_by(|a, b| a.lines.cmp(&b.lines));

    let summary = FileLineSummary::get_summary(&file_lines);

    (file_lines, summary)
}

/**
 Spawns a thread that will recursively search the base_dir and add all files (PathBufs) to a channel.
 Asyncronously processes those PathBufs by reading their length and returning the list of FileLines data structures
*/
async fn scan_for_file_lines<M: 'static>(base_dir: PathBuf, matcher: M) -> Vec<FileLines>
where
    M: PathMatcher + Send,
{
    let (tx, mut rx) = tokio::sync::mpsc::channel(50);

    let base_dir_copy = base_dir.clone();
    tokio::spawn(async move {
        send_files(tx, base_dir_copy, matcher).await;
    });

    let mut file_lines_handles = FuturesUnordered::new();
    let base_dir_ref = Arc::new(base_dir);
    while let Some(received) = rx.recv().await {
        let thread_base_dir_ref = base_dir_ref.clone();
        file_lines_handles.push(tokio::spawn(async move { get_file_lines(thread_base_dir_ref, received).await }))
    }

    let mut file_lines = Vec::new();
    while let Some(result) = file_lines_handles.next().await {
        match result {
            Ok(fl) => file_lines.push(fl),
            Err(e) => eprint!("{}", e),
        }
    }

    file_lines
}

/// Creates a FileLines struct from the given file_path and base_dir. base_dir is to convert the file_path to a relative path
async fn get_file_lines(base_dir: Arc<PathBuf>, file_path: PathBuf) -> FileLines {
    let file = match File::open(&file_path).await {
        Ok(file) => file,
        Err(e) => {
            eprint!("Failed to read {}, {}", file_path.display(), e);
            return FileLines { file: file_path, lines: 0 };
        }
    };

    let mut lines = BufReader::new(file).lines();
    let mut count = 0;
    while let Ok(Some(_)) = lines.next_line().await {
        count += 1
    }

    let file_path = match file_path.strip_prefix(base_dir.as_ref()) {
        Ok(rel_path) => rel_path.to_owned(),
        Err(e) => {
            eprintln!("Could not create relative path. Using full path. {}", e);
            file_path
        }
    };

    FileLines {
        file: file_path,
        lines: count,
    }
}

async fn send_files<M>(sender: Sender<PathBuf>, root_dir: PathBuf, matcher: M)
where
    M: PathMatcher,
{
    let mut dirs_to_process = VecDeque::from([root_dir]);
    while let Some(dir) = dirs_to_process.pop_front() {
        if let Ok(dir_reader) = fs::read_dir(dir) {
            for entry in dir_reader.filter_map(Result::ok) {
                let path = entry.path();
                if path.is_file() {
                    if matcher.matches(&path) {
                        match sender.send(path).await {
                            Ok(_) => {}
                            Err(e) => eprintln!("{}", e),
                        };
                    }
                } else if path.is_dir() {
                    dirs_to_process.push_back(path);
                }
            }
        }
    }
}
