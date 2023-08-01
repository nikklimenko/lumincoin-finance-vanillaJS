import {Form} from "./components/form.js";
import {Index} from "./components/index.js";
import {IncomeExpense} from "./components/income-expense.js";
import {Income} from "./components/income.js";
import {Auth} from "./services/auth.js";
import {CreateIncomeCategory} from "./components/create-income-category.js";
import {ChangeIncomeCategory} from "./components/change-income-category.js";
import {Expense} from "./components/expense.js";
import {CreateExpenseCategory} from "./components/create-expense-category.js";
import {ChangeExpenseCategory} from "./components/change-expense-category.js";
import {CreateIncomeExpense} from "./components/create-income-expense.js";
import {ChangeIncomeExpense} from "./components/change-income-expense.js";



export class Router {
    constructor() {
        this.contentElement = document.getElementById('content');
        this.stylesElement = document.getElementById('styles');
        this.titleElement = document.getElementById('page-title');
        this.profileElement = document.getElementById('profile');
        this.profileFullNameElement = document.getElementById('profile-full-name');


        this.routes = [
            {
                route: '#/',
                title: 'Главная',
                template: 'templates/index.html',
                styles: 'styles/index.css',
                load: () => {
                    new Index();
                }
            },
            {
                route: '#/signup',
                title: 'Регистрация',
                template: 'templates/signup.html',
                styles: 'styles/form.css',
                load: () => {
                    new Form('signup');
                }
            },
            {
                route: '#/login',
                title: 'Вход в систему',
                template: 'templates/login.html',
                styles: 'styles/form.css',
                load: () => {
                    new Form('login');
                }
            },
            {
                route: '#/income',
                title: 'Доходы',
                template: 'templates/income.html',
                styles: 'styles/categories.css',
                load: () => {
                    new Income();
                }
            },
            {
                route: '#/expense',
                title: 'Расходы',
                template: 'templates/expense.html',
                styles: 'styles/categories.css',
                load: () => {
                    new Expense();
                }
            },
            {
                route: '#/create-income-category',
                title: 'Создание категории доходов',
                template: 'templates/create-income-category.html',
                styles: 'styles/categories.css',
                load: () => {
                    new CreateIncomeCategory();
                }
            },
            {
                route: '#/change-income-category',
                title: 'Редактирование категории доходов',
                template: 'templates/change-income-category.html',
                styles: 'styles/categories.css',
                load: () => {
                    new ChangeIncomeCategory();
                }
            },
            {
                route: '#/create-expense-category',
                title: 'Создание категории расходов',
                template: 'templates/create-expense-category.html',
                styles: 'styles/categories.css',
                load: () => {
                    new CreateExpenseCategory();
                }
            },
            {
                route: '#/change-expense-category',
                title: 'Редактирование категории расходов',
                template: 'templates/change-expense-category.html',
                styles: 'styles/categories.css',
                load: () => {
                    new ChangeExpenseCategory();
                }
            },
            {
                route: '#/create-income-expense',
                title: 'Создание дохода/расхода',
                template: 'templates/create-income-expense.html',
                styles: 'styles/categories.css',
                load: () => {
                    new CreateIncomeExpense();
                }
            },
            {
                route: '#/change-income-expense',
                title: 'Редактирование дохода/расхода',
                template: 'templates/change-income-expense.html',
                styles: 'styles/categories.css',
                load: () => {
                    new ChangeIncomeExpense();
                }
            },
            {
                route: '#/income-and-expense',
                title: 'Доходы и расходы',
                template: 'templates/income-and-expense.html',
                styles: 'styles/categories.css',
                load: () => {
                    new IncomeExpense();

                }
            },

        ]
    }

    async openRoute() {

        const urlRoute = window.location.hash.split('?')[0];
        if(urlRoute === '#/logout'){
            await Auth.logout();
            window.location.href = '#/login';
            return;
        }

        const newRoute = this.routes.find(item => {
            return item.route === urlRoute;
        });

        if(!newRoute){
            window.location.href = '#/login';
            return;
        }

        this.contentElement.innerHTML =
            await fetch(newRoute.template).then(response => response.text());
        this.stylesElement.setAttribute('href', newRoute.styles);
        this.titleElement.innerText = newRoute.title;

        const userInfo = Auth.getUserInfo();
        const accessToken = localStorage.getItem(Auth.accessTokenKey);
        // if(userInfo && accessToken) {
        //     this.profileElement.style.display = 'flex';
        //     this.profileFullNameElement.innerText = userInfo.fullName;
        // } else{
        //     this.profileElement.style.display = 'none';
        // }

        newRoute.load();
    }
}