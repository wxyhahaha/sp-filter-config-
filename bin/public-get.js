
const Common = require("../tool/common");
class Get extends Common {
    constructor() {
        super();
        this.platform = '';
        this.PUTPATH = '';
        this.REQUESTURL = '';
    }

    init() {
        const promptList = [
            {
                type: 'list',
                message: '请选择获取测试环境还是正式环境:',
                name: 'env',
                choices: [`测试(${this.COOKIEHOST['测试'].host})`, `正式(${this.COOKIEHOST['正式'].host})`,],
                filter: (val) => {
                    return val.includes('测试') ? '测试' : '正式';
                }
            },
            {
                type: 'list',
                message: '请选择平台:',
                name: 'platform',
                choices: this.COOKIEHOST.platform.map(v => v.label),
                filter: (val) => {
                    return this.COOKIEHOST.platform.find(v => v.label === val).value;
                }
            }
        ];
        this.inquirer.prompt(promptList).then(answers => {
            this.ENV = answers.env;
            this.COOKIE = this.COOKIEHOST[answers.env].cookie;
            this.REQUESTURL = this.COOKIEHOST[answers.env].requestUrl.get;
            this.PUTPATH = this.COOKIEHOST.outPut.replace('{env}', `${this.ENV}`);
            this.platform = answers.platform;
            this.createConfigFile();
        })
    }

    async onekeyLoadAllPlatformJson() {
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
            this.REQUESTURL = this.COOKIEHOST[answers.env].requestUrl.get;
            this.PUTPATH = this.COOKIEHOST.outPut.replace('{env}', `${this.ENV}`);
            for (const item of this.COOKIEHOST.platform) {
                this.platform = item.value;
                const res = await this.createConfigFile();
                if (res === 401) {
                    return;
                }
            }
        })
    }

    async writeJsonFile(data) {
        await this.mkdir(this.PUTPATH);
        if (JSON.parse(data).platformname) {
            const res = await this.writeFile(data, `/${this.PUTPATH}/${JSON.parse(data).platformname}-config.json`);
            if (res) {
                console.log(this.chalk.green(`${process.cwd()}/${this.PUTPATH}/${JSON.parse(data).platformname}-config.json 创建成功\n`));
            }
        } else {
            console.error(this.chalk.redBright(`${JSON.parse(data).platform}对应没有平台名，创建失败\n`));
        }
    };

    async createConfigFile() {
        const res = await this.getConfig();
        if (res == 401) {
            console.log('body:', this.chalk.redBright('登录超时，请重新登录'));
            this.inputCustomerCookie();
        } else {
            this.writeJsonFile(res);
        }
        return res;
    }

    async getConfig() {
        return await this.request();
    }

    async request() {
        const platform = this.platform;
        return new Promise(resolve => {
            const spinner = this.ora(this.chalk.blue(`\n`)).start();
            this.unirest('GET', `${this.REQUESTURL}?platformCode=${platform}&userOaId=-1`)
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
                        if (JSON.parse(res.raw_body).error_infos[0].code == 401 || res.raw_body.error_msg.includes('401')) {
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

module.exports = new Get();