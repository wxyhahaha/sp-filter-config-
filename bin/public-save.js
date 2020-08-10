const Common = require("../tool/common");
class Save extends Common {
  constructor(
  ) {
    super();
    this.data = {};
  }

  async init() {
    const LOCALCONFIGLIST = await this.getLocalModifyConfig();
    const promptList = [
      {
        type: 'list',
        message: '请选择修改测试环境还是正式环境:',
        name: 'env',
        choices: [`测试(${this.COOKIEHOST['测试'].host})`, `正式(${this.COOKIEHOST['正式'].host})`,],
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
    this.inquirer.prompt(promptList).then(async (answers) => {
      this.ENV = answers.env;
      this.COOKIE = this.COOKIEHOST[answers.env].cookie;
      this.HOST = this.COOKIEHOST[answers.env].host;
      this.PORT = this.COOKIEHOST[answers.env].port;
      this.data = await this.getLocalConfig(answers.platformConfigFile);
      this.saveConfig();
    })
  }

  async saveConfig() {
    const res = await this.request();
    if (res == 401) {
      console.log('body:', this.chalk.redBright('登录超时，请重新登录'));
      this.inputCustomerCookie();
    }
    if (res == 200) {
      this.writePlatFormNo(this.data.platform);
      console.log(this.chalk.greenBright(`保配置存成功`));
    }
  }

  request() {
    return new Promise(resolve => {
      const data = this.data;
      const opt = {
        host: this.HOST,
        port: this.PORT,   // path为域名时，不加port
        method: 'POST',
        path: '/listing/sku_on_sale/save_filterconfig',
        headers: {
          "Content-Type": 'application/json',
          "Cookie": this.COOKIE,
          "platformNo": data.platform
        }
      };
      const dataString = JSON.stringify({ platformNo: data.platform, filterString: JSON.stringify(data), userId: '-1' });
      let body = '';
      const spinner = this.ora(this.chalk.blue(`正在保存${data.platformname}的配置\n`)).start();
      const req = this.http.request(opt, (res) => {
        res.on('data', (data) => {
          body += data;
        }).on('end', async () => {
          if (!JSON.parse(body).success) {
            if (body.includes('401')) {
              spinner.stop();
              resolve(401);
              return;
            }
            return console.log('body:', chalk.redBright(body));
          }
          spinner.stop();
          resolve(200);
        });
      }).on('error', (e) => {
        spinner.stop();
        console.log(this.chalk.redBright("error: " + e.message));
      })
      req.write(dataString);
      req.end();
    });

  }

  getLocalModifyConfig() {
    return new Promise((resolve, reject) => {
      this.fs.readdir(`${process.cwd()}/json`, (err, data) => {
        if (err) {
          throw err;
        }
        resolve(data && data.filter(v => v.includes('.json')));
      })
    })
  }

  getLocalConfig(platformConfigFile) {
    return new Promise(resolve => {
      this.fs.readFile(`${process.cwd()}/json/${platformConfigFile}`, 'UTF-8', (err, data) => {
        if (err) {
          resolve(false);
          throw err;
        }
        if (!data) {
          resolve(false);
          console.error(chalk.redBright(`${platformConfigFile}保存的配置为空`));
          return;
        }
        resolve(JSON.parse(data));;
      });
    });
  }

  writePlatFormNo(platformNo) {
    if (!this.COOKIEHOST.platform.includes(platformNo)) {
      this.COOKIEHOST.platform = [... this.COOKIEHOST.platform, platformNo];
      this.writeFile(JSON.stringify(this.COOKIEHOST), '/cookieconfig.json')
    }
  }
}

module.exports = new Save();


