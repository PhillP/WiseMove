// http://blog.dee4star.com/integrating-knockoutjs-with-jquery-mobile-1

ko.virtualElements.allowedBindings.jqmforeach = true;
ko.bindingHandlers.jqmforeach = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        return ko.bindingHandlers['foreach']['init'](element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

        var output = ko.bindingHandlers['foreach']['update'](element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);

        if ($.mobile.activePage) {
            $.mobile.activePage.trigger('pagecreate');
        }

        var listview = null;

        if (element.nodeType == 8) {
            if (element.parentNode.tagName.toLowerCase() == 'ul' && element.parentNode.getAttribute('data-role') == 'listview')
                listview = element.parentNode;
        } else if (element.hasAttribute('data-role') && element.getAttribute('data-role') == 'listview')
            listview = element;

        if (listview) {
            try {
                $(listview).listview('refresh');
            } catch (e) {
                try { $(listview).listview(); } catch (e) { };
            }
        }

        var collapsibleset = null;

        if (element.nodeType == 8) {
            if (element.parentNode.tagName.toLowerCase() == 'div' && element.parentNode.getAttribute('data-role') == 'collapsible-set')
                collapsibleset = element.parentNode;
        } else if (element.hasAttribute('data-role') && element.getAttribute('data-role') == 'collapsible-set') {
            collapsibleset = element;
        } else if (element.collapsibleset) {
			collapsibleset = element.collapsibleset;
		}
        
        if (collapsibleset) {
			element.collapsibleset = collapsibleset;
			
			try {
                $(collapsibleset).collapsibleset('refresh');
            } catch (e) {
				try { $(collapsibleset).collapsibleset(); } catch (e) { };
            }
        }

        var properties = allBindingsAccessor().jmforeach;
        if (properties) {
            if (properties['onRendered']) {
                var value = valueAccessor();
                properties['onRendered'](element, value.data ? value.data : value);
            }

        }

        return output;
    }
};
        
// Extend ko with so it updates listview update items changed.
ko.bindingHandlers['jqmwith'] = {
  init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      return ko.bindingHandlers['with']['init'](element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
  },
  update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
    var output = ko.bindingHandlers['with']['update'](element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
    var e$ = $(element);

    try { e$.trigger('pagecreate'); } catch (e) { }

    if (e$.attr('data-role') == 'dialog') {
      e$.find('header').addClass('ui-corner-top');
      e$.find('footer').addClass('ui-corner-bottom');
    }

    return output;
  }
};

ko.bindingHandlers.jqmlinkbuttonenabled = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        // This will be called when the binding is first applied to an element
        // Set up any initial state, event handlers, etc. here
    },
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        // This will be called once when the binding is first applied to an element,
        // and again whenever the associated observable changes value.
        // Update the DOM element based on the supplied values here.
        var value = valueAccessor();
        var valueUnwrapped = ko.utils.unwrapObservable(value);
        
        if (valueUnwrapped){
			$(element).removeClass('ui-disabled');
 		}
		else {
			$(element).addClass('ui-disabled');
		}
    }
}
 
ko.bindingHandlers.popupvisible = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        // This will be called when the binding is first applied to an element
        // Set up any initial state, event handlers, etc. here
        ko.bindingHandlers.popupvisible.anyshown = false;
        ko.bindingHandlers.popupvisible.currentShown = null;
        ko.bindingHandlers.popupvisible.lastClose = null;
    },
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        // This will be called once when the binding is first applied to an element,
        // and again whenever the associated observable changes value.
        // Update the DOM element based on the supplied values here.
        var value = valueAccessor();
        var valueUnwrapped = ko.utils.unwrapObservable(value);
        var minMilisecondsSinceClose = 500;

        var timeout = 0;
        if (ko.bindingHandlers.popupvisible.anyshown)
        {
            timeout = minMilisecondsSinceClose;
        } else if (ko.bindingHandlers.popupvisible.lastClose) {
            var timeSinceLastClose = new Date().getTime() - ko.bindingHandlers.popupvisible.lastClose;

            if (timeSinceLastClose < minMilisecondsSinceClose) {
                timeout = minMilisecondsSinceClose - timeSinceLastClose;
            }
        }

        if (valueUnwrapped){
            window.setTimeout(function(){
				var options = {};
				
				if (allBindingsAccessor().popupoptions){
					options = allBindingsAccessor().popupoptions;
				}
				
				$(element).popup('open', options);
                ko.bindingHandlers.popupvisible.currentShown = element;
                ko.bindingHandlers.popupvisible.anyshown = true;
			},timeout);
			
 		}
		else {
            if(ko.bindingHandlers.popupvisible.anyshown){
               if (ko.bindingHandlers.popupvisible.currentShown == element) {
                   $(element).popup('close');
                   ko.bindingHandlers.popupvisible.currentShown = null;
                   ko.bindingHandlers.popupvisible.lastClose = new Date().getTime();
                   ko.bindingHandlers.popupvisible.anyshown = false;
               }
            }
		}
    }
};

ko.bindingHandlers.slidervalue = {
	init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        // This will be called when the binding is first applied to an element
        // Set up any initial state, event handlers, etc. here
		$(element).slider();
		
		//handle the field changing
        ko.utils.registerEventHandler(element, "change", function () {
            var observable = valueAccessor();
            observable($(element).val());
        });
    },
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        // This will be called once when the binding is first applied to an element,
        // and again whenever the associated observable changes value.
        // Update the DOM element based on the supplied values here.
        var value = valueAccessor();
        var valueUnwrapped = ko.utils.unwrapObservable(value);
        
        if (valueUnwrapped){
			$(element).val(valueUnwrapped);
			
 		}
		
		$(element).slider('refresh');
    }
};

ko.bindingHandlers.jqmfastclick = {
    'init' : function (element, valueAccessor, allBindingsAccessor, viewModel) {

        $(element).fastClick(function(event) {
                    var handlerReturnValue;
                    var handlerFunction = valueAccessor();
                    if (!handlerFunction)
                        return;

                    try {
                        handlerReturnValue = handlerFunction.apply(viewModel);
                    } finally {
                        if (handlerReturnValue !== true) { // Normally we want to prevent default action. Developer can override this be explicitly returning true.
                            if (event.preventDefault)
                                event.preventDefault();
                            else
                                event.returnValue = false;
                        }
                    }

                    event.cancelBubble = true;
                    event.stopPropagation();
                });
            }
        };
