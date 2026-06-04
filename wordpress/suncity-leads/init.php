<?php

new \F8Media\SuncityLeads\Core();

$rl_updates = new \F8Media\SuncityLeads\Updates('f8-media/suncity-leads', 'suncity-leads', SCL_VERSION, true);

register_deactivation_hook(__FILE__, 'rl_deactivate');

function rl_deactivate(){
	global $rl_updates;

	$rl_updates->deactivate();
}