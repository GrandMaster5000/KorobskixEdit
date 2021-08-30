import React,{useEffect} from 'react';
import ReactDOM from 'react-dom'


const ModalPortal = ({modal, children}) => {
    const modalRoot = document.createElement('div');
    modalRoot.setAttribute('uk-modal', 'true');
    modalRoot.id = modal;
  
    useEffect(() => {
      document.body.appendChild(modalRoot);
      return () => {
        document.body.removeChild(modalRoot);
      }
    });
  
    return ReactDOM.createPortal(children, modalRoot);
  } 
  
  export default ModalPortal;