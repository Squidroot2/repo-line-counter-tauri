import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import "./dtoTypes.js";
import "./App.css";
import FileLinesTable from "./FileLinesTable.jsx";
import DirectoryInputModal from "./DirectoryInput.jsx";
import SummaryTable from "./SummaryTable.jsx";
import MenuBar from "./MenuBar.jsx";
import Title from "./Title.jsx";
import ExportDataModal from "./ExportDataModal.jsx";

/**
 * Main Application Component
 */
const App = () => {
    /** The summary data received from the backend
     * @type {[FileLineSummary, function(String): void]} */
    const [summary, setSummary] = useState({});

    /** Response time string based on data found in ResponseResult */
    const [responseTimeText, setResponseTimeText] = useState("");

    /** The Array of Files lines objects received from the backend
     * @type {[FileLines[], function(FileLines[]): void]} */
    const [filesLines, setFilesLines] = useState([]);

    /** Represents when the backend is scanning a directory*/
    const [isScanning, setIsScanning] = useState(false);

    /** Whether or not a single scan has completed */
    const [didScan, setDidScan] = useState(false);

    /** Show Directory Input Modal */
    const [showDirectoryInput, setShowDirectoryInput] = useState(true);

    /** Show Export Modal */
    const [showExportModal, setShowExportModal] = useState(false);

    /**
     * Calls the request to scan the directory
     * @param {string} directory
     * @param {string | null} ext
     */
    const startScanDir = async (directory, ext) => {
        /**@type {ScanDirRequest} */
        const request = {
            dir: directory,
            ext: ext,
        };
        setIsScanning(true);
        invoke("scan_dir", { request }).then((response) =>
            update_data(response),
        );
    };
    /**
     * Updates the data on the page after getting the response from the backend
     * @param {ScanDirResponse} response
     */
    const update_data = (response) => {
        if (!didScan) {
            setDidScan(true);
        }
        setSummary(response.summary);
        setFilesLines(response.files);
        setIsScanning(false);
        setResponseTimeText(`finished in ${response.meta.responseMs}ms`);
    };

    return (
        <div>
            <Title />
            <MenuBar
                openScanDirectory={() => setShowDirectoryInput(true)}
                openExportModal={() => setShowExportModal(true)}
                exportEnabled={didScan}
            />
            <ExportDataModal
                onClose={() => setShowExportModal(false)}
                hidden={!showExportModal}
            />
            <DirectoryInputModal
                onScanStart={startScanDir}
                isScanning={isScanning}
                responseTimeText={responseTimeText}
                onClose={() => setShowDirectoryInput(false)}
                hidden={!showDirectoryInput}
            />
            <div hidden={!didScan}>
                <SummaryTable summary={summary} />

                <FileLinesTable filesLines={filesLines} />
            </div>
        </div>
    );
};

export default App;
