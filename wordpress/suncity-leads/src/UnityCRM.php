<?php

namespace F8Media\SuncityLeads;

class UnityCRM {

	private $host = null;
	private $key = null;
	private $secret = null;

	public function __construct($host, $key, $secret){
		$this->host = $host;
		$this->key = $key;
		$this->secret = $secret;
	}

	public function request($endpoint, $request_data){
		$url = 'https://'.$this->host.'/'.$endpoint;
	
		$options = [
			'method' => 'POST',
			'headers' => array(
				'Content-Type' => 'application/json; charset=utf-8',
				'Authorization' => 'Basic ' . base64_encode($this->key.':'.$this->secret),
			),
			'body' => json_encode($request_data),
			'data_format' => 'body',
			'timeout' => 60,
			'redirection' => 5,
			'blocking' => true,
			'httpversion' => '1.0',
			'sslverify' => true,
		];
	
		$wp_response = wp_remote_post($url, $options);
		
		if(is_wp_error($wp_response)){
			return false;
		}
	
		$response_data = json_decode($wp_response['body'], true);

		if(json_last_error() == JSON_ERROR_NONE){
			return $response_data;
		}

		return false;
	}
	
	function upload($file_path, $post_fields = array()){
		$endpoint = 'https://'.$this->host.'/ajax/files/upload';
	
		$boundary = wp_generate_password(24);
		$boundary_line = '--'.$boundary;
	
		$headers = array(
			'Authorization' => 'Basic ' . base64_encode($this->key.':'.$this->secret),
			'content-type' => 'multipart/form-data; boundary='.$boundary
		);
	
		$payload = [];
	
		// First, add the standard POST fields:
		foreach($post_fields as $name => $value){
			$payload[] = $boundary_line;
			$payload[] = 'Content-Disposition: form-data; name="'.$name.'"';
			$payload[] = '';
			$payload[] = $value;
			$payload[] = '';
		}
	
		// Upload the file
		if($file_path){
			$filetype = wp_check_filetype($file_path);
			
			$payload[] = $boundary_line;
			$payload[] = 'Content-Disposition: form-data; name="file"; filename="'.basename($file_path).'"';
	
			if($filetype['type']){
				$payload[] = 'Content-Type: '.$filetype['type'];
			}
	
			$payload[] = '';
			$payload[] = file_get_contents($file_path);
		}
	
		$payload[] = $boundary_line.'--';
	
		$payload = implode("\r\n", $payload);
	
		$response = wp_remote_post($endpoint, array(
			'headers' => $headers,
			'body' => $payload,
		));
	
		if(is_wp_error($response)){
			return false;
		}
	
		return json_decode($response['body'], true);
	}
}