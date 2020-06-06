/*
 * @Author: wuxunyu
 * @Date: 2020-05-30 10:13:09
 * @LastEditTime: 2020-06-06 15:41:06
 */
(function () {
    const { findFatherNodeKey, findTargetChildren } = require(`${__dirname}/../tool/tool`);
    const http = require("http");
    const fs = require('fs');
    const COOKIEHOST = require(`${__dirname}/../cookieconfig.json`);
    const inquirer = require('inquirer');
    const chalk = require('chalk');
    const ora = require('ora');
    let HOST = '';
    let COOKIE = "";
    const promptList = [
        {
            type: 'list',
            message: '请选择获取测试环境还是正式环境:',
            name: 'env',
            choices: [`测试(${COOKIEHOST['测试'].host})`, `正式(${COOKIEHOST['正式'].host})`,],
            filter: (val) => {
                return val.includes('测试') ? '测试' : '正式'
            }
        },
        {
            type: 'list',
            message: '请选择平台:',
            name: 'platform',
            choices: COOKIEHOST.platform
        }
    ];
    inquirer.prompt(promptList).then(answers => {
        COOKIE = COOKIEHOST[answers.env].cookie;
        HOST = COOKIEHOST[answers.env].host
        createConfigFile(answers.platform);
    })
    function getConfig(platform) {
        const opt = {
            host: HOST,
            port: HOST === '192.168.1.146' ? '8429' : '',   // path为域名时，不加port
            method: 'GET',
            path: '/listing/sku_on_sale/get_filter_config?platformCode=' + platform + '&userOaId=-1',
            headers: {
                "Content-Type": 'application/json',
                "Cookie": COOKIE,
                "platformNo": platform
            }
        }
        let body = '';
        const spinner = ora(`正在获取${platform}的配置\n`).start();
        const req = http.request(opt, function (res) {
            res.on('data', function (data) {
                body += data;
            }).on('end', function () {
                if (!JSON.parse(body).success) {
                    if (body.includes('401')) {
                        console.log('body:', chalk.redBright('登录超时，请重新登录'))
                        findFatherNodeKey(COOKIEHOST, HOST, (key, value) => {
                            inquirer.prompt([
                                {
                                    type: 'input',
                                    message: `请输入${key}(${value})Authorization cookie:`,
                                    name: 'authorizationcookie',
                                    default: "find youself", // 默认值
                                    filter: (val) => {
                                        return { value: val, env: key }
                                    }
                                }
                            ]).then(input => {
                                saveToLocalCookie(input.authorizationcookie);
                            });
                        }, 'host');
                        return;
                    }
                    return console.log('body:', chalk.redBright(body));
                }
                if (!JSON.parse(body).result) {
                    return console.log(chalk.redBright('配置为空'));
                }
                WriteFile(JSON.parse(body).result);
            });
        }).on('error', function (e) {
            console.log("error: " + e.message);
        })
        req.end();
        spinner.stop();
    }

    function WriteFile(data) {
        mkdir();
        if (JSON.parse(data).platformname) {
            fs.writeFile(`${process.cwd()}/json/${JSON.parse(data).platformname}-config.json`, data, null, function (err) {
                if (err) {
                    throw err;
                }
                console.log(chalk.green(`${JSON.parse(data).platformname}-config.json 创建成功`));
            });
        } else {
            console.error(chalk.redBright(`${JSON.parse(data).platform}对应没有平台名，创建失败`));
        }
    }

    function createConfigFile(platform) {
        getConfig(platform);
    }

    function saveToLocalCookie({ value: cookie, env }) {
        findTargetChildren(COOKIEHOST, env, (key, value) => {
            value.cookie = cookie;
            fs.writeFile(`${__dirname}/../cookieconfig.json`, JSON.stringify(COOKIEHOST), null, function (err) {
                if (err) {
                    throw err;
                }
            });
        })
    }

    function isExistsJson() {
        return fs.existsSync(`${process.cwd()}/json`)
    }

    function mkdir() {
        isExistsJson() ? '' : fs.mkdirSync(`${process.cwd()}/json`);
    }
})();
