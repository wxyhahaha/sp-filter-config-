/*
 * @Author: wuxunyu
 * @Date: 2020-05-30 10:13:09
 * @LastEditTime: 2020-06-06 15:41:56
 */
(function() {
  const {findFatherNodeKey, findTargetChildren } = require(`${__dirname}/../tool/tool`);
  const http = require("http");
  const fs = require("fs");
  const inquirer = require('inquirer');
  const COOKIEHOST = require(`${__dirname}/../cookieconfig.json`);
  const chalk = require('chalk');
  const ora = require('ora');
  let HOST = '';
  let COOKIE = "";
  getLocalModifyConfig().then(LOCALCONFIGLIST => {
    const promptList = [
      {
        type: 'list',
        message: '请选择修改测试环境还是正式环境:',
        name: 'env',
        choices: [`测试(${COOKIEHOST['测试'].host})`, `正式(${COOKIEHOST['正式'].host})`,],
        filter: (val) => {
          return val.includes('测试') ? '测试' : '正式'
        }
      },
      {
        type: 'list',
        message: '请选择平台:',
        name: 'platformConfigFile',
        choices: LOCALCONFIGLIST
      }
    ];
    inquirer.prompt(promptList).then(answers => {
      COOKIE = COOKIEHOST[answers.env].cookie;
      HOST = COOKIEHOST[answers.env].host
      getLocalAndSaveConfig(answers.platformConfigFile);
    })
  });
  
  function saveConfig(data) {
    const opt = {
      host: HOST,
      port: HOST === '192.168.1.146' ? '8429' : '',   // path为域名时，不加port
      method: 'POST',
      path: '/listing/sku_on_sale/save_filterconfig',
      headers: {
        "Content-Type": 'application/json',
        "Cookie": COOKIE,
        "platformNo": data.platform
      }
    }
    const dataString = JSON.stringify({ platformNo: data.platform, filterString: JSON.stringify(data), userId: '-1' });
  
    let body = '';
    const spinner = ora(`正在保存${data.platformname}的配置\n`).start();
    const req = http.request(opt, function (res) {
      res.on('data', function (data) {
        body += data;
      }).on('end', function () {
        if (!JSON.parse(body).success) {
          if (body.includes('401')) {
            console.log('body:', chalk.redBright('登录超时，请重新登录'));
            findFatherNodeKey(COOKIEHOST, HOST, (key, value) => {
              inquirer.prompt([
                {
                  type: 'input',
                  message: `请输入${key}(${value})Authorization cookie:`,
                  name: 'authorizationcookie',
                  default: "find youself", // 默认值
                  filter: (val) => {
                    return {value: val, env: key}
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
        console.log(chalk.greenBright(`${data.platformname}保存成功`))
      });
    }).on('error', function (e) {
      console.log(chalk.redBright("error: " + e.message));
    })
    req.write(dataString);
    spinner.stop();
    req.end();
  }
  
  function getLocalModifyConfig() {
    return new Promise((resolve, reject) => {
      fs.readdir(`${process.cwd()}/json`, (err, data) => {
        if (err) {
          throw err;
        }
        resolve(data && data.filter(v => v.includes('.json')));
      })
    })
  }
  
  function getLocalAndSaveConfig(platformConfigFile) {
    fs.readFile(`${process.cwd()}/json/${platformConfigFile}`, 'UTF-8', (err, data) => {
      if (err) {
        throw err;
      }
      if (!data) {
        console.error(chalk.redBright(`${platformConfigFile}保存的配置为空`));
        return;
      }
      saveConfig(JSON.parse(data));
    });
  }
  
  function WriteFile(data, path) {
    fs.writeFile(`${__dirname}/../${path}`, data, null, function (err) {
        if (err) {
            throw err;
        }
    });
  }
  
  function saveToLocalCookie({value: cookie, env}) {
    findTargetChildren(COOKIEHOST, env, (key, value) => {
      value.cookie = cookie;
      WriteFile(JSON.stringify(COOKIEHOST), '/cookieconfig.json')
    })
  }
})();


