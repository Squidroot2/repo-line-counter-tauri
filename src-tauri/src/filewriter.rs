use std::{env, error::Error, sync::Arc};

use csv::Writer;

use crate::state::ScanResults;

pub fn write_csv(scan_results: Option<Arc<ScanResults>>) -> Result<(), Box<dyn Error>> {
    let cwd = env::current_dir()?;

    let data_to_write_rc = scan_results.ok_or("No Scan Results found")?;

    let out_file = cwd.join("out.csv");
    let mut writer = Writer::from_path(&out_file)?;

    for fl in data_to_write_rc.as_ref() {
        writer.serialize(fl)?;
    }
    writer.flush()?;

    Ok(())
}
