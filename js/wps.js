var isServerOk = false
var isSetupOk = false
var pluginsMode = window.officeConfig.MODE; //0表示jsplugins.xml模式，1表示publish模式，2表示 多进程加动态传递jsplugins.xml模式
//publish自动安装开始
/*
 * 将自己的加载项地址配置到这里来
 * 需要保证加载项的name和业务业务系统中传递加载项name相对应
 * url必须以/ 结尾，且url+ribbon.xml和url+index.html在清除浏览器缓存的情况下能直接访问，不会被重定向
 * addonType:对应组件类型，wps文字，wpp演示，et表格
 */
//复制开始
//    var curList = [{"name":"EtOAAssist","addonType":"et","online":"false","url":"http://127.0.0.1/jsplugindir/EtOAAssist.7z","version":"1.0.0"}]; //离线模式参考
 
var curList = [{
		"name": "WpsOAAssist",
		"addonType": "wps",
		"online": "true",
		"url": window.officeConfig.WPS_URL
	},
	{
		"name": "EtOAAssist",
		"addonType": "et",
		"online": "true",
		"url": window.officeConfig.ETO_URL
	},
	{
		"name": "WppOAAssist",
		"addonType": "wpp",
		"online": "true",
		"url": window.officeConfig.WPP_Url
	}
] //在线模式配置参考
var localList = [];
var publishIndex = 0;
var publishUnIndex = 0;
/*获取用户本地全部加载项的接口是必须要的，这个接口做了判断，
 ** 如果58890端口未启动，会先去启动这个端口
 */
var pluginType = WpsInvoke.ClientType.wps //加载项类型wps,et,wpp
var pluginName = "WpsOAAssist"; //加载项名称
var wpsClient = new WpsClient(pluginType); //初始化一个多进程对象，多进程时才需要
var clientStr = pluginName + pluginType + "ClientId"
//加载项安装函数
function installWpsAddin(callBack) {
	WpsAddonMgr.getAllConfig(function(e) {

		if (!e.response || e.response.indexOf("null") >= 0) { //本地没有加载项，直接安装
			if (curList.length > 0) {
				installWpsAddinOne(callBack);
			}
		} else { //本地有加载项，先卸载原有加载项，然后再安装
			localList = JSON.parse(e.response)
			// if(e.response)
			unInstallWpsAddinOne(callBack)
		}

	})
}

//安装单个加载项
function installWpsAddinOne(callBack) {
	WpsAddonMgr.enable(curList[publishIndex], function(e) {
		if (e.status) {
			console.log(e.msg)
		} else {
			console.log("安装成功")
		}
		publishIndex++;
		if (publishIndex < curList.length) {
			installWpsAddinOne();
		} else {
			callBack && callBack()
		}
	})
}

//卸载单个加载项
function unInstallWpsAddinOne(callBack) {
	WpsAddonMgr.disable(localList[publishUnIndex], function(e) {
		if (e.status) {
			console.log(e.msg)
		} else {
			console.log("卸载成功")
		}
		publishUnIndex++;
		if (publishUnIndex < localList.length) {
			unInstallWpsAddinOne(callBack);
		} else {
			if (curList.length > 0) {
				installWpsAddinOne(callBack);
			}
		}
	})
}

//唤起WPS
function _WpsInvoke(funcs, front, jsPluginsXml, isSilent) {
	var jsPluginsXml = jsPluginsXml ? jsPluginsXml : window.officeConfig.XML_URL;
	var info = {};
	info.funcs = funcs;
	if (isSilent) { //隐藏启动时，front必须为false
		front = false;
	}
	installWpsAddin()
	/**
	 * 下面函数为调起WPS，并且执行加载项WpsOAAssist中的函数dispatcher,该函数的参数为业务系统传递过去的info
	 */
	if (pluginsMode != 2) { //单进程
		singleInvoke(info, front, jsPluginsXml, isSilent)
	} else { //多进程
		multInvoke(info, front, jsPluginsXml, isSilent)
	}

}


//单进程
function singleInvoke(info, front, jsPluginsXml, isSilent) {
	WpsInvoke.InvokeAsHttp(pluginType, // 组件类型
		pluginName, // 插件名，与wps客户端加载的加载的插件名对应
		"dispatcher", // 插件方法入口，与wps客户端加载的加载的插件代码对应，详细见插件代码
		info, // 传递给插件的数据
		function(result) { // 调用回调，status为0为成功，其他是错误
			if (result.status) {
				if (result.status == 100) {
					WpsInvoke.AuthHttpesCert('请在稍后打开的网页中，点击"高级" => "继续前往"，完成授权。')
					return;
				}
				alert(result.message)
			} else {
				console.log(result.response)
			}
		},
		front,
		jsPluginsXml,
		isSilent)
	/**
	 * 接受WPS加载项发送的消息
	 * 接收消息：WpsInvoke.RegWebNotify（type，name,callback）
	 * WPS客户端返回消息： wps.OAAssist.WebNotify（message）
	 * @param {*} type 加载项对应的插件类型
	 * @param {*} name 加载项对应的名字
	 * @param {func} callback 接收到WPS客户端的消息后的回调函数，参数为接受到的数据
	 */
	WpsInvoke.RegWebNotify(pluginType, pluginName, handleOaMessage)
}

//多进程
function multInvoke(info, front, jsPluginsXml, isSilent) {
	wpsClient.jsPluginsXml = jsPluginsXml ? jsPluginsXml : window.offConfig.XML_URL;
	if (localStorage.getItem(clientStr)) {
		wpsClient.clientId = localStorage.getItem(clientStr)
	}
	if (isSilent) {
		wpsClient.StartWpsInSilentMode(pluginName, function() { //隐藏启动后的回调函数
			mult(info, front)
		})
	} else {
		mult(info, front)
	}
	wpsClient.onMessage = handleOaMessage
}

//多进程二次封装
function mult(info, front) {
	wpsClient.InvokeAsHttp(
		pluginName, // 插件名，与wps客户端加载的加载的插件名对应
		"dispatcher", // 插件方法入口，与wps客户端加载的加载的插件代码对应，详细见插件代码
		info, // 传递给插件的数据        
		function(result) { // 调用回调，status为0为成功，其他是错误
			if (wpsClient.clientId) {
				localStorage.setItem(clientStr, wpsClient.clientId)
			}
			if (result.status !== 0) {
				console.log(result)
				if (result.message == '{\"data\": \"Failed to send message to WPS.\"}') {
					wpsClient.IsClientRunning(function(status) {
						console.log(status)
						if (status.response == "Client is running.")
							alert("任务发送失败，WPS 正在执行其他任务，请前往WPS完成当前任务")
						else {
							wpsClient.clientId = "";
							wpsClient.notifyRegsitered = false;
							localStorage.setItem(clientStr, "")
							mult(info)
						}
					})
					return;
				} else if (result.status == 100) {
					// WpsInvoke.AuthHttpesCert('请在稍后打开的网页中，点击"高级" => "继续前往"，完成授权。')
					return;
				}
				alert(result.message)
			} else {
				console.log(result.response)
			}
		},
		front)
}

function GetDemoPngPath() {
	var url = document.location.toString();
	url = decodeURI(url);
	if (url.indexOf("/") != -1) {
		url = url.substring(0, url.lastIndexOf("/"));
	}
	if (url.length !== 0)
		url = url.concat("/WPS.png");

	if (!String.prototype.startsWith) {
		String.prototype.startsWith = function(searchString, position) {
			position = position || 0;
			return this.indexOf(searchString, position) === position;
		};
	}

	if (url.startsWith("file:///"))
		url = url.substr("file:///".length);
	return url;
}

// wps回调函数
function handleOaMessage(data) {
	console.log(data)
}

function handleOaFunc2(message) {
	alert("我是函数handleOaFunc2，我接收到的参数是：" + message)
	// var span = window.parent.document.getElementById("webnotifyspan")
	// span.innerHTML = message
}

