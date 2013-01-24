//General nori functions.

//Populate article list main function, it accepts stuff.
function populate(action, element) {
	jQuery.ajax({
			type: 'POST',
			url: noriAJAX.ajaxurl,
			data: {
				action: 'ajaxSessionNori',
				command: action
			},
			success: function(data, textStatus, XMLHttpRequest) {
				jQuery(element).empty().append(data);
				sortableList();
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				jQuery(element).empty().append( noriAJAX.msg_error + ':' + errorThrown);	
			}
		});
}

function sortableList() {
	jQuery('#nori_make_renderbox .nori_articlelist').sortable({

		update: function(event, ui){
			var articlesel = new Array();
			
			jQuery('.nori_articlelist li').each(function() {				
				articlesel.push(jQuery(this).data('id'));
			});			


			var artjoin = articlesel.join()
			console.log(artjoin);
			jQuery.ajax({
				type: 'POST',
				url: noriAJAX.ajaxurl,
				data: {
					action: 'ajaxSessionNori',
					command: 'update',
					orderdata: artjoin
				},
				success: function(data, textStatus, XMLHttpRequest) {
					jQuery('.formwrapper').append('<span class="updatedorder label label-success">'+ noriAJAX.msg_updatedorder + '</span>');
					jQuery('span.updatedorder').fadeOut(2000);					
				}, 
				error: function(XMLHttpRequest, textStatus, errorThrown) {
					jQuery('.formwrapper').append('<p>' + noriAJAX.msg_error +'</p>');
				}
			});

			}
	});
}

jQuery(document).ready(function($) {
	//Añadir sección al final del body
	$('body').append('<section id="nori_section"></section>');	

	//Variables de elementos recurrentes
	var articlecount = $('.noricounter .nori_number');
	var resultbox = $('.nori_wrapper');
	var uistuff = $('.introstuff, .legend');
	var printform = $('#nori_printform');

	printform.hide();	


	//Llenar articulos y contador de artículos - autoejecutable
	(function() {

		var articlelist = $('.nori_articlelist');		
		
		articlelist.append('<p>' + noriAJAX.msg_loadingselection +'</p>');
		
		if(articlelist.data('process') == 'incheckout') {
			var popcommand = 'populateandsort';
		} else {
			var popcommand = 'populate';
		}

		populate(popcommand, '#nori_make_renderbox .nori_articlelist');

		$.ajax({
			type: 'POST',
			url: noriAJAX.ajaxurl,
			data: {
				action: 'ajaxSessionNori',
				command: 'count'
			},
			success: function(data, textStatus, XMLHttpRequest) {
				if(data.length > 0){
					articlecount.empty().append(data);
				} else {
					articlecount.empty().append('0');
				}

			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				articlecount.empty().append(errorThrown);	
			}
		});
	})();
	

	$(document).on('click', '.btn[data-function="toggle-section"]', function() {
		$('#nori_section').slideUp(600).empty();
		$('#trigger-norisection').removeClass('active');
		$('#trigger-norisection').addClass('inactive');

	});

	$(document).on('click', '#generar-ajax', function() {
		
		var resultbox = $('.nori_wrapper');
		var uistuff = $('.introstuff, .legend');

		uistuff.fadeOut();
		articles = $(this).data('articles');

		resultbox
			.empty()
			.hide()
			.append('<h3><img src="'+ noriAJAX.noriurl +'/imgs/ajax-loader.gif"/> ' + noriAJAX.msg_generating + '</h3><p>' + noriAJAX.msg_timeexplanation +'</p>')
			.fadeIn();		
		$.ajax({
			type: 'POST',
			url: noriAJAX.ajaxurl,
			data: {
				action: 'ajaxNori',
				articlelist : articles,
				forprint: 'no'
			},
			success: function(data, textStatus, XMLHttpRequest) {								
				resultbox.empty().hide()
				.append(data)
				.fadeIn();
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				resultbox.append(noriAJAX.msg_error +': ' + errorThrown);
			}	
		});
	});

	$('#add-article').on('click', function() {
		id = $(this).data('id');
		$.ajax({
			type: 'POST',
			url: noriAJAX.ajaxurl,
			data: {
				action: 'ajaxSessionNori',
				id: id,
				command: 'add' 
			},
			success: function(data, textStatus, XMLHttpRequest) {
				var item = $(data).hide().fadeIn(1400)
				$('.nori_articlelist').prepend(item);
				$.ajax({
					type: 'POST',
					url: noriAJAX.ajaxurl,
				data: {
					action: 'ajaxSessionNori',
					command: 'count'
					},
					success: function(data, textStatus, XMLHttpRequest) {
					articlecount.empty().append(data);
					},
					error: function(XMLHttpRequest, textStatus, errorThrown) {
					articlecount.empty().append(errorThrown);	
					}
				});				
			},
			error: function(data, textStatus, XMLHttpRequest) {
				$('.nori_articlelist').prepend('<li>' + noriAJAX.msg_error +'</li>');	
			}
		});
	});

	$(document).on('click', '#borrar-articulos', function() {		
		$.ajax({
			type: 'POST',
			url: noriAJAX.ajaxurl,
			data: {
				action: 'ajaxSessionNori',				
				command: 'delete-all' 
			},
			success: function(data, textStatus, XMLHttpRequest) {
				$('.nori_articlelist').empty();
				$('#generar-ajax').data('articles', '');
			},
			error: function(data, textStatus, XMLHttpRequest) {
				$('.nori_articlelist').prepend('<li> ' + noriAJAX.msg_error + ' </li>');	
			}
		});
	});
//Different calls cause I call this stuff via AJAX
	$(document).on('click', '.articledel', function() {	
		parentli = $(this).parent('li');				
		$.ajax({
			type: 'POST',
			url: noriAJAX.ajaxurl,
			data: {
				action: 'ajaxSessionNori',				
				command: 'delete', 
				id: parentli.data('id')
			},

			success: function(data, textStatus, XMLHttpRequest) {								
				parentli.remove();
				console.log(parentli.data('id'));
			},
			error: function(data, textStatus, XMLHttpRequest) {
				$('.nori_articlelist').prepend('<li> ' + noriAJAX.msg_error + ' </li>');	
			}
		});
	});

	//Boton para activar sección de contenidos desplegable

	$('#trigger-norisection.inactive').click(function(){
		$(this).removeClass('inactive');
		$(this).addClass('active');
		$.ajax({
			type: 'POST',
			url: noriAJAX.ajaxurl,
			data: {
				action: 'ajaxSessionNori',
				command: 'ajaxSection'				
			},
			success: function(data, textStatus, XMLHttpRequest) {
				$('#nori_section').empty().append(data).slideDown(600);
				populate('populateandsort', '#nori_make_renderbox ul.nori_articlelist');				

			}, 
			error: function(data, textStatus, XMLHttpRequest) {
				$('#nori_section').append('ERROR');
			}
		});
	});

	$('.noricounter').popover({
		title: 'Artículos seleccionados',
		placement: 'bottom',
		content: '<ul class="nori_articlelist"> Cargando artículos ... </ul>',
		html: true		
		});

	$('body').click(function() {
		$('.noricounter').popover('hide');		
	});	

	$('body').delegate('.noricounter', 'click', 		
		function(event) {
			event.stopPropagation();
			if(event.type == 'click'){
				var e = $(this);
				var popover = $(this).data('popover');
            	var shown = popover && popover.tip().is(':visible');
            	populate('onlypopulate', '.nori_snippet .nori_articlelist');
            	if(shown) return;
				e.popover('show');
				
			} 
		});	


	//Tooltips

	$('.noricounter').tooltip({
		placement: 'bottom',
		title: 'N° de artículos seleccionados.'
	});

	$('#add-article').tooltip({
		placement: 'bottom',
		title: 'Añadir este artículo a tu selección.'
	});

	$('.norimake-btn').tooltip({
		placement: 'bottom',
		title: 'Crear un compilado en PDF a partir de tu selección.'
	});	

//Cosas de imprenta

$('#payandprint').on('click', function(e) {
		uistuff.fadeOut();
		//Validate Fields
		$(".error").hide();
    	var hasError = false;
   		var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;    	
 
    	var emailaddressVal = $("#clientemail").val();
    	var addressVal = $('#clientaddress').val();
    	var phoneVal = $('#clientphone').val();
    	var nameVal = $('#clientname').val();

    	if(nameVal == '') {
    		$('#clientname').after('<span class="error">' + noriAJAX.msg_noname + '</span>')
    		hasError = true;
    	}	

    	if(addressVal == '') {
    		$('#clientaddress').after('<span class="error">' + noriAJAX.msg_noaddress + '</span>')
    		hasError = true;
    	}

    	if(phoneVal == '') {
    		$('#clientphone').after('<span class="error">' + noriAJAX.msg_nophone + '</span>')
    		hasError = true;
    	}

    	if(emailaddressVal == '') {
      		$("#clientemail").after('<span class="error"> ' + noriAJAX.msg_nomail + '</span>');
      		hasError = true;
    		} 
    	else if(!emailReg.test(emailaddressVal)) {
      		$("#clientemail").after('<span class="error">' + noriAJAX.msg_novalidmail + '</span>');
      		hasError = true;
    		}
    	
 
    	if(hasError == true) {
    		 return false; }

    	else {

		//Collect Form data
		articles = $(this).data('articles');
		var formInputs = $('#nori_payform input');
		var formData = new Object();
			formInputs.each(function(index) {
				var prop = $(this).attr('name');
				formData[prop] = $(this).attr('value');
			});			
			resultbox			
				.empty()
				.append('<h3><img src="'+ noriAJAX.noriurl +'/imgs/ajax-loader.gif"/>  ' + noriAJAX.msg_generating + '</h3><p>' + noriAJAX.msg_timeexplanation +'</p>')
				.fadeIn();
			$.ajax({
				type: 'POST',
				url: noriAJAX.ajaxurl,
				data: {
					action: 'ajaxNori',
					articlelist: articles,
					forprint: 'yes',
					extradata: formData
				},
				success: function(data, textStatus, XMLHttpRequest) {					
					resultbox.empty().hide()
					.append(data)
					.fadeIn()
				},
				error: function(XMLHttpRequest, textStatus, errorThrown) {
					resultbox.append( noriAJAX.msg_error +': ' + errorThrown);
				}
			});

		};			
		//Cancel default stuff
		e.preventDefault();
	});	

	$('#generar-ajax-imprenta').on('click', function() {
		resultbox
			.empty()
			.append(printform);
		printform.slideDown(300);	
	});

});