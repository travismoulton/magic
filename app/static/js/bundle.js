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
___CSS_LOADER_EXPORT___.push([module.id, "*,\n*::after,\n*::before {\n  margin: 0;\n  padding: 0;\n  box-sizing: inherit; }\n\nhtml {\n  font-size: 62.5%; }\n\nbody {\n  box-sizing: border-box;\n  overflow-x: hidden;\n  font-size: 1.6rem;\n  background-size: cover;\n  background-repeat: no-repeat;\n  height: 127.5rem;\n  font-family: 'Lato', sans-serif; }\n\n[hidden] {\n  display: none !important; }\n\n.heading-tertiary {\n  font-size: 2.4rem;\n  text-transform: uppercase; }\n  .heading-tertiary--white {\n    color: #fff; }\n\n.mb-10 {\n  margin-bottom: 1rem; }\n\n.mb-20 {\n  margin-bottom: 2rem; }\n\n.mt-50 {\n  margin-top: 5rem; }\n\n.btn, .btn:link, .btn:visited {\n  padding: .75rem 2rem;\n  border-radius: .5rem;\n  background-color: #f2f2f2;\n  font-weight: 400;\n  display: inline-block; }\n\n.btn:active, .btn:focus {\n  outline: none;\n  transform: translateY(-1px);\n  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.2); }\n\n.login-form__group:not(:last-child) {\n  margin-bottom: 2.5rem; }\n\n.login-form__label {\n  margin-right: .7rem;\n  color: #fff;\n  font-size: 1.8rem;\n  font-weight: 400; }\n\n.login-form__input {\n  background-color: #fff;\n  padding: .5rem 0;\n  border: none; }\n\n.login-form__btn-wrapper {\n  display: flex;\n  justify-content: center; }\n\n.login__register-text {\n  margin-top: 1.5rem;\n  color: #fff; }\n\n.login__register-link {\n  text-decoration: none;\n  color: #fff;\n  transition: all .2s; }\n  .login__register-link:hover {\n    color: #ff8000;\n    text-decoration: underline; }\n\n.nav {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 2rem 6rem;\n  background-color: #fff;\n  border-bottom: 1px solid #000; }\n  .nav__item {\n    list-style: none; }\n    .nav__item--search {\n      flex: 0 0 25%; }\n  .nav__link {\n    text-decoration: none;\n    color: #000;\n    transition: all .2s; }\n    .nav__link:hover {\n      margin-bottom: 2px;\n      color: #ffa64d;\n      border-bottom: 1px solid #ffa64d; }\n    .nav__link--home:hover .nav__icon-path--home {\n      fill: #ff8000; }\n  .nav__search {\n    display: flex;\n    justify-content: center;\n    align-items: center; }\n    .nav__search-input {\n      width: 90%;\n      border-radius: 3rem;\n      padding: 1rem 2rem;\n      border: 1px solid #bfbfbf;\n      background-color: #f2f2f2;\n      transition: width .2s; }\n      .nav__search-input:focus {\n        outline: none;\n        width: 120%; }\n    .nav__search-btn {\n      cursor: pointer; }\n  .nav__icon-sizing--home {\n    width: 3rem;\n    height: 3rem; }\n  .nav__icon-sizing--search {\n    width: 2rem;\n    height: 2rem;\n    transform: translateX(-150%); }\n  .nav__icon-path {\n    fill: #bfbfbf; }\n\n.register-form__group {\n  display: flex;\n  justify-content: space-between;\n  align-items: center; }\n  .register-form__group:not(:last-child) {\n    margin-bottom: 3rem; }\n\n.register-form__label {\n  margin-right: 4rem;\n  color: #fff;\n  font-size: 1.8rem;\n  font-weight: 400; }\n\n.register-form__input {\n  background-color: #f2f2f2;\n  padding: .5rem 0;\n  border: none; }\n\n.register-form__btn-wrapper {\n  display: flex;\n  justify-content: center; }\n\n.register__login-text {\n  margin-top: 1.5rem;\n  color: #fff; }\n\n.register__login-link {\n  text-decoration: none;\n  color: #fff;\n  transition: all .2s; }\n  .register__login-link:hover {\n    color: #ff8000;\n    text-decoration: underline; }\n\n.error {\n  margin-top: 2rem;\n  text-align: center;\n  background-color: #ff8080;\n  border-radius: 10px;\n  padding: 2rem;\n  font-size: 2rem;\n  grid-column: center-start / center-end;\n  font-weight: 700; }\n\n.search-form {\n  padding: 2rem 25rem; }\n  .search-form__group {\n    width: 75%;\n    display: flex;\n    margin-bottom: 3rem;\n    border-bottom: 1px solid #000;\n    align-items: flex-start;\n    padding: .5rem 4rem .5rem 0; }\n  .search-form__label {\n    flex: 0 0 20%;\n    display: flex;\n    align-items: flex-start;\n    margin-top: .7rem; }\n  .search-form__group-input-wrapper {\n    flex: 0 0 80%; }\n  .search-form__tip {\n    font-size: 1rem;\n    line-height: 1.4;\n    width: 70%; }\n  .search-form__input-text {\n    width: 40rem;\n    height: 4rem;\n    margin-bottom: 1rem;\n    padding: 1rem;\n    border: solid 1px #bfbfbf;\n    border-radius: 5px; }\n    .search-form__input-text:focus {\n      border: solid 1px #000; }\n  .search-form__input-integer--relative {\n    position: relative; }\n  .search-form__group--checkbox {\n    display: flex;\n    margin-bottom: 1rem; }\n  .search-form__label--checkbox {\n    margin-right: 1rem; }\n  .search-form__input-checkbox {\n    width: 2.25rem;\n    height: 2.25rem;\n    margin-right: .8rem; }\n  .search-form__checkbox-wrapper {\n    display: flex;\n    align-items: center; }\n  .search-form__select-menu {\n    margin-bottom: 1rem; }\n  .search-form__svg-size {\n    height: 2rem;\n    width: 2rem;\n    margin-right: 1rem; }\n  .search-form__submit {\n    border-radius: 3px;\n    padding: .7rem;\n    border: 1px solid #b300b3; }\n  .search-form__dropdown-span {\n    display: flex;\n    flex-direction: column; }\n  .search-form__selected-types, .search-form__selected-sets {\n    display: flex;\n    flex-direction: column;\n    list-style: none;\n    margin-bottom: .3rem; }\n  .search-form__selected-types-list-item, .search-form__selected-sets-list-item {\n    display: flex;\n    margin-bottom: .7rem; }\n  .search-form__selected-types-remove-btn, .search-form__selected-sets-remove-btn {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    cursor: pointer;\n    height: 2rem;\n    width: 2rem;\n    font-size: 1.3rem;\n    background-color: #f2f2f2;\n    margin-right: .7rem; }\n  .search-form__selected-types-toggler {\n    height: 2rem;\n    width: 2.75rem;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    cursor: pointer;\n    font-size: 1.3rem;\n    margin-right: .7rem; }\n    .search-form__selected-types-toggler--is {\n      background-color: #47d147; }\n    .search-form__selected-types-toggler--not {\n      background-color: #ff0000; }\n  .search-form__dropdown {\n    position: absolute;\n    max-height: 28rem;\n    background-color: #fff;\n    z-index: 2;\n    top: 100%;\n    width: 40rem;\n    margin-top: -1rem;\n    overflow-y: auto;\n    border: 1px solid #000; }\n    .search-form__dropdown-list {\n      list-style: none; }\n      .search-form__dropdown-list-category {\n        padding: .5rem; }\n      .search-form__dropdown-list-option {\n        padding: .3rem 2rem;\n        display: flex;\n        align-items: center; }\n        .search-form__dropdown-list-option:hover {\n          cursor: pointer; }\n        .search-form__dropdown-list-option--highlighted {\n          background-color: #ccd8ff; }\n        .search-form__dropdown-list-option span {\n          text-transform: uppercase;\n          margin-left: 1rem; }\n      .search-form__dropdown-list-img {\n        width: 2rem;\n        height: 2rem;\n        margin-right: .7rem; }\n\n.dropdown-wrapper {\n  position: relative; }\n\n.inv-search-price-msg {\n  position: absolute;\n  bottom: 0;\n  right: 0;\n  color: red; }\n\n.relative {\n  position: relative; }\n\n.api-results-display__nav {\n  background-color: #99b1ff;\n  width: 100%;\n  display: flex;\n  justify-content: space-between;\n  padding: 0 10%;\n  margin-bottom: .1rem; }\n  .api-results-display__nav-select {\n    color: #b300b3;\n    margin-right: 1rem; }\n  .api-results-display__nav-label {\n    color: #b300b3; }\n  .api-results-display__nav-right {\n    display: flex;\n    align-items: center; }\n  .api-results-display__nav-pagination-container {\n    display: flex;\n    align-items: center;\n    background-color: #ccd8ff;\n    cursor: pointer; }\n    .api-results-display__nav-pagination-container:not(:last-child) {\n      margin-right: 3rem; }\n    .api-results-display__nav-pagination-container--disabled {\n      cursor: not-allowed;\n      background-color: rgba(204, 216, 255, 0.4); }\n  .api-results-display__nav-svg-size {\n    height: 2rem;\n    width: 2rem; }\n\n.api-results-display__display-bar {\n  width: 100%;\n  border-bottom: 1px solid #bfbfbf;\n  padding-left: 10%;\n  margin-bottom: 2rem; }\n\n.card-checklist {\n  width: 80%;\n  justify-self: center; }\n  .card-checklist__row {\n    display: grid; }\n    .card-checklist__row--7 {\n      grid-template-columns: repeat(7, 1fr); }\n    .card-checklist__row--9 {\n      grid-template-columns: repeat(9, 1fr); }\n    .card-checklist__row--header {\n      border-bottom: 1px solid #000; }\n    .card-checklist__row--grey {\n      background-color: #f2f2f2; }\n    .card-checklist__row:nth-child(even) {\n      background-color: #f2f2f2; }\n  .card-checklist__data {\n    display: flex;\n    flex-wrap: nowrap;\n    justify-content: center;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    font-size: 1.4rem; }\n    .card-checklist__data--set {\n      text-transform: uppercase; }\n    .card-checklist__data--rarity {\n      text-transform: capitalize; }\n    .card-checklist__data--name {\n      white-space: nowrap;\n      justify-content: flex-start; }\n  .card-checklist__data-link {\n    padding: 1rem 0;\n    display: flex;\n    flex-wrap: nowrap;\n    align-items: center;\n    text-decoration: none;\n    width: 100%;\n    color: #000;\n    white-space: nowrap; }\n    .card-checklist__data-link--start {\n      justify-content: flex-start; }\n    .card-checklist__data-link--center {\n      justify-content: center; }\n\n.tooltip {\n  position: absolute;\n  z-index: 5;\n  width: 24rem;\n  height: 34rem; }\n  .tooltip__img {\n    width: 100%;\n    height: 100%; }\n\n.negative-earnings {\n  color: red; }\n\n.positive-earnings {\n  color: green; }\n\n.image-grid {\n  padding: 10rem 15rem;\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(25rem, 1fr));\n  grid-column-gap: 2rem;\n  grid-row-gap: 1rem; }\n  .image-grid__outer-div {\n    position: relative; }\n  .image-grid__inner-div {\n    perspective: 150rem;\n    height: 34rem;\n    width: 24rem; }\n  .image-grid__double {\n    height: 34rem;\n    width: 24rem;\n    position: absolute;\n    top: 0;\n    left: 0;\n    backface-visibility: hidden;\n    overflow: hidden;\n    transition: all .8s ease; }\n    .image-grid__double--back {\n      transform: rotateY(180deg); }\n  .image-grid__double-btn {\n    position: absolute;\n    top: 50%;\n    right: 15%;\n    width: 4rem;\n    height: 4rem;\n    border-radius: 50%;\n    background-color: rgba(255, 255, 255, 0.4); }\n  .image-grid__container {\n    width: 24rem;\n    height: 34rem; }\n  .image-grid__image {\n    width: 100%;\n    height: 100%; }\n\n.card {\n  display: flex;\n  margin-top: 3rem; }\n  .card__img-container {\n    margin-right: 10rem; }\n  .card__img {\n    width: 33rem;\n    height: 46rem; }\n  .card__img-left {\n    margin-right: 10rem;\n    width: 33rem;\n    display: flex;\n    flex-direction: column; }\n  .card__img-btn {\n    justify-self: flex-end;\n    align-self: flex-end;\n    margin-top: auto; }\n  .card__img-double-area {\n    position: relative; }\n  .card__img-double-sided {\n    perspective: 150rem;\n    height: 46rem; }\n  .card__img-double {\n    width: 33rem;\n    height: 46rem;\n    position: absolute;\n    top: 0;\n    left: 0;\n    backface-visibility: hidden;\n    overflow: hidden; }\n    .card__img-double--back {\n      transform: rotateY(180deg); }\n  .card__text {\n    background-color: #f4f4d7;\n    width: 34rem;\n    display: flex;\n    flex-direction: column;\n    padding: 1rem;\n    margin-right: 3rem; }\n    .card__text-flex {\n      margin-bottom: 1rem;\n      border-bottom: 1px solid #bfbfbf; }\n    .card__text-title {\n      display: flex;\n      align-items: center; }\n      .card__text-title-h3 {\n        font-size: 1.8rem;\n        font-weight: 400;\n        margin-right: 1rem; }\n    .card__text-color-indicator {\n      width: 1.3rem;\n      height: 1.3rem;\n      border: 1px solid #333;\n      border-radius: 50%;\n      box-shadow: 0px 0px 0px 2px rgba(0, 0, 0, 0.2);\n      margin-right: .7rem;\n      display: inline-block; }\n      .card__text-color-indicator--U {\n        background-color: rgba(128, 128, 255, 0.7); }\n      .card__text-color-indicator--B {\n        background-color: rgba(0, 0, 0, 0.7); }\n      .card__text-color-indicator--R {\n        background-color: rgba(255, 77, 77, 0.7); }\n      .card__text-color-indicator--W {\n        background-color: rgba(255, 255, 255, 0.7); }\n      .card__text-color-indicator--G {\n        background-color: rgba(0, 255, 0, 0.7); }\n    .card__text-oracle-p {\n      margin-bottom: 1rem;\n      font-size: 1.3rem; }\n    .card__text-oracle-flavor {\n      font-size: 1.3rem;\n      font-style: italic; }\n    .card__text-illustrator {\n      font-size: 1.2rem;\n      font-style: italic; }\n    .card__text-legal {\n      display: flex;\n      flex-direction: row;\n      justify-content: space-between; }\n      .card__text-legal-half {\n        display: flex;\n        flex-direction: column; }\n      .card__text-legal-span-container {\n        display: flex;\n        align-items: center; }\n        .card__text-legal-span-container:not(:last-child) {\n          margin-bottom: .5rem; }\n      .card__text-legal-span-box {\n        width: 6rem;\n        height: 2.5rem;\n        border: 1px solid #000;\n        margin-right: .3rem;\n        font-size: 1rem;\n        text-transform: uppercase;\n        display: flex;\n        justify-content: center;\n        align-items: center; }\n        .card__text-legal-span-box--not_legal {\n          background-color: #ff0000; }\n        .card__text-legal-span-box--legal {\n          background-color: #47d147; }\n  .card__set {\n    display: flex;\n    flex-direction: column; }\n    .card__set-banner {\n      display: flex;\n      border: 1px solid #bfbfbf;\n      width: 40rem;\n      background-color: #000;\n      color: #fff; }\n      .card__set-banner-svg-container {\n        margin-right: 1rem; }\n      .card__set-banner-svg {\n        width: 2.4rem;\n        height: 2.4rem;\n        filter: invert(100%); }\n    .card__set-details {\n      display: flex;\n      flex-direction: column; }\n    .card__set-header-name {\n      font-size: 1.7remrem; }\n    .card__set-header-code {\n      text-transform: uppercase; }\n    .card__set-prints-header {\n      display: flex;\n      justify-content: space-between;\n      background-color: #000;\n      color: #fff;\n      font-size: 1.3rem;\n      text-transform: uppercase;\n      border: 1px solid #bfbfbf;\n      padding: .3rem .7rem; }\n    .card__set-prints-svg-container {\n      height: 1.8rem;\n      width: 1.8rem;\n      border: 1px solid #bfbfbf;\n      display: flex;\n      justify-content: center;\n      align-items: center;\n      border-radius: 100%; }\n    .card__set-prints-svg--common {\n      fill: #000; }\n    .card__set-prints-svg--uncommon {\n      fill: #e6e6e6; }\n    .card__set-prints-svg--rare {\n      fill: #e6c300; }\n    .card__set-prints-svg--mythic {\n      fill: #ff0000; }\n    .card__set-prints-list {\n      list-style: none; }\n      .card__set-prints-list-link:link, .card__set-prints-list-link:visited {\n        text-decoration: none;\n        color: #000; }\n      .card__set-prints-list-item {\n        display: flex;\n        justify-content: space-between;\n        cursor: pointer; }\n        .card__set-prints-list-item:hover {\n          background-color: #f2f2f2; }\n      .card__set-prints-list-item-name-wrapper {\n        display: flex;\n        align-items: center;\n        margin-left: -1rem; }\n      .card__set-prints-list-item-set-name {\n        margin-left: .5rem; }\n      .card__set-prints-list-item-price {\n        margin-right: .7rem; }\n\n.card-page {\n  display: flex;\n  flex-direction: column;\n  grid-column: center-start / center-end; }\n\n.add-to-inv {\n  margin-top: 3rem;\n  width: 50%; }\n  .add-to-inv__form {\n    display: flex;\n    flex-direction: column; }\n    .add-to-inv__form-group {\n      display: flex;\n      align-content: center;\n      margin-bottom: 3rem;\n      position: relative; }\n    .add-to-inv__form-label {\n      margin-right: .3rem; }\n  .add-to-inv-price-msg {\n    position: absolute;\n    bottom: -1.8rem;\n    right: 25%;\n    color: red; }\n\n.no-results {\n  justify-self: center; }\n\n.container {\n  display: grid;\n  grid-template-columns: [full-start] minmax(6rem, 1fr) [center-start] repeat(8, [col-start] minmax(min-content, 14rem) [col-end]) [center-end] minmax(6rem, 1fr) [full-end]; }\n\n.login,\n.register {\n  margin-top: 5rem;\n  grid-column: center-start / center-end;\n  background-image: linear-gradient(to right bottom, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  height: 75vh;\n  background-size: cover;\n  background-position: center; }\n\n.search {\n  grid-column: full-start / full-end;\n  background-color: #fff; }\n\n.api-results-display {\n  grid-column: full-start / full-end;\n  background-color: #fff;\n  display: grid; }\n", "",{"version":3,"sources":["webpack://src/css/style.css"],"names":[],"mappings":"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","sourcesContent":["*,\n*::after,\n*::before {\n  margin: 0;\n  padding: 0;\n  box-sizing: inherit; }\n\nhtml {\n  font-size: 62.5%; }\n\nbody {\n  box-sizing: border-box;\n  overflow-x: hidden;\n  font-size: 1.6rem;\n  background-size: cover;\n  background-repeat: no-repeat;\n  height: 127.5rem;\n  font-family: 'Lato', sans-serif; }\n\n[hidden] {\n  display: none !important; }\n\n.heading-tertiary {\n  font-size: 2.4rem;\n  text-transform: uppercase; }\n  .heading-tertiary--white {\n    color: #fff; }\n\n.mb-10 {\n  margin-bottom: 1rem; }\n\n.mb-20 {\n  margin-bottom: 2rem; }\n\n.mt-50 {\n  margin-top: 5rem; }\n\n.btn, .btn:link, .btn:visited {\n  padding: .75rem 2rem;\n  border-radius: .5rem;\n  background-color: #f2f2f2;\n  font-weight: 400;\n  display: inline-block; }\n\n.btn:active, .btn:focus {\n  outline: none;\n  transform: translateY(-1px);\n  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.2); }\n\n.login-form__group:not(:last-child) {\n  margin-bottom: 2.5rem; }\n\n.login-form__label {\n  margin-right: .7rem;\n  color: #fff;\n  font-size: 1.8rem;\n  font-weight: 400; }\n\n.login-form__input {\n  background-color: #fff;\n  padding: .5rem 0;\n  border: none; }\n\n.login-form__btn-wrapper {\n  display: flex;\n  justify-content: center; }\n\n.login__register-text {\n  margin-top: 1.5rem;\n  color: #fff; }\n\n.login__register-link {\n  text-decoration: none;\n  color: #fff;\n  transition: all .2s; }\n  .login__register-link:hover {\n    color: #ff8000;\n    text-decoration: underline; }\n\n.nav {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 2rem 6rem;\n  background-color: #fff;\n  border-bottom: 1px solid #000; }\n  .nav__item {\n    list-style: none; }\n    .nav__item--search {\n      flex: 0 0 25%; }\n  .nav__link {\n    text-decoration: none;\n    color: #000;\n    transition: all .2s; }\n    .nav__link:hover {\n      margin-bottom: 2px;\n      color: #ffa64d;\n      border-bottom: 1px solid #ffa64d; }\n    .nav__link--home:hover .nav__icon-path--home {\n      fill: #ff8000; }\n  .nav__search {\n    display: flex;\n    justify-content: center;\n    align-items: center; }\n    .nav__search-input {\n      width: 90%;\n      border-radius: 3rem;\n      padding: 1rem 2rem;\n      border: 1px solid #bfbfbf;\n      background-color: #f2f2f2;\n      transition: width .2s; }\n      .nav__search-input:focus {\n        outline: none;\n        width: 120%; }\n    .nav__search-btn {\n      cursor: pointer; }\n  .nav__icon-sizing--home {\n    width: 3rem;\n    height: 3rem; }\n  .nav__icon-sizing--search {\n    width: 2rem;\n    height: 2rem;\n    transform: translateX(-150%); }\n  .nav__icon-path {\n    fill: #bfbfbf; }\n\n.register-form__group {\n  display: flex;\n  justify-content: space-between;\n  align-items: center; }\n  .register-form__group:not(:last-child) {\n    margin-bottom: 3rem; }\n\n.register-form__label {\n  margin-right: 4rem;\n  color: #fff;\n  font-size: 1.8rem;\n  font-weight: 400; }\n\n.register-form__input {\n  background-color: #f2f2f2;\n  padding: .5rem 0;\n  border: none; }\n\n.register-form__btn-wrapper {\n  display: flex;\n  justify-content: center; }\n\n.register__login-text {\n  margin-top: 1.5rem;\n  color: #fff; }\n\n.register__login-link {\n  text-decoration: none;\n  color: #fff;\n  transition: all .2s; }\n  .register__login-link:hover {\n    color: #ff8000;\n    text-decoration: underline; }\n\n.error {\n  margin-top: 2rem;\n  text-align: center;\n  background-color: #ff8080;\n  border-radius: 10px;\n  padding: 2rem;\n  font-size: 2rem;\n  grid-column: center-start / center-end;\n  font-weight: 700; }\n\n.search-form {\n  padding: 2rem 25rem; }\n  .search-form__group {\n    width: 75%;\n    display: flex;\n    margin-bottom: 3rem;\n    border-bottom: 1px solid #000;\n    align-items: flex-start;\n    padding: .5rem 4rem .5rem 0; }\n  .search-form__label {\n    flex: 0 0 20%;\n    display: flex;\n    align-items: flex-start;\n    margin-top: .7rem; }\n  .search-form__group-input-wrapper {\n    flex: 0 0 80%; }\n  .search-form__tip {\n    font-size: 1rem;\n    line-height: 1.4;\n    width: 70%; }\n  .search-form__input-text {\n    width: 40rem;\n    height: 4rem;\n    margin-bottom: 1rem;\n    padding: 1rem;\n    border: solid 1px #bfbfbf;\n    border-radius: 5px; }\n    .search-form__input-text:focus {\n      border: solid 1px #000; }\n  .search-form__input-integer--relative {\n    position: relative; }\n  .search-form__group--checkbox {\n    display: flex;\n    margin-bottom: 1rem; }\n  .search-form__label--checkbox {\n    margin-right: 1rem; }\n  .search-form__input-checkbox {\n    width: 2.25rem;\n    height: 2.25rem;\n    margin-right: .8rem; }\n  .search-form__checkbox-wrapper {\n    display: flex;\n    align-items: center; }\n  .search-form__select-menu {\n    margin-bottom: 1rem; }\n  .search-form__svg-size {\n    height: 2rem;\n    width: 2rem;\n    margin-right: 1rem; }\n  .search-form__submit {\n    border-radius: 3px;\n    padding: .7rem;\n    border: 1px solid #b300b3; }\n  .search-form__dropdown-span {\n    display: flex;\n    flex-direction: column; }\n  .search-form__selected-types, .search-form__selected-sets {\n    display: flex;\n    flex-direction: column;\n    list-style: none;\n    margin-bottom: .3rem; }\n  .search-form__selected-types-list-item, .search-form__selected-sets-list-item {\n    display: flex;\n    margin-bottom: .7rem; }\n  .search-form__selected-types-remove-btn, .search-form__selected-sets-remove-btn {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    cursor: pointer;\n    height: 2rem;\n    width: 2rem;\n    font-size: 1.3rem;\n    background-color: #f2f2f2;\n    margin-right: .7rem; }\n  .search-form__selected-types-toggler {\n    height: 2rem;\n    width: 2.75rem;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    cursor: pointer;\n    font-size: 1.3rem;\n    margin-right: .7rem; }\n    .search-form__selected-types-toggler--is {\n      background-color: #47d147; }\n    .search-form__selected-types-toggler--not {\n      background-color: #ff0000; }\n  .search-form__dropdown {\n    position: absolute;\n    max-height: 28rem;\n    background-color: #fff;\n    z-index: 2;\n    top: 100%;\n    width: 40rem;\n    margin-top: -1rem;\n    overflow-y: auto;\n    border: 1px solid #000; }\n    .search-form__dropdown-list {\n      list-style: none; }\n      .search-form__dropdown-list-category {\n        padding: .5rem; }\n      .search-form__dropdown-list-option {\n        padding: .3rem 2rem;\n        display: flex;\n        align-items: center; }\n        .search-form__dropdown-list-option:hover {\n          cursor: pointer; }\n        .search-form__dropdown-list-option--highlighted {\n          background-color: #ccd8ff; }\n        .search-form__dropdown-list-option span {\n          text-transform: uppercase;\n          margin-left: 1rem; }\n      .search-form__dropdown-list-img {\n        width: 2rem;\n        height: 2rem;\n        margin-right: .7rem; }\n\n.dropdown-wrapper {\n  position: relative; }\n\n.inv-search-price-msg {\n  position: absolute;\n  bottom: 0;\n  right: 0;\n  color: red; }\n\n.relative {\n  position: relative; }\n\n.api-results-display__nav {\n  background-color: #99b1ff;\n  width: 100%;\n  display: flex;\n  justify-content: space-between;\n  padding: 0 10%;\n  margin-bottom: .1rem; }\n  .api-results-display__nav-select {\n    color: #b300b3;\n    margin-right: 1rem; }\n  .api-results-display__nav-label {\n    color: #b300b3; }\n  .api-results-display__nav-right {\n    display: flex;\n    align-items: center; }\n  .api-results-display__nav-pagination-container {\n    display: flex;\n    align-items: center;\n    background-color: #ccd8ff;\n    cursor: pointer; }\n    .api-results-display__nav-pagination-container:not(:last-child) {\n      margin-right: 3rem; }\n    .api-results-display__nav-pagination-container--disabled {\n      cursor: not-allowed;\n      background-color: rgba(204, 216, 255, 0.4); }\n  .api-results-display__nav-svg-size {\n    height: 2rem;\n    width: 2rem; }\n\n.api-results-display__display-bar {\n  width: 100%;\n  border-bottom: 1px solid #bfbfbf;\n  padding-left: 10%;\n  margin-bottom: 2rem; }\n\n.card-checklist {\n  width: 80%;\n  justify-self: center; }\n  .card-checklist__row {\n    display: grid; }\n    .card-checklist__row--7 {\n      grid-template-columns: repeat(7, 1fr); }\n    .card-checklist__row--9 {\n      grid-template-columns: repeat(9, 1fr); }\n    .card-checklist__row--header {\n      border-bottom: 1px solid #000; }\n    .card-checklist__row--grey {\n      background-color: #f2f2f2; }\n    .card-checklist__row:nth-child(even) {\n      background-color: #f2f2f2; }\n  .card-checklist__data {\n    display: flex;\n    flex-wrap: nowrap;\n    justify-content: center;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    font-size: 1.4rem; }\n    .card-checklist__data--set {\n      text-transform: uppercase; }\n    .card-checklist__data--rarity {\n      text-transform: capitalize; }\n    .card-checklist__data--name {\n      white-space: nowrap;\n      justify-content: flex-start; }\n  .card-checklist__data-link {\n    padding: 1rem 0;\n    display: flex;\n    flex-wrap: nowrap;\n    align-items: center;\n    text-decoration: none;\n    width: 100%;\n    color: #000;\n    white-space: nowrap; }\n    .card-checklist__data-link--start {\n      justify-content: flex-start; }\n    .card-checklist__data-link--center {\n      justify-content: center; }\n\n.tooltip {\n  position: absolute;\n  z-index: 5;\n  width: 24rem;\n  height: 34rem; }\n  .tooltip__img {\n    width: 100%;\n    height: 100%; }\n\n.negative-earnings {\n  color: red; }\n\n.positive-earnings {\n  color: green; }\n\n.image-grid {\n  padding: 10rem 15rem;\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(25rem, 1fr));\n  grid-column-gap: 2rem;\n  grid-row-gap: 1rem; }\n  .image-grid__outer-div {\n    position: relative; }\n  .image-grid__inner-div {\n    perspective: 150rem;\n    height: 34rem;\n    width: 24rem; }\n  .image-grid__double {\n    height: 34rem;\n    width: 24rem;\n    position: absolute;\n    top: 0;\n    left: 0;\n    backface-visibility: hidden;\n    overflow: hidden;\n    transition: all .8s ease; }\n    .image-grid__double--back {\n      transform: rotateY(180deg); }\n  .image-grid__double-btn {\n    position: absolute;\n    top: 50%;\n    right: 15%;\n    width: 4rem;\n    height: 4rem;\n    border-radius: 50%;\n    background-color: rgba(255, 255, 255, 0.4); }\n  .image-grid__container {\n    width: 24rem;\n    height: 34rem; }\n  .image-grid__image {\n    width: 100%;\n    height: 100%; }\n\n.card {\n  display: flex;\n  margin-top: 3rem; }\n  .card__img-container {\n    margin-right: 10rem; }\n  .card__img {\n    width: 33rem;\n    height: 46rem; }\n  .card__img-left {\n    margin-right: 10rem;\n    width: 33rem;\n    display: flex;\n    flex-direction: column; }\n  .card__img-btn {\n    justify-self: flex-end;\n    align-self: flex-end;\n    margin-top: auto; }\n  .card__img-double-area {\n    position: relative; }\n  .card__img-double-sided {\n    perspective: 150rem;\n    height: 46rem; }\n  .card__img-double {\n    width: 33rem;\n    height: 46rem;\n    position: absolute;\n    top: 0;\n    left: 0;\n    backface-visibility: hidden;\n    overflow: hidden; }\n    .card__img-double--back {\n      transform: rotateY(180deg); }\n  .card__text {\n    background-color: #f4f4d7;\n    width: 34rem;\n    display: flex;\n    flex-direction: column;\n    padding: 1rem;\n    margin-right: 3rem; }\n    .card__text-flex {\n      margin-bottom: 1rem;\n      border-bottom: 1px solid #bfbfbf; }\n    .card__text-title {\n      display: flex;\n      align-items: center; }\n      .card__text-title-h3 {\n        font-size: 1.8rem;\n        font-weight: 400;\n        margin-right: 1rem; }\n    .card__text-color-indicator {\n      width: 1.3rem;\n      height: 1.3rem;\n      border: 1px solid #333;\n      border-radius: 50%;\n      box-shadow: 0px 0px 0px 2px rgba(0, 0, 0, 0.2);\n      margin-right: .7rem;\n      display: inline-block; }\n      .card__text-color-indicator--U {\n        background-color: rgba(128, 128, 255, 0.7); }\n      .card__text-color-indicator--B {\n        background-color: rgba(0, 0, 0, 0.7); }\n      .card__text-color-indicator--R {\n        background-color: rgba(255, 77, 77, 0.7); }\n      .card__text-color-indicator--W {\n        background-color: rgba(255, 255, 255, 0.7); }\n      .card__text-color-indicator--G {\n        background-color: rgba(0, 255, 0, 0.7); }\n    .card__text-oracle-p {\n      margin-bottom: 1rem;\n      font-size: 1.3rem; }\n    .card__text-oracle-flavor {\n      font-size: 1.3rem;\n      font-style: italic; }\n    .card__text-illustrator {\n      font-size: 1.2rem;\n      font-style: italic; }\n    .card__text-legal {\n      display: flex;\n      flex-direction: row;\n      justify-content: space-between; }\n      .card__text-legal-half {\n        display: flex;\n        flex-direction: column; }\n      .card__text-legal-span-container {\n        display: flex;\n        align-items: center; }\n        .card__text-legal-span-container:not(:last-child) {\n          margin-bottom: .5rem; }\n      .card__text-legal-span-box {\n        width: 6rem;\n        height: 2.5rem;\n        border: 1px solid #000;\n        margin-right: .3rem;\n        font-size: 1rem;\n        text-transform: uppercase;\n        display: flex;\n        justify-content: center;\n        align-items: center; }\n        .card__text-legal-span-box--not_legal {\n          background-color: #ff0000; }\n        .card__text-legal-span-box--legal {\n          background-color: #47d147; }\n  .card__set {\n    display: flex;\n    flex-direction: column; }\n    .card__set-banner {\n      display: flex;\n      border: 1px solid #bfbfbf;\n      width: 40rem;\n      background-color: #000;\n      color: #fff; }\n      .card__set-banner-svg-container {\n        margin-right: 1rem; }\n      .card__set-banner-svg {\n        width: 2.4rem;\n        height: 2.4rem;\n        filter: invert(100%); }\n    .card__set-details {\n      display: flex;\n      flex-direction: column; }\n    .card__set-header-name {\n      font-size: 1.7remrem; }\n    .card__set-header-code {\n      text-transform: uppercase; }\n    .card__set-prints-header {\n      display: flex;\n      justify-content: space-between;\n      background-color: #000;\n      color: #fff;\n      font-size: 1.3rem;\n      text-transform: uppercase;\n      border: 1px solid #bfbfbf;\n      padding: .3rem .7rem; }\n    .card__set-prints-svg-container {\n      height: 1.8rem;\n      width: 1.8rem;\n      border: 1px solid #bfbfbf;\n      display: flex;\n      justify-content: center;\n      align-items: center;\n      border-radius: 100%; }\n    .card__set-prints-svg--common {\n      fill: #000; }\n    .card__set-prints-svg--uncommon {\n      fill: #e6e6e6; }\n    .card__set-prints-svg--rare {\n      fill: #e6c300; }\n    .card__set-prints-svg--mythic {\n      fill: #ff0000; }\n    .card__set-prints-list {\n      list-style: none; }\n      .card__set-prints-list-link:link, .card__set-prints-list-link:visited {\n        text-decoration: none;\n        color: #000; }\n      .card__set-prints-list-item {\n        display: flex;\n        justify-content: space-between;\n        cursor: pointer; }\n        .card__set-prints-list-item:hover {\n          background-color: #f2f2f2; }\n      .card__set-prints-list-item-name-wrapper {\n        display: flex;\n        align-items: center;\n        margin-left: -1rem; }\n      .card__set-prints-list-item-set-name {\n        margin-left: .5rem; }\n      .card__set-prints-list-item-price {\n        margin-right: .7rem; }\n\n.card-page {\n  display: flex;\n  flex-direction: column;\n  grid-column: center-start / center-end; }\n\n.add-to-inv {\n  margin-top: 3rem;\n  width: 50%; }\n  .add-to-inv__form {\n    display: flex;\n    flex-direction: column; }\n    .add-to-inv__form-group {\n      display: flex;\n      align-content: center;\n      margin-bottom: 3rem;\n      position: relative; }\n    .add-to-inv__form-label {\n      margin-right: .3rem; }\n  .add-to-inv-price-msg {\n    position: absolute;\n    bottom: -1.8rem;\n    right: 25%;\n    color: red; }\n\n.no-results {\n  justify-self: center; }\n\n.container {\n  display: grid;\n  grid-template-columns: [full-start] minmax(6rem, 1fr) [center-start] repeat(8, [col-start] minmax(min-content, 14rem) [col-end]) [center-end] minmax(6rem, 1fr) [full-end]; }\n\n.login,\n.register {\n  margin-top: 5rem;\n  grid-column: center-start / center-end;\n  background-image: linear-gradient(to right bottom, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(../img/login-bg.jpg);\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  height: 75vh;\n  background-size: cover;\n  background-position: center; }\n\n.search {\n  grid-column: full-start / full-end;\n  background-color: #fff; }\n\n.api-results-display {\n  grid-column: full-start / full-end;\n  background-color: #fff;\n  display: grid; }\n"],"sourceRoot":""}]);
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
/* harmony import */ var _views_inventoryView__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./views/inventoryView */ "./src/js/views/inventoryView.js");
/* harmony import */ var _views_inventorySearchView__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./views/inventorySearchView */ "./src/js/views/inventorySearchView.js");
/* harmony import */ var _views_base__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./views/base */ "./src/js/views/base.js");











// ******************************* \\
// ********* Quick Search ******** \\
// ******************************* \\
_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.nav.quickSearchBtn.addEventListener('click', () => {
    const search = new _models_Search__WEBPACK_IMPORTED_MODULE_2__.default();

    if (_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.nav.searchInput.value !== '') {
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
    _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.submitBtn.onclick = async e => {
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

    _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.typeLine.addEventListener('click', () => {
        // Display the dropdown
        _views_searchView__WEBPACK_IMPORTED_MODULE_3__.showTypesDropDown();
        _views_searchView__WEBPACK_IMPORTED_MODULE_3__.startTypesDropDownNavigation();

        // Start an event listener on the document. This will close the dropdown if the user clicks
        // outside of the input or dropdown. This will also cancel the event listener
        document.addEventListener('click', _views_searchView__WEBPACK_IMPORTED_MODULE_3__.typeLineListener)
    })

    _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.typeLine.addEventListener('input', () => {
        if (_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.typeDropDown.hasAttribute('hidden')) {
            _views_searchView__WEBPACK_IMPORTED_MODULE_3__.showTypesDropDown();
        }

        _views_searchView__WEBPACK_IMPORTED_MODULE_3__.filterTypes(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.typeLine.value);
        _views_searchView__WEBPACK_IMPORTED_MODULE_3__.filterTypeHeaders();
        _views_searchView__WEBPACK_IMPORTED_MODULE_3__.startTypesDropDownNavigation();
    })

    _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.setInput.addEventListener('click', () => {
        // Display the dropdown
        _views_searchView__WEBPACK_IMPORTED_MODULE_3__.showSetsDropDown();
        _views_searchView__WEBPACK_IMPORTED_MODULE_3__.startSetsDropDownNavigation();

        // Start an event listener on the document. This will close the dropdown if the user clicks
        // outside of the input or dropdown. This will also cancel the event listener
        document.addEventListener('click', _views_searchView__WEBPACK_IMPORTED_MODULE_3__.setInputListener)
    })

    _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.setInput.addEventListener('input', () => {
        if (_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.setDropDown.hasAttribute('hidden')) {
            _views_searchView__WEBPACK_IMPORTED_MODULE_3__.showSetsDropDown();
        }

        _views_searchView__WEBPACK_IMPORTED_MODULE_3__.filterSets(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.setInput.value);
        _views_searchView__WEBPACK_IMPORTED_MODULE_3__.filterSetHeaders();        
        _views_searchView__WEBPACK_IMPORTED_MODULE_3__.startSetsDropDownNavigation();
    })

    _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.statValue.addEventListener(
        'input', _views_searchView__WEBPACK_IMPORTED_MODULE_3__.statLineController
    );

    _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.format.addEventListener(
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
        _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.choseSelectMenuSort(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.sortBy.options, state);
        _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.choseSelectMenuDisplay(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.displaySelector, state)

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
        state.currentIndex ++;
        
        // Update the display based on the method stored in the state
        _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.updateDisplay(state);

        // Update the display bar
        _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.updateDisplayBar(state);

        // Enable the previous page and first page btns
        _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.enableBtn(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.previousPageBtn);
        _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.enableBtn(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.firstPageBtn);

        // If on the last page, disable the next page btn and last page btn
        if (state.currentIndex === (state.allCards.length - 1)) {
            _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.disableBtn(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.nextPageBtn);
            _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.disableBtn(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.lastPageBtn)
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
        state.currentIndex --;

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
        if (state.allResultsLoaded) _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.enableBtn(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.lastPageBtn);
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
        if (state.allResultsLoaded) _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.enableBtn(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.lastPageBtn);
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
    if (_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.card.transformBtn) {
        _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.card.transformBtn.addEventListener(
            'click', _views_cardView__WEBPACK_IMPORTED_MODULE_5__.flipToBackSide
        );
    }

    document.querySelector('.js--add-to-inv-submit').addEventListener(
        'click', _views_cardView__WEBPACK_IMPORTED_MODULE_5__.checkPriceInputForDigits
    )
}

// ******************************* \\
// ******* Inventory Page ******** \\
// ******************************* \\
if (window.location.pathname.substring(1, 10) === 'inventory') {
    document.addEventListener('DOMContentLoaded', _views_inventoryView__WEBPACK_IMPORTED_MODULE_6__.alterInventoryTable)
}

// ******************************* \\
// **** Inventory Search Page **** \\
// ******************************* \\
if (window.location.pathname.substring(1, 17) === 'inventory/search') {
    
    document.querySelector('.js--inv-search-btn').addEventListener(
        'click', _views_inventorySearchView__WEBPACK_IMPORTED_MODULE_7__.checkPriceInputForDigits
    )

    _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.typeLine.addEventListener('click', () => {
        // Display the dropdown
        console.log('click')
        _views_searchView__WEBPACK_IMPORTED_MODULE_3__.showTypesDropDown();
        _views_inventorySearchView__WEBPACK_IMPORTED_MODULE_7__.startTypesDropDownNavigation();

        // Start an event listener on the document. This will close the dropdown if the user clicks
        // outside of the input or dropdown. This will also cancel the event listener
        document.addEventListener('click', _views_inventorySearchView__WEBPACK_IMPORTED_MODULE_7__.typeLineListener)
    })

    _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.typeLine.addEventListener('input', () => {
        if (_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.typeDropDown.hasAttribute('hidden')) {
            _views_searchView__WEBPACK_IMPORTED_MODULE_3__.showTypesDropDown();
        }

        _views_searchView__WEBPACK_IMPORTED_MODULE_3__.filterTypes(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.typeLine.value);
        _views_searchView__WEBPACK_IMPORTED_MODULE_3__.filterTypeHeaders();
        _views_inventorySearchView__WEBPACK_IMPORTED_MODULE_7__.startTypesDropDownNavigation();
    })

    _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.setInput.addEventListener('click', () => {
        // Display the dropdown
        _views_searchView__WEBPACK_IMPORTED_MODULE_3__.showSetsDropDown();
        _views_inventorySearchView__WEBPACK_IMPORTED_MODULE_7__.startSetsDropDownNavigation();

        // Start an event listener on the document. This will close the dropdown if the user clicks
        // outside of the input or dropdown. This will also cancel the event listener
        document.addEventListener('click', _views_inventorySearchView__WEBPACK_IMPORTED_MODULE_7__.setInputListener)
    })

    _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.setInput.addEventListener('input', () => {
        if (_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.setDropDown.hasAttribute('hidden')) {
            _views_searchView__WEBPACK_IMPORTED_MODULE_3__.showSetsDropDown();
        }

        _views_searchView__WEBPACK_IMPORTED_MODULE_3__.filterSets(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.setInput.value);
        _views_searchView__WEBPACK_IMPORTED_MODULE_3__.filterSetHeaders();        
        _views_inventorySearchView__WEBPACK_IMPORTED_MODULE_7__.startSetsDropDownNavigation();
    })
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

const checkPriceInputForDigits = e => {
    const priceInput = document.querySelector('.js--add-to-inv-price').value;

    if (isNaN(priceInput) && priceInput !== '') {
        e.preventDefault();
        renderPriceInputErrorMessage();
        return false;
    }
}

const renderPriceInputErrorMessage = () => {
    const priceInputDiv = document.querySelector('.js--add-to-inv-price-div');
    const msg = `<p class="add-to-inv-price-msg">Invalid price. Must be a number.</p>`;

    if (!document.querySelector('.add-to-inv-price-msg')) {
        priceInputDiv.insertAdjacentHTML('beforeend', msg);
    }    
}



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



const checkPriceInputForDigits = e => {
    const priceInput = document.querySelector('.js--inv-denomination-sort-value').value;

    if (isNaN(priceInput) && priceInput !== '') {
        e.preventDefault();
        renderPriceInputErrorMessage();
        return false;
    }
}

const renderPriceInputErrorMessage = () => {
    const priceInputDiv = document.querySelector('.js--inv-search-price-div');
    const msg = `<p class="inv-search-price-msg">Invalid price. Must be a number.</p>`;

    if (!document.querySelector('.inv-search-price-msg')) {
        priceInputDiv.insertAdjacentHTML('beforeend', msg);
    }    
}

// ******************************* \\
// ********** TYPE LINE ********** \\
// ******************************* \\

const hideTypesDropDownButKeepValue = () => {
    if (!_base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.typeDropDown.hasAttribute('hidden')) {
        _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.typeDropDown.setAttribute('hidden', 'true');        
        document.removeEventListener('keydown', navigateTypesDropDown);
    }
}

const startTypesDropDownNavigation = () => {
    document.removeEventListener('keydown', navigateTypesDropDown);
    const firstType = document.querySelector('.js--type:not([hidden])');
    _searchView__WEBPACK_IMPORTED_MODULE_1__.highlightType(firstType);
    _searchView__WEBPACK_IMPORTED_MODULE_1__.hoverOverTypesListener();
    document.addEventListener('keydown', navigateTypesDropDown);
    _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.typeDropDown.scrollTop = 0;
}

const navigateTypesDropDown = e => {
    const types = Array.from(document.querySelectorAll('.js--type:not([hidden])'));
    const i = types.indexOf(document.querySelector('.js--highlighted'));

    if (e.code === 'ArrowDown' && i < types.length - 1) {
        e.preventDefault();
        _searchView__WEBPACK_IMPORTED_MODULE_1__.removeCurrentHighlight();
        _searchView__WEBPACK_IMPORTED_MODULE_1__.highlightType(types[i + 1]);

        _searchView__WEBPACK_IMPORTED_MODULE_1__.setScrollTopOnDownArrow(types[i + 1], _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.typeDropDown);
    }

    if (e.code === 'ArrowUp') {
        e.preventDefault();
        
        // We always want to prevent the default. We only want to change the
        // highlight if not on the top type in the dropdown
        if (i > 0) {
            _searchView__WEBPACK_IMPORTED_MODULE_1__.removeCurrentHighlight()
            _searchView__WEBPACK_IMPORTED_MODULE_1__.highlightType(types[i - 1]);
    
            _searchView__WEBPACK_IMPORTED_MODULE_1__.setScrollTopOnUpArrow(
                types[i - 1], _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.typeDropDown
            );
        }
    }

    if (e.code === 'Enter') {
        e.preventDefault();
        setInputValue(document.querySelector('.js--highlighted').getAttribute('data-type'));
        hideTypesDropDownButKeepValue();
    }
}

const setInputValue = type => {
    document.querySelector('.js--api-type-line').value = type
}

const typeLineListener = e => {
    // If the target is not Type Line input line, or an element in the dropdown list, 
    // close the dropdown and remove the event listener
    if (e.target !== _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.typeLine && !e.target.matches('.js--api-dropdown-types-list')) {
        _searchView__WEBPACK_IMPORTED_MODULE_1__.hideTypesDropDown();     
        document.removeEventListener('click', typeLineListener)  
    // If the target is one if types, get the data type
    } else if (e.target.hasAttribute('data-type')) {
        setInputValue(e.target.getAttribute('data-type'));
        _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.typeLine.focus();
        hideTypesDropDownButKeepValue();
    }
}

// ******************************* \\
// ************* SETS ************ \\
// ******************************* \\

const hideSetsDropDownButKeepValue = () => {
    if (!_base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.setDropDown.hasAttribute('hidden')) {
        _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.setDropDown.setAttribute('hidden', 'true');
        document.removeEventListener('keydown', navigateSetsDropDown);
    }
}


const navigateSetsDropDown = e => {
    const sets = Array.from(document.querySelectorAll('.js--set:not([hidden])'));
    const i = sets.indexOf(document.querySelector('.js--highlighted'));

    if (e.code === 'ArrowDown' && i < sets.length - 1) {
        e.preventDefault();
        _searchView__WEBPACK_IMPORTED_MODULE_1__.removeCurrentHighlight()
        _searchView__WEBPACK_IMPORTED_MODULE_1__.highlightSet(sets[i + 1]);

        _searchView__WEBPACK_IMPORTED_MODULE_1__.setScrollTopOnDownArrow(sets[i + 1], _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.setDropDown);
    }

    if (e.code === 'ArrowUp' && i > 0) {
        e.preventDefault();
        _searchView__WEBPACK_IMPORTED_MODULE_1__.removeCurrentHighlight()
        _searchView__WEBPACK_IMPORTED_MODULE_1__.highlightSet(sets[i - 1]);

        _searchView__WEBPACK_IMPORTED_MODULE_1__.setScrollTopOnUpArrow(sets[i - 1], _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.setDropDown);
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
}

const addSet = setName => {
    _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.setInput.value = setName
}

const setInputListener = e => {
    // If the target is not the set input field, or an element in the dropdown list, 
    // close the dropdown and remove the event listener 
    if (e.target !== _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.setInput && 
      !e.target.matches('.js--api-dropdown-sets-list')) {
        _searchView__WEBPACK_IMPORTED_MODULE_1__.hideSetsDropDown();
        document.removeEventListener('click', setInputListener);
    // If the target is one of the set options, toggle it as selected, add it to the list,
    // and hide the dropdown.
    } else if (e.target.hasAttribute('data-set-name')) {
        addSet(
            e.target.getAttribute('data-set-name')
        );
        _base__WEBPACK_IMPORTED_MODULE_0__.elements.apiSearch.setInput.focus();
        hideSetsDropDownButKeepValue();
    }
}

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
    const types = Array.from(document.querySelectorAll(
        '.js--inv-types'
    ));
    types.forEach(type => {
        let html = type.innerHTML;

        // if the — delimiter is found in the string, return everything before the delimiter
        if (html.indexOf('—') !== -1) {
            type.innerHTML = html.substring(0, html.indexOf('—') - 1)
        }
    })
};

const alterManaImages = () => {
    const manaCosts = Array.from(document.querySelectorAll(
        '.js--inv-mana-cost'
    ));

    manaCosts.forEach(cost => {
        cost.innerHTML =  (0,_resultsView__WEBPACK_IMPORTED_MODULE_0__.generateManaCostImages)(cost.innerHTML);
    })
};

// Not using this right now *************************************
const sortTableAlphabetically = () => {
    let rows = Array.from(document.querySelectorAll(
        '.js--checklist-row'
    ));
    const table = document.querySelector('.js--card-checklist');    
    let cards = []

    rows.forEach(row => {
        cards.push(row.querySelector('.js--checklist-card-name').innerHTML)
        row.parentElement.removeChild(row)
    })

    cards = cards.sort()

    for (let i = 0; i < cards.length; i++) {
        const rowIndex = rows.indexOf(rows.find(row => 
            row.getAttribute('data-row') === cards[i]
        ))

        table.insertAdjacentElement('beforeend', rows[rowIndex])   

        rows.splice(rowIndex, 1)
    }
}

const giveEarningsColumnModifier = () => {
    let rows = Array.from(document.querySelectorAll(
        '.js--inv-earnings'
    ));

    rows.forEach(row => {
        if (row.innerHTML.startsWith('-')) {
            row.classList.add('negative-earnings');
        } else if (row.innerHTML === '0.0') {
            row.classList.add('no-earnings');
        } else {
            row.classList.add('positive-earnings');
        }
    })
}

const alterInventoryTable = () => {
    shortenTypeLine();
    alterManaImages();
    (0,_resultsView__WEBPACK_IMPORTED_MODULE_0__.checkListHoverEvents)();
    // sortTableAlphabetically();
    giveEarningsColumnModifier();
}

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
    // Create a new table row for each card object
    cards.forEach(card => {
        const cardNameForUrl = parseCardName(card.name);

        const markup = `
            <tr class="js--checklist-row card-checklist__row card-checklist__row--7 data-component="card-tooltip" data-card-img=${checkForImg(card)}>
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
        console.log('types dropdown')

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9pbmRleC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvYWRhcHRlcnMveGhyLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9heGlvcy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbFRva2VuLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvaXNDYW5jZWwuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvQXhpb3MuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvSW50ZXJjZXB0b3JNYW5hZ2VyLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2J1aWxkRnVsbFBhdGguanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvY3JlYXRlRXJyb3IuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvZGlzcGF0Y2hSZXF1ZXN0LmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2VuaGFuY2VFcnJvci5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9tZXJnZUNvbmZpZy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9zZXR0bGUuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvdHJhbnNmb3JtRGF0YS5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvZGVmYXVsdHMuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYmluZC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9idWlsZFVSTC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9jb21iaW5lVVJMcy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9jb29raWVzLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzQWJzb2x1dGVVUkwuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNVUkxTYW1lT3JpZ2luLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL25vcm1hbGl6ZUhlYWRlck5hbWUuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvcGFyc2VIZWFkZXJzLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3NwcmVhZC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvdXRpbHMuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9zcmMvY3NzL3N0eWxlLmNzcyIsIndlYnBhY2s6Ly9tYWdpYy8uL3NyYy9jc3MvdmVuZG9yL21hbmEuY3NzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9jc3NXaXRoTWFwcGluZ1RvU3RyaW5nLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2dldFVybC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL3NyYy9pbWcvbG9naW4tYmcuanBnIiwid2VicGFjazovL21hZ2ljLy4vc3JjL2ltZy9tYW5hLXN5bWJvbHMvbWFuYS5zdmciLCJ3ZWJwYWNrOi8vbWFnaWMvLi9zcmMvY3NzL3N0eWxlLmNzcz85ZmNkIiwid2VicGFjazovL21hZ2ljLy4vc3JjL2Nzcy92ZW5kb3IvbWFuYS5jc3M/MDcwMiIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL3NyYy9qcy9pbmRleC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL3NyYy9qcy9tb2RlbHMvU2VhcmNoLmpzIiwid2VicGFjazovL21hZ2ljLy4vc3JjL2pzL3ZpZXdzL2Jhc2UuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9zcmMvanMvdmlld3MvY2FyZFZpZXcuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9zcmMvanMvdmlld3MvaW52ZW50b3J5U2VhcmNoVmlldy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL3NyYy9qcy92aWV3cy9pbnZlbnRvcnlWaWV3LmpzIiwid2VicGFjazovL21hZ2ljLy4vc3JjL2pzL3ZpZXdzL3Jlc3VsdHNWaWV3LmpzIiwid2VicGFjazovL21hZ2ljLy4vc3JjL2pzL3ZpZXdzL3NlYXJjaFZpZXcuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vbWFnaWMvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vbWFnaWMvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL21hZ2ljL3dlYnBhY2svcnVudGltZS9nbG9iYWwiLCJ3ZWJwYWNrOi8vbWFnaWMvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9tYWdpYy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL21hZ2ljL3dlYnBhY2svcnVudGltZS9wdWJsaWNQYXRoIiwid2VicGFjazovL21hZ2ljL3dlYnBhY2svc3RhcnR1cCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUEsNEZBQXVDLEM7Ozs7Ozs7Ozs7Ozs7QUNBMUI7O0FBRWIsWUFBWSxtQkFBTyxDQUFDLHFEQUFZO0FBQ2hDLGFBQWEsbUJBQU8sQ0FBQyxpRUFBa0I7QUFDdkMsY0FBYyxtQkFBTyxDQUFDLHlFQUFzQjtBQUM1QyxlQUFlLG1CQUFPLENBQUMsMkVBQXVCO0FBQzlDLG9CQUFvQixtQkFBTyxDQUFDLDZFQUF1QjtBQUNuRCxtQkFBbUIsbUJBQU8sQ0FBQyxtRkFBMkI7QUFDdEQsc0JBQXNCLG1CQUFPLENBQUMseUZBQThCO0FBQzVELGtCQUFrQixtQkFBTyxDQUFDLHlFQUFxQjs7QUFFL0M7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw0Q0FBNEM7QUFDNUM7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtB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QkFBa0IsTUFBTSxrQkFBa0IsTUFBTSxZQUFZLGFBQWEsYUFBYSxhQUFhLGFBQWEsYUFBYSxtQkFBbUIsTUFBTSxrQkFBa0IsTUFBTSxZQUFZLGtCQUFrQixNQUFNLGdCQUFnQixNQUFNLGtCQUFrQixNQUFNLGtCQUFrQixNQUFNLGtCQUFrQixNQUFNLFlBQVksYUFBYSxhQUFhLGFBQWEsbUJBQW1CLE1BQU0sVUFBVSxZQUFZLG1CQUFtQixNQUFNLGtCQUFrQixNQUFNLFlBQVksV0FBVyxZQUFZLG1CQUFtQixNQUFNLFlBQVksYUFBYSxpQkFBaUIsTUFBTSxVQUFVLGtCQUFrQixNQUFNLFlBQVksaUJBQWlCLEtBQUssWUFBWSxXQUFXLGlCQUFpQixNQUFNLFVBQVUsa0JBQWtCLE1BQU0sVUFBVSxZQUFZLGFBQWEsYUFBYSxhQUFhLGtCQUFrQixNQUFNLGlCQUFpQixNQUFNLGVBQWUsTUFBTSxZQUFZLFdBQVcsaUJBQWlCLE1BQU0sWUFBWSxXQUFXLGlCQUFpQixNQUFNLGVBQWUsTUFBTSxVQUFVLFlBQVksa0JBQWtCLE1BQU0sVUFBVSxZQUFZLGFBQWEsYUFBYSxhQUFhLGtCQUFrQixNQUFNLFVBQVUsZUFBZSxNQUFNLGVBQWUsTUFBTSxVQUFVLGVBQWUsTUFBTSxVQUFVLFVBQVUsaUJBQWlCLE1BQU0sZ0JBQWdCLE1BQU0sVUFBVSxZQUFZLGtCQUFrQixNQUFNLGtCQUFrQixNQUFNLFlBQVksV0FBVyxZQUFZLG1CQUFtQixNQUFNLFlBQVksYUFBYSxpQkFBaUIsTUFBTSxVQUFVLGtCQUFrQixNQUFNLFlBQVksaUJBQWlCLEtBQUssWUFBWSxXQUFXLGlCQUFpQixNQUFNLFVBQVUsa0JBQWtCLE1BQU0sWUFBWSxhQUFhLGFBQWEsYUFBYSxXQUFXLFVBQVUsWUFBWSxtQkFBbUIsTUFBTSxpQkFBaUIsTUFBTSxVQUFVLFVBQVUsWUFBWSxhQUFhLGFBQWEsa0JBQWtCLE1BQU0sVUFBVSxVQUFVLFlBQVksa0JBQWtCLE1BQU0sZUFBZSxNQUFNLFVBQVUsWUFBWSxnQkFBZ0IsS0FBSyxVQUFVLFVBQVUsWUFBWSxXQUFXLFlBQVksa0JBQWtCLE1BQU0saUJBQWlCLE1BQU0saUJBQWlCLE1BQU0sVUFBVSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxVQUFVLFVBQVUsaUJBQWlCLE1BQU0sVUFBVSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxVQUFVLFVBQVUsaUJBQWlCLE1BQU0sWUFBWSxXQUFXLGlCQUFpQixNQUFNLFVBQVUsaUJBQWlCLE1BQU0sVUFBVSxZQUFZLGFBQWEsa0JBQWtCLE1BQU0sVUFBVSxpQkFBaUIsTUFBTSxVQUFVLFlBQVksYUFBYSxXQUFXLFVBQVUsVUFBVSxZQUFZLGFBQWEsa0JBQWtCLE1BQU0sVUFBVSxVQUFVLFVBQVUsWUFBWSxhQUFhLFdBQVcsWUFBWSxrQkFBa0IsTUFBTSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxZQUFZLGFBQWEsYUFBYSxXQUFXLFVBQVUsVUFBVSxZQUFZLGFBQWEsa0JBQWtCLE1BQU0saUJBQWlCLE1BQU0sZUFBZSxNQUFNLFlBQVksV0FBVyxpQkFBaUIsTUFBTSxlQUFlLE1BQU0saUJBQWlCLE1BQU0sWUFBWSxrQkFBa0IsTUFBTSxVQUFVLFVBQVUsa0JBQWtCLE1BQU0sa0JBQWtCLE1BQU0sWUFBWSxXQUFXLFVBQVUsZ0JBQWdCLEtBQUssa0JBQWtCLE1BQU0sWUFBWSxXQUFXLFVBQVUsWUFBWSxXQUFXLGlCQUFpQixNQUFNLFVBQVUsaUJBQWlCLE1BQU0sZUFBZSxNQUFNLFVBQVUsaUJBQWlCLE1BQU0sVUFBVSxZQUFZLGFBQWEsZ0JBQWdCLE1BQU0saUJBQWlCLE1BQU0sWUFBWSxrQkFBa0IsTUFBTSxVQUFVLGdCQUFnQixNQUFNLFVBQVUsWUFBWSxhQUFhLG1CQUFtQixNQUFNLFVBQVUsaUJBQWlCLE1BQU0sZUFBZSxLQUFLLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLFVBQVUsWUFBWSxhQUFhLGFBQWEsYUFBYSxrQkFBa0IsTUFBTSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxZQUFZLGtCQUFrQixNQUFNLFVBQVUsVUFBVSxZQUFZLGFBQWEsYUFBYSxXQUFXLFVBQVUsaUJBQWlCLE1BQU0saUJBQWlCLE1BQU0sa0JBQWtCLE1BQU0sWUFBWSxXQUFXLFVBQVUsZUFBZSxLQUFLLFVBQVUsZ0JBQWdCLE1BQU0sZ0JBQWdCLEtBQUssZ0JBQWdCLE1BQU0sWUFBWSxXQUFXLFlBQVksYUFBYSxrQkFBa0IsTUFBTSxpQkFBaUIsTUFBTSxZQUFZLFdBQVcsZUFBZSxNQUFNLFVBQVUsVUFBVSxZQUFZLFdBQVcsVUFBVSxZQUFZLGFBQWEsa0JBQWtCLE1BQU0saUJBQWlCLE1BQU0sWUFBWSxXQUFXLFVBQVUsVUFBVSxVQUFVLFlBQVksa0JBQWtCLE1BQU0sVUFBVSxlQUFlLE1BQU0sVUFBVSxnQkFBZ0IsTUFBTSxVQUFVLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLFVBQVUsZUFBZSxNQUFNLFlBQVksV0FBVyxVQUFVLGlCQUFpQixNQUFNLFlBQVksYUFBYSxrQkFBa0IsTUFBTSxpQkFBaUIsTUFBTSxZQUFZLGdCQUFnQixNQUFNLFVBQVUsVUFBVSxZQUFZLFdBQVcsVUFBVSxZQUFZLGtCQUFrQixNQUFNLGlCQUFpQixNQUFNLFlBQVksV0FBVyxVQUFVLFlBQVksV0FBVyxpQkFBaUIsTUFBTSxZQUFZLGtCQUFrQixNQUFNLFVBQVUsaUJBQWlCLE1BQU0sWUFBWSxhQUFhLGtCQUFrQixNQUFNLFVBQVUsVUFBVSxZQUFZLGFBQWEsYUFBYSxhQUFhLGtCQUFrQixNQUFNLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLFlBQVksa0JBQWtCLE1BQU0sWUFBWSxrQkFBa0IsTUFBTSxZQUFZLGtCQUFrQixNQUFNLFVBQVUsWUFBWSxrQkFBa0IsTUFBTSxVQUFVLGlCQUFpQixNQUFNLFVBQVUsaUJBQWlCLE1BQU0saUJBQWlCLE1BQU0sVUFBVSxVQUFVLFlBQVksYUFBYSxXQUFXLFlBQVksV0FBVyxZQUFZLGtCQUFrQixNQUFNLGlCQUFpQixNQUFNLGlC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ZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9heGlvcycpOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIHNldHRsZSA9IHJlcXVpcmUoJy4vLi4vY29yZS9zZXR0bGUnKTtcbnZhciBjb29raWVzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2Nvb2tpZXMnKTtcbnZhciBidWlsZFVSTCA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9idWlsZFVSTCcpO1xudmFyIGJ1aWxkRnVsbFBhdGggPSByZXF1aXJlKCcuLi9jb3JlL2J1aWxkRnVsbFBhdGgnKTtcbnZhciBwYXJzZUhlYWRlcnMgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvcGFyc2VIZWFkZXJzJyk7XG52YXIgaXNVUkxTYW1lT3JpZ2luID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2lzVVJMU2FtZU9yaWdpbicpO1xudmFyIGNyZWF0ZUVycm9yID0gcmVxdWlyZSgnLi4vY29yZS9jcmVhdGVFcnJvcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHhockFkYXB0ZXIoY29uZmlnKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiBkaXNwYXRjaFhoclJlcXVlc3QocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgdmFyIHJlcXVlc3REYXRhID0gY29uZmlnLmRhdGE7XG4gICAgdmFyIHJlcXVlc3RIZWFkZXJzID0gY29uZmlnLmhlYWRlcnM7XG5cbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShyZXF1ZXN0RGF0YSkpIHtcbiAgICAgIGRlbGV0ZSByZXF1ZXN0SGVhZGVyc1snQ29udGVudC1UeXBlJ107IC8vIExldCB0aGUgYnJvd3NlciBzZXQgaXRcbiAgICB9XG5cbiAgICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgLy8gSFRUUCBiYXNpYyBhdXRoZW50aWNhdGlvblxuICAgIGlmIChjb25maWcuYXV0aCkge1xuICAgICAgdmFyIHVzZXJuYW1lID0gY29uZmlnLmF1dGgudXNlcm5hbWUgfHwgJyc7XG4gICAgICB2YXIgcGFzc3dvcmQgPSBjb25maWcuYXV0aC5wYXNzd29yZCA/IHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChjb25maWcuYXV0aC5wYXNzd29yZCkpIDogJyc7XG4gICAgICByZXF1ZXN0SGVhZGVycy5BdXRob3JpemF0aW9uID0gJ0Jhc2ljICcgKyBidG9hKHVzZXJuYW1lICsgJzonICsgcGFzc3dvcmQpO1xuICAgIH1cblxuICAgIHZhciBmdWxsUGF0aCA9IGJ1aWxkRnVsbFBhdGgoY29uZmlnLmJhc2VVUkwsIGNvbmZpZy51cmwpO1xuICAgIHJlcXVlc3Qub3Blbihjb25maWcubWV0aG9kLnRvVXBwZXJDYXNlKCksIGJ1aWxkVVJMKGZ1bGxQYXRoLCBjb25maWcucGFyYW1zLCBjb25maWcucGFyYW1zU2VyaWFsaXplciksIHRydWUpO1xuXG4gICAgLy8gU2V0IHRoZSByZXF1ZXN0IHRpbWVvdXQgaW4gTVNcbiAgICByZXF1ZXN0LnRpbWVvdXQgPSBjb25maWcudGltZW91dDtcblxuICAgIC8vIExpc3RlbiBmb3IgcmVhZHkgc3RhdGVcbiAgICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uIGhhbmRsZUxvYWQoKSB7XG4gICAgICBpZiAoIXJlcXVlc3QgfHwgcmVxdWVzdC5yZWFkeVN0YXRlICE9PSA0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gVGhlIHJlcXVlc3QgZXJyb3JlZCBvdXQgYW5kIHdlIGRpZG4ndCBnZXQgYSByZXNwb25zZSwgdGhpcyB3aWxsIGJlXG4gICAgICAvLyBoYW5kbGVkIGJ5IG9uZXJyb3IgaW5zdGVhZFxuICAgICAgLy8gV2l0aCBvbmUgZXhjZXB0aW9uOiByZXF1ZXN0IHRoYXQgdXNpbmcgZmlsZTogcHJvdG9jb2wsIG1vc3QgYnJvd3NlcnNcbiAgICAgIC8vIHdpbGwgcmV0dXJuIHN0YXR1cyBhcyAwIGV2ZW4gdGhvdWdoIGl0J3MgYSBzdWNjZXNzZnVsIHJlcXVlc3RcbiAgICAgIGlmIChyZXF1ZXN0LnN0YXR1cyA9PT0gMCAmJiAhKHJlcXVlc3QucmVzcG9uc2VVUkwgJiYgcmVxdWVzdC5yZXNwb25zZVVSTC5pbmRleE9mKCdmaWxlOicpID09PSAwKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFByZXBhcmUgdGhlIHJlc3BvbnNlXG4gICAgICB2YXIgcmVzcG9uc2VIZWFkZXJzID0gJ2dldEFsbFJlc3BvbnNlSGVhZGVycycgaW4gcmVxdWVzdCA/IHBhcnNlSGVhZGVycyhyZXF1ZXN0LmdldEFsbFJlc3BvbnNlSGVhZGVycygpKSA6IG51bGw7XG4gICAgICB2YXIgcmVzcG9uc2VEYXRhID0gIWNvbmZpZy5yZXNwb25zZVR5cGUgfHwgY29uZmlnLnJlc3BvbnNlVHlwZSA9PT0gJ3RleHQnID8gcmVxdWVzdC5yZXNwb25zZVRleHQgOiByZXF1ZXN0LnJlc3BvbnNlO1xuICAgICAgdmFyIHJlc3BvbnNlID0ge1xuICAgICAgICBkYXRhOiByZXNwb25zZURhdGEsXG4gICAgICAgIHN0YXR1czogcmVxdWVzdC5zdGF0dXMsXG4gICAgICAgIHN0YXR1c1RleHQ6IHJlcXVlc3Quc3RhdHVzVGV4dCxcbiAgICAgICAgaGVhZGVyczogcmVzcG9uc2VIZWFkZXJzLFxuICAgICAgICBjb25maWc6IGNvbmZpZyxcbiAgICAgICAgcmVxdWVzdDogcmVxdWVzdFxuICAgICAgfTtcblxuICAgICAgc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgcmVzcG9uc2UpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIGJyb3dzZXIgcmVxdWVzdCBjYW5jZWxsYXRpb24gKGFzIG9wcG9zZWQgdG8gYSBtYW51YWwgY2FuY2VsbGF0aW9uKVxuICAgIHJlcXVlc3Qub25hYm9ydCA9IGZ1bmN0aW9uIGhhbmRsZUFib3J0KCkge1xuICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKCdSZXF1ZXN0IGFib3J0ZWQnLCBjb25maWcsICdFQ09OTkFCT1JURUQnLCByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgbG93IGxldmVsIG5ldHdvcmsgZXJyb3JzXG4gICAgcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24gaGFuZGxlRXJyb3IoKSB7XG4gICAgICAvLyBSZWFsIGVycm9ycyBhcmUgaGlkZGVuIGZyb20gdXMgYnkgdGhlIGJyb3dzZXJcbiAgICAgIC8vIG9uZXJyb3Igc2hvdWxkIG9ubHkgZmlyZSBpZiBpdCdzIGEgbmV0d29yayBlcnJvclxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKCdOZXR3b3JrIEVycm9yJywgY29uZmlnLCBudWxsLCByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgdGltZW91dFxuICAgIHJlcXVlc3Qub250aW1lb3V0ID0gZnVuY3Rpb24gaGFuZGxlVGltZW91dCgpIHtcbiAgICAgIHZhciB0aW1lb3V0RXJyb3JNZXNzYWdlID0gJ3RpbWVvdXQgb2YgJyArIGNvbmZpZy50aW1lb3V0ICsgJ21zIGV4Y2VlZGVkJztcbiAgICAgIGlmIChjb25maWcudGltZW91dEVycm9yTWVzc2FnZSkge1xuICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlID0gY29uZmlnLnRpbWVvdXRFcnJvck1lc3NhZ2U7XG4gICAgICB9XG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IodGltZW91dEVycm9yTWVzc2FnZSwgY29uZmlnLCAnRUNPTk5BQk9SVEVEJyxcbiAgICAgICAgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gQWRkIHhzcmYgaGVhZGVyXG4gICAgLy8gVGhpcyBpcyBvbmx5IGRvbmUgaWYgcnVubmluZyBpbiBhIHN0YW5kYXJkIGJyb3dzZXIgZW52aXJvbm1lbnQuXG4gICAgLy8gU3BlY2lmaWNhbGx5IG5vdCBpZiB3ZSdyZSBpbiBhIHdlYiB3b3JrZXIsIG9yIHJlYWN0LW5hdGl2ZS5cbiAgICBpZiAodXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSkge1xuICAgICAgLy8gQWRkIHhzcmYgaGVhZGVyXG4gICAgICB2YXIgeHNyZlZhbHVlID0gKGNvbmZpZy53aXRoQ3JlZGVudGlhbHMgfHwgaXNVUkxTYW1lT3JpZ2luKGZ1bGxQYXRoKSkgJiYgY29uZmlnLnhzcmZDb29raWVOYW1lID9cbiAgICAgICAgY29va2llcy5yZWFkKGNvbmZpZy54c3JmQ29va2llTmFtZSkgOlxuICAgICAgICB1bmRlZmluZWQ7XG5cbiAgICAgIGlmICh4c3JmVmFsdWUpIHtcbiAgICAgICAgcmVxdWVzdEhlYWRlcnNbY29uZmlnLnhzcmZIZWFkZXJOYW1lXSA9IHhzcmZWYWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBZGQgaGVhZGVycyB0byB0aGUgcmVxdWVzdFxuICAgIGlmICgnc2V0UmVxdWVzdEhlYWRlcicgaW4gcmVxdWVzdCkge1xuICAgICAgdXRpbHMuZm9yRWFjaChyZXF1ZXN0SGVhZGVycywgZnVuY3Rpb24gc2V0UmVxdWVzdEhlYWRlcih2YWwsIGtleSkge1xuICAgICAgICBpZiAodHlwZW9mIHJlcXVlc3REYXRhID09PSAndW5kZWZpbmVkJyAmJiBrZXkudG9Mb3dlckNhc2UoKSA9PT0gJ2NvbnRlbnQtdHlwZScpIHtcbiAgICAgICAgICAvLyBSZW1vdmUgQ29udGVudC1UeXBlIGlmIGRhdGEgaXMgdW5kZWZpbmVkXG4gICAgICAgICAgZGVsZXRlIHJlcXVlc3RIZWFkZXJzW2tleV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gT3RoZXJ3aXNlIGFkZCBoZWFkZXIgdG8gdGhlIHJlcXVlc3RcbiAgICAgICAgICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoa2V5LCB2YWwpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBBZGQgd2l0aENyZWRlbnRpYWxzIHRvIHJlcXVlc3QgaWYgbmVlZGVkXG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcud2l0aENyZWRlbnRpYWxzKSkge1xuICAgICAgcmVxdWVzdC53aXRoQ3JlZGVudGlhbHMgPSAhIWNvbmZpZy53aXRoQ3JlZGVudGlhbHM7XG4gICAgfVxuXG4gICAgLy8gQWRkIHJlc3BvbnNlVHlwZSB0byByZXF1ZXN0IGlmIG5lZWRlZFxuICAgIGlmIChjb25maWcucmVzcG9uc2VUeXBlKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9IGNvbmZpZy5yZXNwb25zZVR5cGU7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIEV4cGVjdGVkIERPTUV4Y2VwdGlvbiB0aHJvd24gYnkgYnJvd3NlcnMgbm90IGNvbXBhdGlibGUgWE1MSHR0cFJlcXVlc3QgTGV2ZWwgMi5cbiAgICAgICAgLy8gQnV0LCB0aGlzIGNhbiBiZSBzdXBwcmVzc2VkIGZvciAnanNvbicgdHlwZSBhcyBpdCBjYW4gYmUgcGFyc2VkIGJ5IGRlZmF1bHQgJ3RyYW5zZm9ybVJlc3BvbnNlJyBmdW5jdGlvbi5cbiAgICAgICAgaWYgKGNvbmZpZy5yZXNwb25zZVR5cGUgIT09ICdqc29uJykge1xuICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgcHJvZ3Jlc3MgaWYgbmVlZGVkXG4gICAgaWYgKHR5cGVvZiBjb25maWcub25Eb3dubG9hZFByb2dyZXNzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgY29uZmlnLm9uRG93bmxvYWRQcm9ncmVzcyk7XG4gICAgfVxuXG4gICAgLy8gTm90IGFsbCBicm93c2VycyBzdXBwb3J0IHVwbG9hZCBldmVudHNcbiAgICBpZiAodHlwZW9mIGNvbmZpZy5vblVwbG9hZFByb2dyZXNzID09PSAnZnVuY3Rpb24nICYmIHJlcXVlc3QudXBsb2FkKSB7XG4gICAgICByZXF1ZXN0LnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGNvbmZpZy5vblVwbG9hZFByb2dyZXNzKTtcbiAgICB9XG5cbiAgICBpZiAoY29uZmlnLmNhbmNlbFRva2VuKSB7XG4gICAgICAvLyBIYW5kbGUgY2FuY2VsbGF0aW9uXG4gICAgICBjb25maWcuY2FuY2VsVG9rZW4ucHJvbWlzZS50aGVuKGZ1bmN0aW9uIG9uQ2FuY2VsZWQoY2FuY2VsKSB7XG4gICAgICAgIGlmICghcmVxdWVzdCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlcXVlc3QuYWJvcnQoKTtcbiAgICAgICAgcmVqZWN0KGNhbmNlbCk7XG4gICAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoIXJlcXVlc3REYXRhKSB7XG4gICAgICByZXF1ZXN0RGF0YSA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gU2VuZCB0aGUgcmVxdWVzdFxuICAgIHJlcXVlc3Quc2VuZChyZXF1ZXN0RGF0YSk7XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIGJpbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvYmluZCcpO1xudmFyIEF4aW9zID0gcmVxdWlyZSgnLi9jb3JlL0F4aW9zJyk7XG52YXIgbWVyZ2VDb25maWcgPSByZXF1aXJlKCcuL2NvcmUvbWVyZ2VDb25maWcnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4vZGVmYXVsdHMnKTtcblxuLyoqXG4gKiBDcmVhdGUgYW4gaW5zdGFuY2Ugb2YgQXhpb3NcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZGVmYXVsdENvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICogQHJldHVybiB7QXhpb3N9IEEgbmV3IGluc3RhbmNlIG9mIEF4aW9zXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUluc3RhbmNlKGRlZmF1bHRDb25maWcpIHtcbiAgdmFyIGNvbnRleHQgPSBuZXcgQXhpb3MoZGVmYXVsdENvbmZpZyk7XG4gIHZhciBpbnN0YW5jZSA9IGJpbmQoQXhpb3MucHJvdG90eXBlLnJlcXVlc3QsIGNvbnRleHQpO1xuXG4gIC8vIENvcHkgYXhpb3MucHJvdG90eXBlIHRvIGluc3RhbmNlXG4gIHV0aWxzLmV4dGVuZChpbnN0YW5jZSwgQXhpb3MucHJvdG90eXBlLCBjb250ZXh0KTtcblxuICAvLyBDb3B5IGNvbnRleHQgdG8gaW5zdGFuY2VcbiAgdXRpbHMuZXh0ZW5kKGluc3RhbmNlLCBjb250ZXh0KTtcblxuICByZXR1cm4gaW5zdGFuY2U7XG59XG5cbi8vIENyZWF0ZSB0aGUgZGVmYXVsdCBpbnN0YW5jZSB0byBiZSBleHBvcnRlZFxudmFyIGF4aW9zID0gY3JlYXRlSW5zdGFuY2UoZGVmYXVsdHMpO1xuXG4vLyBFeHBvc2UgQXhpb3MgY2xhc3MgdG8gYWxsb3cgY2xhc3MgaW5oZXJpdGFuY2VcbmF4aW9zLkF4aW9zID0gQXhpb3M7XG5cbi8vIEZhY3RvcnkgZm9yIGNyZWF0aW5nIG5ldyBpbnN0YW5jZXNcbmF4aW9zLmNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZShpbnN0YW5jZUNvbmZpZykge1xuICByZXR1cm4gY3JlYXRlSW5zdGFuY2UobWVyZ2VDb25maWcoYXhpb3MuZGVmYXVsdHMsIGluc3RhbmNlQ29uZmlnKSk7XG59O1xuXG4vLyBFeHBvc2UgQ2FuY2VsICYgQ2FuY2VsVG9rZW5cbmF4aW9zLkNhbmNlbCA9IHJlcXVpcmUoJy4vY2FuY2VsL0NhbmNlbCcpO1xuYXhpb3MuQ2FuY2VsVG9rZW4gPSByZXF1aXJlKCcuL2NhbmNlbC9DYW5jZWxUb2tlbicpO1xuYXhpb3MuaXNDYW5jZWwgPSByZXF1aXJlKCcuL2NhbmNlbC9pc0NhbmNlbCcpO1xuXG4vLyBFeHBvc2UgYWxsL3NwcmVhZFxuYXhpb3MuYWxsID0gZnVuY3Rpb24gYWxsKHByb21pc2VzKSB7XG4gIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcyk7XG59O1xuYXhpb3Muc3ByZWFkID0gcmVxdWlyZSgnLi9oZWxwZXJzL3NwcmVhZCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGF4aW9zO1xuXG4vLyBBbGxvdyB1c2Ugb2YgZGVmYXVsdCBpbXBvcnQgc3ludGF4IGluIFR5cGVTY3JpcHRcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBheGlvcztcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBBIGBDYW5jZWxgIGlzIGFuIG9iamVjdCB0aGF0IGlzIHRocm93biB3aGVuIGFuIG9wZXJhdGlvbiBpcyBjYW5jZWxlZC5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7c3RyaW5nPX0gbWVzc2FnZSBUaGUgbWVzc2FnZS5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsKG1lc3NhZ2UpIHtcbiAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbn1cblxuQ2FuY2VsLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICByZXR1cm4gJ0NhbmNlbCcgKyAodGhpcy5tZXNzYWdlID8gJzogJyArIHRoaXMubWVzc2FnZSA6ICcnKTtcbn07XG5cbkNhbmNlbC5wcm90b3R5cGUuX19DQU5DRUxfXyA9IHRydWU7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ2FuY2VsID0gcmVxdWlyZSgnLi9DYW5jZWwnKTtcblxuLyoqXG4gKiBBIGBDYW5jZWxUb2tlbmAgaXMgYW4gb2JqZWN0IHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVxdWVzdCBjYW5jZWxsYXRpb24gb2YgYW4gb3BlcmF0aW9uLlxuICpcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZXhlY3V0b3IgVGhlIGV4ZWN1dG9yIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBDYW5jZWxUb2tlbihleGVjdXRvcikge1xuICBpZiAodHlwZW9mIGV4ZWN1dG9yICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZXhlY3V0b3IgbXVzdCBiZSBhIGZ1bmN0aW9uLicpO1xuICB9XG5cbiAgdmFyIHJlc29sdmVQcm9taXNlO1xuICB0aGlzLnByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiBwcm9taXNlRXhlY3V0b3IocmVzb2x2ZSkge1xuICAgIHJlc29sdmVQcm9taXNlID0gcmVzb2x2ZTtcbiAgfSk7XG5cbiAgdmFyIHRva2VuID0gdGhpcztcbiAgZXhlY3V0b3IoZnVuY3Rpb24gY2FuY2VsKG1lc3NhZ2UpIHtcbiAgICBpZiAodG9rZW4ucmVhc29uKSB7XG4gICAgICAvLyBDYW5jZWxsYXRpb24gaGFzIGFscmVhZHkgYmVlbiByZXF1ZXN0ZWRcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0b2tlbi5yZWFzb24gPSBuZXcgQ2FuY2VsKG1lc3NhZ2UpO1xuICAgIHJlc29sdmVQcm9taXNlKHRva2VuLnJlYXNvbik7XG4gIH0pO1xufVxuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbkNhbmNlbFRva2VuLnByb3RvdHlwZS50aHJvd0lmUmVxdWVzdGVkID0gZnVuY3Rpb24gdGhyb3dJZlJlcXVlc3RlZCgpIHtcbiAgaWYgKHRoaXMucmVhc29uKSB7XG4gICAgdGhyb3cgdGhpcy5yZWFzb247XG4gIH1cbn07XG5cbi8qKlxuICogUmV0dXJucyBhbiBvYmplY3QgdGhhdCBjb250YWlucyBhIG5ldyBgQ2FuY2VsVG9rZW5gIGFuZCBhIGZ1bmN0aW9uIHRoYXQsIHdoZW4gY2FsbGVkLFxuICogY2FuY2VscyB0aGUgYENhbmNlbFRva2VuYC5cbiAqL1xuQ2FuY2VsVG9rZW4uc291cmNlID0gZnVuY3Rpb24gc291cmNlKCkge1xuICB2YXIgY2FuY2VsO1xuICB2YXIgdG9rZW4gPSBuZXcgQ2FuY2VsVG9rZW4oZnVuY3Rpb24gZXhlY3V0b3IoYykge1xuICAgIGNhbmNlbCA9IGM7XG4gIH0pO1xuICByZXR1cm4ge1xuICAgIHRva2VuOiB0b2tlbixcbiAgICBjYW5jZWw6IGNhbmNlbFxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW5jZWxUb2tlbjtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0NhbmNlbCh2YWx1ZSkge1xuICByZXR1cm4gISEodmFsdWUgJiYgdmFsdWUuX19DQU5DRUxfXyk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgYnVpbGRVUkwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2J1aWxkVVJMJyk7XG52YXIgSW50ZXJjZXB0b3JNYW5hZ2VyID0gcmVxdWlyZSgnLi9JbnRlcmNlcHRvck1hbmFnZXInKTtcbnZhciBkaXNwYXRjaFJlcXVlc3QgPSByZXF1aXJlKCcuL2Rpc3BhdGNoUmVxdWVzdCcpO1xudmFyIG1lcmdlQ29uZmlnID0gcmVxdWlyZSgnLi9tZXJnZUNvbmZpZycpO1xuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBpbnN0YW5jZUNvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICovXG5mdW5jdGlvbiBBeGlvcyhpbnN0YW5jZUNvbmZpZykge1xuICB0aGlzLmRlZmF1bHRzID0gaW5zdGFuY2VDb25maWc7XG4gIHRoaXMuaW50ZXJjZXB0b3JzID0ge1xuICAgIHJlcXVlc3Q6IG5ldyBJbnRlcmNlcHRvck1hbmFnZXIoKSxcbiAgICByZXNwb25zZTogbmV3IEludGVyY2VwdG9yTWFuYWdlcigpXG4gIH07XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnIHNwZWNpZmljIGZvciB0aGlzIHJlcXVlc3QgKG1lcmdlZCB3aXRoIHRoaXMuZGVmYXVsdHMpXG4gKi9cbkF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0ID0gZnVuY3Rpb24gcmVxdWVzdChjb25maWcpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIC8vIEFsbG93IGZvciBheGlvcygnZXhhbXBsZS91cmwnWywgY29uZmlnXSkgYSBsYSBmZXRjaCBBUElcbiAgaWYgKHR5cGVvZiBjb25maWcgPT09ICdzdHJpbmcnKSB7XG4gICAgY29uZmlnID0gYXJndW1lbnRzWzFdIHx8IHt9O1xuICAgIGNvbmZpZy51cmwgPSBhcmd1bWVudHNbMF07XG4gIH0gZWxzZSB7XG4gICAgY29uZmlnID0gY29uZmlnIHx8IHt9O1xuICB9XG5cbiAgY29uZmlnID0gbWVyZ2VDb25maWcodGhpcy5kZWZhdWx0cywgY29uZmlnKTtcblxuICAvLyBTZXQgY29uZmlnLm1ldGhvZFxuICBpZiAoY29uZmlnLm1ldGhvZCkge1xuICAgIGNvbmZpZy5tZXRob2QgPSBjb25maWcubWV0aG9kLnRvTG93ZXJDYXNlKCk7XG4gIH0gZWxzZSBpZiAodGhpcy5kZWZhdWx0cy5tZXRob2QpIHtcbiAgICBjb25maWcubWV0aG9kID0gdGhpcy5kZWZhdWx0cy5tZXRob2QudG9Mb3dlckNhc2UoKTtcbiAgfSBlbHNlIHtcbiAgICBjb25maWcubWV0aG9kID0gJ2dldCc7XG4gIH1cblxuICAvLyBIb29rIHVwIGludGVyY2VwdG9ycyBtaWRkbGV3YXJlXG4gIHZhciBjaGFpbiA9IFtkaXNwYXRjaFJlcXVlc3QsIHVuZGVmaW5lZF07XG4gIHZhciBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKGNvbmZpZyk7XG5cbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVxdWVzdC5mb3JFYWNoKGZ1bmN0aW9uIHVuc2hpZnRSZXF1ZXN0SW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgY2hhaW4udW5zaGlmdChpbnRlcmNlcHRvci5mdWxmaWxsZWQsIGludGVyY2VwdG9yLnJlamVjdGVkKTtcbiAgfSk7XG5cbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVzcG9uc2UuZm9yRWFjaChmdW5jdGlvbiBwdXNoUmVzcG9uc2VJbnRlcmNlcHRvcnMoaW50ZXJjZXB0b3IpIHtcbiAgICBjaGFpbi5wdXNoKGludGVyY2VwdG9yLmZ1bGZpbGxlZCwgaW50ZXJjZXB0b3IucmVqZWN0ZWQpO1xuICB9KTtcblxuICB3aGlsZSAoY2hhaW4ubGVuZ3RoKSB7XG4gICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihjaGFpbi5zaGlmdCgpLCBjaGFpbi5zaGlmdCgpKTtcbiAgfVxuXG4gIHJldHVybiBwcm9taXNlO1xufTtcblxuQXhpb3MucHJvdG90eXBlLmdldFVyaSA9IGZ1bmN0aW9uIGdldFVyaShjb25maWcpIHtcbiAgY29uZmlnID0gbWVyZ2VDb25maWcodGhpcy5kZWZhdWx0cywgY29uZmlnKTtcbiAgcmV0dXJuIGJ1aWxkVVJMKGNvbmZpZy51cmwsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKS5yZXBsYWNlKC9eXFw/LywgJycpO1xufTtcblxuLy8gUHJvdmlkZSBhbGlhc2VzIGZvciBzdXBwb3J0ZWQgcmVxdWVzdCBtZXRob2RzXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ29wdGlvbnMnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZE5vRGF0YShtZXRob2QpIHtcbiAgLyplc2xpbnQgZnVuYy1uYW1lczowKi9cbiAgQXhpb3MucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih1cmwsIGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QobWVyZ2VDb25maWcoY29uZmlnIHx8IHt9LCB7XG4gICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgIHVybDogdXJsLFxuICAgICAgZGF0YTogKGNvbmZpZyB8fCB7fSkuZGF0YVxuICAgIH0pKTtcbiAgfTtcbn0pO1xuXG51dGlscy5mb3JFYWNoKFsncG9zdCcsICdwdXQnLCAncGF0Y2gnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZFdpdGhEYXRhKG1ldGhvZCkge1xuICAvKmVzbGludCBmdW5jLW5hbWVzOjAqL1xuICBBeGlvcy5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgY29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChtZXJnZUNvbmZpZyhjb25maWcgfHwge30sIHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgdXJsOiB1cmwsXG4gICAgICBkYXRhOiBkYXRhXG4gICAgfSkpO1xuICB9O1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQXhpb3M7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuZnVuY3Rpb24gSW50ZXJjZXB0b3JNYW5hZ2VyKCkge1xuICB0aGlzLmhhbmRsZXJzID0gW107XG59XG5cbi8qKlxuICogQWRkIGEgbmV3IGludGVyY2VwdG9yIHRvIHRoZSBzdGFja1xuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bGZpbGxlZCBUaGUgZnVuY3Rpb24gdG8gaGFuZGxlIGB0aGVuYCBmb3IgYSBgUHJvbWlzZWBcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlamVjdGVkIFRoZSBmdW5jdGlvbiB0byBoYW5kbGUgYHJlamVjdGAgZm9yIGEgYFByb21pc2VgXG4gKlxuICogQHJldHVybiB7TnVtYmVyfSBBbiBJRCB1c2VkIHRvIHJlbW92ZSBpbnRlcmNlcHRvciBsYXRlclxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uIHVzZShmdWxmaWxsZWQsIHJlamVjdGVkKSB7XG4gIHRoaXMuaGFuZGxlcnMucHVzaCh7XG4gICAgZnVsZmlsbGVkOiBmdWxmaWxsZWQsXG4gICAgcmVqZWN0ZWQ6IHJlamVjdGVkXG4gIH0pO1xuICByZXR1cm4gdGhpcy5oYW5kbGVycy5sZW5ndGggLSAxO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYW4gaW50ZXJjZXB0b3IgZnJvbSB0aGUgc3RhY2tcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gaWQgVGhlIElEIHRoYXQgd2FzIHJldHVybmVkIGJ5IGB1c2VgXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUuZWplY3QgPSBmdW5jdGlvbiBlamVjdChpZCkge1xuICBpZiAodGhpcy5oYW5kbGVyc1tpZF0pIHtcbiAgICB0aGlzLmhhbmRsZXJzW2lkXSA9IG51bGw7XG4gIH1cbn07XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFsbCB0aGUgcmVnaXN0ZXJlZCBpbnRlcmNlcHRvcnNcbiAqXG4gKiBUaGlzIG1ldGhvZCBpcyBwYXJ0aWN1bGFybHkgdXNlZnVsIGZvciBza2lwcGluZyBvdmVyIGFueVxuICogaW50ZXJjZXB0b3JzIHRoYXQgbWF5IGhhdmUgYmVjb21lIGBudWxsYCBjYWxsaW5nIGBlamVjdGAuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggaW50ZXJjZXB0b3JcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gZm9yRWFjaChmbikge1xuICB1dGlscy5mb3JFYWNoKHRoaXMuaGFuZGxlcnMsIGZ1bmN0aW9uIGZvckVhY2hIYW5kbGVyKGgpIHtcbiAgICBpZiAoaCAhPT0gbnVsbCkge1xuICAgICAgZm4oaCk7XG4gICAgfVxuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJjZXB0b3JNYW5hZ2VyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaXNBYnNvbHV0ZVVSTCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvaXNBYnNvbHV0ZVVSTCcpO1xudmFyIGNvbWJpbmVVUkxzID0gcmVxdWlyZSgnLi4vaGVscGVycy9jb21iaW5lVVJMcycpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgVVJMIGJ5IGNvbWJpbmluZyB0aGUgYmFzZVVSTCB3aXRoIHRoZSByZXF1ZXN0ZWRVUkwsXG4gKiBvbmx5IHdoZW4gdGhlIHJlcXVlc3RlZFVSTCBpcyBub3QgYWxyZWFkeSBhbiBhYnNvbHV0ZSBVUkwuXG4gKiBJZiB0aGUgcmVxdWVzdFVSTCBpcyBhYnNvbHV0ZSwgdGhpcyBmdW5jdGlvbiByZXR1cm5zIHRoZSByZXF1ZXN0ZWRVUkwgdW50b3VjaGVkLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlcXVlc3RlZFVSTCBBYnNvbHV0ZSBvciByZWxhdGl2ZSBVUkwgdG8gY29tYmluZVxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGNvbWJpbmVkIGZ1bGwgcGF0aFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJ1aWxkRnVsbFBhdGgoYmFzZVVSTCwgcmVxdWVzdGVkVVJMKSB7XG4gIGlmIChiYXNlVVJMICYmICFpc0Fic29sdXRlVVJMKHJlcXVlc3RlZFVSTCkpIHtcbiAgICByZXR1cm4gY29tYmluZVVSTHMoYmFzZVVSTCwgcmVxdWVzdGVkVVJMKTtcbiAgfVxuICByZXR1cm4gcmVxdWVzdGVkVVJMO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGVuaGFuY2VFcnJvciA9IHJlcXVpcmUoJy4vZW5oYW5jZUVycm9yJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBtZXNzYWdlLCBjb25maWcsIGVycm9yIGNvZGUsIHJlcXVlc3QgYW5kIHJlc3BvbnNlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIFRoZSBlcnJvciBtZXNzYWdlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBjcmVhdGVkIGVycm9yLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZUVycm9yKG1lc3NhZ2UsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgdmFyIGVycm9yID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xuICByZXR1cm4gZW5oYW5jZUVycm9yKGVycm9yLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciB0cmFuc2Zvcm1EYXRhID0gcmVxdWlyZSgnLi90cmFuc2Zvcm1EYXRhJyk7XG52YXIgaXNDYW5jZWwgPSByZXF1aXJlKCcuLi9jYW5jZWwvaXNDYW5jZWwnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4uL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogVGhyb3dzIGEgYENhbmNlbGAgaWYgY2FuY2VsbGF0aW9uIGhhcyBiZWVuIHJlcXVlc3RlZC5cbiAqL1xuZnVuY3Rpb24gdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpIHtcbiAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgIGNvbmZpZy5jYW5jZWxUb2tlbi50aHJvd0lmUmVxdWVzdGVkKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBEaXNwYXRjaCBhIHJlcXVlc3QgdG8gdGhlIHNlcnZlciB1c2luZyB0aGUgY29uZmlndXJlZCBhZGFwdGVyLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZyB0aGF0IGlzIHRvIGJlIHVzZWQgZm9yIHRoZSByZXF1ZXN0XG4gKiBAcmV0dXJucyB7UHJvbWlzZX0gVGhlIFByb21pc2UgdG8gYmUgZnVsZmlsbGVkXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGlzcGF0Y2hSZXF1ZXN0KGNvbmZpZykge1xuICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgLy8gRW5zdXJlIGhlYWRlcnMgZXhpc3RcbiAgY29uZmlnLmhlYWRlcnMgPSBjb25maWcuaGVhZGVycyB8fCB7fTtcblxuICAvLyBUcmFuc2Zvcm0gcmVxdWVzdCBkYXRhXG4gIGNvbmZpZy5kYXRhID0gdHJhbnNmb3JtRGF0YShcbiAgICBjb25maWcuZGF0YSxcbiAgICBjb25maWcuaGVhZGVycyxcbiAgICBjb25maWcudHJhbnNmb3JtUmVxdWVzdFxuICApO1xuXG4gIC8vIEZsYXR0ZW4gaGVhZGVyc1xuICBjb25maWcuaGVhZGVycyA9IHV0aWxzLm1lcmdlKFxuICAgIGNvbmZpZy5oZWFkZXJzLmNvbW1vbiB8fCB7fSxcbiAgICBjb25maWcuaGVhZGVyc1tjb25maWcubWV0aG9kXSB8fCB7fSxcbiAgICBjb25maWcuaGVhZGVyc1xuICApO1xuXG4gIHV0aWxzLmZvckVhY2goXG4gICAgWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnLCAncG9zdCcsICdwdXQnLCAncGF0Y2gnLCAnY29tbW9uJ10sXG4gICAgZnVuY3Rpb24gY2xlYW5IZWFkZXJDb25maWcobWV0aG9kKSB7XG4gICAgICBkZWxldGUgY29uZmlnLmhlYWRlcnNbbWV0aG9kXTtcbiAgICB9XG4gICk7XG5cbiAgdmFyIGFkYXB0ZXIgPSBjb25maWcuYWRhcHRlciB8fCBkZWZhdWx0cy5hZGFwdGVyO1xuXG4gIHJldHVybiBhZGFwdGVyKGNvbmZpZykudGhlbihmdW5jdGlvbiBvbkFkYXB0ZXJSZXNvbHV0aW9uKHJlc3BvbnNlKSB7XG4gICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgLy8gVHJhbnNmb3JtIHJlc3BvbnNlIGRhdGFcbiAgICByZXNwb25zZS5kYXRhID0gdHJhbnNmb3JtRGF0YShcbiAgICAgIHJlc3BvbnNlLmRhdGEsXG4gICAgICByZXNwb25zZS5oZWFkZXJzLFxuICAgICAgY29uZmlnLnRyYW5zZm9ybVJlc3BvbnNlXG4gICAgKTtcblxuICAgIHJldHVybiByZXNwb25zZTtcbiAgfSwgZnVuY3Rpb24gb25BZGFwdGVyUmVqZWN0aW9uKHJlYXNvbikge1xuICAgIGlmICghaXNDYW5jZWwocmVhc29uKSkge1xuICAgICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgICAvLyBUcmFuc2Zvcm0gcmVzcG9uc2UgZGF0YVxuICAgICAgaWYgKHJlYXNvbiAmJiByZWFzb24ucmVzcG9uc2UpIHtcbiAgICAgICAgcmVhc29uLnJlc3BvbnNlLmRhdGEgPSB0cmFuc2Zvcm1EYXRhKFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhLFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5oZWFkZXJzLFxuICAgICAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChyZWFzb24pO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVXBkYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBjb25maWcsIGVycm9yIGNvZGUsIGFuZCByZXNwb25zZS5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJvciBUaGUgZXJyb3IgdG8gdXBkYXRlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBlcnJvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgZXJyb3IuY29uZmlnID0gY29uZmlnO1xuICBpZiAoY29kZSkge1xuICAgIGVycm9yLmNvZGUgPSBjb2RlO1xuICB9XG5cbiAgZXJyb3IucmVxdWVzdCA9IHJlcXVlc3Q7XG4gIGVycm9yLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gIGVycm9yLmlzQXhpb3NFcnJvciA9IHRydWU7XG5cbiAgZXJyb3IudG9KU09OID0gZnVuY3Rpb24gdG9KU09OKCkge1xuICAgIHJldHVybiB7XG4gICAgICAvLyBTdGFuZGFyZFxuICAgICAgbWVzc2FnZTogdGhpcy5tZXNzYWdlLFxuICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgLy8gTWljcm9zb2Z0XG4gICAgICBkZXNjcmlwdGlvbjogdGhpcy5kZXNjcmlwdGlvbixcbiAgICAgIG51bWJlcjogdGhpcy5udW1iZXIsXG4gICAgICAvLyBNb3ppbGxhXG4gICAgICBmaWxlTmFtZTogdGhpcy5maWxlTmFtZSxcbiAgICAgIGxpbmVOdW1iZXI6IHRoaXMubGluZU51bWJlcixcbiAgICAgIGNvbHVtbk51bWJlcjogdGhpcy5jb2x1bW5OdW1iZXIsXG4gICAgICBzdGFjazogdGhpcy5zdGFjayxcbiAgICAgIC8vIEF4aW9zXG4gICAgICBjb25maWc6IHRoaXMuY29uZmlnLFxuICAgICAgY29kZTogdGhpcy5jb2RlXG4gICAgfTtcbiAgfTtcbiAgcmV0dXJuIGVycm9yO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxuLyoqXG4gKiBDb25maWctc3BlY2lmaWMgbWVyZ2UtZnVuY3Rpb24gd2hpY2ggY3JlYXRlcyBhIG5ldyBjb25maWctb2JqZWN0XG4gKiBieSBtZXJnaW5nIHR3byBjb25maWd1cmF0aW9uIG9iamVjdHMgdG9nZXRoZXIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZzFcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcyXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBOZXcgb2JqZWN0IHJlc3VsdGluZyBmcm9tIG1lcmdpbmcgY29uZmlnMiB0byBjb25maWcxXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbWVyZ2VDb25maWcoY29uZmlnMSwgY29uZmlnMikge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgY29uZmlnMiA9IGNvbmZpZzIgfHwge307XG4gIHZhciBjb25maWcgPSB7fTtcblxuICB2YXIgdmFsdWVGcm9tQ29uZmlnMktleXMgPSBbJ3VybCcsICdtZXRob2QnLCAnZGF0YSddO1xuICB2YXIgbWVyZ2VEZWVwUHJvcGVydGllc0tleXMgPSBbJ2hlYWRlcnMnLCAnYXV0aCcsICdwcm94eScsICdwYXJhbXMnXTtcbiAgdmFyIGRlZmF1bHRUb0NvbmZpZzJLZXlzID0gW1xuICAgICdiYXNlVVJMJywgJ3RyYW5zZm9ybVJlcXVlc3QnLCAndHJhbnNmb3JtUmVzcG9uc2UnLCAncGFyYW1zU2VyaWFsaXplcicsXG4gICAgJ3RpbWVvdXQnLCAndGltZW91dE1lc3NhZ2UnLCAnd2l0aENyZWRlbnRpYWxzJywgJ2FkYXB0ZXInLCAncmVzcG9uc2VUeXBlJywgJ3hzcmZDb29raWVOYW1lJyxcbiAgICAneHNyZkhlYWRlck5hbWUnLCAnb25VcGxvYWRQcm9ncmVzcycsICdvbkRvd25sb2FkUHJvZ3Jlc3MnLCAnZGVjb21wcmVzcycsXG4gICAgJ21heENvbnRlbnRMZW5ndGgnLCAnbWF4Qm9keUxlbmd0aCcsICdtYXhSZWRpcmVjdHMnLCAndHJhbnNwb3J0JywgJ2h0dHBBZ2VudCcsXG4gICAgJ2h0dHBzQWdlbnQnLCAnY2FuY2VsVG9rZW4nLCAnc29ja2V0UGF0aCcsICdyZXNwb25zZUVuY29kaW5nJ1xuICBdO1xuICB2YXIgZGlyZWN0TWVyZ2VLZXlzID0gWyd2YWxpZGF0ZVN0YXR1cyddO1xuXG4gIGZ1bmN0aW9uIGdldE1lcmdlZFZhbHVlKHRhcmdldCwgc291cmNlKSB7XG4gICAgaWYgKHV0aWxzLmlzUGxhaW5PYmplY3QodGFyZ2V0KSAmJiB1dGlscy5pc1BsYWluT2JqZWN0KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiB1dGlscy5tZXJnZSh0YXJnZXQsIHNvdXJjZSk7XG4gICAgfSBlbHNlIGlmICh1dGlscy5pc1BsYWluT2JqZWN0KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiB1dGlscy5tZXJnZSh7fSwgc291cmNlKTtcbiAgICB9IGVsc2UgaWYgKHV0aWxzLmlzQXJyYXkoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHNvdXJjZS5zbGljZSgpO1xuICAgIH1cbiAgICByZXR1cm4gc291cmNlO1xuICB9XG5cbiAgZnVuY3Rpb24gbWVyZ2VEZWVwUHJvcGVydGllcyhwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUoY29uZmlnMVtwcm9wXSwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMVtwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9XG5cbiAgdXRpbHMuZm9yRWFjaCh2YWx1ZUZyb21Db25maWcyS2V5cywgZnVuY3Rpb24gdmFsdWVGcm9tQ29uZmlnMihwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcyW3Byb3BdKTtcbiAgICB9XG4gIH0pO1xuXG4gIHV0aWxzLmZvckVhY2gobWVyZ2VEZWVwUHJvcGVydGllc0tleXMsIG1lcmdlRGVlcFByb3BlcnRpZXMpO1xuXG4gIHV0aWxzLmZvckVhY2goZGVmYXVsdFRvQ29uZmlnMktleXMsIGZ1bmN0aW9uIGRlZmF1bHRUb0NvbmZpZzIocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMVtwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9KTtcblxuICB1dGlscy5mb3JFYWNoKGRpcmVjdE1lcmdlS2V5cywgZnVuY3Rpb24gbWVyZ2UocHJvcCkge1xuICAgIGlmIChwcm9wIGluIGNvbmZpZzIpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKGNvbmZpZzFbcHJvcF0sIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAocHJvcCBpbiBjb25maWcxKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIGF4aW9zS2V5cyA9IHZhbHVlRnJvbUNvbmZpZzJLZXlzXG4gICAgLmNvbmNhdChtZXJnZURlZXBQcm9wZXJ0aWVzS2V5cylcbiAgICAuY29uY2F0KGRlZmF1bHRUb0NvbmZpZzJLZXlzKVxuICAgIC5jb25jYXQoZGlyZWN0TWVyZ2VLZXlzKTtcblxuICB2YXIgb3RoZXJLZXlzID0gT2JqZWN0XG4gICAgLmtleXMoY29uZmlnMSlcbiAgICAuY29uY2F0KE9iamVjdC5rZXlzKGNvbmZpZzIpKVxuICAgIC5maWx0ZXIoZnVuY3Rpb24gZmlsdGVyQXhpb3NLZXlzKGtleSkge1xuICAgICAgcmV0dXJuIGF4aW9zS2V5cy5pbmRleE9mKGtleSkgPT09IC0xO1xuICAgIH0pO1xuXG4gIHV0aWxzLmZvckVhY2gob3RoZXJLZXlzLCBtZXJnZURlZXBQcm9wZXJ0aWVzKTtcblxuICByZXR1cm4gY29uZmlnO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNyZWF0ZUVycm9yID0gcmVxdWlyZSgnLi9jcmVhdGVFcnJvcicpO1xuXG4vKipcbiAqIFJlc29sdmUgb3IgcmVqZWN0IGEgUHJvbWlzZSBiYXNlZCBvbiByZXNwb25zZSBzdGF0dXMuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVzb2x2ZSBBIGZ1bmN0aW9uIHRoYXQgcmVzb2x2ZXMgdGhlIHByb21pc2UuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWplY3QgQSBmdW5jdGlvbiB0aGF0IHJlamVjdHMgdGhlIHByb21pc2UuXG4gKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgVGhlIHJlc3BvbnNlLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHJlc3BvbnNlKSB7XG4gIHZhciB2YWxpZGF0ZVN0YXR1cyA9IHJlc3BvbnNlLmNvbmZpZy52YWxpZGF0ZVN0YXR1cztcbiAgaWYgKCFyZXNwb25zZS5zdGF0dXMgfHwgIXZhbGlkYXRlU3RhdHVzIHx8IHZhbGlkYXRlU3RhdHVzKHJlc3BvbnNlLnN0YXR1cykpIHtcbiAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgfSBlbHNlIHtcbiAgICByZWplY3QoY3JlYXRlRXJyb3IoXG4gICAgICAnUmVxdWVzdCBmYWlsZWQgd2l0aCBzdGF0dXMgY29kZSAnICsgcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgcmVzcG9uc2UuY29uZmlnLFxuICAgICAgbnVsbCxcbiAgICAgIHJlc3BvbnNlLnJlcXVlc3QsXG4gICAgICByZXNwb25zZVxuICAgICkpO1xuICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbi8qKlxuICogVHJhbnNmb3JtIHRoZSBkYXRhIGZvciBhIHJlcXVlc3Qgb3IgYSByZXNwb25zZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gZGF0YSBUaGUgZGF0YSB0byBiZSB0cmFuc2Zvcm1lZFxuICogQHBhcmFtIHtBcnJheX0gaGVhZGVycyBUaGUgaGVhZGVycyBmb3IgdGhlIHJlcXVlc3Qgb3IgcmVzcG9uc2VcbiAqIEBwYXJhbSB7QXJyYXl8RnVuY3Rpb259IGZucyBBIHNpbmdsZSBmdW5jdGlvbiBvciBBcnJheSBvZiBmdW5jdGlvbnNcbiAqIEByZXR1cm5zIHsqfSBUaGUgcmVzdWx0aW5nIHRyYW5zZm9ybWVkIGRhdGFcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0cmFuc2Zvcm1EYXRhKGRhdGEsIGhlYWRlcnMsIGZucykge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgdXRpbHMuZm9yRWFjaChmbnMsIGZ1bmN0aW9uIHRyYW5zZm9ybShmbikge1xuICAgIGRhdGEgPSBmbihkYXRhLCBoZWFkZXJzKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGRhdGE7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgbm9ybWFsaXplSGVhZGVyTmFtZSA9IHJlcXVpcmUoJy4vaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lJyk7XG5cbnZhciBERUZBVUxUX0NPTlRFTlRfVFlQRSA9IHtcbiAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG59O1xuXG5mdW5jdGlvbiBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgdmFsdWUpIHtcbiAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzKSAmJiB1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzWydDb250ZW50LVR5cGUnXSkpIHtcbiAgICBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9IHZhbHVlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldERlZmF1bHRBZGFwdGVyKCkge1xuICB2YXIgYWRhcHRlcjtcbiAgaWYgKHR5cGVvZiBYTUxIdHRwUmVxdWVzdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBGb3IgYnJvd3NlcnMgdXNlIFhIUiBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4vYWRhcHRlcnMveGhyJyk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChwcm9jZXNzKSA9PT0gJ1tvYmplY3QgcHJvY2Vzc10nKSB7XG4gICAgLy8gRm9yIG5vZGUgdXNlIEhUVFAgYWRhcHRlclxuICAgIGFkYXB0ZXIgPSByZXF1aXJlKCcuL2FkYXB0ZXJzL2h0dHAnKTtcbiAgfVxuICByZXR1cm4gYWRhcHRlcjtcbn1cblxudmFyIGRlZmF1bHRzID0ge1xuICBhZGFwdGVyOiBnZXREZWZhdWx0QWRhcHRlcigpLFxuXG4gIHRyYW5zZm9ybVJlcXVlc3Q6IFtmdW5jdGlvbiB0cmFuc2Zvcm1SZXF1ZXN0KGRhdGEsIGhlYWRlcnMpIHtcbiAgICBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsICdBY2NlcHQnKTtcbiAgICBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsICdDb250ZW50LVR5cGUnKTtcbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNBcnJheUJ1ZmZlcihkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzU3RyZWFtKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0ZpbGUoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQmxvYihkYXRhKVxuICAgICkge1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc0FycmF5QnVmZmVyVmlldyhkYXRhKSkge1xuICAgICAgcmV0dXJuIGRhdGEuYnVmZmVyO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMoZGF0YSkpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc09iamVjdChkYXRhKSkge1xuICAgICAgc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsICdhcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIHRyYW5zZm9ybVJlc3BvbnNlOiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVzcG9uc2UoZGF0YSkge1xuICAgIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGRhdGEgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgfSBjYXRjaCAoZSkgeyAvKiBJZ25vcmUgKi8gfVxuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgLyoqXG4gICAqIEEgdGltZW91dCBpbiBtaWxsaXNlY29uZHMgdG8gYWJvcnQgYSByZXF1ZXN0LiBJZiBzZXQgdG8gMCAoZGVmYXVsdCkgYVxuICAgKiB0aW1lb3V0IGlzIG5vdCBjcmVhdGVkLlxuICAgKi9cbiAgdGltZW91dDogMCxcblxuICB4c3JmQ29va2llTmFtZTogJ1hTUkYtVE9LRU4nLFxuICB4c3JmSGVhZGVyTmFtZTogJ1gtWFNSRi1UT0tFTicsXG5cbiAgbWF4Q29udGVudExlbmd0aDogLTEsXG4gIG1heEJvZHlMZW5ndGg6IC0xLFxuXG4gIHZhbGlkYXRlU3RhdHVzOiBmdW5jdGlvbiB2YWxpZGF0ZVN0YXR1cyhzdGF0dXMpIHtcbiAgICByZXR1cm4gc3RhdHVzID49IDIwMCAmJiBzdGF0dXMgPCAzMDA7XG4gIH1cbn07XG5cbmRlZmF1bHRzLmhlYWRlcnMgPSB7XG4gIGNvbW1vbjoge1xuICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbiwgdGV4dC9wbGFpbiwgKi8qJ1xuICB9XG59O1xuXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2ROb0RhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHt9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHV0aWxzLm1lcmdlKERFRkFVTFRfQ09OVEVOVF9UWVBFKTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmF1bHRzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJpbmQoZm4sIHRoaXNBcmcpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHdyYXAoKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhcmdzW2ldID0gYXJndW1lbnRzW2ldO1xuICAgIH1cbiAgICByZXR1cm4gZm4uYXBwbHkodGhpc0FyZywgYXJncyk7XG4gIH07XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbmZ1bmN0aW9uIGVuY29kZSh2YWwpIHtcbiAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudCh2YWwpLlxuICAgIHJlcGxhY2UoLyUzQS9naSwgJzonKS5cbiAgICByZXBsYWNlKC8lMjQvZywgJyQnKS5cbiAgICByZXBsYWNlKC8lMkMvZ2ksICcsJykuXG4gICAgcmVwbGFjZSgvJTIwL2csICcrJykuXG4gICAgcmVwbGFjZSgvJTVCL2dpLCAnWycpLlxuICAgIHJlcGxhY2UoLyU1RC9naSwgJ10nKTtcbn1cblxuLyoqXG4gKiBCdWlsZCBhIFVSTCBieSBhcHBlbmRpbmcgcGFyYW1zIHRvIHRoZSBlbmRcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIFRoZSBiYXNlIG9mIHRoZSB1cmwgKGUuZy4sIGh0dHA6Ly93d3cuZ29vZ2xlLmNvbSlcbiAqIEBwYXJhbSB7b2JqZWN0fSBbcGFyYW1zXSBUaGUgcGFyYW1zIHRvIGJlIGFwcGVuZGVkXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgZm9ybWF0dGVkIHVybFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJ1aWxkVVJMKHVybCwgcGFyYW1zLCBwYXJhbXNTZXJpYWxpemVyKSB7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICBpZiAoIXBhcmFtcykge1xuICAgIHJldHVybiB1cmw7XG4gIH1cblxuICB2YXIgc2VyaWFsaXplZFBhcmFtcztcbiAgaWYgKHBhcmFtc1NlcmlhbGl6ZXIpIHtcbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFyYW1zU2VyaWFsaXplcihwYXJhbXMpO1xuICB9IGVsc2UgaWYgKHV0aWxzLmlzVVJMU2VhcmNoUGFyYW1zKHBhcmFtcykpIHtcbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFyYW1zLnRvU3RyaW5nKCk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIHBhcnRzID0gW107XG5cbiAgICB1dGlscy5mb3JFYWNoKHBhcmFtcywgZnVuY3Rpb24gc2VyaWFsaXplKHZhbCwga2V5KSB7XG4gICAgICBpZiAodmFsID09PSBudWxsIHx8IHR5cGVvZiB2YWwgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHV0aWxzLmlzQXJyYXkodmFsKSkge1xuICAgICAgICBrZXkgPSBrZXkgKyAnW10nO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsID0gW3ZhbF07XG4gICAgICB9XG5cbiAgICAgIHV0aWxzLmZvckVhY2godmFsLCBmdW5jdGlvbiBwYXJzZVZhbHVlKHYpIHtcbiAgICAgICAgaWYgKHV0aWxzLmlzRGF0ZSh2KSkge1xuICAgICAgICAgIHYgPSB2LnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodXRpbHMuaXNPYmplY3QodikpIHtcbiAgICAgICAgICB2ID0gSlNPTi5zdHJpbmdpZnkodik7XG4gICAgICAgIH1cbiAgICAgICAgcGFydHMucHVzaChlbmNvZGUoa2V5KSArICc9JyArIGVuY29kZSh2KSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJ0cy5qb2luKCcmJyk7XG4gIH1cblxuICBpZiAoc2VyaWFsaXplZFBhcmFtcykge1xuICAgIHZhciBoYXNobWFya0luZGV4ID0gdXJsLmluZGV4T2YoJyMnKTtcbiAgICBpZiAoaGFzaG1hcmtJbmRleCAhPT0gLTEpIHtcbiAgICAgIHVybCA9IHVybC5zbGljZSgwLCBoYXNobWFya0luZGV4KTtcbiAgICB9XG5cbiAgICB1cmwgKz0gKHVybC5pbmRleE9mKCc/JykgPT09IC0xID8gJz8nIDogJyYnKSArIHNlcmlhbGl6ZWRQYXJhbXM7XG4gIH1cblxuICByZXR1cm4gdXJsO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IFVSTCBieSBjb21iaW5pbmcgdGhlIHNwZWNpZmllZCBVUkxzXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VVUkwgVGhlIGJhc2UgVVJMXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpdmVVUkwgVGhlIHJlbGF0aXZlIFVSTFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGNvbWJpbmVkIFVSTFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNvbWJpbmVVUkxzKGJhc2VVUkwsIHJlbGF0aXZlVVJMKSB7XG4gIHJldHVybiByZWxhdGl2ZVVSTFxuICAgID8gYmFzZVVSTC5yZXBsYWNlKC9cXC8rJC8sICcnKSArICcvJyArIHJlbGF0aXZlVVJMLnJlcGxhY2UoL15cXC8rLywgJycpXG4gICAgOiBiYXNlVVJMO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChcbiAgdXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSA/XG5cbiAgLy8gU3RhbmRhcmQgYnJvd3NlciBlbnZzIHN1cHBvcnQgZG9jdW1lbnQuY29va2llXG4gICAgKGZ1bmN0aW9uIHN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHdyaXRlOiBmdW5jdGlvbiB3cml0ZShuYW1lLCB2YWx1ZSwgZXhwaXJlcywgcGF0aCwgZG9tYWluLCBzZWN1cmUpIHtcbiAgICAgICAgICB2YXIgY29va2llID0gW107XG4gICAgICAgICAgY29va2llLnB1c2gobmFtZSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpO1xuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzTnVtYmVyKGV4cGlyZXMpKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnZXhwaXJlcz0nICsgbmV3IERhdGUoZXhwaXJlcykudG9HTVRTdHJpbmcoKSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzU3RyaW5nKHBhdGgpKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgncGF0aD0nICsgcGF0aCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzU3RyaW5nKGRvbWFpbikpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdkb21haW49JyArIGRvbWFpbik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHNlY3VyZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ3NlY3VyZScpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGRvY3VtZW50LmNvb2tpZSA9IGNvb2tpZS5qb2luKCc7ICcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlYWQ6IGZ1bmN0aW9uIHJlYWQobmFtZSkge1xuICAgICAgICAgIHZhciBtYXRjaCA9IGRvY3VtZW50LmNvb2tpZS5tYXRjaChuZXcgUmVnRXhwKCcoXnw7XFxcXHMqKSgnICsgbmFtZSArICcpPShbXjtdKiknKSk7XG4gICAgICAgICAgcmV0dXJuIChtYXRjaCA/IGRlY29kZVVSSUNvbXBvbmVudChtYXRjaFszXSkgOiBudWxsKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZShuYW1lKSB7XG4gICAgICAgICAgdGhpcy53cml0ZShuYW1lLCAnJywgRGF0ZS5ub3coKSAtIDg2NDAwMDAwKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KSgpIDpcblxuICAvLyBOb24gc3RhbmRhcmQgYnJvd3NlciBlbnYgKHdlYiB3b3JrZXJzLCByZWFjdC1uYXRpdmUpIGxhY2sgbmVlZGVkIHN1cHBvcnQuXG4gICAgKGZ1bmN0aW9uIG5vblN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHdyaXRlOiBmdW5jdGlvbiB3cml0ZSgpIHt9LFxuICAgICAgICByZWFkOiBmdW5jdGlvbiByZWFkKCkgeyByZXR1cm4gbnVsbDsgfSxcbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7fVxuICAgICAgfTtcbiAgICB9KSgpXG4pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVGhlIFVSTCB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBYnNvbHV0ZVVSTCh1cmwpIHtcbiAgLy8gQSBVUkwgaXMgY29uc2lkZXJlZCBhYnNvbHV0ZSBpZiBpdCBiZWdpbnMgd2l0aCBcIjxzY2hlbWU+Oi8vXCIgb3IgXCIvL1wiIChwcm90b2NvbC1yZWxhdGl2ZSBVUkwpLlxuICAvLyBSRkMgMzk4NiBkZWZpbmVzIHNjaGVtZSBuYW1lIGFzIGEgc2VxdWVuY2Ugb2YgY2hhcmFjdGVycyBiZWdpbm5pbmcgd2l0aCBhIGxldHRlciBhbmQgZm9sbG93ZWRcbiAgLy8gYnkgYW55IGNvbWJpbmF0aW9uIG9mIGxldHRlcnMsIGRpZ2l0cywgcGx1cywgcGVyaW9kLCBvciBoeXBoZW4uXG4gIHJldHVybiAvXihbYS16XVthLXpcXGRcXCtcXC1cXC5dKjopP1xcL1xcLy9pLnRlc3QodXJsKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoXG4gIHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkgP1xuXG4gIC8vIFN0YW5kYXJkIGJyb3dzZXIgZW52cyBoYXZlIGZ1bGwgc3VwcG9ydCBvZiB0aGUgQVBJcyBuZWVkZWQgdG8gdGVzdFxuICAvLyB3aGV0aGVyIHRoZSByZXF1ZXN0IFVSTCBpcyBvZiB0aGUgc2FtZSBvcmlnaW4gYXMgY3VycmVudCBsb2NhdGlvbi5cbiAgICAoZnVuY3Rpb24gc3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgdmFyIG1zaWUgPSAvKG1zaWV8dHJpZGVudCkvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuICAgICAgdmFyIHVybFBhcnNpbmdOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgdmFyIG9yaWdpblVSTDtcblxuICAgICAgLyoqXG4gICAgKiBQYXJzZSBhIFVSTCB0byBkaXNjb3ZlciBpdCdzIGNvbXBvbmVudHNcbiAgICAqXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsIFRoZSBVUkwgdG8gYmUgcGFyc2VkXG4gICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgICovXG4gICAgICBmdW5jdGlvbiByZXNvbHZlVVJMKHVybCkge1xuICAgICAgICB2YXIgaHJlZiA9IHVybDtcblxuICAgICAgICBpZiAobXNpZSkge1xuICAgICAgICAvLyBJRSBuZWVkcyBhdHRyaWJ1dGUgc2V0IHR3aWNlIHRvIG5vcm1hbGl6ZSBwcm9wZXJ0aWVzXG4gICAgICAgICAgdXJsUGFyc2luZ05vZGUuc2V0QXR0cmlidXRlKCdocmVmJywgaHJlZik7XG4gICAgICAgICAgaHJlZiA9IHVybFBhcnNpbmdOb2RlLmhyZWY7XG4gICAgICAgIH1cblxuICAgICAgICB1cmxQYXJzaW5nTm9kZS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBocmVmKTtcblxuICAgICAgICAvLyB1cmxQYXJzaW5nTm9kZSBwcm92aWRlcyB0aGUgVXJsVXRpbHMgaW50ZXJmYWNlIC0gaHR0cDovL3VybC5zcGVjLndoYXR3Zy5vcmcvI3VybHV0aWxzXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaHJlZjogdXJsUGFyc2luZ05vZGUuaHJlZixcbiAgICAgICAgICBwcm90b2NvbDogdXJsUGFyc2luZ05vZGUucHJvdG9jb2wgPyB1cmxQYXJzaW5nTm9kZS5wcm90b2NvbC5yZXBsYWNlKC86JC8sICcnKSA6ICcnLFxuICAgICAgICAgIGhvc3Q6IHVybFBhcnNpbmdOb2RlLmhvc3QsXG4gICAgICAgICAgc2VhcmNoOiB1cmxQYXJzaW5nTm9kZS5zZWFyY2ggPyB1cmxQYXJzaW5nTm9kZS5zZWFyY2gucmVwbGFjZSgvXlxcPy8sICcnKSA6ICcnLFxuICAgICAgICAgIGhhc2g6IHVybFBhcnNpbmdOb2RlLmhhc2ggPyB1cmxQYXJzaW5nTm9kZS5oYXNoLnJlcGxhY2UoL14jLywgJycpIDogJycsXG4gICAgICAgICAgaG9zdG5hbWU6IHVybFBhcnNpbmdOb2RlLmhvc3RuYW1lLFxuICAgICAgICAgIHBvcnQ6IHVybFBhcnNpbmdOb2RlLnBvcnQsXG4gICAgICAgICAgcGF0aG5hbWU6ICh1cmxQYXJzaW5nTm9kZS5wYXRobmFtZS5jaGFyQXQoMCkgPT09ICcvJykgP1xuICAgICAgICAgICAgdXJsUGFyc2luZ05vZGUucGF0aG5hbWUgOlxuICAgICAgICAgICAgJy8nICsgdXJsUGFyc2luZ05vZGUucGF0aG5hbWVcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgb3JpZ2luVVJMID0gcmVzb2x2ZVVSTCh3aW5kb3cubG9jYXRpb24uaHJlZik7XG5cbiAgICAgIC8qKlxuICAgICogRGV0ZXJtaW5lIGlmIGEgVVJMIHNoYXJlcyB0aGUgc2FtZSBvcmlnaW4gYXMgdGhlIGN1cnJlbnQgbG9jYXRpb25cbiAgICAqXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gcmVxdWVzdFVSTCBUaGUgVVJMIHRvIHRlc3RcbiAgICAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIFVSTCBzaGFyZXMgdGhlIHNhbWUgb3JpZ2luLCBvdGhlcndpc2UgZmFsc2VcbiAgICAqL1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIGlzVVJMU2FtZU9yaWdpbihyZXF1ZXN0VVJMKSB7XG4gICAgICAgIHZhciBwYXJzZWQgPSAodXRpbHMuaXNTdHJpbmcocmVxdWVzdFVSTCkpID8gcmVzb2x2ZVVSTChyZXF1ZXN0VVJMKSA6IHJlcXVlc3RVUkw7XG4gICAgICAgIHJldHVybiAocGFyc2VkLnByb3RvY29sID09PSBvcmlnaW5VUkwucHJvdG9jb2wgJiZcbiAgICAgICAgICAgIHBhcnNlZC5ob3N0ID09PSBvcmlnaW5VUkwuaG9zdCk7XG4gICAgICB9O1xuICAgIH0pKCkgOlxuXG4gIC8vIE5vbiBzdGFuZGFyZCBicm93c2VyIGVudnMgKHdlYiB3b3JrZXJzLCByZWFjdC1uYXRpdmUpIGxhY2sgbmVlZGVkIHN1cHBvcnQuXG4gICAgKGZ1bmN0aW9uIG5vblN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiBpc1VSTFNhbWVPcmlnaW4oKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfTtcbiAgICB9KSgpXG4pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgbm9ybWFsaXplZE5hbWUpIHtcbiAgdXRpbHMuZm9yRWFjaChoZWFkZXJzLCBmdW5jdGlvbiBwcm9jZXNzSGVhZGVyKHZhbHVlLCBuYW1lKSB7XG4gICAgaWYgKG5hbWUgIT09IG5vcm1hbGl6ZWROYW1lICYmIG5hbWUudG9VcHBlckNhc2UoKSA9PT0gbm9ybWFsaXplZE5hbWUudG9VcHBlckNhc2UoKSkge1xuICAgICAgaGVhZGVyc1tub3JtYWxpemVkTmFtZV0gPSB2YWx1ZTtcbiAgICAgIGRlbGV0ZSBoZWFkZXJzW25hbWVdO1xuICAgIH1cbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbi8vIEhlYWRlcnMgd2hvc2UgZHVwbGljYXRlcyBhcmUgaWdub3JlZCBieSBub2RlXG4vLyBjLmYuIGh0dHBzOi8vbm9kZWpzLm9yZy9hcGkvaHR0cC5odG1sI2h0dHBfbWVzc2FnZV9oZWFkZXJzXG52YXIgaWdub3JlRHVwbGljYXRlT2YgPSBbXG4gICdhZ2UnLCAnYXV0aG9yaXphdGlvbicsICdjb250ZW50LWxlbmd0aCcsICdjb250ZW50LXR5cGUnLCAnZXRhZycsXG4gICdleHBpcmVzJywgJ2Zyb20nLCAnaG9zdCcsICdpZi1tb2RpZmllZC1zaW5jZScsICdpZi11bm1vZGlmaWVkLXNpbmNlJyxcbiAgJ2xhc3QtbW9kaWZpZWQnLCAnbG9jYXRpb24nLCAnbWF4LWZvcndhcmRzJywgJ3Byb3h5LWF1dGhvcml6YXRpb24nLFxuICAncmVmZXJlcicsICdyZXRyeS1hZnRlcicsICd1c2VyLWFnZW50J1xuXTtcblxuLyoqXG4gKiBQYXJzZSBoZWFkZXJzIGludG8gYW4gb2JqZWN0XG4gKlxuICogYGBgXG4gKiBEYXRlOiBXZWQsIDI3IEF1ZyAyMDE0IDA4OjU4OjQ5IEdNVFxuICogQ29udGVudC1UeXBlOiBhcHBsaWNhdGlvbi9qc29uXG4gKiBDb25uZWN0aW9uOiBrZWVwLWFsaXZlXG4gKiBUcmFuc2Zlci1FbmNvZGluZzogY2h1bmtlZFxuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGhlYWRlcnMgSGVhZGVycyBuZWVkaW5nIHRvIGJlIHBhcnNlZFxuICogQHJldHVybnMge09iamVjdH0gSGVhZGVycyBwYXJzZWQgaW50byBhbiBvYmplY3RcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwYXJzZUhlYWRlcnMoaGVhZGVycykge1xuICB2YXIgcGFyc2VkID0ge307XG4gIHZhciBrZXk7XG4gIHZhciB2YWw7XG4gIHZhciBpO1xuXG4gIGlmICghaGVhZGVycykgeyByZXR1cm4gcGFyc2VkOyB9XG5cbiAgdXRpbHMuZm9yRWFjaChoZWFkZXJzLnNwbGl0KCdcXG4nKSwgZnVuY3Rpb24gcGFyc2VyKGxpbmUpIHtcbiAgICBpID0gbGluZS5pbmRleE9mKCc6Jyk7XG4gICAga2V5ID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cigwLCBpKSkudG9Mb3dlckNhc2UoKTtcbiAgICB2YWwgPSB1dGlscy50cmltKGxpbmUuc3Vic3RyKGkgKyAxKSk7XG5cbiAgICBpZiAoa2V5KSB7XG4gICAgICBpZiAocGFyc2VkW2tleV0gJiYgaWdub3JlRHVwbGljYXRlT2YuaW5kZXhPZihrZXkpID49IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGtleSA9PT0gJ3NldC1jb29raWUnKSB7XG4gICAgICAgIHBhcnNlZFtrZXldID0gKHBhcnNlZFtrZXldID8gcGFyc2VkW2tleV0gOiBbXSkuY29uY2F0KFt2YWxdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcnNlZFtrZXldID0gcGFyc2VkW2tleV0gPyBwYXJzZWRba2V5XSArICcsICcgKyB2YWwgOiB2YWw7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gcGFyc2VkO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBTeW50YWN0aWMgc3VnYXIgZm9yIGludm9raW5nIGEgZnVuY3Rpb24gYW5kIGV4cGFuZGluZyBhbiBhcnJheSBmb3IgYXJndW1lbnRzLlxuICpcbiAqIENvbW1vbiB1c2UgY2FzZSB3b3VsZCBiZSB0byB1c2UgYEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseWAuXG4gKlxuICogIGBgYGpzXG4gKiAgZnVuY3Rpb24gZih4LCB5LCB6KSB7fVxuICogIHZhciBhcmdzID0gWzEsIDIsIDNdO1xuICogIGYuYXBwbHkobnVsbCwgYXJncyk7XG4gKiAgYGBgXG4gKlxuICogV2l0aCBgc3ByZWFkYCB0aGlzIGV4YW1wbGUgY2FuIGJlIHJlLXdyaXR0ZW4uXG4gKlxuICogIGBgYGpzXG4gKiAgc3ByZWFkKGZ1bmN0aW9uKHgsIHksIHopIHt9KShbMSwgMiwgM10pO1xuICogIGBgYFxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc3ByZWFkKGNhbGxiYWNrKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKGFycikge1xuICAgIHJldHVybiBjYWxsYmFjay5hcHBseShudWxsLCBhcnIpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGJpbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvYmluZCcpO1xuXG4vKmdsb2JhbCB0b1N0cmluZzp0cnVlKi9cblxuLy8gdXRpbHMgaXMgYSBsaWJyYXJ5IG9mIGdlbmVyaWMgaGVscGVyIGZ1bmN0aW9ucyBub24tc3BlY2lmaWMgdG8gYXhpb3NcblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyB1bmRlZmluZWRcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmFsdWUgaXMgdW5kZWZpbmVkLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVbmRlZmluZWQodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgQnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNCdWZmZXIodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgIWlzVW5kZWZpbmVkKHZhbCkgJiYgdmFsLmNvbnN0cnVjdG9yICE9PSBudWxsICYmICFpc1VuZGVmaW5lZCh2YWwuY29uc3RydWN0b3IpXG4gICAgJiYgdHlwZW9mIHZhbC5jb25zdHJ1Y3Rvci5pc0J1ZmZlciA9PT0gJ2Z1bmN0aW9uJyAmJiB2YWwuY29uc3RydWN0b3IuaXNCdWZmZXIodmFsKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5QnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlcih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZvcm1EYXRhXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gRm9ybURhdGEsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Zvcm1EYXRhKHZhbCkge1xuICByZXR1cm4gKHR5cGVvZiBGb3JtRGF0YSAhPT0gJ3VuZGVmaW5lZCcpICYmICh2YWwgaW5zdGFuY2VvZiBGb3JtRGF0YSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSB2aWV3IG9uIGFuIEFycmF5QnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSB2aWV3IG9uIGFuIEFycmF5QnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlclZpZXcodmFsKSB7XG4gIHZhciByZXN1bHQ7XG4gIGlmICgodHlwZW9mIEFycmF5QnVmZmVyICE9PSAndW5kZWZpbmVkJykgJiYgKEFycmF5QnVmZmVyLmlzVmlldykpIHtcbiAgICByZXN1bHQgPSBBcnJheUJ1ZmZlci5pc1ZpZXcodmFsKTtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQgPSAodmFsKSAmJiAodmFsLmJ1ZmZlcikgJiYgKHZhbC5idWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcik7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFN0cmluZ1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgU3RyaW5nLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTdHJpbmcodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAnc3RyaW5nJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIE51bWJlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgTnVtYmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNOdW1iZXIodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAnbnVtYmVyJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBPYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBPYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0Jztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIHBsYWluIE9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBwbGFpbiBPYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1BsYWluT2JqZWN0KHZhbCkge1xuICBpZiAodG9TdHJpbmcuY2FsbCh2YWwpICE9PSAnW29iamVjdCBPYmplY3RdJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBwcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsKTtcbiAgcmV0dXJuIHByb3RvdHlwZSA9PT0gbnVsbCB8fCBwcm90b3R5cGUgPT09IE9iamVjdC5wcm90b3R5cGU7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBEYXRlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBEYXRlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNEYXRlKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGaWxlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBGaWxlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGaWxlKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGaWxlXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBCbG9iXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBCbG9iLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNCbG9iKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBCbG9iXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGdW5jdGlvblxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRnVuY3Rpb24sIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgU3RyZWFtXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBTdHJlYW0sIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N0cmVhbSh2YWwpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHZhbCkgJiYgaXNGdW5jdGlvbih2YWwucGlwZSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVUkxTZWFyY2hQYXJhbXModmFsKSB7XG4gIHJldHVybiB0eXBlb2YgVVJMU2VhcmNoUGFyYW1zICE9PSAndW5kZWZpbmVkJyAmJiB2YWwgaW5zdGFuY2VvZiBVUkxTZWFyY2hQYXJhbXM7XG59XG5cbi8qKlxuICogVHJpbSBleGNlc3Mgd2hpdGVzcGFjZSBvZmYgdGhlIGJlZ2lubmluZyBhbmQgZW5kIG9mIGEgc3RyaW5nXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0ciBUaGUgU3RyaW5nIHRvIHRyaW1cbiAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBTdHJpbmcgZnJlZWQgb2YgZXhjZXNzIHdoaXRlc3BhY2VcbiAqL1xuZnVuY3Rpb24gdHJpbShzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzKi8sICcnKS5yZXBsYWNlKC9cXHMqJC8sICcnKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgd2UncmUgcnVubmluZyBpbiBhIHN0YW5kYXJkIGJyb3dzZXIgZW52aXJvbm1lbnRcbiAqXG4gKiBUaGlzIGFsbG93cyBheGlvcyB0byBydW4gaW4gYSB3ZWIgd29ya2VyLCBhbmQgcmVhY3QtbmF0aXZlLlxuICogQm90aCBlbnZpcm9ubWVudHMgc3VwcG9ydCBYTUxIdHRwUmVxdWVzdCwgYnV0IG5vdCBmdWxseSBzdGFuZGFyZCBnbG9iYWxzLlxuICpcbiAqIHdlYiB3b3JrZXJzOlxuICogIHR5cGVvZiB3aW5kb3cgLT4gdW5kZWZpbmVkXG4gKiAgdHlwZW9mIGRvY3VtZW50IC0+IHVuZGVmaW5lZFxuICpcbiAqIHJlYWN0LW5hdGl2ZTpcbiAqICBuYXZpZ2F0b3IucHJvZHVjdCAtPiAnUmVhY3ROYXRpdmUnXG4gKiBuYXRpdmVzY3JpcHRcbiAqICBuYXZpZ2F0b3IucHJvZHVjdCAtPiAnTmF0aXZlU2NyaXB0JyBvciAnTlMnXG4gKi9cbmZ1bmN0aW9uIGlzU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICBpZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgKG5hdmlnYXRvci5wcm9kdWN0ID09PSAnUmVhY3ROYXRpdmUnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLnByb2R1Y3QgPT09ICdOYXRpdmVTY3JpcHQnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLnByb2R1Y3QgPT09ICdOUycpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiAoXG4gICAgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnXG4gICk7XG59XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFuIEFycmF5IG9yIGFuIE9iamVjdCBpbnZva2luZyBhIGZ1bmN0aW9uIGZvciBlYWNoIGl0ZW0uXG4gKlxuICogSWYgYG9iamAgaXMgYW4gQXJyYXkgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgcGFzc2luZ1xuICogdGhlIHZhbHVlLCBpbmRleCwgYW5kIGNvbXBsZXRlIGFycmF5IGZvciBlYWNoIGl0ZW0uXG4gKlxuICogSWYgJ29iaicgaXMgYW4gT2JqZWN0IGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIHBhc3NpbmdcbiAqIHRoZSB2YWx1ZSwga2V5LCBhbmQgY29tcGxldGUgb2JqZWN0IGZvciBlYWNoIHByb3BlcnR5LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fEFycmF5fSBvYmogVGhlIG9iamVjdCB0byBpdGVyYXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgY2FsbGJhY2sgdG8gaW52b2tlIGZvciBlYWNoIGl0ZW1cbiAqL1xuZnVuY3Rpb24gZm9yRWFjaChvYmosIGZuKSB7XG4gIC8vIERvbid0IGJvdGhlciBpZiBubyB2YWx1ZSBwcm92aWRlZFxuICBpZiAob2JqID09PSBudWxsIHx8IHR5cGVvZiBvYmogPT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gRm9yY2UgYW4gYXJyYXkgaWYgbm90IGFscmVhZHkgc29tZXRoaW5nIGl0ZXJhYmxlXG4gIGlmICh0eXBlb2Ygb2JqICE9PSAnb2JqZWN0Jykge1xuICAgIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAgIG9iaiA9IFtvYmpdO1xuICB9XG5cbiAgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgIC8vIEl0ZXJhdGUgb3ZlciBhcnJheSB2YWx1ZXNcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IG9iai5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGZuLmNhbGwobnVsbCwgb2JqW2ldLCBpLCBvYmopO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBJdGVyYXRlIG92ZXIgb2JqZWN0IGtleXNcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkge1xuICAgICAgICBmbi5jYWxsKG51bGwsIG9ialtrZXldLCBrZXksIG9iaik7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQWNjZXB0cyB2YXJhcmdzIGV4cGVjdGluZyBlYWNoIGFyZ3VtZW50IHRvIGJlIGFuIG9iamVjdCwgdGhlblxuICogaW1tdXRhYmx5IG1lcmdlcyB0aGUgcHJvcGVydGllcyBvZiBlYWNoIG9iamVjdCBhbmQgcmV0dXJucyByZXN1bHQuXG4gKlxuICogV2hlbiBtdWx0aXBsZSBvYmplY3RzIGNvbnRhaW4gdGhlIHNhbWUga2V5IHRoZSBsYXRlciBvYmplY3QgaW5cbiAqIHRoZSBhcmd1bWVudHMgbGlzdCB3aWxsIHRha2UgcHJlY2VkZW5jZS5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqIGBgYGpzXG4gKiB2YXIgcmVzdWx0ID0gbWVyZ2Uoe2ZvbzogMTIzfSwge2ZvbzogNDU2fSk7XG4gKiBjb25zb2xlLmxvZyhyZXN1bHQuZm9vKTsgLy8gb3V0cHV0cyA0NTZcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmoxIE9iamVjdCB0byBtZXJnZVxuICogQHJldHVybnMge09iamVjdH0gUmVzdWx0IG9mIGFsbCBtZXJnZSBwcm9wZXJ0aWVzXG4gKi9cbmZ1bmN0aW9uIG1lcmdlKC8qIG9iajEsIG9iajIsIG9iajMsIC4uLiAqLykge1xuICB2YXIgcmVzdWx0ID0ge307XG4gIGZ1bmN0aW9uIGFzc2lnblZhbHVlKHZhbCwga2V5KSB7XG4gICAgaWYgKGlzUGxhaW5PYmplY3QocmVzdWx0W2tleV0pICYmIGlzUGxhaW5PYmplY3QodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSBtZXJnZShyZXN1bHRba2V5XSwgdmFsKTtcbiAgICB9IGVsc2UgaWYgKGlzUGxhaW5PYmplY3QodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSBtZXJnZSh7fSwgdmFsKTtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWwuc2xpY2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWw7XG4gICAgfVxuICB9XG5cbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgZm9yRWFjaChhcmd1bWVudHNbaV0sIGFzc2lnblZhbHVlKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEV4dGVuZHMgb2JqZWN0IGEgYnkgbXV0YWJseSBhZGRpbmcgdG8gaXQgdGhlIHByb3BlcnRpZXMgb2Ygb2JqZWN0IGIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGEgVGhlIG9iamVjdCB0byBiZSBleHRlbmRlZFxuICogQHBhcmFtIHtPYmplY3R9IGIgVGhlIG9iamVjdCB0byBjb3B5IHByb3BlcnRpZXMgZnJvbVxuICogQHBhcmFtIHtPYmplY3R9IHRoaXNBcmcgVGhlIG9iamVjdCB0byBiaW5kIGZ1bmN0aW9uIHRvXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSByZXN1bHRpbmcgdmFsdWUgb2Ygb2JqZWN0IGFcbiAqL1xuZnVuY3Rpb24gZXh0ZW5kKGEsIGIsIHRoaXNBcmcpIHtcbiAgZm9yRWFjaChiLCBmdW5jdGlvbiBhc3NpZ25WYWx1ZSh2YWwsIGtleSkge1xuICAgIGlmICh0aGlzQXJnICYmIHR5cGVvZiB2YWwgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGFba2V5XSA9IGJpbmQodmFsLCB0aGlzQXJnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYVtrZXldID0gdmFsO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBhO1xufVxuXG4vKipcbiAqIFJlbW92ZSBieXRlIG9yZGVyIG1hcmtlci4gVGhpcyBjYXRjaGVzIEVGIEJCIEJGICh0aGUgVVRGLTggQk9NKVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZW50IHdpdGggQk9NXG4gKiBAcmV0dXJuIHtzdHJpbmd9IGNvbnRlbnQgdmFsdWUgd2l0aG91dCBCT01cbiAqL1xuZnVuY3Rpb24gc3RyaXBCT00oY29udGVudCkge1xuICBpZiAoY29udGVudC5jaGFyQ29kZUF0KDApID09PSAweEZFRkYpIHtcbiAgICBjb250ZW50ID0gY29udGVudC5zbGljZSgxKTtcbiAgfVxuICByZXR1cm4gY29udGVudDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzQXJyYXk6IGlzQXJyYXksXG4gIGlzQXJyYXlCdWZmZXI6IGlzQXJyYXlCdWZmZXIsXG4gIGlzQnVmZmVyOiBpc0J1ZmZlcixcbiAgaXNGb3JtRGF0YTogaXNGb3JtRGF0YSxcbiAgaXNBcnJheUJ1ZmZlclZpZXc6IGlzQXJyYXlCdWZmZXJWaWV3LFxuICBpc1N0cmluZzogaXNTdHJpbmcsXG4gIGlzTnVtYmVyOiBpc051bWJlcixcbiAgaXNPYmplY3Q6IGlzT2JqZWN0LFxuICBpc1BsYWluT2JqZWN0OiBpc1BsYWluT2JqZWN0LFxuICBpc1VuZGVmaW5lZDogaXNVbmRlZmluZWQsXG4gIGlzRGF0ZTogaXNEYXRlLFxuICBpc0ZpbGU6IGlzRmlsZSxcbiAgaXNCbG9iOiBpc0Jsb2IsXG4gIGlzRnVuY3Rpb246IGlzRnVuY3Rpb24sXG4gIGlzU3RyZWFtOiBpc1N0cmVhbSxcbiAgaXNVUkxTZWFyY2hQYXJhbXM6IGlzVVJMU2VhcmNoUGFyYW1zLFxuICBpc1N0YW5kYXJkQnJvd3NlckVudjogaXNTdGFuZGFyZEJyb3dzZXJFbnYsXG4gIGZvckVhY2g6IGZvckVhY2gsXG4gIG1lcmdlOiBtZXJnZSxcbiAgZXh0ZW5kOiBleHRlbmQsXG4gIHRyaW06IHRyaW0sXG4gIHN0cmlwQk9NOiBzdHJpcEJPTVxufTtcbiIsIi8vIEltcG9ydHNcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fIGZyb20gXCIuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvY3NzV2l0aE1hcHBpbmdUb1N0cmluZy5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyBmcm9tIFwiLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfR0VUX1VSTF9JTVBPUlRfX18gZnJvbSBcIi4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9nZXRVcmwuanNcIjtcbmltcG9ydCBfX19DU1NfTE9BREVSX1VSTF9JTVBPUlRfMF9fXyBmcm9tIFwiLi4vaW1nL2xvZ2luLWJnLmpwZ1wiO1xudmFyIF9fX0NTU19MT0FERVJfRVhQT1JUX19fID0gX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fKF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18pO1xudmFyIF9fX0NTU19MT0FERVJfVVJMX1JFUExBQ0VNRU5UXzBfX18gPSBfX19DU1NfTE9BREVSX0dFVF9VUkxfSU1QT1JUX19fKF9fX0NTU19MT0FERVJfVVJMX0lNUE9SVF8wX19fKTtcbi8vIE1vZHVsZVxuX19fQ1NTX0xPQURFUl9FWFBPUlRfX18ucHVzaChbbW9kdWxlLmlkLCBcIiosXFxuKjo6YWZ0ZXIsXFxuKjo6YmVmb3JlIHtcXG4gIG1hcmdpbjogMDtcXG4gIHBhZGRpbmc6IDA7XFxuICBib3gtc2l6aW5nOiBpbmhlcml0OyB9XFxuXFxuaHRtbCB7XFxuICBmb250LXNpemU6IDYyLjUlOyB9XFxuXFxuYm9keSB7XFxuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbiAgb3ZlcmZsb3cteDogaGlkZGVuO1xcbiAgZm9udC1zaXplOiAxLjZyZW07XFxuICBiYWNrZ3JvdW5kLXNpemU6IGNvdmVyO1xcbiAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcXG4gIGhlaWdodDogMTI3LjVyZW07XFxuICBmb250LWZhbWlseTogJ0xhdG8nLCBzYW5zLXNlcmlmOyB9XFxuXFxuW2hpZGRlbl0ge1xcbiAgZGlzcGxheTogbm9uZSAhaW1wb3J0YW50OyB9XFxuXFxuLmhlYWRpbmctdGVydGlhcnkge1xcbiAgZm9udC1zaXplOiAyLjRyZW07XFxuICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOyB9XFxuICAuaGVhZGluZy10ZXJ0aWFyeS0td2hpdGUge1xcbiAgICBjb2xvcjogI2ZmZjsgfVxcblxcbi5tYi0xMCB7XFxuICBtYXJnaW4tYm90dG9tOiAxcmVtOyB9XFxuXFxuLm1iLTIwIHtcXG4gIG1hcmdpbi1ib3R0b206IDJyZW07IH1cXG5cXG4ubXQtNTAge1xcbiAgbWFyZ2luLXRvcDogNXJlbTsgfVxcblxcbi5idG4sIC5idG46bGluaywgLmJ0bjp2aXNpdGVkIHtcXG4gIHBhZGRpbmc6IC43NXJlbSAycmVtO1xcbiAgYm9yZGVyLXJhZGl1czogLjVyZW07XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjJmMmYyO1xcbiAgZm9udC13ZWlnaHQ6IDQwMDtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jazsgfVxcblxcbi5idG46YWN0aXZlLCAuYnRuOmZvY3VzIHtcXG4gIG91dGxpbmU6IG5vbmU7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTFweCk7XFxuICBib3gtc2hhZG93OiAwIDAuNXJlbSAxcmVtIHJnYmEoMCwgMCwgMCwgMC4yKTsgfVxcblxcbi5sb2dpbi1mb3JtX19ncm91cDpub3QoOmxhc3QtY2hpbGQpIHtcXG4gIG1hcmdpbi1ib3R0b206IDIuNXJlbTsgfVxcblxcbi5sb2dpbi1mb3JtX19sYWJlbCB7XFxuICBtYXJnaW4tcmlnaHQ6IC43cmVtO1xcbiAgY29sb3I6ICNmZmY7XFxuICBmb250LXNpemU6IDEuOHJlbTtcXG4gIGZvbnQtd2VpZ2h0OiA0MDA7IH1cXG5cXG4ubG9naW4tZm9ybV9faW5wdXQge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gIHBhZGRpbmc6IC41cmVtIDA7XFxuICBib3JkZXI6IG5vbmU7IH1cXG5cXG4ubG9naW4tZm9ybV9fYnRuLXdyYXBwZXIge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyOyB9XFxuXFxuLmxvZ2luX19yZWdpc3Rlci10ZXh0IHtcXG4gIG1hcmdpbi10b3A6IDEuNXJlbTtcXG4gIGNvbG9yOiAjZmZmOyB9XFxuXFxuLmxvZ2luX19yZWdpc3Rlci1saW5rIHtcXG4gIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gIGNvbG9yOiAjZmZmO1xcbiAgdHJhbnNpdGlvbjogYWxsIC4yczsgfVxcbiAgLmxvZ2luX19yZWdpc3Rlci1saW5rOmhvdmVyIHtcXG4gICAgY29sb3I6ICNmZjgwMDA7XFxuICAgIHRleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lOyB9XFxuXFxuLm5hdiB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcXG4gIHBhZGRpbmc6IDJyZW0gNnJlbTtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgIzAwMDsgfVxcbiAgLm5hdl9faXRlbSB7XFxuICAgIGxpc3Qtc3R5bGU6IG5vbmU7IH1cXG4gICAgLm5hdl9faXRlbS0tc2VhcmNoIHtcXG4gICAgICBmbGV4OiAwIDAgMjUlOyB9XFxuICAubmF2X19saW5rIHtcXG4gICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgICBjb2xvcjogIzAwMDtcXG4gICAgdHJhbnNpdGlvbjogYWxsIC4yczsgfVxcbiAgICAubmF2X19saW5rOmhvdmVyIHtcXG4gICAgICBtYXJnaW4tYm90dG9tOiAycHg7XFxuICAgICAgY29sb3I6ICNmZmE2NGQ7XFxuICAgICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNmZmE2NGQ7IH1cXG4gICAgLm5hdl9fbGluay0taG9tZTpob3ZlciAubmF2X19pY29uLXBhdGgtLWhvbWUge1xcbiAgICAgIGZpbGw6ICNmZjgwMDA7IH1cXG4gIC5uYXZfX3NlYXJjaCB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAgIC5uYXZfX3NlYXJjaC1pbnB1dCB7XFxuICAgICAgd2lkdGg6IDkwJTtcXG4gICAgICBib3JkZXItcmFkaXVzOiAzcmVtO1xcbiAgICAgIHBhZGRpbmc6IDFyZW0gMnJlbTtcXG4gICAgICBib3JkZXI6IDFweCBzb2xpZCAjYmZiZmJmO1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmMmYyZjI7XFxuICAgICAgdHJhbnNpdGlvbjogd2lkdGggLjJzOyB9XFxuICAgICAgLm5hdl9fc2VhcmNoLWlucHV0OmZvY3VzIHtcXG4gICAgICAgIG91dGxpbmU6IG5vbmU7XFxuICAgICAgICB3aWR0aDogMTIwJTsgfVxcbiAgICAubmF2X19zZWFyY2gtYnRuIHtcXG4gICAgICBjdXJzb3I6IHBvaW50ZXI7IH1cXG4gIC5uYXZfX2ljb24tc2l6aW5nLS1ob21lIHtcXG4gICAgd2lkdGg6IDNyZW07XFxuICAgIGhlaWdodDogM3JlbTsgfVxcbiAgLm5hdl9faWNvbi1zaXppbmctLXNlYXJjaCB7XFxuICAgIHdpZHRoOiAycmVtO1xcbiAgICBoZWlnaHQ6IDJyZW07XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtMTUwJSk7IH1cXG4gIC5uYXZfX2ljb24tcGF0aCB7XFxuICAgIGZpbGw6ICNiZmJmYmY7IH1cXG5cXG4ucmVnaXN0ZXItZm9ybV9fZ3JvdXAge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cXG4gIC5yZWdpc3Rlci1mb3JtX19ncm91cDpub3QoOmxhc3QtY2hpbGQpIHtcXG4gICAgbWFyZ2luLWJvdHRvbTogM3JlbTsgfVxcblxcbi5yZWdpc3Rlci1mb3JtX19sYWJlbCB7XFxuICBtYXJnaW4tcmlnaHQ6IDRyZW07XFxuICBjb2xvcjogI2ZmZjtcXG4gIGZvbnQtc2l6ZTogMS44cmVtO1xcbiAgZm9udC13ZWlnaHQ6IDQwMDsgfVxcblxcbi5yZWdpc3Rlci1mb3JtX19pbnB1dCB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjJmMmYyO1xcbiAgcGFkZGluZzogLjVyZW0gMDtcXG4gIGJvcmRlcjogbm9uZTsgfVxcblxcbi5yZWdpc3Rlci1mb3JtX19idG4td3JhcHBlciB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7IH1cXG5cXG4ucmVnaXN0ZXJfX2xvZ2luLXRleHQge1xcbiAgbWFyZ2luLXRvcDogMS41cmVtO1xcbiAgY29sb3I6ICNmZmY7IH1cXG5cXG4ucmVnaXN0ZXJfX2xvZ2luLWxpbmsge1xcbiAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgY29sb3I6ICNmZmY7XFxuICB0cmFuc2l0aW9uOiBhbGwgLjJzOyB9XFxuICAucmVnaXN0ZXJfX2xvZ2luLWxpbms6aG92ZXIge1xcbiAgICBjb2xvcjogI2ZmODAwMDtcXG4gICAgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmU7IH1cXG5cXG4uZXJyb3Ige1xcbiAgbWFyZ2luLXRvcDogMnJlbTtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZjgwODA7XFxuICBib3JkZXItcmFkaXVzOiAxMHB4O1xcbiAgcGFkZGluZzogMnJlbTtcXG4gIGZvbnQtc2l6ZTogMnJlbTtcXG4gIGdyaWQtY29sdW1uOiBjZW50ZXItc3RhcnQgLyBjZW50ZXItZW5kO1xcbiAgZm9udC13ZWlnaHQ6IDcwMDsgfVxcblxcbi5zZWFyY2gtZm9ybSB7XFxuICBwYWRkaW5nOiAycmVtIDI1cmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX2dyb3VwIHtcXG4gICAgd2lkdGg6IDc1JTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgbWFyZ2luLWJvdHRvbTogM3JlbTtcXG4gICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICMwMDA7XFxuICAgIGFsaWduLWl0ZW1zOiBmbGV4LXN0YXJ0O1xcbiAgICBwYWRkaW5nOiAuNXJlbSA0cmVtIC41cmVtIDA7IH1cXG4gIC5zZWFyY2gtZm9ybV9fbGFiZWwge1xcbiAgICBmbGV4OiAwIDAgMjAlO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogZmxleC1zdGFydDtcXG4gICAgbWFyZ2luLXRvcDogLjdyZW07IH1cXG4gIC5zZWFyY2gtZm9ybV9fZ3JvdXAtaW5wdXQtd3JhcHBlciB7XFxuICAgIGZsZXg6IDAgMCA4MCU7IH1cXG4gIC5zZWFyY2gtZm9ybV9fdGlwIHtcXG4gICAgZm9udC1zaXplOiAxcmVtO1xcbiAgICBsaW5lLWhlaWdodDogMS40O1xcbiAgICB3aWR0aDogNzAlOyB9XFxuICAuc2VhcmNoLWZvcm1fX2lucHV0LXRleHQge1xcbiAgICB3aWR0aDogNDByZW07XFxuICAgIGhlaWdodDogNHJlbTtcXG4gICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcXG4gICAgcGFkZGluZzogMXJlbTtcXG4gICAgYm9yZGVyOiBzb2xpZCAxcHggI2JmYmZiZjtcXG4gICAgYm9yZGVyLXJhZGl1czogNXB4OyB9XFxuICAgIC5zZWFyY2gtZm9ybV9faW5wdXQtdGV4dDpmb2N1cyB7XFxuICAgICAgYm9yZGVyOiBzb2xpZCAxcHggIzAwMDsgfVxcbiAgLnNlYXJjaC1mb3JtX19pbnB1dC1pbnRlZ2VyLS1yZWxhdGl2ZSB7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcbiAgLnNlYXJjaC1mb3JtX19ncm91cC0tY2hlY2tib3gge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBtYXJnaW4tYm90dG9tOiAxcmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX2xhYmVsLS1jaGVja2JveCB7XFxuICAgIG1hcmdpbi1yaWdodDogMXJlbTsgfVxcbiAgLnNlYXJjaC1mb3JtX19pbnB1dC1jaGVja2JveCB7XFxuICAgIHdpZHRoOiAyLjI1cmVtO1xcbiAgICBoZWlnaHQ6IDIuMjVyZW07XFxuICAgIG1hcmdpbi1yaWdodDogLjhyZW07IH1cXG4gIC5zZWFyY2gtZm9ybV9fY2hlY2tib3gtd3JhcHBlciB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cXG4gIC5zZWFyY2gtZm9ybV9fc2VsZWN0LW1lbnUge1xcbiAgICBtYXJnaW4tYm90dG9tOiAxcmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX3N2Zy1zaXplIHtcXG4gICAgaGVpZ2h0OiAycmVtO1xcbiAgICB3aWR0aDogMnJlbTtcXG4gICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX3N1Ym1pdCB7XFxuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgcGFkZGluZzogLjdyZW07XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkICNiMzAwYjM7IH1cXG4gIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tc3BhbiB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH1cXG4gIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMsIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtc2V0cyB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICAgIGxpc3Qtc3R5bGU6IG5vbmU7XFxuICAgIG1hcmdpbi1ib3R0b206IC4zcmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLWxpc3QtaXRlbSwgLnNlYXJjaC1mb3JtX19zZWxlY3RlZC1zZXRzLWxpc3QtaXRlbSB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIG1hcmdpbi1ib3R0b206IC43cmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLXJlbW92ZS1idG4sIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtc2V0cy1yZW1vdmUtYnRuIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgaGVpZ2h0OiAycmVtO1xcbiAgICB3aWR0aDogMnJlbTtcXG4gICAgZm9udC1zaXplOiAxLjNyZW07XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmMmYyZjI7XFxuICAgIG1hcmdpbi1yaWdodDogLjdyZW07IH1cXG4gIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlciB7XFxuICAgIGhlaWdodDogMnJlbTtcXG4gICAgd2lkdGg6IDIuNzVyZW07XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgIGZvbnQtc2l6ZTogMS4zcmVtO1xcbiAgICBtYXJnaW4tcmlnaHQ6IC43cmVtOyB9XFxuICAgIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlci0taXMge1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICM0N2QxNDc7IH1cXG4gICAgLnNlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy10b2dnbGVyLS1ub3Qge1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmZjAwMDA7IH1cXG4gIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24ge1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIG1heC1oZWlnaHQ6IDI4cmVtO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgICB6LWluZGV4OiAyO1xcbiAgICB0b3A6IDEwMCU7XFxuICAgIHdpZHRoOiA0MHJlbTtcXG4gICAgbWFyZ2luLXRvcDogLTFyZW07XFxuICAgIG92ZXJmbG93LXk6IGF1dG87XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkICMwMDA7IH1cXG4gICAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0IHtcXG4gICAgICBsaXN0LXN0eWxlOiBub25lOyB9XFxuICAgICAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0LWNhdGVnb3J5IHtcXG4gICAgICAgIHBhZGRpbmc6IC41cmVtOyB9XFxuICAgICAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0LW9wdGlvbiB7XFxuICAgICAgICBwYWRkaW5nOiAuM3JlbSAycmVtO1xcbiAgICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cXG4gICAgICAgIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1vcHRpb246aG92ZXIge1xcbiAgICAgICAgICBjdXJzb3I6IHBvaW50ZXI7IH1cXG4gICAgICAgIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1vcHRpb24tLWhpZ2hsaWdodGVkIHtcXG4gICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2NjZDhmZjsgfVxcbiAgICAgICAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0LW9wdGlvbiBzcGFuIHtcXG4gICAgICAgICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcXG4gICAgICAgICAgbWFyZ2luLWxlZnQ6IDFyZW07IH1cXG4gICAgICAuc2VhcmNoLWZvcm1fX2Ryb3Bkb3duLWxpc3QtaW1nIHtcXG4gICAgICAgIHdpZHRoOiAycmVtO1xcbiAgICAgICAgaGVpZ2h0OiAycmVtO1xcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAuN3JlbTsgfVxcblxcbi5kcm9wZG93bi13cmFwcGVyIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcblxcbi5pbnYtc2VhcmNoLXByaWNlLW1zZyB7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICBib3R0b206IDA7XFxuICByaWdodDogMDtcXG4gIGNvbG9yOiByZWQ7IH1cXG5cXG4ucmVsYXRpdmUge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuXFxuLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdiB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjOTliMWZmO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgcGFkZGluZzogMCAxMCU7XFxuICBtYXJnaW4tYm90dG9tOiAuMXJlbTsgfVxcbiAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1zZWxlY3Qge1xcbiAgICBjb2xvcjogI2IzMDBiMztcXG4gICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LWxhYmVsIHtcXG4gICAgY29sb3I6ICNiMzAwYjM7IH1cXG4gIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtcmlnaHQge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXBhZ2luYXRpb24tY29udGFpbmVyIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2NjZDhmZjtcXG4gICAgY3Vyc29yOiBwb2ludGVyOyB9XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtcGFnaW5hdGlvbi1jb250YWluZXI6bm90KDpsYXN0LWNoaWxkKSB7XFxuICAgICAgbWFyZ2luLXJpZ2h0OiAzcmVtOyB9XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtcGFnaW5hdGlvbi1jb250YWluZXItLWRpc2FibGVkIHtcXG4gICAgICBjdXJzb3I6IG5vdC1hbGxvd2VkO1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjA0LCAyMTYsIDI1NSwgMC40KTsgfVxcbiAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1zdmctc2l6ZSB7XFxuICAgIGhlaWdodDogMnJlbTtcXG4gICAgd2lkdGg6IDJyZW07IH1cXG5cXG4uYXBpLXJlc3VsdHMtZGlzcGxheV9fZGlzcGxheS1iYXIge1xcbiAgd2lkdGg6IDEwMCU7XFxuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2JmYmZiZjtcXG4gIHBhZGRpbmctbGVmdDogMTAlO1xcbiAgbWFyZ2luLWJvdHRvbTogMnJlbTsgfVxcblxcbi5jYXJkLWNoZWNrbGlzdCB7XFxuICB3aWR0aDogODAlO1xcbiAganVzdGlmeS1zZWxmOiBjZW50ZXI7IH1cXG4gIC5jYXJkLWNoZWNrbGlzdF9fcm93IHtcXG4gICAgZGlzcGxheTogZ3JpZDsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX3Jvdy0tNyB7XFxuICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoNywgMWZyKTsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX3Jvdy0tOSB7XFxuICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoOSwgMWZyKTsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX3Jvdy0taGVhZGVyIHtcXG4gICAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgIzAwMDsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX3Jvdy0tZ3JleSB7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2YyZjJmMjsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX3JvdzpudGgtY2hpbGQoZXZlbikge1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmMmYyZjI7IH1cXG4gIC5jYXJkLWNoZWNrbGlzdF9fZGF0YSB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtd3JhcDogbm93cmFwO1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgb3ZlcmZsb3c6IGhpZGRlbjtcXG4gICAgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XFxuICAgIGZvbnQtc2l6ZTogMS40cmVtOyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fZGF0YS0tc2V0IHtcXG4gICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fZGF0YS0tcmFyaXR5IHtcXG4gICAgICB0ZXh0LXRyYW5zZm9ybTogY2FwaXRhbGl6ZTsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX2RhdGEtLW5hbWUge1xcbiAgICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7XFxuICAgICAganVzdGlmeS1jb250ZW50OiBmbGV4LXN0YXJ0OyB9XFxuICAuY2FyZC1jaGVja2xpc3RfX2RhdGEtbGluayB7XFxuICAgIHBhZGRpbmc6IDFyZW0gMDtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC13cmFwOiBub3dyYXA7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGNvbG9yOiAjMDAwO1xcbiAgICB3aGl0ZS1zcGFjZTogbm93cmFwOyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fZGF0YS1saW5rLS1zdGFydCB7XFxuICAgICAganVzdGlmeS1jb250ZW50OiBmbGV4LXN0YXJ0OyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fZGF0YS1saW5rLS1jZW50ZXIge1xcbiAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyOyB9XFxuXFxuLnRvb2x0aXAge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgei1pbmRleDogNTtcXG4gIHdpZHRoOiAyNHJlbTtcXG4gIGhlaWdodDogMzRyZW07IH1cXG4gIC50b29sdGlwX19pbWcge1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgaGVpZ2h0OiAxMDAlOyB9XFxuXFxuLm5lZ2F0aXZlLWVhcm5pbmdzIHtcXG4gIGNvbG9yOiByZWQ7IH1cXG5cXG4ucG9zaXRpdmUtZWFybmluZ3Mge1xcbiAgY29sb3I6IGdyZWVuOyB9XFxuXFxuLmltYWdlLWdyaWQge1xcbiAgcGFkZGluZzogMTByZW0gMTVyZW07XFxuICBkaXNwbGF5OiBncmlkO1xcbiAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoYXV0by1maXQsIG1pbm1heCgyNXJlbSwgMWZyKSk7XFxuICBncmlkLWNvbHVtbi1nYXA6IDJyZW07XFxuICBncmlkLXJvdy1nYXA6IDFyZW07IH1cXG4gIC5pbWFnZS1ncmlkX19vdXRlci1kaXYge1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7IH1cXG4gIC5pbWFnZS1ncmlkX19pbm5lci1kaXYge1xcbiAgICBwZXJzcGVjdGl2ZTogMTUwcmVtO1xcbiAgICBoZWlnaHQ6IDM0cmVtO1xcbiAgICB3aWR0aDogMjRyZW07IH1cXG4gIC5pbWFnZS1ncmlkX19kb3VibGUge1xcbiAgICBoZWlnaHQ6IDM0cmVtO1xcbiAgICB3aWR0aDogMjRyZW07XFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgdG9wOiAwO1xcbiAgICBsZWZ0OiAwO1xcbiAgICBiYWNrZmFjZS12aXNpYmlsaXR5OiBoaWRkZW47XFxuICAgIG92ZXJmbG93OiBoaWRkZW47XFxuICAgIHRyYW5zaXRpb246IGFsbCAuOHMgZWFzZTsgfVxcbiAgICAuaW1hZ2UtZ3JpZF9fZG91YmxlLS1iYWNrIHtcXG4gICAgICB0cmFuc2Zvcm06IHJvdGF0ZVkoMTgwZGVnKTsgfVxcbiAgLmltYWdlLWdyaWRfX2RvdWJsZS1idG4ge1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIHRvcDogNTAlO1xcbiAgICByaWdodDogMTUlO1xcbiAgICB3aWR0aDogNHJlbTtcXG4gICAgaGVpZ2h0OiA0cmVtO1xcbiAgICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC40KTsgfVxcbiAgLmltYWdlLWdyaWRfX2NvbnRhaW5lciB7XFxuICAgIHdpZHRoOiAyNHJlbTtcXG4gICAgaGVpZ2h0OiAzNHJlbTsgfVxcbiAgLmltYWdlLWdyaWRfX2ltYWdlIHtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGhlaWdodDogMTAwJTsgfVxcblxcbi5jYXJkIHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBtYXJnaW4tdG9wOiAzcmVtOyB9XFxuICAuY2FyZF9faW1nLWNvbnRhaW5lciB7XFxuICAgIG1hcmdpbi1yaWdodDogMTByZW07IH1cXG4gIC5jYXJkX19pbWcge1xcbiAgICB3aWR0aDogMzNyZW07XFxuICAgIGhlaWdodDogNDZyZW07IH1cXG4gIC5jYXJkX19pbWctbGVmdCB7XFxuICAgIG1hcmdpbi1yaWdodDogMTByZW07XFxuICAgIHdpZHRoOiAzM3JlbTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgfVxcbiAgLmNhcmRfX2ltZy1idG4ge1xcbiAgICBqdXN0aWZ5LXNlbGY6IGZsZXgtZW5kO1xcbiAgICBhbGlnbi1zZWxmOiBmbGV4LWVuZDtcXG4gICAgbWFyZ2luLXRvcDogYXV0bzsgfVxcbiAgLmNhcmRfX2ltZy1kb3VibGUtYXJlYSB7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcbiAgLmNhcmRfX2ltZy1kb3VibGUtc2lkZWQge1xcbiAgICBwZXJzcGVjdGl2ZTogMTUwcmVtO1xcbiAgICBoZWlnaHQ6IDQ2cmVtOyB9XFxuICAuY2FyZF9faW1nLWRvdWJsZSB7XFxuICAgIHdpZHRoOiAzM3JlbTtcXG4gICAgaGVpZ2h0OiA0NnJlbTtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICB0b3A6IDA7XFxuICAgIGxlZnQ6IDA7XFxuICAgIGJhY2tmYWNlLXZpc2liaWxpdHk6IGhpZGRlbjtcXG4gICAgb3ZlcmZsb3c6IGhpZGRlbjsgfVxcbiAgICAuY2FyZF9faW1nLWRvdWJsZS0tYmFjayB7XFxuICAgICAgdHJhbnNmb3JtOiByb3RhdGVZKDE4MGRlZyk7IH1cXG4gIC5jYXJkX190ZXh0IHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2Y0ZjRkNztcXG4gICAgd2lkdGg6IDM0cmVtO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgICBwYWRkaW5nOiAxcmVtO1xcbiAgICBtYXJnaW4tcmlnaHQ6IDNyZW07IH1cXG4gICAgLmNhcmRfX3RleHQtZmxleCB7XFxuICAgICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcXG4gICAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2JmYmZiZjsgfVxcbiAgICAuY2FyZF9fdGV4dC10aXRsZSB7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAgICAgLmNhcmRfX3RleHQtdGl0bGUtaDMge1xcbiAgICAgICAgZm9udC1zaXplOiAxLjhyZW07XFxuICAgICAgICBmb250LXdlaWdodDogNDAwO1xcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuICAgIC5jYXJkX190ZXh0LWNvbG9yLWluZGljYXRvciB7XFxuICAgICAgd2lkdGg6IDEuM3JlbTtcXG4gICAgICBoZWlnaHQ6IDEuM3JlbTtcXG4gICAgICBib3JkZXI6IDFweCBzb2xpZCAjMzMzO1xcbiAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gICAgICBib3gtc2hhZG93OiAwcHggMHB4IDBweCAycHggcmdiYSgwLCAwLCAwLCAwLjIpO1xcbiAgICAgIG1hcmdpbi1yaWdodDogLjdyZW07XFxuICAgICAgZGlzcGxheTogaW5saW5lLWJsb2NrOyB9XFxuICAgICAgLmNhcmRfX3RleHQtY29sb3ItaW5kaWNhdG9yLS1VIHtcXG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMTI4LCAxMjgsIDI1NSwgMC43KTsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWNvbG9yLWluZGljYXRvci0tQiB7XFxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuNyk7IH1cXG4gICAgICAuY2FyZF9fdGV4dC1jb2xvci1pbmRpY2F0b3ItLVIge1xcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsIDc3LCA3NywgMC43KTsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWNvbG9yLWluZGljYXRvci0tVyB7XFxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNyk7IH1cXG4gICAgICAuY2FyZF9fdGV4dC1jb2xvci1pbmRpY2F0b3ItLUcge1xcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAyNTUsIDAsIDAuNyk7IH1cXG4gICAgLmNhcmRfX3RleHQtb3JhY2xlLXAge1xcbiAgICAgIG1hcmdpbi1ib3R0b206IDFyZW07XFxuICAgICAgZm9udC1zaXplOiAxLjNyZW07IH1cXG4gICAgLmNhcmRfX3RleHQtb3JhY2xlLWZsYXZvciB7XFxuICAgICAgZm9udC1zaXplOiAxLjNyZW07XFxuICAgICAgZm9udC1zdHlsZTogaXRhbGljOyB9XFxuICAgIC5jYXJkX190ZXh0LWlsbHVzdHJhdG9yIHtcXG4gICAgICBmb250LXNpemU6IDEuMnJlbTtcXG4gICAgICBmb250LXN0eWxlOiBpdGFsaWM7IH1cXG4gICAgLmNhcmRfX3RleHQtbGVnYWwge1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgZmxleC1kaXJlY3Rpb246IHJvdztcXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47IH1cXG4gICAgICAuY2FyZF9fdGV4dC1sZWdhbC1oYWxmIHtcXG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9XFxuICAgICAgLmNhcmRfX3RleHQtbGVnYWwtc3Bhbi1jb250YWluZXIge1xcbiAgICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cXG4gICAgICAgIC5jYXJkX190ZXh0LWxlZ2FsLXNwYW4tY29udGFpbmVyOm5vdCg6bGFzdC1jaGlsZCkge1xcbiAgICAgICAgICBtYXJnaW4tYm90dG9tOiAuNXJlbTsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWxlZ2FsLXNwYW4tYm94IHtcXG4gICAgICAgIHdpZHRoOiA2cmVtO1xcbiAgICAgICAgaGVpZ2h0OiAyLjVyZW07XFxuICAgICAgICBib3JkZXI6IDFweCBzb2xpZCAjMDAwO1xcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAuM3JlbTtcXG4gICAgICAgIGZvbnQtc2l6ZTogMXJlbTtcXG4gICAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICAgICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAgICAgICAuY2FyZF9fdGV4dC1sZWdhbC1zcGFuLWJveC0tbm90X2xlZ2FsIHtcXG4gICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmMDAwMDsgfVxcbiAgICAgICAgLmNhcmRfX3RleHQtbGVnYWwtc3Bhbi1ib3gtLWxlZ2FsIHtcXG4gICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzQ3ZDE0NzsgfVxcbiAgLmNhcmRfX3NldCB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH1cXG4gICAgLmNhcmRfX3NldC1iYW5uZXIge1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgYm9yZGVyOiAxcHggc29saWQgI2JmYmZiZjtcXG4gICAgICB3aWR0aDogNDByZW07XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzAwMDtcXG4gICAgICBjb2xvcjogI2ZmZjsgfVxcbiAgICAgIC5jYXJkX19zZXQtYmFubmVyLXN2Zy1jb250YWluZXIge1xcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuICAgICAgLmNhcmRfX3NldC1iYW5uZXItc3ZnIHtcXG4gICAgICAgIHdpZHRoOiAyLjRyZW07XFxuICAgICAgICBoZWlnaHQ6IDIuNHJlbTtcXG4gICAgICAgIGZpbHRlcjogaW52ZXJ0KDEwMCUpOyB9XFxuICAgIC5jYXJkX19zZXQtZGV0YWlscyB7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9XFxuICAgIC5jYXJkX19zZXQtaGVhZGVyLW5hbWUge1xcbiAgICAgIGZvbnQtc2l6ZTogMS43cmVtcmVtOyB9XFxuICAgIC5jYXJkX19zZXQtaGVhZGVyLWNvZGUge1xcbiAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtaGVhZGVyIHtcXG4gICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMDAwO1xcbiAgICAgIGNvbG9yOiAjZmZmO1xcbiAgICAgIGZvbnQtc2l6ZTogMS4zcmVtO1xcbiAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICAgICAgYm9yZGVyOiAxcHggc29saWQgI2JmYmZiZjtcXG4gICAgICBwYWRkaW5nOiAuM3JlbSAuN3JlbTsgfVxcbiAgICAuY2FyZF9fc2V0LXByaW50cy1zdmctY29udGFpbmVyIHtcXG4gICAgICBoZWlnaHQ6IDEuOHJlbTtcXG4gICAgICB3aWR0aDogMS44cmVtO1xcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkICNiZmJmYmY7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICAgIGJvcmRlci1yYWRpdXM6IDEwMCU7IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtc3ZnLS1jb21tb24ge1xcbiAgICAgIGZpbGw6ICMwMDA7IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtc3ZnLS11bmNvbW1vbiB7XFxuICAgICAgZmlsbDogI2U2ZTZlNjsgfVxcbiAgICAuY2FyZF9fc2V0LXByaW50cy1zdmctLXJhcmUge1xcbiAgICAgIGZpbGw6ICNlNmMzMDA7IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtc3ZnLS1teXRoaWMge1xcbiAgICAgIGZpbGw6ICNmZjAwMDA7IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtbGlzdCB7XFxuICAgICAgbGlzdC1zdHlsZTogbm9uZTsgfVxcbiAgICAgIC5jYXJkX19zZXQtcHJpbnRzLWxpc3QtbGluazpsaW5rLCAuY2FyZF9fc2V0LXByaW50cy1saXN0LWxpbms6dmlzaXRlZCB7XFxuICAgICAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICAgICAgICBjb2xvcjogIzAwMDsgfVxcbiAgICAgIC5jYXJkX19zZXQtcHJpbnRzLWxpc3QtaXRlbSB7XFxuICAgICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgICAgICAgY3Vyc29yOiBwb2ludGVyOyB9XFxuICAgICAgICAuY2FyZF9fc2V0LXByaW50cy1saXN0LWl0ZW06aG92ZXIge1xcbiAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjJmMmYyOyB9XFxuICAgICAgLmNhcmRfX3NldC1wcmludHMtbGlzdC1pdGVtLW5hbWUtd3JhcHBlciB7XFxuICAgICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgICAgIG1hcmdpbi1sZWZ0OiAtMXJlbTsgfVxcbiAgICAgIC5jYXJkX19zZXQtcHJpbnRzLWxpc3QtaXRlbS1zZXQtbmFtZSB7XFxuICAgICAgICBtYXJnaW4tbGVmdDogLjVyZW07IH1cXG4gICAgICAuY2FyZF9fc2V0LXByaW50cy1saXN0LWl0ZW0tcHJpY2Uge1xcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAuN3JlbTsgfVxcblxcbi5jYXJkLXBhZ2Uge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICBncmlkLWNvbHVtbjogY2VudGVyLXN0YXJ0IC8gY2VudGVyLWVuZDsgfVxcblxcbi5hZGQtdG8taW52IHtcXG4gIG1hcmdpbi10b3A6IDNyZW07XFxuICB3aWR0aDogNTAlOyB9XFxuICAuYWRkLXRvLWludl9fZm9ybSB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH1cXG4gICAgLmFkZC10by1pbnZfX2Zvcm0tZ3JvdXAge1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgYWxpZ24tY29udGVudDogY2VudGVyO1xcbiAgICAgIG1hcmdpbi1ib3R0b206IDNyZW07XFxuICAgICAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuICAgIC5hZGQtdG8taW52X19mb3JtLWxhYmVsIHtcXG4gICAgICBtYXJnaW4tcmlnaHQ6IC4zcmVtOyB9XFxuICAuYWRkLXRvLWludi1wcmljZS1tc2cge1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIGJvdHRvbTogLTEuOHJlbTtcXG4gICAgcmlnaHQ6IDI1JTtcXG4gICAgY29sb3I6IHJlZDsgfVxcblxcbi5uby1yZXN1bHRzIHtcXG4gIGp1c3RpZnktc2VsZjogY2VudGVyOyB9XFxuXFxuLmNvbnRhaW5lciB7XFxuICBkaXNwbGF5OiBncmlkO1xcbiAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiBbZnVsbC1zdGFydF0gbWlubWF4KDZyZW0sIDFmcikgW2NlbnRlci1zdGFydF0gcmVwZWF0KDgsIFtjb2wtc3RhcnRdIG1pbm1heChtaW4tY29udGVudCwgMTRyZW0pIFtjb2wtZW5kXSkgW2NlbnRlci1lbmRdIG1pbm1heCg2cmVtLCAxZnIpIFtmdWxsLWVuZF07IH1cXG5cXG4ubG9naW4sXFxuLnJlZ2lzdGVyIHtcXG4gIG1hcmdpbi10b3A6IDVyZW07XFxuICBncmlkLWNvbHVtbjogY2VudGVyLXN0YXJ0IC8gY2VudGVyLWVuZDtcXG4gIGJhY2tncm91bmQtaW1hZ2U6IGxpbmVhci1ncmFkaWVudCh0byByaWdodCBib3R0b20sIHJnYmEoMCwgMCwgMCwgMC44KSwgcmdiYSgwLCAwLCAwLCAwLjgpKSwgdXJsKFwiICsgX19fQ1NTX0xPQURFUl9VUkxfUkVQTEFDRU1FTlRfMF9fXyArIFwiKTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gIGhlaWdodDogNzV2aDtcXG4gIGJhY2tncm91bmQtc2l6ZTogY292ZXI7XFxuICBiYWNrZ3JvdW5kLXBvc2l0aW9uOiBjZW50ZXI7IH1cXG5cXG4uc2VhcmNoIHtcXG4gIGdyaWQtY29sdW1uOiBmdWxsLXN0YXJ0IC8gZnVsbC1lbmQ7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmOyB9XFxuXFxuLmFwaS1yZXN1bHRzLWRpc3BsYXkge1xcbiAgZ3JpZC1jb2x1bW46IGZ1bGwtc3RhcnQgLyBmdWxsLWVuZDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxuICBkaXNwbGF5OiBncmlkOyB9XFxuXCIsIFwiXCIse1widmVyc2lvblwiOjMsXCJzb3VyY2VzXCI6W1wid2VicGFjazovL3NyYy9jc3Mvc3R5bGUuY3NzXCJdLFwibmFtZXNcIjpbXSxcIm1hcHBpbmdzXCI6XCJBQUFBOzs7RUFHRSxTQUFTO0VBQ1QsVUFBVTtFQUNWLG1CQUFtQixFQUFFOztBQUV2QjtFQUNF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bkIsa0JBQWtCLEVBQUU7TUFDdEI7UUFDRSxrQkFBa0IsRUFBRTtNQUN0QjtRQUNFLG1CQUFtQixFQUFFOztBQUU3QjtFQUNFLGFBQWE7RUFDYixzQkFBc0I7RUFDdEIsc0NBQXNDLEVBQUU7O0FBRTFDO0VBQ0UsZ0JBQWdCO0VBQ2hCLFVBQVUsRUFBRTtFQUNaO0lBQ0UsYUFBYTtJQUNiLHNCQUFzQixFQUFFO0lBQ3hCO01BQ0UsYUFBYTtNQUNiLHFCQUFxQjtNQUNyQixtQkFBbUI7TUFDbkIsa0JBQWtCLEVBQUU7SUFDdEI7TUFDRSxtQkFBbUIsRUFBRTtFQUN6QjtJQUNFLGtCQUFrQjtJQUNsQixlQUFlO0lBQ2YsVUFBVTtJQUNWLFVBQVUsRUFBRTs7QUFFaEI7RUFDRSxvQkFBb0IsRUFBRTs7QUFFeEI7RUFDRSxhQUFhO0VBQ2IsMEtBQTBLLEVBQUU7O0FBRTlLOztFQUVFLGdCQUFnQjtFQUNoQixzQ0FBc0M7RUFDdEMsbUlBQW9IO0VBQ3BILGFBQWE7RUFDYixzQkFBc0I7RUFDdEIsbUJBQW1CO0VBQ25CLFlBQVk7RUFDWixzQkFBc0I7RUFDdEIsMkJBQTJCLEVBQUU7O0FBRS9CO0VBQ0Usa0NBQWtDO0VBQ2xDLHNCQUFzQixFQUFFOztBQUUxQjtFQUNFLGtDQUFrQztFQUNsQyxzQkFBc0I7RUFDdEIsYUFBYSxFQUFFXCIsXCJzb3VyY2VzQ29udGVudFwiOltcIiosXFxuKjo6YWZ0ZXIsXFxuKjo6YmVmb3JlIHtcXG4gIG1hcmdpbjogMDtcXG4gIHBhZGRpbmc6IDA7XFxuICBib3gtc2l6aW5nOiBpbmhlcml0OyB9XFxuXFxuaHRtbCB7XFxuICBmb250LXNpemU6IDYyLjUlOyB9XFxuXFxuYm9keSB7XFxuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbiAgb3ZlcmZsb3cteDogaGlkZGVuO1xcbiAgZm9udC1zaXplOiAxLjZyZW07XFxuICBiYWNrZ3JvdW5kLXNpemU6IGNvdmVyO1xcbiAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcXG4gIGhlaWdodDogMTI3LjVyZW07XFxuICBmb250LWZhbWlseTogJ0xhdG8nLCBzYW5zLXNlcmlmOyB9XFxuXFxuW2hpZGRlbl0ge1xcbiAgZGlzcGxheTogbm9uZSAhaW1wb3J0YW50OyB9XFxuXFxuLmhlYWRpbmctdGVydGlhcnkge1xcbiAgZm9udC1zaXplOiAyLjRyZW07XFxuICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOyB9XFxuICAuaGVhZGluZy10ZXJ0aWFyeS0td2hpdGUge1xcbiAgICBjb2xvcjogI2ZmZjsgfVxcblxcbi5tYi0xMCB7XFxuICBtYXJnaW4tYm90dG9tOiAxcmVtOyB9XFxuXFxuLm1iLTIwIHtcXG4gIG1hcmdpbi1ib3R0b206IDJyZW07IH1cXG5cXG4ubXQtNTAge1xcbiAgbWFyZ2luLXRvcDogNXJlbTsgfVxcblxcbi5idG4sIC5idG46bGluaywgLmJ0bjp2aXNpdGVkIHtcXG4gIHBhZGRpbmc6IC43NXJlbSAycmVtO1xcbiAgYm9yZGVyLXJhZGl1czogLjVyZW07XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjJmMmYyO1xcbiAgZm9udC13ZWlnaHQ6IDQwMDtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jazsgfVxcblxcbi5idG46YWN0aXZlLCAuYnRuOmZvY3VzIHtcXG4gIG91dGxpbmU6IG5vbmU7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTFweCk7XFxuICBib3gtc2hhZG93OiAwIDAuNXJlbSAxcmVtIHJnYmEoMCwgMCwgMCwgMC4yKTsgfVxcblxcbi5sb2dpbi1mb3JtX19ncm91cDpub3QoOmxhc3QtY2hpbGQpIHtcXG4gIG1hcmdpbi1ib3R0b206IDIuNXJlbTsgfVxcblxcbi5sb2dpbi1mb3JtX19sYWJlbCB7XFxuICBtYXJnaW4tcmlnaHQ6IC43cmVtO1xcbiAgY29sb3I6ICNmZmY7XFxuICBmb250LXNpemU6IDEuOHJlbTtcXG4gIGZvbnQtd2VpZ2h0OiA0MDA7IH1cXG5cXG4ubG9naW4tZm9ybV9faW5wdXQge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gIHBhZGRpbmc6IC41cmVtIDA7XFxuICBib3JkZXI6IG5vbmU7IH1cXG5cXG4ubG9naW4tZm9ybV9fYnRuLXdyYXBwZXIge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyOyB9XFxuXFxuLmxvZ2luX19yZWdpc3Rlci10ZXh0IHtcXG4gIG1hcmdpbi10b3A6IDEuNXJlbTtcXG4gIGNvbG9yOiAjZmZmOyB9XFxuXFxuLmxvZ2luX19yZWdpc3Rlci1saW5rIHtcXG4gIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gIGNvbG9yOiAjZmZmO1xcbiAgdHJhbnNpdGlvbjogYWxsIC4yczsgfVxcbiAgLmxvZ2luX19yZWdpc3Rlci1saW5rOmhvdmVyIHtcXG4gICAgY29sb3I6ICNmZjgwMDA7XFxuICAgIHRleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lOyB9XFxuXFxuLm5hdiB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcXG4gIHBhZGRpbmc6IDJyZW0gNnJlbTtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgIzAwMDsgfVxcbiAgLm5hdl9faXRlbSB7XFxuICAgIGxpc3Qtc3R5bGU6IG5vbmU7IH1cXG4gICAgLm5hdl9faXRlbS0tc2VhcmNoIHtcXG4gICAgICBmbGV4OiAwIDAgMjUlOyB9XFxuICAubmF2X19saW5rIHtcXG4gICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgICBjb2xvcjogIzAwMDtcXG4gICAgdHJhbnNpdGlvbjogYWxsIC4yczsgfVxcbiAgICAubmF2X19saW5rOmhvdmVyIHtcXG4gICAgICBtYXJnaW4tYm90dG9tOiAycHg7XFxuICAgICAgY29sb3I6ICNmZmE2NGQ7XFxuICAgICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNmZmE2NGQ7IH1cXG4gICAgLm5hdl9fbGluay0taG9tZTpob3ZlciAubmF2X19pY29uLXBhdGgtLWhvbWUge1xcbiAgICAgIGZpbGw6ICNmZjgwMDA7IH1cXG4gIC5uYXZfX3NlYXJjaCB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAgIC5uYXZfX3NlYXJjaC1pbnB1dCB7XFxuICAgICAgd2lkdGg6IDkwJTtcXG4gICAgICBib3JkZXItcmFkaXVzOiAzcmVtO1xcbiAgICAgIHBhZGRpbmc6IDFyZW0gMnJlbTtcXG4gICAgICBib3JkZXI6IDFweCBzb2xpZCAjYmZiZmJmO1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmMmYyZjI7XFxuICAgICAgdHJhbnNpdGlvbjogd2lkdGggLjJzOyB9XFxuICAgICAgLm5hdl9fc2VhcmNoLWlucHV0OmZvY3VzIHtcXG4gICAgICAgIG91dGxpbmU6IG5vbmU7XFxuICAgICAgICB3aWR0aDogMTIwJTsgfVxcbiAgICAubmF2X19zZWFyY2gtYnRuIHtcXG4gICAgICBjdXJzb3I6IHBvaW50ZXI7IH1cXG4gIC5uYXZfX2ljb24tc2l6aW5nLS1ob21lIHtcXG4gICAgd2lkdGg6IDNyZW07XFxuICAgIGhlaWdodDogM3JlbTsgfVxcbiAgLm5hdl9faWNvbi1zaXppbmctLXNlYXJjaCB7XFxuICAgIHdpZHRoOiAycmVtO1xcbiAgICBoZWlnaHQ6IDJyZW07XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtMTUwJSk7IH1cXG4gIC5uYXZfX2ljb24tcGF0aCB7XFxuICAgIGZpbGw6ICNiZmJmYmY7IH1cXG5cXG4ucmVnaXN0ZXItZm9ybV9fZ3JvdXAge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cXG4gIC5yZWdpc3Rlci1mb3JtX19ncm91cDpub3QoOmxhc3QtY2hpbGQpIHtcXG4gICAgbWFyZ2luLWJvdHRvbTogM3JlbTsgfVxcblxcbi5yZWdpc3Rlci1mb3JtX19sYWJlbCB7XFxuICBtYXJnaW4tcmlnaHQ6IDRyZW07XFxuICBjb2xvcjogI2ZmZjtcXG4gIGZvbnQtc2l6ZTogMS44cmVtO1xcbiAgZm9udC13ZWlnaHQ6IDQwMDsgfVxcblxcbi5yZWdpc3Rlci1mb3JtX19pbnB1dCB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjJmMmYyO1xcbiAgcGFkZGluZzogLjVyZW0gMDtcXG4gIGJvcmRlcjogbm9uZTsgfVxcblxcbi5yZWdpc3Rlci1mb3JtX19idG4td3JhcHBlciB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7IH1cXG5cXG4ucmVnaXN0ZXJfX2xvZ2luLXRleHQge1xcbiAgbWFyZ2luLXRvcDogMS41cmVtO1xcbiAgY29sb3I6ICNmZmY7IH1cXG5cXG4ucmVnaXN0ZXJfX2xvZ2luLWxpbmsge1xcbiAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgY29sb3I6ICNmZmY7XFxuICB0cmFuc2l0aW9uOiBhbGwgLjJzOyB9XFxuICAucmVnaXN0ZXJfX2xvZ2luLWxpbms6aG92ZXIge1xcbiAgICBjb2xvcjogI2ZmODAwMDtcXG4gICAgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmU7IH1cXG5cXG4uZXJyb3Ige1xcbiAgbWFyZ2luLXRvcDogMnJlbTtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZjgwODA7XFxuICBib3JkZXItcmFkaXVzOiAxMHB4O1xcbiAgcGFkZGluZzogMnJlbTtcXG4gIGZvbnQtc2l6ZTogMnJlbTtcXG4gIGdyaWQtY29sdW1uOiBjZW50ZXItc3RhcnQgLyBjZW50ZXItZW5kO1xcbiAgZm9udC13ZWlnaHQ6IDcwMDsgfVxcblxcbi5zZWFyY2gtZm9ybSB7XFxuICBwYWRkaW5nOiAycmVtIDI1cmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX2dyb3VwIHtcXG4gICAgd2lkdGg6IDc1JTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgbWFyZ2luLWJvdHRvbTogM3JlbTtcXG4gICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICMwMDA7XFxuICAgIGFsaWduLWl0ZW1zOiBmbGV4LXN0YXJ0O1xcbiAgICBwYWRkaW5nOiAuNXJlbSA0cmVtIC41cmVtIDA7IH1cXG4gIC5zZWFyY2gtZm9ybV9fbGFiZWwge1xcbiAgICBmbGV4OiAwIDAgMjAlO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogZmxleC1zdGFydDtcXG4gICAgbWFyZ2luLXRvcDogLjdyZW07IH1cXG4gIC5zZWFyY2gtZm9ybV9fZ3JvdXAtaW5wdXQtd3JhcHBlciB7XFxuICAgIGZsZXg6IDAgMCA4MCU7IH1cXG4gIC5zZWFyY2gtZm9ybV9fdGlwIHtcXG4gICAgZm9udC1zaXplOiAxcmVtO1xcbiAgICBsaW5lLWhlaWdodDogMS40O1xcbiAgICB3aWR0aDogNzAlOyB9XFxuICAuc2VhcmNoLWZvcm1fX2lucHV0LXRleHQge1xcbiAgICB3aWR0aDogNDByZW07XFxuICAgIGhlaWdodDogNHJlbTtcXG4gICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcXG4gICAgcGFkZGluZzogMXJlbTtcXG4gICAgYm9yZGVyOiBzb2xpZCAxcHggI2JmYmZiZjtcXG4gICAgYm9yZGVyLXJhZGl1czogNXB4OyB9XFxuICAgIC5zZWFyY2gtZm9ybV9faW5wdXQtdGV4dDpmb2N1cyB7XFxuICAgICAgYm9yZGVyOiBzb2xpZCAxcHggIzAwMDsgfVxcbiAgLnNlYXJjaC1mb3JtX19pbnB1dC1pbnRlZ2VyLS1yZWxhdGl2ZSB7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcbiAgLnNlYXJjaC1mb3JtX19ncm91cC0tY2hlY2tib3gge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBtYXJnaW4tYm90dG9tOiAxcmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX2xhYmVsLS1jaGVja2JveCB7XFxuICAgIG1hcmdpbi1yaWdodDogMXJlbTsgfVxcbiAgLnNlYXJjaC1mb3JtX19pbnB1dC1jaGVja2JveCB7XFxuICAgIHdpZHRoOiAyLjI1cmVtO1xcbiAgICBoZWlnaHQ6IDIuMjVyZW07XFxuICAgIG1hcmdpbi1yaWdodDogLjhyZW07IH1cXG4gIC5zZWFyY2gtZm9ybV9fY2hlY2tib3gtd3JhcHBlciB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cXG4gIC5zZWFyY2gtZm9ybV9fc2VsZWN0LW1lbnUge1xcbiAgICBtYXJnaW4tYm90dG9tOiAxcmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX3N2Zy1zaXplIHtcXG4gICAgaGVpZ2h0OiAycmVtO1xcbiAgICB3aWR0aDogMnJlbTtcXG4gICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX3N1Ym1pdCB7XFxuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgcGFkZGluZzogLjdyZW07XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkICNiMzAwYjM7IH1cXG4gIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tc3BhbiB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH1cXG4gIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMsIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtc2V0cyB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICAgIGxpc3Qtc3R5bGU6IG5vbmU7XFxuICAgIG1hcmdpbi1ib3R0b206IC4zcmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLWxpc3QtaXRlbSwgLnNlYXJjaC1mb3JtX19zZWxlY3RlZC1zZXRzLWxpc3QtaXRlbSB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIG1hcmdpbi1ib3R0b206IC43cmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLXJlbW92ZS1idG4sIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtc2V0cy1yZW1vdmUtYnRuIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgaGVpZ2h0OiAycmVtO1xcbiAgICB3aWR0aDogMnJlbTtcXG4gICAgZm9udC1zaXplOiAxLjNyZW07XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmMmYyZjI7XFxuICAgIG1hcmdpbi1yaWdodDogLjdyZW07IH1cXG4gIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlciB7XFxuICAgIGhlaWdodDogMnJlbTtcXG4gICAgd2lkdGg6IDIuNzVyZW07XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgIGZvbnQtc2l6ZTogMS4zcmVtO1xcbiAgICBtYXJnaW4tcmlnaHQ6IC43cmVtOyB9XFxuICAgIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlci0taXMge1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICM0N2QxNDc7IH1cXG4gICAgLnNlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy10b2dnbGVyLS1ub3Qge1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmZjAwMDA7IH1cXG4gIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24ge1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIG1heC1oZWlnaHQ6IDI4cmVtO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgICB6LWluZGV4OiAyO1xcbiAgICB0b3A6IDEwMCU7XFxuICAgIHdpZHRoOiA0MHJlbTtcXG4gICAgbWFyZ2luLXRvcDogLTFyZW07XFxuICAgIG92ZXJmbG93LXk6IGF1dG87XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkICMwMDA7IH1cXG4gICAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0IHtcXG4gICAgICBsaXN0LXN0eWxlOiBub25lOyB9XFxuICAgICAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0LWNhdGVnb3J5IHtcXG4gICAgICAgIHBhZGRpbmc6IC41cmVtOyB9XFxuICAgICAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0LW9wdGlvbiB7XFxuICAgICAgICBwYWRkaW5nOiAuM3JlbSAycmVtO1xcbiAgICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cXG4gICAgICAgIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1vcHRpb246aG92ZXIge1xcbiAgICAgICAgICBjdXJzb3I6IHBvaW50ZXI7IH1cXG4gICAgICAgIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1vcHRpb24tLWhpZ2hsaWdodGVkIHtcXG4gICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2NjZDhmZjsgfVxcbiAgICAgICAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0LW9wdGlvbiBzcGFuIHtcXG4gICAgICAgICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcXG4gICAgICAgICAgbWFyZ2luLWxlZnQ6IDFyZW07IH1cXG4gICAgICAuc2VhcmNoLWZvcm1fX2Ryb3Bkb3duLWxpc3QtaW1nIHtcXG4gICAgICAgIHdpZHRoOiAycmVtO1xcbiAgICAgICAgaGVpZ2h0OiAycmVtO1xcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAuN3JlbTsgfVxcblxcbi5kcm9wZG93bi13cmFwcGVyIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcblxcbi5pbnYtc2VhcmNoLXByaWNlLW1zZyB7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICBib3R0b206IDA7XFxuICByaWdodDogMDtcXG4gIGNvbG9yOiByZWQ7IH1cXG5cXG4ucmVsYXRpdmUge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuXFxuLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdiB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjOTliMWZmO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgcGFkZGluZzogMCAxMCU7XFxuICBtYXJnaW4tYm90dG9tOiAuMXJlbTsgfVxcbiAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1zZWxlY3Qge1xcbiAgICBjb2xvcjogI2IzMDBiMztcXG4gICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LWxhYmVsIHtcXG4gICAgY29sb3I6ICNiMzAwYjM7IH1cXG4gIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtcmlnaHQge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXBhZ2luYXRpb24tY29udGFpbmVyIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2NjZDhmZjtcXG4gICAgY3Vyc29yOiBwb2ludGVyOyB9XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtcGFnaW5hdGlvbi1jb250YWluZXI6bm90KDpsYXN0LWNoaWxkKSB7XFxuICAgICAgbWFyZ2luLXJpZ2h0OiAzcmVtOyB9XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtcGFnaW5hdGlvbi1jb250YWluZXItLWRpc2FibGVkIHtcXG4gICAgICBjdXJzb3I6IG5vdC1hbGxvd2VkO1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjA0LCAyMTYsIDI1NSwgMC40KTsgfVxcbiAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1zdmctc2l6ZSB7XFxuICAgIGhlaWdodDogMnJlbTtcXG4gICAgd2lkdGg6IDJyZW07IH1cXG5cXG4uYXBpLXJlc3VsdHMtZGlzcGxheV9fZGlzcGxheS1iYXIge1xcbiAgd2lkdGg6IDEwMCU7XFxuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2JmYmZiZjtcXG4gIHBhZGRpbmctbGVmdDogMTAlO1xcbiAgbWFyZ2luLWJvdHRvbTogMnJlbTsgfVxcblxcbi5jYXJkLWNoZWNrbGlzdCB7XFxuICB3aWR0aDogODAlO1xcbiAganVzdGlmeS1zZWxmOiBjZW50ZXI7IH1cXG4gIC5jYXJkLWNoZWNrbGlzdF9fcm93IHtcXG4gICAgZGlzcGxheTogZ3JpZDsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX3Jvdy0tNyB7XFxuICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoNywgMWZyKTsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX3Jvdy0tOSB7XFxuICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoOSwgMWZyKTsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX3Jvdy0taGVhZGVyIHtcXG4gICAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgIzAwMDsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX3Jvdy0tZ3JleSB7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2YyZjJmMjsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX3JvdzpudGgtY2hpbGQoZXZlbikge1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmMmYyZjI7IH1cXG4gIC5jYXJkLWNoZWNrbGlzdF9fZGF0YSB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtd3JhcDogbm93cmFwO1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgb3ZlcmZsb3c6IGhpZGRlbjtcXG4gICAgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XFxuICAgIGZvbnQtc2l6ZTogMS40cmVtOyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fZGF0YS0tc2V0IHtcXG4gICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fZGF0YS0tcmFyaXR5IHtcXG4gICAgICB0ZXh0LXRyYW5zZm9ybTogY2FwaXRhbGl6ZTsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX2RhdGEtLW5hbWUge1xcbiAgICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7XFxuICAgICAganVzdGlmeS1jb250ZW50OiBmbGV4LXN0YXJ0OyB9XFxuICAuY2FyZC1jaGVja2xpc3RfX2RhdGEtbGluayB7XFxuICAgIHBhZGRpbmc6IDFyZW0gMDtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC13cmFwOiBub3dyYXA7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGNvbG9yOiAjMDAwO1xcbiAgICB3aGl0ZS1zcGFjZTogbm93cmFwOyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fZGF0YS1saW5rLS1zdGFydCB7XFxuICAgICAganVzdGlmeS1jb250ZW50OiBmbGV4LXN0YXJ0OyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fZGF0YS1saW5rLS1jZW50ZXIge1xcbiAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyOyB9XFxuXFxuLnRvb2x0aXAge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgei1pbmRleDogNTtcXG4gIHdpZHRoOiAyNHJlbTtcXG4gIGhlaWdodDogMzRyZW07IH1cXG4gIC50b29sdGlwX19pbWcge1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgaGVpZ2h0OiAxMDAlOyB9XFxuXFxuLm5lZ2F0aXZlLWVhcm5pbmdzIHtcXG4gIGNvbG9yOiByZWQ7IH1cXG5cXG4ucG9zaXRpdmUtZWFybmluZ3Mge1xcbiAgY29sb3I6IGdyZWVuOyB9XFxuXFxuLmltYWdlLWdyaWQge1xcbiAgcGFkZGluZzogMTByZW0gMTVyZW07XFxuICBkaXNwbGF5OiBncmlkO1xcbiAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoYXV0by1maXQsIG1pbm1heCgyNXJlbSwgMWZyKSk7XFxuICBncmlkLWNvbHVtbi1nYXA6IDJyZW07XFxuICBncmlkLXJvdy1nYXA6IDFyZW07IH1cXG4gIC5pbWFnZS1ncmlkX19vdXRlci1kaXYge1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7IH1cXG4gIC5pbWFnZS1ncmlkX19pbm5lci1kaXYge1xcbiAgICBwZXJzcGVjdGl2ZTogMTUwcmVtO1xcbiAgICBoZWlnaHQ6IDM0cmVtO1xcbiAgICB3aWR0aDogMjRyZW07IH1cXG4gIC5pbWFnZS1ncmlkX19kb3VibGUge1xcbiAgICBoZWlnaHQ6IDM0cmVtO1xcbiAgICB3aWR0aDogMjRyZW07XFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgdG9wOiAwO1xcbiAgICBsZWZ0OiAwO1xcbiAgICBiYWNrZmFjZS12aXNpYmlsaXR5OiBoaWRkZW47XFxuICAgIG92ZXJmbG93OiBoaWRkZW47XFxuICAgIHRyYW5zaXRpb246IGFsbCAuOHMgZWFzZTsgfVxcbiAgICAuaW1hZ2UtZ3JpZF9fZG91YmxlLS1iYWNrIHtcXG4gICAgICB0cmFuc2Zvcm06IHJvdGF0ZVkoMTgwZGVnKTsgfVxcbiAgLmltYWdlLWdyaWRfX2RvdWJsZS1idG4ge1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIHRvcDogNTAlO1xcbiAgICByaWdodDogMTUlO1xcbiAgICB3aWR0aDogNHJlbTtcXG4gICAgaGVpZ2h0OiA0cmVtO1xcbiAgICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC40KTsgfVxcbiAgLmltYWdlLWdyaWRfX2NvbnRhaW5lciB7XFxuICAgIHdpZHRoOiAyNHJlbTtcXG4gICAgaGVpZ2h0OiAzNHJlbTsgfVxcbiAgLmltYWdlLWdyaWRfX2ltYWdlIHtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGhlaWdodDogMTAwJTsgfVxcblxcbi5jYXJkIHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBtYXJnaW4tdG9wOiAzcmVtOyB9XFxuICAuY2FyZF9faW1nLWNvbnRhaW5lciB7XFxuICAgIG1hcmdpbi1yaWdodDogMTByZW07IH1cXG4gIC5jYXJkX19pbWcge1xcbiAgICB3aWR0aDogMzNyZW07XFxuICAgIGhlaWdodDogNDZyZW07IH1cXG4gIC5jYXJkX19pbWctbGVmdCB7XFxuICAgIG1hcmdpbi1yaWdodDogMTByZW07XFxuICAgIHdpZHRoOiAzM3JlbTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgfVxcbiAgLmNhcmRfX2ltZy1idG4ge1xcbiAgICBqdXN0aWZ5LXNlbGY6IGZsZXgtZW5kO1xcbiAgICBhbGlnbi1zZWxmOiBmbGV4LWVuZDtcXG4gICAgbWFyZ2luLXRvcDogYXV0bzsgfVxcbiAgLmNhcmRfX2ltZy1kb3VibGUtYXJlYSB7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcbiAgLmNhcmRfX2ltZy1kb3VibGUtc2lkZWQge1xcbiAgICBwZXJzcGVjdGl2ZTogMTUwcmVtO1xcbiAgICBoZWlnaHQ6IDQ2cmVtOyB9XFxuICAuY2FyZF9faW1nLWRvdWJsZSB7XFxuICAgIHdpZHRoOiAzM3JlbTtcXG4gICAgaGVpZ2h0OiA0NnJlbTtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICB0b3A6IDA7XFxuICAgIGxlZnQ6IDA7XFxuICAgIGJhY2tmYWNlLXZpc2liaWxpdHk6IGhpZGRlbjtcXG4gICAgb3ZlcmZsb3c6IGhpZGRlbjsgfVxcbiAgICAuY2FyZF9faW1nLWRvdWJsZS0tYmFjayB7XFxuICAgICAgdHJhbnNmb3JtOiByb3RhdGVZKDE4MGRlZyk7IH1cXG4gIC5jYXJkX190ZXh0IHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2Y0ZjRkNztcXG4gICAgd2lkdGg6IDM0cmVtO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgICBwYWRkaW5nOiAxcmVtO1xcbiAgICBtYXJnaW4tcmlnaHQ6IDNyZW07IH1cXG4gICAgLmNhcmRfX3RleHQtZmxleCB7XFxuICAgICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcXG4gICAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2JmYmZiZjsgfVxcbiAgICAuY2FyZF9fdGV4dC10aXRsZSB7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAgICAgLmNhcmRfX3RleHQtdGl0bGUtaDMge1xcbiAgICAgICAgZm9udC1zaXplOiAxLjhyZW07XFxuICAgICAgICBmb250LXdlaWdodDogNDAwO1xcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuICAgIC5jYXJkX190ZXh0LWNvbG9yLWluZGljYXRvciB7XFxuICAgICAgd2lkdGg6IDEuM3JlbTtcXG4gICAgICBoZWlnaHQ6IDEuM3JlbTtcXG4gICAgICBib3JkZXI6IDFweCBzb2xpZCAjMzMzO1xcbiAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gICAgICBib3gtc2hhZG93OiAwcHggMHB4IDBweCAycHggcmdiYSgwLCAwLCAwLCAwLjIpO1xcbiAgICAgIG1hcmdpbi1yaWdodDogLjdyZW07XFxuICAgICAgZGlzcGxheTogaW5saW5lLWJsb2NrOyB9XFxuICAgICAgLmNhcmRfX3RleHQtY29sb3ItaW5kaWNhdG9yLS1VIHtcXG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMTI4LCAxMjgsIDI1NSwgMC43KTsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWNvbG9yLWluZGljYXRvci0tQiB7XFxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuNyk7IH1cXG4gICAgICAuY2FyZF9fdGV4dC1jb2xvci1pbmRpY2F0b3ItLVIge1xcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsIDc3LCA3NywgMC43KTsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWNvbG9yLWluZGljYXRvci0tVyB7XFxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNyk7IH1cXG4gICAgICAuY2FyZF9fdGV4dC1jb2xvci1pbmRpY2F0b3ItLUcge1xcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAyNTUsIDAsIDAuNyk7IH1cXG4gICAgLmNhcmRfX3RleHQtb3JhY2xlLXAge1xcbiAgICAgIG1hcmdpbi1ib3R0b206IDFyZW07XFxuICAgICAgZm9udC1zaXplOiAxLjNyZW07IH1cXG4gICAgLmNhcmRfX3RleHQtb3JhY2xlLWZsYXZvciB7XFxuICAgICAgZm9udC1zaXplOiAxLjNyZW07XFxuICAgICAgZm9udC1zdHlsZTogaXRhbGljOyB9XFxuICAgIC5jYXJkX190ZXh0LWlsbHVzdHJhdG9yIHtcXG4gICAgICBmb250LXNpemU6IDEuMnJlbTtcXG4gICAgICBmb250LXN0eWxlOiBpdGFsaWM7IH1cXG4gICAgLmNhcmRfX3RleHQtbGVnYWwge1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgZmxleC1kaXJlY3Rpb246IHJvdztcXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47IH1cXG4gICAgICAuY2FyZF9fdGV4dC1sZWdhbC1oYWxmIHtcXG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9XFxuICAgICAgLmNhcmRfX3RleHQtbGVnYWwtc3Bhbi1jb250YWluZXIge1xcbiAgICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cXG4gICAgICAgIC5jYXJkX190ZXh0LWxlZ2FsLXNwYW4tY29udGFpbmVyOm5vdCg6bGFzdC1jaGlsZCkge1xcbiAgICAgICAgICBtYXJnaW4tYm90dG9tOiAuNXJlbTsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWxlZ2FsLXNwYW4tYm94IHtcXG4gICAgICAgIHdpZHRoOiA2cmVtO1xcbiAgICAgICAgaGVpZ2h0OiAyLjVyZW07XFxuICAgICAgICBib3JkZXI6IDFweCBzb2xpZCAjMDAwO1xcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAuM3JlbTtcXG4gICAgICAgIGZvbnQtc2l6ZTogMXJlbTtcXG4gICAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICAgICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAgICAgICAuY2FyZF9fdGV4dC1sZWdhbC1zcGFuLWJveC0tbm90X2xlZ2FsIHtcXG4gICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmMDAwMDsgfVxcbiAgICAgICAgLmNhcmRfX3RleHQtbGVnYWwtc3Bhbi1ib3gtLWxlZ2FsIHtcXG4gICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzQ3ZDE0NzsgfVxcbiAgLmNhcmRfX3NldCB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH1cXG4gICAgLmNhcmRfX3NldC1iYW5uZXIge1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgYm9yZGVyOiAxcHggc29saWQgI2JmYmZiZjtcXG4gICAgICB3aWR0aDogNDByZW07XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzAwMDtcXG4gICAgICBjb2xvcjogI2ZmZjsgfVxcbiAgICAgIC5jYXJkX19zZXQtYmFubmVyLXN2Zy1jb250YWluZXIge1xcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuICAgICAgLmNhcmRfX3NldC1iYW5uZXItc3ZnIHtcXG4gICAgICAgIHdpZHRoOiAyLjRyZW07XFxuICAgICAgICBoZWlnaHQ6IDIuNHJlbTtcXG4gICAgICAgIGZpbHRlcjogaW52ZXJ0KDEwMCUpOyB9XFxuICAgIC5jYXJkX19zZXQtZGV0YWlscyB7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9XFxuICAgIC5jYXJkX19zZXQtaGVhZGVyLW5hbWUge1xcbiAgICAgIGZvbnQtc2l6ZTogMS43cmVtcmVtOyB9XFxuICAgIC5jYXJkX19zZXQtaGVhZGVyLWNvZGUge1xcbiAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtaGVhZGVyIHtcXG4gICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMDAwO1xcbiAgICAgIGNvbG9yOiAjZmZmO1xcbiAgICAgIGZvbnQtc2l6ZTogMS4zcmVtO1xcbiAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICAgICAgYm9yZGVyOiAxcHggc29saWQgI2JmYmZiZjtcXG4gICAgICBwYWRkaW5nOiAuM3JlbSAuN3JlbTsgfVxcbiAgICAuY2FyZF9fc2V0LXByaW50cy1zdmctY29udGFpbmVyIHtcXG4gICAgICBoZWlnaHQ6IDEuOHJlbTtcXG4gICAgICB3aWR0aDogMS44cmVtO1xcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkICNiZmJmYmY7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICAgIGJvcmRlci1yYWRpdXM6IDEwMCU7IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtc3ZnLS1jb21tb24ge1xcbiAgICAgIGZpbGw6ICMwMDA7IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtc3ZnLS11bmNvbW1vbiB7XFxuICAgICAgZmlsbDogI2U2ZTZlNjsgfVxcbiAgICAuY2FyZF9fc2V0LXByaW50cy1zdmctLXJhcmUge1xcbiAgICAgIGZpbGw6ICNlNmMzMDA7IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtc3ZnLS1teXRoaWMge1xcbiAgICAgIGZpbGw6ICNmZjAwMDA7IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtbGlzdCB7XFxuICAgICAgbGlzdC1zdHlsZTogbm9uZTsgfVxcbiAgICAgIC5jYXJkX19zZXQtcHJpbnRzLWxpc3QtbGluazpsaW5rLCAuY2FyZF9fc2V0LXByaW50cy1saXN0LWxpbms6dmlzaXRlZCB7XFxuICAgICAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICAgICAgICBjb2xvcjogIzAwMDsgfVxcbiAgICAgIC5jYXJkX19zZXQtcHJpbnRzLWxpc3QtaXRlbSB7XFxuICAgICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgICAgICAgY3Vyc29yOiBwb2ludGVyOyB9XFxuICAgICAgICAuY2FyZF9fc2V0LXByaW50cy1saXN0LWl0ZW06aG92ZXIge1xcbiAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjJmMmYyOyB9XFxuICAgICAgLmNhcmRfX3NldC1wcmludHMtbGlzdC1pdGVtLW5hbWUtd3JhcHBlciB7XFxuICAgICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgICAgIG1hcmdpbi1sZWZ0OiAtMXJlbTsgfVxcbiAgICAgIC5jYXJkX19zZXQtcHJpbnRzLWxpc3QtaXRlbS1zZXQtbmFtZSB7XFxuICAgICAgICBtYXJnaW4tbGVmdDogLjVyZW07IH1cXG4gICAgICAuY2FyZF9fc2V0LXByaW50cy1saXN0LWl0ZW0tcHJpY2Uge1xcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAuN3JlbTsgfVxcblxcbi5jYXJkLXBhZ2Uge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICBncmlkLWNvbHVtbjogY2VudGVyLXN0YXJ0IC8gY2VudGVyLWVuZDsgfVxcblxcbi5hZGQtdG8taW52IHtcXG4gIG1hcmdpbi10b3A6IDNyZW07XFxuICB3aWR0aDogNTAlOyB9XFxuICAuYWRkLXRvLWludl9fZm9ybSB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH1cXG4gICAgLmFkZC10by1pbnZfX2Zvcm0tZ3JvdXAge1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgYWxpZ24tY29udGVudDogY2VudGVyO1xcbiAgICAgIG1hcmdpbi1ib3R0b206IDNyZW07XFxuICAgICAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuICAgIC5hZGQtdG8taW52X19mb3JtLWxhYmVsIHtcXG4gICAgICBtYXJnaW4tcmlnaHQ6IC4zcmVtOyB9XFxuICAuYWRkLXRvLWludi1wcmljZS1tc2cge1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIGJvdHRvbTogLTEuOHJlbTtcXG4gICAgcmlnaHQ6IDI1JTtcXG4gICAgY29sb3I6IHJlZDsgfVxcblxcbi5uby1yZXN1bHRzIHtcXG4gIGp1c3RpZnktc2VsZjogY2VudGVyOyB9XFxuXFxuLmNvbnRhaW5lciB7XFxuICBkaXNwbGF5OiBncmlkO1xcbiAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiBbZnVsbC1zdGFydF0gbWlubWF4KDZyZW0sIDFmcikgW2NlbnRlci1zdGFydF0gcmVwZWF0KDgsIFtjb2wtc3RhcnRdIG1pbm1heChtaW4tY29udGVudCwgMTRyZW0pIFtjb2wtZW5kXSkgW2NlbnRlci1lbmRdIG1pbm1heCg2cmVtLCAxZnIpIFtmdWxsLWVuZF07IH1cXG5cXG4ubG9naW4sXFxuLnJlZ2lzdGVyIHtcXG4gIG1hcmdpbi10b3A6IDVyZW07XFxuICBncmlkLWNvbHVtbjogY2VudGVyLXN0YXJ0IC8gY2VudGVyLWVuZDtcXG4gIGJhY2tncm91bmQtaW1hZ2U6IGxpbmVhci1ncmFkaWVudCh0byByaWdodCBib3R0b20sIHJnYmEoMCwgMCwgMCwgMC44KSwgcmdiYSgwLCAwLCAwLCAwLjgpKSwgdXJsKC4uL2ltZy9sb2dpbi1iZy5qcGcpO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgaGVpZ2h0OiA3NXZoO1xcbiAgYmFja2dyb3VuZC1zaXplOiBjb3ZlcjtcXG4gIGJhY2tncm91bmQtcG9zaXRpb246IGNlbnRlcjsgfVxcblxcbi5zZWFyY2gge1xcbiAgZ3JpZC1jb2x1bW46IGZ1bGwtc3RhcnQgLyBmdWxsLWVuZDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZmY7IH1cXG5cXG4uYXBpLXJlc3VsdHMtZGlzcGxheSB7XFxuICBncmlkLWNvbHVtbjogZnVsbC1zdGFydCAvIGZ1bGwtZW5kO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gIGRpc3BsYXk6IGdyaWQ7IH1cXG5cIl0sXCJzb3VyY2VSb290XCI6XCJcIn1dKTtcbi8vIEV4cG9ydHNcbmV4cG9ydCBkZWZhdWx0IF9fX0NTU19MT0FERVJfRVhQT1JUX19fO1xuIiwiLy8gSW1wb3J0c1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18gZnJvbSBcIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9jc3NXaXRoTWFwcGluZ1RvU3RyaW5nLmpzXCI7XG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fIGZyb20gXCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzXCI7XG5pbXBvcnQgX19fQ1NTX0xPQURFUl9HRVRfVVJMX0lNUE9SVF9fXyBmcm9tIFwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2dldFVybC5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfVVJMX0lNUE9SVF8wX19fIGZyb20gXCIuLi8uLi9pbWcvbWFuYS1zeW1ib2xzL21hbmEuc3ZnXCI7XG52YXIgX19fQ1NTX0xPQURFUl9FWFBPUlRfX18gPSBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18oX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyk7XG52YXIgX19fQ1NTX0xPQURFUl9VUkxfUkVQTEFDRU1FTlRfMF9fXyA9IF9fX0NTU19MT0FERVJfR0VUX1VSTF9JTVBPUlRfX18oX19fQ1NTX0xPQURFUl9VUkxfSU1QT1JUXzBfX18pO1xuLy8gTW9kdWxlXG5fX19DU1NfTE9BREVSX0VYUE9SVF9fXy5wdXNoKFttb2R1bGUuaWQsIFwiLm1hbmEge1xcbiAgICBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXCIgKyBfX19DU1NfTE9BREVSX1VSTF9SRVBMQUNFTUVOVF8wX19fICsgXCIpO1xcbiAgICBiYWNrZ3JvdW5kLXJlcGVhdDogbm8tcmVwZWF0O1xcbiAgICBiYWNrZ3JvdW5kLXNpemU6IGF1dG8gNzAwJTtcXG4gICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgICBmb250LXNpemU6IDEwMCU7XFxufVxcblxcbi5tYW5hLnhzIHtcXG4gICAgd2lkdGg6IDEuNXJlbTtcXG4gICAgaGVpZ2h0OiAxLjVyZW07XFxufVxcblxcbi5tYW5hLnNtYWxsIHtcXG4gICAgaGVpZ2h0OiAycmVtO1xcbiAgICB3aWR0aDogMnJlbTtcXG59XFxuLm1hbmEubWVkaXVtIHtcXG4gICAgaGVpZ2h0OiAyZW07XFxuICAgIHdpZHRoOiAyZW07XFxufVxcbi5tYW5hLmxhcmdlIHtcXG4gICAgaGVpZ2h0OiA0ZW07XFxuICAgIHdpZHRoOiA0ZW07XFxufVxcbi5tYW5hLnMgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwIDA7IH1cXG4ubWFuYS5zMSB7IGJhY2tncm91bmQtcG9zaXRpb246IDExLjElIDA7IH1cXG4ubWFuYS5zMiB7IGJhY2tncm91bmQtcG9zaXRpb246IDIyLjIlIDA7IH1cXG4ubWFuYS5zMyB7IGJhY2tncm91bmQtcG9zaXRpb246IDMzLjMlIDA7IH1cXG4ubWFuYS5zNCB7IGJhY2tncm91bmQtcG9zaXRpb246IDQ0LjQlIDA7IH1cXG4ubWFuYS5zNSB7IGJhY2tncm91bmQtcG9zaXRpb246IDU1LjUlIDA7IH1cXG4ubWFuYS5zNiB7IGJhY2tncm91bmQtcG9zaXRpb246IDY2LjYlIDA7IH1cXG4ubWFuYS5zNyB7IGJhY2tncm91bmQtcG9zaXRpb246IDc3LjclIDA7IH1cXG4ubWFuYS5zOCB7IGJhY2tncm91bmQtcG9zaXRpb246IDg4LjglIDA7IH1cXG4ubWFuYS5zOSB7IGJhY2tncm91bmQtcG9zaXRpb246IDk5LjklIDA7IH1cXG5cXG4ubWFuYS5zMTAgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwIDE2JTsgfVxcbi5tYW5hLnMxMSB7IGJhY2tncm91bmQtcG9zaXRpb246IDExLjElIDE2LjYlOyB9XFxuLm1hbmEuczEyIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMjIuMiUgMTYuNiU7IH1cXG4ubWFuYS5zMTMgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAzMy4zJSAxNi42JTsgfVxcbi5tYW5hLnMxNCB7IGJhY2tncm91bmQtcG9zaXRpb246IDQ0LjQlIDE2LjYlOyB9XFxuLm1hbmEuczE1IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNTUuNSUgMTYuNiU7IH1cXG4ubWFuYS5zMTYgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA2Ni42JSAxNi42JTsgfVxcbi5tYW5hLnMxNyB7IGJhY2tncm91bmQtcG9zaXRpb246IDc3LjclIDE2LjYlOyB9XFxuLm1hbmEuczE4IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogODguOCUgMTYuNiU7IH1cXG4ubWFuYS5zMTkgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA5OS45JSAxNi42JTsgfVxcblxcbi5tYW5hLnMyMCB7IGJhY2tncm91bmQtcG9zaXRpb246IDAgMzMlOyB9XFxuLm1hbmEuc3ggeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAxMS4xJSAzMy4zJTsgfVxcbi5tYW5hLnN5IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMjIuMiUgMzMuMyU7IH1cXG4ubWFuYS5zeiB7IGJhY2tncm91bmQtcG9zaXRpb246IDMzLjMlIDMzLjMlOyB9XFxuLm1hbmEuc3cgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA0NC40JSAzMy4zJTsgfVxcbi5tYW5hLnN1IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNTUuNSUgMzMuMyU7IH1cXG4ubWFuYS5zYiB7IGJhY2tncm91bmQtcG9zaXRpb246IDY2LjYlIDMzLjMlOyB9XFxuLm1hbmEuc3IgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA3Ny43JSAzMy4zJTsgfVxcbi5tYW5hLnNnIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogODguOCUgMzMuMyU7IH1cXG4ubWFuYS5zcyB7IGJhY2tncm91bmQtcG9zaXRpb246IDk5LjklIDMzLjMlOyB9XFxuXFxuLm1hbmEuc3d1IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMCA1MCU7IH1cXG4ubWFuYS5zd2IgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAxMS4xJSA1MCU7IH1cXG4ubWFuYS5zdWIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAyMi4yJSA1MCU7IH1cXG4ubWFuYS5zdXIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAzMy4zJSA1MCU7IH1cXG4ubWFuYS5zYnIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA0NC40JSA1MCU7IH1cXG4ubWFuYS5zYmcgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA1NS41JSA1MCU7IH1cXG4ubWFuYS5zcncgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA2Ni42JSA1MCU7IH1cXG4ubWFuYS5zcmcgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA3Ny43JSA1MCU7IH1cXG4ubWFuYS5zZ3cgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4OC44JSA1MCU7IH1cXG4ubWFuYS5zZ3UgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA5OS45JSA1MCU7IH1cXG5cXG4ubWFuYS5zMncgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwIDY2LjYlOyB9XFxuLm1hbmEuczJ1IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMTEuMSUgNjYuNiU7IH1cXG4ubWFuYS5zMmIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAyMi4yJSA2Ni42JTsgfVxcbi5tYW5hLnMyciB7IGJhY2tncm91bmQtcG9zaXRpb246IDMzLjMlIDY2LjYlOyB9XFxuLm1hbmEuczJnIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNDQuNCUgNjYuNiU7IH1cXG4ubWFuYS5zd3AgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA1NS41JSA2Ni42JTsgfVxcbi5tYW5hLnN1cCB7IGJhY2tncm91bmQtcG9zaXRpb246IDY2LjYlIDY2LjYlOyB9XFxuLm1hbmEuc2JwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNzcuNyUgNjYuNiU7IH1cXG4ubWFuYS5zcnAgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4OC44JSA2Ni42JTsgfVxcbi5tYW5hLnNncCB7IGJhY2tncm91bmQtcG9zaXRpb246IDk5LjklIDY2LjYlOyB9XFxuXFxuLm1hbmEuc3QgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwJSA4My4zJTsgfVxcbi5tYW5hLnNxIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMTEuMSUgODMuMyU7IH1cXG5cXG4ubWFuYS5zYyB7IGJhY2tncm91bmQtcG9zaXRpb246IDc3LjclIDgzLjMlOyB9XFxuXFxuLm1hbmEuc2UgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4OC44JSA4My4zJTsgfVxcblxcbi5tYW5hLnMxMDAwMDAwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMCAxMDAlOyB9XFxuLm1hbmEuczEwMDAwMDAuc21hbGwgeyB3aWR0aDogNC45ZW07IH1cXG4ubWFuYS5zMTAwMDAwMC5tZWRpdW0geyB3aWR0aDogOS43ZW07IH1cXG4vKi5tYW5hLnMxMDAwMDAwLmxhcmdlIHsgd2lkdGg6IDE4LjhlbTsgfSovXFxuLm1hbmEuczEwMCB7IGJhY2tncm91bmQtcG9zaXRpb246IDYwJSAxMDAlOyB9XFxuLm1hbmEuczEwMC5zbWFsbCB7IHdpZHRoOiAxLjhlbTsgfVxcbi5tYW5hLnMxMDAubWVkaXVtIHsgd2lkdGg6IDMuN2VtOyB9XFxuLyoubWFuYS5zMTAwLmxhcmdlIHsgd2lkdGg6IDEwLjhlbTsgfSovXFxuLm1hbmEuc2NoYW9zIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNzYuNSUgMTAwJTsgfVxcbi5tYW5hLnNjaGFvcy5zbWFsbCB7IHdpZHRoOiAxLjJlbTsgfVxcbi5tYW5hLnNjaGFvcy5tZWRpdW0geyB3aWR0aDogMi4zZW07IH1cXG4vKi5tYW5hLnNjLmxhcmdlIHsgd2lkdGg6IDQuNmVtOyB9Ki9cXG4ubWFuYS5zaHcgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4My41JSAxMDAlOyB9XFxuLm1hbmEuc2h3LnNtYWxsIHsgd2lkdGg6IDAuNWVtOyB9XFxuLm1hbmEuc2h3Lm1lZGl1bSB7IHdpZHRoOiAxZW07IH1cXG4vKi5tYW5hLnNody5sYXJnZSB7IHdpZHRoOiAyZW07IH0qL1xcbi5tYW5hLnNociB7IGJhY2tncm91bmQtcG9zaXRpb246IDg5JSAxMDAlOyB9XFxuLm1hbmEuc2hyLnNtYWxsIHsgd2lkdGg6IDAuNWVtOyB9XFxuLm1hbmEuc2hyLm1lZGl1bSB7IHdpZHRoOiAxZW07IH1cXG4vKi5tYW5hLnNoci5sYXJnZSB7IHdpZHRoOiAyZW07IH0qL1xcblxcblxcbi5zaGFkb3cge1xcbiAgICBmaWx0ZXI6IFxcXCJwcm9naWQ6RFhJbWFnZVRyYW5zZm9ybS5NaWNyb3NvZnQuRHJvcHNoYWRvdyhPZmZYPS0xLCBPZmZZPTEsIENvbG9yPScjMDAwJylcXFwiO1xcbiAgICBmaWx0ZXI6IHVybCgjc2hhZG93KTtcXG4gICAgLXdlYmtpdC1maWx0ZXI6IGRyb3Atc2hhZG93KC0xcHggMXB4IDBweCAjMDAwKTtcXG4gICAgZmlsdGVyOiBkcm9wLXNoYWRvdygtMXB4IDFweCAwcHggIzAwMCk7XFxufVwiLCBcIlwiLHtcInZlcnNpb25cIjozLFwic291cmNlc1wiOltcIndlYnBhY2s6Ly9zcmMvY3NzL3ZlbmRvci9tYW5hLmNzc1wiXSxcIm5hbWVzXCI6W10sXCJtYXBwaW5n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QUFFO0FBQzNDLGtCQUFrQixZQUFZLEVBQUU7QUFDaEMsbUJBQW1CLFVBQVUsRUFBRTtBQUMvQixrQ0FBa0M7OztBQUdsQztJQUNJLHFGQUFxRjtJQUNyRixvQkFBb0I7SUFDcEIsOENBQThDO0lBQzlDLHNDQUFzQztBQUMxQ1wiLFwic291cmNlc0NvbnRlbnRcIjpbXCIubWFuYSB7XFxuICAgIGJhY2tncm91bmQtaW1hZ2U6IHVybCgnLi4vLi4vaW1nL21hbmEtc3ltYm9scy9tYW5hLnN2ZycpO1xcbiAgICBiYWNrZ3JvdW5kLXJlcGVhdDogbm8tcmVwZWF0O1xcbiAgICBiYWNrZ3JvdW5kLXNpemU6IGF1dG8gNzAwJTtcXG4gICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgICBmb250LXNpemU6IDEwMCU7XFxufVxcblxcbi5tYW5hLnhzIHtcXG4gICAgd2lkdGg6IDEuNXJlbTtcXG4gICAgaGVpZ2h0OiAxLjVyZW07XFxufVxcblxcbi5tYW5hLnNtYWxsIHtcXG4gICAgaGVpZ2h0OiAycmVtO1xcbiAgICB3aWR0aDogMnJlbTtcXG59XFxuLm1hbmEubWVkaXVtIHtcXG4gICAgaGVpZ2h0OiAyZW07XFxuICAgIHdpZHRoOiAyZW07XFxufVxcbi5tYW5hLmxhcmdlIHtcXG4gICAgaGVpZ2h0OiA0ZW07XFxuICAgIHdpZHRoOiA0ZW07XFxufVxcbi5tYW5hLnMgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwIDA7IH1cXG4ubWFuYS5zMSB7IGJhY2tncm91bmQtcG9zaXRpb246IDExLjElIDA7IH1cXG4ubWFuYS5zMiB7IGJhY2tncm91bmQtcG9zaXRpb246IDIyLjIlIDA7IH1cXG4ubWFuYS5zMyB7IGJhY2tncm91bmQtcG9zaXRpb246IDMzLjMlIDA7IH1cXG4ubWFuYS5zNCB7IGJhY2tncm91bmQtcG9zaXRpb246IDQ0LjQlIDA7IH1cXG4ubWFuYS5zNSB7IGJhY2tncm91bmQtcG9zaXRpb246IDU1LjUlIDA7IH1cXG4ubWFuYS5zNiB7IGJhY2tncm91bmQtcG9zaXRpb246IDY2LjYlIDA7IH1cXG4ubWFuYS5zNyB7IGJhY2tncm91bmQtcG9zaXRpb246IDc3LjclIDA7IH1cXG4ubWFuYS5zOCB7IGJhY2tncm91bmQtcG9zaXRpb246IDg4LjglIDA7IH1cXG4ubWFuYS5zOSB7IGJhY2tncm91bmQtcG9zaXRpb246IDk5LjklIDA7IH1cXG5cXG4ubWFuYS5zMTAgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwIDE2JTsgfVxcbi5tYW5hLnMxMSB7IGJhY2tncm91bmQtcG9zaXRpb246IDExLjElIDE2LjYlOyB9XFxuLm1hbmEuczEyIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMjIuMiUgMTYuNiU7IH1cXG4ubWFuYS5zMTMgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAzMy4zJSAxNi42JTsgfVxcbi5tYW5hLnMxNCB7IGJhY2tncm91bmQtcG9zaXRpb246IDQ0LjQlIDE2LjYlOyB9XFxuLm1hbmEuczE1IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNTUuNSUgMTYuNiU7IH1cXG4ubWFuYS5zMTYgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA2Ni42JSAxNi42JTsgfVxcbi5tYW5hLnMxNyB7IGJhY2tncm91bmQtcG9zaXRpb246IDc3LjclIDE2LjYlOyB9XFxuLm1hbmEuczE4IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogODguOCUgMTYuNiU7IH1cXG4ubWFuYS5zMTkgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA5OS45JSAxNi42JTsgfVxcblxcbi5tYW5hLnMyMCB7IGJhY2tncm91bmQtcG9zaXRpb246IDAgMzMlOyB9XFxuLm1hbmEuc3ggeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAxMS4xJSAzMy4zJTsgfVxcbi5tYW5hLnN5IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMjIuMiUgMzMuMyU7IH1cXG4ubWFuYS5zeiB7IGJhY2tncm91bmQtcG9zaXRpb246IDMzLjMlIDMzLjMlOyB9XFxuLm1hbmEuc3cgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA0NC40JSAzMy4zJTsgfVxcbi5tYW5hLnN1IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNTUuNSUgMzMuMyU7IH1cXG4ubWFuYS5zYiB7IGJhY2tncm91bmQtcG9zaXRpb246IDY2LjYlIDMzLjMlOyB9XFxuLm1hbmEuc3IgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA3Ny43JSAzMy4zJTsgfVxcbi5tYW5hLnNnIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogODguOCUgMzMuMyU7IH1cXG4ubWFuYS5zcyB7IGJhY2tncm91bmQtcG9zaXRpb246IDk5LjklIDMzLjMlOyB9XFxuXFxuLm1hbmEuc3d1IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMCA1MCU7IH1cXG4ubWFuYS5zd2IgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAxMS4xJSA1MCU7IH1cXG4ubWFuYS5zdWIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAyMi4yJSA1MCU7IH1cXG4ubWFuYS5zdXIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAzMy4zJSA1MCU7IH1cXG4ubWFuYS5zYnIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA0NC40JSA1MCU7IH1cXG4ubWFuYS5zYmcgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA1NS41JSA1MCU7IH1cXG4ubWFuYS5zcncgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA2Ni42JSA1MCU7IH1cXG4ubWFuYS5zcmcgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA3Ny43JSA1MCU7IH1cXG4ubWFuYS5zZ3cgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4OC44JSA1MCU7IH1cXG4ubWFuYS5zZ3UgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA5OS45JSA1MCU7IH1cXG5cXG4ubWFuYS5zMncgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwIDY2LjYlOyB9XFxuLm1hbmEuczJ1IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMTEuMSUgNjYuNiU7IH1cXG4ubWFuYS5zMmIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAyMi4yJSA2Ni42JTsgfVxcbi5tYW5hLnMyciB7IGJhY2tncm91bmQtcG9zaXRpb246IDMzLjMlIDY2LjYlOyB9XFxuLm1hbmEuczJnIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNDQuNCUgNjYuNiU7IH1cXG4ubWFuYS5zd3AgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA1NS41JSA2Ni42JTsgfVxcbi5tYW5hLnN1cCB7IGJhY2tncm91bmQtcG9zaXRpb246IDY2LjYlIDY2LjYlOyB9XFxuLm1hbmEuc2JwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNzcuNyUgNjYuNiU7IH1cXG4ubWFuYS5zcnAgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4OC44JSA2Ni42JTsgfVxcbi5tYW5hLnNncCB7IGJhY2tncm91bmQtcG9zaXRpb246IDk5LjklIDY2LjYlOyB9XFxuXFxuLm1hbmEuc3QgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwJSA4My4zJTsgfVxcbi5tYW5hLnNxIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMTEuMSUgODMuMyU7IH1cXG5cXG4ubWFuYS5zYyB7IGJhY2tncm91bmQtcG9zaXRpb246IDc3LjclIDgzLjMlOyB9XFxuXFxuLm1hbmEuc2UgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4OC44JSA4My4zJTsgfVxcblxcbi5tYW5hLnMxMDAwMDAwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMCAxMDAlOyB9XFxuLm1hbmEuczEwMDAwMDAuc21hbGwgeyB3aWR0aDogNC45ZW07IH1cXG4ubWFuYS5zMTAwMDAwMC5tZWRpdW0geyB3aWR0aDogOS43ZW07IH1cXG4vKi5tYW5hLnMxMDAwMDAwLmxhcmdlIHsgd2lkdGg6IDE4LjhlbTsgfSovXFxuLm1hbmEuczEwMCB7IGJhY2tncm91bmQtcG9zaXRpb246IDYwJSAxMDAlOyB9XFxuLm1hbmEuczEwMC5zbWFsbCB7IHdpZHRoOiAxLjhlbTsgfVxcbi5tYW5hLnMxMDAubWVkaXVtIHsgd2lkdGg6IDMuN2VtOyB9XFxuLyoubWFuYS5zMTAwLmxhcmdlIHsgd2lkdGg6IDEwLjhlbTsgfSovXFxuLm1hbmEuc2NoYW9zIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNzYuNSUgMTAwJTsgfVxcbi5tYW5hLnNjaGFvcy5zbWFsbCB7IHdpZHRoOiAxLjJlbTsgfVxcbi5tYW5hLnNjaGFvcy5tZWRpdW0geyB3aWR0aDogMi4zZW07IH1cXG4vKi5tYW5hLnNjLmxhcmdlIHsgd2lkdGg6IDQuNmVtOyB9Ki9cXG4ubWFuYS5zaHcgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4My41JSAxMDAlOyB9XFxuLm1hbmEuc2h3LnNtYWxsIHsgd2lkdGg6IDAuNWVtOyB9XFxuLm1hbmEuc2h3Lm1lZGl1bSB7IHdpZHRoOiAxZW07IH1cXG4vKi5tYW5hLnNody5sYXJnZSB7IHdpZHRoOiAyZW07IH0qL1xcbi5tYW5hLnNociB7IGJhY2tncm91bmQtcG9zaXRpb246IDg5JSAxMDAlOyB9XFxuLm1hbmEuc2hyLnNtYWxsIHsgd2lkdGg6IDAuNWVtOyB9XFxuLm1hbmEuc2hyLm1lZGl1bSB7IHdpZHRoOiAxZW07IH1cXG4vKi5tYW5hLnNoci5sYXJnZSB7IHdpZHRoOiAyZW07IH0qL1xcblxcblxcbi5zaGFkb3cge1xcbiAgICBmaWx0ZXI6IFxcXCJwcm9naWQ6RFhJbWFnZVRyYW5zZm9ybS5NaWNyb3NvZnQuRHJvcHNoYWRvdyhPZmZYPS0xLCBPZmZZPTEsIENvbG9yPScjMDAwJylcXFwiO1xcbiAgICBmaWx0ZXI6IHVybCgjc2hhZG93KTtcXG4gICAgLXdlYmtpdC1maWx0ZXI6IGRyb3Atc2hhZG93KC0xcHggMXB4IDBweCAjMDAwKTtcXG4gICAgZmlsdGVyOiBkcm9wLXNoYWRvdygtMXB4IDFweCAwcHggIzAwMCk7XFxufVwiXSxcInNvdXJjZVJvb3RcIjpcIlwifV0pO1xuLy8gRXhwb3J0c1xuZXhwb3J0IGRlZmF1bHQgX19fQ1NTX0xPQURFUl9FWFBPUlRfX187XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAgTUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAgQXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cbi8vIGNzcyBiYXNlIGNvZGUsIGluamVjdGVkIGJ5IHRoZSBjc3MtbG9hZGVyXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY3NzV2l0aE1hcHBpbmdUb1N0cmluZykge1xuICB2YXIgbGlzdCA9IFtdOyAvLyByZXR1cm4gdGhlIGxpc3Qgb2YgbW9kdWxlcyBhcyBjc3Mgc3RyaW5nXG5cbiAgbGlzdC50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiB0aGlzLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgdmFyIGNvbnRlbnQgPSBjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKGl0ZW0pO1xuXG4gICAgICBpZiAoaXRlbVsyXSkge1xuICAgICAgICByZXR1cm4gXCJAbWVkaWEgXCIuY29uY2F0KGl0ZW1bMl0sIFwiIHtcIikuY29uY2F0KGNvbnRlbnQsIFwifVwiKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNvbnRlbnQ7XG4gICAgfSkuam9pbignJyk7XG4gIH07IC8vIGltcG9ydCBhIGxpc3Qgb2YgbW9kdWxlcyBpbnRvIHRoZSBsaXN0XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG5cblxuICBsaXN0LmkgPSBmdW5jdGlvbiAobW9kdWxlcywgbWVkaWFRdWVyeSwgZGVkdXBlKSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGVzID09PSAnc3RyaW5nJykge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gICAgICBtb2R1bGVzID0gW1tudWxsLCBtb2R1bGVzLCAnJ11dO1xuICAgIH1cblxuICAgIHZhciBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzID0ge307XG5cbiAgICBpZiAoZGVkdXBlKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByZWZlci1kZXN0cnVjdHVyaW5nXG4gICAgICAgIHZhciBpZCA9IHRoaXNbaV1bMF07XG5cbiAgICAgICAgaWYgKGlkICE9IG51bGwpIHtcbiAgICAgICAgICBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2lkXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgbW9kdWxlcy5sZW5ndGg7IF9pKyspIHtcbiAgICAgIHZhciBpdGVtID0gW10uY29uY2F0KG1vZHVsZXNbX2ldKTtcblxuICAgICAgaWYgKGRlZHVwZSAmJiBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2l0ZW1bMF1dKSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb250aW51ZVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKG1lZGlhUXVlcnkpIHtcbiAgICAgICAgaWYgKCFpdGVtWzJdKSB7XG4gICAgICAgICAgaXRlbVsyXSA9IG1lZGlhUXVlcnk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsyXSA9IFwiXCIuY29uY2F0KG1lZGlhUXVlcnksIFwiIGFuZCBcIikuY29uY2F0KGl0ZW1bMl0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGxpc3QucHVzaChpdGVtKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIGxpc3Q7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5mdW5jdGlvbiBfc2xpY2VkVG9BcnJheShhcnIsIGkpIHsgcmV0dXJuIF9hcnJheVdpdGhIb2xlcyhhcnIpIHx8IF9pdGVyYWJsZVRvQXJyYXlMaW1pdChhcnIsIGkpIHx8IF91bnN1cHBvcnRlZEl0ZXJhYmxlVG9BcnJheShhcnIsIGkpIHx8IF9ub25JdGVyYWJsZVJlc3QoKTsgfVxuXG5mdW5jdGlvbiBfbm9uSXRlcmFibGVSZXN0KCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZS5cXG5JbiBvcmRlciB0byBiZSBpdGVyYWJsZSwgbm9uLWFycmF5IG9iamVjdHMgbXVzdCBoYXZlIGEgW1N5bWJvbC5pdGVyYXRvcl0oKSBtZXRob2QuXCIpOyB9XG5cbmZ1bmN0aW9uIF91bnN1cHBvcnRlZEl0ZXJhYmxlVG9BcnJheShvLCBtaW5MZW4pIHsgaWYgKCFvKSByZXR1cm47IGlmICh0eXBlb2YgbyA9PT0gXCJzdHJpbmdcIikgcmV0dXJuIF9hcnJheUxpa2VUb0FycmF5KG8sIG1pbkxlbik7IHZhciBuID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pLnNsaWNlKDgsIC0xKTsgaWYgKG4gPT09IFwiT2JqZWN0XCIgJiYgby5jb25zdHJ1Y3RvcikgbiA9IG8uY29uc3RydWN0b3IubmFtZTsgaWYgKG4gPT09IFwiTWFwXCIgfHwgbiA9PT0gXCJTZXRcIikgcmV0dXJuIEFycmF5LmZyb20obyk7IGlmIChuID09PSBcIkFyZ3VtZW50c1wiIHx8IC9eKD86VWl8SSludCg/Ojh8MTZ8MzIpKD86Q2xhbXBlZCk/QXJyYXkkLy50ZXN0KG4pKSByZXR1cm4gX2FycmF5TGlrZVRvQXJyYXkobywgbWluTGVuKTsgfVxuXG5mdW5jdGlvbiBfYXJyYXlMaWtlVG9BcnJheShhcnIsIGxlbikgeyBpZiAobGVuID09IG51bGwgfHwgbGVuID4gYXJyLmxlbmd0aCkgbGVuID0gYXJyLmxlbmd0aDsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBuZXcgQXJyYXkobGVuKTsgaSA8IGxlbjsgaSsrKSB7IGFycjJbaV0gPSBhcnJbaV07IH0gcmV0dXJuIGFycjI7IH1cblxuZnVuY3Rpb24gX2l0ZXJhYmxlVG9BcnJheUxpbWl0KGFyciwgaSkgeyBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJ1bmRlZmluZWRcIiB8fCAhKFN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QoYXJyKSkpIHJldHVybjsgdmFyIF9hcnIgPSBbXTsgdmFyIF9uID0gdHJ1ZTsgdmFyIF9kID0gZmFsc2U7IHZhciBfZSA9IHVuZGVmaW5lZDsgdHJ5IHsgZm9yICh2YXIgX2kgPSBhcnJbU3ltYm9sLml0ZXJhdG9yXSgpLCBfczsgIShfbiA9IChfcyA9IF9pLm5leHQoKSkuZG9uZSk7IF9uID0gdHJ1ZSkgeyBfYXJyLnB1c2goX3MudmFsdWUpOyBpZiAoaSAmJiBfYXJyLmxlbmd0aCA9PT0gaSkgYnJlYWs7IH0gfSBjYXRjaCAoZXJyKSB7IF9kID0gdHJ1ZTsgX2UgPSBlcnI7IH0gZmluYWxseSB7IHRyeSB7IGlmICghX24gJiYgX2lbXCJyZXR1cm5cIl0gIT0gbnVsbCkgX2lbXCJyZXR1cm5cIl0oKTsgfSBmaW5hbGx5IHsgaWYgKF9kKSB0aHJvdyBfZTsgfSB9IHJldHVybiBfYXJyOyB9XG5cbmZ1bmN0aW9uIF9hcnJheVdpdGhIb2xlcyhhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgcmV0dXJuIGFycjsgfVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcoaXRlbSkge1xuICB2YXIgX2l0ZW0gPSBfc2xpY2VkVG9BcnJheShpdGVtLCA0KSxcbiAgICAgIGNvbnRlbnQgPSBfaXRlbVsxXSxcbiAgICAgIGNzc01hcHBpbmcgPSBfaXRlbVszXTtcblxuICBpZiAodHlwZW9mIGJ0b2EgPT09ICdmdW5jdGlvbicpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcbiAgICB2YXIgYmFzZTY0ID0gYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoY3NzTWFwcGluZykpKSk7XG4gICAgdmFyIGRhdGEgPSBcInNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LFwiLmNvbmNhdChiYXNlNjQpO1xuICAgIHZhciBzb3VyY2VNYXBwaW5nID0gXCIvKiMgXCIuY29uY2F0KGRhdGEsIFwiICovXCIpO1xuICAgIHZhciBzb3VyY2VVUkxzID0gY3NzTWFwcGluZy5zb3VyY2VzLm1hcChmdW5jdGlvbiAoc291cmNlKSB7XG4gICAgICByZXR1cm4gXCIvKiMgc291cmNlVVJMPVwiLmNvbmNhdChjc3NNYXBwaW5nLnNvdXJjZVJvb3QgfHwgJycpLmNvbmNhdChzb3VyY2UsIFwiICovXCIpO1xuICAgIH0pO1xuICAgIHJldHVybiBbY29udGVudF0uY29uY2F0KHNvdXJjZVVSTHMpLmNvbmNhdChbc291cmNlTWFwcGluZ10pLmpvaW4oJ1xcbicpO1xuICB9XG5cbiAgcmV0dXJuIFtjb250ZW50XS5qb2luKCdcXG4nKTtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHVybCwgb3B0aW9ucykge1xuICBpZiAoIW9wdGlvbnMpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgICBvcHRpb25zID0ge307XG4gIH0gLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVyc2NvcmUtZGFuZ2xlLCBuby1wYXJhbS1yZWFzc2lnblxuXG5cbiAgdXJsID0gdXJsICYmIHVybC5fX2VzTW9kdWxlID8gdXJsLmRlZmF1bHQgOiB1cmw7XG5cbiAgaWYgKHR5cGVvZiB1cmwgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHVybDtcbiAgfSAvLyBJZiB1cmwgaXMgYWxyZWFkeSB3cmFwcGVkIGluIHF1b3RlcywgcmVtb3ZlIHRoZW1cblxuXG4gIGlmICgvXlsnXCJdLipbJ1wiXSQvLnRlc3QodXJsKSkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICAgIHVybCA9IHVybC5zbGljZSgxLCAtMSk7XG4gIH1cblxuICBpZiAob3B0aW9ucy5oYXNoKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gICAgdXJsICs9IG9wdGlvbnMuaGFzaDtcbiAgfSAvLyBTaG91bGQgdXJsIGJlIHdyYXBwZWQ/XG4gIC8vIFNlZSBodHRwczovL2RyYWZ0cy5jc3N3Zy5vcmcvY3NzLXZhbHVlcy0zLyN1cmxzXG5cblxuICBpZiAoL1tcIicoKSBcXHRcXG5dLy50ZXN0KHVybCkgfHwgb3B0aW9ucy5uZWVkUXVvdGVzKSB7XG4gICAgcmV0dXJuIFwiXFxcIlwiLmNvbmNhdCh1cmwucmVwbGFjZSgvXCIvZywgJ1xcXFxcIicpLnJlcGxhY2UoL1xcbi9nLCAnXFxcXG4nKSwgXCJcXFwiXCIpO1xuICB9XG5cbiAgcmV0dXJuIHVybDtcbn07IiwiZXhwb3J0IGRlZmF1bHQgX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcImFkNDVjN2E0OTQ1NWFkNmRkMjE1MTExNzA4YTk3MGRjLmpwZ1wiOyIsImV4cG9ydCBkZWZhdWx0IF9fd2VicGFja19wdWJsaWNfcGF0aF9fICsgXCJjODlhMDMwNWM2ZWJmZjM4NTg4NzhkZjYxMzY4NzY3YS5zdmdcIjsiLCJpbXBvcnQgYXBpIGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzXCI7XG4gICAgICAgICAgICBpbXBvcnQgY29udGVudCBmcm9tIFwiISEuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL3N0eWxlLmNzc1wiO1xuXG52YXIgb3B0aW9ucyA9IHt9O1xuXG5vcHRpb25zLmluc2VydCA9IFwiaGVhZFwiO1xub3B0aW9ucy5zaW5nbGV0b24gPSBmYWxzZTtcblxudmFyIHVwZGF0ZSA9IGFwaShjb250ZW50LCBvcHRpb25zKTtcblxuXG5cbmV4cG9ydCBkZWZhdWx0IGNvbnRlbnQubG9jYWxzIHx8IHt9OyIsImltcG9ydCBhcGkgZnJvbSBcIiEuLi8uLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanNcIjtcbiAgICAgICAgICAgIGltcG9ydCBjb250ZW50IGZyb20gXCIhIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vbWFuYS5jc3NcIjtcblxudmFyIG9wdGlvbnMgPSB7fTtcblxub3B0aW9ucy5pbnNlcnQgPSBcImhlYWRcIjtcbm9wdGlvbnMuc2luZ2xldG9uID0gZmFsc2U7XG5cbnZhciB1cGRhdGUgPSBhcGkoY29udGVudCwgb3B0aW9ucyk7XG5cblxuXG5leHBvcnQgZGVmYXVsdCBjb250ZW50LmxvY2FscyB8fCB7fTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIGlzT2xkSUUgPSBmdW5jdGlvbiBpc09sZElFKCkge1xuICB2YXIgbWVtbztcbiAgcmV0dXJuIGZ1bmN0aW9uIG1lbW9yaXplKCkge1xuICAgIGlmICh0eXBlb2YgbWVtbyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIC8vIFRlc3QgZm9yIElFIDw9IDkgYXMgcHJvcG9zZWQgYnkgQnJvd3NlcmhhY2tzXG4gICAgICAvLyBAc2VlIGh0dHA6Ly9icm93c2VyaGFja3MuY29tLyNoYWNrLWU3MWQ4NjkyZjY1MzM0MTczZmVlNzE1YzIyMmNiODA1XG4gICAgICAvLyBUZXN0cyBmb3IgZXhpc3RlbmNlIG9mIHN0YW5kYXJkIGdsb2JhbHMgaXMgdG8gYWxsb3cgc3R5bGUtbG9hZGVyXG4gICAgICAvLyB0byBvcGVyYXRlIGNvcnJlY3RseSBpbnRvIG5vbi1zdGFuZGFyZCBlbnZpcm9ubWVudHNcbiAgICAgIC8vIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3dlYnBhY2stY29udHJpYi9zdHlsZS1sb2FkZXIvaXNzdWVzLzE3N1xuICAgICAgbWVtbyA9IEJvb2xlYW4od2luZG93ICYmIGRvY3VtZW50ICYmIGRvY3VtZW50LmFsbCAmJiAhd2luZG93LmF0b2IpO1xuICAgIH1cblxuICAgIHJldHVybiBtZW1vO1xuICB9O1xufSgpO1xuXG52YXIgZ2V0VGFyZ2V0ID0gZnVuY3Rpb24gZ2V0VGFyZ2V0KCkge1xuICB2YXIgbWVtbyA9IHt9O1xuICByZXR1cm4gZnVuY3Rpb24gbWVtb3JpemUodGFyZ2V0KSB7XG4gICAgaWYgKHR5cGVvZiBtZW1vW3RhcmdldF0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB2YXIgc3R5bGVUYXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCk7IC8vIFNwZWNpYWwgY2FzZSB0byByZXR1cm4gaGVhZCBvZiBpZnJhbWUgaW5zdGVhZCBvZiBpZnJhbWUgaXRzZWxmXG5cbiAgICAgIGlmICh3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQgJiYgc3R5bGVUYXJnZXQgaW5zdGFuY2VvZiB3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAvLyBUaGlzIHdpbGwgdGhyb3cgYW4gZXhjZXB0aW9uIGlmIGFjY2VzcyB0byBpZnJhbWUgaXMgYmxvY2tlZFxuICAgICAgICAgIC8vIGR1ZSB0byBjcm9zcy1vcmlnaW4gcmVzdHJpY3Rpb25zXG4gICAgICAgICAgc3R5bGVUYXJnZXQgPSBzdHlsZVRhcmdldC5jb250ZW50RG9jdW1lbnQuaGVhZDtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIC8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0XG4gICAgICAgICAgc3R5bGVUYXJnZXQgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIG1lbW9bdGFyZ2V0XSA9IHN0eWxlVGFyZ2V0O1xuICAgIH1cblxuICAgIHJldHVybiBtZW1vW3RhcmdldF07XG4gIH07XG59KCk7XG5cbnZhciBzdHlsZXNJbkRvbSA9IFtdO1xuXG5mdW5jdGlvbiBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKSB7XG4gIHZhciByZXN1bHQgPSAtMTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0eWxlc0luRG9tLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHN0eWxlc0luRG9tW2ldLmlkZW50aWZpZXIgPT09IGlkZW50aWZpZXIpIHtcbiAgICAgIHJlc3VsdCA9IGk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucykge1xuICB2YXIgaWRDb3VudE1hcCA9IHt9O1xuICB2YXIgaWRlbnRpZmllcnMgPSBbXTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaXRlbSA9IGxpc3RbaV07XG4gICAgdmFyIGlkID0gb3B0aW9ucy5iYXNlID8gaXRlbVswXSArIG9wdGlvbnMuYmFzZSA6IGl0ZW1bMF07XG4gICAgdmFyIGNvdW50ID0gaWRDb3VudE1hcFtpZF0gfHwgMDtcbiAgICB2YXIgaWRlbnRpZmllciA9IFwiXCIuY29uY2F0KGlkLCBcIiBcIikuY29uY2F0KGNvdW50KTtcbiAgICBpZENvdW50TWFwW2lkXSA9IGNvdW50ICsgMTtcbiAgICB2YXIgaW5kZXggPSBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgICB2YXIgb2JqID0ge1xuICAgICAgY3NzOiBpdGVtWzFdLFxuICAgICAgbWVkaWE6IGl0ZW1bMl0sXG4gICAgICBzb3VyY2VNYXA6IGl0ZW1bM11cbiAgICB9O1xuXG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgc3R5bGVzSW5Eb21baW5kZXhdLnJlZmVyZW5jZXMrKztcbiAgICAgIHN0eWxlc0luRG9tW2luZGV4XS51cGRhdGVyKG9iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0eWxlc0luRG9tLnB1c2goe1xuICAgICAgICBpZGVudGlmaWVyOiBpZGVudGlmaWVyLFxuICAgICAgICB1cGRhdGVyOiBhZGRTdHlsZShvYmosIG9wdGlvbnMpLFxuICAgICAgICByZWZlcmVuY2VzOiAxXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZGVudGlmaWVycy5wdXNoKGlkZW50aWZpZXIpO1xuICB9XG5cbiAgcmV0dXJuIGlkZW50aWZpZXJzO1xufVxuXG5mdW5jdGlvbiBpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucykge1xuICB2YXIgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICB2YXIgYXR0cmlidXRlcyA9IG9wdGlvbnMuYXR0cmlidXRlcyB8fCB7fTtcblxuICBpZiAodHlwZW9mIGF0dHJpYnV0ZXMubm9uY2UgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgdmFyIG5vbmNlID0gdHlwZW9mIF9fd2VicGFja19ub25jZV9fICE9PSAndW5kZWZpbmVkJyA/IF9fd2VicGFja19ub25jZV9fIDogbnVsbDtcblxuICAgIGlmIChub25jZSkge1xuICAgICAgYXR0cmlidXRlcy5ub25jZSA9IG5vbmNlO1xuICAgIH1cbiAgfVxuXG4gIE9iamVjdC5rZXlzKGF0dHJpYnV0ZXMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIHN0eWxlLnNldEF0dHJpYnV0ZShrZXksIGF0dHJpYnV0ZXNba2V5XSk7XG4gIH0pO1xuXG4gIGlmICh0eXBlb2Ygb3B0aW9ucy5pbnNlcnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICBvcHRpb25zLmluc2VydChzdHlsZSk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIHRhcmdldCA9IGdldFRhcmdldChvcHRpb25zLmluc2VydCB8fCAnaGVhZCcpO1xuXG4gICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkbid0IGZpbmQgYSBzdHlsZSB0YXJnZXQuIFRoaXMgcHJvYmFibHkgbWVhbnMgdGhhdCB0aGUgdmFsdWUgZm9yIHRoZSAnaW5zZXJ0JyBwYXJhbWV0ZXIgaXMgaW52YWxpZC5cIik7XG4gICAgfVxuXG4gICAgdGFyZ2V0LmFwcGVuZENoaWxkKHN0eWxlKTtcbiAgfVxuXG4gIHJldHVybiBzdHlsZTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlKSB7XG4gIC8vIGlzdGFuYnVsIGlnbm9yZSBpZlxuICBpZiAoc3R5bGUucGFyZW50Tm9kZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHN0eWxlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc3R5bGUpO1xufVxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5cblxudmFyIHJlcGxhY2VUZXh0ID0gZnVuY3Rpb24gcmVwbGFjZVRleHQoKSB7XG4gIHZhciB0ZXh0U3RvcmUgPSBbXTtcbiAgcmV0dXJuIGZ1bmN0aW9uIHJlcGxhY2UoaW5kZXgsIHJlcGxhY2VtZW50KSB7XG4gICAgdGV4dFN0b3JlW2luZGV4XSA9IHJlcGxhY2VtZW50O1xuICAgIHJldHVybiB0ZXh0U3RvcmUuZmlsdGVyKEJvb2xlYW4pLmpvaW4oJ1xcbicpO1xuICB9O1xufSgpO1xuXG5mdW5jdGlvbiBhcHBseVRvU2luZ2xldG9uVGFnKHN0eWxlLCBpbmRleCwgcmVtb3ZlLCBvYmopIHtcbiAgdmFyIGNzcyA9IHJlbW92ZSA/ICcnIDogb2JqLm1lZGlhID8gXCJAbWVkaWEgXCIuY29uY2F0KG9iai5tZWRpYSwgXCIge1wiKS5jb25jYXQob2JqLmNzcywgXCJ9XCIpIDogb2JqLmNzczsgLy8gRm9yIG9sZCBJRVxuXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAgKi9cblxuICBpZiAoc3R5bGUuc3R5bGVTaGVldCkge1xuICAgIHN0eWxlLnN0eWxlU2hlZXQuY3NzVGV4dCA9IHJlcGxhY2VUZXh0KGluZGV4LCBjc3MpO1xuICB9IGVsc2Uge1xuICAgIHZhciBjc3NOb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKTtcbiAgICB2YXIgY2hpbGROb2RlcyA9IHN0eWxlLmNoaWxkTm9kZXM7XG5cbiAgICBpZiAoY2hpbGROb2Rlc1tpbmRleF0pIHtcbiAgICAgIHN0eWxlLnJlbW92ZUNoaWxkKGNoaWxkTm9kZXNbaW5kZXhdKTtcbiAgICB9XG5cbiAgICBpZiAoY2hpbGROb2Rlcy5sZW5ndGgpIHtcbiAgICAgIHN0eWxlLmluc2VydEJlZm9yZShjc3NOb2RlLCBjaGlsZE5vZGVzW2luZGV4XSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0eWxlLmFwcGVuZENoaWxkKGNzc05vZGUpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBhcHBseVRvVGFnKHN0eWxlLCBvcHRpb25zLCBvYmopIHtcbiAgdmFyIGNzcyA9IG9iai5jc3M7XG4gIHZhciBtZWRpYSA9IG9iai5tZWRpYTtcbiAgdmFyIHNvdXJjZU1hcCA9IG9iai5zb3VyY2VNYXA7XG5cbiAgaWYgKG1lZGlhKSB7XG4gICAgc3R5bGUuc2V0QXR0cmlidXRlKCdtZWRpYScsIG1lZGlhKTtcbiAgfSBlbHNlIHtcbiAgICBzdHlsZS5yZW1vdmVBdHRyaWJ1dGUoJ21lZGlhJyk7XG4gIH1cblxuICBpZiAoc291cmNlTWFwICYmIHR5cGVvZiBidG9hICE9PSAndW5kZWZpbmVkJykge1xuICAgIGNzcyArPSBcIlxcbi8qIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsXCIuY29uY2F0KGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHNvdXJjZU1hcCkpKSksIFwiICovXCIpO1xuICB9IC8vIEZvciBvbGQgSUVcblxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgICovXG5cblxuICBpZiAoc3R5bGUuc3R5bGVTaGVldCkge1xuICAgIHN0eWxlLnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcbiAgfSBlbHNlIHtcbiAgICB3aGlsZSAoc3R5bGUuZmlyc3RDaGlsZCkge1xuICAgICAgc3R5bGUucmVtb3ZlQ2hpbGQoc3R5bGUuZmlyc3RDaGlsZCk7XG4gICAgfVxuXG4gICAgc3R5bGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKSk7XG4gIH1cbn1cblxudmFyIHNpbmdsZXRvbiA9IG51bGw7XG52YXIgc2luZ2xldG9uQ291bnRlciA9IDA7XG5cbmZ1bmN0aW9uIGFkZFN0eWxlKG9iaiwgb3B0aW9ucykge1xuICB2YXIgc3R5bGU7XG4gIHZhciB1cGRhdGU7XG4gIHZhciByZW1vdmU7XG5cbiAgaWYgKG9wdGlvbnMuc2luZ2xldG9uKSB7XG4gICAgdmFyIHN0eWxlSW5kZXggPSBzaW5nbGV0b25Db3VudGVyKys7XG4gICAgc3R5bGUgPSBzaW5nbGV0b24gfHwgKHNpbmdsZXRvbiA9IGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKSk7XG4gICAgdXBkYXRlID0gYXBwbHlUb1NpbmdsZXRvblRhZy5iaW5kKG51bGwsIHN0eWxlLCBzdHlsZUluZGV4LCBmYWxzZSk7XG4gICAgcmVtb3ZlID0gYXBwbHlUb1NpbmdsZXRvblRhZy5iaW5kKG51bGwsIHN0eWxlLCBzdHlsZUluZGV4LCB0cnVlKTtcbiAgfSBlbHNlIHtcbiAgICBzdHlsZSA9IGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKTtcbiAgICB1cGRhdGUgPSBhcHBseVRvVGFnLmJpbmQobnVsbCwgc3R5bGUsIG9wdGlvbnMpO1xuXG4gICAgcmVtb3ZlID0gZnVuY3Rpb24gcmVtb3ZlKCkge1xuICAgICAgcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlKTtcbiAgICB9O1xuICB9XG5cbiAgdXBkYXRlKG9iaik7XG4gIHJldHVybiBmdW5jdGlvbiB1cGRhdGVTdHlsZShuZXdPYmopIHtcbiAgICBpZiAobmV3T2JqKSB7XG4gICAgICBpZiAobmV3T2JqLmNzcyA9PT0gb2JqLmNzcyAmJiBuZXdPYmoubWVkaWEgPT09IG9iai5tZWRpYSAmJiBuZXdPYmouc291cmNlTWFwID09PSBvYmouc291cmNlTWFwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdXBkYXRlKG9iaiA9IG5ld09iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlbW92ZSgpO1xuICAgIH1cbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobGlzdCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTsgLy8gRm9yY2Ugc2luZ2xlLXRhZyBzb2x1dGlvbiBvbiBJRTYtOSwgd2hpY2ggaGFzIGEgaGFyZCBsaW1pdCBvbiB0aGUgIyBvZiA8c3R5bGU+XG4gIC8vIHRhZ3MgaXQgd2lsbCBhbGxvdyBvbiBhIHBhZ2VcblxuICBpZiAoIW9wdGlvbnMuc2luZ2xldG9uICYmIHR5cGVvZiBvcHRpb25zLnNpbmdsZXRvbiAhPT0gJ2Jvb2xlYW4nKSB7XG4gICAgb3B0aW9ucy5zaW5nbGV0b24gPSBpc09sZElFKCk7XG4gIH1cblxuICBsaXN0ID0gbGlzdCB8fCBbXTtcbiAgdmFyIGxhc3RJZGVudGlmaWVycyA9IG1vZHVsZXNUb0RvbShsaXN0LCBvcHRpb25zKTtcbiAgcmV0dXJuIGZ1bmN0aW9uIHVwZGF0ZShuZXdMaXN0KSB7XG4gICAgbmV3TGlzdCA9IG5ld0xpc3QgfHwgW107XG5cbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG5ld0xpc3QpICE9PSAnW29iamVjdCBBcnJheV0nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBpZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW2ldO1xuICAgICAgdmFyIGluZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gICAgICBzdHlsZXNJbkRvbVtpbmRleF0ucmVmZXJlbmNlcy0tO1xuICAgIH1cblxuICAgIHZhciBuZXdMYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obmV3TGlzdCwgb3B0aW9ucyk7XG5cbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgbGFzdElkZW50aWZpZXJzLmxlbmd0aDsgX2krKykge1xuICAgICAgdmFyIF9pZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW19pXTtcblxuICAgICAgdmFyIF9pbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKF9pZGVudGlmaWVyKTtcblxuICAgICAgaWYgKHN0eWxlc0luRG9tW19pbmRleF0ucmVmZXJlbmNlcyA9PT0gMCkge1xuICAgICAgICBzdHlsZXNJbkRvbVtfaW5kZXhdLnVwZGF0ZXIoKTtcblxuICAgICAgICBzdHlsZXNJbkRvbS5zcGxpY2UoX2luZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsYXN0SWRlbnRpZmllcnMgPSBuZXdMYXN0SWRlbnRpZmllcnM7XG4gIH07XG59OyIsImltcG9ydCAnLi4vY3NzL3N0eWxlLmNzcyc7XG5pbXBvcnQgJy4uL2Nzcy92ZW5kb3IvbWFuYS5jc3MnO1xuaW1wb3J0IFNlYXJjaCBmcm9tICcuL21vZGVscy9TZWFyY2gnO1xuaW1wb3J0ICogYXMgc2VhcmNoVmlldyBmcm9tICcuL3ZpZXdzL3NlYXJjaFZpZXcnO1xuaW1wb3J0ICogYXMgcmVzdWx0c1ZpZXcgZnJvbSAnLi92aWV3cy9yZXN1bHRzVmlldyc7XG5pbXBvcnQgKiBhcyBjYXJkVmlldyBmcm9tICcuL3ZpZXdzL2NhcmRWaWV3JztcbmltcG9ydCAqIGFzIGludmVudG9yeVZpZXcgZnJvbSAnLi92aWV3cy9pbnZlbnRvcnlWaWV3JztcbmltcG9ydCAqIGFzIGludlNlYXJjaCBmcm9tICcuL3ZpZXdzL2ludmVudG9yeVNlYXJjaFZpZXcnXG5pbXBvcnQgeyBlbGVtZW50cyB9IGZyb20gJy4vdmlld3MvYmFzZSc7XG5cblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKiogUXVpY2sgU2VhcmNoICoqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuZWxlbWVudHMubmF2LnF1aWNrU2VhcmNoQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgIGNvbnN0IHNlYXJjaCA9IG5ldyBTZWFyY2goKTtcblxuICAgIGlmIChlbGVtZW50cy5uYXYuc2VhcmNoSW5wdXQudmFsdWUgIT09ICcnKSB7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gc2VhcmNoLnF1aWNrU2VhcmNoKCk7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gYC9yZXN1bHRzL2xpc3QvJHtxdWVyeX0mb3JkZXI9bmFtZWBcbiAgICB9XG59KVxuXG5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqIFNlYXJjaCBQYWdlICoqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbmlmICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgPT09ICcvc2VhcmNoJykge1xuICAgIGNvbnN0IHNlYXJjaCA9IG5ldyBTZWFyY2goKTtcblxuICAgIC8vIEV2ZW50IGxpc3RlbmVyIGZvciB0aGUgc3VibWl0IHNlYXJjaCBidXR0b24uIFRoaXMgZ29lcyB0aHJvdWdoIHRoZSBmb3JtIGFuZCBnZW5lcmF0ZXNcbiAgICAvLyB0aGUgcXVqZXJ5IHN0cmluZy4gSXQgdGhlbiBwYXNzZXMgdGhlIHN0cmluZyB0byB0aGUgc2VydmVyIHRocm91Z2ggdGhlIFVSTFxuICAgIGVsZW1lbnRzLmFwaVNlYXJjaC5zdWJtaXRCdG4ub25jbGljayA9IGFzeW5jIGUgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcblxuICAgICAgICAvLyBDbGVhciBhbnkgZXhpc3RpbmcgcXVlcnkgc3RyaW5nXG4gICAgICAgIHNlYXJjaC5yZXNldFNlYXJjaFF1ZXJ5KCk7XG4gICAgXG4gICAgICAgIC8vIEJ1aWxkIHRoZSBxdWVyeSBzdHJpbmdcbiAgICAgICAgY29uc3QgcXVlcnkgPSBzZWFyY2guYnVpbGRTZWFyY2hRdWVyeSgpO1xuXG4gICAgICAgIC8vIEdldCB0aGUgZGlzcGxheSBtZXRob2RcbiAgICAgICAgY29uc3QgZGlzcGxheU1ldGhvZCA9IHNlYXJjaC5kaXNwbGF5TWV0aG9kKCk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGEgZ2V0IHJlcXVlc3Qgd2l0aCB0aGUgcXVlcnkgc3RyaW5nXG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gYC9yZXN1bHRzLyR7ZGlzcGxheU1ldGhvZH0vJHtxdWVyeX1gO1xuICAgIFxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBlbGVtZW50cy5hcGlTZWFyY2gudHlwZUxpbmUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIC8vIERpc3BsYXkgdGhlIGRyb3Bkb3duXG4gICAgICAgIHNlYXJjaFZpZXcuc2hvd1R5cGVzRHJvcERvd24oKTtcbiAgICAgICAgc2VhcmNoVmlldy5zdGFydFR5cGVzRHJvcERvd25OYXZpZ2F0aW9uKCk7XG5cbiAgICAgICAgLy8gU3RhcnQgYW4gZXZlbnQgbGlzdGVuZXIgb24gdGhlIGRvY3VtZW50LiBUaGlzIHdpbGwgY2xvc2UgdGhlIGRyb3Bkb3duIGlmIHRoZSB1c2VyIGNsaWNrc1xuICAgICAgICAvLyBvdXRzaWRlIG9mIHRoZSBpbnB1dCBvciBkcm9wZG93bi4gVGhpcyB3aWxsIGFsc28gY2FuY2VsIHRoZSBldmVudCBsaXN0ZW5lclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNlYXJjaFZpZXcudHlwZUxpbmVMaXN0ZW5lcilcbiAgICB9KVxuXG4gICAgZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVMaW5lLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xuICAgICAgICBpZiAoZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVEcm9wRG93bi5oYXNBdHRyaWJ1dGUoJ2hpZGRlbicpKSB7XG4gICAgICAgICAgICBzZWFyY2hWaWV3LnNob3dUeXBlc0Ryb3BEb3duKCk7XG4gICAgICAgIH1cblxuICAgICAgICBzZWFyY2hWaWV3LmZpbHRlclR5cGVzKGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlTGluZS52YWx1ZSk7XG4gICAgICAgIHNlYXJjaFZpZXcuZmlsdGVyVHlwZUhlYWRlcnMoKTtcbiAgICAgICAgc2VhcmNoVmlldy5zdGFydFR5cGVzRHJvcERvd25OYXZpZ2F0aW9uKCk7XG4gICAgfSlcblxuICAgIGVsZW1lbnRzLmFwaVNlYXJjaC5zZXRJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgLy8gRGlzcGxheSB0aGUgZHJvcGRvd25cbiAgICAgICAgc2VhcmNoVmlldy5zaG93U2V0c0Ryb3BEb3duKCk7XG4gICAgICAgIHNlYXJjaFZpZXcuc3RhcnRTZXRzRHJvcERvd25OYXZpZ2F0aW9uKCk7XG5cbiAgICAgICAgLy8gU3RhcnQgYW4gZXZlbnQgbGlzdGVuZXIgb24gdGhlIGRvY3VtZW50LiBUaGlzIHdpbGwgY2xvc2UgdGhlIGRyb3Bkb3duIGlmIHRoZSB1c2VyIGNsaWNrc1xuICAgICAgICAvLyBvdXRzaWRlIG9mIHRoZSBpbnB1dCBvciBkcm9wZG93bi4gVGhpcyB3aWxsIGFsc28gY2FuY2VsIHRoZSBldmVudCBsaXN0ZW5lclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNlYXJjaFZpZXcuc2V0SW5wdXRMaXN0ZW5lcilcbiAgICB9KVxuXG4gICAgZWxlbWVudHMuYXBpU2VhcmNoLnNldElucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xuICAgICAgICBpZiAoZWxlbWVudHMuYXBpU2VhcmNoLnNldERyb3BEb3duLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIHtcbiAgICAgICAgICAgIHNlYXJjaFZpZXcuc2hvd1NldHNEcm9wRG93bigpO1xuICAgICAgICB9XG5cbiAgICAgICAgc2VhcmNoVmlldy5maWx0ZXJTZXRzKGVsZW1lbnRzLmFwaVNlYXJjaC5zZXRJbnB1dC52YWx1ZSk7XG4gICAgICAgIHNlYXJjaFZpZXcuZmlsdGVyU2V0SGVhZGVycygpOyAgICAgICAgXG4gICAgICAgIHNlYXJjaFZpZXcuc3RhcnRTZXRzRHJvcERvd25OYXZpZ2F0aW9uKCk7XG4gICAgfSlcblxuICAgIGVsZW1lbnRzLmFwaVNlYXJjaC5zdGF0VmFsdWUuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgJ2lucHV0Jywgc2VhcmNoVmlldy5zdGF0TGluZUNvbnRyb2xsZXJcbiAgICApO1xuXG4gICAgZWxlbWVudHMuYXBpU2VhcmNoLmZvcm1hdC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAnY2hhbmdlJywgc2VhcmNoVmlldy5mb3JtYXRMaW5lQ29udHJvbGxlclxuICAgICk7XG5cblxufSBcblxuIFxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKiogUmVzdWx0cyBQYWdlICoqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuaWYgKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zdWJzdHJpbmcoMSwgOCkgPT09ICdyZXN1bHRzJykge1xuICAgIGNvbnN0IHN0YXRlID0ge1xuICAgICAgICBzZWFyY2g6IG5ldyBTZWFyY2goKSxcblxuICAgICAgICAvLyBHZXQgdGhlIGRpc3BsYXkgbWV0aG9kLCBzb3J0IG1ldGhvZCwgYW5kIHF1ZXJ5IGZyb20gdGhlIFVSTFxuICAgICAgICBkaXNwbGF5OiB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3Vic3RyaW5nKDksIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5sYXN0SW5kZXhPZignLycpKSxcbiAgICAgICAgcXVlcnk6IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zdWJzdHJpbmcod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLmxhc3RJbmRleE9mKCcvJykgKyAxKSxcbiAgICAgICAgc29ydE1ldGhvZDogd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnN1YnN0cmluZyh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUubGFzdEluZGV4T2YoJz0nKSArIDEpLFxuXG4gICAgICAgIGFsbENhcmRzOiBbXSxcbiAgICAgICAgY3VycmVudEluZGV4OiAwLFxuICAgICAgICBhbGxSZXN1bHRzTG9hZGVkOiBmYWxzZSxcbiAgICB9O1xuXG4gICAgLy8gV2hlbiB0aGUgcmVzdWx0cyBwYWdlIGlzIHJlZnJlc2hlZCwgZGlzcGxheSB0aGUgY2FyZHMgYXMgYSBjaGVja2xpc3QgYnkgZGVmYXVsdFxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgc29ydCBieSBhbmQgZGlzcGxheSBhc2QgbWVudXMgc28gdGhlIHNlbGVjdGVkIG9wdGlvbiBpcyB3aGF0IHRoZSB1c2VyIHNlbGVjdGVkXG4gICAgICAgIHJlc3VsdHNWaWV3LmNob3NlU2VsZWN0TWVudVNvcnQoZWxlbWVudHMucmVzdWx0c1BhZ2Uuc29ydEJ5Lm9wdGlvbnMsIHN0YXRlKTtcbiAgICAgICAgcmVzdWx0c1ZpZXcuY2hvc2VTZWxlY3RNZW51RGlzcGxheShlbGVtZW50cy5yZXN1bHRzUGFnZS5kaXNwbGF5U2VsZWN0b3IsIHN0YXRlKVxuXG4gICAgICAgIC8vIFJ1biB0aGUgZ2V0IGNhcmRzIGZ1bmN0aW9uLCB0aGVuIHVwZGF0ZSB0aGUgZGlzcGxheSBiYXIgd2l0aCB0aGUgdG90YWwgY2FyZCBjb3VudFxuICAgICAgICBhd2FpdCBzdGF0ZS5zZWFyY2guZ2V0Q2FyZHMoc3RhdGUpO1xuXG4gICAgICAgIGlmIChzdGF0ZS5hbGxDYXJkc1swXSA9PT0gNDA0KSB7XG4gICAgICAgICAgICByZXN1bHRzVmlldy5kaXNwbGF5NDA0KCk7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIHJlc3VsdHNWaWV3LnVwZGF0ZURpc3BsYXlCYXIoc3RhdGUpO1xuXG4gICAgICAgIC8vIEluIHRoZSBiYWNrZ3JvdW5kLCBnZXQgYWxsIGNhcmRzIFxuICAgICAgICBzdGF0ZS5zZWFyY2guZ2V0QWxsQ2FyZHMoc3RhdGUsIHJlc3VsdHNWaWV3LmVuYWJsZUJ0bik7XG5cbiAgICAgICAgLy8gT24gbG9hZGluZyB0aGUgcGFnZSBkaXNwbGF5IHRoZSBjYXJkcyBpbiBhIGNoZWNrbGlzdFxuICAgICAgICByZXN1bHRzVmlldy51cGRhdGVEaXNwbGF5KHN0YXRlKTtcbiAgICB9KTtcblxuICAgIC8vIEV2ZW50IGxpc3RlbmVyIGZvciB0aGUgY2hhbmdlIGRpc3BsYXkgbWV0aG9kIGJ1dHRvblxuICAgIGVsZW1lbnRzLnJlc3VsdHNQYWdlLmJ0bi5vbmNsaWNrID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICAvLyBVcGRhdGUgdGhlIGRpc3BsYXkgbWV0aG9kIGJldHdlZW4gY2hlY2tsaXN0IGFuZCBjYXJkcyBpZiB0aGUgdXNlciBjaGFuZ2VkIGl0XG4gICAgICAgIHJlc3VsdHNWaWV3LmNoYW5nZURpc3BsYXlBbmRVcmwoc3RhdGUpO1xuXG4gICAgICAgIC8vIElmIGEgbmV3IHNvcnRpbmcgbWV0aG9kIGlzIHNlbGVjdGVkLCBhIHJlcXVlc3QgaXMgc2VudCB0byB0aGUgc2VydmVyIGFuZCB0aGUgcGFnZSBpcyByZWZyZXNoZWQuXG4gICAgICAgIC8vIFRoaXMgcmVzZXRzIHRoZSBzdGF0ZSBhbmQgYXN5bmMgdGFza3NcbiAgICAgICAgcmVzdWx0c1ZpZXcuY2hhbmdlU29ydE1ldGhvZChzdGF0ZSk7XG4gICAgICAgIFxuICAgICAgICAvLyBVcGRhdGUgdGhlIGRpc3BsYXkgd2l0aCBhIG5ldyBzb3J0IG1ldGhvZCBhbmQgZGlzcGxheSBtZXRob2QgaWYgZWl0aGVyIHdlcmUgZ2l2ZW5cbiAgICAgICAgcmVzdWx0c1ZpZXcudXBkYXRlRGlzcGxheShzdGF0ZSk7XG4gICAgfTtcblxuICAgIC8vIEV2ZW50IExpc3RlbmVyIGZvciBuZXh0IHBhZ2UgYnV0dG9uXG4gICAgZWxlbWVudHMucmVzdWx0c1BhZ2UubmV4dFBhZ2VCdG4ub25jbGljayA9ICgpID0+IHtcbiAgICAgICAgLy8gVXBkYXRlIHRoZSBpbmRleFxuICAgICAgICBzdGF0ZS5jdXJyZW50SW5kZXggKys7XG4gICAgICAgIFxuICAgICAgICAvLyBVcGRhdGUgdGhlIGRpc3BsYXkgYmFzZWQgb24gdGhlIG1ldGhvZCBzdG9yZWQgaW4gdGhlIHN0YXRlXG4gICAgICAgIHJlc3VsdHNWaWV3LnVwZGF0ZURpc3BsYXkoc3RhdGUpO1xuXG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgZGlzcGxheSBiYXJcbiAgICAgICAgcmVzdWx0c1ZpZXcudXBkYXRlRGlzcGxheUJhcihzdGF0ZSk7XG5cbiAgICAgICAgLy8gRW5hYmxlIHRoZSBwcmV2aW91cyBwYWdlIGFuZCBmaXJzdCBwYWdlIGJ0bnNcbiAgICAgICAgcmVzdWx0c1ZpZXcuZW5hYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLnByZXZpb3VzUGFnZUJ0bik7XG4gICAgICAgIHJlc3VsdHNWaWV3LmVuYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5maXJzdFBhZ2VCdG4pO1xuXG4gICAgICAgIC8vIElmIG9uIHRoZSBsYXN0IHBhZ2UsIGRpc2FibGUgdGhlIG5leHQgcGFnZSBidG4gYW5kIGxhc3QgcGFnZSBidG5cbiAgICAgICAgaWYgKHN0YXRlLmN1cnJlbnRJbmRleCA9PT0gKHN0YXRlLmFsbENhcmRzLmxlbmd0aCAtIDEpKSB7XG4gICAgICAgICAgICByZXN1bHRzVmlldy5kaXNhYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLm5leHRQYWdlQnRuKTtcbiAgICAgICAgICAgIHJlc3VsdHNWaWV3LmRpc2FibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UubGFzdFBhZ2VCdG4pXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gRXZlbnQgbGlzdGVuZXIgZm9yIHRoZSBsYXN0IHBhZ2UgYnRuXG4gICAgZWxlbWVudHMucmVzdWx0c1BhZ2UubGFzdFBhZ2VCdG4ub25jbGljayA9ICgpID0+IHtcbiAgICAgICAgLy8gVXBkYXRlIHRoZSBpbmRleFxuICAgICAgICBzdGF0ZS5jdXJyZW50SW5kZXggPSBzdGF0ZS5hbGxDYXJkcy5sZW5ndGggLSAxO1xuXG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgZGlzcGxheSBiYXNlZCBvbiB0aGUgbWV0aG9kIHN0b3JlZCBpbiB0aGUgc3RhdGVcbiAgICAgICAgcmVzdWx0c1ZpZXcudXBkYXRlRGlzcGxheShzdGF0ZSk7XG5cbiAgICAgICAgLy8gVXBkYXRlIHRoZSBkaXNwbGF5IGJhclxuICAgICAgICByZXN1bHRzVmlldy51cGRhdGVEaXNwbGF5QmFyKHN0YXRlKTtcblxuICAgICAgICAvLyBEaXNhYmxlIHRoZSBuZXh0IGFuZCBsYXN0IHBhZ2UgYnV0dG9uc1xuICAgICAgICByZXN1bHRzVmlldy5kaXNhYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLm5leHRQYWdlQnRuKTtcbiAgICAgICAgcmVzdWx0c1ZpZXcuZGlzYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5sYXN0UGFnZUJ0bik7XG5cbiAgICAgICAgLy8gRW5hYmxlIHRoZSBwcmV2aW91cyBhbmQgZmlyc3QgcGFnZSBidXR0b25zXG4gICAgICAgIHJlc3VsdHNWaWV3LmVuYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5wcmV2aW91c1BhZ2VCdG4pO1xuICAgICAgICByZXN1bHRzVmlldy5lbmFibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UuZmlyc3RQYWdlQnRuKTtcbiAgICB9O1xuXG4gICAgLy8gRXZlbnQgbGlzdGVuZXIgZm9yIHRoZSBwcmV2aW91cyBwYWdlIGJ1dHRvblxuICAgIGVsZW1lbnRzLnJlc3VsdHNQYWdlLnByZXZpb3VzUGFnZUJ0bi5vbmNsaWNrID0gKCkgPT4ge1xuICAgICAgICAvLyBVcGRhdGUgdGhlIGluZGV4XG4gICAgICAgIHN0YXRlLmN1cnJlbnRJbmRleCAtLTtcblxuICAgICAgICAvLyBVcGRhdGUgdGhlIGRpc3BsYXkgYmFzZWQgb24gdGhlIG1ldGhvZCBzdG9yZWQgaW4gdGhlIHN0YXRlXG4gICAgICAgIHJlc3VsdHNWaWV3LnVwZGF0ZURpc3BsYXkoc3RhdGUpO1xuXG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgZGlzcGxheSBiYXJcbiAgICAgICAgcmVzdWx0c1ZpZXcudXBkYXRlRGlzcGxheUJhcihzdGF0ZSk7XG5cbiAgICAgICAgLy8gSWYgb24gdGhlIGZpcnN0IHBhZ2UsIGRpc2FibGUgdGhlIHByZXZpb3VzIGFuZCBmaXJzdCBwYWdlIGJ1dHRvbnNcbiAgICAgICAgaWYgKHN0YXRlLmN1cnJlbnRJbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgcmVzdWx0c1ZpZXcuZGlzYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5wcmV2aW91c1BhZ2VCdG4pO1xuICAgICAgICAgICAgcmVzdWx0c1ZpZXcuZGlzYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5maXJzdFBhZ2VCdG4pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRW5hYmxlIHRoZSBuZXh0IGFuZCBsYXN0IHBhZ2UgYnV0dG9ucy4gVGhlIGxhc3QgcGFnZSBidXR0b24gc2hvdWxkIG9ubHkgYmUgXG4gICAgICAgIC8vIGVuYWJsZWQgaWYgYWxsIHJlc3VsdHMgaGF2ZSBiZWVuIGxvYWRlZFxuICAgICAgICByZXN1bHRzVmlldy5lbmFibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UubmV4dFBhZ2VCdG4pO1xuICAgICAgICBpZiAoc3RhdGUuYWxsUmVzdWx0c0xvYWRlZCkgcmVzdWx0c1ZpZXcuZW5hYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLmxhc3RQYWdlQnRuKTtcbiAgICB9O1xuXG4gICAgLy8gRXZlbnQgbGlzdGVuZXIgZm9yIHRoZSBmaXJzdCBwYWdlIGJ0blxuICAgIGVsZW1lbnRzLnJlc3VsdHNQYWdlLmZpcnN0UGFnZUJ0bi5vbmNsaWNrID0gKCkgPT4ge1xuICAgICAgICAvLyBVcGRhdGUgdGhlIGluZGV4XG4gICAgICAgIHN0YXRlLmN1cnJlbnRJbmRleCA9IDA7XG5cbiAgICAgICAgLy8gVXBkYXRlIHRoZSBkaXNwbGF5IGJhc2VkIG9uIHRoZSBtZXRob2Qgc3RvcmVkIGluIHRoZSBzdGF0ZVxuICAgICAgICByZXN1bHRzVmlldy51cGRhdGVEaXNwbGF5KHN0YXRlKTtcblxuICAgICAgICAvLyBVcGRhdGUgdGhlIGRpc3BsYXkgYmFyXG4gICAgICAgIHJlc3VsdHNWaWV3LnVwZGF0ZURpc3BsYXlCYXIoc3RhdGUpO1xuXG4gICAgICAgIC8vIERpc2FibGUgdGhlIHByZXZpb3VzIGFuZCBmaXJzdCBwYWdlIGJ1dHRvbnNcbiAgICAgICAgcmVzdWx0c1ZpZXcuZGlzYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5wcmV2aW91c1BhZ2VCdG4pO1xuICAgICAgICByZXN1bHRzVmlldy5kaXNhYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLmZpcnN0UGFnZUJ0bik7XG5cbiAgICAgICAgLy8gRW5hYmxlIHRoZSBuZXh0IGFuZCBsYXN0IHBhZ2UgYnV0dG9ucy4gVGhlIGxhc3QgcGFnZSBidXR0b24gc2hvdWxkIG9ubHkgYmUgXG4gICAgICAgIC8vIGVuYWJsZWQgaWYgYWxsIHJlc3VsdHMgaGF2ZSBiZWVuIGxvYWRlZFxuICAgICAgICByZXN1bHRzVmlldy5lbmFibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UubmV4dFBhZ2VCdG4pO1xuICAgICAgICBpZiAoc3RhdGUuYWxsUmVzdWx0c0xvYWRlZCkgcmVzdWx0c1ZpZXcuZW5hYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLmxhc3RQYWdlQnRuKTtcbiAgICB9XG5cbiAgICB3aW5kb3cub25wb3BzdGF0ZSA9IGUgPT4ge1xuICAgICAgICAvLyBjb25zdCBkYXRhID0gZS5zdGF0ZTtcbiAgICAgICAgLy8gaWYgKGRhdGEgIT09IG51bGwpIHJlc3VsdHNWaWV3LnVwZGF0ZURpc3BsYXlPblBvcFN0YXRlKHN0YXRlLCBkYXRhKTtcblxuICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGAvc2VhcmNoYDtcbiAgICB9XG59XG5cblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKiBDYXJkIFBhZ2UgKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuaWYgKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zdWJzdHJpbmcoMSwgNSkgPT09ICdjYXJkJykge1xuICAgIGNhcmRWaWV3Lmluc2VydE1hbmFDb3N0VG9DYXJkVGV4dFRpdGxlKCk7XG5cbiAgICBjYXJkVmlldy5pbnNlcnRNYW5hQ29zdFRvT3JhY2xlVGV4dCgpO1xuXG4gICAgY2FyZFZpZXcucmVtb3ZlVW5kZXJTY29yZUZyb21MZWdhbFN0YXR1cygpO1xuXG4gICAgY2FyZFZpZXcuZml4Q2FyZFByaWNlcygpO1xuXG4gICAgY2FyZFZpZXcuc2V0UHJpbnRMaW5rSHJlZigpO1xuXG4gICAgY2FyZFZpZXcucHJpbnRMaXN0SG92ZXJFdmVudHMoKTtcblxuICAgIC8vIElmIHRoZSB0cmFuc2Zvcm0gYnRuIGlzIG9uIHRoZSBkb20gKGlmIHRoZSBjYXJkIGlzIGRvdWJsZSBzaWRlZCkgc2V0XG4gICAgLy8gdGhlIGV2ZW50IGxpc3RlbmVyIGZvciB0aGUgY2FyZCB0byBiZSBmbGlwcGVkIGJhY2sgYW5kIGZvcnRoXG4gICAgaWYgKGVsZW1lbnRzLmNhcmQudHJhbnNmb3JtQnRuKSB7XG4gICAgICAgIGVsZW1lbnRzLmNhcmQudHJhbnNmb3JtQnRuLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgICAgICAnY2xpY2snLCBjYXJkVmlldy5mbGlwVG9CYWNrU2lkZVxuICAgICAgICApO1xuICAgIH1cblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYWRkLXRvLWludi1zdWJtaXQnKS5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAnY2xpY2snLCBjYXJkVmlldy5jaGVja1ByaWNlSW5wdXRGb3JEaWdpdHNcbiAgICApXG59XG5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKiBJbnZlbnRvcnkgUGFnZSAqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbmlmICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3Vic3RyaW5nKDEsIDEwKSA9PT0gJ2ludmVudG9yeScpIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgaW52ZW50b3J5Vmlldy5hbHRlckludmVudG9yeVRhYmxlKVxufVxuXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbi8vICoqKiogSW52ZW50b3J5IFNlYXJjaCBQYWdlICoqKiogXFxcXFxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG5pZiAod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnN1YnN0cmluZygxLCAxNykgPT09ICdpbnZlbnRvcnkvc2VhcmNoJykge1xuICAgIFxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taW52LXNlYXJjaC1idG4nKS5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAnY2xpY2snLCBpbnZTZWFyY2guY2hlY2tQcmljZUlucHV0Rm9yRGlnaXRzXG4gICAgKVxuXG4gICAgZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVMaW5lLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAvLyBEaXNwbGF5IHRoZSBkcm9wZG93blxuICAgICAgICBjb25zb2xlLmxvZygnY2xpY2snKVxuICAgICAgICBzZWFyY2hWaWV3LnNob3dUeXBlc0Ryb3BEb3duKCk7XG4gICAgICAgIGludlNlYXJjaC5zdGFydFR5cGVzRHJvcERvd25OYXZpZ2F0aW9uKCk7XG5cbiAgICAgICAgLy8gU3RhcnQgYW4gZXZlbnQgbGlzdGVuZXIgb24gdGhlIGRvY3VtZW50LiBUaGlzIHdpbGwgY2xvc2UgdGhlIGRyb3Bkb3duIGlmIHRoZSB1c2VyIGNsaWNrc1xuICAgICAgICAvLyBvdXRzaWRlIG9mIHRoZSBpbnB1dCBvciBkcm9wZG93bi4gVGhpcyB3aWxsIGFsc28gY2FuY2VsIHRoZSBldmVudCBsaXN0ZW5lclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGludlNlYXJjaC50eXBlTGluZUxpc3RlbmVyKVxuICAgIH0pXG5cbiAgICBlbGVtZW50cy5hcGlTZWFyY2gudHlwZUxpbmUuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XG4gICAgICAgIGlmIChlbGVtZW50cy5hcGlTZWFyY2gudHlwZURyb3BEb3duLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIHtcbiAgICAgICAgICAgIHNlYXJjaFZpZXcuc2hvd1R5cGVzRHJvcERvd24oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNlYXJjaFZpZXcuZmlsdGVyVHlwZXMoZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVMaW5lLnZhbHVlKTtcbiAgICAgICAgc2VhcmNoVmlldy5maWx0ZXJUeXBlSGVhZGVycygpO1xuICAgICAgICBpbnZTZWFyY2guc3RhcnRUeXBlc0Ryb3BEb3duTmF2aWdhdGlvbigpO1xuICAgIH0pXG5cbiAgICBlbGVtZW50cy5hcGlTZWFyY2guc2V0SW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIC8vIERpc3BsYXkgdGhlIGRyb3Bkb3duXG4gICAgICAgIHNlYXJjaFZpZXcuc2hvd1NldHNEcm9wRG93bigpO1xuICAgICAgICBpbnZTZWFyY2guc3RhcnRTZXRzRHJvcERvd25OYXZpZ2F0aW9uKCk7XG5cbiAgICAgICAgLy8gU3RhcnQgYW4gZXZlbnQgbGlzdGVuZXIgb24gdGhlIGRvY3VtZW50LiBUaGlzIHdpbGwgY2xvc2UgdGhlIGRyb3Bkb3duIGlmIHRoZSB1c2VyIGNsaWNrc1xuICAgICAgICAvLyBvdXRzaWRlIG9mIHRoZSBpbnB1dCBvciBkcm9wZG93bi4gVGhpcyB3aWxsIGFsc28gY2FuY2VsIHRoZSBldmVudCBsaXN0ZW5lclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGludlNlYXJjaC5zZXRJbnB1dExpc3RlbmVyKVxuICAgIH0pXG5cbiAgICBlbGVtZW50cy5hcGlTZWFyY2guc2V0SW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XG4gICAgICAgIGlmIChlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd24uaGFzQXR0cmlidXRlKCdoaWRkZW4nKSkge1xuICAgICAgICAgICAgc2VhcmNoVmlldy5zaG93U2V0c0Ryb3BEb3duKCk7XG4gICAgICAgIH1cblxuICAgICAgICBzZWFyY2hWaWV3LmZpbHRlclNldHMoZWxlbWVudHMuYXBpU2VhcmNoLnNldElucHV0LnZhbHVlKTtcbiAgICAgICAgc2VhcmNoVmlldy5maWx0ZXJTZXRIZWFkZXJzKCk7ICAgICAgICBcbiAgICAgICAgaW52U2VhcmNoLnN0YXJ0U2V0c0Ryb3BEb3duTmF2aWdhdGlvbigpO1xuICAgIH0pXG59IiwiaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJztcblxuaW1wb3J0IHsgZWxlbWVudHMgfSBmcm9tICcuLi92aWV3cy9iYXNlJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2VhcmNoIHtcbiAgICBzZWFyY2hCeU5hbWUoKSB7XG4gICAgICAgIGxldCBjYXJkTmFtZSA9IGVsZW1lbnRzLmFwaVNlYXJjaC5jYXJkTmFtZS52YWx1ZTtcbiAgICAgICAgY2FyZE5hbWUgPSBjYXJkTmFtZS5yZXBsYWNlKCcgJywgJysnKTtcblxuICAgICAgICBpZiAoY2FyZE5hbWUpIHRoaXMuc2VhcmNoICs9IGNhcmROYW1lOyAgICAgICAgXG4gICAgfSAgXG4gICAgICBcbiAgICBzZWFyY2hCeU90ZXh0KCkge1xuICAgICAgICBjb25zdCBvcmFjbGVUZXh0ID0gZWxlbWVudHMuYXBpU2VhcmNoLm9yYWNsZVRleHQudmFsdWU7XG5cbiAgICAgICAgLy8gSWYgdGhlIG9yYWNsZSB0ZXh0IGluY2x1ZGVzIG1vcmUgdGhhbiBvbmUgd29yZCwgd2UgbmVlZCB0byBzZWFyY2ggdGhlIHRlcm1zIGluZGl2aWR1YWxseVxuICAgICAgICBpZiAob3JhY2xlVGV4dC5pbmNsdWRlcygnICcpICYmIG9yYWNsZVRleHQuaW5kZXhPZignICcpICE9PSBvcmFjbGVUZXh0Lmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgIGxldCB0ZW1wb3JhcnlTdHIgPSAnJztcbiAgICAgICAgICAgIGNvbnN0IHRleHRzID0gb3JhY2xlVGV4dC5zcGxpdCgnICcpO1xuXG4gICAgICAgICAgICB0ZXh0cy5mb3JFYWNoKHRleHQgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0ZXh0Lmxlbmd0aCA+IDApIHRlbXBvcmFyeVN0ciArPSBgb3JhY2xlJTNBJHt0ZXh0fStgXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5zZWFyY2ggKz0gYCslMjgke3RlbXBvcmFyeVN0ci5zbGljZSgwLCAtMSl9JTI5YFxuICAgICAgICB9XG5cbiAgICAgICAgZWxzZSBpZiAob3JhY2xlVGV4dCkgdGhpcy5zZWFyY2ggKz0gYCtvcmFjbGUlM0Eke29yYWNsZVRleHR9YDtcbiAgICB9XG4gICAgXG4gICAgc2VhcmNoQnlDYXJkVHlwZSgpIHtcbiAgICAgICAgY29uc3QgdHlwZXNUb0luY2x1ZGUgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWluY2x1ZGUtdHlwZV0nKSk7XG4gICAgICAgIGNvbnN0IHR5cGVzVG9FeGNsdWRlID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1leGNsdWRlLXR5cGVdJykpO1xuICAgICAgICBjb25zdCBpbmNsdWRlUGFydGlhbFR5cGVzID0gZWxlbWVudHMuYXBpU2VhcmNoLmluY2x1ZGVQYXJ0aWFsVHlwZXMuY2hlY2tlZDtcbiAgICAgICAgbGV0IHRlbXBvcmFyeVN0ciA9ICcnO1xuXG4gICAgICAgIGlmICh0eXBlc1RvSW5jbHVkZSAmJiAhaW5jbHVkZVBhcnRpYWxUeXBlcykge1xuICAgICAgICAgICAgdHlwZXNUb0luY2x1ZGUuZm9yRWFjaCh0eXBlID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlYXJjaCArPSBgK3R5cGUlM0Eke3R5cGUuZ2V0QXR0cmlidXRlKCdkYXRhLWluY2x1ZGUtdHlwZScpfWA7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCh0eXBlc1RvSW5jbHVkZS5sZW5ndGggPiAwKSAmJiBpbmNsdWRlUGFydGlhbFR5cGVzKSB7XG4gICAgICAgICAgICB0eXBlc1RvSW5jbHVkZS5mb3JFYWNoKHR5cGUgPT4ge1xuICAgICAgICAgICAgICAgIHRlbXBvcmFyeVN0ciArPSBgdHlwZSUzQSR7dHlwZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaW5jbHVkZS10eXBlJyl9K09SK2BcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIHRlbXBvcmFyeVN0ciA9IHRlbXBvcmFyeVN0ci5zbGljZSgwLCAtNCk7XG4gICAgICAgICAgICB0aGlzLnNlYXJjaCArPSBgKyUyOCR7dGVtcG9yYXJ5U3RyfSUyOWA7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZXNUb0V4Y2x1ZGUpIHtcbiAgICAgICAgICAgIHR5cGVzVG9FeGNsdWRlLmZvckVhY2godHlwZSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWFyY2ggKz0gYCstdHlwZSUzQSR7dHlwZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtZXhjbHVkZS10eXBlJyl9YDtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cblxuICAgIH1cbiAgICBcbiAgICBzZWFyY2hCeUNvbG9yKCkge1xuICAgICAgICBsZXQgYm94ZXMgPSBlbGVtZW50cy5hcGlTZWFyY2guY29sb3JCb3hlcztcbiAgICBcbiAgICAgICAgLy8gTG9vcCB0aHJvdWdoIGNoZWNrYm94ZXMgdG8gZ2V0IGFsbCBjb2xvcnMgZ2l2ZW5cbiAgICAgICAgdmFyIGNvbG9ycyA9ICcnO1xuICAgICAgICBib3hlcy5mb3JFYWNoKGJveCA9PiB7XG4gICAgICAgICAgICBpZihib3guY2hlY2tlZCkgY29sb3JzICs9IGJveC52YWx1ZTtcbiAgICAgICAgfSlcbiAgICBcbiAgICAgICAgY29uc3Qgc29ydEJ5ID0gZWxlbWVudHMuYXBpU2VhcmNoLmNvbG9yU29ydEJ5LnZhbHVlO1xuXG4gICAgICAgIGlmIChjb2xvcnMpIHRoaXMuc2VhcmNoICs9IGArY29sb3Ike3NvcnRCeX0ke2NvbG9yc31gO1xuICAgIH1cbiAgICBcbiAgICBzZWFyY2hCeVN0YXRzKCkge1xuICAgICAgICBjb25zdCBzdGF0TGluZXMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgICAnLmpzLS1hcGktc3RhdHMtd3JhcHBlcidcbiAgICAgICAgKSk7XG5cbiAgICAgICAgc3RhdExpbmVzLmZvckVhY2gobGluZSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzdGF0ID0gbGluZS5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1zdGF0JykudmFsdWU7XG4gICAgICAgICAgICBjb25zdCBzb3J0QnkgPSBsaW5lLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXN0YXQtZmlsdGVyJykudmFsdWU7XG4gICAgICAgICAgICBjb25zdCBzb3J0VmFsdWUgPSBsaW5lLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXN0YXQtdmFsdWUnKS52YWx1ZTtcblxuICAgICAgICAgICAgaWYgKHN0YXQgJiYgc29ydEJ5ICYmIHNvcnRWYWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VhcmNoICs9IGArJHtzdGF0fSR7c29ydEJ5fSR7c29ydFZhbHVlfWBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG4gICAgXG4gICAgc2VhcmNoQnlGb3JtYXQoKSB7XG4gICAgICAgIGNvbnN0IGZvcm1hdExpbmVzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAgICAgJy5qcy0tYXBpLWZvcm1hdC13cmFwcGVyJ1xuICAgICAgICApKTtcblxuICAgICAgICBmb3JtYXRMaW5lcy5mb3JFYWNoKGxpbmUgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc3RhdHVzID0gbGluZS5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1sZWdhbC1zdGF0dXMnKS52YWx1ZTtcbiAgICAgICAgICAgIGNvbnN0IGZvcm1hdCA9IGxpbmUucXVlcnlTZWxlY3RvcignLmpzLS1hcGktZm9ybWF0JykudmFsdWU7XG5cbiAgICAgICAgICAgIGlmIChmb3JtYXQgJiYgc3RhdHVzKSB0aGlzLnNlYXJjaCArPSBgKyR7c3RhdHVzfSUzQSR7Zm9ybWF0fWA7XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgc2VhcmNoQnlTZXQoKSB7XG4gICAgICAgIGNvbnN0IHNldHMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWluY2x1ZGUtc2V0XScpKTtcbiAgICAgICAgbGV0IHRlbXBvcmFyeVN0ciA9ICcnO1xuXG4gICAgICAgIGlmIChzZXRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHNldHMuZm9yRWFjaChzID0+IHRlbXBvcmFyeVN0ciArPSBgc2V0JTNBJHtzLmdldEF0dHJpYnV0ZSgnZGF0YS1pbmNsdWRlLXNldCcpfStPUitgKTtcblxuICAgICAgICAgICAgdGVtcG9yYXJ5U3RyID0gdGVtcG9yYXJ5U3RyLnNsaWNlKDAsIC00KTtcbiAgICAgICAgICAgIHRoaXMuc2VhcmNoICs9IGArJTI4JHt0ZW1wb3JhcnlTdHJ9JTI5YDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBzZWFyY2hCeVJhcml0eSgpIHtcbiAgICAgICAgY29uc3QgYm94ZXMgPSBlbGVtZW50cy5hcGlTZWFyY2gucmFyaXR5Qm94ZXM7XG4gICAgICAgIHZhciB2YWx1ZXMgPSBbXTtcbiAgICAgICAgbGV0IHRlbXBvcmFyeVN0ciA9ICcnO1xuICAgIFxuICAgICAgICAvLyBQdXNoIGFsbCByYXJpdGllcyBnaXZlbiBieSB0aGUgdXNlciBpbnRvIHRoZSB2YWx1ZXMgYXJyYXlcbiAgICAgICAgYm94ZXMuZm9yRWFjaChib3ggPT4ge1xuICAgICAgICAgICAgaWYgKGJveC5jaGVja2VkKSB2YWx1ZXMucHVzaChib3gudmFsdWUpO1xuICAgICAgICB9KVxuICAgIFxuICAgICAgICBpZiAodmFsdWVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIC8vIFdlIG5lZWQgYSBzdGFydGVyIHN0cmluZyBzbyB3ZSBjYW4gc2xpY2UgaXQgbGF0ZXIgJTI4IGlzIGFuIG9wZW4gcGFyZW50aGVzZXMgXG4gICAgICAgICAgICB0ZW1wb3JhcnlTdHIgKz0gJyUyOCc7XG4gICAgXG4gICAgICAgICAgICAvLyBGb3IgZXZlcnkgdmFsdWUgZ2l2ZW4gYnkgdGhlIHVzZXIgd2UgbmVlZCB0byBhZGQgdGhlICtPUitcbiAgICAgICAgICAgIC8vIHRvIHRoZSBlbmQgZm9yIGdyb3VwaW5nLiBXZSB3aWxsIHJlbW92ZSB0aGUgK09SKyBmcm9tIHRoZSBsYXN0XG4gICAgICAgICAgICAvLyBpdGVyYXRpb24gb2YgdGhlIGxvb3BcbiAgICAgICAgICAgIHZhbHVlcy5mb3JFYWNoKHZhbHVlID0+IHRlbXBvcmFyeVN0ciArPSBgcmFyaXR5JTNBJHt2YWx1ZX0rT1IrYCk7XG4gICAgXG4gICAgICAgICAgICAvLyBSZW1vdmUgdGhlIHVubmVjZXNzYXJ5ICtPUisgYXQgdGhlIGVuZFxuICAgICAgICAgICAgdGVtcG9yYXJ5U3RyID0gdGVtcG9yYXJ5U3RyLnNsaWNlKDAsIC00KTtcbiAgICBcbiAgICAgICAgICAgIC8vIENsb3NlIHRoZSBwYXJlbnRoZXNlc1xuICAgICAgICAgICAgdGVtcG9yYXJ5U3RyICs9IGAlMjlgO1xuXG4gICAgICAgICAgICB0aGlzLnNlYXJjaCArPSBgKyR7dGVtcG9yYXJ5U3RyfWA7XG4gICAgICAgIH0gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBzZWFyY2hCeUNvc3QoKSB7XG4gICAgICAgIGNvbnN0IGRlbm9taW5hdGlvbiA9IGVsZW1lbnRzLmFwaVNlYXJjaC5kZW5vbWluYXRpb24udmFsdWU7XG4gICAgICAgIGNvbnN0IHNvcnRCeSA9IGVsZW1lbnRzLmFwaVNlYXJjaC5kZW5vbWluYXRpb25Tb3J0QnkudmFsdWU7XG4gICAgICAgIGNvbnN0IGlucHV0VmFsID0gZWxlbWVudHMuYXBpU2VhcmNoLmRlbm9taW5hdGlvblNvcnRWYWx1ZS52YWx1ZTtcbiAgICAgICAgXG4gICAgICAgIGlmIChpbnB1dFZhbCkgdGhpcy5zZWFyY2ggKz0gYCske2Rlbm9taW5hdGlvbn0ke3NvcnRCeX0ke2lucHV0VmFsfWA7XG4gICAgfVxuXG4gICAgcXVpY2tTZWFyY2goKSB7XG4gICAgICAgIGxldCBjYXJkTmFtZSA9IGVsZW1lbnRzLm5hdi5zZWFyY2hJbnB1dC52YWx1ZTtcbiAgICAgICAgY2FyZE5hbWUgPSBjYXJkTmFtZS5yZXBsYWNlKCcgJywgJysnKTtcbiAgICAgICAgcmV0dXJuIGNhcmROYW1lO1xuICAgIH1cblxuICAgIHNvcnRSZXN1bHRzKCkge1xuICAgICAgICBjb25zdCBzb3J0QnkgPSBlbGVtZW50cy5hcGlTZWFyY2guY2FyZFNvcnRlci52YWx1ZTtcbiAgICAgICAgdGhpcy5zZWFyY2ggKz0gYCZvcmRlcj0ke3NvcnRCeX1gXG4gICAgfVxuXG4gICAgLy8gVGhpcyBtZXRob2Qgd2lsbCBydW4gZWFjaCBvZiB0aGUgaW5kaXZpZHVhbCBzZWFyY2ggbWV0aG9kcyB0byBidWlsZCB0aGUgZmluYWwgc2VhcmNoIHF1ZXJ5XG4gICAgYnVpbGRTZWFyY2hRdWVyeSgpIHtcbiAgICAgICAgdGhpcy5zZWFyY2hCeU5hbWUoKTtcbiAgICAgICAgdGhpcy5zZWFyY2hCeU90ZXh0KCk7XG4gICAgICAgIHRoaXMuc2VhcmNoQnlDYXJkVHlwZSgpO1xuICAgICAgICB0aGlzLnNlYXJjaEJ5Q29sb3IoKTtcbiAgICAgICAgdGhpcy5zZWFyY2hCeVN0YXRzKCk7XG4gICAgICAgIHRoaXMuc2VhcmNoQnlGb3JtYXQoKTtcbiAgICAgICAgdGhpcy5zZWFyY2hCeVNldCgpO1xuICAgICAgICB0aGlzLnNlYXJjaEJ5UmFyaXR5KCk7XG4gICAgICAgIHRoaXMuc2VhcmNoQnlDb3N0KCk7XG4gICAgICAgIHRoaXMuc29ydFJlc3VsdHMoKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5zZWFyY2g7XG4gICAgfSBcblxuICAgIHJlc2V0U2VhcmNoUXVlcnkoKSB7XG4gICAgICAgIHRoaXMuc2VhcmNoID0gJyc7XG4gICAgfVxuXG4gICAgZGlzcGxheU1ldGhvZCgpIHtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnRzLmFwaVNlYXJjaC5kaXNwbGF5QXMudmFsdWU7XG4gICAgfVxuXG4gICAgLy8gUmV0dW5zIHRoZSBmaXJzdCBwYWdlIG9mIGNhcmRzXG4gICAgYXN5bmMgZ2V0Q2FyZHMoc3RhdGUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGF4aW9zLmdldChgaHR0cHM6Ly9hcGkuc2NyeWZhbGwuY29tL2NhcmRzL3NlYXJjaD9xPSR7c3RhdGUucXVlcnl9YClcbiAgICAgICAgICAgIC50aGVuKHJlcyA9PiB7XG4gICAgICAgICAgICAgICAgLy8gVXBkYXRlIHRoZSBzZWFyY2hcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3VsdHMgPSByZXMuZGF0YTtcbiAgICAgICAgICAgICAgICB0aGlzLmNhcmRzID0gcmVzLmRhdGEuZGF0YTtcblxuICAgICAgICAgICAgICAgIC8vIFN0b3JlIHRoZSBjYXJkcyBpbiB0aGUgYWxsQ2FyZHMgYXJyYXlcbiAgICAgICAgICAgICAgICBzdGF0ZS5hbGxDYXJkcy5wdXNoKHJlcy5kYXRhLmRhdGEpXG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIucmVzcG9uc2Uuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUuYWxsQ2FyZHMucHVzaCg0MDQpO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgLy8gVXNlZCBieSBnZXRBbGxDYXJkcyB0byBnZXQgZWFjaCBhcnJheSBvZiAxNzUgY2FyZHNcbiAgICBhc3luYyBsb29wTmV4dFBhZ2Uoc3RhdGUsIGVuYWJsZUJ0bikge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgYXhpb3MuZ2V0KHRoaXMucmVzdWx0cy5uZXh0X3BhZ2UpXG4gICAgICAgICAgICAudGhlbihyZXMgPT4ge1xuICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgcmVzdWx0cyBvYmplY3RcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3VsdHMgPSByZXMuZGF0YVxuXG4gICAgICAgICAgICAgICAgLy8gUHVzaCB0aGUgY2FyZHMgZnJvbSB0aGlzIHJlc3VsdCBpbnRvIHRoZSBhbGxDYXJkcyBhcnJheVxuICAgICAgICAgICAgICAgIHN0YXRlLmFsbENhcmRzLnB1c2gocmVzLmRhdGEuZGF0YSk7XG5cbiAgICAgICAgICAgICAgICAvLyBFbmFibGUgdGhlIG5leHQgcGFnZSBidG4gYW5kIHJlc29sdmUgdGhlIHByb21pc2VcbiAgICAgICAgICAgICAgICBlbmFibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UubmV4dFBhZ2VCdG4pO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgLy8gV2lsbCBydW4gaW4gdGhlIGJhY2tncm91bmQgYWZ0ZXIgdGhlIGZpcnN0IHNldCBvZiBjYXJkcyBpcyByZXRyaWV2ZWQgdG8gbWFrZSBtb3ZpbmcgYmV0d2VlbiByZXN1bHRzXG4gICAgLy8gcGFnZXMgZmFzdGVyXG4gICAgYXN5bmMgZ2V0QWxsQ2FyZHMoc3RhdGUsIGVuYWJsZUJ0bikge1xuICAgICAgICAvLyBBcyBsb25nIGFzIHRoZXJlIGlzIGEgbmV4dF9wYWdlIGtlZXAgbG9hZGluZyB0aGUgY2FyZHNcbiAgICAgICAgd2hpbGUgKHRoaXMucmVzdWx0cy5uZXh0X3BhZ2UpIGF3YWl0IHRoaXMubG9vcE5leHRQYWdlKHN0YXRlLCBlbmFibGVCdG4pXG5cbiAgICAgICAgLy8gVXBkYXRlIHRoZSBzdGF0ZSBvbmNlIGFsbCBjYXJkcyBoYXZlIGJlZW4gcmV0cmVpZXZlZFxuICAgICAgICBzdGF0ZS5hbGxSZXN1bHRzTG9hZGVkID0gdHJ1ZTtcblxuICAgICAgICAvLyBJZiB0aGVyZSBpcyBhdCBsZWFzdCAyIHBhZ2VzIG9mIGNhcmRzLCBlbmFibGUgdGhlIGxhc3QgcGFnZSBidG4uXG4gICAgICAgIGlmIChzdGF0ZS5hbGxDYXJkcy5sZW5ndGggPiAxKSBlbmFibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UubGFzdFBhZ2VCdG4pO1xuICAgIH1cbn0iLCJleHBvcnQgY29uc3QgZWxlbWVudHMgPSB7XG4gICAgbmF2OiB7XG4gICAgICAgIHF1aWNrU2VhcmNoQnRuOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLW5hdi1zZWFyY2gnKSxcbiAgICAgICAgc2VhcmNoSW5wdXQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tbmF2LXNlYXJjaC1pbnB1dCcpLFxuICAgIH0sXG4gICAgYXBpU2VhcmNoOiB7XG4gICAgICAgIGNhcmROYW1lOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1jYXJkLW5hbWUnKSxcbiAgICAgICAgb3JhY2xlVGV4dDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktby10ZXh0JyksXG4gICAgICAgIHR5cGVMaW5lOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS10eXBlLWxpbmUnKSxcbiAgICAgICAgc2VsZWN0ZWRUeXBlczogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktc2VsZWN0ZWQtdHlwZXMnKSxcbiAgICAgICAgaW5jbHVkZVBhcnRpYWxUeXBlczogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktdHlwZS1ib3gnKSxcbiAgICAgICAgdHlwZURyb3BEb3duOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS10eXBlcy1kcm9wZG93bicpLFxuICAgICAgICBjb2xvckJveGVzOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWFwaS1jb2xvci1ib3gnKSxcbiAgICAgICAgY29sb3JTb3J0Qnk6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLWNvbG9yLXNvcnRlcicpLFxuICAgICAgICBzdGF0OmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXN0YXQnKSxcbiAgICAgICAgc3RhdEZpbHRlcjpkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1zdGF0LWZpbHRlcicpLFxuICAgICAgICBzdGF0VmFsdWU6ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktc3RhdC12YWx1ZScpLFxuICAgICAgICBsZWdhbFN0YXR1czogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktbGVnYWwtc3RhdHVzJyksXG4gICAgICAgIGZvcm1hdDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktZm9ybWF0JyksXG4gICAgICAgIHNldElucHV0OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1zZXQnKSxcbiAgICAgICAgc2V0RHJvcERvd246IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXNldC1kcm9wZG93bicpLFxuICAgICAgICBzZWxlY3RlZFNldHM6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXNlbGVjdGVkLXNldHMnKSxcbiAgICAgICAgYmxvY2s6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLWJsb2NrJyksXG4gICAgICAgIHJhcml0eUJveGVzOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWFwaS1yYXJpdHktYm94JyksXG4gICAgICAgIGRlbm9taW5hdGlvbjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktZGVub21pbmF0aW9uJyksXG4gICAgICAgIGRlbm9taW5hdGlvblNvcnRCeTogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktZGVub21pbmF0aW9uLXNvcnQtYnknKSxcbiAgICAgICAgZGVub21pbmF0aW9uU29ydFZhbHVlOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1kZW5vbWluYXRpb24tc29ydC12YWx1ZScpLFxuICAgICAgICBjYXJkU29ydGVyOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1yZXN1bHRzLXNvcnRlcicpLFxuICAgICAgICBkaXNwbGF5QXM6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXNlYXJjaC1kaXNwbGF5LXNlbGVjdG9yJyksXG4gICAgICAgIHN1Ym1pdEJ0bjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktYnRuJyksXG4gICAgfSxcbiAgICByZXN1bHRzUGFnZToge1xuICAgICAgICByZXN1bHRzQ29udGFpbmVyOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1yZXN1bHRzLWRpc3BsYXknKSxcbiAgICAgICAgZGlzcGxheVNlbGVjdG9yOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXJlc3VsdHMtZGlzcGxheS1vcHRpb24nKSxcbiAgICAgICAgc29ydEJ5OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXJlc3VsdHMtc29ydC1vcHRpb25zJyksXG4gICAgICAgIGJ0bjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1yZXN1bHRzLXN1Ym1pdC1idG4nKSxcbiAgICAgICAgY2FyZENoZWNrbGlzdDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1jYXJkLWNoZWNrbGlzdCcpLFxuICAgICAgICBpbWFnZUdyaWQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taW1hZ2UtZ3JpZCcpLFxuICAgICAgICBkaXNwbGF5QmFyOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1kaXNwbGF5LWJhcicpLFxuICAgICAgICBmaXJzdFBhZ2VCdG46IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLWZpcnN0LXBhZ2UnKSxcbiAgICAgICAgcHJldmlvdXNQYWdlQnRuOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1wcmV2aW91cy1wYWdlJyksXG4gICAgICAgIG5leHRQYWdlQnRuOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1uZXh0LXBhZ2UnKSxcbiAgICAgICAgbGFzdFBhZ2VCdG46IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLWxhc3QtcGFnZScpXG4gICAgfSxcbiAgICBjYXJkOiB7XG4gICAgICAgIG1hbmFDb3N0VGl0bGVTcGFuOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWNhcmQtbWFuYS1jb3N0JyksXG4gICAgICAgIG9yYWNsZVRleHRzOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLW9yYWNsZS10ZXh0LWxpbmUnKSxcbiAgICAgICAgbGVnYWxpdGllczogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1jYXJkLWxlZ2FsaXR5JyksXG4gICAgICAgIHByaW50Um93czogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1jYXJkLXByaW50LXJvdycpLFxuICAgICAgICBwcmljZXM6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tY2FyZC1wcmljZScpLFxuICAgICAgICBjYXJkUHJpbnRMaW5rczogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1jYXJkLXByaW50LWxpbmsnKSxcbiAgICAgICAgZnJvbnQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tZnJvbnQnKSxcbiAgICAgICAgYmFjazogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1iYWNrJyksXG4gICAgICAgIHRyYW5zZm9ybUJ0bjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1jYXJkLXRyYW5zZm9ybScpLFxuICAgIH1cbn07IiwiaW1wb3J0IHsgZ2VuZXJhdGVNYW5hQ29zdEltYWdlcyB9IGZyb20gJy4vcmVzdWx0c1ZpZXcnO1xuaW1wb3J0IHsgZWxlbWVudHMgfSBmcm9tICcuL2Jhc2UnO1xuXG5leHBvcnQgY29uc3QgaW5zZXJ0TWFuYUNvc3RUb0NhcmRUZXh0VGl0bGUgPSAoKSA9PiB7XG4gICAgY29uc3QgbWFuYUNvc3RzID0gQXJyYXkuZnJvbShlbGVtZW50cy5jYXJkLm1hbmFDb3N0VGl0bGVTcGFuKTsgICAgXG5cbiAgICBtYW5hQ29zdHMuZm9yRWFjaChjb3N0ID0+IHtcbiAgICAgICAgY29zdC5pbm5lckhUTUwgPSBnZW5lcmF0ZU1hbmFDb3N0SW1hZ2VzKFxuICAgICAgICAgICAgY29zdC5nZXRBdHRyaWJ1dGUoJ2RhdGEtbWFuYS1jb3N0JylcbiAgICAgICAgKTtcbiAgICB9KVxufTtcblxuXG5leHBvcnQgY29uc3QgaW5zZXJ0TWFuYUNvc3RUb09yYWNsZVRleHQgPSAoKSA9PiB7XG4gICAgY29uc3Qgb3JhY2xlVGV4dHMgPSBBcnJheS5mcm9tKGVsZW1lbnRzLmNhcmQub3JhY2xlVGV4dHMpO1xuXG4gICAgaWYgKG9yYWNsZVRleHRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgb3JhY2xlVGV4dHMuZm9yRWFjaCh0ZXh0ID0+IHRleHQuaW5uZXJIVE1MID0gZ2VuZXJhdGVNYW5hQ29zdEltYWdlcyhcbiAgICAgICAgICAgIHRleHQuaW5uZXJIVE1MLCAneHMnXG4gICAgICAgICkpO1xuICAgIH0gICAgXG59O1xuXG5cbmV4cG9ydCBjb25zdCByZW1vdmVVbmRlclNjb3JlRnJvbUxlZ2FsU3RhdHVzID0gKCkgPT4ge1xuICAgIGNvbnN0IGxlZ2FsaXRpZXMgPSBBcnJheS5mcm9tKGVsZW1lbnRzLmNhcmQubGVnYWxpdGllcyk7XG5cbiAgICBsZWdhbGl0aWVzLmZvckVhY2gobGVnYWxpdHkgPT4ge1xuICAgICAgICBpZiAobGVnYWxpdHkuaW5uZXJIVE1MLmluY2x1ZGVzKCdfJykpIHtcbiAgICAgICAgICAgIGxlZ2FsaXR5LmlubmVySFRNTCA9IGxlZ2FsaXR5LmlubmVySFRNTC5yZXBsYWNlKCdfJywgJyAnKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuXG5leHBvcnQgY29uc3QgZml4Q2FyZFByaWNlcyA9ICgpID0+IHtcbiAgICBjb25zdCBwcmljZXMgPSBBcnJheS5mcm9tKGVsZW1lbnRzLmNhcmQucHJpY2VzKTtcblxuICAgIHByaWNlcy5mb3JFYWNoKHByaWNlID0+IHtcbiAgICAgICAgaWYgKHByaWNlLmlubmVySFRNTC5pbmNsdWRlcygnTm9uZScpKSBwcmljZS5pbm5lckhUTUwgPSAnLSdcbiAgICB9KTtcbn07XG5cblxuY29uc3QgZml4RG91YmxlU2lkZWRDYXJkTmFtZSA9IGNhcmROYW1lID0+IHtcbiAgICBpZiAoY2FyZE5hbWUuaW5jbHVkZXMoJy8nKSkge1xuICAgICAgICBjYXJkTmFtZSA9IGNhcmROYW1lLnN1YnN0cmluZygwLCBjYXJkTmFtZS5pbmRleE9mKCcvJykgLSAxKVxuICAgIH1cbiAgICByZXR1cm4gY2FyZE5hbWU7ICAgIFxufVxuXG5cbmV4cG9ydCBjb25zdCBzZXRQcmludExpbmtIcmVmID0gKCkgPT4ge1xuICAgIGNvbnN0IGxpbmtzID0gQXJyYXkuZnJvbShlbGVtZW50cy5jYXJkLmNhcmRQcmludExpbmtzKTtcblxuICAgIGxpbmtzLmZvckVhY2gobGluayA9PiB7XG4gICAgICAgIGxldCBjYXJkTmFtZSA9IGxpbmsuZ2V0QXR0cmlidXRlKCdkYXRhLW5hbWUnKS5yZXBsYWNlQWxsKCcgJywgJy0nKTtcbiAgICAgICAgY2FyZE5hbWUgPSBmaXhEb3VibGVTaWRlZENhcmROYW1lKGNhcmROYW1lKTtcbiAgICAgICAgY29uc3Qgc2V0Q29kZSA9IGxpbmsuZ2V0QXR0cmlidXRlKCdkYXRhLXNldCcpO1xuXG4gICAgICAgIGxpbmsuaHJlZiA9IGAvY2FyZC8ke3NldENvZGV9LyR7Y2FyZE5hbWV9YFxuICAgIH0pO1xufTtcblxuXG5jb25zdCBzZXREb3VibGVTaWRlZFRyYW5zaXRpb24gPSAoKSA9PiB7XG4gICAgLy8gQ2hlY2tzIHRvIHNlZSBpZiBhbiBpbmxpbmUgc3R5bGUgaGFzIGJlZW4gc2V0IGZvciB0aGUgZnJvbnQgb2YgdGhlIGNhcmQuXG4gICAgLy8gSWYgbm90LCBzZXQgYSB0cmFuc2l0b24uIFRoaXMgbWFrZXMgc3VyZSB3ZSBkb24ndCBzZXQgdGhlIHRyYW5zaXRvbiBldmVyeVxuICAgIC8vIHRpbWUgdGhlIGNhcmQgaXMgZmxpcHBlZC5cbiAgICBpZiAoIWVsZW1lbnRzLmNhcmQuZnJvbnQuZ2V0QXR0cmlidXRlKCdzdHlsZScpKSB7XG4gICAgICAgIGVsZW1lbnRzLmNhcmQuZnJvbnQuc3R5bGUudHJhbnNpdGlvbiA9IGBhbGwgLjhzIGVhc2VgO1xuICAgICAgICBlbGVtZW50cy5jYXJkLmJhY2suc3R5bGUudHJhbnNpdGlvbiA9IGBhbGwgLjhzIGVhc2VgO1xuICAgIH1cbn07XG5cblxuZXhwb3J0IGNvbnN0IGZsaXBUb0JhY2tTaWRlID0gKCkgPT4ge1xuICAgIC8vIFNldHMgdGhlIHRyYW5zaXRpb24gcHJvcGVydHkgb24gYm90aCBzaWRlcyBvZiB0aGUgY2FyZCB0aGUgZmlyc3QgdGltZSB0aGVcbiAgICAvLyB0cmFuc2Zvcm0gYnV0dG9uIGlzIGNsaWNrZWRcbiAgICBzZXREb3VibGVTaWRlZFRyYW5zaXRpb24oKTtcblxuICAgIC8vIFJvdGF0ZXMgdGhlIGNhcmQgdG8gc2hvdyB0aGUgYmFja3NpZGUuXG4gICAgZWxlbWVudHMuY2FyZC5mcm9udC5zdHlsZS50cmFuc2Zvcm0gPSBgcm90YXRlWSgtMTgwZGVnKWA7XG4gICAgZWxlbWVudHMuY2FyZC5iYWNrLnN0eWxlLnRyYW5zZm9ybSA9IGByb3RhdGVZKDApYDtcblxuICAgIC8vIFJlc2V0IHRoZSBldmVudCBsaXN0ZW5lciBzbyB0aGF0IG9uIGNsaWNraW5nIHRoZSBidXR0b24gaXQgd2lsbCBmbGlwXG4gICAgLy8gYmFjayB0byB0aGUgZnJvbnQgb2YgdGhlIGNhcmRcbiAgICBlbGVtZW50cy5jYXJkLnRyYW5zZm9ybUJ0bi5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIGZsaXBUb0JhY2tTaWRlKTtcbiAgICBlbGVtZW50cy5jYXJkLnRyYW5zZm9ybUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZsaXBUb0Zyb250U2lkZSk7XG59O1xuXG5cbmV4cG9ydCBjb25zdCBmbGlwVG9Gcm9udFNpZGUgPSAoKSA9PiB7XG4gICAgZWxlbWVudHMuY2FyZC5mcm9udC5zdHlsZS50cmFuc2Zvcm0gPSBgcm90YXRlWSgwKWA7XG4gICAgZWxlbWVudHMuY2FyZC5iYWNrLnN0eWxlLnRyYW5zZm9ybSA9IGByb3RhdGVZKDE4MGRlZylgO1xuXG4gICAgLy8gUmVzZXQgdGhlIGV2ZW50IGxpc3RlbmVyIHNvIHRoYXQgb24gY2xpY2tpbmcgdGhlIGJ1dHRvbiBpdCB3aWxsIGZsaXBcbiAgICAvLyB0byB0aGUgYmFja3NpZGUgb2YgdGhlIGNhcmRcbiAgICBlbGVtZW50cy5jYXJkLnRyYW5zZm9ybUJ0bi5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIGZsaXBUb0Zyb250U2lkZSk7XG4gICAgZWxlbWVudHMuY2FyZC50cmFuc2Zvcm1CdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmbGlwVG9CYWNrU2lkZSk7XG59XG5cblxuLy8gQ3JlYXRlIHRoZSBob3ZlciBlZmZlY3Qgb24gZWFjaCByb3cgdGhhdCBkaXNwbGF5cyB0aGUgaW1hZ2Ugb2YgdGhlIGNhcmRcbmV4cG9ydCBjb25zdCBwcmludExpc3RIb3ZlckV2ZW50cyA9ICgpID0+IHtcbiAgICAvLyBHZXQgdGhlIEhUTUwgZm9yIGVhY2ggdGFibGUgcm93XG4gICAgY29uc3QgcHJpbnRzID0gQXJyYXkuZnJvbShlbGVtZW50cy5jYXJkLnByaW50Um93cyk7XG4gXG4gICAgcHJpbnRzLmZvckVhY2gocHJpbnQgPT4ge1xuICAgICAgICBwcmludC5vbm1vdXNlbW92ZSA9IGUgPT4ge1xuICAgICAgICAgICAgLy8gSWYgdGhlIHdpbmRvdyBpcyBzbWFsbGVyIHRoYW4gNzY4IHBpeGVscywgZG9uJ3QgZGlzcGxheSBhbnkgaW1hZ2VzXG4gICAgICAgICAgICBpZiAod2luZG93LmlubmVyV2lkdGggPCA3NjgpIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgLy8gSWYgdGhlcmUgaXMgYWxyZWFkeSBhbiBpbWFnZSBiZWluZyBkaXNwbGF5ZWQsIHJlbW92ZSBpdCBmcm9tIHRoZSBET01cbiAgICAgICAgICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudG9vbHRpcCcpKSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudG9vbHRpcCcpKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIFByZXAgdGhlIGRpdi5cbiAgICAgICAgICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgZGl2LmNsYXNzTmFtZSA9ICd0b29sdGlwJztcblxuICAgICAgICAgICAgLy8gVGhlIGRpdiBpcyBzdHlsZWQgd2l0aCBwb3NpdGlvbiBhYnNvbHV0ZS4gVGhpcyBjb2RlIHB1dHMgaXQganVzdCB0byB0aGUgcmlnaHQgb2YgdGhlIGN1cnNvclxuICAgICAgICAgICAgZGl2LnN0eWxlLmxlZnQgPSBlLnBhZ2VYICsgNTAgKyAncHgnO1xuICAgICAgICAgICAgZGl2LnN0eWxlLnRvcCA9IGUucGFnZVkgLSAzMCArICdweCc7XG5cbiAgICAgICAgICAgIC8vIFByZXAgdGhlIGltZyBlbGVtZW50XG4gICAgICAgICAgICBjb25zdCBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcbiAgICAgICAgICAgIGltZy5jbGFzc05hbWUgPSAndG9vbHRpcF9faW1nJztcbiAgICAgICAgICAgIGltZy5zcmMgPSBwcmludC5nZXRBdHRyaWJ1dGUoJ2RhdGEtY2FyZEltZycpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBQdXQgdGhlIGltZyBpbnRvIHRoZSBkaXYgYW5kIHRoZW4gYXBwZW5kIHRoZSBkaXYgZGlyZWN0bHkgdG8gdGhlIGJvZHkgb2YgdGhlIGRvY3VtZW50LlxuICAgICAgICAgICAgZGl2LmFwcGVuZENoaWxkKGltZyk7IFxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkaXYpOyAgXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIC8vIFJlbW92ZSB0aGUgaW1nIHdoZW4gdGFraW5nIHRoZSBjdXJzb3Igb2ZmIHRoZSBwcmludFxuICAgICAgICBwcmludC5vbm1vdXNlb3V0ID0gZSA9PiB7XG4gICAgICAgICAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRvb2x0aXAnKSkge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRvb2x0aXAnKSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9O1xuICAgIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IGNoZWNrUHJpY2VJbnB1dEZvckRpZ2l0cyA9IGUgPT4ge1xuICAgIGNvbnN0IHByaWNlSW5wdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFkZC10by1pbnYtcHJpY2UnKS52YWx1ZTtcblxuICAgIGlmIChpc05hTihwcmljZUlucHV0KSAmJiBwcmljZUlucHV0ICE9PSAnJykge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHJlbmRlclByaWNlSW5wdXRFcnJvck1lc3NhZ2UoKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuY29uc3QgcmVuZGVyUHJpY2VJbnB1dEVycm9yTWVzc2FnZSA9ICgpID0+IHtcbiAgICBjb25zdCBwcmljZUlucHV0RGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hZGQtdG8taW52LXByaWNlLWRpdicpO1xuICAgIGNvbnN0IG1zZyA9IGA8cCBjbGFzcz1cImFkZC10by1pbnYtcHJpY2UtbXNnXCI+SW52YWxpZCBwcmljZS4gTXVzdCBiZSBhIG51bWJlci48L3A+YDtcblxuICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmFkZC10by1pbnYtcHJpY2UtbXNnJykpIHtcbiAgICAgICAgcHJpY2VJbnB1dERpdi5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWVuZCcsIG1zZyk7XG4gICAgfSAgICBcbn1cblxuIiwiaW1wb3J0IHsgZWxlbWVudHMgfSBmcm9tICcuL2Jhc2UnXG5pbXBvcnQgKiBhcyBzZWFyY2hWaWV3IGZyb20gJy4vc2VhcmNoVmlldydcblxuZXhwb3J0IGNvbnN0IGNoZWNrUHJpY2VJbnB1dEZvckRpZ2l0cyA9IGUgPT4ge1xuICAgIGNvbnN0IHByaWNlSW5wdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWludi1kZW5vbWluYXRpb24tc29ydC12YWx1ZScpLnZhbHVlO1xuXG4gICAgaWYgKGlzTmFOKHByaWNlSW5wdXQpICYmIHByaWNlSW5wdXQgIT09ICcnKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgcmVuZGVyUHJpY2VJbnB1dEVycm9yTWVzc2FnZSgpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuXG5jb25zdCByZW5kZXJQcmljZUlucHV0RXJyb3JNZXNzYWdlID0gKCkgPT4ge1xuICAgIGNvbnN0IHByaWNlSW5wdXREaXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWludi1zZWFyY2gtcHJpY2UtZGl2Jyk7XG4gICAgY29uc3QgbXNnID0gYDxwIGNsYXNzPVwiaW52LXNlYXJjaC1wcmljZS1tc2dcIj5JbnZhbGlkIHByaWNlLiBNdXN0IGJlIGEgbnVtYmVyLjwvcD5gO1xuXG4gICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuaW52LXNlYXJjaC1wcmljZS1tc2cnKSkge1xuICAgICAgICBwcmljZUlucHV0RGl2Lmluc2VydEFkamFjZW50SFRNTCgnYmVmb3JlZW5kJywgbXNnKTtcbiAgICB9ICAgIFxufVxuXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKiogVFlQRSBMSU5FICoqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG5cbmNvbnN0IGhpZGVUeXBlc0Ryb3BEb3duQnV0S2VlcFZhbHVlID0gKCkgPT4ge1xuICAgIGlmICghZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVEcm9wRG93bi5oYXNBdHRyaWJ1dGUoJ2hpZGRlbicpKSB7XG4gICAgICAgIGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlRHJvcERvd24uc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpOyAgICAgICAgXG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBuYXZpZ2F0ZVR5cGVzRHJvcERvd24pO1xuICAgIH1cbn1cblxuZXhwb3J0IGNvbnN0IHN0YXJ0VHlwZXNEcm9wRG93bk5hdmlnYXRpb24gPSAoKSA9PiB7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG5hdmlnYXRlVHlwZXNEcm9wRG93bik7XG4gICAgY29uc3QgZmlyc3RUeXBlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS10eXBlOm5vdChbaGlkZGVuXSknKTtcbiAgICBzZWFyY2hWaWV3LmhpZ2hsaWdodFR5cGUoZmlyc3RUeXBlKTtcbiAgICBzZWFyY2hWaWV3LmhvdmVyT3ZlclR5cGVzTGlzdGVuZXIoKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgbmF2aWdhdGVUeXBlc0Ryb3BEb3duKTtcbiAgICBlbGVtZW50cy5hcGlTZWFyY2gudHlwZURyb3BEb3duLnNjcm9sbFRvcCA9IDA7XG59XG5cbmNvbnN0IG5hdmlnYXRlVHlwZXNEcm9wRG93biA9IGUgPT4ge1xuICAgIGNvbnN0IHR5cGVzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLXR5cGU6bm90KFtoaWRkZW5dKScpKTtcbiAgICBjb25zdCBpID0gdHlwZXMuaW5kZXhPZihkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWhpZ2hsaWdodGVkJykpO1xuXG4gICAgaWYgKGUuY29kZSA9PT0gJ0Fycm93RG93bicgJiYgaSA8IHR5cGVzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBzZWFyY2hWaWV3LnJlbW92ZUN1cnJlbnRIaWdobGlnaHQoKTtcbiAgICAgICAgc2VhcmNoVmlldy5oaWdobGlnaHRUeXBlKHR5cGVzW2kgKyAxXSk7XG5cbiAgICAgICAgc2VhcmNoVmlldy5zZXRTY3JvbGxUb3BPbkRvd25BcnJvdyh0eXBlc1tpICsgMV0sIGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlRHJvcERvd24pO1xuICAgIH1cblxuICAgIGlmIChlLmNvZGUgPT09ICdBcnJvd1VwJykge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIFxuICAgICAgICAvLyBXZSBhbHdheXMgd2FudCB0byBwcmV2ZW50IHRoZSBkZWZhdWx0LiBXZSBvbmx5IHdhbnQgdG8gY2hhbmdlIHRoZVxuICAgICAgICAvLyBoaWdobGlnaHQgaWYgbm90IG9uIHRoZSB0b3AgdHlwZSBpbiB0aGUgZHJvcGRvd25cbiAgICAgICAgaWYgKGkgPiAwKSB7XG4gICAgICAgICAgICBzZWFyY2hWaWV3LnJlbW92ZUN1cnJlbnRIaWdobGlnaHQoKVxuICAgICAgICAgICAgc2VhcmNoVmlldy5oaWdobGlnaHRUeXBlKHR5cGVzW2kgLSAxXSk7XG4gICAgXG4gICAgICAgICAgICBzZWFyY2hWaWV3LnNldFNjcm9sbFRvcE9uVXBBcnJvdyhcbiAgICAgICAgICAgICAgICB0eXBlc1tpIC0gMV0sIGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlRHJvcERvd25cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZS5jb2RlID09PSAnRW50ZXInKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgc2V0SW5wdXRWYWx1ZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWhpZ2hsaWdodGVkJykuZ2V0QXR0cmlidXRlKCdkYXRhLXR5cGUnKSk7XG4gICAgICAgIGhpZGVUeXBlc0Ryb3BEb3duQnV0S2VlcFZhbHVlKCk7XG4gICAgfVxufVxuXG5jb25zdCBzZXRJbnB1dFZhbHVlID0gdHlwZSA9PiB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktdHlwZS1saW5lJykudmFsdWUgPSB0eXBlXG59XG5cbmV4cG9ydCBjb25zdCB0eXBlTGluZUxpc3RlbmVyID0gZSA9PiB7XG4gICAgLy8gSWYgdGhlIHRhcmdldCBpcyBub3QgVHlwZSBMaW5lIGlucHV0IGxpbmUsIG9yIGFuIGVsZW1lbnQgaW4gdGhlIGRyb3Bkb3duIGxpc3QsIFxuICAgIC8vIGNsb3NlIHRoZSBkcm9wZG93biBhbmQgcmVtb3ZlIHRoZSBldmVudCBsaXN0ZW5lclxuICAgIGlmIChlLnRhcmdldCAhPT0gZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVMaW5lICYmICFlLnRhcmdldC5tYXRjaGVzKCcuanMtLWFwaS1kcm9wZG93bi10eXBlcy1saXN0JykpIHtcbiAgICAgICAgc2VhcmNoVmlldy5oaWRlVHlwZXNEcm9wRG93bigpOyAgICAgXG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdHlwZUxpbmVMaXN0ZW5lcikgIFxuICAgIC8vIElmIHRoZSB0YXJnZXQgaXMgb25lIGlmIHR5cGVzLCBnZXQgdGhlIGRhdGEgdHlwZVxuICAgIH0gZWxzZSBpZiAoZS50YXJnZXQuaGFzQXR0cmlidXRlKCdkYXRhLXR5cGUnKSkge1xuICAgICAgICBzZXRJbnB1dFZhbHVlKGUudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS10eXBlJykpO1xuICAgICAgICBlbGVtZW50cy5hcGlTZWFyY2gudHlwZUxpbmUuZm9jdXMoKTtcbiAgICAgICAgaGlkZVR5cGVzRHJvcERvd25CdXRLZWVwVmFsdWUoKTtcbiAgICB9XG59XG5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKioqKiBTRVRTICoqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcblxuY29uc3QgaGlkZVNldHNEcm9wRG93bkJ1dEtlZXBWYWx1ZSA9ICgpID0+IHtcbiAgICBpZiAoIWVsZW1lbnRzLmFwaVNlYXJjaC5zZXREcm9wRG93bi5oYXNBdHRyaWJ1dGUoJ2hpZGRlbicpKSB7XG4gICAgICAgIGVsZW1lbnRzLmFwaVNlYXJjaC5zZXREcm9wRG93bi5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBuYXZpZ2F0ZVNldHNEcm9wRG93bik7XG4gICAgfVxufVxuXG5cbmNvbnN0IG5hdmlnYXRlU2V0c0Ryb3BEb3duID0gZSA9PiB7XG4gICAgY29uc3Qgc2V0cyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1zZXQ6bm90KFtoaWRkZW5dKScpKTtcbiAgICBjb25zdCBpID0gc2V0cy5pbmRleE9mKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taGlnaGxpZ2h0ZWQnKSk7XG5cbiAgICBpZiAoZS5jb2RlID09PSAnQXJyb3dEb3duJyAmJiBpIDwgc2V0cy5sZW5ndGggLSAxKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgc2VhcmNoVmlldy5yZW1vdmVDdXJyZW50SGlnaGxpZ2h0KClcbiAgICAgICAgc2VhcmNoVmlldy5oaWdobGlnaHRTZXQoc2V0c1tpICsgMV0pO1xuXG4gICAgICAgIHNlYXJjaFZpZXcuc2V0U2Nyb2xsVG9wT25Eb3duQXJyb3coc2V0c1tpICsgMV0sIGVsZW1lbnRzLmFwaVNlYXJjaC5zZXREcm9wRG93bik7XG4gICAgfVxuXG4gICAgaWYgKGUuY29kZSA9PT0gJ0Fycm93VXAnICYmIGkgPiAwKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgc2VhcmNoVmlldy5yZW1vdmVDdXJyZW50SGlnaGxpZ2h0KClcbiAgICAgICAgc2VhcmNoVmlldy5oaWdobGlnaHRTZXQoc2V0c1tpIC0gMV0pO1xuXG4gICAgICAgIHNlYXJjaFZpZXcuc2V0U2Nyb2xsVG9wT25VcEFycm93KHNldHNbaSAtIDFdLCBlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd24pO1xuICAgIH1cblxuICAgIGlmIChlLmNvZGUgPT09ICdFbnRlcicpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIGFkZFNldChcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taGlnaGxpZ2h0ZWQnKS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2V0LW5hbWUnKVxuICAgICAgICApO1xuXG4gICAgICAgIGhpZGVTZXRzRHJvcERvd25CdXRLZWVwVmFsdWUoKTtcbiAgICB9XG59O1xuXG5cbmV4cG9ydCBjb25zdCBzdGFydFNldHNEcm9wRG93bk5hdmlnYXRpb24gPSAoKSA9PiB7XG4gICAgY29uc3QgZmlyc3RTZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXNldDpub3QoW2hpZGRlbl0pJyk7XG4gICAgc2VhcmNoVmlldy5oaWdobGlnaHRTZXQoZmlyc3RTZXQpO1xuICAgIHNlYXJjaFZpZXcuaG92ZXJPdmVyU2V0c0xpc3RlbmVyKCk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG5hdmlnYXRlU2V0c0Ryb3BEb3duKTtcbiAgICBlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd24uc2Nyb2xsVG9wID0gMDtcbn1cblxuY29uc3QgYWRkU2V0ID0gc2V0TmFtZSA9PiB7XG4gICAgZWxlbWVudHMuYXBpU2VhcmNoLnNldElucHV0LnZhbHVlID0gc2V0TmFtZVxufVxuXG5leHBvcnQgY29uc3Qgc2V0SW5wdXRMaXN0ZW5lciA9IGUgPT4ge1xuICAgIC8vIElmIHRoZSB0YXJnZXQgaXMgbm90IHRoZSBzZXQgaW5wdXQgZmllbGQsIG9yIGFuIGVsZW1lbnQgaW4gdGhlIGRyb3Bkb3duIGxpc3QsIFxuICAgIC8vIGNsb3NlIHRoZSBkcm9wZG93biBhbmQgcmVtb3ZlIHRoZSBldmVudCBsaXN0ZW5lciBcbiAgICBpZiAoZS50YXJnZXQgIT09IGVsZW1lbnRzLmFwaVNlYXJjaC5zZXRJbnB1dCAmJiBcbiAgICAgICFlLnRhcmdldC5tYXRjaGVzKCcuanMtLWFwaS1kcm9wZG93bi1zZXRzLWxpc3QnKSkge1xuICAgICAgICBzZWFyY2hWaWV3LmhpZGVTZXRzRHJvcERvd24oKTtcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzZXRJbnB1dExpc3RlbmVyKTtcbiAgICAvLyBJZiB0aGUgdGFyZ2V0IGlzIG9uZSBvZiB0aGUgc2V0IG9wdGlvbnMsIHRvZ2dsZSBpdCBhcyBzZWxlY3RlZCwgYWRkIGl0IHRvIHRoZSBsaXN0LFxuICAgIC8vIGFuZCBoaWRlIHRoZSBkcm9wZG93bi5cbiAgICB9IGVsc2UgaWYgKGUudGFyZ2V0Lmhhc0F0dHJpYnV0ZSgnZGF0YS1zZXQtbmFtZScpKSB7XG4gICAgICAgIGFkZFNldChcbiAgICAgICAgICAgIGUudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1zZXQtbmFtZScpXG4gICAgICAgICk7XG4gICAgICAgIGVsZW1lbnRzLmFwaVNlYXJjaC5zZXRJbnB1dC5mb2N1cygpO1xuICAgICAgICBoaWRlU2V0c0Ryb3BEb3duQnV0S2VlcFZhbHVlKCk7XG4gICAgfVxufSIsImltcG9ydCB7IGdlbmVyYXRlTWFuYUNvc3RJbWFnZXMgfSBmcm9tICcuL3Jlc3VsdHNWaWV3J1xuaW1wb3J0IHsgY2hlY2tMaXN0SG92ZXJFdmVudHMgfSBmcm9tICcuL3Jlc3VsdHNWaWV3J1xuXG5jb25zdCBzaG9ydGVuVHlwZUxpbmUgPSAoKSA9PiB7XG4gICAgY29uc3QgdHlwZXMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICcuanMtLWludi10eXBlcydcbiAgICApKTtcbiAgICB0eXBlcy5mb3JFYWNoKHR5cGUgPT4ge1xuICAgICAgICBsZXQgaHRtbCA9IHR5cGUuaW5uZXJIVE1MO1xuXG4gICAgICAgIC8vIGlmIHRoZSDigJQgZGVsaW1pdGVyIGlzIGZvdW5kIGluIHRoZSBzdHJpbmcsIHJldHVybiBldmVyeXRoaW5nIGJlZm9yZSB0aGUgZGVsaW1pdGVyXG4gICAgICAgIGlmIChodG1sLmluZGV4T2YoJ+KAlCcpICE9PSAtMSkge1xuICAgICAgICAgICAgdHlwZS5pbm5lckhUTUwgPSBodG1sLnN1YnN0cmluZygwLCBodG1sLmluZGV4T2YoJ+KAlCcpIC0gMSlcbiAgICAgICAgfVxuICAgIH0pXG59O1xuXG5jb25zdCBhbHRlck1hbmFJbWFnZXMgPSAoKSA9PiB7XG4gICAgY29uc3QgbWFuYUNvc3RzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAnLmpzLS1pbnYtbWFuYS1jb3N0J1xuICAgICkpO1xuXG4gICAgbWFuYUNvc3RzLmZvckVhY2goY29zdCA9PiB7XG4gICAgICAgIGNvc3QuaW5uZXJIVE1MID0gIGdlbmVyYXRlTWFuYUNvc3RJbWFnZXMoY29zdC5pbm5lckhUTUwpO1xuICAgIH0pXG59O1xuXG4vLyBOb3QgdXNpbmcgdGhpcyByaWdodCBub3cgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuY29uc3Qgc29ydFRhYmxlQWxwaGFiZXRpY2FsbHkgPSAoKSA9PiB7XG4gICAgbGV0IHJvd3MgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICcuanMtLWNoZWNrbGlzdC1yb3cnXG4gICAgKSk7XG4gICAgY29uc3QgdGFibGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWNhcmQtY2hlY2tsaXN0Jyk7ICAgIFxuICAgIGxldCBjYXJkcyA9IFtdXG5cbiAgICByb3dzLmZvckVhY2gocm93ID0+IHtcbiAgICAgICAgY2FyZHMucHVzaChyb3cucXVlcnlTZWxlY3RvcignLmpzLS1jaGVja2xpc3QtY2FyZC1uYW1lJykuaW5uZXJIVE1MKVxuICAgICAgICByb3cucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChyb3cpXG4gICAgfSlcblxuICAgIGNhcmRzID0gY2FyZHMuc29ydCgpXG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNhcmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHJvd0luZGV4ID0gcm93cy5pbmRleE9mKHJvd3MuZmluZChyb3cgPT4gXG4gICAgICAgICAgICByb3cuZ2V0QXR0cmlidXRlKCdkYXRhLXJvdycpID09PSBjYXJkc1tpXVxuICAgICAgICApKVxuXG4gICAgICAgIHRhYmxlLmluc2VydEFkamFjZW50RWxlbWVudCgnYmVmb3JlZW5kJywgcm93c1tyb3dJbmRleF0pICAgXG5cbiAgICAgICAgcm93cy5zcGxpY2Uocm93SW5kZXgsIDEpXG4gICAgfVxufVxuXG5jb25zdCBnaXZlRWFybmluZ3NDb2x1bW5Nb2RpZmllciA9ICgpID0+IHtcbiAgICBsZXQgcm93cyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgJy5qcy0taW52LWVhcm5pbmdzJ1xuICAgICkpO1xuXG4gICAgcm93cy5mb3JFYWNoKHJvdyA9PiB7XG4gICAgICAgIGlmIChyb3cuaW5uZXJIVE1MLnN0YXJ0c1dpdGgoJy0nKSkge1xuICAgICAgICAgICAgcm93LmNsYXNzTGlzdC5hZGQoJ25lZ2F0aXZlLWVhcm5pbmdzJyk7XG4gICAgICAgIH0gZWxzZSBpZiAocm93LmlubmVySFRNTCA9PT0gJzAuMCcpIHtcbiAgICAgICAgICAgIHJvdy5jbGFzc0xpc3QuYWRkKCduby1lYXJuaW5ncycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcm93LmNsYXNzTGlzdC5hZGQoJ3Bvc2l0aXZlLWVhcm5pbmdzJyk7XG4gICAgICAgIH1cbiAgICB9KVxufVxuXG5leHBvcnQgY29uc3QgYWx0ZXJJbnZlbnRvcnlUYWJsZSA9ICgpID0+IHtcbiAgICBzaG9ydGVuVHlwZUxpbmUoKTtcbiAgICBhbHRlck1hbmFJbWFnZXMoKTtcbiAgICBjaGVja0xpc3RIb3ZlckV2ZW50cygpO1xuICAgIC8vIHNvcnRUYWJsZUFscGhhYmV0aWNhbGx5KCk7XG4gICAgZ2l2ZUVhcm5pbmdzQ29sdW1uTW9kaWZpZXIoKTtcbn0iLCJpbXBvcnQgeyBlbGVtZW50cyB9IGZyb20gJy4vYmFzZSc7XG5cbmNvbnN0IGNsZWFyQ2hlY2tsaXN0ID0gKCkgPT4ge1xuICAgIGNvbnN0IGNoZWNrTGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tY2FyZC1jaGVja2xpc3QnKVxuICAgIGlmIChjaGVja0xpc3QpIHtcbiAgICAgICAgY2hlY2tMaXN0LnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQoY2hlY2tMaXN0KTtcblxuICAgICAgICAvLyBSZW1vdmUgYW55IHRvb2wgdGlwIGltYWdlcyBpZiB1c2VyIHdhcyBob3ZlcmluZ1xuICAgICAgICBjb25zdCB0b29sVGlwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRvb2x0aXAnKVxuICAgICAgICBpZiAodG9vbFRpcCkgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCh0b29sVGlwKTtcbiAgICB9XG59O1xuXG5cbmNvbnN0IGNsZWFySW1hZ2VHcmlkID0gKCkgPT4ge1xuICAgIGNvbnN0IGdyaWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWltYWdlLWdyaWQnKVxuICAgIGlmIChncmlkKSBncmlkLnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQoZ3JpZCk7XG59O1xuXG5cbmNvbnN0IGNsZWFyUmVzdWx0cyA9ICgpID0+IHtcbiAgICBjbGVhckNoZWNrbGlzdCgpO1xuICAgIGNsZWFySW1hZ2VHcmlkKCk7ICAgXG59XG5cblxuY29uc3QgcHJlcEltYWdlQ29udGFpbmVyID0gKCkgPT4ge1xuICAgIGNvbnN0IG1hcmt1cCA9IGBcbiAgICAgICAgPGRpdiBjbGFzcz1cImltYWdlLWdyaWQganMtLWltYWdlLWdyaWRcIj48L2Rpdj5cbiAgICBgXG4gICAgZWxlbWVudHMucmVzdWx0c1BhZ2UucmVzdWx0c0NvbnRhaW5lci5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWVuZCcsIG1hcmt1cCk7XG59O1xuXG5cbmNvbnN0IGdlbmVyYXRlU2luZ2xlU2lkZWRDYXJkID0gY2FyZCA9PiB7XG4gICAgY29uc3QgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBjb25zdCBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcblxuICAgIGEuY2xhc3NMaXN0ID0gYGltYWdlLWdyaWRfX2xpbmsganMtLWltYWdlLWdyaWQtbGlua2A7XG4gICAgYS5ocmVmID0gYC9jYXJkLyR7Y2FyZC5zZXR9LyR7cGFyc2VDYXJkTmFtZShjYXJkLm5hbWUpfWA7XG5cbiAgICBkaXYuY2xhc3NMaXN0ID0gYGltYWdlLWdyaWRfX2NvbnRhaW5lcmA7XG4gICAgaW1nLnNyYyA9IGAke2NhcmQuaW1hZ2VfdXJpcy5ub3JtYWx9YDtcbiAgICBpbWcuYWx0ID0gYCR7Y2FyZC5uYW1lfWBcbiAgICBpbWcuY2xhc3NMaXN0ID0gYGltYWdlLWdyaWRfX2ltYWdlYDtcbiAgICBkaXYuYXBwZW5kQ2hpbGQoaW1nKTtcbiAgICBhLmFwcGVuZENoaWxkKGRpdik7XG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWltYWdlLWdyaWQnKS5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2JlZm9yZWVuZCcsIGEpO1xufVxuXG5cbmNvbnN0IHNob3dCYWNrU2lkZSA9IGNhcmQgPT4ge1xuICAgIGNvbnN0IGZyb250ID0gY2FyZC5xdWVyeVNlbGVjdG9yKCcuanMtLWltYWdlLWdyaWQtY2FyZC1zaWRlLWZyb250Jyk7XG4gICAgY29uc3QgYmFjayA9IGNhcmQucXVlcnlTZWxlY3RvcignLmpzLS1pbWFnZS1ncmlkLWNhcmQtc2lkZS1iYWNrJyk7ICAgIFxuICAgIFxuICAgIGZyb250LnN0eWxlLnRyYW5zZm9ybSA9ICdyb3RhdGVZKC0xODBkZWcpJztcbiAgICBiYWNrLnN0eWxlLnRyYW5zZm9ybSA9ICdyb3RhdGVZKDApJztcblxuICAgIGZyb250LmNsYXNzTGlzdC5yZW1vdmUoJ2pzLS1zaG93aW5nJyk7XG4gICAgYmFjay5jbGFzc0xpc3QuYWRkKCdqcy0tc2hvd2luZycpO1xufVxuXG5cbmNvbnN0IHNob3dGcm9udFNpZGUgPSBjYXJkID0+IHtcbiAgICBjb25zdCBmcm9udCA9IGNhcmQucXVlcnlTZWxlY3RvcignLmpzLS1pbWFnZS1ncmlkLWNhcmQtc2lkZS1mcm9udCcpO1xuICAgIGNvbnN0IGJhY2sgPSBjYXJkLnF1ZXJ5U2VsZWN0b3IoJy5qcy0taW1hZ2UtZ3JpZC1jYXJkLXNpZGUtYmFjaycpO1xuXG4gICAgZnJvbnQuc3R5bGUudHJhbnNmb3JtID0gJ3JvdGF0ZVkoMCknO1xuICAgIGJhY2suc3R5bGUudHJhbnNmb3JtID0gJ3JvdGF0ZVkoMTgwZGVnKSc7XG5cbiAgICBmcm9udC5jbGFzc0xpc3QuYWRkKCdqcy0tc2hvd2luZycpO1xuICAgIGJhY2suY2xhc3NMaXN0LnJlbW92ZSgnanMtLXNob3dpbmcnKTtcbn1cblxuXG5jb25zdCBmbGlwQ2FyZCA9IGUgPT4ge1xuICAgIC8vIFByZXZlbnQgdGhlIGxpbmsgZnJvbSBnb2luZyB0byB0aGUgY2FyZCBzcGVjaWZpYyBwYWdlXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGNvbnN0IGNhcmQgPSBlLnRhcmdldC5wYXJlbnRFbGVtZW50O1xuXG4gICAgY29uc3QgZnJvbnQgPSBjYXJkLnF1ZXJ5U2VsZWN0b3IoJy5qcy0taW1hZ2UtZ3JpZC1jYXJkLXNpZGUtZnJvbnQnKTtcblxuICAgIC8vIElmIHRoZSBmcm9udCBpcyBzaG93aW5nLCBkaXNwbGF5IHRoZSBiYWNrc2lkZS4gT3RoZXJ3aXNlLCBkaXNwbGF5IHRoZSBmcm9udFxuICAgIGlmIChmcm9udC5jbGFzc0xpc3QuY29udGFpbnMoJ2pzLS1zaG93aW5nJykpIHNob3dCYWNrU2lkZShjYXJkKTtcbiAgICBlbHNlIHNob3dGcm9udFNpZGUoY2FyZCk7XG59XG5cblxuY29uc3QgZ2VuZXJhdGVGbGlwQ2FyZEJ0biA9ICgpID0+IHtcbiAgICBjb25zdCBidG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICBidG4uY2xhc3NMaXN0ID0gJ2ltYWdlLWdyaWRfX2RvdWJsZS1idG4ganMtLWltYWdlLWdyaWQtZmxpcC1jYXJkLWJ0bic7XG4gICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiBmbGlwQ2FyZChlKSlcblxuICAgIHJldHVybiBidG47XG59XG5cblxuY29uc3QgZ2VuZXJhdGVEb3VibGVTaWRlZENhcmQgPSBjYXJkID0+IHtcbiAgICBjb25zdCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgIGNvbnN0IG91dGVyRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgY29uc3QgaW5uZXJEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBjb25zdCBpbWdGcm9udFNpZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcbiAgICBjb25zdCBpbWdCYWNrU2lkZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuICAgIGNvbnN0IGZsaXBDYXJkQnRuID0gZ2VuZXJhdGVGbGlwQ2FyZEJ0bigpO1xuXG4gICAgYS5jbGFzc0xpc3QgPSBgaW1hZ2UtZ3JpZF9fbGluayBqcy0taW1hZ2UtZ3JpZC1saW5rYDtcbiAgICBhLmhyZWYgPSBgL2NhcmQvJHtjYXJkLnNldH0vJHtwYXJzZUNhcmROYW1lKGNhcmQubmFtZSl9YDtcblxuICAgIG91dGVyRGl2LmNsYXNzTGlzdCA9IGBpbWFnZS1ncmlkX19vdXRlci1kaXZgO1xuICAgIGlubmVyRGl2LmNsYXNzTGlzdCA9IGBpbWFnZS1ncmlkX19pbm5lci1kaXYganMtLWlubmVyLWRpdi0ke2NhcmQubmFtZX1gO1xuXG4gICAgaW1nRnJvbnRTaWRlLmNsYXNzTGlzdCA9IGBpbWFnZS1ncmlkX19kb3VibGUgaW1hZ2UtZ3JpZF9fZG91YmxlLS1mcm9udCBqcy0taW1hZ2UtZ3JpZC1jYXJkLXNpZGUtZnJvbnQganMtLXNob3dpbmdgO1xuICAgIGltZ0Zyb250U2lkZS5zcmMgPSBjYXJkLmNhcmRfZmFjZXNbMF0uaW1hZ2VfdXJpcy5ub3JtYWw7XG4gICAgaW1nRnJvbnRTaWRlLmFsdCA9IGNhcmQubmFtZTtcblxuICAgIGltZ0JhY2tTaWRlLmNsYXNzTGlzdCA9IGBpbWFnZS1ncmlkX19kb3VibGUgaW1hZ2UtZ3JpZF9fZG91YmxlLS1iYWNrIGpzLS1pbWFnZS1ncmlkLWNhcmQtc2lkZS1iYWNrYDtcbiAgICBpbWdCYWNrU2lkZS5zcmMgPSBjYXJkLmNhcmRfZmFjZXNbMV0uaW1hZ2VfdXJpcy5ub3JtYWw7XG4gICAgaW1nQmFja1NpZGUuYWx0ID0gY2FyZC5jYXJkX2ZhY2VzWzFdLm5hbWU7XG5cbiAgICBhLmFwcGVuZENoaWxkKG91dGVyRGl2KTtcbiAgICBvdXRlckRpdi5hcHBlbmRDaGlsZChpbm5lckRpdik7XG4gICAgaW5uZXJEaXYuYXBwZW5kQ2hpbGQoaW1nQmFja1NpZGUpO1xuICAgIGlubmVyRGl2LmFwcGVuZENoaWxkKGltZ0Zyb250U2lkZSk7XG4gICAgaW5uZXJEaXYuYXBwZW5kQ2hpbGQoZmxpcENhcmRCdG4pO1xuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1pbWFnZS1ncmlkJykuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdiZWZvcmVlbmQnLCBhKTtcbn1cblxuXG5jb25zdCBnZW5lcmF0ZUltYWdlR3JpZCA9IGNhcmRzID0+IHtcbiAgICBjYXJkcy5mb3JFYWNoKGNhcmQgPT4ge1xuICAgICAgICAvLyBGb3Igc2luZ2xlIHNpZGVkIGNhcmRzXG4gICAgICAgIGlmIChjYXJkLmltYWdlX3VyaXMpIGdlbmVyYXRlU2luZ2xlU2lkZWRDYXJkKGNhcmQpO1xuXG4gICAgICAgIC8vIERvdWJsZSBzaWRlZCBjYXJkc1xuICAgICAgICBlbHNlIGdlbmVyYXRlRG91YmxlU2lkZWRDYXJkKGNhcmQpOyAgICAgICBcbiAgICB9KVxufVxuXG5cbi8vIEZ1bmNpdG9uIHRvIGJlIHVzZWQgaW4gaW5kZXguanMuIFRha2VzIGNhcmUgb2YgYWxsIG5lY2Vzc2FyeSBzdGVwcyB0byBkaXNwbGF5IGNhcmRzIGFzIGEgaW1hZ2VzXG5leHBvcnQgY29uc3QgZGlzcGFseUltYWdlcyA9IGNhcmRzID0+IHtcbiAgICBjbGVhclJlc3VsdHMoKTtcbiAgICBwcmVwSW1hZ2VDb250YWluZXIoKTtcbiAgICBnZW5lcmF0ZUltYWdlR3JpZChjYXJkcyk7XG59XG5cbiBcbmNvbnN0IHByZXBDaGVja2xpc3RDb250YWluZXIgPSAoKSA9PiB7XG4gICAgY29uc3QgbWFya3VwID0gYFxuICAgICAgICA8dGFibGUgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdCBqcy0tY2FyZC1jaGVja2xpc3RcIj5cbiAgICAgICAgICAgIDx0aGVhZD5cbiAgICAgICAgICAgICAgICA8dHIgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fcm93IGNhcmQtY2hlY2tsaXN0X19yb3ctLTcgY2FyZC1jaGVja2xpc3RfX3Jvdy0taGVhZGVyXCI+XG4gICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhXCI+U2V0PC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGFcIj5OYW1lPC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGFcIj5Db3N0PC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGFcIj5UeXBlPC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGFcIj5SYXJpdHk8L3RoPlxuICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YVwiPkFydGlzdDwvdGg+XG4gICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhXCI+UHJpY2U8L3RoPlxuICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICA8L3RoZWFkPlxuICAgICAgICAgICAgPHRib2R5IGNsYXNzPVwianMtLWNhcmQtY2hlY2tsaXN0LWJvZHlcIj48L3Rib2R5PlxuICAgICAgICA8L3RhYmxlPlxuICAgICAgICBgXG4gICAgZWxlbWVudHMucmVzdWx0c1BhZ2UucmVzdWx0c0NvbnRhaW5lci5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWVuZCcsIG1hcmt1cCk7XG59XG5cbmV4cG9ydCBjb25zdCBnZW5lcmF0ZU1hbmFDb3N0SW1hZ2VzID0gKG1hbmFDb3N0LCBzaXplPSdzbWFsbCcpID0+IHtcbiAgICAvLyBJZiB0aGVyZSBpcyBubyBtYW5hIGNvc3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBjYXJkLCB0aGVuIHJldHVybiBhbiBlbXB0eSBzdHJpbmcgdG8gbGVhdmUgdGhlIHJvdyBlbXB0eVxuICAgIGlmICghbWFuYUNvc3QpIHJldHVybiAnJztcblxuICAgIC8vIFJlZ3VsYXIgZXhwcmVzc2lvbnMgdG8gZmluZCBlYWNoIHNldCBvZiBjdXJseSBicmFjZXMge31cbiAgICBsZXQgcmUgPSAvXFx7KC4qPylcXH0vZ1xuXG4gICAgLy8gUGFyc2UgdGhlIHN0cmluZ3MgYW5kIGdldCBhbGwgbWF0Y2hlc1xuICAgIGxldCBtYXRjaGVzID0gbWFuYUNvc3QubWF0Y2gocmUpO1xuXG4gICAgLy8gSWYgdGhlcmUgYXJlIGFueSBtYXRjaGVzLCBsb29wIHRocm91Z2ggYW5kIHJlcGxhY2UgZWFjaCBzZXQgb2YgY3VybHkgYnJhY2VzIHdpdGggdGhlIFxuICAgIC8vIGh0bWwgc3BhbiB0aGF0IGNvcnJlc3BvbnMgdG8gbWFuYS5jc3MgdG8gcmVuZGVyIHRoZSBjb3JyZWN0IGltYWdlXG4gICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgbWF0Y2hlcy5mb3JFYWNoKG0gPT4ge1xuICAgICAgICAgICAgY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKGBcXHsoJHttLnNsaWNlKDEsIC0xKX0pXFx9YCwgJ2cnKTtcbiAgICAgICAgICAgIC8vIFRoaXMgd2lsbCBiZSB0aGUgc3RyaW5nIHVzZWQgdG8gZ2V0IHRoZSByaWdodCBjbGFzcyBmcm9tIG1hbmEuY3NzXG4gICAgICAgICAgICAvLyBXZSB3YW50IHRvIHRha2UgZXZlcnl0aGluZyBpbnNpZGUgdGhlIGJyYWNrZXRzLCBhbmQgaWYgdGhlcmUgaXMgYSAvXG4gICAgICAgICAgICAvLyByZW1vdmUgaXQuXG4gICAgICAgICAgICBjb25zdCBtYW5hSWNvblN0ciA9IG0uc2xpY2UoMSwgLTEpLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgnLycsICcnKVxuICAgICAgICAgICAgbWFuYUNvc3QgPSBtYW5hQ29zdC5yZXBsYWNlKFxuICAgICAgICAgICAgICAgIHJlZ2V4LCBcbiAgICAgICAgICAgICAgICBgPHNwYW4gY2xhc3M9XCJtYW5hICR7c2l6ZX0gcyR7bWFuYUljb25TdHJ9XCI+PC9zcGFuPmBcbiAgICAgICAgICAgIClcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICByZXR1cm4gbWFuYUNvc3Q7XG59XG5cbmNvbnN0IHNob3J0ZW5UeXBlTGluZSA9IHR5cGUgPT4ge1xuICAgIC8vIElmIG5vIHR5cGUgaXMgZ2l2ZW4sIHJldHVybiBhbiBlbXB0eSBzdHJpbmdcbiAgICBpZiAoIXR5cGUpIHJldHVybiAnJztcblxuICAgIC8vIGlmIHRoZSDigJQgZGVsaW1pdGVyIGlzIGZvdW5kIGluIHRoZSBzdHJpbmcsIHJldHVybiBldmVyeXRoaW5nIGJlZm9yZSB0aGUgZGVsaW1pdGVyXG4gICAgaWYgKHR5cGUuaW5kZXhPZign4oCUJykgIT09IC0xKSByZXR1cm4gdHlwZS5zdWJzdHJpbmcoMCwgdHlwZS5pbmRleE9mKCfigJQnKSAtIDEpO1xuXG4gICAgLy8gSWYgdGhlcmUgaXMgbm8gZGVsaW1pdGVyLCByZXR1cm4gdGhlIHR5cGUgYXMgZ2l2ZW4gaW4gdGhlIGNhcmQgb2JqZWN0XG4gICAgcmV0dXJuIHR5cGU7ICAgIFxufVxuXG5jb25zdCBwYXJzZUNhcmROYW1lID0gY2FyZE5hbWUgPT4ge1xuICAgIGlmIChjYXJkTmFtZS5pbmRleE9mKCcvJykgIT09IC0xKSB7XG4gICAgICAgIHJldHVybiBjYXJkTmFtZS5zbGljZSgwLCAoY2FyZE5hbWUuaW5kZXhPZignLycpIC0gMSkpLnJlcGxhY2VBbGwoJyAnLCAnLScpO1xuICAgIH1cblxuICAgIHJldHVybiBjYXJkTmFtZS5yZXBsYWNlQWxsKCcgJywgJy0nKTtcbn1cblxuY29uc3QgZ2VuZXJhdGVDaGVja2xpc3QgPSBjYXJkcyA9PiB7XG4gICAgLy8gQ3JlYXRlIGEgbmV3IHRhYmxlIHJvdyBmb3IgZWFjaCBjYXJkIG9iamVjdFxuICAgIGNhcmRzLmZvckVhY2goY2FyZCA9PiB7XG4gICAgICAgIGNvbnN0IGNhcmROYW1lRm9yVXJsID0gcGFyc2VDYXJkTmFtZShjYXJkLm5hbWUpO1xuXG4gICAgICAgIGNvbnN0IG1hcmt1cCA9IGBcbiAgICAgICAgICAgIDx0ciBjbGFzcz1cImpzLS1jaGVja2xpc3Qtcm93IGNhcmQtY2hlY2tsaXN0X19yb3cgY2FyZC1jaGVja2xpc3RfX3Jvdy0tNyBkYXRhLWNvbXBvbmVudD1cImNhcmQtdG9vbHRpcFwiIGRhdGEtY2FyZC1pbWc9JHtjaGVja0ZvckltZyhjYXJkKX0+XG4gICAgICAgICAgICAgICAgPHRkIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGEgY2FyZC1jaGVja2xpc3RfX2RhdGEtLXNldFwiPjxhIGhyZWY9XCIvY2FyZC8ke2NhcmQuc2V0fS8ke2NhcmROYW1lRm9yVXJsfVwiIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGEtbGluayBjYXJkLWNoZWNrbGlzdF9fZGF0YS1saW5rLS1jZW50ZXJcIj4ke2NhcmQuc2V0fTwvYT48L3RkPlxuICAgICAgICAgICAgICAgIDx0ZCBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhXCI+PGEgaHJlZj1cIi9jYXJkLyR7Y2FyZC5zZXR9LyR7Y2FyZE5hbWVGb3JVcmx9XCIgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YS1saW5rIGNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmstLXN0YXJ0XCI+JHtjYXJkLm5hbWV9PC9hPjwvdGQ+XG4gICAgICAgICAgICAgICAgPHRkIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGFcIj48YSBocmVmPVwiL2NhcmQvJHtjYXJkLnNldH0vJHtjYXJkTmFtZUZvclVybH1cIiBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmsgY2FyZC1jaGVja2xpc3RfX2RhdGEtbGluay0tY2VudGVyXCI+JHtnZW5lcmF0ZU1hbmFDb3N0SW1hZ2VzKGNoZWNrRm9yTWFuYUNvc3QoY2FyZCkpfTwvYT48L3RkPlxuICAgICAgICAgICAgICAgIDx0ZCBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhXCI+PGEgaHJlZj1cIi9jYXJkLyR7Y2FyZC5zZXR9LyR7Y2FyZE5hbWVGb3JVcmx9XCIgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YS1saW5rIGNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmstLWNlbnRlclwiPiR7c2hvcnRlblR5cGVMaW5lKGNhcmQudHlwZV9saW5lKX08L2E+PC90ZD5cbiAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YSBjYXJkLWNoZWNrbGlzdF9fZGF0YS0tcmFyaXR5XCI+PGEgaHJlZj1cIi9jYXJkLyR7Y2FyZC5zZXR9LyR7Y2FyZE5hbWVGb3JVcmx9XCIgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YS1saW5rIGNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmstLWNlbnRlclwiPiR7Y2FyZC5yYXJpdHl9PC9hPjwvdGQ+XG4gICAgICAgICAgICAgICAgPHRkIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGFcIj48YSBocmVmPVwiL2NhcmQvJHtjYXJkLnNldH0vJHtjYXJkTmFtZUZvclVybH1cIiBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmsgY2FyZC1jaGVja2xpc3RfX2RhdGEtbGluay0tY2VudGVyXCI+JHtjYXJkLmFydGlzdH08L2E+PC90ZD5cbiAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YVwiPjxhIGhyZWY9XCIvY2FyZC8ke2NhcmQuc2V0fS8ke2NhcmROYW1lRm9yVXJsfVwiIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGEtbGluayBjYXJkLWNoZWNrbGlzdF9fZGF0YS1saW5rLS1jZW50ZXJcIj4ke2NhcmQucHJpY2VzLnVzZH08L2E+PC90ZD5cbiAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICBgXG4gICAgICAgIC8vIFB1dCB0aGUgcm93IGluIHRoZSB0YWJsZVxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWNhcmQtY2hlY2tsaXN0LWJvZHknKS5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWVuZCcsIG1hcmt1cCk7XG4gICAgfSlcbn1cblxuY29uc3QgY2hlY2tGb3JNYW5hQ29zdCA9IGNhcmQgPT4ge1xuICAgIGlmIChjYXJkLm1hbmFfY29zdCkge1xuICAgICAgICByZXR1cm4gY2FyZC5tYW5hX2Nvc3Q7XG4gICAgfSBlbHNlIGlmIChjYXJkLmNhcmRfZmFjZXMpIHtcbiAgICAgICAgcmV0dXJuIGNhcmQuY2FyZF9mYWNlc1swXS5tYW5hX2Nvc3Q7XG4gICAgfVxufVxuXG5jb25zdCBjaGVja0ZvckltZyA9IGNhcmQgPT4ge1xuICAgIGlmIChjYXJkLmltYWdlX3VyaXMpIHJldHVybiBjYXJkLmltYWdlX3VyaXMubm9ybWFsO1xuXG4gICAgLy8gSWYgdGhlcmUgaXMgbm8gY2FyZC5pbWFnZV91cmlzLCB0aGVuIGl0J3MgYSBkb3VibGUgc2lkZWQgY2FyZC4gSW4gdGhpc1xuICAgIC8vIGNhc2Ugd2Ugd2FudCB0byBkaXNwbGF5IHRoZSBpbWFnZSBmcm9tIGZhY2Ugb25lIG9mIHRoZSBjYXJkLlxuICAgIGVsc2UgcmV0dXJuIGNhcmQuY2FyZF9mYWNlc1swXS5pbWFnZV91cmlzLm5vcm1hbDtcbn1cblxuXG4vLyBDcmVhdGUgdGhlIGhvdmVyIGVmZmVjdCBvbiBlYWNoIHJvdyB0aGF0IGRpc3BsYXlzIHRoZSBpbWFnZSBvZiB0aGUgY2FyZFxuZXhwb3J0IGNvbnN0IGNoZWNrTGlzdEhvdmVyRXZlbnRzID0gKCkgPT4ge1xuICAgIC8vIEdldCB0aGUgSFRNTCBmb3IgZWFjaCB0YWJsZSByb3dcbiAgICBjb25zdCByb3dzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWNoZWNrbGlzdC1yb3cnKSk7XG4gXG4gICAgcm93cy5mb3JFYWNoKHJvdyA9PiB7XG4gICAgICAgIHJvdy5vbm1vdXNlbW92ZSA9IGUgPT4ge1xuICAgICAgICAgICAgLy8gSWYgdGhlIHdpbmRvdyBpcyBzbWFsbGVyIHRoYW4gNzY4IHBpeGVscywgZG9uJ3QgZGlzcGxheSBhbnkgaW1hZ2VzXG4gICAgICAgICAgICBpZiAod2luZG93LmlubmVyV2lkdGggPCA3NjgpIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgLy8gSWYgdGhlcmUgaXMgYWxyZWFkeSBhbiBpbWFnZSBiZWluZyBkaXNwbGF5ZWQsIHJlbW92ZSBpdCBmcm9tIHRoZSBET01cbiAgICAgICAgICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudG9vbHRpcCcpKSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudG9vbHRpcCcpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUHJlcCB0aGUgZGl2LlxuICAgICAgICAgICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBkaXYuY2xhc3NOYW1lID0gJ3Rvb2x0aXAnO1xuXG4gICAgICAgICAgICAvLyBUaGUgZGl2IGlzIHN0eWxlZCB3aXRoIHBvc2l0aW9uIGFic29sdXRlLiBUaGlzIGNvZGUgcHV0cyBpdCBqdXN0IHRvIHRoZSByaWdodCBvZiB0aGUgY3Vyc29yXG4gICAgICAgICAgICBkaXYuc3R5bGUubGVmdCA9IGUucGFnZVggKyA1MCArICdweCc7XG4gICAgICAgICAgICBkaXYuc3R5bGUudG9wID0gZS5wYWdlWSAtIDMwICsgJ3B4JztcblxuICAgICAgICAgICAgLy8gUHJlcCB0aGUgaW1nIGVsZW1lbnRcbiAgICAgICAgICAgIGNvbnN0IGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuICAgICAgICAgICAgaW1nLmNsYXNzTmFtZSA9ICd0b29sdGlwX19pbWcnO1xuICAgICAgICAgICAgaW1nLnNyYyA9IHJvdy5kYXRhc2V0LmNhcmRJbWc7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFB1dCB0aGUgaW1nIGludG8gdGhlIGRpdiBhbmQgdGhlbiBhcHBlbmQgdGhlIGRpdiBkaXJlY3RseSB0byB0aGUgYm9keSBvZiB0aGUgZG9jdW1lbnQuXG4gICAgICAgICAgICBkaXYuYXBwZW5kQ2hpbGQoaW1nKTsgXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpdik7ICBcbiAgICAgICAgICAgIH1cblxuICAgICAgICAvLyBSZW1vdmUgdGhlIGltZyB3aGVuIHRha2luZyB0aGUgY3Vyc29yIG9mZiB0aGUgcm93XG4gICAgICAgIHJvdy5vbm1vdXNlb3V0ID0gZSA9PiB7XG4gICAgICAgICAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRvb2x0aXAnKSkge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRvb2x0aXAnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KVxufVxuXG5cbi8vIEZ1bmNpdG9uIHRvIGJlIHVzZWQgaW4gaW5kZXguanMuIFRha2VzIGNhcmUgb2YgYWxsIG5lY2Vzc2FyeSBzdGVwcyB0byBkaXNwbGF5IGNhcmRzIGFzIGEgY2hlY2tsaXN0XG5leHBvcnQgY29uc3QgZGlzcGxheUNoZWNrbGlzdCA9IGNhcmRzID0+IHtcbiAgICBjbGVhclJlc3VsdHMoKTtcbiAgICBwcmVwQ2hlY2tsaXN0Q29udGFpbmVyKCk7XG4gICAgZ2VuZXJhdGVDaGVja2xpc3QoY2FyZHMpO1xuICAgIGNoZWNrTGlzdEhvdmVyRXZlbnRzKCk7XG59XG5cblxuZXhwb3J0IGNvbnN0IGNob3NlU2VsZWN0TWVudVNvcnQgPSAobWVudSwgc3RhdGUpID0+IHtcbiAgICAvLyBDcmVhdGUgYW4gYXJyYXkgZnJvbSB0aGUgSFRNTCBzZWxlY3QgbWVudVxuICAgIGNvbnN0IG9wdGlvbnMgPSBBcnJheS5mcm9tKG1lbnUpXG5cbiAgICBvcHRpb25zLmZvckVhY2goKG9wdGlvbiwgaSkgPT4ge1xuICAgICAgICAvLyBJZiB0aGUgb3B0aW9uIHZhbHVlIG1hdGNoZXMgdGhlIHNvcnQgbWV0aG9kIGZyb20gdGhlIFVSTCwgc2V0IGl0IHRvIHRoZSBzZWxlY3RlZCBpdGVtXG4gICAgICAgIGlmIChvcHRpb24udmFsdWUgPT09IHN0YXRlLnNvcnRNZXRob2QpIG1lbnUuc2VsZWN0ZWRJbmRleCA9IGk7XG4gICAgfSlcbn1cblxuXG5leHBvcnQgY29uc3QgY2hvc2VTZWxlY3RNZW51RGlzcGxheSA9IChtZW51LCBzdGF0ZSkgPT4ge1xuICAgIC8vIENyZWF0ZSBhbiBhcnJheSBmcm9tIHRoZSBIVE1MIHNlbGVjdCBtZW51XG4gICAgY29uc3Qgb3B0aW9ucyA9IEFycmF5LmZyb20obWVudSlcblxuICAgIG9wdGlvbnMuZm9yRWFjaCgob3B0aW9uLCBpKSA9PiB7XG4gICAgICAgIC8vIElmIHRoZSBvcHRpb24gdmFsdWUgbWF0Y2hlcyB0aGUgc29ydCBtZXRob2QgZnJvbSB0aGUgVVJMLCBzZXQgaXQgdG8gdGhlIHNlbGVjdGVkIGl0ZW1cbiAgICAgICAgaWYgKG9wdGlvbi52YWx1ZSA9PT0gc3RhdGUuZGlzcGxheSkgbWVudS5zZWxlY3RlZEluZGV4ID0gaTtcbiAgICB9KVxufVxuXG5cbi8vIEZ1bmN0aW9uIHRvIGNoYW5nZSB0aGUgc29ydCBtZXRob2QgYmFzZWQgb24gdGhlIGlucHV0IGZyb20gdGhlIHVzZXJcbmV4cG9ydCBjb25zdCBjaGFuZ2VTb3J0TWV0aG9kID0gc3RhdGUgPT4ge1xuICAgIC8vIEdldCB0aGUgY3VycmVudCBzb3J0IG1ldGhvZCBmcm9tIHRoZSBlbmQgb2YgdGhlIFVSTFxuICAgIGNvbnN0IGN1cnJlbnRTb3J0TWV0aG9kID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnN1YnN0cmluZyhcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLmxhc3RJbmRleE9mKCc9JykgKyAxXG4gICAgKTsgICAgXG5cbiAgICAvLyBHcmFiIHRoZSBkZXNpcmVkIHNvcnQgbWV0aG9kIGZyb20gdGhlIHVzZXJcbiAgICBjb25zdCBuZXdTb3J0TWV0aG9kID0gZWxlbWVudHMucmVzdWx0c1BhZ2Uuc29ydEJ5LnZhbHVlO1xuXG4gICAgLy8gSWYgdGhlIG5ldyBzb3J0IG1ldGhvZCBpcyBub3QgZGlmZmVyZW50LCBleGl0IHRoZSBmdW5jdGlvbiBhcyB0byBub3QgcHVzaCBhIG5ldyBzdGF0ZVxuICAgIGlmIChjdXJyZW50U29ydE1ldGhvZCA9PT0gbmV3U29ydE1ldGhvZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfSBlbHNlIHsgICAgICAgIFxuICAgICAgICAvLyBEaXNhYmxlIGFsbCBmb3VyIGJ1dHRvbnNcbiAgICAgICAgLy8gT25seSBkb2luZyB0aGlzIGJlY2F1c2UgZmlyZWZveCByZXF1aXJlcyBhIGN0cmwgZjVcbiAgICAgICAgZGlzYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5maXJzdFBhZ2VCdG4pO1xuICAgICAgICBkaXNhYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLm5leHRQYWdlQnRuKTtcbiAgICAgICAgZGlzYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5wcmV2aW91c1BhZ2VCdG4pO1xuICAgICAgICBkaXNhYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLmxhc3RQYWdlQnRuKTtcblxuICAgICAgICBjb25zdCBjdXJyZW50UGF0aE5hbWUgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3Vic3RyaW5nKFxuICAgICAgICAgICAgMCwgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLmxhc3RJbmRleE9mKCc9JykgKyAxXG4gICAgICAgICk7XG5cbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBjdXJyZW50UGF0aE5hbWUgKyBuZXdTb3J0TWV0aG9kOyAgICAgICAgICAgICAgICBcbiAgICB9XG59XG5cblxuZXhwb3J0IGNvbnN0IGNoYW5nZURpc3BsYXlBbmRVcmwgPSBzdGF0ZSA9PiB7XG4gICAgY29uc3QgY3VycmVudE1ldGhvZCA9IHN0YXRlLmRpc3BsYXk7XG4gICAgY29uc3QgbmV3TWV0aG9kID0gZWxlbWVudHMucmVzdWx0c1BhZ2UuZGlzcGxheVNlbGVjdG9yLnZhbHVlO1xuXG4gICAgaWYgKG5ld01ldGhvZCA9PT0gY3VycmVudE1ldGhvZCkgcmV0dXJuO1xuXG4gICAgLy8gVXBkYXRlIHRoZSBzdGF0ZSB3aXRoIG5ldyBkaXNwbGF5IG1ldGhvZFxuICAgIHN0YXRlLmRpc3BsYXkgPSBuZXdNZXRob2Q7XG5cbiAgICAvLyBVcGRhdGUgdGhlIHVybCB3aXRob3V0IHB1c2hpbmcgdG8gdGhlIHNlcnZlclxuICAgIGNvbnN0IHRpdGxlID0gZG9jdW1lbnQudGl0bGU7XG4gICAgY29uc3QgcGF0aE5hbWUgPSBgL3Jlc3VsdHMvJHtuZXdNZXRob2R9LyR7c3RhdGUucXVlcnl9YFxuICAgIGhpc3RvcnkucHVzaFN0YXRlKHtcbiAgICAgICAgY3VycmVudEluZGV4OiBzdGF0ZS5jdXJyZW50SW5kZXgsXG4gICAgICAgIGRpc3BsYXk6IHN0YXRlLmRpc3BsYXksXG4gICAgfSwgdGl0bGUsIHBhdGhOYW1lKTtcblxufVxuXG5cbmV4cG9ydCBjb25zdCB1cGRhdGVEaXNwbGF5ID0gc3RhdGUgPT4ge1xuICAgIC8vIENsZWFyIGFueSBleGlzdGluZyBIVE1MIGluIHRoZSBkaXNwbGF5XG4gICAgY2xlYXJSZXN1bHRzKCk7XG5cbiAgICAvLyBSZWZyZXNoIHRoZSBkaXNwbGF5XG4gICAgaWYgKHN0YXRlLmRpc3BsYXkgPT09ICdsaXN0JykgZGlzcGxheUNoZWNrbGlzdChzdGF0ZS5hbGxDYXJkc1tzdGF0ZS5jdXJyZW50SW5kZXhdKTtcbiAgICBpZiAoc3RhdGUuZGlzcGxheSA9PT0gJ2ltYWdlcycpIGRpc3BhbHlJbWFnZXMoc3RhdGUuYWxsQ2FyZHNbc3RhdGUuY3VycmVudEluZGV4XSk7XG59XG5cblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKiogUEFHSU5BVElPTiAqKioqKioqKioqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuXG4vLyBXaWxsIGJlIGNhbGxlZCBkdXJpbmcgY2hhbmdpbmcgcGFnZXMuIFJlbW92ZXMgdGhlIGN1cnJlbnQgZWxlbWVudCBpbiB0aGUgYmFyXG5jb25zdCBjbGVhckRpc3BsYXlCYXIgPSAoKSA9PiB7XG4gICAgY29uc3QgZGlzcGxheUJhclRleHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWRpc3BsYXktYmFyLXRleHQnKVxuICAgIGlmIChkaXNwbGF5QmFyVGV4dCkgZGlzcGxheUJhclRleHQucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChkaXNwbGF5QmFyVGV4dCk7XG59ICAgIFxuXG5cbi8vIEtlZXBzIHRyYWNrIG9mIHdoZXJlIHRoZSB1c2VyIGlzIGluIHRoZXJlIGxpc3Qgb2YgY2FyZHNcbmNvbnN0IHBhZ2luYXRpb25UcmFja2VyID0gc3RhdGUgPT4ge1xuICAgIHZhciBiZWcsIGVuZDtcbiAgICBiZWcgPSAoKHN0YXRlLmN1cnJlbnRJbmRleCArIDEpICogMTc1KSAtIDE3NDsgXG4gICAgZW5kID0gKChzdGF0ZS5jdXJyZW50SW5kZXgpICogMTc1KSArIHN0YXRlLmFsbENhcmRzW3N0YXRlLmN1cnJlbnRJbmRleF0ubGVuZ3RoXG5cbiAgICByZXR1cm4geyBiZWcsIGVuZCB9O1xufVxuXG5cbmV4cG9ydCBjb25zdCB1cGRhdGVEaXNwbGF5QmFyID0gc3RhdGUgPT4ge1xuICAgIGNvbnN0IG1hcmt1cCA9IGBcbiAgICAgICAgPHAgY2xhc3M9XCJhcGktcmVzdWx0cy1kaXNwbGF5X19kaXNwbGF5LWJhci10ZXh0IGpzLS1kaXNwbGF5LWJhci10ZXh0XCI+XG4gICAgICAgICAgICBEaXNwbGF5aW5nICR7cGFnaW5hdGlvblRyYWNrZXIoc3RhdGUpLmJlZ30gLSAke3BhZ2luYXRpb25UcmFja2VyKHN0YXRlKS5lbmR9IG9mICR7c3RhdGUuc2VhcmNoLnJlc3VsdHMudG90YWxfY2FyZHN9IGNhcmRzXG4gICAgICAgIDwvcD5cbiAgICBgXG5cbiAgICBjbGVhckRpc3BsYXlCYXIoKTtcbiAgICBlbGVtZW50cy5yZXN1bHRzUGFnZS5kaXNwbGF5QmFyLmluc2VydEFkamFjZW50SFRNTCgnYmVmb3JlZW5kJywgbWFya3VwKTtcbn1cblxuXG5leHBvcnQgY29uc3QgZW5hYmxlQnRuID0gYnRuID0+IHtcbiAgICBpZiAoYnRuLmRpc2FibGVkKSB7XG4gICAgICAgIGJ0bi5jbGFzc0xpc3QucmVtb3ZlKCdhcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtcGFnaW5hdGlvbi1jb250YWluZXItLWRpc2FibGVkJyk7XG4gICAgICAgIGJ0bi5kaXNhYmxlZCA9IGZhbHNlO1xuICAgIH1cbn1cblxuXG5leHBvcnQgY29uc3QgZGlzYWJsZUJ0biA9IGJ0biA9PiB7XG4gICAgaWYgKCFidG4uZGlzYWJsZWQpIHtcbiAgICAgICAgYnRuLmNsYXNzTGlzdC5hZGQoJ2FwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1wYWdpbmF0aW9uLWNvbnRhaW5lci0tZGlzYWJsZWQnKTtcbiAgICAgICAgYnRuLmRpc2FibGVkID0gdHJ1ZTtcbiAgICB9XG59XG5cblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKioqKioqKiogNDA0ICoqKioqKioqKioqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuXG5leHBvcnQgY29uc3QgZGlzcGxheTQwNCA9ICgpID0+IHtcbiAgICBjb25zdCBkaXYgPSBjcmVhdGU0MDRNZXNzYWdlKCk7XG4gICAgZWxlbWVudHMucmVzdWx0c1BhZ2UucmVzdWx0c0NvbnRhaW5lci5hcHBlbmRDaGlsZChkaXYpO1xufVxuXG5jb25zdCBjcmVhdGU0MDREaXYgPSAoKSA9PiB7XG4gICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZGl2LmNsYXNzTGlzdCA9IGBuby1yZXN1bHRzYFxuICAgIHJldHVybiBkaXY7XG59XG5cbmNvbnN0IGNyZWF0ZTQwNGgzID0gKCkgPT4ge1xuICAgIGNvbnN0IGgzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDMnKTtcbiAgICBoMy5jbGFzc0xpc3QgPSBgbm8tcmVzdWx0c19faDNgO1xuICAgIGgzLmlubmVySFRNTCA9IGBObyBjYXJkcyBmb3VuZGA7XG4gICAgcmV0dXJuIGgzO1xufVxuXG5jb25zdCBjcmVhdGU0MDRwRWxlbWVudCA9ICgpID0+IHtcbiAgICBjb25zdCBwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xuICAgIHAuY2xhc3NMaXN0ID0gYG5vLXJlc3VsdHNfX3BgXG4gICAgcC5pbm5lckhUTUwgPSAnWW91ciBzZWFyY2ggZGlkblxcJ3QgbWF0Y2ggYW55IGNhcmRzLiBHbyBiYWNrIHRvIHRoZSBzZWFyY2ggcGFnZSBhbmQgZWRpdCB5b3VyIHNlYXJjaCc7XG4gICAgcmV0dXJuIHA7ICAgIFxufVxuXG5jb25zdCBjcmVhdGU0MDRCdG4gPSAoKSA9PiB7XG4gICAgY29uc3QgYnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgIGJ0bi5jbGFzc0xpc3QgPSBgYnRuIG5vLXJlc3VsdHNfX2J0bmBcbiAgICBidG4uaHJlZiA9ICcvc2VhcmNoJztcbiAgICBidG4uaW5uZXJIVE1MID0gJ0dvIEJhY2snO1xuICAgIHJldHVybiBidG47XG59XG5cbmNvbnN0IGNyZWF0ZTQwNE1lc3NhZ2UgPSAoKSA9PiB7XG4gICAgY29uc3QgZGl2ID0gY3JlYXRlNDA0RGl2KCk7XG4gICAgY29uc3QgaDMgPSBjcmVhdGU0MDRoMygpO1xuICAgIGNvbnN0IHAgPSBjcmVhdGU0MDRwRWxlbWVudCgpO1xuICAgIGNvbnN0IGJ0biA9IGNyZWF0ZTQwNEJ0bigpO1xuXG4gICAgZGl2LmFwcGVuZENoaWxkKGgzKTtcbiAgICBkaXYuYXBwZW5kQ2hpbGQocCk7XG4gICAgZGl2LmFwcGVuZENoaWxkKGJ0bik7XG5cbiAgICByZXR1cm4gZGl2O1xufVxuIiwiaW1wb3J0IHsgZWxlbWVudHMgfSBmcm9tICcuL2Jhc2UnO1xuXG5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKiBUWVBFIExJTkUgKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcblxuZXhwb3J0IGNvbnN0IHNob3dUeXBlc0Ryb3BEb3duID0gKCkgPT4ge1xuICAgIGlmIChlbGVtZW50cy5hcGlTZWFyY2gudHlwZURyb3BEb3duLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIHsgICAgICAgICAgICBcbiAgICAgICAgZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVEcm9wRG93bi5yZW1vdmVBdHRyaWJ1dGUoJ2hpZGRlbicpO1xuICAgICAgICBlbGVtZW50cy5hcGlTZWFyY2gudHlwZURyb3BEb3duLnNjcm9sbFRvcCA9IDA7XG4gICAgICAgIGNvbnNvbGUubG9nKCd0eXBlcyBkcm9wZG93bicpXG5cbiAgICAgICAgLy8gTWFrZSBzdXJlIHRvIGRpc3BsYXkgYWxsIHR5cGVzIHdoZW4gb3BlbmluZyB0aGUgZHJvcGRvd24gYW5kIGJlZm9yZSB0YWtpbmcgaW5wdXRcbiAgICAgICAgZmlsdGVyVHlwZXMoJycpO1xuICAgICAgICBmaWx0ZXJTZWxlY3RlZFR5cGVzKCk7XG4gICAgICAgIGZpbHRlclR5cGVIZWFkZXJzKCk7XG4gICAgfVxufVxuXG5leHBvcnQgY29uc3QgaGlkZVR5cGVzRHJvcERvd24gPSAoKSA9PiB7XG4gICAgaWYgKCFlbGVtZW50cy5hcGlTZWFyY2gudHlwZURyb3BEb3duLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIHtcbiAgICAgICAgZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVMaW5lLnZhbHVlID0gJyc7XG4gICAgICAgIGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlRHJvcERvd24uc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpOyAgICAgICAgXG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBuYXZpZ2F0ZVR5cGVzRHJvcERvd24pO1xuICAgIH1cbn1cblxuZXhwb3J0IGNvbnN0IGZpbHRlclR5cGVIZWFkZXJzID0gKCkgPT4ge1xuICAgIC8vIE9uIGV2ZXJ5IGlucHV0IGludG8gdGhlIHR5cGVsaW5lIGJhciwgbWFrZSBhbGwgaGVhZGVycyB2aXNpYmxlXG4gICAgY29uc3QgaGVhZGVycyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS10eXBlcy1jYXRlZ29yeS1oZWFkZXInKSk7XG4gICAgaGVhZGVycy5mb3JFYWNoKGhlYWRlciA9PiB7XG4gICAgICAgIGlmIChoZWFkZXIuaGFzQXR0cmlidXRlKCdoaWRkZW4nKSkgaGVhZGVyLnJlbW92ZUF0dHJpYnV0ZSgnaGlkZGVuJylcbiAgICB9KVxuXG4gICAgLy8gRm9yIGVhY2ggY2F0ZWdvcnkgb2YgdHlwZSwgaWYgdGhlcmUgYXJlIG5vdCBhbnkgdmlzaWJsZSBiZWNhdXNlIHRoZXkgd2VyZSBmaWx0ZXJlZCBvdXRcbiAgICAvLyBoaWRlIHRoZSBoZWFkZXIgZm9yIHRoYXQgY2F0ZWdvcnkgICAgXG4gICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWJhc2ljOm5vdChbaGlkZGVuXSknKSkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWJhc2ljLWhlYWRlcicpLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICB9XG5cbiAgICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tc3VwZXI6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tc3VwZXItaGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cblxuICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcnRpZmFjdDpub3QoW2hpZGRlbl0pJykpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcnRpZmFjdC1oZWFkZXInKS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gICAgfVxuXG4gICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWVuY2hhbnRtZW50Om5vdChbaGlkZGVuXSknKSkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWVuY2hhbnRtZW50LWhlYWRlcicpLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICB9XG5cbiAgICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tbGFuZDpub3QoW2hpZGRlbl0pJykpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1sYW5kLWhlYWRlcicpLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICB9XG5cbiAgICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tc3BlbGw6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tc3BlbGwtaGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cblxuICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1wbGFuZXN3YWxrZXI6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tcGxhbmVzd2Fsa2VyLWhlYWRlcicpLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICB9XG5cbiAgICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tY3JlYXR1cmU6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tY3JlYXR1cmUtaGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cbn07XG5cbmV4cG9ydCBjb25zdCBmaWx0ZXJTZWxlY3RlZFR5cGVzID0gKCkgPT4ge1xuICAgIGNvbnN0IHR5cGVzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAnW2RhdGEtdHlwZV1bZGF0YS1zZWxlY3RlZF0nXG4gICAgKSk7XG5cbiAgICB0eXBlcy5mb3JFYWNoKHR5cGUgPT4ge1xuICAgICAgICBpZiAodHlwZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2VsZWN0ZWQnKSA9PT0gJ3RydWUnKSB7XG4gICAgICAgICAgICBpZiAoIXR5cGUuaGFzQXR0cmlidXRlKCdoaWRkZW4nKSkgdHlwZS5zZXRBdHRyaWJ1dGUoXG4gICAgICAgICAgICAgICAgJ2hpZGRlbicsICd0cnVlJ1xuICAgICAgICAgICAgKVxuICAgICAgICB9XG4gICAgfSlcbn07XG5cbmV4cG9ydCBjb25zdCBmaWx0ZXJUeXBlcyA9IHN0ciA9PiB7XG4gICAgY29uc3QgdHlwZXMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLXR5cGVdJykpO1xuXG4gICAgLy8gUmVtb3ZlIHRoZSBoaWRkZW4gYXR0cmlidXRlIGlmIGl0IGV4aXN0cyBvbiBhbnkgZWxlbWVudCwgYW5kIHRoZW4gaGlkZSBhbnkgZWxlbWVudHNcbiAgICAvLyB0aGF0IGRvbid0IGluY2x1ZGUgdGhlIHN0cmluZyBnaXZlbiBpbiB0aGUgaW5wdXQgZnJvbSB0aGUgdXNlclxuICAgIHR5cGVzLmZvckVhY2godHlwZSA9PiB7XG4gICAgICAgIGlmICh0eXBlLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIHR5cGUucmVtb3ZlQXR0cmlidXRlKCdoaWRkZW4nKTtcbiAgICAgICAgaWYgKCF0eXBlLmdldEF0dHJpYnV0ZSgnZGF0YS10eXBlJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzdHIudG9Mb3dlckNhc2UoKSkpIHtcbiAgICAgICAgICAgIHR5cGUuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgICAgICB9XG4gICAgfSkgICAgXG5cbiAgICBmaWx0ZXJTZWxlY3RlZFR5cGVzKCk7XG59XG5cbmV4cG9ydCBjb25zdCBoaWdobGlnaHRUeXBlID0gdHlwZSA9PiB7XG4gICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taGlnaGxpZ2h0ZWQnKSkgcmVtb3ZlQ3VycmVudEhpZ2hsaWdodCgpO1xuXG4gICAgaWYgKHR5cGUpIHtcbiAgICAgICAgdHlwZS5jbGFzc0xpc3QuYWRkKFxuICAgICAgICAgICAgJ2pzLS1oaWdobGlnaHRlZCcsICdzZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1vcHRpb24tLWhpZ2hsaWdodGVkJ1xuICAgICAgICApO1xuICAgIH1cbn07XG5cbmV4cG9ydCBjb25zdCByZW1vdmVDdXJyZW50SGlnaGxpZ2h0ID0gKCkgPT4ge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taGlnaGxpZ2h0ZWQnKS5jbGFzc0xpc3QucmVtb3ZlKFxuICAgICAgICAnanMtLWhpZ2hsaWdodGVkJywgJ3NlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0LW9wdGlvbi0taGlnaGxpZ2h0ZWQnXG4gICAgKTtcbn07XG5cbmV4cG9ydCBjb25zdCBzZXRTY3JvbGxUb3BPbkRvd25BcnJvdyA9IChlbCwgZHJvcGRvd24pID0+IHtcbiAgICBpZiAoZWwub2Zmc2V0VG9wID4gZHJvcGRvd24ub2Zmc2V0SGVpZ2h0IC0gZWwub2Zmc2V0SGVpZ2h0ICYmXG4gICAgICBkcm9wZG93bi5zY3JvbGxUb3AgKyBkcm9wZG93bi5vZmZzZXRIZWlnaHQgLSBlbC5vZmZzZXRIZWlnaHQgPCBlbC5vZmZzZXRUb3ApIHtcbiAgICAgICAgZHJvcGRvd24uc2Nyb2xsVG9wID0gZWwub2Zmc2V0VG9wIC0gXG4gICAgICAgICAgZHJvcGRvd24ub2Zmc2V0SGVpZ2h0ICsgZWwub2Zmc2V0SGVpZ2h0O1xuICAgIH1cbn1cblxuZXhwb3J0IGNvbnN0IHNldFNjcm9sbFRvcE9uVXBBcnJvdyA9IChlbCwgZHJvcGRvd24pID0+IHtcbiAgICBpZiAoZWwub2Zmc2V0VG9wIDwgZHJvcGRvd24uc2Nyb2xsVG9wKSB7XG4gICAgICAgIGRyb3Bkb3duLnNjcm9sbFRvcCA9IGVsLm9mZnNldFRvcDtcblxuICAgICAgICAvLyAzMCBpcyB0aGUgaGVpZ2h0IG9mIGNhdGVnb3J5IGhlYWRlcnMuIElmIHRoZSBjYXRlZ29yeSBoZWFkZXIgaXMgXG4gICAgICAgIC8vIHRoZSBvbmx5IGVsZW1lbnQgbGVmdCB0aGF0IGlzIG5vdCByZXZlYWxlZCwgc2V0IHRlaCBzY3JvbGwgdG9wIHRvIDBcbiAgICAgICAgaWYgKGRyb3Bkb3duLnNjcm9sbFRvcCA8PSAzMCkgZHJvcGRvd24uc2Nyb2xsVG9wID0gMDtcbiAgICB9XG59XG5cbmV4cG9ydCBjb25zdCBuYXZpZ2F0ZVR5cGVzRHJvcERvd24gPSBlID0+IHtcbiAgICBjb25zdCB0eXBlcyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS10eXBlOm5vdChbaGlkZGVuXSknKSk7XG4gICAgY29uc3QgaSA9IHR5cGVzLmluZGV4T2YoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1oaWdobGlnaHRlZCcpKTtcblxuICAgIGlmIChlLmNvZGUgPT09ICdBcnJvd0Rvd24nICYmIGkgPCB0eXBlcy5sZW5ndGggLSAxKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgcmVtb3ZlQ3VycmVudEhpZ2hsaWdodCgpO1xuICAgICAgICBoaWdobGlnaHRUeXBlKHR5cGVzW2kgKyAxXSk7XG5cbiAgICAgICAgc2V0U2Nyb2xsVG9wT25Eb3duQXJyb3codHlwZXNbaSArIDFdLCBlbGVtZW50cy5hcGlTZWFyY2gudHlwZURyb3BEb3duKTtcbiAgICB9XG5cbiAgICBpZiAoZS5jb2RlID09PSAnQXJyb3dVcCcpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBcbiAgICAgICAgLy8gV2UgYWx3YXlzIHdhbnQgdG8gcHJldmVudCB0aGUgZGVmYXVsdC4gV2Ugb25seSB3YW50IHRvIGNoYW5nZSB0aGVcbiAgICAgICAgLy8gaGlnaGxpZ2h0IGlmIG5vdCBvbiB0aGUgdG9wIHR5cGUgaW4gdGhlIGRyb3Bkb3duXG4gICAgICAgIGlmIChpID4gMCkge1xuICAgICAgICAgICAgcmVtb3ZlQ3VycmVudEhpZ2hsaWdodCgpXG4gICAgICAgICAgICBoaWdobGlnaHRUeXBlKHR5cGVzW2kgLSAxXSk7XG4gICAgXG4gICAgICAgICAgICBzZXRTY3JvbGxUb3BPblVwQXJyb3coXG4gICAgICAgICAgICAgICAgdHlwZXNbaSAtIDFdLCBlbGVtZW50cy5hcGlTZWFyY2gudHlwZURyb3BEb3duXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGUuY29kZSA9PT0gJ0VudGVyJykge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgdG9nZ2xlRGF0YVNlbGVjdGVkKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taGlnaGxpZ2h0ZWQnKSk7XG4gICAgICAgIGFkZFR5cGUoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1oaWdobGlnaHRlZCcpLmdldEF0dHJpYnV0ZSgnZGF0YS10eXBlJykpO1xuICAgICAgICBoaWRlVHlwZXNEcm9wRG93bigpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNvbnN0IGhvdmVyT3ZlclR5cGVzTGlzdGVuZXIgPSAoKSA9PiB7XG4gICAgY29uc3QgdHlwZXMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tdHlwZTpub3QoW2hpZGRlbl0pJykpO1xuXG4gICAgdHlwZXMuZm9yRWFjaCh0eXBlID0+IHtcbiAgICAgICAgdHlwZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgKCkgPT4gaGlnaGxpZ2h0VHlwZSh0eXBlKSk7XG4gICAgfSlcbn1cblxuZXhwb3J0IGNvbnN0IHN0YXJ0VHlwZXNEcm9wRG93bk5hdmlnYXRpb24gPSAoKSA9PiB7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG5hdmlnYXRlVHlwZXNEcm9wRG93bik7XG4gICAgY29uc3QgZmlyc3RUeXBlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS10eXBlOm5vdChbaGlkZGVuXSknKTtcbiAgICBoaWdobGlnaHRUeXBlKGZpcnN0VHlwZSk7XG4gICAgaG92ZXJPdmVyVHlwZXNMaXN0ZW5lcigpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBuYXZpZ2F0ZVR5cGVzRHJvcERvd24pO1xuICAgIGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlRHJvcERvd24uc2Nyb2xsVG9wID0gMDtcbn1cblxuY29uc3QgcmVtb3ZlVHlwZUJ0biA9ICgpID0+IHtcbiAgICAvLyBTcGFuIHdpbGwgYWN0IGFzIHRoZSBidXR0b24gdG8gcmVtb3ZlIHR5cGVzIGZyb20gdGhlIFwic2VsZWN0ZWRcIiBsaXN0XG4gICAgY29uc3QgYnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgIGJ0bi5jbGFzc0xpc3QgPSAnc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLXJlbW92ZS1idG4ganMtLWFwaS10eXBlcy1jbG9zZS1idG4nO1xuICAgIGJ0bi5pbm5lckhUTUwgPSAneCc7XG5cbiAgICBidG4ub25jbGljayA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgdHlwZU5hbWUgPSBidG4ubmV4dEVsZW1lbnRTaWJsaW5nLm5leHRFbGVtZW50U2libGluZy5pbm5lckhUTUw7XG4gICAgICAgIFxuICAgICAgICBjb25zdCB0eXBlVG9Ub2dnbGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbZGF0YS10eXBlfD0ke3R5cGVOYW1lfV1gKVxuXG4gICAgICAgIHRvZ2dsZURhdGFTZWxlY3RlZCh0eXBlVG9Ub2dnbGUpO1xuXG4gICAgICAgIGJ0bi5wYXJlbnRFbGVtZW50LnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQoYnRuLnBhcmVudEVsZW1lbnQpXG4gICAgfVxuXG4gICAgcmV0dXJuIGJ0bjtcbn1cblxuY29uc3QgdHlwZVRvZ2dsZUJ0biA9ICgpID0+IHtcbiAgICAvLyBTcGFuIHdpbGwgYWN0IGFzIHRoZSBidXR0b24gdG8gdG9nZ2xlIHdoZXRoZXIgb3Igbm90IGEgdHlwZSBpcyBpbmNsdWRlZCBvciBleGNsdWRlZCBmcm9tIHRoZSBzZWFyY2hcbiAgICBjb25zdCBidG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgYnRuLmNsYXNzTGlzdCA9ICdzZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlciBzZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlci0taXMganMtLWFwaS10eXBlcy10b2dnbGVyJztcbiAgICBidG4uaW5uZXJIVE1MID0gJ0lTJztcblxuICAgIC8qXG4gICAgICAgIFRoaXMgd2lsbCB0b2dnbGUgYmV0d2VlbiBzZWFyY2hpbmcgZm9yIGNhcmRzIHRoYXQgaW5jbHVkZSB0aGUgZ2l2ZW4gdHlwZSBhbmQgZXhjbHVkZSB0aGUgZ2l2ZW4gdHlwZS5cbiAgICAgICAgSXQgd2lsbCBtYWtlIHN1cmUgdGhhdCB0aGUgYXBwcm9wcmlhdGUgZGF0YSB0eXBlIGlzIGdpdmVuIHRvIHRoZSBzcGFuIGVsZW1lbnQgdGhhdCBjb250YWlucyB0aGUgdHlwZVxuICAgICAgICBTbyB0aGF0IHRoZSBzZWFyY2ggZnVuY3Rpb25hbGl0eSBjcmVhdGVzIHRoZSBhcHByb3ByaWF0ZSBxdWVyeSBzdHJpbmdcblxuICAgICovXG4gICAgYnRuLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIGlmIChidG4uaW5uZXJIVE1MID09PSAnSVMnKSB7XG4gICAgICAgICAgICBidG4uY2xhc3NMaXN0ID0gJ3NlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy10b2dnbGVyIHNlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy10b2dnbGVyLS1ub3QganMtLWFwaS10eXBlcy10b2dnbGVyJztcbiAgICAgICAgICAgIGJ0bi5uZXh0RWxlbWVudFNpYmxpbmcucmVtb3ZlQXR0cmlidXRlKCdkYXRhLWluY2x1ZGUtdHlwZScpO1xuICAgICAgICAgICAgYnRuLm5leHRFbGVtZW50U2libGluZy5zZXRBdHRyaWJ1dGUoJ2RhdGEtZXhjbHVkZS10eXBlJywgYnRuLm5leHRFbGVtZW50U2libGluZy5pbm5lckhUTUwpO1xuICAgICAgICAgICAgYnRuLmlubmVySFRNTCA9ICdOT1QnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnRuLmNsYXNzTGlzdCA9ICdzZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlciBzZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlci0taXMganMtLWFwaS10eXBlcy10b2dnbGVyJztcbiAgICAgICAgICAgIGJ0bi5uZXh0RWxlbWVudFNpYmxpbmcucmVtb3ZlQXR0cmlidXRlKCdkYXRhLWV4Y2x1ZGUtdHlwZScpO1xuICAgICAgICAgICAgYnRuLm5leHRFbGVtZW50U2libGluZy5zZXRBdHRyaWJ1dGUoJ2RhdGEtaW5jbHVkZS10eXBlJywgYnRuLm5leHRFbGVtZW50U2libGluZy5pbm5lckhUTUwpO1xuICAgICAgICAgICAgYnRuLmlubmVySFRNTCA9ICdJUyc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYnRuO1xufVxuXG5leHBvcnQgY29uc3QgdG9nZ2xlRGF0YVNlbGVjdGVkID0gdHlwZU9yU2V0ID0+IHtcbiAgICBpZiAodHlwZU9yU2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1zZWxlY3RlZCcpID09PSAndHJ1ZScpIHtcbiAgICAgICAgdHlwZU9yU2V0LnNldEF0dHJpYnV0ZSgnZGF0YS1zZWxlY3RlZCcsICdmYWxzZScpXG4gICAgfSBlbHNlIHtcbiAgICAgICAgdHlwZU9yU2V0LnNldEF0dHJpYnV0ZSgnZGF0YS1zZWxlY3RlZCcsICd0cnVlJylcbiAgICB9XG5cbn1cblxuY29uc3QgYWRkVHlwZSA9IHR5cGUgPT4ge1xuICAgIC8vIENyZWF0ZSB0aGUgZW1wdHkgbGkgZWxlbWVudCB0byBob2xkIHRoZSB0eXBlcyB0aGF0IHRoZSB1c2VyIHNlbGVjdHMuIFNldCB0aGUgY2xhc3MgbGlzdCxcbiAgICAvLyBhbmQgdGhlIGRhdGEtc2VsZWN0ZWQgYXR0cmlidXRlIHRvIHRydWUuXG4gICAgY29uc3QgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuICAgIGxpLmNsYXNzTGlzdCA9ICdzZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtbGlzdC1pdGVtIGpzLS1hcGktc2VsZWN0ZWQtdHlwZSc7XG5cbiAgICAvLyBUaGUgdHlwZVNwYW4gaG9sZHMgdGhlIHR5cGUgc2VsZWN0ZWQgYnkgdGhlIHVzZXIgZnJvbSB0aGUgZHJvcGRvd24uIFRoZSBkYXRhIGF0dHJpYnV0ZVxuICAgIC8vIGlzIHVzZWQgaW4gU2VhcmNoLmpzIHRvIGJ1aWxkIHRoZSBxdWVyeSBzdHJpbmdcbiAgICBjb25zdCB0eXBlU3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICB0eXBlU3Bhbi5zZXRBdHRyaWJ1dGUoJ2RhdGEtaW5jbHVkZS10eXBlJywgdHlwZSk7XG4gICAgdHlwZVNwYW4uaW5uZXJIVE1MID0gdHlwZTtcblxuICAgIC8vIENvbnN0cnVjdCB0aGUgbGkgZWxlbWVudC4gVGhlIHJlbW92ZVR5cGVCdG4gYW5kIHR5cGVUb2dnbGVCdG4gZnVuY2l0b25zIHJldHVybiBodG1sIGVsZW1lbnRzXG4gICAgbGkuYXBwZW5kQ2hpbGQocmVtb3ZlVHlwZUJ0bigpKTtcbiAgICBsaS5hcHBlbmRDaGlsZCh0eXBlVG9nZ2xlQnRuKCkpO1xuICAgIGxpLmFwcGVuZENoaWxkKHR5cGVTcGFuKTtcblxuICAgIGVsZW1lbnRzLmFwaVNlYXJjaC5zZWxlY3RlZFR5cGVzLmFwcGVuZENoaWxkKGxpKTtcbn1cblxuZXhwb3J0IGNvbnN0IHR5cGVMaW5lTGlzdGVuZXIgPSBlID0+IHtcbiAgICAvLyBJZiB0aGUgdGFyZ2V0IGlzIG5vdCBUeXBlIExpbmUgaW5wdXQgbGluZSwgb3IgYW4gZWxlbWVudCBpbiB0aGUgZHJvcGRvd24gbGlzdCwgXG4gICAgLy8gY2xvc2UgdGhlIGRyb3Bkb3duIGFuZCByZW1vdmUgdGhlIGV2ZW50IGxpc3RlbmVyXG4gICAgaWYgKGUudGFyZ2V0ICE9PSBlbGVtZW50cy5hcGlTZWFyY2gudHlwZUxpbmUgJiYgIWUudGFyZ2V0Lm1hdGNoZXMoJy5qcy0tYXBpLWRyb3Bkb3duLXR5cGVzLWxpc3QnKSkge1xuICAgICAgICBoaWRlVHlwZXNEcm9wRG93bigpOyAgICAgXG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdHlwZUxpbmVMaXN0ZW5lcikgIFxuICAgIC8vIElmIHRoZSB0YXJnZXQgaXMgb25lIGlmIHR5cGVzLCBnZXQgdGhlIGRhdGEgdHlwZVxuICAgIH0gZWxzZSBpZiAoZS50YXJnZXQuaGFzQXR0cmlidXRlKCdkYXRhLXR5cGUnKSkge1xuICAgICAgICB0b2dnbGVEYXRhU2VsZWN0ZWQoZS50YXJnZXQpO1xuICAgICAgICBhZGRUeXBlKGUudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS10eXBlJykpO1xuICAgICAgICBlbGVtZW50cy5hcGlTZWFyY2gudHlwZUxpbmUuZm9jdXMoKTtcbiAgICAgICAgaGlkZVR5cGVzRHJvcERvd24oKTtcblxuICAgIH1cbn1cblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqIFNFVFMgKioqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuXG5leHBvcnQgY29uc3Qgc2hvd1NldHNEcm9wRG93biA9ICgpID0+IHtcbiAgICBpZiAoZWxlbWVudHMuYXBpU2VhcmNoLnNldERyb3BEb3duLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIHtcbiAgICAgICAgZWxlbWVudHMuYXBpU2VhcmNoLnNldERyb3BEb3duLnJlbW92ZUF0dHJpYnV0ZSgnaGlkZGVuJyk7XG4gICAgICAgIGVsZW1lbnRzLmFwaVNlYXJjaC5zZXREcm9wRG93bi5zY3JvbGxUb3AgPSAwO1xuXG4gICAgICAgIGZpbHRlclNldHMoJycpO1xuICAgICAgICBmaWx0ZXJTZWxlY3RlZFNldHMoKTtcbiAgICAgICAgZmlsdGVyU2V0SGVhZGVycygpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNvbnN0IGhpZGVTZXRzRHJvcERvd24gPSAoKSA9PiB7XG4gICAgaWYgKCFlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd24uaGFzQXR0cmlidXRlKCdoaWRkZW4nKSkge1xuICAgICAgICBlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd24uc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgICAgICBlbGVtZW50cy5hcGlTZWFyY2guc2V0SW5wdXQudmFsdWUgPSAnJztcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG5hdmlnYXRlU2V0c0Ryb3BEb3duKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjb25zdCBmaWx0ZXJTZXRIZWFkZXJzID0gKCkgPT4ge1xuICAgIC8vIE9uIGV2ZXJ5IGlucHV0IGludG8gdGhlIHR5cGVsaW5lIGJhciwgbWFrZSBhbGwgaGVhZGVycyB2aXNpYmxlXG4gICAgY29uc3QgaGVhZGVycyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1zZXRzLWNhdGVnb3J5LWhlYWRlcicpKTtcbiAgICBoZWFkZXJzLmZvckVhY2goaGVhZGVyID0+IHtcbiAgICAgICAgaWYgKGhlYWRlci5oYXNBdHRyaWJ1dGUoJ2hpZGRlbicpKSBoZWFkZXIucmVtb3ZlQXR0cmlidXRlKCdoaWRkZW4nKVxuICAgIH0pXG5cbiAgICAvLyBGb3IgZWFjaCBjYXRlZ29yeSBvZiB0eXBlLCBpZiB0aGVyZSBhcmUgbm90IGFueSB2aXNpYmxlIGJlY2F1c2UgdGhleSB3ZXJlIGZpbHRlcmVkIG91dFxuICAgIC8vIGhpZGUgdGhlIGhlYWRlciBmb3IgdGhhdCBjYXRlZ29yeSAgICAgXG4gICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWV4cGFuc2lvbjpub3QoW2hpZGRlbl0pJykpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1leHBhbnNpb24taGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cblxuICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1jb3JlOm5vdChbaGlkZGVuXSknKSkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWNvcmUtaGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cblxuICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1tYXN0ZXJzOm5vdChbaGlkZGVuXSknKSkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLW1hc3RlcnMtaGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cblxuICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1kcmFmdDpub3QoW2hpZGRlbl0pJykpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1kcmFmdC1oZWFkZXInKS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gICAgfVxuXG4gICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWR1ZWxfZGVjazpub3QoW2hpZGRlbl0pJykpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1kdWVsX2RlY2staGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cblxuICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcmNoZW5lbXk6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXJjaGVuZW15LWhlYWRlcicpLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICB9XG5cbiAgICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYm94Om5vdChbaGlkZGVuXSknKSkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWJveC1oZWFkZXInKS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gICAgfVxuXG4gICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWNvbW1hbmRlcjpub3QoW2hpZGRlbl0pJykpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1jb21tYW5kZXItaGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cblxuICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS12YXVsdDpub3QoW2hpZGRlbl0pJykpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS12YXVsdC1oZWFkZXInKS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gICAgfVxuXG4gICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWZ1bm55Om5vdChbaGlkZGVuXSknKSkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWZ1bm55LWhlYWRlcicpLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICB9XG5cbiAgICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tbWFzdGVycGllY2U6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tbWFzdGVycGllY2UtaGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cblxuICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1tZW1vcmFiaWxpYTpub3QoW2hpZGRlbl0pJykpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1tZW1vcmFiaWxpYS1oZWFkZXInKS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gICAgfVxuXG4gICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXBsYW5lY2hhc2U6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tcGxhbmVjaGFzZS1oZWFkZXInKS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gICAgfVxuXG4gICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXByZW1pdW1fZGVjazpub3QoW2hpZGRlbl0pJykpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1wcmVtaXVtX2RlY2staGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cblxuICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1wcm9tbzpub3QoW2hpZGRlbl0pJykpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1wcm9tby1oZWFkZXInKS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gICAgfVxuXG4gICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXNwZWxsYm9vazpub3QoW2hpZGRlbl0pJykpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1zcGVsbGJvb2staGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cblxuICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1zdGFydGVyOm5vdChbaGlkZGVuXSknKSkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXN0YXJ0ZXItaGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cblxuICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS10b2tlbjpub3QoW2hpZGRlbl0pJykpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS10b2tlbi1oZWFkZXInKS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gICAgfVxuXG4gICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXRyZWFzdXJlX2NoZXN0Om5vdChbaGlkZGVuXSknKSkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXRyZWFzdXJlX2NoZXN0LWhlYWRlcicpLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICB9XG5cbiAgICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tdmFuZ3VhcmQ6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tdmFuZ3VhcmQtaGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNvbnN0IGZpbHRlclNldHMgPSBzdHIgPT4ge1xuICAgIC8vIGdldCBhbGwgb2YgdGhlIHNldHMgb3V0IG9mIHRoZSBkcm9wZG93biBsaXN0XG4gICAgY29uc3Qgc2V0cyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtc2V0LW5hbWVdJykpO1xuXG4gICAgLy8gUmVtb3ZlIHRoZSBoaWRkZW4gYXR0cmlidXRlIGlmIGl0IGV4aXN0cyBvbiBhbnkgZWxlbWVudCwgYW5kIHRoZW4gaGlkZSBhbnkgZWxlbWVudHNcbiAgICAvLyB0aGF0IGRvbid0IGluY2x1ZGUgdGhlIHN0cmluZyBnaXZlbiBpbiB0aGUgaW5wdXQgZnJvbSB0aGUgdXNlclxuICAgIHNldHMuZm9yRWFjaChzID0+IHsgICAgICAgIFxuICAgICAgICBpZiAocy5oYXNBdHRyaWJ1dGUoJ2hpZGRlbicpKSBzLnJlbW92ZUF0dHJpYnV0ZSgnaGlkZGVuJyk7XG5cbiAgICAgICAgZmlsdGVyU2VsZWN0ZWRTZXRzKCk7XG5cbiAgICAgICAgaWYgKCFzLmdldEF0dHJpYnV0ZSgnZGF0YS1zZXQtbmFtZScpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc3RyLnRvTG93ZXJDYXNlKCkpICYmXG4gICAgICAgICAgIXMuZ2V0QXR0cmlidXRlKCdkYXRhLXNldC1jb2RlJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzdHIudG9Mb3dlckNhc2UoKSkpIHsgICAgICAgICAgICBcbiAgICAgICAgICAgIHMuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgICAgICB9XG4gICAgfSlcbn1cblxuZXhwb3J0IGNvbnN0IGZpbHRlclNlbGVjdGVkU2V0cyA9ICgpID0+IHtcbiAgICBjb25zdCBzZXRzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1zZXQtbmFtZV1bZGF0YS1zZWxlY3RlZF0nKSk7XG5cbiAgICBzZXRzLmZvckVhY2gocyA9PiB7XG4gICAgICAgIGlmIChzLmdldEF0dHJpYnV0ZSgnZGF0YS1zZWxlY3RlZCcpID09PSAndHJ1ZScpIHtcbiAgICAgICAgICAgIGlmICghcy5oYXNBdHRyaWJ1dGUoJ2hpZGRlbicpKSBzLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICAgICAgfVxuICAgIH0pXG59XG5cbmV4cG9ydCBjb25zdCBoaWdobGlnaHRTZXQgPSBzZXR0ID0+IHtcbiAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1oaWdobGlnaHRlZCcpKSByZW1vdmVDdXJyZW50SGlnaGxpZ2h0KCk7XG5cbiAgICBpZiAoc2V0dCkge1xuICAgICAgICBzZXR0LmNsYXNzTGlzdC5hZGQoXG4gICAgICAgICAgICAnanMtLWhpZ2hsaWdodGVkJywgJ3NlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0LW9wdGlvbi0taGlnaGxpZ2h0ZWQnXG4gICAgICAgICk7XG4gICAgfVxufTtcblxuZXhwb3J0IGNvbnN0IG5hdmlnYXRlU2V0c0Ryb3BEb3duID0gZSA9PiB7XG4gICAgY29uc3Qgc2V0cyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1zZXQ6bm90KFtoaWRkZW5dKScpKTtcbiAgICBjb25zdCBpID0gc2V0cy5pbmRleE9mKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taGlnaGxpZ2h0ZWQnKSk7XG5cbiAgICBpZiAoZS5jb2RlID09PSAnQXJyb3dEb3duJyAmJiBpIDwgc2V0cy5sZW5ndGggLSAxKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgcmVtb3ZlQ3VycmVudEhpZ2hsaWdodCgpXG4gICAgICAgIGhpZ2hsaWdodFNldChzZXRzW2kgKyAxXSk7XG5cbiAgICAgICAgc2V0U2Nyb2xsVG9wT25Eb3duQXJyb3coc2V0c1tpICsgMV0sIGVsZW1lbnRzLmFwaVNlYXJjaC5zZXREcm9wRG93bik7XG4gICAgfVxuXG4gICAgaWYgKGUuY29kZSA9PT0gJ0Fycm93VXAnICYmIGkgPiAwKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgcmVtb3ZlQ3VycmVudEhpZ2hsaWdodCgpXG4gICAgICAgIGhpZ2hsaWdodFNldChzZXRzW2kgLSAxXSk7XG5cbiAgICAgICAgc2V0U2Nyb2xsVG9wT25VcEFycm93KHNldHNbaSAtIDFdLCBlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd24pO1xuICAgIH1cblxuICAgIGlmIChlLmNvZGUgPT09ICdFbnRlcicpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIHRvZ2dsZURhdGFTZWxlY3RlZChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWhpZ2hsaWdodGVkJykpO1xuICAgICAgICBhZGRTZXQoXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWhpZ2hsaWdodGVkJykuZ2V0QXR0cmlidXRlKCdkYXRhLXNldC1uYW1lJyksXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWhpZ2hsaWdodGVkJykuZ2V0QXR0cmlidXRlKCdkYXRhLXNldC1jb2RlJylcbiAgICAgICAgKTtcbiAgICAgICAgaGlkZVNldHNEcm9wRG93bigpO1xuICAgIH1cbn07XG5cbmV4cG9ydCBjb25zdCBob3Zlck92ZXJTZXRzTGlzdGVuZXIgPSAoKSA9PiB7XG4gICAgY29uc3Qgc2V0cyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1zZXQ6bm90KFtoaWRkZW5dKScpKTtcblxuICAgIHNldHMuZm9yRWFjaChzID0+IHtcbiAgICAgICAgcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgKCkgPT4gaGlnaGxpZ2h0VHlwZShzKSk7XG4gICAgfSlcbn1cblxuZXhwb3J0IGNvbnN0IHN0YXJ0U2V0c0Ryb3BEb3duTmF2aWdhdGlvbiA9ICgpID0+IHtcbiAgICBjb25zdCBmaXJzdFNldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tc2V0Om5vdChbaGlkZGVuXSknKTtcbiAgICBoaWdobGlnaHRTZXQoZmlyc3RTZXQpO1xuICAgIGhvdmVyT3ZlclNldHNMaXN0ZW5lcigpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBuYXZpZ2F0ZVNldHNEcm9wRG93bik7XG4gICAgZWxlbWVudHMuYXBpU2VhcmNoLnNldERyb3BEb3duLnNjcm9sbFRvcCA9IDA7XG59XG5cbmNvbnN0IHJlbW92ZVNldEJ0biA9ICgpID0+IHtcbiAgICAvLyBTcGFuIHdpbGwgYWN0IGFzIHRoZSBidXR0b24gdG8gcmVtb3ZlIHNldHMgZnJvbSB0aGUgXCJzZWxlY3RlZFwiIGxpc3RcbiAgICBjb25zdCBidG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgYnRuLmNsYXNzTGlzdCA9ICdzZWFyY2gtZm9ybV9fc2VsZWN0ZWQtc2V0cy1yZW1vdmUtYnRuIGpzLS1hcGktc2V0cy1jbG9zZS1idG4nO1xuICAgIGJ0bi5pbm5lckhUTUwgPSAneCc7XG5cbiAgICBidG4ub25jbGljayA9ICgpID0+IHtcbiAgICAgICAgY29uc3Qgc2V0TmFtZSA9IGJ0bi5uZXh0RWxlbWVudFNpYmxpbmcuaW5uZXJIVE1MOyAgICAgICAgXG4gICAgICAgIGNvbnN0IHNldFRvVG9nZ2xlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2RhdGEtc2V0LW5hbWV8PSR7c2V0TmFtZX1dYClcbiAgICAgICAgdG9nZ2xlRGF0YVNlbGVjdGVkKHNldFRvVG9nZ2xlKTtcblxuICAgICAgICBidG4ucGFyZW50RWxlbWVudC5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKGJ0bi5wYXJlbnRFbGVtZW50KVxuICAgIH1cblxuICAgIHJldHVybiBidG47XG59XG5cbmNvbnN0IGFkZFNldCA9IChzZXROYW1lLCBzZXRDb2RlKSA9PiB7XG4gICAgLy8gQ3JlYXRlIHRoZSBlbXB0eSBsaSBlbGVtZW50IHRvIGhvbGQgdGhlIHR5cGVzIHRoYXQgdGhlIHVzZXIgc2VsZWN0cy4gU2V0IHRoZSBjbGFzcyBsaXN0LFxuICAgIC8vIGFuZCB0aGUgZGF0YS1zZWxlY3RlZCBhdHRyaWJ1dGUgdG8gdHJ1ZS5cbiAgICBjb25zdCBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG4gICAgbGkuY2xhc3NMaXN0ID0gJ3NlYXJjaC1mb3JtX19zZWxlY3RlZC1zZXRzLWxpc3QtaXRlbSBqcy0tYXBpLXNlbGVjdGVkLXNldCc7XG5cbiAgICAvLyBUaGUgdHlwZVNwYW4gaG9sZHMgdGhlIHR5cGUgc2VsZWN0ZWQgYnkgdGhlIHVzZXIgZnJvbSB0aGUgZHJvcGRvd24uIFRoZSBkYXRhIGF0dHJpYnV0ZVxuICAgIC8vIGlzIHVzZWQgaW4gU2VhcmNoLmpzIHRvIGJ1aWxkIHRoZSBxdWVyeSBzdHJpbmdcbiAgICBjb25zdCBzZXRTcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgIHNldFNwYW4uc2V0QXR0cmlidXRlKCdkYXRhLWluY2x1ZGUtc2V0Jywgc2V0Q29kZSk7XG4gICAgc2V0U3Bhbi5pbm5lckhUTUwgPSBzZXROYW1lO1xuXG4gICAgbGkuYXBwZW5kQ2hpbGQocmVtb3ZlU2V0QnRuKCkpO1xuICAgIGxpLmFwcGVuZENoaWxkKHNldFNwYW4pO1xuXG4gICAgZWxlbWVudHMuYXBpU2VhcmNoLnNlbGVjdGVkU2V0cy5hcHBlbmRDaGlsZChsaSk7XG59XG5cbmV4cG9ydCBjb25zdCBzZXRJbnB1dExpc3RlbmVyID0gZSA9PiB7XG4gICAgLy8gSWYgdGhlIHRhcmdldCBpcyBub3QgdGhlIHNldCBpbnB1dCBmaWVsZCwgb3IgYW4gZWxlbWVudCBpbiB0aGUgZHJvcGRvd24gbGlzdCwgXG4gICAgLy8gY2xvc2UgdGhlIGRyb3Bkb3duIGFuZCByZW1vdmUgdGhlIGV2ZW50IGxpc3RlbmVyIFxuICAgIGlmIChlLnRhcmdldCAhPT0gZWxlbWVudHMuYXBpU2VhcmNoLnNldElucHV0ICYmIFxuICAgICAgIWUudGFyZ2V0Lm1hdGNoZXMoJy5qcy0tYXBpLWRyb3Bkb3duLXNldHMtbGlzdCcpKSB7XG4gICAgICAgIGhpZGVTZXRzRHJvcERvd24oKTtcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzZXRJbnB1dExpc3RlbmVyKTtcbiAgICAvLyBJZiB0aGUgdGFyZ2V0IGlzIG9uZSBvZiB0aGUgc2V0IG9wdGlvbnMsIHRvZ2dsZSBpdCBhcyBzZWxlY3RlZCwgYWRkIGl0IHRvIHRoZSBsaXN0LFxuICAgIC8vIGFuZCBoaWRlIHRoZSBkcm9wZG93bi5cbiAgICB9IGVsc2UgaWYgKGUudGFyZ2V0Lmhhc0F0dHJpYnV0ZSgnZGF0YS1zZXQtbmFtZScpKSB7XG4gICAgICAgIHRvZ2dsZURhdGFTZWxlY3RlZChlLnRhcmdldCk7XG4gICAgICAgIGFkZFNldChcbiAgICAgICAgICAgIGUudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1zZXQtbmFtZScpLFxuICAgICAgICAgICAgZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXNldC1jb2RlJylcbiAgICAgICAgKTtcbiAgICAgICAgZWxlbWVudHMuYXBpU2VhcmNoLnNldElucHV0LmZvY3VzKCk7XG4gICAgICAgIGhpZGVTZXRzRHJvcERvd24oKTtcbiAgICB9XG59XG5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKioqIFNUQVRTICoqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcblxuZXhwb3J0IGNvbnN0IHN0YXRMaW5lQ29udHJvbGxlciA9ICgpID0+IHtcbiAgICBpZiAoY2hlY2tTdGF0TGluZUZvckludGVnZXIoKSAmJiBjaGVja0Zvckxlc3NUaGFuRm91clN0YXRMaW5lcygpKSB7XG4gICAgICAgIGNvbnN0IGNsb25lID0gY3JlYXRlU3RhdHNDbG9uZSgpO1xuICAgICAgICBlZGl0U3RhdHNDbG9uZShjbG9uZSk7XG4gICAgICAgIGluc2VydFN0YXRzQ2xvbmUoY2xvbmUpO1xuICAgICAgICByZXNldFN0YXRMaW5lRXZlbnRMaXN0ZW5lcigpO1xuICAgIH1cbn07XG5cbmNvbnN0IGNoZWNrU3RhdExpbmVGb3JJbnRlZ2VyID0gKCkgPT4ge1xuICAgIGNvbnN0IHN0YXRWYWwgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICcuanMtLWFwaS1zdGF0LXZhbHVlJ1xuICAgICkpLnNsaWNlKC0xKVswXTtcblxuICAgIHJldHVybiAocGFyc2VJbnQoc3RhdFZhbC52YWx1ZSkgPj0gMCA/IHRydWUgOiBmYWxzZSk7XG59O1xuXG5jb25zdCBjaGVja0Zvckxlc3NUaGFuRm91clN0YXRMaW5lcyA9ICgpID0+IHtcbiAgICBjb25zdCBzdGF0cyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1hcGktc3RhdC12YWx1ZScpKTtcblxuICAgIHJldHVybiAoc3RhdHMubGVuZ3RoIDwgNCA/IHRydWUgOiBmYWxzZSk7XG59O1xuXG5jb25zdCBjcmVhdGVTdGF0c0Nsb25lID0gKCkgPT4ge1xuICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1zdGF0cy13cmFwcGVyJykuY2xvbmVOb2RlKHRydWUpOyBcbn07XG5cbmNvbnN0IGVkaXRTdGF0c0Nsb25lID0gY2xvbmUgPT4ge1xuICAgIGNsb25lLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXN0YXQnKS52YWx1ZSA9ICcnO1xuICAgIGNsb25lLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXN0YXQtZmlsdGVyJykudmFsdWUgPSAnJztcbiAgICBjbG9uZS5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1zdGF0LXZhbHVlJykudmFsdWUgPSAnJzsgICBcbn07XG5cbmNvbnN0IGluc2VydFN0YXRzQ2xvbmUgPSBjbG9uZSA9PiB7XG4gICAgY29uc3QgbGFzdFN0YXRMaW5lID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAnLmpzLS1hcGktc3RhdHMtd3JhcHBlcidcbiAgICApKS5zbGljZSgtMSlbMF07XG5cbiAgICBsYXN0U3RhdExpbmUuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdhZnRlcmVuZCcsIGNsb25lKTtcbn07XG5cbmNvbnN0IHJlc2V0U3RhdExpbmVFdmVudExpc3RlbmVyID0gKCkgPT4ge1xuICAgIGNvbnN0IHN0YXRWYWx1ZXMgPSBBcnJheS5mcm9tKFxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWFwaS1zdGF0LXZhbHVlJylcbiAgICApO1xuICAgIHN0YXRWYWx1ZXMuc2xpY2UoLTIpWzBdLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2lucHV0Jywgc3RhdExpbmVDb250cm9sbGVyKTtcbiAgICBzdGF0VmFsdWVzLnNsaWNlKC0xKVswXS5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIHN0YXRMaW5lQ29udHJvbGxlcik7XG59O1xuXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKiBMRUdBTCBTVEFUVVMgKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG5cblxuZXhwb3J0IGNvbnN0IGZvcm1hdExpbmVDb250cm9sbGVyID0gKCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKGNoZWNrRm9yRm91ckxlc3NUaGFuRm9ybWF0TGluZXMoKSlcbiAgICBpZiAoY2hlY2tGb3JGb3VyTGVzc1RoYW5Gb3JtYXRMaW5lcygpICYmIGNoZWNrRm9ybWF0TGluZUZvclZhbHVlKCkpIHtcbiAgICAgICAgY29uc3QgY2xvbmUgPSBjcmVhdGVGb3JtYXRDbG9uZSgpO1xuICAgICAgICBlZGl0Rm9ybWF0Q2xvbmUoY2xvbmUpO1xuICAgICAgICBpbnNlcnRGb3JtYXRDbG9uZShjbG9uZSk7XG4gICAgICAgIHJlc2V0Rm9ybWF0TGluZUV2ZW50TGlzdGVuZXIoKTtcbiAgICB9XG59O1xuXG5jb25zdCBjaGVja0Zvcm1hdExpbmVGb3JWYWx1ZSA9ICgpID0+IHtcbiAgICBjb25zdCBmb3JtYXQgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICcuanMtLWFwaS1mb3JtYXQnXG4gICAgKSkuc2xpY2UoLTEpWzBdO1xuXG4gICAgcmV0dXJuIChmb3JtYXQudmFsdWUgIT09ICcnID8gdHJ1ZSA6IGZhbHNlKTtcbn07XG5cbmNvbnN0IGNoZWNrRm9yRm91ckxlc3NUaGFuRm9ybWF0TGluZXMgPSAoKSA9PiB7XG4gICAgY29uc3QgZm9ybWF0cyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1hcGktZm9ybWF0JykpO1xuICAgIHJldHVybiAoZm9ybWF0cy5sZW5ndGggPCA0ID8gdHJ1ZSA6IGZhbHNlKTtcbn07XG5cbmNvbnN0IGNyZWF0ZUZvcm1hdENsb25lID0gKCkgPT4ge1xuICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1mb3JtYXQtd3JhcHBlcicpLmNsb25lTm9kZSh0cnVlKTtcbn07XG5cbmNvbnN0IGVkaXRGb3JtYXRDbG9uZSA9IGNsb25lID0+IHtcbiAgICBjbG9uZS5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1sZWdhbC1zdGF0dXMnKS52YWx1ZSA9ICcnO1xuICAgIGNsb25lLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLWZvcm1hdCcpLnZhbHVlID0gJyc7XG59O1xuXG5jb25zdCBpbnNlcnRGb3JtYXRDbG9uZSA9IGNsb25lID0+IHtcbiAgICBjb25zdCBsYXN0Rm9ybWF0TGluZSA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgJy5qcy0tYXBpLWZvcm1hdC13cmFwcGVyJ1xuICAgICkpLnNsaWNlKC0xKVswXTtcblxuICAgIGxhc3RGb3JtYXRMaW5lLmluc2VydEFkamFjZW50RWxlbWVudCgnYWZ0ZXJlbmQnLCBjbG9uZSk7XG59O1xuXG5jb25zdCByZXNldEZvcm1hdExpbmVFdmVudExpc3RlbmVyID0gKCkgPT4ge1xuICAgIGNvbnN0IGZvcm1hdHMgPSBBcnJheS5mcm9tKFxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWFwaS1mb3JtYXQnKVxuICAgICk7XG4gICAgZm9ybWF0cy5zbGljZSgtMilbMF0ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZm9ybWF0TGluZUNvbnRyb2xsZXIpO1xuICAgIGZvcm1hdHMuc2xpY2UoLTEpWzBdLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZvcm1hdExpbmVDb250cm9sbGVyKTtcbn07IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0aWYoX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSkge1xuXHRcdHJldHVybiBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0aWQ6IG1vZHVsZUlkLFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiBtb2R1bGVbJ2RlZmF1bHQnXSA6XG5cdFx0KCkgPT4gbW9kdWxlO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5nID0gKGZ1bmN0aW9uKCkge1xuXHRpZiAodHlwZW9mIGdsb2JhbFRoaXMgPT09ICdvYmplY3QnKSByZXR1cm4gZ2xvYmFsVGhpcztcblx0dHJ5IHtcblx0XHRyZXR1cm4gdGhpcyB8fCBuZXcgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JykgcmV0dXJuIHdpbmRvdztcblx0fVxufSkoKTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsInZhciBzY3JpcHRVcmw7XG5pZiAoX193ZWJwYWNrX3JlcXVpcmVfXy5nLmltcG9ydFNjcmlwdHMpIHNjcmlwdFVybCA9IF9fd2VicGFja19yZXF1aXJlX18uZy5sb2NhdGlvbiArIFwiXCI7XG52YXIgZG9jdW1lbnQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLmcuZG9jdW1lbnQ7XG5pZiAoIXNjcmlwdFVybCAmJiBkb2N1bWVudCkge1xuXHRpZiAoZG9jdW1lbnQuY3VycmVudFNjcmlwdClcblx0XHRzY3JpcHRVcmwgPSBkb2N1bWVudC5jdXJyZW50U2NyaXB0LnNyY1xuXHRpZiAoIXNjcmlwdFVybCkge1xuXHRcdHZhciBzY3JpcHRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJzY3JpcHRcIik7XG5cdFx0aWYoc2NyaXB0cy5sZW5ndGgpIHNjcmlwdFVybCA9IHNjcmlwdHNbc2NyaXB0cy5sZW5ndGggLSAxXS5zcmNcblx0fVxufVxuLy8gV2hlbiBzdXBwb3J0aW5nIGJyb3dzZXJzIHdoZXJlIGFuIGF1dG9tYXRpYyBwdWJsaWNQYXRoIGlzIG5vdCBzdXBwb3J0ZWQgeW91IG11c3Qgc3BlY2lmeSBhbiBvdXRwdXQucHVibGljUGF0aCBtYW51YWxseSB2aWEgY29uZmlndXJhdGlvblxuLy8gb3IgcGFzcyBhbiBlbXB0eSBzdHJpbmcgKFwiXCIpIGFuZCBzZXQgdGhlIF9fd2VicGFja19wdWJsaWNfcGF0aF9fIHZhcmlhYmxlIGZyb20geW91ciBjb2RlIHRvIHVzZSB5b3VyIG93biBsb2dpYy5cbmlmICghc2NyaXB0VXJsKSB0aHJvdyBuZXcgRXJyb3IoXCJBdXRvbWF0aWMgcHVibGljUGF0aCBpcyBub3Qgc3VwcG9ydGVkIGluIHRoaXMgYnJvd3NlclwiKTtcbnNjcmlwdFVybCA9IHNjcmlwdFVybC5yZXBsYWNlKC8jLiokLywgXCJcIikucmVwbGFjZSgvXFw/LiokLywgXCJcIikucmVwbGFjZSgvXFwvW15cXC9dKyQvLCBcIi9cIik7XG5fX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBzY3JpcHRVcmw7IiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGVcbl9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9qcy9pbmRleC5qc1wiKTtcbi8vIFRoaXMgZW50cnkgbW9kdWxlIHVzZWQgJ2V4cG9ydHMnIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbiJdLCJzb3VyY2VSb290IjoiIn0=