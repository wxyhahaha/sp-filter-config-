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
      "label": "Lazada",
      "value": 20
    },
    {
      "label": "Jumia",
      "value": 36
    },
    {
      "label": "Koyye",
      "value": 65
    },
    {
      "label": "Lotte",
      "value": 67
    },
    {
      "label": "Cdiscount",
      "value": 27
    },
    {
      "label": "Shopee",
      "value": 29
    },
    {
      "label": "Joonmall",
      "value": 63
    },
    {
      "label": "Somyfo",
      "value": 90
    },
    {
      "label": "Shopify",
      "value": 56
    },
    {
      "label": "Wayfair",
      "value": 76
    },
    {
      "label": "B2W",
      "value": 61
    },
    {
      "label": "Joybuy",
      "value": 89
    },
    {
      "label": "Daraz",
      "value": 54
    },
    {
      "label": "MercadoLibre",
      "value": 37
    },
    {
      "label": "Realde",
      "value": 69
    },
    {
      "label": "Allegro",
      "value": 68
    },
    {
      "label": "HiSelling",
      "value": 46
    }
  ],
  "测试": {
    "cookie": "Authorization=\"Bearer AT-38939-ZWQ4VRWXEQBxzJxLu-iHxEothlKnggjZ\"",
    "host": "192.168.1.146",
    "port": "8429",
    "requestUrl": {
      "get": "http://192.168.1.146:8429/listing/sku_on_sale/get_filter_config",
      "save": "http://192.168.1.146:8429/listing/sku_on_sale/save_filterconfig"
    }
  },
  "正式": {
    "cookie": "Authorization=\"Bearer AT-47013-Ir4wzNCH7UATi18Mf_Q136NgCSt12uXX\"",
    "host": "apisp.banggood.cn",
    "port": "",
    "requestUrl": {
      "get": "https://apisp.banggood.cn/listing/sku_on_sale/get_filter_config",
      "save": "https://apisp.banggood.cn/listing/sku_on_sale/save_filterconfig"
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