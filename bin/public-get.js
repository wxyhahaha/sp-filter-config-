
const Common = require("../tool/common");
class Get extends Common {
    constructor() {
        super();
        this.platform = '';
        this.PUTPATH = '';
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
            this.PORT = this.COOKIEHOST[answers.env].port;
            this.HOST = this.COOKIEHOST[answers.env].host
            this.PUTPATH = this.COOKIEHOST.outPut.replace('{env}', `${this.ENV}`);
            this.platform = answers.platform;
            this.createConfigFile();
        })
    }

    async writeJsonFile(data) {
        if (!this.isExistsJson(this.PUTPATH)) {
            await this.mkdir(this.PUTPATH);
        }
        if (JSON.parse(data).platformname) {
            const res = await this.writeFile(data, `/${this.PUTPATH}/${JSON.parse(data).platformname}-config.json`);
            if (res) {
                console.log(this.chalk.green(`${process.cwd()}/${this.PUTPATH}/${JSON.parse(data).platformname}-config.json 创建成功`));
            }
        } else {
            console.error(this.chalk.redBright(`${JSON.parse(data).platform}对应没有平台名，创建失败`));
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
    }

    async getConfig() {
        return await this.request();
    } 

    request() {
        const platform = this.platform;
        return new Promise(resolve => {
            const opt = {
                host: this.HOST,
                port: this.PORT,   // path为域名时，不加port
                method: 'GET',
                path: '/listing/sku_on_sale/get_filter_config?platformCode=' + platform + '&userOaId=-1',
                headers: {
                    "Content-Type": 'application/json',
                    "Cookie": this.COOKIE,
                    "platformNo": platform
                }
            }
            let body = '';
            const spinner = this.ora(this.chalk.blue(`正在获取平台${platform}的配置\n`)).start();
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
                        return console.log('body:', this.chalk.redBright(body));
                    }
                    if (!JSON.parse(body).result) {
                        return console.log(this.chalk.redBright('配置为空'));
                    }
                    resolve(JSON.parse(body).result);
                    spinner.stop();
                });
            }).on('error', (e) => {
                spinner.stop();
                console.log("error: " + e.message);
            })
            req.end();
        });
    }
}

module.exports = new Get();