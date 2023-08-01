import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Index} from "./index.js";
import {Balance} from "../services/balance";

export class ChangeIncomeExpense{
    constructor() {
        this.categories = null;
        this.operation = null;
        this.typeSelectElement = null;
        this.typeOptionElements = null;
        this.categorySelectElement = null;
        this.categoryOptionElements = null;
        this.amountInputElement = null;
        this.dateInputElement = null;
        this.commentInputElement = null;
        this.changeButton = null;

        this.init();
    }

    async init(){
        this.typeSelectElement = document.getElementById('type-select');
        this.typeOptionElements = document.querySelectorAll('.type-option');
        this.categorySelectElement = document.getElementById('category-select');
        this.amountInputElement = document.getElementById('amount-input');
        this.amountValidateError = document.getElementById('amount-validate-error');
        this.dateInputElement = document.getElementById('date-input');
        this.commentInputElement = document.getElementById('comment-input');
        this.changeButton = document.getElementById('change-button');
        this.requiredFormElements = document.getElementById('form').querySelectorAll("[required]");
        const that = this;
        Index.setBalance();

        const id = window.location.hash.split('?id=')[1];

        this.getOperation(id);

        this.typeSelectElement.onchange = function(){
            that.typeOptionElements.forEach(option => {
                if(option.selected){
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


        this.changeButton.onclick = function(){
            that.processEditOperation(id);
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
            this.changeButton.classList.remove('disabled');
        }else{
            this.changeButton.classList.add('disabled');

        }
    }

    async getCategories(categoryType){
        try {
            const result = await CustomHttp.request(config.host + '/categories/' + categoryType, 'GET');
            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                this.categories = result;
                this.clearCategoriesInOption();
                this.showCategoriesInOption(result);
                this.categoryOptionElements = document.querySelectorAll('#category-select option');
                this.categoryOptionElements.forEach(option => {
                    if(option.innerText === this.operation.category){
                        this.categorySelectElement.value = option.value;
                    }
                })

            }
        } catch (error) {
            return console.log(error);
        }
    }

    showCategoriesInOption(categoriesArr){
        const that = this;

        const selectedOption = document.createElement('option');
        selectedOption.setAttribute('selected', 'selected');
        selectedOption.setAttribute('disabled', 'disabled');
        selectedOption.innerText = 'Категории...';
        this.categorySelectElement.appendChild(selectedOption);

        categoriesArr.forEach(category => {
            const categoryOptionElement = document.createElement('option');
            categoryOptionElement.setAttribute('value', category.id);
            categoryOptionElement.className = 'category-option';
            categoryOptionElement.innerText = category.title;

            this.categorySelectElement.appendChild(categoryOptionElement);
        })
    }

    clearCategoriesInOption(){
        this.categorySelectElement = document.getElementById('category-select');
        this.categorySelectElement.innerHTML = '';
    }

    async getOperation(id){
        try {
            const result = await CustomHttp.request(config.host + '/operations/'+ id, 'GET');
            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                this.operation = result;
                this.getCategories(result.type)
                this.autocompleteFields(result);


            }
        } catch (error) {
            return console.log(error);
        }
    }

    async processEditOperation(id){
        const moment = require('moment');
        const date = moment(this.dateInputElement.value, 'DD.MM.YYYY').format('YYYY-MM-DD');


        try {
            const result = await CustomHttp.request(config.host + '/operations/' + id, 'PUT', {
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

    autocompleteFields(operation){
        const moment = require('moment');

        this.typeSelectElement.value = operation.type;
        this.categorySelectElement.value = operation.category;
        this.amountInputElement.value = operation.amount;
        this.dateInputElement.value = moment(operation.date, 'YYYY-MM-DD').format('DD.MM.YYYY');
        this.commentInputElement.value = operation.comment;

        this.validateRequiredFields();
    }

}