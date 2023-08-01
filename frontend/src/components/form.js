import {CustomHttp} from "../services/custom-http.js";
import {Auth} from "../services/auth.js";
import config from "../../config/config.js";

export class Form {

    constructor(page) {
        this.processElement = null;
        this.page = page;
        this.rememberMe = document.getElementById('remember');
        this.rememberMeChecked = false;
        this.passwordElement = null;
        this.rePasswordElement = null;

        const accessToken = localStorage.getItem(Auth.accessTokenKey);
        if(accessToken) {
            location.href = '#/';
            return;
        }
        this.fields = [
            {
                name: 'email',
                id: 'email',
                element: null,
                regex: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                valid: false,
            },
            {
                name: 'password',
                id: 'password',
                element: null,
                regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
                valid: false,
            },
        ];
        if (this.page === 'signup') {
            this.fields.unshift(
                {
                    name: 'fullName',
                    id: 'fullName',
                    element: null,
                    regex: /^[A-ZА-Я][a-zа-я]/,
                    valid: false,
                },
                {
                    name: 're-password',
                    id: 're-password',
                    element: null,
                    regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
                    valid: false,
                },
            )
        }

        const that = this;
        this.fields.forEach((item, index) => {
            item.element = document.getElementById(item.id);
            item.element.onchange = function () {

                that.validateField.call(that, item, this);
            }
        });

        this.processElement = document.getElementById('process')
        this.processElement.onclick = function () {
            that.processForm();
        }


        // if (this.page === 'signup') {
        //     this.agreeElement = document.getElementById('agree');
        //     this.agreeElement.onchange = function () {
        //         that.validateForm();
        //     }
        // }
        // if (this.page === 'login') {
        //     this.agreeElement = document.getElementById('remember');
        // }

    }

    validateField(field, element) {

        if (!element.value || !element.value.match(field.regex)) {
            element.nextElementSibling.style.display = 'block';
            element.parentNode.style.borderColor = 'red';
            field.valid = false;
        } else {
            element.nextElementSibling.style.display = 'none';

            element.parentNode.removeAttribute('style');
            field.valid = true;
        }

        if(element.id === 're-password'){
            this.passwordElement = document.getElementById('password');
            if(element.value === this.passwordElement.value){
                element.nextElementSibling.style.display = 'none';
                field.valid = true;
            }else {
                element.nextElementSibling.style.display = 'block';
                field.valid = false;
            }
        }

        this.validateForm();
    }

    validateForm() {
        const validForm = this.fields.every(item => item.valid);
        if (validForm) {
            this.processElement.removeAttribute('disabled');
        } else {
            this.processElement.setAttribute('disabled', 'disabled');
        }
        return validForm;
    }

    async processForm() {

        if (this.validateForm()) {

            const email = this.fields.find(item => (item.name === 'email')).element.value;
            const password = this.fields.find(item => (item.name === 'password')).element.value;

            if (this.page === 'signup') {
                try {
                    const fullName = this.fields.find(item => (item.name === 'fullName')).element.value;
                    const name = fullName.split(' ')[0];
                    const lastName = fullName.split(' ')[1];
                    const passwordRepeat = this.fields.find(item => (item.name === 're-password')).element.value;


                    const result = await CustomHttp.request(config.host + '/signup', "POST", {
                        name: name,
                        lastName: lastName,
                        email: email,
                        password: password,
                        passwordRepeat: passwordRepeat,
                    })

                    if (result) {
                        if (result.error || !result.user) {
                            throw new Error(result.message);
                        }
                    }
                } catch (error) {
                   return console.log(error);
                }
            }
            try {
                if(this.page === 'login'){
                    this.rememberMeChecked = this.rememberMe.checked;
                }

                const result = await CustomHttp.request(config.host + '/login', "POST", {
                    email: email,
                    password: password,
                    rememberMe: this.rememberMeChecked,
                })
                if (result) {
                    if ( result.error || !result.tokens.accessToken || !result.tokens.refreshToken
                        || !result.user || !result.user.name || !result.user.lastName || !result.user.id) {
                        throw new Error(result.message);
                        return;
                    }

                    Auth.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
                    Auth.setUserInfo({
                        name: result.user.name,
                        lastName: result.user.lastName,
                        userId: result.user.id,
                        email: email
                    })
                    location.href = '#/';
                }
            } catch (error) {
                console.log(error);
            }
        }
    }
}
