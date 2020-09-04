#!/usr/bin/env node
/*
 * @Author: wuxunyu
 * @Date: 2020-06-06 14:50:55
 * @LastEditTime: 2020-06-06 15:12:39
 */
const getAction = require("./public-get");
const saveAction = require("./public-save");
const program = require('commander')

// 定义当前版本
// 定义使用方法
program
  .version(require('../package').version)
  .usage('<command> [options]')

program
  .command('get')
  .alias('g')
  .description('获取配置')
  .action(getAction.init.bind(getAction));

program.command('save')
  .alias('s')
  .description('保存配置')
  .action(saveAction.init.bind(saveAction));

program.command('get-all')
  .alias('ga')
  .description('获取所有配置')
  .action(getAction.onekeyLoadAllPlatformJson.bind(getAction));

program.command('save-all')
  .alias('sa')
  .description('保存所有配置')
  .action(saveAction.onekeySaveAllPlatformJson.bind(saveAction));

// 解析命令行参数
program.parse(process.argv)

if (!program.args.length) {
  program.help();
}

