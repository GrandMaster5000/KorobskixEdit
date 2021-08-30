export default class EditorText {
    constructor(element, virtualElem) {
        this.elem = element;
        this.virtualElem = virtualElem;
        this.elem.addEventListener('click', () => this.onClick());
        this.elem.addEventListener('blur', () => this.onBlur());
        this.elem.addEventListener('keypress', (e) => this.onKeypress(e));
        this.elem.addEventListener('input', () => this.onTextEdit());
    }

    onKeypress(e) {
        if(e.keyCode === 13) {
            this.elem.blur();
        }
    }

    onClick() {
        this.elem.contentEditable = 'true';
        this.elem.focus();
    }

    onBlur() {
        this.elem.removeAttribute('contenteditable');
    }

    onTextEdit() {
        this.virtualElem.innerHTML = this.elem.innerHTML;
    }

}