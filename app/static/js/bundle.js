/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/axios/index.js":
/*!*************************************!*\
  !*** ./node_modules/axios/index.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./lib/axios */ "./node_modules/axios/lib/axios.js");

/***/ }),

/***/ "./node_modules/axios/lib/adapters/xhr.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/adapters/xhr.js ***!
  \************************************************/
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

// Expose isAxiosError
axios.isAxiosError = __webpack_require__(/*! ./helpers/isAxiosError */ "./node_modules/axios/lib/helpers/isAxiosError.js");

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/Cancel.js":
/*!*************************************************!*\
  !*** ./node_modules/axios/lib/cancel/Cancel.js ***!
  \*************************************************/
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

/***/ "./node_modules/axios/lib/helpers/isAxiosError.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAxiosError.js ***!
  \********************************************************/
/***/ ((module) => {

"use strict";


/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
module.exports = function isAxiosError(payload) {
  return (typeof payload === 'object') && (payload.isAxiosError === true);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isURLSameOrigin.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isURLSameOrigin.js ***!
  \***********************************************************/
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
/* harmony import */ var _app_static_img_SVG_arrow_down2_svg__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../app/static/img/SVG/arrow-down2.svg */ "./app/static/img/SVG/arrow-down2.svg");
// Imports




var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default()));
var ___CSS_LOADER_URL_REPLACEMENT_0___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_app_static_img_SVG_arrow_down2_svg__WEBPACK_IMPORTED_MODULE_3__.default);
// Module
___CSS_LOADER_EXPORT___.push([module.id, "*,\n*::after,\n*::before {\n  margin: 0;\n  padding: 0;\n  box-sizing: inherit; }\n\nhtml {\n  font-size: 62.5%; }\n\nbody {\n  box-sizing: border-box;\n  font-size: 1.6rem;\n  background-size: cover;\n  background-repeat: no-repeat;\n  height: 127.5rem;\n  font-family: 'Lato', sans-serif;\n  position: relative; }\n\n[hidden] {\n  display: none !important; }\n\n.heading-tertiary {\n  font-size: 2.4rem;\n  text-transform: uppercase; }\n  .heading-tertiary--white {\n    color: #fff; }\n\n.heading-primary {\n  font-size: 3rem;\n  text-transform: uppercase;\n  font-weight: 300;\n  color: #fff; }\n\n.mb-10 {\n  margin-bottom: 1rem; }\n\n.mb-20 {\n  margin-bottom: 2rem; }\n\n.mt-50 {\n  margin-top: 5rem; }\n\n.btn, .btn:link, .btn:visited {\n  padding: .75rem 2rem;\n  border-radius: .5rem;\n  background-color: #f2f2f2;\n  font-weight: 400;\n  display: inline-block; }\n\n.btn:active, .btn:focus {\n  outline: none;\n  transform: translateY(-1px);\n  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.2); }\n\n.login,\n.register {\n  min-height: calc(100vh - 4.1rem);\n  width: 100vw;\n  background: linear-gradient(to top, #5f4f66, #342332);\n  background-repeat: no-repeat;\n  background-size: cover;\n  display: flex;\n  justify-content: center;\n  align-items: center; }\n  .login-img,\n  .register-img {\n    position: absolute;\n    border-radius: 100%;\n    height: 8.5rem;\n    width: 8.5rem;\n    top: -15%; }\n  .login__form,\n  .register__form {\n    position: relative;\n    background-color: #1e2a38;\n    border: 2px solid #1e2a38;\n    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.25);\n    max-width: 32rem;\n    display: flex;\n    flex-flow: column nowrap;\n    align-items: center;\n    padding: 4rem 0 2.6rem 0;\n    transform: translateY(-25%); }\n    @media only screen and (max-width: 75rem) {\n      .login__form,\n      .register__form {\n        transform: translateY(0); } }\n  .login__form-instructions,\n  .register__form-instructions {\n    color: #fff;\n    font-size: 1.4rem;\n    text-align: center;\n    margin-bottom: 1rem;\n    width: 90%; }\n  .login__form-group,\n  .register__form-group {\n    width: 90%; }\n  .login__form-input,\n  .register__form-input {\n    width: 100%;\n    margin: 0 auto;\n    border: 1px solid rgba(255, 255, 255, 0.2);\n    background-color: rgba(0, 0, 0, 0.1);\n    box-shadow: rgba(0, 0, 0, 0.5);\n    border-radius: 2px;\n    margin-bottom: 1rem;\n    line-height: 1.25;\n    text-align: center;\n    height: 4.2rem;\n    padding: 1rem 1.4rem;\n    caret-color: #fff;\n    color: rgba(255, 255, 255, 0.75); }\n    .login__form-input::placeholder,\n    .register__form-input::placeholder {\n      font-weight: 300;\n      color: #e6e6e6;\n      font-size: 1.8rem; }\n    .login__form-input:focus,\n    .register__form-input:focus {\n      border: 1px solid rgba(255, 255, 255, 0.75); }\n  .login__form-btn,\n  .register__form-btn {\n    width: 90%;\n    border-radius: 2px;\n    padding: 0 1.4rem;\n    margin: 1rem auto 0 auto;\n    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25);\n    cursor: pointer;\n    display: flex;\n    justify-content: space-around;\n    align-items: center;\n    height: 4.2rem; }\n    .login__form-btn--login,\n    .register__form-btn--login {\n      background-color: rgba(255, 255, 255, 0.87);\n      color: #16161d;\n      border: 1px solid #fff; }\n      .login__form-btn--login:hover,\n      .register__form-btn--login:hover {\n        background-color: #fff;\n        color: #342442; }\n      .login__form-btn--login:hover .login__form-icon-path--login,\n      .register__form-btn--login:hover .login__form-icon-path--login {\n        fill: #342442; }\n      .login__form-btn--login::after,\n      .register__form-btn--login::after {\n        margin-bottom: 1px solid white; }\n    .login__form-btn--register,\n    .register__form-btn--register {\n      text-decoration: none;\n      background-color: rgba(255, 255, 255, 0.1);\n      border: 1px solid rgba(255, 255, 255, 0.05);\n      color: rgba(255, 255, 255, 0.75); }\n      .login__form-btn--register:hover,\n      .register__form-btn--register:hover {\n        background-color: rgba(255, 255, 255, 0.25);\n        color: #fff; }\n      .login__form-btn--register:hover .login__form-icon-path--login,\n      .register__form-btn--register:hover .login__form-icon-path--login {\n        fill: #fff; }\n    .login__form-btn span,\n    .register__form-btn span {\n      margin-right: 1rem; }\n  .login__form-icon,\n  .register__form-icon {\n    height: 1.5rem;\n    width: 1.5rem;\n    transform: translateY(17%); }\n  .login__form-icon-path--login,\n  .register__form-icon-path--login {\n    fill: #16161d; }\n  .login__form-icon-path--register,\n  .register__form-icon-path--register {\n    fill: #fff; }\n  .login__form-hr,\n  .register__form-hr {\n    width: 90%;\n    margin: 2rem 0 1rem 0;\n    margin-bottom: 0.25px solid rgba(255, 255, 255, 0.25); }\n\n.nav {\n  display: flex;\n  align-items: center;\n  padding: 1rem 16%;\n  background-color: #2b253a;\n  border-bottom: 1px solid #000; }\n  @media only screen and (max-width: 75rem) {\n    .nav {\n      padding: 1.2rem 2.5%; } }\n  @media only screen and (max-width: 43.75em) {\n    .nav {\n      padding: 1rem; } }\n  .nav__left {\n    display: flex;\n    flex: 0 0 50%; }\n  .nav__right {\n    display: flex;\n    border-right: 1px solid #fff;\n    border-left: 1px solid #fff;\n    padding-left: 1rem;\n    margin-left: auto; }\n    @media only screen and (max-width: 40.625em) {\n      .nav__right {\n        display: none; } }\n    .nav__right > * {\n      margin-right: 1rem; }\n  .nav__item--search {\n    flex: 0 0 25%; }\n    @media only screen and (max-width: 40.625em) {\n      .nav__item--search {\n        display: none; } }\n  .nav__item--home {\n    margin-right: 3rem; }\n  .nav__link {\n    text-decoration: none;\n    color: rgba(255, 255, 255, 0.75);\n    transition: all 0.2s; }\n    .nav__link:hover {\n      margin-bottom: 2px;\n      color: #fff;\n      border-bottom: 1px solid #fff; }\n    .nav__link--home:hover .nav__icon-path--home {\n      fill: #fff; }\n  .nav__search {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    position: relative; }\n    .nav__search-input {\n      border: none;\n      padding: 1rem 2rem;\n      background-color: #2b253a;\n      caret-color: rgba(255, 255, 255, 0.75);\n      color: #fff; }\n      .nav__search-input::placeholder {\n        color: rgba(255, 255, 255, 0.75); }\n      .nav__search-input:focus {\n        outline: none; }\n    .nav__search-btn {\n      cursor: pointer;\n      position: absolute;\n      left: 2rem;\n      top: 1rem; }\n      .nav__search-btn:hover .nav__icon-path--search {\n        fill: #fff; }\n  .nav__icon-sizing--home {\n    width: 3rem;\n    height: 3rem; }\n  .nav__icon-sizing--search {\n    width: 2rem;\n    height: 2rem;\n    transform: translateX(-150%); }\n  .nav__icon-path--home {\n    fill: rgba(255, 255, 255, 0.75); }\n  .nav__icon-path--search {\n    fill: #bfbfbf; }\n  .nav__mobile {\n    display: none; }\n    @media only screen and (max-width: 40.625em) {\n      .nav__mobile {\n        display: flex;\n        flex: 0 0 50%;\n        align-items: center; } }\n    .nav__mobile-links {\n      background-color: #2b253a;\n      flex-flow: wrap;\n      padding: 1rem 0;\n      justify-content: flex-start;\n      display: none; }\n    .nav__mobile-link {\n      flex: 0 0 48%;\n      border: 1px solid rgba(85, 26, 139, 0.5);\n      border-color: rgba(255, 255, 255, 0.6);\n      background-color: rgba(255, 255, 255, 0.1);\n      border-radius: 3px;\n      margin-top: 0.6rem;\n      margin-left: 1%;\n      text-decoration: none;\n      color: #fff;\n      cursor: pointer;\n      line-height: 1.4;\n      padding: 0.2rem 1rem 0 1rem;\n      height: 2.8rem;\n      transition: all 0.2s;\n      box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06);\n      text-align: center;\n      transition: all 0.2s; }\n      .nav__mobile-link:hover {\n        background-color: rgba(255, 255, 255, 0.25); }\n    .nav__mobile-hamburger-wrapper {\n      display: flex;\n      align-items: center;\n      margin-right: 1rem;\n      height: 3rem;\n      width: 3rem;\n      margin-left: auto; }\n    .nav__mobile-hamburger {\n      position: relative; }\n      .nav__mobile-hamburger, .nav__mobile-hamburger::before, .nav__mobile-hamburger::after {\n        width: 3rem;\n        height: 2px;\n        background-color: rgba(255, 255, 255, 0.75);\n        display: inline-block; }\n      .nav__mobile-hamburger::before, .nav__mobile-hamburger::after {\n        content: '';\n        position: absolute;\n        left: 0; }\n      .nav__mobile-hamburger::before {\n        margin-top: -0.8rem; }\n      .nav__mobile-hamburger::after {\n        margin-top: 0.8rem; }\n\n.error {\n  margin-top: 2rem;\n  text-align: center;\n  background-color: #ff8080;\n  border-radius: 10px;\n  padding: 2rem;\n  font-size: 2rem;\n  grid-column: center-start / center-end;\n  font-weight: 700; }\n\n.search-form {\n  padding: 2rem 25rem;\n  background-color: #fdfdfd;\n  min-height: calc(100vh - 6.2rem); }\n  @media only screen and (max-width: 81.25em) {\n    .search-form {\n      padding: 2rem 15rem; } }\n  @media only screen and (max-width: 62.5em) {\n    .search-form {\n      padding: 2rem 5rem; } }\n  @media only screen and (max-width: 56.25em) {\n    .search-form {\n      padding: 2rem 1rem; } }\n  .search-form__group {\n    width: 75%;\n    display: flex;\n    margin-bottom: 3rem;\n    align-items: flex-start;\n    padding: 0.5rem 4rem 0.5rem 0;\n    border-bottom: 1px solid rgba(0, 0, 0, 0.2); }\n    @media only screen and (max-width: 93.75em) {\n      .search-form__group {\n        width: 100%; } }\n    @media only screen and (max-width: 46.875em) {\n      .search-form__group {\n        flex-direction: column; } }\n    .search-form__group:nth-child(10) {\n      border-bottom: none; }\n    .search-form__group--no-border {\n      border-bottom: none; }\n  .search-form__label {\n    flex: 0 0 20%;\n    display: flex;\n    align-items: flex-start;\n    font-weight: 300;\n    margin-top: 0.7rem;\n    color: #551a8b; }\n    @media only screen and (max-width: 46.875em) {\n      .search-form__label {\n        margin-bottom: 1.2rem;\n        margin-left: 1rem; } }\n  .search-form__group-input-wrapper {\n    flex: 0 0 80%; }\n    @media only screen and (max-width: 46.875em) {\n      .search-form__group-input-wrapper {\n        flex: 0 0 100%;\n        width: 100%; } }\n  .search-form__input-wrapper {\n    flex: 0 0 80%; }\n    @media only screen and (max-width: 46.875em) {\n      .search-form__input-wrapper {\n        flex: 0 0 100%;\n        width: 100%; } }\n  .search-form__tip {\n    font-size: 1rem;\n    line-height: 1.4;\n    width: 70%; }\n  .search-form__input-text {\n    width: 40rem;\n    height: 4rem;\n    margin-bottom: 1rem;\n    padding: 1rem;\n    border: solid 1px #bfbfbf;\n    border-radius: 5px; }\n    @media only screen and (max-width: 28.125em) {\n      .search-form__input-text {\n        width: 30rem; } }\n    @media only screen and (max-width: 21.875em) {\n      .search-form__input-text {\n        width: 20rem; } }\n    .search-form__input-text:focus {\n      border: solid 1px #000; }\n  .search-form__input-integer {\n    border: 1px solid #aeaeae;\n    height: 3.5rem;\n    border-radius: 3px;\n    padding-left: 0.5rem;\n    padding-right: 0.5rem;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06); }\n    .search-form__input-integer--relative {\n      position: relative; }\n    @media only screen and (max-width: 37.5em) {\n      .search-form__input-integer {\n        max-width: 30%; } }\n  .search-form__group--checkbox {\n    display: flex;\n    margin-bottom: 1rem; }\n  .search-form__group-colors-left, .search-form__group-colors-right {\n    display: flex; }\n    @media only screen and (max-width: 81.25em) {\n      .search-form__group-colors-left, .search-form__group-colors-right {\n        flex-direction: column; } }\n  @media only screen and (max-width: 81.25em) {\n    .search-form__group-colors-left {\n      margin-right: 3rem; } }\n  .search-form__group-rarity-left, .search-form__group-rarity-right {\n    display: flex; }\n    @media only screen and (max-width: 37.5em) {\n      .search-form__group-rarity-left, .search-form__group-rarity-right {\n        flex-direction: column; } }\n  @media only screen and (max-width: 81.25em) {\n    .search-form__group-rarity-left {\n      margin-right: 3rem; } }\n  .search-form__label--checkbox {\n    margin-right: 1rem; }\n  .search-form__input-checkbox {\n    width: 2.25rem;\n    height: 2.25rem;\n    margin-right: 0.8rem; }\n    @media only screen and (max-width: 93.75em) {\n      .search-form__input-checkbox {\n        margin-bottom: 0.3rem; } }\n  .search-form__checkbox-wrapper {\n    display: flex;\n    align-items: center; }\n  .search-form__select-menu {\n    margin-bottom: 1rem;\n    color: #343242;\n    margin-right: 1rem;\n    border: 1px solid #aeaeae;\n    border-radius: 3px;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06);\n    padding: 0 2.2rem 0 0.5rem;\n    height: 3.4rem;\n    font-size: 1.4rem;\n    text-indent: 0;\n    -webkit-appearance: none;\n    -moz-appearance: none;\n    text-overflow: '';\n    background-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\n    background-repeat: no-repeat;\n    background-position: right 0.8rem center;\n    background-size: 1.2rem 1rem;\n    background-color: #fff; }\n    @media only screen and (max-width: 81.25em) {\n      .search-form__select-menu {\n        margin-right: 0.3rem; } }\n    @media only screen and (max-width: 37.5em) {\n      .search-form__select-menu--2 {\n        max-width: 49%; } }\n    @media only screen and (max-width: 37.5em) {\n      .search-form__select-menu--3 {\n        max-width: 32%; } }\n  .search-form__svg-size {\n    height: 2rem;\n    width: 2rem;\n    margin-right: 1rem; }\n  .search-form__svg-color {\n    fill: #551a8b; }\n  .search-form__submit-wrapper {\n    position: sticky;\n    bottom: 0;\n    width: 100%;\n    display: flex;\n    margin-bottom: 3rem;\n    border-top: 1px solid rgba(0, 0, 0, 0.2);\n    align-items: flex-start;\n    padding: 1.5rem 4rem 1.5rem 0;\n    background-color: #fdfdfd;\n    z-index: 1; }\n  .search-form__submit {\n    border-radius: 3px;\n    padding: 0.7rem;\n    background-color: #f9f7f5;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    color: #551a8b;\n    font-weight: 500;\n    transition: all 0.2s;\n    margin-left: 20%; }\n    .search-form__submit:hover {\n      cursor: pointer;\n      background-color: #fff; }\n  .search-form__dropdown-span {\n    display: flex;\n    flex-direction: column; }\n  .search-form__selected-types, .search-form__selected-sets {\n    display: flex;\n    flex-direction: column;\n    list-style: none;\n    margin-bottom: 0.3rem; }\n  .search-form__selected-types-list-item, .search-form__selected-sets-list-item {\n    display: flex;\n    margin-bottom: 0.7rem; }\n  .search-form__selected-types-remove-btn, .search-form__selected-sets-remove-btn {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    cursor: pointer;\n    height: 2rem;\n    width: 2rem;\n    font-size: 1.3rem;\n    background-color: #f2f2f2;\n    margin-right: 0.7rem; }\n  .search-form__selected-types-toggler {\n    height: 2rem;\n    width: 2.75rem;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    cursor: pointer;\n    font-size: 1.3rem;\n    margin-right: 0.7rem; }\n    .search-form__selected-types-toggler--is {\n      background-color: #47d147; }\n    .search-form__selected-types-toggler--not {\n      background-color: #ff0000; }\n  .search-form__dropdown {\n    position: absolute;\n    max-height: 28rem;\n    background-color: #fff;\n    z-index: 2;\n    top: 100%;\n    width: 40rem;\n    margin-top: -1rem;\n    overflow-y: auto;\n    border: 1px solid #000; }\n    .search-form__dropdown-list {\n      list-style: none; }\n      .search-form__dropdown-list-category {\n        padding: 0.5rem; }\n      .search-form__dropdown-list-option {\n        padding: 0.3rem 2rem;\n        display: flex;\n        align-items: center; }\n        .search-form__dropdown-list-option:hover {\n          cursor: pointer; }\n        .search-form__dropdown-list-option--highlighted {\n          background-color: #ccd8ff; }\n        .search-form__dropdown-list-option span {\n          text-transform: uppercase;\n          margin-left: 1rem; }\n      .search-form__dropdown-list-img {\n        width: 2rem;\n        height: 2rem;\n        margin-right: 0.7rem; }\n\n.dropdown-wrapper {\n  position: relative; }\n\n.inv-search-price-msg {\n  position: absolute;\n  bottom: 0;\n  right: 0;\n  color: red; }\n\n.relative {\n  position: relative; }\n\n.api-results-display__nav {\n  background-color: #f3f5f8;\n  border-bottom: 1px solid rgba(99, 68, 150, 0.1);\n  width: 100%;\n  display: flex;\n  justify-content: space-between;\n  padding: 1.2rem 16%;\n  margin-bottom: 0.1rem;\n  height: 5.2rem; }\n  @media only screen and (max-width: 75rem) {\n    .api-results-display__nav {\n      padding: 1.2rem 2.5%; } }\n  @media only screen and (max-width: 53.125em) {\n    .api-results-display__nav {\n      display: none; } }\n  .api-results-display__nav-select {\n    color: #b300b3;\n    margin-right: 1rem;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    border-radius: 3px;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06);\n    padding: 0.1rem 2.2rem 0 0.5rem;\n    color: #551a8b;\n    height: 2.8rem;\n    font-size: 1.4rem;\n    text-indent: 0;\n    -webkit-appearance: none;\n    -moz-appearance: none;\n    text-overflow: '';\n    background-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\n    background-repeat: no-repeat;\n    background-position: right 0.8rem center;\n    background-size: 1.2rem 1rem; }\n    .api-results-display__nav-select:hover {\n      cursor: pointer;\n      background-color: #fff; }\n  .api-results-display__nav-label {\n    color: #551a8b; }\n  .api-results-display__nav-btn {\n    border-radius: 3px;\n    background-color: #f9f7f5;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    color: #551a8b;\n    font-weight: 500;\n    transition: all 0.2s;\n    height: 2.8rem;\n    padding: 0.1rem 0.7rem 0 0.7rem;\n    font-size: 1.4rem;\n    margin: auto 0;\n    text-align: center;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06); }\n    .api-results-display__nav-btn:hover {\n      cursor: pointer;\n      background-color: #fff; }\n  .api-results-display__nav-right {\n    display: flex;\n    align-items: center; }\n  .api-results-display__nav-pagination-container {\n    display: flex;\n    align-items: center;\n    background-color: #f9f7f5;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    color: #551a8b;\n    padding: 0.2rem 0.7rem;\n    cursor: pointer;\n    height: 2.8rem;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06); }\n    .api-results-display__nav-pagination-container:not(:last-child) {\n      margin-right: 1rem; }\n    .api-results-display__nav-pagination-container:nth-child(2) svg {\n      margin-right: 1rem; }\n    .api-results-display__nav-pagination-container:nth-child(3) svg {\n      margin-left: 1rem; }\n    .api-results-display__nav-pagination-container--disabled {\n      cursor: not-allowed;\n      color: rgba(0, 0, 0, 0.25);\n      background-color: #f5f6f7; }\n    @media only screen and (max-width: 31.5em) {\n      .api-results-display__nav-pagination-container {\n        margin: 0; } }\n  .api-results-display__nav-svg-size {\n    height: 2rem;\n    width: 2rem; }\n  .api-results-display__nav-svg-color {\n    fill: #551a8b; }\n\n.api-results-display__display-bar {\n  width: 100%;\n  border-bottom: 1px solid rgba(99, 68, 150, 0.1);\n  background-color: #f6f4fa;\n  color: #535353;\n  padding-left: 16%;\n  margin-bottom: 2rem;\n  height: 2.1rem; }\n  @media only screen and (max-width: 75rem) {\n    .api-results-display__display-bar {\n      padding-left: 2.5%; } }\n\n.api-results-display__mobile {\n  background-color: #f3f5f8;\n  border-bottom: 1px solid rgba(99, 68, 150, 0.1);\n  justify-content: space-between;\n  margin-bottom: 0.1rem;\n  height: 5.2rem;\n  display: none; }\n  @media only screen and (max-width: 53.125em) {\n    .api-results-display__mobile {\n      display: flex;\n      padding: 1.2rem 2.5%; } }\n  @media only screen and (max-width: 31.5em) {\n    .api-results-display__mobile {\n      padding: 1.2rem; } }\n  .api-results-display__mobile-svg-size {\n    width: 1.4rem;\n    height: 1.4rem; }\n\n.api-results-display__mobile-display-options {\n  background-color: #f3f5f8;\n  border-bottom: 1px solid rgba(99, 68, 150, 0.1);\n  flex-direction: column;\n  align-items: flex-start;\n  padding: 1.2rem 0;\n  display: none; }\n\n.api-results-display__mobile-display-options-group {\n  display: flex;\n  justify-content: space-between;\n  width: 45%;\n  margin: 0 auto 1rem auto; }\n  @media only screen and (max-width: 51.5625em) {\n    .api-results-display__mobile-display-options-group {\n      width: 60%; } }\n  @media only screen and (max-width: 37.5em) {\n    .api-results-display__mobile-display-options-group {\n      width: 80%; } }\n  @media only screen and (max-width: 28.125em) {\n    .api-results-display__mobile-display-options-group {\n      width: 95%; } }\n  .api-results-display__mobile-display-options-group label {\n    margin-right: 1rem; }\n\n.api-results-display__nav-select--mobile {\n  width: 24rem; }\n  @media only screen and (max-width: 21.875em) {\n    .api-results-display__nav-select--mobile {\n      width: 16rem; } }\n\n.api-results-mobile-display-btn {\n  align-self: center; }\n\n.wrapper {\n  overflow-x: scroll;\n  overflow-y: hidden;\n  position: relative;\n  display: flex;\n  margin: 0 auto;\n  width: 68%; }\n  @media only screen and (max-width: 75rem) {\n    .wrapper {\n      width: 90%; } }\n\n.card-checklist {\n  width: 100%;\n  justify-self: center; }\n  .card-checklist__row {\n    display: grid;\n    height: 3rem; }\n    .card-checklist__row--7 {\n      grid-template-columns: 10% 22.5% 10% 17.5% 15% 15% 10%; }\n    .card-checklist__row--9 {\n      grid-template-columns: repeat(9, 1fr); }\n    .card-checklist__row--header {\n      border-bottom: 1px solid #000;\n      color: #531a8b;\n      text-transform: uppercase;\n      font-size: 1.2rem !important;\n      font-weight: 200 !important; }\n    .card-checklist__row--grey {\n      background-color: #f2f2f2; }\n    .card-checklist__row:nth-child(even) {\n      background-color: #f2f2f2; }\n    .card-checklist__row--header {\n      height: 3.5rem; }\n  .card-checklist__data {\n    width: 100%;\n    display: flex;\n    flex-wrap: nowrap;\n    justify-content: flex-start;\n    font-size: 1.4rem; }\n    .card-checklist__data--set {\n      text-transform: uppercase;\n      padding-left: 0.5rem; }\n    .card-checklist__data--name {\n      justify-content: flex-start; }\n    .card-checklist__data--rarity {\n      text-transform: capitalize; }\n  .card-checklist__data-link {\n    padding: 1rem 0;\n    display: block;\n    text-decoration: none;\n    width: 100%;\n    color: #000;\n    white-space: nowrap;\n    overflow: hidden;\n    text-overflow: ellipsis; }\n    .card-checklist__data-link--price {\n      color: #006885; }\n\n.tooltip {\n  position: absolute;\n  z-index: 5;\n  width: 24rem;\n  height: 34rem; }\n  .tooltip__img {\n    width: 100%;\n    height: 100%; }\n\n.negative-earnings {\n  color: red; }\n\n.positive-earnings {\n  color: green; }\n\n.image-grid {\n  padding: 7rem 16%;\n  display: flex;\n  justify-content: space-between;\n  flex-wrap: wrap; }\n  @media only screen and (max-width: 75rem) {\n    .image-grid {\n      padding: 4rem 2.5%; } }\n  @media only screen and (max-width: 62.5em) {\n    .image-grid {\n      grid-column-gap: 1rem; } }\n  .image-grid__outer-div {\n    position: relative;\n    height: 100%; }\n  .image-grid__inner-div {\n    perspective: 150rem;\n    width: 100%;\n    height: 100%; }\n  .image-grid__double {\n    width: 100%;\n    height: 100%;\n    position: absolute;\n    top: 0;\n    left: 0;\n    backface-visibility: hidden;\n    overflow: hidden;\n    transition: all 0.8s ease; }\n    .image-grid__double--back {\n      transform: rotateY(180deg); }\n  .image-grid__double-btn {\n    position: absolute;\n    top: 26%;\n    left: 75%;\n    width: 4.4rem;\n    height: 4.4rem;\n    border-radius: 50%;\n    background-color: rgba(255, 255, 255, 0.6);\n    border: 2px solid #342442;\n    transition: all 0.2s;\n    display: flex;\n    justify-content: center;\n    align-items: center; }\n    .image-grid__double-btn:hover {\n      cursor: pointer;\n      background-color: #fff; }\n  .image-grid__double-btn-svg {\n    height: 2.5rem;\n    width: 2.5rem;\n    pointer-events: none; }\n  .image-grid__dobule-btn-svg-color {\n    color: #16161d; }\n  .image-grid__container {\n    width: 100%;\n    height: 100%; }\n  .image-grid__image {\n    width: 100%;\n    height: 100%;\n    box-shadow: 1px 1px 6px rgba(0, 0, 0, 0.45);\n    border-radius: 4.75% / 3.5%; }\n  .image-grid__link {\n    margin-bottom: 0.9rem;\n    width: 24.25%;\n    height: auto;\n    margin-bottom: 0.9rem;\n    page-break-after: auto;\n    page-break-before: auto;\n    page-break-inside: avoid;\n    display: block; }\n    @media only screen and (max-width: 59.375em) {\n      .image-grid__link {\n        width: 31.75%; } }\n    @media only screen and (max-width: 40.625em) {\n      .image-grid__link {\n        width: 47.25%; } }\n\n.card {\n  width: 100%;\n  max-width: 100rem;\n  padding: 0 16%;\n  display: flex;\n  margin-top: 3rem;\n  padding-bottom: 0.7rem;\n  border-bottom: 1px dashed rgba(0, 0, 0, 0.7); }\n  @media only screen and (max-width: 75rem) {\n    .card {\n      padding: 0 2.5% 0.7rem 2.5%; } }\n  @media only screen and (max-width: 62.5em) {\n    .card {\n      flex-direction: column;\n      align-items: center; } }\n  .card__img-container {\n    z-index: 2;\n    border-radius: 100%; }\n  .card__img {\n    width: 33rem;\n    height: 46rem;\n    box-shadow: 1px 1px 8px rgba(0, 0, 0, 0.5);\n    border-radius: 4.75% / 3.5%; }\n  .card__img-left {\n    width: 33rem;\n    display: flex;\n    flex-direction: column;\n    z-index: 2; }\n  .card__img-btn {\n    align-self: center;\n    margin-top: 1rem;\n    height: 2.8rem;\n    font-size: 1.4rem;\n    line-height: 1.8;\n    color: #551a8b;\n    background-color: #f9f7f5;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    border-radius: 3px;\n    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06);\n    transition: all 0.2s;\n    padding: 0.2rem 0.5rem;\n    text-align: center;\n    display: flex;\n    align-items: center; }\n    .card__img-btn:hover {\n      cursor: pointer;\n      background-color: #fff;\n      border-color: #634496; }\n  .card__img-svg {\n    height: 1.4rem;\n    width: 1.4rem;\n    margin-right: 0.3rem;\n    pointer-events: none; }\n    @media only screen and (max-width: 62.5em) {\n      .card__img-svg {\n        flex-direction: column; } }\n  .card__img-double-sided {\n    perspective: 150rem;\n    height: 46rem; }\n  .card__img-double {\n    width: 33rem;\n    height: 46rem;\n    position: absolute;\n    top: 0;\n    left: 0;\n    backface-visibility: hidden;\n    overflow: hidden; }\n    .card__img-double--back {\n      transform: rotateY(180deg); }\n  .card__text {\n    background-color: #fff;\n    border-radius: 4px;\n    border: 1px solid rgba(0, 0, 0, 0.25);\n    border-top: 3px solid #000;\n    border-bottom: 3px solid #000;\n    margin-top: 2rem;\n    width: 34rem;\n    display: flex;\n    flex-direction: column;\n    padding: 3rem;\n    margin-right: 3rem;\n    margin-left: -2rem; }\n    @media only screen and (max-width: 62.5em) {\n      .card__text {\n        margin: 1rem 0; } }\n    .card__text-flex {\n      margin-bottom: 1rem;\n      border-bottom: 1px solid #bfbfbf; }\n    .card__text-title {\n      display: flex;\n      align-items: center; }\n      .card__text-title-h3 {\n        font-size: 1.8rem;\n        font-weight: 400;\n        margin-right: 1rem; }\n    .card__text-color-indicator {\n      width: 1.3rem;\n      height: 1.3rem;\n      border: 1px solid #333;\n      border-radius: 50%;\n      box-shadow: 0px 0px 0px 2px rgba(0, 0, 0, 0.2);\n      margin-right: 0.7rem;\n      display: inline-block; }\n      .card__text-color-indicator--U {\n        background-color: rgba(128, 128, 255, 0.7); }\n      .card__text-color-indicator--B {\n        background-color: rgba(0, 0, 0, 0.7); }\n      .card__text-color-indicator--R {\n        background-color: rgba(255, 77, 77, 0.7); }\n      .card__text-color-indicator--W {\n        background-color: rgba(255, 255, 255, 0.7); }\n      .card__text-color-indicator--G {\n        background-color: rgba(0, 255, 0, 0.7); }\n    .card__text-oracle-p {\n      margin-bottom: 1rem;\n      font-size: 1.3rem; }\n    .card__text-oracle-flavor {\n      font-size: 1.3rem;\n      font-style: italic; }\n    .card__text-illustrator {\n      font-size: 1.2rem;\n      font-style: italic; }\n    .card__text-legal {\n      display: flex;\n      flex-direction: row;\n      justify-content: space-between; }\n      .card__text-legal-half {\n        display: flex;\n        flex-direction: column; }\n      .card__text-legal-span-container {\n        display: flex;\n        align-items: center;\n        font-size: 1.4rem; }\n        .card__text-legal-span-container:not(:last-child) {\n          margin-bottom: 0.5rem; }\n      .card__text-legal-span-box {\n        width: 6rem;\n        height: 2.5rem;\n        margin-right: 0.3rem;\n        font-size: 1rem;\n        text-transform: uppercase;\n        display: flex;\n        justify-content: center;\n        align-items: center;\n        border-radius: 3px; }\n        .card__text-legal-span-box--not_legal {\n          background-color: #e60000; }\n        .card__text-legal-span-box--legal {\n          background-color: #009900; }\n      .card__text-legal-span-box {\n        color: #fff; }\n  .card__set {\n    display: flex;\n    flex-direction: column; }\n    @media only screen and (max-width: 81.25em) {\n      .card__set {\n        width: 30rem; } }\n    .card__set-banner {\n      display: flex;\n      border: 1px solid #bfbfbf;\n      width: 40rem;\n      background-color: #49465c;\n      color: #fdfdfd;\n      padding: 0.7rem;\n      border-radius: 3px; }\n      @media only screen and (max-width: 81.25em) {\n        .card__set-banner {\n          width: 30rem; } }\n      .card__set-banner-svg-container {\n        margin-right: 1rem; }\n      .card__set-banner-svg {\n        width: 2.4rem;\n        height: 2.4rem;\n        filter: invert(100%); }\n    .card__set-details {\n      display: flex;\n      flex-direction: column; }\n    .card__set-header-name {\n      font-size: 1.7remrem; }\n    .card__set-header-code {\n      text-transform: uppercase; }\n    .card__set-prints-header {\n      display: flex;\n      justify-content: space-between;\n      background-color: #49465c;\n      color: #fdfdfd;\n      font-size: 1.3rem;\n      text-transform: uppercase;\n      border: 1px solid #bfbfbf;\n      border-radius: 3px;\n      padding: 0.3rem 0.7rem; }\n    .card__set-prints-svg-container {\n      height: 1.8rem;\n      width: 1.8rem;\n      border: 1px solid #bfbfbf;\n      display: flex;\n      justify-content: center;\n      align-items: center;\n      border-radius: 100%; }\n    .card__set-prints-svg--common {\n      fill: #000; }\n    .card__set-prints-svg--uncommon {\n      fill: #e6e6e6; }\n    .card__set-prints-svg--rare {\n      fill: #e6c300; }\n    .card__set-prints-svg--mythic {\n      fill: #ff0000; }\n    .card__set-prints-list {\n      list-style: none;\n      border-radius: 3px; }\n      .card__set-prints-list-link:link, .card__set-prints-list-link:visited {\n        text-decoration: none;\n        color: #000; }\n      .card__set-prints-list-item {\n        display: flex;\n        justify-content: space-between;\n        cursor: pointer;\n        border-bottom: 1px solid #e7e9ec;\n        border-left: 1px solid #cdcdcd;\n        background-color: #fff;\n        padding: 0.25rem 0; }\n        .card__set-prints-list-item--pl-14 {\n          padding-left: 1.4rem;\n          border-bottom: 3px solid #000; }\n        .card__set-prints-list-item:hover {\n          background-color: #f2f2f2; }\n      .card__set-prints-list-item-name-wrapper {\n        display: flex;\n        align-items: center;\n        margin-left: -1rem; }\n      .card__set-prints-list-item-set-name {\n        margin-left: 0.5rem; }\n      .card__set-prints-list-item-price {\n        margin-right: 0.7rem;\n        color: #006885; }\n\n.card-page {\n  display: flex;\n  flex-direction: column;\n  grid-column: 1 / -1;\n  position: relative; }\n\n.add-to-inv,\n.remove-from-inv {\n  margin-top: 3rem;\n  width: 50%;\n  margin-left: 50%;\n  transform: translateX(-50%);\n  display: flex;\n  flex-direction: column; }\n  @media only screen and (max-width: 62.5em) {\n    .add-to-inv,\n    .remove-from-inv {\n      width: 100%; } }\n  .add-to-inv__header,\n  .remove-from-inv__header {\n    color: #16161d;\n    font-size: 2.2rem;\n    font-weight: 300;\n    margin: 0 auto 1rem auto; }\n  .add-to-inv__form,\n  .remove-from-inv__form {\n    display: flex;\n    flex-direction: column; }\n    .add-to-inv__form-price,\n    .remove-from-inv__form-price {\n      width: 20rem;\n      height: 3.5rem;\n      margin-bottom: 1rem;\n      padding: 1rem;\n      border: solid 1px #bfbfbf;\n      border-radius: 5px; }\n      .add-to-inv__form-price:focus,\n      .remove-from-inv__form-price:focus {\n        border: solid 1px #000; }\n    .add-to-inv__form-group,\n    .remove-from-inv__form-group {\n      display: flex;\n      justify-content: space-evenly;\n      align-content: center;\n      margin-bottom: 1.5rem;\n      position: relative; }\n      @media only screen and (max-width: 31.5em) {\n        .add-to-inv__form-group,\n        .remove-from-inv__form-group {\n          flex-direction: column;\n          align-items: center; } }\n    .add-to-inv__form-label,\n    .remove-from-inv__form-label {\n      margin-right: 0.3rem;\n      display: flex;\n      align-content: center;\n      justify-content: center;\n      color: #16161d;\n      margin-top: 0.45rem; }\n      @media only screen and (max-width: 31.5em) {\n        .add-to-inv__form-label,\n        .remove-from-inv__form-label {\n          margin-bottom: 0.5rem; } }\n  .add-to-inv-price-msg,\n  .remove-from-inv-price-msg {\n    position: absolute;\n    bottom: -1.8rem;\n    right: 25%;\n    color: red; }\n  .add-to-inv__submit,\n  .remove-from-inv__submit {\n    align-self: center;\n    height: 3.1rem;\n    font-size: 1.4rem;\n    line-height: 1.8;\n    color: #551a8b;\n    background-color: #f9f7f5;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    border-radius: 3px;\n    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06);\n    transition: all 0.2s;\n    padding: 0.2rem 0.75rem;\n    text-align: center;\n    display: flex;\n    align-items: center;\n    margin-bottom: 1rem; }\n    .add-to-inv__submit:hover,\n    .remove-from-inv__submit:hover {\n      cursor: pointer;\n      background-color: #fff;\n      border-color: #634496; }\n\n.util-space::before,\n.util-space::after {\n  content: '';\n  margin: 0 0.2rem;\n  display: flex;\n  align-items: center; }\n\n.no-results {\n  justify-self: center; }\n\n.homepage {\n  background: linear-gradient(to bottom, #1d1c25, #431e3f);\n  background-repeat: no-repeat;\n  height: 100vh;\n  display: flex;\n  overflow-x: hidden !important;\n  justify-content: center;\n  position: relative;\n  background-size: cover; }\n  .homepage__center {\n    align-self: center;\n    display: flex;\n    flex-direction: column; }\n    @media only screen and (max-width: 28.125em) {\n      .homepage__center {\n        margin-top: -12rem; } }\n  @media only screen and (max-width: 40.625em) {\n    .homepage__center-heading-wrapper {\n      margin: 0 auto 0.5rem auto;\n      width: 75%;\n      display: flex;\n      justify-content: center;\n      text-align: center; } }\n  .homepage__search {\n    position: relative; }\n  .homepage__search-input {\n    padding: 1.2rem 1.4rem 1.2rem 6.2rem;\n    font-size: 3rem;\n    background-color: #242031;\n    color: #d7d7d7;\n    border-radius: 4px;\n    box-shadow: 0px 0px 0px 2px rgba(0, 0, 0, 0.5);\n    width: 100%;\n    border: 1px solid rgba(255, 255, 255, 0.5); }\n    .homepage__search-input::placeholder {\n      text-align: center; }\n    @media only screen and (max-width: 40.625em) {\n      .homepage__search-input {\n        width: 80%;\n        margin-left: 10%; } }\n  .homepage__search-btn {\n    position: absolute;\n    left: 6rem;\n    top: 2rem; }\n    @media only screen and (max-width: 40.625em) {\n      .homepage__search-btn {\n        left: 12rem; } }\n    @media only screen and (max-width: 28.125em) {\n      .homepage__search-btn {\n        left: 10rem; } }\n  .homepage__icon-sizing--search {\n    width: 3rem;\n    height: 3rem;\n    transform: translateX(-150%); }\n  .homepage__icon-path {\n    fill: #bfbfbf; }\n  .homepage__links {\n    display: flex;\n    justify-content: center; }\n    @media only screen and (max-width: 40.625em) {\n      .homepage__links {\n        flex-direction: column; } }\n    @media only screen and (max-width: 28.125em) {\n      .homepage__links {\n        margin-left: 7.5%; } }\n  .homepage__link {\n    text-decoration: none;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    border-color: rgba(255, 255, 255, 0.6);\n    border-radius: 3px;\n    color: #fff;\n    margin-top: 0.6rem;\n    margin-right: 3rem;\n    cursor: pointer;\n    line-height: 1.4;\n    padding: 0.2rem 1rem 0 1rem;\n    height: 2.8rem;\n    transition: all 0.2s;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06);\n    min-width: 9rem;\n    text-align: center; }\n    @media only screen and (max-width: 40.625em) {\n      .homepage__link {\n        align-self: center;\n        width: 14.5rem; } }\n    .homepage__link:hover {\n      background-color: rgba(255, 255, 255, 0.09); }\n\n.inventory-details {\n  grid-column: 1 / -1;\n  border-bottom: 1px solid rgba(99, 68, 150, 0.1);\n  background-color: #f6f4fa;\n  color: #535353;\n  padding: 1rem 16%;\n  margin-bottom: 2rem;\n  position: relative;\n  display: flex;\n  justify-content: space-between; }\n  .inventory-details__link {\n    text-decoration: none;\n    color: rgba(83, 83, 83, 0.75);\n    transition: all 0.2s;\n    padding: 0 0.6rem;\n    border-left: 1px solid #535353;\n    border-right: 1px solid #535353; }\n    .inventory-details__link:hover {\n      color: #535353; }\n  .inventory-details span {\n    color: #006885; }\n\n.homepage__colage,\n.cardpage__colage {\n  position: absolute;\n  overflow: hidden;\n  left: 0;\n  height: 15rem;\n  width: 100%; }\n\n.homepage__colage {\n  bottom: 0; }\n\n.cardpage__colage {\n  bottom: -2.6rem; }\n  @media only screen and (max-width: 62.5em) {\n    .cardpage__colage {\n      display: none; } }\n\n.homepage__colage-inner,\n.cardpage__colage-inner {\n  position: relative;\n  height: 100%;\n  margin-left: 50%;\n  transform: translateX(-50%);\n  width: 65.5rem; }\n\n.homepage__colage-card,\n.cardpage__colage-card {\n  width: 16.8rem;\n  height: 23.4rem;\n  position: absolute;\n  border-radius: 5% / 3.75%;\n  transform: translateY(0);\n  transition: all 0.3s;\n  box-shadow: inset 0 0 3px 3px #000; }\n  .homepage__colage-card:nth-child(1),\n  .cardpage__colage-card:nth-child(1) {\n    top: 2.2rem; }\n  .homepage__colage-card:nth-child(2),\n  .cardpage__colage-card:nth-child(2) {\n    top: 6.2rem;\n    left: 3.5rem; }\n  .homepage__colage-card:nth-child(3),\n  .cardpage__colage-card:nth-child(3) {\n    top: 1rem;\n    left: 17.4rem; }\n  .homepage__colage-card:nth-child(4),\n  .cardpage__colage-card:nth-child(4) {\n    top: 4.5rem;\n    left: 20.6rem; }\n  .homepage__colage-card:nth-child(5),\n  .cardpage__colage-card:nth-child(5) {\n    top: 1.6rem;\n    left: 34.7rem; }\n  .homepage__colage-card:nth-child(6),\n  .cardpage__colage-card:nth-child(6) {\n    top: 6.5rem;\n    left: 38rem; }\n  .homepage__colage-card:nth-child(7),\n  .cardpage__colage-card:nth-child(7) {\n    top: 3.5rem;\n    right: 0; }\n  .homepage__colage-card:hover,\n  .cardpage__colage-card:hover {\n    transform: translateY(-5%); }\n\n.container {\n  display: grid;\n  grid-template-columns: [full-start] minmax(6rem, 1fr) [center-start] repeat(8, [col-start] minmax(min-content, 14rem) [col-end]) [center-end] minmax(6rem, 1fr) [full-end];\n  background-color: #f5f6f7;\n  background-size: cover;\n  position: relative; }\n\n.search {\n  grid-column: full-start / full-end;\n  background-color: #fff; }\n\n.api-results-display {\n  grid-column: full-start / full-end;\n  background-color: #f5f6f7;\n  background-size: cover;\n  display: grid; }\n", "",{"version":3,"sources":["webpack://./src/css/style.css"],"names":[],"mappings":"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","sourcesContent":["*,\n*::after,\n*::before {\n  margin: 0;\n  padding: 0;\n  box-sizing: inherit; }\n\nhtml {\n  font-size: 62.5%; }\n\nbody {\n  box-sizing: border-box;\n  font-size: 1.6rem;\n  background-size: cover;\n  background-repeat: no-repeat;\n  height: 127.5rem;\n  font-family: 'Lato', sans-serif;\n  position: relative; }\n\n[hidden] {\n  display: none !important; }\n\n.heading-tertiary {\n  font-size: 2.4rem;\n  text-transform: uppercase; }\n  .heading-tertiary--white {\n    color: #fff; }\n\n.heading-primary {\n  font-size: 3rem;\n  text-transform: uppercase;\n  font-weight: 300;\n  color: #fff; }\n\n.mb-10 {\n  margin-bottom: 1rem; }\n\n.mb-20 {\n  margin-bottom: 2rem; }\n\n.mt-50 {\n  margin-top: 5rem; }\n\n.btn, .btn:link, .btn:visited {\n  padding: .75rem 2rem;\n  border-radius: .5rem;\n  background-color: #f2f2f2;\n  font-weight: 400;\n  display: inline-block; }\n\n.btn:active, .btn:focus {\n  outline: none;\n  transform: translateY(-1px);\n  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.2); }\n\n.login,\n.register {\n  min-height: calc(100vh - 4.1rem);\n  width: 100vw;\n  background: linear-gradient(to top, #5f4f66, #342332);\n  background-repeat: no-repeat;\n  background-size: cover;\n  display: flex;\n  justify-content: center;\n  align-items: center; }\n  .login-img,\n  .register-img {\n    position: absolute;\n    border-radius: 100%;\n    height: 8.5rem;\n    width: 8.5rem;\n    top: -15%; }\n  .login__form,\n  .register__form {\n    position: relative;\n    background-color: #1e2a38;\n    border: 2px solid #1e2a38;\n    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.25);\n    max-width: 32rem;\n    display: flex;\n    flex-flow: column nowrap;\n    align-items: center;\n    padding: 4rem 0 2.6rem 0;\n    transform: translateY(-25%); }\n    @media only screen and (max-width: 75rem) {\n      .login__form,\n      .register__form {\n        transform: translateY(0); } }\n  .login__form-instructions,\n  .register__form-instructions {\n    color: #fff;\n    font-size: 1.4rem;\n    text-align: center;\n    margin-bottom: 1rem;\n    width: 90%; }\n  .login__form-group,\n  .register__form-group {\n    width: 90%; }\n  .login__form-input,\n  .register__form-input {\n    width: 100%;\n    margin: 0 auto;\n    border: 1px solid rgba(255, 255, 255, 0.2);\n    background-color: rgba(0, 0, 0, 0.1);\n    box-shadow: rgba(0, 0, 0, 0.5);\n    border-radius: 2px;\n    margin-bottom: 1rem;\n    line-height: 1.25;\n    text-align: center;\n    height: 4.2rem;\n    padding: 1rem 1.4rem;\n    caret-color: #fff;\n    color: rgba(255, 255, 255, 0.75); }\n    .login__form-input::placeholder,\n    .register__form-input::placeholder {\n      font-weight: 300;\n      color: #e6e6e6;\n      font-size: 1.8rem; }\n    .login__form-input:focus,\n    .register__form-input:focus {\n      border: 1px solid rgba(255, 255, 255, 0.75); }\n  .login__form-btn,\n  .register__form-btn {\n    width: 90%;\n    border-radius: 2px;\n    padding: 0 1.4rem;\n    margin: 1rem auto 0 auto;\n    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25);\n    cursor: pointer;\n    display: flex;\n    justify-content: space-around;\n    align-items: center;\n    height: 4.2rem; }\n    .login__form-btn--login,\n    .register__form-btn--login {\n      background-color: rgba(255, 255, 255, 0.87);\n      color: #16161d;\n      border: 1px solid #fff; }\n      .login__form-btn--login:hover,\n      .register__form-btn--login:hover {\n        background-color: #fff;\n        color: #342442; }\n      .login__form-btn--login:hover .login__form-icon-path--login,\n      .register__form-btn--login:hover .login__form-icon-path--login {\n        fill: #342442; }\n      .login__form-btn--login::after,\n      .register__form-btn--login::after {\n        margin-bottom: 1px solid white; }\n    .login__form-btn--register,\n    .register__form-btn--register {\n      text-decoration: none;\n      background-color: rgba(255, 255, 255, 0.1);\n      border: 1px solid rgba(255, 255, 255, 0.05);\n      color: rgba(255, 255, 255, 0.75); }\n      .login__form-btn--register:hover,\n      .register__form-btn--register:hover {\n        background-color: rgba(255, 255, 255, 0.25);\n        color: #fff; }\n      .login__form-btn--register:hover .login__form-icon-path--login,\n      .register__form-btn--register:hover .login__form-icon-path--login {\n        fill: #fff; }\n    .login__form-btn span,\n    .register__form-btn span {\n      margin-right: 1rem; }\n  .login__form-icon,\n  .register__form-icon {\n    height: 1.5rem;\n    width: 1.5rem;\n    transform: translateY(17%); }\n  .login__form-icon-path--login,\n  .register__form-icon-path--login {\n    fill: #16161d; }\n  .login__form-icon-path--register,\n  .register__form-icon-path--register {\n    fill: #fff; }\n  .login__form-hr,\n  .register__form-hr {\n    width: 90%;\n    margin: 2rem 0 1rem 0;\n    margin-bottom: 0.25px solid rgba(255, 255, 255, 0.25); }\n\n.nav {\n  display: flex;\n  align-items: center;\n  padding: 1rem 16%;\n  background-color: #2b253a;\n  border-bottom: 1px solid #000; }\n  @media only screen and (max-width: 75rem) {\n    .nav {\n      padding: 1.2rem 2.5%; } }\n  @media only screen and (max-width: 43.75em) {\n    .nav {\n      padding: 1rem; } }\n  .nav__left {\n    display: flex;\n    flex: 0 0 50%; }\n  .nav__right {\n    display: flex;\n    border-right: 1px solid #fff;\n    border-left: 1px solid #fff;\n    padding-left: 1rem;\n    margin-left: auto; }\n    @media only screen and (max-width: 40.625em) {\n      .nav__right {\n        display: none; } }\n    .nav__right > * {\n      margin-right: 1rem; }\n  .nav__item--search {\n    flex: 0 0 25%; }\n    @media only screen and (max-width: 40.625em) {\n      .nav__item--search {\n        display: none; } }\n  .nav__item--home {\n    margin-right: 3rem; }\n  .nav__link {\n    text-decoration: none;\n    color: rgba(255, 255, 255, 0.75);\n    transition: all 0.2s; }\n    .nav__link:hover {\n      margin-bottom: 2px;\n      color: #fff;\n      border-bottom: 1px solid #fff; }\n    .nav__link--home:hover .nav__icon-path--home {\n      fill: #fff; }\n  .nav__search {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    position: relative; }\n    .nav__search-input {\n      border: none;\n      padding: 1rem 2rem;\n      background-color: #2b253a;\n      caret-color: rgba(255, 255, 255, 0.75);\n      color: #fff; }\n      .nav__search-input::placeholder {\n        color: rgba(255, 255, 255, 0.75); }\n      .nav__search-input:focus {\n        outline: none; }\n    .nav__search-btn {\n      cursor: pointer;\n      position: absolute;\n      left: 2rem;\n      top: 1rem; }\n      .nav__search-btn:hover .nav__icon-path--search {\n        fill: #fff; }\n  .nav__icon-sizing--home {\n    width: 3rem;\n    height: 3rem; }\n  .nav__icon-sizing--search {\n    width: 2rem;\n    height: 2rem;\n    transform: translateX(-150%); }\n  .nav__icon-path--home {\n    fill: rgba(255, 255, 255, 0.75); }\n  .nav__icon-path--search {\n    fill: #bfbfbf; }\n  .nav__mobile {\n    display: none; }\n    @media only screen and (max-width: 40.625em) {\n      .nav__mobile {\n        display: flex;\n        flex: 0 0 50%;\n        align-items: center; } }\n    .nav__mobile-links {\n      background-color: #2b253a;\n      flex-flow: wrap;\n      padding: 1rem 0;\n      justify-content: flex-start;\n      display: none; }\n    .nav__mobile-link {\n      flex: 0 0 48%;\n      border: 1px solid rgba(85, 26, 139, 0.5);\n      border-color: rgba(255, 255, 255, 0.6);\n      background-color: rgba(255, 255, 255, 0.1);\n      border-radius: 3px;\n      margin-top: 0.6rem;\n      margin-left: 1%;\n      text-decoration: none;\n      color: #fff;\n      cursor: pointer;\n      line-height: 1.4;\n      padding: 0.2rem 1rem 0 1rem;\n      height: 2.8rem;\n      transition: all 0.2s;\n      box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06);\n      text-align: center;\n      transition: all 0.2s; }\n      .nav__mobile-link:hover {\n        background-color: rgba(255, 255, 255, 0.25); }\n    .nav__mobile-hamburger-wrapper {\n      display: flex;\n      align-items: center;\n      margin-right: 1rem;\n      height: 3rem;\n      width: 3rem;\n      margin-left: auto; }\n    .nav__mobile-hamburger {\n      position: relative; }\n      .nav__mobile-hamburger, .nav__mobile-hamburger::before, .nav__mobile-hamburger::after {\n        width: 3rem;\n        height: 2px;\n        background-color: rgba(255, 255, 255, 0.75);\n        display: inline-block; }\n      .nav__mobile-hamburger::before, .nav__mobile-hamburger::after {\n        content: '';\n        position: absolute;\n        left: 0; }\n      .nav__mobile-hamburger::before {\n        margin-top: -0.8rem; }\n      .nav__mobile-hamburger::after {\n        margin-top: 0.8rem; }\n\n.error {\n  margin-top: 2rem;\n  text-align: center;\n  background-color: #ff8080;\n  border-radius: 10px;\n  padding: 2rem;\n  font-size: 2rem;\n  grid-column: center-start / center-end;\n  font-weight: 700; }\n\n.search-form {\n  padding: 2rem 25rem;\n  background-color: #fdfdfd;\n  min-height: calc(100vh - 6.2rem); }\n  @media only screen and (max-width: 81.25em) {\n    .search-form {\n      padding: 2rem 15rem; } }\n  @media only screen and (max-width: 62.5em) {\n    .search-form {\n      padding: 2rem 5rem; } }\n  @media only screen and (max-width: 56.25em) {\n    .search-form {\n      padding: 2rem 1rem; } }\n  .search-form__group {\n    width: 75%;\n    display: flex;\n    margin-bottom: 3rem;\n    align-items: flex-start;\n    padding: 0.5rem 4rem 0.5rem 0;\n    border-bottom: 1px solid rgba(0, 0, 0, 0.2); }\n    @media only screen and (max-width: 93.75em) {\n      .search-form__group {\n        width: 100%; } }\n    @media only screen and (max-width: 46.875em) {\n      .search-form__group {\n        flex-direction: column; } }\n    .search-form__group:nth-child(10) {\n      border-bottom: none; }\n    .search-form__group--no-border {\n      border-bottom: none; }\n  .search-form__label {\n    flex: 0 0 20%;\n    display: flex;\n    align-items: flex-start;\n    font-weight: 300;\n    margin-top: 0.7rem;\n    color: #551a8b; }\n    @media only screen and (max-width: 46.875em) {\n      .search-form__label {\n        margin-bottom: 1.2rem;\n        margin-left: 1rem; } }\n  .search-form__group-input-wrapper {\n    flex: 0 0 80%; }\n    @media only screen and (max-width: 46.875em) {\n      .search-form__group-input-wrapper {\n        flex: 0 0 100%;\n        width: 100%; } }\n  .search-form__input-wrapper {\n    flex: 0 0 80%; }\n    @media only screen and (max-width: 46.875em) {\n      .search-form__input-wrapper {\n        flex: 0 0 100%;\n        width: 100%; } }\n  .search-form__tip {\n    font-size: 1rem;\n    line-height: 1.4;\n    width: 70%; }\n  .search-form__input-text {\n    width: 40rem;\n    height: 4rem;\n    margin-bottom: 1rem;\n    padding: 1rem;\n    border: solid 1px #bfbfbf;\n    border-radius: 5px; }\n    @media only screen and (max-width: 28.125em) {\n      .search-form__input-text {\n        width: 30rem; } }\n    @media only screen and (max-width: 21.875em) {\n      .search-form__input-text {\n        width: 20rem; } }\n    .search-form__input-text:focus {\n      border: solid 1px #000; }\n  .search-form__input-integer {\n    border: 1px solid #aeaeae;\n    height: 3.5rem;\n    border-radius: 3px;\n    padding-left: 0.5rem;\n    padding-right: 0.5rem;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06); }\n    .search-form__input-integer--relative {\n      position: relative; }\n    @media only screen and (max-width: 37.5em) {\n      .search-form__input-integer {\n        max-width: 30%; } }\n  .search-form__group--checkbox {\n    display: flex;\n    margin-bottom: 1rem; }\n  .search-form__group-colors-left, .search-form__group-colors-right {\n    display: flex; }\n    @media only screen and (max-width: 81.25em) {\n      .search-form__group-colors-left, .search-form__group-colors-right {\n        flex-direction: column; } }\n  @media only screen and (max-width: 81.25em) {\n    .search-form__group-colors-left {\n      margin-right: 3rem; } }\n  .search-form__group-rarity-left, .search-form__group-rarity-right {\n    display: flex; }\n    @media only screen and (max-width: 37.5em) {\n      .search-form__group-rarity-left, .search-form__group-rarity-right {\n        flex-direction: column; } }\n  @media only screen and (max-width: 81.25em) {\n    .search-form__group-rarity-left {\n      margin-right: 3rem; } }\n  .search-form__label--checkbox {\n    margin-right: 1rem; }\n  .search-form__input-checkbox {\n    width: 2.25rem;\n    height: 2.25rem;\n    margin-right: 0.8rem; }\n    @media only screen and (max-width: 93.75em) {\n      .search-form__input-checkbox {\n        margin-bottom: 0.3rem; } }\n  .search-form__checkbox-wrapper {\n    display: flex;\n    align-items: center; }\n  .search-form__select-menu {\n    margin-bottom: 1rem;\n    color: #343242;\n    margin-right: 1rem;\n    border: 1px solid #aeaeae;\n    border-radius: 3px;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06);\n    padding: 0 2.2rem 0 0.5rem;\n    height: 3.4rem;\n    font-size: 1.4rem;\n    text-indent: 0;\n    -webkit-appearance: none;\n    -moz-appearance: none;\n    text-overflow: '';\n    background-image: url(../../app/static/img/SVG/arrow-down2.svg);\n    background-repeat: no-repeat;\n    background-position: right 0.8rem center;\n    background-size: 1.2rem 1rem;\n    background-color: #fff; }\n    @media only screen and (max-width: 81.25em) {\n      .search-form__select-menu {\n        margin-right: 0.3rem; } }\n    @media only screen and (max-width: 37.5em) {\n      .search-form__select-menu--2 {\n        max-width: 49%; } }\n    @media only screen and (max-width: 37.5em) {\n      .search-form__select-menu--3 {\n        max-width: 32%; } }\n  .search-form__svg-size {\n    height: 2rem;\n    width: 2rem;\n    margin-right: 1rem; }\n  .search-form__svg-color {\n    fill: #551a8b; }\n  .search-form__submit-wrapper {\n    position: sticky;\n    bottom: 0;\n    width: 100%;\n    display: flex;\n    margin-bottom: 3rem;\n    border-top: 1px solid rgba(0, 0, 0, 0.2);\n    align-items: flex-start;\n    padding: 1.5rem 4rem 1.5rem 0;\n    background-color: #fdfdfd;\n    z-index: 1; }\n  .search-form__submit {\n    border-radius: 3px;\n    padding: 0.7rem;\n    background-color: #f9f7f5;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    color: #551a8b;\n    font-weight: 500;\n    transition: all 0.2s;\n    margin-left: 20%; }\n    .search-form__submit:hover {\n      cursor: pointer;\n      background-color: #fff; }\n  .search-form__dropdown-span {\n    display: flex;\n    flex-direction: column; }\n  .search-form__selected-types, .search-form__selected-sets {\n    display: flex;\n    flex-direction: column;\n    list-style: none;\n    margin-bottom: 0.3rem; }\n  .search-form__selected-types-list-item, .search-form__selected-sets-list-item {\n    display: flex;\n    margin-bottom: 0.7rem; }\n  .search-form__selected-types-remove-btn, .search-form__selected-sets-remove-btn {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    cursor: pointer;\n    height: 2rem;\n    width: 2rem;\n    font-size: 1.3rem;\n    background-color: #f2f2f2;\n    margin-right: 0.7rem; }\n  .search-form__selected-types-toggler {\n    height: 2rem;\n    width: 2.75rem;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    cursor: pointer;\n    font-size: 1.3rem;\n    margin-right: 0.7rem; }\n    .search-form__selected-types-toggler--is {\n      background-color: #47d147; }\n    .search-form__selected-types-toggler--not {\n      background-color: #ff0000; }\n  .search-form__dropdown {\n    position: absolute;\n    max-height: 28rem;\n    background-color: #fff;\n    z-index: 2;\n    top: 100%;\n    width: 40rem;\n    margin-top: -1rem;\n    overflow-y: auto;\n    border: 1px solid #000; }\n    .search-form__dropdown-list {\n      list-style: none; }\n      .search-form__dropdown-list-category {\n        padding: 0.5rem; }\n      .search-form__dropdown-list-option {\n        padding: 0.3rem 2rem;\n        display: flex;\n        align-items: center; }\n        .search-form__dropdown-list-option:hover {\n          cursor: pointer; }\n        .search-form__dropdown-list-option--highlighted {\n          background-color: #ccd8ff; }\n        .search-form__dropdown-list-option span {\n          text-transform: uppercase;\n          margin-left: 1rem; }\n      .search-form__dropdown-list-img {\n        width: 2rem;\n        height: 2rem;\n        margin-right: 0.7rem; }\n\n.dropdown-wrapper {\n  position: relative; }\n\n.inv-search-price-msg {\n  position: absolute;\n  bottom: 0;\n  right: 0;\n  color: red; }\n\n.relative {\n  position: relative; }\n\n.api-results-display__nav {\n  background-color: #f3f5f8;\n  border-bottom: 1px solid rgba(99, 68, 150, 0.1);\n  width: 100%;\n  display: flex;\n  justify-content: space-between;\n  padding: 1.2rem 16%;\n  margin-bottom: 0.1rem;\n  height: 5.2rem; }\n  @media only screen and (max-width: 75rem) {\n    .api-results-display__nav {\n      padding: 1.2rem 2.5%; } }\n  @media only screen and (max-width: 53.125em) {\n    .api-results-display__nav {\n      display: none; } }\n  .api-results-display__nav-select {\n    color: #b300b3;\n    margin-right: 1rem;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    border-radius: 3px;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06);\n    padding: 0.1rem 2.2rem 0 0.5rem;\n    color: #551a8b;\n    height: 2.8rem;\n    font-size: 1.4rem;\n    text-indent: 0;\n    -webkit-appearance: none;\n    -moz-appearance: none;\n    text-overflow: '';\n    background-image: url(../../app/static/img/SVG/arrow-down2.svg);\n    background-repeat: no-repeat;\n    background-position: right 0.8rem center;\n    background-size: 1.2rem 1rem; }\n    .api-results-display__nav-select:hover {\n      cursor: pointer;\n      background-color: #fff; }\n  .api-results-display__nav-label {\n    color: #551a8b; }\n  .api-results-display__nav-btn {\n    border-radius: 3px;\n    background-color: #f9f7f5;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    color: #551a8b;\n    font-weight: 500;\n    transition: all 0.2s;\n    height: 2.8rem;\n    padding: 0.1rem 0.7rem 0 0.7rem;\n    font-size: 1.4rem;\n    margin: auto 0;\n    text-align: center;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06); }\n    .api-results-display__nav-btn:hover {\n      cursor: pointer;\n      background-color: #fff; }\n  .api-results-display__nav-right {\n    display: flex;\n    align-items: center; }\n  .api-results-display__nav-pagination-container {\n    display: flex;\n    align-items: center;\n    background-color: #f9f7f5;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    color: #551a8b;\n    padding: 0.2rem 0.7rem;\n    cursor: pointer;\n    height: 2.8rem;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06); }\n    .api-results-display__nav-pagination-container:not(:last-child) {\n      margin-right: 1rem; }\n    .api-results-display__nav-pagination-container:nth-child(2) svg {\n      margin-right: 1rem; }\n    .api-results-display__nav-pagination-container:nth-child(3) svg {\n      margin-left: 1rem; }\n    .api-results-display__nav-pagination-container--disabled {\n      cursor: not-allowed;\n      color: rgba(0, 0, 0, 0.25);\n      background-color: #f5f6f7; }\n    @media only screen and (max-width: 31.5em) {\n      .api-results-display__nav-pagination-container {\n        margin: 0; } }\n  .api-results-display__nav-svg-size {\n    height: 2rem;\n    width: 2rem; }\n  .api-results-display__nav-svg-color {\n    fill: #551a8b; }\n\n.api-results-display__display-bar {\n  width: 100%;\n  border-bottom: 1px solid rgba(99, 68, 150, 0.1);\n  background-color: #f6f4fa;\n  color: #535353;\n  padding-left: 16%;\n  margin-bottom: 2rem;\n  height: 2.1rem; }\n  @media only screen and (max-width: 75rem) {\n    .api-results-display__display-bar {\n      padding-left: 2.5%; } }\n\n.api-results-display__mobile {\n  background-color: #f3f5f8;\n  border-bottom: 1px solid rgba(99, 68, 150, 0.1);\n  justify-content: space-between;\n  margin-bottom: 0.1rem;\n  height: 5.2rem;\n  display: none; }\n  @media only screen and (max-width: 53.125em) {\n    .api-results-display__mobile {\n      display: flex;\n      padding: 1.2rem 2.5%; } }\n  @media only screen and (max-width: 31.5em) {\n    .api-results-display__mobile {\n      padding: 1.2rem; } }\n  .api-results-display__mobile-svg-size {\n    width: 1.4rem;\n    height: 1.4rem; }\n\n.api-results-display__mobile-display-options {\n  background-color: #f3f5f8;\n  border-bottom: 1px solid rgba(99, 68, 150, 0.1);\n  flex-direction: column;\n  align-items: flex-start;\n  padding: 1.2rem 0;\n  display: none; }\n\n.api-results-display__mobile-display-options-group {\n  display: flex;\n  justify-content: space-between;\n  width: 45%;\n  margin: 0 auto 1rem auto; }\n  @media only screen and (max-width: 51.5625em) {\n    .api-results-display__mobile-display-options-group {\n      width: 60%; } }\n  @media only screen and (max-width: 37.5em) {\n    .api-results-display__mobile-display-options-group {\n      width: 80%; } }\n  @media only screen and (max-width: 28.125em) {\n    .api-results-display__mobile-display-options-group {\n      width: 95%; } }\n  .api-results-display__mobile-display-options-group label {\n    margin-right: 1rem; }\n\n.api-results-display__nav-select--mobile {\n  width: 24rem; }\n  @media only screen and (max-width: 21.875em) {\n    .api-results-display__nav-select--mobile {\n      width: 16rem; } }\n\n.api-results-mobile-display-btn {\n  align-self: center; }\n\n.wrapper {\n  overflow-x: scroll;\n  overflow-y: hidden;\n  position: relative;\n  display: flex;\n  margin: 0 auto;\n  width: 68%; }\n  @media only screen and (max-width: 75rem) {\n    .wrapper {\n      width: 90%; } }\n\n.card-checklist {\n  width: 100%;\n  justify-self: center; }\n  .card-checklist__row {\n    display: grid;\n    height: 3rem; }\n    .card-checklist__row--7 {\n      grid-template-columns: 10% 22.5% 10% 17.5% 15% 15% 10%; }\n    .card-checklist__row--9 {\n      grid-template-columns: repeat(9, 1fr); }\n    .card-checklist__row--header {\n      border-bottom: 1px solid #000;\n      color: #531a8b;\n      text-transform: uppercase;\n      font-size: 1.2rem !important;\n      font-weight: 200 !important; }\n    .card-checklist__row--grey {\n      background-color: #f2f2f2; }\n    .card-checklist__row:nth-child(even) {\n      background-color: #f2f2f2; }\n    .card-checklist__row--header {\n      height: 3.5rem; }\n  .card-checklist__data {\n    width: 100%;\n    display: flex;\n    flex-wrap: nowrap;\n    justify-content: flex-start;\n    font-size: 1.4rem; }\n    .card-checklist__data--set {\n      text-transform: uppercase;\n      padding-left: 0.5rem; }\n    .card-checklist__data--name {\n      justify-content: flex-start; }\n    .card-checklist__data--rarity {\n      text-transform: capitalize; }\n  .card-checklist__data-link {\n    padding: 1rem 0;\n    display: block;\n    text-decoration: none;\n    width: 100%;\n    color: #000;\n    white-space: nowrap;\n    overflow: hidden;\n    text-overflow: ellipsis; }\n    .card-checklist__data-link--price {\n      color: #006885; }\n\n.tooltip {\n  position: absolute;\n  z-index: 5;\n  width: 24rem;\n  height: 34rem; }\n  .tooltip__img {\n    width: 100%;\n    height: 100%; }\n\n.negative-earnings {\n  color: red; }\n\n.positive-earnings {\n  color: green; }\n\n.image-grid {\n  padding: 7rem 16%;\n  display: flex;\n  justify-content: space-between;\n  flex-wrap: wrap; }\n  @media only screen and (max-width: 75rem) {\n    .image-grid {\n      padding: 4rem 2.5%; } }\n  @media only screen and (max-width: 62.5em) {\n    .image-grid {\n      grid-column-gap: 1rem; } }\n  .image-grid__outer-div {\n    position: relative;\n    height: 100%; }\n  .image-grid__inner-div {\n    perspective: 150rem;\n    width: 100%;\n    height: 100%; }\n  .image-grid__double {\n    width: 100%;\n    height: 100%;\n    position: absolute;\n    top: 0;\n    left: 0;\n    backface-visibility: hidden;\n    overflow: hidden;\n    transition: all 0.8s ease; }\n    .image-grid__double--back {\n      transform: rotateY(180deg); }\n  .image-grid__double-btn {\n    position: absolute;\n    top: 26%;\n    left: 75%;\n    width: 4.4rem;\n    height: 4.4rem;\n    border-radius: 50%;\n    background-color: rgba(255, 255, 255, 0.6);\n    border: 2px solid #342442;\n    transition: all 0.2s;\n    display: flex;\n    justify-content: center;\n    align-items: center; }\n    .image-grid__double-btn:hover {\n      cursor: pointer;\n      background-color: #fff; }\n  .image-grid__double-btn-svg {\n    height: 2.5rem;\n    width: 2.5rem;\n    pointer-events: none; }\n  .image-grid__dobule-btn-svg-color {\n    color: #16161d; }\n  .image-grid__container {\n    width: 100%;\n    height: 100%; }\n  .image-grid__image {\n    width: 100%;\n    height: 100%;\n    box-shadow: 1px 1px 6px rgba(0, 0, 0, 0.45);\n    border-radius: 4.75% / 3.5%; }\n  .image-grid__link {\n    margin-bottom: 0.9rem;\n    width: 24.25%;\n    height: auto;\n    margin-bottom: 0.9rem;\n    page-break-after: auto;\n    page-break-before: auto;\n    page-break-inside: avoid;\n    display: block; }\n    @media only screen and (max-width: 59.375em) {\n      .image-grid__link {\n        width: 31.75%; } }\n    @media only screen and (max-width: 40.625em) {\n      .image-grid__link {\n        width: 47.25%; } }\n\n.card {\n  width: 100%;\n  max-width: 100rem;\n  padding: 0 16%;\n  display: flex;\n  margin-top: 3rem;\n  padding-bottom: 0.7rem;\n  border-bottom: 1px dashed rgba(0, 0, 0, 0.7); }\n  @media only screen and (max-width: 75rem) {\n    .card {\n      padding: 0 2.5% 0.7rem 2.5%; } }\n  @media only screen and (max-width: 62.5em) {\n    .card {\n      flex-direction: column;\n      align-items: center; } }\n  .card__img-container {\n    z-index: 2;\n    border-radius: 100%; }\n  .card__img {\n    width: 33rem;\n    height: 46rem;\n    box-shadow: 1px 1px 8px rgba(0, 0, 0, 0.5);\n    border-radius: 4.75% / 3.5%; }\n  .card__img-left {\n    width: 33rem;\n    display: flex;\n    flex-direction: column;\n    z-index: 2; }\n  .card__img-btn {\n    align-self: center;\n    margin-top: 1rem;\n    height: 2.8rem;\n    font-size: 1.4rem;\n    line-height: 1.8;\n    color: #551a8b;\n    background-color: #f9f7f5;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    border-radius: 3px;\n    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06);\n    transition: all 0.2s;\n    padding: 0.2rem 0.5rem;\n    text-align: center;\n    display: flex;\n    align-items: center; }\n    .card__img-btn:hover {\n      cursor: pointer;\n      background-color: #fff;\n      border-color: #634496; }\n  .card__img-svg {\n    height: 1.4rem;\n    width: 1.4rem;\n    margin-right: 0.3rem;\n    pointer-events: none; }\n    @media only screen and (max-width: 62.5em) {\n      .card__img-svg {\n        flex-direction: column; } }\n  .card__img-double-sided {\n    perspective: 150rem;\n    height: 46rem; }\n  .card__img-double {\n    width: 33rem;\n    height: 46rem;\n    position: absolute;\n    top: 0;\n    left: 0;\n    backface-visibility: hidden;\n    overflow: hidden; }\n    .card__img-double--back {\n      transform: rotateY(180deg); }\n  .card__text {\n    background-color: #fff;\n    border-radius: 4px;\n    border: 1px solid rgba(0, 0, 0, 0.25);\n    border-top: 3px solid #000;\n    border-bottom: 3px solid #000;\n    margin-top: 2rem;\n    width: 34rem;\n    display: flex;\n    flex-direction: column;\n    padding: 3rem;\n    margin-right: 3rem;\n    margin-left: -2rem; }\n    @media only screen and (max-width: 62.5em) {\n      .card__text {\n        margin: 1rem 0; } }\n    .card__text-flex {\n      margin-bottom: 1rem;\n      border-bottom: 1px solid #bfbfbf; }\n    .card__text-title {\n      display: flex;\n      align-items: center; }\n      .card__text-title-h3 {\n        font-size: 1.8rem;\n        font-weight: 400;\n        margin-right: 1rem; }\n    .card__text-color-indicator {\n      width: 1.3rem;\n      height: 1.3rem;\n      border: 1px solid #333;\n      border-radius: 50%;\n      box-shadow: 0px 0px 0px 2px rgba(0, 0, 0, 0.2);\n      margin-right: 0.7rem;\n      display: inline-block; }\n      .card__text-color-indicator--U {\n        background-color: rgba(128, 128, 255, 0.7); }\n      .card__text-color-indicator--B {\n        background-color: rgba(0, 0, 0, 0.7); }\n      .card__text-color-indicator--R {\n        background-color: rgba(255, 77, 77, 0.7); }\n      .card__text-color-indicator--W {\n        background-color: rgba(255, 255, 255, 0.7); }\n      .card__text-color-indicator--G {\n        background-color: rgba(0, 255, 0, 0.7); }\n    .card__text-oracle-p {\n      margin-bottom: 1rem;\n      font-size: 1.3rem; }\n    .card__text-oracle-flavor {\n      font-size: 1.3rem;\n      font-style: italic; }\n    .card__text-illustrator {\n      font-size: 1.2rem;\n      font-style: italic; }\n    .card__text-legal {\n      display: flex;\n      flex-direction: row;\n      justify-content: space-between; }\n      .card__text-legal-half {\n        display: flex;\n        flex-direction: column; }\n      .card__text-legal-span-container {\n        display: flex;\n        align-items: center;\n        font-size: 1.4rem; }\n        .card__text-legal-span-container:not(:last-child) {\n          margin-bottom: 0.5rem; }\n      .card__text-legal-span-box {\n        width: 6rem;\n        height: 2.5rem;\n        margin-right: 0.3rem;\n        font-size: 1rem;\n        text-transform: uppercase;\n        display: flex;\n        justify-content: center;\n        align-items: center;\n        border-radius: 3px; }\n        .card__text-legal-span-box--not_legal {\n          background-color: #e60000; }\n        .card__text-legal-span-box--legal {\n          background-color: #009900; }\n      .card__text-legal-span-box {\n        color: #fff; }\n  .card__set {\n    display: flex;\n    flex-direction: column; }\n    @media only screen and (max-width: 81.25em) {\n      .card__set {\n        width: 30rem; } }\n    .card__set-banner {\n      display: flex;\n      border: 1px solid #bfbfbf;\n      width: 40rem;\n      background-color: #49465c;\n      color: #fdfdfd;\n      padding: 0.7rem;\n      border-radius: 3px; }\n      @media only screen and (max-width: 81.25em) {\n        .card__set-banner {\n          width: 30rem; } }\n      .card__set-banner-svg-container {\n        margin-right: 1rem; }\n      .card__set-banner-svg {\n        width: 2.4rem;\n        height: 2.4rem;\n        filter: invert(100%); }\n    .card__set-details {\n      display: flex;\n      flex-direction: column; }\n    .card__set-header-name {\n      font-size: 1.7remrem; }\n    .card__set-header-code {\n      text-transform: uppercase; }\n    .card__set-prints-header {\n      display: flex;\n      justify-content: space-between;\n      background-color: #49465c;\n      color: #fdfdfd;\n      font-size: 1.3rem;\n      text-transform: uppercase;\n      border: 1px solid #bfbfbf;\n      border-radius: 3px;\n      padding: 0.3rem 0.7rem; }\n    .card__set-prints-svg-container {\n      height: 1.8rem;\n      width: 1.8rem;\n      border: 1px solid #bfbfbf;\n      display: flex;\n      justify-content: center;\n      align-items: center;\n      border-radius: 100%; }\n    .card__set-prints-svg--common {\n      fill: #000; }\n    .card__set-prints-svg--uncommon {\n      fill: #e6e6e6; }\n    .card__set-prints-svg--rare {\n      fill: #e6c300; }\n    .card__set-prints-svg--mythic {\n      fill: #ff0000; }\n    .card__set-prints-list {\n      list-style: none;\n      border-radius: 3px; }\n      .card__set-prints-list-link:link, .card__set-prints-list-link:visited {\n        text-decoration: none;\n        color: #000; }\n      .card__set-prints-list-item {\n        display: flex;\n        justify-content: space-between;\n        cursor: pointer;\n        border-bottom: 1px solid #e7e9ec;\n        border-left: 1px solid #cdcdcd;\n        background-color: #fff;\n        padding: 0.25rem 0; }\n        .card__set-prints-list-item--pl-14 {\n          padding-left: 1.4rem;\n          border-bottom: 3px solid #000; }\n        .card__set-prints-list-item:hover {\n          background-color: #f2f2f2; }\n      .card__set-prints-list-item-name-wrapper {\n        display: flex;\n        align-items: center;\n        margin-left: -1rem; }\n      .card__set-prints-list-item-set-name {\n        margin-left: 0.5rem; }\n      .card__set-prints-list-item-price {\n        margin-right: 0.7rem;\n        color: #006885; }\n\n.card-page {\n  display: flex;\n  flex-direction: column;\n  grid-column: 1 / -1;\n  position: relative; }\n\n.add-to-inv,\n.remove-from-inv {\n  margin-top: 3rem;\n  width: 50%;\n  margin-left: 50%;\n  transform: translateX(-50%);\n  display: flex;\n  flex-direction: column; }\n  @media only screen and (max-width: 62.5em) {\n    .add-to-inv,\n    .remove-from-inv {\n      width: 100%; } }\n  .add-to-inv__header,\n  .remove-from-inv__header {\n    color: #16161d;\n    font-size: 2.2rem;\n    font-weight: 300;\n    margin: 0 auto 1rem auto; }\n  .add-to-inv__form,\n  .remove-from-inv__form {\n    display: flex;\n    flex-direction: column; }\n    .add-to-inv__form-price,\n    .remove-from-inv__form-price {\n      width: 20rem;\n      height: 3.5rem;\n      margin-bottom: 1rem;\n      padding: 1rem;\n      border: solid 1px #bfbfbf;\n      border-radius: 5px; }\n      .add-to-inv__form-price:focus,\n      .remove-from-inv__form-price:focus {\n        border: solid 1px #000; }\n    .add-to-inv__form-group,\n    .remove-from-inv__form-group {\n      display: flex;\n      justify-content: space-evenly;\n      align-content: center;\n      margin-bottom: 1.5rem;\n      position: relative; }\n      @media only screen and (max-width: 31.5em) {\n        .add-to-inv__form-group,\n        .remove-from-inv__form-group {\n          flex-direction: column;\n          align-items: center; } }\n    .add-to-inv__form-label,\n    .remove-from-inv__form-label {\n      margin-right: 0.3rem;\n      display: flex;\n      align-content: center;\n      justify-content: center;\n      color: #16161d;\n      margin-top: 0.45rem; }\n      @media only screen and (max-width: 31.5em) {\n        .add-to-inv__form-label,\n        .remove-from-inv__form-label {\n          margin-bottom: 0.5rem; } }\n  .add-to-inv-price-msg,\n  .remove-from-inv-price-msg {\n    position: absolute;\n    bottom: -1.8rem;\n    right: 25%;\n    color: red; }\n  .add-to-inv__submit,\n  .remove-from-inv__submit {\n    align-self: center;\n    height: 3.1rem;\n    font-size: 1.4rem;\n    line-height: 1.8;\n    color: #551a8b;\n    background-color: #f9f7f5;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    border-radius: 3px;\n    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06);\n    transition: all 0.2s;\n    padding: 0.2rem 0.75rem;\n    text-align: center;\n    display: flex;\n    align-items: center;\n    margin-bottom: 1rem; }\n    .add-to-inv__submit:hover,\n    .remove-from-inv__submit:hover {\n      cursor: pointer;\n      background-color: #fff;\n      border-color: #634496; }\n\n.util-space::before,\n.util-space::after {\n  content: '';\n  margin: 0 0.2rem;\n  display: flex;\n  align-items: center; }\n\n.no-results {\n  justify-self: center; }\n\n.homepage {\n  background: linear-gradient(to bottom, #1d1c25, #431e3f);\n  background-repeat: no-repeat;\n  height: 100vh;\n  display: flex;\n  overflow-x: hidden !important;\n  justify-content: center;\n  position: relative;\n  background-size: cover; }\n  .homepage__center {\n    align-self: center;\n    display: flex;\n    flex-direction: column; }\n    @media only screen and (max-width: 28.125em) {\n      .homepage__center {\n        margin-top: -12rem; } }\n  @media only screen and (max-width: 40.625em) {\n    .homepage__center-heading-wrapper {\n      margin: 0 auto 0.5rem auto;\n      width: 75%;\n      display: flex;\n      justify-content: center;\n      text-align: center; } }\n  .homepage__search {\n    position: relative; }\n  .homepage__search-input {\n    padding: 1.2rem 1.4rem 1.2rem 6.2rem;\n    font-size: 3rem;\n    background-color: #242031;\n    color: #d7d7d7;\n    border-radius: 4px;\n    box-shadow: 0px 0px 0px 2px rgba(0, 0, 0, 0.5);\n    width: 100%;\n    border: 1px solid rgba(255, 255, 255, 0.5); }\n    .homepage__search-input::placeholder {\n      text-align: center; }\n    @media only screen and (max-width: 40.625em) {\n      .homepage__search-input {\n        width: 80%;\n        margin-left: 10%; } }\n  .homepage__search-btn {\n    position: absolute;\n    left: 6rem;\n    top: 2rem; }\n    @media only screen and (max-width: 40.625em) {\n      .homepage__search-btn {\n        left: 12rem; } }\n    @media only screen and (max-width: 28.125em) {\n      .homepage__search-btn {\n        left: 10rem; } }\n  .homepage__icon-sizing--search {\n    width: 3rem;\n    height: 3rem;\n    transform: translateX(-150%); }\n  .homepage__icon-path {\n    fill: #bfbfbf; }\n  .homepage__links {\n    display: flex;\n    justify-content: center; }\n    @media only screen and (max-width: 40.625em) {\n      .homepage__links {\n        flex-direction: column; } }\n    @media only screen and (max-width: 28.125em) {\n      .homepage__links {\n        margin-left: 7.5%; } }\n  .homepage__link {\n    text-decoration: none;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    border-color: rgba(255, 255, 255, 0.6);\n    border-radius: 3px;\n    color: #fff;\n    margin-top: 0.6rem;\n    margin-right: 3rem;\n    cursor: pointer;\n    line-height: 1.4;\n    padding: 0.2rem 1rem 0 1rem;\n    height: 2.8rem;\n    transition: all 0.2s;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06);\n    min-width: 9rem;\n    text-align: center; }\n    @media only screen and (max-width: 40.625em) {\n      .homepage__link {\n        align-self: center;\n        width: 14.5rem; } }\n    .homepage__link:hover {\n      background-color: rgba(255, 255, 255, 0.09); }\n\n.inventory-details {\n  grid-column: 1 / -1;\n  border-bottom: 1px solid rgba(99, 68, 150, 0.1);\n  background-color: #f6f4fa;\n  color: #535353;\n  padding: 1rem 16%;\n  margin-bottom: 2rem;\n  position: relative;\n  display: flex;\n  justify-content: space-between; }\n  .inventory-details__link {\n    text-decoration: none;\n    color: rgba(83, 83, 83, 0.75);\n    transition: all 0.2s;\n    padding: 0 0.6rem;\n    border-left: 1px solid #535353;\n    border-right: 1px solid #535353; }\n    .inventory-details__link:hover {\n      color: #535353; }\n  .inventory-details span {\n    color: #006885; }\n\n.homepage__colage,\n.cardpage__colage {\n  position: absolute;\n  overflow: hidden;\n  left: 0;\n  height: 15rem;\n  width: 100%; }\n\n.homepage__colage {\n  bottom: 0; }\n\n.cardpage__colage {\n  bottom: -2.6rem; }\n  @media only screen and (max-width: 62.5em) {\n    .cardpage__colage {\n      display: none; } }\n\n.homepage__colage-inner,\n.cardpage__colage-inner {\n  position: relative;\n  height: 100%;\n  margin-left: 50%;\n  transform: translateX(-50%);\n  width: 65.5rem; }\n\n.homepage__colage-card,\n.cardpage__colage-card {\n  width: 16.8rem;\n  height: 23.4rem;\n  position: absolute;\n  border-radius: 5% / 3.75%;\n  transform: translateY(0);\n  transition: all 0.3s;\n  box-shadow: inset 0 0 3px 3px #000; }\n  .homepage__colage-card:nth-child(1),\n  .cardpage__colage-card:nth-child(1) {\n    top: 2.2rem; }\n  .homepage__colage-card:nth-child(2),\n  .cardpage__colage-card:nth-child(2) {\n    top: 6.2rem;\n    left: 3.5rem; }\n  .homepage__colage-card:nth-child(3),\n  .cardpage__colage-card:nth-child(3) {\n    top: 1rem;\n    left: 17.4rem; }\n  .homepage__colage-card:nth-child(4),\n  .cardpage__colage-card:nth-child(4) {\n    top: 4.5rem;\n    left: 20.6rem; }\n  .homepage__colage-card:nth-child(5),\n  .cardpage__colage-card:nth-child(5) {\n    top: 1.6rem;\n    left: 34.7rem; }\n  .homepage__colage-card:nth-child(6),\n  .cardpage__colage-card:nth-child(6) {\n    top: 6.5rem;\n    left: 38rem; }\n  .homepage__colage-card:nth-child(7),\n  .cardpage__colage-card:nth-child(7) {\n    top: 3.5rem;\n    right: 0; }\n  .homepage__colage-card:hover,\n  .cardpage__colage-card:hover {\n    transform: translateY(-5%); }\n\n.container {\n  display: grid;\n  grid-template-columns: [full-start] minmax(6rem, 1fr) [center-start] repeat(8, [col-start] minmax(min-content, 14rem) [col-end]) [center-end] minmax(6rem, 1fr) [full-end];\n  background-color: #f5f6f7;\n  background-size: cover;\n  position: relative; }\n\n.search {\n  grid-column: full-start / full-end;\n  background-color: #fff; }\n\n.api-results-display {\n  grid-column: full-start / full-end;\n  background-color: #f5f6f7;\n  background-size: cover;\n  display: grid; }\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/css/vendor/mana.css":
/*!***********************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/css/vendor/mana.css ***!
  \***********************************************************************/
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
___CSS_LOADER_EXPORT___.push([module.id, ".mana {\n    background-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\n    background-repeat: no-repeat;\n    background-size: auto 700%;\n    display: inline-block;\n    font-size: 100%;\n}\n\n.mana.xs {\n    width: 1.5rem;\n    height: 1.5rem;\n}\n\n.mana.small {\n    height: 2rem;\n    width: 2rem;\n}\n.mana.medium {\n    height: 2em;\n    width: 2em;\n}\n.mana.large {\n    height: 4em;\n    width: 4em;\n}\n.mana.s { background-position: 0 0; }\n.mana.s1 { background-position: 11.1% 0; }\n.mana.s2 { background-position: 22.2% 0; }\n.mana.s3 { background-position: 33.3% 0; }\n.mana.s4 { background-position: 44.4% 0; }\n.mana.s5 { background-position: 55.5% 0; }\n.mana.s6 { background-position: 66.6% 0; }\n.mana.s7 { background-position: 77.7% 0; }\n.mana.s8 { background-position: 88.8% 0; }\n.mana.s9 { background-position: 99.9% 0; }\n\n.mana.s10 { background-position: 0 16%; }\n.mana.s11 { background-position: 11.1% 16.6%; }\n.mana.s12 { background-position: 22.2% 16.6%; }\n.mana.s13 { background-position: 33.3% 16.6%; }\n.mana.s14 { background-position: 44.4% 16.6%; }\n.mana.s15 { background-position: 55.5% 16.6%; }\n.mana.s16 { background-position: 66.6% 16.6%; }\n.mana.s17 { background-position: 77.7% 16.6%; }\n.mana.s18 { background-position: 88.8% 16.6%; }\n.mana.s19 { background-position: 99.9% 16.6%; }\n\n.mana.s20 { background-position: 0 33%; }\n.mana.sx { background-position: 11.1% 33.3%; }\n.mana.sy { background-position: 22.2% 33.3%; }\n.mana.sz { background-position: 33.3% 33.3%; }\n.mana.sw { background-position: 44.4% 33.3%; }\n.mana.su { background-position: 55.5% 33.3%; }\n.mana.sb { background-position: 66.6% 33.3%; }\n.mana.sr { background-position: 77.7% 33.3%; }\n.mana.sg { background-position: 88.8% 33.3%; }\n.mana.ss { background-position: 99.9% 33.3%; }\n\n.mana.swu { background-position: 0 50%; }\n.mana.swb { background-position: 11.1% 50%; }\n.mana.sub { background-position: 22.2% 50%; }\n.mana.sur { background-position: 33.3% 50%; }\n.mana.sbr { background-position: 44.4% 50%; }\n.mana.sbg { background-position: 55.5% 50%; }\n.mana.srw { background-position: 66.6% 50%; }\n.mana.srg { background-position: 77.7% 50%; }\n.mana.sgw { background-position: 88.8% 50%; }\n.mana.sgu { background-position: 99.9% 50%; }\n\n.mana.s2w { background-position: 0 66.6%; }\n.mana.s2u { background-position: 11.1% 66.6%; }\n.mana.s2b { background-position: 22.2% 66.6%; }\n.mana.s2r { background-position: 33.3% 66.6%; }\n.mana.s2g { background-position: 44.4% 66.6%; }\n.mana.swp { background-position: 55.5% 66.6%; }\n.mana.sup { background-position: 66.6% 66.6%; }\n.mana.sbp { background-position: 77.7% 66.6%; }\n.mana.srp { background-position: 88.8% 66.6%; }\n.mana.sgp { background-position: 99.9% 66.6%; }\n\n.mana.st { background-position: 0% 83.3%; }\n.mana.sq { background-position: 11.1% 83.3%; }\n\n.mana.sc { background-position: 77.7% 83.3%; }\n\n.mana.se { background-position: 88.8% 83.3%; }\n\n.mana.s1000000 { background-position: 0 100%; }\n.mana.s1000000.small { width: 4.9em; }\n.mana.s1000000.medium { width: 9.7em; }\n/*.mana.s1000000.large { width: 18.8em; }*/\n.mana.s100 { background-position: 60% 100%; }\n.mana.s100.small { width: 1.8em; }\n.mana.s100.medium { width: 3.7em; }\n/*.mana.s100.large { width: 10.8em; }*/\n.mana.schaos { background-position: 76.5% 100%; }\n.mana.schaos.small { width: 1.2em; }\n.mana.schaos.medium { width: 2.3em; }\n/*.mana.sc.large { width: 4.6em; }*/\n.mana.shw { background-position: 83.5% 100%; }\n.mana.shw.small { width: 0.5em; }\n.mana.shw.medium { width: 1em; }\n/*.mana.shw.large { width: 2em; }*/\n.mana.shr { background-position: 89% 100%; }\n.mana.shr.small { width: 0.5em; }\n.mana.shr.medium { width: 1em; }\n/*.mana.shr.large { width: 2em; }*/\n\n\n.shadow {\n    filter: \"progid:DXImageTransform.Microsoft.Dropshadow(OffX=-1, OffY=1, Color='#000')\";\n    filter: url(#shadow);\n    -webkit-filter: drop-shadow(-1px 1px 0px #000);\n    filter: drop-shadow(-1px 1px 0px #000);\n}", "",{"version":3,"sources":["webpack://./src/css/vendor/mana.css"],"names":[],"mappings":"AAAA;IACI,yDAAwD;IACxD,4BAA4B;IAC5B,0BAA0B;IAC1B,qBAAqB;IACrB,eAAe;AACnB;;AAEA;IACI,aAAa;IACb,cAAc;AAClB;;AAEA;IACI,YAAY;IACZ,WAAW;AACf;AACA;IACI,WAAW;IACX,UAAU;AACd;AACA;IACI,WAAW;IACX,UAAU;AACd;AACA,UAAU,wBAAwB,EAAE;AACpC,WAAW,4BAA4B,EAAE;AACzC,WAAW,4BAA4B,EAAE;AACzC,WAAW,4BAA4B,EAAE;AACzC,WAAW,4BAA4B,EAAE;AACzC,WAAW,4BAA4B,EAAE;AACzC,WAAW,4BAA4B,EAAE;AACzC,WAAW,4BAA4B,EAAE;AACzC,WAAW,4BAA4B,EAAE;AACzC,WAAW,4BAA4B,EAAE;;AAEzC,YAAY,0BAA0B,EAAE;AACxC,YAAY,gCAAgC,EAAE;AAC9C,YAAY,gCAAgC,EAAE;AAC9C,YAAY,gCAAgC,EAAE;AAC9C,YAAY,gCAAgC,EAAE;AAC9C,YAAY,gCAAgC,EAAE;AAC9C,YAAY,gCAAgC,EAAE;AAC9C,YAAY,gCAAgC,EAAE;AAC9C,YAAY,gCAAgC,EAAE;AAC9C,YAAY,gCAAgC,EAAE;;AAE9C,YAAY,0BAA0B,EAAE;AACxC,WAAW,gCAAgC,EAAE;AAC7C,WAAW,gCAAgC,EAAE;AAC7C,WAAW,gCAAgC,EAAE;AAC7C,WAAW,gCAAgC,EAAE;AAC7C,WAAW,gCAAgC,EAAE;AAC7C,WAAW,gCAAgC,EAAE;AAC7C,WAAW,gCAAgC,EAAE;AAC7C,WAAW,gCAAgC,EAAE;AAC7C,WAAW,gCAAgC,EAAE;;AAE7C,YAAY,0BAA0B,EAAE;AACxC,YAAY,8BAA8B,EAAE;AAC5C,YAAY,8BAA8B,EAAE;AAC5C,YAAY,8BAA8B,EAAE;AAC5C,YAAY,8BAA8B,EAAE;AAC5C,YAAY,8BAA8B,EAAE;AAC5C,YAAY,8BAA8B,EAAE;AAC5C,YAAY,8BAA8B,EAAE;AAC5C,YAAY,8BAA8B,EAAE;AAC5C,YAAY,8BAA8B,EAAE;;AAE5C,YAAY,4BAA4B,EAAE;AAC1C,YAAY,gCAAgC,EAAE;AAC9C,YAAY,gCAAgC,EAAE;AAC9C,YAAY,gCAAgC,EAAE;AAC9C,YAAY,gCAAgC,EAAE;AAC9C,YAAY,gCAAgC,EAAE;AAC9C,YAAY,gCAAgC,EAAE;AAC9C,YAAY,gCAAgC,EAAE;AAC9C,YAAY,gCAAgC,EAAE;AAC9C,YAAY,gCAAgC,EAAE;;AAE9C,WAAW,6BAA6B,EAAE;AAC1C,WAAW,gCAAgC,EAAE;;AAE7C,WAAW,gCAAgC,EAAE;;AAE7C,WAAW,gCAAgC,EAAE;;AAE7C,iBAAiB,2BAA2B,EAAE;AAC9C,uBAAuB,YAAY,EAAE;AACrC,wBAAwB,YAAY,EAAE;AACtC,0CAA0C;AAC1C,aAAa,6BAA6B,EAAE;AAC5C,mBAAmB,YAAY,EAAE;AACjC,oBAAoB,YAAY,EAAE;AAClC,sCAAsC;AACtC,eAAe,+BAA+B,EAAE;AAChD,qBAAqB,YAAY,EAAE;AACnC,sBAAsB,YAAY,EAAE;AACpC,mCAAmC;AACnC,YAAY,+BAA+B,EAAE;AAC7C,kBAAkB,YAAY,EAAE;AAChC,mBAAmB,UAAU,EAAE;AAC/B,kCAAkC;AAClC,YAAY,6BAA6B,EAAE;AAC3C,kBAAkB,YAAY,EAAE;AAChC,mBAAmB,UAAU,EAAE;AAC/B,kCAAkC;;;AAGlC;IACI,qFAAqF;IACrF,oBAAoB;IACpB,8CAA8C;IAC9C,sCAAsC;AAC1C","sourcesContent":[".mana {\n    background-image: url('../../img/mana-symbols/mana.svg');\n    background-repeat: no-repeat;\n    background-size: auto 700%;\n    display: inline-block;\n    font-size: 100%;\n}\n\n.mana.xs {\n    width: 1.5rem;\n    height: 1.5rem;\n}\n\n.mana.small {\n    height: 2rem;\n    width: 2rem;\n}\n.mana.medium {\n    height: 2em;\n    width: 2em;\n}\n.mana.large {\n    height: 4em;\n    width: 4em;\n}\n.mana.s { background-position: 0 0; }\n.mana.s1 { background-position: 11.1% 0; }\n.mana.s2 { background-position: 22.2% 0; }\n.mana.s3 { background-position: 33.3% 0; }\n.mana.s4 { background-position: 44.4% 0; }\n.mana.s5 { background-position: 55.5% 0; }\n.mana.s6 { background-position: 66.6% 0; }\n.mana.s7 { background-position: 77.7% 0; }\n.mana.s8 { background-position: 88.8% 0; }\n.mana.s9 { background-position: 99.9% 0; }\n\n.mana.s10 { background-position: 0 16%; }\n.mana.s11 { background-position: 11.1% 16.6%; }\n.mana.s12 { background-position: 22.2% 16.6%; }\n.mana.s13 { background-position: 33.3% 16.6%; }\n.mana.s14 { background-position: 44.4% 16.6%; }\n.mana.s15 { background-position: 55.5% 16.6%; }\n.mana.s16 { background-position: 66.6% 16.6%; }\n.mana.s17 { background-position: 77.7% 16.6%; }\n.mana.s18 { background-position: 88.8% 16.6%; }\n.mana.s19 { background-position: 99.9% 16.6%; }\n\n.mana.s20 { background-position: 0 33%; }\n.mana.sx { background-position: 11.1% 33.3%; }\n.mana.sy { background-position: 22.2% 33.3%; }\n.mana.sz { background-position: 33.3% 33.3%; }\n.mana.sw { background-position: 44.4% 33.3%; }\n.mana.su { background-position: 55.5% 33.3%; }\n.mana.sb { background-position: 66.6% 33.3%; }\n.mana.sr { background-position: 77.7% 33.3%; }\n.mana.sg { background-position: 88.8% 33.3%; }\n.mana.ss { background-position: 99.9% 33.3%; }\n\n.mana.swu { background-position: 0 50%; }\n.mana.swb { background-position: 11.1% 50%; }\n.mana.sub { background-position: 22.2% 50%; }\n.mana.sur { background-position: 33.3% 50%; }\n.mana.sbr { background-position: 44.4% 50%; }\n.mana.sbg { background-position: 55.5% 50%; }\n.mana.srw { background-position: 66.6% 50%; }\n.mana.srg { background-position: 77.7% 50%; }\n.mana.sgw { background-position: 88.8% 50%; }\n.mana.sgu { background-position: 99.9% 50%; }\n\n.mana.s2w { background-position: 0 66.6%; }\n.mana.s2u { background-position: 11.1% 66.6%; }\n.mana.s2b { background-position: 22.2% 66.6%; }\n.mana.s2r { background-position: 33.3% 66.6%; }\n.mana.s2g { background-position: 44.4% 66.6%; }\n.mana.swp { background-position: 55.5% 66.6%; }\n.mana.sup { background-position: 66.6% 66.6%; }\n.mana.sbp { background-position: 77.7% 66.6%; }\n.mana.srp { background-position: 88.8% 66.6%; }\n.mana.sgp { background-position: 99.9% 66.6%; }\n\n.mana.st { background-position: 0% 83.3%; }\n.mana.sq { background-position: 11.1% 83.3%; }\n\n.mana.sc { background-position: 77.7% 83.3%; }\n\n.mana.se { background-position: 88.8% 83.3%; }\n\n.mana.s1000000 { background-position: 0 100%; }\n.mana.s1000000.small { width: 4.9em; }\n.mana.s1000000.medium { width: 9.7em; }\n/*.mana.s1000000.large { width: 18.8em; }*/\n.mana.s100 { background-position: 60% 100%; }\n.mana.s100.small { width: 1.8em; }\n.mana.s100.medium { width: 3.7em; }\n/*.mana.s100.large { width: 10.8em; }*/\n.mana.schaos { background-position: 76.5% 100%; }\n.mana.schaos.small { width: 1.2em; }\n.mana.schaos.medium { width: 2.3em; }\n/*.mana.sc.large { width: 4.6em; }*/\n.mana.shw { background-position: 83.5% 100%; }\n.mana.shw.small { width: 0.5em; }\n.mana.shw.medium { width: 1em; }\n/*.mana.shw.large { width: 2em; }*/\n.mana.shr { background-position: 89% 100%; }\n.mana.shr.small { width: 0.5em; }\n.mana.shr.medium { width: 1em; }\n/*.mana.shr.large { width: 2em; }*/\n\n\n.shadow {\n    filter: \"progid:DXImageTransform.Microsoft.Dropshadow(OffX=-1, OffY=1, Color='#000')\";\n    filter: url(#shadow);\n    -webkit-filter: drop-shadow(-1px 1px 0px #000);\n    filter: drop-shadow(-1px 1px 0px #000);\n}"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
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

/***/ "./app/static/img/SVG/arrow-down2.svg":
/*!********************************************!*\
  !*** ./app/static/img/SVG/arrow-down2.svg ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "8f4b9d0476e620d1fef50c9504436456.svg");

/***/ }),

/***/ "./src/img/mana-symbols/mana.svg":
/*!***************************************!*\
  !*** ./src/img/mana-symbols/mana.svg ***!
  \***************************************/
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
// *********** Home Page ********* \\
// ******************************* \\
// if (window.location.pathname === '/') document.body.style.overflow = 'hidden';

// ******************************* \\
// ********* Quick Search ******** \\
// ******************************* \\
_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.nav.quickSearchBtn.addEventListener('click', () => {
  const search = new _models_Search__WEBPACK_IMPORTED_MODULE_2__.default();

  if (_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.nav.searchInput.value !== '') {
    const query = search.quickSearch();
    window.location.href = `/results/list/${query}&order=name`;
  }
});

// ******************************* \\
// ********* Search Page ********* \\
// ******************************* \\
if (window.location.pathname === '/search') {
  document.body.style.backgroundColor = '#fdfdfd';

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

  _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.typeLine.addEventListener('click', () => {
    // Display the dropdown
    _views_searchView__WEBPACK_IMPORTED_MODULE_3__.showTypesDropDown();
    _views_searchView__WEBPACK_IMPORTED_MODULE_3__.startTypesDropDownNavigation();

    // Start an event listener on the document. This will close the dropdown if the user clicks
    // outside of the input or dropdown. This will also cancel the event listener
    document.addEventListener('click', _views_searchView__WEBPACK_IMPORTED_MODULE_3__.typeLineListener);
  });

  _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.typeLine.addEventListener('input', () => {
    if (_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.typeDropDown.hasAttribute('hidden')) {
      _views_searchView__WEBPACK_IMPORTED_MODULE_3__.showTypesDropDown();
    }

    _views_searchView__WEBPACK_IMPORTED_MODULE_3__.filterTypes(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.typeLine.value);
    _views_searchView__WEBPACK_IMPORTED_MODULE_3__.filterTypeHeaders();
    _views_searchView__WEBPACK_IMPORTED_MODULE_3__.startTypesDropDownNavigation();
  });

  _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.setInput.addEventListener('click', () => {
    // Display the dropdown
    _views_searchView__WEBPACK_IMPORTED_MODULE_3__.showSetsDropDown();
    _views_searchView__WEBPACK_IMPORTED_MODULE_3__.startSetsDropDownNavigation();

    // Start an event listener on the document. This will close the dropdown if the user clicks
    // outside of the input or dropdown. This will also cancel the event listener
    document.addEventListener('click', _views_searchView__WEBPACK_IMPORTED_MODULE_3__.setInputListener);
  });

  _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.setInput.addEventListener('input', () => {
    if (_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.setDropDown.hasAttribute('hidden')) {
      _views_searchView__WEBPACK_IMPORTED_MODULE_3__.showSetsDropDown();
    }

    _views_searchView__WEBPACK_IMPORTED_MODULE_3__.filterSets(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.setInput.value);
    _views_searchView__WEBPACK_IMPORTED_MODULE_3__.filterSetHeaders();
    _views_searchView__WEBPACK_IMPORTED_MODULE_3__.startSetsDropDownNavigation();
  });

  _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.statValue.addEventListener(
    'input',
    _views_searchView__WEBPACK_IMPORTED_MODULE_3__.statLineController
  );

  _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.format.addEventListener(
    'change',
    _views_searchView__WEBPACK_IMPORTED_MODULE_3__.formatLineController
  );
}

// ******************************* \\
// ********* Results Page ******** \\
// ******************************* \\
if (window.location.pathname.substring(1, 8) === 'results') {
  document.body.style.backgroundColor = '#f5f6f7';

  const state = {
    search: new _models_Search__WEBPACK_IMPORTED_MODULE_2__.default(),

    // Get the display method, sort method, and query from the URL
    display: window.location.pathname.substring(
      9,
      window.location.pathname.lastIndexOf('/')
    ),
    query: window.location.pathname.substring(
      window.location.pathname.lastIndexOf('/') + 1
    ),
    sortMethod: window.location.pathname.substring(
      window.location.pathname.lastIndexOf('=') + 1
    ),

    allCards: [],
    currentIndex: 0,
    allResultsLoaded: false,
  };

  // When the results page is refreshed, display the cards as a checklist by default
  document.addEventListener('DOMContentLoaded', async () => {
    // Update the sort by and display asd menus so the selected option is what the user selected
    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.choseSelectMenuSort(
      _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.sortBy().options,
      state
    );
    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.choseSelectMenuDisplay(
      _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.displaySelector(),
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
  _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.btn().onclick = async () => {
    // Update the display method between checklist and cards if the user changed it
    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.changeDisplayAndUrl(state);

    // If a new sorting method is selected, a request is sent to the server and the page is refreshed.
    // This resets the state and async tasks
    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.changeSortMethod(state);

    // Update the display with a new sort method and display method if either were given
    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.updateDisplay(state);
  };

  // Event Listener for next page button
  _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.nextPageBtn().onclick = () => {
    // Update the index
    state.currentIndex++;

    // Update the display based on the method stored in the state
    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.updateDisplay(state);

    // Update the display bar
    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.updateDisplayBar(state);

    // Enable the previous page and first page btns
    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.enableBtn(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.previousPageBtn());
    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.enableBtn(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.firstPageBtn);

    // If on the last page, disable the next page btn and last page btn
    if (state.currentIndex === state.allCards.length - 1) {
      _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.disableBtn(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.nextPageBtn());
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
    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.disableBtn(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.nextPageBtn());
    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.disableBtn(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.lastPageBtn);

    // Enable the previous and first page buttons
    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.enableBtn(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.previousPageBtn());
    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.enableBtn(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.firstPageBtn);
  };

  // Event listener for the previous page button
  _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.previousPageBtn().onclick = () => {
    // Update the index
    state.currentIndex--;

    // Update the display based on the method stored in the state
    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.updateDisplay(state);

    // Update the display bar
    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.updateDisplayBar(state);

    // If on the first page, disable the previous and first page buttons
    if (state.currentIndex === 0) {
      _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.disableBtn(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.previousPageBtn());
      _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.disableBtn(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.firstPageBtn);
    }

    // Enable the next and last page buttons. The last page button should only be
    // enabled if all results have been loaded
    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.enableBtn(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.nextPageBtn());
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
    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.disableBtn(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.previousPageBtn());
    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.disableBtn(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.firstPageBtn);

    // Enable the next and last page buttons. The last page button should only be
    // enabled if all results have been loaded
    _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.enableBtn(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.nextPageBtn());
    if (state.allResultsLoaded)
      _views_resultsView__WEBPACK_IMPORTED_MODULE_4__.enableBtn(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.resultsPage.lastPageBtn);
  };

  window.onpopstate = (e) => {
    window.location.href = `/search`;
  };

  // Mobile display menu
  if (document.querySelector('.js--mobile-display-options')) {
    document
      .querySelector('.js--mobile-display-options')
      .addEventListener('click', () => {
        if (
          document.querySelector('.js--mobile-display-menu').style.display ===
          'flex'
        ) {
          document.querySelector('.js--mobile-display-menu').style.display =
            'none';
        } else {
          document.querySelector('.js--mobile-display-menu').style.display =
            'flex';
        }
      });
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
  _views_cardView__WEBPACK_IMPORTED_MODULE_5__.shortenCardName();

  // If the transform btn is on the dom (if the card is double sided) set
  // the event listener for the card to be flipped back and forth
  if (_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.card.transformBtn) {
    _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.card.transformBtn.addEventListener(
      'click',
      _views_cardView__WEBPACK_IMPORTED_MODULE_5__.flipToBackSide
    );
  }

  document
    .querySelector('.js--add-to-inv-submit')
    .addEventListener('click', _views_cardView__WEBPACK_IMPORTED_MODULE_5__.checkPriceInputForDigits);
}

// ******************************* \\
// ******* Inventory Page ******** \\
// ******************************* \\
if (window.location.pathname.endsWith('inventory')) {
  document.body.style.backgroundColor = '#f5f6f7';
  document.addEventListener(
    'DOMContentLoaded',
    _views_inventoryView__WEBPACK_IMPORTED_MODULE_6__.alterInventoryTable
  );
}

// ******************************* \\
// **** Inventory Search Page **** \\
// ******************************* \\
if (window.location.pathname.substring(1, 17) === 'inventory/search') {
  document.body.style.backgroundColor = '#fdfdfd';

  document
    .querySelector('.js--inv-search-btn')
    .addEventListener('click', _views_inventorySearchView__WEBPACK_IMPORTED_MODULE_7__.checkPriceInputForDigits);

  _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.typeLine.addEventListener('click', () => {
    // Display the dropdown
    _views_searchView__WEBPACK_IMPORTED_MODULE_3__.showTypesDropDown();
    _views_inventorySearchView__WEBPACK_IMPORTED_MODULE_7__.startTypesDropDownNavigation();

    // Start an event listener on the document. This will close the dropdown if the user clicks
    // outside of the input or dropdown. This will also cancel the event listener
    document.addEventListener('click', _views_inventorySearchView__WEBPACK_IMPORTED_MODULE_7__.typeLineListener);
  });

  _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.typeLine.addEventListener('input', () => {
    if (_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.typeDropDown.hasAttribute('hidden')) {
      _views_searchView__WEBPACK_IMPORTED_MODULE_3__.showTypesDropDown();
    }

    _views_searchView__WEBPACK_IMPORTED_MODULE_3__.filterTypes(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.typeLine.value);
    _views_searchView__WEBPACK_IMPORTED_MODULE_3__.filterTypeHeaders();
    _views_inventorySearchView__WEBPACK_IMPORTED_MODULE_7__.startTypesDropDownNavigation();
  });

  _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.setInput.addEventListener('click', () => {
    // Display the dropdown
    _views_searchView__WEBPACK_IMPORTED_MODULE_3__.showSetsDropDown();
    _views_inventorySearchView__WEBPACK_IMPORTED_MODULE_7__.startSetsDropDownNavigation();

    // Start an event listener on the document. This will close the dropdown if the user clicks
    // outside of the input or dropdown. This will also cancel the event listener
    document.addEventListener('click', _views_inventorySearchView__WEBPACK_IMPORTED_MODULE_7__.setInputListener);
  });

  _views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.setInput.addEventListener('input', () => {
    if (_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.setDropDown.hasAttribute('hidden')) {
      _views_searchView__WEBPACK_IMPORTED_MODULE_3__.showSetsDropDown();
    }

    _views_searchView__WEBPACK_IMPORTED_MODULE_3__.filterSets(_views_base__WEBPACK_IMPORTED_MODULE_8__.elements.apiSearch.setInput.value);
    _views_searchView__WEBPACK_IMPORTED_MODULE_3__.filterSetHeaders();
    _views_inventorySearchView__WEBPACK_IMPORTED_MODULE_7__.startSetsDropDownNavigation();
  });
}

if (window.location.pathname.includes('/card')) {
  document.body.style.backgroundColor = '#f5f6f7';
}

// ******************************* \\
// ****** Mobile Nav Button ****** \\
// ******************************* \\

if (document.querySelector('.js--nav-hamburger')) {
  document.querySelector('.js--nav-hamburger').addEventListener('click', () => {
    if (document.querySelector('.js--mobile-links').style.display === 'flex') {
      document.querySelector('.js--mobile-links').style.display = 'none';
    } else {
      document.querySelector('.js--mobile-links').style.display = 'flex';
    }
  });
}

if (
  window.location.pathname.includes('/login') ||
  window.location.pathname.includes('/register')
)
  document.body.style.overflowY = 'hidden';


/***/ }),

/***/ "./src/js/models/Search.js":
/*!*********************************!*\
  !*** ./src/js/models/Search.js ***!
  \*********************************/
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
        enableBtn(_views_base__WEBPACK_IMPORTED_MODULE_1__.elements.resultsPage.nextPageBtn());
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
    displaySelector: () => {
      if (window.innerWidth < 851)
        return document.querySelector('.js--results-display-option-mobile');
      return document.querySelector('.js--results-display-option');
    },
    sortBy: () => {
      if (window.innerWidth < 851)
        return document.querySelector('.js--results-sort-options-mobile');
      return document.querySelector('.js--results-sort-options');
    },
    btn: () => {
      if (window.innerWidth < 851)
        return document.querySelector('.js--results-submit-btn-mobile');
      return document.querySelector('.js--results-submit-btn');
    },
    cardChecklist: document.querySelector('.js--card-checklist'),
    imageGrid: document.querySelector('.js--image-grid'),
    displayBar: document.querySelector('.js--api-display-bar'),
    firstPageBtn: document.querySelector('.js--api-first-page'),
    lastPageBtn: document.querySelector('.js--api-last-page'),
    previousPageBtn: () => {
      if (window.innerWidth < 851)
        return document.querySelector('.js--api-previous-page-mobile');
      return document.querySelector('.js--api-previous-page');
    },
    nextPageBtn: () => {
      if (window.innerWidth < 851)
        return document.querySelector('.js--api-next-page-mobile');
      return document.querySelector('.js--api-next-page');
    },
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
/* harmony export */   "shortenCardName": () => /* binding */ shortenCardName,
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

const shortenCardName = () => {
  const names = Array.from(document.querySelectorAll('.js--card-name'));
  console.log(names);

  names.forEach((n) => {
    if (n.innerText.includes('/')) {
      n.innerHTML = n.innerHTML.substring(0, n.innerHTML.indexOf('/') - 1);
    }
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
  console.log(card);

  const front = card.querySelector('.js--image-grid-card-side-front');

  // If the front is showing, display the backside. Otherwise, display the front
  if (front.classList.contains('js--showing')) showBackSide(card);
  else showFrontSide(card);
};

const generateFlipCardBtn = () => {
  const btn = document.createElement('button');
  btn.classList = 'image-grid__double-btn js--image-grid-flip-card-btn';
  btn.innerHTML = `
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 1024 1024" class="image-grid__double-btn-svg">

    <path d="M884.3,357.6c116.8,117.7,151.7,277-362.2,320V496.4L243.2,763.8L522,1031.3V860.8C828.8,839.4,1244.9,604.5,884.3,357.6z" class="image-grid__double-btn-svg"-color></path>
    <path d="M557.8,288.2v138.4l230.8-213.4L557.8,0v142.8c-309.2,15.6-792.1,253.6-426.5,503.8C13.6,527.9,30,330.1,557.8,288.2z" class="image-grid__double-btn-svg-color"></path>
    </svg>
  `;

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
        <div class="wrapper"><table class="card-checklist js--card-checklist">
            <thead class="js--card-checklist-header">
                <tr class="card-checklist__row card-checklist__row--7 card-checklist__row--header">
                    <th class="card-checklist__data responsive--set">Set</th>
                    <th class="card-checklist__data responsive--name">Name</th>
                    <th class="card-checklist__data responsive--cost">Cost</th>
                    <th class="card-checklist__data responsive--type">Type</th>
                    <th class="card-checklist__data responsive--rarity">Rarity</th>
                    <th class="card-checklist__data responsive--artist">Artist</th>
                    <th class="card-checklist__data responsive--price">Price</th>
                </tr>
            </thead>
            <tbody class="js--card-checklist-body card-checklist-body"></tbody>
        </table></div>
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
  console.log(cards);
  // Create a new table row for each card object
  cards.forEach((card) => {
    const cardNameForUrl = parseCardName(card.name);

    const markup = `
            <tr class="js--checklist-row card-checklist__row ${
              cards.length < 30 ? 'card-checklist__row--body' : ''
            } card-checklist__row--7 data-component="card-tooltip" data-card-img=${checkForImg(
      card
    )}>
                <td class="card-checklist__data card-checklist__data--set responsive--set"><a href="/card/${
                  card.set
                }/${cardNameForUrl}" class="card-checklist__data-link">${
      card.set
    }</a></td>
                <td class="card-checklist__data card-checklist__data--name responsive--name"><a href="/card/${
                  card.set
                }/${cardNameForUrl}" class="card-checklist__data-link">${
      card.name
    }</a></td>
                <td class="card-checklist__data responsive--cost"><a href="/card/${
                  card.set
                }/${cardNameForUrl}" class="card-checklist__data-link">${generateManaCostImages(
      checkForManaCost(card)
    )}</a></td>
                <td class="card-checklist__data responsive--type"><a href="/card/${
                  card.set
                }/${cardNameForUrl}" class="card-checklist__data-link">${shortenTypeLine(
      card.type_line
    )}</a></td>
                <td class="card-checklist__data card-checklist__data--rarity responsive--rarity"><a href="/card/${
                  card.set
                }/${cardNameForUrl}" class="card-checklist__data-link">${
      card.rarity
    }</a></td>
                <td class="card-checklist__data responsive--artist"><a href="/card/${
                  card.set
                }/${cardNameForUrl}" class="card-checklist__data-link">${
      card.artist
    }</a></td>
                <td class="card-checklist__data card-checklist__data--price responsive--price"><a href="/card/${
                  card.set
                }/${cardNameForUrl}" class="card-checklist__data-link card-checklist__data-link--price js--price card-checklist__data-link--center">$ ${
      card.prices.usd || '-'
    }</a></td>
            </tr>
            `;
    // Put the row in the table
    document
      .querySelector('.js--card-checklist-body')
      .insertAdjacentHTML('beforeend', markup);
  });
};

const checkForMissingPrice = () => {
  const prices = Array.from(document.querySelectorAll('.js--price'));

  prices.forEach((price) => {
    if (price.innerText.includes('-')) price.innerText = '';
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

const changeHeaderForSmallChecklist = (cards) => {
  if (cards.length < 30)
    document
      .querySelector('.js--card-checklist-header')
      .classList.add('card-checklist-header');
};

// Funciton to be used in index.js. Takes care of all necessary steps to display cards as a checklist
const displayChecklist = (cards) => {
  clearResults();
  prepChecklistContainer();
  changeHeaderForSmallChecklist(cards);
  generateChecklist(cards);
  checkForMissingPrice();
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
  const newSortMethod = _base__WEBPACK_IMPORTED_MODULE_0__.elements.resultsPage.sortBy().value;

  // If the new sort method is not different, exit the function as to not push a new state
  if (currentSortMethod === newSortMethod) {
    return;
  } else {
    // Disable all four buttons
    // Only doing this because firefox requires a ctrl f5
    disableBtn(_base__WEBPACK_IMPORTED_MODULE_0__.elements.resultsPage.firstPageBtn);
    disableBtn(_base__WEBPACK_IMPORTED_MODULE_0__.elements.resultsPage.nextPageBtn());
    disableBtn(_base__WEBPACK_IMPORTED_MODULE_0__.elements.resultsPage.previousPageBtn());
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
  const newMethod = _base__WEBPACK_IMPORTED_MODULE_0__.elements.resultsPage.displaySelector().value;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9pbmRleC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvYWRhcHRlcnMveGhyLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9heGlvcy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbFRva2VuLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvaXNDYW5jZWwuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvQXhpb3MuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvSW50ZXJjZXB0b3JNYW5hZ2VyLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2J1aWxkRnVsbFBhdGguanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvY3JlYXRlRXJyb3IuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvZGlzcGF0Y2hSZXF1ZXN0LmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2VuaGFuY2VFcnJvci5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9tZXJnZUNvbmZpZy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9zZXR0bGUuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvdHJhbnNmb3JtRGF0YS5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvZGVmYXVsdHMuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYmluZC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9idWlsZFVSTC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9jb21iaW5lVVJMcy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9jb29raWVzLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzQWJzb2x1dGVVUkwuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNBeGlvc0Vycm9yLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzVVJMU2FtZU9yaWdpbi5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3BhcnNlSGVhZGVycy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9zcHJlYWQuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL3V0aWxzLmpzIiwid2VicGFjazovL21hZ2ljLy4vc3JjL2Nzcy9zdHlsZS5jc3MiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9zcmMvY3NzL3ZlbmRvci9tYW5hLmNzcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvY3NzV2l0aE1hcHBpbmdUb1N0cmluZy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9nZXRVcmwuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9hcHAvc3RhdGljL2ltZy9TVkcvYXJyb3ctZG93bjIuc3ZnIiwid2VicGFjazovL21hZ2ljLy4vc3JjL2ltZy9tYW5hLXN5bWJvbHMvbWFuYS5zdmciLCJ3ZWJwYWNrOi8vbWFnaWMvLi9zcmMvY3NzL3N0eWxlLmNzcz85ZmNkIiwid2VicGFjazovL21hZ2ljLy4vc3JjL2Nzcy92ZW5kb3IvbWFuYS5jc3M/MDcwMiIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL3NyYy9qcy9pbmRleC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL3NyYy9qcy9tb2RlbHMvU2VhcmNoLmpzIiwid2VicGFjazovL21hZ2ljLy4vc3JjL2pzL3ZpZXdzL2Jhc2UuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9zcmMvanMvdmlld3MvY2FyZFZpZXcuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9zcmMvanMvdmlld3MvaW52ZW50b3J5U2VhcmNoVmlldy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL3NyYy9qcy92aWV3cy9pbnZlbnRvcnlWaWV3LmpzIiwid2VicGFjazovL21hZ2ljLy4vc3JjL2pzL3ZpZXdzL3Jlc3VsdHNWaWV3LmpzIiwid2VicGFjazovL21hZ2ljLy4vc3JjL2pzL3ZpZXdzL3NlYXJjaFZpZXcuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vbWFnaWMvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vbWFnaWMvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL21hZ2ljL3dlYnBhY2svcnVudGltZS9nbG9iYWwiLCJ3ZWJwYWNrOi8vbWFnaWMvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9tYWdpYy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL21hZ2ljL3dlYnBhY2svcnVudGltZS9wdWJsaWNQYXRoIiwid2VicGFjazovL21hZ2ljL3dlYnBhY2svc3RhcnR1cCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSw0RkFBdUMsQzs7Ozs7Ozs7Ozs7QUNBMUI7O0FBRWIsWUFBWSxtQkFBTyxDQUFDLHFEQUFZO0FBQ2hDLGFBQWEsbUJBQU8sQ0FBQyxpRUFBa0I7QUFDdkMsY0FBYyxtQkFBTyxDQUFDLHlFQUFzQjtBQUM1QyxlQUFlLG1CQUFPLENBQUMsMkVBQXVCO0FBQzlDLG9CQUFvQixtQkFBTyxDQUFDLDZFQUF1QjtBQUNuRCxtQkFBbUIsbUJBQU8sQ0FBQyxtRkFBMkI7QUFDdEQsc0JBQXNCLG1CQUFPLENBQUMseUZBQThCO0FBQzVELGtCQUFrQixtQkFBTyxDQUFDLHlFQUFxQjs7QUFFL0M7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw0Q0FBNEM7QUFDNUM7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7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TUFBTSxlQUFlLEtBQUssS0FBSyxVQUFVLFVBQVUsc0JBQXNCLE1BQU0sWUFBWSxXQUFXLFVBQVUsWUFBWSxnQkFBZ0IsTUFBTSxVQUFVLFlBQVksYUFBYSxhQUFhLGFBQWEsYUFBYSxXQUFXLFlBQVksV0FBVyxVQUFVLFlBQVksYUFBYSxXQUFXLFlBQVksYUFBYSxhQUFhLGtCQUFrQixNQUFNLGlCQUFpQixNQUFNLFVBQVUsWUFBWSxhQUFhLFdBQVcsVUFBVSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxVQUFVLFVBQVUsWUFBWSxrQkFBa0IsTUFBTSxVQUFVLFlBQVksZ0JBQWdCLEtBQUssaUJBQWlCLE1BQU0sa0JBQWtCLE1BQU0sWUFBWSxhQUFhLGFBQWEsYUFBYSxXQUFXLFVBQVUsWUFBWSxtQkFBbUIsTUFBTSxZQUFZLGFBQWEsa0JBQWtCLE1BQU0sS0FBSyxzQkFBc0IsTUFBTSxLQUFLLHNCQUFzQixNQUFNLEtBQUssc0JBQXNCLE1BQU0sVUFBVSxVQUFVLFlBQVksYUFBYSxhQUFhLGtCQUFrQixNQUFNLEtBQUssb0JBQW9CLE1BQU0sS0FBSyxzQkFBc0IsTUFBTSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxVQUFVLFVBQVUsWUFBWSxhQUFhLGFBQWEsZ0JBQWdCLE1BQU0sS0FBSyxZQUFZLHVCQUF1QixNQUFNLGVBQWUsS0FBSyxLQUFLLFVBQVUsb0JBQW9CLE1BQU0sZUFBZSxLQUFLLEtBQUssVUFBVSxvQkFBb0IsTUFBTSxVQUFVLFlBQVksZ0JBQWdCLEtBQUssVUFBVSxVQUFVLFlBQVksV0FBVyxZQUFZLGtCQUFrQixNQUFNLEtBQUssb0JBQW9CLE1BQU0sS0FBSyxvQkFBb0IsTUFBTSxpQkFBaUIsTUFBTSxZQUFZLFdBQVcsWUFBWSxhQUFhLGFBQWEsa0JBQWtCLE1BQU0saUJBQWlCLE1BQU0sS0FBSyxvQkFBb0IsTUFBTSxVQUFVLGlCQUFpQixNQUFNLGVBQWUsS0FBSyxLQUFLLHNCQUFzQixNQUFNLEtBQUssc0JBQXNCLE1BQU0sZUFBZSxLQUFLLEtBQUssc0JBQXNCLE1BQU0sS0FBSyxzQkFBc0IsTUFBTSxpQkFBaUIsTUFBTSxVQUFVLFVBQVUsaUJBQWlCLE1BQU0sS0FBSyxzQkFBc0IsTUFBTSxVQUFVLGlCQUFpQixNQUFNLFlBQVksV0FBVyxZQUFZLGFBQWEsYUFBYSxhQUFhLGFBQWEsV0FBVyxZQUFZLFdBQVcsWUFBWSxhQUFhLGFBQWEsYUFBYSxhQUFhLGFBQWEsYUFBYSxrQkFBa0IsTUFBTSxLQUFLLHNCQUFzQixNQUFNLEtBQUssb0JBQW9CLE1BQU0sS0FBSyxvQkFBb0IsTUFBTSxVQUFVLFVBQVUsaUJBQWlCLE1BQU0sZUFBZSxNQUFNLFlBQVksV0FBVyxVQUFVLFVBQVUsWUFBWSxhQUFhLGFBQWEsYUFBYSxhQUFhLGdCQUFnQixLQUFLLFlBQVksV0FBVyxZQUFZLGFBQWEsV0FBVyxZQUFZLGFBQWEsa0JBQWtCLE1BQU0sVUFBVSxpQkFBaUIsTUFBTSxVQUFVLGlCQUFpQixNQUFNLFVBQVUsWUFBWSxhQUFhLGtCQUFrQixNQUFNLFVBQVUsaUJBQWlCLE1BQU0sVUFBVSxZQUFZLGFBQWEsV0FBVyxVQUFVLFVBQVUsWUFBWSxhQUFhLGtCQUFrQixNQUFNLFVBQVUsVUFBVSxVQUFVLFlBQVksYUFBYSxXQUFXLFlBQVksa0JBQWtCLE1BQU0saUJBQWlCLE1BQU0saUJBQWlCLE1BQU0sWUFBWSxhQUFhLGFBQWEsV0FBVyxVQUFVLFVBQVUsWUFBWSxhQUFhLGtCQUFrQixNQUFNLGlCQUFpQixNQUFNLGVBQWUsTUFBTSxZQUFZLFdBQVcsaUJBQWlCLE1BQU0sZUFBZSxNQUFNLGlCQUFpQixNQUFNLFlBQVksa0JBQWtCLE1BQU0sVUFBVSxVQUFVLGtCQUFrQixNQUFNLGtCQUFrQixNQUFNLFlBQVksV0FBVyxVQUFVLGdCQUFnQixLQUFLLGtCQUFrQixNQUFNLFlBQVksYUFBYSxXQUFXLFVBQVUsWUFBWSxhQUFhLGFBQWEsZ0JBQWdCLE1BQU0sS0FBSyxzQkFBc0IsTUFBTSxLQUFLLG9CQUFvQixNQUFNLFVBQVUsWUFBWSxhQUFhLGFBQWEsYUFBYSxhQUFhLFdBQVcsVUFBVSxZQUFZLFdBQVcsWUFBWSxhQUFhLGFBQWEsYUFBYSxhQUFhLGFBQWEsa0JBQWtCLE1BQU0sVUFBVSxpQkFBaUIsTUFBTSxlQUFlLE1BQU0sWUFBWSxhQUFhLGFBQWEsV0FBVyxZQUFZLGFBQWEsV0FBVyxZQUFZLGFBQWEsV0FBVyxZQUFZLGtCQUFrQixNQUFNLFVBQVUsaUJBQWlCLE1BQU0sVUFBVSxpQkFBaUIsTUFBTSxVQUFVLFlBQVksYUFBYSxhQUFhLFdBQVcsWUFBWSxXQUFXLFVBQVUsaUJBQWlCLE1BQU0saUJBQWlCLE1BQU0saUJBQWlCLE1BQU0saUJBQWlCLE1BQU0sWUFBWSxhQUFhLGtCQUFrQixNQUFNLEtBQUssb0JBQW9CLE1BQU0sVUFBVSxlQUFlLEtBQUssZ0JBQWdCLE1BQU0sVUFBVSxZQUFZLGFBQWEsV0FBVyxZQUFZLGFBQWEsZ0JBQWdCLE1BQU0sS0FBSyx1QkFBdUIsTUFBTSxZQUFZLGFBQWEsYUFBYSxhQUFhLFdBQVcsZUFBZSxLQUFLLEtBQUssVUFBVSxzQkFBc0IsTUFBTSxLQUFLLG9CQUFvQixNQUFNLFVBQVUsZ0JBQWdCLE1BQU0sWUFBWSxhQUFhLGFBQWEsYUFBYSxhQUFhLGlCQUFpQixNQUFNLFVBQVUsWUFBWSxXQUFXLGlCQUFpQixNQUFNLEtBQUssb0JBQW9CLE1BQU0sS0FBSyxvQkFBb0IsTUFBTSxLQUFLLG9CQUFvQixNQUFNLGtCQUFrQixNQUFNLGVBQWUsS0FBSyxLQUFLLHFCQUFxQixNQUFNLGtCQUFrQixNQUFNLFlBQVksYUFBYSxhQUFhLFdBQVcsVUFBVSxlQUFlLEtBQUssS0FBSyxxQkFBcUIsTUFBTSxVQUFVLGlCQUFpQixNQUFNLFVBQVUsZUFBZSxLQUFLLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLFlBQVksV0FBVyxZQUFZLGFBQWEsa0JBQWtCLE1BQU0saUJBQWlCLE1BQU0saUJBQWlCLE1BQU0sZUFBZSxNQUFNLFVBQVUsVUFBVSxZQUFZLGFBQWEsa0JBQWtCLE1BQU0sWUFBWSxrQkFBa0IsTUFBTSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxVQUFVLFVBQVUsWUFBWSxXQUFXLFVBQVUsWUFBWSxhQUFhLGtCQUFrQixNQUFNLGdCQUFnQixNQUFNLFlBQVksV0FBVyxVQUFVLGVBQWUsS0FBSyxVQUFVLGdCQUFnQixNQUFNLGdCQUFnQixLQUFLLGdCQUFnQixNQUFNLFlBQVksV0FBVyxZQUFZLGdCQUFnQixNQUFNLEtBQUssc0JBQXNCLE1BQU0sS0FBSyxzQkFBc0IsTUFBTSxZQUFZLGdCQUFnQixNQUFNLFlBQVksV0FBVyxlQUFlLE1BQU0sVUFBVSxVQUFVLFlBQVksV0FBVyxVQUFVLFlBQVksYUFBYSxrQkFBa0IsTUFBTSxpQkFBaUIsTUFBTSxZQUFZLFdBQVcsVUFBVSxVQUFVLFVBQVUsWUFBWSxhQUFhLGFBQWEsYUFBYSxXQUFXLFlBQVksa0JBQWtCLE1BQU0sVUFBVSxpQkFBaUIsTUFBTSxVQUFVLFVBQVUsaUJBQWlCLE1BQU0sZUFBZSxNQUFNLFVBQVUsZUFBZSxNQUFNLFVBQVUsVUFBVSxZQUFZLGtCQUFrQixNQUFNLFlBQVksV0FBVyxVQUFVLFlBQVksYUFBYSxhQUFhLGFBQWEsZ0JBQWdCLE1BQU0sS0FBSyxvQkFBb0IsTUFBTSxLQUFLLHFCQUFxQixNQUFNLFVBQVUsWUFBWSxXQUFXLFVBQVUsWUFBWSxhQUFhLGtCQUFrQixNQUFNLEtBQUssc0JBQXNCLE1BQU0sS0FBSyxZQUFZLHVCQUF1QixNQUFNLFVBQVUsaUJBQWlCLE1BQU0sVUFBVSxVQUFVLFlBQVksa0JBQWtCLE1BQU0sVUFBVSxVQUFVLFlBQVksZ0JBQWdCLEtBQUssWUFBWSxhQUFhLFdBQVcsWUFBWSxhQUFhLFdBQVcsWUFBWSxhQUFhLGFBQWEsYUFBYSxhQUFhLGFBQWEsYUFBYSxXQUFXLGlCQUFpQixNQUFNLFVBQVUsWUFBWSxrQkFBa0IsTUFBTSxVQUFVLFVBQVUsWUFBWSxrQkFBa0IsTUFBTSxLQUFLLHNCQUFzQixNQUFNLFlBQVksZ0JBQWdCLE1BQU0sVUFBVSxVQUFVLFlBQVksV0FBVyxVQUFVLFlBQVksa0JBQWtCLE1BQU0saUJBQWlCLE1BQU0sWUFBWSxhQUFhLGFBQWEsYUFBYSxhQUFhLGFBQWEsV0FBVyxVQUFVLFlBQVksV0FBVyxZQUFZLGtCQUFrQixNQUFNLEtBQUssb0JBQW9CLE1BQU0sWUFBWSxrQkFBa0IsTUFBTSxVQUFVLGlCQUFpQixNQUFNLFlBQVksYUFBYSxrQkFBa0IsTUFBTSxVQUFVLFVBQVUsWUFBWSxhQUFhLGFBQWEsYUFBYSxrQkFBa0IsTUFBTSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxZQUFZLGtCQUFrQixNQUFNLFlBQVksa0JBQWtCLE1BQU0sWUFBWSxrQkFBa0IsTUFBTSxVQUFVLFlBQVksa0JBQWtCLE1BQU0sVUFBVSxpQkFBaUIsTUFBTSxVQUFVLFlBQVksa0JBQWtCLE1BQU0saUJBQWlCLE1BQU0sVUFBVSxVQUFVLFlBQVksV0FBVyxZQUFZLFdBQVcsWUFBWSxhQUFhLGtCQUFrQixNQUFNLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLGVBQWUsTUFBTSxVQUFVLGlCQUFpQixNQUFNLEtBQUssb0JBQW9CLE1BQU0sVUFBVSxZQUFZLFdBQVcsWUFBWSxXQUFXLFVBQVUsaUJBQWlCLE1BQU0sS0FBSyxvQkFBb0IsTUFBTSxpQkFBaUIsTUFBTSxVQUFVLFVBQVUsaUJBQWlCLE1BQU0sVUFBVSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxVQUFVLFlBQVksYUFBYSxXQUFXLFlBQVksYUFBYSxhQUFhLGFBQWEsa0JBQWtCLE1BQU0sVUFBVSxVQUFVLFlBQVksV0FBVyxZQUFZLGFBQWEsa0JBQWtCLE1BQU0sZUFBZSxLQUFLLGVBQWUsTUFBTSxlQUFlLE1BQU0sZUFBZSxNQUFNLFlBQVksa0JBQWtCLE1BQU0sWUFBWSxnQkFBZ0IsS0FBSyxVQUFVLFlBQVksV0FBVyxZQUFZLGFBQWEsYUFBYSxrQkFBa0IsTUFBTSxZQUFZLGtCQUFrQixNQUFNLGlCQUFpQixNQUFNLFVBQVUsWUFBWSxrQkFBa0IsTUFBTSxpQkFBaUIsTUFBTSxZQUFZLGlCQUFpQixNQUFNLFVBQVUs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WSw4QkFBOEIsRUFBRSxZQUFZLDhCQUE4QixFQUFFLFlBQVksOEJBQThCLEVBQUUsWUFBWSw4QkFBOEIsRUFBRSxZQUFZLDhCQUE4QixFQUFFLFlBQVksOEJBQThCLEVBQUUsWUFBWSw4QkFBOEIsRUFBRSxZQUFZLDhCQUE4QixFQUFFLGVBQWUsNEJBQTRCLEVBQUUsYUFBYSxrQ0FBa0MsRUFBRSxhQUFhLGtDQUFrQyxFQUFFLGFBQWEsa0NBQWtDLEVBQUUsYUFBYSxrQ0FBa0MsRUFBRSxhQUFhLGtDQUFrQyxFQUFFLGFBQWEsa0NBQWtDLEVBQUUsYUFBYSxrQ0FBa0MsRUFBRSxhQUFhLGtDQUFrQyxFQUFFLGFBQWEsa0NBQWtDLEVBQUUsZUFBZSw0QkFBNEIsRUFBRSxZQUFZLGtDQUFrQyxFQUFFLFlBQVksa0NBQWtDLEVBQUUsWUFBWSxrQ0FBa0MsRUFBRSxZQUFZLGtDQUFrQyxFQUFFLFlBQVksa0NBQWtDLEVBQUUsWUFBWSxrQ0FBa0MsRUFBRSxZQUFZLGtDQUFrQyxFQUFFLFlBQVksa0NBQWtDLEVBQUUsWUFBWSxrQ0FBa0MsRUFBRSxlQUFlLDRCQUE0QixFQUFFLGFBQWEsZ0NBQWdDLEVBQUUsYUFBYSxnQ0FBZ0MsRUFBRSxhQUFhLGdDQUFnQyxFQUFFLGFBQWEsZ0NBQWdDLEVBQUUsYUFBYSxnQ0FBZ0MsRUFBRSxhQUFhLGdDQUFnQyxFQUFFLGFBQWEsZ0NBQWdDLEVBQUUsYUFBYSxnQ0FBZ0MsRUFBRSxhQUFhLGdDQUFnQyxFQUFFLGVBQWUsOEJBQThCLEVBQUUsYUFBYSxrQ0FBa0MsRUFBRSxhQUFhLGtDQUFrQyxFQUFFLGFBQWEsa0NBQWtDLEVBQUUsYUFBYSxrQ0FBa0MsRUFBRSxhQUFhLGtDQUFrQyxFQUFFLGFBQWEsa0NBQWtDLEVBQUUsYUFBYSxrQ0FBa0MsRUFBRSxhQUFhLGtDQUFrQyxFQUFFLGFBQWEsa0NBQWtDLEVBQUUsY0FBYywrQkFBK0IsRUFBRSxZQUFZLGtDQUFrQyxFQUFFLGNBQWMsa0NBQWtDLEVBQUUsY0FBYyxrQ0FBa0MsRUFBRSxvQkFBb0IsNkJBQTZCLEVBQUUs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QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzFoQmtDOztBQUVsQztBQUNBO0FBQ0E7O0FBRU87QUFDUCxNQUFNLCtFQUE0QztBQUNsRCxJQUFJLGtGQUErQztBQUNuRCxJQUFJLDRFQUF5QztBQUM3Qzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRU87QUFDUCxPQUFPLCtFQUE0QztBQUNuRCxJQUFJLG9FQUFpQztBQUNyQyxJQUFJLCtFQUE0QztBQUNoRDtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVPO0FBQ1A7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVPO0FBQ1A7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBOztBQUVPO0FBQ1A7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7O0FB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QTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVPO0FBQ1A7O0FBRUE7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRSwyRUFBd0M7QUFDMUM7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxrRUFBa0UsUUFBUTtBQUMxRTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsRUFBRSw4RUFBMkM7QUFDN0M7O0FBRU87QUFDUDtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIsOERBQTJCO0FBQzVDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxvRUFBaUM7QUFDckM7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7VUM5ckJBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3JCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsZ0NBQWdDLFlBQVk7V0FDNUM7V0FDQSxFOzs7OztXQ1BBO1dBQ0E7V0FDQTtXQUNBO1dBQ0Esd0NBQXdDLHlDQUF5QztXQUNqRjtXQUNBO1dBQ0EsRTs7Ozs7V0NQQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLEVBQUU7V0FDRjtXQUNBO1dBQ0EsQ0FBQyxJOzs7OztXQ1BELHNGOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHNEQUFzRCxrQkFBa0I7V0FDeEU7V0FDQSwrQ0FBK0MsY0FBYztXQUM3RCxFOzs7OztXQ05BO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLGtDOzs7O1VDZkE7VUFDQTtVQUNBO1VBQ0EiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9heGlvcycpOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIHNldHRsZSA9IHJlcXVpcmUoJy4vLi4vY29yZS9zZXR0bGUnKTtcbnZhciBjb29raWVzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2Nvb2tpZXMnKTtcbnZhciBidWlsZFVSTCA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9idWlsZFVSTCcpO1xudmFyIGJ1aWxkRnVsbFBhdGggPSByZXF1aXJlKCcuLi9jb3JlL2J1aWxkRnVsbFBhdGgnKTtcbnZhciBwYXJzZUhlYWRlcnMgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvcGFyc2VIZWFkZXJzJyk7XG52YXIgaXNVUkxTYW1lT3JpZ2luID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2lzVVJMU2FtZU9yaWdpbicpO1xudmFyIGNyZWF0ZUVycm9yID0gcmVxdWlyZSgnLi4vY29yZS9jcmVhdGVFcnJvcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHhockFkYXB0ZXIoY29uZmlnKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiBkaXNwYXRjaFhoclJlcXVlc3QocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgdmFyIHJlcXVlc3REYXRhID0gY29uZmlnLmRhdGE7XG4gICAgdmFyIHJlcXVlc3RIZWFkZXJzID0gY29uZmlnLmhlYWRlcnM7XG5cbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShyZXF1ZXN0RGF0YSkpIHtcbiAgICAgIGRlbGV0ZSByZXF1ZXN0SGVhZGVyc1snQ29udGVudC1UeXBlJ107IC8vIExldCB0aGUgYnJvd3NlciBzZXQgaXRcbiAgICB9XG5cbiAgICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgLy8gSFRUUCBiYXNpYyBhdXRoZW50aWNhdGlvblxuICAgIGlmIChjb25maWcuYXV0aCkge1xuICAgICAgdmFyIHVzZXJuYW1lID0gY29uZmlnLmF1dGgudXNlcm5hbWUgfHwgJyc7XG4gICAgICB2YXIgcGFzc3dvcmQgPSBjb25maWcuYXV0aC5wYXNzd29yZCA/IHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChjb25maWcuYXV0aC5wYXNzd29yZCkpIDogJyc7XG4gICAgICByZXF1ZXN0SGVhZGVycy5BdXRob3JpemF0aW9uID0gJ0Jhc2ljICcgKyBidG9hKHVzZXJuYW1lICsgJzonICsgcGFzc3dvcmQpO1xuICAgIH1cblxuICAgIHZhciBmdWxsUGF0aCA9IGJ1aWxkRnVsbFBhdGgoY29uZmlnLmJhc2VVUkwsIGNvbmZpZy51cmwpO1xuICAgIHJlcXVlc3Qub3Blbihjb25maWcubWV0aG9kLnRvVXBwZXJDYXNlKCksIGJ1aWxkVVJMKGZ1bGxQYXRoLCBjb25maWcucGFyYW1zLCBjb25maWcucGFyYW1zU2VyaWFsaXplciksIHRydWUpO1xuXG4gICAgLy8gU2V0IHRoZSByZXF1ZXN0IHRpbWVvdXQgaW4gTVNcbiAgICByZXF1ZXN0LnRpbWVvdXQgPSBjb25maWcudGltZW91dDtcblxuICAgIC8vIExpc3RlbiBmb3IgcmVhZHkgc3RhdGVcbiAgICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uIGhhbmRsZUxvYWQoKSB7XG4gICAgICBpZiAoIXJlcXVlc3QgfHwgcmVxdWVzdC5yZWFkeVN0YXRlICE9PSA0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gVGhlIHJlcXVlc3QgZXJyb3JlZCBvdXQgYW5kIHdlIGRpZG4ndCBnZXQgYSByZXNwb25zZSwgdGhpcyB3aWxsIGJlXG4gICAgICAvLyBoYW5kbGVkIGJ5IG9uZXJyb3IgaW5zdGVhZFxuICAgICAgLy8gV2l0aCBvbmUgZXhjZXB0aW9uOiByZXF1ZXN0IHRoYXQgdXNpbmcgZmlsZTogcHJvdG9jb2wsIG1vc3QgYnJvd3NlcnNcbiAgICAgIC8vIHdpbGwgcmV0dXJuIHN0YXR1cyBhcyAwIGV2ZW4gdGhvdWdoIGl0J3MgYSBzdWNjZXNzZnVsIHJlcXVlc3RcbiAgICAgIGlmIChyZXF1ZXN0LnN0YXR1cyA9PT0gMCAmJiAhKHJlcXVlc3QucmVzcG9uc2VVUkwgJiYgcmVxdWVzdC5yZXNwb25zZVVSTC5pbmRleE9mKCdmaWxlOicpID09PSAwKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFByZXBhcmUgdGhlIHJlc3BvbnNlXG4gICAgICB2YXIgcmVzcG9uc2VIZWFkZXJzID0gJ2dldEFsbFJlc3BvbnNlSGVhZGVycycgaW4gcmVxdWVzdCA/IHBhcnNlSGVhZGVycyhyZXF1ZXN0LmdldEFsbFJlc3BvbnNlSGVhZGVycygpKSA6IG51bGw7XG4gICAgICB2YXIgcmVzcG9uc2VEYXRhID0gIWNvbmZpZy5yZXNwb25zZVR5cGUgfHwgY29uZmlnLnJlc3BvbnNlVHlwZSA9PT0gJ3RleHQnID8gcmVxdWVzdC5yZXNwb25zZVRleHQgOiByZXF1ZXN0LnJlc3BvbnNlO1xuICAgICAgdmFyIHJlc3BvbnNlID0ge1xuICAgICAgICBkYXRhOiByZXNwb25zZURhdGEsXG4gICAgICAgIHN0YXR1czogcmVxdWVzdC5zdGF0dXMsXG4gICAgICAgIHN0YXR1c1RleHQ6IHJlcXVlc3Quc3RhdHVzVGV4dCxcbiAgICAgICAgaGVhZGVyczogcmVzcG9uc2VIZWFkZXJzLFxuICAgICAgICBjb25maWc6IGNvbmZpZyxcbiAgICAgICAgcmVxdWVzdDogcmVxdWVzdFxuICAgICAgfTtcblxuICAgICAgc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgcmVzcG9uc2UpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIGJyb3dzZXIgcmVxdWVzdCBjYW5jZWxsYXRpb24gKGFzIG9wcG9zZWQgdG8gYSBtYW51YWwgY2FuY2VsbGF0aW9uKVxuICAgIHJlcXVlc3Qub25hYm9ydCA9IGZ1bmN0aW9uIGhhbmRsZUFib3J0KCkge1xuICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKCdSZXF1ZXN0IGFib3J0ZWQnLCBjb25maWcsICdFQ09OTkFCT1JURUQnLCByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgbG93IGxldmVsIG5ldHdvcmsgZXJyb3JzXG4gICAgcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24gaGFuZGxlRXJyb3IoKSB7XG4gICAgICAvLyBSZWFsIGVycm9ycyBhcmUgaGlkZGVuIGZyb20gdXMgYnkgdGhlIGJyb3dzZXJcbiAgICAgIC8vIG9uZXJyb3Igc2hvdWxkIG9ubHkgZmlyZSBpZiBpdCdzIGEgbmV0d29yayBlcnJvclxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKCdOZXR3b3JrIEVycm9yJywgY29uZmlnLCBudWxsLCByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgdGltZW91dFxuICAgIHJlcXVlc3Qub250aW1lb3V0ID0gZnVuY3Rpb24gaGFuZGxlVGltZW91dCgpIHtcbiAgICAgIHZhciB0aW1lb3V0RXJyb3JNZXNzYWdlID0gJ3RpbWVvdXQgb2YgJyArIGNvbmZpZy50aW1lb3V0ICsgJ21zIGV4Y2VlZGVkJztcbiAgICAgIGlmIChjb25maWcudGltZW91dEVycm9yTWVzc2FnZSkge1xuICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlID0gY29uZmlnLnRpbWVvdXRFcnJvck1lc3NhZ2U7XG4gICAgICB9XG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IodGltZW91dEVycm9yTWVzc2FnZSwgY29uZmlnLCAnRUNPTk5BQk9SVEVEJyxcbiAgICAgICAgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gQWRkIHhzcmYgaGVhZGVyXG4gICAgLy8gVGhpcyBpcyBvbmx5IGRvbmUgaWYgcnVubmluZyBpbiBhIHN0YW5kYXJkIGJyb3dzZXIgZW52aXJvbm1lbnQuXG4gICAgLy8gU3BlY2lmaWNhbGx5IG5vdCBpZiB3ZSdyZSBpbiBhIHdlYiB3b3JrZXIsIG9yIHJlYWN0LW5hdGl2ZS5cbiAgICBpZiAodXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSkge1xuICAgICAgLy8gQWRkIHhzcmYgaGVhZGVyXG4gICAgICB2YXIgeHNyZlZhbHVlID0gKGNvbmZpZy53aXRoQ3JlZGVudGlhbHMgfHwgaXNVUkxTYW1lT3JpZ2luKGZ1bGxQYXRoKSkgJiYgY29uZmlnLnhzcmZDb29raWVOYW1lID9cbiAgICAgICAgY29va2llcy5yZWFkKGNvbmZpZy54c3JmQ29va2llTmFtZSkgOlxuICAgICAgICB1bmRlZmluZWQ7XG5cbiAgICAgIGlmICh4c3JmVmFsdWUpIHtcbiAgICAgICAgcmVxdWVzdEhlYWRlcnNbY29uZmlnLnhzcmZIZWFkZXJOYW1lXSA9IHhzcmZWYWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBZGQgaGVhZGVycyB0byB0aGUgcmVxdWVzdFxuICAgIGlmICgnc2V0UmVxdWVzdEhlYWRlcicgaW4gcmVxdWVzdCkge1xuICAgICAgdXRpbHMuZm9yRWFjaChyZXF1ZXN0SGVhZGVycywgZnVuY3Rpb24gc2V0UmVxdWVzdEhlYWRlcih2YWwsIGtleSkge1xuICAgICAgICBpZiAodHlwZW9mIHJlcXVlc3REYXRhID09PSAndW5kZWZpbmVkJyAmJiBrZXkudG9Mb3dlckNhc2UoKSA9PT0gJ2NvbnRlbnQtdHlwZScpIHtcbiAgICAgICAgICAvLyBSZW1vdmUgQ29udGVudC1UeXBlIGlmIGRhdGEgaXMgdW5kZWZpbmVkXG4gICAgICAgICAgZGVsZXRlIHJlcXVlc3RIZWFkZXJzW2tleV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gT3RoZXJ3aXNlIGFkZCBoZWFkZXIgdG8gdGhlIHJlcXVlc3RcbiAgICAgICAgICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoa2V5LCB2YWwpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBBZGQgd2l0aENyZWRlbnRpYWxzIHRvIHJlcXVlc3QgaWYgbmVlZGVkXG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcud2l0aENyZWRlbnRpYWxzKSkge1xuICAgICAgcmVxdWVzdC53aXRoQ3JlZGVudGlhbHMgPSAhIWNvbmZpZy53aXRoQ3JlZGVudGlhbHM7XG4gICAgfVxuXG4gICAgLy8gQWRkIHJlc3BvbnNlVHlwZSB0byByZXF1ZXN0IGlmIG5lZWRlZFxuICAgIGlmIChjb25maWcucmVzcG9uc2VUeXBlKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9IGNvbmZpZy5yZXNwb25zZVR5cGU7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIEV4cGVjdGVkIERPTUV4Y2VwdGlvbiB0aHJvd24gYnkgYnJvd3NlcnMgbm90IGNvbXBhdGlibGUgWE1MSHR0cFJlcXVlc3QgTGV2ZWwgMi5cbiAgICAgICAgLy8gQnV0LCB0aGlzIGNhbiBiZSBzdXBwcmVzc2VkIGZvciAnanNvbicgdHlwZSBhcyBpdCBjYW4gYmUgcGFyc2VkIGJ5IGRlZmF1bHQgJ3RyYW5zZm9ybVJlc3BvbnNlJyBmdW5jdGlvbi5cbiAgICAgICAgaWYgKGNvbmZpZy5yZXNwb25zZVR5cGUgIT09ICdqc29uJykge1xuICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgcHJvZ3Jlc3MgaWYgbmVlZGVkXG4gICAgaWYgKHR5cGVvZiBjb25maWcub25Eb3dubG9hZFByb2dyZXNzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgY29uZmlnLm9uRG93bmxvYWRQcm9ncmVzcyk7XG4gICAgfVxuXG4gICAgLy8gTm90IGFsbCBicm93c2VycyBzdXBwb3J0IHVwbG9hZCBldmVudHNcbiAgICBpZiAodHlwZW9mIGNvbmZpZy5vblVwbG9hZFByb2dyZXNzID09PSAnZnVuY3Rpb24nICYmIHJlcXVlc3QudXBsb2FkKSB7XG4gICAgICByZXF1ZXN0LnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGNvbmZpZy5vblVwbG9hZFByb2dyZXNzKTtcbiAgICB9XG5cbiAgICBpZiAoY29uZmlnLmNhbmNlbFRva2VuKSB7XG4gICAgICAvLyBIYW5kbGUgY2FuY2VsbGF0aW9uXG4gICAgICBjb25maWcuY2FuY2VsVG9rZW4ucHJvbWlzZS50aGVuKGZ1bmN0aW9uIG9uQ2FuY2VsZWQoY2FuY2VsKSB7XG4gICAgICAgIGlmICghcmVxdWVzdCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlcXVlc3QuYWJvcnQoKTtcbiAgICAgICAgcmVqZWN0KGNhbmNlbCk7XG4gICAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoIXJlcXVlc3REYXRhKSB7XG4gICAgICByZXF1ZXN0RGF0YSA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gU2VuZCB0aGUgcmVxdWVzdFxuICAgIHJlcXVlc3Quc2VuZChyZXF1ZXN0RGF0YSk7XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIGJpbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvYmluZCcpO1xudmFyIEF4aW9zID0gcmVxdWlyZSgnLi9jb3JlL0F4aW9zJyk7XG52YXIgbWVyZ2VDb25maWcgPSByZXF1aXJlKCcuL2NvcmUvbWVyZ2VDb25maWcnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4vZGVmYXVsdHMnKTtcblxuLyoqXG4gKiBDcmVhdGUgYW4gaW5zdGFuY2Ugb2YgQXhpb3NcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZGVmYXVsdENvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICogQHJldHVybiB7QXhpb3N9IEEgbmV3IGluc3RhbmNlIG9mIEF4aW9zXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUluc3RhbmNlKGRlZmF1bHRDb25maWcpIHtcbiAgdmFyIGNvbnRleHQgPSBuZXcgQXhpb3MoZGVmYXVsdENvbmZpZyk7XG4gIHZhciBpbnN0YW5jZSA9IGJpbmQoQXhpb3MucHJvdG90eXBlLnJlcXVlc3QsIGNvbnRleHQpO1xuXG4gIC8vIENvcHkgYXhpb3MucHJvdG90eXBlIHRvIGluc3RhbmNlXG4gIHV0aWxzLmV4dGVuZChpbnN0YW5jZSwgQXhpb3MucHJvdG90eXBlLCBjb250ZXh0KTtcblxuICAvLyBDb3B5IGNvbnRleHQgdG8gaW5zdGFuY2VcbiAgdXRpbHMuZXh0ZW5kKGluc3RhbmNlLCBjb250ZXh0KTtcblxuICByZXR1cm4gaW5zdGFuY2U7XG59XG5cbi8vIENyZWF0ZSB0aGUgZGVmYXVsdCBpbnN0YW5jZSB0byBiZSBleHBvcnRlZFxudmFyIGF4aW9zID0gY3JlYXRlSW5zdGFuY2UoZGVmYXVsdHMpO1xuXG4vLyBFeHBvc2UgQXhpb3MgY2xhc3MgdG8gYWxsb3cgY2xhc3MgaW5oZXJpdGFuY2VcbmF4aW9zLkF4aW9zID0gQXhpb3M7XG5cbi8vIEZhY3RvcnkgZm9yIGNyZWF0aW5nIG5ldyBpbnN0YW5jZXNcbmF4aW9zLmNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZShpbnN0YW5jZUNvbmZpZykge1xuICByZXR1cm4gY3JlYXRlSW5zdGFuY2UobWVyZ2VDb25maWcoYXhpb3MuZGVmYXVsdHMsIGluc3RhbmNlQ29uZmlnKSk7XG59O1xuXG4vLyBFeHBvc2UgQ2FuY2VsICYgQ2FuY2VsVG9rZW5cbmF4aW9zLkNhbmNlbCA9IHJlcXVpcmUoJy4vY2FuY2VsL0NhbmNlbCcpO1xuYXhpb3MuQ2FuY2VsVG9rZW4gPSByZXF1aXJlKCcuL2NhbmNlbC9DYW5jZWxUb2tlbicpO1xuYXhpb3MuaXNDYW5jZWwgPSByZXF1aXJlKCcuL2NhbmNlbC9pc0NhbmNlbCcpO1xuXG4vLyBFeHBvc2UgYWxsL3NwcmVhZFxuYXhpb3MuYWxsID0gZnVuY3Rpb24gYWxsKHByb21pc2VzKSB7XG4gIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcyk7XG59O1xuYXhpb3Muc3ByZWFkID0gcmVxdWlyZSgnLi9oZWxwZXJzL3NwcmVhZCcpO1xuXG4vLyBFeHBvc2UgaXNBeGlvc0Vycm9yXG5heGlvcy5pc0F4aW9zRXJyb3IgPSByZXF1aXJlKCcuL2hlbHBlcnMvaXNBeGlvc0Vycm9yJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gYXhpb3M7XG5cbi8vIEFsbG93IHVzZSBvZiBkZWZhdWx0IGltcG9ydCBzeW50YXggaW4gVHlwZVNjcmlwdFxubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGF4aW9zO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEEgYENhbmNlbGAgaXMgYW4gb2JqZWN0IHRoYXQgaXMgdGhyb3duIHdoZW4gYW4gb3BlcmF0aW9uIGlzIGNhbmNlbGVkLlxuICpcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtzdHJpbmc9fSBtZXNzYWdlIFRoZSBtZXNzYWdlLlxuICovXG5mdW5jdGlvbiBDYW5jZWwobWVzc2FnZSkge1xuICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xufVxuXG5DYW5jZWwucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gIHJldHVybiAnQ2FuY2VsJyArICh0aGlzLm1lc3NhZ2UgPyAnOiAnICsgdGhpcy5tZXNzYWdlIDogJycpO1xufTtcblxuQ2FuY2VsLnByb3RvdHlwZS5fX0NBTkNFTF9fID0gdHJ1ZTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW5jZWw7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDYW5jZWwgPSByZXF1aXJlKCcuL0NhbmNlbCcpO1xuXG4vKipcbiAqIEEgYENhbmNlbFRva2VuYCBpcyBhbiBvYmplY3QgdGhhdCBjYW4gYmUgdXNlZCB0byByZXF1ZXN0IGNhbmNlbGxhdGlvbiBvZiBhbiBvcGVyYXRpb24uXG4gKlxuICogQGNsYXNzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBleGVjdXRvciBUaGUgZXhlY3V0b3IgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIENhbmNlbFRva2VuKGV4ZWN1dG9yKSB7XG4gIGlmICh0eXBlb2YgZXhlY3V0b3IgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdleGVjdXRvciBtdXN0IGJlIGEgZnVuY3Rpb24uJyk7XG4gIH1cblxuICB2YXIgcmVzb2x2ZVByb21pc2U7XG4gIHRoaXMucHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIHByb21pc2VFeGVjdXRvcihyZXNvbHZlKSB7XG4gICAgcmVzb2x2ZVByb21pc2UgPSByZXNvbHZlO1xuICB9KTtcblxuICB2YXIgdG9rZW4gPSB0aGlzO1xuICBleGVjdXRvcihmdW5jdGlvbiBjYW5jZWwobWVzc2FnZSkge1xuICAgIGlmICh0b2tlbi5yZWFzb24pIHtcbiAgICAgIC8vIENhbmNlbGxhdGlvbiBoYXMgYWxyZWFkeSBiZWVuIHJlcXVlc3RlZFxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRva2VuLnJlYXNvbiA9IG5ldyBDYW5jZWwobWVzc2FnZSk7XG4gICAgcmVzb2x2ZVByb21pc2UodG9rZW4ucmVhc29uKTtcbiAgfSk7XG59XG5cbi8qKlxuICogVGhyb3dzIGEgYENhbmNlbGAgaWYgY2FuY2VsbGF0aW9uIGhhcyBiZWVuIHJlcXVlc3RlZC5cbiAqL1xuQ2FuY2VsVG9rZW4ucHJvdG90eXBlLnRocm93SWZSZXF1ZXN0ZWQgPSBmdW5jdGlvbiB0aHJvd0lmUmVxdWVzdGVkKCkge1xuICBpZiAodGhpcy5yZWFzb24pIHtcbiAgICB0aHJvdyB0aGlzLnJlYXNvbjtcbiAgfVxufTtcblxuLyoqXG4gKiBSZXR1cm5zIGFuIG9iamVjdCB0aGF0IGNvbnRhaW5zIGEgbmV3IGBDYW5jZWxUb2tlbmAgYW5kIGEgZnVuY3Rpb24gdGhhdCwgd2hlbiBjYWxsZWQsXG4gKiBjYW5jZWxzIHRoZSBgQ2FuY2VsVG9rZW5gLlxuICovXG5DYW5jZWxUb2tlbi5zb3VyY2UgPSBmdW5jdGlvbiBzb3VyY2UoKSB7XG4gIHZhciBjYW5jZWw7XG4gIHZhciB0b2tlbiA9IG5ldyBDYW5jZWxUb2tlbihmdW5jdGlvbiBleGVjdXRvcihjKSB7XG4gICAgY2FuY2VsID0gYztcbiAgfSk7XG4gIHJldHVybiB7XG4gICAgdG9rZW46IHRva2VuLFxuICAgIGNhbmNlbDogY2FuY2VsXG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbmNlbFRva2VuO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQ2FuY2VsKHZhbHVlKSB7XG4gIHJldHVybiAhISh2YWx1ZSAmJiB2YWx1ZS5fX0NBTkNFTF9fKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBidWlsZFVSTCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvYnVpbGRVUkwnKTtcbnZhciBJbnRlcmNlcHRvck1hbmFnZXIgPSByZXF1aXJlKCcuL0ludGVyY2VwdG9yTWFuYWdlcicpO1xudmFyIGRpc3BhdGNoUmVxdWVzdCA9IHJlcXVpcmUoJy4vZGlzcGF0Y2hSZXF1ZXN0Jyk7XG52YXIgbWVyZ2VDb25maWcgPSByZXF1aXJlKCcuL21lcmdlQ29uZmlnJyk7XG5cbi8qKlxuICogQ3JlYXRlIGEgbmV3IGluc3RhbmNlIG9mIEF4aW9zXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGluc3RhbmNlQ29uZmlnIFRoZSBkZWZhdWx0IGNvbmZpZyBmb3IgdGhlIGluc3RhbmNlXG4gKi9cbmZ1bmN0aW9uIEF4aW9zKGluc3RhbmNlQ29uZmlnKSB7XG4gIHRoaXMuZGVmYXVsdHMgPSBpbnN0YW5jZUNvbmZpZztcbiAgdGhpcy5pbnRlcmNlcHRvcnMgPSB7XG4gICAgcmVxdWVzdDogbmV3IEludGVyY2VwdG9yTWFuYWdlcigpLFxuICAgIHJlc3BvbnNlOiBuZXcgSW50ZXJjZXB0b3JNYW5hZ2VyKClcbiAgfTtcbn1cblxuLyoqXG4gKiBEaXNwYXRjaCBhIHJlcXVlc3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcgc3BlY2lmaWMgZm9yIHRoaXMgcmVxdWVzdCAobWVyZ2VkIHdpdGggdGhpcy5kZWZhdWx0cylcbiAqL1xuQXhpb3MucHJvdG90eXBlLnJlcXVlc3QgPSBmdW5jdGlvbiByZXF1ZXN0KGNvbmZpZykge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgLy8gQWxsb3cgZm9yIGF4aW9zKCdleGFtcGxlL3VybCdbLCBjb25maWddKSBhIGxhIGZldGNoIEFQSVxuICBpZiAodHlwZW9mIGNvbmZpZyA9PT0gJ3N0cmluZycpIHtcbiAgICBjb25maWcgPSBhcmd1bWVudHNbMV0gfHwge307XG4gICAgY29uZmlnLnVybCA9IGFyZ3VtZW50c1swXTtcbiAgfSBlbHNlIHtcbiAgICBjb25maWcgPSBjb25maWcgfHwge307XG4gIH1cblxuICBjb25maWcgPSBtZXJnZUNvbmZpZyh0aGlzLmRlZmF1bHRzLCBjb25maWcpO1xuXG4gIC8vIFNldCBjb25maWcubWV0aG9kXG4gIGlmIChjb25maWcubWV0aG9kKSB7XG4gICAgY29uZmlnLm1ldGhvZCA9IGNvbmZpZy5tZXRob2QudG9Mb3dlckNhc2UoKTtcbiAgfSBlbHNlIGlmICh0aGlzLmRlZmF1bHRzLm1ldGhvZCkge1xuICAgIGNvbmZpZy5tZXRob2QgPSB0aGlzLmRlZmF1bHRzLm1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuICB9IGVsc2Uge1xuICAgIGNvbmZpZy5tZXRob2QgPSAnZ2V0JztcbiAgfVxuXG4gIC8vIEhvb2sgdXAgaW50ZXJjZXB0b3JzIG1pZGRsZXdhcmVcbiAgdmFyIGNoYWluID0gW2Rpc3BhdGNoUmVxdWVzdCwgdW5kZWZpbmVkXTtcbiAgdmFyIHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoY29uZmlnKTtcblxuICB0aGlzLmludGVyY2VwdG9ycy5yZXF1ZXN0LmZvckVhY2goZnVuY3Rpb24gdW5zaGlmdFJlcXVlc3RJbnRlcmNlcHRvcnMoaW50ZXJjZXB0b3IpIHtcbiAgICBjaGFpbi51bnNoaWZ0KGludGVyY2VwdG9yLmZ1bGZpbGxlZCwgaW50ZXJjZXB0b3IucmVqZWN0ZWQpO1xuICB9KTtcblxuICB0aGlzLmludGVyY2VwdG9ycy5yZXNwb25zZS5mb3JFYWNoKGZ1bmN0aW9uIHB1c2hSZXNwb25zZUludGVyY2VwdG9ycyhpbnRlcmNlcHRvcikge1xuICAgIGNoYWluLnB1c2goaW50ZXJjZXB0b3IuZnVsZmlsbGVkLCBpbnRlcmNlcHRvci5yZWplY3RlZCk7XG4gIH0pO1xuXG4gIHdoaWxlIChjaGFpbi5sZW5ndGgpIHtcbiAgICBwcm9taXNlID0gcHJvbWlzZS50aGVuKGNoYWluLnNoaWZ0KCksIGNoYWluLnNoaWZ0KCkpO1xuICB9XG5cbiAgcmV0dXJuIHByb21pc2U7XG59O1xuXG5BeGlvcy5wcm90b3R5cGUuZ2V0VXJpID0gZnVuY3Rpb24gZ2V0VXJpKGNvbmZpZykge1xuICBjb25maWcgPSBtZXJnZUNvbmZpZyh0aGlzLmRlZmF1bHRzLCBjb25maWcpO1xuICByZXR1cm4gYnVpbGRVUkwoY29uZmlnLnVybCwgY29uZmlnLnBhcmFtcywgY29uZmlnLnBhcmFtc1NlcmlhbGl6ZXIpLnJlcGxhY2UoL15cXD8vLCAnJyk7XG59O1xuXG4vLyBQcm92aWRlIGFsaWFzZXMgZm9yIHN1cHBvcnRlZCByZXF1ZXN0IG1ldGhvZHNcbnV0aWxzLmZvckVhY2goWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnLCAnb3B0aW9ucyddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kTm9EYXRhKG1ldGhvZCkge1xuICAvKmVzbGludCBmdW5jLW5hbWVzOjAqL1xuICBBeGlvcy5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHVybCwgY29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChtZXJnZUNvbmZpZyhjb25maWcgfHwge30sIHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgdXJsOiB1cmwsXG4gICAgICBkYXRhOiAoY29uZmlnIHx8IHt9KS5kYXRhXG4gICAgfSkpO1xuICB9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIC8qZXNsaW50IGZ1bmMtbmFtZXM6MCovXG4gIEF4aW9zLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24odXJsLCBkYXRhLCBjb25maWcpIHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KG1lcmdlQ29uZmlnKGNvbmZpZyB8fCB7fSwge1xuICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICB1cmw6IHVybCxcbiAgICAgIGRhdGE6IGRhdGFcbiAgICB9KSk7XG4gIH07XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBeGlvcztcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBJbnRlcmNlcHRvck1hbmFnZXIoKSB7XG4gIHRoaXMuaGFuZGxlcnMgPSBbXTtcbn1cblxuLyoqXG4gKiBBZGQgYSBuZXcgaW50ZXJjZXB0b3IgdG8gdGhlIHN0YWNrXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVsZmlsbGVkIFRoZSBmdW5jdGlvbiB0byBoYW5kbGUgYHRoZW5gIGZvciBhIGBQcm9taXNlYFxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0ZWQgVGhlIGZ1bmN0aW9uIHRvIGhhbmRsZSBgcmVqZWN0YCBmb3IgYSBgUHJvbWlzZWBcbiAqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IEFuIElEIHVzZWQgdG8gcmVtb3ZlIGludGVyY2VwdG9yIGxhdGVyXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24gdXNlKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpIHtcbiAgdGhpcy5oYW5kbGVycy5wdXNoKHtcbiAgICBmdWxmaWxsZWQ6IGZ1bGZpbGxlZCxcbiAgICByZWplY3RlZDogcmVqZWN0ZWRcbiAgfSk7XG4gIHJldHVybiB0aGlzLmhhbmRsZXJzLmxlbmd0aCAtIDE7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbiBpbnRlcmNlcHRvciBmcm9tIHRoZSBzdGFja1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBpZCBUaGUgSUQgdGhhdCB3YXMgcmV0dXJuZWQgYnkgYHVzZWBcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS5lamVjdCA9IGZ1bmN0aW9uIGVqZWN0KGlkKSB7XG4gIGlmICh0aGlzLmhhbmRsZXJzW2lkXSkge1xuICAgIHRoaXMuaGFuZGxlcnNbaWRdID0gbnVsbDtcbiAgfVxufTtcblxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgYWxsIHRoZSByZWdpc3RlcmVkIGludGVyY2VwdG9yc1xuICpcbiAqIFRoaXMgbWV0aG9kIGlzIHBhcnRpY3VsYXJseSB1c2VmdWwgZm9yIHNraXBwaW5nIG92ZXIgYW55XG4gKiBpbnRlcmNlcHRvcnMgdGhhdCBtYXkgaGF2ZSBiZWNvbWUgYG51bGxgIGNhbGxpbmcgYGVqZWN0YC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCBpbnRlcmNlcHRvclxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbiBmb3JFYWNoKGZuKSB7XG4gIHV0aWxzLmZvckVhY2godGhpcy5oYW5kbGVycywgZnVuY3Rpb24gZm9yRWFjaEhhbmRsZXIoaCkge1xuICAgIGlmIChoICE9PSBudWxsKSB7XG4gICAgICBmbihoKTtcbiAgICB9XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmNlcHRvck1hbmFnZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBpc0Fic29sdXRlVVJMID0gcmVxdWlyZSgnLi4vaGVscGVycy9pc0Fic29sdXRlVVJMJyk7XG52YXIgY29tYmluZVVSTHMgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2NvbWJpbmVVUkxzJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBiYXNlVVJMIHdpdGggdGhlIHJlcXVlc3RlZFVSTCxcbiAqIG9ubHkgd2hlbiB0aGUgcmVxdWVzdGVkVVJMIGlzIG5vdCBhbHJlYWR5IGFuIGFic29sdXRlIFVSTC5cbiAqIElmIHRoZSByZXF1ZXN0VVJMIGlzIGFic29sdXRlLCB0aGlzIGZ1bmN0aW9uIHJldHVybnMgdGhlIHJlcXVlc3RlZFVSTCB1bnRvdWNoZWQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VVUkwgVGhlIGJhc2UgVVJMXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVxdWVzdGVkVVJMIEFic29sdXRlIG9yIHJlbGF0aXZlIFVSTCB0byBjb21iaW5lXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgY29tYmluZWQgZnVsbCBwYXRoXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYnVpbGRGdWxsUGF0aChiYXNlVVJMLCByZXF1ZXN0ZWRVUkwpIHtcbiAgaWYgKGJhc2VVUkwgJiYgIWlzQWJzb2x1dGVVUkwocmVxdWVzdGVkVVJMKSkge1xuICAgIHJldHVybiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZXF1ZXN0ZWRVUkwpO1xuICB9XG4gIHJldHVybiByZXF1ZXN0ZWRVUkw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZW5oYW5jZUVycm9yID0gcmVxdWlyZSgnLi9lbmhhbmNlRXJyb3InKTtcblxuLyoqXG4gKiBDcmVhdGUgYW4gRXJyb3Igd2l0aCB0aGUgc3BlY2lmaWVkIG1lc3NhZ2UsIGNvbmZpZywgZXJyb3IgY29kZSwgcmVxdWVzdCBhbmQgcmVzcG9uc2UuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgVGhlIGVycm9yIG1lc3NhZ2UuXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcuXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvZGVdIFRoZSBlcnJvciBjb2RlIChmb3IgZXhhbXBsZSwgJ0VDT05OQUJPUlRFRCcpLlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXF1ZXN0XSBUaGUgcmVxdWVzdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVzcG9uc2VdIFRoZSByZXNwb25zZS5cbiAqIEByZXR1cm5zIHtFcnJvcn0gVGhlIGNyZWF0ZWQgZXJyb3IuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlRXJyb3IobWVzc2FnZSwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSkge1xuICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IobWVzc2FnZSk7XG4gIHJldHVybiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIHRyYW5zZm9ybURhdGEgPSByZXF1aXJlKCcuL3RyYW5zZm9ybURhdGEnKTtcbnZhciBpc0NhbmNlbCA9IHJlcXVpcmUoJy4uL2NhbmNlbC9pc0NhbmNlbCcpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi4vZGVmYXVsdHMnKTtcblxuLyoqXG4gKiBUaHJvd3MgYSBgQ2FuY2VsYCBpZiBjYW5jZWxsYXRpb24gaGFzIGJlZW4gcmVxdWVzdGVkLlxuICovXG5mdW5jdGlvbiB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZykge1xuICBpZiAoY29uZmlnLmNhbmNlbFRva2VuKSB7XG4gICAgY29uZmlnLmNhbmNlbFRva2VuLnRocm93SWZSZXF1ZXN0ZWQoKTtcbiAgfVxufVxuXG4vKipcbiAqIERpc3BhdGNoIGEgcmVxdWVzdCB0byB0aGUgc2VydmVyIHVzaW5nIHRoZSBjb25maWd1cmVkIGFkYXB0ZXIuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnIHRoYXQgaXMgdG8gYmUgdXNlZCBmb3IgdGhlIHJlcXVlc3RcbiAqIEByZXR1cm5zIHtQcm9taXNlfSBUaGUgUHJvbWlzZSB0byBiZSBmdWxmaWxsZWRcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkaXNwYXRjaFJlcXVlc3QoY29uZmlnKSB7XG4gIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAvLyBFbnN1cmUgaGVhZGVycyBleGlzdFxuICBjb25maWcuaGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzIHx8IHt9O1xuXG4gIC8vIFRyYW5zZm9ybSByZXF1ZXN0IGRhdGFcbiAgY29uZmlnLmRhdGEgPSB0cmFuc2Zvcm1EYXRhKFxuICAgIGNvbmZpZy5kYXRhLFxuICAgIGNvbmZpZy5oZWFkZXJzLFxuICAgIGNvbmZpZy50cmFuc2Zvcm1SZXF1ZXN0XG4gICk7XG5cbiAgLy8gRmxhdHRlbiBoZWFkZXJzXG4gIGNvbmZpZy5oZWFkZXJzID0gdXRpbHMubWVyZ2UoXG4gICAgY29uZmlnLmhlYWRlcnMuY29tbW9uIHx8IHt9LFxuICAgIGNvbmZpZy5oZWFkZXJzW2NvbmZpZy5tZXRob2RdIHx8IHt9LFxuICAgIGNvbmZpZy5oZWFkZXJzXG4gICk7XG5cbiAgdXRpbHMuZm9yRWFjaChcbiAgICBbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCcsICdwb3N0JywgJ3B1dCcsICdwYXRjaCcsICdjb21tb24nXSxcbiAgICBmdW5jdGlvbiBjbGVhbkhlYWRlckNvbmZpZyhtZXRob2QpIHtcbiAgICAgIGRlbGV0ZSBjb25maWcuaGVhZGVyc1ttZXRob2RdO1xuICAgIH1cbiAgKTtcblxuICB2YXIgYWRhcHRlciA9IGNvbmZpZy5hZGFwdGVyIHx8IGRlZmF1bHRzLmFkYXB0ZXI7XG5cbiAgcmV0dXJuIGFkYXB0ZXIoY29uZmlnKS50aGVuKGZ1bmN0aW9uIG9uQWRhcHRlclJlc29sdXRpb24ocmVzcG9uc2UpIHtcbiAgICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgICAvLyBUcmFuc2Zvcm0gcmVzcG9uc2UgZGF0YVxuICAgIHJlc3BvbnNlLmRhdGEgPSB0cmFuc2Zvcm1EYXRhKFxuICAgICAgcmVzcG9uc2UuZGF0YSxcbiAgICAgIHJlc3BvbnNlLmhlYWRlcnMsXG4gICAgICBjb25maWcudHJhbnNmb3JtUmVzcG9uc2VcbiAgICApO1xuXG4gICAgcmV0dXJuIHJlc3BvbnNlO1xuICB9LCBmdW5jdGlvbiBvbkFkYXB0ZXJSZWplY3Rpb24ocmVhc29uKSB7XG4gICAgaWYgKCFpc0NhbmNlbChyZWFzb24pKSB7XG4gICAgICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgICAgIC8vIFRyYW5zZm9ybSByZXNwb25zZSBkYXRhXG4gICAgICBpZiAocmVhc29uICYmIHJlYXNvbi5yZXNwb25zZSkge1xuICAgICAgICByZWFzb24ucmVzcG9uc2UuZGF0YSA9IHRyYW5zZm9ybURhdGEoXG4gICAgICAgICAgcmVhc29uLnJlc3BvbnNlLmRhdGEsXG4gICAgICAgICAgcmVhc29uLnJlc3BvbnNlLmhlYWRlcnMsXG4gICAgICAgICAgY29uZmlnLnRyYW5zZm9ybVJlc3BvbnNlXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHJlYXNvbik7XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBVcGRhdGUgYW4gRXJyb3Igd2l0aCB0aGUgc3BlY2lmaWVkIGNvbmZpZywgZXJyb3IgY29kZSwgYW5kIHJlc3BvbnNlLlxuICpcbiAqIEBwYXJhbSB7RXJyb3J9IGVycm9yIFRoZSBlcnJvciB0byB1cGRhdGUuXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcuXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvZGVdIFRoZSBlcnJvciBjb2RlIChmb3IgZXhhbXBsZSwgJ0VDT05OQUJPUlRFRCcpLlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXF1ZXN0XSBUaGUgcmVxdWVzdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVzcG9uc2VdIFRoZSByZXNwb25zZS5cbiAqIEByZXR1cm5zIHtFcnJvcn0gVGhlIGVycm9yLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGVuaGFuY2VFcnJvcihlcnJvciwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSkge1xuICBlcnJvci5jb25maWcgPSBjb25maWc7XG4gIGlmIChjb2RlKSB7XG4gICAgZXJyb3IuY29kZSA9IGNvZGU7XG4gIH1cblxuICBlcnJvci5yZXF1ZXN0ID0gcmVxdWVzdDtcbiAgZXJyb3IucmVzcG9uc2UgPSByZXNwb25zZTtcbiAgZXJyb3IuaXNBeGlvc0Vycm9yID0gdHJ1ZTtcblxuICBlcnJvci50b0pTT04gPSBmdW5jdGlvbiB0b0pTT04oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIFN0YW5kYXJkXG4gICAgICBtZXNzYWdlOiB0aGlzLm1lc3NhZ2UsXG4gICAgICBuYW1lOiB0aGlzLm5hbWUsXG4gICAgICAvLyBNaWNyb3NvZnRcbiAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLmRlc2NyaXB0aW9uLFxuICAgICAgbnVtYmVyOiB0aGlzLm51bWJlcixcbiAgICAgIC8vIE1vemlsbGFcbiAgICAgIGZpbGVOYW1lOiB0aGlzLmZpbGVOYW1lLFxuICAgICAgbGluZU51bWJlcjogdGhpcy5saW5lTnVtYmVyLFxuICAgICAgY29sdW1uTnVtYmVyOiB0aGlzLmNvbHVtbk51bWJlcixcbiAgICAgIHN0YWNrOiB0aGlzLnN0YWNrLFxuICAgICAgLy8gQXhpb3NcbiAgICAgIGNvbmZpZzogdGhpcy5jb25maWcsXG4gICAgICBjb2RlOiB0aGlzLmNvZGVcbiAgICB9O1xuICB9O1xuICByZXR1cm4gZXJyb3I7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG4vKipcbiAqIENvbmZpZy1zcGVjaWZpYyBtZXJnZS1mdW5jdGlvbiB3aGljaCBjcmVhdGVzIGEgbmV3IGNvbmZpZy1vYmplY3RcbiAqIGJ5IG1lcmdpbmcgdHdvIGNvbmZpZ3VyYXRpb24gb2JqZWN0cyB0b2dldGhlci5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnMVxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZzJcbiAqIEByZXR1cm5zIHtPYmplY3R9IE5ldyBvYmplY3QgcmVzdWx0aW5nIGZyb20gbWVyZ2luZyBjb25maWcyIHRvIGNvbmZpZzFcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBtZXJnZUNvbmZpZyhjb25maWcxLCBjb25maWcyKSB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICBjb25maWcyID0gY29uZmlnMiB8fCB7fTtcbiAgdmFyIGNvbmZpZyA9IHt9O1xuXG4gIHZhciB2YWx1ZUZyb21Db25maWcyS2V5cyA9IFsndXJsJywgJ21ldGhvZCcsICdkYXRhJ107XG4gIHZhciBtZXJnZURlZXBQcm9wZXJ0aWVzS2V5cyA9IFsnaGVhZGVycycsICdhdXRoJywgJ3Byb3h5JywgJ3BhcmFtcyddO1xuICB2YXIgZGVmYXVsdFRvQ29uZmlnMktleXMgPSBbXG4gICAgJ2Jhc2VVUkwnLCAndHJhbnNmb3JtUmVxdWVzdCcsICd0cmFuc2Zvcm1SZXNwb25zZScsICdwYXJhbXNTZXJpYWxpemVyJyxcbiAgICAndGltZW91dCcsICd0aW1lb3V0TWVzc2FnZScsICd3aXRoQ3JlZGVudGlhbHMnLCAnYWRhcHRlcicsICdyZXNwb25zZVR5cGUnLCAneHNyZkNvb2tpZU5hbWUnLFxuICAgICd4c3JmSGVhZGVyTmFtZScsICdvblVwbG9hZFByb2dyZXNzJywgJ29uRG93bmxvYWRQcm9ncmVzcycsICdkZWNvbXByZXNzJyxcbiAgICAnbWF4Q29udGVudExlbmd0aCcsICdtYXhCb2R5TGVuZ3RoJywgJ21heFJlZGlyZWN0cycsICd0cmFuc3BvcnQnLCAnaHR0cEFnZW50JyxcbiAgICAnaHR0cHNBZ2VudCcsICdjYW5jZWxUb2tlbicsICdzb2NrZXRQYXRoJywgJ3Jlc3BvbnNlRW5jb2RpbmcnXG4gIF07XG4gIHZhciBkaXJlY3RNZXJnZUtleXMgPSBbJ3ZhbGlkYXRlU3RhdHVzJ107XG5cbiAgZnVuY3Rpb24gZ2V0TWVyZ2VkVmFsdWUodGFyZ2V0LCBzb3VyY2UpIHtcbiAgICBpZiAodXRpbHMuaXNQbGFpbk9iamVjdCh0YXJnZXQpICYmIHV0aWxzLmlzUGxhaW5PYmplY3Qoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHV0aWxzLm1lcmdlKHRhcmdldCwgc291cmNlKTtcbiAgICB9IGVsc2UgaWYgKHV0aWxzLmlzUGxhaW5PYmplY3Qoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHV0aWxzLm1lcmdlKHt9LCBzb3VyY2UpO1xuICAgIH0gZWxzZSBpZiAodXRpbHMuaXNBcnJheShzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gc291cmNlLnNsaWNlKCk7XG4gICAgfVxuICAgIHJldHVybiBzb3VyY2U7XG4gIH1cblxuICBmdW5jdGlvbiBtZXJnZURlZXBQcm9wZXJ0aWVzKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZShjb25maWcxW3Byb3BdLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcxW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH1cblxuICB1dGlscy5mb3JFYWNoKHZhbHVlRnJvbUNvbmZpZzJLZXlzLCBmdW5jdGlvbiB2YWx1ZUZyb21Db25maWcyKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzJbcHJvcF0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdXRpbHMuZm9yRWFjaChtZXJnZURlZXBQcm9wZXJ0aWVzS2V5cywgbWVyZ2VEZWVwUHJvcGVydGllcyk7XG5cbiAgdXRpbHMuZm9yRWFjaChkZWZhdWx0VG9Db25maWcyS2V5cywgZnVuY3Rpb24gZGVmYXVsdFRvQ29uZmlnMihwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcxW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH0pO1xuXG4gIHV0aWxzLmZvckVhY2goZGlyZWN0TWVyZ2VLZXlzLCBmdW5jdGlvbiBtZXJnZShwcm9wKSB7XG4gICAgaWYgKHByb3AgaW4gY29uZmlnMikge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUoY29uZmlnMVtwcm9wXSwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmIChwcm9wIGluIGNvbmZpZzEpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgYXhpb3NLZXlzID0gdmFsdWVGcm9tQ29uZmlnMktleXNcbiAgICAuY29uY2F0KG1lcmdlRGVlcFByb3BlcnRpZXNLZXlzKVxuICAgIC5jb25jYXQoZGVmYXVsdFRvQ29uZmlnMktleXMpXG4gICAgLmNvbmNhdChkaXJlY3RNZXJnZUtleXMpO1xuXG4gIHZhciBvdGhlcktleXMgPSBPYmplY3RcbiAgICAua2V5cyhjb25maWcxKVxuICAgIC5jb25jYXQoT2JqZWN0LmtleXMoY29uZmlnMikpXG4gICAgLmZpbHRlcihmdW5jdGlvbiBmaWx0ZXJBeGlvc0tleXMoa2V5KSB7XG4gICAgICByZXR1cm4gYXhpb3NLZXlzLmluZGV4T2Yoa2V5KSA9PT0gLTE7XG4gICAgfSk7XG5cbiAgdXRpbHMuZm9yRWFjaChvdGhlcktleXMsIG1lcmdlRGVlcFByb3BlcnRpZXMpO1xuXG4gIHJldHVybiBjb25maWc7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY3JlYXRlRXJyb3IgPSByZXF1aXJlKCcuL2NyZWF0ZUVycm9yJyk7XG5cbi8qKlxuICogUmVzb2x2ZSBvciByZWplY3QgYSBQcm9taXNlIGJhc2VkIG9uIHJlc3BvbnNlIHN0YXR1cy5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZXNvbHZlIEEgZnVuY3Rpb24gdGhhdCByZXNvbHZlcyB0aGUgcHJvbWlzZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlamVjdCBBIGZ1bmN0aW9uIHRoYXQgcmVqZWN0cyB0aGUgcHJvbWlzZS5cbiAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSBUaGUgcmVzcG9uc2UuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgcmVzcG9uc2UpIHtcbiAgdmFyIHZhbGlkYXRlU3RhdHVzID0gcmVzcG9uc2UuY29uZmlnLnZhbGlkYXRlU3RhdHVzO1xuICBpZiAoIXJlc3BvbnNlLnN0YXR1cyB8fCAhdmFsaWRhdGVTdGF0dXMgfHwgdmFsaWRhdGVTdGF0dXMocmVzcG9uc2Uuc3RhdHVzKSkge1xuICAgIHJlc29sdmUocmVzcG9uc2UpO1xuICB9IGVsc2Uge1xuICAgIHJlamVjdChjcmVhdGVFcnJvcihcbiAgICAgICdSZXF1ZXN0IGZhaWxlZCB3aXRoIHN0YXR1cyBjb2RlICcgKyByZXNwb25zZS5zdGF0dXMsXG4gICAgICByZXNwb25zZS5jb25maWcsXG4gICAgICBudWxsLFxuICAgICAgcmVzcG9uc2UucmVxdWVzdCxcbiAgICAgIHJlc3BvbnNlXG4gICAgKSk7XG4gIH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuLyoqXG4gKiBUcmFuc2Zvcm0gdGhlIGRhdGEgZm9yIGEgcmVxdWVzdCBvciBhIHJlc3BvbnNlXG4gKlxuICogQHBhcmFtIHtPYmplY3R8U3RyaW5nfSBkYXRhIFRoZSBkYXRhIHRvIGJlIHRyYW5zZm9ybWVkXG4gKiBAcGFyYW0ge0FycmF5fSBoZWFkZXJzIFRoZSBoZWFkZXJzIGZvciB0aGUgcmVxdWVzdCBvciByZXNwb25zZVxuICogQHBhcmFtIHtBcnJheXxGdW5jdGlvbn0gZm5zIEEgc2luZ2xlIGZ1bmN0aW9uIG9yIEFycmF5IG9mIGZ1bmN0aW9uc1xuICogQHJldHVybnMgeyp9IFRoZSByZXN1bHRpbmcgdHJhbnNmb3JtZWQgZGF0YVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRyYW5zZm9ybURhdGEoZGF0YSwgaGVhZGVycywgZm5zKSB7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICB1dGlscy5mb3JFYWNoKGZucywgZnVuY3Rpb24gdHJhbnNmb3JtKGZuKSB7XG4gICAgZGF0YSA9IGZuKGRhdGEsIGhlYWRlcnMpO1xuICB9KTtcblxuICByZXR1cm4gZGF0YTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbnZhciBub3JtYWxpemVIZWFkZXJOYW1lID0gcmVxdWlyZSgnLi9oZWxwZXJzL25vcm1hbGl6ZUhlYWRlck5hbWUnKTtcblxudmFyIERFRkFVTFRfQ09OVEVOVF9UWVBFID0ge1xuICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCdcbn07XG5cbmZ1bmN0aW9uIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCB2YWx1ZSkge1xuICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGhlYWRlcnMpICYmIHV0aWxzLmlzVW5kZWZpbmVkKGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddKSkge1xuICAgIGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddID0gdmFsdWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0RGVmYXVsdEFkYXB0ZXIoKSB7XG4gIHZhciBhZGFwdGVyO1xuICBpZiAodHlwZW9mIFhNTEh0dHBSZXF1ZXN0ICE9PSAndW5kZWZpbmVkJykge1xuICAgIC8vIEZvciBicm93c2VycyB1c2UgWEhSIGFkYXB0ZXJcbiAgICBhZGFwdGVyID0gcmVxdWlyZSgnLi9hZGFwdGVycy94aHInKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHByb2Nlc3MpID09PSAnW29iamVjdCBwcm9jZXNzXScpIHtcbiAgICAvLyBGb3Igbm9kZSB1c2UgSFRUUCBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4vYWRhcHRlcnMvaHR0cCcpO1xuICB9XG4gIHJldHVybiBhZGFwdGVyO1xufVxuXG52YXIgZGVmYXVsdHMgPSB7XG4gIGFkYXB0ZXI6IGdldERlZmF1bHRBZGFwdGVyKCksXG5cbiAgdHJhbnNmb3JtUmVxdWVzdDogW2Z1bmN0aW9uIHRyYW5zZm9ybVJlcXVlc3QoZGF0YSwgaGVhZGVycykge1xuICAgIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgJ0FjY2VwdCcpO1xuICAgIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgJ0NvbnRlbnQtVHlwZScpO1xuICAgIGlmICh1dGlscy5pc0Zvcm1EYXRhKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0FycmF5QnVmZmVyKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0J1ZmZlcihkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNTdHJlYW0oZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzRmlsZShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNCbG9iKGRhdGEpXG4gICAgKSB7XG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG4gICAgaWYgKHV0aWxzLmlzQXJyYXlCdWZmZXJWaWV3KGRhdGEpKSB7XG4gICAgICByZXR1cm4gZGF0YS5idWZmZXI7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc1VSTFNlYXJjaFBhcmFtcyhkYXRhKSkge1xuICAgICAgc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7Y2hhcnNldD11dGYtOCcpO1xuICAgICAgcmV0dXJuIGRhdGEudG9TdHJpbmcoKTtcbiAgICB9XG4gICAgaWYgKHV0aWxzLmlzT2JqZWN0KGRhdGEpKSB7XG4gICAgICBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgJ2FwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtOCcpO1xuICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGRhdGEpO1xuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgdHJhbnNmb3JtUmVzcG9uc2U6IFtmdW5jdGlvbiB0cmFuc2Zvcm1SZXNwb25zZShkYXRhKSB7XG4gICAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gICAgaWYgKHR5cGVvZiBkYXRhID09PSAnc3RyaW5nJykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgZGF0YSA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICB9IGNhdGNoIChlKSB7IC8qIElnbm9yZSAqLyB9XG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xuICB9XSxcblxuICAvKipcbiAgICogQSB0aW1lb3V0IGluIG1pbGxpc2Vjb25kcyB0byBhYm9ydCBhIHJlcXVlc3QuIElmIHNldCB0byAwIChkZWZhdWx0KSBhXG4gICAqIHRpbWVvdXQgaXMgbm90IGNyZWF0ZWQuXG4gICAqL1xuICB0aW1lb3V0OiAwLFxuXG4gIHhzcmZDb29raWVOYW1lOiAnWFNSRi1UT0tFTicsXG4gIHhzcmZIZWFkZXJOYW1lOiAnWC1YU1JGLVRPS0VOJyxcblxuICBtYXhDb250ZW50TGVuZ3RoOiAtMSxcbiAgbWF4Qm9keUxlbmd0aDogLTEsXG5cbiAgdmFsaWRhdGVTdGF0dXM6IGZ1bmN0aW9uIHZhbGlkYXRlU3RhdHVzKHN0YXR1cykge1xuICAgIHJldHVybiBzdGF0dXMgPj0gMjAwICYmIHN0YXR1cyA8IDMwMDtcbiAgfVxufTtcblxuZGVmYXVsdHMuaGVhZGVycyA9IHtcbiAgY29tbW9uOiB7XG4gICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uLCB0ZXh0L3BsYWluLCAqLyonXG4gIH1cbn07XG5cbnV0aWxzLmZvckVhY2goWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZE5vRGF0YShtZXRob2QpIHtcbiAgZGVmYXVsdHMuaGVhZGVyc1ttZXRob2RdID0ge307XG59KTtcblxudXRpbHMuZm9yRWFjaChbJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2RXaXRoRGF0YShtZXRob2QpIHtcbiAgZGVmYXVsdHMuaGVhZGVyc1ttZXRob2RdID0gdXRpbHMubWVyZ2UoREVGQVVMVF9DT05URU5UX1RZUEUpO1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gZGVmYXVsdHM7XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYmluZChmbiwgdGhpc0FyZykge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcCgpIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFyZ3NbaV0gPSBhcmd1bWVudHNbaV07XG4gICAgfVxuICAgIHJldHVybiBmbi5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuZnVuY3Rpb24gZW5jb2RlKHZhbCkge1xuICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHZhbCkuXG4gICAgcmVwbGFjZSgvJTNBL2dpLCAnOicpLlxuICAgIHJlcGxhY2UoLyUyNC9nLCAnJCcpLlxuICAgIHJlcGxhY2UoLyUyQy9naSwgJywnKS5cbiAgICByZXBsYWNlKC8lMjAvZywgJysnKS5cbiAgICByZXBsYWNlKC8lNUIvZ2ksICdbJykuXG4gICAgcmVwbGFjZSgvJTVEL2dpLCAnXScpO1xufVxuXG4vKipcbiAqIEJ1aWxkIGEgVVJMIGJ5IGFwcGVuZGluZyBwYXJhbXMgdG8gdGhlIGVuZFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVGhlIGJhc2Ugb2YgdGhlIHVybCAoZS5nLiwgaHR0cDovL3d3dy5nb29nbGUuY29tKVxuICogQHBhcmFtIHtvYmplY3R9IFtwYXJhbXNdIFRoZSBwYXJhbXMgdG8gYmUgYXBwZW5kZWRcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBmb3JtYXR0ZWQgdXJsXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYnVpbGRVUkwodXJsLCBwYXJhbXMsIHBhcmFtc1NlcmlhbGl6ZXIpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIGlmICghcGFyYW1zKSB7XG4gICAgcmV0dXJuIHVybDtcbiAgfVxuXG4gIHZhciBzZXJpYWxpemVkUGFyYW1zO1xuICBpZiAocGFyYW1zU2VyaWFsaXplcikge1xuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJhbXNTZXJpYWxpemVyKHBhcmFtcyk7XG4gIH0gZWxzZSBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMocGFyYW1zKSkge1xuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJhbXMudG9TdHJpbmcoKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgcGFydHMgPSBbXTtcblxuICAgIHV0aWxzLmZvckVhY2gocGFyYW1zLCBmdW5jdGlvbiBzZXJpYWxpemUodmFsLCBrZXkpIHtcbiAgICAgIGlmICh2YWwgPT09IG51bGwgfHwgdHlwZW9mIHZhbCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAodXRpbHMuaXNBcnJheSh2YWwpKSB7XG4gICAgICAgIGtleSA9IGtleSArICdbXSc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWwgPSBbdmFsXTtcbiAgICAgIH1cblxuICAgICAgdXRpbHMuZm9yRWFjaCh2YWwsIGZ1bmN0aW9uIHBhcnNlVmFsdWUodikge1xuICAgICAgICBpZiAodXRpbHMuaXNEYXRlKHYpKSB7XG4gICAgICAgICAgdiA9IHYudG9JU09TdHJpbmcoKTtcbiAgICAgICAgfSBlbHNlIGlmICh1dGlscy5pc09iamVjdCh2KSkge1xuICAgICAgICAgIHYgPSBKU09OLnN0cmluZ2lmeSh2KTtcbiAgICAgICAgfVxuICAgICAgICBwYXJ0cy5wdXNoKGVuY29kZShrZXkpICsgJz0nICsgZW5jb2RlKHYpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcnRzLmpvaW4oJyYnKTtcbiAgfVxuXG4gIGlmIChzZXJpYWxpemVkUGFyYW1zKSB7XG4gICAgdmFyIGhhc2htYXJrSW5kZXggPSB1cmwuaW5kZXhPZignIycpO1xuICAgIGlmIChoYXNobWFya0luZGV4ICE9PSAtMSkge1xuICAgICAgdXJsID0gdXJsLnNsaWNlKDAsIGhhc2htYXJrSW5kZXgpO1xuICAgIH1cblxuICAgIHVybCArPSAodXJsLmluZGV4T2YoJz8nKSA9PT0gLTEgPyAnPycgOiAnJicpICsgc2VyaWFsaXplZFBhcmFtcztcbiAgfVxuXG4gIHJldHVybiB1cmw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgVVJMIGJ5IGNvbWJpbmluZyB0aGUgc3BlY2lmaWVkIFVSTHNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZVVSTCBUaGUgYmFzZSBVUkxcbiAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGl2ZVVSTCBUaGUgcmVsYXRpdmUgVVJMXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgY29tYmluZWQgVVJMXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY29tYmluZVVSTHMoYmFzZVVSTCwgcmVsYXRpdmVVUkwpIHtcbiAgcmV0dXJuIHJlbGF0aXZlVVJMXG4gICAgPyBiYXNlVVJMLnJlcGxhY2UoL1xcLyskLywgJycpICsgJy8nICsgcmVsYXRpdmVVUkwucmVwbGFjZSgvXlxcLysvLCAnJylcbiAgICA6IGJhc2VVUkw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKFxuICB1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpID9cblxuICAvLyBTdGFuZGFyZCBicm93c2VyIGVudnMgc3VwcG9ydCBkb2N1bWVudC5jb29raWVcbiAgICAoZnVuY3Rpb24gc3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgd3JpdGU6IGZ1bmN0aW9uIHdyaXRlKG5hbWUsIHZhbHVlLCBleHBpcmVzLCBwYXRoLCBkb21haW4sIHNlY3VyZSkge1xuICAgICAgICAgIHZhciBjb29raWUgPSBbXTtcbiAgICAgICAgICBjb29raWUucHVzaChuYW1lICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKSk7XG5cbiAgICAgICAgICBpZiAodXRpbHMuaXNOdW1iZXIoZXhwaXJlcykpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdleHBpcmVzPScgKyBuZXcgRGF0ZShleHBpcmVzKS50b0dNVFN0cmluZygpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodXRpbHMuaXNTdHJpbmcocGF0aCkpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdwYXRoPScgKyBwYXRoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodXRpbHMuaXNTdHJpbmcoZG9tYWluKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ2RvbWFpbj0nICsgZG9tYWluKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoc2VjdXJlID09PSB0cnVlKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnc2VjdXJlJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZG9jdW1lbnQuY29va2llID0gY29va2llLmpvaW4oJzsgJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVhZDogZnVuY3Rpb24gcmVhZChuYW1lKSB7XG4gICAgICAgICAgdmFyIG1hdGNoID0gZG9jdW1lbnQuY29va2llLm1hdGNoKG5ldyBSZWdFeHAoJyhefDtcXFxccyopKCcgKyBuYW1lICsgJyk9KFteO10qKScpKTtcbiAgICAgICAgICByZXR1cm4gKG1hdGNoID8gZGVjb2RlVVJJQ29tcG9uZW50KG1hdGNoWzNdKSA6IG51bGwpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKG5hbWUpIHtcbiAgICAgICAgICB0aGlzLndyaXRlKG5hbWUsICcnLCBEYXRlLm5vdygpIC0gODY0MDAwMDApO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pKCkgOlxuXG4gIC8vIE5vbiBzdGFuZGFyZCBicm93c2VyIGVudiAod2ViIHdvcmtlcnMsIHJlYWN0LW5hdGl2ZSkgbGFjayBuZWVkZWQgc3VwcG9ydC5cbiAgICAoZnVuY3Rpb24gbm9uU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgd3JpdGU6IGZ1bmN0aW9uIHdyaXRlKCkge30sXG4gICAgICAgIHJlYWQ6IGZ1bmN0aW9uIHJlYWQoKSB7IHJldHVybiBudWxsOyB9LFxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHt9XG4gICAgICB9O1xuICAgIH0pKClcbik7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgVVJMIGlzIGFic29sdXRlXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCBUaGUgVVJMIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBzcGVjaWZpZWQgVVJMIGlzIGFic29sdXRlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0Fic29sdXRlVVJMKHVybCkge1xuICAvLyBBIFVSTCBpcyBjb25zaWRlcmVkIGFic29sdXRlIGlmIGl0IGJlZ2lucyB3aXRoIFwiPHNjaGVtZT46Ly9cIiBvciBcIi8vXCIgKHByb3RvY29sLXJlbGF0aXZlIFVSTCkuXG4gIC8vIFJGQyAzOTg2IGRlZmluZXMgc2NoZW1lIG5hbWUgYXMgYSBzZXF1ZW5jZSBvZiBjaGFyYWN0ZXJzIGJlZ2lubmluZyB3aXRoIGEgbGV0dGVyIGFuZCBmb2xsb3dlZFxuICAvLyBieSBhbnkgY29tYmluYXRpb24gb2YgbGV0dGVycywgZGlnaXRzLCBwbHVzLCBwZXJpb2QsIG9yIGh5cGhlbi5cbiAgcmV0dXJuIC9eKFthLXpdW2EtelxcZFxcK1xcLVxcLl0qOik/XFwvXFwvL2kudGVzdCh1cmwpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHBheWxvYWQgaXMgYW4gZXJyb3IgdGhyb3duIGJ5IEF4aW9zXG4gKlxuICogQHBhcmFtIHsqfSBwYXlsb2FkIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgcGF5bG9hZCBpcyBhbiBlcnJvciB0aHJvd24gYnkgQXhpb3MsIG90aGVyd2lzZSBmYWxzZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQXhpb3NFcnJvcihwYXlsb2FkKSB7XG4gIHJldHVybiAodHlwZW9mIHBheWxvYWQgPT09ICdvYmplY3QnKSAmJiAocGF5bG9hZC5pc0F4aW9zRXJyb3IgPT09IHRydWUpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChcbiAgdXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSA/XG5cbiAgLy8gU3RhbmRhcmQgYnJvd3NlciBlbnZzIGhhdmUgZnVsbCBzdXBwb3J0IG9mIHRoZSBBUElzIG5lZWRlZCB0byB0ZXN0XG4gIC8vIHdoZXRoZXIgdGhlIHJlcXVlc3QgVVJMIGlzIG9mIHRoZSBzYW1lIG9yaWdpbiBhcyBjdXJyZW50IGxvY2F0aW9uLlxuICAgIChmdW5jdGlvbiBzdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICB2YXIgbXNpZSA9IC8obXNpZXx0cmlkZW50KS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG4gICAgICB2YXIgdXJsUGFyc2luZ05vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICB2YXIgb3JpZ2luVVJMO1xuXG4gICAgICAvKipcbiAgICAqIFBhcnNlIGEgVVJMIHRvIGRpc2NvdmVyIGl0J3MgY29tcG9uZW50c1xuICAgICpcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSB1cmwgVGhlIFVSTCB0byBiZSBwYXJzZWRcbiAgICAqIEByZXR1cm5zIHtPYmplY3R9XG4gICAgKi9cbiAgICAgIGZ1bmN0aW9uIHJlc29sdmVVUkwodXJsKSB7XG4gICAgICAgIHZhciBocmVmID0gdXJsO1xuXG4gICAgICAgIGlmIChtc2llKSB7XG4gICAgICAgIC8vIElFIG5lZWRzIGF0dHJpYnV0ZSBzZXQgdHdpY2UgdG8gbm9ybWFsaXplIHByb3BlcnRpZXNcbiAgICAgICAgICB1cmxQYXJzaW5nTm9kZS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBocmVmKTtcbiAgICAgICAgICBocmVmID0gdXJsUGFyc2luZ05vZGUuaHJlZjtcbiAgICAgICAgfVxuXG4gICAgICAgIHVybFBhcnNpbmdOb2RlLnNldEF0dHJpYnV0ZSgnaHJlZicsIGhyZWYpO1xuXG4gICAgICAgIC8vIHVybFBhcnNpbmdOb2RlIHByb3ZpZGVzIHRoZSBVcmxVdGlscyBpbnRlcmZhY2UgLSBodHRwOi8vdXJsLnNwZWMud2hhdHdnLm9yZy8jdXJsdXRpbHNcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBocmVmOiB1cmxQYXJzaW5nTm9kZS5ocmVmLFxuICAgICAgICAgIHByb3RvY29sOiB1cmxQYXJzaW5nTm9kZS5wcm90b2NvbCA/IHVybFBhcnNpbmdOb2RlLnByb3RvY29sLnJlcGxhY2UoLzokLywgJycpIDogJycsXG4gICAgICAgICAgaG9zdDogdXJsUGFyc2luZ05vZGUuaG9zdCxcbiAgICAgICAgICBzZWFyY2g6IHVybFBhcnNpbmdOb2RlLnNlYXJjaCA/IHVybFBhcnNpbmdOb2RlLnNlYXJjaC5yZXBsYWNlKC9eXFw/LywgJycpIDogJycsXG4gICAgICAgICAgaGFzaDogdXJsUGFyc2luZ05vZGUuaGFzaCA/IHVybFBhcnNpbmdOb2RlLmhhc2gucmVwbGFjZSgvXiMvLCAnJykgOiAnJyxcbiAgICAgICAgICBob3N0bmFtZTogdXJsUGFyc2luZ05vZGUuaG9zdG5hbWUsXG4gICAgICAgICAgcG9ydDogdXJsUGFyc2luZ05vZGUucG9ydCxcbiAgICAgICAgICBwYXRobmFtZTogKHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lLmNoYXJBdCgwKSA9PT0gJy8nKSA/XG4gICAgICAgICAgICB1cmxQYXJzaW5nTm9kZS5wYXRobmFtZSA6XG4gICAgICAgICAgICAnLycgKyB1cmxQYXJzaW5nTm9kZS5wYXRobmFtZVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBvcmlnaW5VUkwgPSByZXNvbHZlVVJMKHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcblxuICAgICAgLyoqXG4gICAgKiBEZXRlcm1pbmUgaWYgYSBVUkwgc2hhcmVzIHRoZSBzYW1lIG9yaWdpbiBhcyB0aGUgY3VycmVudCBsb2NhdGlvblxuICAgICpcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSByZXF1ZXN0VVJMIFRoZSBVUkwgdG8gdGVzdFxuICAgICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgVVJMIHNoYXJlcyB0aGUgc2FtZSBvcmlnaW4sIG90aGVyd2lzZSBmYWxzZVxuICAgICovXG4gICAgICByZXR1cm4gZnVuY3Rpb24gaXNVUkxTYW1lT3JpZ2luKHJlcXVlc3RVUkwpIHtcbiAgICAgICAgdmFyIHBhcnNlZCA9ICh1dGlscy5pc1N0cmluZyhyZXF1ZXN0VVJMKSkgPyByZXNvbHZlVVJMKHJlcXVlc3RVUkwpIDogcmVxdWVzdFVSTDtcbiAgICAgICAgcmV0dXJuIChwYXJzZWQucHJvdG9jb2wgPT09IG9yaWdpblVSTC5wcm90b2NvbCAmJlxuICAgICAgICAgICAgcGFyc2VkLmhvc3QgPT09IG9yaWdpblVSTC5ob3N0KTtcbiAgICAgIH07XG4gICAgfSkoKSA6XG5cbiAgLy8gTm9uIHN0YW5kYXJkIGJyb3dzZXIgZW52cyAod2ViIHdvcmtlcnMsIHJlYWN0LW5hdGl2ZSkgbGFjayBuZWVkZWQgc3VwcG9ydC5cbiAgICAoZnVuY3Rpb24gbm9uU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIGlzVVJMU2FtZU9yaWdpbigpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9O1xuICAgIH0pKClcbik7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCBub3JtYWxpemVkTmFtZSkge1xuICB1dGlscy5mb3JFYWNoKGhlYWRlcnMsIGZ1bmN0aW9uIHByb2Nlc3NIZWFkZXIodmFsdWUsIG5hbWUpIHtcbiAgICBpZiAobmFtZSAhPT0gbm9ybWFsaXplZE5hbWUgJiYgbmFtZS50b1VwcGVyQ2FzZSgpID09PSBub3JtYWxpemVkTmFtZS50b1VwcGVyQ2FzZSgpKSB7XG4gICAgICBoZWFkZXJzW25vcm1hbGl6ZWROYW1lXSA9IHZhbHVlO1xuICAgICAgZGVsZXRlIGhlYWRlcnNbbmFtZV07XG4gICAgfVxuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuLy8gSGVhZGVycyB3aG9zZSBkdXBsaWNhdGVzIGFyZSBpZ25vcmVkIGJ5IG5vZGVcbi8vIGMuZi4gaHR0cHM6Ly9ub2RlanMub3JnL2FwaS9odHRwLmh0bWwjaHR0cF9tZXNzYWdlX2hlYWRlcnNcbnZhciBpZ25vcmVEdXBsaWNhdGVPZiA9IFtcbiAgJ2FnZScsICdhdXRob3JpemF0aW9uJywgJ2NvbnRlbnQtbGVuZ3RoJywgJ2NvbnRlbnQtdHlwZScsICdldGFnJyxcbiAgJ2V4cGlyZXMnLCAnZnJvbScsICdob3N0JywgJ2lmLW1vZGlmaWVkLXNpbmNlJywgJ2lmLXVubW9kaWZpZWQtc2luY2UnLFxuICAnbGFzdC1tb2RpZmllZCcsICdsb2NhdGlvbicsICdtYXgtZm9yd2FyZHMnLCAncHJveHktYXV0aG9yaXphdGlvbicsXG4gICdyZWZlcmVyJywgJ3JldHJ5LWFmdGVyJywgJ3VzZXItYWdlbnQnXG5dO1xuXG4vKipcbiAqIFBhcnNlIGhlYWRlcnMgaW50byBhbiBvYmplY3RcbiAqXG4gKiBgYGBcbiAqIERhdGU6IFdlZCwgMjcgQXVnIDIwMTQgMDg6NTg6NDkgR01UXG4gKiBDb250ZW50LVR5cGU6IGFwcGxpY2F0aW9uL2pzb25cbiAqIENvbm5lY3Rpb246IGtlZXAtYWxpdmVcbiAqIFRyYW5zZmVyLUVuY29kaW5nOiBjaHVua2VkXG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaGVhZGVycyBIZWFkZXJzIG5lZWRpbmcgdG8gYmUgcGFyc2VkXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBIZWFkZXJzIHBhcnNlZCBpbnRvIGFuIG9iamVjdFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHBhcnNlSGVhZGVycyhoZWFkZXJzKSB7XG4gIHZhciBwYXJzZWQgPSB7fTtcbiAgdmFyIGtleTtcbiAgdmFyIHZhbDtcbiAgdmFyIGk7XG5cbiAgaWYgKCFoZWFkZXJzKSB7IHJldHVybiBwYXJzZWQ7IH1cblxuICB1dGlscy5mb3JFYWNoKGhlYWRlcnMuc3BsaXQoJ1xcbicpLCBmdW5jdGlvbiBwYXJzZXIobGluZSkge1xuICAgIGkgPSBsaW5lLmluZGV4T2YoJzonKTtcbiAgICBrZXkgPSB1dGlscy50cmltKGxpbmUuc3Vic3RyKDAsIGkpKS50b0xvd2VyQ2FzZSgpO1xuICAgIHZhbCA9IHV0aWxzLnRyaW0obGluZS5zdWJzdHIoaSArIDEpKTtcblxuICAgIGlmIChrZXkpIHtcbiAgICAgIGlmIChwYXJzZWRba2V5XSAmJiBpZ25vcmVEdXBsaWNhdGVPZi5pbmRleE9mKGtleSkgPj0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoa2V5ID09PSAnc2V0LWNvb2tpZScpIHtcbiAgICAgICAgcGFyc2VkW2tleV0gPSAocGFyc2VkW2tleV0gPyBwYXJzZWRba2V5XSA6IFtdKS5jb25jYXQoW3ZhbF0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGFyc2VkW2tleV0gPSBwYXJzZWRba2V5XSA/IHBhcnNlZFtrZXldICsgJywgJyArIHZhbCA6IHZhbDtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBwYXJzZWQ7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFN5bnRhY3RpYyBzdWdhciBmb3IgaW52b2tpbmcgYSBmdW5jdGlvbiBhbmQgZXhwYW5kaW5nIGFuIGFycmF5IGZvciBhcmd1bWVudHMuXG4gKlxuICogQ29tbW9uIHVzZSBjYXNlIHdvdWxkIGJlIHRvIHVzZSBgRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5YC5cbiAqXG4gKiAgYGBganNcbiAqICBmdW5jdGlvbiBmKHgsIHksIHopIHt9XG4gKiAgdmFyIGFyZ3MgPSBbMSwgMiwgM107XG4gKiAgZi5hcHBseShudWxsLCBhcmdzKTtcbiAqICBgYGBcbiAqXG4gKiBXaXRoIGBzcHJlYWRgIHRoaXMgZXhhbXBsZSBjYW4gYmUgcmUtd3JpdHRlbi5cbiAqXG4gKiAgYGBganNcbiAqICBzcHJlYWQoZnVuY3Rpb24oeCwgeSwgeikge30pKFsxLCAyLCAzXSk7XG4gKiAgYGBgXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzcHJlYWQoY2FsbGJhY2spIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHdyYXAoYXJyKSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KG51bGwsIGFycik7XG4gIH07XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYmluZCA9IHJlcXVpcmUoJy4vaGVscGVycy9iaW5kJyk7XG5cbi8qZ2xvYmFsIHRvU3RyaW5nOnRydWUqL1xuXG4vLyB1dGlscyBpcyBhIGxpYnJhcnkgb2YgZ2VuZXJpYyBoZWxwZXIgZnVuY3Rpb25zIG5vbi1zcGVjaWZpYyB0byBheGlvc1xuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGFuIEFycmF5XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gQXJyYXksIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5KHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBBcnJheV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIHVuZGVmaW5lZFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSB2YWx1ZSBpcyB1bmRlZmluZWQsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1VuZGVmaW5lZCh2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICd1bmRlZmluZWQnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgQnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBCdWZmZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0J1ZmZlcih2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPT0gbnVsbCAmJiAhaXNVbmRlZmluZWQodmFsKSAmJiB2YWwuY29uc3RydWN0b3IgIT09IG51bGwgJiYgIWlzVW5kZWZpbmVkKHZhbC5jb25zdHJ1Y3RvcilcbiAgICAmJiB0eXBlb2YgdmFsLmNvbnN0cnVjdG9yLmlzQnVmZmVyID09PSAnZnVuY3Rpb24nICYmIHZhbC5jb25zdHJ1Y3Rvci5pc0J1ZmZlcih2YWwpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGFuIEFycmF5QnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gQXJyYXlCdWZmZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5QnVmZmVyKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRm9ybURhdGFcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBGb3JtRGF0YSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRm9ybURhdGEodmFsKSB7XG4gIHJldHVybiAodHlwZW9mIEZvcm1EYXRhICE9PSAndW5kZWZpbmVkJykgJiYgKHZhbCBpbnN0YW5jZW9mIEZvcm1EYXRhKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIHZpZXcgb24gYW4gQXJyYXlCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIHZpZXcgb24gYW4gQXJyYXlCdWZmZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5QnVmZmVyVmlldyh2YWwpIHtcbiAgdmFyIHJlc3VsdDtcbiAgaWYgKCh0eXBlb2YgQXJyYXlCdWZmZXIgIT09ICd1bmRlZmluZWQnKSAmJiAoQXJyYXlCdWZmZXIuaXNWaWV3KSkge1xuICAgIHJlc3VsdCA9IEFycmF5QnVmZmVyLmlzVmlldyh2YWwpO1xuICB9IGVsc2Uge1xuICAgIHJlc3VsdCA9ICh2YWwpICYmICh2YWwuYnVmZmVyKSAmJiAodmFsLmJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgU3RyaW5nXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBTdHJpbmcsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N0cmluZyh2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgTnVtYmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBOdW1iZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc051bWJlcih2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICdudW1iZXInO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGFuIE9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIE9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbCkge1xuICByZXR1cm4gdmFsICE9PSBudWxsICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgcGxhaW4gT2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIHBsYWluIE9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzUGxhaW5PYmplY3QodmFsKSB7XG4gIGlmICh0b1N0cmluZy5jYWxsKHZhbCkgIT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIHByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih2YWwpO1xuICByZXR1cm4gcHJvdG90eXBlID09PSBudWxsIHx8IHByb3RvdHlwZSA9PT0gT2JqZWN0LnByb3RvdHlwZTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIERhdGVcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIERhdGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0RhdGUodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IERhdGVdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZpbGVcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEZpbGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0ZpbGUodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEZpbGVdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEJsb2JcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEJsb2IsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Jsb2IodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEJsb2JdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZ1bmN0aW9uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBGdW5jdGlvbiwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBTdHJlYW1cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFN0cmVhbSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyZWFtKHZhbCkge1xuICByZXR1cm4gaXNPYmplY3QodmFsKSAmJiBpc0Z1bmN0aW9uKHZhbC5waXBlKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFVSTFNlYXJjaFBhcmFtcyBvYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFVSTFNlYXJjaFBhcmFtcyBvYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1VSTFNlYXJjaFBhcmFtcyh2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiBVUkxTZWFyY2hQYXJhbXMgIT09ICd1bmRlZmluZWQnICYmIHZhbCBpbnN0YW5jZW9mIFVSTFNlYXJjaFBhcmFtcztcbn1cblxuLyoqXG4gKiBUcmltIGV4Y2VzcyB3aGl0ZXNwYWNlIG9mZiB0aGUgYmVnaW5uaW5nIGFuZCBlbmQgb2YgYSBzdHJpbmdcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyIFRoZSBTdHJpbmcgdG8gdHJpbVxuICogQHJldHVybnMge1N0cmluZ30gVGhlIFN0cmluZyBmcmVlZCBvZiBleGNlc3Mgd2hpdGVzcGFjZVxuICovXG5mdW5jdGlvbiB0cmltKHN0cikge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMqLywgJycpLnJlcGxhY2UoL1xccyokLywgJycpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiB3ZSdyZSBydW5uaW5nIGluIGEgc3RhbmRhcmQgYnJvd3NlciBlbnZpcm9ubWVudFxuICpcbiAqIFRoaXMgYWxsb3dzIGF4aW9zIHRvIHJ1biBpbiBhIHdlYiB3b3JrZXIsIGFuZCByZWFjdC1uYXRpdmUuXG4gKiBCb3RoIGVudmlyb25tZW50cyBzdXBwb3J0IFhNTEh0dHBSZXF1ZXN0LCBidXQgbm90IGZ1bGx5IHN0YW5kYXJkIGdsb2JhbHMuXG4gKlxuICogd2ViIHdvcmtlcnM6XG4gKiAgdHlwZW9mIHdpbmRvdyAtPiB1bmRlZmluZWRcbiAqICB0eXBlb2YgZG9jdW1lbnQgLT4gdW5kZWZpbmVkXG4gKlxuICogcmVhY3QtbmF0aXZlOlxuICogIG5hdmlnYXRvci5wcm9kdWN0IC0+ICdSZWFjdE5hdGl2ZSdcbiAqIG5hdGl2ZXNjcmlwdFxuICogIG5hdmlnYXRvci5wcm9kdWN0IC0+ICdOYXRpdmVTY3JpcHQnIG9yICdOUydcbiAqL1xuZnVuY3Rpb24gaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gIGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiAobmF2aWdhdG9yLnByb2R1Y3QgPT09ICdSZWFjdE5hdGl2ZScgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ05hdGl2ZVNjcmlwdCcgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ05TJykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIChcbiAgICB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgIHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCdcbiAgKTtcbn1cblxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgYW4gQXJyYXkgb3IgYW4gT2JqZWN0IGludm9raW5nIGEgZnVuY3Rpb24gZm9yIGVhY2ggaXRlbS5cbiAqXG4gKiBJZiBgb2JqYCBpcyBhbiBBcnJheSBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBwYXNzaW5nXG4gKiB0aGUgdmFsdWUsIGluZGV4LCBhbmQgY29tcGxldGUgYXJyYXkgZm9yIGVhY2ggaXRlbS5cbiAqXG4gKiBJZiAnb2JqJyBpcyBhbiBPYmplY3QgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgcGFzc2luZ1xuICogdGhlIHZhbHVlLCBrZXksIGFuZCBjb21wbGV0ZSBvYmplY3QgZm9yIGVhY2ggcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIHtPYmplY3R8QXJyYXl9IG9iaiBUaGUgb2JqZWN0IHRvIGl0ZXJhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBjYWxsYmFjayB0byBpbnZva2UgZm9yIGVhY2ggaXRlbVxuICovXG5mdW5jdGlvbiBmb3JFYWNoKG9iaiwgZm4pIHtcbiAgLy8gRG9uJ3QgYm90aGVyIGlmIG5vIHZhbHVlIHByb3ZpZGVkXG4gIGlmIChvYmogPT09IG51bGwgfHwgdHlwZW9mIG9iaiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBGb3JjZSBhbiBhcnJheSBpZiBub3QgYWxyZWFkeSBzb21ldGhpbmcgaXRlcmFibGVcbiAgaWYgKHR5cGVvZiBvYmogIT09ICdvYmplY3QnKSB7XG4gICAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gICAgb2JqID0gW29ial07XG4gIH1cblxuICBpZiAoaXNBcnJheShvYmopKSB7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIGFycmF5IHZhbHVlc1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gb2JqLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgZm4uY2FsbChudWxsLCBvYmpbaV0sIGksIG9iaik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIEl0ZXJhdGUgb3ZlciBvYmplY3Qga2V5c1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSB7XG4gICAgICAgIGZuLmNhbGwobnVsbCwgb2JqW2tleV0sIGtleSwgb2JqKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBBY2NlcHRzIHZhcmFyZ3MgZXhwZWN0aW5nIGVhY2ggYXJndW1lbnQgdG8gYmUgYW4gb2JqZWN0LCB0aGVuXG4gKiBpbW11dGFibHkgbWVyZ2VzIHRoZSBwcm9wZXJ0aWVzIG9mIGVhY2ggb2JqZWN0IGFuZCByZXR1cm5zIHJlc3VsdC5cbiAqXG4gKiBXaGVuIG11bHRpcGxlIG9iamVjdHMgY29udGFpbiB0aGUgc2FtZSBrZXkgdGhlIGxhdGVyIG9iamVjdCBpblxuICogdGhlIGFyZ3VtZW50cyBsaXN0IHdpbGwgdGFrZSBwcmVjZWRlbmNlLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogYGBganNcbiAqIHZhciByZXN1bHQgPSBtZXJnZSh7Zm9vOiAxMjN9LCB7Zm9vOiA0NTZ9KTtcbiAqIGNvbnNvbGUubG9nKHJlc3VsdC5mb28pOyAvLyBvdXRwdXRzIDQ1NlxuICogYGBgXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iajEgT2JqZWN0IHRvIG1lcmdlXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXN1bHQgb2YgYWxsIG1lcmdlIHByb3BlcnRpZXNcbiAqL1xuZnVuY3Rpb24gbWVyZ2UoLyogb2JqMSwgb2JqMiwgb2JqMywgLi4uICovKSB7XG4gIHZhciByZXN1bHQgPSB7fTtcbiAgZnVuY3Rpb24gYXNzaWduVmFsdWUodmFsLCBrZXkpIHtcbiAgICBpZiAoaXNQbGFpbk9iamVjdChyZXN1bHRba2V5XSkgJiYgaXNQbGFpbk9iamVjdCh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IG1lcmdlKHJlc3VsdFtrZXldLCB2YWwpO1xuICAgIH0gZWxzZSBpZiAoaXNQbGFpbk9iamVjdCh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IG1lcmdlKHt9LCB2YWwpO1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheSh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IHZhbC5zbGljZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHRba2V5XSA9IHZhbDtcbiAgICB9XG4gIH1cblxuICBmb3IgKHZhciBpID0gMCwgbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBmb3JFYWNoKGFyZ3VtZW50c1tpXSwgYXNzaWduVmFsdWUpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRXh0ZW5kcyBvYmplY3QgYSBieSBtdXRhYmx5IGFkZGluZyB0byBpdCB0aGUgcHJvcGVydGllcyBvZiBvYmplY3QgYi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYSBUaGUgb2JqZWN0IHRvIGJlIGV4dGVuZGVkXG4gKiBAcGFyYW0ge09iamVjdH0gYiBUaGUgb2JqZWN0IHRvIGNvcHkgcHJvcGVydGllcyBmcm9tXG4gKiBAcGFyYW0ge09iamVjdH0gdGhpc0FyZyBUaGUgb2JqZWN0IHRvIGJpbmQgZnVuY3Rpb24gdG9cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHJlc3VsdGluZyB2YWx1ZSBvZiBvYmplY3QgYVxuICovXG5mdW5jdGlvbiBleHRlbmQoYSwgYiwgdGhpc0FyZykge1xuICBmb3JFYWNoKGIsIGZ1bmN0aW9uIGFzc2lnblZhbHVlKHZhbCwga2V5KSB7XG4gICAgaWYgKHRoaXNBcmcgJiYgdHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYVtrZXldID0gYmluZCh2YWwsIHRoaXNBcmcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhW2tleV0gPSB2YWw7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIGE7XG59XG5cbi8qKlxuICogUmVtb3ZlIGJ5dGUgb3JkZXIgbWFya2VyLiBUaGlzIGNhdGNoZXMgRUYgQkIgQkYgKHRoZSBVVEYtOCBCT00pXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGNvbnRlbnQgd2l0aCBCT01cbiAqIEByZXR1cm4ge3N0cmluZ30gY29udGVudCB2YWx1ZSB3aXRob3V0IEJPTVxuICovXG5mdW5jdGlvbiBzdHJpcEJPTShjb250ZW50KSB7XG4gIGlmIChjb250ZW50LmNoYXJDb2RlQXQoMCkgPT09IDB4RkVGRikge1xuICAgIGNvbnRlbnQgPSBjb250ZW50LnNsaWNlKDEpO1xuICB9XG4gIHJldHVybiBjb250ZW50O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaXNBcnJheTogaXNBcnJheSxcbiAgaXNBcnJheUJ1ZmZlcjogaXNBcnJheUJ1ZmZlcixcbiAgaXNCdWZmZXI6IGlzQnVmZmVyLFxuICBpc0Zvcm1EYXRhOiBpc0Zvcm1EYXRhLFxuICBpc0FycmF5QnVmZmVyVmlldzogaXNBcnJheUJ1ZmZlclZpZXcsXG4gIGlzU3RyaW5nOiBpc1N0cmluZyxcbiAgaXNOdW1iZXI6IGlzTnVtYmVyLFxuICBpc09iamVjdDogaXNPYmplY3QsXG4gIGlzUGxhaW5PYmplY3Q6IGlzUGxhaW5PYmplY3QsXG4gIGlzVW5kZWZpbmVkOiBpc1VuZGVmaW5lZCxcbiAgaXNEYXRlOiBpc0RhdGUsXG4gIGlzRmlsZTogaXNGaWxlLFxuICBpc0Jsb2I6IGlzQmxvYixcbiAgaXNGdW5jdGlvbjogaXNGdW5jdGlvbixcbiAgaXNTdHJlYW06IGlzU3RyZWFtLFxuICBpc1VSTFNlYXJjaFBhcmFtczogaXNVUkxTZWFyY2hQYXJhbXMsXG4gIGlzU3RhbmRhcmRCcm93c2VyRW52OiBpc1N0YW5kYXJkQnJvd3NlckVudixcbiAgZm9yRWFjaDogZm9yRWFjaCxcbiAgbWVyZ2U6IG1lcmdlLFxuICBleHRlbmQ6IGV4dGVuZCxcbiAgdHJpbTogdHJpbSxcbiAgc3RyaXBCT006IHN0cmlwQk9NXG59O1xuIiwiLy8gSW1wb3J0c1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18gZnJvbSBcIi4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9jc3NXaXRoTWFwcGluZ1RvU3RyaW5nLmpzXCI7XG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fIGZyb20gXCIuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzXCI7XG5pbXBvcnQgX19fQ1NTX0xPQURFUl9HRVRfVVJMX0lNUE9SVF9fXyBmcm9tIFwiLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2dldFVybC5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfVVJMX0lNUE9SVF8wX19fIGZyb20gXCIuLi8uLi9hcHAvc3RhdGljL2ltZy9TVkcvYXJyb3ctZG93bjIuc3ZnXCI7XG52YXIgX19fQ1NTX0xPQURFUl9FWFBPUlRfX18gPSBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18oX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyk7XG52YXIgX19fQ1NTX0xPQURFUl9VUkxfUkVQTEFDRU1FTlRfMF9fXyA9IF9fX0NTU19MT0FERVJfR0VUX1VSTF9JTVBPUlRfX18oX19fQ1NTX0xPQURFUl9VUkxfSU1QT1JUXzBfX18pO1xuLy8gTW9kdWxlXG5fX19DU1NfTE9BREVSX0VYUE9SVF9fXy5wdXNoKFttb2R1bGUuaWQsIFwiKixcXG4qOjphZnRlcixcXG4qOjpiZWZvcmUge1xcbiAgbWFyZ2luOiAwO1xcbiAgcGFkZGluZzogMDtcXG4gIGJveC1zaXppbmc6IGluaGVyaXQ7IH1cXG5cXG5odG1sIHtcXG4gIGZvbnQtc2l6ZTogNjIuNSU7IH1cXG5cXG5ib2R5IHtcXG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxuICBmb250LXNpemU6IDEuNnJlbTtcXG4gIGJhY2tncm91bmQtc2l6ZTogY292ZXI7XFxuICBiYWNrZ3JvdW5kLXJlcGVhdDogbm8tcmVwZWF0O1xcbiAgaGVpZ2h0OiAxMjcuNXJlbTtcXG4gIGZvbnQtZmFtaWx5OiAnTGF0bycsIHNhbnMtc2VyaWY7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7IH1cXG5cXG5baGlkZGVuXSB7XFxuICBkaXNwbGF5OiBub25lICFpbXBvcnRhbnQ7IH1cXG5cXG4uaGVhZGluZy10ZXJ0aWFyeSB7XFxuICBmb250LXNpemU6IDIuNHJlbTtcXG4gIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7IH1cXG4gIC5oZWFkaW5nLXRlcnRpYXJ5LS13aGl0ZSB7XFxuICAgIGNvbG9yOiAjZmZmOyB9XFxuXFxuLmhlYWRpbmctcHJpbWFyeSB7XFxuICBmb250LXNpemU6IDNyZW07XFxuICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xcbiAgZm9udC13ZWlnaHQ6IDMwMDtcXG4gIGNvbG9yOiAjZmZmOyB9XFxuXFxuLm1iLTEwIHtcXG4gIG1hcmdpbi1ib3R0b206IDFyZW07IH1cXG5cXG4ubWItMjAge1xcbiAgbWFyZ2luLWJvdHRvbTogMnJlbTsgfVxcblxcbi5tdC01MCB7XFxuICBtYXJnaW4tdG9wOiA1cmVtOyB9XFxuXFxuLmJ0biwgLmJ0bjpsaW5rLCAuYnRuOnZpc2l0ZWQge1xcbiAgcGFkZGluZzogLjc1cmVtIDJyZW07XFxuICBib3JkZXItcmFkaXVzOiAuNXJlbTtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmMmYyZjI7XFxuICBmb250LXdlaWdodDogNDAwO1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrOyB9XFxuXFxuLmJ0bjphY3RpdmUsIC5idG46Zm9jdXMge1xcbiAgb3V0bGluZTogbm9uZTtcXG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtMXB4KTtcXG4gIGJveC1zaGFkb3c6IDAgMC41cmVtIDFyZW0gcmdiYSgwLCAwLCAwLCAwLjIpOyB9XFxuXFxuLmxvZ2luLFxcbi5yZWdpc3RlciB7XFxuICBtaW4taGVpZ2h0OiBjYWxjKDEwMHZoIC0gNC4xcmVtKTtcXG4gIHdpZHRoOiAxMDB2dztcXG4gIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCh0byB0b3AsICM1ZjRmNjYsICMzNDIzMzIpO1xcbiAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcXG4gIGJhY2tncm91bmQtc2l6ZTogY292ZXI7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAubG9naW4taW1nLFxcbiAgLnJlZ2lzdGVyLWltZyB7XFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgYm9yZGVyLXJhZGl1czogMTAwJTtcXG4gICAgaGVpZ2h0OiA4LjVyZW07XFxuICAgIHdpZHRoOiA4LjVyZW07XFxuICAgIHRvcDogLTE1JTsgfVxcbiAgLmxvZ2luX19mb3JtLFxcbiAgLnJlZ2lzdGVyX19mb3JtIHtcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMWUyYTM4O1xcbiAgICBib3JkZXI6IDJweCBzb2xpZCAjMWUyYTM4O1xcbiAgICBib3gtc2hhZG93OiAwcHggMnB4IDVweCByZ2JhKDAsIDAsIDAsIDAuMjUpO1xcbiAgICBtYXgtd2lkdGg6IDMycmVtO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWZsb3c6IGNvbHVtbiBub3dyYXA7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIHBhZGRpbmc6IDRyZW0gMCAyLjZyZW0gMDtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC0yNSUpOyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNzVyZW0pIHtcXG4gICAgICAubG9naW5fX2Zvcm0sXFxuICAgICAgLnJlZ2lzdGVyX19mb3JtIHtcXG4gICAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTsgfSB9XFxuICAubG9naW5fX2Zvcm0taW5zdHJ1Y3Rpb25zLFxcbiAgLnJlZ2lzdGVyX19mb3JtLWluc3RydWN0aW9ucyB7XFxuICAgIGNvbG9yOiAjZmZmO1xcbiAgICBmb250LXNpemU6IDEuNHJlbTtcXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgICBtYXJnaW4tYm90dG9tOiAxcmVtO1xcbiAgICB3aWR0aDogOTAlOyB9XFxuICAubG9naW5fX2Zvcm0tZ3JvdXAsXFxuICAucmVnaXN0ZXJfX2Zvcm0tZ3JvdXAge1xcbiAgICB3aWR0aDogOTAlOyB9XFxuICAubG9naW5fX2Zvcm0taW5wdXQsXFxuICAucmVnaXN0ZXJfX2Zvcm0taW5wdXQge1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgbWFyZ2luOiAwIGF1dG87XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4yKTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAwLCAwLCAwLjEpO1xcbiAgICBib3gtc2hhZG93OiByZ2JhKDAsIDAsIDAsIDAuNSk7XFxuICAgIGJvcmRlci1yYWRpdXM6IDJweDtcXG4gICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcXG4gICAgbGluZS1oZWlnaHQ6IDEuMjU7XFxuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gICAgaGVpZ2h0OiA0LjJyZW07XFxuICAgIHBhZGRpbmc6IDFyZW0gMS40cmVtO1xcbiAgICBjYXJldC1jb2xvcjogI2ZmZjtcXG4gICAgY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC43NSk7IH1cXG4gICAgLmxvZ2luX19mb3JtLWlucHV0OjpwbGFjZWhvbGRlcixcXG4gICAgLnJlZ2lzdGVyX19mb3JtLWlucHV0OjpwbGFjZWhvbGRlciB7XFxuICAgICAgZm9udC13ZWlnaHQ6IDMwMDtcXG4gICAgICBjb2xvcjogI2U2ZTZlNjtcXG4gICAgICBmb250LXNpemU6IDEuOHJlbTsgfVxcbiAgICAubG9naW5fX2Zvcm0taW5wdXQ6Zm9jdXMsXFxuICAgIC5yZWdpc3Rlcl9fZm9ybS1pbnB1dDpmb2N1cyB7XFxuICAgICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjc1KTsgfVxcbiAgLmxvZ2luX19mb3JtLWJ0bixcXG4gIC5yZWdpc3Rlcl9fZm9ybS1idG4ge1xcbiAgICB3aWR0aDogOTAlO1xcbiAgICBib3JkZXItcmFkaXVzOiAycHg7XFxuICAgIHBhZGRpbmc6IDAgMS40cmVtO1xcbiAgICBtYXJnaW46IDFyZW0gYXV0byAwIGF1dG87XFxuICAgIGJveC1zaGFkb3c6IDAgMnB4IDVweCByZ2JhKDAsIDAsIDAsIDAuMjUpO1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYXJvdW5kO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBoZWlnaHQ6IDQuMnJlbTsgfVxcbiAgICAubG9naW5fX2Zvcm0tYnRuLS1sb2dpbixcXG4gICAgLnJlZ2lzdGVyX19mb3JtLWJ0bi0tbG9naW4ge1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC44Nyk7XFxuICAgICAgY29sb3I6ICMxNjE2MWQ7XFxuICAgICAgYm9yZGVyOiAxcHggc29saWQgI2ZmZjsgfVxcbiAgICAgIC5sb2dpbl9fZm9ybS1idG4tLWxvZ2luOmhvdmVyLFxcbiAgICAgIC5yZWdpc3Rlcl9fZm9ybS1idG4tLWxvZ2luOmhvdmVyIHtcXG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxuICAgICAgICBjb2xvcjogIzM0MjQ0MjsgfVxcbiAgICAgIC5sb2dpbl9fZm9ybS1idG4tLWxvZ2luOmhvdmVyIC5sb2dpbl9fZm9ybS1pY29uLXBhdGgtLWxvZ2luLFxcbiAgICAgIC5yZWdpc3Rlcl9fZm9ybS1idG4tLWxvZ2luOmhvdmVyIC5sb2dpbl9fZm9ybS1pY29uLXBhdGgtLWxvZ2luIHtcXG4gICAgICAgIGZpbGw6ICMzNDI0NDI7IH1cXG4gICAgICAubG9naW5fX2Zvcm0tYnRuLS1sb2dpbjo6YWZ0ZXIsXFxuICAgICAgLnJlZ2lzdGVyX19mb3JtLWJ0bi0tbG9naW46OmFmdGVyIHtcXG4gICAgICAgIG1hcmdpbi1ib3R0b206IDFweCBzb2xpZCB3aGl0ZTsgfVxcbiAgICAubG9naW5fX2Zvcm0tYnRuLS1yZWdpc3RlcixcXG4gICAgLnJlZ2lzdGVyX19mb3JtLWJ0bi0tcmVnaXN0ZXIge1xcbiAgICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSk7XFxuICAgICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjA1KTtcXG4gICAgICBjb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjc1KTsgfVxcbiAgICAgIC5sb2dpbl9fZm9ybS1idG4tLXJlZ2lzdGVyOmhvdmVyLFxcbiAgICAgIC5yZWdpc3Rlcl9fZm9ybS1idG4tLXJlZ2lzdGVyOmhvdmVyIHtcXG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4yNSk7XFxuICAgICAgICBjb2xvcjogI2ZmZjsgfVxcbiAgICAgIC5sb2dpbl9fZm9ybS1idG4tLXJlZ2lzdGVyOmhvdmVyIC5sb2dpbl9fZm9ybS1pY29uLXBhdGgtLWxvZ2luLFxcbiAgICAgIC5yZWdpc3Rlcl9fZm9ybS1idG4tLXJlZ2lzdGVyOmhvdmVyIC5sb2dpbl9fZm9ybS1pY29uLXBhdGgtLWxvZ2luIHtcXG4gICAgICAgIGZpbGw6ICNmZmY7IH1cXG4gICAgLmxvZ2luX19mb3JtLWJ0biBzcGFuLFxcbiAgICAucmVnaXN0ZXJfX2Zvcm0tYnRuIHNwYW4ge1xcbiAgICAgIG1hcmdpbi1yaWdodDogMXJlbTsgfVxcbiAgLmxvZ2luX19mb3JtLWljb24sXFxuICAucmVnaXN0ZXJfX2Zvcm0taWNvbiB7XFxuICAgIGhlaWdodDogMS41cmVtO1xcbiAgICB3aWR0aDogMS41cmVtO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMTclKTsgfVxcbiAgLmxvZ2luX19mb3JtLWljb24tcGF0aC0tbG9naW4sXFxuICAucmVnaXN0ZXJfX2Zvcm0taWNvbi1wYXRoLS1sb2dpbiB7XFxuICAgIGZpbGw6ICMxNjE2MWQ7IH1cXG4gIC5sb2dpbl9fZm9ybS1pY29uLXBhdGgtLXJlZ2lzdGVyLFxcbiAgLnJlZ2lzdGVyX19mb3JtLWljb24tcGF0aC0tcmVnaXN0ZXIge1xcbiAgICBmaWxsOiAjZmZmOyB9XFxuICAubG9naW5fX2Zvcm0taHIsXFxuICAucmVnaXN0ZXJfX2Zvcm0taHIge1xcbiAgICB3aWR0aDogOTAlO1xcbiAgICBtYXJnaW46IDJyZW0gMCAxcmVtIDA7XFxuICAgIG1hcmdpbi1ib3R0b206IDAuMjVweCBzb2xpZCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMjUpOyB9XFxuXFxuLm5hdiB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gIHBhZGRpbmc6IDFyZW0gMTYlO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzJiMjUzYTtcXG4gIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjMDAwOyB9XFxuICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDc1cmVtKSB7XFxuICAgIC5uYXYge1xcbiAgICAgIHBhZGRpbmc6IDEuMnJlbSAyLjUlOyB9IH1cXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNDMuNzVlbSkge1xcbiAgICAubmF2IHtcXG4gICAgICBwYWRkaW5nOiAxcmVtOyB9IH1cXG4gIC5uYXZfX2xlZnQge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4OiAwIDAgNTAlOyB9XFxuICAubmF2X19yaWdodCB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGJvcmRlci1yaWdodDogMXB4IHNvbGlkICNmZmY7XFxuICAgIGJvcmRlci1sZWZ0OiAxcHggc29saWQgI2ZmZjtcXG4gICAgcGFkZGluZy1sZWZ0OiAxcmVtO1xcbiAgICBtYXJnaW4tbGVmdDogYXV0bzsgfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDQwLjYyNWVtKSB7XFxuICAgICAgLm5hdl9fcmlnaHQge1xcbiAgICAgICAgZGlzcGxheTogbm9uZTsgfSB9XFxuICAgIC5uYXZfX3JpZ2h0ID4gKiB7XFxuICAgICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuICAubmF2X19pdGVtLS1zZWFyY2gge1xcbiAgICBmbGV4OiAwIDAgMjUlOyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNDAuNjI1ZW0pIHtcXG4gICAgICAubmF2X19pdGVtLS1zZWFyY2gge1xcbiAgICAgICAgZGlzcGxheTogbm9uZTsgfSB9XFxuICAubmF2X19pdGVtLS1ob21lIHtcXG4gICAgbWFyZ2luLXJpZ2h0OiAzcmVtOyB9XFxuICAubmF2X19saW5rIHtcXG4gICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgICBjb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjc1KTtcXG4gICAgdHJhbnNpdGlvbjogYWxsIDAuMnM7IH1cXG4gICAgLm5hdl9fbGluazpob3ZlciB7XFxuICAgICAgbWFyZ2luLWJvdHRvbTogMnB4O1xcbiAgICAgIGNvbG9yOiAjZmZmO1xcbiAgICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjZmZmOyB9XFxuICAgIC5uYXZfX2xpbmstLWhvbWU6aG92ZXIgLm5hdl9faWNvbi1wYXRoLS1ob21lIHtcXG4gICAgICBmaWxsOiAjZmZmOyB9XFxuICAubmF2X19zZWFyY2gge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuICAgIC5uYXZfX3NlYXJjaC1pbnB1dCB7XFxuICAgICAgYm9yZGVyOiBub25lO1xcbiAgICAgIHBhZGRpbmc6IDFyZW0gMnJlbTtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMmIyNTNhO1xcbiAgICAgIGNhcmV0LWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNzUpO1xcbiAgICAgIGNvbG9yOiAjZmZmOyB9XFxuICAgICAgLm5hdl9fc2VhcmNoLWlucHV0OjpwbGFjZWhvbGRlciB7XFxuICAgICAgICBjb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjc1KTsgfVxcbiAgICAgIC5uYXZfX3NlYXJjaC1pbnB1dDpmb2N1cyB7XFxuICAgICAgICBvdXRsaW5lOiBub25lOyB9XFxuICAgIC5uYXZfX3NlYXJjaC1idG4ge1xcbiAgICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgICAgbGVmdDogMnJlbTtcXG4gICAgICB0b3A6IDFyZW07IH1cXG4gICAgICAubmF2X19zZWFyY2gtYnRuOmhvdmVyIC5uYXZfX2ljb24tcGF0aC0tc2VhcmNoIHtcXG4gICAgICAgIGZpbGw6ICNmZmY7IH1cXG4gIC5uYXZfX2ljb24tc2l6aW5nLS1ob21lIHtcXG4gICAgd2lkdGg6IDNyZW07XFxuICAgIGhlaWdodDogM3JlbTsgfVxcbiAgLm5hdl9faWNvbi1zaXppbmctLXNlYXJjaCB7XFxuICAgIHdpZHRoOiAycmVtO1xcbiAgICBoZWlnaHQ6IDJyZW07XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtMTUwJSk7IH1cXG4gIC5uYXZfX2ljb24tcGF0aC0taG9tZSB7XFxuICAgIGZpbGw6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC43NSk7IH1cXG4gIC5uYXZfX2ljb24tcGF0aC0tc2VhcmNoIHtcXG4gICAgZmlsbDogI2JmYmZiZjsgfVxcbiAgLm5hdl9fbW9iaWxlIHtcXG4gICAgZGlzcGxheTogbm9uZTsgfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDQwLjYyNWVtKSB7XFxuICAgICAgLm5hdl9fbW9iaWxlIHtcXG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgICBmbGV4OiAwIDAgNTAlO1xcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfSB9XFxuICAgIC5uYXZfX21vYmlsZS1saW5rcyB7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzJiMjUzYTtcXG4gICAgICBmbGV4LWZsb3c6IHdyYXA7XFxuICAgICAgcGFkZGluZzogMXJlbSAwO1xcbiAgICAgIGp1c3RpZnktY29udGVudDogZmxleC1zdGFydDtcXG4gICAgICBkaXNwbGF5OiBub25lOyB9XFxuICAgIC5uYXZfX21vYmlsZS1saW5rIHtcXG4gICAgICBmbGV4OiAwIDAgNDglO1xcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoODUsIDI2LCAxMzksIDAuNSk7XFxuICAgICAgYm9yZGVyLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNik7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpO1xcbiAgICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgICBtYXJnaW4tdG9wOiAwLjZyZW07XFxuICAgICAgbWFyZ2luLWxlZnQ6IDElO1xcbiAgICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gICAgICBjb2xvcjogI2ZmZjtcXG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgICAgbGluZS1oZWlnaHQ6IDEuNDtcXG4gICAgICBwYWRkaW5nOiAwLjJyZW0gMXJlbSAwIDFyZW07XFxuICAgICAgaGVpZ2h0OiAyLjhyZW07XFxuICAgICAgdHJhbnNpdGlvbjogYWxsIDAuMnM7XFxuICAgICAgYm94LXNoYWRvdzogMCAxcHggMXB4IDAgcmdiYSgwLCAwLCAwLCAwLjA2KTtcXG4gICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICAgICAgdHJhbnNpdGlvbjogYWxsIDAuMnM7IH1cXG4gICAgICAubmF2X19tb2JpbGUtbGluazpob3ZlciB7XFxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMjUpOyB9XFxuICAgIC5uYXZfX21vYmlsZS1oYW1idXJnZXItd3JhcHBlciB7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICAgIG1hcmdpbi1yaWdodDogMXJlbTtcXG4gICAgICBoZWlnaHQ6IDNyZW07XFxuICAgICAgd2lkdGg6IDNyZW07XFxuICAgICAgbWFyZ2luLWxlZnQ6IGF1dG87IH1cXG4gICAgLm5hdl9fbW9iaWxlLWhhbWJ1cmdlciB7XFxuICAgICAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuICAgICAgLm5hdl9fbW9iaWxlLWhhbWJ1cmdlciwgLm5hdl9fbW9iaWxlLWhhbWJ1cmdlcjo6YmVmb3JlLCAubmF2X19tb2JpbGUtaGFtYnVyZ2VyOjphZnRlciB7XFxuICAgICAgICB3aWR0aDogM3JlbTtcXG4gICAgICAgIGhlaWdodDogMnB4O1xcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjc1KTtcXG4gICAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jazsgfVxcbiAgICAgIC5uYXZfX21vYmlsZS1oYW1idXJnZXI6OmJlZm9yZSwgLm5hdl9fbW9iaWxlLWhhbWJ1cmdlcjo6YWZ0ZXIge1xcbiAgICAgICAgY29udGVudDogJyc7XFxuICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgICAgICBsZWZ0OiAwOyB9XFxuICAgICAgLm5hdl9fbW9iaWxlLWhhbWJ1cmdlcjo6YmVmb3JlIHtcXG4gICAgICAgIG1hcmdpbi10b3A6IC0wLjhyZW07IH1cXG4gICAgICAubmF2X19tb2JpbGUtaGFtYnVyZ2VyOjphZnRlciB7XFxuICAgICAgICBtYXJnaW4tdG9wOiAwLjhyZW07IH1cXG5cXG4uZXJyb3Ige1xcbiAgbWFyZ2luLXRvcDogMnJlbTtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZjgwODA7XFxuICBib3JkZXItcmFkaXVzOiAxMHB4O1xcbiAgcGFkZGluZzogMnJlbTtcXG4gIGZvbnQtc2l6ZTogMnJlbTtcXG4gIGdyaWQtY29sdW1uOiBjZW50ZXItc3RhcnQgLyBjZW50ZXItZW5kO1xcbiAgZm9udC13ZWlnaHQ6IDcwMDsgfVxcblxcbi5zZWFyY2gtZm9ybSB7XFxuICBwYWRkaW5nOiAycmVtIDI1cmVtO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2ZkZmRmZDtcXG4gIG1pbi1oZWlnaHQ6IGNhbGMoMTAwdmggLSA2LjJyZW0pOyB9XFxuICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDgxLjI1ZW0pIHtcXG4gICAgLnNlYXJjaC1mb3JtIHtcXG4gICAgICBwYWRkaW5nOiAycmVtIDE1cmVtOyB9IH1cXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNjIuNWVtKSB7XFxuICAgIC5zZWFyY2gtZm9ybSB7XFxuICAgICAgcGFkZGluZzogMnJlbSA1cmVtOyB9IH1cXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNTYuMjVlbSkge1xcbiAgICAuc2VhcmNoLWZvcm0ge1xcbiAgICAgIHBhZGRpbmc6IDJyZW0gMXJlbTsgfSB9XFxuICAuc2VhcmNoLWZvcm1fX2dyb3VwIHtcXG4gICAgd2lkdGg6IDc1JTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgbWFyZ2luLWJvdHRvbTogM3JlbTtcXG4gICAgYWxpZ24taXRlbXM6IGZsZXgtc3RhcnQ7XFxuICAgIHBhZGRpbmc6IDAuNXJlbSA0cmVtIDAuNXJlbSAwO1xcbiAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgcmdiYSgwLCAwLCAwLCAwLjIpOyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogOTMuNzVlbSkge1xcbiAgICAgIC5zZWFyY2gtZm9ybV9fZ3JvdXAge1xcbiAgICAgICAgd2lkdGg6IDEwMCU7IH0gfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDQ2Ljg3NWVtKSB7XFxuICAgICAgLnNlYXJjaC1mb3JtX19ncm91cCB7XFxuICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9IH1cXG4gICAgLnNlYXJjaC1mb3JtX19ncm91cDpudGgtY2hpbGQoMTApIHtcXG4gICAgICBib3JkZXItYm90dG9tOiBub25lOyB9XFxuICAgIC5zZWFyY2gtZm9ybV9fZ3JvdXAtLW5vLWJvcmRlciB7XFxuICAgICAgYm9yZGVyLWJvdHRvbTogbm9uZTsgfVxcbiAgLnNlYXJjaC1mb3JtX19sYWJlbCB7XFxuICAgIGZsZXg6IDAgMCAyMCU7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBmbGV4LXN0YXJ0O1xcbiAgICBmb250LXdlaWdodDogMzAwO1xcbiAgICBtYXJnaW4tdG9wOiAwLjdyZW07XFxuICAgIGNvbG9yOiAjNTUxYThiOyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNDYuODc1ZW0pIHtcXG4gICAgICAuc2VhcmNoLWZvcm1fX2xhYmVsIHtcXG4gICAgICAgIG1hcmdpbi1ib3R0b206IDEuMnJlbTtcXG4gICAgICAgIG1hcmdpbi1sZWZ0OiAxcmVtOyB9IH1cXG4gIC5zZWFyY2gtZm9ybV9fZ3JvdXAtaW5wdXQtd3JhcHBlciB7XFxuICAgIGZsZXg6IDAgMCA4MCU7IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA0Ni44NzVlbSkge1xcbiAgICAgIC5zZWFyY2gtZm9ybV9fZ3JvdXAtaW5wdXQtd3JhcHBlciB7XFxuICAgICAgICBmbGV4OiAwIDAgMTAwJTtcXG4gICAgICAgIHdpZHRoOiAxMDAlOyB9IH1cXG4gIC5zZWFyY2gtZm9ybV9faW5wdXQtd3JhcHBlciB7XFxuICAgIGZsZXg6IDAgMCA4MCU7IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA0Ni44NzVlbSkge1xcbiAgICAgIC5zZWFyY2gtZm9ybV9faW5wdXQtd3JhcHBlciB7XFxuICAgICAgICBmbGV4OiAwIDAgMTAwJTtcXG4gICAgICAgIHdpZHRoOiAxMDAlOyB9IH1cXG4gIC5zZWFyY2gtZm9ybV9fdGlwIHtcXG4gICAgZm9udC1zaXplOiAxcmVtO1xcbiAgICBsaW5lLWhlaWdodDogMS40O1xcbiAgICB3aWR0aDogNzAlOyB9XFxuICAuc2VhcmNoLWZvcm1fX2lucHV0LXRleHQge1xcbiAgICB3aWR0aDogNDByZW07XFxuICAgIGhlaWdodDogNHJlbTtcXG4gICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcXG4gICAgcGFkZGluZzogMXJlbTtcXG4gICAgYm9yZGVyOiBzb2xpZCAxcHggI2JmYmZiZjtcXG4gICAgYm9yZGVyLXJhZGl1czogNXB4OyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogMjguMTI1ZW0pIHtcXG4gICAgICAuc2VhcmNoLWZvcm1fX2lucHV0LXRleHQge1xcbiAgICAgICAgd2lkdGg6IDMwcmVtOyB9IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiAyMS44NzVlbSkge1xcbiAgICAgIC5zZWFyY2gtZm9ybV9faW5wdXQtdGV4dCB7XFxuICAgICAgICB3aWR0aDogMjByZW07IH0gfVxcbiAgICAuc2VhcmNoLWZvcm1fX2lucHV0LXRleHQ6Zm9jdXMge1xcbiAgICAgIGJvcmRlcjogc29saWQgMXB4ICMwMDA7IH1cXG4gIC5zZWFyY2gtZm9ybV9faW5wdXQtaW50ZWdlciB7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkICNhZWFlYWU7XFxuICAgIGhlaWdodDogMy41cmVtO1xcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XFxuICAgIHBhZGRpbmctbGVmdDogMC41cmVtO1xcbiAgICBwYWRkaW5nLXJpZ2h0OiAwLjVyZW07XFxuICAgIGJveC1zaGFkb3c6IDAgMXB4IDFweCAwIHJnYmEoMCwgMCwgMCwgMC4wNik7IH1cXG4gICAgLnNlYXJjaC1mb3JtX19pbnB1dC1pbnRlZ2VyLS1yZWxhdGl2ZSB7XFxuICAgICAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogMzcuNWVtKSB7XFxuICAgICAgLnNlYXJjaC1mb3JtX19pbnB1dC1pbnRlZ2VyIHtcXG4gICAgICAgIG1heC13aWR0aDogMzAlOyB9IH1cXG4gIC5zZWFyY2gtZm9ybV9fZ3JvdXAtLWNoZWNrYm94IHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgbWFyZ2luLWJvdHRvbTogMXJlbTsgfVxcbiAgLnNlYXJjaC1mb3JtX19ncm91cC1jb2xvcnMtbGVmdCwgLnNlYXJjaC1mb3JtX19ncm91cC1jb2xvcnMtcmlnaHQge1xcbiAgICBkaXNwbGF5OiBmbGV4OyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogODEuMjVlbSkge1xcbiAgICAgIC5zZWFyY2gtZm9ybV9fZ3JvdXAtY29sb3JzLWxlZnQsIC5zZWFyY2gtZm9ybV9fZ3JvdXAtY29sb3JzLXJpZ2h0IHtcXG4gICAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH0gfVxcbiAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA4MS4yNWVtKSB7XFxuICAgIC5zZWFyY2gtZm9ybV9fZ3JvdXAtY29sb3JzLWxlZnQge1xcbiAgICAgIG1hcmdpbi1yaWdodDogM3JlbTsgfSB9XFxuICAuc2VhcmNoLWZvcm1fX2dyb3VwLXJhcml0eS1sZWZ0LCAuc2VhcmNoLWZvcm1fX2dyb3VwLXJhcml0eS1yaWdodCB7XFxuICAgIGRpc3BsYXk6IGZsZXg7IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiAzNy41ZW0pIHtcXG4gICAgICAuc2VhcmNoLWZvcm1fX2dyb3VwLXJhcml0eS1sZWZ0LCAuc2VhcmNoLWZvcm1fX2dyb3VwLXJhcml0eS1yaWdodCB7XFxuICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9IH1cXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogODEuMjVlbSkge1xcbiAgICAuc2VhcmNoLWZvcm1fX2dyb3VwLXJhcml0eS1sZWZ0IHtcXG4gICAgICBtYXJnaW4tcmlnaHQ6IDNyZW07IH0gfVxcbiAgLnNlYXJjaC1mb3JtX19sYWJlbC0tY2hlY2tib3gge1xcbiAgICBtYXJnaW4tcmlnaHQ6IDFyZW07IH1cXG4gIC5zZWFyY2gtZm9ybV9faW5wdXQtY2hlY2tib3gge1xcbiAgICB3aWR0aDogMi4yNXJlbTtcXG4gICAgaGVpZ2h0OiAyLjI1cmVtO1xcbiAgICBtYXJnaW4tcmlnaHQ6IDAuOHJlbTsgfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDkzLjc1ZW0pIHtcXG4gICAgICAuc2VhcmNoLWZvcm1fX2lucHV0LWNoZWNrYm94IHtcXG4gICAgICAgIG1hcmdpbi1ib3R0b206IDAuM3JlbTsgfSB9XFxuICAuc2VhcmNoLWZvcm1fX2NoZWNrYm94LXdyYXBwZXIge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAuc2VhcmNoLWZvcm1fX3NlbGVjdC1tZW51IHtcXG4gICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcXG4gICAgY29sb3I6ICMzNDMyNDI7XFxuICAgIG1hcmdpbi1yaWdodDogMXJlbTtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgI2FlYWVhZTtcXG4gICAgYm9yZGVyLXJhZGl1czogM3B4O1xcbiAgICBib3gtc2hhZG93OiAwIDFweCAxcHggMCByZ2JhKDAsIDAsIDAsIDAuMDYpO1xcbiAgICBwYWRkaW5nOiAwIDIuMnJlbSAwIDAuNXJlbTtcXG4gICAgaGVpZ2h0OiAzLjRyZW07XFxuICAgIGZvbnQtc2l6ZTogMS40cmVtO1xcbiAgICB0ZXh0LWluZGVudDogMDtcXG4gICAgLXdlYmtpdC1hcHBlYXJhbmNlOiBub25lO1xcbiAgICAtbW96LWFwcGVhcmFuY2U6IG5vbmU7XFxuICAgIHRleHQtb3ZlcmZsb3c6ICcnO1xcbiAgICBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXCIgKyBfX19DU1NfTE9BREVSX1VSTF9SRVBMQUNFTUVOVF8wX19fICsgXCIpO1xcbiAgICBiYWNrZ3JvdW5kLXJlcGVhdDogbm8tcmVwZWF0O1xcbiAgICBiYWNrZ3JvdW5kLXBvc2l0aW9uOiByaWdodCAwLjhyZW0gY2VudGVyO1xcbiAgICBiYWNrZ3JvdW5kLXNpemU6IDEuMnJlbSAxcmVtO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmOyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogODEuMjVlbSkge1xcbiAgICAgIC5zZWFyY2gtZm9ybV9fc2VsZWN0LW1lbnUge1xcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAwLjNyZW07IH0gfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDM3LjVlbSkge1xcbiAgICAgIC5zZWFyY2gtZm9ybV9fc2VsZWN0LW1lbnUtLTIge1xcbiAgICAgICAgbWF4LXdpZHRoOiA0OSU7IH0gfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDM3LjVlbSkge1xcbiAgICAgIC5zZWFyY2gtZm9ybV9fc2VsZWN0LW1lbnUtLTMge1xcbiAgICAgICAgbWF4LXdpZHRoOiAzMiU7IH0gfVxcbiAgLnNlYXJjaC1mb3JtX19zdmctc2l6ZSB7XFxuICAgIGhlaWdodDogMnJlbTtcXG4gICAgd2lkdGg6IDJyZW07XFxuICAgIG1hcmdpbi1yaWdodDogMXJlbTsgfVxcbiAgLnNlYXJjaC1mb3JtX19zdmctY29sb3Ige1xcbiAgICBmaWxsOiAjNTUxYThiOyB9XFxuICAuc2VhcmNoLWZvcm1fX3N1Ym1pdC13cmFwcGVyIHtcXG4gICAgcG9zaXRpb246IHN0aWNreTtcXG4gICAgYm90dG9tOiAwO1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgbWFyZ2luLWJvdHRvbTogM3JlbTtcXG4gICAgYm9yZGVyLXRvcDogMXB4IHNvbGlkIHJnYmEoMCwgMCwgMCwgMC4yKTtcXG4gICAgYWxpZ24taXRlbXM6IGZsZXgtc3RhcnQ7XFxuICAgIHBhZGRpbmc6IDEuNXJlbSA0cmVtIDEuNXJlbSAwO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmRmZGZkO1xcbiAgICB6LWluZGV4OiAxOyB9XFxuICAuc2VhcmNoLWZvcm1fX3N1Ym1pdCB7XFxuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgcGFkZGluZzogMC43cmVtO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjlmN2Y1O1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDg1LCAyNiwgMTM5LCAwLjUpO1xcbiAgICBjb2xvcjogIzU1MWE4YjtcXG4gICAgZm9udC13ZWlnaHQ6IDUwMDtcXG4gICAgdHJhbnNpdGlvbjogYWxsIDAuMnM7XFxuICAgIG1hcmdpbi1sZWZ0OiAyMCU7IH1cXG4gICAgLnNlYXJjaC1mb3JtX19zdWJtaXQ6aG92ZXIge1xcbiAgICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmOyB9XFxuICAuc2VhcmNoLWZvcm1fX2Ryb3Bkb3duLXNwYW4ge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9XFxuICAuc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLCAuc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXNldHMge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgICBsaXN0LXN0eWxlOiBub25lO1xcbiAgICBtYXJnaW4tYm90dG9tOiAwLjNyZW07IH1cXG4gIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtbGlzdC1pdGVtLCAuc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXNldHMtbGlzdC1pdGVtIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgbWFyZ2luLWJvdHRvbTogMC43cmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLXJlbW92ZS1idG4sIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtc2V0cy1yZW1vdmUtYnRuIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgaGVpZ2h0OiAycmVtO1xcbiAgICB3aWR0aDogMnJlbTtcXG4gICAgZm9udC1zaXplOiAxLjNyZW07XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmMmYyZjI7XFxuICAgIG1hcmdpbi1yaWdodDogMC43cmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLXRvZ2dsZXIge1xcbiAgICBoZWlnaHQ6IDJyZW07XFxuICAgIHdpZHRoOiAyLjc1cmVtO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICBmb250LXNpemU6IDEuM3JlbTtcXG4gICAgbWFyZ2luLXJpZ2h0OiAwLjdyZW07IH1cXG4gICAgLnNlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy10b2dnbGVyLS1pcyB7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzQ3ZDE0NzsgfVxcbiAgICAuc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLXRvZ2dsZXItLW5vdCB7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmMDAwMDsgfVxcbiAgLnNlYXJjaC1mb3JtX19kcm9wZG93biB7XFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgbWF4LWhlaWdodDogMjhyZW07XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxuICAgIHotaW5kZXg6IDI7XFxuICAgIHRvcDogMTAwJTtcXG4gICAgd2lkdGg6IDQwcmVtO1xcbiAgICBtYXJnaW4tdG9wOiAtMXJlbTtcXG4gICAgb3ZlcmZsb3cteTogYXV0bztcXG4gICAgYm9yZGVyOiAxcHggc29saWQgIzAwMDsgfVxcbiAgICAuc2VhcmNoLWZvcm1fX2Ryb3Bkb3duLWxpc3Qge1xcbiAgICAgIGxpc3Qtc3R5bGU6IG5vbmU7IH1cXG4gICAgICAuc2VhcmNoLWZvcm1fX2Ryb3Bkb3duLWxpc3QtY2F0ZWdvcnkge1xcbiAgICAgICAgcGFkZGluZzogMC41cmVtOyB9XFxuICAgICAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0LW9wdGlvbiB7XFxuICAgICAgICBwYWRkaW5nOiAwLjNyZW0gMnJlbTtcXG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAgICAgICAuc2VhcmNoLWZvcm1fX2Ryb3Bkb3duLWxpc3Qtb3B0aW9uOmhvdmVyIHtcXG4gICAgICAgICAgY3Vyc29yOiBwb2ludGVyOyB9XFxuICAgICAgICAuc2VhcmNoLWZvcm1fX2Ryb3Bkb3duLWxpc3Qtb3B0aW9uLS1oaWdobGlnaHRlZCB7XFxuICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6ICNjY2Q4ZmY7IH1cXG4gICAgICAgIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1vcHRpb24gc3BhbiB7XFxuICAgICAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICAgICAgICAgIG1hcmdpbi1sZWZ0OiAxcmVtOyB9XFxuICAgICAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0LWltZyB7XFxuICAgICAgICB3aWR0aDogMnJlbTtcXG4gICAgICAgIGhlaWdodDogMnJlbTtcXG4gICAgICAgIG1hcmdpbi1yaWdodDogMC43cmVtOyB9XFxuXFxuLmRyb3Bkb3duLXdyYXBwZXIge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuXFxuLmludi1zZWFyY2gtcHJpY2UtbXNnIHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIGJvdHRvbTogMDtcXG4gIHJpZ2h0OiAwO1xcbiAgY29sb3I6IHJlZDsgfVxcblxcbi5yZWxhdGl2ZSB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7IH1cXG5cXG4uYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2IHtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmM2Y1Zjg7XFxuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgcmdiYSg5OSwgNjgsIDE1MCwgMC4xKTtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcXG4gIHBhZGRpbmc6IDEuMnJlbSAxNiU7XFxuICBtYXJnaW4tYm90dG9tOiAwLjFyZW07XFxuICBoZWlnaHQ6IDUuMnJlbTsgfVxcbiAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA3NXJlbSkge1xcbiAgICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2IHtcXG4gICAgICBwYWRkaW5nOiAxLjJyZW0gMi41JTsgfSB9XFxuICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDUzLjEyNWVtKSB7XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYge1xcbiAgICAgIGRpc3BsYXk6IG5vbmU7IH0gfVxcbiAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1zZWxlY3Qge1xcbiAgICBjb2xvcjogI2IzMDBiMztcXG4gICAgbWFyZ2luLXJpZ2h0OiAxcmVtO1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDg1LCAyNiwgMTM5LCAwLjUpO1xcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XFxuICAgIGJveC1zaGFkb3c6IDAgMXB4IDFweCAwIHJnYmEoMCwgMCwgMCwgMC4wNik7XFxuICAgIHBhZGRpbmc6IDAuMXJlbSAyLjJyZW0gMCAwLjVyZW07XFxuICAgIGNvbG9yOiAjNTUxYThiO1xcbiAgICBoZWlnaHQ6IDIuOHJlbTtcXG4gICAgZm9udC1zaXplOiAxLjRyZW07XFxuICAgIHRleHQtaW5kZW50OiAwO1xcbiAgICAtd2Via2l0LWFwcGVhcmFuY2U6IG5vbmU7XFxuICAgIC1tb3otYXBwZWFyYW5jZTogbm9uZTtcXG4gICAgdGV4dC1vdmVyZmxvdzogJyc7XFxuICAgIGJhY2tncm91bmQtaW1hZ2U6IHVybChcIiArIF9fX0NTU19MT0FERVJfVVJMX1JFUExBQ0VNRU5UXzBfX18gKyBcIik7XFxuICAgIGJhY2tncm91bmQtcmVwZWF0OiBuby1yZXBlYXQ7XFxuICAgIGJhY2tncm91bmQtcG9zaXRpb246IHJpZ2h0IDAuOHJlbSBjZW50ZXI7XFxuICAgIGJhY2tncm91bmQtc2l6ZTogMS4ycmVtIDFyZW07IH1cXG4gICAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1zZWxlY3Q6aG92ZXIge1xcbiAgICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmOyB9XFxuICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LWxhYmVsIHtcXG4gICAgY29sb3I6ICM1NTFhOGI7IH1cXG4gIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtYnRuIHtcXG4gICAgYm9yZGVyLXJhZGl1czogM3B4O1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjlmN2Y1O1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDg1LCAyNiwgMTM5LCAwLjUpO1xcbiAgICBjb2xvcjogIzU1MWE4YjtcXG4gICAgZm9udC13ZWlnaHQ6IDUwMDtcXG4gICAgdHJhbnNpdGlvbjogYWxsIDAuMnM7XFxuICAgIGhlaWdodDogMi44cmVtO1xcbiAgICBwYWRkaW5nOiAwLjFyZW0gMC43cmVtIDAgMC43cmVtO1xcbiAgICBmb250LXNpemU6IDEuNHJlbTtcXG4gICAgbWFyZ2luOiBhdXRvIDA7XFxuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gICAgYm94LXNoYWRvdzogMCAxcHggMXB4IDAgcmdiYSgwLCAwLCAwLCAwLjA2KTsgfVxcbiAgICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LWJ0bjpob3ZlciB7XFxuICAgICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmZmY7IH1cXG4gIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtcmlnaHQge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXBhZ2luYXRpb24tY29udGFpbmVyIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2Y5ZjdmNTtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSg4NSwgMjYsIDEzOSwgMC41KTtcXG4gICAgY29sb3I6ICM1NTFhOGI7XFxuICAgIHBhZGRpbmc6IDAuMnJlbSAwLjdyZW07XFxuICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgaGVpZ2h0OiAyLjhyZW07XFxuICAgIGJveC1zaGFkb3c6IDAgMXB4IDFweCAwIHJnYmEoMCwgMCwgMCwgMC4wNik7IH1cXG4gICAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1wYWdpbmF0aW9uLWNvbnRhaW5lcjpub3QoOmxhc3QtY2hpbGQpIHtcXG4gICAgICBtYXJnaW4tcmlnaHQ6IDFyZW07IH1cXG4gICAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1wYWdpbmF0aW9uLWNvbnRhaW5lcjpudGgtY2hpbGQoMikgc3ZnIHtcXG4gICAgICBtYXJnaW4tcmlnaHQ6IDFyZW07IH1cXG4gICAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1wYWdpbmF0aW9uLWNvbnRhaW5lcjpudGgtY2hpbGQoMykgc3ZnIHtcXG4gICAgICBtYXJnaW4tbGVmdDogMXJlbTsgfVxcbiAgICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXBhZ2luYXRpb24tY29udGFpbmVyLS1kaXNhYmxlZCB7XFxuICAgICAgY3Vyc29yOiBub3QtYWxsb3dlZDtcXG4gICAgICBjb2xvcjogcmdiYSgwLCAwLCAwLCAwLjI1KTtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjVmNmY3OyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogMzEuNWVtKSB7XFxuICAgICAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1wYWdpbmF0aW9uLWNvbnRhaW5lciB7XFxuICAgICAgICBtYXJnaW46IDA7IH0gfVxcbiAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1zdmctc2l6ZSB7XFxuICAgIGhlaWdodDogMnJlbTtcXG4gICAgd2lkdGg6IDJyZW07IH1cXG4gIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtc3ZnLWNvbG9yIHtcXG4gICAgZmlsbDogIzU1MWE4YjsgfVxcblxcbi5hcGktcmVzdWx0cy1kaXNwbGF5X19kaXNwbGF5LWJhciB7XFxuICB3aWR0aDogMTAwJTtcXG4gIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCByZ2JhKDk5LCA2OCwgMTUwLCAwLjEpO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2Y2ZjRmYTtcXG4gIGNvbG9yOiAjNTM1MzUzO1xcbiAgcGFkZGluZy1sZWZ0OiAxNiU7XFxuICBtYXJnaW4tYm90dG9tOiAycmVtO1xcbiAgaGVpZ2h0OiAyLjFyZW07IH1cXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNzVyZW0pIHtcXG4gICAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX2Rpc3BsYXktYmFyIHtcXG4gICAgICBwYWRkaW5nLWxlZnQ6IDIuNSU7IH0gfVxcblxcbi5hcGktcmVzdWx0cy1kaXNwbGF5X19tb2JpbGUge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2YzZjVmODtcXG4gIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCByZ2JhKDk5LCA2OCwgMTUwLCAwLjEpO1xcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgbWFyZ2luLWJvdHRvbTogMC4xcmVtO1xcbiAgaGVpZ2h0OiA1LjJyZW07XFxuICBkaXNwbGF5OiBub25lOyB9XFxuICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDUzLjEyNWVtKSB7XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19tb2JpbGUge1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgcGFkZGluZzogMS4ycmVtIDIuNSU7IH0gfVxcbiAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiAzMS41ZW0pIHtcXG4gICAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX21vYmlsZSB7XFxuICAgICAgcGFkZGluZzogMS4ycmVtOyB9IH1cXG4gIC5hcGktcmVzdWx0cy1kaXNwbGF5X19tb2JpbGUtc3ZnLXNpemUge1xcbiAgICB3aWR0aDogMS40cmVtO1xcbiAgICBoZWlnaHQ6IDEuNHJlbTsgfVxcblxcbi5hcGktcmVzdWx0cy1kaXNwbGF5X19tb2JpbGUtZGlzcGxheS1vcHRpb25zIHtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmM2Y1Zjg7XFxuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgcmdiYSg5OSwgNjgsIDE1MCwgMC4xKTtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICBhbGlnbi1pdGVtczogZmxleC1zdGFydDtcXG4gIHBhZGRpbmc6IDEuMnJlbSAwO1xcbiAgZGlzcGxheTogbm9uZTsgfVxcblxcbi5hcGktcmVzdWx0cy1kaXNwbGF5X19tb2JpbGUtZGlzcGxheS1vcHRpb25zLWdyb3VwIHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxuICB3aWR0aDogNDUlO1xcbiAgbWFyZ2luOiAwIGF1dG8gMXJlbSBhdXRvOyB9XFxuICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDUxLjU2MjVlbSkge1xcbiAgICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbW9iaWxlLWRpc3BsYXktb3B0aW9ucy1ncm91cCB7XFxuICAgICAgd2lkdGg6IDYwJTsgfSB9XFxuICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDM3LjVlbSkge1xcbiAgICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbW9iaWxlLWRpc3BsYXktb3B0aW9ucy1ncm91cCB7XFxuICAgICAgd2lkdGg6IDgwJTsgfSB9XFxuICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDI4LjEyNWVtKSB7XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19tb2JpbGUtZGlzcGxheS1vcHRpb25zLWdyb3VwIHtcXG4gICAgICB3aWR0aDogOTUlOyB9IH1cXG4gIC5hcGktcmVzdWx0cy1kaXNwbGF5X19tb2JpbGUtZGlzcGxheS1vcHRpb25zLWdyb3VwIGxhYmVsIHtcXG4gICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuXFxuLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1zZWxlY3QtLW1vYmlsZSB7XFxuICB3aWR0aDogMjRyZW07IH1cXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogMjEuODc1ZW0pIHtcXG4gICAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1zZWxlY3QtLW1vYmlsZSB7XFxuICAgICAgd2lkdGg6IDE2cmVtOyB9IH1cXG5cXG4uYXBpLXJlc3VsdHMtbW9iaWxlLWRpc3BsYXktYnRuIHtcXG4gIGFsaWduLXNlbGY6IGNlbnRlcjsgfVxcblxcbi53cmFwcGVyIHtcXG4gIG92ZXJmbG93LXg6IHNjcm9sbDtcXG4gIG92ZXJmbG93LXk6IGhpZGRlbjtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBtYXJnaW46IDAgYXV0bztcXG4gIHdpZHRoOiA2OCU7IH1cXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNzVyZW0pIHtcXG4gICAgLndyYXBwZXIge1xcbiAgICAgIHdpZHRoOiA5MCU7IH0gfVxcblxcbi5jYXJkLWNoZWNrbGlzdCB7XFxuICB3aWR0aDogMTAwJTtcXG4gIGp1c3RpZnktc2VsZjogY2VudGVyOyB9XFxuICAuY2FyZC1jaGVja2xpc3RfX3JvdyB7XFxuICAgIGRpc3BsYXk6IGdyaWQ7XFxuICAgIGhlaWdodDogM3JlbTsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX3Jvdy0tNyB7XFxuICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiAxMCUgMjIuNSUgMTAlIDE3LjUlIDE1JSAxNSUgMTAlOyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fcm93LS05IHtcXG4gICAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCg5LCAxZnIpOyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fcm93LS1oZWFkZXIge1xcbiAgICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjMDAwO1xcbiAgICAgIGNvbG9yOiAjNTMxYThiO1xcbiAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICAgICAgZm9udC1zaXplOiAxLjJyZW0gIWltcG9ydGFudDtcXG4gICAgICBmb250LXdlaWdodDogMjAwICFpbXBvcnRhbnQ7IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19yb3ctLWdyZXkge1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmMmYyZjI7IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19yb3c6bnRoLWNoaWxkKGV2ZW4pIHtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjJmMmYyOyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fcm93LS1oZWFkZXIge1xcbiAgICAgIGhlaWdodDogMy41cmVtOyB9XFxuICAuY2FyZC1jaGVja2xpc3RfX2RhdGEge1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC13cmFwOiBub3dyYXA7XFxuICAgIGp1c3RpZnktY29udGVudDogZmxleC1zdGFydDtcXG4gICAgZm9udC1zaXplOiAxLjRyZW07IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19kYXRhLS1zZXQge1xcbiAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICAgICAgcGFkZGluZy1sZWZ0OiAwLjVyZW07IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19kYXRhLS1uYW1lIHtcXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtc3RhcnQ7IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19kYXRhLS1yYXJpdHkge1xcbiAgICAgIHRleHQtdHJhbnNmb3JtOiBjYXBpdGFsaXplOyB9XFxuICAuY2FyZC1jaGVja2xpc3RfX2RhdGEtbGluayB7XFxuICAgIHBhZGRpbmc6IDFyZW0gMDtcXG4gICAgZGlzcGxheTogYmxvY2s7XFxuICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGNvbG9yOiAjMDAwO1xcbiAgICB3aGl0ZS1zcGFjZTogbm93cmFwO1xcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xcbiAgICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpczsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX2RhdGEtbGluay0tcHJpY2Uge1xcbiAgICAgIGNvbG9yOiAjMDA2ODg1OyB9XFxuXFxuLnRvb2x0aXAge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgei1pbmRleDogNTtcXG4gIHdpZHRoOiAyNHJlbTtcXG4gIGhlaWdodDogMzRyZW07IH1cXG4gIC50b29sdGlwX19pbWcge1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgaGVpZ2h0OiAxMDAlOyB9XFxuXFxuLm5lZ2F0aXZlLWVhcm5pbmdzIHtcXG4gIGNvbG9yOiByZWQ7IH1cXG5cXG4ucG9zaXRpdmUtZWFybmluZ3Mge1xcbiAgY29sb3I6IGdyZWVuOyB9XFxuXFxuLmltYWdlLWdyaWQge1xcbiAgcGFkZGluZzogN3JlbSAxNiU7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgZmxleC13cmFwOiB3cmFwOyB9XFxuICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDc1cmVtKSB7XFxuICAgIC5pbWFnZS1ncmlkIHtcXG4gICAgICBwYWRkaW5nOiA0cmVtIDIuNSU7IH0gfVxcbiAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA2Mi41ZW0pIHtcXG4gICAgLmltYWdlLWdyaWQge1xcbiAgICAgIGdyaWQtY29sdW1uLWdhcDogMXJlbTsgfSB9XFxuICAuaW1hZ2UtZ3JpZF9fb3V0ZXItZGl2IHtcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgICBoZWlnaHQ6IDEwMCU7IH1cXG4gIC5pbWFnZS1ncmlkX19pbm5lci1kaXYge1xcbiAgICBwZXJzcGVjdGl2ZTogMTUwcmVtO1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgaGVpZ2h0OiAxMDAlOyB9XFxuICAuaW1hZ2UtZ3JpZF9fZG91YmxlIHtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGhlaWdodDogMTAwJTtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICB0b3A6IDA7XFxuICAgIGxlZnQ6IDA7XFxuICAgIGJhY2tmYWNlLXZpc2liaWxpdHk6IGhpZGRlbjtcXG4gICAgb3ZlcmZsb3c6IGhpZGRlbjtcXG4gICAgdHJhbnNpdGlvbjogYWxsIDAuOHMgZWFzZTsgfVxcbiAgICAuaW1hZ2UtZ3JpZF9fZG91YmxlLS1iYWNrIHtcXG4gICAgICB0cmFuc2Zvcm06IHJvdGF0ZVkoMTgwZGVnKTsgfVxcbiAgLmltYWdlLWdyaWRfX2RvdWJsZS1idG4ge1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIHRvcDogMjYlO1xcbiAgICBsZWZ0OiA3NSU7XFxuICAgIHdpZHRoOiA0LjRyZW07XFxuICAgIGhlaWdodDogNC40cmVtO1xcbiAgICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC42KTtcXG4gICAgYm9yZGVyOiAycHggc29saWQgIzM0MjQ0MjtcXG4gICAgdHJhbnNpdGlvbjogYWxsIDAuMnM7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAgIC5pbWFnZS1ncmlkX19kb3VibGUtYnRuOmhvdmVyIHtcXG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjsgfVxcbiAgLmltYWdlLWdyaWRfX2RvdWJsZS1idG4tc3ZnIHtcXG4gICAgaGVpZ2h0OiAyLjVyZW07XFxuICAgIHdpZHRoOiAyLjVyZW07XFxuICAgIHBvaW50ZXItZXZlbnRzOiBub25lOyB9XFxuICAuaW1hZ2UtZ3JpZF9fZG9idWxlLWJ0bi1zdmctY29sb3Ige1xcbiAgICBjb2xvcjogIzE2MTYxZDsgfVxcbiAgLmltYWdlLWdyaWRfX2NvbnRhaW5lciB7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBoZWlnaHQ6IDEwMCU7IH1cXG4gIC5pbWFnZS1ncmlkX19pbWFnZSB7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBoZWlnaHQ6IDEwMCU7XFxuICAgIGJveC1zaGFkb3c6IDFweCAxcHggNnB4IHJnYmEoMCwgMCwgMCwgMC40NSk7XFxuICAgIGJvcmRlci1yYWRpdXM6IDQuNzUlIC8gMy41JTsgfVxcbiAgLmltYWdlLWdyaWRfX2xpbmsge1xcbiAgICBtYXJnaW4tYm90dG9tOiAwLjlyZW07XFxuICAgIHdpZHRoOiAyNC4yNSU7XFxuICAgIGhlaWdodDogYXV0bztcXG4gICAgbWFyZ2luLWJvdHRvbTogMC45cmVtO1xcbiAgICBwYWdlLWJyZWFrLWFmdGVyOiBhdXRvO1xcbiAgICBwYWdlLWJyZWFrLWJlZm9yZTogYXV0bztcXG4gICAgcGFnZS1icmVhay1pbnNpZGU6IGF2b2lkO1xcbiAgICBkaXNwbGF5OiBibG9jazsgfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDU5LjM3NWVtKSB7XFxuICAgICAgLmltYWdlLWdyaWRfX2xpbmsge1xcbiAgICAgICAgd2lkdGg6IDMxLjc1JTsgfSB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNDAuNjI1ZW0pIHtcXG4gICAgICAuaW1hZ2UtZ3JpZF9fbGluayB7XFxuICAgICAgICB3aWR0aDogNDcuMjUlOyB9IH1cXG5cXG4uY2FyZCB7XFxuICB3aWR0aDogMTAwJTtcXG4gIG1heC13aWR0aDogMTAwcmVtO1xcbiAgcGFkZGluZzogMCAxNiU7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgbWFyZ2luLXRvcDogM3JlbTtcXG4gIHBhZGRpbmctYm90dG9tOiAwLjdyZW07XFxuICBib3JkZXItYm90dG9tOiAxcHggZGFzaGVkIHJnYmEoMCwgMCwgMCwgMC43KTsgfVxcbiAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA3NXJlbSkge1xcbiAgICAuY2FyZCB7XFxuICAgICAgcGFkZGluZzogMCAyLjUlIDAuN3JlbSAyLjUlOyB9IH1cXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNjIuNWVtKSB7XFxuICAgIC5jYXJkIHtcXG4gICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH0gfVxcbiAgLmNhcmRfX2ltZy1jb250YWluZXIge1xcbiAgICB6LWluZGV4OiAyO1xcbiAgICBib3JkZXItcmFkaXVzOiAxMDAlOyB9XFxuICAuY2FyZF9faW1nIHtcXG4gICAgd2lkdGg6IDMzcmVtO1xcbiAgICBoZWlnaHQ6IDQ2cmVtO1xcbiAgICBib3gtc2hhZG93OiAxcHggMXB4IDhweCByZ2JhKDAsIDAsIDAsIDAuNSk7XFxuICAgIGJvcmRlci1yYWRpdXM6IDQuNzUlIC8gMy41JTsgfVxcbiAgLmNhcmRfX2ltZy1sZWZ0IHtcXG4gICAgd2lkdGg6IDMzcmVtO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgICB6LWluZGV4OiAyOyB9XFxuICAuY2FyZF9faW1nLWJ0biB7XFxuICAgIGFsaWduLXNlbGY6IGNlbnRlcjtcXG4gICAgbWFyZ2luLXRvcDogMXJlbTtcXG4gICAgaGVpZ2h0OiAyLjhyZW07XFxuICAgIGZvbnQtc2l6ZTogMS40cmVtO1xcbiAgICBsaW5lLWhlaWdodDogMS44O1xcbiAgICBjb2xvcjogIzU1MWE4YjtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2Y5ZjdmNTtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSg4NSwgMjYsIDEzOSwgMC41KTtcXG4gICAgYm9yZGVyLXJhZGl1czogM3B4O1xcbiAgICBib3gtc2hhZG93OiAwIDFweCAwIHJnYmEoMCwgMCwgMCwgMC4wNik7XFxuICAgIHRyYW5zaXRpb246IGFsbCAwLjJzO1xcbiAgICBwYWRkaW5nOiAwLjJyZW0gMC41cmVtO1xcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cXG4gICAgLmNhcmRfX2ltZy1idG46aG92ZXIge1xcbiAgICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgICAgIGJvcmRlci1jb2xvcjogIzYzNDQ5NjsgfVxcbiAgLmNhcmRfX2ltZy1zdmcge1xcbiAgICBoZWlnaHQ6IDEuNHJlbTtcXG4gICAgd2lkdGg6IDEuNHJlbTtcXG4gICAgbWFyZ2luLXJpZ2h0OiAwLjNyZW07XFxuICAgIHBvaW50ZXItZXZlbnRzOiBub25lOyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNjIuNWVtKSB7XFxuICAgICAgLmNhcmRfX2ltZy1zdmcge1xcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgfSB9XFxuICAuY2FyZF9faW1nLWRvdWJsZS1zaWRlZCB7XFxuICAgIHBlcnNwZWN0aXZlOiAxNTByZW07XFxuICAgIGhlaWdodDogNDZyZW07IH1cXG4gIC5jYXJkX19pbWctZG91YmxlIHtcXG4gICAgd2lkdGg6IDMzcmVtO1xcbiAgICBoZWlnaHQ6IDQ2cmVtO1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIHRvcDogMDtcXG4gICAgbGVmdDogMDtcXG4gICAgYmFja2ZhY2UtdmlzaWJpbGl0eTogaGlkZGVuO1xcbiAgICBvdmVyZmxvdzogaGlkZGVuOyB9XFxuICAgIC5jYXJkX19pbWctZG91YmxlLS1iYWNrIHtcXG4gICAgICB0cmFuc2Zvcm06IHJvdGF0ZVkoMTgwZGVnKTsgfVxcbiAgLmNhcmRfX3RleHQge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgICBib3JkZXItcmFkaXVzOiA0cHg7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMCwgMCwgMCwgMC4yNSk7XFxuICAgIGJvcmRlci10b3A6IDNweCBzb2xpZCAjMDAwO1xcbiAgICBib3JkZXItYm90dG9tOiAzcHggc29saWQgIzAwMDtcXG4gICAgbWFyZ2luLXRvcDogMnJlbTtcXG4gICAgd2lkdGg6IDM0cmVtO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgICBwYWRkaW5nOiAzcmVtO1xcbiAgICBtYXJnaW4tcmlnaHQ6IDNyZW07XFxuICAgIG1hcmdpbi1sZWZ0OiAtMnJlbTsgfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDYyLjVlbSkge1xcbiAgICAgIC5jYXJkX190ZXh0IHtcXG4gICAgICAgIG1hcmdpbjogMXJlbSAwOyB9IH1cXG4gICAgLmNhcmRfX3RleHQtZmxleCB7XFxuICAgICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcXG4gICAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2JmYmZiZjsgfVxcbiAgICAuY2FyZF9fdGV4dC10aXRsZSB7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAgICAgLmNhcmRfX3RleHQtdGl0bGUtaDMge1xcbiAgICAgICAgZm9udC1zaXplOiAxLjhyZW07XFxuICAgICAgICBmb250LXdlaWdodDogNDAwO1xcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuICAgIC5jYXJkX190ZXh0LWNvbG9yLWluZGljYXRvciB7XFxuICAgICAgd2lkdGg6IDEuM3JlbTtcXG4gICAgICBoZWlnaHQ6IDEuM3JlbTtcXG4gICAgICBib3JkZXI6IDFweCBzb2xpZCAjMzMzO1xcbiAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gICAgICBib3gtc2hhZG93OiAwcHggMHB4IDBweCAycHggcmdiYSgwLCAwLCAwLCAwLjIpO1xcbiAgICAgIG1hcmdpbi1yaWdodDogMC43cmVtO1xcbiAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jazsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWNvbG9yLWluZGljYXRvci0tVSB7XFxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDEyOCwgMTI4LCAyNTUsIDAuNyk7IH1cXG4gICAgICAuY2FyZF9fdGV4dC1jb2xvci1pbmRpY2F0b3ItLUIge1xcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAwLCAwLCAwLjcpOyB9XFxuICAgICAgLmNhcmRfX3RleHQtY29sb3ItaW5kaWNhdG9yLS1SIHtcXG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjU1LCA3NywgNzcsIDAuNyk7IH1cXG4gICAgICAuY2FyZF9fdGV4dC1jb2xvci1pbmRpY2F0b3ItLVcge1xcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjcpOyB9XFxuICAgICAgLmNhcmRfX3RleHQtY29sb3ItaW5kaWNhdG9yLS1HIHtcXG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMjU1LCAwLCAwLjcpOyB9XFxuICAgIC5jYXJkX190ZXh0LW9yYWNsZS1wIHtcXG4gICAgICBtYXJnaW4tYm90dG9tOiAxcmVtO1xcbiAgICAgIGZvbnQtc2l6ZTogMS4zcmVtOyB9XFxuICAgIC5jYXJkX190ZXh0LW9yYWNsZS1mbGF2b3Ige1xcbiAgICAgIGZvbnQtc2l6ZTogMS4zcmVtO1xcbiAgICAgIGZvbnQtc3R5bGU6IGl0YWxpYzsgfVxcbiAgICAuY2FyZF9fdGV4dC1pbGx1c3RyYXRvciB7XFxuICAgICAgZm9udC1zaXplOiAxLjJyZW07XFxuICAgICAgZm9udC1zdHlsZTogaXRhbGljOyB9XFxuICAgIC5jYXJkX190ZXh0LWxlZ2FsIHtcXG4gICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgIGZsZXgtZGlyZWN0aW9uOiByb3c7XFxuICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuOyB9XFxuICAgICAgLmNhcmRfX3RleHQtbGVnYWwtaGFsZiB7XFxuICAgICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWxlZ2FsLXNwYW4tY29udGFpbmVyIHtcXG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICAgICAgZm9udC1zaXplOiAxLjRyZW07IH1cXG4gICAgICAgIC5jYXJkX190ZXh0LWxlZ2FsLXNwYW4tY29udGFpbmVyOm5vdCg6bGFzdC1jaGlsZCkge1xcbiAgICAgICAgICBtYXJnaW4tYm90dG9tOiAwLjVyZW07IH1cXG4gICAgICAuY2FyZF9fdGV4dC1sZWdhbC1zcGFuLWJveCB7XFxuICAgICAgICB3aWR0aDogNnJlbTtcXG4gICAgICAgIGhlaWdodDogMi41cmVtO1xcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAwLjNyZW07XFxuICAgICAgICBmb250LXNpemU6IDFyZW07XFxuICAgICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xcbiAgICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDNweDsgfVxcbiAgICAgICAgLmNhcmRfX3RleHQtbGVnYWwtc3Bhbi1ib3gtLW5vdF9sZWdhbCB7XFxuICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6ICNlNjAwMDA7IH1cXG4gICAgICAgIC5jYXJkX190ZXh0LWxlZ2FsLXNwYW4tYm94LS1sZWdhbCB7XFxuICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6ICMwMDk5MDA7IH1cXG4gICAgICAuY2FyZF9fdGV4dC1sZWdhbC1zcGFuLWJveCB7XFxuICAgICAgICBjb2xvcjogI2ZmZjsgfVxcbiAgLmNhcmRfX3NldCB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA4MS4yNWVtKSB7XFxuICAgICAgLmNhcmRfX3NldCB7XFxuICAgICAgICB3aWR0aDogMzByZW07IH0gfVxcbiAgICAuY2FyZF9fc2V0LWJhbm5lciB7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBib3JkZXI6IDFweCBzb2xpZCAjYmZiZmJmO1xcbiAgICAgIHdpZHRoOiA0MHJlbTtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDk0NjVjO1xcbiAgICAgIGNvbG9yOiAjZmRmZGZkO1xcbiAgICAgIHBhZGRpbmc6IDAuN3JlbTtcXG4gICAgICBib3JkZXItcmFkaXVzOiAzcHg7IH1cXG4gICAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDgxLjI1ZW0pIHtcXG4gICAgICAgIC5jYXJkX19zZXQtYmFubmVyIHtcXG4gICAgICAgICAgd2lkdGg6IDMwcmVtOyB9IH1cXG4gICAgICAuY2FyZF9fc2V0LWJhbm5lci1zdmctY29udGFpbmVyIHtcXG4gICAgICAgIG1hcmdpbi1yaWdodDogMXJlbTsgfVxcbiAgICAgIC5jYXJkX19zZXQtYmFubmVyLXN2ZyB7XFxuICAgICAgICB3aWR0aDogMi40cmVtO1xcbiAgICAgICAgaGVpZ2h0OiAyLjRyZW07XFxuICAgICAgICBmaWx0ZXI6IGludmVydCgxMDAlKTsgfVxcbiAgICAuY2FyZF9fc2V0LWRldGFpbHMge1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgfVxcbiAgICAuY2FyZF9fc2V0LWhlYWRlci1uYW1lIHtcXG4gICAgICBmb250LXNpemU6IDEuN3JlbXJlbTsgfVxcbiAgICAuY2FyZF9fc2V0LWhlYWRlci1jb2RlIHtcXG4gICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOyB9XFxuICAgIC5jYXJkX19zZXQtcHJpbnRzLWhlYWRlciB7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzQ5NDY1YztcXG4gICAgICBjb2xvcjogI2ZkZmRmZDtcXG4gICAgICBmb250LXNpemU6IDEuM3JlbTtcXG4gICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkICNiZmJmYmY7XFxuICAgICAgYm9yZGVyLXJhZGl1czogM3B4O1xcbiAgICAgIHBhZGRpbmc6IDAuM3JlbSAwLjdyZW07IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtc3ZnLWNvbnRhaW5lciB7XFxuICAgICAgaGVpZ2h0OiAxLjhyZW07XFxuICAgICAgd2lkdGg6IDEuOHJlbTtcXG4gICAgICBib3JkZXI6IDFweCBzb2xpZCAjYmZiZmJmO1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgICBib3JkZXItcmFkaXVzOiAxMDAlOyB9XFxuICAgIC5jYXJkX19zZXQtcHJpbnRzLXN2Zy0tY29tbW9uIHtcXG4gICAgICBmaWxsOiAjMDAwOyB9XFxuICAgIC5jYXJkX19zZXQtcHJpbnRzLXN2Zy0tdW5jb21tb24ge1xcbiAgICAgIGZpbGw6ICNlNmU2ZTY7IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtc3ZnLS1yYXJlIHtcXG4gICAgICBmaWxsOiAjZTZjMzAwOyB9XFxuICAgIC5jYXJkX19zZXQtcHJpbnRzLXN2Zy0tbXl0aGljIHtcXG4gICAgICBmaWxsOiAjZmYwMDAwOyB9XFxuICAgIC5jYXJkX19zZXQtcHJpbnRzLWxpc3Qge1xcbiAgICAgIGxpc3Qtc3R5bGU6IG5vbmU7XFxuICAgICAgYm9yZGVyLXJhZGl1czogM3B4OyB9XFxuICAgICAgLmNhcmRfX3NldC1wcmludHMtbGlzdC1saW5rOmxpbmssIC5jYXJkX19zZXQtcHJpbnRzLWxpc3QtbGluazp2aXNpdGVkIHtcXG4gICAgICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gICAgICAgIGNvbG9yOiAjMDAwOyB9XFxuICAgICAgLmNhcmRfX3NldC1wcmludHMtbGlzdC1pdGVtIHtcXG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxuICAgICAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgICAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2U3ZTllYztcXG4gICAgICAgIGJvcmRlci1sZWZ0OiAxcHggc29saWQgI2NkY2RjZDtcXG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxuICAgICAgICBwYWRkaW5nOiAwLjI1cmVtIDA7IH1cXG4gICAgICAgIC5jYXJkX19zZXQtcHJpbnRzLWxpc3QtaXRlbS0tcGwtMTQge1xcbiAgICAgICAgICBwYWRkaW5nLWxlZnQ6IDEuNHJlbTtcXG4gICAgICAgICAgYm9yZGVyLWJvdHRvbTogM3B4IHNvbGlkICMwMDA7IH1cXG4gICAgICAgIC5jYXJkX19zZXQtcHJpbnRzLWxpc3QtaXRlbTpob3ZlciB7XFxuICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmMmYyZjI7IH1cXG4gICAgICAuY2FyZF9fc2V0LXByaW50cy1saXN0LWl0ZW0tbmFtZS13cmFwcGVyIHtcXG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICAgICAgbWFyZ2luLWxlZnQ6IC0xcmVtOyB9XFxuICAgICAgLmNhcmRfX3NldC1wcmludHMtbGlzdC1pdGVtLXNldC1uYW1lIHtcXG4gICAgICAgIG1hcmdpbi1sZWZ0OiAwLjVyZW07IH1cXG4gICAgICAuY2FyZF9fc2V0LXByaW50cy1saXN0LWl0ZW0tcHJpY2Uge1xcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAwLjdyZW07XFxuICAgICAgICBjb2xvcjogIzAwNjg4NTsgfVxcblxcbi5jYXJkLXBhZ2Uge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICBncmlkLWNvbHVtbjogMSAvIC0xO1xcbiAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuXFxuLmFkZC10by1pbnYsXFxuLnJlbW92ZS1mcm9tLWludiB7XFxuICBtYXJnaW4tdG9wOiAzcmVtO1xcbiAgd2lkdGg6IDUwJTtcXG4gIG1hcmdpbi1sZWZ0OiA1MCU7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTUwJSk7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgfVxcbiAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA2Mi41ZW0pIHtcXG4gICAgLmFkZC10by1pbnYsXFxuICAgIC5yZW1vdmUtZnJvbS1pbnYge1xcbiAgICAgIHdpZHRoOiAxMDAlOyB9IH1cXG4gIC5hZGQtdG8taW52X19oZWFkZXIsXFxuICAucmVtb3ZlLWZyb20taW52X19oZWFkZXIge1xcbiAgICBjb2xvcjogIzE2MTYxZDtcXG4gICAgZm9udC1zaXplOiAyLjJyZW07XFxuICAgIGZvbnQtd2VpZ2h0OiAzMDA7XFxuICAgIG1hcmdpbjogMCBhdXRvIDFyZW0gYXV0bzsgfVxcbiAgLmFkZC10by1pbnZfX2Zvcm0sXFxuICAucmVtb3ZlLWZyb20taW52X19mb3JtIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgfVxcbiAgICAuYWRkLXRvLWludl9fZm9ybS1wcmljZSxcXG4gICAgLnJlbW92ZS1mcm9tLWludl9fZm9ybS1wcmljZSB7XFxuICAgICAgd2lkdGg6IDIwcmVtO1xcbiAgICAgIGhlaWdodDogMy41cmVtO1xcbiAgICAgIG1hcmdpbi1ib3R0b206IDFyZW07XFxuICAgICAgcGFkZGluZzogMXJlbTtcXG4gICAgICBib3JkZXI6IHNvbGlkIDFweCAjYmZiZmJmO1xcbiAgICAgIGJvcmRlci1yYWRpdXM6IDVweDsgfVxcbiAgICAgIC5hZGQtdG8taW52X19mb3JtLXByaWNlOmZvY3VzLFxcbiAgICAgIC5yZW1vdmUtZnJvbS1pbnZfX2Zvcm0tcHJpY2U6Zm9jdXMge1xcbiAgICAgICAgYm9yZGVyOiBzb2xpZCAxcHggIzAwMDsgfVxcbiAgICAuYWRkLXRvLWludl9fZm9ybS1ncm91cCxcXG4gICAgLnJlbW92ZS1mcm9tLWludl9fZm9ybS1ncm91cCB7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWV2ZW5seTtcXG4gICAgICBhbGlnbi1jb250ZW50OiBjZW50ZXI7XFxuICAgICAgbWFyZ2luLWJvdHRvbTogMS41cmVtO1xcbiAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcbiAgICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogMzEuNWVtKSB7XFxuICAgICAgICAuYWRkLXRvLWludl9fZm9ybS1ncm91cCxcXG4gICAgICAgIC5yZW1vdmUtZnJvbS1pbnZfX2Zvcm0tZ3JvdXAge1xcbiAgICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyOyB9IH1cXG4gICAgLmFkZC10by1pbnZfX2Zvcm0tbGFiZWwsXFxuICAgIC5yZW1vdmUtZnJvbS1pbnZfX2Zvcm0tbGFiZWwge1xcbiAgICAgIG1hcmdpbi1yaWdodDogMC4zcmVtO1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgYWxpZ24tY29udGVudDogY2VudGVyO1xcbiAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICAgIGNvbG9yOiAjMTYxNjFkO1xcbiAgICAgIG1hcmdpbi10b3A6IDAuNDVyZW07IH1cXG4gICAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDMxLjVlbSkge1xcbiAgICAgICAgLmFkZC10by1pbnZfX2Zvcm0tbGFiZWwsXFxuICAgICAgICAucmVtb3ZlLWZyb20taW52X19mb3JtLWxhYmVsIHtcXG4gICAgICAgICAgbWFyZ2luLWJvdHRvbTogMC41cmVtOyB9IH1cXG4gIC5hZGQtdG8taW52LXByaWNlLW1zZyxcXG4gIC5yZW1vdmUtZnJvbS1pbnYtcHJpY2UtbXNnIHtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICBib3R0b206IC0xLjhyZW07XFxuICAgIHJpZ2h0OiAyNSU7XFxuICAgIGNvbG9yOiByZWQ7IH1cXG4gIC5hZGQtdG8taW52X19zdWJtaXQsXFxuICAucmVtb3ZlLWZyb20taW52X19zdWJtaXQge1xcbiAgICBhbGlnbi1zZWxmOiBjZW50ZXI7XFxuICAgIGhlaWdodDogMy4xcmVtO1xcbiAgICBmb250LXNpemU6IDEuNHJlbTtcXG4gICAgbGluZS1oZWlnaHQ6IDEuODtcXG4gICAgY29sb3I6ICM1NTFhOGI7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmOWY3ZjU7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoODUsIDI2LCAxMzksIDAuNSk7XFxuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgYm94LXNoYWRvdzogMCAxcHggMCByZ2JhKDAsIDAsIDAsIDAuMDYpO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgMC4ycztcXG4gICAgcGFkZGluZzogMC4ycmVtIDAuNzVyZW07XFxuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgbWFyZ2luLWJvdHRvbTogMXJlbTsgfVxcbiAgICAuYWRkLXRvLWludl9fc3VibWl0OmhvdmVyLFxcbiAgICAucmVtb3ZlLWZyb20taW52X19zdWJtaXQ6aG92ZXIge1xcbiAgICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgICAgIGJvcmRlci1jb2xvcjogIzYzNDQ5NjsgfVxcblxcbi51dGlsLXNwYWNlOjpiZWZvcmUsXFxuLnV0aWwtc3BhY2U6OmFmdGVyIHtcXG4gIGNvbnRlbnQ6ICcnO1xcbiAgbWFyZ2luOiAwIDAuMnJlbTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuXFxuLm5vLXJlc3VsdHMge1xcbiAganVzdGlmeS1zZWxmOiBjZW50ZXI7IH1cXG5cXG4uaG9tZXBhZ2Uge1xcbiAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KHRvIGJvdHRvbSwgIzFkMWMyNSwgIzQzMWUzZik7XFxuICBiYWNrZ3JvdW5kLXJlcGVhdDogbm8tcmVwZWF0O1xcbiAgaGVpZ2h0OiAxMDB2aDtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBvdmVyZmxvdy14OiBoaWRkZW4gIWltcG9ydGFudDtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgYmFja2dyb3VuZC1zaXplOiBjb3ZlcjsgfVxcbiAgLmhvbWVwYWdlX19jZW50ZXIge1xcbiAgICBhbGlnbi1zZWxmOiBjZW50ZXI7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiAyOC4xMjVlbSkge1xcbiAgICAgIC5ob21lcGFnZV9fY2VudGVyIHtcXG4gICAgICAgIG1hcmdpbi10b3A6IC0xMnJlbTsgfSB9XFxuICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDQwLjYyNWVtKSB7XFxuICAgIC5ob21lcGFnZV9fY2VudGVyLWhlYWRpbmctd3JhcHBlciB7XFxuICAgICAgbWFyZ2luOiAwIGF1dG8gMC41cmVtIGF1dG87XFxuICAgICAgd2lkdGg6IDc1JTtcXG4gICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICAgIHRleHQtYWxpZ246IGNlbnRlcjsgfSB9XFxuICAuaG9tZXBhZ2VfX3NlYXJjaCB7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcbiAgLmhvbWVwYWdlX19zZWFyY2gtaW5wdXQge1xcbiAgICBwYWRkaW5nOiAxLjJyZW0gMS40cmVtIDEuMnJlbSA2LjJyZW07XFxuICAgIGZvbnQtc2l6ZTogM3JlbTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzI0MjAzMTtcXG4gICAgY29sb3I6ICNkN2Q3ZDc7XFxuICAgIGJvcmRlci1yYWRpdXM6IDRweDtcXG4gICAgYm94LXNoYWRvdzogMHB4IDBweCAwcHggMnB4IHJnYmEoMCwgMCwgMCwgMC41KTtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC41KTsgfVxcbiAgICAuaG9tZXBhZ2VfX3NlYXJjaC1pbnB1dDo6cGxhY2Vob2xkZXIge1xcbiAgICAgIHRleHQtYWxpZ246IGNlbnRlcjsgfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDQwLjYyNWVtKSB7XFxuICAgICAgLmhvbWVwYWdlX19zZWFyY2gtaW5wdXQge1xcbiAgICAgICAgd2lkdGg6IDgwJTtcXG4gICAgICAgIG1hcmdpbi1sZWZ0OiAxMCU7IH0gfVxcbiAgLmhvbWVwYWdlX19zZWFyY2gtYnRuIHtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICBsZWZ0OiA2cmVtO1xcbiAgICB0b3A6IDJyZW07IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA0MC42MjVlbSkge1xcbiAgICAgIC5ob21lcGFnZV9fc2VhcmNoLWJ0biB7XFxuICAgICAgICBsZWZ0OiAxMnJlbTsgfSB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogMjguMTI1ZW0pIHtcXG4gICAgICAuaG9tZXBhZ2VfX3NlYXJjaC1idG4ge1xcbiAgICAgICAgbGVmdDogMTByZW07IH0gfVxcbiAgLmhvbWVwYWdlX19pY29uLXNpemluZy0tc2VhcmNoIHtcXG4gICAgd2lkdGg6IDNyZW07XFxuICAgIGhlaWdodDogM3JlbTtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC0xNTAlKTsgfVxcbiAgLmhvbWVwYWdlX19pY29uLXBhdGgge1xcbiAgICBmaWxsOiAjYmZiZmJmOyB9XFxuICAuaG9tZXBhZ2VfX2xpbmtzIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA0MC42MjVlbSkge1xcbiAgICAgIC5ob21lcGFnZV9fbGlua3Mge1xcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgfSB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogMjguMTI1ZW0pIHtcXG4gICAgICAuaG9tZXBhZ2VfX2xpbmtzIHtcXG4gICAgICAgIG1hcmdpbi1sZWZ0OiA3LjUlOyB9IH1cXG4gIC5ob21lcGFnZV9fbGluayB7XFxuICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSg4NSwgMjYsIDEzOSwgMC41KTtcXG4gICAgYm9yZGVyLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNik7XFxuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgY29sb3I6ICNmZmY7XFxuICAgIG1hcmdpbi10b3A6IDAuNnJlbTtcXG4gICAgbWFyZ2luLXJpZ2h0OiAzcmVtO1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgIGxpbmUtaGVpZ2h0OiAxLjQ7XFxuICAgIHBhZGRpbmc6IDAuMnJlbSAxcmVtIDAgMXJlbTtcXG4gICAgaGVpZ2h0OiAyLjhyZW07XFxuICAgIHRyYW5zaXRpb246IGFsbCAwLjJzO1xcbiAgICBib3gtc2hhZG93OiAwIDFweCAxcHggMCByZ2JhKDAsIDAsIDAsIDAuMDYpO1xcbiAgICBtaW4td2lkdGg6IDlyZW07XFxuICAgIHRleHQtYWxpZ246IGNlbnRlcjsgfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDQwLjYyNWVtKSB7XFxuICAgICAgLmhvbWVwYWdlX19saW5rIHtcXG4gICAgICAgIGFsaWduLXNlbGY6IGNlbnRlcjtcXG4gICAgICAgIHdpZHRoOiAxNC41cmVtOyB9IH1cXG4gICAgLmhvbWVwYWdlX19saW5rOmhvdmVyIHtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDkpOyB9XFxuXFxuLmludmVudG9yeS1kZXRhaWxzIHtcXG4gIGdyaWQtY29sdW1uOiAxIC8gLTE7XFxuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgcmdiYSg5OSwgNjgsIDE1MCwgMC4xKTtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmNmY0ZmE7XFxuICBjb2xvcjogIzUzNTM1MztcXG4gIHBhZGRpbmc6IDFyZW0gMTYlO1xcbiAgbWFyZ2luLWJvdHRvbTogMnJlbTtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47IH1cXG4gIC5pbnZlbnRvcnktZGV0YWlsc19fbGluayB7XFxuICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gICAgY29sb3I6IHJnYmEoODMsIDgzLCA4MywgMC43NSk7XFxuICAgIHRyYW5zaXRpb246IGFsbCAwLjJzO1xcbiAgICBwYWRkaW5nOiAwIDAuNnJlbTtcXG4gICAgYm9yZGVyLWxlZnQ6IDFweCBzb2xpZCAjNTM1MzUzO1xcbiAgICBib3JkZXItcmlnaHQ6IDFweCBzb2xpZCAjNTM1MzUzOyB9XFxuICAgIC5pbnZlbnRvcnktZGV0YWlsc19fbGluazpob3ZlciB7XFxuICAgICAgY29sb3I6ICM1MzUzNTM7IH1cXG4gIC5pbnZlbnRvcnktZGV0YWlscyBzcGFuIHtcXG4gICAgY29sb3I6ICMwMDY4ODU7IH1cXG5cXG4uaG9tZXBhZ2VfX2NvbGFnZSxcXG4uY2FyZHBhZ2VfX2NvbGFnZSB7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICBvdmVyZmxvdzogaGlkZGVuO1xcbiAgbGVmdDogMDtcXG4gIGhlaWdodDogMTVyZW07XFxuICB3aWR0aDogMTAwJTsgfVxcblxcbi5ob21lcGFnZV9fY29sYWdlIHtcXG4gIGJvdHRvbTogMDsgfVxcblxcbi5jYXJkcGFnZV9fY29sYWdlIHtcXG4gIGJvdHRvbTogLTIuNnJlbTsgfVxcbiAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA2Mi41ZW0pIHtcXG4gICAgLmNhcmRwYWdlX19jb2xhZ2Uge1xcbiAgICAgIGRpc3BsYXk6IG5vbmU7IH0gfVxcblxcbi5ob21lcGFnZV9fY29sYWdlLWlubmVyLFxcbi5jYXJkcGFnZV9fY29sYWdlLWlubmVyIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIGhlaWdodDogMTAwJTtcXG4gIG1hcmdpbi1sZWZ0OiA1MCU7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTUwJSk7XFxuICB3aWR0aDogNjUuNXJlbTsgfVxcblxcbi5ob21lcGFnZV9fY29sYWdlLWNhcmQsXFxuLmNhcmRwYWdlX19jb2xhZ2UtY2FyZCB7XFxuICB3aWR0aDogMTYuOHJlbTtcXG4gIGhlaWdodDogMjMuNHJlbTtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIGJvcmRlci1yYWRpdXM6IDUlIC8gMy43NSU7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMCk7XFxuICB0cmFuc2l0aW9uOiBhbGwgMC4zcztcXG4gIGJveC1zaGFkb3c6IGluc2V0IDAgMCAzcHggM3B4ICMwMDA7IH1cXG4gIC5ob21lcGFnZV9fY29sYWdlLWNhcmQ6bnRoLWNoaWxkKDEpLFxcbiAgLmNhcmRwYWdlX19jb2xhZ2UtY2FyZDpudGgtY2hpbGQoMSkge1xcbiAgICB0b3A6IDIuMnJlbTsgfVxcbiAgLmhvbWVwYWdlX19jb2xhZ2UtY2FyZDpudGgtY2hpbGQoMiksXFxuICAuY2FyZHBhZ2VfX2NvbGFnZS1jYXJkOm50aC1jaGlsZCgyKSB7XFxuICAgIHRvcDogNi4ycmVtO1xcbiAgICBsZWZ0OiAzLjVyZW07IH1cXG4gIC5ob21lcGFnZV9fY29sYWdlLWNhcmQ6bnRoLWNoaWxkKDMpLFxcbiAgLmNhcmRwYWdlX19jb2xhZ2UtY2FyZDpudGgtY2hpbGQoMykge1xcbiAgICB0b3A6IDFyZW07XFxuICAgIGxlZnQ6IDE3LjRyZW07IH1cXG4gIC5ob21lcGFnZV9fY29sYWdlLWNhcmQ6bnRoLWNoaWxkKDQpLFxcbiAgLmNhcmRwYWdlX19jb2xhZ2UtY2FyZDpudGgtY2hpbGQoNCkge1xcbiAgICB0b3A6IDQuNXJlbTtcXG4gICAgbGVmdDogMjAuNnJlbTsgfVxcbiAgLmhvbWVwYWdlX19jb2xhZ2UtY2FyZDpudGgtY2hpbGQoNSksXFxuICAuY2FyZHBhZ2VfX2NvbGFnZS1jYXJkOm50aC1jaGlsZCg1KSB7XFxuICAgIHRvcDogMS42cmVtO1xcbiAgICBsZWZ0OiAzNC43cmVtOyB9XFxuICAuaG9tZXBhZ2VfX2NvbGFnZS1jYXJkOm50aC1jaGlsZCg2KSxcXG4gIC5jYXJkcGFnZV9fY29sYWdlLWNhcmQ6bnRoLWNoaWxkKDYpIHtcXG4gICAgdG9wOiA2LjVyZW07XFxuICAgIGxlZnQ6IDM4cmVtOyB9XFxuICAuaG9tZXBhZ2VfX2NvbGFnZS1jYXJkOm50aC1jaGlsZCg3KSxcXG4gIC5jYXJkcGFnZV9fY29sYWdlLWNhcmQ6bnRoLWNoaWxkKDcpIHtcXG4gICAgdG9wOiAzLjVyZW07XFxuICAgIHJpZ2h0OiAwOyB9XFxuICAuaG9tZXBhZ2VfX2NvbGFnZS1jYXJkOmhvdmVyLFxcbiAgLmNhcmRwYWdlX19jb2xhZ2UtY2FyZDpob3ZlciB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtNSUpOyB9XFxuXFxuLmNvbnRhaW5lciB7XFxuICBkaXNwbGF5OiBncmlkO1xcbiAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiBbZnVsbC1zdGFydF0gbWlubWF4KDZyZW0sIDFmcikgW2NlbnRlci1zdGFydF0gcmVwZWF0KDgsIFtjb2wtc3RhcnRdIG1pbm1heChtaW4tY29udGVudCwgMTRyZW0pIFtjb2wtZW5kXSkgW2NlbnRlci1lbmRdIG1pbm1heCg2cmVtLCAxZnIpIFtmdWxsLWVuZF07XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjVmNmY3O1xcbiAgYmFja2dyb3VuZC1zaXplOiBjb3ZlcjtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcblxcbi5zZWFyY2gge1xcbiAgZ3JpZC1jb2x1bW46IGZ1bGwtc3RhcnQgLyBmdWxsLWVuZDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZmY7IH1cXG5cXG4uYXBpLXJlc3VsdHMtZGlzcGxheSB7XFxuICBncmlkLWNvbHVtbjogZnVsbC1zdGFydCAvIGZ1bGwtZW5kO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2Y1ZjZmNztcXG4gIGJhY2tncm91bmQtc2l6ZTogY292ZXI7XFxuICBkaXNwbGF5OiBncmlkOyB9XFxuXCIsIFwiXCIse1widmVyc2lvblwiOjMsXCJzb3VyY2VzXCI6W1wid2VicGFjazovLy4vc3JjL2Nzcy9zdHlsZS5jc3NcIl0sXCJuYW1lc1wiOltdLFwibWFwcGluZ3NcIjpcIkFBQUE7OztFQUdFLFNBQVM7RUFDVCxVQUFVO0VBQ1YsbUJBQW1CLEVBQUU7O0FBRXZCO0VBQ0UsZ0JBQWdCLEVBQUU7O0FBRXBCO0VBQ0Usc0JBQXNCO0VBQ3RCLGlCQUFpQjtFQUNqQixzQkFBc0I7RUFDdEIsNEJBQTRCO0VBQzVCLGdCQUFnQjtFQUNoQiwrQkFBK0I7RUFDL0Isa0JBQWtCLEVBQUU7O0FBRXRCO0VBQ0Usd0JBQXdCLEVBQUU7O0FBRTVCO0VBQ0UsaUJBQWlCO0VBQ2pCLHlCQUF5QixFQUFFO0VBQzNCO0lBQ0UsV0FBVyxFQUFFOztBQUVqQjtFQUNFLGVBQWU7RUFDZix5QkFBeUI7RUFDekIsZ0JBQWdCO0VBQ2hCLFdBQVcsRUFBRTs7QUFFZjtFQUNFLG1CQUFtQixFQUFFOztBQUV2QjtFQUNFLG1CQUFtQixFQUFFOztBQUV2QjtFQUNFLGdCQUFnQixFQUFFOztBQUVwQjtFQUNFLG9CQUFvQjtFQUNwQixvQkFBb0I7RUFDcEIseUJBQXlCO0VBQ3pCLGdCQUFnQjtFQUNoQixxQkFBcUIsRUFBRTs7QUFFekI7RUFDRSxhQUFhO0VBQ2IsMkJBQTJCO0VBQzNCLDRDQUE0QyxFQUFFOztBQUVoRDs7RUFFRSxnQ0FBZ0M7RUFDaEMsWUFBWTtFQUNaLHFEQUFxRDtFQUNyRCw0QkFBNEI7RUFDNUIsc0JBQXNCO0VBQ3RCLGFBQWE7RUFDYix1QkFBdUI7RUFDdkIsbUJBQW1CLEVBQUU7RUFDckI7O0lBRUUsa0JBQWtCO0lBQ2xCLG1CQUFtQjtJQUNuQixjQUFjO0lBQ2QsYUFBYTtJQUNiLFNBQVMsRUFBRTtFQUNiOztJQUVFLGtCQUFrQjtJQUNs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QUFjLEVBQUU7O0FBRXBCOztFQUVFLGtCQUFrQjtFQUNsQixnQkFBZ0I7RUFDaEIsT0FBTztFQUNQLGFBQWE7RUFDYixXQUFXLEVBQUU7O0FBRWY7RUFDRSxTQUFTLEVBQUU7O0FBRWI7RUFDRSxlQUFlLEVBQUU7RUFDakI7SUFDRTtNQUNFLGFBQWEsRUFBRSxFQUFFOztBQUV2Qjs7RUFFRSxrQkFBa0I7RUFDbEIsWUFBWTtFQUNaLGdCQUFnQjtFQUNoQiwyQkFBMkI7RUFDM0IsY0FBYyxFQUFFOztBQUVsQjs7RUFFRSxjQUFjO0VBQ2QsZUFBZTtFQUNmLGtCQUFrQjtFQUNsQix5QkFBeUI7RUFDekIsd0JBQXdCO0VBQ3hCLG9CQUFvQjtFQUNwQixrQ0FBa0MsRUFBRTtFQUNwQzs7SUFFRSxXQUFXLEVBQUU7RUFDZjs7SUFFRSxXQUFXO0lBQ1gsWUFBWSxFQUFFO0VBQ2hCOztJQUVFLFNBQVM7SUFDVCxhQUFhLEVBQUU7RUFDakI7O0lBRUUsV0FBVztJQUNYLGFBQWEsRUFBRTtFQUNqQjs7SUFFRSxXQUFXO0lBQ1gsYUFBYSxFQUFFO0VBQ2pCOztJQUVFLFdBQVc7SUFDWCxXQUFXLEVBQUU7RUFDZjs7SUFFRSxXQUFXO0lBQ1gsUUFBUSxFQUFFO0VBQ1o7O0lBRUUsMEJBQTBCLEVBQUU7O0FBRWhDO0VBQ0UsYUFBYTtFQUNiLDBLQUEwSztFQUMxSyx5QkFBeUI7RUFDekIsc0JBQXNCO0VBQ3RCLGtCQUFrQixFQUFFOztBQUV0QjtFQUNFLGtDQUFrQztFQUNsQyxzQkFBc0IsRUFBRTs7QUFFMUI7RUFDRSxrQ0FBa0M7RUFDbEMseUJBQXlCO0VBQ3pCLHNCQUFzQjtFQUN0QixhQUFhLEVBQUVcIixcInNvdXJjZXNDb250ZW50XCI6W1wiKixcXG4qOjphZnRlcixcXG4qOjpiZWZvcmUge1xcbiAgbWFyZ2luOiAwO1xcbiAgcGFkZGluZzogMDtcXG4gIGJveC1zaXppbmc6IGluaGVyaXQ7IH1cXG5cXG5odG1sIHtcXG4gIGZvbnQtc2l6ZTogNjIuNSU7IH1cXG5cXG5ib2R5IHtcXG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxuICBmb250LXNpemU6IDEuNnJlbTtcXG4gIGJhY2tncm91bmQtc2l6ZTogY292ZXI7XFxuICBiYWNrZ3JvdW5kLXJlcGVhdDogbm8tcmVwZWF0O1xcbiAgaGVpZ2h0OiAxMjcuNXJlbTtcXG4gIGZvbnQtZmFtaWx5OiAnTGF0bycsIHNhbnMtc2VyaWY7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7IH1cXG5cXG5baGlkZGVuXSB7XFxuICBkaXNwbGF5OiBub25lICFpbXBvcnRhbnQ7IH1cXG5cXG4uaGVhZGluZy10ZXJ0aWFyeSB7XFxuICBmb250LXNpemU6IDIuNHJlbTtcXG4gIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7IH1cXG4gIC5oZWFkaW5nLXRlcnRpYXJ5LS13aGl0ZSB7XFxuICAgIGNvbG9yOiAjZmZmOyB9XFxuXFxuLmhlYWRpbmctcHJpbWFyeSB7XFxuICBmb250LXNpemU6IDNyZW07XFxuICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xcbiAgZm9udC13ZWlnaHQ6IDMwMDtcXG4gIGNvbG9yOiAjZmZmOyB9XFxuXFxuLm1iLTEwIHtcXG4gIG1hcmdpbi1ib3R0b206IDFyZW07IH1cXG5cXG4ubWItMjAge1xcbiAgbWFyZ2luLWJvdHRvbTogMnJlbTsgfVxcblxcbi5tdC01MCB7XFxuICBtYXJnaW4tdG9wOiA1cmVtOyB9XFxuXFxuLmJ0biwgLmJ0bjpsaW5rLCAuYnRuOnZpc2l0ZWQge1xcbiAgcGFkZGluZzogLjc1cmVtIDJyZW07XFxuICBib3JkZXItcmFkaXVzOiAuNXJlbTtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmMmYyZjI7XFxuICBmb250LXdlaWdodDogNDAwO1xcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrOyB9XFxuXFxuLmJ0bjphY3RpdmUsIC5idG46Zm9jdXMge1xcbiAgb3V0bGluZTogbm9uZTtcXG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtMXB4KTtcXG4gIGJveC1zaGFkb3c6IDAgMC41cmVtIDFyZW0gcmdiYSgwLCAwLCAwLCAwLjIpOyB9XFxuXFxuLmxvZ2luLFxcbi5yZWdpc3RlciB7XFxuICBtaW4taGVpZ2h0OiBjYWxjKDEwMHZoIC0gNC4xcmVtKTtcXG4gIHdpZHRoOiAxMDB2dztcXG4gIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCh0byB0b3AsICM1ZjRmNjYsICMzNDIzMzIpO1xcbiAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcXG4gIGJhY2tncm91bmQtc2l6ZTogY292ZXI7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAubG9naW4taW1nLFxcbiAgLnJlZ2lzdGVyLWltZyB7XFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgYm9yZGVyLXJhZGl1czogMTAwJTtcXG4gICAgaGVpZ2h0OiA4LjVyZW07XFxuICAgIHdpZHRoOiA4LjVyZW07XFxuICAgIHRvcDogLTE1JTsgfVxcbiAgLmxvZ2luX19mb3JtLFxcbiAgLnJlZ2lzdGVyX19mb3JtIHtcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMWUyYTM4O1xcbiAgICBib3JkZXI6IDJweCBzb2xpZCAjMWUyYTM4O1xcbiAgICBib3gtc2hhZG93OiAwcHggMnB4IDVweCByZ2JhKDAsIDAsIDAsIDAuMjUpO1xcbiAgICBtYXgtd2lkdGg6IDMycmVtO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWZsb3c6IGNvbHVtbiBub3dyYXA7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIHBhZGRpbmc6IDRyZW0gMCAyLjZyZW0gMDtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC0yNSUpOyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNzVyZW0pIHtcXG4gICAgICAubG9naW5fX2Zvcm0sXFxuICAgICAgLnJlZ2lzdGVyX19mb3JtIHtcXG4gICAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTsgfSB9XFxuICAubG9naW5fX2Zvcm0taW5zdHJ1Y3Rpb25zLFxcbiAgLnJlZ2lzdGVyX19mb3JtLWluc3RydWN0aW9ucyB7XFxuICAgIGNvbG9yOiAjZmZmO1xcbiAgICBmb250LXNpemU6IDEuNHJlbTtcXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgICBtYXJnaW4tYm90dG9tOiAxcmVtO1xcbiAgICB3aWR0aDogOTAlOyB9XFxuICAubG9naW5fX2Zvcm0tZ3JvdXAsXFxuICAucmVnaXN0ZXJfX2Zvcm0tZ3JvdXAge1xcbiAgICB3aWR0aDogOTAlOyB9XFxuICAubG9naW5fX2Zvcm0taW5wdXQsXFxuICAucmVnaXN0ZXJfX2Zvcm0taW5wdXQge1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgbWFyZ2luOiAwIGF1dG87XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4yKTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAwLCAwLCAwLjEpO1xcbiAgICBib3gtc2hhZG93OiByZ2JhKDAsIDAsIDAsIDAuNSk7XFxuICAgIGJvcmRlci1yYWRpdXM6IDJweDtcXG4gICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcXG4gICAgbGluZS1oZWlnaHQ6IDEuMjU7XFxuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gICAgaGVpZ2h0OiA0LjJyZW07XFxuICAgIHBhZGRpbmc6IDFyZW0gMS40cmVtO1xcbiAgICBjYXJldC1jb2xvcjogI2ZmZjtcXG4gICAgY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC43NSk7IH1cXG4gICAgLmxvZ2luX19mb3JtLWlucHV0OjpwbGFjZWhvbGRlcixcXG4gICAgLnJlZ2lzdGVyX19mb3JtLWlucHV0OjpwbGFjZWhvbGRlciB7XFxuICAgICAgZm9udC13ZWlnaHQ6IDMwMDtcXG4gICAgICBjb2xvcjogI2U2ZTZlNjtcXG4gICAgICBmb250LXNpemU6IDEuOHJlbTsgfVxcbiAgICAubG9naW5fX2Zvcm0taW5wdXQ6Zm9jdXMsXFxuICAgIC5yZWdpc3Rlcl9fZm9ybS1pbnB1dDpmb2N1cyB7XFxuICAgICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjc1KTsgfVxcbiAgLmxvZ2luX19mb3JtLWJ0bixcXG4gIC5yZWdpc3Rlcl9fZm9ybS1idG4ge1xcbiAgICB3aWR0aDogOTAlO1xcbiAgICBib3JkZXItcmFkaXVzOiAycHg7XFxuICAgIHBhZGRpbmc6IDAgMS40cmVtO1xcbiAgICBtYXJnaW46IDFyZW0gYXV0byAwIGF1dG87XFxuICAgIGJveC1zaGFkb3c6IDAgMnB4IDVweCByZ2JhKDAsIDAsIDAsIDAuMjUpO1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYXJvdW5kO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBoZWlnaHQ6IDQuMnJlbTsgfVxcbiAgICAubG9naW5fX2Zvcm0tYnRuLS1sb2dpbixcXG4gICAgLnJlZ2lzdGVyX19mb3JtLWJ0bi0tbG9naW4ge1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC44Nyk7XFxuICAgICAgY29sb3I6ICMxNjE2MWQ7XFxuICAgICAgYm9yZGVyOiAxcHggc29saWQgI2ZmZjsgfVxcbiAgICAgIC5sb2dpbl9fZm9ybS1idG4tLWxvZ2luOmhvdmVyLFxcbiAgICAgIC5yZWdpc3Rlcl9fZm9ybS1idG4tLWxvZ2luOmhvdmVyIHtcXG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxuICAgICAgICBjb2xvcjogIzM0MjQ0MjsgfVxcbiAgICAgIC5sb2dpbl9fZm9ybS1idG4tLWxvZ2luOmhvdmVyIC5sb2dpbl9fZm9ybS1pY29uLXBhdGgtLWxvZ2luLFxcbiAgICAgIC5yZWdpc3Rlcl9fZm9ybS1idG4tLWxvZ2luOmhvdmVyIC5sb2dpbl9fZm9ybS1pY29uLXBhdGgtLWxvZ2luIHtcXG4gICAgICAgIGZpbGw6ICMzNDI0NDI7IH1cXG4gICAgICAubG9naW5fX2Zvcm0tYnRuLS1sb2dpbjo6YWZ0ZXIsXFxuICAgICAgLnJlZ2lzdGVyX19mb3JtLWJ0bi0tbG9naW46OmFmdGVyIHtcXG4gICAgICAgIG1hcmdpbi1ib3R0b206IDFweCBzb2xpZCB3aGl0ZTsgfVxcbiAgICAubG9naW5fX2Zvcm0tYnRuLS1yZWdpc3RlcixcXG4gICAgLnJlZ2lzdGVyX19mb3JtLWJ0bi0tcmVnaXN0ZXIge1xcbiAgICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSk7XFxuICAgICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjA1KTtcXG4gICAgICBjb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjc1KTsgfVxcbiAgICAgIC5sb2dpbl9fZm9ybS1idG4tLXJlZ2lzdGVyOmhvdmVyLFxcbiAgICAgIC5yZWdpc3Rlcl9fZm9ybS1idG4tLXJlZ2lzdGVyOmhvdmVyIHtcXG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4yNSk7XFxuICAgICAgICBjb2xvcjogI2ZmZjsgfVxcbiAgICAgIC5sb2dpbl9fZm9ybS1idG4tLXJlZ2lzdGVyOmhvdmVyIC5sb2dpbl9fZm9ybS1pY29uLXBhdGgtLWxvZ2luLFxcbiAgICAgIC5yZWdpc3Rlcl9fZm9ybS1idG4tLXJlZ2lzdGVyOmhvdmVyIC5sb2dpbl9fZm9ybS1pY29uLXBhdGgtLWxvZ2luIHtcXG4gICAgICAgIGZpbGw6ICNmZmY7IH1cXG4gICAgLmxvZ2luX19mb3JtLWJ0biBzcGFuLFxcbiAgICAucmVnaXN0ZXJfX2Zvcm0tYnRuIHNwYW4ge1xcbiAgICAgIG1hcmdpbi1yaWdodDogMXJlbTsgfVxcbiAgLmxvZ2luX19mb3JtLWljb24sXFxuICAucmVnaXN0ZXJfX2Zvcm0taWNvbiB7XFxuICAgIGhlaWdodDogMS41cmVtO1xcbiAgICB3aWR0aDogMS41cmVtO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMTclKTsgfVxcbiAgLmxvZ2luX19mb3JtLWljb24tcGF0aC0tbG9naW4sXFxuICAucmVnaXN0ZXJfX2Zvcm0taWNvbi1wYXRoLS1sb2dpbiB7XFxuICAgIGZpbGw6ICMxNjE2MWQ7IH1cXG4gIC5sb2dpbl9fZm9ybS1pY29uLXBhdGgtLXJlZ2lzdGVyLFxcbiAgLnJlZ2lzdGVyX19mb3JtLWljb24tcGF0aC0tcmVnaXN0ZXIge1xcbiAgICBmaWxsOiAjZmZmOyB9XFxuICAubG9naW5fX2Zvcm0taHIsXFxuICAucmVnaXN0ZXJfX2Zvcm0taHIge1xcbiAgICB3aWR0aDogOTAlO1xcbiAgICBtYXJnaW46IDJyZW0gMCAxcmVtIDA7XFxuICAgIG1hcmdpbi1ib3R0b206IDAuMjVweCBzb2xpZCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMjUpOyB9XFxuXFxuLm5hdiB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gIHBhZGRpbmc6IDFyZW0gMTYlO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogIzJiMjUzYTtcXG4gIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjMDAwOyB9XFxuICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDc1cmVtKSB7XFxuICAgIC5uYXYge1xcbiAgICAgIHBhZGRpbmc6IDEuMnJlbSAyLjUlOyB9IH1cXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNDMuNzVlbSkge1xcbiAgICAubmF2IHtcXG4gICAgICBwYWRkaW5nOiAxcmVtOyB9IH1cXG4gIC5uYXZfX2xlZnQge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4OiAwIDAgNTAlOyB9XFxuICAubmF2X19yaWdodCB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGJvcmRlci1yaWdodDogMXB4IHNvbGlkICNmZmY7XFxuICAgIGJvcmRlci1sZWZ0OiAxcHggc29saWQgI2ZmZjtcXG4gICAgcGFkZGluZy1sZWZ0OiAxcmVtO1xcbiAgICBtYXJnaW4tbGVmdDogYXV0bzsgfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDQwLjYyNWVtKSB7XFxuICAgICAgLm5hdl9fcmlnaHQge1xcbiAgICAgICAgZGlzcGxheTogbm9uZTsgfSB9XFxuICAgIC5uYXZfX3JpZ2h0ID4gKiB7XFxuICAgICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuICAubmF2X19pdGVtLS1zZWFyY2gge1xcbiAgICBmbGV4OiAwIDAgMjUlOyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNDAuNjI1ZW0pIHtcXG4gICAgICAubmF2X19pdGVtLS1zZWFyY2gge1xcbiAgICAgICAgZGlzcGxheTogbm9uZTsgfSB9XFxuICAubmF2X19pdGVtLS1ob21lIHtcXG4gICAgbWFyZ2luLXJpZ2h0OiAzcmVtOyB9XFxuICAubmF2X19saW5rIHtcXG4gICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgICBjb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjc1KTtcXG4gICAgdHJhbnNpdGlvbjogYWxsIDAuMnM7IH1cXG4gICAgLm5hdl9fbGluazpob3ZlciB7XFxuICAgICAgbWFyZ2luLWJvdHRvbTogMnB4O1xcbiAgICAgIGNvbG9yOiAjZmZmO1xcbiAgICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjZmZmOyB9XFxuICAgIC5uYXZfX2xpbmstLWhvbWU6aG92ZXIgLm5hdl9faWNvbi1wYXRoLS1ob21lIHtcXG4gICAgICBmaWxsOiAjZmZmOyB9XFxuICAubmF2X19zZWFyY2gge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuICAgIC5uYXZfX3NlYXJjaC1pbnB1dCB7XFxuICAgICAgYm9yZGVyOiBub25lO1xcbiAgICAgIHBhZGRpbmc6IDFyZW0gMnJlbTtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMmIyNTNhO1xcbiAgICAgIGNhcmV0LWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNzUpO1xcbiAgICAgIGNvbG9yOiAjZmZmOyB9XFxuICAgICAgLm5hdl9fc2VhcmNoLWlucHV0OjpwbGFjZWhvbGRlciB7XFxuICAgICAgICBjb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjc1KTsgfVxcbiAgICAgIC5uYXZfX3NlYXJjaC1pbnB1dDpmb2N1cyB7XFxuICAgICAgICBvdXRsaW5lOiBub25lOyB9XFxuICAgIC5uYXZfX3NlYXJjaC1idG4ge1xcbiAgICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgICAgbGVmdDogMnJlbTtcXG4gICAgICB0b3A6IDFyZW07IH1cXG4gICAgICAubmF2X19zZWFyY2gtYnRuOmhvdmVyIC5uYXZfX2ljb24tcGF0aC0tc2VhcmNoIHtcXG4gICAgICAgIGZpbGw6ICNmZmY7IH1cXG4gIC5uYXZfX2ljb24tc2l6aW5nLS1ob21lIHtcXG4gICAgd2lkdGg6IDNyZW07XFxuICAgIGhlaWdodDogM3JlbTsgfVxcbiAgLm5hdl9faWNvbi1zaXppbmctLXNlYXJjaCB7XFxuICAgIHdpZHRoOiAycmVtO1xcbiAgICBoZWlnaHQ6IDJyZW07XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtMTUwJSk7IH1cXG4gIC5uYXZfX2ljb24tcGF0aC0taG9tZSB7XFxuICAgIGZpbGw6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC43NSk7IH1cXG4gIC5uYXZfX2ljb24tcGF0aC0tc2VhcmNoIHtcXG4gICAgZmlsbDogI2JmYmZiZjsgfVxcbiAgLm5hdl9fbW9iaWxlIHtcXG4gICAgZGlzcGxheTogbm9uZTsgfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDQwLjYyNWVtKSB7XFxuICAgICAgLm5hdl9fbW9iaWxlIHtcXG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgICBmbGV4OiAwIDAgNTAlO1xcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfSB9XFxuICAgIC5uYXZfX21vYmlsZS1saW5rcyB7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzJiMjUzYTtcXG4gICAgICBmbGV4LWZsb3c6IHdyYXA7XFxuICAgICAgcGFkZGluZzogMXJlbSAwO1xcbiAgICAgIGp1c3RpZnktY29udGVudDogZmxleC1zdGFydDtcXG4gICAgICBkaXNwbGF5OiBub25lOyB9XFxuICAgIC5uYXZfX21vYmlsZS1saW5rIHtcXG4gICAgICBmbGV4OiAwIDAgNDglO1xcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoODUsIDI2LCAxMzksIDAuNSk7XFxuICAgICAgYm9yZGVyLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNik7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpO1xcbiAgICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgICBtYXJnaW4tdG9wOiAwLjZyZW07XFxuICAgICAgbWFyZ2luLWxlZnQ6IDElO1xcbiAgICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gICAgICBjb2xvcjogI2ZmZjtcXG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgICAgbGluZS1oZWlnaHQ6IDEuNDtcXG4gICAgICBwYWRkaW5nOiAwLjJyZW0gMXJlbSAwIDFyZW07XFxuICAgICAgaGVpZ2h0OiAyLjhyZW07XFxuICAgICAgdHJhbnNpdGlvbjogYWxsIDAuMnM7XFxuICAgICAgYm94LXNoYWRvdzogMCAxcHggMXB4IDAgcmdiYSgwLCAwLCAwLCAwLjA2KTtcXG4gICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICAgICAgdHJhbnNpdGlvbjogYWxsIDAuMnM7IH1cXG4gICAgICAubmF2X19tb2JpbGUtbGluazpob3ZlciB7XFxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMjUpOyB9XFxuICAgIC5uYXZfX21vYmlsZS1oYW1idXJnZXItd3JhcHBlciB7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICAgIG1hcmdpbi1yaWdodDogMXJlbTtcXG4gICAgICBoZWlnaHQ6IDNyZW07XFxuICAgICAgd2lkdGg6IDNyZW07XFxuICAgICAgbWFyZ2luLWxlZnQ6IGF1dG87IH1cXG4gICAgLm5hdl9fbW9iaWxlLWhhbWJ1cmdlciB7XFxuICAgICAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuICAgICAgLm5hdl9fbW9iaWxlLWhhbWJ1cmdlciwgLm5hdl9fbW9iaWxlLWhhbWJ1cmdlcjo6YmVmb3JlLCAubmF2X19tb2JpbGUtaGFtYnVyZ2VyOjphZnRlciB7XFxuICAgICAgICB3aWR0aDogM3JlbTtcXG4gICAgICAgIGhlaWdodDogMnB4O1xcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjc1KTtcXG4gICAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jazsgfVxcbiAgICAgIC5uYXZfX21vYmlsZS1oYW1idXJnZXI6OmJlZm9yZSwgLm5hdl9fbW9iaWxlLWhhbWJ1cmdlcjo6YWZ0ZXIge1xcbiAgICAgICAgY29udGVudDogJyc7XFxuICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgICAgICBsZWZ0OiAwOyB9XFxuICAgICAgLm5hdl9fbW9iaWxlLWhhbWJ1cmdlcjo6YmVmb3JlIHtcXG4gICAgICAgIG1hcmdpbi10b3A6IC0wLjhyZW07IH1cXG4gICAgICAubmF2X19tb2JpbGUtaGFtYnVyZ2VyOjphZnRlciB7XFxuICAgICAgICBtYXJnaW4tdG9wOiAwLjhyZW07IH1cXG5cXG4uZXJyb3Ige1xcbiAgbWFyZ2luLXRvcDogMnJlbTtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZjgwODA7XFxuICBib3JkZXItcmFkaXVzOiAxMHB4O1xcbiAgcGFkZGluZzogMnJlbTtcXG4gIGZvbnQtc2l6ZTogMnJlbTtcXG4gIGdyaWQtY29sdW1uOiBjZW50ZXItc3RhcnQgLyBjZW50ZXItZW5kO1xcbiAgZm9udC13ZWlnaHQ6IDcwMDsgfVxcblxcbi5zZWFyY2gtZm9ybSB7XFxuICBwYWRkaW5nOiAycmVtIDI1cmVtO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2ZkZmRmZDtcXG4gIG1pbi1oZWlnaHQ6IGNhbGMoMTAwdmggLSA2LjJyZW0pOyB9XFxuICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDgxLjI1ZW0pIHtcXG4gICAgLnNlYXJjaC1mb3JtIHtcXG4gICAgICBwYWRkaW5nOiAycmVtIDE1cmVtOyB9IH1cXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNjIuNWVtKSB7XFxuICAgIC5zZWFyY2gtZm9ybSB7XFxuICAgICAgcGFkZGluZzogMnJlbSA1cmVtOyB9IH1cXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNTYuMjVlbSkge1xcbiAgICAuc2VhcmNoLWZvcm0ge1xcbiAgICAgIHBhZGRpbmc6IDJyZW0gMXJlbTsgfSB9XFxuICAuc2VhcmNoLWZvcm1fX2dyb3VwIHtcXG4gICAgd2lkdGg6IDc1JTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgbWFyZ2luLWJvdHRvbTogM3JlbTtcXG4gICAgYWxpZ24taXRlbXM6IGZsZXgtc3RhcnQ7XFxuICAgIHBhZGRpbmc6IDAuNXJlbSA0cmVtIDAuNXJlbSAwO1xcbiAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgcmdiYSgwLCAwLCAwLCAwLjIpOyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogOTMuNzVlbSkge1xcbiAgICAgIC5zZWFyY2gtZm9ybV9fZ3JvdXAge1xcbiAgICAgICAgd2lkdGg6IDEwMCU7IH0gfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDQ2Ljg3NWVtKSB7XFxuICAgICAgLnNlYXJjaC1mb3JtX19ncm91cCB7XFxuICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9IH1cXG4gICAgLnNlYXJjaC1mb3JtX19ncm91cDpudGgtY2hpbGQoMTApIHtcXG4gICAgICBib3JkZXItYm90dG9tOiBub25lOyB9XFxuICAgIC5zZWFyY2gtZm9ybV9fZ3JvdXAtLW5vLWJvcmRlciB7XFxuICAgICAgYm9yZGVyLWJvdHRvbTogbm9uZTsgfVxcbiAgLnNlYXJjaC1mb3JtX19sYWJlbCB7XFxuICAgIGZsZXg6IDAgMCAyMCU7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBmbGV4LXN0YXJ0O1xcbiAgICBmb250LXdlaWdodDogMzAwO1xcbiAgICBtYXJnaW4tdG9wOiAwLjdyZW07XFxuICAgIGNvbG9yOiAjNTUxYThiOyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNDYuODc1ZW0pIHtcXG4gICAgICAuc2VhcmNoLWZvcm1fX2xhYmVsIHtcXG4gICAgICAgIG1hcmdpbi1ib3R0b206IDEuMnJlbTtcXG4gICAgICAgIG1hcmdpbi1sZWZ0OiAxcmVtOyB9IH1cXG4gIC5zZWFyY2gtZm9ybV9fZ3JvdXAtaW5wdXQtd3JhcHBlciB7XFxuICAgIGZsZXg6IDAgMCA4MCU7IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA0Ni44NzVlbSkge1xcbiAgICAgIC5zZWFyY2gtZm9ybV9fZ3JvdXAtaW5wdXQtd3JhcHBlciB7XFxuICAgICAgICBmbGV4OiAwIDAgMTAwJTtcXG4gICAgICAgIHdpZHRoOiAxMDAlOyB9IH1cXG4gIC5zZWFyY2gtZm9ybV9faW5wdXQtd3JhcHBlciB7XFxuICAgIGZsZXg6IDAgMCA4MCU7IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA0Ni44NzVlbSkge1xcbiAgICAgIC5zZWFyY2gtZm9ybV9faW5wdXQtd3JhcHBlciB7XFxuICAgICAgICBmbGV4OiAwIDAgMTAwJTtcXG4gICAgICAgIHdpZHRoOiAxMDAlOyB9IH1cXG4gIC5zZWFyY2gtZm9ybV9fdGlwIHtcXG4gICAgZm9udC1zaXplOiAxcmVtO1xcbiAgICBsaW5lLWhlaWdodDogMS40O1xcbiAgICB3aWR0aDogNzAlOyB9XFxuICAuc2VhcmNoLWZvcm1fX2lucHV0LXRleHQge1xcbiAgICB3aWR0aDogNDByZW07XFxuICAgIGhlaWdodDogNHJlbTtcXG4gICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcXG4gICAgcGFkZGluZzogMXJlbTtcXG4gICAgYm9yZGVyOiBzb2xpZCAxcHggI2JmYmZiZjtcXG4gICAgYm9yZGVyLXJhZGl1czogNXB4OyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogMjguMTI1ZW0pIHtcXG4gICAgICAuc2VhcmNoLWZvcm1fX2lucHV0LXRleHQge1xcbiAgICAgICAgd2lkdGg6IDMwcmVtOyB9IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiAyMS44NzVlbSkge1xcbiAgICAgIC5zZWFyY2gtZm9ybV9faW5wdXQtdGV4dCB7XFxuICAgICAgICB3aWR0aDogMjByZW07IH0gfVxcbiAgICAuc2VhcmNoLWZvcm1fX2lucHV0LXRleHQ6Zm9jdXMge1xcbiAgICAgIGJvcmRlcjogc29saWQgMXB4ICMwMDA7IH1cXG4gIC5zZWFyY2gtZm9ybV9faW5wdXQtaW50ZWdlciB7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkICNhZWFlYWU7XFxuICAgIGhlaWdodDogMy41cmVtO1xcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XFxuICAgIHBhZGRpbmctbGVmdDogMC41cmVtO1xcbiAgICBwYWRkaW5nLXJpZ2h0OiAwLjVyZW07XFxuICAgIGJveC1zaGFkb3c6IDAgMXB4IDFweCAwIHJnYmEoMCwgMCwgMCwgMC4wNik7IH1cXG4gICAgLnNlYXJjaC1mb3JtX19pbnB1dC1pbnRlZ2VyLS1yZWxhdGl2ZSB7XFxuICAgICAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogMzcuNWVtKSB7XFxuICAgICAgLnNlYXJjaC1mb3JtX19pbnB1dC1pbnRlZ2VyIHtcXG4gICAgICAgIG1heC13aWR0aDogMzAlOyB9IH1cXG4gIC5zZWFyY2gtZm9ybV9fZ3JvdXAtLWNoZWNrYm94IHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgbWFyZ2luLWJvdHRvbTogMXJlbTsgfVxcbiAgLnNlYXJjaC1mb3JtX19ncm91cC1jb2xvcnMtbGVmdCwgLnNlYXJjaC1mb3JtX19ncm91cC1jb2xvcnMtcmlnaHQge1xcbiAgICBkaXNwbGF5OiBmbGV4OyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogODEuMjVlbSkge1xcbiAgICAgIC5zZWFyY2gtZm9ybV9fZ3JvdXAtY29sb3JzLWxlZnQsIC5zZWFyY2gtZm9ybV9fZ3JvdXAtY29sb3JzLXJpZ2h0IHtcXG4gICAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH0gfVxcbiAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA4MS4yNWVtKSB7XFxuICAgIC5zZWFyY2gtZm9ybV9fZ3JvdXAtY29sb3JzLWxlZnQge1xcbiAgICAgIG1hcmdpbi1yaWdodDogM3JlbTsgfSB9XFxuICAuc2VhcmNoLWZvcm1fX2dyb3VwLXJhcml0eS1sZWZ0LCAuc2VhcmNoLWZvcm1fX2dyb3VwLXJhcml0eS1yaWdodCB7XFxuICAgIGRpc3BsYXk6IGZsZXg7IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiAzNy41ZW0pIHtcXG4gICAgICAuc2VhcmNoLWZvcm1fX2dyb3VwLXJhcml0eS1sZWZ0LCAuc2VhcmNoLWZvcm1fX2dyb3VwLXJhcml0eS1yaWdodCB7XFxuICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9IH1cXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogODEuMjVlbSkge1xcbiAgICAuc2VhcmNoLWZvcm1fX2dyb3VwLXJhcml0eS1sZWZ0IHtcXG4gICAgICBtYXJnaW4tcmlnaHQ6IDNyZW07IH0gfVxcbiAgLnNlYXJjaC1mb3JtX19sYWJlbC0tY2hlY2tib3gge1xcbiAgICBtYXJnaW4tcmlnaHQ6IDFyZW07IH1cXG4gIC5zZWFyY2gtZm9ybV9faW5wdXQtY2hlY2tib3gge1xcbiAgICB3aWR0aDogMi4yNXJlbTtcXG4gICAgaGVpZ2h0OiAyLjI1cmVtO1xcbiAgICBtYXJnaW4tcmlnaHQ6IDAuOHJlbTsgfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDkzLjc1ZW0pIHtcXG4gICAgICAuc2VhcmNoLWZvcm1fX2lucHV0LWNoZWNrYm94IHtcXG4gICAgICAgIG1hcmdpbi1ib3R0b206IDAuM3JlbTsgfSB9XFxuICAuc2VhcmNoLWZvcm1fX2NoZWNrYm94LXdyYXBwZXIge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAuc2VhcmNoLWZvcm1fX3NlbGVjdC1tZW51IHtcXG4gICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcXG4gICAgY29sb3I6ICMzNDMyNDI7XFxuICAgIG1hcmdpbi1yaWdodDogMXJlbTtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgI2FlYWVhZTtcXG4gICAgYm9yZGVyLXJhZGl1czogM3B4O1xcbiAgICBib3gtc2hhZG93OiAwIDFweCAxcHggMCByZ2JhKDAsIDAsIDAsIDAuMDYpO1xcbiAgICBwYWRkaW5nOiAwIDIuMnJlbSAwIDAuNXJlbTtcXG4gICAgaGVpZ2h0OiAzLjRyZW07XFxuICAgIGZvbnQtc2l6ZTogMS40cmVtO1xcbiAgICB0ZXh0LWluZGVudDogMDtcXG4gICAgLXdlYmtpdC1hcHBlYXJhbmNlOiBub25lO1xcbiAgICAtbW96LWFwcGVhcmFuY2U6IG5vbmU7XFxuICAgIHRleHQtb3ZlcmZsb3c6ICcnO1xcbiAgICBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoLi4vLi4vYXBwL3N0YXRpYy9pbWcvU1ZHL2Fycm93LWRvd24yLnN2Zyk7XFxuICAgIGJhY2tncm91bmQtcmVwZWF0OiBuby1yZXBlYXQ7XFxuICAgIGJhY2tncm91bmQtcG9zaXRpb246IHJpZ2h0IDAuOHJlbSBjZW50ZXI7XFxuICAgIGJhY2tncm91bmQtc2l6ZTogMS4ycmVtIDFyZW07XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmZmY7IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA4MS4yNWVtKSB7XFxuICAgICAgLnNlYXJjaC1mb3JtX19zZWxlY3QtbWVudSB7XFxuICAgICAgICBtYXJnaW4tcmlnaHQ6IDAuM3JlbTsgfSB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogMzcuNWVtKSB7XFxuICAgICAgLnNlYXJjaC1mb3JtX19zZWxlY3QtbWVudS0tMiB7XFxuICAgICAgICBtYXgtd2lkdGg6IDQ5JTsgfSB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogMzcuNWVtKSB7XFxuICAgICAgLnNlYXJjaC1mb3JtX19zZWxlY3QtbWVudS0tMyB7XFxuICAgICAgICBtYXgtd2lkdGg6IDMyJTsgfSB9XFxuICAuc2VhcmNoLWZvcm1fX3N2Zy1zaXplIHtcXG4gICAgaGVpZ2h0OiAycmVtO1xcbiAgICB3aWR0aDogMnJlbTtcXG4gICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX3N2Zy1jb2xvciB7XFxuICAgIGZpbGw6ICM1NTFhOGI7IH1cXG4gIC5zZWFyY2gtZm9ybV9fc3VibWl0LXdyYXBwZXIge1xcbiAgICBwb3NpdGlvbjogc3RpY2t5O1xcbiAgICBib3R0b206IDA7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBtYXJnaW4tYm90dG9tOiAzcmVtO1xcbiAgICBib3JkZXItdG9wOiAxcHggc29saWQgcmdiYSgwLCAwLCAwLCAwLjIpO1xcbiAgICBhbGlnbi1pdGVtczogZmxleC1zdGFydDtcXG4gICAgcGFkZGluZzogMS41cmVtIDRyZW0gMS41cmVtIDA7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmZGZkZmQ7XFxuICAgIHotaW5kZXg6IDE7IH1cXG4gIC5zZWFyY2gtZm9ybV9fc3VibWl0IHtcXG4gICAgYm9yZGVyLXJhZGl1czogM3B4O1xcbiAgICBwYWRkaW5nOiAwLjdyZW07XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmOWY3ZjU7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoODUsIDI2LCAxMzksIDAuNSk7XFxuICAgIGNvbG9yOiAjNTUxYThiO1xcbiAgICBmb250LXdlaWdodDogNTAwO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgMC4ycztcXG4gICAgbWFyZ2luLWxlZnQ6IDIwJTsgfVxcbiAgICAuc2VhcmNoLWZvcm1fX3N1Ym1pdDpob3ZlciB7XFxuICAgICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmZmY7IH1cXG4gIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tc3BhbiB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH1cXG4gIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMsIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtc2V0cyB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICAgIGxpc3Qtc3R5bGU6IG5vbmU7XFxuICAgIG1hcmdpbi1ib3R0b206IDAuM3JlbTsgfVxcbiAgLnNlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy1saXN0LWl0ZW0sIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtc2V0cy1saXN0LWl0ZW0ge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBtYXJnaW4tYm90dG9tOiAwLjdyZW07IH1cXG4gIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtcmVtb3ZlLWJ0biwgLnNlYXJjaC1mb3JtX19zZWxlY3RlZC1zZXRzLXJlbW92ZS1idG4ge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICBoZWlnaHQ6IDJyZW07XFxuICAgIHdpZHRoOiAycmVtO1xcbiAgICBmb250LXNpemU6IDEuM3JlbTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2YyZjJmMjtcXG4gICAgbWFyZ2luLXJpZ2h0OiAwLjdyZW07IH1cXG4gIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlciB7XFxuICAgIGhlaWdodDogMnJlbTtcXG4gICAgd2lkdGg6IDIuNzVyZW07XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgIGZvbnQtc2l6ZTogMS4zcmVtO1xcbiAgICBtYXJnaW4tcmlnaHQ6IDAuN3JlbTsgfVxcbiAgICAuc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLXRvZ2dsZXItLWlzIHtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDdkMTQ3OyB9XFxuICAgIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlci0tbm90IHtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmYwMDAwOyB9XFxuICAuc2VhcmNoLWZvcm1fX2Ryb3Bkb3duIHtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICBtYXgtaGVpZ2h0OiAyOHJlbTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gICAgei1pbmRleDogMjtcXG4gICAgdG9wOiAxMDAlO1xcbiAgICB3aWR0aDogNDByZW07XFxuICAgIG1hcmdpbi10b3A6IC0xcmVtO1xcbiAgICBvdmVyZmxvdy15OiBhdXRvO1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCAjMDAwOyB9XFxuICAgIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdCB7XFxuICAgICAgbGlzdC1zdHlsZTogbm9uZTsgfVxcbiAgICAgIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1jYXRlZ29yeSB7XFxuICAgICAgICBwYWRkaW5nOiAwLjVyZW07IH1cXG4gICAgICAuc2VhcmNoLWZvcm1fX2Ryb3Bkb3duLWxpc3Qtb3B0aW9uIHtcXG4gICAgICAgIHBhZGRpbmc6IDAuM3JlbSAycmVtO1xcbiAgICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cXG4gICAgICAgIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1vcHRpb246aG92ZXIge1xcbiAgICAgICAgICBjdXJzb3I6IHBvaW50ZXI7IH1cXG4gICAgICAgIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1vcHRpb24tLWhpZ2hsaWdodGVkIHtcXG4gICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2NjZDhmZjsgfVxcbiAgICAgICAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0LW9wdGlvbiBzcGFuIHtcXG4gICAgICAgICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcXG4gICAgICAgICAgbWFyZ2luLWxlZnQ6IDFyZW07IH1cXG4gICAgICAuc2VhcmNoLWZvcm1fX2Ryb3Bkb3duLWxpc3QtaW1nIHtcXG4gICAgICAgIHdpZHRoOiAycmVtO1xcbiAgICAgICAgaGVpZ2h0OiAycmVtO1xcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAwLjdyZW07IH1cXG5cXG4uZHJvcGRvd24td3JhcHBlciB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7IH1cXG5cXG4uaW52LXNlYXJjaC1wcmljZS1tc2cge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgYm90dG9tOiAwO1xcbiAgcmlnaHQ6IDA7XFxuICBjb2xvcjogcmVkOyB9XFxuXFxuLnJlbGF0aXZlIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcblxcbi5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2YzZjVmODtcXG4gIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCByZ2JhKDk5LCA2OCwgMTUwLCAwLjEpO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgcGFkZGluZzogMS4ycmVtIDE2JTtcXG4gIG1hcmdpbi1ib3R0b206IDAuMXJlbTtcXG4gIGhlaWdodDogNS4ycmVtOyB9XFxuICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDc1cmVtKSB7XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYge1xcbiAgICAgIHBhZGRpbmc6IDEuMnJlbSAyLjUlOyB9IH1cXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNTMuMTI1ZW0pIHtcXG4gICAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdiB7XFxuICAgICAgZGlzcGxheTogbm9uZTsgfSB9XFxuICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXNlbGVjdCB7XFxuICAgIGNvbG9yOiAjYjMwMGIzO1xcbiAgICBtYXJnaW4tcmlnaHQ6IDFyZW07XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoODUsIDI2LCAxMzksIDAuNSk7XFxuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgYm94LXNoYWRvdzogMCAxcHggMXB4IDAgcmdiYSgwLCAwLCAwLCAwLjA2KTtcXG4gICAgcGFkZGluZzogMC4xcmVtIDIuMnJlbSAwIDAuNXJlbTtcXG4gICAgY29sb3I6ICM1NTFhOGI7XFxuICAgIGhlaWdodDogMi44cmVtO1xcbiAgICBmb250LXNpemU6IDEuNHJlbTtcXG4gICAgdGV4dC1pbmRlbnQ6IDA7XFxuICAgIC13ZWJraXQtYXBwZWFyYW5jZTogbm9uZTtcXG4gICAgLW1vei1hcHBlYXJhbmNlOiBub25lO1xcbiAgICB0ZXh0LW92ZXJmbG93OiAnJztcXG4gICAgYmFja2dyb3VuZC1pbWFnZTogdXJsKC4uLy4uL2FwcC9zdGF0aWMvaW1nL1NWRy9hcnJvdy1kb3duMi5zdmcpO1xcbiAgICBiYWNrZ3JvdW5kLXJlcGVhdDogbm8tcmVwZWF0O1xcbiAgICBiYWNrZ3JvdW5kLXBvc2l0aW9uOiByaWdodCAwLjhyZW0gY2VudGVyO1xcbiAgICBiYWNrZ3JvdW5kLXNpemU6IDEuMnJlbSAxcmVtOyB9XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtc2VsZWN0OmhvdmVyIHtcXG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjsgfVxcbiAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1sYWJlbCB7XFxuICAgIGNvbG9yOiAjNTUxYThiOyB9XFxuICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LWJ0biB7XFxuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2Y5ZjdmNTtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSg4NSwgMjYsIDEzOSwgMC41KTtcXG4gICAgY29sb3I6ICM1NTFhOGI7XFxuICAgIGZvbnQtd2VpZ2h0OiA1MDA7XFxuICAgIHRyYW5zaXRpb246IGFsbCAwLjJzO1xcbiAgICBoZWlnaHQ6IDIuOHJlbTtcXG4gICAgcGFkZGluZzogMC4xcmVtIDAuN3JlbSAwIDAuN3JlbTtcXG4gICAgZm9udC1zaXplOiAxLjRyZW07XFxuICAgIG1hcmdpbjogYXV0byAwO1xcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICAgIGJveC1zaGFkb3c6IDAgMXB4IDFweCAwIHJnYmEoMCwgMCwgMCwgMC4wNik7IH1cXG4gICAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1idG46aG92ZXIge1xcbiAgICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmOyB9XFxuICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXJpZ2h0IHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfVxcbiAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1wYWdpbmF0aW9uLWNvbnRhaW5lciB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmOWY3ZjU7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoODUsIDI2LCAxMzksIDAuNSk7XFxuICAgIGNvbG9yOiAjNTUxYThiO1xcbiAgICBwYWRkaW5nOiAwLjJyZW0gMC43cmVtO1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgIGhlaWdodDogMi44cmVtO1xcbiAgICBib3gtc2hhZG93OiAwIDFweCAxcHggMCByZ2JhKDAsIDAsIDAsIDAuMDYpOyB9XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtcGFnaW5hdGlvbi1jb250YWluZXI6bm90KDpsYXN0LWNoaWxkKSB7XFxuICAgICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtcGFnaW5hdGlvbi1jb250YWluZXI6bnRoLWNoaWxkKDIpIHN2ZyB7XFxuICAgICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtcGFnaW5hdGlvbi1jb250YWluZXI6bnRoLWNoaWxkKDMpIHN2ZyB7XFxuICAgICAgbWFyZ2luLWxlZnQ6IDFyZW07IH1cXG4gICAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1wYWdpbmF0aW9uLWNvbnRhaW5lci0tZGlzYWJsZWQge1xcbiAgICAgIGN1cnNvcjogbm90LWFsbG93ZWQ7XFxuICAgICAgY29sb3I6IHJnYmEoMCwgMCwgMCwgMC4yNSk7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2Y1ZjZmNzsgfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDMxLjVlbSkge1xcbiAgICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtcGFnaW5hdGlvbi1jb250YWluZXIge1xcbiAgICAgICAgbWFyZ2luOiAwOyB9IH1cXG4gIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtc3ZnLXNpemUge1xcbiAgICBoZWlnaHQ6IDJyZW07XFxuICAgIHdpZHRoOiAycmVtOyB9XFxuICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXN2Zy1jb2xvciB7XFxuICAgIGZpbGw6ICM1NTFhOGI7IH1cXG5cXG4uYXBpLXJlc3VsdHMtZGlzcGxheV9fZGlzcGxheS1iYXIge1xcbiAgd2lkdGg6IDEwMCU7XFxuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgcmdiYSg5OSwgNjgsIDE1MCwgMC4xKTtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmNmY0ZmE7XFxuICBjb2xvcjogIzUzNTM1MztcXG4gIHBhZGRpbmctbGVmdDogMTYlO1xcbiAgbWFyZ2luLWJvdHRvbTogMnJlbTtcXG4gIGhlaWdodDogMi4xcmVtOyB9XFxuICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDc1cmVtKSB7XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19kaXNwbGF5LWJhciB7XFxuICAgICAgcGFkZGluZy1sZWZ0OiAyLjUlOyB9IH1cXG5cXG4uYXBpLXJlc3VsdHMtZGlzcGxheV9fbW9iaWxlIHtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmM2Y1Zjg7XFxuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgcmdiYSg5OSwgNjgsIDE1MCwgMC4xKTtcXG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcXG4gIG1hcmdpbi1ib3R0b206IDAuMXJlbTtcXG4gIGhlaWdodDogNS4ycmVtO1xcbiAgZGlzcGxheTogbm9uZTsgfVxcbiAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA1My4xMjVlbSkge1xcbiAgICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbW9iaWxlIHtcXG4gICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgIHBhZGRpbmc6IDEuMnJlbSAyLjUlOyB9IH1cXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogMzEuNWVtKSB7XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19tb2JpbGUge1xcbiAgICAgIHBhZGRpbmc6IDEuMnJlbTsgfSB9XFxuICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbW9iaWxlLXN2Zy1zaXplIHtcXG4gICAgd2lkdGg6IDEuNHJlbTtcXG4gICAgaGVpZ2h0OiAxLjRyZW07IH1cXG5cXG4uYXBpLXJlc3VsdHMtZGlzcGxheV9fbW9iaWxlLWRpc3BsYXktb3B0aW9ucyB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjNmNWY4O1xcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHJnYmEoOTksIDY4LCAxNTAsIDAuMSk7XFxuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgYWxpZ24taXRlbXM6IGZsZXgtc3RhcnQ7XFxuICBwYWRkaW5nOiAxLjJyZW0gMDtcXG4gIGRpc3BsYXk6IG5vbmU7IH1cXG5cXG4uYXBpLXJlc3VsdHMtZGlzcGxheV9fbW9iaWxlLWRpc3BsYXktb3B0aW9ucy1ncm91cCB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgd2lkdGg6IDQ1JTtcXG4gIG1hcmdpbjogMCBhdXRvIDFyZW0gYXV0bzsgfVxcbiAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA1MS41NjI1ZW0pIHtcXG4gICAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX21vYmlsZS1kaXNwbGF5LW9wdGlvbnMtZ3JvdXAge1xcbiAgICAgIHdpZHRoOiA2MCU7IH0gfVxcbiAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiAzNy41ZW0pIHtcXG4gICAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX21vYmlsZS1kaXNwbGF5LW9wdGlvbnMtZ3JvdXAge1xcbiAgICAgIHdpZHRoOiA4MCU7IH0gfVxcbiAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiAyOC4xMjVlbSkge1xcbiAgICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbW9iaWxlLWRpc3BsYXktb3B0aW9ucy1ncm91cCB7XFxuICAgICAgd2lkdGg6IDk1JTsgfSB9XFxuICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbW9iaWxlLWRpc3BsYXktb3B0aW9ucy1ncm91cCBsYWJlbCB7XFxuICAgIG1hcmdpbi1yaWdodDogMXJlbTsgfVxcblxcbi5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtc2VsZWN0LS1tb2JpbGUge1xcbiAgd2lkdGg6IDI0cmVtOyB9XFxuICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDIxLjg3NWVtKSB7XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtc2VsZWN0LS1tb2JpbGUge1xcbiAgICAgIHdpZHRoOiAxNnJlbTsgfSB9XFxuXFxuLmFwaS1yZXN1bHRzLW1vYmlsZS1kaXNwbGF5LWJ0biB7XFxuICBhbGlnbi1zZWxmOiBjZW50ZXI7IH1cXG5cXG4ud3JhcHBlciB7XFxuICBvdmVyZmxvdy14OiBzY3JvbGw7XFxuICBvdmVyZmxvdy15OiBoaWRkZW47XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgbWFyZ2luOiAwIGF1dG87XFxuICB3aWR0aDogNjglOyB9XFxuICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDc1cmVtKSB7XFxuICAgIC53cmFwcGVyIHtcXG4gICAgICB3aWR0aDogOTAlOyB9IH1cXG5cXG4uY2FyZC1jaGVja2xpc3Qge1xcbiAgd2lkdGg6IDEwMCU7XFxuICBqdXN0aWZ5LXNlbGY6IGNlbnRlcjsgfVxcbiAgLmNhcmQtY2hlY2tsaXN0X19yb3cge1xcbiAgICBkaXNwbGF5OiBncmlkO1xcbiAgICBoZWlnaHQ6IDNyZW07IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19yb3ctLTcge1xcbiAgICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogMTAlIDIyLjUlIDEwJSAxNy41JSAxNSUgMTUlIDEwJTsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX3Jvdy0tOSB7XFxuICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoOSwgMWZyKTsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX3Jvdy0taGVhZGVyIHtcXG4gICAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgIzAwMDtcXG4gICAgICBjb2xvcjogIzUzMWE4YjtcXG4gICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xcbiAgICAgIGZvbnQtc2l6ZTogMS4ycmVtICFpbXBvcnRhbnQ7XFxuICAgICAgZm9udC13ZWlnaHQ6IDIwMCAhaW1wb3J0YW50OyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fcm93LS1ncmV5IHtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjJmMmYyOyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fcm93Om50aC1jaGlsZChldmVuKSB7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2YyZjJmMjsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX3Jvdy0taGVhZGVyIHtcXG4gICAgICBoZWlnaHQ6IDMuNXJlbTsgfVxcbiAgLmNhcmQtY2hlY2tsaXN0X19kYXRhIHtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtd3JhcDogbm93cmFwO1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtc3RhcnQ7XFxuICAgIGZvbnQtc2l6ZTogMS40cmVtOyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fZGF0YS0tc2V0IHtcXG4gICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xcbiAgICAgIHBhZGRpbmctbGVmdDogMC41cmVtOyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fZGF0YS0tbmFtZSB7XFxuICAgICAganVzdGlmeS1jb250ZW50OiBmbGV4LXN0YXJ0OyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fZGF0YS0tcmFyaXR5IHtcXG4gICAgICB0ZXh0LXRyYW5zZm9ybTogY2FwaXRhbGl6ZTsgfVxcbiAgLmNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmsge1xcbiAgICBwYWRkaW5nOiAxcmVtIDA7XFxuICAgIGRpc3BsYXk6IGJsb2NrO1xcbiAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBjb2xvcjogIzAwMDtcXG4gICAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcXG4gICAgb3ZlcmZsb3c6IGhpZGRlbjtcXG4gICAgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmstLXByaWNlIHtcXG4gICAgICBjb2xvcjogIzAwNjg4NTsgfVxcblxcbi50b29sdGlwIHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHotaW5kZXg6IDU7XFxuICB3aWR0aDogMjRyZW07XFxuICBoZWlnaHQ6IDM0cmVtOyB9XFxuICAudG9vbHRpcF9faW1nIHtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGhlaWdodDogMTAwJTsgfVxcblxcbi5uZWdhdGl2ZS1lYXJuaW5ncyB7XFxuICBjb2xvcjogcmVkOyB9XFxuXFxuLnBvc2l0aXZlLWVhcm5pbmdzIHtcXG4gIGNvbG9yOiBncmVlbjsgfVxcblxcbi5pbWFnZS1ncmlkIHtcXG4gIHBhZGRpbmc6IDdyZW0gMTYlO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcXG4gIGZsZXgtd3JhcDogd3JhcDsgfVxcbiAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA3NXJlbSkge1xcbiAgICAuaW1hZ2UtZ3JpZCB7XFxuICAgICAgcGFkZGluZzogNHJlbSAyLjUlOyB9IH1cXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNjIuNWVtKSB7XFxuICAgIC5pbWFnZS1ncmlkIHtcXG4gICAgICBncmlkLWNvbHVtbi1nYXA6IDFyZW07IH0gfVxcbiAgLmltYWdlLWdyaWRfX291dGVyLWRpdiB7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gICAgaGVpZ2h0OiAxMDAlOyB9XFxuICAuaW1hZ2UtZ3JpZF9faW5uZXItZGl2IHtcXG4gICAgcGVyc3BlY3RpdmU6IDE1MHJlbTtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGhlaWdodDogMTAwJTsgfVxcbiAgLmltYWdlLWdyaWRfX2RvdWJsZSB7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBoZWlnaHQ6IDEwMCU7XFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgdG9wOiAwO1xcbiAgICBsZWZ0OiAwO1xcbiAgICBiYWNrZmFjZS12aXNpYmlsaXR5OiBoaWRkZW47XFxuICAgIG92ZXJmbG93OiBoaWRkZW47XFxuICAgIHRyYW5zaXRpb246IGFsbCAwLjhzIGVhc2U7IH1cXG4gICAgLmltYWdlLWdyaWRfX2RvdWJsZS0tYmFjayB7XFxuICAgICAgdHJhbnNmb3JtOiByb3RhdGVZKDE4MGRlZyk7IH1cXG4gIC5pbWFnZS1ncmlkX19kb3VibGUtYnRuIHtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICB0b3A6IDI2JTtcXG4gICAgbGVmdDogNzUlO1xcbiAgICB3aWR0aDogNC40cmVtO1xcbiAgICBoZWlnaHQ6IDQuNHJlbTtcXG4gICAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNik7XFxuICAgIGJvcmRlcjogMnB4IHNvbGlkICMzNDI0NDI7XFxuICAgIHRyYW5zaXRpb246IGFsbCAwLjJzO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfVxcbiAgICAuaW1hZ2UtZ3JpZF9fZG91YmxlLWJ0bjpob3ZlciB7XFxuICAgICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmZmY7IH1cXG4gIC5pbWFnZS1ncmlkX19kb3VibGUtYnRuLXN2ZyB7XFxuICAgIGhlaWdodDogMi41cmVtO1xcbiAgICB3aWR0aDogMi41cmVtO1xcbiAgICBwb2ludGVyLWV2ZW50czogbm9uZTsgfVxcbiAgLmltYWdlLWdyaWRfX2RvYnVsZS1idG4tc3ZnLWNvbG9yIHtcXG4gICAgY29sb3I6ICMxNjE2MWQ7IH1cXG4gIC5pbWFnZS1ncmlkX19jb250YWluZXIge1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgaGVpZ2h0OiAxMDAlOyB9XFxuICAuaW1hZ2UtZ3JpZF9faW1hZ2Uge1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgaGVpZ2h0OiAxMDAlO1xcbiAgICBib3gtc2hhZG93OiAxcHggMXB4IDZweCByZ2JhKDAsIDAsIDAsIDAuNDUpO1xcbiAgICBib3JkZXItcmFkaXVzOiA0Ljc1JSAvIDMuNSU7IH1cXG4gIC5pbWFnZS1ncmlkX19saW5rIHtcXG4gICAgbWFyZ2luLWJvdHRvbTogMC45cmVtO1xcbiAgICB3aWR0aDogMjQuMjUlO1xcbiAgICBoZWlnaHQ6IGF1dG87XFxuICAgIG1hcmdpbi1ib3R0b206IDAuOXJlbTtcXG4gICAgcGFnZS1icmVhay1hZnRlcjogYXV0bztcXG4gICAgcGFnZS1icmVhay1iZWZvcmU6IGF1dG87XFxuICAgIHBhZ2UtYnJlYWstaW5zaWRlOiBhdm9pZDtcXG4gICAgZGlzcGxheTogYmxvY2s7IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA1OS4zNzVlbSkge1xcbiAgICAgIC5pbWFnZS1ncmlkX19saW5rIHtcXG4gICAgICAgIHdpZHRoOiAzMS43NSU7IH0gfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDQwLjYyNWVtKSB7XFxuICAgICAgLmltYWdlLWdyaWRfX2xpbmsge1xcbiAgICAgICAgd2lkdGg6IDQ3LjI1JTsgfSB9XFxuXFxuLmNhcmQge1xcbiAgd2lkdGg6IDEwMCU7XFxuICBtYXgtd2lkdGg6IDEwMHJlbTtcXG4gIHBhZGRpbmc6IDAgMTYlO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIG1hcmdpbi10b3A6IDNyZW07XFxuICBwYWRkaW5nLWJvdHRvbTogMC43cmVtO1xcbiAgYm9yZGVyLWJvdHRvbTogMXB4IGRhc2hlZCByZ2JhKDAsIDAsIDAsIDAuNyk7IH1cXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNzVyZW0pIHtcXG4gICAgLmNhcmQge1xcbiAgICAgIHBhZGRpbmc6IDAgMi41JSAwLjdyZW0gMi41JTsgfSB9XFxuICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDYyLjVlbSkge1xcbiAgICAuY2FyZCB7XFxuICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyOyB9IH1cXG4gIC5jYXJkX19pbWctY29udGFpbmVyIHtcXG4gICAgei1pbmRleDogMjtcXG4gICAgYm9yZGVyLXJhZGl1czogMTAwJTsgfVxcbiAgLmNhcmRfX2ltZyB7XFxuICAgIHdpZHRoOiAzM3JlbTtcXG4gICAgaGVpZ2h0OiA0NnJlbTtcXG4gICAgYm94LXNoYWRvdzogMXB4IDFweCA4cHggcmdiYSgwLCAwLCAwLCAwLjUpO1xcbiAgICBib3JkZXItcmFkaXVzOiA0Ljc1JSAvIDMuNSU7IH1cXG4gIC5jYXJkX19pbWctbGVmdCB7XFxuICAgIHdpZHRoOiAzM3JlbTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gICAgei1pbmRleDogMjsgfVxcbiAgLmNhcmRfX2ltZy1idG4ge1xcbiAgICBhbGlnbi1zZWxmOiBjZW50ZXI7XFxuICAgIG1hcmdpbi10b3A6IDFyZW07XFxuICAgIGhlaWdodDogMi44cmVtO1xcbiAgICBmb250LXNpemU6IDEuNHJlbTtcXG4gICAgbGluZS1oZWlnaHQ6IDEuODtcXG4gICAgY29sb3I6ICM1NTFhOGI7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmOWY3ZjU7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoODUsIDI2LCAxMzksIDAuNSk7XFxuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgYm94LXNoYWRvdzogMCAxcHggMCByZ2JhKDAsIDAsIDAsIDAuMDYpO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgMC4ycztcXG4gICAgcGFkZGluZzogMC4ycmVtIDAuNXJlbTtcXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAgIC5jYXJkX19pbWctYnRuOmhvdmVyIHtcXG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gICAgICBib3JkZXItY29sb3I6ICM2MzQ0OTY7IH1cXG4gIC5jYXJkX19pbWctc3ZnIHtcXG4gICAgaGVpZ2h0OiAxLjRyZW07XFxuICAgIHdpZHRoOiAxLjRyZW07XFxuICAgIG1hcmdpbi1yaWdodDogMC4zcmVtO1xcbiAgICBwb2ludGVyLWV2ZW50czogbm9uZTsgfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDYyLjVlbSkge1xcbiAgICAgIC5jYXJkX19pbWctc3ZnIHtcXG4gICAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH0gfVxcbiAgLmNhcmRfX2ltZy1kb3VibGUtc2lkZWQge1xcbiAgICBwZXJzcGVjdGl2ZTogMTUwcmVtO1xcbiAgICBoZWlnaHQ6IDQ2cmVtOyB9XFxuICAuY2FyZF9faW1nLWRvdWJsZSB7XFxuICAgIHdpZHRoOiAzM3JlbTtcXG4gICAgaGVpZ2h0OiA0NnJlbTtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICB0b3A6IDA7XFxuICAgIGxlZnQ6IDA7XFxuICAgIGJhY2tmYWNlLXZpc2liaWxpdHk6IGhpZGRlbjtcXG4gICAgb3ZlcmZsb3c6IGhpZGRlbjsgfVxcbiAgICAuY2FyZF9faW1nLWRvdWJsZS0tYmFjayB7XFxuICAgICAgdHJhbnNmb3JtOiByb3RhdGVZKDE4MGRlZyk7IH1cXG4gIC5jYXJkX190ZXh0IHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gICAgYm9yZGVyLXJhZGl1czogNHB4O1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDAsIDAsIDAsIDAuMjUpO1xcbiAgICBib3JkZXItdG9wOiAzcHggc29saWQgIzAwMDtcXG4gICAgYm9yZGVyLWJvdHRvbTogM3B4IHNvbGlkICMwMDA7XFxuICAgIG1hcmdpbi10b3A6IDJyZW07XFxuICAgIHdpZHRoOiAzNHJlbTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gICAgcGFkZGluZzogM3JlbTtcXG4gICAgbWFyZ2luLXJpZ2h0OiAzcmVtO1xcbiAgICBtYXJnaW4tbGVmdDogLTJyZW07IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA2Mi41ZW0pIHtcXG4gICAgICAuY2FyZF9fdGV4dCB7XFxuICAgICAgICBtYXJnaW46IDFyZW0gMDsgfSB9XFxuICAgIC5jYXJkX190ZXh0LWZsZXgge1xcbiAgICAgIG1hcmdpbi1ib3R0b206IDFyZW07XFxuICAgICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNiZmJmYmY7IH1cXG4gICAgLmNhcmRfX3RleHQtdGl0bGUge1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfVxcbiAgICAgIC5jYXJkX190ZXh0LXRpdGxlLWgzIHtcXG4gICAgICAgIGZvbnQtc2l6ZTogMS44cmVtO1xcbiAgICAgICAgZm9udC13ZWlnaHQ6IDQwMDtcXG4gICAgICAgIG1hcmdpbi1yaWdodDogMXJlbTsgfVxcbiAgICAuY2FyZF9fdGV4dC1jb2xvci1pbmRpY2F0b3Ige1xcbiAgICAgIHdpZHRoOiAxLjNyZW07XFxuICAgICAgaGVpZ2h0OiAxLjNyZW07XFxuICAgICAgYm9yZGVyOiAxcHggc29saWQgIzMzMztcXG4gICAgICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICAgICAgYm94LXNoYWRvdzogMHB4IDBweCAwcHggMnB4IHJnYmEoMCwgMCwgMCwgMC4yKTtcXG4gICAgICBtYXJnaW4tcmlnaHQ6IDAuN3JlbTtcXG4gICAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7IH1cXG4gICAgICAuY2FyZF9fdGV4dC1jb2xvci1pbmRpY2F0b3ItLVUge1xcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgxMjgsIDEyOCwgMjU1LCAwLjcpOyB9XFxuICAgICAgLmNhcmRfX3RleHQtY29sb3ItaW5kaWNhdG9yLS1CIHtcXG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMCwgMCwgMC43KTsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWNvbG9yLWluZGljYXRvci0tUiB7XFxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1NSwgNzcsIDc3LCAwLjcpOyB9XFxuICAgICAgLmNhcmRfX3RleHQtY29sb3ItaW5kaWNhdG9yLS1XIHtcXG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC43KTsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWNvbG9yLWluZGljYXRvci0tRyB7XFxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDI1NSwgMCwgMC43KTsgfVxcbiAgICAuY2FyZF9fdGV4dC1vcmFjbGUtcCB7XFxuICAgICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcXG4gICAgICBmb250LXNpemU6IDEuM3JlbTsgfVxcbiAgICAuY2FyZF9fdGV4dC1vcmFjbGUtZmxhdm9yIHtcXG4gICAgICBmb250LXNpemU6IDEuM3JlbTtcXG4gICAgICBmb250LXN0eWxlOiBpdGFsaWM7IH1cXG4gICAgLmNhcmRfX3RleHQtaWxsdXN0cmF0b3Ige1xcbiAgICAgIGZvbnQtc2l6ZTogMS4ycmVtO1xcbiAgICAgIGZvbnQtc3R5bGU6IGl0YWxpYzsgfVxcbiAgICAuY2FyZF9fdGV4dC1sZWdhbCB7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBmbGV4LWRpcmVjdGlvbjogcm93O1xcbiAgICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWxlZ2FsLWhhbGYge1xcbiAgICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH1cXG4gICAgICAuY2FyZF9fdGV4dC1sZWdhbC1zcGFuLWNvbnRhaW5lciB7XFxuICAgICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgICAgIGZvbnQtc2l6ZTogMS40cmVtOyB9XFxuICAgICAgICAuY2FyZF9fdGV4dC1sZWdhbC1zcGFuLWNvbnRhaW5lcjpub3QoOmxhc3QtY2hpbGQpIHtcXG4gICAgICAgICAgbWFyZ2luLWJvdHRvbTogMC41cmVtOyB9XFxuICAgICAgLmNhcmRfX3RleHQtbGVnYWwtc3Bhbi1ib3gge1xcbiAgICAgICAgd2lkdGg6IDZyZW07XFxuICAgICAgICBoZWlnaHQ6IDIuNXJlbTtcXG4gICAgICAgIG1hcmdpbi1yaWdodDogMC4zcmVtO1xcbiAgICAgICAgZm9udC1zaXplOiAxcmVtO1xcbiAgICAgICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcXG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgICAgICBib3JkZXItcmFkaXVzOiAzcHg7IH1cXG4gICAgICAgIC5jYXJkX190ZXh0LWxlZ2FsLXNwYW4tYm94LS1ub3RfbGVnYWwge1xcbiAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZTYwMDAwOyB9XFxuICAgICAgICAuY2FyZF9fdGV4dC1sZWdhbC1zcGFuLWJveC0tbGVnYWwge1xcbiAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMDA5OTAwOyB9XFxuICAgICAgLmNhcmRfX3RleHQtbGVnYWwtc3Bhbi1ib3gge1xcbiAgICAgICAgY29sb3I6ICNmZmY7IH1cXG4gIC5jYXJkX19zZXQge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogODEuMjVlbSkge1xcbiAgICAgIC5jYXJkX19zZXQge1xcbiAgICAgICAgd2lkdGg6IDMwcmVtOyB9IH1cXG4gICAgLmNhcmRfX3NldC1iYW5uZXIge1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgYm9yZGVyOiAxcHggc29saWQgI2JmYmZiZjtcXG4gICAgICB3aWR0aDogNDByZW07XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzQ5NDY1YztcXG4gICAgICBjb2xvcjogI2ZkZmRmZDtcXG4gICAgICBwYWRkaW5nOiAwLjdyZW07XFxuICAgICAgYm9yZGVyLXJhZGl1czogM3B4OyB9XFxuICAgICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA4MS4yNWVtKSB7XFxuICAgICAgICAuY2FyZF9fc2V0LWJhbm5lciB7XFxuICAgICAgICAgIHdpZHRoOiAzMHJlbTsgfSB9XFxuICAgICAgLmNhcmRfX3NldC1iYW5uZXItc3ZnLWNvbnRhaW5lciB7XFxuICAgICAgICBtYXJnaW4tcmlnaHQ6IDFyZW07IH1cXG4gICAgICAuY2FyZF9fc2V0LWJhbm5lci1zdmcge1xcbiAgICAgICAgd2lkdGg6IDIuNHJlbTtcXG4gICAgICAgIGhlaWdodDogMi40cmVtO1xcbiAgICAgICAgZmlsdGVyOiBpbnZlcnQoMTAwJSk7IH1cXG4gICAgLmNhcmRfX3NldC1kZXRhaWxzIHtcXG4gICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH1cXG4gICAgLmNhcmRfX3NldC1oZWFkZXItbmFtZSB7XFxuICAgICAgZm9udC1zaXplOiAxLjdyZW1yZW07IH1cXG4gICAgLmNhcmRfX3NldC1oZWFkZXItY29kZSB7XFxuICAgICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTsgfVxcbiAgICAuY2FyZF9fc2V0LXByaW50cy1oZWFkZXIge1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICM0OTQ2NWM7XFxuICAgICAgY29sb3I6ICNmZGZkZmQ7XFxuICAgICAgZm9udC1zaXplOiAxLjNyZW07XFxuICAgICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcXG4gICAgICBib3JkZXI6IDFweCBzb2xpZCAjYmZiZmJmO1xcbiAgICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgICBwYWRkaW5nOiAwLjNyZW0gMC43cmVtOyB9XFxuICAgIC5jYXJkX19zZXQtcHJpbnRzLXN2Zy1jb250YWluZXIge1xcbiAgICAgIGhlaWdodDogMS44cmVtO1xcbiAgICAgIHdpZHRoOiAxLjhyZW07XFxuICAgICAgYm9yZGVyOiAxcHggc29saWQgI2JmYmZiZjtcXG4gICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgICAgYm9yZGVyLXJhZGl1czogMTAwJTsgfVxcbiAgICAuY2FyZF9fc2V0LXByaW50cy1zdmctLWNvbW1vbiB7XFxuICAgICAgZmlsbDogIzAwMDsgfVxcbiAgICAuY2FyZF9fc2V0LXByaW50cy1zdmctLXVuY29tbW9uIHtcXG4gICAgICBmaWxsOiAjZTZlNmU2OyB9XFxuICAgIC5jYXJkX19zZXQtcHJpbnRzLXN2Zy0tcmFyZSB7XFxuICAgICAgZmlsbDogI2U2YzMwMDsgfVxcbiAgICAuY2FyZF9fc2V0LXByaW50cy1zdmctLW15dGhpYyB7XFxuICAgICAgZmlsbDogI2ZmMDAwMDsgfVxcbiAgICAuY2FyZF9fc2V0LXByaW50cy1saXN0IHtcXG4gICAgICBsaXN0LXN0eWxlOiBub25lO1xcbiAgICAgIGJvcmRlci1yYWRpdXM6IDNweDsgfVxcbiAgICAgIC5jYXJkX19zZXQtcHJpbnRzLWxpc3QtbGluazpsaW5rLCAuY2FyZF9fc2V0LXByaW50cy1saXN0LWxpbms6dmlzaXRlZCB7XFxuICAgICAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICAgICAgICBjb2xvcjogIzAwMDsgfVxcbiAgICAgIC5jYXJkX19zZXQtcHJpbnRzLWxpc3QtaXRlbSB7XFxuICAgICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICAgICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNlN2U5ZWM7XFxuICAgICAgICBib3JkZXItbGVmdDogMXB4IHNvbGlkICNjZGNkY2Q7XFxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgICAgICAgcGFkZGluZzogMC4yNXJlbSAwOyB9XFxuICAgICAgICAuY2FyZF9fc2V0LXByaW50cy1saXN0LWl0ZW0tLXBsLTE0IHtcXG4gICAgICAgICAgcGFkZGluZy1sZWZ0OiAxLjRyZW07XFxuICAgICAgICAgIGJvcmRlci1ib3R0b206IDNweCBzb2xpZCAjMDAwOyB9XFxuICAgICAgICAuY2FyZF9fc2V0LXByaW50cy1saXN0LWl0ZW06aG92ZXIge1xcbiAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjJmMmYyOyB9XFxuICAgICAgLmNhcmRfX3NldC1wcmludHMtbGlzdC1pdGVtLW5hbWUtd3JhcHBlciB7XFxuICAgICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgICAgIG1hcmdpbi1sZWZ0OiAtMXJlbTsgfVxcbiAgICAgIC5jYXJkX19zZXQtcHJpbnRzLWxpc3QtaXRlbS1zZXQtbmFtZSB7XFxuICAgICAgICBtYXJnaW4tbGVmdDogMC41cmVtOyB9XFxuICAgICAgLmNhcmRfX3NldC1wcmludHMtbGlzdC1pdGVtLXByaWNlIHtcXG4gICAgICAgIG1hcmdpbi1yaWdodDogMC43cmVtO1xcbiAgICAgICAgY29sb3I6ICMwMDY4ODU7IH1cXG5cXG4uY2FyZC1wYWdlIHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgZ3JpZC1jb2x1bW46IDEgLyAtMTtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcblxcbi5hZGQtdG8taW52LFxcbi5yZW1vdmUtZnJvbS1pbnYge1xcbiAgbWFyZ2luLXRvcDogM3JlbTtcXG4gIHdpZHRoOiA1MCU7XFxuICBtYXJnaW4tbGVmdDogNTAlO1xcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC01MCUpO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH1cXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNjIuNWVtKSB7XFxuICAgIC5hZGQtdG8taW52LFxcbiAgICAucmVtb3ZlLWZyb20taW52IHtcXG4gICAgICB3aWR0aDogMTAwJTsgfSB9XFxuICAuYWRkLXRvLWludl9faGVhZGVyLFxcbiAgLnJlbW92ZS1mcm9tLWludl9faGVhZGVyIHtcXG4gICAgY29sb3I6ICMxNjE2MWQ7XFxuICAgIGZvbnQtc2l6ZTogMi4ycmVtO1xcbiAgICBmb250LXdlaWdodDogMzAwO1xcbiAgICBtYXJnaW46IDAgYXV0byAxcmVtIGF1dG87IH1cXG4gIC5hZGQtdG8taW52X19mb3JtLFxcbiAgLnJlbW92ZS1mcm9tLWludl9fZm9ybSB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH1cXG4gICAgLmFkZC10by1pbnZfX2Zvcm0tcHJpY2UsXFxuICAgIC5yZW1vdmUtZnJvbS1pbnZfX2Zvcm0tcHJpY2Uge1xcbiAgICAgIHdpZHRoOiAyMHJlbTtcXG4gICAgICBoZWlnaHQ6IDMuNXJlbTtcXG4gICAgICBtYXJnaW4tYm90dG9tOiAxcmVtO1xcbiAgICAgIHBhZGRpbmc6IDFyZW07XFxuICAgICAgYm9yZGVyOiBzb2xpZCAxcHggI2JmYmZiZjtcXG4gICAgICBib3JkZXItcmFkaXVzOiA1cHg7IH1cXG4gICAgICAuYWRkLXRvLWludl9fZm9ybS1wcmljZTpmb2N1cyxcXG4gICAgICAucmVtb3ZlLWZyb20taW52X19mb3JtLXByaWNlOmZvY3VzIHtcXG4gICAgICAgIGJvcmRlcjogc29saWQgMXB4ICMwMDA7IH1cXG4gICAgLmFkZC10by1pbnZfX2Zvcm0tZ3JvdXAsXFxuICAgIC5yZW1vdmUtZnJvbS1pbnZfX2Zvcm0tZ3JvdXAge1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1ldmVubHk7XFxuICAgICAgYWxpZ24tY29udGVudDogY2VudGVyO1xcbiAgICAgIG1hcmdpbi1ib3R0b206IDEuNXJlbTtcXG4gICAgICBwb3NpdGlvbjogcmVsYXRpdmU7IH1cXG4gICAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDMxLjVlbSkge1xcbiAgICAgICAgLmFkZC10by1pbnZfX2Zvcm0tZ3JvdXAsXFxuICAgICAgICAucmVtb3ZlLWZyb20taW52X19mb3JtLWdyb3VwIHtcXG4gICAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gICAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfSB9XFxuICAgIC5hZGQtdG8taW52X19mb3JtLWxhYmVsLFxcbiAgICAucmVtb3ZlLWZyb20taW52X19mb3JtLWxhYmVsIHtcXG4gICAgICBtYXJnaW4tcmlnaHQ6IDAuM3JlbTtcXG4gICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgIGFsaWduLWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgICBjb2xvcjogIzE2MTYxZDtcXG4gICAgICBtYXJnaW4tdG9wOiAwLjQ1cmVtOyB9XFxuICAgICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiAzMS41ZW0pIHtcXG4gICAgICAgIC5hZGQtdG8taW52X19mb3JtLWxhYmVsLFxcbiAgICAgICAgLnJlbW92ZS1mcm9tLWludl9fZm9ybS1sYWJlbCB7XFxuICAgICAgICAgIG1hcmdpbi1ib3R0b206IDAuNXJlbTsgfSB9XFxuICAuYWRkLXRvLWludi1wcmljZS1tc2csXFxuICAucmVtb3ZlLWZyb20taW52LXByaWNlLW1zZyB7XFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgYm90dG9tOiAtMS44cmVtO1xcbiAgICByaWdodDogMjUlO1xcbiAgICBjb2xvcjogcmVkOyB9XFxuICAuYWRkLXRvLWludl9fc3VibWl0LFxcbiAgLnJlbW92ZS1mcm9tLWludl9fc3VibWl0IHtcXG4gICAgYWxpZ24tc2VsZjogY2VudGVyO1xcbiAgICBoZWlnaHQ6IDMuMXJlbTtcXG4gICAgZm9udC1zaXplOiAxLjRyZW07XFxuICAgIGxpbmUtaGVpZ2h0OiAxLjg7XFxuICAgIGNvbG9yOiAjNTUxYThiO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjlmN2Y1O1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDg1LCAyNiwgMTM5LCAwLjUpO1xcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XFxuICAgIGJveC1zaGFkb3c6IDAgMXB4IDAgcmdiYSgwLCAwLCAwLCAwLjA2KTtcXG4gICAgdHJhbnNpdGlvbjogYWxsIDAuMnM7XFxuICAgIHBhZGRpbmc6IDAuMnJlbSAwLjc1cmVtO1xcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIG1hcmdpbi1ib3R0b206IDFyZW07IH1cXG4gICAgLmFkZC10by1pbnZfX3N1Ym1pdDpob3ZlcixcXG4gICAgLnJlbW92ZS1mcm9tLWludl9fc3VibWl0OmhvdmVyIHtcXG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gICAgICBib3JkZXItY29sb3I6ICM2MzQ0OTY7IH1cXG5cXG4udXRpbC1zcGFjZTo6YmVmb3JlLFxcbi51dGlsLXNwYWNlOjphZnRlciB7XFxuICBjb250ZW50OiAnJztcXG4gIG1hcmdpbjogMCAwLjJyZW07XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfVxcblxcbi5uby1yZXN1bHRzIHtcXG4gIGp1c3RpZnktc2VsZjogY2VudGVyOyB9XFxuXFxuLmhvbWVwYWdlIHtcXG4gIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCh0byBib3R0b20sICMxZDFjMjUsICM0MzFlM2YpO1xcbiAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcXG4gIGhlaWdodDogMTAwdmg7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgb3ZlcmZsb3cteDogaGlkZGVuICFpbXBvcnRhbnQ7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIGJhY2tncm91bmQtc2l6ZTogY292ZXI7IH1cXG4gIC5ob21lcGFnZV9fY2VudGVyIHtcXG4gICAgYWxpZ24tc2VsZjogY2VudGVyO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogMjguMTI1ZW0pIHtcXG4gICAgICAuaG9tZXBhZ2VfX2NlbnRlciB7XFxuICAgICAgICBtYXJnaW4tdG9wOiAtMTJyZW07IH0gfVxcbiAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA0MC42MjVlbSkge1xcbiAgICAuaG9tZXBhZ2VfX2NlbnRlci1oZWFkaW5nLXdyYXBwZXIge1xcbiAgICAgIG1hcmdpbjogMCBhdXRvIDAuNXJlbSBhdXRvO1xcbiAgICAgIHdpZHRoOiA3NSU7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7IH0gfVxcbiAgLmhvbWVwYWdlX19zZWFyY2gge1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7IH1cXG4gIC5ob21lcGFnZV9fc2VhcmNoLWlucHV0IHtcXG4gICAgcGFkZGluZzogMS4ycmVtIDEuNHJlbSAxLjJyZW0gNi4ycmVtO1xcbiAgICBmb250LXNpemU6IDNyZW07XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICMyNDIwMzE7XFxuICAgIGNvbG9yOiAjZDdkN2Q3O1xcbiAgICBib3JkZXItcmFkaXVzOiA0cHg7XFxuICAgIGJveC1zaGFkb3c6IDBweCAwcHggMHB4IDJweCByZ2JhKDAsIDAsIDAsIDAuNSk7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNSk7IH1cXG4gICAgLmhvbWVwYWdlX19zZWFyY2gtaW5wdXQ6OnBsYWNlaG9sZGVyIHtcXG4gICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA0MC42MjVlbSkge1xcbiAgICAgIC5ob21lcGFnZV9fc2VhcmNoLWlucHV0IHtcXG4gICAgICAgIHdpZHRoOiA4MCU7XFxuICAgICAgICBtYXJnaW4tbGVmdDogMTAlOyB9IH1cXG4gIC5ob21lcGFnZV9fc2VhcmNoLWJ0biB7XFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgbGVmdDogNnJlbTtcXG4gICAgdG9wOiAycmVtOyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNDAuNjI1ZW0pIHtcXG4gICAgICAuaG9tZXBhZ2VfX3NlYXJjaC1idG4ge1xcbiAgICAgICAgbGVmdDogMTJyZW07IH0gfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDI4LjEyNWVtKSB7XFxuICAgICAgLmhvbWVwYWdlX19zZWFyY2gtYnRuIHtcXG4gICAgICAgIGxlZnQ6IDEwcmVtOyB9IH1cXG4gIC5ob21lcGFnZV9faWNvbi1zaXppbmctLXNlYXJjaCB7XFxuICAgIHdpZHRoOiAzcmVtO1xcbiAgICBoZWlnaHQ6IDNyZW07XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtMTUwJSk7IH1cXG4gIC5ob21lcGFnZV9faWNvbi1wYXRoIHtcXG4gICAgZmlsbDogI2JmYmZiZjsgfVxcbiAgLmhvbWVwYWdlX19saW5rcyB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyOyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNDAuNjI1ZW0pIHtcXG4gICAgICAuaG9tZXBhZ2VfX2xpbmtzIHtcXG4gICAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH0gfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDI4LjEyNWVtKSB7XFxuICAgICAgLmhvbWVwYWdlX19saW5rcyB7XFxuICAgICAgICBtYXJnaW4tbGVmdDogNy41JTsgfSB9XFxuICAuaG9tZXBhZ2VfX2xpbmsge1xcbiAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoODUsIDI2LCAxMzksIDAuNSk7XFxuICAgIGJvcmRlci1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjYpO1xcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XFxuICAgIGNvbG9yOiAjZmZmO1xcbiAgICBtYXJnaW4tdG9wOiAwLjZyZW07XFxuICAgIG1hcmdpbi1yaWdodDogM3JlbTtcXG4gICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICBsaW5lLWhlaWdodDogMS40O1xcbiAgICBwYWRkaW5nOiAwLjJyZW0gMXJlbSAwIDFyZW07XFxuICAgIGhlaWdodDogMi44cmVtO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgMC4ycztcXG4gICAgYm94LXNoYWRvdzogMCAxcHggMXB4IDAgcmdiYSgwLCAwLCAwLCAwLjA2KTtcXG4gICAgbWluLXdpZHRoOiA5cmVtO1xcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA0MC42MjVlbSkge1xcbiAgICAgIC5ob21lcGFnZV9fbGluayB7XFxuICAgICAgICBhbGlnbi1zZWxmOiBjZW50ZXI7XFxuICAgICAgICB3aWR0aDogMTQuNXJlbTsgfSB9XFxuICAgIC5ob21lcGFnZV9fbGluazpob3ZlciB7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjA5KTsgfVxcblxcbi5pbnZlbnRvcnktZGV0YWlscyB7XFxuICBncmlkLWNvbHVtbjogMSAvIC0xO1xcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHJnYmEoOTksIDY4LCAxNTAsIDAuMSk7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjZmNGZhO1xcbiAgY29sb3I6ICM1MzUzNTM7XFxuICBwYWRkaW5nOiAxcmVtIDE2JTtcXG4gIG1hcmdpbi1ib3R0b206IDJyZW07XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuOyB9XFxuICAuaW52ZW50b3J5LWRldGFpbHNfX2xpbmsge1xcbiAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICAgIGNvbG9yOiByZ2JhKDgzLCA4MywgODMsIDAuNzUpO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgMC4ycztcXG4gICAgcGFkZGluZzogMCAwLjZyZW07XFxuICAgIGJvcmRlci1sZWZ0OiAxcHggc29saWQgIzUzNTM1MztcXG4gICAgYm9yZGVyLXJpZ2h0OiAxcHggc29saWQgIzUzNTM1MzsgfVxcbiAgICAuaW52ZW50b3J5LWRldGFpbHNfX2xpbms6aG92ZXIge1xcbiAgICAgIGNvbG9yOiAjNTM1MzUzOyB9XFxuICAuaW52ZW50b3J5LWRldGFpbHMgc3BhbiB7XFxuICAgIGNvbG9yOiAjMDA2ODg1OyB9XFxuXFxuLmhvbWVwYWdlX19jb2xhZ2UsXFxuLmNhcmRwYWdlX19jb2xhZ2Uge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcXG4gIGxlZnQ6IDA7XFxuICBoZWlnaHQ6IDE1cmVtO1xcbiAgd2lkdGg6IDEwMCU7IH1cXG5cXG4uaG9tZXBhZ2VfX2NvbGFnZSB7XFxuICBib3R0b206IDA7IH1cXG5cXG4uY2FyZHBhZ2VfX2NvbGFnZSB7XFxuICBib3R0b206IC0yLjZyZW07IH1cXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNjIuNWVtKSB7XFxuICAgIC5jYXJkcGFnZV9fY29sYWdlIHtcXG4gICAgICBkaXNwbGF5OiBub25lOyB9IH1cXG5cXG4uaG9tZXBhZ2VfX2NvbGFnZS1pbm5lcixcXG4uY2FyZHBhZ2VfX2NvbGFnZS1pbm5lciB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBoZWlnaHQ6IDEwMCU7XFxuICBtYXJnaW4tbGVmdDogNTAlO1xcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC01MCUpO1xcbiAgd2lkdGg6IDY1LjVyZW07IH1cXG5cXG4uaG9tZXBhZ2VfX2NvbGFnZS1jYXJkLFxcbi5jYXJkcGFnZV9fY29sYWdlLWNhcmQge1xcbiAgd2lkdGg6IDE2LjhyZW07XFxuICBoZWlnaHQ6IDIzLjRyZW07XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICBib3JkZXItcmFkaXVzOiA1JSAvIDMuNzUlO1xcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApO1xcbiAgdHJhbnNpdGlvbjogYWxsIDAuM3M7XFxuICBib3gtc2hhZG93OiBpbnNldCAwIDAgM3B4IDNweCAjMDAwOyB9XFxuICAuaG9tZXBhZ2VfX2NvbGFnZS1jYXJkOm50aC1jaGlsZCgxKSxcXG4gIC5jYXJkcGFnZV9fY29sYWdlLWNhcmQ6bnRoLWNoaWxkKDEpIHtcXG4gICAgdG9wOiAyLjJyZW07IH1cXG4gIC5ob21lcGFnZV9fY29sYWdlLWNhcmQ6bnRoLWNoaWxkKDIpLFxcbiAgLmNhcmRwYWdlX19jb2xhZ2UtY2FyZDpudGgtY2hpbGQoMikge1xcbiAgICB0b3A6IDYuMnJlbTtcXG4gICAgbGVmdDogMy41cmVtOyB9XFxuICAuaG9tZXBhZ2VfX2NvbGFnZS1jYXJkOm50aC1jaGlsZCgzKSxcXG4gIC5jYXJkcGFnZV9fY29sYWdlLWNhcmQ6bnRoLWNoaWxkKDMpIHtcXG4gICAgdG9wOiAxcmVtO1xcbiAgICBsZWZ0OiAxNy40cmVtOyB9XFxuICAuaG9tZXBhZ2VfX2NvbGFnZS1jYXJkOm50aC1jaGlsZCg0KSxcXG4gIC5jYXJkcGFnZV9fY29sYWdlLWNhcmQ6bnRoLWNoaWxkKDQpIHtcXG4gICAgdG9wOiA0LjVyZW07XFxuICAgIGxlZnQ6IDIwLjZyZW07IH1cXG4gIC5ob21lcGFnZV9fY29sYWdlLWNhcmQ6bnRoLWNoaWxkKDUpLFxcbiAgLmNhcmRwYWdlX19jb2xhZ2UtY2FyZDpudGgtY2hpbGQoNSkge1xcbiAgICB0b3A6IDEuNnJlbTtcXG4gICAgbGVmdDogMzQuN3JlbTsgfVxcbiAgLmhvbWVwYWdlX19jb2xhZ2UtY2FyZDpudGgtY2hpbGQoNiksXFxuICAuY2FyZHBhZ2VfX2NvbGFnZS1jYXJkOm50aC1jaGlsZCg2KSB7XFxuICAgIHRvcDogNi41cmVtO1xcbiAgICBsZWZ0OiAzOHJlbTsgfVxcbiAgLmhvbWVwYWdlX19jb2xhZ2UtY2FyZDpudGgtY2hpbGQoNyksXFxuICAuY2FyZHBhZ2VfX2NvbGFnZS1jYXJkOm50aC1jaGlsZCg3KSB7XFxuICAgIHRvcDogMy41cmVtO1xcbiAgICByaWdodDogMDsgfVxcbiAgLmhvbWVwYWdlX19jb2xhZ2UtY2FyZDpob3ZlcixcXG4gIC5jYXJkcGFnZV9fY29sYWdlLWNhcmQ6aG92ZXIge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTUlKTsgfVxcblxcbi5jb250YWluZXIge1xcbiAgZGlzcGxheTogZ3JpZDtcXG4gIGdyaWQtdGVtcGxhdGUtY29sdW1uczogW2Z1bGwtc3RhcnRdIG1pbm1heCg2cmVtLCAxZnIpIFtjZW50ZXItc3RhcnRdIHJlcGVhdCg4LCBbY29sLXN0YXJ0XSBtaW5tYXgobWluLWNvbnRlbnQsIDE0cmVtKSBbY29sLWVuZF0pIFtjZW50ZXItZW5kXSBtaW5tYXgoNnJlbSwgMWZyKSBbZnVsbC1lbmRdO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2Y1ZjZmNztcXG4gIGJhY2tncm91bmQtc2l6ZTogY292ZXI7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7IH1cXG5cXG4uc2VhcmNoIHtcXG4gIGdyaWQtY29sdW1uOiBmdWxsLXN0YXJ0IC8gZnVsbC1lbmQ7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmOyB9XFxuXFxuLmFwaS1yZXN1bHRzLWRpc3BsYXkge1xcbiAgZ3JpZC1jb2x1bW46IGZ1bGwtc3RhcnQgLyBmdWxsLWVuZDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmNWY2Zjc7XFxuICBiYWNrZ3JvdW5kLXNpemU6IGNvdmVyO1xcbiAgZGlzcGxheTogZ3JpZDsgfVxcblwiXSxcInNvdXJjZVJvb3RcIjpcIlwifV0pO1xuLy8gRXhwb3J0c1xuZXhwb3J0IGRlZmF1bHQgX19fQ1NTX0xPQURFUl9FWFBPUlRfX187XG4iLCIvLyBJbXBvcnRzXG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyBmcm9tIFwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2Nzc1dpdGhNYXBwaW5nVG9TdHJpbmcuanNcIjtcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18gZnJvbSBcIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanNcIjtcbmltcG9ydCBfX19DU1NfTE9BREVSX0dFVF9VUkxfSU1QT1JUX19fIGZyb20gXCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvZ2V0VXJsLmpzXCI7XG5pbXBvcnQgX19fQ1NTX0xPQURFUl9VUkxfSU1QT1JUXzBfX18gZnJvbSBcIi4uLy4uL2ltZy9tYW5hLXN5bWJvbHMvbWFuYS5zdmdcIjtcbnZhciBfX19DU1NfTE9BREVSX0VYUE9SVF9fXyA9IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyhfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fKTtcbnZhciBfX19DU1NfTE9BREVSX1VSTF9SRVBMQUNFTUVOVF8wX19fID0gX19fQ1NTX0xPQURFUl9HRVRfVVJMX0lNUE9SVF9fXyhfX19DU1NfTE9BREVSX1VSTF9JTVBPUlRfMF9fXyk7XG4vLyBNb2R1bGVcbl9fX0NTU19MT0FERVJfRVhQT1JUX19fLnB1c2goW21vZHVsZS5pZCwgXCIubWFuYSB7XFxuICAgIGJhY2tncm91bmQtaW1hZ2U6IHVybChcIiArIF9fX0NTU19MT0FERVJfVVJMX1JFUExBQ0VNRU5UXzBfX18gKyBcIik7XFxuICAgIGJhY2tncm91bmQtcmVwZWF0OiBuby1yZXBlYXQ7XFxuICAgIGJhY2tncm91bmQtc2l6ZTogYXV0byA3MDAlO1xcbiAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICAgIGZvbnQtc2l6ZTogMTAwJTtcXG59XFxuXFxuLm1hbmEueHMge1xcbiAgICB3aWR0aDogMS41cmVtO1xcbiAgICBoZWlnaHQ6IDEuNXJlbTtcXG59XFxuXFxuLm1hbmEuc21hbGwge1xcbiAgICBoZWlnaHQ6IDJyZW07XFxuICAgIHdpZHRoOiAycmVtO1xcbn1cXG4ubWFuYS5tZWRpdW0ge1xcbiAgICBoZWlnaHQ6IDJlbTtcXG4gICAgd2lkdGg6IDJlbTtcXG59XFxuLm1hbmEubGFyZ2Uge1xcbiAgICBoZWlnaHQ6IDRlbTtcXG4gICAgd2lkdGg6IDRlbTtcXG59XFxuLm1hbmEucyB7IGJhY2tncm91bmQtcG9zaXRpb246IDAgMDsgfVxcbi5tYW5hLnMxIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMTEuMSUgMDsgfVxcbi5tYW5hLnMyIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMjIuMiUgMDsgfVxcbi5tYW5hLnMzIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMzMuMyUgMDsgfVxcbi5tYW5hLnM0IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNDQuNCUgMDsgfVxcbi5tYW5hLnM1IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNTUuNSUgMDsgfVxcbi5tYW5hLnM2IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNjYuNiUgMDsgfVxcbi5tYW5hLnM3IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNzcuNyUgMDsgfVxcbi5tYW5hLnM4IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogODguOCUgMDsgfVxcbi5tYW5hLnM5IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogOTkuOSUgMDsgfVxcblxcbi5tYW5hLnMxMCB7IGJhY2tncm91bmQtcG9zaXRpb246IDAgMTYlOyB9XFxuLm1hbmEuczExIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMTEuMSUgMTYuNiU7IH1cXG4ubWFuYS5zMTIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAyMi4yJSAxNi42JTsgfVxcbi5tYW5hLnMxMyB7IGJhY2tncm91bmQtcG9zaXRpb246IDMzLjMlIDE2LjYlOyB9XFxuLm1hbmEuczE0IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNDQuNCUgMTYuNiU7IH1cXG4ubWFuYS5zMTUgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA1NS41JSAxNi42JTsgfVxcbi5tYW5hLnMxNiB7IGJhY2tncm91bmQtcG9zaXRpb246IDY2LjYlIDE2LjYlOyB9XFxuLm1hbmEuczE3IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNzcuNyUgMTYuNiU7IH1cXG4ubWFuYS5zMTggeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4OC44JSAxNi42JTsgfVxcbi5tYW5hLnMxOSB7IGJhY2tncm91bmQtcG9zaXRpb246IDk5LjklIDE2LjYlOyB9XFxuXFxuLm1hbmEuczIwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMCAzMyU7IH1cXG4ubWFuYS5zeCB7IGJhY2tncm91bmQtcG9zaXRpb246IDExLjElIDMzLjMlOyB9XFxuLm1hbmEuc3kgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAyMi4yJSAzMy4zJTsgfVxcbi5tYW5hLnN6IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMzMuMyUgMzMuMyU7IH1cXG4ubWFuYS5zdyB7IGJhY2tncm91bmQtcG9zaXRpb246IDQ0LjQlIDMzLjMlOyB9XFxuLm1hbmEuc3UgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA1NS41JSAzMy4zJTsgfVxcbi5tYW5hLnNiIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNjYuNiUgMzMuMyU7IH1cXG4ubWFuYS5zciB7IGJhY2tncm91bmQtcG9zaXRpb246IDc3LjclIDMzLjMlOyB9XFxuLm1hbmEuc2cgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4OC44JSAzMy4zJTsgfVxcbi5tYW5hLnNzIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogOTkuOSUgMzMuMyU7IH1cXG5cXG4ubWFuYS5zd3UgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwIDUwJTsgfVxcbi5tYW5hLnN3YiB7IGJhY2tncm91bmQtcG9zaXRpb246IDExLjElIDUwJTsgfVxcbi5tYW5hLnN1YiB7IGJhY2tncm91bmQtcG9zaXRpb246IDIyLjIlIDUwJTsgfVxcbi5tYW5hLnN1ciB7IGJhY2tncm91bmQtcG9zaXRpb246IDMzLjMlIDUwJTsgfVxcbi5tYW5hLnNiciB7IGJhY2tncm91bmQtcG9zaXRpb246IDQ0LjQlIDUwJTsgfVxcbi5tYW5hLnNiZyB7IGJhY2tncm91bmQtcG9zaXRpb246IDU1LjUlIDUwJTsgfVxcbi5tYW5hLnNydyB7IGJhY2tncm91bmQtcG9zaXRpb246IDY2LjYlIDUwJTsgfVxcbi5tYW5hLnNyZyB7IGJhY2tncm91bmQtcG9zaXRpb246IDc3LjclIDUwJTsgfVxcbi5tYW5hLnNndyB7IGJhY2tncm91bmQtcG9zaXRpb246IDg4LjglIDUwJTsgfVxcbi5tYW5hLnNndSB7IGJhY2tncm91bmQtcG9zaXRpb246IDk5LjklIDUwJTsgfVxcblxcbi5tYW5hLnMydyB7IGJhY2tncm91bmQtcG9zaXRpb246IDAgNjYuNiU7IH1cXG4ubWFuYS5zMnUgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAxMS4xJSA2Ni42JTsgfVxcbi5tYW5hLnMyYiB7IGJhY2tncm91bmQtcG9zaXRpb246IDIyLjIlIDY2LjYlOyB9XFxuLm1hbmEuczJyIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMzMuMyUgNjYuNiU7IH1cXG4ubWFuYS5zMmcgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA0NC40JSA2Ni42JTsgfVxcbi5tYW5hLnN3cCB7IGJhY2tncm91bmQtcG9zaXRpb246IDU1LjUlIDY2LjYlOyB9XFxuLm1hbmEuc3VwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNjYuNiUgNjYuNiU7IH1cXG4ubWFuYS5zYnAgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA3Ny43JSA2Ni42JTsgfVxcbi5tYW5hLnNycCB7IGJhY2tncm91bmQtcG9zaXRpb246IDg4LjglIDY2LjYlOyB9XFxuLm1hbmEuc2dwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogOTkuOSUgNjYuNiU7IH1cXG5cXG4ubWFuYS5zdCB7IGJhY2tncm91bmQtcG9zaXRpb246IDAlIDgzLjMlOyB9XFxuLm1hbmEuc3EgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAxMS4xJSA4My4zJTsgfVxcblxcbi5tYW5hLnNjIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNzcuNyUgODMuMyU7IH1cXG5cXG4ubWFuYS5zZSB7IGJhY2tncm91bmQtcG9zaXRpb246IDg4LjglIDgzLjMlOyB9XFxuXFxuLm1hbmEuczEwMDAwMDAgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwIDEwMCU7IH1cXG4ubWFuYS5zMTAwMDAwMC5zbWFsbCB7IHdpZHRoOiA0LjllbTsgfVxcbi5tYW5hLnMxMDAwMDAwLm1lZGl1bSB7IHdpZHRoOiA5LjdlbTsgfVxcbi8qLm1hbmEuczEwMDAwMDAubGFyZ2UgeyB3aWR0aDogMTguOGVtOyB9Ki9cXG4ubWFuYS5zMTAwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNjAlIDEwMCU7IH1cXG4ubWFuYS5zMTAwLnNtYWxsIHsgd2lkdGg6IDEuOGVtOyB9XFxuLm1hbmEuczEwMC5tZWRpdW0geyB3aWR0aDogMy43ZW07IH1cXG4vKi5tYW5hLnMxMDAubGFyZ2UgeyB3aWR0aDogMTAuOGVtOyB9Ki9cXG4ubWFuYS5zY2hhb3MgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA3Ni41JSAxMDAlOyB9XFxuLm1hbmEuc2NoYW9zLnNtYWxsIHsgd2lkdGg6IDEuMmVtOyB9XFxuLm1hbmEuc2NoYW9zLm1lZGl1bSB7IHdpZHRoOiAyLjNlbTsgfVxcbi8qLm1hbmEuc2MubGFyZ2UgeyB3aWR0aDogNC42ZW07IH0qL1xcbi5tYW5hLnNodyB7IGJhY2tncm91bmQtcG9zaXRpb246IDgzLjUlIDEwMCU7IH1cXG4ubWFuYS5zaHcuc21hbGwgeyB3aWR0aDogMC41ZW07IH1cXG4ubWFuYS5zaHcubWVkaXVtIHsgd2lkdGg6IDFlbTsgfVxcbi8qLm1hbmEuc2h3LmxhcmdlIHsgd2lkdGg6IDJlbTsgfSovXFxuLm1hbmEuc2hyIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogODklIDEwMCU7IH1cXG4ubWFuYS5zaHIuc21hbGwgeyB3aWR0aDogMC41ZW07IH1cXG4ubWFuYS5zaHIubWVkaXVtIHsgd2lkdGg6IDFlbTsgfVxcbi8qLm1hbmEuc2hyLmxhcmdlIHsgd2lkdGg6IDJlbTsgfSovXFxuXFxuXFxuLnNoYWRvdyB7XFxuICAgIGZpbHRlcjogXFxcInByb2dpZDpEWEltYWdlVHJhbnNmb3JtLk1pY3Jvc29mdC5Ecm9wc2hhZG93KE9mZlg9LTEsIE9mZlk9MSwgQ29sb3I9JyMwMDAnKVxcXCI7XFxuICAgIGZpbHRlcjogdXJsKCNzaGFkb3cpO1xcbiAgICAtd2Via2l0LWZpbHRlcjogZHJvcC1zaGFkb3coLTFweCAxcHggMHB4ICMwMDApO1xcbiAgICBmaWx0ZXI6IGRyb3Atc2hhZG93KC0xcHggMXB4IDBweCAjMDAwKTtcXG59XCIsIFwiXCIse1widmVyc2lvblwiOjMsXCJzb3VyY2VzXCI6W1wid2VicGFjazovLy4vc3JjL2Nzcy92ZW5kb3IvbWFuYS5jc3NcIl0sXCJuYW1lc1wiOltdLFwibWFwcGluZ3NcIjpcIkFBQUE7SUFDSSx5REFBd0Q7SUFDeEQsNEJBQTRCO0lBQzVCLDBCQUEwQjtJQUMxQixxQkFBcUI7SUFDckIsZUFBZTtBQUNuQjs7QUFFQTtJQUNJLGFBQWE7SUFDYixjQUFjO0FBQ2xCOztBQUVBO0lBQ0ksWUFBWTtJQUNaLFdBQVc7QUFDZjtBQUNBO0lBQ0ksV0FBVztJQUNYLFVBQVU7QUFDZDtBQUNBO0lBQ0ksV0FBVztJQUNYLFVBQVU7QUFDZDtBQUNBLFVBQVUsd0JBQXdCLEVBQUU7QUFDcEMsV0FBVyw0QkFBNEIsRUFBRTtBQUN6QyxXQUFXLDRCQUE0QixFQUFFO0FBQ3pDLFdBQVcsNEJBQTRCLEVBQUU7QUFDekMsV0FBVyw0QkFBNEIsRUFBRTtBQUN6QyxXQUFXLDRCQUE0QixFQUFFO0FBQ3pDLFdBQVcsNEJBQTRCLEVBQUU7QUFDekMsV0FBVyw0QkFBNEIsRUFBRTtBQUN6QyxXQUFXLDRCQUE0QixFQUFFO0FBQ3pDLFdBQVcsNEJBQTRCLEVBQUU7O0FBRXpDLFlBQVksMEJBQTBCLEVBQUU7QUFDeEMsWUFBWSxnQ0FBZ0MsRUFBRTtBQUM5QyxZQUFZLGdDQUFnQyxFQUFFO0FBQzlDLFlBQVksZ0NBQWdDLEVBQUU7QUFDOUMsWUFBWSxnQ0FBZ0MsRUFBRTtBQUM5QyxZQUFZLGdDQUFnQyxFQUFFO0FBQzlDLFlBQVksZ0NBQWdDLEVBQUU7QUFDOUMsWUFBWSxnQ0FBZ0MsRUFBRTtBQUM5QyxZQUFZLGdDQUFnQyxFQUFFO0FBQzlDLFlBQVksZ0NBQWdDLEVBQUU7O0FBRTlDLFlBQVksMEJBQTBCLEVBQUU7QUFDeEMsV0FBVyxnQ0FBZ0MsRUFBRTtBQUM3QyxXQUFXLGdDQUFnQyxFQUFFO0FBQzdDLFdBQVcsZ0NBQWdDLEVBQUU7QUFDN0MsV0FBVyxnQ0FBZ0MsRUFBRTtBQUM3QyxXQUFXLGdDQUFnQyxFQUFFO0FBQzdDLFdBQVcsZ0NBQWdDLEVBQUU7QUFDN0MsV0FBVyxnQ0FBZ0MsRUFBRTtBQUM3QyxXQUFXLGdDQUFnQyxFQUFFO0FBQzdDLFdBQVcsZ0NBQWdDLEVBQUU7O0FBRTdDLFlBQVksMEJBQTBCLEVBQUU7QUFDeEMsWUFBWSw4QkFBOEIsRUFBRTtBQUM1QyxZQUFZLDhCQUE4QixFQUFFO0FBQzVDLFlBQVksOEJBQThCLEVBQUU7QUFDNUMsWUFBWSw4QkFBOEIsRUFBRTtBQUM1QyxZQUFZLDhCQUE4QixFQUFFO0FBQzVDLFlBQVksOEJBQThCLEVBQUU7QUFDNUMsWUFBWSw4QkFBOEIsRUFBRTtBQUM1QyxZQUFZLDhCQUE4QixFQUFFO0FBQzVDLFlBQVksOEJBQThCLEVBQUU7O0FBRTVDLFlBQVksNEJBQTRCLEVBQUU7QUFDMUMsWUFBWSxnQ0FBZ0MsRUFBRTtBQUM5QyxZQUFZLGdDQUFnQyxFQUFFO0FBQzlDLFlBQVksZ0NBQWdDLEVBQUU7QUFDOUMsWUFBWSxnQ0FBZ0MsRUFBRTtBQUM5QyxZQUFZLGdDQUFnQyxFQUFFO0FBQzlDLFlBQVksZ0NBQWdDLEVBQUU7QUFDOUMsWUFBWSxnQ0FBZ0MsRUFBRTtBQUM5QyxZQUFZLGdDQUFnQyxFQUFFO0FBQzlDLFlBQVksZ0NBQWdDLEVBQUU7O0FBRTlDLFdBQVcsNkJBQTZCLEVBQUU7QUFDMUMsV0FBVyxnQ0FBZ0MsRUFBRTs7QUFFN0MsV0FBVyxnQ0FBZ0MsRUFBRTs7QUFFN0MsV0FBVyxnQ0FBZ0MsRUFBRTs7QUFFN0MsaUJBQWlCLDJCQUEyQixFQUFFO0FBQzlDLHVCQUF1QixZQUFZLEVBQUU7QUFDckMsd0JBQXdCLFlBQVksRUFBRTtBQUN0QywwQ0FBMEM7QUFDMUMsYUFBYSw2QkFBNkIsRUFBRTtBQUM1QyxtQkFBbUIsWUFBWSxFQUFFO0FBQ2pDLG9CQUFvQixZQUFZLEVBQUU7QUFDbEMsc0NBQXNDO0FBQ3RDLGVBQWUsK0JBQStCLEVBQUU7QUFDaEQscUJBQXFCLFlBQVksRUFBRTtBQUNuQyxzQkFBc0IsWUFBWSxFQUFFO0FBQ3BDLG1DQUFtQztBQUNuQyxZQUFZLCtCQUErQixFQUFFO0FBQzdDLGtCQUFrQixZQUFZLEVBQUU7QUFDaEMsbUJBQW1CLFVBQVUsRUFBRTtBQUMvQixrQ0FBa0M7QUFDbEMsWUFBWSw2QkFBNkIsRUFBRTtBQUMzQyxrQkFBa0IsWUFBWSxFQUFFO0FBQ2hDLG1CQUFtQixVQUFVLEVBQUU7QUFDL0Isa0NBQWtDOzs7QUFHbEM7SUFDSSxxRkFBcUY7SUFDckYsb0JBQW9CO0lBQ3BCLDhDQUE4QztJQUM5QyxzQ0FBc0M7QUFDMUNcIixcInNvdXJjZXNDb250ZW50XCI6W1wiLm1hbmEge1xcbiAgICBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoJy4uLy4uL2ltZy9tYW5hLXN5bWJvbHMvbWFuYS5zdmcnKTtcXG4gICAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcXG4gICAgYmFja2dyb3VuZC1zaXplOiBhdXRvIDcwMCU7XFxuICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gICAgZm9udC1zaXplOiAxMDAlO1xcbn1cXG5cXG4ubWFuYS54cyB7XFxuICAgIHdpZHRoOiAxLjVyZW07XFxuICAgIGhlaWdodDogMS41cmVtO1xcbn1cXG5cXG4ubWFuYS5zbWFsbCB7XFxuICAgIGhlaWdodDogMnJlbTtcXG4gICAgd2lkdGg6IDJyZW07XFxufVxcbi5tYW5hLm1lZGl1bSB7XFxuICAgIGhlaWdodDogMmVtO1xcbiAgICB3aWR0aDogMmVtO1xcbn1cXG4ubWFuYS5sYXJnZSB7XFxuICAgIGhlaWdodDogNGVtO1xcbiAgICB3aWR0aDogNGVtO1xcbn1cXG4ubWFuYS5zIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMCAwOyB9XFxuLm1hbmEuczEgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAxMS4xJSAwOyB9XFxuLm1hbmEuczIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAyMi4yJSAwOyB9XFxuLm1hbmEuczMgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAzMy4zJSAwOyB9XFxuLm1hbmEuczQgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA0NC40JSAwOyB9XFxuLm1hbmEuczUgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA1NS41JSAwOyB9XFxuLm1hbmEuczYgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA2Ni42JSAwOyB9XFxuLm1hbmEuczcgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA3Ny43JSAwOyB9XFxuLm1hbmEuczggeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4OC44JSAwOyB9XFxuLm1hbmEuczkgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA5OS45JSAwOyB9XFxuXFxuLm1hbmEuczEwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMCAxNiU7IH1cXG4ubWFuYS5zMTEgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAxMS4xJSAxNi42JTsgfVxcbi5tYW5hLnMxMiB7IGJhY2tncm91bmQtcG9zaXRpb246IDIyLjIlIDE2LjYlOyB9XFxuLm1hbmEuczEzIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMzMuMyUgMTYuNiU7IH1cXG4ubWFuYS5zMTQgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA0NC40JSAxNi42JTsgfVxcbi5tYW5hLnMxNSB7IGJhY2tncm91bmQtcG9zaXRpb246IDU1LjUlIDE2LjYlOyB9XFxuLm1hbmEuczE2IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNjYuNiUgMTYuNiU7IH1cXG4ubWFuYS5zMTcgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA3Ny43JSAxNi42JTsgfVxcbi5tYW5hLnMxOCB7IGJhY2tncm91bmQtcG9zaXRpb246IDg4LjglIDE2LjYlOyB9XFxuLm1hbmEuczE5IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogOTkuOSUgMTYuNiU7IH1cXG5cXG4ubWFuYS5zMjAgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwIDMzJTsgfVxcbi5tYW5hLnN4IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMTEuMSUgMzMuMyU7IH1cXG4ubWFuYS5zeSB7IGJhY2tncm91bmQtcG9zaXRpb246IDIyLjIlIDMzLjMlOyB9XFxuLm1hbmEuc3ogeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAzMy4zJSAzMy4zJTsgfVxcbi5tYW5hLnN3IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNDQuNCUgMzMuMyU7IH1cXG4ubWFuYS5zdSB7IGJhY2tncm91bmQtcG9zaXRpb246IDU1LjUlIDMzLjMlOyB9XFxuLm1hbmEuc2IgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA2Ni42JSAzMy4zJTsgfVxcbi5tYW5hLnNyIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNzcuNyUgMzMuMyU7IH1cXG4ubWFuYS5zZyB7IGJhY2tncm91bmQtcG9zaXRpb246IDg4LjglIDMzLjMlOyB9XFxuLm1hbmEuc3MgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA5OS45JSAzMy4zJTsgfVxcblxcbi5tYW5hLnN3dSB7IGJhY2tncm91bmQtcG9zaXRpb246IDAgNTAlOyB9XFxuLm1hbmEuc3diIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMTEuMSUgNTAlOyB9XFxuLm1hbmEuc3ViIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMjIuMiUgNTAlOyB9XFxuLm1hbmEuc3VyIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMzMuMyUgNTAlOyB9XFxuLm1hbmEuc2JyIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNDQuNCUgNTAlOyB9XFxuLm1hbmEuc2JnIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNTUuNSUgNTAlOyB9XFxuLm1hbmEuc3J3IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNjYuNiUgNTAlOyB9XFxuLm1hbmEuc3JnIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNzcuNyUgNTAlOyB9XFxuLm1hbmEuc2d3IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogODguOCUgNTAlOyB9XFxuLm1hbmEuc2d1IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogOTkuOSUgNTAlOyB9XFxuXFxuLm1hbmEuczJ3IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMCA2Ni42JTsgfVxcbi5tYW5hLnMydSB7IGJhY2tncm91bmQtcG9zaXRpb246IDExLjElIDY2LjYlOyB9XFxuLm1hbmEuczJiIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMjIuMiUgNjYuNiU7IH1cXG4ubWFuYS5zMnIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAzMy4zJSA2Ni42JTsgfVxcbi5tYW5hLnMyZyB7IGJhY2tncm91bmQtcG9zaXRpb246IDQ0LjQlIDY2LjYlOyB9XFxuLm1hbmEuc3dwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNTUuNSUgNjYuNiU7IH1cXG4ubWFuYS5zdXAgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA2Ni42JSA2Ni42JTsgfVxcbi5tYW5hLnNicCB7IGJhY2tncm91bmQtcG9zaXRpb246IDc3LjclIDY2LjYlOyB9XFxuLm1hbmEuc3JwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogODguOCUgNjYuNiU7IH1cXG4ubWFuYS5zZ3AgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA5OS45JSA2Ni42JTsgfVxcblxcbi5tYW5hLnN0IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMCUgODMuMyU7IH1cXG4ubWFuYS5zcSB7IGJhY2tncm91bmQtcG9zaXRpb246IDExLjElIDgzLjMlOyB9XFxuXFxuLm1hbmEuc2MgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA3Ny43JSA4My4zJTsgfVxcblxcbi5tYW5hLnNlIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogODguOCUgODMuMyU7IH1cXG5cXG4ubWFuYS5zMTAwMDAwMCB7IGJhY2tncm91bmQtcG9zaXRpb246IDAgMTAwJTsgfVxcbi5tYW5hLnMxMDAwMDAwLnNtYWxsIHsgd2lkdGg6IDQuOWVtOyB9XFxuLm1hbmEuczEwMDAwMDAubWVkaXVtIHsgd2lkdGg6IDkuN2VtOyB9XFxuLyoubWFuYS5zMTAwMDAwMC5sYXJnZSB7IHdpZHRoOiAxOC44ZW07IH0qL1xcbi5tYW5hLnMxMDAgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA2MCUgMTAwJTsgfVxcbi5tYW5hLnMxMDAuc21hbGwgeyB3aWR0aDogMS44ZW07IH1cXG4ubWFuYS5zMTAwLm1lZGl1bSB7IHdpZHRoOiAzLjdlbTsgfVxcbi8qLm1hbmEuczEwMC5sYXJnZSB7IHdpZHRoOiAxMC44ZW07IH0qL1xcbi5tYW5hLnNjaGFvcyB7IGJhY2tncm91bmQtcG9zaXRpb246IDc2LjUlIDEwMCU7IH1cXG4ubWFuYS5zY2hhb3Muc21hbGwgeyB3aWR0aDogMS4yZW07IH1cXG4ubWFuYS5zY2hhb3MubWVkaXVtIHsgd2lkdGg6IDIuM2VtOyB9XFxuLyoubWFuYS5zYy5sYXJnZSB7IHdpZHRoOiA0LjZlbTsgfSovXFxuLm1hbmEuc2h3IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogODMuNSUgMTAwJTsgfVxcbi5tYW5hLnNody5zbWFsbCB7IHdpZHRoOiAwLjVlbTsgfVxcbi5tYW5hLnNody5tZWRpdW0geyB3aWR0aDogMWVtOyB9XFxuLyoubWFuYS5zaHcubGFyZ2UgeyB3aWR0aDogMmVtOyB9Ki9cXG4ubWFuYS5zaHIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4OSUgMTAwJTsgfVxcbi5tYW5hLnNoci5zbWFsbCB7IHdpZHRoOiAwLjVlbTsgfVxcbi5tYW5hLnNoci5tZWRpdW0geyB3aWR0aDogMWVtOyB9XFxuLyoubWFuYS5zaHIubGFyZ2UgeyB3aWR0aDogMmVtOyB9Ki9cXG5cXG5cXG4uc2hhZG93IHtcXG4gICAgZmlsdGVyOiBcXFwicHJvZ2lkOkRYSW1hZ2VUcmFuc2Zvcm0uTWljcm9zb2Z0LkRyb3BzaGFkb3coT2ZmWD0tMSwgT2ZmWT0xLCBDb2xvcj0nIzAwMCcpXFxcIjtcXG4gICAgZmlsdGVyOiB1cmwoI3NoYWRvdyk7XFxuICAgIC13ZWJraXQtZmlsdGVyOiBkcm9wLXNoYWRvdygtMXB4IDFweCAwcHggIzAwMCk7XFxuICAgIGZpbHRlcjogZHJvcC1zaGFkb3coLTFweCAxcHggMHB4ICMwMDApO1xcbn1cIl0sXCJzb3VyY2VSb290XCI6XCJcIn1dKTtcbi8vIEV4cG9ydHNcbmV4cG9ydCBkZWZhdWx0IF9fX0NTU19MT0FERVJfRVhQT1JUX19fO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4gIE1JVCBMaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4gIEF1dGhvciBUb2JpYXMgS29wcGVycyBAc29rcmFcbiovXG4vLyBjc3MgYmFzZSBjb2RlLCBpbmplY3RlZCBieSB0aGUgY3NzLWxvYWRlclxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGZ1bmMtbmFtZXNcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcpIHtcbiAgdmFyIGxpc3QgPSBbXTsgLy8gcmV0dXJuIHRoZSBsaXN0IG9mIG1vZHVsZXMgYXMgY3NzIHN0cmluZ1xuXG4gIGxpc3QudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHZhciBjb250ZW50ID0gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtKTtcblxuICAgICAgaWYgKGl0ZW1bMl0pIHtcbiAgICAgICAgcmV0dXJuIFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpLmNvbmNhdChjb250ZW50LCBcIn1cIik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjb250ZW50O1xuICAgIH0pLmpvaW4oJycpO1xuICB9OyAvLyBpbXBvcnQgYSBsaXN0IG9mIG1vZHVsZXMgaW50byB0aGUgbGlzdFxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuXG5cbiAgbGlzdC5pID0gZnVuY3Rpb24gKG1vZHVsZXMsIG1lZGlhUXVlcnksIGRlZHVwZSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlcyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICAgICAgbW9kdWxlcyA9IFtbbnVsbCwgbW9kdWxlcywgJyddXTtcbiAgICB9XG5cbiAgICB2YXIgYWxyZWFkeUltcG9ydGVkTW9kdWxlcyA9IHt9O1xuXG4gICAgaWYgKGRlZHVwZSkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBwcmVmZXItZGVzdHJ1Y3R1cmluZ1xuICAgICAgICB2YXIgaWQgPSB0aGlzW2ldWzBdO1xuXG4gICAgICAgIGlmIChpZCAhPSBudWxsKSB7XG4gICAgICAgICAgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpZF0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IG1vZHVsZXMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICB2YXIgaXRlbSA9IFtdLmNvbmNhdChtb2R1bGVzW19pXSk7XG5cbiAgICAgIGlmIChkZWR1cGUgJiYgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpdGVtWzBdXSkge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29udGludWVcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChtZWRpYVF1ZXJ5KSB7XG4gICAgICAgIGlmICghaXRlbVsyXSkge1xuICAgICAgICAgIGl0ZW1bMl0gPSBtZWRpYVF1ZXJ5O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMl0gPSBcIlwiLmNvbmNhdChtZWRpYVF1ZXJ5LCBcIiBhbmQgXCIpLmNvbmNhdChpdGVtWzJdKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBsaXN0LnB1c2goaXRlbSk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBsaXN0O1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gX3NsaWNlZFRvQXJyYXkoYXJyLCBpKSB7IHJldHVybiBfYXJyYXlXaXRoSG9sZXMoYXJyKSB8fCBfaXRlcmFibGVUb0FycmF5TGltaXQoYXJyLCBpKSB8fCBfdW5zdXBwb3J0ZWRJdGVyYWJsZVRvQXJyYXkoYXJyLCBpKSB8fCBfbm9uSXRlcmFibGVSZXN0KCk7IH1cblxuZnVuY3Rpb24gX25vbkl0ZXJhYmxlUmVzdCgpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgYXR0ZW1wdCB0byBkZXN0cnVjdHVyZSBub24taXRlcmFibGUgaW5zdGFuY2UuXFxuSW4gb3JkZXIgdG8gYmUgaXRlcmFibGUsIG5vbi1hcnJheSBvYmplY3RzIG11c3QgaGF2ZSBhIFtTeW1ib2wuaXRlcmF0b3JdKCkgbWV0aG9kLlwiKTsgfVxuXG5mdW5jdGlvbiBfdW5zdXBwb3J0ZWRJdGVyYWJsZVRvQXJyYXkobywgbWluTGVuKSB7IGlmICghbykgcmV0dXJuOyBpZiAodHlwZW9mIG8gPT09IFwic3RyaW5nXCIpIHJldHVybiBfYXJyYXlMaWtlVG9BcnJheShvLCBtaW5MZW4pOyB2YXIgbiA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKS5zbGljZSg4LCAtMSk7IGlmIChuID09PSBcIk9iamVjdFwiICYmIG8uY29uc3RydWN0b3IpIG4gPSBvLmNvbnN0cnVjdG9yLm5hbWU7IGlmIChuID09PSBcIk1hcFwiIHx8IG4gPT09IFwiU2V0XCIpIHJldHVybiBBcnJheS5mcm9tKG8pOyBpZiAobiA9PT0gXCJBcmd1bWVudHNcIiB8fCAvXig/OlVpfEkpbnQoPzo4fDE2fDMyKSg/OkNsYW1wZWQpP0FycmF5JC8udGVzdChuKSkgcmV0dXJuIF9hcnJheUxpa2VUb0FycmF5KG8sIG1pbkxlbik7IH1cblxuZnVuY3Rpb24gX2FycmF5TGlrZVRvQXJyYXkoYXJyLCBsZW4pIHsgaWYgKGxlbiA9PSBudWxsIHx8IGxlbiA+IGFyci5sZW5ndGgpIGxlbiA9IGFyci5sZW5ndGg7IGZvciAodmFyIGkgPSAwLCBhcnIyID0gbmV3IEFycmF5KGxlbik7IGkgPCBsZW47IGkrKykgeyBhcnIyW2ldID0gYXJyW2ldOyB9IHJldHVybiBhcnIyOyB9XG5cbmZ1bmN0aW9uIF9pdGVyYWJsZVRvQXJyYXlMaW1pdChhcnIsIGkpIHsgaWYgKHR5cGVvZiBTeW1ib2wgPT09IFwidW5kZWZpbmVkXCIgfHwgIShTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KGFycikpKSByZXR1cm47IHZhciBfYXJyID0gW107IHZhciBfbiA9IHRydWU7IHZhciBfZCA9IGZhbHNlOyB2YXIgX2UgPSB1bmRlZmluZWQ7IHRyeSB7IGZvciAodmFyIF9pID0gYXJyW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3M7ICEoX24gPSAoX3MgPSBfaS5uZXh0KCkpLmRvbmUpOyBfbiA9IHRydWUpIHsgX2Fyci5wdXNoKF9zLnZhbHVlKTsgaWYgKGkgJiYgX2Fyci5sZW5ndGggPT09IGkpIGJyZWFrOyB9IH0gY2F0Y2ggKGVycikgeyBfZCA9IHRydWU7IF9lID0gZXJyOyB9IGZpbmFsbHkgeyB0cnkgeyBpZiAoIV9uICYmIF9pW1wicmV0dXJuXCJdICE9IG51bGwpIF9pW1wicmV0dXJuXCJdKCk7IH0gZmluYWxseSB7IGlmIChfZCkgdGhyb3cgX2U7IH0gfSByZXR1cm4gX2FycjsgfVxuXG5mdW5jdGlvbiBfYXJyYXlXaXRoSG9sZXMoYXJyKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHJldHVybiBhcnI7IH1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKGl0ZW0pIHtcbiAgdmFyIF9pdGVtID0gX3NsaWNlZFRvQXJyYXkoaXRlbSwgNCksXG4gICAgICBjb250ZW50ID0gX2l0ZW1bMV0sXG4gICAgICBjc3NNYXBwaW5nID0gX2l0ZW1bM107XG5cbiAgaWYgKHR5cGVvZiBidG9hID09PSAnZnVuY3Rpb24nKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG4gICAgdmFyIGJhc2U2NCA9IGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KGNzc01hcHBpbmcpKSkpO1xuICAgIHZhciBkYXRhID0gXCJzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04O2Jhc2U2NCxcIi5jb25jYXQoYmFzZTY0KTtcbiAgICB2YXIgc291cmNlTWFwcGluZyA9IFwiLyojIFwiLmNvbmNhdChkYXRhLCBcIiAqL1wiKTtcbiAgICB2YXIgc291cmNlVVJMcyA9IGNzc01hcHBpbmcuc291cmNlcy5tYXAoZnVuY3Rpb24gKHNvdXJjZSkge1xuICAgICAgcmV0dXJuIFwiLyojIHNvdXJjZVVSTD1cIi5jb25jYXQoY3NzTWFwcGluZy5zb3VyY2VSb290IHx8ICcnKS5jb25jYXQoc291cmNlLCBcIiAqL1wiKTtcbiAgICB9KTtcbiAgICByZXR1cm4gW2NvbnRlbnRdLmNvbmNhdChzb3VyY2VVUkxzKS5jb25jYXQoW3NvdXJjZU1hcHBpbmddKS5qb2luKCdcXG4nKTtcbiAgfVxuXG4gIHJldHVybiBbY29udGVudF0uam9pbignXFxuJyk7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh1cmwsIG9wdGlvbnMpIHtcbiAgaWYgKCFvcHRpb25zKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gICAgb3B0aW9ucyA9IHt9O1xuICB9IC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlcnNjb3JlLWRhbmdsZSwgbm8tcGFyYW0tcmVhc3NpZ25cblxuXG4gIHVybCA9IHVybCAmJiB1cmwuX19lc01vZHVsZSA/IHVybC5kZWZhdWx0IDogdXJsO1xuXG4gIGlmICh0eXBlb2YgdXJsICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiB1cmw7XG4gIH0gLy8gSWYgdXJsIGlzIGFscmVhZHkgd3JhcHBlZCBpbiBxdW90ZXMsIHJlbW92ZSB0aGVtXG5cblxuICBpZiAoL15bJ1wiXS4qWydcIl0kLy50ZXN0KHVybCkpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgICB1cmwgPSB1cmwuc2xpY2UoMSwgLTEpO1xuICB9XG5cbiAgaWYgKG9wdGlvbnMuaGFzaCkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICAgIHVybCArPSBvcHRpb25zLmhhc2g7XG4gIH0gLy8gU2hvdWxkIHVybCBiZSB3cmFwcGVkP1xuICAvLyBTZWUgaHR0cHM6Ly9kcmFmdHMuY3Nzd2cub3JnL2Nzcy12YWx1ZXMtMy8jdXJsc1xuXG5cbiAgaWYgKC9bXCInKCkgXFx0XFxuXS8udGVzdCh1cmwpIHx8IG9wdGlvbnMubmVlZFF1b3Rlcykge1xuICAgIHJldHVybiBcIlxcXCJcIi5jb25jYXQodXJsLnJlcGxhY2UoL1wiL2csICdcXFxcXCInKS5yZXBsYWNlKC9cXG4vZywgJ1xcXFxuJyksIFwiXFxcIlwiKTtcbiAgfVxuXG4gIHJldHVybiB1cmw7XG59OyIsImV4cG9ydCBkZWZhdWx0IF9fd2VicGFja19wdWJsaWNfcGF0aF9fICsgXCI4ZjRiOWQwNDc2ZTYyMGQxZmVmNTBjOTUwNDQzNjQ1Ni5zdmdcIjsiLCJleHBvcnQgZGVmYXVsdCBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiYzg5YTAzMDVjNmViZmYzODU4ODc4ZGY2MTM2ODc2N2Euc3ZnXCI7IiwiaW1wb3J0IGFwaSBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qc1wiO1xuICAgICAgICAgICAgaW1wb3J0IGNvbnRlbnQgZnJvbSBcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi9zdHlsZS5jc3NcIjtcblxudmFyIG9wdGlvbnMgPSB7fTtcblxub3B0aW9ucy5pbnNlcnQgPSBcImhlYWRcIjtcbm9wdGlvbnMuc2luZ2xldG9uID0gZmFsc2U7XG5cbnZhciB1cGRhdGUgPSBhcGkoY29udGVudCwgb3B0aW9ucyk7XG5cblxuXG5leHBvcnQgZGVmYXVsdCBjb250ZW50LmxvY2FscyB8fCB7fTsiLCJpbXBvcnQgYXBpIGZyb20gXCIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzXCI7XG4gICAgICAgICAgICBpbXBvcnQgY29udGVudCBmcm9tIFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL21hbmEuY3NzXCI7XG5cbnZhciBvcHRpb25zID0ge307XG5cbm9wdGlvbnMuaW5zZXJ0ID0gXCJoZWFkXCI7XG5vcHRpb25zLnNpbmdsZXRvbiA9IGZhbHNlO1xuXG52YXIgdXBkYXRlID0gYXBpKGNvbnRlbnQsIG9wdGlvbnMpO1xuXG5cblxuZXhwb3J0IGRlZmF1bHQgY29udGVudC5sb2NhbHMgfHwge307IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBpc09sZElFID0gZnVuY3Rpb24gaXNPbGRJRSgpIHtcbiAgdmFyIG1lbW87XG4gIHJldHVybiBmdW5jdGlvbiBtZW1vcml6ZSgpIHtcbiAgICBpZiAodHlwZW9mIG1lbW8gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAvLyBUZXN0IGZvciBJRSA8PSA5IGFzIHByb3Bvc2VkIGJ5IEJyb3dzZXJoYWNrc1xuICAgICAgLy8gQHNlZSBodHRwOi8vYnJvd3NlcmhhY2tzLmNvbS8jaGFjay1lNzFkODY5MmY2NTMzNDE3M2ZlZTcxNWMyMjJjYjgwNVxuICAgICAgLy8gVGVzdHMgZm9yIGV4aXN0ZW5jZSBvZiBzdGFuZGFyZCBnbG9iYWxzIGlzIHRvIGFsbG93IHN0eWxlLWxvYWRlclxuICAgICAgLy8gdG8gb3BlcmF0ZSBjb3JyZWN0bHkgaW50byBub24tc3RhbmRhcmQgZW52aXJvbm1lbnRzXG4gICAgICAvLyBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS93ZWJwYWNrLWNvbnRyaWIvc3R5bGUtbG9hZGVyL2lzc3Vlcy8xNzdcbiAgICAgIG1lbW8gPSBCb29sZWFuKHdpbmRvdyAmJiBkb2N1bWVudCAmJiBkb2N1bWVudC5hbGwgJiYgIXdpbmRvdy5hdG9iKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWVtbztcbiAgfTtcbn0oKTtcblxudmFyIGdldFRhcmdldCA9IGZ1bmN0aW9uIGdldFRhcmdldCgpIHtcbiAgdmFyIG1lbW8gPSB7fTtcbiAgcmV0dXJuIGZ1bmN0aW9uIG1lbW9yaXplKHRhcmdldCkge1xuICAgIGlmICh0eXBlb2YgbWVtb1t0YXJnZXRdID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdmFyIHN0eWxlVGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpOyAvLyBTcGVjaWFsIGNhc2UgdG8gcmV0dXJuIGhlYWQgb2YgaWZyYW1lIGluc3RlYWQgb2YgaWZyYW1lIGl0c2VsZlxuXG4gICAgICBpZiAod2luZG93LkhUTUxJRnJhbWVFbGVtZW50ICYmIHN0eWxlVGFyZ2V0IGluc3RhbmNlb2Ygd2luZG93LkhUTUxJRnJhbWVFbGVtZW50KSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgLy8gVGhpcyB3aWxsIHRocm93IGFuIGV4Y2VwdGlvbiBpZiBhY2Nlc3MgdG8gaWZyYW1lIGlzIGJsb2NrZWRcbiAgICAgICAgICAvLyBkdWUgdG8gY3Jvc3Mtb3JpZ2luIHJlc3RyaWN0aW9uc1xuICAgICAgICAgIHN0eWxlVGFyZ2V0ID0gc3R5bGVUYXJnZXQuY29udGVudERvY3VtZW50LmhlYWQ7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAvLyBpc3RhbmJ1bCBpZ25vcmUgbmV4dFxuICAgICAgICAgIHN0eWxlVGFyZ2V0ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBtZW1vW3RhcmdldF0gPSBzdHlsZVRhcmdldDtcbiAgICB9XG5cbiAgICByZXR1cm4gbWVtb1t0YXJnZXRdO1xuICB9O1xufSgpO1xuXG52YXIgc3R5bGVzSW5Eb20gPSBbXTtcblxuZnVuY3Rpb24gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcikge1xuICB2YXIgcmVzdWx0ID0gLTE7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHlsZXNJbkRvbS5sZW5ndGg7IGkrKykge1xuICAgIGlmIChzdHlsZXNJbkRvbVtpXS5pZGVudGlmaWVyID09PSBpZGVudGlmaWVyKSB7XG4gICAgICByZXN1bHQgPSBpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gbW9kdWxlc1RvRG9tKGxpc3QsIG9wdGlvbnMpIHtcbiAgdmFyIGlkQ291bnRNYXAgPSB7fTtcbiAgdmFyIGlkZW50aWZpZXJzID0gW107XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSBsaXN0W2ldO1xuICAgIHZhciBpZCA9IG9wdGlvbnMuYmFzZSA/IGl0ZW1bMF0gKyBvcHRpb25zLmJhc2UgOiBpdGVtWzBdO1xuICAgIHZhciBjb3VudCA9IGlkQ291bnRNYXBbaWRdIHx8IDA7XG4gICAgdmFyIGlkZW50aWZpZXIgPSBcIlwiLmNvbmNhdChpZCwgXCIgXCIpLmNvbmNhdChjb3VudCk7XG4gICAgaWRDb3VudE1hcFtpZF0gPSBjb3VudCArIDE7XG4gICAgdmFyIGluZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gICAgdmFyIG9iaiA9IHtcbiAgICAgIGNzczogaXRlbVsxXSxcbiAgICAgIG1lZGlhOiBpdGVtWzJdLFxuICAgICAgc291cmNlTWFwOiBpdGVtWzNdXG4gICAgfTtcblxuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgIHN0eWxlc0luRG9tW2luZGV4XS5yZWZlcmVuY2VzKys7XG4gICAgICBzdHlsZXNJbkRvbVtpbmRleF0udXBkYXRlcihvYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHlsZXNJbkRvbS5wdXNoKHtcbiAgICAgICAgaWRlbnRpZmllcjogaWRlbnRpZmllcixcbiAgICAgICAgdXBkYXRlcjogYWRkU3R5bGUob2JqLCBvcHRpb25zKSxcbiAgICAgICAgcmVmZXJlbmNlczogMVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWRlbnRpZmllcnMucHVzaChpZGVudGlmaWVyKTtcbiAgfVxuXG4gIHJldHVybiBpZGVudGlmaWVycztcbn1cblxuZnVuY3Rpb24gaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpIHtcbiAgdmFyIHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgdmFyIGF0dHJpYnV0ZXMgPSBvcHRpb25zLmF0dHJpYnV0ZXMgfHwge307XG5cbiAgaWYgKHR5cGVvZiBhdHRyaWJ1dGVzLm5vbmNlID09PSAndW5kZWZpbmVkJykge1xuICAgIHZhciBub25jZSA9IHR5cGVvZiBfX3dlYnBhY2tfbm9uY2VfXyAhPT0gJ3VuZGVmaW5lZCcgPyBfX3dlYnBhY2tfbm9uY2VfXyA6IG51bGw7XG5cbiAgICBpZiAobm9uY2UpIHtcbiAgICAgIGF0dHJpYnV0ZXMubm9uY2UgPSBub25jZTtcbiAgICB9XG4gIH1cblxuICBPYmplY3Qua2V5cyhhdHRyaWJ1dGVzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICBzdHlsZS5zZXRBdHRyaWJ1dGUoa2V5LCBhdHRyaWJ1dGVzW2tleV0pO1xuICB9KTtcblxuICBpZiAodHlwZW9mIG9wdGlvbnMuaW5zZXJ0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgb3B0aW9ucy5pbnNlcnQoc3R5bGUpO1xuICB9IGVsc2Uge1xuICAgIHZhciB0YXJnZXQgPSBnZXRUYXJnZXQob3B0aW9ucy5pbnNlcnQgfHwgJ2hlYWQnKTtcblxuICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZG4ndCBmaW5kIGEgc3R5bGUgdGFyZ2V0LiBUaGlzIHByb2JhYmx5IG1lYW5zIHRoYXQgdGhlIHZhbHVlIGZvciB0aGUgJ2luc2VydCcgcGFyYW1ldGVyIGlzIGludmFsaWQuXCIpO1xuICAgIH1cblxuICAgIHRhcmdldC5hcHBlbmRDaGlsZChzdHlsZSk7XG4gIH1cblxuICByZXR1cm4gc3R5bGU7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZSkge1xuICAvLyBpc3RhbmJ1bCBpZ25vcmUgaWZcbiAgaWYgKHN0eWxlLnBhcmVudE5vZGUgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBzdHlsZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHN0eWxlKTtcbn1cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuXG5cbnZhciByZXBsYWNlVGV4dCA9IGZ1bmN0aW9uIHJlcGxhY2VUZXh0KCkge1xuICB2YXIgdGV4dFN0b3JlID0gW107XG4gIHJldHVybiBmdW5jdGlvbiByZXBsYWNlKGluZGV4LCByZXBsYWNlbWVudCkge1xuICAgIHRleHRTdG9yZVtpbmRleF0gPSByZXBsYWNlbWVudDtcbiAgICByZXR1cm4gdGV4dFN0b3JlLmZpbHRlcihCb29sZWFuKS5qb2luKCdcXG4nKTtcbiAgfTtcbn0oKTtcblxuZnVuY3Rpb24gYXBwbHlUb1NpbmdsZXRvblRhZyhzdHlsZSwgaW5kZXgsIHJlbW92ZSwgb2JqKSB7XG4gIHZhciBjc3MgPSByZW1vdmUgPyAnJyA6IG9iai5tZWRpYSA/IFwiQG1lZGlhIFwiLmNvbmNhdChvYmoubWVkaWEsIFwiIHtcIikuY29uY2F0KG9iai5jc3MsIFwifVwiKSA6IG9iai5jc3M7IC8vIEZvciBvbGQgSUVcblxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgICovXG5cbiAgaWYgKHN0eWxlLnN0eWxlU2hlZXQpIHtcbiAgICBzdHlsZS5zdHlsZVNoZWV0LmNzc1RleHQgPSByZXBsYWNlVGV4dChpbmRleCwgY3NzKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgY3NzTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcyk7XG4gICAgdmFyIGNoaWxkTm9kZXMgPSBzdHlsZS5jaGlsZE5vZGVzO1xuXG4gICAgaWYgKGNoaWxkTm9kZXNbaW5kZXhdKSB7XG4gICAgICBzdHlsZS5yZW1vdmVDaGlsZChjaGlsZE5vZGVzW2luZGV4XSk7XG4gICAgfVxuXG4gICAgaWYgKGNoaWxkTm9kZXMubGVuZ3RoKSB7XG4gICAgICBzdHlsZS5pbnNlcnRCZWZvcmUoY3NzTm9kZSwgY2hpbGROb2Rlc1tpbmRleF0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHlsZS5hcHBlbmRDaGlsZChjc3NOb2RlKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gYXBwbHlUb1RhZyhzdHlsZSwgb3B0aW9ucywgb2JqKSB7XG4gIHZhciBjc3MgPSBvYmouY3NzO1xuICB2YXIgbWVkaWEgPSBvYmoubWVkaWE7XG4gIHZhciBzb3VyY2VNYXAgPSBvYmouc291cmNlTWFwO1xuXG4gIGlmIChtZWRpYSkge1xuICAgIHN0eWxlLnNldEF0dHJpYnV0ZSgnbWVkaWEnLCBtZWRpYSk7XG4gIH0gZWxzZSB7XG4gICAgc3R5bGUucmVtb3ZlQXR0cmlidXRlKCdtZWRpYScpO1xuICB9XG5cbiAgaWYgKHNvdXJjZU1hcCAmJiB0eXBlb2YgYnRvYSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBjc3MgKz0gXCJcXG4vKiMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LFwiLmNvbmNhdChidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShzb3VyY2VNYXApKSkpLCBcIiAqL1wiKTtcbiAgfSAvLyBGb3Igb2xkIElFXG5cbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICAqL1xuXG5cbiAgaWYgKHN0eWxlLnN0eWxlU2hlZXQpIHtcbiAgICBzdHlsZS5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3M7XG4gIH0gZWxzZSB7XG4gICAgd2hpbGUgKHN0eWxlLmZpcnN0Q2hpbGQpIHtcbiAgICAgIHN0eWxlLnJlbW92ZUNoaWxkKHN0eWxlLmZpcnN0Q2hpbGQpO1xuICAgIH1cblxuICAgIHN0eWxlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcykpO1xuICB9XG59XG5cbnZhciBzaW5nbGV0b24gPSBudWxsO1xudmFyIHNpbmdsZXRvbkNvdW50ZXIgPSAwO1xuXG5mdW5jdGlvbiBhZGRTdHlsZShvYmosIG9wdGlvbnMpIHtcbiAgdmFyIHN0eWxlO1xuICB2YXIgdXBkYXRlO1xuICB2YXIgcmVtb3ZlO1xuXG4gIGlmIChvcHRpb25zLnNpbmdsZXRvbikge1xuICAgIHZhciBzdHlsZUluZGV4ID0gc2luZ2xldG9uQ291bnRlcisrO1xuICAgIHN0eWxlID0gc2luZ2xldG9uIHx8IChzaW5nbGV0b24gPSBpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucykpO1xuICAgIHVwZGF0ZSA9IGFwcGx5VG9TaW5nbGV0b25UYWcuYmluZChudWxsLCBzdHlsZSwgc3R5bGVJbmRleCwgZmFsc2UpO1xuICAgIHJlbW92ZSA9IGFwcGx5VG9TaW5nbGV0b25UYWcuYmluZChudWxsLCBzdHlsZSwgc3R5bGVJbmRleCwgdHJ1ZSk7XG4gIH0gZWxzZSB7XG4gICAgc3R5bGUgPSBpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucyk7XG4gICAgdXBkYXRlID0gYXBwbHlUb1RhZy5iaW5kKG51bGwsIHN0eWxlLCBvcHRpb25zKTtcblxuICAgIHJlbW92ZSA9IGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZSk7XG4gICAgfTtcbiAgfVxuXG4gIHVwZGF0ZShvYmopO1xuICByZXR1cm4gZnVuY3Rpb24gdXBkYXRlU3R5bGUobmV3T2JqKSB7XG4gICAgaWYgKG5ld09iaikge1xuICAgICAgaWYgKG5ld09iai5jc3MgPT09IG9iai5jc3MgJiYgbmV3T2JqLm1lZGlhID09PSBvYmoubWVkaWEgJiYgbmV3T2JqLnNvdXJjZU1hcCA9PT0gb2JqLnNvdXJjZU1hcCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHVwZGF0ZShvYmogPSBuZXdPYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICByZW1vdmUoKTtcbiAgICB9XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGxpc3QsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307IC8vIEZvcmNlIHNpbmdsZS10YWcgc29sdXRpb24gb24gSUU2LTksIHdoaWNoIGhhcyBhIGhhcmQgbGltaXQgb24gdGhlICMgb2YgPHN0eWxlPlxuICAvLyB0YWdzIGl0IHdpbGwgYWxsb3cgb24gYSBwYWdlXG5cbiAgaWYgKCFvcHRpb25zLnNpbmdsZXRvbiAmJiB0eXBlb2Ygb3B0aW9ucy5zaW5nbGV0b24gIT09ICdib29sZWFuJykge1xuICAgIG9wdGlvbnMuc2luZ2xldG9uID0gaXNPbGRJRSgpO1xuICB9XG5cbiAgbGlzdCA9IGxpc3QgfHwgW107XG4gIHZhciBsYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucyk7XG4gIHJldHVybiBmdW5jdGlvbiB1cGRhdGUobmV3TGlzdCkge1xuICAgIG5ld0xpc3QgPSBuZXdMaXN0IHx8IFtdO1xuXG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChuZXdMaXN0KSAhPT0gJ1tvYmplY3QgQXJyYXldJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGFzdElkZW50aWZpZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaWRlbnRpZmllciA9IGxhc3RJZGVudGlmaWVyc1tpXTtcbiAgICAgIHZhciBpbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgICAgc3R5bGVzSW5Eb21baW5kZXhdLnJlZmVyZW5jZXMtLTtcbiAgICB9XG5cbiAgICB2YXIgbmV3TGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKG5ld0xpc3QsIG9wdGlvbnMpO1xuXG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGxhc3RJZGVudGlmaWVycy5sZW5ndGg7IF9pKyspIHtcbiAgICAgIHZhciBfaWRlbnRpZmllciA9IGxhc3RJZGVudGlmaWVyc1tfaV07XG5cbiAgICAgIHZhciBfaW5kZXggPSBnZXRJbmRleEJ5SWRlbnRpZmllcihfaWRlbnRpZmllcik7XG5cbiAgICAgIGlmIChzdHlsZXNJbkRvbVtfaW5kZXhdLnJlZmVyZW5jZXMgPT09IDApIHtcbiAgICAgICAgc3R5bGVzSW5Eb21bX2luZGV4XS51cGRhdGVyKCk7XG5cbiAgICAgICAgc3R5bGVzSW5Eb20uc3BsaWNlKF9pbmRleCwgMSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGFzdElkZW50aWZpZXJzID0gbmV3TGFzdElkZW50aWZpZXJzO1xuICB9O1xufTsiLCJpbXBvcnQgJy4uL2Nzcy9zdHlsZS5jc3MnO1xuaW1wb3J0ICcuLi9jc3MvdmVuZG9yL21hbmEuY3NzJztcbmltcG9ydCBTZWFyY2ggZnJvbSAnLi9tb2RlbHMvU2VhcmNoJztcbmltcG9ydCAqIGFzIHNlYXJjaFZpZXcgZnJvbSAnLi92aWV3cy9zZWFyY2hWaWV3JztcbmltcG9ydCAqIGFzIHJlc3VsdHNWaWV3IGZyb20gJy4vdmlld3MvcmVzdWx0c1ZpZXcnO1xuaW1wb3J0ICogYXMgY2FyZFZpZXcgZnJvbSAnLi92aWV3cy9jYXJkVmlldyc7XG5pbXBvcnQgKiBhcyBpbnZlbnRvcnlWaWV3IGZyb20gJy4vdmlld3MvaW52ZW50b3J5Vmlldyc7XG5pbXBvcnQgKiBhcyBpbnZTZWFyY2ggZnJvbSAnLi92aWV3cy9pbnZlbnRvcnlTZWFyY2hWaWV3JztcbmltcG9ydCB7IGVsZW1lbnRzIH0gZnJvbSAnLi92aWV3cy9iYXNlJztcblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKiBIb21lIFBhZ2UgKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuLy8gaWYgKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSA9PT0gJy8nKSBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7XG5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqIFF1aWNrIFNlYXJjaCAqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbmVsZW1lbnRzLm5hdi5xdWlja1NlYXJjaEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgY29uc3Qgc2VhcmNoID0gbmV3IFNlYXJjaCgpO1xuXG4gIGlmIChlbGVtZW50cy5uYXYuc2VhcmNoSW5wdXQudmFsdWUgIT09ICcnKSB7XG4gICAgY29uc3QgcXVlcnkgPSBzZWFyY2gucXVpY2tTZWFyY2goKTtcbiAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGAvcmVzdWx0cy9saXN0LyR7cXVlcnl9Jm9yZGVyPW5hbWVgO1xuICB9XG59KTtcblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKiogU2VhcmNoIFBhZ2UgKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuaWYgKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSA9PT0gJy9zZWFyY2gnKSB7XG4gIGRvY3VtZW50LmJvZHkuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJyNmZGZkZmQnO1xuXG4gIGNvbnN0IHNlYXJjaCA9IG5ldyBTZWFyY2goKTtcblxuICAvLyBFdmVudCBsaXN0ZW5lciBmb3IgdGhlIHN1Ym1pdCBzZWFyY2ggYnV0dG9uLiBUaGlzIGdvZXMgdGhyb3VnaCB0aGUgZm9ybSBhbmQgZ2VuZXJhdGVzXG4gIC8vIHRoZSBxdWplcnkgc3RyaW5nLiBJdCB0aGVuIHBhc3NlcyB0aGUgc3RyaW5nIHRvIHRoZSBzZXJ2ZXIgdGhyb3VnaCB0aGUgVVJMXG4gIGVsZW1lbnRzLmFwaVNlYXJjaC5zdWJtaXRCdG4ub25jbGljayA9IGFzeW5jIChlKSA9PiB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgLy8gQ2xlYXIgYW55IGV4aXN0aW5nIHF1ZXJ5IHN0cmluZ1xuICAgIHNlYXJjaC5yZXNldFNlYXJjaFF1ZXJ5KCk7XG5cbiAgICAvLyBCdWlsZCB0aGUgcXVlcnkgc3RyaW5nXG4gICAgY29uc3QgcXVlcnkgPSBzZWFyY2guYnVpbGRTZWFyY2hRdWVyeSgpO1xuXG4gICAgLy8gR2V0IHRoZSBkaXNwbGF5IG1ldGhvZFxuICAgIGNvbnN0IGRpc3BsYXlNZXRob2QgPSBzZWFyY2guZGlzcGxheU1ldGhvZCgpO1xuXG4gICAgLy8gQ3JlYXRlIGEgZ2V0IHJlcXVlc3Qgd2l0aCB0aGUgcXVlcnkgc3RyaW5nXG4gICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBgL3Jlc3VsdHMvJHtkaXNwbGF5TWV0aG9kfS8ke3F1ZXJ5fWA7XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cbiAgZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVMaW5lLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgIC8vIERpc3BsYXkgdGhlIGRyb3Bkb3duXG4gICAgc2VhcmNoVmlldy5zaG93VHlwZXNEcm9wRG93bigpO1xuICAgIHNlYXJjaFZpZXcuc3RhcnRUeXBlc0Ryb3BEb3duTmF2aWdhdGlvbigpO1xuXG4gICAgLy8gU3RhcnQgYW4gZXZlbnQgbGlzdGVuZXIgb24gdGhlIGRvY3VtZW50LiBUaGlzIHdpbGwgY2xvc2UgdGhlIGRyb3Bkb3duIGlmIHRoZSB1c2VyIGNsaWNrc1xuICAgIC8vIG91dHNpZGUgb2YgdGhlIGlucHV0IG9yIGRyb3Bkb3duLiBUaGlzIHdpbGwgYWxzbyBjYW5jZWwgdGhlIGV2ZW50IGxpc3RlbmVyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzZWFyY2hWaWV3LnR5cGVMaW5lTGlzdGVuZXIpO1xuICB9KTtcblxuICBlbGVtZW50cy5hcGlTZWFyY2gudHlwZUxpbmUuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XG4gICAgaWYgKGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlRHJvcERvd24uaGFzQXR0cmlidXRlKCdoaWRkZW4nKSkge1xuICAgICAgc2VhcmNoVmlldy5zaG93VHlwZXNEcm9wRG93bigpO1xuICAgIH1cblxuICAgIHNlYXJjaFZpZXcuZmlsdGVyVHlwZXMoZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVMaW5lLnZhbHVlKTtcbiAgICBzZWFyY2hWaWV3LmZpbHRlclR5cGVIZWFkZXJzKCk7XG4gICAgc2VhcmNoVmlldy5zdGFydFR5cGVzRHJvcERvd25OYXZpZ2F0aW9uKCk7XG4gIH0pO1xuXG4gIGVsZW1lbnRzLmFwaVNlYXJjaC5zZXRJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAvLyBEaXNwbGF5IHRoZSBkcm9wZG93blxuICAgIHNlYXJjaFZpZXcuc2hvd1NldHNEcm9wRG93bigpO1xuICAgIHNlYXJjaFZpZXcuc3RhcnRTZXRzRHJvcERvd25OYXZpZ2F0aW9uKCk7XG5cbiAgICAvLyBTdGFydCBhbiBldmVudCBsaXN0ZW5lciBvbiB0aGUgZG9jdW1lbnQuIFRoaXMgd2lsbCBjbG9zZSB0aGUgZHJvcGRvd24gaWYgdGhlIHVzZXIgY2xpY2tzXG4gICAgLy8gb3V0c2lkZSBvZiB0aGUgaW5wdXQgb3IgZHJvcGRvd24uIFRoaXMgd2lsbCBhbHNvIGNhbmNlbCB0aGUgZXZlbnQgbGlzdGVuZXJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNlYXJjaFZpZXcuc2V0SW5wdXRMaXN0ZW5lcik7XG4gIH0pO1xuXG4gIGVsZW1lbnRzLmFwaVNlYXJjaC5zZXRJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsICgpID0+IHtcbiAgICBpZiAoZWxlbWVudHMuYXBpU2VhcmNoLnNldERyb3BEb3duLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIHtcbiAgICAgIHNlYXJjaFZpZXcuc2hvd1NldHNEcm9wRG93bigpO1xuICAgIH1cblxuICAgIHNlYXJjaFZpZXcuZmlsdGVyU2V0cyhlbGVtZW50cy5hcGlTZWFyY2guc2V0SW5wdXQudmFsdWUpO1xuICAgIHNlYXJjaFZpZXcuZmlsdGVyU2V0SGVhZGVycygpO1xuICAgIHNlYXJjaFZpZXcuc3RhcnRTZXRzRHJvcERvd25OYXZpZ2F0aW9uKCk7XG4gIH0pO1xuXG4gIGVsZW1lbnRzLmFwaVNlYXJjaC5zdGF0VmFsdWUuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAnaW5wdXQnLFxuICAgIHNlYXJjaFZpZXcuc3RhdExpbmVDb250cm9sbGVyXG4gICk7XG5cbiAgZWxlbWVudHMuYXBpU2VhcmNoLmZvcm1hdC5hZGRFdmVudExpc3RlbmVyKFxuICAgICdjaGFuZ2UnLFxuICAgIHNlYXJjaFZpZXcuZm9ybWF0TGluZUNvbnRyb2xsZXJcbiAgKTtcbn1cblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKiogUmVzdWx0cyBQYWdlICoqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuaWYgKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zdWJzdHJpbmcoMSwgOCkgPT09ICdyZXN1bHRzJykge1xuICBkb2N1bWVudC5ib2R5LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcjZjVmNmY3JztcblxuICBjb25zdCBzdGF0ZSA9IHtcbiAgICBzZWFyY2g6IG5ldyBTZWFyY2goKSxcblxuICAgIC8vIEdldCB0aGUgZGlzcGxheSBtZXRob2QsIHNvcnQgbWV0aG9kLCBhbmQgcXVlcnkgZnJvbSB0aGUgVVJMXG4gICAgZGlzcGxheTogd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnN1YnN0cmluZyhcbiAgICAgIDksXG4gICAgICB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUubGFzdEluZGV4T2YoJy8nKVxuICAgICksXG4gICAgcXVlcnk6IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zdWJzdHJpbmcoXG4gICAgICB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUubGFzdEluZGV4T2YoJy8nKSArIDFcbiAgICApLFxuICAgIHNvcnRNZXRob2Q6IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zdWJzdHJpbmcoXG4gICAgICB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUubGFzdEluZGV4T2YoJz0nKSArIDFcbiAgICApLFxuXG4gICAgYWxsQ2FyZHM6IFtdLFxuICAgIGN1cnJlbnRJbmRleDogMCxcbiAgICBhbGxSZXN1bHRzTG9hZGVkOiBmYWxzZSxcbiAgfTtcblxuICAvLyBXaGVuIHRoZSByZXN1bHRzIHBhZ2UgaXMgcmVmcmVzaGVkLCBkaXNwbGF5IHRoZSBjYXJkcyBhcyBhIGNoZWNrbGlzdCBieSBkZWZhdWx0XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBhc3luYyAoKSA9PiB7XG4gICAgLy8gVXBkYXRlIHRoZSBzb3J0IGJ5IGFuZCBkaXNwbGF5IGFzZCBtZW51cyBzbyB0aGUgc2VsZWN0ZWQgb3B0aW9uIGlzIHdoYXQgdGhlIHVzZXIgc2VsZWN0ZWRcbiAgICByZXN1bHRzVmlldy5jaG9zZVNlbGVjdE1lbnVTb3J0KFxuICAgICAgZWxlbWVudHMucmVzdWx0c1BhZ2Uuc29ydEJ5KCkub3B0aW9ucyxcbiAgICAgIHN0YXRlXG4gICAgKTtcbiAgICByZXN1bHRzVmlldy5jaG9zZVNlbGVjdE1lbnVEaXNwbGF5KFxuICAgICAgZWxlbWVudHMucmVzdWx0c1BhZ2UuZGlzcGxheVNlbGVjdG9yKCksXG4gICAgICBzdGF0ZVxuICAgICk7XG5cbiAgICAvLyBSdW4gdGhlIGdldCBjYXJkcyBmdW5jdGlvbiwgdGhlbiB1cGRhdGUgdGhlIGRpc3BsYXkgYmFyIHdpdGggdGhlIHRvdGFsIGNhcmQgY291bnRcbiAgICBhd2FpdCBzdGF0ZS5zZWFyY2guZ2V0Q2FyZHMoc3RhdGUpO1xuXG4gICAgaWYgKHN0YXRlLmFsbENhcmRzWzBdID09PSA0MDQpIHtcbiAgICAgIHJlc3VsdHNWaWV3LmRpc3BsYXk0MDQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZXN1bHRzVmlldy51cGRhdGVEaXNwbGF5QmFyKHN0YXRlKTtcblxuICAgIC8vIEluIHRoZSBiYWNrZ3JvdW5kLCBnZXQgYWxsIGNhcmRzXG4gICAgc3RhdGUuc2VhcmNoLmdldEFsbENhcmRzKHN0YXRlLCByZXN1bHRzVmlldy5lbmFibGVCdG4pO1xuXG4gICAgLy8gT24gbG9hZGluZyB0aGUgcGFnZSBkaXNwbGF5IHRoZSBjYXJkcyBpbiBhIGNoZWNrbGlzdFxuICAgIHJlc3VsdHNWaWV3LnVwZGF0ZURpc3BsYXkoc3RhdGUpO1xuICB9KTtcblxuICAvLyBFdmVudCBsaXN0ZW5lciBmb3IgdGhlIGNoYW5nZSBkaXNwbGF5IG1ldGhvZCBidXR0b25cbiAgZWxlbWVudHMucmVzdWx0c1BhZ2UuYnRuKCkub25jbGljayA9IGFzeW5jICgpID0+IHtcbiAgICAvLyBVcGRhdGUgdGhlIGRpc3BsYXkgbWV0aG9kIGJldHdlZW4gY2hlY2tsaXN0IGFuZCBjYXJkcyBpZiB0aGUgdXNlciBjaGFuZ2VkIGl0XG4gICAgcmVzdWx0c1ZpZXcuY2hhbmdlRGlzcGxheUFuZFVybChzdGF0ZSk7XG5cbiAgICAvLyBJZiBhIG5ldyBzb3J0aW5nIG1ldGhvZCBpcyBzZWxlY3RlZCwgYSByZXF1ZXN0IGlzIHNlbnQgdG8gdGhlIHNlcnZlciBhbmQgdGhlIHBhZ2UgaXMgcmVmcmVzaGVkLlxuICAgIC8vIFRoaXMgcmVzZXRzIHRoZSBzdGF0ZSBhbmQgYXN5bmMgdGFza3NcbiAgICByZXN1bHRzVmlldy5jaGFuZ2VTb3J0TWV0aG9kKHN0YXRlKTtcblxuICAgIC8vIFVwZGF0ZSB0aGUgZGlzcGxheSB3aXRoIGEgbmV3IHNvcnQgbWV0aG9kIGFuZCBkaXNwbGF5IG1ldGhvZCBpZiBlaXRoZXIgd2VyZSBnaXZlblxuICAgIHJlc3VsdHNWaWV3LnVwZGF0ZURpc3BsYXkoc3RhdGUpO1xuICB9O1xuXG4gIC8vIEV2ZW50IExpc3RlbmVyIGZvciBuZXh0IHBhZ2UgYnV0dG9uXG4gIGVsZW1lbnRzLnJlc3VsdHNQYWdlLm5leHRQYWdlQnRuKCkub25jbGljayA9ICgpID0+IHtcbiAgICAvLyBVcGRhdGUgdGhlIGluZGV4XG4gICAgc3RhdGUuY3VycmVudEluZGV4Kys7XG5cbiAgICAvLyBVcGRhdGUgdGhlIGRpc3BsYXkgYmFzZWQgb24gdGhlIG1ldGhvZCBzdG9yZWQgaW4gdGhlIHN0YXRlXG4gICAgcmVzdWx0c1ZpZXcudXBkYXRlRGlzcGxheShzdGF0ZSk7XG5cbiAgICAvLyBVcGRhdGUgdGhlIGRpc3BsYXkgYmFyXG4gICAgcmVzdWx0c1ZpZXcudXBkYXRlRGlzcGxheUJhcihzdGF0ZSk7XG5cbiAgICAvLyBFbmFibGUgdGhlIHByZXZpb3VzIHBhZ2UgYW5kIGZpcnN0IHBhZ2UgYnRuc1xuICAgIHJlc3VsdHNWaWV3LmVuYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5wcmV2aW91c1BhZ2VCdG4oKSk7XG4gICAgcmVzdWx0c1ZpZXcuZW5hYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLmZpcnN0UGFnZUJ0bik7XG5cbiAgICAvLyBJZiBvbiB0aGUgbGFzdCBwYWdlLCBkaXNhYmxlIHRoZSBuZXh0IHBhZ2UgYnRuIGFuZCBsYXN0IHBhZ2UgYnRuXG4gICAgaWYgKHN0YXRlLmN1cnJlbnRJbmRleCA9PT0gc3RhdGUuYWxsQ2FyZHMubGVuZ3RoIC0gMSkge1xuICAgICAgcmVzdWx0c1ZpZXcuZGlzYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5uZXh0UGFnZUJ0bigpKTtcbiAgICAgIHJlc3VsdHNWaWV3LmRpc2FibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UubGFzdFBhZ2VCdG4pO1xuICAgIH1cbiAgfTtcblxuICAvLyBFdmVudCBsaXN0ZW5lciBmb3IgdGhlIGxhc3QgcGFnZSBidG5cbiAgZWxlbWVudHMucmVzdWx0c1BhZ2UubGFzdFBhZ2VCdG4ub25jbGljayA9ICgpID0+IHtcbiAgICAvLyBVcGRhdGUgdGhlIGluZGV4XG4gICAgc3RhdGUuY3VycmVudEluZGV4ID0gc3RhdGUuYWxsQ2FyZHMubGVuZ3RoIC0gMTtcblxuICAgIC8vIFVwZGF0ZSB0aGUgZGlzcGxheSBiYXNlZCBvbiB0aGUgbWV0aG9kIHN0b3JlZCBpbiB0aGUgc3RhdGVcbiAgICByZXN1bHRzVmlldy51cGRhdGVEaXNwbGF5KHN0YXRlKTtcblxuICAgIC8vIFVwZGF0ZSB0aGUgZGlzcGxheSBiYXJcbiAgICByZXN1bHRzVmlldy51cGRhdGVEaXNwbGF5QmFyKHN0YXRlKTtcblxuICAgIC8vIERpc2FibGUgdGhlIG5leHQgYW5kIGxhc3QgcGFnZSBidXR0b25zXG4gICAgcmVzdWx0c1ZpZXcuZGlzYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5uZXh0UGFnZUJ0bigpKTtcbiAgICByZXN1bHRzVmlldy5kaXNhYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLmxhc3RQYWdlQnRuKTtcblxuICAgIC8vIEVuYWJsZSB0aGUgcHJldmlvdXMgYW5kIGZpcnN0IHBhZ2UgYnV0dG9uc1xuICAgIHJlc3VsdHNWaWV3LmVuYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5wcmV2aW91c1BhZ2VCdG4oKSk7XG4gICAgcmVzdWx0c1ZpZXcuZW5hYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLmZpcnN0UGFnZUJ0bik7XG4gIH07XG5cbiAgLy8gRXZlbnQgbGlzdGVuZXIgZm9yIHRoZSBwcmV2aW91cyBwYWdlIGJ1dHRvblxuICBlbGVtZW50cy5yZXN1bHRzUGFnZS5wcmV2aW91c1BhZ2VCdG4oKS5vbmNsaWNrID0gKCkgPT4ge1xuICAgIC8vIFVwZGF0ZSB0aGUgaW5kZXhcbiAgICBzdGF0ZS5jdXJyZW50SW5kZXgtLTtcblxuICAgIC8vIFVwZGF0ZSB0aGUgZGlzcGxheSBiYXNlZCBvbiB0aGUgbWV0aG9kIHN0b3JlZCBpbiB0aGUgc3RhdGVcbiAgICByZXN1bHRzVmlldy51cGRhdGVEaXNwbGF5KHN0YXRlKTtcblxuICAgIC8vIFVwZGF0ZSB0aGUgZGlzcGxheSBiYXJcbiAgICByZXN1bHRzVmlldy51cGRhdGVEaXNwbGF5QmFyKHN0YXRlKTtcblxuICAgIC8vIElmIG9uIHRoZSBmaXJzdCBwYWdlLCBkaXNhYmxlIHRoZSBwcmV2aW91cyBhbmQgZmlyc3QgcGFnZSBidXR0b25zXG4gICAgaWYgKHN0YXRlLmN1cnJlbnRJbmRleCA9PT0gMCkge1xuICAgICAgcmVzdWx0c1ZpZXcuZGlzYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5wcmV2aW91c1BhZ2VCdG4oKSk7XG4gICAgICByZXN1bHRzVmlldy5kaXNhYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLmZpcnN0UGFnZUJ0bik7XG4gICAgfVxuXG4gICAgLy8gRW5hYmxlIHRoZSBuZXh0IGFuZCBsYXN0IHBhZ2UgYnV0dG9ucy4gVGhlIGxhc3QgcGFnZSBidXR0b24gc2hvdWxkIG9ubHkgYmVcbiAgICAvLyBlbmFibGVkIGlmIGFsbCByZXN1bHRzIGhhdmUgYmVlbiBsb2FkZWRcbiAgICByZXN1bHRzVmlldy5lbmFibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UubmV4dFBhZ2VCdG4oKSk7XG4gICAgaWYgKHN0YXRlLmFsbFJlc3VsdHNMb2FkZWQpXG4gICAgICByZXN1bHRzVmlldy5lbmFibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UubGFzdFBhZ2VCdG4pO1xuICB9O1xuXG4gIC8vIEV2ZW50IGxpc3RlbmVyIGZvciB0aGUgZmlyc3QgcGFnZSBidG5cbiAgZWxlbWVudHMucmVzdWx0c1BhZ2UuZmlyc3RQYWdlQnRuLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgLy8gVXBkYXRlIHRoZSBpbmRleFxuICAgIHN0YXRlLmN1cnJlbnRJbmRleCA9IDA7XG5cbiAgICAvLyBVcGRhdGUgdGhlIGRpc3BsYXkgYmFzZWQgb24gdGhlIG1ldGhvZCBzdG9yZWQgaW4gdGhlIHN0YXRlXG4gICAgcmVzdWx0c1ZpZXcudXBkYXRlRGlzcGxheShzdGF0ZSk7XG5cbiAgICAvLyBVcGRhdGUgdGhlIGRpc3BsYXkgYmFyXG4gICAgcmVzdWx0c1ZpZXcudXBkYXRlRGlzcGxheUJhcihzdGF0ZSk7XG5cbiAgICAvLyBEaXNhYmxlIHRoZSBwcmV2aW91cyBhbmQgZmlyc3QgcGFnZSBidXR0b25zXG4gICAgcmVzdWx0c1ZpZXcuZGlzYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5wcmV2aW91c1BhZ2VCdG4oKSk7XG4gICAgcmVzdWx0c1ZpZXcuZGlzYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5maXJzdFBhZ2VCdG4pO1xuXG4gICAgLy8gRW5hYmxlIHRoZSBuZXh0IGFuZCBsYXN0IHBhZ2UgYnV0dG9ucy4gVGhlIGxhc3QgcGFnZSBidXR0b24gc2hvdWxkIG9ubHkgYmVcbiAgICAvLyBlbmFibGVkIGlmIGFsbCByZXN1bHRzIGhhdmUgYmVlbiBsb2FkZWRcbiAgICByZXN1bHRzVmlldy5lbmFibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UubmV4dFBhZ2VCdG4oKSk7XG4gICAgaWYgKHN0YXRlLmFsbFJlc3VsdHNMb2FkZWQpXG4gICAgICByZXN1bHRzVmlldy5lbmFibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UubGFzdFBhZ2VCdG4pO1xuICB9O1xuXG4gIHdpbmRvdy5vbnBvcHN0YXRlID0gKGUpID0+IHtcbiAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGAvc2VhcmNoYDtcbiAgfTtcblxuICAvLyBNb2JpbGUgZGlzcGxheSBtZW51XG4gIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLW1vYmlsZS1kaXNwbGF5LW9wdGlvbnMnKSkge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcignLmpzLS1tb2JpbGUtZGlzcGxheS1vcHRpb25zJylcbiAgICAgIC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tbW9iaWxlLWRpc3BsYXktbWVudScpLnN0eWxlLmRpc3BsYXkgPT09XG4gICAgICAgICAgJ2ZsZXgnXG4gICAgICAgICkge1xuICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tbW9iaWxlLWRpc3BsYXktbWVudScpLnN0eWxlLmRpc3BsYXkgPVxuICAgICAgICAgICAgJ25vbmUnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tbW9iaWxlLWRpc3BsYXktbWVudScpLnN0eWxlLmRpc3BsYXkgPVxuICAgICAgICAgICAgJ2ZsZXgnO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfVxufVxuXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqIENhcmQgUGFnZSAqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG5pZiAod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnN1YnN0cmluZygxLCA1KSA9PT0gJ2NhcmQnKSB7XG4gIGNhcmRWaWV3Lmluc2VydE1hbmFDb3N0VG9DYXJkVGV4dFRpdGxlKCk7XG4gIGNhcmRWaWV3Lmluc2VydE1hbmFDb3N0VG9PcmFjbGVUZXh0KCk7XG4gIGNhcmRWaWV3LnJlbW92ZVVuZGVyU2NvcmVGcm9tTGVnYWxTdGF0dXMoKTtcbiAgY2FyZFZpZXcuZml4Q2FyZFByaWNlcygpO1xuICBjYXJkVmlldy5zZXRQcmludExpbmtIcmVmKCk7XG4gIGNhcmRWaWV3LnByaW50TGlzdEhvdmVyRXZlbnRzKCk7XG4gIGNhcmRWaWV3LnNob3J0ZW5DYXJkTmFtZSgpO1xuXG4gIC8vIElmIHRoZSB0cmFuc2Zvcm0gYnRuIGlzIG9uIHRoZSBkb20gKGlmIHRoZSBjYXJkIGlzIGRvdWJsZSBzaWRlZCkgc2V0XG4gIC8vIHRoZSBldmVudCBsaXN0ZW5lciBmb3IgdGhlIGNhcmQgdG8gYmUgZmxpcHBlZCBiYWNrIGFuZCBmb3J0aFxuICBpZiAoZWxlbWVudHMuY2FyZC50cmFuc2Zvcm1CdG4pIHtcbiAgICBlbGVtZW50cy5jYXJkLnRyYW5zZm9ybUJ0bi5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgJ2NsaWNrJyxcbiAgICAgIGNhcmRWaWV3LmZsaXBUb0JhY2tTaWRlXG4gICAgKTtcbiAgfVxuXG4gIGRvY3VtZW50XG4gICAgLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYWRkLXRvLWludi1zdWJtaXQnKVxuICAgIC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNhcmRWaWV3LmNoZWNrUHJpY2VJbnB1dEZvckRpZ2l0cyk7XG59XG5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKiBJbnZlbnRvcnkgUGFnZSAqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbmlmICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuZW5kc1dpdGgoJ2ludmVudG9yeScpKSB7XG4gIGRvY3VtZW50LmJvZHkuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJyNmNWY2ZjcnO1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFxuICAgICdET01Db250ZW50TG9hZGVkJyxcbiAgICBpbnZlbnRvcnlWaWV3LmFsdGVySW52ZW50b3J5VGFibGVcbiAgKTtcbn1cblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqIEludmVudG9yeSBTZWFyY2ggUGFnZSAqKioqIFxcXFxcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuaWYgKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zdWJzdHJpbmcoMSwgMTcpID09PSAnaW52ZW50b3J5L3NlYXJjaCcpIHtcbiAgZG9jdW1lbnQuYm9keS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnI2ZkZmRmZCc7XG5cbiAgZG9jdW1lbnRcbiAgICAucXVlcnlTZWxlY3RvcignLmpzLS1pbnYtc2VhcmNoLWJ0bicpXG4gICAgLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaW52U2VhcmNoLmNoZWNrUHJpY2VJbnB1dEZvckRpZ2l0cyk7XG5cbiAgZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVMaW5lLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgIC8vIERpc3BsYXkgdGhlIGRyb3Bkb3duXG4gICAgc2VhcmNoVmlldy5zaG93VHlwZXNEcm9wRG93bigpO1xuICAgIGludlNlYXJjaC5zdGFydFR5cGVzRHJvcERvd25OYXZpZ2F0aW9uKCk7XG5cbiAgICAvLyBTdGFydCBhbiBldmVudCBsaXN0ZW5lciBvbiB0aGUgZG9jdW1lbnQuIFRoaXMgd2lsbCBjbG9zZSB0aGUgZHJvcGRvd24gaWYgdGhlIHVzZXIgY2xpY2tzXG4gICAgLy8gb3V0c2lkZSBvZiB0aGUgaW5wdXQgb3IgZHJvcGRvd24uIFRoaXMgd2lsbCBhbHNvIGNhbmNlbCB0aGUgZXZlbnQgbGlzdGVuZXJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGludlNlYXJjaC50eXBlTGluZUxpc3RlbmVyKTtcbiAgfSk7XG5cbiAgZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVMaW5lLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xuICAgIGlmIChlbGVtZW50cy5hcGlTZWFyY2gudHlwZURyb3BEb3duLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIHtcbiAgICAgIHNlYXJjaFZpZXcuc2hvd1R5cGVzRHJvcERvd24oKTtcbiAgICB9XG5cbiAgICBzZWFyY2hWaWV3LmZpbHRlclR5cGVzKGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlTGluZS52YWx1ZSk7XG4gICAgc2VhcmNoVmlldy5maWx0ZXJUeXBlSGVhZGVycygpO1xuICAgIGludlNlYXJjaC5zdGFydFR5cGVzRHJvcERvd25OYXZpZ2F0aW9uKCk7XG4gIH0pO1xuXG4gIGVsZW1lbnRzLmFwaVNlYXJjaC5zZXRJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAvLyBEaXNwbGF5IHRoZSBkcm9wZG93blxuICAgIHNlYXJjaFZpZXcuc2hvd1NldHNEcm9wRG93bigpO1xuICAgIGludlNlYXJjaC5zdGFydFNldHNEcm9wRG93bk5hdmlnYXRpb24oKTtcblxuICAgIC8vIFN0YXJ0IGFuIGV2ZW50IGxpc3RlbmVyIG9uIHRoZSBkb2N1bWVudC4gVGhpcyB3aWxsIGNsb3NlIHRoZSBkcm9wZG93biBpZiB0aGUgdXNlciBjbGlja3NcbiAgICAvLyBvdXRzaWRlIG9mIHRoZSBpbnB1dCBvciBkcm9wZG93bi4gVGhpcyB3aWxsIGFsc28gY2FuY2VsIHRoZSBldmVudCBsaXN0ZW5lclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaW52U2VhcmNoLnNldElucHV0TGlzdGVuZXIpO1xuICB9KTtcblxuICBlbGVtZW50cy5hcGlTZWFyY2guc2V0SW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XG4gICAgaWYgKGVsZW1lbnRzLmFwaVNlYXJjaC5zZXREcm9wRG93bi5oYXNBdHRyaWJ1dGUoJ2hpZGRlbicpKSB7XG4gICAgICBzZWFyY2hWaWV3LnNob3dTZXRzRHJvcERvd24oKTtcbiAgICB9XG5cbiAgICBzZWFyY2hWaWV3LmZpbHRlclNldHMoZWxlbWVudHMuYXBpU2VhcmNoLnNldElucHV0LnZhbHVlKTtcbiAgICBzZWFyY2hWaWV3LmZpbHRlclNldEhlYWRlcnMoKTtcbiAgICBpbnZTZWFyY2guc3RhcnRTZXRzRHJvcERvd25OYXZpZ2F0aW9uKCk7XG4gIH0pO1xufVxuXG5pZiAod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLmluY2x1ZGVzKCcvY2FyZCcpKSB7XG4gIGRvY3VtZW50LmJvZHkuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJyNmNWY2ZjcnO1xufVxuXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbi8vICoqKioqKiBNb2JpbGUgTmF2IEJ1dHRvbiAqKioqKiogXFxcXFxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG5cbmlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLW5hdi1oYW1idXJnZXInKSkge1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLW5hdi1oYW1idXJnZXInKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1tb2JpbGUtbGlua3MnKS5zdHlsZS5kaXNwbGF5ID09PSAnZmxleCcpIHtcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tbW9iaWxlLWxpbmtzJykuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICB9IGVsc2Uge1xuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1tb2JpbGUtbGlua3MnKS5zdHlsZS5kaXNwbGF5ID0gJ2ZsZXgnO1xuICAgIH1cbiAgfSk7XG59XG5cbmlmIChcbiAgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLmluY2x1ZGVzKCcvbG9naW4nKSB8fFxuICB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuaW5jbHVkZXMoJy9yZWdpc3RlcicpXG4pXG4gIGRvY3VtZW50LmJvZHkuc3R5bGUub3ZlcmZsb3dZID0gJ2hpZGRlbic7XG4iLCJpbXBvcnQgYXhpb3MgZnJvbSAnYXhpb3MnO1xuXG5pbXBvcnQgeyBlbGVtZW50cyB9IGZyb20gJy4uL3ZpZXdzL2Jhc2UnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZWFyY2gge1xuICBzZWFyY2hCeU5hbWUoKSB7XG4gICAgbGV0IGNhcmROYW1lID0gZWxlbWVudHMuYXBpU2VhcmNoLmNhcmROYW1lLnZhbHVlO1xuICAgIGNhcmROYW1lID0gY2FyZE5hbWUucmVwbGFjZSgnICcsICcrJyk7XG5cbiAgICBpZiAoY2FyZE5hbWUpIHRoaXMuc2VhcmNoICs9IGNhcmROYW1lO1xuICB9XG5cbiAgc2VhcmNoQnlPdGV4dCgpIHtcbiAgICBjb25zdCBvcmFjbGVUZXh0ID0gZWxlbWVudHMuYXBpU2VhcmNoLm9yYWNsZVRleHQudmFsdWU7XG5cbiAgICAvLyBJZiB0aGUgb3JhY2xlIHRleHQgaW5jbHVkZXMgbW9yZSB0aGFuIG9uZSB3b3JkLCB3ZSBuZWVkIHRvIHNlYXJjaCB0aGUgdGVybXMgaW5kaXZpZHVhbGx5XG4gICAgaWYgKFxuICAgICAgb3JhY2xlVGV4dC5pbmNsdWRlcygnICcpICYmXG4gICAgICBvcmFjbGVUZXh0LmluZGV4T2YoJyAnKSAhPT0gb3JhY2xlVGV4dC5sZW5ndGggLSAxXG4gICAgKSB7XG4gICAgICBsZXQgdGVtcG9yYXJ5U3RyID0gJyc7XG4gICAgICBjb25zdCB0ZXh0cyA9IG9yYWNsZVRleHQuc3BsaXQoJyAnKTtcblxuICAgICAgdGV4dHMuZm9yRWFjaCgodGV4dCkgPT4ge1xuICAgICAgICBpZiAodGV4dC5sZW5ndGggPiAwKSB0ZW1wb3JhcnlTdHIgKz0gYG9yYWNsZSUzQSR7dGV4dH0rYDtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLnNlYXJjaCArPSBgKyUyOCR7dGVtcG9yYXJ5U3RyLnNsaWNlKDAsIC0xKX0lMjlgO1xuICAgIH0gZWxzZSBpZiAob3JhY2xlVGV4dCkgdGhpcy5zZWFyY2ggKz0gYCtvcmFjbGUlM0Eke29yYWNsZVRleHR9YDtcbiAgfVxuXG4gIHNlYXJjaEJ5Q2FyZFR5cGUoKSB7XG4gICAgY29uc3QgdHlwZXNUb0luY2x1ZGUgPSBBcnJheS5mcm9tKFxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtaW5jbHVkZS10eXBlXScpXG4gICAgKTtcbiAgICBjb25zdCB0eXBlc1RvRXhjbHVkZSA9IEFycmF5LmZyb20oXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1leGNsdWRlLXR5cGVdJylcbiAgICApO1xuICAgIGNvbnN0IGluY2x1ZGVQYXJ0aWFsVHlwZXMgPSBlbGVtZW50cy5hcGlTZWFyY2guaW5jbHVkZVBhcnRpYWxUeXBlcy5jaGVja2VkO1xuICAgIGxldCB0ZW1wb3JhcnlTdHIgPSAnJztcblxuICAgIGlmICh0eXBlc1RvSW5jbHVkZSAmJiAhaW5jbHVkZVBhcnRpYWxUeXBlcykge1xuICAgICAgdHlwZXNUb0luY2x1ZGUuZm9yRWFjaCgodHlwZSkgPT4ge1xuICAgICAgICB0aGlzLnNlYXJjaCArPSBgK3R5cGUlM0Eke3R5cGUuZ2V0QXR0cmlidXRlKCdkYXRhLWluY2x1ZGUtdHlwZScpfWA7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAodHlwZXNUb0luY2x1ZGUubGVuZ3RoID4gMCAmJiBpbmNsdWRlUGFydGlhbFR5cGVzKSB7XG4gICAgICB0eXBlc1RvSW5jbHVkZS5mb3JFYWNoKCh0eXBlKSA9PiB7XG4gICAgICAgIHRlbXBvcmFyeVN0ciArPSBgdHlwZSUzQSR7dHlwZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaW5jbHVkZS10eXBlJyl9K09SK2A7XG4gICAgICB9KTtcblxuICAgICAgdGVtcG9yYXJ5U3RyID0gdGVtcG9yYXJ5U3RyLnNsaWNlKDAsIC00KTtcbiAgICAgIHRoaXMuc2VhcmNoICs9IGArJTI4JHt0ZW1wb3JhcnlTdHJ9JTI5YDtcbiAgICB9XG5cbiAgICBpZiAodHlwZXNUb0V4Y2x1ZGUpIHtcbiAgICAgIHR5cGVzVG9FeGNsdWRlLmZvckVhY2goKHR5cGUpID0+IHtcbiAgICAgICAgdGhpcy5zZWFyY2ggKz0gYCstdHlwZSUzQSR7dHlwZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtZXhjbHVkZS10eXBlJyl9YDtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHNlYXJjaEJ5Q29sb3IoKSB7XG4gICAgbGV0IGJveGVzID0gZWxlbWVudHMuYXBpU2VhcmNoLmNvbG9yQm94ZXM7XG5cbiAgICAvLyBMb29wIHRocm91Z2ggY2hlY2tib3hlcyB0byBnZXQgYWxsIGNvbG9ycyBnaXZlblxuICAgIHZhciBjb2xvcnMgPSAnJztcbiAgICBib3hlcy5mb3JFYWNoKChib3gpID0+IHtcbiAgICAgIGlmIChib3guY2hlY2tlZCkgY29sb3JzICs9IGJveC52YWx1ZTtcbiAgICB9KTtcblxuICAgIGNvbnN0IHNvcnRCeSA9IGVsZW1lbnRzLmFwaVNlYXJjaC5jb2xvclNvcnRCeS52YWx1ZTtcblxuICAgIGlmIChjb2xvcnMpIHRoaXMuc2VhcmNoICs9IGArY29sb3Ike3NvcnRCeX0ke2NvbG9yc31gO1xuICB9XG5cbiAgc2VhcmNoQnlTdGF0cygpIHtcbiAgICBjb25zdCBzdGF0TGluZXMgPSBBcnJheS5mcm9tKFxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1hcGktc3RhdHMtd3JhcHBlcicpXG4gICAgKTtcblxuICAgIHN0YXRMaW5lcy5mb3JFYWNoKChsaW5lKSA9PiB7XG4gICAgICBjb25zdCBzdGF0ID0gbGluZS5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1zdGF0JykudmFsdWU7XG4gICAgICBjb25zdCBzb3J0QnkgPSBsaW5lLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXN0YXQtZmlsdGVyJykudmFsdWU7XG4gICAgICBjb25zdCBzb3J0VmFsdWUgPSBsaW5lLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXN0YXQtdmFsdWUnKS52YWx1ZTtcblxuICAgICAgaWYgKHN0YXQgJiYgc29ydEJ5ICYmIHNvcnRWYWx1ZSkge1xuICAgICAgICB0aGlzLnNlYXJjaCArPSBgKyR7c3RhdH0ke3NvcnRCeX0ke3NvcnRWYWx1ZX1gO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgc2VhcmNoQnlGb3JtYXQoKSB7XG4gICAgY29uc3QgZm9ybWF0TGluZXMgPSBBcnJheS5mcm9tKFxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1hcGktZm9ybWF0LXdyYXBwZXInKVxuICAgICk7XG5cbiAgICBmb3JtYXRMaW5lcy5mb3JFYWNoKChsaW5lKSA9PiB7XG4gICAgICBjb25zdCBzdGF0dXMgPSBsaW5lLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLWxlZ2FsLXN0YXR1cycpLnZhbHVlO1xuICAgICAgY29uc3QgZm9ybWF0ID0gbGluZS5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1mb3JtYXQnKS52YWx1ZTtcblxuICAgICAgaWYgKGZvcm1hdCAmJiBzdGF0dXMpIHRoaXMuc2VhcmNoICs9IGArJHtzdGF0dXN9JTNBJHtmb3JtYXR9YDtcbiAgICB9KTtcbiAgfVxuXG4gIHNlYXJjaEJ5U2V0KCkge1xuICAgIGNvbnN0IHNldHMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWluY2x1ZGUtc2V0XScpKTtcbiAgICBsZXQgdGVtcG9yYXJ5U3RyID0gJyc7XG5cbiAgICBpZiAoc2V0cy5sZW5ndGggPiAwKSB7XG4gICAgICBzZXRzLmZvckVhY2goXG4gICAgICAgIChzKSA9PlxuICAgICAgICAgICh0ZW1wb3JhcnlTdHIgKz0gYHNldCUzQSR7cy5nZXRBdHRyaWJ1dGUoJ2RhdGEtaW5jbHVkZS1zZXQnKX0rT1IrYClcbiAgICAgICk7XG5cbiAgICAgIHRlbXBvcmFyeVN0ciA9IHRlbXBvcmFyeVN0ci5zbGljZSgwLCAtNCk7XG4gICAgICB0aGlzLnNlYXJjaCArPSBgKyUyOCR7dGVtcG9yYXJ5U3RyfSUyOWA7XG4gICAgfVxuICB9XG5cbiAgc2VhcmNoQnlSYXJpdHkoKSB7XG4gICAgY29uc3QgYm94ZXMgPSBlbGVtZW50cy5hcGlTZWFyY2gucmFyaXR5Qm94ZXM7XG4gICAgdmFyIHZhbHVlcyA9IFtdO1xuICAgIGxldCB0ZW1wb3JhcnlTdHIgPSAnJztcblxuICAgIC8vIFB1c2ggYWxsIHJhcml0aWVzIGdpdmVuIGJ5IHRoZSB1c2VyIGludG8gdGhlIHZhbHVlcyBhcnJheVxuICAgIGJveGVzLmZvckVhY2goKGJveCkgPT4ge1xuICAgICAgaWYgKGJveC5jaGVja2VkKSB2YWx1ZXMucHVzaChib3gudmFsdWUpO1xuICAgIH0pO1xuXG4gICAgaWYgKHZhbHVlcy5sZW5ndGggPiAwKSB7XG4gICAgICAvLyBXZSBuZWVkIGEgc3RhcnRlciBzdHJpbmcgc28gd2UgY2FuIHNsaWNlIGl0IGxhdGVyICUyOCBpcyBhbiBvcGVuIHBhcmVudGhlc2VzXG4gICAgICB0ZW1wb3JhcnlTdHIgKz0gJyUyOCc7XG5cbiAgICAgIC8vIEZvciBldmVyeSB2YWx1ZSBnaXZlbiBieSB0aGUgdXNlciB3ZSBuZWVkIHRvIGFkZCB0aGUgK09SK1xuICAgICAgLy8gdG8gdGhlIGVuZCBmb3IgZ3JvdXBpbmcuIFdlIHdpbGwgcmVtb3ZlIHRoZSArT1IrIGZyb20gdGhlIGxhc3RcbiAgICAgIC8vIGl0ZXJhdGlvbiBvZiB0aGUgbG9vcFxuICAgICAgdmFsdWVzLmZvckVhY2goKHZhbHVlKSA9PiAodGVtcG9yYXJ5U3RyICs9IGByYXJpdHklM0Eke3ZhbHVlfStPUitgKSk7XG5cbiAgICAgIC8vIFJlbW92ZSB0aGUgdW5uZWNlc3NhcnkgK09SKyBhdCB0aGUgZW5kXG4gICAgICB0ZW1wb3JhcnlTdHIgPSB0ZW1wb3JhcnlTdHIuc2xpY2UoMCwgLTQpO1xuXG4gICAgICAvLyBDbG9zZSB0aGUgcGFyZW50aGVzZXNcbiAgICAgIHRlbXBvcmFyeVN0ciArPSBgJTI5YDtcblxuICAgICAgdGhpcy5zZWFyY2ggKz0gYCske3RlbXBvcmFyeVN0cn1gO1xuICAgIH1cbiAgfVxuXG4gIHNlYXJjaEJ5Q29zdCgpIHtcbiAgICBjb25zdCBkZW5vbWluYXRpb24gPSBlbGVtZW50cy5hcGlTZWFyY2guZGVub21pbmF0aW9uLnZhbHVlO1xuICAgIGNvbnN0IHNvcnRCeSA9IGVsZW1lbnRzLmFwaVNlYXJjaC5kZW5vbWluYXRpb25Tb3J0QnkudmFsdWU7XG4gICAgY29uc3QgaW5wdXRWYWwgPSBlbGVtZW50cy5hcGlTZWFyY2guZGVub21pbmF0aW9uU29ydFZhbHVlLnZhbHVlO1xuXG4gICAgaWYgKGlucHV0VmFsKSB0aGlzLnNlYXJjaCArPSBgKyR7ZGVub21pbmF0aW9ufSR7c29ydEJ5fSR7aW5wdXRWYWx9YDtcbiAgfVxuXG4gIHF1aWNrU2VhcmNoKCkge1xuICAgIGxldCBjYXJkTmFtZSA9IGVsZW1lbnRzLm5hdi5zZWFyY2hJbnB1dC52YWx1ZTtcbiAgICBjYXJkTmFtZSA9IGNhcmROYW1lLnJlcGxhY2UoJyAnLCAnKycpO1xuICAgIHJldHVybiBjYXJkTmFtZTtcbiAgfVxuXG4gIHNvcnRSZXN1bHRzKCkge1xuICAgIGNvbnN0IHNvcnRCeSA9IGVsZW1lbnRzLmFwaVNlYXJjaC5jYXJkU29ydGVyLnZhbHVlO1xuICAgIHRoaXMuc2VhcmNoICs9IGAmb3JkZXI9JHtzb3J0Qnl9YDtcbiAgfVxuXG4gIC8vIFRoaXMgbWV0aG9kIHdpbGwgcnVuIGVhY2ggb2YgdGhlIGluZGl2aWR1YWwgc2VhcmNoIG1ldGhvZHMgdG8gYnVpbGQgdGhlIGZpbmFsIHNlYXJjaCBxdWVyeVxuICBidWlsZFNlYXJjaFF1ZXJ5KCkge1xuICAgIHRoaXMuc2VhcmNoQnlOYW1lKCk7XG4gICAgdGhpcy5zZWFyY2hCeU90ZXh0KCk7XG4gICAgdGhpcy5zZWFyY2hCeUNhcmRUeXBlKCk7XG4gICAgdGhpcy5zZWFyY2hCeUNvbG9yKCk7XG4gICAgdGhpcy5zZWFyY2hCeVN0YXRzKCk7XG4gICAgdGhpcy5zZWFyY2hCeUZvcm1hdCgpO1xuICAgIHRoaXMuc2VhcmNoQnlTZXQoKTtcbiAgICB0aGlzLnNlYXJjaEJ5UmFyaXR5KCk7XG4gICAgdGhpcy5zZWFyY2hCeUNvc3QoKTtcbiAgICB0aGlzLnNvcnRSZXN1bHRzKCk7XG5cbiAgICByZXR1cm4gdGhpcy5zZWFyY2g7XG4gIH1cblxuICByZXNldFNlYXJjaFF1ZXJ5KCkge1xuICAgIHRoaXMuc2VhcmNoID0gJyc7XG4gIH1cblxuICBkaXNwbGF5TWV0aG9kKCkge1xuICAgIHJldHVybiBlbGVtZW50cy5hcGlTZWFyY2guZGlzcGxheUFzLnZhbHVlO1xuICB9XG5cbiAgLy8gUmV0dW5zIHRoZSBmaXJzdCBwYWdlIG9mIGNhcmRzXG4gIGFzeW5jIGdldENhcmRzKHN0YXRlKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGF4aW9zXG4gICAgICAgIC5nZXQoYGh0dHBzOi8vYXBpLnNjcnlmYWxsLmNvbS9jYXJkcy9zZWFyY2g/cT0ke3N0YXRlLnF1ZXJ5fWApXG4gICAgICAgIC50aGVuKChyZXMpID0+IHtcbiAgICAgICAgICAvLyBVcGRhdGUgdGhlIHNlYXJjaFxuICAgICAgICAgIHRoaXMucmVzdWx0cyA9IHJlcy5kYXRhO1xuICAgICAgICAgIHRoaXMuY2FyZHMgPSByZXMuZGF0YS5kYXRhO1xuXG4gICAgICAgICAgLy8gU3RvcmUgdGhlIGNhcmRzIGluIHRoZSBhbGxDYXJkcyBhcnJheVxuICAgICAgICAgIHN0YXRlLmFsbENhcmRzLnB1c2gocmVzLmRhdGEuZGF0YSk7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgIGlmIChlcnIucmVzcG9uc2Uuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgICAgIHN0YXRlLmFsbENhcmRzLnB1c2goNDA0KTtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gVXNlZCBieSBnZXRBbGxDYXJkcyB0byBnZXQgZWFjaCBhcnJheSBvZiAxNzUgY2FyZHNcbiAgYXN5bmMgbG9vcE5leHRQYWdlKHN0YXRlLCBlbmFibGVCdG4pIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgYXhpb3MuZ2V0KHRoaXMucmVzdWx0cy5uZXh0X3BhZ2UpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAvLyBVcGRhdGUgdGhlIHJlc3VsdHMgb2JqZWN0XG4gICAgICAgIHRoaXMucmVzdWx0cyA9IHJlcy5kYXRhO1xuXG4gICAgICAgIC8vIFB1c2ggdGhlIGNhcmRzIGZyb20gdGhpcyByZXN1bHQgaW50byB0aGUgYWxsQ2FyZHMgYXJyYXlcbiAgICAgICAgc3RhdGUuYWxsQ2FyZHMucHVzaChyZXMuZGF0YS5kYXRhKTtcblxuICAgICAgICAvLyBFbmFibGUgdGhlIG5leHQgcGFnZSBidG4gYW5kIHJlc29sdmUgdGhlIHByb21pc2VcbiAgICAgICAgZW5hYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLm5leHRQYWdlQnRuKCkpO1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFdpbGwgcnVuIGluIHRoZSBiYWNrZ3JvdW5kIGFmdGVyIHRoZSBmaXJzdCBzZXQgb2YgY2FyZHMgaXMgcmV0cmlldmVkIHRvIG1ha2UgbW92aW5nIGJldHdlZW4gcmVzdWx0c1xuICAvLyBwYWdlcyBmYXN0ZXJcbiAgYXN5bmMgZ2V0QWxsQ2FyZHMoc3RhdGUsIGVuYWJsZUJ0bikge1xuICAgIC8vIEFzIGxvbmcgYXMgdGhlcmUgaXMgYSBuZXh0X3BhZ2Uga2VlcCBsb2FkaW5nIHRoZSBjYXJkc1xuICAgIHdoaWxlICh0aGlzLnJlc3VsdHMubmV4dF9wYWdlKSBhd2FpdCB0aGlzLmxvb3BOZXh0UGFnZShzdGF0ZSwgZW5hYmxlQnRuKTtcblxuICAgIC8vIFVwZGF0ZSB0aGUgc3RhdGUgb25jZSBhbGwgY2FyZHMgaGF2ZSBiZWVuIHJldHJlaWV2ZWRcbiAgICBzdGF0ZS5hbGxSZXN1bHRzTG9hZGVkID0gdHJ1ZTtcblxuICAgIC8vIElmIHRoZXJlIGlzIGF0IGxlYXN0IDIgcGFnZXMgb2YgY2FyZHMsIGVuYWJsZSB0aGUgbGFzdCBwYWdlIGJ0bi5cbiAgICBpZiAoc3RhdGUuYWxsQ2FyZHMubGVuZ3RoID4gMSkgZW5hYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLmxhc3RQYWdlQnRuKTtcbiAgfVxufVxuIiwiZXhwb3J0IGNvbnN0IGVsZW1lbnRzID0ge1xuICBuYXY6IHtcbiAgICBxdWlja1NlYXJjaEJ0bjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1uYXYtc2VhcmNoJyksXG4gICAgc2VhcmNoSW5wdXQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tbmF2LXNlYXJjaC1pbnB1dCcpLFxuICB9LFxuICBhcGlTZWFyY2g6IHtcbiAgICBjYXJkTmFtZTogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktY2FyZC1uYW1lJyksXG4gICAgb3JhY2xlVGV4dDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktby10ZXh0JyksXG4gICAgdHlwZUxpbmU6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXR5cGUtbGluZScpLFxuICAgIHNlbGVjdGVkVHlwZXM6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXNlbGVjdGVkLXR5cGVzJyksXG4gICAgaW5jbHVkZVBhcnRpYWxUeXBlczogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktdHlwZS1ib3gnKSxcbiAgICB0eXBlRHJvcERvd246IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXR5cGVzLWRyb3Bkb3duJyksXG4gICAgY29sb3JCb3hlczogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1hcGktY29sb3ItYm94JyksXG4gICAgY29sb3JTb3J0Qnk6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLWNvbG9yLXNvcnRlcicpLFxuICAgIHN0YXQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXN0YXQnKSxcbiAgICBzdGF0RmlsdGVyOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1zdGF0LWZpbHRlcicpLFxuICAgIHN0YXRWYWx1ZTogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktc3RhdC12YWx1ZScpLFxuICAgIGxlZ2FsU3RhdHVzOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1sZWdhbC1zdGF0dXMnKSxcbiAgICBmb3JtYXQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLWZvcm1hdCcpLFxuICAgIHNldElucHV0OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1zZXQnKSxcbiAgICBzZXREcm9wRG93bjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktc2V0LWRyb3Bkb3duJyksXG4gICAgc2VsZWN0ZWRTZXRzOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1zZWxlY3RlZC1zZXRzJyksXG4gICAgYmxvY2s6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLWJsb2NrJyksXG4gICAgcmFyaXR5Qm94ZXM6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tYXBpLXJhcml0eS1ib3gnKSxcbiAgICBkZW5vbWluYXRpb246IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLWRlbm9taW5hdGlvbicpLFxuICAgIGRlbm9taW5hdGlvblNvcnRCeTogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktZGVub21pbmF0aW9uLXNvcnQtYnknKSxcbiAgICBkZW5vbWluYXRpb25Tb3J0VmFsdWU6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAnLmpzLS1hcGktZGVub21pbmF0aW9uLXNvcnQtdmFsdWUnXG4gICAgKSxcbiAgICBjYXJkU29ydGVyOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1yZXN1bHRzLXNvcnRlcicpLFxuICAgIGRpc3BsYXlBczogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktc2VhcmNoLWRpc3BsYXktc2VsZWN0b3InKSxcbiAgICBzdWJtaXRCdG46IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLWJ0bicpLFxuICB9LFxuICByZXN1bHRzUGFnZToge1xuICAgIHJlc3VsdHNDb250YWluZXI6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXJlc3VsdHMtZGlzcGxheScpLFxuICAgIGRpc3BsYXlTZWxlY3RvcjogKCkgPT4ge1xuICAgICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoIDwgODUxKVxuICAgICAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1yZXN1bHRzLWRpc3BsYXktb3B0aW9uLW1vYmlsZScpO1xuICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tcmVzdWx0cy1kaXNwbGF5LW9wdGlvbicpO1xuICAgIH0sXG4gICAgc29ydEJ5OiAoKSA9PiB7XG4gICAgICBpZiAod2luZG93LmlubmVyV2lkdGggPCA4NTEpXG4gICAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXJlc3VsdHMtc29ydC1vcHRpb25zLW1vYmlsZScpO1xuICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tcmVzdWx0cy1zb3J0LW9wdGlvbnMnKTtcbiAgICB9LFxuICAgIGJ0bjogKCkgPT4ge1xuICAgICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoIDwgODUxKVxuICAgICAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1yZXN1bHRzLXN1Ym1pdC1idG4tbW9iaWxlJyk7XG4gICAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1yZXN1bHRzLXN1Ym1pdC1idG4nKTtcbiAgICB9LFxuICAgIGNhcmRDaGVja2xpc3Q6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tY2FyZC1jaGVja2xpc3QnKSxcbiAgICBpbWFnZUdyaWQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taW1hZ2UtZ3JpZCcpLFxuICAgIGRpc3BsYXlCYXI6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLWRpc3BsYXktYmFyJyksXG4gICAgZmlyc3RQYWdlQnRuOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1maXJzdC1wYWdlJyksXG4gICAgbGFzdFBhZ2VCdG46IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLWxhc3QtcGFnZScpLFxuICAgIHByZXZpb3VzUGFnZUJ0bjogKCkgPT4ge1xuICAgICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoIDwgODUxKVxuICAgICAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktcHJldmlvdXMtcGFnZS1tb2JpbGUnKTtcbiAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1wcmV2aW91cy1wYWdlJyk7XG4gICAgfSxcbiAgICBuZXh0UGFnZUJ0bjogKCkgPT4ge1xuICAgICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoIDwgODUxKVxuICAgICAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktbmV4dC1wYWdlLW1vYmlsZScpO1xuICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLW5leHQtcGFnZScpO1xuICAgIH0sXG4gIH0sXG4gIGNhcmQ6IHtcbiAgICBtYW5hQ29zdFRpdGxlU3BhbjogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1jYXJkLW1hbmEtY29zdCcpLFxuICAgIG9yYWNsZVRleHRzOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLW9yYWNsZS10ZXh0LWxpbmUnKSxcbiAgICBsZWdhbGl0aWVzOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWNhcmQtbGVnYWxpdHknKSxcbiAgICBwcmludFJvd3M6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tY2FyZC1wcmludC1yb3cnKSxcbiAgICBwcmljZXM6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tY2FyZC1wcmljZScpLFxuICAgIGNhcmRQcmludExpbmtzOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWNhcmQtcHJpbnQtbGluaycpLFxuICAgIGZyb250OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWZyb250JyksXG4gICAgYmFjazogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1iYWNrJyksXG4gICAgdHJhbnNmb3JtQnRuOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWNhcmQtdHJhbnNmb3JtJyksXG4gIH0sXG59O1xuIiwiaW1wb3J0IHsgZ2VuZXJhdGVNYW5hQ29zdEltYWdlcyB9IGZyb20gJy4vcmVzdWx0c1ZpZXcnO1xuaW1wb3J0IHsgZWxlbWVudHMgfSBmcm9tICcuL2Jhc2UnO1xuXG5leHBvcnQgY29uc3QgaW5zZXJ0TWFuYUNvc3RUb0NhcmRUZXh0VGl0bGUgPSAoKSA9PiB7XG4gIGNvbnN0IG1hbmFDb3N0cyA9IEFycmF5LmZyb20oZWxlbWVudHMuY2FyZC5tYW5hQ29zdFRpdGxlU3Bhbik7XG5cbiAgbWFuYUNvc3RzLmZvckVhY2goKGNvc3QpID0+IHtcbiAgICBjb3N0LmlubmVySFRNTCA9IGdlbmVyYXRlTWFuYUNvc3RJbWFnZXMoXG4gICAgICBjb3N0LmdldEF0dHJpYnV0ZSgnZGF0YS1tYW5hLWNvc3QnKVxuICAgICk7XG4gIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IGluc2VydE1hbmFDb3N0VG9PcmFjbGVUZXh0ID0gKCkgPT4ge1xuICBjb25zdCBvcmFjbGVUZXh0cyA9IEFycmF5LmZyb20oZWxlbWVudHMuY2FyZC5vcmFjbGVUZXh0cyk7XG5cbiAgaWYgKG9yYWNsZVRleHRzLmxlbmd0aCA+IDApIHtcbiAgICBvcmFjbGVUZXh0cy5mb3JFYWNoKFxuICAgICAgKHRleHQpID0+ICh0ZXh0LmlubmVySFRNTCA9IGdlbmVyYXRlTWFuYUNvc3RJbWFnZXModGV4dC5pbm5lckhUTUwsICd4cycpKVxuICAgICk7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCByZW1vdmVVbmRlclNjb3JlRnJvbUxlZ2FsU3RhdHVzID0gKCkgPT4ge1xuICBjb25zdCBsZWdhbGl0aWVzID0gQXJyYXkuZnJvbShlbGVtZW50cy5jYXJkLmxlZ2FsaXRpZXMpO1xuXG4gIGxlZ2FsaXRpZXMuZm9yRWFjaCgobGVnYWxpdHkpID0+IHtcbiAgICBpZiAobGVnYWxpdHkuaW5uZXJIVE1MLmluY2x1ZGVzKCdfJykpIHtcbiAgICAgIGxlZ2FsaXR5LmlubmVySFRNTCA9IGxlZ2FsaXR5LmlubmVySFRNTC5yZXBsYWNlKCdfJywgJyAnKTtcbiAgICB9XG4gIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IGZpeENhcmRQcmljZXMgPSAoKSA9PiB7XG4gIGNvbnN0IHByaWNlcyA9IEFycmF5LmZyb20oZWxlbWVudHMuY2FyZC5wcmljZXMpO1xuXG4gIHByaWNlcy5mb3JFYWNoKChwcmljZSkgPT4ge1xuICAgIGlmIChwcmljZS5pbm5lckhUTUwuaW5jbHVkZXMoJ05vbmUnKSkgcHJpY2UuaW5uZXJIVE1MID0gJy0nO1xuICB9KTtcbn07XG5cbmNvbnN0IGZpeERvdWJsZVNpZGVkQ2FyZE5hbWUgPSAoY2FyZE5hbWUpID0+IHtcbiAgaWYgKGNhcmROYW1lLmluY2x1ZGVzKCcvJykpIHtcbiAgICBjYXJkTmFtZSA9IGNhcmROYW1lLnN1YnN0cmluZygwLCBjYXJkTmFtZS5pbmRleE9mKCcvJykgLSAxKTtcbiAgfVxuICByZXR1cm4gY2FyZE5hbWU7XG59O1xuXG5leHBvcnQgY29uc3Qgc2V0UHJpbnRMaW5rSHJlZiA9ICgpID0+IHtcbiAgY29uc3QgbGlua3MgPSBBcnJheS5mcm9tKGVsZW1lbnRzLmNhcmQuY2FyZFByaW50TGlua3MpO1xuXG4gIGxpbmtzLmZvckVhY2goKGxpbmspID0+IHtcbiAgICBsZXQgY2FyZE5hbWUgPSBsaW5rLmdldEF0dHJpYnV0ZSgnZGF0YS1uYW1lJykucmVwbGFjZUFsbCgnICcsICctJyk7XG4gICAgY2FyZE5hbWUgPSBmaXhEb3VibGVTaWRlZENhcmROYW1lKGNhcmROYW1lKTtcbiAgICBjb25zdCBzZXRDb2RlID0gbGluay5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2V0Jyk7XG5cbiAgICBsaW5rLmhyZWYgPSBgL2NhcmQvJHtzZXRDb2RlfS8ke2NhcmROYW1lfWA7XG4gIH0pO1xufTtcblxuY29uc3Qgc2V0RG91YmxlU2lkZWRUcmFuc2l0aW9uID0gKCkgPT4ge1xuICAvLyBDaGVja3MgdG8gc2VlIGlmIGFuIGlubGluZSBzdHlsZSBoYXMgYmVlbiBzZXQgZm9yIHRoZSBmcm9udCBvZiB0aGUgY2FyZC5cbiAgLy8gSWYgbm90LCBzZXQgYSB0cmFuc2l0b24uIFRoaXMgbWFrZXMgc3VyZSB3ZSBkb24ndCBzZXQgdGhlIHRyYW5zaXRvbiBldmVyeVxuICAvLyB0aW1lIHRoZSBjYXJkIGlzIGZsaXBwZWQuXG5cbiAgaWYgKCFlbGVtZW50cy5jYXJkLmZyb250LmdldEF0dHJpYnV0ZSgnc3R5bGUnKSkge1xuICAgIGVsZW1lbnRzLmNhcmQuZnJvbnQuc3R5bGUudHJhbnNpdGlvbiA9IGBhbGwgLjhzIGVhc2VgO1xuICAgIGVsZW1lbnRzLmNhcmQuYmFjay5zdHlsZS50cmFuc2l0aW9uID0gYGFsbCAuOHMgZWFzZWA7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBmbGlwVG9CYWNrU2lkZSA9ICgpID0+IHtcbiAgLy8gU2V0cyB0aGUgdHJhbnNpdGlvbiBwcm9wZXJ0eSBvbiBib3RoIHNpZGVzIG9mIHRoZSBjYXJkIHRoZSBmaXJzdCB0aW1lIHRoZVxuICAvLyB0cmFuc2Zvcm0gYnV0dG9uIGlzIGNsaWNrZWRcbiAgc2V0RG91YmxlU2lkZWRUcmFuc2l0aW9uKCk7XG5cbiAgLy8gUm90YXRlcyB0aGUgY2FyZCB0byBzaG93IHRoZSBiYWNrc2lkZS5cbiAgZWxlbWVudHMuY2FyZC5mcm9udC5zdHlsZS50cmFuc2Zvcm0gPSBgcm90YXRlWSgtMTgwZGVnKWA7XG4gIGVsZW1lbnRzLmNhcmQuYmFjay5zdHlsZS50cmFuc2Zvcm0gPSBgcm90YXRlWSgwKWA7XG5cbiAgLy8gUmVzZXQgdGhlIGV2ZW50IGxpc3RlbmVyIHNvIHRoYXQgb24gY2xpY2tpbmcgdGhlIGJ1dHRvbiBpdCB3aWxsIGZsaXBcbiAgLy8gYmFjayB0byB0aGUgZnJvbnQgb2YgdGhlIGNhcmRcbiAgZWxlbWVudHMuY2FyZC50cmFuc2Zvcm1CdG4ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmbGlwVG9CYWNrU2lkZSk7XG4gIGVsZW1lbnRzLmNhcmQudHJhbnNmb3JtQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZmxpcFRvRnJvbnRTaWRlKTtcbn07XG5cbmV4cG9ydCBjb25zdCBmbGlwVG9Gcm9udFNpZGUgPSAoKSA9PiB7XG4gIGVsZW1lbnRzLmNhcmQuZnJvbnQuc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZVkoMClgO1xuICBlbGVtZW50cy5jYXJkLmJhY2suc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZVkoMTgwZGVnKWA7XG5cbiAgLy8gUmVzZXQgdGhlIGV2ZW50IGxpc3RlbmVyIHNvIHRoYXQgb24gY2xpY2tpbmcgdGhlIGJ1dHRvbiBpdCB3aWxsIGZsaXBcbiAgLy8gdG8gdGhlIGJhY2tzaWRlIG9mIHRoZSBjYXJkXG4gIGVsZW1lbnRzLmNhcmQudHJhbnNmb3JtQnRuLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZmxpcFRvRnJvbnRTaWRlKTtcbiAgZWxlbWVudHMuY2FyZC50cmFuc2Zvcm1CdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmbGlwVG9CYWNrU2lkZSk7XG59O1xuXG4vLyBDcmVhdGUgdGhlIGhvdmVyIGVmZmVjdCBvbiBlYWNoIHJvdyB0aGF0IGRpc3BsYXlzIHRoZSBpbWFnZSBvZiB0aGUgY2FyZFxuZXhwb3J0IGNvbnN0IHByaW50TGlzdEhvdmVyRXZlbnRzID0gKCkgPT4ge1xuICAvLyBHZXQgdGhlIEhUTUwgZm9yIGVhY2ggdGFibGUgcm93XG4gIGNvbnN0IHByaW50cyA9IEFycmF5LmZyb20oZWxlbWVudHMuY2FyZC5wcmludFJvd3MpO1xuXG4gIHByaW50cy5mb3JFYWNoKChwcmludCkgPT4ge1xuICAgIHByaW50Lm9ubW91c2Vtb3ZlID0gKGUpID0+IHtcbiAgICAgIC8vIElmIHRoZSB3aW5kb3cgaXMgc21hbGxlciB0aGFuIDc2OCBwaXhlbHMsIGRvbid0IGRpc3BsYXkgYW55IGltYWdlc1xuICAgICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoIDwgNzY4KSByZXR1cm4gZmFsc2U7XG5cbiAgICAgIC8vIElmIHRoZXJlIGlzIGFscmVhZHkgYW4gaW1hZ2UgYmVpbmcgZGlzcGxheWVkLCByZW1vdmUgaXQgZnJvbSB0aGUgRE9NXG4gICAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRvb2x0aXAnKSkge1xuICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50b29sdGlwJykpO1xuICAgICAgfVxuXG4gICAgICAvLyBQcmVwIHRoZSBkaXYuXG4gICAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGRpdi5jbGFzc05hbWUgPSAndG9vbHRpcCc7XG5cbiAgICAgIC8vIFRoZSBkaXYgaXMgc3R5bGVkIHdpdGggcG9zaXRpb24gYWJzb2x1dGUuIFRoaXMgY29kZSBwdXRzIGl0IGp1c3QgdG8gdGhlIHJpZ2h0IG9mIHRoZSBjdXJzb3JcbiAgICAgIGRpdi5zdHlsZS5sZWZ0ID0gZS5wYWdlWCArIDUwICsgJ3B4JztcbiAgICAgIGRpdi5zdHlsZS50b3AgPSBlLnBhZ2VZIC0gMzAgKyAncHgnO1xuXG4gICAgICAvLyBQcmVwIHRoZSBpbWcgZWxlbWVudFxuICAgICAgY29uc3QgaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG4gICAgICBpbWcuY2xhc3NOYW1lID0gJ3Rvb2x0aXBfX2ltZyc7XG4gICAgICBpbWcuc3JjID0gcHJpbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWNhcmRJbWcnKTtcblxuICAgICAgLy8gUHV0IHRoZSBpbWcgaW50byB0aGUgZGl2IGFuZCB0aGVuIGFwcGVuZCB0aGUgZGl2IGRpcmVjdGx5IHRvIHRoZSBib2R5IG9mIHRoZSBkb2N1bWVudC5cbiAgICAgIGRpdi5hcHBlbmRDaGlsZChpbWcpO1xuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkaXYpO1xuICAgIH07XG5cbiAgICAvLyBSZW1vdmUgdGhlIGltZyB3aGVuIHRha2luZyB0aGUgY3Vyc29yIG9mZiB0aGUgcHJpbnRcbiAgICBwcmludC5vbm1vdXNlb3V0ID0gKGUpID0+IHtcbiAgICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudG9vbHRpcCcpKSB7XG4gICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRvb2x0aXAnKSk7XG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG59O1xuXG5leHBvcnQgY29uc3Qgc2hvcnRlbkNhcmROYW1lID0gKCkgPT4ge1xuICBjb25zdCBuYW1lcyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1jYXJkLW5hbWUnKSk7XG4gIGNvbnNvbGUubG9nKG5hbWVzKTtcblxuICBuYW1lcy5mb3JFYWNoKChuKSA9PiB7XG4gICAgaWYgKG4uaW5uZXJUZXh0LmluY2x1ZGVzKCcvJykpIHtcbiAgICAgIG4uaW5uZXJIVE1MID0gbi5pbm5lckhUTUwuc3Vic3RyaW5nKDAsIG4uaW5uZXJIVE1MLmluZGV4T2YoJy8nKSAtIDEpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5leHBvcnQgY29uc3QgY2hlY2tQcmljZUlucHV0Rm9yRGlnaXRzID0gKGUpID0+IHtcbiAgY29uc3QgcHJpY2VJbnB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYWRkLXRvLWludi1wcmljZScpLnZhbHVlO1xuXG4gIGlmIChpc05hTihwcmljZUlucHV0KSAmJiBwcmljZUlucHV0ICE9PSAnJykge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICByZW5kZXJQcmljZUlucHV0RXJyb3JNZXNzYWdlKCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59O1xuXG5jb25zdCByZW5kZXJQcmljZUlucHV0RXJyb3JNZXNzYWdlID0gKCkgPT4ge1xuICBjb25zdCBwcmljZUlucHV0RGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hZGQtdG8taW52LXByaWNlLWRpdicpO1xuICBjb25zdCBtc2cgPSBgPHAgY2xhc3M9XCJhZGQtdG8taW52LXByaWNlLW1zZ1wiPkludmFsaWQgcHJpY2UuIE11c3QgYmUgYSBudW1iZXIuPC9wPmA7XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYWRkLXRvLWludi1wcmljZS1tc2cnKSkge1xuICAgIHByaWNlSW5wdXREaXYuaW5zZXJ0QWRqYWNlbnRIVE1MKCdiZWZvcmVlbmQnLCBtc2cpO1xuICB9XG59O1xuIiwiaW1wb3J0IHsgZWxlbWVudHMgfSBmcm9tICcuL2Jhc2UnO1xuaW1wb3J0ICogYXMgc2VhcmNoVmlldyBmcm9tICcuL3NlYXJjaFZpZXcnO1xuXG5leHBvcnQgY29uc3QgY2hlY2tQcmljZUlucHV0Rm9yRGlnaXRzID0gKGUpID0+IHtcbiAgY29uc3QgcHJpY2VJbnB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taW52LWRlbm9taW5hdGlvbi1zb3J0LXZhbHVlJylcbiAgICAudmFsdWU7XG5cbiAgaWYgKGlzTmFOKHByaWNlSW5wdXQpICYmIHByaWNlSW5wdXQgIT09ICcnKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHJlbmRlclByaWNlSW5wdXRFcnJvck1lc3NhZ2UoKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn07XG5cbmNvbnN0IHJlbmRlclByaWNlSW5wdXRFcnJvck1lc3NhZ2UgPSAoKSA9PiB7XG4gIGNvbnN0IHByaWNlSW5wdXREaXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWludi1zZWFyY2gtcHJpY2UtZGl2Jyk7XG4gIGNvbnN0IG1zZyA9IGA8cCBjbGFzcz1cImludi1zZWFyY2gtcHJpY2UtbXNnXCI+SW52YWxpZCBwcmljZS4gTXVzdCBiZSBhIG51bWJlci48L3A+YDtcblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5pbnYtc2VhcmNoLXByaWNlLW1zZycpKSB7XG4gICAgcHJpY2VJbnB1dERpdi5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWVuZCcsIG1zZyk7XG4gIH1cbn07XG5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKiBUWVBFIExJTkUgKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcblxuY29uc3QgaGlkZVR5cGVzRHJvcERvd25CdXRLZWVwVmFsdWUgPSAoKSA9PiB7XG4gIGlmICghZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVEcm9wRG93bi5oYXNBdHRyaWJ1dGUoJ2hpZGRlbicpKSB7XG4gICAgZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVEcm9wRG93bi5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG5hdmlnYXRlVHlwZXNEcm9wRG93bik7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBzdGFydFR5cGVzRHJvcERvd25OYXZpZ2F0aW9uID0gKCkgPT4ge1xuICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgbmF2aWdhdGVUeXBlc0Ryb3BEb3duKTtcbiAgY29uc3QgZmlyc3RUeXBlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS10eXBlOm5vdChbaGlkZGVuXSknKTtcbiAgc2VhcmNoVmlldy5oaWdobGlnaHRUeXBlKGZpcnN0VHlwZSk7XG4gIHNlYXJjaFZpZXcuaG92ZXJPdmVyVHlwZXNMaXN0ZW5lcigpO1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgbmF2aWdhdGVUeXBlc0Ryb3BEb3duKTtcbiAgZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVEcm9wRG93bi5zY3JvbGxUb3AgPSAwO1xufTtcblxuY29uc3QgbmF2aWdhdGVUeXBlc0Ryb3BEb3duID0gKGUpID0+IHtcbiAgY29uc3QgdHlwZXMgPSBBcnJheS5mcm9tKFxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tdHlwZTpub3QoW2hpZGRlbl0pJylcbiAgKTtcbiAgY29uc3QgaSA9IHR5cGVzLmluZGV4T2YoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1oaWdobGlnaHRlZCcpKTtcblxuICBpZiAoZS5jb2RlID09PSAnQXJyb3dEb3duJyAmJiBpIDwgdHlwZXMubGVuZ3RoIC0gMSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBzZWFyY2hWaWV3LnJlbW92ZUN1cnJlbnRIaWdobGlnaHQoKTtcbiAgICBzZWFyY2hWaWV3LmhpZ2hsaWdodFR5cGUodHlwZXNbaSArIDFdKTtcblxuICAgIHNlYXJjaFZpZXcuc2V0U2Nyb2xsVG9wT25Eb3duQXJyb3coXG4gICAgICB0eXBlc1tpICsgMV0sXG4gICAgICBlbGVtZW50cy5hcGlTZWFyY2gudHlwZURyb3BEb3duXG4gICAgKTtcbiAgfVxuXG4gIGlmIChlLmNvZGUgPT09ICdBcnJvd1VwJykge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIC8vIFdlIGFsd2F5cyB3YW50IHRvIHByZXZlbnQgdGhlIGRlZmF1bHQuIFdlIG9ubHkgd2FudCB0byBjaGFuZ2UgdGhlXG4gICAgLy8gaGlnaGxpZ2h0IGlmIG5vdCBvbiB0aGUgdG9wIHR5cGUgaW4gdGhlIGRyb3Bkb3duXG4gICAgaWYgKGkgPiAwKSB7XG4gICAgICBzZWFyY2hWaWV3LnJlbW92ZUN1cnJlbnRIaWdobGlnaHQoKTtcbiAgICAgIHNlYXJjaFZpZXcuaGlnaGxpZ2h0VHlwZSh0eXBlc1tpIC0gMV0pO1xuXG4gICAgICBzZWFyY2hWaWV3LnNldFNjcm9sbFRvcE9uVXBBcnJvdyhcbiAgICAgICAgdHlwZXNbaSAtIDFdLFxuICAgICAgICBlbGVtZW50cy5hcGlTZWFyY2gudHlwZURyb3BEb3duXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGlmIChlLmNvZGUgPT09ICdFbnRlcicpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgc2V0SW5wdXRWYWx1ZShcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taGlnaGxpZ2h0ZWQnKS5nZXRBdHRyaWJ1dGUoJ2RhdGEtdHlwZScpXG4gICAgKTtcbiAgICBoaWRlVHlwZXNEcm9wRG93bkJ1dEtlZXBWYWx1ZSgpO1xuICB9XG59O1xuXG5jb25zdCBzZXRJbnB1dFZhbHVlID0gKHR5cGUpID0+IHtcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktdHlwZS1saW5lJykudmFsdWUgPSB0eXBlO1xufTtcblxuZXhwb3J0IGNvbnN0IHR5cGVMaW5lTGlzdGVuZXIgPSAoZSkgPT4ge1xuICAvLyBJZiB0aGUgdGFyZ2V0IGlzIG5vdCBUeXBlIExpbmUgaW5wdXQgbGluZSwgb3IgYW4gZWxlbWVudCBpbiB0aGUgZHJvcGRvd24gbGlzdCxcbiAgLy8gY2xvc2UgdGhlIGRyb3Bkb3duIGFuZCByZW1vdmUgdGhlIGV2ZW50IGxpc3RlbmVyXG4gIGlmIChcbiAgICBlLnRhcmdldCAhPT0gZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVMaW5lICYmXG4gICAgIWUudGFyZ2V0Lm1hdGNoZXMoJy5qcy0tYXBpLWRyb3Bkb3duLXR5cGVzLWxpc3QnKVxuICApIHtcbiAgICBzZWFyY2hWaWV3LmhpZGVUeXBlc0Ryb3BEb3duKCk7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0eXBlTGluZUxpc3RlbmVyKTtcbiAgICAvLyBJZiB0aGUgdGFyZ2V0IGlzIG9uZSBpZiB0eXBlcywgZ2V0IHRoZSBkYXRhIHR5cGVcbiAgfSBlbHNlIGlmIChlLnRhcmdldC5oYXNBdHRyaWJ1dGUoJ2RhdGEtdHlwZScpKSB7XG4gICAgc2V0SW5wdXRWYWx1ZShlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdHlwZScpKTtcbiAgICBlbGVtZW50cy5hcGlTZWFyY2gudHlwZUxpbmUuZm9jdXMoKTtcbiAgICBoaWRlVHlwZXNEcm9wRG93bkJ1dEtlZXBWYWx1ZSgpO1xuICB9XG59O1xuXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKiogU0VUUyAqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG5cbmNvbnN0IGhpZGVTZXRzRHJvcERvd25CdXRLZWVwVmFsdWUgPSAoKSA9PiB7XG4gIGlmICghZWxlbWVudHMuYXBpU2VhcmNoLnNldERyb3BEb3duLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIHtcbiAgICBlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd24uc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBuYXZpZ2F0ZVNldHNEcm9wRG93bik7XG4gIH1cbn07XG5cbmNvbnN0IG5hdmlnYXRlU2V0c0Ryb3BEb3duID0gKGUpID0+IHtcbiAgY29uc3Qgc2V0cyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1zZXQ6bm90KFtoaWRkZW5dKScpKTtcbiAgY29uc3QgaSA9IHNldHMuaW5kZXhPZihkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWhpZ2hsaWdodGVkJykpO1xuXG4gIGlmIChlLmNvZGUgPT09ICdBcnJvd0Rvd24nICYmIGkgPCBzZXRzLmxlbmd0aCAtIDEpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgc2VhcmNoVmlldy5yZW1vdmVDdXJyZW50SGlnaGxpZ2h0KCk7XG4gICAgc2VhcmNoVmlldy5oaWdobGlnaHRTZXQoc2V0c1tpICsgMV0pO1xuXG4gICAgc2VhcmNoVmlldy5zZXRTY3JvbGxUb3BPbkRvd25BcnJvdyhcbiAgICAgIHNldHNbaSArIDFdLFxuICAgICAgZWxlbWVudHMuYXBpU2VhcmNoLnNldERyb3BEb3duXG4gICAgKTtcbiAgfVxuXG4gIGlmIChlLmNvZGUgPT09ICdBcnJvd1VwJyAmJiBpID4gMCkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBzZWFyY2hWaWV3LnJlbW92ZUN1cnJlbnRIaWdobGlnaHQoKTtcbiAgICBzZWFyY2hWaWV3LmhpZ2hsaWdodFNldChzZXRzW2kgLSAxXSk7XG5cbiAgICBzZWFyY2hWaWV3LnNldFNjcm9sbFRvcE9uVXBBcnJvdyhcbiAgICAgIHNldHNbaSAtIDFdLFxuICAgICAgZWxlbWVudHMuYXBpU2VhcmNoLnNldERyb3BEb3duXG4gICAgKTtcbiAgfVxuXG4gIGlmIChlLmNvZGUgPT09ICdFbnRlcicpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICBhZGRTZXQoXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWhpZ2hsaWdodGVkJykuZ2V0QXR0cmlidXRlKCdkYXRhLXNldC1uYW1lJylcbiAgICApO1xuXG4gICAgaGlkZVNldHNEcm9wRG93bkJ1dEtlZXBWYWx1ZSgpO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3Qgc3RhcnRTZXRzRHJvcERvd25OYXZpZ2F0aW9uID0gKCkgPT4ge1xuICBjb25zdCBmaXJzdFNldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tc2V0Om5vdChbaGlkZGVuXSknKTtcbiAgc2VhcmNoVmlldy5oaWdobGlnaHRTZXQoZmlyc3RTZXQpO1xuICBzZWFyY2hWaWV3LmhvdmVyT3ZlclNldHNMaXN0ZW5lcigpO1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgbmF2aWdhdGVTZXRzRHJvcERvd24pO1xuICBlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd24uc2Nyb2xsVG9wID0gMDtcbn07XG5cbmNvbnN0IGFkZFNldCA9IChzZXROYW1lKSA9PiB7XG4gIGVsZW1lbnRzLmFwaVNlYXJjaC5zZXRJbnB1dC52YWx1ZSA9IHNldE5hbWU7XG59O1xuXG5leHBvcnQgY29uc3Qgc2V0SW5wdXRMaXN0ZW5lciA9IChlKSA9PiB7XG4gIC8vIElmIHRoZSB0YXJnZXQgaXMgbm90IHRoZSBzZXQgaW5wdXQgZmllbGQsIG9yIGFuIGVsZW1lbnQgaW4gdGhlIGRyb3Bkb3duIGxpc3QsXG4gIC8vIGNsb3NlIHRoZSBkcm9wZG93biBhbmQgcmVtb3ZlIHRoZSBldmVudCBsaXN0ZW5lclxuICBpZiAoXG4gICAgZS50YXJnZXQgIT09IGVsZW1lbnRzLmFwaVNlYXJjaC5zZXRJbnB1dCAmJlxuICAgICFlLnRhcmdldC5tYXRjaGVzKCcuanMtLWFwaS1kcm9wZG93bi1zZXRzLWxpc3QnKVxuICApIHtcbiAgICBzZWFyY2hWaWV3LmhpZGVTZXRzRHJvcERvd24oKTtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHNldElucHV0TGlzdGVuZXIpO1xuICAgIC8vIElmIHRoZSB0YXJnZXQgaXMgb25lIG9mIHRoZSBzZXQgb3B0aW9ucywgdG9nZ2xlIGl0IGFzIHNlbGVjdGVkLCBhZGQgaXQgdG8gdGhlIGxpc3QsXG4gICAgLy8gYW5kIGhpZGUgdGhlIGRyb3Bkb3duLlxuICB9IGVsc2UgaWYgKGUudGFyZ2V0Lmhhc0F0dHJpYnV0ZSgnZGF0YS1zZXQtbmFtZScpKSB7XG4gICAgYWRkU2V0KGUudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1zZXQtbmFtZScpKTtcbiAgICBlbGVtZW50cy5hcGlTZWFyY2guc2V0SW5wdXQuZm9jdXMoKTtcbiAgICBoaWRlU2V0c0Ryb3BEb3duQnV0S2VlcFZhbHVlKCk7XG4gIH1cbn07XG4iLCJpbXBvcnQgeyBnZW5lcmF0ZU1hbmFDb3N0SW1hZ2VzIH0gZnJvbSAnLi9yZXN1bHRzVmlldyc7XG5pbXBvcnQgeyBjaGVja0xpc3RIb3ZlckV2ZW50cyB9IGZyb20gJy4vcmVzdWx0c1ZpZXcnO1xuXG5jb25zdCBzaG9ydGVuVHlwZUxpbmUgPSAoKSA9PiB7XG4gIGNvbnN0IHR5cGVzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWludi10eXBlcycpKTtcbiAgdHlwZXMuZm9yRWFjaCgodHlwZSkgPT4ge1xuICAgIGxldCBodG1sID0gdHlwZS5pbm5lckhUTUw7XG5cbiAgICAvLyBpZiB0aGUg4oCUIGRlbGltaXRlciBpcyBmb3VuZCBpbiB0aGUgc3RyaW5nLCByZXR1cm4gZXZlcnl0aGluZyBiZWZvcmUgdGhlIGRlbGltaXRlclxuICAgIGlmIChodG1sLmluZGV4T2YoJ+KAlCcpICE9PSAtMSkge1xuICAgICAgdHlwZS5pbm5lckhUTUwgPSBodG1sLnN1YnN0cmluZygwLCBodG1sLmluZGV4T2YoJ+KAlCcpIC0gMSk7XG4gICAgfVxuICB9KTtcbn07XG5cbmNvbnN0IGFsdGVyTWFuYUltYWdlcyA9ICgpID0+IHtcbiAgY29uc3QgbWFuYUNvc3RzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWludi1tYW5hLWNvc3QnKSk7XG5cbiAgbWFuYUNvc3RzLmZvckVhY2goKGNvc3QpID0+IHtcbiAgICBjb3N0LmlubmVySFRNTCA9IGdlbmVyYXRlTWFuYUNvc3RJbWFnZXMoY29zdC5pbm5lckhUTUwpO1xuICB9KTtcbn07XG5cbi8vIE5vdCB1c2luZyB0aGlzIHJpZ2h0IG5vdyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5jb25zdCBzb3J0VGFibGVBbHBoYWJldGljYWxseSA9ICgpID0+IHtcbiAgbGV0IHJvd3MgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tY2hlY2tsaXN0LXJvdycpKTtcbiAgY29uc3QgdGFibGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWNhcmQtY2hlY2tsaXN0Jyk7XG4gIGxldCBjYXJkcyA9IFtdO1xuXG4gIHJvd3MuZm9yRWFjaCgocm93KSA9PiB7XG4gICAgY2FyZHMucHVzaChyb3cucXVlcnlTZWxlY3RvcignLmpzLS1jaGVja2xpc3QtY2FyZC1uYW1lJykuaW5uZXJIVE1MKTtcbiAgICByb3cucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChyb3cpO1xuICB9KTtcblxuICBjYXJkcyA9IGNhcmRzLnNvcnQoKTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGNhcmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3Qgcm93SW5kZXggPSByb3dzLmluZGV4T2YoXG4gICAgICByb3dzLmZpbmQoKHJvdykgPT4gcm93LmdldEF0dHJpYnV0ZSgnZGF0YS1yb3cnKSA9PT0gY2FyZHNbaV0pXG4gICAgKTtcblxuICAgIHRhYmxlLmluc2VydEFkamFjZW50RWxlbWVudCgnYmVmb3JlZW5kJywgcm93c1tyb3dJbmRleF0pO1xuXG4gICAgcm93cy5zcGxpY2Uocm93SW5kZXgsIDEpO1xuICB9XG59O1xuXG5jb25zdCBnaXZlRWFybmluZ3NDb2x1bW5Nb2RpZmllciA9ICgpID0+IHtcbiAgY29uc3Qgcm93cyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1pbnYtZWFybmluZ3MnKSk7XG4gIGNvbnNvbGUubG9nKHJvd3MpO1xuXG4gIHJvd3MuZm9yRWFjaCgocm93KSA9PiB7XG4gICAgaWYgKHJvdy5pbm5lclRleHQuc3RhcnRzV2l0aCgnLScpKSB7XG4gICAgICByb3cuY2xhc3NMaXN0LmFkZCgnbmVnYXRpdmUtZWFybmluZ3MnKTtcbiAgICB9IGVsc2UgaWYgKHJvdy5pbm5lclRleHQgPT09ICcwLjAnKSB7XG4gICAgICByb3cuY2xhc3NMaXN0LmFkZCgnbm8tZWFybmluZ3MnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcm93LmNsYXNzTGlzdC5hZGQoJ3Bvc2l0aXZlLWVhcm5pbmdzJyk7XG4gICAgfVxuICB9KTtcbn07XG5cbmNvbnN0IHJlbW92ZUhhc2hUYWdGcm9tUmFyaXR5ID0gKCkgPT4ge1xuICBjb25zdCByYXJpdHlzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLXJhcml0eScpKTtcbiAgcmFyaXR5cy5mb3JFYWNoKChyKSA9PiAoci5pbm5lclRleHQgPSByLmlubmVyVGV4dC5zdWJzdHJpbmcoMSkpKTtcbn07XG5cbmV4cG9ydCBjb25zdCBhbHRlckludmVudG9yeVRhYmxlID0gKCkgPT4ge1xuICBzaG9ydGVuVHlwZUxpbmUoKTtcbiAgYWx0ZXJNYW5hSW1hZ2VzKCk7XG4gIGNoZWNrTGlzdEhvdmVyRXZlbnRzKCk7XG4gIGdpdmVFYXJuaW5nc0NvbHVtbk1vZGlmaWVyKCk7XG4gIHJlbW92ZUhhc2hUYWdGcm9tUmFyaXR5KCk7XG59O1xuIiwiaW1wb3J0IHsgZWxlbWVudHMgfSBmcm9tICcuL2Jhc2UnO1xuXG5jb25zdCBjbGVhckNoZWNrbGlzdCA9ICgpID0+IHtcbiAgY29uc3QgY2hlY2tMaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1jYXJkLWNoZWNrbGlzdCcpO1xuICBpZiAoY2hlY2tMaXN0KSB7XG4gICAgY2hlY2tMaXN0LnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQoY2hlY2tMaXN0KTtcblxuICAgIC8vIFJlbW92ZSBhbnkgdG9vbCB0aXAgaW1hZ2VzIGlmIHVzZXIgd2FzIGhvdmVyaW5nXG4gICAgY29uc3QgdG9vbFRpcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50b29sdGlwJyk7XG4gICAgaWYgKHRvb2xUaXApIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQodG9vbFRpcCk7XG4gIH1cbn07XG5cbmNvbnN0IGNsZWFySW1hZ2VHcmlkID0gKCkgPT4ge1xuICBjb25zdCBncmlkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1pbWFnZS1ncmlkJyk7XG4gIGlmIChncmlkKSBncmlkLnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQoZ3JpZCk7XG59O1xuXG5jb25zdCBjbGVhclJlc3VsdHMgPSAoKSA9PiB7XG4gIGNsZWFyQ2hlY2tsaXN0KCk7XG4gIGNsZWFySW1hZ2VHcmlkKCk7XG59O1xuXG5jb25zdCBwcmVwSW1hZ2VDb250YWluZXIgPSAoKSA9PiB7XG4gIGNvbnN0IG1hcmt1cCA9IGBcbiAgICAgICAgPGRpdiBjbGFzcz1cImltYWdlLWdyaWQganMtLWltYWdlLWdyaWRcIj48L2Rpdj5cbiAgICBgO1xuICBlbGVtZW50cy5yZXN1bHRzUGFnZS5yZXN1bHRzQ29udGFpbmVyLmluc2VydEFkamFjZW50SFRNTCgnYmVmb3JlZW5kJywgbWFya3VwKTtcbn07XG5cbmNvbnN0IGdlbmVyYXRlU2luZ2xlU2lkZWRDYXJkID0gKGNhcmQpID0+IHtcbiAgY29uc3QgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGNvbnN0IGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuXG4gIGEuY2xhc3NMaXN0ID0gYGltYWdlLWdyaWRfX2xpbmsganMtLWltYWdlLWdyaWQtbGlua2A7XG4gIGEuaHJlZiA9IGAvY2FyZC8ke2NhcmQuc2V0fS8ke3BhcnNlQ2FyZE5hbWUoY2FyZC5uYW1lKX1gO1xuXG4gIGRpdi5jbGFzc0xpc3QgPSBgaW1hZ2UtZ3JpZF9fY29udGFpbmVyYDtcbiAgaW1nLnNyYyA9IGAke2NhcmQuaW1hZ2VfdXJpcy5ub3JtYWx9YDtcbiAgaW1nLmFsdCA9IGAke2NhcmQubmFtZX1gO1xuICBpbWcuY2xhc3NMaXN0ID0gYGltYWdlLWdyaWRfX2ltYWdlYDtcbiAgZGl2LmFwcGVuZENoaWxkKGltZyk7XG4gIGEuYXBwZW5kQ2hpbGQoZGl2KTtcblxuICBkb2N1bWVudFxuICAgIC5xdWVyeVNlbGVjdG9yKCcuanMtLWltYWdlLWdyaWQnKVxuICAgIC5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2JlZm9yZWVuZCcsIGEpO1xufTtcblxuY29uc3Qgc2hvd0JhY2tTaWRlID0gKGNhcmQpID0+IHtcbiAgY29uc3QgZnJvbnQgPSBjYXJkLnF1ZXJ5U2VsZWN0b3IoJy5qcy0taW1hZ2UtZ3JpZC1jYXJkLXNpZGUtZnJvbnQnKTtcbiAgY29uc3QgYmFjayA9IGNhcmQucXVlcnlTZWxlY3RvcignLmpzLS1pbWFnZS1ncmlkLWNhcmQtc2lkZS1iYWNrJyk7XG5cbiAgZnJvbnQuc3R5bGUudHJhbnNmb3JtID0gJ3JvdGF0ZVkoLTE4MGRlZyknO1xuICBiYWNrLnN0eWxlLnRyYW5zZm9ybSA9ICdyb3RhdGVZKDApJztcblxuICBmcm9udC5jbGFzc0xpc3QucmVtb3ZlKCdqcy0tc2hvd2luZycpO1xuICBiYWNrLmNsYXNzTGlzdC5hZGQoJ2pzLS1zaG93aW5nJyk7XG59O1xuXG5jb25zdCBzaG93RnJvbnRTaWRlID0gKGNhcmQpID0+IHtcbiAgY29uc3QgZnJvbnQgPSBjYXJkLnF1ZXJ5U2VsZWN0b3IoJy5qcy0taW1hZ2UtZ3JpZC1jYXJkLXNpZGUtZnJvbnQnKTtcbiAgY29uc3QgYmFjayA9IGNhcmQucXVlcnlTZWxlY3RvcignLmpzLS1pbWFnZS1ncmlkLWNhcmQtc2lkZS1iYWNrJyk7XG5cbiAgZnJvbnQuc3R5bGUudHJhbnNmb3JtID0gJ3JvdGF0ZVkoMCknO1xuICBiYWNrLnN0eWxlLnRyYW5zZm9ybSA9ICdyb3RhdGVZKDE4MGRlZyknO1xuXG4gIGZyb250LmNsYXNzTGlzdC5hZGQoJ2pzLS1zaG93aW5nJyk7XG4gIGJhY2suY2xhc3NMaXN0LnJlbW92ZSgnanMtLXNob3dpbmcnKTtcbn07XG5cbmNvbnN0IGZsaXBDYXJkID0gKGUpID0+IHtcbiAgLy8gUHJldmVudCB0aGUgbGluayBmcm9tIGdvaW5nIHRvIHRoZSBjYXJkIHNwZWNpZmljIHBhZ2VcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICBjb25zdCBjYXJkID0gZS50YXJnZXQucGFyZW50RWxlbWVudDtcbiAgY29uc29sZS5sb2coY2FyZCk7XG5cbiAgY29uc3QgZnJvbnQgPSBjYXJkLnF1ZXJ5U2VsZWN0b3IoJy5qcy0taW1hZ2UtZ3JpZC1jYXJkLXNpZGUtZnJvbnQnKTtcblxuICAvLyBJZiB0aGUgZnJvbnQgaXMgc2hvd2luZywgZGlzcGxheSB0aGUgYmFja3NpZGUuIE90aGVyd2lzZSwgZGlzcGxheSB0aGUgZnJvbnRcbiAgaWYgKGZyb250LmNsYXNzTGlzdC5jb250YWlucygnanMtLXNob3dpbmcnKSkgc2hvd0JhY2tTaWRlKGNhcmQpO1xuICBlbHNlIHNob3dGcm9udFNpZGUoY2FyZCk7XG59O1xuXG5jb25zdCBnZW5lcmF0ZUZsaXBDYXJkQnRuID0gKCkgPT4ge1xuICBjb25zdCBidG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgYnRuLmNsYXNzTGlzdCA9ICdpbWFnZS1ncmlkX19kb3VibGUtYnRuIGpzLS1pbWFnZS1ncmlkLWZsaXAtY2FyZC1idG4nO1xuICBidG4uaW5uZXJIVE1MID0gYFxuICAgIDxzdmcgdmVyc2lvbj1cIjEuMVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB3aWR0aD1cIjMwXCIgaGVpZ2h0PVwiMzBcIiB2aWV3Qm94PVwiMCAwIDEwMjQgMTAyNFwiIGNsYXNzPVwiaW1hZ2UtZ3JpZF9fZG91YmxlLWJ0bi1zdmdcIj5cblxuICAgIDxwYXRoIGQ9XCJNODg0LjMsMzU3LjZjMTE2LjgsMTE3LjcsMTUxLjcsMjc3LTM2Mi4yLDMyMFY0OTYuNEwyNDMuMiw3NjMuOEw1MjIsMTAzMS4zVjg2MC44QzgyOC44LDgzOS40LDEyNDQuOSw2MDQuNSw4ODQuMywzNTcuNnpcIiBjbGFzcz1cImltYWdlLWdyaWRfX2RvdWJsZS1idG4tc3ZnXCItY29sb3I+PC9wYXRoPlxuICAgIDxwYXRoIGQ9XCJNNTU3LjgsMjg4LjJ2MTM4LjRsMjMwLjgtMjEzLjRMNTU3LjgsMHYxNDIuOGMtMzA5LjIsMTUuNi03OTIuMSwyNTMuNi00MjYuNSw1MDMuOEMxMy42LDUyNy45LDMwLDMzMC4xLDU1Ny44LDI4OC4yelwiIGNsYXNzPVwiaW1hZ2UtZ3JpZF9fZG91YmxlLWJ0bi1zdmctY29sb3JcIj48L3BhdGg+XG4gICAgPC9zdmc+XG4gIGA7XG5cbiAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IGZsaXBDYXJkKGUpKTtcblxuICByZXR1cm4gYnRuO1xufTtcblxuY29uc3QgZ2VuZXJhdGVEb3VibGVTaWRlZENhcmQgPSAoY2FyZCkgPT4ge1xuICBjb25zdCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICBjb25zdCBvdXRlckRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBjb25zdCBpbm5lckRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBjb25zdCBpbWdGcm9udFNpZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcbiAgY29uc3QgaW1nQmFja1NpZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcbiAgY29uc3QgZmxpcENhcmRCdG4gPSBnZW5lcmF0ZUZsaXBDYXJkQnRuKCk7XG5cbiAgYS5jbGFzc0xpc3QgPSBgaW1hZ2UtZ3JpZF9fbGluayBqcy0taW1hZ2UtZ3JpZC1saW5rYDtcbiAgYS5ocmVmID0gYC9jYXJkLyR7Y2FyZC5zZXR9LyR7cGFyc2VDYXJkTmFtZShjYXJkLm5hbWUpfWA7XG5cbiAgb3V0ZXJEaXYuY2xhc3NMaXN0ID0gYGltYWdlLWdyaWRfX291dGVyLWRpdmA7XG4gIGlubmVyRGl2LmNsYXNzTGlzdCA9IGBpbWFnZS1ncmlkX19pbm5lci1kaXYganMtLWlubmVyLWRpdi0ke2NhcmQubmFtZX1gO1xuXG4gIGltZ0Zyb250U2lkZS5jbGFzc0xpc3QgPSBgaW1hZ2UtZ3JpZF9fZG91YmxlIGltYWdlLWdyaWRfX2RvdWJsZS0tZnJvbnQganMtLWltYWdlLWdyaWQtY2FyZC1zaWRlLWZyb250IGpzLS1zaG93aW5nYDtcbiAgaW1nRnJvbnRTaWRlLnNyYyA9IGNhcmQuY2FyZF9mYWNlc1swXS5pbWFnZV91cmlzLm5vcm1hbDtcbiAgaW1nRnJvbnRTaWRlLmFsdCA9IGNhcmQubmFtZTtcblxuICBpbWdCYWNrU2lkZS5jbGFzc0xpc3QgPSBgaW1hZ2UtZ3JpZF9fZG91YmxlIGltYWdlLWdyaWRfX2RvdWJsZS0tYmFjayBqcy0taW1hZ2UtZ3JpZC1jYXJkLXNpZGUtYmFja2A7XG4gIGltZ0JhY2tTaWRlLnNyYyA9IGNhcmQuY2FyZF9mYWNlc1sxXS5pbWFnZV91cmlzLm5vcm1hbDtcbiAgaW1nQmFja1NpZGUuYWx0ID0gY2FyZC5jYXJkX2ZhY2VzWzFdLm5hbWU7XG5cbiAgYS5hcHBlbmRDaGlsZChvdXRlckRpdik7XG4gIG91dGVyRGl2LmFwcGVuZENoaWxkKGlubmVyRGl2KTtcbiAgaW5uZXJEaXYuYXBwZW5kQ2hpbGQoaW1nQmFja1NpZGUpO1xuICBpbm5lckRpdi5hcHBlbmRDaGlsZChpbWdGcm9udFNpZGUpO1xuICBpbm5lckRpdi5hcHBlbmRDaGlsZChmbGlwQ2FyZEJ0bik7XG5cbiAgZG9jdW1lbnRcbiAgICAucXVlcnlTZWxlY3RvcignLmpzLS1pbWFnZS1ncmlkJylcbiAgICAuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdiZWZvcmVlbmQnLCBhKTtcbn07XG5cbmNvbnN0IGdlbmVyYXRlSW1hZ2VHcmlkID0gKGNhcmRzKSA9PiB7XG4gIGNhcmRzLmZvckVhY2goKGNhcmQpID0+IHtcbiAgICAvLyBGb3Igc2luZ2xlIHNpZGVkIGNhcmRzXG4gICAgaWYgKGNhcmQuaW1hZ2VfdXJpcykgZ2VuZXJhdGVTaW5nbGVTaWRlZENhcmQoY2FyZCk7XG4gICAgLy8gRG91YmxlIHNpZGVkIGNhcmRzXG4gICAgZWxzZSBnZW5lcmF0ZURvdWJsZVNpZGVkQ2FyZChjYXJkKTtcbiAgfSk7XG59O1xuXG4vLyBGdW5jaXRvbiB0byBiZSB1c2VkIGluIGluZGV4LmpzLiBUYWtlcyBjYXJlIG9mIGFsbCBuZWNlc3Nhcnkgc3RlcHMgdG8gZGlzcGxheSBjYXJkcyBhcyBhIGltYWdlc1xuZXhwb3J0IGNvbnN0IGRpc3BhbHlJbWFnZXMgPSAoY2FyZHMpID0+IHtcbiAgY2xlYXJSZXN1bHRzKCk7XG4gIHByZXBJbWFnZUNvbnRhaW5lcigpO1xuICBnZW5lcmF0ZUltYWdlR3JpZChjYXJkcyk7XG59O1xuXG5jb25zdCBwcmVwQ2hlY2tsaXN0Q29udGFpbmVyID0gKCkgPT4ge1xuICBjb25zdCBtYXJrdXAgPSBgXG4gICAgICAgIDxkaXYgY2xhc3M9XCJ3cmFwcGVyXCI+PHRhYmxlIGNsYXNzPVwiY2FyZC1jaGVja2xpc3QganMtLWNhcmQtY2hlY2tsaXN0XCI+XG4gICAgICAgICAgICA8dGhlYWQgY2xhc3M9XCJqcy0tY2FyZC1jaGVja2xpc3QtaGVhZGVyXCI+XG4gICAgICAgICAgICAgICAgPHRyIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX3JvdyBjYXJkLWNoZWNrbGlzdF9fcm93LS03IGNhcmQtY2hlY2tsaXN0X19yb3ctLWhlYWRlclwiPlxuICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YSByZXNwb25zaXZlLS1zZXRcIj5TZXQ8L3RoPlxuICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YSByZXNwb25zaXZlLS1uYW1lXCI+TmFtZTwvdGg+XG4gICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhIHJlc3BvbnNpdmUtLWNvc3RcIj5Db3N0PC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGEgcmVzcG9uc2l2ZS0tdHlwZVwiPlR5cGU8L3RoPlxuICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YSByZXNwb25zaXZlLS1yYXJpdHlcIj5SYXJpdHk8L3RoPlxuICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YSByZXNwb25zaXZlLS1hcnRpc3RcIj5BcnRpc3Q8L3RoPlxuICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YSByZXNwb25zaXZlLS1wcmljZVwiPlByaWNlPC90aD5cbiAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgPC90aGVhZD5cbiAgICAgICAgICAgIDx0Ym9keSBjbGFzcz1cImpzLS1jYXJkLWNoZWNrbGlzdC1ib2R5IGNhcmQtY2hlY2tsaXN0LWJvZHlcIj48L3Rib2R5PlxuICAgICAgICA8L3RhYmxlPjwvZGl2PlxuICAgICAgICBgO1xuICBlbGVtZW50cy5yZXN1bHRzUGFnZS5yZXN1bHRzQ29udGFpbmVyLmluc2VydEFkamFjZW50SFRNTCgnYmVmb3JlZW5kJywgbWFya3VwKTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZW5lcmF0ZU1hbmFDb3N0SW1hZ2VzID0gKG1hbmFDb3N0LCBzaXplID0gJ3NtYWxsJykgPT4ge1xuICAvLyBJZiB0aGVyZSBpcyBubyBtYW5hIGNvc3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBjYXJkLCB0aGVuIHJldHVybiBhbiBlbXB0eSBzdHJpbmcgdG8gbGVhdmUgdGhlIHJvdyBlbXB0eVxuICBpZiAoIW1hbmFDb3N0KSByZXR1cm4gJyc7XG5cbiAgLy8gUmVndWxhciBleHByZXNzaW9ucyB0byBmaW5kIGVhY2ggc2V0IG9mIGN1cmx5IGJyYWNlcyB7fVxuICBsZXQgcmUgPSAvXFx7KC4qPylcXH0vZztcblxuICAvLyBQYXJzZSB0aGUgc3RyaW5ncyBhbmQgZ2V0IGFsbCBtYXRjaGVzXG4gIGxldCBtYXRjaGVzID0gbWFuYUNvc3QubWF0Y2gocmUpO1xuXG4gIC8vIElmIHRoZXJlIGFyZSBhbnkgbWF0Y2hlcywgbG9vcCB0aHJvdWdoIGFuZCByZXBsYWNlIGVhY2ggc2V0IG9mIGN1cmx5IGJyYWNlcyB3aXRoIHRoZVxuICAvLyBodG1sIHNwYW4gdGhhdCBjb3JyZXNwb25zIHRvIG1hbmEuY3NzIHRvIHJlbmRlciB0aGUgY29ycmVjdCBpbWFnZVxuICBpZiAobWF0Y2hlcykge1xuICAgIG1hdGNoZXMuZm9yRWFjaCgobSkgPT4ge1xuICAgICAgY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKGBcXHsoJHttLnNsaWNlKDEsIC0xKX0pXFx9YCwgJ2cnKTtcbiAgICAgIC8vIFRoaXMgd2lsbCBiZSB0aGUgc3RyaW5nIHVzZWQgdG8gZ2V0IHRoZSByaWdodCBjbGFzcyBmcm9tIG1hbmEuY3NzXG4gICAgICAvLyBXZSB3YW50IHRvIHRha2UgZXZlcnl0aGluZyBpbnNpZGUgdGhlIGJyYWNrZXRzLCBhbmQgaWYgdGhlcmUgaXMgYSAvXG4gICAgICAvLyByZW1vdmUgaXQuXG4gICAgICBjb25zdCBtYW5hSWNvblN0ciA9IG0uc2xpY2UoMSwgLTEpLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgnLycsICcnKTtcbiAgICAgIG1hbmFDb3N0ID0gbWFuYUNvc3QucmVwbGFjZShcbiAgICAgICAgcmVnZXgsXG4gICAgICAgIGA8c3BhbiBjbGFzcz1cIm1hbmEgJHtzaXplfSBzJHttYW5hSWNvblN0cn1cIj48L3NwYW4+YFxuICAgICAgKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBtYW5hQ29zdDtcbn07XG5cbmNvbnN0IHNob3J0ZW5UeXBlTGluZSA9ICh0eXBlKSA9PiB7XG4gIC8vIElmIG5vIHR5cGUgaXMgZ2l2ZW4sIHJldHVybiBhbiBlbXB0eSBzdHJpbmdcbiAgaWYgKCF0eXBlKSByZXR1cm4gJyc7XG5cbiAgLy8gaWYgdGhlIOKAlCBkZWxpbWl0ZXIgaXMgZm91bmQgaW4gdGhlIHN0cmluZywgcmV0dXJuIGV2ZXJ5dGhpbmcgYmVmb3JlIHRoZSBkZWxpbWl0ZXJcbiAgaWYgKHR5cGUuaW5kZXhPZign4oCUJykgIT09IC0xKSByZXR1cm4gdHlwZS5zdWJzdHJpbmcoMCwgdHlwZS5pbmRleE9mKCfigJQnKSAtIDEpO1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vIGRlbGltaXRlciwgcmV0dXJuIHRoZSB0eXBlIGFzIGdpdmVuIGluIHRoZSBjYXJkIG9iamVjdFxuICByZXR1cm4gdHlwZTtcbn07XG5cbmNvbnN0IHBhcnNlQ2FyZE5hbWUgPSAoY2FyZE5hbWUpID0+IHtcbiAgaWYgKGNhcmROYW1lLmluZGV4T2YoJy8nKSAhPT0gLTEpIHtcbiAgICByZXR1cm4gY2FyZE5hbWUuc2xpY2UoMCwgY2FyZE5hbWUuaW5kZXhPZignLycpIC0gMSkucmVwbGFjZUFsbCgnICcsICctJyk7XG4gIH1cblxuICByZXR1cm4gY2FyZE5hbWUucmVwbGFjZUFsbCgnICcsICctJyk7XG59O1xuXG5jb25zdCBnZW5lcmF0ZUNoZWNrbGlzdCA9IChjYXJkcykgPT4ge1xuICBjb25zb2xlLmxvZyhjYXJkcyk7XG4gIC8vIENyZWF0ZSBhIG5ldyB0YWJsZSByb3cgZm9yIGVhY2ggY2FyZCBvYmplY3RcbiAgY2FyZHMuZm9yRWFjaCgoY2FyZCkgPT4ge1xuICAgIGNvbnN0IGNhcmROYW1lRm9yVXJsID0gcGFyc2VDYXJkTmFtZShjYXJkLm5hbWUpO1xuXG4gICAgY29uc3QgbWFya3VwID0gYFxuICAgICAgICAgICAgPHRyIGNsYXNzPVwianMtLWNoZWNrbGlzdC1yb3cgY2FyZC1jaGVja2xpc3RfX3JvdyAke1xuICAgICAgICAgICAgICBjYXJkcy5sZW5ndGggPCAzMCA/ICdjYXJkLWNoZWNrbGlzdF9fcm93LS1ib2R5JyA6ICcnXG4gICAgICAgICAgICB9IGNhcmQtY2hlY2tsaXN0X19yb3ctLTcgZGF0YS1jb21wb25lbnQ9XCJjYXJkLXRvb2x0aXBcIiBkYXRhLWNhcmQtaW1nPSR7Y2hlY2tGb3JJbWcoXG4gICAgICBjYXJkXG4gICAgKX0+XG4gICAgICAgICAgICAgICAgPHRkIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGEgY2FyZC1jaGVja2xpc3RfX2RhdGEtLXNldCByZXNwb25zaXZlLS1zZXRcIj48YSBocmVmPVwiL2NhcmQvJHtcbiAgICAgICAgICAgICAgICAgIGNhcmQuc2V0XG4gICAgICAgICAgICAgICAgfS8ke2NhcmROYW1lRm9yVXJsfVwiIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGEtbGlua1wiPiR7XG4gICAgICBjYXJkLnNldFxuICAgIH08L2E+PC90ZD5cbiAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YSBjYXJkLWNoZWNrbGlzdF9fZGF0YS0tbmFtZSByZXNwb25zaXZlLS1uYW1lXCI+PGEgaHJlZj1cIi9jYXJkLyR7XG4gICAgICAgICAgICAgICAgICBjYXJkLnNldFxuICAgICAgICAgICAgICAgIH0vJHtjYXJkTmFtZUZvclVybH1cIiBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmtcIj4ke1xuICAgICAgY2FyZC5uYW1lXG4gICAgfTwvYT48L3RkPlxuICAgICAgICAgICAgICAgIDx0ZCBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhIHJlc3BvbnNpdmUtLWNvc3RcIj48YSBocmVmPVwiL2NhcmQvJHtcbiAgICAgICAgICAgICAgICAgIGNhcmQuc2V0XG4gICAgICAgICAgICAgICAgfS8ke2NhcmROYW1lRm9yVXJsfVwiIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGEtbGlua1wiPiR7Z2VuZXJhdGVNYW5hQ29zdEltYWdlcyhcbiAgICAgIGNoZWNrRm9yTWFuYUNvc3QoY2FyZClcbiAgICApfTwvYT48L3RkPlxuICAgICAgICAgICAgICAgIDx0ZCBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhIHJlc3BvbnNpdmUtLXR5cGVcIj48YSBocmVmPVwiL2NhcmQvJHtcbiAgICAgICAgICAgICAgICAgIGNhcmQuc2V0XG4gICAgICAgICAgICAgICAgfS8ke2NhcmROYW1lRm9yVXJsfVwiIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGEtbGlua1wiPiR7c2hvcnRlblR5cGVMaW5lKFxuICAgICAgY2FyZC50eXBlX2xpbmVcbiAgICApfTwvYT48L3RkPlxuICAgICAgICAgICAgICAgIDx0ZCBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhIGNhcmQtY2hlY2tsaXN0X19kYXRhLS1yYXJpdHkgcmVzcG9uc2l2ZS0tcmFyaXR5XCI+PGEgaHJlZj1cIi9jYXJkLyR7XG4gICAgICAgICAgICAgICAgICBjYXJkLnNldFxuICAgICAgICAgICAgICAgIH0vJHtjYXJkTmFtZUZvclVybH1cIiBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmtcIj4ke1xuICAgICAgY2FyZC5yYXJpdHlcbiAgICB9PC9hPjwvdGQ+XG4gICAgICAgICAgICAgICAgPHRkIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGEgcmVzcG9uc2l2ZS0tYXJ0aXN0XCI+PGEgaHJlZj1cIi9jYXJkLyR7XG4gICAgICAgICAgICAgICAgICBjYXJkLnNldFxuICAgICAgICAgICAgICAgIH0vJHtjYXJkTmFtZUZvclVybH1cIiBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmtcIj4ke1xuICAgICAgY2FyZC5hcnRpc3RcbiAgICB9PC9hPjwvdGQ+XG4gICAgICAgICAgICAgICAgPHRkIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGEgY2FyZC1jaGVja2xpc3RfX2RhdGEtLXByaWNlIHJlc3BvbnNpdmUtLXByaWNlXCI+PGEgaHJlZj1cIi9jYXJkLyR7XG4gICAgICAgICAgICAgICAgICBjYXJkLnNldFxuICAgICAgICAgICAgICAgIH0vJHtjYXJkTmFtZUZvclVybH1cIiBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmsgY2FyZC1jaGVja2xpc3RfX2RhdGEtbGluay0tcHJpY2UganMtLXByaWNlIGNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmstLWNlbnRlclwiPiQgJHtcbiAgICAgIGNhcmQucHJpY2VzLnVzZCB8fCAnLSdcbiAgICB9PC9hPjwvdGQ+XG4gICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgYDtcbiAgICAvLyBQdXQgdGhlIHJvdyBpbiB0aGUgdGFibGVcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tY2FyZC1jaGVja2xpc3QtYm9keScpXG4gICAgICAuaW5zZXJ0QWRqYWNlbnRIVE1MKCdiZWZvcmVlbmQnLCBtYXJrdXApO1xuICB9KTtcbn07XG5cbmNvbnN0IGNoZWNrRm9yTWlzc2luZ1ByaWNlID0gKCkgPT4ge1xuICBjb25zdCBwcmljZXMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tcHJpY2UnKSk7XG5cbiAgcHJpY2VzLmZvckVhY2goKHByaWNlKSA9PiB7XG4gICAgaWYgKHByaWNlLmlubmVyVGV4dC5pbmNsdWRlcygnLScpKSBwcmljZS5pbm5lclRleHQgPSAnJztcbiAgfSk7XG59O1xuXG5jb25zdCBjaGVja0Zvck1hbmFDb3N0ID0gKGNhcmQpID0+IHtcbiAgaWYgKGNhcmQubWFuYV9jb3N0KSB7XG4gICAgcmV0dXJuIGNhcmQubWFuYV9jb3N0O1xuICB9IGVsc2UgaWYgKGNhcmQuY2FyZF9mYWNlcykge1xuICAgIHJldHVybiBjYXJkLmNhcmRfZmFjZXNbMF0ubWFuYV9jb3N0O1xuICB9XG59O1xuXG5jb25zdCBjaGVja0ZvckltZyA9IChjYXJkKSA9PiB7XG4gIGlmIChjYXJkLmltYWdlX3VyaXMpIHJldHVybiBjYXJkLmltYWdlX3VyaXMubm9ybWFsO1xuICAvLyBJZiB0aGVyZSBpcyBubyBjYXJkLmltYWdlX3VyaXMsIHRoZW4gaXQncyBhIGRvdWJsZSBzaWRlZCBjYXJkLiBJbiB0aGlzXG4gIC8vIGNhc2Ugd2Ugd2FudCB0byBkaXNwbGF5IHRoZSBpbWFnZSBmcm9tIGZhY2Ugb25lIG9mIHRoZSBjYXJkLlxuICBlbHNlIHJldHVybiBjYXJkLmNhcmRfZmFjZXNbMF0uaW1hZ2VfdXJpcy5ub3JtYWw7XG59O1xuXG4vLyBDcmVhdGUgdGhlIGhvdmVyIGVmZmVjdCBvbiBlYWNoIHJvdyB0aGF0IGRpc3BsYXlzIHRoZSBpbWFnZSBvZiB0aGUgY2FyZFxuZXhwb3J0IGNvbnN0IGNoZWNrTGlzdEhvdmVyRXZlbnRzID0gKCkgPT4ge1xuICAvLyBHZXQgdGhlIEhUTUwgZm9yIGVhY2ggdGFibGUgcm93XG4gIGNvbnN0IHJvd3MgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tY2hlY2tsaXN0LXJvdycpKTtcblxuICByb3dzLmZvckVhY2goKHJvdykgPT4ge1xuICAgIHJvdy5vbm1vdXNlbW92ZSA9IChlKSA9PiB7XG4gICAgICAvLyBJZiB0aGUgd2luZG93IGlzIHNtYWxsZXIgdGhhbiA3NjggcGl4ZWxzLCBkb24ndCBkaXNwbGF5IGFueSBpbWFnZXNcbiAgICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA8IDc2OCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAvLyBJZiB0aGVyZSBpcyBhbHJlYWR5IGFuIGltYWdlIGJlaW5nIGRpc3BsYXllZCwgcmVtb3ZlIGl0IGZyb20gdGhlIERPTVxuICAgICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50b29sdGlwJykpIHtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudG9vbHRpcCcpKTtcbiAgICAgIH1cblxuICAgICAgLy8gUHJlcCB0aGUgZGl2LlxuICAgICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBkaXYuY2xhc3NOYW1lID0gJ3Rvb2x0aXAnO1xuXG4gICAgICAvLyBUaGUgZGl2IGlzIHN0eWxlZCB3aXRoIHBvc2l0aW9uIGFic29sdXRlLiBUaGlzIGNvZGUgcHV0cyBpdCBqdXN0IHRvIHRoZSByaWdodCBvZiB0aGUgY3Vyc29yXG4gICAgICBkaXYuc3R5bGUubGVmdCA9IGUucGFnZVggKyA1MCArICdweCc7XG4gICAgICBkaXYuc3R5bGUudG9wID0gZS5wYWdlWSAtIDMwICsgJ3B4JztcblxuICAgICAgLy8gUHJlcCB0aGUgaW1nIGVsZW1lbnRcbiAgICAgIGNvbnN0IGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuICAgICAgaW1nLmNsYXNzTmFtZSA9ICd0b29sdGlwX19pbWcnO1xuICAgICAgaW1nLnNyYyA9IHJvdy5kYXRhc2V0LmNhcmRJbWc7XG5cbiAgICAgIC8vIFB1dCB0aGUgaW1nIGludG8gdGhlIGRpdiBhbmQgdGhlbiBhcHBlbmQgdGhlIGRpdiBkaXJlY3RseSB0byB0aGUgYm9keSBvZiB0aGUgZG9jdW1lbnQuXG4gICAgICBkaXYuYXBwZW5kQ2hpbGQoaW1nKTtcbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZGl2KTtcbiAgICB9O1xuXG4gICAgLy8gUmVtb3ZlIHRoZSBpbWcgd2hlbiB0YWtpbmcgdGhlIGN1cnNvciBvZmYgdGhlIHJvd1xuICAgIHJvdy5vbm1vdXNlb3V0ID0gKGUpID0+IHtcbiAgICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudG9vbHRpcCcpKSB7XG4gICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRvb2x0aXAnKSk7XG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG59O1xuXG5jb25zdCBjaGFuZ2VIZWFkZXJGb3JTbWFsbENoZWNrbGlzdCA9IChjYXJkcykgPT4ge1xuICBpZiAoY2FyZHMubGVuZ3RoIDwgMzApXG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yKCcuanMtLWNhcmQtY2hlY2tsaXN0LWhlYWRlcicpXG4gICAgICAuY2xhc3NMaXN0LmFkZCgnY2FyZC1jaGVja2xpc3QtaGVhZGVyJyk7XG59O1xuXG4vLyBGdW5jaXRvbiB0byBiZSB1c2VkIGluIGluZGV4LmpzLiBUYWtlcyBjYXJlIG9mIGFsbCBuZWNlc3Nhcnkgc3RlcHMgdG8gZGlzcGxheSBjYXJkcyBhcyBhIGNoZWNrbGlzdFxuZXhwb3J0IGNvbnN0IGRpc3BsYXlDaGVja2xpc3QgPSAoY2FyZHMpID0+IHtcbiAgY2xlYXJSZXN1bHRzKCk7XG4gIHByZXBDaGVja2xpc3RDb250YWluZXIoKTtcbiAgY2hhbmdlSGVhZGVyRm9yU21hbGxDaGVja2xpc3QoY2FyZHMpO1xuICBnZW5lcmF0ZUNoZWNrbGlzdChjYXJkcyk7XG4gIGNoZWNrRm9yTWlzc2luZ1ByaWNlKCk7XG4gIGNoZWNrTGlzdEhvdmVyRXZlbnRzKCk7XG59O1xuXG5leHBvcnQgY29uc3QgY2hvc2VTZWxlY3RNZW51U29ydCA9IChtZW51LCBzdGF0ZSkgPT4ge1xuICAvLyBDcmVhdGUgYW4gYXJyYXkgZnJvbSB0aGUgSFRNTCBzZWxlY3QgbWVudVxuICBjb25zdCBvcHRpb25zID0gQXJyYXkuZnJvbShtZW51KTtcblxuICBvcHRpb25zLmZvckVhY2goKG9wdGlvbiwgaSkgPT4ge1xuICAgIC8vIElmIHRoZSBvcHRpb24gdmFsdWUgbWF0Y2hlcyB0aGUgc29ydCBtZXRob2QgZnJvbSB0aGUgVVJMLCBzZXQgaXQgdG8gdGhlIHNlbGVjdGVkIGl0ZW1cbiAgICBpZiAob3B0aW9uLnZhbHVlID09PSBzdGF0ZS5zb3J0TWV0aG9kKSBtZW51LnNlbGVjdGVkSW5kZXggPSBpO1xuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBjaG9zZVNlbGVjdE1lbnVEaXNwbGF5ID0gKG1lbnUsIHN0YXRlKSA9PiB7XG4gIC8vIENyZWF0ZSBhbiBhcnJheSBmcm9tIHRoZSBIVE1MIHNlbGVjdCBtZW51XG4gIGNvbnN0IG9wdGlvbnMgPSBBcnJheS5mcm9tKG1lbnUpO1xuXG4gIG9wdGlvbnMuZm9yRWFjaCgob3B0aW9uLCBpKSA9PiB7XG4gICAgLy8gSWYgdGhlIG9wdGlvbiB2YWx1ZSBtYXRjaGVzIHRoZSBzb3J0IG1ldGhvZCBmcm9tIHRoZSBVUkwsIHNldCBpdCB0byB0aGUgc2VsZWN0ZWQgaXRlbVxuICAgIGlmIChvcHRpb24udmFsdWUgPT09IHN0YXRlLmRpc3BsYXkpIG1lbnUuc2VsZWN0ZWRJbmRleCA9IGk7XG4gIH0pO1xufTtcblxuLy8gRnVuY3Rpb24gdG8gY2hhbmdlIHRoZSBzb3J0IG1ldGhvZCBiYXNlZCBvbiB0aGUgaW5wdXQgZnJvbSB0aGUgdXNlclxuZXhwb3J0IGNvbnN0IGNoYW5nZVNvcnRNZXRob2QgPSAoc3RhdGUpID0+IHtcbiAgLy8gR2V0IHRoZSBjdXJyZW50IHNvcnQgbWV0aG9kIGZyb20gdGhlIGVuZCBvZiB0aGUgVVJMXG4gIGNvbnN0IGN1cnJlbnRTb3J0TWV0aG9kID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnN1YnN0cmluZyhcbiAgICB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUubGFzdEluZGV4T2YoJz0nKSArIDFcbiAgKTtcblxuICAvLyBHcmFiIHRoZSBkZXNpcmVkIHNvcnQgbWV0aG9kIGZyb20gdGhlIHVzZXJcbiAgY29uc3QgbmV3U29ydE1ldGhvZCA9IGVsZW1lbnRzLnJlc3VsdHNQYWdlLnNvcnRCeSgpLnZhbHVlO1xuXG4gIC8vIElmIHRoZSBuZXcgc29ydCBtZXRob2QgaXMgbm90IGRpZmZlcmVudCwgZXhpdCB0aGUgZnVuY3Rpb24gYXMgdG8gbm90IHB1c2ggYSBuZXcgc3RhdGVcbiAgaWYgKGN1cnJlbnRTb3J0TWV0aG9kID09PSBuZXdTb3J0TWV0aG9kKSB7XG4gICAgcmV0dXJuO1xuICB9IGVsc2Uge1xuICAgIC8vIERpc2FibGUgYWxsIGZvdXIgYnV0dG9uc1xuICAgIC8vIE9ubHkgZG9pbmcgdGhpcyBiZWNhdXNlIGZpcmVmb3ggcmVxdWlyZXMgYSBjdHJsIGY1XG4gICAgZGlzYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5maXJzdFBhZ2VCdG4pO1xuICAgIGRpc2FibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UubmV4dFBhZ2VCdG4oKSk7XG4gICAgZGlzYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5wcmV2aW91c1BhZ2VCdG4oKSk7XG4gICAgZGlzYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5sYXN0UGFnZUJ0bik7XG5cbiAgICBjb25zdCBjdXJyZW50UGF0aE5hbWUgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3Vic3RyaW5nKFxuICAgICAgMCxcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5sYXN0SW5kZXhPZignPScpICsgMVxuICAgICk7XG5cbiAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGN1cnJlbnRQYXRoTmFtZSArIG5ld1NvcnRNZXRob2Q7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBjaGFuZ2VEaXNwbGF5QW5kVXJsID0gKHN0YXRlKSA9PiB7XG4gIGNvbnN0IGN1cnJlbnRNZXRob2QgPSBzdGF0ZS5kaXNwbGF5O1xuICBjb25zdCBuZXdNZXRob2QgPSBlbGVtZW50cy5yZXN1bHRzUGFnZS5kaXNwbGF5U2VsZWN0b3IoKS52YWx1ZTtcblxuICBpZiAobmV3TWV0aG9kID09PSBjdXJyZW50TWV0aG9kKSByZXR1cm47XG5cbiAgLy8gVXBkYXRlIHRoZSBzdGF0ZSB3aXRoIG5ldyBkaXNwbGF5IG1ldGhvZFxuICBzdGF0ZS5kaXNwbGF5ID0gbmV3TWV0aG9kO1xuXG4gIC8vIFVwZGF0ZSB0aGUgdXJsIHdpdGhvdXQgcHVzaGluZyB0byB0aGUgc2VydmVyXG4gIGNvbnN0IHRpdGxlID0gZG9jdW1lbnQudGl0bGU7XG4gIGNvbnN0IHBhdGhOYW1lID0gYC9yZXN1bHRzLyR7bmV3TWV0aG9kfS8ke3N0YXRlLnF1ZXJ5fWA7XG4gIGhpc3RvcnkucHVzaFN0YXRlKFxuICAgIHtcbiAgICAgIGN1cnJlbnRJbmRleDogc3RhdGUuY3VycmVudEluZGV4LFxuICAgICAgZGlzcGxheTogc3RhdGUuZGlzcGxheSxcbiAgICB9LFxuICAgIHRpdGxlLFxuICAgIHBhdGhOYW1lXG4gICk7XG59O1xuXG5leHBvcnQgY29uc3QgdXBkYXRlRGlzcGxheSA9IChzdGF0ZSkgPT4ge1xuICAvLyBDbGVhciBhbnkgZXhpc3RpbmcgSFRNTCBpbiB0aGUgZGlzcGxheVxuICBjbGVhclJlc3VsdHMoKTtcblxuICAvLyBSZWZyZXNoIHRoZSBkaXNwbGF5XG4gIGlmIChzdGF0ZS5kaXNwbGF5ID09PSAnbGlzdCcpXG4gICAgZGlzcGxheUNoZWNrbGlzdChzdGF0ZS5hbGxDYXJkc1tzdGF0ZS5jdXJyZW50SW5kZXhdKTtcbiAgaWYgKHN0YXRlLmRpc3BsYXkgPT09ICdpbWFnZXMnKVxuICAgIGRpc3BhbHlJbWFnZXMoc3RhdGUuYWxsQ2FyZHNbc3RhdGUuY3VycmVudEluZGV4XSk7XG59O1xuXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKioqKiBQQUdJTkFUSU9OICoqKioqKioqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG5cbi8vIFdpbGwgYmUgY2FsbGVkIGR1cmluZyBjaGFuZ2luZyBwYWdlcy4gUmVtb3ZlcyB0aGUgY3VycmVudCBlbGVtZW50IGluIHRoZSBiYXJcbmNvbnN0IGNsZWFyRGlzcGxheUJhciA9ICgpID0+IHtcbiAgY29uc3QgZGlzcGxheUJhclRleHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWRpc3BsYXktYmFyLXRleHQnKTtcbiAgaWYgKGRpc3BsYXlCYXJUZXh0KSBkaXNwbGF5QmFyVGV4dC5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKGRpc3BsYXlCYXJUZXh0KTtcbn07XG5cbi8vIEtlZXBzIHRyYWNrIG9mIHdoZXJlIHRoZSB1c2VyIGlzIGluIHRoZXJlIGxpc3Qgb2YgY2FyZHNcbmNvbnN0IHBhZ2luYXRpb25UcmFja2VyID0gKHN0YXRlKSA9PiB7XG4gIHZhciBiZWcsIGVuZDtcbiAgYmVnID0gKHN0YXRlLmN1cnJlbnRJbmRleCArIDEpICogMTc1IC0gMTc0O1xuICBlbmQgPSBzdGF0ZS5jdXJyZW50SW5kZXggKiAxNzUgKyBzdGF0ZS5hbGxDYXJkc1tzdGF0ZS5jdXJyZW50SW5kZXhdLmxlbmd0aDtcblxuICByZXR1cm4geyBiZWcsIGVuZCB9O1xufTtcblxuZXhwb3J0IGNvbnN0IHVwZGF0ZURpc3BsYXlCYXIgPSAoc3RhdGUpID0+IHtcbiAgY29uc3QgbWFya3VwID0gYFxuICAgICAgICA8cCBjbGFzcz1cImFwaS1yZXN1bHRzLWRpc3BsYXlfX2Rpc3BsYXktYmFyLXRleHQganMtLWRpc3BsYXktYmFyLXRleHRcIj5cbiAgICAgICAgICAgIERpc3BsYXlpbmcgJHtwYWdpbmF0aW9uVHJhY2tlcihzdGF0ZSkuYmVnfSAtICR7XG4gICAgcGFnaW5hdGlvblRyYWNrZXIoc3RhdGUpLmVuZFxuICB9IG9mICR7c3RhdGUuc2VhcmNoLnJlc3VsdHMudG90YWxfY2FyZHN9IGNhcmRzXG4gICAgICAgIDwvcD5cbiAgICBgO1xuXG4gIGNsZWFyRGlzcGxheUJhcigpO1xuICBlbGVtZW50cy5yZXN1bHRzUGFnZS5kaXNwbGF5QmFyLmluc2VydEFkamFjZW50SFRNTCgnYmVmb3JlZW5kJywgbWFya3VwKTtcbn07XG5cbmV4cG9ydCBjb25zdCBlbmFibGVCdG4gPSAoYnRuKSA9PiB7XG4gIGlmIChidG4uZGlzYWJsZWQpIHtcbiAgICBidG4uY2xhc3NMaXN0LnJlbW92ZShcbiAgICAgICdhcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtcGFnaW5hdGlvbi1jb250YWluZXItLWRpc2FibGVkJ1xuICAgICk7XG4gICAgYnRuLmRpc2FibGVkID0gZmFsc2U7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBkaXNhYmxlQnRuID0gKGJ0bikgPT4ge1xuICBpZiAoIWJ0bi5kaXNhYmxlZCkge1xuICAgIGJ0bi5jbGFzc0xpc3QuYWRkKFxuICAgICAgJ2FwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1wYWdpbmF0aW9uLWNvbnRhaW5lci0tZGlzYWJsZWQnXG4gICAgKTtcbiAgICBidG4uZGlzYWJsZWQgPSB0cnVlO1xuICB9XG59O1xuXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKioqKioqKioqKiA0MDQgKioqKioqKioqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG5cbmV4cG9ydCBjb25zdCBkaXNwbGF5NDA0ID0gKCkgPT4ge1xuICBjb25zdCBkaXYgPSBjcmVhdGU0MDRNZXNzYWdlKCk7XG4gIGVsZW1lbnRzLnJlc3VsdHNQYWdlLnJlc3VsdHNDb250YWluZXIuYXBwZW5kQ2hpbGQoZGl2KTtcbn07XG5cbmNvbnN0IGNyZWF0ZTQwNERpdiA9ICgpID0+IHtcbiAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGRpdi5jbGFzc0xpc3QgPSBgbm8tcmVzdWx0c2A7XG4gIHJldHVybiBkaXY7XG59O1xuXG5jb25zdCBjcmVhdGU0MDRoMyA9ICgpID0+IHtcbiAgY29uc3QgaDMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMycpO1xuICBoMy5jbGFzc0xpc3QgPSBgbm8tcmVzdWx0c19faDNgO1xuICBoMy5pbm5lckhUTUwgPSBgTm8gY2FyZHMgZm91bmRgO1xuICByZXR1cm4gaDM7XG59O1xuXG5jb25zdCBjcmVhdGU0MDRwRWxlbWVudCA9ICgpID0+IHtcbiAgY29uc3QgcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcbiAgcC5jbGFzc0xpc3QgPSBgbm8tcmVzdWx0c19fcGA7XG4gIHAuaW5uZXJIVE1MID1cbiAgICBcIllvdXIgc2VhcmNoIGRpZG4ndCBtYXRjaCBhbnkgY2FyZHMuIEdvIGJhY2sgdG8gdGhlIHNlYXJjaCBwYWdlIGFuZCBlZGl0IHlvdXIgc2VhcmNoXCI7XG4gIHJldHVybiBwO1xufTtcblxuY29uc3QgY3JlYXRlNDA0QnRuID0gKCkgPT4ge1xuICBjb25zdCBidG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gIGJ0bi5jbGFzc0xpc3QgPSBgYnRuIG5vLXJlc3VsdHNfX2J0bmA7XG4gIGJ0bi5ocmVmID0gJy9zZWFyY2gnO1xuICBidG4uaW5uZXJIVE1MID0gJ0dvIEJhY2snO1xuICByZXR1cm4gYnRuO1xufTtcblxuY29uc3QgY3JlYXRlNDA0TWVzc2FnZSA9ICgpID0+IHtcbiAgY29uc3QgZGl2ID0gY3JlYXRlNDA0RGl2KCk7XG4gIGNvbnN0IGgzID0gY3JlYXRlNDA0aDMoKTtcbiAgY29uc3QgcCA9IGNyZWF0ZTQwNHBFbGVtZW50KCk7XG4gIGNvbnN0IGJ0biA9IGNyZWF0ZTQwNEJ0bigpO1xuXG4gIGRpdi5hcHBlbmRDaGlsZChoMyk7XG4gIGRpdi5hcHBlbmRDaGlsZChwKTtcbiAgZGl2LmFwcGVuZENoaWxkKGJ0bik7XG5cbiAgcmV0dXJuIGRpdjtcbn07XG4iLCJpbXBvcnQgeyBlbGVtZW50cyB9IGZyb20gJy4vYmFzZSc7XG5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKiBUWVBFIExJTkUgKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcblxuZXhwb3J0IGNvbnN0IHNob3dUeXBlc0Ryb3BEb3duID0gKCkgPT4ge1xuICBpZiAoZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVEcm9wRG93bi5oYXNBdHRyaWJ1dGUoJ2hpZGRlbicpKSB7XG4gICAgZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVEcm9wRG93bi5yZW1vdmVBdHRyaWJ1dGUoJ2hpZGRlbicpO1xuICAgIGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlRHJvcERvd24uc2Nyb2xsVG9wID0gMDtcbiAgICBjb25zb2xlLmxvZygndHlwZXMgZHJvcGRvd24nKTtcblxuICAgIC8vIE1ha2Ugc3VyZSB0byBkaXNwbGF5IGFsbCB0eXBlcyB3aGVuIG9wZW5pbmcgdGhlIGRyb3Bkb3duIGFuZCBiZWZvcmUgdGFraW5nIGlucHV0XG4gICAgZmlsdGVyVHlwZXMoJycpO1xuICAgIGZpbHRlclNlbGVjdGVkVHlwZXMoKTtcbiAgICBmaWx0ZXJUeXBlSGVhZGVycygpO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgaGlkZVR5cGVzRHJvcERvd24gPSAoKSA9PiB7XG4gIGlmICghZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVEcm9wRG93bi5oYXNBdHRyaWJ1dGUoJ2hpZGRlbicpKSB7XG4gICAgZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVMaW5lLnZhbHVlID0gJyc7XG4gICAgZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVEcm9wRG93bi5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG5hdmlnYXRlVHlwZXNEcm9wRG93bik7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBmaWx0ZXJUeXBlSGVhZGVycyA9ICgpID0+IHtcbiAgLy8gT24gZXZlcnkgaW5wdXQgaW50byB0aGUgdHlwZWxpbmUgYmFyLCBtYWtlIGFsbCBoZWFkZXJzIHZpc2libGVcbiAgY29uc3QgaGVhZGVycyA9IEFycmF5LmZyb20oXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS10eXBlcy1jYXRlZ29yeS1oZWFkZXInKVxuICApO1xuICBoZWFkZXJzLmZvckVhY2goKGhlYWRlcikgPT4ge1xuICAgIGlmIChoZWFkZXIuaGFzQXR0cmlidXRlKCdoaWRkZW4nKSkgaGVhZGVyLnJlbW92ZUF0dHJpYnV0ZSgnaGlkZGVuJyk7XG4gIH0pO1xuXG4gIC8vIEZvciBlYWNoIGNhdGVnb3J5IG9mIHR5cGUsIGlmIHRoZXJlIGFyZSBub3QgYW55IHZpc2libGUgYmVjYXVzZSB0aGV5IHdlcmUgZmlsdGVyZWQgb3V0XG4gIC8vIGhpZGUgdGhlIGhlYWRlciBmb3IgdGhhdCBjYXRlZ29yeVxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYmFzaWM6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1iYXNpYy1oZWFkZXInKS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gIH1cblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tc3VwZXI6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1zdXBlci1oZWFkZXInKS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gIH1cblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXJ0aWZhY3Q6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yKCcuanMtLWFydGlmYWN0LWhlYWRlcicpXG4gICAgICAuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWVuY2hhbnRtZW50Om5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcignLmpzLS1lbmNoYW50bWVudC1oZWFkZXInKVxuICAgICAgLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgfVxuXG4gIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1sYW5kOm5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tbGFuZC1oZWFkZXInKS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gIH1cblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tc3BlbGw6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1zcGVsbC1oZWFkZXInKS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gIH1cblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tcGxhbmVzd2Fsa2VyOm5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcignLmpzLS1wbGFuZXN3YWxrZXItaGVhZGVyJylcbiAgICAgIC5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gIH1cblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tY3JlYXR1cmU6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yKCcuanMtLWNyZWF0dXJlLWhlYWRlcicpXG4gICAgICAuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgZmlsdGVyU2VsZWN0ZWRUeXBlcyA9ICgpID0+IHtcbiAgY29uc3QgdHlwZXMgPSBBcnJheS5mcm9tKFxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLXR5cGVdW2RhdGEtc2VsZWN0ZWRdJylcbiAgKTtcblxuICB0eXBlcy5mb3JFYWNoKCh0eXBlKSA9PiB7XG4gICAgaWYgKHR5cGUuZ2V0QXR0cmlidXRlKCdkYXRhLXNlbGVjdGVkJykgPT09ICd0cnVlJykge1xuICAgICAgaWYgKCF0eXBlLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIHR5cGUuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5leHBvcnQgY29uc3QgZmlsdGVyVHlwZXMgPSAoc3RyKSA9PiB7XG4gIGNvbnN0IHR5cGVzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS10eXBlXScpKTtcblxuICAvLyBSZW1vdmUgdGhlIGhpZGRlbiBhdHRyaWJ1dGUgaWYgaXQgZXhpc3RzIG9uIGFueSBlbGVtZW50LCBhbmQgdGhlbiBoaWRlIGFueSBlbGVtZW50c1xuICAvLyB0aGF0IGRvbid0IGluY2x1ZGUgdGhlIHN0cmluZyBnaXZlbiBpbiB0aGUgaW5wdXQgZnJvbSB0aGUgdXNlclxuICB0eXBlcy5mb3JFYWNoKCh0eXBlKSA9PiB7XG4gICAgaWYgKHR5cGUuaGFzQXR0cmlidXRlKCdoaWRkZW4nKSkgdHlwZS5yZW1vdmVBdHRyaWJ1dGUoJ2hpZGRlbicpO1xuICAgIGlmIChcbiAgICAgICF0eXBlLmdldEF0dHJpYnV0ZSgnZGF0YS10eXBlJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzdHIudG9Mb3dlckNhc2UoKSlcbiAgICApIHtcbiAgICAgIHR5cGUuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cbiAgfSk7XG5cbiAgZmlsdGVyU2VsZWN0ZWRUeXBlcygpO1xufTtcblxuZXhwb3J0IGNvbnN0IGhpZ2hsaWdodFR5cGUgPSAodHlwZSkgPT4ge1xuICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1oaWdobGlnaHRlZCcpKSByZW1vdmVDdXJyZW50SGlnaGxpZ2h0KCk7XG5cbiAgaWYgKHR5cGUpIHtcbiAgICB0eXBlLmNsYXNzTGlzdC5hZGQoXG4gICAgICAnanMtLWhpZ2hsaWdodGVkJyxcbiAgICAgICdzZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1vcHRpb24tLWhpZ2hsaWdodGVkJ1xuICAgICk7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCByZW1vdmVDdXJyZW50SGlnaGxpZ2h0ID0gKCkgPT4ge1xuICBkb2N1bWVudFxuICAgIC5xdWVyeVNlbGVjdG9yKCcuanMtLWhpZ2hsaWdodGVkJylcbiAgICAuY2xhc3NMaXN0LnJlbW92ZShcbiAgICAgICdqcy0taGlnaGxpZ2h0ZWQnLFxuICAgICAgJ3NlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0LW9wdGlvbi0taGlnaGxpZ2h0ZWQnXG4gICAgKTtcbn07XG5cbmV4cG9ydCBjb25zdCBzZXRTY3JvbGxUb3BPbkRvd25BcnJvdyA9IChlbCwgZHJvcGRvd24pID0+IHtcbiAgaWYgKFxuICAgIGVsLm9mZnNldFRvcCA+IGRyb3Bkb3duLm9mZnNldEhlaWdodCAtIGVsLm9mZnNldEhlaWdodCAmJlxuICAgIGRyb3Bkb3duLnNjcm9sbFRvcCArIGRyb3Bkb3duLm9mZnNldEhlaWdodCAtIGVsLm9mZnNldEhlaWdodCA8IGVsLm9mZnNldFRvcFxuICApIHtcbiAgICBkcm9wZG93bi5zY3JvbGxUb3AgPSBlbC5vZmZzZXRUb3AgLSBkcm9wZG93bi5vZmZzZXRIZWlnaHQgKyBlbC5vZmZzZXRIZWlnaHQ7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBzZXRTY3JvbGxUb3BPblVwQXJyb3cgPSAoZWwsIGRyb3Bkb3duKSA9PiB7XG4gIGlmIChlbC5vZmZzZXRUb3AgPCBkcm9wZG93bi5zY3JvbGxUb3ApIHtcbiAgICBkcm9wZG93bi5zY3JvbGxUb3AgPSBlbC5vZmZzZXRUb3A7XG5cbiAgICAvLyAzMCBpcyB0aGUgaGVpZ2h0IG9mIGNhdGVnb3J5IGhlYWRlcnMuIElmIHRoZSBjYXRlZ29yeSBoZWFkZXIgaXNcbiAgICAvLyB0aGUgb25seSBlbGVtZW50IGxlZnQgdGhhdCBpcyBub3QgcmV2ZWFsZWQsIHNldCB0ZWggc2Nyb2xsIHRvcCB0byAwXG4gICAgaWYgKGRyb3Bkb3duLnNjcm9sbFRvcCA8PSAzMCkgZHJvcGRvd24uc2Nyb2xsVG9wID0gMDtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IG5hdmlnYXRlVHlwZXNEcm9wRG93biA9IChlKSA9PiB7XG4gIGNvbnN0IHR5cGVzID0gQXJyYXkuZnJvbShcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLXR5cGU6bm90KFtoaWRkZW5dKScpXG4gICk7XG4gIGNvbnN0IGkgPSB0eXBlcy5pbmRleE9mKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taGlnaGxpZ2h0ZWQnKSk7XG5cbiAgaWYgKGUuY29kZSA9PT0gJ0Fycm93RG93bicgJiYgaSA8IHR5cGVzLmxlbmd0aCAtIDEpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgcmVtb3ZlQ3VycmVudEhpZ2hsaWdodCgpO1xuICAgIGhpZ2hsaWdodFR5cGUodHlwZXNbaSArIDFdKTtcblxuICAgIHNldFNjcm9sbFRvcE9uRG93bkFycm93KHR5cGVzW2kgKyAxXSwgZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVEcm9wRG93bik7XG4gIH1cblxuICBpZiAoZS5jb2RlID09PSAnQXJyb3dVcCcpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAvLyBXZSBhbHdheXMgd2FudCB0byBwcmV2ZW50IHRoZSBkZWZhdWx0LiBXZSBvbmx5IHdhbnQgdG8gY2hhbmdlIHRoZVxuICAgIC8vIGhpZ2hsaWdodCBpZiBub3Qgb24gdGhlIHRvcCB0eXBlIGluIHRoZSBkcm9wZG93blxuICAgIGlmIChpID4gMCkge1xuICAgICAgcmVtb3ZlQ3VycmVudEhpZ2hsaWdodCgpO1xuICAgICAgaGlnaGxpZ2h0VHlwZSh0eXBlc1tpIC0gMV0pO1xuXG4gICAgICBzZXRTY3JvbGxUb3BPblVwQXJyb3codHlwZXNbaSAtIDFdLCBlbGVtZW50cy5hcGlTZWFyY2gudHlwZURyb3BEb3duKTtcbiAgICB9XG4gIH1cblxuICBpZiAoZS5jb2RlID09PSAnRW50ZXInKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgdG9nZ2xlRGF0YVNlbGVjdGVkKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taGlnaGxpZ2h0ZWQnKSk7XG4gICAgYWRkVHlwZShcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taGlnaGxpZ2h0ZWQnKS5nZXRBdHRyaWJ1dGUoJ2RhdGEtdHlwZScpXG4gICAgKTtcbiAgICBoaWRlVHlwZXNEcm9wRG93bigpO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgaG92ZXJPdmVyVHlwZXNMaXN0ZW5lciA9ICgpID0+IHtcbiAgY29uc3QgdHlwZXMgPSBBcnJheS5mcm9tKFxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tdHlwZTpub3QoW2hpZGRlbl0pJylcbiAgKTtcblxuICB0eXBlcy5mb3JFYWNoKCh0eXBlKSA9PiB7XG4gICAgdHlwZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgKCkgPT4gaGlnaGxpZ2h0VHlwZSh0eXBlKSk7XG4gIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IHN0YXJ0VHlwZXNEcm9wRG93bk5hdmlnYXRpb24gPSAoKSA9PiB7XG4gIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBuYXZpZ2F0ZVR5cGVzRHJvcERvd24pO1xuICBjb25zdCBmaXJzdFR5cGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXR5cGU6bm90KFtoaWRkZW5dKScpO1xuICBoaWdobGlnaHRUeXBlKGZpcnN0VHlwZSk7XG4gIGhvdmVyT3ZlclR5cGVzTGlzdGVuZXIoKTtcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG5hdmlnYXRlVHlwZXNEcm9wRG93bik7XG4gIGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlRHJvcERvd24uc2Nyb2xsVG9wID0gMDtcbn07XG5cbmNvbnN0IHJlbW92ZVR5cGVCdG4gPSAoKSA9PiB7XG4gIC8vIFNwYW4gd2lsbCBhY3QgYXMgdGhlIGJ1dHRvbiB0byByZW1vdmUgdHlwZXMgZnJvbSB0aGUgXCJzZWxlY3RlZFwiIGxpc3RcbiAgY29uc3QgYnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICBidG4uY2xhc3NMaXN0ID1cbiAgICAnc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLXJlbW92ZS1idG4ganMtLWFwaS10eXBlcy1jbG9zZS1idG4nO1xuICBidG4uaW5uZXJIVE1MID0gJ3gnO1xuXG4gIGJ0bi5vbmNsaWNrID0gKCkgPT4ge1xuICAgIGNvbnN0IHR5cGVOYW1lID0gYnRuLm5leHRFbGVtZW50U2libGluZy5uZXh0RWxlbWVudFNpYmxpbmcuaW5uZXJIVE1MO1xuXG4gICAgY29uc3QgdHlwZVRvVG9nZ2xlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2RhdGEtdHlwZXw9JHt0eXBlTmFtZX1dYCk7XG5cbiAgICB0b2dnbGVEYXRhU2VsZWN0ZWQodHlwZVRvVG9nZ2xlKTtcblxuICAgIGJ0bi5wYXJlbnRFbGVtZW50LnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQoYnRuLnBhcmVudEVsZW1lbnQpO1xuICB9O1xuXG4gIHJldHVybiBidG47XG59O1xuXG5jb25zdCB0eXBlVG9nZ2xlQnRuID0gKCkgPT4ge1xuICAvLyBTcGFuIHdpbGwgYWN0IGFzIHRoZSBidXR0b24gdG8gdG9nZ2xlIHdoZXRoZXIgb3Igbm90IGEgdHlwZSBpcyBpbmNsdWRlZCBvciBleGNsdWRlZCBmcm9tIHRoZSBzZWFyY2hcbiAgY29uc3QgYnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICBidG4uY2xhc3NMaXN0ID1cbiAgICAnc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLXRvZ2dsZXIgc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLXRvZ2dsZXItLWlzIGpzLS1hcGktdHlwZXMtdG9nZ2xlcic7XG4gIGJ0bi5pbm5lckhUTUwgPSAnSVMnO1xuXG4gIC8qXG4gICAgICAgIFRoaXMgd2lsbCB0b2dnbGUgYmV0d2VlbiBzZWFyY2hpbmcgZm9yIGNhcmRzIHRoYXQgaW5jbHVkZSB0aGUgZ2l2ZW4gdHlwZSBhbmQgZXhjbHVkZSB0aGUgZ2l2ZW4gdHlwZS5cbiAgICAgICAgSXQgd2lsbCBtYWtlIHN1cmUgdGhhdCB0aGUgYXBwcm9wcmlhdGUgZGF0YSB0eXBlIGlzIGdpdmVuIHRvIHRoZSBzcGFuIGVsZW1lbnQgdGhhdCBjb250YWlucyB0aGUgdHlwZVxuICAgICAgICBTbyB0aGF0IHRoZSBzZWFyY2ggZnVuY3Rpb25hbGl0eSBjcmVhdGVzIHRoZSBhcHByb3ByaWF0ZSBxdWVyeSBzdHJpbmdcblxuICAgICovXG4gIGJ0bi5vbmNsaWNrID0gKCkgPT4ge1xuICAgIGlmIChidG4uaW5uZXJIVE1MID09PSAnSVMnKSB7XG4gICAgICBidG4uY2xhc3NMaXN0ID1cbiAgICAgICAgJ3NlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy10b2dnbGVyIHNlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy10b2dnbGVyLS1ub3QganMtLWFwaS10eXBlcy10b2dnbGVyJztcbiAgICAgIGJ0bi5uZXh0RWxlbWVudFNpYmxpbmcucmVtb3ZlQXR0cmlidXRlKCdkYXRhLWluY2x1ZGUtdHlwZScpO1xuICAgICAgYnRuLm5leHRFbGVtZW50U2libGluZy5zZXRBdHRyaWJ1dGUoXG4gICAgICAgICdkYXRhLWV4Y2x1ZGUtdHlwZScsXG4gICAgICAgIGJ0bi5uZXh0RWxlbWVudFNpYmxpbmcuaW5uZXJIVE1MXG4gICAgICApO1xuICAgICAgYnRuLmlubmVySFRNTCA9ICdOT1QnO1xuICAgIH0gZWxzZSB7XG4gICAgICBidG4uY2xhc3NMaXN0ID1cbiAgICAgICAgJ3NlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy10b2dnbGVyIHNlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy10b2dnbGVyLS1pcyBqcy0tYXBpLXR5cGVzLXRvZ2dsZXInO1xuICAgICAgYnRuLm5leHRFbGVtZW50U2libGluZy5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtZXhjbHVkZS10eXBlJyk7XG4gICAgICBidG4ubmV4dEVsZW1lbnRTaWJsaW5nLnNldEF0dHJpYnV0ZShcbiAgICAgICAgJ2RhdGEtaW5jbHVkZS10eXBlJyxcbiAgICAgICAgYnRuLm5leHRFbGVtZW50U2libGluZy5pbm5lckhUTUxcbiAgICAgICk7XG4gICAgICBidG4uaW5uZXJIVE1MID0gJ0lTJztcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIGJ0bjtcbn07XG5cbmV4cG9ydCBjb25zdCB0b2dnbGVEYXRhU2VsZWN0ZWQgPSAodHlwZU9yU2V0KSA9PiB7XG4gIGlmICh0eXBlT3JTZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXNlbGVjdGVkJykgPT09ICd0cnVlJykge1xuICAgIHR5cGVPclNldC5zZXRBdHRyaWJ1dGUoJ2RhdGEtc2VsZWN0ZWQnLCAnZmFsc2UnKTtcbiAgfSBlbHNlIHtcbiAgICB0eXBlT3JTZXQuc2V0QXR0cmlidXRlKCdkYXRhLXNlbGVjdGVkJywgJ3RydWUnKTtcbiAgfVxufTtcblxuY29uc3QgYWRkVHlwZSA9ICh0eXBlKSA9PiB7XG4gIC8vIENyZWF0ZSB0aGUgZW1wdHkgbGkgZWxlbWVudCB0byBob2xkIHRoZSB0eXBlcyB0aGF0IHRoZSB1c2VyIHNlbGVjdHMuIFNldCB0aGUgY2xhc3MgbGlzdCxcbiAgLy8gYW5kIHRoZSBkYXRhLXNlbGVjdGVkIGF0dHJpYnV0ZSB0byB0cnVlLlxuICBjb25zdCBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG4gIGxpLmNsYXNzTGlzdCA9ICdzZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtbGlzdC1pdGVtIGpzLS1hcGktc2VsZWN0ZWQtdHlwZSc7XG5cbiAgLy8gVGhlIHR5cGVTcGFuIGhvbGRzIHRoZSB0eXBlIHNlbGVjdGVkIGJ5IHRoZSB1c2VyIGZyb20gdGhlIGRyb3Bkb3duLiBUaGUgZGF0YSBhdHRyaWJ1dGVcbiAgLy8gaXMgdXNlZCBpbiBTZWFyY2guanMgdG8gYnVpbGQgdGhlIHF1ZXJ5IHN0cmluZ1xuICBjb25zdCB0eXBlU3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgdHlwZVNwYW4uc2V0QXR0cmlidXRlKCdkYXRhLWluY2x1ZGUtdHlwZScsIHR5cGUpO1xuICB0eXBlU3Bhbi5pbm5lckhUTUwgPSB0eXBlO1xuXG4gIC8vIENvbnN0cnVjdCB0aGUgbGkgZWxlbWVudC4gVGhlIHJlbW92ZVR5cGVCdG4gYW5kIHR5cGVUb2dnbGVCdG4gZnVuY2l0b25zIHJldHVybiBodG1sIGVsZW1lbnRzXG4gIGxpLmFwcGVuZENoaWxkKHJlbW92ZVR5cGVCdG4oKSk7XG4gIGxpLmFwcGVuZENoaWxkKHR5cGVUb2dnbGVCdG4oKSk7XG4gIGxpLmFwcGVuZENoaWxkKHR5cGVTcGFuKTtcblxuICBlbGVtZW50cy5hcGlTZWFyY2guc2VsZWN0ZWRUeXBlcy5hcHBlbmRDaGlsZChsaSk7XG59O1xuXG5leHBvcnQgY29uc3QgdHlwZUxpbmVMaXN0ZW5lciA9IChlKSA9PiB7XG4gIC8vIElmIHRoZSB0YXJnZXQgaXMgbm90IFR5cGUgTGluZSBpbnB1dCBsaW5lLCBvciBhbiBlbGVtZW50IGluIHRoZSBkcm9wZG93biBsaXN0LFxuICAvLyBjbG9zZSB0aGUgZHJvcGRvd24gYW5kIHJlbW92ZSB0aGUgZXZlbnQgbGlzdGVuZXJcbiAgaWYgKFxuICAgIGUudGFyZ2V0ICE9PSBlbGVtZW50cy5hcGlTZWFyY2gudHlwZUxpbmUgJiZcbiAgICAhZS50YXJnZXQubWF0Y2hlcygnLmpzLS1hcGktZHJvcGRvd24tdHlwZXMtbGlzdCcpXG4gICkge1xuICAgIGhpZGVUeXBlc0Ryb3BEb3duKCk7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0eXBlTGluZUxpc3RlbmVyKTtcbiAgICAvLyBJZiB0aGUgdGFyZ2V0IGlzIG9uZSBpZiB0eXBlcywgZ2V0IHRoZSBkYXRhIHR5cGVcbiAgfSBlbHNlIGlmIChlLnRhcmdldC5oYXNBdHRyaWJ1dGUoJ2RhdGEtdHlwZScpKSB7XG4gICAgdG9nZ2xlRGF0YVNlbGVjdGVkKGUudGFyZ2V0KTtcbiAgICBhZGRUeXBlKGUudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS10eXBlJykpO1xuICAgIGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlTGluZS5mb2N1cygpO1xuICAgIGhpZGVUeXBlc0Ryb3BEb3duKCk7XG4gIH1cbn07XG5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKioqKiBTRVRTICoqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcblxuZXhwb3J0IGNvbnN0IHNob3dTZXRzRHJvcERvd24gPSAoKSA9PiB7XG4gIGlmIChlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd24uaGFzQXR0cmlidXRlKCdoaWRkZW4nKSkge1xuICAgIGVsZW1lbnRzLmFwaVNlYXJjaC5zZXREcm9wRG93bi5yZW1vdmVBdHRyaWJ1dGUoJ2hpZGRlbicpO1xuICAgIGVsZW1lbnRzLmFwaVNlYXJjaC5zZXREcm9wRG93bi5zY3JvbGxUb3AgPSAwO1xuXG4gICAgZmlsdGVyU2V0cygnJyk7XG4gICAgZmlsdGVyU2VsZWN0ZWRTZXRzKCk7XG4gICAgZmlsdGVyU2V0SGVhZGVycygpO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgaGlkZVNldHNEcm9wRG93biA9ICgpID0+IHtcbiAgaWYgKCFlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd24uaGFzQXR0cmlidXRlKCdoaWRkZW4nKSkge1xuICAgIGVsZW1lbnRzLmFwaVNlYXJjaC5zZXREcm9wRG93bi5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gICAgZWxlbWVudHMuYXBpU2VhcmNoLnNldElucHV0LnZhbHVlID0gJyc7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG5hdmlnYXRlU2V0c0Ryb3BEb3duKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGZpbHRlclNldEhlYWRlcnMgPSAoKSA9PiB7XG4gIC8vIE9uIGV2ZXJ5IGlucHV0IGludG8gdGhlIHR5cGVsaW5lIGJhciwgbWFrZSBhbGwgaGVhZGVycyB2aXNpYmxlXG4gIGNvbnN0IGhlYWRlcnMgPSBBcnJheS5mcm9tKFxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tc2V0cy1jYXRlZ29yeS1oZWFkZXInKVxuICApO1xuICBoZWFkZXJzLmZvckVhY2goKGhlYWRlcikgPT4ge1xuICAgIGlmIChoZWFkZXIuaGFzQXR0cmlidXRlKCdoaWRkZW4nKSkgaGVhZGVyLnJlbW92ZUF0dHJpYnV0ZSgnaGlkZGVuJyk7XG4gIH0pO1xuXG4gIC8vIEZvciBlYWNoIGNhdGVnb3J5IG9mIHR5cGUsIGlmIHRoZXJlIGFyZSBub3QgYW55IHZpc2libGUgYmVjYXVzZSB0aGV5IHdlcmUgZmlsdGVyZWQgb3V0XG4gIC8vIGhpZGUgdGhlIGhlYWRlciBmb3IgdGhhdCBjYXRlZ29yeVxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tZXhwYW5zaW9uOm5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcignLmpzLS1leHBhbnNpb24taGVhZGVyJylcbiAgICAgIC5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gIH1cblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tY29yZTpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWNvcmUtaGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLW1hc3RlcnM6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yKCcuanMtLW1hc3RlcnMtaGVhZGVyJylcbiAgICAgIC5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gIH1cblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tZHJhZnQ6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1kcmFmdC1oZWFkZXInKS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gIH1cblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tZHVlbF9kZWNrOm5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcignLmpzLS1kdWVsX2RlY2staGVhZGVyJylcbiAgICAgIC5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gIH1cblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXJjaGVuZW15Om5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcignLmpzLS1hcmNoZW5lbXktaGVhZGVyJylcbiAgICAgIC5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gIH1cblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYm94Om5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYm94LWhlYWRlcicpLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgfVxuXG4gIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1jb21tYW5kZXI6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yKCcuanMtLWNvbW1hbmRlci1oZWFkZXInKVxuICAgICAgLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgfVxuXG4gIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS12YXVsdDpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXZhdWx0LWhlYWRlcicpLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgfVxuXG4gIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1mdW5ueTpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWZ1bm55LWhlYWRlcicpLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgfVxuXG4gIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1tYXN0ZXJwaWVjZTpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tbWFzdGVycGllY2UtaGVhZGVyJylcbiAgICAgIC5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gIH1cblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tbWVtb3JhYmlsaWE6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yKCcuanMtLW1lbW9yYWJpbGlhLWhlYWRlcicpXG4gICAgICAuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXBsYW5lY2hhc2U6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yKCcuanMtLXBsYW5lY2hhc2UtaGVhZGVyJylcbiAgICAgIC5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gIH1cblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tcHJlbWl1bV9kZWNrOm5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcignLmpzLS1wcmVtaXVtX2RlY2staGVhZGVyJylcbiAgICAgIC5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gIH1cblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tcHJvbW86bm90KFtoaWRkZW5dKScpKSB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1wcm9tby1oZWFkZXInKS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gIH1cblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tc3BlbGxib29rOm5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcignLmpzLS1zcGVsbGJvb2staGVhZGVyJylcbiAgICAgIC5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gIH1cblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tc3RhcnRlcjpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tc3RhcnRlci1oZWFkZXInKVxuICAgICAgLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgfVxuXG4gIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS10b2tlbjpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXRva2VuLWhlYWRlcicpLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgfVxuXG4gIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS10cmVhc3VyZV9jaGVzdDpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tdHJlYXN1cmVfY2hlc3QtaGVhZGVyJylcbiAgICAgIC5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gIH1cblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tdmFuZ3VhcmQ6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yKCcuanMtLXZhbmd1YXJkLWhlYWRlcicpXG4gICAgICAuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgZmlsdGVyU2V0cyA9IChzdHIpID0+IHtcbiAgLy8gZ2V0IGFsbCBvZiB0aGUgc2V0cyBvdXQgb2YgdGhlIGRyb3Bkb3duIGxpc3RcbiAgY29uc3Qgc2V0cyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtc2V0LW5hbWVdJykpO1xuXG4gIC8vIFJlbW92ZSB0aGUgaGlkZGVuIGF0dHJpYnV0ZSBpZiBpdCBleGlzdHMgb24gYW55IGVsZW1lbnQsIGFuZCB0aGVuIGhpZGUgYW55IGVsZW1lbnRzXG4gIC8vIHRoYXQgZG9uJ3QgaW5jbHVkZSB0aGUgc3RyaW5nIGdpdmVuIGluIHRoZSBpbnB1dCBmcm9tIHRoZSB1c2VyXG4gIHNldHMuZm9yRWFjaCgocykgPT4ge1xuICAgIGlmIChzLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIHMucmVtb3ZlQXR0cmlidXRlKCdoaWRkZW4nKTtcblxuICAgIGZpbHRlclNlbGVjdGVkU2V0cygpO1xuXG4gICAgaWYgKFxuICAgICAgIXNcbiAgICAgICAgLmdldEF0dHJpYnV0ZSgnZGF0YS1zZXQtbmFtZScpXG4gICAgICAgIC50b0xvd2VyQ2FzZSgpXG4gICAgICAgIC5pbmNsdWRlcyhzdHIudG9Mb3dlckNhc2UoKSkgJiZcbiAgICAgICFzLmdldEF0dHJpYnV0ZSgnZGF0YS1zZXQtY29kZScpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc3RyLnRvTG93ZXJDYXNlKCkpXG4gICAgKSB7XG4gICAgICBzLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICB9XG4gIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IGZpbHRlclNlbGVjdGVkU2V0cyA9ICgpID0+IHtcbiAgY29uc3Qgc2V0cyA9IEFycmF5LmZyb20oXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtc2V0LW5hbWVdW2RhdGEtc2VsZWN0ZWRdJylcbiAgKTtcblxuICBzZXRzLmZvckVhY2goKHMpID0+IHtcbiAgICBpZiAocy5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2VsZWN0ZWQnKSA9PT0gJ3RydWUnKSB7XG4gICAgICBpZiAoIXMuaGFzQXR0cmlidXRlKCdoaWRkZW4nKSkgcy5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gICAgfVxuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBoaWdobGlnaHRTZXQgPSAoc2V0dCkgPT4ge1xuICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1oaWdobGlnaHRlZCcpKSByZW1vdmVDdXJyZW50SGlnaGxpZ2h0KCk7XG5cbiAgaWYgKHNldHQpIHtcbiAgICBzZXR0LmNsYXNzTGlzdC5hZGQoXG4gICAgICAnanMtLWhpZ2hsaWdodGVkJyxcbiAgICAgICdzZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1vcHRpb24tLWhpZ2hsaWdodGVkJ1xuICAgICk7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBuYXZpZ2F0ZVNldHNEcm9wRG93biA9IChlKSA9PiB7XG4gIGNvbnN0IHNldHMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tc2V0Om5vdChbaGlkZGVuXSknKSk7XG4gIGNvbnN0IGkgPSBzZXRzLmluZGV4T2YoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1oaWdobGlnaHRlZCcpKTtcblxuICBpZiAoZS5jb2RlID09PSAnQXJyb3dEb3duJyAmJiBpIDwgc2V0cy5sZW5ndGggLSAxKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHJlbW92ZUN1cnJlbnRIaWdobGlnaHQoKTtcbiAgICBoaWdobGlnaHRTZXQoc2V0c1tpICsgMV0pO1xuXG4gICAgc2V0U2Nyb2xsVG9wT25Eb3duQXJyb3coc2V0c1tpICsgMV0sIGVsZW1lbnRzLmFwaVNlYXJjaC5zZXREcm9wRG93bik7XG4gIH1cblxuICBpZiAoZS5jb2RlID09PSAnQXJyb3dVcCcgJiYgaSA+IDApIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgcmVtb3ZlQ3VycmVudEhpZ2hsaWdodCgpO1xuICAgIGhpZ2hsaWdodFNldChzZXRzW2kgLSAxXSk7XG5cbiAgICBzZXRTY3JvbGxUb3BPblVwQXJyb3coc2V0c1tpIC0gMV0sIGVsZW1lbnRzLmFwaVNlYXJjaC5zZXREcm9wRG93bik7XG4gIH1cblxuICBpZiAoZS5jb2RlID09PSAnRW50ZXInKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgdG9nZ2xlRGF0YVNlbGVjdGVkKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taGlnaGxpZ2h0ZWQnKSk7XG4gICAgYWRkU2V0KFxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1oaWdobGlnaHRlZCcpLmdldEF0dHJpYnV0ZSgnZGF0YS1zZXQtbmFtZScpLFxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1oaWdobGlnaHRlZCcpLmdldEF0dHJpYnV0ZSgnZGF0YS1zZXQtY29kZScpXG4gICAgKTtcbiAgICBoaWRlU2V0c0Ryb3BEb3duKCk7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBob3Zlck92ZXJTZXRzTGlzdGVuZXIgPSAoKSA9PiB7XG4gIGNvbnN0IHNldHMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tc2V0Om5vdChbaGlkZGVuXSknKSk7XG5cbiAgc2V0cy5mb3JFYWNoKChzKSA9PiB7XG4gICAgcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgKCkgPT4gaGlnaGxpZ2h0VHlwZShzKSk7XG4gIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IHN0YXJ0U2V0c0Ryb3BEb3duTmF2aWdhdGlvbiA9ICgpID0+IHtcbiAgY29uc3QgZmlyc3RTZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXNldDpub3QoW2hpZGRlbl0pJyk7XG4gIGhpZ2hsaWdodFNldChmaXJzdFNldCk7XG4gIGhvdmVyT3ZlclNldHNMaXN0ZW5lcigpO1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgbmF2aWdhdGVTZXRzRHJvcERvd24pO1xuICBlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd24uc2Nyb2xsVG9wID0gMDtcbn07XG5cbmNvbnN0IHJlbW92ZVNldEJ0biA9ICgpID0+IHtcbiAgLy8gU3BhbiB3aWxsIGFjdCBhcyB0aGUgYnV0dG9uIHRvIHJlbW92ZSBzZXRzIGZyb20gdGhlIFwic2VsZWN0ZWRcIiBsaXN0XG4gIGNvbnN0IGJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgYnRuLmNsYXNzTGlzdCA9XG4gICAgJ3NlYXJjaC1mb3JtX19zZWxlY3RlZC1zZXRzLXJlbW92ZS1idG4ganMtLWFwaS1zZXRzLWNsb3NlLWJ0bic7XG4gIGJ0bi5pbm5lckhUTUwgPSAneCc7XG5cbiAgYnRuLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgY29uc3Qgc2V0TmFtZSA9IGJ0bi5uZXh0RWxlbWVudFNpYmxpbmcuaW5uZXJIVE1MO1xuICAgIGNvbnN0IHNldFRvVG9nZ2xlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2RhdGEtc2V0LW5hbWV8PSR7c2V0TmFtZX1dYCk7XG4gICAgdG9nZ2xlRGF0YVNlbGVjdGVkKHNldFRvVG9nZ2xlKTtcblxuICAgIGJ0bi5wYXJlbnRFbGVtZW50LnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQoYnRuLnBhcmVudEVsZW1lbnQpO1xuICB9O1xuXG4gIHJldHVybiBidG47XG59O1xuXG5jb25zdCBhZGRTZXQgPSAoc2V0TmFtZSwgc2V0Q29kZSkgPT4ge1xuICAvLyBDcmVhdGUgdGhlIGVtcHR5IGxpIGVsZW1lbnQgdG8gaG9sZCB0aGUgdHlwZXMgdGhhdCB0aGUgdXNlciBzZWxlY3RzLiBTZXQgdGhlIGNsYXNzIGxpc3QsXG4gIC8vIGFuZCB0aGUgZGF0YS1zZWxlY3RlZCBhdHRyaWJ1dGUgdG8gdHJ1ZS5cbiAgY29uc3QgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuICBsaS5jbGFzc0xpc3QgPSAnc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXNldHMtbGlzdC1pdGVtIGpzLS1hcGktc2VsZWN0ZWQtc2V0JztcblxuICAvLyBUaGUgdHlwZVNwYW4gaG9sZHMgdGhlIHR5cGUgc2VsZWN0ZWQgYnkgdGhlIHVzZXIgZnJvbSB0aGUgZHJvcGRvd24uIFRoZSBkYXRhIGF0dHJpYnV0ZVxuICAvLyBpcyB1c2VkIGluIFNlYXJjaC5qcyB0byBidWlsZCB0aGUgcXVlcnkgc3RyaW5nXG4gIGNvbnN0IHNldFNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gIHNldFNwYW4uc2V0QXR0cmlidXRlKCdkYXRhLWluY2x1ZGUtc2V0Jywgc2V0Q29kZSk7XG4gIHNldFNwYW4uaW5uZXJIVE1MID0gc2V0TmFtZTtcblxuICBsaS5hcHBlbmRDaGlsZChyZW1vdmVTZXRCdG4oKSk7XG4gIGxpLmFwcGVuZENoaWxkKHNldFNwYW4pO1xuXG4gIGVsZW1lbnRzLmFwaVNlYXJjaC5zZWxlY3RlZFNldHMuYXBwZW5kQ2hpbGQobGkpO1xufTtcblxuZXhwb3J0IGNvbnN0IHNldElucHV0TGlzdGVuZXIgPSAoZSkgPT4ge1xuICAvLyBJZiB0aGUgdGFyZ2V0IGlzIG5vdCB0aGUgc2V0IGlucHV0IGZpZWxkLCBvciBhbiBlbGVtZW50IGluIHRoZSBkcm9wZG93biBsaXN0LFxuICAvLyBjbG9zZSB0aGUgZHJvcGRvd24gYW5kIHJlbW92ZSB0aGUgZXZlbnQgbGlzdGVuZXJcbiAgaWYgKFxuICAgIGUudGFyZ2V0ICE9PSBlbGVtZW50cy5hcGlTZWFyY2guc2V0SW5wdXQgJiZcbiAgICAhZS50YXJnZXQubWF0Y2hlcygnLmpzLS1hcGktZHJvcGRvd24tc2V0cy1saXN0JylcbiAgKSB7XG4gICAgaGlkZVNldHNEcm9wRG93bigpO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2V0SW5wdXRMaXN0ZW5lcik7XG4gICAgLy8gSWYgdGhlIHRhcmdldCBpcyBvbmUgb2YgdGhlIHNldCBvcHRpb25zLCB0b2dnbGUgaXQgYXMgc2VsZWN0ZWQsIGFkZCBpdCB0byB0aGUgbGlzdCxcbiAgICAvLyBhbmQgaGlkZSB0aGUgZHJvcGRvd24uXG4gIH0gZWxzZSBpZiAoZS50YXJnZXQuaGFzQXR0cmlidXRlKCdkYXRhLXNldC1uYW1lJykpIHtcbiAgICB0b2dnbGVEYXRhU2VsZWN0ZWQoZS50YXJnZXQpO1xuICAgIGFkZFNldChcbiAgICAgIGUudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1zZXQtbmFtZScpLFxuICAgICAgZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXNldC1jb2RlJylcbiAgICApO1xuICAgIGVsZW1lbnRzLmFwaVNlYXJjaC5zZXRJbnB1dC5mb2N1cygpO1xuICAgIGhpZGVTZXRzRHJvcERvd24oKTtcbiAgfVxufTtcblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKiogU1RBVFMgKioqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuXG5leHBvcnQgY29uc3Qgc3RhdExpbmVDb250cm9sbGVyID0gKCkgPT4ge1xuICBpZiAoY2hlY2tTdGF0TGluZUZvckludGVnZXIoKSAmJiBjaGVja0Zvckxlc3NUaGFuRm91clN0YXRMaW5lcygpKSB7XG4gICAgY29uc3QgY2xvbmUgPSBjcmVhdGVTdGF0c0Nsb25lKCk7XG4gICAgZWRpdFN0YXRzQ2xvbmUoY2xvbmUpO1xuICAgIGluc2VydFN0YXRzQ2xvbmUoY2xvbmUpO1xuICAgIHJlc2V0U3RhdExpbmVFdmVudExpc3RlbmVyKCk7XG4gIH1cbn07XG5cbmNvbnN0IGNoZWNrU3RhdExpbmVGb3JJbnRlZ2VyID0gKCkgPT4ge1xuICBjb25zdCBzdGF0VmFsID0gQXJyYXkuZnJvbShcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWFwaS1zdGF0LXZhbHVlJylcbiAgKS5zbGljZSgtMSlbMF07XG5cbiAgcmV0dXJuIHBhcnNlSW50KHN0YXRWYWwudmFsdWUpID49IDAgPyB0cnVlIDogZmFsc2U7XG59O1xuXG5jb25zdCBjaGVja0Zvckxlc3NUaGFuRm91clN0YXRMaW5lcyA9ICgpID0+IHtcbiAgY29uc3Qgc3RhdHMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tYXBpLXN0YXQtdmFsdWUnKSk7XG5cbiAgcmV0dXJuIHN0YXRzLmxlbmd0aCA8IDQgPyB0cnVlIDogZmFsc2U7XG59O1xuXG5jb25zdCBjcmVhdGVTdGF0c0Nsb25lID0gKCkgPT4ge1xuICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktc3RhdHMtd3JhcHBlcicpLmNsb25lTm9kZSh0cnVlKTtcbn07XG5cbmNvbnN0IGVkaXRTdGF0c0Nsb25lID0gKGNsb25lKSA9PiB7XG4gIGNsb25lLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXN0YXQnKS52YWx1ZSA9ICcnO1xuICBjbG9uZS5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1zdGF0LWZpbHRlcicpLnZhbHVlID0gJyc7XG4gIGNsb25lLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXN0YXQtdmFsdWUnKS52YWx1ZSA9ICcnO1xufTtcblxuY29uc3QgaW5zZXJ0U3RhdHNDbG9uZSA9IChjbG9uZSkgPT4ge1xuICBjb25zdCBsYXN0U3RhdExpbmUgPSBBcnJheS5mcm9tKFxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tYXBpLXN0YXRzLXdyYXBwZXInKVxuICApLnNsaWNlKC0xKVswXTtcblxuICBsYXN0U3RhdExpbmUuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdhZnRlcmVuZCcsIGNsb25lKTtcbn07XG5cbmNvbnN0IHJlc2V0U3RhdExpbmVFdmVudExpc3RlbmVyID0gKCkgPT4ge1xuICBjb25zdCBzdGF0VmFsdWVzID0gQXJyYXkuZnJvbShcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWFwaS1zdGF0LXZhbHVlJylcbiAgKTtcbiAgc3RhdFZhbHVlcy5zbGljZSgtMilbMF0ucmVtb3ZlRXZlbnRMaXN0ZW5lcignaW5wdXQnLCBzdGF0TGluZUNvbnRyb2xsZXIpO1xuICBzdGF0VmFsdWVzLnNsaWNlKC0xKVswXS5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIHN0YXRMaW5lQ29udHJvbGxlcik7XG59O1xuXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKiBMRUdBTCBTVEFUVVMgKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG5cbmV4cG9ydCBjb25zdCBmb3JtYXRMaW5lQ29udHJvbGxlciA9ICgpID0+IHtcbiAgY29uc29sZS5sb2coY2hlY2tGb3JGb3VyTGVzc1RoYW5Gb3JtYXRMaW5lcygpKTtcbiAgaWYgKGNoZWNrRm9yRm91ckxlc3NUaGFuRm9ybWF0TGluZXMoKSAmJiBjaGVja0Zvcm1hdExpbmVGb3JWYWx1ZSgpKSB7XG4gICAgY29uc3QgY2xvbmUgPSBjcmVhdGVGb3JtYXRDbG9uZSgpO1xuICAgIGVkaXRGb3JtYXRDbG9uZShjbG9uZSk7XG4gICAgaW5zZXJ0Rm9ybWF0Q2xvbmUoY2xvbmUpO1xuICAgIHJlc2V0Rm9ybWF0TGluZUV2ZW50TGlzdGVuZXIoKTtcbiAgfVxufTtcblxuY29uc3QgY2hlY2tGb3JtYXRMaW5lRm9yVmFsdWUgPSAoKSA9PiB7XG4gIGNvbnN0IGZvcm1hdCA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1hcGktZm9ybWF0JykpLnNsaWNlKFxuICAgIC0xXG4gIClbMF07XG5cbiAgcmV0dXJuIGZvcm1hdC52YWx1ZSAhPT0gJycgPyB0cnVlIDogZmFsc2U7XG59O1xuXG5jb25zdCBjaGVja0ZvckZvdXJMZXNzVGhhbkZvcm1hdExpbmVzID0gKCkgPT4ge1xuICBjb25zdCBmb3JtYXRzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWFwaS1mb3JtYXQnKSk7XG4gIHJldHVybiBmb3JtYXRzLmxlbmd0aCA8IDQgPyB0cnVlIDogZmFsc2U7XG59O1xuXG5jb25zdCBjcmVhdGVGb3JtYXRDbG9uZSA9ICgpID0+IHtcbiAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLWZvcm1hdC13cmFwcGVyJykuY2xvbmVOb2RlKHRydWUpO1xufTtcblxuY29uc3QgZWRpdEZvcm1hdENsb25lID0gKGNsb25lKSA9PiB7XG4gIGNsb25lLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLWxlZ2FsLXN0YXR1cycpLnZhbHVlID0gJyc7XG4gIGNsb25lLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLWZvcm1hdCcpLnZhbHVlID0gJyc7XG59O1xuXG5jb25zdCBpbnNlcnRGb3JtYXRDbG9uZSA9IChjbG9uZSkgPT4ge1xuICBjb25zdCBsYXN0Rm9ybWF0TGluZSA9IEFycmF5LmZyb20oXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1hcGktZm9ybWF0LXdyYXBwZXInKVxuICApLnNsaWNlKC0xKVswXTtcblxuICBsYXN0Rm9ybWF0TGluZS5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2FmdGVyZW5kJywgY2xvbmUpO1xufTtcblxuY29uc3QgcmVzZXRGb3JtYXRMaW5lRXZlbnRMaXN0ZW5lciA9ICgpID0+IHtcbiAgY29uc3QgZm9ybWF0cyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1hcGktZm9ybWF0JykpO1xuICBmb3JtYXRzLnNsaWNlKC0yKVswXS5yZW1vdmVFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmb3JtYXRMaW5lQ29udHJvbGxlcik7XG4gIGZvcm1hdHMuc2xpY2UoLTEpWzBdLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZvcm1hdExpbmVDb250cm9sbGVyKTtcbn07XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHRpZihfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdKSB7XG5cdFx0cmV0dXJuIF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0uZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHRpZDogbW9kdWxlSWQsXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IG1vZHVsZVsnZGVmYXVsdCddIDpcblx0XHQoKSA9PiBtb2R1bGU7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLmcgPSAoZnVuY3Rpb24oKSB7XG5cdGlmICh0eXBlb2YgZ2xvYmFsVGhpcyA9PT0gJ29iamVjdCcpIHJldHVybiBnbG9iYWxUaGlzO1xuXHR0cnkge1xuXHRcdHJldHVybiB0aGlzIHx8IG5ldyBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0aWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKSByZXR1cm4gd2luZG93O1xuXHR9XG59KSgpOyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwidmFyIHNjcmlwdFVybDtcbmlmIChfX3dlYnBhY2tfcmVxdWlyZV9fLmcuaW1wb3J0U2NyaXB0cykgc2NyaXB0VXJsID0gX193ZWJwYWNrX3JlcXVpcmVfXy5nLmxvY2F0aW9uICsgXCJcIjtcbnZhciBkb2N1bWVudCA9IF9fd2VicGFja19yZXF1aXJlX18uZy5kb2N1bWVudDtcbmlmICghc2NyaXB0VXJsICYmIGRvY3VtZW50KSB7XG5cdGlmIChkb2N1bWVudC5jdXJyZW50U2NyaXB0KVxuXHRcdHNjcmlwdFVybCA9IGRvY3VtZW50LmN1cnJlbnRTY3JpcHQuc3JjXG5cdGlmICghc2NyaXB0VXJsKSB7XG5cdFx0dmFyIHNjcmlwdHMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcInNjcmlwdFwiKTtcblx0XHRpZihzY3JpcHRzLmxlbmd0aCkgc2NyaXB0VXJsID0gc2NyaXB0c1tzY3JpcHRzLmxlbmd0aCAtIDFdLnNyY1xuXHR9XG59XG4vLyBXaGVuIHN1cHBvcnRpbmcgYnJvd3NlcnMgd2hlcmUgYW4gYXV0b21hdGljIHB1YmxpY1BhdGggaXMgbm90IHN1cHBvcnRlZCB5b3UgbXVzdCBzcGVjaWZ5IGFuIG91dHB1dC5wdWJsaWNQYXRoIG1hbnVhbGx5IHZpYSBjb25maWd1cmF0aW9uXG4vLyBvciBwYXNzIGFuIGVtcHR5IHN0cmluZyAoXCJcIikgYW5kIHNldCB0aGUgX193ZWJwYWNrX3B1YmxpY19wYXRoX18gdmFyaWFibGUgZnJvbSB5b3VyIGNvZGUgdG8gdXNlIHlvdXIgb3duIGxvZ2ljLlxuaWYgKCFzY3JpcHRVcmwpIHRocm93IG5ldyBFcnJvcihcIkF1dG9tYXRpYyBwdWJsaWNQYXRoIGlzIG5vdCBzdXBwb3J0ZWQgaW4gdGhpcyBicm93c2VyXCIpO1xuc2NyaXB0VXJsID0gc2NyaXB0VXJsLnJlcGxhY2UoLyMuKiQvLCBcIlwiKS5yZXBsYWNlKC9cXD8uKiQvLCBcIlwiKS5yZXBsYWNlKC9cXC9bXlxcL10rJC8sIFwiL1wiKTtcbl9fd2VicGFja19yZXF1aXJlX18ucCA9IHNjcmlwdFVybDsiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZVxuX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL2pzL2luZGV4LmpzXCIpO1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgdXNlZCAnZXhwb3J0cycgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxuIl0sInNvdXJjZVJvb3QiOiIifQ==