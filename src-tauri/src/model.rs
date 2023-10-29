use serde::{Deserialize, Serialize};
use std::error::Error;
use std::path::{Path, PathBuf};

#[derive(Debug, Serialize, Deserialize)]
pub struct FileLines {
    pub file: PathBuf,
    pub lines: usize,
}

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct FileLineSummary {
    files: usize,
    sum: usize,
    max: usize,
    min: usize,
    mean: f64,
    median: usize,
}

impl FileLineSummary {
    pub fn get_summary(sorted_file_lines: &Vec<FileLines>) -> FileLineSummary {
        let files = sorted_file_lines.len();
        if files == 0 {
            return FileLineSummary::get_empty_summary();
        }
        let sum = sorted_file_lines.iter().map(|a| a.lines).sum();
        let max = sorted_file_lines[files - 1].lines;
        let min = sorted_file_lines[0].lines;

        let mean = sum as f64 / files as f64;
        let median = sorted_file_lines[files / 2].lines;

        FileLineSummary {
            files,
            sum,
            max,
            min,
            mean,
            median,
        }
    }

    fn get_empty_summary() -> FileLineSummary {
        FileLineSummary {
            files: 0,
            sum: 0,
            max: 0,
            min: 0,
            mean: 0.0,
            median: 0,
        }
    }
}
#[derive(Serialize)]
enum FsItemType {
    Dir,
    File,
    Unknown,
}
#[derive(Serialize)]
pub struct FsItemInfo {
    name: PathBuf,
    #[serde(rename = "itemType")]
    item_type: FsItemType,
}

impl FsItemInfo {
    pub fn create_from_base(full_path: &Path, base_path: &Path) -> Result<FsItemInfo, Box<dyn Error>> {
        let name = full_path.strip_prefix(base_path)?.to_owned();
        let item_type: FsItemType = if full_path.is_dir() {
            FsItemType::Dir
        } else if full_path.is_file() {
            FsItemType::File
        } else {
            FsItemType::Unknown
        };
        Ok(FsItemInfo { name, item_type })
    }

    pub fn parent_dir() -> Self {
        FsItemInfo {
            name: PathBuf::from(".."),
            item_type: FsItemType::Dir,
        }
    }
}
