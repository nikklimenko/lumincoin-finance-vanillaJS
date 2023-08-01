import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";

export class CreateExpenseCategory{
    constructor() {
        this.createExpenseeCategoryInput = null;
        this.createExpenseCategoryBtn = null;

        this.init();
    }

    async init(){
        this.createExpenseCategoryInput = document.getElementById('create-expense-category-input');
        this.createExpenseCategoryBtn = document.getElementById('create-expense-category-btn');

        const that = this;

        this.createExpenseCategoryInput.onchange = function() {
            if(this.value.trim().length > 0){
                that.createExpenseCategoryBtn.classList.remove('disabled');
            }else {
                that.createExpenseCategoryBtn.classList.add('disabled');
            }
        }


        this.createExpenseCategoryBtn.onclick = function(){
            const title = that.createExpenseCategoryInput.value;
            that.createCategory(title);
            location.href = '#/expense'
        }
    }

    async createCategory(title){
        if(title){
            try {
                const result = await CustomHttp.request(config.host + '/categories/expense', 'POST', {
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