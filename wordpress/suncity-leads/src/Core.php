<?php

namespace F8Media\SuncityLeads;

class Core {

	public function __construct(){
		add_action('wp_enqueue_scripts', [ $this, 'wp_enqueue_scripts' ], 1000);

		add_action('wp_ajax_scl-mobile-verify', [ $this, 'mobile_verify' ]);
		add_action('wp_ajax_nopriv_scl-mobile-verify', [ $this, 'mobile_verify' ]);

		add_action('wp_ajax_scl-form-submit', [ $this, 'form_submit' ]);
		add_action('wp_ajax_nopriv_scl-form-submit', [ $this, 'form_submit' ]);

		add_shortcode('suncity-leads-form', [ $this, 'shortcode_form' ]);
	}

	public function wp_enqueue_scripts(){
		wp_enqueue_script('scl_scripts', SCL_URL.'assets/js/scripts.js', [ 'jquery' ], SCL_VERSION, true);
		wp_enqueue_style('scl_styles', SCL_URL.'assets/css/styles.css', false, SCL_VERSION);
	}

	public function __recaptcha(){
		$site_key = get_option('elementor_pro_recaptcha_v3_site_key');
		$secret_key = get_option('elementor_pro_recaptcha_v3_secret_key');

		if(!empty($site_key)){
			return [
				'site_key' => $site_key,
				'secret_key' => $secret_key
			];
		}

		return false;
	}

	public function __recaptcha_check($secret_key, $response_code, $ip){
		$url = "https://www.google.com/recaptcha/api/siteverify?secret=".$secret_key."&response=".$response_code."&remoteip=".$ip;

		$wp_response = wp_remote_get($url);
		
		if(is_wp_error($wp_response)){
			return false;
		}

		$googleobj = json_decode($wp_response['body']);

		if($googleobj->success === true){
			return true;
		}

		return false;
	}

	public function shortcode_form($params = []){
		ob_start();

		$recaptcha = $this->__recaptcha();

		include(SCL_PATH.'/views/form.php');

		return ob_get_clean();
	}

	public function form_submit(){
		$domain = $_SERVER['HTTP_HOST'];
		$ip = $_SERVER['REMOTE_ADDR'];
		$ajax_request = false;
		$form_data = $_POST;

		$content_type = explode(';', $_SERVER['HTTP_CONTENT_TYPE']);

		if($content_type[0] == 'application/json'){
			$ajax_request = true;
			$form_data = json_decode(file_get_contents('php://input'), true);
		}

		$meta_data = [];

		$meta_data['plugin_version'] = SCL_VERSION;
		$meta_data['_SERVER'] = $_SERVER;
		$meta_data['_COOKIE'] = $_COOKIE;

		$recaptcha = $this->__recaptcha();

		if($recaptcha){
			if(!$this->__recaptcha_check($recaptcha['secret_key'], $form_data['recaptcha_token'], $ip)){
				$this->__ajax_response(false, 'Spam Protection Failed');
			}
		}

		if(!$this->__validate_mobile_number($form_data['phone'])){
			$this->__ajax_response(false, 'Invalid Mobile Phone Number');
		}

		if(!isset(\F8Media\SuncityLeads\Dataset::$enquiry_types[$form_data['enquiry_type']])){
			$this->__ajax_response(false, 'Invalid Select Fields');
		}

		if(!isset(\F8Media\SuncityLeads\Dataset::$property_types[$form_data['property_type']])){
			$this->__ajax_response(false, 'Invalid Select Fields');
		}

		if(!isset(\F8Media\SuncityLeads\Dataset::$system_types[$form_data['existing_system_type']])){
			$this->__ajax_response(false, 'Invalid Select Fields');
		}

		if(!isset(\F8Media\SuncityLeads\Dataset::$system_locations[$form_data['existing_system_location']])){
			$this->__ajax_response(false, 'Invalid Select Fields');
		}

		if(!isset(\F8Media\SuncityLeads\Dataset::$suburbs[$form_data['suburb']])){
			$this->__ajax_response(false, 'Invalid Suburb. Please try again.');
		}

		$lead_data = [
			'status' => 'd651',
			'source' => '2d2e',
			'source_domain' => $domain,
			'source_url' => $form_data['current_url'],
			'user_ip' => $ip,
			'enquiry_type' => $form_data['enquiry_type'],
			'property_type' => $form_data['property_type'],
			'system_type' => $form_data['existing_system_type'],
			'system_location' => $form_data['existing_system_location'],
			'enquiry' => $form_data['enquiry'],
			'location' => \F8Media\SuncityLeads\Dataset::$suburbs[$form_data['suburb']]['address'],
			'meta_data' => $meta_data
		];

		$contact_data = [
			'first_name' => $form_data['first_name'],
			'last_name' => $form_data['last_name'],
			'email' => $form_data['email'],
			'phone' => $form_data['phone']
		];

		/*
		API Key: 9b2d992a-c309-4035-957d-1cc34fa2a528
		API Secret: 67aa5ee92837d9a15e477da8574491404790822d045a8de0ce5a26fcd4661981
		*/

		$crm = new \F8Media\SuncityLeads\UnityCRM(
			'jobs.suncityhotwater.com.au',
			'9b2d992a-c309-4035-957d-1cc34fa2a528',
			'67aa5ee92837d9a15e477da8574491404790822d045a8de0ce5a26fcd4661981'
		);

		$response_data = $crm->request('api/leads/add', [
			'lead_data' => $lead_data,
			'contact_data' => $contact_data,
		]);

		if($ajax_request){
			$this->__ajax_response(true, 'Lead Form Submitted');
		}

		wp_redirect('/');
		exit();
	}

	public function __ajax_response($status, $message = '', $data = []){
		header('content-type: application/json');
		print json_encode([
			'status' => $status,
			'message' => $message,
			'data' => $data
		], JSON_PRETTY_PRINT);
		exit();
	}

	public function mobile_verify(){
		$mobile_number = $_GET['mobile_number'];

		print '<pre>';

		var_dump($mobile_number);

		$crm = new \F8Media\SuncityLeads\UnityCRM(
			'jobs.suncityhotwater.com.au',
			'9b2d992a-c309-4035-957d-1cc34fa2a528',
			'67aa5ee92837d9a15e477da8574491404790822d045a8de0ce5a26fcd4661981'
		);

		$response_data = $crm->request('api/validate/mobile-number', [
			'send_sms_verification' => true,
			'numbers' => [
				$mobile_number
			]
		]);

		var_dump($response_data);

		exit();
	}

	public function __validate_mobile_number($number){
		try {
			$phoneUtil = \libphonenumber\PhoneNumberUtil::getInstance();

			$number_proto = $phoneUtil->parse($number, "AU");
		
			if($phoneUtil->isValidNumber($number_proto)){
				$phone_number_sanitised = $phoneUtil->format($number_proto, \libphonenumber\PhoneNumberFormat::E164);

				if(substr($phone_number_sanitised, 0, 4) == '+614' and strlen($phone_number_sanitised) == 12){
					return true;
				}
			}
		}catch(\libphonenumber\NumberParseException $e){}

		return false;
	}

}