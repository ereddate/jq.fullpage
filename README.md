# jq.fullpage
jq.fullpage 是以jQuery为基础开发的全屏网页插件，对不同设备的判断通过多种方式的控制来实现交互。

#用法

用法如下
				$(".main").fullpage({
					mousewheel: true, //启用滚轮控制
					keySwipe: true, //启用键盘方向控制
					direction: "leftRight", //翻屏方向，还有就是“upDown”
					nocache: false, //本地是否保存页号
					handle: [{ //每页的加载前事件和加载后事件
						loading: function(num) {
							console.log(num)
							console.log("nexting 1")
						},
						loaded: function(num) {
							console.log(num)
							console.log("next callback 1")
						}
					}, {
						loading: function(num) {
							console.log(num)
							console.log("nexting 2")
						},
						loaded: function(num) {
							console.log(num)
							console.log("next callback 2")
						}
					}, {
						loading: function(num) {
							console.log(num)
							console.log("nexting 3")
						},
						loaded: function(num) {
							console.log(num)
							console.log("next callback 3")
						}
					}]
				});

	#功能
	
	功能包括自适应、单指手势控制、滚轮控制、键盘方向控制、控件设置、方向设置、本地存储当前页号、页的加载前和加载后事件等。
