// (c) by Gemius SA - gemius main script
// gAudience
// ver. 3.28

if (typeof gemius_cmpclient == "undefined") {
	gemius_cmpclient = {
		gemius_vendor_id : 328,
		cmp_frame : null,
		cmp_callbacks : {},
		add_event : function(obj,type,fn) {
			if (obj.addEventListener) {
				obj.addEventListener(type, fn, false);
			} else if (obj.attachEvent) {
				obj.attachEvent('on'+type, fn);
			}
		},
		find_cmp_frame : function(locator) {
			var f = window;
			while (!gemius_cmpclient.cmp_frame) {
				try {
					if(f.frames[locator]) {
						gemius_cmpclient.cmp_frame = f;
						return true;
					}
				} catch(e) {}
				if (f === window.top) break;
				f = f.parent;
			}
			return false;
		},
		add_cmp_event : function(return_field) {
			gemius_cmpclient.add_event(window,"message",function(event) {
				try {
					var json = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
					if (json[return_field]) {
						var i = json[return_field];
						gemius_cmpclient.cmp_callbacks[i.callId](i.returnValue, i.success);
					}
				} catch(e) {}
			});
		},
		find_cmp_v1: function() {
			if (gemius_cmpclient.__cmp)
				return true;
			if (typeof window.__cmp == 'function') {
				gemius_cmpclient.__cmp = function() {
					window.__cmp.apply(this, arguments)
				}
				return true;
			}
			if (!gemius_cmpclient.find_cmp_frame("__cmpLocator"))
				return false;
			gemius_cmpclient.add_cmp_event("__cmpReturn");
			gemius_cmpclient.__cmp = function(cmd, arg, callback) {
				var callId = Math.random() + '';
				var msg = {
					__cmpCall: {
						command: cmd,
						parameter: arg,
						callId: callId,
					},
				};
				gemius_cmpclient.cmp_callbacks[callId] = callback;
				gemius_cmpclient.cmp_frame.postMessage(msg, '*');
			}
			return true;
		},
		find_cmp_v2: function() {
			if (gemius_cmpclient.__tcfapi)
				return true;
			if (typeof window.__tcfapi == 'function') {
				gemius_cmpclient.__tcfapi = function() {
					window.__tcfapi.apply(this, arguments)
				}
				return true;
			}
			if (!gemius_cmpclient.find_cmp_frame("__tcfapiLocator"))
				return false;
			gemius_cmpclient.add_cmp_event("__tcfapiReturn");
			gemius_cmpclient.__tcfapi = function(cmd, version, callback, arg) {
				var callId = Math.random() + '';
				var msg = {
					__tcfapiCall: {
						command: cmd,
						parameter: arg,
						version: version,
						callId: callId,
					},
				};
				gemius_cmpclient.cmp_callbacks[callId] = callback;
				gemius_cmpclient.cmp_frame.postMessage(msg, '*');
			}
			return true;
		},
		find_cmp : function() {
			if (gemius_cmpclient.find_cmp_v2())
				return true;
			return gemius_cmpclient.find_cmp_v1();
		},
		has_consent_v1 : function(data,purposes) {
			try {
				if (!data.vendorConsents[gemius_cmpclient.gemius_vendor_id])
					return false;
				for (var i=0; i<purposes.length; i++) {
					if (!data.purposeConsents[purposes[i]])
						return false;
				}
			} catch(e) {
				return false;
			}
			return true;
		},
		cmp_callback_v1 : function(callback,purposes) {
			var called = false;
			var cmp_callback = function(data, success) {
				if (called) return;
				called = true;
				callback(success && gemius_cmpclient.has_consent_v1(data, purposes), false);
			}
			return cmp_callback;
		},
		has_consent_v2 : function(tcData,purposes) {
			try {
				if (typeof tcData.gdprApplies == 'boolean' && !tcData.gdprApplies)
					return true;
				if (!tcData.vendor.consents[gemius_cmpclient.gemius_vendor_id])
					return false;
				for (var i=0; i<purposes.length; i++) {
					if (purposes[i] == 1 && tcData.purposeOneTreatment === true) continue;
					var restrict = 1;
					try {
						restrict = tcData.publisher.restrictions[purposes[i]][gemius_cmpclient.gemius_vendor_id];
					} catch(e) {}
					if (!tcData.purpose.consents[purposes[i]] || restrict == 0)
						return false;
				}
			} catch(e) {
				return false;
			}
			return true;
		},
		cmp_callback_v2 : function(callback,purposes) {
			var called = false;
			var cmp_callback = function(tcData, success) {
				if (success && (tcData.eventStatus === 'tcloaded' || tcData.eventStatus === 'useractioncomplete')) {
					callback(gemius_cmpclient.has_consent_v2(tcData, purposes), false);
				}
			}
			return cmp_callback;
		},
		get_consent : function(callback,purposes) {
			if (typeof gemius_cmpclient.__tcfapi == 'function') {
				gemius_cmpclient.__tcfapi("addEventListener", 2, gemius_cmpclient.cmp_callback_v2(callback, purposes[2]));
			} else if (typeof gemius_cmpclient.__cmp == 'function') {
				gemius_cmpclient.__cmp("getVendorConsents", [gemius_cmpclient.gemius_vendor_id], gemius_cmpclient.cmp_callback_v1(callback, purposes[1]));
			} else {
				callback(false);
			}
		}
	}
}


if (typeof gemius_cookie == "undefined") {
	gemius_cookie = {
		https : (document.location && document.location.protocol && document.location.protocol=='https:'),
		get : function(name) {
			var ret = {primary: '-TURNEDOFF', secondary: '-TURNEDOFF', sec_state: "unknown"};
			try {
				var nsec = '-TURNEDOFF', sec = '-TURNEDOFF';
				var nsec_isset = false, sec_isset = false;
				var cookies = document.cookie.split(';');
				var cookie_arr, cookie_name, cookie_val;
				for (var i=0; i<cookies.length ; i++) {
					cookie_arr = cookies[i].split('=');
					cookie_name = cookie_arr[0].replace(/^\s+|\s+$/g,'');
					cookie_val = cookie_arr[1].replace(/^\s+|\s+$/g,'');
					if (cookie_name==name.nsec && !nsec_isset) {
						nsec = cookie_val;
						nsec_isset = true;
						if (sec_isset || !gemius_cookie.https) {
							break;
						}
					} else if (cookie_name==name.sec && !sec_isset && gemius_cookie.https) {
						sec = cookie_val;
						sec_isset = true;
						if (nsec_isset) {
							break;
						}
					}
				}
				if (nsec_isset) {
					ret.primary = nsec;
					ret.secondary = sec;
					ret.sec_state = "nsec";
				} else if (window.self!=window.top && sec_isset) {
					ret.primary = sec;
					ret.sec_state = "sec";
				}
			} catch (e) {}
			return ret;
		},
		get_on_state : function(name,sec_state) {
			var cookie = gemius_cookie.get(name);
			if (sec_state=="unknown" || cookie.sec_state==sec_state) {
				return cookie;
			} else if (cookie.sec_state=="nsec" && sec_state=="sec") {
				return {primary: cookie.secondary, secondary: '-TURNEDOFF', sec_state: "sec"};
			} else {
				return {primary: '-TURNEDOFF', secondary: '-TURNEDOFF', sec_state: "unknown"};
			}
		},
		set : function(name,data,exp,domain,sec_state,reset_secondary) {
			if (data!='') {
				var now = (new Date()).getTime();
				try {
					if (sec_state=="unknown" || sec_state=="nsec") {
						document.cookie = name.nsec+"="+data+"; path=/"+((domain)?("; domain="+domain):"")+"; expires="+(new Date(now+exp)).toGMTString();
					}
					if (gemius_cookie.https && (sec_state=="sec" || reset_secondary || (sec_state=="unknown" && window.top!=window.self))) {
						document.cookie = name.sec+"="+data+"; path=/"+((domain)?("; domain="+domain):"")+"; SameSite=None; Secure; expires="+(new Date(now+exp)).toGMTString();
					}
				} catch (e) {}
			}
		}
	}
}


if (typeof gemius_hcconn == "undefined") {
	gemius_hcconn = {
		version : 328,
		lsdata : "",
		fpdata : "",
		fpdata_sec_state : "unknown",
		fpdata_secondary : "",
		fpcap : {nsec: "", sec: ""},
		gdprforgetts : NaN,
		fpcookie_name : {nsec: '__gfp_64b', sec: '__gfp_s_64b'},
		dntcookie_name : {nsec: '__gfp_dnt', sec: '__gfp_s_dnt'},
		capcookie_name : {nsec: '__gfp_cap', sec: '__gfp_s_cap'},
		cachecookie_name : {nsec: '__gfp_cache', sec: '__gfp_s_cache'},
		cookie_expire : 34128000000,
		pfp : {fpdata: "", create_ts: 0, forget_ts: 0},
		pfp_cache : {fpdata: "", create_ts: 0, size: 0, cache: {}},
		pfp_cache_secondary_fpdata : "",
		pfp_interval : 1,
		pfp_need_sync : false,
		gdprdisabled : 0,
		gdprdata : [],
		gdprversion : null,
		cmp_found : 0,
		gdpr_found : 0,
		event_identifier : null,
		current_receiver : null,
		waiting_for_fpdata : 1,
		waiting_for_lsdata : 1,
		load_fpdata_started : 0,
		load_lsdata_started : 0,
		params_ready_called : 0,
		fpdata_ready_called : 0,
		fpdata_callbacks : [],
		gsconf_added : 0,
		waiting_on_prerender : 1,
		waiting_for_consent : 1,
		require_consent_info : 0,
		has_consent : null,
		closing : 0,
		init_called : 0,
		visapi_s : "",
		visapi_h : "",
		visapi_c : "",
		loadinit : 0,
		fto : null,
		addto : null,
		sto : null,
		cmpto : null,
		initto: null,
		ltime : 0,
		lsgetframe : null,
		sonar_data : null,
		sonar_auto_init : 0,
		timerevents : [],
		requests : {consent:[], no_consent:[], unknown: []},
		images : [],
		state : 0,
		flashv : "",
		src : (document.currentScript && document.currentScript.src)?document.currentScript.src:null,
		ssl : (typeof gemius_proto === 'string')?((gemius_proto.substr(0,5) == 'https')?1:0):(typeof pp_gemius_proto === 'string')?((pp_gemius_proto.substr(0,5) == 'https')?1:0):(document.location && document.location.protocol && document.location.protocol=='https:')?1:0,
		hc : (typeof gemius_hitcollector === 'string')?gemius_hitcollector:(typeof pp_gemius_hitcollector === 'string')?pp_gemius_hitcollector:'gabg.hit.gemius.pl',
		dnt : (((typeof gemius_dnt != 'undefined') && gemius_dnt) || ((typeof pp_gemius_dnt != 'undefined') && pp_gemius_dnt))?1:0,
		use_cmp : (((typeof gemius_use_cmp != 'undefined') && gemius_use_cmp) || ((typeof pp_gemius_use_cmp != 'undefined') && pp_gemius_use_cmp))?1:0,
		cmp_purposes_overrides : (typeof gemius_cmp_purposes != 'undefined')?gemius_cmp_purposes:(typeof pp_gemius_cmp_purposes != 'undefined')?pp_gemius_cmp_purposes:null,
		cmp_timeout : (typeof gemius_cmp_timeout == 'number')?gemius_cmp_timeout:(typeof pp_gemius_cmp_timeout == 'number')?pp_gemius_cmp_timeout:10000,
		dmp_purpose : (typeof gemius_dmp_purpose === 'boolean')?gemius_dmp_purpose:(typeof pp_gemius_dmp_purpose === 'boolean')?pp_gemius_dmp_purpose:false,
		gdpr_applies : (typeof gemius_gdpr_applies != 'undefined')?gemius_gdpr_applies:(typeof pp_gemius_gdpr_applies != 'undefined')?pp_gemius_gdpr_applies:null,
		gdpr_consent : (typeof gemius_gdpr_consent != 'undefined')?gemius_gdpr_consent:(typeof pp_gemius_gdpr_consent != 'undefined')?pp_gemius_gdpr_consent:null,
		explicit_consent : (typeof gemius_consent === 'boolean')?gemius_consent:(typeof pp_gemius_consent === 'boolean')?pp_gemius_consent:null,
		use_gsync : (typeof gemius_disable_gsync == 'boolean')?!gemius_disable_gsync:(typeof pp_gemius_disable_gsync == 'boolean')?!pp_gemius_disable_gsync:false,
		init_params : function(p) {
			var ghc = gemius_hcconn;
			ghc.ssl = (typeof p['proto'] === 'string')?((p['proto'].substr(0,5) == 'https')?1:0):ghc.ssl;
			ghc.hssl = (ghc.ssl||ghc.getchromever()>=67)?1:0;
			ghc.hc = (typeof p['hitcollector'] === 'string')?p['hitcollector']:ghc.hc;
			ghc.dnt = (typeof p['dnt'] != 'undefined')?(p['dnt']?1:0):ghc.dnt;
			ghc.use_cmp = (typeof p['use_cmp'] != 'undefined')?(p['use_cmp']?1:0):ghc.use_cmp;
			ghc.cmp_purposes_overrides = (typeof p['cmp_purposes'] != 'undefined')?p['cmp_purposes']:ghc.cmp_purposes_overrides;
			ghc.cmp_timeout = (typeof p['cmp_timeout'] === 'number')?p['cmp_timeout']:ghc.cmp_timeout;
			ghc.dmp_purpose = (typeof p['dmp_purpose'] === 'boolean')?p['dmp_purpose']:ghc.dmp_purpose;
			ghc.gdpr_applies = (typeof p['gdpr_applies'] != 'undefined')?p['gdpr_applies']:ghc.gdpr_applies;
			ghc.gdpr_consent = (typeof p['gdpr_consent'] != 'undefined')?p['gdpr_consent']:ghc.gdpr_consent;
			ghc.explicit_consent = (typeof p['consent'] === 'boolean')?p['consent']:ghc.explicit_consent;
			ghc.use_gsync = (typeof p['disable_gsync'] === 'boolean')?!p['disable_gsync']:ghc.use_gsync;
		},
		add_event : function(obj,type,fn) {
			if (obj.addEventListener) {
				obj.addEventListener(type, fn, false);
			} else if (obj.attachEvent) {
				obj.attachEvent('on'+type, fn);
			}
		},
		remove_script : function(elementid,url) {
			var el = document.getElementById(elementid);
			if (el) {
				if (url) {
					try {
						if (typeof gemius_notify != 'undefined') {
							gemius_notify(url);
						} else if (typeof pp_gemius_notify != 'undefined') {
							pp_gemius_notify(url);
						}
					} catch (e) {}
				}
				try {
					el.parentNode.removeChild(el);
				} catch(e) {}
			}
		},
		append_script : function(url,finishedfn,notify) {
			var rndid = 'gemius_hcconn_'+((new Date()).getTime())+'_'+Math.floor(Math.random()*100000000);
			try {
				var gt=document.createElement('script'),s=document.getElementsByTagName('script')[0];
				if (finishedfn!=null) {
					gemius_hcconn.add_event(gt,'load',finishedfn);
					gemius_hcconn.add_event(gt,'error',finishedfn);
					gemius_hcconn.add_event(gt,'readystatechange',function() { if (!gt.readyState || gt.readyState === 'loaded' || gt.readyState === 'complete') finishedfn(); });
				}
				gemius_hcconn.add_event(gt,'load',function() { gemius_hcconn.remove_script(rndid,notify?url:null); });
				gemius_hcconn.add_event(gt,'error',function() { gemius_hcconn.remove_script(rndid,null); });
				gemius_hcconn.add_event(gt,'readystatechange',function() { if (!gt.readyState || gt.readyState === 'loaded' || gt.readyState === 'complete') gemius_hcconn.remove_script(rndid,notify?url:null); });
				gt.setAttribute('id',rndid);
				gt.setAttribute('defer','defer');
				gt.setAttribute('async','async');
				gt.setAttribute('type','text/javascript');
				gt.setAttribute('src',url);
				if (s) {
					s.parentNode.insertBefore(gt,s);
				} else if (document.body) {
					document.body.appendChild(gt);
				}
			} catch (e) {}
		},
		xdot_loaded : function() {
			if (typeof gemius_open=='undefined') {
				gemius_hcconn.state = 0;
			}
		},
		sendhit : function(robj,nr,consent,lsadd) {
			var url = (gemius_hcconn.hssl?'https://':'http://')+gemius_hcconn.hc+'/_';
			var d = new Date().getTime();
			var vis = (gemius_hcconn.visapi_h=='')?3:(document[gemius_hcconn.visapi_h])?2:1;
			var params = '&vis='+vis;
			params += '&lsdata=' + (consent?(gemius_hcconn.lsdata+'&ltime='+gemius_hcconn.ltime):'-NOCONSENT');
			params += '&fpdata=' + (consent?gemius_hcconn.getrawfpdata():'-NOCONSENT');
			if (gemius_hcconn.ssl==0 && lsadd!==null) {
				params += '&lsadd='+lsadd;
			}
			if (consent!==true) {
				params += '&nc=1';
			} else if (robj.explicit===true) {
				params += '&nc=0';
			}
			if (gemius_hcconn.closing) {
				url += (d+nr)+'/redot.gif?l='+robj.vers+robj.req+params;
				if (typeof navigator.sendBeacon == "function") {
					navigator.sendBeacon(url);
				} else {
					var images_l = gemius_hcconn.images.length;
					gemius_hcconn.images[images_l]=new Image();
					gemius_hcconn.images[images_l].src = url;
				}
			} else if (gemius_hcconn.state>0 || robj.allowaddscript==0 || typeof gemius_open != 'undefined') {
				url += (d+nr)+'/redot.js?l='+robj.vers+robj.req+params+gemius_hcconn.fpcap_params(consent);
				gemius_hcconn.append_script(url,null,1);
			} else {
				url += (d+nr)+'/rexdot.js?l='+robj.vers+robj.req+params+gemius_hcconn.fpcap_params(consent);
				gemius_hcconn.state = 1;
				gemius_hcconn.append_script(url,gemius_hcconn.xdot_loaded,1);
			}
		},
		sendhits : function(lsadd) {
			if (gemius_hcconn.waiting_on_prerender==0) {
				var i;
				for (i=0 ; i<gemius_hcconn.requests.no_consent.length ; i++) {
					gemius_hcconn.sendhit(gemius_hcconn.requests.no_consent[i],i,false,lsadd);
				}
				gemius_hcconn.requests.no_consent = [];
				if (gemius_hcconn.waiting_for_fpdata==0 && gemius_hcconn.waiting_for_lsdata==0) {
					for (i=0 ; i<gemius_hcconn.requests.consent.length ; i++) {
						gemius_hcconn.sendhit(gemius_hcconn.requests.consent[i],i,true,lsadd);
					}
					gemius_hcconn.requests.consent = [];
				}
			}
		},
		latehits : function() {
			if (gemius_hcconn.waiting_for_consent==0 && gemius_hcconn.requests.unknown.length > 0) {
				var i;
				var requests = gemius_hcconn.requests;
				for (i=0 ; i<requests.unknown.length ; i++) {
					var robj = requests.unknown[i];
					robj.explicit = gemius_hcconn.explicit_consent;
					if (gemius_hcconn.has_consent) {
						requests.consent[requests.consent.length] = robj;
					} else {
						requests.no_consent[requests.no_consent.length] = robj;
					}
				}
				gemius_hcconn.requests.unknown = [];
			}
			if ((gemius_hcconn.has_consent === false || (gemius_hcconn.waiting_for_fpdata==0 && gemius_hcconn.waiting_for_lsdata==0)) && gemius_hcconn.waiting_on_prerender==0) {
				if (gemius_hcconn.closing==0 && gemius_hcconn.ssl==0 && gemius_hcconn.lsdata!='' && gemius_hcconn.lsdata[0]!='-' && gemius_hcconn.lsgetframe) {
					if (gemius_hcconn.addto==null) {
						try {
							gemius_hcconn.lsgetframe.contentWindow.postMessage("_xx_gemius_get_add_xx_","*");
							gemius_hcconn.addto = setTimeout(gemius_hcconn.lsaddto,250);
						} catch (e) {
							gemius_hcconn.sendhits(null);
						}
					}
				} else {
					gemius_hcconn.sendhits(null);
				}
			}
			gemius_hcconn.pfp_sync();
		},
		lsaddto : function() {
			if (gemius_hcconn.addto!=null) {
				gemius_hcconn.addto = null;
				gemius_hcconn.sendhits(null);
			}
		},
		add_fpdata_callback : function(callback) {
			if (gemius_hcconn.fpdata_ready_called==0) {
				gemius_hcconn.fpdata_callbacks[gemius_hcconn.fpdata_callbacks.length] = callback;
			} else {
				try {
					callback(gemius_hcconn.getrawfpdata());
				} catch (e) {}
			}
		},
		paramsready : function() {
			if (gemius_hcconn.waiting_for_consent==1) {
				return;
			}
			var fpdata_ready = (gemius_hcconn.waiting_for_fpdata==0 || gemius_hcconn.fpdata == '-DNT');
			var lsdata_ready = (gemius_hcconn.waiting_for_lsdata==0 || gemius_hcconn.lsdata == '-DNT');
			if (gemius_hcconn.fpdata_ready_called==0 && fpdata_ready) {
				gemius_hcconn.fpdata_ready_called = 1;
				for (var i=0 ; i<gemius_hcconn.fpdata_callbacks.length ; i++) {
					try {
						gemius_hcconn.fpdata_callbacks[i](gemius_hcconn.getrawfpdata());
					} catch (e) {}
				}
			}
			if (gemius_hcconn.params_ready_called==0 && fpdata_ready && lsdata_ready) {
				var data = {'lsdata' : gemius_hcconn.lsdata, 'fpdata' : gemius_hcconn.getrawfpdata()};
				gemius_hcconn.params_ready_called = 1;
				try {
					if (typeof gemius_params_ready != 'undefined') {
						gemius_params_ready(data);
					} else if (typeof pp_gemius_params_ready != 'undefined') {
						pp_gemius_params_ready(data);
					}
				} catch (e) {}
			}
		},
		visibilitychanged : function() {
			if (document[gemius_hcconn.visapi_s]!='prerender' && gemius_hcconn.waiting_on_prerender) {
				gemius_hcconn.waiting_on_prerender = 0;
				setTimeout(gemius_hcconn.latehits,100);
			}
		},
		unloadhit : function(robj,nr,consent) {
			var url = (gemius_hcconn.hssl?'https://':'http://')+gemius_hcconn.hc+'/_';
			var d = new Date().getTime();
			var vis = (gemius_hcconn.visapi_h=='')?3:(document[gemius_hcconn.visapi_h])?2:1;
			var params = '&vis='+vis;
			params += '&fpdata='+((gemius_hcconn.waiting_for_fpdata==0 && consent)?gemius_hcconn.getrawfpdata():"-UNLOAD");
			params += '&lsdata='+((gemius_hcconn.waiting_for_lsdata==0 && consent)?(gemius_hcconn.lsdata+'&ltime='+gemius_hcconn.ltime):"-UNLOAD");
			if (consent!==true) {
				params += '&nc=1';
			} else if (robj.explicit===true) {
				params += '&nc=0';
			}
			if (gemius_hcconn.closing) {
				url += (d+nr)+'/redot.gif?l='+robj.vers+params+robj.req;
				if (typeof navigator.sendBeacon == "function") {
					navigator.sendBeacon(url);
				} else {
					var images_l = gemius_hcconn.images.length;
					gemius_hcconn.images[images_l]=new Image();
					gemius_hcconn.images[images_l].src = url;
				}
			} else {
				url += (d+nr)+'/redot.js?l='+robj.vers+robj.req+params;
				gemius_hcconn.append_script(url,null,1);
			}
		},
		unload_init : function() {
			if (gemius_hcconn.init_called) {
				return;
			}
			if (gemius_hcconn.require_consent_info) {
				gemius_hcconn.has_consent = null;
			} else if (gemius_hcconn.dnt || gemius_hcconn.explicit_consent===false) {
				gemius_hcconn.has_consent = false;
			} else if (gemius_hcconn.explicit_consent===null && gemius_hcconn.use_cmp) {
				if (gemius_hcconn.cmp_timeout==Infinity) {
					gemius_hcconn.require_consent_info = 1;
					gemius_hcconn.has_consent = null;
				} else {
					gemius_hcconn.has_consent = false;
				}
			} else if (gemius_hcconn.explicit_consent===null && gemius_hcconn.gdpr_params() != '') {
				gemius_hcconn.has_consent = false;
			} else {
				gemius_hcconn.has_consent = true;
			}
			gemius_hcconn.waiting_for_consent = gemius_hcconn.require_consent_info;
			gemius_hcconn.sendpendingdata();
			if (typeof gemius_hcconn.init_pageview == 'function') {
				gemius_hcconn.init_pageview({});
				gemius_hcconn.init_pageview = true;
			}
		},
		unload : function(closing) {
			try {
				gemius_hcconn.unload_init();
				var i;
				var uhits = 0;
				var last = (!gemius_hcconn.closing && closing);
				var requests = gemius_hcconn.requests;
				gemius_hcconn.closing = (gemius_hcconn.closing>0 || closing)?1:0;
				if (gemius_hcconn.waiting_on_prerender==0 && (gemius_hcconn.require_consent_info==0 || gemius_hcconn.waiting_for_consent==0)) {
					uhits += requests.no_consent.length;
					for (i=0 ; i<requests.no_consent.length ; i++) {
						gemius_hcconn.unloadhit(requests.no_consent[i],i+10,false);
					}
					uhits += requests.consent.length;
					for (i=0 ; i<requests.consent.length ; i++) {
						gemius_hcconn.unloadhit(requests.consent[i],i+10,true);
					}
					uhits += requests.unknown.length;
					for (i=0 ; i<requests.unknown.length ; i++) {
						gemius_hcconn.unloadhit(requests.unknown[i],i+10,false);
					}
					gemius_hcconn.requests = {consent:[], no_consent:[], unknown: []};
				}
				if (last) {
					if (typeof navigator.sendBeacon != "function" && uhits > 0) {
						var start = (new Date()).getTime();
						while (start+200>(new Date()).getTime());
					}
				}
			} catch (e) {}
		},
		mousedown : function() {
			if (gemius_hcconn.cmp_found!=1 || gemius_hcconn.waiting_for_consent==0) {
				gemius_hcconn.unload(false);
			}
		},
		getrawfpdata : function(fpdata) {
			if (fpdata===undefined) {
				fpdata = gemius_hcconn.fpdata;
			}
			return fpdata.split('|')[0];
		},
		get_fpdata_ts : function(fpdata) {
			if (fpdata===undefined) {
				fpdata = gemius_hcconn.fpdata;
			}
			var arr = fpdata.split('|');
			return (arr.length >= 2) ? parseInt(arr[1]) * 1000 : 0;
		},
		getfpcookie : function() {
			var fpcookie = gemius_cookie.get_on_state(gemius_hcconn.fpcookie_name, gemius_hcconn.fpdata_sec_state);
			if (gemius_hcconn.fpdata_sec_state=='unknown') {
				gemius_hcconn.fpdata_sec_state = fpcookie.sec_state;
			}
			gemius_hcconn.fpdata = fpcookie.primary;
			gemius_hcconn.fpdata_secondary = fpcookie.secondary;
		},
		getdntcookie : function() {
			if (gemius_hcconn.dnt==0) {
				var dntcookie = gemius_cookie.get(gemius_hcconn.dntcookie_name);
				gemius_hcconn.dnt = parseInt(dntcookie.primary)?1:0;
			}
		},
		getfpcap : function() {
			var capcookie = gemius_cookie.get(gemius_hcconn.capcookie_name);
			if (capcookie.sec_state=='sec') {
				gemius_hcconn.fpcap = {nsec: '-TURNEDOFF', sec: capcookie.primary};
			} else {
				gemius_hcconn.fpcap = {nsec: capcookie.primary, sec: capcookie.secondary};
			}
		},
		setfpcap : function(fpcap,fpcdomain,fpsec) {
			var fpcap_sec_state = parseInt(fpsec)?'sec':'nsec';
			if (fpcap=='' || fpcdomain=='' || gemius_hcconn.fpdata_sec_state!=fpcap_sec_state) {
				return;
			}
			gemius_hcconn.fpcap[gemius_hcconn.fpdata_sec_state] = fpcap;
			gemius_cookie.set(gemius_hcconn.capcookie_name, fpcap, gemius_hcconn.cookie_expire, fpcdomain, gemius_hcconn.fpdata_sec_state, false);
		},
		fpcookie_secondary_needs_reset : function() {
			var ghc = gemius_hcconn;
			return (ghc.gdprforgetts>0 && ghc.fpdata_secondary!='' && ghc.fpdata_secondary[0]!='-' && ghc.get_fpdata_ts(ghc.fpdata_secondary)<ghc.gdprforgetts);
		},
		setfpcookie : function() {
			var ghc = gemius_hcconn;
			gemius_cookie.set(ghc.fpcookie_name, ghc.fpdata, ghc.cookie_expire, ghc.fpcdomain, ghc.fpdata_sec_state, ghc.fpcookie_secondary_needs_reset());
		},
		reset_fpcookie_secondary_if_needed : function() {
			var ghc = gemius_hcconn;
			if (ghc.fpcookie_secondary_needs_reset()) {
				gemius_cookie.set(ghc.fpcookie_name, ghc.fpdata, ghc.cookie_expire, ghc.fpcdomain, 'sec', true);
			}
		},
		fpdata_loaded : function() {
			if (gemius_hcconn.sto!=null) {
				clearTimeout(gemius_hcconn.sto);
				gemius_hcconn.sto = null;
			}
			gemius_hcconn.setfpcookie();
			gemius_hcconn.getfpcookie();
			gemius_hcconn.waiting_for_fpdata = 0;
			gemius_hcconn.paramsready();
			gemius_hcconn.latehits();
		},
		addframe : function(ssl,file,args,rcvfn) {
			if (document.body) {
				gemius_hcconn.current_receiver = rcvfn;
				var url = 'http'+(ssl?'s':'')+'://ls.hit.gemius.pl/ls'+file+'.html'+args;
				if (rcvfn!=null) {
					gemius_hcconn.loadinit = (new Date()).getTime();
					if (gemius_hcconn.fto==null) {
						gemius_hcconn.fto = setTimeout(gemius_hcconn.frameto,10000);
					}
				}
				var rndid = 'gemius_hcconn_'+((new Date()).getTime())+'_'+Math.floor(Math.random()*100000000);
				var f = document.createElement('iframe');
				f.setAttribute('id',rndid);
				f.setAttribute('name','ls'+file+'frame');
				f.setAttribute('width',0);
				f.setAttribute('height',0);
				f.setAttribute('scrolling','no');
				f.setAttribute('sandbox','allow-scripts allow-same-origin');
				f.style.display="none";
				f.style.visibility="hidden";
				document.body.appendChild(f);
				f.setAttribute('src',url);
				if (file=="get" && ssl==0) {
					gemius_hcconn.lsgetframe = f;
				}
			} else {
				setTimeout(function(){gemius_hcconn.addframe(ssl,file,args,rcvfn);}, 100);
			}
		},
		frameto : function() {
			if (gemius_hcconn.fto!=null) {
				gemius_hcconn.fto = null;
				if (gemius_hcconn.lsdata=='') {
					gemius_hcconn.ltime = 10000;
					gemius_hcconn.lsdata = '-TIMEDOUT';
					gemius_hcconn.waiting_for_lsdata = 0;
					gemius_hcconn.paramsready();
					gemius_hcconn.latehits();
				}
			}
		},
		scriptto : function() {
			if (gemius_hcconn.sto!=null) {
				gemius_hcconn.sto = null;
				if (gemius_hcconn.fpdata!='' && gemius_hcconn.fpdata[0]!='-') {
					gemius_hcconn.setfpcookie();
					gemius_hcconn.getfpcookie();
				}
				if (gemius_hcconn.fpdata=='') {
					gemius_hcconn.fpdata = '-TIMEDOUT';
				}
				gemius_hcconn.waiting_for_fpdata = 0;
				gemius_hcconn.paramsready();
				gemius_hcconn.latehits();
			}
		},
		last_datareceiver : function(lsdata) {
			gemius_hcconn.current_receiver = null;
			gemius_hcconn.lsdata = lsdata;
			gemius_hcconn.waiting_for_lsdata = 0;
			gemius_hcconn.paramsready();
			gemius_hcconn.latehits();
		},
		second_datareceiver : function(data) {
			if (data.charAt(0)=='-' || data=='') {
				gemius_hcconn.addframe(1,'set','',gemius_hcconn.last_datareceiver);
			} else {
				gemius_hcconn.last_datareceiver(data);
			}
		},
		first_datareceiver : function(data) {
			var m = data.match(/^([A-Z0-9a-z\.\_\/]*).*\|([0-9]+)$/);
			var n = (new Date()).getTime();
			if (data.charAt(0)=='-' || data=='' || !m || m[2]<n) {
				gemius_hcconn.addframe(1,'get','',gemius_hcconn.second_datareceiver);
			} else {
				if (m) {
					data = m[1];
				}
				gemius_hcconn.last_datareceiver(data);
			}
		},
		msgreceiver : function(e) {
			var is_event = function(prefix,gemius_origin) {
				return typeof e.data == "string" && e.data.substring(0, prefix.length) == prefix && (!gemius_origin || (e.origin && /^https:\/\/.+\.hit\.gemius\.pl(\/?|\/.+)$/.test(e.origin)));
			}
			if (is_event("_xx_gemius_xx_/")) {
				if (gemius_hcconn.fto!=null) {
					clearTimeout(gemius_hcconn.fto);
					gemius_hcconn.fto = null;
					gemius_hcconn.ltime = (new Date()).getTime() - gemius_hcconn.loadinit;
				}
				if (gemius_hcconn.current_receiver!=null) {
					gemius_hcconn.current_receiver(e.data.substr(15));
				}
			}
			if (is_event("_xx_gemius_add_xx_/")) {
				if (gemius_hcconn.addto!=null) {
					clearTimeout(gemius_hcconn.addto);
					gemius_hcconn.addto = null;
				}
				var lsadd = e.data.substr(19);
				gemius_hcconn.sendhits((lsadd=="-GETERR")?null:lsadd);
			}
			if (is_event("_xx_gemius_set_fpcap_xx_",true)) {
				var fpcap = e.data.substr(25).split("/");
				gemius_hcconn.setfpcap(fpcap[0], fpcap[1], fpcap[2]);
			}
			if (is_event("_xx_gemius_putpfpdata_xx_")) {
				if (e.source === window.top) {
					var arr = e.data.substr(26).split("/");
					if (arr.length >= 3) {
						gemius_hcconn.pfp_received(arr[0], parseInt(arr[1]), parseInt(arr[2]));
					}
				}
			}
			if (window.top === window.self && is_event("_xx_gemius_getpfpdata_xx_")) {
				if (!gemius_hcconn.has_consent || gemius_hcconn.fpdata.length == 0 || gemius_hcconn.fpdata[0] == '-') {
					return;
				}
				var forget_ts = gemius_hcconn.gsync_forget_ts();
				if (forget_ts == null) {
					return;
				}
				var msg = "_xx_gemius_putpfpdata_xx_";
				msg += "/" + gemius_hcconn.getrawfpdata();
				msg += "/" + gemius_hcconn.get_fpdata_ts();
				msg += "/" + forget_ts;
				e.source.postMessage(msg, e.origin);
			}
			if (window.top === window.self && is_event("_xx_gemius_getfpdata_xx_", true)) {
				var origin = new String(document.location.origin);
				var clbk = function(fpdata) {
					if (gemius_hcconn.has_consent) {
						e.source.postMessage("_xx_gemius_putfpdata_xx_/" + fpdata + '/' + encodeURIComponent(origin), e.origin);
					}
				};
				gemius_hcconn.add_fpdata_callback(clbk);
			}
		},
		getflashv : function() {
			var fv='-';
			if (typeof Error!='undefined') {
				var fo;
				try { fv=navigator.plugins["Shockwave Flash"].description; } catch (e) {}
				if (typeof ActiveXObject!="undefined") { try { fo=new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7"); } catch(e) { try { fo=new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6"); fv="X"; fo.AllowScriptAccess="always"; } catch(e) { if (fv=="X") { fv="WIN 6,0,20,0"; }} try { fo=new ActiveXObject("ShockwaveFlash.ShockwaveFlash"); } catch(e) {} } if ((fv=="-" || fv=="X") && fo) { fv=fo.GetVariable("$version"); }}
			}
			return fv;
		},
		gdpr_params : function(first) {
			var url = '';
			if (gemius_hcconn.gdpr_applies != null) url+="&gdpr=" + (gemius_hcconn.gdpr_applies?"1":"0");
			if (gemius_hcconn.gdpr_consent != null) {
				url+="&gdpr_consent=" + ((typeof gemius_hcconn.gdpr_consent == "string")?gemius_hcconn.gdpr_consent:'');
			}
			if (first && url != '') url='?' + url.substring(1);
			return url;
		},
		cmp_purposes : function() {
			var purposes = {1:[1,5],2:[1,7,8,9,10]};
			try {
				function combine_cmp_purposes(purposes, cmp_purposes_overrides, add_dmp_purposes) {
					var purposes_v1_to_v2_translation = {1:[1],2:[3,5],3:[2,4,7],4:[6,8],5:[7,8,9]};
					var dmp_purposes = {1:[1,2,3,5],2:[1,2,3,4,5,7,8,9,10]};
					if (typeof cmp_purposes_overrides != 'undefined' && cmp_purposes_overrides != null) {
						if (cmp_purposes_overrides.constructor === Array) {
							purposes[1] = cmp_purposes_overrides;
							purposes[2] = [10];
							for (var i=0; i < purposes[1].length; i++) {
								v2_purposes = purposes_v1_to_v2_translation[purposes[1][i]];
								if (typeof v2_purposes != 'undefined') {
									purposes[2] = purposes[2].concat(v2_purposes);
								}
							}
						} else {
							for (version in cmp_purposes_overrides) {
								purposes[version] = cmp_purposes_overrides[version];
							}
						}
					}
					if (add_dmp_purposes) {
						for (version in dmp_purposes) {
							purposes[version] = purposes[version].concat(dmp_purposes[version]);
						}
					}
				}

				combine_cmp_purposes(purposes, gemius_hcconn.cmp_purposes_overrides, gemius_hcconn.dmp_purpose);
			} catch (e) {}
			return purposes;
		},
		parameters : function() {
			var d=document;
			var w=window;
			var href=new String(d.location.href);
			var ref;
			var f=0;
			var dd;
			if (d.referrer) { ref=new String(d.referrer); } else { ref=''; }
			if (typeof Error!='undefined') {
				try { f=(d==top.document)?1:2; if (typeof top.document.referrer=="string") { ref=top.document.referrer; } } catch(e) {f=3;}
			}
			try { if (ref=="" && typeof ia_document != "undefined" && ia_document.referrer) ref="https://" + (new String(ia_document.referrer));} catch(e) {}
			var url='&fr='+f+'&tz='+(new Date()).getTimezoneOffset();
			if (typeof encodeURIComponent != 'undefined') {
				url+='&fv='+encodeURIComponent(gemius_hcconn.flashv)+'&href='+encodeURIComponent(href.substring(0,499))+'&ref='+encodeURIComponent(ref.substring(0,499));
			}
			if (screen) {
				var s=screen;
				if (s.width) {
					if (s.deviceXDPI && s.deviceYDPI) {
						url+='&screen='+Math.floor(s.width*s.deviceXDPI/96.0)+'x'+Math.floor(s.height*s.deviceYDPI/96.0);
					} else {
						url+='&screen='+s.width+'x'+s.height;
					}
				}
				if (w.devicePixelRatio) url+='r'+Math.round((w.devicePixelRatio*1000));
				if (s.colorDepth) url+='&col='+s.colorDepth;
			}
			if (typeof w.innerWidth=='number') {
				url+='&window='+w.innerWidth+'x'+w.innerHeight;
			} else if ( ((dd = d.documentElement) && (dd.clientWidth || dd.clientHeight)) || ((dd = d.body) && (dd.clientWidth || dd.clientHeight)) ) {
				url+='&window='+dd.clientWidth+'x'+dd.clientHeight;
			}
			if (gemius_hcconn.cmp_found) {
				url+='&cmpf=1';
			}
			if (gemius_hcconn.gdpr_found) {
				url+='&gdprf=1';
			}
			return url;
		},
		fpcap_params : function(consent) {
			if (consent && gemius_hcconn.fpdata.length>0 && gemius_hcconn.fpdata[0]!='-' && gemius_hcconn.fpdata_sec_state!='unknown') {
				var fpcap = gemius_hcconn.fpcap[gemius_hcconn.fpdata_sec_state];
				return '&fpcap=' + ((fpcap.length>0 && fpcap[0]!='-')?fpcap:'') + ((gemius_hcconn.fpdata_sec_state=='sec')?'&fpsec=1':'');
			}
			return '';
		},
		inner_params : function() {
			if (typeof encodeURIComponent != 'undefined') {
				var inner = '_ver=' + gemius_hcconn.version;
				return '&inner='+encodeURIComponent(inner);
			}
			return '';
		},
		array_to_string : function(arr,start) {
			var i,str;
			if (typeof arr == 'string') {
				return arr;
			}
			str = '';
			if (typeof arr.length != 'undefined') {
				for (i=start ; i<arr.length ; i++) {
					if (i>start) {
						str += '|';
					}
					str += ((new String(arr[i])).replace(/\|/g,'_'));
				}
			}
			return str;
		},
		internal_hit : function(allowaddscript,vers,id,evid,et,hsrc,sonar,extra) {
			var req = "";
			if (gemius_hcconn.event_identifier==null && id) {
				gemius_hcconn.event_identifier = id;
			}
			req += '&id='+id;
			if (typeof et != 'undefined') {
				req += '&et='+et;
			}
			if (typeof hsrc != 'undefined') {
				req += '&hsrc='+hsrc;
			}
			if (sonar && et == 'view' && id && typeof id.indexOf == 'function' && id.indexOf('&sargencoding=') < 0) {
				gemius_hcconn.sonar_auto_init = 0;
				req += '&initsonar=1';
			}
			if (typeof extra != 'undefined' && typeof encodeURIComponent != 'undefined') {
				req += '&extra='+encodeURIComponent(extra.substring(0,1999));
			}
			req += gemius_hcconn.inner_params();
			req += '&eventid='+evid+gemius_hcconn.parameters();
			var robj = {req:req,allowaddscript:allowaddscript,vers:vers,explicit:gemius_hcconn.explicit_consent};
			var requests = gemius_hcconn.requests;
			if (gemius_hcconn.has_consent === true) {
				requests.consent[requests.consent.length] = robj;
			} else if (gemius_hcconn.has_consent === false) {
				requests.no_consent[requests.no_consent.length] = robj;
			} else {
				requests.unknown[requests.unknown.length] = robj;
			}
			gemius_hcconn.latehits();
		},
		timer : function() {
			var i;
			for (i=0 ; i<gemius_hcconn.timerevents.length ; i++) {
				gemius_hcconn.internal_hit(0,103,gemius_hcconn.timerevents[i],0,"sonar");
			}
		},
		gtimer_add : function(id) {
			gemius_hcconn.internal_hit(0,103,id,0,"sonar");
			gemius_hcconn.timerevents[gemius_hcconn.timerevents.length] = id;
		},
		sonar_add : function(identifier,evid,freq,extra) {
			if (gemius_hcconn.sonar_data==null) {
				var data={};
				data["id"]=identifier;
				data["evid"]=evid;
				data["freq"]=freq;
				data["extra"]=extra;
				data["to"]=null;
				data["linterval"] = ((new Date()).getTime());
				data["sdur"] = 0;
				if (identifier && evid && freq>0) {
					data["to"]=setInterval(gemius_hcconn.sonar, 1000);
				}
				gemius_hcconn.sonar_data = data;
			}
		},
		sonar : function() {
			if (gemius_hcconn.sonar_data!=null) {
				var data, prob, lvstate;
				lvstate=(gemius_hcconn.visapi_s?document[gemius_hcconn.visapi_s]:"");
				data=gemius_hcconn.sonar_data;
				prob=(((new Date()).getTime()) - data["linterval"])/1000; 
				data["linterval"]=((new Date()).getTime());
				while (prob>0) {
					if (data["sdur"]<24*3600 && prob<=4 && lvstate=="visible" && Math.random() < prob/data["freq"]) {
						gemius_hcconn.internal_hit(0,109,data["id"],data["evid"],"smpsonar",0,0,"_ASF="+data["freq"]+(data["extra"]?("|"+data["extra"]):""));
					}
					data["sdur"] += Math.min(prob,data["freq"]);
					prob -= data["freq"];
				}
			}
		},
		gdprdata_loaded : function() {
			try {
				if (gemius_hcconn.gdprdisabled) {
					gemius_hcconn.consent_loaded(true,false);
					return;
				}
				var purposes = gemius_hcconn.cmp_purposes()[gemius_hcconn.gdprversion];
				if (typeof purposes == "undefined") {
					gemius_hcconn.consent_loaded(false,false);
					return;
				}
				for (var i=0; i<purposes.length; ++i) {
					if (!gemius_hcconn.gdprdata[purposes[i]-1]) {
						gemius_hcconn.consent_loaded(false,false);
						return;
					}
				}
			} catch (e) {
				gemius_hcconn.consent_loaded(false,false);
				return;
			}
			gemius_hcconn.consent_loaded(true,false);
		},
		consent_loaded : function(consent,explicit) {
			if (gemius_hcconn.cmpto!=null) {
				clearTimeout(gemius_hcconn.cmpto);
				gemius_hcconn.cmpto = null;
			}
			if (explicit || gemius_hcconn.explicit_consent === null) {
				gemius_hcconn.waiting_for_consent = 0;
				gemius_hcconn.has_consent = consent?true:false;
				if (explicit) {
					gemius_hcconn.explicit_consent = gemius_hcconn.has_consent;
				}
				if (gemius_hcconn.has_consent) {
					if (gemius_hcconn.waiting_for_fpdata) {
						gemius_hcconn.load_fpdata();
					}
					if (gemius_hcconn.waiting_for_lsdata) {
						gemius_hcconn.load_lsdata();
					}
					gemius_hcconn.load_gsconf();
				} else {
					gemius_hcconn.fpdata = '-NOCONSENT';
					gemius_hcconn.lsdata = '-NOCONSENT';
					gemius_hcconn.waiting_for_fpdata = 0;
					gemius_hcconn.waiting_for_lsdata = 0;
					gemius_hcconn.paramsready();
				}
				gemius_hcconn.latehits();
			}
		},
		consentto : function() {
			if (gemius_hcconn.waiting_for_consent==1) {
				gemius_hcconn.cmpto = null;
				gemius_hcconn.waiting_for_consent = 0;
				gemius_hcconn.has_consent = false;
				gemius_hcconn.latehits();
			}
		},
		gsync_forget_ts : function() {
			if (!gemius_hcconn.use_gsync) {
				return 0;
			}
			if (typeof gemius_gsconf != "object") {
				return null;
			}
			if (gemius_gsconf==null || !gemius_gsconf.publishers) {
				return 0;
			}
			if (typeof gemius_hcsync != 'object') {
				return null;
			}
			if (!gemius_hcsync.enabled) {
				return 0;
			}
			var gdprdata = gemius_hcsync.get_gdprdata();
			if (typeof gdprdata != 'object' || gdprdata == null || gdprdata.optout_set) {
				return null;
			}
			if (!gdprdata.last_sync_ts || gemius_hcconn.get_fpdata_ts() > gdprdata.last_sync_ts) {
				return null;
			}
			return gdprdata.forget_ts ? gdprdata.forget_ts : 0;
		},
		pfp_cache_write : function() {
			try {
				var ghc = gemius_hcconn;
				if (ghc.fpdata_sec_state=='unknown') {
					return;
				}
				var pfp_cache = ghc.pfp_cache;
				var val = pfp_cache.fpdata + ',' + pfp_cache.create_ts;
				var cache = pfp_cache.cache;
				for (var key in cache) {
					if (cache.hasOwnProperty(key)) {
						val += ',' + key + ',' + cache[key];
					}
				}
				var reset_secondary = (ghc.pfp_cache_secondary_fpdata!='' && ghc.pfp_cache_secondary_fpdata[0]!='-' && ghc.pfp_cache_secondary_fpdata!=ghc.getrawfpdata(ghc.gemius_fpdata_secondary));
				gemius_cookie.set(ghc.cachecookie_name, '', ghc.cookie_expire, null, ghc.fpdata_sec_state, reset_secondary);
				gemius_cookie.set(ghc.cachecookie_name, val, ghc.cookie_expire, null, ghc.fpdata_sec_state, reset_secondary);
			} catch (e) {}
		},
		pfp_cache_clear : function() {
			gemius_hcconn.pfp_cache = {fpdata: "", create_ts: NaN, size: 0, cache: {}};
		},
		pfp_cache_validate : function() {
			var pfp_cache = gemius_hcconn.pfp_cache;
			return pfp_cache.fpdata==gemius_hcconn.getrawfpdata() && !isNaN(pfp_cache.create_ts) && (new Date()).getTime()-pfp_cache.create_ts<2592000000;
		},
		pfp_cache_read : function() {
			try {
				gemius_hcconn.pfp_cache_clear();
				gemius_hcconn.pfp_cache_secondary_fpdata = '-TURNEDOFF';
				if (gemius_hcconn.fpdata_sec_state=='unknown') {
					return;
				}
				var cachecookie = gemius_cookie.get_on_state(gemius_hcconn.cachecookie_name, gemius_hcconn.fpdata_sec_state);
				var arr = cachecookie.secondary.split(',');
				gemius_hcconn.pfp_cache_secondary_fpdata = arr[0];
				arr = cachecookie.primary.split(',');
				if (arr.length<2) {
					return;
				}
				var pfp_cache = gemius_hcconn.pfp_cache;
				pfp_cache.fpdata = arr[0];
				pfp_cache.create_ts = parseInt(arr[1]);
				for (var i = 2; i + 1 < arr.length && pfp_cache.size < 8; i += 2) {
					var mts = parseInt(arr[i+1]);
					if (!isNaN(mts)) {
						pfp_cache.cache[arr[i]] = mts;
						pfp_cache.size++;
					}
				}
			} catch (e) {}
		},
		pfp_cache_add : function(pfpdata) {
			var pfp_cache = gemius_hcconn.pfp_cache;
			var cache = pfp_cache.cache;
			var mts = (new Date()).getTime();
			if (cache[pfpdata]) {
				cache[pfpdata] = mts;
				return;
			}
			if (gemius_hcconn.pfp_cache.size >= 8) {
				var mints = Infinity;
				var minkey = null;
				for (var key in cache) {
					if (cache.hasOwnProperty(key) && cache[key] < mints) {
						minkey = key;
						mints = cache[key];
					}
				}
				delete cache[minkey];
				pfp_cache.size--;
			}
			cache[pfpdata] = mts;
			pfp_cache.size++;
		},
		pfp_received : function(fpdata,create_ts,forget_ts) {
			gemius_hcconn.pfp = {'fpdata': fpdata, 'create_ts': create_ts, 'forget_ts': forget_ts};
			gemius_hcconn.pfp_sync();
		},
		pfp_sendhit : function() {
			var url = (gemius_hcconn.hssl?'https://':'http://')+gemius_hcconn.hc+'/_';
			var d = new Date().getTime();
			url += d + "/redot.gif?id=" + gemius_hcconn.event_identifier;
			url += "&fpdata=" + gemius_hcconn.getrawfpdata();
			url += "&pfpdata=" + gemius_hcconn.pfp.fpdata;
			url += "&roc=1&et=9&w=fpm";
			var href = new String(document.location.href);
			var extra = "pfpsz=" + gemius_hcconn.pfp_cache.size + "|pfpcts=" + gemius_hcconn.pfp_cache.create_ts;
			if (typeof encodeURIComponent != "undefined") {
				url += '&href=' + encodeURIComponent(href.substring(0,499));
				url += '&extra=' + encodeURIComponent(extra.substring(0,1999));
			}
			if (typeof navigator.sendBeacon == "function") {
				navigator.sendBeacon(url);
			} else {
				var images_l = gemius_hcconn.images.length;
				gemius_hcconn.images[images_l] = new Image();
				gemius_hcconn.images[images_l].src = url;
			}
		},
		pfp_sync : function() {
			if (!gemius_hcconn.pfp_need_sync) {
				return;
			}
			if (gemius_hcconn.getrawfpdata() == gemius_hcconn.pfp.fpdata) {
				gemius_hcconn.pfp_need_sync = false;
				return;
			}
			var has_fpdata = (gemius_hcconn.fpdata.length>0 && gemius_hcconn.fpdata[0]!='-');
			var has_pfpdata = (gemius_hcconn.pfp.fpdata.length>0 && gemius_hcconn.pfp.fpdata[0]!='-');
			if (!has_fpdata || !has_pfpdata || gemius_hcconn.event_identifier == null) {
				return;
			}
			var forget_ts = gemius_hcconn.gsync_forget_ts();
			if (forget_ts == null) {
				return;
			}
			if (forget_ts < gemius_hcconn.pfp.forget_ts) {
				forget_ts = gemius_hcconn.pfp.forget_ts
			}
			var create_ts = gemius_hcconn.get_fpdata_ts();
			if (create_ts < forget_ts || gemius_hcconn.pfp.create_ts < forget_ts) {
				gemius_hcconn.pfp_need_sync = false;
				return;
			}
			var pfp_need_hit = true;
			gemius_hcconn.pfp_cache_read();
			if (!gemius_hcconn.pfp_cache_validate()) {
				gemius_hcconn.pfp_cache_clear();
				gemius_hcconn.pfp_cache.fpdata = gemius_hcconn.getrawfpdata();
				gemius_hcconn.pfp_cache.create_ts = (new Date()).getTime();
			}

			if (gemius_hcconn.pfp_cache.cache[gemius_hcconn.pfp.fpdata]) {
				pfp_need_hit = false;
			}
			gemius_hcconn.pfp_need_sync = false;
			gemius_hcconn.pfp_cache_add(gemius_hcconn.pfp.fpdata);
			gemius_hcconn.pfp_cache_write();
			if (pfp_need_hit) {
				gemius_hcconn.pfp_sendhit();
			}
		},
		pfp_loop : function() {
			if (gemius_hcconn.pfp_need_sync) {
				if (gemius_hcconn.has_consent && gemius_hcconn.pfp.fpdata.length == 0) {
					window.top.postMessage("_xx_gemius_getpfpdata_xx_","*");
				}
				gemius_hcconn.pfp_sync();
				if (gemius_hcconn.pfp_interval <= 64) {
					setTimeout(gemius_hcconn.pfp_loop, gemius_hcconn.pfp_interval * 1000);
					gemius_hcconn.pfp_interval *= 2;
				}
			}
		},
		ghit : function(allowaddscript,vers,args,evid,hsrc,sonar) {
			if (args.length>0) {
				gemius_hcconn.internal_hit(allowaddscript,vers,args[0],evid,"view",hsrc,sonar,gemius_hcconn.array_to_string(args,1));
			}
		},
		gevent : function(allowaddscript,vers,args,evid,hsrc,sonar) {
			var pos = 0;
			var et = "view";
			if (args.length>1) {
				var m = (new String(args[0])).match('^_([a-zA-Z0-9]+)_$');
				if (m) {
					et = m[1];
					pos = 1;
				}
			}
			if (args.length>pos) {
				if (!args[pos] && gemius_hcconn.event_identifier != null) {
					args[pos] = gemius_hcconn.event_identifier;
				}
				if (args[pos]) {
					gemius_hcconn.internal_hit(allowaddscript,vers,args[pos],evid,et,hsrc,sonar,gemius_hcconn.array_to_string(args,pos+1));
				}
			}
		},
		addscripthit : function() { gemius_hcconn.ghit(1,106,arguments,0,2,gemius_hcconn.sonar_auto_init); },
		plainhit : function() { gemius_hcconn.ghit(0,107,arguments,0,2,gemius_hcconn.sonar_auto_init); },
		addscriptevent : function() { gemius_hcconn.gevent(1,106,arguments,0,3,gemius_hcconn.sonar_auto_init); },
		plainevent : function() { gemius_hcconn.gevent(0,107,arguments,0,3,gemius_hcconn.sonar_auto_init); },
		pendingdata : function(arr,fn) {
			var i;
			if (typeof window[arr] != 'undefined') {
				for (i=0 ; i<window[arr].length ; i++) {
					fn.apply(this,window[arr][i]);
				}
				window[arr]=[];
			}
		},
		sendpendingdata : function() {
			gemius_hcconn.pendingdata('pp_gemius_hit_pdata',gemius_hcconn.addscripthit);
			gemius_hcconn.pendingdata('gemius_hit_pdata',gemius_hcconn.plainhit);
			gemius_hcconn.pendingdata('pp_gemius_event_pdata',gemius_hcconn.addscriptevent);
			gemius_hcconn.pendingdata('gemius_event_pdata',gemius_hcconn.plainevent);
			gemius_hcconn.pendingdata('gemius_shits',gemius_hcconn.addscripthit);
			gemius_hcconn.pendingdata('gemius_phits',gemius_hcconn.plainhit);
			gemius_hcconn.pendingdata('gemius_sevents',gemius_hcconn.addscriptevent);
			gemius_hcconn.pendingdata('gemius_pevents',gemius_hcconn.plainevent);
		},
		findvisapi : function() {
			var p = ['moz','webkit','ms','o'];
			var i;
			if (typeof document.hidden != 'undefined') {
				gemius_hcconn.visapi_h = 'hidden';
				gemius_hcconn.visapi_s = 'visibilityState';
				gemius_hcconn.visapi_c = 'visibilitychange';
			} else {
				for (i in p) {
					if (typeof document[p[i]+'Hidden'] != 'undefined') {
						gemius_hcconn.visapi_h = p[i]+'Hidden';
						gemius_hcconn.visapi_s = p[i]+'VisibilityState';
						gemius_hcconn.visapi_c = p[i]+'visibilitychange';
					}
				}
			}
		},
		load_fpdata : function() {
			if (gemius_hcconn.waiting_for_consent==0 && gemius_hcconn.load_fpdata_started==0) {
				gemius_hcconn.load_fpdata_started = 1;
				var domain = new String(document.location.hostname);
				var hcdomain = "hit.gemius.pl";
				if (domain == hcdomain || domain.substr(-hcdomain.length-1) == ("."+hcdomain)) {
					gemius_hcconn.fpdata = '';
					gemius_hcconn.fpcdomain = '';
					gemius_hcconn.fpdata_loaded();
				} else {
					var url = (gemius_hcconn.hssl?'https://':'http://')+gemius_hcconn.hc+'/fpdata.js?href='+domain;
					gemius_hcconn.sto = setTimeout(gemius_hcconn.scriptto,10000);
					gemius_hcconn.append_script(url,gemius_hcconn.fpdata_loaded,0);
				}
			}
		},
		load_lsdata : function() {
			if (gemius_hcconn.waiting_for_consent==0 && gemius_hcconn.load_lsdata_started==0) {
				gemius_hcconn.load_lsdata_started = 1;
				if (gemius_hcconn.ssl) {
					gemius_hcconn.addframe(1,'get','',gemius_hcconn.second_datareceiver);
				} else {
					gemius_hcconn.addframe(0,'get','',gemius_hcconn.first_datareceiver);
				}
			}
		},
		getchromever : function() {
			if (!!window.chrome && (typeof navigator.userAgent == 'string')) {
				var ver = navigator.userAgent.match(/(Chrom(e|ium)|CriOS)\/([0-9]+)\./);
				return (ver==null)?-1:parseInt(ver[3]);
			}
			return -1;
		},
		getanticache : function() {
			var dt = new Date();
			var v = new Date(dt.getFullYear(),dt.getMonth(),dt.getDate(),4).getTime()/(3600*1000);
			if (dt.getDay() != 0 || dt.getHours() >= 4) v += (7-dt.getDay())*24;
			return v;
		},
		gsconf_loaded : function() {
			if (typeof gemius_gsconf=="object" && gemius_gsconf!=null && gemius_gsconf.publishers && typeof gemius_hcconn.src == 'string') {
				var url = new URL(gemius_hcconn.src);
				url = url.origin + url.pathname.substr(0, url.pathname.lastIndexOf('/'));
				url += '/mgemius.js?gsver='+gemius_hcconn.version+'&v='+gemius_hcconn.getanticache();
				gemius_hcconn.append_script(url,null,0);
			}
		},
		load_gsconf : function() {
			if (gemius_hcconn.use_gsync && gemius_hcconn.gsconf_added == 0) {
				gemius_hcconn.gsconf_added = 1;
				var domain = new String(document.location.hostname);
				var url = (gemius_hcconn.hssl?'https://':'http://')+gemius_hcconn.hc+'/gsconf.js?gst=parent&href='+domain+'&gsver='+gemius_hcconn.version+'&v='+gemius_hcconn.getanticache();
				gemius_hcconn.append_script(url,gemius_hcconn.gsconf_loaded,0);
			}
		},
		init_timeout : function() {
			if (gemius_hcconn.initto!=null) {
				gemius_hcconn.initto = null;
				gemius_hcconn.init();
			}
		},
		init : function(params) {
			if (gemius_hcconn.initto!=null) {
				clearTimeout(gemius_hcconn.initto);
				gemius_hcconn.initto = null;
			}
			if (gemius_hcconn.init_called) {
				return;
			}
			gemius_hcconn.init_called = 1;
			if (typeof params == 'object') {
				gemius_hcconn.init_params(params);
			} else {
				params = {};
			}
			setInterval(gemius_hcconn.timer,60*1000);
			gemius_hcconn.add_event(window,'message',gemius_hcconn.msgreceiver);
			if (gemius_hcconn.dnt==0 && gemius_hcconn.explicit_consent!==false) {
				gemius_hcconn.getfpcookie();
				gemius_hcconn.waiting_for_fpdata = ((gemius_hcconn.fpdata.length>0 && gemius_hcconn.fpdata[0]=='-') || gemius_hcconn.fpdata=='')?1:0;
			} else {
				gemius_hcconn.waiting_for_fpdata = 1;
				gemius_hcconn.fpdata = "-DNT";
			}
			try {
				if (gemius_hcconn.dnt==0 && gemius_hcconn.explicit_consent!==false) {
					gemius_hcconn.waiting_for_lsdata = (typeof window.postMessage != 'undefined' && typeof localStorage != 'undefined' && localStorage != null)?1:0;
					if (gemius_hcconn.waiting_for_lsdata==0) {
						gemius_hcconn.lsdata='-NOTSUP';
					}
				} else {
					gemius_hcconn.waiting_for_lsdata = 1;
					gemius_hcconn.lsdata = "-DNT";
				}
			} catch (e) {
				gemius_hcconn.waiting_for_lsdata = 0;
				gemius_hcconn.lsdata='-TURNEDOFF';
			}
			gemius_hcconn.require_consent_info = 0;
			if (gemius_hcconn.dnt==0 && gemius_hcconn.explicit_consent!==false) {
				if (gemius_hcconn.explicit_consent===null && gemius_hcconn.use_cmp && gemius_cmpclient.find_cmp()) {
					gemius_hcconn.cmp_found = 1;
					if (gemius_hcconn.cmp_timeout==Infinity) {
						gemius_hcconn.require_consent_info = 1;
					} else {
						gemius_hcconn.cmpto = setTimeout(gemius_hcconn.consentto,gemius_hcconn.cmp_timeout);
					}
					gemius_cmpclient.get_consent(gemius_hcconn.consent_loaded,gemius_hcconn.cmp_purposes());
				} else if (gemius_hcconn.explicit_consent===null && gemius_hcconn.gdpr_params() != '') {
					gemius_hcconn.gdpr_found = 1;
					gemius_hcconn.cmpto = setTimeout(gemius_hcconn.consentto,10000);
					var url = (gemius_hcconn.hssl?'https://':'http://')+gemius_hcconn.hc+'/gdprdata.js' + gemius_hcconn.gdpr_params(true);
					gemius_hcconn.append_script(url,gemius_hcconn.gdprdata_loaded,0);
				} else {
					gemius_hcconn.waiting_for_consent = 0;
					gemius_hcconn.has_consent = true;
					if (gemius_hcconn.waiting_for_fpdata) {
						gemius_hcconn.load_fpdata();
					}
					if (gemius_hcconn.waiting_for_lsdata) {
						gemius_hcconn.load_lsdata();
					}
					gemius_hcconn.load_gsconf();
				}
				if (window.self !== window.top) {
					gemius_hcconn.pfp_need_sync = true;
					gemius_hcconn.pfp_loop();
				}
			} else {
				gemius_hcconn.waiting_for_consent = 0;
				gemius_hcconn.has_consent = false;
				gemius_hcconn.waiting_for_fpdata = 1;
				gemius_hcconn.fpdata = "-DNT";
			}
			gemius_hcconn.paramsready();
			gemius_hcconn.latehits();
			gemius_hcconn.add_event(document,"mousedown",function() {gemius_hcconn.mousedown();} );
			gemius_hit = gemius_hcconn.plainhit;
			gemius_event = gemius_hcconn.plainevent;
			pp_gemius_hit = gemius_hcconn.addscripthit;
			pp_gemius_event = gemius_hcconn.addscriptevent;
			var p = params;
			if (typeof p['identifier'] == 'undefined' && typeof gemius_identifier == 'undefined' && typeof pp_gemius_identifier == 'undefined') {
				gemius_hcconn.sonar_auto_init = (typeof p['sonar_auto_init_disabled'] == 'boolean')?(p['sonar_auto_init_disabled']?0:1):(typeof gemius_sonar_auto_init_disabled == 'boolean')?(gemius_sonar_auto_init_disabled?0:1):(typeof pp_gemius_sonar_auto_init_disabled == 'boolean')?(pp_gemius_sonar_auto_init_disabled?0:1):1;
			}
			try {
				if (typeof gemius_loaded != "undefined") {
					gemius_loaded();
				} else if (typeof pp_gemius_loaded != "undefined") {
					pp_gemius_loaded();
				}
			} catch (e) {}
			gemius_hcconn.event_identifier = (typeof p['identifier'] != 'undefined')?p['identifier']:(typeof gemius_identifier != 'undefined')?gemius_identifier:(typeof pp_gemius_identifier != 'undefined')?pp_gemius_identifier:gemius_hcconn.event_identifier;
			gemius_hcconn.sendpendingdata();
			if (typeof gemius_hcconn.init_pageview == 'function') {
				gemius_hcconn.init_pageview(params);
			}
		}
	}
	gemius_init = gemius_hcconn.init;
	pp_gemius_init = gemius_hcconn.init;
	gemius_hcconn.getdntcookie();
	gemius_hcconn.getfpcap();
	gemius_hcconn.hssl = (gemius_hcconn.ssl||gemius_hcconn.getchromever()>=67)?1:0;
	gemius_hcconn.flashv = gemius_hcconn.getflashv();
	gemius_hcconn.waiting_on_prerender = 0;
	gemius_hcconn.findvisapi();
	if (gemius_hcconn.visapi_s != '') {
		if (document[gemius_hcconn.visapi_s] == 'prerender') {
			gemius_hcconn.waiting_on_prerender = 1;
		}
		gemius_hcconn.add_event(document,gemius_hcconn.visapi_c,gemius_hcconn.visibilitychanged);
	}
	gemius_hcconn.add_event(window,"unload",function() {gemius_hcconn.unload(true);} );
	gemius_hcconn.add_event(window,"beforeunload",function() {gemius_hcconn.unload(true);} );
	gemius_hcconn.pendingdata('gemius_init_pdata',gemius_hcconn.init);
	gemius_hcconn.pendingdata('pp_gemius_init_pdata',gemius_hcconn.init);
	if (!gemius_hcconn.init_called) {
		var timeout = (typeof gemius_init_timeout == 'number')?gemius_init_timeout:(typeof pp_gemius_init_timeout == 'number')?pp_gemius_init_timeout:null;
		if (typeof timeout == 'number') {
			if (timeout == Infinity) {
				gemius_hcconn.require_consent_info = 1;
			} else {
				gemius_hcconn.initto = setTimeout(gemius_hcconn.init_timeout,timeout);
			}
		} else {
			gemius_init();
		}
	}
}

(function () {
	var init_pageview = function(p) {
		var identifier = (typeof p['identifier'] != 'undefined')?p['identifier']:(typeof gemius_identifier != 'undefined' && !gemius_identifier.match(/^USED_/))?gemius_identifier:null;
		var mode = (typeof p['mode'] != 'undefined')?p['mode']:(typeof pp_gemius_mode != 'undefined')?pp_gemius_mode:null;
		if (typeof pp_gemius_identifier != 'undefined' && !pp_gemius_identifier.match(/^USED_/)) {
			var s = mode ? 0 : 1;
			var v = 101-s;
			if (typeof window.pp_gemius_cnt != 'undefined') {
				pp_gemius_identifier = 'ERR_'+pp_gemius_identifier.replace(/id=/g,'id=ERR_');
				v = 102;
			}
			window.pp_gemius_cnt = 1;
			var extraparameters = (typeof p['extraparameters'] != 'undefined')?p['extraparameters']:(typeof pp_gemius_extraparameters != 'undefined')?pp_gemius_extraparameters:null;
			if (extraparameters) {
				gemius_hcconn.gevent(s,v,[pp_gemius_identifier].concat(extraparameters),0,1,1);
			} else {
				gemius_hcconn.ghit(s,v,[pp_gemius_identifier],0,1,1);
			}
			if (gemius_hcconn.event_identifier==null) {
				gemius_hcconn.event_identifier = pp_gemius_identifier;
			}
			if (v != 102 && typeof pp_gemius_time_identifier != 'undefined') {
				gemius_hcconn.gtimer_add(pp_gemius_time_identifier);
			}
			pp_gemius_identifier = 'USED_'+pp_gemius_identifier.replace(/id=/g,'id=USED_');
		} else if (identifier) {
			var s = (mode) ? 0 : 1;
			var v = 101-s;
			if (typeof window.pp_gemius_cnt != 'undefined') {
				if (typeof gemius_identifier != 'undefined') {
					gemius_identifier = 'ERR_'+gemius_identifier.replace(/id=/g,'id=ERR_');
				}
				v = 102;
			}
			window.pp_gemius_cnt = 1;
			var extraparameters = (typeof p['extraparameters'] != 'undefined')?p['extraparameters']:(typeof gemius_extraparameters != 'undefined')?gemius_extraparameters:null;
			if (extraparameters) {
				gemius_hcconn.gevent(s,v,[identifier].concat(extraparameters),0,1,1);
			} else {
				gemius_hcconn.ghit(s,v,[identifier],0,1,1);
			}
			if (gemius_hcconn.event_identifier==null) {
				gemius_hcconn.event_identifier = identifier;
			}
			if (typeof gemius_identifier != 'undefined') {
				gemius_identifier = 'USED_'+gemius_identifier.replace(/id=/g,'id=USED_');
			}
		}
		gemius_hcconn.sendpendingdata();
	}
	if (!gemius_hcconn.init_called && (typeof gemius_init_timeout == 'number' || typeof pp_gemius_init_timeout == 'number')) {
		if (!gemius_hcconn.init_pageview) {
			gemius_hcconn.init_pageview = init_pageview;
		}
	} else {
		init_pageview({});
	}
})();
