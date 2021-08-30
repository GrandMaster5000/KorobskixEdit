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
        this.currentPage = `../${page}`;
        this.iframe.load(this.currentPage, () => {
            const body = this.iframe.contentDocument.body;
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

            textNodes.forEach(node => {
                const wrapper = this.iframe.contentDocument.createElement('text-editor');
                node.parentNode.replaceChild(wrapper, node);
                wrapper.appendChild(node);
                wrapper.contentEditable = 'true';
            });

        });
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