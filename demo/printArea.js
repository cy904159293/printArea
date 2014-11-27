/* 自定义 jQuery 打印插件 */
(function ($) {
	var option = {};
    var defaultOption = {
		extraCssHref : "", // 额外可设置CSS地址链接
		title : document.title // 额外可设置标题头
    }; //TODO 配置
    var printAreaCount = 0; // 打印序号
    
    var PrintArea = {
    	/**
    	 * 删除打印区域
    	 */
        _removePrintArea : function (id) {
            $("iframe#" + id).remove();
        },
        
        /**
         * 创建打印区域 - Iframe元素
         */
        _buildIframe : function(id) {
            var iframeId = id;
            var iframe = document.createElement('IFRAME');
            var iframeStyle = 'border:0;position:absolute;width:0px;height:0px;right:0px;top:0px;';
            $(iframe).attr({
                style: iframeStyle,
                id: iframeId
            });
            document.body.appendChild(iframe);
            return iframe;
        },
        
        /**
         * 创建打印区域 - Head元素
         */
        _buildHead : function() {
            var links = "";

            $(document).find("link")
                .filter(function(){ // Requirement: <link> element MUST have rel="stylesheet" to be considered in print document
                        var relAttr = $(this).attr("rel");
                        return ($.type(relAttr) === 'undefined') == false && relAttr.toLowerCase() == 'stylesheet';
                    })
                .filter(function(){ // Include if media is undefined, empty, print or all
                        var mediaAttr = $(this).attr("media");
                        return $.type(mediaAttr) === 'undefined' || mediaAttr == "" || mediaAttr.toLowerCase() == 'print' || mediaAttr.toLowerCase() == 'all';
                    })
                .each(function(){
                        links += '<link type="text/css" rel="stylesheet" href="' + $(this).attr("href") + '" >';
                    });
            if (option.extraCssHref) {
            	links += '<link type="text/css" rel="stylesheet" href="' + option.extraCssHref + '">'; // extra css
            }

            return "<head><title>" + option.title + "</title>" + links + this._buildStyle() + "</head>";
        },

        /**
         * 创建打印区域 - Style元素
         */
        _buildStyle : function() {
            var style = "<style>";

            $(document).find("style")
                .each(function(){
                	style += this.innerHTML;
                    });

            return style + "</style>";
        },
        
        /**
         * 创建打印区域
         */
        _buildPrintArea : function(iframe, $ele) {
        	 var doc = iframe.contentDocument ? iframe.contentDocument : ( iframe.contentWindow ? iframe.contentWindow.document : iframe.document);
             var htmlStr = "<!DOCTYPE html>" + this._buildHead();
             $ele.each(function() {
               htmlStr += '<div class="' + $(this).attr("class") + '">' + $(this).html() + '</div>';
             });
             htmlStr += "</html>";
             doc.open();
             doc.write(htmlStr);
             doc.close();
             var frameWindow = iframe.contentWindow;
             return frameWindow;
        }
    };

    $.fn.printArea = function (options) {
        $.extend( option, defaultOption, options );
        var $ele = $(this);
        var idPrefix = "printArea_";
        PrintArea._removePrintArea(idPrefix + printAreaCount);
        printAreaCount++;
        var iframe = PrintArea._buildIframe(idPrefix + printAreaCount);
        var frameWindow = PrintArea._buildPrintArea(iframe, $ele);
        setTimeout( function () { // 如果没有这行，在谷歌浏览器可能会出打印预览的问题
        	$(frameWindow.document).ready(function() {
        		frameWindow.focus(); // focus on contentWindow is needed on some ie versions
        		frameWindow.print();
        	});
        }, 1000 );
    };

})(jQuery);