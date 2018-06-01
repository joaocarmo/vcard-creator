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

eval("!function(t,e){ true?module.exports=e():undefined}(\"undefined\"!=typeof self?self:this,function(){return function(t){var e={};function r(i){if(e[i])return e[i].exports;var n=e[i]={i:i,l:!1,exports:{}};return t[i].call(n.exports,n,n.exports,r),n.l=!0,n.exports}return r.m=t,r.c=e,r.d=function(t,e,i){r.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:i})},r.r=function(t){\"undefined\"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:\"Module\"}),Object.defineProperty(t,\"__esModule\",{value:!0})},r.t=function(t,e){if(1&e&&(t=r(t)),8&e)return t;if(4&e&&\"object\"==typeof t&&t&&t.__esModule)return t;var i=Object.create(null);if(r.r(i),Object.defineProperty(i,\"default\",{enumerable:!0,value:t}),2&e&&\"string\"!=typeof t)for(var n in t)r.d(i,n,function(e){return t[e]}.bind(null,n));return i},r.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(e,\"a\",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p=\"\",r(r.s=0)}([function(t,e){e.vCard=class{constructor(){this.definedElements=[],this.multiplePropertiesForElementAllowed=[\"email\",\"address\",\"phoneNumber\",\"url\"],this.properties=[],this.charset=\"utf-8\",this.contentType=\"text/x-vcard\",this.fileExtension=\"vcf\"}addAddress(t=\"\",e=\"\",r=\"\",i=\"\",n=\"\",s=\"\",o=\"\",a=\"WORK;POSTAL\"){var h=t+\";\"+e+\";\"+r+\";\"+i+\";\"+n+\";\"+s+\";\"+o;return this.setProperty(\"address\",\"ADR\"+(\"\"!=a?\";\"+a:\"\")+this.getCharsetString(),h),this}addBirthday(t){return this.setProperty(\"birthday\",\"BDAY\",t),this}addCompany(t,e=\"\"){return this.setProperty(\"company\",\"ORG\"+this.getCharsetString(),t+(\"\"!=e?\";\"+e:\"\")),this}addEmail(t,e=\"\"){return this.setProperty(\"email\",\"EMAIL;INTERNET\"+(\"\"!=e?\";\"+e:\"\"),t),this}addJobtitle(t){return this.setProperty(\"jobtitle\",\"TITLE\"+this.getCharsetString(),t),this}addRole(t){return this.setProperty(\"role\",\"ROLE\"+this.getCharsetString(),t),this}addMedia(t,e,r=!0,i){return this}addName(t=\"\",e=\"\",r=\"\",i=\"\",n=\"\"){var s=[i,e,r,t,n].filter(t=>!!t),o=t+\";\"+e+\";\"+r+\";\"+i+\";\"+n;return this.setProperty(\"name\",\"N\"+this.getCharsetString(),o),this.hasProperty(\"FN\")||this.setProperty(\"fullname\",\"FN\"+this.getCharsetString(),s.join(\" \").trim()),this}addNote(t){return this.setProperty(\"note\",\"NOTE\"+this.getCharsetString(),t),this}addCategories(t){return this.setProperty(\"categories\",\"CATEGORIES\"+this.getCharsetString(),t.join(\",\").trim()),this}addPhoneNumber(t,e=\"\"){return this.setProperty(\"phoneNumber\",\"TEL\"+(\"\"!=e?\";\"+e:\"\"),t),this}addLogo(t,e=!0){return this.addMedia(\"LOGO\",t,e,\"logo\"),this}addPhoto(t,e=!0){return this.addMedia(\"PHOTO\",t,e,\"photo\"),this}addURL(t,e=\"\"){return this.setProperty(\"url\",\"URL\"+(\"\"!=e?\";\"+e:\"\"),t),this}buildVCard(){var t=new Date,e=\"\";return e+=\"BEGIN:VCARD\\r\\n\",e+=\"VERSION:3.0\\r\\n\",e+=\"REV:\"+t.toISOString()+\"\\r\\n\",this.getProperties().forEach(t=>{e+=this.fold(t.key+\":\"+this.escape(t.value)+\"\\r\\n\")}),e+=\"END:VCARD\\r\\n\"}fold(t){return t.length<=75?t:t.match(/.{1,73}/g).join(\"\\r\\n \").trim()+\"\\r\\n\"}escape(t){var e=(\"\"+t).replace(\"\\r\\n\",\"\\\\n\");return e=e.replace(\"\\n\",\"\\\\n\")}toString(){return this.getOutput()}getCharset(){return this.charset}getCharsetString(){var t=\"\";return\"utf-8\"==this.charset&&(t=\";CHARSET=\"+this.charset),t}getContentType(){return this.contentType}getFileExtension(){return this.fileExtension}getOutput(){return this.buildVCard()}getProperties(){return this.properties}hasProperty(t){return this.getProperties().forEach(e=>{if(e.key===t&&\"\"!==e.value)return!0}),!1}setCharset(t){this.charset=t}setProperty(t,e,r){if(this.multiplePropertiesForElementAllowed.indexOf(t)<0&&this.definedElements[t])throw\"This element already exists (\"+t+\")\";this.definedElements[t]=!0,this.properties.push({key:e,value:r})}}}])});\n\n//# sourceURL=webpack:///../dist/vcard-creator.js?");

/***/ }),

/***/ "./test-pre-build.js":
/*!***************************!*\
  !*** ./test-pre-build.js ***!
  \***************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var ___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ */ \"../dist/vcard-creator.js\");\n/* harmony import */ var ___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(___WEBPACK_IMPORTED_MODULE_0__);\n\n\n// define vcard\nvar vcard = new ___WEBPACK_IMPORTED_MODULE_0__[\"vCard\"]()\n\n// define variables\nvar lastname = 'Desloovere'\nvar firstname = 'Jeroen'\nvar additional = ''\nvar prefix = ''\nvar suffix = ''\n\n// add personal data\nvcard.addName(lastname, firstname, additional, prefix, suffix)\n\n// add work data\nvcard.addCompany('Siesqo')\nvcard.addJobtitle('Web Developer')\nvcard.addRole('Data Protection Officer')\nvcard.addEmail('info@jeroendesloovere.be')\nvcard.addPhoneNumber(1234121212, 'PREF;WORK')\nvcard.addPhoneNumber(123456789, 'WORK')\nvcard.addAddress('name', 'extended', 'street', 'worktown', 'state', 'workpostcode', 'Belgium')\nvcard.addURL('http://www.jeroendesloovere.be')\n\nvar output = vcard.toString()\n\nconsole.log(output)\n\ndocument.getElementById('vcard').innerHTML = output\n\n\n//# sourceURL=webpack:///./test-pre-build.js?");

/***/ })

/******/ });