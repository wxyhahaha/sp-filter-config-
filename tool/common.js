const http = require("http");
const fs = require("fs");
const inquirer = require('inquirer');
const COOKIEHOST = require(`${process.cwd()}/filter-cookie-config.json`);
const chalk = require('chalk');
const ora = require('ora');
const path = require('path');
const unirest = require('unirest');
const { stringify } = require("querystring");
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
            this.fs.writeFile(path, data, null, (err) => {
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
        await this.writeFile(JSON.stringify(this.COOKIEHOST, null, '  '), `${process.cwd()}/filter-cookie-config.json`);
    }

    async writeCache(data, path) {
        data = typeof data === 'string' ? JSON.parse(data) : data;
        await this.mkdir(path);
        if (data.platformname) {
            this.writeFile(JSON.stringify(data, null, '  '), `${path}/${data.platformname}-config.json`).catch(err => console.error('\n' + '缓存写入失败：' + err));
        }
    }

    async readCache(platformName) {
        return new Promise((resolve, reject) => {
            this.fs.readFile(`${process.env.LOCALAPPDATA}/${this.PUTPATH}/${platformName}-config.json`, 'UTF-8', (err, data) => {
                if (err || !data) {
                    console.error(this.chalk.redBright(`${process.env.LOCALAPPDATA}/${this.PUTPATH}/${platformName}-config.json 缓存读取失败，\n`));
                    resolve(false);
                    return;
                }
                resolve(JSON.parse(data));;
            });
        });
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

    async diffJson(oldData, newData) {
        if (!oldData) {
            return false;
        }
        const Diff = require('diff');
        oldData = typeof oldData === 'string' ? JSON.parse(oldData) : oldData;
        newData = typeof newData === 'string' ? JSON.parse(newData) : newData;
        const diff = Diff.diffJson(oldData, newData);
        return await this.printDiffJsonInfo(diff);
    }

    async printDiffJsonInfo(data) {
        let diff = false;
        if (data.some(v => v.added || v.removed)) {
            let count = 0;
            data.forEach((v, i) => {
                if (v.removed || !(v.removed && v.added)) {
                    count += v.count;
                }
                if (v.removed) {
                    diff = true;
                    console.log(this.chalk.redBright(`\n第${count+1}行出现冲突：\n`), this.chalk.blue(`更改前：${v.value}\n`),this.chalk.yellow(`更改后：${data[i+1].value}\n`));
                }
            });
        }
        if (diff) {
            console.log(this.chalk.redBright('出现冲突建议先拉取远端，再对其修改~\n'));
        }
        return diff;
    }

    async getConfig(platform) {
        return await this.requestGet(platform);
    }

    async requestGet(platform) {
        return new Promise(resolve => {
            const spinner = this.ora(this.chalk.blue(`\n`)).start();
            this.unirest('GET', `${this.GETREQUESTURL}?platformCode=${platform}&userOaId=-1`)
                .headers({
                    'Content-Type': 'application/json',
                    "Cookie": this.COOKIE,
                    "platformNo": platform
                })
                .end((res) => {
                    spinner.stop();
                    if (res.error) {
                        return console.log(this.chalk.redBright("error: " + res.error));
                    };
                    if (!JSON.parse(res.raw_body).success) {
                        if (JSON.parse(res.raw_body).error_infos[0].code == 401 || JSON.parse(res.raw_body).error_msg.includes('401')) {
                            console.log('body:', this.chalk.redBright('登录超时，请重新登录'));
                            this.inputCustomerCookie();
                            resolve(401);
                            return;
                        }
                        return console.log('body:', this.chalk.redBright(res.raw_body));
                    }
                    if (!JSON.parse(res.raw_body).result) {
                        return console.log(this.chalk.redBright(`${platform}配置为空\n`));
                    }
                    resolve(JSON.parse(res.raw_body).result);
                });
        });
    }
}

module.exports = Common;