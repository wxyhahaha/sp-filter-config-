<!--
 * @Author: wuxunyu
 * @Date: 2020-05-30 10:13:09
 * @LastEditTime: 2020-11-13
--> 
# 描述
为了方便提交json配置文件，简单做了一个小插件(仅限公司所用)，
public get 会获取网络上的配置 在文件夹下会创建json/{xx}.json 文件
可对其进行修改，public save 提交选择已改文件
# 安装
npm i sp-fitler-config -g
# 命令
| 命令 | 说明 |
| :--- | :--- |
| `public` | 查看所有命令 |
| `public get` | 获取配置 |
| `public save` | 保存配置 |
| `public save-all` | 保存所有配置 |
| `public get-all` | 获取所有配置 |
# filter-cookie-json模板
<pre>
    <code>
{
  "platform": [
    {
      "label": "xx",
      "value": xx
    }
  ],
  "测试": {
    "cookie": "Authorization=\"xx\"",
    "host": "192.168.1.146",
    "port": "8429",
    "requestUrl": {
      "get": "xx",
      "save": "xx"
    }
  },
  "正式": {
    "cookie": "Authorization=\"xx\"",
    "host": "apisp.banggood.cn",
    "port": "",
    "requestUrl": {
      "get": "xx",
      "save": "xx"
    }
  },
  "outPut": "config-json/{env}"
}
    </code>
</pre>

# 历史版本
`2.3.3`: 增加获取所有配置，保存所有配置功能  
`2.3.4`: 获取配置自动格式化  
`2.3.5`: 修复读写cookie  
`2.3.6`: 修复保存socket hang up 问题
`2.3.7`: 更换请求api修复socket hang up 问题，调整filter-cookie-config.json配置
`2.3.8`: 请求响应修复
`2.3.9`: 请求响应修复2
`2.5.0`: 优化提交时多端提交问题，增加冲突提示
`2.5.1`: 修复冲突提示，提示降级。
`2.5.2`: 修复冲突提示，去除行数提示，优化提示。