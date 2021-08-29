import React, { Component } from 'react';
import axios from 'axios';

export default class Editor extends Component {
    state = {
        pageList: [],
        newPageName: ''
    }

    componentDidMount() {
        this.loadPageList();
    }

    loadPageList() {
        axios
        .get('./api')
        .then(res => this.setState({pageList: res.data}))
        .catch(e => console.log(e));
        console.log(this.state.pageList);
    }

    createNewPage = () => {
        axios
            .post("./api/createNewPage.php", {"name": this.state.newPageName})
            .then(this.loadPageList())
            .catch(() => alert("Страница уже существует!"));
    }

    render() {
        const {pageList, newPageName} = this.state;
        const pages = pageList.map(page => {
            return (
                <h1 key={page}>{page}</h1>
            )
        })
        return (
            <>
                <input 
                onChange={e => this.setState({newPageName: e.target.value})} 
                value={newPageName} 
                type="text" />
                <button onClick={this.createNewPage}>Создать Страницу</button>
                {pages}
            </>
        )
    }

}