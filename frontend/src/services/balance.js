import {CustomHttp} from "./custom-http";
import config from "../../config/config";

export class Balance{

    static async getBalance(){
        try {
            const result = await CustomHttp.request(config.host + '/balance', 'GET');
            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                return result.balance;
            }
        } catch (error) {
            return console.log(error);
        }
    }

    static async updateBalance(newBalance){
        try {
            const result = await CustomHttp.request(config.host + '/balance', 'PUT', {
                "newBalance": newBalance,
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