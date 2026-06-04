<form action="<?=admin_url('admin-ajax.php?action=scl-form-submit')?>" data-redirect="<?=(empty($params['redirect'])?'':$params['redirect'])?>" method="POST" class="ui-form" data-recaptcha="<?=(empty($recaptcha['site_key'])?'':$recaptcha['site_key'])?>">
	<div class="ui-input-two">
		<label for="first_name" class="ui-input">
			<span class="ui-input-label">First Name</span>
			<input type="text" class="ui-input-input" name="first_name" id="first_name" required>
		</label>
		<label for="last_name" class="ui-input">
			<span class="ui-input-label">Last Name</span>
			<input type="text" class="ui-input-input" name="last_name" id="last_name" required>
		</label>
	</div>
	<label for="email" class="ui-input">
		<span class="ui-input-label">Email</span>
		<input type="email" class="ui-input-input" name="email" id="email" required>
	</label>
	<label for="phone" class="ui-input">
		<span class="ui-input-label">Mobile</span>
		<input type="tel" class="ui-input-input" name="phone" id="phone" data-verify="true" required>
	</label>
	<label for="suburb" class="ui-input search-list" data-options="<?=htmlentities(json_encode(\F8Media\SuncityLeads\Dataset::suburbs()))?>">
		<span class="ui-input-label">Postcode</span>
		<input type="text" class="ui-input-input" id="suburb" placeholder="Type your suburb or postcode to select your address..." autocomplete="off" list="autocompleteOff">
    	<input type="hidden" name="suburb" required>
   		<div class="address-list"></div>
	</label>

	<div class="ui-input-two">
		<label for="enquiry_type" class="ui-input select">
			<span class="ui-input-label">Enquiry Type</span>
			<select class="ui-input-input" name="enquiry_type" id="enquiry_type" required>
				<option value="">Select your enquiry type...</option>
				<?php foreach(\F8Media\SuncityLeads\Dataset::$enquiry_types as $value => $text): ?>
				<option value="<?=$value?>"><?=$text?></option>
				<?php endforeach; ?>
			</select>
		</label>
		<label for="property_type" class="ui-input select">
			<span class="ui-input-label">Type of Property</span>
			<select class="ui-input-input" name="property_type" id="property_type" required>
				<option value="">Select your property type...</option>
				<?php foreach(\F8Media\SuncityLeads\Dataset::$property_types as $value => $text): ?>
				<option value="<?=$value?>"><?=$text?></option>
				<?php endforeach; ?>
			</select>
		</label>
	</div>

	<div class="ui-input-two">
		<label for="existing_system_type" class="ui-input select">
			<span class="ui-input-label">Type of Existing System</span>
			<select class="ui-input-input" name="existing_system_type" id="existing_system_type" required>
				<option value="">Select your existing systems type...</option>
				<?php foreach(\F8Media\SuncityLeads\Dataset::$system_types as $value => $text): ?>
				<option value="<?=$value?>"><?=$text?></option>
				<?php endforeach; ?>
			</select>
		</label>
		<label for="existing_system_location" class="ui-input select">
			<span class="ui-input-label">Location of Existing System</span>
			<select class="ui-input-input" name="existing_system_location" id="existing_system_location" required>
				<option value="">Select your existing systems location...</option>
				<?php foreach(\F8Media\SuncityLeads\Dataset::$system_locations as $value => $text): ?>
				<option value="<?=$value?>"><?=$text?></option>
				<?php endforeach; ?>
			</select>
		</label>
	</div>

	<label for="enquiry" class="ui-input">
		<span class="ui-input-label">What can we help you with?</span>
		<textarea class="ui-input-input" name="enquiry" id="enquiry" required></textarea>
	</label>

	<?php if($recaptcha): ?>
	<div class="ui-message">This site is protected by reCAPTCHA and the Google <a href="https://policies.google.com/privacy">Privacy Policy</a> and <a href="https://policies.google.com/terms">Terms of Service</a> apply.</div>
	<?php endif; ?>

	<button type="submit">Send</button>

	<div class="ui-loading-message">
		<div class="ui-loading-message-content"></div>
	</div>
</form>

<script type="text/javascript">
	if(window.schw_form !== undefined){
		jQuery(".ui-form").each(function(){
			window.schw_form.apply(jQuery(this));
		});
	}
</script>