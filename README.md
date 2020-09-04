<!--
 * @Author: wuxunyu
 * @Date: 2020-05-30 10:13:09
 * @LastEditTime: 2020-06-10 10:37:41
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
      "label": "xxx",  
      "value": xxx  
    }  
  ],  
  "测试": {  
    "cookie": "Authorization=\"Bearer AT-6839-SpEL0XpX8g1UewaeP3lkcRSK4Hi9xb4l\"",  
    "host": "192.168.1.146",  
    "port": "8924",  
    "path": {  
      "get": "/listing/sku_on_sale/get_filter_config",  
      "save": "/listing/sku_on_sale/save_filterconfig"  
    }  
  },  
  "正式": {  
    "cookie": "Authorization=\"Bearer AT-154870-gZZHZMbsU8T-Vx1KqwWown838UUgWX0Y\"",  
    "host": "apisp.banggood.cn",  
    "port": "",  
    "path": {  
      "get": "/listing-back/sku_on_sale/get_filter_config",  
      "save": "/listing-back/sku_on_sale/save_filterconfig"  
    }  
  },  
  "outPut": "config-json/{env}"  
}  
    </code>
</pre>

# 历史版本
`2.3.3`: 增加获取所有配置，保存所有配置功能  
`2.3.4`: 获取配置自动格式化  