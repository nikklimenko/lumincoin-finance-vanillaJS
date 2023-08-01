import {CustomHttp} from "../services/custom-http.js";
import {Auth} from "../services/auth.js";
import config from "../../config/config.js";
import {Balance} from "../services/balance.js";
import Chart from 'chart.js/auto';

import moment from "moment";


export class Index {

    constructor() {


        this.init();
    }

    async init() {
        this.sideBarMenuButtons = document.querySelectorAll('.menu-link');

        this.sideBarDropDownBtn = document.getElementById('dropdown-link');
        this.sideBarDropDownElement = document.getElementById('open-dropdown');
        this.sideBarDropDownButtons = document.querySelectorAll('.menu-dropdown-link');
        this.userProfileFullName = document.getElementById('user-full-name');
        this.dropdownLinkIncome = document.getElementById('dropdown-link-income');
        this.dropdownLinkExpense = document.getElementById('dropdown-link-expense');
        this.chartIncomeElement = document.getElementById('chart-income');
        this.chartExpenseElement = document.getElementById('chart-expense');
        this.chartIncome = null;
        this.chartExpense = null;


        await Index.setBalance();

        this.filter();

        // this.showChertPie();
        this.processSideBarMenu();
        this.getUserProfileData();

    }

    showChertPieIncome(data){
        const ctx = this.chartIncomeElement;

        const new_data = data.reduce((result, {category, amount}) => {
            if(result[category]){
                result[category] += amount;
            }else{
                result[category] = amount;
            }

            return result

        }, {});

        this.chartIncome = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(new_data),
                datasets: [{
                    label: 'Сумма',
                    data: Object.values(new_data),
                    borderWidth: 1
                }]
            },

        });

    }
    showChertPieExpense(data){
        const ctx = this.chartExpenseElement;

        const new_data = data.reduce((result, {category, amount}) => {
            if(result[category]){
                result[category] += amount;
            }else{
                result[category] = amount;
            }

            return result

        }, {});

        this.chartExpense = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(new_data),
                datasets: [{
                    label: 'Сумма',
                    data: Object.values(new_data),
                    borderWidth: 1
                }]
            },

        });

    }

    static async setBalance() {
        this.userBalance = document.getElementById('user-balance');
        this.userBalance.innerText = await Balance.getBalance();

    }

    processSideBarMenu() {
        const that = this;

        this.sideBarDropDownBtn.onclick = function(){
            this.classList.toggle('active-dropdown');
            if (this.classList.contains('active-dropdown')) {
                that.sideBarDropDownElement.style.display = 'block';
            } else {
                that.sideBarDropDownElement.style.display = 'none';
            }
        }

        window.addEventListener('hashchange', (e) => {
            this.sideBarMenuButtons.forEach(item => {
                const href = window.location.hash.split('?')[0];

                if(href !== '#/income' && href !== '#/expense'){
                    that.sideBarDropDownElement.style.display = 'none';
                    that.sideBarDropDownBtn.classList.remove('active-dropdown');
                    this.dropdownLinkIncome.classList.remove('active');
                    this.dropdownLinkExpense.classList.remove('active');
                }

                if(href === '#/income' || href === '#/expense'){
                    that.sideBarDropDownElement.style.display = 'block';
                    that.sideBarDropDownBtn.classList.add('active-dropdown');
                    if(href === '#/income'){
                        this.dropdownLinkIncome.classList.add('active');
                        this.dropdownLinkExpense.classList.remove('active');

                    }
                    if(href === '#/expense'){
                        this.dropdownLinkExpense.classList.add('active');
                        this.dropdownLinkIncome.classList.remove('active');
                    }

                }

                item.classList.remove('active');
                if (href === item.getAttribute('href')) {
                    item.classList.add('active');
                }

            });
        })
    }


    getUserProfileData() {
        const userInfo = Auth.getUserInfo();
        const accessToken = localStorage.getItem(Auth.accessTokenKey);
        if (userInfo && accessToken) {
            this.userProfileFullName.innerText = userInfo.name + ' ' + userInfo.lastName;
        }
    }

    filter() {
        this.datePickerElement = document.getElementById('datepicker');
        this.datepicker = new DateRangePicker(this.datePickerElement, {
            autohide: true,
            language: 'ru',
            format: 'dd.mm.yyyy',
            maxDate: new Date(),
        });

        this.filters = Array.from(document.querySelectorAll('.filter-radio-input'));
        const checkedFilter = this.filters.find(item => item.checked);
        this.filterOperations(checkedFilter.id);

        const that = this;
        this.filters.forEach(filter => {
            filter.onchange = function () {
                that.filterOperations(this.id);
            }
        })

    }

    filterOperations(id) {
        const moment = require('moment');
        let dateFrom = null;
        let dateTo = null;
        const intervalInputs = document.querySelectorAll('.interval-input');
        intervalInputs.forEach(item => item.setAttribute('disabled', 'disabled'));
        const intervalValidateError = document.getElementById('interval-validate-error');
        intervalValidateError.style.display = 'none';
        const that = this;

        if (id !== 'interval'){
            if (id === 'today') {
                dateFrom = moment().format("YYYY-MM-DD");
                dateTo = moment().format("YYYY-MM-DD");
            }
            if (id === 'week') {
                dateFrom = moment().subtract(7, 'days').format("YYYY-MM-DD");
                dateTo = moment().format("YYYY-MM-DD");
            }
            if (id === 'month') {
                dateFrom = moment().subtract(1, 'month').format("YYYY-MM-DD");
                dateTo = moment().format("YYYY-MM-DD");
            }
            if (id === 'year') {
                dateFrom = moment().subtract(1, 'year').format("YYYY-MM-DD");
                dateTo = moment().format("YYYY-MM-DD");
            }
            if (id === 'all') {
                dateFrom = moment().subtract(30, 'year').format("YYYY-MM-DD");
                dateTo = moment().format("YYYY-MM-DD");
            }
            this.showFilteredOperations(dateFrom, dateTo);
        }


        if (id === 'interval') {
            const dateFromInput = document.getElementById('date-from-input');
            const dateToInput = document.getElementById('date-to-input');

            if (dateFromInput.value && dateToInput.value) {
                dateFrom = moment(dateFromInput.value, 'DD.MM.YYYY').format("YYYY-MM-DD");
                dateTo = moment(dateToInput.value, 'DD.MM.YYYY').format("YYYY-MM-DD");
                that.showFilteredOperations(dateFrom, dateTo);
            }

            intervalInputs.forEach(item => {
                item.removeAttribute('disabled');
                item.onblur = function () {
                    if (dateFromInput.value && dateToInput.value) {
                        dateFrom = moment(dateFromInput.value, 'DD.MM.YYYY').format("YYYY-MM-DD");
                        dateTo = moment(dateToInput.value, 'DD.MM.YYYY').format("YYYY-MM-DD");
                        that.showFilteredOperations(dateFrom, dateTo);
                    }
                    if (item.value) {
                        intervalValidateError.style.display = 'none';

                    } else {
                        intervalValidateError.style.display = 'block';
                    }
                };
            });
        }
    }

    async showFilteredOperations(dateFrom, dateTo) {
        try {
            const result = await CustomHttp.request(config.host + '/operations?period=interval&dateFrom=' + dateFrom + '&dateTo=' + dateTo, 'GET');
            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }

                if(this.chartIncome !== null){
                    this.chartIncome.destroy();
                }
                const incomeOperations = result.filter(item => item.type === 'income');
                this.showChertPieIncome(incomeOperations);

                if(this.chartExpense !== null){
                    this.chartExpense.destroy();
                }
                const expenseOperations = result.filter(item => item.type === 'expense');
                this.showChertPieExpense(expenseOperations);
            }
        } catch (error) {
            return console.log(error);
        }
    }

}