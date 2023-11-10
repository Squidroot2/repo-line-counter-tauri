use std::{error::Error, fs, path::PathBuf};

use crate::model::FsItemInfo;

pub fn get_directory_content(dir: PathBuf, include_files: bool) -> Result<Vec<FsItemInfo>, Box<dyn Error>> {
    let dir = match dir.is_dir() {
        true => dir,
        false => return Err(format!("'{}' is not a directory", dir.display()).into()),
    };
    let dir = dir.canonicalize()?;

    let dir_reader = fs::read_dir(&dir)?;

    let mut contents = Vec::<FsItemInfo>::new();

    if dir.parent().is_some() {
        contents.push(FsItemInfo::parent_dir());
    }

    contents.extend(
        dir_reader
            .filter_map(Result::ok)
            .map(|entry| entry.path())
            .filter(|path| path.is_dir() || include_files)
            .map(|full_path| FsItemInfo::create_from_base(&full_path, &dir))
            .filter_map(Result::ok),
    );
    Ok(contents)
}
