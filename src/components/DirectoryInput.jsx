import { useState, useEffect } from "react";
import Modal from "./Modal";
import FileBrowserModal from "./FileBrowserModal";
import { getCwdCommand } from "../commands";

/**
 * Directory Input Component
 * @param {Object} props
 * @param {function(String, boolean) : void} props.onScanStart
 * @param {boolean} props.isScanning
 * @param {string} props.responseTimeText
 * @param {function(): void} props.onClose
 * @param {boolean} props.hidden
 * @returns {React.JSX.Element}
 */
const DirectoryInputModal = ({
    onScanStart,
    isScanning,
    responseTimeText,
    onClose,
    hidden,
}) => {
    /**
     * Path to the directory to be scanned
     * @type {[String, function(String): void]}
     */
    const [directoryPath, setDirectoryPath] = useState("");

    /**
     * Handles the directory path string changing
     * @param {React.ChangeEvent<HTMLInputElement>} event
     */
    const handleDirectoryNameChange = (event) => {
        setDirectoryPath(event.target.value);
    };

    /**
     * Whether the checkbox is selected or not
     * @type {[boolean, function(boolean): void]}
     */
    const [byExtension, setByExtension] = useState(false);

    /**
     * Handles extension checkbox changed
     * @param {React.ChangeEvent<HTMLInputElement>} event
     */
    const handleByExtensionChange = (event) => {
        setByExtension(event.target.checked);
    };

    /**
     * Extension string to filter with
     * @type {[String, function(string): void]}
     */
    const [extension, setExtension] = useState("");

    /**
     * Handles extension string changed
     * @param {React.ChangeEvent<HTMLInputElement>} event
     */
    const handleExtensionChange = (event) => {
        setExtension(event.target.value);
    };

    const [isFileBrowserDisplayed, setIsFileBrowserDisplayed] = useState(false);

    useEffect(() => {
        async function setDefaultDirectoryToCwd() {
            /** @type {SimpleResponse<String>} */
            let response = await getCwdCommand();
            if (response.meta.success) {
                setDirectoryPath(response.data);
            }
        }
        setDefaultDirectoryToCwd();
    }, []);

    return (
        <>
            <Modal
                title="Directory Input"
                footerButtons={[{ label: "Close", onClick: onClose }]}
                hidden={hidden}
                onOverlayClicked={onClose}
            >
                <fieldset>
                    <label htmlFor="directory">Repo Directory: </label>
                    <input
                        id="directory"
                        type="text"
                        value={directoryPath}
                        onChange={handleDirectoryNameChange}
                    />
                    <button
                        onClick={() => {
                            setIsFileBrowserDisplayed(true);
                            console.log(
                                "button clicked: ",
                                isFileBrowserDisplayed,
                            );
                        }}
                    >
                        Browse
                    </button>
                </fieldset>
                <fieldset>
                    <label htmlFor="byExt">Search by extension: </label>
                    <input
                        id="byExt"
                        type="checkbox"
                        onChange={handleByExtensionChange}
                    />
                </fieldset>
                <fieldset hidden={!byExtension}>
                    <label htmlFor="ext">File Extension</label>
                    <input
                        id="ext"
                        type="text"
                        onChange={handleExtensionChange}
                    />
                </fieldset>
                <div className="horizontal">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onScanStart(
                                directoryPath,
                                byExtension ? extension : null,
                            );
                        }}
                        type="submit"
                        disabled={isScanning}
                        className="scan-button"
                    >
                        {isScanning ? "Scanning..." : "Scan"}
                    </button>
                    <p>{responseTimeText}</p>
                </div>
            </Modal>
            {isFileBrowserDisplayed && (
                <FileBrowserModal
                    onClose={(selectedItem) => {
                        setDirectoryPath(selectedItem);
                        setIsFileBrowserDisplayed(false);
                    }}
                    hidden={false}
                    showFiles={false}
                    startLocation={directoryPath}
                />
            )}
        </>
    );
};

export default DirectoryInputModal;
