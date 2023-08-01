import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";

export class CreateIncomeCategory{

    constructor() {
        this.createIncomeCategoryInput = null;
        this.createIncomeCategoryBtn = null;

        this.init();
    }

    async init(){
        this.createIncomeCategoryInput = document.getElementById('create-income-category-input');
        this.createIncomeCategoryBtn = document.getElementById('create-income-category-btn');

        const that = this;

        this.createIncomeCategoryInput.onchange = function() {
            if(this.value.trim().length > 0){
                that.createIncomeCategoryBtn.classList.remove('disabled');
            }else {
                that.createIncomeCategoryBtn.classList.add('disabled');
            }
        }

        this.createIncomeCategoryBtn.onclick = function(){
            const title = that.createIncomeCategoryInput.value;
                that.createCategory(title);
                location.href = '#/income'
        }
    }

    async createCategory(title){
        if(title){
            try {
                const result = await CustomHttp.request(config.host + '/categories/income', 'POST', {
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