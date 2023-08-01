import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Index} from "./index.js";
import moment from "moment";


export class Expense {
    constructor() {
        this.expenseCategories = null;
        this.categoriesElement = document.getElementById('expense-categories');
        this.deleteCategoryModal = document.getElementById('delete-category-modal');

        this.init();
    }

    async init(){
        await Index.setBalance();

        try {
            const result = await CustomHttp.request(config.host + '/categories/expense', 'GET');
            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                this.expenseCategories = result;
                this.showCategories();

            }
        } catch (error) {
            return console.log(error);
        }

    }

    async deleteCategory(id){

        const removedCategoryOperations = [];
        let removedCategory;

        try {
            const result = await CustomHttp.request(config.host + '/categories/expense/' + id, 'GET');
            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                removedCategory = result;

            }
        } catch (error) {
            return console.log(error);
        }


        try {
            const moment = require('moment');
            const dateFrom = '1990-01-01';
            const dateTo = moment().format("YYYY-MM-DD");

            const result = await CustomHttp.request(config.host + '/operations?period=interval&dateFrom=' + dateFrom + '&dateTo=' + dateTo, 'GET');
            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }

                result.forEach(operation => {
                    if(operation.category === removedCategory.title){
                        removedCategoryOperations.push(operation);
                    }
                })

            }
        } catch (error) {
            return console.log(error);
        }

        this.deleteAllOperationsInCategory(removedCategoryOperations);

        try {
            const result = await CustomHttp.request(config.host + '/categories/expense/' + id, 'DELETE');
            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                this.showCategories();
            }
        } catch (error) {
            return console.log(error);
        }

    }

    async deleteAllOperationsInCategory(arr){
        for (const arrElement of arr) {
            try {
                const result = await CustomHttp.request(config.host + '/operations/' + arrElement.id, 'DELETE');
                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }

                }
            } catch (error) {
                return console.log(error);
            }
        }

    }


    showCategories(){

        this.expenseCategories.forEach(category => {
            const expenseCategory = document.createElement('div');
            expenseCategory.className = 'category';

            const expenseCategoryTitle = document.createElement('div');
            expenseCategoryTitle.className = 'category-title';
            expenseCategoryTitle.classList.add('mb-2');
            expenseCategoryTitle.innerText = category.title;

            const editBtn = document.createElement('button');
            editBtn.className = 'btn';
            editBtn.classList.add('btn-primary');
            editBtn.classList.add('me-1');
            editBtn.innerText = 'Редактировать';

            editBtn.setAttribute('id', 'edit-expense-category');

            editBtn.onclick = function() {
                location.href = '#/change-expense-category?id=' + category.id;
            }

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn';
            deleteBtn.classList.add('btn-danger');
            deleteBtn.innerText = 'Удалить';
            const that = this;
            deleteBtn.onclick = function() {
                that.deleteCategoryModal.style.display = 'flex';
                document.body.classList.add('open');
                const deleteCategoryModalBtn = document.getElementById('delete-category-modal-btn');
                deleteCategoryModalBtn.onclick = async function () {
                    await that.deleteCategory(category.id);
                    that.deleteCategoryModal.style.display = 'none';
                    document.body.classList.remove('open');
                    location.href = '#/expense';

                };

                const cancelDeleteCategoryModalBtn = document.getElementById('cancel-delete-category-modal-btn');
                cancelDeleteCategoryModalBtn.onclick = function () {
                    that.deleteCategoryModal.style.display = 'none';
                    document.body.classList.remove('open');

                };
            };

            deleteBtn.setAttribute('id', 'delete-expense-category');


            expenseCategory.appendChild(expenseCategoryTitle);
            expenseCategory.appendChild(editBtn);
            expenseCategory.appendChild(deleteBtn);

            this.categoriesElement.appendChild(expenseCategory);
        })

        const expenseAddCategory = document.createElement('div');
        expenseAddCategory.className = 'category';
        expenseAddCategory.classList.add('add-category');
        expenseAddCategory.setAttribute('id', 'expense-add-category');

        expenseAddCategory.onclick = function(){
            location.href = '#/create-expense-category';
        }


        const addCategoryPlus = document.createElement('div');
        addCategoryPlus.className = 'add-category-plus';

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute('width', '15');
        svg.setAttribute('height', '16');
        svg.setAttribute('viewBox', '0 0 15 16');
        svg.setAttribute('fill', 'none');

        const path = document.createElementNS('http://www.w3.org/2000/svg',"path");
        path.setAttributeNS(null, "d", "M14.5469 6.08984V9.05664H0.902344V6.08984H14.5469ZM9.32422 0.511719V15.0039H6.13867V0.511719H9.32422Z");
        path.setAttribute('fill', '#CED4DA');

        svg.appendChild(path);
        addCategoryPlus.appendChild(svg);
        expenseAddCategory.appendChild(addCategoryPlus);

        this.categoriesElement.appendChild(expenseAddCategory);

    }

}