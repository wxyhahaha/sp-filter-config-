const http = require("http");
const fs = require("fs");
const inquirer = require('inquirer');
const COOKIEHOST = require(`${process.cwd()}/cookieconfig.json`);
const chalk = require('chalk');
const ora = require('ora');
class Common {
    constructor() {
        this.http = http;
        this.fs = fs;
        this.COOKIEHOST = COOKIEHOST;
        this.inquirer = inquirer;
        this.chalk = chalk;
        this.ora = ora;
        this.HOST = "";
        this.COOKIE = "";
        this.ENV = '';
        this.PORT = '';
    }

    writeFile(data, path) {
        return new Promise((resolve, reject) => {
            this.fs.writeFile(`${process.cwd()}/${path}`, data, null, (err) => {
                if (err) {
                    reject(err);
                    throw err;
                }
                resolve(true)
            });
        });
    }

    isExistsJson() {
        return this.fs.existsSync(`${process.cwd()}/json`)
    }

    inputCustomerCookie() {
        this.inquirer.prompt([
            {
                type: 'input',
                message: `请输入${this.ENV}(${this.HOST})Authorization cookie:`,
                name: 'authorizationcookie',
                default: "find youself" // 默认值
            }
        ]).then(async (input) => {
            console.log(input.authorizationcookie);
            await this.writeCookie(input.authorizationcookie);
            this.COOKIEHOST = require(`${process.cwd()}/cookieconfig.json`);
            this.init();
        });
    }

    async writeCookie(cookie) {
        this.COOKIEHOST[this.ENV].cookie = cookie;
        await this.writeFile(JSON.stringify(this.COOKIEHOST), '/cookieconfig.json');
    }
}

module.exports = Common;