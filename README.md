## 1. 注意事项

（1）确保WPS加载项管理文件存放位置正确

```tex
jsaddons目录地址：
windows:
    我的电脑地址栏中输入：%appdata%\kingsoft\wps\jsaddons
linux:
    我的电脑地址栏中输入：~/.local/share/Kingsoft/wps/jsaddons
```

（2）加载项有两种部署模式，publish模式和`jsplugins.xml`模式，这两种模式是WPS去找到加载项管理文件的方式，每个模式都有对应的管理文件，WPS启动时，会去`jsaddons`目录读取`publish.xml`和`jsplugins.xml`文件。请确保以下文件配置正确，若没有这两个文件，请先使用代码加载一遍WPS加载项。

- `publish`模式下对应`publish.xml`，文件内容示例如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<jsplugins>
    <jspluginonline name="WpsOAAssist" url="http://www.wps.com/WpsOAAssist/" type="wps" enable="true"/>
    <jspluginonline name="EtOAAssist" url="http://www.wps.com/EtOAAssist/" type="et" enable="true"/>
    <jspluginonline name="WppOAAssist" url="http://www.wps.com/WppOAAssist/" type="wpp" enable="true"/>
</jsplugins>
```

- `jsplugins.xml`模式下对应`jsplugins.xml`，文件内容示例如下：

```xml
<jsplugins>
	<jspluginonline name="EtOAAssist" type="et" url="http://www.wps.com/EtOAAssist/"/>
	<jspluginonline name="WpsOAAssist" type="wps" url="http://www.wps.com/WpsOAAssist/"/>
	<jspluginonline name="WppOAAssist" type="wpp" url="http://www.wps.com/WppOAAssist/"/>
</jsplugins>
```

* 两种模式区别：
* `publish`模式是通过在网页中调用本地服务的端口，在客户本地`jsaddons`目录中生成`publish.xml`文件，https://kdocs.cn/l/cpOfxONhn8Yg [金山文档] 

* `jsplugins.xml`模式是在`oem.ini`中配置好地址，在WPS启动时，会自动去服务端拉取地址指向的`jsplugins.xml`文件，放到客户本地的`jsaddons`目录中。在实际项目中，将`jsplugins.xml`文件地址告知我们，由我们将`jsplugins`打包进WPS安装包中，用户安装二次打包后的安装包即可使用。

（2）WPS配置文件`oem.ini`地址

```tex
oem.ini目录地址：
windows:
    1. 安装路径\WPS Offlce\一串数字（版本号）\offlce6\cfgs\
    2. 鼠标右键点击左面的wps文字图标==>打开文件位置==>在同级目录中找到cfgs目录
linux:
    普通linux操作系统：
         /opt/kingsoft/wps-office/office6/cfgs/
    uos操作系统:
        /opt/apps/cn.wps.wps-office-pro/files/kingsoft/wps-office/office6/cfgs/
```

- 使用publish模式时请确保`oem.ini`配置文件中的`JsApiPlugin`为false或者注释掉

## 2. 使用教程

- 配置文件

```js
window.officeConfig = {
	//0表示jsplugins.xml模式，1表示publish模式，2表示多进程加动态传递jsplugins.xml模式(使用0请到根目录下修改jsplugins.xml的url)
	MODE: 1,
	// WpsOAAssist路径，必须以“/”结尾
	WPS_URL: 'http://www.wps.com/WpsOAAssist/',
	// EtOAAssist路径，必须以“/”结尾
	ETO_URL: 'http://www.wps.com/EtOAAssist/',
	// WppOAAssist路径，必须以“/”结尾
	WPP_URL: 'http://www.wps.com/WppOAAssist/',
	// jsPlugins.xml文件路径
	XML_URL:'http://www.wps.com/jsplugins.jsplugins.xml'
}

```

配置文件位于`根目录/js/config.js`，把`http://www.wps.com/`替换成前端的URL即可，这里就是为了确保本地的`publish.xml`文件生成正确，如果是`jsplugins.xml`模式，则根目录的`jsplugins.xml`文件也一样，把`http://www.wps.com/`替换成前端的URL即可；`根目录/jsplugins.xml`内容如下：

```xml
<!-- WPS加载项配置信息，在线和离线只有一个生效，不可同时存在 -->
<!-- WPS加载项：在线模式配置	Start -->

<!-- https://kdocs.cn/l/cBk8tsBIf [金山文档] jsplugins.xml配置文档.docx -->
<jsplugins>
	<jspluginonline name="EtOAAssist" type="et" url="http://www.wps.com/EtOAAssist/"/>
	<jspluginonline name="WpsOAAssist" type="wps" url="http://www.wps.com/WpsOAAssist/"/>
	<jspluginonline name="WppOAAssist" type="wpp" url="http://www.wps.com/WppOAAssist/"/>
</jsplugins>
<!-- WPS加载项：在线模式配置	End -->

<!-- WPS加载项：离线模式配置	Start -->
<!-- <jsplugins>
	<jsplugin name="EtOAAssist" type="et" url="http://127.0.0.1:3888/plugins/v0.1/EtOAAssist.7z" version="0.1" />
	<jsplugin name="WpsOAAssist" type="wps" url="http://127.0.0.1:3888/plugins/v0.1/WpsOAAssist.7z" version="0.1" />
	<jsplugin name="WppOAAssist" type="wpp" url="http://127.0.0.1:3888/plugins/v0.1/WppOAAssist.7z" version="0.1" />
</jsplugins> -->
<!-- WPS加载项：离线模式配置	End -->
```

- 使用步骤

（1）请在调用WPS客户端页面中按顺序加载以下`js`文件，文件位置在`根目录/js`目录中，请按实际情况加载

```html
<script src="./js/config.js" type="text/javascript" charset="utf-8"></script>
<script src="./js/wpsjsrpcsdk.js" type="text/javascript" charset="utf-8"></script>
<script src="./js/wps.js" type="text/javascript" charset="utf-8"></script>
```

（2）调用方法

```js
function wps(){
 			var filePath ="http://localhost/file/downloading/1470214601135230977"
			var uploadPath = "http://localhost/file/wps/uploading"
			var uploadFieldName = 'file'
			var openName = '东方不败'
			var publicationId = "a8abca50-aebb-45ba-9fbd-fb708d788949"
			var token = ""
			var openFileName = "测试.docx"
			_WpsInvoke([{
				"OpenDoc": {
					"uploadPath": uploadPath, // 保存文档上传接口(必填非空)
					"fileName": filePath, // 下载文档接口(必填非空)
					"uploadFieldName": uploadFieldName, // 上传文件字段(必填非空)
					"userName": openName, // 打开文档用户(必填非空)
					"publicationId":publicationId, // 清样ID
					"headerToken": token ,// 登录Token(必填非空)
					"openName":openFileName // 打开文档名称(不填会从下载文件响应头参数Content-Disposition中截取文件名，请确保该参数不出问题，否则会打开文档失败)
				}
			}])
}
```

## 3. 适用情况

- 目前能进行携带`token`进行请求只有文件（也就是打开word文档），若需要使用演示（ppt），表格（excel）请到对应目录下`\js\common`路径中找到`common.js`文件打开，搜索`UploadFile`找到方法，在原生AJAX请求中加入`xhr.setRequestHeader("x-gv-jwt-token", token);`即可进行身份验证。
- token可以通过参数传入，具体操作可以到`WpsOAAssist\js\`目录下中查看打开word文档演示代码。具体思路为：先在调用页面`_WpsInvoke()`传入自定义参数=>再到`XXXX\js\common\func_tabcontrol.js`文件找到相应方法（对应你在WPS里面的操作）中接收参数=>拿到参数再次传入指定执行方法，这些指定执行方法一般放在和`func_tabcontrol.js`文件同一目录下的`common.js`中。

## 4.WPS版本要求

- WPS Win：企业版：11.8.2.8808；个人版：11.1.0.9566；Linux 企业版：11.8.2.9346 ； 个人版暂不支持，它们之后的版本，含它们自己这些版本是稳定支持的，之前的2019版本也支持，不推荐用了，jsapi支持的不稳定。

