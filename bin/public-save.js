const Common = require("../tool/common");
class Save extends Common {
  constructor(
  ) {
    super();
    this.data = {};
    this.PUTPATH = '';
    this.REQUESTURL = '';
  }

  async init() {
    const promptList = [
      {
        type: 'list',
        message: '请选择修改测试环境还是正式环境:',
        name: 'env',
        choices: [`测试(${this.COOKIEHOST['测试'].host})`, `正式(${this.COOKIEHOST['正式'].host})`,],
        filter: (val) => {
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
      this.REQUESTURL = this.COOKIEHOST[answers.env].requestUrl.save;
      this.PUTPATH = this.COOKIEHOST.outPut.replace('{env}', `${this.ENV}`);
      this.data = await this.getLocalConfig(answers.platformName);
      this.saveConfig();
    })
  }

  async onekeySaveAllPlatformJson() {
    const promptList = [
      {
        type: 'list',
        message: '请选择获取测试环境还是正式环境:',
        name: 'env',
        choices: [`测试(${this.COOKIEHOST['测试'].host})`, `正式(${this.COOKIEHOST['正式'].host})`,],
        filter: (val) => {
          return val.includes('测试') ? '测试' : '正式';
        }
      }
    ];
    this.inquirer.prompt(promptList).then(async (answers) => {
      this.ENV = answers.env;
      this.COOKIE = this.COOKIEHOST[answers.env].cookie;
      this.REQUESTURL = this.COOKIEHOST[answers.env].requestUrl.save;
      this.PUTPATH = this.COOKIEHOST.outPut.replace('{env}', `${this.ENV}`);
      for (const item of this.COOKIEHOST.platform) {
        this.data = await this.getLocalConfig(item.label);
        const res = await this.saveConfig();
        if (res === 401) {
          return;
        }
      }
    })
  }

  async saveConfig() {
    const res = await this.request();
    if (res == 401) {
      console.log('body:', this.chalk.redBright('登录超时，请重新登录'));
      this.inputCustomerCookie();
    }
    if (res == 200) {
      console.log(this.chalk.greenBright(`${process.cwd()}/${this.PUTPATH}/${this.data.platformname}-config.json保存成功\n`));
    }
    return res;
  }

  request() {
    return new Promise(resolve => {
      const data = this.data;
      if (!data) {
        resolve(false);
        return;
      }
      const spinner = this.ora(this.chalk.blue(`\n`)).start();
      const params = {
        platformNo: data.platform,
        filterString: JSON.stringify(data),
        userId: -1
      };
      this.unirest('POST', this.REQUESTURL)
        .headers({
          'Content-Type': 'application/json',
          "Cookie": this.COOKIE,
          "platformNo": data.platform
        })
        .send(params)
        .end((res) => {
          spinner.stop();
          if (res.error) {
            return console.log(this.chalk.redBright("error: " + res.error));
          };
          if (!res.raw_body.success) {
            if (res.raw_body.error_infos[0].code == 401) {
              resolve(401);
              return;
            }
            return console.log('body:', this.chalk.redBright(res.raw_body));
          }
          resolve(200);
        });
    });

  }

  getLocalConfig(platformName) {
    return new Promise((resolve, reject) => {
      this.fs.readFile(`${process.cwd()}/${this.PUTPATH}/${platformName}-config.json`, 'UTF-8', (err, data) => {
        if (err) {
          console.error(this.chalk.redBright(`${process.cwd()}/${this.PUTPATH}/${platformName}-config.json 文件不存在\n`));
          resolve(false);
          return;
        }
        if (!data) {
          console.error(this.chalk.redBright(`${platformName}保存的配置为空\n`));
          resolve(false);
          return;
        }
        resolve(JSON.parse(data));;
      });
    });
  }
}

module.exports = new Save();


