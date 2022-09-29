/* ----- Banner positions links and dimentions ----------------------- 

Desktop 

Abv.bg inner pages

Inbox:

    160x600, 1x1 px

    https://imga.abv.bg/e/s/r_gam.html?pos=inbox&act=m50&w=160
    https://imga.abv.bg/e/s/r_gam.html?pos=inbox&act=f45&w=160
    https://imga.abv.bg/e/s/r_gam.html?pos=inbox&act=other&w=160

    300x600, 1x1 px

    https://imga.abv.bg/e/s/r_gam.html?pos=inbox&act=m50&w=300
    https://imga.abv.bg/e/s/r_gam.html?pos=inbox&act=f45&w=300
    https://imga.abv.bg/e/s/r_gam.html?pos=inbox&act=other&w=300

Middle page: 

    300x600, 1x1, 300x250 px

    https://imga.abv.bg/e/s/r_gam.html?pos=middle&act=m50
    https://imga.abv.bg/e/s/r_gam.html?pos=middle&act=f45
    https://imga.abv.bg/e/s/r_gam.html?pos=middle&act=m50
    https://imga.abv.bg/e/s/r_gam.html?pos=middle&act=f45

Sent page

    300x600, 1x1, 300x250 px

    https://imga.abv.bg/e/s/r_gam.html?pos=sent&act=m50
    https://imga.abv.bg/e/s/r_gam.html?pos=sent&act=f45
    https://imga.abv.bg/e/s/r_gam.html?pos=sent&act=m50
    https://imga.abv.bg/e/s/r_gam.html?pos=sent&act=f45


Abv.bg homepage 

Grabo:

    465x150 px

    https://imga.abv.bg/e/s/r_gam.html?pos=grabo&act=l
    https://imga.abv.bg/e/s/r_gam.html?pos=grabo&act=r

Rectangle: 

    300x250 px

    https://imga.abv.bg/e/s/r_gam.html?pos=index&act=home

Native ad:

    0x0 px

    https://imga.abv.bg/e/s/r_gam.html?pos=native&act=home

    https://imga.abv.bg/e/s/r_gam.html?pos=gong&act=home

0x0:

    0x0 px

    https://imga.abv.bg/e/s/r_gam.html?pos=hidden&act=home

Passport 

Home page: 

    300x250 px

    https://imga.abv.bg/e/s/r_gam.html?pos=pass&act=home


Mobile

Applications

All pages:

    1x1, 320x50, 320x100 px

    https://imga.abv.bg/e/s/r_gam.html?pos=apps&act=all
    https://imga.abv.bg/e/s/r_gam.html?pos=apps100&act=all

Abv.bg web 

All pages:

    1x1, 320x50, 320x100 px

    https://imga.abv.bg/e/s/r_gam.html?pos=mobile&act=all

---------------------------------------------------------- */

// Create Array.from() function if not exist
if (!Array.from) {
    Array.from = (function () {
        var toStr = Object.prototype.toString;
        var isCallable = function (fn) {
            return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
        };
        var toInteger = function (value) {
            var number = Number(value);
            if (isNaN(number)) { return 0; }
            if (number === 0 || !isFinite(number)) { return number; }
            return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
        };
        var maxSafeInteger = Math.pow(2, 53) - 1;
        var toLength = function (value) {
            var len = toInteger(value);
            return Math.min(Math.max(len, 0), maxSafeInteger);
        };

        return function from(arrayLike) {
            var C = this;
            var items = Object(arrayLike);
            if (arrayLike == null) {
                throw new TypeError('Array.from requires an array-like object - not null or undefined');
            }
            var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
            var T;
            if (typeof mapFn !== 'undefined') {
                if (!isCallable(mapFn)) {
                    throw new TypeError('Array.from: when provided, the second argument must be a function');
                }
                if (arguments.length > 2) {
                    T = arguments[2];
                }
            }
            var len = toLength(items.length);
            var A = isCallable(C) ? Object(new C(len)) : new Array(len);
            var k = 0;
            var kValue;
            
            while (k < len) {
                kValue = items[k];
                if (mapFn) {
                    A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
                } else {
                    A[k] = kValue;
                }
                k += 1;
            }

            A.length = len;
            return A;
        };
    }());
}

// Create Element.remove() function if not exist
if (!('remove' in Element.prototype)) {
    Element.prototype.remove = function () {
        if (this.parentNode) {
            this.parentNode.removeChild(this);
        }
    };
}

var adsTarget = {
    sent: {
        // f
        'f14': ['div-gpt-ad-1529062425555-0', 'Desktop/Sent-F14-17/Rectangle/ATF'],
        'f18': ['div-gpt-ad-1529062425555-1', 'Desktop/Sent-F18-24/Rectangle/ATF'],
        'f25': ['div-gpt-ad-1529062425555-2', 'Desktop/Sent-F25-34/Rectangle/ATF'],
        'f35': ['div-gpt-ad-1529062425555-3', 'Desktop/Sent-F35-49/Rectangle/ATF'],
        'f45': ['div-gpt-ad-1529062425555-4', 'Desktop/Sent-F49-Plus/Rectangle/ATF'],
        // m 
        'm14': ['div-gpt-ad-1529062425555-5', 'Desktop/Sent-M14-17/Rectangle/ATF'],
        'm18': ['div-gpt-ad-1529062425555-6', 'Desktop/Sent-M18-24/Rectangle/ATF'],
        'm25': ['div-gpt-ad-1529062425555-7', 'Desktop/Sent-M25-34/Rectangle/ATF'],
        'm35': ['div-gpt-ad-1529062425555-8', 'Desktop/Sent-M35-49/Rectangle/ATF'],
        'm45': ['div-gpt-ad-1529062425555-9', 'Desktop/Sent-M49-Plus/Rectangle/ATF'],
        'm50': ['div-gpt-ad-1529062425555-9', 'Desktop/Sent-M49-Plus/Rectangle/ATF'],
        // other
        'inside': ['div-gpt-ad-1529062425555-10', 'Desktop/Sent-Other/Rectangle/ATF'],
        'other': ['div-gpt-ad-1529062425555-10', 'Desktop/Sent-Other/Rectangle/ATF']
    },
    inbox: {
        // f
        'f14': ['div-gpt-ad-1528962053672-0', 'Desktop/inbox_f14/Rectangle/ATF'],
        'f18': ['div-gpt-ad-1528962053672-1', 'Desktop/inbox_f18/Rectangle/ATF'],
        'f25': ['div-gpt-ad-1528962053672-2', 'Desktop/inbox_f25/Rectangle/ATF'],
        'f35': ['div-gpt-ad-1528962053672-3', 'Desktop/inbox_f35/Rectangle/ATF'],
        'f45': ['div-gpt-ad-1528962053672-4', 'Desktop/inbox_f45/Rectangle/ATF'],
        // m 
        'm14': ['div-gpt-ad-1528962053672-5', 'Desktop/inbox_m14/Rectangle/ATF'],
        'm18': ['div-gpt-ad-1528962053672-6', 'Desktop/inbox_m18/Rectangle/ATF'],
        'm25': ['div-gpt-ad-1528962053672-7', 'Desktop/inbox_m25/Rectangle/ATF'],
        'm35': ['div-gpt-ad-1528962053672-8', 'Desktop/inbox_m35/Rectangle/ATF'],
        'm45': ['div-gpt-ad-1528962053672-9', 'Desktop/inbox_m45/Rectangle/ATF'],
        //'m50' : ['div-gpt-ad-1528962053672-9', 'Desktop/inbox_m50/Rectangle/ATF'],
        // other
        'inside': ['div-gpt-ad-1528962053672-10', 'Desktop/inbox_other/Rectangle/ATF'],
        'other': ['div-gpt-ad-1528962053672-10', 'Desktop/inbox_other/Rectangle/ATF']
    },
    middle: {
        // f
        'f14': ['div-gpt-ad-1528962544091-0', 'Desktop/middle_f14/Rectangle/ATF'],
        'f18': ['div-gpt-ad-1528962544091-1', 'Desktop/middle_f18/Rectangle/ATF'],
        'f25': ['div-gpt-ad-1528962544091-2', 'Desktop/middle_f25/Rectangle/ATF'],
        'f35': ['div-gpt-ad-1528962544091-3', 'Desktop/middle_f35/Rectangle/ATF'],
        'f45': ['div-gpt-ad-1528962544091-4', 'Desktop/middle_f45/Rectangle/ATF'],
        // m 
        'm14': ['div-gpt-ad-1528962544091-5', 'Desktop/middle_m14/Rectangle/ATF'],
        'm18': ['div-gpt-ad-1528962544091-6', 'Desktop/middle_m18/Rectangle/ATF'],
        'm25': ['div-gpt-ad-1528962544091-7', 'Desktop/middle_m25/Rectangle/ATF'],
        'm35': ['div-gpt-ad-1528962544091-8', 'Desktop/middle_m35/Rectangle/ATF'],
        'm45': ['div-gpt-ad-1528962544091-9', 'Desktop/middle_m45/Rectangle/ATF'],
        //'m50' : ['div-gpt-ad-1528962544091-9', 'Desktop/middle_m50/Rectangle/ATF'],
        // other
        'inside': ['div-gpt-ad-1528962544091-10', 'Desktop/middle_other/Rectangle/ATF'],
        'other': ['div-gpt-ad-1528962544091-10', 'Desktop/middle_other/Rectangle/ATF']
    },
    mobile: {
        'all': ['div-gpt-ad-1528962739725-0', 'Mobile/All_pages/Leaderboard/ATF'],
        // f
        'f14': ['div-gpt-ad-1615975174245-0', 'Mobile/All_pages/Leaderboard/ATF'],
        'f18': ['div-gpt-ad-1615975404520-0', 'Mobile/All_pages/Leaderboard/ATF'],
        'f25': ['div-gpt-ad-1615975798388-0', 'Mobile/All_pages/Leaderboard/ATF'],
        'f35': ['div-gpt-ad-1615975954353-0', 'Mobile/All_pages/Leaderboard/ATF'],
        'f45': ['div-gpt-ad-1615976419512-0', 'Mobile/All_pages/Leaderboard/ATF'],
        // m 
        'm14': ['div-gpt-ad-1615976538940-0', 'Mobile/All_pages/Leaderboard/ATF'],
        'm18': ['div-gpt-ad-1615976619525-0', 'Mobile/All_pages/Leaderboard/ATF'],
        'm25': ['div-gpt-ad-1615976814573-0', 'Mobile/All_pages/Leaderboard/ATF'],
        'm35': ['div-gpt-ad-1615976906778-0', 'Mobile/All_pages/Leaderboard/ATF'],
        'm45': ['div-gpt-ad-1615977048092-0', 'Mobile/All_pages/Leaderboard/ATF'],
    },
    apps100: {
        'all': ['div-gpt-ad-1586863003075-0', 'Aplication/All_pages/Leaderboard/ATF_new'],
        // f
        'f14': ['div-gpt-ad-1615981045673-0', 'Mobile/All_pages/Leaderboard/ATF'],
        'f18': ['div-gpt-ad-1615981112775-0', 'Mobile/All_pages/Leaderboard/ATF'],
        'f25': ['div-gpt-ad-1615981143514-0', 'Mobile/All_pages/Leaderboard/ATF'],
        'f35': ['div-gpt-ad-1615981167611-0', 'Mobile/All_pages/Leaderboard/ATF'],
        'f45': ['div-gpt-ad-1615981198006-0', 'Mobile/All_pages/Leaderboard/ATF'],
        // m 
        'm14': ['div-gpt-ad-1615981224516-0', 'Mobile/All_pages/Leaderboard/ATF'],
        'm18': ['div-gpt-ad-1615981247618-0', 'Mobile/All_pages/Leaderboard/ATF'],
        'm25': ['div-gpt-ad-1615981277898-0', 'Mobile/All_pages/Leaderboard/ATF'],
        'm35': ['div-gpt-ad-1615981322577-0', 'Mobile/All_pages/Leaderboard/ATF'],
        'm45': ['div-gpt-ad-1615981956819-0', 'Mobile/All_pages/Leaderboard/ATF'],
    },
    apps: {
        'all': ['div-gpt-ad-1528962820033-0', 'Aplication/All_pages/Leaderboard/ATF'],
        // f
        'f14': ['div-gpt-ad-1615981045673-0', 'Mobile/All_pages/Leaderboard/ATF'],
        'f18': ['div-gpt-ad-1615981112775-0', 'Mobile/All_pages/Leaderboard/ATF'],
        'f25': ['div-gpt-ad-1615981143514-0', 'Mobile/All_pages/Leaderboard/ATF'],
        'f35': ['div-gpt-ad-1615981167611-0', 'Mobile/All_pages/Leaderboard/ATF'],
        'f45': ['div-gpt-ad-1615981198006-0', 'Mobile/All_pages/Leaderboard/ATF'],
        // m 
        'm14': ['div-gpt-ad-1615981224516-0', 'Mobile/All_pages/Leaderboard/ATF'],
        'm18': ['div-gpt-ad-1615981247618-0', 'Mobile/All_pages/Leaderboard/ATF'],
        'm25': ['div-gpt-ad-1615981277898-0', 'Mobile/All_pages/Leaderboard/ATF'],
        'm35': ['div-gpt-ad-1615981322577-0', 'Mobile/All_pages/Leaderboard/ATF'],
        'm45': ['div-gpt-ad-1615981956819-0', 'Mobile/All_pages/Leaderboard/ATF'],
    },
    pass: {
        'home': ['div-gpt-ad-1528961798434-5', 'Aplication/All_pages/Leaderboard/ATF']
    },
    index: {
        'home': ['div-gpt-ad-1528961798434-3', 'Desktop/Homepage/Rectangle/ATF']
    },
    hidden: {
        'home': ['div-gpt-ad-1600256783486-0', '/157018629/Abv.bg/Desktop/Homepage/Rectangle/Native_2']
        // 'home': ['div-gpt-ad-1528961798434-0', 'Desktop/Homepage/0x0/Hidden']
    },
    grabo: {
        'l': ['div-gpt-ad-1528961798434-1', 'Desktop/Homepage/Leaderboard/BTF'],
        'r': ['div-gpt-ad-1528961798434-2', 'Desktop/Homepage/Leaderboard/BTF2']
    },
    native: {
        'home': ['div-gpt-ad-1528961798434-4', 'Desktop/Homepage/Rectangle/Native_ads']
    },
    gong: {
        'home': ['div-gpt-ad-1634301116595-0', 'Desktop/Homepage/Rectangle/Native_ads']
    },
    dox: {
        'all': ['div-gpt-ad-1549971672417-0', 'Desktop/Homepage/Rectangle/Native_ads']
    },
    pariteni: {
        'all': ['div-gpt-ad-1527080866861-1', 'Desktop/Homepage/Rectangle/ATF']
    },
},
    demography = {
        // female
        'f14': 649285853,
        'f18': 649947952,
        'f25': 652268046,
        'f35': 652268175,
        'f45': 649286720,
        // male 
        'm14': 649286651,
        'm18': 649286771,
        'm25': 649948252,
        'm35': 649286765,
        'm45': 649948480
    },
    // demography RM task 22131
    demography_new = {
        // female
        'f14': 738374808,
        'f18': 736003906,
        'f25': 736003987,
        'f35': 736004161,
        'f45': 735627851,
        // male 
        'm14': 738374808,
        'm18': 736003906,
        'm25': 736003987,
        'm35': 736004161,
        'm45': 735627851
    },
    demography_mobile = {
        // female
        'f14': 805527301,
        'f18': 805527484,
        'f25': 805107965,
        'f35': 807535248,
        'f45': 805528135,
        // male 
        'm14': 805107521,
        'm18': 805107869,
        'm25': 805527940,
        'm35': 805108163,
        'm45': 805528015,
    },
    w2g = w2g || {},
    act = getPropFromUrl('act'),
    pos = getPropFromUrl('pos'),
    w = getPropFromUrl('w'),
    test = getPropFromUrl('test') === '1',
    consent = false,
    sas_target = /middle|sent|inbox/.test(pos) ? 'cid=' + act : '',
    apps = pos === 'apps' || pos === 'apps100';

if (typeof sas_target_netinfo != 'undefined') sas_target += ';' + sas_target_netinfo;
if (w) sas_target += ';w=' + w;
sas_target = sas_target.replace('&', ';');

var dfp_target = sas_target.split(';');

w2g.hostname = (pos === 'pariteni')? 'www.pariteni.bg' : apps? 'abv.bg' : 'img.abv.bg';
w2g.targeting = {};
dfp_target.forEach(function (entry) {
    var onetarget = entry.split('=');
    if ((w2g.targeting[onetarget[0]] === 'undefined' || w2g.targeting[onetarget[0]] === null 
            || !w2g.targeting[onetarget[0]]) && typeof onetarget[1] !== 'undefined') {
        w2g.targeting[onetarget[0]] = [onetarget[1]];
    } else if (typeof onetarget[1] !== 'undefined') {
        w2g.targeting[onetarget[0]].push(onetarget[1]);
    }
});

if(test) w2g.targeting['test'] = ['abv'];

if( getPropFromUrl('noskin') && w2g.hostname === 'img.abv.bg' ){
    w2g.targeting['abv_theme'] = ['noskin'];
} else if( w2g.hostname === 'img.abv.bg' ) {
    w2g.targeting['abv_theme'] = ['skined'];
}

addLoad(function () {

    var div = document.createElement('div'), 
        id = '';

    if (act === '' || pos === '') id = 'div-gpt-ad-1528962053672-0';
    else id = act && pos? adsTarget[pos][act][0] : 'div-gpt-ad-1528962053672-5';

    div.id = id;

    var container = $('#abv-banner') || document.body;

    container.appendChild(div);

    // console.log('__tcfapi: ', typeof __tcfapi === 'function');

    if(typeof __tcfapi === 'function') 
        __tcfapi('getTCData', 2, (tcData, success) => {
            const arr = Object.values(tcData.purpose.consents);
            let check = true;
            for(let x of arr) check &= x;
            // console.log('consent: ', arr, check);
            consent = !!check;
            w2gRun(consent);
        });
    else w2gRun();

});

function w2gRun(consent){

    consent = consent? consent : false;

    var imgSrc = 'https://pubads.g.doubleclick.net/activity;dc_iu=/157018629/DFPAudiencePixel;ord='
            + rdm() + ';dc_seg=' + demography[act] + '?',
        imgSrcMob = 'https://pubads.g.doubleclick.net/activity;dc_iu=/157018629/DFPAudiencePixel;ord='
            + rdm() + ';dc_seg=' + demography_mobile[act] + '?',
        imgSrcNew = 'https://pubads.g.doubleclick.net/activity;dc_iu=/157018629/DFPAudiencePixel;ord='
            + rdm() + ';dc_seg=' + demography_new[act] + '?',
        mobile = pos === 'mobile' || apps,
        isSegment = act && act !== 'all'; 

    // w2g
    w2g.cmd = w2g.cmd || [];

    w2g.cmd.push(function () {
        w2g.run(consent);
    });

    // console.log('w2g: ', w2g);
    // console.log('Act and consent check: ', consent, act);
    // console.log('Segments: ', imgSrc, imgSrcNew, imgSrcMob);

    if (!isSegment) return;

    // google demography
    if (consent && act) {
        (new Image).src = imgSrc;
    }

    if (mobile && act) {
        (new Image).src = imgSrcMob;
    } else if (act) {
        (new Image).src = imgSrcNew;
    }
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = 'expires=' + d.toUTCString();
    document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}

function getCookie(cname) {
    var name = cname + '=',
        decodedCookie = decodeURIComponent(document.cookie),
        ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return '';
}

function getPropFromUrl(name) {
    name = name.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');
    var regexS = '[\\?&]' + name + '=([^&#]*)';
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if (results == null)
        return '';
    else
        return results[1];
}

function msg(m) {
    if (!m) return;
    m = typeof m === 'object' ?
        JSON.stringify(m) :
        typeof m === 'string' ? m : '';

    top.window.postMessage(m, '*');
}

function rdm() {
    return Math.round(Math.random() * Math.pow(100, 6) * 10);
}

function $(sel){
    return document.querySelector(sel);
}

function addLoad(f) {
    apps? 
        document.addEventListener('DOMContentLoaded', f) : 
        window.addEventListener('load', f);
}