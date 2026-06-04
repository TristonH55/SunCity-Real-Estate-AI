(function ($, window) {
	const forms = [];

	function address_search($container, options_callback) {
		const $search_field = $('input[type="text"]', $container);
		const $storage_field = $('input[type="hidden"]', $container);
		const $list = $('.address-list', $container);

		$list.css('top', $search_field.outerHeight());

		$list.html('').hide();

		function select_option(option_data, trigger_change = true){
			$list.html('').hide();
			$storage_field.val(option_data.value).data('option', option_data);
			$search_field.val(option_data.text);

			if(trigger_change){
				$storage_field.trigger('change');
			}
		}

		$list.on('click', '.address-list-item', function (e) {
			const option_data = $(this).data('option');
			select_option(option_data);
		});

		$list.on('mouseenter', '.address-list-item', function (e) {
			$('.address-list-item', $list).removeClass('selected');
			$(this).addClass('selected');
		});

		$list.on('mouseleave', '.address-list-item', function (e) {
			$('.address-list-item', $list).removeClass('selected');
		});

		$search_field.on('keydown', function (e) {
			if(e.key == 'Enter'){
				e.stopPropagation();

				const $current = $('.address-list-item.selected', $list);

				if($current.length){
					const option_data = $current.data('option');
					select_option(option_data);
				}

				return false;
			}
		});

		$search_field.on('keyup focus', function (e) {
			if(e.key == 'Enter'){
				return false;
			}

			const search_terms = $search_field.val();

			if(search_terms.trim().length < 3){
				$list.html('').hide();

				return true;
			}

			if(e.code == 'ArrowDown' || e.code == 'ArrowUp'){
				const $current = $('.address-list-item.selected', $list);

				if($current.length){
					if(e.code == 'ArrowDown'){
						if($current.next().length){
							$current.removeClass('selected');
							$current.next().addClass('selected');
						}
					}

					if(e.code == 'ArrowUp'){
						if($current.prev().length){
							$current.removeClass('selected');
							$current.prev().addClass('selected');
						}
					}
				}else{
					$('.address-list-item:first', $list).addClass('selected');
				}

				const visual_position_top = ($('.address-list-item.selected', $list).offset().top - $list.offset().top);
				const visual_position_bottom = visual_position_top + $('.address-list-item.selected', $list).outerHeight();
				const visual_height = $('.address-list-item.selected', $list).outerHeight();

				if(visual_position_top < 0){
					$list.scrollTop($('.address-list-item.selected', $list).offset().top - $list.offset().top + $list.scrollTop());
				}

				if(visual_position_bottom > $list.height()){
					$list.scrollTop($list.scrollTop() + visual_height);
				}

				

				return true;
			}

			const options = options_callback(search_terms);

			options.sort((a, b) => a.score - b.score).reverse();

			const html = [];

			for (const option of options) {
				const $option = $('<div>').addClass('address-list-item').data('option', option).text(option.text);

				html.push($option);
			}

			if(html.length){
				$list.html(html).show();
			}else{
				$list.html('').hide();
			}
		});

		$search_field.on('blur', function (e) {
			setTimeout(function () {
				$list.html('').hide();

				if($storage_field.data('option')){
					select_option($storage_field.data('option'), false);
				}
			}, 200);
		});
	}

	$.fn.serializeObject = function () {

		var self = this,
			json = {},
			push_counters = {},
			patterns = {
				"validate": /^[a-zA-Z][a-zA-Z0-9_]*(?:\[(?:\d*|[a-zA-Z0-9_]+)\])*$/,
				"key": /[a-zA-Z0-9_]+|(?=\[\])/g,
				"push": /^$/,
				"fixed": /^\d+$/,
				"named": /^[a-zA-Z0-9_]+$/
			};


		this.build = function (base, key, value) {
			base[key] = value;
			return base;
		};

		this.push_counter = function (key) {
			if (push_counters[key] === undefined) {
				push_counters[key] = 0;
			}
			return push_counters[key]++;
		};

		$.each($(this).serializeArray(), function () {

			// Skip invalid keys
			if (!patterns.validate.test(this.name)) {
				return;
			}

			var k,
				keys = this.name.match(patterns.key),
				merge = this.value,
				reverse_key = this.name;

			while ((k = keys.pop()) !== undefined) {

				// Adjust reverse_key
				reverse_key = reverse_key.replace(new RegExp("\\[" + k + "\\]$"), '');

				// Push
				if (k.match(patterns.push)) {
					merge = self.build([], self.push_counter(reverse_key), merge);
				}

				// Fixed
				else if (k.match(patterns.fixed)) {
					merge = self.build([], k, merge);
				}

				// Named
				else if (k.match(patterns.named)) {
					merge = self.build({}, k, merge);
				}
			}

			json = $.extend(true, json, merge);
		});

		return json;
	};

	function load_recaptcha(site_key, loaded) {
		if (typeof grecaptcha === 'undefined') {
			const script = document.createElement('script');

			script.onload = loaded;

			script.src = 'https://www.google.com/recaptcha/api.js?render=' + site_key;

			document.head.appendChild(script);
		} else {
			loaded();
		}
	}

	function spam_protection($form, form_data, callback) {
		form_data.sp1 = (Math.random() + 1).toString(36).substring(2);

		const recaptcha = $form.data('recaptcha');

		if (recaptcha) {
			load_recaptcha(recaptcha, function () {
				grecaptcha.ready(function () {
					grecaptcha.execute(recaptcha, { action: 'submit' }).then(function (token) {
						form_data.recaptcha_token = token;

						callback(form_data, true);
					}).catch(function (error) {
						callback(form_data, false);
					});
				});
			});
		} else {
			callback(form_data, true);
		}
	}

	function submit_form($form, form_data, callback) {
		const action = $form.attr('action');

		$.ajax({
			url: action,
			type: 'POST',
			data: JSON.stringify(form_data),
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			async: false,
			success: function (response_data) {
				track_submit('Lead Form');

				callback(response_data);
			},
			error: function (xhr, ajaxOptions, thrownError) {
				callback({
					'status': false,
					'message': 'Error connecting to server',
					'data': {}
				});
			}
		});
	}

	function validate($field, $input) {
		if ($input.data('dirty')) {
			if ($input.get(0).validity.valid) {
				$field.removeClass("error");
			} else {
				$field.addClass("error");
			}

			if ($input.is('#phone')) {
				if ($input.val().substring(0, 2) == '04' && $input.val().length == 10) {
					$field.removeClass("error");
					$('.instructions', $field).remove();
				} else {
					$field.addClass("error");
					if ($('.instructions', $field).length) {
						$('.instructions', $field).html('Invalid australian mobile phone number. Please correct the mistake.');
					} else {
						$field.append('<div class="instructions">Invalid australian mobile phone number. Please correct the mistake.</div>');
					}
				}
			}

			if ($input.is('#suburb')) {
				const $actual_input = $('input[type="hidden"]', $input.parent());

				if(!$actual_input.val()){
					if($actual_input.prop('required')){
						$field.addClass("error");
						if ($('.instructions', $field).length) {
							$('.instructions', $field).html('You must select a valid suburb from the dropdown list. Please correct the mistake.');
						} else {
							$field.append('<div class="instructions">You must select a valid suburb from the dropdown list. Please correct the mistake.</div>');
						}
					}else{
						$field.removeClass("error");
						$('.instructions', $field).remove();
					}
				}else{
					$field.removeClass("error");
					$('.instructions', $field).remove();
				}
			}
		} else {
			$field.removeClass("error");
		}
	}

	function validate_form($form, callback) {
		const form_data = $form.serializeObject();

		//form_data.recaptcha_token = token;
		form_data.current_url = window.location.href;

		$(".ui-input", $form).each(function () {
			const $field = $(this);
			$(".ui-input-input", $field).each(function () {
				validate($field, $(this));
			});
		});

		console.log($('input[name="suburb"]', $form).val());

		if(!$('input[name="suburb"]', $form).val()){
			callback({
				'status': false,
				'message': 'You must select a valid suburb from the dropdown list. Please correct the mistake.'
			});
		}else{
			spam_protection($form, form_data, function (form_data, success) {
				if (success) {
					submit_form($form, form_data, function (response_data) {
						callback(response_data);
					});
				} else {
					callback({
						'status': false,
						'message': 'Failed Spam Protection'
					});
				}
			});
		}
	}

	window.schw_form = function(){
		const $form = $(this);

		if(forms.includes($form.get(0))){
			return;
		}

		forms.push($form.get(0));

		const form_status = {
			'submitted': false
		};

		$form.on('submit', function (e) {
			e.preventDefault();

			if (form_status.submitted) {
				return;
			}

			form_status.submitted = true;

			$form.addClass('loading');
			$('.ui-loading-message-content', $form).text('Sending your quote request. Please wait...');
			$('input[type="submit"], button[type="submit"]', $form).prop('disabled', true);

			setTimeout(function () {
				validate_form($form, function (response_data) {
					$('.ui-loading-message-content', $form).text('Your request has been sent successfully! Please wait...');

					if (response_data.status) {
						if ($form.data('redirect')) {
							window.location.replace($form.data('redirect'));
						}
					} else {
						form_status.submitted = false;
						$('input[type="submit"], button[type="submit"]', $form).prop('disabled', false);
						$form.removeClass('loading');
						alert('Sending Failed - ' + response_data.message);
					}
				});
			}, 200);
		});

		$(".ui-input", $form).each(function () {
			const $this = $(this);

			function change_state($input) {
				validate($this, $input);

				if ($input.is(":focus")) {
					$this.addClass("focus");
				} else {
					$this.removeClass("focus");
				}

				if ($input.val() != "") {
					$this.addClass("active");
				} else {
					if ($input.is(":focus")) {
						$this.addClass("active");
					} else {
						$this.removeClass("active");
					}
				}
			}

			function field_difference(field) {
				switch (field.type) {
					case "select-multiple":
					case "select-one":
						var options = field.options;
						for (var j = 0; j < options.length; j++) {
							if (!options[j].value) continue;
							if (options[j].selected != options[j].defaultSelected) return true;
						}
						break;
					case "checkbox":
					case "radio":
						if (field.checked != field.defaultChecked) return true;
						break;
					default:
						if (field.value != field.defaultValue) return true;
						break;
				}
			}

			$(".ui-input-input", $this).on("focus click", function () {
				change_state($(this));
			}).on("change blur invalid", function (e) {
				$(this).data('dirty', true);
				change_state($(this));
			}).each(function () {
				if (field_difference(this)) {
					$(this).data('dirty', true);
				} else {
					$(this).data('dirty', false);
				}

				change_state($(this));
			});

			if($this.hasClass('search-list')){
				address_search($this, function (search_terms) {
					search_terms = search_terms.toLowerCase();

					const output = [];

					for(const option of $this.data('options')){
						let score = 0;

						if(option.text.toLowerCase() == search_terms){
							score = 1000;
						}else{
							if(option.address.suburb.toLowerCase().startsWith(search_terms) || option.address.state.toLowerCase().startsWith(search_terms) || option.address.postcode.toLowerCase().startsWith(search_terms)){
								score = 100;
							}else{
								if(option.text.toLowerCase().indexOf(search_terms) != -1){
									score = 10;
								}
							}
						}

						if(score > 0){
							output.push({
								'score': score,
								'value': option.value,
								'text': option.text
							});
						}
					}

					return output;
				});
			}
		});
	}

	function track_submit(form_name){
		if (typeof gtag === "function") { 
			gtag('event', 'generate_lead', {
				'event_category': 'engagement',
				'event_label': form_name,
			});
		}

		if (typeof fbq === "function") { 
			fbq('track', 'Contact');
		}

		window.uetq = window.uetq || [];
		window.uetq.push("event", "submit_lead_form", {});
	}

	$(".ui-form").each(function(){
		window.schw_form.apply($(this));
	});
})(jQuery, window);