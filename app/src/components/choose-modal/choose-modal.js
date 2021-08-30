import React from 'react';
import ModalPortal from '../modalPortal';

const ChooseModal = ({target, data, redirect}) => {
        
    const pageList = data.map(item => {
        return (
            <li key={item}>
                <a 
                className="uk-link-muted" 
                href='#'
                onClick={(e) => redirect(e, item)}
                >{item}</a>
            </li>
        )
    })
    
    
    return (
        <ModalPortal modal={target} >
            <div className="uk-modal-dialog uk-modal-body">
                <h2 className="uk-modal-title">Открыть</h2>
                <ul className="uk-list uk-list-striped">
                    {pageList}
                </ul>
                <p className="uk-text-right">
                    <button 
                    className="uk-button uk-button-default uk-modal-close" 
                    type="button"
                    >Отменить</button>
                </p>
            </div>
        </ModalPortal>
    )
}

export default ChooseModal;