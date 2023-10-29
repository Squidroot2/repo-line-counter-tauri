use serde::{ser::SerializeSeq, Deserialize, Serialize, Serializer};
use std::{path::PathBuf, sync::Arc};

use crate::model::{FileLineSummary, FileLines};

#[derive(Serialize)]
pub struct MetaData {
    success: bool,
    #[serde(rename = "responseMs")]
    response_ms: u128,
}
impl MetaData {
    pub fn create_success_result(response_ms: u128) -> MetaData {
        MetaData {
            success: true,
            response_ms,
        }
    }

    pub fn create_error_result(response_ms: u128) -> MetaData {
        MetaData {
            success: false,
            response_ms,
        }
    }
}
#[derive(Serialize)]
pub struct ErrorResponse {
    meta: MetaData,
    msg: String,
}
impl ErrorResponse {
    pub fn create(msg: String, response_ms: u128) -> ErrorResponse {
        ErrorResponse {
            meta: MetaData::create_error_result(response_ms),
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
    pub fn create(files: Arc<Vec<FileLines>>, summary: FileLineSummary, response_ms: u128) -> ScanDirResponse {
        ScanDirResponse {
            meta: MetaData::create_success_result(response_ms),
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
    pub fn create(data: T, response_ms: u128) -> SimpleResponse<T> {
        SimpleResponse {
            meta: MetaData::create_success_result(response_ms),
            data,
        }
    }
}

#[derive(Serialize)]
pub struct EmptyResponse {
    meta: MetaData,
}
impl EmptyResponse {
    pub fn create(response_ms: u128) -> EmptyResponse {
        EmptyResponse {
            meta: MetaData::create_success_result(response_ms),
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
