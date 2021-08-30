import React, { Component } from 'react';
import axios from 'axios';
import "../../helpers/iframeLoader.js";
import DOMHelper from '../../helpers/dom-helper.js';
import EditorText from '../editorText';
import UIkit from 'uikit';
import Spinner from '../spinner';
import ConfirmModal from '../confim-modal';
import ChooseModal from '../choose-modal';

export default class Editor extends Component {
    constructor() {
        super();
        this.currentPage = 'index.html';
    }
    state = {
        pageList: [],
        newPageName: '',
        loading: true
    }

    componentDidMount() {
        this.init(null , this.currentPage);
    }

    init = (e, page) => {
        if(e) {
            e.preventDefault();
        }
        this.isLoading();
        this.iframe = document.querySelector('#iframe');
        this.open(page, this.isLoaded);
        this.loadPageList();
    }

    open(page, cb) {
        this.currentPage = page;

        axios
        .get(`../${page}?rnd=${Math.random()}`)
        .then(res => DOMHelper.parseStringToDom(res.data))
        .then(DOMHelper.wrapTextNodes)
        .then(dom => {
            this.virtualDom = dom;
            return dom;
        })
        .then(DOMHelper.serializeDOMToString)
        .then(html => axios.post("./api/saveTempPage.php", {html}))
        .then(() => this.iframe.load("../gh4rhbgrfbnfdgsasrr.html"))
        .then(() => axios.post("./api/deleteTempPage.php"))
        .then(() => this.enableEditing())
        .then(() => this.injectStyles())
        .then(cb);
    }

    save = (onSuccess, onError) => {
        this.isLoading();
        const newDom = this.virtualDom.cloneNode(this.virtualDom);
        DOMHelper.unwrapTextNodes(newDom);
        const html = DOMHelper.serializeDOMToString(newDom);
        axios
        .post('./api/savePage.php', {pageName: this.currentPage, html})
        .then(onSuccess)
        .catch(onError)
        .finally(this.isLoaded);
    }

    enableEditing() {
        this.iframe.contentDocument.body.querySelectorAll("text-editor").forEach(elem => {
            const id = elem.getAttribute("nodeid");
            const virtualElem = this.virtualDom.body.querySelector(`[nodeid="${id}"]`);

            new EditorText(elem, virtualElem);
        })
    }

    injectStyles() {
        const style = this.iframe.contentDocument.createElement('style');
        style.innerHTML =`
            text-editor:hover {
                outline: 3px solid orange;
                outline-offset: 8px;
            }
            text-editor:focus {
                outline: 3px solid red;
                outline-offset: 8px;
            }
        `;
        this.iframe.contentDocument.head.appendChild(style);
    }

    loadPageList() {
        axios
        .get('./api/pageList.php')
        .then(res => this.setState({pageList: res.data}))
        .catch(e => console.log(e));
    }

    createNewPage = () => {
        axios
            .post("./api/createNewPage.php", {"name": this.state.newPageName})
            .then(this.loadPageList())
            .catch(() => alert("Страница уже существует!"));
    }

    deletePage = (page) => {
        axios
        .post('./api/deletePage.php', {"name": page})
        .then(this.loadPageList())
        .catch(() => alert("Страница не существует!"));
    }

    isLoading = () => {
        this.setState({
            loading: true
        });
    }

    isLoaded = () => {
        this.setState({
            loading: false
        })
    }

    render () {
        const {loading, pageList} = this.state;
        const modal = true;
        let spinner;

        loading ? spinner = <Spinner active/> : spinner = <Spinner />;


        return (
            <>
                <iframe id='iframe' src={this.currentPage} frameBorder="0"></iframe>

                {spinner}

                <div className='panel'>
                    <button uk-toggle="target: #modal-open" className="uk-button uk-button-primary uk-margin-small-right">Открыть</button>
                    <button uk-toggle="target: #modal-save" className="uk-button uk-button-primary">Опубликовать</button>
                </div>
                <ConfirmModal modal={modal} target={'modal-save'} method={this.save}/>
                <ChooseModal  modal={modal} target={'modal-open'} data={pageList} redirect={this.init}/>
              
            </>
        )
    }

}