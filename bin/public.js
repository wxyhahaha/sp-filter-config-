#!/usr/bin/env node
/*
 * @Author: wuxunyu
 * @Date: 2020-06-06 14:50:55
 * @LastEditTime: 2020-06-06 15:12:39
 */ 
const program = require('commander')
 
// 定义当前版本
// 定义使用方法
program
 .version(require('../package').version)
 .usage('<command> [options]')
 .command('get', '获取配置')
 .command('save', '保存配置')
  
// 解析命令行参数
program.parse(process.argv)