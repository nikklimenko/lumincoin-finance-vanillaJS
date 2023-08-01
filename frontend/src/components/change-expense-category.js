import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";

export class ChangeExpenseCategory{
    constructor() {
        this.expenseCategory = null;
        this.changeExpenseCategoryInput = null;
        this.changeExpenseCategoryBtn = null;

        this.init();
    }

    async init(){

        const id = window.location.hash.split('?id=')[1];

        try {
            const result = await CustomHttp.request(config.host + '/categories/expense/' + id, 'GET');
            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                this.expenseCategory = result;

            }
        } catch (error) {
            return console.log(error);
        }


        this.changeExpenseCategoryInput = document.getElementById('change-expense-category-input');
        this.changeExpenseCategoryBtn = document.getElementById('change-expense-category-btn');


        const that = this;

        this.changeExpenseCategoryInput.value = this.expenseCategory.title;

        this.changeExpenseCategoryInput.onchange = function() {
            if(this.value.trim().length > 0){
                that.changeExpenseCategoryBtn.classList.remove('disabled');
            }else {
                that.changeExpenseCategoryBtn.classList.add('disabled');
            }
        }

        this.changeExpenseCategoryBtn.onclick = function(){
            const title = that.changeExpenseCategoryInput.value;
            that.changeCategory(title, that.expenseCategory.id);
            location.href = '#/expense'
        }
    }

    async changeCategory(title, id){
        if(title){
            try {
                const result = await CustomHttp.request(config.host + '/categories/expense/' + id, 'PUT', {
                    "title" : title,
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

    }
}