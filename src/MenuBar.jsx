import "./MenuBar.css";

/**
 *
 * @param {Object} props
 * @param {string} props.text
 * @param {React.MouseEventHandler<HTMLDivElement>} props.onClick
 * @param {boolean} isDisabled
 * @returns
 */
const MenuButton = ({ text, onClick, isDisabled }) => {
    let className = isDisabled
        ? "menu-button menu-button-disabled"
        : "menu-button";

    return (
        <div className={className} onClick={isDisabled ? () => {} : onClick}>
            {text}
        </div>
    );
};
/**
 *
 * @param {Object} props
 * @param {React.MouseEventHandler<HTMLDivElement>} props.openScanDirectory
 * @param {React.MouseEventHandler<HTMLDivElement>} props.openExportModal
 * @param {boolean} props.exportEnabled
 * @returns
 */
const MenuBar = ({ openScanDirectory, openExportModal, exportEnabled }) => {
    return (
        <div className="menu-bar">
            <MenuButton text="Scan Directory" onClick={openScanDirectory} />
            <MenuButton
                text="Export Data"
                onClick={openExportModal}
                isDisabled={!exportEnabled}
            />
        </div>
    );
};

export default MenuBar;
