import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Index} from "./index.js";
import {Balance} from "../services/balance.js";

export class CreateIncomeExpense {
    constructor() {
        this.categories = null;
        this.typeSelectElement = null;
        this.typeOptionElements = null;
        this.categorySelectElement = null;
        this.amountInputElement = null;
        this.dateInputElement = null;
        this.commentInputElement = null;
        this.createButton = null;
        this.requiredFormElements = null;

        this.init();
    }

    async init() {
        this.typeSelectElement = document.getElementById('type-select');
        this.typeOptionElements = document.querySelectorAll('.type-option');
        this.categorySelectElement = document.getElementById('category-select');
        this.amountInputElement = document.getElementById('amount-input');
        this.amountValidateError = document.getElementById('amount-validate-error');
        this.dateInputElement = document.getElementById('date-input');
        this.commentInputElement = document.getElementById('comment-input');
        this.createButton = document.getElementById('create-button');
        this.requiredFormElements = document.getElementById('form').querySelectorAll("[required]");

        Index.setBalance();

        const that = this;

        const type = window.location.hash.split('?type=')[1];
        if (type) {
            this.autocompleteFields(type);
            this.getCategories(type);
        }

        this.typeSelectElement.onchange = function () {
            that.typeOptionElements.forEach(option => {
                if (option.selected) {
                    that.getCategories(option.value)
                }
            })
        }

        const datepicker = new Datepicker(this.dateInputElement, {
            autohide: true,
            language: 'ru',
            format: 'dd.mm.yyyy',
            maxDate: new Date(),
        });


        this.balance = await Balance.getBalance();

        this.validateRequiredFields();

        this.createButton.onclick = function () {
            that.createOperation();
            location.href = '#/income-and-expense'
        }

    }

    validateRequiredFields() {
        const that = this;

        that.typeSelectElement.onchange = function(){
            if(that.typeSelectElement.value === 'income'){
                that.validateRequiredFields();
            }
            if (that.typeSelectElement.value === 'expense' && that.amountInputElement.value > that.balance) {
                that.amountInputElement.classList.add('is-invalid');
                that.amountValidateError.innerText = 'Сумма расхода не может быть больше текущего баланса!'
                that.amountInputElement.value = "";
            }
        }

        that.amountInputElement.onchange = function () {
            if (that.typeSelectElement.value === 'expense' && that.amountInputElement.value > that.balance) {
                that.amountInputElement.classList.add('is-invalid');
                that.amountValidateError.innerText = 'Сумма расхода не может быть больше текущего баланса!'
                that.amountInputElement.value = "";
            } else {
                that.amountInputElement.classList.remove('is-invalid');
            }
            that.validateDisabledButton();
        }

        this.dateInputElement.onblur = function(){
            if (that.dateInputElement.value) {
                that.dateInputElement.classList.remove('is-invalid');
            }
            that.validateDisabledButton();
        }

        this.requiredFormElements.forEach(item => {
            if (!item.value) {
                item.classList.add('is-invalid');
            }

        })

    }

    validateDisabledButton(){
        if(this.typeSelectElement.value && this.categorySelectElement
            && this.amountInputElement.value && this.dateInputElement.value ){
            this.createButton.classList.remove('disabled');
        }else{
            this.createButton.classList.add('disabled');

        }
    }

    async getCategories(categoryType) {
        try {
            const result = await CustomHttp.request(config.host + '/categories/' + categoryType, 'GET');
            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                this.categories = result;
                this.clearCategoriesInOption();
                this.showCategoriesInOption(result);

            }
        } catch (error) {
            return console.log(error);
        }
    }

    showCategoriesInOption(categoriesArr) {
        const that = this;

        // const selectedOption = document.createElement('option');
        // selectedOption.setAttribute('selected', 'selected');
        // selectedOption.setAttribute('disabled', 'disabled');
        // selectedOption.innerText = 'Категории...';
        // this.categorySelectElement.appendChild(selectedOption);

        categoriesArr.forEach(category => {
            const categoryOptionElement = document.createElement('option');
            categoryOptionElement.setAttribute('value', category.id);
            categoryOptionElement.innerText = category.title;

            this.categorySelectElement.appendChild(categoryOptionElement);
        })

    }

    clearCategoriesInOption() {
        this.categorySelectElement = document.getElementById('category-select');
        this.categorySelectElement.innerHTML = '';
    }

    async createOperation() {
        const moment = require('moment');
        const date = moment(this.dateInputElement.value, 'DD.MM.YYYY').format('YYYY-MM-DD');


        try {
            const result = await CustomHttp.request(config.host + '/operations', 'POST', {
                "type": this.typeSelectElement.value,
                "amount": +this.amountInputElement.value,
                "date": date,
                "comment": this.commentInputElement.value ? this.commentInputElement.value : ' ',
                "category_id": +this.categorySelectElement.value,
            });
            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }

            }
        } catch (error) {
            return console.log(error);
        }
    }

    autocompleteFields(type) {
        this.typeSelectElement.value = type;
    }


}