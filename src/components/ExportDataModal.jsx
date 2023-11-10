import Modal from "./Modal";
import { invoke } from "@tauri-apps/api";

const ExportDataModal = ({ onClose, hidden }) => {
    const writeCsv = () => {
        invoke("write_csv");
    };

    return (
        <Modal
            title="Export Data"
            footerButtons={[{ label: "Close", onClick: onClose }]}
            hidden={hidden}
            onOverlayClicked={onClose}
        >
            <button onClick={writeCsv}>Output To Csv</button>
        </Modal>
    );
};

export default ExportDataModal;
