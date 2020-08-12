const Common = require("../tool/common");
class Save extends Common {
  constructor(
  ) {
    super();
    this.data = {};
    this.PUTPATH = '';
    this.REQUESTPATH = '';
  }

  async init() {
    const promptList = [
      {
        type: 'list',
        message: '请选择修改测试环境还是正式环境:',
        name: 'env',
        choices: [`测试(${this.COOKIEHOST['测试'].host})`, `正式(${this.COOKIEHOST['正式'].host})`,],
        filter: (val) => {
          console.log('测试');
          return val.includes('测试') ? '测试' : '正式';
        }
      },
      {
        type: 'list',
        message: '请选择平台:',
        name: 'platformName',
        choices: this.COOKIEHOST.platform.map(v => v.label)
      }
    ];
    this.inquirer.prompt(promptList).then(async (answers) => {
      this.ENV = answers.env;
      this.COOKIE = this.COOKIEHOST[answers.env].cookie;
      this.HOST = this.COOKIEHOST[answers.env].host;
      this.PORT = this.COOKIEHOST[answers.env].port;
      this.REQUESTPATH = this.COOKIEHOST[answers.env].path.save;
      this.PUTPATH = this.COOKIEHOST.outPut.replace('{env}', `${this.ENV}`);
      this.data = await this.getLocalConfig(answers.platformName);
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
      console.log(this.chalk.greenBright(`${this.data.platformname}保存成功`));
    }
  }

  request() {
    return new Promise(resolve => {
      const data = this.data;
      const opt = {
        host: this.HOST,
        port: this.PORT,
        method: 'POST',
        path: this.REQUESTPATH,
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

  getLocalConfig(platformName) {
    return new Promise((resolve, reject) => {
      this.fs.readFile(`${process.cwd()}/${this.PUTPATH}/${platformName}-config.json`, 'UTF-8', (err, data) => {
        if (err) {
          console.error(this.chalk.redBright(`${process.cwd()}/${this.PUTPATH}/${platformName}-config.json 文件不存在`));
          return;
        }
        if (!data) {
          resolve(false);
          console.error(this.chalk.redBright(`${platformName}保存的配置为空`));
          return;
        }
        resolve(JSON.parse(data));;
      });
    });
  }
}

module.exports = new Save();


