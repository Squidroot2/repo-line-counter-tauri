import Modal from "./Modal";
import { writeCsvCommand } from "../commands";

const ExportDataModal = ({ onClose, hidden }) => {
    const writeCsv = () => {
        writeCsvCommand();
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
