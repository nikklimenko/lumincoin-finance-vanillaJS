import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Index} from "./index.js";
import moment from "moment";

export class Income{
    constructor() {
        this.incomeCategories = null;
        this.categoriesElement = document.getElementById('income-categories');
        this.deleteCategoryModal = document.getElementById('delete-category-modal');
        this.cancelDeleteCategoryModalBtn = document.getElementById('cancel-delete-category-modal-btn');

        this.init();
    }

    async init(){
        await Index.setBalance();


        try {
            const result = await CustomHttp.request(config.host + '/categories/income', 'GET');
            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                this.incomeCategories = result;
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
            const result = await CustomHttp.request(config.host + '/categories/income/' + id, 'GET');
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
            const result = await CustomHttp.request(config.host + '/categories/income/' + id, 'DELETE');
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

        this.incomeCategories.forEach(category => {
            const incomeCategory = document.createElement('div');
            incomeCategory.className = 'category';

            const incomeCategoryTitle = document.createElement('div');
            incomeCategoryTitle.className = 'category-title';
            incomeCategoryTitle.classList.add('mb-2');
            incomeCategoryTitle.innerText = category.title;

            const editBtn = document.createElement('button');
            editBtn.className = 'btn';
            editBtn.classList.add('btn-primary');
            editBtn.classList.add('me-1');
            editBtn.innerText = 'Редактировать';

            // editBtn.setAttribute('href', '#/change-income-category');
            editBtn.setAttribute('id', 'edit-income-category');

            editBtn.onclick = function() {
                location.href = '#/change-income-category?id=' + category.id;
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
                    location.href = '#/income';

                };

                const cancelDeleteCategoryModalBtn = document.getElementById('cancel-delete-category-modal-btn');
                cancelDeleteCategoryModalBtn.onclick = function () {
                    that.deleteCategoryModal.style.display = 'none';
                    document.body.classList.remove('open');

                };
            };

            deleteBtn.setAttribute('id', 'delete-income-category');


            incomeCategory.appendChild(incomeCategoryTitle);
            incomeCategory.appendChild(editBtn);
            incomeCategory.appendChild(deleteBtn);

            this.categoriesElement.appendChild(incomeCategory);
        })

        const incomeAddCategory = document.createElement('div');
        incomeAddCategory.className = 'category';
        incomeAddCategory.classList.add('add-category');
        incomeAddCategory.setAttribute('id', 'income-add-category');

        incomeAddCategory.onclick = function(){
            location.href = '#/create-income-category';
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
        incomeAddCategory.appendChild(addCategoryPlus);

        this.categoriesElement.appendChild(incomeAddCategory);


    }

}