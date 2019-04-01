/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./test-pre-build.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "../dist/vcard-creator.js":
/*!********************************!*\
  !*** ../dist/vcard-creator.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("!function(e,t){ true?module.exports=t():undefined}(\"undefined\"!=typeof self?self:this,function(){return function(e){var t={};function r(n){if(t[n])return t[n].exports;var i=t[n]={i:n,l:!1,exports:{}};return e[n].call(i.exports,i,i.exports,r),i.l=!0,i.exports}return r.m=e,r.c=t,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},r.r=function(e){\"undefined\"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:\"Module\"}),Object.defineProperty(e,\"__esModule\",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&\"object\"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,\"default\",{enumerable:!0,value:e}),2&t&&\"string\"!=typeof e)for(var i in e)r.d(n,i,function(t){return e[t]}.bind(null,i));return n},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,\"a\",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p=\"\",r(r.s=0)}([function(e,t,r){\"use strict\";function n(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,\"value\"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}r.r(t),r.d(t,\"default\",function(){return i});var i=function(){function e(){!function(e,t){if(!(e instanceof t))throw new TypeError(\"Cannot call a class as a function\")}(this,e),this.definedElements=[],this.multiplePropertiesForElementAllowed=[\"email\",\"address\",\"phoneNumber\",\"url\"],this.properties=[],this.charset=\"utf-8\",this.contentType=\"text/x-vcard\",this.fileExtension=\"vcf\"}var t,r,i;return t=e,(r=[{key:\"addAddress\",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:\"\",t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:\"\",r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:\"\",n=arguments.length>3&&void 0!==arguments[3]?arguments[3]:\"\",i=arguments.length>4&&void 0!==arguments[4]?arguments[4]:\"\",o=arguments.length>5&&void 0!==arguments[5]?arguments[5]:\"\",u=arguments.length>6&&void 0!==arguments[6]?arguments[6]:\"\",a=arguments.length>7&&void 0!==arguments[7]?arguments[7]:\"WORK;POSTAL\",s=e+\";\"+t+\";\"+r+\";\"+n+\";\"+i+\";\"+o+\";\"+u;return this.setProperty(\"address\",\"ADR\"+(\"\"!=a?\";\"+a:\"\")+this.getCharsetString(),s),this}},{key:\"addBirthday\",value:function(e){return this.setProperty(\"birthday\",\"BDAY\",e),this}},{key:\"addCompany\",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:\"\";return this.setProperty(\"company\",\"ORG\"+this.getCharsetString(),e+(\"\"!=t?\";\"+t:\"\")),this}},{key:\"addEmail\",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:\"\";return this.setProperty(\"email\",\"EMAIL;INTERNET\"+(\"\"!=t?\";\"+t:\"\"),e),this}},{key:\"addJobtitle\",value:function(e){return this.setProperty(\"jobtitle\",\"TITLE\"+this.getCharsetString(),e),this}},{key:\"addRole\",value:function(e){return this.setProperty(\"role\",\"ROLE\"+this.getCharsetString(),e),this}},{key:\"addMedia\",value:function(e,t){!(arguments.length>2&&void 0!==arguments[2])||arguments[2],arguments.length>3&&arguments[3];return this}},{key:\"addName\",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:\"\",t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:\"\",r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:\"\",n=arguments.length>3&&void 0!==arguments[3]?arguments[3]:\"\",i=arguments.length>4&&void 0!==arguments[4]?arguments[4]:\"\",o=[n,t,r,e,i].filter(function(e){return!!e}),u=e+\";\"+t+\";\"+r+\";\"+n+\";\"+i;return this.setProperty(\"name\",\"N\"+this.getCharsetString(),u),this.hasProperty(\"FN\")||this.setProperty(\"fullname\",\"FN\"+this.getCharsetString(),o.join(\" \").trim()),this}},{key:\"addNote\",value:function(e){return this.setProperty(\"note\",\"NOTE\"+this.getCharsetString(),e),this}},{key:\"addCategories\",value:function(e){return this.setProperty(\"categories\",\"CATEGORIES\"+this.getCharsetString(),e.join(\",\").trim()),this}},{key:\"addPhoneNumber\",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:\"\";return this.setProperty(\"phoneNumber\",\"TEL\"+(\"\"!=t?\";\"+t:\"\"),e),this}},{key:\"addLogo\",value:function(e){var t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];return this.addMedia(\"LOGO\",e,t,\"logo\"),this}},{key:\"addPhoto\",value:function(e){var t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];return this.addMedia(\"PHOTO\",e,t,\"photo\"),this}},{key:\"addURL\",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:\"\";return this.setProperty(\"url\",\"URL\"+(\"\"!=t?\";\"+t:\"\"),e),this}},{key:\"buildVCard\",value:function(){var e=this,t=new Date,r=\"\";return r+=\"BEGIN:VCARD\\r\\n\",r+=\"VERSION:3.0\\r\\n\",r+=\"REV:\"+t.toISOString()+\"\\r\\n\",this.getProperties().forEach(function(t){r+=e.fold(t.key+\":\"+e.escape(t.value)+\"\\r\\n\")}),r+=\"END:VCARD\\r\\n\"}},{key:\"fold\",value:function(e){return e.length<=75?e:e.match(/.{1,73}/g).join(\"\\r\\n \").trim()+\"\\r\\n\"}},{key:\"escape\",value:function(e){var t=(\"\"+e).replace(\"\\r\\n\",\"\\\\n\");return t=t.replace(\"\\n\",\"\\\\n\")}},{key:\"toString\",value:function(){return this.getOutput()}},{key:\"getCharset\",value:function(){return this.charset}},{key:\"getCharsetString\",value:function(){var e=\"\";return\"utf-8\"==this.charset&&(e=\";CHARSET=\"+this.charset),e}},{key:\"getContentType\",value:function(){return this.contentType}},{key:\"getFileExtension\",value:function(){return this.fileExtension}},{key:\"getOutput\",value:function(){return this.buildVCard()}},{key:\"getProperties\",value:function(){return this.properties}},{key:\"hasProperty\",value:function(e){return this.getProperties().forEach(function(t){if(t.key===e&&\"\"!==t.value)return!0}),!1}},{key:\"setCharset\",value:function(e){this.charset=e}},{key:\"setProperty\",value:function(e,t,r){if(this.multiplePropertiesForElementAllowed.indexOf(e)<0&&this.definedElements[e])throw\"This element already exists (\"+e+\")\";this.definedElements[e]=!0,this.properties.push({key:t,value:r})}}])&&n(t.prototype,r),i&&n(t,i),e}()}])});\n\n//# sourceURL=webpack:///../dist/vcard-creator.js?");

/***/ }),

/***/ "./test-pre-build.js":
/*!***************************!*\
  !*** ./test-pre-build.js ***!
  \***************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var ___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ */ \"../dist/vcard-creator.js\");\n/* harmony import */ var ___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(___WEBPACK_IMPORTED_MODULE_0__);\n\n\n// define vcard\nvar vcard = new ___WEBPACK_IMPORTED_MODULE_0___default.a()\n\n// define variables\nvar lastname = 'Desloovere'\nvar firstname = 'Jeroen'\nvar additional = ''\nvar prefix = ''\nvar suffix = ''\n\n// add personal data\nvcard.addName(lastname, firstname, additional, prefix, suffix)\n\n// add work data\nvcard.addCompany('Siesqo')\nvcard.addJobtitle('Web Developer')\nvcard.addRole('Data Protection Officer')\nvcard.addEmail('info@jeroendesloovere.be')\nvcard.addPhoneNumber(1234121212, 'PREF;WORK')\nvcard.addPhoneNumber(123456789, 'WORK')\nvcard.addAddress('name', 'extended', 'street', 'worktown', 'state', 'workpostcode', 'Belgium')\nvcard.addURL('http://www.jeroendesloovere.be')\n\nvar output = vcard.toString()\n\nconsole.log(output)\n\ndocument.getElementById('vcard').innerHTML = output\n\n\n//# sourceURL=webpack:///./test-pre-build.js?");

/***/ })

/******/ });