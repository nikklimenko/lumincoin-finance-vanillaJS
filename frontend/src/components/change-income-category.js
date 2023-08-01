import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Income} from "./income";

export class ChangeIncomeCategory{
    constructor() {
        this.incomeCategory = null;
        this.changeIncomeCategoryInput = null;
        this.changeIncomeCategoryBtn = null;

        this.init();
    }

    async init(){

        const id = window.location.hash.split('?id=')[1];

        try {
            const result = await CustomHttp.request(config.host + '/categories/income/' + id, 'GET');
            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                this.incomeCategory = result;

            }
        } catch (error) {
            return console.log(error);
        }


        this.changeIncomeCategoryInput = document.getElementById('change-income-category-input');
        this.changeIncomeCategoryBtn = document.getElementById('change-income-category-btn');


        const that = this;

        this.changeIncomeCategoryInput.value = this.incomeCategory.title;

        this.changeIncomeCategoryInput.onchange = function() {
            if(this.value.trim().length > 0){
                that.changeIncomeCategoryBtn.classList.remove('disabled');
            }else {
                that.changeIncomeCategoryBtn.classList.add('disabled');
            }
        }


        this.changeIncomeCategoryBtn.onclick = function(){
            const title = that.changeIncomeCategoryInput.value;
            that.changeCategory(title, that.incomeCategory.id);
            location.href = '#/income'
        }
    }

    async changeCategory(title, id){
        if(title){
            try {
                const result = await CustomHttp.request(config.host + '/categories/income/' + id, 'PUT', {
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