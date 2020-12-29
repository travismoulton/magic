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
___CSS_LOADER_EXPORT___.push([module.id, "*,\n*::after,\n*::before {\n  margin: 0;\n  padding: 0;\n  box-sizing: inherit; }\n\nhtml {\n  font-size: 62.5%; }\n\nbody {\n  box-sizing: border-box;\n  overflow-x: hidden;\n  font-size: 1.6rem;\n  background-size: cover;\n  background-repeat: no-repeat;\n  height: 127.5rem;\n  font-family: 'Lato', sans-serif; }\n\n[hidden] {\n  display: none !important; }\n\n.heading-tertiary {\n  font-size: 2.4rem;\n  text-transform: uppercase; }\n  .heading-tertiary--white {\n    color: #fff; }\n\n.mb-10 {\n  margin-bottom: 1rem; }\n\n.mb-20 {\n  margin-bottom: 2rem; }\n\n.mt-50 {\n  margin-top: 5rem; }\n\n.btn, .btn:link, .btn:visited {\n  padding: .75rem 2rem;\n  border-radius: .5rem;\n  background-color: #f2f2f2;\n  font-weight: 400;\n  display: inline-block; }\n\n.btn:active, .btn:focus {\n  outline: none;\n  transform: translateY(-1px);\n  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.2); }\n\n.login-form__group:not(:last-child) {\n  margin-bottom: 2.5rem; }\n\n.login-form__label {\n  margin-right: .7rem;\n  color: #fff;\n  font-size: 1.8rem;\n  font-weight: 400; }\n\n.login-form__input {\n  background-color: #fff;\n  padding: .5rem 0;\n  border: none; }\n\n.login-form__btn-wrapper {\n  display: flex;\n  justify-content: center; }\n\n.login__register-text {\n  margin-top: 1.5rem;\n  color: #fff; }\n\n.login__register-link {\n  text-decoration: none;\n  color: #fff;\n  transition: all .2s; }\n  .login__register-link:hover {\n    color: #ff8000;\n    text-decoration: underline; }\n\n.nav {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 2rem 6rem;\n  background-color: #fff;\n  border-bottom: 1px solid #000; }\n  .nav__item {\n    list-style: none; }\n    .nav__item--search {\n      flex: 0 0 25%; }\n  .nav__link {\n    text-decoration: none;\n    color: #000;\n    transition: all .2s; }\n    .nav__link:hover {\n      margin-bottom: 2px;\n      color: #ffa64d;\n      border-bottom: 1px solid #ffa64d; }\n    .nav__link--home:hover .nav__icon-path--home {\n      fill: #ff8000; }\n  .nav__search {\n    display: flex;\n    justify-content: center;\n    align-items: center; }\n    .nav__search-input {\n      width: 90%;\n      border-radius: 3rem;\n      padding: 1rem 2rem;\n      border: 1px solid #bfbfbf;\n      background-color: #f2f2f2;\n      transition: width .2s; }\n      .nav__search-input:focus {\n        outline: none;\n        width: 120%; }\n    .nav__search-btn {\n      cursor: pointer; }\n  .nav__icon-sizing--home {\n    width: 3rem;\n    height: 3rem; }\n  .nav__icon-sizing--search {\n    width: 2rem;\n    height: 2rem;\n    transform: translateX(-150%); }\n  .nav__icon-path {\n    fill: #bfbfbf; }\n\n.register-form__group {\n  display: flex;\n  justify-content: space-between;\n  align-items: center; }\n  .register-form__group:not(:last-child) {\n    margin-bottom: 3rem; }\n\n.register-form__label {\n  margin-right: 4rem;\n  color: #fff;\n  font-size: 1.8rem;\n  font-weight: 400; }\n\n.register-form__input {\n  background-color: #f2f2f2;\n  padding: .5rem 0;\n  border: none; }\n\n.register-form__btn-wrapper {\n  display: flex;\n  justify-content: center; }\n\n.register__login-text {\n  margin-top: 1.5rem;\n  color: #fff; }\n\n.register__login-link {\n  text-decoration: none;\n  color: #fff;\n  transition: all .2s; }\n  .register__login-link:hover {\n    color: #ff8000;\n    text-decoration: underline; }\n\n.error {\n  margin-top: 2rem;\n  text-align: center;\n  background-color: #ff8080;\n  border-radius: 10px;\n  padding: 2rem;\n  font-size: 2rem;\n  grid-column: center-start / center-end;\n  font-weight: 700; }\n\n.search-form {\n  padding: 2rem 25rem; }\n  .search-form__group {\n    width: 75%;\n    display: flex;\n    margin-bottom: 3rem;\n    border-bottom: 1px solid #000;\n    align-items: flex-start;\n    padding: .5rem 4rem .5rem 0; }\n  .search-form__label {\n    flex: 0 0 20%;\n    display: flex;\n    align-items: flex-start;\n    margin-top: .7rem; }\n  .search-form__group-input-wrapper {\n    flex: 0 0 80%; }\n  .search-form__tip {\n    font-size: 1rem;\n    line-height: 1.4;\n    width: 70%; }\n  .search-form__input-text {\n    width: 40rem;\n    height: 4rem;\n    margin-bottom: 1rem;\n    padding: 1rem;\n    border: solid 1px #bfbfbf;\n    border-radius: 5px; }\n    .search-form__input-text:focus {\n      border: solid 1px #000; }\n  .search-form__input-integer--relative {\n    position: relative; }\n  .search-form__group--checkbox {\n    display: flex;\n    margin-bottom: 1rem; }\n  .search-form__label--checkbox {\n    margin-right: 1rem; }\n  .search-form__input-checkbox {\n    width: 2.25rem;\n    height: 2.25rem;\n    margin-right: .8rem; }\n  .search-form__checkbox-wrapper {\n    display: flex;\n    align-items: center; }\n  .search-form__select-menu {\n    margin-bottom: 1rem; }\n  .search-form__svg-size {\n    height: 2rem;\n    width: 2rem;\n    margin-right: 1rem; }\n  .search-form__submit {\n    border-radius: 3px;\n    padding: .7rem;\n    border: 1px solid #b300b3; }\n  .search-form__dropdown-span {\n    display: flex;\n    flex-direction: column; }\n  .search-form__selected-types, .search-form__selected-sets {\n    display: flex;\n    flex-direction: column;\n    list-style: none;\n    margin-bottom: .3rem; }\n  .search-form__selected-types-list-item, .search-form__selected-sets-list-item {\n    display: flex;\n    margin-bottom: .7rem; }\n  .search-form__selected-types-remove-btn, .search-form__selected-sets-remove-btn {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    cursor: pointer;\n    height: 2rem;\n    width: 2rem;\n    font-size: 1.3rem;\n    background-color: #f2f2f2;\n    margin-right: .7rem; }\n  .search-form__selected-types-toggler {\n    height: 2rem;\n    width: 2.75rem;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    cursor: pointer;\n    font-size: 1.3rem;\n    margin-right: .7rem; }\n    .search-form__selected-types-toggler--is {\n      background-color: #47d147; }\n    .search-form__selected-types-toggler--not {\n      background-color: #ff0000; }\n  .search-form__dropdown {\n    position: absolute;\n    max-height: 28rem;\n    background-color: #fff;\n    z-index: 2;\n    top: 100%;\n    width: 40rem;\n    margin-top: -1rem;\n    overflow-y: auto;\n    border: 1px solid #000; }\n    .search-form__dropdown-list {\n      list-style: none; }\n      .search-form__dropdown-list-category {\n        padding: .5rem; }\n      .search-form__dropdown-list-option {\n        padding: .3rem 2rem;\n        display: flex;\n        align-items: center; }\n        .search-form__dropdown-list-option:hover {\n          cursor: pointer; }\n        .search-form__dropdown-list-option--highlighted {\n          background-color: #ccd8ff; }\n        .search-form__dropdown-list-option span {\n          text-transform: uppercase;\n          margin-left: 1rem; }\n      .search-form__dropdown-list-img {\n        width: 2rem;\n        height: 2rem;\n        margin-right: .7rem; }\n\n.dropdown-wrapper {\n  position: relative; }\n\n.inv-search-price-msg {\n  position: absolute;\n  bottom: 0;\n  right: 0;\n  color: red; }\n\n.relative {\n  position: relative; }\n\n.api-results-display__nav {\n  background-color: #99b1ff;\n  width: 100%;\n  display: flex;\n  justify-content: space-between;\n  padding: 0 10%;\n  margin-bottom: .1rem; }\n  .api-results-display__nav-select {\n    color: #b300b3;\n    margin-right: 1rem; }\n  .api-results-display__nav-label {\n    color: #b300b3; }\n  .api-results-display__nav-right {\n    display: flex;\n    align-items: center; }\n  .api-results-display__nav-pagination-container {\n    display: flex;\n    align-items: center;\n    background-color: #ccd8ff;\n    cursor: pointer; }\n    .api-results-display__nav-pagination-container:not(:last-child) {\n      margin-right: 3rem; }\n    .api-results-display__nav-pagination-container--disabled {\n      cursor: not-allowed;\n      background-color: rgba(204, 216, 255, 0.4); }\n  .api-results-display__nav-svg-size {\n    height: 2rem;\n    width: 2rem; }\n\n.api-results-display__display-bar {\n  width: 100%;\n  border-bottom: 1px solid #bfbfbf;\n  padding-left: 10%;\n  margin-bottom: 2rem; }\n\n.card-checklist {\n  width: 80%;\n  justify-self: center; }\n  .card-checklist__row {\n    display: grid; }\n    .card-checklist__row--7 {\n      grid-template-columns: repeat(7, 1fr); }\n    .card-checklist__row--9 {\n      grid-template-columns: repeat(9, 1fr); }\n    .card-checklist__row--header {\n      border-bottom: 1px solid #000; }\n    .card-checklist__row--grey {\n      background-color: #f2f2f2; }\n    .card-checklist__row:nth-child(even) {\n      background-color: #f2f2f2; }\n  .card-checklist__data {\n    display: flex;\n    flex-wrap: nowrap;\n    justify-content: center;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    font-size: 1.4rem; }\n    .card-checklist__data--set {\n      text-transform: uppercase; }\n    .card-checklist__data--rarity {\n      text-transform: capitalize; }\n    .card-checklist__data--name {\n      white-space: nowrap;\n      justify-content: flex-start; }\n  .card-checklist__data-link {\n    padding: 1rem 0;\n    display: flex;\n    flex-wrap: nowrap;\n    align-items: center;\n    text-decoration: none;\n    width: 100%;\n    color: #000;\n    white-space: nowrap; }\n    .card-checklist__data-link--start {\n      justify-content: flex-start; }\n    .card-checklist__data-link--center {\n      justify-content: center; }\n\n.tooltip {\n  position: absolute;\n  z-index: 5;\n  width: 24rem;\n  height: 34rem; }\n  .tooltip__img {\n    width: 100%;\n    height: 100%; }\n\n.negative-earnings {\n  color: red; }\n\n.positive-earnings {\n  color: green; }\n\n.image-grid {\n  padding: 10rem 15rem;\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(25rem, 1fr));\n  grid-column-gap: 2rem;\n  grid-row-gap: 1rem; }\n  .image-grid__outer-div {\n    position: relative; }\n  .image-grid__inner-div {\n    perspective: 150rem;\n    height: 34rem;\n    width: 24rem; }\n  .image-grid__double {\n    height: 34rem;\n    width: 24rem;\n    position: absolute;\n    top: 0;\n    left: 0;\n    backface-visibility: hidden;\n    overflow: hidden;\n    transition: all .8s ease; }\n    .image-grid__double--back {\n      transform: rotateY(180deg); }\n  .image-grid__double-btn {\n    position: absolute;\n    top: 50%;\n    right: 15%;\n    width: 4rem;\n    height: 4rem;\n    border-radius: 50%;\n    background-color: rgba(255, 255, 255, 0.4); }\n  .image-grid__container {\n    width: 24rem;\n    height: 34rem; }\n  .image-grid__image {\n    width: 100%;\n    height: 100%; }\n\n.card {\n  display: flex;\n  margin-top: 3rem; }\n  .card__img-container {\n    margin-right: 10rem; }\n  .card__img {\n    width: 33rem;\n    height: 46rem; }\n  .card__img-left {\n    margin-right: 10rem;\n    width: 33rem;\n    display: flex;\n    flex-direction: column; }\n  .card__img-btn {\n    justify-self: flex-end;\n    align-self: flex-end;\n    margin-top: auto; }\n  .card__img-double-area {\n    position: relative; }\n  .card__img-double-sided {\n    perspective: 150rem;\n    height: 46rem; }\n  .card__img-double {\n    width: 33rem;\n    height: 46rem;\n    position: absolute;\n    top: 0;\n    left: 0;\n    backface-visibility: hidden;\n    overflow: hidden; }\n    .card__img-double--back {\n      transform: rotateY(180deg); }\n  .card__text {\n    background-color: #f4f4d7;\n    width: 34rem;\n    display: flex;\n    flex-direction: column;\n    padding: 1rem;\n    margin-right: 3rem; }\n    .card__text-flex {\n      margin-bottom: 1rem;\n      border-bottom: 1px solid #bfbfbf; }\n    .card__text-title {\n      display: flex;\n      align-items: center; }\n      .card__text-title-h3 {\n        font-size: 1.8rem;\n        font-weight: 400;\n        margin-right: 1rem; }\n    .card__text-color-indicator {\n      width: 1.3rem;\n      height: 1.3rem;\n      border: 1px solid #333;\n      border-radius: 50%;\n      box-shadow: 0px 0px 0px 2px rgba(0, 0, 0, 0.2);\n      margin-right: .7rem;\n      display: inline-block; }\n      .card__text-color-indicator--U {\n        background-color: rgba(128, 128, 255, 0.7); }\n      .card__text-color-indicator--B {\n        background-color: rgba(0, 0, 0, 0.7); }\n      .card__text-color-indicator--R {\n        background-color: rgba(255, 77, 77, 0.7); }\n      .card__text-color-indicator--W {\n        background-color: rgba(255, 255, 255, 0.7); }\n      .card__text-color-indicator--G {\n        background-color: rgba(0, 255, 0, 0.7); }\n    .card__text-oracle-p {\n      margin-bottom: 1rem;\n      font-size: 1.3rem; }\n    .card__text-oracle-flavor {\n      font-size: 1.3rem;\n      font-style: italic; }\n    .card__text-illustrator {\n      font-size: 1.2rem;\n      font-style: italic; }\n    .card__text-legal {\n      display: flex;\n      flex-direction: row;\n      justify-content: space-between; }\n      .card__text-legal-half {\n        display: flex;\n        flex-direction: column; }\n      .card__text-legal-span-container {\n        display: flex;\n        align-items: center; }\n        .card__text-legal-span-container:not(:last-child) {\n          margin-bottom: .5rem; }\n      .card__text-legal-span-box {\n        width: 6rem;\n        height: 2.5rem;\n        border: 1px solid #000;\n        margin-right: .3rem;\n        font-size: 1rem;\n        text-transform: uppercase;\n        display: flex;\n        justify-content: center;\n        align-items: center; }\n        .card__text-legal-span-box--not_legal {\n          background-color: #ff0000; }\n        .card__text-legal-span-box--legal {\n          background-color: #47d147; }\n  .card__set {\n    display: flex;\n    flex-direction: column; }\n    .card__set-banner {\n      display: flex;\n      border: 1px solid #bfbfbf;\n      width: 40rem;\n      background-color: #000;\n      color: #fff; }\n      .card__set-banner-svg-container {\n        margin-right: 1rem; }\n      .card__set-banner-svg {\n        width: 2.4rem;\n        height: 2.4rem;\n        filter: invert(100%); }\n    .card__set-details {\n      display: flex;\n      flex-direction: column; }\n    .card__set-header-name {\n      font-size: 1.7remrem; }\n    .card__set-header-code {\n      text-transform: uppercase; }\n    .card__set-prints-header {\n      display: flex;\n      justify-content: space-between;\n      background-color: #000;\n      color: #fff;\n      font-size: 1.3rem;\n      text-transform: uppercase;\n      border: 1px solid #bfbfbf;\n      padding: .3rem .7rem; }\n    .card__set-prints-svg-container {\n      height: 1.8rem;\n      width: 1.8rem;\n      border: 1px solid #bfbfbf;\n      display: flex;\n      justify-content: center;\n      align-items: center;\n      border-radius: 100%; }\n    .card__set-prints-svg--common {\n      fill: #000; }\n    .card__set-prints-svg--uncommon {\n      fill: #e6e6e6; }\n    .card__set-prints-svg--rare {\n      fill: #e6c300; }\n    .card__set-prints-svg--mythic {\n      fill: #ff0000; }\n    .card__set-prints-list {\n      list-style: none; }\n      .card__set-prints-list-link:link, .card__set-prints-list-link:visited {\n        text-decoration: none;\n        color: #000; }\n      .card__set-prints-list-item {\n        display: flex;\n        justify-content: space-between;\n        cursor: pointer; }\n        .card__set-prints-list-item:hover {\n          background-color: #f2f2f2; }\n      .card__set-prints-list-item-name-wrapper {\n        display: flex;\n        align-items: center;\n        margin-left: -1rem; }\n      .card__set-prints-list-item-set-name {\n        margin-left: .5rem; }\n      .card__set-prints-list-item-price {\n        margin-right: .7rem; }\n\n.card-page {\n  display: flex;\n  flex-direction: column;\n  grid-column: center-start / center-end; }\n\n.add-to-inv,\n.remove-from-inv {\n  margin-top: 3rem;\n  width: 50%; }\n  .add-to-inv__form,\n  .remove-from-inv__form {\n    display: flex;\n    flex-direction: column; }\n    .add-to-inv__form-group,\n    .remove-from-inv__form-group {\n      display: flex;\n      align-content: center;\n      margin-bottom: 3rem;\n      position: relative; }\n    .add-to-inv__form-label,\n    .remove-from-inv__form-label {\n      margin-right: .3rem; }\n  .add-to-inv-price-msg,\n  .remove-from-inv-price-msg {\n    position: absolute;\n    bottom: -1.8rem;\n    right: 25%;\n    color: red; }\n\n.no-results {\n  justify-self: center; }\n\n.container {\n  display: grid;\n  grid-template-columns: [full-start] minmax(6rem, 1fr) [center-start] repeat(8, [col-start] minmax(min-content, 14rem) [col-end]) [center-end] minmax(6rem, 1fr) [full-end]; }\n\n.login,\n.register {\n  margin-top: 5rem;\n  grid-column: center-start / center-end;\n  background-image: linear-gradient(to right bottom, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  height: 75vh;\n  background-size: cover;\n  background-position: center; }\n\n.search {\n  grid-column: full-start / full-end;\n  background-color: #fff; }\n\n.api-results-display {\n  grid-column: full-start / full-end;\n  background-color: #fff;\n  display: grid; }\n", "",{"version":3,"sources":["webpack://src/css/style.css"],"names":[],"mappings":"AAAA;;;EAGE,SAAS;EACT,UAAU;EACV,mBAAmB,EAAE;;AAEvB;EACE,gBAAgB,EAAE;;AAEpB;EACE,sBAAsB;EACtB,kBAAkB;EAClB,iBAAiB;EACjB,sBAAsB;EACtB,4BAA4B;EAC5B,gBAAgB;EAChB,+BAA+B,EAAE;;AAEnC;EACE,wBAAwB,EAAE;;AAE5B;EACE,iBAAiB;EACjB,yBAAyB,EAAE;EAC3B;IACE,WAAW,EAAE;;AAEjB;EACE,mBAAmB,EAAE;;AAEvB;EACE,mBAAmB,EAAE;;AAEvB;EACE,gBAAgB,EAAE;;AAEpB;EACE,oBAAoB;EACpB,oBAAoB;EACpB,yBAAyB;EACzB,gBAAgB;EAChB,qBAAqB,EAAE;;AAEzB;EACE,aAAa;EACb,2BAA2B;EAC3B,4CAA4C,EAAE;;AAEhD;EACE,qBAAqB,EAAE;;AAEzB;EACE,mBAAmB;EACnB,WAAW;EACX,iBAAiB;EACjB,gBAAgB,EAAE;;AAEpB;EACE,sBAAsB;EACtB,gBAAgB;EAChB,YAAY,EAAE;;AAEhB;EACE,aAAa;EACb,uBAAuB,EAAE;;AAE3B;EACE,kBAAkB;EAClB,WAAW,EAAE;;AAEf;EACE,qBAAqB;EACrB,WAAW;EACX,mBAAmB,EAAE;EACrB;IACE,cAAc;IACd,0BAA0B,EAAE;;AAEhC;EACE,aAAa;EACb,mBAAmB;EACnB,8BAA8B;EAC9B,kBAAkB;EAClB,sBAAsB;EACtB,6BAA6B,EAAE;EAC/B;IACE,gBAAgB,EAAE;IAClB;MACE,aAAa,EAAE;EACnB;IACE,qBAAqB;IACrB,WAAW;IACX,mBAAmB,EAAE;IACrB;MACE,kBAAkB;MAClB,cAAc;MACd,gCAAgC,EAAE;IACpC;MACE,aAAa,EAAE;EACnB;IACE,aAAa;IACb,uBAAuB;IACvB,mBAAmB,EAAE;IACrB;MACE,UAAU;MACV,mBAAmB;MACnB,kBAAkB;MAClB,yBAAyB;MACzB,yBAAyB;MACzB,qBAAqB,EAAE;MACvB;QACE,aAAa;QACb,WAAW,EAAE;IACjB;MACE,eAAe,EAAE;EACrB;IACE,WAAW;IACX,YAAY,EAAE;EAChB;IACE,WAAW;IACX,YAAY;IACZ,4BAA4B,EAAE;EAChC;IACE,aAAa,EAAE;;AAEnB;EACE,aAAa;EACb,8BAA8B;EAC9B,mBAAmB,EAAE;EACrB;IACE,mBAAmB,EAAE;;AAEzB;EACE,kBAAkB;EAClB,WAAW;EACX,iBAAiB;EACjB,gBAAgB,EAAE;;AAEpB;EACE,yBAAyB;EACzB,gBAAgB;EAChB,YAAY,EAAE;;AAEhB;EACE,aAAa;EACb,uBAAuB,EAAE;;AAE3B;EACE,kBAAkB;EAClB,WAAW,EAAE;;AAEf;EACE,qBAAqB;EACrB,WAAW;EACX,mBAAmB,EAAE;EACrB;IACE,cAAc;IACd,0BAA0B,EAAE;;AAEhC;EACE,gBAAgB;EAChB,kBAAkB;EAClB,yBAAyB;EACzB,mBAAmB;EACnB,aAAa;EACb,eAAe;EACf,sCAAsC;EACtC,gBAAgB,EAAE;;AAEpB;EACE,mBAAmB,EAAE;EACrB;IACE,UAAU;IACV,aAAa;IACb,mBAAmB;IACnB,6BAA6B;IAC7B,uBAAuB;IACvB,2BAA2B,EAAE;EAC/B;IACE,aAAa;IACb,aAAa;IACb,uBAAuB;IACvB,iBAAiB,EAAE;EACrB;IACE,aAAa,EAAE;EACjB;IACE,eAAe;IACf,gBAAgB;IAChB,UAAU,EAAE;EACd;IACE,YAAY;IACZ,YAAY;IACZ,mBAAmB;IACnB,aAAa;IACb,yBAAyB;IACzB,kBAAkB,EAAE;IACpB;MACE,sBAAsB,EAAE;EAC5B;IACE,kBAAkB,EAAE;EACtB;IACE,aAAa;IACb,mBAAmB,EAAE;EACvB;IACE,kBAAkB,EAAE;EACtB;IACE,cAAc;IACd,eAAe;IACf,mBAAmB,EAAE;EACvB;IACE,aAAa;IACb,mBAAmB,EAAE;EACvB;IACE,mBAAmB,EAAE;EACvB;IACE,YAAY;IACZ,WAAW;IACX,kBAAkB,EAAE;EACtB;IACE,kBAAkB;IAClB,cAAc;IACd,yBAAyB,EAAE;EAC7B;IACE,aAAa;IACb,sBAAsB,EAAE;EAC1B;IACE,aAAa;IACb,sBAAsB;IACtB,gBAAgB;IAChB,oBAAoB,EAAE;EACxB;IACE,aAAa;IACb,oBAAoB,EAAE;EACxB;IACE,aAAa;IACb,uBAAuB;IACvB,mBAAmB;IACnB,eAAe;IACf,YAAY;IACZ,WAAW;IACX,iBAAiB;IACjB,yBAAyB;IACzB,mBAAmB,EAAE;EACvB;IACE,YAAY;IACZ,cAAc;IACd,aAAa;IACb,uBAAuB;IACvB,mBAAmB;IACnB,eAAe;IACf,iBAAiB;IACjB,mBAAmB,EAAE;IACrB;MACE,yBAAyB,EAAE;IAC7B;MACE,yBAAyB,EAAE;EAC/B;IACE,kBAAkB;IAClB,iBAAiB;IACjB,sBAAsB;IACtB,UAAU;IACV,SAAS;IACT,YAAY;IACZ,iBAAiB;IACjB,gBAAgB;IAChB,sBAAsB,EAAE;IACxB;MACE,gBAAgB,EAAE;MAClB;QACE,cAAc,EAAE;MAClB;QACE,mBAAmB;QACnB,aAAa;QACb,mBAAmB,EAAE;QACrB;UACE,eAAe,EAAE;QACnB;UACE,yBAAyB,EAAE;QAC7B;UACE,yBAAyB;UACzB,iBAAiB,EAAE;MACvB;QACE,WAAW;QACX,YAAY;QACZ,mBAAmB,EAAE;;AAE7B;EACE,kBAAkB,EAAE;;AAEtB;EACE,kBAAkB;EAClB,SAAS;EACT,QAAQ;EACR,UAAU,EAAE;;AAEd;EACE,kBAAkB,EAAE;;AAEtB;EACE,yBAAyB;EACzB,WAAW;EACX,aAAa;EACb,8BAA8B;EAC9B,cAAc;EACd,oBAAoB,EAAE;EACtB;IACE,cAAc;IACd,kBAAkB,EAAE;EACtB;IACE,cAAc,EAAE;EAClB;IACE,aAAa;IACb,mBAAmB,EAAE;EACvB;IACE,aAAa;IACb,mBAAmB;IACnB,yBAAyB;IACzB,eAAe,EAAE;IACjB;MACE,kBAAkB,EAAE;IACtB;MACE,mBAAmB;MACnB,0CAA0C,EAAE;EAChD;IACE,YAAY;IACZ,WAAW,EAAE;;AAEjB;EACE,WAAW;EACX,gCAAgC;EAChC,iBAAiB;EACjB,mBAAmB,EAAE;;AAEvB;EACE,UAAU;EACV,oBAAoB,EAAE;EACtB;IACE,aAAa,EAAE;IACf;MACE,qCAAqC,EAAE;IACzC;MACE,qCAAqC,EAAE;IACzC;MACE,6BAA6B,EAAE;IACjC;MACE,yBAAyB,EAAE;IAC7B;MACE,yBAAyB,EAAE;EAC/B;IACE,aAAa;IACb,iBAAiB;IACjB,uBAAuB;IACvB,gBAAgB;IAChB,uBAAuB;IACvB,iBAAiB,EAAE;IACnB;MACE,yBAAyB,EAAE;IAC7B;MACE,0BAA0B,EAAE;IAC9B;MACE,mBAAmB;MACnB,2BAA2B,EAAE;EACjC;IACE,eAAe;IACf,aAAa;IACb,iBAAiB;IACjB,mBAAmB;IACnB,qBAAqB;IACrB,WAAW;IACX,WAAW;IACX,mBAAmB,EAAE;IACrB;MACE,2BAA2B,EAAE;IAC/B;MACE,uBAAuB,EAAE;;AAE/B;EACE,kBAAkB;EAClB,UAAU;EACV,YAAY;EACZ,aAAa,EAAE;EACf;IACE,WAAW;IACX,YAAY,EAAE;;AAElB;EACE,UAAU,EAAE;;AAEd;EACE,YAAY,EAAE;;AAEhB;EACE,oBAAoB;EACpB,aAAa;EACb,2DAA2D;EAC3D,qBAAqB;EACrB,kBAAkB,EAAE;EACpB;IACE,kBAAkB,EAAE;EACtB;IACE,mBAAmB;IACnB,aAAa;IACb,YAAY,EAAE;EAChB;IACE,aAAa;IACb,YAAY;IACZ,kBAAkB;IAClB,MAAM;IACN,OAAO;IACP,2BAA2B;IAC3B,gBAAgB;IAChB,wBAAwB,EAAE;IAC1B;MACE,0BAA0B,EAAE;EAChC;IACE,kBAAkB;IAClB,QAAQ;IACR,UAAU;IACV,WAAW;IACX,YAAY;IACZ,kBAAkB;IAClB,0CAA0C,EAAE;EAC9C;IACE,YAAY;IACZ,aAAa,EAAE;EACjB;IACE,WAAW;IACX,YAAY,EAAE;;AAElB;EACE,aAAa;EACb,gBAAgB,EAAE;EAClB;IACE,mBAAmB,EAAE;EACvB;IACE,YAAY;IACZ,aAAa,EAAE;EACjB;IACE,mBAAmB;IACnB,YAAY;IACZ,aAAa;IACb,sBAAsB,EAAE;EAC1B;IACE,sBAAsB;IACtB,oBAAoB;IACpB,gBAAgB,EAAE;EACpB;IACE,kBAAkB,EAAE;EACtB;IACE,mBAAmB;IACnB,aAAa,EAAE;EACjB;IACE,YAAY;IACZ,aAAa;IACb,kBAAkB;IAClB,MAAM;IACN,OAAO;IACP,2BAA2B;IAC3B,gBAAgB,EAAE;IAClB;MACE,0BAA0B,EAAE;EAChC;IACE,yBAAyB;IACzB,YAAY;IACZ,aAAa;IACb,sBAAsB;IACtB,aAAa;IACb,kBAAkB,EAAE;IACpB;MACE,mBAAmB;MACnB,gCAAgC,EAAE;IACpC;MACE,aAAa;MACb,mBAAmB,EAAE;MACrB;QACE,iBAAiB;QACjB,gBAAgB;QAChB,kBAAkB,EAAE;IACxB;MACE,aAAa;MACb,cAAc;MACd,sBAAsB;MACtB,kBAAkB;MAClB,8CAA8C;MAC9C,mBAAmB;MACnB,qBAAqB,EAAE;MACvB;QACE,0CAA0C,EAAE;MAC9C;QACE,oCAAoC,EAAE;MACxC;QACE,wCAAwC,EAAE;MAC5C;QACE,0CAA0C,EAAE;MAC9C;QACE,sCAAsC,EAAE;IAC5C;MACE,mBAAmB;MACnB,iBAAiB,EAAE;IACrB;MACE,iBAAiB;MACjB,kBAAkB,EAAE;IACtB;MACE,iBAAiB;MACjB,kBAAkB,EAAE;IACtB;MACE,aAAa;MACb,mBAAmB;MACnB,8BAA8B,EAAE;MAChC;QACE,aAAa;QACb,sBAAsB,EAAE;MAC1B;QACE,aAAa;QACb,mBAAmB,EAAE;QACrB;UACE,oBAAoB,EAAE;MAC1B;QACE,WAAW;QACX,cAAc;QACd,sBAAsB;QACtB,mBAAmB;QACnB,eAAe;QACf,yBAAyB;QACzB,aAAa;QACb,uBAAuB;QACvB,mBAAmB,EAAE;QACrB;UACE,yBAAyB,EAAE;QAC7B;UACE,yBAAyB,EAAE;EACnC;IACE,aAAa;IACb,sBAAsB,EAAE;IACxB;MACE,aAAa;MACb,yBAAyB;MACzB,YAAY;MACZ,sBAAsB;MACtB,WAAW,EAAE;MACb;QACE,kBAAkB,EAAE;MACtB;QACE,aAAa;QACb,cAAc;QACd,oBAAoB,EAAE;IAC1B;MACE,aAAa;MACb,sBAAsB,EAAE;IAC1B;MACE,oBAAoB,EAAE;IACxB;MACE,yBAAyB,EAAE;IAC7B;MACE,aAAa;MACb,8BAA8B;MAC9B,sBAAsB;MACtB,WAAW;MACX,iBAAiB;MACjB,yBAAyB;MACzB,yBAAyB;MACzB,oBAAoB,EAAE;IACxB;MACE,cAAc;MACd,aAAa;MACb,yBAAyB;MACzB,aAAa;MACb,uBAAuB;MACvB,mBAAmB;MACnB,mBAAmB,EAAE;IACvB;MACE,UAAU,EAAE;IACd;MACE,aAAa,EAAE;IACjB;MACE,aAAa,EAAE;IACjB;MACE,aAAa,EAAE;IACjB;MACE,gBAAgB,EAAE;MAClB;QACE,qBAAqB;QACrB,WAAW,EAAE;MACf;QACE,aAAa;QACb,8BAA8B;QAC9B,eAAe,EAAE;QACjB;UACE,yBAAyB,EAAE;MAC/B;QACE,aAAa;QACb,mBAAmB;QACnB,kBAAkB,EAAE;MACtB;QACE,kBAAkB,EAAE;MACtB;QACE,mBAAmB,EAAE;;AAE7B;EACE,aAAa;EACb,sBAAsB;EACtB,sCAAsC,EAAE;;AAE1C;;EAEE,gBAAgB;EAChB,UAAU,EAAE;EACZ;;IAEE,aAAa;IACb,sBAAsB,EAAE;IACxB;;MAEE,aAAa;MACb,qBAAqB;MACrB,mBAAmB;MACnB,kBAAkB,EAAE;IACtB;;MAEE,mBAAmB,EAAE;EACzB;;IAEE,kBAAkB;IAClB,eAAe;IACf,UAAU;IACV,UAAU,EAAE;;AAEhB;EACE,oBAAoB,EAAE;;AAExB;EACE,aAAa;EACb,0KAA0K,EAAE;;AAE9K;;EAEE,gBAAgB;EAChB,sCAAsC;EACtC,mIAAoH;EACpH,aAAa;EACb,sBAAsB;EACtB,mBAAmB;EACnB,YAAY;EACZ,sBAAsB;EACtB,2BAA2B,EAAE;;AAE/B;EACE,kCAAkC;EAClC,sBAAsB,EAAE;;AAE1B;EACE,kCAAkC;EAClC,sBAAsB;EACtB,aAAa,EAAE","sourcesContent":["*,\n*::after,\n*::before {\n  margin: 0;\n  padding: 0;\n  box-sizing: inherit; }\n\nhtml {\n  font-size: 62.5%; }\n\nbody {\n  box-sizing: border-box;\n  overflow-x: hidden;\n  font-size: 1.6rem;\n  background-size: cover;\n  background-repeat: no-repeat;\n  height: 127.5rem;\n  font-family: 'Lato', sans-serif; }\n\n[hidden] {\n  display: none !important; }\n\n.heading-tertiary {\n  font-size: 2.4rem;\n  text-transform: uppercase; }\n  .heading-tertiary--white {\n    color: #fff; }\n\n.mb-10 {\n  margin-bottom: 1rem; }\n\n.mb-20 {\n  margin-bottom: 2rem; }\n\n.mt-50 {\n  margin-top: 5rem; }\n\n.btn, .btn:link, .btn:visited {\n  padding: .75rem 2rem;\n  border-radius: .5rem;\n  background-color: #f2f2f2;\n  font-weight: 400;\n  display: inline-block; }\n\n.btn:active, .btn:focus {\n  outline: none;\n  transform: translateY(-1px);\n  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.2); }\n\n.login-form__group:not(:last-child) {\n  margin-bottom: 2.5rem; }\n\n.login-form__label {\n  margin-right: .7rem;\n  color: #fff;\n  font-size: 1.8rem;\n  font-weight: 400; }\n\n.login-form__input {\n  background-color: #fff;\n  padding: .5rem 0;\n  border: none; }\n\n.login-form__btn-wrapper {\n  display: flex;\n  justify-content: center; }\n\n.login__register-text {\n  margin-top: 1.5rem;\n  color: #fff; }\n\n.login__register-link {\n  text-decoration: none;\n  color: #fff;\n  transition: all .2s; }\n  .login__register-link:hover {\n    color: #ff8000;\n    text-decoration: underline; }\n\n.nav {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 2rem 6rem;\n  background-color: #fff;\n  border-bottom: 1px solid #000; }\n  .nav__item {\n    list-style: none; }\n    .nav__item--search {\n      flex: 0 0 25%; }\n  .nav__link {\n    text-decoration: none;\n    color: #000;\n    transition: all .2s; }\n    .nav__link:hover {\n      margin-bottom: 2px;\n      color: #ffa64d;\n      border-bottom: 1px solid #ffa64d; }\n    .nav__link--home:hover .nav__icon-path--home {\n      fill: #ff8000; }\n  .nav__search {\n    display: flex;\n    justify-content: center;\n    align-items: center; }\n    .nav__search-input {\n      width: 90%;\n      border-radius: 3rem;\n      padding: 1rem 2rem;\n      border: 1px solid #bfbfbf;\n      background-color: #f2f2f2;\n      transition: width .2s; }\n      .nav__search-input:focus {\n        outline: none;\n        width: 120%; }\n    .nav__search-btn {\n      cursor: pointer; }\n  .nav__icon-sizing--home {\n    width: 3rem;\n    height: 3rem; }\n  .nav__icon-sizing--search {\n    width: 2rem;\n    height: 2rem;\n    transform: translateX(-150%); }\n  .nav__icon-path {\n    fill: #bfbfbf; }\n\n.register-form__group {\n  display: flex;\n  justify-content: space-between;\n  align-items: center; }\n  .register-form__group:not(:last-child) {\n    margin-bottom: 3rem; }\n\n.register-form__label {\n  margin-right: 4rem;\n  color: #fff;\n  font-size: 1.8rem;\n  font-weight: 400; }\n\n.register-form__input {\n  background-color: #f2f2f2;\n  padding: .5rem 0;\n  border: none; }\n\n.register-form__btn-wrapper {\n  display: flex;\n  justify-content: center; }\n\n.register__login-text {\n  margin-top: 1.5rem;\n  color: #fff; }\n\n.register__login-link {\n  text-decoration: none;\n  color: #fff;\n  transition: all .2s; }\n  .register__login-link:hover {\n    color: #ff8000;\n    text-decoration: underline; }\n\n.error {\n  margin-top: 2rem;\n  text-align: center;\n  background-color: #ff8080;\n  border-radius: 10px;\n  padding: 2rem;\n  font-size: 2rem;\n  grid-column: center-start / center-end;\n  font-weight: 700; }\n\n.search-form {\n  padding: 2rem 25rem; }\n  .search-form__group {\n    width: 75%;\n    display: flex;\n    margin-bottom: 3rem;\n    border-bottom: 1px solid #000;\n    align-items: flex-start;\n    padding: .5rem 4rem .5rem 0; }\n  .search-form__label {\n    flex: 0 0 20%;\n    display: flex;\n    align-items: flex-start;\n    margin-top: .7rem; }\n  .search-form__group-input-wrapper {\n    flex: 0 0 80%; }\n  .search-form__tip {\n    font-size: 1rem;\n    line-height: 1.4;\n    width: 70%; }\n  .search-form__input-text {\n    width: 40rem;\n    height: 4rem;\n    margin-bottom: 1rem;\n    padding: 1rem;\n    border: solid 1px #bfbfbf;\n    border-radius: 5px; }\n    .search-form__input-text:focus {\n      border: solid 1px #000; }\n  .search-form__input-integer--relative {\n    position: relative; }\n  .search-form__group--checkbox {\n    display: flex;\n    margin-bottom: 1rem; }\n  .search-form__label--checkbox {\n    margin-right: 1rem; }\n  .search-form__input-checkbox {\n    width: 2.25rem;\n    height: 2.25rem;\n    margin-right: .8rem; }\n  .search-form__checkbox-wrapper {\n    display: flex;\n    align-items: center; }\n  .search-form__select-menu {\n    margin-bottom: 1rem; }\n  .search-form__svg-size {\n    height: 2rem;\n    width: 2rem;\n    margin-right: 1rem; }\n  .search-form__submit {\n    border-radius: 3px;\n    padding: .7rem;\n    border: 1px solid #b300b3; }\n  .search-form__dropdown-span {\n    display: flex;\n    flex-direction: column; }\n  .search-form__selected-types, .search-form__selected-sets {\n    display: flex;\n    flex-direction: column;\n    list-style: none;\n    margin-bottom: .3rem; }\n  .search-form__selected-types-list-item, .search-form__selected-sets-list-item {\n    display: flex;\n    margin-bottom: .7rem; }\n  .search-form__selected-types-remove-btn, .search-form__selected-sets-remove-btn {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    cursor: pointer;\n    height: 2rem;\n    width: 2rem;\n    font-size: 1.3rem;\n    background-color: #f2f2f2;\n    margin-right: .7rem; }\n  .search-form__selected-types-toggler {\n    height: 2rem;\n    width: 2.75rem;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    cursor: pointer;\n    font-size: 1.3rem;\n    margin-right: .7rem; }\n    .search-form__selected-types-toggler--is {\n      background-color: #47d147; }\n    .search-form__selected-types-toggler--not {\n      background-color: #ff0000; }\n  .search-form__dropdown {\n    position: absolute;\n    max-height: 28rem;\n    background-color: #fff;\n    z-index: 2;\n    top: 100%;\n    width: 40rem;\n    margin-top: -1rem;\n    overflow-y: auto;\n    border: 1px solid #000; }\n    .search-form__dropdown-list {\n      list-style: none; }\n      .search-form__dropdown-list-category {\n        padding: .5rem; }\n      .search-form__dropdown-list-option {\n        padding: .3rem 2rem;\n        display: flex;\n        align-items: center; }\n        .search-form__dropdown-list-option:hover {\n          cursor: pointer; }\n        .search-form__dropdown-list-option--highlighted {\n          background-color: #ccd8ff; }\n        .search-form__dropdown-list-option span {\n          text-transform: uppercase;\n          margin-left: 1rem; }\n      .search-form__dropdown-list-img {\n        width: 2rem;\n        height: 2rem;\n        margin-right: .7rem; }\n\n.dropdown-wrapper {\n  position: relative; }\n\n.inv-search-price-msg {\n  position: absolute;\n  bottom: 0;\n  right: 0;\n  color: red; }\n\n.relative {\n  position: relative; }\n\n.api-results-display__nav {\n  background-color: #99b1ff;\n  width: 100%;\n  display: flex;\n  justify-content: space-between;\n  padding: 0 10%;\n  margin-bottom: .1rem; }\n  .api-results-display__nav-select {\n    color: #b300b3;\n    margin-right: 1rem; }\n  .api-results-display__nav-label {\n    color: #b300b3; }\n  .api-results-display__nav-right {\n    display: flex;\n    align-items: center; }\n  .api-results-display__nav-pagination-container {\n    display: flex;\n    align-items: center;\n    background-color: #ccd8ff;\n    cursor: pointer; }\n    .api-results-display__nav-pagination-container:not(:last-child) {\n      margin-right: 3rem; }\n    .api-results-display__nav-pagination-container--disabled {\n      cursor: not-allowed;\n      background-color: rgba(204, 216, 255, 0.4); }\n  .api-results-display__nav-svg-size {\n    height: 2rem;\n    width: 2rem; }\n\n.api-results-display__display-bar {\n  width: 100%;\n  border-bottom: 1px solid #bfbfbf;\n  padding-left: 10%;\n  margin-bottom: 2rem; }\n\n.card-checklist {\n  width: 80%;\n  justify-self: center; }\n  .card-checklist__row {\n    display: grid; }\n    .card-checklist__row--7 {\n      grid-template-columns: repeat(7, 1fr); }\n    .card-checklist__row--9 {\n      grid-template-columns: repeat(9, 1fr); }\n    .card-checklist__row--header {\n      border-bottom: 1px solid #000; }\n    .card-checklist__row--grey {\n      background-color: #f2f2f2; }\n    .card-checklist__row:nth-child(even) {\n      background-color: #f2f2f2; }\n  .card-checklist__data {\n    display: flex;\n    flex-wrap: nowrap;\n    justify-content: center;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    font-size: 1.4rem; }\n    .card-checklist__data--set {\n      text-transform: uppercase; }\n    .card-checklist__data--rarity {\n      text-transform: capitalize; }\n    .card-checklist__data--name {\n      white-space: nowrap;\n      justify-content: flex-start; }\n  .card-checklist__data-link {\n    padding: 1rem 0;\n    display: flex;\n    flex-wrap: nowrap;\n    align-items: center;\n    text-decoration: none;\n    width: 100%;\n    color: #000;\n    white-space: nowrap; }\n    .card-checklist__data-link--start {\n      justify-content: flex-start; }\n    .card-checklist__data-link--center {\n      justify-content: center; }\n\n.tooltip {\n  position: absolute;\n  z-index: 5;\n  width: 24rem;\n  height: 34rem; }\n  .tooltip__img {\n    width: 100%;\n    height: 100%; }\n\n.negative-earnings {\n  color: red; }\n\n.positive-earnings {\n  color: green; }\n\n.image-grid {\n  padding: 10rem 15rem;\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(25rem, 1fr));\n  grid-column-gap: 2rem;\n  grid-row-gap: 1rem; }\n  .image-grid__outer-div {\n    position: relative; }\n  .image-grid__inner-div {\n    perspective: 150rem;\n    height: 34rem;\n    width: 24rem; }\n  .image-grid__double {\n    height: 34rem;\n    width: 24rem;\n    position: absolute;\n    top: 0;\n    left: 0;\n    backface-visibility: hidden;\n    overflow: hidden;\n    transition: all .8s ease; }\n    .image-grid__double--back {\n      transform: rotateY(180deg); }\n  .image-grid__double-btn {\n    position: absolute;\n    top: 50%;\n    right: 15%;\n    width: 4rem;\n    height: 4rem;\n    border-radius: 50%;\n    background-color: rgba(255, 255, 255, 0.4); }\n  .image-grid__container {\n    width: 24rem;\n    height: 34rem; }\n  .image-grid__image {\n    width: 100%;\n    height: 100%; }\n\n.card {\n  display: flex;\n  margin-top: 3rem; }\n  .card__img-container {\n    margin-right: 10rem; }\n  .card__img {\n    width: 33rem;\n    height: 46rem; }\n  .card__img-left {\n    margin-right: 10rem;\n    width: 33rem;\n    display: flex;\n    flex-direction: column; }\n  .card__img-btn {\n    justify-self: flex-end;\n    align-self: flex-end;\n    margin-top: auto; }\n  .card__img-double-area {\n    position: relative; }\n  .card__img-double-sided {\n    perspective: 150rem;\n    height: 46rem; }\n  .card__img-double {\n    width: 33rem;\n    height: 46rem;\n    position: absolute;\n    top: 0;\n    left: 0;\n    backface-visibility: hidden;\n    overflow: hidden; }\n    .card__img-double--back {\n      transform: rotateY(180deg); }\n  .card__text {\n    background-color: #f4f4d7;\n    width: 34rem;\n    display: flex;\n    flex-direction: column;\n    padding: 1rem;\n    margin-right: 3rem; }\n    .card__text-flex {\n      margin-bottom: 1rem;\n      border-bottom: 1px solid #bfbfbf; }\n    .card__text-title {\n      display: flex;\n      align-items: center; }\n      .card__text-title-h3 {\n        font-size: 1.8rem;\n        font-weight: 400;\n        margin-right: 1rem; }\n    .card__text-color-indicator {\n      width: 1.3rem;\n      height: 1.3rem;\n      border: 1px solid #333;\n      border-radius: 50%;\n      box-shadow: 0px 0px 0px 2px rgba(0, 0, 0, 0.2);\n      margin-right: .7rem;\n      display: inline-block; }\n      .card__text-color-indicator--U {\n        background-color: rgba(128, 128, 255, 0.7); }\n      .card__text-color-indicator--B {\n        background-color: rgba(0, 0, 0, 0.7); }\n      .card__text-color-indicator--R {\n        background-color: rgba(255, 77, 77, 0.7); }\n      .card__text-color-indicator--W {\n        background-color: rgba(255, 255, 255, 0.7); }\n      .card__text-color-indicator--G {\n        background-color: rgba(0, 255, 0, 0.7); }\n    .card__text-oracle-p {\n      margin-bottom: 1rem;\n      font-size: 1.3rem; }\n    .card__text-oracle-flavor {\n      font-size: 1.3rem;\n      font-style: italic; }\n    .card__text-illustrator {\n      font-size: 1.2rem;\n      font-style: italic; }\n    .card__text-legal {\n      display: flex;\n      flex-direction: row;\n      justify-content: space-between; }\n      .card__text-legal-half {\n        display: flex;\n        flex-direction: column; }\n      .card__text-legal-span-container {\n        display: flex;\n        align-items: center; }\n        .card__text-legal-span-container:not(:last-child) {\n          margin-bottom: .5rem; }\n      .card__text-legal-span-box {\n        width: 6rem;\n        height: 2.5rem;\n        border: 1px solid #000;\n        margin-right: .3rem;\n        font-size: 1rem;\n        text-transform: uppercase;\n        display: flex;\n        justify-content: center;\n        align-items: center; }\n        .card__text-legal-span-box--not_legal {\n          background-color: #ff0000; }\n        .card__text-legal-span-box--legal {\n          background-color: #47d147; }\n  .card__set {\n    display: flex;\n    flex-direction: column; }\n    .card__set-banner {\n      display: flex;\n      border: 1px solid #bfbfbf;\n      width: 40rem;\n      background-color: #000;\n      color: #fff; }\n      .card__set-banner-svg-container {\n        margin-right: 1rem; }\n      .card__set-banner-svg {\n        width: 2.4rem;\n        height: 2.4rem;\n        filter: invert(100%); }\n    .card__set-details {\n      display: flex;\n      flex-direction: column; }\n    .card__set-header-name {\n      font-size: 1.7remrem; }\n    .card__set-header-code {\n      text-transform: uppercase; }\n    .card__set-prints-header {\n      display: flex;\n      justify-content: space-between;\n      background-color: #000;\n      color: #fff;\n      font-size: 1.3rem;\n      text-transform: uppercase;\n      border: 1px solid #bfbfbf;\n      padding: .3rem .7rem; }\n    .card__set-prints-svg-container {\n      height: 1.8rem;\n      width: 1.8rem;\n      border: 1px solid #bfbfbf;\n      display: flex;\n      justify-content: center;\n      align-items: center;\n      border-radius: 100%; }\n    .card__set-prints-svg--common {\n      fill: #000; }\n    .card__set-prints-svg--uncommon {\n      fill: #e6e6e6; }\n    .card__set-prints-svg--rare {\n      fill: #e6c300; }\n    .card__set-prints-svg--mythic {\n      fill: #ff0000; }\n    .card__set-prints-list {\n      list-style: none; }\n      .card__set-prints-list-link:link, .card__set-prints-list-link:visited {\n        text-decoration: none;\n        color: #000; }\n      .card__set-prints-list-item {\n        display: flex;\n        justify-content: space-between;\n        cursor: pointer; }\n        .card__set-prints-list-item:hover {\n          background-color: #f2f2f2; }\n      .card__set-prints-list-item-name-wrapper {\n        display: flex;\n        align-items: center;\n        margin-left: -1rem; }\n      .card__set-prints-list-item-set-name {\n        margin-left: .5rem; }\n      .card__set-prints-list-item-price {\n        margin-right: .7rem; }\n\n.card-page {\n  display: flex;\n  flex-direction: column;\n  grid-column: center-start / center-end; }\n\n.add-to-inv,\n.remove-from-inv {\n  margin-top: 3rem;\n  width: 50%; }\n  .add-to-inv__form,\n  .remove-from-inv__form {\n    display: flex;\n    flex-direction: column; }\n    .add-to-inv__form-group,\n    .remove-from-inv__form-group {\n      display: flex;\n      align-content: center;\n      margin-bottom: 3rem;\n      position: relative; }\n    .add-to-inv__form-label,\n    .remove-from-inv__form-label {\n      margin-right: .3rem; }\n  .add-to-inv-price-msg,\n  .remove-from-inv-price-msg {\n    position: absolute;\n    bottom: -1.8rem;\n    right: 25%;\n    color: red; }\n\n.no-results {\n  justify-self: center; }\n\n.container {\n  display: grid;\n  grid-template-columns: [full-start] minmax(6rem, 1fr) [center-start] repeat(8, [col-start] minmax(min-content, 14rem) [col-end]) [center-end] minmax(6rem, 1fr) [full-end]; }\n\n.login,\n.register {\n  margin-top: 5rem;\n  grid-column: center-start / center-end;\n  background-image: linear-gradient(to right bottom, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(../img/login-bg.jpg);\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  height: 75vh;\n  background-size: cover;\n  background-position: center; }\n\n.search {\n  grid-column: full-start / full-end;\n  background-color: #fff; }\n\n.api-results-display {\n  grid-column: full-start / full-end;\n  background-color: #fff;\n  display: grid; }\n"],"sourceRoot":""}]);
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
/* harmony import */ var _views_inventoryView__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./views/inventoryView */ "./src/js/views/inventoryView.js");
/* harmony import */ var _views_inventorySearchView__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./views/inventorySearchView */ "./src/js/views/inventorySearchView.js");
/* harmony import */ var _views_base__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./views/base */ "./src/js/views/base.js");










// ******************************* \\
// ********* Quick Search ******** \\
// ******************************* \\
_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.nav.quickSearchBtn.addEventListener("click", () => {
  const search = new _models_Search__WEBPACK_IMPORTED_MODULE_2__.default();

  if (_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.nav.searchInput.value !== "") {
    const query = search.quickSearch();
    window.location.href = `/results/list/${query}&order=name`;
  }
});

// ******************************* \\
// ********* Search Page ********* \\
// ******************************* \\
if (window.location.pathname === "/search") {
  const search = new _models_Search__WEBPACK_IMPORTED_MODULE_2__.default();

  // Event listener for the submit search button. This goes through the form and generates
  // the qujery string. It then passes the string to the server through the URL
  _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.submitBtn.onclick = async (e) => {
    e.preventDefault();

    // Clear any existing query string
    search.resetSearchQuery();

    // Build the query string
    const query = search.buildSearchQuery();

    // Get the display method
    const displayMethod = search.displayMethod();

    // Create a get request with the query string
    window.location.href = `/results/${displayMethod}/${query}`;

    return false;
  };

  _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.typeLine.addEventListener("click", () => {
    // Display the dropdown
    _views_searchView__WEBPACK_IMPORTED_MODULE_3__.showTypesDropDown();
    _views_searchView__WEBPACK_IMPORTED_MODULE_3__.startTypesDropDownNavigation();

    // Start an event listener on the document. This will close the dropdown if the user clicks
    // outside of the input or dropdown. This will also cancel the event listener
    document.addEventListener("click", _views_searchView__WEBPACK_IMPORTED_MODULE_3__.typeLineListener);
  });

  _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.typeLine.addEventListener("input", () => {
    if (_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.typeDropDown.hasAttribute("hidden")) {
      _views_searchView__WEBPACK_IMPORTED_MODULE_3__.showTypesDropDown();
    }

    _views_searchView__WEBPACK_IMPORTED_MODULE_3__.filterTypes(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.typeLine.value);
    _views_searchView__WEBPACK_IMPORTED_MODULE_3__.filterTypeHeaders();
    _views_searchView__WEBPACK_IMPORTED_MODULE_3__.startTypesDropDownNavigation();
  });

  _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.setInput.addEventListener("click", () => {
    // Display the dropdown
    _views_searchView__WEBPACK_IMPORTED_MODULE_3__.showSetsDropDown();
    _views_searchView__WEBPACK_IMPORTED_MODULE_3__.startSetsDropDownNavigation();

    // Start an event listener on the document. This will close the dropdown if the user clicks
    // outside of the input or dropdown. This will also cancel the event listener
    document.addEventListener("click", _views_searchView__WEBPACK_IMPORTED_MODULE_3__.setInputListener);
  });

  _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.setInput.addEventListener("input", () => {
    if (_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.setDropDown.hasAttribute("hidden")) {
      _views_searchView__WEBPACK_IMPORTED_MODULE_3__.showSetsDropDown();
    }

    _views_searchView__WEBPACK_IMPORTED_MODULE_3__.filterSets(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.setInput.value);
    _views_searchView__WEBPACK_IMPORTED_MODULE_3__.filterSetHeaders();
    _views_searchView__WEBPACK_IMPORTED_MODULE_3__.startSetsDropDownNavigation();
  });

  _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.statValue.addEventListener(
    "input",
    _views_searchView__WEBPACK_IMPORTED_MODULE_3__.statLineController
  );

  _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.format.addEventListener(
    "change",
    _views_searchView__WEBPACK_IMPORTED_MODULE_3__.formatLineController
  );
}

// ******************************* \\
// ********* Results Page ******** \\
// ******************************* \\
if (window.location.pathname.substring(1, 8) === "results") {
  const state = {
    search: new _models_Search__WEBPACK_IMPORTED_MODULE_2__.default(),

    // Get the display method, sort method, and query from the URL
    display: window.location.pathname.substring(
      9,
      window.location.pathname.lastIndexOf("/")
    ),
    query: window.location.pathname.substring(
      window.location.pathname.lastIndexOf("/") + 1
    ),
    sortMethod: window.location.pathname.substring(
      window.location.pathname.lastIndexOf("=") + 1
    ),

    allCards: [],
    currentIndex: 0,
    allResultsLoaded: false,
  };

  // When the results page is refreshed, display the cards as a checklist by default
  document.addEventListener("DOMContentLoaded", async () => {
    // Update the sort by and display asd menus so the selected option is what the user selected
    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.choseSelectMenuSort(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.sortBy.options, state);
    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.choseSelectMenuDisplay(
      _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.displaySelector,
      state
    );

    // Run the get cards function, then update the display bar with the total card count
    await state.search.getCards(state);

    if (state.allCards[0] === 404) {
      _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.display404();
      return;
    }

    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.updateDisplayBar(state);

    // In the background, get all cards
    state.search.getAllCards(state, _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.enableBtn);

    // On loading the page display the cards in a checklist
    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.updateDisplay(state);
  });

  // Event listener for the change display method button
  _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.btn.onclick = async () => {
    // Update the display method between checklist and cards if the user changed it
    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.changeDisplayAndUrl(state);

    // If a new sorting method is selected, a request is sent to the server and the page is refreshed.
    // This resets the state and async tasks
    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.changeSortMethod(state);

    // Update the display with a new sort method and display method if either were given
    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.updateDisplay(state);
  };

  // Event Listener for next page button
  _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.nextPageBtn.onclick = () => {
    // Update the index
    state.currentIndex++;

    // Update the display based on the method stored in the state
    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.updateDisplay(state);

    // Update the display bar
    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.updateDisplayBar(state);

    // Enable the previous page and first page btns
    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.enableBtn(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.previousPageBtn);
    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.enableBtn(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.firstPageBtn);

    // If on the last page, disable the next page btn and last page btn
    if (state.currentIndex === state.allCards.length - 1) {
      _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.disableBtn(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.nextPageBtn);
      _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.disableBtn(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.lastPageBtn);
    }
  };

  // Event listener for the last page btn
  _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.lastPageBtn.onclick = () => {
    // Update the index
    state.currentIndex = state.allCards.length - 1;

    // Update the display based on the method stored in the state
    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.updateDisplay(state);

    // Update the display bar
    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.updateDisplayBar(state);

    // Disable the next and last page buttons
    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.disableBtn(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.nextPageBtn);
    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.disableBtn(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.lastPageBtn);

    // Enable the previous and first page buttons
    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.enableBtn(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.previousPageBtn);
    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.enableBtn(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.firstPageBtn);
  };

  // Event listener for the previous page button
  _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.previousPageBtn.onclick = () => {
    // Update the index
    state.currentIndex--;

    // Update the display based on the method stored in the state
    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.updateDisplay(state);

    // Update the display bar
    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.updateDisplayBar(state);

    // If on the first page, disable the previous and first page buttons
    if (state.currentIndex === 0) {
      _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.disableBtn(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.previousPageBtn);
      _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.disableBtn(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.firstPageBtn);
    }

    // Enable the next and last page buttons. The last page button should only be
    // enabled if all results have been loaded
    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.enableBtn(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.nextPageBtn);
    if (state.allResultsLoaded)
      _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.enableBtn(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.lastPageBtn);
  };

  // Event listener for the first page btn
  _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.firstPageBtn.onclick = () => {
    // Update the index
    state.currentIndex = 0;

    // Update the display based on the method stored in the state
    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.updateDisplay(state);

    // Update the display bar
    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.updateDisplayBar(state);

    // Disable the previous and first page buttons
    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.disableBtn(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.previousPageBtn);
    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.disableBtn(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.firstPageBtn);

    // Enable the next and last page buttons. The last page button should only be
    // enabled if all results have been loaded
    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.enableBtn(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.nextPageBtn);
    if (state.allResultsLoaded)
      _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.enableBtn(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.lastPageBtn);
  };

  window.onpopstate = (e) => {
    // const data = e.state;
    // if (data !== null) resultsView.updateDisplayOnPopState(state, data);

    window.location.href = `/search`;
  };
}

// ******************************* \\
// *********** Card Page ********* \\
// ******************************* \\
if (window.location.pathname.substring(1, 5) === "card") {
  _views_cardView__WEBPACK_IMPORTED_MODULE_5__.insertManaCostToCardTextTitle();
  _views_cardView__WEBPACK_IMPORTED_MODULE_5__.insertManaCostToOracleText();
  _views_cardView__WEBPACK_IMPORTED_MODULE_5__.removeUnderScoreFromLegalStatus();
  _views_cardView__WEBPACK_IMPORTED_MODULE_5__.fixCardPrices();
  _views_cardView__WEBPACK_IMPORTED_MODULE_5__.setPrintLinkHref();
  _views_cardView__WEBPACK_IMPORTED_MODULE_5__.printListHoverEvents();

  // If the transform btn is on the dom (if the card is double sided) set
  // the event listener for the card to be flipped back and forth
  if (_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.card.transformBtn) {
    _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.card.transformBtn.addEventListener(
      "click",
      _views_cardView__WEBPACK_IMPORTED_MODULE_5__.flipToBackSide
    );
  }

  document
    .querySelector(".js--add-to-inv-submit")
    .addEventListener("click", _views_cardView__WEBPACK_IMPORTED_MODULE_5__.checkPriceInputForDigits);
}

// ******************************* \\
// ******* Inventory Page ******** \\
// ******************************* \\
if (window.location.pathname.substring(1, 10) === "inventory") {
  document.addEventListener(
    "DOMContentLoaded",
    _views_inventoryView__WEBPACK_IMPORTED_MODULE_6__.alterInventoryTable
  );
}

// ******************************* \\
// **** Inventory Search Page **** \\
// ******************************* \\
if (window.location.pathname.substring(1, 17) === "inventory/search") {
  document
    .querySelector(".js--inv-search-btn")
    .addEventListener("click", _views_inventorySearchView__WEBPACK_IMPORTED_MODULE_7__.checkPriceInputForDigits);

  _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.typeLine.addEventListener("click", () => {
    // Display the dropdown
    console.log("click");
    _views_searchView__WEBPACK_IMPORTED_MODULE_3__.showTypesDropDown();
    _views_inventorySearchView__WEBPACK_IMPORTED_MODULE_7__.startTypesDropDownNavigation();

    // Start an event listener on the document. This will close the dropdown if the user clicks
    // outside of the input or dropdown. This will also cancel the event listener
    document.addEventListener("click", _views_inventorySearchView__WEBPACK_IMPORTED_MODULE_7__.typeLineListener);
  });

  _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.typeLine.addEventListener("input", () => {
    if (_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.typeDropDown.hasAttribute("hidden")) {
      _views_searchView__WEBPACK_IMPORTED_MODULE_3__.showTypesDropDown();
    }

    _views_searchView__WEBPACK_IMPORTED_MODULE_3__.filterTypes(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.typeLine.value);
    _views_searchView__WEBPACK_IMPORTED_MODULE_3__.filterTypeHeaders();
    _views_inventorySearchView__WEBPACK_IMPORTED_MODULE_7__.startTypesDropDownNavigation();
  });

  _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.setInput.addEventListener("click", () => {
    // Display the dropdown
    _views_searchView__WEBPACK_IMPORTED_MODULE_3__.showSetsDropDown();
    _views_inventorySearchView__WEBPACK_IMPORTED_MODULE_7__.startSetsDropDownNavigation();

    // Start an event listener on the document. This will close the dropdown if the user clicks
    // outside of the input or dropdown. This will also cancel the event listener
    document.addEventListener("click", _views_inventorySearchView__WEBPACK_IMPORTED_MODULE_7__.setInputListener);
  });

  _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.setInput.addEventListener("input", () => {
    if (_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.setDropDown.hasAttribute("hidden")) {
      _views_searchView__WEBPACK_IMPORTED_MODULE_3__.showSetsDropDown();
    }

    _views_searchView__WEBPACK_IMPORTED_MODULE_3__.filterSets(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.setInput.value);
    _views_searchView__WEBPACK_IMPORTED_MODULE_3__.filterSetHeaders();
    _views_inventorySearchView__WEBPACK_IMPORTED_MODULE_7__.startSetsDropDownNavigation();
  });
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
    if (
      oracleText.includes(' ') &&
      oracleText.indexOf(' ') !== oracleText.length - 1
    ) {
      let temporaryStr = '';
      const texts = oracleText.split(' ');

      texts.forEach((text) => {
        if (text.length > 0) temporaryStr += `oracle%3A${text}+`;
      });

      this.search += `+%28${temporaryStr.slice(0, -1)}%29`;
    } else if (oracleText) this.search += `+oracle%3A${oracleText}`;
  }

  searchByCardType() {
    const typesToInclude = Array.from(
      document.querySelectorAll('[data-include-type]')
    );
    const typesToExclude = Array.from(
      document.querySelectorAll('[data-exclude-type]')
    );
    const includePartialTypes = _views_base__WEBPACK_IMPORTED_MODULE_1__.elements.apiSearch.includePartialTypes.checked;
    let temporaryStr = '';

    if (typesToInclude && !includePartialTypes) {
      typesToInclude.forEach((type) => {
        this.search += `+type%3A${type.getAttribute('data-include-type')}`;
      });
    }

    if (typesToInclude.length > 0 && includePartialTypes) {
      typesToInclude.forEach((type) => {
        temporaryStr += `type%3A${type.getAttribute('data-include-type')}+OR+`;
      });

      temporaryStr = temporaryStr.slice(0, -4);
      this.search += `+%28${temporaryStr}%29`;
    }

    if (typesToExclude) {
      typesToExclude.forEach((type) => {
        this.search += `+-type%3A${type.getAttribute('data-exclude-type')}`;
      });
    }
  }

  searchByColor() {
    let boxes = _views_base__WEBPACK_IMPORTED_MODULE_1__.elements.apiSearch.colorBoxes;

    // Loop through checkboxes to get all colors given
    var colors = '';
    boxes.forEach((box) => {
      if (box.checked) colors += box.value;
    });

    const sortBy = _views_base__WEBPACK_IMPORTED_MODULE_1__.elements.apiSearch.colorSortBy.value;

    if (colors) this.search += `+color${sortBy}${colors}`;
  }

  searchByStats() {
    const statLines = Array.from(
      document.querySelectorAll('.js--api-stats-wrapper')
    );

    statLines.forEach((line) => {
      const stat = line.querySelector('.js--api-stat').value;
      const sortBy = line.querySelector('.js--api-stat-filter').value;
      const sortValue = line.querySelector('.js--api-stat-value').value;

      if (stat && sortBy && sortValue) {
        this.search += `+${stat}${sortBy}${sortValue}`;
      }
    });
  }

  searchByFormat() {
    const formatLines = Array.from(
      document.querySelectorAll('.js--api-format-wrapper')
    );

    formatLines.forEach((line) => {
      const status = line.querySelector('.js--api-legal-status').value;
      const format = line.querySelector('.js--api-format').value;

      if (format && status) this.search += `+${status}%3A${format}`;
    });
  }

  searchBySet() {
    const sets = Array.from(document.querySelectorAll('[data-include-set]'));
    let temporaryStr = '';

    if (sets.length > 0) {
      sets.forEach(
        (s) =>
          (temporaryStr += `set%3A${s.getAttribute('data-include-set')}+OR+`)
      );

      temporaryStr = temporaryStr.slice(0, -4);
      this.search += `+%28${temporaryStr}%29`;
    }
  }

  searchByRarity() {
    const boxes = _views_base__WEBPACK_IMPORTED_MODULE_1__.elements.apiSearch.rarityBoxes;
    var values = [];
    let temporaryStr = '';

    // Push all rarities given by the user into the values array
    boxes.forEach((box) => {
      if (box.checked) values.push(box.value);
    });

    if (values.length > 0) {
      // We need a starter string so we can slice it later %28 is an open parentheses
      temporaryStr += '%28';

      // For every value given by the user we need to add the +OR+
      // to the end for grouping. We will remove the +OR+ from the last
      // iteration of the loop
      values.forEach((value) => (temporaryStr += `rarity%3A${value}+OR+`));

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
    this.search += `&order=${sortBy}`;
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
        .then((res) => {
          // Update the search
          this.results = res.data;
          this.cards = res.data.data;

          // Store the cards in the allCards array
          state.allCards.push(res.data.data);
          resolve();
        })
        .catch((err) => {
          if (err.response.status === 404) {
            state.allCards.push(404);
            resolve();
          }
        });
    });
  }

  // Used by getAllCards to get each array of 175 cards
  async loopNextPage(state, enableBtn) {
    return new Promise((resolve, reject) => {
      axios__WEBPACK_IMPORTED_MODULE_0___default().get(this.results.next_page).then((res) => {
        // Update the results object
        this.results = res.data;

        // Push the cards from this result into the allCards array
        state.allCards.push(res.data.data);

        // Enable the next page btn and resolve the promise
        enableBtn(_views_base__WEBPACK_IMPORTED_MODULE_1__.elements.resultsPage.nextPageBtn);
        resolve();
      });
    });
  }

  // Will run in the background after the first set of cards is retrieved to make moving between results
  // pages faster
  async getAllCards(state, enableBtn) {
    // As long as there is a next_page keep loading the cards
    while (this.results.next_page) await this.loopNextPage(state, enableBtn);

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
    stat: document.querySelector('.js--api-stat'),
    statFilter: document.querySelector('.js--api-stat-filter'),
    statValue: document.querySelector('.js--api-stat-value'),
    legalStatus: document.querySelector('.js--api-legal-status'),
    format: document.querySelector('.js--api-format'),
    setInput: document.querySelector('.js--api-set'),
    setDropDown: document.querySelector('.js--api-set-dropdown'),
    selectedSets: document.querySelector('.js--api-selected-sets'),
    block: document.querySelector('.js--api-block'),
    rarityBoxes: document.querySelectorAll('.js--api-rarity-box'),
    denomination: document.querySelector('.js--api-denomination'),
    denominationSortBy: document.querySelector('.js--api-denomination-sort-by'),
    denominationSortValue: document.querySelector(
      '.js--api-denomination-sort-value'
    ),
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
    lastPageBtn: document.querySelector('.js--api-last-page'),
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
  },
};


/***/ }),

/***/ "./src/js/views/cardView.js":
/*!**********************************!*\
  !*** ./src/js/views/cardView.js ***!
  \**********************************/
/*! namespace exports */
/*! export checkPriceInputForDigits [provided] [no usage info] [missing usage info prevents renaming] */
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
/* harmony export */   "printListHoverEvents": () => /* binding */ printListHoverEvents,
/* harmony export */   "checkPriceInputForDigits": () => /* binding */ checkPriceInputForDigits
/* harmony export */ });
/* harmony import */ var _resultsView__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./resultsView */ "./src/js/views/resultsView.js");
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./base */ "./src/js/views/base.js");



const insertManaCostToCardTextTitle = () => {
  const manaCosts = Array.from(_base__WEBPACK_IMPORTED_MODULE_1__.elements.card.manaCostTitleSpan);

  manaCosts.forEach((cost) => {
    cost.innerHTML = (0,_resultsView__WEBPACK_IMPORTED_MODULE_0__.generateManaCostImages)(
      cost.getAttribute('data-mana-cost')
    );
  });
};

const insertManaCostToOracleText = () => {
  const oracleTexts = Array.from(_base__WEBPACK_IMPORTED_MODULE_1__.elements.card.oracleTexts);

  if (oracleTexts.length > 0) {
    oracleTexts.forEach(
      (text) => (text.innerHTML = (0,_resultsView__WEBPACK_IMPORTED_MODULE_0__.generateManaCostImages)(text.innerHTML, 'xs'))
    );
  }
};

const removeUnderScoreFromLegalStatus = () => {
  const legalities = Array.from(_base__WEBPACK_IMPORTED_MODULE_1__.elements.card.legalities);

  legalities.forEach((legality) => {
    if (legality.innerHTML.includes('_')) {
      legality.innerHTML = legality.innerHTML.replace('_', ' ');
    }
  });
};

const fixCardPrices = () => {
  const prices = Array.from(_base__WEBPACK_IMPORTED_MODULE_1__.elements.card.prices);

  prices.forEach((price) => {
    if (price.innerHTML.includes('None')) price.innerHTML = '-';
  });
};

const fixDoubleSidedCardName = (cardName) => {
  if (cardName.includes('/')) {
    cardName = cardName.substring(0, cardName.indexOf('/') - 1);
  }
  return cardName;
};

const setPrintLinkHref = () => {
  const links = Array.from(_base__WEBPACK_IMPORTED_MODULE_1__.elements.card.cardPrintLinks);

  links.forEach((link) => {
    let cardName = link.getAttribute('data-name').replaceAll(' ', '-');
    cardName = fixDoubleSidedCardName(cardName);
    const setCode = link.getAttribute('data-set');

    link.href = `/card/${setCode}/${cardName}`;
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
};

// Create the hover effect on each row that displays the image of the card
const printListHoverEvents = () => {
  // Get the HTML for each table row
  const prints = Array.from(_base__WEBPACK_IMPORTED_MODULE_1__.elements.card.printRows);

  prints.forEach((print) => {
    print.onmousemove = (e) => {
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
      img.src = print.getAttribute('data-cardImg');

      // Put the img into the div and then append the div directly to the body of the document.
      div.appendChild(img);
      document.body.appendChild(div);
    };

    // Remove the img when taking the cursor off the print
    print.onmouseout = (e) => {
      if (document.querySelector('.tooltip')) {
        document.body.removeChild(document.querySelector('.tooltip'));
      }
    };
  });
};

const checkPriceInputForDigits = (e) => {
  const priceInput = document.querySelector('.js--add-to-inv-price').value;

  if (isNaN(priceInput) && priceInput !== '') {
    e.preventDefault();
    renderPriceInputErrorMessage();
    return false;
  }
};

const renderPriceInputErrorMessage = () => {
  const priceInputDiv = document.querySelector('.js--add-to-inv-price-div');
  const msg = `<p class="add-to-inv-price-msg">Invalid price. Must be a number.</p>`;

  if (!document.querySelector('.add-to-inv-price-msg')) {
    priceInputDiv.insertAdjacentHTML('beforeend', msg);
  }
};


/***/ }),

/***/ "./src/js/views/inventorySearchView.js":
/*!*********************************************!*\
  !*** ./src/js/views/inventorySearchView.js ***!
  \*********************************************/
/*! namespace exports */
/*! export checkPriceInputForDigits [provided] [no usage info] [missing usage info prevents renaming] */
/*! export setInputListener [provided] [no usage info] [missing usage info prevents renaming] */
/*! export startSetsDropDownNavigation [provided] [no usage info] [missing usage info prevents renaming] */
/*! export startTypesDropDownNavigation [provided] [no usage info] [missing usage info prevents renaming] */
/*! export typeLineListener [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__, __webpack_require__.r, __webpack_exports__, __webpack_require__.d, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "checkPriceInputForDigits": () => /* binding */ checkPriceInputForDigits,
/* harmony export */   "startTypesDropDownNavigation": () => /* binding */ startTypesDropDownNavigation,
/* harmony export */   "typeLineListener": () => /* binding */ typeLineListener,
/* harmony export */   "startSetsDropDownNavigation": () => /* binding */ startSetsDropDownNavigation,
/* harmony export */   "setInputListener": () => /* binding */ setInputListener
/* harmony export */ });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./src/js/views/base.js");
/* harmony import */ var _searchView__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./searchView */ "./src/js/views/searchView.js");



const checkPriceInputForDigits = (e) => {
  const priceInput = document.querySelector('.js--inv-denomination-sort-value')
    .value;

  if (isNaN(priceInput) && priceInput !== '') {
    e.preventDefault();
    renderPriceInputErrorMessage();
    return false;
  }
};

const renderPriceInputErrorMessage = () => {
  const priceInputDiv = document.querySelector('.js--inv-search-price-div');
  const msg = `<p class="inv-search-price-msg">Invalid price. Must be a number.</p>`;

  if (!document.querySelector('.inv-search-price-msg')) {
    priceInputDiv.insertAdjacentHTML('beforeend', msg);
  }
};

// ******************************* \\
// ********** TYPE LINE ********** \\
// ******************************* \\

const hideTypesDropDownButKeepValue = () => {
  if (!_base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.typeDropDown.hasAttribute('hidden')) {
    _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.typeDropDown.setAttribute('hidden', 'true');
    document.removeEventListener('keydown', navigateTypesDropDown);
  }
};

const startTypesDropDownNavigation = () => {
  document.removeEventListener('keydown', navigateTypesDropDown);
  const firstType = document.querySelector('.js--type:not([hidden])');
  _searchView__WEBPACK_IMPORTED_MODULE_1__.highlightType(firstType);
  _searchView__WEBPACK_IMPORTED_MODULE_1__.hoverOverTypesListener();
  document.addEventListener('keydown', navigateTypesDropDown);
  _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.typeDropDown.scrollTop = 0;
};

const navigateTypesDropDown = (e) => {
  const types = Array.from(
    document.querySelectorAll('.js--type:not([hidden])')
  );
  const i = types.indexOf(document.querySelector('.js--highlighted'));

  if (e.code === 'ArrowDown' && i < types.length - 1) {
    e.preventDefault();
    _searchView__WEBPACK_IMPORTED_MODULE_1__.removeCurrentHighlight();
    _searchView__WEBPACK_IMPORTED_MODULE_1__.highlightType(types[i + 1]);

    _searchView__WEBPACK_IMPORTED_MODULE_1__.setScrollTopOnDownArrow(
      types[i + 1],
      _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.typeDropDown
    );
  }

  if (e.code === 'ArrowUp') {
    e.preventDefault();

    // We always want to prevent the default. We only want to change the
    // highlight if not on the top type in the dropdown
    if (i > 0) {
      _searchView__WEBPACK_IMPORTED_MODULE_1__.removeCurrentHighlight();
      _searchView__WEBPACK_IMPORTED_MODULE_1__.highlightType(types[i - 1]);

      _searchView__WEBPACK_IMPORTED_MODULE_1__.setScrollTopOnUpArrow(
        types[i - 1],
        _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.typeDropDown
      );
    }
  }

  if (e.code === 'Enter') {
    e.preventDefault();
    setInputValue(
      document.querySelector('.js--highlighted').getAttribute('data-type')
    );
    hideTypesDropDownButKeepValue();
  }
};

const setInputValue = (type) => {
  document.querySelector('.js--api-type-line').value = type;
};

const typeLineListener = (e) => {
  // If the target is not Type Line input line, or an element in the dropdown list,
  // close the dropdown and remove the event listener
  if (
    e.target !== _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.typeLine &&
    !e.target.matches('.js--api-dropdown-types-list')
  ) {
    _searchView__WEBPACK_IMPORTED_MODULE_1__.hideTypesDropDown();
    document.removeEventListener('click', typeLineListener);
    // If the target is one if types, get the data type
  } else if (e.target.hasAttribute('data-type')) {
    setInputValue(e.target.getAttribute('data-type'));
    _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.typeLine.focus();
    hideTypesDropDownButKeepValue();
  }
};

// ******************************* \\
// ************* SETS ************ \\
// ******************************* \\

const hideSetsDropDownButKeepValue = () => {
  if (!_base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.setDropDown.hasAttribute('hidden')) {
    _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.setDropDown.setAttribute('hidden', 'true');
    document.removeEventListener('keydown', navigateSetsDropDown);
  }
};

const navigateSetsDropDown = (e) => {
  const sets = Array.from(document.querySelectorAll('.js--set:not([hidden])'));
  const i = sets.indexOf(document.querySelector('.js--highlighted'));

  if (e.code === 'ArrowDown' && i < sets.length - 1) {
    e.preventDefault();
    _searchView__WEBPACK_IMPORTED_MODULE_1__.removeCurrentHighlight();
    _searchView__WEBPACK_IMPORTED_MODULE_1__.highlightSet(sets[i + 1]);

    _searchView__WEBPACK_IMPORTED_MODULE_1__.setScrollTopOnDownArrow(
      sets[i + 1],
      _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.setDropDown
    );
  }

  if (e.code === 'ArrowUp' && i > 0) {
    e.preventDefault();
    _searchView__WEBPACK_IMPORTED_MODULE_1__.removeCurrentHighlight();
    _searchView__WEBPACK_IMPORTED_MODULE_1__.highlightSet(sets[i - 1]);

    _searchView__WEBPACK_IMPORTED_MODULE_1__.setScrollTopOnUpArrow(
      sets[i - 1],
      _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.setDropDown
    );
  }

  if (e.code === 'Enter') {
    e.preventDefault();

    addSet(
      document.querySelector('.js--highlighted').getAttribute('data-set-name')
    );

    hideSetsDropDownButKeepValue();
  }
};

const startSetsDropDownNavigation = () => {
  const firstSet = document.querySelector('.js--set:not([hidden])');
  _searchView__WEBPACK_IMPORTED_MODULE_1__.highlightSet(firstSet);
  _searchView__WEBPACK_IMPORTED_MODULE_1__.hoverOverSetsListener();
  document.addEventListener('keydown', navigateSetsDropDown);
  _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.setDropDown.scrollTop = 0;
};

const addSet = (setName) => {
  _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.setInput.value = setName;
};

const setInputListener = (e) => {
  // If the target is not the set input field, or an element in the dropdown list,
  // close the dropdown and remove the event listener
  if (
    e.target !== _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.setInput &&
    !e.target.matches('.js--api-dropdown-sets-list')
  ) {
    _searchView__WEBPACK_IMPORTED_MODULE_1__.hideSetsDropDown();
    document.removeEventListener('click', setInputListener);
    // If the target is one of the set options, toggle it as selected, add it to the list,
    // and hide the dropdown.
  } else if (e.target.hasAttribute('data-set-name')) {
    addSet(e.target.getAttribute('data-set-name'));
    _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.setInput.focus();
    hideSetsDropDownButKeepValue();
  }
};


/***/ }),

/***/ "./src/js/views/inventoryView.js":
/*!***************************************!*\
  !*** ./src/js/views/inventoryView.js ***!
  \***************************************/
/*! namespace exports */
/*! export alterInventoryTable [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__, __webpack_require__.r, __webpack_exports__, __webpack_require__.d, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "alterInventoryTable": () => /* binding */ alterInventoryTable
/* harmony export */ });
/* harmony import */ var _resultsView__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./resultsView */ "./src/js/views/resultsView.js");



const shortenTypeLine = () => {
  const types = Array.from(document.querySelectorAll('.js--inv-types'));
  types.forEach((type) => {
    let html = type.innerHTML;

    // if the — delimiter is found in the string, return everything before the delimiter
    if (html.indexOf('—') !== -1) {
      type.innerHTML = html.substring(0, html.indexOf('—') - 1);
    }
  });
};

const alterManaImages = () => {
  const manaCosts = Array.from(document.querySelectorAll('.js--inv-mana-cost'));

  manaCosts.forEach((cost) => {
    cost.innerHTML = (0,_resultsView__WEBPACK_IMPORTED_MODULE_0__.generateManaCostImages)(cost.innerHTML);
  });
};

// Not using this right now *************************************
const sortTableAlphabetically = () => {
  let rows = Array.from(document.querySelectorAll('.js--checklist-row'));
  const table = document.querySelector('.js--card-checklist');
  let cards = [];

  rows.forEach((row) => {
    cards.push(row.querySelector('.js--checklist-card-name').innerHTML);
    row.parentElement.removeChild(row);
  });

  cards = cards.sort();

  for (let i = 0; i < cards.length; i++) {
    const rowIndex = rows.indexOf(
      rows.find((row) => row.getAttribute('data-row') === cards[i])
    );

    table.insertAdjacentElement('beforeend', rows[rowIndex]);

    rows.splice(rowIndex, 1);
  }
};

const giveEarningsColumnModifier = () => {
  const rows = Array.from(document.querySelectorAll('.js--inv-earnings'));
  console.log(rows);

  rows.forEach((row) => {
    if (row.innerText.startsWith('-')) {
      row.classList.add('negative-earnings');
    } else if (row.innerText === '0.0') {
      row.classList.add('no-earnings');
    } else {
      row.classList.add('positive-earnings');
    }
  });
};

const removeHashTagFromRarity = () => {
  const raritys = Array.from(document.querySelectorAll('.js--rarity'));
  raritys.forEach((r) => (r.innerText = r.innerText.substring(1)));
};

const alterInventoryTable = () => {
  shortenTypeLine();
  alterManaImages();
  (0,_resultsView__WEBPACK_IMPORTED_MODULE_0__.checkListHoverEvents)();
  giveEarningsColumnModifier();
  removeHashTagFromRarity();
};


/***/ }),

/***/ "./src/js/views/resultsView.js":
/*!*************************************!*\
  !*** ./src/js/views/resultsView.js ***!
  \*************************************/
/*! namespace exports */
/*! export changeDisplayAndUrl [provided] [no usage info] [missing usage info prevents renaming] */
/*! export changeSortMethod [provided] [no usage info] [missing usage info prevents renaming] */
/*! export checkListHoverEvents [provided] [no usage info] [missing usage info prevents renaming] */
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
/* harmony export */   "checkListHoverEvents": () => /* binding */ checkListHoverEvents,
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
  const checkList = document.querySelector('.js--card-checklist');
  if (checkList) {
    checkList.parentElement.removeChild(checkList);

    // Remove any tool tip images if user was hovering
    const toolTip = document.querySelector('.tooltip');
    if (toolTip) document.body.removeChild(toolTip);
  }
};

const clearImageGrid = () => {
  const grid = document.querySelector('.js--image-grid');
  if (grid) grid.parentElement.removeChild(grid);
};

const clearResults = () => {
  clearChecklist();
  clearImageGrid();
};

const prepImageContainer = () => {
  const markup = `
        <div class="image-grid js--image-grid"></div>
    `;
  _base__WEBPACK_IMPORTED_MODULE_0__.elements.resultsPage.resultsContainer.insertAdjacentHTML('beforeend', markup);
};

const generateSingleSidedCard = (card) => {
  const a = document.createElement('a');
  const div = document.createElement('div');
  const img = document.createElement('img');

  a.classList = `image-grid__link js--image-grid-link`;
  a.href = `/card/${card.set}/${parseCardName(card.name)}`;

  div.classList = `image-grid__container`;
  img.src = `${card.image_uris.normal}`;
  img.alt = `${card.name}`;
  img.classList = `image-grid__image`;
  div.appendChild(img);
  a.appendChild(div);

  document
    .querySelector('.js--image-grid')
    .insertAdjacentElement('beforeend', a);
};

const showBackSide = (card) => {
  const front = card.querySelector('.js--image-grid-card-side-front');
  const back = card.querySelector('.js--image-grid-card-side-back');

  front.style.transform = 'rotateY(-180deg)';
  back.style.transform = 'rotateY(0)';

  front.classList.remove('js--showing');
  back.classList.add('js--showing');
};

const showFrontSide = (card) => {
  const front = card.querySelector('.js--image-grid-card-side-front');
  const back = card.querySelector('.js--image-grid-card-side-back');

  front.style.transform = 'rotateY(0)';
  back.style.transform = 'rotateY(180deg)';

  front.classList.add('js--showing');
  back.classList.remove('js--showing');
};

const flipCard = (e) => {
  // Prevent the link from going to the card specific page
  e.preventDefault();
  const card = e.target.parentElement;

  const front = card.querySelector('.js--image-grid-card-side-front');

  // If the front is showing, display the backside. Otherwise, display the front
  if (front.classList.contains('js--showing')) showBackSide(card);
  else showFrontSide(card);
};

const generateFlipCardBtn = () => {
  const btn = document.createElement('button');
  btn.classList = 'image-grid__double-btn js--image-grid-flip-card-btn';
  btn.addEventListener('click', (e) => flipCard(e));

  return btn;
};

const generateDoubleSidedCard = (card) => {
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

  document
    .querySelector('.js--image-grid')
    .insertAdjacentElement('beforeend', a);
};

const generateImageGrid = (cards) => {
  cards.forEach((card) => {
    // For single sided cards
    if (card.image_uris) generateSingleSidedCard(card);
    // Double sided cards
    else generateDoubleSidedCard(card);
  });
};

// Funciton to be used in index.js. Takes care of all necessary steps to display cards as a images
const dispalyImages = (cards) => {
  clearResults();
  prepImageContainer();
  generateImageGrid(cards);
};

const prepChecklistContainer = () => {
  const markup = `
        <table class="card-checklist js--card-checklist">
            <thead>
                <tr class="card-checklist__row card-checklist__row--7 card-checklist__row--header">
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
        `;
  _base__WEBPACK_IMPORTED_MODULE_0__.elements.resultsPage.resultsContainer.insertAdjacentHTML('beforeend', markup);
};

const generateManaCostImages = (manaCost, size = 'small') => {
  // If there is no mana cost associated with the card, then return an empty string to leave the row empty
  if (!manaCost) return '';

  // Regular expressions to find each set of curly braces {}
  let re = /\{(.*?)\}/g;

  // Parse the strings and get all matches
  let matches = manaCost.match(re);

  // If there are any matches, loop through and replace each set of curly braces with the
  // html span that correspons to mana.css to render the correct image
  if (matches) {
    matches.forEach((m) => {
      const regex = new RegExp(`\{(${m.slice(1, -1)})\}`, 'g');
      // This will be the string used to get the right class from mana.css
      // We want to take everything inside the brackets, and if there is a /
      // remove it.
      const manaIconStr = m.slice(1, -1).toLowerCase().replace('/', '');
      manaCost = manaCost.replace(
        regex,
        `<span class="mana ${size} s${manaIconStr}"></span>`
      );
    });
  }

  return manaCost;
};

const shortenTypeLine = (type) => {
  // If no type is given, return an empty string
  if (!type) return '';

  // if the — delimiter is found in the string, return everything before the delimiter
  if (type.indexOf('—') !== -1) return type.substring(0, type.indexOf('—') - 1);

  // If there is no delimiter, return the type as given in the card object
  return type;
};

const parseCardName = (cardName) => {
  if (cardName.indexOf('/') !== -1) {
    return cardName.slice(0, cardName.indexOf('/') - 1).replaceAll(' ', '-');
  }

  return cardName.replaceAll(' ', '-');
};

const generateChecklist = (cards) => {
  // Create a new table row for each card object
  cards.forEach((card) => {
    const cardNameForUrl = parseCardName(card.name);

    const markup = `
            <tr class="js--checklist-row card-checklist__row card-checklist__row--7 data-component="card-tooltip" data-card-img=${checkForImg(
              card
            )}>
                <td class="card-checklist__data card-checklist__data--set"><a href="/card/${
                  card.set
                }/${cardNameForUrl}" class="card-checklist__data-link card-checklist__data-link--center">${
      card.set
    }</a></td>
                <td class="card-checklist__data"><a href="/card/${
                  card.set
                }/${cardNameForUrl}" class="card-checklist__data-link card-checklist__data-link--start">${
      card.name
    }</a></td>
                <td class="card-checklist__data"><a href="/card/${
                  card.set
                }/${cardNameForUrl}" class="card-checklist__data-link card-checklist__data-link--center">${generateManaCostImages(
      checkForManaCost(card)
    )}</a></td>
                <td class="card-checklist__data"><a href="/card/${
                  card.set
                }/${cardNameForUrl}" class="card-checklist__data-link card-checklist__data-link--center">${shortenTypeLine(
      card.type_line
    )}</a></td>
                <td class="card-checklist__data card-checklist__data--rarity"><a href="/card/${
                  card.set
                }/${cardNameForUrl}" class="card-checklist__data-link card-checklist__data-link--center">${
      card.rarity
    }</a></td>
                <td class="card-checklist__data"><a href="/card/${
                  card.set
                }/${cardNameForUrl}" class="card-checklist__data-link card-checklist__data-link--center">${
      card.artist
    }</a></td>
                <td class="card-checklist__data"><a href="/card/${
                  card.set
                }/${cardNameForUrl}" class="card-checklist__data-link card-checklist__data-link--center">${
      card.prices.usd
    }</a></td>
            </tr>
            `;
    // Put the row in the table
    document
      .querySelector('.js--card-checklist-body')
      .insertAdjacentHTML('beforeend', markup);
  });
};

const checkForManaCost = (card) => {
  if (card.mana_cost) {
    return card.mana_cost;
  } else if (card.card_faces) {
    return card.card_faces[0].mana_cost;
  }
};

const checkForImg = (card) => {
  if (card.image_uris) return card.image_uris.normal;
  // If there is no card.image_uris, then it's a double sided card. In this
  // case we want to display the image from face one of the card.
  else return card.card_faces[0].image_uris.normal;
};

// Create the hover effect on each row that displays the image of the card
const checkListHoverEvents = () => {
  // Get the HTML for each table row
  const rows = Array.from(document.querySelectorAll('.js--checklist-row'));

  rows.forEach((row) => {
    row.onmousemove = (e) => {
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
    };

    // Remove the img when taking the cursor off the row
    row.onmouseout = (e) => {
      if (document.querySelector('.tooltip')) {
        document.body.removeChild(document.querySelector('.tooltip'));
      }
    };
  });
};

// Funciton to be used in index.js. Takes care of all necessary steps to display cards as a checklist
const displayChecklist = (cards) => {
  clearResults();
  prepChecklistContainer();
  generateChecklist(cards);
  checkListHoverEvents();
};

const choseSelectMenuSort = (menu, state) => {
  // Create an array from the HTML select menu
  const options = Array.from(menu);

  options.forEach((option, i) => {
    // If the option value matches the sort method from the URL, set it to the selected item
    if (option.value === state.sortMethod) menu.selectedIndex = i;
  });
};

const choseSelectMenuDisplay = (menu, state) => {
  // Create an array from the HTML select menu
  const options = Array.from(menu);

  options.forEach((option, i) => {
    // If the option value matches the sort method from the URL, set it to the selected item
    if (option.value === state.display) menu.selectedIndex = i;
  });
};

// Function to change the sort method based on the input from the user
const changeSortMethod = (state) => {
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
      0,
      window.location.pathname.lastIndexOf('=') + 1
    );

    window.location.href = currentPathName + newSortMethod;
  }
};

const changeDisplayAndUrl = (state) => {
  const currentMethod = state.display;
  const newMethod = _base__WEBPACK_IMPORTED_MODULE_0__.elements.resultsPage.displaySelector.value;

  if (newMethod === currentMethod) return;

  // Update the state with new display method
  state.display = newMethod;

  // Update the url without pushing to the server
  const title = document.title;
  const pathName = `/results/${newMethod}/${state.query}`;
  history.pushState(
    {
      currentIndex: state.currentIndex,
      display: state.display,
    },
    title,
    pathName
  );
};

const updateDisplay = (state) => {
  // Clear any existing HTML in the display
  clearResults();

  // Refresh the display
  if (state.display === 'list')
    displayChecklist(state.allCards[state.currentIndex]);
  if (state.display === 'images')
    dispalyImages(state.allCards[state.currentIndex]);
};

// ********************************************** \\
// *************** PAGINATION ******************* \\
// ********************************************** \\

// Will be called during changing pages. Removes the current element in the bar
const clearDisplayBar = () => {
  const displayBarText = document.querySelector('.js--display-bar-text');
  if (displayBarText) displayBarText.parentElement.removeChild(displayBarText);
};

// Keeps track of where the user is in there list of cards
const paginationTracker = (state) => {
  var beg, end;
  beg = (state.currentIndex + 1) * 175 - 174;
  end = state.currentIndex * 175 + state.allCards[state.currentIndex].length;

  return { beg, end };
};

const updateDisplayBar = (state) => {
  const markup = `
        <p class="api-results-display__display-bar-text js--display-bar-text">
            Displaying ${paginationTracker(state).beg} - ${
    paginationTracker(state).end
  } of ${state.search.results.total_cards} cards
        </p>
    `;

  clearDisplayBar();
  _base__WEBPACK_IMPORTED_MODULE_0__.elements.resultsPage.displayBar.insertAdjacentHTML('beforeend', markup);
};

const enableBtn = (btn) => {
  if (btn.disabled) {
    btn.classList.remove(
      'api-results-display__nav-pagination-container--disabled'
    );
    btn.disabled = false;
  }
};

const disableBtn = (btn) => {
  if (!btn.disabled) {
    btn.classList.add(
      'api-results-display__nav-pagination-container--disabled'
    );
    btn.disabled = true;
  }
};

// ********************************************** \\
// ********************* 404 ******************** \\
// ********************************************** \\

const display404 = () => {
  const div = create404Message();
  _base__WEBPACK_IMPORTED_MODULE_0__.elements.resultsPage.resultsContainer.appendChild(div);
};

const create404Div = () => {
  const div = document.createElement('div');
  div.classList = `no-results`;
  return div;
};

const create404h3 = () => {
  const h3 = document.createElement('h3');
  h3.classList = `no-results__h3`;
  h3.innerHTML = `No cards found`;
  return h3;
};

const create404pElement = () => {
  const p = document.createElement('p');
  p.classList = `no-results__p`;
  p.innerHTML =
    "Your search didn't match any cards. Go back to the search page and edit your search";
  return p;
};

const create404Btn = () => {
  const btn = document.createElement('a');
  btn.classList = `btn no-results__btn`;
  btn.href = '/search';
  btn.innerHTML = 'Go Back';
  return btn;
};

const create404Message = () => {
  const div = create404Div();
  const h3 = create404h3();
  const p = create404pElement();
  const btn = create404Btn();

  div.appendChild(h3);
  div.appendChild(p);
  div.appendChild(btn);

  return div;
};


/***/ }),

/***/ "./src/js/views/searchView.js":
/*!************************************!*\
  !*** ./src/js/views/searchView.js ***!
  \************************************/
/*! namespace exports */
/*! export filterSelectedSets [provided] [no usage info] [missing usage info prevents renaming] */
/*! export filterSelectedTypes [provided] [no usage info] [missing usage info prevents renaming] */
/*! export filterSetHeaders [provided] [no usage info] [missing usage info prevents renaming] */
/*! export filterSets [provided] [no usage info] [missing usage info prevents renaming] */
/*! export filterTypeHeaders [provided] [no usage info] [missing usage info prevents renaming] */
/*! export filterTypes [provided] [no usage info] [missing usage info prevents renaming] */
/*! export formatLineController [provided] [no usage info] [missing usage info prevents renaming] */
/*! export hideSetsDropDown [provided] [no usage info] [missing usage info prevents renaming] */
/*! export hideTypesDropDown [provided] [no usage info] [missing usage info prevents renaming] */
/*! export highlightSet [provided] [no usage info] [missing usage info prevents renaming] */
/*! export highlightType [provided] [no usage info] [missing usage info prevents renaming] */
/*! export hoverOverSetsListener [provided] [no usage info] [missing usage info prevents renaming] */
/*! export hoverOverTypesListener [provided] [no usage info] [missing usage info prevents renaming] */
/*! export navigateSetsDropDown [provided] [no usage info] [missing usage info prevents renaming] */
/*! export navigateTypesDropDown [provided] [no usage info] [missing usage info prevents renaming] */
/*! export removeCurrentHighlight [provided] [no usage info] [missing usage info prevents renaming] */
/*! export setInputListener [provided] [no usage info] [missing usage info prevents renaming] */
/*! export setScrollTopOnDownArrow [provided] [no usage info] [missing usage info prevents renaming] */
/*! export setScrollTopOnUpArrow [provided] [no usage info] [missing usage info prevents renaming] */
/*! export showSetsDropDown [provided] [no usage info] [missing usage info prevents renaming] */
/*! export showTypesDropDown [provided] [no usage info] [missing usage info prevents renaming] */
/*! export startSetsDropDownNavigation [provided] [no usage info] [missing usage info prevents renaming] */
/*! export startTypesDropDownNavigation [provided] [no usage info] [missing usage info prevents renaming] */
/*! export statLineController [provided] [no usage info] [missing usage info prevents renaming] */
/*! export toggleDataSelected [provided] [no usage info] [missing usage info prevents renaming] */
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
/* harmony export */   "filterSelectedTypes": () => /* binding */ filterSelectedTypes,
/* harmony export */   "filterTypes": () => /* binding */ filterTypes,
/* harmony export */   "highlightType": () => /* binding */ highlightType,
/* harmony export */   "removeCurrentHighlight": () => /* binding */ removeCurrentHighlight,
/* harmony export */   "setScrollTopOnDownArrow": () => /* binding */ setScrollTopOnDownArrow,
/* harmony export */   "setScrollTopOnUpArrow": () => /* binding */ setScrollTopOnUpArrow,
/* harmony export */   "navigateTypesDropDown": () => /* binding */ navigateTypesDropDown,
/* harmony export */   "hoverOverTypesListener": () => /* binding */ hoverOverTypesListener,
/* harmony export */   "startTypesDropDownNavigation": () => /* binding */ startTypesDropDownNavigation,
/* harmony export */   "toggleDataSelected": () => /* binding */ toggleDataSelected,
/* harmony export */   "typeLineListener": () => /* binding */ typeLineListener,
/* harmony export */   "showSetsDropDown": () => /* binding */ showSetsDropDown,
/* harmony export */   "hideSetsDropDown": () => /* binding */ hideSetsDropDown,
/* harmony export */   "filterSetHeaders": () => /* binding */ filterSetHeaders,
/* harmony export */   "filterSets": () => /* binding */ filterSets,
/* harmony export */   "filterSelectedSets": () => /* binding */ filterSelectedSets,
/* harmony export */   "highlightSet": () => /* binding */ highlightSet,
/* harmony export */   "navigateSetsDropDown": () => /* binding */ navigateSetsDropDown,
/* harmony export */   "hoverOverSetsListener": () => /* binding */ hoverOverSetsListener,
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
    console.log('types dropdown');

    // Make sure to display all types when opening the dropdown and before taking input
    filterTypes('');
    filterSelectedTypes();
    filterTypeHeaders();
  }
};

const hideTypesDropDown = () => {
  if (!_base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.typeDropDown.hasAttribute('hidden')) {
    _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.typeLine.value = '';
    _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.typeDropDown.setAttribute('hidden', 'true');
    document.removeEventListener('keydown', navigateTypesDropDown);
  }
};

const filterTypeHeaders = () => {
  // On every input into the typeline bar, make all headers visible
  const headers = Array.from(
    document.querySelectorAll('.js--types-category-header')
  );
  headers.forEach((header) => {
    if (header.hasAttribute('hidden')) header.removeAttribute('hidden');
  });

  // For each category of type, if there are not any visible because they were filtered out
  // hide the header for that category
  if (!document.querySelector('.js--basic:not([hidden])')) {
    document.querySelector('.js--basic-header').setAttribute('hidden', 'true');
  }

  if (!document.querySelector('.js--super:not([hidden])')) {
    document.querySelector('.js--super-header').setAttribute('hidden', 'true');
  }

  if (!document.querySelector('.js--artifact:not([hidden])')) {
    document
      .querySelector('.js--artifact-header')
      .setAttribute('hidden', 'true');
  }

  if (!document.querySelector('.js--enchantment:not([hidden])')) {
    document
      .querySelector('.js--enchantment-header')
      .setAttribute('hidden', 'true');
  }

  if (!document.querySelector('.js--land:not([hidden])')) {
    document.querySelector('.js--land-header').setAttribute('hidden', 'true');
  }

  if (!document.querySelector('.js--spell:not([hidden])')) {
    document.querySelector('.js--spell-header').setAttribute('hidden', 'true');
  }

  if (!document.querySelector('.js--planeswalker:not([hidden])')) {
    document
      .querySelector('.js--planeswalker-header')
      .setAttribute('hidden', 'true');
  }

  if (!document.querySelector('.js--creature:not([hidden])')) {
    document
      .querySelector('.js--creature-header')
      .setAttribute('hidden', 'true');
  }
};

const filterSelectedTypes = () => {
  const types = Array.from(
    document.querySelectorAll('[data-type][data-selected]')
  );

  types.forEach((type) => {
    if (type.getAttribute('data-selected') === 'true') {
      if (!type.hasAttribute('hidden')) type.setAttribute('hidden', 'true');
    }
  });
};

const filterTypes = (str) => {
  const types = Array.from(document.querySelectorAll('[data-type]'));

  // Remove the hidden attribute if it exists on any element, and then hide any elements
  // that don't include the string given in the input from the user
  types.forEach((type) => {
    if (type.hasAttribute('hidden')) type.removeAttribute('hidden');
    if (
      !type.getAttribute('data-type').toLowerCase().includes(str.toLowerCase())
    ) {
      type.setAttribute('hidden', 'true');
    }
  });

  filterSelectedTypes();
};

const highlightType = (type) => {
  if (document.querySelector('.js--highlighted')) removeCurrentHighlight();

  if (type) {
    type.classList.add(
      'js--highlighted',
      'search-form__dropdown-list-option--highlighted'
    );
  }
};

const removeCurrentHighlight = () => {
  document
    .querySelector('.js--highlighted')
    .classList.remove(
      'js--highlighted',
      'search-form__dropdown-list-option--highlighted'
    );
};

const setScrollTopOnDownArrow = (el, dropdown) => {
  if (
    el.offsetTop > dropdown.offsetHeight - el.offsetHeight &&
    dropdown.scrollTop + dropdown.offsetHeight - el.offsetHeight < el.offsetTop
  ) {
    dropdown.scrollTop = el.offsetTop - dropdown.offsetHeight + el.offsetHeight;
  }
};

const setScrollTopOnUpArrow = (el, dropdown) => {
  if (el.offsetTop < dropdown.scrollTop) {
    dropdown.scrollTop = el.offsetTop;

    // 30 is the height of category headers. If the category header is
    // the only element left that is not revealed, set teh scroll top to 0
    if (dropdown.scrollTop <= 30) dropdown.scrollTop = 0;
  }
};

const navigateTypesDropDown = (e) => {
  const types = Array.from(
    document.querySelectorAll('.js--type:not([hidden])')
  );
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
      removeCurrentHighlight();
      highlightType(types[i - 1]);

      setScrollTopOnUpArrow(types[i - 1], _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.typeDropDown);
    }
  }

  if (e.code === 'Enter') {
    e.preventDefault();

    toggleDataSelected(document.querySelector('.js--highlighted'));
    addType(
      document.querySelector('.js--highlighted').getAttribute('data-type')
    );
    hideTypesDropDown();
  }
};

const hoverOverTypesListener = () => {
  const types = Array.from(
    document.querySelectorAll('.js--type:not([hidden])')
  );

  types.forEach((type) => {
    type.addEventListener('mouseenter', () => highlightType(type));
  });
};

const startTypesDropDownNavigation = () => {
  document.removeEventListener('keydown', navigateTypesDropDown);
  const firstType = document.querySelector('.js--type:not([hidden])');
  highlightType(firstType);
  hoverOverTypesListener();
  document.addEventListener('keydown', navigateTypesDropDown);
  _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.typeDropDown.scrollTop = 0;
};

const removeTypeBtn = () => {
  // Span will act as the button to remove types from the "selected" list
  const btn = document.createElement('span');
  btn.classList =
    'search-form__selected-types-remove-btn js--api-types-close-btn';
  btn.innerHTML = 'x';

  btn.onclick = () => {
    const typeName = btn.nextElementSibling.nextElementSibling.innerHTML;

    const typeToToggle = document.querySelector(`[data-type|=${typeName}]`);

    toggleDataSelected(typeToToggle);

    btn.parentElement.parentElement.removeChild(btn.parentElement);
  };

  return btn;
};

const typeToggleBtn = () => {
  // Span will act as the button to toggle whether or not a type is included or excluded from the search
  const btn = document.createElement('span');
  btn.classList =
    'search-form__selected-types-toggler search-form__selected-types-toggler--is js--api-types-toggler';
  btn.innerHTML = 'IS';

  /*
        This will toggle between searching for cards that include the given type and exclude the given type.
        It will make sure that the appropriate data type is given to the span element that contains the type
        So that the search functionality creates the appropriate query string

    */
  btn.onclick = () => {
    if (btn.innerHTML === 'IS') {
      btn.classList =
        'search-form__selected-types-toggler search-form__selected-types-toggler--not js--api-types-toggler';
      btn.nextElementSibling.removeAttribute('data-include-type');
      btn.nextElementSibling.setAttribute(
        'data-exclude-type',
        btn.nextElementSibling.innerHTML
      );
      btn.innerHTML = 'NOT';
    } else {
      btn.classList =
        'search-form__selected-types-toggler search-form__selected-types-toggler--is js--api-types-toggler';
      btn.nextElementSibling.removeAttribute('data-exclude-type');
      btn.nextElementSibling.setAttribute(
        'data-include-type',
        btn.nextElementSibling.innerHTML
      );
      btn.innerHTML = 'IS';
    }
  };

  return btn;
};

const toggleDataSelected = (typeOrSet) => {
  if (typeOrSet.getAttribute('data-selected') === 'true') {
    typeOrSet.setAttribute('data-selected', 'false');
  } else {
    typeOrSet.setAttribute('data-selected', 'true');
  }
};

const addType = (type) => {
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
};

const typeLineListener = (e) => {
  // If the target is not Type Line input line, or an element in the dropdown list,
  // close the dropdown and remove the event listener
  if (
    e.target !== _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.typeLine &&
    !e.target.matches('.js--api-dropdown-types-list')
  ) {
    hideTypesDropDown();
    document.removeEventListener('click', typeLineListener);
    // If the target is one if types, get the data type
  } else if (e.target.hasAttribute('data-type')) {
    toggleDataSelected(e.target);
    addType(e.target.getAttribute('data-type'));
    _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.typeLine.focus();
    hideTypesDropDown();
  }
};

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
};

const hideSetsDropDown = () => {
  if (!_base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.setDropDown.hasAttribute('hidden')) {
    _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.setDropDown.setAttribute('hidden', 'true');
    _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.setInput.value = '';
    document.removeEventListener('keydown', navigateSetsDropDown);
  }
};

const filterSetHeaders = () => {
  // On every input into the typeline bar, make all headers visible
  const headers = Array.from(
    document.querySelectorAll('.js--sets-category-header')
  );
  headers.forEach((header) => {
    if (header.hasAttribute('hidden')) header.removeAttribute('hidden');
  });

  // For each category of type, if there are not any visible because they were filtered out
  // hide the header for that category
  if (!document.querySelector('.js--expansion:not([hidden])')) {
    document
      .querySelector('.js--expansion-header')
      .setAttribute('hidden', 'true');
  }

  if (!document.querySelector('.js--core:not([hidden])')) {
    document.querySelector('.js--core-header').setAttribute('hidden', 'true');
  }

  if (!document.querySelector('.js--masters:not([hidden])')) {
    document
      .querySelector('.js--masters-header')
      .setAttribute('hidden', 'true');
  }

  if (!document.querySelector('.js--draft:not([hidden])')) {
    document.querySelector('.js--draft-header').setAttribute('hidden', 'true');
  }

  if (!document.querySelector('.js--duel_deck:not([hidden])')) {
    document
      .querySelector('.js--duel_deck-header')
      .setAttribute('hidden', 'true');
  }

  if (!document.querySelector('.js--archenemy:not([hidden])')) {
    document
      .querySelector('.js--archenemy-header')
      .setAttribute('hidden', 'true');
  }

  if (!document.querySelector('.js--box:not([hidden])')) {
    document.querySelector('.js--box-header').setAttribute('hidden', 'true');
  }

  if (!document.querySelector('.js--commander:not([hidden])')) {
    document
      .querySelector('.js--commander-header')
      .setAttribute('hidden', 'true');
  }

  if (!document.querySelector('.js--vault:not([hidden])')) {
    document.querySelector('.js--vault-header').setAttribute('hidden', 'true');
  }

  if (!document.querySelector('.js--funny:not([hidden])')) {
    document.querySelector('.js--funny-header').setAttribute('hidden', 'true');
  }

  if (!document.querySelector('.js--masterpiece:not([hidden])')) {
    document
      .querySelector('.js--masterpiece-header')
      .setAttribute('hidden', 'true');
  }

  if (!document.querySelector('.js--memorabilia:not([hidden])')) {
    document
      .querySelector('.js--memorabilia-header')
      .setAttribute('hidden', 'true');
  }

  if (!document.querySelector('.js--planechase:not([hidden])')) {
    document
      .querySelector('.js--planechase-header')
      .setAttribute('hidden', 'true');
  }

  if (!document.querySelector('.js--premium_deck:not([hidden])')) {
    document
      .querySelector('.js--premium_deck-header')
      .setAttribute('hidden', 'true');
  }

  if (!document.querySelector('.js--promo:not([hidden])')) {
    document.querySelector('.js--promo-header').setAttribute('hidden', 'true');
  }

  if (!document.querySelector('.js--spellbook:not([hidden])')) {
    document
      .querySelector('.js--spellbook-header')
      .setAttribute('hidden', 'true');
  }

  if (!document.querySelector('.js--starter:not([hidden])')) {
    document
      .querySelector('.js--starter-header')
      .setAttribute('hidden', 'true');
  }

  if (!document.querySelector('.js--token:not([hidden])')) {
    document.querySelector('.js--token-header').setAttribute('hidden', 'true');
  }

  if (!document.querySelector('.js--treasure_chest:not([hidden])')) {
    document
      .querySelector('.js--treasure_chest-header')
      .setAttribute('hidden', 'true');
  }

  if (!document.querySelector('.js--vanguard:not([hidden])')) {
    document
      .querySelector('.js--vanguard-header')
      .setAttribute('hidden', 'true');
  }
};

const filterSets = (str) => {
  // get all of the sets out of the dropdown list
  const sets = Array.from(document.querySelectorAll('[data-set-name]'));

  // Remove the hidden attribute if it exists on any element, and then hide any elements
  // that don't include the string given in the input from the user
  sets.forEach((s) => {
    if (s.hasAttribute('hidden')) s.removeAttribute('hidden');

    filterSelectedSets();

    if (
      !s
        .getAttribute('data-set-name')
        .toLowerCase()
        .includes(str.toLowerCase()) &&
      !s.getAttribute('data-set-code').toLowerCase().includes(str.toLowerCase())
    ) {
      s.setAttribute('hidden', 'true');
    }
  });
};

const filterSelectedSets = () => {
  const sets = Array.from(
    document.querySelectorAll('[data-set-name][data-selected]')
  );

  sets.forEach((s) => {
    if (s.getAttribute('data-selected') === 'true') {
      if (!s.hasAttribute('hidden')) s.setAttribute('hidden', 'true');
    }
  });
};

const highlightSet = (sett) => {
  if (document.querySelector('.js--highlighted')) removeCurrentHighlight();

  if (sett) {
    sett.classList.add(
      'js--highlighted',
      'search-form__dropdown-list-option--highlighted'
    );
  }
};

const navigateSetsDropDown = (e) => {
  const sets = Array.from(document.querySelectorAll('.js--set:not([hidden])'));
  const i = sets.indexOf(document.querySelector('.js--highlighted'));

  if (e.code === 'ArrowDown' && i < sets.length - 1) {
    e.preventDefault();
    removeCurrentHighlight();
    highlightSet(sets[i + 1]);

    setScrollTopOnDownArrow(sets[i + 1], _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.setDropDown);
  }

  if (e.code === 'ArrowUp' && i > 0) {
    e.preventDefault();
    removeCurrentHighlight();
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

  sets.forEach((s) => {
    s.addEventListener('mouseenter', () => highlightType(s));
  });
};

const startSetsDropDownNavigation = () => {
  const firstSet = document.querySelector('.js--set:not([hidden])');
  highlightSet(firstSet);
  hoverOverSetsListener();
  document.addEventListener('keydown', navigateSetsDropDown);
  _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.setDropDown.scrollTop = 0;
};

const removeSetBtn = () => {
  // Span will act as the button to remove sets from the "selected" list
  const btn = document.createElement('span');
  btn.classList =
    'search-form__selected-sets-remove-btn js--api-sets-close-btn';
  btn.innerHTML = 'x';

  btn.onclick = () => {
    const setName = btn.nextElementSibling.innerHTML;
    const setToToggle = document.querySelector(`[data-set-name|=${setName}]`);
    toggleDataSelected(setToToggle);

    btn.parentElement.parentElement.removeChild(btn.parentElement);
  };

  return btn;
};

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
};

const setInputListener = (e) => {
  // If the target is not the set input field, or an element in the dropdown list,
  // close the dropdown and remove the event listener
  if (
    e.target !== _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.setInput &&
    !e.target.matches('.js--api-dropdown-sets-list')
  ) {
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
};

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
  const statVal = Array.from(
    document.querySelectorAll('.js--api-stat-value')
  ).slice(-1)[0];

  return parseInt(statVal.value) >= 0 ? true : false;
};

const checkForLessThanFourStatLines = () => {
  const stats = Array.from(document.querySelectorAll('.js--api-stat-value'));

  return stats.length < 4 ? true : false;
};

const createStatsClone = () => {
  return document.querySelector('.js--api-stats-wrapper').cloneNode(true);
};

const editStatsClone = (clone) => {
  clone.querySelector('.js--api-stat').value = '';
  clone.querySelector('.js--api-stat-filter').value = '';
  clone.querySelector('.js--api-stat-value').value = '';
};

const insertStatsClone = (clone) => {
  const lastStatLine = Array.from(
    document.querySelectorAll('.js--api-stats-wrapper')
  ).slice(-1)[0];

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
  console.log(checkForFourLessThanFormatLines());
  if (checkForFourLessThanFormatLines() && checkFormatLineForValue()) {
    const clone = createFormatClone();
    editFormatClone(clone);
    insertFormatClone(clone);
    resetFormatLineEventListener();
  }
};

const checkFormatLineForValue = () => {
  const format = Array.from(document.querySelectorAll('.js--api-format')).slice(
    -1
  )[0];

  return format.value !== '' ? true : false;
};

const checkForFourLessThanFormatLines = () => {
  const formats = Array.from(document.querySelectorAll('.js--api-format'));
  return formats.length < 4 ? true : false;
};

const createFormatClone = () => {
  return document.querySelector('.js--api-format-wrapper').cloneNode(true);
};

const editFormatClone = (clone) => {
  clone.querySelector('.js--api-legal-status').value = '';
  clone.querySelector('.js--api-format').value = '';
};

const insertFormatClone = (clone) => {
  const lastFormatLine = Array.from(
    document.querySelectorAll('.js--api-format-wrapper')
  ).slice(-1)[0];

  lastFormatLine.insertAdjacentElement('afterend', clone);
};

const resetFormatLineEventListener = () => {
  const formats = Array.from(document.querySelectorAll('.js--api-format'));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9pbmRleC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvYWRhcHRlcnMveGhyLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9heGlvcy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbFRva2VuLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvaXNDYW5jZWwuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvQXhpb3MuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvSW50ZXJjZXB0b3JNYW5hZ2VyLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2J1aWxkRnVsbFBhdGguanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvY3JlYXRlRXJyb3IuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvZGlzcGF0Y2hSZXF1ZXN0LmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2VuaGFuY2VFcnJvci5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9tZXJnZUNvbmZpZy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9zZXR0bGUuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvdHJhbnNmb3JtRGF0YS5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvZGVmYXVsdHMuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYmluZC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9idWlsZFVSTC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9jb21iaW5lVVJMcy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9jb29raWVzLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzQWJzb2x1dGVVUkwuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNVUkxTYW1lT3JpZ2luLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL25vcm1hbGl6ZUhlYWRlck5hbWUuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvcGFyc2VIZWFkZXJzLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3NwcmVhZC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvdXRpbHMuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9zcmMvY3NzL3N0eWxlLmNzcyIsIndlYnBhY2s6Ly9tYWdpYy8uL3NyYy9jc3MvdmVuZG9yL21hbmEuY3NzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9jc3NXaXRoTWFwcGluZ1RvU3RyaW5nLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2dldFVybC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL3NyYy9pbWcvbG9naW4tYmcuanBnIiwid2VicGFjazovL21hZ2ljLy4vc3JjL2ltZy9tYW5hLXN5bWJvbHMvbWFuYS5zdmciLCJ3ZWJwYWNrOi8vbWFnaWMvLi9zcmMvY3NzL3N0eWxlLmNzcz85ZmNkIiwid2VicGFjazovL21hZ2ljLy4vc3JjL2Nzcy92ZW5kb3IvbWFuYS5jc3M/MDcwMiIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL3NyYy9qcy9pbmRleC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL3NyYy9qcy9tb2RlbHMvU2VhcmNoLmpzIiwid2VicGFjazovL21hZ2ljLy4vc3JjL2pzL3ZpZXdzL2Jhc2UuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9zcmMvanMvdmlld3MvY2FyZFZpZXcuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9zcmMvanMvdmlld3MvaW52ZW50b3J5U2VhcmNoVmlldy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL3NyYy9qcy92aWV3cy9pbnZlbnRvcnlWaWV3LmpzIiwid2VicGFjazovL21hZ2ljLy4vc3JjL2pzL3ZpZXdzL3Jlc3VsdHNWaWV3LmpzIiwid2VicGFjazovL21hZ2ljLy4vc3JjL2pzL3ZpZXdzL3NlYXJjaFZpZXcuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vbWFnaWMvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vbWFnaWMvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL21hZ2ljL3dlYnBhY2svcnVudGltZS9nbG9iYWwiLCJ3ZWJwYWNrOi8vbWFnaWMvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9tYWdpYy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL21hZ2ljL3dlYnBhY2svcnVudGltZS9wdWJsaWNQYXRoIiwid2VicGFjazovL21hZ2ljL3dlYnBhY2svc3RhcnR1cCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUEsNEZBQXVDLEM7Ozs7Ozs7Ozs7Ozs7O0FDQTFCOztBQUViLFlBQVksbUJBQU8sQ0FBQyxxREFBWTtBQUNoQyxhQUFhLG1CQUFPLENBQUMsaUVBQWtCO0FBQ3ZDLGNBQWMsbUJBQU8sQ0FBQyx5RUFBc0I7QUFDNUMsZUFBZSxtQkFBTyxDQUFDLDJFQUF1QjtBQUM5QyxvQkFBb0IsbUJBQU8sQ0FBQyw2RUFBdUI7QUFDbkQsbUJBQW1CLG1CQUFPLENBQUMsbUZBQTJCO0FBQ3RELHNCQUFzQixtQkFBTyxDQUFDLHlGQUE4QjtBQUM1RCxrQkFBa0IsbUJBQU8sQ0FBQyx5RUFBcUI7O0FBRS9DO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsNENBQTRDO0FBQzVDOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7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QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsYUFBYSxRQUFRO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsYUFBYSxRQUFRO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixhQUFhLFFBQVE7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsYUFBYSxRQUFRO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixhQUFhLFFBQVE7QUFDckI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixhQUFhLFFBQVE7QUFDckI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsYUFBYSxRQUFRO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQixhQUFhLFFBQVE7QUFDckI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FB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RSxTQUFTLG9GQUFvRixVQUFVLFVBQVUsa0JBQWtCLE1BQU0sa0JBQWtCLE1BQU0sWUFBWSxhQUFhLGFBQWEsYUFBYSxhQUFhLGFBQWEsbUJBQW1CLE1BQU0sa0JBQWtCLE1BQU0sWUFBWSxrQkFBa0IsTUFBTSxnQkFBZ0IsTUFBTSxrQkFBa0IsTUFBTSxrQkFBa0IsTUFBTSxrQkFBa0IsTUFBTSxZQUFZLGFBQWEsYUFBYSxhQUFhLG1CQUFtQixNQUFNLFVBQVUsWUFBWSxtQkFBbUIsTUFBTSxrQkFBa0IsTUFBTSxZQUFZLFdBQVcsWUFBWSxtQkFBbUIsTUFBTSxZQUFZLGFBQWEsaUJBQWlCLE1BQU0sVUFBVSxrQkFBa0IsTUFBTSxZQUFZLGlCQUFpQixLQUFLLFlBQVksV0FBVyxpQkFBaUIsTUFBTSxVQUFVLGtCQUFrQixNQUFNLFVBQVUsWUFBWSxhQUFhLGFBQWEsYUFBYSxrQkFBa0IsTUFBTSxpQkFBaUIsTUFBTSxlQUFlLE1BQU0sWUFBWSxXQUFXLGlCQUFpQixNQUFNLFlBQVksV0FBVyxpQkFBaUIsTUFBTSxlQUFlLE1BQU0sVUFBVSxZQUFZLGtCQUFrQixNQUFNLFVBQVUsWUFBWSxhQUFhLGFBQWEsYUFBYSxrQkFBa0IsTUFBTSxVQUFVLGVBQWUsTUFBTSxlQUFlLE1BQU0sVUFBVSxlQUFlLE1BQU0sVUFBVSxVQUFVLGlCQUFpQixNQUFNLGdCQUFnQixNQUFNLFVBQVUsWUFBWSxrQkFBa0IsTUFBTSxrQkFBa0IsTUFBTSxZQUFZLFdBQVcsWUFBWSxtQkFBbUIsTUFBTSxZQUFZLGFBQWEsaUJBQWlCLE1BQU0sVUFBVSxrQkFBa0IsTUFBTSxZQUFZLGlCQUFpQixLQUFLLFlBQVksV0FBVyxpQkFBaUIsTUFBTSxVQUFVLGtCQUFrQixNQUFNLFlBQVksYUFBYSxhQUFhLGFBQWEsV0FBVyxVQUFVLFlBQVksbUJBQW1CLE1BQU0saUJBQWlCLE1BQU0sVUFBVSxVQUFVLFlBQVksYUFBYSxhQUFhLGtCQUFrQixNQUFNLFVBQVUsVUFBVSxZQUFZLGtCQUFrQixNQUFNLGVBQWUsTUFBTSxVQUFVLFlBQVksZ0JBQWdCLEtBQUssVUFBVSxVQUFVLFlBQVksV0FBVyxZQUFZLGtCQUFrQixNQUFNLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLFVBQVUsaUJBQWlCLE1BQU0saUJBQWlCLE1BQU0sVUFBVSxVQUFVLGlCQUFpQixNQUFNLFVBQVUsaUJBQWlCLE1BQU0saUJBQWlCLE1BQU0sVUFBVSxVQUFVLGlCQUFpQixNQUFNLFlBQVksV0FBVyxpQkFBaUIsTUFBTSxVQUFVLGlCQUFpQixNQUFNLFVBQVUsWUFBWSxhQUFhLGtCQUFrQixNQUFNLFVBQVUsaUJBQWlCLE1BQU0sVUFBVSxZQUFZLGFBQWEsV0FBVyxVQUFVLFVBQVUsWUFBWSxhQUFhLGtCQUFrQixNQUFNLFVBQVUsVUFBVSxVQUFVLFlBQVksYUFBYSxXQUFXLFlBQVksa0JBQWtCLE1BQU0saUJBQWlCLE1BQU0saUJBQWlCLE1BQU0sWUFBWSxhQUFhLGFBQWEsV0FBVyxVQUFVLFVBQVUsWUFBWSxhQUFhLGtCQUFrQixNQUFNLGlCQUFpQixNQUFNLGVBQWUsTUFBTSxZQUFZLFdBQVcsaUJBQWlCLE1BQU0sZUFBZSxNQUFNLGlCQUFpQixNQUFNLFlBQVksa0JBQWtCLE1BQU0sVUFBVSxVQUFVLGtCQUFrQixNQUFNLGtCQUFrQixNQUFNLFlBQVksV0FBVyxVQUFVLGdCQUFnQixLQUFLLGtCQUFrQixNQUFNLFlBQVksV0FBVyxVQUFVLFlBQVksV0FBVyxpQkFBaUIsTUFBTSxVQUFVLGlCQUFpQixNQUFNLGVBQWUsTUFBTSxVQUFVLGlCQUFpQixNQUFNLFVBQVUsWUFBWSxhQUFhLGdCQUFnQixNQUFNLGlCQUFpQixNQUFNLFlBQVksa0JBQWtCLE1BQU0sVUFBVSxnQkFBZ0IsTUFBTSxVQUFVLFlBQVksYUFBYSxtQkFBbUIsTUFBTSxVQUFVLGlCQUFpQixNQUFNLGVBQWUsS0FBSyxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxVQUFVLFlBQVksYUFBYSxhQUFhLGFBQWEsa0JBQWtCLE1BQU0saUJBQWlCLE1BQU0saUJBQWlCLE1BQU0sWUFBWSxrQkFBa0IsTUFBTSxVQUFVLFVBQVUsWUFBWSxhQUFhLGFBQWEsV0FBVyxVQUFVLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLGtCQUFrQixNQUFNLFlBQVksV0FBVyxVQUFVLGVBQWUsS0FBSyxVQUFVLGdCQUFnQixNQUFNLGdCQUFnQixLQUFLLGdCQUFnQixNQUFNLFlBQVksV0FBVyxZQUFZLGFBQWEsa0JBQWtCLE1BQU0saUJBQWlCLE1BQU0sWUFBWSxXQUFXLGVBQWUsTUFBTSxVQUFVLFVBQVUsWUFBWSxXQUFXLFVBQVUsWUFBWSxhQUFhLGtCQUFrQixNQUFNLGlCQUFpQixNQUFNLFlBQVksV0FBVyxVQUFVLFVBQVUsVUFBVSxZQUFZLGtCQUFrQixNQUFNLFVBQVUsZUFBZSxNQUFNLFVBQVUsZ0JBQWdCLE1BQU0sVUFBVSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxVQUFVLGVBQWUsTUFBTSxZQUFZLFdBQVcsVUFBVSxpQkFBaUIsTUFBTSxZQUFZLGFBQWEsa0JBQWtCLE1BQU0saUJBQWlCLE1BQU0sWUFBWSxnQkFBZ0IsTUFBTSxVQUFVLFVBQVUsWUFBWSxXQUFXLFVBQVUsWUFBWSxrQkFBa0IsTUFBTSxpQkFBaUIsTUFBTSxZQUFZLFdBQVcsVUFBVSxZQUFZLFdBQVcsaUJBQWlCLE1BQU0sWUFBWSxrQkFBa0IsTUFBTSxVQUFVLGlCQUFpQixNQUFNLFlBQVksYUFBYSxrQkFBa0IsTUFBTSxVQUFVLFVBQVUsWUFBWSxhQUFhLGFBQWEsYUFBYSxrQkFBa0IsTUFBTSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxZQUFZLGtCQUFrQixNQUFNLFlBQVksa0JBQWtCLE1BQU0sWUFBWSxrQkFBa0IsTUFBTSxVQUFVLFlBQVksa0JBQWtCLE1BQU0sVUFBVSxpQkFBaUIsTUFBTSxVQUFVLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLFVBQVUsVUFBVSxZQUFZLGFBQWEsV0FBVyxZQUFZLFdBQVcsWUFBWSxr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Q0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRU87QUFDUCxNQUFNLDhFQUEyQztBQUNqRCxJQUFJLGlGQUE4QztBQUNsRCxJQUFJLDJFQUF3Qzs7QUFFNUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFTztBQUNQLE9BQU8sOEVBQTJDO0FBQ2xELElBQUksOEVBQTJDO0FBQy9DLElBQUksb0VBQWlDO0FBQ3JDO0FBQ0E7QUFDQTs7QUFFTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFTztBQUNQO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFTztBQUNQOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSx5Q0FBeUMsaUVBQThCO0FBQ3ZFOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLHVDQUF1QyxpRUFBOEI7QUFDckU7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVPO0FBQ1A7O0FBRUE7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRSwyRUFBd0M7QUFDMUM7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxrRUFBa0UsUUFBUTtBQUMxRTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsRUFBRSw4RUFBMkM7QUFDN0M7O0FBRU87QUFDUDtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIsOERBQTJCO0FBQzVDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxvRUFBaUM7QUFDckM7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7VUM5ckJBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3JCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsZ0NBQWdDLFlBQVk7V0FDNUM7V0FDQSxFOzs7OztXQ1BBO1dBQ0E7V0FDQTtXQUNBO1dBQ0Esd0NBQXdDLHlDQUF5QztXQUNqRjtXQUNBO1dBQ0EsRTs7Ozs7V0NQQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLEVBQUU7V0FDRjtXQUNBO1dBQ0EsQ0FBQyxJOzs7OztXQ1BELHNGOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHNEQUFzRCxrQkFBa0I7V0FDeEU7V0FDQSwrQ0FBK0MsY0FBYztXQUM3RCxFOzs7OztXQ05BO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLGtDOzs7O1VDZkE7VUFDQTtVQUNBO1VBQ0EiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9heGlvcycpOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIHNldHRsZSA9IHJlcXVpcmUoJy4vLi4vY29yZS9zZXR0bGUnKTtcbnZhciBjb29raWVzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2Nvb2tpZXMnKTtcbnZhciBidWlsZFVSTCA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9idWlsZFVSTCcpO1xudmFyIGJ1aWxkRnVsbFBhdGggPSByZXF1aXJlKCcuLi9jb3JlL2J1aWxkRnVsbFBhdGgnKTtcbnZhciBwYXJzZUhlYWRlcnMgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvcGFyc2VIZWFkZXJzJyk7XG52YXIgaXNVUkxTYW1lT3JpZ2luID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2lzVVJMU2FtZU9yaWdpbicpO1xudmFyIGNyZWF0ZUVycm9yID0gcmVxdWlyZSgnLi4vY29yZS9jcmVhdGVFcnJvcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHhockFkYXB0ZXIoY29uZmlnKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiBkaXNwYXRjaFhoclJlcXVlc3QocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgdmFyIHJlcXVlc3REYXRhID0gY29uZmlnLmRhdGE7XG4gICAgdmFyIHJlcXVlc3RIZWFkZXJzID0gY29uZmlnLmhlYWRlcnM7XG5cbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShyZXF1ZXN0RGF0YSkpIHtcbiAgICAgIGRlbGV0ZSByZXF1ZXN0SGVhZGVyc1snQ29udGVudC1UeXBlJ107IC8vIExldCB0aGUgYnJvd3NlciBzZXQgaXRcbiAgICB9XG5cbiAgICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgLy8gSFRUUCBiYXNpYyBhdXRoZW50aWNhdGlvblxuICAgIGlmIChjb25maWcuYXV0aCkge1xuICAgICAgdmFyIHVzZXJuYW1lID0gY29uZmlnLmF1dGgudXNlcm5hbWUgfHwgJyc7XG4gICAgICB2YXIgcGFzc3dvcmQgPSBjb25maWcuYXV0aC5wYXNzd29yZCA/IHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChjb25maWcuYXV0aC5wYXNzd29yZCkpIDogJyc7XG4gICAgICByZXF1ZXN0SGVhZGVycy5BdXRob3JpemF0aW9uID0gJ0Jhc2ljICcgKyBidG9hKHVzZXJuYW1lICsgJzonICsgcGFzc3dvcmQpO1xuICAgIH1cblxuICAgIHZhciBmdWxsUGF0aCA9IGJ1aWxkRnVsbFBhdGgoY29uZmlnLmJhc2VVUkwsIGNvbmZpZy51cmwpO1xuICAgIHJlcXVlc3Qub3Blbihjb25maWcubWV0aG9kLnRvVXBwZXJDYXNlKCksIGJ1aWxkVVJMKGZ1bGxQYXRoLCBjb25maWcucGFyYW1zLCBjb25maWcucGFyYW1zU2VyaWFsaXplciksIHRydWUpO1xuXG4gICAgLy8gU2V0IHRoZSByZXF1ZXN0IHRpbWVvdXQgaW4gTVNcbiAgICByZXF1ZXN0LnRpbWVvdXQgPSBjb25maWcudGltZW91dDtcblxuICAgIC8vIExpc3RlbiBmb3IgcmVhZHkgc3RhdGVcbiAgICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uIGhhbmRsZUxvYWQoKSB7XG4gICAgICBpZiAoIXJlcXVlc3QgfHwgcmVxdWVzdC5yZWFkeVN0YXRlICE9PSA0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gVGhlIHJlcXVlc3QgZXJyb3JlZCBvdXQgYW5kIHdlIGRpZG4ndCBnZXQgYSByZXNwb25zZSwgdGhpcyB3aWxsIGJlXG4gICAgICAvLyBoYW5kbGVkIGJ5IG9uZXJyb3IgaW5zdGVhZFxuICAgICAgLy8gV2l0aCBvbmUgZXhjZXB0aW9uOiByZXF1ZXN0IHRoYXQgdXNpbmcgZmlsZTogcHJvdG9jb2wsIG1vc3QgYnJvd3NlcnNcbiAgICAgIC8vIHdpbGwgcmV0dXJuIHN0YXR1cyBhcyAwIGV2ZW4gdGhvdWdoIGl0J3MgYSBzdWNjZXNzZnVsIHJlcXVlc3RcbiAgICAgIGlmIChyZXF1ZXN0LnN0YXR1cyA9PT0gMCAmJiAhKHJlcXVlc3QucmVzcG9uc2VVUkwgJiYgcmVxdWVzdC5yZXNwb25zZVVSTC5pbmRleE9mKCdmaWxlOicpID09PSAwKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFByZXBhcmUgdGhlIHJlc3BvbnNlXG4gICAgICB2YXIgcmVzcG9uc2VIZWFkZXJzID0gJ2dldEFsbFJlc3BvbnNlSGVhZGVycycgaW4gcmVxdWVzdCA/IHBhcnNlSGVhZGVycyhyZXF1ZXN0LmdldEFsbFJlc3BvbnNlSGVhZGVycygpKSA6IG51bGw7XG4gICAgICB2YXIgcmVzcG9uc2VEYXRhID0gIWNvbmZpZy5yZXNwb25zZVR5cGUgfHwgY29uZmlnLnJlc3BvbnNlVHlwZSA9PT0gJ3RleHQnID8gcmVxdWVzdC5yZXNwb25zZVRleHQgOiByZXF1ZXN0LnJlc3BvbnNlO1xuICAgICAgdmFyIHJlc3BvbnNlID0ge1xuICAgICAgICBkYXRhOiByZXNwb25zZURhdGEsXG4gICAgICAgIHN0YXR1czogcmVxdWVzdC5zdGF0dXMsXG4gICAgICAgIHN0YXR1c1RleHQ6IHJlcXVlc3Quc3RhdHVzVGV4dCxcbiAgICAgICAgaGVhZGVyczogcmVzcG9uc2VIZWFkZXJzLFxuICAgICAgICBjb25maWc6IGNvbmZpZyxcbiAgICAgICAgcmVxdWVzdDogcmVxdWVzdFxuICAgICAgfTtcblxuICAgICAgc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgcmVzcG9uc2UpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIGJyb3dzZXIgcmVxdWVzdCBjYW5jZWxsYXRpb24gKGFzIG9wcG9zZWQgdG8gYSBtYW51YWwgY2FuY2VsbGF0aW9uKVxuICAgIHJlcXVlc3Qub25hYm9ydCA9IGZ1bmN0aW9uIGhhbmRsZUFib3J0KCkge1xuICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKCdSZXF1ZXN0IGFib3J0ZWQnLCBjb25maWcsICdFQ09OTkFCT1JURUQnLCByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgbG93IGxldmVsIG5ldHdvcmsgZXJyb3JzXG4gICAgcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24gaGFuZGxlRXJyb3IoKSB7XG4gICAgICAvLyBSZWFsIGVycm9ycyBhcmUgaGlkZGVuIGZyb20gdXMgYnkgdGhlIGJyb3dzZXJcbiAgICAgIC8vIG9uZXJyb3Igc2hvdWxkIG9ubHkgZmlyZSBpZiBpdCdzIGEgbmV0d29yayBlcnJvclxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKCdOZXR3b3JrIEVycm9yJywgY29uZmlnLCBudWxsLCByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgdGltZW91dFxuICAgIHJlcXVlc3Qub250aW1lb3V0ID0gZnVuY3Rpb24gaGFuZGxlVGltZW91dCgpIHtcbiAgICAgIHZhciB0aW1lb3V0RXJyb3JNZXNzYWdlID0gJ3RpbWVvdXQgb2YgJyArIGNvbmZpZy50aW1lb3V0ICsgJ21zIGV4Y2VlZGVkJztcbiAgICAgIGlmIChjb25maWcudGltZW91dEVycm9yTWVzc2FnZSkge1xuICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlID0gY29uZmlnLnRpbWVvdXRFcnJvck1lc3NhZ2U7XG4gICAgICB9XG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IodGltZW91dEVycm9yTWVzc2FnZSwgY29uZmlnLCAnRUNPTk5BQk9SVEVEJyxcbiAgICAgICAgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gQWRkIHhzcmYgaGVhZGVyXG4gICAgLy8gVGhpcyBpcyBvbmx5IGRvbmUgaWYgcnVubmluZyBpbiBhIHN0YW5kYXJkIGJyb3dzZXIgZW52aXJvbm1lbnQuXG4gICAgLy8gU3BlY2lmaWNhbGx5IG5vdCBpZiB3ZSdyZSBpbiBhIHdlYiB3b3JrZXIsIG9yIHJlYWN0LW5hdGl2ZS5cbiAgICBpZiAodXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSkge1xuICAgICAgLy8gQWRkIHhzcmYgaGVhZGVyXG4gICAgICB2YXIgeHNyZlZhbHVlID0gKGNvbmZpZy53aXRoQ3JlZGVudGlhbHMgfHwgaXNVUkxTYW1lT3JpZ2luKGZ1bGxQYXRoKSkgJiYgY29uZmlnLnhzcmZDb29raWVOYW1lID9cbiAgICAgICAgY29va2llcy5yZWFkKGNvbmZpZy54c3JmQ29va2llTmFtZSkgOlxuICAgICAgICB1bmRlZmluZWQ7XG5cbiAgICAgIGlmICh4c3JmVmFsdWUpIHtcbiAgICAgICAgcmVxdWVzdEhlYWRlcnNbY29uZmlnLnhzcmZIZWFkZXJOYW1lXSA9IHhzcmZWYWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBZGQgaGVhZGVycyB0byB0aGUgcmVxdWVzdFxuICAgIGlmICgnc2V0UmVxdWVzdEhlYWRlcicgaW4gcmVxdWVzdCkge1xuICAgICAgdXRpbHMuZm9yRWFjaChyZXF1ZXN0SGVhZGVycywgZnVuY3Rpb24gc2V0UmVxdWVzdEhlYWRlcih2YWwsIGtleSkge1xuICAgICAgICBpZiAodHlwZW9mIHJlcXVlc3REYXRhID09PSAndW5kZWZpbmVkJyAmJiBrZXkudG9Mb3dlckNhc2UoKSA9PT0gJ2NvbnRlbnQtdHlwZScpIHtcbiAgICAgICAgICAvLyBSZW1vdmUgQ29udGVudC1UeXBlIGlmIGRhdGEgaXMgdW5kZWZpbmVkXG4gICAgICAgICAgZGVsZXRlIHJlcXVlc3RIZWFkZXJzW2tleV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gT3RoZXJ3aXNlIGFkZCBoZWFkZXIgdG8gdGhlIHJlcXVlc3RcbiAgICAgICAgICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoa2V5LCB2YWwpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBBZGQgd2l0aENyZWRlbnRpYWxzIHRvIHJlcXVlc3QgaWYgbmVlZGVkXG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcud2l0aENyZWRlbnRpYWxzKSkge1xuICAgICAgcmVxdWVzdC53aXRoQ3JlZGVudGlhbHMgPSAhIWNvbmZpZy53aXRoQ3JlZGVudGlhbHM7XG4gICAgfVxuXG4gICAgLy8gQWRkIHJlc3BvbnNlVHlwZSB0byByZXF1ZXN0IGlmIG5lZWRlZFxuICAgIGlmIChjb25maWcucmVzcG9uc2VUeXBlKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9IGNvbmZpZy5yZXNwb25zZVR5cGU7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIEV4cGVjdGVkIERPTUV4Y2VwdGlvbiB0aHJvd24gYnkgYnJvd3NlcnMgbm90IGNvbXBhdGlibGUgWE1MSHR0cFJlcXVlc3QgTGV2ZWwgMi5cbiAgICAgICAgLy8gQnV0LCB0aGlzIGNhbiBiZSBzdXBwcmVzc2VkIGZvciAnanNvbicgdHlwZSBhcyBpdCBjYW4gYmUgcGFyc2VkIGJ5IGRlZmF1bHQgJ3RyYW5zZm9ybVJlc3BvbnNlJyBmdW5jdGlvbi5cbiAgICAgICAgaWYgKGNvbmZpZy5yZXNwb25zZVR5cGUgIT09ICdqc29uJykge1xuICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgcHJvZ3Jlc3MgaWYgbmVlZGVkXG4gICAgaWYgKHR5cGVvZiBjb25maWcub25Eb3dubG9hZFByb2dyZXNzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgY29uZmlnLm9uRG93bmxvYWRQcm9ncmVzcyk7XG4gICAgfVxuXG4gICAgLy8gTm90IGFsbCBicm93c2VycyBzdXBwb3J0IHVwbG9hZCBldmVudHNcbiAgICBpZiAodHlwZW9mIGNvbmZpZy5vblVwbG9hZFByb2dyZXNzID09PSAnZnVuY3Rpb24nICYmIHJlcXVlc3QudXBsb2FkKSB7XG4gICAgICByZXF1ZXN0LnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGNvbmZpZy5vblVwbG9hZFByb2dyZXNzKTtcbiAgICB9XG5cbiAgICBpZiAoY29uZmlnLmNhbmNlbFRva2VuKSB7XG4gICAgICAvLyBIYW5kbGUgY2FuY2VsbGF0aW9uXG4gICAgICBjb25maWcuY2FuY2VsVG9rZW4ucHJvbWlzZS50aGVuKGZ1bmN0aW9uIG9uQ2FuY2VsZWQoY2FuY2VsKSB7XG4gICAgICAgIGlmICghcmVxdWVzdCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlcXVlc3QuYWJvcnQoKTtcbiAgICAgICAgcmVqZWN0KGNhbmNlbCk7XG4gICAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoIXJlcXVlc3REYXRhKSB7XG4gICAgICByZXF1ZXN0RGF0YSA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gU2VuZCB0aGUgcmVxdWVzdFxuICAgIHJlcXVlc3Quc2VuZChyZXF1ZXN0RGF0YSk7XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIGJpbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvYmluZCcpO1xudmFyIEF4aW9zID0gcmVxdWlyZSgnLi9jb3JlL0F4aW9zJyk7XG52YXIgbWVyZ2VDb25maWcgPSByZXF1aXJlKCcuL2NvcmUvbWVyZ2VDb25maWcnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4vZGVmYXVsdHMnKTtcblxuLyoqXG4gKiBDcmVhdGUgYW4gaW5zdGFuY2Ugb2YgQXhpb3NcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZGVmYXVsdENvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICogQHJldHVybiB7QXhpb3N9IEEgbmV3IGluc3RhbmNlIG9mIEF4aW9zXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUluc3RhbmNlKGRlZmF1bHRDb25maWcpIHtcbiAgdmFyIGNvbnRleHQgPSBuZXcgQXhpb3MoZGVmYXVsdENvbmZpZyk7XG4gIHZhciBpbnN0YW5jZSA9IGJpbmQoQXhpb3MucHJvdG90eXBlLnJlcXVlc3QsIGNvbnRleHQpO1xuXG4gIC8vIENvcHkgYXhpb3MucHJvdG90eXBlIHRvIGluc3RhbmNlXG4gIHV0aWxzLmV4dGVuZChpbnN0YW5jZSwgQXhpb3MucHJvdG90eXBlLCBjb250ZXh0KTtcblxuICAvLyBDb3B5IGNvbnRleHQgdG8gaW5zdGFuY2VcbiAgdXRpbHMuZXh0ZW5kKGluc3RhbmNlLCBjb250ZXh0KTtcblxuICByZXR1cm4gaW5zdGFuY2U7XG59XG5cbi8vIENyZWF0ZSB0aGUgZGVmYXVsdCBpbnN0YW5jZSB0byBiZSBleHBvcnRlZFxudmFyIGF4aW9zID0gY3JlYXRlSW5zdGFuY2UoZGVmYXVsdHMpO1xuXG4vLyBFeHBvc2UgQXhpb3MgY2xhc3MgdG8gYWxsb3cgY2xhc3MgaW5oZXJpdGFuY2VcbmF4aW9zLkF4aW9zID0gQXhpb3M7XG5cbi8vIEZhY3RvcnkgZm9yIGNyZWF0aW5nIG5ldyBpbnN0YW5jZXNcbmF4aW9zLmNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZShpbnN0YW5jZUNvbmZpZykge1xuICByZXR1cm4gY3JlYXRlSW5zdGFuY2UobWVyZ2VDb25maWcoYXhpb3MuZGVmYXVsdHMsIGluc3RhbmNlQ29uZmlnKSk7XG59O1xuXG4vLyBFeHBvc2UgQ2FuY2VsICYgQ2FuY2VsVG9rZW5cbmF4aW9zLkNhbmNlbCA9IHJlcXVpcmUoJy4vY2FuY2VsL0NhbmNlbCcpO1xuYXhpb3MuQ2FuY2VsVG9rZW4gPSByZXF1aXJlKCcuL2NhbmNlbC9DYW5jZWxUb2tlbicpO1xuYXhpb3MuaXNDYW5jZWwgPSByZXF1aXJlKCcuL2NhbmNlbC9pc0NhbmNlbCcpO1xuXG4vLyBFeHBvc2UgYWxsL3NwcmVhZFxuYXhpb3MuYWxsID0gZnVuY3Rpb24gYWxsKHByb21pc2VzKSB7XG4gIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcyk7XG59O1xuYXhpb3Muc3ByZWFkID0gcmVxdWlyZSgnLi9oZWxwZXJzL3NwcmVhZCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGF4aW9zO1xuXG4vLyBBbGxvdyB1c2Ugb2YgZGVmYXVsdCBpbXBvcnQgc3ludGF4IGluIFR5cGVTY3JpcHRcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBheGlvcztcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBBIGBDYW5jZWxgIGlzIGFuIG9iamVjdCB0aGF0IGlzIHRocm93biB3aGVuIGFuIG9wZXJhdGlvbiBpcyBjYW5jZWxlZC5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7c3RyaW5nPX0gbWVzc2FnZSBUaGUgbWVzc2FnZS5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsKG1lc3NhZ2UpIHtcbiAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbn1cblxuQ2FuY2VsLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICByZXR1cm4gJ0NhbmNlbCcgKyAodGhpcy5tZXNzYWdlID8gJzogJyArIHRoaXMubWVzc2FnZSA6ICcnKTtcbn07XG5cbkNhbmNlbC5wcm90b3R5cGUuX19DQU5DRUxfXyA9IHRydWU7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ2FuY2VsID0gcmVxdWlyZSgnLi9DYW5jZWwnKTtcblxuLyoqXG4gKiBBIGBDYW5jZWxUb2tlbmAgaXMgYW4gb2JqZWN0IHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVxdWVzdCBjYW5jZWxsYXRpb24gb2YgYW4gb3BlcmF0aW9uLlxuICpcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZXhlY3V0b3IgVGhlIGV4ZWN1dG9yIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBDYW5jZWxUb2tlbihleGVjdXRvcikge1xuICBpZiAodHlwZW9mIGV4ZWN1dG9yICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZXhlY3V0b3IgbXVzdCBiZSBhIGZ1bmN0aW9uLicpO1xuICB9XG5cbiAgdmFyIHJlc29sdmVQcm9taXNlO1xuICB0aGlzLnByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiBwcm9taXNlRXhlY3V0b3IocmVzb2x2ZSkge1xuICAgIHJlc29sdmVQcm9taXNlID0gcmVzb2x2ZTtcbiAgfSk7XG5cbiAgdmFyIHRva2VuID0gdGhpcztcbiAgZXhlY3V0b3IoZnVuY3Rpb24gY2FuY2VsKG1lc3NhZ2UpIHtcbiAgICBpZiAodG9rZW4ucmVhc29uKSB7XG4gICAgICAvLyBDYW5jZWxsYXRpb24gaGFzIGFscmVhZHkgYmVlbiByZXF1ZXN0ZWRcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0b2tlbi5yZWFzb24gPSBuZXcgQ2FuY2VsKG1lc3NhZ2UpO1xuICAgIHJlc29sdmVQcm9taXNlKHRva2VuLnJlYXNvbik7XG4gIH0pO1xufVxuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbkNhbmNlbFRva2VuLnByb3RvdHlwZS50aHJvd0lmUmVxdWVzdGVkID0gZnVuY3Rpb24gdGhyb3dJZlJlcXVlc3RlZCgpIHtcbiAgaWYgKHRoaXMucmVhc29uKSB7XG4gICAgdGhyb3cgdGhpcy5yZWFzb247XG4gIH1cbn07XG5cbi8qKlxuICogUmV0dXJucyBhbiBvYmplY3QgdGhhdCBjb250YWlucyBhIG5ldyBgQ2FuY2VsVG9rZW5gIGFuZCBhIGZ1bmN0aW9uIHRoYXQsIHdoZW4gY2FsbGVkLFxuICogY2FuY2VscyB0aGUgYENhbmNlbFRva2VuYC5cbiAqL1xuQ2FuY2VsVG9rZW4uc291cmNlID0gZnVuY3Rpb24gc291cmNlKCkge1xuICB2YXIgY2FuY2VsO1xuICB2YXIgdG9rZW4gPSBuZXcgQ2FuY2VsVG9rZW4oZnVuY3Rpb24gZXhlY3V0b3IoYykge1xuICAgIGNhbmNlbCA9IGM7XG4gIH0pO1xuICByZXR1cm4ge1xuICAgIHRva2VuOiB0b2tlbixcbiAgICBjYW5jZWw6IGNhbmNlbFxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW5jZWxUb2tlbjtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0NhbmNlbCh2YWx1ZSkge1xuICByZXR1cm4gISEodmFsdWUgJiYgdmFsdWUuX19DQU5DRUxfXyk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgYnVpbGRVUkwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2J1aWxkVVJMJyk7XG52YXIgSW50ZXJjZXB0b3JNYW5hZ2VyID0gcmVxdWlyZSgnLi9JbnRlcmNlcHRvck1hbmFnZXInKTtcbnZhciBkaXNwYXRjaFJlcXVlc3QgPSByZXF1aXJlKCcuL2Rpc3BhdGNoUmVxdWVzdCcpO1xudmFyIG1lcmdlQ29uZmlnID0gcmVxdWlyZSgnLi9tZXJnZUNvbmZpZycpO1xuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBpbnN0YW5jZUNvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICovXG5mdW5jdGlvbiBBeGlvcyhpbnN0YW5jZUNvbmZpZykge1xuICB0aGlzLmRlZmF1bHRzID0gaW5zdGFuY2VDb25maWc7XG4gIHRoaXMuaW50ZXJjZXB0b3JzID0ge1xuICAgIHJlcXVlc3Q6IG5ldyBJbnRlcmNlcHRvck1hbmFnZXIoKSxcbiAgICByZXNwb25zZTogbmV3IEludGVyY2VwdG9yTWFuYWdlcigpXG4gIH07XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnIHNwZWNpZmljIGZvciB0aGlzIHJlcXVlc3QgKG1lcmdlZCB3aXRoIHRoaXMuZGVmYXVsdHMpXG4gKi9cbkF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0ID0gZnVuY3Rpb24gcmVxdWVzdChjb25maWcpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIC8vIEFsbG93IGZvciBheGlvcygnZXhhbXBsZS91cmwnWywgY29uZmlnXSkgYSBsYSBmZXRjaCBBUElcbiAgaWYgKHR5cGVvZiBjb25maWcgPT09ICdzdHJpbmcnKSB7XG4gICAgY29uZmlnID0gYXJndW1lbnRzWzFdIHx8IHt9O1xuICAgIGNvbmZpZy51cmwgPSBhcmd1bWVudHNbMF07XG4gIH0gZWxzZSB7XG4gICAgY29uZmlnID0gY29uZmlnIHx8IHt9O1xuICB9XG5cbiAgY29uZmlnID0gbWVyZ2VDb25maWcodGhpcy5kZWZhdWx0cywgY29uZmlnKTtcblxuICAvLyBTZXQgY29uZmlnLm1ldGhvZFxuICBpZiAoY29uZmlnLm1ldGhvZCkge1xuICAgIGNvbmZpZy5tZXRob2QgPSBjb25maWcubWV0aG9kLnRvTG93ZXJDYXNlKCk7XG4gIH0gZWxzZSBpZiAodGhpcy5kZWZhdWx0cy5tZXRob2QpIHtcbiAgICBjb25maWcubWV0aG9kID0gdGhpcy5kZWZhdWx0cy5tZXRob2QudG9Mb3dlckNhc2UoKTtcbiAgfSBlbHNlIHtcbiAgICBjb25maWcubWV0aG9kID0gJ2dldCc7XG4gIH1cblxuICAvLyBIb29rIHVwIGludGVyY2VwdG9ycyBtaWRkbGV3YXJlXG4gIHZhciBjaGFpbiA9IFtkaXNwYXRjaFJlcXVlc3QsIHVuZGVmaW5lZF07XG4gIHZhciBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKGNvbmZpZyk7XG5cbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVxdWVzdC5mb3JFYWNoKGZ1bmN0aW9uIHVuc2hpZnRSZXF1ZXN0SW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgY2hhaW4udW5zaGlmdChpbnRlcmNlcHRvci5mdWxmaWxsZWQsIGludGVyY2VwdG9yLnJlamVjdGVkKTtcbiAgfSk7XG5cbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVzcG9uc2UuZm9yRWFjaChmdW5jdGlvbiBwdXNoUmVzcG9uc2VJbnRlcmNlcHRvcnMoaW50ZXJjZXB0b3IpIHtcbiAgICBjaGFpbi5wdXNoKGludGVyY2VwdG9yLmZ1bGZpbGxlZCwgaW50ZXJjZXB0b3IucmVqZWN0ZWQpO1xuICB9KTtcblxuICB3aGlsZSAoY2hhaW4ubGVuZ3RoKSB7XG4gICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihjaGFpbi5zaGlmdCgpLCBjaGFpbi5zaGlmdCgpKTtcbiAgfVxuXG4gIHJldHVybiBwcm9taXNlO1xufTtcblxuQXhpb3MucHJvdG90eXBlLmdldFVyaSA9IGZ1bmN0aW9uIGdldFVyaShjb25maWcpIHtcbiAgY29uZmlnID0gbWVyZ2VDb25maWcodGhpcy5kZWZhdWx0cywgY29uZmlnKTtcbiAgcmV0dXJuIGJ1aWxkVVJMKGNvbmZpZy51cmwsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKS5yZXBsYWNlKC9eXFw/LywgJycpO1xufTtcblxuLy8gUHJvdmlkZSBhbGlhc2VzIGZvciBzdXBwb3J0ZWQgcmVxdWVzdCBtZXRob2RzXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ29wdGlvbnMnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZE5vRGF0YShtZXRob2QpIHtcbiAgLyplc2xpbnQgZnVuYy1uYW1lczowKi9cbiAgQXhpb3MucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih1cmwsIGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QobWVyZ2VDb25maWcoY29uZmlnIHx8IHt9LCB7XG4gICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgIHVybDogdXJsLFxuICAgICAgZGF0YTogKGNvbmZpZyB8fCB7fSkuZGF0YVxuICAgIH0pKTtcbiAgfTtcbn0pO1xuXG51dGlscy5mb3JFYWNoKFsncG9zdCcsICdwdXQnLCAncGF0Y2gnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZFdpdGhEYXRhKG1ldGhvZCkge1xuICAvKmVzbGludCBmdW5jLW5hbWVzOjAqL1xuICBBeGlvcy5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgY29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChtZXJnZUNvbmZpZyhjb25maWcgfHwge30sIHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgdXJsOiB1cmwsXG4gICAgICBkYXRhOiBkYXRhXG4gICAgfSkpO1xuICB9O1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQXhpb3M7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuZnVuY3Rpb24gSW50ZXJjZXB0b3JNYW5hZ2VyKCkge1xuICB0aGlzLmhhbmRsZXJzID0gW107XG59XG5cbi8qKlxuICogQWRkIGEgbmV3IGludGVyY2VwdG9yIHRvIHRoZSBzdGFja1xuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bGZpbGxlZCBUaGUgZnVuY3Rpb24gdG8gaGFuZGxlIGB0aGVuYCBmb3IgYSBgUHJvbWlzZWBcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlamVjdGVkIFRoZSBmdW5jdGlvbiB0byBoYW5kbGUgYHJlamVjdGAgZm9yIGEgYFByb21pc2VgXG4gKlxuICogQHJldHVybiB7TnVtYmVyfSBBbiBJRCB1c2VkIHRvIHJlbW92ZSBpbnRlcmNlcHRvciBsYXRlclxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uIHVzZShmdWxmaWxsZWQsIHJlamVjdGVkKSB7XG4gIHRoaXMuaGFuZGxlcnMucHVzaCh7XG4gICAgZnVsZmlsbGVkOiBmdWxmaWxsZWQsXG4gICAgcmVqZWN0ZWQ6IHJlamVjdGVkXG4gIH0pO1xuICByZXR1cm4gdGhpcy5oYW5kbGVycy5sZW5ndGggLSAxO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYW4gaW50ZXJjZXB0b3IgZnJvbSB0aGUgc3RhY2tcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gaWQgVGhlIElEIHRoYXQgd2FzIHJldHVybmVkIGJ5IGB1c2VgXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUuZWplY3QgPSBmdW5jdGlvbiBlamVjdChpZCkge1xuICBpZiAodGhpcy5oYW5kbGVyc1tpZF0pIHtcbiAgICB0aGlzLmhhbmRsZXJzW2lkXSA9IG51bGw7XG4gIH1cbn07XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFsbCB0aGUgcmVnaXN0ZXJlZCBpbnRlcmNlcHRvcnNcbiAqXG4gKiBUaGlzIG1ldGhvZCBpcyBwYXJ0aWN1bGFybHkgdXNlZnVsIGZvciBza2lwcGluZyBvdmVyIGFueVxuICogaW50ZXJjZXB0b3JzIHRoYXQgbWF5IGhhdmUgYmVjb21lIGBudWxsYCBjYWxsaW5nIGBlamVjdGAuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggaW50ZXJjZXB0b3JcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gZm9yRWFjaChmbikge1xuICB1dGlscy5mb3JFYWNoKHRoaXMuaGFuZGxlcnMsIGZ1bmN0aW9uIGZvckVhY2hIYW5kbGVyKGgpIHtcbiAgICBpZiAoaCAhPT0gbnVsbCkge1xuICAgICAgZm4oaCk7XG4gICAgfVxuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJjZXB0b3JNYW5hZ2VyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaXNBYnNvbHV0ZVVSTCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvaXNBYnNvbHV0ZVVSTCcpO1xudmFyIGNvbWJpbmVVUkxzID0gcmVxdWlyZSgnLi4vaGVscGVycy9jb21iaW5lVVJMcycpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgVVJMIGJ5IGNvbWJpbmluZyB0aGUgYmFzZVVSTCB3aXRoIHRoZSByZXF1ZXN0ZWRVUkwsXG4gKiBvbmx5IHdoZW4gdGhlIHJlcXVlc3RlZFVSTCBpcyBub3QgYWxyZWFkeSBhbiBhYnNvbHV0ZSBVUkwuXG4gKiBJZiB0aGUgcmVxdWVzdFVSTCBpcyBhYnNvbHV0ZSwgdGhpcyBmdW5jdGlvbiByZXR1cm5zIHRoZSByZXF1ZXN0ZWRVUkwgdW50b3VjaGVkLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlcXVlc3RlZFVSTCBBYnNvbHV0ZSBvciByZWxhdGl2ZSBVUkwgdG8gY29tYmluZVxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGNvbWJpbmVkIGZ1bGwgcGF0aFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJ1aWxkRnVsbFBhdGgoYmFzZVVSTCwgcmVxdWVzdGVkVVJMKSB7XG4gIGlmIChiYXNlVVJMICYmICFpc0Fic29sdXRlVVJMKHJlcXVlc3RlZFVSTCkpIHtcbiAgICByZXR1cm4gY29tYmluZVVSTHMoYmFzZVVSTCwgcmVxdWVzdGVkVVJMKTtcbiAgfVxuICByZXR1cm4gcmVxdWVzdGVkVVJMO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGVuaGFuY2VFcnJvciA9IHJlcXVpcmUoJy4vZW5oYW5jZUVycm9yJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBtZXNzYWdlLCBjb25maWcsIGVycm9yIGNvZGUsIHJlcXVlc3QgYW5kIHJlc3BvbnNlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIFRoZSBlcnJvciBtZXNzYWdlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBjcmVhdGVkIGVycm9yLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZUVycm9yKG1lc3NhZ2UsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgdmFyIGVycm9yID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xuICByZXR1cm4gZW5oYW5jZUVycm9yKGVycm9yLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciB0cmFuc2Zvcm1EYXRhID0gcmVxdWlyZSgnLi90cmFuc2Zvcm1EYXRhJyk7XG52YXIgaXNDYW5jZWwgPSByZXF1aXJlKCcuLi9jYW5jZWwvaXNDYW5jZWwnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4uL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogVGhyb3dzIGEgYENhbmNlbGAgaWYgY2FuY2VsbGF0aW9uIGhhcyBiZWVuIHJlcXVlc3RlZC5cbiAqL1xuZnVuY3Rpb24gdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpIHtcbiAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgIGNvbmZpZy5jYW5jZWxUb2tlbi50aHJvd0lmUmVxdWVzdGVkKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBEaXNwYXRjaCBhIHJlcXVlc3QgdG8gdGhlIHNlcnZlciB1c2luZyB0aGUgY29uZmlndXJlZCBhZGFwdGVyLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZyB0aGF0IGlzIHRvIGJlIHVzZWQgZm9yIHRoZSByZXF1ZXN0XG4gKiBAcmV0dXJucyB7UHJvbWlzZX0gVGhlIFByb21pc2UgdG8gYmUgZnVsZmlsbGVkXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGlzcGF0Y2hSZXF1ZXN0KGNvbmZpZykge1xuICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgLy8gRW5zdXJlIGhlYWRlcnMgZXhpc3RcbiAgY29uZmlnLmhlYWRlcnMgPSBjb25maWcuaGVhZGVycyB8fCB7fTtcblxuICAvLyBUcmFuc2Zvcm0gcmVxdWVzdCBkYXRhXG4gIGNvbmZpZy5kYXRhID0gdHJhbnNmb3JtRGF0YShcbiAgICBjb25maWcuZGF0YSxcbiAgICBjb25maWcuaGVhZGVycyxcbiAgICBjb25maWcudHJhbnNmb3JtUmVxdWVzdFxuICApO1xuXG4gIC8vIEZsYXR0ZW4gaGVhZGVyc1xuICBjb25maWcuaGVhZGVycyA9IHV0aWxzLm1lcmdlKFxuICAgIGNvbmZpZy5oZWFkZXJzLmNvbW1vbiB8fCB7fSxcbiAgICBjb25maWcuaGVhZGVyc1tjb25maWcubWV0aG9kXSB8fCB7fSxcbiAgICBjb25maWcuaGVhZGVyc1xuICApO1xuXG4gIHV0aWxzLmZvckVhY2goXG4gICAgWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnLCAncG9zdCcsICdwdXQnLCAncGF0Y2gnLCAnY29tbW9uJ10sXG4gICAgZnVuY3Rpb24gY2xlYW5IZWFkZXJDb25maWcobWV0aG9kKSB7XG4gICAgICBkZWxldGUgY29uZmlnLmhlYWRlcnNbbWV0aG9kXTtcbiAgICB9XG4gICk7XG5cbiAgdmFyIGFkYXB0ZXIgPSBjb25maWcuYWRhcHRlciB8fCBkZWZhdWx0cy5hZGFwdGVyO1xuXG4gIHJldHVybiBhZGFwdGVyKGNvbmZpZykudGhlbihmdW5jdGlvbiBvbkFkYXB0ZXJSZXNvbHV0aW9uKHJlc3BvbnNlKSB7XG4gICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgLy8gVHJhbnNmb3JtIHJlc3BvbnNlIGRhdGFcbiAgICByZXNwb25zZS5kYXRhID0gdHJhbnNmb3JtRGF0YShcbiAgICAgIHJlc3BvbnNlLmRhdGEsXG4gICAgICByZXNwb25zZS5oZWFkZXJzLFxuICAgICAgY29uZmlnLnRyYW5zZm9ybVJlc3BvbnNlXG4gICAgKTtcblxuICAgIHJldHVybiByZXNwb25zZTtcbiAgfSwgZnVuY3Rpb24gb25BZGFwdGVyUmVqZWN0aW9uKHJlYXNvbikge1xuICAgIGlmICghaXNDYW5jZWwocmVhc29uKSkge1xuICAgICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgICAvLyBUcmFuc2Zvcm0gcmVzcG9uc2UgZGF0YVxuICAgICAgaWYgKHJlYXNvbiAmJiByZWFzb24ucmVzcG9uc2UpIHtcbiAgICAgICAgcmVhc29uLnJlc3BvbnNlLmRhdGEgPSB0cmFuc2Zvcm1EYXRhKFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhLFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5oZWFkZXJzLFxuICAgICAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChyZWFzb24pO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVXBkYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBjb25maWcsIGVycm9yIGNvZGUsIGFuZCByZXNwb25zZS5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJvciBUaGUgZXJyb3IgdG8gdXBkYXRlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBlcnJvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgZXJyb3IuY29uZmlnID0gY29uZmlnO1xuICBpZiAoY29kZSkge1xuICAgIGVycm9yLmNvZGUgPSBjb2RlO1xuICB9XG5cbiAgZXJyb3IucmVxdWVzdCA9IHJlcXVlc3Q7XG4gIGVycm9yLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gIGVycm9yLmlzQXhpb3NFcnJvciA9IHRydWU7XG5cbiAgZXJyb3IudG9KU09OID0gZnVuY3Rpb24gdG9KU09OKCkge1xuICAgIHJldHVybiB7XG4gICAgICAvLyBTdGFuZGFyZFxuICAgICAgbWVzc2FnZTogdGhpcy5tZXNzYWdlLFxuICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgLy8gTWljcm9zb2Z0XG4gICAgICBkZXNjcmlwdGlvbjogdGhpcy5kZXNjcmlwdGlvbixcbiAgICAgIG51bWJlcjogdGhpcy5udW1iZXIsXG4gICAgICAvLyBNb3ppbGxhXG4gICAgICBmaWxlTmFtZTogdGhpcy5maWxlTmFtZSxcbiAgICAgIGxpbmVOdW1iZXI6IHRoaXMubGluZU51bWJlcixcbiAgICAgIGNvbHVtbk51bWJlcjogdGhpcy5jb2x1bW5OdW1iZXIsXG4gICAgICBzdGFjazogdGhpcy5zdGFjayxcbiAgICAgIC8vIEF4aW9zXG4gICAgICBjb25maWc6IHRoaXMuY29uZmlnLFxuICAgICAgY29kZTogdGhpcy5jb2RlXG4gICAgfTtcbiAgfTtcbiAgcmV0dXJuIGVycm9yO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxuLyoqXG4gKiBDb25maWctc3BlY2lmaWMgbWVyZ2UtZnVuY3Rpb24gd2hpY2ggY3JlYXRlcyBhIG5ldyBjb25maWctb2JqZWN0XG4gKiBieSBtZXJnaW5nIHR3byBjb25maWd1cmF0aW9uIG9iamVjdHMgdG9nZXRoZXIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZzFcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcyXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBOZXcgb2JqZWN0IHJlc3VsdGluZyBmcm9tIG1lcmdpbmcgY29uZmlnMiB0byBjb25maWcxXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbWVyZ2VDb25maWcoY29uZmlnMSwgY29uZmlnMikge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgY29uZmlnMiA9IGNvbmZpZzIgfHwge307XG4gIHZhciBjb25maWcgPSB7fTtcblxuICB2YXIgdmFsdWVGcm9tQ29uZmlnMktleXMgPSBbJ3VybCcsICdtZXRob2QnLCAnZGF0YSddO1xuICB2YXIgbWVyZ2VEZWVwUHJvcGVydGllc0tleXMgPSBbJ2hlYWRlcnMnLCAnYXV0aCcsICdwcm94eScsICdwYXJhbXMnXTtcbiAgdmFyIGRlZmF1bHRUb0NvbmZpZzJLZXlzID0gW1xuICAgICdiYXNlVVJMJywgJ3RyYW5zZm9ybVJlcXVlc3QnLCAndHJhbnNmb3JtUmVzcG9uc2UnLCAncGFyYW1zU2VyaWFsaXplcicsXG4gICAgJ3RpbWVvdXQnLCAndGltZW91dE1lc3NhZ2UnLCAnd2l0aENyZWRlbnRpYWxzJywgJ2FkYXB0ZXInLCAncmVzcG9uc2VUeXBlJywgJ3hzcmZDb29raWVOYW1lJyxcbiAgICAneHNyZkhlYWRlck5hbWUnLCAnb25VcGxvYWRQcm9ncmVzcycsICdvbkRvd25sb2FkUHJvZ3Jlc3MnLCAnZGVjb21wcmVzcycsXG4gICAgJ21heENvbnRlbnRMZW5ndGgnLCAnbWF4Qm9keUxlbmd0aCcsICdtYXhSZWRpcmVjdHMnLCAndHJhbnNwb3J0JywgJ2h0dHBBZ2VudCcsXG4gICAgJ2h0dHBzQWdlbnQnLCAnY2FuY2VsVG9rZW4nLCAnc29ja2V0UGF0aCcsICdyZXNwb25zZUVuY29kaW5nJ1xuICBdO1xuICB2YXIgZGlyZWN0TWVyZ2VLZXlzID0gWyd2YWxpZGF0ZVN0YXR1cyddO1xuXG4gIGZ1bmN0aW9uIGdldE1lcmdlZFZhbHVlKHRhcmdldCwgc291cmNlKSB7XG4gICAgaWYgKHV0aWxzLmlzUGxhaW5PYmplY3QodGFyZ2V0KSAmJiB1dGlscy5pc1BsYWluT2JqZWN0KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiB1dGlscy5tZXJnZSh0YXJnZXQsIHNvdXJjZSk7XG4gICAgfSBlbHNlIGlmICh1dGlscy5pc1BsYWluT2JqZWN0KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiB1dGlscy5tZXJnZSh7fSwgc291cmNlKTtcbiAgICB9IGVsc2UgaWYgKHV0aWxzLmlzQXJyYXkoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHNvdXJjZS5zbGljZSgpO1xuICAgIH1cbiAgICByZXR1cm4gc291cmNlO1xuICB9XG5cbiAgZnVuY3Rpb24gbWVyZ2VEZWVwUHJvcGVydGllcyhwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUoY29uZmlnMVtwcm9wXSwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMVtwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9XG5cbiAgdXRpbHMuZm9yRWFjaCh2YWx1ZUZyb21Db25maWcyS2V5cywgZnVuY3Rpb24gdmFsdWVGcm9tQ29uZmlnMihwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcyW3Byb3BdKTtcbiAgICB9XG4gIH0pO1xuXG4gIHV0aWxzLmZvckVhY2gobWVyZ2VEZWVwUHJvcGVydGllc0tleXMsIG1lcmdlRGVlcFByb3BlcnRpZXMpO1xuXG4gIHV0aWxzLmZvckVhY2goZGVmYXVsdFRvQ29uZmlnMktleXMsIGZ1bmN0aW9uIGRlZmF1bHRUb0NvbmZpZzIocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMVtwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9KTtcblxuICB1dGlscy5mb3JFYWNoKGRpcmVjdE1lcmdlS2V5cywgZnVuY3Rpb24gbWVyZ2UocHJvcCkge1xuICAgIGlmIChwcm9wIGluIGNvbmZpZzIpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKGNvbmZpZzFbcHJvcF0sIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAocHJvcCBpbiBjb25maWcxKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIGF4aW9zS2V5cyA9IHZhbHVlRnJvbUNvbmZpZzJLZXlzXG4gICAgLmNvbmNhdChtZXJnZURlZXBQcm9wZXJ0aWVzS2V5cylcbiAgICAuY29uY2F0KGRlZmF1bHRUb0NvbmZpZzJLZXlzKVxuICAgIC5jb25jYXQoZGlyZWN0TWVyZ2VLZXlzKTtcblxuICB2YXIgb3RoZXJLZXlzID0gT2JqZWN0XG4gICAgLmtleXMoY29uZmlnMSlcbiAgICAuY29uY2F0KE9iamVjdC5rZXlzKGNvbmZpZzIpKVxuICAgIC5maWx0ZXIoZnVuY3Rpb24gZmlsdGVyQXhpb3NLZXlzKGtleSkge1xuICAgICAgcmV0dXJuIGF4aW9zS2V5cy5pbmRleE9mKGtleSkgPT09IC0xO1xuICAgIH0pO1xuXG4gIHV0aWxzLmZvckVhY2gob3RoZXJLZXlzLCBtZXJnZURlZXBQcm9wZXJ0aWVzKTtcblxuICByZXR1cm4gY29uZmlnO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNyZWF0ZUVycm9yID0gcmVxdWlyZSgnLi9jcmVhdGVFcnJvcicpO1xuXG4vKipcbiAqIFJlc29sdmUgb3IgcmVqZWN0IGEgUHJvbWlzZSBiYXNlZCBvbiByZXNwb25zZSBzdGF0dXMuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVzb2x2ZSBBIGZ1bmN0aW9uIHRoYXQgcmVzb2x2ZXMgdGhlIHByb21pc2UuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWplY3QgQSBmdW5jdGlvbiB0aGF0IHJlamVjdHMgdGhlIHByb21pc2UuXG4gKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgVGhlIHJlc3BvbnNlLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHJlc3BvbnNlKSB7XG4gIHZhciB2YWxpZGF0ZVN0YXR1cyA9IHJlc3BvbnNlLmNvbmZpZy52YWxpZGF0ZVN0YXR1cztcbiAgaWYgKCFyZXNwb25zZS5zdGF0dXMgfHwgIXZhbGlkYXRlU3RhdHVzIHx8IHZhbGlkYXRlU3RhdHVzKHJlc3BvbnNlLnN0YXR1cykpIHtcbiAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgfSBlbHNlIHtcbiAgICByZWplY3QoY3JlYXRlRXJyb3IoXG4gICAgICAnUmVxdWVzdCBmYWlsZWQgd2l0aCBzdGF0dXMgY29kZSAnICsgcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgcmVzcG9uc2UuY29uZmlnLFxuICAgICAgbnVsbCxcbiAgICAgIHJlc3BvbnNlLnJlcXVlc3QsXG4gICAgICByZXNwb25zZVxuICAgICkpO1xuICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbi8qKlxuICogVHJhbnNmb3JtIHRoZSBkYXRhIGZvciBhIHJlcXVlc3Qgb3IgYSByZXNwb25zZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gZGF0YSBUaGUgZGF0YSB0byBiZSB0cmFuc2Zvcm1lZFxuICogQHBhcmFtIHtBcnJheX0gaGVhZGVycyBUaGUgaGVhZGVycyBmb3IgdGhlIHJlcXVlc3Qgb3IgcmVzcG9uc2VcbiAqIEBwYXJhbSB7QXJyYXl8RnVuY3Rpb259IGZucyBBIHNpbmdsZSBmdW5jdGlvbiBvciBBcnJheSBvZiBmdW5jdGlvbnNcbiAqIEByZXR1cm5zIHsqfSBUaGUgcmVzdWx0aW5nIHRyYW5zZm9ybWVkIGRhdGFcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0cmFuc2Zvcm1EYXRhKGRhdGEsIGhlYWRlcnMsIGZucykge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgdXRpbHMuZm9yRWFjaChmbnMsIGZ1bmN0aW9uIHRyYW5zZm9ybShmbikge1xuICAgIGRhdGEgPSBmbihkYXRhLCBoZWFkZXJzKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGRhdGE7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgbm9ybWFsaXplSGVhZGVyTmFtZSA9IHJlcXVpcmUoJy4vaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lJyk7XG5cbnZhciBERUZBVUxUX0NPTlRFTlRfVFlQRSA9IHtcbiAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG59O1xuXG5mdW5jdGlvbiBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgdmFsdWUpIHtcbiAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzKSAmJiB1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzWydDb250ZW50LVR5cGUnXSkpIHtcbiAgICBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9IHZhbHVlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldERlZmF1bHRBZGFwdGVyKCkge1xuICB2YXIgYWRhcHRlcjtcbiAgaWYgKHR5cGVvZiBYTUxIdHRwUmVxdWVzdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBGb3IgYnJvd3NlcnMgdXNlIFhIUiBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4vYWRhcHRlcnMveGhyJyk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChwcm9jZXNzKSA9PT0gJ1tvYmplY3QgcHJvY2Vzc10nKSB7XG4gICAgLy8gRm9yIG5vZGUgdXNlIEhUVFAgYWRhcHRlclxuICAgIGFkYXB0ZXIgPSByZXF1aXJlKCcuL2FkYXB0ZXJzL2h0dHAnKTtcbiAgfVxuICByZXR1cm4gYWRhcHRlcjtcbn1cblxudmFyIGRlZmF1bHRzID0ge1xuICBhZGFwdGVyOiBnZXREZWZhdWx0QWRhcHRlcigpLFxuXG4gIHRyYW5zZm9ybVJlcXVlc3Q6IFtmdW5jdGlvbiB0cmFuc2Zvcm1SZXF1ZXN0KGRhdGEsIGhlYWRlcnMpIHtcbiAgICBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsICdBY2NlcHQnKTtcbiAgICBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsICdDb250ZW50LVR5cGUnKTtcbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNBcnJheUJ1ZmZlcihkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzU3RyZWFtKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0ZpbGUoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQmxvYihkYXRhKVxuICAgICkge1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc0FycmF5QnVmZmVyVmlldyhkYXRhKSkge1xuICAgICAgcmV0dXJuIGRhdGEuYnVmZmVyO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMoZGF0YSkpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc09iamVjdChkYXRhKSkge1xuICAgICAgc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsICdhcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIHRyYW5zZm9ybVJlc3BvbnNlOiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVzcG9uc2UoZGF0YSkge1xuICAgIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGRhdGEgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgfSBjYXRjaCAoZSkgeyAvKiBJZ25vcmUgKi8gfVxuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgLyoqXG4gICAqIEEgdGltZW91dCBpbiBtaWxsaXNlY29uZHMgdG8gYWJvcnQgYSByZXF1ZXN0LiBJZiBzZXQgdG8gMCAoZGVmYXVsdCkgYVxuICAgKiB0aW1lb3V0IGlzIG5vdCBjcmVhdGVkLlxuICAgKi9cbiAgdGltZW91dDogMCxcblxuICB4c3JmQ29va2llTmFtZTogJ1hTUkYtVE9LRU4nLFxuICB4c3JmSGVhZGVyTmFtZTogJ1gtWFNSRi1UT0tFTicsXG5cbiAgbWF4Q29udGVudExlbmd0aDogLTEsXG4gIG1heEJvZHlMZW5ndGg6IC0xLFxuXG4gIHZhbGlkYXRlU3RhdHVzOiBmdW5jdGlvbiB2YWxpZGF0ZVN0YXR1cyhzdGF0dXMpIHtcbiAgICByZXR1cm4gc3RhdHVzID49IDIwMCAmJiBzdGF0dXMgPCAzMDA7XG4gIH1cbn07XG5cbmRlZmF1bHRzLmhlYWRlcnMgPSB7XG4gIGNvbW1vbjoge1xuICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbiwgdGV4dC9wbGFpbiwgKi8qJ1xuICB9XG59O1xuXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2ROb0RhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHt9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHV0aWxzLm1lcmdlKERFRkFVTFRfQ09OVEVOVF9UWVBFKTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmF1bHRzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJpbmQoZm4sIHRoaXNBcmcpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHdyYXAoKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhcmdzW2ldID0gYXJndW1lbnRzW2ldO1xuICAgIH1cbiAgICByZXR1cm4gZm4uYXBwbHkodGhpc0FyZywgYXJncyk7XG4gIH07XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbmZ1bmN0aW9uIGVuY29kZSh2YWwpIHtcbiAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudCh2YWwpLlxuICAgIHJlcGxhY2UoLyUzQS9naSwgJzonKS5cbiAgICByZXBsYWNlKC8lMjQvZywgJyQnKS5cbiAgICByZXBsYWNlKC8lMkMvZ2ksICcsJykuXG4gICAgcmVwbGFjZSgvJTIwL2csICcrJykuXG4gICAgcmVwbGFjZSgvJTVCL2dpLCAnWycpLlxuICAgIHJlcGxhY2UoLyU1RC9naSwgJ10nKTtcbn1cblxuLyoqXG4gKiBCdWlsZCBhIFVSTCBieSBhcHBlbmRpbmcgcGFyYW1zIHRvIHRoZSBlbmRcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIFRoZSBiYXNlIG9mIHRoZSB1cmwgKGUuZy4sIGh0dHA6Ly93d3cuZ29vZ2xlLmNvbSlcbiAqIEBwYXJhbSB7b2JqZWN0fSBbcGFyYW1zXSBUaGUgcGFyYW1zIHRvIGJlIGFwcGVuZGVkXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgZm9ybWF0dGVkIHVybFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJ1aWxkVVJMKHVybCwgcGFyYW1zLCBwYXJhbXNTZXJpYWxpemVyKSB7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICBpZiAoIXBhcmFtcykge1xuICAgIHJldHVybiB1cmw7XG4gIH1cblxuICB2YXIgc2VyaWFsaXplZFBhcmFtcztcbiAgaWYgKHBhcmFtc1NlcmlhbGl6ZXIpIHtcbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFyYW1zU2VyaWFsaXplcihwYXJhbXMpO1xuICB9IGVsc2UgaWYgKHV0aWxzLmlzVVJMU2VhcmNoUGFyYW1zKHBhcmFtcykpIHtcbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFyYW1zLnRvU3RyaW5nKCk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIHBhcnRzID0gW107XG5cbiAgICB1dGlscy5mb3JFYWNoKHBhcmFtcywgZnVuY3Rpb24gc2VyaWFsaXplKHZhbCwga2V5KSB7XG4gICAgICBpZiAodmFsID09PSBudWxsIHx8IHR5cGVvZiB2YWwgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHV0aWxzLmlzQXJyYXkodmFsKSkge1xuICAgICAgICBrZXkgPSBrZXkgKyAnW10nO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsID0gW3ZhbF07XG4gICAgICB9XG5cbiAgICAgIHV0aWxzLmZvckVhY2godmFsLCBmdW5jdGlvbiBwYXJzZVZhbHVlKHYpIHtcbiAgICAgICAgaWYgKHV0aWxzLmlzRGF0ZSh2KSkge1xuICAgICAgICAgIHYgPSB2LnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodXRpbHMuaXNPYmplY3QodikpIHtcbiAgICAgICAgICB2ID0gSlNPTi5zdHJpbmdpZnkodik7XG4gICAgICAgIH1cbiAgICAgICAgcGFydHMucHVzaChlbmNvZGUoa2V5KSArICc9JyArIGVuY29kZSh2KSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJ0cy5qb2luKCcmJyk7XG4gIH1cblxuICBpZiAoc2VyaWFsaXplZFBhcmFtcykge1xuICAgIHZhciBoYXNobWFya0luZGV4ID0gdXJsLmluZGV4T2YoJyMnKTtcbiAgICBpZiAoaGFzaG1hcmtJbmRleCAhPT0gLTEpIHtcbiAgICAgIHVybCA9IHVybC5zbGljZSgwLCBoYXNobWFya0luZGV4KTtcbiAgICB9XG5cbiAgICB1cmwgKz0gKHVybC5pbmRleE9mKCc/JykgPT09IC0xID8gJz8nIDogJyYnKSArIHNlcmlhbGl6ZWRQYXJhbXM7XG4gIH1cblxuICByZXR1cm4gdXJsO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IFVSTCBieSBjb21iaW5pbmcgdGhlIHNwZWNpZmllZCBVUkxzXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VVUkwgVGhlIGJhc2UgVVJMXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpdmVVUkwgVGhlIHJlbGF0aXZlIFVSTFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGNvbWJpbmVkIFVSTFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNvbWJpbmVVUkxzKGJhc2VVUkwsIHJlbGF0aXZlVVJMKSB7XG4gIHJldHVybiByZWxhdGl2ZVVSTFxuICAgID8gYmFzZVVSTC5yZXBsYWNlKC9cXC8rJC8sICcnKSArICcvJyArIHJlbGF0aXZlVVJMLnJlcGxhY2UoL15cXC8rLywgJycpXG4gICAgOiBiYXNlVVJMO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChcbiAgdXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSA/XG5cbiAgLy8gU3RhbmRhcmQgYnJvd3NlciBlbnZzIHN1cHBvcnQgZG9jdW1lbnQuY29va2llXG4gICAgKGZ1bmN0aW9uIHN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHdyaXRlOiBmdW5jdGlvbiB3cml0ZShuYW1lLCB2YWx1ZSwgZXhwaXJlcywgcGF0aCwgZG9tYWluLCBzZWN1cmUpIHtcbiAgICAgICAgICB2YXIgY29va2llID0gW107XG4gICAgICAgICAgY29va2llLnB1c2gobmFtZSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpO1xuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzTnVtYmVyKGV4cGlyZXMpKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnZXhwaXJlcz0nICsgbmV3IERhdGUoZXhwaXJlcykudG9HTVRTdHJpbmcoKSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzU3RyaW5nKHBhdGgpKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgncGF0aD0nICsgcGF0aCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzU3RyaW5nKGRvbWFpbikpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdkb21haW49JyArIGRvbWFpbik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHNlY3VyZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ3NlY3VyZScpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGRvY3VtZW50LmNvb2tpZSA9IGNvb2tpZS5qb2luKCc7ICcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlYWQ6IGZ1bmN0aW9uIHJlYWQobmFtZSkge1xuICAgICAgICAgIHZhciBtYXRjaCA9IGRvY3VtZW50LmNvb2tpZS5tYXRjaChuZXcgUmVnRXhwKCcoXnw7XFxcXHMqKSgnICsgbmFtZSArICcpPShbXjtdKiknKSk7XG4gICAgICAgICAgcmV0dXJuIChtYXRjaCA/IGRlY29kZVVSSUNvbXBvbmVudChtYXRjaFszXSkgOiBudWxsKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZShuYW1lKSB7XG4gICAgICAgICAgdGhpcy53cml0ZShuYW1lLCAnJywgRGF0ZS5ub3coKSAtIDg2NDAwMDAwKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KSgpIDpcblxuICAvLyBOb24gc3RhbmRhcmQgYnJvd3NlciBlbnYgKHdlYiB3b3JrZXJzLCByZWFjdC1uYXRpdmUpIGxhY2sgbmVlZGVkIHN1cHBvcnQuXG4gICAgKGZ1bmN0aW9uIG5vblN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHdyaXRlOiBmdW5jdGlvbiB3cml0ZSgpIHt9LFxuICAgICAgICByZWFkOiBmdW5jdGlvbiByZWFkKCkgeyByZXR1cm4gbnVsbDsgfSxcbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7fVxuICAgICAgfTtcbiAgICB9KSgpXG4pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVGhlIFVSTCB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBYnNvbHV0ZVVSTCh1cmwpIHtcbiAgLy8gQSBVUkwgaXMgY29uc2lkZXJlZCBhYnNvbHV0ZSBpZiBpdCBiZWdpbnMgd2l0aCBcIjxzY2hlbWU+Oi8vXCIgb3IgXCIvL1wiIChwcm90b2NvbC1yZWxhdGl2ZSBVUkwpLlxuICAvLyBSRkMgMzk4NiBkZWZpbmVzIHNjaGVtZSBuYW1lIGFzIGEgc2VxdWVuY2Ugb2YgY2hhcmFjdGVycyBiZWdpbm5pbmcgd2l0aCBhIGxldHRlciBhbmQgZm9sbG93ZWRcbiAgLy8gYnkgYW55IGNvbWJpbmF0aW9uIG9mIGxldHRlcnMsIGRpZ2l0cywgcGx1cywgcGVyaW9kLCBvciBoeXBoZW4uXG4gIHJldHVybiAvXihbYS16XVthLXpcXGRcXCtcXC1cXC5dKjopP1xcL1xcLy9pLnRlc3QodXJsKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoXG4gIHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkgP1xuXG4gIC8vIFN0YW5kYXJkIGJyb3dzZXIgZW52cyBoYXZlIGZ1bGwgc3VwcG9ydCBvZiB0aGUgQVBJcyBuZWVkZWQgdG8gdGVzdFxuICAvLyB3aGV0aGVyIHRoZSByZXF1ZXN0IFVSTCBpcyBvZiB0aGUgc2FtZSBvcmlnaW4gYXMgY3VycmVudCBsb2NhdGlvbi5cbiAgICAoZnVuY3Rpb24gc3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgdmFyIG1zaWUgPSAvKG1zaWV8dHJpZGVudCkvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuICAgICAgdmFyIHVybFBhcnNpbmdOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgdmFyIG9yaWdpblVSTDtcblxuICAgICAgLyoqXG4gICAgKiBQYXJzZSBhIFVSTCB0byBkaXNjb3ZlciBpdCdzIGNvbXBvbmVudHNcbiAgICAqXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsIFRoZSBVUkwgdG8gYmUgcGFyc2VkXG4gICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgICovXG4gICAgICBmdW5jdGlvbiByZXNvbHZlVVJMKHVybCkge1xuICAgICAgICB2YXIgaHJlZiA9IHVybDtcblxuICAgICAgICBpZiAobXNpZSkge1xuICAgICAgICAvLyBJRSBuZWVkcyBhdHRyaWJ1dGUgc2V0IHR3aWNlIHRvIG5vcm1hbGl6ZSBwcm9wZXJ0aWVzXG4gICAgICAgICAgdXJsUGFyc2luZ05vZGUuc2V0QXR0cmlidXRlKCdocmVmJywgaHJlZik7XG4gICAgICAgICAgaHJlZiA9IHVybFBhcnNpbmdOb2RlLmhyZWY7XG4gICAgICAgIH1cblxuICAgICAgICB1cmxQYXJzaW5nTm9kZS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBocmVmKTtcblxuICAgICAgICAvLyB1cmxQYXJzaW5nTm9kZSBwcm92aWRlcyB0aGUgVXJsVXRpbHMgaW50ZXJmYWNlIC0gaHR0cDovL3VybC5zcGVjLndoYXR3Zy5vcmcvI3VybHV0aWxzXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaHJlZjogdXJsUGFyc2luZ05vZGUuaHJlZixcbiAgICAgICAgICBwcm90b2NvbDogdXJsUGFyc2luZ05vZGUucHJvdG9jb2wgPyB1cmxQYXJzaW5nTm9kZS5wcm90b2NvbC5yZXBsYWNlKC86JC8sICcnKSA6ICcnLFxuICAgICAgICAgIGhvc3Q6IHVybFBhcnNpbmdOb2RlLmhvc3QsXG4gICAgICAgICAgc2VhcmNoOiB1cmxQYXJzaW5nTm9kZS5zZWFyY2ggPyB1cmxQYXJzaW5nTm9kZS5zZWFyY2gucmVwbGFjZSgvXlxcPy8sICcnKSA6ICcnLFxuICAgICAgICAgIGhhc2g6IHVybFBhcnNpbmdOb2RlLmhhc2ggPyB1cmxQYXJzaW5nTm9kZS5oYXNoLnJlcGxhY2UoL14jLywgJycpIDogJycsXG4gICAgICAgICAgaG9zdG5hbWU6IHVybFBhcnNpbmdOb2RlLmhvc3RuYW1lLFxuICAgICAgICAgIHBvcnQ6IHVybFBhcnNpbmdOb2RlLnBvcnQsXG4gICAgICAgICAgcGF0aG5hbWU6ICh1cmxQYXJzaW5nTm9kZS5wYXRobmFtZS5jaGFyQXQoMCkgPT09ICcvJykgP1xuICAgICAgICAgICAgdXJsUGFyc2luZ05vZGUucGF0aG5hbWUgOlxuICAgICAgICAgICAgJy8nICsgdXJsUGFyc2luZ05vZGUucGF0aG5hbWVcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgb3JpZ2luVVJMID0gcmVzb2x2ZVVSTCh3aW5kb3cubG9jYXRpb24uaHJlZik7XG5cbiAgICAgIC8qKlxuICAgICogRGV0ZXJtaW5lIGlmIGEgVVJMIHNoYXJlcyB0aGUgc2FtZSBvcmlnaW4gYXMgdGhlIGN1cnJlbnQgbG9jYXRpb25cbiAgICAqXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gcmVxdWVzdFVSTCBUaGUgVVJMIHRvIHRlc3RcbiAgICAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIFVSTCBzaGFyZXMgdGhlIHNhbWUgb3JpZ2luLCBvdGhlcndpc2UgZmFsc2VcbiAgICAqL1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIGlzVVJMU2FtZU9yaWdpbihyZXF1ZXN0VVJMKSB7XG4gICAgICAgIHZhciBwYXJzZWQgPSAodXRpbHMuaXNTdHJpbmcocmVxdWVzdFVSTCkpID8gcmVzb2x2ZVVSTChyZXF1ZXN0VVJMKSA6IHJlcXVlc3RVUkw7XG4gICAgICAgIHJldHVybiAocGFyc2VkLnByb3RvY29sID09PSBvcmlnaW5VUkwucHJvdG9jb2wgJiZcbiAgICAgICAgICAgIHBhcnNlZC5ob3N0ID09PSBvcmlnaW5VUkwuaG9zdCk7XG4gICAgICB9O1xuICAgIH0pKCkgOlxuXG4gIC8vIE5vbiBzdGFuZGFyZCBicm93c2VyIGVudnMgKHdlYiB3b3JrZXJzLCByZWFjdC1uYXRpdmUpIGxhY2sgbmVlZGVkIHN1cHBvcnQuXG4gICAgKGZ1bmN0aW9uIG5vblN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiBpc1VSTFNhbWVPcmlnaW4oKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfTtcbiAgICB9KSgpXG4pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgbm9ybWFsaXplZE5hbWUpIHtcbiAgdXRpbHMuZm9yRWFjaChoZWFkZXJzLCBmdW5jdGlvbiBwcm9jZXNzSGVhZGVyKHZhbHVlLCBuYW1lKSB7XG4gICAgaWYgKG5hbWUgIT09IG5vcm1hbGl6ZWROYW1lICYmIG5hbWUudG9VcHBlckNhc2UoKSA9PT0gbm9ybWFsaXplZE5hbWUudG9VcHBlckNhc2UoKSkge1xuICAgICAgaGVhZGVyc1tub3JtYWxpemVkTmFtZV0gPSB2YWx1ZTtcbiAgICAgIGRlbGV0ZSBoZWFkZXJzW25hbWVdO1xuICAgIH1cbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbi8vIEhlYWRlcnMgd2hvc2UgZHVwbGljYXRlcyBhcmUgaWdub3JlZCBieSBub2RlXG4vLyBjLmYuIGh0dHBzOi8vbm9kZWpzLm9yZy9hcGkvaHR0cC5odG1sI2h0dHBfbWVzc2FnZV9oZWFkZXJzXG52YXIgaWdub3JlRHVwbGljYXRlT2YgPSBbXG4gICdhZ2UnLCAnYXV0aG9yaXphdGlvbicsICdjb250ZW50LWxlbmd0aCcsICdjb250ZW50LXR5cGUnLCAnZXRhZycsXG4gICdleHBpcmVzJywgJ2Zyb20nLCAnaG9zdCcsICdpZi1tb2RpZmllZC1zaW5jZScsICdpZi11bm1vZGlmaWVkLXNpbmNlJyxcbiAgJ2xhc3QtbW9kaWZpZWQnLCAnbG9jYXRpb24nLCAnbWF4LWZvcndhcmRzJywgJ3Byb3h5LWF1dGhvcml6YXRpb24nLFxuICAncmVmZXJlcicsICdyZXRyeS1hZnRlcicsICd1c2VyLWFnZW50J1xuXTtcblxuLyoqXG4gKiBQYXJzZSBoZWFkZXJzIGludG8gYW4gb2JqZWN0XG4gKlxuICogYGBgXG4gKiBEYXRlOiBXZWQsIDI3IEF1ZyAyMDE0IDA4OjU4OjQ5IEdNVFxuICogQ29udGVudC1UeXBlOiBhcHBsaWNhdGlvbi9qc29uXG4gKiBDb25uZWN0aW9uOiBrZWVwLWFsaXZlXG4gKiBUcmFuc2Zlci1FbmNvZGluZzogY2h1bmtlZFxuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGhlYWRlcnMgSGVhZGVycyBuZWVkaW5nIHRvIGJlIHBhcnNlZFxuICogQHJldHVybnMge09iamVjdH0gSGVhZGVycyBwYXJzZWQgaW50byBhbiBvYmplY3RcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwYXJzZUhlYWRlcnMoaGVhZGVycykge1xuICB2YXIgcGFyc2VkID0ge307XG4gIHZhciBrZXk7XG4gIHZhciB2YWw7XG4gIHZhciBpO1xuXG4gIGlmICghaGVhZGVycykgeyByZXR1cm4gcGFyc2VkOyB9XG5cbiAgdXRpbHMuZm9yRWFjaChoZWFkZXJzLnNwbGl0KCdcXG4nKSwgZnVuY3Rpb24gcGFyc2VyKGxpbmUpIHtcbiAgICBpID0gbGluZS5pbmRleE9mKCc6Jyk7XG4gICAga2V5ID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cigwLCBpKSkudG9Mb3dlckNhc2UoKTtcbiAgICB2YWwgPSB1dGlscy50cmltKGxpbmUuc3Vic3RyKGkgKyAxKSk7XG5cbiAgICBpZiAoa2V5KSB7XG4gICAgICBpZiAocGFyc2VkW2tleV0gJiYgaWdub3JlRHVwbGljYXRlT2YuaW5kZXhPZihrZXkpID49IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGtleSA9PT0gJ3NldC1jb29raWUnKSB7XG4gICAgICAgIHBhcnNlZFtrZXldID0gKHBhcnNlZFtrZXldID8gcGFyc2VkW2tleV0gOiBbXSkuY29uY2F0KFt2YWxdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcnNlZFtrZXldID0gcGFyc2VkW2tleV0gPyBwYXJzZWRba2V5XSArICcsICcgKyB2YWwgOiB2YWw7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gcGFyc2VkO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBTeW50YWN0aWMgc3VnYXIgZm9yIGludm9raW5nIGEgZnVuY3Rpb24gYW5kIGV4cGFuZGluZyBhbiBhcnJheSBmb3IgYXJndW1lbnRzLlxuICpcbiAqIENvbW1vbiB1c2UgY2FzZSB3b3VsZCBiZSB0byB1c2UgYEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseWAuXG4gKlxuICogIGBgYGpzXG4gKiAgZnVuY3Rpb24gZih4LCB5LCB6KSB7fVxuICogIHZhciBhcmdzID0gWzEsIDIsIDNdO1xuICogIGYuYXBwbHkobnVsbCwgYXJncyk7XG4gKiAgYGBgXG4gKlxuICogV2l0aCBgc3ByZWFkYCB0aGlzIGV4YW1wbGUgY2FuIGJlIHJlLXdyaXR0ZW4uXG4gKlxuICogIGBgYGpzXG4gKiAgc3ByZWFkKGZ1bmN0aW9uKHgsIHksIHopIHt9KShbMSwgMiwgM10pO1xuICogIGBgYFxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc3ByZWFkKGNhbGxiYWNrKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKGFycikge1xuICAgIHJldHVybiBjYWxsYmFjay5hcHBseShudWxsLCBhcnIpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGJpbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvYmluZCcpO1xuXG4vKmdsb2JhbCB0b1N0cmluZzp0cnVlKi9cblxuLy8gdXRpbHMgaXMgYSBsaWJyYXJ5IG9mIGdlbmVyaWMgaGVscGVyIGZ1bmN0aW9ucyBub24tc3BlY2lmaWMgdG8gYXhpb3NcblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyB1bmRlZmluZWRcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmFsdWUgaXMgdW5kZWZpbmVkLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVbmRlZmluZWQodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgQnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNCdWZmZXIodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgIWlzVW5kZWZpbmVkKHZhbCkgJiYgdmFsLmNvbnN0cnVjdG9yICE9PSBudWxsICYmICFpc1VuZGVmaW5lZCh2YWwuY29uc3RydWN0b3IpXG4gICAgJiYgdHlwZW9mIHZhbC5jb25zdHJ1Y3Rvci5pc0J1ZmZlciA9PT0gJ2Z1bmN0aW9uJyAmJiB2YWwuY29uc3RydWN0b3IuaXNCdWZmZXIodmFsKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5QnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlcih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZvcm1EYXRhXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gRm9ybURhdGEsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Zvcm1EYXRhKHZhbCkge1xuICByZXR1cm4gKHR5cGVvZiBGb3JtRGF0YSAhPT0gJ3VuZGVmaW5lZCcpICYmICh2YWwgaW5zdGFuY2VvZiBGb3JtRGF0YSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSB2aWV3IG9uIGFuIEFycmF5QnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSB2aWV3IG9uIGFuIEFycmF5QnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlclZpZXcodmFsKSB7XG4gIHZhciByZXN1bHQ7XG4gIGlmICgodHlwZW9mIEFycmF5QnVmZmVyICE9PSAndW5kZWZpbmVkJykgJiYgKEFycmF5QnVmZmVyLmlzVmlldykpIHtcbiAgICByZXN1bHQgPSBBcnJheUJ1ZmZlci5pc1ZpZXcodmFsKTtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQgPSAodmFsKSAmJiAodmFsLmJ1ZmZlcikgJiYgKHZhbC5idWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcik7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFN0cmluZ1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgU3RyaW5nLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTdHJpbmcodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAnc3RyaW5nJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIE51bWJlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgTnVtYmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNOdW1iZXIodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAnbnVtYmVyJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBPYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBPYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0Jztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIHBsYWluIE9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBwbGFpbiBPYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1BsYWluT2JqZWN0KHZhbCkge1xuICBpZiAodG9TdHJpbmcuY2FsbCh2YWwpICE9PSAnW29iamVjdCBPYmplY3RdJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBwcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsKTtcbiAgcmV0dXJuIHByb3RvdHlwZSA9PT0gbnVsbCB8fCBwcm90b3R5cGUgPT09IE9iamVjdC5wcm90b3R5cGU7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBEYXRlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBEYXRlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNEYXRlKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGaWxlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBGaWxlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGaWxlKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGaWxlXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBCbG9iXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBCbG9iLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNCbG9iKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBCbG9iXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGdW5jdGlvblxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRnVuY3Rpb24sIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgU3RyZWFtXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBTdHJlYW0sIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N0cmVhbSh2YWwpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHZhbCkgJiYgaXNGdW5jdGlvbih2YWwucGlwZSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVUkxTZWFyY2hQYXJhbXModmFsKSB7XG4gIHJldHVybiB0eXBlb2YgVVJMU2VhcmNoUGFyYW1zICE9PSAndW5kZWZpbmVkJyAmJiB2YWwgaW5zdGFuY2VvZiBVUkxTZWFyY2hQYXJhbXM7XG59XG5cbi8qKlxuICogVHJpbSBleGNlc3Mgd2hpdGVzcGFjZSBvZmYgdGhlIGJlZ2lubmluZyBhbmQgZW5kIG9mIGEgc3RyaW5nXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0ciBUaGUgU3RyaW5nIHRvIHRyaW1cbiAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBTdHJpbmcgZnJlZWQgb2YgZXhjZXNzIHdoaXRlc3BhY2VcbiAqL1xuZnVuY3Rpb24gdHJpbShzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzKi8sICcnKS5yZXBsYWNlKC9cXHMqJC8sICcnKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgd2UncmUgcnVubmluZyBpbiBhIHN0YW5kYXJkIGJyb3dzZXIgZW52aXJvbm1lbnRcbiAqXG4gKiBUaGlzIGFsbG93cyBheGlvcyB0byBydW4gaW4gYSB3ZWIgd29ya2VyLCBhbmQgcmVhY3QtbmF0aXZlLlxuICogQm90aCBlbnZpcm9ubWVudHMgc3VwcG9ydCBYTUxIdHRwUmVxdWVzdCwgYnV0IG5vdCBmdWxseSBzdGFuZGFyZCBnbG9iYWxzLlxuICpcbiAqIHdlYiB3b3JrZXJzOlxuICogIHR5cGVvZiB3aW5kb3cgLT4gdW5kZWZpbmVkXG4gKiAgdHlwZW9mIGRvY3VtZW50IC0+IHVuZGVmaW5lZFxuICpcbiAqIHJlYWN0LW5hdGl2ZTpcbiAqICBuYXZpZ2F0b3IucHJvZHVjdCAtPiAnUmVhY3ROYXRpdmUnXG4gKiBuYXRpdmVzY3JpcHRcbiAqICBuYXZpZ2F0b3IucHJvZHVjdCAtPiAnTmF0aXZlU2NyaXB0JyBvciAnTlMnXG4gKi9cbmZ1bmN0aW9uIGlzU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICBpZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgKG5hdmlnYXRvci5wcm9kdWN0ID09PSAnUmVhY3ROYXRpdmUnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLnByb2R1Y3QgPT09ICdOYXRpdmVTY3JpcHQnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLnByb2R1Y3QgPT09ICdOUycpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiAoXG4gICAgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnXG4gICk7XG59XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFuIEFycmF5IG9yIGFuIE9iamVjdCBpbnZva2luZyBhIGZ1bmN0aW9uIGZvciBlYWNoIGl0ZW0uXG4gKlxuICogSWYgYG9iamAgaXMgYW4gQXJyYXkgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgcGFzc2luZ1xuICogdGhlIHZhbHVlLCBpbmRleCwgYW5kIGNvbXBsZXRlIGFycmF5IGZvciBlYWNoIGl0ZW0uXG4gKlxuICogSWYgJ29iaicgaXMgYW4gT2JqZWN0IGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIHBhc3NpbmdcbiAqIHRoZSB2YWx1ZSwga2V5LCBhbmQgY29tcGxldGUgb2JqZWN0IGZvciBlYWNoIHByb3BlcnR5LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fEFycmF5fSBvYmogVGhlIG9iamVjdCB0byBpdGVyYXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgY2FsbGJhY2sgdG8gaW52b2tlIGZvciBlYWNoIGl0ZW1cbiAqL1xuZnVuY3Rpb24gZm9yRWFjaChvYmosIGZuKSB7XG4gIC8vIERvbid0IGJvdGhlciBpZiBubyB2YWx1ZSBwcm92aWRlZFxuICBpZiAob2JqID09PSBudWxsIHx8IHR5cGVvZiBvYmogPT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gRm9yY2UgYW4gYXJyYXkgaWYgbm90IGFscmVhZHkgc29tZXRoaW5nIGl0ZXJhYmxlXG4gIGlmICh0eXBlb2Ygb2JqICE9PSAnb2JqZWN0Jykge1xuICAgIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAgIG9iaiA9IFtvYmpdO1xuICB9XG5cbiAgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgIC8vIEl0ZXJhdGUgb3ZlciBhcnJheSB2YWx1ZXNcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IG9iai5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGZuLmNhbGwobnVsbCwgb2JqW2ldLCBpLCBvYmopO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBJdGVyYXRlIG92ZXIgb2JqZWN0IGtleXNcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkge1xuICAgICAgICBmbi5jYWxsKG51bGwsIG9ialtrZXldLCBrZXksIG9iaik7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQWNjZXB0cyB2YXJhcmdzIGV4cGVjdGluZyBlYWNoIGFyZ3VtZW50IHRvIGJlIGFuIG9iamVjdCwgdGhlblxuICogaW1tdXRhYmx5IG1lcmdlcyB0aGUgcHJvcGVydGllcyBvZiBlYWNoIG9iamVjdCBhbmQgcmV0dXJucyByZXN1bHQuXG4gKlxuICogV2hlbiBtdWx0aXBsZSBvYmplY3RzIGNvbnRhaW4gdGhlIHNhbWUga2V5IHRoZSBsYXRlciBvYmplY3QgaW5cbiAqIHRoZSBhcmd1bWVudHMgbGlzdCB3aWxsIHRha2UgcHJlY2VkZW5jZS5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqIGBgYGpzXG4gKiB2YXIgcmVzdWx0ID0gbWVyZ2Uoe2ZvbzogMTIzfSwge2ZvbzogNDU2fSk7XG4gKiBjb25zb2xlLmxvZyhyZXN1bHQuZm9vKTsgLy8gb3V0cHV0cyA0NTZcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmoxIE9iamVjdCB0byBtZXJnZVxuICogQHJldHVybnMge09iamVjdH0gUmVzdWx0IG9mIGFsbCBtZXJnZSBwcm9wZXJ0aWVzXG4gKi9cbmZ1bmN0aW9uIG1lcmdlKC8qIG9iajEsIG9iajIsIG9iajMsIC4uLiAqLykge1xuICB2YXIgcmVzdWx0ID0ge307XG4gIGZ1bmN0aW9uIGFzc2lnblZhbHVlKHZhbCwga2V5KSB7XG4gICAgaWYgKGlzUGxhaW5PYmplY3QocmVzdWx0W2tleV0pICYmIGlzUGxhaW5PYmplY3QodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSBtZXJnZShyZXN1bHRba2V5XSwgdmFsKTtcbiAgICB9IGVsc2UgaWYgKGlzUGxhaW5PYmplY3QodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSBtZXJnZSh7fSwgdmFsKTtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWwuc2xpY2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWw7XG4gICAgfVxuICB9XG5cbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgZm9yRWFjaChhcmd1bWVudHNbaV0sIGFzc2lnblZhbHVlKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEV4dGVuZHMgb2JqZWN0IGEgYnkgbXV0YWJseSBhZGRpbmcgdG8gaXQgdGhlIHByb3BlcnRpZXMgb2Ygb2JqZWN0IGIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGEgVGhlIG9iamVjdCB0byBiZSBleHRlbmRlZFxuICogQHBhcmFtIHtPYmplY3R9IGIgVGhlIG9iamVjdCB0byBjb3B5IHByb3BlcnRpZXMgZnJvbVxuICogQHBhcmFtIHtPYmplY3R9IHRoaXNBcmcgVGhlIG9iamVjdCB0byBiaW5kIGZ1bmN0aW9uIHRvXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSByZXN1bHRpbmcgdmFsdWUgb2Ygb2JqZWN0IGFcbiAqL1xuZnVuY3Rpb24gZXh0ZW5kKGEsIGIsIHRoaXNBcmcpIHtcbiAgZm9yRWFjaChiLCBmdW5jdGlvbiBhc3NpZ25WYWx1ZSh2YWwsIGtleSkge1xuICAgIGlmICh0aGlzQXJnICYmIHR5cGVvZiB2YWwgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGFba2V5XSA9IGJpbmQodmFsLCB0aGlzQXJnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYVtrZXldID0gdmFsO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBhO1xufVxuXG4vKipcbiAqIFJlbW92ZSBieXRlIG9yZGVyIG1hcmtlci4gVGhpcyBjYXRjaGVzIEVGIEJCIEJGICh0aGUgVVRGLTggQk9NKVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZW50IHdpdGggQk9NXG4gKiBAcmV0dXJuIHtzdHJpbmd9IGNvbnRlbnQgdmFsdWUgd2l0aG91dCBCT01cbiAqL1xuZnVuY3Rpb24gc3RyaXBCT00oY29udGVudCkge1xuICBpZiAoY29udGVudC5jaGFyQ29kZUF0KDApID09PSAweEZFRkYpIHtcbiAgICBjb250ZW50ID0gY29udGVudC5zbGljZSgxKTtcbiAgfVxuICByZXR1cm4gY29udGVudDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzQXJyYXk6IGlzQXJyYXksXG4gIGlzQXJyYXlCdWZmZXI6IGlzQXJyYXlCdWZmZXIsXG4gIGlzQnVmZmVyOiBpc0J1ZmZlcixcbiAgaXNGb3JtRGF0YTogaXNGb3JtRGF0YSxcbiAgaXNBcnJheUJ1ZmZlclZpZXc6IGlzQXJyYXlCdWZmZXJWaWV3LFxuICBpc1N0cmluZzogaXNTdHJpbmcsXG4gIGlzTnVtYmVyOiBpc051bWJlcixcbiAgaXNPYmplY3Q6IGlzT2JqZWN0LFxuICBpc1BsYWluT2JqZWN0OiBpc1BsYWluT2JqZWN0LFxuICBpc1VuZGVmaW5lZDogaXNVbmRlZmluZWQsXG4gIGlzRGF0ZTogaXNEYXRlLFxuICBpc0ZpbGU6IGlzRmlsZSxcbiAgaXNCbG9iOiBpc0Jsb2IsXG4gIGlzRnVuY3Rpb246IGlzRnVuY3Rpb24sXG4gIGlzU3RyZWFtOiBpc1N0cmVhbSxcbiAgaXNVUkxTZWFyY2hQYXJhbXM6IGlzVVJMU2VhcmNoUGFyYW1zLFxuICBpc1N0YW5kYXJkQnJvd3NlckVudjogaXNTdGFuZGFyZEJyb3dzZXJFbnYsXG4gIGZvckVhY2g6IGZvckVhY2gsXG4gIG1lcmdlOiBtZXJnZSxcbiAgZXh0ZW5kOiBleHRlbmQsXG4gIHRyaW06IHRyaW0sXG4gIHN0cmlwQk9NOiBzdHJpcEJPTVxufTtcbiIsIi8vIEltcG9ydHNcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fIGZyb20gXCIuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvY3NzV2l0aE1hcHBpbmdUb1N0cmluZy5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyBmcm9tIFwiLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfR0VUX1VSTF9JTVBPUlRfX18gZnJvbSBcIi4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9nZXRVcmwuanNcIjtcbmltcG9ydCBfX19DU1NfTE9BREVSX1VSTF9JTVBPUlRfMF9fXyBmcm9tIFwiLi4vaW1nL2xvZ2luLWJnLmpwZ1wiO1xudmFyIF9fX0NTU19MT0FERVJfRVhQT1JUX19fID0gX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fKF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18pO1xudmFyIF9fX0NTU19MT0FERVJfVVJMX1JFUExBQ0VNRU5UXzBfX18gPSBfX19DU1NfTE9BREVSX0dFVF9VUkxfSU1QT1JUX19fKF9fX0NTU19MT0FERVJfVVJMX0lNUE9SVF8wX19fKTtcbi8vIE1vZHVsZVxuX19fQ1NTX0xPQURFUl9FWFBPUlRfX18ucHVzaChbbW9kdWxlLmlkLCBcIiosXFxuKjo6YWZ0ZXIsXFxuKjo6YmVmb3JlIHtcXG4gIG1hcmdpbjogMDtcXG4gIHBhZGRpbmc6IDA7XFxuICBib3gtc2l6aW5nOiBpbmhlcml0OyB9XFxuXFxuaHRtbCB7XFxuICBmb250LXNpemU6IDYyLjUlOyB9XFxuXFxuYm9keSB7XFxuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbiAgb3ZlcmZsb3cteDogaGlkZGVuO1xcbiAgZm9udC1zaXplOiAxLjZyZW07XFxuICBiYWNrZ3JvdW5kLXNpemU6IGNvdmVyO1xcbiAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcXG4gIGhlaWdodDogMTI3LjVyZW07XFxuICBmb250LWZhbWlseTogJ0xhdG8nLCBzYW5zLXNlcmlmOyB9XFxuXFxuW2hpZGRlbl0ge1xcbiAgZGlzcGxheTogbm9uZSAhaW1wb3J0YW50OyB9XFxuXFxuLmhlYWRpbmctdGVydGlhcnkge1xcbiAgZm9udC1zaXplOiAyLjRyZW07XFxuICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOyB9XFxuICAuaGVhZGluZy10ZXJ0aWFyeS0td2hpdGUge1xcbiAgICBjb2xvcjogI2ZmZjsgfVxcblxcbi5tYi0xMCB7XFxuICBtYXJnaW4tYm90dG9tOiAxcmVtOyB9XFxuXFxuLm1iLTIwIHtcXG4gIG1hcmdpbi1ib3R0b206IDJyZW07IH1cXG5cXG4ubXQtNTAge1xcbiAgbWFyZ2luLXRvcDogNXJlbTsgfVxcblxcbi5idG4sIC5idG46bGluaywgLmJ0bjp2aXNpdGVkIHtcXG4gIHBhZGRpbmc6IC43NXJlbSAycmVtO1xcbiAgYm9yZGVyLXJhZGl1czogLjVyZW07XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjJmMmYyO1xcbiAgZm9udC13ZWlnaHQ6IDQwMDtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jazsgfVxcblxcbi5idG46YWN0aXZlLCAuYnRuOmZvY3VzIHtcXG4gIG91dGxpbmU6IG5vbmU7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTFweCk7XFxuICBib3gtc2hhZG93OiAwIDAuNXJlbSAxcmVtIHJnYmEoMCwgMCwgMCwgMC4yKTsgfVxcblxcbi5sb2dpbi1mb3JtX19ncm91cDpub3QoOmxhc3QtY2hpbGQpIHtcXG4gIG1hcmdpbi1ib3R0b206IDIuNXJlbTsgfVxcblxcbi5sb2dpbi1mb3JtX19sYWJlbCB7XFxuICBtYXJnaW4tcmlnaHQ6IC43cmVtO1xcbiAgY29sb3I6ICNmZmY7XFxuICBmb250LXNpemU6IDEuOHJlbTtcXG4gIGZvbnQtd2VpZ2h0OiA0MDA7IH1cXG5cXG4ubG9naW4tZm9ybV9faW5wdXQge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gIHBhZGRpbmc6IC41cmVtIDA7XFxuICBib3JkZXI6IG5vbmU7IH1cXG5cXG4ubG9naW4tZm9ybV9fYnRuLXdyYXBwZXIge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyOyB9XFxuXFxuLmxvZ2luX19yZWdpc3Rlci10ZXh0IHtcXG4gIG1hcmdpbi10b3A6IDEuNXJlbTtcXG4gIGNvbG9yOiAjZmZmOyB9XFxuXFxuLmxvZ2luX19yZWdpc3Rlci1saW5rIHtcXG4gIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gIGNvbG9yOiAjZmZmO1xcbiAgdHJhbnNpdGlvbjogYWxsIC4yczsgfVxcbiAgLmxvZ2luX19yZWdpc3Rlci1saW5rOmhvdmVyIHtcXG4gICAgY29sb3I6ICNmZjgwMDA7XFxuICAgIHRleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lOyB9XFxuXFxuLm5hdiB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcXG4gIHBhZGRpbmc6IDJyZW0gNnJlbTtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgIzAwMDsgfVxcbiAgLm5hdl9faXRlbSB7XFxuICAgIGxpc3Qtc3R5bGU6IG5vbmU7IH1cXG4gICAgLm5hdl9faXRlbS0tc2VhcmNoIHtcXG4gICAgICBmbGV4OiAwIDAgMjUlOyB9XFxuICAubmF2X19saW5rIHtcXG4gICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgICBjb2xvcjogIzAwMDtcXG4gICAgdHJhbnNpdGlvbjogYWxsIC4yczsgfVxcbiAgICAubmF2X19saW5rOmhvdmVyIHtcXG4gICAgICBtYXJnaW4tYm90dG9tOiAycHg7XFxuICAgICAgY29sb3I6ICNmZmE2NGQ7XFxuICAgICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNmZmE2NGQ7IH1cXG4gICAgLm5hdl9fbGluay0taG9tZTpob3ZlciAubmF2X19pY29uLXBhdGgtLWhvbWUge1xcbiAgICAgIGZpbGw6ICNmZjgwMDA7IH1cXG4gIC5uYXZfX3NlYXJjaCB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAgIC5uYXZfX3NlYXJjaC1pbnB1dCB7XFxuICAgICAgd2lkdGg6IDkwJTtcXG4gICAgICBib3JkZXItcmFkaXVzOiAzcmVtO1xcbiAgICAgIHBhZGRpbmc6IDFyZW0gMnJlbTtcXG4gICAgICBib3JkZXI6IDFweCBzb2xpZCAjYmZiZmJmO1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmMmYyZjI7XFxuICAgICAgdHJhbnNpdGlvbjogd2lkdGggLjJzOyB9XFxuICAgICAgLm5hdl9fc2VhcmNoLWlucHV0OmZvY3VzIHtcXG4gICAgICAgIG91dGxpbmU6IG5vbmU7XFxuICAgICAgICB3aWR0aDogMTIwJTsgfVxcbiAgICAubmF2X19zZWFyY2gtYnRuIHtcXG4gICAgICBjdXJzb3I6IHBvaW50ZXI7IH1cXG4gIC5uYXZfX2ljb24tc2l6aW5nLS1ob21lIHtcXG4gICAgd2lkdGg6IDNyZW07XFxuICAgIGhlaWdodDogM3JlbTsgfVxcbiAgLm5hdl9faWNvbi1zaXppbmctLXNlYXJjaCB7XFxuICAgIHdpZHRoOiAycmVtO1xcbiAgICBoZWlnaHQ6IDJyZW07XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtMTUwJSk7IH1cXG4gIC5uYXZfX2ljb24tcGF0aCB7XFxuICAgIGZpbGw6ICNiZmJmYmY7IH1cXG5cXG4ucmVnaXN0ZXItZm9ybV9fZ3JvdXAge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cXG4gIC5yZWdpc3Rlci1mb3JtX19ncm91cDpub3QoOmxhc3QtY2hpbGQpIHtcXG4gICAgbWFyZ2luLWJvdHRvbTogM3JlbTsgfVxcblxcbi5yZWdpc3Rlci1mb3JtX19sYWJlbCB7XFxuICBtYXJnaW4tcmlnaHQ6IDRyZW07XFxuICBjb2xvcjogI2ZmZjtcXG4gIGZvbnQtc2l6ZTogMS44cmVtO1xcbiAgZm9udC13ZWlnaHQ6IDQwMDsgfVxcblxcbi5yZWdpc3Rlci1mb3JtX19pbnB1dCB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjJmMmYyO1xcbiAgcGFkZGluZzogLjVyZW0gMDtcXG4gIGJvcmRlcjogbm9uZTsgfVxcblxcbi5yZWdpc3Rlci1mb3JtX19idG4td3JhcHBlciB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7IH1cXG5cXG4ucmVnaXN0ZXJfX2xvZ2luLXRleHQge1xcbiAgbWFyZ2luLXRvcDogMS41cmVtO1xcbiAgY29sb3I6ICNmZmY7IH1cXG5cXG4ucmVnaXN0ZXJfX2xvZ2luLWxpbmsge1xcbiAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgY29sb3I6ICNmZmY7XFxuICB0cmFuc2l0aW9uOiBhbGwgLjJzOyB9XFxuICAucmVnaXN0ZXJfX2xvZ2luLWxpbms6aG92ZXIge1xcbiAgICBjb2xvcjogI2ZmODAwMDtcXG4gICAgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmU7IH1cXG5cXG4uZXJyb3Ige1xcbiAgbWFyZ2luLXRvcDogMnJlbTtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZjgwODA7XFxuICBib3JkZXItcmFkaXVzOiAxMHB4O1xcbiAgcGFkZGluZzogMnJlbTtcXG4gIGZvbnQtc2l6ZTogMnJlbTtcXG4gIGdyaWQtY29sdW1uOiBjZW50ZXItc3RhcnQgLyBjZW50ZXItZW5kO1xcbiAgZm9udC13ZWlnaHQ6IDcwMDsgfVxcblxcbi5zZWFyY2gtZm9ybSB7XFxuICBwYWRkaW5nOiAycmVtIDI1cmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX2dyb3VwIHtcXG4gICAgd2lkdGg6IDc1JTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgbWFyZ2luLWJvdHRvbTogM3JlbTtcXG4gICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICMwMDA7XFxuICAgIGFsaWduLWl0ZW1zOiBmbGV4LXN0YXJ0O1xcbiAgICBwYWRkaW5nOiAuNXJlbSA0cmVtIC41cmVtIDA7IH1cXG4gIC5zZWFyY2gtZm9ybV9fbGFiZWwge1xcbiAgICBmbGV4OiAwIDAgMjAlO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogZmxleC1zdGFydDtcXG4gICAgbWFyZ2luLXRvcDogLjdyZW07IH1cXG4gIC5zZWFyY2gtZm9ybV9fZ3JvdXAtaW5wdXQtd3JhcHBlciB7XFxuICAgIGZsZXg6IDAgMCA4MCU7IH1cXG4gIC5zZWFyY2gtZm9ybV9fdGlwIHtcXG4gICAgZm9udC1zaXplOiAxcmVtO1xcbiAgICBsaW5lLWhlaWdodDogMS40O1xcbiAgICB3aWR0aDogNzAlOyB9XFxuICAuc2VhcmNoLWZvcm1fX2lucHV0LXRleHQge1xcbiAgICB3aWR0aDogNDByZW07XFxuICAgIGhlaWdodDogNHJlbTtcXG4gICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcXG4gICAgcGFkZGluZzogMXJlbTtcXG4gICAgYm9yZGVyOiBzb2xpZCAxcHggI2JmYmZiZjtcXG4gICAgYm9yZGVyLXJhZGl1czogNXB4OyB9XFxuICAgIC5zZWFyY2gtZm9ybV9faW5wdXQtdGV4dDpmb2N1cyB7XFxuICAgICAgYm9yZGVyOiBzb2xpZCAxcHggIzAwMDsgfVxcbiAgLnNlYXJjaC1mb3JtX19pbnB1dC1pbnRlZ2VyLS1yZWxhdGl2ZSB7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcbiAgLnNlYXJjaC1mb3JtX19ncm91cC0tY2hlY2tib3gge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBtYXJnaW4tYm90dG9tOiAxcmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX2xhYmVsLS1jaGVja2JveCB7XFxuICAgIG1hcmdpbi1yaWdodDogMXJlbTsgfVxcbiAgLnNlYXJjaC1mb3JtX19pbnB1dC1jaGVja2JveCB7XFxuICAgIHdpZHRoOiAyLjI1cmVtO1xcbiAgICBoZWlnaHQ6IDIuMjVyZW07XFxuICAgIG1hcmdpbi1yaWdodDogLjhyZW07IH1cXG4gIC5zZWFyY2gtZm9ybV9fY2hlY2tib3gtd3JhcHBlciB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cXG4gIC5zZWFyY2gtZm9ybV9fc2VsZWN0LW1lbnUge1xcbiAgICBtYXJnaW4tYm90dG9tOiAxcmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX3N2Zy1zaXplIHtcXG4gICAgaGVpZ2h0OiAycmVtO1xcbiAgICB3aWR0aDogMnJlbTtcXG4gICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX3N1Ym1pdCB7XFxuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgcGFkZGluZzogLjdyZW07XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkICNiMzAwYjM7IH1cXG4gIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tc3BhbiB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH1cXG4gIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMsIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtc2V0cyB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICAgIGxpc3Qtc3R5bGU6IG5vbmU7XFxuICAgIG1hcmdpbi1ib3R0b206IC4zcmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLWxpc3QtaXRlbSwgLnNlYXJjaC1mb3JtX19zZWxlY3RlZC1zZXRzLWxpc3QtaXRlbSB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIG1hcmdpbi1ib3R0b206IC43cmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLXJlbW92ZS1idG4sIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtc2V0cy1yZW1vdmUtYnRuIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgaGVpZ2h0OiAycmVtO1xcbiAgICB3aWR0aDogMnJlbTtcXG4gICAgZm9udC1zaXplOiAxLjNyZW07XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmMmYyZjI7XFxuICAgIG1hcmdpbi1yaWdodDogLjdyZW07IH1cXG4gIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlciB7XFxuICAgIGhlaWdodDogMnJlbTtcXG4gICAgd2lkdGg6IDIuNzVyZW07XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgIGZvbnQtc2l6ZTogMS4zcmVtO1xcbiAgICBtYXJnaW4tcmlnaHQ6IC43cmVtOyB9XFxuICAgIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlci0taXMge1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICM0N2QxNDc7IH1cXG4gICAgLnNlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy10b2dnbGVyLS1ub3Qge1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmZjAwMDA7IH1cXG4gIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24ge1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIG1heC1oZWlnaHQ6IDI4cmVtO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgICB6LWluZGV4OiAyO1xcbiAgICB0b3A6IDEwMCU7XFxuICAgIHdpZHRoOiA0MHJlbTtcXG4gICAgbWFyZ2luLXRvcDogLTFyZW07XFxuICAgIG92ZXJmbG93LXk6IGF1dG87XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkICMwMDA7IH1cXG4gICAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0IHtcXG4gICAgICBsaXN0LXN0eWxlOiBub25lOyB9XFxuICAgICAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0LWNhdGVnb3J5IHtcXG4gICAgICAgIHBhZGRpbmc6IC41cmVtOyB9XFxuICAgICAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0LW9wdGlvbiB7XFxuICAgICAgICBwYWRkaW5nOiAuM3JlbSAycmVtO1xcbiAgICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cXG4gICAgICAgIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1vcHRpb246aG92ZXIge1xcbiAgICAgICAgICBjdXJzb3I6IHBvaW50ZXI7IH1cXG4gICAgICAgIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1vcHRpb24tLWhpZ2hsaWdodGVkIHtcXG4gICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2NjZDhmZjsgfVxcbiAgICAgICAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0LW9wdGlvbiBzcGFuIHtcXG4gICAgICAgICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcXG4gICAgICAgICAgbWFyZ2luLWxlZnQ6IDFyZW07IH1cXG4gICAgICAuc2VhcmNoLWZvcm1fX2Ryb3Bkb3duLWxpc3QtaW1nIHtcXG4gICAgICAgIHdpZHRoOiAycmVtO1xcbiAgICAgICAgaGVpZ2h0OiAycmVtO1xcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAuN3JlbTsgfVxcblxcbi5kcm9wZG93bi13cmFwcGVyIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcblxcbi5pbnYtc2VhcmNoLXByaWNlLW1zZyB7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICBib3R0b206IDA7XFxuICByaWdodDogMDtcXG4gIGNvbG9yOiByZWQ7IH1cXG5cXG4ucmVsYXRpdmUge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuXFxuLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdiB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjOTliMWZmO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgcGFkZGluZzogMCAxMCU7XFxuICBtYXJnaW4tYm90dG9tOiAuMXJlbTsgfVxcbiAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1zZWxlY3Qge1xcbiAgICBjb2xvcjogI2IzMDBiMztcXG4gICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LWxhYmVsIHtcXG4gICAgY29sb3I6ICNiMzAwYjM7IH1cXG4gIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtcmlnaHQge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXBhZ2luYXRpb24tY29udGFpbmVyIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2NjZDhmZjtcXG4gICAgY3Vyc29yOiBwb2ludGVyOyB9XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtcGFnaW5hdGlvbi1jb250YWluZXI6bm90KDpsYXN0LWNoaWxkKSB7XFxuICAgICAgbWFyZ2luLXJpZ2h0OiAzcmVtOyB9XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtcGFnaW5hdGlvbi1jb250YWluZXItLWRpc2FibGVkIHtcXG4gICAgICBjdXJzb3I6IG5vdC1hbGxvd2VkO1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjA0LCAyMTYsIDI1NSwgMC40KTsgfVxcbiAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1zdmctc2l6ZSB7XFxuICAgIGhlaWdodDogMnJlbTtcXG4gICAgd2lkdGg6IDJyZW07IH1cXG5cXG4uYXBpLXJlc3VsdHMtZGlzcGxheV9fZGlzcGxheS1iYXIge1xcbiAgd2lkdGg6IDEwMCU7XFxuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2JmYmZiZjtcXG4gIHBhZGRpbmctbGVmdDogMTAlO1xcbiAgbWFyZ2luLWJvdHRvbTogMnJlbTsgfVxcblxcbi5jYXJkLWNoZWNrbGlzdCB7XFxuICB3aWR0aDogODAlO1xcbiAganVzdGlmeS1zZWxmOiBjZW50ZXI7IH1cXG4gIC5jYXJkLWNoZWNrbGlzdF9fcm93IHtcXG4gICAgZGlzcGxheTogZ3JpZDsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX3Jvdy0tNyB7XFxuICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoNywgMWZyKTsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX3Jvdy0tOSB7XFxuICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoOSwgMWZyKTsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX3Jvdy0taGVhZGVyIHtcXG4gICAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgIzAwMDsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX3Jvdy0tZ3JleSB7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2YyZjJmMjsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX3JvdzpudGgtY2hpbGQoZXZlbikge1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmMmYyZjI7IH1cXG4gIC5jYXJkLWNoZWNrbGlzdF9fZGF0YSB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtd3JhcDogbm93cmFwO1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgb3ZlcmZsb3c6IGhpZGRlbjtcXG4gICAgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XFxuICAgIGZvbnQtc2l6ZTogMS40cmVtOyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fZGF0YS0tc2V0IHtcXG4gICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fZGF0YS0tcmFyaXR5IHtcXG4gICAgICB0ZXh0LXRyYW5zZm9ybTogY2FwaXRhbGl6ZTsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX2RhdGEtLW5hbWUge1xcbiAgICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7XFxuICAgICAganVzdGlmeS1jb250ZW50OiBmbGV4LXN0YXJ0OyB9XFxuICAuY2FyZC1jaGVja2xpc3RfX2RhdGEtbGluayB7XFxuICAgIHBhZGRpbmc6IDFyZW0gMDtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC13cmFwOiBub3dyYXA7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGNvbG9yOiAjMDAwO1xcbiAgICB3aGl0ZS1zcGFjZTogbm93cmFwOyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fZGF0YS1saW5rLS1zdGFydCB7XFxuICAgICAganVzdGlmeS1jb250ZW50OiBmbGV4LXN0YXJ0OyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fZGF0YS1saW5rLS1jZW50ZXIge1xcbiAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyOyB9XFxuXFxuLnRvb2x0aXAge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgei1pbmRleDogNTtcXG4gIHdpZHRoOiAyNHJlbTtcXG4gIGhlaWdodDogMzRyZW07IH1cXG4gIC50b29sdGlwX19pbWcge1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgaGVpZ2h0OiAxMDAlOyB9XFxuXFxuLm5lZ2F0aXZlLWVhcm5pbmdzIHtcXG4gIGNvbG9yOiByZWQ7IH1cXG5cXG4ucG9zaXRpdmUtZWFybmluZ3Mge1xcbiAgY29sb3I6IGdyZWVuOyB9XFxuXFxuLmltYWdlLWdyaWQge1xcbiAgcGFkZGluZzogMTByZW0gMTVyZW07XFxuICBkaXNwbGF5OiBncmlkO1xcbiAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoYXV0by1maXQsIG1pbm1heCgyNXJlbSwgMWZyKSk7XFxuICBncmlkLWNvbHVtbi1nYXA6IDJyZW07XFxuICBncmlkLXJvdy1nYXA6IDFyZW07IH1cXG4gIC5pbWFnZS1ncmlkX19vdXRlci1kaXYge1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7IH1cXG4gIC5pbWFnZS1ncmlkX19pbm5lci1kaXYge1xcbiAgICBwZXJzcGVjdGl2ZTogMTUwcmVtO1xcbiAgICBoZWlnaHQ6IDM0cmVtO1xcbiAgICB3aWR0aDogMjRyZW07IH1cXG4gIC5pbWFnZS1ncmlkX19kb3VibGUge1xcbiAgICBoZWlnaHQ6IDM0cmVtO1xcbiAgICB3aWR0aDogMjRyZW07XFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgdG9wOiAwO1xcbiAgICBsZWZ0OiAwO1xcbiAgICBiYWNrZmFjZS12aXNpYmlsaXR5OiBoaWRkZW47XFxuICAgIG92ZXJmbG93OiBoaWRkZW47XFxuICAgIHRyYW5zaXRpb246IGFsbCAuOHMgZWFzZTsgfVxcbiAgICAuaW1hZ2UtZ3JpZF9fZG91YmxlLS1iYWNrIHtcXG4gICAgICB0cmFuc2Zvcm06IHJvdGF0ZVkoMTgwZGVnKTsgfVxcbiAgLmltYWdlLWdyaWRfX2RvdWJsZS1idG4ge1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIHRvcDogNTAlO1xcbiAgICByaWdodDogMTUlO1xcbiAgICB3aWR0aDogNHJlbTtcXG4gICAgaGVpZ2h0OiA0cmVtO1xcbiAgICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC40KTsgfVxcbiAgLmltYWdlLWdyaWRfX2NvbnRhaW5lciB7XFxuICAgIHdpZHRoOiAyNHJlbTtcXG4gICAgaGVpZ2h0OiAzNHJlbTsgfVxcbiAgLmltYWdlLWdyaWRfX2ltYWdlIHtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGhlaWdodDogMTAwJTsgfVxcblxcbi5jYXJkIHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBtYXJnaW4tdG9wOiAzcmVtOyB9XFxuICAuY2FyZF9faW1nLWNvbnRhaW5lciB7XFxuICAgIG1hcmdpbi1yaWdodDogMTByZW07IH1cXG4gIC5jYXJkX19pbWcge1xcbiAgICB3aWR0aDogMzNyZW07XFxuICAgIGhlaWdodDogNDZyZW07IH1cXG4gIC5jYXJkX19pbWctbGVmdCB7XFxuICAgIG1hcmdpbi1yaWdodDogMTByZW07XFxuICAgIHdpZHRoOiAzM3JlbTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgfVxcbiAgLmNhcmRfX2ltZy1idG4ge1xcbiAgICBqdXN0aWZ5LXNlbGY6IGZsZXgtZW5kO1xcbiAgICBhbGlnbi1zZWxmOiBmbGV4LWVuZDtcXG4gICAgbWFyZ2luLXRvcDogYXV0bzsgfVxcbiAgLmNhcmRfX2ltZy1kb3VibGUtYXJlYSB7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcbiAgLmNhcmRfX2ltZy1kb3VibGUtc2lkZWQge1xcbiAgICBwZXJzcGVjdGl2ZTogMTUwcmVtO1xcbiAgICBoZWlnaHQ6IDQ2cmVtOyB9XFxuICAuY2FyZF9faW1nLWRvdWJsZSB7XFxuICAgIHdpZHRoOiAzM3JlbTtcXG4gICAgaGVpZ2h0OiA0NnJlbTtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICB0b3A6IDA7XFxuICAgIGxlZnQ6IDA7XFxuICAgIGJhY2tmYWNlLXZpc2liaWxpdHk6IGhpZGRlbjtcXG4gICAgb3ZlcmZsb3c6IGhpZGRlbjsgfVxcbiAgICAuY2FyZF9faW1nLWRvdWJsZS0tYmFjayB7XFxuICAgICAgdHJhbnNmb3JtOiByb3RhdGVZKDE4MGRlZyk7IH1cXG4gIC5jYXJkX190ZXh0IHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2Y0ZjRkNztcXG4gICAgd2lkdGg6IDM0cmVtO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgICBwYWRkaW5nOiAxcmVtO1xcbiAgICBtYXJnaW4tcmlnaHQ6IDNyZW07IH1cXG4gICAgLmNhcmRfX3RleHQtZmxleCB7XFxuICAgICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcXG4gICAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2JmYmZiZjsgfVxcbiAgICAuY2FyZF9fdGV4dC10aXRsZSB7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAgICAgLmNhcmRfX3RleHQtdGl0bGUtaDMge1xcbiAgICAgICAgZm9udC1zaXplOiAxLjhyZW07XFxuICAgICAgICBmb250LXdlaWdodDogNDAwO1xcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuICAgIC5jYXJkX190ZXh0LWNvbG9yLWluZGljYXRvciB7XFxuICAgICAgd2lkdGg6IDEuM3JlbTtcXG4gICAgICBoZWlnaHQ6IDEuM3JlbTtcXG4gICAgICBib3JkZXI6IDFweCBzb2xpZCAjMzMzO1xcbiAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gICAgICBib3gtc2hhZG93OiAwcHggMHB4IDBweCAycHggcmdiYSgwLCAwLCAwLCAwLjIpO1xcbiAgICAgIG1hcmdpbi1yaWdodDogLjdyZW07XFxuICAgICAgZGlzcGxheTogaW5saW5lLWJsb2NrOyB9XFxuICAgICAgLmNhcmRfX3RleHQtY29sb3ItaW5kaWNhdG9yLS1VIHtcXG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMTI4LCAxMjgsIDI1NSwgMC43KTsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWNvbG9yLWluZGljYXRvci0tQiB7XFxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuNyk7IH1cXG4gICAgICAuY2FyZF9fdGV4dC1jb2xvci1pbmRpY2F0b3ItLVIge1xcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsIDc3LCA3NywgMC43KTsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWNvbG9yLWluZGljYXRvci0tVyB7XFxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNyk7IH1cXG4gICAgICAuY2FyZF9fdGV4dC1jb2xvci1pbmRpY2F0b3ItLUcge1xcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAyNTUsIDAsIDAuNyk7IH1cXG4gICAgLmNhcmRfX3RleHQtb3JhY2xlLXAge1xcbiAgICAgIG1hcmdpbi1ib3R0b206IDFyZW07XFxuICAgICAgZm9udC1zaXplOiAxLjNyZW07IH1cXG4gICAgLmNhcmRfX3RleHQtb3JhY2xlLWZsYXZvciB7XFxuICAgICAgZm9udC1zaXplOiAxLjNyZW07XFxuICAgICAgZm9udC1zdHlsZTogaXRhbGljOyB9XFxuICAgIC5jYXJkX190ZXh0LWlsbHVzdHJhdG9yIHtcXG4gICAgICBmb250LXNpemU6IDEuMnJlbTtcXG4gICAgICBmb250LXN0eWxlOiBpdGFsaWM7IH1cXG4gICAgLmNhcmRfX3RleHQtbGVnYWwge1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgZmxleC1kaXJlY3Rpb246IHJvdztcXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47IH1cXG4gICAgICAuY2FyZF9fdGV4dC1sZWdhbC1oYWxmIHtcXG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9XFxuICAgICAgLmNhcmRfX3RleHQtbGVnYWwtc3Bhbi1jb250YWluZXIge1xcbiAgICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cXG4gICAgICAgIC5jYXJkX190ZXh0LWxlZ2FsLXNwYW4tY29udGFpbmVyOm5vdCg6bGFzdC1jaGlsZCkge1xcbiAgICAgICAgICBtYXJnaW4tYm90dG9tOiAuNXJlbTsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWxlZ2FsLXNwYW4tYm94IHtcXG4gICAgICAgIHdpZHRoOiA2cmVtO1xcbiAgICAgICAgaGVpZ2h0OiAyLjVyZW07XFxuICAgICAgICBib3JkZXI6IDFweCBzb2xpZCAjMDAwO1xcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAuM3JlbTtcXG4gICAgICAgIGZvbnQtc2l6ZTogMXJlbTtcXG4gICAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICAgICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAgICAgICAuY2FyZF9fdGV4dC1sZWdhbC1zcGFuLWJveC0tbm90X2xlZ2FsIHtcXG4gICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmMDAwMDsgfVxcbiAgICAgICAgLmNhcmRfX3RleHQtbGVnYWwtc3Bhbi1ib3gtLWxlZ2FsIHtcXG4gICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzQ3ZDE0NzsgfVxcbiAgLmNhcmRfX3NldCB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH1cXG4gICAgLmNhcmRfX3NldC1iYW5uZXIge1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgYm9yZGVyOiAxcHggc29saWQgI2JmYmZiZjtcXG4gICAgICB3aWR0aDogNDByZW07XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzAwMDtcXG4gICAgICBjb2xvcjogI2ZmZjsgfVxcbiAgICAgIC5jYXJkX19zZXQtYmFubmVyLXN2Zy1jb250YWluZXIge1xcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuICAgICAgLmNhcmRfX3NldC1iYW5uZXItc3ZnIHtcXG4gICAgICAgIHdpZHRoOiAyLjRyZW07XFxuICAgICAgICBoZWlnaHQ6IDIuNHJlbTtcXG4gICAgICAgIGZpbHRlcjogaW52ZXJ0KDEwMCUpOyB9XFxuICAgIC5jYXJkX19zZXQtZGV0YWlscyB7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9XFxuICAgIC5jYXJkX19zZXQtaGVhZGVyLW5hbWUge1xcbiAgICAgIGZvbnQtc2l6ZTogMS43cmVtcmVtOyB9XFxuICAgIC5jYXJkX19zZXQtaGVhZGVyLWNvZGUge1xcbiAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtaGVhZGVyIHtcXG4gICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMDAwO1xcbiAgICAgIGNvbG9yOiAjZmZmO1xcbiAgICAgIGZvbnQtc2l6ZTogMS4zcmVtO1xcbiAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICAgICAgYm9yZGVyOiAxcHggc29saWQgI2JmYmZiZjtcXG4gICAgICBwYWRkaW5nOiAuM3JlbSAuN3JlbTsgfVxcbiAgICAuY2FyZF9fc2V0LXByaW50cy1zdmctY29udGFpbmVyIHtcXG4gICAgICBoZWlnaHQ6IDEuOHJlbTtcXG4gICAgICB3aWR0aDogMS44cmVtO1xcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkICNiZmJmYmY7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICAgIGJvcmRlci1yYWRpdXM6IDEwMCU7IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtc3ZnLS1jb21tb24ge1xcbiAgICAgIGZpbGw6ICMwMDA7IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtc3ZnLS11bmNvbW1vbiB7XFxuICAgICAgZmlsbDogI2U2ZTZlNjsgfVxcbiAgICAuY2FyZF9fc2V0LXByaW50cy1zdmctLXJhcmUge1xcbiAgICAgIGZpbGw6ICNlNmMzMDA7IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtc3ZnLS1teXRoaWMge1xcbiAgICAgIGZpbGw6ICNmZjAwMDA7IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtbGlzdCB7XFxuICAgICAgbGlzdC1zdHlsZTogbm9uZTsgfVxcbiAgICAgIC5jYXJkX19zZXQtcHJpbnRzLWxpc3QtbGluazpsaW5rLCAuY2FyZF9fc2V0LXByaW50cy1saXN0LWxpbms6dmlzaXRlZCB7XFxuICAgICAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICAgICAgICBjb2xvcjogIzAwMDsgfVxcbiAgICAgIC5jYXJkX19zZXQtcHJpbnRzLWxpc3QtaXRlbSB7XFxuICAgICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgICAgICAgY3Vyc29yOiBwb2ludGVyOyB9XFxuICAgICAgICAuY2FyZF9fc2V0LXByaW50cy1saXN0LWl0ZW06aG92ZXIge1xcbiAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjJmMmYyOyB9XFxuICAgICAgLmNhcmRfX3NldC1wcmludHMtbGlzdC1pdGVtLW5hbWUtd3JhcHBlciB7XFxuICAgICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgICAgIG1hcmdpbi1sZWZ0OiAtMXJlbTsgfVxcbiAgICAgIC5jYXJkX19zZXQtcHJpbnRzLWxpc3QtaXRlbS1zZXQtbmFtZSB7XFxuICAgICAgICBtYXJnaW4tbGVmdDogLjVyZW07IH1cXG4gICAgICAuY2FyZF9fc2V0LXByaW50cy1saXN0LWl0ZW0tcHJpY2Uge1xcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAuN3JlbTsgfVxcblxcbi5jYXJkLXBhZ2Uge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICBncmlkLWNvbHVtbjogY2VudGVyLXN0YXJ0IC8gY2VudGVyLWVuZDsgfVxcblxcbi5hZGQtdG8taW52LFxcbi5yZW1vdmUtZnJvbS1pbnYge1xcbiAgbWFyZ2luLXRvcDogM3JlbTtcXG4gIHdpZHRoOiA1MCU7IH1cXG4gIC5hZGQtdG8taW52X19mb3JtLFxcbiAgLnJlbW92ZS1mcm9tLWludl9fZm9ybSB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH1cXG4gICAgLmFkZC10by1pbnZfX2Zvcm0tZ3JvdXAsXFxuICAgIC5yZW1vdmUtZnJvbS1pbnZfX2Zvcm0tZ3JvdXAge1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgYWxpZ24tY29udGVudDogY2VudGVyO1xcbiAgICAgIG1hcmdpbi1ib3R0b206IDNyZW07XFxuICAgICAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuICAgIC5hZGQtdG8taW52X19mb3JtLWxhYmVsLFxcbiAgICAucmVtb3ZlLWZyb20taW52X19mb3JtLWxhYmVsIHtcXG4gICAgICBtYXJnaW4tcmlnaHQ6IC4zcmVtOyB9XFxuICAuYWRkLXRvLWludi1wcmljZS1tc2csXFxuICAucmVtb3ZlLWZyb20taW52LXByaWNlLW1zZyB7XFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgYm90dG9tOiAtMS44cmVtO1xcbiAgICByaWdodDogMjUlO1xcbiAgICBjb2xvcjogcmVkOyB9XFxuXFxuLm5vLXJlc3VsdHMge1xcbiAganVzdGlmeS1zZWxmOiBjZW50ZXI7IH1cXG5cXG4uY29udGFpbmVyIHtcXG4gIGRpc3BsYXk6IGdyaWQ7XFxuICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IFtmdWxsLXN0YXJ0XSBtaW5tYXgoNnJlbSwgMWZyKSBbY2VudGVyLXN0YXJ0XSByZXBlYXQoOCwgW2NvbC1zdGFydF0gbWlubWF4KG1pbi1jb250ZW50LCAxNHJlbSkgW2NvbC1lbmRdKSBbY2VudGVyLWVuZF0gbWlubWF4KDZyZW0sIDFmcikgW2Z1bGwtZW5kXTsgfVxcblxcbi5sb2dpbixcXG4ucmVnaXN0ZXIge1xcbiAgbWFyZ2luLXRvcDogNXJlbTtcXG4gIGdyaWQtY29sdW1uOiBjZW50ZXItc3RhcnQgLyBjZW50ZXItZW5kO1xcbiAgYmFja2dyb3VuZC1pbWFnZTogbGluZWFyLWdyYWRpZW50KHRvIHJpZ2h0IGJvdHRvbSwgcmdiYSgwLCAwLCAwLCAwLjgpLCByZ2JhKDAsIDAsIDAsIDAuOCkpLCB1cmwoXCIgKyBfX19DU1NfTE9BREVSX1VSTF9SRVBMQUNFTUVOVF8wX19fICsgXCIpO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgaGVpZ2h0OiA3NXZoO1xcbiAgYmFja2dyb3VuZC1zaXplOiBjb3ZlcjtcXG4gIGJhY2tncm91bmQtcG9zaXRpb246IGNlbnRlcjsgfVxcblxcbi5zZWFyY2gge1xcbiAgZ3JpZC1jb2x1bW46IGZ1bGwtc3RhcnQgLyBmdWxsLWVuZDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZmY7IH1cXG5cXG4uYXBpLXJlc3VsdHMtZGlzcGxheSB7XFxuICBncmlkLWNvbHVtbjogZnVsbC1zdGFydCAvIGZ1bGwtZW5kO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gIGRpc3BsYXk6IGdyaWQ7IH1cXG5cIiwgXCJcIix7XCJ2ZXJzaW9uXCI6MyxcInNvdXJjZXNcIjpbXCJ3ZWJwYWNrOi8vc3JjL2Nzcy9zdHlsZS5jc3NcIl0sXCJuYW1lc1wiOltdLFwibWFwcGluZ3NcIjpcIkFBQUE7OztFQUdFLFNBQVM7RUFDVCxVQUFVO0VBQ1YsbUJBQW1CLEVBQUU7O0FBRXZCO0VBQ0UsZ0JBQWdCLEVBQUU7O0FBRXBCO0VBQ0Usc0JBQXNCO0VBQ3RCLGtCQUFrQjtFQUNsQixpQkFBaUI7RUFDakIsc0JBQXNCO0VBQ3RCLDRCQUE0QjtFQUM1QixnQkFBZ0I7RUFDaEIsK0JBQStCLEVBQUU7O0FBRW5DO0VBQ0Usd0JBQXdCLEVBQUU7O0FBRTVCO0VBQ0UsaUJBQWlCO0VBQ2pCLHlCQUF5QixFQUFFO0VBQzNCO0lBQ0UsV0FBVyxFQUFFOztBQUVqQjtFQUNFLG1CQUFtQixFQUFFOztBQUV2QjtFQUNFLG1CQUFtQixFQUFFOztBQUV2QjtFQUNFLGdCQUFnQixFQUFFOztBQUVwQjtFQUNFLG9CQUFvQjtFQUNwQixvQkFBb0I7RUFDcEIseUJBQXlCO0VBQ3pCLGdCQUFnQjtFQUNoQixxQkFBcUIsRUFBRTs7QUFFekI7RUFDRSxhQUFhO0VBQ2IsMkJBQTJCO0VBQzNCLDRDQUE0QyxFQUFFOztBQUVoRDtFQUNFLHFCQUFxQixFQUFFOztBQUV6QjtFQUNFLG1CQUFtQjtFQUNuQixXQUFXO0VBQ1gsaUJBQWlCO0VBQ2pCLGdCQUFnQixFQUFFOztBQUVwQjtFQUNFLHNCQUFzQjtFQUN0QixnQkFBZ0I7RUFDaEIsWUFBWSxFQUFFOztBQUVoQjtFQUNFLGFBQWE7RUFDYix1QkFBdUIsRUFBRTs7QUFFM0I7RUFDRSxrQkFBa0I7RUFDbEIsV0FBVyxFQUFFOztBQUVmO0VBQ0UscUJBQXFCO0VBQ3JCLFdBQVc7RUFDWCxtQkFBbUIsRUFBRTtFQUNyQjtJQUNFLGNBQWM7SUFDZCwwQkFBMEIsRUFBRTs7QUFFaEM7RUFDRSxhQUFhO0VBQ2IsbUJBQW1CO0VBQ25CLDhCQUE4QjtFQUM5QixrQkFBa0I7RUFDbEIsc0JBQXNCO0VBQ3RCLDZCQUE2QixFQUFFO0VBQy9CO0lBQ0UsZ0JBQWdCLEVBQUU7SUFDbEI7TUFDRSxhQUFhLEVBQUU7RUFDbkI7SUFDRSxxQkFBcUI7SUFDckIsV0FBVztJQUNYLG1CQUFtQixFQUFFO0lBQ3JCO01BQ0Usa0JBQWtCO01BQ2xCLGNBQWM7TUFDZCxnQ0FBZ0MsRUFBRTtJQUNwQztNQUNFLGFBQWEsRUFBRTtFQUNuQjtJQUNFLGFBQWE7SUFDYix1QkFBdUI7SUFDdkIsbUJBQW1CLEVBQUU7SUFDckI7TUFDRSxVQUFVO01BQ1YsbUJBQW1CO01BQ25CLGtCQUFrQjtNQUNsQix5QkFBeUI7TUFDekIseUJBQXlCO01BQ3pCLHFCQUFxQixFQUFFO01BQ3ZCO1FBQ0UsYUFBYTtRQUNiLFdBQVcsRUFBRTtJQUNqQjtNQUNFLGVBQWUsRUFBRTtFQUNyQjtJQUNFLFdBQVc7SUFDWCxZQUFZLEVBQUU7RUFDaEI7SUFDRSxXQUFXO0lBQ1gsWUFBWTtJQUNaLDRCQUE0QixFQUFFO0VBQ2hDO0lBQ0UsYUFBYSxFQUFFOztBQUVuQjtFQUNFLGFBQWE7RUFDYiw4QkFBOEI7RUFDOUIsbUJBQW1CLEVBQUU7RUFDckI7SUFDRSxtQkFBbUIsRUFBRTs7QUFFekI7RUFDRSxrQkFBa0I7RUFDbEIsV0FBVztFQUNYLGlCQUFpQjtFQUNqQixnQkFBZ0IsRUFBRTs7QUFFcEI7RUFDRSx5QkFBeUI7RUFDekIsZ0JBQWdCO0VBQ2hCLFlBQVksRUFBRTs7QUFFaEI7RUFDRSxhQUFhO0VBQ2IsdUJBQXVCLEVBQUU7O0FBRTNCO0VBQ0Usa0JBQWtCO0VBQ2xCLFdBQVcsRUFBRTs7QUFFZjtFQUNFLHFCQUFxQjtFQUNyQixXQUFXO0VBQ1gsbUJBQW1CLEVBQUU7RUFDckI7SUFDRSxjQUFjO0lBQ2QsMEJBQTBCLEVBQUU7O0FBRWhDO0VBQ0UsZ0JBQWdCO0VBQ2hCLGtCQUFrQjtFQUNsQix5QkFBeUI7RUFDekIsbUJBQW1CO0VBQ25CLGFBQWE7RUFDYixlQUFlO0VBQ2Ysc0NBQXNDO0VBQ3RDLGdCQUFnQixFQUFFOztBQUVwQjtFQUNFLG1CQUFtQixFQUFFO0VBQ3JCO0lBQ0UsVUFBVTtJQUNWLGFBQWE7SUFDYixtQkFBbUI7SUFDbkIsNkJBQTZCO0lBQzdCLHVCQUF1QjtJQUN2QiwyQkFBMkIsRUFBRTtFQUMvQjtJQUNFLGFBQWE7SUFDYixhQUFhO0lBQ2IsdUJBQXVCO0lBQ3ZCLGlCQUFpQixFQUFFO0VBQ3JCO0lBQ0UsYUFBYSxFQUFFO0VBQ2pCO0lBQ0UsZUFBZTtJQUNmLGdCQUFnQjtJQUNoQixVQUFVLEVBQUU7RUFDZDtJQUNFLFlBQVk7SUFDWixZQUFZO0lBQ1osbUJBQW1CO0lBQ25CLGFBQWE7SUFDYix5QkFBeUI7SUFDekIsa0JBQWtCLEVBQUU7SUFDcEI7TUFDRSxzQkFBc0IsRUFBRTtFQUM1QjtJQUNFLGtCQUFrQixFQUFFO0VBQ3RCO0lBQ0UsYUFBYTtJQUNiLG1CQUFtQixFQUFFO0VBQ3ZCO0lBQ0Usa0JBQWtCLEVBQUU7RUFDdEI7SUFDRSxjQUFjO0lBQ2QsZUFBZTtJQUNmLG1CQUFtQixFQUFFO0VBQ3ZCO0lBQ0UsYUFBYTtJQUNiLG1CQUFtQixFQUFFO0VBQ3ZCO0lBQ0UsbUJBQW1CLEVBQUU7RUFDdkI7SUFDRSxZQUFZO0lBQ1osV0FBVztJQUNYLGtCQUFrQixFQUFFO0VBQ3RCO0lBQ0Usa0JBQWtCO0lBQ2xCLGNBQWM7SUFDZCx5QkFBeUIsRUFBRTtFQUM3QjtJQUNFLGFBQWE7SUFDYixzQkFBc0IsRUFBRTtFQUMxQjtJQUNFLGFBQWE7SUFDYixzQkFBc0I7SUFDdEIsZ0JBQWdCO0lBQ2hCLG9CQUFvQixFQUFFO0VBQ3hCO0lBQ0UsYUFBYTtJQUNiLG9CQUFvQixFQUFFO0VBQ3hCO0lBQ0UsYUFBYTtJQUNiLHVCQUF1QjtJQUN2QixtQkFBbUI7SUFDbkIsZUFBZTtJQUNmLFlBQVk7SUFDWixXQUFXO0lBQ1gsaUJBQWlCO0lBQ2pCLHlCQUF5QjtJQUN6QixtQkFBbUIsRUFBRTtFQUN2QjtJQUNFLFlBQVk7SUFDWixjQUFjO0lBQ2QsYUFBYTtJQUNiLHVCQUF1QjtJQUN2QixtQkFBbUI7SUFDbkIsZUFBZTtJQUNmLGlCQUFpQjtJQUNqQixtQkFBbUIsRUFBRTtJQUNyQjtNQUNFLHlCQUF5QixFQUFFO0lBQzdCO01BQ0UseUJBQXlCLEVBQUU7RUFDL0I7SUFDRSxrQkFBa0I7SUFDbEIsaUJBQWlCO0lBQ2pCLHNCQUFzQjtJQUN0QixVQUFVO0lBQ1YsU0FBUztJQUNULFlBQVk7SUFDWixpQkFBaUI7SUFDakIsZ0JBQWdCO0lBQ2hCLHNCQUFzQixFQUFFO0lBQ3hCO01BQ0UsZ0JBQWdCLEVBQUU7TUFDbEI7UUFDRSxjQUFjLEVBQUU7TUFDbEI7UUFDRSxtQkFBbUI7UUFDbkIsYUFBYTtRQUNiLG1CQUFtQixFQUFFO1FBQ3JCO1VBQ0UsZUFBZSxFQUFFO1FBQ25CO1VBQ0UseUJBQXlCLEVBQUU7UUFDN0I7VUFDRSx5QkFBeUI7VUFDekIsaUJBQWlCLEVBQUU7TUFDdkI7UUFDRSxXQUFXO1FBQ1gsWUFBWTtRQUNaLG1CQUFtQixFQUFFOztBQUU3QjtFQUNFLGtCQUFrQixFQUFFOztBQUV0QjtFQUNFLGtCQUFrQjtFQUNsQixTQUFTO0VBQ1QsUUFBUTtFQUNSLFVBQVUsRUFBRTs7QUFFZDtFQUNFLGtCQUFrQixFQUFFOztBQUV0QjtFQUNFLHlCQUF5QjtFQUN6QixXQUFXO0VBQ1gsYUFBYTtFQUNiLDhCQUE4QjtFQUM5QixjQUFjO0VBQ2Qsb0JBQW9CLEVBQUU7RUFDdEI7SUFDRSxjQUFjO0lBQ2Qsa0JBQWtCLEVBQUU7RUFDdEI7SUFDRSxjQUFjLEVBQUU7RUFDbEI7SUFDRSxhQUFhO0lBQ2IsbUJBQW1CLEVBQUU7RUFDdkI7SUFDRSxhQUFhO0lBQ2IsbUJBQW1CO0lBQ25CLHlCQUF5QjtJQUN6QixlQUFlLEVBQUU7SUFDakI7TUFDRSxrQkFBa0IsRUFBRTtJQUN0QjtNQUNFLG1CQUFtQjtNQUNuQiwwQ0FBMEMsRUFBRTtFQUNoRDtJQUNFLFlBQVk7SUFDWixXQUFXLEVBQUU7O0FBRWpCO0VBQ0UsV0FBVztFQUNYLGdDQUFnQztFQUNoQyxpQkFBaUI7RUFDakIsbUJBQW1CLEVBQUU7O0FBRXZCO0VBQ0UsVUFBVTtFQUNWLG9CQUFvQixFQUFFO0VBQ3RCO0lBQ0UsYUFBYSxFQUFFO0lBQ2Y7TUFDRSxxQ0FBcUMsRUFBRTtJQUN6QztNQUNFLHFDQUFxQyxFQUFFO0lBQ3pDO01BQ0UsNkJBQTZCLEVBQUU7SUFDakM7TUFDRSx5QkFBeUIsRUFBRTtJQUM3QjtNQUNFLHlCQUF5QixFQUFFO0VBQy9CO0lBQ0UsYUFBYTtJQUNiLGlCQUFpQjtJQUNqQix1QkFBdUI7SUFDdkIsZ0JBQWdCO0lBQ2hCLHVCQUF1QjtJQUN2QixpQkFBaUIsRUFBRTtJQUNuQjtNQUNFLHlCQUF5QixFQUFFO0lBQzdCO01BQ0UsMEJBQTBCLEVBQUU7SUFDOUI7TUFDRSxtQkFBbUI7TUFDbkIsMkJBQTJCLEVBQUU7RUFDakM7SUFDRSxlQUFlO0lBQ2YsYUFBYTtJQUNiLGlCQUFpQjtJQUNqQixtQkFBbUI7SUFDbkIscUJBQXFCO0lBQ3JCLFdBQVc7SUFDWCxXQUFXO0lBQ1gsbUJBQW1CLEVBQUU7SUFDckI7TUFDRSwyQkFBMkIsRUFBRTtJQUMvQjtNQUNFLHVCQUF1QixFQUFFOztBQUUvQjtFQUNFLGtCQUFrQjtFQUNsQixVQUFVO0VBQ1YsWUFBWTtFQUNaLGFBQWEsRUFBRTtFQUNmO0lBQ0UsV0FBVztJQUNYLFlBQVksRUFBRTs7QUFFbEI7RUFDRSxVQUFVLEVBQUU7O0FBRWQ7RUFDRSxZQUFZLEVBQUU7O0FBRWhCO0VBQ0Usb0JBQW9CO0VBQ3BCLGFBQWE7RUFDYiwyREFBMkQ7RUFDM0QscUJBQXFCO0VBQ3JCLGtCQUFrQixFQUFFO0VBQ3BCO0lBQ0Usa0JBQWtCLEVBQUU7RUFDdEI7SUFDRSxtQkFBbUI7SUFDbkIsYUFBYTtJQUNiLFlBQVksRUFBRTtFQUNoQjtJQUNFLGFBQWE7SUFDYixZQUFZO0lBQ1osa0JBQWtCO0lBQ2xCLE1BQU07SUFDTixPQUFPO0lBQ1AsMkJBQTJCO0lBQzNCLGdCQUFnQjtJQUNoQix3QkFBd0IsRUFBRTtJQUMxQjtNQUNFLDBCQUEwQixFQUFFO0VBQ2hDO0lBQ0Usa0JBQWtCO0lBQ2xCLFFBQVE7SUFDUixVQUFVO0lBQ1YsV0FBVztJQUNYLFlBQVk7SUFDWixrQkFBa0I7SUFDbEIsMENBQTBDLEVBQUU7RUFDOUM7SUFDRSxZQUFZO0lBQ1osYUFBYSxFQUFFO0VBQ2pCO0lBQ0UsV0FBVztJQUNYLFlBQVksRUFBRTs7QUFFbEI7RUFDRSxhQUFhO0VBQ2IsZ0JBQWdCLEVBQUU7RUFDbEI7SUFDRSxtQkFBbUIsRUFBRTtFQUN2QjtJQUNFLFlBQVk7SUFDWixhQUFhLEVBQUU7RUFDakI7SUFDRSxtQkFBbUI7SUFDbkIsWUFBWTtJQUNaLGFBQWE7SUFDYixzQkFBc0IsRUFBRTtFQUMxQjtJQUNFLHNCQUFzQjtJQUN0QixvQkFBb0I7SUFDcEIsZ0JBQWdCLEVBQUU7RUFDcEI7SUFDRSxrQkFBa0IsRUFBRTtFQUN0QjtJQUNFLG1CQUFtQjtJQUNuQixhQUFhLEVBQUU7RUFDakI7SUFDRSxZQUFZO0lBQ1osYUFBYTtJQUNiLGtCQUFrQjtJQUNsQixNQUFNO0lBQ04sT0FBTztJQUNQLDJCQUEyQjtJQUMzQixnQkFBZ0IsRUFBRTtJQUNsQjtNQUNFLDBCQUEwQixFQUFFO0VBQ2hDO0lBQ0UseUJBQXlCO0lBQ3pCLFlBQVk7SUFDWixhQUFhO0lBQ2Isc0JBQXNCO0lBQ3RCLGFBQWE7SUFDYixrQkFBa0IsRUFBRTtJQUNwQjtNQUNFLG1CQUFtQjtNQUNuQixnQ0FBZ0MsRUFBRTtJQUNwQztNQUNFLGFBQWE7TUFDYixtQkFBbUIsRUFBRTtNQUNyQjtRQUNFLGlCQUFpQjtRQUNqQixnQkFBZ0I7UUFDaEIsa0JBQWtCLEVBQUU7SUFDeEI7TUFDRSxhQUFhO01BQ2IsY0FBYztNQUNkLHNCQUFzQjtNQUN0QixrQkFBa0I7TUFDbEIsOENBQThDO01BQzlDLG1CQUFtQjtNQUNuQixxQkFBcUIsRUFBRTtNQUN2QjtRQUNFLDBDQUEwQyxFQUFFO01BQzlDO1FBQ0Usb0NBQW9DLEVBQUU7TUFDeEM7UUFDRSx3Q0FBd0MsRUFBRTtNQUM1QztRQUNFLDBDQUEwQyxFQUFFO01BQzlDO1FBQ0Usc0NBQXNDLEVBQUU7SUFDNUM7TUFDRSxtQkFBbUI7TUFDbkIsaUJBQWlCLEVBQUU7SUFDckI7TUFDRSxpQkFBaUI7TUFDakIsa0JBQWtCLEVBQUU7SUFDdEI7TUFDRSxpQkFBaUI7TUFDakIsa0JBQWtCLEVBQUU7SUFDdEI7TUFDRSxhQUFhO01BQ2IsbUJBQW1CO01BQ25CLDhCQUE4QixFQUFFO01BQ2hDO1FBQ0UsYUFBYTtRQUNiLHNCQUFzQixFQUFFO01BQzFCO1FBQ0UsYUFBYTtRQUNiLG1CQUFtQixFQUFFO1FBQ3JCO1VBQ0Usb0JBQW9CLEVBQUU7TUFDMUI7UUFDRSxXQUFXO1FBQ1gsY0FBYztRQUNkLHNCQUFzQjtRQUN0QixtQkFBbUI7UUFDbkIsZUFBZTtRQUNmLHlCQUF5QjtRQUN6QixhQUFhO1FBQ2IsdUJBQXVCO1FBQ3ZCLG1CQUFtQixFQUFFO1FBQ3JCO1VBQ0UseUJBQXlCLEVBQUU7UUFDN0I7VUFDRSx5QkFBeUIsRUFBRTtFQUNuQztJQUNFLGFBQWE7SUFDYixzQkFBc0IsRUFBRTtJQUN4QjtNQUNFLGFBQWE7TUFDYix5QkFBeUI7TUFDekIsWUFBWTtNQUNaLHNCQUFzQjtNQUN0QixXQUFXLEVBQUU7TUFDYjtRQUNFLGtCQUFrQixFQUFFO01BQ3RCO1FBQ0UsYUFBYTtRQUNiLGNBQWM7UUFDZCxvQkFBb0IsRUFBRTtJQUMxQjtNQUNFLGFBQWE7TUFDYixzQkFBc0IsRUFBRTtJQUMxQjtNQUNFLG9CQUFvQixFQUFFO0lBQ3hCO01BQ0UseUJBQXlCLEVBQUU7SUFDN0I7TUFDRSxhQUFhO01BQ2IsOEJBQThCO01BQzlCLHNCQUFzQjtNQUN0QixXQUFXO01BQ1gsaUJBQWlCO01BQ2pCLHlCQUF5QjtNQUN6Qix5QkFBeUI7TUFDekIsb0JBQW9CLEVBQUU7SUFDeEI7TUFDRSxjQUFjO01BQ2QsYUFBYTtNQUNiLHlCQUF5QjtNQUN6QixhQUFhO01BQ2IsdUJBQXVCO01BQ3ZCLG1CQUFtQjtNQUNuQixtQkFBbUIsRUFBRTtJQUN2QjtNQUNFLFVBQVUsRUFBRTtJQUNkO01BQ0UsYUFBYSxFQUFFO0lBQ2pCO01BQ0UsYUFBYSxFQUFFO0lBQ2pCO01BQ0UsYUFBYSxFQUFFO0lBQ2pCO01BQ0UsZ0JBQWdCLEVBQUU7TUFDbEI7UUFDRSxxQkFBcUI7UUFDckIsV0FBVyxFQUFFO01BQ2Y7UUFDRSxhQUFhO1FBQ2IsOEJBQThCO1FBQzlCLGVBQWUsRUFBRTtRQUNqQjtVQUNFLHlCQUF5QixFQUFFO01BQy9CO1FBQ0UsYUFBYTtRQUNiLG1CQUFtQjtRQUNuQixrQkFBa0IsRUFBRTtNQUN0QjtRQUNFLGtCQUFrQixFQUFFO01BQ3RCO1FBQ0UsbUJBQW1CLEVBQUU7O0FBRTdCO0VBQ0UsYUFBYTtFQUNiLHNCQUFzQjtFQUN0QixzQ0FBc0MsRUFBRTs7QUFFMUM7O0VBRUUsZ0JBQWdCO0VBQ2hCLFVBQVUsRUFBRTtFQUNaOztJQUVFLGFBQWE7SUFDYixzQkFBc0IsRUFBRTtJQUN4Qjs7TUFFRSxhQUFhO01BQ2IscUJBQXFCO01BQ3JCLG1CQUFtQjtNQUNuQixrQkFBa0IsRUFBRTtJQUN0Qjs7TUFFRSxtQkFBbUIsRUFBRTtFQUN6Qjs7SUFFRSxrQkFBa0I7SUFDbEIsZUFBZTtJQUNmLFVBQVU7SUFDVixVQUFVLEVBQUU7O0FBRWhCO0VBQ0Usb0JBQW9CLEVBQUU7O0FBRXhCO0VBQ0UsYUFBYTtFQUNiLDBLQUEwSyxFQUFFOztBQUU5Szs7RUFFRSxnQkFBZ0I7RUFDaEIsc0NBQXNDO0VBQ3RDLG1JQUFvSDtFQUNwSCxhQUFhO0VBQ2Isc0JBQXNCO0VBQ3RCLG1CQUFtQjtFQUNuQixZQUFZO0VBQ1osc0JBQXNCO0VBQ3RCLDJCQUEyQixFQUFFOztBQUUvQjtFQUNFLGtDQUFrQztFQUNsQyxzQkFBc0IsRUFBRTs7QUFFMUI7RUFDRSxrQ0FBa0M7RUFDbEMsc0JBQXNCO0VBQ3RCLGFBQWEsRUFBRVwiLFwic291cmNlc0NvbnRlbnRcIjpbXCIqLFxcbio6OmFmdGVyLFxcbio6OmJlZm9yZSB7XFxuICBtYXJnaW46IDA7XFxuICBwYWRkaW5nOiAwO1xcbiAgYm94LXNpemluZzogaW5oZXJpdDsgfVxcblxcbmh0bWwge1xcbiAgZm9udC1zaXplOiA2Mi41JTsgfVxcblxcbmJvZHkge1xcbiAgYm94LXNpemluZzogYm9yZGVyLWJveDtcXG4gIG92ZXJmbG93LXg6IGhpZGRlbjtcXG4gIGZvbnQtc2l6ZTogMS42cmVtO1xcbiAgYmFja2dyb3VuZC1zaXplOiBjb3ZlcjtcXG4gIGJhY2tncm91bmQtcmVwZWF0OiBuby1yZXBlYXQ7XFxuICBoZWlnaHQ6IDEyNy41cmVtO1xcbiAgZm9udC1mYW1pbHk6ICdMYXRvJywgc2Fucy1zZXJpZjsgfVxcblxcbltoaWRkZW5dIHtcXG4gIGRpc3BsYXk6IG5vbmUgIWltcG9ydGFudDsgfVxcblxcbi5oZWFkaW5nLXRlcnRpYXJ5IHtcXG4gIGZvbnQtc2l6ZTogMi40cmVtO1xcbiAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTsgfVxcbiAgLmhlYWRpbmctdGVydGlhcnktLXdoaXRlIHtcXG4gICAgY29sb3I6ICNmZmY7IH1cXG5cXG4ubWItMTAge1xcbiAgbWFyZ2luLWJvdHRvbTogMXJlbTsgfVxcblxcbi5tYi0yMCB7XFxuICBtYXJnaW4tYm90dG9tOiAycmVtOyB9XFxuXFxuLm10LTUwIHtcXG4gIG1hcmdpbi10b3A6IDVyZW07IH1cXG5cXG4uYnRuLCAuYnRuOmxpbmssIC5idG46dmlzaXRlZCB7XFxuICBwYWRkaW5nOiAuNzVyZW0gMnJlbTtcXG4gIGJvcmRlci1yYWRpdXM6IC41cmVtO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2YyZjJmMjtcXG4gIGZvbnQtd2VpZ2h0OiA0MDA7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7IH1cXG5cXG4uYnRuOmFjdGl2ZSwgLmJ0bjpmb2N1cyB7XFxuICBvdXRsaW5lOiBub25lO1xcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC0xcHgpO1xcbiAgYm94LXNoYWRvdzogMCAwLjVyZW0gMXJlbSByZ2JhKDAsIDAsIDAsIDAuMik7IH1cXG5cXG4ubG9naW4tZm9ybV9fZ3JvdXA6bm90KDpsYXN0LWNoaWxkKSB7XFxuICBtYXJnaW4tYm90dG9tOiAyLjVyZW07IH1cXG5cXG4ubG9naW4tZm9ybV9fbGFiZWwge1xcbiAgbWFyZ2luLXJpZ2h0OiAuN3JlbTtcXG4gIGNvbG9yOiAjZmZmO1xcbiAgZm9udC1zaXplOiAxLjhyZW07XFxuICBmb250LXdlaWdodDogNDAwOyB9XFxuXFxuLmxvZ2luLWZvcm1fX2lucHV0IHtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxuICBwYWRkaW5nOiAuNXJlbSAwO1xcbiAgYm9yZGVyOiBub25lOyB9XFxuXFxuLmxvZ2luLWZvcm1fX2J0bi13cmFwcGVyIHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsgfVxcblxcbi5sb2dpbl9fcmVnaXN0ZXItdGV4dCB7XFxuICBtYXJnaW4tdG9wOiAxLjVyZW07XFxuICBjb2xvcjogI2ZmZjsgfVxcblxcbi5sb2dpbl9fcmVnaXN0ZXItbGluayB7XFxuICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICBjb2xvcjogI2ZmZjtcXG4gIHRyYW5zaXRpb246IGFsbCAuMnM7IH1cXG4gIC5sb2dpbl9fcmVnaXN0ZXItbGluazpob3ZlciB7XFxuICAgIGNvbG9yOiAjZmY4MDAwO1xcbiAgICB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZTsgfVxcblxcbi5uYXYge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxuICBwYWRkaW5nOiAycmVtIDZyZW07XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICMwMDA7IH1cXG4gIC5uYXZfX2l0ZW0ge1xcbiAgICBsaXN0LXN0eWxlOiBub25lOyB9XFxuICAgIC5uYXZfX2l0ZW0tLXNlYXJjaCB7XFxuICAgICAgZmxleDogMCAwIDI1JTsgfVxcbiAgLm5hdl9fbGluayB7XFxuICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gICAgY29sb3I6ICMwMDA7XFxuICAgIHRyYW5zaXRpb246IGFsbCAuMnM7IH1cXG4gICAgLm5hdl9fbGluazpob3ZlciB7XFxuICAgICAgbWFyZ2luLWJvdHRvbTogMnB4O1xcbiAgICAgIGNvbG9yOiAjZmZhNjRkO1xcbiAgICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjZmZhNjRkOyB9XFxuICAgIC5uYXZfX2xpbmstLWhvbWU6aG92ZXIgLm5hdl9faWNvbi1wYXRoLS1ob21lIHtcXG4gICAgICBmaWxsOiAjZmY4MDAwOyB9XFxuICAubmF2X19zZWFyY2gge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfVxcbiAgICAubmF2X19zZWFyY2gtaW5wdXQge1xcbiAgICAgIHdpZHRoOiA5MCU7XFxuICAgICAgYm9yZGVyLXJhZGl1czogM3JlbTtcXG4gICAgICBwYWRkaW5nOiAxcmVtIDJyZW07XFxuICAgICAgYm9yZGVyOiAxcHggc29saWQgI2JmYmZiZjtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjJmMmYyO1xcbiAgICAgIHRyYW5zaXRpb246IHdpZHRoIC4yczsgfVxcbiAgICAgIC5uYXZfX3NlYXJjaC1pbnB1dDpmb2N1cyB7XFxuICAgICAgICBvdXRsaW5lOiBub25lO1xcbiAgICAgICAgd2lkdGg6IDEyMCU7IH1cXG4gICAgLm5hdl9fc2VhcmNoLWJ0biB7XFxuICAgICAgY3Vyc29yOiBwb2ludGVyOyB9XFxuICAubmF2X19pY29uLXNpemluZy0taG9tZSB7XFxuICAgIHdpZHRoOiAzcmVtO1xcbiAgICBoZWlnaHQ6IDNyZW07IH1cXG4gIC5uYXZfX2ljb24tc2l6aW5nLS1zZWFyY2gge1xcbiAgICB3aWR0aDogMnJlbTtcXG4gICAgaGVpZ2h0OiAycmVtO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTE1MCUpOyB9XFxuICAubmF2X19pY29uLXBhdGgge1xcbiAgICBmaWxsOiAjYmZiZmJmOyB9XFxuXFxuLnJlZ2lzdGVyLWZvcm1fX2dyb3VwIHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxuICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAucmVnaXN0ZXItZm9ybV9fZ3JvdXA6bm90KDpsYXN0LWNoaWxkKSB7XFxuICAgIG1hcmdpbi1ib3R0b206IDNyZW07IH1cXG5cXG4ucmVnaXN0ZXItZm9ybV9fbGFiZWwge1xcbiAgbWFyZ2luLXJpZ2h0OiA0cmVtO1xcbiAgY29sb3I6ICNmZmY7XFxuICBmb250LXNpemU6IDEuOHJlbTtcXG4gIGZvbnQtd2VpZ2h0OiA0MDA7IH1cXG5cXG4ucmVnaXN0ZXItZm9ybV9faW5wdXQge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2YyZjJmMjtcXG4gIHBhZGRpbmc6IC41cmVtIDA7XFxuICBib3JkZXI6IG5vbmU7IH1cXG5cXG4ucmVnaXN0ZXItZm9ybV9fYnRuLXdyYXBwZXIge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyOyB9XFxuXFxuLnJlZ2lzdGVyX19sb2dpbi10ZXh0IHtcXG4gIG1hcmdpbi10b3A6IDEuNXJlbTtcXG4gIGNvbG9yOiAjZmZmOyB9XFxuXFxuLnJlZ2lzdGVyX19sb2dpbi1saW5rIHtcXG4gIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gIGNvbG9yOiAjZmZmO1xcbiAgdHJhbnNpdGlvbjogYWxsIC4yczsgfVxcbiAgLnJlZ2lzdGVyX19sb2dpbi1saW5rOmhvdmVyIHtcXG4gICAgY29sb3I6ICNmZjgwMDA7XFxuICAgIHRleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lOyB9XFxuXFxuLmVycm9yIHtcXG4gIG1hcmdpbi10b3A6IDJyZW07XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmY4MDgwO1xcbiAgYm9yZGVyLXJhZGl1czogMTBweDtcXG4gIHBhZGRpbmc6IDJyZW07XFxuICBmb250LXNpemU6IDJyZW07XFxuICBncmlkLWNvbHVtbjogY2VudGVyLXN0YXJ0IC8gY2VudGVyLWVuZDtcXG4gIGZvbnQtd2VpZ2h0OiA3MDA7IH1cXG5cXG4uc2VhcmNoLWZvcm0ge1xcbiAgcGFkZGluZzogMnJlbSAyNXJlbTsgfVxcbiAgLnNlYXJjaC1mb3JtX19ncm91cCB7XFxuICAgIHdpZHRoOiA3NSU7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIG1hcmdpbi1ib3R0b206IDNyZW07XFxuICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjMDAwO1xcbiAgICBhbGlnbi1pdGVtczogZmxleC1zdGFydDtcXG4gICAgcGFkZGluZzogLjVyZW0gNHJlbSAuNXJlbSAwOyB9XFxuICAuc2VhcmNoLWZvcm1fX2xhYmVsIHtcXG4gICAgZmxleDogMCAwIDIwJTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgYWxpZ24taXRlbXM6IGZsZXgtc3RhcnQ7XFxuICAgIG1hcmdpbi10b3A6IC43cmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX2dyb3VwLWlucHV0LXdyYXBwZXIge1xcbiAgICBmbGV4OiAwIDAgODAlOyB9XFxuICAuc2VhcmNoLWZvcm1fX3RpcCB7XFxuICAgIGZvbnQtc2l6ZTogMXJlbTtcXG4gICAgbGluZS1oZWlnaHQ6IDEuNDtcXG4gICAgd2lkdGg6IDcwJTsgfVxcbiAgLnNlYXJjaC1mb3JtX19pbnB1dC10ZXh0IHtcXG4gICAgd2lkdGg6IDQwcmVtO1xcbiAgICBoZWlnaHQ6IDRyZW07XFxuICAgIG1hcmdpbi1ib3R0b206IDFyZW07XFxuICAgIHBhZGRpbmc6IDFyZW07XFxuICAgIGJvcmRlcjogc29saWQgMXB4ICNiZmJmYmY7XFxuICAgIGJvcmRlci1yYWRpdXM6IDVweDsgfVxcbiAgICAuc2VhcmNoLWZvcm1fX2lucHV0LXRleHQ6Zm9jdXMge1xcbiAgICAgIGJvcmRlcjogc29saWQgMXB4ICMwMDA7IH1cXG4gIC5zZWFyY2gtZm9ybV9faW5wdXQtaW50ZWdlci0tcmVsYXRpdmUge1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7IH1cXG4gIC5zZWFyY2gtZm9ybV9fZ3JvdXAtLWNoZWNrYm94IHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgbWFyZ2luLWJvdHRvbTogMXJlbTsgfVxcbiAgLnNlYXJjaC1mb3JtX19sYWJlbC0tY2hlY2tib3gge1xcbiAgICBtYXJnaW4tcmlnaHQ6IDFyZW07IH1cXG4gIC5zZWFyY2gtZm9ybV9faW5wdXQtY2hlY2tib3gge1xcbiAgICB3aWR0aDogMi4yNXJlbTtcXG4gICAgaGVpZ2h0OiAyLjI1cmVtO1xcbiAgICBtYXJnaW4tcmlnaHQ6IC44cmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX2NoZWNrYm94LXdyYXBwZXIge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAuc2VhcmNoLWZvcm1fX3NlbGVjdC1tZW51IHtcXG4gICAgbWFyZ2luLWJvdHRvbTogMXJlbTsgfVxcbiAgLnNlYXJjaC1mb3JtX19zdmctc2l6ZSB7XFxuICAgIGhlaWdodDogMnJlbTtcXG4gICAgd2lkdGg6IDJyZW07XFxuICAgIG1hcmdpbi1yaWdodDogMXJlbTsgfVxcbiAgLnNlYXJjaC1mb3JtX19zdWJtaXQge1xcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XFxuICAgIHBhZGRpbmc6IC43cmVtO1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCAjYjMwMGIzOyB9XFxuICAuc2VhcmNoLWZvcm1fX2Ryb3Bkb3duLXNwYW4ge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9XFxuICAuc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLCAuc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXNldHMge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgICBsaXN0LXN0eWxlOiBub25lO1xcbiAgICBtYXJnaW4tYm90dG9tOiAuM3JlbTsgfVxcbiAgLnNlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy1saXN0LWl0ZW0sIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtc2V0cy1saXN0LWl0ZW0ge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBtYXJnaW4tYm90dG9tOiAuN3JlbTsgfVxcbiAgLnNlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy1yZW1vdmUtYnRuLCAuc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXNldHMtcmVtb3ZlLWJ0biB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgIGhlaWdodDogMnJlbTtcXG4gICAgd2lkdGg6IDJyZW07XFxuICAgIGZvbnQtc2l6ZTogMS4zcmVtO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjJmMmYyO1xcbiAgICBtYXJnaW4tcmlnaHQ6IC43cmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLXRvZ2dsZXIge1xcbiAgICBoZWlnaHQ6IDJyZW07XFxuICAgIHdpZHRoOiAyLjc1cmVtO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICBmb250LXNpemU6IDEuM3JlbTtcXG4gICAgbWFyZ2luLXJpZ2h0OiAuN3JlbTsgfVxcbiAgICAuc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLXRvZ2dsZXItLWlzIHtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDdkMTQ3OyB9XFxuICAgIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlci0tbm90IHtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmYwMDAwOyB9XFxuICAuc2VhcmNoLWZvcm1fX2Ryb3Bkb3duIHtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICBtYXgtaGVpZ2h0OiAyOHJlbTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gICAgei1pbmRleDogMjtcXG4gICAgdG9wOiAxMDAlO1xcbiAgICB3aWR0aDogNDByZW07XFxuICAgIG1hcmdpbi10b3A6IC0xcmVtO1xcbiAgICBvdmVyZmxvdy15OiBhdXRvO1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCAjMDAwOyB9XFxuICAgIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdCB7XFxuICAgICAgbGlzdC1zdHlsZTogbm9uZTsgfVxcbiAgICAgIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1jYXRlZ29yeSB7XFxuICAgICAgICBwYWRkaW5nOiAuNXJlbTsgfVxcbiAgICAgIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1vcHRpb24ge1xcbiAgICAgICAgcGFkZGluZzogLjNyZW0gMnJlbTtcXG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAgICAgICAuc2VhcmNoLWZvcm1fX2Ryb3Bkb3duLWxpc3Qtb3B0aW9uOmhvdmVyIHtcXG4gICAgICAgICAgY3Vyc29yOiBwb2ludGVyOyB9XFxuICAgICAgICAuc2VhcmNoLWZvcm1fX2Ryb3Bkb3duLWxpc3Qtb3B0aW9uLS1oaWdobGlnaHRlZCB7XFxuICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6ICNjY2Q4ZmY7IH1cXG4gICAgICAgIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1vcHRpb24gc3BhbiB7XFxuICAgICAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICAgICAgICAgIG1hcmdpbi1sZWZ0OiAxcmVtOyB9XFxuICAgICAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0LWltZyB7XFxuICAgICAgICB3aWR0aDogMnJlbTtcXG4gICAgICAgIGhlaWdodDogMnJlbTtcXG4gICAgICAgIG1hcmdpbi1yaWdodDogLjdyZW07IH1cXG5cXG4uZHJvcGRvd24td3JhcHBlciB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7IH1cXG5cXG4uaW52LXNlYXJjaC1wcmljZS1tc2cge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgYm90dG9tOiAwO1xcbiAgcmlnaHQ6IDA7XFxuICBjb2xvcjogcmVkOyB9XFxuXFxuLnJlbGF0aXZlIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcblxcbi5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzk5YjFmZjtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcXG4gIHBhZGRpbmc6IDAgMTAlO1xcbiAgbWFyZ2luLWJvdHRvbTogLjFyZW07IH1cXG4gIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtc2VsZWN0IHtcXG4gICAgY29sb3I6ICNiMzAwYjM7XFxuICAgIG1hcmdpbi1yaWdodDogMXJlbTsgfVxcbiAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1sYWJlbCB7XFxuICAgIGNvbG9yOiAjYjMwMGIzOyB9XFxuICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXJpZ2h0IHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfVxcbiAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1wYWdpbmF0aW9uLWNvbnRhaW5lciB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNjY2Q4ZmY7XFxuICAgIGN1cnNvcjogcG9pbnRlcjsgfVxcbiAgICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXBhZ2luYXRpb24tY29udGFpbmVyOm5vdCg6bGFzdC1jaGlsZCkge1xcbiAgICAgIG1hcmdpbi1yaWdodDogM3JlbTsgfVxcbiAgICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXBhZ2luYXRpb24tY29udGFpbmVyLS1kaXNhYmxlZCB7XFxuICAgICAgY3Vyc29yOiBub3QtYWxsb3dlZDtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDIwNCwgMjE2LCAyNTUsIDAuNCk7IH1cXG4gIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtc3ZnLXNpemUge1xcbiAgICBoZWlnaHQ6IDJyZW07XFxuICAgIHdpZHRoOiAycmVtOyB9XFxuXFxuLmFwaS1yZXN1bHRzLWRpc3BsYXlfX2Rpc3BsYXktYmFyIHtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNiZmJmYmY7XFxuICBwYWRkaW5nLWxlZnQ6IDEwJTtcXG4gIG1hcmdpbi1ib3R0b206IDJyZW07IH1cXG5cXG4uY2FyZC1jaGVja2xpc3Qge1xcbiAgd2lkdGg6IDgwJTtcXG4gIGp1c3RpZnktc2VsZjogY2VudGVyOyB9XFxuICAuY2FyZC1jaGVja2xpc3RfX3JvdyB7XFxuICAgIGRpc3BsYXk6IGdyaWQ7IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19yb3ctLTcge1xcbiAgICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KDcsIDFmcik7IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19yb3ctLTkge1xcbiAgICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KDksIDFmcik7IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19yb3ctLWhlYWRlciB7XFxuICAgICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICMwMDA7IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19yb3ctLWdyZXkge1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmMmYyZjI7IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19yb3c6bnRoLWNoaWxkKGV2ZW4pIHtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjJmMmYyOyB9XFxuICAuY2FyZC1jaGVja2xpc3RfX2RhdGEge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LXdyYXA6IG5vd3JhcDtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgIG92ZXJmbG93OiBoaWRkZW47XFxuICAgIHRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzO1xcbiAgICBmb250LXNpemU6IDEuNHJlbTsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX2RhdGEtLXNldCB7XFxuICAgICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX2RhdGEtLXJhcml0eSB7XFxuICAgICAgdGV4dC10cmFuc2Zvcm06IGNhcGl0YWxpemU7IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19kYXRhLS1uYW1lIHtcXG4gICAgICB3aGl0ZS1zcGFjZTogbm93cmFwO1xcbiAgICAgIGp1c3RpZnktY29udGVudDogZmxleC1zdGFydDsgfVxcbiAgLmNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmsge1xcbiAgICBwYWRkaW5nOiAxcmVtIDA7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtd3JhcDogbm93cmFwO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBjb2xvcjogIzAwMDtcXG4gICAgd2hpdGUtc3BhY2U6IG5vd3JhcDsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX2RhdGEtbGluay0tc3RhcnQge1xcbiAgICAgIGp1c3RpZnktY29udGVudDogZmxleC1zdGFydDsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX2RhdGEtbGluay0tY2VudGVyIHtcXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsgfVxcblxcbi50b29sdGlwIHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHotaW5kZXg6IDU7XFxuICB3aWR0aDogMjRyZW07XFxuICBoZWlnaHQ6IDM0cmVtOyB9XFxuICAudG9vbHRpcF9faW1nIHtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGhlaWdodDogMTAwJTsgfVxcblxcbi5uZWdhdGl2ZS1lYXJuaW5ncyB7XFxuICBjb2xvcjogcmVkOyB9XFxuXFxuLnBvc2l0aXZlLWVhcm5pbmdzIHtcXG4gIGNvbG9yOiBncmVlbjsgfVxcblxcbi5pbWFnZS1ncmlkIHtcXG4gIHBhZGRpbmc6IDEwcmVtIDE1cmVtO1xcbiAgZGlzcGxheTogZ3JpZDtcXG4gIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KGF1dG8tZml0LCBtaW5tYXgoMjVyZW0sIDFmcikpO1xcbiAgZ3JpZC1jb2x1bW4tZ2FwOiAycmVtO1xcbiAgZ3JpZC1yb3ctZ2FwOiAxcmVtOyB9XFxuICAuaW1hZ2UtZ3JpZF9fb3V0ZXItZGl2IHtcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuICAuaW1hZ2UtZ3JpZF9faW5uZXItZGl2IHtcXG4gICAgcGVyc3BlY3RpdmU6IDE1MHJlbTtcXG4gICAgaGVpZ2h0OiAzNHJlbTtcXG4gICAgd2lkdGg6IDI0cmVtOyB9XFxuICAuaW1hZ2UtZ3JpZF9fZG91YmxlIHtcXG4gICAgaGVpZ2h0OiAzNHJlbTtcXG4gICAgd2lkdGg6IDI0cmVtO1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIHRvcDogMDtcXG4gICAgbGVmdDogMDtcXG4gICAgYmFja2ZhY2UtdmlzaWJpbGl0eTogaGlkZGVuO1xcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgLjhzIGVhc2U7IH1cXG4gICAgLmltYWdlLWdyaWRfX2RvdWJsZS0tYmFjayB7XFxuICAgICAgdHJhbnNmb3JtOiByb3RhdGVZKDE4MGRlZyk7IH1cXG4gIC5pbWFnZS1ncmlkX19kb3VibGUtYnRuIHtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICB0b3A6IDUwJTtcXG4gICAgcmlnaHQ6IDE1JTtcXG4gICAgd2lkdGg6IDRyZW07XFxuICAgIGhlaWdodDogNHJlbTtcXG4gICAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNCk7IH1cXG4gIC5pbWFnZS1ncmlkX19jb250YWluZXIge1xcbiAgICB3aWR0aDogMjRyZW07XFxuICAgIGhlaWdodDogMzRyZW07IH1cXG4gIC5pbWFnZS1ncmlkX19pbWFnZSB7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBoZWlnaHQ6IDEwMCU7IH1cXG5cXG4uY2FyZCB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgbWFyZ2luLXRvcDogM3JlbTsgfVxcbiAgLmNhcmRfX2ltZy1jb250YWluZXIge1xcbiAgICBtYXJnaW4tcmlnaHQ6IDEwcmVtOyB9XFxuICAuY2FyZF9faW1nIHtcXG4gICAgd2lkdGg6IDMzcmVtO1xcbiAgICBoZWlnaHQ6IDQ2cmVtOyB9XFxuICAuY2FyZF9faW1nLWxlZnQge1xcbiAgICBtYXJnaW4tcmlnaHQ6IDEwcmVtO1xcbiAgICB3aWR0aDogMzNyZW07XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH1cXG4gIC5jYXJkX19pbWctYnRuIHtcXG4gICAganVzdGlmeS1zZWxmOiBmbGV4LWVuZDtcXG4gICAgYWxpZ24tc2VsZjogZmxleC1lbmQ7XFxuICAgIG1hcmdpbi10b3A6IGF1dG87IH1cXG4gIC5jYXJkX19pbWctZG91YmxlLWFyZWEge1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7IH1cXG4gIC5jYXJkX19pbWctZG91YmxlLXNpZGVkIHtcXG4gICAgcGVyc3BlY3RpdmU6IDE1MHJlbTtcXG4gICAgaGVpZ2h0OiA0NnJlbTsgfVxcbiAgLmNhcmRfX2ltZy1kb3VibGUge1xcbiAgICB3aWR0aDogMzNyZW07XFxuICAgIGhlaWdodDogNDZyZW07XFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgdG9wOiAwO1xcbiAgICBsZWZ0OiAwO1xcbiAgICBiYWNrZmFjZS12aXNpYmlsaXR5OiBoaWRkZW47XFxuICAgIG92ZXJmbG93OiBoaWRkZW47IH1cXG4gICAgLmNhcmRfX2ltZy1kb3VibGUtLWJhY2sge1xcbiAgICAgIHRyYW5zZm9ybTogcm90YXRlWSgxODBkZWcpOyB9XFxuICAuY2FyZF9fdGV4dCB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmNGY0ZDc7XFxuICAgIHdpZHRoOiAzNHJlbTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gICAgcGFkZGluZzogMXJlbTtcXG4gICAgbWFyZ2luLXJpZ2h0OiAzcmVtOyB9XFxuICAgIC5jYXJkX190ZXh0LWZsZXgge1xcbiAgICAgIG1hcmdpbi1ib3R0b206IDFyZW07XFxuICAgICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNiZmJmYmY7IH1cXG4gICAgLmNhcmRfX3RleHQtdGl0bGUge1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfVxcbiAgICAgIC5jYXJkX190ZXh0LXRpdGxlLWgzIHtcXG4gICAgICAgIGZvbnQtc2l6ZTogMS44cmVtO1xcbiAgICAgICAgZm9udC13ZWlnaHQ6IDQwMDtcXG4gICAgICAgIG1hcmdpbi1yaWdodDogMXJlbTsgfVxcbiAgICAuY2FyZF9fdGV4dC1jb2xvci1pbmRpY2F0b3Ige1xcbiAgICAgIHdpZHRoOiAxLjNyZW07XFxuICAgICAgaGVpZ2h0OiAxLjNyZW07XFxuICAgICAgYm9yZGVyOiAxcHggc29saWQgIzMzMztcXG4gICAgICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICAgICAgYm94LXNoYWRvdzogMHB4IDBweCAwcHggMnB4IHJnYmEoMCwgMCwgMCwgMC4yKTtcXG4gICAgICBtYXJnaW4tcmlnaHQ6IC43cmVtO1xcbiAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jazsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWNvbG9yLWluZGljYXRvci0tVSB7XFxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDEyOCwgMTI4LCAyNTUsIDAuNyk7IH1cXG4gICAgICAuY2FyZF9fdGV4dC1jb2xvci1pbmRpY2F0b3ItLUIge1xcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAwLCAwLCAwLjcpOyB9XFxuICAgICAgLmNhcmRfX3RleHQtY29sb3ItaW5kaWNhdG9yLS1SIHtcXG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjU1LCA3NywgNzcsIDAuNyk7IH1cXG4gICAgICAuY2FyZF9fdGV4dC1jb2xvci1pbmRpY2F0b3ItLVcge1xcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjcpOyB9XFxuICAgICAgLmNhcmRfX3RleHQtY29sb3ItaW5kaWNhdG9yLS1HIHtcXG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMjU1LCAwLCAwLjcpOyB9XFxuICAgIC5jYXJkX190ZXh0LW9yYWNsZS1wIHtcXG4gICAgICBtYXJnaW4tYm90dG9tOiAxcmVtO1xcbiAgICAgIGZvbnQtc2l6ZTogMS4zcmVtOyB9XFxuICAgIC5jYXJkX190ZXh0LW9yYWNsZS1mbGF2b3Ige1xcbiAgICAgIGZvbnQtc2l6ZTogMS4zcmVtO1xcbiAgICAgIGZvbnQtc3R5bGU6IGl0YWxpYzsgfVxcbiAgICAuY2FyZF9fdGV4dC1pbGx1c3RyYXRvciB7XFxuICAgICAgZm9udC1zaXplOiAxLjJyZW07XFxuICAgICAgZm9udC1zdHlsZTogaXRhbGljOyB9XFxuICAgIC5jYXJkX190ZXh0LWxlZ2FsIHtcXG4gICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgIGZsZXgtZGlyZWN0aW9uOiByb3c7XFxuICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuOyB9XFxuICAgICAgLmNhcmRfX3RleHQtbGVnYWwtaGFsZiB7XFxuICAgICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWxlZ2FsLXNwYW4tY29udGFpbmVyIHtcXG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAgICAgICAuY2FyZF9fdGV4dC1sZWdhbC1zcGFuLWNvbnRhaW5lcjpub3QoOmxhc3QtY2hpbGQpIHtcXG4gICAgICAgICAgbWFyZ2luLWJvdHRvbTogLjVyZW07IH1cXG4gICAgICAuY2FyZF9fdGV4dC1sZWdhbC1zcGFuLWJveCB7XFxuICAgICAgICB3aWR0aDogNnJlbTtcXG4gICAgICAgIGhlaWdodDogMi41cmVtO1xcbiAgICAgICAgYm9yZGVyOiAxcHggc29saWQgIzAwMDtcXG4gICAgICAgIG1hcmdpbi1yaWdodDogLjNyZW07XFxuICAgICAgICBmb250LXNpemU6IDFyZW07XFxuICAgICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xcbiAgICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfVxcbiAgICAgICAgLmNhcmRfX3RleHQtbGVnYWwtc3Bhbi1ib3gtLW5vdF9sZWdhbCB7XFxuICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmZjAwMDA7IH1cXG4gICAgICAgIC5jYXJkX190ZXh0LWxlZ2FsLXNwYW4tYm94LS1sZWdhbCB7XFxuICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6ICM0N2QxNDc7IH1cXG4gIC5jYXJkX19zZXQge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9XFxuICAgIC5jYXJkX19zZXQtYmFubmVyIHtcXG4gICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkICNiZmJmYmY7XFxuICAgICAgd2lkdGg6IDQwcmVtO1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICMwMDA7XFxuICAgICAgY29sb3I6ICNmZmY7IH1cXG4gICAgICAuY2FyZF9fc2V0LWJhbm5lci1zdmctY29udGFpbmVyIHtcXG4gICAgICAgIG1hcmdpbi1yaWdodDogMXJlbTsgfVxcbiAgICAgIC5jYXJkX19zZXQtYmFubmVyLXN2ZyB7XFxuICAgICAgICB3aWR0aDogMi40cmVtO1xcbiAgICAgICAgaGVpZ2h0OiAyLjRyZW07XFxuICAgICAgICBmaWx0ZXI6IGludmVydCgxMDAlKTsgfVxcbiAgICAuY2FyZF9fc2V0LWRldGFpbHMge1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgfVxcbiAgICAuY2FyZF9fc2V0LWhlYWRlci1uYW1lIHtcXG4gICAgICBmb250LXNpemU6IDEuN3JlbXJlbTsgfVxcbiAgICAuY2FyZF9fc2V0LWhlYWRlci1jb2RlIHtcXG4gICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOyB9XFxuICAgIC5jYXJkX19zZXQtcHJpbnRzLWhlYWRlciB7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzAwMDtcXG4gICAgICBjb2xvcjogI2ZmZjtcXG4gICAgICBmb250LXNpemU6IDEuM3JlbTtcXG4gICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkICNiZmJmYmY7XFxuICAgICAgcGFkZGluZzogLjNyZW0gLjdyZW07IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtc3ZnLWNvbnRhaW5lciB7XFxuICAgICAgaGVpZ2h0OiAxLjhyZW07XFxuICAgICAgd2lkdGg6IDEuOHJlbTtcXG4gICAgICBib3JkZXI6IDFweCBzb2xpZCAjYmZiZmJmO1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgICBib3JkZXItcmFkaXVzOiAxMDAlOyB9XFxuICAgIC5jYXJkX19zZXQtcHJpbnRzLXN2Zy0tY29tbW9uIHtcXG4gICAgICBmaWxsOiAjMDAwOyB9XFxuICAgIC5jYXJkX19zZXQtcHJpbnRzLXN2Zy0tdW5jb21tb24ge1xcbiAgICAgIGZpbGw6ICNlNmU2ZTY7IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtc3ZnLS1yYXJlIHtcXG4gICAgICBmaWxsOiAjZTZjMzAwOyB9XFxuICAgIC5jYXJkX19zZXQtcHJpbnRzLXN2Zy0tbXl0aGljIHtcXG4gICAgICBmaWxsOiAjZmYwMDAwOyB9XFxuICAgIC5jYXJkX19zZXQtcHJpbnRzLWxpc3Qge1xcbiAgICAgIGxpc3Qtc3R5bGU6IG5vbmU7IH1cXG4gICAgICAuY2FyZF9fc2V0LXByaW50cy1saXN0LWxpbms6bGluaywgLmNhcmRfX3NldC1wcmludHMtbGlzdC1saW5rOnZpc2l0ZWQge1xcbiAgICAgICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgICAgICAgY29sb3I6ICMwMDA7IH1cXG4gICAgICAuY2FyZF9fc2V0LXByaW50cy1saXN0LWl0ZW0ge1xcbiAgICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcXG4gICAgICAgIGN1cnNvcjogcG9pbnRlcjsgfVxcbiAgICAgICAgLmNhcmRfX3NldC1wcmludHMtbGlzdC1pdGVtOmhvdmVyIHtcXG4gICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2YyZjJmMjsgfVxcbiAgICAgIC5jYXJkX19zZXQtcHJpbnRzLWxpc3QtaXRlbS1uYW1lLXdyYXBwZXIge1xcbiAgICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgICAgICBtYXJnaW4tbGVmdDogLTFyZW07IH1cXG4gICAgICAuY2FyZF9fc2V0LXByaW50cy1saXN0LWl0ZW0tc2V0LW5hbWUge1xcbiAgICAgICAgbWFyZ2luLWxlZnQ6IC41cmVtOyB9XFxuICAgICAgLmNhcmRfX3NldC1wcmludHMtbGlzdC1pdGVtLXByaWNlIHtcXG4gICAgICAgIG1hcmdpbi1yaWdodDogLjdyZW07IH1cXG5cXG4uY2FyZC1wYWdlIHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgZ3JpZC1jb2x1bW46IGNlbnRlci1zdGFydCAvIGNlbnRlci1lbmQ7IH1cXG5cXG4uYWRkLXRvLWludixcXG4ucmVtb3ZlLWZyb20taW52IHtcXG4gIG1hcmdpbi10b3A6IDNyZW07XFxuICB3aWR0aDogNTAlOyB9XFxuICAuYWRkLXRvLWludl9fZm9ybSxcXG4gIC5yZW1vdmUtZnJvbS1pbnZfX2Zvcm0ge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9XFxuICAgIC5hZGQtdG8taW52X19mb3JtLWdyb3VwLFxcbiAgICAucmVtb3ZlLWZyb20taW52X19mb3JtLWdyb3VwIHtcXG4gICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgIGFsaWduLWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgICBtYXJnaW4tYm90dG9tOiAzcmVtO1xcbiAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcbiAgICAuYWRkLXRvLWludl9fZm9ybS1sYWJlbCxcXG4gICAgLnJlbW92ZS1mcm9tLWludl9fZm9ybS1sYWJlbCB7XFxuICAgICAgbWFyZ2luLXJpZ2h0OiAuM3JlbTsgfVxcbiAgLmFkZC10by1pbnYtcHJpY2UtbXNnLFxcbiAgLnJlbW92ZS1mcm9tLWludi1wcmljZS1tc2cge1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIGJvdHRvbTogLTEuOHJlbTtcXG4gICAgcmlnaHQ6IDI1JTtcXG4gICAgY29sb3I6IHJlZDsgfVxcblxcbi5uby1yZXN1bHRzIHtcXG4gIGp1c3RpZnktc2VsZjogY2VudGVyOyB9XFxuXFxuLmNvbnRhaW5lciB7XFxuICBkaXNwbGF5OiBncmlkO1xcbiAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiBbZnVsbC1zdGFydF0gbWlubWF4KDZyZW0sIDFmcikgW2NlbnRlci1zdGFydF0gcmVwZWF0KDgsIFtjb2wtc3RhcnRdIG1pbm1heChtaW4tY29udGVudCwgMTRyZW0pIFtjb2wtZW5kXSkgW2NlbnRlci1lbmRdIG1pbm1heCg2cmVtLCAxZnIpIFtmdWxsLWVuZF07IH1cXG5cXG4ubG9naW4sXFxuLnJlZ2lzdGVyIHtcXG4gIG1hcmdpbi10b3A6IDVyZW07XFxuICBncmlkLWNvbHVtbjogY2VudGVyLXN0YXJ0IC8gY2VudGVyLWVuZDtcXG4gIGJhY2tncm91bmQtaW1hZ2U6IGxpbmVhci1ncmFkaWVudCh0byByaWdodCBib3R0b20sIHJnYmEoMCwgMCwgMCwgMC44KSwgcmdiYSgwLCAwLCAwLCAwLjgpKSwgdXJsKC4uL2ltZy9sb2dpbi1iZy5qcGcpO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgaGVpZ2h0OiA3NXZoO1xcbiAgYmFja2dyb3VuZC1zaXplOiBjb3ZlcjtcXG4gIGJhY2tncm91bmQtcG9zaXRpb246IGNlbnRlcjsgfVxcblxcbi5zZWFyY2gge1xcbiAgZ3JpZC1jb2x1bW46IGZ1bGwtc3RhcnQgLyBmdWxsLWVuZDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZmY7IH1cXG5cXG4uYXBpLXJlc3VsdHMtZGlzcGxheSB7XFxuICBncmlkLWNvbHVtbjogZnVsbC1zdGFydCAvIGZ1bGwtZW5kO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gIGRpc3BsYXk6IGdyaWQ7IH1cXG5cIl0sXCJzb3VyY2VSb290XCI6XCJcIn1dKTtcbi8vIEV4cG9ydHNcbmV4cG9ydCBkZWZhdWx0IF9fX0NTU19MT0FERVJfRVhQT1JUX19fO1xuIiwiLy8gSW1wb3J0c1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18gZnJvbSBcIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9jc3NXaXRoTWFwcGluZ1RvU3RyaW5nLmpzXCI7XG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fIGZyb20gXCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzXCI7XG5pbXBvcnQgX19fQ1NTX0xPQURFUl9HRVRfVVJMX0lNUE9SVF9fXyBmcm9tIFwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2dldFVybC5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfVVJMX0lNUE9SVF8wX19fIGZyb20gXCIuLi8uLi9pbWcvbWFuYS1zeW1ib2xzL21hbmEuc3ZnXCI7XG52YXIgX19fQ1NTX0xPQURFUl9FWFBPUlRfX18gPSBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18oX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyk7XG52YXIgX19fQ1NTX0xPQURFUl9VUkxfUkVQTEFDRU1FTlRfMF9fXyA9IF9fX0NTU19MT0FERVJfR0VUX1VSTF9JTVBPUlRfX18oX19fQ1NTX0xPQURFUl9VUkxfSU1QT1JUXzBfX18pO1xuLy8gTW9kdWxlXG5fX19DU1NfTE9BREVSX0VYUE9SVF9fXy5wdXNoKFttb2R1bGUuaWQsIFwiLm1hbmEge1xcbiAgICBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXCIgKyBfX19DU1NfTE9BREVSX1VSTF9SRVBMQUNFTUVOVF8wX19fICsgXCIpO1xcbiAgICBiYWNrZ3JvdW5kLXJlcGVhdDogbm8tcmVwZWF0O1xcbiAgICBiYWNrZ3JvdW5kLXNpemU6IGF1dG8gNzAwJTtcXG4gICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgICBmb250LXNpemU6IDEwMCU7XFxufVxcblxcbi5tYW5hLnhzIHtcXG4gICAgd2lkdGg6IDEuNXJlbTtcXG4gICAgaGVpZ2h0OiAxLjVyZW07XFxufVxcblxcbi5tYW5hLnNtYWxsIHtcXG4gICAgaGVpZ2h0OiAycmVtO1xcbiAgICB3aWR0aDogMnJlbTtcXG59XFxuLm1hbmEubWVkaXVtIHtcXG4gICAgaGVpZ2h0OiAyZW07XFxuICAgIHdpZHRoOiAyZW07XFxufVxcbi5tYW5hLmxhcmdlIHtcXG4gICAgaGVpZ2h0OiA0ZW07XFxuICAgIHdpZHRoOiA0ZW07XFxufVxcbi5tYW5hLnMgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwIDA7IH1cXG4ubWFuYS5zMSB7IGJhY2tncm91bmQtcG9zaXRpb246IDExLjElIDA7IH1cXG4ubWFuYS5zMiB7IGJhY2tncm91bmQtcG9zaXRpb246IDIyLjIlIDA7IH1cXG4ubWFuYS5zMyB7IGJhY2tncm91bmQtcG9zaXRpb246IDMzLjMlIDA7IH1cXG4ubWFuYS5zNCB7IGJhY2tncm91bmQtcG9zaXRpb246IDQ0LjQlIDA7IH1cXG4ubWFuYS5zNSB7IGJhY2tncm91bmQtcG9zaXRpb246IDU1LjUlIDA7IH1cXG4ubWFuYS5zNiB7IGJhY2tncm91bmQtcG9zaXRpb246IDY2LjYlIDA7IH1cXG4ubWFuYS5zNyB7IGJhY2tncm91bmQtcG9zaXRpb246IDc3LjclIDA7IH1cXG4ubWFuYS5zOCB7IGJhY2tncm91bmQtcG9zaXRpb246IDg4LjglIDA7IH1cXG4ubWFuYS5zOSB7IGJhY2tncm91bmQtcG9zaXRpb246IDk5LjklIDA7IH1cXG5cXG4ubWFuYS5zMTAgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwIDE2JTsgfVxcbi5tYW5hLnMxMSB7IGJhY2tncm91bmQtcG9zaXRpb246IDExLjElIDE2LjYlOyB9XFxuLm1hbmEuczEyIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMjIuMiUgMTYuNiU7IH1cXG4ubWFuYS5zMTMgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAzMy4zJSAxNi42JTsgfVxcbi5tYW5hLnMxNCB7IGJhY2tncm91bmQtcG9zaXRpb246IDQ0LjQlIDE2LjYlOyB9XFxuLm1hbmEuczE1IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNTUuNSUgMTYuNiU7IH1cXG4ubWFuYS5zMTYgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA2Ni42JSAxNi42JTsgfVxcbi5tYW5hLnMxNyB7IGJhY2tncm91bmQtcG9zaXRpb246IDc3LjclIDE2LjYlOyB9XFxuLm1hbmEuczE4IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogODguOCUgMTYuNiU7IH1cXG4ubWFuYS5zMTkgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA5OS45JSAxNi42JTsgfVxcblxcbi5tYW5hLnMyMCB7IGJhY2tncm91bmQtcG9zaXRpb246IDAgMzMlOyB9XFxuLm1hbmEuc3ggeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAxMS4xJSAzMy4zJTsgfVxcbi5tYW5hLnN5IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMjIuMiUgMzMuMyU7IH1cXG4ubWFuYS5zeiB7IGJhY2tncm91bmQtcG9zaXRpb246IDMzLjMlIDMzLjMlOyB9XFxuLm1hbmEuc3cgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA0NC40JSAzMy4zJTsgfVxcbi5tYW5hLnN1IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNTUuNSUgMzMuMyU7IH1cXG4ubWFuYS5zYiB7IGJhY2tncm91bmQtcG9zaXRpb246IDY2LjYlIDMzLjMlOyB9XFxuLm1hbmEuc3IgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA3Ny43JSAzMy4zJTsgfVxcbi5tYW5hLnNnIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogODguOCUgMzMuMyU7IH1cXG4ubWFuYS5zcyB7IGJhY2tncm91bmQtcG9zaXRpb246IDk5LjklIDMzLjMlOyB9XFxuXFxuLm1hbmEuc3d1IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMCA1MCU7IH1cXG4ubWFuYS5zd2IgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAxMS4xJSA1MCU7IH1cXG4ubWFuYS5zdWIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAyMi4yJSA1MCU7IH1cXG4ubWFuYS5zdXIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAzMy4zJSA1MCU7IH1cXG4ubWFuYS5zYnIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA0NC40JSA1MCU7IH1cXG4ubWFuYS5zYmcgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA1NS41JSA1MCU7IH1cXG4ubWFuYS5zcncgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA2Ni42JSA1MCU7IH1cXG4ubWFuYS5zcmcgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA3Ny43JSA1MCU7IH1cXG4ubWFuYS5zZ3cgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4OC44JSA1MCU7IH1cXG4ubWFuYS5zZ3UgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA5OS45JSA1MCU7IH1cXG5cXG4ubWFuYS5zMncgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwIDY2LjYlOyB9XFxuLm1hbmEuczJ1IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMTEuMSUgNjYuNiU7IH1cXG4ubWFuYS5zMmIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAyMi4yJSA2Ni42JTsgfVxcbi5tYW5hLnMyciB7IGJhY2tncm91bmQtcG9zaXRpb246IDMzLjMlIDY2LjYlOyB9XFxuLm1hbmEuczJnIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNDQuNCUgNjYuNiU7IH1cXG4ubWFuYS5zd3AgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA1NS41JSA2Ni42JTsgfVxcbi5tYW5hLnN1cCB7IGJhY2tncm91bmQtcG9zaXRpb246IDY2LjYlIDY2LjYlOyB9XFxuLm1hbmEuc2JwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNzcuNyUgNjYuNiU7IH1cXG4ubWFuYS5zcnAgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4OC44JSA2Ni42JTsgfVxcbi5tYW5hLnNncCB7IGJhY2tncm91bmQtcG9zaXRpb246IDk5LjklIDY2LjYlOyB9XFxuXFxuLm1hbmEuc3QgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwJSA4My4zJTsgfVxcbi5tYW5hLnNxIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMTEuMSUgODMuMyU7IH1cXG5cXG4ubWFuYS5zYyB7IGJhY2tncm91bmQtcG9zaXRpb246IDc3LjclIDgzLjMlOyB9XFxuXFxuLm1hbmEuc2UgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4OC44JSA4My4zJTsgfVxcblxcbi5tYW5hLnMxMDAwMDAwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMCAxMDAlOyB9XFxuLm1hbmEuczEwMDAwMDAuc21hbGwgeyB3aWR0aDogNC45ZW07IH1cXG4ubWFuYS5zMTAwMDAwMC5tZWRpdW0geyB3aWR0aDogOS43ZW07IH1cXG4vKi5tYW5hLnMxMDAwMDAwLmxhcmdlIHsgd2lkdGg6IDE4LjhlbTsgfSovXFxuLm1hbmEuczEwMCB7IGJhY2tncm91bmQtcG9zaXRpb246IDYwJSAxMDAlOyB9XFxuLm1hbmEuczEwMC5zbWFsbCB7IHdpZHRoOiAxLjhlbTsgfVxcbi5tYW5hLnMxMDAubWVkaXVtIHsgd2lkdGg6IDMuN2VtOyB9XFxuLyoubWFuYS5zMTAwLmxhcmdlIHsgd2lkdGg6IDEwLjhlbTsgfSovXFxuLm1hbmEuc2NoYW9zIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNzYuNSUgMTAwJTsgfVxcbi5tYW5hLnNjaGFvcy5zbWFsbCB7IHdpZHRoOiAxLjJlbTsgfVxcbi5tYW5hLnNjaGFvcy5tZWRpdW0geyB3aWR0aDogMi4zZW07IH1cXG4vKi5tYW5hLnNjLmxhcmdlIHsgd2lkdGg6IDQuNmVtOyB9Ki9cXG4ubWFuYS5zaHcgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4My41JSAxMDAlOyB9XFxuLm1hbmEuc2h3LnNtYWxsIHsgd2lkdGg6IDAuNWVtOyB9XFxuLm1hbmEuc2h3Lm1lZGl1bSB7IHdpZHRoOiAxZW07IH1cXG4vKi5tYW5hLnNody5sYXJnZSB7IHdpZHRoOiAyZW07IH0qL1xcbi5tYW5hLnNociB7IGJhY2tncm91bmQtcG9zaXRpb246IDg5JSAxMDAlOyB9XFxuLm1hbmEuc2hyLnNtYWxsIHsgd2lkdGg6IDAuNWVtOyB9XFxuLm1hbmEuc2hyLm1lZGl1bSB7IHdpZHRoOiAxZW07IH1cXG4vKi5tYW5hLnNoci5sYXJnZSB7IHdpZHRoOiAyZW07IH0qL1xcblxcblxcbi5zaGFkb3cge1xcbiAgICBmaWx0ZXI6IFxcXCJwcm9naWQ6RFhJbWFnZVRyYW5zZm9ybS5NaWNyb3NvZnQuRHJvcHNoYWRvdyhPZmZYPS0xLCBPZmZZPTEsIENvbG9yPScjMDAwJylcXFwiO1xcbiAgICBmaWx0ZXI6IHVybCgjc2hhZG93KTtcXG4gICAgLXdlYmtpdC1maWx0ZXI6IGRyb3Atc2hhZG93KC0xcHggMXB4IDBweCAjMDAwKTtcXG4gICAgZmlsdGVyOiBkcm9wLXNoYWRvdygtMXB4IDFweCAwcHggIzAwMCk7XFxufVwiLCBcIlwiLHtcInZlcnNpb25cIjozLFwic291cmNlc1wiOltcIndlYnBhY2s6Ly9zcmMvY3NzL3ZlbmRvci9tYW5hLmNzc1wiXSxcIm5hbWVzXCI6W10sXCJtYXBwaW5nc1wiOlwiQUFB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LGtCQUFrQixZQUFZLEVBQUU7QUFDaEMsbUJBQW1CLFVBQVUsRUFBRTtBQUMvQixrQ0FBa0M7OztBQUdsQztJQUNJLHFGQUFxRjtJQUNyRixvQkFBb0I7SUFDcEIsOENBQThDO0lBQzlDLHNDQUFzQztBQUMxQ1wiLFwic291cmNlc0NvbnRlbnRcIjpbXCIubWFuYSB7XFxuICAgIGJhY2tncm91bmQtaW1hZ2U6IHVybCgnLi4vLi4vaW1nL21hbmEtc3ltYm9scy9tYW5hLnN2ZycpO1xcbiAgICBiYWNrZ3JvdW5kLXJlcGVhdDogbm8tcmVwZWF0O1xcbiAgICBiYWNrZ3JvdW5kLXNpemU6IGF1dG8gNzAwJTtcXG4gICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgICBmb250LXNpemU6IDEwMCU7XFxufVxcblxcbi5tYW5hLnhzIHtcXG4gICAgd2lkdGg6IDEuNXJlbTtcXG4gICAgaGVpZ2h0OiAxLjVyZW07XFxufVxcblxcbi5tYW5hLnNtYWxsIHtcXG4gICAgaGVpZ2h0OiAycmVtO1xcbiAgICB3aWR0aDogMnJlbTtcXG59XFxuLm1hbmEubWVkaXVtIHtcXG4gICAgaGVpZ2h0OiAyZW07XFxuICAgIHdpZHRoOiAyZW07XFxufVxcbi5tYW5hLmxhcmdlIHtcXG4gICAgaGVpZ2h0OiA0ZW07XFxuICAgIHdpZHRoOiA0ZW07XFxufVxcbi5tYW5hLnMgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwIDA7IH1cXG4ubWFuYS5zMSB7IGJhY2tncm91bmQtcG9zaXRpb246IDExLjElIDA7IH1cXG4ubWFuYS5zMiB7IGJhY2tncm91bmQtcG9zaXRpb246IDIyLjIlIDA7IH1cXG4ubWFuYS5zMyB7IGJhY2tncm91bmQtcG9zaXRpb246IDMzLjMlIDA7IH1cXG4ubWFuYS5zNCB7IGJhY2tncm91bmQtcG9zaXRpb246IDQ0LjQlIDA7IH1cXG4ubWFuYS5zNSB7IGJhY2tncm91bmQtcG9zaXRpb246IDU1LjUlIDA7IH1cXG4ubWFuYS5zNiB7IGJhY2tncm91bmQtcG9zaXRpb246IDY2LjYlIDA7IH1cXG4ubWFuYS5zNyB7IGJhY2tncm91bmQtcG9zaXRpb246IDc3LjclIDA7IH1cXG4ubWFuYS5zOCB7IGJhY2tncm91bmQtcG9zaXRpb246IDg4LjglIDA7IH1cXG4ubWFuYS5zOSB7IGJhY2tncm91bmQtcG9zaXRpb246IDk5LjklIDA7IH1cXG5cXG4ubWFuYS5zMTAgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwIDE2JTsgfVxcbi5tYW5hLnMxMSB7IGJhY2tncm91bmQtcG9zaXRpb246IDExLjElIDE2LjYlOyB9XFxuLm1hbmEuczEyIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMjIuMiUgMTYuNiU7IH1cXG4ubWFuYS5zMTMgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAzMy4zJSAxNi42JTsgfVxcbi5tYW5hLnMxNCB7IGJhY2tncm91bmQtcG9zaXRpb246IDQ0LjQlIDE2LjYlOyB9XFxuLm1hbmEuczE1IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNTUuNSUgMTYuNiU7IH1cXG4ubWFuYS5zMTYgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA2Ni42JSAxNi42JTsgfVxcbi5tYW5hLnMxNyB7IGJhY2tncm91bmQtcG9zaXRpb246IDc3LjclIDE2LjYlOyB9XFxuLm1hbmEuczE4IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogODguOCUgMTYuNiU7IH1cXG4ubWFuYS5zMTkgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA5OS45JSAxNi42JTsgfVxcblxcbi5tYW5hLnMyMCB7IGJhY2tncm91bmQtcG9zaXRpb246IDAgMzMlOyB9XFxuLm1hbmEuc3ggeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAxMS4xJSAzMy4zJTsgfVxcbi5tYW5hLnN5IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMjIuMiUgMzMuMyU7IH1cXG4ubWFuYS5zeiB7IGJhY2tncm91bmQtcG9zaXRpb246IDMzLjMlIDMzLjMlOyB9XFxuLm1hbmEuc3cgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA0NC40JSAzMy4zJTsgfVxcbi5tYW5hLnN1IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNTUuNSUgMzMuMyU7IH1cXG4ubWFuYS5zYiB7IGJhY2tncm91bmQtcG9zaXRpb246IDY2LjYlIDMzLjMlOyB9XFxuLm1hbmEuc3IgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA3Ny43JSAzMy4zJTsgfVxcbi5tYW5hLnNnIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogODguOCUgMzMuMyU7IH1cXG4ubWFuYS5zcyB7IGJhY2tncm91bmQtcG9zaXRpb246IDk5LjklIDMzLjMlOyB9XFxuXFxuLm1hbmEuc3d1IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMCA1MCU7IH1cXG4ubWFuYS5zd2IgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAxMS4xJSA1MCU7IH1cXG4ubWFuYS5zdWIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAyMi4yJSA1MCU7IH1cXG4ubWFuYS5zdXIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAzMy4zJSA1MCU7IH1cXG4ubWFuYS5zYnIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA0NC40JSA1MCU7IH1cXG4ubWFuYS5zYmcgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA1NS41JSA1MCU7IH1cXG4ubWFuYS5zcncgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA2Ni42JSA1MCU7IH1cXG4ubWFuYS5zcmcgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA3Ny43JSA1MCU7IH1cXG4ubWFuYS5zZ3cgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4OC44JSA1MCU7IH1cXG4ubWFuYS5zZ3UgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA5OS45JSA1MCU7IH1cXG5cXG4ubWFuYS5zMncgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwIDY2LjYlOyB9XFxuLm1hbmEuczJ1IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMTEuMSUgNjYuNiU7IH1cXG4ubWFuYS5zMmIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAyMi4yJSA2Ni42JTsgfVxcbi5tYW5hLnMyciB7IGJhY2tncm91bmQtcG9zaXRpb246IDMzLjMlIDY2LjYlOyB9XFxuLm1hbmEuczJnIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNDQuNCUgNjYuNiU7IH1cXG4ubWFuYS5zd3AgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA1NS41JSA2Ni42JTsgfVxcbi5tYW5hLnN1cCB7IGJhY2tncm91bmQtcG9zaXRpb246IDY2LjYlIDY2LjYlOyB9XFxuLm1hbmEuc2JwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNzcuNyUgNjYuNiU7IH1cXG4ubWFuYS5zcnAgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4OC44JSA2Ni42JTsgfVxcbi5tYW5hLnNncCB7IGJhY2tncm91bmQtcG9zaXRpb246IDk5LjklIDY2LjYlOyB9XFxuXFxuLm1hbmEuc3QgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwJSA4My4zJTsgfVxcbi5tYW5hLnNxIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMTEuMSUgODMuMyU7IH1cXG5cXG4ubWFuYS5zYyB7IGJhY2tncm91bmQtcG9zaXRpb246IDc3LjclIDgzLjMlOyB9XFxuXFxuLm1hbmEuc2UgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4OC44JSA4My4zJTsgfVxcblxcbi5tYW5hLnMxMDAwMDAwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMCAxMDAlOyB9XFxuLm1hbmEuczEwMDAwMDAuc21hbGwgeyB3aWR0aDogNC45ZW07IH1cXG4ubWFuYS5zMTAwMDAwMC5tZWRpdW0geyB3aWR0aDogOS43ZW07IH1cXG4vKi5tYW5hLnMxMDAwMDAwLmxhcmdlIHsgd2lkdGg6IDE4LjhlbTsgfSovXFxuLm1hbmEuczEwMCB7IGJhY2tncm91bmQtcG9zaXRpb246IDYwJSAxMDAlOyB9XFxuLm1hbmEuczEwMC5zbWFsbCB7IHdpZHRoOiAxLjhlbTsgfVxcbi5tYW5hLnMxMDAubWVkaXVtIHsgd2lkdGg6IDMuN2VtOyB9XFxuLyoubWFuYS5zMTAwLmxhcmdlIHsgd2lkdGg6IDEwLjhlbTsgfSovXFxuLm1hbmEuc2NoYW9zIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNzYuNSUgMTAwJTsgfVxcbi5tYW5hLnNjaGFvcy5zbWFsbCB7IHdpZHRoOiAxLjJlbTsgfVxcbi5tYW5hLnNjaGFvcy5tZWRpdW0geyB3aWR0aDogMi4zZW07IH1cXG4vKi5tYW5hLnNjLmxhcmdlIHsgd2lkdGg6IDQuNmVtOyB9Ki9cXG4ubWFuYS5zaHcgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4My41JSAxMDAlOyB9XFxuLm1hbmEuc2h3LnNtYWxsIHsgd2lkdGg6IDAuNWVtOyB9XFxuLm1hbmEuc2h3Lm1lZGl1bSB7IHdpZHRoOiAxZW07IH1cXG4vKi5tYW5hLnNody5sYXJnZSB7IHdpZHRoOiAyZW07IH0qL1xcbi5tYW5hLnNociB7IGJhY2tncm91bmQtcG9zaXRpb246IDg5JSAxMDAlOyB9XFxuLm1hbmEuc2hyLnNtYWxsIHsgd2lkdGg6IDAuNWVtOyB9XFxuLm1hbmEuc2hyLm1lZGl1bSB7IHdpZHRoOiAxZW07IH1cXG4vKi5tYW5hLnNoci5sYXJnZSB7IHdpZHRoOiAyZW07IH0qL1xcblxcblxcbi5zaGFkb3cge1xcbiAgICBmaWx0ZXI6IFxcXCJwcm9naWQ6RFhJbWFnZVRyYW5zZm9ybS5NaWNyb3NvZnQuRHJvcHNoYWRvdyhPZmZYPS0xLCBPZmZZPTEsIENvbG9yPScjMDAwJylcXFwiO1xcbiAgICBmaWx0ZXI6IHVybCgjc2hhZG93KTtcXG4gICAgLXdlYmtpdC1maWx0ZXI6IGRyb3Atc2hhZG93KC0xcHggMXB4IDBweCAjMDAwKTtcXG4gICAgZmlsdGVyOiBkcm9wLXNoYWRvdygtMXB4IDFweCAwcHggIzAwMCk7XFxufVwiXSxcInNvdXJjZVJvb3RcIjpcIlwifV0pO1xuLy8gRXhwb3J0c1xuZXhwb3J0IGRlZmF1bHQgX19fQ1NTX0xPQURFUl9FWFBPUlRfX187XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAgTUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAgQXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cbi8vIGNzcyBiYXNlIGNvZGUsIGluamVjdGVkIGJ5IHRoZSBjc3MtbG9hZGVyXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY3NzV2l0aE1hcHBpbmdUb1N0cmluZykge1xuICB2YXIgbGlzdCA9IFtdOyAvLyByZXR1cm4gdGhlIGxpc3Qgb2YgbW9kdWxlcyBhcyBjc3Mgc3RyaW5nXG5cbiAgbGlzdC50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiB0aGlzLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgdmFyIGNvbnRlbnQgPSBjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKGl0ZW0pO1xuXG4gICAgICBpZiAoaXRlbVsyXSkge1xuICAgICAgICByZXR1cm4gXCJAbWVkaWEgXCIuY29uY2F0KGl0ZW1bMl0sIFwiIHtcIikuY29uY2F0KGNvbnRlbnQsIFwifVwiKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNvbnRlbnQ7XG4gICAgfSkuam9pbignJyk7XG4gIH07IC8vIGltcG9ydCBhIGxpc3Qgb2YgbW9kdWxlcyBpbnRvIHRoZSBsaXN0XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG5cblxuICBsaXN0LmkgPSBmdW5jdGlvbiAobW9kdWxlcywgbWVkaWFRdWVyeSwgZGVkdXBlKSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGVzID09PSAnc3RyaW5nJykge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gICAgICBtb2R1bGVzID0gW1tudWxsLCBtb2R1bGVzLCAnJ11dO1xuICAgIH1cblxuICAgIHZhciBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzID0ge307XG5cbiAgICBpZiAoZGVkdXBlKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByZWZlci1kZXN0cnVjdHVyaW5nXG4gICAgICAgIHZhciBpZCA9IHRoaXNbaV1bMF07XG5cbiAgICAgICAgaWYgKGlkICE9IG51bGwpIHtcbiAgICAgICAgICBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2lkXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgbW9kdWxlcy5sZW5ndGg7IF9pKyspIHtcbiAgICAgIHZhciBpdGVtID0gW10uY29uY2F0KG1vZHVsZXNbX2ldKTtcblxuICAgICAgaWYgKGRlZHVwZSAmJiBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2l0ZW1bMF1dKSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb250aW51ZVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKG1lZGlhUXVlcnkpIHtcbiAgICAgICAgaWYgKCFpdGVtWzJdKSB7XG4gICAgICAgICAgaXRlbVsyXSA9IG1lZGlhUXVlcnk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsyXSA9IFwiXCIuY29uY2F0KG1lZGlhUXVlcnksIFwiIGFuZCBcIikuY29uY2F0KGl0ZW1bMl0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGxpc3QucHVzaChpdGVtKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIGxpc3Q7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5mdW5jdGlvbiBfc2xpY2VkVG9BcnJheShhcnIsIGkpIHsgcmV0dXJuIF9hcnJheVdpdGhIb2xlcyhhcnIpIHx8IF9pdGVyYWJsZVRvQXJyYXlMaW1pdChhcnIsIGkpIHx8IF91bnN1cHBvcnRlZEl0ZXJhYmxlVG9BcnJheShhcnIsIGkpIHx8IF9ub25JdGVyYWJsZVJlc3QoKTsgfVxuXG5mdW5jdGlvbiBfbm9uSXRlcmFibGVSZXN0KCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZS5cXG5JbiBvcmRlciB0byBiZSBpdGVyYWJsZSwgbm9uLWFycmF5IG9iamVjdHMgbXVzdCBoYXZlIGEgW1N5bWJvbC5pdGVyYXRvcl0oKSBtZXRob2QuXCIpOyB9XG5cbmZ1bmN0aW9uIF91bnN1cHBvcnRlZEl0ZXJhYmxlVG9BcnJheShvLCBtaW5MZW4pIHsgaWYgKCFvKSByZXR1cm47IGlmICh0eXBlb2YgbyA9PT0gXCJzdHJpbmdcIikgcmV0dXJuIF9hcnJheUxpa2VUb0FycmF5KG8sIG1pbkxlbik7IHZhciBuID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pLnNsaWNlKDgsIC0xKTsgaWYgKG4gPT09IFwiT2JqZWN0XCIgJiYgby5jb25zdHJ1Y3RvcikgbiA9IG8uY29uc3RydWN0b3IubmFtZTsgaWYgKG4gPT09IFwiTWFwXCIgfHwgbiA9PT0gXCJTZXRcIikgcmV0dXJuIEFycmF5LmZyb20obyk7IGlmIChuID09PSBcIkFyZ3VtZW50c1wiIHx8IC9eKD86VWl8SSludCg/Ojh8MTZ8MzIpKD86Q2xhbXBlZCk/QXJyYXkkLy50ZXN0KG4pKSByZXR1cm4gX2FycmF5TGlrZVRvQXJyYXkobywgbWluTGVuKTsgfVxuXG5mdW5jdGlvbiBfYXJyYXlMaWtlVG9BcnJheShhcnIsIGxlbikgeyBpZiAobGVuID09IG51bGwgfHwgbGVuID4gYXJyLmxlbmd0aCkgbGVuID0gYXJyLmxlbmd0aDsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBuZXcgQXJyYXkobGVuKTsgaSA8IGxlbjsgaSsrKSB7IGFycjJbaV0gPSBhcnJbaV07IH0gcmV0dXJuIGFycjI7IH1cblxuZnVuY3Rpb24gX2l0ZXJhYmxlVG9BcnJheUxpbWl0KGFyciwgaSkgeyBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJ1bmRlZmluZWRcIiB8fCAhKFN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QoYXJyKSkpIHJldHVybjsgdmFyIF9hcnIgPSBbXTsgdmFyIF9uID0gdHJ1ZTsgdmFyIF9kID0gZmFsc2U7IHZhciBfZSA9IHVuZGVmaW5lZDsgdHJ5IHsgZm9yICh2YXIgX2kgPSBhcnJbU3ltYm9sLml0ZXJhdG9yXSgpLCBfczsgIShfbiA9IChfcyA9IF9pLm5leHQoKSkuZG9uZSk7IF9uID0gdHJ1ZSkgeyBfYXJyLnB1c2goX3MudmFsdWUpOyBpZiAoaSAmJiBfYXJyLmxlbmd0aCA9PT0gaSkgYnJlYWs7IH0gfSBjYXRjaCAoZXJyKSB7IF9kID0gdHJ1ZTsgX2UgPSBlcnI7IH0gZmluYWxseSB7IHRyeSB7IGlmICghX24gJiYgX2lbXCJyZXR1cm5cIl0gIT0gbnVsbCkgX2lbXCJyZXR1cm5cIl0oKTsgfSBmaW5hbGx5IHsgaWYgKF9kKSB0aHJvdyBfZTsgfSB9IHJldHVybiBfYXJyOyB9XG5cbmZ1bmN0aW9uIF9hcnJheVdpdGhIb2xlcyhhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgcmV0dXJuIGFycjsgfVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcoaXRlbSkge1xuICB2YXIgX2l0ZW0gPSBfc2xpY2VkVG9BcnJheShpdGVtLCA0KSxcbiAgICAgIGNvbnRlbnQgPSBfaXRlbVsxXSxcbiAgICAgIGNzc01hcHBpbmcgPSBfaXRlbVszXTtcblxuICBpZiAodHlwZW9mIGJ0b2EgPT09ICdmdW5jdGlvbicpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcbiAgICB2YXIgYmFzZTY0ID0gYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoY3NzTWFwcGluZykpKSk7XG4gICAgdmFyIGRhdGEgPSBcInNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LFwiLmNvbmNhdChiYXNlNjQpO1xuICAgIHZhciBzb3VyY2VNYXBwaW5nID0gXCIvKiMgXCIuY29uY2F0KGRhdGEsIFwiICovXCIpO1xuICAgIHZhciBzb3VyY2VVUkxzID0gY3NzTWFwcGluZy5zb3VyY2VzLm1hcChmdW5jdGlvbiAoc291cmNlKSB7XG4gICAgICByZXR1cm4gXCIvKiMgc291cmNlVVJMPVwiLmNvbmNhdChjc3NNYXBwaW5nLnNvdXJjZVJvb3QgfHwgJycpLmNvbmNhdChzb3VyY2UsIFwiICovXCIpO1xuICAgIH0pO1xuICAgIHJldHVybiBbY29udGVudF0uY29uY2F0KHNvdXJjZVVSTHMpLmNvbmNhdChbc291cmNlTWFwcGluZ10pLmpvaW4oJ1xcbicpO1xuICB9XG5cbiAgcmV0dXJuIFtjb250ZW50XS5qb2luKCdcXG4nKTtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHVybCwgb3B0aW9ucykge1xuICBpZiAoIW9wdGlvbnMpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgICBvcHRpb25zID0ge307XG4gIH0gLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVyc2NvcmUtZGFuZ2xlLCBuby1wYXJhbS1yZWFzc2lnblxuXG5cbiAgdXJsID0gdXJsICYmIHVybC5fX2VzTW9kdWxlID8gdXJsLmRlZmF1bHQgOiB1cmw7XG5cbiAgaWYgKHR5cGVvZiB1cmwgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHVybDtcbiAgfSAvLyBJZiB1cmwgaXMgYWxyZWFkeSB3cmFwcGVkIGluIHF1b3RlcywgcmVtb3ZlIHRoZW1cblxuXG4gIGlmICgvXlsnXCJdLipbJ1wiXSQvLnRlc3QodXJsKSkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICAgIHVybCA9IHVybC5zbGljZSgxLCAtMSk7XG4gIH1cblxuICBpZiAob3B0aW9ucy5oYXNoKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gICAgdXJsICs9IG9wdGlvbnMuaGFzaDtcbiAgfSAvLyBTaG91bGQgdXJsIGJlIHdyYXBwZWQ/XG4gIC8vIFNlZSBodHRwczovL2RyYWZ0cy5jc3N3Zy5vcmcvY3NzLXZhbHVlcy0zLyN1cmxzXG5cblxuICBpZiAoL1tcIicoKSBcXHRcXG5dLy50ZXN0KHVybCkgfHwgb3B0aW9ucy5uZWVkUXVvdGVzKSB7XG4gICAgcmV0dXJuIFwiXFxcIlwiLmNvbmNhdCh1cmwucmVwbGFjZSgvXCIvZywgJ1xcXFxcIicpLnJlcGxhY2UoL1xcbi9nLCAnXFxcXG4nKSwgXCJcXFwiXCIpO1xuICB9XG5cbiAgcmV0dXJuIHVybDtcbn07IiwiZXhwb3J0IGRlZmF1bHQgX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcImFkNDVjN2E0OTQ1NWFkNmRkMjE1MTExNzA4YTk3MGRjLmpwZ1wiOyIsImV4cG9ydCBkZWZhdWx0IF9fd2VicGFja19wdWJsaWNfcGF0aF9fICsgXCJjODlhMDMwNWM2ZWJmZjM4NTg4NzhkZjYxMzY4NzY3YS5zdmdcIjsiLCJpbXBvcnQgYXBpIGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzXCI7XG4gICAgICAgICAgICBpbXBvcnQgY29udGVudCBmcm9tIFwiISEuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL3N0eWxlLmNzc1wiO1xuXG52YXIgb3B0aW9ucyA9IHt9O1xuXG5vcHRpb25zLmluc2VydCA9IFwiaGVhZFwiO1xub3B0aW9ucy5zaW5nbGV0b24gPSBmYWxzZTtcblxudmFyIHVwZGF0ZSA9IGFwaShjb250ZW50LCBvcHRpb25zKTtcblxuXG5cbmV4cG9ydCBkZWZhdWx0IGNvbnRlbnQubG9jYWxzIHx8IHt9OyIsImltcG9ydCBhcGkgZnJvbSBcIiEuLi8uLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanNcIjtcbiAgICAgICAgICAgIGltcG9ydCBjb250ZW50IGZyb20gXCIhIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vbWFuYS5jc3NcIjtcblxudmFyIG9wdGlvbnMgPSB7fTtcblxub3B0aW9ucy5pbnNlcnQgPSBcImhlYWRcIjtcbm9wdGlvbnMuc2luZ2xldG9uID0gZmFsc2U7XG5cbnZhciB1cGRhdGUgPSBhcGkoY29udGVudCwgb3B0aW9ucyk7XG5cblxuXG5leHBvcnQgZGVmYXVsdCBjb250ZW50LmxvY2FscyB8fCB7fTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIGlzT2xkSUUgPSBmdW5jdGlvbiBpc09sZElFKCkge1xuICB2YXIgbWVtbztcbiAgcmV0dXJuIGZ1bmN0aW9uIG1lbW9yaXplKCkge1xuICAgIGlmICh0eXBlb2YgbWVtbyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIC8vIFRlc3QgZm9yIElFIDw9IDkgYXMgcHJvcG9zZWQgYnkgQnJvd3NlcmhhY2tzXG4gICAgICAvLyBAc2VlIGh0dHA6Ly9icm93c2VyaGFja3MuY29tLyNoYWNrLWU3MWQ4NjkyZjY1MzM0MTczZmVlNzE1YzIyMmNiODA1XG4gICAgICAvLyBUZXN0cyBmb3IgZXhpc3RlbmNlIG9mIHN0YW5kYXJkIGdsb2JhbHMgaXMgdG8gYWxsb3cgc3R5bGUtbG9hZGVyXG4gICAgICAvLyB0byBvcGVyYXRlIGNvcnJlY3RseSBpbnRvIG5vbi1zdGFuZGFyZCBlbnZpcm9ubWVudHNcbiAgICAgIC8vIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3dlYnBhY2stY29udHJpYi9zdHlsZS1sb2FkZXIvaXNzdWVzLzE3N1xuICAgICAgbWVtbyA9IEJvb2xlYW4od2luZG93ICYmIGRvY3VtZW50ICYmIGRvY3VtZW50LmFsbCAmJiAhd2luZG93LmF0b2IpO1xuICAgIH1cblxuICAgIHJldHVybiBtZW1vO1xuICB9O1xufSgpO1xuXG52YXIgZ2V0VGFyZ2V0ID0gZnVuY3Rpb24gZ2V0VGFyZ2V0KCkge1xuICB2YXIgbWVtbyA9IHt9O1xuICByZXR1cm4gZnVuY3Rpb24gbWVtb3JpemUodGFyZ2V0KSB7XG4gICAgaWYgKHR5cGVvZiBtZW1vW3RhcmdldF0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB2YXIgc3R5bGVUYXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCk7IC8vIFNwZWNpYWwgY2FzZSB0byByZXR1cm4gaGVhZCBvZiBpZnJhbWUgaW5zdGVhZCBvZiBpZnJhbWUgaXRzZWxmXG5cbiAgICAgIGlmICh3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQgJiYgc3R5bGVUYXJnZXQgaW5zdGFuY2VvZiB3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAvLyBUaGlzIHdpbGwgdGhyb3cgYW4gZXhjZXB0aW9uIGlmIGFjY2VzcyB0byBpZnJhbWUgaXMgYmxvY2tlZFxuICAgICAgICAgIC8vIGR1ZSB0byBjcm9zcy1vcmlnaW4gcmVzdHJpY3Rpb25zXG4gICAgICAgICAgc3R5bGVUYXJnZXQgPSBzdHlsZVRhcmdldC5jb250ZW50RG9jdW1lbnQuaGVhZDtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIC8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0XG4gICAgICAgICAgc3R5bGVUYXJnZXQgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIG1lbW9bdGFyZ2V0XSA9IHN0eWxlVGFyZ2V0O1xuICAgIH1cblxuICAgIHJldHVybiBtZW1vW3RhcmdldF07XG4gIH07XG59KCk7XG5cbnZhciBzdHlsZXNJbkRvbSA9IFtdO1xuXG5mdW5jdGlvbiBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKSB7XG4gIHZhciByZXN1bHQgPSAtMTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0eWxlc0luRG9tLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHN0eWxlc0luRG9tW2ldLmlkZW50aWZpZXIgPT09IGlkZW50aWZpZXIpIHtcbiAgICAgIHJlc3VsdCA9IGk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucykge1xuICB2YXIgaWRDb3VudE1hcCA9IHt9O1xuICB2YXIgaWRlbnRpZmllcnMgPSBbXTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaXRlbSA9IGxpc3RbaV07XG4gICAgdmFyIGlkID0gb3B0aW9ucy5iYXNlID8gaXRlbVswXSArIG9wdGlvbnMuYmFzZSA6IGl0ZW1bMF07XG4gICAgdmFyIGNvdW50ID0gaWRDb3VudE1hcFtpZF0gfHwgMDtcbiAgICB2YXIgaWRlbnRpZmllciA9IFwiXCIuY29uY2F0KGlkLCBcIiBcIikuY29uY2F0KGNvdW50KTtcbiAgICBpZENvdW50TWFwW2lkXSA9IGNvdW50ICsgMTtcbiAgICB2YXIgaW5kZXggPSBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgICB2YXIgb2JqID0ge1xuICAgICAgY3NzOiBpdGVtWzFdLFxuICAgICAgbWVkaWE6IGl0ZW1bMl0sXG4gICAgICBzb3VyY2VNYXA6IGl0ZW1bM11cbiAgICB9O1xuXG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgc3R5bGVzSW5Eb21baW5kZXhdLnJlZmVyZW5jZXMrKztcbiAgICAgIHN0eWxlc0luRG9tW2luZGV4XS51cGRhdGVyKG9iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0eWxlc0luRG9tLnB1c2goe1xuICAgICAgICBpZGVudGlmaWVyOiBpZGVudGlmaWVyLFxuICAgICAgICB1cGRhdGVyOiBhZGRTdHlsZShvYmosIG9wdGlvbnMpLFxuICAgICAgICByZWZlcmVuY2VzOiAxXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZGVudGlmaWVycy5wdXNoKGlkZW50aWZpZXIpO1xuICB9XG5cbiAgcmV0dXJuIGlkZW50aWZpZXJzO1xufVxuXG5mdW5jdGlvbiBpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucykge1xuICB2YXIgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICB2YXIgYXR0cmlidXRlcyA9IG9wdGlvbnMuYXR0cmlidXRlcyB8fCB7fTtcblxuICBpZiAodHlwZW9mIGF0dHJpYnV0ZXMubm9uY2UgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgdmFyIG5vbmNlID0gdHlwZW9mIF9fd2VicGFja19ub25jZV9fICE9PSAndW5kZWZpbmVkJyA/IF9fd2VicGFja19ub25jZV9fIDogbnVsbDtcblxuICAgIGlmIChub25jZSkge1xuICAgICAgYXR0cmlidXRlcy5ub25jZSA9IG5vbmNlO1xuICAgIH1cbiAgfVxuXG4gIE9iamVjdC5rZXlzKGF0dHJpYnV0ZXMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIHN0eWxlLnNldEF0dHJpYnV0ZShrZXksIGF0dHJpYnV0ZXNba2V5XSk7XG4gIH0pO1xuXG4gIGlmICh0eXBlb2Ygb3B0aW9ucy5pbnNlcnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICBvcHRpb25zLmluc2VydChzdHlsZSk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIHRhcmdldCA9IGdldFRhcmdldChvcHRpb25zLmluc2VydCB8fCAnaGVhZCcpO1xuXG4gICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkbid0IGZpbmQgYSBzdHlsZSB0YXJnZXQuIFRoaXMgcHJvYmFibHkgbWVhbnMgdGhhdCB0aGUgdmFsdWUgZm9yIHRoZSAnaW5zZXJ0JyBwYXJhbWV0ZXIgaXMgaW52YWxpZC5cIik7XG4gICAgfVxuXG4gICAgdGFyZ2V0LmFwcGVuZENoaWxkKHN0eWxlKTtcbiAgfVxuXG4gIHJldHVybiBzdHlsZTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlKSB7XG4gIC8vIGlzdGFuYnVsIGlnbm9yZSBpZlxuICBpZiAoc3R5bGUucGFyZW50Tm9kZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHN0eWxlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc3R5bGUpO1xufVxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5cblxudmFyIHJlcGxhY2VUZXh0ID0gZnVuY3Rpb24gcmVwbGFjZVRleHQoKSB7XG4gIHZhciB0ZXh0U3RvcmUgPSBbXTtcbiAgcmV0dXJuIGZ1bmN0aW9uIHJlcGxhY2UoaW5kZXgsIHJlcGxhY2VtZW50KSB7XG4gICAgdGV4dFN0b3JlW2luZGV4XSA9IHJlcGxhY2VtZW50O1xuICAgIHJldHVybiB0ZXh0U3RvcmUuZmlsdGVyKEJvb2xlYW4pLmpvaW4oJ1xcbicpO1xuICB9O1xufSgpO1xuXG5mdW5jdGlvbiBhcHBseVRvU2luZ2xldG9uVGFnKHN0eWxlLCBpbmRleCwgcmVtb3ZlLCBvYmopIHtcbiAgdmFyIGNzcyA9IHJlbW92ZSA/ICcnIDogb2JqLm1lZGlhID8gXCJAbWVkaWEgXCIuY29uY2F0KG9iai5tZWRpYSwgXCIge1wiKS5jb25jYXQob2JqLmNzcywgXCJ9XCIpIDogb2JqLmNzczsgLy8gRm9yIG9sZCBJRVxuXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAgKi9cblxuICBpZiAoc3R5bGUuc3R5bGVTaGVldCkge1xuICAgIHN0eWxlLnN0eWxlU2hlZXQuY3NzVGV4dCA9IHJlcGxhY2VUZXh0KGluZGV4LCBjc3MpO1xuICB9IGVsc2Uge1xuICAgIHZhciBjc3NOb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKTtcbiAgICB2YXIgY2hpbGROb2RlcyA9IHN0eWxlLmNoaWxkTm9kZXM7XG5cbiAgICBpZiAoY2hpbGROb2Rlc1tpbmRleF0pIHtcbiAgICAgIHN0eWxlLnJlbW92ZUNoaWxkKGNoaWxkTm9kZXNbaW5kZXhdKTtcbiAgICB9XG5cbiAgICBpZiAoY2hpbGROb2Rlcy5sZW5ndGgpIHtcbiAgICAgIHN0eWxlLmluc2VydEJlZm9yZShjc3NOb2RlLCBjaGlsZE5vZGVzW2luZGV4XSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0eWxlLmFwcGVuZENoaWxkKGNzc05vZGUpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBhcHBseVRvVGFnKHN0eWxlLCBvcHRpb25zLCBvYmopIHtcbiAgdmFyIGNzcyA9IG9iai5jc3M7XG4gIHZhciBtZWRpYSA9IG9iai5tZWRpYTtcbiAgdmFyIHNvdXJjZU1hcCA9IG9iai5zb3VyY2VNYXA7XG5cbiAgaWYgKG1lZGlhKSB7XG4gICAgc3R5bGUuc2V0QXR0cmlidXRlKCdtZWRpYScsIG1lZGlhKTtcbiAgfSBlbHNlIHtcbiAgICBzdHlsZS5yZW1vdmVBdHRyaWJ1dGUoJ21lZGlhJyk7XG4gIH1cblxuICBpZiAoc291cmNlTWFwICYmIHR5cGVvZiBidG9hICE9PSAndW5kZWZpbmVkJykge1xuICAgIGNzcyArPSBcIlxcbi8qIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsXCIuY29uY2F0KGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHNvdXJjZU1hcCkpKSksIFwiICovXCIpO1xuICB9IC8vIEZvciBvbGQgSUVcblxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgICovXG5cblxuICBpZiAoc3R5bGUuc3R5bGVTaGVldCkge1xuICAgIHN0eWxlLnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcbiAgfSBlbHNlIHtcbiAgICB3aGlsZSAoc3R5bGUuZmlyc3RDaGlsZCkge1xuICAgICAgc3R5bGUucmVtb3ZlQ2hpbGQoc3R5bGUuZmlyc3RDaGlsZCk7XG4gICAgfVxuXG4gICAgc3R5bGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKSk7XG4gIH1cbn1cblxudmFyIHNpbmdsZXRvbiA9IG51bGw7XG52YXIgc2luZ2xldG9uQ291bnRlciA9IDA7XG5cbmZ1bmN0aW9uIGFkZFN0eWxlKG9iaiwgb3B0aW9ucykge1xuICB2YXIgc3R5bGU7XG4gIHZhciB1cGRhdGU7XG4gIHZhciByZW1vdmU7XG5cbiAgaWYgKG9wdGlvbnMuc2luZ2xldG9uKSB7XG4gICAgdmFyIHN0eWxlSW5kZXggPSBzaW5nbGV0b25Db3VudGVyKys7XG4gICAgc3R5bGUgPSBzaW5nbGV0b24gfHwgKHNpbmdsZXRvbiA9IGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKSk7XG4gICAgdXBkYXRlID0gYXBwbHlUb1NpbmdsZXRvblRhZy5iaW5kKG51bGwsIHN0eWxlLCBzdHlsZUluZGV4LCBmYWxzZSk7XG4gICAgcmVtb3ZlID0gYXBwbHlUb1NpbmdsZXRvblRhZy5iaW5kKG51bGwsIHN0eWxlLCBzdHlsZUluZGV4LCB0cnVlKTtcbiAgfSBlbHNlIHtcbiAgICBzdHlsZSA9IGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKTtcbiAgICB1cGRhdGUgPSBhcHBseVRvVGFnLmJpbmQobnVsbCwgc3R5bGUsIG9wdGlvbnMpO1xuXG4gICAgcmVtb3ZlID0gZnVuY3Rpb24gcmVtb3ZlKCkge1xuICAgICAgcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlKTtcbiAgICB9O1xuICB9XG5cbiAgdXBkYXRlKG9iaik7XG4gIHJldHVybiBmdW5jdGlvbiB1cGRhdGVTdHlsZShuZXdPYmopIHtcbiAgICBpZiAobmV3T2JqKSB7XG4gICAgICBpZiAobmV3T2JqLmNzcyA9PT0gb2JqLmNzcyAmJiBuZXdPYmoubWVkaWEgPT09IG9iai5tZWRpYSAmJiBuZXdPYmouc291cmNlTWFwID09PSBvYmouc291cmNlTWFwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdXBkYXRlKG9iaiA9IG5ld09iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlbW92ZSgpO1xuICAgIH1cbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobGlzdCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTsgLy8gRm9yY2Ugc2luZ2xlLXRhZyBzb2x1dGlvbiBvbiBJRTYtOSwgd2hpY2ggaGFzIGEgaGFyZCBsaW1pdCBvbiB0aGUgIyBvZiA8c3R5bGU+XG4gIC8vIHRhZ3MgaXQgd2lsbCBhbGxvdyBvbiBhIHBhZ2VcblxuICBpZiAoIW9wdGlvbnMuc2luZ2xldG9uICYmIHR5cGVvZiBvcHRpb25zLnNpbmdsZXRvbiAhPT0gJ2Jvb2xlYW4nKSB7XG4gICAgb3B0aW9ucy5zaW5nbGV0b24gPSBpc09sZElFKCk7XG4gIH1cblxuICBsaXN0ID0gbGlzdCB8fCBbXTtcbiAgdmFyIGxhc3RJZGVudGlmaWVycyA9IG1vZHVsZXNUb0RvbShsaXN0LCBvcHRpb25zKTtcbiAgcmV0dXJuIGZ1bmN0aW9uIHVwZGF0ZShuZXdMaXN0KSB7XG4gICAgbmV3TGlzdCA9IG5ld0xpc3QgfHwgW107XG5cbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG5ld0xpc3QpICE9PSAnW29iamVjdCBBcnJheV0nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBpZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW2ldO1xuICAgICAgdmFyIGluZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gICAgICBzdHlsZXNJbkRvbVtpbmRleF0ucmVmZXJlbmNlcy0tO1xuICAgIH1cblxuICAgIHZhciBuZXdMYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obmV3TGlzdCwgb3B0aW9ucyk7XG5cbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgbGFzdElkZW50aWZpZXJzLmxlbmd0aDsgX2krKykge1xuICAgICAgdmFyIF9pZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW19pXTtcblxuICAgICAgdmFyIF9pbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKF9pZGVudGlmaWVyKTtcblxuICAgICAgaWYgKHN0eWxlc0luRG9tW19pbmRleF0ucmVmZXJlbmNlcyA9PT0gMCkge1xuICAgICAgICBzdHlsZXNJbkRvbVtfaW5kZXhdLnVwZGF0ZXIoKTtcblxuICAgICAgICBzdHlsZXNJbkRvbS5zcGxpY2UoX2luZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsYXN0SWRlbnRpZmllcnMgPSBuZXdMYXN0SWRlbnRpZmllcnM7XG4gIH07XG59OyIsImltcG9ydCBcIi4uL2Nzcy9zdHlsZS5jc3NcIjtcbmltcG9ydCBcIi4uL2Nzcy92ZW5kb3IvbWFuYS5jc3NcIjtcbmltcG9ydCBTZWFyY2ggZnJvbSBcIi4vbW9kZWxzL1NlYXJjaFwiO1xuaW1wb3J0ICogYXMgc2VhcmNoVmlldyBmcm9tIFwiLi92aWV3cy9zZWFyY2hWaWV3XCI7XG5pbXBvcnQgKiBhcyByZXN1bHRzVmlldyBmcm9tIFwiLi92aWV3cy9yZXN1bHRzVmlld1wiO1xuaW1wb3J0ICogYXMgY2FyZFZpZXcgZnJvbSBcIi4vdmlld3MvY2FyZFZpZXdcIjtcbmltcG9ydCAqIGFzIGludmVudG9yeVZpZXcgZnJvbSBcIi4vdmlld3MvaW52ZW50b3J5Vmlld1wiO1xuaW1wb3J0ICogYXMgaW52U2VhcmNoIGZyb20gXCIuL3ZpZXdzL2ludmVudG9yeVNlYXJjaFZpZXdcIjtcbmltcG9ydCB7IGVsZW1lbnRzIH0gZnJvbSBcIi4vdmlld3MvYmFzZVwiO1xuXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKiBRdWljayBTZWFyY2ggKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG5lbGVtZW50cy5uYXYucXVpY2tTZWFyY2hCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgY29uc3Qgc2VhcmNoID0gbmV3IFNlYXJjaCgpO1xuXG4gIGlmIChlbGVtZW50cy5uYXYuc2VhcmNoSW5wdXQudmFsdWUgIT09IFwiXCIpIHtcbiAgICBjb25zdCBxdWVyeSA9IHNlYXJjaC5xdWlja1NlYXJjaCgpO1xuICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gYC9yZXN1bHRzL2xpc3QvJHtxdWVyeX0mb3JkZXI9bmFtZWA7XG4gIH1cbn0pO1xuXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKiBTZWFyY2ggUGFnZSAqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG5pZiAod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lID09PSBcIi9zZWFyY2hcIikge1xuICBjb25zdCBzZWFyY2ggPSBuZXcgU2VhcmNoKCk7XG5cbiAgLy8gRXZlbnQgbGlzdGVuZXIgZm9yIHRoZSBzdWJtaXQgc2VhcmNoIGJ1dHRvbi4gVGhpcyBnb2VzIHRocm91Z2ggdGhlIGZvcm0gYW5kIGdlbmVyYXRlc1xuICAvLyB0aGUgcXVqZXJ5IHN0cmluZy4gSXQgdGhlbiBwYXNzZXMgdGhlIHN0cmluZyB0byB0aGUgc2VydmVyIHRocm91Z2ggdGhlIFVSTFxuICBlbGVtZW50cy5hcGlTZWFyY2guc3VibWl0QnRuLm9uY2xpY2sgPSBhc3luYyAoZSkgPT4ge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIC8vIENsZWFyIGFueSBleGlzdGluZyBxdWVyeSBzdHJpbmdcbiAgICBzZWFyY2gucmVzZXRTZWFyY2hRdWVyeSgpO1xuXG4gICAgLy8gQnVpbGQgdGhlIHF1ZXJ5IHN0cmluZ1xuICAgIGNvbnN0IHF1ZXJ5ID0gc2VhcmNoLmJ1aWxkU2VhcmNoUXVlcnkoKTtcblxuICAgIC8vIEdldCB0aGUgZGlzcGxheSBtZXRob2RcbiAgICBjb25zdCBkaXNwbGF5TWV0aG9kID0gc2VhcmNoLmRpc3BsYXlNZXRob2QoKTtcblxuICAgIC8vIENyZWF0ZSBhIGdldCByZXF1ZXN0IHdpdGggdGhlIHF1ZXJ5IHN0cmluZ1xuICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gYC9yZXN1bHRzLyR7ZGlzcGxheU1ldGhvZH0vJHtxdWVyeX1gO1xuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG4gIGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlTGluZS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgIC8vIERpc3BsYXkgdGhlIGRyb3Bkb3duXG4gICAgc2VhcmNoVmlldy5zaG93VHlwZXNEcm9wRG93bigpO1xuICAgIHNlYXJjaFZpZXcuc3RhcnRUeXBlc0Ryb3BEb3duTmF2aWdhdGlvbigpO1xuXG4gICAgLy8gU3RhcnQgYW4gZXZlbnQgbGlzdGVuZXIgb24gdGhlIGRvY3VtZW50LiBUaGlzIHdpbGwgY2xvc2UgdGhlIGRyb3Bkb3duIGlmIHRoZSB1c2VyIGNsaWNrc1xuICAgIC8vIG91dHNpZGUgb2YgdGhlIGlucHV0IG9yIGRyb3Bkb3duLiBUaGlzIHdpbGwgYWxzbyBjYW5jZWwgdGhlIGV2ZW50IGxpc3RlbmVyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHNlYXJjaFZpZXcudHlwZUxpbmVMaXN0ZW5lcik7XG4gIH0pO1xuXG4gIGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlTGluZS5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKCkgPT4ge1xuICAgIGlmIChlbGVtZW50cy5hcGlTZWFyY2gudHlwZURyb3BEb3duLmhhc0F0dHJpYnV0ZShcImhpZGRlblwiKSkge1xuICAgICAgc2VhcmNoVmlldy5zaG93VHlwZXNEcm9wRG93bigpO1xuICAgIH1cblxuICAgIHNlYXJjaFZpZXcuZmlsdGVyVHlwZXMoZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVMaW5lLnZhbHVlKTtcbiAgICBzZWFyY2hWaWV3LmZpbHRlclR5cGVIZWFkZXJzKCk7XG4gICAgc2VhcmNoVmlldy5zdGFydFR5cGVzRHJvcERvd25OYXZpZ2F0aW9uKCk7XG4gIH0pO1xuXG4gIGVsZW1lbnRzLmFwaVNlYXJjaC5zZXRJbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgIC8vIERpc3BsYXkgdGhlIGRyb3Bkb3duXG4gICAgc2VhcmNoVmlldy5zaG93U2V0c0Ryb3BEb3duKCk7XG4gICAgc2VhcmNoVmlldy5zdGFydFNldHNEcm9wRG93bk5hdmlnYXRpb24oKTtcblxuICAgIC8vIFN0YXJ0IGFuIGV2ZW50IGxpc3RlbmVyIG9uIHRoZSBkb2N1bWVudC4gVGhpcyB3aWxsIGNsb3NlIHRoZSBkcm9wZG93biBpZiB0aGUgdXNlciBjbGlja3NcbiAgICAvLyBvdXRzaWRlIG9mIHRoZSBpbnB1dCBvciBkcm9wZG93bi4gVGhpcyB3aWxsIGFsc28gY2FuY2VsIHRoZSBldmVudCBsaXN0ZW5lclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBzZWFyY2hWaWV3LnNldElucHV0TGlzdGVuZXIpO1xuICB9KTtcblxuICBlbGVtZW50cy5hcGlTZWFyY2guc2V0SW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsICgpID0+IHtcbiAgICBpZiAoZWxlbWVudHMuYXBpU2VhcmNoLnNldERyb3BEb3duLmhhc0F0dHJpYnV0ZShcImhpZGRlblwiKSkge1xuICAgICAgc2VhcmNoVmlldy5zaG93U2V0c0Ryb3BEb3duKCk7XG4gICAgfVxuXG4gICAgc2VhcmNoVmlldy5maWx0ZXJTZXRzKGVsZW1lbnRzLmFwaVNlYXJjaC5zZXRJbnB1dC52YWx1ZSk7XG4gICAgc2VhcmNoVmlldy5maWx0ZXJTZXRIZWFkZXJzKCk7XG4gICAgc2VhcmNoVmlldy5zdGFydFNldHNEcm9wRG93bk5hdmlnYXRpb24oKTtcbiAgfSk7XG5cbiAgZWxlbWVudHMuYXBpU2VhcmNoLnN0YXRWYWx1ZS5hZGRFdmVudExpc3RlbmVyKFxuICAgIFwiaW5wdXRcIixcbiAgICBzZWFyY2hWaWV3LnN0YXRMaW5lQ29udHJvbGxlclxuICApO1xuXG4gIGVsZW1lbnRzLmFwaVNlYXJjaC5mb3JtYXQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICBcImNoYW5nZVwiLFxuICAgIHNlYXJjaFZpZXcuZm9ybWF0TGluZUNvbnRyb2xsZXJcbiAgKTtcbn1cblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKiogUmVzdWx0cyBQYWdlICoqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuaWYgKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zdWJzdHJpbmcoMSwgOCkgPT09IFwicmVzdWx0c1wiKSB7XG4gIGNvbnN0IHN0YXRlID0ge1xuICAgIHNlYXJjaDogbmV3IFNlYXJjaCgpLFxuXG4gICAgLy8gR2V0IHRoZSBkaXNwbGF5IG1ldGhvZCwgc29ydCBtZXRob2QsIGFuZCBxdWVyeSBmcm9tIHRoZSBVUkxcbiAgICBkaXNwbGF5OiB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3Vic3RyaW5nKFxuICAgICAgOSxcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5sYXN0SW5kZXhPZihcIi9cIilcbiAgICApLFxuICAgIHF1ZXJ5OiB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3Vic3RyaW5nKFxuICAgICAgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLmxhc3RJbmRleE9mKFwiL1wiKSArIDFcbiAgICApLFxuICAgIHNvcnRNZXRob2Q6IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zdWJzdHJpbmcoXG4gICAgICB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUubGFzdEluZGV4T2YoXCI9XCIpICsgMVxuICAgICksXG5cbiAgICBhbGxDYXJkczogW10sXG4gICAgY3VycmVudEluZGV4OiAwLFxuICAgIGFsbFJlc3VsdHNMb2FkZWQ6IGZhbHNlLFxuICB9O1xuXG4gIC8vIFdoZW4gdGhlIHJlc3VsdHMgcGFnZSBpcyByZWZyZXNoZWQsIGRpc3BsYXkgdGhlIGNhcmRzIGFzIGEgY2hlY2tsaXN0IGJ5IGRlZmF1bHRcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgYXN5bmMgKCkgPT4ge1xuICAgIC8vIFVwZGF0ZSB0aGUgc29ydCBieSBhbmQgZGlzcGxheSBhc2QgbWVudXMgc28gdGhlIHNlbGVjdGVkIG9wdGlvbiBpcyB3aGF0IHRoZSB1c2VyIHNlbGVjdGVkXG4gICAgcmVzdWx0c1ZpZXcuY2hvc2VTZWxlY3RNZW51U29ydChlbGVtZW50cy5yZXN1bHRzUGFnZS5zb3J0Qnkub3B0aW9ucywgc3RhdGUpO1xuICAgIHJlc3VsdHNWaWV3LmNob3NlU2VsZWN0TWVudURpc3BsYXkoXG4gICAgICBlbGVtZW50cy5yZXN1bHRzUGFnZS5kaXNwbGF5U2VsZWN0b3IsXG4gICAgICBzdGF0ZVxuICAgICk7XG5cbiAgICAvLyBSdW4gdGhlIGdldCBjYXJkcyBmdW5jdGlvbiwgdGhlbiB1cGRhdGUgdGhlIGRpc3BsYXkgYmFyIHdpdGggdGhlIHRvdGFsIGNhcmQgY291bnRcbiAgICBhd2FpdCBzdGF0ZS5zZWFyY2guZ2V0Q2FyZHMoc3RhdGUpO1xuXG4gICAgaWYgKHN0YXRlLmFsbENhcmRzWzBdID09PSA0MDQpIHtcbiAgICAgIHJlc3VsdHNWaWV3LmRpc3BsYXk0MDQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZXN1bHRzVmlldy51cGRhdGVEaXNwbGF5QmFyKHN0YXRlKTtcblxuICAgIC8vIEluIHRoZSBiYWNrZ3JvdW5kLCBnZXQgYWxsIGNhcmRzXG4gICAgc3RhdGUuc2VhcmNoLmdldEFsbENhcmRzKHN0YXRlLCByZXN1bHRzVmlldy5lbmFibGVCdG4pO1xuXG4gICAgLy8gT24gbG9hZGluZyB0aGUgcGFnZSBkaXNwbGF5IHRoZSBjYXJkcyBpbiBhIGNoZWNrbGlzdFxuICAgIHJlc3VsdHNWaWV3LnVwZGF0ZURpc3BsYXkoc3RhdGUpO1xuICB9KTtcblxuICAvLyBFdmVudCBsaXN0ZW5lciBmb3IgdGhlIGNoYW5nZSBkaXNwbGF5IG1ldGhvZCBidXR0b25cbiAgZWxlbWVudHMucmVzdWx0c1BhZ2UuYnRuLm9uY2xpY2sgPSBhc3luYyAoKSA9PiB7XG4gICAgLy8gVXBkYXRlIHRoZSBkaXNwbGF5IG1ldGhvZCBiZXR3ZWVuIGNoZWNrbGlzdCBhbmQgY2FyZHMgaWYgdGhlIHVzZXIgY2hhbmdlZCBpdFxuICAgIHJlc3VsdHNWaWV3LmNoYW5nZURpc3BsYXlBbmRVcmwoc3RhdGUpO1xuXG4gICAgLy8gSWYgYSBuZXcgc29ydGluZyBtZXRob2QgaXMgc2VsZWN0ZWQsIGEgcmVxdWVzdCBpcyBzZW50IHRvIHRoZSBzZXJ2ZXIgYW5kIHRoZSBwYWdlIGlzIHJlZnJlc2hlZC5cbiAgICAvLyBUaGlzIHJlc2V0cyB0aGUgc3RhdGUgYW5kIGFzeW5jIHRhc2tzXG4gICAgcmVzdWx0c1ZpZXcuY2hhbmdlU29ydE1ldGhvZChzdGF0ZSk7XG5cbiAgICAvLyBVcGRhdGUgdGhlIGRpc3BsYXkgd2l0aCBhIG5ldyBzb3J0IG1ldGhvZCBhbmQgZGlzcGxheSBtZXRob2QgaWYgZWl0aGVyIHdlcmUgZ2l2ZW5cbiAgICByZXN1bHRzVmlldy51cGRhdGVEaXNwbGF5KHN0YXRlKTtcbiAgfTtcblxuICAvLyBFdmVudCBMaXN0ZW5lciBmb3IgbmV4dCBwYWdlIGJ1dHRvblxuICBlbGVtZW50cy5yZXN1bHRzUGFnZS5uZXh0UGFnZUJ0bi5vbmNsaWNrID0gKCkgPT4ge1xuICAgIC8vIFVwZGF0ZSB0aGUgaW5kZXhcbiAgICBzdGF0ZS5jdXJyZW50SW5kZXgrKztcblxuICAgIC8vIFVwZGF0ZSB0aGUgZGlzcGxheSBiYXNlZCBvbiB0aGUgbWV0aG9kIHN0b3JlZCBpbiB0aGUgc3RhdGVcbiAgICByZXN1bHRzVmlldy51cGRhdGVEaXNwbGF5KHN0YXRlKTtcblxuICAgIC8vIFVwZGF0ZSB0aGUgZGlzcGxheSBiYXJcbiAgICByZXN1bHRzVmlldy51cGRhdGVEaXNwbGF5QmFyKHN0YXRlKTtcblxuICAgIC8vIEVuYWJsZSB0aGUgcHJldmlvdXMgcGFnZSBhbmQgZmlyc3QgcGFnZSBidG5zXG4gICAgcmVzdWx0c1ZpZXcuZW5hYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLnByZXZpb3VzUGFnZUJ0bik7XG4gICAgcmVzdWx0c1ZpZXcuZW5hYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLmZpcnN0UGFnZUJ0bik7XG5cbiAgICAvLyBJZiBvbiB0aGUgbGFzdCBwYWdlLCBkaXNhYmxlIHRoZSBuZXh0IHBhZ2UgYnRuIGFuZCBsYXN0IHBhZ2UgYnRuXG4gICAgaWYgKHN0YXRlLmN1cnJlbnRJbmRleCA9PT0gc3RhdGUuYWxsQ2FyZHMubGVuZ3RoIC0gMSkge1xuICAgICAgcmVzdWx0c1ZpZXcuZGlzYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5uZXh0UGFnZUJ0bik7XG4gICAgICByZXN1bHRzVmlldy5kaXNhYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLmxhc3RQYWdlQnRuKTtcbiAgICB9XG4gIH07XG5cbiAgLy8gRXZlbnQgbGlzdGVuZXIgZm9yIHRoZSBsYXN0IHBhZ2UgYnRuXG4gIGVsZW1lbnRzLnJlc3VsdHNQYWdlLmxhc3RQYWdlQnRuLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgLy8gVXBkYXRlIHRoZSBpbmRleFxuICAgIHN0YXRlLmN1cnJlbnRJbmRleCA9IHN0YXRlLmFsbENhcmRzLmxlbmd0aCAtIDE7XG5cbiAgICAvLyBVcGRhdGUgdGhlIGRpc3BsYXkgYmFzZWQgb24gdGhlIG1ldGhvZCBzdG9yZWQgaW4gdGhlIHN0YXRlXG4gICAgcmVzdWx0c1ZpZXcudXBkYXRlRGlzcGxheShzdGF0ZSk7XG5cbiAgICAvLyBVcGRhdGUgdGhlIGRpc3BsYXkgYmFyXG4gICAgcmVzdWx0c1ZpZXcudXBkYXRlRGlzcGxheUJhcihzdGF0ZSk7XG5cbiAgICAvLyBEaXNhYmxlIHRoZSBuZXh0IGFuZCBsYXN0IHBhZ2UgYnV0dG9uc1xuICAgIHJlc3VsdHNWaWV3LmRpc2FibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UubmV4dFBhZ2VCdG4pO1xuICAgIHJlc3VsdHNWaWV3LmRpc2FibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UubGFzdFBhZ2VCdG4pO1xuXG4gICAgLy8gRW5hYmxlIHRoZSBwcmV2aW91cyBhbmQgZmlyc3QgcGFnZSBidXR0b25zXG4gICAgcmVzdWx0c1ZpZXcuZW5hYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLnByZXZpb3VzUGFnZUJ0bik7XG4gICAgcmVzdWx0c1ZpZXcuZW5hYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLmZpcnN0UGFnZUJ0bik7XG4gIH07XG5cbiAgLy8gRXZlbnQgbGlzdGVuZXIgZm9yIHRoZSBwcmV2aW91cyBwYWdlIGJ1dHRvblxuICBlbGVtZW50cy5yZXN1bHRzUGFnZS5wcmV2aW91c1BhZ2VCdG4ub25jbGljayA9ICgpID0+IHtcbiAgICAvLyBVcGRhdGUgdGhlIGluZGV4XG4gICAgc3RhdGUuY3VycmVudEluZGV4LS07XG5cbiAgICAvLyBVcGRhdGUgdGhlIGRpc3BsYXkgYmFzZWQgb24gdGhlIG1ldGhvZCBzdG9yZWQgaW4gdGhlIHN0YXRlXG4gICAgcmVzdWx0c1ZpZXcudXBkYXRlRGlzcGxheShzdGF0ZSk7XG5cbiAgICAvLyBVcGRhdGUgdGhlIGRpc3BsYXkgYmFyXG4gICAgcmVzdWx0c1ZpZXcudXBkYXRlRGlzcGxheUJhcihzdGF0ZSk7XG5cbiAgICAvLyBJZiBvbiB0aGUgZmlyc3QgcGFnZSwgZGlzYWJsZSB0aGUgcHJldmlvdXMgYW5kIGZpcnN0IHBhZ2UgYnV0dG9uc1xuICAgIGlmIChzdGF0ZS5jdXJyZW50SW5kZXggPT09IDApIHtcbiAgICAgIHJlc3VsdHNWaWV3LmRpc2FibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UucHJldmlvdXNQYWdlQnRuKTtcbiAgICAgIHJlc3VsdHNWaWV3LmRpc2FibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UuZmlyc3RQYWdlQnRuKTtcbiAgICB9XG5cbiAgICAvLyBFbmFibGUgdGhlIG5leHQgYW5kIGxhc3QgcGFnZSBidXR0b25zLiBUaGUgbGFzdCBwYWdlIGJ1dHRvbiBzaG91bGQgb25seSBiZVxuICAgIC8vIGVuYWJsZWQgaWYgYWxsIHJlc3VsdHMgaGF2ZSBiZWVuIGxvYWRlZFxuICAgIHJlc3VsdHNWaWV3LmVuYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5uZXh0UGFnZUJ0bik7XG4gICAgaWYgKHN0YXRlLmFsbFJlc3VsdHNMb2FkZWQpXG4gICAgICByZXN1bHRzVmlldy5lbmFibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UubGFzdFBhZ2VCdG4pO1xuICB9O1xuXG4gIC8vIEV2ZW50IGxpc3RlbmVyIGZvciB0aGUgZmlyc3QgcGFnZSBidG5cbiAgZWxlbWVudHMucmVzdWx0c1BhZ2UuZmlyc3RQYWdlQnRuLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgLy8gVXBkYXRlIHRoZSBpbmRleFxuICAgIHN0YXRlLmN1cnJlbnRJbmRleCA9IDA7XG5cbiAgICAvLyBVcGRhdGUgdGhlIGRpc3BsYXkgYmFzZWQgb24gdGhlIG1ldGhvZCBzdG9yZWQgaW4gdGhlIHN0YXRlXG4gICAgcmVzdWx0c1ZpZXcudXBkYXRlRGlzcGxheShzdGF0ZSk7XG5cbiAgICAvLyBVcGRhdGUgdGhlIGRpc3BsYXkgYmFyXG4gICAgcmVzdWx0c1ZpZXcudXBkYXRlRGlzcGxheUJhcihzdGF0ZSk7XG5cbiAgICAvLyBEaXNhYmxlIHRoZSBwcmV2aW91cyBhbmQgZmlyc3QgcGFnZSBidXR0b25zXG4gICAgcmVzdWx0c1ZpZXcuZGlzYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5wcmV2aW91c1BhZ2VCdG4pO1xuICAgIHJlc3VsdHNWaWV3LmRpc2FibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UuZmlyc3RQYWdlQnRuKTtcblxuICAgIC8vIEVuYWJsZSB0aGUgbmV4dCBhbmQgbGFzdCBwYWdlIGJ1dHRvbnMuIFRoZSBsYXN0IHBhZ2UgYnV0dG9uIHNob3VsZCBvbmx5IGJlXG4gICAgLy8gZW5hYmxlZCBpZiBhbGwgcmVzdWx0cyBoYXZlIGJlZW4gbG9hZGVkXG4gICAgcmVzdWx0c1ZpZXcuZW5hYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLm5leHRQYWdlQnRuKTtcbiAgICBpZiAoc3RhdGUuYWxsUmVzdWx0c0xvYWRlZClcbiAgICAgIHJlc3VsdHNWaWV3LmVuYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5sYXN0UGFnZUJ0bik7XG4gIH07XG5cbiAgd2luZG93Lm9ucG9wc3RhdGUgPSAoZSkgPT4ge1xuICAgIC8vIGNvbnN0IGRhdGEgPSBlLnN0YXRlO1xuICAgIC8vIGlmIChkYXRhICE9PSBudWxsKSByZXN1bHRzVmlldy51cGRhdGVEaXNwbGF5T25Qb3BTdGF0ZShzdGF0ZSwgZGF0YSk7XG5cbiAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGAvc2VhcmNoYDtcbiAgfTtcbn1cblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKiBDYXJkIFBhZ2UgKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuaWYgKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zdWJzdHJpbmcoMSwgNSkgPT09IFwiY2FyZFwiKSB7XG4gIGNhcmRWaWV3Lmluc2VydE1hbmFDb3N0VG9DYXJkVGV4dFRpdGxlKCk7XG4gIGNhcmRWaWV3Lmluc2VydE1hbmFDb3N0VG9PcmFjbGVUZXh0KCk7XG4gIGNhcmRWaWV3LnJlbW92ZVVuZGVyU2NvcmVGcm9tTGVnYWxTdGF0dXMoKTtcbiAgY2FyZFZpZXcuZml4Q2FyZFByaWNlcygpO1xuICBjYXJkVmlldy5zZXRQcmludExpbmtIcmVmKCk7XG4gIGNhcmRWaWV3LnByaW50TGlzdEhvdmVyRXZlbnRzKCk7XG5cbiAgLy8gSWYgdGhlIHRyYW5zZm9ybSBidG4gaXMgb24gdGhlIGRvbSAoaWYgdGhlIGNhcmQgaXMgZG91YmxlIHNpZGVkKSBzZXRcbiAgLy8gdGhlIGV2ZW50IGxpc3RlbmVyIGZvciB0aGUgY2FyZCB0byBiZSBmbGlwcGVkIGJhY2sgYW5kIGZvcnRoXG4gIGlmIChlbGVtZW50cy5jYXJkLnRyYW5zZm9ybUJ0bikge1xuICAgIGVsZW1lbnRzLmNhcmQudHJhbnNmb3JtQnRuLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICBcImNsaWNrXCIsXG4gICAgICBjYXJkVmlldy5mbGlwVG9CYWNrU2lkZVxuICAgICk7XG4gIH1cblxuICBkb2N1bWVudFxuICAgIC5xdWVyeVNlbGVjdG9yKFwiLmpzLS1hZGQtdG8taW52LXN1Ym1pdFwiKVxuICAgIC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgY2FyZFZpZXcuY2hlY2tQcmljZUlucHV0Rm9yRGlnaXRzKTtcbn1cblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqIEludmVudG9yeSBQYWdlICoqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuaWYgKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zdWJzdHJpbmcoMSwgMTApID09PSBcImludmVudG9yeVwiKSB7XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgXCJET01Db250ZW50TG9hZGVkXCIsXG4gICAgaW52ZW50b3J5Vmlldy5hbHRlckludmVudG9yeVRhYmxlXG4gICk7XG59XG5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuLy8gKioqKiBJbnZlbnRvcnkgU2VhcmNoIFBhZ2UgKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbmlmICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3Vic3RyaW5nKDEsIDE3KSA9PT0gXCJpbnZlbnRvcnkvc2VhcmNoXCIpIHtcbiAgZG9jdW1lbnRcbiAgICAucXVlcnlTZWxlY3RvcihcIi5qcy0taW52LXNlYXJjaC1idG5cIilcbiAgICAuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGludlNlYXJjaC5jaGVja1ByaWNlSW5wdXRGb3JEaWdpdHMpO1xuXG4gIGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlTGluZS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgIC8vIERpc3BsYXkgdGhlIGRyb3Bkb3duXG4gICAgY29uc29sZS5sb2coXCJjbGlja1wiKTtcbiAgICBzZWFyY2hWaWV3LnNob3dUeXBlc0Ryb3BEb3duKCk7XG4gICAgaW52U2VhcmNoLnN0YXJ0VHlwZXNEcm9wRG93bk5hdmlnYXRpb24oKTtcblxuICAgIC8vIFN0YXJ0IGFuIGV2ZW50IGxpc3RlbmVyIG9uIHRoZSBkb2N1bWVudC4gVGhpcyB3aWxsIGNsb3NlIHRoZSBkcm9wZG93biBpZiB0aGUgdXNlciBjbGlja3NcbiAgICAvLyBvdXRzaWRlIG9mIHRoZSBpbnB1dCBvciBkcm9wZG93bi4gVGhpcyB3aWxsIGFsc28gY2FuY2VsIHRoZSBldmVudCBsaXN0ZW5lclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBpbnZTZWFyY2gudHlwZUxpbmVMaXN0ZW5lcik7XG4gIH0pO1xuXG4gIGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlTGluZS5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKCkgPT4ge1xuICAgIGlmIChlbGVtZW50cy5hcGlTZWFyY2gudHlwZURyb3BEb3duLmhhc0F0dHJpYnV0ZShcImhpZGRlblwiKSkge1xuICAgICAgc2VhcmNoVmlldy5zaG93VHlwZXNEcm9wRG93bigpO1xuICAgIH1cblxuICAgIHNlYXJjaFZpZXcuZmlsdGVyVHlwZXMoZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVMaW5lLnZhbHVlKTtcbiAgICBzZWFyY2hWaWV3LmZpbHRlclR5cGVIZWFkZXJzKCk7XG4gICAgaW52U2VhcmNoLnN0YXJ0VHlwZXNEcm9wRG93bk5hdmlnYXRpb24oKTtcbiAgfSk7XG5cbiAgZWxlbWVudHMuYXBpU2VhcmNoLnNldElucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgLy8gRGlzcGxheSB0aGUgZHJvcGRvd25cbiAgICBzZWFyY2hWaWV3LnNob3dTZXRzRHJvcERvd24oKTtcbiAgICBpbnZTZWFyY2guc3RhcnRTZXRzRHJvcERvd25OYXZpZ2F0aW9uKCk7XG5cbiAgICAvLyBTdGFydCBhbiBldmVudCBsaXN0ZW5lciBvbiB0aGUgZG9jdW1lbnQuIFRoaXMgd2lsbCBjbG9zZSB0aGUgZHJvcGRvd24gaWYgdGhlIHVzZXIgY2xpY2tzXG4gICAgLy8gb3V0c2lkZSBvZiB0aGUgaW5wdXQgb3IgZHJvcGRvd24uIFRoaXMgd2lsbCBhbHNvIGNhbmNlbCB0aGUgZXZlbnQgbGlzdGVuZXJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgaW52U2VhcmNoLnNldElucHV0TGlzdGVuZXIpO1xuICB9KTtcblxuICBlbGVtZW50cy5hcGlTZWFyY2guc2V0SW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsICgpID0+IHtcbiAgICBpZiAoZWxlbWVudHMuYXBpU2VhcmNoLnNldERyb3BEb3duLmhhc0F0dHJpYnV0ZShcImhpZGRlblwiKSkge1xuICAgICAgc2VhcmNoVmlldy5zaG93U2V0c0Ryb3BEb3duKCk7XG4gICAgfVxuXG4gICAgc2VhcmNoVmlldy5maWx0ZXJTZXRzKGVsZW1lbnRzLmFwaVNlYXJjaC5zZXRJbnB1dC52YWx1ZSk7XG4gICAgc2VhcmNoVmlldy5maWx0ZXJTZXRIZWFkZXJzKCk7XG4gICAgaW52U2VhcmNoLnN0YXJ0U2V0c0Ryb3BEb3duTmF2aWdhdGlvbigpO1xuICB9KTtcbn1cbiIsImltcG9ydCBheGlvcyBmcm9tICdheGlvcyc7XG5cbmltcG9ydCB7IGVsZW1lbnRzIH0gZnJvbSAnLi4vdmlld3MvYmFzZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlYXJjaCB7XG4gIHNlYXJjaEJ5TmFtZSgpIHtcbiAgICBsZXQgY2FyZE5hbWUgPSBlbGVtZW50cy5hcGlTZWFyY2guY2FyZE5hbWUudmFsdWU7XG4gICAgY2FyZE5hbWUgPSBjYXJkTmFtZS5yZXBsYWNlKCcgJywgJysnKTtcblxuICAgIGlmIChjYXJkTmFtZSkgdGhpcy5zZWFyY2ggKz0gY2FyZE5hbWU7XG4gIH1cblxuICBzZWFyY2hCeU90ZXh0KCkge1xuICAgIGNvbnN0IG9yYWNsZVRleHQgPSBlbGVtZW50cy5hcGlTZWFyY2gub3JhY2xlVGV4dC52YWx1ZTtcblxuICAgIC8vIElmIHRoZSBvcmFjbGUgdGV4dCBpbmNsdWRlcyBtb3JlIHRoYW4gb25lIHdvcmQsIHdlIG5lZWQgdG8gc2VhcmNoIHRoZSB0ZXJtcyBpbmRpdmlkdWFsbHlcbiAgICBpZiAoXG4gICAgICBvcmFjbGVUZXh0LmluY2x1ZGVzKCcgJykgJiZcbiAgICAgIG9yYWNsZVRleHQuaW5kZXhPZignICcpICE9PSBvcmFjbGVUZXh0Lmxlbmd0aCAtIDFcbiAgICApIHtcbiAgICAgIGxldCB0ZW1wb3JhcnlTdHIgPSAnJztcbiAgICAgIGNvbnN0IHRleHRzID0gb3JhY2xlVGV4dC5zcGxpdCgnICcpO1xuXG4gICAgICB0ZXh0cy5mb3JFYWNoKCh0ZXh0KSA9PiB7XG4gICAgICAgIGlmICh0ZXh0Lmxlbmd0aCA+IDApIHRlbXBvcmFyeVN0ciArPSBgb3JhY2xlJTNBJHt0ZXh0fStgO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuc2VhcmNoICs9IGArJTI4JHt0ZW1wb3JhcnlTdHIuc2xpY2UoMCwgLTEpfSUyOWA7XG4gICAgfSBlbHNlIGlmIChvcmFjbGVUZXh0KSB0aGlzLnNlYXJjaCArPSBgK29yYWNsZSUzQSR7b3JhY2xlVGV4dH1gO1xuICB9XG5cbiAgc2VhcmNoQnlDYXJkVHlwZSgpIHtcbiAgICBjb25zdCB0eXBlc1RvSW5jbHVkZSA9IEFycmF5LmZyb20oXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1pbmNsdWRlLXR5cGVdJylcbiAgICApO1xuICAgIGNvbnN0IHR5cGVzVG9FeGNsdWRlID0gQXJyYXkuZnJvbShcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWV4Y2x1ZGUtdHlwZV0nKVxuICAgICk7XG4gICAgY29uc3QgaW5jbHVkZVBhcnRpYWxUeXBlcyA9IGVsZW1lbnRzLmFwaVNlYXJjaC5pbmNsdWRlUGFydGlhbFR5cGVzLmNoZWNrZWQ7XG4gICAgbGV0IHRlbXBvcmFyeVN0ciA9ICcnO1xuXG4gICAgaWYgKHR5cGVzVG9JbmNsdWRlICYmICFpbmNsdWRlUGFydGlhbFR5cGVzKSB7XG4gICAgICB0eXBlc1RvSW5jbHVkZS5mb3JFYWNoKCh0eXBlKSA9PiB7XG4gICAgICAgIHRoaXMuc2VhcmNoICs9IGArdHlwZSUzQSR7dHlwZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaW5jbHVkZS10eXBlJyl9YDtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICh0eXBlc1RvSW5jbHVkZS5sZW5ndGggPiAwICYmIGluY2x1ZGVQYXJ0aWFsVHlwZXMpIHtcbiAgICAgIHR5cGVzVG9JbmNsdWRlLmZvckVhY2goKHR5cGUpID0+IHtcbiAgICAgICAgdGVtcG9yYXJ5U3RyICs9IGB0eXBlJTNBJHt0eXBlLmdldEF0dHJpYnV0ZSgnZGF0YS1pbmNsdWRlLXR5cGUnKX0rT1IrYDtcbiAgICAgIH0pO1xuXG4gICAgICB0ZW1wb3JhcnlTdHIgPSB0ZW1wb3JhcnlTdHIuc2xpY2UoMCwgLTQpO1xuICAgICAgdGhpcy5zZWFyY2ggKz0gYCslMjgke3RlbXBvcmFyeVN0cn0lMjlgO1xuICAgIH1cblxuICAgIGlmICh0eXBlc1RvRXhjbHVkZSkge1xuICAgICAgdHlwZXNUb0V4Y2x1ZGUuZm9yRWFjaCgodHlwZSkgPT4ge1xuICAgICAgICB0aGlzLnNlYXJjaCArPSBgKy10eXBlJTNBJHt0eXBlLmdldEF0dHJpYnV0ZSgnZGF0YS1leGNsdWRlLXR5cGUnKX1gO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgc2VhcmNoQnlDb2xvcigpIHtcbiAgICBsZXQgYm94ZXMgPSBlbGVtZW50cy5hcGlTZWFyY2guY29sb3JCb3hlcztcblxuICAgIC8vIExvb3AgdGhyb3VnaCBjaGVja2JveGVzIHRvIGdldCBhbGwgY29sb3JzIGdpdmVuXG4gICAgdmFyIGNvbG9ycyA9ICcnO1xuICAgIGJveGVzLmZvckVhY2goKGJveCkgPT4ge1xuICAgICAgaWYgKGJveC5jaGVja2VkKSBjb2xvcnMgKz0gYm94LnZhbHVlO1xuICAgIH0pO1xuXG4gICAgY29uc3Qgc29ydEJ5ID0gZWxlbWVudHMuYXBpU2VhcmNoLmNvbG9yU29ydEJ5LnZhbHVlO1xuXG4gICAgaWYgKGNvbG9ycykgdGhpcy5zZWFyY2ggKz0gYCtjb2xvciR7c29ydEJ5fSR7Y29sb3JzfWA7XG4gIH1cblxuICBzZWFyY2hCeVN0YXRzKCkge1xuICAgIGNvbnN0IHN0YXRMaW5lcyA9IEFycmF5LmZyb20oXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWFwaS1zdGF0cy13cmFwcGVyJylcbiAgICApO1xuXG4gICAgc3RhdExpbmVzLmZvckVhY2goKGxpbmUpID0+IHtcbiAgICAgIGNvbnN0IHN0YXQgPSBsaW5lLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXN0YXQnKS52YWx1ZTtcbiAgICAgIGNvbnN0IHNvcnRCeSA9IGxpbmUucXVlcnlTZWxlY3RvcignLmpzLS1hcGktc3RhdC1maWx0ZXInKS52YWx1ZTtcbiAgICAgIGNvbnN0IHNvcnRWYWx1ZSA9IGxpbmUucXVlcnlTZWxlY3RvcignLmpzLS1hcGktc3RhdC12YWx1ZScpLnZhbHVlO1xuXG4gICAgICBpZiAoc3RhdCAmJiBzb3J0QnkgJiYgc29ydFZhbHVlKSB7XG4gICAgICAgIHRoaXMuc2VhcmNoICs9IGArJHtzdGF0fSR7c29ydEJ5fSR7c29ydFZhbHVlfWA7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBzZWFyY2hCeUZvcm1hdCgpIHtcbiAgICBjb25zdCBmb3JtYXRMaW5lcyA9IEFycmF5LmZyb20oXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWFwaS1mb3JtYXQtd3JhcHBlcicpXG4gICAgKTtcblxuICAgIGZvcm1hdExpbmVzLmZvckVhY2goKGxpbmUpID0+IHtcbiAgICAgIGNvbnN0IHN0YXR1cyA9IGxpbmUucXVlcnlTZWxlY3RvcignLmpzLS1hcGktbGVnYWwtc3RhdHVzJykudmFsdWU7XG4gICAgICBjb25zdCBmb3JtYXQgPSBsaW5lLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLWZvcm1hdCcpLnZhbHVlO1xuXG4gICAgICBpZiAoZm9ybWF0ICYmIHN0YXR1cykgdGhpcy5zZWFyY2ggKz0gYCske3N0YXR1c30lM0Eke2Zvcm1hdH1gO1xuICAgIH0pO1xuICB9XG5cbiAgc2VhcmNoQnlTZXQoKSB7XG4gICAgY29uc3Qgc2V0cyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtaW5jbHVkZS1zZXRdJykpO1xuICAgIGxldCB0ZW1wb3JhcnlTdHIgPSAnJztcblxuICAgIGlmIChzZXRzLmxlbmd0aCA+IDApIHtcbiAgICAgIHNldHMuZm9yRWFjaChcbiAgICAgICAgKHMpID0+XG4gICAgICAgICAgKHRlbXBvcmFyeVN0ciArPSBgc2V0JTNBJHtzLmdldEF0dHJpYnV0ZSgnZGF0YS1pbmNsdWRlLXNldCcpfStPUitgKVxuICAgICAgKTtcblxuICAgICAgdGVtcG9yYXJ5U3RyID0gdGVtcG9yYXJ5U3RyLnNsaWNlKDAsIC00KTtcbiAgICAgIHRoaXMuc2VhcmNoICs9IGArJTI4JHt0ZW1wb3JhcnlTdHJ9JTI5YDtcbiAgICB9XG4gIH1cblxuICBzZWFyY2hCeVJhcml0eSgpIHtcbiAgICBjb25zdCBib3hlcyA9IGVsZW1lbnRzLmFwaVNlYXJjaC5yYXJpdHlCb3hlcztcbiAgICB2YXIgdmFsdWVzID0gW107XG4gICAgbGV0IHRlbXBvcmFyeVN0ciA9ICcnO1xuXG4gICAgLy8gUHVzaCBhbGwgcmFyaXRpZXMgZ2l2ZW4gYnkgdGhlIHVzZXIgaW50byB0aGUgdmFsdWVzIGFycmF5XG4gICAgYm94ZXMuZm9yRWFjaCgoYm94KSA9PiB7XG4gICAgICBpZiAoYm94LmNoZWNrZWQpIHZhbHVlcy5wdXNoKGJveC52YWx1ZSk7XG4gICAgfSk7XG5cbiAgICBpZiAodmFsdWVzLmxlbmd0aCA+IDApIHtcbiAgICAgIC8vIFdlIG5lZWQgYSBzdGFydGVyIHN0cmluZyBzbyB3ZSBjYW4gc2xpY2UgaXQgbGF0ZXIgJTI4IGlzIGFuIG9wZW4gcGFyZW50aGVzZXNcbiAgICAgIHRlbXBvcmFyeVN0ciArPSAnJTI4JztcblxuICAgICAgLy8gRm9yIGV2ZXJ5IHZhbHVlIGdpdmVuIGJ5IHRoZSB1c2VyIHdlIG5lZWQgdG8gYWRkIHRoZSArT1IrXG4gICAgICAvLyB0byB0aGUgZW5kIGZvciBncm91cGluZy4gV2Ugd2lsbCByZW1vdmUgdGhlICtPUisgZnJvbSB0aGUgbGFzdFxuICAgICAgLy8gaXRlcmF0aW9uIG9mIHRoZSBsb29wXG4gICAgICB2YWx1ZXMuZm9yRWFjaCgodmFsdWUpID0+ICh0ZW1wb3JhcnlTdHIgKz0gYHJhcml0eSUzQSR7dmFsdWV9K09SK2ApKTtcblxuICAgICAgLy8gUmVtb3ZlIHRoZSB1bm5lY2Vzc2FyeSArT1IrIGF0IHRoZSBlbmRcbiAgICAgIHRlbXBvcmFyeVN0ciA9IHRlbXBvcmFyeVN0ci5zbGljZSgwLCAtNCk7XG5cbiAgICAgIC8vIENsb3NlIHRoZSBwYXJlbnRoZXNlc1xuICAgICAgdGVtcG9yYXJ5U3RyICs9IGAlMjlgO1xuXG4gICAgICB0aGlzLnNlYXJjaCArPSBgKyR7dGVtcG9yYXJ5U3RyfWA7XG4gICAgfVxuICB9XG5cbiAgc2VhcmNoQnlDb3N0KCkge1xuICAgIGNvbnN0IGRlbm9taW5hdGlvbiA9IGVsZW1lbnRzLmFwaVNlYXJjaC5kZW5vbWluYXRpb24udmFsdWU7XG4gICAgY29uc3Qgc29ydEJ5ID0gZWxlbWVudHMuYXBpU2VhcmNoLmRlbm9taW5hdGlvblNvcnRCeS52YWx1ZTtcbiAgICBjb25zdCBpbnB1dFZhbCA9IGVsZW1lbnRzLmFwaVNlYXJjaC5kZW5vbWluYXRpb25Tb3J0VmFsdWUudmFsdWU7XG5cbiAgICBpZiAoaW5wdXRWYWwpIHRoaXMuc2VhcmNoICs9IGArJHtkZW5vbWluYXRpb259JHtzb3J0Qnl9JHtpbnB1dFZhbH1gO1xuICB9XG5cbiAgcXVpY2tTZWFyY2goKSB7XG4gICAgbGV0IGNhcmROYW1lID0gZWxlbWVudHMubmF2LnNlYXJjaElucHV0LnZhbHVlO1xuICAgIGNhcmROYW1lID0gY2FyZE5hbWUucmVwbGFjZSgnICcsICcrJyk7XG4gICAgcmV0dXJuIGNhcmROYW1lO1xuICB9XG5cbiAgc29ydFJlc3VsdHMoKSB7XG4gICAgY29uc3Qgc29ydEJ5ID0gZWxlbWVudHMuYXBpU2VhcmNoLmNhcmRTb3J0ZXIudmFsdWU7XG4gICAgdGhpcy5zZWFyY2ggKz0gYCZvcmRlcj0ke3NvcnRCeX1gO1xuICB9XG5cbiAgLy8gVGhpcyBtZXRob2Qgd2lsbCBydW4gZWFjaCBvZiB0aGUgaW5kaXZpZHVhbCBzZWFyY2ggbWV0aG9kcyB0byBidWlsZCB0aGUgZmluYWwgc2VhcmNoIHF1ZXJ5XG4gIGJ1aWxkU2VhcmNoUXVlcnkoKSB7XG4gICAgdGhpcy5zZWFyY2hCeU5hbWUoKTtcbiAgICB0aGlzLnNlYXJjaEJ5T3RleHQoKTtcbiAgICB0aGlzLnNlYXJjaEJ5Q2FyZFR5cGUoKTtcbiAgICB0aGlzLnNlYXJjaEJ5Q29sb3IoKTtcbiAgICB0aGlzLnNlYXJjaEJ5U3RhdHMoKTtcbiAgICB0aGlzLnNlYXJjaEJ5Rm9ybWF0KCk7XG4gICAgdGhpcy5zZWFyY2hCeVNldCgpO1xuICAgIHRoaXMuc2VhcmNoQnlSYXJpdHkoKTtcbiAgICB0aGlzLnNlYXJjaEJ5Q29zdCgpO1xuICAgIHRoaXMuc29ydFJlc3VsdHMoKTtcblxuICAgIHJldHVybiB0aGlzLnNlYXJjaDtcbiAgfVxuXG4gIHJlc2V0U2VhcmNoUXVlcnkoKSB7XG4gICAgdGhpcy5zZWFyY2ggPSAnJztcbiAgfVxuXG4gIGRpc3BsYXlNZXRob2QoKSB7XG4gICAgcmV0dXJuIGVsZW1lbnRzLmFwaVNlYXJjaC5kaXNwbGF5QXMudmFsdWU7XG4gIH1cblxuICAvLyBSZXR1bnMgdGhlIGZpcnN0IHBhZ2Ugb2YgY2FyZHNcbiAgYXN5bmMgZ2V0Q2FyZHMoc3RhdGUpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgYXhpb3NcbiAgICAgICAgLmdldChgaHR0cHM6Ly9hcGkuc2NyeWZhbGwuY29tL2NhcmRzL3NlYXJjaD9xPSR7c3RhdGUucXVlcnl9YClcbiAgICAgICAgLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgc2VhcmNoXG4gICAgICAgICAgdGhpcy5yZXN1bHRzID0gcmVzLmRhdGE7XG4gICAgICAgICAgdGhpcy5jYXJkcyA9IHJlcy5kYXRhLmRhdGE7XG5cbiAgICAgICAgICAvLyBTdG9yZSB0aGUgY2FyZHMgaW4gdGhlIGFsbENhcmRzIGFycmF5XG4gICAgICAgICAgc3RhdGUuYWxsQ2FyZHMucHVzaChyZXMuZGF0YS5kYXRhKTtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgaWYgKGVyci5yZXNwb25zZS5zdGF0dXMgPT09IDQwNCkge1xuICAgICAgICAgICAgc3RhdGUuYWxsQ2FyZHMucHVzaCg0MDQpO1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvLyBVc2VkIGJ5IGdldEFsbENhcmRzIHRvIGdldCBlYWNoIGFycmF5IG9mIDE3NSBjYXJkc1xuICBhc3luYyBsb29wTmV4dFBhZ2Uoc3RhdGUsIGVuYWJsZUJ0bikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBheGlvcy5nZXQodGhpcy5yZXN1bHRzLm5leHRfcGFnZSkudGhlbigocmVzKSA9PiB7XG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgcmVzdWx0cyBvYmplY3RcbiAgICAgICAgdGhpcy5yZXN1bHRzID0gcmVzLmRhdGE7XG5cbiAgICAgICAgLy8gUHVzaCB0aGUgY2FyZHMgZnJvbSB0aGlzIHJlc3VsdCBpbnRvIHRoZSBhbGxDYXJkcyBhcnJheVxuICAgICAgICBzdGF0ZS5hbGxDYXJkcy5wdXNoKHJlcy5kYXRhLmRhdGEpO1xuXG4gICAgICAgIC8vIEVuYWJsZSB0aGUgbmV4dCBwYWdlIGJ0biBhbmQgcmVzb2x2ZSB0aGUgcHJvbWlzZVxuICAgICAgICBlbmFibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UubmV4dFBhZ2VCdG4pO1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFdpbGwgcnVuIGluIHRoZSBiYWNrZ3JvdW5kIGFmdGVyIHRoZSBmaXJzdCBzZXQgb2YgY2FyZHMgaXMgcmV0cmlldmVkIHRvIG1ha2UgbW92aW5nIGJldHdlZW4gcmVzdWx0c1xuICAvLyBwYWdlcyBmYXN0ZXJcbiAgYXN5bmMgZ2V0QWxsQ2FyZHMoc3RhdGUsIGVuYWJsZUJ0bikge1xuICAgIC8vIEFzIGxvbmcgYXMgdGhlcmUgaXMgYSBuZXh0X3BhZ2Uga2VlcCBsb2FkaW5nIHRoZSBjYXJkc1xuICAgIHdoaWxlICh0aGlzLnJlc3VsdHMubmV4dF9wYWdlKSBhd2FpdCB0aGlzLmxvb3BOZXh0UGFnZShzdGF0ZSwgZW5hYmxlQnRuKTtcblxuICAgIC8vIFVwZGF0ZSB0aGUgc3RhdGUgb25jZSBhbGwgY2FyZHMgaGF2ZSBiZWVuIHJldHJlaWV2ZWRcbiAgICBzdGF0ZS5hbGxSZXN1bHRzTG9hZGVkID0gdHJ1ZTtcblxuICAgIC8vIElmIHRoZXJlIGlzIGF0IGxlYXN0IDIgcGFnZXMgb2YgY2FyZHMsIGVuYWJsZSB0aGUgbGFzdCBwYWdlIGJ0bi5cbiAgICBpZiAoc3RhdGUuYWxsQ2FyZHMubGVuZ3RoID4gMSkgZW5hYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLmxhc3RQYWdlQnRuKTtcbiAgfVxufVxuIiwiZXhwb3J0IGNvbnN0IGVsZW1lbnRzID0ge1xuICBuYXY6IHtcbiAgICBxdWlja1NlYXJjaEJ0bjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1uYXYtc2VhcmNoJyksXG4gICAgc2VhcmNoSW5wdXQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tbmF2LXNlYXJjaC1pbnB1dCcpLFxuICB9LFxuICBhcGlTZWFyY2g6IHtcbiAgICBjYXJkTmFtZTogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktY2FyZC1uYW1lJyksXG4gICAgb3JhY2xlVGV4dDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktby10ZXh0JyksXG4gICAgdHlwZUxpbmU6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXR5cGUtbGluZScpLFxuICAgIHNlbGVjdGVkVHlwZXM6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXNlbGVjdGVkLXR5cGVzJyksXG4gICAgaW5jbHVkZVBhcnRpYWxUeXBlczogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktdHlwZS1ib3gnKSxcbiAgICB0eXBlRHJvcERvd246IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXR5cGVzLWRyb3Bkb3duJyksXG4gICAgY29sb3JCb3hlczogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1hcGktY29sb3ItYm94JyksXG4gICAgY29sb3JTb3J0Qnk6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLWNvbG9yLXNvcnRlcicpLFxuICAgIHN0YXQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXN0YXQnKSxcbiAgICBzdGF0RmlsdGVyOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1zdGF0LWZpbHRlcicpLFxuICAgIHN0YXRWYWx1ZTogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktc3RhdC12YWx1ZScpLFxuICAgIGxlZ2FsU3RhdHVzOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1sZWdhbC1zdGF0dXMnKSxcbiAgICBmb3JtYXQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLWZvcm1hdCcpLFxuICAgIHNldElucHV0OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1zZXQnKSxcbiAgICBzZXREcm9wRG93bjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktc2V0LWRyb3Bkb3duJyksXG4gICAgc2VsZWN0ZWRTZXRzOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1zZWxlY3RlZC1zZXRzJyksXG4gICAgYmxvY2s6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLWJsb2NrJyksXG4gICAgcmFyaXR5Qm94ZXM6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tYXBpLXJhcml0eS1ib3gnKSxcbiAgICBkZW5vbWluYXRpb246IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLWRlbm9taW5hdGlvbicpLFxuICAgIGRlbm9taW5hdGlvblNvcnRCeTogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktZGVub21pbmF0aW9uLXNvcnQtYnknKSxcbiAgICBkZW5vbWluYXRpb25Tb3J0VmFsdWU6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAnLmpzLS1hcGktZGVub21pbmF0aW9uLXNvcnQtdmFsdWUnXG4gICAgKSxcbiAgICBjYXJkU29ydGVyOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1yZXN1bHRzLXNvcnRlcicpLFxuICAgIGRpc3BsYXlBczogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktc2VhcmNoLWRpc3BsYXktc2VsZWN0b3InKSxcbiAgICBzdWJtaXRCdG46IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLWJ0bicpLFxuICB9LFxuICByZXN1bHRzUGFnZToge1xuICAgIHJlc3VsdHNDb250YWluZXI6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXJlc3VsdHMtZGlzcGxheScpLFxuICAgIGRpc3BsYXlTZWxlY3RvcjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1yZXN1bHRzLWRpc3BsYXktb3B0aW9uJyksXG4gICAgc29ydEJ5OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXJlc3VsdHMtc29ydC1vcHRpb25zJyksXG4gICAgYnRuOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXJlc3VsdHMtc3VibWl0LWJ0bicpLFxuICAgIGNhcmRDaGVja2xpc3Q6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tY2FyZC1jaGVja2xpc3QnKSxcbiAgICBpbWFnZUdyaWQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taW1hZ2UtZ3JpZCcpLFxuICAgIGRpc3BsYXlCYXI6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLWRpc3BsYXktYmFyJyksXG4gICAgZmlyc3RQYWdlQnRuOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1maXJzdC1wYWdlJyksXG4gICAgcHJldmlvdXNQYWdlQnRuOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1wcmV2aW91cy1wYWdlJyksXG4gICAgbmV4dFBhZ2VCdG46IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLW5leHQtcGFnZScpLFxuICAgIGxhc3RQYWdlQnRuOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1sYXN0LXBhZ2UnKSxcbiAgfSxcbiAgY2FyZDoge1xuICAgIG1hbmFDb3N0VGl0bGVTcGFuOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWNhcmQtbWFuYS1jb3N0JyksXG4gICAgb3JhY2xlVGV4dHM6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tb3JhY2xlLXRleHQtbGluZScpLFxuICAgIGxlZ2FsaXRpZXM6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tY2FyZC1sZWdhbGl0eScpLFxuICAgIHByaW50Um93czogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1jYXJkLXByaW50LXJvdycpLFxuICAgIHByaWNlczogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1jYXJkLXByaWNlJyksXG4gICAgY2FyZFByaW50TGlua3M6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tY2FyZC1wcmludC1saW5rJyksXG4gICAgZnJvbnQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tZnJvbnQnKSxcbiAgICBiYWNrOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWJhY2snKSxcbiAgICB0cmFuc2Zvcm1CdG46IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tY2FyZC10cmFuc2Zvcm0nKSxcbiAgfSxcbn07XG4iLCJpbXBvcnQgeyBnZW5lcmF0ZU1hbmFDb3N0SW1hZ2VzIH0gZnJvbSAnLi9yZXN1bHRzVmlldyc7XG5pbXBvcnQgeyBlbGVtZW50cyB9IGZyb20gJy4vYmFzZSc7XG5cbmV4cG9ydCBjb25zdCBpbnNlcnRNYW5hQ29zdFRvQ2FyZFRleHRUaXRsZSA9ICgpID0+IHtcbiAgY29uc3QgbWFuYUNvc3RzID0gQXJyYXkuZnJvbShlbGVtZW50cy5jYXJkLm1hbmFDb3N0VGl0bGVTcGFuKTtcblxuICBtYW5hQ29zdHMuZm9yRWFjaCgoY29zdCkgPT4ge1xuICAgIGNvc3QuaW5uZXJIVE1MID0gZ2VuZXJhdGVNYW5hQ29zdEltYWdlcyhcbiAgICAgIGNvc3QuZ2V0QXR0cmlidXRlKCdkYXRhLW1hbmEtY29zdCcpXG4gICAgKTtcbiAgfSk7XG59O1xuXG5leHBvcnQgY29uc3QgaW5zZXJ0TWFuYUNvc3RUb09yYWNsZVRleHQgPSAoKSA9PiB7XG4gIGNvbnN0IG9yYWNsZVRleHRzID0gQXJyYXkuZnJvbShlbGVtZW50cy5jYXJkLm9yYWNsZVRleHRzKTtcblxuICBpZiAob3JhY2xlVGV4dHMubGVuZ3RoID4gMCkge1xuICAgIG9yYWNsZVRleHRzLmZvckVhY2goXG4gICAgICAodGV4dCkgPT4gKHRleHQuaW5uZXJIVE1MID0gZ2VuZXJhdGVNYW5hQ29zdEltYWdlcyh0ZXh0LmlubmVySFRNTCwgJ3hzJykpXG4gICAgKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IHJlbW92ZVVuZGVyU2NvcmVGcm9tTGVnYWxTdGF0dXMgPSAoKSA9PiB7XG4gIGNvbnN0IGxlZ2FsaXRpZXMgPSBBcnJheS5mcm9tKGVsZW1lbnRzLmNhcmQubGVnYWxpdGllcyk7XG5cbiAgbGVnYWxpdGllcy5mb3JFYWNoKChsZWdhbGl0eSkgPT4ge1xuICAgIGlmIChsZWdhbGl0eS5pbm5lckhUTUwuaW5jbHVkZXMoJ18nKSkge1xuICAgICAgbGVnYWxpdHkuaW5uZXJIVE1MID0gbGVnYWxpdHkuaW5uZXJIVE1MLnJlcGxhY2UoJ18nLCAnICcpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5leHBvcnQgY29uc3QgZml4Q2FyZFByaWNlcyA9ICgpID0+IHtcbiAgY29uc3QgcHJpY2VzID0gQXJyYXkuZnJvbShlbGVtZW50cy5jYXJkLnByaWNlcyk7XG5cbiAgcHJpY2VzLmZvckVhY2goKHByaWNlKSA9PiB7XG4gICAgaWYgKHByaWNlLmlubmVySFRNTC5pbmNsdWRlcygnTm9uZScpKSBwcmljZS5pbm5lckhUTUwgPSAnLSc7XG4gIH0pO1xufTtcblxuY29uc3QgZml4RG91YmxlU2lkZWRDYXJkTmFtZSA9IChjYXJkTmFtZSkgPT4ge1xuICBpZiAoY2FyZE5hbWUuaW5jbHVkZXMoJy8nKSkge1xuICAgIGNhcmROYW1lID0gY2FyZE5hbWUuc3Vic3RyaW5nKDAsIGNhcmROYW1lLmluZGV4T2YoJy8nKSAtIDEpO1xuICB9XG4gIHJldHVybiBjYXJkTmFtZTtcbn07XG5cbmV4cG9ydCBjb25zdCBzZXRQcmludExpbmtIcmVmID0gKCkgPT4ge1xuICBjb25zdCBsaW5rcyA9IEFycmF5LmZyb20oZWxlbWVudHMuY2FyZC5jYXJkUHJpbnRMaW5rcyk7XG5cbiAgbGlua3MuZm9yRWFjaCgobGluaykgPT4ge1xuICAgIGxldCBjYXJkTmFtZSA9IGxpbmsuZ2V0QXR0cmlidXRlKCdkYXRhLW5hbWUnKS5yZXBsYWNlQWxsKCcgJywgJy0nKTtcbiAgICBjYXJkTmFtZSA9IGZpeERvdWJsZVNpZGVkQ2FyZE5hbWUoY2FyZE5hbWUpO1xuICAgIGNvbnN0IHNldENvZGUgPSBsaW5rLmdldEF0dHJpYnV0ZSgnZGF0YS1zZXQnKTtcblxuICAgIGxpbmsuaHJlZiA9IGAvY2FyZC8ke3NldENvZGV9LyR7Y2FyZE5hbWV9YDtcbiAgfSk7XG59O1xuXG5jb25zdCBzZXREb3VibGVTaWRlZFRyYW5zaXRpb24gPSAoKSA9PiB7XG4gIC8vIENoZWNrcyB0byBzZWUgaWYgYW4gaW5saW5lIHN0eWxlIGhhcyBiZWVuIHNldCBmb3IgdGhlIGZyb250IG9mIHRoZSBjYXJkLlxuICAvLyBJZiBub3QsIHNldCBhIHRyYW5zaXRvbi4gVGhpcyBtYWtlcyBzdXJlIHdlIGRvbid0IHNldCB0aGUgdHJhbnNpdG9uIGV2ZXJ5XG4gIC8vIHRpbWUgdGhlIGNhcmQgaXMgZmxpcHBlZC5cbiAgaWYgKCFlbGVtZW50cy5jYXJkLmZyb250LmdldEF0dHJpYnV0ZSgnc3R5bGUnKSkge1xuICAgIGVsZW1lbnRzLmNhcmQuZnJvbnQuc3R5bGUudHJhbnNpdGlvbiA9IGBhbGwgLjhzIGVhc2VgO1xuICAgIGVsZW1lbnRzLmNhcmQuYmFjay5zdHlsZS50cmFuc2l0aW9uID0gYGFsbCAuOHMgZWFzZWA7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBmbGlwVG9CYWNrU2lkZSA9ICgpID0+IHtcbiAgLy8gU2V0cyB0aGUgdHJhbnNpdGlvbiBwcm9wZXJ0eSBvbiBib3RoIHNpZGVzIG9mIHRoZSBjYXJkIHRoZSBmaXJzdCB0aW1lIHRoZVxuICAvLyB0cmFuc2Zvcm0gYnV0dG9uIGlzIGNsaWNrZWRcbiAgc2V0RG91YmxlU2lkZWRUcmFuc2l0aW9uKCk7XG5cbiAgLy8gUm90YXRlcyB0aGUgY2FyZCB0byBzaG93IHRoZSBiYWNrc2lkZS5cbiAgZWxlbWVudHMuY2FyZC5mcm9udC5zdHlsZS50cmFuc2Zvcm0gPSBgcm90YXRlWSgtMTgwZGVnKWA7XG4gIGVsZW1lbnRzLmNhcmQuYmFjay5zdHlsZS50cmFuc2Zvcm0gPSBgcm90YXRlWSgwKWA7XG5cbiAgLy8gUmVzZXQgdGhlIGV2ZW50IGxpc3RlbmVyIHNvIHRoYXQgb24gY2xpY2tpbmcgdGhlIGJ1dHRvbiBpdCB3aWxsIGZsaXBcbiAgLy8gYmFjayB0byB0aGUgZnJvbnQgb2YgdGhlIGNhcmRcbiAgZWxlbWVudHMuY2FyZC50cmFuc2Zvcm1CdG4ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmbGlwVG9CYWNrU2lkZSk7XG4gIGVsZW1lbnRzLmNhcmQudHJhbnNmb3JtQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZmxpcFRvRnJvbnRTaWRlKTtcbn07XG5cbmV4cG9ydCBjb25zdCBmbGlwVG9Gcm9udFNpZGUgPSAoKSA9PiB7XG4gIGVsZW1lbnRzLmNhcmQuZnJvbnQuc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZVkoMClgO1xuICBlbGVtZW50cy5jYXJkLmJhY2suc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZVkoMTgwZGVnKWA7XG5cbiAgLy8gUmVzZXQgdGhlIGV2ZW50IGxpc3RlbmVyIHNvIHRoYXQgb24gY2xpY2tpbmcgdGhlIGJ1dHRvbiBpdCB3aWxsIGZsaXBcbiAgLy8gdG8gdGhlIGJhY2tzaWRlIG9mIHRoZSBjYXJkXG4gIGVsZW1lbnRzLmNhcmQudHJhbnNmb3JtQnRuLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZmxpcFRvRnJvbnRTaWRlKTtcbiAgZWxlbWVudHMuY2FyZC50cmFuc2Zvcm1CdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmbGlwVG9CYWNrU2lkZSk7XG59O1xuXG4vLyBDcmVhdGUgdGhlIGhvdmVyIGVmZmVjdCBvbiBlYWNoIHJvdyB0aGF0IGRpc3BsYXlzIHRoZSBpbWFnZSBvZiB0aGUgY2FyZFxuZXhwb3J0IGNvbnN0IHByaW50TGlzdEhvdmVyRXZlbnRzID0gKCkgPT4ge1xuICAvLyBHZXQgdGhlIEhUTUwgZm9yIGVhY2ggdGFibGUgcm93XG4gIGNvbnN0IHByaW50cyA9IEFycmF5LmZyb20oZWxlbWVudHMuY2FyZC5wcmludFJvd3MpO1xuXG4gIHByaW50cy5mb3JFYWNoKChwcmludCkgPT4ge1xuICAgIHByaW50Lm9ubW91c2Vtb3ZlID0gKGUpID0+IHtcbiAgICAgIC8vIElmIHRoZSB3aW5kb3cgaXMgc21hbGxlciB0aGFuIDc2OCBwaXhlbHMsIGRvbid0IGRpc3BsYXkgYW55IGltYWdlc1xuICAgICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoIDwgNzY4KSByZXR1cm4gZmFsc2U7XG5cbiAgICAgIC8vIElmIHRoZXJlIGlzIGFscmVhZHkgYW4gaW1hZ2UgYmVpbmcgZGlzcGxheWVkLCByZW1vdmUgaXQgZnJvbSB0aGUgRE9NXG4gICAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRvb2x0aXAnKSkge1xuICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50b29sdGlwJykpO1xuICAgICAgfVxuXG4gICAgICAvLyBQcmVwIHRoZSBkaXYuXG4gICAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGRpdi5jbGFzc05hbWUgPSAndG9vbHRpcCc7XG5cbiAgICAgIC8vIFRoZSBkaXYgaXMgc3R5bGVkIHdpdGggcG9zaXRpb24gYWJzb2x1dGUuIFRoaXMgY29kZSBwdXRzIGl0IGp1c3QgdG8gdGhlIHJpZ2h0IG9mIHRoZSBjdXJzb3JcbiAgICAgIGRpdi5zdHlsZS5sZWZ0ID0gZS5wYWdlWCArIDUwICsgJ3B4JztcbiAgICAgIGRpdi5zdHlsZS50b3AgPSBlLnBhZ2VZIC0gMzAgKyAncHgnO1xuXG4gICAgICAvLyBQcmVwIHRoZSBpbWcgZWxlbWVudFxuICAgICAgY29uc3QgaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG4gICAgICBpbWcuY2xhc3NOYW1lID0gJ3Rvb2x0aXBfX2ltZyc7XG4gICAgICBpbWcuc3JjID0gcHJpbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWNhcmRJbWcnKTtcblxuICAgICAgLy8gUHV0IHRoZSBpbWcgaW50byB0aGUgZGl2IGFuZCB0aGVuIGFwcGVuZCB0aGUgZGl2IGRpcmVjdGx5IHRvIHRoZSBib2R5IG9mIHRoZSBkb2N1bWVudC5cbiAgICAgIGRpdi5hcHBlbmRDaGlsZChpbWcpO1xuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkaXYpO1xuICAgIH07XG5cbiAgICAvLyBSZW1vdmUgdGhlIGltZyB3aGVuIHRha2luZyB0aGUgY3Vyc29yIG9mZiB0aGUgcHJpbnRcbiAgICBwcmludC5vbm1vdXNlb3V0ID0gKGUpID0+IHtcbiAgICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudG9vbHRpcCcpKSB7XG4gICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRvb2x0aXAnKSk7XG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG59O1xuXG5leHBvcnQgY29uc3QgY2hlY2tQcmljZUlucHV0Rm9yRGlnaXRzID0gKGUpID0+IHtcbiAgY29uc3QgcHJpY2VJbnB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYWRkLXRvLWludi1wcmljZScpLnZhbHVlO1xuXG4gIGlmIChpc05hTihwcmljZUlucHV0KSAmJiBwcmljZUlucHV0ICE9PSAnJykge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICByZW5kZXJQcmljZUlucHV0RXJyb3JNZXNzYWdlKCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59O1xuXG5jb25zdCByZW5kZXJQcmljZUlucHV0RXJyb3JNZXNzYWdlID0gKCkgPT4ge1xuICBjb25zdCBwcmljZUlucHV0RGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hZGQtdG8taW52LXByaWNlLWRpdicpO1xuICBjb25zdCBtc2cgPSBgPHAgY2xhc3M9XCJhZGQtdG8taW52LXByaWNlLW1zZ1wiPkludmFsaWQgcHJpY2UuIE11c3QgYmUgYSBudW1iZXIuPC9wPmA7XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYWRkLXRvLWludi1wcmljZS1tc2cnKSkge1xuICAgIHByaWNlSW5wdXREaXYuaW5zZXJ0QWRqYWNlbnRIVE1MKCdiZWZvcmVlbmQnLCBtc2cpO1xuICB9XG59O1xuIiwiaW1wb3J0IHsgZWxlbWVudHMgfSBmcm9tICcuL2Jhc2UnO1xuaW1wb3J0ICogYXMgc2VhcmNoVmlldyBmcm9tICcuL3NlYXJjaFZpZXcnO1xuXG5leHBvcnQgY29uc3QgY2hlY2tQcmljZUlucHV0Rm9yRGlnaXRzID0gKGUpID0+IHtcbiAgY29uc3QgcHJpY2VJbnB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taW52LWRlbm9taW5hdGlvbi1zb3J0LXZhbHVlJylcbiAgICAudmFsdWU7XG5cbiAgaWYgKGlzTmFOKHByaWNlSW5wdXQpICYmIHByaWNlSW5wdXQgIT09ICcnKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHJlbmRlclByaWNlSW5wdXRFcnJvck1lc3NhZ2UoKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn07XG5cbmNvbnN0IHJlbmRlclByaWNlSW5wdXRFcnJvck1lc3NhZ2UgPSAoKSA9PiB7XG4gIGNvbnN0IHByaWNlSW5wdXREaXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWludi1zZWFyY2gtcHJpY2UtZGl2Jyk7XG4gIGNvbnN0IG1zZyA9IGA8cCBjbGFzcz1cImludi1zZWFyY2gtcHJpY2UtbXNnXCI+SW52YWxpZCBwcmljZS4gTXVzdCBiZSBhIG51bWJlci48L3A+YDtcblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5pbnYtc2VhcmNoLXByaWNlLW1zZycpKSB7XG4gICAgcHJpY2VJbnB1dERpdi5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWVuZCcsIG1zZyk7XG4gIH1cbn07XG5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKiBUWVBFIExJTkUgKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcblxuY29uc3QgaGlkZVR5cGVzRHJvcERvd25CdXRLZWVwVmFsdWUgPSAoKSA9PiB7XG4gIGlmICghZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVEcm9wRG93bi5oYXNBdHRyaWJ1dGUoJ2hpZGRlbicpKSB7XG4gICAgZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVEcm9wRG93bi5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG5hdmlnYXRlVHlwZXNEcm9wRG93bik7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBzdGFydFR5cGVzRHJvcERvd25OYXZpZ2F0aW9uID0gKCkgPT4ge1xuICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgbmF2aWdhdGVUeXBlc0Ryb3BEb3duKTtcbiAgY29uc3QgZmlyc3RUeXBlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS10eXBlOm5vdChbaGlkZGVuXSknKTtcbiAgc2VhcmNoVmlldy5oaWdobGlnaHRUeXBlKGZpcnN0VHlwZSk7XG4gIHNlYXJjaFZpZXcuaG92ZXJPdmVyVHlwZXNMaXN0ZW5lcigpO1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgbmF2aWdhdGVUeXBlc0Ryb3BEb3duKTtcbiAgZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVEcm9wRG93bi5zY3JvbGxUb3AgPSAwO1xufTtcblxuY29uc3QgbmF2aWdhdGVUeXBlc0Ryb3BEb3duID0gKGUpID0+IHtcbiAgY29uc3QgdHlwZXMgPSBBcnJheS5mcm9tKFxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tdHlwZTpub3QoW2hpZGRlbl0pJylcbiAgKTtcbiAgY29uc3QgaSA9IHR5cGVzLmluZGV4T2YoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1oaWdobGlnaHRlZCcpKTtcblxuICBpZiAoZS5jb2RlID09PSAnQXJyb3dEb3duJyAmJiBpIDwgdHlwZXMubGVuZ3RoIC0gMSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBzZWFyY2hWaWV3LnJlbW92ZUN1cnJlbnRIaWdobGlnaHQoKTtcbiAgICBzZWFyY2hWaWV3LmhpZ2hsaWdodFR5cGUodHlwZXNbaSArIDFdKTtcblxuICAgIHNlYXJjaFZpZXcuc2V0U2Nyb2xsVG9wT25Eb3duQXJyb3coXG4gICAgICB0eXBlc1tpICsgMV0sXG4gICAgICBlbGVtZW50cy5hcGlTZWFyY2gudHlwZURyb3BEb3duXG4gICAgKTtcbiAgfVxuXG4gIGlmIChlLmNvZGUgPT09ICdBcnJvd1VwJykge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIC8vIFdlIGFsd2F5cyB3YW50IHRvIHByZXZlbnQgdGhlIGRlZmF1bHQuIFdlIG9ubHkgd2FudCB0byBjaGFuZ2UgdGhlXG4gICAgLy8gaGlnaGxpZ2h0IGlmIG5vdCBvbiB0aGUgdG9wIHR5cGUgaW4gdGhlIGRyb3Bkb3duXG4gICAgaWYgKGkgPiAwKSB7XG4gICAgICBzZWFyY2hWaWV3LnJlbW92ZUN1cnJlbnRIaWdobGlnaHQoKTtcbiAgICAgIHNlYXJjaFZpZXcuaGlnaGxpZ2h0VHlwZSh0eXBlc1tpIC0gMV0pO1xuXG4gICAgICBzZWFyY2hWaWV3LnNldFNjcm9sbFRvcE9uVXBBcnJvdyhcbiAgICAgICAgdHlwZXNbaSAtIDFdLFxuICAgICAgICBlbGVtZW50cy5hcGlTZWFyY2gudHlwZURyb3BEb3duXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGlmIChlLmNvZGUgPT09ICdFbnRlcicpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgc2V0SW5wdXRWYWx1ZShcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taGlnaGxpZ2h0ZWQnKS5nZXRBdHRyaWJ1dGUoJ2RhdGEtdHlwZScpXG4gICAgKTtcbiAgICBoaWRlVHlwZXNEcm9wRG93bkJ1dEtlZXBWYWx1ZSgpO1xuICB9XG59O1xuXG5jb25zdCBzZXRJbnB1dFZhbHVlID0gKHR5cGUpID0+IHtcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktdHlwZS1saW5lJykudmFsdWUgPSB0eXBlO1xufTtcblxuZXhwb3J0IGNvbnN0IHR5cGVMaW5lTGlzdGVuZXIgPSAoZSkgPT4ge1xuICAvLyBJZiB0aGUgdGFyZ2V0IGlzIG5vdCBUeXBlIExpbmUgaW5wdXQgbGluZSwgb3IgYW4gZWxlbWVudCBpbiB0aGUgZHJvcGRvd24gbGlzdCxcbiAgLy8gY2xvc2UgdGhlIGRyb3Bkb3duIGFuZCByZW1vdmUgdGhlIGV2ZW50IGxpc3RlbmVyXG4gIGlmIChcbiAgICBlLnRhcmdldCAhPT0gZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVMaW5lICYmXG4gICAgIWUudGFyZ2V0Lm1hdGNoZXMoJy5qcy0tYXBpLWRyb3Bkb3duLXR5cGVzLWxpc3QnKVxuICApIHtcbiAgICBzZWFyY2hWaWV3LmhpZGVUeXBlc0Ryb3BEb3duKCk7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0eXBlTGluZUxpc3RlbmVyKTtcbiAgICAvLyBJZiB0aGUgdGFyZ2V0IGlzIG9uZSBpZiB0eXBlcywgZ2V0IHRoZSBkYXRhIHR5cGVcbiAgfSBlbHNlIGlmIChlLnRhcmdldC5oYXNBdHRyaWJ1dGUoJ2RhdGEtdHlwZScpKSB7XG4gICAgc2V0SW5wdXRWYWx1ZShlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdHlwZScpKTtcbiAgICBlbGVtZW50cy5hcGlTZWFyY2gudHlwZUxpbmUuZm9jdXMoKTtcbiAgICBoaWRlVHlwZXNEcm9wRG93bkJ1dEtlZXBWYWx1ZSgpO1xuICB9XG59O1xuXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKiogU0VUUyAqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG5cbmNvbnN0IGhpZGVTZXRzRHJvcERvd25CdXRLZWVwVmFsdWUgPSAoKSA9PiB7XG4gIGlmICghZWxlbWVudHMuYXBpU2VhcmNoLnNldERyb3BEb3duLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIHtcbiAgICBlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd24uc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBuYXZpZ2F0ZVNldHNEcm9wRG93bik7XG4gIH1cbn07XG5cbmNvbnN0IG5hdmlnYXRlU2V0c0Ryb3BEb3duID0gKGUpID0+IHtcbiAgY29uc3Qgc2V0cyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1zZXQ6bm90KFtoaWRkZW5dKScpKTtcbiAgY29uc3QgaSA9IHNldHMuaW5kZXhPZihkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWhpZ2hsaWdodGVkJykpO1xuXG4gIGlmIChlLmNvZGUgPT09ICdBcnJvd0Rvd24nICYmIGkgPCBzZXRzLmxlbmd0aCAtIDEpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgc2VhcmNoVmlldy5yZW1vdmVDdXJyZW50SGlnaGxpZ2h0KCk7XG4gICAgc2VhcmNoVmlldy5oaWdobGlnaHRTZXQoc2V0c1tpICsgMV0pO1xuXG4gICAgc2VhcmNoVmlldy5zZXRTY3JvbGxUb3BPbkRvd25BcnJvdyhcbiAgICAgIHNldHNbaSArIDFdLFxuICAgICAgZWxlbWVudHMuYXBpU2VhcmNoLnNldERyb3BEb3duXG4gICAgKTtcbiAgfVxuXG4gIGlmIChlLmNvZGUgPT09ICdBcnJvd1VwJyAmJiBpID4gMCkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBzZWFyY2hWaWV3LnJlbW92ZUN1cnJlbnRIaWdobGlnaHQoKTtcbiAgICBzZWFyY2hWaWV3LmhpZ2hsaWdodFNldChzZXRzW2kgLSAxXSk7XG5cbiAgICBzZWFyY2hWaWV3LnNldFNjcm9sbFRvcE9uVXBBcnJvdyhcbiAgICAgIHNldHNbaSAtIDFdLFxuICAgICAgZWxlbWVudHMuYXBpU2VhcmNoLnNldERyb3BEb3duXG4gICAgKTtcbiAgfVxuXG4gIGlmIChlLmNvZGUgPT09ICdFbnRlcicpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICBhZGRTZXQoXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWhpZ2hsaWdodGVkJykuZ2V0QXR0cmlidXRlKCdkYXRhLXNldC1uYW1lJylcbiAgICApO1xuXG4gICAgaGlkZVNldHNEcm9wRG93bkJ1dEtlZXBWYWx1ZSgpO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3Qgc3RhcnRTZXRzRHJvcERvd25OYXZpZ2F0aW9uID0gKCkgPT4ge1xuICBjb25zdCBmaXJzdFNldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tc2V0Om5vdChbaGlkZGVuXSknKTtcbiAgc2VhcmNoVmlldy5oaWdobGlnaHRTZXQoZmlyc3RTZXQpO1xuICBzZWFyY2hWaWV3LmhvdmVyT3ZlclNldHNMaXN0ZW5lcigpO1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgbmF2aWdhdGVTZXRzRHJvcERvd24pO1xuICBlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd24uc2Nyb2xsVG9wID0gMDtcbn07XG5cbmNvbnN0IGFkZFNldCA9IChzZXROYW1lKSA9PiB7XG4gIGVsZW1lbnRzLmFwaVNlYXJjaC5zZXRJbnB1dC52YWx1ZSA9IHNldE5hbWU7XG59O1xuXG5leHBvcnQgY29uc3Qgc2V0SW5wdXRMaXN0ZW5lciA9IChlKSA9PiB7XG4gIC8vIElmIHRoZSB0YXJnZXQgaXMgbm90IHRoZSBzZXQgaW5wdXQgZmllbGQsIG9yIGFuIGVsZW1lbnQgaW4gdGhlIGRyb3Bkb3duIGxpc3QsXG4gIC8vIGNsb3NlIHRoZSBkcm9wZG93biBhbmQgcmVtb3ZlIHRoZSBldmVudCBsaXN0ZW5lclxuICBpZiAoXG4gICAgZS50YXJnZXQgIT09IGVsZW1lbnRzLmFwaVNlYXJjaC5zZXRJbnB1dCAmJlxuICAgICFlLnRhcmdldC5tYXRjaGVzKCcuanMtLWFwaS1kcm9wZG93bi1zZXRzLWxpc3QnKVxuICApIHtcbiAgICBzZWFyY2hWaWV3LmhpZGVTZXRzRHJvcERvd24oKTtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHNldElucHV0TGlzdGVuZXIpO1xuICAgIC8vIElmIHRoZSB0YXJnZXQgaXMgb25lIG9mIHRoZSBzZXQgb3B0aW9ucywgdG9nZ2xlIGl0IGFzIHNlbGVjdGVkLCBhZGQgaXQgdG8gdGhlIGxpc3QsXG4gICAgLy8gYW5kIGhpZGUgdGhlIGRyb3Bkb3duLlxuICB9IGVsc2UgaWYgKGUudGFyZ2V0Lmhhc0F0dHJpYnV0ZSgnZGF0YS1zZXQtbmFtZScpKSB7XG4gICAgYWRkU2V0KGUudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1zZXQtbmFtZScpKTtcbiAgICBlbGVtZW50cy5hcGlTZWFyY2guc2V0SW5wdXQuZm9jdXMoKTtcbiAgICBoaWRlU2V0c0Ryb3BEb3duQnV0S2VlcFZhbHVlKCk7XG4gIH1cbn07XG4iLCJpbXBvcnQgeyBnZW5lcmF0ZU1hbmFDb3N0SW1hZ2VzIH0gZnJvbSAnLi9yZXN1bHRzVmlldyc7XG5pbXBvcnQgeyBjaGVja0xpc3RIb3ZlckV2ZW50cyB9IGZyb20gJy4vcmVzdWx0c1ZpZXcnO1xuXG5jb25zdCBzaG9ydGVuVHlwZUxpbmUgPSAoKSA9PiB7XG4gIGNvbnN0IHR5cGVzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWludi10eXBlcycpKTtcbiAgdHlwZXMuZm9yRWFjaCgodHlwZSkgPT4ge1xuICAgIGxldCBodG1sID0gdHlwZS5pbm5lckhUTUw7XG5cbiAgICAvLyBpZiB0aGUg4oCUIGRlbGltaXRlciBpcyBmb3VuZCBpbiB0aGUgc3RyaW5nLCByZXR1cm4gZXZlcnl0aGluZyBiZWZvcmUgdGhlIGRlbGltaXRlclxuICAgIGlmIChodG1sLmluZGV4T2YoJ+KAlCcpICE9PSAtMSkge1xuICAgICAgdHlwZS5pbm5lckhUTUwgPSBodG1sLnN1YnN0cmluZygwLCBodG1sLmluZGV4T2YoJ+KAlCcpIC0gMSk7XG4gICAgfVxuICB9KTtcbn07XG5cbmNvbnN0IGFsdGVyTWFuYUltYWdlcyA9ICgpID0+IHtcbiAgY29uc3QgbWFuYUNvc3RzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWludi1tYW5hLWNvc3QnKSk7XG5cbiAgbWFuYUNvc3RzLmZvckVhY2goKGNvc3QpID0+IHtcbiAgICBjb3N0LmlubmVySFRNTCA9IGdlbmVyYXRlTWFuYUNvc3RJbWFnZXMoY29zdC5pbm5lckhUTUwpO1xuICB9KTtcbn07XG5cbi8vIE5vdCB1c2luZyB0aGlzIHJpZ2h0IG5vdyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5jb25zdCBzb3J0VGFibGVBbHBoYWJldGljYWxseSA9ICgpID0+IHtcbiAgbGV0IHJvd3MgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tY2hlY2tsaXN0LXJvdycpKTtcbiAgY29uc3QgdGFibGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWNhcmQtY2hlY2tsaXN0Jyk7XG4gIGxldCBjYXJkcyA9IFtdO1xuXG4gIHJvd3MuZm9yRWFjaCgocm93KSA9PiB7XG4gICAgY2FyZHMucHVzaChyb3cucXVlcnlTZWxlY3RvcignLmpzLS1jaGVja2xpc3QtY2FyZC1uYW1lJykuaW5uZXJIVE1MKTtcbiAgICByb3cucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChyb3cpO1xuICB9KTtcblxuICBjYXJkcyA9IGNhcmRzLnNvcnQoKTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGNhcmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3Qgcm93SW5kZXggPSByb3dzLmluZGV4T2YoXG4gICAgICByb3dzLmZpbmQoKHJvdykgPT4gcm93LmdldEF0dHJpYnV0ZSgnZGF0YS1yb3cnKSA9PT0gY2FyZHNbaV0pXG4gICAgKTtcblxuICAgIHRhYmxlLmluc2VydEFkamFjZW50RWxlbWVudCgnYmVmb3JlZW5kJywgcm93c1tyb3dJbmRleF0pO1xuXG4gICAgcm93cy5zcGxpY2Uocm93SW5kZXgsIDEpO1xuICB9XG59O1xuXG5jb25zdCBnaXZlRWFybmluZ3NDb2x1bW5Nb2RpZmllciA9ICgpID0+IHtcbiAgY29uc3Qgcm93cyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1pbnYtZWFybmluZ3MnKSk7XG4gIGNvbnNvbGUubG9nKHJvd3MpO1xuXG4gIHJvd3MuZm9yRWFjaCgocm93KSA9PiB7XG4gICAgaWYgKHJvdy5pbm5lclRleHQuc3RhcnRzV2l0aCgnLScpKSB7XG4gICAgICByb3cuY2xhc3NMaXN0LmFkZCgnbmVnYXRpdmUtZWFybmluZ3MnKTtcbiAgICB9IGVsc2UgaWYgKHJvdy5pbm5lclRleHQgPT09ICcwLjAnKSB7XG4gICAgICByb3cuY2xhc3NMaXN0LmFkZCgnbm8tZWFybmluZ3MnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcm93LmNsYXNzTGlzdC5hZGQoJ3Bvc2l0aXZlLWVhcm5pbmdzJyk7XG4gICAgfVxuICB9KTtcbn07XG5cbmNvbnN0IHJlbW92ZUhhc2hUYWdGcm9tUmFyaXR5ID0gKCkgPT4ge1xuICBjb25zdCByYXJpdHlzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLXJhcml0eScpKTtcbiAgcmFyaXR5cy5mb3JFYWNoKChyKSA9PiAoci5pbm5lclRleHQgPSByLmlubmVyVGV4dC5zdWJzdHJpbmcoMSkpKTtcbn07XG5cbmV4cG9ydCBjb25zdCBhbHRlckludmVudG9yeVRhYmxlID0gKCkgPT4ge1xuICBzaG9ydGVuVHlwZUxpbmUoKTtcbiAgYWx0ZXJNYW5hSW1hZ2VzKCk7XG4gIGNoZWNrTGlzdEhvdmVyRXZlbnRzKCk7XG4gIGdpdmVFYXJuaW5nc0NvbHVtbk1vZGlmaWVyKCk7XG4gIHJlbW92ZUhhc2hUYWdGcm9tUmFyaXR5KCk7XG59O1xuIiwiaW1wb3J0IHsgZWxlbWVudHMgfSBmcm9tICcuL2Jhc2UnO1xuXG5jb25zdCBjbGVhckNoZWNrbGlzdCA9ICgpID0+IHtcbiAgY29uc3QgY2hlY2tMaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1jYXJkLWNoZWNrbGlzdCcpO1xuICBpZiAoY2hlY2tMaXN0KSB7XG4gICAgY2hlY2tMaXN0LnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQoY2hlY2tMaXN0KTtcblxuICAgIC8vIFJlbW92ZSBhbnkgdG9vbCB0aXAgaW1hZ2VzIGlmIHVzZXIgd2FzIGhvdmVyaW5nXG4gICAgY29uc3QgdG9vbFRpcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50b29sdGlwJyk7XG4gICAgaWYgKHRvb2xUaXApIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQodG9vbFRpcCk7XG4gIH1cbn07XG5cbmNvbnN0IGNsZWFySW1hZ2VHcmlkID0gKCkgPT4ge1xuICBjb25zdCBncmlkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1pbWFnZS1ncmlkJyk7XG4gIGlmIChncmlkKSBncmlkLnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQoZ3JpZCk7XG59O1xuXG5jb25zdCBjbGVhclJlc3VsdHMgPSAoKSA9PiB7XG4gIGNsZWFyQ2hlY2tsaXN0KCk7XG4gIGNsZWFySW1hZ2VHcmlkKCk7XG59O1xuXG5jb25zdCBwcmVwSW1hZ2VDb250YWluZXIgPSAoKSA9PiB7XG4gIGNvbnN0IG1hcmt1cCA9IGBcbiAgICAgICAgPGRpdiBjbGFzcz1cImltYWdlLWdyaWQganMtLWltYWdlLWdyaWRcIj48L2Rpdj5cbiAgICBgO1xuICBlbGVtZW50cy5yZXN1bHRzUGFnZS5yZXN1bHRzQ29udGFpbmVyLmluc2VydEFkamFjZW50SFRNTCgnYmVmb3JlZW5kJywgbWFya3VwKTtcbn07XG5cbmNvbnN0IGdlbmVyYXRlU2luZ2xlU2lkZWRDYXJkID0gKGNhcmQpID0+IHtcbiAgY29uc3QgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGNvbnN0IGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuXG4gIGEuY2xhc3NMaXN0ID0gYGltYWdlLWdyaWRfX2xpbmsganMtLWltYWdlLWdyaWQtbGlua2A7XG4gIGEuaHJlZiA9IGAvY2FyZC8ke2NhcmQuc2V0fS8ke3BhcnNlQ2FyZE5hbWUoY2FyZC5uYW1lKX1gO1xuXG4gIGRpdi5jbGFzc0xpc3QgPSBgaW1hZ2UtZ3JpZF9fY29udGFpbmVyYDtcbiAgaW1nLnNyYyA9IGAke2NhcmQuaW1hZ2VfdXJpcy5ub3JtYWx9YDtcbiAgaW1nLmFsdCA9IGAke2NhcmQubmFtZX1gO1xuICBpbWcuY2xhc3NMaXN0ID0gYGltYWdlLWdyaWRfX2ltYWdlYDtcbiAgZGl2LmFwcGVuZENoaWxkKGltZyk7XG4gIGEuYXBwZW5kQ2hpbGQoZGl2KTtcblxuICBkb2N1bWVudFxuICAgIC5xdWVyeVNlbGVjdG9yKCcuanMtLWltYWdlLWdyaWQnKVxuICAgIC5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2JlZm9yZWVuZCcsIGEpO1xufTtcblxuY29uc3Qgc2hvd0JhY2tTaWRlID0gKGNhcmQpID0+IHtcbiAgY29uc3QgZnJvbnQgPSBjYXJkLnF1ZXJ5U2VsZWN0b3IoJy5qcy0taW1hZ2UtZ3JpZC1jYXJkLXNpZGUtZnJvbnQnKTtcbiAgY29uc3QgYmFjayA9IGNhcmQucXVlcnlTZWxlY3RvcignLmpzLS1pbWFnZS1ncmlkLWNhcmQtc2lkZS1iYWNrJyk7XG5cbiAgZnJvbnQuc3R5bGUudHJhbnNmb3JtID0gJ3JvdGF0ZVkoLTE4MGRlZyknO1xuICBiYWNrLnN0eWxlLnRyYW5zZm9ybSA9ICdyb3RhdGVZKDApJztcblxuICBmcm9udC5jbGFzc0xpc3QucmVtb3ZlKCdqcy0tc2hvd2luZycpO1xuICBiYWNrLmNsYXNzTGlzdC5hZGQoJ2pzLS1zaG93aW5nJyk7XG59O1xuXG5jb25zdCBzaG93RnJvbnRTaWRlID0gKGNhcmQpID0+IHtcbiAgY29uc3QgZnJvbnQgPSBjYXJkLnF1ZXJ5U2VsZWN0b3IoJy5qcy0taW1hZ2UtZ3JpZC1jYXJkLXNpZGUtZnJvbnQnKTtcbiAgY29uc3QgYmFjayA9IGNhcmQucXVlcnlTZWxlY3RvcignLmpzLS1pbWFnZS1ncmlkLWNhcmQtc2lkZS1iYWNrJyk7XG5cbiAgZnJvbnQuc3R5bGUudHJhbnNmb3JtID0gJ3JvdGF0ZVkoMCknO1xuICBiYWNrLnN0eWxlLnRyYW5zZm9ybSA9ICdyb3RhdGVZKDE4MGRlZyknO1xuXG4gIGZyb250LmNsYXNzTGlzdC5hZGQoJ2pzLS1zaG93aW5nJyk7XG4gIGJhY2suY2xhc3NMaXN0LnJlbW92ZSgnanMtLXNob3dpbmcnKTtcbn07XG5cbmNvbnN0IGZsaXBDYXJkID0gKGUpID0+IHtcbiAgLy8gUHJldmVudCB0aGUgbGluayBmcm9tIGdvaW5nIHRvIHRoZSBjYXJkIHNwZWNpZmljIHBhZ2VcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICBjb25zdCBjYXJkID0gZS50YXJnZXQucGFyZW50RWxlbWVudDtcblxuICBjb25zdCBmcm9udCA9IGNhcmQucXVlcnlTZWxlY3RvcignLmpzLS1pbWFnZS1ncmlkLWNhcmQtc2lkZS1mcm9udCcpO1xuXG4gIC8vIElmIHRoZSBmcm9udCBpcyBzaG93aW5nLCBkaXNwbGF5IHRoZSBiYWNrc2lkZS4gT3RoZXJ3aXNlLCBkaXNwbGF5IHRoZSBmcm9udFxuICBpZiAoZnJvbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdqcy0tc2hvd2luZycpKSBzaG93QmFja1NpZGUoY2FyZCk7XG4gIGVsc2Ugc2hvd0Zyb250U2lkZShjYXJkKTtcbn07XG5cbmNvbnN0IGdlbmVyYXRlRmxpcENhcmRCdG4gPSAoKSA9PiB7XG4gIGNvbnN0IGJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICBidG4uY2xhc3NMaXN0ID0gJ2ltYWdlLWdyaWRfX2RvdWJsZS1idG4ganMtLWltYWdlLWdyaWQtZmxpcC1jYXJkLWJ0bic7XG4gIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiBmbGlwQ2FyZChlKSk7XG5cbiAgcmV0dXJuIGJ0bjtcbn07XG5cbmNvbnN0IGdlbmVyYXRlRG91YmxlU2lkZWRDYXJkID0gKGNhcmQpID0+IHtcbiAgY29uc3QgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgY29uc3Qgb3V0ZXJEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgY29uc3QgaW5uZXJEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgY29uc3QgaW1nRnJvbnRTaWRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG4gIGNvbnN0IGltZ0JhY2tTaWRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG4gIGNvbnN0IGZsaXBDYXJkQnRuID0gZ2VuZXJhdGVGbGlwQ2FyZEJ0bigpO1xuXG4gIGEuY2xhc3NMaXN0ID0gYGltYWdlLWdyaWRfX2xpbmsganMtLWltYWdlLWdyaWQtbGlua2A7XG4gIGEuaHJlZiA9IGAvY2FyZC8ke2NhcmQuc2V0fS8ke3BhcnNlQ2FyZE5hbWUoY2FyZC5uYW1lKX1gO1xuXG4gIG91dGVyRGl2LmNsYXNzTGlzdCA9IGBpbWFnZS1ncmlkX19vdXRlci1kaXZgO1xuICBpbm5lckRpdi5jbGFzc0xpc3QgPSBgaW1hZ2UtZ3JpZF9faW5uZXItZGl2IGpzLS1pbm5lci1kaXYtJHtjYXJkLm5hbWV9YDtcblxuICBpbWdGcm9udFNpZGUuY2xhc3NMaXN0ID0gYGltYWdlLWdyaWRfX2RvdWJsZSBpbWFnZS1ncmlkX19kb3VibGUtLWZyb250IGpzLS1pbWFnZS1ncmlkLWNhcmQtc2lkZS1mcm9udCBqcy0tc2hvd2luZ2A7XG4gIGltZ0Zyb250U2lkZS5zcmMgPSBjYXJkLmNhcmRfZmFjZXNbMF0uaW1hZ2VfdXJpcy5ub3JtYWw7XG4gIGltZ0Zyb250U2lkZS5hbHQgPSBjYXJkLm5hbWU7XG5cbiAgaW1nQmFja1NpZGUuY2xhc3NMaXN0ID0gYGltYWdlLWdyaWRfX2RvdWJsZSBpbWFnZS1ncmlkX19kb3VibGUtLWJhY2sganMtLWltYWdlLWdyaWQtY2FyZC1zaWRlLWJhY2tgO1xuICBpbWdCYWNrU2lkZS5zcmMgPSBjYXJkLmNhcmRfZmFjZXNbMV0uaW1hZ2VfdXJpcy5ub3JtYWw7XG4gIGltZ0JhY2tTaWRlLmFsdCA9IGNhcmQuY2FyZF9mYWNlc1sxXS5uYW1lO1xuXG4gIGEuYXBwZW5kQ2hpbGQob3V0ZXJEaXYpO1xuICBvdXRlckRpdi5hcHBlbmRDaGlsZChpbm5lckRpdik7XG4gIGlubmVyRGl2LmFwcGVuZENoaWxkKGltZ0JhY2tTaWRlKTtcbiAgaW5uZXJEaXYuYXBwZW5kQ2hpbGQoaW1nRnJvbnRTaWRlKTtcbiAgaW5uZXJEaXYuYXBwZW5kQ2hpbGQoZmxpcENhcmRCdG4pO1xuXG4gIGRvY3VtZW50XG4gICAgLnF1ZXJ5U2VsZWN0b3IoJy5qcy0taW1hZ2UtZ3JpZCcpXG4gICAgLmluc2VydEFkamFjZW50RWxlbWVudCgnYmVmb3JlZW5kJywgYSk7XG59O1xuXG5jb25zdCBnZW5lcmF0ZUltYWdlR3JpZCA9IChjYXJkcykgPT4ge1xuICBjYXJkcy5mb3JFYWNoKChjYXJkKSA9PiB7XG4gICAgLy8gRm9yIHNpbmdsZSBzaWRlZCBjYXJkc1xuICAgIGlmIChjYXJkLmltYWdlX3VyaXMpIGdlbmVyYXRlU2luZ2xlU2lkZWRDYXJkKGNhcmQpO1xuICAgIC8vIERvdWJsZSBzaWRlZCBjYXJkc1xuICAgIGVsc2UgZ2VuZXJhdGVEb3VibGVTaWRlZENhcmQoY2FyZCk7XG4gIH0pO1xufTtcblxuLy8gRnVuY2l0b24gdG8gYmUgdXNlZCBpbiBpbmRleC5qcy4gVGFrZXMgY2FyZSBvZiBhbGwgbmVjZXNzYXJ5IHN0ZXBzIHRvIGRpc3BsYXkgY2FyZHMgYXMgYSBpbWFnZXNcbmV4cG9ydCBjb25zdCBkaXNwYWx5SW1hZ2VzID0gKGNhcmRzKSA9PiB7XG4gIGNsZWFyUmVzdWx0cygpO1xuICBwcmVwSW1hZ2VDb250YWluZXIoKTtcbiAgZ2VuZXJhdGVJbWFnZUdyaWQoY2FyZHMpO1xufTtcblxuY29uc3QgcHJlcENoZWNrbGlzdENvbnRhaW5lciA9ICgpID0+IHtcbiAgY29uc3QgbWFya3VwID0gYFxuICAgICAgICA8dGFibGUgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdCBqcy0tY2FyZC1jaGVja2xpc3RcIj5cbiAgICAgICAgICAgIDx0aGVhZD5cbiAgICAgICAgICAgICAgICA8dHIgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fcm93IGNhcmQtY2hlY2tsaXN0X19yb3ctLTcgY2FyZC1jaGVja2xpc3RfX3Jvdy0taGVhZGVyXCI+XG4gICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhXCI+U2V0PC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGFcIj5OYW1lPC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGFcIj5Db3N0PC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGFcIj5UeXBlPC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGFcIj5SYXJpdHk8L3RoPlxuICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YVwiPkFydGlzdDwvdGg+XG4gICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhXCI+UHJpY2U8L3RoPlxuICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICA8L3RoZWFkPlxuICAgICAgICAgICAgPHRib2R5IGNsYXNzPVwianMtLWNhcmQtY2hlY2tsaXN0LWJvZHlcIj48L3Rib2R5PlxuICAgICAgICA8L3RhYmxlPlxuICAgICAgICBgO1xuICBlbGVtZW50cy5yZXN1bHRzUGFnZS5yZXN1bHRzQ29udGFpbmVyLmluc2VydEFkamFjZW50SFRNTCgnYmVmb3JlZW5kJywgbWFya3VwKTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZW5lcmF0ZU1hbmFDb3N0SW1hZ2VzID0gKG1hbmFDb3N0LCBzaXplID0gJ3NtYWxsJykgPT4ge1xuICAvLyBJZiB0aGVyZSBpcyBubyBtYW5hIGNvc3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBjYXJkLCB0aGVuIHJldHVybiBhbiBlbXB0eSBzdHJpbmcgdG8gbGVhdmUgdGhlIHJvdyBlbXB0eVxuICBpZiAoIW1hbmFDb3N0KSByZXR1cm4gJyc7XG5cbiAgLy8gUmVndWxhciBleHByZXNzaW9ucyB0byBmaW5kIGVhY2ggc2V0IG9mIGN1cmx5IGJyYWNlcyB7fVxuICBsZXQgcmUgPSAvXFx7KC4qPylcXH0vZztcblxuICAvLyBQYXJzZSB0aGUgc3RyaW5ncyBhbmQgZ2V0IGFsbCBtYXRjaGVzXG4gIGxldCBtYXRjaGVzID0gbWFuYUNvc3QubWF0Y2gocmUpO1xuXG4gIC8vIElmIHRoZXJlIGFyZSBhbnkgbWF0Y2hlcywgbG9vcCB0aHJvdWdoIGFuZCByZXBsYWNlIGVhY2ggc2V0IG9mIGN1cmx5IGJyYWNlcyB3aXRoIHRoZVxuICAvLyBodG1sIHNwYW4gdGhhdCBjb3JyZXNwb25zIHRvIG1hbmEuY3NzIHRvIHJlbmRlciB0aGUgY29ycmVjdCBpbWFnZVxuICBpZiAobWF0Y2hlcykge1xuICAgIG1hdGNoZXMuZm9yRWFjaCgobSkgPT4ge1xuICAgICAgY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKGBcXHsoJHttLnNsaWNlKDEsIC0xKX0pXFx9YCwgJ2cnKTtcbiAgICAgIC8vIFRoaXMgd2lsbCBiZSB0aGUgc3RyaW5nIHVzZWQgdG8gZ2V0IHRoZSByaWdodCBjbGFzcyBmcm9tIG1hbmEuY3NzXG4gICAgICAvLyBXZSB3YW50IHRvIHRha2UgZXZlcnl0aGluZyBpbnNpZGUgdGhlIGJyYWNrZXRzLCBhbmQgaWYgdGhlcmUgaXMgYSAvXG4gICAgICAvLyByZW1vdmUgaXQuXG4gICAgICBjb25zdCBtYW5hSWNvblN0ciA9IG0uc2xpY2UoMSwgLTEpLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgnLycsICcnKTtcbiAgICAgIG1hbmFDb3N0ID0gbWFuYUNvc3QucmVwbGFjZShcbiAgICAgICAgcmVnZXgsXG4gICAgICAgIGA8c3BhbiBjbGFzcz1cIm1hbmEgJHtzaXplfSBzJHttYW5hSWNvblN0cn1cIj48L3NwYW4+YFxuICAgICAgKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBtYW5hQ29zdDtcbn07XG5cbmNvbnN0IHNob3J0ZW5UeXBlTGluZSA9ICh0eXBlKSA9PiB7XG4gIC8vIElmIG5vIHR5cGUgaXMgZ2l2ZW4sIHJldHVybiBhbiBlbXB0eSBzdHJpbmdcbiAgaWYgKCF0eXBlKSByZXR1cm4gJyc7XG5cbiAgLy8gaWYgdGhlIOKAlCBkZWxpbWl0ZXIgaXMgZm91bmQgaW4gdGhlIHN0cmluZywgcmV0dXJuIGV2ZXJ5dGhpbmcgYmVmb3JlIHRoZSBkZWxpbWl0ZXJcbiAgaWYgKHR5cGUuaW5kZXhPZign4oCUJykgIT09IC0xKSByZXR1cm4gdHlwZS5zdWJzdHJpbmcoMCwgdHlwZS5pbmRleE9mKCfigJQnKSAtIDEpO1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vIGRlbGltaXRlciwgcmV0dXJuIHRoZSB0eXBlIGFzIGdpdmVuIGluIHRoZSBjYXJkIG9iamVjdFxuICByZXR1cm4gdHlwZTtcbn07XG5cbmNvbnN0IHBhcnNlQ2FyZE5hbWUgPSAoY2FyZE5hbWUpID0+IHtcbiAgaWYgKGNhcmROYW1lLmluZGV4T2YoJy8nKSAhPT0gLTEpIHtcbiAgICByZXR1cm4gY2FyZE5hbWUuc2xpY2UoMCwgY2FyZE5hbWUuaW5kZXhPZignLycpIC0gMSkucmVwbGFjZUFsbCgnICcsICctJyk7XG4gIH1cblxuICByZXR1cm4gY2FyZE5hbWUucmVwbGFjZUFsbCgnICcsICctJyk7XG59O1xuXG5jb25zdCBnZW5lcmF0ZUNoZWNrbGlzdCA9IChjYXJkcykgPT4ge1xuICAvLyBDcmVhdGUgYSBuZXcgdGFibGUgcm93IGZvciBlYWNoIGNhcmQgb2JqZWN0XG4gIGNhcmRzLmZvckVhY2goKGNhcmQpID0+IHtcbiAgICBjb25zdCBjYXJkTmFtZUZvclVybCA9IHBhcnNlQ2FyZE5hbWUoY2FyZC5uYW1lKTtcblxuICAgIGNvbnN0IG1hcmt1cCA9IGBcbiAgICAgICAgICAgIDx0ciBjbGFzcz1cImpzLS1jaGVja2xpc3Qtcm93IGNhcmQtY2hlY2tsaXN0X19yb3cgY2FyZC1jaGVja2xpc3RfX3Jvdy0tNyBkYXRhLWNvbXBvbmVudD1cImNhcmQtdG9vbHRpcFwiIGRhdGEtY2FyZC1pbWc9JHtjaGVja0ZvckltZyhcbiAgICAgICAgICAgICAgY2FyZFxuICAgICAgICAgICAgKX0+XG4gICAgICAgICAgICAgICAgPHRkIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGEgY2FyZC1jaGVja2xpc3RfX2RhdGEtLXNldFwiPjxhIGhyZWY9XCIvY2FyZC8ke1xuICAgICAgICAgICAgICAgICAgY2FyZC5zZXRcbiAgICAgICAgICAgICAgICB9LyR7Y2FyZE5hbWVGb3JVcmx9XCIgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YS1saW5rIGNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmstLWNlbnRlclwiPiR7XG4gICAgICBjYXJkLnNldFxuICAgIH08L2E+PC90ZD5cbiAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YVwiPjxhIGhyZWY9XCIvY2FyZC8ke1xuICAgICAgICAgICAgICAgICAgY2FyZC5zZXRcbiAgICAgICAgICAgICAgICB9LyR7Y2FyZE5hbWVGb3JVcmx9XCIgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YS1saW5rIGNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmstLXN0YXJ0XCI+JHtcbiAgICAgIGNhcmQubmFtZVxuICAgIH08L2E+PC90ZD5cbiAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YVwiPjxhIGhyZWY9XCIvY2FyZC8ke1xuICAgICAgICAgICAgICAgICAgY2FyZC5zZXRcbiAgICAgICAgICAgICAgICB9LyR7Y2FyZE5hbWVGb3JVcmx9XCIgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YS1saW5rIGNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmstLWNlbnRlclwiPiR7Z2VuZXJhdGVNYW5hQ29zdEltYWdlcyhcbiAgICAgIGNoZWNrRm9yTWFuYUNvc3QoY2FyZClcbiAgICApfTwvYT48L3RkPlxuICAgICAgICAgICAgICAgIDx0ZCBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhXCI+PGEgaHJlZj1cIi9jYXJkLyR7XG4gICAgICAgICAgICAgICAgICBjYXJkLnNldFxuICAgICAgICAgICAgICAgIH0vJHtjYXJkTmFtZUZvclVybH1cIiBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmsgY2FyZC1jaGVja2xpc3RfX2RhdGEtbGluay0tY2VudGVyXCI+JHtzaG9ydGVuVHlwZUxpbmUoXG4gICAgICBjYXJkLnR5cGVfbGluZVxuICAgICl9PC9hPjwvdGQ+XG4gICAgICAgICAgICAgICAgPHRkIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGEgY2FyZC1jaGVja2xpc3RfX2RhdGEtLXJhcml0eVwiPjxhIGhyZWY9XCIvY2FyZC8ke1xuICAgICAgICAgICAgICAgICAgY2FyZC5zZXRcbiAgICAgICAgICAgICAgICB9LyR7Y2FyZE5hbWVGb3JVcmx9XCIgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YS1saW5rIGNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmstLWNlbnRlclwiPiR7XG4gICAgICBjYXJkLnJhcml0eVxuICAgIH08L2E+PC90ZD5cbiAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YVwiPjxhIGhyZWY9XCIvY2FyZC8ke1xuICAgICAgICAgICAgICAgICAgY2FyZC5zZXRcbiAgICAgICAgICAgICAgICB9LyR7Y2FyZE5hbWVGb3JVcmx9XCIgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YS1saW5rIGNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmstLWNlbnRlclwiPiR7XG4gICAgICBjYXJkLmFydGlzdFxuICAgIH08L2E+PC90ZD5cbiAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YVwiPjxhIGhyZWY9XCIvY2FyZC8ke1xuICAgICAgICAgICAgICAgICAgY2FyZC5zZXRcbiAgICAgICAgICAgICAgICB9LyR7Y2FyZE5hbWVGb3JVcmx9XCIgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YS1saW5rIGNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmstLWNlbnRlclwiPiR7XG4gICAgICBjYXJkLnByaWNlcy51c2RcbiAgICB9PC9hPjwvdGQ+XG4gICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgYDtcbiAgICAvLyBQdXQgdGhlIHJvdyBpbiB0aGUgdGFibGVcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tY2FyZC1jaGVja2xpc3QtYm9keScpXG4gICAgICAuaW5zZXJ0QWRqYWNlbnRIVE1MKCdiZWZvcmVlbmQnLCBtYXJrdXApO1xuICB9KTtcbn07XG5cbmNvbnN0IGNoZWNrRm9yTWFuYUNvc3QgPSAoY2FyZCkgPT4ge1xuICBpZiAoY2FyZC5tYW5hX2Nvc3QpIHtcbiAgICByZXR1cm4gY2FyZC5tYW5hX2Nvc3Q7XG4gIH0gZWxzZSBpZiAoY2FyZC5jYXJkX2ZhY2VzKSB7XG4gICAgcmV0dXJuIGNhcmQuY2FyZF9mYWNlc1swXS5tYW5hX2Nvc3Q7XG4gIH1cbn07XG5cbmNvbnN0IGNoZWNrRm9ySW1nID0gKGNhcmQpID0+IHtcbiAgaWYgKGNhcmQuaW1hZ2VfdXJpcykgcmV0dXJuIGNhcmQuaW1hZ2VfdXJpcy5ub3JtYWw7XG4gIC8vIElmIHRoZXJlIGlzIG5vIGNhcmQuaW1hZ2VfdXJpcywgdGhlbiBpdCdzIGEgZG91YmxlIHNpZGVkIGNhcmQuIEluIHRoaXNcbiAgLy8gY2FzZSB3ZSB3YW50IHRvIGRpc3BsYXkgdGhlIGltYWdlIGZyb20gZmFjZSBvbmUgb2YgdGhlIGNhcmQuXG4gIGVsc2UgcmV0dXJuIGNhcmQuY2FyZF9mYWNlc1swXS5pbWFnZV91cmlzLm5vcm1hbDtcbn07XG5cbi8vIENyZWF0ZSB0aGUgaG92ZXIgZWZmZWN0IG9uIGVhY2ggcm93IHRoYXQgZGlzcGxheXMgdGhlIGltYWdlIG9mIHRoZSBjYXJkXG5leHBvcnQgY29uc3QgY2hlY2tMaXN0SG92ZXJFdmVudHMgPSAoKSA9PiB7XG4gIC8vIEdldCB0aGUgSFRNTCBmb3IgZWFjaCB0YWJsZSByb3dcbiAgY29uc3Qgcm93cyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1jaGVja2xpc3Qtcm93JykpO1xuXG4gIHJvd3MuZm9yRWFjaCgocm93KSA9PiB7XG4gICAgcm93Lm9ubW91c2Vtb3ZlID0gKGUpID0+IHtcbiAgICAgIC8vIElmIHRoZSB3aW5kb3cgaXMgc21hbGxlciB0aGFuIDc2OCBwaXhlbHMsIGRvbid0IGRpc3BsYXkgYW55IGltYWdlc1xuICAgICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoIDwgNzY4KSByZXR1cm4gZmFsc2U7XG5cbiAgICAgIC8vIElmIHRoZXJlIGlzIGFscmVhZHkgYW4gaW1hZ2UgYmVpbmcgZGlzcGxheWVkLCByZW1vdmUgaXQgZnJvbSB0aGUgRE9NXG4gICAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRvb2x0aXAnKSkge1xuICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50b29sdGlwJykpO1xuICAgICAgfVxuXG4gICAgICAvLyBQcmVwIHRoZSBkaXYuXG4gICAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGRpdi5jbGFzc05hbWUgPSAndG9vbHRpcCc7XG5cbiAgICAgIC8vIFRoZSBkaXYgaXMgc3R5bGVkIHdpdGggcG9zaXRpb24gYWJzb2x1dGUuIFRoaXMgY29kZSBwdXRzIGl0IGp1c3QgdG8gdGhlIHJpZ2h0IG9mIHRoZSBjdXJzb3JcbiAgICAgIGRpdi5zdHlsZS5sZWZ0ID0gZS5wYWdlWCArIDUwICsgJ3B4JztcbiAgICAgIGRpdi5zdHlsZS50b3AgPSBlLnBhZ2VZIC0gMzAgKyAncHgnO1xuXG4gICAgICAvLyBQcmVwIHRoZSBpbWcgZWxlbWVudFxuICAgICAgY29uc3QgaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG4gICAgICBpbWcuY2xhc3NOYW1lID0gJ3Rvb2x0aXBfX2ltZyc7XG4gICAgICBpbWcuc3JjID0gcm93LmRhdGFzZXQuY2FyZEltZztcblxuICAgICAgLy8gUHV0IHRoZSBpbWcgaW50byB0aGUgZGl2IGFuZCB0aGVuIGFwcGVuZCB0aGUgZGl2IGRpcmVjdGx5IHRvIHRoZSBib2R5IG9mIHRoZSBkb2N1bWVudC5cbiAgICAgIGRpdi5hcHBlbmRDaGlsZChpbWcpO1xuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkaXYpO1xuICAgIH07XG5cbiAgICAvLyBSZW1vdmUgdGhlIGltZyB3aGVuIHRha2luZyB0aGUgY3Vyc29yIG9mZiB0aGUgcm93XG4gICAgcm93Lm9ubW91c2VvdXQgPSAoZSkgPT4ge1xuICAgICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50b29sdGlwJykpIHtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudG9vbHRpcCcpKTtcbiAgICAgIH1cbiAgICB9O1xuICB9KTtcbn07XG5cbi8vIEZ1bmNpdG9uIHRvIGJlIHVzZWQgaW4gaW5kZXguanMuIFRha2VzIGNhcmUgb2YgYWxsIG5lY2Vzc2FyeSBzdGVwcyB0byBkaXNwbGF5IGNhcmRzIGFzIGEgY2hlY2tsaXN0XG5leHBvcnQgY29uc3QgZGlzcGxheUNoZWNrbGlzdCA9IChjYXJkcykgPT4ge1xuICBjbGVhclJlc3VsdHMoKTtcbiAgcHJlcENoZWNrbGlzdENvbnRhaW5lcigpO1xuICBnZW5lcmF0ZUNoZWNrbGlzdChjYXJkcyk7XG4gIGNoZWNrTGlzdEhvdmVyRXZlbnRzKCk7XG59O1xuXG5leHBvcnQgY29uc3QgY2hvc2VTZWxlY3RNZW51U29ydCA9IChtZW51LCBzdGF0ZSkgPT4ge1xuICAvLyBDcmVhdGUgYW4gYXJyYXkgZnJvbSB0aGUgSFRNTCBzZWxlY3QgbWVudVxuICBjb25zdCBvcHRpb25zID0gQXJyYXkuZnJvbShtZW51KTtcblxuICBvcHRpb25zLmZvckVhY2goKG9wdGlvbiwgaSkgPT4ge1xuICAgIC8vIElmIHRoZSBvcHRpb24gdmFsdWUgbWF0Y2hlcyB0aGUgc29ydCBtZXRob2QgZnJvbSB0aGUgVVJMLCBzZXQgaXQgdG8gdGhlIHNlbGVjdGVkIGl0ZW1cbiAgICBpZiAob3B0aW9uLnZhbHVlID09PSBzdGF0ZS5zb3J0TWV0aG9kKSBtZW51LnNlbGVjdGVkSW5kZXggPSBpO1xuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBjaG9zZVNlbGVjdE1lbnVEaXNwbGF5ID0gKG1lbnUsIHN0YXRlKSA9PiB7XG4gIC8vIENyZWF0ZSBhbiBhcnJheSBmcm9tIHRoZSBIVE1MIHNlbGVjdCBtZW51XG4gIGNvbnN0IG9wdGlvbnMgPSBBcnJheS5mcm9tKG1lbnUpO1xuXG4gIG9wdGlvbnMuZm9yRWFjaCgob3B0aW9uLCBpKSA9PiB7XG4gICAgLy8gSWYgdGhlIG9wdGlvbiB2YWx1ZSBtYXRjaGVzIHRoZSBzb3J0IG1ldGhvZCBmcm9tIHRoZSBVUkwsIHNldCBpdCB0byB0aGUgc2VsZWN0ZWQgaXRlbVxuICAgIGlmIChvcHRpb24udmFsdWUgPT09IHN0YXRlLmRpc3BsYXkpIG1lbnUuc2VsZWN0ZWRJbmRleCA9IGk7XG4gIH0pO1xufTtcblxuLy8gRnVuY3Rpb24gdG8gY2hhbmdlIHRoZSBzb3J0IG1ldGhvZCBiYXNlZCBvbiB0aGUgaW5wdXQgZnJvbSB0aGUgdXNlclxuZXhwb3J0IGNvbnN0IGNoYW5nZVNvcnRNZXRob2QgPSAoc3RhdGUpID0+IHtcbiAgLy8gR2V0IHRoZSBjdXJyZW50IHNvcnQgbWV0aG9kIGZyb20gdGhlIGVuZCBvZiB0aGUgVVJMXG4gIGNvbnN0IGN1cnJlbnRTb3J0TWV0aG9kID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnN1YnN0cmluZyhcbiAgICB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUubGFzdEluZGV4T2YoJz0nKSArIDFcbiAgKTtcblxuICAvLyBHcmFiIHRoZSBkZXNpcmVkIHNvcnQgbWV0aG9kIGZyb20gdGhlIHVzZXJcbiAgY29uc3QgbmV3U29ydE1ldGhvZCA9IGVsZW1lbnRzLnJlc3VsdHNQYWdlLnNvcnRCeS52YWx1ZTtcblxuICAvLyBJZiB0aGUgbmV3IHNvcnQgbWV0aG9kIGlzIG5vdCBkaWZmZXJlbnQsIGV4aXQgdGhlIGZ1bmN0aW9uIGFzIHRvIG5vdCBwdXNoIGEgbmV3IHN0YXRlXG4gIGlmIChjdXJyZW50U29ydE1ldGhvZCA9PT0gbmV3U29ydE1ldGhvZCkge1xuICAgIHJldHVybjtcbiAgfSBlbHNlIHtcbiAgICAvLyBEaXNhYmxlIGFsbCBmb3VyIGJ1dHRvbnNcbiAgICAvLyBPbmx5IGRvaW5nIHRoaXMgYmVjYXVzZSBmaXJlZm94IHJlcXVpcmVzIGEgY3RybCBmNVxuICAgIGRpc2FibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UuZmlyc3RQYWdlQnRuKTtcbiAgICBkaXNhYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLm5leHRQYWdlQnRuKTtcbiAgICBkaXNhYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLnByZXZpb3VzUGFnZUJ0bik7XG4gICAgZGlzYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5sYXN0UGFnZUJ0bik7XG5cbiAgICBjb25zdCBjdXJyZW50UGF0aE5hbWUgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3Vic3RyaW5nKFxuICAgICAgMCxcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5sYXN0SW5kZXhPZignPScpICsgMVxuICAgICk7XG5cbiAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGN1cnJlbnRQYXRoTmFtZSArIG5ld1NvcnRNZXRob2Q7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBjaGFuZ2VEaXNwbGF5QW5kVXJsID0gKHN0YXRlKSA9PiB7XG4gIGNvbnN0IGN1cnJlbnRNZXRob2QgPSBzdGF0ZS5kaXNwbGF5O1xuICBjb25zdCBuZXdNZXRob2QgPSBlbGVtZW50cy5yZXN1bHRzUGFnZS5kaXNwbGF5U2VsZWN0b3IudmFsdWU7XG5cbiAgaWYgKG5ld01ldGhvZCA9PT0gY3VycmVudE1ldGhvZCkgcmV0dXJuO1xuXG4gIC8vIFVwZGF0ZSB0aGUgc3RhdGUgd2l0aCBuZXcgZGlzcGxheSBtZXRob2RcbiAgc3RhdGUuZGlzcGxheSA9IG5ld01ldGhvZDtcblxuICAvLyBVcGRhdGUgdGhlIHVybCB3aXRob3V0IHB1c2hpbmcgdG8gdGhlIHNlcnZlclxuICBjb25zdCB0aXRsZSA9IGRvY3VtZW50LnRpdGxlO1xuICBjb25zdCBwYXRoTmFtZSA9IGAvcmVzdWx0cy8ke25ld01ldGhvZH0vJHtzdGF0ZS5xdWVyeX1gO1xuICBoaXN0b3J5LnB1c2hTdGF0ZShcbiAgICB7XG4gICAgICBjdXJyZW50SW5kZXg6IHN0YXRlLmN1cnJlbnRJbmRleCxcbiAgICAgIGRpc3BsYXk6IHN0YXRlLmRpc3BsYXksXG4gICAgfSxcbiAgICB0aXRsZSxcbiAgICBwYXRoTmFtZVxuICApO1xufTtcblxuZXhwb3J0IGNvbnN0IHVwZGF0ZURpc3BsYXkgPSAoc3RhdGUpID0+IHtcbiAgLy8gQ2xlYXIgYW55IGV4aXN0aW5nIEhUTUwgaW4gdGhlIGRpc3BsYXlcbiAgY2xlYXJSZXN1bHRzKCk7XG5cbiAgLy8gUmVmcmVzaCB0aGUgZGlzcGxheVxuICBpZiAoc3RhdGUuZGlzcGxheSA9PT0gJ2xpc3QnKVxuICAgIGRpc3BsYXlDaGVja2xpc3Qoc3RhdGUuYWxsQ2FyZHNbc3RhdGUuY3VycmVudEluZGV4XSk7XG4gIGlmIChzdGF0ZS5kaXNwbGF5ID09PSAnaW1hZ2VzJylcbiAgICBkaXNwYWx5SW1hZ2VzKHN0YXRlLmFsbENhcmRzW3N0YXRlLmN1cnJlbnRJbmRleF0pO1xufTtcblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKiogUEFHSU5BVElPTiAqKioqKioqKioqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuXG4vLyBXaWxsIGJlIGNhbGxlZCBkdXJpbmcgY2hhbmdpbmcgcGFnZXMuIFJlbW92ZXMgdGhlIGN1cnJlbnQgZWxlbWVudCBpbiB0aGUgYmFyXG5jb25zdCBjbGVhckRpc3BsYXlCYXIgPSAoKSA9PiB7XG4gIGNvbnN0IGRpc3BsYXlCYXJUZXh0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1kaXNwbGF5LWJhci10ZXh0Jyk7XG4gIGlmIChkaXNwbGF5QmFyVGV4dCkgZGlzcGxheUJhclRleHQucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChkaXNwbGF5QmFyVGV4dCk7XG59O1xuXG4vLyBLZWVwcyB0cmFjayBvZiB3aGVyZSB0aGUgdXNlciBpcyBpbiB0aGVyZSBsaXN0IG9mIGNhcmRzXG5jb25zdCBwYWdpbmF0aW9uVHJhY2tlciA9IChzdGF0ZSkgPT4ge1xuICB2YXIgYmVnLCBlbmQ7XG4gIGJlZyA9IChzdGF0ZS5jdXJyZW50SW5kZXggKyAxKSAqIDE3NSAtIDE3NDtcbiAgZW5kID0gc3RhdGUuY3VycmVudEluZGV4ICogMTc1ICsgc3RhdGUuYWxsQ2FyZHNbc3RhdGUuY3VycmVudEluZGV4XS5sZW5ndGg7XG5cbiAgcmV0dXJuIHsgYmVnLCBlbmQgfTtcbn07XG5cbmV4cG9ydCBjb25zdCB1cGRhdGVEaXNwbGF5QmFyID0gKHN0YXRlKSA9PiB7XG4gIGNvbnN0IG1hcmt1cCA9IGBcbiAgICAgICAgPHAgY2xhc3M9XCJhcGktcmVzdWx0cy1kaXNwbGF5X19kaXNwbGF5LWJhci10ZXh0IGpzLS1kaXNwbGF5LWJhci10ZXh0XCI+XG4gICAgICAgICAgICBEaXNwbGF5aW5nICR7cGFnaW5hdGlvblRyYWNrZXIoc3RhdGUpLmJlZ30gLSAke1xuICAgIHBhZ2luYXRpb25UcmFja2VyKHN0YXRlKS5lbmRcbiAgfSBvZiAke3N0YXRlLnNlYXJjaC5yZXN1bHRzLnRvdGFsX2NhcmRzfSBjYXJkc1xuICAgICAgICA8L3A+XG4gICAgYDtcblxuICBjbGVhckRpc3BsYXlCYXIoKTtcbiAgZWxlbWVudHMucmVzdWx0c1BhZ2UuZGlzcGxheUJhci5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWVuZCcsIG1hcmt1cCk7XG59O1xuXG5leHBvcnQgY29uc3QgZW5hYmxlQnRuID0gKGJ0bikgPT4ge1xuICBpZiAoYnRuLmRpc2FibGVkKSB7XG4gICAgYnRuLmNsYXNzTGlzdC5yZW1vdmUoXG4gICAgICAnYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXBhZ2luYXRpb24tY29udGFpbmVyLS1kaXNhYmxlZCdcbiAgICApO1xuICAgIGJ0bi5kaXNhYmxlZCA9IGZhbHNlO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgZGlzYWJsZUJ0biA9IChidG4pID0+IHtcbiAgaWYgKCFidG4uZGlzYWJsZWQpIHtcbiAgICBidG4uY2xhc3NMaXN0LmFkZChcbiAgICAgICdhcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtcGFnaW5hdGlvbi1jb250YWluZXItLWRpc2FibGVkJ1xuICAgICk7XG4gICAgYnRuLmRpc2FibGVkID0gdHJ1ZTtcbiAgfVxufTtcblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKioqKioqKiogNDA0ICoqKioqKioqKioqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuXG5leHBvcnQgY29uc3QgZGlzcGxheTQwNCA9ICgpID0+IHtcbiAgY29uc3QgZGl2ID0gY3JlYXRlNDA0TWVzc2FnZSgpO1xuICBlbGVtZW50cy5yZXN1bHRzUGFnZS5yZXN1bHRzQ29udGFpbmVyLmFwcGVuZENoaWxkKGRpdik7XG59O1xuXG5jb25zdCBjcmVhdGU0MDREaXYgPSAoKSA9PiB7XG4gIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBkaXYuY2xhc3NMaXN0ID0gYG5vLXJlc3VsdHNgO1xuICByZXR1cm4gZGl2O1xufTtcblxuY29uc3QgY3JlYXRlNDA0aDMgPSAoKSA9PiB7XG4gIGNvbnN0IGgzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDMnKTtcbiAgaDMuY2xhc3NMaXN0ID0gYG5vLXJlc3VsdHNfX2gzYDtcbiAgaDMuaW5uZXJIVE1MID0gYE5vIGNhcmRzIGZvdW5kYDtcbiAgcmV0dXJuIGgzO1xufTtcblxuY29uc3QgY3JlYXRlNDA0cEVsZW1lbnQgPSAoKSA9PiB7XG4gIGNvbnN0IHAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XG4gIHAuY2xhc3NMaXN0ID0gYG5vLXJlc3VsdHNfX3BgO1xuICBwLmlubmVySFRNTCA9XG4gICAgXCJZb3VyIHNlYXJjaCBkaWRuJ3QgbWF0Y2ggYW55IGNhcmRzLiBHbyBiYWNrIHRvIHRoZSBzZWFyY2ggcGFnZSBhbmQgZWRpdCB5b3VyIHNlYXJjaFwiO1xuICByZXR1cm4gcDtcbn07XG5cbmNvbnN0IGNyZWF0ZTQwNEJ0biA9ICgpID0+IHtcbiAgY29uc3QgYnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICBidG4uY2xhc3NMaXN0ID0gYGJ0biBuby1yZXN1bHRzX19idG5gO1xuICBidG4uaHJlZiA9ICcvc2VhcmNoJztcbiAgYnRuLmlubmVySFRNTCA9ICdHbyBCYWNrJztcbiAgcmV0dXJuIGJ0bjtcbn07XG5cbmNvbnN0IGNyZWF0ZTQwNE1lc3NhZ2UgPSAoKSA9PiB7XG4gIGNvbnN0IGRpdiA9IGNyZWF0ZTQwNERpdigpO1xuICBjb25zdCBoMyA9IGNyZWF0ZTQwNGgzKCk7XG4gIGNvbnN0IHAgPSBjcmVhdGU0MDRwRWxlbWVudCgpO1xuICBjb25zdCBidG4gPSBjcmVhdGU0MDRCdG4oKTtcblxuICBkaXYuYXBwZW5kQ2hpbGQoaDMpO1xuICBkaXYuYXBwZW5kQ2hpbGQocCk7XG4gIGRpdi5hcHBlbmRDaGlsZChidG4pO1xuXG4gIHJldHVybiBkaXY7XG59O1xuIiwiaW1wb3J0IHsgZWxlbWVudHMgfSBmcm9tICcuL2Jhc2UnO1xuXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKiogVFlQRSBMSU5FICoqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG5cbmV4cG9ydCBjb25zdCBzaG93VHlwZXNEcm9wRG93biA9ICgpID0+IHtcbiAgaWYgKGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlRHJvcERvd24uaGFzQXR0cmlidXRlKCdoaWRkZW4nKSkge1xuICAgIGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlRHJvcERvd24ucmVtb3ZlQXR0cmlidXRlKCdoaWRkZW4nKTtcbiAgICBlbGVtZW50cy5hcGlTZWFyY2gudHlwZURyb3BEb3duLnNjcm9sbFRvcCA9IDA7XG4gICAgY29uc29sZS5sb2coJ3R5cGVzIGRyb3Bkb3duJyk7XG5cbiAgICAvLyBNYWtlIHN1cmUgdG8gZGlzcGxheSBhbGwgdHlwZXMgd2hlbiBvcGVuaW5nIHRoZSBkcm9wZG93biBhbmQgYmVmb3JlIHRha2luZyBpbnB1dFxuICAgIGZpbHRlclR5cGVzKCcnKTtcbiAgICBmaWx0ZXJTZWxlY3RlZFR5cGVzKCk7XG4gICAgZmlsdGVyVHlwZUhlYWRlcnMoKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGhpZGVUeXBlc0Ryb3BEb3duID0gKCkgPT4ge1xuICBpZiAoIWVsZW1lbnRzLmFwaVNlYXJjaC50eXBlRHJvcERvd24uaGFzQXR0cmlidXRlKCdoaWRkZW4nKSkge1xuICAgIGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlTGluZS52YWx1ZSA9ICcnO1xuICAgIGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlRHJvcERvd24uc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBuYXZpZ2F0ZVR5cGVzRHJvcERvd24pO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgZmlsdGVyVHlwZUhlYWRlcnMgPSAoKSA9PiB7XG4gIC8vIE9uIGV2ZXJ5IGlucHV0IGludG8gdGhlIHR5cGVsaW5lIGJhciwgbWFrZSBhbGwgaGVhZGVycyB2aXNpYmxlXG4gIGNvbnN0IGhlYWRlcnMgPSBBcnJheS5mcm9tKFxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tdHlwZXMtY2F0ZWdvcnktaGVhZGVyJylcbiAgKTtcbiAgaGVhZGVycy5mb3JFYWNoKChoZWFkZXIpID0+IHtcbiAgICBpZiAoaGVhZGVyLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIGhlYWRlci5yZW1vdmVBdHRyaWJ1dGUoJ2hpZGRlbicpO1xuICB9KTtcblxuICAvLyBGb3IgZWFjaCBjYXRlZ29yeSBvZiB0eXBlLCBpZiB0aGVyZSBhcmUgbm90IGFueSB2aXNpYmxlIGJlY2F1c2UgdGhleSB3ZXJlIGZpbHRlcmVkIG91dFxuICAvLyBoaWRlIHRoZSBoZWFkZXIgZm9yIHRoYXQgY2F0ZWdvcnlcbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWJhc2ljOm5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYmFzaWMtaGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXN1cGVyOm5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tc3VwZXItaGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFydGlmYWN0Om5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcignLmpzLS1hcnRpZmFjdC1oZWFkZXInKVxuICAgICAgLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgfVxuXG4gIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1lbmNoYW50bWVudDpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tZW5jaGFudG1lbnQtaGVhZGVyJylcbiAgICAgIC5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gIH1cblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tbGFuZDpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWxhbmQtaGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXNwZWxsOm5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tc3BlbGwtaGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXBsYW5lc3dhbGtlcjpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tcGxhbmVzd2Fsa2VyLWhlYWRlcicpXG4gICAgICAuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWNyZWF0dXJlOm5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcignLmpzLS1jcmVhdHVyZS1oZWFkZXInKVxuICAgICAgLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGZpbHRlclNlbGVjdGVkVHlwZXMgPSAoKSA9PiB7XG4gIGNvbnN0IHR5cGVzID0gQXJyYXkuZnJvbShcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS10eXBlXVtkYXRhLXNlbGVjdGVkXScpXG4gICk7XG5cbiAgdHlwZXMuZm9yRWFjaCgodHlwZSkgPT4ge1xuICAgIGlmICh0eXBlLmdldEF0dHJpYnV0ZSgnZGF0YS1zZWxlY3RlZCcpID09PSAndHJ1ZScpIHtcbiAgICAgIGlmICghdHlwZS5oYXNBdHRyaWJ1dGUoJ2hpZGRlbicpKSB0eXBlLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICB9XG4gIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IGZpbHRlclR5cGVzID0gKHN0cikgPT4ge1xuICBjb25zdCB0eXBlcyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtdHlwZV0nKSk7XG5cbiAgLy8gUmVtb3ZlIHRoZSBoaWRkZW4gYXR0cmlidXRlIGlmIGl0IGV4aXN0cyBvbiBhbnkgZWxlbWVudCwgYW5kIHRoZW4gaGlkZSBhbnkgZWxlbWVudHNcbiAgLy8gdGhhdCBkb24ndCBpbmNsdWRlIHRoZSBzdHJpbmcgZ2l2ZW4gaW4gdGhlIGlucHV0IGZyb20gdGhlIHVzZXJcbiAgdHlwZXMuZm9yRWFjaCgodHlwZSkgPT4ge1xuICAgIGlmICh0eXBlLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIHR5cGUucmVtb3ZlQXR0cmlidXRlKCdoaWRkZW4nKTtcbiAgICBpZiAoXG4gICAgICAhdHlwZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtdHlwZScpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc3RyLnRvTG93ZXJDYXNlKCkpXG4gICAgKSB7XG4gICAgICB0eXBlLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICB9XG4gIH0pO1xuXG4gIGZpbHRlclNlbGVjdGVkVHlwZXMoKTtcbn07XG5cbmV4cG9ydCBjb25zdCBoaWdobGlnaHRUeXBlID0gKHR5cGUpID0+IHtcbiAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taGlnaGxpZ2h0ZWQnKSkgcmVtb3ZlQ3VycmVudEhpZ2hsaWdodCgpO1xuXG4gIGlmICh0eXBlKSB7XG4gICAgdHlwZS5jbGFzc0xpc3QuYWRkKFxuICAgICAgJ2pzLS1oaWdobGlnaHRlZCcsXG4gICAgICAnc2VhcmNoLWZvcm1fX2Ryb3Bkb3duLWxpc3Qtb3B0aW9uLS1oaWdobGlnaHRlZCdcbiAgICApO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgcmVtb3ZlQ3VycmVudEhpZ2hsaWdodCA9ICgpID0+IHtcbiAgZG9jdW1lbnRcbiAgICAucXVlcnlTZWxlY3RvcignLmpzLS1oaWdobGlnaHRlZCcpXG4gICAgLmNsYXNzTGlzdC5yZW1vdmUoXG4gICAgICAnanMtLWhpZ2hsaWdodGVkJyxcbiAgICAgICdzZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1vcHRpb24tLWhpZ2hsaWdodGVkJ1xuICAgICk7XG59O1xuXG5leHBvcnQgY29uc3Qgc2V0U2Nyb2xsVG9wT25Eb3duQXJyb3cgPSAoZWwsIGRyb3Bkb3duKSA9PiB7XG4gIGlmIChcbiAgICBlbC5vZmZzZXRUb3AgPiBkcm9wZG93bi5vZmZzZXRIZWlnaHQgLSBlbC5vZmZzZXRIZWlnaHQgJiZcbiAgICBkcm9wZG93bi5zY3JvbGxUb3AgKyBkcm9wZG93bi5vZmZzZXRIZWlnaHQgLSBlbC5vZmZzZXRIZWlnaHQgPCBlbC5vZmZzZXRUb3BcbiAgKSB7XG4gICAgZHJvcGRvd24uc2Nyb2xsVG9wID0gZWwub2Zmc2V0VG9wIC0gZHJvcGRvd24ub2Zmc2V0SGVpZ2h0ICsgZWwub2Zmc2V0SGVpZ2h0O1xuICB9XG59O1xuXG5leHBvcnQgY29uc3Qgc2V0U2Nyb2xsVG9wT25VcEFycm93ID0gKGVsLCBkcm9wZG93bikgPT4ge1xuICBpZiAoZWwub2Zmc2V0VG9wIDwgZHJvcGRvd24uc2Nyb2xsVG9wKSB7XG4gICAgZHJvcGRvd24uc2Nyb2xsVG9wID0gZWwub2Zmc2V0VG9wO1xuXG4gICAgLy8gMzAgaXMgdGhlIGhlaWdodCBvZiBjYXRlZ29yeSBoZWFkZXJzLiBJZiB0aGUgY2F0ZWdvcnkgaGVhZGVyIGlzXG4gICAgLy8gdGhlIG9ubHkgZWxlbWVudCBsZWZ0IHRoYXQgaXMgbm90IHJldmVhbGVkLCBzZXQgdGVoIHNjcm9sbCB0b3AgdG8gMFxuICAgIGlmIChkcm9wZG93bi5zY3JvbGxUb3AgPD0gMzApIGRyb3Bkb3duLnNjcm9sbFRvcCA9IDA7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBuYXZpZ2F0ZVR5cGVzRHJvcERvd24gPSAoZSkgPT4ge1xuICBjb25zdCB0eXBlcyA9IEFycmF5LmZyb20oXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS10eXBlOm5vdChbaGlkZGVuXSknKVxuICApO1xuICBjb25zdCBpID0gdHlwZXMuaW5kZXhPZihkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWhpZ2hsaWdodGVkJykpO1xuXG4gIGlmIChlLmNvZGUgPT09ICdBcnJvd0Rvd24nICYmIGkgPCB0eXBlcy5sZW5ndGggLSAxKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHJlbW92ZUN1cnJlbnRIaWdobGlnaHQoKTtcbiAgICBoaWdobGlnaHRUeXBlKHR5cGVzW2kgKyAxXSk7XG5cbiAgICBzZXRTY3JvbGxUb3BPbkRvd25BcnJvdyh0eXBlc1tpICsgMV0sIGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlRHJvcERvd24pO1xuICB9XG5cbiAgaWYgKGUuY29kZSA9PT0gJ0Fycm93VXAnKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgLy8gV2UgYWx3YXlzIHdhbnQgdG8gcHJldmVudCB0aGUgZGVmYXVsdC4gV2Ugb25seSB3YW50IHRvIGNoYW5nZSB0aGVcbiAgICAvLyBoaWdobGlnaHQgaWYgbm90IG9uIHRoZSB0b3AgdHlwZSBpbiB0aGUgZHJvcGRvd25cbiAgICBpZiAoaSA+IDApIHtcbiAgICAgIHJlbW92ZUN1cnJlbnRIaWdobGlnaHQoKTtcbiAgICAgIGhpZ2hsaWdodFR5cGUodHlwZXNbaSAtIDFdKTtcblxuICAgICAgc2V0U2Nyb2xsVG9wT25VcEFycm93KHR5cGVzW2kgLSAxXSwgZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVEcm9wRG93bik7XG4gICAgfVxuICB9XG5cbiAgaWYgKGUuY29kZSA9PT0gJ0VudGVyJykge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIHRvZ2dsZURhdGFTZWxlY3RlZChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWhpZ2hsaWdodGVkJykpO1xuICAgIGFkZFR5cGUoXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWhpZ2hsaWdodGVkJykuZ2V0QXR0cmlidXRlKCdkYXRhLXR5cGUnKVxuICAgICk7XG4gICAgaGlkZVR5cGVzRHJvcERvd24oKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGhvdmVyT3ZlclR5cGVzTGlzdGVuZXIgPSAoKSA9PiB7XG4gIGNvbnN0IHR5cGVzID0gQXJyYXkuZnJvbShcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLXR5cGU6bm90KFtoaWRkZW5dKScpXG4gICk7XG5cbiAgdHlwZXMuZm9yRWFjaCgodHlwZSkgPT4ge1xuICAgIHR5cGUuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsICgpID0+IGhpZ2hsaWdodFR5cGUodHlwZSkpO1xuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBzdGFydFR5cGVzRHJvcERvd25OYXZpZ2F0aW9uID0gKCkgPT4ge1xuICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgbmF2aWdhdGVUeXBlc0Ryb3BEb3duKTtcbiAgY29uc3QgZmlyc3RUeXBlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS10eXBlOm5vdChbaGlkZGVuXSknKTtcbiAgaGlnaGxpZ2h0VHlwZShmaXJzdFR5cGUpO1xuICBob3Zlck92ZXJUeXBlc0xpc3RlbmVyKCk7XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBuYXZpZ2F0ZVR5cGVzRHJvcERvd24pO1xuICBlbGVtZW50cy5hcGlTZWFyY2gudHlwZURyb3BEb3duLnNjcm9sbFRvcCA9IDA7XG59O1xuXG5jb25zdCByZW1vdmVUeXBlQnRuID0gKCkgPT4ge1xuICAvLyBTcGFuIHdpbGwgYWN0IGFzIHRoZSBidXR0b24gdG8gcmVtb3ZlIHR5cGVzIGZyb20gdGhlIFwic2VsZWN0ZWRcIiBsaXN0XG4gIGNvbnN0IGJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgYnRuLmNsYXNzTGlzdCA9XG4gICAgJ3NlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy1yZW1vdmUtYnRuIGpzLS1hcGktdHlwZXMtY2xvc2UtYnRuJztcbiAgYnRuLmlubmVySFRNTCA9ICd4JztcblxuICBidG4ub25jbGljayA9ICgpID0+IHtcbiAgICBjb25zdCB0eXBlTmFtZSA9IGJ0bi5uZXh0RWxlbWVudFNpYmxpbmcubmV4dEVsZW1lbnRTaWJsaW5nLmlubmVySFRNTDtcblxuICAgIGNvbnN0IHR5cGVUb1RvZ2dsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLXR5cGV8PSR7dHlwZU5hbWV9XWApO1xuXG4gICAgdG9nZ2xlRGF0YVNlbGVjdGVkKHR5cGVUb1RvZ2dsZSk7XG5cbiAgICBidG4ucGFyZW50RWxlbWVudC5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKGJ0bi5wYXJlbnRFbGVtZW50KTtcbiAgfTtcblxuICByZXR1cm4gYnRuO1xufTtcblxuY29uc3QgdHlwZVRvZ2dsZUJ0biA9ICgpID0+IHtcbiAgLy8gU3BhbiB3aWxsIGFjdCBhcyB0aGUgYnV0dG9uIHRvIHRvZ2dsZSB3aGV0aGVyIG9yIG5vdCBhIHR5cGUgaXMgaW5jbHVkZWQgb3IgZXhjbHVkZWQgZnJvbSB0aGUgc2VhcmNoXG4gIGNvbnN0IGJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgYnRuLmNsYXNzTGlzdCA9XG4gICAgJ3NlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy10b2dnbGVyIHNlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy10b2dnbGVyLS1pcyBqcy0tYXBpLXR5cGVzLXRvZ2dsZXInO1xuICBidG4uaW5uZXJIVE1MID0gJ0lTJztcblxuICAvKlxuICAgICAgICBUaGlzIHdpbGwgdG9nZ2xlIGJldHdlZW4gc2VhcmNoaW5nIGZvciBjYXJkcyB0aGF0IGluY2x1ZGUgdGhlIGdpdmVuIHR5cGUgYW5kIGV4Y2x1ZGUgdGhlIGdpdmVuIHR5cGUuXG4gICAgICAgIEl0IHdpbGwgbWFrZSBzdXJlIHRoYXQgdGhlIGFwcHJvcHJpYXRlIGRhdGEgdHlwZSBpcyBnaXZlbiB0byB0aGUgc3BhbiBlbGVtZW50IHRoYXQgY29udGFpbnMgdGhlIHR5cGVcbiAgICAgICAgU28gdGhhdCB0aGUgc2VhcmNoIGZ1bmN0aW9uYWxpdHkgY3JlYXRlcyB0aGUgYXBwcm9wcmlhdGUgcXVlcnkgc3RyaW5nXG5cbiAgICAqL1xuICBidG4ub25jbGljayA9ICgpID0+IHtcbiAgICBpZiAoYnRuLmlubmVySFRNTCA9PT0gJ0lTJykge1xuICAgICAgYnRuLmNsYXNzTGlzdCA9XG4gICAgICAgICdzZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlciBzZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlci0tbm90IGpzLS1hcGktdHlwZXMtdG9nZ2xlcic7XG4gICAgICBidG4ubmV4dEVsZW1lbnRTaWJsaW5nLnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS1pbmNsdWRlLXR5cGUnKTtcbiAgICAgIGJ0bi5uZXh0RWxlbWVudFNpYmxpbmcuc2V0QXR0cmlidXRlKFxuICAgICAgICAnZGF0YS1leGNsdWRlLXR5cGUnLFxuICAgICAgICBidG4ubmV4dEVsZW1lbnRTaWJsaW5nLmlubmVySFRNTFxuICAgICAgKTtcbiAgICAgIGJ0bi5pbm5lckhUTUwgPSAnTk9UJztcbiAgICB9IGVsc2Uge1xuICAgICAgYnRuLmNsYXNzTGlzdCA9XG4gICAgICAgICdzZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlciBzZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlci0taXMganMtLWFwaS10eXBlcy10b2dnbGVyJztcbiAgICAgIGJ0bi5uZXh0RWxlbWVudFNpYmxpbmcucmVtb3ZlQXR0cmlidXRlKCdkYXRhLWV4Y2x1ZGUtdHlwZScpO1xuICAgICAgYnRuLm5leHRFbGVtZW50U2libGluZy5zZXRBdHRyaWJ1dGUoXG4gICAgICAgICdkYXRhLWluY2x1ZGUtdHlwZScsXG4gICAgICAgIGJ0bi5uZXh0RWxlbWVudFNpYmxpbmcuaW5uZXJIVE1MXG4gICAgICApO1xuICAgICAgYnRuLmlubmVySFRNTCA9ICdJUyc7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBidG47XG59O1xuXG5leHBvcnQgY29uc3QgdG9nZ2xlRGF0YVNlbGVjdGVkID0gKHR5cGVPclNldCkgPT4ge1xuICBpZiAodHlwZU9yU2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1zZWxlY3RlZCcpID09PSAndHJ1ZScpIHtcbiAgICB0eXBlT3JTZXQuc2V0QXR0cmlidXRlKCdkYXRhLXNlbGVjdGVkJywgJ2ZhbHNlJyk7XG4gIH0gZWxzZSB7XG4gICAgdHlwZU9yU2V0LnNldEF0dHJpYnV0ZSgnZGF0YS1zZWxlY3RlZCcsICd0cnVlJyk7XG4gIH1cbn07XG5cbmNvbnN0IGFkZFR5cGUgPSAodHlwZSkgPT4ge1xuICAvLyBDcmVhdGUgdGhlIGVtcHR5IGxpIGVsZW1lbnQgdG8gaG9sZCB0aGUgdHlwZXMgdGhhdCB0aGUgdXNlciBzZWxlY3RzLiBTZXQgdGhlIGNsYXNzIGxpc3QsXG4gIC8vIGFuZCB0aGUgZGF0YS1zZWxlY3RlZCBhdHRyaWJ1dGUgdG8gdHJ1ZS5cbiAgY29uc3QgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuICBsaS5jbGFzc0xpc3QgPSAnc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLWxpc3QtaXRlbSBqcy0tYXBpLXNlbGVjdGVkLXR5cGUnO1xuXG4gIC8vIFRoZSB0eXBlU3BhbiBob2xkcyB0aGUgdHlwZSBzZWxlY3RlZCBieSB0aGUgdXNlciBmcm9tIHRoZSBkcm9wZG93bi4gVGhlIGRhdGEgYXR0cmlidXRlXG4gIC8vIGlzIHVzZWQgaW4gU2VhcmNoLmpzIHRvIGJ1aWxkIHRoZSBxdWVyeSBzdHJpbmdcbiAgY29uc3QgdHlwZVNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gIHR5cGVTcGFuLnNldEF0dHJpYnV0ZSgnZGF0YS1pbmNsdWRlLXR5cGUnLCB0eXBlKTtcbiAgdHlwZVNwYW4uaW5uZXJIVE1MID0gdHlwZTtcblxuICAvLyBDb25zdHJ1Y3QgdGhlIGxpIGVsZW1lbnQuIFRoZSByZW1vdmVUeXBlQnRuIGFuZCB0eXBlVG9nZ2xlQnRuIGZ1bmNpdG9ucyByZXR1cm4gaHRtbCBlbGVtZW50c1xuICBsaS5hcHBlbmRDaGlsZChyZW1vdmVUeXBlQnRuKCkpO1xuICBsaS5hcHBlbmRDaGlsZCh0eXBlVG9nZ2xlQnRuKCkpO1xuICBsaS5hcHBlbmRDaGlsZCh0eXBlU3Bhbik7XG5cbiAgZWxlbWVudHMuYXBpU2VhcmNoLnNlbGVjdGVkVHlwZXMuYXBwZW5kQ2hpbGQobGkpO1xufTtcblxuZXhwb3J0IGNvbnN0IHR5cGVMaW5lTGlzdGVuZXIgPSAoZSkgPT4ge1xuICAvLyBJZiB0aGUgdGFyZ2V0IGlzIG5vdCBUeXBlIExpbmUgaW5wdXQgbGluZSwgb3IgYW4gZWxlbWVudCBpbiB0aGUgZHJvcGRvd24gbGlzdCxcbiAgLy8gY2xvc2UgdGhlIGRyb3Bkb3duIGFuZCByZW1vdmUgdGhlIGV2ZW50IGxpc3RlbmVyXG4gIGlmIChcbiAgICBlLnRhcmdldCAhPT0gZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVMaW5lICYmXG4gICAgIWUudGFyZ2V0Lm1hdGNoZXMoJy5qcy0tYXBpLWRyb3Bkb3duLXR5cGVzLWxpc3QnKVxuICApIHtcbiAgICBoaWRlVHlwZXNEcm9wRG93bigpO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdHlwZUxpbmVMaXN0ZW5lcik7XG4gICAgLy8gSWYgdGhlIHRhcmdldCBpcyBvbmUgaWYgdHlwZXMsIGdldCB0aGUgZGF0YSB0eXBlXG4gIH0gZWxzZSBpZiAoZS50YXJnZXQuaGFzQXR0cmlidXRlKCdkYXRhLXR5cGUnKSkge1xuICAgIHRvZ2dsZURhdGFTZWxlY3RlZChlLnRhcmdldCk7XG4gICAgYWRkVHlwZShlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdHlwZScpKTtcbiAgICBlbGVtZW50cy5hcGlTZWFyY2gudHlwZUxpbmUuZm9jdXMoKTtcbiAgICBoaWRlVHlwZXNEcm9wRG93bigpO1xuICB9XG59O1xuXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKiogU0VUUyAqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG5cbmV4cG9ydCBjb25zdCBzaG93U2V0c0Ryb3BEb3duID0gKCkgPT4ge1xuICBpZiAoZWxlbWVudHMuYXBpU2VhcmNoLnNldERyb3BEb3duLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIHtcbiAgICBlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd24ucmVtb3ZlQXR0cmlidXRlKCdoaWRkZW4nKTtcbiAgICBlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd24uc2Nyb2xsVG9wID0gMDtcblxuICAgIGZpbHRlclNldHMoJycpO1xuICAgIGZpbHRlclNlbGVjdGVkU2V0cygpO1xuICAgIGZpbHRlclNldEhlYWRlcnMoKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGhpZGVTZXRzRHJvcERvd24gPSAoKSA9PiB7XG4gIGlmICghZWxlbWVudHMuYXBpU2VhcmNoLnNldERyb3BEb3duLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIHtcbiAgICBlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd24uc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIGVsZW1lbnRzLmFwaVNlYXJjaC5zZXRJbnB1dC52YWx1ZSA9ICcnO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBuYXZpZ2F0ZVNldHNEcm9wRG93bik7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBmaWx0ZXJTZXRIZWFkZXJzID0gKCkgPT4ge1xuICAvLyBPbiBldmVyeSBpbnB1dCBpbnRvIHRoZSB0eXBlbGluZSBiYXIsIG1ha2UgYWxsIGhlYWRlcnMgdmlzaWJsZVxuICBjb25zdCBoZWFkZXJzID0gQXJyYXkuZnJvbShcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLXNldHMtY2F0ZWdvcnktaGVhZGVyJylcbiAgKTtcbiAgaGVhZGVycy5mb3JFYWNoKChoZWFkZXIpID0+IHtcbiAgICBpZiAoaGVhZGVyLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIGhlYWRlci5yZW1vdmVBdHRyaWJ1dGUoJ2hpZGRlbicpO1xuICB9KTtcblxuICAvLyBGb3IgZWFjaCBjYXRlZ29yeSBvZiB0eXBlLCBpZiB0aGVyZSBhcmUgbm90IGFueSB2aXNpYmxlIGJlY2F1c2UgdGhleSB3ZXJlIGZpbHRlcmVkIG91dFxuICAvLyBoaWRlIHRoZSBoZWFkZXIgZm9yIHRoYXQgY2F0ZWdvcnlcbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWV4cGFuc2lvbjpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tZXhwYW5zaW9uLWhlYWRlcicpXG4gICAgICAuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWNvcmU6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1jb3JlLWhlYWRlcicpLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgfVxuXG4gIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1tYXN0ZXJzOm5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcignLmpzLS1tYXN0ZXJzLWhlYWRlcicpXG4gICAgICAuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWRyYWZ0Om5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tZHJhZnQtaGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWR1ZWxfZGVjazpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tZHVlbF9kZWNrLWhlYWRlcicpXG4gICAgICAuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFyY2hlbmVteTpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXJjaGVuZW15LWhlYWRlcicpXG4gICAgICAuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWJveDpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWJveC1oZWFkZXInKS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gIH1cblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tY29tbWFuZGVyOm5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcignLmpzLS1jb21tYW5kZXItaGVhZGVyJylcbiAgICAgIC5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gIH1cblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tdmF1bHQ6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS12YXVsdC1oZWFkZXInKS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gIH1cblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tZnVubnk6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1mdW5ueS1oZWFkZXInKS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gIH1cblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tbWFzdGVycGllY2U6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yKCcuanMtLW1hc3RlcnBpZWNlLWhlYWRlcicpXG4gICAgICAuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLW1lbW9yYWJpbGlhOm5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcignLmpzLS1tZW1vcmFiaWxpYS1oZWFkZXInKVxuICAgICAgLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgfVxuXG4gIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1wbGFuZWNoYXNlOm5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcignLmpzLS1wbGFuZWNoYXNlLWhlYWRlcicpXG4gICAgICAuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXByZW1pdW1fZGVjazpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tcHJlbWl1bV9kZWNrLWhlYWRlcicpXG4gICAgICAuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXByb21vOm5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tcHJvbW8taGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXNwZWxsYm9vazpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tc3BlbGxib29rLWhlYWRlcicpXG4gICAgICAuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXN0YXJ0ZXI6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yKCcuanMtLXN0YXJ0ZXItaGVhZGVyJylcbiAgICAgIC5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gIH1cblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tdG9rZW46bm90KFtoaWRkZW5dKScpKSB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS10b2tlbi1oZWFkZXInKS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gIH1cblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tdHJlYXN1cmVfY2hlc3Q6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yKCcuanMtLXRyZWFzdXJlX2NoZXN0LWhlYWRlcicpXG4gICAgICAuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXZhbmd1YXJkOm5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcignLmpzLS12YW5ndWFyZC1oZWFkZXInKVxuICAgICAgLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGZpbHRlclNldHMgPSAoc3RyKSA9PiB7XG4gIC8vIGdldCBhbGwgb2YgdGhlIHNldHMgb3V0IG9mIHRoZSBkcm9wZG93biBsaXN0XG4gIGNvbnN0IHNldHMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLXNldC1uYW1lXScpKTtcblxuICAvLyBSZW1vdmUgdGhlIGhpZGRlbiBhdHRyaWJ1dGUgaWYgaXQgZXhpc3RzIG9uIGFueSBlbGVtZW50LCBhbmQgdGhlbiBoaWRlIGFueSBlbGVtZW50c1xuICAvLyB0aGF0IGRvbid0IGluY2x1ZGUgdGhlIHN0cmluZyBnaXZlbiBpbiB0aGUgaW5wdXQgZnJvbSB0aGUgdXNlclxuICBzZXRzLmZvckVhY2goKHMpID0+IHtcbiAgICBpZiAocy5oYXNBdHRyaWJ1dGUoJ2hpZGRlbicpKSBzLnJlbW92ZUF0dHJpYnV0ZSgnaGlkZGVuJyk7XG5cbiAgICBmaWx0ZXJTZWxlY3RlZFNldHMoKTtcblxuICAgIGlmIChcbiAgICAgICFzXG4gICAgICAgIC5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2V0LW5hbWUnKVxuICAgICAgICAudG9Mb3dlckNhc2UoKVxuICAgICAgICAuaW5jbHVkZXMoc3RyLnRvTG93ZXJDYXNlKCkpICYmXG4gICAgICAhcy5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2V0LWNvZGUnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHN0ci50b0xvd2VyQ2FzZSgpKVxuICAgICkge1xuICAgICAgcy5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gICAgfVxuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBmaWx0ZXJTZWxlY3RlZFNldHMgPSAoKSA9PiB7XG4gIGNvbnN0IHNldHMgPSBBcnJheS5mcm9tKFxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLXNldC1uYW1lXVtkYXRhLXNlbGVjdGVkXScpXG4gICk7XG5cbiAgc2V0cy5mb3JFYWNoKChzKSA9PiB7XG4gICAgaWYgKHMuZ2V0QXR0cmlidXRlKCdkYXRhLXNlbGVjdGVkJykgPT09ICd0cnVlJykge1xuICAgICAgaWYgKCFzLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIHMuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5leHBvcnQgY29uc3QgaGlnaGxpZ2h0U2V0ID0gKHNldHQpID0+IHtcbiAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taGlnaGxpZ2h0ZWQnKSkgcmVtb3ZlQ3VycmVudEhpZ2hsaWdodCgpO1xuXG4gIGlmIChzZXR0KSB7XG4gICAgc2V0dC5jbGFzc0xpc3QuYWRkKFxuICAgICAgJ2pzLS1oaWdobGlnaHRlZCcsXG4gICAgICAnc2VhcmNoLWZvcm1fX2Ryb3Bkb3duLWxpc3Qtb3B0aW9uLS1oaWdobGlnaHRlZCdcbiAgICApO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgbmF2aWdhdGVTZXRzRHJvcERvd24gPSAoZSkgPT4ge1xuICBjb25zdCBzZXRzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLXNldDpub3QoW2hpZGRlbl0pJykpO1xuICBjb25zdCBpID0gc2V0cy5pbmRleE9mKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taGlnaGxpZ2h0ZWQnKSk7XG5cbiAgaWYgKGUuY29kZSA9PT0gJ0Fycm93RG93bicgJiYgaSA8IHNldHMubGVuZ3RoIC0gMSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICByZW1vdmVDdXJyZW50SGlnaGxpZ2h0KCk7XG4gICAgaGlnaGxpZ2h0U2V0KHNldHNbaSArIDFdKTtcblxuICAgIHNldFNjcm9sbFRvcE9uRG93bkFycm93KHNldHNbaSArIDFdLCBlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd24pO1xuICB9XG5cbiAgaWYgKGUuY29kZSA9PT0gJ0Fycm93VXAnICYmIGkgPiAwKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHJlbW92ZUN1cnJlbnRIaWdobGlnaHQoKTtcbiAgICBoaWdobGlnaHRTZXQoc2V0c1tpIC0gMV0pO1xuXG4gICAgc2V0U2Nyb2xsVG9wT25VcEFycm93KHNldHNbaSAtIDFdLCBlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd24pO1xuICB9XG5cbiAgaWYgKGUuY29kZSA9PT0gJ0VudGVyJykge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIHRvZ2dsZURhdGFTZWxlY3RlZChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWhpZ2hsaWdodGVkJykpO1xuICAgIGFkZFNldChcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taGlnaGxpZ2h0ZWQnKS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2V0LW5hbWUnKSxcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taGlnaGxpZ2h0ZWQnKS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2V0LWNvZGUnKVxuICAgICk7XG4gICAgaGlkZVNldHNEcm9wRG93bigpO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgaG92ZXJPdmVyU2V0c0xpc3RlbmVyID0gKCkgPT4ge1xuICBjb25zdCBzZXRzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLXNldDpub3QoW2hpZGRlbl0pJykpO1xuXG4gIHNldHMuZm9yRWFjaCgocykgPT4ge1xuICAgIHMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsICgpID0+IGhpZ2hsaWdodFR5cGUocykpO1xuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBzdGFydFNldHNEcm9wRG93bk5hdmlnYXRpb24gPSAoKSA9PiB7XG4gIGNvbnN0IGZpcnN0U2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1zZXQ6bm90KFtoaWRkZW5dKScpO1xuICBoaWdobGlnaHRTZXQoZmlyc3RTZXQpO1xuICBob3Zlck92ZXJTZXRzTGlzdGVuZXIoKTtcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG5hdmlnYXRlU2V0c0Ryb3BEb3duKTtcbiAgZWxlbWVudHMuYXBpU2VhcmNoLnNldERyb3BEb3duLnNjcm9sbFRvcCA9IDA7XG59O1xuXG5jb25zdCByZW1vdmVTZXRCdG4gPSAoKSA9PiB7XG4gIC8vIFNwYW4gd2lsbCBhY3QgYXMgdGhlIGJ1dHRvbiB0byByZW1vdmUgc2V0cyBmcm9tIHRoZSBcInNlbGVjdGVkXCIgbGlzdFxuICBjb25zdCBidG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gIGJ0bi5jbGFzc0xpc3QgPVxuICAgICdzZWFyY2gtZm9ybV9fc2VsZWN0ZWQtc2V0cy1yZW1vdmUtYnRuIGpzLS1hcGktc2V0cy1jbG9zZS1idG4nO1xuICBidG4uaW5uZXJIVE1MID0gJ3gnO1xuXG4gIGJ0bi5vbmNsaWNrID0gKCkgPT4ge1xuICAgIGNvbnN0IHNldE5hbWUgPSBidG4ubmV4dEVsZW1lbnRTaWJsaW5nLmlubmVySFRNTDtcbiAgICBjb25zdCBzZXRUb1RvZ2dsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLXNldC1uYW1lfD0ke3NldE5hbWV9XWApO1xuICAgIHRvZ2dsZURhdGFTZWxlY3RlZChzZXRUb1RvZ2dsZSk7XG5cbiAgICBidG4ucGFyZW50RWxlbWVudC5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKGJ0bi5wYXJlbnRFbGVtZW50KTtcbiAgfTtcblxuICByZXR1cm4gYnRuO1xufTtcblxuY29uc3QgYWRkU2V0ID0gKHNldE5hbWUsIHNldENvZGUpID0+IHtcbiAgLy8gQ3JlYXRlIHRoZSBlbXB0eSBsaSBlbGVtZW50IHRvIGhvbGQgdGhlIHR5cGVzIHRoYXQgdGhlIHVzZXIgc2VsZWN0cy4gU2V0IHRoZSBjbGFzcyBsaXN0LFxuICAvLyBhbmQgdGhlIGRhdGEtc2VsZWN0ZWQgYXR0cmlidXRlIHRvIHRydWUuXG4gIGNvbnN0IGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgbGkuY2xhc3NMaXN0ID0gJ3NlYXJjaC1mb3JtX19zZWxlY3RlZC1zZXRzLWxpc3QtaXRlbSBqcy0tYXBpLXNlbGVjdGVkLXNldCc7XG5cbiAgLy8gVGhlIHR5cGVTcGFuIGhvbGRzIHRoZSB0eXBlIHNlbGVjdGVkIGJ5IHRoZSB1c2VyIGZyb20gdGhlIGRyb3Bkb3duLiBUaGUgZGF0YSBhdHRyaWJ1dGVcbiAgLy8gaXMgdXNlZCBpbiBTZWFyY2guanMgdG8gYnVpbGQgdGhlIHF1ZXJ5IHN0cmluZ1xuICBjb25zdCBzZXRTcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICBzZXRTcGFuLnNldEF0dHJpYnV0ZSgnZGF0YS1pbmNsdWRlLXNldCcsIHNldENvZGUpO1xuICBzZXRTcGFuLmlubmVySFRNTCA9IHNldE5hbWU7XG5cbiAgbGkuYXBwZW5kQ2hpbGQocmVtb3ZlU2V0QnRuKCkpO1xuICBsaS5hcHBlbmRDaGlsZChzZXRTcGFuKTtcblxuICBlbGVtZW50cy5hcGlTZWFyY2guc2VsZWN0ZWRTZXRzLmFwcGVuZENoaWxkKGxpKTtcbn07XG5cbmV4cG9ydCBjb25zdCBzZXRJbnB1dExpc3RlbmVyID0gKGUpID0+IHtcbiAgLy8gSWYgdGhlIHRhcmdldCBpcyBub3QgdGhlIHNldCBpbnB1dCBmaWVsZCwgb3IgYW4gZWxlbWVudCBpbiB0aGUgZHJvcGRvd24gbGlzdCxcbiAgLy8gY2xvc2UgdGhlIGRyb3Bkb3duIGFuZCByZW1vdmUgdGhlIGV2ZW50IGxpc3RlbmVyXG4gIGlmIChcbiAgICBlLnRhcmdldCAhPT0gZWxlbWVudHMuYXBpU2VhcmNoLnNldElucHV0ICYmXG4gICAgIWUudGFyZ2V0Lm1hdGNoZXMoJy5qcy0tYXBpLWRyb3Bkb3duLXNldHMtbGlzdCcpXG4gICkge1xuICAgIGhpZGVTZXRzRHJvcERvd24oKTtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHNldElucHV0TGlzdGVuZXIpO1xuICAgIC8vIElmIHRoZSB0YXJnZXQgaXMgb25lIG9mIHRoZSBzZXQgb3B0aW9ucywgdG9nZ2xlIGl0IGFzIHNlbGVjdGVkLCBhZGQgaXQgdG8gdGhlIGxpc3QsXG4gICAgLy8gYW5kIGhpZGUgdGhlIGRyb3Bkb3duLlxuICB9IGVsc2UgaWYgKGUudGFyZ2V0Lmhhc0F0dHJpYnV0ZSgnZGF0YS1zZXQtbmFtZScpKSB7XG4gICAgdG9nZ2xlRGF0YVNlbGVjdGVkKGUudGFyZ2V0KTtcbiAgICBhZGRTZXQoXG4gICAgICBlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2V0LW5hbWUnKSxcbiAgICAgIGUudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1zZXQtY29kZScpXG4gICAgKTtcbiAgICBlbGVtZW50cy5hcGlTZWFyY2guc2V0SW5wdXQuZm9jdXMoKTtcbiAgICBoaWRlU2V0c0Ryb3BEb3duKCk7XG4gIH1cbn07XG5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKioqIFNUQVRTICoqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcblxuZXhwb3J0IGNvbnN0IHN0YXRMaW5lQ29udHJvbGxlciA9ICgpID0+IHtcbiAgaWYgKGNoZWNrU3RhdExpbmVGb3JJbnRlZ2VyKCkgJiYgY2hlY2tGb3JMZXNzVGhhbkZvdXJTdGF0TGluZXMoKSkge1xuICAgIGNvbnN0IGNsb25lID0gY3JlYXRlU3RhdHNDbG9uZSgpO1xuICAgIGVkaXRTdGF0c0Nsb25lKGNsb25lKTtcbiAgICBpbnNlcnRTdGF0c0Nsb25lKGNsb25lKTtcbiAgICByZXNldFN0YXRMaW5lRXZlbnRMaXN0ZW5lcigpO1xuICB9XG59O1xuXG5jb25zdCBjaGVja1N0YXRMaW5lRm9ySW50ZWdlciA9ICgpID0+IHtcbiAgY29uc3Qgc3RhdFZhbCA9IEFycmF5LmZyb20oXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1hcGktc3RhdC12YWx1ZScpXG4gICkuc2xpY2UoLTEpWzBdO1xuXG4gIHJldHVybiBwYXJzZUludChzdGF0VmFsLnZhbHVlKSA+PSAwID8gdHJ1ZSA6IGZhbHNlO1xufTtcblxuY29uc3QgY2hlY2tGb3JMZXNzVGhhbkZvdXJTdGF0TGluZXMgPSAoKSA9PiB7XG4gIGNvbnN0IHN0YXRzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWFwaS1zdGF0LXZhbHVlJykpO1xuXG4gIHJldHVybiBzdGF0cy5sZW5ndGggPCA0ID8gdHJ1ZSA6IGZhbHNlO1xufTtcblxuY29uc3QgY3JlYXRlU3RhdHNDbG9uZSA9ICgpID0+IHtcbiAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXN0YXRzLXdyYXBwZXInKS5jbG9uZU5vZGUodHJ1ZSk7XG59O1xuXG5jb25zdCBlZGl0U3RhdHNDbG9uZSA9IChjbG9uZSkgPT4ge1xuICBjbG9uZS5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1zdGF0JykudmFsdWUgPSAnJztcbiAgY2xvbmUucXVlcnlTZWxlY3RvcignLmpzLS1hcGktc3RhdC1maWx0ZXInKS52YWx1ZSA9ICcnO1xuICBjbG9uZS5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1zdGF0LXZhbHVlJykudmFsdWUgPSAnJztcbn07XG5cbmNvbnN0IGluc2VydFN0YXRzQ2xvbmUgPSAoY2xvbmUpID0+IHtcbiAgY29uc3QgbGFzdFN0YXRMaW5lID0gQXJyYXkuZnJvbShcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWFwaS1zdGF0cy13cmFwcGVyJylcbiAgKS5zbGljZSgtMSlbMF07XG5cbiAgbGFzdFN0YXRMaW5lLmluc2VydEFkamFjZW50RWxlbWVudCgnYWZ0ZXJlbmQnLCBjbG9uZSk7XG59O1xuXG5jb25zdCByZXNldFN0YXRMaW5lRXZlbnRMaXN0ZW5lciA9ICgpID0+IHtcbiAgY29uc3Qgc3RhdFZhbHVlcyA9IEFycmF5LmZyb20oXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1hcGktc3RhdC12YWx1ZScpXG4gICk7XG4gIHN0YXRWYWx1ZXMuc2xpY2UoLTIpWzBdLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2lucHV0Jywgc3RhdExpbmVDb250cm9sbGVyKTtcbiAgc3RhdFZhbHVlcy5zbGljZSgtMSlbMF0uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCBzdGF0TGluZUNvbnRyb2xsZXIpO1xufTtcblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKiogTEVHQUwgU1RBVFVTICoqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuXG5leHBvcnQgY29uc3QgZm9ybWF0TGluZUNvbnRyb2xsZXIgPSAoKSA9PiB7XG4gIGNvbnNvbGUubG9nKGNoZWNrRm9yRm91ckxlc3NUaGFuRm9ybWF0TGluZXMoKSk7XG4gIGlmIChjaGVja0ZvckZvdXJMZXNzVGhhbkZvcm1hdExpbmVzKCkgJiYgY2hlY2tGb3JtYXRMaW5lRm9yVmFsdWUoKSkge1xuICAgIGNvbnN0IGNsb25lID0gY3JlYXRlRm9ybWF0Q2xvbmUoKTtcbiAgICBlZGl0Rm9ybWF0Q2xvbmUoY2xvbmUpO1xuICAgIGluc2VydEZvcm1hdENsb25lKGNsb25lKTtcbiAgICByZXNldEZvcm1hdExpbmVFdmVudExpc3RlbmVyKCk7XG4gIH1cbn07XG5cbmNvbnN0IGNoZWNrRm9ybWF0TGluZUZvclZhbHVlID0gKCkgPT4ge1xuICBjb25zdCBmb3JtYXQgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tYXBpLWZvcm1hdCcpKS5zbGljZShcbiAgICAtMVxuICApWzBdO1xuXG4gIHJldHVybiBmb3JtYXQudmFsdWUgIT09ICcnID8gdHJ1ZSA6IGZhbHNlO1xufTtcblxuY29uc3QgY2hlY2tGb3JGb3VyTGVzc1RoYW5Gb3JtYXRMaW5lcyA9ICgpID0+IHtcbiAgY29uc3QgZm9ybWF0cyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1hcGktZm9ybWF0JykpO1xuICByZXR1cm4gZm9ybWF0cy5sZW5ndGggPCA0ID8gdHJ1ZSA6IGZhbHNlO1xufTtcblxuY29uc3QgY3JlYXRlRm9ybWF0Q2xvbmUgPSAoKSA9PiB7XG4gIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1mb3JtYXQtd3JhcHBlcicpLmNsb25lTm9kZSh0cnVlKTtcbn07XG5cbmNvbnN0IGVkaXRGb3JtYXRDbG9uZSA9IChjbG9uZSkgPT4ge1xuICBjbG9uZS5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1sZWdhbC1zdGF0dXMnKS52YWx1ZSA9ICcnO1xuICBjbG9uZS5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1mb3JtYXQnKS52YWx1ZSA9ICcnO1xufTtcblxuY29uc3QgaW5zZXJ0Rm9ybWF0Q2xvbmUgPSAoY2xvbmUpID0+IHtcbiAgY29uc3QgbGFzdEZvcm1hdExpbmUgPSBBcnJheS5mcm9tKFxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tYXBpLWZvcm1hdC13cmFwcGVyJylcbiAgKS5zbGljZSgtMSlbMF07XG5cbiAgbGFzdEZvcm1hdExpbmUuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdhZnRlcmVuZCcsIGNsb25lKTtcbn07XG5cbmNvbnN0IHJlc2V0Rm9ybWF0TGluZUV2ZW50TGlzdGVuZXIgPSAoKSA9PiB7XG4gIGNvbnN0IGZvcm1hdHMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tYXBpLWZvcm1hdCcpKTtcbiAgZm9ybWF0cy5zbGljZSgtMilbMF0ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZm9ybWF0TGluZUNvbnRyb2xsZXIpO1xuICBmb3JtYXRzLnNsaWNlKC0xKVswXS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmb3JtYXRMaW5lQ29udHJvbGxlcik7XG59O1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0aWYoX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSkge1xuXHRcdHJldHVybiBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0aWQ6IG1vZHVsZUlkLFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiBtb2R1bGVbJ2RlZmF1bHQnXSA6XG5cdFx0KCkgPT4gbW9kdWxlO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5nID0gKGZ1bmN0aW9uKCkge1xuXHRpZiAodHlwZW9mIGdsb2JhbFRoaXMgPT09ICdvYmplY3QnKSByZXR1cm4gZ2xvYmFsVGhpcztcblx0dHJ5IHtcblx0XHRyZXR1cm4gdGhpcyB8fCBuZXcgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JykgcmV0dXJuIHdpbmRvdztcblx0fVxufSkoKTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsInZhciBzY3JpcHRVcmw7XG5pZiAoX193ZWJwYWNrX3JlcXVpcmVfXy5nLmltcG9ydFNjcmlwdHMpIHNjcmlwdFVybCA9IF9fd2VicGFja19yZXF1aXJlX18uZy5sb2NhdGlvbiArIFwiXCI7XG52YXIgZG9jdW1lbnQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLmcuZG9jdW1lbnQ7XG5pZiAoIXNjcmlwdFVybCAmJiBkb2N1bWVudCkge1xuXHRpZiAoZG9jdW1lbnQuY3VycmVudFNjcmlwdClcblx0XHRzY3JpcHRVcmwgPSBkb2N1bWVudC5jdXJyZW50U2NyaXB0LnNyY1xuXHRpZiAoIXNjcmlwdFVybCkge1xuXHRcdHZhciBzY3JpcHRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJzY3JpcHRcIik7XG5cdFx0aWYoc2NyaXB0cy5sZW5ndGgpIHNjcmlwdFVybCA9IHNjcmlwdHNbc2NyaXB0cy5sZW5ndGggLSAxXS5zcmNcblx0fVxufVxuLy8gV2hlbiBzdXBwb3J0aW5nIGJyb3dzZXJzIHdoZXJlIGFuIGF1dG9tYXRpYyBwdWJsaWNQYXRoIGlzIG5vdCBzdXBwb3J0ZWQgeW91IG11c3Qgc3BlY2lmeSBhbiBvdXRwdXQucHVibGljUGF0aCBtYW51YWxseSB2aWEgY29uZmlndXJhdGlvblxuLy8gb3IgcGFzcyBhbiBlbXB0eSBzdHJpbmcgKFwiXCIpIGFuZCBzZXQgdGhlIF9fd2VicGFja19wdWJsaWNfcGF0aF9fIHZhcmlhYmxlIGZyb20geW91ciBjb2RlIHRvIHVzZSB5b3VyIG93biBsb2dpYy5cbmlmICghc2NyaXB0VXJsKSB0aHJvdyBuZXcgRXJyb3IoXCJBdXRvbWF0aWMgcHVibGljUGF0aCBpcyBub3Qgc3VwcG9ydGVkIGluIHRoaXMgYnJvd3NlclwiKTtcbnNjcmlwdFVybCA9IHNjcmlwdFVybC5yZXBsYWNlKC8jLiokLywgXCJcIikucmVwbGFjZSgvXFw/LiokLywgXCJcIikucmVwbGFjZSgvXFwvW15cXC9dKyQvLCBcIi9cIik7XG5fX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBzY3JpcHRVcmw7IiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGVcbl9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9qcy9pbmRleC5qc1wiKTtcbi8vIFRoaXMgZW50cnkgbW9kdWxlIHVzZWQgJ2V4cG9ydHMnIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbiJdLCJzb3VyY2VSb290IjoiIn0=