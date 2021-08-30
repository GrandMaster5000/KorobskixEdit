import React, { Component } from 'react';
import axios from 'axios';
import "../../helpers/iframeLoader.js";

export default class Editor extends Component {
    constructor() {
        super();
        this.currentPage = 'index.html';
    }
    state = {
        pageList: [],
        newPageName: ''
    }

    componentDidMount() {
        this.init(this.currentPage);
    }

    init(page) {
        this.iframe = document.querySelector('iframe');
        this.open(page);
        this.loadPageList();
    }

    open(page) {
        this.currentPage = `../${page}?rnd=${Math.random()}`;

        axios
        .get(`../${page}`)
        .then(res => this.parseStringToDom(res.data))
        .then(this.wrapTextNodes)
        .then(dom => {
            this.virtualDom = dom;
            return dom;
        })
        .then(this.serializeDOMToString)
        .then(html => axios.post("./api/saveTempPage.php", {html}))
        .then(() => this.iframe.load("../temp.html"))
        .then(() => this.enableEditing());
    }

    enableEditing() {
        this.iframe.contentDocument.body.querySelectorAll("text-editor").forEach(elem => {
            elem.contentEditable = 'true';
            elem.addEventListener('input', () => {
                this.onTextEdit(elem);
            });
        })
    }

    onTextEdit(elem) {
        const id = elem.getAttribute("nodeid");
        this.virtualDom.body.querySelector(`[nodeid="${id}"]`).innerHTML = elem.innerHTML;
        
    }

    parseStringToDom(str) {
        const parser = new DOMParser();
        return parser.parseFromString(str, "text/html");
    }

    wrapTextNodes(dom) {
        const body = dom.body;
        let textNodes = [];

        const recursy = (elem) => {
            elem.childNodes.forEach(node => {
                if(node.nodeName === "#text" && node.nodeValue.replace(/\s+/g, "").length > 0) {
                    textNodes.push(node);
                } else {
                    recursy(node);
                }
            })
        }

        recursy(body);

        textNodes.forEach((node, i) => {
            const wrapper = dom.createElement('text-editor');
            node.parentNode.replaceChild(wrapper, node);
            wrapper.appendChild(node);
            wrapper.setAttribute('nodeid', i)
        });

        return dom;
    }

    serializeDOMToString(dom) {
        const serializer = new XMLSerializer();
        return serializer.serializeToString(dom);
    }

    loadPageList() {
        axios
        .get('./api')
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

    render() {
        return (
            <iframe src={this.currentPage} frameBorder="0"></iframe>
        )
    }

}