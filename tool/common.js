const http = require("http");
const fs = require("fs");
const inquirer = require('inquirer');
const COOKIEHOST = require(`${__dirname}/../cookieconfig.json`);
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
            this.fs.writeFile(`${process.cwd()}/..${path}`, data, null, (err) => {
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
            this.writeCookie(input.authorizationcookie);
            this.init();
        });
    }

    writeCookie(cookie) {
        this.COOKIEHOST[this.ENV].cookie = cookie;
        this.writeFile(JSON.stringify(this.COOKIEHOST), '/cookieconfig.json');
    }
}

module.exports = Common;