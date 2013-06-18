// ------------------------------------------------------------------
//  The code in this file:
//       - controls the initialisation process for the WiseMove app
//       - loads page content into the DOM
//
//  The main application logic for WiseMove is contained within wisemove-logic.js
// ------------------------------------------------------------------

// array used for google analytics
var _gaq = _gaq || [];

// The main application controller
var AppController = function(){
	var self = this;
	self.mapPageLoaded = false;

    // function used to recursively load content from files into the DOM
	self.loadElementParts = function(elementId, isFirst){
		if (isFirst) {
			self.partsToLoad = 0;
		}
		else {
			self.partsToLoad--;
		}
		
		$("#" + elementId + " div").each(function(i, j) {
				var childElementId = $(this).attr('id');
				
				if (childElementId && (childElementId.endsWith("Part") || childElementId.endsWith("Page"))) {
					self.partsToLoad++;
					
					var partName = childElementId;
					var lastSeperator = partName.lastIndexOf("_");
					if (lastSeperator >= 0) {
						partName = partName.substring(lastSeperator + 1);
					}
					
					$.get("parts/" + partName + ".html", function(data) { 
						$("#" + childElementId).empty().html(data);
						self.loadElementParts(childElementId);
					});
				}
			});
		
		if (self.partsToLoad == 0){
			self.partsLoaded();
		}
	}
	
	// handler fired whenever a page is shown
    self.handlePageShow = function (pageId) {
        if (typeof app !== 'undefined' && app.configuration.ANALYTICS_ENABLED) {
            _gaq.push(['_trackPageview', app.configuration.ANALYTICS_URL + $.mobile.activePage.attr('id')]);
        }
        self.resizePages(pageId);

        $.mobile.silentScroll(0);
	}

	// function used to resize pages (required at a minimum whenever orientation is changed or the browser resized)
	self.resizePages = function (pageId) {
        // ---- Constant values used in page resizing logic
        // ---- Ideally, this set will be reduced or removed
        var default_height_padding = 34;
        var default_footer_height = 60;
        var default_header_height = 43;
        var map_footer_height = 63;
        var map_header_height = 42;
        var chart_height_padding = 25;
        var chart_content_width_total_margin = 80;
        var chart_content_height_total_margin = 220;
        var home_main_default_height = 280;
        var search_container_spacing = 25;
        // -------------------------------------------------

        $('[data-role="page"]').each(function() {
            if (typeof pageId  === "undefined" || pageId == $(this).attr("id"))
            {
                var height_padding = default_height_padding;

                var footerHeight = $(this).find('[data-role="footer"]').height();
                var headerHeight = $(this).find('[data-role="header"]').height();

                if (!footerHeight) {footerHeight = default_footer_height};
                if (!headerHeight) {headerHeight = default_header_height};

                if ($(this).attr("id") == "mapPage"){
                    height_padding = 0;
                    footerHeight=map_footer_height;
                    headerHeight=map_header_height;
                }

                if ($(this).attr("id") == "chartPage"){
                    height_padding = chart_height_padding;
                }

                var contentHeight = $(window).height() - footerHeight - headerHeight - height_padding;
                var contentWidth = $(window).width();

                $(this).find('[data-role="content"]').height(contentHeight);

                if ($(this).attr("id") == "chartPage"){
                    $("#plotChart").width(contentWidth - chart_content_width_total_margin);
                    $("#plotChart").height(contentHeight - chart_content_height_total_margin);
                }

                if ($(this).attr("id") == "homePage"){
                    var homeMainHeight = $("#homeMain").height();
                    if (!homeMainHeight) {homeMainHeight = home_main_default_height};

                    $("#homeSpacer").height((contentHeight - homeMainHeight) / 2.0);
                }

                if ($(this).attr("id") == "mapPage"){
                    var toolbarButtonDivWidth = $("#toolBarButtonDiv").width();
                    $("#searchContainer").width(contentWidth - (toolbarButtonDivWidth + search_container_spacing));
                    $("#map").height(contentHeight);
                    $("#map").width(contentWidth);
                }

                if(typeof app !== "undefined" && $(this).attr("id") != "aboutPage") {
                    if(app && app.viewModel){
                        app.viewModel.saveCurrent();
                    }
                }
            }
        });
	}

    // Handler fired when all parts have been loaded into the DOM
	self.partsLoaded = function(){
        // make sure we only add the back point to the back buttons
        var backButton = $('a[data-theme="app-ios"]').filter('[data-rel="back"]');
        backButton.find('.ui-icon').remove(); // remove icon (if it's found)
        backButton.append('<div class="ios-tip"><span>&nbsp;</span></div>');

        $.mobile.initializePage();
        
		$('[data-role="page"]').each(function() {
			$(this).page();
            $('#' + $(this).attr("id")).on("pagebeforeshow", function(ev) { self.handlePageShow($(this).attr("id")); });
		});
		
		$(window).bind('orientationchange', function() { self.resizePages(); });

         setTimeout(function() {
             $.mobile.changePage("#homePage");
             self.resizePages("chartPage");
             $.mobile.defaultPageTransition = 'none';
         }, 500);

        if(typeof app === 'undefined'){
            app = new wisemove.App(document.getElementById('map'));
            app.run();
        }

        $('#mapPage').bind('pageshow', function(){
            app.viewModel.mapViewModel.onPageShow();
        });
		
		$('[data-role="popup"]').on({
			popupbeforeposition: function () {
			$('.ui-popup-screen').remove();
		}});

        if (app.configuration.APP_NEWS_ENABLED) {
            $.getJSON(app.configuration.APP_NEWS_URL + "?callback=?", null, function(data) {
                $("#homeDynamic").empty().html(data.message);
                self.handlePageShow('homePage');
            });
        }
	}

    self.safeParseInt = function(val, fallback) {
        var returnVal = fallback;

        if (val) {
            var parsedVal = parseInt(val);

            if (parsedVal && !isNaN(parsedVal)){
                returnVal = parsedVal;
            }
        }

        return returnVal;
    }

    // When this controller is initialised, load all the required content into the DOM
	self.init = function(){
		self.loadElementParts("main", true);
	}
};

$(document).ready(function() {
    // In PhoneGap deployments this code should only be run once deviceready
    //document.addEventListener("deviceready", function() {
        var appControl = new AppController();
        appControl.init();

        var config = new wisemove.Configuration();

        if (config.ANALYTICS_ENABLED) {
            _gaq.push(['_setAccount', config.ANALYTICS_KEY]);

            (function() {
                var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
                ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
                var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
            })();
        }
    //});
});

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

Array.prototype.addRange = function(array)
{
    this.push.apply(this, array)
}

$(document).bind("mobileinit", function(){
  $.mobile.pageContainer = $('#main');
  $.mobile.buttonMarkup.hoverDelay=100;
  $.mobile.autoInitialize = false;
  $.mobile.defaultPageTransition = 'none';
});

