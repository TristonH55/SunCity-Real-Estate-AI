<?php

namespace F8Media\SuncityLeads;

class Updates {

	public $plugin_slug;
	public $version;
	public $cache_key;
	public $cache_allowed;
	public static $cache_timeout = 60;

	public function __construct($repo, $plugin_slug, $version, $cache_allowed = true) {
		$this->repo = $repo;
		$this->plugin_slug = $plugin_slug;
		$this->version = $version;

		$cache_key_prefix = substr($this->repo, 0, 160);

		$this->cache_key = $cache_key_prefix.'_updates';
		$this->cache_allowed = $cache_allowed;

		add_filter('plugins_api', array($this, 'info'), 20, 3);
		add_filter('site_transient_update_plugins', array($this, 'update'));
		add_action('upgrader_process_complete', array($this, 'purge'), 10, 2);
	}

	public function info($res, $action, $args){
		if('plugin_information' !== $action){
			return $res;
		}

		// do nothing if it is not our plugin
		if($this->plugin_slug !== $args->slug){
			return $res;
		}

		// get updates
		$remote = $this->request();

		if( ! $remote ) {
			return $res;
		}

		$res = new \stdClass();

		$res->name = $remote->name;
		$res->slug = $remote->slug;
		$res->version = $remote->version;
		$res->tested = $remote->tested;
		$res->requires = $remote->requires;
		$res->author = $remote->author;
		$res->author_profile = $remote->author_profile;
		$res->download_link = $remote->download_url;
		$res->trunk = $remote->download_url;
		$res->requires_php = $remote->requires_php;
		$res->last_updated = $remote->last_updated;

		$res->sections = array(
			'description' => $remote->sections->description,
			'installation' => $remote->sections->installation,
			'changelog' => $remote->sections->changelog
		);

		if(!empty($remote->banners)){
			$res->banners = array(
				'low' => $remote->banners->low,
				'high' => $remote->banners->high
			);
		}

		return $res;
	}

	public function update($transient){
		if(empty($transient->checked)){
			return $transient;
		}

		$remote = $this->request();

		if(!$remote){
			return $transient;
		}

		if(!version_compare($this->version, $remote->version, '<')){
			return $transient;
		}

		if(!version_compare($remote->requires, get_bloginfo( 'version' ), '<')){
			return $transient;
		}

		if(!version_compare($remote->requires_php, PHP_VERSION, '<')){
			return $transient;
		}

		$plugin_update = new \stdClass();

		$plugin_update->slug = $this->plugin_slug;
		$plugin_update->plugin = $this->plugin_slug.'/'.$this->plugin_slug.'.php';
		$plugin_update->new_version = $remote->version;
		$plugin_update->tested = $remote->tested;
		$plugin_update->package = $remote->download_url;

		$transient->response[$plugin_update->plugin] = $plugin_update;

		return $transient;
	}

	public function purge($upgrader_object, $options){
		if($this->cache_allowed and 'update' === $options['action'] and 'plugin' === $options['type']){
			delete_transient($this->cache_key);
		}
	}

	public function deactivate(){
		
	}

	public function request(){
		$remote = $this->get_cache();

		if(false === $remote){
			$remote = wp_remote_get('https://updates.f8media.com.au/?repo='.$this->repo, [
				'timeout' => 10,
				'headers' => [
					'Accept' => 'application/json'
				]
			]);

			if(
				is_wp_error( $remote )
				|| 200 !== wp_remote_retrieve_response_code( $remote )
				|| empty( wp_remote_retrieve_body( $remote ) )
			) {
				return false;
			}

			set_transient($this->cache_key, $remote, self::$cache_timeout);
		}

		$remote = json_decode(wp_remote_retrieve_body($remote));

		return $remote;
	}

	public function get_cache(){
		if(!$this->cache_allowed){
			return false;
		}

		return get_transient($this->cache_key);
	}

}