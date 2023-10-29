import "./Modal.css";

/**
 * @typedef FooterButton
 * @property {string} label
 * @property {function():void} onClick
 */

/**
 * Generic modal component
 * @param {Object} props
 * @param {function() : void}  props.closeModal
 * @param {string} props.title
 * @param {React.ReactNode} props.children
 * @param {FooterButton[]} props.footerButtons
 * @param {boolean} props.hidden
 * @param {function(React.MouseEventHandler<HTMLDivElement>):void} props.onOverlayClicked
 */
const Modal = ({
    title,
    children,
    footerButtons,
    hidden,
    onOverlayClicked = () => {},
}) => {
    return (
        <div className="modal" hidden={hidden}>
            <div className="overlay" onClick={onOverlayClicked} />
            <div className="modal-content">
                <div className="modal-header">
                    <h1>{title}</h1>
                </div>
                <div className="modal-body">{children}</div>
                <div className="modal-footer">
                    {footerButtons.map((button, index) => (
                        <button key={index} onClick={button.onClick}>
                            {button.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Modal;
