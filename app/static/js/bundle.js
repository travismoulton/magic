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
___CSS_LOADER_EXPORT___.push([module.id, "*,\n*::after,\n*::before {\n  margin: 0;\n  padding: 0;\n  box-sizing: inherit; }\n\nhtml {\n  font-size: 62.5%; }\n\nbody {\n  box-sizing: border-box;\n  overflow-x: hidden;\n  font-size: 1.6rem;\n  background-size: cover;\n  background-repeat: no-repeat;\n  height: 127.5rem;\n  font-family: 'Lato', sans-serif; }\n\n[hidden] {\n  display: none !important; }\n\n.heading-tertiary {\n  font-size: 2.4rem;\n  text-transform: uppercase; }\n  .heading-tertiary--white {\n    color: #fff; }\n\n.mb-10 {\n  margin-bottom: 1rem; }\n\n.mb-20 {\n  margin-bottom: 2rem; }\n\n.mt-50 {\n  margin-top: 5rem; }\n\n.btn, .btn:link, .btn:visited {\n  padding: .75rem 2rem;\n  border-radius: .5rem;\n  background-color: #f2f2f2;\n  font-weight: 400;\n  display: inline-block; }\n\n.btn:active, .btn:focus {\n  outline: none;\n  transform: translateY(-1px);\n  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.2); }\n\n.login-form__group:not(:last-child) {\n  margin-bottom: 2.5rem; }\n\n.login-form__label {\n  margin-right: .7rem;\n  color: #fff;\n  font-size: 1.8rem;\n  font-weight: 400; }\n\n.login-form__input {\n  background-color: #fff;\n  padding: .5rem 0;\n  border: none; }\n\n.login-form__btn-wrapper {\n  display: flex;\n  justify-content: center; }\n\n.login__register-text {\n  margin-top: 1.5rem;\n  color: #fff; }\n\n.login__register-link {\n  text-decoration: none;\n  color: #fff;\n  transition: all .2s; }\n  .login__register-link:hover {\n    color: #ff8000;\n    text-decoration: underline; }\n\n.nav {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 2rem 6rem;\n  background-color: #fff;\n  border-bottom: 1px solid #000; }\n  .nav__item {\n    list-style: none; }\n    .nav__item--search {\n      flex: 0 0 25%; }\n  .nav__link {\n    text-decoration: none;\n    color: #000;\n    transition: all .2s; }\n    .nav__link:hover {\n      margin-bottom: 2px;\n      color: #ffa64d;\n      border-bottom: 1px solid #ffa64d; }\n    .nav__link--home:hover .nav__icon-path--home {\n      fill: #ff8000; }\n  .nav__search {\n    display: flex;\n    justify-content: center;\n    align-items: center; }\n    .nav__search-input {\n      width: 90%;\n      border-radius: 3rem;\n      padding: 1rem 2rem;\n      border: 1px solid #bfbfbf;\n      background-color: #f2f2f2;\n      transition: width .2s; }\n      .nav__search-input:focus {\n        outline: none;\n        width: 120%; }\n  .nav__icon-sizing--home {\n    width: 3rem;\n    height: 3rem; }\n  .nav__icon-sizing--search {\n    width: 2rem;\n    height: 2rem;\n    transform: translateX(-150%); }\n  .nav__icon-path {\n    fill: #bfbfbf; }\n\n.register-form__group {\n  display: flex;\n  justify-content: space-between;\n  align-items: center; }\n  .register-form__group:not(:last-child) {\n    margin-bottom: 3rem; }\n\n.register-form__label {\n  margin-right: 4rem;\n  color: #fff;\n  font-size: 1.8rem;\n  font-weight: 400; }\n\n.register-form__input {\n  background-color: #f2f2f2;\n  padding: .5rem 0;\n  border: none; }\n\n.register-form__btn-wrapper {\n  display: flex;\n  justify-content: center; }\n\n.register__login-text {\n  margin-top: 1.5rem;\n  color: #fff; }\n\n.register__login-link {\n  text-decoration: none;\n  color: #fff;\n  transition: all .2s; }\n  .register__login-link:hover {\n    color: #ff8000;\n    text-decoration: underline; }\n\n.error {\n  margin-top: 2rem;\n  text-align: center;\n  background-color: #ff8080;\n  border-radius: 10px;\n  padding: 2rem;\n  font-size: 2rem;\n  grid-column: center-start / center-end;\n  font-weight: 700; }\n\n.search-form {\n  padding: 2rem 25rem; }\n  .search-form__group {\n    width: 75%;\n    display: flex;\n    margin-bottom: 3rem;\n    border-bottom: 1px solid #000;\n    align-items: flex-start;\n    padding: .5rem 4rem .5rem 0; }\n  .search-form__label {\n    flex: 0 0 20%;\n    display: flex;\n    align-items: flex-start;\n    margin-top: .7rem; }\n  .search-form__group-input-wrapper {\n    flex: 0 0 80%; }\n  .search-form__tip {\n    font-size: 1rem;\n    line-height: 1.4;\n    width: 70%; }\n  .search-form__input-text {\n    width: 40rem;\n    height: 4rem;\n    margin-bottom: 1rem;\n    padding: 1rem;\n    border: solid 1px #bfbfbf;\n    border-radius: 5px; }\n    .search-form__input-text:focus {\n      border: solid 1px #000; }\n  .search-form__group--checkbox {\n    display: flex;\n    margin-bottom: 1rem; }\n  .search-form__label--checkbox {\n    margin-right: 1rem; }\n  .search-form__input-checkbox {\n    width: 2.25rem;\n    height: 2.25rem;\n    margin-right: .8rem; }\n  .search-form__checkbox-wrapper {\n    display: flex;\n    align-items: center; }\n  .search-form__select-menu {\n    margin-bottom: 1rem; }\n  .search-form__svg-size {\n    height: 2rem;\n    width: 2rem;\n    margin-right: 1rem; }\n  .search-form__submit {\n    border-radius: 3px;\n    padding: .7rem;\n    border: 1px solid #b300b3; }\n  .search-form__dropdown-span {\n    display: flex;\n    flex-direction: column; }\n  .search-form__selected-types, .search-form__selected-sets {\n    display: flex;\n    flex-direction: column;\n    list-style: none;\n    margin-bottom: .3rem; }\n  .search-form__selected-types-list-item, .search-form__selected-sets-list-item {\n    display: flex;\n    margin-bottom: .7rem; }\n  .search-form__selected-types-remove-btn, .search-form__selected-sets-remove-btn {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    cursor: pointer;\n    height: 2rem;\n    width: 2rem;\n    font-size: 1.3rem;\n    background-color: #f2f2f2;\n    margin-right: .7rem; }\n  .search-form__selected-types-toggler {\n    height: 2rem;\n    width: 2.75rem;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    cursor: pointer;\n    font-size: 1.3rem;\n    margin-right: .7rem; }\n    .search-form__selected-types-toggler--is {\n      background-color: #47d147; }\n    .search-form__selected-types-toggler--not {\n      background-color: #ff0000; }\n  .search-form__dropdown {\n    position: absolute;\n    max-height: 28rem;\n    background-color: #fff;\n    z-index: 2;\n    top: 100%;\n    width: 40rem;\n    margin-top: -1rem;\n    overflow-y: auto;\n    border: 1px solid #000; }\n    .search-form__dropdown-list {\n      list-style: none; }\n      .search-form__dropdown-list-category {\n        padding: .5rem; }\n      .search-form__dropdown-list-option {\n        padding: .3rem 2rem;\n        display: flex;\n        align-items: center; }\n        .search-form__dropdown-list-option:hover {\n          cursor: pointer; }\n        .search-form__dropdown-list-option--highlighted {\n          background-color: #ccd8ff; }\n        .search-form__dropdown-list-option span {\n          text-transform: uppercase;\n          margin-left: 1rem; }\n      .search-form__dropdown-list-img {\n        width: 2rem;\n        height: 2rem;\n        margin-right: .7rem; }\n\n.dropdown-wrapper {\n  position: relative; }\n\n.api-results-display__nav {\n  background-color: #99b1ff;\n  width: 100%;\n  display: flex;\n  justify-content: space-between;\n  padding: 0 10%;\n  margin-bottom: .1rem; }\n  .api-results-display__nav-select {\n    color: #b300b3;\n    margin-right: 1rem; }\n  .api-results-display__nav-label {\n    color: #b300b3; }\n  .api-results-display__nav-right {\n    display: flex;\n    align-items: center; }\n  .api-results-display__nav-pagination-container {\n    display: flex;\n    align-items: center;\n    background-color: #ccd8ff;\n    cursor: pointer; }\n    .api-results-display__nav-pagination-container:not(:last-child) {\n      margin-right: 3rem; }\n    .api-results-display__nav-pagination-container--disabled {\n      cursor: not-allowed;\n      background-color: rgba(204, 216, 255, 0.4); }\n  .api-results-display__nav-svg-size {\n    height: 2rem;\n    width: 2rem; }\n\n.api-results-display__display-bar {\n  width: 100%;\n  border-bottom: 1px solid #bfbfbf;\n  padding-left: 10%;\n  margin-bottom: 2rem; }\n\n.card-checklist {\n  width: 80%;\n  justify-self: center; }\n  .card-checklist__row {\n    display: grid;\n    grid-template-columns: repeat(7, 1fr); }\n    .card-checklist__row--header {\n      border-bottom: 1px solid #000; }\n    .card-checklist__row--grey {\n      background-color: #f2f2f2; }\n  .card-checklist__data {\n    display: flex;\n    flex-wrap: nowrap;\n    justify-content: center;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    font-size: 1.4rem; }\n    .card-checklist__data--set {\n      text-transform: uppercase; }\n    .card-checklist__data--rarity {\n      text-transform: capitalize; }\n  .card-checklist__data-link {\n    padding: 1rem 0;\n    display: flex;\n    flex-wrap: nowrap;\n    align-items: center;\n    text-decoration: none;\n    width: 100%;\n    color: #000;\n    white-space: nowrap; }\n    .card-checklist__data-link--start {\n      justify-content: flex-start; }\n    .card-checklist__data-link--center {\n      justify-content: center; }\n\n.tooltip {\n  position: absolute;\n  z-index: 5;\n  width: 24rem;\n  height: 34rem; }\n  .tooltip__img {\n    width: 100%;\n    height: 100%; }\n\n.image-grid {\n  padding: 10rem 15rem;\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(25rem, 1fr));\n  grid-column-gap: 2rem;\n  grid-row-gap: 1rem; }\n  .image-grid__outer-div {\n    position: relative; }\n  .image-grid__inner-div {\n    perspective: 150rem;\n    height: 34rem;\n    width: 24rem; }\n  .image-grid__double {\n    height: 34rem;\n    width: 24rem;\n    position: absolute;\n    top: 0;\n    left: 0;\n    backface-visibility: hidden;\n    overflow: hidden;\n    transition: all .8s ease; }\n    .image-grid__double--back {\n      transform: rotateY(180deg); }\n  .image-grid__double-btn {\n    position: absolute;\n    top: 50%;\n    right: 15%;\n    width: 4rem;\n    height: 4rem;\n    border-radius: 50%;\n    background-color: rgba(255, 255, 255, 0.4); }\n  .image-grid__container {\n    width: 24rem;\n    height: 34rem; }\n  .image-grid__image {\n    width: 100%;\n    height: 100%; }\n\n.card {\n  display: flex;\n  grid-column: center-start / center-end;\n  margin-top: 3rem; }\n  .card__img-container {\n    margin-right: 10rem; }\n  .card__img {\n    width: 33rem;\n    height: 46rem; }\n  .card__img-left {\n    margin-right: 10rem;\n    width: 33rem;\n    display: flex;\n    flex-direction: column; }\n  .card__img-btn {\n    justify-self: flex-end;\n    align-self: flex-end;\n    margin-top: auto; }\n  .card__img-double-area {\n    position: relative; }\n  .card__img-double-sided {\n    perspective: 150rem;\n    height: 46rem; }\n  .card__img-double {\n    width: 33rem;\n    height: 46rem;\n    position: absolute;\n    top: 0;\n    left: 0;\n    backface-visibility: hidden;\n    overflow: hidden; }\n    .card__img-double--back {\n      transform: rotateY(180deg); }\n  .card__text {\n    background-color: #f4f4d7;\n    width: 34rem;\n    display: flex;\n    flex-direction: column;\n    padding: 1rem;\n    margin-right: 3rem; }\n    .card__text-flex {\n      margin-bottom: 1rem;\n      border-bottom: 1px solid #bfbfbf; }\n    .card__text-title {\n      display: flex;\n      align-items: center; }\n      .card__text-title-h3 {\n        font-size: 1.8rem;\n        font-weight: 400;\n        margin-right: 1rem; }\n    .card__text-color-indicator {\n      width: 1.3rem;\n      height: 1.3rem;\n      border: 1px solid #333;\n      border-radius: 50%;\n      box-shadow: 0px 0px 0px 2px rgba(0, 0, 0, 0.2);\n      margin-right: .7rem;\n      display: inline-block; }\n      .card__text-color-indicator--U {\n        background-color: rgba(128, 128, 255, 0.7); }\n      .card__text-color-indicator--B {\n        background-color: rgba(0, 0, 0, 0.7); }\n      .card__text-color-indicator--R {\n        background-color: rgba(255, 77, 77, 0.7); }\n      .card__text-color-indicator--W {\n        background-color: rgba(255, 255, 255, 0.7); }\n      .card__text-color-indicator--G {\n        background-color: rgba(0, 255, 0, 0.7); }\n    .card__text-oracle-p {\n      margin-bottom: 1rem;\n      font-size: 1.3rem; }\n    .card__text-oracle-flavor {\n      font-size: 1.3rem;\n      font-style: italic; }\n    .card__text-illustrator {\n      font-size: 1.2rem;\n      font-style: italic; }\n    .card__text-legal {\n      display: flex;\n      flex-direction: row;\n      justify-content: space-between; }\n      .card__text-legal-half {\n        display: flex;\n        flex-direction: column; }\n      .card__text-legal-span-container {\n        display: flex;\n        align-items: center; }\n        .card__text-legal-span-container:not(:last-child) {\n          margin-bottom: .5rem; }\n      .card__text-legal-span-box {\n        width: 6rem;\n        height: 2.5rem;\n        border: 1px solid #000;\n        margin-right: .3rem;\n        font-size: 1rem;\n        text-transform: uppercase;\n        display: flex;\n        justify-content: center;\n        align-items: center; }\n        .card__text-legal-span-box--not_legal {\n          background-color: #ff0000; }\n        .card__text-legal-span-box--legal {\n          background-color: #47d147; }\n  .card__set {\n    display: flex;\n    flex-direction: column; }\n    .card__set-banner {\n      display: flex;\n      border: 1px solid #bfbfbf;\n      width: 40rem;\n      background-color: #000;\n      color: #fff; }\n      .card__set-banner-svg-container {\n        margin-right: 1rem; }\n      .card__set-banner-svg {\n        width: 2.4rem;\n        height: 2.4rem;\n        filter: invert(100%); }\n    .card__set-details {\n      display: flex;\n      flex-direction: column; }\n    .card__set-header-name {\n      font-size: 1.7remrem; }\n    .card__set-header-code {\n      text-transform: uppercase; }\n    .card__set-prints-header {\n      display: flex;\n      justify-content: space-between;\n      background-color: #000;\n      color: #fff;\n      font-size: 1.3rem;\n      text-transform: uppercase;\n      border: 1px solid #bfbfbf;\n      padding: .3rem .7rem; }\n    .card__set-prints-svg-container {\n      height: 1.8rem;\n      width: 1.8rem;\n      border: 1px solid #bfbfbf;\n      display: flex;\n      justify-content: center;\n      align-items: center;\n      border-radius: 100%; }\n    .card__set-prints-svg--common {\n      fill: #000; }\n    .card__set-prints-svg--uncommon {\n      fill: #e6e6e6; }\n    .card__set-prints-svg--rare {\n      fill: #e6c300; }\n    .card__set-prints-svg--mythic {\n      fill: #ff0000; }\n    .card__set-prints-list {\n      list-style: none; }\n      .card__set-prints-list-link:link, .card__set-prints-list-link:visited {\n        text-decoration: none;\n        color: #000; }\n      .card__set-prints-list-item {\n        display: flex;\n        justify-content: space-between;\n        cursor: pointer; }\n        .card__set-prints-list-item:hover {\n          background-color: #f2f2f2; }\n      .card__set-prints-list-item-name-wrapper {\n        display: flex;\n        align-items: center;\n        margin-left: -1rem; }\n      .card__set-prints-list-item-set-name {\n        margin-left: .5rem; }\n      .card__set-prints-list-item-price {\n        margin-right: .7rem; }\n\n.no-results {\n  justify-self: center; }\n\n.container {\n  display: grid;\n  grid-template-columns: [full-start] minmax(6rem, 1fr) [center-start] repeat(8, [col-start] minmax(min-content, 14rem) [col-end]) [center-end] minmax(6rem, 1fr) [full-end]; }\n\n.login,\n.register {\n  margin-top: 5rem;\n  grid-column: center-start / center-end;\n  background-image: linear-gradient(to right bottom, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  height: 75vh;\n  background-size: cover;\n  background-position: center; }\n\n.search {\n  grid-column: full-start / full-end;\n  background-color: #fff; }\n\n.api-results-display {\n  grid-column: full-start / full-end;\n  background-color: #fff;\n  display: grid; }\n", "",{"version":3,"sources":["webpack://src/css/style.css"],"names":[],"mappings":"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","sourcesContent":["*,\n*::after,\n*::before {\n  margin: 0;\n  padding: 0;\n  box-sizing: inherit; }\n\nhtml {\n  font-size: 62.5%; }\n\nbody {\n  box-sizing: border-box;\n  overflow-x: hidden;\n  font-size: 1.6rem;\n  background-size: cover;\n  background-repeat: no-repeat;\n  height: 127.5rem;\n  font-family: 'Lato', sans-serif; }\n\n[hidden] {\n  display: none !important; }\n\n.heading-tertiary {\n  font-size: 2.4rem;\n  text-transform: uppercase; }\n  .heading-tertiary--white {\n    color: #fff; }\n\n.mb-10 {\n  margin-bottom: 1rem; }\n\n.mb-20 {\n  margin-bottom: 2rem; }\n\n.mt-50 {\n  margin-top: 5rem; }\n\n.btn, .btn:link, .btn:visited {\n  padding: .75rem 2rem;\n  border-radius: .5rem;\n  background-color: #f2f2f2;\n  font-weight: 400;\n  display: inline-block; }\n\n.btn:active, .btn:focus {\n  outline: none;\n  transform: translateY(-1px);\n  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.2); }\n\n.login-form__group:not(:last-child) {\n  margin-bottom: 2.5rem; }\n\n.login-form__label {\n  margin-right: .7rem;\n  color: #fff;\n  font-size: 1.8rem;\n  font-weight: 400; }\n\n.login-form__input {\n  background-color: #fff;\n  padding: .5rem 0;\n  border: none; }\n\n.login-form__btn-wrapper {\n  display: flex;\n  justify-content: center; }\n\n.login__register-text {\n  margin-top: 1.5rem;\n  color: #fff; }\n\n.login__register-link {\n  text-decoration: none;\n  color: #fff;\n  transition: all .2s; }\n  .login__register-link:hover {\n    color: #ff8000;\n    text-decoration: underline; }\n\n.nav {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 2rem 6rem;\n  background-color: #fff;\n  border-bottom: 1px solid #000; }\n  .nav__item {\n    list-style: none; }\n    .nav__item--search {\n      flex: 0 0 25%; }\n  .nav__link {\n    text-decoration: none;\n    color: #000;\n    transition: all .2s; }\n    .nav__link:hover {\n      margin-bottom: 2px;\n      color: #ffa64d;\n      border-bottom: 1px solid #ffa64d; }\n    .nav__link--home:hover .nav__icon-path--home {\n      fill: #ff8000; }\n  .nav__search {\n    display: flex;\n    justify-content: center;\n    align-items: center; }\n    .nav__search-input {\n      width: 90%;\n      border-radius: 3rem;\n      padding: 1rem 2rem;\n      border: 1px solid #bfbfbf;\n      background-color: #f2f2f2;\n      transition: width .2s; }\n      .nav__search-input:focus {\n        outline: none;\n        width: 120%; }\n  .nav__icon-sizing--home {\n    width: 3rem;\n    height: 3rem; }\n  .nav__icon-sizing--search {\n    width: 2rem;\n    height: 2rem;\n    transform: translateX(-150%); }\n  .nav__icon-path {\n    fill: #bfbfbf; }\n\n.register-form__group {\n  display: flex;\n  justify-content: space-between;\n  align-items: center; }\n  .register-form__group:not(:last-child) {\n    margin-bottom: 3rem; }\n\n.register-form__label {\n  margin-right: 4rem;\n  color: #fff;\n  font-size: 1.8rem;\n  font-weight: 400; }\n\n.register-form__input {\n  background-color: #f2f2f2;\n  padding: .5rem 0;\n  border: none; }\n\n.register-form__btn-wrapper {\n  display: flex;\n  justify-content: center; }\n\n.register__login-text {\n  margin-top: 1.5rem;\n  color: #fff; }\n\n.register__login-link {\n  text-decoration: none;\n  color: #fff;\n  transition: all .2s; }\n  .register__login-link:hover {\n    color: #ff8000;\n    text-decoration: underline; }\n\n.error {\n  margin-top: 2rem;\n  text-align: center;\n  background-color: #ff8080;\n  border-radius: 10px;\n  padding: 2rem;\n  font-size: 2rem;\n  grid-column: center-start / center-end;\n  font-weight: 700; }\n\n.search-form {\n  padding: 2rem 25rem; }\n  .search-form__group {\n    width: 75%;\n    display: flex;\n    margin-bottom: 3rem;\n    border-bottom: 1px solid #000;\n    align-items: flex-start;\n    padding: .5rem 4rem .5rem 0; }\n  .search-form__label {\n    flex: 0 0 20%;\n    display: flex;\n    align-items: flex-start;\n    margin-top: .7rem; }\n  .search-form__group-input-wrapper {\n    flex: 0 0 80%; }\n  .search-form__tip {\n    font-size: 1rem;\n    line-height: 1.4;\n    width: 70%; }\n  .search-form__input-text {\n    width: 40rem;\n    height: 4rem;\n    margin-bottom: 1rem;\n    padding: 1rem;\n    border: solid 1px #bfbfbf;\n    border-radius: 5px; }\n    .search-form__input-text:focus {\n      border: solid 1px #000; }\n  .search-form__group--checkbox {\n    display: flex;\n    margin-bottom: 1rem; }\n  .search-form__label--checkbox {\n    margin-right: 1rem; }\n  .search-form__input-checkbox {\n    width: 2.25rem;\n    height: 2.25rem;\n    margin-right: .8rem; }\n  .search-form__checkbox-wrapper {\n    display: flex;\n    align-items: center; }\n  .search-form__select-menu {\n    margin-bottom: 1rem; }\n  .search-form__svg-size {\n    height: 2rem;\n    width: 2rem;\n    margin-right: 1rem; }\n  .search-form__submit {\n    border-radius: 3px;\n    padding: .7rem;\n    border: 1px solid #b300b3; }\n  .search-form__dropdown-span {\n    display: flex;\n    flex-direction: column; }\n  .search-form__selected-types, .search-form__selected-sets {\n    display: flex;\n    flex-direction: column;\n    list-style: none;\n    margin-bottom: .3rem; }\n  .search-form__selected-types-list-item, .search-form__selected-sets-list-item {\n    display: flex;\n    margin-bottom: .7rem; }\n  .search-form__selected-types-remove-btn, .search-form__selected-sets-remove-btn {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    cursor: pointer;\n    height: 2rem;\n    width: 2rem;\n    font-size: 1.3rem;\n    background-color: #f2f2f2;\n    margin-right: .7rem; }\n  .search-form__selected-types-toggler {\n    height: 2rem;\n    width: 2.75rem;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    cursor: pointer;\n    font-size: 1.3rem;\n    margin-right: .7rem; }\n    .search-form__selected-types-toggler--is {\n      background-color: #47d147; }\n    .search-form__selected-types-toggler--not {\n      background-color: #ff0000; }\n  .search-form__dropdown {\n    position: absolute;\n    max-height: 28rem;\n    background-color: #fff;\n    z-index: 2;\n    top: 100%;\n    width: 40rem;\n    margin-top: -1rem;\n    overflow-y: auto;\n    border: 1px solid #000; }\n    .search-form__dropdown-list {\n      list-style: none; }\n      .search-form__dropdown-list-category {\n        padding: .5rem; }\n      .search-form__dropdown-list-option {\n        padding: .3rem 2rem;\n        display: flex;\n        align-items: center; }\n        .search-form__dropdown-list-option:hover {\n          cursor: pointer; }\n        .search-form__dropdown-list-option--highlighted {\n          background-color: #ccd8ff; }\n        .search-form__dropdown-list-option span {\n          text-transform: uppercase;\n          margin-left: 1rem; }\n      .search-form__dropdown-list-img {\n        width: 2rem;\n        height: 2rem;\n        margin-right: .7rem; }\n\n.dropdown-wrapper {\n  position: relative; }\n\n.api-results-display__nav {\n  background-color: #99b1ff;\n  width: 100%;\n  display: flex;\n  justify-content: space-between;\n  padding: 0 10%;\n  margin-bottom: .1rem; }\n  .api-results-display__nav-select {\n    color: #b300b3;\n    margin-right: 1rem; }\n  .api-results-display__nav-label {\n    color: #b300b3; }\n  .api-results-display__nav-right {\n    display: flex;\n    align-items: center; }\n  .api-results-display__nav-pagination-container {\n    display: flex;\n    align-items: center;\n    background-color: #ccd8ff;\n    cursor: pointer; }\n    .api-results-display__nav-pagination-container:not(:last-child) {\n      margin-right: 3rem; }\n    .api-results-display__nav-pagination-container--disabled {\n      cursor: not-allowed;\n      background-color: rgba(204, 216, 255, 0.4); }\n  .api-results-display__nav-svg-size {\n    height: 2rem;\n    width: 2rem; }\n\n.api-results-display__display-bar {\n  width: 100%;\n  border-bottom: 1px solid #bfbfbf;\n  padding-left: 10%;\n  margin-bottom: 2rem; }\n\n.card-checklist {\n  width: 80%;\n  justify-self: center; }\n  .card-checklist__row {\n    display: grid;\n    grid-template-columns: repeat(7, 1fr); }\n    .card-checklist__row--header {\n      border-bottom: 1px solid #000; }\n    .card-checklist__row--grey {\n      background-color: #f2f2f2; }\n  .card-checklist__data {\n    display: flex;\n    flex-wrap: nowrap;\n    justify-content: center;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    font-size: 1.4rem; }\n    .card-checklist__data--set {\n      text-transform: uppercase; }\n    .card-checklist__data--rarity {\n      text-transform: capitalize; }\n  .card-checklist__data-link {\n    padding: 1rem 0;\n    display: flex;\n    flex-wrap: nowrap;\n    align-items: center;\n    text-decoration: none;\n    width: 100%;\n    color: #000;\n    white-space: nowrap; }\n    .card-checklist__data-link--start {\n      justify-content: flex-start; }\n    .card-checklist__data-link--center {\n      justify-content: center; }\n\n.tooltip {\n  position: absolute;\n  z-index: 5;\n  width: 24rem;\n  height: 34rem; }\n  .tooltip__img {\n    width: 100%;\n    height: 100%; }\n\n.image-grid {\n  padding: 10rem 15rem;\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(25rem, 1fr));\n  grid-column-gap: 2rem;\n  grid-row-gap: 1rem; }\n  .image-grid__outer-div {\n    position: relative; }\n  .image-grid__inner-div {\n    perspective: 150rem;\n    height: 34rem;\n    width: 24rem; }\n  .image-grid__double {\n    height: 34rem;\n    width: 24rem;\n    position: absolute;\n    top: 0;\n    left: 0;\n    backface-visibility: hidden;\n    overflow: hidden;\n    transition: all .8s ease; }\n    .image-grid__double--back {\n      transform: rotateY(180deg); }\n  .image-grid__double-btn {\n    position: absolute;\n    top: 50%;\n    right: 15%;\n    width: 4rem;\n    height: 4rem;\n    border-radius: 50%;\n    background-color: rgba(255, 255, 255, 0.4); }\n  .image-grid__container {\n    width: 24rem;\n    height: 34rem; }\n  .image-grid__image {\n    width: 100%;\n    height: 100%; }\n\n.card {\n  display: flex;\n  grid-column: center-start / center-end;\n  margin-top: 3rem; }\n  .card__img-container {\n    margin-right: 10rem; }\n  .card__img {\n    width: 33rem;\n    height: 46rem; }\n  .card__img-left {\n    margin-right: 10rem;\n    width: 33rem;\n    display: flex;\n    flex-direction: column; }\n  .card__img-btn {\n    justify-self: flex-end;\n    align-self: flex-end;\n    margin-top: auto; }\n  .card__img-double-area {\n    position: relative; }\n  .card__img-double-sided {\n    perspective: 150rem;\n    height: 46rem; }\n  .card__img-double {\n    width: 33rem;\n    height: 46rem;\n    position: absolute;\n    top: 0;\n    left: 0;\n    backface-visibility: hidden;\n    overflow: hidden; }\n    .card__img-double--back {\n      transform: rotateY(180deg); }\n  .card__text {\n    background-color: #f4f4d7;\n    width: 34rem;\n    display: flex;\n    flex-direction: column;\n    padding: 1rem;\n    margin-right: 3rem; }\n    .card__text-flex {\n      margin-bottom: 1rem;\n      border-bottom: 1px solid #bfbfbf; }\n    .card__text-title {\n      display: flex;\n      align-items: center; }\n      .card__text-title-h3 {\n        font-size: 1.8rem;\n        font-weight: 400;\n        margin-right: 1rem; }\n    .card__text-color-indicator {\n      width: 1.3rem;\n      height: 1.3rem;\n      border: 1px solid #333;\n      border-radius: 50%;\n      box-shadow: 0px 0px 0px 2px rgba(0, 0, 0, 0.2);\n      margin-right: .7rem;\n      display: inline-block; }\n      .card__text-color-indicator--U {\n        background-color: rgba(128, 128, 255, 0.7); }\n      .card__text-color-indicator--B {\n        background-color: rgba(0, 0, 0, 0.7); }\n      .card__text-color-indicator--R {\n        background-color: rgba(255, 77, 77, 0.7); }\n      .card__text-color-indicator--W {\n        background-color: rgba(255, 255, 255, 0.7); }\n      .card__text-color-indicator--G {\n        background-color: rgba(0, 255, 0, 0.7); }\n    .card__text-oracle-p {\n      margin-bottom: 1rem;\n      font-size: 1.3rem; }\n    .card__text-oracle-flavor {\n      font-size: 1.3rem;\n      font-style: italic; }\n    .card__text-illustrator {\n      font-size: 1.2rem;\n      font-style: italic; }\n    .card__text-legal {\n      display: flex;\n      flex-direction: row;\n      justify-content: space-between; }\n      .card__text-legal-half {\n        display: flex;\n        flex-direction: column; }\n      .card__text-legal-span-container {\n        display: flex;\n        align-items: center; }\n        .card__text-legal-span-container:not(:last-child) {\n          margin-bottom: .5rem; }\n      .card__text-legal-span-box {\n        width: 6rem;\n        height: 2.5rem;\n        border: 1px solid #000;\n        margin-right: .3rem;\n        font-size: 1rem;\n        text-transform: uppercase;\n        display: flex;\n        justify-content: center;\n        align-items: center; }\n        .card__text-legal-span-box--not_legal {\n          background-color: #ff0000; }\n        .card__text-legal-span-box--legal {\n          background-color: #47d147; }\n  .card__set {\n    display: flex;\n    flex-direction: column; }\n    .card__set-banner {\n      display: flex;\n      border: 1px solid #bfbfbf;\n      width: 40rem;\n      background-color: #000;\n      color: #fff; }\n      .card__set-banner-svg-container {\n        margin-right: 1rem; }\n      .card__set-banner-svg {\n        width: 2.4rem;\n        height: 2.4rem;\n        filter: invert(100%); }\n    .card__set-details {\n      display: flex;\n      flex-direction: column; }\n    .card__set-header-name {\n      font-size: 1.7remrem; }\n    .card__set-header-code {\n      text-transform: uppercase; }\n    .card__set-prints-header {\n      display: flex;\n      justify-content: space-between;\n      background-color: #000;\n      color: #fff;\n      font-size: 1.3rem;\n      text-transform: uppercase;\n      border: 1px solid #bfbfbf;\n      padding: .3rem .7rem; }\n    .card__set-prints-svg-container {\n      height: 1.8rem;\n      width: 1.8rem;\n      border: 1px solid #bfbfbf;\n      display: flex;\n      justify-content: center;\n      align-items: center;\n      border-radius: 100%; }\n    .card__set-prints-svg--common {\n      fill: #000; }\n    .card__set-prints-svg--uncommon {\n      fill: #e6e6e6; }\n    .card__set-prints-svg--rare {\n      fill: #e6c300; }\n    .card__set-prints-svg--mythic {\n      fill: #ff0000; }\n    .card__set-prints-list {\n      list-style: none; }\n      .card__set-prints-list-link:link, .card__set-prints-list-link:visited {\n        text-decoration: none;\n        color: #000; }\n      .card__set-prints-list-item {\n        display: flex;\n        justify-content: space-between;\n        cursor: pointer; }\n        .card__set-prints-list-item:hover {\n          background-color: #f2f2f2; }\n      .card__set-prints-list-item-name-wrapper {\n        display: flex;\n        align-items: center;\n        margin-left: -1rem; }\n      .card__set-prints-list-item-set-name {\n        margin-left: .5rem; }\n      .card__set-prints-list-item-price {\n        margin-right: .7rem; }\n\n.no-results {\n  justify-self: center; }\n\n.container {\n  display: grid;\n  grid-template-columns: [full-start] minmax(6rem, 1fr) [center-start] repeat(8, [col-start] minmax(min-content, 14rem) [col-end]) [center-end] minmax(6rem, 1fr) [full-end]; }\n\n.login,\n.register {\n  margin-top: 5rem;\n  grid-column: center-start / center-end;\n  background-image: linear-gradient(to right bottom, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(../img/login-bg.jpg);\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  height: 75vh;\n  background-size: cover;\n  background-position: center; }\n\n.search {\n  grid-column: full-start / full-end;\n  background-color: #fff; }\n\n.api-results-display {\n  grid-column: full-start / full-end;\n  background-color: #fff;\n  display: grid; }\n"],"sourceRoot":""}]);
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
        console.log(state.search.cards);
        console.log(state.query)

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
        const legalStatus = _views_base__WEBPACK_IMPORTED_MODULE_1__.elements.apiSearch.legalStatus.value;
        const format = _views_base__WEBPACK_IMPORTED_MODULE_1__.elements.apiSearch.format.value;
 
        if (format) this.search += `+${legalStatus}%3A${format}`;
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
/* harmony export */   "statLineController": () => /* binding */ statLineController
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
}

const checkStatLineForInteger = () => {
    const statVal = Array.from(document.querySelectorAll(
        '.js--api-stat-value'
    )).slice(-1)[0];

    return (parseInt(statVal.value) >= 0 ? true : false);
};

const checkForLessThanFourStatLines = () => {
    const stats = Array.from(document.querySelectorAll('.js--api-stat-value'));

    return (stats.length < 4 ? true : false);
}

const createStatsClone = () => {
    return document.querySelector('.js--api-stats-wrapper').cloneNode(true); 
};

const editStatsClone = clone => {
    clone.querySelector('.js--api-stat').value = '';
    clone.querySelector('.js--api-stat-filter').value = '';
    clone.querySelector('.js--api-stat-value').value = '';   
}

const insertStatsClone = clone => {
    const lastStatLine = Array.from(document.querySelectorAll(
        '.js--api-stats-wrapper'
    )).slice(-1)[0];

    lastStatLine.insertAdjacentElement('afterend', clone);
}

const resetStatLineEventListener = () => {
    const statValues = Array.from(
        document.querySelectorAll('.js--api-stat-value')
    );
    statValues.slice(-2)[0].removeEventListener('input', statLineController);
    statValues.slice(-1)[0].addEventListener('input', statLineController);
}



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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9pbmRleC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvYWRhcHRlcnMveGhyLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9heGlvcy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbFRva2VuLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvaXNDYW5jZWwuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvQXhpb3MuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvSW50ZXJjZXB0b3JNYW5hZ2VyLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2J1aWxkRnVsbFBhdGguanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvY3JlYXRlRXJyb3IuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvZGlzcGF0Y2hSZXF1ZXN0LmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2VuaGFuY2VFcnJvci5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9tZXJnZUNvbmZpZy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9zZXR0bGUuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvdHJhbnNmb3JtRGF0YS5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvZGVmYXVsdHMuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYmluZC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9idWlsZFVSTC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9jb21iaW5lVVJMcy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9jb29raWVzLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzQWJzb2x1dGVVUkwuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNVUkxTYW1lT3JpZ2luLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL25vcm1hbGl6ZUhlYWRlck5hbWUuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvcGFyc2VIZWFkZXJzLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3NwcmVhZC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvdXRpbHMuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9zcmMvY3NzL3N0eWxlLmNzcyIsIndlYnBhY2s6Ly9tYWdpYy8uL3NyYy9jc3MvdmVuZG9yL21hbmEuY3NzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9jc3NXaXRoTWFwcGluZ1RvU3RyaW5nLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2dldFVybC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL3NyYy9pbWcvbG9naW4tYmcuanBnIiwid2VicGFjazovL21hZ2ljLy4vc3JjL2ltZy9tYW5hLXN5bWJvbHMvbWFuYS5zdmciLCJ3ZWJwYWNrOi8vbWFnaWMvLi9zcmMvY3NzL3N0eWxlLmNzcz85ZmNkIiwid2VicGFjazovL21hZ2ljLy4vc3JjL2Nzcy92ZW5kb3IvbWFuYS5jc3M/MDcwMiIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL3NyYy9qcy9pbmRleC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL3NyYy9qcy9tb2RlbHMvU2VhcmNoLmpzIiwid2VicGFjazovL21hZ2ljLy4vc3JjL2pzL3ZpZXdzL2Jhc2UuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9zcmMvanMvdmlld3MvY2FyZFZpZXcuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9zcmMvanMvdmlld3MvcmVzdWx0c1ZpZXcuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9zcmMvanMvdmlld3Mvc2VhcmNoVmlldy5qcyIsIndlYnBhY2s6Ly9tYWdpYy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9tYWdpYy93ZWJwYWNrL3J1bnRpbWUvY29tcGF0IGdldCBkZWZhdWx0IGV4cG9ydCIsIndlYnBhY2s6Ly9tYWdpYy93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vbWFnaWMvd2VicGFjay9ydW50aW1lL2dsb2JhbCIsIndlYnBhY2s6Ly9tYWdpYy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL21hZ2ljL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vbWFnaWMvd2VicGFjay9ydW50aW1lL3B1YmxpY1BhdGgiLCJ3ZWJwYWNrOi8vbWFnaWMvd2VicGFjay9zdGFydHVwIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFBQSw0RkFBdUMsQzs7Ozs7Ozs7Ozs7OztBQ0ExQjs7QUFFYixZQUFZLG1CQUFPLENBQUMscURBQVk7QUFDaEMsYUFBYSxtQkFBTyxDQUFDLGlFQUFrQjtBQUN2QyxjQUFjLG1CQUFPLENBQUMseUVBQXNCO0FBQzVDLGVBQWUsbUJBQU8sQ0FBQywyRUFBdUI7QUFDOUMsb0JBQW9CLG1CQUFPLENBQUMsNkVBQXVCO0FBQ25ELG1CQUFtQixtQkFBTyxDQUFDLG1GQUEyQjtBQUN0RCxzQkFBc0IsbUJBQU8sQ0FBQyx5RkFBOEI7QUFDNUQsa0JBQWtCLG1CQUFPLENBQUMseUVBQXFCOztBQUUvQztBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDRDQUE0QztBQUM1Qzs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFF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QWEsYUFBYSxrQkFBa0IsTUFBTSxVQUFVLGVBQWUsTUFBTSxVQUFVLGVBQWUsTUFBTSxVQUFVLFVBQVUsaUJBQWlCLE1BQU0sZ0JBQWdCLE1BQU0sVUFBVSxZQUFZLGtCQUFrQixNQUFNLGtCQUFrQixNQUFNLFlBQVksV0FBVyxZQUFZLG1CQUFtQixNQUFNLFlBQVksYUFBYSxpQkFBaUIsTUFBTSxVQUFVLGtCQUFrQixNQUFNLFlBQVksaUJBQWlCLEtBQUssWUFBWSxXQUFXLGlCQUFpQixNQUFNLFVBQVUsa0JBQWtCLE1BQU0sWUFBWSxhQUFhLGFBQWEsYUFBYSxXQUFXLFVBQVUsWUFBWSxtQkFBbUIsTUFBTSxpQkFBaUIsTUFBTSxVQUFVLFVBQVUsWUFBWSxhQUFhLGFBQWEsa0JBQWtCLE1BQU0sVUFBVSxVQUFVLFlBQVksa0JBQWtCLE1BQU0sZUFBZSxNQUFNLFVBQVUsWUFBWSxnQkFBZ0IsS0FBSyxVQUFVLFVBQVUsWUFBWSxXQUFXLFlBQVksa0JBQWtCLE1BQU0saUJBQWlCLE1BQU0sVUFBVSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxVQUFVLFVBQVUsaUJBQWlCLE1BQU0sVUFBVSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxVQUFVLFVBQVUsaUJBQWlCLE1BQU0sWUFBWSxXQUFXLGlCQUFpQixNQUFNLFVBQVUsaUJBQWlCLE1BQU0sVUFBVSxZQUFZLGFBQWEsa0JBQWtCLE1BQU0sVUFBVSxpQkFBaUIsTUFBTSxVQUFVLFlBQVksYUFBYSxXQUFXLFVBQVUsVUFBVSxZQUFZLGFBQWEsa0JBQWtCLE1BQU0sVUFBVSxVQUFVLFVBQVUsWUFBWSxhQUFhLFdBQVcsWUFBWSxrQkFBa0IsTUFBTSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxZQUFZLGFBQWEsYUFBYSxXQUFXLFVBQVUsVUFBVSxZQUFZLGFBQWEsa0JBQWtCLE1BQU0saUJBQWlCLE1BQU0sZUFBZSxNQUFNLFlBQVksV0FBVyxpQkFBaUIsTUFBTSxlQUFlLE1BQU0saUJBQWlCLE1BQU0sWUFBWSxrQkFBa0IsTUFBTSxVQUFVLFVBQVUsa0JBQWtCLE1BQU0sa0JBQWtCLE1BQU0sWUFBWSxXQUFXLFVBQVUsWUFBWSxXQUFXLGlCQUFpQixNQUFNLFVBQVUsaUJBQWlCLE1BQU0sZUFBZSxNQUFNLFVBQVUsaUJBQWlCLE1BQU0sVUFBVSxZQUFZLGFBQWEsZ0JBQWdCLE1BQU0saUJBQWlCLE1BQU0sWUFBWSxrQkFBa0IsTUFBTSxVQUFVLGdCQUFnQixNQUFNLFVBQVUsWUFBWSxhQUFhLG1CQUFtQixNQUFNLFVBQVUsaUJBQWlCLE1BQU0sVUFBVSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxVQUFVLFlBQVksYUFBYSxhQUFhLGFBQWEsa0JBQWtCLE1BQU0saUJBQWlCLE1BQU0saUJBQWlCLE1BQU0sVUFBVSxVQUFVLFlBQVksYUFBYSxhQUFhLFdBQVcsVUFBVSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxrQkFBa0IsTUFBTSxZQUFZLFdBQVcsVUFBVSxlQUFlLEtBQUssVUFBVSxnQkFBZ0IsTUFBTSxZQUFZLFdBQVcsWUFBWSxhQUFhLGtCQUFrQixNQUFNLGlCQUFpQixNQUFNLFlBQVksV0FBVyxlQUFlLE1BQU0sVUFBVSxVQUFVLFlBQVksV0FBVyxVQUFVLFlBQVksYUFBYSxrQkFBa0IsTUFBTSxpQkFBaUIsTUFBTSxZQUFZLFdBQVcsVUFBVSxVQUFVLFVBQVUsWUFBWSxrQkFBa0IsTUFBTSxVQUFVLGVBQWUsTUFBTSxVQUFVLGdCQUFnQixNQUFNLFVBQVUsWUFBWSxrQkFBa0IsTUFBTSxpQkFBaUIsTUFBTSxVQUFVLGVBQWUsTUFBTSxZQUFZLFdBQVcsVUFBVSxpQkFBaUIsTUFBTSxZQUFZLGFBQWEsa0JBQWtCLE1BQU0saUJBQWlCLE1BQU0sWUFBWSxnQkFBZ0IsTUFBTSxVQUFVLFVBQVUsWUFBWSxXQUFXLFVBQVUsWUFBWSxrQkFBa0IsTUFBTSxpQkFBaUIsTUFBTSxZQUFZLFdBQVcsVUFBVSxZQUFZLFdBQVcsaUJBQWlCLE1BQU0sWUFBWSxrQkFBa0IsTUFBTSxVQUFVLGlCQUFpQixNQUFNLFlBQVksYUFBYSxrQkFBa0Is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QUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsNEU7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSwwRDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O1VDdmtCQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0NyQkE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLGdDQUFnQyxZQUFZO1dBQzVDO1dBQ0EsRTs7Ozs7V0NQQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHdDQUF3Qyx5Q0FBeUM7V0FDakY7V0FDQTtXQUNBLEU7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQSxFQUFFO1dBQ0Y7V0FDQTtXQUNBLENBQUMsSTs7Ozs7V0NQRCxzRjs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSxzREFBc0Qsa0JBQWtCO1dBQ3hFO1dBQ0EsK0NBQStDLGNBQWM7V0FDN0QsRTs7Ozs7V0NOQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxrQzs7OztVQ2ZBO1VBQ0E7VUFDQTtVQUNBIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvYXhpb3MnKTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBzZXR0bGUgPSByZXF1aXJlKCcuLy4uL2NvcmUvc2V0dGxlJyk7XG52YXIgY29va2llcyA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9jb29raWVzJyk7XG52YXIgYnVpbGRVUkwgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvYnVpbGRVUkwnKTtcbnZhciBidWlsZEZ1bGxQYXRoID0gcmVxdWlyZSgnLi4vY29yZS9idWlsZEZ1bGxQYXRoJyk7XG52YXIgcGFyc2VIZWFkZXJzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL3BhcnNlSGVhZGVycycpO1xudmFyIGlzVVJMU2FtZU9yaWdpbiA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9pc1VSTFNhbWVPcmlnaW4nKTtcbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4uL2NvcmUvY3JlYXRlRXJyb3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB4aHJBZGFwdGVyKGNvbmZpZykge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gZGlzcGF0Y2hYaHJSZXF1ZXN0KHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciByZXF1ZXN0RGF0YSA9IGNvbmZpZy5kYXRhO1xuICAgIHZhciByZXF1ZXN0SGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzO1xuXG4gICAgaWYgKHV0aWxzLmlzRm9ybURhdGEocmVxdWVzdERhdGEpKSB7XG4gICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddOyAvLyBMZXQgdGhlIGJyb3dzZXIgc2V0IGl0XG4gICAgfVxuXG4gICAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgIC8vIEhUVFAgYmFzaWMgYXV0aGVudGljYXRpb25cbiAgICBpZiAoY29uZmlnLmF1dGgpIHtcbiAgICAgIHZhciB1c2VybmFtZSA9IGNvbmZpZy5hdXRoLnVzZXJuYW1lIHx8ICcnO1xuICAgICAgdmFyIHBhc3N3b3JkID0gY29uZmlnLmF1dGgucGFzc3dvcmQgPyB1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoY29uZmlnLmF1dGgucGFzc3dvcmQpKSA6ICcnO1xuICAgICAgcmVxdWVzdEhlYWRlcnMuQXV0aG9yaXphdGlvbiA9ICdCYXNpYyAnICsgYnRvYSh1c2VybmFtZSArICc6JyArIHBhc3N3b3JkKTtcbiAgICB9XG5cbiAgICB2YXIgZnVsbFBhdGggPSBidWlsZEZ1bGxQYXRoKGNvbmZpZy5iYXNlVVJMLCBjb25maWcudXJsKTtcbiAgICByZXF1ZXN0Lm9wZW4oY29uZmlnLm1ldGhvZC50b1VwcGVyQ2FzZSgpLCBidWlsZFVSTChmdWxsUGF0aCwgY29uZmlnLnBhcmFtcywgY29uZmlnLnBhcmFtc1NlcmlhbGl6ZXIpLCB0cnVlKTtcblxuICAgIC8vIFNldCB0aGUgcmVxdWVzdCB0aW1lb3V0IGluIE1TXG4gICAgcmVxdWVzdC50aW1lb3V0ID0gY29uZmlnLnRpbWVvdXQ7XG5cbiAgICAvLyBMaXN0ZW4gZm9yIHJlYWR5IHN0YXRlXG4gICAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiBoYW5kbGVMb2FkKCkge1xuICAgICAgaWYgKCFyZXF1ZXN0IHx8IHJlcXVlc3QucmVhZHlTdGF0ZSAhPT0gNCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFRoZSByZXF1ZXN0IGVycm9yZWQgb3V0IGFuZCB3ZSBkaWRuJ3QgZ2V0IGEgcmVzcG9uc2UsIHRoaXMgd2lsbCBiZVxuICAgICAgLy8gaGFuZGxlZCBieSBvbmVycm9yIGluc3RlYWRcbiAgICAgIC8vIFdpdGggb25lIGV4Y2VwdGlvbjogcmVxdWVzdCB0aGF0IHVzaW5nIGZpbGU6IHByb3RvY29sLCBtb3N0IGJyb3dzZXJzXG4gICAgICAvLyB3aWxsIHJldHVybiBzdGF0dXMgYXMgMCBldmVuIHRob3VnaCBpdCdzIGEgc3VjY2Vzc2Z1bCByZXF1ZXN0XG4gICAgICBpZiAocmVxdWVzdC5zdGF0dXMgPT09IDAgJiYgIShyZXF1ZXN0LnJlc3BvbnNlVVJMICYmIHJlcXVlc3QucmVzcG9uc2VVUkwuaW5kZXhPZignZmlsZTonKSA9PT0gMCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBQcmVwYXJlIHRoZSByZXNwb25zZVxuICAgICAgdmFyIHJlc3BvbnNlSGVhZGVycyA9ICdnZXRBbGxSZXNwb25zZUhlYWRlcnMnIGluIHJlcXVlc3QgPyBwYXJzZUhlYWRlcnMocmVxdWVzdC5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSkgOiBudWxsO1xuICAgICAgdmFyIHJlc3BvbnNlRGF0YSA9ICFjb25maWcucmVzcG9uc2VUeXBlIHx8IGNvbmZpZy5yZXNwb25zZVR5cGUgPT09ICd0ZXh0JyA/IHJlcXVlc3QucmVzcG9uc2VUZXh0IDogcmVxdWVzdC5yZXNwb25zZTtcbiAgICAgIHZhciByZXNwb25zZSA9IHtcbiAgICAgICAgZGF0YTogcmVzcG9uc2VEYXRhLFxuICAgICAgICBzdGF0dXM6IHJlcXVlc3Quc3RhdHVzLFxuICAgICAgICBzdGF0dXNUZXh0OiByZXF1ZXN0LnN0YXR1c1RleHQsXG4gICAgICAgIGhlYWRlcnM6IHJlc3BvbnNlSGVhZGVycyxcbiAgICAgICAgY29uZmlnOiBjb25maWcsXG4gICAgICAgIHJlcXVlc3Q6IHJlcXVlc3RcbiAgICAgIH07XG5cbiAgICAgIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHJlc3BvbnNlKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSBicm93c2VyIHJlcXVlc3QgY2FuY2VsbGF0aW9uIChhcyBvcHBvc2VkIHRvIGEgbWFudWFsIGNhbmNlbGxhdGlvbilcbiAgICByZXF1ZXN0Lm9uYWJvcnQgPSBmdW5jdGlvbiBoYW5kbGVBYm9ydCgpIHtcbiAgICAgIGlmICghcmVxdWVzdCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcignUmVxdWVzdCBhYm9ydGVkJywgY29uZmlnLCAnRUNPTk5BQk9SVEVEJywgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIGxvdyBsZXZlbCBuZXR3b3JrIGVycm9yc1xuICAgIHJlcXVlc3Qub25lcnJvciA9IGZ1bmN0aW9uIGhhbmRsZUVycm9yKCkge1xuICAgICAgLy8gUmVhbCBlcnJvcnMgYXJlIGhpZGRlbiBmcm9tIHVzIGJ5IHRoZSBicm93c2VyXG4gICAgICAvLyBvbmVycm9yIHNob3VsZCBvbmx5IGZpcmUgaWYgaXQncyBhIG5ldHdvcmsgZXJyb3JcbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcignTmV0d29yayBFcnJvcicsIGNvbmZpZywgbnVsbCwgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIHRpbWVvdXRcbiAgICByZXF1ZXN0Lm9udGltZW91dCA9IGZ1bmN0aW9uIGhhbmRsZVRpbWVvdXQoKSB7XG4gICAgICB2YXIgdGltZW91dEVycm9yTWVzc2FnZSA9ICd0aW1lb3V0IG9mICcgKyBjb25maWcudGltZW91dCArICdtcyBleGNlZWRlZCc7XG4gICAgICBpZiAoY29uZmlnLnRpbWVvdXRFcnJvck1lc3NhZ2UpIHtcbiAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZSA9IGNvbmZpZy50aW1lb3V0RXJyb3JNZXNzYWdlO1xuICAgICAgfVxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKHRpbWVvdXRFcnJvck1lc3NhZ2UsIGNvbmZpZywgJ0VDT05OQUJPUlRFRCcsXG4gICAgICAgIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEFkZCB4c3JmIGhlYWRlclxuICAgIC8vIFRoaXMgaXMgb25seSBkb25lIGlmIHJ1bm5pbmcgaW4gYSBzdGFuZGFyZCBicm93c2VyIGVudmlyb25tZW50LlxuICAgIC8vIFNwZWNpZmljYWxseSBub3QgaWYgd2UncmUgaW4gYSB3ZWIgd29ya2VyLCBvciByZWFjdC1uYXRpdmUuXG4gICAgaWYgKHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkpIHtcbiAgICAgIC8vIEFkZCB4c3JmIGhlYWRlclxuICAgICAgdmFyIHhzcmZWYWx1ZSA9IChjb25maWcud2l0aENyZWRlbnRpYWxzIHx8IGlzVVJMU2FtZU9yaWdpbihmdWxsUGF0aCkpICYmIGNvbmZpZy54c3JmQ29va2llTmFtZSA/XG4gICAgICAgIGNvb2tpZXMucmVhZChjb25maWcueHNyZkNvb2tpZU5hbWUpIDpcbiAgICAgICAgdW5kZWZpbmVkO1xuXG4gICAgICBpZiAoeHNyZlZhbHVlKSB7XG4gICAgICAgIHJlcXVlc3RIZWFkZXJzW2NvbmZpZy54c3JmSGVhZGVyTmFtZV0gPSB4c3JmVmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQWRkIGhlYWRlcnMgdG8gdGhlIHJlcXVlc3RcbiAgICBpZiAoJ3NldFJlcXVlc3RIZWFkZXInIGluIHJlcXVlc3QpIHtcbiAgICAgIHV0aWxzLmZvckVhY2gocmVxdWVzdEhlYWRlcnMsIGZ1bmN0aW9uIHNldFJlcXVlc3RIZWFkZXIodmFsLCBrZXkpIHtcbiAgICAgICAgaWYgKHR5cGVvZiByZXF1ZXN0RGF0YSA9PT0gJ3VuZGVmaW5lZCcgJiYga2V5LnRvTG93ZXJDYXNlKCkgPT09ICdjb250ZW50LXR5cGUnKSB7XG4gICAgICAgICAgLy8gUmVtb3ZlIENvbnRlbnQtVHlwZSBpZiBkYXRhIGlzIHVuZGVmaW5lZFxuICAgICAgICAgIGRlbGV0ZSByZXF1ZXN0SGVhZGVyc1trZXldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIE90aGVyd2lzZSBhZGQgaGVhZGVyIHRvIHRoZSByZXF1ZXN0XG4gICAgICAgICAgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKGtleSwgdmFsKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQWRkIHdpdGhDcmVkZW50aWFscyB0byByZXF1ZXN0IGlmIG5lZWRlZFxuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnLndpdGhDcmVkZW50aWFscykpIHtcbiAgICAgIHJlcXVlc3Qud2l0aENyZWRlbnRpYWxzID0gISFjb25maWcud2l0aENyZWRlbnRpYWxzO1xuICAgIH1cblxuICAgIC8vIEFkZCByZXNwb25zZVR5cGUgdG8gcmVxdWVzdCBpZiBuZWVkZWRcbiAgICBpZiAoY29uZmlnLnJlc3BvbnNlVHlwZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSBjb25maWcucmVzcG9uc2VUeXBlO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBFeHBlY3RlZCBET01FeGNlcHRpb24gdGhyb3duIGJ5IGJyb3dzZXJzIG5vdCBjb21wYXRpYmxlIFhNTEh0dHBSZXF1ZXN0IExldmVsIDIuXG4gICAgICAgIC8vIEJ1dCwgdGhpcyBjYW4gYmUgc3VwcHJlc3NlZCBmb3IgJ2pzb24nIHR5cGUgYXMgaXQgY2FuIGJlIHBhcnNlZCBieSBkZWZhdWx0ICd0cmFuc2Zvcm1SZXNwb25zZScgZnVuY3Rpb24uXG4gICAgICAgIGlmIChjb25maWcucmVzcG9uc2VUeXBlICE9PSAnanNvbicpIHtcbiAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIHByb2dyZXNzIGlmIG5lZWRlZFxuICAgIGlmICh0eXBlb2YgY29uZmlnLm9uRG93bmxvYWRQcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGNvbmZpZy5vbkRvd25sb2FkUHJvZ3Jlc3MpO1xuICAgIH1cblxuICAgIC8vIE5vdCBhbGwgYnJvd3NlcnMgc3VwcG9ydCB1cGxvYWQgZXZlbnRzXG4gICAgaWYgKHR5cGVvZiBjb25maWcub25VcGxvYWRQcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJyAmJiByZXF1ZXN0LnVwbG9hZCkge1xuICAgICAgcmVxdWVzdC51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBjb25maWcub25VcGxvYWRQcm9ncmVzcyk7XG4gICAgfVxuXG4gICAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgICAgLy8gSGFuZGxlIGNhbmNlbGxhdGlvblxuICAgICAgY29uZmlnLmNhbmNlbFRva2VuLnByb21pc2UudGhlbihmdW5jdGlvbiBvbkNhbmNlbGVkKGNhbmNlbCkge1xuICAgICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICByZXF1ZXN0LmFib3J0KCk7XG4gICAgICAgIHJlamVjdChjYW5jZWwpO1xuICAgICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKCFyZXF1ZXN0RGF0YSkge1xuICAgICAgcmVxdWVzdERhdGEgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIFNlbmQgdGhlIHJlcXVlc3RcbiAgICByZXF1ZXN0LnNlbmQocmVxdWVzdERhdGEpO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbnZhciBiaW5kID0gcmVxdWlyZSgnLi9oZWxwZXJzL2JpbmQnKTtcbnZhciBBeGlvcyA9IHJlcXVpcmUoJy4vY29yZS9BeGlvcycpO1xudmFyIG1lcmdlQ29uZmlnID0gcmVxdWlyZSgnLi9jb3JlL21lcmdlQ29uZmlnJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIGluc3RhbmNlIG9mIEF4aW9zXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRlZmF1bHRDb25maWcgVGhlIGRlZmF1bHQgY29uZmlnIGZvciB0aGUgaW5zdGFuY2VcbiAqIEByZXR1cm4ge0F4aW9zfSBBIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICovXG5mdW5jdGlvbiBjcmVhdGVJbnN0YW5jZShkZWZhdWx0Q29uZmlnKSB7XG4gIHZhciBjb250ZXh0ID0gbmV3IEF4aW9zKGRlZmF1bHRDb25maWcpO1xuICB2YXIgaW5zdGFuY2UgPSBiaW5kKEF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0LCBjb250ZXh0KTtcblxuICAvLyBDb3B5IGF4aW9zLnByb3RvdHlwZSB0byBpbnN0YW5jZVxuICB1dGlscy5leHRlbmQoaW5zdGFuY2UsIEF4aW9zLnByb3RvdHlwZSwgY29udGV4dCk7XG5cbiAgLy8gQ29weSBjb250ZXh0IHRvIGluc3RhbmNlXG4gIHV0aWxzLmV4dGVuZChpbnN0YW5jZSwgY29udGV4dCk7XG5cbiAgcmV0dXJuIGluc3RhbmNlO1xufVxuXG4vLyBDcmVhdGUgdGhlIGRlZmF1bHQgaW5zdGFuY2UgdG8gYmUgZXhwb3J0ZWRcbnZhciBheGlvcyA9IGNyZWF0ZUluc3RhbmNlKGRlZmF1bHRzKTtcblxuLy8gRXhwb3NlIEF4aW9zIGNsYXNzIHRvIGFsbG93IGNsYXNzIGluaGVyaXRhbmNlXG5heGlvcy5BeGlvcyA9IEF4aW9zO1xuXG4vLyBGYWN0b3J5IGZvciBjcmVhdGluZyBuZXcgaW5zdGFuY2VzXG5heGlvcy5jcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUoaW5zdGFuY2VDb25maWcpIHtcbiAgcmV0dXJuIGNyZWF0ZUluc3RhbmNlKG1lcmdlQ29uZmlnKGF4aW9zLmRlZmF1bHRzLCBpbnN0YW5jZUNvbmZpZykpO1xufTtcblxuLy8gRXhwb3NlIENhbmNlbCAmIENhbmNlbFRva2VuXG5heGlvcy5DYW5jZWwgPSByZXF1aXJlKCcuL2NhbmNlbC9DYW5jZWwnKTtcbmF4aW9zLkNhbmNlbFRva2VuID0gcmVxdWlyZSgnLi9jYW5jZWwvQ2FuY2VsVG9rZW4nKTtcbmF4aW9zLmlzQ2FuY2VsID0gcmVxdWlyZSgnLi9jYW5jZWwvaXNDYW5jZWwnKTtcblxuLy8gRXhwb3NlIGFsbC9zcHJlYWRcbmF4aW9zLmFsbCA9IGZ1bmN0aW9uIGFsbChwcm9taXNlcykge1xuICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xufTtcbmF4aW9zLnNwcmVhZCA9IHJlcXVpcmUoJy4vaGVscGVycy9zcHJlYWQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBheGlvcztcblxuLy8gQWxsb3cgdXNlIG9mIGRlZmF1bHQgaW1wb3J0IHN5bnRheCBpbiBUeXBlU2NyaXB0XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gYXhpb3M7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQSBgQ2FuY2VsYCBpcyBhbiBvYmplY3QgdGhhdCBpcyB0aHJvd24gd2hlbiBhbiBvcGVyYXRpb24gaXMgY2FuY2VsZWQuXG4gKlxuICogQGNsYXNzXG4gKiBAcGFyYW0ge3N0cmluZz19IG1lc3NhZ2UgVGhlIG1lc3NhZ2UuXG4gKi9cbmZ1bmN0aW9uIENhbmNlbChtZXNzYWdlKSB7XG4gIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG59XG5cbkNhbmNlbC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgcmV0dXJuICdDYW5jZWwnICsgKHRoaXMubWVzc2FnZSA/ICc6ICcgKyB0aGlzLm1lc3NhZ2UgOiAnJyk7XG59O1xuXG5DYW5jZWwucHJvdG90eXBlLl9fQ0FOQ0VMX18gPSB0cnVlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbmNlbDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENhbmNlbCA9IHJlcXVpcmUoJy4vQ2FuY2VsJyk7XG5cbi8qKlxuICogQSBgQ2FuY2VsVG9rZW5gIGlzIGFuIG9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlcXVlc3QgY2FuY2VsbGF0aW9uIG9mIGFuIG9wZXJhdGlvbi5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGV4ZWN1dG9yIFRoZSBleGVjdXRvciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsVG9rZW4oZXhlY3V0b3IpIHtcbiAgaWYgKHR5cGVvZiBleGVjdXRvciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2V4ZWN1dG9yIG11c3QgYmUgYSBmdW5jdGlvbi4nKTtcbiAgfVxuXG4gIHZhciByZXNvbHZlUHJvbWlzZTtcbiAgdGhpcy5wcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gcHJvbWlzZUV4ZWN1dG9yKHJlc29sdmUpIHtcbiAgICByZXNvbHZlUHJvbWlzZSA9IHJlc29sdmU7XG4gIH0pO1xuXG4gIHZhciB0b2tlbiA9IHRoaXM7XG4gIGV4ZWN1dG9yKGZ1bmN0aW9uIGNhbmNlbChtZXNzYWdlKSB7XG4gICAgaWYgKHRva2VuLnJlYXNvbikge1xuICAgICAgLy8gQ2FuY2VsbGF0aW9uIGhhcyBhbHJlYWR5IGJlZW4gcmVxdWVzdGVkXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdG9rZW4ucmVhc29uID0gbmV3IENhbmNlbChtZXNzYWdlKTtcbiAgICByZXNvbHZlUHJvbWlzZSh0b2tlbi5yZWFzb24pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBUaHJvd3MgYSBgQ2FuY2VsYCBpZiBjYW5jZWxsYXRpb24gaGFzIGJlZW4gcmVxdWVzdGVkLlxuICovXG5DYW5jZWxUb2tlbi5wcm90b3R5cGUudGhyb3dJZlJlcXVlc3RlZCA9IGZ1bmN0aW9uIHRocm93SWZSZXF1ZXN0ZWQoKSB7XG4gIGlmICh0aGlzLnJlYXNvbikge1xuICAgIHRocm93IHRoaXMucmVhc29uO1xuICB9XG59O1xuXG4vKipcbiAqIFJldHVybnMgYW4gb2JqZWN0IHRoYXQgY29udGFpbnMgYSBuZXcgYENhbmNlbFRva2VuYCBhbmQgYSBmdW5jdGlvbiB0aGF0LCB3aGVuIGNhbGxlZCxcbiAqIGNhbmNlbHMgdGhlIGBDYW5jZWxUb2tlbmAuXG4gKi9cbkNhbmNlbFRva2VuLnNvdXJjZSA9IGZ1bmN0aW9uIHNvdXJjZSgpIHtcbiAgdmFyIGNhbmNlbDtcbiAgdmFyIHRva2VuID0gbmV3IENhbmNlbFRva2VuKGZ1bmN0aW9uIGV4ZWN1dG9yKGMpIHtcbiAgICBjYW5jZWwgPSBjO1xuICB9KTtcbiAgcmV0dXJuIHtcbiAgICB0b2tlbjogdG9rZW4sXG4gICAgY2FuY2VsOiBjYW5jZWxcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsVG9rZW47XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNDYW5jZWwodmFsdWUpIHtcbiAgcmV0dXJuICEhKHZhbHVlICYmIHZhbHVlLl9fQ0FOQ0VMX18pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIGJ1aWxkVVJMID0gcmVxdWlyZSgnLi4vaGVscGVycy9idWlsZFVSTCcpO1xudmFyIEludGVyY2VwdG9yTWFuYWdlciA9IHJlcXVpcmUoJy4vSW50ZXJjZXB0b3JNYW5hZ2VyJyk7XG52YXIgZGlzcGF0Y2hSZXF1ZXN0ID0gcmVxdWlyZSgnLi9kaXNwYXRjaFJlcXVlc3QnKTtcbnZhciBtZXJnZUNvbmZpZyA9IHJlcXVpcmUoJy4vbWVyZ2VDb25maWcnKTtcblxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YgQXhpb3NcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gaW5zdGFuY2VDb25maWcgVGhlIGRlZmF1bHQgY29uZmlnIGZvciB0aGUgaW5zdGFuY2VcbiAqL1xuZnVuY3Rpb24gQXhpb3MoaW5zdGFuY2VDb25maWcpIHtcbiAgdGhpcy5kZWZhdWx0cyA9IGluc3RhbmNlQ29uZmlnO1xuICB0aGlzLmludGVyY2VwdG9ycyA9IHtcbiAgICByZXF1ZXN0OiBuZXcgSW50ZXJjZXB0b3JNYW5hZ2VyKCksXG4gICAgcmVzcG9uc2U6IG5ldyBJbnRlcmNlcHRvck1hbmFnZXIoKVxuICB9O1xufVxuXG4vKipcbiAqIERpc3BhdGNoIGEgcmVxdWVzdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZyBzcGVjaWZpYyBmb3IgdGhpcyByZXF1ZXN0IChtZXJnZWQgd2l0aCB0aGlzLmRlZmF1bHRzKVxuICovXG5BeGlvcy5wcm90b3R5cGUucmVxdWVzdCA9IGZ1bmN0aW9uIHJlcXVlc3QoY29uZmlnKSB7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAvLyBBbGxvdyBmb3IgYXhpb3MoJ2V4YW1wbGUvdXJsJ1ssIGNvbmZpZ10pIGEgbGEgZmV0Y2ggQVBJXG4gIGlmICh0eXBlb2YgY29uZmlnID09PSAnc3RyaW5nJykge1xuICAgIGNvbmZpZyA9IGFyZ3VtZW50c1sxXSB8fCB7fTtcbiAgICBjb25maWcudXJsID0gYXJndW1lbnRzWzBdO1xuICB9IGVsc2Uge1xuICAgIGNvbmZpZyA9IGNvbmZpZyB8fCB7fTtcbiAgfVxuXG4gIGNvbmZpZyA9IG1lcmdlQ29uZmlnKHRoaXMuZGVmYXVsdHMsIGNvbmZpZyk7XG5cbiAgLy8gU2V0IGNvbmZpZy5tZXRob2RcbiAgaWYgKGNvbmZpZy5tZXRob2QpIHtcbiAgICBjb25maWcubWV0aG9kID0gY29uZmlnLm1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuICB9IGVsc2UgaWYgKHRoaXMuZGVmYXVsdHMubWV0aG9kKSB7XG4gICAgY29uZmlnLm1ldGhvZCA9IHRoaXMuZGVmYXVsdHMubWV0aG9kLnRvTG93ZXJDYXNlKCk7XG4gIH0gZWxzZSB7XG4gICAgY29uZmlnLm1ldGhvZCA9ICdnZXQnO1xuICB9XG5cbiAgLy8gSG9vayB1cCBpbnRlcmNlcHRvcnMgbWlkZGxld2FyZVxuICB2YXIgY2hhaW4gPSBbZGlzcGF0Y2hSZXF1ZXN0LCB1bmRlZmluZWRdO1xuICB2YXIgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZShjb25maWcpO1xuXG4gIHRoaXMuaW50ZXJjZXB0b3JzLnJlcXVlc3QuZm9yRWFjaChmdW5jdGlvbiB1bnNoaWZ0UmVxdWVzdEludGVyY2VwdG9ycyhpbnRlcmNlcHRvcikge1xuICAgIGNoYWluLnVuc2hpZnQoaW50ZXJjZXB0b3IuZnVsZmlsbGVkLCBpbnRlcmNlcHRvci5yZWplY3RlZCk7XG4gIH0pO1xuXG4gIHRoaXMuaW50ZXJjZXB0b3JzLnJlc3BvbnNlLmZvckVhY2goZnVuY3Rpb24gcHVzaFJlc3BvbnNlSW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgY2hhaW4ucHVzaChpbnRlcmNlcHRvci5mdWxmaWxsZWQsIGludGVyY2VwdG9yLnJlamVjdGVkKTtcbiAgfSk7XG5cbiAgd2hpbGUgKGNoYWluLmxlbmd0aCkge1xuICAgIHByb21pc2UgPSBwcm9taXNlLnRoZW4oY2hhaW4uc2hpZnQoKSwgY2hhaW4uc2hpZnQoKSk7XG4gIH1cblxuICByZXR1cm4gcHJvbWlzZTtcbn07XG5cbkF4aW9zLnByb3RvdHlwZS5nZXRVcmkgPSBmdW5jdGlvbiBnZXRVcmkoY29uZmlnKSB7XG4gIGNvbmZpZyA9IG1lcmdlQ29uZmlnKHRoaXMuZGVmYXVsdHMsIGNvbmZpZyk7XG4gIHJldHVybiBidWlsZFVSTChjb25maWcudXJsLCBjb25maWcucGFyYW1zLCBjb25maWcucGFyYW1zU2VyaWFsaXplcikucmVwbGFjZSgvXlxcPy8sICcnKTtcbn07XG5cbi8vIFByb3ZpZGUgYWxpYXNlcyBmb3Igc3VwcG9ydGVkIHJlcXVlc3QgbWV0aG9kc1xudXRpbHMuZm9yRWFjaChbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCcsICdvcHRpb25zJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2ROb0RhdGEobWV0aG9kKSB7XG4gIC8qZXNsaW50IGZ1bmMtbmFtZXM6MCovXG4gIEF4aW9zLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24odXJsLCBjb25maWcpIHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KG1lcmdlQ29uZmlnKGNvbmZpZyB8fCB7fSwge1xuICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICB1cmw6IHVybCxcbiAgICAgIGRhdGE6IChjb25maWcgfHwge30pLmRhdGFcbiAgICB9KSk7XG4gIH07XG59KTtcblxudXRpbHMuZm9yRWFjaChbJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2RXaXRoRGF0YShtZXRob2QpIHtcbiAgLyplc2xpbnQgZnVuYy1uYW1lczowKi9cbiAgQXhpb3MucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih1cmwsIGRhdGEsIGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QobWVyZ2VDb25maWcoY29uZmlnIHx8IHt9LCB7XG4gICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgIHVybDogdXJsLFxuICAgICAgZGF0YTogZGF0YVxuICAgIH0pKTtcbiAgfTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEF4aW9zO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbmZ1bmN0aW9uIEludGVyY2VwdG9yTWFuYWdlcigpIHtcbiAgdGhpcy5oYW5kbGVycyA9IFtdO1xufVxuXG4vKipcbiAqIEFkZCBhIG5ldyBpbnRlcmNlcHRvciB0byB0aGUgc3RhY2tcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdWxmaWxsZWQgVGhlIGZ1bmN0aW9uIHRvIGhhbmRsZSBgdGhlbmAgZm9yIGEgYFByb21pc2VgXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWplY3RlZCBUaGUgZnVuY3Rpb24gdG8gaGFuZGxlIGByZWplY3RgIGZvciBhIGBQcm9taXNlYFxuICpcbiAqIEByZXR1cm4ge051bWJlcn0gQW4gSUQgdXNlZCB0byByZW1vdmUgaW50ZXJjZXB0b3IgbGF0ZXJcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbiB1c2UoZnVsZmlsbGVkLCByZWplY3RlZCkge1xuICB0aGlzLmhhbmRsZXJzLnB1c2goe1xuICAgIGZ1bGZpbGxlZDogZnVsZmlsbGVkLFxuICAgIHJlamVjdGVkOiByZWplY3RlZFxuICB9KTtcbiAgcmV0dXJuIHRoaXMuaGFuZGxlcnMubGVuZ3RoIC0gMTtcbn07XG5cbi8qKlxuICogUmVtb3ZlIGFuIGludGVyY2VwdG9yIGZyb20gdGhlIHN0YWNrXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGlkIFRoZSBJRCB0aGF0IHdhcyByZXR1cm5lZCBieSBgdXNlYFxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLmVqZWN0ID0gZnVuY3Rpb24gZWplY3QoaWQpIHtcbiAgaWYgKHRoaXMuaGFuZGxlcnNbaWRdKSB7XG4gICAgdGhpcy5oYW5kbGVyc1tpZF0gPSBudWxsO1xuICB9XG59O1xuXG4vKipcbiAqIEl0ZXJhdGUgb3ZlciBhbGwgdGhlIHJlZ2lzdGVyZWQgaW50ZXJjZXB0b3JzXG4gKlxuICogVGhpcyBtZXRob2QgaXMgcGFydGljdWxhcmx5IHVzZWZ1bCBmb3Igc2tpcHBpbmcgb3ZlciBhbnlcbiAqIGludGVyY2VwdG9ycyB0aGF0IG1heSBoYXZlIGJlY29tZSBgbnVsbGAgY2FsbGluZyBgZWplY3RgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIGludGVyY2VwdG9yXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIGZvckVhY2goZm4pIHtcbiAgdXRpbHMuZm9yRWFjaCh0aGlzLmhhbmRsZXJzLCBmdW5jdGlvbiBmb3JFYWNoSGFuZGxlcihoKSB7XG4gICAgaWYgKGggIT09IG51bGwpIHtcbiAgICAgIGZuKGgpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyY2VwdG9yTWFuYWdlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGlzQWJzb2x1dGVVUkwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2lzQWJzb2x1dGVVUkwnKTtcbnZhciBjb21iaW5lVVJMcyA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvY29tYmluZVVSTHMnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IFVSTCBieSBjb21iaW5pbmcgdGhlIGJhc2VVUkwgd2l0aCB0aGUgcmVxdWVzdGVkVVJMLFxuICogb25seSB3aGVuIHRoZSByZXF1ZXN0ZWRVUkwgaXMgbm90IGFscmVhZHkgYW4gYWJzb2x1dGUgVVJMLlxuICogSWYgdGhlIHJlcXVlc3RVUkwgaXMgYWJzb2x1dGUsIHRoaXMgZnVuY3Rpb24gcmV0dXJucyB0aGUgcmVxdWVzdGVkVVJMIHVudG91Y2hlZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZVVSTCBUaGUgYmFzZSBVUkxcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXF1ZXN0ZWRVUkwgQWJzb2x1dGUgb3IgcmVsYXRpdmUgVVJMIHRvIGNvbWJpbmVcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21iaW5lZCBmdWxsIHBhdGhcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBidWlsZEZ1bGxQYXRoKGJhc2VVUkwsIHJlcXVlc3RlZFVSTCkge1xuICBpZiAoYmFzZVVSTCAmJiAhaXNBYnNvbHV0ZVVSTChyZXF1ZXN0ZWRVUkwpKSB7XG4gICAgcmV0dXJuIGNvbWJpbmVVUkxzKGJhc2VVUkwsIHJlcXVlc3RlZFVSTCk7XG4gIH1cbiAgcmV0dXJuIHJlcXVlc3RlZFVSTDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBlbmhhbmNlRXJyb3IgPSByZXF1aXJlKCcuL2VuaGFuY2VFcnJvcicpO1xuXG4vKipcbiAqIENyZWF0ZSBhbiBFcnJvciB3aXRoIHRoZSBzcGVjaWZpZWQgbWVzc2FnZSwgY29uZmlnLCBlcnJvciBjb2RlLCByZXF1ZXN0IGFuZCByZXNwb25zZS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSBUaGUgZXJyb3IgbWVzc2FnZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbY29kZV0gVGhlIGVycm9yIGNvZGUgKGZvciBleGFtcGxlLCAnRUNPTk5BQk9SVEVEJykuXG4gKiBAcGFyYW0ge09iamVjdH0gW3JlcXVlc3RdIFRoZSByZXF1ZXN0LlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXNwb25zZV0gVGhlIHJlc3BvbnNlLlxuICogQHJldHVybnMge0Vycm9yfSBUaGUgY3JlYXRlZCBlcnJvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGVFcnJvcihtZXNzYWdlLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKSB7XG4gIHZhciBlcnJvciA9IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgcmV0dXJuIGVuaGFuY2VFcnJvcihlcnJvciwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgdHJhbnNmb3JtRGF0YSA9IHJlcXVpcmUoJy4vdHJhbnNmb3JtRGF0YScpO1xudmFyIGlzQ2FuY2VsID0gcmVxdWlyZSgnLi4vY2FuY2VsL2lzQ2FuY2VsJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuLi9kZWZhdWx0cycpO1xuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbmZ1bmN0aW9uIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKSB7XG4gIGlmIChjb25maWcuY2FuY2VsVG9rZW4pIHtcbiAgICBjb25maWcuY2FuY2VsVG9rZW4udGhyb3dJZlJlcXVlc3RlZCgpO1xuICB9XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0IHRvIHRoZSBzZXJ2ZXIgdXNpbmcgdGhlIGNvbmZpZ3VyZWQgYWRhcHRlci5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIFRoZSBjb25maWcgdGhhdCBpcyB0byBiZSB1c2VkIGZvciB0aGUgcmVxdWVzdFxuICogQHJldHVybnMge1Byb21pc2V9IFRoZSBQcm9taXNlIHRvIGJlIGZ1bGZpbGxlZFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRpc3BhdGNoUmVxdWVzdChjb25maWcpIHtcbiAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gIC8vIEVuc3VyZSBoZWFkZXJzIGV4aXN0XG4gIGNvbmZpZy5oZWFkZXJzID0gY29uZmlnLmhlYWRlcnMgfHwge307XG5cbiAgLy8gVHJhbnNmb3JtIHJlcXVlc3QgZGF0YVxuICBjb25maWcuZGF0YSA9IHRyYW5zZm9ybURhdGEoXG4gICAgY29uZmlnLmRhdGEsXG4gICAgY29uZmlnLmhlYWRlcnMsXG4gICAgY29uZmlnLnRyYW5zZm9ybVJlcXVlc3RcbiAgKTtcblxuICAvLyBGbGF0dGVuIGhlYWRlcnNcbiAgY29uZmlnLmhlYWRlcnMgPSB1dGlscy5tZXJnZShcbiAgICBjb25maWcuaGVhZGVycy5jb21tb24gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNbY29uZmlnLm1ldGhvZF0gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNcbiAgKTtcblxuICB1dGlscy5mb3JFYWNoKFxuICAgIFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJywgJ2NvbW1vbiddLFxuICAgIGZ1bmN0aW9uIGNsZWFuSGVhZGVyQ29uZmlnKG1ldGhvZCkge1xuICAgICAgZGVsZXRlIGNvbmZpZy5oZWFkZXJzW21ldGhvZF07XG4gICAgfVxuICApO1xuXG4gIHZhciBhZGFwdGVyID0gY29uZmlnLmFkYXB0ZXIgfHwgZGVmYXVsdHMuYWRhcHRlcjtcblxuICByZXR1cm4gYWRhcHRlcihjb25maWcpLnRoZW4oZnVuY3Rpb24gb25BZGFwdGVyUmVzb2x1dGlvbihyZXNwb25zZSkge1xuICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgIC8vIFRyYW5zZm9ybSByZXNwb25zZSBkYXRhXG4gICAgcmVzcG9uc2UuZGF0YSA9IHRyYW5zZm9ybURhdGEoXG4gICAgICByZXNwb25zZS5kYXRhLFxuICAgICAgcmVzcG9uc2UuaGVhZGVycyxcbiAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICk7XG5cbiAgICByZXR1cm4gcmVzcG9uc2U7XG4gIH0sIGZ1bmN0aW9uIG9uQWRhcHRlclJlamVjdGlvbihyZWFzb24pIHtcbiAgICBpZiAoIWlzQ2FuY2VsKHJlYXNvbikpIHtcbiAgICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgICAgLy8gVHJhbnNmb3JtIHJlc3BvbnNlIGRhdGFcbiAgICAgIGlmIChyZWFzb24gJiYgcmVhc29uLnJlc3BvbnNlKSB7XG4gICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhID0gdHJhbnNmb3JtRGF0YShcbiAgICAgICAgICByZWFzb24ucmVzcG9uc2UuZGF0YSxcbiAgICAgICAgICByZWFzb24ucmVzcG9uc2UuaGVhZGVycyxcbiAgICAgICAgICBjb25maWcudHJhbnNmb3JtUmVzcG9uc2VcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QocmVhc29uKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFVwZGF0ZSBhbiBFcnJvciB3aXRoIHRoZSBzcGVjaWZpZWQgY29uZmlnLCBlcnJvciBjb2RlLCBhbmQgcmVzcG9uc2UuXG4gKlxuICogQHBhcmFtIHtFcnJvcn0gZXJyb3IgVGhlIGVycm9yIHRvIHVwZGF0ZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbY29kZV0gVGhlIGVycm9yIGNvZGUgKGZvciBleGFtcGxlLCAnRUNPTk5BQk9SVEVEJykuXG4gKiBAcGFyYW0ge09iamVjdH0gW3JlcXVlc3RdIFRoZSByZXF1ZXN0LlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXNwb25zZV0gVGhlIHJlc3BvbnNlLlxuICogQHJldHVybnMge0Vycm9yfSBUaGUgZXJyb3IuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZW5oYW5jZUVycm9yKGVycm9yLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKSB7XG4gIGVycm9yLmNvbmZpZyA9IGNvbmZpZztcbiAgaWYgKGNvZGUpIHtcbiAgICBlcnJvci5jb2RlID0gY29kZTtcbiAgfVxuXG4gIGVycm9yLnJlcXVlc3QgPSByZXF1ZXN0O1xuICBlcnJvci5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICBlcnJvci5pc0F4aW9zRXJyb3IgPSB0cnVlO1xuXG4gIGVycm9yLnRvSlNPTiA9IGZ1bmN0aW9uIHRvSlNPTigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgLy8gU3RhbmRhcmRcbiAgICAgIG1lc3NhZ2U6IHRoaXMubWVzc2FnZSxcbiAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgIC8vIE1pY3Jvc29mdFxuICAgICAgZGVzY3JpcHRpb246IHRoaXMuZGVzY3JpcHRpb24sXG4gICAgICBudW1iZXI6IHRoaXMubnVtYmVyLFxuICAgICAgLy8gTW96aWxsYVxuICAgICAgZmlsZU5hbWU6IHRoaXMuZmlsZU5hbWUsXG4gICAgICBsaW5lTnVtYmVyOiB0aGlzLmxpbmVOdW1iZXIsXG4gICAgICBjb2x1bW5OdW1iZXI6IHRoaXMuY29sdW1uTnVtYmVyLFxuICAgICAgc3RhY2s6IHRoaXMuc3RhY2ssXG4gICAgICAvLyBBeGlvc1xuICAgICAgY29uZmlnOiB0aGlzLmNvbmZpZyxcbiAgICAgIGNvZGU6IHRoaXMuY29kZVxuICAgIH07XG4gIH07XG4gIHJldHVybiBlcnJvcjtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbi8qKlxuICogQ29uZmlnLXNwZWNpZmljIG1lcmdlLWZ1bmN0aW9uIHdoaWNoIGNyZWF0ZXMgYSBuZXcgY29uZmlnLW9iamVjdFxuICogYnkgbWVyZ2luZyB0d28gY29uZmlndXJhdGlvbiBvYmplY3RzIHRvZ2V0aGVyLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcxXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnMlxuICogQHJldHVybnMge09iamVjdH0gTmV3IG9iamVjdCByZXN1bHRpbmcgZnJvbSBtZXJnaW5nIGNvbmZpZzIgdG8gY29uZmlnMVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG1lcmdlQ29uZmlnKGNvbmZpZzEsIGNvbmZpZzIpIHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gIGNvbmZpZzIgPSBjb25maWcyIHx8IHt9O1xuICB2YXIgY29uZmlnID0ge307XG5cbiAgdmFyIHZhbHVlRnJvbUNvbmZpZzJLZXlzID0gWyd1cmwnLCAnbWV0aG9kJywgJ2RhdGEnXTtcbiAgdmFyIG1lcmdlRGVlcFByb3BlcnRpZXNLZXlzID0gWydoZWFkZXJzJywgJ2F1dGgnLCAncHJveHknLCAncGFyYW1zJ107XG4gIHZhciBkZWZhdWx0VG9Db25maWcyS2V5cyA9IFtcbiAgICAnYmFzZVVSTCcsICd0cmFuc2Zvcm1SZXF1ZXN0JywgJ3RyYW5zZm9ybVJlc3BvbnNlJywgJ3BhcmFtc1NlcmlhbGl6ZXInLFxuICAgICd0aW1lb3V0JywgJ3RpbWVvdXRNZXNzYWdlJywgJ3dpdGhDcmVkZW50aWFscycsICdhZGFwdGVyJywgJ3Jlc3BvbnNlVHlwZScsICd4c3JmQ29va2llTmFtZScsXG4gICAgJ3hzcmZIZWFkZXJOYW1lJywgJ29uVXBsb2FkUHJvZ3Jlc3MnLCAnb25Eb3dubG9hZFByb2dyZXNzJywgJ2RlY29tcHJlc3MnLFxuICAgICdtYXhDb250ZW50TGVuZ3RoJywgJ21heEJvZHlMZW5ndGgnLCAnbWF4UmVkaXJlY3RzJywgJ3RyYW5zcG9ydCcsICdodHRwQWdlbnQnLFxuICAgICdodHRwc0FnZW50JywgJ2NhbmNlbFRva2VuJywgJ3NvY2tldFBhdGgnLCAncmVzcG9uc2VFbmNvZGluZydcbiAgXTtcbiAgdmFyIGRpcmVjdE1lcmdlS2V5cyA9IFsndmFsaWRhdGVTdGF0dXMnXTtcblxuICBmdW5jdGlvbiBnZXRNZXJnZWRWYWx1ZSh0YXJnZXQsIHNvdXJjZSkge1xuICAgIGlmICh1dGlscy5pc1BsYWluT2JqZWN0KHRhcmdldCkgJiYgdXRpbHMuaXNQbGFpbk9iamVjdChzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gdXRpbHMubWVyZ2UodGFyZ2V0LCBzb3VyY2UpO1xuICAgIH0gZWxzZSBpZiAodXRpbHMuaXNQbGFpbk9iamVjdChzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gdXRpbHMubWVyZ2Uoe30sIHNvdXJjZSk7XG4gICAgfSBlbHNlIGlmICh1dGlscy5pc0FycmF5KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiBzb3VyY2Uuc2xpY2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIHNvdXJjZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1lcmdlRGVlcFByb3BlcnRpZXMocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKGNvbmZpZzFbcHJvcF0sIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzFbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfVxuXG4gIHV0aWxzLmZvckVhY2godmFsdWVGcm9tQ29uZmlnMktleXMsIGZ1bmN0aW9uIHZhbHVlRnJvbUNvbmZpZzIocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMltwcm9wXSk7XG4gICAgfVxuICB9KTtcblxuICB1dGlscy5mb3JFYWNoKG1lcmdlRGVlcFByb3BlcnRpZXNLZXlzLCBtZXJnZURlZXBQcm9wZXJ0aWVzKTtcblxuICB1dGlscy5mb3JFYWNoKGRlZmF1bHRUb0NvbmZpZzJLZXlzLCBmdW5jdGlvbiBkZWZhdWx0VG9Db25maWcyKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzFbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdXRpbHMuZm9yRWFjaChkaXJlY3RNZXJnZUtleXMsIGZ1bmN0aW9uIG1lcmdlKHByb3ApIHtcbiAgICBpZiAocHJvcCBpbiBjb25maWcyKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZShjb25maWcxW3Byb3BdLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKHByb3AgaW4gY29uZmlnMSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBheGlvc0tleXMgPSB2YWx1ZUZyb21Db25maWcyS2V5c1xuICAgIC5jb25jYXQobWVyZ2VEZWVwUHJvcGVydGllc0tleXMpXG4gICAgLmNvbmNhdChkZWZhdWx0VG9Db25maWcyS2V5cylcbiAgICAuY29uY2F0KGRpcmVjdE1lcmdlS2V5cyk7XG5cbiAgdmFyIG90aGVyS2V5cyA9IE9iamVjdFxuICAgIC5rZXlzKGNvbmZpZzEpXG4gICAgLmNvbmNhdChPYmplY3Qua2V5cyhjb25maWcyKSlcbiAgICAuZmlsdGVyKGZ1bmN0aW9uIGZpbHRlckF4aW9zS2V5cyhrZXkpIHtcbiAgICAgIHJldHVybiBheGlvc0tleXMuaW5kZXhPZihrZXkpID09PSAtMTtcbiAgICB9KTtcblxuICB1dGlscy5mb3JFYWNoKG90aGVyS2V5cywgbWVyZ2VEZWVwUHJvcGVydGllcyk7XG5cbiAgcmV0dXJuIGNvbmZpZztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4vY3JlYXRlRXJyb3InKTtcblxuLyoqXG4gKiBSZXNvbHZlIG9yIHJlamVjdCBhIFByb21pc2UgYmFzZWQgb24gcmVzcG9uc2Ugc3RhdHVzLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlc29sdmUgQSBmdW5jdGlvbiB0aGF0IHJlc29sdmVzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0IEEgZnVuY3Rpb24gdGhhdCByZWplY3RzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIFRoZSByZXNwb25zZS5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCByZXNwb25zZSkge1xuICB2YXIgdmFsaWRhdGVTdGF0dXMgPSByZXNwb25zZS5jb25maWcudmFsaWRhdGVTdGF0dXM7XG4gIGlmICghcmVzcG9uc2Uuc3RhdHVzIHx8ICF2YWxpZGF0ZVN0YXR1cyB8fCB2YWxpZGF0ZVN0YXR1cyhyZXNwb25zZS5zdGF0dXMpKSB7XG4gICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gIH0gZWxzZSB7XG4gICAgcmVqZWN0KGNyZWF0ZUVycm9yKFxuICAgICAgJ1JlcXVlc3QgZmFpbGVkIHdpdGggc3RhdHVzIGNvZGUgJyArIHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgIHJlc3BvbnNlLmNvbmZpZyxcbiAgICAgIG51bGwsXG4gICAgICByZXNwb25zZS5yZXF1ZXN0LFxuICAgICAgcmVzcG9uc2VcbiAgICApKTtcbiAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG4vKipcbiAqIFRyYW5zZm9ybSB0aGUgZGF0YSBmb3IgYSByZXF1ZXN0IG9yIGEgcmVzcG9uc2VcbiAqXG4gKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IGRhdGEgVGhlIGRhdGEgdG8gYmUgdHJhbnNmb3JtZWRcbiAqIEBwYXJhbSB7QXJyYXl9IGhlYWRlcnMgVGhlIGhlYWRlcnMgZm9yIHRoZSByZXF1ZXN0IG9yIHJlc3BvbnNlXG4gKiBAcGFyYW0ge0FycmF5fEZ1bmN0aW9ufSBmbnMgQSBzaW5nbGUgZnVuY3Rpb24gb3IgQXJyYXkgb2YgZnVuY3Rpb25zXG4gKiBAcmV0dXJucyB7Kn0gVGhlIHJlc3VsdGluZyB0cmFuc2Zvcm1lZCBkYXRhXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdHJhbnNmb3JtRGF0YShkYXRhLCBoZWFkZXJzLCBmbnMpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIHV0aWxzLmZvckVhY2goZm5zLCBmdW5jdGlvbiB0cmFuc2Zvcm0oZm4pIHtcbiAgICBkYXRhID0gZm4oZGF0YSwgaGVhZGVycyk7XG4gIH0pO1xuXG4gIHJldHVybiBkYXRhO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIG5vcm1hbGl6ZUhlYWRlck5hbWUgPSByZXF1aXJlKCcuL2hlbHBlcnMvbm9ybWFsaXplSGVhZGVyTmFtZScpO1xuXG52YXIgREVGQVVMVF9DT05URU5UX1RZUEUgPSB7XG4gICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ1xufTtcblxuZnVuY3Rpb24gc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsIHZhbHVlKSB7XG4gIGlmICghdXRpbHMuaXNVbmRlZmluZWQoaGVhZGVycykgJiYgdXRpbHMuaXNVbmRlZmluZWQoaGVhZGVyc1snQ29udGVudC1UeXBlJ10pKSB7XG4gICAgaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPSB2YWx1ZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXREZWZhdWx0QWRhcHRlcigpIHtcbiAgdmFyIGFkYXB0ZXI7XG4gIGlmICh0eXBlb2YgWE1MSHR0cFJlcXVlc3QgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgLy8gRm9yIGJyb3dzZXJzIHVzZSBYSFIgYWRhcHRlclxuICAgIGFkYXB0ZXIgPSByZXF1aXJlKCcuL2FkYXB0ZXJzL3hocicpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwocHJvY2VzcykgPT09ICdbb2JqZWN0IHByb2Nlc3NdJykge1xuICAgIC8vIEZvciBub2RlIHVzZSBIVFRQIGFkYXB0ZXJcbiAgICBhZGFwdGVyID0gcmVxdWlyZSgnLi9hZGFwdGVycy9odHRwJyk7XG4gIH1cbiAgcmV0dXJuIGFkYXB0ZXI7XG59XG5cbnZhciBkZWZhdWx0cyA9IHtcbiAgYWRhcHRlcjogZ2V0RGVmYXVsdEFkYXB0ZXIoKSxcblxuICB0cmFuc2Zvcm1SZXF1ZXN0OiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVxdWVzdChkYXRhLCBoZWFkZXJzKSB7XG4gICAgbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCAnQWNjZXB0Jyk7XG4gICAgbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCAnQ29udGVudC1UeXBlJyk7XG4gICAgaWYgKHV0aWxzLmlzRm9ybURhdGEoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQXJyYXlCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQnVmZmVyKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc1N0cmVhbShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNGaWxlKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0Jsb2IoZGF0YSlcbiAgICApIHtcbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNBcnJheUJ1ZmZlclZpZXcoZGF0YSkpIHtcbiAgICAgIHJldHVybiBkYXRhLmJ1ZmZlcjtcbiAgICB9XG4gICAgaWYgKHV0aWxzLmlzVVJMU2VhcmNoUGFyYW1zKGRhdGEpKSB7XG4gICAgICBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDtjaGFyc2V0PXV0Zi04Jyk7XG4gICAgICByZXR1cm4gZGF0YS50b1N0cmluZygpO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNPYmplY3QoZGF0YSkpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04Jyk7XG4gICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xuICB9XSxcblxuICB0cmFuc2Zvcm1SZXNwb25zZTogW2Z1bmN0aW9uIHRyYW5zZm9ybVJlc3BvbnNlKGRhdGEpIHtcbiAgICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgICBpZiAodHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBkYXRhID0gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHsgLyogSWdub3JlICovIH1cbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIC8qKlxuICAgKiBBIHRpbWVvdXQgaW4gbWlsbGlzZWNvbmRzIHRvIGFib3J0IGEgcmVxdWVzdC4gSWYgc2V0IHRvIDAgKGRlZmF1bHQpIGFcbiAgICogdGltZW91dCBpcyBub3QgY3JlYXRlZC5cbiAgICovXG4gIHRpbWVvdXQ6IDAsXG5cbiAgeHNyZkNvb2tpZU5hbWU6ICdYU1JGLVRPS0VOJyxcbiAgeHNyZkhlYWRlck5hbWU6ICdYLVhTUkYtVE9LRU4nLFxuXG4gIG1heENvbnRlbnRMZW5ndGg6IC0xLFxuICBtYXhCb2R5TGVuZ3RoOiAtMSxcblxuICB2YWxpZGF0ZVN0YXR1czogZnVuY3Rpb24gdmFsaWRhdGVTdGF0dXMoc3RhdHVzKSB7XG4gICAgcmV0dXJuIHN0YXR1cyA+PSAyMDAgJiYgc3RhdHVzIDwgMzAwO1xuICB9XG59O1xuXG5kZWZhdWx0cy5oZWFkZXJzID0ge1xuICBjb21tb246IHtcbiAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24sIHRleHQvcGxhaW4sICovKidcbiAgfVxufTtcblxudXRpbHMuZm9yRWFjaChbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kTm9EYXRhKG1ldGhvZCkge1xuICBkZWZhdWx0cy5oZWFkZXJzW21ldGhvZF0gPSB7fTtcbn0pO1xuXG51dGlscy5mb3JFYWNoKFsncG9zdCcsICdwdXQnLCAncGF0Y2gnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZFdpdGhEYXRhKG1ldGhvZCkge1xuICBkZWZhdWx0cy5oZWFkZXJzW21ldGhvZF0gPSB1dGlscy5tZXJnZShERUZBVUxUX0NPTlRFTlRfVFlQRSk7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBkZWZhdWx0cztcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBiaW5kKGZuLCB0aGlzQXJnKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKCkge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBlbmNvZGUodmFsKSB7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQodmFsKS5cbiAgICByZXBsYWNlKC8lM0EvZ2ksICc6JykuXG4gICAgcmVwbGFjZSgvJTI0L2csICckJykuXG4gICAgcmVwbGFjZSgvJTJDL2dpLCAnLCcpLlxuICAgIHJlcGxhY2UoLyUyMC9nLCAnKycpLlxuICAgIHJlcGxhY2UoLyU1Qi9naSwgJ1snKS5cbiAgICByZXBsYWNlKC8lNUQvZ2ksICddJyk7XG59XG5cbi8qKlxuICogQnVpbGQgYSBVUkwgYnkgYXBwZW5kaW5nIHBhcmFtcyB0byB0aGUgZW5kXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCBUaGUgYmFzZSBvZiB0aGUgdXJsIChlLmcuLCBodHRwOi8vd3d3Lmdvb2dsZS5jb20pXG4gKiBAcGFyYW0ge29iamVjdH0gW3BhcmFtc10gVGhlIHBhcmFtcyB0byBiZSBhcHBlbmRlZFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGZvcm1hdHRlZCB1cmxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBidWlsZFVSTCh1cmwsIHBhcmFtcywgcGFyYW1zU2VyaWFsaXplcikge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgaWYgKCFwYXJhbXMpIHtcbiAgICByZXR1cm4gdXJsO1xuICB9XG5cbiAgdmFyIHNlcmlhbGl6ZWRQYXJhbXM7XG4gIGlmIChwYXJhbXNTZXJpYWxpemVyKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtc1NlcmlhbGl6ZXIocGFyYW1zKTtcbiAgfSBlbHNlIGlmICh1dGlscy5pc1VSTFNlYXJjaFBhcmFtcyhwYXJhbXMpKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtcy50b1N0cmluZygpO1xuICB9IGVsc2Uge1xuICAgIHZhciBwYXJ0cyA9IFtdO1xuXG4gICAgdXRpbHMuZm9yRWFjaChwYXJhbXMsIGZ1bmN0aW9uIHNlcmlhbGl6ZSh2YWwsIGtleSkge1xuICAgICAgaWYgKHZhbCA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh1dGlscy5pc0FycmF5KHZhbCkpIHtcbiAgICAgICAga2V5ID0ga2V5ICsgJ1tdJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbCA9IFt2YWxdO1xuICAgICAgfVxuXG4gICAgICB1dGlscy5mb3JFYWNoKHZhbCwgZnVuY3Rpb24gcGFyc2VWYWx1ZSh2KSB7XG4gICAgICAgIGlmICh1dGlscy5pc0RhdGUodikpIHtcbiAgICAgICAgICB2ID0gdi50b0lTT1N0cmluZygpO1xuICAgICAgICB9IGVsc2UgaWYgKHV0aWxzLmlzT2JqZWN0KHYpKSB7XG4gICAgICAgICAgdiA9IEpTT04uc3RyaW5naWZ5KHYpO1xuICAgICAgICB9XG4gICAgICAgIHBhcnRzLnB1c2goZW5jb2RlKGtleSkgKyAnPScgKyBlbmNvZGUodikpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFydHMuam9pbignJicpO1xuICB9XG5cbiAgaWYgKHNlcmlhbGl6ZWRQYXJhbXMpIHtcbiAgICB2YXIgaGFzaG1hcmtJbmRleCA9IHVybC5pbmRleE9mKCcjJyk7XG4gICAgaWYgKGhhc2htYXJrSW5kZXggIT09IC0xKSB7XG4gICAgICB1cmwgPSB1cmwuc2xpY2UoMCwgaGFzaG1hcmtJbmRleCk7XG4gICAgfVxuXG4gICAgdXJsICs9ICh1cmwuaW5kZXhPZignPycpID09PSAtMSA/ICc/JyA6ICcmJykgKyBzZXJpYWxpemVkUGFyYW1zO1xuICB9XG5cbiAgcmV0dXJuIHVybDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBzcGVjaWZpZWQgVVJMc1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aXZlVVJMIFRoZSByZWxhdGl2ZSBVUkxcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21iaW5lZCBVUkxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZWxhdGl2ZVVSTCkge1xuICByZXR1cm4gcmVsYXRpdmVVUkxcbiAgICA/IGJhc2VVUkwucmVwbGFjZSgvXFwvKyQvLCAnJykgKyAnLycgKyByZWxhdGl2ZVVSTC5yZXBsYWNlKC9eXFwvKy8sICcnKVxuICAgIDogYmFzZVVSTDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoXG4gIHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkgP1xuXG4gIC8vIFN0YW5kYXJkIGJyb3dzZXIgZW52cyBzdXBwb3J0IGRvY3VtZW50LmNvb2tpZVxuICAgIChmdW5jdGlvbiBzdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUobmFtZSwgdmFsdWUsIGV4cGlyZXMsIHBhdGgsIGRvbWFpbiwgc2VjdXJlKSB7XG4gICAgICAgICAgdmFyIGNvb2tpZSA9IFtdO1xuICAgICAgICAgIGNvb2tpZS5wdXNoKG5hbWUgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpKTtcblxuICAgICAgICAgIGlmICh1dGlscy5pc051bWJlcihleHBpcmVzKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ2V4cGlyZXM9JyArIG5ldyBEYXRlKGV4cGlyZXMpLnRvR01UU3RyaW5nKCkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhwYXRoKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ3BhdGg9JyArIHBhdGgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhkb21haW4pKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnZG9tYWluPScgKyBkb21haW4pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzZWN1cmUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdzZWN1cmUnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBkb2N1bWVudC5jb29raWUgPSBjb29raWUuam9pbignOyAnKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZWFkOiBmdW5jdGlvbiByZWFkKG5hbWUpIHtcbiAgICAgICAgICB2YXIgbWF0Y2ggPSBkb2N1bWVudC5jb29raWUubWF0Y2gobmV3IFJlZ0V4cCgnKF58O1xcXFxzKikoJyArIG5hbWUgKyAnKT0oW147XSopJykpO1xuICAgICAgICAgIHJldHVybiAobWF0Y2ggPyBkZWNvZGVVUklDb21wb25lbnQobWF0Y2hbM10pIDogbnVsbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUobmFtZSkge1xuICAgICAgICAgIHRoaXMud3JpdGUobmFtZSwgJycsIERhdGUubm93KCkgLSA4NjQwMDAwMCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSkoKSA6XG5cbiAgLy8gTm9uIHN0YW5kYXJkIGJyb3dzZXIgZW52ICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAgIChmdW5jdGlvbiBub25TdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUoKSB7fSxcbiAgICAgICAgcmVhZDogZnVuY3Rpb24gcmVhZCgpIHsgcmV0dXJuIG51bGw7IH0sXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge31cbiAgICAgIH07XG4gICAgfSkoKVxuKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCBVUkwgaXMgYWJzb2x1dGVcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIFRoZSBVUkwgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHNwZWNpZmllZCBVUkwgaXMgYWJzb2x1dGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQWJzb2x1dGVVUkwodXJsKSB7XG4gIC8vIEEgVVJMIGlzIGNvbnNpZGVyZWQgYWJzb2x1dGUgaWYgaXQgYmVnaW5zIHdpdGggXCI8c2NoZW1lPjovL1wiIG9yIFwiLy9cIiAocHJvdG9jb2wtcmVsYXRpdmUgVVJMKS5cbiAgLy8gUkZDIDM5ODYgZGVmaW5lcyBzY2hlbWUgbmFtZSBhcyBhIHNlcXVlbmNlIG9mIGNoYXJhY3RlcnMgYmVnaW5uaW5nIHdpdGggYSBsZXR0ZXIgYW5kIGZvbGxvd2VkXG4gIC8vIGJ5IGFueSBjb21iaW5hdGlvbiBvZiBsZXR0ZXJzLCBkaWdpdHMsIHBsdXMsIHBlcmlvZCwgb3IgaHlwaGVuLlxuICByZXR1cm4gL14oW2Etel1bYS16XFxkXFwrXFwtXFwuXSo6KT9cXC9cXC8vaS50ZXN0KHVybCk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKFxuICB1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpID9cblxuICAvLyBTdGFuZGFyZCBicm93c2VyIGVudnMgaGF2ZSBmdWxsIHN1cHBvcnQgb2YgdGhlIEFQSXMgbmVlZGVkIHRvIHRlc3RcbiAgLy8gd2hldGhlciB0aGUgcmVxdWVzdCBVUkwgaXMgb2YgdGhlIHNhbWUgb3JpZ2luIGFzIGN1cnJlbnQgbG9jYXRpb24uXG4gICAgKGZ1bmN0aW9uIHN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHZhciBtc2llID0gLyhtc2llfHRyaWRlbnQpL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgICAgIHZhciB1cmxQYXJzaW5nTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgIHZhciBvcmlnaW5VUkw7XG5cbiAgICAgIC8qKlxuICAgICogUGFyc2UgYSBVUkwgdG8gZGlzY292ZXIgaXQncyBjb21wb25lbnRzXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHVybCBUaGUgVVJMIHRvIGJlIHBhcnNlZFxuICAgICogQHJldHVybnMge09iamVjdH1cbiAgICAqL1xuICAgICAgZnVuY3Rpb24gcmVzb2x2ZVVSTCh1cmwpIHtcbiAgICAgICAgdmFyIGhyZWYgPSB1cmw7XG5cbiAgICAgICAgaWYgKG1zaWUpIHtcbiAgICAgICAgLy8gSUUgbmVlZHMgYXR0cmlidXRlIHNldCB0d2ljZSB0byBub3JtYWxpemUgcHJvcGVydGllc1xuICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnNldEF0dHJpYnV0ZSgnaHJlZicsIGhyZWYpO1xuICAgICAgICAgIGhyZWYgPSB1cmxQYXJzaW5nTm9kZS5ocmVmO1xuICAgICAgICB9XG5cbiAgICAgICAgdXJsUGFyc2luZ05vZGUuc2V0QXR0cmlidXRlKCdocmVmJywgaHJlZik7XG5cbiAgICAgICAgLy8gdXJsUGFyc2luZ05vZGUgcHJvdmlkZXMgdGhlIFVybFV0aWxzIGludGVyZmFjZSAtIGh0dHA6Ly91cmwuc3BlYy53aGF0d2cub3JnLyN1cmx1dGlsc1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGhyZWY6IHVybFBhcnNpbmdOb2RlLmhyZWYsXG4gICAgICAgICAgcHJvdG9jb2w6IHVybFBhcnNpbmdOb2RlLnByb3RvY29sID8gdXJsUGFyc2luZ05vZGUucHJvdG9jb2wucmVwbGFjZSgvOiQvLCAnJykgOiAnJyxcbiAgICAgICAgICBob3N0OiB1cmxQYXJzaW5nTm9kZS5ob3N0LFxuICAgICAgICAgIHNlYXJjaDogdXJsUGFyc2luZ05vZGUuc2VhcmNoID8gdXJsUGFyc2luZ05vZGUuc2VhcmNoLnJlcGxhY2UoL15cXD8vLCAnJykgOiAnJyxcbiAgICAgICAgICBoYXNoOiB1cmxQYXJzaW5nTm9kZS5oYXNoID8gdXJsUGFyc2luZ05vZGUuaGFzaC5yZXBsYWNlKC9eIy8sICcnKSA6ICcnLFxuICAgICAgICAgIGhvc3RuYW1lOiB1cmxQYXJzaW5nTm9kZS5ob3N0bmFtZSxcbiAgICAgICAgICBwb3J0OiB1cmxQYXJzaW5nTm9kZS5wb3J0LFxuICAgICAgICAgIHBhdGhuYW1lOiAodXJsUGFyc2luZ05vZGUucGF0aG5hbWUuY2hhckF0KDApID09PSAnLycpID9cbiAgICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lIDpcbiAgICAgICAgICAgICcvJyArIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIG9yaWdpblVSTCA9IHJlc29sdmVVUkwod2luZG93LmxvY2F0aW9uLmhyZWYpO1xuXG4gICAgICAvKipcbiAgICAqIERldGVybWluZSBpZiBhIFVSTCBzaGFyZXMgdGhlIHNhbWUgb3JpZ2luIGFzIHRoZSBjdXJyZW50IGxvY2F0aW9uXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHJlcXVlc3RVUkwgVGhlIFVSTCB0byB0ZXN0XG4gICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiBVUkwgc2hhcmVzIHRoZSBzYW1lIG9yaWdpbiwgb3RoZXJ3aXNlIGZhbHNlXG4gICAgKi9cbiAgICAgIHJldHVybiBmdW5jdGlvbiBpc1VSTFNhbWVPcmlnaW4ocmVxdWVzdFVSTCkge1xuICAgICAgICB2YXIgcGFyc2VkID0gKHV0aWxzLmlzU3RyaW5nKHJlcXVlc3RVUkwpKSA/IHJlc29sdmVVUkwocmVxdWVzdFVSTCkgOiByZXF1ZXN0VVJMO1xuICAgICAgICByZXR1cm4gKHBhcnNlZC5wcm90b2NvbCA9PT0gb3JpZ2luVVJMLnByb3RvY29sICYmXG4gICAgICAgICAgICBwYXJzZWQuaG9zdCA9PT0gb3JpZ2luVVJMLmhvc3QpO1xuICAgICAgfTtcbiAgICB9KSgpIDpcblxuICAvLyBOb24gc3RhbmRhcmQgYnJvd3NlciBlbnZzICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAgIChmdW5jdGlvbiBub25TdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gaXNVUkxTYW1lT3JpZ2luKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH07XG4gICAgfSkoKVxuKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsIG5vcm1hbGl6ZWROYW1lKSB7XG4gIHV0aWxzLmZvckVhY2goaGVhZGVycywgZnVuY3Rpb24gcHJvY2Vzc0hlYWRlcih2YWx1ZSwgbmFtZSkge1xuICAgIGlmIChuYW1lICE9PSBub3JtYWxpemVkTmFtZSAmJiBuYW1lLnRvVXBwZXJDYXNlKCkgPT09IG5vcm1hbGl6ZWROYW1lLnRvVXBwZXJDYXNlKCkpIHtcbiAgICAgIGhlYWRlcnNbbm9ybWFsaXplZE5hbWVdID0gdmFsdWU7XG4gICAgICBkZWxldGUgaGVhZGVyc1tuYW1lXTtcbiAgICB9XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG4vLyBIZWFkZXJzIHdob3NlIGR1cGxpY2F0ZXMgYXJlIGlnbm9yZWQgYnkgbm9kZVxuLy8gYy5mLiBodHRwczovL25vZGVqcy5vcmcvYXBpL2h0dHAuaHRtbCNodHRwX21lc3NhZ2VfaGVhZGVyc1xudmFyIGlnbm9yZUR1cGxpY2F0ZU9mID0gW1xuICAnYWdlJywgJ2F1dGhvcml6YXRpb24nLCAnY29udGVudC1sZW5ndGgnLCAnY29udGVudC10eXBlJywgJ2V0YWcnLFxuICAnZXhwaXJlcycsICdmcm9tJywgJ2hvc3QnLCAnaWYtbW9kaWZpZWQtc2luY2UnLCAnaWYtdW5tb2RpZmllZC1zaW5jZScsXG4gICdsYXN0LW1vZGlmaWVkJywgJ2xvY2F0aW9uJywgJ21heC1mb3J3YXJkcycsICdwcm94eS1hdXRob3JpemF0aW9uJyxcbiAgJ3JlZmVyZXInLCAncmV0cnktYWZ0ZXInLCAndXNlci1hZ2VudCdcbl07XG5cbi8qKlxuICogUGFyc2UgaGVhZGVycyBpbnRvIGFuIG9iamVjdFxuICpcbiAqIGBgYFxuICogRGF0ZTogV2VkLCAyNyBBdWcgMjAxNCAwODo1ODo0OSBHTVRcbiAqIENvbnRlbnQtVHlwZTogYXBwbGljYXRpb24vanNvblxuICogQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVxuICogVHJhbnNmZXItRW5jb2Rpbmc6IGNodW5rZWRcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBoZWFkZXJzIEhlYWRlcnMgbmVlZGluZyB0byBiZSBwYXJzZWRcbiAqIEByZXR1cm5zIHtPYmplY3R9IEhlYWRlcnMgcGFyc2VkIGludG8gYW4gb2JqZWN0XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcGFyc2VIZWFkZXJzKGhlYWRlcnMpIHtcbiAgdmFyIHBhcnNlZCA9IHt9O1xuICB2YXIga2V5O1xuICB2YXIgdmFsO1xuICB2YXIgaTtcblxuICBpZiAoIWhlYWRlcnMpIHsgcmV0dXJuIHBhcnNlZDsgfVxuXG4gIHV0aWxzLmZvckVhY2goaGVhZGVycy5zcGxpdCgnXFxuJyksIGZ1bmN0aW9uIHBhcnNlcihsaW5lKSB7XG4gICAgaSA9IGxpbmUuaW5kZXhPZignOicpO1xuICAgIGtleSA9IHV0aWxzLnRyaW0obGluZS5zdWJzdHIoMCwgaSkpLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFsID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cihpICsgMSkpO1xuXG4gICAgaWYgKGtleSkge1xuICAgICAgaWYgKHBhcnNlZFtrZXldICYmIGlnbm9yZUR1cGxpY2F0ZU9mLmluZGV4T2Yoa2V5KSA+PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChrZXkgPT09ICdzZXQtY29va2llJykge1xuICAgICAgICBwYXJzZWRba2V5XSA9IChwYXJzZWRba2V5XSA/IHBhcnNlZFtrZXldIDogW10pLmNvbmNhdChbdmFsXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYXJzZWRba2V5XSA9IHBhcnNlZFtrZXldID8gcGFyc2VkW2tleV0gKyAnLCAnICsgdmFsIDogdmFsO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHBhcnNlZDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogU3ludGFjdGljIHN1Z2FyIGZvciBpbnZva2luZyBhIGZ1bmN0aW9uIGFuZCBleHBhbmRpbmcgYW4gYXJyYXkgZm9yIGFyZ3VtZW50cy5cbiAqXG4gKiBDb21tb24gdXNlIGNhc2Ugd291bGQgYmUgdG8gdXNlIGBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHlgLlxuICpcbiAqICBgYGBqc1xuICogIGZ1bmN0aW9uIGYoeCwgeSwgeikge31cbiAqICB2YXIgYXJncyA9IFsxLCAyLCAzXTtcbiAqICBmLmFwcGx5KG51bGwsIGFyZ3MpO1xuICogIGBgYFxuICpcbiAqIFdpdGggYHNwcmVhZGAgdGhpcyBleGFtcGxlIGNhbiBiZSByZS13cml0dGVuLlxuICpcbiAqICBgYGBqc1xuICogIHNwcmVhZChmdW5jdGlvbih4LCB5LCB6KSB7fSkoWzEsIDIsIDNdKTtcbiAqICBgYGBcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHJldHVybnMge0Z1bmN0aW9ufVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNwcmVhZChjYWxsYmFjaykge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcChhcnIpIHtcbiAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkobnVsbCwgYXJyKTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBiaW5kID0gcmVxdWlyZSgnLi9oZWxwZXJzL2JpbmQnKTtcblxuLypnbG9iYWwgdG9TdHJpbmc6dHJ1ZSovXG5cbi8vIHV0aWxzIGlzIGEgbGlicmFyeSBvZiBnZW5lcmljIGhlbHBlciBmdW5jdGlvbnMgbm9uLXNwZWNpZmljIHRvIGF4aW9zXG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXkodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgdW5kZWZpbmVkXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHZhbHVlIGlzIHVuZGVmaW5lZCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3VuZGVmaW5lZCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQnVmZmVyKHZhbCkge1xuICByZXR1cm4gdmFsICE9PSBudWxsICYmICFpc1VuZGVmaW5lZCh2YWwpICYmIHZhbC5jb25zdHJ1Y3RvciAhPT0gbnVsbCAmJiAhaXNVbmRlZmluZWQodmFsLmNvbnN0cnVjdG9yKVxuICAgICYmIHR5cGVvZiB2YWwuY29uc3RydWN0b3IuaXNCdWZmZXIgPT09ICdmdW5jdGlvbicgJiYgdmFsLmNvbnN0cnVjdG9yLmlzQnVmZmVyKHZhbCk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXIodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5QnVmZmVyXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGb3JtRGF0YVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEZvcm1EYXRhLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGb3JtRGF0YSh2YWwpIHtcbiAgcmV0dXJuICh0eXBlb2YgRm9ybURhdGEgIT09ICd1bmRlZmluZWQnKSAmJiAodmFsIGluc3RhbmNlb2YgRm9ybURhdGEpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXJWaWV3KHZhbCkge1xuICB2YXIgcmVzdWx0O1xuICBpZiAoKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcpICYmIChBcnJheUJ1ZmZlci5pc1ZpZXcpKSB7XG4gICAgcmVzdWx0ID0gQXJyYXlCdWZmZXIuaXNWaWV3KHZhbCk7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ID0gKHZhbCkgJiYgKHZhbC5idWZmZXIpICYmICh2YWwuYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBTdHJpbmdcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFN0cmluZywgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyaW5nKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3N0cmluZyc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBOdW1iZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIE51bWJlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzTnVtYmVyKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ251bWJlcic7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gT2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBwbGFpbiBPYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgcGxhaW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWwpIHtcbiAgaWYgKHRvU3RyaW5nLmNhbGwodmFsKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgcHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbCk7XG4gIHJldHVybiBwcm90b3R5cGUgPT09IG51bGwgfHwgcHJvdG90eXBlID09PSBPYmplY3QucHJvdG90eXBlO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRGF0ZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRGF0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRGF0ZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRmlsZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRmlsZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRmlsZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRmlsZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgQmxvYlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgQmxvYiwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQmxvYih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQmxvYl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEZ1bmN0aW9uLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFN0cmVhbVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgU3RyZWFtLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTdHJlYW0odmFsKSB7XG4gIHJldHVybiBpc09iamVjdCh2YWwpICYmIGlzRnVuY3Rpb24odmFsLnBpcGUpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVVJMU2VhcmNoUGFyYW1zKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIFVSTFNlYXJjaFBhcmFtcyAhPT0gJ3VuZGVmaW5lZCcgJiYgdmFsIGluc3RhbmNlb2YgVVJMU2VhcmNoUGFyYW1zO1xufVxuXG4vKipcbiAqIFRyaW0gZXhjZXNzIHdoaXRlc3BhY2Ugb2ZmIHRoZSBiZWdpbm5pbmcgYW5kIGVuZCBvZiBhIHN0cmluZ1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgVGhlIFN0cmluZyB0byB0cmltXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgU3RyaW5nIGZyZWVkIG9mIGV4Y2VzcyB3aGl0ZXNwYWNlXG4gKi9cbmZ1bmN0aW9uIHRyaW0oc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyovLCAnJykucmVwbGFjZSgvXFxzKiQvLCAnJyk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIHdlJ3JlIHJ1bm5pbmcgaW4gYSBzdGFuZGFyZCBicm93c2VyIGVudmlyb25tZW50XG4gKlxuICogVGhpcyBhbGxvd3MgYXhpb3MgdG8gcnVuIGluIGEgd2ViIHdvcmtlciwgYW5kIHJlYWN0LW5hdGl2ZS5cbiAqIEJvdGggZW52aXJvbm1lbnRzIHN1cHBvcnQgWE1MSHR0cFJlcXVlc3QsIGJ1dCBub3QgZnVsbHkgc3RhbmRhcmQgZ2xvYmFscy5cbiAqXG4gKiB3ZWIgd29ya2VyczpcbiAqICB0eXBlb2Ygd2luZG93IC0+IHVuZGVmaW5lZFxuICogIHR5cGVvZiBkb2N1bWVudCAtPiB1bmRlZmluZWRcbiAqXG4gKiByZWFjdC1uYXRpdmU6XG4gKiAgbmF2aWdhdG9yLnByb2R1Y3QgLT4gJ1JlYWN0TmF0aXZlJ1xuICogbmF0aXZlc2NyaXB0XG4gKiAgbmF2aWdhdG9yLnByb2R1Y3QgLT4gJ05hdGl2ZVNjcmlwdCcgb3IgJ05TJ1xuICovXG5mdW5jdGlvbiBpc1N0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnICYmIChuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ1JlYWN0TmF0aXZlJyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRvci5wcm9kdWN0ID09PSAnTmF0aXZlU2NyaXB0JyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRvci5wcm9kdWN0ID09PSAnTlMnKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gKFxuICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmXG4gICAgdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJ1xuICApO1xufVxuXG4vKipcbiAqIEl0ZXJhdGUgb3ZlciBhbiBBcnJheSBvciBhbiBPYmplY3QgaW52b2tpbmcgYSBmdW5jdGlvbiBmb3IgZWFjaCBpdGVtLlxuICpcbiAqIElmIGBvYmpgIGlzIGFuIEFycmF5IGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIHBhc3NpbmdcbiAqIHRoZSB2YWx1ZSwgaW5kZXgsIGFuZCBjb21wbGV0ZSBhcnJheSBmb3IgZWFjaCBpdGVtLlxuICpcbiAqIElmICdvYmonIGlzIGFuIE9iamVjdCBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBwYXNzaW5nXG4gKiB0aGUgdmFsdWUsIGtleSwgYW5kIGNvbXBsZXRlIG9iamVjdCBmb3IgZWFjaCBwcm9wZXJ0eS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdHxBcnJheX0gb2JqIFRoZSBvYmplY3QgdG8gaXRlcmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGNhbGxiYWNrIHRvIGludm9rZSBmb3IgZWFjaCBpdGVtXG4gKi9cbmZ1bmN0aW9uIGZvckVhY2gob2JqLCBmbikge1xuICAvLyBEb24ndCBib3RoZXIgaWYgbm8gdmFsdWUgcHJvdmlkZWRcbiAgaWYgKG9iaiA9PT0gbnVsbCB8fCB0eXBlb2Ygb2JqID09PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIEZvcmNlIGFuIGFycmF5IGlmIG5vdCBhbHJlYWR5IHNvbWV0aGluZyBpdGVyYWJsZVxuICBpZiAodHlwZW9mIG9iaiAhPT0gJ29iamVjdCcpIHtcbiAgICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgICBvYmogPSBbb2JqXTtcbiAgfVxuXG4gIGlmIChpc0FycmF5KG9iaikpIHtcbiAgICAvLyBJdGVyYXRlIG92ZXIgYXJyYXkgdmFsdWVzXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBvYmoubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBmbi5jYWxsKG51bGwsIG9ialtpXSwgaSwgb2JqKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIG9iamVjdCBrZXlzXG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIHtcbiAgICAgICAgZm4uY2FsbChudWxsLCBvYmpba2V5XSwga2V5LCBvYmopO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEFjY2VwdHMgdmFyYXJncyBleHBlY3RpbmcgZWFjaCBhcmd1bWVudCB0byBiZSBhbiBvYmplY3QsIHRoZW5cbiAqIGltbXV0YWJseSBtZXJnZXMgdGhlIHByb3BlcnRpZXMgb2YgZWFjaCBvYmplY3QgYW5kIHJldHVybnMgcmVzdWx0LlxuICpcbiAqIFdoZW4gbXVsdGlwbGUgb2JqZWN0cyBjb250YWluIHRoZSBzYW1lIGtleSB0aGUgbGF0ZXIgb2JqZWN0IGluXG4gKiB0aGUgYXJndW1lbnRzIGxpc3Qgd2lsbCB0YWtlIHByZWNlZGVuY2UuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiBgYGBqc1xuICogdmFyIHJlc3VsdCA9IG1lcmdlKHtmb286IDEyM30sIHtmb286IDQ1Nn0pO1xuICogY29uc29sZS5sb2cocmVzdWx0LmZvbyk7IC8vIG91dHB1dHMgNDU2XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqMSBPYmplY3QgdG8gbWVyZ2VcbiAqIEByZXR1cm5zIHtPYmplY3R9IFJlc3VsdCBvZiBhbGwgbWVyZ2UgcHJvcGVydGllc1xuICovXG5mdW5jdGlvbiBtZXJnZSgvKiBvYmoxLCBvYmoyLCBvYmozLCAuLi4gKi8pIHtcbiAgdmFyIHJlc3VsdCA9IHt9O1xuICBmdW5jdGlvbiBhc3NpZ25WYWx1ZSh2YWwsIGtleSkge1xuICAgIGlmIChpc1BsYWluT2JqZWN0KHJlc3VsdFtrZXldKSAmJiBpc1BsYWluT2JqZWN0KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gbWVyZ2UocmVzdWx0W2tleV0sIHZhbCk7XG4gICAgfSBlbHNlIGlmIChpc1BsYWluT2JqZWN0KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gbWVyZ2Uoe30sIHZhbCk7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gdmFsLnNsaWNlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdFtrZXldID0gdmFsO1xuICAgIH1cbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwLCBsID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIGZvckVhY2goYXJndW1lbnRzW2ldLCBhc3NpZ25WYWx1ZSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBFeHRlbmRzIG9iamVjdCBhIGJ5IG11dGFibHkgYWRkaW5nIHRvIGl0IHRoZSBwcm9wZXJ0aWVzIG9mIG9iamVjdCBiLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhIFRoZSBvYmplY3QgdG8gYmUgZXh0ZW5kZWRcbiAqIEBwYXJhbSB7T2JqZWN0fSBiIFRoZSBvYmplY3QgdG8gY29weSBwcm9wZXJ0aWVzIGZyb21cbiAqIEBwYXJhbSB7T2JqZWN0fSB0aGlzQXJnIFRoZSBvYmplY3QgdG8gYmluZCBmdW5jdGlvbiB0b1xuICogQHJldHVybiB7T2JqZWN0fSBUaGUgcmVzdWx0aW5nIHZhbHVlIG9mIG9iamVjdCBhXG4gKi9cbmZ1bmN0aW9uIGV4dGVuZChhLCBiLCB0aGlzQXJnKSB7XG4gIGZvckVhY2goYiwgZnVuY3Rpb24gYXNzaWduVmFsdWUodmFsLCBrZXkpIHtcbiAgICBpZiAodGhpc0FyZyAmJiB0eXBlb2YgdmFsID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBhW2tleV0gPSBiaW5kKHZhbCwgdGhpc0FyZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFba2V5XSA9IHZhbDtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gYTtcbn1cblxuLyoqXG4gKiBSZW1vdmUgYnl0ZSBvcmRlciBtYXJrZXIuIFRoaXMgY2F0Y2hlcyBFRiBCQiBCRiAodGhlIFVURi04IEJPTSlcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gY29udGVudCB3aXRoIEJPTVxuICogQHJldHVybiB7c3RyaW5nfSBjb250ZW50IHZhbHVlIHdpdGhvdXQgQk9NXG4gKi9cbmZ1bmN0aW9uIHN0cmlwQk9NKGNvbnRlbnQpIHtcbiAgaWYgKGNvbnRlbnQuY2hhckNvZGVBdCgwKSA9PT0gMHhGRUZGKSB7XG4gICAgY29udGVudCA9IGNvbnRlbnQuc2xpY2UoMSk7XG4gIH1cbiAgcmV0dXJuIGNvbnRlbnQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpc0FycmF5OiBpc0FycmF5LFxuICBpc0FycmF5QnVmZmVyOiBpc0FycmF5QnVmZmVyLFxuICBpc0J1ZmZlcjogaXNCdWZmZXIsXG4gIGlzRm9ybURhdGE6IGlzRm9ybURhdGEsXG4gIGlzQXJyYXlCdWZmZXJWaWV3OiBpc0FycmF5QnVmZmVyVmlldyxcbiAgaXNTdHJpbmc6IGlzU3RyaW5nLFxuICBpc051bWJlcjogaXNOdW1iZXIsXG4gIGlzT2JqZWN0OiBpc09iamVjdCxcbiAgaXNQbGFpbk9iamVjdDogaXNQbGFpbk9iamVjdCxcbiAgaXNVbmRlZmluZWQ6IGlzVW5kZWZpbmVkLFxuICBpc0RhdGU6IGlzRGF0ZSxcbiAgaXNGaWxlOiBpc0ZpbGUsXG4gIGlzQmxvYjogaXNCbG9iLFxuICBpc0Z1bmN0aW9uOiBpc0Z1bmN0aW9uLFxuICBpc1N0cmVhbTogaXNTdHJlYW0sXG4gIGlzVVJMU2VhcmNoUGFyYW1zOiBpc1VSTFNlYXJjaFBhcmFtcyxcbiAgaXNTdGFuZGFyZEJyb3dzZXJFbnY6IGlzU3RhbmRhcmRCcm93c2VyRW52LFxuICBmb3JFYWNoOiBmb3JFYWNoLFxuICBtZXJnZTogbWVyZ2UsXG4gIGV4dGVuZDogZXh0ZW5kLFxuICB0cmltOiB0cmltLFxuICBzdHJpcEJPTTogc3RyaXBCT01cbn07XG4iLCIvLyBJbXBvcnRzXG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyBmcm9tIFwiLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2Nzc1dpdGhNYXBwaW5nVG9TdHJpbmcuanNcIjtcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18gZnJvbSBcIi4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanNcIjtcbmltcG9ydCBfX19DU1NfTE9BREVSX0dFVF9VUkxfSU1QT1JUX19fIGZyb20gXCIuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvZ2V0VXJsLmpzXCI7XG5pbXBvcnQgX19fQ1NTX0xPQURFUl9VUkxfSU1QT1JUXzBfX18gZnJvbSBcIi4uL2ltZy9sb2dpbi1iZy5qcGdcIjtcbnZhciBfX19DU1NfTE9BREVSX0VYUE9SVF9fXyA9IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyhfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fKTtcbnZhciBfX19DU1NfTE9BREVSX1VSTF9SRVBMQUNFTUVOVF8wX19fID0gX19fQ1NTX0xPQURFUl9HRVRfVVJMX0lNUE9SVF9fXyhfX19DU1NfTE9BREVSX1VSTF9JTVBPUlRfMF9fXyk7XG4vLyBNb2R1bGVcbl9fX0NTU19MT0FERVJfRVhQT1JUX19fLnB1c2goW21vZHVsZS5pZCwgXCIqLFxcbio6OmFmdGVyLFxcbio6OmJlZm9yZSB7XFxuICBtYXJnaW46IDA7XFxuICBwYWRkaW5nOiAwO1xcbiAgYm94LXNpemluZzogaW5oZXJpdDsgfVxcblxcbmh0bWwge1xcbiAgZm9udC1zaXplOiA2Mi41JTsgfVxcblxcbmJvZHkge1xcbiAgYm94LXNpemluZzogYm9yZGVyLWJveDtcXG4gIG92ZXJmbG93LXg6IGhpZGRlbjtcXG4gIGZvbnQtc2l6ZTogMS42cmVtO1xcbiAgYmFja2dyb3VuZC1zaXplOiBjb3ZlcjtcXG4gIGJhY2tncm91bmQtcmVwZWF0OiBuby1yZXBlYXQ7XFxuICBoZWlnaHQ6IDEyNy41cmVtO1xcbiAgZm9udC1mYW1pbHk6ICdMYXRvJywgc2Fucy1zZXJpZjsgfVxcblxcbltoaWRkZW5dIHtcXG4gIGRpc3BsYXk6IG5vbmUgIWltcG9ydGFudDsgfVxcblxcbi5oZWFkaW5nLXRlcnRpYXJ5IHtcXG4gIGZvbnQtc2l6ZTogMi40cmVtO1xcbiAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTsgfVxcbiAgLmhlYWRpbmctdGVydGlhcnktLXdoaXRlIHtcXG4gICAgY29sb3I6ICNmZmY7IH1cXG5cXG4ubWItMTAge1xcbiAgbWFyZ2luLWJvdHRvbTogMXJlbTsgfVxcblxcbi5tYi0yMCB7XFxuICBtYXJnaW4tYm90dG9tOiAycmVtOyB9XFxuXFxuLm10LTUwIHtcXG4gIG1hcmdpbi10b3A6IDVyZW07IH1cXG5cXG4uYnRuLCAuYnRuOmxpbmssIC5idG46dmlzaXRlZCB7XFxuICBwYWRkaW5nOiAuNzVyZW0gMnJlbTtcXG4gIGJvcmRlci1yYWRpdXM6IC41cmVtO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2YyZjJmMjtcXG4gIGZvbnQtd2VpZ2h0OiA0MDA7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7IH1cXG5cXG4uYnRuOmFjdGl2ZSwgLmJ0bjpmb2N1cyB7XFxuICBvdXRsaW5lOiBub25lO1xcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC0xcHgpO1xcbiAgYm94LXNoYWRvdzogMCAwLjVyZW0gMXJlbSByZ2JhKDAsIDAsIDAsIDAuMik7IH1cXG5cXG4ubG9naW4tZm9ybV9fZ3JvdXA6bm90KDpsYXN0LWNoaWxkKSB7XFxuICBtYXJnaW4tYm90dG9tOiAyLjVyZW07IH1cXG5cXG4ubG9naW4tZm9ybV9fbGFiZWwge1xcbiAgbWFyZ2luLXJpZ2h0OiAuN3JlbTtcXG4gIGNvbG9yOiAjZmZmO1xcbiAgZm9udC1zaXplOiAxLjhyZW07XFxuICBmb250LXdlaWdodDogNDAwOyB9XFxuXFxuLmxvZ2luLWZvcm1fX2lucHV0IHtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxuICBwYWRkaW5nOiAuNXJlbSAwO1xcbiAgYm9yZGVyOiBub25lOyB9XFxuXFxuLmxvZ2luLWZvcm1fX2J0bi13cmFwcGVyIHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsgfVxcblxcbi5sb2dpbl9fcmVnaXN0ZXItdGV4dCB7XFxuICBtYXJnaW4tdG9wOiAxLjVyZW07XFxuICBjb2xvcjogI2ZmZjsgfVxcblxcbi5sb2dpbl9fcmVnaXN0ZXItbGluayB7XFxuICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICBjb2xvcjogI2ZmZjtcXG4gIHRyYW5zaXRpb246IGFsbCAuMnM7IH1cXG4gIC5sb2dpbl9fcmVnaXN0ZXItbGluazpob3ZlciB7XFxuICAgIGNvbG9yOiAjZmY4MDAwO1xcbiAgICB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZTsgfVxcblxcbi5uYXYge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxuICBwYWRkaW5nOiAycmVtIDZyZW07XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICMwMDA7IH1cXG4gIC5uYXZfX2l0ZW0ge1xcbiAgICBsaXN0LXN0eWxlOiBub25lOyB9XFxuICAgIC5uYXZfX2l0ZW0tLXNlYXJjaCB7XFxuICAgICAgZmxleDogMCAwIDI1JTsgfVxcbiAgLm5hdl9fbGluayB7XFxuICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gICAgY29sb3I6ICMwMDA7XFxuICAgIHRyYW5zaXRpb246IGFsbCAuMnM7IH1cXG4gICAgLm5hdl9fbGluazpob3ZlciB7XFxuICAgICAgbWFyZ2luLWJvdHRvbTogMnB4O1xcbiAgICAgIGNvbG9yOiAjZmZhNjRkO1xcbiAgICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjZmZhNjRkOyB9XFxuICAgIC5uYXZfX2xpbmstLWhvbWU6aG92ZXIgLm5hdl9faWNvbi1wYXRoLS1ob21lIHtcXG4gICAgICBmaWxsOiAjZmY4MDAwOyB9XFxuICAubmF2X19zZWFyY2gge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfVxcbiAgICAubmF2X19zZWFyY2gtaW5wdXQge1xcbiAgICAgIHdpZHRoOiA5MCU7XFxuICAgICAgYm9yZGVyLXJhZGl1czogM3JlbTtcXG4gICAgICBwYWRkaW5nOiAxcmVtIDJyZW07XFxuICAgICAgYm9yZGVyOiAxcHggc29saWQgI2JmYmZiZjtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjJmMmYyO1xcbiAgICAgIHRyYW5zaXRpb246IHdpZHRoIC4yczsgfVxcbiAgICAgIC5uYXZfX3NlYXJjaC1pbnB1dDpmb2N1cyB7XFxuICAgICAgICBvdXRsaW5lOiBub25lO1xcbiAgICAgICAgd2lkdGg6IDEyMCU7IH1cXG4gIC5uYXZfX2ljb24tc2l6aW5nLS1ob21lIHtcXG4gICAgd2lkdGg6IDNyZW07XFxuICAgIGhlaWdodDogM3JlbTsgfVxcbiAgLm5hdl9faWNvbi1zaXppbmctLXNlYXJjaCB7XFxuICAgIHdpZHRoOiAycmVtO1xcbiAgICBoZWlnaHQ6IDJyZW07XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtMTUwJSk7IH1cXG4gIC5uYXZfX2ljb24tcGF0aCB7XFxuICAgIGZpbGw6ICNiZmJmYmY7IH1cXG5cXG4ucmVnaXN0ZXItZm9ybV9fZ3JvdXAge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cXG4gIC5yZWdpc3Rlci1mb3JtX19ncm91cDpub3QoOmxhc3QtY2hpbGQpIHtcXG4gICAgbWFyZ2luLWJvdHRvbTogM3JlbTsgfVxcblxcbi5yZWdpc3Rlci1mb3JtX19sYWJlbCB7XFxuICBtYXJnaW4tcmlnaHQ6IDRyZW07XFxuICBjb2xvcjogI2ZmZjtcXG4gIGZvbnQtc2l6ZTogMS44cmVtO1xcbiAgZm9udC13ZWlnaHQ6IDQwMDsgfVxcblxcbi5yZWdpc3Rlci1mb3JtX19pbnB1dCB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjJmMmYyO1xcbiAgcGFkZGluZzogLjVyZW0gMDtcXG4gIGJvcmRlcjogbm9uZTsgfVxcblxcbi5yZWdpc3Rlci1mb3JtX19idG4td3JhcHBlciB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7IH1cXG5cXG4ucmVnaXN0ZXJfX2xvZ2luLXRleHQge1xcbiAgbWFyZ2luLXRvcDogMS41cmVtO1xcbiAgY29sb3I6ICNmZmY7IH1cXG5cXG4ucmVnaXN0ZXJfX2xvZ2luLWxpbmsge1xcbiAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgY29sb3I6ICNmZmY7XFxuICB0cmFuc2l0aW9uOiBhbGwgLjJzOyB9XFxuICAucmVnaXN0ZXJfX2xvZ2luLWxpbms6aG92ZXIge1xcbiAgICBjb2xvcjogI2ZmODAwMDtcXG4gICAgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmU7IH1cXG5cXG4uZXJyb3Ige1xcbiAgbWFyZ2luLXRvcDogMnJlbTtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZjgwODA7XFxuICBib3JkZXItcmFkaXVzOiAxMHB4O1xcbiAgcGFkZGluZzogMnJlbTtcXG4gIGZvbnQtc2l6ZTogMnJlbTtcXG4gIGdyaWQtY29sdW1uOiBjZW50ZXItc3RhcnQgLyBjZW50ZXItZW5kO1xcbiAgZm9udC13ZWlnaHQ6IDcwMDsgfVxcblxcbi5zZWFyY2gtZm9ybSB7XFxuICBwYWRkaW5nOiAycmVtIDI1cmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX2dyb3VwIHtcXG4gICAgd2lkdGg6IDc1JTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgbWFyZ2luLWJvdHRvbTogM3JlbTtcXG4gICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICMwMDA7XFxuICAgIGFsaWduLWl0ZW1zOiBmbGV4LXN0YXJ0O1xcbiAgICBwYWRkaW5nOiAuNXJlbSA0cmVtIC41cmVtIDA7IH1cXG4gIC5zZWFyY2gtZm9ybV9fbGFiZWwge1xcbiAgICBmbGV4OiAwIDAgMjAlO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogZmxleC1zdGFydDtcXG4gICAgbWFyZ2luLXRvcDogLjdyZW07IH1cXG4gIC5zZWFyY2gtZm9ybV9fZ3JvdXAtaW5wdXQtd3JhcHBlciB7XFxuICAgIGZsZXg6IDAgMCA4MCU7IH1cXG4gIC5zZWFyY2gtZm9ybV9fdGlwIHtcXG4gICAgZm9udC1zaXplOiAxcmVtO1xcbiAgICBsaW5lLWhlaWdodDogMS40O1xcbiAgICB3aWR0aDogNzAlOyB9XFxuICAuc2VhcmNoLWZvcm1fX2lucHV0LXRleHQge1xcbiAgICB3aWR0aDogNDByZW07XFxuICAgIGhlaWdodDogNHJlbTtcXG4gICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcXG4gICAgcGFkZGluZzogMXJlbTtcXG4gICAgYm9yZGVyOiBzb2xpZCAxcHggI2JmYmZiZjtcXG4gICAgYm9yZGVyLXJhZGl1czogNXB4OyB9XFxuICAgIC5zZWFyY2gtZm9ybV9faW5wdXQtdGV4dDpmb2N1cyB7XFxuICAgICAgYm9yZGVyOiBzb2xpZCAxcHggIzAwMDsgfVxcbiAgLnNlYXJjaC1mb3JtX19ncm91cC0tY2hlY2tib3gge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBtYXJnaW4tYm90dG9tOiAxcmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX2xhYmVsLS1jaGVja2JveCB7XFxuICAgIG1hcmdpbi1yaWdodDogMXJlbTsgfVxcbiAgLnNlYXJjaC1mb3JtX19pbnB1dC1jaGVja2JveCB7XFxuICAgIHdpZHRoOiAyLjI1cmVtO1xcbiAgICBoZWlnaHQ6IDIuMjVyZW07XFxuICAgIG1hcmdpbi1yaWdodDogLjhyZW07IH1cXG4gIC5zZWFyY2gtZm9ybV9fY2hlY2tib3gtd3JhcHBlciB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cXG4gIC5zZWFyY2gtZm9ybV9fc2VsZWN0LW1lbnUge1xcbiAgICBtYXJnaW4tYm90dG9tOiAxcmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX3N2Zy1zaXplIHtcXG4gICAgaGVpZ2h0OiAycmVtO1xcbiAgICB3aWR0aDogMnJlbTtcXG4gICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX3N1Ym1pdCB7XFxuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgcGFkZGluZzogLjdyZW07XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkICNiMzAwYjM7IH1cXG4gIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tc3BhbiB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH1cXG4gIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMsIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtc2V0cyB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICAgIGxpc3Qtc3R5bGU6IG5vbmU7XFxuICAgIG1hcmdpbi1ib3R0b206IC4zcmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLWxpc3QtaXRlbSwgLnNlYXJjaC1mb3JtX19zZWxlY3RlZC1zZXRzLWxpc3QtaXRlbSB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIG1hcmdpbi1ib3R0b206IC43cmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLXJlbW92ZS1idG4sIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtc2V0cy1yZW1vdmUtYnRuIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgaGVpZ2h0OiAycmVtO1xcbiAgICB3aWR0aDogMnJlbTtcXG4gICAgZm9udC1zaXplOiAxLjNyZW07XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmMmYyZjI7XFxuICAgIG1hcmdpbi1yaWdodDogLjdyZW07IH1cXG4gIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlciB7XFxuICAgIGhlaWdodDogMnJlbTtcXG4gICAgd2lkdGg6IDIuNzVyZW07XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgIGZvbnQtc2l6ZTogMS4zcmVtO1xcbiAgICBtYXJnaW4tcmlnaHQ6IC43cmVtOyB9XFxuICAgIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlci0taXMge1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICM0N2QxNDc7IH1cXG4gICAgLnNlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy10b2dnbGVyLS1ub3Qge1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmZjAwMDA7IH1cXG4gIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24ge1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIG1heC1oZWlnaHQ6IDI4cmVtO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgICB6LWluZGV4OiAyO1xcbiAgICB0b3A6IDEwMCU7XFxuICAgIHdpZHRoOiA0MHJlbTtcXG4gICAgbWFyZ2luLXRvcDogLTFyZW07XFxuICAgIG92ZXJmbG93LXk6IGF1dG87XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkICMwMDA7IH1cXG4gICAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0IHtcXG4gICAgICBsaXN0LXN0eWxlOiBub25lOyB9XFxuICAgICAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0LWNhdGVnb3J5IHtcXG4gICAgICAgIHBhZGRpbmc6IC41cmVtOyB9XFxuICAgICAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0LW9wdGlvbiB7XFxuICAgICAgICBwYWRkaW5nOiAuM3JlbSAycmVtO1xcbiAgICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cXG4gICAgICAgIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1vcHRpb246aG92ZXIge1xcbiAgICAgICAgICBjdXJzb3I6IHBvaW50ZXI7IH1cXG4gICAgICAgIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1vcHRpb24tLWhpZ2hsaWdodGVkIHtcXG4gICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2NjZDhmZjsgfVxcbiAgICAgICAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0LW9wdGlvbiBzcGFuIHtcXG4gICAgICAgICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcXG4gICAgICAgICAgbWFyZ2luLWxlZnQ6IDFyZW07IH1cXG4gICAgICAuc2VhcmNoLWZvcm1fX2Ryb3Bkb3duLWxpc3QtaW1nIHtcXG4gICAgICAgIHdpZHRoOiAycmVtO1xcbiAgICAgICAgaGVpZ2h0OiAycmVtO1xcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAuN3JlbTsgfVxcblxcbi5kcm9wZG93bi13cmFwcGVyIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcblxcbi5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzk5YjFmZjtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcXG4gIHBhZGRpbmc6IDAgMTAlO1xcbiAgbWFyZ2luLWJvdHRvbTogLjFyZW07IH1cXG4gIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtc2VsZWN0IHtcXG4gICAgY29sb3I6ICNiMzAwYjM7XFxuICAgIG1hcmdpbi1yaWdodDogMXJlbTsgfVxcbiAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1sYWJlbCB7XFxuICAgIGNvbG9yOiAjYjMwMGIzOyB9XFxuICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXJpZ2h0IHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfVxcbiAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1wYWdpbmF0aW9uLWNvbnRhaW5lciB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNjY2Q4ZmY7XFxuICAgIGN1cnNvcjogcG9pbnRlcjsgfVxcbiAgICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXBhZ2luYXRpb24tY29udGFpbmVyOm5vdCg6bGFzdC1jaGlsZCkge1xcbiAgICAgIG1hcmdpbi1yaWdodDogM3JlbTsgfVxcbiAgICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXBhZ2luYXRpb24tY29udGFpbmVyLS1kaXNhYmxlZCB7XFxuICAgICAgY3Vyc29yOiBub3QtYWxsb3dlZDtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDIwNCwgMjE2LCAyNTUsIDAuNCk7IH1cXG4gIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtc3ZnLXNpemUge1xcbiAgICBoZWlnaHQ6IDJyZW07XFxuICAgIHdpZHRoOiAycmVtOyB9XFxuXFxuLmFwaS1yZXN1bHRzLWRpc3BsYXlfX2Rpc3BsYXktYmFyIHtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNiZmJmYmY7XFxuICBwYWRkaW5nLWxlZnQ6IDEwJTtcXG4gIG1hcmdpbi1ib3R0b206IDJyZW07IH1cXG5cXG4uY2FyZC1jaGVja2xpc3Qge1xcbiAgd2lkdGg6IDgwJTtcXG4gIGp1c3RpZnktc2VsZjogY2VudGVyOyB9XFxuICAuY2FyZC1jaGVja2xpc3RfX3JvdyB7XFxuICAgIGRpc3BsYXk6IGdyaWQ7XFxuICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KDcsIDFmcik7IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19yb3ctLWhlYWRlciB7XFxuICAgICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICMwMDA7IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19yb3ctLWdyZXkge1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmMmYyZjI7IH1cXG4gIC5jYXJkLWNoZWNrbGlzdF9fZGF0YSB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtd3JhcDogbm93cmFwO1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgb3ZlcmZsb3c6IGhpZGRlbjtcXG4gICAgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XFxuICAgIGZvbnQtc2l6ZTogMS40cmVtOyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fZGF0YS0tc2V0IHtcXG4gICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fZGF0YS0tcmFyaXR5IHtcXG4gICAgICB0ZXh0LXRyYW5zZm9ybTogY2FwaXRhbGl6ZTsgfVxcbiAgLmNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmsge1xcbiAgICBwYWRkaW5nOiAxcmVtIDA7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtd3JhcDogbm93cmFwO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBjb2xvcjogIzAwMDtcXG4gICAgd2hpdGUtc3BhY2U6IG5vd3JhcDsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX2RhdGEtbGluay0tc3RhcnQge1xcbiAgICAgIGp1c3RpZnktY29udGVudDogZmxleC1zdGFydDsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX2RhdGEtbGluay0tY2VudGVyIHtcXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsgfVxcblxcbi50b29sdGlwIHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHotaW5kZXg6IDU7XFxuICB3aWR0aDogMjRyZW07XFxuICBoZWlnaHQ6IDM0cmVtOyB9XFxuICAudG9vbHRpcF9faW1nIHtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGhlaWdodDogMTAwJTsgfVxcblxcbi5pbWFnZS1ncmlkIHtcXG4gIHBhZGRpbmc6IDEwcmVtIDE1cmVtO1xcbiAgZGlzcGxheTogZ3JpZDtcXG4gIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KGF1dG8tZml0LCBtaW5tYXgoMjVyZW0sIDFmcikpO1xcbiAgZ3JpZC1jb2x1bW4tZ2FwOiAycmVtO1xcbiAgZ3JpZC1yb3ctZ2FwOiAxcmVtOyB9XFxuICAuaW1hZ2UtZ3JpZF9fb3V0ZXItZGl2IHtcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuICAuaW1hZ2UtZ3JpZF9faW5uZXItZGl2IHtcXG4gICAgcGVyc3BlY3RpdmU6IDE1MHJlbTtcXG4gICAgaGVpZ2h0OiAzNHJlbTtcXG4gICAgd2lkdGg6IDI0cmVtOyB9XFxuICAuaW1hZ2UtZ3JpZF9fZG91YmxlIHtcXG4gICAgaGVpZ2h0OiAzNHJlbTtcXG4gICAgd2lkdGg6IDI0cmVtO1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIHRvcDogMDtcXG4gICAgbGVmdDogMDtcXG4gICAgYmFja2ZhY2UtdmlzaWJpbGl0eTogaGlkZGVuO1xcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgLjhzIGVhc2U7IH1cXG4gICAgLmltYWdlLWdyaWRfX2RvdWJsZS0tYmFjayB7XFxuICAgICAgdHJhbnNmb3JtOiByb3RhdGVZKDE4MGRlZyk7IH1cXG4gIC5pbWFnZS1ncmlkX19kb3VibGUtYnRuIHtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICB0b3A6IDUwJTtcXG4gICAgcmlnaHQ6IDE1JTtcXG4gICAgd2lkdGg6IDRyZW07XFxuICAgIGhlaWdodDogNHJlbTtcXG4gICAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNCk7IH1cXG4gIC5pbWFnZS1ncmlkX19jb250YWluZXIge1xcbiAgICB3aWR0aDogMjRyZW07XFxuICAgIGhlaWdodDogMzRyZW07IH1cXG4gIC5pbWFnZS1ncmlkX19pbWFnZSB7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBoZWlnaHQ6IDEwMCU7IH1cXG5cXG4uY2FyZCB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgZ3JpZC1jb2x1bW46IGNlbnRlci1zdGFydCAvIGNlbnRlci1lbmQ7XFxuICBtYXJnaW4tdG9wOiAzcmVtOyB9XFxuICAuY2FyZF9faW1nLWNvbnRhaW5lciB7XFxuICAgIG1hcmdpbi1yaWdodDogMTByZW07IH1cXG4gIC5jYXJkX19pbWcge1xcbiAgICB3aWR0aDogMzNyZW07XFxuICAgIGhlaWdodDogNDZyZW07IH1cXG4gIC5jYXJkX19pbWctbGVmdCB7XFxuICAgIG1hcmdpbi1yaWdodDogMTByZW07XFxuICAgIHdpZHRoOiAzM3JlbTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgfVxcbiAgLmNhcmRfX2ltZy1idG4ge1xcbiAgICBqdXN0aWZ5LXNlbGY6IGZsZXgtZW5kO1xcbiAgICBhbGlnbi1zZWxmOiBmbGV4LWVuZDtcXG4gICAgbWFyZ2luLXRvcDogYXV0bzsgfVxcbiAgLmNhcmRfX2ltZy1kb3VibGUtYXJlYSB7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcbiAgLmNhcmRfX2ltZy1kb3VibGUtc2lkZWQge1xcbiAgICBwZXJzcGVjdGl2ZTogMTUwcmVtO1xcbiAgICBoZWlnaHQ6IDQ2cmVtOyB9XFxuICAuY2FyZF9faW1nLWRvdWJsZSB7XFxuICAgIHdpZHRoOiAzM3JlbTtcXG4gICAgaGVpZ2h0OiA0NnJlbTtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICB0b3A6IDA7XFxuICAgIGxlZnQ6IDA7XFxuICAgIGJhY2tmYWNlLXZpc2liaWxpdHk6IGhpZGRlbjtcXG4gICAgb3ZlcmZsb3c6IGhpZGRlbjsgfVxcbiAgICAuY2FyZF9faW1nLWRvdWJsZS0tYmFjayB7XFxuICAgICAgdHJhbnNmb3JtOiByb3RhdGVZKDE4MGRlZyk7IH1cXG4gIC5jYXJkX190ZXh0IHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2Y0ZjRkNztcXG4gICAgd2lkdGg6IDM0cmVtO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgICBwYWRkaW5nOiAxcmVtO1xcbiAgICBtYXJnaW4tcmlnaHQ6IDNyZW07IH1cXG4gICAgLmNhcmRfX3RleHQtZmxleCB7XFxuICAgICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcXG4gICAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2JmYmZiZjsgfVxcbiAgICAuY2FyZF9fdGV4dC10aXRsZSB7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAgICAgLmNhcmRfX3RleHQtdGl0bGUtaDMge1xcbiAgICAgICAgZm9udC1zaXplOiAxLjhyZW07XFxuICAgICAgICBmb250LXdlaWdodDogNDAwO1xcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuICAgIC5jYXJkX190ZXh0LWNvbG9yLWluZGljYXRvciB7XFxuICAgICAgd2lkdGg6IDEuM3JlbTtcXG4gICAgICBoZWlnaHQ6IDEuM3JlbTtcXG4gICAgICBib3JkZXI6IDFweCBzb2xpZCAjMzMzO1xcbiAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gICAgICBib3gtc2hhZG93OiAwcHggMHB4IDBweCAycHggcmdiYSgwLCAwLCAwLCAwLjIpO1xcbiAgICAgIG1hcmdpbi1yaWdodDogLjdyZW07XFxuICAgICAgZGlzcGxheTogaW5saW5lLWJsb2NrOyB9XFxuICAgICAgLmNhcmRfX3RleHQtY29sb3ItaW5kaWNhdG9yLS1VIHtcXG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMTI4LCAxMjgsIDI1NSwgMC43KTsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWNvbG9yLWluZGljYXRvci0tQiB7XFxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuNyk7IH1cXG4gICAgICAuY2FyZF9fdGV4dC1jb2xvci1pbmRpY2F0b3ItLVIge1xcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsIDc3LCA3NywgMC43KTsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWNvbG9yLWluZGljYXRvci0tVyB7XFxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNyk7IH1cXG4gICAgICAuY2FyZF9fdGV4dC1jb2xvci1pbmRpY2F0b3ItLUcge1xcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAyNTUsIDAsIDAuNyk7IH1cXG4gICAgLmNhcmRfX3RleHQtb3JhY2xlLXAge1xcbiAgICAgIG1hcmdpbi1ib3R0b206IDFyZW07XFxuICAgICAgZm9udC1zaXplOiAxLjNyZW07IH1cXG4gICAgLmNhcmRfX3RleHQtb3JhY2xlLWZsYXZvciB7XFxuICAgICAgZm9udC1zaXplOiAxLjNyZW07XFxuICAgICAgZm9udC1zdHlsZTogaXRhbGljOyB9XFxuICAgIC5jYXJkX190ZXh0LWlsbHVzdHJhdG9yIHtcXG4gICAgICBmb250LXNpemU6IDEuMnJlbTtcXG4gICAgICBmb250LXN0eWxlOiBpdGFsaWM7IH1cXG4gICAgLmNhcmRfX3RleHQtbGVnYWwge1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgZmxleC1kaXJlY3Rpb246IHJvdztcXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47IH1cXG4gICAgICAuY2FyZF9fdGV4dC1sZWdhbC1oYWxmIHtcXG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9XFxuICAgICAgLmNhcmRfX3RleHQtbGVnYWwtc3Bhbi1jb250YWluZXIge1xcbiAgICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cXG4gICAgICAgIC5jYXJkX190ZXh0LWxlZ2FsLXNwYW4tY29udGFpbmVyOm5vdCg6bGFzdC1jaGlsZCkge1xcbiAgICAgICAgICBtYXJnaW4tYm90dG9tOiAuNXJlbTsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWxlZ2FsLXNwYW4tYm94IHtcXG4gICAgICAgIHdpZHRoOiA2cmVtO1xcbiAgICAgICAgaGVpZ2h0OiAyLjVyZW07XFxuICAgICAgICBib3JkZXI6IDFweCBzb2xpZCAjMDAwO1xcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAuM3JlbTtcXG4gICAgICAgIGZvbnQtc2l6ZTogMXJlbTtcXG4gICAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICAgICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAgICAgICAuY2FyZF9fdGV4dC1sZWdhbC1zcGFuLWJveC0tbm90X2xlZ2FsIHtcXG4gICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmMDAwMDsgfVxcbiAgICAgICAgLmNhcmRfX3RleHQtbGVnYWwtc3Bhbi1ib3gtLWxlZ2FsIHtcXG4gICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzQ3ZDE0NzsgfVxcbiAgLmNhcmRfX3NldCB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH1cXG4gICAgLmNhcmRfX3NldC1iYW5uZXIge1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgYm9yZGVyOiAxcHggc29saWQgI2JmYmZiZjtcXG4gICAgICB3aWR0aDogNDByZW07XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzAwMDtcXG4gICAgICBjb2xvcjogI2ZmZjsgfVxcbiAgICAgIC5jYXJkX19zZXQtYmFubmVyLXN2Zy1jb250YWluZXIge1xcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuICAgICAgLmNhcmRfX3NldC1iYW5uZXItc3ZnIHtcXG4gICAgICAgIHdpZHRoOiAyLjRyZW07XFxuICAgICAgICBoZWlnaHQ6IDIuNHJlbTtcXG4gICAgICAgIGZpbHRlcjogaW52ZXJ0KDEwMCUpOyB9XFxuICAgIC5jYXJkX19zZXQtZGV0YWlscyB7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9XFxuICAgIC5jYXJkX19zZXQtaGVhZGVyLW5hbWUge1xcbiAgICAgIGZvbnQtc2l6ZTogMS43cmVtcmVtOyB9XFxuICAgIC5jYXJkX19zZXQtaGVhZGVyLWNvZGUge1xcbiAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtaGVhZGVyIHtcXG4gICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMDAwO1xcbiAgICAgIGNvbG9yOiAjZmZmO1xcbiAgICAgIGZvbnQtc2l6ZTogMS4zcmVtO1xcbiAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICAgICAgYm9yZGVyOiAxcHggc29saWQgI2JmYmZiZjtcXG4gICAgICBwYWRkaW5nOiAuM3JlbSAuN3JlbTsgfVxcbiAgICAuY2FyZF9fc2V0LXByaW50cy1zdmctY29udGFpbmVyIHtcXG4gICAgICBoZWlnaHQ6IDEuOHJlbTtcXG4gICAgICB3aWR0aDogMS44cmVtO1xcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkICNiZmJmYmY7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICAgIGJvcmRlci1yYWRpdXM6IDEwMCU7IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtc3ZnLS1jb21tb24ge1xcbiAgICAgIGZpbGw6ICMwMDA7IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtc3ZnLS11bmNvbW1vbiB7XFxuICAgICAgZmlsbDogI2U2ZTZlNjsgfVxcbiAgICAuY2FyZF9fc2V0LXByaW50cy1zdmctLXJhcmUge1xcbiAgICAgIGZpbGw6ICNlNmMzMDA7IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtc3ZnLS1teXRoaWMge1xcbiAgICAgIGZpbGw6ICNmZjAwMDA7IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtbGlzdCB7XFxuICAgICAgbGlzdC1zdHlsZTogbm9uZTsgfVxcbiAgICAgIC5jYXJkX19zZXQtcHJpbnRzLWxpc3QtbGluazpsaW5rLCAuY2FyZF9fc2V0LXByaW50cy1saXN0LWxpbms6dmlzaXRlZCB7XFxuICAgICAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICAgICAgICBjb2xvcjogIzAwMDsgfVxcbiAgICAgIC5jYXJkX19zZXQtcHJpbnRzLWxpc3QtaXRlbSB7XFxuICAgICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgICAgICAgY3Vyc29yOiBwb2ludGVyOyB9XFxuICAgICAgICAuY2FyZF9fc2V0LXByaW50cy1saXN0LWl0ZW06aG92ZXIge1xcbiAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjJmMmYyOyB9XFxuICAgICAgLmNhcmRfX3NldC1wcmludHMtbGlzdC1pdGVtLW5hbWUtd3JhcHBlciB7XFxuICAgICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgICAgIG1hcmdpbi1sZWZ0OiAtMXJlbTsgfVxcbiAgICAgIC5jYXJkX19zZXQtcHJpbnRzLWxpc3QtaXRlbS1zZXQtbmFtZSB7XFxuICAgICAgICBtYXJnaW4tbGVmdDogLjVyZW07IH1cXG4gICAgICAuY2FyZF9fc2V0LXByaW50cy1saXN0LWl0ZW0tcHJpY2Uge1xcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAuN3JlbTsgfVxcblxcbi5uby1yZXN1bHRzIHtcXG4gIGp1c3RpZnktc2VsZjogY2VudGVyOyB9XFxuXFxuLmNvbnRhaW5lciB7XFxuICBkaXNwbGF5OiBncmlkO1xcbiAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiBbZnVsbC1zdGFydF0gbWlubWF4KDZyZW0sIDFmcikgW2NlbnRlci1zdGFydF0gcmVwZWF0KDgsIFtjb2wtc3RhcnRdIG1pbm1heChtaW4tY29udGVudCwgMTRyZW0pIFtjb2wtZW5kXSkgW2NlbnRlci1lbmRdIG1pbm1heCg2cmVtLCAxZnIpIFtmdWxsLWVuZF07IH1cXG5cXG4ubG9naW4sXFxuLnJlZ2lzdGVyIHtcXG4gIG1hcmdpbi10b3A6IDVyZW07XFxuICBncmlkLWNvbHVtbjogY2VudGVyLXN0YXJ0IC8gY2VudGVyLWVuZDtcXG4gIGJhY2tncm91bmQtaW1hZ2U6IGxpbmVhci1ncmFkaWVudCh0byByaWdodCBib3R0b20sIHJnYmEoMCwgMCwgMCwgMC44KSwgcmdiYSgwLCAwLCAwLCAwLjgpKSwgdXJsKFwiICsgX19fQ1NTX0xPQURFUl9VUkxfUkVQTEFDRU1FTlRfMF9fXyArIFwiKTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gIGhlaWdodDogNzV2aDtcXG4gIGJhY2tncm91bmQtc2l6ZTogY292ZXI7XFxuICBiYWNrZ3JvdW5kLXBvc2l0aW9uOiBjZW50ZXI7IH1cXG5cXG4uc2VhcmNoIHtcXG4gIGdyaWQtY29sdW1uOiBmdWxsLXN0YXJ0IC8gZnVsbC1lbmQ7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmOyB9XFxuXFxuLmFwaS1yZXN1bHRzLWRpc3BsYXkge1xcbiAgZ3JpZC1jb2x1bW46IGZ1bGwtc3RhcnQgLyBmdWxsLWVuZDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxuICBkaXNwbGF5OiBncmlkOyB9XFxuXCIsIFwiXCIse1widmVyc2lvblwiOjMsXCJzb3VyY2VzXCI6W1wid2VicGFjazovL3NyYy9jc3Mvc3R5bGUuY3NzXCJdLFwibmFtZXNcIjpbXSxcIm1hcHBpbmdzXCI6XCJBQUFBOzs7RUFHRSxTQUFTO0VBQ1QsVUFBVTtFQUNWLG1CQUFtQixFQUFFOztBQUV2QjtFQUNFLGdCQUFnQixFQUFFOztBQUVwQjtFQUNFLHNCQUFzQjtFQUN0QixrQkFBa0I7RUFDbEIsaUJBQWlCO0VBQ2pCLHNCQUFzQjtFQUN0Qiw0QkFBNEI7RUFDNUIsZ0JBQWdCO0VBQ2hCLCtCQUErQixFQUFFOztBQUVuQztFQUNFLHdCQUF3QixFQUFFOztBQUU1QjtFQUNFLGlCQUFpQjtFQUNqQix5QkFBeUIsRUFBRTtFQUMzQjtJQUNFLFdBQVcsRUFBRTs7QUFFakI7RUFDRSxtQkFBbUIsRUFBRTs7QUFFdkI7RUFDRSxtQkFBbUIsRUFBRTs7QUFFdkI7RUFDRSxnQkFBZ0IsRUFBRTs7QUFFcEI7RUFDRSxvQkFBb0I7RUFDcEIsb0JBQW9CO0VBQ3BCLHlCQUF5QjtFQUN6QixnQkFBZ0I7RUFDaEIscUJBQXFCLEVBQUU7O0FBRXpCO0VBQ0UsYUFBYTtFQUNiLDJCQUEyQjtFQUMzQiw0Q0FBNEMsRUFBRTs7QUFFaEQ7RUFDRSxxQkFBcUIsRUFBRTs7QUFFekI7RUFDRSxtQkFBbUI7RUFDbkIsV0FBVztFQUNYLGlCQUFpQjtFQUNqQixnQkFBZ0IsRUFBRTs7QUFFcEI7RUFDRSxzQkFBc0I7RUFDdEIsZ0JBQWdCO0VBQ2hCLFlBQVksRUFBRTs7QUFFaEI7RUFDRSxhQUFhO0VBQ2Is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ckIsV0FBVyxFQUFFO01BQ2Y7UUFDRSxhQUFhO1FBQ2IsOEJBQThCO1FBQzlCLGVBQWUsRUFBRTtRQUNqQjtVQUNFLHlCQUF5QixFQUFFO01BQy9CO1FBQ0UsYUFBYTtRQUNiLG1CQUFtQjtRQUNuQixrQkFBa0IsRUFBRTtNQUN0QjtRQUNFLGtCQUFrQixFQUFFO01BQ3RCO1FBQ0UsbUJBQW1CLEVBQUU7O0FBRTdCO0VBQ0Usb0JBQW9CLEVBQUU7O0FBRXhCO0VBQ0UsYUFBYTtFQUNiLDBLQUEwSyxFQUFFOztBQUU5Szs7RUFFRSxnQkFBZ0I7RUFDaEIsc0NBQXNDO0VBQ3RDLG1JQUFvSDtFQUNwSCxhQUFhO0VBQ2Isc0JBQXNCO0VBQ3RCLG1CQUFtQjtFQUNuQixZQUFZO0VBQ1osc0JBQXNCO0VBQ3RCLDJCQUEyQixFQUFFOztBQUUvQjtFQUNFLGtDQUFrQztFQUNsQyxzQkFBc0IsRUFBRTs7QUFFMUI7RUFDRSxrQ0FBa0M7RUFDbEMsc0JBQXNCO0VBQ3RCLGFBQWEsRUFBRVwiLFwic291cmNlc0NvbnRlbnRcIjpbXCIqLFxcbio6OmFmdGVyLFxcbio6OmJlZm9yZSB7XFxuICBtYXJnaW46IDA7XFxuICBwYWRkaW5nOiAwO1xcbiAgYm94LXNpemluZzogaW5oZXJpdDsgfVxcblxcbmh0bWwge1xcbiAgZm9udC1zaXplOiA2Mi41JTsgfVxcblxcbmJvZHkge1xcbiAgYm94LXNpemluZzogYm9yZGVyLWJveDtcXG4gIG92ZXJmbG93LXg6IGhpZGRlbjtcXG4gIGZvbnQtc2l6ZTogMS42cmVtO1xcbiAgYmFja2dyb3VuZC1zaXplOiBjb3ZlcjtcXG4gIGJhY2tncm91bmQtcmVwZWF0OiBuby1yZXBlYXQ7XFxuICBoZWlnaHQ6IDEyNy41cmVtO1xcbiAgZm9udC1mYW1pbHk6ICdMYXRvJywgc2Fucy1zZXJpZjsgfVxcblxcbltoaWRkZW5dIHtcXG4gIGRpc3BsYXk6IG5vbmUgIWltcG9ydGFudDsgfVxcblxcbi5oZWFkaW5nLXRlcnRpYXJ5IHtcXG4gIGZvbnQtc2l6ZTogMi40cmVtO1xcbiAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTsgfVxcbiAgLmhlYWRpbmctdGVydGlhcnktLXdoaXRlIHtcXG4gICAgY29sb3I6ICNmZmY7IH1cXG5cXG4ubWItMTAge1xcbiAgbWFyZ2luLWJvdHRvbTogMXJlbTsgfVxcblxcbi5tYi0yMCB7XFxuICBtYXJnaW4tYm90dG9tOiAycmVtOyB9XFxuXFxuLm10LTUwIHtcXG4gIG1hcmdpbi10b3A6IDVyZW07IH1cXG5cXG4uYnRuLCAuYnRuOmxpbmssIC5idG46dmlzaXRlZCB7XFxuICBwYWRkaW5nOiAuNzVyZW0gMnJlbTtcXG4gIGJvcmRlci1yYWRpdXM6IC41cmVtO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2YyZjJmMjtcXG4gIGZvbnQtd2VpZ2h0OiA0MDA7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7IH1cXG5cXG4uYnRuOmFjdGl2ZSwgLmJ0bjpmb2N1cyB7XFxuICBvdXRsaW5lOiBub25lO1xcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC0xcHgpO1xcbiAgYm94LXNoYWRvdzogMCAwLjVyZW0gMXJlbSByZ2JhKDAsIDAsIDAsIDAuMik7IH1cXG5cXG4ubG9naW4tZm9ybV9fZ3JvdXA6bm90KDpsYXN0LWNoaWxkKSB7XFxuICBtYXJnaW4tYm90dG9tOiAyLjVyZW07IH1cXG5cXG4ubG9naW4tZm9ybV9fbGFiZWwge1xcbiAgbWFyZ2luLXJpZ2h0OiAuN3JlbTtcXG4gIGNvbG9yOiAjZmZmO1xcbiAgZm9udC1zaXplOiAxLjhyZW07XFxuICBmb250LXdlaWdodDogNDAwOyB9XFxuXFxuLmxvZ2luLWZvcm1fX2lucHV0IHtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxuICBwYWRkaW5nOiAuNXJlbSAwO1xcbiAgYm9yZGVyOiBub25lOyB9XFxuXFxuLmxvZ2luLWZvcm1fX2J0bi13cmFwcGVyIHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsgfVxcblxcbi5sb2dpbl9fcmVnaXN0ZXItdGV4dCB7XFxuICBtYXJnaW4tdG9wOiAxLjVyZW07XFxuICBjb2xvcjogI2ZmZjsgfVxcblxcbi5sb2dpbl9fcmVnaXN0ZXItbGluayB7XFxuICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICBjb2xvcjogI2ZmZjtcXG4gIHRyYW5zaXRpb246IGFsbCAuMnM7IH1cXG4gIC5sb2dpbl9fcmVnaXN0ZXItbGluazpob3ZlciB7XFxuICAgIGNvbG9yOiAjZmY4MDAwO1xcbiAgICB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZTsgfVxcblxcbi5uYXYge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxuICBwYWRkaW5nOiAycmVtIDZyZW07XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICMwMDA7IH1cXG4gIC5uYXZfX2l0ZW0ge1xcbiAgICBsaXN0LXN0eWxlOiBub25lOyB9XFxuICAgIC5uYXZfX2l0ZW0tLXNlYXJjaCB7XFxuICAgICAgZmxleDogMCAwIDI1JTsgfVxcbiAgLm5hdl9fbGluayB7XFxuICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gICAgY29sb3I6ICMwMDA7XFxuICAgIHRyYW5zaXRpb246IGFsbCAuMnM7IH1cXG4gICAgLm5hdl9fbGluazpob3ZlciB7XFxuICAgICAgbWFyZ2luLWJvdHRvbTogMnB4O1xcbiAgICAgIGNvbG9yOiAjZmZhNjRkO1xcbiAgICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjZmZhNjRkOyB9XFxuICAgIC5uYXZfX2xpbmstLWhvbWU6aG92ZXIgLm5hdl9faWNvbi1wYXRoLS1ob21lIHtcXG4gICAgICBmaWxsOiAjZmY4MDAwOyB9XFxuICAubmF2X19zZWFyY2gge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfVxcbiAgICAubmF2X19zZWFyY2gtaW5wdXQge1xcbiAgICAgIHdpZHRoOiA5MCU7XFxuICAgICAgYm9yZGVyLXJhZGl1czogM3JlbTtcXG4gICAgICBwYWRkaW5nOiAxcmVtIDJyZW07XFxuICAgICAgYm9yZGVyOiAxcHggc29saWQgI2JmYmZiZjtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjJmMmYyO1xcbiAgICAgIHRyYW5zaXRpb246IHdpZHRoIC4yczsgfVxcbiAgICAgIC5uYXZfX3NlYXJjaC1pbnB1dDpmb2N1cyB7XFxuICAgICAgICBvdXRsaW5lOiBub25lO1xcbiAgICAgICAgd2lkdGg6IDEyMCU7IH1cXG4gIC5uYXZfX2ljb24tc2l6aW5nLS1ob21lIHtcXG4gICAgd2lkdGg6IDNyZW07XFxuICAgIGhlaWdodDogM3JlbTsgfVxcbiAgLm5hdl9faWNvbi1zaXppbmctLXNlYXJjaCB7XFxuICAgIHdpZHRoOiAycmVtO1xcbiAgICBoZWlnaHQ6IDJyZW07XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtMTUwJSk7IH1cXG4gIC5uYXZfX2ljb24tcGF0aCB7XFxuICAgIGZpbGw6ICNiZmJmYmY7IH1cXG5cXG4ucmVnaXN0ZXItZm9ybV9fZ3JvdXAge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cXG4gIC5yZWdpc3Rlci1mb3JtX19ncm91cDpub3QoOmxhc3QtY2hpbGQpIHtcXG4gICAgbWFyZ2luLWJvdHRvbTogM3JlbTsgfVxcblxcbi5yZWdpc3Rlci1mb3JtX19sYWJlbCB7XFxuICBtYXJnaW4tcmlnaHQ6IDRyZW07XFxuICBjb2xvcjogI2ZmZjtcXG4gIGZvbnQtc2l6ZTogMS44cmVtO1xcbiAgZm9udC13ZWlnaHQ6IDQwMDsgfVxcblxcbi5yZWdpc3Rlci1mb3JtX19pbnB1dCB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjJmMmYyO1xcbiAgcGFkZGluZzogLjVyZW0gMDtcXG4gIGJvcmRlcjogbm9uZTsgfVxcblxcbi5yZWdpc3Rlci1mb3JtX19idG4td3JhcHBlciB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7IH1cXG5cXG4ucmVnaXN0ZXJfX2xvZ2luLXRleHQge1xcbiAgbWFyZ2luLXRvcDogMS41cmVtO1xcbiAgY29sb3I6ICNmZmY7IH1cXG5cXG4ucmVnaXN0ZXJfX2xvZ2luLWxpbmsge1xcbiAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgY29sb3I6ICNmZmY7XFxuICB0cmFuc2l0aW9uOiBhbGwgLjJzOyB9XFxuICAucmVnaXN0ZXJfX2xvZ2luLWxpbms6aG92ZXIge1xcbiAgICBjb2xvcjogI2ZmODAwMDtcXG4gICAgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmU7IH1cXG5cXG4uZXJyb3Ige1xcbiAgbWFyZ2luLXRvcDogMnJlbTtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZjgwODA7XFxuICBib3JkZXItcmFkaXVzOiAxMHB4O1xcbiAgcGFkZGluZzogMnJlbTtcXG4gIGZvbnQtc2l6ZTogMnJlbTtcXG4gIGdyaWQtY29sdW1uOiBjZW50ZXItc3RhcnQgLyBjZW50ZXItZW5kO1xcbiAgZm9udC13ZWlnaHQ6IDcwMDsgfVxcblxcbi5zZWFyY2gtZm9ybSB7XFxuICBwYWRkaW5nOiAycmVtIDI1cmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX2dyb3VwIHtcXG4gICAgd2lkdGg6IDc1JTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgbWFyZ2luLWJvdHRvbTogM3JlbTtcXG4gICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICMwMDA7XFxuICAgIGFsaWduLWl0ZW1zOiBmbGV4LXN0YXJ0O1xcbiAgICBwYWRkaW5nOiAuNXJlbSA0cmVtIC41cmVtIDA7IH1cXG4gIC5zZWFyY2gtZm9ybV9fbGFiZWwge1xcbiAgICBmbGV4OiAwIDAgMjAlO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogZmxleC1zdGFydDtcXG4gICAgbWFyZ2luLXRvcDogLjdyZW07IH1cXG4gIC5zZWFyY2gtZm9ybV9fZ3JvdXAtaW5wdXQtd3JhcHBlciB7XFxuICAgIGZsZXg6IDAgMCA4MCU7IH1cXG4gIC5zZWFyY2gtZm9ybV9fdGlwIHtcXG4gICAgZm9udC1zaXplOiAxcmVtO1xcbiAgICBsaW5lLWhlaWdodDogMS40O1xcbiAgICB3aWR0aDogNzAlOyB9XFxuICAuc2VhcmNoLWZvcm1fX2lucHV0LXRleHQge1xcbiAgICB3aWR0aDogNDByZW07XFxuICAgIGhlaWdodDogNHJlbTtcXG4gICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcXG4gICAgcGFkZGluZzogMXJlbTtcXG4gICAgYm9yZGVyOiBzb2xpZCAxcHggI2JmYmZiZjtcXG4gICAgYm9yZGVyLXJhZGl1czogNXB4OyB9XFxuICAgIC5zZWFyY2gtZm9ybV9faW5wdXQtdGV4dDpmb2N1cyB7XFxuICAgICAgYm9yZGVyOiBzb2xpZCAxcHggIzAwMDsgfVxcbiAgLnNlYXJjaC1mb3JtX19ncm91cC0tY2hlY2tib3gge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBtYXJnaW4tYm90dG9tOiAxcmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX2xhYmVsLS1jaGVja2JveCB7XFxuICAgIG1hcmdpbi1yaWdodDogMXJlbTsgfVxcbiAgLnNlYXJjaC1mb3JtX19pbnB1dC1jaGVja2JveCB7XFxuICAgIHdpZHRoOiAyLjI1cmVtO1xcbiAgICBoZWlnaHQ6IDIuMjVyZW07XFxuICAgIG1hcmdpbi1yaWdodDogLjhyZW07IH1cXG4gIC5zZWFyY2gtZm9ybV9fY2hlY2tib3gtd3JhcHBlciB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cXG4gIC5zZWFyY2gtZm9ybV9fc2VsZWN0LW1lbnUge1xcbiAgICBtYXJnaW4tYm90dG9tOiAxcmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX3N2Zy1zaXplIHtcXG4gICAgaGVpZ2h0OiAycmVtO1xcbiAgICB3aWR0aDogMnJlbTtcXG4gICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX3N1Ym1pdCB7XFxuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgcGFkZGluZzogLjdyZW07XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkICNiMzAwYjM7IH1cXG4gIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tc3BhbiB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH1cXG4gIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMsIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtc2V0cyB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICAgIGxpc3Qtc3R5bGU6IG5vbmU7XFxuICAgIG1hcmdpbi1ib3R0b206IC4zcmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLWxpc3QtaXRlbSwgLnNlYXJjaC1mb3JtX19zZWxlY3RlZC1zZXRzLWxpc3QtaXRlbSB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIG1hcmdpbi1ib3R0b206IC43cmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLXJlbW92ZS1idG4sIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtc2V0cy1yZW1vdmUtYnRuIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgaGVpZ2h0OiAycmVtO1xcbiAgICB3aWR0aDogMnJlbTtcXG4gICAgZm9udC1zaXplOiAxLjNyZW07XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmMmYyZjI7XFxuICAgIG1hcmdpbi1yaWdodDogLjdyZW07IH1cXG4gIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlciB7XFxuICAgIGhlaWdodDogMnJlbTtcXG4gICAgd2lkdGg6IDIuNzVyZW07XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgIGZvbnQtc2l6ZTogMS4zcmVtO1xcbiAgICBtYXJnaW4tcmlnaHQ6IC43cmVtOyB9XFxuICAgIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlci0taXMge1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICM0N2QxNDc7IH1cXG4gICAgLnNlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy10b2dnbGVyLS1ub3Qge1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmZjAwMDA7IH1cXG4gIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24ge1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIG1heC1oZWlnaHQ6IDI4cmVtO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgICB6LWluZGV4OiAyO1xcbiAgICB0b3A6IDEwMCU7XFxuICAgIHdpZHRoOiA0MHJlbTtcXG4gICAgbWFyZ2luLXRvcDogLTFyZW07XFxuICAgIG92ZXJmbG93LXk6IGF1dG87XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkICMwMDA7IH1cXG4gICAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0IHtcXG4gICAgICBsaXN0LXN0eWxlOiBub25lOyB9XFxuICAgICAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0LWNhdGVnb3J5IHtcXG4gICAgICAgIHBhZGRpbmc6IC41cmVtOyB9XFxuICAgICAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0LW9wdGlvbiB7XFxuICAgICAgICBwYWRkaW5nOiAuM3JlbSAycmVtO1xcbiAgICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cXG4gICAgICAgIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1vcHRpb246aG92ZXIge1xcbiAgICAgICAgICBjdXJzb3I6IHBvaW50ZXI7IH1cXG4gICAgICAgIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1vcHRpb24tLWhpZ2hsaWdodGVkIHtcXG4gICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2NjZDhmZjsgfVxcbiAgICAgICAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0LW9wdGlvbiBzcGFuIHtcXG4gICAgICAgICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcXG4gICAgICAgICAgbWFyZ2luLWxlZnQ6IDFyZW07IH1cXG4gICAgICAuc2VhcmNoLWZvcm1fX2Ryb3Bkb3duLWxpc3QtaW1nIHtcXG4gICAgICAgIHdpZHRoOiAycmVtO1xcbiAgICAgICAgaGVpZ2h0OiAycmVtO1xcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAuN3JlbTsgfVxcblxcbi5kcm9wZG93bi13cmFwcGVyIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcblxcbi5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzk5YjFmZjtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcXG4gIHBhZGRpbmc6IDAgMTAlO1xcbiAgbWFyZ2luLWJvdHRvbTogLjFyZW07IH1cXG4gIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtc2VsZWN0IHtcXG4gICAgY29sb3I6ICNiMzAwYjM7XFxuICAgIG1hcmdpbi1yaWdodDogMXJlbTsgfVxcbiAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1sYWJlbCB7XFxuICAgIGNvbG9yOiAjYjMwMGIzOyB9XFxuICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXJpZ2h0IHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfVxcbiAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1wYWdpbmF0aW9uLWNvbnRhaW5lciB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNjY2Q4ZmY7XFxuICAgIGN1cnNvcjogcG9pbnRlcjsgfVxcbiAgICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXBhZ2luYXRpb24tY29udGFpbmVyOm5vdCg6bGFzdC1jaGlsZCkge1xcbiAgICAgIG1hcmdpbi1yaWdodDogM3JlbTsgfVxcbiAgICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXBhZ2luYXRpb24tY29udGFpbmVyLS1kaXNhYmxlZCB7XFxuICAgICAgY3Vyc29yOiBub3QtYWxsb3dlZDtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDIwNCwgMjE2LCAyNTUsIDAuNCk7IH1cXG4gIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtc3ZnLXNpemUge1xcbiAgICBoZWlnaHQ6IDJyZW07XFxuICAgIHdpZHRoOiAycmVtOyB9XFxuXFxuLmFwaS1yZXN1bHRzLWRpc3BsYXlfX2Rpc3BsYXktYmFyIHtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNiZmJmYmY7XFxuICBwYWRkaW5nLWxlZnQ6IDEwJTtcXG4gIG1hcmdpbi1ib3R0b206IDJyZW07IH1cXG5cXG4uY2FyZC1jaGVja2xpc3Qge1xcbiAgd2lkdGg6IDgwJTtcXG4gIGp1c3RpZnktc2VsZjogY2VudGVyOyB9XFxuICAuY2FyZC1jaGVja2xpc3RfX3JvdyB7XFxuICAgIGRpc3BsYXk6IGdyaWQ7XFxuICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KDcsIDFmcik7IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19yb3ctLWhlYWRlciB7XFxuICAgICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICMwMDA7IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19yb3ctLWdyZXkge1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmMmYyZjI7IH1cXG4gIC5jYXJkLWNoZWNrbGlzdF9fZGF0YSB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtd3JhcDogbm93cmFwO1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgb3ZlcmZsb3c6IGhpZGRlbjtcXG4gICAgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XFxuICAgIGZvbnQtc2l6ZTogMS40cmVtOyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fZGF0YS0tc2V0IHtcXG4gICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fZGF0YS0tcmFyaXR5IHtcXG4gICAgICB0ZXh0LXRyYW5zZm9ybTogY2FwaXRhbGl6ZTsgfVxcbiAgLmNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmsge1xcbiAgICBwYWRkaW5nOiAxcmVtIDA7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtd3JhcDogbm93cmFwO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBjb2xvcjogIzAwMDtcXG4gICAgd2hpdGUtc3BhY2U6IG5vd3JhcDsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX2RhdGEtbGluay0tc3RhcnQge1xcbiAgICAgIGp1c3RpZnktY29udGVudDogZmxleC1zdGFydDsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX2RhdGEtbGluay0tY2VudGVyIHtcXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsgfVxcblxcbi50b29sdGlwIHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHotaW5kZXg6IDU7XFxuICB3aWR0aDogMjRyZW07XFxuICBoZWlnaHQ6IDM0cmVtOyB9XFxuICAudG9vbHRpcF9faW1nIHtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGhlaWdodDogMTAwJTsgfVxcblxcbi5pbWFnZS1ncmlkIHtcXG4gIHBhZGRpbmc6IDEwcmVtIDE1cmVtO1xcbiAgZGlzcGxheTogZ3JpZDtcXG4gIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KGF1dG8tZml0LCBtaW5tYXgoMjVyZW0sIDFmcikpO1xcbiAgZ3JpZC1jb2x1bW4tZ2FwOiAycmVtO1xcbiAgZ3JpZC1yb3ctZ2FwOiAxcmVtOyB9XFxuICAuaW1hZ2UtZ3JpZF9fb3V0ZXItZGl2IHtcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuICAuaW1hZ2UtZ3JpZF9faW5uZXItZGl2IHtcXG4gICAgcGVyc3BlY3RpdmU6IDE1MHJlbTtcXG4gICAgaGVpZ2h0OiAzNHJlbTtcXG4gICAgd2lkdGg6IDI0cmVtOyB9XFxuICAuaW1hZ2UtZ3JpZF9fZG91YmxlIHtcXG4gICAgaGVpZ2h0OiAzNHJlbTtcXG4gICAgd2lkdGg6IDI0cmVtO1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIHRvcDogMDtcXG4gICAgbGVmdDogMDtcXG4gICAgYmFja2ZhY2UtdmlzaWJpbGl0eTogaGlkZGVuO1xcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgLjhzIGVhc2U7IH1cXG4gICAgLmltYWdlLWdyaWRfX2RvdWJsZS0tYmFjayB7XFxuICAgICAgdHJhbnNmb3JtOiByb3RhdGVZKDE4MGRlZyk7IH1cXG4gIC5pbWFnZS1ncmlkX19kb3VibGUtYnRuIHtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICB0b3A6IDUwJTtcXG4gICAgcmlnaHQ6IDE1JTtcXG4gICAgd2lkdGg6IDRyZW07XFxuICAgIGhlaWdodDogNHJlbTtcXG4gICAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNCk7IH1cXG4gIC5pbWFnZS1ncmlkX19jb250YWluZXIge1xcbiAgICB3aWR0aDogMjRyZW07XFxuICAgIGhlaWdodDogMzRyZW07IH1cXG4gIC5pbWFnZS1ncmlkX19pbWFnZSB7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBoZWlnaHQ6IDEwMCU7IH1cXG5cXG4uY2FyZCB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgZ3JpZC1jb2x1bW46IGNlbnRlci1zdGFydCAvIGNlbnRlci1lbmQ7XFxuICBtYXJnaW4tdG9wOiAzcmVtOyB9XFxuICAuY2FyZF9faW1nLWNvbnRhaW5lciB7XFxuICAgIG1hcmdpbi1yaWdodDogMTByZW07IH1cXG4gIC5jYXJkX19pbWcge1xcbiAgICB3aWR0aDogMzNyZW07XFxuICAgIGhlaWdodDogNDZyZW07IH1cXG4gIC5jYXJkX19pbWctbGVmdCB7XFxuICAgIG1hcmdpbi1yaWdodDogMTByZW07XFxuICAgIHdpZHRoOiAzM3JlbTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgfVxcbiAgLmNhcmRfX2ltZy1idG4ge1xcbiAgICBqdXN0aWZ5LXNlbGY6IGZsZXgtZW5kO1xcbiAgICBhbGlnbi1zZWxmOiBmbGV4LWVuZDtcXG4gICAgbWFyZ2luLXRvcDogYXV0bzsgfVxcbiAgLmNhcmRfX2ltZy1kb3VibGUtYXJlYSB7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcbiAgLmNhcmRfX2ltZy1kb3VibGUtc2lkZWQge1xcbiAgICBwZXJzcGVjdGl2ZTogMTUwcmVtO1xcbiAgICBoZWlnaHQ6IDQ2cmVtOyB9XFxuICAuY2FyZF9faW1nLWRvdWJsZSB7XFxuICAgIHdpZHRoOiAzM3JlbTtcXG4gICAgaGVpZ2h0OiA0NnJlbTtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICB0b3A6IDA7XFxuICAgIGxlZnQ6IDA7XFxuICAgIGJhY2tmYWNlLXZpc2liaWxpdHk6IGhpZGRlbjtcXG4gICAgb3ZlcmZsb3c6IGhpZGRlbjsgfVxcbiAgICAuY2FyZF9faW1nLWRvdWJsZS0tYmFjayB7XFxuICAgICAgdHJhbnNmb3JtOiByb3RhdGVZKDE4MGRlZyk7IH1cXG4gIC5jYXJkX190ZXh0IHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2Y0ZjRkNztcXG4gICAgd2lkdGg6IDM0cmVtO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgICBwYWRkaW5nOiAxcmVtO1xcbiAgICBtYXJnaW4tcmlnaHQ6IDNyZW07IH1cXG4gICAgLmNhcmRfX3RleHQtZmxleCB7XFxuICAgICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcXG4gICAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2JmYmZiZjsgfVxcbiAgICAuY2FyZF9fdGV4dC10aXRsZSB7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAgICAgLmNhcmRfX3RleHQtdGl0bGUtaDMge1xcbiAgICAgICAgZm9udC1zaXplOiAxLjhyZW07XFxuICAgICAgICBmb250LXdlaWdodDogNDAwO1xcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuICAgIC5jYXJkX190ZXh0LWNvbG9yLWluZGljYXRvciB7XFxuICAgICAgd2lkdGg6IDEuM3JlbTtcXG4gICAgICBoZWlnaHQ6IDEuM3JlbTtcXG4gICAgICBib3JkZXI6IDFweCBzb2xpZCAjMzMzO1xcbiAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gICAgICBib3gtc2hhZG93OiAwcHggMHB4IDBweCAycHggcmdiYSgwLCAwLCAwLCAwLjIpO1xcbiAgICAgIG1hcmdpbi1yaWdodDogLjdyZW07XFxuICAgICAgZGlzcGxheTogaW5saW5lLWJsb2NrOyB9XFxuICAgICAgLmNhcmRfX3RleHQtY29sb3ItaW5kaWNhdG9yLS1VIHtcXG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMTI4LCAxMjgsIDI1NSwgMC43KTsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWNvbG9yLWluZGljYXRvci0tQiB7XFxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuNyk7IH1cXG4gICAgICAuY2FyZF9fdGV4dC1jb2xvci1pbmRpY2F0b3ItLVIge1xcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsIDc3LCA3NywgMC43KTsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWNvbG9yLWluZGljYXRvci0tVyB7XFxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNyk7IH1cXG4gICAgICAuY2FyZF9fdGV4dC1jb2xvci1pbmRpY2F0b3ItLUcge1xcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAyNTUsIDAsIDAuNyk7IH1cXG4gICAgLmNhcmRfX3RleHQtb3JhY2xlLXAge1xcbiAgICAgIG1hcmdpbi1ib3R0b206IDFyZW07XFxuICAgICAgZm9udC1zaXplOiAxLjNyZW07IH1cXG4gICAgLmNhcmRfX3RleHQtb3JhY2xlLWZsYXZvciB7XFxuICAgICAgZm9udC1zaXplOiAxLjNyZW07XFxuICAgICAgZm9udC1zdHlsZTogaXRhbGljOyB9XFxuICAgIC5jYXJkX190ZXh0LWlsbHVzdHJhdG9yIHtcXG4gICAgICBmb250LXNpemU6IDEuMnJlbTtcXG4gICAgICBmb250LXN0eWxlOiBpdGFsaWM7IH1cXG4gICAgLmNhcmRfX3RleHQtbGVnYWwge1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgZmxleC1kaXJlY3Rpb246IHJvdztcXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47IH1cXG4gICAgICAuY2FyZF9fdGV4dC1sZWdhbC1oYWxmIHtcXG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9XFxuICAgICAgLmNhcmRfX3RleHQtbGVnYWwtc3Bhbi1jb250YWluZXIge1xcbiAgICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cXG4gICAgICAgIC5jYXJkX190ZXh0LWxlZ2FsLXNwYW4tY29udGFpbmVyOm5vdCg6bGFzdC1jaGlsZCkge1xcbiAgICAgICAgICBtYXJnaW4tYm90dG9tOiAuNXJlbTsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWxlZ2FsLXNwYW4tYm94IHtcXG4gICAgICAgIHdpZHRoOiA2cmVtO1xcbiAgICAgICAgaGVpZ2h0OiAyLjVyZW07XFxuICAgICAgICBib3JkZXI6IDFweCBzb2xpZCAjMDAwO1xcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAuM3JlbTtcXG4gICAgICAgIGZvbnQtc2l6ZTogMXJlbTtcXG4gICAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICAgICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAgICAgICAuY2FyZF9fdGV4dC1sZWdhbC1zcGFuLWJveC0tbm90X2xlZ2FsIHtcXG4gICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmMDAwMDsgfVxcbiAgICAgICAgLmNhcmRfX3RleHQtbGVnYWwtc3Bhbi1ib3gtLWxlZ2FsIHtcXG4gICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzQ3ZDE0NzsgfVxcbiAgLmNhcmRfX3NldCB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH1cXG4gICAgLmNhcmRfX3NldC1iYW5uZXIge1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgYm9yZGVyOiAxcHggc29saWQgI2JmYmZiZjtcXG4gICAgICB3aWR0aDogNDByZW07XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzAwMDtcXG4gICAgICBjb2xvcjogI2ZmZjsgfVxcbiAgICAgIC5jYXJkX19zZXQtYmFubmVyLXN2Zy1jb250YWluZXIge1xcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuICAgICAgLmNhcmRfX3NldC1iYW5uZXItc3ZnIHtcXG4gICAgICAgIHdpZHRoOiAyLjRyZW07XFxuICAgICAgICBoZWlnaHQ6IDIuNHJlbTtcXG4gICAgICAgIGZpbHRlcjogaW52ZXJ0KDEwMCUpOyB9XFxuICAgIC5jYXJkX19zZXQtZGV0YWlscyB7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9XFxuICAgIC5jYXJkX19zZXQtaGVhZGVyLW5hbWUge1xcbiAgICAgIGZvbnQtc2l6ZTogMS43cmVtcmVtOyB9XFxuICAgIC5jYXJkX19zZXQtaGVhZGVyLWNvZGUge1xcbiAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtaGVhZGVyIHtcXG4gICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMDAwO1xcbiAgICAgIGNvbG9yOiAjZmZmO1xcbiAgICAgIGZvbnQtc2l6ZTogMS4zcmVtO1xcbiAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICAgICAgYm9yZGVyOiAxcHggc29saWQgI2JmYmZiZjtcXG4gICAgICBwYWRkaW5nOiAuM3JlbSAuN3JlbTsgfVxcbiAgICAuY2FyZF9fc2V0LXByaW50cy1zdmctY29udGFpbmVyIHtcXG4gICAgICBoZWlnaHQ6IDEuOHJlbTtcXG4gICAgICB3aWR0aDogMS44cmVtO1xcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkICNiZmJmYmY7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICAgIGJvcmRlci1yYWRpdXM6IDEwMCU7IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtc3ZnLS1jb21tb24ge1xcbiAgICAgIGZpbGw6ICMwMDA7IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtc3ZnLS11bmNvbW1vbiB7XFxuICAgICAgZmlsbDogI2U2ZTZlNjsgfVxcbiAgICAuY2FyZF9fc2V0LXByaW50cy1zdmctLXJhcmUge1xcbiAgICAgIGZpbGw6ICNlNmMzMDA7IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtc3ZnLS1teXRoaWMge1xcbiAgICAgIGZpbGw6ICNmZjAwMDA7IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtbGlzdCB7XFxuICAgICAgbGlzdC1zdHlsZTogbm9uZTsgfVxcbiAgICAgIC5jYXJkX19zZXQtcHJpbnRzLWxpc3QtbGluazpsaW5rLCAuY2FyZF9fc2V0LXByaW50cy1saXN0LWxpbms6dmlzaXRlZCB7XFxuICAgICAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICAgICAgICBjb2xvcjogIzAwMDsgfVxcbiAgICAgIC5jYXJkX19zZXQtcHJpbnRzLWxpc3QtaXRlbSB7XFxuICAgICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgICAgICAgY3Vyc29yOiBwb2ludGVyOyB9XFxuICAgICAgICAuY2FyZF9fc2V0LXByaW50cy1saXN0LWl0ZW06aG92ZXIge1xcbiAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjJmMmYyOyB9XFxuICAgICAgLmNhcmRfX3NldC1wcmludHMtbGlzdC1pdGVtLW5hbWUtd3JhcHBlciB7XFxuICAgICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgICAgIG1hcmdpbi1sZWZ0OiAtMXJlbTsgfVxcbiAgICAgIC5jYXJkX19zZXQtcHJpbnRzLWxpc3QtaXRlbS1zZXQtbmFtZSB7XFxuICAgICAgICBtYXJnaW4tbGVmdDogLjVyZW07IH1cXG4gICAgICAuY2FyZF9fc2V0LXByaW50cy1saXN0LWl0ZW0tcHJpY2Uge1xcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAuN3JlbTsgfVxcblxcbi5uby1yZXN1bHRzIHtcXG4gIGp1c3RpZnktc2VsZjogY2VudGVyOyB9XFxuXFxuLmNvbnRhaW5lciB7XFxuICBkaXNwbGF5OiBncmlkO1xcbiAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiBbZnVsbC1zdGFydF0gbWlubWF4KDZyZW0sIDFmcikgW2NlbnRlci1zdGFydF0gcmVwZWF0KDgsIFtjb2wtc3RhcnRdIG1pbm1heChtaW4tY29udGVudCwgMTRyZW0pIFtjb2wtZW5kXSkgW2NlbnRlci1lbmRdIG1pbm1heCg2cmVtLCAxZnIpIFtmdWxsLWVuZF07IH1cXG5cXG4ubG9naW4sXFxuLnJlZ2lzdGVyIHtcXG4gIG1hcmdpbi10b3A6IDVyZW07XFxuICBncmlkLWNvbHVtbjogY2VudGVyLXN0YXJ0IC8gY2VudGVyLWVuZDtcXG4gIGJhY2tncm91bmQtaW1hZ2U6IGxpbmVhci1ncmFkaWVudCh0byByaWdodCBib3R0b20sIHJnYmEoMCwgMCwgMCwgMC44KSwgcmdiYSgwLCAwLCAwLCAwLjgpKSwgdXJsKC4uL2ltZy9sb2dpbi1iZy5qcGcpO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgaGVpZ2h0OiA3NXZoO1xcbiAgYmFja2dyb3VuZC1zaXplOiBjb3ZlcjtcXG4gIGJhY2tncm91bmQtcG9zaXRpb246IGNlbnRlcjsgfVxcblxcbi5zZWFyY2gge1xcbiAgZ3JpZC1jb2x1bW46IGZ1bGwtc3RhcnQgLyBmdWxsLWVuZDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZmY7IH1cXG5cXG4uYXBpLXJlc3VsdHMtZGlzcGxheSB7XFxuICBncmlkLWNvbHVtbjogZnVsbC1zdGFydCAvIGZ1bGwtZW5kO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gIGRpc3BsYXk6IGdyaWQ7IH1cXG5cIl0sXCJzb3VyY2VSb290XCI6XCJcIn1dKTtcbi8vIEV4cG9ydHNcbmV4cG9ydCBkZWZhdWx0IF9fX0NTU19MT0FERVJfRVhQT1JUX19fO1xuIiwiLy8gSW1wb3J0c1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18gZnJvbSBcIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9jc3NXaXRoTWFwcGluZ1RvU3RyaW5nLmpzXCI7XG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fIGZyb20gXCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzXCI7XG5pbXBvcnQgX19fQ1NTX0xPQURFUl9HRVRfVVJMX0lNUE9SVF9fXyBmcm9tIFwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2dldFVybC5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfVVJMX0lNUE9SVF8wX19fIGZyb20gXCIuLi8uLi9pbWcvbWFuYS1zeW1ib2xzL21hbmEuc3ZnXCI7XG52YXIgX19fQ1NTX0xPQURFUl9FWFBPUlRfX18gPSBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18oX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyk7XG52YXIgX19fQ1NTX0xPQURFUl9VUkxfUkVQTEFDRU1FTlRfMF9fXyA9IF9fX0NTU19MT0FERVJfR0VUX1VSTF9JTVBPUlRfX18oX19fQ1NTX0xPQURFUl9VUkxfSU1QT1JUXzBfX18pO1xuLy8gTW9kdWxlXG5fX19DU1NfTE9BREVSX0VYUE9SVF9fXy5wdXNoKFttb2R1bGUuaWQsIFwiLm1hbmEge1xcbiAgICBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXCIgKyBfX19DU1NfTE9BREVSX1VSTF9SRVBMQUNFTUVOVF8wX19fICsgXCIpO1xcbiAgICBiYWNrZ3JvdW5kLXJlcGVhdDogbm8tcmVwZWF0O1xcbiAgICBiYWNrZ3JvdW5kLXNpemU6IGF1dG8gNzAwJTtcXG4gICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgICBmb250LXNpemU6IDEwMCU7XFxufVxcblxcbi5tYW5hLnhzIHtcXG4gICAgd2lkdGg6IDEuNXJlbTtcXG4gICAgaGVpZ2h0OiAxLjVyZW07XFxufVxcblxcbi5tYW5hLnNtYWxsIHtcXG4gICAgaGVpZ2h0OiAycmVtO1xcbiAgICB3aWR0aDogMnJlbTtcXG59XFxuLm1hbmEubWVkaXVtIHtcXG4gICAgaGVpZ2h0OiAyZW07XFxuICAgIHdpZHRoOiAyZW07XFxufVxcbi5tYW5hLmxhcmdlIHtcXG4gICAgaGVpZ2h0OiA0ZW07XFxuICAgIHdpZHRoOiA0ZW07XFxufVxcbi5tYW5hLnMgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwIDA7IH1cXG4ubWFuYS5zMSB7IGJhY2tncm91bmQtcG9zaXRpb246IDExLjElIDA7IH1cXG4ubWFuYS5zMiB7IGJhY2tncm91bmQtcG9zaXRpb246IDIyLjIlIDA7IH1cXG4ubWFuYS5zMyB7IGJhY2tncm91bmQtcG9zaXRpb246IDMzLjMlIDA7IH1cXG4ubWFuYS5zNCB7IGJhY2tncm91bmQtcG9zaXRpb246IDQ0LjQlIDA7IH1cXG4ubWFuYS5zNSB7IGJhY2tncm91bmQtcG9zaXRpb246IDU1LjUlIDA7IH1cXG4ubWFuYS5zNiB7IGJhY2tncm91bmQtcG9zaXRpb246IDY2LjYlIDA7IH1cXG4ubWFuYS5zNyB7IGJhY2tncm91bmQtcG9zaXRpb246IDc3LjclIDA7IH1cXG4ubWFuYS5zOCB7IGJhY2tncm91bmQtcG9zaXRpb246IDg4LjglIDA7IH1cXG4ubWFuYS5zOSB7IGJhY2tncm91bmQtcG9zaXRpb246IDk5LjklIDA7IH1cXG5cXG4ubWFuYS5zMTAgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwIDE2JTsgfVxcbi5tYW5hLnMxMSB7IGJhY2tncm91bmQtcG9zaXRpb246IDExLjElIDE2LjYlOyB9XFxuLm1hbmEuczEyIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMjIuMiUgMTYuNiU7IH1cXG4ubWFuYS5zMTMgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAzMy4zJSAxNi42JTsgfVxcbi5tYW5hLnMxNCB7IGJhY2tncm91bmQtcG9zaXRpb246IDQ0LjQlIDE2LjYlOyB9XFxuLm1hbmEuczE1IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNTUuNSUgMTYuNiU7IH1cXG4ubWFuYS5zMTYgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA2Ni42JSAxNi42JTsgfVxcbi5tYW5hLnMxNyB7IGJhY2tncm91bmQtcG9zaXRpb246IDc3LjclIDE2LjYlOyB9XFxuLm1hbmEuczE4IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogODguOCUgMTYuNiU7IH1cXG4ubWFuYS5zMTkgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA5OS45JSAxNi42JTsgfVxcblxcbi5tYW5hLnMyMCB7IGJhY2tncm91bmQtcG9zaXRpb246IDAgMzMlOyB9XFxuLm1hbmEuc3ggeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAxMS4xJSAzMy4zJTsgfVxcbi5tYW5hLnN5IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMjIuMiUgMzMuMyU7IH1cXG4ubWFuYS5zeiB7IGJhY2tncm91bmQtcG9zaXRpb246IDMzLjMlIDMzLjMlOyB9XFxuLm1hbmEuc3cgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA0NC40JSAzMy4zJTsgfVxcbi5tYW5hLnN1IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNTUuNSUgMzMuMyU7IH1cXG4ubWFuYS5zYiB7IGJhY2tncm91bmQtcG9zaXRpb246IDY2LjYlIDMzLjMlOyB9XFxuLm1hbmEuc3IgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA3Ny43JSAzMy4zJTsgfVxcbi5tYW5hLnNnIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogODguOCUgMzMuMyU7IH1cXG4ubWFuYS5zcyB7IGJhY2tncm91bmQtcG9zaXRpb246IDk5LjklIDMzLjMlOyB9XFxuXFxuLm1hbmEuc3d1IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMCA1MCU7IH1cXG4ubWFuYS5zd2IgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAxMS4xJSA1MCU7IH1cXG4ubWFuYS5zdWIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAyMi4yJSA1MCU7IH1cXG4ubWFuYS5zdXIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAzMy4zJSA1MCU7IH1cXG4ubWFuYS5zYnIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA0NC40JSA1MCU7IH1cXG4ubWFuYS5zYmcgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA1NS41JSA1MCU7IH1cXG4ubWFuYS5zcncgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA2Ni42JSA1MCU7IH1cXG4ubWFuYS5zcmcgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA3Ny43JSA1MCU7IH1cXG4ubWFuYS5zZ3cgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4OC44JSA1MCU7IH1cXG4ubWFuYS5zZ3UgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA5OS45JSA1MCU7IH1cXG5cXG4ubWFuYS5zMncgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwIDY2LjYlOyB9XFxuLm1hbmEuczJ1IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMTEuMSUgNjYuNiU7IH1cXG4ubWFuYS5zMmIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAyMi4yJSA2Ni42JTsgfVxcbi5tYW5hLnMyciB7IGJhY2tncm91bmQtcG9zaXRpb246IDMzLjMlIDY2LjYlOyB9XFxuLm1hbmEuczJnIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNDQuNCUgNjYuNiU7IH1cXG4ubWFuYS5zd3AgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA1NS41JSA2Ni42JTsgfVxcbi5tYW5hLnN1cCB7IGJhY2tncm91bmQtcG9zaXRpb246IDY2LjYlIDY2LjYlOyB9XFxuLm1hbmEuc2JwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNzcuNyUgNjYuNiU7IH1cXG4ubWFuYS5zcnAgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4OC44JSA2Ni42JTsgfVxcbi5tYW5hLnNncCB7IGJhY2tncm91bmQtcG9zaXRpb246IDk5LjklIDY2LjYlOyB9XFxuXFxuLm1hbmEuc3QgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwJSA4My4zJTsgfVxcbi5tYW5hLnNxIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMTEuMSUgODMuMyU7IH1cXG5cXG4ubWFuYS5zYyB7IGJhY2tncm91bmQtcG9zaXRpb246IDc3LjclIDgzLjMlOyB9XFxuXFxuLm1hbmEuc2UgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4OC44JSA4My4zJTsgfVxcblxcbi5tYW5hLnMxMDAwMDAwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMCAxMDAlOyB9XFxuLm1hbmEuczEwMDAwMDAuc21hbGwgeyB3aWR0aDogNC45ZW07IH1cXG4ubWFuYS5zMTAwMDAwMC5tZWRpdW0geyB3aWR0aDogOS43ZW07IH1cXG4vKi5tYW5hLnMxMDAwMDAwLmxhcmdlIHsgd2lkdGg6IDE4LjhlbTsgfSovXFxuLm1hbmEuczEwMCB7IGJhY2tncm91bmQtcG9zaXRpb246IDYwJSAxMDAlOyB9XFxuLm1hbmEuczEwMC5zbWFsbCB7IHdpZHRoOiAxLjhlbTsgfVxcbi5tYW5hLnMxMDAubWVkaXVtIHsgd2lkdGg6IDMuN2VtOyB9XFxuLyoubWFuYS5zMTAwLmxhcmdlIHsgd2lkdGg6IDEwLjhlbTsgfSovXFxuLm1hbmEuc2NoYW9zIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNzYuNSUgMTAwJTsgfVxcbi5tYW5hLnNjaGFvcy5zbWFsbCB7IHdpZHRoOiAxLjJlbTsgfVxcbi5tYW5hLnNjaGFvcy5tZWRpdW0geyB3aWR0aDogMi4zZW07IH1cXG4vKi5tYW5hLnNjLmxhcmdlIHsgd2lkdGg6IDQuNmVtOyB9Ki9cXG4ubWFuYS5zaHcgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4My41JSAxMDAlOyB9XFxuLm1hbmEuc2h3LnNtYWxsIHsgd2lkdGg6IDAuNWVtOyB9XFxuLm1hbmEuc2h3Lm1lZGl1bSB7IHdpZHRoOiAxZW07IH1cXG4vKi5tYW5hLnNody5sYXJnZSB7IHdpZHRoOiAyZW07IH0qL1xcbi5tYW5hLnNociB7IGJhY2tncm91bmQtcG9zaXRpb246IDg5JSAxMDAlOyB9XFxuLm1hbmEuc2hyLnNtYWxsIHsgd2lkdGg6IDAuNWVtOyB9XFxuLm1hbmEuc2hyLm1lZGl1bSB7IHdpZHRoOiAxZW07IH1cXG4vKi5tYW5hLnNoci5sYXJnZSB7IHdpZHRoOiAyZW07IH0qL1xcblxcblxcbi5zaGFkb3cge1xcbiAgICBmaWx0ZXI6IFxcXCJwcm9naWQ6RFhJbWFnZVRyYW5zZm9ybS5NaWNyb3NvZnQuRHJvcHNoYWRvdyhPZmZYPS0xLCBPZmZZPTEsIENvbG9yPScjMDAwJylcXFwiO1xcbiAgICBmaWx0ZXI6IHVybCgjc2hhZG93KTtcXG4gICAgLXdlYmtpdC1maWx0ZXI6IGRyb3Atc2hhZG93KC0xcHggMXB4IDBweCAjMDAwKTtcXG4gICAgZmlsdGVyOiBkcm9wLXNoYWRvdygtMXB4IDFweCAwcHggIzAwMCk7XFxufVwiLCBcIlwiLHtcInZlcnNpb25cIjozLFwic291cmNlc1wiOltcIndlYnBhY2s6Ly9zcmMvY3NzL3ZlbmRvci9tYW5hLmNzc1wiXSxcIm5hbWVzXCI6W10sXCJtYXBwaW5nc1wiOlwiQUFBQTtJQUNJLHlEQUF3RDtJQUN4RCw0QkFBNEI7SUFDNUIsMEJBQTBCO0lBQzFCLHFCQUFxQjtJQUNyQixlQUFlO0FBQ25COztBQUVBO0lBQ0ksYUFBYTtJQUNiLGNBQWM7QUFDbEI7O0FBRUE7SUFDSSxZQUFZO0lBQ1osV0FBVztBQUNmO0FBQ0E7SUFDSSxXQUFXO0lBQ1gsVUFBVTtBQUNkO0FBQ0E7SUFDSSxXQUFXO0lBQ1gsVUFBVTtBQUNkO0FBQ0EsVUFBVSx3QkFBd0IsRUFBRTtBQUNwQyxXQUFXLDRCQUE0QixFQUFFO0FBQ3pDLFdBQVcsNEJBQTRCLEVBQUU7QUFDekMsV0FBVyw0QkFBNEIsRUFBRTtBQUN6QyxXQUFXLDRCQUE0QixFQUFFO0FBQ3pDLFdBQVcsNEJBQTRCLEVBQUU7QUFDekMsV0FBVyw0QkFBNEIsRUFBRTtBQUN6QyxXQUFXLDRCQUE0QixFQUFFO0FBQ3pDLFdBQVcsNEJBQTRCLEVBQUU7QUFDekMsV0FBVyw0QkFBNEIsRUFBRTs7QUFFekMsWUFBWSwwQkFBMEIsRUFBRTtBQUN4QyxZQUFZLGdDQUFnQyxFQUFFO0FBQzlDLFlBQVksZ0NBQWdDLEVBQUU7QUFDOUMsWUFBWSxnQ0FBZ0MsRUFBRTtBQUM5QyxZQUFZLGdDQUFnQyxFQUFFO0FBQzlDLFlBQVksZ0NBQWdDLEVBQUU7QUFDOUMsWUFBWSxnQ0FBZ0MsRUFBRTtBQUM5QyxZQUFZLGdDQUFnQyxFQUFFO0FBQzlDLFlBQVksZ0NBQWdDLEVBQUU7QUFDOUMsWUFBWSxnQ0FBZ0MsRUFBRTs7QUFFOUMsWUFBWSwwQkFBMEIsRUFBRTtBQUN4QyxXQUFXLGdDQUFnQyxFQUFFO0FBQzdDLFdBQVcsZ0NBQWdDLEVBQUU7QUFDN0MsV0FBVyxnQ0FBZ0MsRUFBRTtBQUM3QyxXQUFXLGdDQUFnQyxFQUFFO0FBQzdDLFdBQVcsZ0NBQWdDLEVBQUU7QUFDN0MsV0FBVyxnQ0FBZ0MsRUFBRTtBQUM3QyxXQUFXLGdDQUFnQyxFQUFFO0FBQzdDLFdBQVcsZ0NBQWdDLEVBQUU7QUFDN0MsV0FBVyxnQ0FBZ0MsRUFBRTs7QUFFN0MsWUFBWSwwQkFBMEIsRUFBRTtBQUN4QyxZQUFZLDhCQUE4QixFQUFFO0FBQzVDLFlBQVksOEJBQThCLEVBQUU7QUFDNUMsWUFBWSw4QkFBOEIsRUFBRTtBQUM1QyxZQUFZLDhCQUE4QixFQUFFO0FBQzVDLFlBQVksOEJBQThCLEVBQUU7QUFDNUMsWUFBWSw4QkFBOEIsRUFBRTtBQUM1QyxZQUFZLDhCQUE4QixFQUFFO0FBQzVDLFlBQVksOEJBQThCLEVBQUU7QUFDNUMsWUFBWSw4QkFBOEIsRUFBRTs7QUFFNUMsWUFBWSw0QkFBNEIsRUFBRTtBQUMxQyxZQUFZLGdDQUFnQyxFQUFFO0FBQzlDLFlBQVksZ0NBQWdDLEVBQUU7QUFDOUMsWUFBWSxnQ0FBZ0MsRUFBRTtBQUM5QyxZQUFZLGdDQUFnQyxFQUFFO0FBQzlDLFlBQVksZ0NBQWdDLEVBQUU7QUFDOUMsWUFBWSxnQ0FBZ0MsRUFBRTtBQUM5QyxZQUFZLGdDQUFnQyxFQUFFO0FBQzlDLFlBQVksZ0NBQWdDLEVBQUU7QUFDOUMsWUFBWSxnQ0FBZ0MsRUFBRTs7QUFFOUMsV0FBVyw2QkFBNkIsRUFBRTtBQUMxQyxXQUFXLGdDQUFnQyxFQUFFOztBQUU3QyxXQUFXLGdDQUFnQyxFQUFFOztBQUU3QyxXQUFXLGdDQUFnQyxFQUFFOztBQUU3QyxpQkFBaUIsMkJBQTJCLEVBQUU7QUFDOUMsdUJBQXVCLFlBQVksRUFBRTtBQUNyQyx3QkFBd0IsWUFBWSxFQUFFO0FBQ3RDLDBDQUEwQztBQUMxQyxhQUFhLDZCQUE2QixFQUFFO0FBQzVDLG1CQUFtQixZQUFZLEVBQUU7QUFDakMsb0JBQW9CLFlBQVksRUFBRTtBQUNsQyxzQ0FBc0M7QUFDdEMsZUFBZSwrQkFBK0IsRUFBRTtBQUNoRCxxQkFBcUIsWUFBWSxFQUFFO0FBQ25DLHNCQUFzQixZQUFZLEVBQUU7QUFDcEMsbUNBQW1DO0FBQ25DLFlBQVksK0JBQStCLEVBQUU7QUFDN0Msa0JBQWtCLFlBQVksRUFBRTtBQUNoQyxtQkFBbUIsVUFBVSxFQUFFO0FBQy9CLGtDQUFrQztBQUNsQyxZQUFZLDZCQUE2QixFQUFFO0FBQzNDLGtCQUFrQixZQUFZLEVBQUU7QUFDaEMsbUJBQW1CLFVBQVUsRUFBRTtBQUMvQixrQ0FBa0M7OztBQUdsQztJQUNJLHFGQUFxRjtJQUNyRixvQkFBb0I7SUFDcEIsOENBQThDO0lBQzlDLHNDQUFzQztBQUMxQ1wiLFwic291cmNlc0NvbnRlbnRcIjpbXCIubWFuYSB7XFxuICAgIGJhY2tncm91bmQtaW1hZ2U6IHVybCgnLi4vLi4vaW1nL21hbmEtc3ltYm9scy9tYW5hLnN2ZycpO1xcbiAgICBiYWNrZ3JvdW5kLXJlcGVhdDogbm8tcmVwZWF0O1xcbiAgICBiYWNrZ3JvdW5kLXNpemU6IGF1dG8gNzAwJTtcXG4gICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgICBmb250LXNpemU6IDEwMCU7XFxufVxcblxcbi5tYW5hLnhzIHtcXG4gICAgd2lkdGg6IDEuNXJlbTtcXG4gICAgaGVpZ2h0OiAxLjVyZW07XFxufVxcblxcbi5tYW5hLnNtYWxsIHtcXG4gICAgaGVpZ2h0OiAycmVtO1xcbiAgICB3aWR0aDogMnJlbTtcXG59XFxuLm1hbmEubWVkaXVtIHtcXG4gICAgaGVpZ2h0OiAyZW07XFxuICAgIHdpZHRoOiAyZW07XFxufVxcbi5tYW5hLmxhcmdlIHtcXG4gICAgaGVpZ2h0OiA0ZW07XFxuICAgIHdpZHRoOiA0ZW07XFxufVxcbi5tYW5hLnMgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwIDA7IH1cXG4ubWFuYS5zMSB7IGJhY2tncm91bmQtcG9zaXRpb246IDExLjElIDA7IH1cXG4ubWFuYS5zMiB7IGJhY2tncm91bmQtcG9zaXRpb246IDIyLjIlIDA7IH1cXG4ubWFuYS5zMyB7IGJhY2tncm91bmQtcG9zaXRpb246IDMzLjMlIDA7IH1cXG4ubWFuYS5zNCB7IGJhY2tncm91bmQtcG9zaXRpb246IDQ0LjQlIDA7IH1cXG4ubWFuYS5zNSB7IGJhY2tncm91bmQtcG9zaXRpb246IDU1LjUlIDA7IH1cXG4ubWFuYS5zNiB7IGJhY2tncm91bmQtcG9zaXRpb246IDY2LjYlIDA7IH1cXG4ubWFuYS5zNyB7IGJhY2tncm91bmQtcG9zaXRpb246IDc3LjclIDA7IH1cXG4ubWFuYS5zOCB7IGJhY2tncm91bmQtcG9zaXRpb246IDg4LjglIDA7IH1cXG4ubWFuYS5zOSB7IGJhY2tncm91bmQtcG9zaXRpb246IDk5LjklIDA7IH1cXG5cXG4ubWFuYS5zMTAgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwIDE2JTsgfVxcbi5tYW5hLnMxMSB7IGJhY2tncm91bmQtcG9zaXRpb246IDExLjElIDE2LjYlOyB9XFxuLm1hbmEuczEyIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMjIuMiUgMTYuNiU7IH1cXG4ubWFuYS5zMTMgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAzMy4zJSAxNi42JTsgfVxcbi5tYW5hLnMxNCB7IGJhY2tncm91bmQtcG9zaXRpb246IDQ0LjQlIDE2LjYlOyB9XFxuLm1hbmEuczE1IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNTUuNSUgMTYuNiU7IH1cXG4ubWFuYS5zMTYgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA2Ni42JSAxNi42JTsgfVxcbi5tYW5hLnMxNyB7IGJhY2tncm91bmQtcG9zaXRpb246IDc3LjclIDE2LjYlOyB9XFxuLm1hbmEuczE4IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogODguOCUgMTYuNiU7IH1cXG4ubWFuYS5zMTkgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA5OS45JSAxNi42JTsgfVxcblxcbi5tYW5hLnMyMCB7IGJhY2tncm91bmQtcG9zaXRpb246IDAgMzMlOyB9XFxuLm1hbmEuc3ggeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAxMS4xJSAzMy4zJTsgfVxcbi5tYW5hLnN5IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMjIuMiUgMzMuMyU7IH1cXG4ubWFuYS5zeiB7IGJhY2tncm91bmQtcG9zaXRpb246IDMzLjMlIDMzLjMlOyB9XFxuLm1hbmEuc3cgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA0NC40JSAzMy4zJTsgfVxcbi5tYW5hLnN1IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNTUuNSUgMzMuMyU7IH1cXG4ubWFuYS5zYiB7IGJhY2tncm91bmQtcG9zaXRpb246IDY2LjYlIDMzLjMlOyB9XFxuLm1hbmEuc3IgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA3Ny43JSAzMy4zJTsgfVxcbi5tYW5hLnNnIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogODguOCUgMzMuMyU7IH1cXG4ubWFuYS5zcyB7IGJhY2tncm91bmQtcG9zaXRpb246IDk5LjklIDMzLjMlOyB9XFxuXFxuLm1hbmEuc3d1IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMCA1MCU7IH1cXG4ubWFuYS5zd2IgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAxMS4xJSA1MCU7IH1cXG4ubWFuYS5zdWIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAyMi4yJSA1MCU7IH1cXG4ubWFuYS5zdXIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAzMy4zJSA1MCU7IH1cXG4ubWFuYS5zYnIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA0NC40JSA1MCU7IH1cXG4ubWFuYS5zYmcgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA1NS41JSA1MCU7IH1cXG4ubWFuYS5zcncgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA2Ni42JSA1MCU7IH1cXG4ubWFuYS5zcmcgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA3Ny43JSA1MCU7IH1cXG4ubWFuYS5zZ3cgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4OC44JSA1MCU7IH1cXG4ubWFuYS5zZ3UgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA5OS45JSA1MCU7IH1cXG5cXG4ubWFuYS5zMncgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwIDY2LjYlOyB9XFxuLm1hbmEuczJ1IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMTEuMSUgNjYuNiU7IH1cXG4ubWFuYS5zMmIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAyMi4yJSA2Ni42JTsgfVxcbi5tYW5hLnMyciB7IGJhY2tncm91bmQtcG9zaXRpb246IDMzLjMlIDY2LjYlOyB9XFxuLm1hbmEuczJnIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNDQuNCUgNjYuNiU7IH1cXG4ubWFuYS5zd3AgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA1NS41JSA2Ni42JTsgfVxcbi5tYW5hLnN1cCB7IGJhY2tncm91bmQtcG9zaXRpb246IDY2LjYlIDY2LjYlOyB9XFxuLm1hbmEuc2JwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNzcuNyUgNjYuNiU7IH1cXG4ubWFuYS5zcnAgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4OC44JSA2Ni42JTsgfVxcbi5tYW5hLnNncCB7IGJhY2tncm91bmQtcG9zaXRpb246IDk5LjklIDY2LjYlOyB9XFxuXFxuLm1hbmEuc3QgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwJSA4My4zJTsgfVxcbi5tYW5hLnNxIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMTEuMSUgODMuMyU7IH1cXG5cXG4ubWFuYS5zYyB7IGJhY2tncm91bmQtcG9zaXRpb246IDc3LjclIDgzLjMlOyB9XFxuXFxuLm1hbmEuc2UgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4OC44JSA4My4zJTsgfVxcblxcbi5tYW5hLnMxMDAwMDAwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMCAxMDAlOyB9XFxuLm1hbmEuczEwMDAwMDAuc21hbGwgeyB3aWR0aDogNC45ZW07IH1cXG4ubWFuYS5zMTAwMDAwMC5tZWRpdW0geyB3aWR0aDogOS43ZW07IH1cXG4vKi5tYW5hLnMxMDAwMDAwLmxhcmdlIHsgd2lkdGg6IDE4LjhlbTsgfSovXFxuLm1hbmEuczEwMCB7IGJhY2tncm91bmQtcG9zaXRpb246IDYwJSAxMDAlOyB9XFxuLm1hbmEuczEwMC5zbWFsbCB7IHdpZHRoOiAxLjhlbTsgfVxcbi5tYW5hLnMxMDAubWVkaXVtIHsgd2lkdGg6IDMuN2VtOyB9XFxuLyoubWFuYS5zMTAwLmxhcmdlIHsgd2lkdGg6IDEwLjhlbTsgfSovXFxuLm1hbmEuc2NoYW9zIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNzYuNSUgMTAwJTsgfVxcbi5tYW5hLnNjaGFvcy5zbWFsbCB7IHdpZHRoOiAxLjJlbTsgfVxcbi5tYW5hLnNjaGFvcy5tZWRpdW0geyB3aWR0aDogMi4zZW07IH1cXG4vKi5tYW5hLnNjLmxhcmdlIHsgd2lkdGg6IDQuNmVtOyB9Ki9cXG4ubWFuYS5zaHcgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4My41JSAxMDAlOyB9XFxuLm1hbmEuc2h3LnNtYWxsIHsgd2lkdGg6IDAuNWVtOyB9XFxuLm1hbmEuc2h3Lm1lZGl1bSB7IHdpZHRoOiAxZW07IH1cXG4vKi5tYW5hLnNody5sYXJnZSB7IHdpZHRoOiAyZW07IH0qL1xcbi5tYW5hLnNociB7IGJhY2tncm91bmQtcG9zaXRpb246IDg5JSAxMDAlOyB9XFxuLm1hbmEuc2hyLnNtYWxsIHsgd2lkdGg6IDAuNWVtOyB9XFxuLm1hbmEuc2hyLm1lZGl1bSB7IHdpZHRoOiAxZW07IH1cXG4vKi5tYW5hLnNoci5sYXJnZSB7IHdpZHRoOiAyZW07IH0qL1xcblxcblxcbi5zaGFkb3cge1xcbiAgICBmaWx0ZXI6IFxcXCJwcm9naWQ6RFhJbWFnZVRyYW5zZm9ybS5NaWNyb3NvZnQuRHJvcHNoYWRvdyhPZmZYPS0xLCBPZmZZPTEsIENvbG9yPScjMDAwJylcXFwiO1xcbiAgICBmaWx0ZXI6IHVybCgjc2hhZG93KTtcXG4gICAgLXdlYmtpdC1maWx0ZXI6IGRyb3Atc2hhZG93KC0xcHggMXB4IDBweCAjMDAwKTtcXG4gICAgZmlsdGVyOiBkcm9wLXNoYWRvdygtMXB4IDFweCAwcHggIzAwMCk7XFxufVwiXSxcInNvdXJjZVJvb3RcIjpcIlwifV0pO1xuLy8gRXhwb3J0c1xuZXhwb3J0IGRlZmF1bHQgX19fQ1NTX0xPQURFUl9FWFBPUlRfX187XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAgTUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAgQXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cbi8vIGNzcyBiYXNlIGNvZGUsIGluamVjdGVkIGJ5IHRoZSBjc3MtbG9hZGVyXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY3NzV2l0aE1hcHBpbmdUb1N0cmluZykge1xuICB2YXIgbGlzdCA9IFtdOyAvLyByZXR1cm4gdGhlIGxpc3Qgb2YgbW9kdWxlcyBhcyBjc3Mgc3RyaW5nXG5cbiAgbGlzdC50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiB0aGlzLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgdmFyIGNvbnRlbnQgPSBjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKGl0ZW0pO1xuXG4gICAgICBpZiAoaXRlbVsyXSkge1xuICAgICAgICByZXR1cm4gXCJAbWVkaWEgXCIuY29uY2F0KGl0ZW1bMl0sIFwiIHtcIikuY29uY2F0KGNvbnRlbnQsIFwifVwiKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNvbnRlbnQ7XG4gICAgfSkuam9pbignJyk7XG4gIH07IC8vIGltcG9ydCBhIGxpc3Qgb2YgbW9kdWxlcyBpbnRvIHRoZSBsaXN0XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG5cblxuICBsaXN0LmkgPSBmdW5jdGlvbiAobW9kdWxlcywgbWVkaWFRdWVyeSwgZGVkdXBlKSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGVzID09PSAnc3RyaW5nJykge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gICAgICBtb2R1bGVzID0gW1tudWxsLCBtb2R1bGVzLCAnJ11dO1xuICAgIH1cblxuICAgIHZhciBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzID0ge307XG5cbiAgICBpZiAoZGVkdXBlKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByZWZlci1kZXN0cnVjdHVyaW5nXG4gICAgICAgIHZhciBpZCA9IHRoaXNbaV1bMF07XG5cbiAgICAgICAgaWYgKGlkICE9IG51bGwpIHtcbiAgICAgICAgICBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2lkXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgbW9kdWxlcy5sZW5ndGg7IF9pKyspIHtcbiAgICAgIHZhciBpdGVtID0gW10uY29uY2F0KG1vZHVsZXNbX2ldKTtcblxuICAgICAgaWYgKGRlZHVwZSAmJiBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2l0ZW1bMF1dKSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb250aW51ZVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKG1lZGlhUXVlcnkpIHtcbiAgICAgICAgaWYgKCFpdGVtWzJdKSB7XG4gICAgICAgICAgaXRlbVsyXSA9IG1lZGlhUXVlcnk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsyXSA9IFwiXCIuY29uY2F0KG1lZGlhUXVlcnksIFwiIGFuZCBcIikuY29uY2F0KGl0ZW1bMl0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGxpc3QucHVzaChpdGVtKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIGxpc3Q7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5mdW5jdGlvbiBfc2xpY2VkVG9BcnJheShhcnIsIGkpIHsgcmV0dXJuIF9hcnJheVdpdGhIb2xlcyhhcnIpIHx8IF9pdGVyYWJsZVRvQXJyYXlMaW1pdChhcnIsIGkpIHx8IF91bnN1cHBvcnRlZEl0ZXJhYmxlVG9BcnJheShhcnIsIGkpIHx8IF9ub25JdGVyYWJsZVJlc3QoKTsgfVxuXG5mdW5jdGlvbiBfbm9uSXRlcmFibGVSZXN0KCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZS5cXG5JbiBvcmRlciB0byBiZSBpdGVyYWJsZSwgbm9uLWFycmF5IG9iamVjdHMgbXVzdCBoYXZlIGEgW1N5bWJvbC5pdGVyYXRvcl0oKSBtZXRob2QuXCIpOyB9XG5cbmZ1bmN0aW9uIF91bnN1cHBvcnRlZEl0ZXJhYmxlVG9BcnJheShvLCBtaW5MZW4pIHsgaWYgKCFvKSByZXR1cm47IGlmICh0eXBlb2YgbyA9PT0gXCJzdHJpbmdcIikgcmV0dXJuIF9hcnJheUxpa2VUb0FycmF5KG8sIG1pbkxlbik7IHZhciBuID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pLnNsaWNlKDgsIC0xKTsgaWYgKG4gPT09IFwiT2JqZWN0XCIgJiYgby5jb25zdHJ1Y3RvcikgbiA9IG8uY29uc3RydWN0b3IubmFtZTsgaWYgKG4gPT09IFwiTWFwXCIgfHwgbiA9PT0gXCJTZXRcIikgcmV0dXJuIEFycmF5LmZyb20obyk7IGlmIChuID09PSBcIkFyZ3VtZW50c1wiIHx8IC9eKD86VWl8SSludCg/Ojh8MTZ8MzIpKD86Q2xhbXBlZCk/QXJyYXkkLy50ZXN0KG4pKSByZXR1cm4gX2FycmF5TGlrZVRvQXJyYXkobywgbWluTGVuKTsgfVxuXG5mdW5jdGlvbiBfYXJyYXlMaWtlVG9BcnJheShhcnIsIGxlbikgeyBpZiAobGVuID09IG51bGwgfHwgbGVuID4gYXJyLmxlbmd0aCkgbGVuID0gYXJyLmxlbmd0aDsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBuZXcgQXJyYXkobGVuKTsgaSA8IGxlbjsgaSsrKSB7IGFycjJbaV0gPSBhcnJbaV07IH0gcmV0dXJuIGFycjI7IH1cblxuZnVuY3Rpb24gX2l0ZXJhYmxlVG9BcnJheUxpbWl0KGFyciwgaSkgeyBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJ1bmRlZmluZWRcIiB8fCAhKFN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QoYXJyKSkpIHJldHVybjsgdmFyIF9hcnIgPSBbXTsgdmFyIF9uID0gdHJ1ZTsgdmFyIF9kID0gZmFsc2U7IHZhciBfZSA9IHVuZGVmaW5lZDsgdHJ5IHsgZm9yICh2YXIgX2kgPSBhcnJbU3ltYm9sLml0ZXJhdG9yXSgpLCBfczsgIShfbiA9IChfcyA9IF9pLm5leHQoKSkuZG9uZSk7IF9uID0gdHJ1ZSkgeyBfYXJyLnB1c2goX3MudmFsdWUpOyBpZiAoaSAmJiBfYXJyLmxlbmd0aCA9PT0gaSkgYnJlYWs7IH0gfSBjYXRjaCAoZXJyKSB7IF9kID0gdHJ1ZTsgX2UgPSBlcnI7IH0gZmluYWxseSB7IHRyeSB7IGlmICghX24gJiYgX2lbXCJyZXR1cm5cIl0gIT0gbnVsbCkgX2lbXCJyZXR1cm5cIl0oKTsgfSBmaW5hbGx5IHsgaWYgKF9kKSB0aHJvdyBfZTsgfSB9IHJldHVybiBfYXJyOyB9XG5cbmZ1bmN0aW9uIF9hcnJheVdpdGhIb2xlcyhhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgcmV0dXJuIGFycjsgfVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcoaXRlbSkge1xuICB2YXIgX2l0ZW0gPSBfc2xpY2VkVG9BcnJheShpdGVtLCA0KSxcbiAgICAgIGNvbnRlbnQgPSBfaXRlbVsxXSxcbiAgICAgIGNzc01hcHBpbmcgPSBfaXRlbVszXTtcblxuICBpZiAodHlwZW9mIGJ0b2EgPT09ICdmdW5jdGlvbicpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcbiAgICB2YXIgYmFzZTY0ID0gYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoY3NzTWFwcGluZykpKSk7XG4gICAgdmFyIGRhdGEgPSBcInNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LFwiLmNvbmNhdChiYXNlNjQpO1xuICAgIHZhciBzb3VyY2VNYXBwaW5nID0gXCIvKiMgXCIuY29uY2F0KGRhdGEsIFwiICovXCIpO1xuICAgIHZhciBzb3VyY2VVUkxzID0gY3NzTWFwcGluZy5zb3VyY2VzLm1hcChmdW5jdGlvbiAoc291cmNlKSB7XG4gICAgICByZXR1cm4gXCIvKiMgc291cmNlVVJMPVwiLmNvbmNhdChjc3NNYXBwaW5nLnNvdXJjZVJvb3QgfHwgJycpLmNvbmNhdChzb3VyY2UsIFwiICovXCIpO1xuICAgIH0pO1xuICAgIHJldHVybiBbY29udGVudF0uY29uY2F0KHNvdXJjZVVSTHMpLmNvbmNhdChbc291cmNlTWFwcGluZ10pLmpvaW4oJ1xcbicpO1xuICB9XG5cbiAgcmV0dXJuIFtjb250ZW50XS5qb2luKCdcXG4nKTtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHVybCwgb3B0aW9ucykge1xuICBpZiAoIW9wdGlvbnMpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgICBvcHRpb25zID0ge307XG4gIH0gLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVyc2NvcmUtZGFuZ2xlLCBuby1wYXJhbS1yZWFzc2lnblxuXG5cbiAgdXJsID0gdXJsICYmIHVybC5fX2VzTW9kdWxlID8gdXJsLmRlZmF1bHQgOiB1cmw7XG5cbiAgaWYgKHR5cGVvZiB1cmwgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHVybDtcbiAgfSAvLyBJZiB1cmwgaXMgYWxyZWFkeSB3cmFwcGVkIGluIHF1b3RlcywgcmVtb3ZlIHRoZW1cblxuXG4gIGlmICgvXlsnXCJdLipbJ1wiXSQvLnRlc3QodXJsKSkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICAgIHVybCA9IHVybC5zbGljZSgxLCAtMSk7XG4gIH1cblxuICBpZiAob3B0aW9ucy5oYXNoKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gICAgdXJsICs9IG9wdGlvbnMuaGFzaDtcbiAgfSAvLyBTaG91bGQgdXJsIGJlIHdyYXBwZWQ/XG4gIC8vIFNlZSBodHRwczovL2RyYWZ0cy5jc3N3Zy5vcmcvY3NzLXZhbHVlcy0zLyN1cmxzXG5cblxuICBpZiAoL1tcIicoKSBcXHRcXG5dLy50ZXN0KHVybCkgfHwgb3B0aW9ucy5uZWVkUXVvdGVzKSB7XG4gICAgcmV0dXJuIFwiXFxcIlwiLmNvbmNhdCh1cmwucmVwbGFjZSgvXCIvZywgJ1xcXFxcIicpLnJlcGxhY2UoL1xcbi9nLCAnXFxcXG4nKSwgXCJcXFwiXCIpO1xuICB9XG5cbiAgcmV0dXJuIHVybDtcbn07IiwiZXhwb3J0IGRlZmF1bHQgX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcImFkNDVjN2E0OTQ1NWFkNmRkMjE1MTExNzA4YTk3MGRjLmpwZ1wiOyIsImV4cG9ydCBkZWZhdWx0IF9fd2VicGFja19wdWJsaWNfcGF0aF9fICsgXCJjODlhMDMwNWM2ZWJmZjM4NTg4NzhkZjYxMzY4NzY3YS5zdmdcIjsiLCJpbXBvcnQgYXBpIGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzXCI7XG4gICAgICAgICAgICBpbXBvcnQgY29udGVudCBmcm9tIFwiISEuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL3N0eWxlLmNzc1wiO1xuXG52YXIgb3B0aW9ucyA9IHt9O1xuXG5vcHRpb25zLmluc2VydCA9IFwiaGVhZFwiO1xub3B0aW9ucy5zaW5nbGV0b24gPSBmYWxzZTtcblxudmFyIHVwZGF0ZSA9IGFwaShjb250ZW50LCBvcHRpb25zKTtcblxuXG5cbmV4cG9ydCBkZWZhdWx0IGNvbnRlbnQubG9jYWxzIHx8IHt9OyIsImltcG9ydCBhcGkgZnJvbSBcIiEuLi8uLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanNcIjtcbiAgICAgICAgICAgIGltcG9ydCBjb250ZW50IGZyb20gXCIhIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vbWFuYS5jc3NcIjtcblxudmFyIG9wdGlvbnMgPSB7fTtcblxub3B0aW9ucy5pbnNlcnQgPSBcImhlYWRcIjtcbm9wdGlvbnMuc2luZ2xldG9uID0gZmFsc2U7XG5cbnZhciB1cGRhdGUgPSBhcGkoY29udGVudCwgb3B0aW9ucyk7XG5cblxuXG5leHBvcnQgZGVmYXVsdCBjb250ZW50LmxvY2FscyB8fCB7fTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIGlzT2xkSUUgPSBmdW5jdGlvbiBpc09sZElFKCkge1xuICB2YXIgbWVtbztcbiAgcmV0dXJuIGZ1bmN0aW9uIG1lbW9yaXplKCkge1xuICAgIGlmICh0eXBlb2YgbWVtbyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIC8vIFRlc3QgZm9yIElFIDw9IDkgYXMgcHJvcG9zZWQgYnkgQnJvd3NlcmhhY2tzXG4gICAgICAvLyBAc2VlIGh0dHA6Ly9icm93c2VyaGFja3MuY29tLyNoYWNrLWU3MWQ4NjkyZjY1MzM0MTczZmVlNzE1YzIyMmNiODA1XG4gICAgICAvLyBUZXN0cyBmb3IgZXhpc3RlbmNlIG9mIHN0YW5kYXJkIGdsb2JhbHMgaXMgdG8gYWxsb3cgc3R5bGUtbG9hZGVyXG4gICAgICAvLyB0byBvcGVyYXRlIGNvcnJlY3RseSBpbnRvIG5vbi1zdGFuZGFyZCBlbnZpcm9ubWVudHNcbiAgICAgIC8vIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3dlYnBhY2stY29udHJpYi9zdHlsZS1sb2FkZXIvaXNzdWVzLzE3N1xuICAgICAgbWVtbyA9IEJvb2xlYW4od2luZG93ICYmIGRvY3VtZW50ICYmIGRvY3VtZW50LmFsbCAmJiAhd2luZG93LmF0b2IpO1xuICAgIH1cblxuICAgIHJldHVybiBtZW1vO1xuICB9O1xufSgpO1xuXG52YXIgZ2V0VGFyZ2V0ID0gZnVuY3Rpb24gZ2V0VGFyZ2V0KCkge1xuICB2YXIgbWVtbyA9IHt9O1xuICByZXR1cm4gZnVuY3Rpb24gbWVtb3JpemUodGFyZ2V0KSB7XG4gICAgaWYgKHR5cGVvZiBtZW1vW3RhcmdldF0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB2YXIgc3R5bGVUYXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCk7IC8vIFNwZWNpYWwgY2FzZSB0byByZXR1cm4gaGVhZCBvZiBpZnJhbWUgaW5zdGVhZCBvZiBpZnJhbWUgaXRzZWxmXG5cbiAgICAgIGlmICh3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQgJiYgc3R5bGVUYXJnZXQgaW5zdGFuY2VvZiB3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAvLyBUaGlzIHdpbGwgdGhyb3cgYW4gZXhjZXB0aW9uIGlmIGFjY2VzcyB0byBpZnJhbWUgaXMgYmxvY2tlZFxuICAgICAgICAgIC8vIGR1ZSB0byBjcm9zcy1vcmlnaW4gcmVzdHJpY3Rpb25zXG4gICAgICAgICAgc3R5bGVUYXJnZXQgPSBzdHlsZVRhcmdldC5jb250ZW50RG9jdW1lbnQuaGVhZDtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIC8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0XG4gICAgICAgICAgc3R5bGVUYXJnZXQgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIG1lbW9bdGFyZ2V0XSA9IHN0eWxlVGFyZ2V0O1xuICAgIH1cblxuICAgIHJldHVybiBtZW1vW3RhcmdldF07XG4gIH07XG59KCk7XG5cbnZhciBzdHlsZXNJbkRvbSA9IFtdO1xuXG5mdW5jdGlvbiBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKSB7XG4gIHZhciByZXN1bHQgPSAtMTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0eWxlc0luRG9tLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHN0eWxlc0luRG9tW2ldLmlkZW50aWZpZXIgPT09IGlkZW50aWZpZXIpIHtcbiAgICAgIHJlc3VsdCA9IGk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucykge1xuICB2YXIgaWRDb3VudE1hcCA9IHt9O1xuICB2YXIgaWRlbnRpZmllcnMgPSBbXTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaXRlbSA9IGxpc3RbaV07XG4gICAgdmFyIGlkID0gb3B0aW9ucy5iYXNlID8gaXRlbVswXSArIG9wdGlvbnMuYmFzZSA6IGl0ZW1bMF07XG4gICAgdmFyIGNvdW50ID0gaWRDb3VudE1hcFtpZF0gfHwgMDtcbiAgICB2YXIgaWRlbnRpZmllciA9IFwiXCIuY29uY2F0KGlkLCBcIiBcIikuY29uY2F0KGNvdW50KTtcbiAgICBpZENvdW50TWFwW2lkXSA9IGNvdW50ICsgMTtcbiAgICB2YXIgaW5kZXggPSBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgICB2YXIgb2JqID0ge1xuICAgICAgY3NzOiBpdGVtWzFdLFxuICAgICAgbWVkaWE6IGl0ZW1bMl0sXG4gICAgICBzb3VyY2VNYXA6IGl0ZW1bM11cbiAgICB9O1xuXG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgc3R5bGVzSW5Eb21baW5kZXhdLnJlZmVyZW5jZXMrKztcbiAgICAgIHN0eWxlc0luRG9tW2luZGV4XS51cGRhdGVyKG9iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0eWxlc0luRG9tLnB1c2goe1xuICAgICAgICBpZGVudGlmaWVyOiBpZGVudGlmaWVyLFxuICAgICAgICB1cGRhdGVyOiBhZGRTdHlsZShvYmosIG9wdGlvbnMpLFxuICAgICAgICByZWZlcmVuY2VzOiAxXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZGVudGlmaWVycy5wdXNoKGlkZW50aWZpZXIpO1xuICB9XG5cbiAgcmV0dXJuIGlkZW50aWZpZXJzO1xufVxuXG5mdW5jdGlvbiBpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucykge1xuICB2YXIgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICB2YXIgYXR0cmlidXRlcyA9IG9wdGlvbnMuYXR0cmlidXRlcyB8fCB7fTtcblxuICBpZiAodHlwZW9mIGF0dHJpYnV0ZXMubm9uY2UgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgdmFyIG5vbmNlID0gdHlwZW9mIF9fd2VicGFja19ub25jZV9fICE9PSAndW5kZWZpbmVkJyA/IF9fd2VicGFja19ub25jZV9fIDogbnVsbDtcblxuICAgIGlmIChub25jZSkge1xuICAgICAgYXR0cmlidXRlcy5ub25jZSA9IG5vbmNlO1xuICAgIH1cbiAgfVxuXG4gIE9iamVjdC5rZXlzKGF0dHJpYnV0ZXMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIHN0eWxlLnNldEF0dHJpYnV0ZShrZXksIGF0dHJpYnV0ZXNba2V5XSk7XG4gIH0pO1xuXG4gIGlmICh0eXBlb2Ygb3B0aW9ucy5pbnNlcnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICBvcHRpb25zLmluc2VydChzdHlsZSk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIHRhcmdldCA9IGdldFRhcmdldChvcHRpb25zLmluc2VydCB8fCAnaGVhZCcpO1xuXG4gICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkbid0IGZpbmQgYSBzdHlsZSB0YXJnZXQuIFRoaXMgcHJvYmFibHkgbWVhbnMgdGhhdCB0aGUgdmFsdWUgZm9yIHRoZSAnaW5zZXJ0JyBwYXJhbWV0ZXIgaXMgaW52YWxpZC5cIik7XG4gICAgfVxuXG4gICAgdGFyZ2V0LmFwcGVuZENoaWxkKHN0eWxlKTtcbiAgfVxuXG4gIHJldHVybiBzdHlsZTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlKSB7XG4gIC8vIGlzdGFuYnVsIGlnbm9yZSBpZlxuICBpZiAoc3R5bGUucGFyZW50Tm9kZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHN0eWxlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc3R5bGUpO1xufVxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5cblxudmFyIHJlcGxhY2VUZXh0ID0gZnVuY3Rpb24gcmVwbGFjZVRleHQoKSB7XG4gIHZhciB0ZXh0U3RvcmUgPSBbXTtcbiAgcmV0dXJuIGZ1bmN0aW9uIHJlcGxhY2UoaW5kZXgsIHJlcGxhY2VtZW50KSB7XG4gICAgdGV4dFN0b3JlW2luZGV4XSA9IHJlcGxhY2VtZW50O1xuICAgIHJldHVybiB0ZXh0U3RvcmUuZmlsdGVyKEJvb2xlYW4pLmpvaW4oJ1xcbicpO1xuICB9O1xufSgpO1xuXG5mdW5jdGlvbiBhcHBseVRvU2luZ2xldG9uVGFnKHN0eWxlLCBpbmRleCwgcmVtb3ZlLCBvYmopIHtcbiAgdmFyIGNzcyA9IHJlbW92ZSA/ICcnIDogb2JqLm1lZGlhID8gXCJAbWVkaWEgXCIuY29uY2F0KG9iai5tZWRpYSwgXCIge1wiKS5jb25jYXQob2JqLmNzcywgXCJ9XCIpIDogb2JqLmNzczsgLy8gRm9yIG9sZCBJRVxuXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAgKi9cblxuICBpZiAoc3R5bGUuc3R5bGVTaGVldCkge1xuICAgIHN0eWxlLnN0eWxlU2hlZXQuY3NzVGV4dCA9IHJlcGxhY2VUZXh0KGluZGV4LCBjc3MpO1xuICB9IGVsc2Uge1xuICAgIHZhciBjc3NOb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKTtcbiAgICB2YXIgY2hpbGROb2RlcyA9IHN0eWxlLmNoaWxkTm9kZXM7XG5cbiAgICBpZiAoY2hpbGROb2Rlc1tpbmRleF0pIHtcbiAgICAgIHN0eWxlLnJlbW92ZUNoaWxkKGNoaWxkTm9kZXNbaW5kZXhdKTtcbiAgICB9XG5cbiAgICBpZiAoY2hpbGROb2Rlcy5sZW5ndGgpIHtcbiAgICAgIHN0eWxlLmluc2VydEJlZm9yZShjc3NOb2RlLCBjaGlsZE5vZGVzW2luZGV4XSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0eWxlLmFwcGVuZENoaWxkKGNzc05vZGUpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBhcHBseVRvVGFnKHN0eWxlLCBvcHRpb25zLCBvYmopIHtcbiAgdmFyIGNzcyA9IG9iai5jc3M7XG4gIHZhciBtZWRpYSA9IG9iai5tZWRpYTtcbiAgdmFyIHNvdXJjZU1hcCA9IG9iai5zb3VyY2VNYXA7XG5cbiAgaWYgKG1lZGlhKSB7XG4gICAgc3R5bGUuc2V0QXR0cmlidXRlKCdtZWRpYScsIG1lZGlhKTtcbiAgfSBlbHNlIHtcbiAgICBzdHlsZS5yZW1vdmVBdHRyaWJ1dGUoJ21lZGlhJyk7XG4gIH1cblxuICBpZiAoc291cmNlTWFwICYmIHR5cGVvZiBidG9hICE9PSAndW5kZWZpbmVkJykge1xuICAgIGNzcyArPSBcIlxcbi8qIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsXCIuY29uY2F0KGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHNvdXJjZU1hcCkpKSksIFwiICovXCIpO1xuICB9IC8vIEZvciBvbGQgSUVcblxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgICovXG5cblxuICBpZiAoc3R5bGUuc3R5bGVTaGVldCkge1xuICAgIHN0eWxlLnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcbiAgfSBlbHNlIHtcbiAgICB3aGlsZSAoc3R5bGUuZmlyc3RDaGlsZCkge1xuICAgICAgc3R5bGUucmVtb3ZlQ2hpbGQoc3R5bGUuZmlyc3RDaGlsZCk7XG4gICAgfVxuXG4gICAgc3R5bGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKSk7XG4gIH1cbn1cblxudmFyIHNpbmdsZXRvbiA9IG51bGw7XG52YXIgc2luZ2xldG9uQ291bnRlciA9IDA7XG5cbmZ1bmN0aW9uIGFkZFN0eWxlKG9iaiwgb3B0aW9ucykge1xuICB2YXIgc3R5bGU7XG4gIHZhciB1cGRhdGU7XG4gIHZhciByZW1vdmU7XG5cbiAgaWYgKG9wdGlvbnMuc2luZ2xldG9uKSB7XG4gICAgdmFyIHN0eWxlSW5kZXggPSBzaW5nbGV0b25Db3VudGVyKys7XG4gICAgc3R5bGUgPSBzaW5nbGV0b24gfHwgKHNpbmdsZXRvbiA9IGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKSk7XG4gICAgdXBkYXRlID0gYXBwbHlUb1NpbmdsZXRvblRhZy5iaW5kKG51bGwsIHN0eWxlLCBzdHlsZUluZGV4LCBmYWxzZSk7XG4gICAgcmVtb3ZlID0gYXBwbHlUb1NpbmdsZXRvblRhZy5iaW5kKG51bGwsIHN0eWxlLCBzdHlsZUluZGV4LCB0cnVlKTtcbiAgfSBlbHNlIHtcbiAgICBzdHlsZSA9IGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKTtcbiAgICB1cGRhdGUgPSBhcHBseVRvVGFnLmJpbmQobnVsbCwgc3R5bGUsIG9wdGlvbnMpO1xuXG4gICAgcmVtb3ZlID0gZnVuY3Rpb24gcmVtb3ZlKCkge1xuICAgICAgcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlKTtcbiAgICB9O1xuICB9XG5cbiAgdXBkYXRlKG9iaik7XG4gIHJldHVybiBmdW5jdGlvbiB1cGRhdGVTdHlsZShuZXdPYmopIHtcbiAgICBpZiAobmV3T2JqKSB7XG4gICAgICBpZiAobmV3T2JqLmNzcyA9PT0gb2JqLmNzcyAmJiBuZXdPYmoubWVkaWEgPT09IG9iai5tZWRpYSAmJiBuZXdPYmouc291cmNlTWFwID09PSBvYmouc291cmNlTWFwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdXBkYXRlKG9iaiA9IG5ld09iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlbW92ZSgpO1xuICAgIH1cbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobGlzdCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTsgLy8gRm9yY2Ugc2luZ2xlLXRhZyBzb2x1dGlvbiBvbiBJRTYtOSwgd2hpY2ggaGFzIGEgaGFyZCBsaW1pdCBvbiB0aGUgIyBvZiA8c3R5bGU+XG4gIC8vIHRhZ3MgaXQgd2lsbCBhbGxvdyBvbiBhIHBhZ2VcblxuICBpZiAoIW9wdGlvbnMuc2luZ2xldG9uICYmIHR5cGVvZiBvcHRpb25zLnNpbmdsZXRvbiAhPT0gJ2Jvb2xlYW4nKSB7XG4gICAgb3B0aW9ucy5zaW5nbGV0b24gPSBpc09sZElFKCk7XG4gIH1cblxuICBsaXN0ID0gbGlzdCB8fCBbXTtcbiAgdmFyIGxhc3RJZGVudGlmaWVycyA9IG1vZHVsZXNUb0RvbShsaXN0LCBvcHRpb25zKTtcbiAgcmV0dXJuIGZ1bmN0aW9uIHVwZGF0ZShuZXdMaXN0KSB7XG4gICAgbmV3TGlzdCA9IG5ld0xpc3QgfHwgW107XG5cbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG5ld0xpc3QpICE9PSAnW29iamVjdCBBcnJheV0nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBpZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW2ldO1xuICAgICAgdmFyIGluZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gICAgICBzdHlsZXNJbkRvbVtpbmRleF0ucmVmZXJlbmNlcy0tO1xuICAgIH1cblxuICAgIHZhciBuZXdMYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obmV3TGlzdCwgb3B0aW9ucyk7XG5cbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgbGFzdElkZW50aWZpZXJzLmxlbmd0aDsgX2krKykge1xuICAgICAgdmFyIF9pZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW19pXTtcblxuICAgICAgdmFyIF9pbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKF9pZGVudGlmaWVyKTtcblxuICAgICAgaWYgKHN0eWxlc0luRG9tW19pbmRleF0ucmVmZXJlbmNlcyA9PT0gMCkge1xuICAgICAgICBzdHlsZXNJbkRvbVtfaW5kZXhdLnVwZGF0ZXIoKTtcblxuICAgICAgICBzdHlsZXNJbkRvbS5zcGxpY2UoX2luZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsYXN0SWRlbnRpZmllcnMgPSBuZXdMYXN0SWRlbnRpZmllcnM7XG4gIH07XG59OyIsImltcG9ydCAnLi4vY3NzL3N0eWxlLmNzcyc7XG5pbXBvcnQgJy4uL2Nzcy92ZW5kb3IvbWFuYS5jc3MnO1xuaW1wb3J0IFNlYXJjaCBmcm9tICcuL21vZGVscy9TZWFyY2gnO1xuaW1wb3J0ICogYXMgc2VhcmNoVmlldyBmcm9tICcuL3ZpZXdzL3NlYXJjaFZpZXcnO1xuaW1wb3J0ICogYXMgcmVzdWx0c1ZpZXcgZnJvbSAnLi92aWV3cy9yZXN1bHRzVmlldyc7XG5pbXBvcnQgKiBhcyBjYXJkVmlldyBmcm9tICcuL3ZpZXdzL2NhcmRWaWV3JztcbmltcG9ydCB7IGVsZW1lbnRzIH0gZnJvbSAnLi92aWV3cy9iYXNlJztcblxuXG5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqIFNlYXJjaCBQYWdlICoqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbmlmICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgPT09ICcvc2VhcmNoJykge1xuICAgIGNvbnN0IHNlYXJjaCA9IG5ldyBTZWFyY2goKTtcblxuICAgIC8vIEV2ZW50IGxpc3RlbmVyIGZvciB0aGUgc3VibWl0IHNlYXJjaCBidXR0b24uIFRoaXMgZ29lcyB0aHJvdWdoIHRoZSBmb3JtIGFuZCBnZW5lcmF0ZXNcbiAgICAvLyB0aGUgcXVqZXJ5IHN0cmluZy4gSXQgdGhlbiBwYXNzZXMgdGhlIHN0cmluZyB0byB0aGUgc2VydmVyIHRocm91Z2ggdGhlIFVSTFxuICAgIGVsZW1lbnRzLmFwaVNlYXJjaC5zdWJtaXRCdG4ub25jbGljayA9IGFzeW5jIGUgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcblxuICAgICAgICAvLyBDbGVhciBhbnkgZXhpc3RpbmcgcXVlcnkgc3RyaW5nXG4gICAgICAgIHNlYXJjaC5yZXNldFNlYXJjaFF1ZXJ5KCk7XG4gICAgXG4gICAgICAgIC8vIEJ1aWxkIHRoZSBxdWVyeSBzdHJpbmdcbiAgICAgICAgY29uc3QgcXVlcnkgPSBzZWFyY2guYnVpbGRTZWFyY2hRdWVyeSgpO1xuXG4gICAgICAgIC8vIEdldCB0aGUgZGlzcGxheSBtZXRob2RcbiAgICAgICAgY29uc3QgZGlzcGxheU1ldGhvZCA9IHNlYXJjaC5kaXNwbGF5TWV0aG9kKCk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGEgZ2V0IHJlcXVlc3Qgd2l0aCB0aGUgcXVlcnkgc3RyaW5nXG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gYC9yZXN1bHRzLyR7ZGlzcGxheU1ldGhvZH0vJHtxdWVyeX1gO1xuICAgIFxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBlbGVtZW50cy5hcGlTZWFyY2gudHlwZUxpbmUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIC8vIERpc3BsYXkgdGhlIGRyb3Bkb3duXG4gICAgICAgIHNlYXJjaFZpZXcuc2hvd1R5cGVzRHJvcERvd24oKTtcbiAgICAgICAgc2VhcmNoVmlldy5zdGFydFR5cGVzRHJvcERvd25OYXZpZ2F0aW9uKCk7XG5cbiAgICAgICAgLy8gU3RhcnQgYW4gZXZlbnQgbGlzdGVuZXIgb24gdGhlIGRvY3VtZW50LiBUaGlzIHdpbGwgY2xvc2UgdGhlIGRyb3Bkb3duIGlmIHRoZSB1c2VyIGNsaWNrc1xuICAgICAgICAvLyBvdXRzaWRlIG9mIHRoZSBpbnB1dCBvciBkcm9wZG93bi4gVGhpcyB3aWxsIGFsc28gY2FuY2VsIHRoZSBldmVudCBsaXN0ZW5lclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNlYXJjaFZpZXcudHlwZUxpbmVMaXN0ZW5lcilcbiAgICB9KVxuXG4gICAgZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVMaW5lLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xuICAgICAgICBpZiAoZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVEcm9wRG93bi5oYXNBdHRyaWJ1dGUoJ2hpZGRlbicpKSB7XG4gICAgICAgICAgICBzZWFyY2hWaWV3LnNob3dUeXBlc0Ryb3BEb3duKCk7XG4gICAgICAgIH1cblxuICAgICAgICBzZWFyY2hWaWV3LmZpbHRlclR5cGVzKGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlTGluZS52YWx1ZSk7XG4gICAgICAgIHNlYXJjaFZpZXcuZmlsdGVyVHlwZUhlYWRlcnMoKTtcbiAgICAgICAgc2VhcmNoVmlldy5zdGFydFR5cGVzRHJvcERvd25OYXZpZ2F0aW9uKCk7XG4gICAgfSlcblxuICAgIGVsZW1lbnRzLmFwaVNlYXJjaC5zZXRJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgLy8gRGlzcGxheSB0aGUgZHJvcGRvd25cbiAgICAgICAgc2VhcmNoVmlldy5zaG93U2V0c0Ryb3BEb3duKCk7XG4gICAgICAgIHNlYXJjaFZpZXcuc3RhcnRTZXRzRHJvcERvd25OYXZpZ2F0aW9uKCk7XG5cbiAgICAgICAgLy8gU3RhcnQgYW4gZXZlbnQgbGlzdGVuZXIgb24gdGhlIGRvY3VtZW50LiBUaGlzIHdpbGwgY2xvc2UgdGhlIGRyb3Bkb3duIGlmIHRoZSB1c2VyIGNsaWNrc1xuICAgICAgICAvLyBvdXRzaWRlIG9mIHRoZSBpbnB1dCBvciBkcm9wZG93bi4gVGhpcyB3aWxsIGFsc28gY2FuY2VsIHRoZSBldmVudCBsaXN0ZW5lclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNlYXJjaFZpZXcuc2V0SW5wdXRMaXN0ZW5lcilcbiAgICB9KVxuXG4gICAgZWxlbWVudHMuYXBpU2VhcmNoLnNldElucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xuICAgICAgICBpZiAoZWxlbWVudHMuYXBpU2VhcmNoLnNldERyb3BEb3duLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIHtcbiAgICAgICAgICAgIHNlYXJjaFZpZXcuc2hvd1NldHNEcm9wRG93bigpO1xuICAgICAgICB9XG5cbiAgICAgICAgc2VhcmNoVmlldy5maWx0ZXJTZXRzKGVsZW1lbnRzLmFwaVNlYXJjaC5zZXRJbnB1dC52YWx1ZSk7XG4gICAgICAgIHNlYXJjaFZpZXcuZmlsdGVyU2V0SGVhZGVycygpOyAgICAgICAgXG4gICAgICAgIHNlYXJjaFZpZXcuc3RhcnRTZXRzRHJvcERvd25OYXZpZ2F0aW9uKCk7XG4gICAgfSlcblxuICAgIGVsZW1lbnRzLmFwaVNlYXJjaC5zdGF0VmFsdWUuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgJ2lucHV0Jywgc2VhcmNoVmlldy5zdGF0TGluZUNvbnRyb2xsZXJcbiAgICApO1xufSBcblxuIFxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKiogUmVzdWx0cyBQYWdlICoqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuaWYgKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zdWJzdHJpbmcoMSwgOCkgPT09ICdyZXN1bHRzJykge1xuICAgIGNvbnN0IHN0YXRlID0ge1xuICAgICAgICBzZWFyY2g6IG5ldyBTZWFyY2goKSxcblxuICAgICAgICAvLyBHZXQgdGhlIGRpc3BsYXkgbWV0aG9kLCBzb3J0IG1ldGhvZCwgYW5kIHF1ZXJ5IGZyb20gdGhlIFVSTFxuICAgICAgICBkaXNwbGF5OiB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3Vic3RyaW5nKDksIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5sYXN0SW5kZXhPZignLycpKSxcbiAgICAgICAgcXVlcnk6IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zdWJzdHJpbmcod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLmxhc3RJbmRleE9mKCcvJykgKyAxKSxcbiAgICAgICAgc29ydE1ldGhvZDogd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnN1YnN0cmluZyh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUubGFzdEluZGV4T2YoJz0nKSArIDEpLFxuXG4gICAgICAgIGFsbENhcmRzOiBbXSxcbiAgICAgICAgY3VycmVudEluZGV4OiAwLFxuICAgICAgICBhbGxSZXN1bHRzTG9hZGVkOiBmYWxzZSxcbiAgICB9O1xuXG4gICAgLy8gV2hlbiB0aGUgcmVzdWx0cyBwYWdlIGlzIHJlZnJlc2hlZCwgZGlzcGxheSB0aGUgY2FyZHMgYXMgYSBjaGVja2xpc3QgYnkgZGVmYXVsdFxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgc29ydCBieSBhbmQgZGlzcGxheSBhc2QgbWVudXMgc28gdGhlIHNlbGVjdGVkIG9wdGlvbiBpcyB3aGF0IHRoZSB1c2VyIHNlbGVjdGVkXG4gICAgICAgIHJlc3VsdHNWaWV3LmNob3NlU2VsZWN0TWVudVNvcnQoZWxlbWVudHMucmVzdWx0c1BhZ2Uuc29ydEJ5Lm9wdGlvbnMsIHN0YXRlKTtcbiAgICAgICAgcmVzdWx0c1ZpZXcuY2hvc2VTZWxlY3RNZW51RGlzcGxheShlbGVtZW50cy5yZXN1bHRzUGFnZS5kaXNwbGF5U2VsZWN0b3IsIHN0YXRlKVxuXG4gICAgICAgIC8vIFJ1biB0aGUgZ2V0IGNhcmRzIGZ1bmN0aW9uLCB0aGVuIHVwZGF0ZSB0aGUgZGlzcGxheSBiYXIgd2l0aCB0aGUgdG90YWwgY2FyZCBjb3VudFxuICAgICAgICBhd2FpdCBzdGF0ZS5zZWFyY2guZ2V0Q2FyZHMoc3RhdGUpO1xuXG4gICAgICAgIGlmIChzdGF0ZS5hbGxDYXJkc1swXSA9PT0gNDA0KSB7XG4gICAgICAgICAgICByZXN1bHRzVmlldy5kaXNwbGF5NDA0KCk7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIHJlc3VsdHNWaWV3LnVwZGF0ZURpc3BsYXlCYXIoc3RhdGUpO1xuICAgICAgICBjb25zb2xlLmxvZyhzdGF0ZS5zZWFyY2guY2FyZHMpO1xuICAgICAgICBjb25zb2xlLmxvZyhzdGF0ZS5xdWVyeSlcblxuICAgICAgICAvLyBJbiB0aGUgYmFja2dyb3VuZCwgZ2V0IGFsbCBjYXJkcyBcbiAgICAgICAgc3RhdGUuc2VhcmNoLmdldEFsbENhcmRzKHN0YXRlLCByZXN1bHRzVmlldy5lbmFibGVCdG4pO1xuXG4gICAgICAgIC8vIE9uIGxvYWRpbmcgdGhlIHBhZ2UgZGlzcGxheSB0aGUgY2FyZHMgaW4gYSBjaGVja2xpc3RcbiAgICAgICAgcmVzdWx0c1ZpZXcudXBkYXRlRGlzcGxheShzdGF0ZSk7XG4gICAgfSk7XG5cbiAgICAvLyBFdmVudCBsaXN0ZW5lciBmb3IgdGhlIGNoYW5nZSBkaXNwbGF5IG1ldGhvZCBidXR0b25cbiAgICBlbGVtZW50cy5yZXN1bHRzUGFnZS5idG4ub25jbGljayA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgLy8gVXBkYXRlIHRoZSBkaXNwbGF5IG1ldGhvZCBiZXR3ZWVuIGNoZWNrbGlzdCBhbmQgY2FyZHMgaWYgdGhlIHVzZXIgY2hhbmdlZCBpdFxuICAgICAgICByZXN1bHRzVmlldy5jaGFuZ2VEaXNwbGF5QW5kVXJsKHN0YXRlKTtcblxuICAgICAgICAvLyBJZiBhIG5ldyBzb3J0aW5nIG1ldGhvZCBpcyBzZWxlY3RlZCwgYSByZXF1ZXN0IGlzIHNlbnQgdG8gdGhlIHNlcnZlciBhbmQgdGhlIHBhZ2UgaXMgcmVmcmVzaGVkLlxuICAgICAgICAvLyBUaGlzIHJlc2V0cyB0aGUgc3RhdGUgYW5kIGFzeW5jIHRhc2tzXG4gICAgICAgIHJlc3VsdHNWaWV3LmNoYW5nZVNvcnRNZXRob2Qoc3RhdGUpO1xuICAgICAgICBcbiAgICAgICAgLy8gVXBkYXRlIHRoZSBkaXNwbGF5IHdpdGggYSBuZXcgc29ydCBtZXRob2QgYW5kIGRpc3BsYXkgbWV0aG9kIGlmIGVpdGhlciB3ZXJlIGdpdmVuXG4gICAgICAgIHJlc3VsdHNWaWV3LnVwZGF0ZURpc3BsYXkoc3RhdGUpO1xuICAgIH07XG5cbiAgICAvLyBFdmVudCBMaXN0ZW5lciBmb3IgbmV4dCBwYWdlIGJ1dHRvblxuICAgIGVsZW1lbnRzLnJlc3VsdHNQYWdlLm5leHRQYWdlQnRuLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgaW5kZXhcbiAgICAgICAgc3RhdGUuY3VycmVudEluZGV4ICsrO1xuICAgICAgICBcbiAgICAgICAgLy8gVXBkYXRlIHRoZSBkaXNwbGF5IGJhc2VkIG9uIHRoZSBtZXRob2Qgc3RvcmVkIGluIHRoZSBzdGF0ZVxuICAgICAgICByZXN1bHRzVmlldy51cGRhdGVEaXNwbGF5KHN0YXRlKTtcblxuICAgICAgICAvLyBVcGRhdGUgdGhlIGRpc3BsYXkgYmFyXG4gICAgICAgIHJlc3VsdHNWaWV3LnVwZGF0ZURpc3BsYXlCYXIoc3RhdGUpO1xuXG4gICAgICAgIC8vIEVuYWJsZSB0aGUgcHJldmlvdXMgcGFnZSBhbmQgZmlyc3QgcGFnZSBidG5zXG4gICAgICAgIHJlc3VsdHNWaWV3LmVuYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5wcmV2aW91c1BhZ2VCdG4pO1xuICAgICAgICByZXN1bHRzVmlldy5lbmFibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UuZmlyc3RQYWdlQnRuKTtcblxuICAgICAgICAvLyBJZiBvbiB0aGUgbGFzdCBwYWdlLCBkaXNhYmxlIHRoZSBuZXh0IHBhZ2UgYnRuIGFuZCBsYXN0IHBhZ2UgYnRuXG4gICAgICAgIGlmIChzdGF0ZS5jdXJyZW50SW5kZXggPT09IChzdGF0ZS5hbGxDYXJkcy5sZW5ndGggLSAxKSkge1xuICAgICAgICAgICAgcmVzdWx0c1ZpZXcuZGlzYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5uZXh0UGFnZUJ0bik7XG4gICAgICAgICAgICByZXN1bHRzVmlldy5kaXNhYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLmxhc3RQYWdlQnRuKVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIEV2ZW50IGxpc3RlbmVyIGZvciB0aGUgbGFzdCBwYWdlIGJ0blxuICAgIGVsZW1lbnRzLnJlc3VsdHNQYWdlLmxhc3RQYWdlQnRuLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgaW5kZXhcbiAgICAgICAgc3RhdGUuY3VycmVudEluZGV4ID0gc3RhdGUuYWxsQ2FyZHMubGVuZ3RoIC0gMTtcblxuICAgICAgICAvLyBVcGRhdGUgdGhlIGRpc3BsYXkgYmFzZWQgb24gdGhlIG1ldGhvZCBzdG9yZWQgaW4gdGhlIHN0YXRlXG4gICAgICAgIHJlc3VsdHNWaWV3LnVwZGF0ZURpc3BsYXkoc3RhdGUpO1xuXG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgZGlzcGxheSBiYXJcbiAgICAgICAgcmVzdWx0c1ZpZXcudXBkYXRlRGlzcGxheUJhcihzdGF0ZSk7XG5cbiAgICAgICAgLy8gRGlzYWJsZSB0aGUgbmV4dCBhbmQgbGFzdCBwYWdlIGJ1dHRvbnNcbiAgICAgICAgcmVzdWx0c1ZpZXcuZGlzYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5uZXh0UGFnZUJ0bik7XG4gICAgICAgIHJlc3VsdHNWaWV3LmRpc2FibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UubGFzdFBhZ2VCdG4pO1xuXG4gICAgICAgIC8vIEVuYWJsZSB0aGUgcHJldmlvdXMgYW5kIGZpcnN0IHBhZ2UgYnV0dG9uc1xuICAgICAgICByZXN1bHRzVmlldy5lbmFibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UucHJldmlvdXNQYWdlQnRuKTtcbiAgICAgICAgcmVzdWx0c1ZpZXcuZW5hYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLmZpcnN0UGFnZUJ0bik7XG4gICAgfTtcblxuICAgIC8vIEV2ZW50IGxpc3RlbmVyIGZvciB0aGUgcHJldmlvdXMgcGFnZSBidXR0b25cbiAgICBlbGVtZW50cy5yZXN1bHRzUGFnZS5wcmV2aW91c1BhZ2VCdG4ub25jbGljayA9ICgpID0+IHtcbiAgICAgICAgLy8gVXBkYXRlIHRoZSBpbmRleFxuICAgICAgICBzdGF0ZS5jdXJyZW50SW5kZXggLS07XG5cbiAgICAgICAgLy8gVXBkYXRlIHRoZSBkaXNwbGF5IGJhc2VkIG9uIHRoZSBtZXRob2Qgc3RvcmVkIGluIHRoZSBzdGF0ZVxuICAgICAgICByZXN1bHRzVmlldy51cGRhdGVEaXNwbGF5KHN0YXRlKTtcblxuICAgICAgICAvLyBVcGRhdGUgdGhlIGRpc3BsYXkgYmFyXG4gICAgICAgIHJlc3VsdHNWaWV3LnVwZGF0ZURpc3BsYXlCYXIoc3RhdGUpO1xuXG4gICAgICAgIC8vIElmIG9uIHRoZSBmaXJzdCBwYWdlLCBkaXNhYmxlIHRoZSBwcmV2aW91cyBhbmQgZmlyc3QgcGFnZSBidXR0b25zXG4gICAgICAgIGlmIChzdGF0ZS5jdXJyZW50SW5kZXggPT09IDApIHtcbiAgICAgICAgICAgIHJlc3VsdHNWaWV3LmRpc2FibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UucHJldmlvdXNQYWdlQnRuKTtcbiAgICAgICAgICAgIHJlc3VsdHNWaWV3LmRpc2FibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UuZmlyc3RQYWdlQnRuKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEVuYWJsZSB0aGUgbmV4dCBhbmQgbGFzdCBwYWdlIGJ1dHRvbnMuIFRoZSBsYXN0IHBhZ2UgYnV0dG9uIHNob3VsZCBvbmx5IGJlIFxuICAgICAgICAvLyBlbmFibGVkIGlmIGFsbCByZXN1bHRzIGhhdmUgYmVlbiBsb2FkZWRcbiAgICAgICAgcmVzdWx0c1ZpZXcuZW5hYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLm5leHRQYWdlQnRuKTtcbiAgICAgICAgaWYgKHN0YXRlLmFsbFJlc3VsdHNMb2FkZWQpIHJlc3VsdHNWaWV3LmVuYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5sYXN0UGFnZUJ0bik7XG4gICAgfTtcblxuICAgIC8vIEV2ZW50IGxpc3RlbmVyIGZvciB0aGUgZmlyc3QgcGFnZSBidG5cbiAgICBlbGVtZW50cy5yZXN1bHRzUGFnZS5maXJzdFBhZ2VCdG4ub25jbGljayA9ICgpID0+IHtcbiAgICAgICAgLy8gVXBkYXRlIHRoZSBpbmRleFxuICAgICAgICBzdGF0ZS5jdXJyZW50SW5kZXggPSAwO1xuXG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgZGlzcGxheSBiYXNlZCBvbiB0aGUgbWV0aG9kIHN0b3JlZCBpbiB0aGUgc3RhdGVcbiAgICAgICAgcmVzdWx0c1ZpZXcudXBkYXRlRGlzcGxheShzdGF0ZSk7XG5cbiAgICAgICAgLy8gVXBkYXRlIHRoZSBkaXNwbGF5IGJhclxuICAgICAgICByZXN1bHRzVmlldy51cGRhdGVEaXNwbGF5QmFyKHN0YXRlKTtcblxuICAgICAgICAvLyBEaXNhYmxlIHRoZSBwcmV2aW91cyBhbmQgZmlyc3QgcGFnZSBidXR0b25zXG4gICAgICAgIHJlc3VsdHNWaWV3LmRpc2FibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UucHJldmlvdXNQYWdlQnRuKTtcbiAgICAgICAgcmVzdWx0c1ZpZXcuZGlzYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5maXJzdFBhZ2VCdG4pO1xuXG4gICAgICAgIC8vIEVuYWJsZSB0aGUgbmV4dCBhbmQgbGFzdCBwYWdlIGJ1dHRvbnMuIFRoZSBsYXN0IHBhZ2UgYnV0dG9uIHNob3VsZCBvbmx5IGJlIFxuICAgICAgICAvLyBlbmFibGVkIGlmIGFsbCByZXN1bHRzIGhhdmUgYmVlbiBsb2FkZWRcbiAgICAgICAgcmVzdWx0c1ZpZXcuZW5hYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLm5leHRQYWdlQnRuKTtcbiAgICAgICAgaWYgKHN0YXRlLmFsbFJlc3VsdHNMb2FkZWQpIHJlc3VsdHNWaWV3LmVuYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5sYXN0UGFnZUJ0bik7XG4gICAgfVxuXG4gICAgd2luZG93Lm9ucG9wc3RhdGUgPSBlID0+IHtcbiAgICAgICAgLy8gY29uc3QgZGF0YSA9IGUuc3RhdGU7XG4gICAgICAgIC8vIGlmIChkYXRhICE9PSBudWxsKSByZXN1bHRzVmlldy51cGRhdGVEaXNwbGF5T25Qb3BTdGF0ZShzdGF0ZSwgZGF0YSk7XG5cbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBgL3NlYXJjaGA7XG4gICAgfVxufVxuXG5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKiogQ2FyZCBQYWdlICoqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbmlmICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3Vic3RyaW5nKDEsIDUpID09PSAnY2FyZCcpIHtcbiAgICBjYXJkVmlldy5pbnNlcnRNYW5hQ29zdFRvQ2FyZFRleHRUaXRsZSgpO1xuXG4gICAgY2FyZFZpZXcuaW5zZXJ0TWFuYUNvc3RUb09yYWNsZVRleHQoKTtcblxuICAgIGNhcmRWaWV3LnJlbW92ZVVuZGVyU2NvcmVGcm9tTGVnYWxTdGF0dXMoKTtcblxuICAgIGNhcmRWaWV3LmZpeENhcmRQcmljZXMoKTtcblxuICAgIGNhcmRWaWV3LnNldFByaW50TGlua0hyZWYoKTtcblxuICAgIGNhcmRWaWV3LnByaW50TGlzdEhvdmVyRXZlbnRzKCk7XG5cbiAgICAvLyBJZiB0aGUgdHJhbnNmb3JtIGJ0biBpcyBvbiB0aGUgZG9tIChpZiB0aGUgY2FyZCBpcyBkb3VibGUgc2lkZWQpIHNldFxuICAgIC8vIHRoZSBldmVudCBsaXN0ZW5lciBmb3IgdGhlIGNhcmQgdG8gYmUgZmxpcHBlZCBiYWNrIGFuZCBmb3J0aFxuICAgIGlmIChlbGVtZW50cy5jYXJkLnRyYW5zZm9ybUJ0bikge1xuICAgICAgICBlbGVtZW50cy5jYXJkLnRyYW5zZm9ybUJ0bi5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgJ2NsaWNrJywgY2FyZFZpZXcuZmxpcFRvQmFja1NpZGVcbiAgICAgICAgKTtcbiAgICB9XG59IiwiaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJztcblxuaW1wb3J0IHsgZWxlbWVudHMgfSBmcm9tICcuLi92aWV3cy9iYXNlJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2VhcmNoIHtcbiAgICBzZWFyY2hCeU5hbWUoKSB7XG4gICAgICAgIGxldCBjYXJkTmFtZSA9IGVsZW1lbnRzLmFwaVNlYXJjaC5jYXJkTmFtZS52YWx1ZTtcbiAgICAgICAgY2FyZE5hbWUgPSBjYXJkTmFtZS5yZXBsYWNlKCcgJywgJysnKTtcblxuICAgICAgICBpZiAoY2FyZE5hbWUpIHRoaXMuc2VhcmNoICs9IGNhcmROYW1lOyAgICAgICAgXG4gICAgfSAgXG4gICAgICBcbiAgICBzZWFyY2hCeU90ZXh0KCkge1xuICAgICAgICBjb25zdCBvcmFjbGVUZXh0ID0gZWxlbWVudHMuYXBpU2VhcmNoLm9yYWNsZVRleHQudmFsdWU7XG5cbiAgICAgICAgLy8gSWYgdGhlIG9yYWNsZSB0ZXh0IGluY2x1ZGVzIG1vcmUgdGhhbiBvbmUgd29yZCwgd2UgbmVlZCB0byBzZWFyY2ggdGhlIHRlcm1zIGluZGl2aWR1YWxseVxuICAgICAgICBpZiAob3JhY2xlVGV4dC5pbmNsdWRlcygnICcpICYmIG9yYWNsZVRleHQuaW5kZXhPZignICcpICE9PSBvcmFjbGVUZXh0Lmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgIGxldCB0ZW1wb3JhcnlTdHIgPSAnJztcbiAgICAgICAgICAgIGNvbnN0IHRleHRzID0gb3JhY2xlVGV4dC5zcGxpdCgnICcpO1xuXG4gICAgICAgICAgICB0ZXh0cy5mb3JFYWNoKHRleHQgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0ZXh0Lmxlbmd0aCA+IDApIHRlbXBvcmFyeVN0ciArPSBgb3JhY2xlJTNBJHt0ZXh0fStgXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5zZWFyY2ggKz0gYCslMjgke3RlbXBvcmFyeVN0ci5zbGljZSgwLCAtMSl9JTI5YFxuICAgICAgICB9XG5cbiAgICAgICAgZWxzZSBpZiAob3JhY2xlVGV4dCkgdGhpcy5zZWFyY2ggKz0gYCtvcmFjbGUlM0Eke29yYWNsZVRleHR9YDtcbiAgICB9XG4gICAgXG4gICAgc2VhcmNoQnlDYXJkVHlwZSgpIHtcbiAgICAgICAgY29uc3QgdHlwZXNUb0luY2x1ZGUgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWluY2x1ZGUtdHlwZV0nKSk7XG4gICAgICAgIGNvbnN0IHR5cGVzVG9FeGNsdWRlID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1leGNsdWRlLXR5cGVdJykpO1xuICAgICAgICBjb25zdCBpbmNsdWRlUGFydGlhbFR5cGVzID0gZWxlbWVudHMuYXBpU2VhcmNoLmluY2x1ZGVQYXJ0aWFsVHlwZXMuY2hlY2tlZDtcbiAgICAgICAgbGV0IHRlbXBvcmFyeVN0ciA9ICcnO1xuXG4gICAgICAgIGlmICh0eXBlc1RvSW5jbHVkZSAmJiAhaW5jbHVkZVBhcnRpYWxUeXBlcykge1xuICAgICAgICAgICAgdHlwZXNUb0luY2x1ZGUuZm9yRWFjaCh0eXBlID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlYXJjaCArPSBgK3R5cGUlM0Eke3R5cGUuZ2V0QXR0cmlidXRlKCdkYXRhLWluY2x1ZGUtdHlwZScpfWA7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCh0eXBlc1RvSW5jbHVkZS5sZW5ndGggPiAwKSAmJiBpbmNsdWRlUGFydGlhbFR5cGVzKSB7XG4gICAgICAgICAgICB0eXBlc1RvSW5jbHVkZS5mb3JFYWNoKHR5cGUgPT4ge1xuICAgICAgICAgICAgICAgIHRlbXBvcmFyeVN0ciArPSBgdHlwZSUzQSR7dHlwZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaW5jbHVkZS10eXBlJyl9K09SK2BcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIHRlbXBvcmFyeVN0ciA9IHRlbXBvcmFyeVN0ci5zbGljZSgwLCAtNCk7XG4gICAgICAgICAgICB0aGlzLnNlYXJjaCArPSBgKyUyOCR7dGVtcG9yYXJ5U3RyfSUyOWA7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZXNUb0V4Y2x1ZGUpIHtcbiAgICAgICAgICAgIHR5cGVzVG9FeGNsdWRlLmZvckVhY2godHlwZSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWFyY2ggKz0gYCstdHlwZSUzQSR7dHlwZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtZXhjbHVkZS10eXBlJyl9YDtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cblxuICAgIH1cbiAgICBcbiAgICBzZWFyY2hCeUNvbG9yKCkge1xuICAgICAgICBsZXQgYm94ZXMgPSBlbGVtZW50cy5hcGlTZWFyY2guY29sb3JCb3hlcztcbiAgICBcbiAgICAgICAgLy8gTG9vcCB0aHJvdWdoIGNoZWNrYm94ZXMgdG8gZ2V0IGFsbCBjb2xvcnMgZ2l2ZW5cbiAgICAgICAgdmFyIGNvbG9ycyA9ICcnO1xuICAgICAgICBib3hlcy5mb3JFYWNoKGJveCA9PiB7XG4gICAgICAgICAgICBpZihib3guY2hlY2tlZCkgY29sb3JzICs9IGJveC52YWx1ZTtcbiAgICAgICAgfSlcbiAgICBcbiAgICAgICAgY29uc3Qgc29ydEJ5ID0gZWxlbWVudHMuYXBpU2VhcmNoLmNvbG9yU29ydEJ5LnZhbHVlO1xuXG4gICAgICAgIGlmIChjb2xvcnMpIHRoaXMuc2VhcmNoICs9IGArY29sb3Ike3NvcnRCeX0ke2NvbG9yc31gO1xuICAgIH1cbiAgICBcbiAgICBzZWFyY2hCeVN0YXRzKCkge1xuICAgICAgICBjb25zdCBzdGF0TGluZXMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgICAnLmpzLS1hcGktc3RhdHMtd3JhcHBlcidcbiAgICAgICAgKSk7XG5cbiAgICAgICAgc3RhdExpbmVzLmZvckVhY2gobGluZSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzdGF0ID0gbGluZS5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1zdGF0JykudmFsdWU7XG4gICAgICAgICAgICBjb25zdCBzb3J0QnkgPSBsaW5lLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXN0YXQtZmlsdGVyJykudmFsdWU7XG4gICAgICAgICAgICBjb25zdCBzb3J0VmFsdWUgPSBsaW5lLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXN0YXQtdmFsdWUnKS52YWx1ZTtcblxuICAgICAgICAgICAgaWYgKHN0YXQgJiYgc29ydEJ5ICYmIHNvcnRWYWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VhcmNoICs9IGArJHtzdGF0fSR7c29ydEJ5fSR7c29ydFZhbHVlfWBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG4gICAgXG4gICAgc2VhcmNoQnlGb3JtYXQoKSB7XG4gICAgICAgIGNvbnN0IGxlZ2FsU3RhdHVzID0gZWxlbWVudHMuYXBpU2VhcmNoLmxlZ2FsU3RhdHVzLnZhbHVlO1xuICAgICAgICBjb25zdCBmb3JtYXQgPSBlbGVtZW50cy5hcGlTZWFyY2guZm9ybWF0LnZhbHVlO1xuIFxuICAgICAgICBpZiAoZm9ybWF0KSB0aGlzLnNlYXJjaCArPSBgKyR7bGVnYWxTdGF0dXN9JTNBJHtmb3JtYXR9YDtcbiAgICB9XG5cbiAgICBzZWFyY2hCeVNldCgpIHtcbiAgICAgICAgY29uc3Qgc2V0cyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtaW5jbHVkZS1zZXRdJykpO1xuICAgICAgICBsZXQgdGVtcG9yYXJ5U3RyID0gJyc7XG5cbiAgICAgICAgaWYgKHNldHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgc2V0cy5mb3JFYWNoKHMgPT4gdGVtcG9yYXJ5U3RyICs9IGBzZXQlM0Eke3MuZ2V0QXR0cmlidXRlKCdkYXRhLWluY2x1ZGUtc2V0Jyl9K09SK2ApO1xuXG4gICAgICAgICAgICB0ZW1wb3JhcnlTdHIgPSB0ZW1wb3JhcnlTdHIuc2xpY2UoMCwgLTQpO1xuICAgICAgICAgICAgdGhpcy5zZWFyY2ggKz0gYCslMjgke3RlbXBvcmFyeVN0cn0lMjlgO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHNlYXJjaEJ5UmFyaXR5KCkge1xuICAgICAgICBjb25zdCBib3hlcyA9IGVsZW1lbnRzLmFwaVNlYXJjaC5yYXJpdHlCb3hlcztcbiAgICAgICAgdmFyIHZhbHVlcyA9IFtdO1xuICAgICAgICBsZXQgdGVtcG9yYXJ5U3RyID0gJyc7XG4gICAgXG4gICAgICAgIC8vIFB1c2ggYWxsIHJhcml0aWVzIGdpdmVuIGJ5IHRoZSB1c2VyIGludG8gdGhlIHZhbHVlcyBhcnJheVxuICAgICAgICBib3hlcy5mb3JFYWNoKGJveCA9PiB7XG4gICAgICAgICAgICBpZiAoYm94LmNoZWNrZWQpIHZhbHVlcy5wdXNoKGJveC52YWx1ZSk7XG4gICAgICAgIH0pXG4gICAgXG4gICAgICAgIGlmICh2YWx1ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgLy8gV2UgbmVlZCBhIHN0YXJ0ZXIgc3RyaW5nIHNvIHdlIGNhbiBzbGljZSBpdCBsYXRlciAlMjggaXMgYW4gb3BlbiBwYXJlbnRoZXNlcyBcbiAgICAgICAgICAgIHRlbXBvcmFyeVN0ciArPSAnJTI4JztcbiAgICBcbiAgICAgICAgICAgIC8vIEZvciBldmVyeSB2YWx1ZSBnaXZlbiBieSB0aGUgdXNlciB3ZSBuZWVkIHRvIGFkZCB0aGUgK09SK1xuICAgICAgICAgICAgLy8gdG8gdGhlIGVuZCBmb3IgZ3JvdXBpbmcuIFdlIHdpbGwgcmVtb3ZlIHRoZSArT1IrIGZyb20gdGhlIGxhc3RcbiAgICAgICAgICAgIC8vIGl0ZXJhdGlvbiBvZiB0aGUgbG9vcFxuICAgICAgICAgICAgdmFsdWVzLmZvckVhY2godmFsdWUgPT4gdGVtcG9yYXJ5U3RyICs9IGByYXJpdHklM0Eke3ZhbHVlfStPUitgKTtcbiAgICBcbiAgICAgICAgICAgIC8vIFJlbW92ZSB0aGUgdW5uZWNlc3NhcnkgK09SKyBhdCB0aGUgZW5kXG4gICAgICAgICAgICB0ZW1wb3JhcnlTdHIgPSB0ZW1wb3JhcnlTdHIuc2xpY2UoMCwgLTQpO1xuICAgIFxuICAgICAgICAgICAgLy8gQ2xvc2UgdGhlIHBhcmVudGhlc2VzXG4gICAgICAgICAgICB0ZW1wb3JhcnlTdHIgKz0gYCUyOWA7XG5cbiAgICAgICAgICAgIHRoaXMuc2VhcmNoICs9IGArJHt0ZW1wb3JhcnlTdHJ9YDtcbiAgICAgICAgfSAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIHNlYXJjaEJ5Q29zdCgpIHtcbiAgICAgICAgY29uc3QgZGVub21pbmF0aW9uID0gZWxlbWVudHMuYXBpU2VhcmNoLmRlbm9taW5hdGlvbi52YWx1ZTtcbiAgICAgICAgY29uc3Qgc29ydEJ5ID0gZWxlbWVudHMuYXBpU2VhcmNoLmRlbm9taW5hdGlvblNvcnRCeS52YWx1ZTtcbiAgICAgICAgY29uc3QgaW5wdXRWYWwgPSBlbGVtZW50cy5hcGlTZWFyY2guZGVub21pbmF0aW9uU29ydFZhbHVlLnZhbHVlO1xuICAgICAgICBcbiAgICAgICAgaWYgKGlucHV0VmFsKSB0aGlzLnNlYXJjaCArPSBgKyR7ZGVub21pbmF0aW9ufSR7c29ydEJ5fSR7aW5wdXRWYWx9YDtcbiAgICB9XG5cbiAgICBzb3J0UmVzdWx0cygpIHtcbiAgICAgICAgY29uc3Qgc29ydEJ5ID0gZWxlbWVudHMuYXBpU2VhcmNoLmNhcmRTb3J0ZXIudmFsdWU7XG4gICAgICAgIHRoaXMuc2VhcmNoICs9IGAmb3JkZXI9JHtzb3J0Qnl9YFxuICAgIH1cblxuICAgIC8vIFRoaXMgbWV0aG9kIHdpbGwgcnVuIGVhY2ggb2YgdGhlIGluZGl2aWR1YWwgc2VhcmNoIG1ldGhvZHMgdG8gYnVpbGQgdGhlIGZpbmFsIHNlYXJjaCBxdWVyeVxuICAgIGJ1aWxkU2VhcmNoUXVlcnkoKSB7XG4gICAgICAgIHRoaXMuc2VhcmNoQnlOYW1lKCk7XG4gICAgICAgIHRoaXMuc2VhcmNoQnlPdGV4dCgpO1xuICAgICAgICB0aGlzLnNlYXJjaEJ5Q2FyZFR5cGUoKTtcbiAgICAgICAgdGhpcy5zZWFyY2hCeUNvbG9yKCk7XG4gICAgICAgIHRoaXMuc2VhcmNoQnlTdGF0cygpO1xuICAgICAgICB0aGlzLnNlYXJjaEJ5Rm9ybWF0KCk7XG4gICAgICAgIHRoaXMuc2VhcmNoQnlTZXQoKTtcbiAgICAgICAgdGhpcy5zZWFyY2hCeVJhcml0eSgpO1xuICAgICAgICB0aGlzLnNlYXJjaEJ5Q29zdCgpO1xuICAgICAgICB0aGlzLnNvcnRSZXN1bHRzKCk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuc2VhcmNoO1xuICAgIH0gXG5cbiAgICByZXNldFNlYXJjaFF1ZXJ5KCkge1xuICAgICAgICB0aGlzLnNlYXJjaCA9ICcnO1xuICAgIH1cblxuICAgIGRpc3BsYXlNZXRob2QoKSB7XG4gICAgICAgIHJldHVybiBlbGVtZW50cy5hcGlTZWFyY2guZGlzcGxheUFzLnZhbHVlO1xuICAgIH1cblxuICAgIC8vIFJldHVucyB0aGUgZmlyc3QgcGFnZSBvZiBjYXJkc1xuICAgIGFzeW5jIGdldENhcmRzKHN0YXRlKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBheGlvcy5nZXQoYGh0dHBzOi8vYXBpLnNjcnlmYWxsLmNvbS9jYXJkcy9zZWFyY2g/cT0ke3N0YXRlLnF1ZXJ5fWApXG4gICAgICAgICAgICAudGhlbihyZXMgPT4ge1xuICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgc2VhcmNoXG4gICAgICAgICAgICAgICAgdGhpcy5yZXN1bHRzID0gcmVzLmRhdGE7XG4gICAgICAgICAgICAgICAgdGhpcy5jYXJkcyA9IHJlcy5kYXRhLmRhdGE7XG5cbiAgICAgICAgICAgICAgICAvLyBTdG9yZSB0aGUgY2FyZHMgaW4gdGhlIGFsbENhcmRzIGFycmF5XG4gICAgICAgICAgICAgICAgc3RhdGUuYWxsQ2FyZHMucHVzaChyZXMuZGF0YS5kYXRhKVxuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyLnJlc3BvbnNlLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLmFsbENhcmRzLnB1c2goNDA0KTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KVxuICAgIH1cblxuICAgIC8vIFVzZWQgYnkgZ2V0QWxsQ2FyZHMgdG8gZ2V0IGVhY2ggYXJyYXkgb2YgMTc1IGNhcmRzXG4gICAgYXN5bmMgbG9vcE5leHRQYWdlKHN0YXRlLCBlbmFibGVCdG4pIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGF4aW9zLmdldCh0aGlzLnJlc3VsdHMubmV4dF9wYWdlKVxuICAgICAgICAgICAgLnRoZW4ocmVzID0+IHtcbiAgICAgICAgICAgICAgICAvLyBVcGRhdGUgdGhlIHJlc3VsdHMgb2JqZWN0XG4gICAgICAgICAgICAgICAgdGhpcy5yZXN1bHRzID0gcmVzLmRhdGFcblxuICAgICAgICAgICAgICAgIC8vIFB1c2ggdGhlIGNhcmRzIGZyb20gdGhpcyByZXN1bHQgaW50byB0aGUgYWxsQ2FyZHMgYXJyYXlcbiAgICAgICAgICAgICAgICBzdGF0ZS5hbGxDYXJkcy5wdXNoKHJlcy5kYXRhLmRhdGEpO1xuXG4gICAgICAgICAgICAgICAgLy8gRW5hYmxlIHRoZSBuZXh0IHBhZ2UgYnRuIGFuZCByZXNvbHZlIHRoZSBwcm9taXNlXG4gICAgICAgICAgICAgICAgZW5hYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLm5leHRQYWdlQnRuKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIC8vIFdpbGwgcnVuIGluIHRoZSBiYWNrZ3JvdW5kIGFmdGVyIHRoZSBmaXJzdCBzZXQgb2YgY2FyZHMgaXMgcmV0cmlldmVkIHRvIG1ha2UgbW92aW5nIGJldHdlZW4gcmVzdWx0c1xuICAgIC8vIHBhZ2VzIGZhc3RlclxuICAgIGFzeW5jIGdldEFsbENhcmRzKHN0YXRlLCBlbmFibGVCdG4pIHtcbiAgICAgICAgLy8gQXMgbG9uZyBhcyB0aGVyZSBpcyBhIG5leHRfcGFnZSBrZWVwIGxvYWRpbmcgdGhlIGNhcmRzXG4gICAgICAgIHdoaWxlICh0aGlzLnJlc3VsdHMubmV4dF9wYWdlKSBhd2FpdCB0aGlzLmxvb3BOZXh0UGFnZShzdGF0ZSwgZW5hYmxlQnRuKVxuXG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgc3RhdGUgb25jZSBhbGwgY2FyZHMgaGF2ZSBiZWVuIHJldHJlaWV2ZWRcbiAgICAgICAgc3RhdGUuYWxsUmVzdWx0c0xvYWRlZCA9IHRydWU7XG5cbiAgICAgICAgLy8gSWYgdGhlcmUgaXMgYXQgbGVhc3QgMiBwYWdlcyBvZiBjYXJkcywgZW5hYmxlIHRoZSBsYXN0IHBhZ2UgYnRuLlxuICAgICAgICBpZiAoc3RhdGUuYWxsQ2FyZHMubGVuZ3RoID4gMSkgZW5hYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLmxhc3RQYWdlQnRuKTtcbiAgICB9XG59IiwiZXhwb3J0IGNvbnN0IGVsZW1lbnRzID0ge1xuICAgIGFwaVNlYXJjaDoge1xuICAgICAgICBjYXJkTmFtZTogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktY2FyZC1uYW1lJyksXG4gICAgICAgIG9yYWNsZVRleHQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLW8tdGV4dCcpLFxuICAgICAgICB0eXBlTGluZTogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktdHlwZS1saW5lJyksXG4gICAgICAgIHNlbGVjdGVkVHlwZXM6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXNlbGVjdGVkLXR5cGVzJyksXG4gICAgICAgIGluY2x1ZGVQYXJ0aWFsVHlwZXM6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXR5cGUtYm94JyksXG4gICAgICAgIHR5cGVEcm9wRG93bjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktdHlwZXMtZHJvcGRvd24nKSxcbiAgICAgICAgY29sb3JCb3hlczogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1hcGktY29sb3ItYm94JyksXG4gICAgICAgIGNvbG9yU29ydEJ5OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1jb2xvci1zb3J0ZXInKSxcbiAgICAgICAgc3RhdDpkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1zdGF0JyksXG4gICAgICAgIHN0YXRGaWx0ZXI6ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktc3RhdC1maWx0ZXInKSxcbiAgICAgICAgc3RhdFZhbHVlOmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXN0YXQtdmFsdWUnKSxcbiAgICAgICAgbGVnYWxTdGF0dXM6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLWxlZ2FsLXN0YXR1cycpLFxuICAgICAgICBmb3JtYXQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLWZvcm1hdCcpLFxuICAgICAgICBzZXRJbnB1dDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktc2V0JyksXG4gICAgICAgIHNldERyb3BEb3duOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1zZXQtZHJvcGRvd24nKSxcbiAgICAgICAgc2VsZWN0ZWRTZXRzOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1zZWxlY3RlZC1zZXRzJyksXG4gICAgICAgIGJsb2NrOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1ibG9jaycpLFxuICAgICAgICByYXJpdHlCb3hlczogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1hcGktcmFyaXR5LWJveCcpLFxuICAgICAgICBkZW5vbWluYXRpb246IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLWRlbm9taW5hdGlvbicpLFxuICAgICAgICBkZW5vbWluYXRpb25Tb3J0Qnk6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLWRlbm9taW5hdGlvbi1zb3J0LWJ5JyksXG4gICAgICAgIGRlbm9taW5hdGlvblNvcnRWYWx1ZTogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktZGVub21pbmF0aW9uLXNvcnQtdmFsdWUnKSxcbiAgICAgICAgY2FyZFNvcnRlcjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktcmVzdWx0cy1zb3J0ZXInKSxcbiAgICAgICAgZGlzcGxheUFzOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1zZWFyY2gtZGlzcGxheS1zZWxlY3RvcicpLFxuICAgICAgICBzdWJtaXRCdG46IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLWJ0bicpLFxuICAgIH0sXG4gICAgcmVzdWx0c1BhZ2U6IHtcbiAgICAgICAgcmVzdWx0c0NvbnRhaW5lcjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktcmVzdWx0cy1kaXNwbGF5JyksXG4gICAgICAgIGRpc3BsYXlTZWxlY3RvcjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1yZXN1bHRzLWRpc3BsYXktb3B0aW9uJyksXG4gICAgICAgIHNvcnRCeTogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1yZXN1bHRzLXNvcnQtb3B0aW9ucycpLFxuICAgICAgICBidG46IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tcmVzdWx0cy1zdWJtaXQtYnRuJyksXG4gICAgICAgIGNhcmRDaGVja2xpc3Q6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tY2FyZC1jaGVja2xpc3QnKSxcbiAgICAgICAgaW1hZ2VHcmlkOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWltYWdlLWdyaWQnKSxcbiAgICAgICAgZGlzcGxheUJhcjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktZGlzcGxheS1iYXInKSxcbiAgICAgICAgZmlyc3RQYWdlQnRuOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1maXJzdC1wYWdlJyksXG4gICAgICAgIHByZXZpb3VzUGFnZUJ0bjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktcHJldmlvdXMtcGFnZScpLFxuICAgICAgICBuZXh0UGFnZUJ0bjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktbmV4dC1wYWdlJyksXG4gICAgICAgIGxhc3RQYWdlQnRuOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1sYXN0LXBhZ2UnKVxuICAgIH0sXG4gICAgY2FyZDoge1xuICAgICAgICBtYW5hQ29zdFRpdGxlU3BhbjogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1jYXJkLW1hbmEtY29zdCcpLFxuICAgICAgICBvcmFjbGVUZXh0czogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1vcmFjbGUtdGV4dC1saW5lJyksXG4gICAgICAgIGxlZ2FsaXRpZXM6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tY2FyZC1sZWdhbGl0eScpLFxuICAgICAgICBwcmludFJvd3M6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tY2FyZC1wcmludC1yb3cnKSxcbiAgICAgICAgcHJpY2VzOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWNhcmQtcHJpY2UnKSxcbiAgICAgICAgY2FyZFByaW50TGlua3M6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tY2FyZC1wcmludC1saW5rJyksXG4gICAgICAgIGZyb250OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWZyb250JyksXG4gICAgICAgIGJhY2s6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYmFjaycpLFxuICAgICAgICB0cmFuc2Zvcm1CdG46IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tY2FyZC10cmFuc2Zvcm0nKSxcbiAgICB9XG59OyIsImltcG9ydCB7IGdlbmVyYXRlTWFuYUNvc3RJbWFnZXMgfSBmcm9tICcuL3Jlc3VsdHNWaWV3JztcbmltcG9ydCB7IGVsZW1lbnRzIH0gZnJvbSAnLi9iYXNlJztcblxuZXhwb3J0IGNvbnN0IGluc2VydE1hbmFDb3N0VG9DYXJkVGV4dFRpdGxlID0gKCkgPT4ge1xuICAgIGNvbnN0IG1hbmFDb3N0cyA9IEFycmF5LmZyb20oZWxlbWVudHMuY2FyZC5tYW5hQ29zdFRpdGxlU3Bhbik7ICAgIFxuXG4gICAgbWFuYUNvc3RzLmZvckVhY2goY29zdCA9PiB7XG4gICAgICAgIGNvc3QuaW5uZXJIVE1MID0gZ2VuZXJhdGVNYW5hQ29zdEltYWdlcyhcbiAgICAgICAgICAgIGNvc3QuZ2V0QXR0cmlidXRlKCdkYXRhLW1hbmEtY29zdCcpXG4gICAgICAgICk7XG4gICAgfSlcbn07XG5cblxuZXhwb3J0IGNvbnN0IGluc2VydE1hbmFDb3N0VG9PcmFjbGVUZXh0ID0gKCkgPT4ge1xuICAgIGNvbnN0IG9yYWNsZVRleHRzID0gQXJyYXkuZnJvbShlbGVtZW50cy5jYXJkLm9yYWNsZVRleHRzKTtcblxuICAgIGlmIChvcmFjbGVUZXh0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIG9yYWNsZVRleHRzLmZvckVhY2godGV4dCA9PiB0ZXh0LmlubmVySFRNTCA9IGdlbmVyYXRlTWFuYUNvc3RJbWFnZXMoXG4gICAgICAgICAgICB0ZXh0LmlubmVySFRNTCwgJ3hzJ1xuICAgICAgICApKTtcbiAgICB9ICAgIFxufTtcblxuXG5leHBvcnQgY29uc3QgcmVtb3ZlVW5kZXJTY29yZUZyb21MZWdhbFN0YXR1cyA9ICgpID0+IHtcbiAgICBjb25zdCBsZWdhbGl0aWVzID0gQXJyYXkuZnJvbShlbGVtZW50cy5jYXJkLmxlZ2FsaXRpZXMpO1xuXG4gICAgbGVnYWxpdGllcy5mb3JFYWNoKGxlZ2FsaXR5ID0+IHtcbiAgICAgICAgaWYgKGxlZ2FsaXR5LmlubmVySFRNTC5pbmNsdWRlcygnXycpKSB7XG4gICAgICAgICAgICBsZWdhbGl0eS5pbm5lckhUTUwgPSBsZWdhbGl0eS5pbm5lckhUTUwucmVwbGFjZSgnXycsICcgJyk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cblxuZXhwb3J0IGNvbnN0IGZpeENhcmRQcmljZXMgPSAoKSA9PiB7XG4gICAgY29uc3QgcHJpY2VzID0gQXJyYXkuZnJvbShlbGVtZW50cy5jYXJkLnByaWNlcyk7XG5cbiAgICBwcmljZXMuZm9yRWFjaChwcmljZSA9PiB7XG4gICAgICAgIGlmIChwcmljZS5pbm5lckhUTUwuaW5jbHVkZXMoJ05vbmUnKSkgcHJpY2UuaW5uZXJIVE1MID0gJy0nXG4gICAgfSk7XG59O1xuXG5cbmNvbnN0IGZpeERvdWJsZVNpZGVkQ2FyZE5hbWUgPSBjYXJkTmFtZSA9PiB7XG4gICAgaWYgKGNhcmROYW1lLmluY2x1ZGVzKCcvJykpIHtcbiAgICAgICAgY2FyZE5hbWUgPSBjYXJkTmFtZS5zdWJzdHJpbmcoMCwgY2FyZE5hbWUuaW5kZXhPZignLycpIC0gMSlcbiAgICB9XG4gICAgcmV0dXJuIGNhcmROYW1lOyAgICBcbn1cblxuXG5leHBvcnQgY29uc3Qgc2V0UHJpbnRMaW5rSHJlZiA9ICgpID0+IHtcbiAgICBjb25zdCBsaW5rcyA9IEFycmF5LmZyb20oZWxlbWVudHMuY2FyZC5jYXJkUHJpbnRMaW5rcyk7XG5cbiAgICBsaW5rcy5mb3JFYWNoKGxpbmsgPT4ge1xuICAgICAgICBsZXQgY2FyZE5hbWUgPSBsaW5rLmdldEF0dHJpYnV0ZSgnZGF0YS1uYW1lJykucmVwbGFjZUFsbCgnICcsICctJyk7XG4gICAgICAgIGNhcmROYW1lID0gZml4RG91YmxlU2lkZWRDYXJkTmFtZShjYXJkTmFtZSk7XG4gICAgICAgIGNvbnN0IHNldENvZGUgPSBsaW5rLmdldEF0dHJpYnV0ZSgnZGF0YS1zZXQnKTtcblxuICAgICAgICBsaW5rLmhyZWYgPSBgL2NhcmQvJHtzZXRDb2RlfS8ke2NhcmROYW1lfWBcbiAgICB9KTtcbn07XG5cblxuY29uc3Qgc2V0RG91YmxlU2lkZWRUcmFuc2l0aW9uID0gKCkgPT4ge1xuICAgIC8vIENoZWNrcyB0byBzZWUgaWYgYW4gaW5saW5lIHN0eWxlIGhhcyBiZWVuIHNldCBmb3IgdGhlIGZyb250IG9mIHRoZSBjYXJkLlxuICAgIC8vIElmIG5vdCwgc2V0IGEgdHJhbnNpdG9uLiBUaGlzIG1ha2VzIHN1cmUgd2UgZG9uJ3Qgc2V0IHRoZSB0cmFuc2l0b24gZXZlcnlcbiAgICAvLyB0aW1lIHRoZSBjYXJkIGlzIGZsaXBwZWQuXG4gICAgaWYgKCFlbGVtZW50cy5jYXJkLmZyb250LmdldEF0dHJpYnV0ZSgnc3R5bGUnKSkge1xuICAgICAgICBlbGVtZW50cy5jYXJkLmZyb250LnN0eWxlLnRyYW5zaXRpb24gPSBgYWxsIC44cyBlYXNlYDtcbiAgICAgICAgZWxlbWVudHMuY2FyZC5iYWNrLnN0eWxlLnRyYW5zaXRpb24gPSBgYWxsIC44cyBlYXNlYDtcbiAgICB9XG59O1xuXG5cbmV4cG9ydCBjb25zdCBmbGlwVG9CYWNrU2lkZSA9ICgpID0+IHtcbiAgICAvLyBTZXRzIHRoZSB0cmFuc2l0aW9uIHByb3BlcnR5IG9uIGJvdGggc2lkZXMgb2YgdGhlIGNhcmQgdGhlIGZpcnN0IHRpbWUgdGhlXG4gICAgLy8gdHJhbnNmb3JtIGJ1dHRvbiBpcyBjbGlja2VkXG4gICAgc2V0RG91YmxlU2lkZWRUcmFuc2l0aW9uKCk7XG5cbiAgICAvLyBSb3RhdGVzIHRoZSBjYXJkIHRvIHNob3cgdGhlIGJhY2tzaWRlLlxuICAgIGVsZW1lbnRzLmNhcmQuZnJvbnQuc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZVkoLTE4MGRlZylgO1xuICAgIGVsZW1lbnRzLmNhcmQuYmFjay5zdHlsZS50cmFuc2Zvcm0gPSBgcm90YXRlWSgwKWA7XG5cbiAgICAvLyBSZXNldCB0aGUgZXZlbnQgbGlzdGVuZXIgc28gdGhhdCBvbiBjbGlja2luZyB0aGUgYnV0dG9uIGl0IHdpbGwgZmxpcFxuICAgIC8vIGJhY2sgdG8gdGhlIGZyb250IG9mIHRoZSBjYXJkXG4gICAgZWxlbWVudHMuY2FyZC50cmFuc2Zvcm1CdG4ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmbGlwVG9CYWNrU2lkZSk7XG4gICAgZWxlbWVudHMuY2FyZC50cmFuc2Zvcm1CdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmbGlwVG9Gcm9udFNpZGUpO1xufTtcblxuXG5leHBvcnQgY29uc3QgZmxpcFRvRnJvbnRTaWRlID0gKCkgPT4ge1xuICAgIGVsZW1lbnRzLmNhcmQuZnJvbnQuc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZVkoMClgO1xuICAgIGVsZW1lbnRzLmNhcmQuYmFjay5zdHlsZS50cmFuc2Zvcm0gPSBgcm90YXRlWSgxODBkZWcpYDtcblxuICAgIC8vIFJlc2V0IHRoZSBldmVudCBsaXN0ZW5lciBzbyB0aGF0IG9uIGNsaWNraW5nIHRoZSBidXR0b24gaXQgd2lsbCBmbGlwXG4gICAgLy8gdG8gdGhlIGJhY2tzaWRlIG9mIHRoZSBjYXJkXG4gICAgZWxlbWVudHMuY2FyZC50cmFuc2Zvcm1CdG4ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmbGlwVG9Gcm9udFNpZGUpO1xuICAgIGVsZW1lbnRzLmNhcmQudHJhbnNmb3JtQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZmxpcFRvQmFja1NpZGUpO1xufVxuXG5cbi8vIENyZWF0ZSB0aGUgaG92ZXIgZWZmZWN0IG9uIGVhY2ggcm93IHRoYXQgZGlzcGxheXMgdGhlIGltYWdlIG9mIHRoZSBjYXJkXG5leHBvcnQgY29uc3QgcHJpbnRMaXN0SG92ZXJFdmVudHMgPSAoKSA9PiB7XG4gICAgLy8gR2V0IHRoZSBIVE1MIGZvciBlYWNoIHRhYmxlIHJvd1xuICAgIGNvbnN0IHByaW50cyA9IEFycmF5LmZyb20oZWxlbWVudHMuY2FyZC5wcmludFJvd3MpO1xuIFxuICAgIHByaW50cy5mb3JFYWNoKHByaW50ID0+IHtcbiAgICAgICAgcHJpbnQub25tb3VzZW1vdmUgPSBlID0+IHtcbiAgICAgICAgICAgIC8vIElmIHRoZSB3aW5kb3cgaXMgc21hbGxlciB0aGFuIDc2OCBwaXhlbHMsIGRvbid0IGRpc3BsYXkgYW55IGltYWdlc1xuICAgICAgICAgICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoIDwgNzY4KSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgICAgIC8vIElmIHRoZXJlIGlzIGFscmVhZHkgYW4gaW1hZ2UgYmVpbmcgZGlzcGxheWVkLCByZW1vdmUgaXQgZnJvbSB0aGUgRE9NXG4gICAgICAgICAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRvb2x0aXAnKSkge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRvb2x0aXAnKSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBQcmVwIHRoZSBkaXYuXG4gICAgICAgICAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIGRpdi5jbGFzc05hbWUgPSAndG9vbHRpcCc7XG5cbiAgICAgICAgICAgIC8vIFRoZSBkaXYgaXMgc3R5bGVkIHdpdGggcG9zaXRpb24gYWJzb2x1dGUuIFRoaXMgY29kZSBwdXRzIGl0IGp1c3QgdG8gdGhlIHJpZ2h0IG9mIHRoZSBjdXJzb3JcbiAgICAgICAgICAgIGRpdi5zdHlsZS5sZWZ0ID0gZS5wYWdlWCArIDUwICsgJ3B4JztcbiAgICAgICAgICAgIGRpdi5zdHlsZS50b3AgPSBlLnBhZ2VZIC0gMzAgKyAncHgnO1xuXG4gICAgICAgICAgICAvLyBQcmVwIHRoZSBpbWcgZWxlbWVudFxuICAgICAgICAgICAgY29uc3QgaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG4gICAgICAgICAgICBpbWcuY2xhc3NOYW1lID0gJ3Rvb2x0aXBfX2ltZyc7XG4gICAgICAgICAgICBpbWcuc3JjID0gcHJpbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWNhcmRJbWcnKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gUHV0IHRoZSBpbWcgaW50byB0aGUgZGl2IGFuZCB0aGVuIGFwcGVuZCB0aGUgZGl2IGRpcmVjdGx5IHRvIHRoZSBib2R5IG9mIHRoZSBkb2N1bWVudC5cbiAgICAgICAgICAgIGRpdi5hcHBlbmRDaGlsZChpbWcpOyBcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZGl2KTsgIFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAvLyBSZW1vdmUgdGhlIGltZyB3aGVuIHRha2luZyB0aGUgY3Vyc29yIG9mZiB0aGUgcHJpbnRcbiAgICAgICAgcHJpbnQub25tb3VzZW91dCA9IGUgPT4ge1xuICAgICAgICAgICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50b29sdGlwJykpIHtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50b29sdGlwJykpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcbiAgICB9KTtcbn07XG5cbiIsImltcG9ydCB7IGVsZW1lbnRzIH0gZnJvbSAnLi9iYXNlJztcblxuY29uc3QgY2xlYXJDaGVja2xpc3QgPSAoKSA9PiB7XG4gICAgY29uc3QgY2hlY2tMaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1jYXJkLWNoZWNrbGlzdCcpXG4gICAgaWYgKGNoZWNrTGlzdCkge1xuICAgICAgICBjaGVja0xpc3QucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChjaGVja0xpc3QpO1xuXG4gICAgICAgIC8vIFJlbW92ZSBhbnkgdG9vbCB0aXAgaW1hZ2VzIGlmIHVzZXIgd2FzIGhvdmVyaW5nXG4gICAgICAgIGNvbnN0IHRvb2xUaXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudG9vbHRpcCcpXG4gICAgICAgIGlmICh0b29sVGlwKSBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKHRvb2xUaXApO1xuICAgIH1cbn07XG5cblxuY29uc3QgY2xlYXJJbWFnZUdyaWQgPSAoKSA9PiB7XG4gICAgY29uc3QgZ3JpZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taW1hZ2UtZ3JpZCcpXG4gICAgaWYgKGdyaWQpIGdyaWQucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChncmlkKTtcbn07XG5cblxuY29uc3QgY2xlYXJSZXN1bHRzID0gKCkgPT4ge1xuICAgIGNsZWFyQ2hlY2tsaXN0KCk7XG4gICAgY2xlYXJJbWFnZUdyaWQoKTsgICBcbn1cblxuXG5jb25zdCBwcmVwSW1hZ2VDb250YWluZXIgPSAoKSA9PiB7XG4gICAgY29uc3QgbWFya3VwID0gYFxuICAgICAgICA8ZGl2IGNsYXNzPVwiaW1hZ2UtZ3JpZCBqcy0taW1hZ2UtZ3JpZFwiPjwvZGl2PlxuICAgIGBcbiAgICBlbGVtZW50cy5yZXN1bHRzUGFnZS5yZXN1bHRzQ29udGFpbmVyLmluc2VydEFkamFjZW50SFRNTCgnYmVmb3JlZW5kJywgbWFya3VwKTtcbn07XG5cblxuY29uc3QgZ2VuZXJhdGVTaW5nbGVTaWRlZENhcmQgPSBjYXJkID0+IHtcbiAgICBjb25zdCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGNvbnN0IGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuXG4gICAgYS5jbGFzc0xpc3QgPSBgaW1hZ2UtZ3JpZF9fbGluayBqcy0taW1hZ2UtZ3JpZC1saW5rYDtcbiAgICBhLmhyZWYgPSBgL2NhcmQvJHtjYXJkLnNldH0vJHtwYXJzZUNhcmROYW1lKGNhcmQubmFtZSl9YDtcblxuICAgIGRpdi5jbGFzc0xpc3QgPSBgaW1hZ2UtZ3JpZF9fY29udGFpbmVyYDtcbiAgICBpbWcuc3JjID0gYCR7Y2FyZC5pbWFnZV91cmlzLm5vcm1hbH1gO1xuICAgIGltZy5hbHQgPSBgJHtjYXJkLm5hbWV9YFxuICAgIGltZy5jbGFzc0xpc3QgPSBgaW1hZ2UtZ3JpZF9faW1hZ2VgO1xuICAgIGRpdi5hcHBlbmRDaGlsZChpbWcpO1xuICAgIGEuYXBwZW5kQ2hpbGQoZGl2KTtcblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taW1hZ2UtZ3JpZCcpLmluc2VydEFkamFjZW50RWxlbWVudCgnYmVmb3JlZW5kJywgYSk7XG59XG5cblxuY29uc3Qgc2hvd0JhY2tTaWRlID0gY2FyZCA9PiB7XG4gICAgY29uc3QgZnJvbnQgPSBjYXJkLnF1ZXJ5U2VsZWN0b3IoJy5qcy0taW1hZ2UtZ3JpZC1jYXJkLXNpZGUtZnJvbnQnKTtcbiAgICBjb25zdCBiYWNrID0gY2FyZC5xdWVyeVNlbGVjdG9yKCcuanMtLWltYWdlLWdyaWQtY2FyZC1zaWRlLWJhY2snKTsgICAgXG4gICAgXG4gICAgZnJvbnQuc3R5bGUudHJhbnNmb3JtID0gJ3JvdGF0ZVkoLTE4MGRlZyknO1xuICAgIGJhY2suc3R5bGUudHJhbnNmb3JtID0gJ3JvdGF0ZVkoMCknO1xuXG4gICAgZnJvbnQuY2xhc3NMaXN0LnJlbW92ZSgnanMtLXNob3dpbmcnKTtcbiAgICBiYWNrLmNsYXNzTGlzdC5hZGQoJ2pzLS1zaG93aW5nJyk7XG59XG5cblxuY29uc3Qgc2hvd0Zyb250U2lkZSA9IGNhcmQgPT4ge1xuICAgIGNvbnN0IGZyb250ID0gY2FyZC5xdWVyeVNlbGVjdG9yKCcuanMtLWltYWdlLWdyaWQtY2FyZC1zaWRlLWZyb250Jyk7XG4gICAgY29uc3QgYmFjayA9IGNhcmQucXVlcnlTZWxlY3RvcignLmpzLS1pbWFnZS1ncmlkLWNhcmQtc2lkZS1iYWNrJyk7XG5cbiAgICBmcm9udC5zdHlsZS50cmFuc2Zvcm0gPSAncm90YXRlWSgwKSc7XG4gICAgYmFjay5zdHlsZS50cmFuc2Zvcm0gPSAncm90YXRlWSgxODBkZWcpJztcblxuICAgIGZyb250LmNsYXNzTGlzdC5hZGQoJ2pzLS1zaG93aW5nJyk7XG4gICAgYmFjay5jbGFzc0xpc3QucmVtb3ZlKCdqcy0tc2hvd2luZycpO1xufVxuXG5cbmNvbnN0IGZsaXBDYXJkID0gZSA9PiB7XG4gICAgLy8gUHJldmVudCB0aGUgbGluayBmcm9tIGdvaW5nIHRvIHRoZSBjYXJkIHNwZWNpZmljIHBhZ2VcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgY29uc3QgY2FyZCA9IGUudGFyZ2V0LnBhcmVudEVsZW1lbnQ7XG5cbiAgICBjb25zdCBmcm9udCA9IGNhcmQucXVlcnlTZWxlY3RvcignLmpzLS1pbWFnZS1ncmlkLWNhcmQtc2lkZS1mcm9udCcpO1xuXG4gICAgLy8gSWYgdGhlIGZyb250IGlzIHNob3dpbmcsIGRpc3BsYXkgdGhlIGJhY2tzaWRlLiBPdGhlcndpc2UsIGRpc3BsYXkgdGhlIGZyb250XG4gICAgaWYgKGZyb250LmNsYXNzTGlzdC5jb250YWlucygnanMtLXNob3dpbmcnKSkgc2hvd0JhY2tTaWRlKGNhcmQpO1xuICAgIGVsc2Ugc2hvd0Zyb250U2lkZShjYXJkKTtcbn1cblxuXG5jb25zdCBnZW5lcmF0ZUZsaXBDYXJkQnRuID0gKCkgPT4ge1xuICAgIGNvbnN0IGJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgIGJ0bi5jbGFzc0xpc3QgPSAnaW1hZ2UtZ3JpZF9fZG91YmxlLWJ0biBqcy0taW1hZ2UtZ3JpZC1mbGlwLWNhcmQtYnRuJztcbiAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IGZsaXBDYXJkKGUpKVxuXG4gICAgcmV0dXJuIGJ0bjtcbn1cblxuXG5jb25zdCBnZW5lcmF0ZURvdWJsZVNpZGVkQ2FyZCA9IGNhcmQgPT4ge1xuICAgIGNvbnN0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgY29uc3Qgb3V0ZXJEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBjb25zdCBpbm5lckRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGNvbnN0IGltZ0Zyb250U2lkZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuICAgIGNvbnN0IGltZ0JhY2tTaWRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG4gICAgY29uc3QgZmxpcENhcmRCdG4gPSBnZW5lcmF0ZUZsaXBDYXJkQnRuKCk7XG5cbiAgICBhLmNsYXNzTGlzdCA9IGBpbWFnZS1ncmlkX19saW5rIGpzLS1pbWFnZS1ncmlkLWxpbmtgO1xuICAgIGEuaHJlZiA9IGAvY2FyZC8ke2NhcmQuc2V0fS8ke3BhcnNlQ2FyZE5hbWUoY2FyZC5uYW1lKX1gO1xuXG4gICAgb3V0ZXJEaXYuY2xhc3NMaXN0ID0gYGltYWdlLWdyaWRfX291dGVyLWRpdmA7XG4gICAgaW5uZXJEaXYuY2xhc3NMaXN0ID0gYGltYWdlLWdyaWRfX2lubmVyLWRpdiBqcy0taW5uZXItZGl2LSR7Y2FyZC5uYW1lfWA7XG5cbiAgICBpbWdGcm9udFNpZGUuY2xhc3NMaXN0ID0gYGltYWdlLWdyaWRfX2RvdWJsZSBpbWFnZS1ncmlkX19kb3VibGUtLWZyb250IGpzLS1pbWFnZS1ncmlkLWNhcmQtc2lkZS1mcm9udCBqcy0tc2hvd2luZ2A7XG4gICAgaW1nRnJvbnRTaWRlLnNyYyA9IGNhcmQuY2FyZF9mYWNlc1swXS5pbWFnZV91cmlzLm5vcm1hbDtcbiAgICBpbWdGcm9udFNpZGUuYWx0ID0gY2FyZC5uYW1lO1xuXG4gICAgaW1nQmFja1NpZGUuY2xhc3NMaXN0ID0gYGltYWdlLWdyaWRfX2RvdWJsZSBpbWFnZS1ncmlkX19kb3VibGUtLWJhY2sganMtLWltYWdlLWdyaWQtY2FyZC1zaWRlLWJhY2tgO1xuICAgIGltZ0JhY2tTaWRlLnNyYyA9IGNhcmQuY2FyZF9mYWNlc1sxXS5pbWFnZV91cmlzLm5vcm1hbDtcbiAgICBpbWdCYWNrU2lkZS5hbHQgPSBjYXJkLmNhcmRfZmFjZXNbMV0ubmFtZTtcblxuICAgIGEuYXBwZW5kQ2hpbGQob3V0ZXJEaXYpO1xuICAgIG91dGVyRGl2LmFwcGVuZENoaWxkKGlubmVyRGl2KTtcbiAgICBpbm5lckRpdi5hcHBlbmRDaGlsZChpbWdCYWNrU2lkZSk7XG4gICAgaW5uZXJEaXYuYXBwZW5kQ2hpbGQoaW1nRnJvbnRTaWRlKTtcbiAgICBpbm5lckRpdi5hcHBlbmRDaGlsZChmbGlwQ2FyZEJ0bik7XG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWltYWdlLWdyaWQnKS5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2JlZm9yZWVuZCcsIGEpO1xufVxuXG5cbmNvbnN0IGdlbmVyYXRlSW1hZ2VHcmlkID0gY2FyZHMgPT4ge1xuICAgIGNhcmRzLmZvckVhY2goY2FyZCA9PiB7XG4gICAgICAgIC8vIEZvciBzaW5nbGUgc2lkZWQgY2FyZHNcbiAgICAgICAgaWYgKGNhcmQuaW1hZ2VfdXJpcykgZ2VuZXJhdGVTaW5nbGVTaWRlZENhcmQoY2FyZCk7XG5cbiAgICAgICAgLy8gRG91YmxlIHNpZGVkIGNhcmRzXG4gICAgICAgIGVsc2UgZ2VuZXJhdGVEb3VibGVTaWRlZENhcmQoY2FyZCk7ICAgICAgIFxuICAgIH0pXG59XG5cblxuLy8gRnVuY2l0b24gdG8gYmUgdXNlZCBpbiBpbmRleC5qcy4gVGFrZXMgY2FyZSBvZiBhbGwgbmVjZXNzYXJ5IHN0ZXBzIHRvIGRpc3BsYXkgY2FyZHMgYXMgYSBpbWFnZXNcbmV4cG9ydCBjb25zdCBkaXNwYWx5SW1hZ2VzID0gY2FyZHMgPT4ge1xuICAgIGNsZWFyUmVzdWx0cygpO1xuICAgIHByZXBJbWFnZUNvbnRhaW5lcigpO1xuICAgIGdlbmVyYXRlSW1hZ2VHcmlkKGNhcmRzKTtcbn1cblxuIFxuY29uc3QgcHJlcENoZWNrbGlzdENvbnRhaW5lciA9ICgpID0+IHtcbiAgICBjb25zdCBtYXJrdXAgPSBgXG4gICAgICAgIDx0YWJsZSBjbGFzcz1cImNhcmQtY2hlY2tsaXN0IGpzLS1jYXJkLWNoZWNrbGlzdFwiPlxuICAgICAgICAgICAgPHRoZWFkPlxuICAgICAgICAgICAgICAgIDx0ciBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19yb3cgY2FyZC1jaGVja2xpc3RfX3Jvdy0taGVhZGVyXCI+XG4gICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhXCI+U2V0PC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGFcIj5OYW1lPC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGFcIj5Db3N0PC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGFcIj5UeXBlPC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGFcIj5SYXJpdHk8L3RoPlxuICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YVwiPkFydGlzdDwvdGg+XG4gICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhXCI+UHJpY2U8L3RoPlxuICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICA8L3RoZWFkPlxuICAgICAgICAgICAgPHRib2R5IGNsYXNzPVwianMtLWNhcmQtY2hlY2tsaXN0LWJvZHlcIj48L3Rib2R5PlxuICAgICAgICA8L3RhYmxlPlxuICAgICAgICBgXG4gICAgZWxlbWVudHMucmVzdWx0c1BhZ2UucmVzdWx0c0NvbnRhaW5lci5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWVuZCcsIG1hcmt1cCk7XG59XG5cbmV4cG9ydCBjb25zdCBnZW5lcmF0ZU1hbmFDb3N0SW1hZ2VzID0gKG1hbmFDb3N0LCBzaXplPSdzbWFsbCcpID0+IHtcbiAgICAvLyBJZiB0aGVyZSBpcyBubyBtYW5hIGNvc3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBjYXJkLCB0aGVuIHJldHVybiBhbiBlbXB0eSBzdHJpbmcgdG8gbGVhdmUgdGhlIHJvdyBlbXB0eVxuICAgIGlmICghbWFuYUNvc3QpIHJldHVybiAnJztcblxuICAgIC8vIFJlZ3VsYXIgZXhwcmVzc2lvbnMgdG8gZmluZCBlYWNoIHNldCBvZiBjdXJseSBicmFjZXMge31cbiAgICBsZXQgcmUgPSAvXFx7KC4qPylcXH0vZ1xuXG4gICAgLy8gUGFyc2UgdGhlIHN0cmluZ3MgYW5kIGdldCBhbGwgbWF0Y2hlc1xuICAgIGxldCBtYXRjaGVzID0gbWFuYUNvc3QubWF0Y2gocmUpO1xuXG4gICAgLy8gSWYgdGhlcmUgYXJlIGFueSBtYXRjaGVzLCBsb29wIHRocm91Z2ggYW5kIHJlcGxhY2UgZWFjaCBzZXQgb2YgY3VybHkgYnJhY2VzIHdpdGggdGhlIFxuICAgIC8vIGh0bWwgc3BhbiB0aGF0IGNvcnJlc3BvbnMgdG8gbWFuYS5jc3MgdG8gcmVuZGVyIHRoZSBjb3JyZWN0IGltYWdlXG4gICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgbWF0Y2hlcy5mb3JFYWNoKG0gPT4ge1xuICAgICAgICAgICAgY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKGBcXHsoJHttLnNsaWNlKDEsIC0xKX0pXFx9YCwgJ2cnKTtcbiAgICAgICAgICAgIC8vIFRoaXMgd2lsbCBiZSB0aGUgc3RyaW5nIHVzZWQgdG8gZ2V0IHRoZSByaWdodCBjbGFzcyBmcm9tIG1hbmEuY3NzXG4gICAgICAgICAgICAvLyBXZSB3YW50IHRvIHRha2UgZXZlcnl0aGluZyBpbnNpZGUgdGhlIGJyYWNrZXRzLCBhbmQgaWYgdGhlcmUgaXMgYSAvXG4gICAgICAgICAgICAvLyByZW1vdmUgaXQuXG4gICAgICAgICAgICBjb25zdCBtYW5hSWNvblN0ciA9IG0uc2xpY2UoMSwgLTEpLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgnLycsICcnKVxuICAgICAgICAgICAgbWFuYUNvc3QgPSBtYW5hQ29zdC5yZXBsYWNlKFxuICAgICAgICAgICAgICAgIHJlZ2V4LCBcbiAgICAgICAgICAgICAgICBgPHNwYW4gY2xhc3M9XCJtYW5hICR7c2l6ZX0gcyR7bWFuYUljb25TdHJ9XCI+PC9zcGFuPmBcbiAgICAgICAgICAgIClcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICByZXR1cm4gbWFuYUNvc3Q7XG59XG5cbmNvbnN0IHNob3J0ZW5UeXBlTGluZSA9IHR5cGUgPT4ge1xuICAgIC8vIElmIG5vIHR5cGUgaXMgZ2l2ZW4sIHJldHVybiBhbiBlbXB0eSBzdHJpbmdcbiAgICBpZiAoIXR5cGUpIHJldHVybiAnJztcblxuICAgIC8vIGlmIHRoZSDigJQgZGVsaW1pdGVyIGlzIGZvdW5kIGluIHRoZSBzdHJpbmcsIHJldHVybiBldmVyeXRoaW5nIGJlZm9yZSB0aGUgZGVsaW1pdGVyXG4gICAgaWYgKHR5cGUuaW5kZXhPZign4oCUJykgIT09IC0xKSByZXR1cm4gdHlwZS5zdWJzdHJpbmcoMCwgdHlwZS5pbmRleE9mKCfigJQnKSAtIDEpO1xuXG4gICAgLy8gSWYgdGhlcmUgaXMgbm8gZGVsaW1pdGVyLCByZXR1cm4gdGhlIHR5cGUgYXMgZ2l2ZW4gaW4gdGhlIGNhcmQgb2JqZWN0XG4gICAgcmV0dXJuIHR5cGU7ICAgIFxufVxuXG5jb25zdCBwYXJzZUNhcmROYW1lID0gY2FyZE5hbWUgPT4ge1xuICAgIGlmIChjYXJkTmFtZS5pbmRleE9mKCcvJykgIT09IC0xKSB7XG4gICAgICAgIHJldHVybiBjYXJkTmFtZS5zbGljZSgwLCAoY2FyZE5hbWUuaW5kZXhPZignLycpIC0gMSkpLnJlcGxhY2VBbGwoJyAnLCAnLScpO1xuICAgIH1cblxuICAgIHJldHVybiBjYXJkTmFtZS5yZXBsYWNlQWxsKCcgJywgJy0nKTtcbn1cblxuY29uc3QgZ2VuZXJhdGVDaGVja2xpc3QgPSBjYXJkcyA9PiB7XG4gICAgLy8gVGhlIGN0ciBhbmQgaXNSb3dHcmV5IGZ1bmN0aW9uIGFyZSB1c2VkIHRvIHNldCBhIGNsYXNzIG9uIGV2ZXJ5IG90aGVyIHJvdyBzbyBpdCBjYW4gXG4gICAgLy8gYmUgc3R5bGVkIGdyZXlcbiAgICBsZXQgY3RyID0gMFxuICAgIGNvbnN0IGlzUm93R3JleSA9IGN0ciA9PiAoY3RyICUgMiA9PT0gMCA/ICdjYXJkLWNoZWNrbGlzdF9fcm93LS1ncmV5JyA6ICcnKSAgIFxuXG4gICAgLy8gQ3JlYXRlIGEgbmV3IHRhYmxlIHJvdyBmb3IgZWFjaCBjYXJkIG9iamVjdFxuICAgIGNhcmRzLmZvckVhY2goY2FyZCA9PiB7XG4gICAgICAgIGNvbnN0IGNhcmROYW1lRm9yVXJsID0gcGFyc2VDYXJkTmFtZShjYXJkLm5hbWUpO1xuXG4gICAgICAgIGNvbnN0IG1hcmt1cCA9IGBcbiAgICAgICAgICAgIDx0ciBjbGFzcz1cImpzLS1jaGVja2xpc3Qtcm93ICR7aXNSb3dHcmV5KGN0cil9IGNhcmQtY2hlY2tsaXN0X19yb3cgZGF0YS1jb21wb25lbnQ9XCJjYXJkLXRvb2x0aXBcIiBkYXRhLWNhcmQtaW1nPSR7Y2hlY2tGb3JJbWcoY2FyZCl9PlxuICAgICAgICAgICAgICAgIDx0ZCBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhIGNhcmQtY2hlY2tsaXN0X19kYXRhLS1zZXRcIj48YSBocmVmPVwiL2NhcmQvJHtjYXJkLnNldH0vJHtjYXJkTmFtZUZvclVybH1cIiBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmsgY2FyZC1jaGVja2xpc3RfX2RhdGEtbGluay0tY2VudGVyXCI+JHtjYXJkLnNldH08L2E+PC90ZD5cbiAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YVwiPjxhIGhyZWY9XCIvY2FyZC8ke2NhcmQuc2V0fS8ke2NhcmROYW1lRm9yVXJsfVwiIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGEtbGluayBjYXJkLWNoZWNrbGlzdF9fZGF0YS1saW5rLS1zdGFydFwiPiR7Y2FyZC5uYW1lfTwvYT48L3RkPlxuICAgICAgICAgICAgICAgIDx0ZCBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhXCI+PGEgaHJlZj1cIi9jYXJkLyR7Y2FyZC5zZXR9LyR7Y2FyZE5hbWVGb3JVcmx9XCIgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YS1saW5rIGNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmstLWNlbnRlclwiPiR7Z2VuZXJhdGVNYW5hQ29zdEltYWdlcyhjaGVja0Zvck1hbmFDb3N0KGNhcmQpKX08L2E+PC90ZD5cbiAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YVwiPjxhIGhyZWY9XCIvY2FyZC8ke2NhcmQuc2V0fS8ke2NhcmROYW1lRm9yVXJsfVwiIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGEtbGluayBjYXJkLWNoZWNrbGlzdF9fZGF0YS1saW5rLS1jZW50ZXJcIj4ke3Nob3J0ZW5UeXBlTGluZShjYXJkLnR5cGVfbGluZSl9PC9hPjwvdGQ+XG4gICAgICAgICAgICAgICAgPHRkIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGEgY2FyZC1jaGVja2xpc3RfX2RhdGEtLXJhcml0eVwiPjxhIGhyZWY9XCIvY2FyZC8ke2NhcmQuc2V0fS8ke2NhcmROYW1lRm9yVXJsfVwiIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGEtbGluayBjYXJkLWNoZWNrbGlzdF9fZGF0YS1saW5rLS1jZW50ZXJcIj4ke2NhcmQucmFyaXR5fTwvYT48L3RkPlxuICAgICAgICAgICAgICAgIDx0ZCBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhXCI+PGEgaHJlZj1cIi9jYXJkLyR7Y2FyZC5zZXR9LyR7Y2FyZE5hbWVGb3JVcmx9XCIgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YS1saW5rIGNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmstLWNlbnRlclwiPiR7Y2FyZC5hcnRpc3R9PC9hPjwvdGQ+XG4gICAgICAgICAgICAgICAgPHRkIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGFcIj48YSBocmVmPVwiL2NhcmQvJHtjYXJkLnNldH0vJHtjYXJkTmFtZUZvclVybH1cIiBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmsgY2FyZC1jaGVja2xpc3RfX2RhdGEtbGluay0tY2VudGVyXCI+JHtjYXJkLnByaWNlcy51c2R9PC9hPjwvdGQ+XG4gICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgYFxuICAgICAgICAvLyBQdXQgdGhlIHJvdyBpbiB0aGUgdGFibGVcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1jYXJkLWNoZWNrbGlzdC1ib2R5JykuaW5zZXJ0QWRqYWNlbnRIVE1MKCdiZWZvcmVlbmQnLCBtYXJrdXApO1xuXG4gICAgICAgIC8vIEluY3JlbWVudCB0aGUgY3RyXG4gICAgICAgIGN0ciArKztcbiAgICB9KVxufVxuXG5jb25zdCBjaGVja0Zvck1hbmFDb3N0ID0gY2FyZCA9PiB7XG4gICAgaWYgKGNhcmQubWFuYV9jb3N0KSB7XG4gICAgICAgIHJldHVybiBjYXJkLm1hbmFfY29zdDtcbiAgICB9IGVsc2UgaWYgKGNhcmQuY2FyZF9mYWNlcykge1xuICAgICAgICByZXR1cm4gY2FyZC5jYXJkX2ZhY2VzWzBdLm1hbmFfY29zdDtcbiAgICB9XG59XG5cbmNvbnN0IGNoZWNrRm9ySW1nID0gY2FyZCA9PiB7XG4gICAgaWYgKGNhcmQuaW1hZ2VfdXJpcykgcmV0dXJuIGNhcmQuaW1hZ2VfdXJpcy5ub3JtYWw7XG5cbiAgICAvLyBJZiB0aGVyZSBpcyBubyBjYXJkLmltYWdlX3VyaXMsIHRoZW4gaXQncyBhIGRvdWJsZSBzaWRlZCBjYXJkLiBJbiB0aGlzXG4gICAgLy8gY2FzZSB3ZSB3YW50IHRvIGRpc3BsYXkgdGhlIGltYWdlIGZyb20gZmFjZSBvbmUgb2YgdGhlIGNhcmQuXG4gICAgZWxzZSByZXR1cm4gY2FyZC5jYXJkX2ZhY2VzWzBdLmltYWdlX3VyaXMubm9ybWFsO1xufVxuXG5cbi8vIENyZWF0ZSB0aGUgaG92ZXIgZWZmZWN0IG9uIGVhY2ggcm93IHRoYXQgZGlzcGxheXMgdGhlIGltYWdlIG9mIHRoZSBjYXJkXG5jb25zdCBjaGVja0xpc3RIb3ZlckV2ZW50cyA9ICgpID0+IHtcbiAgICAvLyBHZXQgdGhlIEhUTUwgZm9yIGVhY2ggdGFibGUgcm93XG4gICAgY29uc3Qgcm93cyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1jaGVja2xpc3Qtcm93JykpO1xuIFxuICAgIHJvd3MuZm9yRWFjaChyb3cgPT4ge1xuICAgICAgICByb3cub25tb3VzZW1vdmUgPSBlID0+IHtcbiAgICAgICAgICAgIC8vIElmIHRoZSB3aW5kb3cgaXMgc21hbGxlciB0aGFuIDc2OCBwaXhlbHMsIGRvbid0IGRpc3BsYXkgYW55IGltYWdlc1xuICAgICAgICAgICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoIDwgNzY4KSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgICAgIC8vIElmIHRoZXJlIGlzIGFscmVhZHkgYW4gaW1hZ2UgYmVpbmcgZGlzcGxheWVkLCByZW1vdmUgaXQgZnJvbSB0aGUgRE9NXG4gICAgICAgICAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRvb2x0aXAnKSkge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRvb2x0aXAnKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFByZXAgdGhlIGRpdi5cbiAgICAgICAgICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgZGl2LmNsYXNzTmFtZSA9ICd0b29sdGlwJztcblxuICAgICAgICAgICAgLy8gVGhlIGRpdiBpcyBzdHlsZWQgd2l0aCBwb3NpdGlvbiBhYnNvbHV0ZS4gVGhpcyBjb2RlIHB1dHMgaXQganVzdCB0byB0aGUgcmlnaHQgb2YgdGhlIGN1cnNvclxuICAgICAgICAgICAgZGl2LnN0eWxlLmxlZnQgPSBlLnBhZ2VYICsgNTAgKyAncHgnO1xuICAgICAgICAgICAgZGl2LnN0eWxlLnRvcCA9IGUucGFnZVkgLSAzMCArICdweCc7XG5cbiAgICAgICAgICAgIC8vIFByZXAgdGhlIGltZyBlbGVtZW50XG4gICAgICAgICAgICBjb25zdCBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcbiAgICAgICAgICAgIGltZy5jbGFzc05hbWUgPSAndG9vbHRpcF9faW1nJztcbiAgICAgICAgICAgIGltZy5zcmMgPSByb3cuZGF0YXNldC5jYXJkSW1nO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBQdXQgdGhlIGltZyBpbnRvIHRoZSBkaXYgYW5kIHRoZW4gYXBwZW5kIHRoZSBkaXYgZGlyZWN0bHkgdG8gdGhlIGJvZHkgb2YgdGhlIGRvY3VtZW50LlxuICAgICAgICAgICAgZGl2LmFwcGVuZENoaWxkKGltZyk7IFxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkaXYpOyAgXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVtb3ZlIHRoZSBpbWcgd2hlbiB0YWtpbmcgdGhlIGN1cnNvciBvZmYgdGhlIHJvd1xuICAgICAgICByb3cub25tb3VzZW91dCA9IGUgPT4ge1xuICAgICAgICAgICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50b29sdGlwJykpIHtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50b29sdGlwJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSlcbn1cblxuXG4vLyBGdW5jaXRvbiB0byBiZSB1c2VkIGluIGluZGV4LmpzLiBUYWtlcyBjYXJlIG9mIGFsbCBuZWNlc3Nhcnkgc3RlcHMgdG8gZGlzcGxheSBjYXJkcyBhcyBhIGNoZWNrbGlzdFxuZXhwb3J0IGNvbnN0IGRpc3BsYXlDaGVja2xpc3QgPSBjYXJkcyA9PiB7XG4gICAgY2xlYXJSZXN1bHRzKCk7XG4gICAgcHJlcENoZWNrbGlzdENvbnRhaW5lcigpO1xuICAgIGdlbmVyYXRlQ2hlY2tsaXN0KGNhcmRzKTtcbiAgICBjaGVja0xpc3RIb3ZlckV2ZW50cygpO1xufVxuXG5cbmV4cG9ydCBjb25zdCBjaG9zZVNlbGVjdE1lbnVTb3J0ID0gKG1lbnUsIHN0YXRlKSA9PiB7XG4gICAgLy8gQ3JlYXRlIGFuIGFycmF5IGZyb20gdGhlIEhUTUwgc2VsZWN0IG1lbnVcbiAgICBjb25zdCBvcHRpb25zID0gQXJyYXkuZnJvbShtZW51KVxuXG4gICAgb3B0aW9ucy5mb3JFYWNoKChvcHRpb24sIGkpID0+IHtcbiAgICAgICAgLy8gSWYgdGhlIG9wdGlvbiB2YWx1ZSBtYXRjaGVzIHRoZSBzb3J0IG1ldGhvZCBmcm9tIHRoZSBVUkwsIHNldCBpdCB0byB0aGUgc2VsZWN0ZWQgaXRlbVxuICAgICAgICBpZiAob3B0aW9uLnZhbHVlID09PSBzdGF0ZS5zb3J0TWV0aG9kKSBtZW51LnNlbGVjdGVkSW5kZXggPSBpO1xuICAgIH0pXG59XG5cblxuZXhwb3J0IGNvbnN0IGNob3NlU2VsZWN0TWVudURpc3BsYXkgPSAobWVudSwgc3RhdGUpID0+IHtcbiAgICAvLyBDcmVhdGUgYW4gYXJyYXkgZnJvbSB0aGUgSFRNTCBzZWxlY3QgbWVudVxuICAgIGNvbnN0IG9wdGlvbnMgPSBBcnJheS5mcm9tKG1lbnUpXG5cbiAgICBvcHRpb25zLmZvckVhY2goKG9wdGlvbiwgaSkgPT4ge1xuICAgICAgICAvLyBJZiB0aGUgb3B0aW9uIHZhbHVlIG1hdGNoZXMgdGhlIHNvcnQgbWV0aG9kIGZyb20gdGhlIFVSTCwgc2V0IGl0IHRvIHRoZSBzZWxlY3RlZCBpdGVtXG4gICAgICAgIGlmIChvcHRpb24udmFsdWUgPT09IHN0YXRlLmRpc3BsYXkpIG1lbnUuc2VsZWN0ZWRJbmRleCA9IGk7XG4gICAgfSlcbn1cblxuXG4vLyBGdW5jdGlvbiB0byBjaGFuZ2UgdGhlIHNvcnQgbWV0aG9kIGJhc2VkIG9uIHRoZSBpbnB1dCBmcm9tIHRoZSB1c2VyXG5leHBvcnQgY29uc3QgY2hhbmdlU29ydE1ldGhvZCA9IHN0YXRlID0+IHtcbiAgICAvLyBHZXQgdGhlIGN1cnJlbnQgc29ydCBtZXRob2QgZnJvbSB0aGUgZW5kIG9mIHRoZSBVUkxcbiAgICBjb25zdCBjdXJyZW50U29ydE1ldGhvZCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zdWJzdHJpbmcoXG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5sYXN0SW5kZXhPZignPScpICsgMVxuICAgICk7ICAgIFxuXG4gICAgLy8gR3JhYiB0aGUgZGVzaXJlZCBzb3J0IG1ldGhvZCBmcm9tIHRoZSB1c2VyXG4gICAgY29uc3QgbmV3U29ydE1ldGhvZCA9IGVsZW1lbnRzLnJlc3VsdHNQYWdlLnNvcnRCeS52YWx1ZTtcblxuICAgIC8vIElmIHRoZSBuZXcgc29ydCBtZXRob2QgaXMgbm90IGRpZmZlcmVudCwgZXhpdCB0aGUgZnVuY3Rpb24gYXMgdG8gbm90IHB1c2ggYSBuZXcgc3RhdGVcbiAgICBpZiAoY3VycmVudFNvcnRNZXRob2QgPT09IG5ld1NvcnRNZXRob2QpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSB7ICAgICAgICBcbiAgICAgICAgLy8gRGlzYWJsZSBhbGwgZm91ciBidXR0b25zXG4gICAgICAgIC8vIE9ubHkgZG9pbmcgdGhpcyBiZWNhdXNlIGZpcmVmb3ggcmVxdWlyZXMgYSBjdHJsIGY1XG4gICAgICAgIGRpc2FibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UuZmlyc3RQYWdlQnRuKTtcbiAgICAgICAgZGlzYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5uZXh0UGFnZUJ0bik7XG4gICAgICAgIGRpc2FibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UucHJldmlvdXNQYWdlQnRuKTtcbiAgICAgICAgZGlzYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5sYXN0UGFnZUJ0bik7XG5cbiAgICAgICAgY29uc3QgY3VycmVudFBhdGhOYW1lID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnN1YnN0cmluZyhcbiAgICAgICAgICAgIDAsIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5sYXN0SW5kZXhPZignPScpICsgMVxuICAgICAgICApO1xuXG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gY3VycmVudFBhdGhOYW1lICsgbmV3U29ydE1ldGhvZDsgICAgICAgICAgICAgICAgXG4gICAgfVxufVxuXG5cbmV4cG9ydCBjb25zdCBjaGFuZ2VEaXNwbGF5QW5kVXJsID0gc3RhdGUgPT4ge1xuICAgIGNvbnN0IGN1cnJlbnRNZXRob2QgPSBzdGF0ZS5kaXNwbGF5O1xuICAgIGNvbnN0IG5ld01ldGhvZCA9IGVsZW1lbnRzLnJlc3VsdHNQYWdlLmRpc3BsYXlTZWxlY3Rvci52YWx1ZTtcblxuICAgIGlmIChuZXdNZXRob2QgPT09IGN1cnJlbnRNZXRob2QpIHJldHVybjtcblxuICAgIC8vIFVwZGF0ZSB0aGUgc3RhdGUgd2l0aCBuZXcgZGlzcGxheSBtZXRob2RcbiAgICBzdGF0ZS5kaXNwbGF5ID0gbmV3TWV0aG9kO1xuXG4gICAgLy8gVXBkYXRlIHRoZSB1cmwgd2l0aG91dCBwdXNoaW5nIHRvIHRoZSBzZXJ2ZXJcbiAgICBjb25zdCB0aXRsZSA9IGRvY3VtZW50LnRpdGxlO1xuICAgIGNvbnN0IHBhdGhOYW1lID0gYC9yZXN1bHRzLyR7bmV3TWV0aG9kfS8ke3N0YXRlLnF1ZXJ5fWBcbiAgICBoaXN0b3J5LnB1c2hTdGF0ZSh7XG4gICAgICAgIGN1cnJlbnRJbmRleDogc3RhdGUuY3VycmVudEluZGV4LFxuICAgICAgICBkaXNwbGF5OiBzdGF0ZS5kaXNwbGF5LFxuICAgIH0sIHRpdGxlLCBwYXRoTmFtZSk7XG5cbn1cblxuXG5leHBvcnQgY29uc3QgdXBkYXRlRGlzcGxheSA9IHN0YXRlID0+IHtcbiAgICAvLyBDbGVhciBhbnkgZXhpc3RpbmcgSFRNTCBpbiB0aGUgZGlzcGxheVxuICAgIGNsZWFyUmVzdWx0cygpO1xuXG4gICAgLy8gUmVmcmVzaCB0aGUgZGlzcGxheVxuICAgIGlmIChzdGF0ZS5kaXNwbGF5ID09PSAnbGlzdCcpIGRpc3BsYXlDaGVja2xpc3Qoc3RhdGUuYWxsQ2FyZHNbc3RhdGUuY3VycmVudEluZGV4XSk7XG4gICAgaWYgKHN0YXRlLmRpc3BsYXkgPT09ICdpbWFnZXMnKSBkaXNwYWx5SW1hZ2VzKHN0YXRlLmFsbENhcmRzW3N0YXRlLmN1cnJlbnRJbmRleF0pO1xufVxuXG5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKioqKioqIFBBR0lOQVRJT04gKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcblxuLy8gV2lsbCBiZSBjYWxsZWQgZHVyaW5nIGNoYW5naW5nIHBhZ2VzLiBSZW1vdmVzIHRoZSBjdXJyZW50IGVsZW1lbnQgaW4gdGhlIGJhclxuY29uc3QgY2xlYXJEaXNwbGF5QmFyID0gKCkgPT4ge1xuICAgIGNvbnN0IGRpc3BsYXlCYXJUZXh0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1kaXNwbGF5LWJhci10ZXh0JylcbiAgICBpZiAoZGlzcGxheUJhclRleHQpIGRpc3BsYXlCYXJUZXh0LnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQoZGlzcGxheUJhclRleHQpO1xufSAgICBcblxuXG4vLyBLZWVwcyB0cmFjayBvZiB3aGVyZSB0aGUgdXNlciBpcyBpbiB0aGVyZSBsaXN0IG9mIGNhcmRzXG5jb25zdCBwYWdpbmF0aW9uVHJhY2tlciA9IHN0YXRlID0+IHtcbiAgICB2YXIgYmVnLCBlbmQ7XG4gICAgYmVnID0gKChzdGF0ZS5jdXJyZW50SW5kZXggKyAxKSAqIDE3NSkgLSAxNzQ7IFxuICAgIGVuZCA9ICgoc3RhdGUuY3VycmVudEluZGV4KSAqIDE3NSkgKyBzdGF0ZS5hbGxDYXJkc1tzdGF0ZS5jdXJyZW50SW5kZXhdLmxlbmd0aFxuXG4gICAgcmV0dXJuIHsgYmVnLCBlbmQgfTtcbn1cblxuXG5leHBvcnQgY29uc3QgdXBkYXRlRGlzcGxheUJhciA9IHN0YXRlID0+IHtcbiAgICBjb25zdCBtYXJrdXAgPSBgXG4gICAgICAgIDxwIGNsYXNzPVwiYXBpLXJlc3VsdHMtZGlzcGxheV9fZGlzcGxheS1iYXItdGV4dCBqcy0tZGlzcGxheS1iYXItdGV4dFwiPlxuICAgICAgICAgICAgRGlzcGxheWluZyAke3BhZ2luYXRpb25UcmFja2VyKHN0YXRlKS5iZWd9IC0gJHtwYWdpbmF0aW9uVHJhY2tlcihzdGF0ZSkuZW5kfSBvZiAke3N0YXRlLnNlYXJjaC5yZXN1bHRzLnRvdGFsX2NhcmRzfSBjYXJkc1xuICAgICAgICA8L3A+XG4gICAgYFxuXG4gICAgY2xlYXJEaXNwbGF5QmFyKCk7XG4gICAgZWxlbWVudHMucmVzdWx0c1BhZ2UuZGlzcGxheUJhci5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWVuZCcsIG1hcmt1cCk7XG59XG5cblxuZXhwb3J0IGNvbnN0IGVuYWJsZUJ0biA9IGJ0biA9PiB7XG4gICAgaWYgKGJ0bi5kaXNhYmxlZCkge1xuICAgICAgICBidG4uY2xhc3NMaXN0LnJlbW92ZSgnYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXBhZ2luYXRpb24tY29udGFpbmVyLS1kaXNhYmxlZCcpO1xuICAgICAgICBidG4uZGlzYWJsZWQgPSBmYWxzZTtcbiAgICB9XG59XG5cblxuZXhwb3J0IGNvbnN0IGRpc2FibGVCdG4gPSBidG4gPT4ge1xuICAgIGlmICghYnRuLmRpc2FibGVkKSB7XG4gICAgICAgIGJ0bi5jbGFzc0xpc3QuYWRkKCdhcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtcGFnaW5hdGlvbi1jb250YWluZXItLWRpc2FibGVkJyk7XG4gICAgICAgIGJ0bi5kaXNhYmxlZCA9IHRydWU7XG4gICAgfVxufVxuXG5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKioqKioqKioqKioqIDQwNCAqKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcblxuZXhwb3J0IGNvbnN0IGRpc3BsYXk0MDQgPSAoKSA9PiB7XG4gICAgY29uc3QgZGl2ID0gY3JlYXRlNDA0TWVzc2FnZSgpO1xuICAgIGVsZW1lbnRzLnJlc3VsdHNQYWdlLnJlc3VsdHNDb250YWluZXIuYXBwZW5kQ2hpbGQoZGl2KTtcbn1cblxuY29uc3QgY3JlYXRlNDA0RGl2ID0gKCkgPT4ge1xuICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGRpdi5jbGFzc0xpc3QgPSBgbm8tcmVzdWx0c2BcbiAgICByZXR1cm4gZGl2O1xufVxuXG5jb25zdCBjcmVhdGU0MDRoMyA9ICgpID0+IHtcbiAgICBjb25zdCBoMyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gzJyk7XG4gICAgaDMuY2xhc3NMaXN0ID0gYG5vLXJlc3VsdHNfX2gzYDtcbiAgICBoMy5pbm5lckhUTUwgPSBgTm8gY2FyZHMgZm91bmRgO1xuICAgIHJldHVybiBoMztcbn1cblxuY29uc3QgY3JlYXRlNDA0cEVsZW1lbnQgPSAoKSA9PiB7XG4gICAgY29uc3QgcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcbiAgICBwLmNsYXNzTGlzdCA9IGBuby1yZXN1bHRzX19wYFxuICAgIHAuaW5uZXJIVE1MID0gJ1lvdXIgc2VhcmNoIGRpZG5cXCd0IG1hdGNoIGFueSBjYXJkcy4gR28gYmFjayB0byB0aGUgc2VhcmNoIHBhZ2UgYW5kIGVkaXQgeW91ciBzZWFyY2gnO1xuICAgIHJldHVybiBwOyAgICBcbn1cblxuY29uc3QgY3JlYXRlNDA0QnRuID0gKCkgPT4ge1xuICAgIGNvbnN0IGJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICBidG4uY2xhc3NMaXN0ID0gYGJ0biBuby1yZXN1bHRzX19idG5gXG4gICAgYnRuLmhyZWYgPSAnL3NlYXJjaCc7XG4gICAgYnRuLmlubmVySFRNTCA9ICdHbyBCYWNrJztcbiAgICByZXR1cm4gYnRuO1xufVxuXG5jb25zdCBjcmVhdGU0MDRNZXNzYWdlID0gKCkgPT4ge1xuICAgIGNvbnN0IGRpdiA9IGNyZWF0ZTQwNERpdigpO1xuICAgIGNvbnN0IGgzID0gY3JlYXRlNDA0aDMoKTtcbiAgICBjb25zdCBwID0gY3JlYXRlNDA0cEVsZW1lbnQoKTtcbiAgICBjb25zdCBidG4gPSBjcmVhdGU0MDRCdG4oKTtcblxuICAgIGRpdi5hcHBlbmRDaGlsZChoMyk7XG4gICAgZGl2LmFwcGVuZENoaWxkKHApO1xuICAgIGRpdi5hcHBlbmRDaGlsZChidG4pO1xuXG4gICAgcmV0dXJuIGRpdjtcbn1cbiIsImltcG9ydCB7IGVsZW1lbnRzIH0gZnJvbSAnLi9iYXNlJztcblxuXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKiogVFlQRSBMSU5FICoqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG5cbmV4cG9ydCBjb25zdCBzaG93VHlwZXNEcm9wRG93biA9ICgpID0+IHtcbiAgICBpZiAoZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVEcm9wRG93bi5oYXNBdHRyaWJ1dGUoJ2hpZGRlbicpKSB7ICAgICAgICAgICAgXG4gICAgICAgIGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlRHJvcERvd24ucmVtb3ZlQXR0cmlidXRlKCdoaWRkZW4nKTtcbiAgICAgICAgZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVEcm9wRG93bi5zY3JvbGxUb3AgPSAwO1xuXG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0byBkaXNwbGF5IGFsbCB0eXBlcyB3aGVuIG9wZW5pbmcgdGhlIGRyb3Bkb3duIGFuZCBiZWZvcmUgdGFraW5nIGlucHV0XG4gICAgICAgIGZpbHRlclR5cGVzKCcnKTtcbiAgICAgICAgZmlsdGVyU2VsZWN0ZWRUeXBlcygpO1xuICAgICAgICBmaWx0ZXJUeXBlSGVhZGVycygpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNvbnN0IGhpZGVUeXBlc0Ryb3BEb3duID0gKCkgPT4ge1xuICAgIGlmICghZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVEcm9wRG93bi5oYXNBdHRyaWJ1dGUoJ2hpZGRlbicpKSB7XG4gICAgICAgIGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlTGluZS52YWx1ZSA9ICcnO1xuICAgICAgICBlbGVtZW50cy5hcGlTZWFyY2gudHlwZURyb3BEb3duLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTsgICAgICAgIFxuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgbmF2aWdhdGVUeXBlc0Ryb3BEb3duKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjb25zdCBmaWx0ZXJUeXBlSGVhZGVycyA9ICgpID0+IHtcbiAgICAvLyBPbiBldmVyeSBpbnB1dCBpbnRvIHRoZSB0eXBlbGluZSBiYXIsIG1ha2UgYWxsIGhlYWRlcnMgdmlzaWJsZVxuICAgIGNvbnN0IGhlYWRlcnMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tdHlwZXMtY2F0ZWdvcnktaGVhZGVyJykpO1xuICAgIGhlYWRlcnMuZm9yRWFjaChoZWFkZXIgPT4ge1xuICAgICAgICBpZiAoaGVhZGVyLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIGhlYWRlci5yZW1vdmVBdHRyaWJ1dGUoJ2hpZGRlbicpXG4gICAgfSlcblxuICAgIC8vIEZvciBlYWNoIGNhdGVnb3J5IG9mIHR5cGUsIGlmIHRoZXJlIGFyZSBub3QgYW55IHZpc2libGUgYmVjYXVzZSB0aGV5IHdlcmUgZmlsdGVyZWQgb3V0XG4gICAgLy8gaGlkZSB0aGUgaGVhZGVyIGZvciB0aGF0IGNhdGVnb3J5ICAgIFxuICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1iYXNpYzpub3QoW2hpZGRlbl0pJykpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1iYXNpYy1oZWFkZXInKS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gICAgfVxuXG4gICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXN1cGVyOm5vdChbaGlkZGVuXSknKSkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXN1cGVyLWhlYWRlcicpLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICB9XG5cbiAgICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXJ0aWZhY3Q6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXJ0aWZhY3QtaGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cblxuICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1lbmNoYW50bWVudDpub3QoW2hpZGRlbl0pJykpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1lbmNoYW50bWVudC1oZWFkZXInKS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gICAgfVxuXG4gICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWxhbmQ6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tbGFuZC1oZWFkZXInKS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gICAgfVxuXG4gICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXNwZWxsOm5vdChbaGlkZGVuXSknKSkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXNwZWxsLWhlYWRlcicpLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICB9XG5cbiAgICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tcGxhbmVzd2Fsa2VyOm5vdChbaGlkZGVuXSknKSkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXBsYW5lc3dhbGtlci1oZWFkZXInKS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gICAgfVxuXG4gICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWNyZWF0dXJlOm5vdChbaGlkZGVuXSknKSkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWNyZWF0dXJlLWhlYWRlcicpLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICB9XG59O1xuXG5jb25zdCBmaWx0ZXJTZWxlY3RlZFR5cGVzID0gKCkgPT4ge1xuICAgIGNvbnN0IHR5cGVzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAnW2RhdGEtdHlwZV1bZGF0YS1zZWxlY3RlZF0nXG4gICAgKSk7XG5cbiAgICB0eXBlcy5mb3JFYWNoKHR5cGUgPT4ge1xuICAgICAgICBpZiAodHlwZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2VsZWN0ZWQnKSA9PT0gJ3RydWUnKSB7XG4gICAgICAgICAgICBpZiAoIXR5cGUuaGFzQXR0cmlidXRlKCdoaWRkZW4nKSkgdHlwZS5zZXRBdHRyaWJ1dGUoXG4gICAgICAgICAgICAgICAgJ2hpZGRlbicsICd0cnVlJ1xuICAgICAgICAgICAgKVxuICAgICAgICB9XG4gICAgfSlcbn07XG5cbmV4cG9ydCBjb25zdCBmaWx0ZXJUeXBlcyA9IHN0ciA9PiB7XG4gICAgY29uc3QgdHlwZXMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLXR5cGVdJykpO1xuXG4gICAgLy8gUmVtb3ZlIHRoZSBoaWRkZW4gYXR0cmlidXRlIGlmIGl0IGV4aXN0cyBvbiBhbnkgZWxlbWVudCwgYW5kIHRoZW4gaGlkZSBhbnkgZWxlbWVudHNcbiAgICAvLyB0aGF0IGRvbid0IGluY2x1ZGUgdGhlIHN0cmluZyBnaXZlbiBpbiB0aGUgaW5wdXQgZnJvbSB0aGUgdXNlclxuICAgIHR5cGVzLmZvckVhY2godHlwZSA9PiB7XG4gICAgICAgIGlmICh0eXBlLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIHR5cGUucmVtb3ZlQXR0cmlidXRlKCdoaWRkZW4nKTtcbiAgICAgICAgaWYgKCF0eXBlLmdldEF0dHJpYnV0ZSgnZGF0YS10eXBlJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzdHIudG9Mb3dlckNhc2UoKSkpIHtcbiAgICAgICAgICAgIHR5cGUuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgICAgICB9XG4gICAgfSkgICAgXG5cbiAgICBmaWx0ZXJTZWxlY3RlZFR5cGVzKCk7XG59XG5cbmNvbnN0IGhpZ2hsaWdodFR5cGUgPSB0eXBlID0+IHtcbiAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1oaWdobGlnaHRlZCcpKSByZW1vdmVDdXJyZW50SGlnaGxpZ2h0KCk7XG5cbiAgICBpZiAodHlwZSkge1xuICAgICAgICB0eXBlLmNsYXNzTGlzdC5hZGQoXG4gICAgICAgICAgICAnanMtLWhpZ2hsaWdodGVkJywgJ3NlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0LW9wdGlvbi0taGlnaGxpZ2h0ZWQnXG4gICAgICAgICk7XG4gICAgfVxufTtcblxuY29uc3QgcmVtb3ZlQ3VycmVudEhpZ2hsaWdodCA9ICgpID0+IHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWhpZ2hsaWdodGVkJykuY2xhc3NMaXN0LnJlbW92ZShcbiAgICAgICAgJ2pzLS1oaWdobGlnaHRlZCcsICdzZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1vcHRpb24tLWhpZ2hsaWdodGVkJ1xuICAgICk7XG59O1xuXG5jb25zdCBzZXRTY3JvbGxUb3BPbkRvd25BcnJvdyA9IChlbCwgZHJvcGRvd24pID0+IHtcbiAgICBpZiAoZWwub2Zmc2V0VG9wID4gZHJvcGRvd24ub2Zmc2V0SGVpZ2h0IC0gZWwub2Zmc2V0SGVpZ2h0ICYmXG4gICAgICBkcm9wZG93bi5zY3JvbGxUb3AgKyBkcm9wZG93bi5vZmZzZXRIZWlnaHQgLSBlbC5vZmZzZXRIZWlnaHQgPCBlbC5vZmZzZXRUb3ApIHtcbiAgICAgICAgZHJvcGRvd24uc2Nyb2xsVG9wID0gZWwub2Zmc2V0VG9wIC0gXG4gICAgICAgICAgZHJvcGRvd24ub2Zmc2V0SGVpZ2h0ICsgZWwub2Zmc2V0SGVpZ2h0O1xuICAgIH1cbn1cblxuY29uc3Qgc2V0U2Nyb2xsVG9wT25VcEFycm93ID0gKGVsLCBkcm9wZG93bikgPT4ge1xuICAgIGlmIChlbC5vZmZzZXRUb3AgPCBkcm9wZG93bi5zY3JvbGxUb3ApIHtcbiAgICAgICAgZHJvcGRvd24uc2Nyb2xsVG9wID0gZWwub2Zmc2V0VG9wO1xuXG4gICAgICAgIC8vIDMwIGlzIHRoZSBoZWlnaHQgb2YgY2F0ZWdvcnkgaGVhZGVycy4gSWYgdGhlIGNhdGVnb3J5IGhlYWRlciBpcyBcbiAgICAgICAgLy8gdGhlIG9ubHkgZWxlbWVudCBsZWZ0IHRoYXQgaXMgbm90IHJldmVhbGVkLCBzZXQgdGVoIHNjcm9sbCB0b3AgdG8gMFxuICAgICAgICBpZiAoZHJvcGRvd24uc2Nyb2xsVG9wIDw9IDMwKSBkcm9wZG93bi5zY3JvbGxUb3AgPSAwO1xuICAgIH1cbn1cblxuY29uc3QgbmF2aWdhdGVUeXBlc0Ryb3BEb3duID0gZSA9PiB7XG4gICAgY29uc3QgdHlwZXMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tdHlwZTpub3QoW2hpZGRlbl0pJykpO1xuICAgIGNvbnN0IGkgPSB0eXBlcy5pbmRleE9mKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taGlnaGxpZ2h0ZWQnKSk7XG5cbiAgICBpZiAoZS5jb2RlID09PSAnQXJyb3dEb3duJyAmJiBpIDwgdHlwZXMubGVuZ3RoIC0gMSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHJlbW92ZUN1cnJlbnRIaWdobGlnaHQoKTtcbiAgICAgICAgaGlnaGxpZ2h0VHlwZSh0eXBlc1tpICsgMV0pO1xuXG4gICAgICAgIHNldFNjcm9sbFRvcE9uRG93bkFycm93KHR5cGVzW2kgKyAxXSwgZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVEcm9wRG93bik7XG4gICAgfVxuXG4gICAgaWYgKGUuY29kZSA9PT0gJ0Fycm93VXAnKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgXG4gICAgICAgIC8vIFdlIGFsd2F5cyB3YW50IHRvIHByZXZlbnQgdGhlIGRlZmF1bHQuIFdlIG9ubHkgd2FudCB0byBjaGFuZ2UgdGhlXG4gICAgICAgIC8vIGhpZ2hsaWdodCBpZiBub3Qgb24gdGhlIHRvcCB0eXBlIGluIHRoZSBkcm9wZG93blxuICAgICAgICBpZiAoaSA+IDApIHtcbiAgICAgICAgICAgIHJlbW92ZUN1cnJlbnRIaWdobGlnaHQoKVxuICAgICAgICAgICAgaGlnaGxpZ2h0VHlwZSh0eXBlc1tpIC0gMV0pO1xuICAgIFxuICAgICAgICAgICAgc2V0U2Nyb2xsVG9wT25VcEFycm93KFxuICAgICAgICAgICAgICAgIHR5cGVzW2kgLSAxXSwgZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVEcm9wRG93blxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChlLmNvZGUgPT09ICdFbnRlcicpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIHRvZ2dsZURhdGFTZWxlY3RlZChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWhpZ2hsaWdodGVkJykpO1xuICAgICAgICBhZGRUeXBlKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taGlnaGxpZ2h0ZWQnKS5nZXRBdHRyaWJ1dGUoJ2RhdGEtdHlwZScpKTtcbiAgICAgICAgaGlkZVR5cGVzRHJvcERvd24oKTtcbiAgICB9XG59XG5cbmNvbnN0IGhvdmVyT3ZlclR5cGVzTGlzdGVuZXIgPSAoKSA9PiB7XG4gICAgY29uc3QgdHlwZXMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tdHlwZTpub3QoW2hpZGRlbl0pJykpO1xuXG4gICAgdHlwZXMuZm9yRWFjaCh0eXBlID0+IHtcbiAgICAgICAgdHlwZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgKCkgPT4gaGlnaGxpZ2h0VHlwZSh0eXBlKSk7XG4gICAgfSlcbn1cblxuZXhwb3J0IGNvbnN0IHN0YXJ0VHlwZXNEcm9wRG93bk5hdmlnYXRpb24gPSAoKSA9PiB7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG5hdmlnYXRlVHlwZXNEcm9wRG93bik7XG4gICAgY29uc3QgZmlyc3RUeXBlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS10eXBlOm5vdChbaGlkZGVuXSknKTtcbiAgICBoaWdobGlnaHRUeXBlKGZpcnN0VHlwZSk7XG4gICAgaG92ZXJPdmVyVHlwZXNMaXN0ZW5lcigpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBuYXZpZ2F0ZVR5cGVzRHJvcERvd24pO1xuICAgIGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlRHJvcERvd24uc2Nyb2xsVG9wID0gMDtcbn1cblxuY29uc3QgcmVtb3ZlVHlwZUJ0biA9ICgpID0+IHtcbiAgICAvLyBTcGFuIHdpbGwgYWN0IGFzIHRoZSBidXR0b24gdG8gcmVtb3ZlIHR5cGVzIGZyb20gdGhlIFwic2VsZWN0ZWRcIiBsaXN0XG4gICAgY29uc3QgYnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgIGJ0bi5jbGFzc0xpc3QgPSAnc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLXJlbW92ZS1idG4ganMtLWFwaS10eXBlcy1jbG9zZS1idG4nO1xuICAgIGJ0bi5pbm5lckhUTUwgPSAneCc7XG5cbiAgICBidG4ub25jbGljayA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgdHlwZU5hbWUgPSBidG4ubmV4dEVsZW1lbnRTaWJsaW5nLm5leHRFbGVtZW50U2libGluZy5pbm5lckhUTUw7XG4gICAgICAgIFxuICAgICAgICBjb25zdCB0eXBlVG9Ub2dnbGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbZGF0YS10eXBlfD0ke3R5cGVOYW1lfV1gKVxuXG4gICAgICAgIHRvZ2dsZURhdGFTZWxlY3RlZCh0eXBlVG9Ub2dnbGUpO1xuXG4gICAgICAgIGJ0bi5wYXJlbnRFbGVtZW50LnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQoYnRuLnBhcmVudEVsZW1lbnQpXG4gICAgfVxuXG4gICAgcmV0dXJuIGJ0bjtcbn1cblxuY29uc3QgdHlwZVRvZ2dsZUJ0biA9ICgpID0+IHtcbiAgICAvLyBTcGFuIHdpbGwgYWN0IGFzIHRoZSBidXR0b24gdG8gdG9nZ2xlIHdoZXRoZXIgb3Igbm90IGEgdHlwZSBpcyBpbmNsdWRlZCBvciBleGNsdWRlZCBmcm9tIHRoZSBzZWFyY2hcbiAgICBjb25zdCBidG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgYnRuLmNsYXNzTGlzdCA9ICdzZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlciBzZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlci0taXMganMtLWFwaS10eXBlcy10b2dnbGVyJztcbiAgICBidG4uaW5uZXJIVE1MID0gJ0lTJztcblxuICAgIC8qXG4gICAgICAgIFRoaXMgd2lsbCB0b2dnbGUgYmV0d2VlbiBzZWFyY2hpbmcgZm9yIGNhcmRzIHRoYXQgaW5jbHVkZSB0aGUgZ2l2ZW4gdHlwZSBhbmQgZXhjbHVkZSB0aGUgZ2l2ZW4gdHlwZS5cbiAgICAgICAgSXQgd2lsbCBtYWtlIHN1cmUgdGhhdCB0aGUgYXBwcm9wcmlhdGUgZGF0YSB0eXBlIGlzIGdpdmVuIHRvIHRoZSBzcGFuIGVsZW1lbnQgdGhhdCBjb250YWlucyB0aGUgdHlwZVxuICAgICAgICBTbyB0aGF0IHRoZSBzZWFyY2ggZnVuY3Rpb25hbGl0eSBjcmVhdGVzIHRoZSBhcHByb3ByaWF0ZSBxdWVyeSBzdHJpbmdcblxuICAgICovXG4gICAgYnRuLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIGlmIChidG4uaW5uZXJIVE1MID09PSAnSVMnKSB7XG4gICAgICAgICAgICBidG4uY2xhc3NMaXN0ID0gJ3NlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy10b2dnbGVyIHNlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy10b2dnbGVyLS1ub3QganMtLWFwaS10eXBlcy10b2dnbGVyJztcbiAgICAgICAgICAgIGJ0bi5uZXh0RWxlbWVudFNpYmxpbmcucmVtb3ZlQXR0cmlidXRlKCdkYXRhLWluY2x1ZGUtdHlwZScpO1xuICAgICAgICAgICAgYnRuLm5leHRFbGVtZW50U2libGluZy5zZXRBdHRyaWJ1dGUoJ2RhdGEtZXhjbHVkZS10eXBlJywgYnRuLm5leHRFbGVtZW50U2libGluZy5pbm5lckhUTUwpO1xuICAgICAgICAgICAgYnRuLmlubmVySFRNTCA9ICdOT1QnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnRuLmNsYXNzTGlzdCA9ICdzZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlciBzZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlci0taXMganMtLWFwaS10eXBlcy10b2dnbGVyJztcbiAgICAgICAgICAgIGJ0bi5uZXh0RWxlbWVudFNpYmxpbmcucmVtb3ZlQXR0cmlidXRlKCdkYXRhLWV4Y2x1ZGUtdHlwZScpO1xuICAgICAgICAgICAgYnRuLm5leHRFbGVtZW50U2libGluZy5zZXRBdHRyaWJ1dGUoJ2RhdGEtaW5jbHVkZS10eXBlJywgYnRuLm5leHRFbGVtZW50U2libGluZy5pbm5lckhUTUwpO1xuICAgICAgICAgICAgYnRuLmlubmVySFRNTCA9ICdJUyc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYnRuO1xufVxuXG5jb25zdCB0b2dnbGVEYXRhU2VsZWN0ZWQgPSB0eXBlT3JTZXQgPT4ge1xuICAgIGlmICh0eXBlT3JTZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXNlbGVjdGVkJykgPT09ICd0cnVlJykge1xuICAgICAgICB0eXBlT3JTZXQuc2V0QXR0cmlidXRlKCdkYXRhLXNlbGVjdGVkJywgJ2ZhbHNlJylcbiAgICB9IGVsc2Uge1xuICAgICAgICB0eXBlT3JTZXQuc2V0QXR0cmlidXRlKCdkYXRhLXNlbGVjdGVkJywgJ3RydWUnKVxuICAgIH1cblxufVxuXG5jb25zdCBhZGRUeXBlID0gdHlwZSA9PiB7XG4gICAgLy8gQ3JlYXRlIHRoZSBlbXB0eSBsaSBlbGVtZW50IHRvIGhvbGQgdGhlIHR5cGVzIHRoYXQgdGhlIHVzZXIgc2VsZWN0cy4gU2V0IHRoZSBjbGFzcyBsaXN0LFxuICAgIC8vIGFuZCB0aGUgZGF0YS1zZWxlY3RlZCBhdHRyaWJ1dGUgdG8gdHJ1ZS5cbiAgICBjb25zdCBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG4gICAgbGkuY2xhc3NMaXN0ID0gJ3NlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy1saXN0LWl0ZW0ganMtLWFwaS1zZWxlY3RlZC10eXBlJztcblxuICAgIC8vIFRoZSB0eXBlU3BhbiBob2xkcyB0aGUgdHlwZSBzZWxlY3RlZCBieSB0aGUgdXNlciBmcm9tIHRoZSBkcm9wZG93bi4gVGhlIGRhdGEgYXR0cmlidXRlXG4gICAgLy8gaXMgdXNlZCBpbiBTZWFyY2guanMgdG8gYnVpbGQgdGhlIHF1ZXJ5IHN0cmluZ1xuICAgIGNvbnN0IHR5cGVTcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgIHR5cGVTcGFuLnNldEF0dHJpYnV0ZSgnZGF0YS1pbmNsdWRlLXR5cGUnLCB0eXBlKTtcbiAgICB0eXBlU3Bhbi5pbm5lckhUTUwgPSB0eXBlO1xuXG4gICAgLy8gQ29uc3RydWN0IHRoZSBsaSBlbGVtZW50LiBUaGUgcmVtb3ZlVHlwZUJ0biBhbmQgdHlwZVRvZ2dsZUJ0biBmdW5jaXRvbnMgcmV0dXJuIGh0bWwgZWxlbWVudHNcbiAgICBsaS5hcHBlbmRDaGlsZChyZW1vdmVUeXBlQnRuKCkpO1xuICAgIGxpLmFwcGVuZENoaWxkKHR5cGVUb2dnbGVCdG4oKSk7XG4gICAgbGkuYXBwZW5kQ2hpbGQodHlwZVNwYW4pO1xuXG4gICAgZWxlbWVudHMuYXBpU2VhcmNoLnNlbGVjdGVkVHlwZXMuYXBwZW5kQ2hpbGQobGkpO1xufVxuXG5leHBvcnQgY29uc3QgdHlwZUxpbmVMaXN0ZW5lciA9IGUgPT4ge1xuICAgIC8vIElmIHRoZSB0YXJnZXQgaXMgbm90IFR5cGUgTGluZSBpbnB1dCBsaW5lLCBvciBhbiBlbGVtZW50IGluIHRoZSBkcm9wZG93biBsaXN0LCBcbiAgICAvLyBjbG9zZSB0aGUgZHJvcGRvd24gYW5kIHJlbW92ZSB0aGUgZXZlbnQgbGlzdGVuZXJcbiAgICBpZiAoZS50YXJnZXQgIT09IGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlTGluZSAmJiAhZS50YXJnZXQubWF0Y2hlcygnLmpzLS1hcGktZHJvcGRvd24tdHlwZXMtbGlzdCcpKSB7XG4gICAgICAgIGhpZGVUeXBlc0Ryb3BEb3duKCk7ICAgICBcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0eXBlTGluZUxpc3RlbmVyKSAgXG4gICAgLy8gSWYgdGhlIHRhcmdldCBpcyBvbmUgaWYgdHlwZXMsIGdldCB0aGUgZGF0YSB0eXBlXG4gICAgfSBlbHNlIGlmIChlLnRhcmdldC5oYXNBdHRyaWJ1dGUoJ2RhdGEtdHlwZScpKSB7XG4gICAgICAgIHRvZ2dsZURhdGFTZWxlY3RlZChlLnRhcmdldCk7XG4gICAgICAgIGFkZFR5cGUoZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXR5cGUnKSk7XG4gICAgICAgIGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlTGluZS5mb2N1cygpO1xuICAgICAgICBoaWRlVHlwZXNEcm9wRG93bigpO1xuXG4gICAgfVxufVxuXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKiogU0VUUyAqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG5cbmV4cG9ydCBjb25zdCBzaG93U2V0c0Ryb3BEb3duID0gKCkgPT4ge1xuICAgIGlmIChlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd24uaGFzQXR0cmlidXRlKCdoaWRkZW4nKSkge1xuICAgICAgICBlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd24ucmVtb3ZlQXR0cmlidXRlKCdoaWRkZW4nKTtcbiAgICAgICAgZWxlbWVudHMuYXBpU2VhcmNoLnNldERyb3BEb3duLnNjcm9sbFRvcCA9IDA7XG5cbiAgICAgICAgZmlsdGVyU2V0cygnJyk7XG4gICAgICAgIGZpbHRlclNlbGVjdGVkU2V0cygpO1xuICAgICAgICBmaWx0ZXJTZXRIZWFkZXJzKCk7XG4gICAgfVxufVxuXG5jb25zdCBoaWRlU2V0c0Ryb3BEb3duID0gKCkgPT4ge1xuICAgIGlmICghZWxlbWVudHMuYXBpU2VhcmNoLnNldERyb3BEb3duLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIHtcbiAgICAgICAgZWxlbWVudHMuYXBpU2VhcmNoLnNldERyb3BEb3duLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICAgICAgZWxlbWVudHMuYXBpU2VhcmNoLnNldElucHV0LnZhbHVlID0gJyc7XG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBuYXZpZ2F0ZVNldHNEcm9wRG93bik7XG4gICAgfVxufVxuXG5leHBvcnQgY29uc3QgZmlsdGVyU2V0SGVhZGVycyA9ICgpID0+IHtcbiAgICAvLyBPbiBldmVyeSBpbnB1dCBpbnRvIHRoZSB0eXBlbGluZSBiYXIsIG1ha2UgYWxsIGhlYWRlcnMgdmlzaWJsZVxuICAgIGNvbnN0IGhlYWRlcnMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tc2V0cy1jYXRlZ29yeS1oZWFkZXInKSk7XG4gICAgaGVhZGVycy5mb3JFYWNoKGhlYWRlciA9PiB7XG4gICAgICAgIGlmIChoZWFkZXIuaGFzQXR0cmlidXRlKCdoaWRkZW4nKSkgaGVhZGVyLnJlbW92ZUF0dHJpYnV0ZSgnaGlkZGVuJylcbiAgICB9KVxuXG4gICAgLy8gRm9yIGVhY2ggY2F0ZWdvcnkgb2YgdHlwZSwgaWYgdGhlcmUgYXJlIG5vdCBhbnkgdmlzaWJsZSBiZWNhdXNlIHRoZXkgd2VyZSBmaWx0ZXJlZCBvdXRcbiAgICAvLyBoaWRlIHRoZSBoZWFkZXIgZm9yIHRoYXQgY2F0ZWdvcnkgICAgIFxuICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1leHBhbnNpb246bm90KFtoaWRkZW5dKScpKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tZXhwYW5zaW9uLWhlYWRlcicpLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICB9XG5cbiAgICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tY29yZTpub3QoW2hpZGRlbl0pJykpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1jb3JlLWhlYWRlcicpLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICB9XG5cbiAgICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tbWFzdGVyczpub3QoW2hpZGRlbl0pJykpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1tYXN0ZXJzLWhlYWRlcicpLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICB9XG5cbiAgICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tZHJhZnQ6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tZHJhZnQtaGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cblxuICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1kdWVsX2RlY2s6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tZHVlbF9kZWNrLWhlYWRlcicpLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICB9XG5cbiAgICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXJjaGVuZW15Om5vdChbaGlkZGVuXSknKSkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFyY2hlbmVteS1oZWFkZXInKS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gICAgfVxuXG4gICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWJveDpub3QoW2hpZGRlbl0pJykpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1ib3gtaGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cblxuICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1jb21tYW5kZXI6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tY29tbWFuZGVyLWhlYWRlcicpLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICB9XG5cbiAgICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tdmF1bHQ6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tdmF1bHQtaGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cblxuICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1mdW5ueTpub3QoW2hpZGRlbl0pJykpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1mdW5ueS1oZWFkZXInKS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gICAgfVxuXG4gICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLW1hc3RlcnBpZWNlOm5vdChbaGlkZGVuXSknKSkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLW1hc3RlcnBpZWNlLWhlYWRlcicpLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICB9XG5cbiAgICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tbWVtb3JhYmlsaWE6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tbWVtb3JhYmlsaWEtaGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cblxuICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1wbGFuZWNoYXNlOm5vdChbaGlkZGVuXSknKSkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXBsYW5lY2hhc2UtaGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cblxuICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1wcmVtaXVtX2RlY2s6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tcHJlbWl1bV9kZWNrLWhlYWRlcicpLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICB9XG5cbiAgICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tcHJvbW86bm90KFtoaWRkZW5dKScpKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tcHJvbW8taGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cblxuICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1zcGVsbGJvb2s6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tc3BlbGxib29rLWhlYWRlcicpLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICB9XG5cbiAgICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tc3RhcnRlcjpub3QoW2hpZGRlbl0pJykpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1zdGFydGVyLWhlYWRlcicpLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICB9XG5cbiAgICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tdG9rZW46bm90KFtoaWRkZW5dKScpKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tdG9rZW4taGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cblxuICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS10cmVhc3VyZV9jaGVzdDpub3QoW2hpZGRlbl0pJykpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS10cmVhc3VyZV9jaGVzdC1oZWFkZXInKS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gICAgfVxuXG4gICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXZhbmd1YXJkOm5vdChbaGlkZGVuXSknKSkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXZhbmd1YXJkLWhlYWRlcicpLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjb25zdCBmaWx0ZXJTZXRzID0gc3RyID0+IHtcbiAgICAvLyBnZXQgYWxsIG9mIHRoZSBzZXRzIG91dCBvZiB0aGUgZHJvcGRvd24gbGlzdFxuICAgIGNvbnN0IHNldHMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLXNldC1uYW1lXScpKTtcblxuICAgIC8vIFJlbW92ZSB0aGUgaGlkZGVuIGF0dHJpYnV0ZSBpZiBpdCBleGlzdHMgb24gYW55IGVsZW1lbnQsIGFuZCB0aGVuIGhpZGUgYW55IGVsZW1lbnRzXG4gICAgLy8gdGhhdCBkb24ndCBpbmNsdWRlIHRoZSBzdHJpbmcgZ2l2ZW4gaW4gdGhlIGlucHV0IGZyb20gdGhlIHVzZXJcbiAgICBzZXRzLmZvckVhY2gocyA9PiB7ICAgICAgICBcbiAgICAgICAgaWYgKHMuaGFzQXR0cmlidXRlKCdoaWRkZW4nKSkgcy5yZW1vdmVBdHRyaWJ1dGUoJ2hpZGRlbicpO1xuXG4gICAgICAgIGZpbHRlclNlbGVjdGVkU2V0cygpO1xuXG4gICAgICAgIGlmICghcy5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2V0LW5hbWUnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHN0ci50b0xvd2VyQ2FzZSgpKSAmJlxuICAgICAgICAgICFzLmdldEF0dHJpYnV0ZSgnZGF0YS1zZXQtY29kZScpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc3RyLnRvTG93ZXJDYXNlKCkpKSB7ICAgICAgICAgICAgXG4gICAgICAgICAgICBzLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICAgICAgfVxuICAgIH0pXG59XG5cbmNvbnN0IGZpbHRlclNlbGVjdGVkU2V0cyA9ICgpID0+IHtcbiAgICBjb25zdCBzZXRzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1zZXQtbmFtZV1bZGF0YS1zZWxlY3RlZF0nKSk7XG5cbiAgICBzZXRzLmZvckVhY2gocyA9PiB7XG4gICAgICAgIGlmIChzLmdldEF0dHJpYnV0ZSgnZGF0YS1zZWxlY3RlZCcpID09PSAndHJ1ZScpIHtcbiAgICAgICAgICAgIGlmICghcy5oYXNBdHRyaWJ1dGUoJ2hpZGRlbicpKSBzLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICAgICAgfVxuICAgIH0pXG59XG5cbmNvbnN0IGhpZ2hsaWdodFNldCA9IHNldHQgPT4ge1xuICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWhpZ2hsaWdodGVkJykpIHJlbW92ZUN1cnJlbnRIaWdobGlnaHQoKTtcblxuICAgIGlmIChzZXR0KSB7XG4gICAgICAgIHNldHQuY2xhc3NMaXN0LmFkZChcbiAgICAgICAgICAgICdqcy0taGlnaGxpZ2h0ZWQnLCAnc2VhcmNoLWZvcm1fX2Ryb3Bkb3duLWxpc3Qtb3B0aW9uLS1oaWdobGlnaHRlZCdcbiAgICAgICAgKTtcbiAgICB9XG59O1xuXG5jb25zdCBuYXZpZ2F0ZVNldHNEcm9wRG93biA9IGUgPT4ge1xuICAgIGNvbnN0IHNldHMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tc2V0Om5vdChbaGlkZGVuXSknKSk7XG4gICAgY29uc3QgaSA9IHNldHMuaW5kZXhPZihkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWhpZ2hsaWdodGVkJykpO1xuXG4gICAgaWYgKGUuY29kZSA9PT0gJ0Fycm93RG93bicgJiYgaSA8IHNldHMubGVuZ3RoIC0gMSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHJlbW92ZUN1cnJlbnRIaWdobGlnaHQoKVxuICAgICAgICBoaWdobGlnaHRTZXQoc2V0c1tpICsgMV0pO1xuXG4gICAgICAgIHNldFNjcm9sbFRvcE9uRG93bkFycm93KHNldHNbaSArIDFdLCBlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd24pO1xuICAgIH1cblxuICAgIGlmIChlLmNvZGUgPT09ICdBcnJvd1VwJyAmJiBpID4gMCkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHJlbW92ZUN1cnJlbnRIaWdobGlnaHQoKVxuICAgICAgICBoaWdobGlnaHRTZXQoc2V0c1tpIC0gMV0pO1xuXG4gICAgICAgIHNldFNjcm9sbFRvcE9uVXBBcnJvdyhzZXRzW2kgLSAxXSwgZWxlbWVudHMuYXBpU2VhcmNoLnNldERyb3BEb3duKTtcbiAgICB9XG5cbiAgICBpZiAoZS5jb2RlID09PSAnRW50ZXInKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICB0b2dnbGVEYXRhU2VsZWN0ZWQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1oaWdobGlnaHRlZCcpKTtcbiAgICAgICAgYWRkU2V0KFxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1oaWdobGlnaHRlZCcpLmdldEF0dHJpYnV0ZSgnZGF0YS1zZXQtbmFtZScpLFxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1oaWdobGlnaHRlZCcpLmdldEF0dHJpYnV0ZSgnZGF0YS1zZXQtY29kZScpXG4gICAgICAgICk7XG4gICAgICAgIGhpZGVTZXRzRHJvcERvd24oKTtcbiAgICB9XG59O1xuXG5jb25zdCBob3Zlck92ZXJTZXRzTGlzdGVuZXIgPSAoKSA9PiB7XG4gICAgY29uc3Qgc2V0cyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1zZXQ6bm90KFtoaWRkZW5dKScpKTtcblxuICAgIHNldHMuZm9yRWFjaChzID0+IHtcbiAgICAgICAgcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgKCkgPT4gaGlnaGxpZ2h0VHlwZShzKSk7XG4gICAgfSlcbn1cblxuZXhwb3J0IGNvbnN0IHN0YXJ0U2V0c0Ryb3BEb3duTmF2aWdhdGlvbiA9ICgpID0+IHtcbiAgICBjb25zdCBmaXJzdFNldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tc2V0Om5vdChbaGlkZGVuXSknKTtcbiAgICBoaWdobGlnaHRTZXQoZmlyc3RTZXQpO1xuICAgIGhvdmVyT3ZlclNldHNMaXN0ZW5lcigpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBuYXZpZ2F0ZVNldHNEcm9wRG93bik7XG4gICAgZWxlbWVudHMuYXBpU2VhcmNoLnNldERyb3BEb3duLnNjcm9sbFRvcCA9IDA7XG59XG5cbmNvbnN0IHJlbW92ZVNldEJ0biA9ICgpID0+IHtcbiAgICAvLyBTcGFuIHdpbGwgYWN0IGFzIHRoZSBidXR0b24gdG8gcmVtb3ZlIHNldHMgZnJvbSB0aGUgXCJzZWxlY3RlZFwiIGxpc3RcbiAgICBjb25zdCBidG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgYnRuLmNsYXNzTGlzdCA9ICdzZWFyY2gtZm9ybV9fc2VsZWN0ZWQtc2V0cy1yZW1vdmUtYnRuIGpzLS1hcGktc2V0cy1jbG9zZS1idG4nO1xuICAgIGJ0bi5pbm5lckhUTUwgPSAneCc7XG5cbiAgICBidG4ub25jbGljayA9ICgpID0+IHtcbiAgICAgICAgY29uc3Qgc2V0TmFtZSA9IGJ0bi5uZXh0RWxlbWVudFNpYmxpbmcuaW5uZXJIVE1MOyAgICAgICAgXG4gICAgICAgIGNvbnN0IHNldFRvVG9nZ2xlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2RhdGEtc2V0LW5hbWV8PSR7c2V0TmFtZX1dYClcbiAgICAgICAgdG9nZ2xlRGF0YVNlbGVjdGVkKHNldFRvVG9nZ2xlKTtcblxuICAgICAgICBidG4ucGFyZW50RWxlbWVudC5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKGJ0bi5wYXJlbnRFbGVtZW50KVxuICAgIH1cblxuICAgIHJldHVybiBidG47XG59XG5cbmNvbnN0IGFkZFNldCA9IChzZXROYW1lLCBzZXRDb2RlKSA9PiB7XG4gICAgLy8gQ3JlYXRlIHRoZSBlbXB0eSBsaSBlbGVtZW50IHRvIGhvbGQgdGhlIHR5cGVzIHRoYXQgdGhlIHVzZXIgc2VsZWN0cy4gU2V0IHRoZSBjbGFzcyBsaXN0LFxuICAgIC8vIGFuZCB0aGUgZGF0YS1zZWxlY3RlZCBhdHRyaWJ1dGUgdG8gdHJ1ZS5cbiAgICBjb25zdCBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG4gICAgbGkuY2xhc3NMaXN0ID0gJ3NlYXJjaC1mb3JtX19zZWxlY3RlZC1zZXRzLWxpc3QtaXRlbSBqcy0tYXBpLXNlbGVjdGVkLXNldCc7XG5cbiAgICAvLyBUaGUgdHlwZVNwYW4gaG9sZHMgdGhlIHR5cGUgc2VsZWN0ZWQgYnkgdGhlIHVzZXIgZnJvbSB0aGUgZHJvcGRvd24uIFRoZSBkYXRhIGF0dHJpYnV0ZVxuICAgIC8vIGlzIHVzZWQgaW4gU2VhcmNoLmpzIHRvIGJ1aWxkIHRoZSBxdWVyeSBzdHJpbmdcbiAgICBjb25zdCBzZXRTcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgIHNldFNwYW4uc2V0QXR0cmlidXRlKCdkYXRhLWluY2x1ZGUtc2V0Jywgc2V0Q29kZSk7XG4gICAgc2V0U3Bhbi5pbm5lckhUTUwgPSBzZXROYW1lO1xuXG4gICAgbGkuYXBwZW5kQ2hpbGQocmVtb3ZlU2V0QnRuKCkpO1xuICAgIGxpLmFwcGVuZENoaWxkKHNldFNwYW4pO1xuXG4gICAgZWxlbWVudHMuYXBpU2VhcmNoLnNlbGVjdGVkU2V0cy5hcHBlbmRDaGlsZChsaSk7XG59XG5cbmV4cG9ydCBjb25zdCBzZXRJbnB1dExpc3RlbmVyID0gZSA9PiB7XG4gICAgLy8gSWYgdGhlIHRhcmdldCBpcyBub3QgdGhlIHNldCBpbnB1dCBmaWVsZCwgb3IgYW4gZWxlbWVudCBpbiB0aGUgZHJvcGRvd24gbGlzdCwgXG4gICAgLy8gY2xvc2UgdGhlIGRyb3Bkb3duIGFuZCByZW1vdmUgdGhlIGV2ZW50IGxpc3RlbmVyIFxuICAgIGlmIChlLnRhcmdldCAhPT0gZWxlbWVudHMuYXBpU2VhcmNoLnNldElucHV0ICYmIFxuICAgICAgIWUudGFyZ2V0Lm1hdGNoZXMoJy5qcy0tYXBpLWRyb3Bkb3duLXNldHMtbGlzdCcpKSB7XG4gICAgICAgIGhpZGVTZXRzRHJvcERvd24oKTtcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzZXRJbnB1dExpc3RlbmVyKTtcbiAgICAvLyBJZiB0aGUgdGFyZ2V0IGlzIG9uZSBvZiB0aGUgc2V0IG9wdGlvbnMsIHRvZ2dsZSBpdCBhcyBzZWxlY3RlZCwgYWRkIGl0IHRvIHRoZSBsaXN0LFxuICAgIC8vIGFuZCBoaWRlIHRoZSBkcm9wZG93bi5cbiAgICB9IGVsc2UgaWYgKGUudGFyZ2V0Lmhhc0F0dHJpYnV0ZSgnZGF0YS1zZXQtbmFtZScpKSB7XG4gICAgICAgIHRvZ2dsZURhdGFTZWxlY3RlZChlLnRhcmdldCk7XG4gICAgICAgIGFkZFNldChcbiAgICAgICAgICAgIGUudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1zZXQtbmFtZScpLFxuICAgICAgICAgICAgZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXNldC1jb2RlJylcbiAgICAgICAgKTtcbiAgICAgICAgZWxlbWVudHMuYXBpU2VhcmNoLnNldElucHV0LmZvY3VzKCk7XG4gICAgICAgIGhpZGVTZXRzRHJvcERvd24oKTtcbiAgICB9XG59XG5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKioqIFNUQVRTICoqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcblxuZXhwb3J0IGNvbnN0IHN0YXRMaW5lQ29udHJvbGxlciA9ICgpID0+IHtcbiAgICBpZiAoY2hlY2tTdGF0TGluZUZvckludGVnZXIoKSAmJiBjaGVja0Zvckxlc3NUaGFuRm91clN0YXRMaW5lcygpKSB7XG4gICAgICAgIGNvbnN0IGNsb25lID0gY3JlYXRlU3RhdHNDbG9uZSgpO1xuICAgICAgICBlZGl0U3RhdHNDbG9uZShjbG9uZSk7XG4gICAgICAgIGluc2VydFN0YXRzQ2xvbmUoY2xvbmUpO1xuICAgICAgICByZXNldFN0YXRMaW5lRXZlbnRMaXN0ZW5lcigpO1xuICAgIH1cbn1cblxuY29uc3QgY2hlY2tTdGF0TGluZUZvckludGVnZXIgPSAoKSA9PiB7XG4gICAgY29uc3Qgc3RhdFZhbCA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgJy5qcy0tYXBpLXN0YXQtdmFsdWUnXG4gICAgKSkuc2xpY2UoLTEpWzBdO1xuXG4gICAgcmV0dXJuIChwYXJzZUludChzdGF0VmFsLnZhbHVlKSA+PSAwID8gdHJ1ZSA6IGZhbHNlKTtcbn07XG5cbmNvbnN0IGNoZWNrRm9yTGVzc1RoYW5Gb3VyU3RhdExpbmVzID0gKCkgPT4ge1xuICAgIGNvbnN0IHN0YXRzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWFwaS1zdGF0LXZhbHVlJykpO1xuXG4gICAgcmV0dXJuIChzdGF0cy5sZW5ndGggPCA0ID8gdHJ1ZSA6IGZhbHNlKTtcbn1cblxuY29uc3QgY3JlYXRlU3RhdHNDbG9uZSA9ICgpID0+IHtcbiAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktc3RhdHMtd3JhcHBlcicpLmNsb25lTm9kZSh0cnVlKTsgXG59O1xuXG5jb25zdCBlZGl0U3RhdHNDbG9uZSA9IGNsb25lID0+IHtcbiAgICBjbG9uZS5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1zdGF0JykudmFsdWUgPSAnJztcbiAgICBjbG9uZS5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1zdGF0LWZpbHRlcicpLnZhbHVlID0gJyc7XG4gICAgY2xvbmUucXVlcnlTZWxlY3RvcignLmpzLS1hcGktc3RhdC12YWx1ZScpLnZhbHVlID0gJyc7ICAgXG59XG5cbmNvbnN0IGluc2VydFN0YXRzQ2xvbmUgPSBjbG9uZSA9PiB7XG4gICAgY29uc3QgbGFzdFN0YXRMaW5lID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAnLmpzLS1hcGktc3RhdHMtd3JhcHBlcidcbiAgICApKS5zbGljZSgtMSlbMF07XG5cbiAgICBsYXN0U3RhdExpbmUuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdhZnRlcmVuZCcsIGNsb25lKTtcbn1cblxuY29uc3QgcmVzZXRTdGF0TGluZUV2ZW50TGlzdGVuZXIgPSAoKSA9PiB7XG4gICAgY29uc3Qgc3RhdFZhbHVlcyA9IEFycmF5LmZyb20oXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tYXBpLXN0YXQtdmFsdWUnKVxuICAgICk7XG4gICAgc3RhdFZhbHVlcy5zbGljZSgtMilbMF0ucmVtb3ZlRXZlbnRMaXN0ZW5lcignaW5wdXQnLCBzdGF0TGluZUNvbnRyb2xsZXIpO1xuICAgIHN0YXRWYWx1ZXMuc2xpY2UoLTEpWzBdLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0Jywgc3RhdExpbmVDb250cm9sbGVyKTtcbn1cblxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0aWYoX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSkge1xuXHRcdHJldHVybiBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0aWQ6IG1vZHVsZUlkLFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiBtb2R1bGVbJ2RlZmF1bHQnXSA6XG5cdFx0KCkgPT4gbW9kdWxlO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5nID0gKGZ1bmN0aW9uKCkge1xuXHRpZiAodHlwZW9mIGdsb2JhbFRoaXMgPT09ICdvYmplY3QnKSByZXR1cm4gZ2xvYmFsVGhpcztcblx0dHJ5IHtcblx0XHRyZXR1cm4gdGhpcyB8fCBuZXcgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JykgcmV0dXJuIHdpbmRvdztcblx0fVxufSkoKTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsInZhciBzY3JpcHRVcmw7XG5pZiAoX193ZWJwYWNrX3JlcXVpcmVfXy5nLmltcG9ydFNjcmlwdHMpIHNjcmlwdFVybCA9IF9fd2VicGFja19yZXF1aXJlX18uZy5sb2NhdGlvbiArIFwiXCI7XG52YXIgZG9jdW1lbnQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLmcuZG9jdW1lbnQ7XG5pZiAoIXNjcmlwdFVybCAmJiBkb2N1bWVudCkge1xuXHRpZiAoZG9jdW1lbnQuY3VycmVudFNjcmlwdClcblx0XHRzY3JpcHRVcmwgPSBkb2N1bWVudC5jdXJyZW50U2NyaXB0LnNyY1xuXHRpZiAoIXNjcmlwdFVybCkge1xuXHRcdHZhciBzY3JpcHRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJzY3JpcHRcIik7XG5cdFx0aWYoc2NyaXB0cy5sZW5ndGgpIHNjcmlwdFVybCA9IHNjcmlwdHNbc2NyaXB0cy5sZW5ndGggLSAxXS5zcmNcblx0fVxufVxuLy8gV2hlbiBzdXBwb3J0aW5nIGJyb3dzZXJzIHdoZXJlIGFuIGF1dG9tYXRpYyBwdWJsaWNQYXRoIGlzIG5vdCBzdXBwb3J0ZWQgeW91IG11c3Qgc3BlY2lmeSBhbiBvdXRwdXQucHVibGljUGF0aCBtYW51YWxseSB2aWEgY29uZmlndXJhdGlvblxuLy8gb3IgcGFzcyBhbiBlbXB0eSBzdHJpbmcgKFwiXCIpIGFuZCBzZXQgdGhlIF9fd2VicGFja19wdWJsaWNfcGF0aF9fIHZhcmlhYmxlIGZyb20geW91ciBjb2RlIHRvIHVzZSB5b3VyIG93biBsb2dpYy5cbmlmICghc2NyaXB0VXJsKSB0aHJvdyBuZXcgRXJyb3IoXCJBdXRvbWF0aWMgcHVibGljUGF0aCBpcyBub3Qgc3VwcG9ydGVkIGluIHRoaXMgYnJvd3NlclwiKTtcbnNjcmlwdFVybCA9IHNjcmlwdFVybC5yZXBsYWNlKC8jLiokLywgXCJcIikucmVwbGFjZSgvXFw/LiokLywgXCJcIikucmVwbGFjZSgvXFwvW15cXC9dKyQvLCBcIi9cIik7XG5fX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBzY3JpcHRVcmw7IiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGVcbl9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9qcy9pbmRleC5qc1wiKTtcbi8vIFRoaXMgZW50cnkgbW9kdWxlIHVzZWQgJ2V4cG9ydHMnIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbiJdLCJzb3VyY2VSb290IjoiIn0=