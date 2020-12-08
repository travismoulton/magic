/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/axios/index.js":
/*!*************************************!*\
  !*** ./node_modules/axios/index.js ***!
  \*************************************/
/*! dynamic exports */
/*! export __esModule [maybe provided (runtime-defined)] [no usage info] [provision prevents renaming (no use info)] -> ./node_modules/axios/lib/axios.js .__esModule */
/*! other exports [maybe provided (runtime-defined)] [no usage info] -> ./node_modules/axios/lib/axios.js */
/*! runtime requirements: module, __webpack_require__ */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./lib/axios */ "./node_modules/axios/lib/axios.js");

/***/ }),

/***/ "./node_modules/axios/lib/adapters/xhr.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/adapters/xhr.js ***!
  \************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 12:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var settle = __webpack_require__(/*! ./../core/settle */ "./node_modules/axios/lib/core/settle.js");
var cookies = __webpack_require__(/*! ./../helpers/cookies */ "./node_modules/axios/lib/helpers/cookies.js");
var buildURL = __webpack_require__(/*! ./../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var buildFullPath = __webpack_require__(/*! ../core/buildFullPath */ "./node_modules/axios/lib/core/buildFullPath.js");
var parseHeaders = __webpack_require__(/*! ./../helpers/parseHeaders */ "./node_modules/axios/lib/helpers/parseHeaders.js");
var isURLSameOrigin = __webpack_require__(/*! ./../helpers/isURLSameOrigin */ "./node_modules/axios/lib/helpers/isURLSameOrigin.js");
var createError = __webpack_require__(/*! ../core/createError */ "./node_modules/axios/lib/core/createError.js");

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    // Listen for ready state
    request.onreadystatechange = function handleLoad() {
      if (!request || request.readyState !== 4) {
        return;
      }

      // The request errored out and we didn't get a response, this will be
      // handled by onerror instead
      // With one exception: request that using file: protocol, most browsers
      // will return status as 0 even though it's a successful request
      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
        return;
      }

      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    };

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (config.responseType) {
      try {
        request.responseType = config.responseType;
      } catch (e) {
        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
        if (config.responseType !== 'json') {
          throw e;
        }
      }
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (!requestData) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/axios.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/axios.js ***!
  \*****************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 50:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");
var Axios = __webpack_require__(/*! ./core/Axios */ "./node_modules/axios/lib/core/Axios.js");
var mergeConfig = __webpack_require__(/*! ./core/mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");
var defaults = __webpack_require__(/*! ./defaults */ "./node_modules/axios/lib/defaults.js");

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__(/*! ./cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");
axios.CancelToken = __webpack_require__(/*! ./cancel/CancelToken */ "./node_modules/axios/lib/cancel/CancelToken.js");
axios.isCancel = __webpack_require__(/*! ./cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(/*! ./helpers/spread */ "./node_modules/axios/lib/helpers/spread.js");

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/Cancel.js":
/*!*************************************************!*\
  !*** ./node_modules/axios/lib/cancel/Cancel.js ***!
  \*************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 19:0-14 */
/***/ ((module) => {

"use strict";


/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/CancelToken.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/cancel/CancelToken.js ***!
  \******************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 57:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Cancel = __webpack_require__(/*! ./Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/isCancel.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/cancel/isCancel.js ***!
  \***************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 3:0-14 */
/***/ ((module) => {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/Axios.js":
/*!**********************************************!*\
  !*** ./node_modules/axios/lib/core/Axios.js ***!
  \**********************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 95:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var buildURL = __webpack_require__(/*! ../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var InterceptorManager = __webpack_require__(/*! ./InterceptorManager */ "./node_modules/axios/lib/core/InterceptorManager.js");
var dispatchRequest = __webpack_require__(/*! ./dispatchRequest */ "./node_modules/axios/lib/core/dispatchRequest.js");
var mergeConfig = __webpack_require__(/*! ./mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  // Hook up interceptors middleware
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;


/***/ }),

/***/ "./node_modules/axios/lib/core/InterceptorManager.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/core/InterceptorManager.js ***!
  \***********************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 52:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),

/***/ "./node_modules/axios/lib/core/buildFullPath.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/buildFullPath.js ***!
  \******************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 15:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isAbsoluteURL = __webpack_require__(/*! ../helpers/isAbsoluteURL */ "./node_modules/axios/lib/helpers/isAbsoluteURL.js");
var combineURLs = __webpack_require__(/*! ../helpers/combineURLs */ "./node_modules/axios/lib/helpers/combineURLs.js");

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/createError.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/createError.js ***!
  \****************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 15:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var enhanceError = __webpack_require__(/*! ./enhanceError */ "./node_modules/axios/lib/core/enhanceError.js");

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/dispatchRequest.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/core/dispatchRequest.js ***!
  \********************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 23:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var transformData = __webpack_require__(/*! ./transformData */ "./node_modules/axios/lib/core/transformData.js");
var isCancel = __webpack_require__(/*! ../cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");
var defaults = __webpack_require__(/*! ../defaults */ "./node_modules/axios/lib/defaults.js");

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/core/enhanceError.js":
/*!*****************************************************!*\
  !*** ./node_modules/axios/lib/core/enhanceError.js ***!
  \*****************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 13:0-14 */
/***/ ((module) => {

"use strict";


/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code
    };
  };
  return error;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/mergeConfig.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/mergeConfig.js ***!
  \****************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 13:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  var valueFromConfig2Keys = ['url', 'method', 'data'];
  var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
  var defaultToConfig2Keys = [
    'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
    'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
    'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',
    'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',
    'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'
  ];
  var directMergeKeys = ['validateStatus'];

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  }

  utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    }
  });

  utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);

  utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  utils.forEach(directMergeKeys, function merge(prop) {
    if (prop in config2) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  var axiosKeys = valueFromConfig2Keys
    .concat(mergeDeepPropertiesKeys)
    .concat(defaultToConfig2Keys)
    .concat(directMergeKeys);

  var otherKeys = Object
    .keys(config1)
    .concat(Object.keys(config2))
    .filter(function filterAxiosKeys(key) {
      return axiosKeys.indexOf(key) === -1;
    });

  utils.forEach(otherKeys, mergeDeepProperties);

  return config;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/settle.js":
/*!***********************************************!*\
  !*** ./node_modules/axios/lib/core/settle.js ***!
  \***********************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 12:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var createError = __webpack_require__(/*! ./createError */ "./node_modules/axios/lib/core/createError.js");

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};


/***/ }),

/***/ "./node_modules/axios/lib/core/transformData.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/transformData.js ***!
  \******************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 13:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers);
  });

  return data;
};


/***/ }),

/***/ "./node_modules/axios/lib/defaults.js":
/*!********************************************!*\
  !*** ./node_modules/axios/lib/defaults.js ***!
  \********************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 98:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var normalizeHeaderName = __webpack_require__(/*! ./helpers/normalizeHeaderName */ "./node_modules/axios/lib/helpers/normalizeHeaderName.js");

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(/*! ./adapters/xhr */ "./node_modules/axios/lib/adapters/xhr.js");
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = __webpack_require__(/*! ./adapters/http */ "./node_modules/axios/lib/adapters/xhr.js");
  }
  return adapter;
}

var defaults = {
  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');
    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    /*eslint no-param-reassign:0*/
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;


/***/ }),

/***/ "./node_modules/axios/lib/helpers/bind.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/helpers/bind.js ***!
  \************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 3:0-14 */
/***/ ((module) => {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/buildURL.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/helpers/buildURL.js ***!
  \****************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 22:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/combineURLs.js":
/*!*******************************************************!*\
  !*** ./node_modules/axios/lib/helpers/combineURLs.js ***!
  \*******************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 10:0-14 */
/***/ ((module) => {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/cookies.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/helpers/cookies.js ***!
  \***************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 5:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAbsoluteURL.js":
/*!*********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAbsoluteURL.js ***!
  \*********************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 9:0-14 */
/***/ ((module) => {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isURLSameOrigin.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isURLSameOrigin.js ***!
  \***********************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 5:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/normalizeHeaderName.js":
/*!***************************************************************!*\
  !*** ./node_modules/axios/lib/helpers/normalizeHeaderName.js ***!
  \***************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 5:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/parseHeaders.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/parseHeaders.js ***!
  \********************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 27:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/spread.js":
/*!**************************************************!*\
  !*** ./node_modules/axios/lib/helpers/spread.js ***!
  \**************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 23:0-14 */
/***/ ((module) => {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/utils.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/utils.js ***!
  \*****************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 328:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");

/*global toString:true*/

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM
};


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/css/style.css":
/*!*****************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/css/style.css ***!
  \*****************************************************************/
/*! namespace exports */
/*! export default [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__, __webpack_require__.n, __webpack_exports__, __webpack_require__.r, module.id, __webpack_require__.d, __webpack_require__.*, module */
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/cssWithMappingToString.js */ "./node_modules/css-loader/dist/runtime/cssWithMappingToString.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/getUrl.js */ "./node_modules/css-loader/dist/runtime/getUrl.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _img_login_bg_jpg__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../img/login-bg.jpg */ "./src/img/login-bg.jpg");
// Imports




var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default()));
var ___CSS_LOADER_URL_REPLACEMENT_0___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_img_login_bg_jpg__WEBPACK_IMPORTED_MODULE_3__.default);
// Module
___CSS_LOADER_EXPORT___.push([module.id, "*,\n*::after,\n*::before {\n  margin: 0;\n  padding: 0;\n  box-sizing: inherit; }\n\nhtml {\n  font-size: 62.5%; }\n\nbody {\n  box-sizing: border-box;\n  overflow-x: hidden;\n  font-size: 1.6rem;\n  background-size: cover;\n  background-repeat: no-repeat;\n  height: 127.5rem;\n  font-family: 'Lato', sans-serif; }\n\n[hidden] {\n  display: none !important; }\n\n.heading-tertiary {\n  font-size: 2.4rem;\n  text-transform: uppercase; }\n  .heading-tertiary--white {\n    color: #fff; }\n\n.mb-10 {\n  margin-bottom: 1rem; }\n\n.mb-20 {\n  margin-bottom: 2rem; }\n\n.mt-50 {\n  margin-top: 5rem; }\n\n.btn, .btn:link, .btn:visited {\n  padding: .75rem 2rem;\n  border-radius: .5rem;\n  background-color: #f2f2f2;\n  font-weight: 400;\n  display: inline-block; }\n\n.btn:active, .btn:focus {\n  outline: none;\n  transform: translateY(-1px);\n  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.2); }\n\n.login-form__group:not(:last-child) {\n  margin-bottom: 2.5rem; }\n\n.login-form__label {\n  margin-right: .7rem;\n  color: #fff;\n  font-size: 1.8rem;\n  font-weight: 400; }\n\n.login-form__input {\n  background-color: #fff;\n  padding: .5rem 0;\n  border: none; }\n\n.login-form__btn-wrapper {\n  display: flex;\n  justify-content: center; }\n\n.login__register-text {\n  margin-top: 1.5rem;\n  color: #fff; }\n\n.login__register-link {\n  text-decoration: none;\n  color: #fff;\n  transition: all .2s; }\n  .login__register-link:hover {\n    color: #ff8000;\n    text-decoration: underline; }\n\n.nav {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 2rem 6rem;\n  background-color: #fff;\n  border-bottom: 1px solid #000; }\n  .nav__item {\n    list-style: none; }\n    .nav__item--search {\n      flex: 0 0 25%; }\n  .nav__link {\n    text-decoration: none;\n    color: #000;\n    transition: all .2s; }\n    .nav__link:hover {\n      margin-bottom: 2px;\n      color: #ffa64d;\n      border-bottom: 1px solid #ffa64d; }\n    .nav__link--home:hover .nav__icon-path--home {\n      fill: #ff8000; }\n  .nav__search {\n    display: flex;\n    justify-content: center;\n    align-items: center; }\n    .nav__search-input {\n      width: 90%;\n      border-radius: 3rem;\n      padding: 1rem 2rem;\n      border: 1px solid #bfbfbf;\n      background-color: #f2f2f2;\n      transition: width .2s; }\n      .nav__search-input:focus {\n        outline: none;\n        width: 120%; }\n    .nav__search-btn {\n      cursor: pointer; }\n  .nav__icon-sizing--home {\n    width: 3rem;\n    height: 3rem; }\n  .nav__icon-sizing--search {\n    width: 2rem;\n    height: 2rem;\n    transform: translateX(-150%); }\n  .nav__icon-path {\n    fill: #bfbfbf; }\n\n.register-form__group {\n  display: flex;\n  justify-content: space-between;\n  align-items: center; }\n  .register-form__group:not(:last-child) {\n    margin-bottom: 3rem; }\n\n.register-form__label {\n  margin-right: 4rem;\n  color: #fff;\n  font-size: 1.8rem;\n  font-weight: 400; }\n\n.register-form__input {\n  background-color: #f2f2f2;\n  padding: .5rem 0;\n  border: none; }\n\n.register-form__btn-wrapper {\n  display: flex;\n  justify-content: center; }\n\n.register__login-text {\n  margin-top: 1.5rem;\n  color: #fff; }\n\n.register__login-link {\n  text-decoration: none;\n  color: #fff;\n  transition: all .2s; }\n  .register__login-link:hover {\n    color: #ff8000;\n    text-decoration: underline; }\n\n.error {\n  margin-top: 2rem;\n  text-align: center;\n  background-color: #ff8080;\n  border-radius: 10px;\n  padding: 2rem;\n  font-size: 2rem;\n  grid-column: center-start / center-end;\n  font-weight: 700; }\n\n.search-form {\n  padding: 2rem 25rem; }\n  .search-form__group {\n    width: 75%;\n    display: flex;\n    margin-bottom: 3rem;\n    border-bottom: 1px solid #000;\n    align-items: flex-start;\n    padding: .5rem 4rem .5rem 0; }\n  .search-form__label {\n    flex: 0 0 20%;\n    display: flex;\n    align-items: flex-start;\n    margin-top: .7rem; }\n  .search-form__group-input-wrapper {\n    flex: 0 0 80%; }\n  .search-form__tip {\n    font-size: 1rem;\n    line-height: 1.4;\n    width: 70%; }\n  .search-form__input-text {\n    width: 40rem;\n    height: 4rem;\n    margin-bottom: 1rem;\n    padding: 1rem;\n    border: solid 1px #bfbfbf;\n    border-radius: 5px; }\n    .search-form__input-text:focus {\n      border: solid 1px #000; }\n  .search-form__group--checkbox {\n    display: flex;\n    margin-bottom: 1rem; }\n  .search-form__label--checkbox {\n    margin-right: 1rem; }\n  .search-form__input-checkbox {\n    width: 2.25rem;\n    height: 2.25rem;\n    margin-right: .8rem; }\n  .search-form__checkbox-wrapper {\n    display: flex;\n    align-items: center; }\n  .search-form__select-menu {\n    margin-bottom: 1rem; }\n  .search-form__svg-size {\n    height: 2rem;\n    width: 2rem;\n    margin-right: 1rem; }\n  .search-form__submit {\n    border-radius: 3px;\n    padding: .7rem;\n    border: 1px solid #b300b3; }\n  .search-form__dropdown-span {\n    display: flex;\n    flex-direction: column; }\n  .search-form__selected-types, .search-form__selected-sets {\n    display: flex;\n    flex-direction: column;\n    list-style: none;\n    margin-bottom: .3rem; }\n  .search-form__selected-types-list-item, .search-form__selected-sets-list-item {\n    display: flex;\n    margin-bottom: .7rem; }\n  .search-form__selected-types-remove-btn, .search-form__selected-sets-remove-btn {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    cursor: pointer;\n    height: 2rem;\n    width: 2rem;\n    font-size: 1.3rem;\n    background-color: #f2f2f2;\n    margin-right: .7rem; }\n  .search-form__selected-types-toggler {\n    height: 2rem;\n    width: 2.75rem;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    cursor: pointer;\n    font-size: 1.3rem;\n    margin-right: .7rem; }\n    .search-form__selected-types-toggler--is {\n      background-color: #47d147; }\n    .search-form__selected-types-toggler--not {\n      background-color: #ff0000; }\n  .search-form__dropdown {\n    position: absolute;\n    max-height: 28rem;\n    background-color: #fff;\n    z-index: 2;\n    top: 100%;\n    width: 40rem;\n    margin-top: -1rem;\n    overflow-y: auto;\n    border: 1px solid #000; }\n    .search-form__dropdown-list {\n      list-style: none; }\n      .search-form__dropdown-list-category {\n        padding: .5rem; }\n      .search-form__dropdown-list-option {\n        padding: .3rem 2rem;\n        display: flex;\n        align-items: center; }\n        .search-form__dropdown-list-option:hover {\n          cursor: pointer; }\n        .search-form__dropdown-list-option--highlighted {\n          background-color: #ccd8ff; }\n        .search-form__dropdown-list-option span {\n          text-transform: uppercase;\n          margin-left: 1rem; }\n      .search-form__dropdown-list-img {\n        width: 2rem;\n        height: 2rem;\n        margin-right: .7rem; }\n\n.dropdown-wrapper {\n  position: relative; }\n\n.api-results-display__nav {\n  background-color: #99b1ff;\n  width: 100%;\n  display: flex;\n  justify-content: space-between;\n  padding: 0 10%;\n  margin-bottom: .1rem; }\n  .api-results-display__nav-select {\n    color: #b300b3;\n    margin-right: 1rem; }\n  .api-results-display__nav-label {\n    color: #b300b3; }\n  .api-results-display__nav-right {\n    display: flex;\n    align-items: center; }\n  .api-results-display__nav-pagination-container {\n    display: flex;\n    align-items: center;\n    background-color: #ccd8ff;\n    cursor: pointer; }\n    .api-results-display__nav-pagination-container:not(:last-child) {\n      margin-right: 3rem; }\n    .api-results-display__nav-pagination-container--disabled {\n      cursor: not-allowed;\n      background-color: rgba(204, 216, 255, 0.4); }\n  .api-results-display__nav-svg-size {\n    height: 2rem;\n    width: 2rem; }\n\n.api-results-display__display-bar {\n  width: 100%;\n  border-bottom: 1px solid #bfbfbf;\n  padding-left: 10%;\n  margin-bottom: 2rem; }\n\n.card-checklist {\n  width: 80%;\n  justify-self: center; }\n  .card-checklist__row {\n    display: grid;\n    grid-template-columns: repeat(7, 1fr); }\n    .card-checklist__row--header {\n      border-bottom: 1px solid #000; }\n    .card-checklist__row--grey {\n      background-color: #f2f2f2; }\n  .card-checklist__data {\n    display: flex;\n    flex-wrap: nowrap;\n    justify-content: center;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    font-size: 1.4rem; }\n    .card-checklist__data--set {\n      text-transform: uppercase; }\n    .card-checklist__data--rarity {\n      text-transform: capitalize; }\n  .card-checklist__data-link {\n    padding: 1rem 0;\n    display: flex;\n    flex-wrap: nowrap;\n    align-items: center;\n    text-decoration: none;\n    width: 100%;\n    color: #000;\n    white-space: nowrap; }\n    .card-checklist__data-link--start {\n      justify-content: flex-start; }\n    .card-checklist__data-link--center {\n      justify-content: center; }\n\n.tooltip {\n  position: absolute;\n  z-index: 5;\n  width: 24rem;\n  height: 34rem; }\n  .tooltip__img {\n    width: 100%;\n    height: 100%; }\n\n.image-grid {\n  padding: 10rem 15rem;\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(25rem, 1fr));\n  grid-column-gap: 2rem;\n  grid-row-gap: 1rem; }\n  .image-grid__outer-div {\n    position: relative; }\n  .image-grid__inner-div {\n    perspective: 150rem;\n    height: 34rem;\n    width: 24rem; }\n  .image-grid__double {\n    height: 34rem;\n    width: 24rem;\n    position: absolute;\n    top: 0;\n    left: 0;\n    backface-visibility: hidden;\n    overflow: hidden;\n    transition: all .8s ease; }\n    .image-grid__double--back {\n      transform: rotateY(180deg); }\n  .image-grid__double-btn {\n    position: absolute;\n    top: 50%;\n    right: 15%;\n    width: 4rem;\n    height: 4rem;\n    border-radius: 50%;\n    background-color: rgba(255, 255, 255, 0.4); }\n  .image-grid__container {\n    width: 24rem;\n    height: 34rem; }\n  .image-grid__image {\n    width: 100%;\n    height: 100%; }\n\n.card {\n  display: flex;\n  margin-top: 3rem; }\n  .card__img-container {\n    margin-right: 10rem; }\n  .card__img {\n    width: 33rem;\n    height: 46rem; }\n  .card__img-left {\n    margin-right: 10rem;\n    width: 33rem;\n    display: flex;\n    flex-direction: column; }\n  .card__img-btn {\n    justify-self: flex-end;\n    align-self: flex-end;\n    margin-top: auto; }\n  .card__img-double-area {\n    position: relative; }\n  .card__img-double-sided {\n    perspective: 150rem;\n    height: 46rem; }\n  .card__img-double {\n    width: 33rem;\n    height: 46rem;\n    position: absolute;\n    top: 0;\n    left: 0;\n    backface-visibility: hidden;\n    overflow: hidden; }\n    .card__img-double--back {\n      transform: rotateY(180deg); }\n  .card__text {\n    background-color: #f4f4d7;\n    width: 34rem;\n    display: flex;\n    flex-direction: column;\n    padding: 1rem;\n    margin-right: 3rem; }\n    .card__text-flex {\n      margin-bottom: 1rem;\n      border-bottom: 1px solid #bfbfbf; }\n    .card__text-title {\n      display: flex;\n      align-items: center; }\n      .card__text-title-h3 {\n        font-size: 1.8rem;\n        font-weight: 400;\n        margin-right: 1rem; }\n    .card__text-color-indicator {\n      width: 1.3rem;\n      height: 1.3rem;\n      border: 1px solid #333;\n      border-radius: 50%;\n      box-shadow: 0px 0px 0px 2px rgba(0, 0, 0, 0.2);\n      margin-right: .7rem;\n      display: inline-block; }\n      .card__text-color-indicator--U {\n        background-color: rgba(128, 128, 255, 0.7); }\n      .card__text-color-indicator--B {\n        background-color: rgba(0, 0, 0, 0.7); }\n      .card__text-color-indicator--R {\n        background-color: rgba(255, 77, 77, 0.7); }\n      .card__text-color-indicator--W {\n        background-color: rgba(255, 255, 255, 0.7); }\n      .card__text-color-indicator--G {\n        background-color: rgba(0, 255, 0, 0.7); }\n    .card__text-oracle-p {\n      margin-bottom: 1rem;\n      font-size: 1.3rem; }\n    .card__text-oracle-flavor {\n      font-size: 1.3rem;\n      font-style: italic; }\n    .card__text-illustrator {\n      font-size: 1.2rem;\n      font-style: italic; }\n    .card__text-legal {\n      display: flex;\n      flex-direction: row;\n      justify-content: space-between; }\n      .card__text-legal-half {\n        display: flex;\n        flex-direction: column; }\n      .card__text-legal-span-container {\n        display: flex;\n        align-items: center; }\n        .card__text-legal-span-container:not(:last-child) {\n          margin-bottom: .5rem; }\n      .card__text-legal-span-box {\n        width: 6rem;\n        height: 2.5rem;\n        border: 1px solid #000;\n        margin-right: .3rem;\n        font-size: 1rem;\n        text-transform: uppercase;\n        display: flex;\n        justify-content: center;\n        align-items: center; }\n        .card__text-legal-span-box--not_legal {\n          background-color: #ff0000; }\n        .card__text-legal-span-box--legal {\n          background-color: #47d147; }\n  .card__set {\n    display: flex;\n    flex-direction: column; }\n    .card__set-banner {\n      display: flex;\n      border: 1px solid #bfbfbf;\n      width: 40rem;\n      background-color: #000;\n      color: #fff; }\n      .card__set-banner-svg-container {\n        margin-right: 1rem; }\n      .card__set-banner-svg {\n        width: 2.4rem;\n        height: 2.4rem;\n        filter: invert(100%); }\n    .card__set-details {\n      display: flex;\n      flex-direction: column; }\n    .card__set-header-name {\n      font-size: 1.7remrem; }\n    .card__set-header-code {\n      text-transform: uppercase; }\n    .card__set-prints-header {\n      display: flex;\n      justify-content: space-between;\n      background-color: #000;\n      color: #fff;\n      font-size: 1.3rem;\n      text-transform: uppercase;\n      border: 1px solid #bfbfbf;\n      padding: .3rem .7rem; }\n    .card__set-prints-svg-container {\n      height: 1.8rem;\n      width: 1.8rem;\n      border: 1px solid #bfbfbf;\n      display: flex;\n      justify-content: center;\n      align-items: center;\n      border-radius: 100%; }\n    .card__set-prints-svg--common {\n      fill: #000; }\n    .card__set-prints-svg--uncommon {\n      fill: #e6e6e6; }\n    .card__set-prints-svg--rare {\n      fill: #e6c300; }\n    .card__set-prints-svg--mythic {\n      fill: #ff0000; }\n    .card__set-prints-list {\n      list-style: none; }\n      .card__set-prints-list-link:link, .card__set-prints-list-link:visited {\n        text-decoration: none;\n        color: #000; }\n      .card__set-prints-list-item {\n        display: flex;\n        justify-content: space-between;\n        cursor: pointer; }\n        .card__set-prints-list-item:hover {\n          background-color: #f2f2f2; }\n      .card__set-prints-list-item-name-wrapper {\n        display: flex;\n        align-items: center;\n        margin-left: -1rem; }\n      .card__set-prints-list-item-set-name {\n        margin-left: .5rem; }\n      .card__set-prints-list-item-price {\n        margin-right: .7rem; }\n\n.card-page {\n  display: flex;\n  flex-direction: column;\n  grid-column: center-start / center-end; }\n\n.add-to-inv {\n  margin-top: 3rem;\n  width: 50%; }\n  .add-to-inv__form {\n    display: flex;\n    flex-direction: column; }\n    .add-to-inv__form-group {\n      display: flex;\n      align-content: center;\n      margin-bottom: 3rem; }\n    .add-to-inv__form-label {\n      margin-right: .3rem; }\n\n.no-results {\n  justify-self: center; }\n\n.container {\n  display: grid;\n  grid-template-columns: [full-start] minmax(6rem, 1fr) [center-start] repeat(8, [col-start] minmax(min-content, 14rem) [col-end]) [center-end] minmax(6rem, 1fr) [full-end]; }\n\n.login,\n.register {\n  margin-top: 5rem;\n  grid-column: center-start / center-end;\n  background-image: linear-gradient(to right bottom, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  height: 75vh;\n  background-size: cover;\n  background-position: center; }\n\n.search {\n  grid-column: full-start / full-end;\n  background-color: #fff; }\n\n.api-results-display {\n  grid-column: full-start / full-end;\n  background-color: #fff;\n  display: grid; }\n", "",{"version":3,"sources":["webpack://src/css/style.css"],"names":[],"mappings":"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","sourcesContent":["*,\n*::after,\n*::before {\n  margin: 0;\n  padding: 0;\n  box-sizing: inherit; }\n\nhtml {\n  font-size: 62.5%; }\n\nbody {\n  box-sizing: border-box;\n  overflow-x: hidden;\n  font-size: 1.6rem;\n  background-size: cover;\n  background-repeat: no-repeat;\n  height: 127.5rem;\n  font-family: 'Lato', sans-serif; }\n\n[hidden] {\n  display: none !important; }\n\n.heading-tertiary {\n  font-size: 2.4rem;\n  text-transform: uppercase; }\n  .heading-tertiary--white {\n    color: #fff; }\n\n.mb-10 {\n  margin-bottom: 1rem; }\n\n.mb-20 {\n  margin-bottom: 2rem; }\n\n.mt-50 {\n  margin-top: 5rem; }\n\n.btn, .btn:link, .btn:visited {\n  padding: .75rem 2rem;\n  border-radius: .5rem;\n  background-color: #f2f2f2;\n  font-weight: 400;\n  display: inline-block; }\n\n.btn:active, .btn:focus {\n  outline: none;\n  transform: translateY(-1px);\n  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.2); }\n\n.login-form__group:not(:last-child) {\n  margin-bottom: 2.5rem; }\n\n.login-form__label {\n  margin-right: .7rem;\n  color: #fff;\n  font-size: 1.8rem;\n  font-weight: 400; }\n\n.login-form__input {\n  background-color: #fff;\n  padding: .5rem 0;\n  border: none; }\n\n.login-form__btn-wrapper {\n  display: flex;\n  justify-content: center; }\n\n.login__register-text {\n  margin-top: 1.5rem;\n  color: #fff; }\n\n.login__register-link {\n  text-decoration: none;\n  color: #fff;\n  transition: all .2s; }\n  .login__register-link:hover {\n    color: #ff8000;\n    text-decoration: underline; }\n\n.nav {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 2rem 6rem;\n  background-color: #fff;\n  border-bottom: 1px solid #000; }\n  .nav__item {\n    list-style: none; }\n    .nav__item--search {\n      flex: 0 0 25%; }\n  .nav__link {\n    text-decoration: none;\n    color: #000;\n    transition: all .2s; }\n    .nav__link:hover {\n      margin-bottom: 2px;\n      color: #ffa64d;\n      border-bottom: 1px solid #ffa64d; }\n    .nav__link--home:hover .nav__icon-path--home {\n      fill: #ff8000; }\n  .nav__search {\n    display: flex;\n    justify-content: center;\n    align-items: center; }\n    .nav__search-input {\n      width: 90%;\n      border-radius: 3rem;\n      padding: 1rem 2rem;\n      border: 1px solid #bfbfbf;\n      background-color: #f2f2f2;\n      transition: width .2s; }\n      .nav__search-input:focus {\n        outline: none;\n        width: 120%; }\n    .nav__search-btn {\n      cursor: pointer; }\n  .nav__icon-sizing--home {\n    width: 3rem;\n    height: 3rem; }\n  .nav__icon-sizing--search {\n    width: 2rem;\n    height: 2rem;\n    transform: translateX(-150%); }\n  .nav__icon-path {\n    fill: #bfbfbf; }\n\n.register-form__group {\n  display: flex;\n  justify-content: space-between;\n  align-items: center; }\n  .register-form__group:not(:last-child) {\n    margin-bottom: 3rem; }\n\n.register-form__label {\n  margin-right: 4rem;\n  color: #fff;\n  font-size: 1.8rem;\n  font-weight: 400; }\n\n.register-form__input {\n  background-color: #f2f2f2;\n  padding: .5rem 0;\n  border: none; }\n\n.register-form__btn-wrapper {\n  display: flex;\n  justify-content: center; }\n\n.register__login-text {\n  margin-top: 1.5rem;\n  color: #fff; }\n\n.register__login-link {\n  text-decoration: none;\n  color: #fff;\n  transition: all .2s; }\n  .register__login-link:hover {\n    color: #ff8000;\n    text-decoration: underline; }\n\n.error {\n  margin-top: 2rem;\n  text-align: center;\n  background-color: #ff8080;\n  border-radius: 10px;\n  padding: 2rem;\n  font-size: 2rem;\n  grid-column: center-start / center-end;\n  font-weight: 700; }\n\n.search-form {\n  padding: 2rem 25rem; }\n  .search-form__group {\n    width: 75%;\n    display: flex;\n    margin-bottom: 3rem;\n    border-bottom: 1px solid #000;\n    align-items: flex-start;\n    padding: .5rem 4rem .5rem 0; }\n  .search-form__label {\n    flex: 0 0 20%;\n    display: flex;\n    align-items: flex-start;\n    margin-top: .7rem; }\n  .search-form__group-input-wrapper {\n    flex: 0 0 80%; }\n  .search-form__tip {\n    font-size: 1rem;\n    line-height: 1.4;\n    width: 70%; }\n  .search-form__input-text {\n    width: 40rem;\n    height: 4rem;\n    margin-bottom: 1rem;\n    padding: 1rem;\n    border: solid 1px #bfbfbf;\n    border-radius: 5px; }\n    .search-form__input-text:focus {\n      border: solid 1px #000; }\n  .search-form__group--checkbox {\n    display: flex;\n    margin-bottom: 1rem; }\n  .search-form__label--checkbox {\n    margin-right: 1rem; }\n  .search-form__input-checkbox {\n    width: 2.25rem;\n    height: 2.25rem;\n    margin-right: .8rem; }\n  .search-form__checkbox-wrapper {\n    display: flex;\n    align-items: center; }\n  .search-form__select-menu {\n    margin-bottom: 1rem; }\n  .search-form__svg-size {\n    height: 2rem;\n    width: 2rem;\n    margin-right: 1rem; }\n  .search-form__submit {\n    border-radius: 3px;\n    padding: .7rem;\n    border: 1px solid #b300b3; }\n  .search-form__dropdown-span {\n    display: flex;\n    flex-direction: column; }\n  .search-form__selected-types, .search-form__selected-sets {\n    display: flex;\n    flex-direction: column;\n    list-style: none;\n    margin-bottom: .3rem; }\n  .search-form__selected-types-list-item, .search-form__selected-sets-list-item {\n    display: flex;\n    margin-bottom: .7rem; }\n  .search-form__selected-types-remove-btn, .search-form__selected-sets-remove-btn {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    cursor: pointer;\n    height: 2rem;\n    width: 2rem;\n    font-size: 1.3rem;\n    background-color: #f2f2f2;\n    margin-right: .7rem; }\n  .search-form__selected-types-toggler {\n    height: 2rem;\n    width: 2.75rem;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    cursor: pointer;\n    font-size: 1.3rem;\n    margin-right: .7rem; }\n    .search-form__selected-types-toggler--is {\n      background-color: #47d147; }\n    .search-form__selected-types-toggler--not {\n      background-color: #ff0000; }\n  .search-form__dropdown {\n    position: absolute;\n    max-height: 28rem;\n    background-color: #fff;\n    z-index: 2;\n    top: 100%;\n    width: 40rem;\n    margin-top: -1rem;\n    overflow-y: auto;\n    border: 1px solid #000; }\n    .search-form__dropdown-list {\n      list-style: none; }\n      .search-form__dropdown-list-category {\n        padding: .5rem; }\n      .search-form__dropdown-list-option {\n        padding: .3rem 2rem;\n        display: flex;\n        align-items: center; }\n        .search-form__dropdown-list-option:hover {\n          cursor: pointer; }\n        .search-form__dropdown-list-option--highlighted {\n          background-color: #ccd8ff; }\n        .search-form__dropdown-list-option span {\n          text-transform: uppercase;\n          margin-left: 1rem; }\n      .search-form__dropdown-list-img {\n        width: 2rem;\n        height: 2rem;\n        margin-right: .7rem; }\n\n.dropdown-wrapper {\n  position: relative; }\n\n.api-results-display__nav {\n  background-color: #99b1ff;\n  width: 100%;\n  display: flex;\n  justify-content: space-between;\n  padding: 0 10%;\n  margin-bottom: .1rem; }\n  .api-results-display__nav-select {\n    color: #b300b3;\n    margin-right: 1rem; }\n  .api-results-display__nav-label {\n    color: #b300b3; }\n  .api-results-display__nav-right {\n    display: flex;\n    align-items: center; }\n  .api-results-display__nav-pagination-container {\n    display: flex;\n    align-items: center;\n    background-color: #ccd8ff;\n    cursor: pointer; }\n    .api-results-display__nav-pagination-container:not(:last-child) {\n      margin-right: 3rem; }\n    .api-results-display__nav-pagination-container--disabled {\n      cursor: not-allowed;\n      background-color: rgba(204, 216, 255, 0.4); }\n  .api-results-display__nav-svg-size {\n    height: 2rem;\n    width: 2rem; }\n\n.api-results-display__display-bar {\n  width: 100%;\n  border-bottom: 1px solid #bfbfbf;\n  padding-left: 10%;\n  margin-bottom: 2rem; }\n\n.card-checklist {\n  width: 80%;\n  justify-self: center; }\n  .card-checklist__row {\n    display: grid;\n    grid-template-columns: repeat(7, 1fr); }\n    .card-checklist__row--header {\n      border-bottom: 1px solid #000; }\n    .card-checklist__row--grey {\n      background-color: #f2f2f2; }\n  .card-checklist__data {\n    display: flex;\n    flex-wrap: nowrap;\n    justify-content: center;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    font-size: 1.4rem; }\n    .card-checklist__data--set {\n      text-transform: uppercase; }\n    .card-checklist__data--rarity {\n      text-transform: capitalize; }\n  .card-checklist__data-link {\n    padding: 1rem 0;\n    display: flex;\n    flex-wrap: nowrap;\n    align-items: center;\n    text-decoration: none;\n    width: 100%;\n    color: #000;\n    white-space: nowrap; }\n    .card-checklist__data-link--start {\n      justify-content: flex-start; }\n    .card-checklist__data-link--center {\n      justify-content: center; }\n\n.tooltip {\n  position: absolute;\n  z-index: 5;\n  width: 24rem;\n  height: 34rem; }\n  .tooltip__img {\n    width: 100%;\n    height: 100%; }\n\n.image-grid {\n  padding: 10rem 15rem;\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(25rem, 1fr));\n  grid-column-gap: 2rem;\n  grid-row-gap: 1rem; }\n  .image-grid__outer-div {\n    position: relative; }\n  .image-grid__inner-div {\n    perspective: 150rem;\n    height: 34rem;\n    width: 24rem; }\n  .image-grid__double {\n    height: 34rem;\n    width: 24rem;\n    position: absolute;\n    top: 0;\n    left: 0;\n    backface-visibility: hidden;\n    overflow: hidden;\n    transition: all .8s ease; }\n    .image-grid__double--back {\n      transform: rotateY(180deg); }\n  .image-grid__double-btn {\n    position: absolute;\n    top: 50%;\n    right: 15%;\n    width: 4rem;\n    height: 4rem;\n    border-radius: 50%;\n    background-color: rgba(255, 255, 255, 0.4); }\n  .image-grid__container {\n    width: 24rem;\n    height: 34rem; }\n  .image-grid__image {\n    width: 100%;\n    height: 100%; }\n\n.card {\n  display: flex;\n  margin-top: 3rem; }\n  .card__img-container {\n    margin-right: 10rem; }\n  .card__img {\n    width: 33rem;\n    height: 46rem; }\n  .card__img-left {\n    margin-right: 10rem;\n    width: 33rem;\n    display: flex;\n    flex-direction: column; }\n  .card__img-btn {\n    justify-self: flex-end;\n    align-self: flex-end;\n    margin-top: auto; }\n  .card__img-double-area {\n    position: relative; }\n  .card__img-double-sided {\n    perspective: 150rem;\n    height: 46rem; }\n  .card__img-double {\n    width: 33rem;\n    height: 46rem;\n    position: absolute;\n    top: 0;\n    left: 0;\n    backface-visibility: hidden;\n    overflow: hidden; }\n    .card__img-double--back {\n      transform: rotateY(180deg); }\n  .card__text {\n    background-color: #f4f4d7;\n    width: 34rem;\n    display: flex;\n    flex-direction: column;\n    padding: 1rem;\n    margin-right: 3rem; }\n    .card__text-flex {\n      margin-bottom: 1rem;\n      border-bottom: 1px solid #bfbfbf; }\n    .card__text-title {\n      display: flex;\n      align-items: center; }\n      .card__text-title-h3 {\n        font-size: 1.8rem;\n        font-weight: 400;\n        margin-right: 1rem; }\n    .card__text-color-indicator {\n      width: 1.3rem;\n      height: 1.3rem;\n      border: 1px solid #333;\n      border-radius: 50%;\n      box-shadow: 0px 0px 0px 2px rgba(0, 0, 0, 0.2);\n      margin-right: .7rem;\n      display: inline-block; }\n      .card__text-color-indicator--U {\n        background-color: rgba(128, 128, 255, 0.7); }\n      .card__text-color-indicator--B {\n        background-color: rgba(0, 0, 0, 0.7); }\n      .card__text-color-indicator--R {\n        background-color: rgba(255, 77, 77, 0.7); }\n      .card__text-color-indicator--W {\n        background-color: rgba(255, 255, 255, 0.7); }\n      .card__text-color-indicator--G {\n        background-color: rgba(0, 255, 0, 0.7); }\n    .card__text-oracle-p {\n      margin-bottom: 1rem;\n      font-size: 1.3rem; }\n    .card__text-oracle-flavor {\n      font-size: 1.3rem;\n      font-style: italic; }\n    .card__text-illustrator {\n      font-size: 1.2rem;\n      font-style: italic; }\n    .card__text-legal {\n      display: flex;\n      flex-direction: row;\n      justify-content: space-between; }\n      .card__text-legal-half {\n        display: flex;\n        flex-direction: column; }\n      .card__text-legal-span-container {\n        display: flex;\n        align-items: center; }\n        .card__text-legal-span-container:not(:last-child) {\n          margin-bottom: .5rem; }\n      .card__text-legal-span-box {\n        width: 6rem;\n        height: 2.5rem;\n        border: 1px solid #000;\n        margin-right: .3rem;\n        font-size: 1rem;\n        text-transform: uppercase;\n        display: flex;\n        justify-content: center;\n        align-items: center; }\n        .card__text-legal-span-box--not_legal {\n          background-color: #ff0000; }\n        .card__text-legal-span-box--legal {\n          background-color: #47d147; }\n  .card__set {\n    display: flex;\n    flex-direction: column; }\n    .card__set-banner {\n      display: flex;\n      border: 1px solid #bfbfbf;\n      width: 40rem;\n      background-color: #000;\n      color: #fff; }\n      .card__set-banner-svg-container {\n        margin-right: 1rem; }\n      .card__set-banner-svg {\n        width: 2.4rem;\n        height: 2.4rem;\n        filter: invert(100%); }\n    .card__set-details {\n      display: flex;\n      flex-direction: column; }\n    .card__set-header-name {\n      font-size: 1.7remrem; }\n    .card__set-header-code {\n      text-transform: uppercase; }\n    .card__set-prints-header {\n      display: flex;\n      justify-content: space-between;\n      background-color: #000;\n      color: #fff;\n      font-size: 1.3rem;\n      text-transform: uppercase;\n      border: 1px solid #bfbfbf;\n      padding: .3rem .7rem; }\n    .card__set-prints-svg-container {\n      height: 1.8rem;\n      width: 1.8rem;\n      border: 1px solid #bfbfbf;\n      display: flex;\n      justify-content: center;\n      align-items: center;\n      border-radius: 100%; }\n    .card__set-prints-svg--common {\n      fill: #000; }\n    .card__set-prints-svg--uncommon {\n      fill: #e6e6e6; }\n    .card__set-prints-svg--rare {\n      fill: #e6c300; }\n    .card__set-prints-svg--mythic {\n      fill: #ff0000; }\n    .card__set-prints-list {\n      list-style: none; }\n      .card__set-prints-list-link:link, .card__set-prints-list-link:visited {\n        text-decoration: none;\n        color: #000; }\n      .card__set-prints-list-item {\n        display: flex;\n        justify-content: space-between;\n        cursor: pointer; }\n        .card__set-prints-list-item:hover {\n          background-color: #f2f2f2; }\n      .card__set-prints-list-item-name-wrapper {\n        display: flex;\n        align-items: center;\n        margin-left: -1rem; }\n      .card__set-prints-list-item-set-name {\n        margin-left: .5rem; }\n      .card__set-prints-list-item-price {\n        margin-right: .7rem; }\n\n.card-page {\n  display: flex;\n  flex-direction: column;\n  grid-column: center-start / center-end; }\n\n.add-to-inv {\n  margin-top: 3rem;\n  width: 50%; }\n  .add-to-inv__form {\n    display: flex;\n    flex-direction: column; }\n    .add-to-inv__form-group {\n      display: flex;\n      align-content: center;\n      margin-bottom: 3rem; }\n    .add-to-inv__form-label {\n      margin-right: .3rem; }\n\n.no-results {\n  justify-self: center; }\n\n.container {\n  display: grid;\n  grid-template-columns: [full-start] minmax(6rem, 1fr) [center-start] repeat(8, [col-start] minmax(min-content, 14rem) [col-end]) [center-end] minmax(6rem, 1fr) [full-end]; }\n\n.login,\n.register {\n  margin-top: 5rem;\n  grid-column: center-start / center-end;\n  background-image: linear-gradient(to right bottom, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(../img/login-bg.jpg);\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  height: 75vh;\n  background-size: cover;\n  background-position: center; }\n\n.search {\n  grid-column: full-start / full-end;\n  background-color: #fff; }\n\n.api-results-display {\n  grid-column: full-start / full-end;\n  background-color: #fff;\n  display: grid; }\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/css/vendor/mana.css":
/*!***********************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/css/vendor/mana.css ***!
  \***********************************************************************/
/*! namespace exports */
/*! export default [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__, __webpack_require__.n, __webpack_exports__, __webpack_require__.r, module.id, __webpack_require__.d, __webpack_require__.*, module */
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/cssWithMappingToString.js */ "./node_modules/css-loader/dist/runtime/cssWithMappingToString.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/getUrl.js */ "./node_modules/css-loader/dist/runtime/getUrl.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _img_mana_symbols_mana_svg__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../img/mana-symbols/mana.svg */ "./src/img/mana-symbols/mana.svg");
// Imports




var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default()));
var ___CSS_LOADER_URL_REPLACEMENT_0___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_img_mana_symbols_mana_svg__WEBPACK_IMPORTED_MODULE_3__.default);
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".mana {\n    background-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\n    background-repeat: no-repeat;\n    background-size: auto 700%;\n    display: inline-block;\n    font-size: 100%;\n}\n\n.mana.xs {\n    width: 1.5rem;\n    height: 1.5rem;\n}\n\n.mana.small {\n    height: 2rem;\n    width: 2rem;\n}\n.mana.medium {\n    height: 2em;\n    width: 2em;\n}\n.mana.large {\n    height: 4em;\n    width: 4em;\n}\n.mana.s { background-position: 0 0; }\n.mana.s1 { background-position: 11.1% 0; }\n.mana.s2 { background-position: 22.2% 0; }\n.mana.s3 { background-position: 33.3% 0; }\n.mana.s4 { background-position: 44.4% 0; }\n.mana.s5 { background-position: 55.5% 0; }\n.mana.s6 { background-position: 66.6% 0; }\n.mana.s7 { background-position: 77.7% 0; }\n.mana.s8 { background-position: 88.8% 0; }\n.mana.s9 { background-position: 99.9% 0; }\n\n.mana.s10 { background-position: 0 16%; }\n.mana.s11 { background-position: 11.1% 16.6%; }\n.mana.s12 { background-position: 22.2% 16.6%; }\n.mana.s13 { background-position: 33.3% 16.6%; }\n.mana.s14 { background-position: 44.4% 16.6%; }\n.mana.s15 { background-position: 55.5% 16.6%; }\n.mana.s16 { background-position: 66.6% 16.6%; }\n.mana.s17 { background-position: 77.7% 16.6%; }\n.mana.s18 { background-position: 88.8% 16.6%; }\n.mana.s19 { background-position: 99.9% 16.6%; }\n\n.mana.s20 { background-position: 0 33%; }\n.mana.sx { background-position: 11.1% 33.3%; }\n.mana.sy { background-position: 22.2% 33.3%; }\n.mana.sz { background-position: 33.3% 33.3%; }\n.mana.sw { background-position: 44.4% 33.3%; }\n.mana.su { background-position: 55.5% 33.3%; }\n.mana.sb { background-position: 66.6% 33.3%; }\n.mana.sr { background-position: 77.7% 33.3%; }\n.mana.sg { background-position: 88.8% 33.3%; }\n.mana.ss { background-position: 99.9% 33.3%; }\n\n.mana.swu { background-position: 0 50%; }\n.mana.swb { background-position: 11.1% 50%; }\n.mana.sub { background-position: 22.2% 50%; }\n.mana.sur { background-position: 33.3% 50%; }\n.mana.sbr { background-position: 44.4% 50%; }\n.mana.sbg { background-position: 55.5% 50%; }\n.mana.srw { background-position: 66.6% 50%; }\n.mana.srg { background-position: 77.7% 50%; }\n.mana.sgw { background-position: 88.8% 50%; }\n.mana.sgu { background-position: 99.9% 50%; }\n\n.mana.s2w { background-position: 0 66.6%; }\n.mana.s2u { background-position: 11.1% 66.6%; }\n.mana.s2b { background-position: 22.2% 66.6%; }\n.mana.s2r { background-position: 33.3% 66.6%; }\n.mana.s2g { background-position: 44.4% 66.6%; }\n.mana.swp { background-position: 55.5% 66.6%; }\n.mana.sup { background-position: 66.6% 66.6%; }\n.mana.sbp { background-position: 77.7% 66.6%; }\n.mana.srp { background-position: 88.8% 66.6%; }\n.mana.sgp { background-position: 99.9% 66.6%; }\n\n.mana.st { background-position: 0% 83.3%; }\n.mana.sq { background-position: 11.1% 83.3%; }\n\n.mana.sc { background-position: 77.7% 83.3%; }\n\n.mana.se { background-position: 88.8% 83.3%; }\n\n.mana.s1000000 { background-position: 0 100%; }\n.mana.s1000000.small { width: 4.9em; }\n.mana.s1000000.medium { width: 9.7em; }\n/*.mana.s1000000.large { width: 18.8em; }*/\n.mana.s100 { background-position: 60% 100%; }\n.mana.s100.small { width: 1.8em; }\n.mana.s100.medium { width: 3.7em; }\n/*.mana.s100.large { width: 10.8em; }*/\n.mana.schaos { background-position: 76.5% 100%; }\n.mana.schaos.small { width: 1.2em; }\n.mana.schaos.medium { width: 2.3em; }\n/*.mana.sc.large { width: 4.6em; }*/\n.mana.shw { background-position: 83.5% 100%; }\n.mana.shw.small { width: 0.5em; }\n.mana.shw.medium { width: 1em; }\n/*.mana.shw.large { width: 2em; }*/\n.mana.shr { background-position: 89% 100%; }\n.mana.shr.small { width: 0.5em; }\n.mana.shr.medium { width: 1em; }\n/*.mana.shr.large { width: 2em; }*/\n\n\n.shadow {\n    filter: \"progid:DXImageTransform.Microsoft.Dropshadow(OffX=-1, OffY=1, Color='#000')\";\n    filter: url(#shadow);\n    -webkit-filter: drop-shadow(-1px 1px 0px #000);\n    filter: drop-shadow(-1px 1px 0px #000);\n}", "",{"version":3,"sources":["webpack://src/css/vendor/mana.css"],"names":[],"mappings":"AAAA;IACI,yDAAwD;IACxD,4BAA4B;IAC5B,0BAA0B;IAC1B,qBAAqB;IACrB,eAAe;AACnB;;AAEA;IACI,aAAa;IACb,cAAc;AAClB;;AAEA;IACI,YAAY;IACZ,WAAW;AACf;AACA;IACI,WAAW;IACX,UAAU;AACd;AACA;IACI,WAAW;IACX,UAAU;AACd;AACA,UAAU,wBAAwB,EAAE;AACpC,WAAW,4BAA4B,EAAE;AACzC,WAAW,4BAA4B,EAAE;AACzC,WAAW,4BAA4B,EAAE;AACzC,WAAW,4BAA4B,EAAE;AACzC,WAAW,4BAA4B,EAAE;AACzC,WAAW,4BAA4B,EAAE;AACzC,WAAW,4BAA4B,EAAE;AACzC,WAAW,4BAA4B,EAAE;AACzC,WAAW,4BAA4B,EAAE;;AAEzC,YAAY,0BAA0B,EAAE;AACxC,YAAY,gCAAgC,EAAE;AAC9C,YAAY,gCAAgC,EAAE;AAC9C,YAAY,gCAAgC,EAAE;AAC9C,YAAY,gCAAgC,EAAE;AAC9C,YAAY,gCAAgC,EAAE;AAC9C,YAAY,gCAAgC,EAAE;AAC9C,YAAY,gCAAgC,EAAE;AAC9C,YAAY,gCAAgC,EAAE;AAC9C,YAAY,gCAAgC,EAAE;;AAE9C,YAAY,0BAA0B,EAAE;AACxC,WAAW,gCAAgC,EAAE;AAC7C,WAAW,gCAAgC,EAAE;AAC7C,WAAW,gCAAgC,EAAE;AAC7C,WAAW,gCAAgC,EAAE;AAC7C,WAAW,gCAAgC,EAAE;AAC7C,WAAW,gCAAgC,EAAE;AAC7C,WAAW,gCAAgC,EAAE;AAC7C,WAAW,gCAAgC,EAAE;AAC7C,WAAW,gCAAgC,EAAE;;AAE7C,YAAY,0BAA0B,EAAE;AACxC,YAAY,8BAA8B,EAAE;AAC5C,YAAY,8BAA8B,EAAE;AAC5C,YAAY,8BAA8B,EAAE;AAC5C,YAAY,8BAA8B,EAAE;AAC5C,YAAY,8BAA8B,EAAE;AAC5C,YAAY,8BAA8B,EAAE;AAC5C,YAAY,8BAA8B,EAAE;AAC5C,YAAY,8BAA8B,EAAE;AAC5C,YAAY,8BAA8B,EAAE;;AAE5C,YAAY,4BAA4B,EAAE;AAC1C,YAAY,gCAAgC,EAAE;AAC9C,YAAY,gCAAgC,EAAE;AAC9C,YAAY,gCAAgC,EAAE;AAC9C,YAAY,gCAAgC,EAAE;AAC9C,YAAY,gCAAgC,EAAE;AAC9C,YAAY,gCAAgC,EAAE;AAC9C,YAAY,gCAAgC,EAAE;AAC9C,YAAY,gCAAgC,EAAE;AAC9C,YAAY,gCAAgC,EAAE;;AAE9C,WAAW,6BAA6B,EAAE;AAC1C,WAAW,gCAAgC,EAAE;;AAE7C,WAAW,gCAAgC,EAAE;;AAE7C,WAAW,gCAAgC,EAAE;;AAE7C,iBAAiB,2BAA2B,EAAE;AAC9C,uBAAuB,YAAY,EAAE;AACrC,wBAAwB,YAAY,EAAE;AACtC,0CAA0C;AAC1C,aAAa,6BAA6B,EAAE;AAC5C,mBAAmB,YAAY,EAAE;AACjC,oBAAoB,YAAY,EAAE;AAClC,sCAAsC;AACtC,eAAe,+BAA+B,EAAE;AAChD,qBAAqB,YAAY,EAAE;AACnC,sBAAsB,YAAY,EAAE;AACpC,mCAAmC;AACnC,YAAY,+BAA+B,EAAE;AAC7C,kBAAkB,YAAY,EAAE;AAChC,mBAAmB,UAAU,EAAE;AAC/B,kCAAkC;AAClC,YAAY,6BAA6B,EAAE;AAC3C,kBAAkB,YAAY,EAAE;AAChC,mBAAmB,UAAU,EAAE;AAC/B,kCAAkC;;;AAGlC;IACI,qFAAqF;IACrF,oBAAoB;IACpB,8CAA8C;IAC9C,sCAAsC;AAC1C","sourcesContent":[".mana {\n    background-image: url('../../img/mana-symbols/mana.svg');\n    background-repeat: no-repeat;\n    background-size: auto 700%;\n    display: inline-block;\n    font-size: 100%;\n}\n\n.mana.xs {\n    width: 1.5rem;\n    height: 1.5rem;\n}\n\n.mana.small {\n    height: 2rem;\n    width: 2rem;\n}\n.mana.medium {\n    height: 2em;\n    width: 2em;\n}\n.mana.large {\n    height: 4em;\n    width: 4em;\n}\n.mana.s { background-position: 0 0; }\n.mana.s1 { background-position: 11.1% 0; }\n.mana.s2 { background-position: 22.2% 0; }\n.mana.s3 { background-position: 33.3% 0; }\n.mana.s4 { background-position: 44.4% 0; }\n.mana.s5 { background-position: 55.5% 0; }\n.mana.s6 { background-position: 66.6% 0; }\n.mana.s7 { background-position: 77.7% 0; }\n.mana.s8 { background-position: 88.8% 0; }\n.mana.s9 { background-position: 99.9% 0; }\n\n.mana.s10 { background-position: 0 16%; }\n.mana.s11 { background-position: 11.1% 16.6%; }\n.mana.s12 { background-position: 22.2% 16.6%; }\n.mana.s13 { background-position: 33.3% 16.6%; }\n.mana.s14 { background-position: 44.4% 16.6%; }\n.mana.s15 { background-position: 55.5% 16.6%; }\n.mana.s16 { background-position: 66.6% 16.6%; }\n.mana.s17 { background-position: 77.7% 16.6%; }\n.mana.s18 { background-position: 88.8% 16.6%; }\n.mana.s19 { background-position: 99.9% 16.6%; }\n\n.mana.s20 { background-position: 0 33%; }\n.mana.sx { background-position: 11.1% 33.3%; }\n.mana.sy { background-position: 22.2% 33.3%; }\n.mana.sz { background-position: 33.3% 33.3%; }\n.mana.sw { background-position: 44.4% 33.3%; }\n.mana.su { background-position: 55.5% 33.3%; }\n.mana.sb { background-position: 66.6% 33.3%; }\n.mana.sr { background-position: 77.7% 33.3%; }\n.mana.sg { background-position: 88.8% 33.3%; }\n.mana.ss { background-position: 99.9% 33.3%; }\n\n.mana.swu { background-position: 0 50%; }\n.mana.swb { background-position: 11.1% 50%; }\n.mana.sub { background-position: 22.2% 50%; }\n.mana.sur { background-position: 33.3% 50%; }\n.mana.sbr { background-position: 44.4% 50%; }\n.mana.sbg { background-position: 55.5% 50%; }\n.mana.srw { background-position: 66.6% 50%; }\n.mana.srg { background-position: 77.7% 50%; }\n.mana.sgw { background-position: 88.8% 50%; }\n.mana.sgu { background-position: 99.9% 50%; }\n\n.mana.s2w { background-position: 0 66.6%; }\n.mana.s2u { background-position: 11.1% 66.6%; }\n.mana.s2b { background-position: 22.2% 66.6%; }\n.mana.s2r { background-position: 33.3% 66.6%; }\n.mana.s2g { background-position: 44.4% 66.6%; }\n.mana.swp { background-position: 55.5% 66.6%; }\n.mana.sup { background-position: 66.6% 66.6%; }\n.mana.sbp { background-position: 77.7% 66.6%; }\n.mana.srp { background-position: 88.8% 66.6%; }\n.mana.sgp { background-position: 99.9% 66.6%; }\n\n.mana.st { background-position: 0% 83.3%; }\n.mana.sq { background-position: 11.1% 83.3%; }\n\n.mana.sc { background-position: 77.7% 83.3%; }\n\n.mana.se { background-position: 88.8% 83.3%; }\n\n.mana.s1000000 { background-position: 0 100%; }\n.mana.s1000000.small { width: 4.9em; }\n.mana.s1000000.medium { width: 9.7em; }\n/*.mana.s1000000.large { width: 18.8em; }*/\n.mana.s100 { background-position: 60% 100%; }\n.mana.s100.small { width: 1.8em; }\n.mana.s100.medium { width: 3.7em; }\n/*.mana.s100.large { width: 10.8em; }*/\n.mana.schaos { background-position: 76.5% 100%; }\n.mana.schaos.small { width: 1.2em; }\n.mana.schaos.medium { width: 2.3em; }\n/*.mana.sc.large { width: 4.6em; }*/\n.mana.shw { background-position: 83.5% 100%; }\n.mana.shw.small { width: 0.5em; }\n.mana.shw.medium { width: 1em; }\n/*.mana.shw.large { width: 2em; }*/\n.mana.shr { background-position: 89% 100%; }\n.mana.shr.small { width: 0.5em; }\n.mana.shr.medium { width: 1em; }\n/*.mana.shr.large { width: 2em; }*/\n\n\n.shadow {\n    filter: \"progid:DXImageTransform.Microsoft.Dropshadow(OffX=-1, OffY=1, Color='#000')\";\n    filter: url(#shadow);\n    -webkit-filter: drop-shadow(-1px 1px 0px #000);\n    filter: drop-shadow(-1px 1px 0px #000);\n}"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 9:0-14 */
/***/ ((module) => {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
// eslint-disable-next-line func-names
module.exports = function (cssWithMappingToString) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = cssWithMappingToString(item);

      if (item[2]) {
        return "@media ".concat(item[2], " {").concat(content, "}");
      }

      return content;
    }).join('');
  }; // import a list of modules into the list
  // eslint-disable-next-line func-names


  list.i = function (modules, mediaQuery, dedupe) {
    if (typeof modules === 'string') {
      // eslint-disable-next-line no-param-reassign
      modules = [[null, modules, '']];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var i = 0; i < this.length; i++) {
        // eslint-disable-next-line prefer-destructuring
        var id = this[i][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _i = 0; _i < modules.length; _i++) {
      var item = [].concat(modules[_i]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        // eslint-disable-next-line no-continue
        continue;
      }

      if (mediaQuery) {
        if (!item[2]) {
          item[2] = mediaQuery;
        } else {
          item[2] = "".concat(mediaQuery, " and ").concat(item[2]);
        }
      }

      list.push(item);
    }
  };

  return list;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/cssWithMappingToString.js":
/*!************************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/cssWithMappingToString.js ***!
  \************************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 15:0-14 */
/***/ ((module) => {

"use strict";


function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

module.exports = function cssWithMappingToString(item) {
  var _item = _slicedToArray(item, 4),
      content = _item[1],
      cssMapping = _item[3];

  if (typeof btoa === 'function') {
    // eslint-disable-next-line no-undef
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot || '').concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
  }

  return [content].join('\n');
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/getUrl.js":
/*!********************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/getUrl.js ***!
  \********************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 3:0-14 */
/***/ ((module) => {

"use strict";


module.exports = function (url, options) {
  if (!options) {
    // eslint-disable-next-line no-param-reassign
    options = {};
  } // eslint-disable-next-line no-underscore-dangle, no-param-reassign


  url = url && url.__esModule ? url.default : url;

  if (typeof url !== 'string') {
    return url;
  } // If url is already wrapped in quotes, remove them


  if (/^['"].*['"]$/.test(url)) {
    // eslint-disable-next-line no-param-reassign
    url = url.slice(1, -1);
  }

  if (options.hash) {
    // eslint-disable-next-line no-param-reassign
    url += options.hash;
  } // Should url be wrapped?
  // See https://drafts.csswg.org/css-values-3/#urls


  if (/["'() \t\n]/.test(url) || options.needQuotes) {
    return "\"".concat(url.replace(/"/g, '\\"').replace(/\n/g, '\\n'), "\"");
  }

  return url;
};

/***/ }),

/***/ "./src/img/login-bg.jpg":
/*!******************************!*\
  !*** ./src/img/login-bg.jpg ***!
  \******************************/
/*! namespace exports */
/*! export default [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__, __webpack_require__.r, __webpack_require__.p, __webpack_require__.d, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "ad45c7a49455ad6dd215111708a970dc.jpg");

/***/ }),

/***/ "./src/img/mana-symbols/mana.svg":
/*!***************************************!*\
  !*** ./src/img/mana-symbols/mana.svg ***!
  \***************************************/
/*! namespace exports */
/*! export default [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__, __webpack_require__.r, __webpack_require__.p, __webpack_require__.d, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "c89a0305c6ebff3858878df61368767a.svg");

/***/ }),

/***/ "./src/css/style.css":
/*!***************************!*\
  !*** ./src/css/style.css ***!
  \***************************/
/*! namespace exports */
/*! export default [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__, __webpack_require__.n, __webpack_exports__, __webpack_require__.r, __webpack_require__.d, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!./style.css */ "./node_modules/css-loader/dist/cjs.js!./src/css/style.css");

            

var options = {};

options.insert = "head";
options.singleton = false;

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_1__.default, options);



/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_1__.default.locals || {});

/***/ }),

/***/ "./src/css/vendor/mana.css":
/*!*********************************!*\
  !*** ./src/css/vendor/mana.css ***!
  \*********************************/
/*! namespace exports */
/*! export default [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__, __webpack_require__.n, __webpack_exports__, __webpack_require__.r, __webpack_require__.d, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_mana_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !!../../../node_modules/css-loader/dist/cjs.js!./mana.css */ "./node_modules/css-loader/dist/cjs.js!./src/css/vendor/mana.css");

            

var options = {};

options.insert = "head";
options.singleton = false;

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_mana_css__WEBPACK_IMPORTED_MODULE_1__.default, options);



/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_mana_css__WEBPACK_IMPORTED_MODULE_1__.default.locals || {});

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__.nc, __webpack_require__.* */
/*! CommonJS bailout: module.exports is used directly at 230:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isOldIE = function isOldIE() {
  var memo;
  return function memorize() {
    if (typeof memo === 'undefined') {
      // Test for IE <= 9 as proposed by Browserhacks
      // @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
      // Tests for existence of standard globals is to allow style-loader
      // to operate correctly into non-standard environments
      // @see https://github.com/webpack-contrib/style-loader/issues/177
      memo = Boolean(window && document && document.all && !window.atob);
    }

    return memo;
  };
}();

var getTarget = function getTarget() {
  var memo = {};
  return function memorize(target) {
    if (typeof memo[target] === 'undefined') {
      var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

      if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
        try {
          // This will throw an exception if access to iframe is blocked
          // due to cross-origin restrictions
          styleTarget = styleTarget.contentDocument.head;
        } catch (e) {
          // istanbul ignore next
          styleTarget = null;
        }
      }

      memo[target] = styleTarget;
    }

    return memo[target];
  };
}();

var stylesInDom = [];

function getIndexByIdentifier(identifier) {
  var result = -1;

  for (var i = 0; i < stylesInDom.length; i++) {
    if (stylesInDom[i].identifier === identifier) {
      result = i;
      break;
    }
  }

  return result;
}

function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var index = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3]
    };

    if (index !== -1) {
      stylesInDom[index].references++;
      stylesInDom[index].updater(obj);
    } else {
      stylesInDom.push({
        identifier: identifier,
        updater: addStyle(obj, options),
        references: 1
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

function insertStyleElement(options) {
  var style = document.createElement('style');
  var attributes = options.attributes || {};

  if (typeof attributes.nonce === 'undefined') {
    var nonce =  true ? __webpack_require__.nc : 0;

    if (nonce) {
      attributes.nonce = nonce;
    }
  }

  Object.keys(attributes).forEach(function (key) {
    style.setAttribute(key, attributes[key]);
  });

  if (typeof options.insert === 'function') {
    options.insert(style);
  } else {
    var target = getTarget(options.insert || 'head');

    if (!target) {
      throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
    }

    target.appendChild(style);
  }

  return style;
}

function removeStyleElement(style) {
  // istanbul ignore if
  if (style.parentNode === null) {
    return false;
  }

  style.parentNode.removeChild(style);
}
/* istanbul ignore next  */


var replaceText = function replaceText() {
  var textStore = [];
  return function replace(index, replacement) {
    textStore[index] = replacement;
    return textStore.filter(Boolean).join('\n');
  };
}();

function applyToSingletonTag(style, index, remove, obj) {
  var css = remove ? '' : obj.media ? "@media ".concat(obj.media, " {").concat(obj.css, "}") : obj.css; // For old IE

  /* istanbul ignore if  */

  if (style.styleSheet) {
    style.styleSheet.cssText = replaceText(index, css);
  } else {
    var cssNode = document.createTextNode(css);
    var childNodes = style.childNodes;

    if (childNodes[index]) {
      style.removeChild(childNodes[index]);
    }

    if (childNodes.length) {
      style.insertBefore(cssNode, childNodes[index]);
    } else {
      style.appendChild(cssNode);
    }
  }
}

function applyToTag(style, options, obj) {
  var css = obj.css;
  var media = obj.media;
  var sourceMap = obj.sourceMap;

  if (media) {
    style.setAttribute('media', media);
  } else {
    style.removeAttribute('media');
  }

  if (sourceMap && typeof btoa !== 'undefined') {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    while (style.firstChild) {
      style.removeChild(style.firstChild);
    }

    style.appendChild(document.createTextNode(css));
  }
}

var singleton = null;
var singletonCounter = 0;

function addStyle(obj, options) {
  var style;
  var update;
  var remove;

  if (options.singleton) {
    var styleIndex = singletonCounter++;
    style = singleton || (singleton = insertStyleElement(options));
    update = applyToSingletonTag.bind(null, style, styleIndex, false);
    remove = applyToSingletonTag.bind(null, style, styleIndex, true);
  } else {
    style = insertStyleElement(options);
    update = applyToTag.bind(null, style, options);

    remove = function remove() {
      removeStyleElement(style);
    };
  }

  update(obj);
  return function updateStyle(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap) {
        return;
      }

      update(obj = newObj);
    } else {
      remove();
    }
  };
}

module.exports = function (list, options) {
  options = options || {}; // Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
  // tags it will allow on a page

  if (!options.singleton && typeof options.singleton !== 'boolean') {
    options.singleton = isOldIE();
  }

  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];

    if (Object.prototype.toString.call(newList) !== '[object Array]') {
      return;
    }

    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDom[index].references--;
    }

    var newLastIdentifiers = modulesToDom(newList, options);

    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];

      var _index = getIndexByIdentifier(_identifier);

      if (stylesInDom[_index].references === 0) {
        stylesInDom[_index].updater();

        stylesInDom.splice(_index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "./src/js/index.js":
/*!*************************!*\
  !*** ./src/js/index.js ***!
  \*************************/
/*! namespace exports */
/*! exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__, __webpack_require__.r, __webpack_exports__, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _css_style_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../css/style.css */ "./src/css/style.css");
/* harmony import */ var _css_vendor_mana_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../css/vendor/mana.css */ "./src/css/vendor/mana.css");
/* harmony import */ var _models_Search__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./models/Search */ "./src/js/models/Search.js");
/* harmony import */ var _views_searchView__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./views/searchView */ "./src/js/views/searchView.js");
/* harmony import */ var _views_resultsView__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./views/resultsView */ "./src/js/views/resultsView.js");
/* harmony import */ var _views_cardView__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./views/cardView */ "./src/js/views/cardView.js");
/* harmony import */ var _views_base__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./views/base */ "./src/js/views/base.js");









// ******************************* \\
// ********* Quick Search ******** \\
// ******************************* \\
_views_base__WEBPACK_IMPORTED_MODULE_6__.elements.nav.quickSearchBtn.addEventListener('click', () => {
    const search = new _models_Search__WEBPACK_IMPORTED_MODULE_2__.default();

    if (_views_base__WEBPACK_IMPORTED_MODULE_6__.elements.nav.searchInput.value !== '') {
        const query = search.quickSearch();
        window.location.href = `/results/list/${query}&order=name`
    }
})


// ******************************* \\
// ********* Search Page ********* \\
// ******************************* \\
if (window.location.pathname === '/search') {
    const search = new _models_Search__WEBPACK_IMPORTED_MODULE_2__.default();

    // Event listener for the submit search button. This goes through the form and generates
    // the qujery string. It then passes the string to the server through the URL
    _views_base__WEBPACK_IMPORTED_MODULE_6__.elements.apiSearch.submitBtn.onclick = async e => {
        e.preventDefault()

        // Clear any existing query string
        search.resetSearchQuery();
    
        // Build the query string
        const query = search.buildSearchQuery();

        // Get the display method
        const displayMethod = search.displayMethod();

        // Create a get request with the query string
        window.location.href = `/results/${displayMethod}/${query}`;
    
        return false
    }

    _views_base__WEBPACK_IMPORTED_MODULE_6__.elements.apiSearch.typeLine.addEventListener('click', () => {
        // Display the dropdown
        _views_searchView__WEBPACK_IMPORTED_MODULE_3__.showTypesDropDown();
        _views_searchView__WEBPACK_IMPORTED_MODULE_3__.startTypesDropDownNavigation();

        // Start an event listener on the document. This will close the dropdown if the user clicks
        // outside of the input or dropdown. This will also cancel the event listener
        document.addEventListener('click', _views_searchView__WEBPACK_IMPORTED_MODULE_3__.typeLineListener)
    })

    _views_base__WEBPACK_IMPORTED_MODULE_6__.elements.apiSearch.typeLine.addEventListener('input', () => {
        if (_views_base__WEBPACK_IMPORTED_MODULE_6__.elements.apiSearch.typeDropDown.hasAttribute('hidden')) {
            _views_searchView__WEBPACK_IMPORTED_MODULE_3__.showTypesDropDown();
        }

        _views_searchView__WEBPACK_IMPORTED_MODULE_3__.filterTypes(_views_base__WEBPACK_IMPORTED_MODULE_6__.elements.apiSearch.typeLine.value);
        _views_searchView__WEBPACK_IMPORTED_MODULE_3__.filterTypeHeaders();
        _views_searchView__WEBPACK_IMPORTED_MODULE_3__.startTypesDropDownNavigation();
    })

    _views_base__WEBPACK_IMPORTED_MODULE_6__.elements.apiSearch.setInput.addEventListener('click', () => {
        // Display the dropdown
        _views_searchView__WEBPACK_IMPORTED_MODULE_3__.showSetsDropDown();
        _views_searchView__WEBPACK_IMPORTED_MODULE_3__.startSetsDropDownNavigation();

        // Start an event listener on the document. This will close the dropdown if the user clicks
        // outside of the input or dropdown. This will also cancel the event listener
        document.addEventListener('click', _views_searchView__WEBPACK_IMPORTED_MODULE_3__.setInputListener)
    })

    _views_base__WEBPACK_IMPORTED_MODULE_6__.elements.apiSearch.setInput.addEventListener('input', () => {
        if (_views_base__WEBPACK_IMPORTED_MODULE_6__.elements.apiSearch.setDropDown.hasAttribute('hidden')) {
            _views_searchView__WEBPACK_IMPORTED_MODULE_3__.showSetsDropDown();
        }

        _views_searchView__WEBPACK_IMPORTED_MODULE_3__.filterSets(_views_base__WEBPACK_IMPORTED_MODULE_6__.elements.apiSearch.setInput.value);
        _views_searchView__WEBPACK_IMPORTED_MODULE_3__.filterSetHeaders();        
        _views_searchView__WEBPACK_IMPORTED_MODULE_3__.startSetsDropDownNavigation();
    })

    _views_base__WEBPACK_IMPORTED_MODULE_6__.elements.apiSearch.statValue.addEventListener(
        'input', _views_searchView__WEBPACK_IMPORTED_MODULE_3__.statLineController
    );

    _views_base__WEBPACK_IMPORTED_MODULE_6__.elements.apiSearch.format.addEventListener(
        'change', _views_searchView__WEBPACK_IMPORTED_MODULE_3__.formatLineController
    );


} 

 
// ******************************* \\
// ********* Results Page ******** \\
// ******************************* \\
if (window.location.pathname.substring(1, 8) === 'results') {
    const state = {
        search: new _models_Search__WEBPACK_IMPORTED_MODULE_2__.default(),

        // Get the display method, sort method, and query from the URL
        display: window.location.pathname.substring(9, window.location.pathname.lastIndexOf('/')),
        query: window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1),
        sortMethod: window.location.pathname.substring(window.location.pathname.lastIndexOf('=') + 1),

        allCards: [],
        currentIndex: 0,
        allResultsLoaded: false,
    };

    // When the results page is refreshed, display the cards as a checklist by default
    document.addEventListener('DOMContentLoaded', async () => {
        // Update the sort by and display asd menus so the selected option is what the user selected
        _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.choseSelectMenuSort(_views_base__WEBPACK_IMPORTED_MODULE_6__.elements.resultsPage.sortBy.options, state);
        _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.choseSelectMenuDisplay(_views_base__WEBPACK_IMPORTED_MODULE_6__.elements.resultsPage.displaySelector, state)

        // Run the get cards function, then update the display bar with the total card count
        await state.search.getCards(state);

        if (state.allCards[0] === 404) {
            _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.display404();
            return
        }

        _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.updateDisplayBar(state);

        // In the background, get all cards 
        state.search.getAllCards(state, _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.enableBtn);

        // On loading the page display the cards in a checklist
        _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.updateDisplay(state);
    });

    // Event listener for the change display method button
    _views_base__WEBPACK_IMPORTED_MODULE_6__.elements.resultsPage.btn.onclick = async () => {
        // Update the display method between checklist and cards if the user changed it
        _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.changeDisplayAndUrl(state);

        // If a new sorting method is selected, a request is sent to the server and the page is refreshed.
        // This resets the state and async tasks
        _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.changeSortMethod(state);
        
        // Update the display with a new sort method and display method if either were given
        _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.updateDisplay(state);
    };

    // Event Listener for next page button
    _views_base__WEBPACK_IMPORTED_MODULE_6__.elements.resultsPage.nextPageBtn.onclick = () => {
        // Update the index
        state.currentIndex ++;
        
        // Update the display based on the method stored in the state
        _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.updateDisplay(state);

        // Update the display bar
        _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.updateDisplayBar(state);

        // Enable the previous page and first page btns
        _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.enableBtn(_views_base__WEBPACK_IMPORTED_MODULE_6__.elements.resultsPage.previousPageBtn);
        _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.enableBtn(_views_base__WEBPACK_IMPORTED_MODULE_6__.elements.resultsPage.firstPageBtn);

        // If on the last page, disable the next page btn and last page btn
        if (state.currentIndex === (state.allCards.length - 1)) {
            _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.disableBtn(_views_base__WEBPACK_IMPORTED_MODULE_6__.elements.resultsPage.nextPageBtn);
            _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.disableBtn(_views_base__WEBPACK_IMPORTED_MODULE_6__.elements.resultsPage.lastPageBtn)
        }
    };

    // Event listener for the last page btn
    _views_base__WEBPACK_IMPORTED_MODULE_6__.elements.resultsPage.lastPageBtn.onclick = () => {
        // Update the index
        state.currentIndex = state.allCards.length - 1;

        // Update the display based on the method stored in the state
        _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.updateDisplay(state);

        // Update the display bar
        _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.updateDisplayBar(state);

        // Disable the next and last page buttons
        _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.disableBtn(_views_base__WEBPACK_IMPORTED_MODULE_6__.elements.resultsPage.nextPageBtn);
        _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.disableBtn(_views_base__WEBPACK_IMPORTED_MODULE_6__.elements.resultsPage.lastPageBtn);

        // Enable the previous and first page buttons
        _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.enableBtn(_views_base__WEBPACK_IMPORTED_MODULE_6__.elements.resultsPage.previousPageBtn);
        _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.enableBtn(_views_base__WEBPACK_IMPORTED_MODULE_6__.elements.resultsPage.firstPageBtn);
    };

    // Event listener for the previous page button
    _views_base__WEBPACK_IMPORTED_MODULE_6__.elements.resultsPage.previousPageBtn.onclick = () => {
        // Update the index
        state.currentIndex --;

        // Update the display based on the method stored in the state
        _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.updateDisplay(state);

        // Update the display bar
        _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.updateDisplayBar(state);

        // If on the first page, disable the previous and first page buttons
        if (state.currentIndex === 0) {
            _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.disableBtn(_views_base__WEBPACK_IMPORTED_MODULE_6__.elements.resultsPage.previousPageBtn);
            _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.disableBtn(_views_base__WEBPACK_IMPORTED_MODULE_6__.elements.resultsPage.firstPageBtn);
        }

        // Enable the next and last page buttons. The last page button should only be 
        // enabled if all results have been loaded
        _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.enableBtn(_views_base__WEBPACK_IMPORTED_MODULE_6__.elements.resultsPage.nextPageBtn);
        if (state.allResultsLoaded) _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.enableBtn(_views_base__WEBPACK_IMPORTED_MODULE_6__.elements.resultsPage.lastPageBtn);
    };

    // Event listener for the first page btn
    _views_base__WEBPACK_IMPORTED_MODULE_6__.elements.resultsPage.firstPageBtn.onclick = () => {
        // Update the index
        state.currentIndex = 0;

        // Update the display based on the method stored in the state
        _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.updateDisplay(state);

        // Update the display bar
        _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.updateDisplayBar(state);

        // Disable the previous and first page buttons
        _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.disableBtn(_views_base__WEBPACK_IMPORTED_MODULE_6__.elements.resultsPage.previousPageBtn);
        _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.disableBtn(_views_base__WEBPACK_IMPORTED_MODULE_6__.elements.resultsPage.firstPageBtn);

        // Enable the next and last page buttons. The last page button should only be 
        // enabled if all results have been loaded
        _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.enableBtn(_views_base__WEBPACK_IMPORTED_MODULE_6__.elements.resultsPage.nextPageBtn);
        if (state.allResultsLoaded) _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.enableBtn(_views_base__WEBPACK_IMPORTED_MODULE_6__.elements.resultsPage.lastPageBtn);
    }

    window.onpopstate = e => {
        // const data = e.state;
        // if (data !== null) resultsView.updateDisplayOnPopState(state, data);

        window.location.href = `/search`;
    }
}


// ******************************* \\
// *********** Card Page ********* \\
// ******************************* \\
if (window.location.pathname.substring(1, 5) === 'card') {
    _views_cardView__WEBPACK_IMPORTED_MODULE_5__.insertManaCostToCardTextTitle();

    _views_cardView__WEBPACK_IMPORTED_MODULE_5__.insertManaCostToOracleText();

    _views_cardView__WEBPACK_IMPORTED_MODULE_5__.removeUnderScoreFromLegalStatus();

    _views_cardView__WEBPACK_IMPORTED_MODULE_5__.fixCardPrices();

    _views_cardView__WEBPACK_IMPORTED_MODULE_5__.setPrintLinkHref();

    _views_cardView__WEBPACK_IMPORTED_MODULE_5__.printListHoverEvents();

    // If the transform btn is on the dom (if the card is double sided) set
    // the event listener for the card to be flipped back and forth
    if (_views_base__WEBPACK_IMPORTED_MODULE_6__.elements.card.transformBtn) {
        _views_base__WEBPACK_IMPORTED_MODULE_6__.elements.card.transformBtn.addEventListener(
            'click', _views_cardView__WEBPACK_IMPORTED_MODULE_5__.flipToBackSide
        );
    }
}

/***/ }),

/***/ "./src/js/models/Search.js":
/*!*********************************!*\
  !*** ./src/js/models/Search.js ***!
  \*********************************/
/*! namespace exports */
/*! export default [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__, __webpack_require__.n, __webpack_require__.r, __webpack_exports__, __webpack_require__.d, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => /* binding */ Search
/* harmony export */ });
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! axios */ "./node_modules/axios/index.js");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(axios__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _views_base__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../views/base */ "./src/js/views/base.js");




class Search {
    searchByName() {
        let cardName = _views_base__WEBPACK_IMPORTED_MODULE_1__.elements.apiSearch.cardName.value;
        cardName = cardName.replace(' ', '+');

        if (cardName) this.search += cardName;        
    }  
      
    searchByOtext() {
        const oracleText = _views_base__WEBPACK_IMPORTED_MODULE_1__.elements.apiSearch.oracleText.value;

        // If the oracle text includes more than one word, we need to search the terms individually
        if (oracleText.includes(' ') && oracleText.indexOf(' ') !== oracleText.length - 1) {
            let temporaryStr = '';
            const texts = oracleText.split(' ');

            texts.forEach(text => {
                if (text.length > 0) temporaryStr += `oracle%3A${text}+`
            });
            
            this.search += `+%28${temporaryStr.slice(0, -1)}%29`
        }

        else if (oracleText) this.search += `+oracle%3A${oracleText}`;
    }
    
    searchByCardType() {
        const typesToInclude = Array.from(document.querySelectorAll('[data-include-type]'));
        const typesToExclude = Array.from(document.querySelectorAll('[data-exclude-type]'));
        const includePartialTypes = _views_base__WEBPACK_IMPORTED_MODULE_1__.elements.apiSearch.includePartialTypes.checked;
        let temporaryStr = '';

        if (typesToInclude && !includePartialTypes) {
            typesToInclude.forEach(type => {
                this.search += `+type%3A${type.getAttribute('data-include-type')}`;
            })
        }

        if ((typesToInclude.length > 0) && includePartialTypes) {
            typesToInclude.forEach(type => {
                temporaryStr += `type%3A${type.getAttribute('data-include-type')}+OR+`
            })

            temporaryStr = temporaryStr.slice(0, -4);
            this.search += `+%28${temporaryStr}%29`;
        }

        if (typesToExclude) {
            typesToExclude.forEach(type => {
                this.search += `+-type%3A${type.getAttribute('data-exclude-type')}`;
            })
        }

    }
    
    searchByColor() {
        let boxes = _views_base__WEBPACK_IMPORTED_MODULE_1__.elements.apiSearch.colorBoxes;
    
        // Loop through checkboxes to get all colors given
        var colors = '';
        boxes.forEach(box => {
            if(box.checked) colors += box.value;
        })
    
        const sortBy = _views_base__WEBPACK_IMPORTED_MODULE_1__.elements.apiSearch.colorSortBy.value;

        if (colors) this.search += `+color${sortBy}${colors}`;
    }
    
    searchByStats() {
        const statLines = Array.from(document.querySelectorAll(
            '.js--api-stats-wrapper'
        ));

        statLines.forEach(line => {
            const stat = line.querySelector('.js--api-stat').value;
            const sortBy = line.querySelector('.js--api-stat-filter').value;
            const sortValue = line.querySelector('.js--api-stat-value').value;

            if (stat && sortBy && sortValue) {
                this.search += `+${stat}${sortBy}${sortValue}`
            }
        })
    }
    
    searchByFormat() {
        const formatLines = Array.from(document.querySelectorAll(
            '.js--api-format-wrapper'
        ));

        formatLines.forEach(line => {
            const status = line.querySelector('.js--api-legal-status').value;
            const format = line.querySelector('.js--api-format').value;

            if (format && status) this.search += `+${status}%3A${format}`;
        })
    }

    searchBySet() {
        const sets = Array.from(document.querySelectorAll('[data-include-set]'));
        let temporaryStr = '';

        if (sets.length > 0) {
            sets.forEach(s => temporaryStr += `set%3A${s.getAttribute('data-include-set')}+OR+`);

            temporaryStr = temporaryStr.slice(0, -4);
            this.search += `+%28${temporaryStr}%29`;
        }
    }
    
    searchByRarity() {
        const boxes = _views_base__WEBPACK_IMPORTED_MODULE_1__.elements.apiSearch.rarityBoxes;
        var values = [];
        let temporaryStr = '';
    
        // Push all rarities given by the user into the values array
        boxes.forEach(box => {
            if (box.checked) values.push(box.value);
        })
    
        if (values.length > 0) {
            // We need a starter string so we can slice it later %28 is an open parentheses 
            temporaryStr += '%28';
    
            // For every value given by the user we need to add the +OR+
            // to the end for grouping. We will remove the +OR+ from the last
            // iteration of the loop
            values.forEach(value => temporaryStr += `rarity%3A${value}+OR+`);
    
            // Remove the unnecessary +OR+ at the end
            temporaryStr = temporaryStr.slice(0, -4);
    
            // Close the parentheses
            temporaryStr += `%29`;

            this.search += `+${temporaryStr}`;
        }        
    }
    
    searchByCost() {
        const denomination = _views_base__WEBPACK_IMPORTED_MODULE_1__.elements.apiSearch.denomination.value;
        const sortBy = _views_base__WEBPACK_IMPORTED_MODULE_1__.elements.apiSearch.denominationSortBy.value;
        const inputVal = _views_base__WEBPACK_IMPORTED_MODULE_1__.elements.apiSearch.denominationSortValue.value;
        
        if (inputVal) this.search += `+${denomination}${sortBy}${inputVal}`;
    }

    quickSearch() {
        let cardName = _views_base__WEBPACK_IMPORTED_MODULE_1__.elements.nav.searchInput.value;
        cardName = cardName.replace(' ', '+');
        return cardName;
    }

    sortResults() {
        const sortBy = _views_base__WEBPACK_IMPORTED_MODULE_1__.elements.apiSearch.cardSorter.value;
        this.search += `&order=${sortBy}`
    }

    // This method will run each of the individual search methods to build the final search query
    buildSearchQuery() {
        this.searchByName();
        this.searchByOtext();
        this.searchByCardType();
        this.searchByColor();
        this.searchByStats();
        this.searchByFormat();
        this.searchBySet();
        this.searchByRarity();
        this.searchByCost();
        this.sortResults();

        return this.search;
    } 

    resetSearchQuery() {
        this.search = '';
    }

    displayMethod() {
        return _views_base__WEBPACK_IMPORTED_MODULE_1__.elements.apiSearch.displayAs.value;
    }

    // Retuns the first page of cards
    async getCards(state) {
        return new Promise((resolve, reject) => {
            axios__WEBPACK_IMPORTED_MODULE_0___default().get(`https://api.scryfall.com/cards/search?q=${state.query}`)
            .then(res => {
                // Update the search
                this.results = res.data;
                this.cards = res.data.data;

                // Store the cards in the allCards array
                state.allCards.push(res.data.data)
                resolve();
            })
            .catch(err => {
                if (err.response.status === 404) {
                    state.allCards.push(404);
                    resolve();
                }
            });
        })
    }

    // Used by getAllCards to get each array of 175 cards
    async loopNextPage(state, enableBtn) {
        return new Promise((resolve, reject) => {
            axios__WEBPACK_IMPORTED_MODULE_0___default().get(this.results.next_page)
            .then(res => {
                // Update the results object
                this.results = res.data

                // Push the cards from this result into the allCards array
                state.allCards.push(res.data.data);

                // Enable the next page btn and resolve the promise
                enableBtn(_views_base__WEBPACK_IMPORTED_MODULE_1__.elements.resultsPage.nextPageBtn);
                resolve();
            })
        })
    }

    // Will run in the background after the first set of cards is retrieved to make moving between results
    // pages faster
    async getAllCards(state, enableBtn) {
        // As long as there is a next_page keep loading the cards
        while (this.results.next_page) await this.loopNextPage(state, enableBtn)

        // Update the state once all cards have been retreieved
        state.allResultsLoaded = true;

        // If there is at least 2 pages of cards, enable the last page btn.
        if (state.allCards.length > 1) enableBtn(_views_base__WEBPACK_IMPORTED_MODULE_1__.elements.resultsPage.lastPageBtn);
    }
}

/***/ }),

/***/ "./src/js/views/base.js":
/*!******************************!*\
  !*** ./src/js/views/base.js ***!
  \******************************/
/*! namespace exports */
/*! export elements [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__.r, __webpack_exports__, __webpack_require__.d, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "elements": () => /* binding */ elements
/* harmony export */ });
const elements = {
    nav: {
        quickSearchBtn: document.querySelector('.js--nav-search'),
        searchInput: document.querySelector('.js--nav-search-input'),
    },
    apiSearch: {
        cardName: document.querySelector('.js--api-card-name'),
        oracleText: document.querySelector('.js--api-o-text'),
        typeLine: document.querySelector('.js--api-type-line'),
        selectedTypes: document.querySelector('.js--api-selected-types'),
        includePartialTypes: document.querySelector('.js--api-type-box'),
        typeDropDown: document.querySelector('.js--api-types-dropdown'),
        colorBoxes: document.querySelectorAll('.js--api-color-box'),
        colorSortBy: document.querySelector('.js--api-color-sorter'),
        stat:document.querySelector('.js--api-stat'),
        statFilter:document.querySelector('.js--api-stat-filter'),
        statValue:document.querySelector('.js--api-stat-value'),
        legalStatus: document.querySelector('.js--api-legal-status'),
        format: document.querySelector('.js--api-format'),
        setInput: document.querySelector('.js--api-set'),
        setDropDown: document.querySelector('.js--api-set-dropdown'),
        selectedSets: document.querySelector('.js--api-selected-sets'),
        block: document.querySelector('.js--api-block'),
        rarityBoxes: document.querySelectorAll('.js--api-rarity-box'),
        denomination: document.querySelector('.js--api-denomination'),
        denominationSortBy: document.querySelector('.js--api-denomination-sort-by'),
        denominationSortValue: document.querySelector('.js--api-denomination-sort-value'),
        cardSorter: document.querySelector('.js--api-results-sorter'),
        displayAs: document.querySelector('.js--api-search-display-selector'),
        submitBtn: document.querySelector('.js--api-btn'),
    },
    resultsPage: {
        resultsContainer: document.querySelector('.js--api-results-display'),
        displaySelector: document.querySelector('.js--results-display-option'),
        sortBy: document.querySelector('.js--results-sort-options'),
        btn: document.querySelector('.js--results-submit-btn'),
        cardChecklist: document.querySelector('.js--card-checklist'),
        imageGrid: document.querySelector('.js--image-grid'),
        displayBar: document.querySelector('.js--api-display-bar'),
        firstPageBtn: document.querySelector('.js--api-first-page'),
        previousPageBtn: document.querySelector('.js--api-previous-page'),
        nextPageBtn: document.querySelector('.js--api-next-page'),
        lastPageBtn: document.querySelector('.js--api-last-page')
    },
    card: {
        manaCostTitleSpan: document.querySelectorAll('.js--card-mana-cost'),
        oracleTexts: document.querySelectorAll('.js--oracle-text-line'),
        legalities: document.querySelectorAll('.js--card-legality'),
        printRows: document.querySelectorAll('.js--card-print-row'),
        prices: document.querySelectorAll('.js--card-price'),
        cardPrintLinks: document.querySelectorAll('.js--card-print-link'),
        front: document.querySelector('.js--front'),
        back: document.querySelector('.js--back'),
        transformBtn: document.querySelector('.js--card-transform'),
    }
};

/***/ }),

/***/ "./src/js/views/cardView.js":
/*!**********************************!*\
  !*** ./src/js/views/cardView.js ***!
  \**********************************/
/*! namespace exports */
/*! export fixCardPrices [provided] [no usage info] [missing usage info prevents renaming] */
/*! export flipToBackSide [provided] [no usage info] [missing usage info prevents renaming] */
/*! export flipToFrontSide [provided] [no usage info] [missing usage info prevents renaming] */
/*! export insertManaCostToCardTextTitle [provided] [no usage info] [missing usage info prevents renaming] */
/*! export insertManaCostToOracleText [provided] [no usage info] [missing usage info prevents renaming] */
/*! export printListHoverEvents [provided] [no usage info] [missing usage info prevents renaming] */
/*! export removeUnderScoreFromLegalStatus [provided] [no usage info] [missing usage info prevents renaming] */
/*! export setPrintLinkHref [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__, __webpack_require__.r, __webpack_exports__, __webpack_require__.d, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "insertManaCostToCardTextTitle": () => /* binding */ insertManaCostToCardTextTitle,
/* harmony export */   "insertManaCostToOracleText": () => /* binding */ insertManaCostToOracleText,
/* harmony export */   "removeUnderScoreFromLegalStatus": () => /* binding */ removeUnderScoreFromLegalStatus,
/* harmony export */   "fixCardPrices": () => /* binding */ fixCardPrices,
/* harmony export */   "setPrintLinkHref": () => /* binding */ setPrintLinkHref,
/* harmony export */   "flipToBackSide": () => /* binding */ flipToBackSide,
/* harmony export */   "flipToFrontSide": () => /* binding */ flipToFrontSide,
/* harmony export */   "printListHoverEvents": () => /* binding */ printListHoverEvents
/* harmony export */ });
/* harmony import */ var _resultsView__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./resultsView */ "./src/js/views/resultsView.js");
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./base */ "./src/js/views/base.js");



const insertManaCostToCardTextTitle = () => {
    const manaCosts = Array.from(_base__WEBPACK_IMPORTED_MODULE_1__.elements.card.manaCostTitleSpan);    

    manaCosts.forEach(cost => {
        cost.innerHTML = (0,_resultsView__WEBPACK_IMPORTED_MODULE_0__.generateManaCostImages)(
            cost.getAttribute('data-mana-cost')
        );
    })
};


const insertManaCostToOracleText = () => {
    const oracleTexts = Array.from(_base__WEBPACK_IMPORTED_MODULE_1__.elements.card.oracleTexts);

    if (oracleTexts.length > 0) {
        oracleTexts.forEach(text => text.innerHTML = (0,_resultsView__WEBPACK_IMPORTED_MODULE_0__.generateManaCostImages)(
            text.innerHTML, 'xs'
        ));
    }    
};


const removeUnderScoreFromLegalStatus = () => {
    const legalities = Array.from(_base__WEBPACK_IMPORTED_MODULE_1__.elements.card.legalities);

    legalities.forEach(legality => {
        if (legality.innerHTML.includes('_')) {
            legality.innerHTML = legality.innerHTML.replace('_', ' ');
        }
    });
};


const fixCardPrices = () => {
    const prices = Array.from(_base__WEBPACK_IMPORTED_MODULE_1__.elements.card.prices);

    prices.forEach(price => {
        if (price.innerHTML.includes('None')) price.innerHTML = '-'
    });
};


const fixDoubleSidedCardName = cardName => {
    if (cardName.includes('/')) {
        cardName = cardName.substring(0, cardName.indexOf('/') - 1)
    }
    return cardName;    
}


const setPrintLinkHref = () => {
    const links = Array.from(_base__WEBPACK_IMPORTED_MODULE_1__.elements.card.cardPrintLinks);

    links.forEach(link => {
        let cardName = link.getAttribute('data-name').replaceAll(' ', '-');
        cardName = fixDoubleSidedCardName(cardName);
        const setCode = link.getAttribute('data-set');

        link.href = `/card/${setCode}/${cardName}`
    });
};


const setDoubleSidedTransition = () => {
    // Checks to see if an inline style has been set for the front of the card.
    // If not, set a transiton. This makes sure we don't set the transiton every
    // time the card is flipped.
    if (!_base__WEBPACK_IMPORTED_MODULE_1__.elements.card.front.getAttribute('style')) {
        _base__WEBPACK_IMPORTED_MODULE_1__.elements.card.front.style.transition = `all .8s ease`;
        _base__WEBPACK_IMPORTED_MODULE_1__.elements.card.back.style.transition = `all .8s ease`;
    }
};


const flipToBackSide = () => {
    // Sets the transition property on both sides of the card the first time the
    // transform button is clicked
    setDoubleSidedTransition();

    // Rotates the card to show the backside.
    _base__WEBPACK_IMPORTED_MODULE_1__.elements.card.front.style.transform = `rotateY(-180deg)`;
    _base__WEBPACK_IMPORTED_MODULE_1__.elements.card.back.style.transform = `rotateY(0)`;

    // Reset the event listener so that on clicking the button it will flip
    // back to the front of the card
    _base__WEBPACK_IMPORTED_MODULE_1__.elements.card.transformBtn.removeEventListener('click', flipToBackSide);
    _base__WEBPACK_IMPORTED_MODULE_1__.elements.card.transformBtn.addEventListener('click', flipToFrontSide);
};


const flipToFrontSide = () => {
    _base__WEBPACK_IMPORTED_MODULE_1__.elements.card.front.style.transform = `rotateY(0)`;
    _base__WEBPACK_IMPORTED_MODULE_1__.elements.card.back.style.transform = `rotateY(180deg)`;

    // Reset the event listener so that on clicking the button it will flip
    // to the backside of the card
    _base__WEBPACK_IMPORTED_MODULE_1__.elements.card.transformBtn.removeEventListener('click', flipToFrontSide);
    _base__WEBPACK_IMPORTED_MODULE_1__.elements.card.transformBtn.addEventListener('click', flipToBackSide);
}


// Create the hover effect on each row that displays the image of the card
const printListHoverEvents = () => {
    // Get the HTML for each table row
    const prints = Array.from(_base__WEBPACK_IMPORTED_MODULE_1__.elements.card.printRows);
 
    prints.forEach(print => {
        print.onmousemove = e => {
            // If the window is smaller than 768 pixels, don't display any images
            if (window.innerWidth < 768) return false;

            // If there is already an image being displayed, remove it from the DOM
            if (document.querySelector('.tooltip')) {
                document.body.removeChild(document.querySelector('.tooltip'));
            };

            // Prep the div.
            const div = document.createElement('div');
            div.className = 'tooltip';

            // The div is styled with position absolute. This code puts it just to the right of the cursor
            div.style.left = e.pageX + 50 + 'px';
            div.style.top = e.pageY - 30 + 'px';

            // Prep the img element
            const img = document.createElement('img');
            img.className = 'tooltip__img';
            img.src = print.getAttribute('data-cardImg');
            
            // Put the img into the div and then append the div directly to the body of the document.
            div.appendChild(img); 
            document.body.appendChild(div);  
            };

        // Remove the img when taking the cursor off the print
        print.onmouseout = e => {
            if (document.querySelector('.tooltip')) {
                document.body.removeChild(document.querySelector('.tooltip'));
            };
        };
    });
};



/***/ }),

/***/ "./src/js/views/resultsView.js":
/*!*************************************!*\
  !*** ./src/js/views/resultsView.js ***!
  \*************************************/
/*! namespace exports */
/*! export changeDisplayAndUrl [provided] [no usage info] [missing usage info prevents renaming] */
/*! export changeSortMethod [provided] [no usage info] [missing usage info prevents renaming] */
/*! export choseSelectMenuDisplay [provided] [no usage info] [missing usage info prevents renaming] */
/*! export choseSelectMenuSort [provided] [no usage info] [missing usage info prevents renaming] */
/*! export disableBtn [provided] [no usage info] [missing usage info prevents renaming] */
/*! export dispalyImages [provided] [no usage info] [missing usage info prevents renaming] */
/*! export display404 [provided] [no usage info] [missing usage info prevents renaming] */
/*! export displayChecklist [provided] [no usage info] [missing usage info prevents renaming] */
/*! export enableBtn [provided] [no usage info] [missing usage info prevents renaming] */
/*! export generateManaCostImages [provided] [no usage info] [missing usage info prevents renaming] */
/*! export updateDisplay [provided] [no usage info] [missing usage info prevents renaming] */
/*! export updateDisplayBar [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__, __webpack_require__.r, __webpack_exports__, __webpack_require__.d, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "dispalyImages": () => /* binding */ dispalyImages,
/* harmony export */   "generateManaCostImages": () => /* binding */ generateManaCostImages,
/* harmony export */   "displayChecklist": () => /* binding */ displayChecklist,
/* harmony export */   "choseSelectMenuSort": () => /* binding */ choseSelectMenuSort,
/* harmony export */   "choseSelectMenuDisplay": () => /* binding */ choseSelectMenuDisplay,
/* harmony export */   "changeSortMethod": () => /* binding */ changeSortMethod,
/* harmony export */   "changeDisplayAndUrl": () => /* binding */ changeDisplayAndUrl,
/* harmony export */   "updateDisplay": () => /* binding */ updateDisplay,
/* harmony export */   "updateDisplayBar": () => /* binding */ updateDisplayBar,
/* harmony export */   "enableBtn": () => /* binding */ enableBtn,
/* harmony export */   "disableBtn": () => /* binding */ disableBtn,
/* harmony export */   "display404": () => /* binding */ display404
/* harmony export */ });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./src/js/views/base.js");


const clearChecklist = () => {
    const checkList = document.querySelector('.js--card-checklist')
    if (checkList) {
        checkList.parentElement.removeChild(checkList);

        // Remove any tool tip images if user was hovering
        const toolTip = document.querySelector('.tooltip')
        if (toolTip) document.body.removeChild(toolTip);
    }
};


const clearImageGrid = () => {
    const grid = document.querySelector('.js--image-grid')
    if (grid) grid.parentElement.removeChild(grid);
};


const clearResults = () => {
    clearChecklist();
    clearImageGrid();   
}


const prepImageContainer = () => {
    const markup = `
        <div class="image-grid js--image-grid"></div>
    `
    _base__WEBPACK_IMPORTED_MODULE_0__.elements.resultsPage.resultsContainer.insertAdjacentHTML('beforeend', markup);
};


const generateSingleSidedCard = card => {
    const a = document.createElement('a');
    const div = document.createElement('div');
    const img = document.createElement('img');

    a.classList = `image-grid__link js--image-grid-link`;
    a.href = `/card/${card.set}/${parseCardName(card.name)}`;

    div.classList = `image-grid__container`;
    img.src = `${card.image_uris.normal}`;
    img.alt = `${card.name}`
    img.classList = `image-grid__image`;
    div.appendChild(img);
    a.appendChild(div);

    document.querySelector('.js--image-grid').insertAdjacentElement('beforeend', a);
}


const showBackSide = card => {
    const front = card.querySelector('.js--image-grid-card-side-front');
    const back = card.querySelector('.js--image-grid-card-side-back');    
    
    front.style.transform = 'rotateY(-180deg)';
    back.style.transform = 'rotateY(0)';

    front.classList.remove('js--showing');
    back.classList.add('js--showing');
}


const showFrontSide = card => {
    const front = card.querySelector('.js--image-grid-card-side-front');
    const back = card.querySelector('.js--image-grid-card-side-back');

    front.style.transform = 'rotateY(0)';
    back.style.transform = 'rotateY(180deg)';

    front.classList.add('js--showing');
    back.classList.remove('js--showing');
}


const flipCard = e => {
    // Prevent the link from going to the card specific page
    e.preventDefault();
    const card = e.target.parentElement;

    const front = card.querySelector('.js--image-grid-card-side-front');

    // If the front is showing, display the backside. Otherwise, display the front
    if (front.classList.contains('js--showing')) showBackSide(card);
    else showFrontSide(card);
}


const generateFlipCardBtn = () => {
    const btn = document.createElement('button');
    btn.classList = 'image-grid__double-btn js--image-grid-flip-card-btn';
    btn.addEventListener('click', e => flipCard(e))

    return btn;
}


const generateDoubleSidedCard = card => {
    const a = document.createElement('a');
    const outerDiv = document.createElement('div');
    const innerDiv = document.createElement('div');
    const imgFrontSide = document.createElement('img');
    const imgBackSide = document.createElement('img');
    const flipCardBtn = generateFlipCardBtn();

    a.classList = `image-grid__link js--image-grid-link`;
    a.href = `/card/${card.set}/${parseCardName(card.name)}`;

    outerDiv.classList = `image-grid__outer-div`;
    innerDiv.classList = `image-grid__inner-div js--inner-div-${card.name}`;

    imgFrontSide.classList = `image-grid__double image-grid__double--front js--image-grid-card-side-front js--showing`;
    imgFrontSide.src = card.card_faces[0].image_uris.normal;
    imgFrontSide.alt = card.name;

    imgBackSide.classList = `image-grid__double image-grid__double--back js--image-grid-card-side-back`;
    imgBackSide.src = card.card_faces[1].image_uris.normal;
    imgBackSide.alt = card.card_faces[1].name;

    a.appendChild(outerDiv);
    outerDiv.appendChild(innerDiv);
    innerDiv.appendChild(imgBackSide);
    innerDiv.appendChild(imgFrontSide);
    innerDiv.appendChild(flipCardBtn);

    document.querySelector('.js--image-grid').insertAdjacentElement('beforeend', a);
}


const generateImageGrid = cards => {
    cards.forEach(card => {
        // For single sided cards
        if (card.image_uris) generateSingleSidedCard(card);

        // Double sided cards
        else generateDoubleSidedCard(card);       
    })
}


// Funciton to be used in index.js. Takes care of all necessary steps to display cards as a images
const dispalyImages = cards => {
    clearResults();
    prepImageContainer();
    generateImageGrid(cards);
}

 
const prepChecklistContainer = () => {
    const markup = `
        <table class="card-checklist js--card-checklist">
            <thead>
                <tr class="card-checklist__row card-checklist__row--header">
                    <th class="card-checklist__data">Set</th>
                    <th class="card-checklist__data">Name</th>
                    <th class="card-checklist__data">Cost</th>
                    <th class="card-checklist__data">Type</th>
                    <th class="card-checklist__data">Rarity</th>
                    <th class="card-checklist__data">Artist</th>
                    <th class="card-checklist__data">Price</th>
                </tr>
            </thead>
            <tbody class="js--card-checklist-body"></tbody>
        </table>
        `
    _base__WEBPACK_IMPORTED_MODULE_0__.elements.resultsPage.resultsContainer.insertAdjacentHTML('beforeend', markup);
}

const generateManaCostImages = (manaCost, size='small') => {
    // If there is no mana cost associated with the card, then return an empty string to leave the row empty
    if (!manaCost) return '';

    // Regular expressions to find each set of curly braces {}
    let re = /\{(.*?)\}/g

    // Parse the strings and get all matches
    let matches = manaCost.match(re);

    // If there are any matches, loop through and replace each set of curly braces with the 
    // html span that correspons to mana.css to render the correct image
    if (matches) {
        matches.forEach(m => {
            const regex = new RegExp(`\{(${m.slice(1, -1)})\}`, 'g');
            // This will be the string used to get the right class from mana.css
            // We want to take everything inside the brackets, and if there is a /
            // remove it.
            const manaIconStr = m.slice(1, -1).toLowerCase().replace('/', '')
            manaCost = manaCost.replace(
                regex, 
                `<span class="mana ${size} s${manaIconStr}"></span>`
            )
        })
    }

    return manaCost;
}

const shortenTypeLine = type => {
    // If no type is given, return an empty string
    if (!type) return '';

    // if the — delimiter is found in the string, return everything before the delimiter
    if (type.indexOf('—') !== -1) return type.substring(0, type.indexOf('—') - 1);

    // If there is no delimiter, return the type as given in the card object
    return type;    
}

const parseCardName = cardName => {
    if (cardName.indexOf('/') !== -1) {
        return cardName.slice(0, (cardName.indexOf('/') - 1)).replaceAll(' ', '-');
    }

    return cardName.replaceAll(' ', '-');
}

const generateChecklist = cards => {
    // The ctr and isRowGrey function are used to set a class on every other row so it can 
    // be styled grey
    let ctr = 0
    const isRowGrey = ctr => (ctr % 2 === 0 ? 'card-checklist__row--grey' : '')   

    // Create a new table row for each card object
    cards.forEach(card => {
        const cardNameForUrl = parseCardName(card.name);

        const markup = `
            <tr class="js--checklist-row ${isRowGrey(ctr)} card-checklist__row data-component="card-tooltip" data-card-img=${checkForImg(card)}>
                <td class="card-checklist__data card-checklist__data--set"><a href="/card/${card.set}/${cardNameForUrl}" class="card-checklist__data-link card-checklist__data-link--center">${card.set}</a></td>
                <td class="card-checklist__data"><a href="/card/${card.set}/${cardNameForUrl}" class="card-checklist__data-link card-checklist__data-link--start">${card.name}</a></td>
                <td class="card-checklist__data"><a href="/card/${card.set}/${cardNameForUrl}" class="card-checklist__data-link card-checklist__data-link--center">${generateManaCostImages(checkForManaCost(card))}</a></td>
                <td class="card-checklist__data"><a href="/card/${card.set}/${cardNameForUrl}" class="card-checklist__data-link card-checklist__data-link--center">${shortenTypeLine(card.type_line)}</a></td>
                <td class="card-checklist__data card-checklist__data--rarity"><a href="/card/${card.set}/${cardNameForUrl}" class="card-checklist__data-link card-checklist__data-link--center">${card.rarity}</a></td>
                <td class="card-checklist__data"><a href="/card/${card.set}/${cardNameForUrl}" class="card-checklist__data-link card-checklist__data-link--center">${card.artist}</a></td>
                <td class="card-checklist__data"><a href="/card/${card.set}/${cardNameForUrl}" class="card-checklist__data-link card-checklist__data-link--center">${card.prices.usd}</a></td>
            </tr>
            `
        // Put the row in the table
        document.querySelector('.js--card-checklist-body').insertAdjacentHTML('beforeend', markup);

        // Increment the ctr
        ctr ++;
    })
}

const checkForManaCost = card => {
    if (card.mana_cost) {
        return card.mana_cost;
    } else if (card.card_faces) {
        return card.card_faces[0].mana_cost;
    }
}

const checkForImg = card => {
    if (card.image_uris) return card.image_uris.normal;

    // If there is no card.image_uris, then it's a double sided card. In this
    // case we want to display the image from face one of the card.
    else return card.card_faces[0].image_uris.normal;
}


// Create the hover effect on each row that displays the image of the card
const checkListHoverEvents = () => {
    // Get the HTML for each table row
    const rows = Array.from(document.querySelectorAll('.js--checklist-row'));
 
    rows.forEach(row => {
        row.onmousemove = e => {
            // If the window is smaller than 768 pixels, don't display any images
            if (window.innerWidth < 768) return false;

            // If there is already an image being displayed, remove it from the DOM
            if (document.querySelector('.tooltip')) {
                document.body.removeChild(document.querySelector('.tooltip'));
            }

            // Prep the div.
            const div = document.createElement('div');
            div.className = 'tooltip';

            // The div is styled with position absolute. This code puts it just to the right of the cursor
            div.style.left = e.pageX + 50 + 'px';
            div.style.top = e.pageY - 30 + 'px';

            // Prep the img element
            const img = document.createElement('img');
            img.className = 'tooltip__img';
            img.src = row.dataset.cardImg;
            
            // Put the img into the div and then append the div directly to the body of the document.
            div.appendChild(img); 
            document.body.appendChild(div);  
            }

        // Remove the img when taking the cursor off the row
        row.onmouseout = e => {
            if (document.querySelector('.tooltip')) {
                document.body.removeChild(document.querySelector('.tooltip'));
            }
        }
    })
}


// Funciton to be used in index.js. Takes care of all necessary steps to display cards as a checklist
const displayChecklist = cards => {
    clearResults();
    prepChecklistContainer();
    generateChecklist(cards);
    checkListHoverEvents();
}


const choseSelectMenuSort = (menu, state) => {
    // Create an array from the HTML select menu
    const options = Array.from(menu)

    options.forEach((option, i) => {
        // If the option value matches the sort method from the URL, set it to the selected item
        if (option.value === state.sortMethod) menu.selectedIndex = i;
    })
}


const choseSelectMenuDisplay = (menu, state) => {
    // Create an array from the HTML select menu
    const options = Array.from(menu)

    options.forEach((option, i) => {
        // If the option value matches the sort method from the URL, set it to the selected item
        if (option.value === state.display) menu.selectedIndex = i;
    })
}


// Function to change the sort method based on the input from the user
const changeSortMethod = state => {
    // Get the current sort method from the end of the URL
    const currentSortMethod = window.location.pathname.substring(
        window.location.pathname.lastIndexOf('=') + 1
    );    

    // Grab the desired sort method from the user
    const newSortMethod = _base__WEBPACK_IMPORTED_MODULE_0__.elements.resultsPage.sortBy.value;

    // If the new sort method is not different, exit the function as to not push a new state
    if (currentSortMethod === newSortMethod) {
        return;
    } else {        
        // Disable all four buttons
        // Only doing this because firefox requires a ctrl f5
        disableBtn(_base__WEBPACK_IMPORTED_MODULE_0__.elements.resultsPage.firstPageBtn);
        disableBtn(_base__WEBPACK_IMPORTED_MODULE_0__.elements.resultsPage.nextPageBtn);
        disableBtn(_base__WEBPACK_IMPORTED_MODULE_0__.elements.resultsPage.previousPageBtn);
        disableBtn(_base__WEBPACK_IMPORTED_MODULE_0__.elements.resultsPage.lastPageBtn);

        const currentPathName = window.location.pathname.substring(
            0, window.location.pathname.lastIndexOf('=') + 1
        );

        window.location.href = currentPathName + newSortMethod;                
    }
}


const changeDisplayAndUrl = state => {
    const currentMethod = state.display;
    const newMethod = _base__WEBPACK_IMPORTED_MODULE_0__.elements.resultsPage.displaySelector.value;

    if (newMethod === currentMethod) return;

    // Update the state with new display method
    state.display = newMethod;

    // Update the url without pushing to the server
    const title = document.title;
    const pathName = `/results/${newMethod}/${state.query}`
    history.pushState({
        currentIndex: state.currentIndex,
        display: state.display,
    }, title, pathName);

}


const updateDisplay = state => {
    // Clear any existing HTML in the display
    clearResults();

    // Refresh the display
    if (state.display === 'list') displayChecklist(state.allCards[state.currentIndex]);
    if (state.display === 'images') dispalyImages(state.allCards[state.currentIndex]);
}


// ********************************************** \\
// *************** PAGINATION ******************* \\
// ********************************************** \\

// Will be called during changing pages. Removes the current element in the bar
const clearDisplayBar = () => {
    const displayBarText = document.querySelector('.js--display-bar-text')
    if (displayBarText) displayBarText.parentElement.removeChild(displayBarText);
}    


// Keeps track of where the user is in there list of cards
const paginationTracker = state => {
    var beg, end;
    beg = ((state.currentIndex + 1) * 175) - 174; 
    end = ((state.currentIndex) * 175) + state.allCards[state.currentIndex].length

    return { beg, end };
}


const updateDisplayBar = state => {
    const markup = `
        <p class="api-results-display__display-bar-text js--display-bar-text">
            Displaying ${paginationTracker(state).beg} - ${paginationTracker(state).end} of ${state.search.results.total_cards} cards
        </p>
    `

    clearDisplayBar();
    _base__WEBPACK_IMPORTED_MODULE_0__.elements.resultsPage.displayBar.insertAdjacentHTML('beforeend', markup);
}


const enableBtn = btn => {
    if (btn.disabled) {
        btn.classList.remove('api-results-display__nav-pagination-container--disabled');
        btn.disabled = false;
    }
}


const disableBtn = btn => {
    if (!btn.disabled) {
        btn.classList.add('api-results-display__nav-pagination-container--disabled');
        btn.disabled = true;
    }
}


// ********************************************** \\
// ********************* 404 ******************** \\
// ********************************************** \\

const display404 = () => {
    const div = create404Message();
    _base__WEBPACK_IMPORTED_MODULE_0__.elements.resultsPage.resultsContainer.appendChild(div);
}

const create404Div = () => {
    const div = document.createElement('div');
    div.classList = `no-results`
    return div;
}

const create404h3 = () => {
    const h3 = document.createElement('h3');
    h3.classList = `no-results__h3`;
    h3.innerHTML = `No cards found`;
    return h3;
}

const create404pElement = () => {
    const p = document.createElement('p');
    p.classList = `no-results__p`
    p.innerHTML = 'Your search didn\'t match any cards. Go back to the search page and edit your search';
    return p;    
}

const create404Btn = () => {
    const btn = document.createElement('a');
    btn.classList = `btn no-results__btn`
    btn.href = '/search';
    btn.innerHTML = 'Go Back';
    return btn;
}

const create404Message = () => {
    const div = create404Div();
    const h3 = create404h3();
    const p = create404pElement();
    const btn = create404Btn();

    div.appendChild(h3);
    div.appendChild(p);
    div.appendChild(btn);

    return div;
}


/***/ }),

/***/ "./src/js/views/searchView.js":
/*!************************************!*\
  !*** ./src/js/views/searchView.js ***!
  \************************************/
/*! namespace exports */
/*! export filterSetHeaders [provided] [no usage info] [missing usage info prevents renaming] */
/*! export filterSets [provided] [no usage info] [missing usage info prevents renaming] */
/*! export filterTypeHeaders [provided] [no usage info] [missing usage info prevents renaming] */
/*! export filterTypes [provided] [no usage info] [missing usage info prevents renaming] */
/*! export formatLineController [provided] [no usage info] [missing usage info prevents renaming] */
/*! export hideTypesDropDown [provided] [no usage info] [missing usage info prevents renaming] */
/*! export setInputListener [provided] [no usage info] [missing usage info prevents renaming] */
/*! export showSetsDropDown [provided] [no usage info] [missing usage info prevents renaming] */
/*! export showTypesDropDown [provided] [no usage info] [missing usage info prevents renaming] */
/*! export startSetsDropDownNavigation [provided] [no usage info] [missing usage info prevents renaming] */
/*! export startTypesDropDownNavigation [provided] [no usage info] [missing usage info prevents renaming] */
/*! export statLineController [provided] [no usage info] [missing usage info prevents renaming] */
/*! export typeLineListener [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__, __webpack_require__.r, __webpack_exports__, __webpack_require__.d, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "showTypesDropDown": () => /* binding */ showTypesDropDown,
/* harmony export */   "hideTypesDropDown": () => /* binding */ hideTypesDropDown,
/* harmony export */   "filterTypeHeaders": () => /* binding */ filterTypeHeaders,
/* harmony export */   "filterTypes": () => /* binding */ filterTypes,
/* harmony export */   "startTypesDropDownNavigation": () => /* binding */ startTypesDropDownNavigation,
/* harmony export */   "typeLineListener": () => /* binding */ typeLineListener,
/* harmony export */   "showSetsDropDown": () => /* binding */ showSetsDropDown,
/* harmony export */   "filterSetHeaders": () => /* binding */ filterSetHeaders,
/* harmony export */   "filterSets": () => /* binding */ filterSets,
/* harmony export */   "startSetsDropDownNavigation": () => /* binding */ startSetsDropDownNavigation,
/* harmony export */   "setInputListener": () => /* binding */ setInputListener,
/* harmony export */   "statLineController": () => /* binding */ statLineController,
/* harmony export */   "formatLineController": () => /* binding */ formatLineController
/* harmony export */ });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./src/js/views/base.js");



// ******************************* \\
// ********** TYPE LINE ********** \\
// ******************************* \\

const showTypesDropDown = () => {
    if (_base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.typeDropDown.hasAttribute('hidden')) {            
        _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.typeDropDown.removeAttribute('hidden');
        _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.typeDropDown.scrollTop = 0;

        // Make sure to display all types when opening the dropdown and before taking input
        filterTypes('');
        filterSelectedTypes();
        filterTypeHeaders();
    }
}

const hideTypesDropDown = () => {
    if (!_base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.typeDropDown.hasAttribute('hidden')) {
        _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.typeLine.value = '';
        _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.typeDropDown.setAttribute('hidden', 'true');        
        document.removeEventListener('keydown', navigateTypesDropDown);
    }
}

const filterTypeHeaders = () => {
    // On every input into the typeline bar, make all headers visible
    const headers = Array.from(document.querySelectorAll('.js--types-category-header'));
    headers.forEach(header => {
        if (header.hasAttribute('hidden')) header.removeAttribute('hidden')
    })

    // For each category of type, if there are not any visible because they were filtered out
    // hide the header for that category    
    if (!document.querySelector('.js--basic:not([hidden])')) {
        document.querySelector('.js--basic-header').setAttribute('hidden', 'true');
    }

    if (!document.querySelector('.js--super:not([hidden])')) {
        document.querySelector('.js--super-header').setAttribute('hidden', 'true');
    }

    if (!document.querySelector('.js--artifact:not([hidden])')) {
        document.querySelector('.js--artifact-header').setAttribute('hidden', 'true');
    }

    if (!document.querySelector('.js--enchantment:not([hidden])')) {
        document.querySelector('.js--enchantment-header').setAttribute('hidden', 'true');
    }

    if (!document.querySelector('.js--land:not([hidden])')) {
        document.querySelector('.js--land-header').setAttribute('hidden', 'true');
    }

    if (!document.querySelector('.js--spell:not([hidden])')) {
        document.querySelector('.js--spell-header').setAttribute('hidden', 'true');
    }

    if (!document.querySelector('.js--planeswalker:not([hidden])')) {
        document.querySelector('.js--planeswalker-header').setAttribute('hidden', 'true');
    }

    if (!document.querySelector('.js--creature:not([hidden])')) {
        document.querySelector('.js--creature-header').setAttribute('hidden', 'true');
    }
};

const filterSelectedTypes = () => {
    const types = Array.from(document.querySelectorAll(
        '[data-type][data-selected]'
    ));

    types.forEach(type => {
        if (type.getAttribute('data-selected') === 'true') {
            if (!type.hasAttribute('hidden')) type.setAttribute(
                'hidden', 'true'
            )
        }
    })
};

const filterTypes = str => {
    const types = Array.from(document.querySelectorAll('[data-type]'));

    // Remove the hidden attribute if it exists on any element, and then hide any elements
    // that don't include the string given in the input from the user
    types.forEach(type => {
        if (type.hasAttribute('hidden')) type.removeAttribute('hidden');
        if (!type.getAttribute('data-type').toLowerCase().includes(str.toLowerCase())) {
            type.setAttribute('hidden', 'true');
        }
    })    

    filterSelectedTypes();
}

const highlightType = type => {
    if (document.querySelector('.js--highlighted')) removeCurrentHighlight();

    if (type) {
        type.classList.add(
            'js--highlighted', 'search-form__dropdown-list-option--highlighted'
        );
    }
};

const removeCurrentHighlight = () => {
    document.querySelector('.js--highlighted').classList.remove(
        'js--highlighted', 'search-form__dropdown-list-option--highlighted'
    );
};

const setScrollTopOnDownArrow = (el, dropdown) => {
    if (el.offsetTop > dropdown.offsetHeight - el.offsetHeight &&
      dropdown.scrollTop + dropdown.offsetHeight - el.offsetHeight < el.offsetTop) {
        dropdown.scrollTop = el.offsetTop - 
          dropdown.offsetHeight + el.offsetHeight;
    }
}

const setScrollTopOnUpArrow = (el, dropdown) => {
    if (el.offsetTop < dropdown.scrollTop) {
        dropdown.scrollTop = el.offsetTop;

        // 30 is the height of category headers. If the category header is 
        // the only element left that is not revealed, set teh scroll top to 0
        if (dropdown.scrollTop <= 30) dropdown.scrollTop = 0;
    }
}

const navigateTypesDropDown = e => {
    const types = Array.from(document.querySelectorAll('.js--type:not([hidden])'));
    const i = types.indexOf(document.querySelector('.js--highlighted'));

    if (e.code === 'ArrowDown' && i < types.length - 1) {
        e.preventDefault();
        removeCurrentHighlight();
        highlightType(types[i + 1]);

        setScrollTopOnDownArrow(types[i + 1], _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.typeDropDown);
    }

    if (e.code === 'ArrowUp') {
        e.preventDefault();
        
        // We always want to prevent the default. We only want to change the
        // highlight if not on the top type in the dropdown
        if (i > 0) {
            removeCurrentHighlight()
            highlightType(types[i - 1]);
    
            setScrollTopOnUpArrow(
                types[i - 1], _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.typeDropDown
            );
        }
    }

    if (e.code === 'Enter') {
        e.preventDefault();

        toggleDataSelected(document.querySelector('.js--highlighted'));
        addType(document.querySelector('.js--highlighted').getAttribute('data-type'));
        hideTypesDropDown();
    }
}

const hoverOverTypesListener = () => {
    const types = Array.from(document.querySelectorAll('.js--type:not([hidden])'));

    types.forEach(type => {
        type.addEventListener('mouseenter', () => highlightType(type));
    })
}

const startTypesDropDownNavigation = () => {
    document.removeEventListener('keydown', navigateTypesDropDown);
    const firstType = document.querySelector('.js--type:not([hidden])');
    highlightType(firstType);
    hoverOverTypesListener();
    document.addEventListener('keydown', navigateTypesDropDown);
    _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.typeDropDown.scrollTop = 0;
}

const removeTypeBtn = () => {
    // Span will act as the button to remove types from the "selected" list
    const btn = document.createElement('span');
    btn.classList = 'search-form__selected-types-remove-btn js--api-types-close-btn';
    btn.innerHTML = 'x';

    btn.onclick = () => {
        const typeName = btn.nextElementSibling.nextElementSibling.innerHTML;
        
        const typeToToggle = document.querySelector(`[data-type|=${typeName}]`)

        toggleDataSelected(typeToToggle);

        btn.parentElement.parentElement.removeChild(btn.parentElement)
    }

    return btn;
}

const typeToggleBtn = () => {
    // Span will act as the button to toggle whether or not a type is included or excluded from the search
    const btn = document.createElement('span');
    btn.classList = 'search-form__selected-types-toggler search-form__selected-types-toggler--is js--api-types-toggler';
    btn.innerHTML = 'IS';

    /*
        This will toggle between searching for cards that include the given type and exclude the given type.
        It will make sure that the appropriate data type is given to the span element that contains the type
        So that the search functionality creates the appropriate query string

    */
    btn.onclick = () => {
        if (btn.innerHTML === 'IS') {
            btn.classList = 'search-form__selected-types-toggler search-form__selected-types-toggler--not js--api-types-toggler';
            btn.nextElementSibling.removeAttribute('data-include-type');
            btn.nextElementSibling.setAttribute('data-exclude-type', btn.nextElementSibling.innerHTML);
            btn.innerHTML = 'NOT';
        } else {
            btn.classList = 'search-form__selected-types-toggler search-form__selected-types-toggler--is js--api-types-toggler';
            btn.nextElementSibling.removeAttribute('data-exclude-type');
            btn.nextElementSibling.setAttribute('data-include-type', btn.nextElementSibling.innerHTML);
            btn.innerHTML = 'IS';
        }
    }

    return btn;
}

const toggleDataSelected = typeOrSet => {
    if (typeOrSet.getAttribute('data-selected') === 'true') {
        typeOrSet.setAttribute('data-selected', 'false')
    } else {
        typeOrSet.setAttribute('data-selected', 'true')
    }

}

const addType = type => {
    // Create the empty li element to hold the types that the user selects. Set the class list,
    // and the data-selected attribute to true.
    const li = document.createElement('li');
    li.classList = 'search-form__selected-types-list-item js--api-selected-type';

    // The typeSpan holds the type selected by the user from the dropdown. The data attribute
    // is used in Search.js to build the query string
    const typeSpan = document.createElement('span');
    typeSpan.setAttribute('data-include-type', type);
    typeSpan.innerHTML = type;

    // Construct the li element. The removeTypeBtn and typeToggleBtn funcitons return html elements
    li.appendChild(removeTypeBtn());
    li.appendChild(typeToggleBtn());
    li.appendChild(typeSpan);

    _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.selectedTypes.appendChild(li);
}

const typeLineListener = e => {
    // If the target is not Type Line input line, or an element in the dropdown list, 
    // close the dropdown and remove the event listener
    if (e.target !== _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.typeLine && !e.target.matches('.js--api-dropdown-types-list')) {
        hideTypesDropDown();     
        document.removeEventListener('click', typeLineListener)  
    // If the target is one if types, get the data type
    } else if (e.target.hasAttribute('data-type')) {
        toggleDataSelected(e.target);
        addType(e.target.getAttribute('data-type'));
        _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.typeLine.focus();
        hideTypesDropDown();

    }
}

// ******************************* \\
// ************* SETS ************ \\
// ******************************* \\

const showSetsDropDown = () => {
    if (_base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.setDropDown.hasAttribute('hidden')) {
        _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.setDropDown.removeAttribute('hidden');
        _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.setDropDown.scrollTop = 0;

        filterSets('');
        filterSelectedSets();
        filterSetHeaders();
    }
}

const hideSetsDropDown = () => {
    if (!_base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.setDropDown.hasAttribute('hidden')) {
        _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.setDropDown.setAttribute('hidden', 'true');
        _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.setInput.value = '';
        document.removeEventListener('keydown', navigateSetsDropDown);
    }
}

const filterSetHeaders = () => {
    // On every input into the typeline bar, make all headers visible
    const headers = Array.from(document.querySelectorAll('.js--sets-category-header'));
    headers.forEach(header => {
        if (header.hasAttribute('hidden')) header.removeAttribute('hidden')
    })

    // For each category of type, if there are not any visible because they were filtered out
    // hide the header for that category     
    if (!document.querySelector('.js--expansion:not([hidden])')) {
        document.querySelector('.js--expansion-header').setAttribute('hidden', 'true');
    }

    if (!document.querySelector('.js--core:not([hidden])')) {
        document.querySelector('.js--core-header').setAttribute('hidden', 'true');
    }

    if (!document.querySelector('.js--masters:not([hidden])')) {
        document.querySelector('.js--masters-header').setAttribute('hidden', 'true');
    }

    if (!document.querySelector('.js--draft:not([hidden])')) {
        document.querySelector('.js--draft-header').setAttribute('hidden', 'true');
    }

    if (!document.querySelector('.js--duel_deck:not([hidden])')) {
        document.querySelector('.js--duel_deck-header').setAttribute('hidden', 'true');
    }

    if (!document.querySelector('.js--archenemy:not([hidden])')) {
        document.querySelector('.js--archenemy-header').setAttribute('hidden', 'true');
    }

    if (!document.querySelector('.js--box:not([hidden])')) {
        document.querySelector('.js--box-header').setAttribute('hidden', 'true');
    }

    if (!document.querySelector('.js--commander:not([hidden])')) {
        document.querySelector('.js--commander-header').setAttribute('hidden', 'true');
    }

    if (!document.querySelector('.js--vault:not([hidden])')) {
        document.querySelector('.js--vault-header').setAttribute('hidden', 'true');
    }

    if (!document.querySelector('.js--funny:not([hidden])')) {
        document.querySelector('.js--funny-header').setAttribute('hidden', 'true');
    }

    if (!document.querySelector('.js--masterpiece:not([hidden])')) {
        document.querySelector('.js--masterpiece-header').setAttribute('hidden', 'true');
    }

    if (!document.querySelector('.js--memorabilia:not([hidden])')) {
        document.querySelector('.js--memorabilia-header').setAttribute('hidden', 'true');
    }

    if (!document.querySelector('.js--planechase:not([hidden])')) {
        document.querySelector('.js--planechase-header').setAttribute('hidden', 'true');
    }

    if (!document.querySelector('.js--premium_deck:not([hidden])')) {
        document.querySelector('.js--premium_deck-header').setAttribute('hidden', 'true');
    }

    if (!document.querySelector('.js--promo:not([hidden])')) {
        document.querySelector('.js--promo-header').setAttribute('hidden', 'true');
    }

    if (!document.querySelector('.js--spellbook:not([hidden])')) {
        document.querySelector('.js--spellbook-header').setAttribute('hidden', 'true');
    }

    if (!document.querySelector('.js--starter:not([hidden])')) {
        document.querySelector('.js--starter-header').setAttribute('hidden', 'true');
    }

    if (!document.querySelector('.js--token:not([hidden])')) {
        document.querySelector('.js--token-header').setAttribute('hidden', 'true');
    }

    if (!document.querySelector('.js--treasure_chest:not([hidden])')) {
        document.querySelector('.js--treasure_chest-header').setAttribute('hidden', 'true');
    }

    if (!document.querySelector('.js--vanguard:not([hidden])')) {
        document.querySelector('.js--vanguard-header').setAttribute('hidden', 'true');
    }
}

const filterSets = str => {
    // get all of the sets out of the dropdown list
    const sets = Array.from(document.querySelectorAll('[data-set-name]'));

    // Remove the hidden attribute if it exists on any element, and then hide any elements
    // that don't include the string given in the input from the user
    sets.forEach(s => {        
        if (s.hasAttribute('hidden')) s.removeAttribute('hidden');

        filterSelectedSets();

        if (!s.getAttribute('data-set-name').toLowerCase().includes(str.toLowerCase()) &&
          !s.getAttribute('data-set-code').toLowerCase().includes(str.toLowerCase())) {            
            s.setAttribute('hidden', 'true');
        }
    })
}

const filterSelectedSets = () => {
    const sets = Array.from(document.querySelectorAll('[data-set-name][data-selected]'));

    sets.forEach(s => {
        if (s.getAttribute('data-selected') === 'true') {
            if (!s.hasAttribute('hidden')) s.setAttribute('hidden', 'true');
        }
    })
}

const highlightSet = sett => {
    if (document.querySelector('.js--highlighted')) removeCurrentHighlight();

    if (sett) {
        sett.classList.add(
            'js--highlighted', 'search-form__dropdown-list-option--highlighted'
        );
    }
};

const navigateSetsDropDown = e => {
    const sets = Array.from(document.querySelectorAll('.js--set:not([hidden])'));
    const i = sets.indexOf(document.querySelector('.js--highlighted'));

    if (e.code === 'ArrowDown' && i < sets.length - 1) {
        e.preventDefault();
        removeCurrentHighlight()
        highlightSet(sets[i + 1]);

        setScrollTopOnDownArrow(sets[i + 1], _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.setDropDown);
    }

    if (e.code === 'ArrowUp' && i > 0) {
        e.preventDefault();
        removeCurrentHighlight()
        highlightSet(sets[i - 1]);

        setScrollTopOnUpArrow(sets[i - 1], _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.setDropDown);
    }

    if (e.code === 'Enter') {
        e.preventDefault();

        toggleDataSelected(document.querySelector('.js--highlighted'));
        addSet(
            document.querySelector('.js--highlighted').getAttribute('data-set-name'),
            document.querySelector('.js--highlighted').getAttribute('data-set-code')
        );
        hideSetsDropDown();
    }
};

const hoverOverSetsListener = () => {
    const sets = Array.from(document.querySelectorAll('.js--set:not([hidden])'));

    sets.forEach(s => {
        s.addEventListener('mouseenter', () => highlightType(s));
    })
}

const startSetsDropDownNavigation = () => {
    const firstSet = document.querySelector('.js--set:not([hidden])');
    highlightSet(firstSet);
    hoverOverSetsListener();
    document.addEventListener('keydown', navigateSetsDropDown);
    _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.setDropDown.scrollTop = 0;
}

const removeSetBtn = () => {
    // Span will act as the button to remove sets from the "selected" list
    const btn = document.createElement('span');
    btn.classList = 'search-form__selected-sets-remove-btn js--api-sets-close-btn';
    btn.innerHTML = 'x';

    btn.onclick = () => {
        const setName = btn.nextElementSibling.innerHTML;        
        const setToToggle = document.querySelector(`[data-set-name|=${setName}]`)
        toggleDataSelected(setToToggle);

        btn.parentElement.parentElement.removeChild(btn.parentElement)
    }

    return btn;
}

const addSet = (setName, setCode) => {
    // Create the empty li element to hold the types that the user selects. Set the class list,
    // and the data-selected attribute to true.
    const li = document.createElement('li');
    li.classList = 'search-form__selected-sets-list-item js--api-selected-set';

    // The typeSpan holds the type selected by the user from the dropdown. The data attribute
    // is used in Search.js to build the query string
    const setSpan = document.createElement('span');
    setSpan.setAttribute('data-include-set', setCode);
    setSpan.innerHTML = setName;

    li.appendChild(removeSetBtn());
    li.appendChild(setSpan);

    _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.selectedSets.appendChild(li);
}

const setInputListener = e => {
    // If the target is not the set input field, or an element in the dropdown list, 
    // close the dropdown and remove the event listener 
    if (e.target !== _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.setInput && 
      !e.target.matches('.js--api-dropdown-sets-list')) {
        hideSetsDropDown();
        document.removeEventListener('click', setInputListener);
    // If the target is one of the set options, toggle it as selected, add it to the list,
    // and hide the dropdown.
    } else if (e.target.hasAttribute('data-set-name')) {
        toggleDataSelected(e.target);
        addSet(
            e.target.getAttribute('data-set-name'),
            e.target.getAttribute('data-set-code')
        );
        _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.setInput.focus();
        hideSetsDropDown();
    }
}

// ******************************* \\
// ************ STATS ************ \\
// ******************************* \\

const statLineController = () => {
    if (checkStatLineForInteger() && checkForLessThanFourStatLines()) {
        const clone = createStatsClone();
        editStatsClone(clone);
        insertStatsClone(clone);
        resetStatLineEventListener();
    }
};

const checkStatLineForInteger = () => {
    const statVal = Array.from(document.querySelectorAll(
        '.js--api-stat-value'
    )).slice(-1)[0];

    return (parseInt(statVal.value) >= 0 ? true : false);
};

const checkForLessThanFourStatLines = () => {
    const stats = Array.from(document.querySelectorAll('.js--api-stat-value'));

    return (stats.length < 4 ? true : false);
};

const createStatsClone = () => {
    return document.querySelector('.js--api-stats-wrapper').cloneNode(true); 
};

const editStatsClone = clone => {
    clone.querySelector('.js--api-stat').value = '';
    clone.querySelector('.js--api-stat-filter').value = '';
    clone.querySelector('.js--api-stat-value').value = '';   
};

const insertStatsClone = clone => {
    const lastStatLine = Array.from(document.querySelectorAll(
        '.js--api-stats-wrapper'
    )).slice(-1)[0];

    lastStatLine.insertAdjacentElement('afterend', clone);
};

const resetStatLineEventListener = () => {
    const statValues = Array.from(
        document.querySelectorAll('.js--api-stat-value')
    );
    statValues.slice(-2)[0].removeEventListener('input', statLineController);
    statValues.slice(-1)[0].addEventListener('input', statLineController);
};

// ******************************* \\
// ********* LEGAL STATUS ******** \\
// ******************************* \\


const formatLineController = () => {
    console.log(checkForFourLessThanFormatLines())
    if (checkForFourLessThanFormatLines() && checkFormatLineForValue()) {
        const clone = createFormatClone();
        editFormatClone(clone);
        insertFormatClone(clone);
        resetFormatLineEventListener();
    }
};

const checkFormatLineForValue = () => {
    const format = Array.from(document.querySelectorAll(
        '.js--api-format'
    )).slice(-1)[0];

    return (format.value !== '' ? true : false);
};

const checkForFourLessThanFormatLines = () => {
    const formats = Array.from(document.querySelectorAll('.js--api-format'));
    return (formats.length < 4 ? true : false);
};

const createFormatClone = () => {
    return document.querySelector('.js--api-format-wrapper').cloneNode(true);
};

const editFormatClone = clone => {
    clone.querySelector('.js--api-legal-status').value = '';
    clone.querySelector('.js--api-format').value = '';
};

const insertFormatClone = clone => {
    const lastFormatLine = Array.from(document.querySelectorAll(
        '.js--api-format-wrapper'
    )).slice(-1)[0];

    lastFormatLine.insertAdjacentElement('afterend', clone);
};

const resetFormatLineEventListener = () => {
    const formats = Array.from(
        document.querySelectorAll('.js--api-format')
    );
    formats.slice(-2)[0].removeEventListener('change', formatLineController);
    formats.slice(-1)[0].addEventListener('change', formatLineController);
};

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => module['default'] :
/******/ 				() => module;
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) scriptUrl = scripts[scripts.length - 1].src
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	// startup
/******/ 	// Load entry module
/******/ 	__webpack_require__("./src/js/index.js");
/******/ 	// This entry module used 'exports' so it can't be inlined
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9pbmRleC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvYWRhcHRlcnMveGhyLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9heGlvcy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbFRva2VuLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvaXNDYW5jZWwuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvQXhpb3MuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvSW50ZXJjZXB0b3JNYW5hZ2VyLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2J1aWxkRnVsbFBhdGguanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvY3JlYXRlRXJyb3IuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvZGlzcGF0Y2hSZXF1ZXN0LmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2VuaGFuY2VFcnJvci5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9tZXJnZUNvbmZpZy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9zZXR0bGUuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvdHJhbnNmb3JtRGF0YS5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvZGVmYXVsdHMuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYmluZC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9idWlsZFVSTC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9jb21iaW5lVVJMcy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9jb29raWVzLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzQWJzb2x1dGVVUkwuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNVUkxTYW1lT3JpZ2luLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL25vcm1hbGl6ZUhlYWRlck5hbWUuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvcGFyc2VIZWFkZXJzLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3NwcmVhZC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvdXRpbHMuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9zcmMvY3NzL3N0eWxlLmNzcyIsIndlYnBhY2s6Ly9tYWdpYy8uL3NyYy9jc3MvdmVuZG9yL21hbmEuY3NzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9jc3NXaXRoTWFwcGluZ1RvU3RyaW5nLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2dldFVybC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL3NyYy9pbWcvbG9naW4tYmcuanBnIiwid2VicGFjazovL21hZ2ljLy4vc3JjL2ltZy9tYW5hLXN5bWJvbHMvbWFuYS5zdmciLCJ3ZWJwYWNrOi8vbWFnaWMvLi9zcmMvY3NzL3N0eWxlLmNzcz85ZmNkIiwid2VicGFjazovL21hZ2ljLy4vc3JjL2Nzcy92ZW5kb3IvbWFuYS5jc3M/MDcwMiIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL3NyYy9qcy9pbmRleC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL3NyYy9qcy9tb2RlbHMvU2VhcmNoLmpzIiwid2VicGFjazovL21hZ2ljLy4vc3JjL2pzL3ZpZXdzL2Jhc2UuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9zcmMvanMvdmlld3MvY2FyZFZpZXcuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9zcmMvanMvdmlld3MvcmVzdWx0c1ZpZXcuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9zcmMvanMvdmlld3Mvc2VhcmNoVmlldy5qcyIsIndlYnBhY2s6Ly9tYWdpYy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9tYWdpYy93ZWJwYWNrL3J1bnRpbWUvY29tcGF0IGdldCBkZWZhdWx0IGV4cG9ydCIsIndlYnBhY2s6Ly9tYWdpYy93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vbWFnaWMvd2VicGFjay9ydW50aW1lL2dsb2JhbCIsIndlYnBhY2s6Ly9tYWdpYy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL21hZ2ljL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vbWFnaWMvd2VicGFjay9ydW50aW1lL3B1YmxpY1BhdGgiLCJ3ZWJwYWNrOi8vbWFnaWMvd2VicGFjay9zdGFydHVwIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFBQSw0RkFBdUMsQzs7Ozs7Ozs7Ozs7Ozs7QUNBMUI7O0FBRWIsWUFBWSxtQkFBTyxDQUFDLHFEQUFZO0FBQ2hDLGFBQWEsbUJBQU8sQ0FBQyxpRUFBa0I7QUFDdkMsY0FBYyxtQkFBTyxDQUFDLHlFQUFzQjtBQUM1QyxlQUFlLG1CQUFPLENBQUMsMkVBQXVCO0FBQzlDLG9CQUFvQixtQkFBTyxDQUFDLDZFQUF1QjtBQUNuRCxtQkFBbUIsbUJBQU8sQ0FBQyxtRkFBMkI7QUFDdEQsc0JBQXNCLG1CQUFPLENBQUMseUZBQThCO0FBQzVELGtCQUFrQixtQkFBTyxDQUFDLHlFQUFxQjs7QUFFL0M7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw0Q0FBNEM7QUFDNUM7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FB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QU0sVUFBVSxrQkFBa0IsTUFBTSxVQUFVLFlBQVksYUFBYSxhQUFhLGFBQWEsa0JBQWtCLE1BQU0saUJBQWlCLE1BQU0sZUFBZSxNQUFNLFlBQVksV0FBVyxpQkFBaUIsTUFBTSxZQUFZLFdBQVcsaUJBQWlCLE1BQU0sZUFBZSxNQUFNLFVBQVUsWUFBWSxrQkFBa0IsTUFBTSxVQUFVLFlBQVksYUFBYSxhQUFhLGFBQWEsa0JBQWtCLE1BQU0sVUFBVSxlQUFlLE1BQU0sZUFBZSxNQUFNLFVBQVUsZUFBZSxNQUFNLFVBQVUsVUFBVSxpQkFBaUIsTUFBTSxnQkFBZ0IsTUFBTSxVQUFVLFlBQVksa0JBQWtCLE1BQU0sa0JBQWtCLE1BQU0sWUFBWSxXQUFXLFlBQVksbUJBQW1CLE1BQU0sWUFBWSxhQUFhLGlCQUFpQixNQUFNLFVBQVUsa0JBQWtCLE1BQU0sWUFBWSxpQkFBaUIsS0FBSyxZQUFZLFdBQVcsaUJBQWlCLE1BQU0sVUFBVSxrQkFBa0IsTUFBTSxZQUFZLGFBQWEsYUFBYSxhQUFhLFdBQVcsVUFBVSxZQUFZLG1CQUFtQixNQUFNLGlCQUFpQixNQUFNLFVBQVUsVUFBVSxZQUFZLGFBQWEsYUFBYSxrQkFBa0IsTUFBTSxVQUFVLFVBQVUsWUFBWSxrQkFBa0IsTUFBTSxlQUFlLE1BQU0sVUFBVSxZQUFZLGdCQUFnQixLQUFLLFVBQVUsVUFBVSxZQUFZLFdBQVcsWUFBWSxrQkFBa0IsTUFBTSxpQkFBaUIsTUFBTSxVQUFVLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLFVBQVUsVUFBVSxpQkFBaUIsTUFBTSxVQUFVLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLFVBQVUsVUFBVSxpQkFBaUIsTUFBTSxZQUFZLFdBQVcsaUJBQWlCLE1BQU0sVUFBVSxpQkFBaUIsTUFBTSxVQUFVLFlBQVksYUFBYSxrQkFBa0IsTUFBTSxVQUFVLGlCQUFpQixNQUFNLFVBQVUsWUFBWSxhQUFhLFdBQVcsVUFBVSxVQUFVLFlBQVksYUFBYSxrQkFBa0IsTUFBTSxVQUFVLFVBQVUsVUFBVSxZQUFZLGFBQWEsV0FBVyxZQUFZLGtCQUFrQixNQUFNLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLFlBQVksYUFBYSxhQUFhLFdBQVcsVUFBVSxVQUFVLFlBQVksYUFBYSxrQkFBa0IsTUFBTSxpQkFBaUIsTUFBTSxlQUFlLE1BQU0sWUFBWSxXQUFXLGlCQUFpQixNQUFNLGVBQWUsTUFBTSxpQkFBaUIsTUFBTSxZQUFZLGtCQUFrQixNQUFNLFVBQVUsVUFBVSxrQkFBa0IsTUFBTSxrQkFBa0IsTUFBTSxZQUFZLFdBQVcsVUFBVSxZQUFZLFdBQVcsaUJBQWlCLE1BQU0sVUFBVSxpQkFBaUIsTUFBTSxlQUFlLE1BQU0sVUFBVSxpQkFBaUIsTUFBTSxVQUFVLFlBQVksYUFBYSxnQkFBZ0IsTUFBTSxpQkFBaUIsTUFBTSxZQUFZLGtCQUFrQixNQUFNLFVBQVUsZ0JBQWdCLE1BQU0sVUFBVSxZQUFZLGFBQWEsbUJBQW1CLE1BQU0sVUFBVSxpQkFBaUIsTUFBTSxVQUFVLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLFVBQVUsWUFBWSxhQUFhLGFBQWEsYUFBYSxrQkFBa0IsTUFBTSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxVQUFVLFVBQVUsWUFBWSxhQUFhLGFBQWEsV0FBVyxVQUFVLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLGtCQUFrQixNQUFNLFlBQVksV0FBVyxVQUFVLGVBQWUsS0FBSyxVQUFVLGdCQUFnQixNQUFNLFlBQVksV0FBVyxZQUFZLGFBQWEsa0JBQWtCLE1BQU0saUJBQWlCLE1BQU0sWUFBWSxXQUFXLGVBQWUsTUFBTSxVQUFVLFVBQVUsWUFBWSxXQUFXLFVBQVUsWUFBWSxhQUFhLGtCQUFrQixNQUFNLGlCQUFpQixNQUFNLFlBQVksV0FBVyxVQUFVLFVBQVUsVUFBVSxZQUFZLGtCQUFrQixNQUFNLFVBQVUsZUFBZSxNQUFNLFVBQVUsZ0JBQWdCLE1BQU0sVUFBVSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxVQUFVLGVBQWUsTUFBTSxZQUFZLFdBQVcsVUFBVSxpQkFBaUIsTUFBTSxZQUFZLGFBQWEsa0JBQWtCLE1BQU0saUJBQWlCLE1BQU0sWUFBWSxnQkFBZ0IsTUFBTSxVQUFVLFVBQVUsWUFBWSxXQUFXLFVBQVUsWUFBWSxrQkFBa0IsTUFBTSxpQkFBaUIsTUFBTSxZQUFZLFdBQVcsVUFBVSxZQUFZLFdBQVcsaUJBQWlCLE1BQU0sWUFBWSxrQkFBa0IsTUFBTSxVQUFVLGlCQUFpQixNQUFNLFlBQVksYUFBYSxrQkFBa0IsTUFBTSxVQUFVLFVBQVUsWUFBWSxhQUFhLGFBQWEsYUFBYSxrQkFBa0IsTUFBTSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxZQUFZLGtCQUFrQixNQUFNLFlBQVksa0JBQWtCLE1BQU0sWUFBWSxrQkFBa0IsTUFBTSxVQUFVLFlBQVksa0JBQWtCLE1BQU0sVUFBVSxpQkFBaUIsTUFBTSxVQUFVLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLFVBQVUsVUFBVSxZQUFZLGFBQWEsV0FBVyxZQUFZLFdBQVcsWUFBWSxrQkFBa0IsTUFBTSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxVQUFVLGlCQUFpQixNQUFNLFVBQVUsWUFBWSxXQUFXLFlBQVksZ0JBQWdCLEtBQUssaUJBQWlCLE1BQU0sVUFBVSxVQUFVLGlCQUFpQixNQUFNLFVBQVUsaUJBQWlCLE1BQU0saUJBQWlCLE1BQU0saUJBQWlCLE1BQU0sVUFBVSxZQUFZLGFBQWEsV0FBVyxZQUFZLGFBQWEsYUFBYSxrQkFBa0IsTUFBTSxVQUFVLFVBQVUsWUFBWSxXQUFXLFlBQVksYUFBYSxrQkFBa0IsTUFBTSxlQUFlLEtBQUssZUFBZSxNQUFNLGVBQWUsTUFBTSxlQUFlLE1BQU0saUJBQWlCLE1BQU0sWUFBWSxnQkFBZ0IsS0FBSyxVQUFVLFlBQVksZ0JBQWdCLE1BQU0saUJBQWlCLE1BQU0sVUFBVSxZQUFZLGtCQUFrQixNQUFNLGlCQUFpQixNQUFNLGtCQUFrQixNQUFNLFVBQVUsWUFBWSxtQkFBbUIsTUFBTSxZQUFZLGdCQUFnQixLQUFLLFVBQVUsaUJBQWlCLE1BQU0sVUFB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QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRU87QUFDUDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSw4Q0FBOEMsa0VBQStCO0FBQzdFOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhCQUE4QixrRUFBK0I7QUFDN0Q7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSw0RUFBeUM7QUFDN0M7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBLG1FQUFtRSxTQUFTOztBQUU1RTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtB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RUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRTs7Ozs7O1VDNW5CQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0NyQkE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLGdDQUFnQyxZQUFZO1dBQzVDO1dBQ0EsRTs7Ozs7V0NQQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHdDQUF3Qyx5Q0FBeUM7V0FDakY7V0FDQTtXQUNBLEU7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQSxFQUFFO1dBQ0Y7V0FDQTtXQUNBLENBQUMsSTs7Ozs7V0NQRCxzRjs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSxzREFBc0Qsa0JBQWtCO1dBQ3hFO1dBQ0EsK0NBQStDLGNBQWM7V0FDN0QsRTs7Ozs7V0NOQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxrQzs7OztVQ2ZBO1VBQ0E7VUFDQTtVQUNBIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvYXhpb3MnKTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBzZXR0bGUgPSByZXF1aXJlKCcuLy4uL2NvcmUvc2V0dGxlJyk7XG52YXIgY29va2llcyA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9jb29raWVzJyk7XG52YXIgYnVpbGRVUkwgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvYnVpbGRVUkwnKTtcbnZhciBidWlsZEZ1bGxQYXRoID0gcmVxdWlyZSgnLi4vY29yZS9idWlsZEZ1bGxQYXRoJyk7XG52YXIgcGFyc2VIZWFkZXJzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL3BhcnNlSGVhZGVycycpO1xudmFyIGlzVVJMU2FtZU9yaWdpbiA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9pc1VSTFNhbWVPcmlnaW4nKTtcbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4uL2NvcmUvY3JlYXRlRXJyb3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB4aHJBZGFwdGVyKGNvbmZpZykge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gZGlzcGF0Y2hYaHJSZXF1ZXN0KHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciByZXF1ZXN0RGF0YSA9IGNvbmZpZy5kYXRhO1xuICAgIHZhciByZXF1ZXN0SGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzO1xuXG4gICAgaWYgKHV0aWxzLmlzRm9ybURhdGEocmVxdWVzdERhdGEpKSB7XG4gICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddOyAvLyBMZXQgdGhlIGJyb3dzZXIgc2V0IGl0XG4gICAgfVxuXG4gICAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgIC8vIEhUVFAgYmFzaWMgYXV0aGVudGljYXRpb25cbiAgICBpZiAoY29uZmlnLmF1dGgpIHtcbiAgICAgIHZhciB1c2VybmFtZSA9IGNvbmZpZy5hdXRoLnVzZXJuYW1lIHx8ICcnO1xuICAgICAgdmFyIHBhc3N3b3JkID0gY29uZmlnLmF1dGgucGFzc3dvcmQgPyB1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoY29uZmlnLmF1dGgucGFzc3dvcmQpKSA6ICcnO1xuICAgICAgcmVxdWVzdEhlYWRlcnMuQXV0aG9yaXphdGlvbiA9ICdCYXNpYyAnICsgYnRvYSh1c2VybmFtZSArICc6JyArIHBhc3N3b3JkKTtcbiAgICB9XG5cbiAgICB2YXIgZnVsbFBhdGggPSBidWlsZEZ1bGxQYXRoKGNvbmZpZy5iYXNlVVJMLCBjb25maWcudXJsKTtcbiAgICByZXF1ZXN0Lm9wZW4oY29uZmlnLm1ldGhvZC50b1VwcGVyQ2FzZSgpLCBidWlsZFVSTChmdWxsUGF0aCwgY29uZmlnLnBhcmFtcywgY29uZmlnLnBhcmFtc1NlcmlhbGl6ZXIpLCB0cnVlKTtcblxuICAgIC8vIFNldCB0aGUgcmVxdWVzdCB0aW1lb3V0IGluIE1TXG4gICAgcmVxdWVzdC50aW1lb3V0ID0gY29uZmlnLnRpbWVvdXQ7XG5cbiAgICAvLyBMaXN0ZW4gZm9yIHJlYWR5IHN0YXRlXG4gICAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiBoYW5kbGVMb2FkKCkge1xuICAgICAgaWYgKCFyZXF1ZXN0IHx8IHJlcXVlc3QucmVhZHlTdGF0ZSAhPT0gNCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFRoZSByZXF1ZXN0IGVycm9yZWQgb3V0IGFuZCB3ZSBkaWRuJ3QgZ2V0IGEgcmVzcG9uc2UsIHRoaXMgd2lsbCBiZVxuICAgICAgLy8gaGFuZGxlZCBieSBvbmVycm9yIGluc3RlYWRcbiAgICAgIC8vIFdpdGggb25lIGV4Y2VwdGlvbjogcmVxdWVzdCB0aGF0IHVzaW5nIGZpbGU6IHByb3RvY29sLCBtb3N0IGJyb3dzZXJzXG4gICAgICAvLyB3aWxsIHJldHVybiBzdGF0dXMgYXMgMCBldmVuIHRob3VnaCBpdCdzIGEgc3VjY2Vzc2Z1bCByZXF1ZXN0XG4gICAgICBpZiAocmVxdWVzdC5zdGF0dXMgPT09IDAgJiYgIShyZXF1ZXN0LnJlc3BvbnNlVVJMICYmIHJlcXVlc3QucmVzcG9uc2VVUkwuaW5kZXhPZignZmlsZTonKSA9PT0gMCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBQcmVwYXJlIHRoZSByZXNwb25zZVxuICAgICAgdmFyIHJlc3BvbnNlSGVhZGVycyA9ICdnZXRBbGxSZXNwb25zZUhlYWRlcnMnIGluIHJlcXVlc3QgPyBwYXJzZUhlYWRlcnMocmVxdWVzdC5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSkgOiBudWxsO1xuICAgICAgdmFyIHJlc3BvbnNlRGF0YSA9ICFjb25maWcucmVzcG9uc2VUeXBlIHx8IGNvbmZpZy5yZXNwb25zZVR5cGUgPT09ICd0ZXh0JyA/IHJlcXVlc3QucmVzcG9uc2VUZXh0IDogcmVxdWVzdC5yZXNwb25zZTtcbiAgICAgIHZhciByZXNwb25zZSA9IHtcbiAgICAgICAgZGF0YTogcmVzcG9uc2VEYXRhLFxuICAgICAgICBzdGF0dXM6IHJlcXVlc3Quc3RhdHVzLFxuICAgICAgICBzdGF0dXNUZXh0OiByZXF1ZXN0LnN0YXR1c1RleHQsXG4gICAgICAgIGhlYWRlcnM6IHJlc3BvbnNlSGVhZGVycyxcbiAgICAgICAgY29uZmlnOiBjb25maWcsXG4gICAgICAgIHJlcXVlc3Q6IHJlcXVlc3RcbiAgICAgIH07XG5cbiAgICAgIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHJlc3BvbnNlKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSBicm93c2VyIHJlcXVlc3QgY2FuY2VsbGF0aW9uIChhcyBvcHBvc2VkIHRvIGEgbWFudWFsIGNhbmNlbGxhdGlvbilcbiAgICByZXF1ZXN0Lm9uYWJvcnQgPSBmdW5jdGlvbiBoYW5kbGVBYm9ydCgpIHtcbiAgICAgIGlmICghcmVxdWVzdCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcignUmVxdWVzdCBhYm9ydGVkJywgY29uZmlnLCAnRUNPTk5BQk9SVEVEJywgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIGxvdyBsZXZlbCBuZXR3b3JrIGVycm9yc1xuICAgIHJlcXVlc3Qub25lcnJvciA9IGZ1bmN0aW9uIGhhbmRsZUVycm9yKCkge1xuICAgICAgLy8gUmVhbCBlcnJvcnMgYXJlIGhpZGRlbiBmcm9tIHVzIGJ5IHRoZSBicm93c2VyXG4gICAgICAvLyBvbmVycm9yIHNob3VsZCBvbmx5IGZpcmUgaWYgaXQncyBhIG5ldHdvcmsgZXJyb3JcbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcignTmV0d29yayBFcnJvcicsIGNvbmZpZywgbnVsbCwgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIHRpbWVvdXRcbiAgICByZXF1ZXN0Lm9udGltZW91dCA9IGZ1bmN0aW9uIGhhbmRsZVRpbWVvdXQoKSB7XG4gICAgICB2YXIgdGltZW91dEVycm9yTWVzc2FnZSA9ICd0aW1lb3V0IG9mICcgKyBjb25maWcudGltZW91dCArICdtcyBleGNlZWRlZCc7XG4gICAgICBpZiAoY29uZmlnLnRpbWVvdXRFcnJvck1lc3NhZ2UpIHtcbiAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZSA9IGNvbmZpZy50aW1lb3V0RXJyb3JNZXNzYWdlO1xuICAgICAgfVxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKHRpbWVvdXRFcnJvck1lc3NhZ2UsIGNvbmZpZywgJ0VDT05OQUJPUlRFRCcsXG4gICAgICAgIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEFkZCB4c3JmIGhlYWRlclxuICAgIC8vIFRoaXMgaXMgb25seSBkb25lIGlmIHJ1bm5pbmcgaW4gYSBzdGFuZGFyZCBicm93c2VyIGVudmlyb25tZW50LlxuICAgIC8vIFNwZWNpZmljYWxseSBub3QgaWYgd2UncmUgaW4gYSB3ZWIgd29ya2VyLCBvciByZWFjdC1uYXRpdmUuXG4gICAgaWYgKHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkpIHtcbiAgICAgIC8vIEFkZCB4c3JmIGhlYWRlclxuICAgICAgdmFyIHhzcmZWYWx1ZSA9IChjb25maWcud2l0aENyZWRlbnRpYWxzIHx8IGlzVVJMU2FtZU9yaWdpbihmdWxsUGF0aCkpICYmIGNvbmZpZy54c3JmQ29va2llTmFtZSA/XG4gICAgICAgIGNvb2tpZXMucmVhZChjb25maWcueHNyZkNvb2tpZU5hbWUpIDpcbiAgICAgICAgdW5kZWZpbmVkO1xuXG4gICAgICBpZiAoeHNyZlZhbHVlKSB7XG4gICAgICAgIHJlcXVlc3RIZWFkZXJzW2NvbmZpZy54c3JmSGVhZGVyTmFtZV0gPSB4c3JmVmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQWRkIGhlYWRlcnMgdG8gdGhlIHJlcXVlc3RcbiAgICBpZiAoJ3NldFJlcXVlc3RIZWFkZXInIGluIHJlcXVlc3QpIHtcbiAgICAgIHV0aWxzLmZvckVhY2gocmVxdWVzdEhlYWRlcnMsIGZ1bmN0aW9uIHNldFJlcXVlc3RIZWFkZXIodmFsLCBrZXkpIHtcbiAgICAgICAgaWYgKHR5cGVvZiByZXF1ZXN0RGF0YSA9PT0gJ3VuZGVmaW5lZCcgJiYga2V5LnRvTG93ZXJDYXNlKCkgPT09ICdjb250ZW50LXR5cGUnKSB7XG4gICAgICAgICAgLy8gUmVtb3ZlIENvbnRlbnQtVHlwZSBpZiBkYXRhIGlzIHVuZGVmaW5lZFxuICAgICAgICAgIGRlbGV0ZSByZXF1ZXN0SGVhZGVyc1trZXldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIE90aGVyd2lzZSBhZGQgaGVhZGVyIHRvIHRoZSByZXF1ZXN0XG4gICAgICAgICAgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKGtleSwgdmFsKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQWRkIHdpdGhDcmVkZW50aWFscyB0byByZXF1ZXN0IGlmIG5lZWRlZFxuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnLndpdGhDcmVkZW50aWFscykpIHtcbiAgICAgIHJlcXVlc3Qud2l0aENyZWRlbnRpYWxzID0gISFjb25maWcud2l0aENyZWRlbnRpYWxzO1xuICAgIH1cblxuICAgIC8vIEFkZCByZXNwb25zZVR5cGUgdG8gcmVxdWVzdCBpZiBuZWVkZWRcbiAgICBpZiAoY29uZmlnLnJlc3BvbnNlVHlwZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSBjb25maWcucmVzcG9uc2VUeXBlO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBFeHBlY3RlZCBET01FeGNlcHRpb24gdGhyb3duIGJ5IGJyb3dzZXJzIG5vdCBjb21wYXRpYmxlIFhNTEh0dHBSZXF1ZXN0IExldmVsIDIuXG4gICAgICAgIC8vIEJ1dCwgdGhpcyBjYW4gYmUgc3VwcHJlc3NlZCBmb3IgJ2pzb24nIHR5cGUgYXMgaXQgY2FuIGJlIHBhcnNlZCBieSBkZWZhdWx0ICd0cmFuc2Zvcm1SZXNwb25zZScgZnVuY3Rpb24uXG4gICAgICAgIGlmIChjb25maWcucmVzcG9uc2VUeXBlICE9PSAnanNvbicpIHtcbiAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIHByb2dyZXNzIGlmIG5lZWRlZFxuICAgIGlmICh0eXBlb2YgY29uZmlnLm9uRG93bmxvYWRQcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGNvbmZpZy5vbkRvd25sb2FkUHJvZ3Jlc3MpO1xuICAgIH1cblxuICAgIC8vIE5vdCBhbGwgYnJvd3NlcnMgc3VwcG9ydCB1cGxvYWQgZXZlbnRzXG4gICAgaWYgKHR5cGVvZiBjb25maWcub25VcGxvYWRQcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJyAmJiByZXF1ZXN0LnVwbG9hZCkge1xuICAgICAgcmVxdWVzdC51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBjb25maWcub25VcGxvYWRQcm9ncmVzcyk7XG4gICAgfVxuXG4gICAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgICAgLy8gSGFuZGxlIGNhbmNlbGxhdGlvblxuICAgICAgY29uZmlnLmNhbmNlbFRva2VuLnByb21pc2UudGhlbihmdW5jdGlvbiBvbkNhbmNlbGVkKGNhbmNlbCkge1xuICAgICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICByZXF1ZXN0LmFib3J0KCk7XG4gICAgICAgIHJlamVjdChjYW5jZWwpO1xuICAgICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKCFyZXF1ZXN0RGF0YSkge1xuICAgICAgcmVxdWVzdERhdGEgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIFNlbmQgdGhlIHJlcXVlc3RcbiAgICByZXF1ZXN0LnNlbmQocmVxdWVzdERhdGEpO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbnZhciBiaW5kID0gcmVxdWlyZSgnLi9oZWxwZXJzL2JpbmQnKTtcbnZhciBBeGlvcyA9IHJlcXVpcmUoJy4vY29yZS9BeGlvcycpO1xudmFyIG1lcmdlQ29uZmlnID0gcmVxdWlyZSgnLi9jb3JlL21lcmdlQ29uZmlnJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIGluc3RhbmNlIG9mIEF4aW9zXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRlZmF1bHRDb25maWcgVGhlIGRlZmF1bHQgY29uZmlnIGZvciB0aGUgaW5zdGFuY2VcbiAqIEByZXR1cm4ge0F4aW9zfSBBIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICovXG5mdW5jdGlvbiBjcmVhdGVJbnN0YW5jZShkZWZhdWx0Q29uZmlnKSB7XG4gIHZhciBjb250ZXh0ID0gbmV3IEF4aW9zKGRlZmF1bHRDb25maWcpO1xuICB2YXIgaW5zdGFuY2UgPSBiaW5kKEF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0LCBjb250ZXh0KTtcblxuICAvLyBDb3B5IGF4aW9zLnByb3RvdHlwZSB0byBpbnN0YW5jZVxuICB1dGlscy5leHRlbmQoaW5zdGFuY2UsIEF4aW9zLnByb3RvdHlwZSwgY29udGV4dCk7XG5cbiAgLy8gQ29weSBjb250ZXh0IHRvIGluc3RhbmNlXG4gIHV0aWxzLmV4dGVuZChpbnN0YW5jZSwgY29udGV4dCk7XG5cbiAgcmV0dXJuIGluc3RhbmNlO1xufVxuXG4vLyBDcmVhdGUgdGhlIGRlZmF1bHQgaW5zdGFuY2UgdG8gYmUgZXhwb3J0ZWRcbnZhciBheGlvcyA9IGNyZWF0ZUluc3RhbmNlKGRlZmF1bHRzKTtcblxuLy8gRXhwb3NlIEF4aW9zIGNsYXNzIHRvIGFsbG93IGNsYXNzIGluaGVyaXRhbmNlXG5heGlvcy5BeGlvcyA9IEF4aW9zO1xuXG4vLyBGYWN0b3J5IGZvciBjcmVhdGluZyBuZXcgaW5zdGFuY2VzXG5heGlvcy5jcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUoaW5zdGFuY2VDb25maWcpIHtcbiAgcmV0dXJuIGNyZWF0ZUluc3RhbmNlKG1lcmdlQ29uZmlnKGF4aW9zLmRlZmF1bHRzLCBpbnN0YW5jZUNvbmZpZykpO1xufTtcblxuLy8gRXhwb3NlIENhbmNlbCAmIENhbmNlbFRva2VuXG5heGlvcy5DYW5jZWwgPSByZXF1aXJlKCcuL2NhbmNlbC9DYW5jZWwnKTtcbmF4aW9zLkNhbmNlbFRva2VuID0gcmVxdWlyZSgnLi9jYW5jZWwvQ2FuY2VsVG9rZW4nKTtcbmF4aW9zLmlzQ2FuY2VsID0gcmVxdWlyZSgnLi9jYW5jZWwvaXNDYW5jZWwnKTtcblxuLy8gRXhwb3NlIGFsbC9zcHJlYWRcbmF4aW9zLmFsbCA9IGZ1bmN0aW9uIGFsbChwcm9taXNlcykge1xuICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xufTtcbmF4aW9zLnNwcmVhZCA9IHJlcXVpcmUoJy4vaGVscGVycy9zcHJlYWQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBheGlvcztcblxuLy8gQWxsb3cgdXNlIG9mIGRlZmF1bHQgaW1wb3J0IHN5bnRheCBpbiBUeXBlU2NyaXB0XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gYXhpb3M7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQSBgQ2FuY2VsYCBpcyBhbiBvYmplY3QgdGhhdCBpcyB0aHJvd24gd2hlbiBhbiBvcGVyYXRpb24gaXMgY2FuY2VsZWQuXG4gKlxuICogQGNsYXNzXG4gKiBAcGFyYW0ge3N0cmluZz19IG1lc3NhZ2UgVGhlIG1lc3NhZ2UuXG4gKi9cbmZ1bmN0aW9uIENhbmNlbChtZXNzYWdlKSB7XG4gIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG59XG5cbkNhbmNlbC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgcmV0dXJuICdDYW5jZWwnICsgKHRoaXMubWVzc2FnZSA/ICc6ICcgKyB0aGlzLm1lc3NhZ2UgOiAnJyk7XG59O1xuXG5DYW5jZWwucHJvdG90eXBlLl9fQ0FOQ0VMX18gPSB0cnVlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbmNlbDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENhbmNlbCA9IHJlcXVpcmUoJy4vQ2FuY2VsJyk7XG5cbi8qKlxuICogQSBgQ2FuY2VsVG9rZW5gIGlzIGFuIG9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlcXVlc3QgY2FuY2VsbGF0aW9uIG9mIGFuIG9wZXJhdGlvbi5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGV4ZWN1dG9yIFRoZSBleGVjdXRvciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsVG9rZW4oZXhlY3V0b3IpIHtcbiAgaWYgKHR5cGVvZiBleGVjdXRvciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2V4ZWN1dG9yIG11c3QgYmUgYSBmdW5jdGlvbi4nKTtcbiAgfVxuXG4gIHZhciByZXNvbHZlUHJvbWlzZTtcbiAgdGhpcy5wcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gcHJvbWlzZUV4ZWN1dG9yKHJlc29sdmUpIHtcbiAgICByZXNvbHZlUHJvbWlzZSA9IHJlc29sdmU7XG4gIH0pO1xuXG4gIHZhciB0b2tlbiA9IHRoaXM7XG4gIGV4ZWN1dG9yKGZ1bmN0aW9uIGNhbmNlbChtZXNzYWdlKSB7XG4gICAgaWYgKHRva2VuLnJlYXNvbikge1xuICAgICAgLy8gQ2FuY2VsbGF0aW9uIGhhcyBhbHJlYWR5IGJlZW4gcmVxdWVzdGVkXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdG9rZW4ucmVhc29uID0gbmV3IENhbmNlbChtZXNzYWdlKTtcbiAgICByZXNvbHZlUHJvbWlzZSh0b2tlbi5yZWFzb24pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBUaHJvd3MgYSBgQ2FuY2VsYCBpZiBjYW5jZWxsYXRpb24gaGFzIGJlZW4gcmVxdWVzdGVkLlxuICovXG5DYW5jZWxUb2tlbi5wcm90b3R5cGUudGhyb3dJZlJlcXVlc3RlZCA9IGZ1bmN0aW9uIHRocm93SWZSZXF1ZXN0ZWQoKSB7XG4gIGlmICh0aGlzLnJlYXNvbikge1xuICAgIHRocm93IHRoaXMucmVhc29uO1xuICB9XG59O1xuXG4vKipcbiAqIFJldHVybnMgYW4gb2JqZWN0IHRoYXQgY29udGFpbnMgYSBuZXcgYENhbmNlbFRva2VuYCBhbmQgYSBmdW5jdGlvbiB0aGF0LCB3aGVuIGNhbGxlZCxcbiAqIGNhbmNlbHMgdGhlIGBDYW5jZWxUb2tlbmAuXG4gKi9cbkNhbmNlbFRva2VuLnNvdXJjZSA9IGZ1bmN0aW9uIHNvdXJjZSgpIHtcbiAgdmFyIGNhbmNlbDtcbiAgdmFyIHRva2VuID0gbmV3IENhbmNlbFRva2VuKGZ1bmN0aW9uIGV4ZWN1dG9yKGMpIHtcbiAgICBjYW5jZWwgPSBjO1xuICB9KTtcbiAgcmV0dXJuIHtcbiAgICB0b2tlbjogdG9rZW4sXG4gICAgY2FuY2VsOiBjYW5jZWxcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsVG9rZW47XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNDYW5jZWwodmFsdWUpIHtcbiAgcmV0dXJuICEhKHZhbHVlICYmIHZhbHVlLl9fQ0FOQ0VMX18pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIGJ1aWxkVVJMID0gcmVxdWlyZSgnLi4vaGVscGVycy9idWlsZFVSTCcpO1xudmFyIEludGVyY2VwdG9yTWFuYWdlciA9IHJlcXVpcmUoJy4vSW50ZXJjZXB0b3JNYW5hZ2VyJyk7XG52YXIgZGlzcGF0Y2hSZXF1ZXN0ID0gcmVxdWlyZSgnLi9kaXNwYXRjaFJlcXVlc3QnKTtcbnZhciBtZXJnZUNvbmZpZyA9IHJlcXVpcmUoJy4vbWVyZ2VDb25maWcnKTtcblxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YgQXhpb3NcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gaW5zdGFuY2VDb25maWcgVGhlIGRlZmF1bHQgY29uZmlnIGZvciB0aGUgaW5zdGFuY2VcbiAqL1xuZnVuY3Rpb24gQXhpb3MoaW5zdGFuY2VDb25maWcpIHtcbiAgdGhpcy5kZWZhdWx0cyA9IGluc3RhbmNlQ29uZmlnO1xuICB0aGlzLmludGVyY2VwdG9ycyA9IHtcbiAgICByZXF1ZXN0OiBuZXcgSW50ZXJjZXB0b3JNYW5hZ2VyKCksXG4gICAgcmVzcG9uc2U6IG5ldyBJbnRlcmNlcHRvck1hbmFnZXIoKVxuICB9O1xufVxuXG4vKipcbiAqIERpc3BhdGNoIGEgcmVxdWVzdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZyBzcGVjaWZpYyBmb3IgdGhpcyByZXF1ZXN0IChtZXJnZWQgd2l0aCB0aGlzLmRlZmF1bHRzKVxuICovXG5BeGlvcy5wcm90b3R5cGUucmVxdWVzdCA9IGZ1bmN0aW9uIHJlcXVlc3QoY29uZmlnKSB7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAvLyBBbGxvdyBmb3IgYXhpb3MoJ2V4YW1wbGUvdXJsJ1ssIGNvbmZpZ10pIGEgbGEgZmV0Y2ggQVBJXG4gIGlmICh0eXBlb2YgY29uZmlnID09PSAnc3RyaW5nJykge1xuICAgIGNvbmZpZyA9IGFyZ3VtZW50c1sxXSB8fCB7fTtcbiAgICBjb25maWcudXJsID0gYXJndW1lbnRzWzBdO1xuICB9IGVsc2Uge1xuICAgIGNvbmZpZyA9IGNvbmZpZyB8fCB7fTtcbiAgfVxuXG4gIGNvbmZpZyA9IG1lcmdlQ29uZmlnKHRoaXMuZGVmYXVsdHMsIGNvbmZpZyk7XG5cbiAgLy8gU2V0IGNvbmZpZy5tZXRob2RcbiAgaWYgKGNvbmZpZy5tZXRob2QpIHtcbiAgICBjb25maWcubWV0aG9kID0gY29uZmlnLm1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuICB9IGVsc2UgaWYgKHRoaXMuZGVmYXVsdHMubWV0aG9kKSB7XG4gICAgY29uZmlnLm1ldGhvZCA9IHRoaXMuZGVmYXVsdHMubWV0aG9kLnRvTG93ZXJDYXNlKCk7XG4gIH0gZWxzZSB7XG4gICAgY29uZmlnLm1ldGhvZCA9ICdnZXQnO1xuICB9XG5cbiAgLy8gSG9vayB1cCBpbnRlcmNlcHRvcnMgbWlkZGxld2FyZVxuICB2YXIgY2hhaW4gPSBbZGlzcGF0Y2hSZXF1ZXN0LCB1bmRlZmluZWRdO1xuICB2YXIgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZShjb25maWcpO1xuXG4gIHRoaXMuaW50ZXJjZXB0b3JzLnJlcXVlc3QuZm9yRWFjaChmdW5jdGlvbiB1bnNoaWZ0UmVxdWVzdEludGVyY2VwdG9ycyhpbnRlcmNlcHRvcikge1xuICAgIGNoYWluLnVuc2hpZnQoaW50ZXJjZXB0b3IuZnVsZmlsbGVkLCBpbnRlcmNlcHRvci5yZWplY3RlZCk7XG4gIH0pO1xuXG4gIHRoaXMuaW50ZXJjZXB0b3JzLnJlc3BvbnNlLmZvckVhY2goZnVuY3Rpb24gcHVzaFJlc3BvbnNlSW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgY2hhaW4ucHVzaChpbnRlcmNlcHRvci5mdWxmaWxsZWQsIGludGVyY2VwdG9yLnJlamVjdGVkKTtcbiAgfSk7XG5cbiAgd2hpbGUgKGNoYWluLmxlbmd0aCkge1xuICAgIHByb21pc2UgPSBwcm9taXNlLnRoZW4oY2hhaW4uc2hpZnQoKSwgY2hhaW4uc2hpZnQoKSk7XG4gIH1cblxuICByZXR1cm4gcHJvbWlzZTtcbn07XG5cbkF4aW9zLnByb3RvdHlwZS5nZXRVcmkgPSBmdW5jdGlvbiBnZXRVcmkoY29uZmlnKSB7XG4gIGNvbmZpZyA9IG1lcmdlQ29uZmlnKHRoaXMuZGVmYXVsdHMsIGNvbmZpZyk7XG4gIHJldHVybiBidWlsZFVSTChjb25maWcudXJsLCBjb25maWcucGFyYW1zLCBjb25maWcucGFyYW1zU2VyaWFsaXplcikucmVwbGFjZSgvXlxcPy8sICcnKTtcbn07XG5cbi8vIFByb3ZpZGUgYWxpYXNlcyBmb3Igc3VwcG9ydGVkIHJlcXVlc3QgbWV0aG9kc1xudXRpbHMuZm9yRWFjaChbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCcsICdvcHRpb25zJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2ROb0RhdGEobWV0aG9kKSB7XG4gIC8qZXNsaW50IGZ1bmMtbmFtZXM6MCovXG4gIEF4aW9zLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24odXJsLCBjb25maWcpIHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KG1lcmdlQ29uZmlnKGNvbmZpZyB8fCB7fSwge1xuICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICB1cmw6IHVybCxcbiAgICAgIGRhdGE6IChjb25maWcgfHwge30pLmRhdGFcbiAgICB9KSk7XG4gIH07XG59KTtcblxudXRpbHMuZm9yRWFjaChbJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2RXaXRoRGF0YShtZXRob2QpIHtcbiAgLyplc2xpbnQgZnVuYy1uYW1lczowKi9cbiAgQXhpb3MucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih1cmwsIGRhdGEsIGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QobWVyZ2VDb25maWcoY29uZmlnIHx8IHt9LCB7XG4gICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgIHVybDogdXJsLFxuICAgICAgZGF0YTogZGF0YVxuICAgIH0pKTtcbiAgfTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEF4aW9zO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbmZ1bmN0aW9uIEludGVyY2VwdG9yTWFuYWdlcigpIHtcbiAgdGhpcy5oYW5kbGVycyA9IFtdO1xufVxuXG4vKipcbiAqIEFkZCBhIG5ldyBpbnRlcmNlcHRvciB0byB0aGUgc3RhY2tcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdWxmaWxsZWQgVGhlIGZ1bmN0aW9uIHRvIGhhbmRsZSBgdGhlbmAgZm9yIGEgYFByb21pc2VgXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWplY3RlZCBUaGUgZnVuY3Rpb24gdG8gaGFuZGxlIGByZWplY3RgIGZvciBhIGBQcm9taXNlYFxuICpcbiAqIEByZXR1cm4ge051bWJlcn0gQW4gSUQgdXNlZCB0byByZW1vdmUgaW50ZXJjZXB0b3IgbGF0ZXJcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbiB1c2UoZnVsZmlsbGVkLCByZWplY3RlZCkge1xuICB0aGlzLmhhbmRsZXJzLnB1c2goe1xuICAgIGZ1bGZpbGxlZDogZnVsZmlsbGVkLFxuICAgIHJlamVjdGVkOiByZWplY3RlZFxuICB9KTtcbiAgcmV0dXJuIHRoaXMuaGFuZGxlcnMubGVuZ3RoIC0gMTtcbn07XG5cbi8qKlxuICogUmVtb3ZlIGFuIGludGVyY2VwdG9yIGZyb20gdGhlIHN0YWNrXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGlkIFRoZSBJRCB0aGF0IHdhcyByZXR1cm5lZCBieSBgdXNlYFxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLmVqZWN0ID0gZnVuY3Rpb24gZWplY3QoaWQpIHtcbiAgaWYgKHRoaXMuaGFuZGxlcnNbaWRdKSB7XG4gICAgdGhpcy5oYW5kbGVyc1tpZF0gPSBudWxsO1xuICB9XG59O1xuXG4vKipcbiAqIEl0ZXJhdGUgb3ZlciBhbGwgdGhlIHJlZ2lzdGVyZWQgaW50ZXJjZXB0b3JzXG4gKlxuICogVGhpcyBtZXRob2QgaXMgcGFydGljdWxhcmx5IHVzZWZ1bCBmb3Igc2tpcHBpbmcgb3ZlciBhbnlcbiAqIGludGVyY2VwdG9ycyB0aGF0IG1heSBoYXZlIGJlY29tZSBgbnVsbGAgY2FsbGluZyBgZWplY3RgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIGludGVyY2VwdG9yXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIGZvckVhY2goZm4pIHtcbiAgdXRpbHMuZm9yRWFjaCh0aGlzLmhhbmRsZXJzLCBmdW5jdGlvbiBmb3JFYWNoSGFuZGxlcihoKSB7XG4gICAgaWYgKGggIT09IG51bGwpIHtcbiAgICAgIGZuKGgpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyY2VwdG9yTWFuYWdlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGlzQWJzb2x1dGVVUkwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2lzQWJzb2x1dGVVUkwnKTtcbnZhciBjb21iaW5lVVJMcyA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvY29tYmluZVVSTHMnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IFVSTCBieSBjb21iaW5pbmcgdGhlIGJhc2VVUkwgd2l0aCB0aGUgcmVxdWVzdGVkVVJMLFxuICogb25seSB3aGVuIHRoZSByZXF1ZXN0ZWRVUkwgaXMgbm90IGFscmVhZHkgYW4gYWJzb2x1dGUgVVJMLlxuICogSWYgdGhlIHJlcXVlc3RVUkwgaXMgYWJzb2x1dGUsIHRoaXMgZnVuY3Rpb24gcmV0dXJucyB0aGUgcmVxdWVzdGVkVVJMIHVudG91Y2hlZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZVVSTCBUaGUgYmFzZSBVUkxcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXF1ZXN0ZWRVUkwgQWJzb2x1dGUgb3IgcmVsYXRpdmUgVVJMIHRvIGNvbWJpbmVcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21iaW5lZCBmdWxsIHBhdGhcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBidWlsZEZ1bGxQYXRoKGJhc2VVUkwsIHJlcXVlc3RlZFVSTCkge1xuICBpZiAoYmFzZVVSTCAmJiAhaXNBYnNvbHV0ZVVSTChyZXF1ZXN0ZWRVUkwpKSB7XG4gICAgcmV0dXJuIGNvbWJpbmVVUkxzKGJhc2VVUkwsIHJlcXVlc3RlZFVSTCk7XG4gIH1cbiAgcmV0dXJuIHJlcXVlc3RlZFVSTDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBlbmhhbmNlRXJyb3IgPSByZXF1aXJlKCcuL2VuaGFuY2VFcnJvcicpO1xuXG4vKipcbiAqIENyZWF0ZSBhbiBFcnJvciB3aXRoIHRoZSBzcGVjaWZpZWQgbWVzc2FnZSwgY29uZmlnLCBlcnJvciBjb2RlLCByZXF1ZXN0IGFuZCByZXNwb25zZS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSBUaGUgZXJyb3IgbWVzc2FnZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbY29kZV0gVGhlIGVycm9yIGNvZGUgKGZvciBleGFtcGxlLCAnRUNPTk5BQk9SVEVEJykuXG4gKiBAcGFyYW0ge09iamVjdH0gW3JlcXVlc3RdIFRoZSByZXF1ZXN0LlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXNwb25zZV0gVGhlIHJlc3BvbnNlLlxuICogQHJldHVybnMge0Vycm9yfSBUaGUgY3JlYXRlZCBlcnJvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGVFcnJvcihtZXNzYWdlLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKSB7XG4gIHZhciBlcnJvciA9IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgcmV0dXJuIGVuaGFuY2VFcnJvcihlcnJvciwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgdHJhbnNmb3JtRGF0YSA9IHJlcXVpcmUoJy4vdHJhbnNmb3JtRGF0YScpO1xudmFyIGlzQ2FuY2VsID0gcmVxdWlyZSgnLi4vY2FuY2VsL2lzQ2FuY2VsJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuLi9kZWZhdWx0cycpO1xuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbmZ1bmN0aW9uIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKSB7XG4gIGlmIChjb25maWcuY2FuY2VsVG9rZW4pIHtcbiAgICBjb25maWcuY2FuY2VsVG9rZW4udGhyb3dJZlJlcXVlc3RlZCgpO1xuICB9XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0IHRvIHRoZSBzZXJ2ZXIgdXNpbmcgdGhlIGNvbmZpZ3VyZWQgYWRhcHRlci5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIFRoZSBjb25maWcgdGhhdCBpcyB0byBiZSB1c2VkIGZvciB0aGUgcmVxdWVzdFxuICogQHJldHVybnMge1Byb21pc2V9IFRoZSBQcm9taXNlIHRvIGJlIGZ1bGZpbGxlZFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRpc3BhdGNoUmVxdWVzdChjb25maWcpIHtcbiAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gIC8vIEVuc3VyZSBoZWFkZXJzIGV4aXN0XG4gIGNvbmZpZy5oZWFkZXJzID0gY29uZmlnLmhlYWRlcnMgfHwge307XG5cbiAgLy8gVHJhbnNmb3JtIHJlcXVlc3QgZGF0YVxuICBjb25maWcuZGF0YSA9IHRyYW5zZm9ybURhdGEoXG4gICAgY29uZmlnLmRhdGEsXG4gICAgY29uZmlnLmhlYWRlcnMsXG4gICAgY29uZmlnLnRyYW5zZm9ybVJlcXVlc3RcbiAgKTtcblxuICAvLyBGbGF0dGVuIGhlYWRlcnNcbiAgY29uZmlnLmhlYWRlcnMgPSB1dGlscy5tZXJnZShcbiAgICBjb25maWcuaGVhZGVycy5jb21tb24gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNbY29uZmlnLm1ldGhvZF0gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNcbiAgKTtcblxuICB1dGlscy5mb3JFYWNoKFxuICAgIFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJywgJ2NvbW1vbiddLFxuICAgIGZ1bmN0aW9uIGNsZWFuSGVhZGVyQ29uZmlnKG1ldGhvZCkge1xuICAgICAgZGVsZXRlIGNvbmZpZy5oZWFkZXJzW21ldGhvZF07XG4gICAgfVxuICApO1xuXG4gIHZhciBhZGFwdGVyID0gY29uZmlnLmFkYXB0ZXIgfHwgZGVmYXVsdHMuYWRhcHRlcjtcblxuICByZXR1cm4gYWRhcHRlcihjb25maWcpLnRoZW4oZnVuY3Rpb24gb25BZGFwdGVyUmVzb2x1dGlvbihyZXNwb25zZSkge1xuICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgIC8vIFRyYW5zZm9ybSByZXNwb25zZSBkYXRhXG4gICAgcmVzcG9uc2UuZGF0YSA9IHRyYW5zZm9ybURhdGEoXG4gICAgICByZXNwb25zZS5kYXRhLFxuICAgICAgcmVzcG9uc2UuaGVhZGVycyxcbiAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICk7XG5cbiAgICByZXR1cm4gcmVzcG9uc2U7XG4gIH0sIGZ1bmN0aW9uIG9uQWRhcHRlclJlamVjdGlvbihyZWFzb24pIHtcbiAgICBpZiAoIWlzQ2FuY2VsKHJlYXNvbikpIHtcbiAgICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgICAgLy8gVHJhbnNmb3JtIHJlc3BvbnNlIGRhdGFcbiAgICAgIGlmIChyZWFzb24gJiYgcmVhc29uLnJlc3BvbnNlKSB7XG4gICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhID0gdHJhbnNmb3JtRGF0YShcbiAgICAgICAgICByZWFzb24ucmVzcG9uc2UuZGF0YSxcbiAgICAgICAgICByZWFzb24ucmVzcG9uc2UuaGVhZGVycyxcbiAgICAgICAgICBjb25maWcudHJhbnNmb3JtUmVzcG9uc2VcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QocmVhc29uKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFVwZGF0ZSBhbiBFcnJvciB3aXRoIHRoZSBzcGVjaWZpZWQgY29uZmlnLCBlcnJvciBjb2RlLCBhbmQgcmVzcG9uc2UuXG4gKlxuICogQHBhcmFtIHtFcnJvcn0gZXJyb3IgVGhlIGVycm9yIHRvIHVwZGF0ZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbY29kZV0gVGhlIGVycm9yIGNvZGUgKGZvciBleGFtcGxlLCAnRUNPTk5BQk9SVEVEJykuXG4gKiBAcGFyYW0ge09iamVjdH0gW3JlcXVlc3RdIFRoZSByZXF1ZXN0LlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXNwb25zZV0gVGhlIHJlc3BvbnNlLlxuICogQHJldHVybnMge0Vycm9yfSBUaGUgZXJyb3IuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZW5oYW5jZUVycm9yKGVycm9yLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKSB7XG4gIGVycm9yLmNvbmZpZyA9IGNvbmZpZztcbiAgaWYgKGNvZGUpIHtcbiAgICBlcnJvci5jb2RlID0gY29kZTtcbiAgfVxuXG4gIGVycm9yLnJlcXVlc3QgPSByZXF1ZXN0O1xuICBlcnJvci5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICBlcnJvci5pc0F4aW9zRXJyb3IgPSB0cnVlO1xuXG4gIGVycm9yLnRvSlNPTiA9IGZ1bmN0aW9uIHRvSlNPTigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgLy8gU3RhbmRhcmRcbiAgICAgIG1lc3NhZ2U6IHRoaXMubWVzc2FnZSxcbiAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgIC8vIE1pY3Jvc29mdFxuICAgICAgZGVzY3JpcHRpb246IHRoaXMuZGVzY3JpcHRpb24sXG4gICAgICBudW1iZXI6IHRoaXMubnVtYmVyLFxuICAgICAgLy8gTW96aWxsYVxuICAgICAgZmlsZU5hbWU6IHRoaXMuZmlsZU5hbWUsXG4gICAgICBsaW5lTnVtYmVyOiB0aGlzLmxpbmVOdW1iZXIsXG4gICAgICBjb2x1bW5OdW1iZXI6IHRoaXMuY29sdW1uTnVtYmVyLFxuICAgICAgc3RhY2s6IHRoaXMuc3RhY2ssXG4gICAgICAvLyBBeGlvc1xuICAgICAgY29uZmlnOiB0aGlzLmNvbmZpZyxcbiAgICAgIGNvZGU6IHRoaXMuY29kZVxuICAgIH07XG4gIH07XG4gIHJldHVybiBlcnJvcjtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbi8qKlxuICogQ29uZmlnLXNwZWNpZmljIG1lcmdlLWZ1bmN0aW9uIHdoaWNoIGNyZWF0ZXMgYSBuZXcgY29uZmlnLW9iamVjdFxuICogYnkgbWVyZ2luZyB0d28gY29uZmlndXJhdGlvbiBvYmplY3RzIHRvZ2V0aGVyLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcxXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnMlxuICogQHJldHVybnMge09iamVjdH0gTmV3IG9iamVjdCByZXN1bHRpbmcgZnJvbSBtZXJnaW5nIGNvbmZpZzIgdG8gY29uZmlnMVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG1lcmdlQ29uZmlnKGNvbmZpZzEsIGNvbmZpZzIpIHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gIGNvbmZpZzIgPSBjb25maWcyIHx8IHt9O1xuICB2YXIgY29uZmlnID0ge307XG5cbiAgdmFyIHZhbHVlRnJvbUNvbmZpZzJLZXlzID0gWyd1cmwnLCAnbWV0aG9kJywgJ2RhdGEnXTtcbiAgdmFyIG1lcmdlRGVlcFByb3BlcnRpZXNLZXlzID0gWydoZWFkZXJzJywgJ2F1dGgnLCAncHJveHknLCAncGFyYW1zJ107XG4gIHZhciBkZWZhdWx0VG9Db25maWcyS2V5cyA9IFtcbiAgICAnYmFzZVVSTCcsICd0cmFuc2Zvcm1SZXF1ZXN0JywgJ3RyYW5zZm9ybVJlc3BvbnNlJywgJ3BhcmFtc1NlcmlhbGl6ZXInLFxuICAgICd0aW1lb3V0JywgJ3RpbWVvdXRNZXNzYWdlJywgJ3dpdGhDcmVkZW50aWFscycsICdhZGFwdGVyJywgJ3Jlc3BvbnNlVHlwZScsICd4c3JmQ29va2llTmFtZScsXG4gICAgJ3hzcmZIZWFkZXJOYW1lJywgJ29uVXBsb2FkUHJvZ3Jlc3MnLCAnb25Eb3dubG9hZFByb2dyZXNzJywgJ2RlY29tcHJlc3MnLFxuICAgICdtYXhDb250ZW50TGVuZ3RoJywgJ21heEJvZHlMZW5ndGgnLCAnbWF4UmVkaXJlY3RzJywgJ3RyYW5zcG9ydCcsICdodHRwQWdlbnQnLFxuICAgICdodHRwc0FnZW50JywgJ2NhbmNlbFRva2VuJywgJ3NvY2tldFBhdGgnLCAncmVzcG9uc2VFbmNvZGluZydcbiAgXTtcbiAgdmFyIGRpcmVjdE1lcmdlS2V5cyA9IFsndmFsaWRhdGVTdGF0dXMnXTtcblxuICBmdW5jdGlvbiBnZXRNZXJnZWRWYWx1ZSh0YXJnZXQsIHNvdXJjZSkge1xuICAgIGlmICh1dGlscy5pc1BsYWluT2JqZWN0KHRhcmdldCkgJiYgdXRpbHMuaXNQbGFpbk9iamVjdChzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gdXRpbHMubWVyZ2UodGFyZ2V0LCBzb3VyY2UpO1xuICAgIH0gZWxzZSBpZiAodXRpbHMuaXNQbGFpbk9iamVjdChzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gdXRpbHMubWVyZ2Uoe30sIHNvdXJjZSk7XG4gICAgfSBlbHNlIGlmICh1dGlscy5pc0FycmF5KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiBzb3VyY2Uuc2xpY2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIHNvdXJjZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1lcmdlRGVlcFByb3BlcnRpZXMocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKGNvbmZpZzFbcHJvcF0sIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzFbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfVxuXG4gIHV0aWxzLmZvckVhY2godmFsdWVGcm9tQ29uZmlnMktleXMsIGZ1bmN0aW9uIHZhbHVlRnJvbUNvbmZpZzIocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMltwcm9wXSk7XG4gICAgfVxuICB9KTtcblxuICB1dGlscy5mb3JFYWNoKG1lcmdlRGVlcFByb3BlcnRpZXNLZXlzLCBtZXJnZURlZXBQcm9wZXJ0aWVzKTtcblxuICB1dGlscy5mb3JFYWNoKGRlZmF1bHRUb0NvbmZpZzJLZXlzLCBmdW5jdGlvbiBkZWZhdWx0VG9Db25maWcyKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzFbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdXRpbHMuZm9yRWFjaChkaXJlY3RNZXJnZUtleXMsIGZ1bmN0aW9uIG1lcmdlKHByb3ApIHtcbiAgICBpZiAocHJvcCBpbiBjb25maWcyKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZShjb25maWcxW3Byb3BdLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKHByb3AgaW4gY29uZmlnMSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBheGlvc0tleXMgPSB2YWx1ZUZyb21Db25maWcyS2V5c1xuICAgIC5jb25jYXQobWVyZ2VEZWVwUHJvcGVydGllc0tleXMpXG4gICAgLmNvbmNhdChkZWZhdWx0VG9Db25maWcyS2V5cylcbiAgICAuY29uY2F0KGRpcmVjdE1lcmdlS2V5cyk7XG5cbiAgdmFyIG90aGVyS2V5cyA9IE9iamVjdFxuICAgIC5rZXlzKGNvbmZpZzEpXG4gICAgLmNvbmNhdChPYmplY3Qua2V5cyhjb25maWcyKSlcbiAgICAuZmlsdGVyKGZ1bmN0aW9uIGZpbHRlckF4aW9zS2V5cyhrZXkpIHtcbiAgICAgIHJldHVybiBheGlvc0tleXMuaW5kZXhPZihrZXkpID09PSAtMTtcbiAgICB9KTtcblxuICB1dGlscy5mb3JFYWNoKG90aGVyS2V5cywgbWVyZ2VEZWVwUHJvcGVydGllcyk7XG5cbiAgcmV0dXJuIGNvbmZpZztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4vY3JlYXRlRXJyb3InKTtcblxuLyoqXG4gKiBSZXNvbHZlIG9yIHJlamVjdCBhIFByb21pc2UgYmFzZWQgb24gcmVzcG9uc2Ugc3RhdHVzLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlc29sdmUgQSBmdW5jdGlvbiB0aGF0IHJlc29sdmVzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0IEEgZnVuY3Rpb24gdGhhdCByZWplY3RzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIFRoZSByZXNwb25zZS5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCByZXNwb25zZSkge1xuICB2YXIgdmFsaWRhdGVTdGF0dXMgPSByZXNwb25zZS5jb25maWcudmFsaWRhdGVTdGF0dXM7XG4gIGlmICghcmVzcG9uc2Uuc3RhdHVzIHx8ICF2YWxpZGF0ZVN0YXR1cyB8fCB2YWxpZGF0ZVN0YXR1cyhyZXNwb25zZS5zdGF0dXMpKSB7XG4gICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gIH0gZWxzZSB7XG4gICAgcmVqZWN0KGNyZWF0ZUVycm9yKFxuICAgICAgJ1JlcXVlc3QgZmFpbGVkIHdpdGggc3RhdHVzIGNvZGUgJyArIHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgIHJlc3BvbnNlLmNvbmZpZyxcbiAgICAgIG51bGwsXG4gICAgICByZXNwb25zZS5yZXF1ZXN0LFxuICAgICAgcmVzcG9uc2VcbiAgICApKTtcbiAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG4vKipcbiAqIFRyYW5zZm9ybSB0aGUgZGF0YSBmb3IgYSByZXF1ZXN0IG9yIGEgcmVzcG9uc2VcbiAqXG4gKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IGRhdGEgVGhlIGRhdGEgdG8gYmUgdHJhbnNmb3JtZWRcbiAqIEBwYXJhbSB7QXJyYXl9IGhlYWRlcnMgVGhlIGhlYWRlcnMgZm9yIHRoZSByZXF1ZXN0IG9yIHJlc3BvbnNlXG4gKiBAcGFyYW0ge0FycmF5fEZ1bmN0aW9ufSBmbnMgQSBzaW5nbGUgZnVuY3Rpb24gb3IgQXJyYXkgb2YgZnVuY3Rpb25zXG4gKiBAcmV0dXJucyB7Kn0gVGhlIHJlc3VsdGluZyB0cmFuc2Zvcm1lZCBkYXRhXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdHJhbnNmb3JtRGF0YShkYXRhLCBoZWFkZXJzLCBmbnMpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIHV0aWxzLmZvckVhY2goZm5zLCBmdW5jdGlvbiB0cmFuc2Zvcm0oZm4pIHtcbiAgICBkYXRhID0gZm4oZGF0YSwgaGVhZGVycyk7XG4gIH0pO1xuXG4gIHJldHVybiBkYXRhO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIG5vcm1hbGl6ZUhlYWRlck5hbWUgPSByZXF1aXJlKCcuL2hlbHBlcnMvbm9ybWFsaXplSGVhZGVyTmFtZScpO1xuXG52YXIgREVGQVVMVF9DT05URU5UX1RZUEUgPSB7XG4gICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ1xufTtcblxuZnVuY3Rpb24gc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsIHZhbHVlKSB7XG4gIGlmICghdXRpbHMuaXNVbmRlZmluZWQoaGVhZGVycykgJiYgdXRpbHMuaXNVbmRlZmluZWQoaGVhZGVyc1snQ29udGVudC1UeXBlJ10pKSB7XG4gICAgaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPSB2YWx1ZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXREZWZhdWx0QWRhcHRlcigpIHtcbiAgdmFyIGFkYXB0ZXI7XG4gIGlmICh0eXBlb2YgWE1MSHR0cFJlcXVlc3QgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgLy8gRm9yIGJyb3dzZXJzIHVzZSBYSFIgYWRhcHRlclxuICAgIGFkYXB0ZXIgPSByZXF1aXJlKCcuL2FkYXB0ZXJzL3hocicpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwocHJvY2VzcykgPT09ICdbb2JqZWN0IHByb2Nlc3NdJykge1xuICAgIC8vIEZvciBub2RlIHVzZSBIVFRQIGFkYXB0ZXJcbiAgICBhZGFwdGVyID0gcmVxdWlyZSgnLi9hZGFwdGVycy9odHRwJyk7XG4gIH1cbiAgcmV0dXJuIGFkYXB0ZXI7XG59XG5cbnZhciBkZWZhdWx0cyA9IHtcbiAgYWRhcHRlcjogZ2V0RGVmYXVsdEFkYXB0ZXIoKSxcblxuICB0cmFuc2Zvcm1SZXF1ZXN0OiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVxdWVzdChkYXRhLCBoZWFkZXJzKSB7XG4gICAgbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCAnQWNjZXB0Jyk7XG4gICAgbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCAnQ29udGVudC1UeXBlJyk7XG4gICAgaWYgKHV0aWxzLmlzRm9ybURhdGEoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQXJyYXlCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQnVmZmVyKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc1N0cmVhbShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNGaWxlKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0Jsb2IoZGF0YSlcbiAgICApIHtcbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNBcnJheUJ1ZmZlclZpZXcoZGF0YSkpIHtcbiAgICAgIHJldHVybiBkYXRhLmJ1ZmZlcjtcbiAgICB9XG4gICAgaWYgKHV0aWxzLmlzVVJMU2VhcmNoUGFyYW1zKGRhdGEpKSB7XG4gICAgICBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDtjaGFyc2V0PXV0Zi04Jyk7XG4gICAgICByZXR1cm4gZGF0YS50b1N0cmluZygpO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNPYmplY3QoZGF0YSkpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04Jyk7XG4gICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xuICB9XSxcblxuICB0cmFuc2Zvcm1SZXNwb25zZTogW2Z1bmN0aW9uIHRyYW5zZm9ybVJlc3BvbnNlKGRhdGEpIHtcbiAgICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgICBpZiAodHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBkYXRhID0gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHsgLyogSWdub3JlICovIH1cbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIC8qKlxuICAgKiBBIHRpbWVvdXQgaW4gbWlsbGlzZWNvbmRzIHRvIGFib3J0IGEgcmVxdWVzdC4gSWYgc2V0IHRvIDAgKGRlZmF1bHQpIGFcbiAgICogdGltZW91dCBpcyBub3QgY3JlYXRlZC5cbiAgICovXG4gIHRpbWVvdXQ6IDAsXG5cbiAgeHNyZkNvb2tpZU5hbWU6ICdYU1JGLVRPS0VOJyxcbiAgeHNyZkhlYWRlck5hbWU6ICdYLVhTUkYtVE9LRU4nLFxuXG4gIG1heENvbnRlbnRMZW5ndGg6IC0xLFxuICBtYXhCb2R5TGVuZ3RoOiAtMSxcblxuICB2YWxpZGF0ZVN0YXR1czogZnVuY3Rpb24gdmFsaWRhdGVTdGF0dXMoc3RhdHVzKSB7XG4gICAgcmV0dXJuIHN0YXR1cyA+PSAyMDAgJiYgc3RhdHVzIDwgMzAwO1xuICB9XG59O1xuXG5kZWZhdWx0cy5oZWFkZXJzID0ge1xuICBjb21tb246IHtcbiAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24sIHRleHQvcGxhaW4sICovKidcbiAgfVxufTtcblxudXRpbHMuZm9yRWFjaChbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kTm9EYXRhKG1ldGhvZCkge1xuICBkZWZhdWx0cy5oZWFkZXJzW21ldGhvZF0gPSB7fTtcbn0pO1xuXG51dGlscy5mb3JFYWNoKFsncG9zdCcsICdwdXQnLCAncGF0Y2gnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZFdpdGhEYXRhKG1ldGhvZCkge1xuICBkZWZhdWx0cy5oZWFkZXJzW21ldGhvZF0gPSB1dGlscy5tZXJnZShERUZBVUxUX0NPTlRFTlRfVFlQRSk7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBkZWZhdWx0cztcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBiaW5kKGZuLCB0aGlzQXJnKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKCkge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBlbmNvZGUodmFsKSB7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQodmFsKS5cbiAgICByZXBsYWNlKC8lM0EvZ2ksICc6JykuXG4gICAgcmVwbGFjZSgvJTI0L2csICckJykuXG4gICAgcmVwbGFjZSgvJTJDL2dpLCAnLCcpLlxuICAgIHJlcGxhY2UoLyUyMC9nLCAnKycpLlxuICAgIHJlcGxhY2UoLyU1Qi9naSwgJ1snKS5cbiAgICByZXBsYWNlKC8lNUQvZ2ksICddJyk7XG59XG5cbi8qKlxuICogQnVpbGQgYSBVUkwgYnkgYXBwZW5kaW5nIHBhcmFtcyB0byB0aGUgZW5kXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCBUaGUgYmFzZSBvZiB0aGUgdXJsIChlLmcuLCBodHRwOi8vd3d3Lmdvb2dsZS5jb20pXG4gKiBAcGFyYW0ge29iamVjdH0gW3BhcmFtc10gVGhlIHBhcmFtcyB0byBiZSBhcHBlbmRlZFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGZvcm1hdHRlZCB1cmxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBidWlsZFVSTCh1cmwsIHBhcmFtcywgcGFyYW1zU2VyaWFsaXplcikge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgaWYgKCFwYXJhbXMpIHtcbiAgICByZXR1cm4gdXJsO1xuICB9XG5cbiAgdmFyIHNlcmlhbGl6ZWRQYXJhbXM7XG4gIGlmIChwYXJhbXNTZXJpYWxpemVyKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtc1NlcmlhbGl6ZXIocGFyYW1zKTtcbiAgfSBlbHNlIGlmICh1dGlscy5pc1VSTFNlYXJjaFBhcmFtcyhwYXJhbXMpKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtcy50b1N0cmluZygpO1xuICB9IGVsc2Uge1xuICAgIHZhciBwYXJ0cyA9IFtdO1xuXG4gICAgdXRpbHMuZm9yRWFjaChwYXJhbXMsIGZ1bmN0aW9uIHNlcmlhbGl6ZSh2YWwsIGtleSkge1xuICAgICAgaWYgKHZhbCA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh1dGlscy5pc0FycmF5KHZhbCkpIHtcbiAgICAgICAga2V5ID0ga2V5ICsgJ1tdJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbCA9IFt2YWxdO1xuICAgICAgfVxuXG4gICAgICB1dGlscy5mb3JFYWNoKHZhbCwgZnVuY3Rpb24gcGFyc2VWYWx1ZSh2KSB7XG4gICAgICAgIGlmICh1dGlscy5pc0RhdGUodikpIHtcbiAgICAgICAgICB2ID0gdi50b0lTT1N0cmluZygpO1xuICAgICAgICB9IGVsc2UgaWYgKHV0aWxzLmlzT2JqZWN0KHYpKSB7XG4gICAgICAgICAgdiA9IEpTT04uc3RyaW5naWZ5KHYpO1xuICAgICAgICB9XG4gICAgICAgIHBhcnRzLnB1c2goZW5jb2RlKGtleSkgKyAnPScgKyBlbmNvZGUodikpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFydHMuam9pbignJicpO1xuICB9XG5cbiAgaWYgKHNlcmlhbGl6ZWRQYXJhbXMpIHtcbiAgICB2YXIgaGFzaG1hcmtJbmRleCA9IHVybC5pbmRleE9mKCcjJyk7XG4gICAgaWYgKGhhc2htYXJrSW5kZXggIT09IC0xKSB7XG4gICAgICB1cmwgPSB1cmwuc2xpY2UoMCwgaGFzaG1hcmtJbmRleCk7XG4gICAgfVxuXG4gICAgdXJsICs9ICh1cmwuaW5kZXhPZignPycpID09PSAtMSA/ICc/JyA6ICcmJykgKyBzZXJpYWxpemVkUGFyYW1zO1xuICB9XG5cbiAgcmV0dXJuIHVybDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBzcGVjaWZpZWQgVVJMc1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aXZlVVJMIFRoZSByZWxhdGl2ZSBVUkxcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21iaW5lZCBVUkxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZWxhdGl2ZVVSTCkge1xuICByZXR1cm4gcmVsYXRpdmVVUkxcbiAgICA/IGJhc2VVUkwucmVwbGFjZSgvXFwvKyQvLCAnJykgKyAnLycgKyByZWxhdGl2ZVVSTC5yZXBsYWNlKC9eXFwvKy8sICcnKVxuICAgIDogYmFzZVVSTDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoXG4gIHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkgP1xuXG4gIC8vIFN0YW5kYXJkIGJyb3dzZXIgZW52cyBzdXBwb3J0IGRvY3VtZW50LmNvb2tpZVxuICAgIChmdW5jdGlvbiBzdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUobmFtZSwgdmFsdWUsIGV4cGlyZXMsIHBhdGgsIGRvbWFpbiwgc2VjdXJlKSB7XG4gICAgICAgICAgdmFyIGNvb2tpZSA9IFtdO1xuICAgICAgICAgIGNvb2tpZS5wdXNoKG5hbWUgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpKTtcblxuICAgICAgICAgIGlmICh1dGlscy5pc051bWJlcihleHBpcmVzKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ2V4cGlyZXM9JyArIG5ldyBEYXRlKGV4cGlyZXMpLnRvR01UU3RyaW5nKCkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhwYXRoKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ3BhdGg9JyArIHBhdGgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhkb21haW4pKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnZG9tYWluPScgKyBkb21haW4pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzZWN1cmUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdzZWN1cmUnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBkb2N1bWVudC5jb29raWUgPSBjb29raWUuam9pbignOyAnKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZWFkOiBmdW5jdGlvbiByZWFkKG5hbWUpIHtcbiAgICAgICAgICB2YXIgbWF0Y2ggPSBkb2N1bWVudC5jb29raWUubWF0Y2gobmV3IFJlZ0V4cCgnKF58O1xcXFxzKikoJyArIG5hbWUgKyAnKT0oW147XSopJykpO1xuICAgICAgICAgIHJldHVybiAobWF0Y2ggPyBkZWNvZGVVUklDb21wb25lbnQobWF0Y2hbM10pIDogbnVsbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUobmFtZSkge1xuICAgICAgICAgIHRoaXMud3JpdGUobmFtZSwgJycsIERhdGUubm93KCkgLSA4NjQwMDAwMCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSkoKSA6XG5cbiAgLy8gTm9uIHN0YW5kYXJkIGJyb3dzZXIgZW52ICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAgIChmdW5jdGlvbiBub25TdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUoKSB7fSxcbiAgICAgICAgcmVhZDogZnVuY3Rpb24gcmVhZCgpIHsgcmV0dXJuIG51bGw7IH0sXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge31cbiAgICAgIH07XG4gICAgfSkoKVxuKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCBVUkwgaXMgYWJzb2x1dGVcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIFRoZSBVUkwgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHNwZWNpZmllZCBVUkwgaXMgYWJzb2x1dGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQWJzb2x1dGVVUkwodXJsKSB7XG4gIC8vIEEgVVJMIGlzIGNvbnNpZGVyZWQgYWJzb2x1dGUgaWYgaXQgYmVnaW5zIHdpdGggXCI8c2NoZW1lPjovL1wiIG9yIFwiLy9cIiAocHJvdG9jb2wtcmVsYXRpdmUgVVJMKS5cbiAgLy8gUkZDIDM5ODYgZGVmaW5lcyBzY2hlbWUgbmFtZSBhcyBhIHNlcXVlbmNlIG9mIGNoYXJhY3RlcnMgYmVnaW5uaW5nIHdpdGggYSBsZXR0ZXIgYW5kIGZvbGxvd2VkXG4gIC8vIGJ5IGFueSBjb21iaW5hdGlvbiBvZiBsZXR0ZXJzLCBkaWdpdHMsIHBsdXMsIHBlcmlvZCwgb3IgaHlwaGVuLlxuICByZXR1cm4gL14oW2Etel1bYS16XFxkXFwrXFwtXFwuXSo6KT9cXC9cXC8vaS50ZXN0KHVybCk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKFxuICB1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpID9cblxuICAvLyBTdGFuZGFyZCBicm93c2VyIGVudnMgaGF2ZSBmdWxsIHN1cHBvcnQgb2YgdGhlIEFQSXMgbmVlZGVkIHRvIHRlc3RcbiAgLy8gd2hldGhlciB0aGUgcmVxdWVzdCBVUkwgaXMgb2YgdGhlIHNhbWUgb3JpZ2luIGFzIGN1cnJlbnQgbG9jYXRpb24uXG4gICAgKGZ1bmN0aW9uIHN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHZhciBtc2llID0gLyhtc2llfHRyaWRlbnQpL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgICAgIHZhciB1cmxQYXJzaW5nTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgIHZhciBvcmlnaW5VUkw7XG5cbiAgICAgIC8qKlxuICAgICogUGFyc2UgYSBVUkwgdG8gZGlzY292ZXIgaXQncyBjb21wb25lbnRzXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHVybCBUaGUgVVJMIHRvIGJlIHBhcnNlZFxuICAgICogQHJldHVybnMge09iamVjdH1cbiAgICAqL1xuICAgICAgZnVuY3Rpb24gcmVzb2x2ZVVSTCh1cmwpIHtcbiAgICAgICAgdmFyIGhyZWYgPSB1cmw7XG5cbiAgICAgICAgaWYgKG1zaWUpIHtcbiAgICAgICAgLy8gSUUgbmVlZHMgYXR0cmlidXRlIHNldCB0d2ljZSB0byBub3JtYWxpemUgcHJvcGVydGllc1xuICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnNldEF0dHJpYnV0ZSgnaHJlZicsIGhyZWYpO1xuICAgICAgICAgIGhyZWYgPSB1cmxQYXJzaW5nTm9kZS5ocmVmO1xuICAgICAgICB9XG5cbiAgICAgICAgdXJsUGFyc2luZ05vZGUuc2V0QXR0cmlidXRlKCdocmVmJywgaHJlZik7XG5cbiAgICAgICAgLy8gdXJsUGFyc2luZ05vZGUgcHJvdmlkZXMgdGhlIFVybFV0aWxzIGludGVyZmFjZSAtIGh0dHA6Ly91cmwuc3BlYy53aGF0d2cub3JnLyN1cmx1dGlsc1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGhyZWY6IHVybFBhcnNpbmdOb2RlLmhyZWYsXG4gICAgICAgICAgcHJvdG9jb2w6IHVybFBhcnNpbmdOb2RlLnByb3RvY29sID8gdXJsUGFyc2luZ05vZGUucHJvdG9jb2wucmVwbGFjZSgvOiQvLCAnJykgOiAnJyxcbiAgICAgICAgICBob3N0OiB1cmxQYXJzaW5nTm9kZS5ob3N0LFxuICAgICAgICAgIHNlYXJjaDogdXJsUGFyc2luZ05vZGUuc2VhcmNoID8gdXJsUGFyc2luZ05vZGUuc2VhcmNoLnJlcGxhY2UoL15cXD8vLCAnJykgOiAnJyxcbiAgICAgICAgICBoYXNoOiB1cmxQYXJzaW5nTm9kZS5oYXNoID8gdXJsUGFyc2luZ05vZGUuaGFzaC5yZXBsYWNlKC9eIy8sICcnKSA6ICcnLFxuICAgICAgICAgIGhvc3RuYW1lOiB1cmxQYXJzaW5nTm9kZS5ob3N0bmFtZSxcbiAgICAgICAgICBwb3J0OiB1cmxQYXJzaW5nTm9kZS5wb3J0LFxuICAgICAgICAgIHBhdGhuYW1lOiAodXJsUGFyc2luZ05vZGUucGF0aG5hbWUuY2hhckF0KDApID09PSAnLycpID9cbiAgICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lIDpcbiAgICAgICAgICAgICcvJyArIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIG9yaWdpblVSTCA9IHJlc29sdmVVUkwod2luZG93LmxvY2F0aW9uLmhyZWYpO1xuXG4gICAgICAvKipcbiAgICAqIERldGVybWluZSBpZiBhIFVSTCBzaGFyZXMgdGhlIHNhbWUgb3JpZ2luIGFzIHRoZSBjdXJyZW50IGxvY2F0aW9uXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHJlcXVlc3RVUkwgVGhlIFVSTCB0byB0ZXN0XG4gICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiBVUkwgc2hhcmVzIHRoZSBzYW1lIG9yaWdpbiwgb3RoZXJ3aXNlIGZhbHNlXG4gICAgKi9cbiAgICAgIHJldHVybiBmdW5jdGlvbiBpc1VSTFNhbWVPcmlnaW4ocmVxdWVzdFVSTCkge1xuICAgICAgICB2YXIgcGFyc2VkID0gKHV0aWxzLmlzU3RyaW5nKHJlcXVlc3RVUkwpKSA/IHJlc29sdmVVUkwocmVxdWVzdFVSTCkgOiByZXF1ZXN0VVJMO1xuICAgICAgICByZXR1cm4gKHBhcnNlZC5wcm90b2NvbCA9PT0gb3JpZ2luVVJMLnByb3RvY29sICYmXG4gICAgICAgICAgICBwYXJzZWQuaG9zdCA9PT0gb3JpZ2luVVJMLmhvc3QpO1xuICAgICAgfTtcbiAgICB9KSgpIDpcblxuICAvLyBOb24gc3RhbmRhcmQgYnJvd3NlciBlbnZzICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAgIChmdW5jdGlvbiBub25TdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gaXNVUkxTYW1lT3JpZ2luKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH07XG4gICAgfSkoKVxuKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsIG5vcm1hbGl6ZWROYW1lKSB7XG4gIHV0aWxzLmZvckVhY2goaGVhZGVycywgZnVuY3Rpb24gcHJvY2Vzc0hlYWRlcih2YWx1ZSwgbmFtZSkge1xuICAgIGlmIChuYW1lICE9PSBub3JtYWxpemVkTmFtZSAmJiBuYW1lLnRvVXBwZXJDYXNlKCkgPT09IG5vcm1hbGl6ZWROYW1lLnRvVXBwZXJDYXNlKCkpIHtcbiAgICAgIGhlYWRlcnNbbm9ybWFsaXplZE5hbWVdID0gdmFsdWU7XG4gICAgICBkZWxldGUgaGVhZGVyc1tuYW1lXTtcbiAgICB9XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG4vLyBIZWFkZXJzIHdob3NlIGR1cGxpY2F0ZXMgYXJlIGlnbm9yZWQgYnkgbm9kZVxuLy8gYy5mLiBodHRwczovL25vZGVqcy5vcmcvYXBpL2h0dHAuaHRtbCNodHRwX21lc3NhZ2VfaGVhZGVyc1xudmFyIGlnbm9yZUR1cGxpY2F0ZU9mID0gW1xuICAnYWdlJywgJ2F1dGhvcml6YXRpb24nLCAnY29udGVudC1sZW5ndGgnLCAnY29udGVudC10eXBlJywgJ2V0YWcnLFxuICAnZXhwaXJlcycsICdmcm9tJywgJ2hvc3QnLCAnaWYtbW9kaWZpZWQtc2luY2UnLCAnaWYtdW5tb2RpZmllZC1zaW5jZScsXG4gICdsYXN0LW1vZGlmaWVkJywgJ2xvY2F0aW9uJywgJ21heC1mb3J3YXJkcycsICdwcm94eS1hdXRob3JpemF0aW9uJyxcbiAgJ3JlZmVyZXInLCAncmV0cnktYWZ0ZXInLCAndXNlci1hZ2VudCdcbl07XG5cbi8qKlxuICogUGFyc2UgaGVhZGVycyBpbnRvIGFuIG9iamVjdFxuICpcbiAqIGBgYFxuICogRGF0ZTogV2VkLCAyNyBBdWcgMjAxNCAwODo1ODo0OSBHTVRcbiAqIENvbnRlbnQtVHlwZTogYXBwbGljYXRpb24vanNvblxuICogQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVxuICogVHJhbnNmZXItRW5jb2Rpbmc6IGNodW5rZWRcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBoZWFkZXJzIEhlYWRlcnMgbmVlZGluZyB0byBiZSBwYXJzZWRcbiAqIEByZXR1cm5zIHtPYmplY3R9IEhlYWRlcnMgcGFyc2VkIGludG8gYW4gb2JqZWN0XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcGFyc2VIZWFkZXJzKGhlYWRlcnMpIHtcbiAgdmFyIHBhcnNlZCA9IHt9O1xuICB2YXIga2V5O1xuICB2YXIgdmFsO1xuICB2YXIgaTtcblxuICBpZiAoIWhlYWRlcnMpIHsgcmV0dXJuIHBhcnNlZDsgfVxuXG4gIHV0aWxzLmZvckVhY2goaGVhZGVycy5zcGxpdCgnXFxuJyksIGZ1bmN0aW9uIHBhcnNlcihsaW5lKSB7XG4gICAgaSA9IGxpbmUuaW5kZXhPZignOicpO1xuICAgIGtleSA9IHV0aWxzLnRyaW0obGluZS5zdWJzdHIoMCwgaSkpLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFsID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cihpICsgMSkpO1xuXG4gICAgaWYgKGtleSkge1xuICAgICAgaWYgKHBhcnNlZFtrZXldICYmIGlnbm9yZUR1cGxpY2F0ZU9mLmluZGV4T2Yoa2V5KSA+PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChrZXkgPT09ICdzZXQtY29va2llJykge1xuICAgICAgICBwYXJzZWRba2V5XSA9IChwYXJzZWRba2V5XSA/IHBhcnNlZFtrZXldIDogW10pLmNvbmNhdChbdmFsXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYXJzZWRba2V5XSA9IHBhcnNlZFtrZXldID8gcGFyc2VkW2tleV0gKyAnLCAnICsgdmFsIDogdmFsO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHBhcnNlZDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogU3ludGFjdGljIHN1Z2FyIGZvciBpbnZva2luZyBhIGZ1bmN0aW9uIGFuZCBleHBhbmRpbmcgYW4gYXJyYXkgZm9yIGFyZ3VtZW50cy5cbiAqXG4gKiBDb21tb24gdXNlIGNhc2Ugd291bGQgYmUgdG8gdXNlIGBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHlgLlxuICpcbiAqICBgYGBqc1xuICogIGZ1bmN0aW9uIGYoeCwgeSwgeikge31cbiAqICB2YXIgYXJncyA9IFsxLCAyLCAzXTtcbiAqICBmLmFwcGx5KG51bGwsIGFyZ3MpO1xuICogIGBgYFxuICpcbiAqIFdpdGggYHNwcmVhZGAgdGhpcyBleGFtcGxlIGNhbiBiZSByZS13cml0dGVuLlxuICpcbiAqICBgYGBqc1xuICogIHNwcmVhZChmdW5jdGlvbih4LCB5LCB6KSB7fSkoWzEsIDIsIDNdKTtcbiAqICBgYGBcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHJldHVybnMge0Z1bmN0aW9ufVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNwcmVhZChjYWxsYmFjaykge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcChhcnIpIHtcbiAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkobnVsbCwgYXJyKTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBiaW5kID0gcmVxdWlyZSgnLi9oZWxwZXJzL2JpbmQnKTtcblxuLypnbG9iYWwgdG9TdHJpbmc6dHJ1ZSovXG5cbi8vIHV0aWxzIGlzIGEgbGlicmFyeSBvZiBnZW5lcmljIGhlbHBlciBmdW5jdGlvbnMgbm9uLXNwZWNpZmljIHRvIGF4aW9zXG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXkodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgdW5kZWZpbmVkXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHZhbHVlIGlzIHVuZGVmaW5lZCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3VuZGVmaW5lZCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQnVmZmVyKHZhbCkge1xuICByZXR1cm4gdmFsICE9PSBudWxsICYmICFpc1VuZGVmaW5lZCh2YWwpICYmIHZhbC5jb25zdHJ1Y3RvciAhPT0gbnVsbCAmJiAhaXNVbmRlZmluZWQodmFsLmNvbnN0cnVjdG9yKVxuICAgICYmIHR5cGVvZiB2YWwuY29uc3RydWN0b3IuaXNCdWZmZXIgPT09ICdmdW5jdGlvbicgJiYgdmFsLmNvbnN0cnVjdG9yLmlzQnVmZmVyKHZhbCk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXIodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5QnVmZmVyXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGb3JtRGF0YVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEZvcm1EYXRhLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGb3JtRGF0YSh2YWwpIHtcbiAgcmV0dXJuICh0eXBlb2YgRm9ybURhdGEgIT09ICd1bmRlZmluZWQnKSAmJiAodmFsIGluc3RhbmNlb2YgRm9ybURhdGEpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXJWaWV3KHZhbCkge1xuICB2YXIgcmVzdWx0O1xuICBpZiAoKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcpICYmIChBcnJheUJ1ZmZlci5pc1ZpZXcpKSB7XG4gICAgcmVzdWx0ID0gQXJyYXlCdWZmZXIuaXNWaWV3KHZhbCk7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ID0gKHZhbCkgJiYgKHZhbC5idWZmZXIpICYmICh2YWwuYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBTdHJpbmdcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFN0cmluZywgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyaW5nKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3N0cmluZyc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBOdW1iZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIE51bWJlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzTnVtYmVyKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ251bWJlcic7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gT2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBwbGFpbiBPYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgcGxhaW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWwpIHtcbiAgaWYgKHRvU3RyaW5nLmNhbGwodmFsKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgcHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbCk7XG4gIHJldHVybiBwcm90b3R5cGUgPT09IG51bGwgfHwgcHJvdG90eXBlID09PSBPYmplY3QucHJvdG90eXBlO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRGF0ZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRGF0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRGF0ZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRmlsZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRmlsZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRmlsZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRmlsZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgQmxvYlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgQmxvYiwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQmxvYih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQmxvYl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEZ1bmN0aW9uLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFN0cmVhbVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgU3RyZWFtLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTdHJlYW0odmFsKSB7XG4gIHJldHVybiBpc09iamVjdCh2YWwpICYmIGlzRnVuY3Rpb24odmFsLnBpcGUpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVVJMU2VhcmNoUGFyYW1zKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIFVSTFNlYXJjaFBhcmFtcyAhPT0gJ3VuZGVmaW5lZCcgJiYgdmFsIGluc3RhbmNlb2YgVVJMU2VhcmNoUGFyYW1zO1xufVxuXG4vKipcbiAqIFRyaW0gZXhjZXNzIHdoaXRlc3BhY2Ugb2ZmIHRoZSBiZWdpbm5pbmcgYW5kIGVuZCBvZiBhIHN0cmluZ1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgVGhlIFN0cmluZyB0byB0cmltXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgU3RyaW5nIGZyZWVkIG9mIGV4Y2VzcyB3aGl0ZXNwYWNlXG4gKi9cbmZ1bmN0aW9uIHRyaW0oc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyovLCAnJykucmVwbGFjZSgvXFxzKiQvLCAnJyk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIHdlJ3JlIHJ1bm5pbmcgaW4gYSBzdGFuZGFyZCBicm93c2VyIGVudmlyb25tZW50XG4gKlxuICogVGhpcyBhbGxvd3MgYXhpb3MgdG8gcnVuIGluIGEgd2ViIHdvcmtlciwgYW5kIHJlYWN0LW5hdGl2ZS5cbiAqIEJvdGggZW52aXJvbm1lbnRzIHN1cHBvcnQgWE1MSHR0cFJlcXVlc3QsIGJ1dCBub3QgZnVsbHkgc3RhbmRhcmQgZ2xvYmFscy5cbiAqXG4gKiB3ZWIgd29ya2VyczpcbiAqICB0eXBlb2Ygd2luZG93IC0+IHVuZGVmaW5lZFxuICogIHR5cGVvZiBkb2N1bWVudCAtPiB1bmRlZmluZWRcbiAqXG4gKiByZWFjdC1uYXRpdmU6XG4gKiAgbmF2aWdhdG9yLnByb2R1Y3QgLT4gJ1JlYWN0TmF0aXZlJ1xuICogbmF0aXZlc2NyaXB0XG4gKiAgbmF2aWdhdG9yLnByb2R1Y3QgLT4gJ05hdGl2ZVNjcmlwdCcgb3IgJ05TJ1xuICovXG5mdW5jdGlvbiBpc1N0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnICYmIChuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ1JlYWN0TmF0aXZlJyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRvci5wcm9kdWN0ID09PSAnTmF0aXZlU2NyaXB0JyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRvci5wcm9kdWN0ID09PSAnTlMnKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gKFxuICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmXG4gICAgdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJ1xuICApO1xufVxuXG4vKipcbiAqIEl0ZXJhdGUgb3ZlciBhbiBBcnJheSBvciBhbiBPYmplY3QgaW52b2tpbmcgYSBmdW5jdGlvbiBmb3IgZWFjaCBpdGVtLlxuICpcbiAqIElmIGBvYmpgIGlzIGFuIEFycmF5IGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIHBhc3NpbmdcbiAqIHRoZSB2YWx1ZSwgaW5kZXgsIGFuZCBjb21wbGV0ZSBhcnJheSBmb3IgZWFjaCBpdGVtLlxuICpcbiAqIElmICdvYmonIGlzIGFuIE9iamVjdCBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBwYXNzaW5nXG4gKiB0aGUgdmFsdWUsIGtleSwgYW5kIGNvbXBsZXRlIG9iamVjdCBmb3IgZWFjaCBwcm9wZXJ0eS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdHxBcnJheX0gb2JqIFRoZSBvYmplY3QgdG8gaXRlcmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGNhbGxiYWNrIHRvIGludm9rZSBmb3IgZWFjaCBpdGVtXG4gKi9cbmZ1bmN0aW9uIGZvckVhY2gob2JqLCBmbikge1xuICAvLyBEb24ndCBib3RoZXIgaWYgbm8gdmFsdWUgcHJvdmlkZWRcbiAgaWYgKG9iaiA9PT0gbnVsbCB8fCB0eXBlb2Ygb2JqID09PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIEZvcmNlIGFuIGFycmF5IGlmIG5vdCBhbHJlYWR5IHNvbWV0aGluZyBpdGVyYWJsZVxuICBpZiAodHlwZW9mIG9iaiAhPT0gJ29iamVjdCcpIHtcbiAgICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgICBvYmogPSBbb2JqXTtcbiAgfVxuXG4gIGlmIChpc0FycmF5KG9iaikpIHtcbiAgICAvLyBJdGVyYXRlIG92ZXIgYXJyYXkgdmFsdWVzXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBvYmoubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBmbi5jYWxsKG51bGwsIG9ialtpXSwgaSwgb2JqKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIG9iamVjdCBrZXlzXG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIHtcbiAgICAgICAgZm4uY2FsbChudWxsLCBvYmpba2V5XSwga2V5LCBvYmopO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEFjY2VwdHMgdmFyYXJncyBleHBlY3RpbmcgZWFjaCBhcmd1bWVudCB0byBiZSBhbiBvYmplY3QsIHRoZW5cbiAqIGltbXV0YWJseSBtZXJnZXMgdGhlIHByb3BlcnRpZXMgb2YgZWFjaCBvYmplY3QgYW5kIHJldHVybnMgcmVzdWx0LlxuICpcbiAqIFdoZW4gbXVsdGlwbGUgb2JqZWN0cyBjb250YWluIHRoZSBzYW1lIGtleSB0aGUgbGF0ZXIgb2JqZWN0IGluXG4gKiB0aGUgYXJndW1lbnRzIGxpc3Qgd2lsbCB0YWtlIHByZWNlZGVuY2UuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiBgYGBqc1xuICogdmFyIHJlc3VsdCA9IG1lcmdlKHtmb286IDEyM30sIHtmb286IDQ1Nn0pO1xuICogY29uc29sZS5sb2cocmVzdWx0LmZvbyk7IC8vIG91dHB1dHMgNDU2XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqMSBPYmplY3QgdG8gbWVyZ2VcbiAqIEByZXR1cm5zIHtPYmplY3R9IFJlc3VsdCBvZiBhbGwgbWVyZ2UgcHJvcGVydGllc1xuICovXG5mdW5jdGlvbiBtZXJnZSgvKiBvYmoxLCBvYmoyLCBvYmozLCAuLi4gKi8pIHtcbiAgdmFyIHJlc3VsdCA9IHt9O1xuICBmdW5jdGlvbiBhc3NpZ25WYWx1ZSh2YWwsIGtleSkge1xuICAgIGlmIChpc1BsYWluT2JqZWN0KHJlc3VsdFtrZXldKSAmJiBpc1BsYWluT2JqZWN0KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gbWVyZ2UocmVzdWx0W2tleV0sIHZhbCk7XG4gICAgfSBlbHNlIGlmIChpc1BsYWluT2JqZWN0KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gbWVyZ2Uoe30sIHZhbCk7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gdmFsLnNsaWNlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdFtrZXldID0gdmFsO1xuICAgIH1cbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwLCBsID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIGZvckVhY2goYXJndW1lbnRzW2ldLCBhc3NpZ25WYWx1ZSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBFeHRlbmRzIG9iamVjdCBhIGJ5IG11dGFibHkgYWRkaW5nIHRvIGl0IHRoZSBwcm9wZXJ0aWVzIG9mIG9iamVjdCBiLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhIFRoZSBvYmplY3QgdG8gYmUgZXh0ZW5kZWRcbiAqIEBwYXJhbSB7T2JqZWN0fSBiIFRoZSBvYmplY3QgdG8gY29weSBwcm9wZXJ0aWVzIGZyb21cbiAqIEBwYXJhbSB7T2JqZWN0fSB0aGlzQXJnIFRoZSBvYmplY3QgdG8gYmluZCBmdW5jdGlvbiB0b1xuICogQHJldHVybiB7T2JqZWN0fSBUaGUgcmVzdWx0aW5nIHZhbHVlIG9mIG9iamVjdCBhXG4gKi9cbmZ1bmN0aW9uIGV4dGVuZChhLCBiLCB0aGlzQXJnKSB7XG4gIGZvckVhY2goYiwgZnVuY3Rpb24gYXNzaWduVmFsdWUodmFsLCBrZXkpIHtcbiAgICBpZiAodGhpc0FyZyAmJiB0eXBlb2YgdmFsID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBhW2tleV0gPSBiaW5kKHZhbCwgdGhpc0FyZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFba2V5XSA9IHZhbDtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gYTtcbn1cblxuLyoqXG4gKiBSZW1vdmUgYnl0ZSBvcmRlciBtYXJrZXIuIFRoaXMgY2F0Y2hlcyBFRiBCQiBCRiAodGhlIFVURi04IEJPTSlcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gY29udGVudCB3aXRoIEJPTVxuICogQHJldHVybiB7c3RyaW5nfSBjb250ZW50IHZhbHVlIHdpdGhvdXQgQk9NXG4gKi9cbmZ1bmN0aW9uIHN0cmlwQk9NKGNvbnRlbnQpIHtcbiAgaWYgKGNvbnRlbnQuY2hhckNvZGVBdCgwKSA9PT0gMHhGRUZGKSB7XG4gICAgY29udGVudCA9IGNvbnRlbnQuc2xpY2UoMSk7XG4gIH1cbiAgcmV0dXJuIGNvbnRlbnQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpc0FycmF5OiBpc0FycmF5LFxuICBpc0FycmF5QnVmZmVyOiBpc0FycmF5QnVmZmVyLFxuICBpc0J1ZmZlcjogaXNCdWZmZXIsXG4gIGlzRm9ybURhdGE6IGlzRm9ybURhdGEsXG4gIGlzQXJyYXlCdWZmZXJWaWV3OiBpc0FycmF5QnVmZmVyVmlldyxcbiAgaXNTdHJpbmc6IGlzU3RyaW5nLFxuICBpc051bWJlcjogaXNOdW1iZXIsXG4gIGlzT2JqZWN0OiBpc09iamVjdCxcbiAgaXNQbGFpbk9iamVjdDogaXNQbGFpbk9iamVjdCxcbiAgaXNVbmRlZmluZWQ6IGlzVW5kZWZpbmVkLFxuICBpc0RhdGU6IGlzRGF0ZSxcbiAgaXNGaWxlOiBpc0ZpbGUsXG4gIGlzQmxvYjogaXNCbG9iLFxuICBpc0Z1bmN0aW9uOiBpc0Z1bmN0aW9uLFxuICBpc1N0cmVhbTogaXNTdHJlYW0sXG4gIGlzVVJMU2VhcmNoUGFyYW1zOiBpc1VSTFNlYXJjaFBhcmFtcyxcbiAgaXNTdGFuZGFyZEJyb3dzZXJFbnY6IGlzU3RhbmRhcmRCcm93c2VyRW52LFxuICBmb3JFYWNoOiBmb3JFYWNoLFxuICBtZXJnZTogbWVyZ2UsXG4gIGV4dGVuZDogZXh0ZW5kLFxuICB0cmltOiB0cmltLFxuICBzdHJpcEJPTTogc3RyaXBCT01cbn07XG4iLCIvLyBJbXBvcnRzXG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyBmcm9tIFwiLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2Nzc1dpdGhNYXBwaW5nVG9TdHJpbmcuanNcIjtcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18gZnJvbSBcIi4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanNcIjtcbmltcG9ydCBfX19DU1NfTE9BREVSX0dFVF9VUkxfSU1QT1JUX19fIGZyb20gXCIuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvZ2V0VXJsLmpzXCI7XG5pbXBvcnQgX19fQ1NTX0xPQURFUl9VUkxfSU1QT1JUXzBfX18gZnJvbSBcIi4uL2ltZy9sb2dpbi1iZy5qcGdcIjtcbnZhciBfX19DU1NfTE9BREVSX0VYUE9SVF9fXyA9IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyhfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fKTtcbnZhciBfX19DU1NfTE9BREVSX1VSTF9SRVBMQUNFTUVOVF8wX19fID0gX19fQ1NTX0xPQURFUl9HRVRfVVJMX0lNUE9SVF9fXyhfX19DU1NfTE9BREVSX1VSTF9JTVBPUlRfMF9fXyk7XG4vLyBNb2R1bGVcbl9fX0NTU19MT0FERVJfRVhQT1JUX19fLnB1c2goW21vZHVsZS5pZCwgXCIqLFxcbio6OmFmdGVyLFxcbio6OmJlZm9yZSB7XFxuICBtYXJnaW46IDA7XFxuICBwYWRkaW5nOiAwO1xcbiAgYm94LXNpemluZzogaW5oZXJpdDsgfVxcblxcbmh0bWwge1xcbiAgZm9udC1zaXplOiA2Mi41JTsgfVxcblxcbmJvZHkge1xcbiAgYm94LXNpemluZzogYm9yZGVyLWJveDtcXG4gIG92ZXJmbG93LXg6IGhpZGRlbjtcXG4gIGZvbnQtc2l6ZTogMS42cmVtO1xcbiAgYmFja2dyb3VuZC1zaXplOiBjb3ZlcjtcXG4gIGJhY2tncm91bmQtcmVwZWF0OiBuby1yZXBlYXQ7XFxuICBoZWlnaHQ6IDEyNy41cmVtO1xcbiAgZm9udC1mYW1pbHk6ICdMYXRvJywgc2Fucy1zZXJpZjsgfVxcblxcbltoaWRkZW5dIHtcXG4gIGRpc3BsYXk6IG5vbmUgIWltcG9ydGFudDsgfVxcblxcbi5oZWFkaW5nLXRlcnRpYXJ5IHtcXG4gIGZvbnQtc2l6ZTogMi40cmVtO1xcbiAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTsgfVxcbiAgLmhlYWRpbmctdGVydGlhcnktLXdoaXRlIHtcXG4gICAgY29sb3I6ICNmZmY7IH1cXG5cXG4ubWItMTAge1xcbiAgbWFyZ2luLWJvdHRvbTogMXJlbTsgfVxcblxcbi5tYi0yMCB7XFxuICBtYXJnaW4tYm90dG9tOiAycmVtOyB9XFxuXFxuLm10LTUwIHtcXG4gIG1hcmdpbi10b3A6IDVyZW07IH1cXG5cXG4uYnRuLCAuYnRuOmxpbmssIC5idG46dmlzaXRlZCB7XFxuICBwYWRkaW5nOiAuNzVyZW0gMnJlbTtcXG4gIGJvcmRlci1yYWRpdXM6IC41cmVtO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2YyZjJmMjtcXG4gIGZvbnQtd2VpZ2h0OiA0MDA7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7IH1cXG5cXG4uYnRuOmFjdGl2ZSwgLmJ0bjpmb2N1cyB7XFxuICBvdXRsaW5lOiBub25lO1xcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC0xcHgpO1xcbiAgYm94LXNoYWRvdzogMCAwLjVyZW0gMXJlbSByZ2JhKDAsIDAsIDAsIDAuMik7IH1cXG5cXG4ubG9naW4tZm9ybV9fZ3JvdXA6bm90KDpsYXN0LWNoaWxkKSB7XFxuICBtYXJnaW4tYm90dG9tOiAyLjVyZW07IH1cXG5cXG4ubG9naW4tZm9ybV9fbGFiZWwge1xcbiAgbWFyZ2luLXJpZ2h0OiAuN3JlbTtcXG4gIGNvbG9yOiAjZmZmO1xcbiAgZm9udC1zaXplOiAxLjhyZW07XFxuICBmb250LXdlaWdodDogNDAwOyB9XFxuXFxuLmxvZ2luLWZvcm1fX2lucHV0IHtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxuICBwYWRkaW5nOiAuNXJlbSAwO1xcbiAgYm9yZGVyOiBub25lOyB9XFxuXFxuLmxvZ2luLWZvcm1fX2J0bi13cmFwcGVyIHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsgfVxcblxcbi5sb2dpbl9fcmVnaXN0ZXItdGV4dCB7XFxuICBtYXJnaW4tdG9wOiAxLjVyZW07XFxuICBjb2xvcjogI2ZmZjsgfVxcblxcbi5sb2dpbl9fcmVnaXN0ZXItbGluayB7XFxuICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICBjb2xvcjogI2ZmZjtcXG4gIHRyYW5zaXRpb246IGFsbCAuMnM7IH1cXG4gIC5sb2dpbl9fcmVnaXN0ZXItbGluazpob3ZlciB7XFxuICAgIGNvbG9yOiAjZmY4MDAwO1xcbiAgICB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZTsgfVxcblxcbi5uYXYge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxuICBwYWRkaW5nOiAycmVtIDZyZW07XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICMwMDA7IH1cXG4gIC5uYXZfX2l0ZW0ge1xcbiAgICBsaXN0LXN0eWxlOiBub25lOyB9XFxuICAgIC5uYXZfX2l0ZW0tLXNlYXJjaCB7XFxuICAgICAgZmxleDogMCAwIDI1JTsgfVxcbiAgLm5hdl9fbGluayB7XFxuICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gICAgY29sb3I6ICMwMDA7XFxuICAgIHRyYW5zaXRpb246IGFsbCAuMnM7IH1cXG4gICAgLm5hdl9fbGluazpob3ZlciB7XFxuICAgICAgbWFyZ2luLWJvdHRvbTogMnB4O1xcbiAgICAgIGNvbG9yOiAjZmZhNjRkO1xcbiAgICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjZmZhNjRkOyB9XFxuICAgIC5uYXZfX2xpbmstLWhvbWU6aG92ZXIgLm5hdl9faWNvbi1wYXRoLS1ob21lIHtcXG4gICAgICBmaWxsOiAjZmY4MDAwOyB9XFxuICAubmF2X19zZWFyY2gge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfVxcbiAgICAubmF2X19zZWFyY2gtaW5wdXQge1xcbiAgICAgIHdpZHRoOiA5MCU7XFxuICAgICAgYm9yZGVyLXJhZGl1czogM3JlbTtcXG4gICAgICBwYWRkaW5nOiAxcmVtIDJyZW07XFxuICAgICAgYm9yZGVyOiAxcHggc29saWQgI2JmYmZiZjtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjJmMmYyO1xcbiAgICAgIHRyYW5zaXRpb246IHdpZHRoIC4yczsgfVxcbiAgICAgIC5uYXZfX3NlYXJjaC1pbnB1dDpmb2N1cyB7XFxuICAgICAgICBvdXRsaW5lOiBub25lO1xcbiAgICAgICAgd2lkdGg6IDEyMCU7IH1cXG4gICAgLm5hdl9fc2VhcmNoLWJ0biB7XFxuICAgICAgY3Vyc29yOiBwb2ludGVyOyB9XFxuICAubmF2X19pY29uLXNpemluZy0taG9tZSB7XFxuICAgIHdpZHRoOiAzcmVtO1xcbiAgICBoZWlnaHQ6IDNyZW07IH1cXG4gIC5uYXZfX2ljb24tc2l6aW5nLS1zZWFyY2gge1xcbiAgICB3aWR0aDogMnJlbTtcXG4gICAgaGVpZ2h0OiAycmVtO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTE1MCUpOyB9XFxuICAubmF2X19pY29uLXBhdGgge1xcbiAgICBmaWxsOiAjYmZiZmJmOyB9XFxuXFxuLnJlZ2lzdGVyLWZvcm1fX2dyb3VwIHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxuICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAucmVnaXN0ZXItZm9ybV9fZ3JvdXA6bm90KDpsYXN0LWNoaWxkKSB7XFxuICAgIG1hcmdpbi1ib3R0b206IDNyZW07IH1cXG5cXG4ucmVnaXN0ZXItZm9ybV9fbGFiZWwge1xcbiAgbWFyZ2luLXJpZ2h0OiA0cmVtO1xcbiAgY29sb3I6ICNmZmY7XFxuICBmb250LXNpemU6IDEuOHJlbTtcXG4gIGZvbnQtd2VpZ2h0OiA0MDA7IH1cXG5cXG4ucmVnaXN0ZXItZm9ybV9faW5wdXQge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2YyZjJmMjtcXG4gIHBhZGRpbmc6IC41cmVtIDA7XFxuICBib3JkZXI6IG5vbmU7IH1cXG5cXG4ucmVnaXN0ZXItZm9ybV9fYnRuLXdyYXBwZXIge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyOyB9XFxuXFxuLnJlZ2lzdGVyX19sb2dpbi10ZXh0IHtcXG4gIG1hcmdpbi10b3A6IDEuNXJlbTtcXG4gIGNvbG9yOiAjZmZmOyB9XFxuXFxuLnJlZ2lzdGVyX19sb2dpbi1saW5rIHtcXG4gIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gIGNvbG9yOiAjZmZmO1xcbiAgdHJhbnNpdGlvbjogYWxsIC4yczsgfVxcbiAgLnJlZ2lzdGVyX19sb2dpbi1saW5rOmhvdmVyIHtcXG4gICAgY29sb3I6ICNmZjgwMDA7XFxuICAgIHRleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lOyB9XFxuXFxuLmVycm9yIHtcXG4gIG1hcmdpbi10b3A6IDJyZW07XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmY4MDgwO1xcbiAgYm9yZGVyLXJhZGl1czogMTBweDtcXG4gIHBhZGRpbmc6IDJyZW07XFxuICBmb250LXNpemU6IDJyZW07XFxuICBncmlkLWNvbHVtbjogY2VudGVyLXN0YXJ0IC8gY2VudGVyLWVuZDtcXG4gIGZvbnQtd2VpZ2h0OiA3MDA7IH1cXG5cXG4uc2VhcmNoLWZvcm0ge1xcbiAgcGFkZGluZzogMnJlbSAyNXJlbTsgfVxcbiAgLnNlYXJjaC1mb3JtX19ncm91cCB7XFxuICAgIHdpZHRoOiA3NSU7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIG1hcmdpbi1ib3R0b206IDNyZW07XFxuICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjMDAwO1xcbiAgICBhbGlnbi1pdGVtczogZmxleC1zdGFydDtcXG4gICAgcGFkZGluZzogLjVyZW0gNHJlbSAuNXJlbSAwOyB9XFxuICAuc2VhcmNoLWZvcm1fX2xhYmVsIHtcXG4gICAgZmxleDogMCAwIDIwJTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgYWxpZ24taXRlbXM6IGZsZXgtc3RhcnQ7XFxuICAgIG1hcmdpbi10b3A6IC43cmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX2dyb3VwLWlucHV0LXdyYXBwZXIge1xcbiAgICBmbGV4OiAwIDAgODAlOyB9XFxuICAuc2VhcmNoLWZvcm1fX3RpcCB7XFxuICAgIGZvbnQtc2l6ZTogMXJlbTtcXG4gICAgbGluZS1oZWlnaHQ6IDEuNDtcXG4gICAgd2lkdGg6IDcwJTsgfVxcbiAgLnNlYXJjaC1mb3JtX19pbnB1dC10ZXh0IHtcXG4gICAgd2lkdGg6IDQwcmVtO1xcbiAgICBoZWlnaHQ6IDRyZW07XFxuICAgIG1hcmdpbi1ib3R0b206IDFyZW07XFxuICAgIHBhZGRpbmc6IDFyZW07XFxuICAgIGJvcmRlcjogc29saWQgMXB4ICNiZmJmYmY7XFxuICAgIGJvcmRlci1yYWRpdXM6IDVweDsgfVxcbiAgICAuc2VhcmNoLWZvcm1fX2lucHV0LXRleHQ6Zm9jdXMge1xcbiAgICAgIGJvcmRlcjogc29saWQgMXB4ICMwMDA7IH1cXG4gIC5zZWFyY2gtZm9ybV9fZ3JvdXAtLWNoZWNrYm94IHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgbWFyZ2luLWJvdHRvbTogMXJlbTsgfVxcbiAgLnNlYXJjaC1mb3JtX19sYWJlbC0tY2hlY2tib3gge1xcbiAgICBtYXJnaW4tcmlnaHQ6IDFyZW07IH1cXG4gIC5zZWFyY2gtZm9ybV9faW5wdXQtY2hlY2tib3gge1xcbiAgICB3aWR0aDogMi4yNXJlbTtcXG4gICAgaGVpZ2h0OiAyLjI1cmVtO1xcbiAgICBtYXJnaW4tcmlnaHQ6IC44cmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX2NoZWNrYm94LXdyYXBwZXIge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAuc2VhcmNoLWZvcm1fX3NlbGVjdC1tZW51IHtcXG4gICAgbWFyZ2luLWJvdHRvbTogMXJlbTsgfVxcbiAgLnNlYXJjaC1mb3JtX19zdmctc2l6ZSB7XFxuICAgIGhlaWdodDogMnJlbTtcXG4gICAgd2lkdGg6IDJyZW07XFxuICAgIG1hcmdpbi1yaWdodDogMXJlbTsgfVxcbiAgLnNlYXJjaC1mb3JtX19zdWJtaXQge1xcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XFxuICAgIHBhZGRpbmc6IC43cmVtO1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCAjYjMwMGIzOyB9XFxuICAuc2VhcmNoLWZvcm1fX2Ryb3Bkb3duLXNwYW4ge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9XFxuICAuc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLCAuc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXNldHMge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgICBsaXN0LXN0eWxlOiBub25lO1xcbiAgICBtYXJnaW4tYm90dG9tOiAuM3JlbTsgfVxcbiAgLnNlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy1saXN0LWl0ZW0sIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtc2V0cy1saXN0LWl0ZW0ge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBtYXJnaW4tYm90dG9tOiAuN3JlbTsgfVxcbiAgLnNlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy1yZW1vdmUtYnRuLCAuc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXNldHMtcmVtb3ZlLWJ0biB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgIGhlaWdodDogMnJlbTtcXG4gICAgd2lkdGg6IDJyZW07XFxuICAgIGZvbnQtc2l6ZTogMS4zcmVtO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjJmMmYyO1xcbiAgICBtYXJnaW4tcmlnaHQ6IC43cmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLXRvZ2dsZXIge1xcbiAgICBoZWlnaHQ6IDJyZW07XFxuICAgIHdpZHRoOiAyLjc1cmVtO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICBmb250LXNpemU6IDEuM3JlbTtcXG4gICAgbWFyZ2luLXJpZ2h0OiAuN3JlbTsgfVxcbiAgICAuc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLXRvZ2dsZXItLWlzIHtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDdkMTQ3OyB9XFxuICAgIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlci0tbm90IHtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmYwMDAwOyB9XFxuICAuc2VhcmNoLWZvcm1fX2Ryb3Bkb3duIHtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICBtYXgtaGVpZ2h0OiAyOHJlbTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gICAgei1pbmRleDogMjtcXG4gICAgdG9wOiAxMDAlO1xcbiAgICB3aWR0aDogNDByZW07XFxuICAgIG1hcmdpbi10b3A6IC0xcmVtO1xcbiAgICBvdmVyZmxvdy15OiBhdXRvO1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCAjMDAwOyB9XFxuICAgIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdCB7XFxuICAgICAgbGlzdC1zdHlsZTogbm9uZTsgfVxcbiAgICAgIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1jYXRlZ29yeSB7XFxuICAgICAgICBwYWRkaW5nOiAuNXJlbTsgfVxcbiAgICAgIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1vcHRpb24ge1xcbiAgICAgICAgcGFkZGluZzogLjNyZW0gMnJlbTtcXG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAgICAgICAuc2VhcmNoLWZvcm1fX2Ryb3Bkb3duLWxpc3Qtb3B0aW9uOmhvdmVyIHtcXG4gICAgICAgICAgY3Vyc29yOiBwb2ludGVyOyB9XFxuICAgICAgICAuc2VhcmNoLWZvcm1fX2Ryb3Bkb3duLWxpc3Qtb3B0aW9uLS1oaWdobGlnaHRlZCB7XFxuICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6ICNjY2Q4ZmY7IH1cXG4gICAgICAgIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1vcHRpb24gc3BhbiB7XFxuICAgICAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICAgICAgICAgIG1hcmdpbi1sZWZ0OiAxcmVtOyB9XFxuICAgICAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0LWltZyB7XFxuICAgICAgICB3aWR0aDogMnJlbTtcXG4gICAgICAgIGhlaWdodDogMnJlbTtcXG4gICAgICAgIG1hcmdpbi1yaWdodDogLjdyZW07IH1cXG5cXG4uZHJvcGRvd24td3JhcHBlciB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7IH1cXG5cXG4uYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2IHtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM5OWIxZmY7XFxuICB3aWR0aDogMTAwJTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxuICBwYWRkaW5nOiAwIDEwJTtcXG4gIG1hcmdpbi1ib3R0b206IC4xcmVtOyB9XFxuICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXNlbGVjdCB7XFxuICAgIGNvbG9yOiAjYjMwMGIzO1xcbiAgICBtYXJnaW4tcmlnaHQ6IDFyZW07IH1cXG4gIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtbGFiZWwge1xcbiAgICBjb2xvcjogI2IzMDBiMzsgfVxcbiAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1yaWdodCB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cXG4gIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtcGFnaW5hdGlvbi1jb250YWluZXIge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjY2NkOGZmO1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7IH1cXG4gICAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1wYWdpbmF0aW9uLWNvbnRhaW5lcjpub3QoOmxhc3QtY2hpbGQpIHtcXG4gICAgICBtYXJnaW4tcmlnaHQ6IDNyZW07IH1cXG4gICAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1wYWdpbmF0aW9uLWNvbnRhaW5lci0tZGlzYWJsZWQge1xcbiAgICAgIGN1cnNvcjogbm90LWFsbG93ZWQ7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyMDQsIDIxNiwgMjU1LCAwLjQpOyB9XFxuICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXN2Zy1zaXplIHtcXG4gICAgaGVpZ2h0OiAycmVtO1xcbiAgICB3aWR0aDogMnJlbTsgfVxcblxcbi5hcGktcmVzdWx0cy1kaXNwbGF5X19kaXNwbGF5LWJhciB7XFxuICB3aWR0aDogMTAwJTtcXG4gIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjYmZiZmJmO1xcbiAgcGFkZGluZy1sZWZ0OiAxMCU7XFxuICBtYXJnaW4tYm90dG9tOiAycmVtOyB9XFxuXFxuLmNhcmQtY2hlY2tsaXN0IHtcXG4gIHdpZHRoOiA4MCU7XFxuICBqdXN0aWZ5LXNlbGY6IGNlbnRlcjsgfVxcbiAgLmNhcmQtY2hlY2tsaXN0X19yb3cge1xcbiAgICBkaXNwbGF5OiBncmlkO1xcbiAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCg3LCAxZnIpOyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fcm93LS1oZWFkZXIge1xcbiAgICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjMDAwOyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fcm93LS1ncmV5IHtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjJmMmYyOyB9XFxuICAuY2FyZC1jaGVja2xpc3RfX2RhdGEge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LXdyYXA6IG5vd3JhcDtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgIG92ZXJmbG93OiBoaWRkZW47XFxuICAgIHRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzO1xcbiAgICBmb250LXNpemU6IDEuNHJlbTsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX2RhdGEtLXNldCB7XFxuICAgICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX2RhdGEtLXJhcml0eSB7XFxuICAgICAgdGV4dC10cmFuc2Zvcm06IGNhcGl0YWxpemU7IH1cXG4gIC5jYXJkLWNoZWNrbGlzdF9fZGF0YS1saW5rIHtcXG4gICAgcGFkZGluZzogMXJlbSAwO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LXdyYXA6IG5vd3JhcDtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgY29sb3I6ICMwMDA7XFxuICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmstLXN0YXJ0IHtcXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtc3RhcnQ7IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmstLWNlbnRlciB7XFxuICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7IH1cXG5cXG4udG9vbHRpcCB7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB6LWluZGV4OiA1O1xcbiAgd2lkdGg6IDI0cmVtO1xcbiAgaGVpZ2h0OiAzNHJlbTsgfVxcbiAgLnRvb2x0aXBfX2ltZyB7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBoZWlnaHQ6IDEwMCU7IH1cXG5cXG4uaW1hZ2UtZ3JpZCB7XFxuICBwYWRkaW5nOiAxMHJlbSAxNXJlbTtcXG4gIGRpc3BsYXk6IGdyaWQ7XFxuICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdChhdXRvLWZpdCwgbWlubWF4KDI1cmVtLCAxZnIpKTtcXG4gIGdyaWQtY29sdW1uLWdhcDogMnJlbTtcXG4gIGdyaWQtcm93LWdhcDogMXJlbTsgfVxcbiAgLmltYWdlLWdyaWRfX291dGVyLWRpdiB7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcbiAgLmltYWdlLWdyaWRfX2lubmVyLWRpdiB7XFxuICAgIHBlcnNwZWN0aXZlOiAxNTByZW07XFxuICAgIGhlaWdodDogMzRyZW07XFxuICAgIHdpZHRoOiAyNHJlbTsgfVxcbiAgLmltYWdlLWdyaWRfX2RvdWJsZSB7XFxuICAgIGhlaWdodDogMzRyZW07XFxuICAgIHdpZHRoOiAyNHJlbTtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICB0b3A6IDA7XFxuICAgIGxlZnQ6IDA7XFxuICAgIGJhY2tmYWNlLXZpc2liaWxpdHk6IGhpZGRlbjtcXG4gICAgb3ZlcmZsb3c6IGhpZGRlbjtcXG4gICAgdHJhbnNpdGlvbjogYWxsIC44cyBlYXNlOyB9XFxuICAgIC5pbWFnZS1ncmlkX19kb3VibGUtLWJhY2sge1xcbiAgICAgIHRyYW5zZm9ybTogcm90YXRlWSgxODBkZWcpOyB9XFxuICAuaW1hZ2UtZ3JpZF9fZG91YmxlLWJ0biB7XFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgdG9wOiA1MCU7XFxuICAgIHJpZ2h0OiAxNSU7XFxuICAgIHdpZHRoOiA0cmVtO1xcbiAgICBoZWlnaHQ6IDRyZW07XFxuICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjQpOyB9XFxuICAuaW1hZ2UtZ3JpZF9fY29udGFpbmVyIHtcXG4gICAgd2lkdGg6IDI0cmVtO1xcbiAgICBoZWlnaHQ6IDM0cmVtOyB9XFxuICAuaW1hZ2UtZ3JpZF9faW1hZ2Uge1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgaGVpZ2h0OiAxMDAlOyB9XFxuXFxuLmNhcmQge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIG1hcmdpbi10b3A6IDNyZW07IH1cXG4gIC5jYXJkX19pbWctY29udGFpbmVyIHtcXG4gICAgbWFyZ2luLXJpZ2h0OiAxMHJlbTsgfVxcbiAgLmNhcmRfX2ltZyB7XFxuICAgIHdpZHRoOiAzM3JlbTtcXG4gICAgaGVpZ2h0OiA0NnJlbTsgfVxcbiAgLmNhcmRfX2ltZy1sZWZ0IHtcXG4gICAgbWFyZ2luLXJpZ2h0OiAxMHJlbTtcXG4gICAgd2lkdGg6IDMzcmVtO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9XFxuICAuY2FyZF9faW1nLWJ0biB7XFxuICAgIGp1c3RpZnktc2VsZjogZmxleC1lbmQ7XFxuICAgIGFsaWduLXNlbGY6IGZsZXgtZW5kO1xcbiAgICBtYXJnaW4tdG9wOiBhdXRvOyB9XFxuICAuY2FyZF9faW1nLWRvdWJsZS1hcmVhIHtcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuICAuY2FyZF9faW1nLWRvdWJsZS1zaWRlZCB7XFxuICAgIHBlcnNwZWN0aXZlOiAxNTByZW07XFxuICAgIGhlaWdodDogNDZyZW07IH1cXG4gIC5jYXJkX19pbWctZG91YmxlIHtcXG4gICAgd2lkdGg6IDMzcmVtO1xcbiAgICBoZWlnaHQ6IDQ2cmVtO1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIHRvcDogMDtcXG4gICAgbGVmdDogMDtcXG4gICAgYmFja2ZhY2UtdmlzaWJpbGl0eTogaGlkZGVuO1xcbiAgICBvdmVyZmxvdzogaGlkZGVuOyB9XFxuICAgIC5jYXJkX19pbWctZG91YmxlLS1iYWNrIHtcXG4gICAgICB0cmFuc2Zvcm06IHJvdGF0ZVkoMTgwZGVnKTsgfVxcbiAgLmNhcmRfX3RleHQge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjRmNGQ3O1xcbiAgICB3aWR0aDogMzRyZW07XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICAgIHBhZGRpbmc6IDFyZW07XFxuICAgIG1hcmdpbi1yaWdodDogM3JlbTsgfVxcbiAgICAuY2FyZF9fdGV4dC1mbGV4IHtcXG4gICAgICBtYXJnaW4tYm90dG9tOiAxcmVtO1xcbiAgICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjYmZiZmJmOyB9XFxuICAgIC5jYXJkX190ZXh0LXRpdGxlIHtcXG4gICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cXG4gICAgICAuY2FyZF9fdGV4dC10aXRsZS1oMyB7XFxuICAgICAgICBmb250LXNpemU6IDEuOHJlbTtcXG4gICAgICAgIGZvbnQtd2VpZ2h0OiA0MDA7XFxuICAgICAgICBtYXJnaW4tcmlnaHQ6IDFyZW07IH1cXG4gICAgLmNhcmRfX3RleHQtY29sb3ItaW5kaWNhdG9yIHtcXG4gICAgICB3aWR0aDogMS4zcmVtO1xcbiAgICAgIGhlaWdodDogMS4zcmVtO1xcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkICMzMzM7XFxuICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgICAgIGJveC1zaGFkb3c6IDBweCAwcHggMHB4IDJweCByZ2JhKDAsIDAsIDAsIDAuMik7XFxuICAgICAgbWFyZ2luLXJpZ2h0OiAuN3JlbTtcXG4gICAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7IH1cXG4gICAgICAuY2FyZF9fdGV4dC1jb2xvci1pbmRpY2F0b3ItLVUge1xcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgxMjgsIDEyOCwgMjU1LCAwLjcpOyB9XFxuICAgICAgLmNhcmRfX3RleHQtY29sb3ItaW5kaWNhdG9yLS1CIHtcXG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMCwgMCwgMC43KTsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWNvbG9yLWluZGljYXRvci0tUiB7XFxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1NSwgNzcsIDc3LCAwLjcpOyB9XFxuICAgICAgLmNhcmRfX3RleHQtY29sb3ItaW5kaWNhdG9yLS1XIHtcXG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC43KTsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWNvbG9yLWluZGljYXRvci0tRyB7XFxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDI1NSwgMCwgMC43KTsgfVxcbiAgICAuY2FyZF9fdGV4dC1vcmFjbGUtcCB7XFxuICAgICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcXG4gICAgICBmb250LXNpemU6IDEuM3JlbTsgfVxcbiAgICAuY2FyZF9fdGV4dC1vcmFjbGUtZmxhdm9yIHtcXG4gICAgICBmb250LXNpemU6IDEuM3JlbTtcXG4gICAgICBmb250LXN0eWxlOiBpdGFsaWM7IH1cXG4gICAgLmNhcmRfX3RleHQtaWxsdXN0cmF0b3Ige1xcbiAgICAgIGZvbnQtc2l6ZTogMS4ycmVtO1xcbiAgICAgIGZvbnQtc3R5bGU6IGl0YWxpYzsgfVxcbiAgICAuY2FyZF9fdGV4dC1sZWdhbCB7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBmbGV4LWRpcmVjdGlvbjogcm93O1xcbiAgICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWxlZ2FsLWhhbGYge1xcbiAgICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH1cXG4gICAgICAuY2FyZF9fdGV4dC1sZWdhbC1zcGFuLWNvbnRhaW5lciB7XFxuICAgICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfVxcbiAgICAgICAgLmNhcmRfX3RleHQtbGVnYWwtc3Bhbi1jb250YWluZXI6bm90KDpsYXN0LWNoaWxkKSB7XFxuICAgICAgICAgIG1hcmdpbi1ib3R0b206IC41cmVtOyB9XFxuICAgICAgLmNhcmRfX3RleHQtbGVnYWwtc3Bhbi1ib3gge1xcbiAgICAgICAgd2lkdGg6IDZyZW07XFxuICAgICAgICBoZWlnaHQ6IDIuNXJlbTtcXG4gICAgICAgIGJvcmRlcjogMXB4IHNvbGlkICMwMDA7XFxuICAgICAgICBtYXJnaW4tcmlnaHQ6IC4zcmVtO1xcbiAgICAgICAgZm9udC1zaXplOiAxcmVtO1xcbiAgICAgICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcXG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cXG4gICAgICAgIC5jYXJkX190ZXh0LWxlZ2FsLXNwYW4tYm94LS1ub3RfbGVnYWwge1xcbiAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmYwMDAwOyB9XFxuICAgICAgICAuY2FyZF9fdGV4dC1sZWdhbC1zcGFuLWJveC0tbGVnYWwge1xcbiAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDdkMTQ3OyB9XFxuICAuY2FyZF9fc2V0IHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgfVxcbiAgICAuY2FyZF9fc2V0LWJhbm5lciB7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBib3JkZXI6IDFweCBzb2xpZCAjYmZiZmJmO1xcbiAgICAgIHdpZHRoOiA0MHJlbTtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMDAwO1xcbiAgICAgIGNvbG9yOiAjZmZmOyB9XFxuICAgICAgLmNhcmRfX3NldC1iYW5uZXItc3ZnLWNvbnRhaW5lciB7XFxuICAgICAgICBtYXJnaW4tcmlnaHQ6IDFyZW07IH1cXG4gICAgICAuY2FyZF9fc2V0LWJhbm5lci1zdmcge1xcbiAgICAgICAgd2lkdGg6IDIuNHJlbTtcXG4gICAgICAgIGhlaWdodDogMi40cmVtO1xcbiAgICAgICAgZmlsdGVyOiBpbnZlcnQoMTAwJSk7IH1cXG4gICAgLmNhcmRfX3NldC1kZXRhaWxzIHtcXG4gICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH1cXG4gICAgLmNhcmRfX3NldC1oZWFkZXItbmFtZSB7XFxuICAgICAgZm9udC1zaXplOiAxLjdyZW1yZW07IH1cXG4gICAgLmNhcmRfX3NldC1oZWFkZXItY29kZSB7XFxuICAgICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTsgfVxcbiAgICAuY2FyZF9fc2V0LXByaW50cy1oZWFkZXIge1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICMwMDA7XFxuICAgICAgY29sb3I6ICNmZmY7XFxuICAgICAgZm9udC1zaXplOiAxLjNyZW07XFxuICAgICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcXG4gICAgICBib3JkZXI6IDFweCBzb2xpZCAjYmZiZmJmO1xcbiAgICAgIHBhZGRpbmc6IC4zcmVtIC43cmVtOyB9XFxuICAgIC5jYXJkX19zZXQtcHJpbnRzLXN2Zy1jb250YWluZXIge1xcbiAgICAgIGhlaWdodDogMS44cmVtO1xcbiAgICAgIHdpZHRoOiAxLjhyZW07XFxuICAgICAgYm9yZGVyOiAxcHggc29saWQgI2JmYmZiZjtcXG4gICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgICAgYm9yZGVyLXJhZGl1czogMTAwJTsgfVxcbiAgICAuY2FyZF9fc2V0LXByaW50cy1zdmctLWNvbW1vbiB7XFxuICAgICAgZmlsbDogIzAwMDsgfVxcbiAgICAuY2FyZF9fc2V0LXByaW50cy1zdmctLXVuY29tbW9uIHtcXG4gICAgICBmaWxsOiAjZTZlNmU2OyB9XFxuICAgIC5jYXJkX19zZXQtcHJpbnRzLXN2Zy0tcmFyZSB7XFxuICAgICAgZmlsbDogI2U2YzMwMDsgfVxcbiAgICAuY2FyZF9fc2V0LXByaW50cy1zdmctLW15dGhpYyB7XFxuICAgICAgZmlsbDogI2ZmMDAwMDsgfVxcbiAgICAuY2FyZF9fc2V0LXByaW50cy1saXN0IHtcXG4gICAgICBsaXN0LXN0eWxlOiBub25lOyB9XFxuICAgICAgLmNhcmRfX3NldC1wcmludHMtbGlzdC1saW5rOmxpbmssIC5jYXJkX19zZXQtcHJpbnRzLWxpc3QtbGluazp2aXNpdGVkIHtcXG4gICAgICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gICAgICAgIGNvbG9yOiAjMDAwOyB9XFxuICAgICAgLmNhcmRfX3NldC1wcmludHMtbGlzdC1pdGVtIHtcXG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxuICAgICAgICBjdXJzb3I6IHBvaW50ZXI7IH1cXG4gICAgICAgIC5jYXJkX19zZXQtcHJpbnRzLWxpc3QtaXRlbTpob3ZlciB7XFxuICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmMmYyZjI7IH1cXG4gICAgICAuY2FyZF9fc2V0LXByaW50cy1saXN0LWl0ZW0tbmFtZS13cmFwcGVyIHtcXG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICAgICAgbWFyZ2luLWxlZnQ6IC0xcmVtOyB9XFxuICAgICAgLmNhcmRfX3NldC1wcmludHMtbGlzdC1pdGVtLXNldC1uYW1lIHtcXG4gICAgICAgIG1hcmdpbi1sZWZ0OiAuNXJlbTsgfVxcbiAgICAgIC5jYXJkX19zZXQtcHJpbnRzLWxpc3QtaXRlbS1wcmljZSB7XFxuICAgICAgICBtYXJnaW4tcmlnaHQ6IC43cmVtOyB9XFxuXFxuLmNhcmQtcGFnZSB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gIGdyaWQtY29sdW1uOiBjZW50ZXItc3RhcnQgLyBjZW50ZXItZW5kOyB9XFxuXFxuLmFkZC10by1pbnYge1xcbiAgbWFyZ2luLXRvcDogM3JlbTtcXG4gIHdpZHRoOiA1MCU7IH1cXG4gIC5hZGQtdG8taW52X19mb3JtIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgfVxcbiAgICAuYWRkLXRvLWludl9fZm9ybS1ncm91cCB7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBhbGlnbi1jb250ZW50OiBjZW50ZXI7XFxuICAgICAgbWFyZ2luLWJvdHRvbTogM3JlbTsgfVxcbiAgICAuYWRkLXRvLWludl9fZm9ybS1sYWJlbCB7XFxuICAgICAgbWFyZ2luLXJpZ2h0OiAuM3JlbTsgfVxcblxcbi5uby1yZXN1bHRzIHtcXG4gIGp1c3RpZnktc2VsZjogY2VudGVyOyB9XFxuXFxuLmNvbnRhaW5lciB7XFxuICBkaXNwbGF5OiBncmlkO1xcbiAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiBbZnVsbC1zdGFydF0gbWlubWF4KDZyZW0sIDFmcikgW2NlbnRlci1zdGFydF0gcmVwZWF0KDgsIFtjb2wtc3RhcnRdIG1pbm1heChtaW4tY29udGVudCwgMTRyZW0pIFtjb2wtZW5kXSkgW2NlbnRlci1lbmRdIG1pbm1heCg2cmVtLCAxZnIpIFtmdWxsLWVuZF07IH1cXG5cXG4ubG9naW4sXFxuLnJlZ2lzdGVyIHtcXG4gIG1hcmdpbi10b3A6IDVyZW07XFxuICBncmlkLWNvbHVtbjogY2VudGVyLXN0YXJ0IC8gY2VudGVyLWVuZDtcXG4gIGJhY2tncm91bmQtaW1hZ2U6IGxpbmVhci1ncmFkaWVudCh0byByaWdodCBib3R0b20sIHJnYmEoMCwgMCwgMCwgMC44KSwgcmdiYSgwLCAwLCAwLCAwLjgpKSwgdXJsKFwiICsgX19fQ1NTX0xPQURFUl9VUkxfUkVQTEFDRU1FTlRfMF9fXyArIFwiKTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gIGhlaWdodDogNzV2aDtcXG4gIGJhY2tncm91bmQtc2l6ZTogY292ZXI7XFxuICBiYWNrZ3JvdW5kLXBvc2l0aW9uOiBjZW50ZXI7IH1cXG5cXG4uc2VhcmNoIHtcXG4gIGdyaWQtY29sdW1uOiBmdWxsLXN0YXJ0IC8gZnVsbC1lbmQ7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmOyB9XFxuXFxuLmFwaS1yZXN1bHRzLWRpc3BsYXkge1xcbiAgZ3JpZC1jb2x1bW46IGZ1bGwtc3RhcnQgLyBmdWxsLWVuZDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxuICBkaXNwbGF5OiBncmlkOyB9XFxuXCIsIFwiXCIse1widmVyc2lvblwiOjMsXCJzb3VyY2VzXCI6W1wid2VicGFjazovL3NyYy9jc3Mvc3R5bGUuY3NzXCJdLFwibmFtZXNcIjpbXSxcIm1hcHBpbmdzXCI6XCJBQUFBOzs7RUFHRSxTQUFTO0VBQ1QsVUFBVTtFQUNWLG1CQUFtQixFQUFFOztBQUV2QjtFQUNFLGdCQUFnQixFQUFFOztBQUVwQjtFQUNFLHNCQUFzQjtFQUN0QixrQkFBa0I7RUFDbEIsaUJBQWlCO0VBQ2pCLHNCQUFzQjtFQUN0Qiw0QkFBNEI7RUFDNUIsZ0JBQWdCO0VBQ2hCLCtCQUErQixFQUFFOztBQUVuQztFQUNFLHdCQUF3QixFQUFFOztBQUU1QjtFQUNFLGlCQUFpQjtFQUNq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WixzQkFBc0I7RUFDdEIsMkJBQTJCLEVBQUU7O0FBRS9CO0VBQ0Usa0NBQWtDO0VBQ2xDLHNCQUFzQixFQUFFOztBQUUxQjtFQUNFLGtDQUFrQztFQUNsQyxzQkFBc0I7RUFDdEIsYUFBYSxFQUFFXCIsXCJzb3VyY2VzQ29udGVudFwiOltcIiosXFxuKjo6YWZ0ZXIsXFxuKjo6YmVmb3JlIHtcXG4gIG1hcmdpbjogMDtcXG4gIHBhZGRpbmc6IDA7XFxuICBib3gtc2l6aW5nOiBpbmhlcml0OyB9XFxuXFxuaHRtbCB7XFxuICBmb250LXNpemU6IDYyLjUlOyB9XFxuXFxuYm9keSB7XFxuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbiAgb3ZlcmZsb3cteDogaGlkZGVuO1xcbiAgZm9udC1zaXplOiAxLjZyZW07XFxuICBiYWNrZ3JvdW5kLXNpemU6IGNvdmVyO1xcbiAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcXG4gIGhlaWdodDogMTI3LjVyZW07XFxuICBmb250LWZhbWlseTogJ0xhdG8nLCBzYW5zLXNlcmlmOyB9XFxuXFxuW2hpZGRlbl0ge1xcbiAgZGlzcGxheTogbm9uZSAhaW1wb3J0YW50OyB9XFxuXFxuLmhlYWRpbmctdGVydGlhcnkge1xcbiAgZm9udC1zaXplOiAyLjRyZW07XFxuICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOyB9XFxuICAuaGVhZGluZy10ZXJ0aWFyeS0td2hpdGUge1xcbiAgICBjb2xvcjogI2ZmZjsgfVxcblxcbi5tYi0xMCB7XFxuICBtYXJnaW4tYm90dG9tOiAxcmVtOyB9XFxuXFxuLm1iLTIwIHtcXG4gIG1hcmdpbi1ib3R0b206IDJyZW07IH1cXG5cXG4ubXQtNTAge1xcbiAgbWFyZ2luLXRvcDogNXJlbTsgfVxcblxcbi5idG4sIC5idG46bGluaywgLmJ0bjp2aXNpdGVkIHtcXG4gIHBhZGRpbmc6IC43NXJlbSAycmVtO1xcbiAgYm9yZGVyLXJhZGl1czogLjVyZW07XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjJmMmYyO1xcbiAgZm9udC13ZWlnaHQ6IDQwMDtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jazsgfVxcblxcbi5idG46YWN0aXZlLCAuYnRuOmZvY3VzIHtcXG4gIG91dGxpbmU6IG5vbmU7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTFweCk7XFxuICBib3gtc2hhZG93OiAwIDAuNXJlbSAxcmVtIHJnYmEoMCwgMCwgMCwgMC4yKTsgfVxcblxcbi5sb2dpbi1mb3JtX19ncm91cDpub3QoOmxhc3QtY2hpbGQpIHtcXG4gIG1hcmdpbi1ib3R0b206IDIuNXJlbTsgfVxcblxcbi5sb2dpbi1mb3JtX19sYWJlbCB7XFxuICBtYXJnaW4tcmlnaHQ6IC43cmVtO1xcbiAgY29sb3I6ICNmZmY7XFxuICBmb250LXNpemU6IDEuOHJlbTtcXG4gIGZvbnQtd2VpZ2h0OiA0MDA7IH1cXG5cXG4ubG9naW4tZm9ybV9faW5wdXQge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gIHBhZGRpbmc6IC41cmVtIDA7XFxuICBib3JkZXI6IG5vbmU7IH1cXG5cXG4ubG9naW4tZm9ybV9fYnRuLXdyYXBwZXIge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyOyB9XFxuXFxuLmxvZ2luX19yZWdpc3Rlci10ZXh0IHtcXG4gIG1hcmdpbi10b3A6IDEuNXJlbTtcXG4gIGNvbG9yOiAjZmZmOyB9XFxuXFxuLmxvZ2luX19yZWdpc3Rlci1saW5rIHtcXG4gIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gIGNvbG9yOiAjZmZmO1xcbiAgdHJhbnNpdGlvbjogYWxsIC4yczsgfVxcbiAgLmxvZ2luX19yZWdpc3Rlci1saW5rOmhvdmVyIHtcXG4gICAgY29sb3I6ICNmZjgwMDA7XFxuICAgIHRleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lOyB9XFxuXFxuLm5hdiB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcXG4gIHBhZGRpbmc6IDJyZW0gNnJlbTtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgIzAwMDsgfVxcbiAgLm5hdl9faXRlbSB7XFxuICAgIGxpc3Qtc3R5bGU6IG5vbmU7IH1cXG4gICAgLm5hdl9faXRlbS0tc2VhcmNoIHtcXG4gICAgICBmbGV4OiAwIDAgMjUlOyB9XFxuICAubmF2X19saW5rIHtcXG4gICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgICBjb2xvcjogIzAwMDtcXG4gICAgdHJhbnNpdGlvbjogYWxsIC4yczsgfVxcbiAgICAubmF2X19saW5rOmhvdmVyIHtcXG4gICAgICBtYXJnaW4tYm90dG9tOiAycHg7XFxuICAgICAgY29sb3I6ICNmZmE2NGQ7XFxuICAgICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNmZmE2NGQ7IH1cXG4gICAgLm5hdl9fbGluay0taG9tZTpob3ZlciAubmF2X19pY29uLXBhdGgtLWhvbWUge1xcbiAgICAgIGZpbGw6ICNmZjgwMDA7IH1cXG4gIC5uYXZfX3NlYXJjaCB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAgIC5uYXZfX3NlYXJjaC1pbnB1dCB7XFxuICAgICAgd2lkdGg6IDkwJTtcXG4gICAgICBib3JkZXItcmFkaXVzOiAzcmVtO1xcbiAgICAgIHBhZGRpbmc6IDFyZW0gMnJlbTtcXG4gICAgICBib3JkZXI6IDFweCBzb2xpZCAjYmZiZmJmO1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmMmYyZjI7XFxuICAgICAgdHJhbnNpdGlvbjogd2lkdGggLjJzOyB9XFxuICAgICAgLm5hdl9fc2VhcmNoLWlucHV0OmZvY3VzIHtcXG4gICAgICAgIG91dGxpbmU6IG5vbmU7XFxuICAgICAgICB3aWR0aDogMTIwJTsgfVxcbiAgICAubmF2X19zZWFyY2gtYnRuIHtcXG4gICAgICBjdXJzb3I6IHBvaW50ZXI7IH1cXG4gIC5uYXZfX2ljb24tc2l6aW5nLS1ob21lIHtcXG4gICAgd2lkdGg6IDNyZW07XFxuICAgIGhlaWdodDogM3JlbTsgfVxcbiAgLm5hdl9faWNvbi1zaXppbmctLXNlYXJjaCB7XFxuICAgIHdpZHRoOiAycmVtO1xcbiAgICBoZWlnaHQ6IDJyZW07XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtMTUwJSk7IH1cXG4gIC5uYXZfX2ljb24tcGF0aCB7XFxuICAgIGZpbGw6ICNiZmJmYmY7IH1cXG5cXG4ucmVnaXN0ZXItZm9ybV9fZ3JvdXAge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cXG4gIC5yZWdpc3Rlci1mb3JtX19ncm91cDpub3QoOmxhc3QtY2hpbGQpIHtcXG4gICAgbWFyZ2luLWJvdHRvbTogM3JlbTsgfVxcblxcbi5yZWdpc3Rlci1mb3JtX19sYWJlbCB7XFxuICBtYXJnaW4tcmlnaHQ6IDRyZW07XFxuICBjb2xvcjogI2ZmZjtcXG4gIGZvbnQtc2l6ZTogMS44cmVtO1xcbiAgZm9udC13ZWlnaHQ6IDQwMDsgfVxcblxcbi5yZWdpc3Rlci1mb3JtX19pbnB1dCB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjJmMmYyO1xcbiAgcGFkZGluZzogLjVyZW0gMDtcXG4gIGJvcmRlcjogbm9uZTsgfVxcblxcbi5yZWdpc3Rlci1mb3JtX19idG4td3JhcHBlciB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7IH1cXG5cXG4ucmVnaXN0ZXJfX2xvZ2luLXRleHQge1xcbiAgbWFyZ2luLXRvcDogMS41cmVtO1xcbiAgY29sb3I6ICNmZmY7IH1cXG5cXG4ucmVnaXN0ZXJfX2xvZ2luLWxpbmsge1xcbiAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgY29sb3I6ICNmZmY7XFxuICB0cmFuc2l0aW9uOiBhbGwgLjJzOyB9XFxuICAucmVnaXN0ZXJfX2xvZ2luLWxpbms6aG92ZXIge1xcbiAgICBjb2xvcjogI2ZmODAwMDtcXG4gICAgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmU7IH1cXG5cXG4uZXJyb3Ige1xcbiAgbWFyZ2luLXRvcDogMnJlbTtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZjgwODA7XFxuICBib3JkZXItcmFkaXVzOiAxMHB4O1xcbiAgcGFkZGluZzogMnJlbTtcXG4gIGZvbnQtc2l6ZTogMnJlbTtcXG4gIGdyaWQtY29sdW1uOiBjZW50ZXItc3RhcnQgLyBjZW50ZXItZW5kO1xcbiAgZm9udC13ZWlnaHQ6IDcwMDsgfVxcblxcbi5zZWFyY2gtZm9ybSB7XFxuICBwYWRkaW5nOiAycmVtIDI1cmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX2dyb3VwIHtcXG4gICAgd2lkdGg6IDc1JTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgbWFyZ2luLWJvdHRvbTogM3JlbTtcXG4gICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICMwMDA7XFxuICAgIGFsaWduLWl0ZW1zOiBmbGV4LXN0YXJ0O1xcbiAgICBwYWRkaW5nOiAuNXJlbSA0cmVtIC41cmVtIDA7IH1cXG4gIC5zZWFyY2gtZm9ybV9fbGFiZWwge1xcbiAgICBmbGV4OiAwIDAgMjAlO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogZmxleC1zdGFydDtcXG4gICAgbWFyZ2luLXRvcDogLjdyZW07IH1cXG4gIC5zZWFyY2gtZm9ybV9fZ3JvdXAtaW5wdXQtd3JhcHBlciB7XFxuICAgIGZsZXg6IDAgMCA4MCU7IH1cXG4gIC5zZWFyY2gtZm9ybV9fdGlwIHtcXG4gICAgZm9udC1zaXplOiAxcmVtO1xcbiAgICBsaW5lLWhlaWdodDogMS40O1xcbiAgICB3aWR0aDogNzAlOyB9XFxuICAuc2VhcmNoLWZvcm1fX2lucHV0LXRleHQge1xcbiAgICB3aWR0aDogNDByZW07XFxuICAgIGhlaWdodDogNHJlbTtcXG4gICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcXG4gICAgcGFkZGluZzogMXJlbTtcXG4gICAgYm9yZGVyOiBzb2xpZCAxcHggI2JmYmZiZjtcXG4gICAgYm9yZGVyLXJhZGl1czogNXB4OyB9XFxuICAgIC5zZWFyY2gtZm9ybV9faW5wdXQtdGV4dDpmb2N1cyB7XFxuICAgICAgYm9yZGVyOiBzb2xpZCAxcHggIzAwMDsgfVxcbiAgLnNlYXJjaC1mb3JtX19ncm91cC0tY2hlY2tib3gge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBtYXJnaW4tYm90dG9tOiAxcmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX2xhYmVsLS1jaGVja2JveCB7XFxuICAgIG1hcmdpbi1yaWdodDogMXJlbTsgfVxcbiAgLnNlYXJjaC1mb3JtX19pbnB1dC1jaGVja2JveCB7XFxuICAgIHdpZHRoOiAyLjI1cmVtO1xcbiAgICBoZWlnaHQ6IDIuMjVyZW07XFxuICAgIG1hcmdpbi1yaWdodDogLjhyZW07IH1cXG4gIC5zZWFyY2gtZm9ybV9fY2hlY2tib3gtd3JhcHBlciB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cXG4gIC5zZWFyY2gtZm9ybV9fc2VsZWN0LW1lbnUge1xcbiAgICBtYXJnaW4tYm90dG9tOiAxcmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX3N2Zy1zaXplIHtcXG4gICAgaGVpZ2h0OiAycmVtO1xcbiAgICB3aWR0aDogMnJlbTtcXG4gICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX3N1Ym1pdCB7XFxuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgcGFkZGluZzogLjdyZW07XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkICNiMzAwYjM7IH1cXG4gIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tc3BhbiB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH1cXG4gIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMsIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtc2V0cyB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICAgIGxpc3Qtc3R5bGU6IG5vbmU7XFxuICAgIG1hcmdpbi1ib3R0b206IC4zcmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLWxpc3QtaXRlbSwgLnNlYXJjaC1mb3JtX19zZWxlY3RlZC1zZXRzLWxpc3QtaXRlbSB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIG1hcmdpbi1ib3R0b206IC43cmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLXJlbW92ZS1idG4sIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtc2V0cy1yZW1vdmUtYnRuIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgaGVpZ2h0OiAycmVtO1xcbiAgICB3aWR0aDogMnJlbTtcXG4gICAgZm9udC1zaXplOiAxLjNyZW07XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmMmYyZjI7XFxuICAgIG1hcmdpbi1yaWdodDogLjdyZW07IH1cXG4gIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlciB7XFxuICAgIGhlaWdodDogMnJlbTtcXG4gICAgd2lkdGg6IDIuNzVyZW07XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgIGZvbnQtc2l6ZTogMS4zcmVtO1xcbiAgICBtYXJnaW4tcmlnaHQ6IC43cmVtOyB9XFxuICAgIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlci0taXMge1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICM0N2QxNDc7IH1cXG4gICAgLnNlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy10b2dnbGVyLS1ub3Qge1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmZjAwMDA7IH1cXG4gIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24ge1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIG1heC1oZWlnaHQ6IDI4cmVtO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgICB6LWluZGV4OiAyO1xcbiAgICB0b3A6IDEwMCU7XFxuICAgIHdpZHRoOiA0MHJlbTtcXG4gICAgbWFyZ2luLXRvcDogLTFyZW07XFxuICAgIG92ZXJmbG93LXk6IGF1dG87XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkICMwMDA7IH1cXG4gICAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0IHtcXG4gICAgICBsaXN0LXN0eWxlOiBub25lOyB9XFxuICAgICAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0LWNhdGVnb3J5IHtcXG4gICAgICAgIHBhZGRpbmc6IC41cmVtOyB9XFxuICAgICAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0LW9wdGlvbiB7XFxuICAgICAgICBwYWRkaW5nOiAuM3JlbSAycmVtO1xcbiAgICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cXG4gICAgICAgIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1vcHRpb246aG92ZXIge1xcbiAgICAgICAgICBjdXJzb3I6IHBvaW50ZXI7IH1cXG4gICAgICAgIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1vcHRpb24tLWhpZ2hsaWdodGVkIHtcXG4gICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2NjZDhmZjsgfVxcbiAgICAgICAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0LW9wdGlvbiBzcGFuIHtcXG4gICAgICAgICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcXG4gICAgICAgICAgbWFyZ2luLWxlZnQ6IDFyZW07IH1cXG4gICAgICAuc2VhcmNoLWZvcm1fX2Ryb3Bkb3duLWxpc3QtaW1nIHtcXG4gICAgICAgIHdpZHRoOiAycmVtO1xcbiAgICAgICAgaGVpZ2h0OiAycmVtO1xcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAuN3JlbTsgfVxcblxcbi5kcm9wZG93bi13cmFwcGVyIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcblxcbi5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzk5YjFmZjtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcXG4gIHBhZGRpbmc6IDAgMTAlO1xcbiAgbWFyZ2luLWJvdHRvbTogLjFyZW07IH1cXG4gIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtc2VsZWN0IHtcXG4gICAgY29sb3I6ICNiMzAwYjM7XFxuICAgIG1hcmdpbi1yaWdodDogMXJlbTsgfVxcbiAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1sYWJlbCB7XFxuICAgIGNvbG9yOiAjYjMwMGIzOyB9XFxuICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXJpZ2h0IHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfVxcbiAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1wYWdpbmF0aW9uLWNvbnRhaW5lciB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNjY2Q4ZmY7XFxuICAgIGN1cnNvcjogcG9pbnRlcjsgfVxcbiAgICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXBhZ2luYXRpb24tY29udGFpbmVyOm5vdCg6bGFzdC1jaGlsZCkge1xcbiAgICAgIG1hcmdpbi1yaWdodDogM3JlbTsgfVxcbiAgICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXBhZ2luYXRpb24tY29udGFpbmVyLS1kaXNhYmxlZCB7XFxuICAgICAgY3Vyc29yOiBub3QtYWxsb3dlZDtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDIwNCwgMjE2LCAyNTUsIDAuNCk7IH1cXG4gIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtc3ZnLXNpemUge1xcbiAgICBoZWlnaHQ6IDJyZW07XFxuICAgIHdpZHRoOiAycmVtOyB9XFxuXFxuLmFwaS1yZXN1bHRzLWRpc3BsYXlfX2Rpc3BsYXktYmFyIHtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNiZmJmYmY7XFxuICBwYWRkaW5nLWxlZnQ6IDEwJTtcXG4gIG1hcmdpbi1ib3R0b206IDJyZW07IH1cXG5cXG4uY2FyZC1jaGVja2xpc3Qge1xcbiAgd2lkdGg6IDgwJTtcXG4gIGp1c3RpZnktc2VsZjogY2VudGVyOyB9XFxuICAuY2FyZC1jaGVja2xpc3RfX3JvdyB7XFxuICAgIGRpc3BsYXk6IGdyaWQ7XFxuICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KDcsIDFmcik7IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19yb3ctLWhlYWRlciB7XFxuICAgICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICMwMDA7IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19yb3ctLWdyZXkge1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmMmYyZjI7IH1cXG4gIC5jYXJkLWNoZWNrbGlzdF9fZGF0YSB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtd3JhcDogbm93cmFwO1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgb3ZlcmZsb3c6IGhpZGRlbjtcXG4gICAgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XFxuICAgIGZvbnQtc2l6ZTogMS40cmVtOyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fZGF0YS0tc2V0IHtcXG4gICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fZGF0YS0tcmFyaXR5IHtcXG4gICAgICB0ZXh0LXRyYW5zZm9ybTogY2FwaXRhbGl6ZTsgfVxcbiAgLmNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmsge1xcbiAgICBwYWRkaW5nOiAxcmVtIDA7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtd3JhcDogbm93cmFwO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBjb2xvcjogIzAwMDtcXG4gICAgd2hpdGUtc3BhY2U6IG5vd3JhcDsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX2RhdGEtbGluay0tc3RhcnQge1xcbiAgICAgIGp1c3RpZnktY29udGVudDogZmxleC1zdGFydDsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX2RhdGEtbGluay0tY2VudGVyIHtcXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsgfVxcblxcbi50b29sdGlwIHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHotaW5kZXg6IDU7XFxuICB3aWR0aDogMjRyZW07XFxuICBoZWlnaHQ6IDM0cmVtOyB9XFxuICAudG9vbHRpcF9faW1nIHtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGhlaWdodDogMTAwJTsgfVxcblxcbi5pbWFnZS1ncmlkIHtcXG4gIHBhZGRpbmc6IDEwcmVtIDE1cmVtO1xcbiAgZGlzcGxheTogZ3JpZDtcXG4gIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KGF1dG8tZml0LCBtaW5tYXgoMjVyZW0sIDFmcikpO1xcbiAgZ3JpZC1jb2x1bW4tZ2FwOiAycmVtO1xcbiAgZ3JpZC1yb3ctZ2FwOiAxcmVtOyB9XFxuICAuaW1hZ2UtZ3JpZF9fb3V0ZXItZGl2IHtcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuICAuaW1hZ2UtZ3JpZF9faW5uZXItZGl2IHtcXG4gICAgcGVyc3BlY3RpdmU6IDE1MHJlbTtcXG4gICAgaGVpZ2h0OiAzNHJlbTtcXG4gICAgd2lkdGg6IDI0cmVtOyB9XFxuICAuaW1hZ2UtZ3JpZF9fZG91YmxlIHtcXG4gICAgaGVpZ2h0OiAzNHJlbTtcXG4gICAgd2lkdGg6IDI0cmVtO1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIHRvcDogMDtcXG4gICAgbGVmdDogMDtcXG4gICAgYmFja2ZhY2UtdmlzaWJpbGl0eTogaGlkZGVuO1xcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgLjhzIGVhc2U7IH1cXG4gICAgLmltYWdlLWdyaWRfX2RvdWJsZS0tYmFjayB7XFxuICAgICAgdHJhbnNmb3JtOiByb3RhdGVZKDE4MGRlZyk7IH1cXG4gIC5pbWFnZS1ncmlkX19kb3VibGUtYnRuIHtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICB0b3A6IDUwJTtcXG4gICAgcmlnaHQ6IDE1JTtcXG4gICAgd2lkdGg6IDRyZW07XFxuICAgIGhlaWdodDogNHJlbTtcXG4gICAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNCk7IH1cXG4gIC5pbWFnZS1ncmlkX19jb250YWluZXIge1xcbiAgICB3aWR0aDogMjRyZW07XFxuICAgIGhlaWdodDogMzRyZW07IH1cXG4gIC5pbWFnZS1ncmlkX19pbWFnZSB7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBoZWlnaHQ6IDEwMCU7IH1cXG5cXG4uY2FyZCB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgbWFyZ2luLXRvcDogM3JlbTsgfVxcbiAgLmNhcmRfX2ltZy1jb250YWluZXIge1xcbiAgICBtYXJnaW4tcmlnaHQ6IDEwcmVtOyB9XFxuICAuY2FyZF9faW1nIHtcXG4gICAgd2lkdGg6IDMzcmVtO1xcbiAgICBoZWlnaHQ6IDQ2cmVtOyB9XFxuICAuY2FyZF9faW1nLWxlZnQge1xcbiAgICBtYXJnaW4tcmlnaHQ6IDEwcmVtO1xcbiAgICB3aWR0aDogMzNyZW07XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH1cXG4gIC5jYXJkX19pbWctYnRuIHtcXG4gICAganVzdGlmeS1zZWxmOiBmbGV4LWVuZDtcXG4gICAgYWxpZ24tc2VsZjogZmxleC1lbmQ7XFxuICAgIG1hcmdpbi10b3A6IGF1dG87IH1cXG4gIC5jYXJkX19pbWctZG91YmxlLWFyZWEge1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7IH1cXG4gIC5jYXJkX19pbWctZG91YmxlLXNpZGVkIHtcXG4gICAgcGVyc3BlY3RpdmU6IDE1MHJlbTtcXG4gICAgaGVpZ2h0OiA0NnJlbTsgfVxcbiAgLmNhcmRfX2ltZy1kb3VibGUge1xcbiAgICB3aWR0aDogMzNyZW07XFxuICAgIGhlaWdodDogNDZyZW07XFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgdG9wOiAwO1xcbiAgICBsZWZ0OiAwO1xcbiAgICBiYWNrZmFjZS12aXNpYmlsaXR5OiBoaWRkZW47XFxuICAgIG92ZXJmbG93OiBoaWRkZW47IH1cXG4gICAgLmNhcmRfX2ltZy1kb3VibGUtLWJhY2sge1xcbiAgICAgIHRyYW5zZm9ybTogcm90YXRlWSgxODBkZWcpOyB9XFxuICAuY2FyZF9fdGV4dCB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmNGY0ZDc7XFxuICAgIHdpZHRoOiAzNHJlbTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gICAgcGFkZGluZzogMXJlbTtcXG4gICAgbWFyZ2luLXJpZ2h0OiAzcmVtOyB9XFxuICAgIC5jYXJkX190ZXh0LWZsZXgge1xcbiAgICAgIG1hcmdpbi1ib3R0b206IDFyZW07XFxuICAgICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNiZmJmYmY7IH1cXG4gICAgLmNhcmRfX3RleHQtdGl0bGUge1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfVxcbiAgICAgIC5jYXJkX190ZXh0LXRpdGxlLWgzIHtcXG4gICAgICAgIGZvbnQtc2l6ZTogMS44cmVtO1xcbiAgICAgICAgZm9udC13ZWlnaHQ6IDQwMDtcXG4gICAgICAgIG1hcmdpbi1yaWdodDogMXJlbTsgfVxcbiAgICAuY2FyZF9fdGV4dC1jb2xvci1pbmRpY2F0b3Ige1xcbiAgICAgIHdpZHRoOiAxLjNyZW07XFxuICAgICAgaGVpZ2h0OiAxLjNyZW07XFxuICAgICAgYm9yZGVyOiAxcHggc29saWQgIzMzMztcXG4gICAgICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICAgICAgYm94LXNoYWRvdzogMHB4IDBweCAwcHggMnB4IHJnYmEoMCwgMCwgMCwgMC4yKTtcXG4gICAgICBtYXJnaW4tcmlnaHQ6IC43cmVtO1xcbiAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jazsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWNvbG9yLWluZGljYXRvci0tVSB7XFxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDEyOCwgMTI4LCAyNTUsIDAuNyk7IH1cXG4gICAgICAuY2FyZF9fdGV4dC1jb2xvci1pbmRpY2F0b3ItLUIge1xcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAwLCAwLCAwLjcpOyB9XFxuICAgICAgLmNhcmRfX3RleHQtY29sb3ItaW5kaWNhdG9yLS1SIHtcXG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjU1LCA3NywgNzcsIDAuNyk7IH1cXG4gICAgICAuY2FyZF9fdGV4dC1jb2xvci1pbmRpY2F0b3ItLVcge1xcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjcpOyB9XFxuICAgICAgLmNhcmRfX3RleHQtY29sb3ItaW5kaWNhdG9yLS1HIHtcXG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMjU1LCAwLCAwLjcpOyB9XFxuICAgIC5jYXJkX190ZXh0LW9yYWNsZS1wIHtcXG4gICAgICBtYXJnaW4tYm90dG9tOiAxcmVtO1xcbiAgICAgIGZvbnQtc2l6ZTogMS4zcmVtOyB9XFxuICAgIC5jYXJkX190ZXh0LW9yYWNsZS1mbGF2b3Ige1xcbiAgICAgIGZvbnQtc2l6ZTogMS4zcmVtO1xcbiAgICAgIGZvbnQtc3R5bGU6IGl0YWxpYzsgfVxcbiAgICAuY2FyZF9fdGV4dC1pbGx1c3RyYXRvciB7XFxuICAgICAgZm9udC1zaXplOiAxLjJyZW07XFxuICAgICAgZm9udC1zdHlsZTogaXRhbGljOyB9XFxuICAgIC5jYXJkX190ZXh0LWxlZ2FsIHtcXG4gICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgIGZsZXgtZGlyZWN0aW9uOiByb3c7XFxuICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuOyB9XFxuICAgICAgLmNhcmRfX3RleHQtbGVnYWwtaGFsZiB7XFxuICAgICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWxlZ2FsLXNwYW4tY29udGFpbmVyIHtcXG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAgICAgICAuY2FyZF9fdGV4dC1sZWdhbC1zcGFuLWNvbnRhaW5lcjpub3QoOmxhc3QtY2hpbGQpIHtcXG4gICAgICAgICAgbWFyZ2luLWJvdHRvbTogLjVyZW07IH1cXG4gICAgICAuY2FyZF9fdGV4dC1sZWdhbC1zcGFuLWJveCB7XFxuICAgICAgICB3aWR0aDogNnJlbTtcXG4gICAgICAgIGhlaWdodDogMi41cmVtO1xcbiAgICAgICAgYm9yZGVyOiAxcHggc29saWQgIzAwMDtcXG4gICAgICAgIG1hcmdpbi1yaWdodDogLjNyZW07XFxuICAgICAgICBmb250LXNpemU6IDFyZW07XFxuICAgICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xcbiAgICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfVxcbiAgICAgICAgLmNhcmRfX3RleHQtbGVnYWwtc3Bhbi1ib3gtLW5vdF9sZWdhbCB7XFxuICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmZjAwMDA7IH1cXG4gICAgICAgIC5jYXJkX190ZXh0LWxlZ2FsLXNwYW4tYm94LS1sZWdhbCB7XFxuICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6ICM0N2QxNDc7IH1cXG4gIC5jYXJkX19zZXQge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9XFxuICAgIC5jYXJkX19zZXQtYmFubmVyIHtcXG4gICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkICNiZmJmYmY7XFxuICAgICAgd2lkdGg6IDQwcmVtO1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICMwMDA7XFxuICAgICAgY29sb3I6ICNmZmY7IH1cXG4gICAgICAuY2FyZF9fc2V0LWJhbm5lci1zdmctY29udGFpbmVyIHtcXG4gICAgICAgIG1hcmdpbi1yaWdodDogMXJlbTsgfVxcbiAgICAgIC5jYXJkX19zZXQtYmFubmVyLXN2ZyB7XFxuICAgICAgICB3aWR0aDogMi40cmVtO1xcbiAgICAgICAgaGVpZ2h0OiAyLjRyZW07XFxuICAgICAgICBmaWx0ZXI6IGludmVydCgxMDAlKTsgfVxcbiAgICAuY2FyZF9fc2V0LWRldGFpbHMge1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgfVxcbiAgICAuY2FyZF9fc2V0LWhlYWRlci1uYW1lIHtcXG4gICAgICBmb250LXNpemU6IDEuN3JlbXJlbTsgfVxcbiAgICAuY2FyZF9fc2V0LWhlYWRlci1jb2RlIHtcXG4gICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOyB9XFxuICAgIC5jYXJkX19zZXQtcHJpbnRzLWhlYWRlciB7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzAwMDtcXG4gICAgICBjb2xvcjogI2ZmZjtcXG4gICAgICBmb250LXNpemU6IDEuM3JlbTtcXG4gICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkICNiZmJmYmY7XFxuICAgICAgcGFkZGluZzogLjNyZW0gLjdyZW07IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtc3ZnLWNvbnRhaW5lciB7XFxuICAgICAgaGVpZ2h0OiAxLjhyZW07XFxuICAgICAgd2lkdGg6IDEuOHJlbTtcXG4gICAgICBib3JkZXI6IDFweCBzb2xpZCAjYmZiZmJmO1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgICBib3JkZXItcmFkaXVzOiAxMDAlOyB9XFxuICAgIC5jYXJkX19zZXQtcHJpbnRzLXN2Zy0tY29tbW9uIHtcXG4gICAgICBmaWxsOiAjMDAwOyB9XFxuICAgIC5jYXJkX19zZXQtcHJpbnRzLXN2Zy0tdW5jb21tb24ge1xcbiAgICAgIGZpbGw6ICNlNmU2ZTY7IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtc3ZnLS1yYXJlIHtcXG4gICAgICBmaWxsOiAjZTZjMzAwOyB9XFxuICAgIC5jYXJkX19zZXQtcHJpbnRzLXN2Zy0tbXl0aGljIHtcXG4gICAgICBmaWxsOiAjZmYwMDAwOyB9XFxuICAgIC5jYXJkX19zZXQtcHJpbnRzLWxpc3Qge1xcbiAgICAgIGxpc3Qtc3R5bGU6IG5vbmU7IH1cXG4gICAgICAuY2FyZF9fc2V0LXByaW50cy1saXN0LWxpbms6bGluaywgLmNhcmRfX3NldC1wcmludHMtbGlzdC1saW5rOnZpc2l0ZWQge1xcbiAgICAgICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgICAgICAgY29sb3I6ICMwMDA7IH1cXG4gICAgICAuY2FyZF9fc2V0LXByaW50cy1saXN0LWl0ZW0ge1xcbiAgICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcXG4gICAgICAgIGN1cnNvcjogcG9pbnRlcjsgfVxcbiAgICAgICAgLmNhcmRfX3NldC1wcmludHMtbGlzdC1pdGVtOmhvdmVyIHtcXG4gICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2YyZjJmMjsgfVxcbiAgICAgIC5jYXJkX19zZXQtcHJpbnRzLWxpc3QtaXRlbS1uYW1lLXdyYXBwZXIge1xcbiAgICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgICAgICBtYXJnaW4tbGVmdDogLTFyZW07IH1cXG4gICAgICAuY2FyZF9fc2V0LXByaW50cy1saXN0LWl0ZW0tc2V0LW5hbWUge1xcbiAgICAgICAgbWFyZ2luLWxlZnQ6IC41cmVtOyB9XFxuICAgICAgLmNhcmRfX3NldC1wcmludHMtbGlzdC1pdGVtLXByaWNlIHtcXG4gICAgICAgIG1hcmdpbi1yaWdodDogLjdyZW07IH1cXG5cXG4uY2FyZC1wYWdlIHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgZ3JpZC1jb2x1bW46IGNlbnRlci1zdGFydCAvIGNlbnRlci1lbmQ7IH1cXG5cXG4uYWRkLXRvLWludiB7XFxuICBtYXJnaW4tdG9wOiAzcmVtO1xcbiAgd2lkdGg6IDUwJTsgfVxcbiAgLmFkZC10by1pbnZfX2Zvcm0ge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9XFxuICAgIC5hZGQtdG8taW52X19mb3JtLWdyb3VwIHtcXG4gICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgIGFsaWduLWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgICBtYXJnaW4tYm90dG9tOiAzcmVtOyB9XFxuICAgIC5hZGQtdG8taW52X19mb3JtLWxhYmVsIHtcXG4gICAgICBtYXJnaW4tcmlnaHQ6IC4zcmVtOyB9XFxuXFxuLm5vLXJlc3VsdHMge1xcbiAganVzdGlmeS1zZWxmOiBjZW50ZXI7IH1cXG5cXG4uY29udGFpbmVyIHtcXG4gIGRpc3BsYXk6IGdyaWQ7XFxuICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IFtmdWxsLXN0YXJ0XSBtaW5tYXgoNnJlbSwgMWZyKSBbY2VudGVyLXN0YXJ0XSByZXBlYXQoOCwgW2NvbC1zdGFydF0gbWlubWF4KG1pbi1jb250ZW50LCAxNHJlbSkgW2NvbC1lbmRdKSBbY2VudGVyLWVuZF0gbWlubWF4KDZyZW0sIDFmcikgW2Z1bGwtZW5kXTsgfVxcblxcbi5sb2dpbixcXG4ucmVnaXN0ZXIge1xcbiAgbWFyZ2luLXRvcDogNXJlbTtcXG4gIGdyaWQtY29sdW1uOiBjZW50ZXItc3RhcnQgLyBjZW50ZXItZW5kO1xcbiAgYmFja2dyb3VuZC1pbWFnZTogbGluZWFyLWdyYWRpZW50KHRvIHJpZ2h0IGJvdHRvbSwgcmdiYSgwLCAwLCAwLCAwLjgpLCByZ2JhKDAsIDAsIDAsIDAuOCkpLCB1cmwoLi4vaW1nL2xvZ2luLWJnLmpwZyk7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICBoZWlnaHQ6IDc1dmg7XFxuICBiYWNrZ3JvdW5kLXNpemU6IGNvdmVyO1xcbiAgYmFja2dyb3VuZC1wb3NpdGlvbjogY2VudGVyOyB9XFxuXFxuLnNlYXJjaCB7XFxuICBncmlkLWNvbHVtbjogZnVsbC1zdGFydCAvIGZ1bGwtZW5kO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjsgfVxcblxcbi5hcGktcmVzdWx0cy1kaXNwbGF5IHtcXG4gIGdyaWQtY29sdW1uOiBmdWxsLXN0YXJ0IC8gZnVsbC1lbmQ7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgZGlzcGxheTogZ3JpZDsgfVxcblwiXSxcInNvdXJjZVJvb3RcIjpcIlwifV0pO1xuLy8gRXhwb3J0c1xuZXhwb3J0IGRlZmF1bHQgX19fQ1NTX0xPQURFUl9FWFBPUlRfX187XG4iLCIvLyBJbXBvcnRzXG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyBmcm9tIFwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2Nzc1dpdGhNYXBwaW5nVG9TdHJpbmcuanNcIjtcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18gZnJvbSBcIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanNcIjtcbmltcG9ydCBfX19DU1NfTE9BREVSX0dFVF9VUkxfSU1QT1JUX19fIGZyb20gXCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvZ2V0VXJsLmpzXCI7XG5pbXBvcnQgX19fQ1NTX0xPQURFUl9VUkxfSU1QT1JUXzBfX18gZnJvbSBcIi4uLy4uL2ltZy9tYW5hLXN5bWJvbHMvbWFuYS5zdmdcIjtcbnZhciBfX19DU1NfTE9BREVSX0VYUE9SVF9fXyA9IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyhfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fKTtcbnZhciBfX19DU1NfTE9BREVSX1VSTF9SRVBMQUNFTUVOVF8wX19fID0gX19fQ1NTX0xPQURFUl9HRVRfVVJMX0lNUE9SVF9fXyhfX19DU1NfTE9BREVSX1VSTF9JTVBPUlRfMF9fXyk7XG4vLyBNb2R1bGVcbl9fX0NTU19MT0FERVJfRVhQT1JUX19fLnB1c2goW21vZHVsZS5pZCwgXCIubWFuYSB7XFxuICAgIGJhY2tncm91bmQtaW1hZ2U6IHVybChcIiArIF9fX0NTU19MT0FERVJfVVJMX1JFUExBQ0VNRU5UXzBfX18gKyBcIik7XFxuICAgIGJhY2tncm91bmQtcmVwZWF0OiBuby1yZXBlYXQ7XFxuICAgIGJhY2tncm91bmQtc2l6ZTogYXV0byA3MDAlO1xcbiAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICAgIGZvbnQtc2l6ZTogMTAwJTtcXG59XFxuXFxuLm1hbmEueHMge1xcbiAgICB3aWR0aDogMS41cmVtO1xcbiAgICBoZWlnaHQ6IDEuNXJlbTtcXG59XFxuXFxuLm1hbmEuc21hbGwge1xcbiAgICBoZWlnaHQ6IDJyZW07XFxuICAgIHdpZHRoOiAycmVtO1xcbn1cXG4ubWFuYS5tZWRpdW0ge1xcbiAgICBoZWlnaHQ6IDJlbTtcXG4gICAgd2lkdGg6IDJlbTtcXG59XFxuLm1hbmEubGFyZ2Uge1xcbiAgICBoZWlnaHQ6IDRlbTtcXG4gICAgd2lkdGg6IDRlbTtcXG59XFxuLm1hbmEucyB7IGJhY2tncm91bmQtcG9zaXRpb246IDAgMDsgfVxcbi5tYW5hLnMxIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMTEuMSUgMDsgfVxcbi5tYW5hLnMyIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMjIuMiUgMDsgfVxcbi5tYW5hLnMzIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMzMuMyUgMDsgfVxcbi5tYW5hLnM0IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNDQuNCUgMDsgfVxcbi5tYW5hLnM1IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNTUuNSUgMDsgfVxcbi5tYW5hLnM2IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNjYuNiUgMDsgfVxcbi5tYW5hLnM3IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNzcuNyUgMDsgfVxcbi5tYW5hLnM4IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogODguOCUgMDsgfVxcbi5tYW5hLnM5IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogOTkuOSUgMDsgfVxcblxcbi5tYW5hLnMxMCB7IGJhY2tncm91bmQtcG9zaXRpb246IDAgMTYlOyB9XFxuLm1hbmEuczExIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMTEuMSUgMTYuNiU7IH1cXG4ubWFuYS5zMTIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAyMi4yJSAxNi42JTsgfVxcbi5tYW5hLnMxMyB7IGJhY2tncm91bmQtcG9zaXRpb246IDMzLjMlIDE2LjYlOyB9XFxuLm1hbmEuczE0IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNDQuNCUgMTYuNiU7IH1cXG4ubWFuYS5zMTUgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA1NS41JSAxNi42JTsgfVxcbi5tYW5hLnMxNiB7IGJhY2tncm91bmQtcG9zaXRpb246IDY2LjYlIDE2LjYlOyB9XFxuLm1hbmEuczE3IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNzcuNyUgMTYuNiU7IH1cXG4ubWFuYS5zMTggeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4OC44JSAxNi42JTsgfVxcbi5tYW5hLnMxOSB7IGJhY2tncm91bmQtcG9zaXRpb246IDk5LjklIDE2LjYlOyB9XFxuXFxuLm1hbmEuczIwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMCAzMyU7IH1cXG4ubWFuYS5zeCB7IGJhY2tncm91bmQtcG9zaXRpb246IDExLjElIDMzLjMlOyB9XFxuLm1hbmEuc3kgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAyMi4yJSAzMy4zJTsgfVxcbi5tYW5hLnN6IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMzMuMyUgMzMuMyU7IH1cXG4ubWFuYS5zdyB7IGJhY2tncm91bmQtcG9zaXRpb246IDQ0LjQlIDMzLjMlOyB9XFxuLm1hbmEuc3UgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA1NS41JSAzMy4zJTsgfVxcbi5tYW5hLnNiIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNjYuNiUgMzMuMyU7IH1cXG4ubWFuYS5zciB7IGJhY2tncm91bmQtcG9zaXRpb246IDc3LjclIDMzLjMlOyB9XFxuLm1hbmEuc2cgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4OC44JSAzMy4zJTsgfVxcbi5tYW5hLnNzIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogOTkuOSUgMzMuMyU7IH1cXG5cXG4ubWFuYS5zd3UgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwIDUwJTsgfVxcbi5tYW5hLnN3YiB7IGJhY2tncm91bmQtcG9zaXRpb246IDExLjElIDUwJTsgfVxcbi5tYW5hLnN1YiB7IGJhY2tncm91bmQtcG9zaXRpb246IDIyLjIlIDUwJTsgfVxcbi5tYW5hLnN1ciB7IGJhY2tncm91bmQtcG9zaXRpb246IDMzLjMlIDUwJTsgfVxcbi5tYW5hLnNiciB7IGJhY2tncm91bmQtcG9zaXRpb246IDQ0LjQlIDUwJTsgfVxcbi5tYW5hLnNiZyB7IGJhY2tncm91bmQtcG9zaXRpb246IDU1LjUlIDUwJTsgfVxcbi5tYW5hLnNydyB7IGJhY2tncm91bmQtcG9zaXRpb246IDY2LjYlIDUwJTsgfVxcbi5tYW5hLnNyZyB7IGJhY2tncm91bmQtcG9zaXRpb246IDc3LjclIDUwJTsgfVxcbi5tYW5hLnNndyB7IGJhY2tncm91bmQtcG9zaXRpb246IDg4LjglIDUwJTsgfVxcbi5tYW5hLnNndSB7IGJhY2tncm91bmQtcG9zaXRpb246IDk5LjklIDUwJTsgfVxcblxcbi5tYW5hLnMydyB7IGJhY2tncm91bmQtcG9zaXRpb246IDAgNjYuNiU7IH1cXG4ubWFuYS5zMnUgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAxMS4xJSA2Ni42JTsgfVxcbi5tYW5hLnMyYiB7IGJhY2tncm91bmQtcG9zaXRpb246IDIyLjIlIDY2LjYlOyB9XFxuLm1hbmEuczJyIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMzMuMyUgNjYuNiU7IH1cXG4ubWFuYS5zMmcgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA0NC40JSA2Ni42JTsgfVxcbi5tYW5hLnN3cCB7IGJhY2tncm91bmQtcG9zaXRpb246IDU1LjUlIDY2LjYlOyB9XFxuLm1hbmEuc3VwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNjYuNiUgNjYuNiU7IH1cXG4ubWFuYS5zYnAgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA3Ny43JSA2Ni42JTsgfVxcbi5tYW5hLnNycCB7IGJhY2tncm91bmQtcG9zaXRpb246IDg4LjglIDY2LjYlOyB9XFxuLm1hbmEuc2dwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogOTkuOSUgNjYuNiU7IH1cXG5cXG4ubWFuYS5zdCB7IGJhY2tncm91bmQtcG9zaXRpb246IDAlIDgzLjMlOyB9XFxuLm1hbmEuc3EgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAxMS4xJSA4My4zJTsgfVxcblxcbi5tYW5hLnNjIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNzcuNyUgODMuMyU7IH1cXG5cXG4ubWFuYS5zZSB7IGJhY2tncm91bmQtcG9zaXRpb246IDg4LjglIDgzLjMlOyB9XFxuXFxuLm1hbmEuczEwMDAwMDAgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwIDEwMCU7IH1cXG4ubWFuYS5zMTAwMDAwMC5zbWFsbCB7IHdpZHRoOiA0LjllbTsgfVxcbi5tYW5hLnMxMDAwMDAwLm1lZGl1bSB7IHdpZHRoOiA5LjdlbTsgfVxcbi8qLm1hbmEuczEwMDAwMDAubGFyZ2UgeyB3aWR0aDogMTguOGVtOyB9Ki9cXG4ubWFuYS5zMTAwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNjAlIDEwMCU7IH1cXG4ubWFuYS5zMTAwLnNtYWxsIHsgd2lkdGg6IDEuOGVtOyB9XFxuLm1hbmEuczEwMC5tZWRpdW0geyB3aWR0aDogMy43ZW07IH1cXG4vKi5tYW5hLnMxMDAubGFyZ2UgeyB3aWR0aDogMTAuOGVtOyB9Ki9cXG4ubWFuYS5zY2hhb3MgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA3Ni41JSAxMDAlOyB9XFxuLm1hbmEuc2NoYW9zLnNtYWxsIHsgd2lkdGg6IDEuMmVtOyB9XFxuLm1hbmEuc2NoYW9zLm1lZGl1bSB7IHdpZHRoOiAyLjNlbTsgfVxcbi8qLm1hbmEuc2MubGFyZ2UgeyB3aWR0aDogNC42ZW07IH0qL1xcbi5tYW5hLnNodyB7IGJhY2tncm91bmQtcG9zaXRpb246IDgzLjUlIDEwMCU7IH1cXG4ubWFuYS5zaHcuc21hbGwgeyB3aWR0aDogMC41ZW07IH1cXG4ubWFuYS5zaHcubWVkaXVtIHsgd2lkdGg6IDFlbTsgfVxcbi8qLm1hbmEuc2h3LmxhcmdlIHsgd2lkdGg6IDJlbTsgfSovXFxuLm1hbmEuc2hyIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogODklIDEwMCU7IH1cXG4ubWFuYS5zaHIuc21hbGwgeyB3aWR0aDogMC41ZW07IH1cXG4ubWFuYS5zaHIubWVkaXVtIHsgd2lkdGg6IDFlbTsgfVxcbi8qLm1hbmEuc2hyLmxhcmdlIHsgd2lkdGg6IDJlbTsgfSovXFxuXFxuXFxuLnNoYWRvdyB7XFxuICAgIGZpbHRlcjogXFxcInByb2dpZDpEWEltYWdlVHJhbnNmb3JtLk1pY3Jvc29mdC5Ecm9wc2hhZG93KE9mZlg9LTEsIE9mZlk9MSwgQ29sb3I9JyMwMDAnKVxcXCI7XFxuICAgIGZpbHRlcjogdXJsKCNzaGFkb3cpO1xcbiAgICAtd2Via2l0LWZpbHRlcjogZHJvcC1zaGFkb3coLTFweCAxcHggMHB4ICMwMDApO1xcbiAgICBmaWx0ZXI6IGRyb3Atc2hhZG93KC0xcHggMXB4IDBweCAjMDAwKTtcXG59XCIsIFwiXCIse1widmVyc2lvblwiOjMsXCJzb3VyY2VzXCI6W1wid2VicGFjazovL3NyYy9jc3MvdmVuZG9yL21hbmEuY3NzXCJdLFwibmFtZXNcIjpbXSxcIm1hcHBpbmdzXCI6XCJBQUFBO0lBQ0kseURBQXdEO0lBQ3hELDRCQUE0QjtJQUM1QiwwQkFBMEI7SUFDMUIscUJBQXFCO0lBQ3JCLGVBQWU7QUFDbkI7O0FBRUE7SUFDSSxhQUFhO0lBQ2IsY0FBYztBQUNsQjs7QUFFQTtJQUNJLFlBQVk7SUFDWixXQUFXO0FBQ2Y7QUFDQTtJQUNJLFdBQVc7SUFDWCxVQUFVO0FBQ2Q7QUFDQTtJQUNJLFdBQVc7SUFDWCxVQUFVO0FBQ2Q7QUFDQSxVQUFVLHdCQUF3QixFQUFFO0FBQ3BDLFdBQVcsNEJBQTRCLEVBQUU7QUFDekMsV0FBVyw0QkFBNEIsRUFBRTtBQUN6QyxXQUFXLDRCQUE0QixFQUFFO0FBQ3pDLFdBQVcsNEJBQTRCLEVBQUU7QUFDekMsV0FBVyw0QkFBNEIsRUFBRTtBQUN6QyxXQUFXLDRCQUE0QixFQUFFO0FBQ3pDLFdBQVcsNEJBQTRCLEVBQUU7QUFDekMsV0FBVyw0QkFBNEIsRUFBRTtBQUN6QyxXQUFXLDRCQUE0QixFQUFFOztBQUV6QyxZQUFZLDBCQUEwQixFQUFFO0FBQ3hDLFlBQVksZ0NBQWdDLEVBQUU7QUFDOUMsWUFBWSxnQ0FBZ0MsRUFBRTtBQUM5QyxZQUFZLGdDQUFnQyxFQUFFO0FBQzlDLFlBQVksZ0NBQWdDLEVBQUU7QUFDOUMsWUFBWSxnQ0FBZ0MsRUFBRTtBQUM5QyxZQUFZLGdDQUFnQyxFQUFFO0FBQzlDLFlBQVksZ0NBQWdDLEVBQUU7QUFDOUMsWUFBWSxnQ0FBZ0MsRUFBRTtBQUM5QyxZQUFZLGdDQUFnQyxFQUFFOztBQUU5QyxZQUFZLDBCQUEwQixFQUFFO0FBQ3hDLFdBQVcsZ0NBQWdDLEVBQUU7QUFDN0MsV0FBVyxnQ0FBZ0MsRUFBRTtBQUM3QyxXQUFXLGdDQUFnQyxFQUFFO0FBQzdDLFdBQVcsZ0NBQWdDLEVBQUU7QUFDN0MsV0FBVyxnQ0FBZ0MsRUFBRTtBQUM3QyxXQUFXLGdDQUFnQyxFQUFFO0FBQzdDLFdBQVcsZ0NBQWdDLEVBQUU7QUFDN0MsV0FBVyxnQ0FBZ0MsRUFBRTtBQUM3QyxXQUFXLGdDQUFnQyxFQUFFOztBQUU3QyxZQUFZLDBCQUEwQixFQUFFO0FBQ3hDLFlBQVksOEJBQThCLEVBQUU7QUFDNUMsWUFBWSw4QkFBOEIsRUFBRTtBQUM1QyxZQUFZLDhCQUE4QixFQUFFO0FBQzVDLFlBQVksOEJBQThCLEVBQUU7QUFDNUMsWUFBWSw4QkFBOEIsRUFBRTtBQUM1QyxZQUFZLDhCQUE4QixFQUFFO0FBQzVDLFlBQVksOEJBQThCLEVBQUU7QUFDNUMsWUFBWSw4QkFBOEIsRUFBRTtBQUM1QyxZQUFZLDhCQUE4QixFQUFFOztBQUU1QyxZQUFZLDRCQUE0QixFQUFFO0FBQzFDLFlBQVksZ0NBQWdDLEVBQUU7QUFDOUMsWUFBWSxnQ0FBZ0MsRUFBRTtBQUM5QyxZQUFZLGdDQUFnQyxFQUFFO0FBQzlDLFlBQVksZ0NBQWdDLEVBQUU7QUFDOUMsWUFBWSxnQ0FBZ0MsRUFBRTtBQUM5QyxZQUFZLGdDQUFnQyxFQUFFO0FBQzlDLFlBQVksZ0NBQWdDLEVBQUU7QUFDOUMsWUFBWSxnQ0FBZ0MsRUFBRTtBQUM5QyxZQUFZLGdDQUFnQyxFQUFFOztBQUU5QyxXQUFXLDZCQUE2QixFQUFFO0FBQzFDLFdBQVcsZ0NBQWdDLEVBQUU7O0FBRTdDLFdBQVcsZ0NBQWdDLEVBQUU7O0FBRTdDLFdBQVcsZ0NBQWdDLEVBQUU7O0FBRTdDLGlCQUFpQiwyQkFBMkIsRUFBRTtBQUM5Qyx1QkFBdUIsWUFBWSxFQUFFO0FBQ3JDLHdCQUF3QixZQUFZLEVBQUU7QUFDdEMsMENBQTBDO0FBQzFDLGFBQWEsNkJBQTZCLEVBQUU7QUFDNUMsbUJBQW1CLFlBQVksRUFBRTtBQUNqQyxvQkFBb0IsWUFBWSxFQUFFO0FBQ2xDLHNDQUFzQztBQUN0QyxlQUFlLCtCQUErQixFQUFFO0FBQ2hELHFCQUFxQixZQUFZLEVBQUU7QUFDbkMsc0JBQXNCLFlBQVksRUFBRTtBQUNwQyxtQ0FBbUM7QUFDbkMsWUFBWSwrQkFBK0IsRUFBRTtBQUM3QyxrQkFBa0IsWUFBWSxFQUFFO0FBQ2hDLG1CQUFtQixVQUFVLEVBQUU7QUFDL0Isa0NBQWtDO0FBQ2xDLFlBQVksNkJBQTZCLEVBQUU7QUFDM0Msa0JBQWtCLFlBQVksRUFBRTtBQUNoQyxtQkFBbUIsVUFBVSxFQUFFO0FBQy9CLGtDQUFrQzs7O0FBR2xDO0lBQ0kscUZBQXFGO0lBQ3JGLG9CQUFvQjtJQUNwQiw4Q0FBOEM7SUFDOUMsc0NBQXNDO0FBQzFDXCIsXCJzb3VyY2VzQ29udGVudFwiOltcIi5tYW5hIHtcXG4gICAgYmFja2dyb3VuZC1pbWFnZTogdXJsKCcuLi8uLi9pbWcvbWFuYS1zeW1ib2xzL21hbmEuc3ZnJyk7XFxuICAgIGJhY2tncm91bmQtcmVwZWF0OiBuby1yZXBlYXQ7XFxuICAgIGJhY2tncm91bmQtc2l6ZTogYXV0byA3MDAlO1xcbiAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICAgIGZvbnQtc2l6ZTogMTAwJTtcXG59XFxuXFxuLm1hbmEueHMge1xcbiAgICB3aWR0aDogMS41cmVtO1xcbiAgICBoZWlnaHQ6IDEuNXJlbTtcXG59XFxuXFxuLm1hbmEuc21hbGwge1xcbiAgICBoZWlnaHQ6IDJyZW07XFxuICAgIHdpZHRoOiAycmVtO1xcbn1cXG4ubWFuYS5tZWRpdW0ge1xcbiAgICBoZWlnaHQ6IDJlbTtcXG4gICAgd2lkdGg6IDJlbTtcXG59XFxuLm1hbmEubGFyZ2Uge1xcbiAgICBoZWlnaHQ6IDRlbTtcXG4gICAgd2lkdGg6IDRlbTtcXG59XFxuLm1hbmEucyB7IGJhY2tncm91bmQtcG9zaXRpb246IDAgMDsgfVxcbi5tYW5hLnMxIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMTEuMSUgMDsgfVxcbi5tYW5hLnMyIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMjIuMiUgMDsgfVxcbi5tYW5hLnMzIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMzMuMyUgMDsgfVxcbi5tYW5hLnM0IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNDQuNCUgMDsgfVxcbi5tYW5hLnM1IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNTUuNSUgMDsgfVxcbi5tYW5hLnM2IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNjYuNiUgMDsgfVxcbi5tYW5hLnM3IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNzcuNyUgMDsgfVxcbi5tYW5hLnM4IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogODguOCUgMDsgfVxcbi5tYW5hLnM5IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogOTkuOSUgMDsgfVxcblxcbi5tYW5hLnMxMCB7IGJhY2tncm91bmQtcG9zaXRpb246IDAgMTYlOyB9XFxuLm1hbmEuczExIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMTEuMSUgMTYuNiU7IH1cXG4ubWFuYS5zMTIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAyMi4yJSAxNi42JTsgfVxcbi5tYW5hLnMxMyB7IGJhY2tncm91bmQtcG9zaXRpb246IDMzLjMlIDE2LjYlOyB9XFxuLm1hbmEuczE0IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNDQuNCUgMTYuNiU7IH1cXG4ubWFuYS5zMTUgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA1NS41JSAxNi42JTsgfVxcbi5tYW5hLnMxNiB7IGJhY2tncm91bmQtcG9zaXRpb246IDY2LjYlIDE2LjYlOyB9XFxuLm1hbmEuczE3IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNzcuNyUgMTYuNiU7IH1cXG4ubWFuYS5zMTggeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4OC44JSAxNi42JTsgfVxcbi5tYW5hLnMxOSB7IGJhY2tncm91bmQtcG9zaXRpb246IDk5LjklIDE2LjYlOyB9XFxuXFxuLm1hbmEuczIwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMCAzMyU7IH1cXG4ubWFuYS5zeCB7IGJhY2tncm91bmQtcG9zaXRpb246IDExLjElIDMzLjMlOyB9XFxuLm1hbmEuc3kgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAyMi4yJSAzMy4zJTsgfVxcbi5tYW5hLnN6IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMzMuMyUgMzMuMyU7IH1cXG4ubWFuYS5zdyB7IGJhY2tncm91bmQtcG9zaXRpb246IDQ0LjQlIDMzLjMlOyB9XFxuLm1hbmEuc3UgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA1NS41JSAzMy4zJTsgfVxcbi5tYW5hLnNiIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNjYuNiUgMzMuMyU7IH1cXG4ubWFuYS5zciB7IGJhY2tncm91bmQtcG9zaXRpb246IDc3LjclIDMzLjMlOyB9XFxuLm1hbmEuc2cgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4OC44JSAzMy4zJTsgfVxcbi5tYW5hLnNzIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogOTkuOSUgMzMuMyU7IH1cXG5cXG4ubWFuYS5zd3UgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwIDUwJTsgfVxcbi5tYW5hLnN3YiB7IGJhY2tncm91bmQtcG9zaXRpb246IDExLjElIDUwJTsgfVxcbi5tYW5hLnN1YiB7IGJhY2tncm91bmQtcG9zaXRpb246IDIyLjIlIDUwJTsgfVxcbi5tYW5hLnN1ciB7IGJhY2tncm91bmQtcG9zaXRpb246IDMzLjMlIDUwJTsgfVxcbi5tYW5hLnNiciB7IGJhY2tncm91bmQtcG9zaXRpb246IDQ0LjQlIDUwJTsgfVxcbi5tYW5hLnNiZyB7IGJhY2tncm91bmQtcG9zaXRpb246IDU1LjUlIDUwJTsgfVxcbi5tYW5hLnNydyB7IGJhY2tncm91bmQtcG9zaXRpb246IDY2LjYlIDUwJTsgfVxcbi5tYW5hLnNyZyB7IGJhY2tncm91bmQtcG9zaXRpb246IDc3LjclIDUwJTsgfVxcbi5tYW5hLnNndyB7IGJhY2tncm91bmQtcG9zaXRpb246IDg4LjglIDUwJTsgfVxcbi5tYW5hLnNndSB7IGJhY2tncm91bmQtcG9zaXRpb246IDk5LjklIDUwJTsgfVxcblxcbi5tYW5hLnMydyB7IGJhY2tncm91bmQtcG9zaXRpb246IDAgNjYuNiU7IH1cXG4ubWFuYS5zMnUgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAxMS4xJSA2Ni42JTsgfVxcbi5tYW5hLnMyYiB7IGJhY2tncm91bmQtcG9zaXRpb246IDIyLjIlIDY2LjYlOyB9XFxuLm1hbmEuczJyIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMzMuMyUgNjYuNiU7IH1cXG4ubWFuYS5zMmcgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA0NC40JSA2Ni42JTsgfVxcbi5tYW5hLnN3cCB7IGJhY2tncm91bmQtcG9zaXRpb246IDU1LjUlIDY2LjYlOyB9XFxuLm1hbmEuc3VwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNjYuNiUgNjYuNiU7IH1cXG4ubWFuYS5zYnAgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA3Ny43JSA2Ni42JTsgfVxcbi5tYW5hLnNycCB7IGJhY2tncm91bmQtcG9zaXRpb246IDg4LjglIDY2LjYlOyB9XFxuLm1hbmEuc2dwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogOTkuOSUgNjYuNiU7IH1cXG5cXG4ubWFuYS5zdCB7IGJhY2tncm91bmQtcG9zaXRpb246IDAlIDgzLjMlOyB9XFxuLm1hbmEuc3EgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAxMS4xJSA4My4zJTsgfVxcblxcbi5tYW5hLnNjIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNzcuNyUgODMuMyU7IH1cXG5cXG4ubWFuYS5zZSB7IGJhY2tncm91bmQtcG9zaXRpb246IDg4LjglIDgzLjMlOyB9XFxuXFxuLm1hbmEuczEwMDAwMDAgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwIDEwMCU7IH1cXG4ubWFuYS5zMTAwMDAwMC5zbWFsbCB7IHdpZHRoOiA0LjllbTsgfVxcbi5tYW5hLnMxMDAwMDAwLm1lZGl1bSB7IHdpZHRoOiA5LjdlbTsgfVxcbi8qLm1hbmEuczEwMDAwMDAubGFyZ2UgeyB3aWR0aDogMTguOGVtOyB9Ki9cXG4ubWFuYS5zMTAwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNjAlIDEwMCU7IH1cXG4ubWFuYS5zMTAwLnNtYWxsIHsgd2lkdGg6IDEuOGVtOyB9XFxuLm1hbmEuczEwMC5tZWRpdW0geyB3aWR0aDogMy43ZW07IH1cXG4vKi5tYW5hLnMxMDAubGFyZ2UgeyB3aWR0aDogMTAuOGVtOyB9Ki9cXG4ubWFuYS5zY2hhb3MgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA3Ni41JSAxMDAlOyB9XFxuLm1hbmEuc2NoYW9zLnNtYWxsIHsgd2lkdGg6IDEuMmVtOyB9XFxuLm1hbmEuc2NoYW9zLm1lZGl1bSB7IHdpZHRoOiAyLjNlbTsgfVxcbi8qLm1hbmEuc2MubGFyZ2UgeyB3aWR0aDogNC42ZW07IH0qL1xcbi5tYW5hLnNodyB7IGJhY2tncm91bmQtcG9zaXRpb246IDgzLjUlIDEwMCU7IH1cXG4ubWFuYS5zaHcuc21hbGwgeyB3aWR0aDogMC41ZW07IH1cXG4ubWFuYS5zaHcubWVkaXVtIHsgd2lkdGg6IDFlbTsgfVxcbi8qLm1hbmEuc2h3LmxhcmdlIHsgd2lkdGg6IDJlbTsgfSovXFxuLm1hbmEuc2hyIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogODklIDEwMCU7IH1cXG4ubWFuYS5zaHIuc21hbGwgeyB3aWR0aDogMC41ZW07IH1cXG4ubWFuYS5zaHIubWVkaXVtIHsgd2lkdGg6IDFlbTsgfVxcbi8qLm1hbmEuc2hyLmxhcmdlIHsgd2lkdGg6IDJlbTsgfSovXFxuXFxuXFxuLnNoYWRvdyB7XFxuICAgIGZpbHRlcjogXFxcInByb2dpZDpEWEltYWdlVHJhbnNmb3JtLk1pY3Jvc29mdC5Ecm9wc2hhZG93KE9mZlg9LTEsIE9mZlk9MSwgQ29sb3I9JyMwMDAnKVxcXCI7XFxuICAgIGZpbHRlcjogdXJsKCNzaGFkb3cpO1xcbiAgICAtd2Via2l0LWZpbHRlcjogZHJvcC1zaGFkb3coLTFweCAxcHggMHB4ICMwMDApO1xcbiAgICBmaWx0ZXI6IGRyb3Atc2hhZG93KC0xcHggMXB4IDBweCAjMDAwKTtcXG59XCJdLFwic291cmNlUm9vdFwiOlwiXCJ9XSk7XG4vLyBFeHBvcnRzXG5leHBvcnQgZGVmYXVsdCBfX19DU1NfTE9BREVSX0VYUE9SVF9fXztcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKlxuICBNSVQgTGljZW5zZSBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuICBBdXRob3IgVG9iaWFzIEtvcHBlcnMgQHNva3JhXG4qL1xuLy8gY3NzIGJhc2UgY29kZSwgaW5qZWN0ZWQgYnkgdGhlIGNzcy1sb2FkZXJcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKSB7XG4gIHZhciBsaXN0ID0gW107IC8vIHJldHVybiB0aGUgbGlzdCBvZiBtb2R1bGVzIGFzIGNzcyBzdHJpbmdcblxuICBsaXN0LnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICB2YXIgY29udGVudCA9IGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcoaXRlbSk7XG5cbiAgICAgIGlmIChpdGVtWzJdKSB7XG4gICAgICAgIHJldHVybiBcIkBtZWRpYSBcIi5jb25jYXQoaXRlbVsyXSwgXCIge1wiKS5jb25jYXQoY29udGVudCwgXCJ9XCIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY29udGVudDtcbiAgICB9KS5qb2luKCcnKTtcbiAgfTsgLy8gaW1wb3J0IGEgbGlzdCBvZiBtb2R1bGVzIGludG8gdGhlIGxpc3RcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGZ1bmMtbmFtZXNcblxuXG4gIGxpc3QuaSA9IGZ1bmN0aW9uIChtb2R1bGVzLCBtZWRpYVF1ZXJ5LCBkZWR1cGUpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZXMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgICAgIG1vZHVsZXMgPSBbW251bGwsIG1vZHVsZXMsICcnXV07XG4gICAgfVxuXG4gICAgdmFyIGFscmVhZHlJbXBvcnRlZE1vZHVsZXMgPSB7fTtcblxuICAgIGlmIChkZWR1cGUpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcHJlZmVyLWRlc3RydWN0dXJpbmdcbiAgICAgICAgdmFyIGlkID0gdGhpc1tpXVswXTtcblxuICAgICAgICBpZiAoaWQgIT0gbnVsbCkge1xuICAgICAgICAgIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaWRdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBtb2R1bGVzLmxlbmd0aDsgX2krKykge1xuICAgICAgdmFyIGl0ZW0gPSBbXS5jb25jYXQobW9kdWxlc1tfaV0pO1xuXG4gICAgICBpZiAoZGVkdXBlICYmIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaXRlbVswXV0pIHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnRpbnVlXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAobWVkaWFRdWVyeSkge1xuICAgICAgICBpZiAoIWl0ZW1bMl0pIHtcbiAgICAgICAgICBpdGVtWzJdID0gbWVkaWFRdWVyeTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzJdID0gXCJcIi5jb25jYXQobWVkaWFRdWVyeSwgXCIgYW5kIFwiKS5jb25jYXQoaXRlbVsyXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbGlzdC5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gbGlzdDtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIF9zbGljZWRUb0FycmF5KGFyciwgaSkgeyByZXR1cm4gX2FycmF5V2l0aEhvbGVzKGFycikgfHwgX2l0ZXJhYmxlVG9BcnJheUxpbWl0KGFyciwgaSkgfHwgX3Vuc3VwcG9ydGVkSXRlcmFibGVUb0FycmF5KGFyciwgaSkgfHwgX25vbkl0ZXJhYmxlUmVzdCgpOyB9XG5cbmZ1bmN0aW9uIF9ub25JdGVyYWJsZVJlc3QoKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlLlxcbkluIG9yZGVyIHRvIGJlIGl0ZXJhYmxlLCBub24tYXJyYXkgb2JqZWN0cyBtdXN0IGhhdmUgYSBbU3ltYm9sLml0ZXJhdG9yXSgpIG1ldGhvZC5cIik7IH1cblxuZnVuY3Rpb24gX3Vuc3VwcG9ydGVkSXRlcmFibGVUb0FycmF5KG8sIG1pbkxlbikgeyBpZiAoIW8pIHJldHVybjsgaWYgKHR5cGVvZiBvID09PSBcInN0cmluZ1wiKSByZXR1cm4gX2FycmF5TGlrZVRvQXJyYXkobywgbWluTGVuKTsgdmFyIG4gPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobykuc2xpY2UoOCwgLTEpOyBpZiAobiA9PT0gXCJPYmplY3RcIiAmJiBvLmNvbnN0cnVjdG9yKSBuID0gby5jb25zdHJ1Y3Rvci5uYW1lOyBpZiAobiA9PT0gXCJNYXBcIiB8fCBuID09PSBcIlNldFwiKSByZXR1cm4gQXJyYXkuZnJvbShvKTsgaWYgKG4gPT09IFwiQXJndW1lbnRzXCIgfHwgL14oPzpVaXxJKW50KD86OHwxNnwzMikoPzpDbGFtcGVkKT9BcnJheSQvLnRlc3QobikpIHJldHVybiBfYXJyYXlMaWtlVG9BcnJheShvLCBtaW5MZW4pOyB9XG5cbmZ1bmN0aW9uIF9hcnJheUxpa2VUb0FycmF5KGFyciwgbGVuKSB7IGlmIChsZW4gPT0gbnVsbCB8fCBsZW4gPiBhcnIubGVuZ3RoKSBsZW4gPSBhcnIubGVuZ3RoOyBmb3IgKHZhciBpID0gMCwgYXJyMiA9IG5ldyBBcnJheShsZW4pOyBpIDwgbGVuOyBpKyspIHsgYXJyMltpXSA9IGFycltpXTsgfSByZXR1cm4gYXJyMjsgfVxuXG5mdW5jdGlvbiBfaXRlcmFibGVUb0FycmF5TGltaXQoYXJyLCBpKSB7IGlmICh0eXBlb2YgU3ltYm9sID09PSBcInVuZGVmaW5lZFwiIHx8ICEoU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdChhcnIpKSkgcmV0dXJuOyB2YXIgX2FyciA9IFtdOyB2YXIgX24gPSB0cnVlOyB2YXIgX2QgPSBmYWxzZTsgdmFyIF9lID0gdW5kZWZpbmVkOyB0cnkgeyBmb3IgKHZhciBfaSA9IGFycltTeW1ib2wuaXRlcmF0b3JdKCksIF9zOyAhKF9uID0gKF9zID0gX2kubmV4dCgpKS5kb25lKTsgX24gPSB0cnVlKSB7IF9hcnIucHVzaChfcy52YWx1ZSk7IGlmIChpICYmIF9hcnIubGVuZ3RoID09PSBpKSBicmVhazsgfSB9IGNhdGNoIChlcnIpIHsgX2QgPSB0cnVlOyBfZSA9IGVycjsgfSBmaW5hbGx5IHsgdHJ5IHsgaWYgKCFfbiAmJiBfaVtcInJldHVyblwiXSAhPSBudWxsKSBfaVtcInJldHVyblwiXSgpOyB9IGZpbmFsbHkgeyBpZiAoX2QpIHRocm93IF9lOyB9IH0gcmV0dXJuIF9hcnI7IH1cblxuZnVuY3Rpb24gX2FycmF5V2l0aEhvbGVzKGFycikgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSByZXR1cm4gYXJyOyB9XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtKSB7XG4gIHZhciBfaXRlbSA9IF9zbGljZWRUb0FycmF5KGl0ZW0sIDQpLFxuICAgICAgY29udGVudCA9IF9pdGVtWzFdLFxuICAgICAgY3NzTWFwcGluZyA9IF9pdGVtWzNdO1xuXG4gIGlmICh0eXBlb2YgYnRvYSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxuICAgIHZhciBiYXNlNjQgPSBidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShjc3NNYXBwaW5nKSkpKTtcbiAgICB2YXIgZGF0YSA9IFwic291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsXCIuY29uY2F0KGJhc2U2NCk7XG4gICAgdmFyIHNvdXJjZU1hcHBpbmcgPSBcIi8qIyBcIi5jb25jYXQoZGF0YSwgXCIgKi9cIik7XG4gICAgdmFyIHNvdXJjZVVSTHMgPSBjc3NNYXBwaW5nLnNvdXJjZXMubWFwKGZ1bmN0aW9uIChzb3VyY2UpIHtcbiAgICAgIHJldHVybiBcIi8qIyBzb3VyY2VVUkw9XCIuY29uY2F0KGNzc01hcHBpbmcuc291cmNlUm9vdCB8fCAnJykuY29uY2F0KHNvdXJjZSwgXCIgKi9cIik7XG4gICAgfSk7XG4gICAgcmV0dXJuIFtjb250ZW50XS5jb25jYXQoc291cmNlVVJMcykuY29uY2F0KFtzb3VyY2VNYXBwaW5nXSkuam9pbignXFxuJyk7XG4gIH1cblxuICByZXR1cm4gW2NvbnRlbnRdLmpvaW4oJ1xcbicpO1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAodXJsLCBvcHRpb25zKSB7XG4gIGlmICghb3B0aW9ucykge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICAgIG9wdGlvbnMgPSB7fTtcbiAgfSAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZXJzY29yZS1kYW5nbGUsIG5vLXBhcmFtLXJlYXNzaWduXG5cblxuICB1cmwgPSB1cmwgJiYgdXJsLl9fZXNNb2R1bGUgPyB1cmwuZGVmYXVsdCA6IHVybDtcblxuICBpZiAodHlwZW9mIHVybCAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gdXJsO1xuICB9IC8vIElmIHVybCBpcyBhbHJlYWR5IHdyYXBwZWQgaW4gcXVvdGVzLCByZW1vdmUgdGhlbVxuXG5cbiAgaWYgKC9eWydcIl0uKlsnXCJdJC8udGVzdCh1cmwpKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gICAgdXJsID0gdXJsLnNsaWNlKDEsIC0xKTtcbiAgfVxuXG4gIGlmIChvcHRpb25zLmhhc2gpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgICB1cmwgKz0gb3B0aW9ucy5oYXNoO1xuICB9IC8vIFNob3VsZCB1cmwgYmUgd3JhcHBlZD9cbiAgLy8gU2VlIGh0dHBzOi8vZHJhZnRzLmNzc3dnLm9yZy9jc3MtdmFsdWVzLTMvI3VybHNcblxuXG4gIGlmICgvW1wiJygpIFxcdFxcbl0vLnRlc3QodXJsKSB8fCBvcHRpb25zLm5lZWRRdW90ZXMpIHtcbiAgICByZXR1cm4gXCJcXFwiXCIuY29uY2F0KHVybC5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJykucmVwbGFjZSgvXFxuL2csICdcXFxcbicpLCBcIlxcXCJcIik7XG4gIH1cblxuICByZXR1cm4gdXJsO1xufTsiLCJleHBvcnQgZGVmYXVsdCBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiYWQ0NWM3YTQ5NDU1YWQ2ZGQyMTUxMTE3MDhhOTcwZGMuanBnXCI7IiwiZXhwb3J0IGRlZmF1bHQgX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcImM4OWEwMzA1YzZlYmZmMzg1ODg3OGRmNjEzNjg3NjdhLnN2Z1wiOyIsImltcG9ydCBhcGkgZnJvbSBcIiEuLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanNcIjtcbiAgICAgICAgICAgIGltcG9ydCBjb250ZW50IGZyb20gXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vc3R5bGUuY3NzXCI7XG5cbnZhciBvcHRpb25zID0ge307XG5cbm9wdGlvbnMuaW5zZXJ0ID0gXCJoZWFkXCI7XG5vcHRpb25zLnNpbmdsZXRvbiA9IGZhbHNlO1xuXG52YXIgdXBkYXRlID0gYXBpKGNvbnRlbnQsIG9wdGlvbnMpO1xuXG5cblxuZXhwb3J0IGRlZmF1bHQgY29udGVudC5sb2NhbHMgfHwge307IiwiaW1wb3J0IGFwaSBmcm9tIFwiIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qc1wiO1xuICAgICAgICAgICAgaW1wb3J0IGNvbnRlbnQgZnJvbSBcIiEhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi9tYW5hLmNzc1wiO1xuXG52YXIgb3B0aW9ucyA9IHt9O1xuXG5vcHRpb25zLmluc2VydCA9IFwiaGVhZFwiO1xub3B0aW9ucy5zaW5nbGV0b24gPSBmYWxzZTtcblxudmFyIHVwZGF0ZSA9IGFwaShjb250ZW50LCBvcHRpb25zKTtcblxuXG5cbmV4cG9ydCBkZWZhdWx0IGNvbnRlbnQubG9jYWxzIHx8IHt9OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgaXNPbGRJRSA9IGZ1bmN0aW9uIGlzT2xkSUUoKSB7XG4gIHZhciBtZW1vO1xuICByZXR1cm4gZnVuY3Rpb24gbWVtb3JpemUoKSB7XG4gICAgaWYgKHR5cGVvZiBtZW1vID09PSAndW5kZWZpbmVkJykge1xuICAgICAgLy8gVGVzdCBmb3IgSUUgPD0gOSBhcyBwcm9wb3NlZCBieSBCcm93c2VyaGFja3NcbiAgICAgIC8vIEBzZWUgaHR0cDovL2Jyb3dzZXJoYWNrcy5jb20vI2hhY2stZTcxZDg2OTJmNjUzMzQxNzNmZWU3MTVjMjIyY2I4MDVcbiAgICAgIC8vIFRlc3RzIGZvciBleGlzdGVuY2Ugb2Ygc3RhbmRhcmQgZ2xvYmFscyBpcyB0byBhbGxvdyBzdHlsZS1sb2FkZXJcbiAgICAgIC8vIHRvIG9wZXJhdGUgY29ycmVjdGx5IGludG8gbm9uLXN0YW5kYXJkIGVudmlyb25tZW50c1xuICAgICAgLy8gQHNlZSBodHRwczovL2dpdGh1Yi5jb20vd2VicGFjay1jb250cmliL3N0eWxlLWxvYWRlci9pc3N1ZXMvMTc3XG4gICAgICBtZW1vID0gQm9vbGVhbih3aW5kb3cgJiYgZG9jdW1lbnQgJiYgZG9jdW1lbnQuYWxsICYmICF3aW5kb3cuYXRvYik7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1lbW87XG4gIH07XG59KCk7XG5cbnZhciBnZXRUYXJnZXQgPSBmdW5jdGlvbiBnZXRUYXJnZXQoKSB7XG4gIHZhciBtZW1vID0ge307XG4gIHJldHVybiBmdW5jdGlvbiBtZW1vcml6ZSh0YXJnZXQpIHtcbiAgICBpZiAodHlwZW9mIG1lbW9bdGFyZ2V0XSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHZhciBzdHlsZVRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyZ2V0KTsgLy8gU3BlY2lhbCBjYXNlIHRvIHJldHVybiBoZWFkIG9mIGlmcmFtZSBpbnN0ZWFkIG9mIGlmcmFtZSBpdHNlbGZcblxuICAgICAgaWYgKHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCAmJiBzdHlsZVRhcmdldCBpbnN0YW5jZW9mIHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIC8vIFRoaXMgd2lsbCB0aHJvdyBhbiBleGNlcHRpb24gaWYgYWNjZXNzIHRvIGlmcmFtZSBpcyBibG9ja2VkXG4gICAgICAgICAgLy8gZHVlIHRvIGNyb3NzLW9yaWdpbiByZXN0cmljdGlvbnNcbiAgICAgICAgICBzdHlsZVRhcmdldCA9IHN0eWxlVGFyZ2V0LmNvbnRlbnREb2N1bWVudC5oZWFkO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgLy8gaXN0YW5idWwgaWdub3JlIG5leHRcbiAgICAgICAgICBzdHlsZVRhcmdldCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbWVtb1t0YXJnZXRdID0gc3R5bGVUYXJnZXQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1lbW9bdGFyZ2V0XTtcbiAgfTtcbn0oKTtcblxudmFyIHN0eWxlc0luRG9tID0gW107XG5cbmZ1bmN0aW9uIGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpIHtcbiAgdmFyIHJlc3VsdCA9IC0xO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3R5bGVzSW5Eb20ubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoc3R5bGVzSW5Eb21baV0uaWRlbnRpZmllciA9PT0gaWRlbnRpZmllcikge1xuICAgICAgcmVzdWx0ID0gaTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIG1vZHVsZXNUb0RvbShsaXN0LCBvcHRpb25zKSB7XG4gIHZhciBpZENvdW50TWFwID0ge307XG4gIHZhciBpZGVudGlmaWVycyA9IFtdO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gbGlzdFtpXTtcbiAgICB2YXIgaWQgPSBvcHRpb25zLmJhc2UgPyBpdGVtWzBdICsgb3B0aW9ucy5iYXNlIDogaXRlbVswXTtcbiAgICB2YXIgY291bnQgPSBpZENvdW50TWFwW2lkXSB8fCAwO1xuICAgIHZhciBpZGVudGlmaWVyID0gXCJcIi5jb25jYXQoaWQsIFwiIFwiKS5jb25jYXQoY291bnQpO1xuICAgIGlkQ291bnRNYXBbaWRdID0gY291bnQgKyAxO1xuICAgIHZhciBpbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgIHZhciBvYmogPSB7XG4gICAgICBjc3M6IGl0ZW1bMV0sXG4gICAgICBtZWRpYTogaXRlbVsyXSxcbiAgICAgIHNvdXJjZU1hcDogaXRlbVszXVxuICAgIH07XG5cbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICBzdHlsZXNJbkRvbVtpbmRleF0ucmVmZXJlbmNlcysrO1xuICAgICAgc3R5bGVzSW5Eb21baW5kZXhdLnVwZGF0ZXIob2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3R5bGVzSW5Eb20ucHVzaCh7XG4gICAgICAgIGlkZW50aWZpZXI6IGlkZW50aWZpZXIsXG4gICAgICAgIHVwZGF0ZXI6IGFkZFN0eWxlKG9iaiwgb3B0aW9ucyksXG4gICAgICAgIHJlZmVyZW5jZXM6IDFcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlkZW50aWZpZXJzLnB1c2goaWRlbnRpZmllcik7XG4gIH1cblxuICByZXR1cm4gaWRlbnRpZmllcnM7XG59XG5cbmZ1bmN0aW9uIGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKSB7XG4gIHZhciBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gIHZhciBhdHRyaWJ1dGVzID0gb3B0aW9ucy5hdHRyaWJ1dGVzIHx8IHt9O1xuXG4gIGlmICh0eXBlb2YgYXR0cmlidXRlcy5ub25jZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICB2YXIgbm9uY2UgPSB0eXBlb2YgX193ZWJwYWNrX25vbmNlX18gIT09ICd1bmRlZmluZWQnID8gX193ZWJwYWNrX25vbmNlX18gOiBudWxsO1xuXG4gICAgaWYgKG5vbmNlKSB7XG4gICAgICBhdHRyaWJ1dGVzLm5vbmNlID0gbm9uY2U7XG4gICAgfVxuICB9XG5cbiAgT2JqZWN0LmtleXMoYXR0cmlidXRlcykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgc3R5bGUuc2V0QXR0cmlidXRlKGtleSwgYXR0cmlidXRlc1trZXldKTtcbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBvcHRpb25zLmluc2VydCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIG9wdGlvbnMuaW5zZXJ0KHN0eWxlKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgdGFyZ2V0ID0gZ2V0VGFyZ2V0KG9wdGlvbnMuaW5zZXJ0IHx8ICdoZWFkJyk7XG5cbiAgICBpZiAoIXRhcmdldCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ291bGRuJ3QgZmluZCBhIHN0eWxlIHRhcmdldC4gVGhpcyBwcm9iYWJseSBtZWFucyB0aGF0IHRoZSB2YWx1ZSBmb3IgdGhlICdpbnNlcnQnIHBhcmFtZXRlciBpcyBpbnZhbGlkLlwiKTtcbiAgICB9XG5cbiAgICB0YXJnZXQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xuICB9XG5cbiAgcmV0dXJuIHN0eWxlO1xufVxuXG5mdW5jdGlvbiByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGUpIHtcbiAgLy8gaXN0YW5idWwgaWdub3JlIGlmXG4gIGlmIChzdHlsZS5wYXJlbnROb2RlID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgc3R5bGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzdHlsZSk7XG59XG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cblxuXG52YXIgcmVwbGFjZVRleHQgPSBmdW5jdGlvbiByZXBsYWNlVGV4dCgpIHtcbiAgdmFyIHRleHRTdG9yZSA9IFtdO1xuICByZXR1cm4gZnVuY3Rpb24gcmVwbGFjZShpbmRleCwgcmVwbGFjZW1lbnQpIHtcbiAgICB0ZXh0U3RvcmVbaW5kZXhdID0gcmVwbGFjZW1lbnQ7XG4gICAgcmV0dXJuIHRleHRTdG9yZS5maWx0ZXIoQm9vbGVhbikuam9pbignXFxuJyk7XG4gIH07XG59KCk7XG5cbmZ1bmN0aW9uIGFwcGx5VG9TaW5nbGV0b25UYWcoc3R5bGUsIGluZGV4LCByZW1vdmUsIG9iaikge1xuICB2YXIgY3NzID0gcmVtb3ZlID8gJycgOiBvYmoubWVkaWEgPyBcIkBtZWRpYSBcIi5jb25jYXQob2JqLm1lZGlhLCBcIiB7XCIpLmNvbmNhdChvYmouY3NzLCBcIn1cIikgOiBvYmouY3NzOyAvLyBGb3Igb2xkIElFXG5cbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICAqL1xuXG4gIGlmIChzdHlsZS5zdHlsZVNoZWV0KSB7XG4gICAgc3R5bGUuc3R5bGVTaGVldC5jc3NUZXh0ID0gcmVwbGFjZVRleHQoaW5kZXgsIGNzcyk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGNzc05vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpO1xuICAgIHZhciBjaGlsZE5vZGVzID0gc3R5bGUuY2hpbGROb2RlcztcblxuICAgIGlmIChjaGlsZE5vZGVzW2luZGV4XSkge1xuICAgICAgc3R5bGUucmVtb3ZlQ2hpbGQoY2hpbGROb2Rlc1tpbmRleF0pO1xuICAgIH1cblxuICAgIGlmIChjaGlsZE5vZGVzLmxlbmd0aCkge1xuICAgICAgc3R5bGUuaW5zZXJ0QmVmb3JlKGNzc05vZGUsIGNoaWxkTm9kZXNbaW5kZXhdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3R5bGUuYXBwZW5kQ2hpbGQoY3NzTm9kZSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGFwcGx5VG9UYWcoc3R5bGUsIG9wdGlvbnMsIG9iaikge1xuICB2YXIgY3NzID0gb2JqLmNzcztcbiAgdmFyIG1lZGlhID0gb2JqLm1lZGlhO1xuICB2YXIgc291cmNlTWFwID0gb2JqLnNvdXJjZU1hcDtcblxuICBpZiAobWVkaWEpIHtcbiAgICBzdHlsZS5zZXRBdHRyaWJ1dGUoJ21lZGlhJywgbWVkaWEpO1xuICB9IGVsc2Uge1xuICAgIHN0eWxlLnJlbW92ZUF0dHJpYnV0ZSgnbWVkaWEnKTtcbiAgfVxuXG4gIGlmIChzb3VyY2VNYXAgJiYgdHlwZW9mIGJ0b2EgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgY3NzICs9IFwiXFxuLyojIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxcIi5jb25jYXQoYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoc291cmNlTWFwKSkpKSwgXCIgKi9cIik7XG4gIH0gLy8gRm9yIG9sZCBJRVxuXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAgKi9cblxuXG4gIGlmIChzdHlsZS5zdHlsZVNoZWV0KSB7XG4gICAgc3R5bGUuc3R5bGVTaGVldC5jc3NUZXh0ID0gY3NzO1xuICB9IGVsc2Uge1xuICAgIHdoaWxlIChzdHlsZS5maXJzdENoaWxkKSB7XG4gICAgICBzdHlsZS5yZW1vdmVDaGlsZChzdHlsZS5maXJzdENoaWxkKTtcbiAgICB9XG5cbiAgICBzdHlsZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcbiAgfVxufVxuXG52YXIgc2luZ2xldG9uID0gbnVsbDtcbnZhciBzaW5nbGV0b25Db3VudGVyID0gMDtcblxuZnVuY3Rpb24gYWRkU3R5bGUob2JqLCBvcHRpb25zKSB7XG4gIHZhciBzdHlsZTtcbiAgdmFyIHVwZGF0ZTtcbiAgdmFyIHJlbW92ZTtcblxuICBpZiAob3B0aW9ucy5zaW5nbGV0b24pIHtcbiAgICB2YXIgc3R5bGVJbmRleCA9IHNpbmdsZXRvbkNvdW50ZXIrKztcbiAgICBzdHlsZSA9IHNpbmdsZXRvbiB8fCAoc2luZ2xldG9uID0gaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpKTtcbiAgICB1cGRhdGUgPSBhcHBseVRvU2luZ2xldG9uVGFnLmJpbmQobnVsbCwgc3R5bGUsIHN0eWxlSW5kZXgsIGZhbHNlKTtcbiAgICByZW1vdmUgPSBhcHBseVRvU2luZ2xldG9uVGFnLmJpbmQobnVsbCwgc3R5bGUsIHN0eWxlSW5kZXgsIHRydWUpO1xuICB9IGVsc2Uge1xuICAgIHN0eWxlID0gaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpO1xuICAgIHVwZGF0ZSA9IGFwcGx5VG9UYWcuYmluZChudWxsLCBzdHlsZSwgb3B0aW9ucyk7XG5cbiAgICByZW1vdmUgPSBmdW5jdGlvbiByZW1vdmUoKSB7XG4gICAgICByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGUpO1xuICAgIH07XG4gIH1cblxuICB1cGRhdGUob2JqKTtcbiAgcmV0dXJuIGZ1bmN0aW9uIHVwZGF0ZVN0eWxlKG5ld09iaikge1xuICAgIGlmIChuZXdPYmopIHtcbiAgICAgIGlmIChuZXdPYmouY3NzID09PSBvYmouY3NzICYmIG5ld09iai5tZWRpYSA9PT0gb2JqLm1lZGlhICYmIG5ld09iai5zb3VyY2VNYXAgPT09IG9iai5zb3VyY2VNYXApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB1cGRhdGUob2JqID0gbmV3T2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVtb3ZlKCk7XG4gICAgfVxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChsaXN0LCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9OyAvLyBGb3JjZSBzaW5nbGUtdGFnIHNvbHV0aW9uIG9uIElFNi05LCB3aGljaCBoYXMgYSBoYXJkIGxpbWl0IG9uIHRoZSAjIG9mIDxzdHlsZT5cbiAgLy8gdGFncyBpdCB3aWxsIGFsbG93IG9uIGEgcGFnZVxuXG4gIGlmICghb3B0aW9ucy5zaW5nbGV0b24gJiYgdHlwZW9mIG9wdGlvbnMuc2luZ2xldG9uICE9PSAnYm9vbGVhbicpIHtcbiAgICBvcHRpb25zLnNpbmdsZXRvbiA9IGlzT2xkSUUoKTtcbiAgfVxuXG4gIGxpc3QgPSBsaXN0IHx8IFtdO1xuICB2YXIgbGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKGxpc3QsIG9wdGlvbnMpO1xuICByZXR1cm4gZnVuY3Rpb24gdXBkYXRlKG5ld0xpc3QpIHtcbiAgICBuZXdMaXN0ID0gbmV3TGlzdCB8fCBbXTtcblxuICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobmV3TGlzdCkgIT09ICdbb2JqZWN0IEFycmF5XScpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxhc3RJZGVudGlmaWVycy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGlkZW50aWZpZXIgPSBsYXN0SWRlbnRpZmllcnNbaV07XG4gICAgICB2YXIgaW5kZXggPSBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgICAgIHN0eWxlc0luRG9tW2luZGV4XS5yZWZlcmVuY2VzLS07XG4gICAgfVxuXG4gICAgdmFyIG5ld0xhc3RJZGVudGlmaWVycyA9IG1vZHVsZXNUb0RvbShuZXdMaXN0LCBvcHRpb25zKTtcblxuICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICB2YXIgX2lkZW50aWZpZXIgPSBsYXN0SWRlbnRpZmllcnNbX2ldO1xuXG4gICAgICB2YXIgX2luZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoX2lkZW50aWZpZXIpO1xuXG4gICAgICBpZiAoc3R5bGVzSW5Eb21bX2luZGV4XS5yZWZlcmVuY2VzID09PSAwKSB7XG4gICAgICAgIHN0eWxlc0luRG9tW19pbmRleF0udXBkYXRlcigpO1xuXG4gICAgICAgIHN0eWxlc0luRG9tLnNwbGljZShfaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxhc3RJZGVudGlmaWVycyA9IG5ld0xhc3RJZGVudGlmaWVycztcbiAgfTtcbn07IiwiaW1wb3J0ICcuLi9jc3Mvc3R5bGUuY3NzJztcbmltcG9ydCAnLi4vY3NzL3ZlbmRvci9tYW5hLmNzcyc7XG5pbXBvcnQgU2VhcmNoIGZyb20gJy4vbW9kZWxzL1NlYXJjaCc7XG5pbXBvcnQgKiBhcyBzZWFyY2hWaWV3IGZyb20gJy4vdmlld3Mvc2VhcmNoVmlldyc7XG5pbXBvcnQgKiBhcyByZXN1bHRzVmlldyBmcm9tICcuL3ZpZXdzL3Jlc3VsdHNWaWV3JztcbmltcG9ydCAqIGFzIGNhcmRWaWV3IGZyb20gJy4vdmlld3MvY2FyZFZpZXcnO1xuaW1wb3J0IHsgZWxlbWVudHMgfSBmcm9tICcuL3ZpZXdzL2Jhc2UnO1xuXG5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqIFF1aWNrIFNlYXJjaCAqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbmVsZW1lbnRzLm5hdi5xdWlja1NlYXJjaEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICBjb25zdCBzZWFyY2ggPSBuZXcgU2VhcmNoKCk7XG5cbiAgICBpZiAoZWxlbWVudHMubmF2LnNlYXJjaElucHV0LnZhbHVlICE9PSAnJykge1xuICAgICAgICBjb25zdCBxdWVyeSA9IHNlYXJjaC5xdWlja1NlYXJjaCgpO1xuICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGAvcmVzdWx0cy9saXN0LyR7cXVlcnl9Jm9yZGVyPW5hbWVgXG4gICAgfVxufSlcblxuXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKiBTZWFyY2ggUGFnZSAqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG5pZiAod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lID09PSAnL3NlYXJjaCcpIHtcbiAgICBjb25zdCBzZWFyY2ggPSBuZXcgU2VhcmNoKCk7XG5cbiAgICAvLyBFdmVudCBsaXN0ZW5lciBmb3IgdGhlIHN1Ym1pdCBzZWFyY2ggYnV0dG9uLiBUaGlzIGdvZXMgdGhyb3VnaCB0aGUgZm9ybSBhbmQgZ2VuZXJhdGVzXG4gICAgLy8gdGhlIHF1amVyeSBzdHJpbmcuIEl0IHRoZW4gcGFzc2VzIHRoZSBzdHJpbmcgdG8gdGhlIHNlcnZlciB0aHJvdWdoIHRoZSBVUkxcbiAgICBlbGVtZW50cy5hcGlTZWFyY2guc3VibWl0QnRuLm9uY2xpY2sgPSBhc3luYyBlID0+IHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAgICAgLy8gQ2xlYXIgYW55IGV4aXN0aW5nIHF1ZXJ5IHN0cmluZ1xuICAgICAgICBzZWFyY2gucmVzZXRTZWFyY2hRdWVyeSgpO1xuICAgIFxuICAgICAgICAvLyBCdWlsZCB0aGUgcXVlcnkgc3RyaW5nXG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gc2VhcmNoLmJ1aWxkU2VhcmNoUXVlcnkoKTtcblxuICAgICAgICAvLyBHZXQgdGhlIGRpc3BsYXkgbWV0aG9kXG4gICAgICAgIGNvbnN0IGRpc3BsYXlNZXRob2QgPSBzZWFyY2guZGlzcGxheU1ldGhvZCgpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBhIGdldCByZXF1ZXN0IHdpdGggdGhlIHF1ZXJ5IHN0cmluZ1xuICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGAvcmVzdWx0cy8ke2Rpc3BsYXlNZXRob2R9LyR7cXVlcnl9YDtcbiAgICBcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVMaW5lLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAvLyBEaXNwbGF5IHRoZSBkcm9wZG93blxuICAgICAgICBzZWFyY2hWaWV3LnNob3dUeXBlc0Ryb3BEb3duKCk7XG4gICAgICAgIHNlYXJjaFZpZXcuc3RhcnRUeXBlc0Ryb3BEb3duTmF2aWdhdGlvbigpO1xuXG4gICAgICAgIC8vIFN0YXJ0IGFuIGV2ZW50IGxpc3RlbmVyIG9uIHRoZSBkb2N1bWVudC4gVGhpcyB3aWxsIGNsb3NlIHRoZSBkcm9wZG93biBpZiB0aGUgdXNlciBjbGlja3NcbiAgICAgICAgLy8gb3V0c2lkZSBvZiB0aGUgaW5wdXQgb3IgZHJvcGRvd24uIFRoaXMgd2lsbCBhbHNvIGNhbmNlbCB0aGUgZXZlbnQgbGlzdGVuZXJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzZWFyY2hWaWV3LnR5cGVMaW5lTGlzdGVuZXIpXG4gICAgfSlcblxuICAgIGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlTGluZS5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsICgpID0+IHtcbiAgICAgICAgaWYgKGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlRHJvcERvd24uaGFzQXR0cmlidXRlKCdoaWRkZW4nKSkge1xuICAgICAgICAgICAgc2VhcmNoVmlldy5zaG93VHlwZXNEcm9wRG93bigpO1xuICAgICAgICB9XG5cbiAgICAgICAgc2VhcmNoVmlldy5maWx0ZXJUeXBlcyhlbGVtZW50cy5hcGlTZWFyY2gudHlwZUxpbmUudmFsdWUpO1xuICAgICAgICBzZWFyY2hWaWV3LmZpbHRlclR5cGVIZWFkZXJzKCk7XG4gICAgICAgIHNlYXJjaFZpZXcuc3RhcnRUeXBlc0Ryb3BEb3duTmF2aWdhdGlvbigpO1xuICAgIH0pXG5cbiAgICBlbGVtZW50cy5hcGlTZWFyY2guc2V0SW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIC8vIERpc3BsYXkgdGhlIGRyb3Bkb3duXG4gICAgICAgIHNlYXJjaFZpZXcuc2hvd1NldHNEcm9wRG93bigpO1xuICAgICAgICBzZWFyY2hWaWV3LnN0YXJ0U2V0c0Ryb3BEb3duTmF2aWdhdGlvbigpO1xuXG4gICAgICAgIC8vIFN0YXJ0IGFuIGV2ZW50IGxpc3RlbmVyIG9uIHRoZSBkb2N1bWVudC4gVGhpcyB3aWxsIGNsb3NlIHRoZSBkcm9wZG93biBpZiB0aGUgdXNlciBjbGlja3NcbiAgICAgICAgLy8gb3V0c2lkZSBvZiB0aGUgaW5wdXQgb3IgZHJvcGRvd24uIFRoaXMgd2lsbCBhbHNvIGNhbmNlbCB0aGUgZXZlbnQgbGlzdGVuZXJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzZWFyY2hWaWV3LnNldElucHV0TGlzdGVuZXIpXG4gICAgfSlcblxuICAgIGVsZW1lbnRzLmFwaVNlYXJjaC5zZXRJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsICgpID0+IHtcbiAgICAgICAgaWYgKGVsZW1lbnRzLmFwaVNlYXJjaC5zZXREcm9wRG93bi5oYXNBdHRyaWJ1dGUoJ2hpZGRlbicpKSB7XG4gICAgICAgICAgICBzZWFyY2hWaWV3LnNob3dTZXRzRHJvcERvd24oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNlYXJjaFZpZXcuZmlsdGVyU2V0cyhlbGVtZW50cy5hcGlTZWFyY2guc2V0SW5wdXQudmFsdWUpO1xuICAgICAgICBzZWFyY2hWaWV3LmZpbHRlclNldEhlYWRlcnMoKTsgICAgICAgIFxuICAgICAgICBzZWFyY2hWaWV3LnN0YXJ0U2V0c0Ryb3BEb3duTmF2aWdhdGlvbigpO1xuICAgIH0pXG5cbiAgICBlbGVtZW50cy5hcGlTZWFyY2guc3RhdFZhbHVlLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgICdpbnB1dCcsIHNlYXJjaFZpZXcuc3RhdExpbmVDb250cm9sbGVyXG4gICAgKTtcblxuICAgIGVsZW1lbnRzLmFwaVNlYXJjaC5mb3JtYXQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgJ2NoYW5nZScsIHNlYXJjaFZpZXcuZm9ybWF0TGluZUNvbnRyb2xsZXJcbiAgICApO1xuXG5cbn0gXG5cbiBcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqIFJlc3VsdHMgUGFnZSAqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbmlmICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3Vic3RyaW5nKDEsIDgpID09PSAncmVzdWx0cycpIHtcbiAgICBjb25zdCBzdGF0ZSA9IHtcbiAgICAgICAgc2VhcmNoOiBuZXcgU2VhcmNoKCksXG5cbiAgICAgICAgLy8gR2V0IHRoZSBkaXNwbGF5IG1ldGhvZCwgc29ydCBtZXRob2QsIGFuZCBxdWVyeSBmcm9tIHRoZSBVUkxcbiAgICAgICAgZGlzcGxheTogd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnN1YnN0cmluZyg5LCB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUubGFzdEluZGV4T2YoJy8nKSksXG4gICAgICAgIHF1ZXJ5OiB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3Vic3RyaW5nKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5sYXN0SW5kZXhPZignLycpICsgMSksXG4gICAgICAgIHNvcnRNZXRob2Q6IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zdWJzdHJpbmcod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLmxhc3RJbmRleE9mKCc9JykgKyAxKSxcblxuICAgICAgICBhbGxDYXJkczogW10sXG4gICAgICAgIGN1cnJlbnRJbmRleDogMCxcbiAgICAgICAgYWxsUmVzdWx0c0xvYWRlZDogZmFsc2UsXG4gICAgfTtcblxuICAgIC8vIFdoZW4gdGhlIHJlc3VsdHMgcGFnZSBpcyByZWZyZXNoZWQsIGRpc3BsYXkgdGhlIGNhcmRzIGFzIGEgY2hlY2tsaXN0IGJ5IGRlZmF1bHRcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICAvLyBVcGRhdGUgdGhlIHNvcnQgYnkgYW5kIGRpc3BsYXkgYXNkIG1lbnVzIHNvIHRoZSBzZWxlY3RlZCBvcHRpb24gaXMgd2hhdCB0aGUgdXNlciBzZWxlY3RlZFxuICAgICAgICByZXN1bHRzVmlldy5jaG9zZVNlbGVjdE1lbnVTb3J0KGVsZW1lbnRzLnJlc3VsdHNQYWdlLnNvcnRCeS5vcHRpb25zLCBzdGF0ZSk7XG4gICAgICAgIHJlc3VsdHNWaWV3LmNob3NlU2VsZWN0TWVudURpc3BsYXkoZWxlbWVudHMucmVzdWx0c1BhZ2UuZGlzcGxheVNlbGVjdG9yLCBzdGF0ZSlcblxuICAgICAgICAvLyBSdW4gdGhlIGdldCBjYXJkcyBmdW5jdGlvbiwgdGhlbiB1cGRhdGUgdGhlIGRpc3BsYXkgYmFyIHdpdGggdGhlIHRvdGFsIGNhcmQgY291bnRcbiAgICAgICAgYXdhaXQgc3RhdGUuc2VhcmNoLmdldENhcmRzKHN0YXRlKTtcblxuICAgICAgICBpZiAoc3RhdGUuYWxsQ2FyZHNbMF0gPT09IDQwNCkge1xuICAgICAgICAgICAgcmVzdWx0c1ZpZXcuZGlzcGxheTQwNCgpO1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICByZXN1bHRzVmlldy51cGRhdGVEaXNwbGF5QmFyKHN0YXRlKTtcblxuICAgICAgICAvLyBJbiB0aGUgYmFja2dyb3VuZCwgZ2V0IGFsbCBjYXJkcyBcbiAgICAgICAgc3RhdGUuc2VhcmNoLmdldEFsbENhcmRzKHN0YXRlLCByZXN1bHRzVmlldy5lbmFibGVCdG4pO1xuXG4gICAgICAgIC8vIE9uIGxvYWRpbmcgdGhlIHBhZ2UgZGlzcGxheSB0aGUgY2FyZHMgaW4gYSBjaGVja2xpc3RcbiAgICAgICAgcmVzdWx0c1ZpZXcudXBkYXRlRGlzcGxheShzdGF0ZSk7XG4gICAgfSk7XG5cbiAgICAvLyBFdmVudCBsaXN0ZW5lciBmb3IgdGhlIGNoYW5nZSBkaXNwbGF5IG1ldGhvZCBidXR0b25cbiAgICBlbGVtZW50cy5yZXN1bHRzUGFnZS5idG4ub25jbGljayA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgLy8gVXBkYXRlIHRoZSBkaXNwbGF5IG1ldGhvZCBiZXR3ZWVuIGNoZWNrbGlzdCBhbmQgY2FyZHMgaWYgdGhlIHVzZXIgY2hhbmdlZCBpdFxuICAgICAgICByZXN1bHRzVmlldy5jaGFuZ2VEaXNwbGF5QW5kVXJsKHN0YXRlKTtcblxuICAgICAgICAvLyBJZiBhIG5ldyBzb3J0aW5nIG1ldGhvZCBpcyBzZWxlY3RlZCwgYSByZXF1ZXN0IGlzIHNlbnQgdG8gdGhlIHNlcnZlciBhbmQgdGhlIHBhZ2UgaXMgcmVmcmVzaGVkLlxuICAgICAgICAvLyBUaGlzIHJlc2V0cyB0aGUgc3RhdGUgYW5kIGFzeW5jIHRhc2tzXG4gICAgICAgIHJlc3VsdHNWaWV3LmNoYW5nZVNvcnRNZXRob2Qoc3RhdGUpO1xuICAgICAgICBcbiAgICAgICAgLy8gVXBkYXRlIHRoZSBkaXNwbGF5IHdpdGggYSBuZXcgc29ydCBtZXRob2QgYW5kIGRpc3BsYXkgbWV0aG9kIGlmIGVpdGhlciB3ZXJlIGdpdmVuXG4gICAgICAgIHJlc3VsdHNWaWV3LnVwZGF0ZURpc3BsYXkoc3RhdGUpO1xuICAgIH07XG5cbiAgICAvLyBFdmVudCBMaXN0ZW5lciBmb3IgbmV4dCBwYWdlIGJ1dHRvblxuICAgIGVsZW1lbnRzLnJlc3VsdHNQYWdlLm5leHRQYWdlQnRuLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgaW5kZXhcbiAgICAgICAgc3RhdGUuY3VycmVudEluZGV4ICsrO1xuICAgICAgICBcbiAgICAgICAgLy8gVXBkYXRlIHRoZSBkaXNwbGF5IGJhc2VkIG9uIHRoZSBtZXRob2Qgc3RvcmVkIGluIHRoZSBzdGF0ZVxuICAgICAgICByZXN1bHRzVmlldy51cGRhdGVEaXNwbGF5KHN0YXRlKTtcblxuICAgICAgICAvLyBVcGRhdGUgdGhlIGRpc3BsYXkgYmFyXG4gICAgICAgIHJlc3VsdHNWaWV3LnVwZGF0ZURpc3BsYXlCYXIoc3RhdGUpO1xuXG4gICAgICAgIC8vIEVuYWJsZSB0aGUgcHJldmlvdXMgcGFnZSBhbmQgZmlyc3QgcGFnZSBidG5zXG4gICAgICAgIHJlc3VsdHNWaWV3LmVuYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5wcmV2aW91c1BhZ2VCdG4pO1xuICAgICAgICByZXN1bHRzVmlldy5lbmFibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UuZmlyc3RQYWdlQnRuKTtcblxuICAgICAgICAvLyBJZiBvbiB0aGUgbGFzdCBwYWdlLCBkaXNhYmxlIHRoZSBuZXh0IHBhZ2UgYnRuIGFuZCBsYXN0IHBhZ2UgYnRuXG4gICAgICAgIGlmIChzdGF0ZS5jdXJyZW50SW5kZXggPT09IChzdGF0ZS5hbGxDYXJkcy5sZW5ndGggLSAxKSkge1xuICAgICAgICAgICAgcmVzdWx0c1ZpZXcuZGlzYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5uZXh0UGFnZUJ0bik7XG4gICAgICAgICAgICByZXN1bHRzVmlldy5kaXNhYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLmxhc3RQYWdlQnRuKVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIEV2ZW50IGxpc3RlbmVyIGZvciB0aGUgbGFzdCBwYWdlIGJ0blxuICAgIGVsZW1lbnRzLnJlc3VsdHNQYWdlLmxhc3RQYWdlQnRuLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgaW5kZXhcbiAgICAgICAgc3RhdGUuY3VycmVudEluZGV4ID0gc3RhdGUuYWxsQ2FyZHMubGVuZ3RoIC0gMTtcblxuICAgICAgICAvLyBVcGRhdGUgdGhlIGRpc3BsYXkgYmFzZWQgb24gdGhlIG1ldGhvZCBzdG9yZWQgaW4gdGhlIHN0YXRlXG4gICAgICAgIHJlc3VsdHNWaWV3LnVwZGF0ZURpc3BsYXkoc3RhdGUpO1xuXG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgZGlzcGxheSBiYXJcbiAgICAgICAgcmVzdWx0c1ZpZXcudXBkYXRlRGlzcGxheUJhcihzdGF0ZSk7XG5cbiAgICAgICAgLy8gRGlzYWJsZSB0aGUgbmV4dCBhbmQgbGFzdCBwYWdlIGJ1dHRvbnNcbiAgICAgICAgcmVzdWx0c1ZpZXcuZGlzYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5uZXh0UGFnZUJ0bik7XG4gICAgICAgIHJlc3VsdHNWaWV3LmRpc2FibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UubGFzdFBhZ2VCdG4pO1xuXG4gICAgICAgIC8vIEVuYWJsZSB0aGUgcHJldmlvdXMgYW5kIGZpcnN0IHBhZ2UgYnV0dG9uc1xuICAgICAgICByZXN1bHRzVmlldy5lbmFibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UucHJldmlvdXNQYWdlQnRuKTtcbiAgICAgICAgcmVzdWx0c1ZpZXcuZW5hYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLmZpcnN0UGFnZUJ0bik7XG4gICAgfTtcblxuICAgIC8vIEV2ZW50IGxpc3RlbmVyIGZvciB0aGUgcHJldmlvdXMgcGFnZSBidXR0b25cbiAgICBlbGVtZW50cy5yZXN1bHRzUGFnZS5wcmV2aW91c1BhZ2VCdG4ub25jbGljayA9ICgpID0+IHtcbiAgICAgICAgLy8gVXBkYXRlIHRoZSBpbmRleFxuICAgICAgICBzdGF0ZS5jdXJyZW50SW5kZXggLS07XG5cbiAgICAgICAgLy8gVXBkYXRlIHRoZSBkaXNwbGF5IGJhc2VkIG9uIHRoZSBtZXRob2Qgc3RvcmVkIGluIHRoZSBzdGF0ZVxuICAgICAgICByZXN1bHRzVmlldy51cGRhdGVEaXNwbGF5KHN0YXRlKTtcblxuICAgICAgICAvLyBVcGRhdGUgdGhlIGRpc3BsYXkgYmFyXG4gICAgICAgIHJlc3VsdHNWaWV3LnVwZGF0ZURpc3BsYXlCYXIoc3RhdGUpO1xuXG4gICAgICAgIC8vIElmIG9uIHRoZSBmaXJzdCBwYWdlLCBkaXNhYmxlIHRoZSBwcmV2aW91cyBhbmQgZmlyc3QgcGFnZSBidXR0b25zXG4gICAgICAgIGlmIChzdGF0ZS5jdXJyZW50SW5kZXggPT09IDApIHtcbiAgICAgICAgICAgIHJlc3VsdHNWaWV3LmRpc2FibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UucHJldmlvdXNQYWdlQnRuKTtcbiAgICAgICAgICAgIHJlc3VsdHNWaWV3LmRpc2FibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UuZmlyc3RQYWdlQnRuKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEVuYWJsZSB0aGUgbmV4dCBhbmQgbGFzdCBwYWdlIGJ1dHRvbnMuIFRoZSBsYXN0IHBhZ2UgYnV0dG9uIHNob3VsZCBvbmx5IGJlIFxuICAgICAgICAvLyBlbmFibGVkIGlmIGFsbCByZXN1bHRzIGhhdmUgYmVlbiBsb2FkZWRcbiAgICAgICAgcmVzdWx0c1ZpZXcuZW5hYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLm5leHRQYWdlQnRuKTtcbiAgICAgICAgaWYgKHN0YXRlLmFsbFJlc3VsdHNMb2FkZWQpIHJlc3VsdHNWaWV3LmVuYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5sYXN0UGFnZUJ0bik7XG4gICAgfTtcblxuICAgIC8vIEV2ZW50IGxpc3RlbmVyIGZvciB0aGUgZmlyc3QgcGFnZSBidG5cbiAgICBlbGVtZW50cy5yZXN1bHRzUGFnZS5maXJzdFBhZ2VCdG4ub25jbGljayA9ICgpID0+IHtcbiAgICAgICAgLy8gVXBkYXRlIHRoZSBpbmRleFxuICAgICAgICBzdGF0ZS5jdXJyZW50SW5kZXggPSAwO1xuXG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgZGlzcGxheSBiYXNlZCBvbiB0aGUgbWV0aG9kIHN0b3JlZCBpbiB0aGUgc3RhdGVcbiAgICAgICAgcmVzdWx0c1ZpZXcudXBkYXRlRGlzcGxheShzdGF0ZSk7XG5cbiAgICAgICAgLy8gVXBkYXRlIHRoZSBkaXNwbGF5IGJhclxuICAgICAgICByZXN1bHRzVmlldy51cGRhdGVEaXNwbGF5QmFyKHN0YXRlKTtcblxuICAgICAgICAvLyBEaXNhYmxlIHRoZSBwcmV2aW91cyBhbmQgZmlyc3QgcGFnZSBidXR0b25zXG4gICAgICAgIHJlc3VsdHNWaWV3LmRpc2FibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UucHJldmlvdXNQYWdlQnRuKTtcbiAgICAgICAgcmVzdWx0c1ZpZXcuZGlzYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5maXJzdFBhZ2VCdG4pO1xuXG4gICAgICAgIC8vIEVuYWJsZSB0aGUgbmV4dCBhbmQgbGFzdCBwYWdlIGJ1dHRvbnMuIFRoZSBsYXN0IHBhZ2UgYnV0dG9uIHNob3VsZCBvbmx5IGJlIFxuICAgICAgICAvLyBlbmFibGVkIGlmIGFsbCByZXN1bHRzIGhhdmUgYmVlbiBsb2FkZWRcbiAgICAgICAgcmVzdWx0c1ZpZXcuZW5hYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLm5leHRQYWdlQnRuKTtcbiAgICAgICAgaWYgKHN0YXRlLmFsbFJlc3VsdHNMb2FkZWQpIHJlc3VsdHNWaWV3LmVuYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5sYXN0UGFnZUJ0bik7XG4gICAgfVxuXG4gICAgd2luZG93Lm9ucG9wc3RhdGUgPSBlID0+IHtcbiAgICAgICAgLy8gY29uc3QgZGF0YSA9IGUuc3RhdGU7XG4gICAgICAgIC8vIGlmIChkYXRhICE9PSBudWxsKSByZXN1bHRzVmlldy51cGRhdGVEaXNwbGF5T25Qb3BTdGF0ZShzdGF0ZSwgZGF0YSk7XG5cbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBgL3NlYXJjaGA7XG4gICAgfVxufVxuXG5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKiogQ2FyZCBQYWdlICoqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbmlmICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3Vic3RyaW5nKDEsIDUpID09PSAnY2FyZCcpIHtcbiAgICBjYXJkVmlldy5pbnNlcnRNYW5hQ29zdFRvQ2FyZFRleHRUaXRsZSgpO1xuXG4gICAgY2FyZFZpZXcuaW5zZXJ0TWFuYUNvc3RUb09yYWNsZVRleHQoKTtcblxuICAgIGNhcmRWaWV3LnJlbW92ZVVuZGVyU2NvcmVGcm9tTGVnYWxTdGF0dXMoKTtcblxuICAgIGNhcmRWaWV3LmZpeENhcmRQcmljZXMoKTtcblxuICAgIGNhcmRWaWV3LnNldFByaW50TGlua0hyZWYoKTtcblxuICAgIGNhcmRWaWV3LnByaW50TGlzdEhvdmVyRXZlbnRzKCk7XG5cbiAgICAvLyBJZiB0aGUgdHJhbnNmb3JtIGJ0biBpcyBvbiB0aGUgZG9tIChpZiB0aGUgY2FyZCBpcyBkb3VibGUgc2lkZWQpIHNldFxuICAgIC8vIHRoZSBldmVudCBsaXN0ZW5lciBmb3IgdGhlIGNhcmQgdG8gYmUgZmxpcHBlZCBiYWNrIGFuZCBmb3J0aFxuICAgIGlmIChlbGVtZW50cy5jYXJkLnRyYW5zZm9ybUJ0bikge1xuICAgICAgICBlbGVtZW50cy5jYXJkLnRyYW5zZm9ybUJ0bi5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgJ2NsaWNrJywgY2FyZFZpZXcuZmxpcFRvQmFja1NpZGVcbiAgICAgICAgKTtcbiAgICB9XG59IiwiaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJztcblxuaW1wb3J0IHsgZWxlbWVudHMgfSBmcm9tICcuLi92aWV3cy9iYXNlJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2VhcmNoIHtcbiAgICBzZWFyY2hCeU5hbWUoKSB7XG4gICAgICAgIGxldCBjYXJkTmFtZSA9IGVsZW1lbnRzLmFwaVNlYXJjaC5jYXJkTmFtZS52YWx1ZTtcbiAgICAgICAgY2FyZE5hbWUgPSBjYXJkTmFtZS5yZXBsYWNlKCcgJywgJysnKTtcblxuICAgICAgICBpZiAoY2FyZE5hbWUpIHRoaXMuc2VhcmNoICs9IGNhcmROYW1lOyAgICAgICAgXG4gICAgfSAgXG4gICAgICBcbiAgICBzZWFyY2hCeU90ZXh0KCkge1xuICAgICAgICBjb25zdCBvcmFjbGVUZXh0ID0gZWxlbWVudHMuYXBpU2VhcmNoLm9yYWNsZVRleHQudmFsdWU7XG5cbiAgICAgICAgLy8gSWYgdGhlIG9yYWNsZSB0ZXh0IGluY2x1ZGVzIG1vcmUgdGhhbiBvbmUgd29yZCwgd2UgbmVlZCB0byBzZWFyY2ggdGhlIHRlcm1zIGluZGl2aWR1YWxseVxuICAgICAgICBpZiAob3JhY2xlVGV4dC5pbmNsdWRlcygnICcpICYmIG9yYWNsZVRleHQuaW5kZXhPZignICcpICE9PSBvcmFjbGVUZXh0Lmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgIGxldCB0ZW1wb3JhcnlTdHIgPSAnJztcbiAgICAgICAgICAgIGNvbnN0IHRleHRzID0gb3JhY2xlVGV4dC5zcGxpdCgnICcpO1xuXG4gICAgICAgICAgICB0ZXh0cy5mb3JFYWNoKHRleHQgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0ZXh0Lmxlbmd0aCA+IDApIHRlbXBvcmFyeVN0ciArPSBgb3JhY2xlJTNBJHt0ZXh0fStgXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5zZWFyY2ggKz0gYCslMjgke3RlbXBvcmFyeVN0ci5zbGljZSgwLCAtMSl9JTI5YFxuICAgICAgICB9XG5cbiAgICAgICAgZWxzZSBpZiAob3JhY2xlVGV4dCkgdGhpcy5zZWFyY2ggKz0gYCtvcmFjbGUlM0Eke29yYWNsZVRleHR9YDtcbiAgICB9XG4gICAgXG4gICAgc2VhcmNoQnlDYXJkVHlwZSgpIHtcbiAgICAgICAgY29uc3QgdHlwZXNUb0luY2x1ZGUgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWluY2x1ZGUtdHlwZV0nKSk7XG4gICAgICAgIGNvbnN0IHR5cGVzVG9FeGNsdWRlID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1leGNsdWRlLXR5cGVdJykpO1xuICAgICAgICBjb25zdCBpbmNsdWRlUGFydGlhbFR5cGVzID0gZWxlbWVudHMuYXBpU2VhcmNoLmluY2x1ZGVQYXJ0aWFsVHlwZXMuY2hlY2tlZDtcbiAgICAgICAgbGV0IHRlbXBvcmFyeVN0ciA9ICcnO1xuXG4gICAgICAgIGlmICh0eXBlc1RvSW5jbHVkZSAmJiAhaW5jbHVkZVBhcnRpYWxUeXBlcykge1xuICAgICAgICAgICAgdHlwZXNUb0luY2x1ZGUuZm9yRWFjaCh0eXBlID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlYXJjaCArPSBgK3R5cGUlM0Eke3R5cGUuZ2V0QXR0cmlidXRlKCdkYXRhLWluY2x1ZGUtdHlwZScpfWA7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCh0eXBlc1RvSW5jbHVkZS5sZW5ndGggPiAwKSAmJiBpbmNsdWRlUGFydGlhbFR5cGVzKSB7XG4gICAgICAgICAgICB0eXBlc1RvSW5jbHVkZS5mb3JFYWNoKHR5cGUgPT4ge1xuICAgICAgICAgICAgICAgIHRlbXBvcmFyeVN0ciArPSBgdHlwZSUzQSR7dHlwZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaW5jbHVkZS10eXBlJyl9K09SK2BcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIHRlbXBvcmFyeVN0ciA9IHRlbXBvcmFyeVN0ci5zbGljZSgwLCAtNCk7XG4gICAgICAgICAgICB0aGlzLnNlYXJjaCArPSBgKyUyOCR7dGVtcG9yYXJ5U3RyfSUyOWA7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZXNUb0V4Y2x1ZGUpIHtcbiAgICAgICAgICAgIHR5cGVzVG9FeGNsdWRlLmZvckVhY2godHlwZSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWFyY2ggKz0gYCstdHlwZSUzQSR7dHlwZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtZXhjbHVkZS10eXBlJyl9YDtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cblxuICAgIH1cbiAgICBcbiAgICBzZWFyY2hCeUNvbG9yKCkge1xuICAgICAgICBsZXQgYm94ZXMgPSBlbGVtZW50cy5hcGlTZWFyY2guY29sb3JCb3hlcztcbiAgICBcbiAgICAgICAgLy8gTG9vcCB0aHJvdWdoIGNoZWNrYm94ZXMgdG8gZ2V0IGFsbCBjb2xvcnMgZ2l2ZW5cbiAgICAgICAgdmFyIGNvbG9ycyA9ICcnO1xuICAgICAgICBib3hlcy5mb3JFYWNoKGJveCA9PiB7XG4gICAgICAgICAgICBpZihib3guY2hlY2tlZCkgY29sb3JzICs9IGJveC52YWx1ZTtcbiAgICAgICAgfSlcbiAgICBcbiAgICAgICAgY29uc3Qgc29ydEJ5ID0gZWxlbWVudHMuYXBpU2VhcmNoLmNvbG9yU29ydEJ5LnZhbHVlO1xuXG4gICAgICAgIGlmIChjb2xvcnMpIHRoaXMuc2VhcmNoICs9IGArY29sb3Ike3NvcnRCeX0ke2NvbG9yc31gO1xuICAgIH1cbiAgICBcbiAgICBzZWFyY2hCeVN0YXRzKCkge1xuICAgICAgICBjb25zdCBzdGF0TGluZXMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgICAnLmpzLS1hcGktc3RhdHMtd3JhcHBlcidcbiAgICAgICAgKSk7XG5cbiAgICAgICAgc3RhdExpbmVzLmZvckVhY2gobGluZSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzdGF0ID0gbGluZS5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1zdGF0JykudmFsdWU7XG4gICAgICAgICAgICBjb25zdCBzb3J0QnkgPSBsaW5lLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXN0YXQtZmlsdGVyJykudmFsdWU7XG4gICAgICAgICAgICBjb25zdCBzb3J0VmFsdWUgPSBsaW5lLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXN0YXQtdmFsdWUnKS52YWx1ZTtcblxuICAgICAgICAgICAgaWYgKHN0YXQgJiYgc29ydEJ5ICYmIHNvcnRWYWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VhcmNoICs9IGArJHtzdGF0fSR7c29ydEJ5fSR7c29ydFZhbHVlfWBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG4gICAgXG4gICAgc2VhcmNoQnlGb3JtYXQoKSB7XG4gICAgICAgIGNvbnN0IGZvcm1hdExpbmVzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAgICAgJy5qcy0tYXBpLWZvcm1hdC13cmFwcGVyJ1xuICAgICAgICApKTtcblxuICAgICAgICBmb3JtYXRMaW5lcy5mb3JFYWNoKGxpbmUgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc3RhdHVzID0gbGluZS5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1sZWdhbC1zdGF0dXMnKS52YWx1ZTtcbiAgICAgICAgICAgIGNvbnN0IGZvcm1hdCA9IGxpbmUucXVlcnlTZWxlY3RvcignLmpzLS1hcGktZm9ybWF0JykudmFsdWU7XG5cbiAgICAgICAgICAgIGlmIChmb3JtYXQgJiYgc3RhdHVzKSB0aGlzLnNlYXJjaCArPSBgKyR7c3RhdHVzfSUzQSR7Zm9ybWF0fWA7XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgc2VhcmNoQnlTZXQoKSB7XG4gICAgICAgIGNvbnN0IHNldHMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWluY2x1ZGUtc2V0XScpKTtcbiAgICAgICAgbGV0IHRlbXBvcmFyeVN0ciA9ICcnO1xuXG4gICAgICAgIGlmIChzZXRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHNldHMuZm9yRWFjaChzID0+IHRlbXBvcmFyeVN0ciArPSBgc2V0JTNBJHtzLmdldEF0dHJpYnV0ZSgnZGF0YS1pbmNsdWRlLXNldCcpfStPUitgKTtcblxuICAgICAgICAgICAgdGVtcG9yYXJ5U3RyID0gdGVtcG9yYXJ5U3RyLnNsaWNlKDAsIC00KTtcbiAgICAgICAgICAgIHRoaXMuc2VhcmNoICs9IGArJTI4JHt0ZW1wb3JhcnlTdHJ9JTI5YDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBzZWFyY2hCeVJhcml0eSgpIHtcbiAgICAgICAgY29uc3QgYm94ZXMgPSBlbGVtZW50cy5hcGlTZWFyY2gucmFyaXR5Qm94ZXM7XG4gICAgICAgIHZhciB2YWx1ZXMgPSBbXTtcbiAgICAgICAgbGV0IHRlbXBvcmFyeVN0ciA9ICcnO1xuICAgIFxuICAgICAgICAvLyBQdXNoIGFsbCByYXJpdGllcyBnaXZlbiBieSB0aGUgdXNlciBpbnRvIHRoZSB2YWx1ZXMgYXJyYXlcbiAgICAgICAgYm94ZXMuZm9yRWFjaChib3ggPT4ge1xuICAgICAgICAgICAgaWYgKGJveC5jaGVja2VkKSB2YWx1ZXMucHVzaChib3gudmFsdWUpO1xuICAgICAgICB9KVxuICAgIFxuICAgICAgICBpZiAodmFsdWVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIC8vIFdlIG5lZWQgYSBzdGFydGVyIHN0cmluZyBzbyB3ZSBjYW4gc2xpY2UgaXQgbGF0ZXIgJTI4IGlzIGFuIG9wZW4gcGFyZW50aGVzZXMgXG4gICAgICAgICAgICB0ZW1wb3JhcnlTdHIgKz0gJyUyOCc7XG4gICAgXG4gICAgICAgICAgICAvLyBGb3IgZXZlcnkgdmFsdWUgZ2l2ZW4gYnkgdGhlIHVzZXIgd2UgbmVlZCB0byBhZGQgdGhlICtPUitcbiAgICAgICAgICAgIC8vIHRvIHRoZSBlbmQgZm9yIGdyb3VwaW5nLiBXZSB3aWxsIHJlbW92ZSB0aGUgK09SKyBmcm9tIHRoZSBsYXN0XG4gICAgICAgICAgICAvLyBpdGVyYXRpb24gb2YgdGhlIGxvb3BcbiAgICAgICAgICAgIHZhbHVlcy5mb3JFYWNoKHZhbHVlID0+IHRlbXBvcmFyeVN0ciArPSBgcmFyaXR5JTNBJHt2YWx1ZX0rT1IrYCk7XG4gICAgXG4gICAgICAgICAgICAvLyBSZW1vdmUgdGhlIHVubmVjZXNzYXJ5ICtPUisgYXQgdGhlIGVuZFxuICAgICAgICAgICAgdGVtcG9yYXJ5U3RyID0gdGVtcG9yYXJ5U3RyLnNsaWNlKDAsIC00KTtcbiAgICBcbiAgICAgICAgICAgIC8vIENsb3NlIHRoZSBwYXJlbnRoZXNlc1xuICAgICAgICAgICAgdGVtcG9yYXJ5U3RyICs9IGAlMjlgO1xuXG4gICAgICAgICAgICB0aGlzLnNlYXJjaCArPSBgKyR7dGVtcG9yYXJ5U3RyfWA7XG4gICAgICAgIH0gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBzZWFyY2hCeUNvc3QoKSB7XG4gICAgICAgIGNvbnN0IGRlbm9taW5hdGlvbiA9IGVsZW1lbnRzLmFwaVNlYXJjaC5kZW5vbWluYXRpb24udmFsdWU7XG4gICAgICAgIGNvbnN0IHNvcnRCeSA9IGVsZW1lbnRzLmFwaVNlYXJjaC5kZW5vbWluYXRpb25Tb3J0QnkudmFsdWU7XG4gICAgICAgIGNvbnN0IGlucHV0VmFsID0gZWxlbWVudHMuYXBpU2VhcmNoLmRlbm9taW5hdGlvblNvcnRWYWx1ZS52YWx1ZTtcbiAgICAgICAgXG4gICAgICAgIGlmIChpbnB1dFZhbCkgdGhpcy5zZWFyY2ggKz0gYCske2Rlbm9taW5hdGlvbn0ke3NvcnRCeX0ke2lucHV0VmFsfWA7XG4gICAgfVxuXG4gICAgcXVpY2tTZWFyY2goKSB7XG4gICAgICAgIGxldCBjYXJkTmFtZSA9IGVsZW1lbnRzLm5hdi5zZWFyY2hJbnB1dC52YWx1ZTtcbiAgICAgICAgY2FyZE5hbWUgPSBjYXJkTmFtZS5yZXBsYWNlKCcgJywgJysnKTtcbiAgICAgICAgcmV0dXJuIGNhcmROYW1lO1xuICAgIH1cblxuICAgIHNvcnRSZXN1bHRzKCkge1xuICAgICAgICBjb25zdCBzb3J0QnkgPSBlbGVtZW50cy5hcGlTZWFyY2guY2FyZFNvcnRlci52YWx1ZTtcbiAgICAgICAgdGhpcy5zZWFyY2ggKz0gYCZvcmRlcj0ke3NvcnRCeX1gXG4gICAgfVxuXG4gICAgLy8gVGhpcyBtZXRob2Qgd2lsbCBydW4gZWFjaCBvZiB0aGUgaW5kaXZpZHVhbCBzZWFyY2ggbWV0aG9kcyB0byBidWlsZCB0aGUgZmluYWwgc2VhcmNoIHF1ZXJ5XG4gICAgYnVpbGRTZWFyY2hRdWVyeSgpIHtcbiAgICAgICAgdGhpcy5zZWFyY2hCeU5hbWUoKTtcbiAgICAgICAgdGhpcy5zZWFyY2hCeU90ZXh0KCk7XG4gICAgICAgIHRoaXMuc2VhcmNoQnlDYXJkVHlwZSgpO1xuICAgICAgICB0aGlzLnNlYXJjaEJ5Q29sb3IoKTtcbiAgICAgICAgdGhpcy5zZWFyY2hCeVN0YXRzKCk7XG4gICAgICAgIHRoaXMuc2VhcmNoQnlGb3JtYXQoKTtcbiAgICAgICAgdGhpcy5zZWFyY2hCeVNldCgpO1xuICAgICAgICB0aGlzLnNlYXJjaEJ5UmFyaXR5KCk7XG4gICAgICAgIHRoaXMuc2VhcmNoQnlDb3N0KCk7XG4gICAgICAgIHRoaXMuc29ydFJlc3VsdHMoKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5zZWFyY2g7XG4gICAgfSBcblxuICAgIHJlc2V0U2VhcmNoUXVlcnkoKSB7XG4gICAgICAgIHRoaXMuc2VhcmNoID0gJyc7XG4gICAgfVxuXG4gICAgZGlzcGxheU1ldGhvZCgpIHtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnRzLmFwaVNlYXJjaC5kaXNwbGF5QXMudmFsdWU7XG4gICAgfVxuXG4gICAgLy8gUmV0dW5zIHRoZSBmaXJzdCBwYWdlIG9mIGNhcmRzXG4gICAgYXN5bmMgZ2V0Q2FyZHMoc3RhdGUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGF4aW9zLmdldChgaHR0cHM6Ly9hcGkuc2NyeWZhbGwuY29tL2NhcmRzL3NlYXJjaD9xPSR7c3RhdGUucXVlcnl9YClcbiAgICAgICAgICAgIC50aGVuKHJlcyA9PiB7XG4gICAgICAgICAgICAgICAgLy8gVXBkYXRlIHRoZSBzZWFyY2hcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3VsdHMgPSByZXMuZGF0YTtcbiAgICAgICAgICAgICAgICB0aGlzLmNhcmRzID0gcmVzLmRhdGEuZGF0YTtcblxuICAgICAgICAgICAgICAgIC8vIFN0b3JlIHRoZSBjYXJkcyBpbiB0aGUgYWxsQ2FyZHMgYXJyYXlcbiAgICAgICAgICAgICAgICBzdGF0ZS5hbGxDYXJkcy5wdXNoKHJlcy5kYXRhLmRhdGEpXG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIucmVzcG9uc2Uuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUuYWxsQ2FyZHMucHVzaCg0MDQpO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgLy8gVXNlZCBieSBnZXRBbGxDYXJkcyB0byBnZXQgZWFjaCBhcnJheSBvZiAxNzUgY2FyZHNcbiAgICBhc3luYyBsb29wTmV4dFBhZ2Uoc3RhdGUsIGVuYWJsZUJ0bikge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgYXhpb3MuZ2V0KHRoaXMucmVzdWx0cy5uZXh0X3BhZ2UpXG4gICAgICAgICAgICAudGhlbihyZXMgPT4ge1xuICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgcmVzdWx0cyBvYmplY3RcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3VsdHMgPSByZXMuZGF0YVxuXG4gICAgICAgICAgICAgICAgLy8gUHVzaCB0aGUgY2FyZHMgZnJvbSB0aGlzIHJlc3VsdCBpbnRvIHRoZSBhbGxDYXJkcyBhcnJheVxuICAgICAgICAgICAgICAgIHN0YXRlLmFsbENhcmRzLnB1c2gocmVzLmRhdGEuZGF0YSk7XG5cbiAgICAgICAgICAgICAgICAvLyBFbmFibGUgdGhlIG5leHQgcGFnZSBidG4gYW5kIHJlc29sdmUgdGhlIHByb21pc2VcbiAgICAgICAgICAgICAgICBlbmFibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UubmV4dFBhZ2VCdG4pO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgLy8gV2lsbCBydW4gaW4gdGhlIGJhY2tncm91bmQgYWZ0ZXIgdGhlIGZpcnN0IHNldCBvZiBjYXJkcyBpcyByZXRyaWV2ZWQgdG8gbWFrZSBtb3ZpbmcgYmV0d2VlbiByZXN1bHRzXG4gICAgLy8gcGFnZXMgZmFzdGVyXG4gICAgYXN5bmMgZ2V0QWxsQ2FyZHMoc3RhdGUsIGVuYWJsZUJ0bikge1xuICAgICAgICAvLyBBcyBsb25nIGFzIHRoZXJlIGlzIGEgbmV4dF9wYWdlIGtlZXAgbG9hZGluZyB0aGUgY2FyZHNcbiAgICAgICAgd2hpbGUgKHRoaXMucmVzdWx0cy5uZXh0X3BhZ2UpIGF3YWl0IHRoaXMubG9vcE5leHRQYWdlKHN0YXRlLCBlbmFibGVCdG4pXG5cbiAgICAgICAgLy8gVXBkYXRlIHRoZSBzdGF0ZSBvbmNlIGFsbCBjYXJkcyBoYXZlIGJlZW4gcmV0cmVpZXZlZFxuICAgICAgICBzdGF0ZS5hbGxSZXN1bHRzTG9hZGVkID0gdHJ1ZTtcblxuICAgICAgICAvLyBJZiB0aGVyZSBpcyBhdCBsZWFzdCAyIHBhZ2VzIG9mIGNhcmRzLCBlbmFibGUgdGhlIGxhc3QgcGFnZSBidG4uXG4gICAgICAgIGlmIChzdGF0ZS5hbGxDYXJkcy5sZW5ndGggPiAxKSBlbmFibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UubGFzdFBhZ2VCdG4pO1xuICAgIH1cbn0iLCJleHBvcnQgY29uc3QgZWxlbWVudHMgPSB7XG4gICAgbmF2OiB7XG4gICAgICAgIHF1aWNrU2VhcmNoQnRuOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLW5hdi1zZWFyY2gnKSxcbiAgICAgICAgc2VhcmNoSW5wdXQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tbmF2LXNlYXJjaC1pbnB1dCcpLFxuICAgIH0sXG4gICAgYXBpU2VhcmNoOiB7XG4gICAgICAgIGNhcmROYW1lOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1jYXJkLW5hbWUnKSxcbiAgICAgICAgb3JhY2xlVGV4dDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktby10ZXh0JyksXG4gICAgICAgIHR5cGVMaW5lOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS10eXBlLWxpbmUnKSxcbiAgICAgICAgc2VsZWN0ZWRUeXBlczogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktc2VsZWN0ZWQtdHlwZXMnKSxcbiAgICAgICAgaW5jbHVkZVBhcnRpYWxUeXBlczogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktdHlwZS1ib3gnKSxcbiAgICAgICAgdHlwZURyb3BEb3duOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS10eXBlcy1kcm9wZG93bicpLFxuICAgICAgICBjb2xvckJveGVzOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWFwaS1jb2xvci1ib3gnKSxcbiAgICAgICAgY29sb3JTb3J0Qnk6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLWNvbG9yLXNvcnRlcicpLFxuICAgICAgICBzdGF0OmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXN0YXQnKSxcbiAgICAgICAgc3RhdEZpbHRlcjpkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1zdGF0LWZpbHRlcicpLFxuICAgICAgICBzdGF0VmFsdWU6ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktc3RhdC12YWx1ZScpLFxuICAgICAgICBsZWdhbFN0YXR1czogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktbGVnYWwtc3RhdHVzJyksXG4gICAgICAgIGZvcm1hdDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktZm9ybWF0JyksXG4gICAgICAgIHNldElucHV0OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1zZXQnKSxcbiAgICAgICAgc2V0RHJvcERvd246IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXNldC1kcm9wZG93bicpLFxuICAgICAgICBzZWxlY3RlZFNldHM6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXNlbGVjdGVkLXNldHMnKSxcbiAgICAgICAgYmxvY2s6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLWJsb2NrJyksXG4gICAgICAgIHJhcml0eUJveGVzOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWFwaS1yYXJpdHktYm94JyksXG4gICAgICAgIGRlbm9taW5hdGlvbjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktZGVub21pbmF0aW9uJyksXG4gICAgICAgIGRlbm9taW5hdGlvblNvcnRCeTogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktZGVub21pbmF0aW9uLXNvcnQtYnknKSxcbiAgICAgICAgZGVub21pbmF0aW9uU29ydFZhbHVlOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1kZW5vbWluYXRpb24tc29ydC12YWx1ZScpLFxuICAgICAgICBjYXJkU29ydGVyOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1yZXN1bHRzLXNvcnRlcicpLFxuICAgICAgICBkaXNwbGF5QXM6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXNlYXJjaC1kaXNwbGF5LXNlbGVjdG9yJyksXG4gICAgICAgIHN1Ym1pdEJ0bjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktYnRuJyksXG4gICAgfSxcbiAgICByZXN1bHRzUGFnZToge1xuICAgICAgICByZXN1bHRzQ29udGFpbmVyOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1yZXN1bHRzLWRpc3BsYXknKSxcbiAgICAgICAgZGlzcGxheVNlbGVjdG9yOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXJlc3VsdHMtZGlzcGxheS1vcHRpb24nKSxcbiAgICAgICAgc29ydEJ5OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXJlc3VsdHMtc29ydC1vcHRpb25zJyksXG4gICAgICAgIGJ0bjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1yZXN1bHRzLXN1Ym1pdC1idG4nKSxcbiAgICAgICAgY2FyZENoZWNrbGlzdDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1jYXJkLWNoZWNrbGlzdCcpLFxuICAgICAgICBpbWFnZUdyaWQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taW1hZ2UtZ3JpZCcpLFxuICAgICAgICBkaXNwbGF5QmFyOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1kaXNwbGF5LWJhcicpLFxuICAgICAgICBmaXJzdFBhZ2VCdG46IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLWZpcnN0LXBhZ2UnKSxcbiAgICAgICAgcHJldmlvdXNQYWdlQnRuOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1wcmV2aW91cy1wYWdlJyksXG4gICAgICAgIG5leHRQYWdlQnRuOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1uZXh0LXBhZ2UnKSxcbiAgICAgICAgbGFzdFBhZ2VCdG46IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLWxhc3QtcGFnZScpXG4gICAgfSxcbiAgICBjYXJkOiB7XG4gICAgICAgIG1hbmFDb3N0VGl0bGVTcGFuOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWNhcmQtbWFuYS1jb3N0JyksXG4gICAgICAgIG9yYWNsZVRleHRzOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLW9yYWNsZS10ZXh0LWxpbmUnKSxcbiAgICAgICAgbGVnYWxpdGllczogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1jYXJkLWxlZ2FsaXR5JyksXG4gICAgICAgIHByaW50Um93czogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1jYXJkLXByaW50LXJvdycpLFxuICAgICAgICBwcmljZXM6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tY2FyZC1wcmljZScpLFxuICAgICAgICBjYXJkUHJpbnRMaW5rczogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1jYXJkLXByaW50LWxpbmsnKSxcbiAgICAgICAgZnJvbnQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tZnJvbnQnKSxcbiAgICAgICAgYmFjazogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1iYWNrJyksXG4gICAgICAgIHRyYW5zZm9ybUJ0bjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1jYXJkLXRyYW5zZm9ybScpLFxuICAgIH1cbn07IiwiaW1wb3J0IHsgZ2VuZXJhdGVNYW5hQ29zdEltYWdlcyB9IGZyb20gJy4vcmVzdWx0c1ZpZXcnO1xuaW1wb3J0IHsgZWxlbWVudHMgfSBmcm9tICcuL2Jhc2UnO1xuXG5leHBvcnQgY29uc3QgaW5zZXJ0TWFuYUNvc3RUb0NhcmRUZXh0VGl0bGUgPSAoKSA9PiB7XG4gICAgY29uc3QgbWFuYUNvc3RzID0gQXJyYXkuZnJvbShlbGVtZW50cy5jYXJkLm1hbmFDb3N0VGl0bGVTcGFuKTsgICAgXG5cbiAgICBtYW5hQ29zdHMuZm9yRWFjaChjb3N0ID0+IHtcbiAgICAgICAgY29zdC5pbm5lckhUTUwgPSBnZW5lcmF0ZU1hbmFDb3N0SW1hZ2VzKFxuICAgICAgICAgICAgY29zdC5nZXRBdHRyaWJ1dGUoJ2RhdGEtbWFuYS1jb3N0JylcbiAgICAgICAgKTtcbiAgICB9KVxufTtcblxuXG5leHBvcnQgY29uc3QgaW5zZXJ0TWFuYUNvc3RUb09yYWNsZVRleHQgPSAoKSA9PiB7XG4gICAgY29uc3Qgb3JhY2xlVGV4dHMgPSBBcnJheS5mcm9tKGVsZW1lbnRzLmNhcmQub3JhY2xlVGV4dHMpO1xuXG4gICAgaWYgKG9yYWNsZVRleHRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgb3JhY2xlVGV4dHMuZm9yRWFjaCh0ZXh0ID0+IHRleHQuaW5uZXJIVE1MID0gZ2VuZXJhdGVNYW5hQ29zdEltYWdlcyhcbiAgICAgICAgICAgIHRleHQuaW5uZXJIVE1MLCAneHMnXG4gICAgICAgICkpO1xuICAgIH0gICAgXG59O1xuXG5cbmV4cG9ydCBjb25zdCByZW1vdmVVbmRlclNjb3JlRnJvbUxlZ2FsU3RhdHVzID0gKCkgPT4ge1xuICAgIGNvbnN0IGxlZ2FsaXRpZXMgPSBBcnJheS5mcm9tKGVsZW1lbnRzLmNhcmQubGVnYWxpdGllcyk7XG5cbiAgICBsZWdhbGl0aWVzLmZvckVhY2gobGVnYWxpdHkgPT4ge1xuICAgICAgICBpZiAobGVnYWxpdHkuaW5uZXJIVE1MLmluY2x1ZGVzKCdfJykpIHtcbiAgICAgICAgICAgIGxlZ2FsaXR5LmlubmVySFRNTCA9IGxlZ2FsaXR5LmlubmVySFRNTC5yZXBsYWNlKCdfJywgJyAnKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuXG5leHBvcnQgY29uc3QgZml4Q2FyZFByaWNlcyA9ICgpID0+IHtcbiAgICBjb25zdCBwcmljZXMgPSBBcnJheS5mcm9tKGVsZW1lbnRzLmNhcmQucHJpY2VzKTtcblxuICAgIHByaWNlcy5mb3JFYWNoKHByaWNlID0+IHtcbiAgICAgICAgaWYgKHByaWNlLmlubmVySFRNTC5pbmNsdWRlcygnTm9uZScpKSBwcmljZS5pbm5lckhUTUwgPSAnLSdcbiAgICB9KTtcbn07XG5cblxuY29uc3QgZml4RG91YmxlU2lkZWRDYXJkTmFtZSA9IGNhcmROYW1lID0+IHtcbiAgICBpZiAoY2FyZE5hbWUuaW5jbHVkZXMoJy8nKSkge1xuICAgICAgICBjYXJkTmFtZSA9IGNhcmROYW1lLnN1YnN0cmluZygwLCBjYXJkTmFtZS5pbmRleE9mKCcvJykgLSAxKVxuICAgIH1cbiAgICByZXR1cm4gY2FyZE5hbWU7ICAgIFxufVxuXG5cbmV4cG9ydCBjb25zdCBzZXRQcmludExpbmtIcmVmID0gKCkgPT4ge1xuICAgIGNvbnN0IGxpbmtzID0gQXJyYXkuZnJvbShlbGVtZW50cy5jYXJkLmNhcmRQcmludExpbmtzKTtcblxuICAgIGxpbmtzLmZvckVhY2gobGluayA9PiB7XG4gICAgICAgIGxldCBjYXJkTmFtZSA9IGxpbmsuZ2V0QXR0cmlidXRlKCdkYXRhLW5hbWUnKS5yZXBsYWNlQWxsKCcgJywgJy0nKTtcbiAgICAgICAgY2FyZE5hbWUgPSBmaXhEb3VibGVTaWRlZENhcmROYW1lKGNhcmROYW1lKTtcbiAgICAgICAgY29uc3Qgc2V0Q29kZSA9IGxpbmsuZ2V0QXR0cmlidXRlKCdkYXRhLXNldCcpO1xuXG4gICAgICAgIGxpbmsuaHJlZiA9IGAvY2FyZC8ke3NldENvZGV9LyR7Y2FyZE5hbWV9YFxuICAgIH0pO1xufTtcblxuXG5jb25zdCBzZXREb3VibGVTaWRlZFRyYW5zaXRpb24gPSAoKSA9PiB7XG4gICAgLy8gQ2hlY2tzIHRvIHNlZSBpZiBhbiBpbmxpbmUgc3R5bGUgaGFzIGJlZW4gc2V0IGZvciB0aGUgZnJvbnQgb2YgdGhlIGNhcmQuXG4gICAgLy8gSWYgbm90LCBzZXQgYSB0cmFuc2l0b24uIFRoaXMgbWFrZXMgc3VyZSB3ZSBkb24ndCBzZXQgdGhlIHRyYW5zaXRvbiBldmVyeVxuICAgIC8vIHRpbWUgdGhlIGNhcmQgaXMgZmxpcHBlZC5cbiAgICBpZiAoIWVsZW1lbnRzLmNhcmQuZnJvbnQuZ2V0QXR0cmlidXRlKCdzdHlsZScpKSB7XG4gICAgICAgIGVsZW1lbnRzLmNhcmQuZnJvbnQuc3R5bGUudHJhbnNpdGlvbiA9IGBhbGwgLjhzIGVhc2VgO1xuICAgICAgICBlbGVtZW50cy5jYXJkLmJhY2suc3R5bGUudHJhbnNpdGlvbiA9IGBhbGwgLjhzIGVhc2VgO1xuICAgIH1cbn07XG5cblxuZXhwb3J0IGNvbnN0IGZsaXBUb0JhY2tTaWRlID0gKCkgPT4ge1xuICAgIC8vIFNldHMgdGhlIHRyYW5zaXRpb24gcHJvcGVydHkgb24gYm90aCBzaWRlcyBvZiB0aGUgY2FyZCB0aGUgZmlyc3QgdGltZSB0aGVcbiAgICAvLyB0cmFuc2Zvcm0gYnV0dG9uIGlzIGNsaWNrZWRcbiAgICBzZXREb3VibGVTaWRlZFRyYW5zaXRpb24oKTtcblxuICAgIC8vIFJvdGF0ZXMgdGhlIGNhcmQgdG8gc2hvdyB0aGUgYmFja3NpZGUuXG4gICAgZWxlbWVudHMuY2FyZC5mcm9udC5zdHlsZS50cmFuc2Zvcm0gPSBgcm90YXRlWSgtMTgwZGVnKWA7XG4gICAgZWxlbWVudHMuY2FyZC5iYWNrLnN0eWxlLnRyYW5zZm9ybSA9IGByb3RhdGVZKDApYDtcblxuICAgIC8vIFJlc2V0IHRoZSBldmVudCBsaXN0ZW5lciBzbyB0aGF0IG9uIGNsaWNraW5nIHRoZSBidXR0b24gaXQgd2lsbCBmbGlwXG4gICAgLy8gYmFjayB0byB0aGUgZnJvbnQgb2YgdGhlIGNhcmRcbiAgICBlbGVtZW50cy5jYXJkLnRyYW5zZm9ybUJ0bi5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIGZsaXBUb0JhY2tTaWRlKTtcbiAgICBlbGVtZW50cy5jYXJkLnRyYW5zZm9ybUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZsaXBUb0Zyb250U2lkZSk7XG59O1xuXG5cbmV4cG9ydCBjb25zdCBmbGlwVG9Gcm9udFNpZGUgPSAoKSA9PiB7XG4gICAgZWxlbWVudHMuY2FyZC5mcm9udC5zdHlsZS50cmFuc2Zvcm0gPSBgcm90YXRlWSgwKWA7XG4gICAgZWxlbWVudHMuY2FyZC5iYWNrLnN0eWxlLnRyYW5zZm9ybSA9IGByb3RhdGVZKDE4MGRlZylgO1xuXG4gICAgLy8gUmVzZXQgdGhlIGV2ZW50IGxpc3RlbmVyIHNvIHRoYXQgb24gY2xpY2tpbmcgdGhlIGJ1dHRvbiBpdCB3aWxsIGZsaXBcbiAgICAvLyB0byB0aGUgYmFja3NpZGUgb2YgdGhlIGNhcmRcbiAgICBlbGVtZW50cy5jYXJkLnRyYW5zZm9ybUJ0bi5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIGZsaXBUb0Zyb250U2lkZSk7XG4gICAgZWxlbWVudHMuY2FyZC50cmFuc2Zvcm1CdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmbGlwVG9CYWNrU2lkZSk7XG59XG5cblxuLy8gQ3JlYXRlIHRoZSBob3ZlciBlZmZlY3Qgb24gZWFjaCByb3cgdGhhdCBkaXNwbGF5cyB0aGUgaW1hZ2Ugb2YgdGhlIGNhcmRcbmV4cG9ydCBjb25zdCBwcmludExpc3RIb3ZlckV2ZW50cyA9ICgpID0+IHtcbiAgICAvLyBHZXQgdGhlIEhUTUwgZm9yIGVhY2ggdGFibGUgcm93XG4gICAgY29uc3QgcHJpbnRzID0gQXJyYXkuZnJvbShlbGVtZW50cy5jYXJkLnByaW50Um93cyk7XG4gXG4gICAgcHJpbnRzLmZvckVhY2gocHJpbnQgPT4ge1xuICAgICAgICBwcmludC5vbm1vdXNlbW92ZSA9IGUgPT4ge1xuICAgICAgICAgICAgLy8gSWYgdGhlIHdpbmRvdyBpcyBzbWFsbGVyIHRoYW4gNzY4IHBpeGVscywgZG9uJ3QgZGlzcGxheSBhbnkgaW1hZ2VzXG4gICAgICAgICAgICBpZiAod2luZG93LmlubmVyV2lkdGggPCA3NjgpIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgLy8gSWYgdGhlcmUgaXMgYWxyZWFkeSBhbiBpbWFnZSBiZWluZyBkaXNwbGF5ZWQsIHJlbW92ZSBpdCBmcm9tIHRoZSBET01cbiAgICAgICAgICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudG9vbHRpcCcpKSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudG9vbHRpcCcpKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIFByZXAgdGhlIGRpdi5cbiAgICAgICAgICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgZGl2LmNsYXNzTmFtZSA9ICd0b29sdGlwJztcblxuICAgICAgICAgICAgLy8gVGhlIGRpdiBpcyBzdHlsZWQgd2l0aCBwb3NpdGlvbiBhYnNvbHV0ZS4gVGhpcyBjb2RlIHB1dHMgaXQganVzdCB0byB0aGUgcmlnaHQgb2YgdGhlIGN1cnNvclxuICAgICAgICAgICAgZGl2LnN0eWxlLmxlZnQgPSBlLnBhZ2VYICsgNTAgKyAncHgnO1xuICAgICAgICAgICAgZGl2LnN0eWxlLnRvcCA9IGUucGFnZVkgLSAzMCArICdweCc7XG5cbiAgICAgICAgICAgIC8vIFByZXAgdGhlIGltZyBlbGVtZW50XG4gICAgICAgICAgICBjb25zdCBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcbiAgICAgICAgICAgIGltZy5jbGFzc05hbWUgPSAndG9vbHRpcF9faW1nJztcbiAgICAgICAgICAgIGltZy5zcmMgPSBwcmludC5nZXRBdHRyaWJ1dGUoJ2RhdGEtY2FyZEltZycpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBQdXQgdGhlIGltZyBpbnRvIHRoZSBkaXYgYW5kIHRoZW4gYXBwZW5kIHRoZSBkaXYgZGlyZWN0bHkgdG8gdGhlIGJvZHkgb2YgdGhlIGRvY3VtZW50LlxuICAgICAgICAgICAgZGl2LmFwcGVuZENoaWxkKGltZyk7IFxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkaXYpOyAgXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIC8vIFJlbW92ZSB0aGUgaW1nIHdoZW4gdGFraW5nIHRoZSBjdXJzb3Igb2ZmIHRoZSBwcmludFxuICAgICAgICBwcmludC5vbm1vdXNlb3V0ID0gZSA9PiB7XG4gICAgICAgICAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRvb2x0aXAnKSkge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRvb2x0aXAnKSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9O1xuICAgIH0pO1xufTtcblxuIiwiaW1wb3J0IHsgZWxlbWVudHMgfSBmcm9tICcuL2Jhc2UnO1xuXG5jb25zdCBjbGVhckNoZWNrbGlzdCA9ICgpID0+IHtcbiAgICBjb25zdCBjaGVja0xpc3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWNhcmQtY2hlY2tsaXN0JylcbiAgICBpZiAoY2hlY2tMaXN0KSB7XG4gICAgICAgIGNoZWNrTGlzdC5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKGNoZWNrTGlzdCk7XG5cbiAgICAgICAgLy8gUmVtb3ZlIGFueSB0b29sIHRpcCBpbWFnZXMgaWYgdXNlciB3YXMgaG92ZXJpbmdcbiAgICAgICAgY29uc3QgdG9vbFRpcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50b29sdGlwJylcbiAgICAgICAgaWYgKHRvb2xUaXApIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQodG9vbFRpcCk7XG4gICAgfVxufTtcblxuXG5jb25zdCBjbGVhckltYWdlR3JpZCA9ICgpID0+IHtcbiAgICBjb25zdCBncmlkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1pbWFnZS1ncmlkJylcbiAgICBpZiAoZ3JpZCkgZ3JpZC5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKGdyaWQpO1xufTtcblxuXG5jb25zdCBjbGVhclJlc3VsdHMgPSAoKSA9PiB7XG4gICAgY2xlYXJDaGVja2xpc3QoKTtcbiAgICBjbGVhckltYWdlR3JpZCgpOyAgIFxufVxuXG5cbmNvbnN0IHByZXBJbWFnZUNvbnRhaW5lciA9ICgpID0+IHtcbiAgICBjb25zdCBtYXJrdXAgPSBgXG4gICAgICAgIDxkaXYgY2xhc3M9XCJpbWFnZS1ncmlkIGpzLS1pbWFnZS1ncmlkXCI+PC9kaXY+XG4gICAgYFxuICAgIGVsZW1lbnRzLnJlc3VsdHNQYWdlLnJlc3VsdHNDb250YWluZXIuaW5zZXJ0QWRqYWNlbnRIVE1MKCdiZWZvcmVlbmQnLCBtYXJrdXApO1xufTtcblxuXG5jb25zdCBnZW5lcmF0ZVNpbmdsZVNpZGVkQ2FyZCA9IGNhcmQgPT4ge1xuICAgIGNvbnN0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgY29uc3QgaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG5cbiAgICBhLmNsYXNzTGlzdCA9IGBpbWFnZS1ncmlkX19saW5rIGpzLS1pbWFnZS1ncmlkLWxpbmtgO1xuICAgIGEuaHJlZiA9IGAvY2FyZC8ke2NhcmQuc2V0fS8ke3BhcnNlQ2FyZE5hbWUoY2FyZC5uYW1lKX1gO1xuXG4gICAgZGl2LmNsYXNzTGlzdCA9IGBpbWFnZS1ncmlkX19jb250YWluZXJgO1xuICAgIGltZy5zcmMgPSBgJHtjYXJkLmltYWdlX3VyaXMubm9ybWFsfWA7XG4gICAgaW1nLmFsdCA9IGAke2NhcmQubmFtZX1gXG4gICAgaW1nLmNsYXNzTGlzdCA9IGBpbWFnZS1ncmlkX19pbWFnZWA7XG4gICAgZGl2LmFwcGVuZENoaWxkKGltZyk7XG4gICAgYS5hcHBlbmRDaGlsZChkaXYpO1xuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1pbWFnZS1ncmlkJykuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdiZWZvcmVlbmQnLCBhKTtcbn1cblxuXG5jb25zdCBzaG93QmFja1NpZGUgPSBjYXJkID0+IHtcbiAgICBjb25zdCBmcm9udCA9IGNhcmQucXVlcnlTZWxlY3RvcignLmpzLS1pbWFnZS1ncmlkLWNhcmQtc2lkZS1mcm9udCcpO1xuICAgIGNvbnN0IGJhY2sgPSBjYXJkLnF1ZXJ5U2VsZWN0b3IoJy5qcy0taW1hZ2UtZ3JpZC1jYXJkLXNpZGUtYmFjaycpOyAgICBcbiAgICBcbiAgICBmcm9udC5zdHlsZS50cmFuc2Zvcm0gPSAncm90YXRlWSgtMTgwZGVnKSc7XG4gICAgYmFjay5zdHlsZS50cmFuc2Zvcm0gPSAncm90YXRlWSgwKSc7XG5cbiAgICBmcm9udC5jbGFzc0xpc3QucmVtb3ZlKCdqcy0tc2hvd2luZycpO1xuICAgIGJhY2suY2xhc3NMaXN0LmFkZCgnanMtLXNob3dpbmcnKTtcbn1cblxuXG5jb25zdCBzaG93RnJvbnRTaWRlID0gY2FyZCA9PiB7XG4gICAgY29uc3QgZnJvbnQgPSBjYXJkLnF1ZXJ5U2VsZWN0b3IoJy5qcy0taW1hZ2UtZ3JpZC1jYXJkLXNpZGUtZnJvbnQnKTtcbiAgICBjb25zdCBiYWNrID0gY2FyZC5xdWVyeVNlbGVjdG9yKCcuanMtLWltYWdlLWdyaWQtY2FyZC1zaWRlLWJhY2snKTtcblxuICAgIGZyb250LnN0eWxlLnRyYW5zZm9ybSA9ICdyb3RhdGVZKDApJztcbiAgICBiYWNrLnN0eWxlLnRyYW5zZm9ybSA9ICdyb3RhdGVZKDE4MGRlZyknO1xuXG4gICAgZnJvbnQuY2xhc3NMaXN0LmFkZCgnanMtLXNob3dpbmcnKTtcbiAgICBiYWNrLmNsYXNzTGlzdC5yZW1vdmUoJ2pzLS1zaG93aW5nJyk7XG59XG5cblxuY29uc3QgZmxpcENhcmQgPSBlID0+IHtcbiAgICAvLyBQcmV2ZW50IHRoZSBsaW5rIGZyb20gZ29pbmcgdG8gdGhlIGNhcmQgc3BlY2lmaWMgcGFnZVxuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBjb25zdCBjYXJkID0gZS50YXJnZXQucGFyZW50RWxlbWVudDtcblxuICAgIGNvbnN0IGZyb250ID0gY2FyZC5xdWVyeVNlbGVjdG9yKCcuanMtLWltYWdlLWdyaWQtY2FyZC1zaWRlLWZyb250Jyk7XG5cbiAgICAvLyBJZiB0aGUgZnJvbnQgaXMgc2hvd2luZywgZGlzcGxheSB0aGUgYmFja3NpZGUuIE90aGVyd2lzZSwgZGlzcGxheSB0aGUgZnJvbnRcbiAgICBpZiAoZnJvbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdqcy0tc2hvd2luZycpKSBzaG93QmFja1NpZGUoY2FyZCk7XG4gICAgZWxzZSBzaG93RnJvbnRTaWRlKGNhcmQpO1xufVxuXG5cbmNvbnN0IGdlbmVyYXRlRmxpcENhcmRCdG4gPSAoKSA9PiB7XG4gICAgY29uc3QgYnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgYnRuLmNsYXNzTGlzdCA9ICdpbWFnZS1ncmlkX19kb3VibGUtYnRuIGpzLS1pbWFnZS1ncmlkLWZsaXAtY2FyZC1idG4nO1xuICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4gZmxpcENhcmQoZSkpXG5cbiAgICByZXR1cm4gYnRuO1xufVxuXG5cbmNvbnN0IGdlbmVyYXRlRG91YmxlU2lkZWRDYXJkID0gY2FyZCA9PiB7XG4gICAgY29uc3QgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICBjb25zdCBvdXRlckRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGNvbnN0IGlubmVyRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgY29uc3QgaW1nRnJvbnRTaWRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG4gICAgY29uc3QgaW1nQmFja1NpZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcbiAgICBjb25zdCBmbGlwQ2FyZEJ0biA9IGdlbmVyYXRlRmxpcENhcmRCdG4oKTtcblxuICAgIGEuY2xhc3NMaXN0ID0gYGltYWdlLWdyaWRfX2xpbmsganMtLWltYWdlLWdyaWQtbGlua2A7XG4gICAgYS5ocmVmID0gYC9jYXJkLyR7Y2FyZC5zZXR9LyR7cGFyc2VDYXJkTmFtZShjYXJkLm5hbWUpfWA7XG5cbiAgICBvdXRlckRpdi5jbGFzc0xpc3QgPSBgaW1hZ2UtZ3JpZF9fb3V0ZXItZGl2YDtcbiAgICBpbm5lckRpdi5jbGFzc0xpc3QgPSBgaW1hZ2UtZ3JpZF9faW5uZXItZGl2IGpzLS1pbm5lci1kaXYtJHtjYXJkLm5hbWV9YDtcblxuICAgIGltZ0Zyb250U2lkZS5jbGFzc0xpc3QgPSBgaW1hZ2UtZ3JpZF9fZG91YmxlIGltYWdlLWdyaWRfX2RvdWJsZS0tZnJvbnQganMtLWltYWdlLWdyaWQtY2FyZC1zaWRlLWZyb250IGpzLS1zaG93aW5nYDtcbiAgICBpbWdGcm9udFNpZGUuc3JjID0gY2FyZC5jYXJkX2ZhY2VzWzBdLmltYWdlX3VyaXMubm9ybWFsO1xuICAgIGltZ0Zyb250U2lkZS5hbHQgPSBjYXJkLm5hbWU7XG5cbiAgICBpbWdCYWNrU2lkZS5jbGFzc0xpc3QgPSBgaW1hZ2UtZ3JpZF9fZG91YmxlIGltYWdlLWdyaWRfX2RvdWJsZS0tYmFjayBqcy0taW1hZ2UtZ3JpZC1jYXJkLXNpZGUtYmFja2A7XG4gICAgaW1nQmFja1NpZGUuc3JjID0gY2FyZC5jYXJkX2ZhY2VzWzFdLmltYWdlX3VyaXMubm9ybWFsO1xuICAgIGltZ0JhY2tTaWRlLmFsdCA9IGNhcmQuY2FyZF9mYWNlc1sxXS5uYW1lO1xuXG4gICAgYS5hcHBlbmRDaGlsZChvdXRlckRpdik7XG4gICAgb3V0ZXJEaXYuYXBwZW5kQ2hpbGQoaW5uZXJEaXYpO1xuICAgIGlubmVyRGl2LmFwcGVuZENoaWxkKGltZ0JhY2tTaWRlKTtcbiAgICBpbm5lckRpdi5hcHBlbmRDaGlsZChpbWdGcm9udFNpZGUpO1xuICAgIGlubmVyRGl2LmFwcGVuZENoaWxkKGZsaXBDYXJkQnRuKTtcblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taW1hZ2UtZ3JpZCcpLmluc2VydEFkamFjZW50RWxlbWVudCgnYmVmb3JlZW5kJywgYSk7XG59XG5cblxuY29uc3QgZ2VuZXJhdGVJbWFnZUdyaWQgPSBjYXJkcyA9PiB7XG4gICAgY2FyZHMuZm9yRWFjaChjYXJkID0+IHtcbiAgICAgICAgLy8gRm9yIHNpbmdsZSBzaWRlZCBjYXJkc1xuICAgICAgICBpZiAoY2FyZC5pbWFnZV91cmlzKSBnZW5lcmF0ZVNpbmdsZVNpZGVkQ2FyZChjYXJkKTtcblxuICAgICAgICAvLyBEb3VibGUgc2lkZWQgY2FyZHNcbiAgICAgICAgZWxzZSBnZW5lcmF0ZURvdWJsZVNpZGVkQ2FyZChjYXJkKTsgICAgICAgXG4gICAgfSlcbn1cblxuXG4vLyBGdW5jaXRvbiB0byBiZSB1c2VkIGluIGluZGV4LmpzLiBUYWtlcyBjYXJlIG9mIGFsbCBuZWNlc3Nhcnkgc3RlcHMgdG8gZGlzcGxheSBjYXJkcyBhcyBhIGltYWdlc1xuZXhwb3J0IGNvbnN0IGRpc3BhbHlJbWFnZXMgPSBjYXJkcyA9PiB7XG4gICAgY2xlYXJSZXN1bHRzKCk7XG4gICAgcHJlcEltYWdlQ29udGFpbmVyKCk7XG4gICAgZ2VuZXJhdGVJbWFnZUdyaWQoY2FyZHMpO1xufVxuXG4gXG5jb25zdCBwcmVwQ2hlY2tsaXN0Q29udGFpbmVyID0gKCkgPT4ge1xuICAgIGNvbnN0IG1hcmt1cCA9IGBcbiAgICAgICAgPHRhYmxlIGNsYXNzPVwiY2FyZC1jaGVja2xpc3QganMtLWNhcmQtY2hlY2tsaXN0XCI+XG4gICAgICAgICAgICA8dGhlYWQ+XG4gICAgICAgICAgICAgICAgPHRyIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX3JvdyBjYXJkLWNoZWNrbGlzdF9fcm93LS1oZWFkZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGFcIj5TZXQ8L3RoPlxuICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YVwiPk5hbWU8L3RoPlxuICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YVwiPkNvc3Q8L3RoPlxuICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YVwiPlR5cGU8L3RoPlxuICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YVwiPlJhcml0eTwvdGg+XG4gICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhXCI+QXJ0aXN0PC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGFcIj5QcmljZTwvdGg+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgIDwvdGhlYWQ+XG4gICAgICAgICAgICA8dGJvZHkgY2xhc3M9XCJqcy0tY2FyZC1jaGVja2xpc3QtYm9keVwiPjwvdGJvZHk+XG4gICAgICAgIDwvdGFibGU+XG4gICAgICAgIGBcbiAgICBlbGVtZW50cy5yZXN1bHRzUGFnZS5yZXN1bHRzQ29udGFpbmVyLmluc2VydEFkamFjZW50SFRNTCgnYmVmb3JlZW5kJywgbWFya3VwKTtcbn1cblxuZXhwb3J0IGNvbnN0IGdlbmVyYXRlTWFuYUNvc3RJbWFnZXMgPSAobWFuYUNvc3QsIHNpemU9J3NtYWxsJykgPT4ge1xuICAgIC8vIElmIHRoZXJlIGlzIG5vIG1hbmEgY29zdCBhc3NvY2lhdGVkIHdpdGggdGhlIGNhcmQsIHRoZW4gcmV0dXJuIGFuIGVtcHR5IHN0cmluZyB0byBsZWF2ZSB0aGUgcm93IGVtcHR5XG4gICAgaWYgKCFtYW5hQ29zdCkgcmV0dXJuICcnO1xuXG4gICAgLy8gUmVndWxhciBleHByZXNzaW9ucyB0byBmaW5kIGVhY2ggc2V0IG9mIGN1cmx5IGJyYWNlcyB7fVxuICAgIGxldCByZSA9IC9cXHsoLio/KVxcfS9nXG5cbiAgICAvLyBQYXJzZSB0aGUgc3RyaW5ncyBhbmQgZ2V0IGFsbCBtYXRjaGVzXG4gICAgbGV0IG1hdGNoZXMgPSBtYW5hQ29zdC5tYXRjaChyZSk7XG5cbiAgICAvLyBJZiB0aGVyZSBhcmUgYW55IG1hdGNoZXMsIGxvb3AgdGhyb3VnaCBhbmQgcmVwbGFjZSBlYWNoIHNldCBvZiBjdXJseSBicmFjZXMgd2l0aCB0aGUgXG4gICAgLy8gaHRtbCBzcGFuIHRoYXQgY29ycmVzcG9ucyB0byBtYW5hLmNzcyB0byByZW5kZXIgdGhlIGNvcnJlY3QgaW1hZ2VcbiAgICBpZiAobWF0Y2hlcykge1xuICAgICAgICBtYXRjaGVzLmZvckVhY2gobSA9PiB7XG4gICAgICAgICAgICBjb25zdCByZWdleCA9IG5ldyBSZWdFeHAoYFxceygke20uc2xpY2UoMSwgLTEpfSlcXH1gLCAnZycpO1xuICAgICAgICAgICAgLy8gVGhpcyB3aWxsIGJlIHRoZSBzdHJpbmcgdXNlZCB0byBnZXQgdGhlIHJpZ2h0IGNsYXNzIGZyb20gbWFuYS5jc3NcbiAgICAgICAgICAgIC8vIFdlIHdhbnQgdG8gdGFrZSBldmVyeXRoaW5nIGluc2lkZSB0aGUgYnJhY2tldHMsIGFuZCBpZiB0aGVyZSBpcyBhIC9cbiAgICAgICAgICAgIC8vIHJlbW92ZSBpdC5cbiAgICAgICAgICAgIGNvbnN0IG1hbmFJY29uU3RyID0gbS5zbGljZSgxLCAtMSkudG9Mb3dlckNhc2UoKS5yZXBsYWNlKCcvJywgJycpXG4gICAgICAgICAgICBtYW5hQ29zdCA9IG1hbmFDb3N0LnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgcmVnZXgsIFxuICAgICAgICAgICAgICAgIGA8c3BhbiBjbGFzcz1cIm1hbmEgJHtzaXplfSBzJHttYW5hSWNvblN0cn1cIj48L3NwYW4+YFxuICAgICAgICAgICAgKVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIHJldHVybiBtYW5hQ29zdDtcbn1cblxuY29uc3Qgc2hvcnRlblR5cGVMaW5lID0gdHlwZSA9PiB7XG4gICAgLy8gSWYgbm8gdHlwZSBpcyBnaXZlbiwgcmV0dXJuIGFuIGVtcHR5IHN0cmluZ1xuICAgIGlmICghdHlwZSkgcmV0dXJuICcnO1xuXG4gICAgLy8gaWYgdGhlIOKAlCBkZWxpbWl0ZXIgaXMgZm91bmQgaW4gdGhlIHN0cmluZywgcmV0dXJuIGV2ZXJ5dGhpbmcgYmVmb3JlIHRoZSBkZWxpbWl0ZXJcbiAgICBpZiAodHlwZS5pbmRleE9mKCfigJQnKSAhPT0gLTEpIHJldHVybiB0eXBlLnN1YnN0cmluZygwLCB0eXBlLmluZGV4T2YoJ+KAlCcpIC0gMSk7XG5cbiAgICAvLyBJZiB0aGVyZSBpcyBubyBkZWxpbWl0ZXIsIHJldHVybiB0aGUgdHlwZSBhcyBnaXZlbiBpbiB0aGUgY2FyZCBvYmplY3RcbiAgICByZXR1cm4gdHlwZTsgICAgXG59XG5cbmNvbnN0IHBhcnNlQ2FyZE5hbWUgPSBjYXJkTmFtZSA9PiB7XG4gICAgaWYgKGNhcmROYW1lLmluZGV4T2YoJy8nKSAhPT0gLTEpIHtcbiAgICAgICAgcmV0dXJuIGNhcmROYW1lLnNsaWNlKDAsIChjYXJkTmFtZS5pbmRleE9mKCcvJykgLSAxKSkucmVwbGFjZUFsbCgnICcsICctJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNhcmROYW1lLnJlcGxhY2VBbGwoJyAnLCAnLScpO1xufVxuXG5jb25zdCBnZW5lcmF0ZUNoZWNrbGlzdCA9IGNhcmRzID0+IHtcbiAgICAvLyBUaGUgY3RyIGFuZCBpc1Jvd0dyZXkgZnVuY3Rpb24gYXJlIHVzZWQgdG8gc2V0IGEgY2xhc3Mgb24gZXZlcnkgb3RoZXIgcm93IHNvIGl0IGNhbiBcbiAgICAvLyBiZSBzdHlsZWQgZ3JleVxuICAgIGxldCBjdHIgPSAwXG4gICAgY29uc3QgaXNSb3dHcmV5ID0gY3RyID0+IChjdHIgJSAyID09PSAwID8gJ2NhcmQtY2hlY2tsaXN0X19yb3ctLWdyZXknIDogJycpICAgXG5cbiAgICAvLyBDcmVhdGUgYSBuZXcgdGFibGUgcm93IGZvciBlYWNoIGNhcmQgb2JqZWN0XG4gICAgY2FyZHMuZm9yRWFjaChjYXJkID0+IHtcbiAgICAgICAgY29uc3QgY2FyZE5hbWVGb3JVcmwgPSBwYXJzZUNhcmROYW1lKGNhcmQubmFtZSk7XG5cbiAgICAgICAgY29uc3QgbWFya3VwID0gYFxuICAgICAgICAgICAgPHRyIGNsYXNzPVwianMtLWNoZWNrbGlzdC1yb3cgJHtpc1Jvd0dyZXkoY3RyKX0gY2FyZC1jaGVja2xpc3RfX3JvdyBkYXRhLWNvbXBvbmVudD1cImNhcmQtdG9vbHRpcFwiIGRhdGEtY2FyZC1pbWc9JHtjaGVja0ZvckltZyhjYXJkKX0+XG4gICAgICAgICAgICAgICAgPHRkIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGEgY2FyZC1jaGVja2xpc3RfX2RhdGEtLXNldFwiPjxhIGhyZWY9XCIvY2FyZC8ke2NhcmQuc2V0fS8ke2NhcmROYW1lRm9yVXJsfVwiIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGEtbGluayBjYXJkLWNoZWNrbGlzdF9fZGF0YS1saW5rLS1jZW50ZXJcIj4ke2NhcmQuc2V0fTwvYT48L3RkPlxuICAgICAgICAgICAgICAgIDx0ZCBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhXCI+PGEgaHJlZj1cIi9jYXJkLyR7Y2FyZC5zZXR9LyR7Y2FyZE5hbWVGb3JVcmx9XCIgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YS1saW5rIGNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmstLXN0YXJ0XCI+JHtjYXJkLm5hbWV9PC9hPjwvdGQ+XG4gICAgICAgICAgICAgICAgPHRkIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGFcIj48YSBocmVmPVwiL2NhcmQvJHtjYXJkLnNldH0vJHtjYXJkTmFtZUZvclVybH1cIiBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmsgY2FyZC1jaGVja2xpc3RfX2RhdGEtbGluay0tY2VudGVyXCI+JHtnZW5lcmF0ZU1hbmFDb3N0SW1hZ2VzKGNoZWNrRm9yTWFuYUNvc3QoY2FyZCkpfTwvYT48L3RkPlxuICAgICAgICAgICAgICAgIDx0ZCBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhXCI+PGEgaHJlZj1cIi9jYXJkLyR7Y2FyZC5zZXR9LyR7Y2FyZE5hbWVGb3JVcmx9XCIgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YS1saW5rIGNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmstLWNlbnRlclwiPiR7c2hvcnRlblR5cGVMaW5lKGNhcmQudHlwZV9saW5lKX08L2E+PC90ZD5cbiAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YSBjYXJkLWNoZWNrbGlzdF9fZGF0YS0tcmFyaXR5XCI+PGEgaHJlZj1cIi9jYXJkLyR7Y2FyZC5zZXR9LyR7Y2FyZE5hbWVGb3JVcmx9XCIgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YS1saW5rIGNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmstLWNlbnRlclwiPiR7Y2FyZC5yYXJpdHl9PC9hPjwvdGQ+XG4gICAgICAgICAgICAgICAgPHRkIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGFcIj48YSBocmVmPVwiL2NhcmQvJHtjYXJkLnNldH0vJHtjYXJkTmFtZUZvclVybH1cIiBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmsgY2FyZC1jaGVja2xpc3RfX2RhdGEtbGluay0tY2VudGVyXCI+JHtjYXJkLmFydGlzdH08L2E+PC90ZD5cbiAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YVwiPjxhIGhyZWY9XCIvY2FyZC8ke2NhcmQuc2V0fS8ke2NhcmROYW1lRm9yVXJsfVwiIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGEtbGluayBjYXJkLWNoZWNrbGlzdF9fZGF0YS1saW5rLS1jZW50ZXJcIj4ke2NhcmQucHJpY2VzLnVzZH08L2E+PC90ZD5cbiAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICBgXG4gICAgICAgIC8vIFB1dCB0aGUgcm93IGluIHRoZSB0YWJsZVxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWNhcmQtY2hlY2tsaXN0LWJvZHknKS5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWVuZCcsIG1hcmt1cCk7XG5cbiAgICAgICAgLy8gSW5jcmVtZW50IHRoZSBjdHJcbiAgICAgICAgY3RyICsrO1xuICAgIH0pXG59XG5cbmNvbnN0IGNoZWNrRm9yTWFuYUNvc3QgPSBjYXJkID0+IHtcbiAgICBpZiAoY2FyZC5tYW5hX2Nvc3QpIHtcbiAgICAgICAgcmV0dXJuIGNhcmQubWFuYV9jb3N0O1xuICAgIH0gZWxzZSBpZiAoY2FyZC5jYXJkX2ZhY2VzKSB7XG4gICAgICAgIHJldHVybiBjYXJkLmNhcmRfZmFjZXNbMF0ubWFuYV9jb3N0O1xuICAgIH1cbn1cblxuY29uc3QgY2hlY2tGb3JJbWcgPSBjYXJkID0+IHtcbiAgICBpZiAoY2FyZC5pbWFnZV91cmlzKSByZXR1cm4gY2FyZC5pbWFnZV91cmlzLm5vcm1hbDtcblxuICAgIC8vIElmIHRoZXJlIGlzIG5vIGNhcmQuaW1hZ2VfdXJpcywgdGhlbiBpdCdzIGEgZG91YmxlIHNpZGVkIGNhcmQuIEluIHRoaXNcbiAgICAvLyBjYXNlIHdlIHdhbnQgdG8gZGlzcGxheSB0aGUgaW1hZ2UgZnJvbSBmYWNlIG9uZSBvZiB0aGUgY2FyZC5cbiAgICBlbHNlIHJldHVybiBjYXJkLmNhcmRfZmFjZXNbMF0uaW1hZ2VfdXJpcy5ub3JtYWw7XG59XG5cblxuLy8gQ3JlYXRlIHRoZSBob3ZlciBlZmZlY3Qgb24gZWFjaCByb3cgdGhhdCBkaXNwbGF5cyB0aGUgaW1hZ2Ugb2YgdGhlIGNhcmRcbmNvbnN0IGNoZWNrTGlzdEhvdmVyRXZlbnRzID0gKCkgPT4ge1xuICAgIC8vIEdldCB0aGUgSFRNTCBmb3IgZWFjaCB0YWJsZSByb3dcbiAgICBjb25zdCByb3dzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWNoZWNrbGlzdC1yb3cnKSk7XG4gXG4gICAgcm93cy5mb3JFYWNoKHJvdyA9PiB7XG4gICAgICAgIHJvdy5vbm1vdXNlbW92ZSA9IGUgPT4ge1xuICAgICAgICAgICAgLy8gSWYgdGhlIHdpbmRvdyBpcyBzbWFsbGVyIHRoYW4gNzY4IHBpeGVscywgZG9uJ3QgZGlzcGxheSBhbnkgaW1hZ2VzXG4gICAgICAgICAgICBpZiAod2luZG93LmlubmVyV2lkdGggPCA3NjgpIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgLy8gSWYgdGhlcmUgaXMgYWxyZWFkeSBhbiBpbWFnZSBiZWluZyBkaXNwbGF5ZWQsIHJlbW92ZSBpdCBmcm9tIHRoZSBET01cbiAgICAgICAgICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudG9vbHRpcCcpKSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudG9vbHRpcCcpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUHJlcCB0aGUgZGl2LlxuICAgICAgICAgICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBkaXYuY2xhc3NOYW1lID0gJ3Rvb2x0aXAnO1xuXG4gICAgICAgICAgICAvLyBUaGUgZGl2IGlzIHN0eWxlZCB3aXRoIHBvc2l0aW9uIGFic29sdXRlLiBUaGlzIGNvZGUgcHV0cyBpdCBqdXN0IHRvIHRoZSByaWdodCBvZiB0aGUgY3Vyc29yXG4gICAgICAgICAgICBkaXYuc3R5bGUubGVmdCA9IGUucGFnZVggKyA1MCArICdweCc7XG4gICAgICAgICAgICBkaXYuc3R5bGUudG9wID0gZS5wYWdlWSAtIDMwICsgJ3B4JztcblxuICAgICAgICAgICAgLy8gUHJlcCB0aGUgaW1nIGVsZW1lbnRcbiAgICAgICAgICAgIGNvbnN0IGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuICAgICAgICAgICAgaW1nLmNsYXNzTmFtZSA9ICd0b29sdGlwX19pbWcnO1xuICAgICAgICAgICAgaW1nLnNyYyA9IHJvdy5kYXRhc2V0LmNhcmRJbWc7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFB1dCB0aGUgaW1nIGludG8gdGhlIGRpdiBhbmQgdGhlbiBhcHBlbmQgdGhlIGRpdiBkaXJlY3RseSB0byB0aGUgYm9keSBvZiB0aGUgZG9jdW1lbnQuXG4gICAgICAgICAgICBkaXYuYXBwZW5kQ2hpbGQoaW1nKTsgXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpdik7ICBcbiAgICAgICAgICAgIH1cblxuICAgICAgICAvLyBSZW1vdmUgdGhlIGltZyB3aGVuIHRha2luZyB0aGUgY3Vyc29yIG9mZiB0aGUgcm93XG4gICAgICAgIHJvdy5vbm1vdXNlb3V0ID0gZSA9PiB7XG4gICAgICAgICAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRvb2x0aXAnKSkge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRvb2x0aXAnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KVxufVxuXG5cbi8vIEZ1bmNpdG9uIHRvIGJlIHVzZWQgaW4gaW5kZXguanMuIFRha2VzIGNhcmUgb2YgYWxsIG5lY2Vzc2FyeSBzdGVwcyB0byBkaXNwbGF5IGNhcmRzIGFzIGEgY2hlY2tsaXN0XG5leHBvcnQgY29uc3QgZGlzcGxheUNoZWNrbGlzdCA9IGNhcmRzID0+IHtcbiAgICBjbGVhclJlc3VsdHMoKTtcbiAgICBwcmVwQ2hlY2tsaXN0Q29udGFpbmVyKCk7XG4gICAgZ2VuZXJhdGVDaGVja2xpc3QoY2FyZHMpO1xuICAgIGNoZWNrTGlzdEhvdmVyRXZlbnRzKCk7XG59XG5cblxuZXhwb3J0IGNvbnN0IGNob3NlU2VsZWN0TWVudVNvcnQgPSAobWVudSwgc3RhdGUpID0+IHtcbiAgICAvLyBDcmVhdGUgYW4gYXJyYXkgZnJvbSB0aGUgSFRNTCBzZWxlY3QgbWVudVxuICAgIGNvbnN0IG9wdGlvbnMgPSBBcnJheS5mcm9tKG1lbnUpXG5cbiAgICBvcHRpb25zLmZvckVhY2goKG9wdGlvbiwgaSkgPT4ge1xuICAgICAgICAvLyBJZiB0aGUgb3B0aW9uIHZhbHVlIG1hdGNoZXMgdGhlIHNvcnQgbWV0aG9kIGZyb20gdGhlIFVSTCwgc2V0IGl0IHRvIHRoZSBzZWxlY3RlZCBpdGVtXG4gICAgICAgIGlmIChvcHRpb24udmFsdWUgPT09IHN0YXRlLnNvcnRNZXRob2QpIG1lbnUuc2VsZWN0ZWRJbmRleCA9IGk7XG4gICAgfSlcbn1cblxuXG5leHBvcnQgY29uc3QgY2hvc2VTZWxlY3RNZW51RGlzcGxheSA9IChtZW51LCBzdGF0ZSkgPT4ge1xuICAgIC8vIENyZWF0ZSBhbiBhcnJheSBmcm9tIHRoZSBIVE1MIHNlbGVjdCBtZW51XG4gICAgY29uc3Qgb3B0aW9ucyA9IEFycmF5LmZyb20obWVudSlcblxuICAgIG9wdGlvbnMuZm9yRWFjaCgob3B0aW9uLCBpKSA9PiB7XG4gICAgICAgIC8vIElmIHRoZSBvcHRpb24gdmFsdWUgbWF0Y2hlcyB0aGUgc29ydCBtZXRob2QgZnJvbSB0aGUgVVJMLCBzZXQgaXQgdG8gdGhlIHNlbGVjdGVkIGl0ZW1cbiAgICAgICAgaWYgKG9wdGlvbi52YWx1ZSA9PT0gc3RhdGUuZGlzcGxheSkgbWVudS5zZWxlY3RlZEluZGV4ID0gaTtcbiAgICB9KVxufVxuXG5cbi8vIEZ1bmN0aW9uIHRvIGNoYW5nZSB0aGUgc29ydCBtZXRob2QgYmFzZWQgb24gdGhlIGlucHV0IGZyb20gdGhlIHVzZXJcbmV4cG9ydCBjb25zdCBjaGFuZ2VTb3J0TWV0aG9kID0gc3RhdGUgPT4ge1xuICAgIC8vIEdldCB0aGUgY3VycmVudCBzb3J0IG1ldGhvZCBmcm9tIHRoZSBlbmQgb2YgdGhlIFVSTFxuICAgIGNvbnN0IGN1cnJlbnRTb3J0TWV0aG9kID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnN1YnN0cmluZyhcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLmxhc3RJbmRleE9mKCc9JykgKyAxXG4gICAgKTsgICAgXG5cbiAgICAvLyBHcmFiIHRoZSBkZXNpcmVkIHNvcnQgbWV0aG9kIGZyb20gdGhlIHVzZXJcbiAgICBjb25zdCBuZXdTb3J0TWV0aG9kID0gZWxlbWVudHMucmVzdWx0c1BhZ2Uuc29ydEJ5LnZhbHVlO1xuXG4gICAgLy8gSWYgdGhlIG5ldyBzb3J0IG1ldGhvZCBpcyBub3QgZGlmZmVyZW50LCBleGl0IHRoZSBmdW5jdGlvbiBhcyB0byBub3QgcHVzaCBhIG5ldyBzdGF0ZVxuICAgIGlmIChjdXJyZW50U29ydE1ldGhvZCA9PT0gbmV3U29ydE1ldGhvZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfSBlbHNlIHsgICAgICAgIFxuICAgICAgICAvLyBEaXNhYmxlIGFsbCBmb3VyIGJ1dHRvbnNcbiAgICAgICAgLy8gT25seSBkb2luZyB0aGlzIGJlY2F1c2UgZmlyZWZveCByZXF1aXJlcyBhIGN0cmwgZjVcbiAgICAgICAgZGlzYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5maXJzdFBhZ2VCdG4pO1xuICAgICAgICBkaXNhYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLm5leHRQYWdlQnRuKTtcbiAgICAgICAgZGlzYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5wcmV2aW91c1BhZ2VCdG4pO1xuICAgICAgICBkaXNhYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLmxhc3RQYWdlQnRuKTtcblxuICAgICAgICBjb25zdCBjdXJyZW50UGF0aE5hbWUgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3Vic3RyaW5nKFxuICAgICAgICAgICAgMCwgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLmxhc3RJbmRleE9mKCc9JykgKyAxXG4gICAgICAgICk7XG5cbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBjdXJyZW50UGF0aE5hbWUgKyBuZXdTb3J0TWV0aG9kOyAgICAgICAgICAgICAgICBcbiAgICB9XG59XG5cblxuZXhwb3J0IGNvbnN0IGNoYW5nZURpc3BsYXlBbmRVcmwgPSBzdGF0ZSA9PiB7XG4gICAgY29uc3QgY3VycmVudE1ldGhvZCA9IHN0YXRlLmRpc3BsYXk7XG4gICAgY29uc3QgbmV3TWV0aG9kID0gZWxlbWVudHMucmVzdWx0c1BhZ2UuZGlzcGxheVNlbGVjdG9yLnZhbHVlO1xuXG4gICAgaWYgKG5ld01ldGhvZCA9PT0gY3VycmVudE1ldGhvZCkgcmV0dXJuO1xuXG4gICAgLy8gVXBkYXRlIHRoZSBzdGF0ZSB3aXRoIG5ldyBkaXNwbGF5IG1ldGhvZFxuICAgIHN0YXRlLmRpc3BsYXkgPSBuZXdNZXRob2Q7XG5cbiAgICAvLyBVcGRhdGUgdGhlIHVybCB3aXRob3V0IHB1c2hpbmcgdG8gdGhlIHNlcnZlclxuICAgIGNvbnN0IHRpdGxlID0gZG9jdW1lbnQudGl0bGU7XG4gICAgY29uc3QgcGF0aE5hbWUgPSBgL3Jlc3VsdHMvJHtuZXdNZXRob2R9LyR7c3RhdGUucXVlcnl9YFxuICAgIGhpc3RvcnkucHVzaFN0YXRlKHtcbiAgICAgICAgY3VycmVudEluZGV4OiBzdGF0ZS5jdXJyZW50SW5kZXgsXG4gICAgICAgIGRpc3BsYXk6IHN0YXRlLmRpc3BsYXksXG4gICAgfSwgdGl0bGUsIHBhdGhOYW1lKTtcblxufVxuXG5cbmV4cG9ydCBjb25zdCB1cGRhdGVEaXNwbGF5ID0gc3RhdGUgPT4ge1xuICAgIC8vIENsZWFyIGFueSBleGlzdGluZyBIVE1MIGluIHRoZSBkaXNwbGF5XG4gICAgY2xlYXJSZXN1bHRzKCk7XG5cbiAgICAvLyBSZWZyZXNoIHRoZSBkaXNwbGF5XG4gICAgaWYgKHN0YXRlLmRpc3BsYXkgPT09ICdsaXN0JykgZGlzcGxheUNoZWNrbGlzdChzdGF0ZS5hbGxDYXJkc1tzdGF0ZS5jdXJyZW50SW5kZXhdKTtcbiAgICBpZiAoc3RhdGUuZGlzcGxheSA9PT0gJ2ltYWdlcycpIGRpc3BhbHlJbWFnZXMoc3RhdGUuYWxsQ2FyZHNbc3RhdGUuY3VycmVudEluZGV4XSk7XG59XG5cblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKiogUEFHSU5BVElPTiAqKioqKioqKioqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuXG4vLyBXaWxsIGJlIGNhbGxlZCBkdXJpbmcgY2hhbmdpbmcgcGFnZXMuIFJlbW92ZXMgdGhlIGN1cnJlbnQgZWxlbWVudCBpbiB0aGUgYmFyXG5jb25zdCBjbGVhckRpc3BsYXlCYXIgPSAoKSA9PiB7XG4gICAgY29uc3QgZGlzcGxheUJhclRleHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWRpc3BsYXktYmFyLXRleHQnKVxuICAgIGlmIChkaXNwbGF5QmFyVGV4dCkgZGlzcGxheUJhclRleHQucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChkaXNwbGF5QmFyVGV4dCk7XG59ICAgIFxuXG5cbi8vIEtlZXBzIHRyYWNrIG9mIHdoZXJlIHRoZSB1c2VyIGlzIGluIHRoZXJlIGxpc3Qgb2YgY2FyZHNcbmNvbnN0IHBhZ2luYXRpb25UcmFja2VyID0gc3RhdGUgPT4ge1xuICAgIHZhciBiZWcsIGVuZDtcbiAgICBiZWcgPSAoKHN0YXRlLmN1cnJlbnRJbmRleCArIDEpICogMTc1KSAtIDE3NDsgXG4gICAgZW5kID0gKChzdGF0ZS5jdXJyZW50SW5kZXgpICogMTc1KSArIHN0YXRlLmFsbENhcmRzW3N0YXRlLmN1cnJlbnRJbmRleF0ubGVuZ3RoXG5cbiAgICByZXR1cm4geyBiZWcsIGVuZCB9O1xufVxuXG5cbmV4cG9ydCBjb25zdCB1cGRhdGVEaXNwbGF5QmFyID0gc3RhdGUgPT4ge1xuICAgIGNvbnN0IG1hcmt1cCA9IGBcbiAgICAgICAgPHAgY2xhc3M9XCJhcGktcmVzdWx0cy1kaXNwbGF5X19kaXNwbGF5LWJhci10ZXh0IGpzLS1kaXNwbGF5LWJhci10ZXh0XCI+XG4gICAgICAgICAgICBEaXNwbGF5aW5nICR7cGFnaW5hdGlvblRyYWNrZXIoc3RhdGUpLmJlZ30gLSAke3BhZ2luYXRpb25UcmFja2VyKHN0YXRlKS5lbmR9IG9mICR7c3RhdGUuc2VhcmNoLnJlc3VsdHMudG90YWxfY2FyZHN9IGNhcmRzXG4gICAgICAgIDwvcD5cbiAgICBgXG5cbiAgICBjbGVhckRpc3BsYXlCYXIoKTtcbiAgICBlbGVtZW50cy5yZXN1bHRzUGFnZS5kaXNwbGF5QmFyLmluc2VydEFkamFjZW50SFRNTCgnYmVmb3JlZW5kJywgbWFya3VwKTtcbn1cblxuXG5leHBvcnQgY29uc3QgZW5hYmxlQnRuID0gYnRuID0+IHtcbiAgICBpZiAoYnRuLmRpc2FibGVkKSB7XG4gICAgICAgIGJ0bi5jbGFzc0xpc3QucmVtb3ZlKCdhcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtcGFnaW5hdGlvbi1jb250YWluZXItLWRpc2FibGVkJyk7XG4gICAgICAgIGJ0bi5kaXNhYmxlZCA9IGZhbHNlO1xuICAgIH1cbn1cblxuXG5leHBvcnQgY29uc3QgZGlzYWJsZUJ0biA9IGJ0biA9PiB7XG4gICAgaWYgKCFidG4uZGlzYWJsZWQpIHtcbiAgICAgICAgYnRuLmNsYXNzTGlzdC5hZGQoJ2FwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1wYWdpbmF0aW9uLWNvbnRhaW5lci0tZGlzYWJsZWQnKTtcbiAgICAgICAgYnRuLmRpc2FibGVkID0gdHJ1ZTtcbiAgICB9XG59XG5cblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKioqKioqKiogNDA0ICoqKioqKioqKioqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuXG5leHBvcnQgY29uc3QgZGlzcGxheTQwNCA9ICgpID0+IHtcbiAgICBjb25zdCBkaXYgPSBjcmVhdGU0MDRNZXNzYWdlKCk7XG4gICAgZWxlbWVudHMucmVzdWx0c1BhZ2UucmVzdWx0c0NvbnRhaW5lci5hcHBlbmRDaGlsZChkaXYpO1xufVxuXG5jb25zdCBjcmVhdGU0MDREaXYgPSAoKSA9PiB7XG4gICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZGl2LmNsYXNzTGlzdCA9IGBuby1yZXN1bHRzYFxuICAgIHJldHVybiBkaXY7XG59XG5cbmNvbnN0IGNyZWF0ZTQwNGgzID0gKCkgPT4ge1xuICAgIGNvbnN0IGgzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDMnKTtcbiAgICBoMy5jbGFzc0xpc3QgPSBgbm8tcmVzdWx0c19faDNgO1xuICAgIGgzLmlubmVySFRNTCA9IGBObyBjYXJkcyBmb3VuZGA7XG4gICAgcmV0dXJuIGgzO1xufVxuXG5jb25zdCBjcmVhdGU0MDRwRWxlbWVudCA9ICgpID0+IHtcbiAgICBjb25zdCBwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xuICAgIHAuY2xhc3NMaXN0ID0gYG5vLXJlc3VsdHNfX3BgXG4gICAgcC5pbm5lckhUTUwgPSAnWW91ciBzZWFyY2ggZGlkblxcJ3QgbWF0Y2ggYW55IGNhcmRzLiBHbyBiYWNrIHRvIHRoZSBzZWFyY2ggcGFnZSBhbmQgZWRpdCB5b3VyIHNlYXJjaCc7XG4gICAgcmV0dXJuIHA7ICAgIFxufVxuXG5jb25zdCBjcmVhdGU0MDRCdG4gPSAoKSA9PiB7XG4gICAgY29uc3QgYnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgIGJ0bi5jbGFzc0xpc3QgPSBgYnRuIG5vLXJlc3VsdHNfX2J0bmBcbiAgICBidG4uaHJlZiA9ICcvc2VhcmNoJztcbiAgICBidG4uaW5uZXJIVE1MID0gJ0dvIEJhY2snO1xuICAgIHJldHVybiBidG47XG59XG5cbmNvbnN0IGNyZWF0ZTQwNE1lc3NhZ2UgPSAoKSA9PiB7XG4gICAgY29uc3QgZGl2ID0gY3JlYXRlNDA0RGl2KCk7XG4gICAgY29uc3QgaDMgPSBjcmVhdGU0MDRoMygpO1xuICAgIGNvbnN0IHAgPSBjcmVhdGU0MDRwRWxlbWVudCgpO1xuICAgIGNvbnN0IGJ0biA9IGNyZWF0ZTQwNEJ0bigpO1xuXG4gICAgZGl2LmFwcGVuZENoaWxkKGgzKTtcbiAgICBkaXYuYXBwZW5kQ2hpbGQocCk7XG4gICAgZGl2LmFwcGVuZENoaWxkKGJ0bik7XG5cbiAgICByZXR1cm4gZGl2O1xufVxuIiwiaW1wb3J0IHsgZWxlbWVudHMgfSBmcm9tICcuL2Jhc2UnO1xuXG5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKiBUWVBFIExJTkUgKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcblxuZXhwb3J0IGNvbnN0IHNob3dUeXBlc0Ryb3BEb3duID0gKCkgPT4ge1xuICAgIGlmIChlbGVtZW50cy5hcGlTZWFyY2gudHlwZURyb3BEb3duLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIHsgICAgICAgICAgICBcbiAgICAgICAgZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVEcm9wRG93bi5yZW1vdmVBdHRyaWJ1dGUoJ2hpZGRlbicpO1xuICAgICAgICBlbGVtZW50cy5hcGlTZWFyY2gudHlwZURyb3BEb3duLnNjcm9sbFRvcCA9IDA7XG5cbiAgICAgICAgLy8gTWFrZSBzdXJlIHRvIGRpc3BsYXkgYWxsIHR5cGVzIHdoZW4gb3BlbmluZyB0aGUgZHJvcGRvd24gYW5kIGJlZm9yZSB0YWtpbmcgaW5wdXRcbiAgICAgICAgZmlsdGVyVHlwZXMoJycpO1xuICAgICAgICBmaWx0ZXJTZWxlY3RlZFR5cGVzKCk7XG4gICAgICAgIGZpbHRlclR5cGVIZWFkZXJzKCk7XG4gICAgfVxufVxuXG5leHBvcnQgY29uc3QgaGlkZVR5cGVzRHJvcERvd24gPSAoKSA9PiB7XG4gICAgaWYgKCFlbGVtZW50cy5hcGlTZWFyY2gudHlwZURyb3BEb3duLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIHtcbiAgICAgICAgZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVMaW5lLnZhbHVlID0gJyc7XG4gICAgICAgIGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlRHJvcERvd24uc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpOyAgICAgICAgXG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBuYXZpZ2F0ZVR5cGVzRHJvcERvd24pO1xuICAgIH1cbn1cblxuZXhwb3J0IGNvbnN0IGZpbHRlclR5cGVIZWFkZXJzID0gKCkgPT4ge1xuICAgIC8vIE9uIGV2ZXJ5IGlucHV0IGludG8gdGhlIHR5cGVsaW5lIGJhciwgbWFrZSBhbGwgaGVhZGVycyB2aXNpYmxlXG4gICAgY29uc3QgaGVhZGVycyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS10eXBlcy1jYXRlZ29yeS1oZWFkZXInKSk7XG4gICAgaGVhZGVycy5mb3JFYWNoKGhlYWRlciA9PiB7XG4gICAgICAgIGlmIChoZWFkZXIuaGFzQXR0cmlidXRlKCdoaWRkZW4nKSkgaGVhZGVyLnJlbW92ZUF0dHJpYnV0ZSgnaGlkZGVuJylcbiAgICB9KVxuXG4gICAgLy8gRm9yIGVhY2ggY2F0ZWdvcnkgb2YgdHlwZSwgaWYgdGhlcmUgYXJlIG5vdCBhbnkgdmlzaWJsZSBiZWNhdXNlIHRoZXkgd2VyZSBmaWx0ZXJlZCBvdXRcbiAgICAvLyBoaWRlIHRoZSBoZWFkZXIgZm9yIHRoYXQgY2F0ZWdvcnkgICAgXG4gICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWJhc2ljOm5vdChbaGlkZGVuXSknKSkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWJhc2ljLWhlYWRlcicpLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICB9XG5cbiAgICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tc3VwZXI6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tc3VwZXItaGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cblxuICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcnRpZmFjdDpub3QoW2hpZGRlbl0pJykpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcnRpZmFjdC1oZWFkZXInKS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gICAgfVxuXG4gICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWVuY2hhbnRtZW50Om5vdChbaGlkZGVuXSknKSkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWVuY2hhbnRtZW50LWhlYWRlcicpLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICB9XG5cbiAgICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tbGFuZDpub3QoW2hpZGRlbl0pJykpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1sYW5kLWhlYWRlcicpLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICB9XG5cbiAgICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tc3BlbGw6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tc3BlbGwtaGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cblxuICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1wbGFuZXN3YWxrZXI6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tcGxhbmVzd2Fsa2VyLWhlYWRlcicpLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICB9XG5cbiAgICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tY3JlYXR1cmU6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tY3JlYXR1cmUtaGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cbn07XG5cbmNvbnN0IGZpbHRlclNlbGVjdGVkVHlwZXMgPSAoKSA9PiB7XG4gICAgY29uc3QgdHlwZXMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICdbZGF0YS10eXBlXVtkYXRhLXNlbGVjdGVkXSdcbiAgICApKTtcblxuICAgIHR5cGVzLmZvckVhY2godHlwZSA9PiB7XG4gICAgICAgIGlmICh0eXBlLmdldEF0dHJpYnV0ZSgnZGF0YS1zZWxlY3RlZCcpID09PSAndHJ1ZScpIHtcbiAgICAgICAgICAgIGlmICghdHlwZS5oYXNBdHRyaWJ1dGUoJ2hpZGRlbicpKSB0eXBlLnNldEF0dHJpYnV0ZShcbiAgICAgICAgICAgICAgICAnaGlkZGVuJywgJ3RydWUnXG4gICAgICAgICAgICApXG4gICAgICAgIH1cbiAgICB9KVxufTtcblxuZXhwb3J0IGNvbnN0IGZpbHRlclR5cGVzID0gc3RyID0+IHtcbiAgICBjb25zdCB0eXBlcyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtdHlwZV0nKSk7XG5cbiAgICAvLyBSZW1vdmUgdGhlIGhpZGRlbiBhdHRyaWJ1dGUgaWYgaXQgZXhpc3RzIG9uIGFueSBlbGVtZW50LCBhbmQgdGhlbiBoaWRlIGFueSBlbGVtZW50c1xuICAgIC8vIHRoYXQgZG9uJ3QgaW5jbHVkZSB0aGUgc3RyaW5nIGdpdmVuIGluIHRoZSBpbnB1dCBmcm9tIHRoZSB1c2VyXG4gICAgdHlwZXMuZm9yRWFjaCh0eXBlID0+IHtcbiAgICAgICAgaWYgKHR5cGUuaGFzQXR0cmlidXRlKCdoaWRkZW4nKSkgdHlwZS5yZW1vdmVBdHRyaWJ1dGUoJ2hpZGRlbicpO1xuICAgICAgICBpZiAoIXR5cGUuZ2V0QXR0cmlidXRlKCdkYXRhLXR5cGUnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHN0ci50b0xvd2VyQ2FzZSgpKSkge1xuICAgICAgICAgICAgdHlwZS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gICAgICAgIH1cbiAgICB9KSAgICBcblxuICAgIGZpbHRlclNlbGVjdGVkVHlwZXMoKTtcbn1cblxuY29uc3QgaGlnaGxpZ2h0VHlwZSA9IHR5cGUgPT4ge1xuICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWhpZ2hsaWdodGVkJykpIHJlbW92ZUN1cnJlbnRIaWdobGlnaHQoKTtcblxuICAgIGlmICh0eXBlKSB7XG4gICAgICAgIHR5cGUuY2xhc3NMaXN0LmFkZChcbiAgICAgICAgICAgICdqcy0taGlnaGxpZ2h0ZWQnLCAnc2VhcmNoLWZvcm1fX2Ryb3Bkb3duLWxpc3Qtb3B0aW9uLS1oaWdobGlnaHRlZCdcbiAgICAgICAgKTtcbiAgICB9XG59O1xuXG5jb25zdCByZW1vdmVDdXJyZW50SGlnaGxpZ2h0ID0gKCkgPT4ge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taGlnaGxpZ2h0ZWQnKS5jbGFzc0xpc3QucmVtb3ZlKFxuICAgICAgICAnanMtLWhpZ2hsaWdodGVkJywgJ3NlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0LW9wdGlvbi0taGlnaGxpZ2h0ZWQnXG4gICAgKTtcbn07XG5cbmNvbnN0IHNldFNjcm9sbFRvcE9uRG93bkFycm93ID0gKGVsLCBkcm9wZG93bikgPT4ge1xuICAgIGlmIChlbC5vZmZzZXRUb3AgPiBkcm9wZG93bi5vZmZzZXRIZWlnaHQgLSBlbC5vZmZzZXRIZWlnaHQgJiZcbiAgICAgIGRyb3Bkb3duLnNjcm9sbFRvcCArIGRyb3Bkb3duLm9mZnNldEhlaWdodCAtIGVsLm9mZnNldEhlaWdodCA8IGVsLm9mZnNldFRvcCkge1xuICAgICAgICBkcm9wZG93bi5zY3JvbGxUb3AgPSBlbC5vZmZzZXRUb3AgLSBcbiAgICAgICAgICBkcm9wZG93bi5vZmZzZXRIZWlnaHQgKyBlbC5vZmZzZXRIZWlnaHQ7XG4gICAgfVxufVxuXG5jb25zdCBzZXRTY3JvbGxUb3BPblVwQXJyb3cgPSAoZWwsIGRyb3Bkb3duKSA9PiB7XG4gICAgaWYgKGVsLm9mZnNldFRvcCA8IGRyb3Bkb3duLnNjcm9sbFRvcCkge1xuICAgICAgICBkcm9wZG93bi5zY3JvbGxUb3AgPSBlbC5vZmZzZXRUb3A7XG5cbiAgICAgICAgLy8gMzAgaXMgdGhlIGhlaWdodCBvZiBjYXRlZ29yeSBoZWFkZXJzLiBJZiB0aGUgY2F0ZWdvcnkgaGVhZGVyIGlzIFxuICAgICAgICAvLyB0aGUgb25seSBlbGVtZW50IGxlZnQgdGhhdCBpcyBub3QgcmV2ZWFsZWQsIHNldCB0ZWggc2Nyb2xsIHRvcCB0byAwXG4gICAgICAgIGlmIChkcm9wZG93bi5zY3JvbGxUb3AgPD0gMzApIGRyb3Bkb3duLnNjcm9sbFRvcCA9IDA7XG4gICAgfVxufVxuXG5jb25zdCBuYXZpZ2F0ZVR5cGVzRHJvcERvd24gPSBlID0+IHtcbiAgICBjb25zdCB0eXBlcyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS10eXBlOm5vdChbaGlkZGVuXSknKSk7XG4gICAgY29uc3QgaSA9IHR5cGVzLmluZGV4T2YoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1oaWdobGlnaHRlZCcpKTtcblxuICAgIGlmIChlLmNvZGUgPT09ICdBcnJvd0Rvd24nICYmIGkgPCB0eXBlcy5sZW5ndGggLSAxKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgcmVtb3ZlQ3VycmVudEhpZ2hsaWdodCgpO1xuICAgICAgICBoaWdobGlnaHRUeXBlKHR5cGVzW2kgKyAxXSk7XG5cbiAgICAgICAgc2V0U2Nyb2xsVG9wT25Eb3duQXJyb3codHlwZXNbaSArIDFdLCBlbGVtZW50cy5hcGlTZWFyY2gudHlwZURyb3BEb3duKTtcbiAgICB9XG5cbiAgICBpZiAoZS5jb2RlID09PSAnQXJyb3dVcCcpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBcbiAgICAgICAgLy8gV2UgYWx3YXlzIHdhbnQgdG8gcHJldmVudCB0aGUgZGVmYXVsdC4gV2Ugb25seSB3YW50IHRvIGNoYW5nZSB0aGVcbiAgICAgICAgLy8gaGlnaGxpZ2h0IGlmIG5vdCBvbiB0aGUgdG9wIHR5cGUgaW4gdGhlIGRyb3Bkb3duXG4gICAgICAgIGlmIChpID4gMCkge1xuICAgICAgICAgICAgcmVtb3ZlQ3VycmVudEhpZ2hsaWdodCgpXG4gICAgICAgICAgICBoaWdobGlnaHRUeXBlKHR5cGVzW2kgLSAxXSk7XG4gICAgXG4gICAgICAgICAgICBzZXRTY3JvbGxUb3BPblVwQXJyb3coXG4gICAgICAgICAgICAgICAgdHlwZXNbaSAtIDFdLCBlbGVtZW50cy5hcGlTZWFyY2gudHlwZURyb3BEb3duXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGUuY29kZSA9PT0gJ0VudGVyJykge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgdG9nZ2xlRGF0YVNlbGVjdGVkKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taGlnaGxpZ2h0ZWQnKSk7XG4gICAgICAgIGFkZFR5cGUoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1oaWdobGlnaHRlZCcpLmdldEF0dHJpYnV0ZSgnZGF0YS10eXBlJykpO1xuICAgICAgICBoaWRlVHlwZXNEcm9wRG93bigpO1xuICAgIH1cbn1cblxuY29uc3QgaG92ZXJPdmVyVHlwZXNMaXN0ZW5lciA9ICgpID0+IHtcbiAgICBjb25zdCB0eXBlcyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS10eXBlOm5vdChbaGlkZGVuXSknKSk7XG5cbiAgICB0eXBlcy5mb3JFYWNoKHR5cGUgPT4ge1xuICAgICAgICB0eXBlLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCAoKSA9PiBoaWdobGlnaHRUeXBlKHR5cGUpKTtcbiAgICB9KVxufVxuXG5leHBvcnQgY29uc3Qgc3RhcnRUeXBlc0Ryb3BEb3duTmF2aWdhdGlvbiA9ICgpID0+IHtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgbmF2aWdhdGVUeXBlc0Ryb3BEb3duKTtcbiAgICBjb25zdCBmaXJzdFR5cGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXR5cGU6bm90KFtoaWRkZW5dKScpO1xuICAgIGhpZ2hsaWdodFR5cGUoZmlyc3RUeXBlKTtcbiAgICBob3Zlck92ZXJUeXBlc0xpc3RlbmVyKCk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG5hdmlnYXRlVHlwZXNEcm9wRG93bik7XG4gICAgZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVEcm9wRG93bi5zY3JvbGxUb3AgPSAwO1xufVxuXG5jb25zdCByZW1vdmVUeXBlQnRuID0gKCkgPT4ge1xuICAgIC8vIFNwYW4gd2lsbCBhY3QgYXMgdGhlIGJ1dHRvbiB0byByZW1vdmUgdHlwZXMgZnJvbSB0aGUgXCJzZWxlY3RlZFwiIGxpc3RcbiAgICBjb25zdCBidG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgYnRuLmNsYXNzTGlzdCA9ICdzZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtcmVtb3ZlLWJ0biBqcy0tYXBpLXR5cGVzLWNsb3NlLWJ0bic7XG4gICAgYnRuLmlubmVySFRNTCA9ICd4JztcblxuICAgIGJ0bi5vbmNsaWNrID0gKCkgPT4ge1xuICAgICAgICBjb25zdCB0eXBlTmFtZSA9IGJ0bi5uZXh0RWxlbWVudFNpYmxpbmcubmV4dEVsZW1lbnRTaWJsaW5nLmlubmVySFRNTDtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHR5cGVUb1RvZ2dsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLXR5cGV8PSR7dHlwZU5hbWV9XWApXG5cbiAgICAgICAgdG9nZ2xlRGF0YVNlbGVjdGVkKHR5cGVUb1RvZ2dsZSk7XG5cbiAgICAgICAgYnRuLnBhcmVudEVsZW1lbnQucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChidG4ucGFyZW50RWxlbWVudClcbiAgICB9XG5cbiAgICByZXR1cm4gYnRuO1xufVxuXG5jb25zdCB0eXBlVG9nZ2xlQnRuID0gKCkgPT4ge1xuICAgIC8vIFNwYW4gd2lsbCBhY3QgYXMgdGhlIGJ1dHRvbiB0byB0b2dnbGUgd2hldGhlciBvciBub3QgYSB0eXBlIGlzIGluY2x1ZGVkIG9yIGV4Y2x1ZGVkIGZyb20gdGhlIHNlYXJjaFxuICAgIGNvbnN0IGJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICBidG4uY2xhc3NMaXN0ID0gJ3NlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy10b2dnbGVyIHNlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy10b2dnbGVyLS1pcyBqcy0tYXBpLXR5cGVzLXRvZ2dsZXInO1xuICAgIGJ0bi5pbm5lckhUTUwgPSAnSVMnO1xuXG4gICAgLypcbiAgICAgICAgVGhpcyB3aWxsIHRvZ2dsZSBiZXR3ZWVuIHNlYXJjaGluZyBmb3IgY2FyZHMgdGhhdCBpbmNsdWRlIHRoZSBnaXZlbiB0eXBlIGFuZCBleGNsdWRlIHRoZSBnaXZlbiB0eXBlLlxuICAgICAgICBJdCB3aWxsIG1ha2Ugc3VyZSB0aGF0IHRoZSBhcHByb3ByaWF0ZSBkYXRhIHR5cGUgaXMgZ2l2ZW4gdG8gdGhlIHNwYW4gZWxlbWVudCB0aGF0IGNvbnRhaW5zIHRoZSB0eXBlXG4gICAgICAgIFNvIHRoYXQgdGhlIHNlYXJjaCBmdW5jdGlvbmFsaXR5IGNyZWF0ZXMgdGhlIGFwcHJvcHJpYXRlIHF1ZXJ5IHN0cmluZ1xuXG4gICAgKi9cbiAgICBidG4ub25jbGljayA9ICgpID0+IHtcbiAgICAgICAgaWYgKGJ0bi5pbm5lckhUTUwgPT09ICdJUycpIHtcbiAgICAgICAgICAgIGJ0bi5jbGFzc0xpc3QgPSAnc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLXRvZ2dsZXIgc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLXRvZ2dsZXItLW5vdCBqcy0tYXBpLXR5cGVzLXRvZ2dsZXInO1xuICAgICAgICAgICAgYnRuLm5leHRFbGVtZW50U2libGluZy5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtaW5jbHVkZS10eXBlJyk7XG4gICAgICAgICAgICBidG4ubmV4dEVsZW1lbnRTaWJsaW5nLnNldEF0dHJpYnV0ZSgnZGF0YS1leGNsdWRlLXR5cGUnLCBidG4ubmV4dEVsZW1lbnRTaWJsaW5nLmlubmVySFRNTCk7XG4gICAgICAgICAgICBidG4uaW5uZXJIVE1MID0gJ05PVCc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBidG4uY2xhc3NMaXN0ID0gJ3NlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy10b2dnbGVyIHNlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy10b2dnbGVyLS1pcyBqcy0tYXBpLXR5cGVzLXRvZ2dsZXInO1xuICAgICAgICAgICAgYnRuLm5leHRFbGVtZW50U2libGluZy5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtZXhjbHVkZS10eXBlJyk7XG4gICAgICAgICAgICBidG4ubmV4dEVsZW1lbnRTaWJsaW5nLnNldEF0dHJpYnV0ZSgnZGF0YS1pbmNsdWRlLXR5cGUnLCBidG4ubmV4dEVsZW1lbnRTaWJsaW5nLmlubmVySFRNTCk7XG4gICAgICAgICAgICBidG4uaW5uZXJIVE1MID0gJ0lTJztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBidG47XG59XG5cbmNvbnN0IHRvZ2dsZURhdGFTZWxlY3RlZCA9IHR5cGVPclNldCA9PiB7XG4gICAgaWYgKHR5cGVPclNldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2VsZWN0ZWQnKSA9PT0gJ3RydWUnKSB7XG4gICAgICAgIHR5cGVPclNldC5zZXRBdHRyaWJ1dGUoJ2RhdGEtc2VsZWN0ZWQnLCAnZmFsc2UnKVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHR5cGVPclNldC5zZXRBdHRyaWJ1dGUoJ2RhdGEtc2VsZWN0ZWQnLCAndHJ1ZScpXG4gICAgfVxuXG59XG5cbmNvbnN0IGFkZFR5cGUgPSB0eXBlID0+IHtcbiAgICAvLyBDcmVhdGUgdGhlIGVtcHR5IGxpIGVsZW1lbnQgdG8gaG9sZCB0aGUgdHlwZXMgdGhhdCB0aGUgdXNlciBzZWxlY3RzLiBTZXQgdGhlIGNsYXNzIGxpc3QsXG4gICAgLy8gYW5kIHRoZSBkYXRhLXNlbGVjdGVkIGF0dHJpYnV0ZSB0byB0cnVlLlxuICAgIGNvbnN0IGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICBsaS5jbGFzc0xpc3QgPSAnc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLWxpc3QtaXRlbSBqcy0tYXBpLXNlbGVjdGVkLXR5cGUnO1xuXG4gICAgLy8gVGhlIHR5cGVTcGFuIGhvbGRzIHRoZSB0eXBlIHNlbGVjdGVkIGJ5IHRoZSB1c2VyIGZyb20gdGhlIGRyb3Bkb3duLiBUaGUgZGF0YSBhdHRyaWJ1dGVcbiAgICAvLyBpcyB1c2VkIGluIFNlYXJjaC5qcyB0byBidWlsZCB0aGUgcXVlcnkgc3RyaW5nXG4gICAgY29uc3QgdHlwZVNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgdHlwZVNwYW4uc2V0QXR0cmlidXRlKCdkYXRhLWluY2x1ZGUtdHlwZScsIHR5cGUpO1xuICAgIHR5cGVTcGFuLmlubmVySFRNTCA9IHR5cGU7XG5cbiAgICAvLyBDb25zdHJ1Y3QgdGhlIGxpIGVsZW1lbnQuIFRoZSByZW1vdmVUeXBlQnRuIGFuZCB0eXBlVG9nZ2xlQnRuIGZ1bmNpdG9ucyByZXR1cm4gaHRtbCBlbGVtZW50c1xuICAgIGxpLmFwcGVuZENoaWxkKHJlbW92ZVR5cGVCdG4oKSk7XG4gICAgbGkuYXBwZW5kQ2hpbGQodHlwZVRvZ2dsZUJ0bigpKTtcbiAgICBsaS5hcHBlbmRDaGlsZCh0eXBlU3Bhbik7XG5cbiAgICBlbGVtZW50cy5hcGlTZWFyY2guc2VsZWN0ZWRUeXBlcy5hcHBlbmRDaGlsZChsaSk7XG59XG5cbmV4cG9ydCBjb25zdCB0eXBlTGluZUxpc3RlbmVyID0gZSA9PiB7XG4gICAgLy8gSWYgdGhlIHRhcmdldCBpcyBub3QgVHlwZSBMaW5lIGlucHV0IGxpbmUsIG9yIGFuIGVsZW1lbnQgaW4gdGhlIGRyb3Bkb3duIGxpc3QsIFxuICAgIC8vIGNsb3NlIHRoZSBkcm9wZG93biBhbmQgcmVtb3ZlIHRoZSBldmVudCBsaXN0ZW5lclxuICAgIGlmIChlLnRhcmdldCAhPT0gZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVMaW5lICYmICFlLnRhcmdldC5tYXRjaGVzKCcuanMtLWFwaS1kcm9wZG93bi10eXBlcy1saXN0JykpIHtcbiAgICAgICAgaGlkZVR5cGVzRHJvcERvd24oKTsgICAgIFxuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHR5cGVMaW5lTGlzdGVuZXIpICBcbiAgICAvLyBJZiB0aGUgdGFyZ2V0IGlzIG9uZSBpZiB0eXBlcywgZ2V0IHRoZSBkYXRhIHR5cGVcbiAgICB9IGVsc2UgaWYgKGUudGFyZ2V0Lmhhc0F0dHJpYnV0ZSgnZGF0YS10eXBlJykpIHtcbiAgICAgICAgdG9nZ2xlRGF0YVNlbGVjdGVkKGUudGFyZ2V0KTtcbiAgICAgICAgYWRkVHlwZShlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdHlwZScpKTtcbiAgICAgICAgZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVMaW5lLmZvY3VzKCk7XG4gICAgICAgIGhpZGVUeXBlc0Ryb3BEb3duKCk7XG5cbiAgICB9XG59XG5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKioqKiBTRVRTICoqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcblxuZXhwb3J0IGNvbnN0IHNob3dTZXRzRHJvcERvd24gPSAoKSA9PiB7XG4gICAgaWYgKGVsZW1lbnRzLmFwaVNlYXJjaC5zZXREcm9wRG93bi5oYXNBdHRyaWJ1dGUoJ2hpZGRlbicpKSB7XG4gICAgICAgIGVsZW1lbnRzLmFwaVNlYXJjaC5zZXREcm9wRG93bi5yZW1vdmVBdHRyaWJ1dGUoJ2hpZGRlbicpO1xuICAgICAgICBlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd24uc2Nyb2xsVG9wID0gMDtcblxuICAgICAgICBmaWx0ZXJTZXRzKCcnKTtcbiAgICAgICAgZmlsdGVyU2VsZWN0ZWRTZXRzKCk7XG4gICAgICAgIGZpbHRlclNldEhlYWRlcnMoKTtcbiAgICB9XG59XG5cbmNvbnN0IGhpZGVTZXRzRHJvcERvd24gPSAoKSA9PiB7XG4gICAgaWYgKCFlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd24uaGFzQXR0cmlidXRlKCdoaWRkZW4nKSkge1xuICAgICAgICBlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd24uc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgICAgICBlbGVtZW50cy5hcGlTZWFyY2guc2V0SW5wdXQudmFsdWUgPSAnJztcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG5hdmlnYXRlU2V0c0Ryb3BEb3duKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjb25zdCBmaWx0ZXJTZXRIZWFkZXJzID0gKCkgPT4ge1xuICAgIC8vIE9uIGV2ZXJ5IGlucHV0IGludG8gdGhlIHR5cGVsaW5lIGJhciwgbWFrZSBhbGwgaGVhZGVycyB2aXNpYmxlXG4gICAgY29uc3QgaGVhZGVycyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1zZXRzLWNhdGVnb3J5LWhlYWRlcicpKTtcbiAgICBoZWFkZXJzLmZvckVhY2goaGVhZGVyID0+IHtcbiAgICAgICAgaWYgKGhlYWRlci5oYXNBdHRyaWJ1dGUoJ2hpZGRlbicpKSBoZWFkZXIucmVtb3ZlQXR0cmlidXRlKCdoaWRkZW4nKVxuICAgIH0pXG5cbiAgICAvLyBGb3IgZWFjaCBjYXRlZ29yeSBvZiB0eXBlLCBpZiB0aGVyZSBhcmUgbm90IGFueSB2aXNpYmxlIGJlY2F1c2UgdGhleSB3ZXJlIGZpbHRlcmVkIG91dFxuICAgIC8vIGhpZGUgdGhlIGhlYWRlciBmb3IgdGhhdCBjYXRlZ29yeSAgICAgXG4gICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWV4cGFuc2lvbjpub3QoW2hpZGRlbl0pJykpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1leHBhbnNpb24taGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cblxuICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1jb3JlOm5vdChbaGlkZGVuXSknKSkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWNvcmUtaGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cblxuICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1tYXN0ZXJzOm5vdChbaGlkZGVuXSknKSkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLW1hc3RlcnMtaGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cblxuICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1kcmFmdDpub3QoW2hpZGRlbl0pJykpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1kcmFmdC1oZWFkZXInKS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gICAgfVxuXG4gICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWR1ZWxfZGVjazpub3QoW2hpZGRlbl0pJykpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1kdWVsX2RlY2staGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cblxuICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcmNoZW5lbXk6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXJjaGVuZW15LWhlYWRlcicpLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICB9XG5cbiAgICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYm94Om5vdChbaGlkZGVuXSknKSkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWJveC1oZWFkZXInKS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gICAgfVxuXG4gICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWNvbW1hbmRlcjpub3QoW2hpZGRlbl0pJykpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1jb21tYW5kZXItaGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cblxuICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS12YXVsdDpub3QoW2hpZGRlbl0pJykpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS12YXVsdC1oZWFkZXInKS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gICAgfVxuXG4gICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWZ1bm55Om5vdChbaGlkZGVuXSknKSkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWZ1bm55LWhlYWRlcicpLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICB9XG5cbiAgICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tbWFzdGVycGllY2U6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tbWFzdGVycGllY2UtaGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cblxuICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1tZW1vcmFiaWxpYTpub3QoW2hpZGRlbl0pJykpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1tZW1vcmFiaWxpYS1oZWFkZXInKS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gICAgfVxuXG4gICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXBsYW5lY2hhc2U6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tcGxhbmVjaGFzZS1oZWFkZXInKS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gICAgfVxuXG4gICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXByZW1pdW1fZGVjazpub3QoW2hpZGRlbl0pJykpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1wcmVtaXVtX2RlY2staGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cblxuICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1wcm9tbzpub3QoW2hpZGRlbl0pJykpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1wcm9tby1oZWFkZXInKS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gICAgfVxuXG4gICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXNwZWxsYm9vazpub3QoW2hpZGRlbl0pJykpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1zcGVsbGJvb2staGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cblxuICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1zdGFydGVyOm5vdChbaGlkZGVuXSknKSkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXN0YXJ0ZXItaGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cblxuICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS10b2tlbjpub3QoW2hpZGRlbl0pJykpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS10b2tlbi1oZWFkZXInKS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gICAgfVxuXG4gICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXRyZWFzdXJlX2NoZXN0Om5vdChbaGlkZGVuXSknKSkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXRyZWFzdXJlX2NoZXN0LWhlYWRlcicpLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICB9XG5cbiAgICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tdmFuZ3VhcmQ6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tdmFuZ3VhcmQtaGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNvbnN0IGZpbHRlclNldHMgPSBzdHIgPT4ge1xuICAgIC8vIGdldCBhbGwgb2YgdGhlIHNldHMgb3V0IG9mIHRoZSBkcm9wZG93biBsaXN0XG4gICAgY29uc3Qgc2V0cyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtc2V0LW5hbWVdJykpO1xuXG4gICAgLy8gUmVtb3ZlIHRoZSBoaWRkZW4gYXR0cmlidXRlIGlmIGl0IGV4aXN0cyBvbiBhbnkgZWxlbWVudCwgYW5kIHRoZW4gaGlkZSBhbnkgZWxlbWVudHNcbiAgICAvLyB0aGF0IGRvbid0IGluY2x1ZGUgdGhlIHN0cmluZyBnaXZlbiBpbiB0aGUgaW5wdXQgZnJvbSB0aGUgdXNlclxuICAgIHNldHMuZm9yRWFjaChzID0+IHsgICAgICAgIFxuICAgICAgICBpZiAocy5oYXNBdHRyaWJ1dGUoJ2hpZGRlbicpKSBzLnJlbW92ZUF0dHJpYnV0ZSgnaGlkZGVuJyk7XG5cbiAgICAgICAgZmlsdGVyU2VsZWN0ZWRTZXRzKCk7XG5cbiAgICAgICAgaWYgKCFzLmdldEF0dHJpYnV0ZSgnZGF0YS1zZXQtbmFtZScpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc3RyLnRvTG93ZXJDYXNlKCkpICYmXG4gICAgICAgICAgIXMuZ2V0QXR0cmlidXRlKCdkYXRhLXNldC1jb2RlJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzdHIudG9Mb3dlckNhc2UoKSkpIHsgICAgICAgICAgICBcbiAgICAgICAgICAgIHMuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgICAgICB9XG4gICAgfSlcbn1cblxuY29uc3QgZmlsdGVyU2VsZWN0ZWRTZXRzID0gKCkgPT4ge1xuICAgIGNvbnN0IHNldHMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLXNldC1uYW1lXVtkYXRhLXNlbGVjdGVkXScpKTtcblxuICAgIHNldHMuZm9yRWFjaChzID0+IHtcbiAgICAgICAgaWYgKHMuZ2V0QXR0cmlidXRlKCdkYXRhLXNlbGVjdGVkJykgPT09ICd0cnVlJykge1xuICAgICAgICAgICAgaWYgKCFzLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIHMuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgICAgICB9XG4gICAgfSlcbn1cblxuY29uc3QgaGlnaGxpZ2h0U2V0ID0gc2V0dCA9PiB7XG4gICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taGlnaGxpZ2h0ZWQnKSkgcmVtb3ZlQ3VycmVudEhpZ2hsaWdodCgpO1xuXG4gICAgaWYgKHNldHQpIHtcbiAgICAgICAgc2V0dC5jbGFzc0xpc3QuYWRkKFxuICAgICAgICAgICAgJ2pzLS1oaWdobGlnaHRlZCcsICdzZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1vcHRpb24tLWhpZ2hsaWdodGVkJ1xuICAgICAgICApO1xuICAgIH1cbn07XG5cbmNvbnN0IG5hdmlnYXRlU2V0c0Ryb3BEb3duID0gZSA9PiB7XG4gICAgY29uc3Qgc2V0cyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1zZXQ6bm90KFtoaWRkZW5dKScpKTtcbiAgICBjb25zdCBpID0gc2V0cy5pbmRleE9mKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taGlnaGxpZ2h0ZWQnKSk7XG5cbiAgICBpZiAoZS5jb2RlID09PSAnQXJyb3dEb3duJyAmJiBpIDwgc2V0cy5sZW5ndGggLSAxKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgcmVtb3ZlQ3VycmVudEhpZ2hsaWdodCgpXG4gICAgICAgIGhpZ2hsaWdodFNldChzZXRzW2kgKyAxXSk7XG5cbiAgICAgICAgc2V0U2Nyb2xsVG9wT25Eb3duQXJyb3coc2V0c1tpICsgMV0sIGVsZW1lbnRzLmFwaVNlYXJjaC5zZXREcm9wRG93bik7XG4gICAgfVxuXG4gICAgaWYgKGUuY29kZSA9PT0gJ0Fycm93VXAnICYmIGkgPiAwKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgcmVtb3ZlQ3VycmVudEhpZ2hsaWdodCgpXG4gICAgICAgIGhpZ2hsaWdodFNldChzZXRzW2kgLSAxXSk7XG5cbiAgICAgICAgc2V0U2Nyb2xsVG9wT25VcEFycm93KHNldHNbaSAtIDFdLCBlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd24pO1xuICAgIH1cblxuICAgIGlmIChlLmNvZGUgPT09ICdFbnRlcicpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIHRvZ2dsZURhdGFTZWxlY3RlZChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWhpZ2hsaWdodGVkJykpO1xuICAgICAgICBhZGRTZXQoXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWhpZ2hsaWdodGVkJykuZ2V0QXR0cmlidXRlKCdkYXRhLXNldC1uYW1lJyksXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWhpZ2hsaWdodGVkJykuZ2V0QXR0cmlidXRlKCdkYXRhLXNldC1jb2RlJylcbiAgICAgICAgKTtcbiAgICAgICAgaGlkZVNldHNEcm9wRG93bigpO1xuICAgIH1cbn07XG5cbmNvbnN0IGhvdmVyT3ZlclNldHNMaXN0ZW5lciA9ICgpID0+IHtcbiAgICBjb25zdCBzZXRzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLXNldDpub3QoW2hpZGRlbl0pJykpO1xuXG4gICAgc2V0cy5mb3JFYWNoKHMgPT4ge1xuICAgICAgICBzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCAoKSA9PiBoaWdobGlnaHRUeXBlKHMpKTtcbiAgICB9KVxufVxuXG5leHBvcnQgY29uc3Qgc3RhcnRTZXRzRHJvcERvd25OYXZpZ2F0aW9uID0gKCkgPT4ge1xuICAgIGNvbnN0IGZpcnN0U2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1zZXQ6bm90KFtoaWRkZW5dKScpO1xuICAgIGhpZ2hsaWdodFNldChmaXJzdFNldCk7XG4gICAgaG92ZXJPdmVyU2V0c0xpc3RlbmVyKCk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG5hdmlnYXRlU2V0c0Ryb3BEb3duKTtcbiAgICBlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd24uc2Nyb2xsVG9wID0gMDtcbn1cblxuY29uc3QgcmVtb3ZlU2V0QnRuID0gKCkgPT4ge1xuICAgIC8vIFNwYW4gd2lsbCBhY3QgYXMgdGhlIGJ1dHRvbiB0byByZW1vdmUgc2V0cyBmcm9tIHRoZSBcInNlbGVjdGVkXCIgbGlzdFxuICAgIGNvbnN0IGJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICBidG4uY2xhc3NMaXN0ID0gJ3NlYXJjaC1mb3JtX19zZWxlY3RlZC1zZXRzLXJlbW92ZS1idG4ganMtLWFwaS1zZXRzLWNsb3NlLWJ0bic7XG4gICAgYnRuLmlubmVySFRNTCA9ICd4JztcblxuICAgIGJ0bi5vbmNsaWNrID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBzZXROYW1lID0gYnRuLm5leHRFbGVtZW50U2libGluZy5pbm5lckhUTUw7ICAgICAgICBcbiAgICAgICAgY29uc3Qgc2V0VG9Ub2dnbGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbZGF0YS1zZXQtbmFtZXw9JHtzZXROYW1lfV1gKVxuICAgICAgICB0b2dnbGVEYXRhU2VsZWN0ZWQoc2V0VG9Ub2dnbGUpO1xuXG4gICAgICAgIGJ0bi5wYXJlbnRFbGVtZW50LnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQoYnRuLnBhcmVudEVsZW1lbnQpXG4gICAgfVxuXG4gICAgcmV0dXJuIGJ0bjtcbn1cblxuY29uc3QgYWRkU2V0ID0gKHNldE5hbWUsIHNldENvZGUpID0+IHtcbiAgICAvLyBDcmVhdGUgdGhlIGVtcHR5IGxpIGVsZW1lbnQgdG8gaG9sZCB0aGUgdHlwZXMgdGhhdCB0aGUgdXNlciBzZWxlY3RzLiBTZXQgdGhlIGNsYXNzIGxpc3QsXG4gICAgLy8gYW5kIHRoZSBkYXRhLXNlbGVjdGVkIGF0dHJpYnV0ZSB0byB0cnVlLlxuICAgIGNvbnN0IGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICBsaS5jbGFzc0xpc3QgPSAnc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXNldHMtbGlzdC1pdGVtIGpzLS1hcGktc2VsZWN0ZWQtc2V0JztcblxuICAgIC8vIFRoZSB0eXBlU3BhbiBob2xkcyB0aGUgdHlwZSBzZWxlY3RlZCBieSB0aGUgdXNlciBmcm9tIHRoZSBkcm9wZG93bi4gVGhlIGRhdGEgYXR0cmlidXRlXG4gICAgLy8gaXMgdXNlZCBpbiBTZWFyY2guanMgdG8gYnVpbGQgdGhlIHF1ZXJ5IHN0cmluZ1xuICAgIGNvbnN0IHNldFNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgc2V0U3Bhbi5zZXRBdHRyaWJ1dGUoJ2RhdGEtaW5jbHVkZS1zZXQnLCBzZXRDb2RlKTtcbiAgICBzZXRTcGFuLmlubmVySFRNTCA9IHNldE5hbWU7XG5cbiAgICBsaS5hcHBlbmRDaGlsZChyZW1vdmVTZXRCdG4oKSk7XG4gICAgbGkuYXBwZW5kQ2hpbGQoc2V0U3Bhbik7XG5cbiAgICBlbGVtZW50cy5hcGlTZWFyY2guc2VsZWN0ZWRTZXRzLmFwcGVuZENoaWxkKGxpKTtcbn1cblxuZXhwb3J0IGNvbnN0IHNldElucHV0TGlzdGVuZXIgPSBlID0+IHtcbiAgICAvLyBJZiB0aGUgdGFyZ2V0IGlzIG5vdCB0aGUgc2V0IGlucHV0IGZpZWxkLCBvciBhbiBlbGVtZW50IGluIHRoZSBkcm9wZG93biBsaXN0LCBcbiAgICAvLyBjbG9zZSB0aGUgZHJvcGRvd24gYW5kIHJlbW92ZSB0aGUgZXZlbnQgbGlzdGVuZXIgXG4gICAgaWYgKGUudGFyZ2V0ICE9PSBlbGVtZW50cy5hcGlTZWFyY2guc2V0SW5wdXQgJiYgXG4gICAgICAhZS50YXJnZXQubWF0Y2hlcygnLmpzLS1hcGktZHJvcGRvd24tc2V0cy1saXN0JykpIHtcbiAgICAgICAgaGlkZVNldHNEcm9wRG93bigpO1xuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHNldElucHV0TGlzdGVuZXIpO1xuICAgIC8vIElmIHRoZSB0YXJnZXQgaXMgb25lIG9mIHRoZSBzZXQgb3B0aW9ucywgdG9nZ2xlIGl0IGFzIHNlbGVjdGVkLCBhZGQgaXQgdG8gdGhlIGxpc3QsXG4gICAgLy8gYW5kIGhpZGUgdGhlIGRyb3Bkb3duLlxuICAgIH0gZWxzZSBpZiAoZS50YXJnZXQuaGFzQXR0cmlidXRlKCdkYXRhLXNldC1uYW1lJykpIHtcbiAgICAgICAgdG9nZ2xlRGF0YVNlbGVjdGVkKGUudGFyZ2V0KTtcbiAgICAgICAgYWRkU2V0KFxuICAgICAgICAgICAgZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXNldC1uYW1lJyksXG4gICAgICAgICAgICBlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2V0LWNvZGUnKVxuICAgICAgICApO1xuICAgICAgICBlbGVtZW50cy5hcGlTZWFyY2guc2V0SW5wdXQuZm9jdXMoKTtcbiAgICAgICAgaGlkZVNldHNEcm9wRG93bigpO1xuICAgIH1cbn1cblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKiogU1RBVFMgKioqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuXG5leHBvcnQgY29uc3Qgc3RhdExpbmVDb250cm9sbGVyID0gKCkgPT4ge1xuICAgIGlmIChjaGVja1N0YXRMaW5lRm9ySW50ZWdlcigpICYmIGNoZWNrRm9yTGVzc1RoYW5Gb3VyU3RhdExpbmVzKCkpIHtcbiAgICAgICAgY29uc3QgY2xvbmUgPSBjcmVhdGVTdGF0c0Nsb25lKCk7XG4gICAgICAgIGVkaXRTdGF0c0Nsb25lKGNsb25lKTtcbiAgICAgICAgaW5zZXJ0U3RhdHNDbG9uZShjbG9uZSk7XG4gICAgICAgIHJlc2V0U3RhdExpbmVFdmVudExpc3RlbmVyKCk7XG4gICAgfVxufTtcblxuY29uc3QgY2hlY2tTdGF0TGluZUZvckludGVnZXIgPSAoKSA9PiB7XG4gICAgY29uc3Qgc3RhdFZhbCA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgJy5qcy0tYXBpLXN0YXQtdmFsdWUnXG4gICAgKSkuc2xpY2UoLTEpWzBdO1xuXG4gICAgcmV0dXJuIChwYXJzZUludChzdGF0VmFsLnZhbHVlKSA+PSAwID8gdHJ1ZSA6IGZhbHNlKTtcbn07XG5cbmNvbnN0IGNoZWNrRm9yTGVzc1RoYW5Gb3VyU3RhdExpbmVzID0gKCkgPT4ge1xuICAgIGNvbnN0IHN0YXRzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWFwaS1zdGF0LXZhbHVlJykpO1xuXG4gICAgcmV0dXJuIChzdGF0cy5sZW5ndGggPCA0ID8gdHJ1ZSA6IGZhbHNlKTtcbn07XG5cbmNvbnN0IGNyZWF0ZVN0YXRzQ2xvbmUgPSAoKSA9PiB7XG4gICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXN0YXRzLXdyYXBwZXInKS5jbG9uZU5vZGUodHJ1ZSk7IFxufTtcblxuY29uc3QgZWRpdFN0YXRzQ2xvbmUgPSBjbG9uZSA9PiB7XG4gICAgY2xvbmUucXVlcnlTZWxlY3RvcignLmpzLS1hcGktc3RhdCcpLnZhbHVlID0gJyc7XG4gICAgY2xvbmUucXVlcnlTZWxlY3RvcignLmpzLS1hcGktc3RhdC1maWx0ZXInKS52YWx1ZSA9ICcnO1xuICAgIGNsb25lLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXN0YXQtdmFsdWUnKS52YWx1ZSA9ICcnOyAgIFxufTtcblxuY29uc3QgaW5zZXJ0U3RhdHNDbG9uZSA9IGNsb25lID0+IHtcbiAgICBjb25zdCBsYXN0U3RhdExpbmUgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICcuanMtLWFwaS1zdGF0cy13cmFwcGVyJ1xuICAgICkpLnNsaWNlKC0xKVswXTtcblxuICAgIGxhc3RTdGF0TGluZS5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2FmdGVyZW5kJywgY2xvbmUpO1xufTtcblxuY29uc3QgcmVzZXRTdGF0TGluZUV2ZW50TGlzdGVuZXIgPSAoKSA9PiB7XG4gICAgY29uc3Qgc3RhdFZhbHVlcyA9IEFycmF5LmZyb20oXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tYXBpLXN0YXQtdmFsdWUnKVxuICAgICk7XG4gICAgc3RhdFZhbHVlcy5zbGljZSgtMilbMF0ucmVtb3ZlRXZlbnRMaXN0ZW5lcignaW5wdXQnLCBzdGF0TGluZUNvbnRyb2xsZXIpO1xuICAgIHN0YXRWYWx1ZXMuc2xpY2UoLTEpWzBdLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0Jywgc3RhdExpbmVDb250cm9sbGVyKTtcbn07XG5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqIExFR0FMIFNUQVRVUyAqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcblxuXG5leHBvcnQgY29uc3QgZm9ybWF0TGluZUNvbnRyb2xsZXIgPSAoKSA9PiB7XG4gICAgY29uc29sZS5sb2coY2hlY2tGb3JGb3VyTGVzc1RoYW5Gb3JtYXRMaW5lcygpKVxuICAgIGlmIChjaGVja0ZvckZvdXJMZXNzVGhhbkZvcm1hdExpbmVzKCkgJiYgY2hlY2tGb3JtYXRMaW5lRm9yVmFsdWUoKSkge1xuICAgICAgICBjb25zdCBjbG9uZSA9IGNyZWF0ZUZvcm1hdENsb25lKCk7XG4gICAgICAgIGVkaXRGb3JtYXRDbG9uZShjbG9uZSk7XG4gICAgICAgIGluc2VydEZvcm1hdENsb25lKGNsb25lKTtcbiAgICAgICAgcmVzZXRGb3JtYXRMaW5lRXZlbnRMaXN0ZW5lcigpO1xuICAgIH1cbn07XG5cbmNvbnN0IGNoZWNrRm9ybWF0TGluZUZvclZhbHVlID0gKCkgPT4ge1xuICAgIGNvbnN0IGZvcm1hdCA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgJy5qcy0tYXBpLWZvcm1hdCdcbiAgICApKS5zbGljZSgtMSlbMF07XG5cbiAgICByZXR1cm4gKGZvcm1hdC52YWx1ZSAhPT0gJycgPyB0cnVlIDogZmFsc2UpO1xufTtcblxuY29uc3QgY2hlY2tGb3JGb3VyTGVzc1RoYW5Gb3JtYXRMaW5lcyA9ICgpID0+IHtcbiAgICBjb25zdCBmb3JtYXRzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWFwaS1mb3JtYXQnKSk7XG4gICAgcmV0dXJuIChmb3JtYXRzLmxlbmd0aCA8IDQgPyB0cnVlIDogZmFsc2UpO1xufTtcblxuY29uc3QgY3JlYXRlRm9ybWF0Q2xvbmUgPSAoKSA9PiB7XG4gICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLWZvcm1hdC13cmFwcGVyJykuY2xvbmVOb2RlKHRydWUpO1xufTtcblxuY29uc3QgZWRpdEZvcm1hdENsb25lID0gY2xvbmUgPT4ge1xuICAgIGNsb25lLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLWxlZ2FsLXN0YXR1cycpLnZhbHVlID0gJyc7XG4gICAgY2xvbmUucXVlcnlTZWxlY3RvcignLmpzLS1hcGktZm9ybWF0JykudmFsdWUgPSAnJztcbn07XG5cbmNvbnN0IGluc2VydEZvcm1hdENsb25lID0gY2xvbmUgPT4ge1xuICAgIGNvbnN0IGxhc3RGb3JtYXRMaW5lID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAnLmpzLS1hcGktZm9ybWF0LXdyYXBwZXInXG4gICAgKSkuc2xpY2UoLTEpWzBdO1xuXG4gICAgbGFzdEZvcm1hdExpbmUuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdhZnRlcmVuZCcsIGNsb25lKTtcbn07XG5cbmNvbnN0IHJlc2V0Rm9ybWF0TGluZUV2ZW50TGlzdGVuZXIgPSAoKSA9PiB7XG4gICAgY29uc3QgZm9ybWF0cyA9IEFycmF5LmZyb20oXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tYXBpLWZvcm1hdCcpXG4gICAgKTtcbiAgICBmb3JtYXRzLnNsaWNlKC0yKVswXS5yZW1vdmVFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmb3JtYXRMaW5lQ29udHJvbGxlcik7XG4gICAgZm9ybWF0cy5zbGljZSgtMSlbMF0uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZm9ybWF0TGluZUNvbnRyb2xsZXIpO1xufTsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHRpZihfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdKSB7XG5cdFx0cmV0dXJuIF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0uZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHRpZDogbW9kdWxlSWQsXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IG1vZHVsZVsnZGVmYXVsdCddIDpcblx0XHQoKSA9PiBtb2R1bGU7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLmcgPSAoZnVuY3Rpb24oKSB7XG5cdGlmICh0eXBlb2YgZ2xvYmFsVGhpcyA9PT0gJ29iamVjdCcpIHJldHVybiBnbG9iYWxUaGlzO1xuXHR0cnkge1xuXHRcdHJldHVybiB0aGlzIHx8IG5ldyBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0aWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKSByZXR1cm4gd2luZG93O1xuXHR9XG59KSgpOyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwidmFyIHNjcmlwdFVybDtcbmlmIChfX3dlYnBhY2tfcmVxdWlyZV9fLmcuaW1wb3J0U2NyaXB0cykgc2NyaXB0VXJsID0gX193ZWJwYWNrX3JlcXVpcmVfXy5nLmxvY2F0aW9uICsgXCJcIjtcbnZhciBkb2N1bWVudCA9IF9fd2VicGFja19yZXF1aXJlX18uZy5kb2N1bWVudDtcbmlmICghc2NyaXB0VXJsICYmIGRvY3VtZW50KSB7XG5cdGlmIChkb2N1bWVudC5jdXJyZW50U2NyaXB0KVxuXHRcdHNjcmlwdFVybCA9IGRvY3VtZW50LmN1cnJlbnRTY3JpcHQuc3JjXG5cdGlmICghc2NyaXB0VXJsKSB7XG5cdFx0dmFyIHNjcmlwdHMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcInNjcmlwdFwiKTtcblx0XHRpZihzY3JpcHRzLmxlbmd0aCkgc2NyaXB0VXJsID0gc2NyaXB0c1tzY3JpcHRzLmxlbmd0aCAtIDFdLnNyY1xuXHR9XG59XG4vLyBXaGVuIHN1cHBvcnRpbmcgYnJvd3NlcnMgd2hlcmUgYW4gYXV0b21hdGljIHB1YmxpY1BhdGggaXMgbm90IHN1cHBvcnRlZCB5b3UgbXVzdCBzcGVjaWZ5IGFuIG91dHB1dC5wdWJsaWNQYXRoIG1hbnVhbGx5IHZpYSBjb25maWd1cmF0aW9uXG4vLyBvciBwYXNzIGFuIGVtcHR5IHN0cmluZyAoXCJcIikgYW5kIHNldCB0aGUgX193ZWJwYWNrX3B1YmxpY19wYXRoX18gdmFyaWFibGUgZnJvbSB5b3VyIGNvZGUgdG8gdXNlIHlvdXIgb3duIGxvZ2ljLlxuaWYgKCFzY3JpcHRVcmwpIHRocm93IG5ldyBFcnJvcihcIkF1dG9tYXRpYyBwdWJsaWNQYXRoIGlzIG5vdCBzdXBwb3J0ZWQgaW4gdGhpcyBicm93c2VyXCIpO1xuc2NyaXB0VXJsID0gc2NyaXB0VXJsLnJlcGxhY2UoLyMuKiQvLCBcIlwiKS5yZXBsYWNlKC9cXD8uKiQvLCBcIlwiKS5yZXBsYWNlKC9cXC9bXlxcL10rJC8sIFwiL1wiKTtcbl9fd2VicGFja19yZXF1aXJlX18ucCA9IHNjcmlwdFVybDsiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZVxuX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL2pzL2luZGV4LmpzXCIpO1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgdXNlZCAnZXhwb3J0cycgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxuIl0sInNvdXJjZVJvb3QiOiIifQ==