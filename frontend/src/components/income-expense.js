import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Index} from "./index.js";

// import DateRangePicker from 'vanillajs-datepicker/DateRangePicker';


export class IncomeExpense {
    constructor() {
        this.operations = null;
        this.deleteOperationModal = null;
        this.deleteOptionModalBtn = null;
        this.cancelDeleteOptionModalBtn = null;
        this.tBodyElement = null;
        this.trElement = null;
        this.thElement = null;
        this.tdTypeElement = null;
        this.tdCategoryElement = null;
        this.tdAmountElement = null;
        this.tdDateElement = null;
        this.tdCommentElement = null;
        this.tdActionElement = null;
        this.actionEditBtn = null;
        this.actionDeleteBtn = null;
        this.createIncomeButton = null;
        this.createExpenseButton = null;

        this.init();
    }

    async init() {

        await Index.setBalance();
        this.filter();
        this.processButtons();
        // this.showAllOperations();


    }

    processButtons(){
        this.createIncomeButton = document.getElementById('create-income-button');
        this.createExpenseButton = document.getElementById('create-expense-button');

        this.createIncomeButton.onclick = function(){
            location.href = '#/create-income-expense?type=income'
        }
        this.createExpenseButton.onclick = function(){
            location.href = '#/create-income-expense?type=expense'
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


    async deleteOperation(id) {
        try {
            const result = await CustomHttp.request(config.host + '/operations/' + id, 'DELETE');
            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }

            }
        } catch (error) {
            return console.log(error);
        }
    }

    async showAllOperations() {
        try {
            const result = await CustomHttp.request(config.host + '/operations', 'GET');
            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                this.operations = result;
                this.showTable(result);
            }
        } catch (error) {
            return console.log(error);
        }
    }

    async showFilteredOperations(dateFrom, dateTo) {
        try {
            const result = await CustomHttp.request(config.host + '/operations?period=interval&dateFrom=' + dateFrom + '&dateTo=' + dateTo, 'GET');
            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                this.clearTable();
                this.showTable(result);
            }
        } catch (error) {
            return console.log(error);
        }
    }


    async showTable(operations) {
        const moment = require('moment');

        this.deleteOperationModal = document.getElementById('delete-operation-modal');

        operations.forEach((operation, index) => {
            this.tBodyElement = document.getElementById('table-body');

            this.trElement = document.createElement('tr');


            this.thElement = document.createElement('th');
            this.thElement.innerText = index + 1;

            this.tdTypeElement = document.createElement('td');
            if (operation.type === 'income') {
                this.tdTypeElement.className = 'text-success';
                this.tdTypeElement.innerText = 'Доход';
            } else {
                this.tdTypeElement.className = 'text-danger';
                this.tdTypeElement.innerText = 'Расход';
            }


            this.tdCategoryElement = document.createElement('td');
            this.tdCategoryElement.innerText = operation.category;

            this.tdAmountElement = document.createElement('td');
            this.tdAmountElement.innerText = operation.amount + '$';

            this.tdDateElement = document.createElement('td');
            this.tdDateElement.innerText = moment(operation.date, 'YYYY-MM-DD').format('DD.MM.YYYY');

            this.tdCommentElement = document.createElement('td');
            this.tdCommentElement.innerText = operation.comment;

            this.tdActionElement = document.createElement('td');

            // DELETE BTN
            this.actionDeleteBtn = document.createElement('a');
            this.actionDeleteBtn.classList.add('me-2');
            this.actionDeleteBtn.classList.add('text-decoration-none');
            this.actionDeleteBtn.setAttribute('href', 'javascript:void(0)');

            const svgDelete = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svgDelete.setAttribute('width', '14');
            svgDelete.setAttribute('height', '15');
            svgDelete.setAttribute('viewBox', '0 0 14 15');
            svgDelete.setAttribute('fill', 'none');

            const pathDelete1 = document.createElementNS('http://www.w3.org/2000/svg', "path");
            pathDelete1.setAttributeNS(null, "d", "M4.5 5.5C4.77614 5.5 5 5.72386 5 6V12C5 12.2761 4.77614 12.5 4.5 12.5C4.22386 12.5 4 12.2761 4 12V6C4 5.72386 4.22386 5.5 4.5 5.5Z");
            pathDelete1.setAttribute('fill', 'black');

            const pathDelete2 = document.createElementNS('http://www.w3.org/2000/svg', "path");
            pathDelete2.setAttributeNS(null, "d", "M7 5.5C7.27614 5.5 7.5 5.72386 7.5 6V12C7.5 12.2761 7.27614 12.5 7 12.5C6.72386 12.5 6.5 12.2761 6.5 12V6C6.5 5.72386 6.72386 5.5 7 5.5Z");
            pathDelete2.setAttribute('fill', 'black');

            const pathDelete3 = document.createElementNS('http://www.w3.org/2000/svg', "path");
            pathDelete3.setAttributeNS(null, "d", "M10 6C10 5.72386 9.77614 5.5 9.5 5.5C9.22386 5.5 9 5.72386 9 6V12C9 12.2761 9.22386 12.5 9.5 12.5C9.77614 12.5 10 12.2761 10 12V6Z");
            pathDelete3.setAttribute('fill', 'black');

            const pathDelete4 = document.createElementNS('http://www.w3.org/2000/svg', "path");
            pathDelete4.setAttributeNS(null, "d", "M13.5 3C13.5 3.55228 13.0523 4 12.5 4H12V13C12 14.1046 11.1046 15 10 15H4C2.89543 15 2 14.1046 2 13V4H1.5C0.947715 4 0.5 3.55228 0.5 3V2C0.5 1.44772 0.947715 1 1.5 1H5C5 0.447715 5.44772 0 6 0H8C8.55229 0 9 0.447715 9 1H12.5C13.0523 1 13.5 1.44772 13.5 2V3ZM3.11803 4L3 4.05902V13C3 13.5523 3.44772 14 4 14H10C10.5523 14 11 13.5523 11 13V4.05902L10.882 4H3.11803ZM1.5 3V2H12.5V3H1.5Z");
            pathDelete4.setAttribute('fill', 'black');
            pathDelete4.setAttribute('fill-rule', 'evenodd');
            pathDelete4.setAttribute('clip-rule', 'evenodd');

            svgDelete.appendChild(pathDelete1);
            svgDelete.appendChild(pathDelete2);
            svgDelete.appendChild(pathDelete3);
            svgDelete.appendChild(pathDelete4);

            this.actionDeleteBtn.appendChild(svgDelete);

            const that = this;
            this.actionDeleteBtn.onclick = function () {
                that.deleteOperationModal.style.display = 'flex';
                document.body.classList.add('open');
                that.deleteOptionModalBtn = document.getElementById('delete-option-modal-btn');
                that.deleteOptionModalBtn.onclick = function () {
                    that.deleteOperation(operation.id);
                    that.deleteOperationModal.style.display = 'none';
                    document.body.classList.remove('open');
                    location.href = '#/income-and-expense';
                };
                that.cancelDeleteOptionModalBtn = document.getElementById('cancel-delete-option-modal-btn');
                that.cancelDeleteOptionModalBtn.onclick = function () {
                    that.deleteOperationModal.style.display = 'none';
                    document.body.classList.remove('open');

                };
            };
            // END DELETE BTN

            // EDIT BTN
            this.actionEditBtn = document.createElement('a');
            this.actionEditBtn.classList.add('text-decoration-none');
            this.actionEditBtn.setAttribute('href', 'javascript:void(0)');

            const svgEdit = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svgEdit.setAttribute('width', '16');
            svgEdit.setAttribute('height', '16');
            svgEdit.setAttribute('viewBox', '0 0 16 16');
            svgEdit.setAttribute('fill', 'none');

            const pathEdit = document.createElementNS('http://www.w3.org/2000/svg', "path");
            pathEdit.setAttributeNS(null, "d", "M12.1465 0.146447C12.3417 -0.0488155 12.6583 -0.0488155 12.8536 0.146447L15.8536 3.14645C16.0488 3.34171 16.0488 3.65829 15.8536 3.85355L5.85357 13.8536C5.80569 13.9014 5.74858 13.9391 5.68571 13.9642L0.68571 15.9642C0.500001 16.0385 0.287892 15.995 0.146461 15.8536C0.00502989 15.7121 -0.0385071 15.5 0.0357762 15.3143L2.03578 10.3143C2.06092 10.2514 2.09858 10.1943 2.14646 10.1464L12.1465 0.146447ZM11.2071 2.5L13.5 4.79289L14.7929 3.5L12.5 1.20711L11.2071 2.5ZM12.7929 5.5L10.5 3.20711L4.00001 9.70711V10H4.50001C4.77616 10 5.00001 10.2239 5.00001 10.5V11H5.50001C5.77616 11 6.00001 11.2239 6.00001 11.5V12H6.29291L12.7929 5.5ZM3.03167 10.6755L2.92614 10.781L1.39754 14.6025L5.21903 13.0739L5.32456 12.9683C5.13496 12.8973 5.00001 12.7144 5.00001 12.5V12H4.50001C4.22387 12 4.00001 11.7761 4.00001 11.5V11H3.50001C3.28561 11 3.10272 10.865 3.03167 10.6755Z");
            pathEdit.setAttribute('fill', 'black');

            svgEdit.appendChild(pathEdit);

            this.actionEditBtn.appendChild(svgEdit);

            this.actionEditBtn.onclick = function () {
                location.href = '#/change-income-expense?id=' + operation.id;
            }
            // END EDIT BTN

            this.tdActionElement.appendChild(this.actionDeleteBtn);
            this.tdActionElement.appendChild(this.actionEditBtn);

            this.trElement.appendChild(this.thElement);
            this.trElement.appendChild(this.tdTypeElement);
            this.trElement.appendChild(this.tdCategoryElement);
            this.trElement.appendChild(this.tdAmountElement);
            this.trElement.appendChild(this.tdDateElement);
            this.trElement.appendChild(this.tdCommentElement);
            this.trElement.appendChild(this.tdActionElement);

            this.tBodyElement.appendChild(this.trElement);

        });
    }

    clearTable(){
        this.tBodyElement = document.getElementById('table-body');
        this.tBodyElement.innerHTML = '';
    }



}