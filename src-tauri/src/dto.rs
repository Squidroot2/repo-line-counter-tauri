use serde::{ser::SerializeSeq, Deserialize, Serialize, Serializer};
use std::{path::PathBuf, sync::Arc};

use crate::{
    command::CommandInfo,
    model::{FileLineSummary, FileLines},
};

#[derive(Serialize)]
pub struct MetaData {
    success: bool,
    #[serde(rename = "responseMs")]
    response_ms: u128,
    command: String,
    args: String,
}
impl MetaData {
    fn new(success: bool, info: CommandInfo) -> Self {
        let CommandInfo { start, name, arg_info } = info;
        MetaData {
            success,
            response_ms: start.elapsed().as_millis(),
            command: name,
            args: arg_info.unwrap_or_default(),
        }
    }

    pub fn create_success_result(info: CommandInfo) -> MetaData {
        MetaData::new(true, info)
    }

    pub fn create_error_result(info: CommandInfo) -> MetaData {
        MetaData::new(false, info)
    }
}
#[derive(Serialize)]
pub struct ErrorResponse {
    meta: MetaData,
    msg: String,
}
impl ErrorResponse {
    pub fn create(msg: String, info: CommandInfo) -> ErrorResponse {
        ErrorResponse {
            meta: MetaData::create_error_result(info),
            msg,
        }
    }
}

#[derive(Serialize)]
pub struct ScanDirResponse {
    meta: MetaData,
    #[serde[serialize_with = "serialize_arc_vec"]]
    files: Arc<Vec<FileLines>>,
    summary: FileLineSummary,
}

impl ScanDirResponse {
    pub fn create(files: Arc<Vec<FileLines>>, summary: FileLineSummary, info: CommandInfo) -> ScanDirResponse {
        ScanDirResponse {
            meta: MetaData::create_success_result(info),
            files,
            summary,
        }
    }
}
fn serialize_arc_vec<S>(arc: &Arc<Vec<FileLines>>, serializer: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    let mut seq = serializer.serialize_seq(Some(arc.len()))?;

    for item in arc.iter() {
        seq.serialize_element(item)?;
    }
    seq.end()
}

#[derive(Serialize)]
pub struct SimpleResponse<T> {
    meta: MetaData,
    data: T,
}
impl<T> SimpleResponse<T> {
    pub fn create(data: T, info: CommandInfo) -> SimpleResponse<T> {
        SimpleResponse {
            meta: MetaData::create_success_result(info),
            data,
        }
    }
}

#[derive(Serialize)]
pub struct EmptyResponse {
    meta: MetaData,
}
impl EmptyResponse {
    pub fn create(info: CommandInfo) -> EmptyResponse {
        EmptyResponse {
            meta: MetaData::create_success_result(info),
        }
    }
}

#[derive(Deserialize)]
pub struct ScanDirRequest {
    pub dir: PathBuf,
    pub ext: Option<String>,
}

#[derive(Deserialize)]
pub struct GetChildItemsRequest {
    pub dir: PathBuf,
    #[serde(rename = "includeFiles")]
    pub include_files: bool,
}

#[derive(Deserialize)]
pub struct GetNormalPathRequest {
    #[serde(rename = "parentPath")]
    pub parent_path: PathBuf,
    #[serde(rename = "childName")]
    pub child_name: PathBuf,
}
