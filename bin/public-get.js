
const Common = require("../tool/common");
class Get extends Common {
    constructor() {
        super();
        this.platform = '';
        this.PUTPATH = '';
        this.GETREQUESTURL = '';
        this.HOST = '';
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
            this.HOST = this.COOKIEHOST[answers.env].host;
            this.GETREQUESTURL = this.COOKIEHOST[answers.env].requestUrl.get;
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
            this.GETREQUESTURL = this.COOKIEHOST[answers.env].requestUrl.get;
            this.HOST = this.COOKIEHOST[answers.env].host;
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
            const res = await this.writeFile(JSON.stringify(JSON.parse(data), null, '  '), `${process.cwd()}/${this.PUTPATH}/${JSON.parse(data).platformname}-config.json`);
            if (res) {
                console.log(this.chalk.green(`${process.cwd()}/${this.PUTPATH}/${JSON.parse(data).platformname}-config.json 创建成功\n`));
                this.writeCache(data, `${process.env.LOCALAPPDATA}/${this.PUTPATH}`);
            }
        } else {
            console.error(this.chalk.redBright(`${JSON.parse(data).platform}对应没有平台名，创建失败\n`));
        }
    };

    async createConfigFile() {
        const res = await this.getConfig(this.platform);
        if (res != 401) {
            this.writeJsonFile(res);
        }
        return res;
    }
}

module.exports = new Get();