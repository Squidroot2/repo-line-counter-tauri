use crate::model::FileLines;
use std::sync::{Arc, Mutex};

const LOCK_POISONED_MSG: &str = "Last scan results lock poisoned!";
pub type ScanResults = Vec<FileLines>;

#[derive(Default)]
pub struct LastScan {
    pub results: Mutex<Option<Arc<ScanResults>>>,
}

impl LastScan {
    pub fn set_results(&self, new_results: ScanResults) -> Arc<ScanResults> {
        let return_arc = Arc::new(new_results);
        let arc_to_store = return_arc.clone();
        match self.results.lock() {
            Ok(mut guard) => {
                *guard = Some(arc_to_store);
            }
            Err(e) => {
                eprint!("{}: {}", LOCK_POISONED_MSG, e);
                let mut guard = e.into_inner();
                *guard = Some(arc_to_store)
            }
        }
        return_arc
    }
    pub fn get_results(&self) -> Option<Arc<ScanResults>> {
        match self.results.lock() {
            Ok(guard) => match &*guard {
                Some(result_ref) => Some(result_ref.clone()),
                None => None,
            },
            Err(e) => {
                print!("{}: {}", LOCK_POISONED_MSG, e);
                let guard = e.into_inner();
                match &*guard {
                    Some(result_ref) => Some(result_ref.clone()),
                    None => None,
                }
            }
        }
    }
}
