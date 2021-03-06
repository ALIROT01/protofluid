jwt.jwtComponentConfigFull = (function() {
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    return {
        Definition: 'jwtComponentConfigFull',
        //loader jquery find using filter string
        filterString: "input[id],  div [id^='XX'] ",
        //loader uses to find the number of lines in the form
        lineString: "input[id^='XX_LIN_LN']",
        //used by the template loader factory creates the page
        loadTemplate: jwt.templates.loadFullTemplate,
        //name of tamplate object mapped to template file in template_hash
        templateName: 'FullTemplate',
        //used by page loader to find header inputs and divs
        headerMatch: "XX_HDR",
        //used by the loader to find lines
        lineMatch: /\d+/g,
        //used to store javascript object
        //save warning will reset dirty to false on these routes
        saveMethods: "XX_HPB_350,XX_HPB_001",
        //page loader will check this value on the callback
        //if its set will runt he approver route
        //value is set on certain routes
        useAlternateCallback: false,
        //url string for the server component controller
        formAction: '/EMPLOYEE/ERP/c/XX_AP_CUSTOM_MENU.XX_FCM289_APPR.GBL',
        //url for direct links
        url: ['/EMPLOYEE/ERP/s/WEBLIB_XX_NAV.WEBLIB_FUNCTION.FieldFormula'
	      +'.iScript_xxViewRPayInvoice?INSTANCEID='],
        //page level edits
        editArray: ["msg-req-001", "msg-val-in-001", "msg-val-id-001"
		    , "msg-val-numbers", "msg-isFDApprove"],

        //could be used to do some initalization
        init: function() {},
	
	//get subcat is called from the main callback.
	//first it must make calls for project attributes once returned the
	//the links to the po and project jacket are bound to the elements along
	//witht the pop up data.  another call is made to retrieve po data used in
	//the pop up
	
   getPO_SubCat_Data_Add_Links: function(config) {
            var promises = [];
            var that = this;
            jwt.user.hasPO = false;

       _.each(jwt.invoice.sections, function(obj) {
           var def = new jQuery.Deferred();
	      //the system via the initial parse callback has determined this value
              if (obj.SectionHeader.po) {
                  jwt.user.hasPO = true
		  //lock down any vendor canges when PO exists
                  jQuery("#s2id_loc_S2_XX_HDR_VI .select2-search-choice-close")
		      .css("right", "0px");
              }
	        //request project data and set up promise
		jwt.jwtData.init('xx_proj_attrtbl'
				 , jwt.jwtData.Configs['xx_proj_attrtbl']
				 , [obj.SectionHeader.pi], def);
                promises.push(def);
            });

            var url_jwt = document.URL.replace(/\/\s*$/, '').split('/');

	    //once done the line section links are in a position to be completed
	    //pop up data is ready or can be called for
       jQuery.when.apply(undefined, promises).promise().done(
              function() {
                  _.each(jwt.invoice.sections, function(obj) {
                     //get the porject id and project level data
                     var piData = jwt.jwtData
			    .xx_proj_attrtbl["_"
					     + obj.SectionHeader.pi.hashCode()];
		      
		      //these data are what was needed to populate the iScripts for
		      //the clikcs on the links below
                     obj.SectionHeader.bu = piData.BUSINESS_UNIT;
                     obj.SectionHeader.ou = piData.OPERATING_UNIT;
                     obj.SectionHeader.pt = piData.PROJECT_TYPE;

                     //decode the data before sending to the tooltip
                     jwt.jwtData.decode(piData);

                      //project tooltip
                var outHTML = jwt.Mustache.to_html(
			  jwt.templates['TOOLTIP_PROJECT_INFO'], piData);
                      jQuery('[data-link-id="' + obj.SectionHeader.pi + '"]')
			  .html(outHTML);

                      // make an ajax call to get the po data
		      // display the the tooltip information
                      jwt.jwtData.init('xx_po_rpt', jwt.jwtData.Configs[
			  'xx_po_rpt'], [obj.SectionHeader.po]);

                      //the project type and business unit will be needed when
		      //the drop down is clicked by the user
                      //put it here so we can have it later
	        var key = obj.SectionHeader.bu + obj.SectionHeader.pt;
                      jQuery(".loc_XX_LIN_SC[data-pi='" + obj.SectionHeader.pi
			     + "']").attr('data-pt-bu', key);

                var urlqryString = "?BUSINESS_UNIT="
			  + obj.SectionHeader.bu + "&OPERATING_UNIT="
			  + obj.SectionHeader.ou + "&PROJECT_ID="
			  + obj.SectionHeader.pi + "&PO_ID="
			  + obj.SectionHeader.po;
		      
		//add click events for links for line  section groups
                jQuery(".group[data-key='" + obj.SectionHeader.key
			     + "']").find(".xx-link-pi-setup ,"
                             + " .xx-link-po-modify, .xx-link-pj"
                             + " , .xx-link-estimate")
                         .click(
                            function(event) {
                              event.preventDefault();
			      window.open("http://" + location.host + "/psc/"
		              + url_jwt[4]
		 + "_newwin/EMPLOYEE/ERP/s/WEBLIB_XX_NAV.WEBLIB_FUNCTION."
		 + "FieldFormula.iScript_"
		 + jQuery(this).attr("data-script-id") + urlqryString, '', '');
                                });
		      //po link click event
                      jQuery(".group[data-key='" + obj.SectionHeader.key
			     + "']").find(".xx-link-po-view")
			     .click(function(event) {
				 jwt.jwtComponent.getData(
				     'jwt.jwtComponentConfigFull', null,
				     this.form, jQuery(this).attr(
					 "data-script-id"));
                             });
		      
                    });
                }); /*end the done for all the project data */
        }/*end the sub cat method*/ ,

   controller: function(elem) {
            //function called by page loader before post.
	    // handles updating form elements
            // with values before trip to server.
        jQuery('#XX_HDR_HC').val(jQuery('#loc_XX_HDR_HC').val());
        jQuery('#XX_HDR_PY').val(jQuery('#loc_XX_HDR_PY').val());
        (jQuery('.NL-check').val()) ? jQuery('#XX_HDR_VL').val(""): null;
        jQuery(".ps-check").each(
           function(index) {
               var valcheck = (
		   (jQuery(this).next().hasClass("checked")) ? "Y" : "N")
                    jQuery(this).val(valcheck);
                }
            )
        },

   callbackAlternate: function(config) {
       // alternate call back is used to pop up the approval model
       // the page build will happen exactly the same as the user may
       // decide to cancel out of the modal
       // that would unhide the page
       jwt.invoice.keepHidden = true;
       //load the template for this page but hide the page
       //now run the pop template
       jwt.templates.loadTemplate(jwt.jwtComponentConfigApprove);
        },

    callback: function(config) {
       //main callback for final display related activities
	//the template has rendered the page its now time for a final logic
	//for display
       jwt.functions.addlines();

	jQuery("[id^='XX_LIN_MA'] , #XX_HDR_GA , #XX_HDR_RA, #XX_HDR_UT"
	       + ", #XX_HDR_ST")
	    .change(function() {
                jwt.functions.addlines();
            });

            //funciton will build all the select2 drop downs
            jwt.functions.createS2_header();

	//work to pull reference data for po and project
	//used for links ad mouse overs
            config.getPO_SubCat_Data_Add_Links(config);

	//split button logic
            var splitBtn = jQuery('.x-split-button');
            jQuery('.x-button-drop').on('click', function() {
                event.preventDefault();
                if (!splitBtn.hasClass('open'))
                    splitBtn.addClass('open');
            });
            jQuery('.x-split-button').click(function(event) {
                event.stopPropagation();
            });
            jQuery('html').on('click', function() {
                if (splitBtn.hasClass('open'))
                    splitBtn.removeClass('open');
            });

            // the wire flag drive the display of the hold flag
        (jQuery('#loc_XX_HDR_WI').val() == "on")
	    ? jQuery('#loc_XX_HDR_HF').attr("disabled", true): false;

        //all the check boxes need to be rendered as pretty checkable
	//controls and their values set
        jQuery(".ps-check").each(
            function(index) {
               jQuery(this).prettyCheckable();
		(jwt.invoice.header[jQuery(this).data('ps-id')] == "Y")
		    ? jQuery(this).prettyCheckable('check')
		    : jQuery(this).prettyCheckable('uncheck');
                });

            //changing the wire flag has impacts on other elements
            jQuery('#loc_XX_HDR_WI').on('change', function(event) {
                (jQuery('#loc_XX_HDR_WI').prop("checked") == true)
		    ? jQuery('#loc_XX_HDR_HF').prettyCheckable('check')
		    : jQuery('#loc_XX_HDR_HF').prettyCheckable('uncheck');
                (jQuery('#loc_XX_HDR_WI').prop("checked") == true)
		    ? jQuery('#loc_XX_HDR_HF').prettyCheckable('disable')
		    : jQuery('#loc_XX_HDR_HF').prettyCheckable('enable');
                (jQuery('#loc_XX_HDR_WI').prop("checked") == true)
		    ? jQuery('#loc_XX_HDR_HF').val("Y")
		    : jQuery('#loc_XX_HDR_HF').val("N");
            });

            //render the date picker...
 	    //this is the only jquery ui control being used
            jQuery("#XX_HDR_ID").datepicker();

            //try to make sense out of the back end table delivered
	    //as xml and rendered as a googl visualization table
            jwt.functions.cleanWorkFlowData();

	    //approvers get only the vendor for the invoice
            if (jwt.user.isApprover) {
                jwt.jwtData.init('XX_289_D_VND_LC_SINGLE'
		     , jwt.jwtData.Configs['XX_289_D_VND_LC_SINGLE']
	             , [encodeURIComponent(jwt.invoice.header.XX_HDR_VI
		      + jwt.invoice.header.XX_HDR_VL)]);
            } else {
                //the no vendor location check box
                jwt.functions.setupNLCheck(jwt.functions.setupNLCheck);
            }

            //the alternate branch is followed and then reset
            if (config.useAlternateCallback == true) {
                config.useAlternateCallback = false;
                config.callbackAlternate();
            }

        // running edit loader here will display all the server errors
	// using the error conroller logic
            jwt.routes.run_Edits('jwtComponentConfigFull', jwt.invoice);

	// bind the clicks to those buttons based on the routes
	// that are configured
        jwt.routes.xx_bind_buttons();

        // functionality to configure fields to drive display
	// and edit properties
	var fieldList = _.filter(jwt.fields, function(obj) {
                return obj.hasOwnProperty('canViewFunc')
            });
            _.each(fieldList, function(obj) {
                (obj.canViewFunc()) ? jQuery("." + obj.Definition).remove()
		    : "";
            });
          fieldList = _.filter(jwt.fields, function(obj) {
                return obj.hasOwnProperty('canEditFunc')
            });
            _.each(fieldList, function(obj) {
                canEdit = obj.canEditFunc();
                (canEdit) ?
		    jwt.invoice.user.canEdit[obj.Definition] = "disabled"
		    : "";
            });

            //payent note needs some love
            if (!jQuery('#loc_XX_HDR_PY').val()) {
                jQuery('#loc_XX_HDR_PY').select2("val", "none");
            }

            if (jQuery('#loc_XX_HDR_PY').val() != "none") {
                jQuery("#XX_HDR_PN").show();

            } else {
                jQuery("#XX_HDR_PN").hide();
            }

            jQuery('#loc_XX_HDR_PY').change(function() {
                if (jQuery('#loc_XX_HDR_PY').val() != "none") {
                    jQuery("#XX_HDR_PN").show();
                } else {
                    jQuery("#XX_HDR_PN").hide();
                }
            });

            // if we are sas Do some special stuff
            if (!jwt.user.isSAS) {
                jQuery(".rf-hdr-pm").hide();
                jQuery(".rf-hdr-sb").hide();
                jQuery(".rf-hdr-hc").hide();
                jquery(".rf-hdr-hf").hide();
            }

            if (jwt.user.isLocked || !jwt.user.isSAS) {
                jQuery(".vl-check").hide();
            }

// line two section logic
// there are two lines per charge row that can be shown to the user
// the second line for each charge row is usually hidden
// the second row can show asset or quantity information
// the line quantity and unit price inputs are added and stored
// in the ma field on the first l
// ma is monetary amount
	 
         //start with the lines hiddens
        jQuery(".line2").hide();

        //find rows to unhide
        var foundlines = _.filter(jwt.lines, function(obj) {
                return (
		    //Amount only are also referred to as qty based
		    obj.XX_LIN_AO == "N"
		    //asset flag is on
			|| obj.XX_LIN_AF == "Y"
		    //asset profile and asset id will also display lines
			|| obj.XX_LIN_AP
			|| obj.XX_LIN_AI)
            });

	  //do the work on the lines
            _.each(foundlines, function(obj) {
                var rowID = obj.ROW;
                //unhide the line 
                jQuery(".line2[data-row-id='" + rowID + "']")
                    .show()
                // AO or amount only is the equivalent of a quantity based PO
                // quantity based PO will show the line two feilds as
		// editable inputs
                // also disable the line one ma field..monetary amount
                if (obj.XX_LIN_AO == "N") {
                  jQuery(".line2[data-row-id='" + rowID + "']")
			.find(".rf-lin-ii > input , .rf-lin-um > input , "
			      + ".rf-lin-lq > input , .rf-lin-up > input")
                        .attr("disabled", false);
                    jQuery(".rf-lin-ma > input[data-row-id='" + rowID + "']")
			.prop("disabled", true);
                }
                // af is asset only flag.  show the asset fields
                if (jwt.user.isSAS) {
                  if (obj.XX_LIN_AF == "Y" ||
                      jQuery(".line2[data-row-id='" + rowID + "']")
		      .find(".rf-lin-ai > input,  .rf-lin-ap > input")
		      .filter(function() {
                            return this.value
                        }).length > 0) {
                        jQuery(".line2[data-row-id='" + rowID + "']")
                            .find(".rf-lin-ai > input,  .rf-lin-ap > input")
                            .prop("disabled", false);
                    }
                }
            });
	
	// line quantity and unit price change events will add calc the amount
	// and disable the monetary amount
        jQuery('.rf-lin-lq > input , .rf-lin-up > input')
	     .on('change', function() {
                var rowID = jQuery(this).data("row-id")
                 var totamt = parseInt(jQuery(".rf-lin-lq > input[data-row-id='"
					      + rowID + "']").val())
		     * parseInt(jQuery(".rf-lin-up > input[data-row-id='"
	             + rowID + "']").val());
                totamt = isNaN(totamt) ? 0 : totamt;
                 jQuery(".rf-lin-ma > input[data-row-id='" + rowID + "']")
		     .val(totamt.toFixed(2) ? totamt.toFixed(2) : 0)
		     .prop("disabled", true);
                jwt.functions.addlines();
            });

        //show asset fields on click event
            if (jwt.user.isSAS) {
              jQuery(".show-asset").on("click", function() {
                var obj = jQuery(this);
                var rowID = obj.data("row-id");
                jQuery(".line2[data-row-id='" + rowID + "']").show();
                  jQuery(".line2[data-row-id='" + rowID + "']")
		      .find(".rf-lin-ai > input,  .rf-lin-ap > input")
		      .prop("disabled", false);
                  jQuery(".line2[data-row-id='" + rowID + "']")
		      .find(".rf-lin-ai > div,  .rf-lin-ap > div")
		      .select2("enable", true);
                });
            }
	
	//show sub line and enable fields on lick of quantity
        jQuery(".show-qty").on("click", function() {
              var obj = jQuery(this);
              var rowID = obj.data("row-id");
              jQuery(".line2[data-row-id='" + rowID + "']").show();
	      jQuery(".line2[data-row-id='" + rowID + "']")
		    .find(".rf-lin-ii > input , .rf-lin-um > input , "
			  + ".rf-lin-lq > input , .rf-lin-up > input")
		    .attr("disabled", false);
		jQuery(".line2[data-row-id='" + rowID + "']")
		    .find(".rf-lin-ii > div , .rf-lin-um > div")
		    .select2("enable", true);
        });
	
    }
})();

			      
