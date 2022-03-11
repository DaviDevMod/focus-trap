import * as React from 'react';
import * as ReactDOM from 'react-dom';

import './Modal.css';
import { TrapConfig } from '../../../../src/types';
import { useSimpleFocusTrap } from '../../../../src';

interface BackdropProps {
  onClose: () => void;
}

interface ModalOverlayProps {
  children: React.ReactNode;
}

interface ModalProps {
  portalId: string;
  onClose: () => void;
  children: React.ReactNode;
  trapConfig: TrapConfig;
}

const Backdrop = (props: BackdropProps) => {
  return <div className="backdrop" onClick={props.onClose} />;
};

const ModalOverlay = (props: ModalOverlayProps) => {
  return (
    <div id="modalOverlay" role="dialog" className="modal">
      <div className="content">{props.children}</div>
    </div>
  );
};

function Modal(props: ModalProps) {
  useSimpleFocusTrap(props.trapConfig);
  const portalElement = React.useRef<HTMLElement | null>();

  portalElement.current = document.getElementById(props.portalId);

  if (portalElement.current) {
    return (
      <React.Fragment>
        {portalElement.current && ReactDOM.createPortal(<Backdrop onClose={props.onClose} />, portalElement.current)}
        {portalElement.current &&
          ReactDOM.createPortal(<ModalOverlay>{props.children}</ModalOverlay>, portalElement.current)}
      </React.Fragment>
    );
  }
  return null;
}

export default Modal;
