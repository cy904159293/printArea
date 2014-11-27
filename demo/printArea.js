/* �Զ��� jQuery ��ӡ��� */
(function ($) {
	var option = {};
    var defaultOption = {
		extraCssHref : "", // ���������CSS��ַ����
		title : document.title // ��������ñ���ͷ
    }; //TODO ����
    var printAreaCount = 0; // ��ӡ���
    
    var PrintArea = {
    	/**
    	 * ɾ����ӡ����
    	 */
        _removePrintArea : function (id) {
            $("iframe#" + id).remove();
        },
        
        /**
         * ������ӡ���� - IframeԪ��
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
         * ������ӡ���� - HeadԪ��
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
         * ������ӡ���� - StyleԪ��
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
         * ������ӡ����
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
        setTimeout( function () { // ���û�����У��ڹȸ���������ܻ����ӡԤ��������
        	$(frameWindow.document).ready(function() {
        		frameWindow.focus(); // focus on contentWindow is needed on some ie versions
        		frameWindow.print();
        	});
        }, 1000 );
    };

})(jQuery);