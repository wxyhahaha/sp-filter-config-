const http = require("http");
const fs = require("fs");
const inquirer = require('inquirer');
const COOKIEHOST = require(`${process.cwd()}/filter-cookie-config.json`);
const chalk = require('chalk');
const ora = require('ora');
const path = require('path');
const unirest = require('unirest');

class Common {
    constructor() {
        this.http = http;
        this.fs = fs;
        this.COOKIEHOST = COOKIEHOST;
        this.inquirer = inquirer;
        this.chalk = chalk;
        this.ora = ora;
        this.COOKIE = "";
        this.ENV = '';
        this.path = path;
        this.unirest = unirest;
    }

    writeFile(data, path) {
        return new Promise((resolve, reject) => {
            this.fs.writeFile(`${process.cwd()}/${path}`, JSON.stringify(JSON.parse(data), null, '  '), null, (err) => {
                if (err) {
                    reject(err);
                    throw err;
                }
                resolve(true)
            });
        });
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
            await this.writeCookie(input.authorizationcookie);
            this.COOKIEHOST = require(`${process.cwd()}/filter-cookie-config.json`);
            this.init();
        });
    }
    
    async writeCookie(cookie) {
        this.COOKIEHOST[this.ENV].cookie = cookie;
        await this.writeFile(JSON.stringify(this.COOKIEHOST), '/filter-cookie-config.json');
    }

    async mkdir(putPath) {
        if (this.fs.existsSync(putPath)) {
            return true;
        } else {
            if (this.mkdir(this.path.dirname(putPath))) {
                this.fs.mkdirSync(putPath);
                return true;
            }
        }
    }
}

module.exports = Common;