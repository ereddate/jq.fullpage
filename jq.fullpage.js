;(function(win, $){
				var doc = win.document;
				//console.log(win.navigator.userAgent)
				var ua = win.navigator.userAgent.toLowerCase(),
					isMobile = function() {
						return /iphone|ipad|ipod/.test(ua) || (/android/.test(ua) && /mobile/.test(ua)) || /mobile/.test(ua);
					},
					isTouch = 'ontouchstart' in window,
					time = 500,
					aniTimeout,
					localStorage = win.localStorage;

				var swipeDirection = function(x1, x2, y1, y2) {
					return Math.abs(x1 - x2) >=
						Math.abs(y1 - y2) ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
				};

				$.fn.swipe = function() { //单手势
					var args = arguments,
						len = args.length;
					if (len == 2) {
						var touch = {},
							ftouch, swipeTimeout;
						$(this).off("touchstart").on("touchstart", function(e) {
							swipeTimeout && clearTimeout(swipeTimeout);
							ftouch = e.originalEvent.touches[0];
							touch.x1 = ftouch.pageX;
							touch.y1 = ftouch.pageY;
						}).off("touchmove").on("touchmove", function(e) {
							ftouch = e.originalEvent.touches[0];
							touch.x2 = ftouch.pageX;
							touch.y2 = ftouch.pageY;
						}).off("touchend").on("touchend", function(e) {
							if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > 30) || (touch.y2 && Math.abs(touch.y1 - touch.y2) > 30))
								swipeTimeout = setTimeout(function() {
									var direction = swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2);
									if (/Up|Left/.test(direction)) args[0]();
									if (/Down|Right/.test(direction)) args[1]();
									touch = {}
								}, 0);
						}).off("touchcancel").on("touchcancel", function(e) {
							swipeTimeout && clearTimeout(swipeTimeout);
						});
					}
					return this;
				};

				$.fn.mousewheel = function() { //滚轮控制
					var args = arguments,
						len = args.length;
					if (len == 2) {
						$(this).off("mousewheel").on("mousewheel", function(e) {
							if (e.originalEvent.deltaY > 0)
								args[0]();
							else if (e.originalEvent.deltaY < 0)
								args[1]();
							/*if (e.deltaX > 0)
							    o += ' east (' + e.deltaX + ')';
							else if (e.deltaX < 0)
							    o += ' west (' + e.deltaX + ')';
							o += ' deltaFactor (' + e.deltaFactor + ')';*/
						});
					}
					return this;
				};

				$.fn.keySwipe = function() { //键盘控制
					var args = arguments,
						len = args.length;
					if (len == 2) {
						$(this).off("keyup").on("keyup", function(e) {
							if (e.originalEvent.keyCode == 40 || e.originalEvent.keyCode == 39) {
								args[0]();
							} else if (e.originalEvent.keyCode == 38 || e.originalEvent.keyCode == 37) {
								args[1]();
							}
						});
					}
					return this;
				};

				var handle = {
					_initPage: function(target) {
						var cls = target.cls;
						var pages = target.jq.find("." + cls.rightNavCls).html("").parent().find("." + cls.pageCls),
							pageLen = pages.length,
							pageHeight = $(win).height(),
							pageWidth = $(win).width();

						target.jq.css({
							width: pageWidth,
							height: pageHeight * pageLen
						});

						target.pages = pageLen;

						pages.each(function(i, elem) {
							$(elem).css($.extend({
								top: 0,
								height: pageHeight
							}, (/left/.test(target.direction) ? {
								top: pageHeight * i
							} : {
								left: pageWidth * i
							}))).parent().find("." + cls.rightNavCls).append($("<span></span>").addClass(cls.rightNavButtonCls).off("click").on("click", function() {
								target.page = i;
								target.goPage();
							})[(!isMobile() ? "show" : "hide")]());
						});

						$("." + cls.prevCls).hide().off("click").on("click", function() {
							target.nextPage();
						});
						$("." + cls.nextCls).hide().off("click").on("click", function() {
							target.prevPage();
						});

						localStorage && target.nocache && localStorage.removeItem(target.cacheName);

						var lPageNum = localStorage && parseFloat(localStorage.getItem(target.cacheName)) || 0;

						handle._buttonShow(target, lPageNum);

						if (target.mousewheel)
							$(win).mousewheel(function() {
								target.prevPage();
							}, function() {
								target.nextPage();
							});

						if (isMobile() && isTouch) {
							target.jq.swipe(function() {
								target.prevPage();
							}, function() {
								target.nextPage();
							});
						}

						if (target.keySwipe) {
							$(win).keySwipe(function() {
								target.prevPage();
							}, function() {
								target.nextPage();
							});
						}

						localStorage && localStorage.setItem(target.cacheName, lPageNum);
						target.goPage(lPageNum || 0);

					},
					_prevPage: function(target) {
						target.timeout && clearTimeout(target.timeout);
						target.timeout = setTimeout(function() {
							handle._go(target, -1);
						}, time);
					},
					_nextPage: function(target) {
						target.timeout && clearTimeout(target.timeout);
						target.timeout = setTimeout(function() {
							handle._go(target, 1);
						}, time);
					},
					_go: function(target, type) {
						var pages = target.jq.find("." + target.cls.pageCls),
							page = target.page;
						page = page - type;
						if (page <= 0) page = 0;
						else if (page >= target.pages - 1) page = target.pages - 1;

						if (page != target.page) {
							handle._buttonShow(target, page);
							handle._animate(target, page, type);
						}
					},
					_buttonShow: function(target, page) {
						var cls = target.cls;
						if (page == 0) {
							$("." + cls.prevCls).hide();
							$("." + cls.nextCls).show();
						} else if (page == target.pages - 1) {
							$("." + cls.prevCls).show();
							$("." + cls.nextCls).hide();
						} else {
							$("." + cls.prevCls + ",." + cls.nextCls).show();
						}
					},
					_rightNavButtonActive: function(target, page) {
						var cls = target.cls;
						$("." + cls.rightNavCls).find("." + cls.rightNavButtonCls).removeClass(cls.rightNavButtonActive).eq(page).addClass(cls.rightNavButtonActive);
					},
					_animate: function(target, page, type) {
						target.page = page;
						localStorage && localStorage.setItem(target.cacheName, page);
						handle._rightNavButtonActive(target, page);
						target.handle[page] && target.handle[page].loading && target.handle[page].loading(page + 1);
						target.jq.animate($.extend({
							top: 0
						}, (/left/.test(target.direction) ? {
							top: "-" + page * $(win).height()
						} : {
							left: "-" + page * $(win).width()
						})), time, function() {
							target.handle[page] && target.handle[page].loaded && target.handle[page].loaded(page + 1);
						});
					}
				};

				var fullpage = function(ops) {
					return new fullpage.fn.init(ops);
				};
				fullpage.fn = fullpage.prototype = {
					init: function(ops) {
						this.page = 0;
						this.mousewheel = false;
						this.direction = "leftRight";
						this.keySwipe = false;
						this.handle = [];
						this.nocache = false;
						this.cls = {
							prevCls: "prev",
							nextCls: "next",
							rightNavCls: "page_nav",
							rightNavButtonCls: "page_nav_choose",
							rightNavButtonActive: "on",
							pageCls: "page"
						};
						this.cacheName = "fullpage_pagenum";
						$.extend(this, ops);
						handle._initPage(this);
						var self = this;
						$(win).on("resize", function() {
							self.refresh();
						});
						return this;
					},
					refresh: function() {
						handle._initPage(this);
						return this;
					},
					prevPage: function() {
						var self = this;
						self.pageTimeout && clearTimeout(self.pageTimeout);
						self.pageTimeout = setTimeout(function() {
							handle._prevPage(self);
						}, time);
						return this;
					},
					nextPage: function() {
						var self = this;
						self.pageTimeout && clearTimeout(self.pageTimeout);
						self.pageTimeout = setTimeout(function() {
							handle._nextPage(self);
						}, time);
						return this;
					},
					goPage: function(num) {
						num = num || this.page || 0;
						handle._animate(this, num);
						return this;
					}
				};
				fullpage.fn.init.prototype = fullpage.fn;

				fullpage.isMobile = isMobile;

				$.fn.fullpage = function(ops) {
					return fullpage($.extend(ops || {}, {
						main: $(this).selector,
						jq: $(this)
					}));
				};

				/* 用法如下
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
				});*/
			})(this, jQuery)
