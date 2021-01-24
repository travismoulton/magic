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
___CSS_LOADER_EXPORT___.push([module.id, "*,\n*::after,\n*::before {\n  margin: 0;\n  padding: 0;\n  box-sizing: inherit; }\n\nhtml {\n  font-size: 62.5%; }\n\nbody {\n  box-sizing: border-box;\n  font-size: 1.6rem;\n  background-size: cover;\n  background-repeat: no-repeat;\n  height: 127.5rem;\n  font-family: 'Lato', sans-serif; }\n\n[hidden] {\n  display: none !important; }\n\n.heading-tertiary {\n  font-size: 2.4rem;\n  text-transform: uppercase; }\n  .heading-tertiary--white {\n    color: #fff; }\n\n.heading-primary {\n  font-size: 3rem;\n  text-transform: uppercase;\n  font-weight: 300;\n  color: #fff; }\n\n.mb-10 {\n  margin-bottom: 1rem; }\n\n.mb-20 {\n  margin-bottom: 2rem; }\n\n.mt-50 {\n  margin-top: 5rem; }\n\n.btn, .btn:link, .btn:visited {\n  padding: .75rem 2rem;\n  border-radius: .5rem;\n  background-color: #f2f2f2;\n  font-weight: 400;\n  display: inline-block; }\n\n.btn:active, .btn:focus {\n  outline: none;\n  transform: translateY(-1px);\n  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.2); }\n\n.login,\n.register {\n  min-height: calc(100vh - 6.1rem);\n  width: 100vw;\n  background: linear-gradient(to top, #5f4f66, #342332);\n  background-repeat: no-repeat;\n  background-size: cover;\n  display: flex;\n  justify-content: center;\n  align-items: center; }\n  .login-img,\n  .register-img {\n    position: absolute;\n    border-radius: 100%;\n    height: 8.5rem;\n    width: 8.5rem;\n    top: -15%; }\n  .login__form,\n  .register__form {\n    position: relative;\n    background-color: #1e2a38;\n    border: 2px solid #1e2a38;\n    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.25);\n    max-width: 32rem;\n    display: flex;\n    flex-flow: column nowrap;\n    align-items: center;\n    padding: 4rem 0 2.6rem 0;\n    transform: translateY(-25%); }\n  .login__form-instructions,\n  .register__form-instructions {\n    color: #fff;\n    font-size: 1.4rem;\n    text-align: center;\n    margin-bottom: 1rem;\n    width: 90%; }\n  .login__form-group,\n  .register__form-group {\n    width: 90%; }\n  .login__form-input,\n  .register__form-input {\n    width: 100%;\n    margin: 0 auto;\n    border: 1px solid rgba(255, 255, 255, 0.2);\n    background-color: rgba(0, 0, 0, 0.1);\n    box-shadow: rgba(0, 0, 0, 0.5);\n    border-radius: 2px;\n    margin-bottom: 1rem;\n    line-height: 1.25;\n    text-align: center;\n    height: 4.2rem;\n    padding: 1rem 1.4rem;\n    caret-color: #fff;\n    color: rgba(255, 255, 255, 0.75); }\n    .login__form-input::placeholder,\n    .register__form-input::placeholder {\n      font-weight: 300;\n      color: #e6e6e6;\n      font-size: 1.8rem; }\n    .login__form-input:focus,\n    .register__form-input:focus {\n      border: 1px solid rgba(255, 255, 255, 0.75); }\n  .login__form-btn,\n  .register__form-btn {\n    width: 90%;\n    border-radius: 2px;\n    padding: 0 1.4rem;\n    margin: 1rem auto 0 auto;\n    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25);\n    cursor: pointer;\n    display: flex;\n    justify-content: space-around;\n    align-items: center;\n    height: 4.2rem; }\n    .login__form-btn--login,\n    .register__form-btn--login {\n      background-color: rgba(255, 255, 255, 0.87);\n      color: #16161d;\n      border: 1px solid #fff; }\n      .login__form-btn--login:hover,\n      .register__form-btn--login:hover {\n        background-color: #fff;\n        color: #342442; }\n      .login__form-btn--login:hover .login__form-icon-path--login,\n      .register__form-btn--login:hover .login__form-icon-path--login {\n        fill: #342442; }\n      .login__form-btn--login::after,\n      .register__form-btn--login::after {\n        margin-bottom: 1px solid white; }\n    .login__form-btn--register,\n    .register__form-btn--register {\n      text-decoration: none;\n      background-color: rgba(255, 255, 255, 0.1);\n      border: 1px solid rgba(255, 255, 255, 0.05);\n      color: rgba(255, 255, 255, 0.75); }\n      .login__form-btn--register:hover,\n      .register__form-btn--register:hover {\n        background-color: rgba(255, 255, 255, 0.25);\n        color: #fff; }\n      .login__form-btn--register:hover .login__form-icon-path--login,\n      .register__form-btn--register:hover .login__form-icon-path--login {\n        fill: #fff; }\n    .login__form-btn span,\n    .register__form-btn span {\n      margin-right: 1rem; }\n  .login__form-icon,\n  .register__form-icon {\n    height: 1.5rem;\n    width: 1.5rem;\n    transform: translateY(17%); }\n  .login__form-icon-path--login,\n  .register__form-icon-path--login {\n    fill: #16161d; }\n  .login__form-icon-path--register,\n  .register__form-icon-path--register {\n    fill: #fff; }\n  .login__form-hr,\n  .register__form-hr {\n    width: 90%;\n    margin: 2rem 0 1rem 0;\n    margin-bottom: 0.25px solid rgba(255, 255, 255, 0.25); }\n\n.nav {\n  display: flex;\n  align-items: center;\n  padding: 1rem 16%;\n  background-color: #2b253a;\n  border-bottom: 1px solid #000; }\n  .nav__left {\n    display: flex;\n    flex: 0 0 50%; }\n  .nav__right {\n    display: flex;\n    border-right: 1px solid #fff;\n    border-left: 1px solid #fff;\n    padding-left: 1rem;\n    margin-left: auto; }\n    .nav__right > * {\n      margin-right: 1rem; }\n  .nav__item--search {\n    flex: 0 0 25%; }\n  .nav__item--home {\n    margin-right: 3rem; }\n  .nav__link {\n    text-decoration: none;\n    color: rgba(255, 255, 255, 0.75);\n    transition: all 0.2s; }\n    .nav__link:hover {\n      margin-bottom: 2px;\n      color: #fff;\n      border-bottom: 1px solid #fff; }\n    .nav__link--home:hover .nav__icon-path--home {\n      fill: #fff; }\n  .nav__search {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    position: relative; }\n    .nav__search-input {\n      border: none;\n      padding: 1rem 2rem;\n      background-color: #2b253a;\n      caret-color: rgba(255, 255, 255, 0.75);\n      color: #fff; }\n      .nav__search-input::placeholder {\n        color: rgba(255, 255, 255, 0.75); }\n      .nav__search-input:focus {\n        outline: none; }\n    .nav__search-btn {\n      cursor: pointer;\n      position: absolute;\n      left: 2rem;\n      top: 1rem; }\n      .nav__search-btn:hover .nav__icon-path--search {\n        fill: #fff; }\n  .nav__icon-sizing--home {\n    width: 3rem;\n    height: 3rem; }\n  .nav__icon-sizing--search {\n    width: 2rem;\n    height: 2rem;\n    transform: translateX(-150%); }\n  .nav__icon-path--home {\n    fill: rgba(255, 255, 255, 0.75); }\n  .nav__icon-path--search {\n    fill: #bfbfbf; }\n\n.error {\n  margin-top: 2rem;\n  text-align: center;\n  background-color: #ff8080;\n  border-radius: 10px;\n  padding: 2rem;\n  font-size: 2rem;\n  grid-column: center-start / center-end;\n  font-weight: 700; }\n\n.search-form {\n  padding: 2rem 25rem;\n  background-color: #fdfdfd;\n  min-height: calc(100vh - 6.2rem); }\n  .search-form__group {\n    width: 75%;\n    display: flex;\n    margin-bottom: 3rem;\n    align-items: flex-start;\n    padding: 0.5rem 4rem 0.5rem 0;\n    border-bottom: 1px solid rgba(0, 0, 0, 0.2); }\n    .search-form__group:nth-child(10) {\n      border-bottom: none; }\n  .search-form__label {\n    flex: 0 0 20%;\n    display: flex;\n    align-items: flex-start;\n    font-weight: 300;\n    margin-top: 0.7rem;\n    color: #551a8b; }\n  .search-form__group-input-wrapper {\n    flex: 0 0 80%; }\n  .search-form__tip {\n    font-size: 1rem;\n    line-height: 1.4;\n    width: 70%; }\n  .search-form__input-text {\n    width: 40rem;\n    height: 4rem;\n    margin-bottom: 1rem;\n    padding: 1rem;\n    border: solid 1px #bfbfbf;\n    border-radius: 5px; }\n    .search-form__input-text:focus {\n      border: solid 1px #000; }\n  .search-form__input-integer {\n    border: 1px solid #aeaeae;\n    height: 3.5rem;\n    border-radius: 3px;\n    padding-left: 0.5rem;\n    padding-right: 0.5rem;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06); }\n    .search-form__input-integer--relative {\n      position: relative; }\n  .search-form__group--checkbox {\n    display: flex;\n    margin-bottom: 1rem; }\n  .search-form__label--checkbox {\n    margin-right: 1rem; }\n  .search-form__input-checkbox {\n    width: 2.25rem;\n    height: 2.25rem;\n    margin-right: 0.8rem; }\n  .search-form__checkbox-wrapper {\n    display: flex;\n    align-items: center; }\n  .search-form__select-menu {\n    margin-bottom: 1rem; }\n  .search-form__select-menu {\n    color: #343242;\n    margin-right: 1rem;\n    border: 1px solid #aeaeae;\n    border-radius: 3px;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06);\n    padding: 0 2.2rem 0 0.5rem;\n    height: 3.4rem;\n    font-size: 1.4rem;\n    text-indent: 0;\n    -webkit-appearance: none;\n    -moz-appearance: none;\n    text-overflow: '';\n    background-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\n    background-repeat: no-repeat;\n    background-position: right 0.8rem center;\n    background-size: 1.2rem 1rem;\n    background-color: #fff; }\n  .search-form__svg-size {\n    height: 2rem;\n    width: 2rem;\n    margin-right: 1rem; }\n  .search-form__svg-color {\n    fill: #551a8b; }\n  .search-form__submit-wrapper {\n    position: sticky;\n    bottom: 0;\n    width: 75%;\n    display: flex;\n    margin-bottom: 3rem;\n    border-top: 1px solid rgba(0, 0, 0, 0.2);\n    align-items: flex-start;\n    padding: 1.5rem 4rem 1.5rem 0;\n    background-color: #fdfdfd;\n    z-index: 1; }\n  .search-form__submit {\n    border-radius: 3px;\n    padding: 0.7rem;\n    background-color: #f9f7f5;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    color: #551a8b;\n    font-weight: 500;\n    transition: all 0.2s;\n    margin-left: 20%; }\n    .search-form__submit:hover {\n      cursor: pointer;\n      background-color: #fff; }\n  .search-form__dropdown-span {\n    display: flex;\n    flex-direction: column; }\n  .search-form__selected-types, .search-form__selected-sets {\n    display: flex;\n    flex-direction: column;\n    list-style: none;\n    margin-bottom: 0.3rem; }\n  .search-form__selected-types-list-item, .search-form__selected-sets-list-item {\n    display: flex;\n    margin-bottom: 0.7rem; }\n  .search-form__selected-types-remove-btn, .search-form__selected-sets-remove-btn {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    cursor: pointer;\n    height: 2rem;\n    width: 2rem;\n    font-size: 1.3rem;\n    background-color: #f2f2f2;\n    margin-right: 0.7rem; }\n  .search-form__selected-types-toggler {\n    height: 2rem;\n    width: 2.75rem;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    cursor: pointer;\n    font-size: 1.3rem;\n    margin-right: 0.7rem; }\n    .search-form__selected-types-toggler--is {\n      background-color: #47d147; }\n    .search-form__selected-types-toggler--not {\n      background-color: #ff0000; }\n  .search-form__dropdown {\n    position: absolute;\n    max-height: 28rem;\n    background-color: #fff;\n    z-index: 2;\n    top: 100%;\n    width: 40rem;\n    margin-top: -1rem;\n    overflow-y: auto;\n    border: 1px solid #000; }\n    .search-form__dropdown-list {\n      list-style: none; }\n      .search-form__dropdown-list-category {\n        padding: 0.5rem; }\n      .search-form__dropdown-list-option {\n        padding: 0.3rem 2rem;\n        display: flex;\n        align-items: center; }\n        .search-form__dropdown-list-option:hover {\n          cursor: pointer; }\n        .search-form__dropdown-list-option--highlighted {\n          background-color: #ccd8ff; }\n        .search-form__dropdown-list-option span {\n          text-transform: uppercase;\n          margin-left: 1rem; }\n      .search-form__dropdown-list-img {\n        width: 2rem;\n        height: 2rem;\n        margin-right: 0.7rem; }\n\n.dropdown-wrapper {\n  position: relative; }\n\n.inv-search-price-msg {\n  position: absolute;\n  bottom: 0;\n  right: 0;\n  color: red; }\n\n.relative {\n  position: relative; }\n\n.api-results-display__nav {\n  background-color: #f3f5f8;\n  border-bottom: 1px solid rgba(99, 68, 150, 0.1);\n  width: 100%;\n  display: flex;\n  justify-content: space-between;\n  padding: 1.2rem 16%;\n  margin-bottom: 0.1rem;\n  height: 5.2rem; }\n  .api-results-display__nav-select {\n    color: #b300b3;\n    margin-right: 1rem;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    border-radius: 3px;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06);\n    padding: 0.1rem 2.2rem 0 0.5rem;\n    color: #551a8b;\n    height: 2.8rem;\n    font-size: 1.4rem;\n    text-indent: 0;\n    -webkit-appearance: none;\n    -moz-appearance: none;\n    text-overflow: '';\n    background-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\n    background-repeat: no-repeat;\n    background-position: right 0.8rem center;\n    background-size: 1.2rem 1rem; }\n    .api-results-display__nav-select:hover {\n      cursor: pointer;\n      background-color: #fff; }\n  .api-results-display__nav-label {\n    color: #551a8b; }\n  .api-results-display__nav-btn {\n    border-radius: 3px;\n    background-color: #f9f7f5;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    color: #551a8b;\n    font-weight: 500;\n    transition: all 0.2s;\n    height: 2.8rem;\n    padding: 0.1rem 0.7rem 0 0.7rem;\n    font-size: 1.4rem;\n    margin: auto 0;\n    text-align: center;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06); }\n    .api-results-display__nav-btn:hover {\n      cursor: pointer;\n      background-color: #fff; }\n  .api-results-display__nav-right {\n    display: flex;\n    align-items: center; }\n  .api-results-display__nav-pagination-container {\n    display: flex;\n    align-items: center;\n    background-color: #f9f7f5;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    color: #551a8b;\n    padding: 0.2rem 0.7rem;\n    cursor: pointer;\n    height: 2.8rem;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06); }\n    .api-results-display__nav-pagination-container:not(:last-child) {\n      margin-right: 1rem; }\n    .api-results-display__nav-pagination-container:nth-child(2) svg {\n      margin-right: 1rem; }\n    .api-results-display__nav-pagination-container:nth-child(3) svg {\n      margin-left: 1rem; }\n    .api-results-display__nav-pagination-container--disabled {\n      cursor: not-allowed;\n      color: rgba(0, 0, 0, 0.25);\n      background-color: #f5f6f7; }\n  .api-results-display__nav-svg-size {\n    height: 2rem;\n    width: 2rem; }\n  .api-results-display__nav-svg-color {\n    fill: #551a8b; }\n\n.api-results-display__display-bar {\n  width: 100%;\n  border-bottom: 1px solid rgba(99, 68, 150, 0.1);\n  background-color: #f6f4fa;\n  color: #535353;\n  padding-left: 16%;\n  margin-bottom: 2rem;\n  height: 2.1rem; }\n\n.card-checklist {\n  width: 68%;\n  justify-self: center; }\n  .card-checklist__row {\n    display: grid;\n    height: 3rem; }\n    .card-checklist__row--7 {\n      grid-template-columns: repeat(7, 1fr); }\n    .card-checklist__row--9 {\n      grid-template-columns: repeat(9, 1fr); }\n    .card-checklist__row--header {\n      border-bottom: 1px solid #000;\n      color: #531a8b;\n      text-transform: uppercase;\n      font-size: 1.2rem !important;\n      font-weight: 200 !important; }\n    .card-checklist__row--grey {\n      background-color: #f2f2f2; }\n    .card-checklist__row:nth-child(even) {\n      background-color: #f2f2f2; }\n  .card-checklist__data {\n    display: flex;\n    flex-wrap: nowrap;\n    justify-content: center;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    font-size: 1.4rem; }\n    .card-checklist__data--set {\n      text-transform: uppercase; }\n    .card-checklist__data--rarity {\n      text-transform: capitalize; }\n    .card-checklist__data--name {\n      white-space: nowrap;\n      justify-content: flex-start; }\n  .card-checklist__data-link {\n    padding: 1rem 0;\n    display: flex;\n    flex-wrap: nowrap;\n    align-items: center;\n    text-decoration: none;\n    width: 100%;\n    color: #000;\n    white-space: nowrap; }\n    .card-checklist__data-link--start {\n      justify-content: flex-start; }\n    .card-checklist__data-link--center {\n      justify-content: center; }\n    .card-checklist__data-link--price {\n      color: #006885; }\n\n.tooltip {\n  position: absolute;\n  z-index: 5;\n  width: 24rem;\n  height: 34rem; }\n  .tooltip__img {\n    width: 100%;\n    height: 100%; }\n\n.negative-earnings {\n  color: red; }\n\n.positive-earnings {\n  color: green; }\n\n.image-grid {\n  padding: 10rem 15rem;\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(25rem, 1fr));\n  grid-column-gap: 2rem;\n  grid-row-gap: 1rem; }\n  .image-grid__outer-div {\n    position: relative; }\n  .image-grid__inner-div {\n    perspective: 150rem;\n    height: 34rem;\n    width: 24rem; }\n  .image-grid__double {\n    height: 34rem;\n    width: 24rem;\n    position: absolute;\n    top: 0;\n    left: 0;\n    backface-visibility: hidden;\n    overflow: hidden;\n    transition: all .8s ease; }\n    .image-grid__double--back {\n      transform: rotateY(180deg); }\n  .image-grid__double-btn {\n    position: absolute;\n    top: 50%;\n    right: 15%;\n    width: 4rem;\n    height: 4rem;\n    border-radius: 50%;\n    background-color: rgba(255, 255, 255, 0.4); }\n  .image-grid__container {\n    width: 24rem;\n    height: 34rem; }\n  .image-grid__image {\n    width: 100%;\n    height: 100%; }\n\n.card {\n  display: flex;\n  margin-top: 3rem; }\n  .card__img-container {\n    margin-right: 10rem; }\n  .card__img {\n    width: 33rem;\n    height: 46rem; }\n  .card__img-left {\n    margin-right: 10rem;\n    width: 33rem;\n    display: flex;\n    flex-direction: column; }\n  .card__img-btn {\n    justify-self: flex-end;\n    align-self: flex-end;\n    margin-top: auto; }\n  .card__img-double-area {\n    position: relative; }\n  .card__img-double-sided {\n    perspective: 150rem;\n    height: 46rem; }\n  .card__img-double {\n    width: 33rem;\n    height: 46rem;\n    position: absolute;\n    top: 0;\n    left: 0;\n    backface-visibility: hidden;\n    overflow: hidden; }\n    .card__img-double--back {\n      transform: rotateY(180deg); }\n  .card__text {\n    background-color: #f4f4d7;\n    width: 34rem;\n    display: flex;\n    flex-direction: column;\n    padding: 1rem;\n    margin-right: 3rem; }\n    .card__text-flex {\n      margin-bottom: 1rem;\n      border-bottom: 1px solid #bfbfbf; }\n    .card__text-title {\n      display: flex;\n      align-items: center; }\n      .card__text-title-h3 {\n        font-size: 1.8rem;\n        font-weight: 400;\n        margin-right: 1rem; }\n    .card__text-color-indicator {\n      width: 1.3rem;\n      height: 1.3rem;\n      border: 1px solid #333;\n      border-radius: 50%;\n      box-shadow: 0px 0px 0px 2px rgba(0, 0, 0, 0.2);\n      margin-right: .7rem;\n      display: inline-block; }\n      .card__text-color-indicator--U {\n        background-color: rgba(128, 128, 255, 0.7); }\n      .card__text-color-indicator--B {\n        background-color: rgba(0, 0, 0, 0.7); }\n      .card__text-color-indicator--R {\n        background-color: rgba(255, 77, 77, 0.7); }\n      .card__text-color-indicator--W {\n        background-color: rgba(255, 255, 255, 0.7); }\n      .card__text-color-indicator--G {\n        background-color: rgba(0, 255, 0, 0.7); }\n    .card__text-oracle-p {\n      margin-bottom: 1rem;\n      font-size: 1.3rem; }\n    .card__text-oracle-flavor {\n      font-size: 1.3rem;\n      font-style: italic; }\n    .card__text-illustrator {\n      font-size: 1.2rem;\n      font-style: italic; }\n    .card__text-legal {\n      display: flex;\n      flex-direction: row;\n      justify-content: space-between; }\n      .card__text-legal-half {\n        display: flex;\n        flex-direction: column; }\n      .card__text-legal-span-container {\n        display: flex;\n        align-items: center; }\n        .card__text-legal-span-container:not(:last-child) {\n          margin-bottom: .5rem; }\n      .card__text-legal-span-box {\n        width: 6rem;\n        height: 2.5rem;\n        border: 1px solid #000;\n        margin-right: .3rem;\n        font-size: 1rem;\n        text-transform: uppercase;\n        display: flex;\n        justify-content: center;\n        align-items: center; }\n        .card__text-legal-span-box--not_legal {\n          background-color: #ff0000; }\n        .card__text-legal-span-box--legal {\n          background-color: #47d147; }\n  .card__set {\n    display: flex;\n    flex-direction: column; }\n    .card__set-banner {\n      display: flex;\n      border: 1px solid #bfbfbf;\n      width: 40rem;\n      background-color: #000;\n      color: #fff; }\n      .card__set-banner-svg-container {\n        margin-right: 1rem; }\n      .card__set-banner-svg {\n        width: 2.4rem;\n        height: 2.4rem;\n        filter: invert(100%); }\n    .card__set-details {\n      display: flex;\n      flex-direction: column; }\n    .card__set-header-name {\n      font-size: 1.7remrem; }\n    .card__set-header-code {\n      text-transform: uppercase; }\n    .card__set-prints-header {\n      display: flex;\n      justify-content: space-between;\n      background-color: #000;\n      color: #fff;\n      font-size: 1.3rem;\n      text-transform: uppercase;\n      border: 1px solid #bfbfbf;\n      padding: .3rem .7rem; }\n    .card__set-prints-svg-container {\n      height: 1.8rem;\n      width: 1.8rem;\n      border: 1px solid #bfbfbf;\n      display: flex;\n      justify-content: center;\n      align-items: center;\n      border-radius: 100%; }\n    .card__set-prints-svg--common {\n      fill: #000; }\n    .card__set-prints-svg--uncommon {\n      fill: #e6e6e6; }\n    .card__set-prints-svg--rare {\n      fill: #e6c300; }\n    .card__set-prints-svg--mythic {\n      fill: #ff0000; }\n    .card__set-prints-list {\n      list-style: none; }\n      .card__set-prints-list-link:link, .card__set-prints-list-link:visited {\n        text-decoration: none;\n        color: #000; }\n      .card__set-prints-list-item {\n        display: flex;\n        justify-content: space-between;\n        cursor: pointer; }\n        .card__set-prints-list-item:hover {\n          background-color: #f2f2f2; }\n      .card__set-prints-list-item-name-wrapper {\n        display: flex;\n        align-items: center;\n        margin-left: -1rem; }\n      .card__set-prints-list-item-set-name {\n        margin-left: .5rem; }\n      .card__set-prints-list-item-price {\n        margin-right: .7rem; }\n\n.card-page {\n  display: flex;\n  flex-direction: column;\n  grid-column: center-start / center-end; }\n\n.add-to-inv,\n.remove-from-inv {\n  margin-top: 3rem;\n  width: 50%; }\n  .add-to-inv__form,\n  .remove-from-inv__form {\n    display: flex;\n    flex-direction: column; }\n    .add-to-inv__form-group,\n    .remove-from-inv__form-group {\n      display: flex;\n      align-content: center;\n      margin-bottom: 3rem;\n      position: relative; }\n    .add-to-inv__form-label,\n    .remove-from-inv__form-label {\n      margin-right: .3rem; }\n  .add-to-inv-price-msg,\n  .remove-from-inv-price-msg {\n    position: absolute;\n    bottom: -1.8rem;\n    right: 25%;\n    color: red; }\n\n.no-results {\n  justify-self: center; }\n\n.homepage {\n  background: linear-gradient(to bottom, #1d1c25, #431e3f);\n  background-repeat: no-repeat;\n  height: 100vh;\n  display: flex;\n  overflow-x: hidden !important;\n  justify-content: center;\n  position: relative;\n  background-size: cover; }\n  .homepage__center {\n    align-self: center; }\n  .homepage__search {\n    position: relative; }\n  .homepage__search-input {\n    padding: 1.2rem 1.4rem 1.2rem 6.2rem;\n    font-size: 3rem;\n    background-color: #242031;\n    color: #d7d7d7;\n    border-radius: 4px;\n    box-shadow: 0px 0px 0px 2px rgba(0, 0, 0, 0.5);\n    width: 100%;\n    border: 1px solid rgba(255, 255, 255, 0.5); }\n    .homepage__search-input::placeholder {\n      text-align: center; }\n  .homepage__search-btn {\n    position: absolute;\n    left: 6rem;\n    top: 2rem; }\n  .homepage__icon-sizing--search {\n    width: 3rem;\n    height: 3rem;\n    transform: translateX(-150%); }\n  .homepage__icon-path {\n    fill: #bfbfbf; }\n  .homepage__links {\n    display: flex;\n    justify-content: center; }\n  .homepage__link {\n    text-decoration: none;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    border-color: rgba(255, 255, 255, 0.6);\n    border-radius: 3px;\n    color: #fff;\n    margin-top: 0.6rem;\n    margin-right: 3rem;\n    cursor: pointer;\n    line-height: 1.4;\n    padding: 0.2rem 1rem 0 1rem;\n    height: 2.8rem;\n    transition: all 0.2s;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06);\n    min-width: 9rem;\n    text-align: center; }\n    .homepage__link:hover {\n      background-color: rgba(255, 255, 255, 0.09); }\n  .homepage__colage {\n    position: absolute;\n    overflow: hidden;\n    bottom: 0;\n    left: 0;\n    height: 15rem;\n    width: 100%; }\n  .homepage__colage-inner {\n    position: relative;\n    height: 100%;\n    margin-left: 50%;\n    transform: translateX(-50%);\n    width: 65.5rem; }\n  .homepage__colage-card {\n    width: 16.8rem;\n    height: 23.4rem;\n    position: absolute;\n    border-radius: 5% / 3.75%;\n    transform: translateY(0);\n    transition: all 0.3s;\n    box-shadow: inset 0 0 3px 3px #000; }\n    .homepage__colage-card:nth-child(1) {\n      top: 2.2rem; }\n    .homepage__colage-card:nth-child(2) {\n      top: 6.2rem;\n      left: 3.5rem; }\n    .homepage__colage-card:nth-child(3) {\n      top: 1rem;\n      left: 17.4rem; }\n    .homepage__colage-card:nth-child(4) {\n      top: 4.5rem;\n      left: 20.6rem; }\n    .homepage__colage-card:nth-child(5) {\n      top: 1.6rem;\n      left: 34.7rem; }\n    .homepage__colage-card:nth-child(6) {\n      top: 6.5rem;\n      left: 38rem; }\n    .homepage__colage-card:nth-child(7) {\n      top: 3.5rem;\n      right: 0; }\n    .homepage__colage-card:hover {\n      transform: translateY(-5%); }\n\n.container {\n  display: grid;\n  grid-template-columns: [full-start] minmax(6rem, 1fr) [center-start] repeat(8, [col-start] minmax(min-content, 14rem) [col-end]) [center-end] minmax(6rem, 1fr) [full-end];\n  background-color: #f5f6f7;\n  background-size: cover; }\n\n.search {\n  grid-column: full-start / full-end;\n  background-color: #fff; }\n\n.api-results-display {\n  grid-column: full-start / full-end;\n  background-color: #f5f6f7;\n  background-size: cover;\n  display: grid; }\n", "",{"version":3,"sources":["webpack://./src/css/style.css"],"names":[],"mappings":"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","sourcesContent":["*,\n*::after,\n*::before {\n  margin: 0;\n  padding: 0;\n  box-sizing: inherit; }\n\nhtml {\n  font-size: 62.5%; }\n\nbody {\n  box-sizing: border-box;\n  font-size: 1.6rem;\n  background-size: cover;\n  background-repeat: no-repeat;\n  height: 127.5rem;\n  font-family: 'Lato', sans-serif; }\n\n[hidden] {\n  display: none !important; }\n\n.heading-tertiary {\n  font-size: 2.4rem;\n  text-transform: uppercase; }\n  .heading-tertiary--white {\n    color: #fff; }\n\n.heading-primary {\n  font-size: 3rem;\n  text-transform: uppercase;\n  font-weight: 300;\n  color: #fff; }\n\n.mb-10 {\n  margin-bottom: 1rem; }\n\n.mb-20 {\n  margin-bottom: 2rem; }\n\n.mt-50 {\n  margin-top: 5rem; }\n\n.btn, .btn:link, .btn:visited {\n  padding: .75rem 2rem;\n  border-radius: .5rem;\n  background-color: #f2f2f2;\n  font-weight: 400;\n  display: inline-block; }\n\n.btn:active, .btn:focus {\n  outline: none;\n  transform: translateY(-1px);\n  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.2); }\n\n.login,\n.register {\n  min-height: calc(100vh - 6.1rem);\n  width: 100vw;\n  background: linear-gradient(to top, #5f4f66, #342332);\n  background-repeat: no-repeat;\n  background-size: cover;\n  display: flex;\n  justify-content: center;\n  align-items: center; }\n  .login-img,\n  .register-img {\n    position: absolute;\n    border-radius: 100%;\n    height: 8.5rem;\n    width: 8.5rem;\n    top: -15%; }\n  .login__form,\n  .register__form {\n    position: relative;\n    background-color: #1e2a38;\n    border: 2px solid #1e2a38;\n    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.25);\n    max-width: 32rem;\n    display: flex;\n    flex-flow: column nowrap;\n    align-items: center;\n    padding: 4rem 0 2.6rem 0;\n    transform: translateY(-25%); }\n  .login__form-instructions,\n  .register__form-instructions {\n    color: #fff;\n    font-size: 1.4rem;\n    text-align: center;\n    margin-bottom: 1rem;\n    width: 90%; }\n  .login__form-group,\n  .register__form-group {\n    width: 90%; }\n  .login__form-input,\n  .register__form-input {\n    width: 100%;\n    margin: 0 auto;\n    border: 1px solid rgba(255, 255, 255, 0.2);\n    background-color: rgba(0, 0, 0, 0.1);\n    box-shadow: rgba(0, 0, 0, 0.5);\n    border-radius: 2px;\n    margin-bottom: 1rem;\n    line-height: 1.25;\n    text-align: center;\n    height: 4.2rem;\n    padding: 1rem 1.4rem;\n    caret-color: #fff;\n    color: rgba(255, 255, 255, 0.75); }\n    .login__form-input::placeholder,\n    .register__form-input::placeholder {\n      font-weight: 300;\n      color: #e6e6e6;\n      font-size: 1.8rem; }\n    .login__form-input:focus,\n    .register__form-input:focus {\n      border: 1px solid rgba(255, 255, 255, 0.75); }\n  .login__form-btn,\n  .register__form-btn {\n    width: 90%;\n    border-radius: 2px;\n    padding: 0 1.4rem;\n    margin: 1rem auto 0 auto;\n    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25);\n    cursor: pointer;\n    display: flex;\n    justify-content: space-around;\n    align-items: center;\n    height: 4.2rem; }\n    .login__form-btn--login,\n    .register__form-btn--login {\n      background-color: rgba(255, 255, 255, 0.87);\n      color: #16161d;\n      border: 1px solid #fff; }\n      .login__form-btn--login:hover,\n      .register__form-btn--login:hover {\n        background-color: #fff;\n        color: #342442; }\n      .login__form-btn--login:hover .login__form-icon-path--login,\n      .register__form-btn--login:hover .login__form-icon-path--login {\n        fill: #342442; }\n      .login__form-btn--login::after,\n      .register__form-btn--login::after {\n        margin-bottom: 1px solid white; }\n    .login__form-btn--register,\n    .register__form-btn--register {\n      text-decoration: none;\n      background-color: rgba(255, 255, 255, 0.1);\n      border: 1px solid rgba(255, 255, 255, 0.05);\n      color: rgba(255, 255, 255, 0.75); }\n      .login__form-btn--register:hover,\n      .register__form-btn--register:hover {\n        background-color: rgba(255, 255, 255, 0.25);\n        color: #fff; }\n      .login__form-btn--register:hover .login__form-icon-path--login,\n      .register__form-btn--register:hover .login__form-icon-path--login {\n        fill: #fff; }\n    .login__form-btn span,\n    .register__form-btn span {\n      margin-right: 1rem; }\n  .login__form-icon,\n  .register__form-icon {\n    height: 1.5rem;\n    width: 1.5rem;\n    transform: translateY(17%); }\n  .login__form-icon-path--login,\n  .register__form-icon-path--login {\n    fill: #16161d; }\n  .login__form-icon-path--register,\n  .register__form-icon-path--register {\n    fill: #fff; }\n  .login__form-hr,\n  .register__form-hr {\n    width: 90%;\n    margin: 2rem 0 1rem 0;\n    margin-bottom: 0.25px solid rgba(255, 255, 255, 0.25); }\n\n.nav {\n  display: flex;\n  align-items: center;\n  padding: 1rem 16%;\n  background-color: #2b253a;\n  border-bottom: 1px solid #000; }\n  .nav__left {\n    display: flex;\n    flex: 0 0 50%; }\n  .nav__right {\n    display: flex;\n    border-right: 1px solid #fff;\n    border-left: 1px solid #fff;\n    padding-left: 1rem;\n    margin-left: auto; }\n    .nav__right > * {\n      margin-right: 1rem; }\n  .nav__item--search {\n    flex: 0 0 25%; }\n  .nav__item--home {\n    margin-right: 3rem; }\n  .nav__link {\n    text-decoration: none;\n    color: rgba(255, 255, 255, 0.75);\n    transition: all 0.2s; }\n    .nav__link:hover {\n      margin-bottom: 2px;\n      color: #fff;\n      border-bottom: 1px solid #fff; }\n    .nav__link--home:hover .nav__icon-path--home {\n      fill: #fff; }\n  .nav__search {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    position: relative; }\n    .nav__search-input {\n      border: none;\n      padding: 1rem 2rem;\n      background-color: #2b253a;\n      caret-color: rgba(255, 255, 255, 0.75);\n      color: #fff; }\n      .nav__search-input::placeholder {\n        color: rgba(255, 255, 255, 0.75); }\n      .nav__search-input:focus {\n        outline: none; }\n    .nav__search-btn {\n      cursor: pointer;\n      position: absolute;\n      left: 2rem;\n      top: 1rem; }\n      .nav__search-btn:hover .nav__icon-path--search {\n        fill: #fff; }\n  .nav__icon-sizing--home {\n    width: 3rem;\n    height: 3rem; }\n  .nav__icon-sizing--search {\n    width: 2rem;\n    height: 2rem;\n    transform: translateX(-150%); }\n  .nav__icon-path--home {\n    fill: rgba(255, 255, 255, 0.75); }\n  .nav__icon-path--search {\n    fill: #bfbfbf; }\n\n.error {\n  margin-top: 2rem;\n  text-align: center;\n  background-color: #ff8080;\n  border-radius: 10px;\n  padding: 2rem;\n  font-size: 2rem;\n  grid-column: center-start / center-end;\n  font-weight: 700; }\n\n.search-form {\n  padding: 2rem 25rem;\n  background-color: #fdfdfd;\n  min-height: calc(100vh - 6.2rem); }\n  .search-form__group {\n    width: 75%;\n    display: flex;\n    margin-bottom: 3rem;\n    align-items: flex-start;\n    padding: 0.5rem 4rem 0.5rem 0;\n    border-bottom: 1px solid rgba(0, 0, 0, 0.2); }\n    .search-form__group:nth-child(10) {\n      border-bottom: none; }\n  .search-form__label {\n    flex: 0 0 20%;\n    display: flex;\n    align-items: flex-start;\n    font-weight: 300;\n    margin-top: 0.7rem;\n    color: #551a8b; }\n  .search-form__group-input-wrapper {\n    flex: 0 0 80%; }\n  .search-form__tip {\n    font-size: 1rem;\n    line-height: 1.4;\n    width: 70%; }\n  .search-form__input-text {\n    width: 40rem;\n    height: 4rem;\n    margin-bottom: 1rem;\n    padding: 1rem;\n    border: solid 1px #bfbfbf;\n    border-radius: 5px; }\n    .search-form__input-text:focus {\n      border: solid 1px #000; }\n  .search-form__input-integer {\n    border: 1px solid #aeaeae;\n    height: 3.5rem;\n    border-radius: 3px;\n    padding-left: 0.5rem;\n    padding-right: 0.5rem;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06); }\n    .search-form__input-integer--relative {\n      position: relative; }\n  .search-form__group--checkbox {\n    display: flex;\n    margin-bottom: 1rem; }\n  .search-form__label--checkbox {\n    margin-right: 1rem; }\n  .search-form__input-checkbox {\n    width: 2.25rem;\n    height: 2.25rem;\n    margin-right: 0.8rem; }\n  .search-form__checkbox-wrapper {\n    display: flex;\n    align-items: center; }\n  .search-form__select-menu {\n    margin-bottom: 1rem; }\n  .search-form__select-menu {\n    color: #343242;\n    margin-right: 1rem;\n    border: 1px solid #aeaeae;\n    border-radius: 3px;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06);\n    padding: 0 2.2rem 0 0.5rem;\n    height: 3.4rem;\n    font-size: 1.4rem;\n    text-indent: 0;\n    -webkit-appearance: none;\n    -moz-appearance: none;\n    text-overflow: '';\n    background-image: url(../../app/static/img/SVG/arrow-down2.svg);\n    background-repeat: no-repeat;\n    background-position: right 0.8rem center;\n    background-size: 1.2rem 1rem;\n    background-color: #fff; }\n  .search-form__svg-size {\n    height: 2rem;\n    width: 2rem;\n    margin-right: 1rem; }\n  .search-form__svg-color {\n    fill: #551a8b; }\n  .search-form__submit-wrapper {\n    position: sticky;\n    bottom: 0;\n    width: 75%;\n    display: flex;\n    margin-bottom: 3rem;\n    border-top: 1px solid rgba(0, 0, 0, 0.2);\n    align-items: flex-start;\n    padding: 1.5rem 4rem 1.5rem 0;\n    background-color: #fdfdfd;\n    z-index: 1; }\n  .search-form__submit {\n    border-radius: 3px;\n    padding: 0.7rem;\n    background-color: #f9f7f5;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    color: #551a8b;\n    font-weight: 500;\n    transition: all 0.2s;\n    margin-left: 20%; }\n    .search-form__submit:hover {\n      cursor: pointer;\n      background-color: #fff; }\n  .search-form__dropdown-span {\n    display: flex;\n    flex-direction: column; }\n  .search-form__selected-types, .search-form__selected-sets {\n    display: flex;\n    flex-direction: column;\n    list-style: none;\n    margin-bottom: 0.3rem; }\n  .search-form__selected-types-list-item, .search-form__selected-sets-list-item {\n    display: flex;\n    margin-bottom: 0.7rem; }\n  .search-form__selected-types-remove-btn, .search-form__selected-sets-remove-btn {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    cursor: pointer;\n    height: 2rem;\n    width: 2rem;\n    font-size: 1.3rem;\n    background-color: #f2f2f2;\n    margin-right: 0.7rem; }\n  .search-form__selected-types-toggler {\n    height: 2rem;\n    width: 2.75rem;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    cursor: pointer;\n    font-size: 1.3rem;\n    margin-right: 0.7rem; }\n    .search-form__selected-types-toggler--is {\n      background-color: #47d147; }\n    .search-form__selected-types-toggler--not {\n      background-color: #ff0000; }\n  .search-form__dropdown {\n    position: absolute;\n    max-height: 28rem;\n    background-color: #fff;\n    z-index: 2;\n    top: 100%;\n    width: 40rem;\n    margin-top: -1rem;\n    overflow-y: auto;\n    border: 1px solid #000; }\n    .search-form__dropdown-list {\n      list-style: none; }\n      .search-form__dropdown-list-category {\n        padding: 0.5rem; }\n      .search-form__dropdown-list-option {\n        padding: 0.3rem 2rem;\n        display: flex;\n        align-items: center; }\n        .search-form__dropdown-list-option:hover {\n          cursor: pointer; }\n        .search-form__dropdown-list-option--highlighted {\n          background-color: #ccd8ff; }\n        .search-form__dropdown-list-option span {\n          text-transform: uppercase;\n          margin-left: 1rem; }\n      .search-form__dropdown-list-img {\n        width: 2rem;\n        height: 2rem;\n        margin-right: 0.7rem; }\n\n.dropdown-wrapper {\n  position: relative; }\n\n.inv-search-price-msg {\n  position: absolute;\n  bottom: 0;\n  right: 0;\n  color: red; }\n\n.relative {\n  position: relative; }\n\n.api-results-display__nav {\n  background-color: #f3f5f8;\n  border-bottom: 1px solid rgba(99, 68, 150, 0.1);\n  width: 100%;\n  display: flex;\n  justify-content: space-between;\n  padding: 1.2rem 16%;\n  margin-bottom: 0.1rem;\n  height: 5.2rem; }\n  .api-results-display__nav-select {\n    color: #b300b3;\n    margin-right: 1rem;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    border-radius: 3px;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06);\n    padding: 0.1rem 2.2rem 0 0.5rem;\n    color: #551a8b;\n    height: 2.8rem;\n    font-size: 1.4rem;\n    text-indent: 0;\n    -webkit-appearance: none;\n    -moz-appearance: none;\n    text-overflow: '';\n    background-image: url(../../app/static/img/SVG/arrow-down2.svg);\n    background-repeat: no-repeat;\n    background-position: right 0.8rem center;\n    background-size: 1.2rem 1rem; }\n    .api-results-display__nav-select:hover {\n      cursor: pointer;\n      background-color: #fff; }\n  .api-results-display__nav-label {\n    color: #551a8b; }\n  .api-results-display__nav-btn {\n    border-radius: 3px;\n    background-color: #f9f7f5;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    color: #551a8b;\n    font-weight: 500;\n    transition: all 0.2s;\n    height: 2.8rem;\n    padding: 0.1rem 0.7rem 0 0.7rem;\n    font-size: 1.4rem;\n    margin: auto 0;\n    text-align: center;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06); }\n    .api-results-display__nav-btn:hover {\n      cursor: pointer;\n      background-color: #fff; }\n  .api-results-display__nav-right {\n    display: flex;\n    align-items: center; }\n  .api-results-display__nav-pagination-container {\n    display: flex;\n    align-items: center;\n    background-color: #f9f7f5;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    color: #551a8b;\n    padding: 0.2rem 0.7rem;\n    cursor: pointer;\n    height: 2.8rem;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06); }\n    .api-results-display__nav-pagination-container:not(:last-child) {\n      margin-right: 1rem; }\n    .api-results-display__nav-pagination-container:nth-child(2) svg {\n      margin-right: 1rem; }\n    .api-results-display__nav-pagination-container:nth-child(3) svg {\n      margin-left: 1rem; }\n    .api-results-display__nav-pagination-container--disabled {\n      cursor: not-allowed;\n      color: rgba(0, 0, 0, 0.25);\n      background-color: #f5f6f7; }\n  .api-results-display__nav-svg-size {\n    height: 2rem;\n    width: 2rem; }\n  .api-results-display__nav-svg-color {\n    fill: #551a8b; }\n\n.api-results-display__display-bar {\n  width: 100%;\n  border-bottom: 1px solid rgba(99, 68, 150, 0.1);\n  background-color: #f6f4fa;\n  color: #535353;\n  padding-left: 16%;\n  margin-bottom: 2rem;\n  height: 2.1rem; }\n\n.card-checklist {\n  width: 68%;\n  justify-self: center; }\n  .card-checklist__row {\n    display: grid;\n    height: 3rem; }\n    .card-checklist__row--7 {\n      grid-template-columns: repeat(7, 1fr); }\n    .card-checklist__row--9 {\n      grid-template-columns: repeat(9, 1fr); }\n    .card-checklist__row--header {\n      border-bottom: 1px solid #000;\n      color: #531a8b;\n      text-transform: uppercase;\n      font-size: 1.2rem !important;\n      font-weight: 200 !important; }\n    .card-checklist__row--grey {\n      background-color: #f2f2f2; }\n    .card-checklist__row:nth-child(even) {\n      background-color: #f2f2f2; }\n  .card-checklist__data {\n    display: flex;\n    flex-wrap: nowrap;\n    justify-content: center;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    font-size: 1.4rem; }\n    .card-checklist__data--set {\n      text-transform: uppercase; }\n    .card-checklist__data--rarity {\n      text-transform: capitalize; }\n    .card-checklist__data--name {\n      white-space: nowrap;\n      justify-content: flex-start; }\n  .card-checklist__data-link {\n    padding: 1rem 0;\n    display: flex;\n    flex-wrap: nowrap;\n    align-items: center;\n    text-decoration: none;\n    width: 100%;\n    color: #000;\n    white-space: nowrap; }\n    .card-checklist__data-link--start {\n      justify-content: flex-start; }\n    .card-checklist__data-link--center {\n      justify-content: center; }\n    .card-checklist__data-link--price {\n      color: #006885; }\n\n.tooltip {\n  position: absolute;\n  z-index: 5;\n  width: 24rem;\n  height: 34rem; }\n  .tooltip__img {\n    width: 100%;\n    height: 100%; }\n\n.negative-earnings {\n  color: red; }\n\n.positive-earnings {\n  color: green; }\n\n.image-grid {\n  padding: 10rem 15rem;\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(25rem, 1fr));\n  grid-column-gap: 2rem;\n  grid-row-gap: 1rem; }\n  .image-grid__outer-div {\n    position: relative; }\n  .image-grid__inner-div {\n    perspective: 150rem;\n    height: 34rem;\n    width: 24rem; }\n  .image-grid__double {\n    height: 34rem;\n    width: 24rem;\n    position: absolute;\n    top: 0;\n    left: 0;\n    backface-visibility: hidden;\n    overflow: hidden;\n    transition: all .8s ease; }\n    .image-grid__double--back {\n      transform: rotateY(180deg); }\n  .image-grid__double-btn {\n    position: absolute;\n    top: 50%;\n    right: 15%;\n    width: 4rem;\n    height: 4rem;\n    border-radius: 50%;\n    background-color: rgba(255, 255, 255, 0.4); }\n  .image-grid__container {\n    width: 24rem;\n    height: 34rem; }\n  .image-grid__image {\n    width: 100%;\n    height: 100%; }\n\n.card {\n  display: flex;\n  margin-top: 3rem; }\n  .card__img-container {\n    margin-right: 10rem; }\n  .card__img {\n    width: 33rem;\n    height: 46rem; }\n  .card__img-left {\n    margin-right: 10rem;\n    width: 33rem;\n    display: flex;\n    flex-direction: column; }\n  .card__img-btn {\n    justify-self: flex-end;\n    align-self: flex-end;\n    margin-top: auto; }\n  .card__img-double-area {\n    position: relative; }\n  .card__img-double-sided {\n    perspective: 150rem;\n    height: 46rem; }\n  .card__img-double {\n    width: 33rem;\n    height: 46rem;\n    position: absolute;\n    top: 0;\n    left: 0;\n    backface-visibility: hidden;\n    overflow: hidden; }\n    .card__img-double--back {\n      transform: rotateY(180deg); }\n  .card__text {\n    background-color: #f4f4d7;\n    width: 34rem;\n    display: flex;\n    flex-direction: column;\n    padding: 1rem;\n    margin-right: 3rem; }\n    .card__text-flex {\n      margin-bottom: 1rem;\n      border-bottom: 1px solid #bfbfbf; }\n    .card__text-title {\n      display: flex;\n      align-items: center; }\n      .card__text-title-h3 {\n        font-size: 1.8rem;\n        font-weight: 400;\n        margin-right: 1rem; }\n    .card__text-color-indicator {\n      width: 1.3rem;\n      height: 1.3rem;\n      border: 1px solid #333;\n      border-radius: 50%;\n      box-shadow: 0px 0px 0px 2px rgba(0, 0, 0, 0.2);\n      margin-right: .7rem;\n      display: inline-block; }\n      .card__text-color-indicator--U {\n        background-color: rgba(128, 128, 255, 0.7); }\n      .card__text-color-indicator--B {\n        background-color: rgba(0, 0, 0, 0.7); }\n      .card__text-color-indicator--R {\n        background-color: rgba(255, 77, 77, 0.7); }\n      .card__text-color-indicator--W {\n        background-color: rgba(255, 255, 255, 0.7); }\n      .card__text-color-indicator--G {\n        background-color: rgba(0, 255, 0, 0.7); }\n    .card__text-oracle-p {\n      margin-bottom: 1rem;\n      font-size: 1.3rem; }\n    .card__text-oracle-flavor {\n      font-size: 1.3rem;\n      font-style: italic; }\n    .card__text-illustrator {\n      font-size: 1.2rem;\n      font-style: italic; }\n    .card__text-legal {\n      display: flex;\n      flex-direction: row;\n      justify-content: space-between; }\n      .card__text-legal-half {\n        display: flex;\n        flex-direction: column; }\n      .card__text-legal-span-container {\n        display: flex;\n        align-items: center; }\n        .card__text-legal-span-container:not(:last-child) {\n          margin-bottom: .5rem; }\n      .card__text-legal-span-box {\n        width: 6rem;\n        height: 2.5rem;\n        border: 1px solid #000;\n        margin-right: .3rem;\n        font-size: 1rem;\n        text-transform: uppercase;\n        display: flex;\n        justify-content: center;\n        align-items: center; }\n        .card__text-legal-span-box--not_legal {\n          background-color: #ff0000; }\n        .card__text-legal-span-box--legal {\n          background-color: #47d147; }\n  .card__set {\n    display: flex;\n    flex-direction: column; }\n    .card__set-banner {\n      display: flex;\n      border: 1px solid #bfbfbf;\n      width: 40rem;\n      background-color: #000;\n      color: #fff; }\n      .card__set-banner-svg-container {\n        margin-right: 1rem; }\n      .card__set-banner-svg {\n        width: 2.4rem;\n        height: 2.4rem;\n        filter: invert(100%); }\n    .card__set-details {\n      display: flex;\n      flex-direction: column; }\n    .card__set-header-name {\n      font-size: 1.7remrem; }\n    .card__set-header-code {\n      text-transform: uppercase; }\n    .card__set-prints-header {\n      display: flex;\n      justify-content: space-between;\n      background-color: #000;\n      color: #fff;\n      font-size: 1.3rem;\n      text-transform: uppercase;\n      border: 1px solid #bfbfbf;\n      padding: .3rem .7rem; }\n    .card__set-prints-svg-container {\n      height: 1.8rem;\n      width: 1.8rem;\n      border: 1px solid #bfbfbf;\n      display: flex;\n      justify-content: center;\n      align-items: center;\n      border-radius: 100%; }\n    .card__set-prints-svg--common {\n      fill: #000; }\n    .card__set-prints-svg--uncommon {\n      fill: #e6e6e6; }\n    .card__set-prints-svg--rare {\n      fill: #e6c300; }\n    .card__set-prints-svg--mythic {\n      fill: #ff0000; }\n    .card__set-prints-list {\n      list-style: none; }\n      .card__set-prints-list-link:link, .card__set-prints-list-link:visited {\n        text-decoration: none;\n        color: #000; }\n      .card__set-prints-list-item {\n        display: flex;\n        justify-content: space-between;\n        cursor: pointer; }\n        .card__set-prints-list-item:hover {\n          background-color: #f2f2f2; }\n      .card__set-prints-list-item-name-wrapper {\n        display: flex;\n        align-items: center;\n        margin-left: -1rem; }\n      .card__set-prints-list-item-set-name {\n        margin-left: .5rem; }\n      .card__set-prints-list-item-price {\n        margin-right: .7rem; }\n\n.card-page {\n  display: flex;\n  flex-direction: column;\n  grid-column: center-start / center-end; }\n\n.add-to-inv,\n.remove-from-inv {\n  margin-top: 3rem;\n  width: 50%; }\n  .add-to-inv__form,\n  .remove-from-inv__form {\n    display: flex;\n    flex-direction: column; }\n    .add-to-inv__form-group,\n    .remove-from-inv__form-group {\n      display: flex;\n      align-content: center;\n      margin-bottom: 3rem;\n      position: relative; }\n    .add-to-inv__form-label,\n    .remove-from-inv__form-label {\n      margin-right: .3rem; }\n  .add-to-inv-price-msg,\n  .remove-from-inv-price-msg {\n    position: absolute;\n    bottom: -1.8rem;\n    right: 25%;\n    color: red; }\n\n.no-results {\n  justify-self: center; }\n\n.homepage {\n  background: linear-gradient(to bottom, #1d1c25, #431e3f);\n  background-repeat: no-repeat;\n  height: 100vh;\n  display: flex;\n  overflow-x: hidden !important;\n  justify-content: center;\n  position: relative;\n  background-size: cover; }\n  .homepage__center {\n    align-self: center; }\n  .homepage__search {\n    position: relative; }\n  .homepage__search-input {\n    padding: 1.2rem 1.4rem 1.2rem 6.2rem;\n    font-size: 3rem;\n    background-color: #242031;\n    color: #d7d7d7;\n    border-radius: 4px;\n    box-shadow: 0px 0px 0px 2px rgba(0, 0, 0, 0.5);\n    width: 100%;\n    border: 1px solid rgba(255, 255, 255, 0.5); }\n    .homepage__search-input::placeholder {\n      text-align: center; }\n  .homepage__search-btn {\n    position: absolute;\n    left: 6rem;\n    top: 2rem; }\n  .homepage__icon-sizing--search {\n    width: 3rem;\n    height: 3rem;\n    transform: translateX(-150%); }\n  .homepage__icon-path {\n    fill: #bfbfbf; }\n  .homepage__links {\n    display: flex;\n    justify-content: center; }\n  .homepage__link {\n    text-decoration: none;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    border-color: rgba(255, 255, 255, 0.6);\n    border-radius: 3px;\n    color: #fff;\n    margin-top: 0.6rem;\n    margin-right: 3rem;\n    cursor: pointer;\n    line-height: 1.4;\n    padding: 0.2rem 1rem 0 1rem;\n    height: 2.8rem;\n    transition: all 0.2s;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06);\n    min-width: 9rem;\n    text-align: center; }\n    .homepage__link:hover {\n      background-color: rgba(255, 255, 255, 0.09); }\n  .homepage__colage {\n    position: absolute;\n    overflow: hidden;\n    bottom: 0;\n    left: 0;\n    height: 15rem;\n    width: 100%; }\n  .homepage__colage-inner {\n    position: relative;\n    height: 100%;\n    margin-left: 50%;\n    transform: translateX(-50%);\n    width: 65.5rem; }\n  .homepage__colage-card {\n    width: 16.8rem;\n    height: 23.4rem;\n    position: absolute;\n    border-radius: 5% / 3.75%;\n    transform: translateY(0);\n    transition: all 0.3s;\n    box-shadow: inset 0 0 3px 3px #000; }\n    .homepage__colage-card:nth-child(1) {\n      top: 2.2rem; }\n    .homepage__colage-card:nth-child(2) {\n      top: 6.2rem;\n      left: 3.5rem; }\n    .homepage__colage-card:nth-child(3) {\n      top: 1rem;\n      left: 17.4rem; }\n    .homepage__colage-card:nth-child(4) {\n      top: 4.5rem;\n      left: 20.6rem; }\n    .homepage__colage-card:nth-child(5) {\n      top: 1.6rem;\n      left: 34.7rem; }\n    .homepage__colage-card:nth-child(6) {\n      top: 6.5rem;\n      left: 38rem; }\n    .homepage__colage-card:nth-child(7) {\n      top: 3.5rem;\n      right: 0; }\n    .homepage__colage-card:hover {\n      transform: translateY(-5%); }\n\n.container {\n  display: grid;\n  grid-template-columns: [full-start] minmax(6rem, 1fr) [center-start] repeat(8, [col-start] minmax(min-content, 14rem) [col-end]) [center-end] minmax(6rem, 1fr) [full-end];\n  background-color: #f5f6f7;\n  background-size: cover; }\n\n.search {\n  grid-column: full-start / full-end;\n  background-color: #fff; }\n\n.api-results-display {\n  grid-column: full-start / full-end;\n  background-color: #f5f6f7;\n  background-size: cover;\n  display: grid; }\n"],"sourceRoot":""}]);
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
if (window.location.pathname === '/') document.body.style.overflow = 'hidden';

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
if (window.location.pathname.substring(1, 10) === 'inventory') {
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
            <thead class="js--card-checklist-header">
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
            <tbody class="js--card-checklist-body card-checklist-body"></tbody>
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
            <tr class="js--checklist-row card-checklist__row ${
              cards.length < 30 ? 'card-checklist__row--body' : ''
            } card-checklist__row--7 data-component="card-tooltip" data-card-img=${checkForImg(
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9pbmRleC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvYWRhcHRlcnMveGhyLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9heGlvcy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbFRva2VuLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvaXNDYW5jZWwuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvQXhpb3MuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvSW50ZXJjZXB0b3JNYW5hZ2VyLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2J1aWxkRnVsbFBhdGguanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvY3JlYXRlRXJyb3IuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvZGlzcGF0Y2hSZXF1ZXN0LmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2VuaGFuY2VFcnJvci5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9tZXJnZUNvbmZpZy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9zZXR0bGUuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvdHJhbnNmb3JtRGF0YS5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvZGVmYXVsdHMuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYmluZC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9idWlsZFVSTC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9jb21iaW5lVVJMcy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9jb29raWVzLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzQWJzb2x1dGVVUkwuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNBeGlvc0Vycm9yLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzVVJMU2FtZU9yaWdpbi5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3BhcnNlSGVhZGVycy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9zcHJlYWQuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL3V0aWxzLmpzIiwid2VicGFjazovL21hZ2ljLy4vc3JjL2Nzcy9zdHlsZS5jc3MiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9zcmMvY3NzL3ZlbmRvci9tYW5hLmNzcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvY3NzV2l0aE1hcHBpbmdUb1N0cmluZy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9nZXRVcmwuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9hcHAvc3RhdGljL2ltZy9TVkcvYXJyb3ctZG93bjIuc3ZnIiwid2VicGFjazovL21hZ2ljLy4vc3JjL2ltZy9tYW5hLXN5bWJvbHMvbWFuYS5zdmciLCJ3ZWJwYWNrOi8vbWFnaWMvLi9zcmMvY3NzL3N0eWxlLmNzcz85ZmNkIiwid2VicGFjazovL21hZ2ljLy4vc3JjL2Nzcy92ZW5kb3IvbWFuYS5jc3M/MDcwMiIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL3NyYy9qcy9pbmRleC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL3NyYy9qcy9tb2RlbHMvU2VhcmNoLmpzIiwid2VicGFjazovL21hZ2ljLy4vc3JjL2pzL3ZpZXdzL2Jhc2UuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9zcmMvanMvdmlld3MvY2FyZFZpZXcuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9zcmMvanMvdmlld3MvaW52ZW50b3J5U2VhcmNoVmlldy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL3NyYy9qcy92aWV3cy9pbnZlbnRvcnlWaWV3LmpzIiwid2VicGFjazovL21hZ2ljLy4vc3JjL2pzL3ZpZXdzL3Jlc3VsdHNWaWV3LmpzIiwid2VicGFjazovL21hZ2ljLy4vc3JjL2pzL3ZpZXdzL3NlYXJjaFZpZXcuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vbWFnaWMvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vbWFnaWMvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL21hZ2ljL3dlYnBhY2svcnVudGltZS9nbG9iYWwiLCJ3ZWJwYWNrOi8vbWFnaWMvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9tYWdpYy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL21hZ2ljL3dlYnBhY2svcnVudGltZS9wdWJsaWNQYXRoIiwid2VicGFjazovL21hZ2ljL3dlYnBhY2svc3RhcnR1cCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSw0RkFBdUMsQzs7Ozs7Ozs7Ozs7QUNBMUI7O0FBRWIsWUFBWSxtQkFBTyxDQUFDLHFEQUFZO0FBQ2hDLGFBQWEsbUJBQU8sQ0FBQyxpRUFBa0I7QUFDdkMsY0FBYyxtQkFBTyxDQUFDLHlFQUFzQjtBQUM1QyxlQUFlLG1CQUFPLENBQUMsMkVBQXVCO0FBQzlDLG9CQUFvQixtQkFBTyxDQUFDLDZFQUF1QjtBQUNuRCxtQkFBbUIsbUJBQU8sQ0FBQyxtRkFBMkI7QUFDdEQsc0JBQXNCLG1CQUFPLENBQUMseUZBQThCO0FBQzVELGtCQUFrQixtQkFBTyxDQUFDLHlFQUFxQjs7QUFFL0M7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw0Q0FBNEM7QUFDNUM7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7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QUFhLGFBQWEsV0FBVyxZQUFZLGFBQWEsa0JBQWtCLE9BQU8sWUFBWSxXQUFXLGlCQUFpQixPQUFPLGlCQUFpQixPQUFPLFVBQVUsWUFBWSxhQUFhLGFBQWEsYUFBYSxXQUFXLFVBQVUsWUFBWSxhQUFhLGdCQUFnQixPQUFPLFlBQVksV0FBVyxpQkFBaUIsT0FBTyxZQUFZLGdCQUFnQixPQUFPLGVBQWUsT0FBTyxpQkFBaUIsT0FBTyxZQUFZLGFBQWEsYUFBYSxrQkFBa0IsT0FBTyxZQUFZLGdCQUFnQixNQUFNLGVBQWUsT0FBTyxpQkFBaUIsT0FBTyxVQUFVLFVBQVUsaUJBQWlCLE9BQU8sZUFBZSxPQUFPLGVBQWUsTUFBTSxVQUFVLFlBQVksbUJBQW1CLE1BQU0sVUFBVSxZQUFZLGFBQWEsYUFBYSxrQkFBa0IsTUFBTSxVQUFVLGVBQWUsTUFBTSxVQUFVLFlBQVksYUFBYSxhQUFhLGtCQUFrQixNQUFNLGlCQUFpQixNQUFNLGVBQWUsTUFBTSxpQkFBaUIsTUFBTSxZQUFZLGFBQWEsa0JBQWtCLE1BQU0sWUFBWSxXQUFXLGlCQUFpQixNQUFNLGVBQWUsTUFBTSxVQUFVLFlBQVksYUFBYSxrQkFBa0IsTUFBTSxVQUFVLFlBQVksYUFBYSxhQUFhLGdCQUFnQixLQUFLLGlCQUFpQixNQUFNLGVBQWUsTUFBTSxVQUFVLFlBQVksV0FBVyxlQUFlLEtBQUssZUFBZSxNQUFNLFVBQVUsZUFBZSxNQUFNLFVBQVUsVUFBVSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxnQkFBZ0IsTUFBTSxZQUFZLGFBQWEsYUFBYSxhQUFhLFdBQVcsVUFBVSxZQUFZLG1CQUFtQixNQUFNLFlBQVksYUFBYSxrQkFBa0IsTUFBTSxVQUFVLFVBQVUsWUFBWSxhQUFhLGFBQWEsa0JBQWtCLE1BQU0saUJBQWlCLE1BQU0sVUFBVSxVQUFVLFlBQVksYUFBYSxhQUFhLGdCQUFnQixNQUFNLGVBQWUsTUFBTSxVQUFVLFlBQVksZ0JBQWdCLEtBQUssVUFBVSxVQUFVLFlBQVksV0FBVyxZQUFZLGtCQUFrQixNQUFNLGlCQUFpQixNQUFNLFlBQVksV0FBVyxZQUFZLGFBQWEsYUFBYSxrQkFBa0IsTUFBTSxpQkFBaUIsTUFBTSxVQUFVLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLFVBQVUsVUFBVSxpQkFBaUIsTUFBTSxVQUFVLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLFVBQVUsWUFBWSxhQUFhLGFBQWEsYUFBYSxhQUFhLFdBQVcsWUFBWSxXQUFXLFlBQVksYUFBYSxhQUFhLGFBQWEsYUFBYSxhQUFhLGFBQWEsa0JBQWtCLE1BQU0sVUFBVSxVQUFVLGlCQUFpQixNQUFNLGVBQWUsTUFBTSxZQUFZLFdBQVcsVUFBVSxVQUFVLFlBQVksYUFBYSxhQUFhLGFBQWEsYUFBYSxnQkFBZ0IsS0FBSyxZQUFZLFdBQVcsWUFBWSxhQUFhLFdBQVcsWUFBWSxhQUFhLGtCQUFrQixNQUFNLFVBQVUsaUJBQWlCLE1BQU0sVUFBVSxpQkFBaUIsTUFBTSxVQUFVLFlBQVksYUFBYSxrQkFBa0IsTUFBTSxVQUFVLGlCQUFpQixNQUFNLFVBQVUsWUFBWSxhQUFhLFdBQVcsVUFBVSxVQUFVLFlBQVksYUFBYSxrQkFBa0IsTUFBTSxVQUFVLFVBQVUsVUFBVSxZQUFZLGFBQWEsV0FBVyxZQUFZLGtCQUFrQixNQUFNLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLFlBQVksYUFBYSxhQUFhLFdBQVcsVUFBVSxVQUFVLFlBQVksYUFBYSxrQkFBa0IsTUFBTSxpQkFBaUIsTUFBTSxlQUFlLE1BQU0sWUFBWSxXQUFXLGlCQUFpQixNQUFNLGVBQWUsTUFBTSxpQkFBaUIsTUFBTSxZQUFZLGtCQUFrQixNQUFNLFVBQVUsVUFBVSxrQkFBa0IsTUFBTSxrQkFBa0IsTUFBTSxZQUFZLFdBQVcsVUFBVSxnQkFBZ0IsS0FBSyxrQkFBa0IsTUFBTSxZQUFZLGFBQWEsV0FBVyxVQUFVLFlBQVksYUFBYSxhQUFhLGdCQUFnQixNQUFNLFVBQVUsWUFBWSxhQUFhLGFBQWEsYUFBYSxhQUFhLFdBQVcsVUFBVSxZQUFZLFdBQVcsWUFBWSxhQUFhLGFBQWEsYUFBYSxhQUFhLGFBQWEsa0JBQWtCLE1BQU0sVUFBVSxpQkFBaUIsTUFBTSxlQUFlLE1BQU0sWUFBWSxhQUFhLGFBQWEsV0FBVyxZQUFZLGFBQWEsV0FBVyxZQUFZLGFBQWEsV0FBVyxZQUFZLGtCQUFrQixNQUFNLFVBQVUsaUJBQWlCLE1BQU0sVUFBVSxpQkFBaUIsTUFBTSxVQUFVLFlBQVksYUFBYSxhQUFhLFdBQVcsWUFBWSxXQUFXLFVBQVUsaUJBQWlCLE1BQU0saUJBQWlCLE1BQU0saUJBQWlCLE1BQU0saUJBQWlCLE1BQU0sWUFBWSxhQUFhLGtCQUFrQixNQUFNLFVBQVUsZUFBZSxLQUFLLGdCQUFnQixNQUFNLFVBQVUsWUFBWSxhQUFhLFdBQVcsWUFBWSxhQUFhLGlCQUFpQixNQUFNLFVBQVUsaUJBQWlCLE1BQU0sVUFBVSxlQUFlLEtBQUssaUJBQWlCLE1BQU0saUJBQWlCLE1BQU0sWUFBWSxXQUFXLFlBQVksYUFBYSxrQkFBa0IsTUFBTSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxVQUFVLFlBQVksYUFBYSxhQUFhLGFBQWEsa0JBQWtCLE1BQU0saUJBQWlCLE1BQU0saUJBQWlCLE1BQU0sWUFBWSxrQkFBa0IsTUFBTSxVQUFVLFVBQVUsWUFBWSxhQUFhLGFBQWEsV0FBVyxVQUFVLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLGdCQUFnQixNQUFNLFlBQVksV0FBVyxVQUFVLGVBQWUsS0FBSyxVQUFVLGdCQUFnQixNQUFNLGdCQUFnQixLQUFLLGdCQUFnQixNQUFNLFlBQVksV0FBVyxZQUFZLGFBQWEsa0JBQWtCLE1BQU0saUJBQWlCLE1BQU0sWUFBWSxXQUFXLGVBQWUsTUFBTSxVQUFVLFVBQVUsWUFBWSxXQUFXLFVBQVUsWUFBWSxhQUFhLGtCQUFrQixNQUFNLGlCQUFpQixNQUFNLFlBQVksV0FBVyxVQUFVLFVBQVUsVUFBVSxZQUFZLGtCQUFrQixNQUFNLFVBQVUsZUFBZSxNQUFNLFVBQVUsZ0JBQWdCLE1BQU0sVUFBVSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxVQUFVLGVBQWUsTUFBTSxZQUFZLFdBQVcsVUFBVSxpQkFBaUIsTUFBTSxZQUFZLGFBQWEsa0JBQWtCLE1BQU0saUJBQWlCLE1BQU0sWUFBWSxnQkFBZ0IsTUFBTSxVQUFVLFVBQVUsWUFBWSxXQUFXLFVBQVUsWUFBWSxrQkFBa0IsTUFBTSxpQkFBaUIsTUFBTSxZQUFZLFdBQVcsVUFBVSxZQUFZLFdBQVcsaUJBQWlCLE1BQU0sWUFBWSxrQkFBa0IsTUFBTSxVQUFVLGlCQUFpQixNQUFNLFlBQVksYUFBYSxrQkFBa0IsTUFBTSxVQUFVLFVBQVUsWUFBWSxhQUFhLGFBQWEsYUFBYSxrQkFBa0IsTUFBTSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxZQUFZLGtCQUFrQixNQUFNLFlBQVksa0JBQWtCLE1BQU0sWUFBWSxrQkFBa0IsTUFBTSxVQUFVLFlBQVksa0JBQWtCLE1BQU0sVUFBVSxpQkFBaUIsTUFBTSxVQUFVLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLFVBQVUsVUFBVSxZQUFZLGFBQWEsV0FBVyxZQUFZLFdBQVcsWUFBWSxrQkFBa0IsTUFBTSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxVQUFVLGlCQUFpQixNQUFNLFVBQVUsWUFBWSxXQUFXLFlBQVksZ0JBQWdCLEtBQUssaUJBQWlCLE1BQU0sVUFBVSxVQUFVLGlCQUFpQixNQUFNLFVBQVUsaUJBQWlCLE1BQU0saUJBQWlCLE1BQU0saUJBQWlCLE1BQU0sVUFBVSxZQUFZLGFBQWEsV0FBVyxZQUFZLGFBQWEsYUFBYSxrQkFBa0IsTUFBTSxVQUFVLFVBQVUsWUFBWSxXQUFXLFlBQVksYUFBYSxrQkFBa0IsTUFBTSxlQUFlLEtBQUssZUFBZSxNQUFNLGVBQWUsTUFBTSxlQUFlLE1BQU0saUJBQWlCLE1BQU0sWUFBWSxnQkFBZ0IsS0FBSyxVQUFVLFlBQVksZ0JBQWdCLE1BQU0saUJBQWlCLE1BQU0sVUFBVSxZQUFZLGtCQUFrQixNQUFNLGlCQUFpQixNQUFNLGtCQUFrQixNQUFNLFVBQVUsWUFBWSxtQkFBbUIsT0FBTyxZQUFZ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QUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7O0FBRU87QUFDUDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7O0FBRU87QUFDUDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSwwQ0FBMEMsa0VBQStCO0FBQ3pFOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSwwQ0FBMEMsa0VBQStCO0FBQ3pFO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFTztBQUNQO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUUsNEVBQXlDO0FBQzNDOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBLCtEQUErRCxTQUFTOztBQUV4RTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0Esa0M7Ozs7VUNmQTtVQUNBO1VBQ0E7VUFDQSIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL2F4aW9zJyk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgc2V0dGxlID0gcmVxdWlyZSgnLi8uLi9jb3JlL3NldHRsZScpO1xudmFyIGNvb2tpZXMgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvY29va2llcycpO1xudmFyIGJ1aWxkVVJMID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2J1aWxkVVJMJyk7XG52YXIgYnVpbGRGdWxsUGF0aCA9IHJlcXVpcmUoJy4uL2NvcmUvYnVpbGRGdWxsUGF0aCcpO1xudmFyIHBhcnNlSGVhZGVycyA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9wYXJzZUhlYWRlcnMnKTtcbnZhciBpc1VSTFNhbWVPcmlnaW4gPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvaXNVUkxTYW1lT3JpZ2luJyk7XG52YXIgY3JlYXRlRXJyb3IgPSByZXF1aXJlKCcuLi9jb3JlL2NyZWF0ZUVycm9yJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24geGhyQWRhcHRlcihjb25maWcpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIGRpc3BhdGNoWGhyUmVxdWVzdChyZXNvbHZlLCByZWplY3QpIHtcbiAgICB2YXIgcmVxdWVzdERhdGEgPSBjb25maWcuZGF0YTtcbiAgICB2YXIgcmVxdWVzdEhlYWRlcnMgPSBjb25maWcuaGVhZGVycztcblxuICAgIGlmICh1dGlscy5pc0Zvcm1EYXRhKHJlcXVlc3REYXRhKSkge1xuICAgICAgZGVsZXRlIHJlcXVlc3RIZWFkZXJzWydDb250ZW50LVR5cGUnXTsgLy8gTGV0IHRoZSBicm93c2VyIHNldCBpdFxuICAgIH1cblxuICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAvLyBIVFRQIGJhc2ljIGF1dGhlbnRpY2F0aW9uXG4gICAgaWYgKGNvbmZpZy5hdXRoKSB7XG4gICAgICB2YXIgdXNlcm5hbWUgPSBjb25maWcuYXV0aC51c2VybmFtZSB8fCAnJztcbiAgICAgIHZhciBwYXNzd29yZCA9IGNvbmZpZy5hdXRoLnBhc3N3b3JkID8gdW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KGNvbmZpZy5hdXRoLnBhc3N3b3JkKSkgOiAnJztcbiAgICAgIHJlcXVlc3RIZWFkZXJzLkF1dGhvcml6YXRpb24gPSAnQmFzaWMgJyArIGJ0b2EodXNlcm5hbWUgKyAnOicgKyBwYXNzd29yZCk7XG4gICAgfVxuXG4gICAgdmFyIGZ1bGxQYXRoID0gYnVpbGRGdWxsUGF0aChjb25maWcuYmFzZVVSTCwgY29uZmlnLnVybCk7XG4gICAgcmVxdWVzdC5vcGVuKGNvbmZpZy5tZXRob2QudG9VcHBlckNhc2UoKSwgYnVpbGRVUkwoZnVsbFBhdGgsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKSwgdHJ1ZSk7XG5cbiAgICAvLyBTZXQgdGhlIHJlcXVlc3QgdGltZW91dCBpbiBNU1xuICAgIHJlcXVlc3QudGltZW91dCA9IGNvbmZpZy50aW1lb3V0O1xuXG4gICAgLy8gTGlzdGVuIGZvciByZWFkeSBzdGF0ZVxuICAgIHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gaGFuZGxlTG9hZCgpIHtcbiAgICAgIGlmICghcmVxdWVzdCB8fCByZXF1ZXN0LnJlYWR5U3RhdGUgIT09IDQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBUaGUgcmVxdWVzdCBlcnJvcmVkIG91dCBhbmQgd2UgZGlkbid0IGdldCBhIHJlc3BvbnNlLCB0aGlzIHdpbGwgYmVcbiAgICAgIC8vIGhhbmRsZWQgYnkgb25lcnJvciBpbnN0ZWFkXG4gICAgICAvLyBXaXRoIG9uZSBleGNlcHRpb246IHJlcXVlc3QgdGhhdCB1c2luZyBmaWxlOiBwcm90b2NvbCwgbW9zdCBicm93c2Vyc1xuICAgICAgLy8gd2lsbCByZXR1cm4gc3RhdHVzIGFzIDAgZXZlbiB0aG91Z2ggaXQncyBhIHN1Y2Nlc3NmdWwgcmVxdWVzdFxuICAgICAgaWYgKHJlcXVlc3Quc3RhdHVzID09PSAwICYmICEocmVxdWVzdC5yZXNwb25zZVVSTCAmJiByZXF1ZXN0LnJlc3BvbnNlVVJMLmluZGV4T2YoJ2ZpbGU6JykgPT09IDApKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gUHJlcGFyZSB0aGUgcmVzcG9uc2VcbiAgICAgIHZhciByZXNwb25zZUhlYWRlcnMgPSAnZ2V0QWxsUmVzcG9uc2VIZWFkZXJzJyBpbiByZXF1ZXN0ID8gcGFyc2VIZWFkZXJzKHJlcXVlc3QuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpIDogbnVsbDtcbiAgICAgIHZhciByZXNwb25zZURhdGEgPSAhY29uZmlnLnJlc3BvbnNlVHlwZSB8fCBjb25maWcucmVzcG9uc2VUeXBlID09PSAndGV4dCcgPyByZXF1ZXN0LnJlc3BvbnNlVGV4dCA6IHJlcXVlc3QucmVzcG9uc2U7XG4gICAgICB2YXIgcmVzcG9uc2UgPSB7XG4gICAgICAgIGRhdGE6IHJlc3BvbnNlRGF0YSxcbiAgICAgICAgc3RhdHVzOiByZXF1ZXN0LnN0YXR1cyxcbiAgICAgICAgc3RhdHVzVGV4dDogcmVxdWVzdC5zdGF0dXNUZXh0LFxuICAgICAgICBoZWFkZXJzOiByZXNwb25zZUhlYWRlcnMsXG4gICAgICAgIGNvbmZpZzogY29uZmlnLFxuICAgICAgICByZXF1ZXN0OiByZXF1ZXN0XG4gICAgICB9O1xuXG4gICAgICBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCByZXNwb25zZSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgYnJvd3NlciByZXF1ZXN0IGNhbmNlbGxhdGlvbiAoYXMgb3Bwb3NlZCB0byBhIG1hbnVhbCBjYW5jZWxsYXRpb24pXG4gICAgcmVxdWVzdC5vbmFib3J0ID0gZnVuY3Rpb24gaGFuZGxlQWJvcnQoKSB7XG4gICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ1JlcXVlc3QgYWJvcnRlZCcsIGNvbmZpZywgJ0VDT05OQUJPUlRFRCcsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSBsb3cgbGV2ZWwgbmV0d29yayBlcnJvcnNcbiAgICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbiBoYW5kbGVFcnJvcigpIHtcbiAgICAgIC8vIFJlYWwgZXJyb3JzIGFyZSBoaWRkZW4gZnJvbSB1cyBieSB0aGUgYnJvd3NlclxuICAgICAgLy8gb25lcnJvciBzaG91bGQgb25seSBmaXJlIGlmIGl0J3MgYSBuZXR3b3JrIGVycm9yXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ05ldHdvcmsgRXJyb3InLCBjb25maWcsIG51bGwsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSB0aW1lb3V0XG4gICAgcmVxdWVzdC5vbnRpbWVvdXQgPSBmdW5jdGlvbiBoYW5kbGVUaW1lb3V0KCkge1xuICAgICAgdmFyIHRpbWVvdXRFcnJvck1lc3NhZ2UgPSAndGltZW91dCBvZiAnICsgY29uZmlnLnRpbWVvdXQgKyAnbXMgZXhjZWVkZWQnO1xuICAgICAgaWYgKGNvbmZpZy50aW1lb3V0RXJyb3JNZXNzYWdlKSB7XG4gICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2UgPSBjb25maWcudGltZW91dEVycm9yTWVzc2FnZTtcbiAgICAgIH1cbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcih0aW1lb3V0RXJyb3JNZXNzYWdlLCBjb25maWcsICdFQ09OTkFCT1JURUQnLFxuICAgICAgICByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBBZGQgeHNyZiBoZWFkZXJcbiAgICAvLyBUaGlzIGlzIG9ubHkgZG9uZSBpZiBydW5uaW5nIGluIGEgc3RhbmRhcmQgYnJvd3NlciBlbnZpcm9ubWVudC5cbiAgICAvLyBTcGVjaWZpY2FsbHkgbm90IGlmIHdlJ3JlIGluIGEgd2ViIHdvcmtlciwgb3IgcmVhY3QtbmF0aXZlLlxuICAgIGlmICh1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpKSB7XG4gICAgICAvLyBBZGQgeHNyZiBoZWFkZXJcbiAgICAgIHZhciB4c3JmVmFsdWUgPSAoY29uZmlnLndpdGhDcmVkZW50aWFscyB8fCBpc1VSTFNhbWVPcmlnaW4oZnVsbFBhdGgpKSAmJiBjb25maWcueHNyZkNvb2tpZU5hbWUgP1xuICAgICAgICBjb29raWVzLnJlYWQoY29uZmlnLnhzcmZDb29raWVOYW1lKSA6XG4gICAgICAgIHVuZGVmaW5lZDtcblxuICAgICAgaWYgKHhzcmZWYWx1ZSkge1xuICAgICAgICByZXF1ZXN0SGVhZGVyc1tjb25maWcueHNyZkhlYWRlck5hbWVdID0geHNyZlZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFkZCBoZWFkZXJzIHRvIHRoZSByZXF1ZXN0XG4gICAgaWYgKCdzZXRSZXF1ZXN0SGVhZGVyJyBpbiByZXF1ZXN0KSB7XG4gICAgICB1dGlscy5mb3JFYWNoKHJlcXVlc3RIZWFkZXJzLCBmdW5jdGlvbiBzZXRSZXF1ZXN0SGVhZGVyKHZhbCwga2V5KSB7XG4gICAgICAgIGlmICh0eXBlb2YgcmVxdWVzdERhdGEgPT09ICd1bmRlZmluZWQnICYmIGtleS50b0xvd2VyQ2FzZSgpID09PSAnY29udGVudC10eXBlJykge1xuICAgICAgICAgIC8vIFJlbW92ZSBDb250ZW50LVR5cGUgaWYgZGF0YSBpcyB1bmRlZmluZWRcbiAgICAgICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNba2V5XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBPdGhlcndpc2UgYWRkIGhlYWRlciB0byB0aGUgcmVxdWVzdFxuICAgICAgICAgIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcihrZXksIHZhbCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEFkZCB3aXRoQ3JlZGVudGlhbHMgdG8gcmVxdWVzdCBpZiBuZWVkZWRcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZy53aXRoQ3JlZGVudGlhbHMpKSB7XG4gICAgICByZXF1ZXN0LndpdGhDcmVkZW50aWFscyA9ICEhY29uZmlnLndpdGhDcmVkZW50aWFscztcbiAgICB9XG5cbiAgICAvLyBBZGQgcmVzcG9uc2VUeXBlIHRvIHJlcXVlc3QgaWYgbmVlZGVkXG4gICAgaWYgKGNvbmZpZy5yZXNwb25zZVR5cGUpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gY29uZmlnLnJlc3BvbnNlVHlwZTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gRXhwZWN0ZWQgRE9NRXhjZXB0aW9uIHRocm93biBieSBicm93c2VycyBub3QgY29tcGF0aWJsZSBYTUxIdHRwUmVxdWVzdCBMZXZlbCAyLlxuICAgICAgICAvLyBCdXQsIHRoaXMgY2FuIGJlIHN1cHByZXNzZWQgZm9yICdqc29uJyB0eXBlIGFzIGl0IGNhbiBiZSBwYXJzZWQgYnkgZGVmYXVsdCAndHJhbnNmb3JtUmVzcG9uc2UnIGZ1bmN0aW9uLlxuICAgICAgICBpZiAoY29uZmlnLnJlc3BvbnNlVHlwZSAhPT0gJ2pzb24nKSB7XG4gICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEhhbmRsZSBwcm9ncmVzcyBpZiBuZWVkZWRcbiAgICBpZiAodHlwZW9mIGNvbmZpZy5vbkRvd25sb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBjb25maWcub25Eb3dubG9hZFByb2dyZXNzKTtcbiAgICB9XG5cbiAgICAvLyBOb3QgYWxsIGJyb3dzZXJzIHN1cHBvcnQgdXBsb2FkIGV2ZW50c1xuICAgIGlmICh0eXBlb2YgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicgJiYgcmVxdWVzdC51cGxvYWQpIHtcbiAgICAgIHJlcXVlc3QudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MpO1xuICAgIH1cblxuICAgIGlmIChjb25maWcuY2FuY2VsVG9rZW4pIHtcbiAgICAgIC8vIEhhbmRsZSBjYW5jZWxsYXRpb25cbiAgICAgIGNvbmZpZy5jYW5jZWxUb2tlbi5wcm9taXNlLnRoZW4oZnVuY3Rpb24gb25DYW5jZWxlZChjYW5jZWwpIHtcbiAgICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVxdWVzdC5hYm9ydCgpO1xuICAgICAgICByZWplY3QoY2FuY2VsKTtcbiAgICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICghcmVxdWVzdERhdGEpIHtcbiAgICAgIHJlcXVlc3REYXRhID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBTZW5kIHRoZSByZXF1ZXN0XG4gICAgcmVxdWVzdC5zZW5kKHJlcXVlc3REYXRhKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgYmluZCA9IHJlcXVpcmUoJy4vaGVscGVycy9iaW5kJyk7XG52YXIgQXhpb3MgPSByZXF1aXJlKCcuL2NvcmUvQXhpb3MnKTtcbnZhciBtZXJnZUNvbmZpZyA9IHJlcXVpcmUoJy4vY29yZS9tZXJnZUNvbmZpZycpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi9kZWZhdWx0cycpO1xuXG4vKipcbiAqIENyZWF0ZSBhbiBpbnN0YW5jZSBvZiBBeGlvc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBkZWZhdWx0Q29uZmlnIFRoZSBkZWZhdWx0IGNvbmZpZyBmb3IgdGhlIGluc3RhbmNlXG4gKiBAcmV0dXJuIHtBeGlvc30gQSBuZXcgaW5zdGFuY2Ugb2YgQXhpb3NcbiAqL1xuZnVuY3Rpb24gY3JlYXRlSW5zdGFuY2UoZGVmYXVsdENvbmZpZykge1xuICB2YXIgY29udGV4dCA9IG5ldyBBeGlvcyhkZWZhdWx0Q29uZmlnKTtcbiAgdmFyIGluc3RhbmNlID0gYmluZChBeGlvcy5wcm90b3R5cGUucmVxdWVzdCwgY29udGV4dCk7XG5cbiAgLy8gQ29weSBheGlvcy5wcm90b3R5cGUgdG8gaW5zdGFuY2VcbiAgdXRpbHMuZXh0ZW5kKGluc3RhbmNlLCBBeGlvcy5wcm90b3R5cGUsIGNvbnRleHQpO1xuXG4gIC8vIENvcHkgY29udGV4dCB0byBpbnN0YW5jZVxuICB1dGlscy5leHRlbmQoaW5zdGFuY2UsIGNvbnRleHQpO1xuXG4gIHJldHVybiBpbnN0YW5jZTtcbn1cblxuLy8gQ3JlYXRlIHRoZSBkZWZhdWx0IGluc3RhbmNlIHRvIGJlIGV4cG9ydGVkXG52YXIgYXhpb3MgPSBjcmVhdGVJbnN0YW5jZShkZWZhdWx0cyk7XG5cbi8vIEV4cG9zZSBBeGlvcyBjbGFzcyB0byBhbGxvdyBjbGFzcyBpbmhlcml0YW5jZVxuYXhpb3MuQXhpb3MgPSBBeGlvcztcblxuLy8gRmFjdG9yeSBmb3IgY3JlYXRpbmcgbmV3IGluc3RhbmNlc1xuYXhpb3MuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlKGluc3RhbmNlQ29uZmlnKSB7XG4gIHJldHVybiBjcmVhdGVJbnN0YW5jZShtZXJnZUNvbmZpZyhheGlvcy5kZWZhdWx0cywgaW5zdGFuY2VDb25maWcpKTtcbn07XG5cbi8vIEV4cG9zZSBDYW5jZWwgJiBDYW5jZWxUb2tlblxuYXhpb3MuQ2FuY2VsID0gcmVxdWlyZSgnLi9jYW5jZWwvQ2FuY2VsJyk7XG5heGlvcy5DYW5jZWxUb2tlbiA9IHJlcXVpcmUoJy4vY2FuY2VsL0NhbmNlbFRva2VuJyk7XG5heGlvcy5pc0NhbmNlbCA9IHJlcXVpcmUoJy4vY2FuY2VsL2lzQ2FuY2VsJyk7XG5cbi8vIEV4cG9zZSBhbGwvc3ByZWFkXG5heGlvcy5hbGwgPSBmdW5jdGlvbiBhbGwocHJvbWlzZXMpIHtcbiAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcbn07XG5heGlvcy5zcHJlYWQgPSByZXF1aXJlKCcuL2hlbHBlcnMvc3ByZWFkJyk7XG5cbi8vIEV4cG9zZSBpc0F4aW9zRXJyb3JcbmF4aW9zLmlzQXhpb3NFcnJvciA9IHJlcXVpcmUoJy4vaGVscGVycy9pc0F4aW9zRXJyb3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBheGlvcztcblxuLy8gQWxsb3cgdXNlIG9mIGRlZmF1bHQgaW1wb3J0IHN5bnRheCBpbiBUeXBlU2NyaXB0XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gYXhpb3M7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQSBgQ2FuY2VsYCBpcyBhbiBvYmplY3QgdGhhdCBpcyB0aHJvd24gd2hlbiBhbiBvcGVyYXRpb24gaXMgY2FuY2VsZWQuXG4gKlxuICogQGNsYXNzXG4gKiBAcGFyYW0ge3N0cmluZz19IG1lc3NhZ2UgVGhlIG1lc3NhZ2UuXG4gKi9cbmZ1bmN0aW9uIENhbmNlbChtZXNzYWdlKSB7XG4gIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG59XG5cbkNhbmNlbC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgcmV0dXJuICdDYW5jZWwnICsgKHRoaXMubWVzc2FnZSA/ICc6ICcgKyB0aGlzLm1lc3NhZ2UgOiAnJyk7XG59O1xuXG5DYW5jZWwucHJvdG90eXBlLl9fQ0FOQ0VMX18gPSB0cnVlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbmNlbDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENhbmNlbCA9IHJlcXVpcmUoJy4vQ2FuY2VsJyk7XG5cbi8qKlxuICogQSBgQ2FuY2VsVG9rZW5gIGlzIGFuIG9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlcXVlc3QgY2FuY2VsbGF0aW9uIG9mIGFuIG9wZXJhdGlvbi5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGV4ZWN1dG9yIFRoZSBleGVjdXRvciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsVG9rZW4oZXhlY3V0b3IpIHtcbiAgaWYgKHR5cGVvZiBleGVjdXRvciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2V4ZWN1dG9yIG11c3QgYmUgYSBmdW5jdGlvbi4nKTtcbiAgfVxuXG4gIHZhciByZXNvbHZlUHJvbWlzZTtcbiAgdGhpcy5wcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gcHJvbWlzZUV4ZWN1dG9yKHJlc29sdmUpIHtcbiAgICByZXNvbHZlUHJvbWlzZSA9IHJlc29sdmU7XG4gIH0pO1xuXG4gIHZhciB0b2tlbiA9IHRoaXM7XG4gIGV4ZWN1dG9yKGZ1bmN0aW9uIGNhbmNlbChtZXNzYWdlKSB7XG4gICAgaWYgKHRva2VuLnJlYXNvbikge1xuICAgICAgLy8gQ2FuY2VsbGF0aW9uIGhhcyBhbHJlYWR5IGJlZW4gcmVxdWVzdGVkXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdG9rZW4ucmVhc29uID0gbmV3IENhbmNlbChtZXNzYWdlKTtcbiAgICByZXNvbHZlUHJvbWlzZSh0b2tlbi5yZWFzb24pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBUaHJvd3MgYSBgQ2FuY2VsYCBpZiBjYW5jZWxsYXRpb24gaGFzIGJlZW4gcmVxdWVzdGVkLlxuICovXG5DYW5jZWxUb2tlbi5wcm90b3R5cGUudGhyb3dJZlJlcXVlc3RlZCA9IGZ1bmN0aW9uIHRocm93SWZSZXF1ZXN0ZWQoKSB7XG4gIGlmICh0aGlzLnJlYXNvbikge1xuICAgIHRocm93IHRoaXMucmVhc29uO1xuICB9XG59O1xuXG4vKipcbiAqIFJldHVybnMgYW4gb2JqZWN0IHRoYXQgY29udGFpbnMgYSBuZXcgYENhbmNlbFRva2VuYCBhbmQgYSBmdW5jdGlvbiB0aGF0LCB3aGVuIGNhbGxlZCxcbiAqIGNhbmNlbHMgdGhlIGBDYW5jZWxUb2tlbmAuXG4gKi9cbkNhbmNlbFRva2VuLnNvdXJjZSA9IGZ1bmN0aW9uIHNvdXJjZSgpIHtcbiAgdmFyIGNhbmNlbDtcbiAgdmFyIHRva2VuID0gbmV3IENhbmNlbFRva2VuKGZ1bmN0aW9uIGV4ZWN1dG9yKGMpIHtcbiAgICBjYW5jZWwgPSBjO1xuICB9KTtcbiAgcmV0dXJuIHtcbiAgICB0b2tlbjogdG9rZW4sXG4gICAgY2FuY2VsOiBjYW5jZWxcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsVG9rZW47XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNDYW5jZWwodmFsdWUpIHtcbiAgcmV0dXJuICEhKHZhbHVlICYmIHZhbHVlLl9fQ0FOQ0VMX18pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIGJ1aWxkVVJMID0gcmVxdWlyZSgnLi4vaGVscGVycy9idWlsZFVSTCcpO1xudmFyIEludGVyY2VwdG9yTWFuYWdlciA9IHJlcXVpcmUoJy4vSW50ZXJjZXB0b3JNYW5hZ2VyJyk7XG52YXIgZGlzcGF0Y2hSZXF1ZXN0ID0gcmVxdWlyZSgnLi9kaXNwYXRjaFJlcXVlc3QnKTtcbnZhciBtZXJnZUNvbmZpZyA9IHJlcXVpcmUoJy4vbWVyZ2VDb25maWcnKTtcblxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YgQXhpb3NcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gaW5zdGFuY2VDb25maWcgVGhlIGRlZmF1bHQgY29uZmlnIGZvciB0aGUgaW5zdGFuY2VcbiAqL1xuZnVuY3Rpb24gQXhpb3MoaW5zdGFuY2VDb25maWcpIHtcbiAgdGhpcy5kZWZhdWx0cyA9IGluc3RhbmNlQ29uZmlnO1xuICB0aGlzLmludGVyY2VwdG9ycyA9IHtcbiAgICByZXF1ZXN0OiBuZXcgSW50ZXJjZXB0b3JNYW5hZ2VyKCksXG4gICAgcmVzcG9uc2U6IG5ldyBJbnRlcmNlcHRvck1hbmFnZXIoKVxuICB9O1xufVxuXG4vKipcbiAqIERpc3BhdGNoIGEgcmVxdWVzdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZyBzcGVjaWZpYyBmb3IgdGhpcyByZXF1ZXN0IChtZXJnZWQgd2l0aCB0aGlzLmRlZmF1bHRzKVxuICovXG5BeGlvcy5wcm90b3R5cGUucmVxdWVzdCA9IGZ1bmN0aW9uIHJlcXVlc3QoY29uZmlnKSB7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAvLyBBbGxvdyBmb3IgYXhpb3MoJ2V4YW1wbGUvdXJsJ1ssIGNvbmZpZ10pIGEgbGEgZmV0Y2ggQVBJXG4gIGlmICh0eXBlb2YgY29uZmlnID09PSAnc3RyaW5nJykge1xuICAgIGNvbmZpZyA9IGFyZ3VtZW50c1sxXSB8fCB7fTtcbiAgICBjb25maWcudXJsID0gYXJndW1lbnRzWzBdO1xuICB9IGVsc2Uge1xuICAgIGNvbmZpZyA9IGNvbmZpZyB8fCB7fTtcbiAgfVxuXG4gIGNvbmZpZyA9IG1lcmdlQ29uZmlnKHRoaXMuZGVmYXVsdHMsIGNvbmZpZyk7XG5cbiAgLy8gU2V0IGNvbmZpZy5tZXRob2RcbiAgaWYgKGNvbmZpZy5tZXRob2QpIHtcbiAgICBjb25maWcubWV0aG9kID0gY29uZmlnLm1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuICB9IGVsc2UgaWYgKHRoaXMuZGVmYXVsdHMubWV0aG9kKSB7XG4gICAgY29uZmlnLm1ldGhvZCA9IHRoaXMuZGVmYXVsdHMubWV0aG9kLnRvTG93ZXJDYXNlKCk7XG4gIH0gZWxzZSB7XG4gICAgY29uZmlnLm1ldGhvZCA9ICdnZXQnO1xuICB9XG5cbiAgLy8gSG9vayB1cCBpbnRlcmNlcHRvcnMgbWlkZGxld2FyZVxuICB2YXIgY2hhaW4gPSBbZGlzcGF0Y2hSZXF1ZXN0LCB1bmRlZmluZWRdO1xuICB2YXIgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZShjb25maWcpO1xuXG4gIHRoaXMuaW50ZXJjZXB0b3JzLnJlcXVlc3QuZm9yRWFjaChmdW5jdGlvbiB1bnNoaWZ0UmVxdWVzdEludGVyY2VwdG9ycyhpbnRlcmNlcHRvcikge1xuICAgIGNoYWluLnVuc2hpZnQoaW50ZXJjZXB0b3IuZnVsZmlsbGVkLCBpbnRlcmNlcHRvci5yZWplY3RlZCk7XG4gIH0pO1xuXG4gIHRoaXMuaW50ZXJjZXB0b3JzLnJlc3BvbnNlLmZvckVhY2goZnVuY3Rpb24gcHVzaFJlc3BvbnNlSW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgY2hhaW4ucHVzaChpbnRlcmNlcHRvci5mdWxmaWxsZWQsIGludGVyY2VwdG9yLnJlamVjdGVkKTtcbiAgfSk7XG5cbiAgd2hpbGUgKGNoYWluLmxlbmd0aCkge1xuICAgIHByb21pc2UgPSBwcm9taXNlLnRoZW4oY2hhaW4uc2hpZnQoKSwgY2hhaW4uc2hpZnQoKSk7XG4gIH1cblxuICByZXR1cm4gcHJvbWlzZTtcbn07XG5cbkF4aW9zLnByb3RvdHlwZS5nZXRVcmkgPSBmdW5jdGlvbiBnZXRVcmkoY29uZmlnKSB7XG4gIGNvbmZpZyA9IG1lcmdlQ29uZmlnKHRoaXMuZGVmYXVsdHMsIGNvbmZpZyk7XG4gIHJldHVybiBidWlsZFVSTChjb25maWcudXJsLCBjb25maWcucGFyYW1zLCBjb25maWcucGFyYW1zU2VyaWFsaXplcikucmVwbGFjZSgvXlxcPy8sICcnKTtcbn07XG5cbi8vIFByb3ZpZGUgYWxpYXNlcyBmb3Igc3VwcG9ydGVkIHJlcXVlc3QgbWV0aG9kc1xudXRpbHMuZm9yRWFjaChbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCcsICdvcHRpb25zJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2ROb0RhdGEobWV0aG9kKSB7XG4gIC8qZXNsaW50IGZ1bmMtbmFtZXM6MCovXG4gIEF4aW9zLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24odXJsLCBjb25maWcpIHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KG1lcmdlQ29uZmlnKGNvbmZpZyB8fCB7fSwge1xuICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICB1cmw6IHVybCxcbiAgICAgIGRhdGE6IChjb25maWcgfHwge30pLmRhdGFcbiAgICB9KSk7XG4gIH07XG59KTtcblxudXRpbHMuZm9yRWFjaChbJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2RXaXRoRGF0YShtZXRob2QpIHtcbiAgLyplc2xpbnQgZnVuYy1uYW1lczowKi9cbiAgQXhpb3MucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih1cmwsIGRhdGEsIGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QobWVyZ2VDb25maWcoY29uZmlnIHx8IHt9LCB7XG4gICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgIHVybDogdXJsLFxuICAgICAgZGF0YTogZGF0YVxuICAgIH0pKTtcbiAgfTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEF4aW9zO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbmZ1bmN0aW9uIEludGVyY2VwdG9yTWFuYWdlcigpIHtcbiAgdGhpcy5oYW5kbGVycyA9IFtdO1xufVxuXG4vKipcbiAqIEFkZCBhIG5ldyBpbnRlcmNlcHRvciB0byB0aGUgc3RhY2tcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdWxmaWxsZWQgVGhlIGZ1bmN0aW9uIHRvIGhhbmRsZSBgdGhlbmAgZm9yIGEgYFByb21pc2VgXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWplY3RlZCBUaGUgZnVuY3Rpb24gdG8gaGFuZGxlIGByZWplY3RgIGZvciBhIGBQcm9taXNlYFxuICpcbiAqIEByZXR1cm4ge051bWJlcn0gQW4gSUQgdXNlZCB0byByZW1vdmUgaW50ZXJjZXB0b3IgbGF0ZXJcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbiB1c2UoZnVsZmlsbGVkLCByZWplY3RlZCkge1xuICB0aGlzLmhhbmRsZXJzLnB1c2goe1xuICAgIGZ1bGZpbGxlZDogZnVsZmlsbGVkLFxuICAgIHJlamVjdGVkOiByZWplY3RlZFxuICB9KTtcbiAgcmV0dXJuIHRoaXMuaGFuZGxlcnMubGVuZ3RoIC0gMTtcbn07XG5cbi8qKlxuICogUmVtb3ZlIGFuIGludGVyY2VwdG9yIGZyb20gdGhlIHN0YWNrXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGlkIFRoZSBJRCB0aGF0IHdhcyByZXR1cm5lZCBieSBgdXNlYFxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLmVqZWN0ID0gZnVuY3Rpb24gZWplY3QoaWQpIHtcbiAgaWYgKHRoaXMuaGFuZGxlcnNbaWRdKSB7XG4gICAgdGhpcy5oYW5kbGVyc1tpZF0gPSBudWxsO1xuICB9XG59O1xuXG4vKipcbiAqIEl0ZXJhdGUgb3ZlciBhbGwgdGhlIHJlZ2lzdGVyZWQgaW50ZXJjZXB0b3JzXG4gKlxuICogVGhpcyBtZXRob2QgaXMgcGFydGljdWxhcmx5IHVzZWZ1bCBmb3Igc2tpcHBpbmcgb3ZlciBhbnlcbiAqIGludGVyY2VwdG9ycyB0aGF0IG1heSBoYXZlIGJlY29tZSBgbnVsbGAgY2FsbGluZyBgZWplY3RgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIGludGVyY2VwdG9yXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIGZvckVhY2goZm4pIHtcbiAgdXRpbHMuZm9yRWFjaCh0aGlzLmhhbmRsZXJzLCBmdW5jdGlvbiBmb3JFYWNoSGFuZGxlcihoKSB7XG4gICAgaWYgKGggIT09IG51bGwpIHtcbiAgICAgIGZuKGgpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyY2VwdG9yTWFuYWdlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGlzQWJzb2x1dGVVUkwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2lzQWJzb2x1dGVVUkwnKTtcbnZhciBjb21iaW5lVVJMcyA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvY29tYmluZVVSTHMnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IFVSTCBieSBjb21iaW5pbmcgdGhlIGJhc2VVUkwgd2l0aCB0aGUgcmVxdWVzdGVkVVJMLFxuICogb25seSB3aGVuIHRoZSByZXF1ZXN0ZWRVUkwgaXMgbm90IGFscmVhZHkgYW4gYWJzb2x1dGUgVVJMLlxuICogSWYgdGhlIHJlcXVlc3RVUkwgaXMgYWJzb2x1dGUsIHRoaXMgZnVuY3Rpb24gcmV0dXJucyB0aGUgcmVxdWVzdGVkVVJMIHVudG91Y2hlZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZVVSTCBUaGUgYmFzZSBVUkxcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXF1ZXN0ZWRVUkwgQWJzb2x1dGUgb3IgcmVsYXRpdmUgVVJMIHRvIGNvbWJpbmVcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21iaW5lZCBmdWxsIHBhdGhcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBidWlsZEZ1bGxQYXRoKGJhc2VVUkwsIHJlcXVlc3RlZFVSTCkge1xuICBpZiAoYmFzZVVSTCAmJiAhaXNBYnNvbHV0ZVVSTChyZXF1ZXN0ZWRVUkwpKSB7XG4gICAgcmV0dXJuIGNvbWJpbmVVUkxzKGJhc2VVUkwsIHJlcXVlc3RlZFVSTCk7XG4gIH1cbiAgcmV0dXJuIHJlcXVlc3RlZFVSTDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBlbmhhbmNlRXJyb3IgPSByZXF1aXJlKCcuL2VuaGFuY2VFcnJvcicpO1xuXG4vKipcbiAqIENyZWF0ZSBhbiBFcnJvciB3aXRoIHRoZSBzcGVjaWZpZWQgbWVzc2FnZSwgY29uZmlnLCBlcnJvciBjb2RlLCByZXF1ZXN0IGFuZCByZXNwb25zZS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSBUaGUgZXJyb3IgbWVzc2FnZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbY29kZV0gVGhlIGVycm9yIGNvZGUgKGZvciBleGFtcGxlLCAnRUNPTk5BQk9SVEVEJykuXG4gKiBAcGFyYW0ge09iamVjdH0gW3JlcXVlc3RdIFRoZSByZXF1ZXN0LlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXNwb25zZV0gVGhlIHJlc3BvbnNlLlxuICogQHJldHVybnMge0Vycm9yfSBUaGUgY3JlYXRlZCBlcnJvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGVFcnJvcihtZXNzYWdlLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKSB7XG4gIHZhciBlcnJvciA9IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgcmV0dXJuIGVuaGFuY2VFcnJvcihlcnJvciwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgdHJhbnNmb3JtRGF0YSA9IHJlcXVpcmUoJy4vdHJhbnNmb3JtRGF0YScpO1xudmFyIGlzQ2FuY2VsID0gcmVxdWlyZSgnLi4vY2FuY2VsL2lzQ2FuY2VsJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuLi9kZWZhdWx0cycpO1xuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbmZ1bmN0aW9uIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKSB7XG4gIGlmIChjb25maWcuY2FuY2VsVG9rZW4pIHtcbiAgICBjb25maWcuY2FuY2VsVG9rZW4udGhyb3dJZlJlcXVlc3RlZCgpO1xuICB9XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0IHRvIHRoZSBzZXJ2ZXIgdXNpbmcgdGhlIGNvbmZpZ3VyZWQgYWRhcHRlci5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIFRoZSBjb25maWcgdGhhdCBpcyB0byBiZSB1c2VkIGZvciB0aGUgcmVxdWVzdFxuICogQHJldHVybnMge1Byb21pc2V9IFRoZSBQcm9taXNlIHRvIGJlIGZ1bGZpbGxlZFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRpc3BhdGNoUmVxdWVzdChjb25maWcpIHtcbiAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gIC8vIEVuc3VyZSBoZWFkZXJzIGV4aXN0XG4gIGNvbmZpZy5oZWFkZXJzID0gY29uZmlnLmhlYWRlcnMgfHwge307XG5cbiAgLy8gVHJhbnNmb3JtIHJlcXVlc3QgZGF0YVxuICBjb25maWcuZGF0YSA9IHRyYW5zZm9ybURhdGEoXG4gICAgY29uZmlnLmRhdGEsXG4gICAgY29uZmlnLmhlYWRlcnMsXG4gICAgY29uZmlnLnRyYW5zZm9ybVJlcXVlc3RcbiAgKTtcblxuICAvLyBGbGF0dGVuIGhlYWRlcnNcbiAgY29uZmlnLmhlYWRlcnMgPSB1dGlscy5tZXJnZShcbiAgICBjb25maWcuaGVhZGVycy5jb21tb24gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNbY29uZmlnLm1ldGhvZF0gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNcbiAgKTtcblxuICB1dGlscy5mb3JFYWNoKFxuICAgIFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJywgJ2NvbW1vbiddLFxuICAgIGZ1bmN0aW9uIGNsZWFuSGVhZGVyQ29uZmlnKG1ldGhvZCkge1xuICAgICAgZGVsZXRlIGNvbmZpZy5oZWFkZXJzW21ldGhvZF07XG4gICAgfVxuICApO1xuXG4gIHZhciBhZGFwdGVyID0gY29uZmlnLmFkYXB0ZXIgfHwgZGVmYXVsdHMuYWRhcHRlcjtcblxuICByZXR1cm4gYWRhcHRlcihjb25maWcpLnRoZW4oZnVuY3Rpb24gb25BZGFwdGVyUmVzb2x1dGlvbihyZXNwb25zZSkge1xuICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgIC8vIFRyYW5zZm9ybSByZXNwb25zZSBkYXRhXG4gICAgcmVzcG9uc2UuZGF0YSA9IHRyYW5zZm9ybURhdGEoXG4gICAgICByZXNwb25zZS5kYXRhLFxuICAgICAgcmVzcG9uc2UuaGVhZGVycyxcbiAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICk7XG5cbiAgICByZXR1cm4gcmVzcG9uc2U7XG4gIH0sIGZ1bmN0aW9uIG9uQWRhcHRlclJlamVjdGlvbihyZWFzb24pIHtcbiAgICBpZiAoIWlzQ2FuY2VsKHJlYXNvbikpIHtcbiAgICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgICAgLy8gVHJhbnNmb3JtIHJlc3BvbnNlIGRhdGFcbiAgICAgIGlmIChyZWFzb24gJiYgcmVhc29uLnJlc3BvbnNlKSB7XG4gICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhID0gdHJhbnNmb3JtRGF0YShcbiAgICAgICAgICByZWFzb24ucmVzcG9uc2UuZGF0YSxcbiAgICAgICAgICByZWFzb24ucmVzcG9uc2UuaGVhZGVycyxcbiAgICAgICAgICBjb25maWcudHJhbnNmb3JtUmVzcG9uc2VcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QocmVhc29uKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFVwZGF0ZSBhbiBFcnJvciB3aXRoIHRoZSBzcGVjaWZpZWQgY29uZmlnLCBlcnJvciBjb2RlLCBhbmQgcmVzcG9uc2UuXG4gKlxuICogQHBhcmFtIHtFcnJvcn0gZXJyb3IgVGhlIGVycm9yIHRvIHVwZGF0ZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbY29kZV0gVGhlIGVycm9yIGNvZGUgKGZvciBleGFtcGxlLCAnRUNPTk5BQk9SVEVEJykuXG4gKiBAcGFyYW0ge09iamVjdH0gW3JlcXVlc3RdIFRoZSByZXF1ZXN0LlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXNwb25zZV0gVGhlIHJlc3BvbnNlLlxuICogQHJldHVybnMge0Vycm9yfSBUaGUgZXJyb3IuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZW5oYW5jZUVycm9yKGVycm9yLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKSB7XG4gIGVycm9yLmNvbmZpZyA9IGNvbmZpZztcbiAgaWYgKGNvZGUpIHtcbiAgICBlcnJvci5jb2RlID0gY29kZTtcbiAgfVxuXG4gIGVycm9yLnJlcXVlc3QgPSByZXF1ZXN0O1xuICBlcnJvci5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICBlcnJvci5pc0F4aW9zRXJyb3IgPSB0cnVlO1xuXG4gIGVycm9yLnRvSlNPTiA9IGZ1bmN0aW9uIHRvSlNPTigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgLy8gU3RhbmRhcmRcbiAgICAgIG1lc3NhZ2U6IHRoaXMubWVzc2FnZSxcbiAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgIC8vIE1pY3Jvc29mdFxuICAgICAgZGVzY3JpcHRpb246IHRoaXMuZGVzY3JpcHRpb24sXG4gICAgICBudW1iZXI6IHRoaXMubnVtYmVyLFxuICAgICAgLy8gTW96aWxsYVxuICAgICAgZmlsZU5hbWU6IHRoaXMuZmlsZU5hbWUsXG4gICAgICBsaW5lTnVtYmVyOiB0aGlzLmxpbmVOdW1iZXIsXG4gICAgICBjb2x1bW5OdW1iZXI6IHRoaXMuY29sdW1uTnVtYmVyLFxuICAgICAgc3RhY2s6IHRoaXMuc3RhY2ssXG4gICAgICAvLyBBeGlvc1xuICAgICAgY29uZmlnOiB0aGlzLmNvbmZpZyxcbiAgICAgIGNvZGU6IHRoaXMuY29kZVxuICAgIH07XG4gIH07XG4gIHJldHVybiBlcnJvcjtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbi8qKlxuICogQ29uZmlnLXNwZWNpZmljIG1lcmdlLWZ1bmN0aW9uIHdoaWNoIGNyZWF0ZXMgYSBuZXcgY29uZmlnLW9iamVjdFxuICogYnkgbWVyZ2luZyB0d28gY29uZmlndXJhdGlvbiBvYmplY3RzIHRvZ2V0aGVyLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcxXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnMlxuICogQHJldHVybnMge09iamVjdH0gTmV3IG9iamVjdCByZXN1bHRpbmcgZnJvbSBtZXJnaW5nIGNvbmZpZzIgdG8gY29uZmlnMVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG1lcmdlQ29uZmlnKGNvbmZpZzEsIGNvbmZpZzIpIHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gIGNvbmZpZzIgPSBjb25maWcyIHx8IHt9O1xuICB2YXIgY29uZmlnID0ge307XG5cbiAgdmFyIHZhbHVlRnJvbUNvbmZpZzJLZXlzID0gWyd1cmwnLCAnbWV0aG9kJywgJ2RhdGEnXTtcbiAgdmFyIG1lcmdlRGVlcFByb3BlcnRpZXNLZXlzID0gWydoZWFkZXJzJywgJ2F1dGgnLCAncHJveHknLCAncGFyYW1zJ107XG4gIHZhciBkZWZhdWx0VG9Db25maWcyS2V5cyA9IFtcbiAgICAnYmFzZVVSTCcsICd0cmFuc2Zvcm1SZXF1ZXN0JywgJ3RyYW5zZm9ybVJlc3BvbnNlJywgJ3BhcmFtc1NlcmlhbGl6ZXInLFxuICAgICd0aW1lb3V0JywgJ3RpbWVvdXRNZXNzYWdlJywgJ3dpdGhDcmVkZW50aWFscycsICdhZGFwdGVyJywgJ3Jlc3BvbnNlVHlwZScsICd4c3JmQ29va2llTmFtZScsXG4gICAgJ3hzcmZIZWFkZXJOYW1lJywgJ29uVXBsb2FkUHJvZ3Jlc3MnLCAnb25Eb3dubG9hZFByb2dyZXNzJywgJ2RlY29tcHJlc3MnLFxuICAgICdtYXhDb250ZW50TGVuZ3RoJywgJ21heEJvZHlMZW5ndGgnLCAnbWF4UmVkaXJlY3RzJywgJ3RyYW5zcG9ydCcsICdodHRwQWdlbnQnLFxuICAgICdodHRwc0FnZW50JywgJ2NhbmNlbFRva2VuJywgJ3NvY2tldFBhdGgnLCAncmVzcG9uc2VFbmNvZGluZydcbiAgXTtcbiAgdmFyIGRpcmVjdE1lcmdlS2V5cyA9IFsndmFsaWRhdGVTdGF0dXMnXTtcblxuICBmdW5jdGlvbiBnZXRNZXJnZWRWYWx1ZSh0YXJnZXQsIHNvdXJjZSkge1xuICAgIGlmICh1dGlscy5pc1BsYWluT2JqZWN0KHRhcmdldCkgJiYgdXRpbHMuaXNQbGFpbk9iamVjdChzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gdXRpbHMubWVyZ2UodGFyZ2V0LCBzb3VyY2UpO1xuICAgIH0gZWxzZSBpZiAodXRpbHMuaXNQbGFpbk9iamVjdChzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gdXRpbHMubWVyZ2Uoe30sIHNvdXJjZSk7XG4gICAgfSBlbHNlIGlmICh1dGlscy5pc0FycmF5KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiBzb3VyY2Uuc2xpY2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIHNvdXJjZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1lcmdlRGVlcFByb3BlcnRpZXMocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKGNvbmZpZzFbcHJvcF0sIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzFbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfVxuXG4gIHV0aWxzLmZvckVhY2godmFsdWVGcm9tQ29uZmlnMktleXMsIGZ1bmN0aW9uIHZhbHVlRnJvbUNvbmZpZzIocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMltwcm9wXSk7XG4gICAgfVxuICB9KTtcblxuICB1dGlscy5mb3JFYWNoKG1lcmdlRGVlcFByb3BlcnRpZXNLZXlzLCBtZXJnZURlZXBQcm9wZXJ0aWVzKTtcblxuICB1dGlscy5mb3JFYWNoKGRlZmF1bHRUb0NvbmZpZzJLZXlzLCBmdW5jdGlvbiBkZWZhdWx0VG9Db25maWcyKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzFbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdXRpbHMuZm9yRWFjaChkaXJlY3RNZXJnZUtleXMsIGZ1bmN0aW9uIG1lcmdlKHByb3ApIHtcbiAgICBpZiAocHJvcCBpbiBjb25maWcyKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZShjb25maWcxW3Byb3BdLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKHByb3AgaW4gY29uZmlnMSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBheGlvc0tleXMgPSB2YWx1ZUZyb21Db25maWcyS2V5c1xuICAgIC5jb25jYXQobWVyZ2VEZWVwUHJvcGVydGllc0tleXMpXG4gICAgLmNvbmNhdChkZWZhdWx0VG9Db25maWcyS2V5cylcbiAgICAuY29uY2F0KGRpcmVjdE1lcmdlS2V5cyk7XG5cbiAgdmFyIG90aGVyS2V5cyA9IE9iamVjdFxuICAgIC5rZXlzKGNvbmZpZzEpXG4gICAgLmNvbmNhdChPYmplY3Qua2V5cyhjb25maWcyKSlcbiAgICAuZmlsdGVyKGZ1bmN0aW9uIGZpbHRlckF4aW9zS2V5cyhrZXkpIHtcbiAgICAgIHJldHVybiBheGlvc0tleXMuaW5kZXhPZihrZXkpID09PSAtMTtcbiAgICB9KTtcblxuICB1dGlscy5mb3JFYWNoKG90aGVyS2V5cywgbWVyZ2VEZWVwUHJvcGVydGllcyk7XG5cbiAgcmV0dXJuIGNvbmZpZztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4vY3JlYXRlRXJyb3InKTtcblxuLyoqXG4gKiBSZXNvbHZlIG9yIHJlamVjdCBhIFByb21pc2UgYmFzZWQgb24gcmVzcG9uc2Ugc3RhdHVzLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlc29sdmUgQSBmdW5jdGlvbiB0aGF0IHJlc29sdmVzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0IEEgZnVuY3Rpb24gdGhhdCByZWplY3RzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIFRoZSByZXNwb25zZS5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCByZXNwb25zZSkge1xuICB2YXIgdmFsaWRhdGVTdGF0dXMgPSByZXNwb25zZS5jb25maWcudmFsaWRhdGVTdGF0dXM7XG4gIGlmICghcmVzcG9uc2Uuc3RhdHVzIHx8ICF2YWxpZGF0ZVN0YXR1cyB8fCB2YWxpZGF0ZVN0YXR1cyhyZXNwb25zZS5zdGF0dXMpKSB7XG4gICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gIH0gZWxzZSB7XG4gICAgcmVqZWN0KGNyZWF0ZUVycm9yKFxuICAgICAgJ1JlcXVlc3QgZmFpbGVkIHdpdGggc3RhdHVzIGNvZGUgJyArIHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgIHJlc3BvbnNlLmNvbmZpZyxcbiAgICAgIG51bGwsXG4gICAgICByZXNwb25zZS5yZXF1ZXN0LFxuICAgICAgcmVzcG9uc2VcbiAgICApKTtcbiAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG4vKipcbiAqIFRyYW5zZm9ybSB0aGUgZGF0YSBmb3IgYSByZXF1ZXN0IG9yIGEgcmVzcG9uc2VcbiAqXG4gKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IGRhdGEgVGhlIGRhdGEgdG8gYmUgdHJhbnNmb3JtZWRcbiAqIEBwYXJhbSB7QXJyYXl9IGhlYWRlcnMgVGhlIGhlYWRlcnMgZm9yIHRoZSByZXF1ZXN0IG9yIHJlc3BvbnNlXG4gKiBAcGFyYW0ge0FycmF5fEZ1bmN0aW9ufSBmbnMgQSBzaW5nbGUgZnVuY3Rpb24gb3IgQXJyYXkgb2YgZnVuY3Rpb25zXG4gKiBAcmV0dXJucyB7Kn0gVGhlIHJlc3VsdGluZyB0cmFuc2Zvcm1lZCBkYXRhXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdHJhbnNmb3JtRGF0YShkYXRhLCBoZWFkZXJzLCBmbnMpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIHV0aWxzLmZvckVhY2goZm5zLCBmdW5jdGlvbiB0cmFuc2Zvcm0oZm4pIHtcbiAgICBkYXRhID0gZm4oZGF0YSwgaGVhZGVycyk7XG4gIH0pO1xuXG4gIHJldHVybiBkYXRhO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIG5vcm1hbGl6ZUhlYWRlck5hbWUgPSByZXF1aXJlKCcuL2hlbHBlcnMvbm9ybWFsaXplSGVhZGVyTmFtZScpO1xuXG52YXIgREVGQVVMVF9DT05URU5UX1RZUEUgPSB7XG4gICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ1xufTtcblxuZnVuY3Rpb24gc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsIHZhbHVlKSB7XG4gIGlmICghdXRpbHMuaXNVbmRlZmluZWQoaGVhZGVycykgJiYgdXRpbHMuaXNVbmRlZmluZWQoaGVhZGVyc1snQ29udGVudC1UeXBlJ10pKSB7XG4gICAgaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPSB2YWx1ZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXREZWZhdWx0QWRhcHRlcigpIHtcbiAgdmFyIGFkYXB0ZXI7XG4gIGlmICh0eXBlb2YgWE1MSHR0cFJlcXVlc3QgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgLy8gRm9yIGJyb3dzZXJzIHVzZSBYSFIgYWRhcHRlclxuICAgIGFkYXB0ZXIgPSByZXF1aXJlKCcuL2FkYXB0ZXJzL3hocicpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwocHJvY2VzcykgPT09ICdbb2JqZWN0IHByb2Nlc3NdJykge1xuICAgIC8vIEZvciBub2RlIHVzZSBIVFRQIGFkYXB0ZXJcbiAgICBhZGFwdGVyID0gcmVxdWlyZSgnLi9hZGFwdGVycy9odHRwJyk7XG4gIH1cbiAgcmV0dXJuIGFkYXB0ZXI7XG59XG5cbnZhciBkZWZhdWx0cyA9IHtcbiAgYWRhcHRlcjogZ2V0RGVmYXVsdEFkYXB0ZXIoKSxcblxuICB0cmFuc2Zvcm1SZXF1ZXN0OiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVxdWVzdChkYXRhLCBoZWFkZXJzKSB7XG4gICAgbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCAnQWNjZXB0Jyk7XG4gICAgbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCAnQ29udGVudC1UeXBlJyk7XG4gICAgaWYgKHV0aWxzLmlzRm9ybURhdGEoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQXJyYXlCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQnVmZmVyKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc1N0cmVhbShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNGaWxlKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0Jsb2IoZGF0YSlcbiAgICApIHtcbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNBcnJheUJ1ZmZlclZpZXcoZGF0YSkpIHtcbiAgICAgIHJldHVybiBkYXRhLmJ1ZmZlcjtcbiAgICB9XG4gICAgaWYgKHV0aWxzLmlzVVJMU2VhcmNoUGFyYW1zKGRhdGEpKSB7XG4gICAgICBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDtjaGFyc2V0PXV0Zi04Jyk7XG4gICAgICByZXR1cm4gZGF0YS50b1N0cmluZygpO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNPYmplY3QoZGF0YSkpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04Jyk7XG4gICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xuICB9XSxcblxuICB0cmFuc2Zvcm1SZXNwb25zZTogW2Z1bmN0aW9uIHRyYW5zZm9ybVJlc3BvbnNlKGRhdGEpIHtcbiAgICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgICBpZiAodHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBkYXRhID0gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHsgLyogSWdub3JlICovIH1cbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIC8qKlxuICAgKiBBIHRpbWVvdXQgaW4gbWlsbGlzZWNvbmRzIHRvIGFib3J0IGEgcmVxdWVzdC4gSWYgc2V0IHRvIDAgKGRlZmF1bHQpIGFcbiAgICogdGltZW91dCBpcyBub3QgY3JlYXRlZC5cbiAgICovXG4gIHRpbWVvdXQ6IDAsXG5cbiAgeHNyZkNvb2tpZU5hbWU6ICdYU1JGLVRPS0VOJyxcbiAgeHNyZkhlYWRlck5hbWU6ICdYLVhTUkYtVE9LRU4nLFxuXG4gIG1heENvbnRlbnRMZW5ndGg6IC0xLFxuICBtYXhCb2R5TGVuZ3RoOiAtMSxcblxuICB2YWxpZGF0ZVN0YXR1czogZnVuY3Rpb24gdmFsaWRhdGVTdGF0dXMoc3RhdHVzKSB7XG4gICAgcmV0dXJuIHN0YXR1cyA+PSAyMDAgJiYgc3RhdHVzIDwgMzAwO1xuICB9XG59O1xuXG5kZWZhdWx0cy5oZWFkZXJzID0ge1xuICBjb21tb246IHtcbiAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24sIHRleHQvcGxhaW4sICovKidcbiAgfVxufTtcblxudXRpbHMuZm9yRWFjaChbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kTm9EYXRhKG1ldGhvZCkge1xuICBkZWZhdWx0cy5oZWFkZXJzW21ldGhvZF0gPSB7fTtcbn0pO1xuXG51dGlscy5mb3JFYWNoKFsncG9zdCcsICdwdXQnLCAncGF0Y2gnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZFdpdGhEYXRhKG1ldGhvZCkge1xuICBkZWZhdWx0cy5oZWFkZXJzW21ldGhvZF0gPSB1dGlscy5tZXJnZShERUZBVUxUX0NPTlRFTlRfVFlQRSk7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBkZWZhdWx0cztcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBiaW5kKGZuLCB0aGlzQXJnKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKCkge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBlbmNvZGUodmFsKSB7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQodmFsKS5cbiAgICByZXBsYWNlKC8lM0EvZ2ksICc6JykuXG4gICAgcmVwbGFjZSgvJTI0L2csICckJykuXG4gICAgcmVwbGFjZSgvJTJDL2dpLCAnLCcpLlxuICAgIHJlcGxhY2UoLyUyMC9nLCAnKycpLlxuICAgIHJlcGxhY2UoLyU1Qi9naSwgJ1snKS5cbiAgICByZXBsYWNlKC8lNUQvZ2ksICddJyk7XG59XG5cbi8qKlxuICogQnVpbGQgYSBVUkwgYnkgYXBwZW5kaW5nIHBhcmFtcyB0byB0aGUgZW5kXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCBUaGUgYmFzZSBvZiB0aGUgdXJsIChlLmcuLCBodHRwOi8vd3d3Lmdvb2dsZS5jb20pXG4gKiBAcGFyYW0ge29iamVjdH0gW3BhcmFtc10gVGhlIHBhcmFtcyB0byBiZSBhcHBlbmRlZFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGZvcm1hdHRlZCB1cmxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBidWlsZFVSTCh1cmwsIHBhcmFtcywgcGFyYW1zU2VyaWFsaXplcikge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgaWYgKCFwYXJhbXMpIHtcbiAgICByZXR1cm4gdXJsO1xuICB9XG5cbiAgdmFyIHNlcmlhbGl6ZWRQYXJhbXM7XG4gIGlmIChwYXJhbXNTZXJpYWxpemVyKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtc1NlcmlhbGl6ZXIocGFyYW1zKTtcbiAgfSBlbHNlIGlmICh1dGlscy5pc1VSTFNlYXJjaFBhcmFtcyhwYXJhbXMpKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtcy50b1N0cmluZygpO1xuICB9IGVsc2Uge1xuICAgIHZhciBwYXJ0cyA9IFtdO1xuXG4gICAgdXRpbHMuZm9yRWFjaChwYXJhbXMsIGZ1bmN0aW9uIHNlcmlhbGl6ZSh2YWwsIGtleSkge1xuICAgICAgaWYgKHZhbCA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh1dGlscy5pc0FycmF5KHZhbCkpIHtcbiAgICAgICAga2V5ID0ga2V5ICsgJ1tdJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbCA9IFt2YWxdO1xuICAgICAgfVxuXG4gICAgICB1dGlscy5mb3JFYWNoKHZhbCwgZnVuY3Rpb24gcGFyc2VWYWx1ZSh2KSB7XG4gICAgICAgIGlmICh1dGlscy5pc0RhdGUodikpIHtcbiAgICAgICAgICB2ID0gdi50b0lTT1N0cmluZygpO1xuICAgICAgICB9IGVsc2UgaWYgKHV0aWxzLmlzT2JqZWN0KHYpKSB7XG4gICAgICAgICAgdiA9IEpTT04uc3RyaW5naWZ5KHYpO1xuICAgICAgICB9XG4gICAgICAgIHBhcnRzLnB1c2goZW5jb2RlKGtleSkgKyAnPScgKyBlbmNvZGUodikpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFydHMuam9pbignJicpO1xuICB9XG5cbiAgaWYgKHNlcmlhbGl6ZWRQYXJhbXMpIHtcbiAgICB2YXIgaGFzaG1hcmtJbmRleCA9IHVybC5pbmRleE9mKCcjJyk7XG4gICAgaWYgKGhhc2htYXJrSW5kZXggIT09IC0xKSB7XG4gICAgICB1cmwgPSB1cmwuc2xpY2UoMCwgaGFzaG1hcmtJbmRleCk7XG4gICAgfVxuXG4gICAgdXJsICs9ICh1cmwuaW5kZXhPZignPycpID09PSAtMSA/ICc/JyA6ICcmJykgKyBzZXJpYWxpemVkUGFyYW1zO1xuICB9XG5cbiAgcmV0dXJuIHVybDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBzcGVjaWZpZWQgVVJMc1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aXZlVVJMIFRoZSByZWxhdGl2ZSBVUkxcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21iaW5lZCBVUkxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZWxhdGl2ZVVSTCkge1xuICByZXR1cm4gcmVsYXRpdmVVUkxcbiAgICA/IGJhc2VVUkwucmVwbGFjZSgvXFwvKyQvLCAnJykgKyAnLycgKyByZWxhdGl2ZVVSTC5yZXBsYWNlKC9eXFwvKy8sICcnKVxuICAgIDogYmFzZVVSTDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoXG4gIHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkgP1xuXG4gIC8vIFN0YW5kYXJkIGJyb3dzZXIgZW52cyBzdXBwb3J0IGRvY3VtZW50LmNvb2tpZVxuICAgIChmdW5jdGlvbiBzdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUobmFtZSwgdmFsdWUsIGV4cGlyZXMsIHBhdGgsIGRvbWFpbiwgc2VjdXJlKSB7XG4gICAgICAgICAgdmFyIGNvb2tpZSA9IFtdO1xuICAgICAgICAgIGNvb2tpZS5wdXNoKG5hbWUgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpKTtcblxuICAgICAgICAgIGlmICh1dGlscy5pc051bWJlcihleHBpcmVzKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ2V4cGlyZXM9JyArIG5ldyBEYXRlKGV4cGlyZXMpLnRvR01UU3RyaW5nKCkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhwYXRoKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ3BhdGg9JyArIHBhdGgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhkb21haW4pKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnZG9tYWluPScgKyBkb21haW4pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzZWN1cmUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdzZWN1cmUnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBkb2N1bWVudC5jb29raWUgPSBjb29raWUuam9pbignOyAnKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZWFkOiBmdW5jdGlvbiByZWFkKG5hbWUpIHtcbiAgICAgICAgICB2YXIgbWF0Y2ggPSBkb2N1bWVudC5jb29raWUubWF0Y2gobmV3IFJlZ0V4cCgnKF58O1xcXFxzKikoJyArIG5hbWUgKyAnKT0oW147XSopJykpO1xuICAgICAgICAgIHJldHVybiAobWF0Y2ggPyBkZWNvZGVVUklDb21wb25lbnQobWF0Y2hbM10pIDogbnVsbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUobmFtZSkge1xuICAgICAgICAgIHRoaXMud3JpdGUobmFtZSwgJycsIERhdGUubm93KCkgLSA4NjQwMDAwMCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSkoKSA6XG5cbiAgLy8gTm9uIHN0YW5kYXJkIGJyb3dzZXIgZW52ICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAgIChmdW5jdGlvbiBub25TdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUoKSB7fSxcbiAgICAgICAgcmVhZDogZnVuY3Rpb24gcmVhZCgpIHsgcmV0dXJuIG51bGw7IH0sXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge31cbiAgICAgIH07XG4gICAgfSkoKVxuKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCBVUkwgaXMgYWJzb2x1dGVcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIFRoZSBVUkwgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHNwZWNpZmllZCBVUkwgaXMgYWJzb2x1dGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQWJzb2x1dGVVUkwodXJsKSB7XG4gIC8vIEEgVVJMIGlzIGNvbnNpZGVyZWQgYWJzb2x1dGUgaWYgaXQgYmVnaW5zIHdpdGggXCI8c2NoZW1lPjovL1wiIG9yIFwiLy9cIiAocHJvdG9jb2wtcmVsYXRpdmUgVVJMKS5cbiAgLy8gUkZDIDM5ODYgZGVmaW5lcyBzY2hlbWUgbmFtZSBhcyBhIHNlcXVlbmNlIG9mIGNoYXJhY3RlcnMgYmVnaW5uaW5nIHdpdGggYSBsZXR0ZXIgYW5kIGZvbGxvd2VkXG4gIC8vIGJ5IGFueSBjb21iaW5hdGlvbiBvZiBsZXR0ZXJzLCBkaWdpdHMsIHBsdXMsIHBlcmlvZCwgb3IgaHlwaGVuLlxuICByZXR1cm4gL14oW2Etel1bYS16XFxkXFwrXFwtXFwuXSo6KT9cXC9cXC8vaS50ZXN0KHVybCk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgcGF5bG9hZCBpcyBhbiBlcnJvciB0aHJvd24gYnkgQXhpb3NcbiAqXG4gKiBAcGFyYW0geyp9IHBheWxvYWQgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBwYXlsb2FkIGlzIGFuIGVycm9yIHRocm93biBieSBBeGlvcywgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBeGlvc0Vycm9yKHBheWxvYWQpIHtcbiAgcmV0dXJuICh0eXBlb2YgcGF5bG9hZCA9PT0gJ29iamVjdCcpICYmIChwYXlsb2FkLmlzQXhpb3NFcnJvciA9PT0gdHJ1ZSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKFxuICB1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpID9cblxuICAvLyBTdGFuZGFyZCBicm93c2VyIGVudnMgaGF2ZSBmdWxsIHN1cHBvcnQgb2YgdGhlIEFQSXMgbmVlZGVkIHRvIHRlc3RcbiAgLy8gd2hldGhlciB0aGUgcmVxdWVzdCBVUkwgaXMgb2YgdGhlIHNhbWUgb3JpZ2luIGFzIGN1cnJlbnQgbG9jYXRpb24uXG4gICAgKGZ1bmN0aW9uIHN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHZhciBtc2llID0gLyhtc2llfHRyaWRlbnQpL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgICAgIHZhciB1cmxQYXJzaW5nTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgIHZhciBvcmlnaW5VUkw7XG5cbiAgICAgIC8qKlxuICAgICogUGFyc2UgYSBVUkwgdG8gZGlzY292ZXIgaXQncyBjb21wb25lbnRzXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHVybCBUaGUgVVJMIHRvIGJlIHBhcnNlZFxuICAgICogQHJldHVybnMge09iamVjdH1cbiAgICAqL1xuICAgICAgZnVuY3Rpb24gcmVzb2x2ZVVSTCh1cmwpIHtcbiAgICAgICAgdmFyIGhyZWYgPSB1cmw7XG5cbiAgICAgICAgaWYgKG1zaWUpIHtcbiAgICAgICAgLy8gSUUgbmVlZHMgYXR0cmlidXRlIHNldCB0d2ljZSB0byBub3JtYWxpemUgcHJvcGVydGllc1xuICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnNldEF0dHJpYnV0ZSgnaHJlZicsIGhyZWYpO1xuICAgICAgICAgIGhyZWYgPSB1cmxQYXJzaW5nTm9kZS5ocmVmO1xuICAgICAgICB9XG5cbiAgICAgICAgdXJsUGFyc2luZ05vZGUuc2V0QXR0cmlidXRlKCdocmVmJywgaHJlZik7XG5cbiAgICAgICAgLy8gdXJsUGFyc2luZ05vZGUgcHJvdmlkZXMgdGhlIFVybFV0aWxzIGludGVyZmFjZSAtIGh0dHA6Ly91cmwuc3BlYy53aGF0d2cub3JnLyN1cmx1dGlsc1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGhyZWY6IHVybFBhcnNpbmdOb2RlLmhyZWYsXG4gICAgICAgICAgcHJvdG9jb2w6IHVybFBhcnNpbmdOb2RlLnByb3RvY29sID8gdXJsUGFyc2luZ05vZGUucHJvdG9jb2wucmVwbGFjZSgvOiQvLCAnJykgOiAnJyxcbiAgICAgICAgICBob3N0OiB1cmxQYXJzaW5nTm9kZS5ob3N0LFxuICAgICAgICAgIHNlYXJjaDogdXJsUGFyc2luZ05vZGUuc2VhcmNoID8gdXJsUGFyc2luZ05vZGUuc2VhcmNoLnJlcGxhY2UoL15cXD8vLCAnJykgOiAnJyxcbiAgICAgICAgICBoYXNoOiB1cmxQYXJzaW5nTm9kZS5oYXNoID8gdXJsUGFyc2luZ05vZGUuaGFzaC5yZXBsYWNlKC9eIy8sICcnKSA6ICcnLFxuICAgICAgICAgIGhvc3RuYW1lOiB1cmxQYXJzaW5nTm9kZS5ob3N0bmFtZSxcbiAgICAgICAgICBwb3J0OiB1cmxQYXJzaW5nTm9kZS5wb3J0LFxuICAgICAgICAgIHBhdGhuYW1lOiAodXJsUGFyc2luZ05vZGUucGF0aG5hbWUuY2hhckF0KDApID09PSAnLycpID9cbiAgICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lIDpcbiAgICAgICAgICAgICcvJyArIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIG9yaWdpblVSTCA9IHJlc29sdmVVUkwod2luZG93LmxvY2F0aW9uLmhyZWYpO1xuXG4gICAgICAvKipcbiAgICAqIERldGVybWluZSBpZiBhIFVSTCBzaGFyZXMgdGhlIHNhbWUgb3JpZ2luIGFzIHRoZSBjdXJyZW50IGxvY2F0aW9uXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHJlcXVlc3RVUkwgVGhlIFVSTCB0byB0ZXN0XG4gICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiBVUkwgc2hhcmVzIHRoZSBzYW1lIG9yaWdpbiwgb3RoZXJ3aXNlIGZhbHNlXG4gICAgKi9cbiAgICAgIHJldHVybiBmdW5jdGlvbiBpc1VSTFNhbWVPcmlnaW4ocmVxdWVzdFVSTCkge1xuICAgICAgICB2YXIgcGFyc2VkID0gKHV0aWxzLmlzU3RyaW5nKHJlcXVlc3RVUkwpKSA/IHJlc29sdmVVUkwocmVxdWVzdFVSTCkgOiByZXF1ZXN0VVJMO1xuICAgICAgICByZXR1cm4gKHBhcnNlZC5wcm90b2NvbCA9PT0gb3JpZ2luVVJMLnByb3RvY29sICYmXG4gICAgICAgICAgICBwYXJzZWQuaG9zdCA9PT0gb3JpZ2luVVJMLmhvc3QpO1xuICAgICAgfTtcbiAgICB9KSgpIDpcblxuICAvLyBOb24gc3RhbmRhcmQgYnJvd3NlciBlbnZzICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAgIChmdW5jdGlvbiBub25TdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gaXNVUkxTYW1lT3JpZ2luKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH07XG4gICAgfSkoKVxuKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsIG5vcm1hbGl6ZWROYW1lKSB7XG4gIHV0aWxzLmZvckVhY2goaGVhZGVycywgZnVuY3Rpb24gcHJvY2Vzc0hlYWRlcih2YWx1ZSwgbmFtZSkge1xuICAgIGlmIChuYW1lICE9PSBub3JtYWxpemVkTmFtZSAmJiBuYW1lLnRvVXBwZXJDYXNlKCkgPT09IG5vcm1hbGl6ZWROYW1lLnRvVXBwZXJDYXNlKCkpIHtcbiAgICAgIGhlYWRlcnNbbm9ybWFsaXplZE5hbWVdID0gdmFsdWU7XG4gICAgICBkZWxldGUgaGVhZGVyc1tuYW1lXTtcbiAgICB9XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG4vLyBIZWFkZXJzIHdob3NlIGR1cGxpY2F0ZXMgYXJlIGlnbm9yZWQgYnkgbm9kZVxuLy8gYy5mLiBodHRwczovL25vZGVqcy5vcmcvYXBpL2h0dHAuaHRtbCNodHRwX21lc3NhZ2VfaGVhZGVyc1xudmFyIGlnbm9yZUR1cGxpY2F0ZU9mID0gW1xuICAnYWdlJywgJ2F1dGhvcml6YXRpb24nLCAnY29udGVudC1sZW5ndGgnLCAnY29udGVudC10eXBlJywgJ2V0YWcnLFxuICAnZXhwaXJlcycsICdmcm9tJywgJ2hvc3QnLCAnaWYtbW9kaWZpZWQtc2luY2UnLCAnaWYtdW5tb2RpZmllZC1zaW5jZScsXG4gICdsYXN0LW1vZGlmaWVkJywgJ2xvY2F0aW9uJywgJ21heC1mb3J3YXJkcycsICdwcm94eS1hdXRob3JpemF0aW9uJyxcbiAgJ3JlZmVyZXInLCAncmV0cnktYWZ0ZXInLCAndXNlci1hZ2VudCdcbl07XG5cbi8qKlxuICogUGFyc2UgaGVhZGVycyBpbnRvIGFuIG9iamVjdFxuICpcbiAqIGBgYFxuICogRGF0ZTogV2VkLCAyNyBBdWcgMjAxNCAwODo1ODo0OSBHTVRcbiAqIENvbnRlbnQtVHlwZTogYXBwbGljYXRpb24vanNvblxuICogQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVxuICogVHJhbnNmZXItRW5jb2Rpbmc6IGNodW5rZWRcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBoZWFkZXJzIEhlYWRlcnMgbmVlZGluZyB0byBiZSBwYXJzZWRcbiAqIEByZXR1cm5zIHtPYmplY3R9IEhlYWRlcnMgcGFyc2VkIGludG8gYW4gb2JqZWN0XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcGFyc2VIZWFkZXJzKGhlYWRlcnMpIHtcbiAgdmFyIHBhcnNlZCA9IHt9O1xuICB2YXIga2V5O1xuICB2YXIgdmFsO1xuICB2YXIgaTtcblxuICBpZiAoIWhlYWRlcnMpIHsgcmV0dXJuIHBhcnNlZDsgfVxuXG4gIHV0aWxzLmZvckVhY2goaGVhZGVycy5zcGxpdCgnXFxuJyksIGZ1bmN0aW9uIHBhcnNlcihsaW5lKSB7XG4gICAgaSA9IGxpbmUuaW5kZXhPZignOicpO1xuICAgIGtleSA9IHV0aWxzLnRyaW0obGluZS5zdWJzdHIoMCwgaSkpLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFsID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cihpICsgMSkpO1xuXG4gICAgaWYgKGtleSkge1xuICAgICAgaWYgKHBhcnNlZFtrZXldICYmIGlnbm9yZUR1cGxpY2F0ZU9mLmluZGV4T2Yoa2V5KSA+PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChrZXkgPT09ICdzZXQtY29va2llJykge1xuICAgICAgICBwYXJzZWRba2V5XSA9IChwYXJzZWRba2V5XSA/IHBhcnNlZFtrZXldIDogW10pLmNvbmNhdChbdmFsXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYXJzZWRba2V5XSA9IHBhcnNlZFtrZXldID8gcGFyc2VkW2tleV0gKyAnLCAnICsgdmFsIDogdmFsO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHBhcnNlZDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogU3ludGFjdGljIHN1Z2FyIGZvciBpbnZva2luZyBhIGZ1bmN0aW9uIGFuZCBleHBhbmRpbmcgYW4gYXJyYXkgZm9yIGFyZ3VtZW50cy5cbiAqXG4gKiBDb21tb24gdXNlIGNhc2Ugd291bGQgYmUgdG8gdXNlIGBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHlgLlxuICpcbiAqICBgYGBqc1xuICogIGZ1bmN0aW9uIGYoeCwgeSwgeikge31cbiAqICB2YXIgYXJncyA9IFsxLCAyLCAzXTtcbiAqICBmLmFwcGx5KG51bGwsIGFyZ3MpO1xuICogIGBgYFxuICpcbiAqIFdpdGggYHNwcmVhZGAgdGhpcyBleGFtcGxlIGNhbiBiZSByZS13cml0dGVuLlxuICpcbiAqICBgYGBqc1xuICogIHNwcmVhZChmdW5jdGlvbih4LCB5LCB6KSB7fSkoWzEsIDIsIDNdKTtcbiAqICBgYGBcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHJldHVybnMge0Z1bmN0aW9ufVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNwcmVhZChjYWxsYmFjaykge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcChhcnIpIHtcbiAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkobnVsbCwgYXJyKTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBiaW5kID0gcmVxdWlyZSgnLi9oZWxwZXJzL2JpbmQnKTtcblxuLypnbG9iYWwgdG9TdHJpbmc6dHJ1ZSovXG5cbi8vIHV0aWxzIGlzIGEgbGlicmFyeSBvZiBnZW5lcmljIGhlbHBlciBmdW5jdGlvbnMgbm9uLXNwZWNpZmljIHRvIGF4aW9zXG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXkodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgdW5kZWZpbmVkXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHZhbHVlIGlzIHVuZGVmaW5lZCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3VuZGVmaW5lZCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQnVmZmVyKHZhbCkge1xuICByZXR1cm4gdmFsICE9PSBudWxsICYmICFpc1VuZGVmaW5lZCh2YWwpICYmIHZhbC5jb25zdHJ1Y3RvciAhPT0gbnVsbCAmJiAhaXNVbmRlZmluZWQodmFsLmNvbnN0cnVjdG9yKVxuICAgICYmIHR5cGVvZiB2YWwuY29uc3RydWN0b3IuaXNCdWZmZXIgPT09ICdmdW5jdGlvbicgJiYgdmFsLmNvbnN0cnVjdG9yLmlzQnVmZmVyKHZhbCk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXIodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5QnVmZmVyXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGb3JtRGF0YVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEZvcm1EYXRhLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGb3JtRGF0YSh2YWwpIHtcbiAgcmV0dXJuICh0eXBlb2YgRm9ybURhdGEgIT09ICd1bmRlZmluZWQnKSAmJiAodmFsIGluc3RhbmNlb2YgRm9ybURhdGEpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXJWaWV3KHZhbCkge1xuICB2YXIgcmVzdWx0O1xuICBpZiAoKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcpICYmIChBcnJheUJ1ZmZlci5pc1ZpZXcpKSB7XG4gICAgcmVzdWx0ID0gQXJyYXlCdWZmZXIuaXNWaWV3KHZhbCk7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ID0gKHZhbCkgJiYgKHZhbC5idWZmZXIpICYmICh2YWwuYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBTdHJpbmdcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFN0cmluZywgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyaW5nKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3N0cmluZyc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBOdW1iZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIE51bWJlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzTnVtYmVyKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ251bWJlcic7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gT2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBwbGFpbiBPYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgcGxhaW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWwpIHtcbiAgaWYgKHRvU3RyaW5nLmNhbGwodmFsKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgcHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbCk7XG4gIHJldHVybiBwcm90b3R5cGUgPT09IG51bGwgfHwgcHJvdG90eXBlID09PSBPYmplY3QucHJvdG90eXBlO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRGF0ZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRGF0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRGF0ZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRmlsZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRmlsZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRmlsZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRmlsZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgQmxvYlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgQmxvYiwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQmxvYih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQmxvYl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEZ1bmN0aW9uLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFN0cmVhbVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgU3RyZWFtLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTdHJlYW0odmFsKSB7XG4gIHJldHVybiBpc09iamVjdCh2YWwpICYmIGlzRnVuY3Rpb24odmFsLnBpcGUpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVVJMU2VhcmNoUGFyYW1zKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIFVSTFNlYXJjaFBhcmFtcyAhPT0gJ3VuZGVmaW5lZCcgJiYgdmFsIGluc3RhbmNlb2YgVVJMU2VhcmNoUGFyYW1zO1xufVxuXG4vKipcbiAqIFRyaW0gZXhjZXNzIHdoaXRlc3BhY2Ugb2ZmIHRoZSBiZWdpbm5pbmcgYW5kIGVuZCBvZiBhIHN0cmluZ1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgVGhlIFN0cmluZyB0byB0cmltXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgU3RyaW5nIGZyZWVkIG9mIGV4Y2VzcyB3aGl0ZXNwYWNlXG4gKi9cbmZ1bmN0aW9uIHRyaW0oc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyovLCAnJykucmVwbGFjZSgvXFxzKiQvLCAnJyk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIHdlJ3JlIHJ1bm5pbmcgaW4gYSBzdGFuZGFyZCBicm93c2VyIGVudmlyb25tZW50XG4gKlxuICogVGhpcyBhbGxvd3MgYXhpb3MgdG8gcnVuIGluIGEgd2ViIHdvcmtlciwgYW5kIHJlYWN0LW5hdGl2ZS5cbiAqIEJvdGggZW52aXJvbm1lbnRzIHN1cHBvcnQgWE1MSHR0cFJlcXVlc3QsIGJ1dCBub3QgZnVsbHkgc3RhbmRhcmQgZ2xvYmFscy5cbiAqXG4gKiB3ZWIgd29ya2VyczpcbiAqICB0eXBlb2Ygd2luZG93IC0+IHVuZGVmaW5lZFxuICogIHR5cGVvZiBkb2N1bWVudCAtPiB1bmRlZmluZWRcbiAqXG4gKiByZWFjdC1uYXRpdmU6XG4gKiAgbmF2aWdhdG9yLnByb2R1Y3QgLT4gJ1JlYWN0TmF0aXZlJ1xuICogbmF0aXZlc2NyaXB0XG4gKiAgbmF2aWdhdG9yLnByb2R1Y3QgLT4gJ05hdGl2ZVNjcmlwdCcgb3IgJ05TJ1xuICovXG5mdW5jdGlvbiBpc1N0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnICYmIChuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ1JlYWN0TmF0aXZlJyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRvci5wcm9kdWN0ID09PSAnTmF0aXZlU2NyaXB0JyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRvci5wcm9kdWN0ID09PSAnTlMnKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gKFxuICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmXG4gICAgdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJ1xuICApO1xufVxuXG4vKipcbiAqIEl0ZXJhdGUgb3ZlciBhbiBBcnJheSBvciBhbiBPYmplY3QgaW52b2tpbmcgYSBmdW5jdGlvbiBmb3IgZWFjaCBpdGVtLlxuICpcbiAqIElmIGBvYmpgIGlzIGFuIEFycmF5IGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIHBhc3NpbmdcbiAqIHRoZSB2YWx1ZSwgaW5kZXgsIGFuZCBjb21wbGV0ZSBhcnJheSBmb3IgZWFjaCBpdGVtLlxuICpcbiAqIElmICdvYmonIGlzIGFuIE9iamVjdCBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBwYXNzaW5nXG4gKiB0aGUgdmFsdWUsIGtleSwgYW5kIGNvbXBsZXRlIG9iamVjdCBmb3IgZWFjaCBwcm9wZXJ0eS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdHxBcnJheX0gb2JqIFRoZSBvYmplY3QgdG8gaXRlcmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGNhbGxiYWNrIHRvIGludm9rZSBmb3IgZWFjaCBpdGVtXG4gKi9cbmZ1bmN0aW9uIGZvckVhY2gob2JqLCBmbikge1xuICAvLyBEb24ndCBib3RoZXIgaWYgbm8gdmFsdWUgcHJvdmlkZWRcbiAgaWYgKG9iaiA9PT0gbnVsbCB8fCB0eXBlb2Ygb2JqID09PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIEZvcmNlIGFuIGFycmF5IGlmIG5vdCBhbHJlYWR5IHNvbWV0aGluZyBpdGVyYWJsZVxuICBpZiAodHlwZW9mIG9iaiAhPT0gJ29iamVjdCcpIHtcbiAgICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgICBvYmogPSBbb2JqXTtcbiAgfVxuXG4gIGlmIChpc0FycmF5KG9iaikpIHtcbiAgICAvLyBJdGVyYXRlIG92ZXIgYXJyYXkgdmFsdWVzXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBvYmoubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBmbi5jYWxsKG51bGwsIG9ialtpXSwgaSwgb2JqKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIG9iamVjdCBrZXlzXG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIHtcbiAgICAgICAgZm4uY2FsbChudWxsLCBvYmpba2V5XSwga2V5LCBvYmopO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEFjY2VwdHMgdmFyYXJncyBleHBlY3RpbmcgZWFjaCBhcmd1bWVudCB0byBiZSBhbiBvYmplY3QsIHRoZW5cbiAqIGltbXV0YWJseSBtZXJnZXMgdGhlIHByb3BlcnRpZXMgb2YgZWFjaCBvYmplY3QgYW5kIHJldHVybnMgcmVzdWx0LlxuICpcbiAqIFdoZW4gbXVsdGlwbGUgb2JqZWN0cyBjb250YWluIHRoZSBzYW1lIGtleSB0aGUgbGF0ZXIgb2JqZWN0IGluXG4gKiB0aGUgYXJndW1lbnRzIGxpc3Qgd2lsbCB0YWtlIHByZWNlZGVuY2UuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiBgYGBqc1xuICogdmFyIHJlc3VsdCA9IG1lcmdlKHtmb286IDEyM30sIHtmb286IDQ1Nn0pO1xuICogY29uc29sZS5sb2cocmVzdWx0LmZvbyk7IC8vIG91dHB1dHMgNDU2XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqMSBPYmplY3QgdG8gbWVyZ2VcbiAqIEByZXR1cm5zIHtPYmplY3R9IFJlc3VsdCBvZiBhbGwgbWVyZ2UgcHJvcGVydGllc1xuICovXG5mdW5jdGlvbiBtZXJnZSgvKiBvYmoxLCBvYmoyLCBvYmozLCAuLi4gKi8pIHtcbiAgdmFyIHJlc3VsdCA9IHt9O1xuICBmdW5jdGlvbiBhc3NpZ25WYWx1ZSh2YWwsIGtleSkge1xuICAgIGlmIChpc1BsYWluT2JqZWN0KHJlc3VsdFtrZXldKSAmJiBpc1BsYWluT2JqZWN0KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gbWVyZ2UocmVzdWx0W2tleV0sIHZhbCk7XG4gICAgfSBlbHNlIGlmIChpc1BsYWluT2JqZWN0KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gbWVyZ2Uoe30sIHZhbCk7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gdmFsLnNsaWNlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdFtrZXldID0gdmFsO1xuICAgIH1cbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwLCBsID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIGZvckVhY2goYXJndW1lbnRzW2ldLCBhc3NpZ25WYWx1ZSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBFeHRlbmRzIG9iamVjdCBhIGJ5IG11dGFibHkgYWRkaW5nIHRvIGl0IHRoZSBwcm9wZXJ0aWVzIG9mIG9iamVjdCBiLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhIFRoZSBvYmplY3QgdG8gYmUgZXh0ZW5kZWRcbiAqIEBwYXJhbSB7T2JqZWN0fSBiIFRoZSBvYmplY3QgdG8gY29weSBwcm9wZXJ0aWVzIGZyb21cbiAqIEBwYXJhbSB7T2JqZWN0fSB0aGlzQXJnIFRoZSBvYmplY3QgdG8gYmluZCBmdW5jdGlvbiB0b1xuICogQHJldHVybiB7T2JqZWN0fSBUaGUgcmVzdWx0aW5nIHZhbHVlIG9mIG9iamVjdCBhXG4gKi9cbmZ1bmN0aW9uIGV4dGVuZChhLCBiLCB0aGlzQXJnKSB7XG4gIGZvckVhY2goYiwgZnVuY3Rpb24gYXNzaWduVmFsdWUodmFsLCBrZXkpIHtcbiAgICBpZiAodGhpc0FyZyAmJiB0eXBlb2YgdmFsID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBhW2tleV0gPSBiaW5kKHZhbCwgdGhpc0FyZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFba2V5XSA9IHZhbDtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gYTtcbn1cblxuLyoqXG4gKiBSZW1vdmUgYnl0ZSBvcmRlciBtYXJrZXIuIFRoaXMgY2F0Y2hlcyBFRiBCQiBCRiAodGhlIFVURi04IEJPTSlcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gY29udGVudCB3aXRoIEJPTVxuICogQHJldHVybiB7c3RyaW5nfSBjb250ZW50IHZhbHVlIHdpdGhvdXQgQk9NXG4gKi9cbmZ1bmN0aW9uIHN0cmlwQk9NKGNvbnRlbnQpIHtcbiAgaWYgKGNvbnRlbnQuY2hhckNvZGVBdCgwKSA9PT0gMHhGRUZGKSB7XG4gICAgY29udGVudCA9IGNvbnRlbnQuc2xpY2UoMSk7XG4gIH1cbiAgcmV0dXJuIGNvbnRlbnQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpc0FycmF5OiBpc0FycmF5LFxuICBpc0FycmF5QnVmZmVyOiBpc0FycmF5QnVmZmVyLFxuICBpc0J1ZmZlcjogaXNCdWZmZXIsXG4gIGlzRm9ybURhdGE6IGlzRm9ybURhdGEsXG4gIGlzQXJyYXlCdWZmZXJWaWV3OiBpc0FycmF5QnVmZmVyVmlldyxcbiAgaXNTdHJpbmc6IGlzU3RyaW5nLFxuICBpc051bWJlcjogaXNOdW1iZXIsXG4gIGlzT2JqZWN0OiBpc09iamVjdCxcbiAgaXNQbGFpbk9iamVjdDogaXNQbGFpbk9iamVjdCxcbiAgaXNVbmRlZmluZWQ6IGlzVW5kZWZpbmVkLFxuICBpc0RhdGU6IGlzRGF0ZSxcbiAgaXNGaWxlOiBpc0ZpbGUsXG4gIGlzQmxvYjogaXNCbG9iLFxuICBpc0Z1bmN0aW9uOiBpc0Z1bmN0aW9uLFxuICBpc1N0cmVhbTogaXNTdHJlYW0sXG4gIGlzVVJMU2VhcmNoUGFyYW1zOiBpc1VSTFNlYXJjaFBhcmFtcyxcbiAgaXNTdGFuZGFyZEJyb3dzZXJFbnY6IGlzU3RhbmRhcmRCcm93c2VyRW52LFxuICBmb3JFYWNoOiBmb3JFYWNoLFxuICBtZXJnZTogbWVyZ2UsXG4gIGV4dGVuZDogZXh0ZW5kLFxuICB0cmltOiB0cmltLFxuICBzdHJpcEJPTTogc3RyaXBCT01cbn07XG4iLCIvLyBJbXBvcnRzXG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyBmcm9tIFwiLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2Nzc1dpdGhNYXBwaW5nVG9TdHJpbmcuanNcIjtcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18gZnJvbSBcIi4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanNcIjtcbmltcG9ydCBfX19DU1NfTE9BREVSX0dFVF9VUkxfSU1QT1JUX19fIGZyb20gXCIuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvZ2V0VXJsLmpzXCI7XG5pbXBvcnQgX19fQ1NTX0xPQURFUl9VUkxfSU1QT1JUXzBfX18gZnJvbSBcIi4uLy4uL2FwcC9zdGF0aWMvaW1nL1NWRy9hcnJvdy1kb3duMi5zdmdcIjtcbnZhciBfX19DU1NfTE9BREVSX0VYUE9SVF9fXyA9IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyhfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fKTtcbnZhciBfX19DU1NfTE9BREVSX1VSTF9SRVBMQUNFTUVOVF8wX19fID0gX19fQ1NTX0xPQURFUl9HRVRfVVJMX0lNUE9SVF9fXyhfX19DU1NfTE9BREVSX1VSTF9JTVBPUlRfMF9fXyk7XG4vLyBNb2R1bGVcbl9fX0NTU19MT0FERVJfRVhQT1JUX19fLnB1c2goW21vZHVsZS5pZCwgXCIqLFxcbio6OmFmdGVyLFxcbio6OmJlZm9yZSB7XFxuICBtYXJnaW46IDA7XFxuICBwYWRkaW5nOiAwO1xcbiAgYm94LXNpemluZzogaW5oZXJpdDsgfVxcblxcbmh0bWwge1xcbiAgZm9udC1zaXplOiA2Mi41JTsgfVxcblxcbmJvZHkge1xcbiAgYm94LXNpemluZzogYm9yZGVyLWJveDtcXG4gIGZvbnQtc2l6ZTogMS42cmVtO1xcbiAgYmFja2dyb3VuZC1zaXplOiBjb3ZlcjtcXG4gIGJhY2tncm91bmQtcmVwZWF0OiBuby1yZXBlYXQ7XFxuICBoZWlnaHQ6IDEyNy41cmVtO1xcbiAgZm9udC1mYW1pbHk6ICdMYXRvJywgc2Fucy1zZXJpZjsgfVxcblxcbltoaWRkZW5dIHtcXG4gIGRpc3BsYXk6IG5vbmUgIWltcG9ydGFudDsgfVxcblxcbi5oZWFkaW5nLXRlcnRpYXJ5IHtcXG4gIGZvbnQtc2l6ZTogMi40cmVtO1xcbiAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTsgfVxcbiAgLmhlYWRpbmctdGVydGlhcnktLXdoaXRlIHtcXG4gICAgY29sb3I6ICNmZmY7IH1cXG5cXG4uaGVhZGluZy1wcmltYXJ5IHtcXG4gIGZvbnQtc2l6ZTogM3JlbTtcXG4gIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICBmb250LXdlaWdodDogMzAwO1xcbiAgY29sb3I6ICNmZmY7IH1cXG5cXG4ubWItMTAge1xcbiAgbWFyZ2luLWJvdHRvbTogMXJlbTsgfVxcblxcbi5tYi0yMCB7XFxuICBtYXJnaW4tYm90dG9tOiAycmVtOyB9XFxuXFxuLm10LTUwIHtcXG4gIG1hcmdpbi10b3A6IDVyZW07IH1cXG5cXG4uYnRuLCAuYnRuOmxpbmssIC5idG46dmlzaXRlZCB7XFxuICBwYWRkaW5nOiAuNzVyZW0gMnJlbTtcXG4gIGJvcmRlci1yYWRpdXM6IC41cmVtO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2YyZjJmMjtcXG4gIGZvbnQtd2VpZ2h0OiA0MDA7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7IH1cXG5cXG4uYnRuOmFjdGl2ZSwgLmJ0bjpmb2N1cyB7XFxuICBvdXRsaW5lOiBub25lO1xcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC0xcHgpO1xcbiAgYm94LXNoYWRvdzogMCAwLjVyZW0gMXJlbSByZ2JhKDAsIDAsIDAsIDAuMik7IH1cXG5cXG4ubG9naW4sXFxuLnJlZ2lzdGVyIHtcXG4gIG1pbi1oZWlnaHQ6IGNhbGMoMTAwdmggLSA2LjFyZW0pO1xcbiAgd2lkdGg6IDEwMHZ3O1xcbiAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KHRvIHRvcCwgIzVmNGY2NiwgIzM0MjMzMik7XFxuICBiYWNrZ3JvdW5kLXJlcGVhdDogbm8tcmVwZWF0O1xcbiAgYmFja2dyb3VuZC1zaXplOiBjb3ZlcjtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cXG4gIC5sb2dpbi1pbWcsXFxuICAucmVnaXN0ZXItaW1nIHtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICBib3JkZXItcmFkaXVzOiAxMDAlO1xcbiAgICBoZWlnaHQ6IDguNXJlbTtcXG4gICAgd2lkdGg6IDguNXJlbTtcXG4gICAgdG9wOiAtMTUlOyB9XFxuICAubG9naW5fX2Zvcm0sXFxuICAucmVnaXN0ZXJfX2Zvcm0ge1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICMxZTJhMzg7XFxuICAgIGJvcmRlcjogMnB4IHNvbGlkICMxZTJhMzg7XFxuICAgIGJveC1zaGFkb3c6IDBweCAycHggNXB4IHJnYmEoMCwgMCwgMCwgMC4yNSk7XFxuICAgIG1heC13aWR0aDogMzJyZW07XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZmxvdzogY29sdW1uIG5vd3JhcDtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgcGFkZGluZzogNHJlbSAwIDIuNnJlbSAwO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTI1JSk7IH1cXG4gIC5sb2dpbl9fZm9ybS1pbnN0cnVjdGlvbnMsXFxuICAucmVnaXN0ZXJfX2Zvcm0taW5zdHJ1Y3Rpb25zIHtcXG4gICAgY29sb3I6ICNmZmY7XFxuICAgIGZvbnQtc2l6ZTogMS40cmVtO1xcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICAgIG1hcmdpbi1ib3R0b206IDFyZW07XFxuICAgIHdpZHRoOiA5MCU7IH1cXG4gIC5sb2dpbl9fZm9ybS1ncm91cCxcXG4gIC5yZWdpc3Rlcl9fZm9ybS1ncm91cCB7XFxuICAgIHdpZHRoOiA5MCU7IH1cXG4gIC5sb2dpbl9fZm9ybS1pbnB1dCxcXG4gIC5yZWdpc3Rlcl9fZm9ybS1pbnB1dCB7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBtYXJnaW46IDAgYXV0bztcXG4gICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjIpO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuMSk7XFxuICAgIGJveC1zaGFkb3c6IHJnYmEoMCwgMCwgMCwgMC41KTtcXG4gICAgYm9yZGVyLXJhZGl1czogMnB4O1xcbiAgICBtYXJnaW4tYm90dG9tOiAxcmVtO1xcbiAgICBsaW5lLWhlaWdodDogMS4yNTtcXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgICBoZWlnaHQ6IDQuMnJlbTtcXG4gICAgcGFkZGluZzogMXJlbSAxLjRyZW07XFxuICAgIGNhcmV0LWNvbG9yOiAjZmZmO1xcbiAgICBjb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjc1KTsgfVxcbiAgICAubG9naW5fX2Zvcm0taW5wdXQ6OnBsYWNlaG9sZGVyLFxcbiAgICAucmVnaXN0ZXJfX2Zvcm0taW5wdXQ6OnBsYWNlaG9sZGVyIHtcXG4gICAgICBmb250LXdlaWdodDogMzAwO1xcbiAgICAgIGNvbG9yOiAjZTZlNmU2O1xcbiAgICAgIGZvbnQtc2l6ZTogMS44cmVtOyB9XFxuICAgIC5sb2dpbl9fZm9ybS1pbnB1dDpmb2N1cyxcXG4gICAgLnJlZ2lzdGVyX19mb3JtLWlucHV0OmZvY3VzIHtcXG4gICAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNzUpOyB9XFxuICAubG9naW5fX2Zvcm0tYnRuLFxcbiAgLnJlZ2lzdGVyX19mb3JtLWJ0biB7XFxuICAgIHdpZHRoOiA5MCU7XFxuICAgIGJvcmRlci1yYWRpdXM6IDJweDtcXG4gICAgcGFkZGluZzogMCAxLjRyZW07XFxuICAgIG1hcmdpbjogMXJlbSBhdXRvIDAgYXV0bztcXG4gICAgYm94LXNoYWRvdzogMCAycHggNXB4IHJnYmEoMCwgMCwgMCwgMC4yNSk7XFxuICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1hcm91bmQ7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIGhlaWdodDogNC4ycmVtOyB9XFxuICAgIC5sb2dpbl9fZm9ybS1idG4tLWxvZ2luLFxcbiAgICAucmVnaXN0ZXJfX2Zvcm0tYnRuLS1sb2dpbiB7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjg3KTtcXG4gICAgICBjb2xvcjogIzE2MTYxZDtcXG4gICAgICBib3JkZXI6IDFweCBzb2xpZCAjZmZmOyB9XFxuICAgICAgLmxvZ2luX19mb3JtLWJ0bi0tbG9naW46aG92ZXIsXFxuICAgICAgLnJlZ2lzdGVyX19mb3JtLWJ0bi0tbG9naW46aG92ZXIge1xcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gICAgICAgIGNvbG9yOiAjMzQyNDQyOyB9XFxuICAgICAgLmxvZ2luX19mb3JtLWJ0bi0tbG9naW46aG92ZXIgLmxvZ2luX19mb3JtLWljb24tcGF0aC0tbG9naW4sXFxuICAgICAgLnJlZ2lzdGVyX19mb3JtLWJ0bi0tbG9naW46aG92ZXIgLmxvZ2luX19mb3JtLWljb24tcGF0aC0tbG9naW4ge1xcbiAgICAgICAgZmlsbDogIzM0MjQ0MjsgfVxcbiAgICAgIC5sb2dpbl9fZm9ybS1idG4tLWxvZ2luOjphZnRlcixcXG4gICAgICAucmVnaXN0ZXJfX2Zvcm0tYnRuLS1sb2dpbjo6YWZ0ZXIge1xcbiAgICAgICAgbWFyZ2luLWJvdHRvbTogMXB4IHNvbGlkIHdoaXRlOyB9XFxuICAgIC5sb2dpbl9fZm9ybS1idG4tLXJlZ2lzdGVyLFxcbiAgICAucmVnaXN0ZXJfX2Zvcm0tYnRuLS1yZWdpc3RlciB7XFxuICAgICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKTtcXG4gICAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpO1xcbiAgICAgIGNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNzUpOyB9XFxuICAgICAgLmxvZ2luX19mb3JtLWJ0bi0tcmVnaXN0ZXI6aG92ZXIsXFxuICAgICAgLnJlZ2lzdGVyX19mb3JtLWJ0bi0tcmVnaXN0ZXI6aG92ZXIge1xcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjI1KTtcXG4gICAgICAgIGNvbG9yOiAjZmZmOyB9XFxuICAgICAgLmxvZ2luX19mb3JtLWJ0bi0tcmVnaXN0ZXI6aG92ZXIgLmxvZ2luX19mb3JtLWljb24tcGF0aC0tbG9naW4sXFxuICAgICAgLnJlZ2lzdGVyX19mb3JtLWJ0bi0tcmVnaXN0ZXI6aG92ZXIgLmxvZ2luX19mb3JtLWljb24tcGF0aC0tbG9naW4ge1xcbiAgICAgICAgZmlsbDogI2ZmZjsgfVxcbiAgICAubG9naW5fX2Zvcm0tYnRuIHNwYW4sXFxuICAgIC5yZWdpc3Rlcl9fZm9ybS1idG4gc3BhbiB7XFxuICAgICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuICAubG9naW5fX2Zvcm0taWNvbixcXG4gIC5yZWdpc3Rlcl9fZm9ybS1pY29uIHtcXG4gICAgaGVpZ2h0OiAxLjVyZW07XFxuICAgIHdpZHRoOiAxLjVyZW07XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgxNyUpOyB9XFxuICAubG9naW5fX2Zvcm0taWNvbi1wYXRoLS1sb2dpbixcXG4gIC5yZWdpc3Rlcl9fZm9ybS1pY29uLXBhdGgtLWxvZ2luIHtcXG4gICAgZmlsbDogIzE2MTYxZDsgfVxcbiAgLmxvZ2luX19mb3JtLWljb24tcGF0aC0tcmVnaXN0ZXIsXFxuICAucmVnaXN0ZXJfX2Zvcm0taWNvbi1wYXRoLS1yZWdpc3RlciB7XFxuICAgIGZpbGw6ICNmZmY7IH1cXG4gIC5sb2dpbl9fZm9ybS1ocixcXG4gIC5yZWdpc3Rlcl9fZm9ybS1ociB7XFxuICAgIHdpZHRoOiA5MCU7XFxuICAgIG1hcmdpbjogMnJlbSAwIDFyZW0gMDtcXG4gICAgbWFyZ2luLWJvdHRvbTogMC4yNXB4IHNvbGlkIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4yNSk7IH1cXG5cXG4ubmF2IHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgcGFkZGluZzogMXJlbSAxNiU7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjMmIyNTNhO1xcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICMwMDA7IH1cXG4gIC5uYXZfX2xlZnQge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4OiAwIDAgNTAlOyB9XFxuICAubmF2X19yaWdodCB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGJvcmRlci1yaWdodDogMXB4IHNvbGlkICNmZmY7XFxuICAgIGJvcmRlci1sZWZ0OiAxcHggc29saWQgI2ZmZjtcXG4gICAgcGFkZGluZy1sZWZ0OiAxcmVtO1xcbiAgICBtYXJnaW4tbGVmdDogYXV0bzsgfVxcbiAgICAubmF2X19yaWdodCA+ICoge1xcbiAgICAgIG1hcmdpbi1yaWdodDogMXJlbTsgfVxcbiAgLm5hdl9faXRlbS0tc2VhcmNoIHtcXG4gICAgZmxleDogMCAwIDI1JTsgfVxcbiAgLm5hdl9faXRlbS0taG9tZSB7XFxuICAgIG1hcmdpbi1yaWdodDogM3JlbTsgfVxcbiAgLm5hdl9fbGluayB7XFxuICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gICAgY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC43NSk7XFxuICAgIHRyYW5zaXRpb246IGFsbCAwLjJzOyB9XFxuICAgIC5uYXZfX2xpbms6aG92ZXIge1xcbiAgICAgIG1hcmdpbi1ib3R0b206IDJweDtcXG4gICAgICBjb2xvcjogI2ZmZjtcXG4gICAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2ZmZjsgfVxcbiAgICAubmF2X19saW5rLS1ob21lOmhvdmVyIC5uYXZfX2ljb24tcGF0aC0taG9tZSB7XFxuICAgICAgZmlsbDogI2ZmZjsgfVxcbiAgLm5hdl9fc2VhcmNoIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcbiAgICAubmF2X19zZWFyY2gtaW5wdXQge1xcbiAgICAgIGJvcmRlcjogbm9uZTtcXG4gICAgICBwYWRkaW5nOiAxcmVtIDJyZW07XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzJiMjUzYTtcXG4gICAgICBjYXJldC1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjc1KTtcXG4gICAgICBjb2xvcjogI2ZmZjsgfVxcbiAgICAgIC5uYXZfX3NlYXJjaC1pbnB1dDo6cGxhY2Vob2xkZXIge1xcbiAgICAgICAgY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC43NSk7IH1cXG4gICAgICAubmF2X19zZWFyY2gtaW5wdXQ6Zm9jdXMge1xcbiAgICAgICAgb3V0bGluZTogbm9uZTsgfVxcbiAgICAubmF2X19zZWFyY2gtYnRuIHtcXG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICAgIGxlZnQ6IDJyZW07XFxuICAgICAgdG9wOiAxcmVtOyB9XFxuICAgICAgLm5hdl9fc2VhcmNoLWJ0bjpob3ZlciAubmF2X19pY29uLXBhdGgtLXNlYXJjaCB7XFxuICAgICAgICBmaWxsOiAjZmZmOyB9XFxuICAubmF2X19pY29uLXNpemluZy0taG9tZSB7XFxuICAgIHdpZHRoOiAzcmVtO1xcbiAgICBoZWlnaHQ6IDNyZW07IH1cXG4gIC5uYXZfX2ljb24tc2l6aW5nLS1zZWFyY2gge1xcbiAgICB3aWR0aDogMnJlbTtcXG4gICAgaGVpZ2h0OiAycmVtO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTE1MCUpOyB9XFxuICAubmF2X19pY29uLXBhdGgtLWhvbWUge1xcbiAgICBmaWxsOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNzUpOyB9XFxuICAubmF2X19pY29uLXBhdGgtLXNlYXJjaCB7XFxuICAgIGZpbGw6ICNiZmJmYmY7IH1cXG5cXG4uZXJyb3Ige1xcbiAgbWFyZ2luLXRvcDogMnJlbTtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZjgwODA7XFxuICBib3JkZXItcmFkaXVzOiAxMHB4O1xcbiAgcGFkZGluZzogMnJlbTtcXG4gIGZvbnQtc2l6ZTogMnJlbTtcXG4gIGdyaWQtY29sdW1uOiBjZW50ZXItc3RhcnQgLyBjZW50ZXItZW5kO1xcbiAgZm9udC13ZWlnaHQ6IDcwMDsgfVxcblxcbi5zZWFyY2gtZm9ybSB7XFxuICBwYWRkaW5nOiAycmVtIDI1cmVtO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2ZkZmRmZDtcXG4gIG1pbi1oZWlnaHQ6IGNhbGMoMTAwdmggLSA2LjJyZW0pOyB9XFxuICAuc2VhcmNoLWZvcm1fX2dyb3VwIHtcXG4gICAgd2lkdGg6IDc1JTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgbWFyZ2luLWJvdHRvbTogM3JlbTtcXG4gICAgYWxpZ24taXRlbXM6IGZsZXgtc3RhcnQ7XFxuICAgIHBhZGRpbmc6IDAuNXJlbSA0cmVtIDAuNXJlbSAwO1xcbiAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgcmdiYSgwLCAwLCAwLCAwLjIpOyB9XFxuICAgIC5zZWFyY2gtZm9ybV9fZ3JvdXA6bnRoLWNoaWxkKDEwKSB7XFxuICAgICAgYm9yZGVyLWJvdHRvbTogbm9uZTsgfVxcbiAgLnNlYXJjaC1mb3JtX19sYWJlbCB7XFxuICAgIGZsZXg6IDAgMCAyMCU7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBmbGV4LXN0YXJ0O1xcbiAgICBmb250LXdlaWdodDogMzAwO1xcbiAgICBtYXJnaW4tdG9wOiAwLjdyZW07XFxuICAgIGNvbG9yOiAjNTUxYThiOyB9XFxuICAuc2VhcmNoLWZvcm1fX2dyb3VwLWlucHV0LXdyYXBwZXIge1xcbiAgICBmbGV4OiAwIDAgODAlOyB9XFxuICAuc2VhcmNoLWZvcm1fX3RpcCB7XFxuICAgIGZvbnQtc2l6ZTogMXJlbTtcXG4gICAgbGluZS1oZWlnaHQ6IDEuNDtcXG4gICAgd2lkdGg6IDcwJTsgfVxcbiAgLnNlYXJjaC1mb3JtX19pbnB1dC10ZXh0IHtcXG4gICAgd2lkdGg6IDQwcmVtO1xcbiAgICBoZWlnaHQ6IDRyZW07XFxuICAgIG1hcmdpbi1ib3R0b206IDFyZW07XFxuICAgIHBhZGRpbmc6IDFyZW07XFxuICAgIGJvcmRlcjogc29saWQgMXB4ICNiZmJmYmY7XFxuICAgIGJvcmRlci1yYWRpdXM6IDVweDsgfVxcbiAgICAuc2VhcmNoLWZvcm1fX2lucHV0LXRleHQ6Zm9jdXMge1xcbiAgICAgIGJvcmRlcjogc29saWQgMXB4ICMwMDA7IH1cXG4gIC5zZWFyY2gtZm9ybV9faW5wdXQtaW50ZWdlciB7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkICNhZWFlYWU7XFxuICAgIGhlaWdodDogMy41cmVtO1xcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XFxuICAgIHBhZGRpbmctbGVmdDogMC41cmVtO1xcbiAgICBwYWRkaW5nLXJpZ2h0OiAwLjVyZW07XFxuICAgIGJveC1zaGFkb3c6IDAgMXB4IDFweCAwIHJnYmEoMCwgMCwgMCwgMC4wNik7IH1cXG4gICAgLnNlYXJjaC1mb3JtX19pbnB1dC1pbnRlZ2VyLS1yZWxhdGl2ZSB7XFxuICAgICAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuICAuc2VhcmNoLWZvcm1fX2dyb3VwLS1jaGVja2JveCB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIG1hcmdpbi1ib3R0b206IDFyZW07IH1cXG4gIC5zZWFyY2gtZm9ybV9fbGFiZWwtLWNoZWNrYm94IHtcXG4gICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX2lucHV0LWNoZWNrYm94IHtcXG4gICAgd2lkdGg6IDIuMjVyZW07XFxuICAgIGhlaWdodDogMi4yNXJlbTtcXG4gICAgbWFyZ2luLXJpZ2h0OiAwLjhyZW07IH1cXG4gIC5zZWFyY2gtZm9ybV9fY2hlY2tib3gtd3JhcHBlciB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cXG4gIC5zZWFyY2gtZm9ybV9fc2VsZWN0LW1lbnUge1xcbiAgICBtYXJnaW4tYm90dG9tOiAxcmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX3NlbGVjdC1tZW51IHtcXG4gICAgY29sb3I6ICMzNDMyNDI7XFxuICAgIG1hcmdpbi1yaWdodDogMXJlbTtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgI2FlYWVhZTtcXG4gICAgYm9yZGVyLXJhZGl1czogM3B4O1xcbiAgICBib3gtc2hhZG93OiAwIDFweCAxcHggMCByZ2JhKDAsIDAsIDAsIDAuMDYpO1xcbiAgICBwYWRkaW5nOiAwIDIuMnJlbSAwIDAuNXJlbTtcXG4gICAgaGVpZ2h0OiAzLjRyZW07XFxuICAgIGZvbnQtc2l6ZTogMS40cmVtO1xcbiAgICB0ZXh0LWluZGVudDogMDtcXG4gICAgLXdlYmtpdC1hcHBlYXJhbmNlOiBub25lO1xcbiAgICAtbW96LWFwcGVhcmFuY2U6IG5vbmU7XFxuICAgIHRleHQtb3ZlcmZsb3c6ICcnO1xcbiAgICBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXCIgKyBfX19DU1NfTE9BREVSX1VSTF9SRVBMQUNFTUVOVF8wX19fICsgXCIpO1xcbiAgICBiYWNrZ3JvdW5kLXJlcGVhdDogbm8tcmVwZWF0O1xcbiAgICBiYWNrZ3JvdW5kLXBvc2l0aW9uOiByaWdodCAwLjhyZW0gY2VudGVyO1xcbiAgICBiYWNrZ3JvdW5kLXNpemU6IDEuMnJlbSAxcmVtO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmOyB9XFxuICAuc2VhcmNoLWZvcm1fX3N2Zy1zaXplIHtcXG4gICAgaGVpZ2h0OiAycmVtO1xcbiAgICB3aWR0aDogMnJlbTtcXG4gICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX3N2Zy1jb2xvciB7XFxuICAgIGZpbGw6ICM1NTFhOGI7IH1cXG4gIC5zZWFyY2gtZm9ybV9fc3VibWl0LXdyYXBwZXIge1xcbiAgICBwb3NpdGlvbjogc3RpY2t5O1xcbiAgICBib3R0b206IDA7XFxuICAgIHdpZHRoOiA3NSU7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIG1hcmdpbi1ib3R0b206IDNyZW07XFxuICAgIGJvcmRlci10b3A6IDFweCBzb2xpZCByZ2JhKDAsIDAsIDAsIDAuMik7XFxuICAgIGFsaWduLWl0ZW1zOiBmbGV4LXN0YXJ0O1xcbiAgICBwYWRkaW5nOiAxLjVyZW0gNHJlbSAxLjVyZW0gMDtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2ZkZmRmZDtcXG4gICAgei1pbmRleDogMTsgfVxcbiAgLnNlYXJjaC1mb3JtX19zdWJtaXQge1xcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XFxuICAgIHBhZGRpbmc6IDAuN3JlbTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2Y5ZjdmNTtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSg4NSwgMjYsIDEzOSwgMC41KTtcXG4gICAgY29sb3I6ICM1NTFhOGI7XFxuICAgIGZvbnQtd2VpZ2h0OiA1MDA7XFxuICAgIHRyYW5zaXRpb246IGFsbCAwLjJzO1xcbiAgICBtYXJnaW4tbGVmdDogMjAlOyB9XFxuICAgIC5zZWFyY2gtZm9ybV9fc3VibWl0OmhvdmVyIHtcXG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjsgfVxcbiAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1zcGFuIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgfVxcbiAgLnNlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcywgLnNlYXJjaC1mb3JtX19zZWxlY3RlZC1zZXRzIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gICAgbGlzdC1zdHlsZTogbm9uZTtcXG4gICAgbWFyZ2luLWJvdHRvbTogMC4zcmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLWxpc3QtaXRlbSwgLnNlYXJjaC1mb3JtX19zZWxlY3RlZC1zZXRzLWxpc3QtaXRlbSB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIG1hcmdpbi1ib3R0b206IDAuN3JlbTsgfVxcbiAgLnNlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy1yZW1vdmUtYnRuLCAuc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXNldHMtcmVtb3ZlLWJ0biB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgIGhlaWdodDogMnJlbTtcXG4gICAgd2lkdGg6IDJyZW07XFxuICAgIGZvbnQtc2l6ZTogMS4zcmVtO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjJmMmYyO1xcbiAgICBtYXJnaW4tcmlnaHQ6IDAuN3JlbTsgfVxcbiAgLnNlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy10b2dnbGVyIHtcXG4gICAgaGVpZ2h0OiAycmVtO1xcbiAgICB3aWR0aDogMi43NXJlbTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgZm9udC1zaXplOiAxLjNyZW07XFxuICAgIG1hcmdpbi1yaWdodDogMC43cmVtOyB9XFxuICAgIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlci0taXMge1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICM0N2QxNDc7IH1cXG4gICAgLnNlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy10b2dnbGVyLS1ub3Qge1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmZjAwMDA7IH1cXG4gIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24ge1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIG1heC1oZWlnaHQ6IDI4cmVtO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgICB6LWluZGV4OiAyO1xcbiAgICB0b3A6IDEwMCU7XFxuICAgIHdpZHRoOiA0MHJlbTtcXG4gICAgbWFyZ2luLXRvcDogLTFyZW07XFxuICAgIG92ZXJmbG93LXk6IGF1dG87XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkICMwMDA7IH1cXG4gICAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0IHtcXG4gICAgICBsaXN0LXN0eWxlOiBub25lOyB9XFxuICAgICAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0LWNhdGVnb3J5IHtcXG4gICAgICAgIHBhZGRpbmc6IDAuNXJlbTsgfVxcbiAgICAgIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1vcHRpb24ge1xcbiAgICAgICAgcGFkZGluZzogMC4zcmVtIDJyZW07XFxuICAgICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfVxcbiAgICAgICAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0LW9wdGlvbjpob3ZlciB7XFxuICAgICAgICAgIGN1cnNvcjogcG9pbnRlcjsgfVxcbiAgICAgICAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0LW9wdGlvbi0taGlnaGxpZ2h0ZWQge1xcbiAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjY2NkOGZmOyB9XFxuICAgICAgICAuc2VhcmNoLWZvcm1fX2Ryb3Bkb3duLWxpc3Qtb3B0aW9uIHNwYW4ge1xcbiAgICAgICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xcbiAgICAgICAgICBtYXJnaW4tbGVmdDogMXJlbTsgfVxcbiAgICAgIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1pbWcge1xcbiAgICAgICAgd2lkdGg6IDJyZW07XFxuICAgICAgICBoZWlnaHQ6IDJyZW07XFxuICAgICAgICBtYXJnaW4tcmlnaHQ6IDAuN3JlbTsgfVxcblxcbi5kcm9wZG93bi13cmFwcGVyIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcblxcbi5pbnYtc2VhcmNoLXByaWNlLW1zZyB7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICBib3R0b206IDA7XFxuICByaWdodDogMDtcXG4gIGNvbG9yOiByZWQ7IH1cXG5cXG4ucmVsYXRpdmUge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuXFxuLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdiB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjNmNWY4O1xcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHJnYmEoOTksIDY4LCAxNTAsIDAuMSk7XFxuICB3aWR0aDogMTAwJTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxuICBwYWRkaW5nOiAxLjJyZW0gMTYlO1xcbiAgbWFyZ2luLWJvdHRvbTogMC4xcmVtO1xcbiAgaGVpZ2h0OiA1LjJyZW07IH1cXG4gIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtc2VsZWN0IHtcXG4gICAgY29sb3I6ICNiMzAwYjM7XFxuICAgIG1hcmdpbi1yaWdodDogMXJlbTtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSg4NSwgMjYsIDEzOSwgMC41KTtcXG4gICAgYm9yZGVyLXJhZGl1czogM3B4O1xcbiAgICBib3gtc2hhZG93OiAwIDFweCAxcHggMCByZ2JhKDAsIDAsIDAsIDAuMDYpO1xcbiAgICBwYWRkaW5nOiAwLjFyZW0gMi4ycmVtIDAgMC41cmVtO1xcbiAgICBjb2xvcjogIzU1MWE4YjtcXG4gICAgaGVpZ2h0OiAyLjhyZW07XFxuICAgIGZvbnQtc2l6ZTogMS40cmVtO1xcbiAgICB0ZXh0LWluZGVudDogMDtcXG4gICAgLXdlYmtpdC1hcHBlYXJhbmNlOiBub25lO1xcbiAgICAtbW96LWFwcGVhcmFuY2U6IG5vbmU7XFxuICAgIHRleHQtb3ZlcmZsb3c6ICcnO1xcbiAgICBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXCIgKyBfX19DU1NfTE9BREVSX1VSTF9SRVBMQUNFTUVOVF8wX19fICsgXCIpO1xcbiAgICBiYWNrZ3JvdW5kLXJlcGVhdDogbm8tcmVwZWF0O1xcbiAgICBiYWNrZ3JvdW5kLXBvc2l0aW9uOiByaWdodCAwLjhyZW0gY2VudGVyO1xcbiAgICBiYWNrZ3JvdW5kLXNpemU6IDEuMnJlbSAxcmVtOyB9XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtc2VsZWN0OmhvdmVyIHtcXG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjsgfVxcbiAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1sYWJlbCB7XFxuICAgIGNvbG9yOiAjNTUxYThiOyB9XFxuICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LWJ0biB7XFxuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2Y5ZjdmNTtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSg4NSwgMjYsIDEzOSwgMC41KTtcXG4gICAgY29sb3I6ICM1NTFhOGI7XFxuICAgIGZvbnQtd2VpZ2h0OiA1MDA7XFxuICAgIHRyYW5zaXRpb246IGFsbCAwLjJzO1xcbiAgICBoZWlnaHQ6IDIuOHJlbTtcXG4gICAgcGFkZGluZzogMC4xcmVtIDAuN3JlbSAwIDAuN3JlbTtcXG4gICAgZm9udC1zaXplOiAxLjRyZW07XFxuICAgIG1hcmdpbjogYXV0byAwO1xcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICAgIGJveC1zaGFkb3c6IDAgMXB4IDFweCAwIHJnYmEoMCwgMCwgMCwgMC4wNik7IH1cXG4gICAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1idG46aG92ZXIge1xcbiAgICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmOyB9XFxuICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXJpZ2h0IHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfVxcbiAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1wYWdpbmF0aW9uLWNvbnRhaW5lciB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmOWY3ZjU7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoODUsIDI2LCAxMzksIDAuNSk7XFxuICAgIGNvbG9yOiAjNTUxYThiO1xcbiAgICBwYWRkaW5nOiAwLjJyZW0gMC43cmVtO1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgIGhlaWdodDogMi44cmVtO1xcbiAgICBib3gtc2hhZG93OiAwIDFweCAxcHggMCByZ2JhKDAsIDAsIDAsIDAuMDYpOyB9XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtcGFnaW5hdGlvbi1jb250YWluZXI6bm90KDpsYXN0LWNoaWxkKSB7XFxuICAgICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtcGFnaW5hdGlvbi1jb250YWluZXI6bnRoLWNoaWxkKDIpIHN2ZyB7XFxuICAgICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtcGFnaW5hdGlvbi1jb250YWluZXI6bnRoLWNoaWxkKDMpIHN2ZyB7XFxuICAgICAgbWFyZ2luLWxlZnQ6IDFyZW07IH1cXG4gICAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1wYWdpbmF0aW9uLWNvbnRhaW5lci0tZGlzYWJsZWQge1xcbiAgICAgIGN1cnNvcjogbm90LWFsbG93ZWQ7XFxuICAgICAgY29sb3I6IHJnYmEoMCwgMCwgMCwgMC4yNSk7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2Y1ZjZmNzsgfVxcbiAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1zdmctc2l6ZSB7XFxuICAgIGhlaWdodDogMnJlbTtcXG4gICAgd2lkdGg6IDJyZW07IH1cXG4gIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtc3ZnLWNvbG9yIHtcXG4gICAgZmlsbDogIzU1MWE4YjsgfVxcblxcbi5hcGktcmVzdWx0cy1kaXNwbGF5X19kaXNwbGF5LWJhciB7XFxuICB3aWR0aDogMTAwJTtcXG4gIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCByZ2JhKDk5LCA2OCwgMTUwLCAwLjEpO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2Y2ZjRmYTtcXG4gIGNvbG9yOiAjNTM1MzUzO1xcbiAgcGFkZGluZy1sZWZ0OiAxNiU7XFxuICBtYXJnaW4tYm90dG9tOiAycmVtO1xcbiAgaGVpZ2h0OiAyLjFyZW07IH1cXG5cXG4uY2FyZC1jaGVja2xpc3Qge1xcbiAgd2lkdGg6IDY4JTtcXG4gIGp1c3RpZnktc2VsZjogY2VudGVyOyB9XFxuICAuY2FyZC1jaGVja2xpc3RfX3JvdyB7XFxuICAgIGRpc3BsYXk6IGdyaWQ7XFxuICAgIGhlaWdodDogM3JlbTsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX3Jvdy0tNyB7XFxuICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoNywgMWZyKTsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX3Jvdy0tOSB7XFxuICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoOSwgMWZyKTsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX3Jvdy0taGVhZGVyIHtcXG4gICAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgIzAwMDtcXG4gICAgICBjb2xvcjogIzUzMWE4YjtcXG4gICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xcbiAgICAgIGZvbnQtc2l6ZTogMS4ycmVtICFpbXBvcnRhbnQ7XFxuICAgICAgZm9udC13ZWlnaHQ6IDIwMCAhaW1wb3J0YW50OyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fcm93LS1ncmV5IHtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjJmMmYyOyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fcm93Om50aC1jaGlsZChldmVuKSB7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2YyZjJmMjsgfVxcbiAgLmNhcmQtY2hlY2tsaXN0X19kYXRhIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC13cmFwOiBub3dyYXA7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xcbiAgICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpcztcXG4gICAgZm9udC1zaXplOiAxLjRyZW07IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19kYXRhLS1zZXQge1xcbiAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19kYXRhLS1yYXJpdHkge1xcbiAgICAgIHRleHQtdHJhbnNmb3JtOiBjYXBpdGFsaXplOyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fZGF0YS0tbmFtZSB7XFxuICAgICAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtc3RhcnQ7IH1cXG4gIC5jYXJkLWNoZWNrbGlzdF9fZGF0YS1saW5rIHtcXG4gICAgcGFkZGluZzogMXJlbSAwO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LXdyYXA6IG5vd3JhcDtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgY29sb3I6ICMwMDA7XFxuICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmstLXN0YXJ0IHtcXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtc3RhcnQ7IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmstLWNlbnRlciB7XFxuICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmstLXByaWNlIHtcXG4gICAgICBjb2xvcjogIzAwNjg4NTsgfVxcblxcbi50b29sdGlwIHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHotaW5kZXg6IDU7XFxuICB3aWR0aDogMjRyZW07XFxuICBoZWlnaHQ6IDM0cmVtOyB9XFxuICAudG9vbHRpcF9faW1nIHtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGhlaWdodDogMTAwJTsgfVxcblxcbi5uZWdhdGl2ZS1lYXJuaW5ncyB7XFxuICBjb2xvcjogcmVkOyB9XFxuXFxuLnBvc2l0aXZlLWVhcm5pbmdzIHtcXG4gIGNvbG9yOiBncmVlbjsgfVxcblxcbi5pbWFnZS1ncmlkIHtcXG4gIHBhZGRpbmc6IDEwcmVtIDE1cmVtO1xcbiAgZGlzcGxheTogZ3JpZDtcXG4gIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KGF1dG8tZml0LCBtaW5tYXgoMjVyZW0sIDFmcikpO1xcbiAgZ3JpZC1jb2x1bW4tZ2FwOiAycmVtO1xcbiAgZ3JpZC1yb3ctZ2FwOiAxcmVtOyB9XFxuICAuaW1hZ2UtZ3JpZF9fb3V0ZXItZGl2IHtcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuICAuaW1hZ2UtZ3JpZF9faW5uZXItZGl2IHtcXG4gICAgcGVyc3BlY3RpdmU6IDE1MHJlbTtcXG4gICAgaGVpZ2h0OiAzNHJlbTtcXG4gICAgd2lkdGg6IDI0cmVtOyB9XFxuICAuaW1hZ2UtZ3JpZF9fZG91YmxlIHtcXG4gICAgaGVpZ2h0OiAzNHJlbTtcXG4gICAgd2lkdGg6IDI0cmVtO1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIHRvcDogMDtcXG4gICAgbGVmdDogMDtcXG4gICAgYmFja2ZhY2UtdmlzaWJpbGl0eTogaGlkZGVuO1xcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgLjhzIGVhc2U7IH1cXG4gICAgLmltYWdlLWdyaWRfX2RvdWJsZS0tYmFjayB7XFxuICAgICAgdHJhbnNmb3JtOiByb3RhdGVZKDE4MGRlZyk7IH1cXG4gIC5pbWFnZS1ncmlkX19kb3VibGUtYnRuIHtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICB0b3A6IDUwJTtcXG4gICAgcmlnaHQ6IDE1JTtcXG4gICAgd2lkdGg6IDRyZW07XFxuICAgIGhlaWdodDogNHJlbTtcXG4gICAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNCk7IH1cXG4gIC5pbWFnZS1ncmlkX19jb250YWluZXIge1xcbiAgICB3aWR0aDogMjRyZW07XFxuICAgIGhlaWdodDogMzRyZW07IH1cXG4gIC5pbWFnZS1ncmlkX19pbWFnZSB7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBoZWlnaHQ6IDEwMCU7IH1cXG5cXG4uY2FyZCB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgbWFyZ2luLXRvcDogM3JlbTsgfVxcbiAgLmNhcmRfX2ltZy1jb250YWluZXIge1xcbiAgICBtYXJnaW4tcmlnaHQ6IDEwcmVtOyB9XFxuICAuY2FyZF9faW1nIHtcXG4gICAgd2lkdGg6IDMzcmVtO1xcbiAgICBoZWlnaHQ6IDQ2cmVtOyB9XFxuICAuY2FyZF9faW1nLWxlZnQge1xcbiAgICBtYXJnaW4tcmlnaHQ6IDEwcmVtO1xcbiAgICB3aWR0aDogMzNyZW07XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH1cXG4gIC5jYXJkX19pbWctYnRuIHtcXG4gICAganVzdGlmeS1zZWxmOiBmbGV4LWVuZDtcXG4gICAgYWxpZ24tc2VsZjogZmxleC1lbmQ7XFxuICAgIG1hcmdpbi10b3A6IGF1dG87IH1cXG4gIC5jYXJkX19pbWctZG91YmxlLWFyZWEge1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7IH1cXG4gIC5jYXJkX19pbWctZG91YmxlLXNpZGVkIHtcXG4gICAgcGVyc3BlY3RpdmU6IDE1MHJlbTtcXG4gICAgaGVpZ2h0OiA0NnJlbTsgfVxcbiAgLmNhcmRfX2ltZy1kb3VibGUge1xcbiAgICB3aWR0aDogMzNyZW07XFxuICAgIGhlaWdodDogNDZyZW07XFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgdG9wOiAwO1xcbiAgICBsZWZ0OiAwO1xcbiAgICBiYWNrZmFjZS12aXNpYmlsaXR5OiBoaWRkZW47XFxuICAgIG92ZXJmbG93OiBoaWRkZW47IH1cXG4gICAgLmNhcmRfX2ltZy1kb3VibGUtLWJhY2sge1xcbiAgICAgIHRyYW5zZm9ybTogcm90YXRlWSgxODBkZWcpOyB9XFxuICAuY2FyZF9fdGV4dCB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmNGY0ZDc7XFxuICAgIHdpZHRoOiAzNHJlbTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gICAgcGFkZGluZzogMXJlbTtcXG4gICAgbWFyZ2luLXJpZ2h0OiAzcmVtOyB9XFxuICAgIC5jYXJkX190ZXh0LWZsZXgge1xcbiAgICAgIG1hcmdpbi1ib3R0b206IDFyZW07XFxuICAgICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNiZmJmYmY7IH1cXG4gICAgLmNhcmRfX3RleHQtdGl0bGUge1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfVxcbiAgICAgIC5jYXJkX190ZXh0LXRpdGxlLWgzIHtcXG4gICAgICAgIGZvbnQtc2l6ZTogMS44cmVtO1xcbiAgICAgICAgZm9udC13ZWlnaHQ6IDQwMDtcXG4gICAgICAgIG1hcmdpbi1yaWdodDogMXJlbTsgfVxcbiAgICAuY2FyZF9fdGV4dC1jb2xvci1pbmRpY2F0b3Ige1xcbiAgICAgIHdpZHRoOiAxLjNyZW07XFxuICAgICAgaGVpZ2h0OiAxLjNyZW07XFxuICAgICAgYm9yZGVyOiAxcHggc29saWQgIzMzMztcXG4gICAgICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICAgICAgYm94LXNoYWRvdzogMHB4IDBweCAwcHggMnB4IHJnYmEoMCwgMCwgMCwgMC4yKTtcXG4gICAgICBtYXJnaW4tcmlnaHQ6IC43cmVtO1xcbiAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jazsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWNvbG9yLWluZGljYXRvci0tVSB7XFxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDEyOCwgMTI4LCAyNTUsIDAuNyk7IH1cXG4gICAgICAuY2FyZF9fdGV4dC1jb2xvci1pbmRpY2F0b3ItLUIge1xcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAwLCAwLCAwLjcpOyB9XFxuICAgICAgLmNhcmRfX3RleHQtY29sb3ItaW5kaWNhdG9yLS1SIHtcXG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjU1LCA3NywgNzcsIDAuNyk7IH1cXG4gICAgICAuY2FyZF9fdGV4dC1jb2xvci1pbmRpY2F0b3ItLVcge1xcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjcpOyB9XFxuICAgICAgLmNhcmRfX3RleHQtY29sb3ItaW5kaWNhdG9yLS1HIHtcXG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMjU1LCAwLCAwLjcpOyB9XFxuICAgIC5jYXJkX190ZXh0LW9yYWNsZS1wIHtcXG4gICAgICBtYXJnaW4tYm90dG9tOiAxcmVtO1xcbiAgICAgIGZvbnQtc2l6ZTogMS4zcmVtOyB9XFxuICAgIC5jYXJkX190ZXh0LW9yYWNsZS1mbGF2b3Ige1xcbiAgICAgIGZvbnQtc2l6ZTogMS4zcmVtO1xcbiAgICAgIGZvbnQtc3R5bGU6IGl0YWxpYzsgfVxcbiAgICAuY2FyZF9fdGV4dC1pbGx1c3RyYXRvciB7XFxuICAgICAgZm9udC1zaXplOiAxLjJyZW07XFxuICAgICAgZm9udC1zdHlsZTogaXRhbGljOyB9XFxuICAgIC5jYXJkX190ZXh0LWxlZ2FsIHtcXG4gICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgIGZsZXgtZGlyZWN0aW9uOiByb3c7XFxuICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuOyB9XFxuICAgICAgLmNhcmRfX3RleHQtbGVnYWwtaGFsZiB7XFxuICAgICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWxlZ2FsLXNwYW4tY29udGFpbmVyIHtcXG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAgICAgICAuY2FyZF9fdGV4dC1sZWdhbC1zcGFuLWNvbnRhaW5lcjpub3QoOmxhc3QtY2hpbGQpIHtcXG4gICAgICAgICAgbWFyZ2luLWJvdHRvbTogLjVyZW07IH1cXG4gICAgICAuY2FyZF9fdGV4dC1sZWdhbC1zcGFuLWJveCB7XFxuICAgICAgICB3aWR0aDogNnJlbTtcXG4gICAgICAgIGhlaWdodDogMi41cmVtO1xcbiAgICAgICAgYm9yZGVyOiAxcHggc29saWQgIzAwMDtcXG4gICAgICAgIG1hcmdpbi1yaWdodDogLjNyZW07XFxuICAgICAgICBmb250LXNpemU6IDFyZW07XFxuICAgICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xcbiAgICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfVxcbiAgICAgICAgLmNhcmRfX3RleHQtbGVnYWwtc3Bhbi1ib3gtLW5vdF9sZWdhbCB7XFxuICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmZjAwMDA7IH1cXG4gICAgICAgIC5jYXJkX190ZXh0LWxlZ2FsLXNwYW4tYm94LS1sZWdhbCB7XFxuICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6ICM0N2QxNDc7IH1cXG4gIC5jYXJkX19zZXQge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9XFxuICAgIC5jYXJkX19zZXQtYmFubmVyIHtcXG4gICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkICNiZmJmYmY7XFxuICAgICAgd2lkdGg6IDQwcmVtO1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICMwMDA7XFxuICAgICAgY29sb3I6ICNmZmY7IH1cXG4gICAgICAuY2FyZF9fc2V0LWJhbm5lci1zdmctY29udGFpbmVyIHtcXG4gICAgICAgIG1hcmdpbi1yaWdodDogMXJlbTsgfVxcbiAgICAgIC5jYXJkX19zZXQtYmFubmVyLXN2ZyB7XFxuICAgICAgICB3aWR0aDogMi40cmVtO1xcbiAgICAgICAgaGVpZ2h0OiAyLjRyZW07XFxuICAgICAgICBmaWx0ZXI6IGludmVydCgxMDAlKTsgfVxcbiAgICAuY2FyZF9fc2V0LWRldGFpbHMge1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgfVxcbiAgICAuY2FyZF9fc2V0LWhlYWRlci1uYW1lIHtcXG4gICAgICBmb250LXNpemU6IDEuN3JlbXJlbTsgfVxcbiAgICAuY2FyZF9fc2V0LWhlYWRlci1jb2RlIHtcXG4gICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOyB9XFxuICAgIC5jYXJkX19zZXQtcHJpbnRzLWhlYWRlciB7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzAwMDtcXG4gICAgICBjb2xvcjogI2ZmZjtcXG4gICAgICBmb250LXNpemU6IDEuM3JlbTtcXG4gICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkICNiZmJmYmY7XFxuICAgICAgcGFkZGluZzogLjNyZW0gLjdyZW07IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtc3ZnLWNvbnRhaW5lciB7XFxuICAgICAgaGVpZ2h0OiAxLjhyZW07XFxuICAgICAgd2lkdGg6IDEuOHJlbTtcXG4gICAgICBib3JkZXI6IDFweCBzb2xpZCAjYmZiZmJmO1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgICBib3JkZXItcmFkaXVzOiAxMDAlOyB9XFxuICAgIC5jYXJkX19zZXQtcHJpbnRzLXN2Zy0tY29tbW9uIHtcXG4gICAgICBmaWxsOiAjMDAwOyB9XFxuICAgIC5jYXJkX19zZXQtcHJpbnRzLXN2Zy0tdW5jb21tb24ge1xcbiAgICAgIGZpbGw6ICNlNmU2ZTY7IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtc3ZnLS1yYXJlIHtcXG4gICAgICBmaWxsOiAjZTZjMzAwOyB9XFxuICAgIC5jYXJkX19zZXQtcHJpbnRzLXN2Zy0tbXl0aGljIHtcXG4gICAgICBmaWxsOiAjZmYwMDAwOyB9XFxuICAgIC5jYXJkX19zZXQtcHJpbnRzLWxpc3Qge1xcbiAgICAgIGxpc3Qtc3R5bGU6IG5vbmU7IH1cXG4gICAgICAuY2FyZF9fc2V0LXByaW50cy1saXN0LWxpbms6bGluaywgLmNhcmRfX3NldC1wcmludHMtbGlzdC1saW5rOnZpc2l0ZWQge1xcbiAgICAgICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgICAgICAgY29sb3I6ICMwMDA7IH1cXG4gICAgICAuY2FyZF9fc2V0LXByaW50cy1saXN0LWl0ZW0ge1xcbiAgICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcXG4gICAgICAgIGN1cnNvcjogcG9pbnRlcjsgfVxcbiAgICAgICAgLmNhcmRfX3NldC1wcmludHMtbGlzdC1pdGVtOmhvdmVyIHtcXG4gICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2YyZjJmMjsgfVxcbiAgICAgIC5jYXJkX19zZXQtcHJpbnRzLWxpc3QtaXRlbS1uYW1lLXdyYXBwZXIge1xcbiAgICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgICAgICBtYXJnaW4tbGVmdDogLTFyZW07IH1cXG4gICAgICAuY2FyZF9fc2V0LXByaW50cy1saXN0LWl0ZW0tc2V0LW5hbWUge1xcbiAgICAgICAgbWFyZ2luLWxlZnQ6IC41cmVtOyB9XFxuICAgICAgLmNhcmRfX3NldC1wcmludHMtbGlzdC1pdGVtLXByaWNlIHtcXG4gICAgICAgIG1hcmdpbi1yaWdodDogLjdyZW07IH1cXG5cXG4uY2FyZC1wYWdlIHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgZ3JpZC1jb2x1bW46IGNlbnRlci1zdGFydCAvIGNlbnRlci1lbmQ7IH1cXG5cXG4uYWRkLXRvLWludixcXG4ucmVtb3ZlLWZyb20taW52IHtcXG4gIG1hcmdpbi10b3A6IDNyZW07XFxuICB3aWR0aDogNTAlOyB9XFxuICAuYWRkLXRvLWludl9fZm9ybSxcXG4gIC5yZW1vdmUtZnJvbS1pbnZfX2Zvcm0ge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9XFxuICAgIC5hZGQtdG8taW52X19mb3JtLWdyb3VwLFxcbiAgICAucmVtb3ZlLWZyb20taW52X19mb3JtLWdyb3VwIHtcXG4gICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgIGFsaWduLWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgICBtYXJnaW4tYm90dG9tOiAzcmVtO1xcbiAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcbiAgICAuYWRkLXRvLWludl9fZm9ybS1sYWJlbCxcXG4gICAgLnJlbW92ZS1mcm9tLWludl9fZm9ybS1sYWJlbCB7XFxuICAgICAgbWFyZ2luLXJpZ2h0OiAuM3JlbTsgfVxcbiAgLmFkZC10by1pbnYtcHJpY2UtbXNnLFxcbiAgLnJlbW92ZS1mcm9tLWludi1wcmljZS1tc2cge1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIGJvdHRvbTogLTEuOHJlbTtcXG4gICAgcmlnaHQ6IDI1JTtcXG4gICAgY29sb3I6IHJlZDsgfVxcblxcbi5uby1yZXN1bHRzIHtcXG4gIGp1c3RpZnktc2VsZjogY2VudGVyOyB9XFxuXFxuLmhvbWVwYWdlIHtcXG4gIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCh0byBib3R0b20sICMxZDFjMjUsICM0MzFlM2YpO1xcbiAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcXG4gIGhlaWdodDogMTAwdmg7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgb3ZlcmZsb3cteDogaGlkZGVuICFpbXBvcnRhbnQ7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIGJhY2tncm91bmQtc2l6ZTogY292ZXI7IH1cXG4gIC5ob21lcGFnZV9fY2VudGVyIHtcXG4gICAgYWxpZ24tc2VsZjogY2VudGVyOyB9XFxuICAuaG9tZXBhZ2VfX3NlYXJjaCB7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcbiAgLmhvbWVwYWdlX19zZWFyY2gtaW5wdXQge1xcbiAgICBwYWRkaW5nOiAxLjJyZW0gMS40cmVtIDEuMnJlbSA2LjJyZW07XFxuICAgIGZvbnQtc2l6ZTogM3JlbTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzI0MjAzMTtcXG4gICAgY29sb3I6ICNkN2Q3ZDc7XFxuICAgIGJvcmRlci1yYWRpdXM6IDRweDtcXG4gICAgYm94LXNoYWRvdzogMHB4IDBweCAwcHggMnB4IHJnYmEoMCwgMCwgMCwgMC41KTtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC41KTsgfVxcbiAgICAuaG9tZXBhZ2VfX3NlYXJjaC1pbnB1dDo6cGxhY2Vob2xkZXIge1xcbiAgICAgIHRleHQtYWxpZ246IGNlbnRlcjsgfVxcbiAgLmhvbWVwYWdlX19zZWFyY2gtYnRuIHtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICBsZWZ0OiA2cmVtO1xcbiAgICB0b3A6IDJyZW07IH1cXG4gIC5ob21lcGFnZV9faWNvbi1zaXppbmctLXNlYXJjaCB7XFxuICAgIHdpZHRoOiAzcmVtO1xcbiAgICBoZWlnaHQ6IDNyZW07XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtMTUwJSk7IH1cXG4gIC5ob21lcGFnZV9faWNvbi1wYXRoIHtcXG4gICAgZmlsbDogI2JmYmZiZjsgfVxcbiAgLmhvbWVwYWdlX19saW5rcyB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyOyB9XFxuICAuaG9tZXBhZ2VfX2xpbmsge1xcbiAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoODUsIDI2LCAxMzksIDAuNSk7XFxuICAgIGJvcmRlci1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjYpO1xcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XFxuICAgIGNvbG9yOiAjZmZmO1xcbiAgICBtYXJnaW4tdG9wOiAwLjZyZW07XFxuICAgIG1hcmdpbi1yaWdodDogM3JlbTtcXG4gICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICBsaW5lLWhlaWdodDogMS40O1xcbiAgICBwYWRkaW5nOiAwLjJyZW0gMXJlbSAwIDFyZW07XFxuICAgIGhlaWdodDogMi44cmVtO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgMC4ycztcXG4gICAgYm94LXNoYWRvdzogMCAxcHggMXB4IDAgcmdiYSgwLCAwLCAwLCAwLjA2KTtcXG4gICAgbWluLXdpZHRoOiA5cmVtO1xcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7IH1cXG4gICAgLmhvbWVwYWdlX19saW5rOmhvdmVyIHtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDkpOyB9XFxuICAuaG9tZXBhZ2VfX2NvbGFnZSB7XFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgb3ZlcmZsb3c6IGhpZGRlbjtcXG4gICAgYm90dG9tOiAwO1xcbiAgICBsZWZ0OiAwO1xcbiAgICBoZWlnaHQ6IDE1cmVtO1xcbiAgICB3aWR0aDogMTAwJTsgfVxcbiAgLmhvbWVwYWdlX19jb2xhZ2UtaW5uZXIge1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICAgIGhlaWdodDogMTAwJTtcXG4gICAgbWFyZ2luLWxlZnQ6IDUwJTtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC01MCUpO1xcbiAgICB3aWR0aDogNjUuNXJlbTsgfVxcbiAgLmhvbWVwYWdlX19jb2xhZ2UtY2FyZCB7XFxuICAgIHdpZHRoOiAxNi44cmVtO1xcbiAgICBoZWlnaHQ6IDIzLjRyZW07XFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgYm9yZGVyLXJhZGl1czogNSUgLyAzLjc1JTtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgMC4zcztcXG4gICAgYm94LXNoYWRvdzogaW5zZXQgMCAwIDNweCAzcHggIzAwMDsgfVxcbiAgICAuaG9tZXBhZ2VfX2NvbGFnZS1jYXJkOm50aC1jaGlsZCgxKSB7XFxuICAgICAgdG9wOiAyLjJyZW07IH1cXG4gICAgLmhvbWVwYWdlX19jb2xhZ2UtY2FyZDpudGgtY2hpbGQoMikge1xcbiAgICAgIHRvcDogNi4ycmVtO1xcbiAgICAgIGxlZnQ6IDMuNXJlbTsgfVxcbiAgICAuaG9tZXBhZ2VfX2NvbGFnZS1jYXJkOm50aC1jaGlsZCgzKSB7XFxuICAgICAgdG9wOiAxcmVtO1xcbiAgICAgIGxlZnQ6IDE3LjRyZW07IH1cXG4gICAgLmhvbWVwYWdlX19jb2xhZ2UtY2FyZDpudGgtY2hpbGQoNCkge1xcbiAgICAgIHRvcDogNC41cmVtO1xcbiAgICAgIGxlZnQ6IDIwLjZyZW07IH1cXG4gICAgLmhvbWVwYWdlX19jb2xhZ2UtY2FyZDpudGgtY2hpbGQoNSkge1xcbiAgICAgIHRvcDogMS42cmVtO1xcbiAgICAgIGxlZnQ6IDM0LjdyZW07IH1cXG4gICAgLmhvbWVwYWdlX19jb2xhZ2UtY2FyZDpudGgtY2hpbGQoNikge1xcbiAgICAgIHRvcDogNi41cmVtO1xcbiAgICAgIGxlZnQ6IDM4cmVtOyB9XFxuICAgIC5ob21lcGFnZV9fY29sYWdlLWNhcmQ6bnRoLWNoaWxkKDcpIHtcXG4gICAgICB0b3A6IDMuNXJlbTtcXG4gICAgICByaWdodDogMDsgfVxcbiAgICAuaG9tZXBhZ2VfX2NvbGFnZS1jYXJkOmhvdmVyIHtcXG4gICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTUlKTsgfVxcblxcbi5jb250YWluZXIge1xcbiAgZGlzcGxheTogZ3JpZDtcXG4gIGdyaWQtdGVtcGxhdGUtY29sdW1uczogW2Z1bGwtc3RhcnRdIG1pbm1heCg2cmVtLCAxZnIpIFtjZW50ZXItc3RhcnRdIHJlcGVhdCg4LCBbY29sLXN0YXJ0XSBtaW5tYXgobWluLWNvbnRlbnQsIDE0cmVtKSBbY29sLWVuZF0pIFtjZW50ZXItZW5kXSBtaW5tYXgoNnJlbSwgMWZyKSBbZnVsbC1lbmRdO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2Y1ZjZmNztcXG4gIGJhY2tncm91bmQtc2l6ZTogY292ZXI7IH1cXG5cXG4uc2VhcmNoIHtcXG4gIGdyaWQtY29sdW1uOiBmdWxsLXN0YXJ0IC8gZnVsbC1lbmQ7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmOyB9XFxuXFxuLmFwaS1yZXN1bHRzLWRpc3BsYXkge1xcbiAgZ3JpZC1jb2x1bW46IGZ1bGwtc3RhcnQgLyBmdWxsLWVuZDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmNWY2Zjc7XFxuICBiYWNrZ3JvdW5kLXNpemU6IGNvdmVyO1xcbiAgZGlzcGxheTogZ3JpZDsgfVxcblwiLCBcIlwiLHtcInZlcnNpb25cIjozLFwic291cmNlc1wiOltcIndlYnBhY2s6Ly8uL3NyYy9jc3Mvc3R5bGUuY3NzXCJdLFwibmFtZXNcIjpbXSxcIm1hcHBpbmdzXCI6XCJBQUFBOzs7RUFHRSxTQUFTO0VBQ1QsVUFBVTtFQUNWLG1CQUFtQixFQUFFOztBQUV2QjtFQUNFLGdCQUFnQixFQUFFOztBQUVwQjtFQUNFLHNCQUFzQjtFQUN0QixpQkFBaUI7RUFDakIsc0JBQXNCO0VBQ3RCLDRCQUE0QjtFQUM1QixnQkFBZ0I7RUFDaEIsK0JBQStCLEVBQUU7O0FBRW5DO0VBQ0Usd0JBQXdCLEVBQUU7O0FBRTVCO0VBQ0UsaUJBQWlCO0VBQ2pCLHlCQUF5QixFQUFFO0VBQzNCO0lBQ0UsV0FBVyxFQUFFOztBQUVqQjtFQUNFLGVBQWU7RUFDZix5QkFBeUI7RUFDekIsZ0JBQWdCO0VBQ2hCLFdBQVcsRUFBRTs7QUFFZjtFQUNFLG1CQUFtQixFQUFFOztBQUV2QjtFQUNFLG1CQUFtQixFQUFFOztBQUV2QjtFQUNFLGdCQUFnQixFQUFFOztBQUVwQjtFQUNFLG9CQUFvQjtFQUNwQixvQkFBb0I7RUFDcEIseUJBQXlCO0VBQ3pCLGdCQUFnQjtFQUNoQixxQkFBcUIsRUFBRTs7QUFFekI7RUFDRSxhQUFhO0VBQ2IsMkJBQTJCO0VBQzNCLDRDQUE0QyxFQUFFOztBQUVoRDs7RUFFRSxnQ0FBZ0M7RUFDaEMsWUFBWTtFQUNaLHFEQUFxRDtFQUNyRCw0QkFBNEI7RUFDNUIsc0JBQXNCO0VBQ3RCLGFBQWE7RUFDYix1QkFBdUI7RUFDdkIsbUJBQW1CLEVBQUU7RUFDckI7O0lBRUUsa0JBQWtCO0lBQ2xCLG1CQUFtQjtJQUNuQixjQUFjO0lBQ2QsYUFBYTtJQUNiLFNBQVMsRUFBRTtFQUNiOztJQUVFLGtCQUFrQjtJQUNsQix5QkFBeUI7SUFDekIseUJBQXlCO0lBQ3pCLDJDQUEyQztJQUMzQyxnQkFBZ0I7SUFDaEIsYUFBYTtJQUNiLHdCQUF3QjtJQUN4QixtQkFBbUI7SUFDbkIsd0JBQXdCO0lBQ3hCLDJCQUEyQixFQUFF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VztNQUNYLGFBQWEsRUFBRTtJQUNqQjtNQUNFLFdBQVc7TUFDWCxhQUFhLEVBQUU7SUFDakI7TUFDRSxXQUFXO01BQ1gsV0FBVyxFQUFFO0lBQ2Y7TUFDRSxXQUFXO01BQ1gsUUFBUSxFQUFFO0lBQ1o7TUFDRSwwQkFBMEIsRUFBRTs7QUFFbEM7RUFDRSxhQUFhO0VBQ2IsMEtBQTBLO0VBQzFLLHlCQUF5QjtFQUN6QixzQkFBc0IsRUFBRTs7QUFFMUI7RUFDRSxrQ0FBa0M7RUFDbEMsc0JBQXNCLEVBQUU7O0FBRTFCO0VBQ0Usa0NBQWtDO0VBQ2xDLHlCQUF5QjtFQUN6QixzQkFBc0I7RUFDdEIsYUFBYSxFQUFFXCIsXCJzb3VyY2VzQ29udGVudFwiOltcIiosXFxuKjo6YWZ0ZXIsXFxuKjo6YmVmb3JlIHtcXG4gIG1hcmdpbjogMDtcXG4gIHBhZGRpbmc6IDA7XFxuICBib3gtc2l6aW5nOiBpbmhlcml0OyB9XFxuXFxuaHRtbCB7XFxuICBmb250LXNpemU6IDYyLjUlOyB9XFxuXFxuYm9keSB7XFxuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbiAgZm9udC1zaXplOiAxLjZyZW07XFxuICBiYWNrZ3JvdW5kLXNpemU6IGNvdmVyO1xcbiAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcXG4gIGhlaWdodDogMTI3LjVyZW07XFxuICBmb250LWZhbWlseTogJ0xhdG8nLCBzYW5zLXNlcmlmOyB9XFxuXFxuW2hpZGRlbl0ge1xcbiAgZGlzcGxheTogbm9uZSAhaW1wb3J0YW50OyB9XFxuXFxuLmhlYWRpbmctdGVydGlhcnkge1xcbiAgZm9udC1zaXplOiAyLjRyZW07XFxuICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOyB9XFxuICAuaGVhZGluZy10ZXJ0aWFyeS0td2hpdGUge1xcbiAgICBjb2xvcjogI2ZmZjsgfVxcblxcbi5oZWFkaW5nLXByaW1hcnkge1xcbiAgZm9udC1zaXplOiAzcmVtO1xcbiAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcXG4gIGZvbnQtd2VpZ2h0OiAzMDA7XFxuICBjb2xvcjogI2ZmZjsgfVxcblxcbi5tYi0xMCB7XFxuICBtYXJnaW4tYm90dG9tOiAxcmVtOyB9XFxuXFxuLm1iLTIwIHtcXG4gIG1hcmdpbi1ib3R0b206IDJyZW07IH1cXG5cXG4ubXQtNTAge1xcbiAgbWFyZ2luLXRvcDogNXJlbTsgfVxcblxcbi5idG4sIC5idG46bGluaywgLmJ0bjp2aXNpdGVkIHtcXG4gIHBhZGRpbmc6IC43NXJlbSAycmVtO1xcbiAgYm9yZGVyLXJhZGl1czogLjVyZW07XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjJmMmYyO1xcbiAgZm9udC13ZWlnaHQ6IDQwMDtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jazsgfVxcblxcbi5idG46YWN0aXZlLCAuYnRuOmZvY3VzIHtcXG4gIG91dGxpbmU6IG5vbmU7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTFweCk7XFxuICBib3gtc2hhZG93OiAwIDAuNXJlbSAxcmVtIHJnYmEoMCwgMCwgMCwgMC4yKTsgfVxcblxcbi5sb2dpbixcXG4ucmVnaXN0ZXIge1xcbiAgbWluLWhlaWdodDogY2FsYygxMDB2aCAtIDYuMXJlbSk7XFxuICB3aWR0aDogMTAwdnc7XFxuICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQodG8gdG9wLCAjNWY0ZjY2LCAjMzQyMzMyKTtcXG4gIGJhY2tncm91bmQtcmVwZWF0OiBuby1yZXBlYXQ7XFxuICBiYWNrZ3JvdW5kLXNpemU6IGNvdmVyO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfVxcbiAgLmxvZ2luLWltZyxcXG4gIC5yZWdpc3Rlci1pbWcge1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIGJvcmRlci1yYWRpdXM6IDEwMCU7XFxuICAgIGhlaWdodDogOC41cmVtO1xcbiAgICB3aWR0aDogOC41cmVtO1xcbiAgICB0b3A6IC0xNSU7IH1cXG4gIC5sb2dpbl9fZm9ybSxcXG4gIC5yZWdpc3Rlcl9fZm9ybSB7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzFlMmEzODtcXG4gICAgYm9yZGVyOiAycHggc29saWQgIzFlMmEzODtcXG4gICAgYm94LXNoYWRvdzogMHB4IDJweCA1cHggcmdiYSgwLCAwLCAwLCAwLjI1KTtcXG4gICAgbWF4LXdpZHRoOiAzMnJlbTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1mbG93OiBjb2x1bW4gbm93cmFwO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBwYWRkaW5nOiA0cmVtIDAgMi42cmVtIDA7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtMjUlKTsgfVxcbiAgLmxvZ2luX19mb3JtLWluc3RydWN0aW9ucyxcXG4gIC5yZWdpc3Rlcl9fZm9ybS1pbnN0cnVjdGlvbnMge1xcbiAgICBjb2xvcjogI2ZmZjtcXG4gICAgZm9udC1zaXplOiAxLjRyZW07XFxuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcXG4gICAgd2lkdGg6IDkwJTsgfVxcbiAgLmxvZ2luX19mb3JtLWdyb3VwLFxcbiAgLnJlZ2lzdGVyX19mb3JtLWdyb3VwIHtcXG4gICAgd2lkdGg6IDkwJTsgfVxcbiAgLmxvZ2luX19mb3JtLWlucHV0LFxcbiAgLnJlZ2lzdGVyX19mb3JtLWlucHV0IHtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIG1hcmdpbjogMCBhdXRvO1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMik7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMCwgMCwgMC4xKTtcXG4gICAgYm94LXNoYWRvdzogcmdiYSgwLCAwLCAwLCAwLjUpO1xcbiAgICBib3JkZXItcmFkaXVzOiAycHg7XFxuICAgIG1hcmdpbi1ib3R0b206IDFyZW07XFxuICAgIGxpbmUtaGVpZ2h0OiAxLjI1O1xcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICAgIGhlaWdodDogNC4ycmVtO1xcbiAgICBwYWRkaW5nOiAxcmVtIDEuNHJlbTtcXG4gICAgY2FyZXQtY29sb3I6ICNmZmY7XFxuICAgIGNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNzUpOyB9XFxuICAgIC5sb2dpbl9fZm9ybS1pbnB1dDo6cGxhY2Vob2xkZXIsXFxuICAgIC5yZWdpc3Rlcl9fZm9ybS1pbnB1dDo6cGxhY2Vob2xkZXIge1xcbiAgICAgIGZvbnQtd2VpZ2h0OiAzMDA7XFxuICAgICAgY29sb3I6ICNlNmU2ZTY7XFxuICAgICAgZm9udC1zaXplOiAxLjhyZW07IH1cXG4gICAgLmxvZ2luX19mb3JtLWlucHV0OmZvY3VzLFxcbiAgICAucmVnaXN0ZXJfX2Zvcm0taW5wdXQ6Zm9jdXMge1xcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC43NSk7IH1cXG4gIC5sb2dpbl9fZm9ybS1idG4sXFxuICAucmVnaXN0ZXJfX2Zvcm0tYnRuIHtcXG4gICAgd2lkdGg6IDkwJTtcXG4gICAgYm9yZGVyLXJhZGl1czogMnB4O1xcbiAgICBwYWRkaW5nOiAwIDEuNHJlbTtcXG4gICAgbWFyZ2luOiAxcmVtIGF1dG8gMCBhdXRvO1xcbiAgICBib3gtc2hhZG93OiAwIDJweCA1cHggcmdiYSgwLCAwLCAwLCAwLjI1KTtcXG4gICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWFyb3VuZDtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgaGVpZ2h0OiA0LjJyZW07IH1cXG4gICAgLmxvZ2luX19mb3JtLWJ0bi0tbG9naW4sXFxuICAgIC5yZWdpc3Rlcl9fZm9ybS1idG4tLWxvZ2luIHtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuODcpO1xcbiAgICAgIGNvbG9yOiAjMTYxNjFkO1xcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkICNmZmY7IH1cXG4gICAgICAubG9naW5fX2Zvcm0tYnRuLS1sb2dpbjpob3ZlcixcXG4gICAgICAucmVnaXN0ZXJfX2Zvcm0tYnRuLS1sb2dpbjpob3ZlciB7XFxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgICAgICAgY29sb3I6ICMzNDI0NDI7IH1cXG4gICAgICAubG9naW5fX2Zvcm0tYnRuLS1sb2dpbjpob3ZlciAubG9naW5fX2Zvcm0taWNvbi1wYXRoLS1sb2dpbixcXG4gICAgICAucmVnaXN0ZXJfX2Zvcm0tYnRuLS1sb2dpbjpob3ZlciAubG9naW5fX2Zvcm0taWNvbi1wYXRoLS1sb2dpbiB7XFxuICAgICAgICBmaWxsOiAjMzQyNDQyOyB9XFxuICAgICAgLmxvZ2luX19mb3JtLWJ0bi0tbG9naW46OmFmdGVyLFxcbiAgICAgIC5yZWdpc3Rlcl9fZm9ybS1idG4tLWxvZ2luOjphZnRlciB7XFxuICAgICAgICBtYXJnaW4tYm90dG9tOiAxcHggc29saWQgd2hpdGU7IH1cXG4gICAgLmxvZ2luX19mb3JtLWJ0bi0tcmVnaXN0ZXIsXFxuICAgIC5yZWdpc3Rlcl9fZm9ybS1idG4tLXJlZ2lzdGVyIHtcXG4gICAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpO1xcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNSk7XFxuICAgICAgY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC43NSk7IH1cXG4gICAgICAubG9naW5fX2Zvcm0tYnRuLS1yZWdpc3Rlcjpob3ZlcixcXG4gICAgICAucmVnaXN0ZXJfX2Zvcm0tYnRuLS1yZWdpc3Rlcjpob3ZlciB7XFxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMjUpO1xcbiAgICAgICAgY29sb3I6ICNmZmY7IH1cXG4gICAgICAubG9naW5fX2Zvcm0tYnRuLS1yZWdpc3Rlcjpob3ZlciAubG9naW5fX2Zvcm0taWNvbi1wYXRoLS1sb2dpbixcXG4gICAgICAucmVnaXN0ZXJfX2Zvcm0tYnRuLS1yZWdpc3Rlcjpob3ZlciAubG9naW5fX2Zvcm0taWNvbi1wYXRoLS1sb2dpbiB7XFxuICAgICAgICBmaWxsOiAjZmZmOyB9XFxuICAgIC5sb2dpbl9fZm9ybS1idG4gc3BhbixcXG4gICAgLnJlZ2lzdGVyX19mb3JtLWJ0biBzcGFuIHtcXG4gICAgICBtYXJnaW4tcmlnaHQ6IDFyZW07IH1cXG4gIC5sb2dpbl9fZm9ybS1pY29uLFxcbiAgLnJlZ2lzdGVyX19mb3JtLWljb24ge1xcbiAgICBoZWlnaHQ6IDEuNXJlbTtcXG4gICAgd2lkdGg6IDEuNXJlbTtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDE3JSk7IH1cXG4gIC5sb2dpbl9fZm9ybS1pY29uLXBhdGgtLWxvZ2luLFxcbiAgLnJlZ2lzdGVyX19mb3JtLWljb24tcGF0aC0tbG9naW4ge1xcbiAgICBmaWxsOiAjMTYxNjFkOyB9XFxuICAubG9naW5fX2Zvcm0taWNvbi1wYXRoLS1yZWdpc3RlcixcXG4gIC5yZWdpc3Rlcl9fZm9ybS1pY29uLXBhdGgtLXJlZ2lzdGVyIHtcXG4gICAgZmlsbDogI2ZmZjsgfVxcbiAgLmxvZ2luX19mb3JtLWhyLFxcbiAgLnJlZ2lzdGVyX19mb3JtLWhyIHtcXG4gICAgd2lkdGg6IDkwJTtcXG4gICAgbWFyZ2luOiAycmVtIDAgMXJlbSAwO1xcbiAgICBtYXJnaW4tYm90dG9tOiAwLjI1cHggc29saWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjI1KTsgfVxcblxcbi5uYXYge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICBwYWRkaW5nOiAxcmVtIDE2JTtcXG4gIGJhY2tncm91bmQtY29sb3I6ICMyYjI1M2E7XFxuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgIzAwMDsgfVxcbiAgLm5hdl9fbGVmdCB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXg6IDAgMCA1MCU7IH1cXG4gIC5uYXZfX3JpZ2h0IHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgYm9yZGVyLXJpZ2h0OiAxcHggc29saWQgI2ZmZjtcXG4gICAgYm9yZGVyLWxlZnQ6IDFweCBzb2xpZCAjZmZmO1xcbiAgICBwYWRkaW5nLWxlZnQ6IDFyZW07XFxuICAgIG1hcmdpbi1sZWZ0OiBhdXRvOyB9XFxuICAgIC5uYXZfX3JpZ2h0ID4gKiB7XFxuICAgICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuICAubmF2X19pdGVtLS1zZWFyY2gge1xcbiAgICBmbGV4OiAwIDAgMjUlOyB9XFxuICAubmF2X19pdGVtLS1ob21lIHtcXG4gICAgbWFyZ2luLXJpZ2h0OiAzcmVtOyB9XFxuICAubmF2X19saW5rIHtcXG4gICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgICBjb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjc1KTtcXG4gICAgdHJhbnNpdGlvbjogYWxsIDAuMnM7IH1cXG4gICAgLm5hdl9fbGluazpob3ZlciB7XFxuICAgICAgbWFyZ2luLWJvdHRvbTogMnB4O1xcbiAgICAgIGNvbG9yOiAjZmZmO1xcbiAgICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjZmZmOyB9XFxuICAgIC5uYXZfX2xpbmstLWhvbWU6aG92ZXIgLm5hdl9faWNvbi1wYXRoLS1ob21lIHtcXG4gICAgICBmaWxsOiAjZmZmOyB9XFxuICAubmF2X19zZWFyY2gge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuICAgIC5uYXZfX3NlYXJjaC1pbnB1dCB7XFxuICAgICAgYm9yZGVyOiBub25lO1xcbiAgICAgIHBhZGRpbmc6IDFyZW0gMnJlbTtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMmIyNTNhO1xcbiAgICAgIGNhcmV0LWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNzUpO1xcbiAgICAgIGNvbG9yOiAjZmZmOyB9XFxuICAgICAgLm5hdl9fc2VhcmNoLWlucHV0OjpwbGFjZWhvbGRlciB7XFxuICAgICAgICBjb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjc1KTsgfVxcbiAgICAgIC5uYXZfX3NlYXJjaC1pbnB1dDpmb2N1cyB7XFxuICAgICAgICBvdXRsaW5lOiBub25lOyB9XFxuICAgIC5uYXZfX3NlYXJjaC1idG4ge1xcbiAgICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgICAgbGVmdDogMnJlbTtcXG4gICAgICB0b3A6IDFyZW07IH1cXG4gICAgICAubmF2X19zZWFyY2gtYnRuOmhvdmVyIC5uYXZfX2ljb24tcGF0aC0tc2VhcmNoIHtcXG4gICAgICAgIGZpbGw6ICNmZmY7IH1cXG4gIC5uYXZfX2ljb24tc2l6aW5nLS1ob21lIHtcXG4gICAgd2lkdGg6IDNyZW07XFxuICAgIGhlaWdodDogM3JlbTsgfVxcbiAgLm5hdl9faWNvbi1zaXppbmctLXNlYXJjaCB7XFxuICAgIHdpZHRoOiAycmVtO1xcbiAgICBoZWlnaHQ6IDJyZW07XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtMTUwJSk7IH1cXG4gIC5uYXZfX2ljb24tcGF0aC0taG9tZSB7XFxuICAgIGZpbGw6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC43NSk7IH1cXG4gIC5uYXZfX2ljb24tcGF0aC0tc2VhcmNoIHtcXG4gICAgZmlsbDogI2JmYmZiZjsgfVxcblxcbi5lcnJvciB7XFxuICBtYXJnaW4tdG9wOiAycmVtO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2ZmODA4MDtcXG4gIGJvcmRlci1yYWRpdXM6IDEwcHg7XFxuICBwYWRkaW5nOiAycmVtO1xcbiAgZm9udC1zaXplOiAycmVtO1xcbiAgZ3JpZC1jb2x1bW46IGNlbnRlci1zdGFydCAvIGNlbnRlci1lbmQ7XFxuICBmb250LXdlaWdodDogNzAwOyB9XFxuXFxuLnNlYXJjaC1mb3JtIHtcXG4gIHBhZGRpbmc6IDJyZW0gMjVyZW07XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmRmZGZkO1xcbiAgbWluLWhlaWdodDogY2FsYygxMDB2aCAtIDYuMnJlbSk7IH1cXG4gIC5zZWFyY2gtZm9ybV9fZ3JvdXAge1xcbiAgICB3aWR0aDogNzUlO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBtYXJnaW4tYm90dG9tOiAzcmVtO1xcbiAgICBhbGlnbi1pdGVtczogZmxleC1zdGFydDtcXG4gICAgcGFkZGluZzogMC41cmVtIDRyZW0gMC41cmVtIDA7XFxuICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCByZ2JhKDAsIDAsIDAsIDAuMik7IH1cXG4gICAgLnNlYXJjaC1mb3JtX19ncm91cDpudGgtY2hpbGQoMTApIHtcXG4gICAgICBib3JkZXItYm90dG9tOiBub25lOyB9XFxuICAuc2VhcmNoLWZvcm1fX2xhYmVsIHtcXG4gICAgZmxleDogMCAwIDIwJTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgYWxpZ24taXRlbXM6IGZsZXgtc3RhcnQ7XFxuICAgIGZvbnQtd2VpZ2h0OiAzMDA7XFxuICAgIG1hcmdpbi10b3A6IDAuN3JlbTtcXG4gICAgY29sb3I6ICM1NTFhOGI7IH1cXG4gIC5zZWFyY2gtZm9ybV9fZ3JvdXAtaW5wdXQtd3JhcHBlciB7XFxuICAgIGZsZXg6IDAgMCA4MCU7IH1cXG4gIC5zZWFyY2gtZm9ybV9fdGlwIHtcXG4gICAgZm9udC1zaXplOiAxcmVtO1xcbiAgICBsaW5lLWhlaWdodDogMS40O1xcbiAgICB3aWR0aDogNzAlOyB9XFxuICAuc2VhcmNoLWZvcm1fX2lucHV0LXRleHQge1xcbiAgICB3aWR0aDogNDByZW07XFxuICAgIGhlaWdodDogNHJlbTtcXG4gICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcXG4gICAgcGFkZGluZzogMXJlbTtcXG4gICAgYm9yZGVyOiBzb2xpZCAxcHggI2JmYmZiZjtcXG4gICAgYm9yZGVyLXJhZGl1czogNXB4OyB9XFxuICAgIC5zZWFyY2gtZm9ybV9faW5wdXQtdGV4dDpmb2N1cyB7XFxuICAgICAgYm9yZGVyOiBzb2xpZCAxcHggIzAwMDsgfVxcbiAgLnNlYXJjaC1mb3JtX19pbnB1dC1pbnRlZ2VyIHtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgI2FlYWVhZTtcXG4gICAgaGVpZ2h0OiAzLjVyZW07XFxuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgcGFkZGluZy1sZWZ0OiAwLjVyZW07XFxuICAgIHBhZGRpbmctcmlnaHQ6IDAuNXJlbTtcXG4gICAgYm94LXNoYWRvdzogMCAxcHggMXB4IDAgcmdiYSgwLCAwLCAwLCAwLjA2KTsgfVxcbiAgICAuc2VhcmNoLWZvcm1fX2lucHV0LWludGVnZXItLXJlbGF0aXZlIHtcXG4gICAgICBwb3NpdGlvbjogcmVsYXRpdmU7IH1cXG4gIC5zZWFyY2gtZm9ybV9fZ3JvdXAtLWNoZWNrYm94IHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgbWFyZ2luLWJvdHRvbTogMXJlbTsgfVxcbiAgLnNlYXJjaC1mb3JtX19sYWJlbC0tY2hlY2tib3gge1xcbiAgICBtYXJnaW4tcmlnaHQ6IDFyZW07IH1cXG4gIC5zZWFyY2gtZm9ybV9faW5wdXQtY2hlY2tib3gge1xcbiAgICB3aWR0aDogMi4yNXJlbTtcXG4gICAgaGVpZ2h0OiAyLjI1cmVtO1xcbiAgICBtYXJnaW4tcmlnaHQ6IDAuOHJlbTsgfVxcbiAgLnNlYXJjaC1mb3JtX19jaGVja2JveC13cmFwcGVyIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfVxcbiAgLnNlYXJjaC1mb3JtX19zZWxlY3QtbWVudSB7XFxuICAgIG1hcmdpbi1ib3R0b206IDFyZW07IH1cXG4gIC5zZWFyY2gtZm9ybV9fc2VsZWN0LW1lbnUge1xcbiAgICBjb2xvcjogIzM0MzI0MjtcXG4gICAgbWFyZ2luLXJpZ2h0OiAxcmVtO1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCAjYWVhZWFlO1xcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XFxuICAgIGJveC1zaGFkb3c6IDAgMXB4IDFweCAwIHJnYmEoMCwgMCwgMCwgMC4wNik7XFxuICAgIHBhZGRpbmc6IDAgMi4ycmVtIDAgMC41cmVtO1xcbiAgICBoZWlnaHQ6IDMuNHJlbTtcXG4gICAgZm9udC1zaXplOiAxLjRyZW07XFxuICAgIHRleHQtaW5kZW50OiAwO1xcbiAgICAtd2Via2l0LWFwcGVhcmFuY2U6IG5vbmU7XFxuICAgIC1tb3otYXBwZWFyYW5jZTogbm9uZTtcXG4gICAgdGV4dC1vdmVyZmxvdzogJyc7XFxuICAgIGJhY2tncm91bmQtaW1hZ2U6IHVybCguLi8uLi9hcHAvc3RhdGljL2ltZy9TVkcvYXJyb3ctZG93bjIuc3ZnKTtcXG4gICAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcXG4gICAgYmFja2dyb3VuZC1wb3NpdGlvbjogcmlnaHQgMC44cmVtIGNlbnRlcjtcXG4gICAgYmFja2dyb3VuZC1zaXplOiAxLjJyZW0gMXJlbTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjsgfVxcbiAgLnNlYXJjaC1mb3JtX19zdmctc2l6ZSB7XFxuICAgIGhlaWdodDogMnJlbTtcXG4gICAgd2lkdGg6IDJyZW07XFxuICAgIG1hcmdpbi1yaWdodDogMXJlbTsgfVxcbiAgLnNlYXJjaC1mb3JtX19zdmctY29sb3Ige1xcbiAgICBmaWxsOiAjNTUxYThiOyB9XFxuICAuc2VhcmNoLWZvcm1fX3N1Ym1pdC13cmFwcGVyIHtcXG4gICAgcG9zaXRpb246IHN0aWNreTtcXG4gICAgYm90dG9tOiAwO1xcbiAgICB3aWR0aDogNzUlO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBtYXJnaW4tYm90dG9tOiAzcmVtO1xcbiAgICBib3JkZXItdG9wOiAxcHggc29saWQgcmdiYSgwLCAwLCAwLCAwLjIpO1xcbiAgICBhbGlnbi1pdGVtczogZmxleC1zdGFydDtcXG4gICAgcGFkZGluZzogMS41cmVtIDRyZW0gMS41cmVtIDA7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmZGZkZmQ7XFxuICAgIHotaW5kZXg6IDE7IH1cXG4gIC5zZWFyY2gtZm9ybV9fc3VibWl0IHtcXG4gICAgYm9yZGVyLXJhZGl1czogM3B4O1xcbiAgICBwYWRkaW5nOiAwLjdyZW07XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmOWY3ZjU7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoODUsIDI2LCAxMzksIDAuNSk7XFxuICAgIGNvbG9yOiAjNTUxYThiO1xcbiAgICBmb250LXdlaWdodDogNTAwO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgMC4ycztcXG4gICAgbWFyZ2luLWxlZnQ6IDIwJTsgfVxcbiAgICAuc2VhcmNoLWZvcm1fX3N1Ym1pdDpob3ZlciB7XFxuICAgICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmZmY7IH1cXG4gIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tc3BhbiB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH1cXG4gIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMsIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtc2V0cyB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICAgIGxpc3Qtc3R5bGU6IG5vbmU7XFxuICAgIG1hcmdpbi1ib3R0b206IDAuM3JlbTsgfVxcbiAgLnNlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy1saXN0LWl0ZW0sIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtc2V0cy1saXN0LWl0ZW0ge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBtYXJnaW4tYm90dG9tOiAwLjdyZW07IH1cXG4gIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtcmVtb3ZlLWJ0biwgLnNlYXJjaC1mb3JtX19zZWxlY3RlZC1zZXRzLXJlbW92ZS1idG4ge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICBoZWlnaHQ6IDJyZW07XFxuICAgIHdpZHRoOiAycmVtO1xcbiAgICBmb250LXNpemU6IDEuM3JlbTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2YyZjJmMjtcXG4gICAgbWFyZ2luLXJpZ2h0OiAwLjdyZW07IH1cXG4gIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlciB7XFxuICAgIGhlaWdodDogMnJlbTtcXG4gICAgd2lkdGg6IDIuNzVyZW07XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgIGZvbnQtc2l6ZTogMS4zcmVtO1xcbiAgICBtYXJnaW4tcmlnaHQ6IDAuN3JlbTsgfVxcbiAgICAuc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLXRvZ2dsZXItLWlzIHtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDdkMTQ3OyB9XFxuICAgIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlci0tbm90IHtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmYwMDAwOyB9XFxuICAuc2VhcmNoLWZvcm1fX2Ryb3Bkb3duIHtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICBtYXgtaGVpZ2h0OiAyOHJlbTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gICAgei1pbmRleDogMjtcXG4gICAgdG9wOiAxMDAlO1xcbiAgICB3aWR0aDogNDByZW07XFxuICAgIG1hcmdpbi10b3A6IC0xcmVtO1xcbiAgICBvdmVyZmxvdy15OiBhdXRvO1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCAjMDAwOyB9XFxuICAgIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdCB7XFxuICAgICAgbGlzdC1zdHlsZTogbm9uZTsgfVxcbiAgICAgIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1jYXRlZ29yeSB7XFxuICAgICAgICBwYWRkaW5nOiAwLjVyZW07IH1cXG4gICAgICAuc2VhcmNoLWZvcm1fX2Ryb3Bkb3duLWxpc3Qtb3B0aW9uIHtcXG4gICAgICAgIHBhZGRpbmc6IDAuM3JlbSAycmVtO1xcbiAgICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cXG4gICAgICAgIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1vcHRpb246aG92ZXIge1xcbiAgICAgICAgICBjdXJzb3I6IHBvaW50ZXI7IH1cXG4gICAgICAgIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1vcHRpb24tLWhpZ2hsaWdodGVkIHtcXG4gICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2NjZDhmZjsgfVxcbiAgICAgICAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0LW9wdGlvbiBzcGFuIHtcXG4gICAgICAgICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcXG4gICAgICAgICAgbWFyZ2luLWxlZnQ6IDFyZW07IH1cXG4gICAgICAuc2VhcmNoLWZvcm1fX2Ryb3Bkb3duLWxpc3QtaW1nIHtcXG4gICAgICAgIHdpZHRoOiAycmVtO1xcbiAgICAgICAgaGVpZ2h0OiAycmVtO1xcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAwLjdyZW07IH1cXG5cXG4uZHJvcGRvd24td3JhcHBlciB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7IH1cXG5cXG4uaW52LXNlYXJjaC1wcmljZS1tc2cge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgYm90dG9tOiAwO1xcbiAgcmlnaHQ6IDA7XFxuICBjb2xvcjogcmVkOyB9XFxuXFxuLnJlbGF0aXZlIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcblxcbi5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2YzZjVmODtcXG4gIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCByZ2JhKDk5LCA2OCwgMTUwLCAwLjEpO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgcGFkZGluZzogMS4ycmVtIDE2JTtcXG4gIG1hcmdpbi1ib3R0b206IDAuMXJlbTtcXG4gIGhlaWdodDogNS4ycmVtOyB9XFxuICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXNlbGVjdCB7XFxuICAgIGNvbG9yOiAjYjMwMGIzO1xcbiAgICBtYXJnaW4tcmlnaHQ6IDFyZW07XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoODUsIDI2LCAxMzksIDAuNSk7XFxuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgYm94LXNoYWRvdzogMCAxcHggMXB4IDAgcmdiYSgwLCAwLCAwLCAwLjA2KTtcXG4gICAgcGFkZGluZzogMC4xcmVtIDIuMnJlbSAwIDAuNXJlbTtcXG4gICAgY29sb3I6ICM1NTFhOGI7XFxuICAgIGhlaWdodDogMi44cmVtO1xcbiAgICBmb250LXNpemU6IDEuNHJlbTtcXG4gICAgdGV4dC1pbmRlbnQ6IDA7XFxuICAgIC13ZWJraXQtYXBwZWFyYW5jZTogbm9uZTtcXG4gICAgLW1vei1hcHBlYXJhbmNlOiBub25lO1xcbiAgICB0ZXh0LW92ZXJmbG93OiAnJztcXG4gICAgYmFja2dyb3VuZC1pbWFnZTogdXJsKC4uLy4uL2FwcC9zdGF0aWMvaW1nL1NWRy9hcnJvdy1kb3duMi5zdmcpO1xcbiAgICBiYWNrZ3JvdW5kLXJlcGVhdDogbm8tcmVwZWF0O1xcbiAgICBiYWNrZ3JvdW5kLXBvc2l0aW9uOiByaWdodCAwLjhyZW0gY2VudGVyO1xcbiAgICBiYWNrZ3JvdW5kLXNpemU6IDEuMnJlbSAxcmVtOyB9XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtc2VsZWN0OmhvdmVyIHtcXG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjsgfVxcbiAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1sYWJlbCB7XFxuICAgIGNvbG9yOiAjNTUxYThiOyB9XFxuICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LWJ0biB7XFxuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2Y5ZjdmNTtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSg4NSwgMjYsIDEzOSwgMC41KTtcXG4gICAgY29sb3I6ICM1NTFhOGI7XFxuICAgIGZvbnQtd2VpZ2h0OiA1MDA7XFxuICAgIHRyYW5zaXRpb246IGFsbCAwLjJzO1xcbiAgICBoZWlnaHQ6IDIuOHJlbTtcXG4gICAgcGFkZGluZzogMC4xcmVtIDAuN3JlbSAwIDAuN3JlbTtcXG4gICAgZm9udC1zaXplOiAxLjRyZW07XFxuICAgIG1hcmdpbjogYXV0byAwO1xcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICAgIGJveC1zaGFkb3c6IDAgMXB4IDFweCAwIHJnYmEoMCwgMCwgMCwgMC4wNik7IH1cXG4gICAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1idG46aG92ZXIge1xcbiAgICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmOyB9XFxuICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXJpZ2h0IHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfVxcbiAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1wYWdpbmF0aW9uLWNvbnRhaW5lciB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmOWY3ZjU7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoODUsIDI2LCAxMzksIDAuNSk7XFxuICAgIGNvbG9yOiAjNTUxYThiO1xcbiAgICBwYWRkaW5nOiAwLjJyZW0gMC43cmVtO1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgIGhlaWdodDogMi44cmVtO1xcbiAgICBib3gtc2hhZG93OiAwIDFweCAxcHggMCByZ2JhKDAsIDAsIDAsIDAuMDYpOyB9XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtcGFnaW5hdGlvbi1jb250YWluZXI6bm90KDpsYXN0LWNoaWxkKSB7XFxuICAgICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtcGFnaW5hdGlvbi1jb250YWluZXI6bnRoLWNoaWxkKDIpIHN2ZyB7XFxuICAgICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtcGFnaW5hdGlvbi1jb250YWluZXI6bnRoLWNoaWxkKDMpIHN2ZyB7XFxuICAgICAgbWFyZ2luLWxlZnQ6IDFyZW07IH1cXG4gICAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1wYWdpbmF0aW9uLWNvbnRhaW5lci0tZGlzYWJsZWQge1xcbiAgICAgIGN1cnNvcjogbm90LWFsbG93ZWQ7XFxuICAgICAgY29sb3I6IHJnYmEoMCwgMCwgMCwgMC4yNSk7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2Y1ZjZmNzsgfVxcbiAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1zdmctc2l6ZSB7XFxuICAgIGhlaWdodDogMnJlbTtcXG4gICAgd2lkdGg6IDJyZW07IH1cXG4gIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtc3ZnLWNvbG9yIHtcXG4gICAgZmlsbDogIzU1MWE4YjsgfVxcblxcbi5hcGktcmVzdWx0cy1kaXNwbGF5X19kaXNwbGF5LWJhciB7XFxuICB3aWR0aDogMTAwJTtcXG4gIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCByZ2JhKDk5LCA2OCwgMTUwLCAwLjEpO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2Y2ZjRmYTtcXG4gIGNvbG9yOiAjNTM1MzUzO1xcbiAgcGFkZGluZy1sZWZ0OiAxNiU7XFxuICBtYXJnaW4tYm90dG9tOiAycmVtO1xcbiAgaGVpZ2h0OiAyLjFyZW07IH1cXG5cXG4uY2FyZC1jaGVja2xpc3Qge1xcbiAgd2lkdGg6IDY4JTtcXG4gIGp1c3RpZnktc2VsZjogY2VudGVyOyB9XFxuICAuY2FyZC1jaGVja2xpc3RfX3JvdyB7XFxuICAgIGRpc3BsYXk6IGdyaWQ7XFxuICAgIGhlaWdodDogM3JlbTsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX3Jvdy0tNyB7XFxuICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoNywgMWZyKTsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX3Jvdy0tOSB7XFxuICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoOSwgMWZyKTsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX3Jvdy0taGVhZGVyIHtcXG4gICAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgIzAwMDtcXG4gICAgICBjb2xvcjogIzUzMWE4YjtcXG4gICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xcbiAgICAgIGZvbnQtc2l6ZTogMS4ycmVtICFpbXBvcnRhbnQ7XFxuICAgICAgZm9udC13ZWlnaHQ6IDIwMCAhaW1wb3J0YW50OyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fcm93LS1ncmV5IHtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjJmMmYyOyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fcm93Om50aC1jaGlsZChldmVuKSB7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2YyZjJmMjsgfVxcbiAgLmNhcmQtY2hlY2tsaXN0X19kYXRhIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC13cmFwOiBub3dyYXA7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xcbiAgICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpcztcXG4gICAgZm9udC1zaXplOiAxLjRyZW07IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19kYXRhLS1zZXQge1xcbiAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19kYXRhLS1yYXJpdHkge1xcbiAgICAgIHRleHQtdHJhbnNmb3JtOiBjYXBpdGFsaXplOyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fZGF0YS0tbmFtZSB7XFxuICAgICAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtc3RhcnQ7IH1cXG4gIC5jYXJkLWNoZWNrbGlzdF9fZGF0YS1saW5rIHtcXG4gICAgcGFkZGluZzogMXJlbSAwO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LXdyYXA6IG5vd3JhcDtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgY29sb3I6ICMwMDA7XFxuICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmstLXN0YXJ0IHtcXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtc3RhcnQ7IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmstLWNlbnRlciB7XFxuICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmstLXByaWNlIHtcXG4gICAgICBjb2xvcjogIzAwNjg4NTsgfVxcblxcbi50b29sdGlwIHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHotaW5kZXg6IDU7XFxuICB3aWR0aDogMjRyZW07XFxuICBoZWlnaHQ6IDM0cmVtOyB9XFxuICAudG9vbHRpcF9faW1nIHtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGhlaWdodDogMTAwJTsgfVxcblxcbi5uZWdhdGl2ZS1lYXJuaW5ncyB7XFxuICBjb2xvcjogcmVkOyB9XFxuXFxuLnBvc2l0aXZlLWVhcm5pbmdzIHtcXG4gIGNvbG9yOiBncmVlbjsgfVxcblxcbi5pbWFnZS1ncmlkIHtcXG4gIHBhZGRpbmc6IDEwcmVtIDE1cmVtO1xcbiAgZGlzcGxheTogZ3JpZDtcXG4gIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KGF1dG8tZml0LCBtaW5tYXgoMjVyZW0sIDFmcikpO1xcbiAgZ3JpZC1jb2x1bW4tZ2FwOiAycmVtO1xcbiAgZ3JpZC1yb3ctZ2FwOiAxcmVtOyB9XFxuICAuaW1hZ2UtZ3JpZF9fb3V0ZXItZGl2IHtcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuICAuaW1hZ2UtZ3JpZF9faW5uZXItZGl2IHtcXG4gICAgcGVyc3BlY3RpdmU6IDE1MHJlbTtcXG4gICAgaGVpZ2h0OiAzNHJlbTtcXG4gICAgd2lkdGg6IDI0cmVtOyB9XFxuICAuaW1hZ2UtZ3JpZF9fZG91YmxlIHtcXG4gICAgaGVpZ2h0OiAzNHJlbTtcXG4gICAgd2lkdGg6IDI0cmVtO1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIHRvcDogMDtcXG4gICAgbGVmdDogMDtcXG4gICAgYmFja2ZhY2UtdmlzaWJpbGl0eTogaGlkZGVuO1xcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgLjhzIGVhc2U7IH1cXG4gICAgLmltYWdlLWdyaWRfX2RvdWJsZS0tYmFjayB7XFxuICAgICAgdHJhbnNmb3JtOiByb3RhdGVZKDE4MGRlZyk7IH1cXG4gIC5pbWFnZS1ncmlkX19kb3VibGUtYnRuIHtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICB0b3A6IDUwJTtcXG4gICAgcmlnaHQ6IDE1JTtcXG4gICAgd2lkdGg6IDRyZW07XFxuICAgIGhlaWdodDogNHJlbTtcXG4gICAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNCk7IH1cXG4gIC5pbWFnZS1ncmlkX19jb250YWluZXIge1xcbiAgICB3aWR0aDogMjRyZW07XFxuICAgIGhlaWdodDogMzRyZW07IH1cXG4gIC5pbWFnZS1ncmlkX19pbWFnZSB7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBoZWlnaHQ6IDEwMCU7IH1cXG5cXG4uY2FyZCB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgbWFyZ2luLXRvcDogM3JlbTsgfVxcbiAgLmNhcmRfX2ltZy1jb250YWluZXIge1xcbiAgICBtYXJnaW4tcmlnaHQ6IDEwcmVtOyB9XFxuICAuY2FyZF9faW1nIHtcXG4gICAgd2lkdGg6IDMzcmVtO1xcbiAgICBoZWlnaHQ6IDQ2cmVtOyB9XFxuICAuY2FyZF9faW1nLWxlZnQge1xcbiAgICBtYXJnaW4tcmlnaHQ6IDEwcmVtO1xcbiAgICB3aWR0aDogMzNyZW07XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH1cXG4gIC5jYXJkX19pbWctYnRuIHtcXG4gICAganVzdGlmeS1zZWxmOiBmbGV4LWVuZDtcXG4gICAgYWxpZ24tc2VsZjogZmxleC1lbmQ7XFxuICAgIG1hcmdpbi10b3A6IGF1dG87IH1cXG4gIC5jYXJkX19pbWctZG91YmxlLWFyZWEge1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7IH1cXG4gIC5jYXJkX19pbWctZG91YmxlLXNpZGVkIHtcXG4gICAgcGVyc3BlY3RpdmU6IDE1MHJlbTtcXG4gICAgaGVpZ2h0OiA0NnJlbTsgfVxcbiAgLmNhcmRfX2ltZy1kb3VibGUge1xcbiAgICB3aWR0aDogMzNyZW07XFxuICAgIGhlaWdodDogNDZyZW07XFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgdG9wOiAwO1xcbiAgICBsZWZ0OiAwO1xcbiAgICBiYWNrZmFjZS12aXNpYmlsaXR5OiBoaWRkZW47XFxuICAgIG92ZXJmbG93OiBoaWRkZW47IH1cXG4gICAgLmNhcmRfX2ltZy1kb3VibGUtLWJhY2sge1xcbiAgICAgIHRyYW5zZm9ybTogcm90YXRlWSgxODBkZWcpOyB9XFxuICAuY2FyZF9fdGV4dCB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmNGY0ZDc7XFxuICAgIHdpZHRoOiAzNHJlbTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gICAgcGFkZGluZzogMXJlbTtcXG4gICAgbWFyZ2luLXJpZ2h0OiAzcmVtOyB9XFxuICAgIC5jYXJkX190ZXh0LWZsZXgge1xcbiAgICAgIG1hcmdpbi1ib3R0b206IDFyZW07XFxuICAgICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNiZmJmYmY7IH1cXG4gICAgLmNhcmRfX3RleHQtdGl0bGUge1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfVxcbiAgICAgIC5jYXJkX190ZXh0LXRpdGxlLWgzIHtcXG4gICAgICAgIGZvbnQtc2l6ZTogMS44cmVtO1xcbiAgICAgICAgZm9udC13ZWlnaHQ6IDQwMDtcXG4gICAgICAgIG1hcmdpbi1yaWdodDogMXJlbTsgfVxcbiAgICAuY2FyZF9fdGV4dC1jb2xvci1pbmRpY2F0b3Ige1xcbiAgICAgIHdpZHRoOiAxLjNyZW07XFxuICAgICAgaGVpZ2h0OiAxLjNyZW07XFxuICAgICAgYm9yZGVyOiAxcHggc29saWQgIzMzMztcXG4gICAgICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICAgICAgYm94LXNoYWRvdzogMHB4IDBweCAwcHggMnB4IHJnYmEoMCwgMCwgMCwgMC4yKTtcXG4gICAgICBtYXJnaW4tcmlnaHQ6IC43cmVtO1xcbiAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jazsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWNvbG9yLWluZGljYXRvci0tVSB7XFxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDEyOCwgMTI4LCAyNTUsIDAuNyk7IH1cXG4gICAgICAuY2FyZF9fdGV4dC1jb2xvci1pbmRpY2F0b3ItLUIge1xcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAwLCAwLCAwLjcpOyB9XFxuICAgICAgLmNhcmRfX3RleHQtY29sb3ItaW5kaWNhdG9yLS1SIHtcXG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjU1LCA3NywgNzcsIDAuNyk7IH1cXG4gICAgICAuY2FyZF9fdGV4dC1jb2xvci1pbmRpY2F0b3ItLVcge1xcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjcpOyB9XFxuICAgICAgLmNhcmRfX3RleHQtY29sb3ItaW5kaWNhdG9yLS1HIHtcXG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMjU1LCAwLCAwLjcpOyB9XFxuICAgIC5jYXJkX190ZXh0LW9yYWNsZS1wIHtcXG4gICAgICBtYXJnaW4tYm90dG9tOiAxcmVtO1xcbiAgICAgIGZvbnQtc2l6ZTogMS4zcmVtOyB9XFxuICAgIC5jYXJkX190ZXh0LW9yYWNsZS1mbGF2b3Ige1xcbiAgICAgIGZvbnQtc2l6ZTogMS4zcmVtO1xcbiAgICAgIGZvbnQtc3R5bGU6IGl0YWxpYzsgfVxcbiAgICAuY2FyZF9fdGV4dC1pbGx1c3RyYXRvciB7XFxuICAgICAgZm9udC1zaXplOiAxLjJyZW07XFxuICAgICAgZm9udC1zdHlsZTogaXRhbGljOyB9XFxuICAgIC5jYXJkX190ZXh0LWxlZ2FsIHtcXG4gICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgIGZsZXgtZGlyZWN0aW9uOiByb3c7XFxuICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuOyB9XFxuICAgICAgLmNhcmRfX3RleHQtbGVnYWwtaGFsZiB7XFxuICAgICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWxlZ2FsLXNwYW4tY29udGFpbmVyIHtcXG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAgICAgICAuY2FyZF9fdGV4dC1sZWdhbC1zcGFuLWNvbnRhaW5lcjpub3QoOmxhc3QtY2hpbGQpIHtcXG4gICAgICAgICAgbWFyZ2luLWJvdHRvbTogLjVyZW07IH1cXG4gICAgICAuY2FyZF9fdGV4dC1sZWdhbC1zcGFuLWJveCB7XFxuICAgICAgICB3aWR0aDogNnJlbTtcXG4gICAgICAgIGhlaWdodDogMi41cmVtO1xcbiAgICAgICAgYm9yZGVyOiAxcHggc29saWQgIzAwMDtcXG4gICAgICAgIG1hcmdpbi1yaWdodDogLjNyZW07XFxuICAgICAgICBmb250LXNpemU6IDFyZW07XFxuICAgICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xcbiAgICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfVxcbiAgICAgICAgLmNhcmRfX3RleHQtbGVnYWwtc3Bhbi1ib3gtLW5vdF9sZWdhbCB7XFxuICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmZjAwMDA7IH1cXG4gICAgICAgIC5jYXJkX190ZXh0LWxlZ2FsLXNwYW4tYm94LS1sZWdhbCB7XFxuICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6ICM0N2QxNDc7IH1cXG4gIC5jYXJkX19zZXQge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9XFxuICAgIC5jYXJkX19zZXQtYmFubmVyIHtcXG4gICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkICNiZmJmYmY7XFxuICAgICAgd2lkdGg6IDQwcmVtO1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICMwMDA7XFxuICAgICAgY29sb3I6ICNmZmY7IH1cXG4gICAgICAuY2FyZF9fc2V0LWJhbm5lci1zdmctY29udGFpbmVyIHtcXG4gICAgICAgIG1hcmdpbi1yaWdodDogMXJlbTsgfVxcbiAgICAgIC5jYXJkX19zZXQtYmFubmVyLXN2ZyB7XFxuICAgICAgICB3aWR0aDogMi40cmVtO1xcbiAgICAgICAgaGVpZ2h0OiAyLjRyZW07XFxuICAgICAgICBmaWx0ZXI6IGludmVydCgxMDAlKTsgfVxcbiAgICAuY2FyZF9fc2V0LWRldGFpbHMge1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgfVxcbiAgICAuY2FyZF9fc2V0LWhlYWRlci1uYW1lIHtcXG4gICAgICBmb250LXNpemU6IDEuN3JlbXJlbTsgfVxcbiAgICAuY2FyZF9fc2V0LWhlYWRlci1jb2RlIHtcXG4gICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOyB9XFxuICAgIC5jYXJkX19zZXQtcHJpbnRzLWhlYWRlciB7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzAwMDtcXG4gICAgICBjb2xvcjogI2ZmZjtcXG4gICAgICBmb250LXNpemU6IDEuM3JlbTtcXG4gICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkICNiZmJmYmY7XFxuICAgICAgcGFkZGluZzogLjNyZW0gLjdyZW07IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtc3ZnLWNvbnRhaW5lciB7XFxuICAgICAgaGVpZ2h0OiAxLjhyZW07XFxuICAgICAgd2lkdGg6IDEuOHJlbTtcXG4gICAgICBib3JkZXI6IDFweCBzb2xpZCAjYmZiZmJmO1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgICBib3JkZXItcmFkaXVzOiAxMDAlOyB9XFxuICAgIC5jYXJkX19zZXQtcHJpbnRzLXN2Zy0tY29tbW9uIHtcXG4gICAgICBmaWxsOiAjMDAwOyB9XFxuICAgIC5jYXJkX19zZXQtcHJpbnRzLXN2Zy0tdW5jb21tb24ge1xcbiAgICAgIGZpbGw6ICNlNmU2ZTY7IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtc3ZnLS1yYXJlIHtcXG4gICAgICBmaWxsOiAjZTZjMzAwOyB9XFxuICAgIC5jYXJkX19zZXQtcHJpbnRzLXN2Zy0tbXl0aGljIHtcXG4gICAgICBmaWxsOiAjZmYwMDAwOyB9XFxuICAgIC5jYXJkX19zZXQtcHJpbnRzLWxpc3Qge1xcbiAgICAgIGxpc3Qtc3R5bGU6IG5vbmU7IH1cXG4gICAgICAuY2FyZF9fc2V0LXByaW50cy1saXN0LWxpbms6bGluaywgLmNhcmRfX3NldC1wcmludHMtbGlzdC1saW5rOnZpc2l0ZWQge1xcbiAgICAgICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgICAgICAgY29sb3I6ICMwMDA7IH1cXG4gICAgICAuY2FyZF9fc2V0LXByaW50cy1saXN0LWl0ZW0ge1xcbiAgICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcXG4gICAgICAgIGN1cnNvcjogcG9pbnRlcjsgfVxcbiAgICAgICAgLmNhcmRfX3NldC1wcmludHMtbGlzdC1pdGVtOmhvdmVyIHtcXG4gICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2YyZjJmMjsgfVxcbiAgICAgIC5jYXJkX19zZXQtcHJpbnRzLWxpc3QtaXRlbS1uYW1lLXdyYXBwZXIge1xcbiAgICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgICAgICBtYXJnaW4tbGVmdDogLTFyZW07IH1cXG4gICAgICAuY2FyZF9fc2V0LXByaW50cy1saXN0LWl0ZW0tc2V0LW5hbWUge1xcbiAgICAgICAgbWFyZ2luLWxlZnQ6IC41cmVtOyB9XFxuICAgICAgLmNhcmRfX3NldC1wcmludHMtbGlzdC1pdGVtLXByaWNlIHtcXG4gICAgICAgIG1hcmdpbi1yaWdodDogLjdyZW07IH1cXG5cXG4uY2FyZC1wYWdlIHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgZ3JpZC1jb2x1bW46IGNlbnRlci1zdGFydCAvIGNlbnRlci1lbmQ7IH1cXG5cXG4uYWRkLXRvLWludixcXG4ucmVtb3ZlLWZyb20taW52IHtcXG4gIG1hcmdpbi10b3A6IDNyZW07XFxuICB3aWR0aDogNTAlOyB9XFxuICAuYWRkLXRvLWludl9fZm9ybSxcXG4gIC5yZW1vdmUtZnJvbS1pbnZfX2Zvcm0ge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9XFxuICAgIC5hZGQtdG8taW52X19mb3JtLWdyb3VwLFxcbiAgICAucmVtb3ZlLWZyb20taW52X19mb3JtLWdyb3VwIHtcXG4gICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgIGFsaWduLWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgICBtYXJnaW4tYm90dG9tOiAzcmVtO1xcbiAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcbiAgICAuYWRkLXRvLWludl9fZm9ybS1sYWJlbCxcXG4gICAgLnJlbW92ZS1mcm9tLWludl9fZm9ybS1sYWJlbCB7XFxuICAgICAgbWFyZ2luLXJpZ2h0OiAuM3JlbTsgfVxcbiAgLmFkZC10by1pbnYtcHJpY2UtbXNnLFxcbiAgLnJlbW92ZS1mcm9tLWludi1wcmljZS1tc2cge1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIGJvdHRvbTogLTEuOHJlbTtcXG4gICAgcmlnaHQ6IDI1JTtcXG4gICAgY29sb3I6IHJlZDsgfVxcblxcbi5uby1yZXN1bHRzIHtcXG4gIGp1c3RpZnktc2VsZjogY2VudGVyOyB9XFxuXFxuLmhvbWVwYWdlIHtcXG4gIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCh0byBib3R0b20sICMxZDFjMjUsICM0MzFlM2YpO1xcbiAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcXG4gIGhlaWdodDogMTAwdmg7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgb3ZlcmZsb3cteDogaGlkZGVuICFpbXBvcnRhbnQ7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIGJhY2tncm91bmQtc2l6ZTogY292ZXI7IH1cXG4gIC5ob21lcGFnZV9fY2VudGVyIHtcXG4gICAgYWxpZ24tc2VsZjogY2VudGVyOyB9XFxuICAuaG9tZXBhZ2VfX3NlYXJjaCB7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcbiAgLmhvbWVwYWdlX19zZWFyY2gtaW5wdXQge1xcbiAgICBwYWRkaW5nOiAxLjJyZW0gMS40cmVtIDEuMnJlbSA2LjJyZW07XFxuICAgIGZvbnQtc2l6ZTogM3JlbTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzI0MjAzMTtcXG4gICAgY29sb3I6ICNkN2Q3ZDc7XFxuICAgIGJvcmRlci1yYWRpdXM6IDRweDtcXG4gICAgYm94LXNoYWRvdzogMHB4IDBweCAwcHggMnB4IHJnYmEoMCwgMCwgMCwgMC41KTtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC41KTsgfVxcbiAgICAuaG9tZXBhZ2VfX3NlYXJjaC1pbnB1dDo6cGxhY2Vob2xkZXIge1xcbiAgICAgIHRleHQtYWxpZ246IGNlbnRlcjsgfVxcbiAgLmhvbWVwYWdlX19zZWFyY2gtYnRuIHtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICBsZWZ0OiA2cmVtO1xcbiAgICB0b3A6IDJyZW07IH1cXG4gIC5ob21lcGFnZV9faWNvbi1zaXppbmctLXNlYXJjaCB7XFxuICAgIHdpZHRoOiAzcmVtO1xcbiAgICBoZWlnaHQ6IDNyZW07XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtMTUwJSk7IH1cXG4gIC5ob21lcGFnZV9faWNvbi1wYXRoIHtcXG4gICAgZmlsbDogI2JmYmZiZjsgfVxcbiAgLmhvbWVwYWdlX19saW5rcyB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyOyB9XFxuICAuaG9tZXBhZ2VfX2xpbmsge1xcbiAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoODUsIDI2LCAxMzksIDAuNSk7XFxuICAgIGJvcmRlci1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjYpO1xcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XFxuICAgIGNvbG9yOiAjZmZmO1xcbiAgICBtYXJnaW4tdG9wOiAwLjZyZW07XFxuICAgIG1hcmdpbi1yaWdodDogM3JlbTtcXG4gICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICBsaW5lLWhlaWdodDogMS40O1xcbiAgICBwYWRkaW5nOiAwLjJyZW0gMXJlbSAwIDFyZW07XFxuICAgIGhlaWdodDogMi44cmVtO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgMC4ycztcXG4gICAgYm94LXNoYWRvdzogMCAxcHggMXB4IDAgcmdiYSgwLCAwLCAwLCAwLjA2KTtcXG4gICAgbWluLXdpZHRoOiA5cmVtO1xcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7IH1cXG4gICAgLmhvbWVwYWdlX19saW5rOmhvdmVyIHtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDkpOyB9XFxuICAuaG9tZXBhZ2VfX2NvbGFnZSB7XFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgb3ZlcmZsb3c6IGhpZGRlbjtcXG4gICAgYm90dG9tOiAwO1xcbiAgICBsZWZ0OiAwO1xcbiAgICBoZWlnaHQ6IDE1cmVtO1xcbiAgICB3aWR0aDogMTAwJTsgfVxcbiAgLmhvbWVwYWdlX19jb2xhZ2UtaW5uZXIge1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICAgIGhlaWdodDogMTAwJTtcXG4gICAgbWFyZ2luLWxlZnQ6IDUwJTtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC01MCUpO1xcbiAgICB3aWR0aDogNjUuNXJlbTsgfVxcbiAgLmhvbWVwYWdlX19jb2xhZ2UtY2FyZCB7XFxuICAgIHdpZHRoOiAxNi44cmVtO1xcbiAgICBoZWlnaHQ6IDIzLjRyZW07XFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgYm9yZGVyLXJhZGl1czogNSUgLyAzLjc1JTtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgMC4zcztcXG4gICAgYm94LXNoYWRvdzogaW5zZXQgMCAwIDNweCAzcHggIzAwMDsgfVxcbiAgICAuaG9tZXBhZ2VfX2NvbGFnZS1jYXJkOm50aC1jaGlsZCgxKSB7XFxuICAgICAgdG9wOiAyLjJyZW07IH1cXG4gICAgLmhvbWVwYWdlX19jb2xhZ2UtY2FyZDpudGgtY2hpbGQoMikge1xcbiAgICAgIHRvcDogNi4ycmVtO1xcbiAgICAgIGxlZnQ6IDMuNXJlbTsgfVxcbiAgICAuaG9tZXBhZ2VfX2NvbGFnZS1jYXJkOm50aC1jaGlsZCgzKSB7XFxuICAgICAgdG9wOiAxcmVtO1xcbiAgICAgIGxlZnQ6IDE3LjRyZW07IH1cXG4gICAgLmhvbWVwYWdlX19jb2xhZ2UtY2FyZDpudGgtY2hpbGQoNCkge1xcbiAgICAgIHRvcDogNC41cmVtO1xcbiAgICAgIGxlZnQ6IDIwLjZyZW07IH1cXG4gICAgLmhvbWVwYWdlX19jb2xhZ2UtY2FyZDpudGgtY2hpbGQoNSkge1xcbiAgICAgIHRvcDogMS42cmVtO1xcbiAgICAgIGxlZnQ6IDM0LjdyZW07IH1cXG4gICAgLmhvbWVwYWdlX19jb2xhZ2UtY2FyZDpudGgtY2hpbGQoNikge1xcbiAgICAgIHRvcDogNi41cmVtO1xcbiAgICAgIGxlZnQ6IDM4cmVtOyB9XFxuICAgIC5ob21lcGFnZV9fY29sYWdlLWNhcmQ6bnRoLWNoaWxkKDcpIHtcXG4gICAgICB0b3A6IDMuNXJlbTtcXG4gICAgICByaWdodDogMDsgfVxcbiAgICAuaG9tZXBhZ2VfX2NvbGFnZS1jYXJkOmhvdmVyIHtcXG4gICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTUlKTsgfVxcblxcbi5jb250YWluZXIge1xcbiAgZGlzcGxheTogZ3JpZDtcXG4gIGdyaWQtdGVtcGxhdGUtY29sdW1uczogW2Z1bGwtc3RhcnRdIG1pbm1heCg2cmVtLCAxZnIpIFtjZW50ZXItc3RhcnRdIHJlcGVhdCg4LCBbY29sLXN0YXJ0XSBtaW5tYXgobWluLWNvbnRlbnQsIDE0cmVtKSBbY29sLWVuZF0pIFtjZW50ZXItZW5kXSBtaW5tYXgoNnJlbSwgMWZyKSBbZnVsbC1lbmRdO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2Y1ZjZmNztcXG4gIGJhY2tncm91bmQtc2l6ZTogY292ZXI7IH1cXG5cXG4uc2VhcmNoIHtcXG4gIGdyaWQtY29sdW1uOiBmdWxsLXN0YXJ0IC8gZnVsbC1lbmQ7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmOyB9XFxuXFxuLmFwaS1yZXN1bHRzLWRpc3BsYXkge1xcbiAgZ3JpZC1jb2x1bW46IGZ1bGwtc3RhcnQgLyBmdWxsLWVuZDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmNWY2Zjc7XFxuICBiYWNrZ3JvdW5kLXNpemU6IGNvdmVyO1xcbiAgZGlzcGxheTogZ3JpZDsgfVxcblwiXSxcInNvdXJjZVJvb3RcIjpcIlwifV0pO1xuLy8gRXhwb3J0c1xuZXhwb3J0IGRlZmF1bHQgX19fQ1NTX0xPQURFUl9FWFBPUlRfX187XG4iLCIvLyBJbXBvcnRzXG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyBmcm9tIFwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2Nzc1dpdGhNYXBwaW5nVG9TdHJpbmcuanNcIjtcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18gZnJvbSBcIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanNcIjtcbmltcG9ydCBfX19DU1NfTE9BREVSX0dFVF9VUkxfSU1QT1JUX19fIGZyb20gXCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvZ2V0VXJsLmpzXCI7XG5pbXBvcnQgX19fQ1NTX0xPQURFUl9VUkxfSU1QT1JUXzBfX18gZnJvbSBcIi4uLy4uL2ltZy9tYW5hLXN5bWJvbHMvbWFuYS5zdmdcIjtcbnZhciBfX19DU1NfTE9BREVSX0VYUE9SVF9fXyA9IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyhfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fKTtcbnZhciBfX19DU1NfTE9BREVSX1VSTF9SRVBMQUNFTUVOVF8wX19fID0gX19fQ1NTX0xPQURFUl9HRVRfVVJMX0lNUE9SVF9fXyhfX19DU1NfTE9BREVSX1VSTF9JTVBPUlRfMF9fXyk7XG4vLyBNb2R1bGVcbl9fX0NTU19MT0FERVJfRVhQT1JUX19fLnB1c2goW21vZHVsZS5pZCwgXCIubWFuYSB7XFxuICAgIGJhY2tncm91bmQtaW1hZ2U6IHVybChcIiArIF9fX0NTU19MT0FERVJfVVJMX1JFUExBQ0VNRU5UXzBfX18gKyBcIik7XFxuICAgIGJhY2tncm91bmQtcmVwZWF0OiBuby1yZXBlYXQ7XFxuICAgIGJhY2tncm91bmQtc2l6ZTogYXV0byA3MDAlO1xcbiAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICAgIGZvbnQtc2l6ZTogMTAwJTtcXG59XFxuXFxuLm1hbmEueHMge1xcbiAgICB3aWR0aDogMS41cmVtO1xcbiAgICBoZWlnaHQ6IDEuNXJlbTtcXG59XFxuXFxuLm1hbmEuc21hbGwge1xcbiAgICBoZWlnaHQ6IDJyZW07XFxuICAgIHdpZHRoOiAycmVtO1xcbn1cXG4ubWFuYS5tZWRpdW0ge1xcbiAgICBoZWlnaHQ6IDJlbTtcXG4gICAgd2lkdGg6IDJlbTtcXG59XFxuLm1hbmEubGFyZ2Uge1xcbiAgICBoZWlnaHQ6IDRlbTtcXG4gICAgd2lkdGg6IDRlbTtcXG59XFxuLm1hbmEucyB7IGJhY2tncm91bmQtcG9zaXRpb246IDAgMDsgfVxcbi5tYW5hLnMxIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMTEuMSUgMDsgfVxcbi5tYW5hLnMyIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMjIuMiUgMDsgfVxcbi5tYW5hLnMzIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMzMuMyUgMDsgfVxcbi5tYW5hLnM0IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNDQuNCUgMDsgfVxcbi5tYW5hLnM1IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNTUuNSUgMDsgfVxcbi5tYW5hLnM2IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNjYuNiUgMDsgfVxcbi5tYW5hLnM3IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNzcuNyUgMDsgfVxcbi5tYW5hLnM4IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogODguOCUgMDsgfVxcbi5tYW5hLnM5IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogOTkuOSUgMDsgfVxcblxcbi5tYW5hLnMxMCB7IGJhY2tncm91bmQtcG9zaXRpb246IDAgMTYlOyB9XFxuLm1hbmEuczExIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMTEuMSUgMTYuNiU7IH1cXG4ubWFuYS5zMTIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAyMi4yJSAxNi42JTsgfVxcbi5tYW5hLnMxMyB7IGJhY2tncm91bmQtcG9zaXRpb246IDMzLjMlIDE2LjYlOyB9XFxuLm1hbmEuczE0IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNDQuNCUgMTYuNiU7IH1cXG4ubWFuYS5zMTUgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA1NS41JSAxNi42JTsgfVxcbi5tYW5hLnMxNiB7IGJhY2tncm91bmQtcG9zaXRpb246IDY2LjYlIDE2LjYlOyB9XFxuLm1hbmEuczE3IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNzcuNyUgMTYuNiU7IH1cXG4ubWFuYS5zMTggeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4OC44JSAxNi42JTsgfVxcbi5tYW5hLnMxOSB7IGJhY2tncm91bmQtcG9zaXRpb246IDk5LjklIDE2LjYlOyB9XFxuXFxuLm1hbmEuczIwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMCAzMyU7IH1cXG4ubWFuYS5zeCB7IGJhY2tncm91bmQtcG9zaXRpb246IDExLjElIDMzLjMlOyB9XFxuLm1hbmEuc3kgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAyMi4yJSAzMy4zJTsgfVxcbi5tYW5hLnN6IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMzMuMyUgMzMuMyU7IH1cXG4ubWFuYS5zdyB7IGJhY2tncm91bmQtcG9zaXRpb246IDQ0LjQlIDMzLjMlOyB9XFxuLm1hbmEuc3UgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA1NS41JSAzMy4zJTsgfVxcbi5tYW5hLnNiIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNjYuNiUgMzMuMyU7IH1cXG4ubWFuYS5zciB7IGJhY2tncm91bmQtcG9zaXRpb246IDc3LjclIDMzLjMlOyB9XFxuLm1hbmEuc2cgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4OC44JSAzMy4zJTsgfVxcbi5tYW5hLnNzIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogOTkuOSUgMzMuMyU7IH1cXG5cXG4ubWFuYS5zd3UgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwIDUwJTsgfVxcbi5tYW5hLnN3YiB7IGJhY2tncm91bmQtcG9zaXRpb246IDExLjElIDUwJTsgfVxcbi5tYW5hLnN1YiB7IGJhY2tncm91bmQtcG9zaXRpb246IDIyLjIlIDUwJTsgfVxcbi5tYW5hLnN1ciB7IGJhY2tncm91bmQtcG9zaXRpb246IDMzLjMlIDUwJTsgfVxcbi5tYW5hLnNiciB7IGJhY2tncm91bmQtcG9zaXRpb246IDQ0LjQlIDUwJTsgfVxcbi5tYW5hLnNiZyB7IGJhY2tncm91bmQtcG9zaXRpb246IDU1LjUlIDUwJTsgfVxcbi5tYW5hLnNydyB7IGJhY2tncm91bmQtcG9zaXRpb246IDY2LjYlIDUwJTsgfVxcbi5tYW5hLnNyZyB7IGJhY2tncm91bmQtcG9zaXRpb246IDc3LjclIDUwJTsgfVxcbi5tYW5hLnNndyB7IGJhY2tncm91bmQtcG9zaXRpb246IDg4LjglIDUwJTsgfVxcbi5tYW5hLnNndSB7IGJhY2tncm91bmQtcG9zaXRpb246IDk5LjklIDUwJTsgfVxcblxcbi5tYW5hLnMydyB7IGJhY2tncm91bmQtcG9zaXRpb246IDAgNjYuNiU7IH1cXG4ubWFuYS5zMnUgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAxMS4xJSA2Ni42JTsgfVxcbi5tYW5hLnMyYiB7IGJhY2tncm91bmQtcG9zaXRpb246IDIyLjIlIDY2LjYlOyB9XFxuLm1hbmEuczJyIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMzMuMyUgNjYuNiU7IH1cXG4ubWFuYS5zMmcgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA0NC40JSA2Ni42JTsgfVxcbi5tYW5hLnN3cCB7IGJhY2tncm91bmQtcG9zaXRpb246IDU1LjUlIDY2LjYlOyB9XFxuLm1hbmEuc3VwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNjYuNiUgNjYuNiU7IH1cXG4ubWFuYS5zYnAgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA3Ny43JSA2Ni42JTsgfVxcbi5tYW5hLnNycCB7IGJhY2tncm91bmQtcG9zaXRpb246IDg4LjglIDY2LjYlOyB9XFxuLm1hbmEuc2dwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogOTkuOSUgNjYuNiU7IH1cXG5cXG4ubWFuYS5zdCB7IGJhY2tncm91bmQtcG9zaXRpb246IDAlIDgzLjMlOyB9XFxuLm1hbmEuc3EgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAxMS4xJSA4My4zJTsgfVxcblxcbi5tYW5hLnNjIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNzcuNyUgODMuMyU7IH1cXG5cXG4ubWFuYS5zZSB7IGJhY2tncm91bmQtcG9zaXRpb246IDg4LjglIDgzLjMlOyB9XFxuXFxuLm1hbmEuczEwMDAwMDAgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwIDEwMCU7IH1cXG4ubWFuYS5zMTAwMDAwMC5zbWFsbCB7IHdpZHRoOiA0LjllbTsgfVxcbi5tYW5hLnMxMDAwMDAwLm1lZGl1bSB7IHdpZHRoOiA5LjdlbTsgfVxcbi8qLm1hbmEuczEwMDAwMDAubGFyZ2UgeyB3aWR0aDogMTguOGVtOyB9Ki9cXG4ubWFuYS5zMTAwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNjAlIDEwMCU7IH1cXG4ubWFuYS5zMTAwLnNtYWxsIHsgd2lkdGg6IDEuOGVtOyB9XFxuLm1hbmEuczEwMC5tZWRpdW0geyB3aWR0aDogMy43ZW07IH1cXG4vKi5tYW5hLnMxMDAubGFyZ2UgeyB3aWR0aDogMTAuOGVtOyB9Ki9cXG4ubWFuYS5zY2hhb3MgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA3Ni41JSAxMDAlOyB9XFxuLm1hbmEuc2NoYW9zLnNtYWxsIHsgd2lkdGg6IDEuMmVtOyB9XFxuLm1hbmEuc2NoYW9zLm1lZGl1bSB7IHdpZHRoOiAyLjNlbTsgfVxcbi8qLm1hbmEuc2MubGFyZ2UgeyB3aWR0aDogNC42ZW07IH0qL1xcbi5tYW5hLnNodyB7IGJhY2tncm91bmQtcG9zaXRpb246IDgzLjUlIDEwMCU7IH1cXG4ubWFuYS5zaHcuc21hbGwgeyB3aWR0aDogMC41ZW07IH1cXG4ubWFuYS5zaHcubWVkaXVtIHsgd2lkdGg6IDFlbTsgfVxcbi8qLm1hbmEuc2h3LmxhcmdlIHsgd2lkdGg6IDJlbTsgfSovXFxuLm1hbmEuc2hyIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogODklIDEwMCU7IH1cXG4ubWFuYS5zaHIuc21hbGwgeyB3aWR0aDogMC41ZW07IH1cXG4ubWFuYS5zaHIubWVkaXVtIHsgd2lkdGg6IDFlbTsgfVxcbi8qLm1hbmEuc2hyLmxhcmdlIHsgd2lkdGg6IDJlbTsgfSovXFxuXFxuXFxuLnNoYWRvdyB7XFxuICAgIGZpbHRlcjogXFxcInByb2dpZDpEWEltYWdlVHJhbnNmb3JtLk1pY3Jvc29mdC5Ecm9wc2hhZG93KE9mZlg9LTEsIE9mZlk9MSwgQ29sb3I9JyMwMDAnKVxcXCI7XFxuICAgIGZpbHRlcjogdXJsKCNzaGFkb3cpO1xcbiAgICAtd2Via2l0LWZpbHRlcjogZHJvcC1zaGFkb3coLTFweCAxcHggMHB4ICMwMDApO1xcbiAgICBmaWx0ZXI6IGRyb3Atc2hhZG93KC0xcHggMXB4IDBweCAjMDAwKTtcXG59XCIsIFwiXCIse1widmVyc2lvblwiOjMsXCJzb3VyY2VzXCI6W1wid2VicGFjazovLy4vc3JjL2Nzcy92ZW5kb3IvbWFuYS5jc3NcIl0sXCJuYW1lc1wiOltdLFwibWFwcGluZ3NcIjpcIkFBQUE7SUFDSSx5REFBd0Q7SUFDeEQsNEJBQTRCO0lBQzVCLDBCQUEwQjtJQUMxQixxQkFBcUI7SUFDckIsZUFBZTtBQUNuQjs7QUFFQTtJQUNJLGFBQWE7SUFDYixjQUFjO0FBQ2xCOztBQUVBO0lBQ0ksWUFBWTtJQUNaLFdBQVc7QUFDZjtBQUNBO0lBQ0ksV0FBVztJQUNYLFVBQVU7QUFDZDtBQUNBO0lBQ0ksV0FBVztJQUNYLFVBQVU7QUFDZDtBQUNBLFVBQVUsd0JBQXdCLEVBQUU7QUFDcEMsV0FBVyw0QkFBNEIsRUFBRTtBQUN6QyxXQUFXLDRCQUE0QixFQUFFO0FBQ3pDLFdBQVcsNEJBQTRCLEVBQUU7QUFDekMsV0FBVyw0QkFBNEIsRUFBRTtBQUN6QyxXQUFXLDRCQUE0QixFQUFFO0FBQ3pDLFdBQVcsNEJBQTRCLEVBQUU7QUFDekMsV0FBVyw0QkFBNEIsRUFBRTtBQUN6QyxXQUFXLDRCQUE0QixFQUFFO0FBQ3pDLFdBQVcsNEJBQTRCLEVBQUU7O0FBRXpDLFlBQVksMEJBQTBCLEVBQUU7QUFDeEMsWUFBWSxnQ0FBZ0MsRUFBRTtBQUM5QyxZQUFZLGdDQUFnQyxFQUFFO0FBQzlDLFlBQVksZ0NBQWdDLEVBQUU7QUFDOUMsWUFBWSxnQ0FBZ0MsRUFBRTtBQUM5QyxZQUFZLGdDQUFnQyxFQUFFO0FBQzlDLFlBQVksZ0NBQWdDLEVBQUU7QUFDOUMsWUFBWSxnQ0FBZ0MsRUFBRTtBQUM5QyxZQUFZLGdDQUFnQyxFQUFFO0FBQzlDLFlBQVksZ0NBQWdDLEVBQUU7O0FBRTlDLFlBQVksMEJBQTBCLEVBQUU7QUFDeEMsV0FBVyxnQ0FBZ0MsRUFBRTtBQUM3QyxXQUFXLGdDQUFnQyxFQUFFO0FBQzdDLFdBQVcsZ0NBQWdDLEVBQUU7QUFDN0MsV0FBVyxnQ0FBZ0MsRUFBRTtBQUM3QyxXQUFXLGdDQUFnQyxFQUFFO0FBQzdDLFdBQVcsZ0NBQWdDLEVBQUU7QUFDN0MsV0FBVyxnQ0FBZ0MsRUFBRTtBQUM3QyxXQUFXLGdDQUFnQyxFQUFFO0FBQzdDLFdBQVcsZ0NBQWdDLEVBQUU7O0FBRTdDLFlBQVksMEJBQTBCLEVBQUU7QUFDeEMsWUFBWSw4QkFBOEIsRUFBRTtBQUM1QyxZQUFZLDhCQUE4QixFQUFFO0FBQzVDLFlBQVksOEJBQThCLEVBQUU7QUFDNUMsWUFBWSw4QkFBOEIsRUFBRTtBQUM1QyxZQUFZLDhCQUE4QixFQUFFO0FBQzVDLFlBQVksOEJBQThCLEVBQUU7QUFDNUMsWUFBWSw4QkFBOEIsRUFBRTtBQUM1QyxZQUFZLDhCQUE4QixFQUFFO0FBQzVDLFlBQVksOEJBQThCLEVBQUU7O0FBRTVDLFlBQVksNEJBQTRCLEVBQUU7QUFDMUMsWUFBWSxnQ0FBZ0MsRUFBRTtBQUM5QyxZQUFZLGdDQUFnQyxFQUFFO0FBQzlDLFlBQVksZ0NBQWdDLEVBQUU7QUFDOUMsWUFBWSxnQ0FBZ0MsRUFBRTtBQUM5QyxZQUFZLGdDQUFnQyxFQUFFO0FBQzlDLFlBQVksZ0NBQWdDLEVBQUU7QUFDOUMsWUFBWSxnQ0FBZ0MsRUFBRTtBQUM5QyxZQUFZLGdDQUFnQyxFQUFFO0FBQzlDLFlBQVksZ0NBQWdDLEVBQUU7O0FBRTlDLFdBQVcsNkJBQTZCLEVBQUU7QUFDMUMsV0FBVyxnQ0FBZ0MsRUFBRTs7QUFFN0MsV0FBVyxnQ0FBZ0MsRUFBRTs7QUFFN0MsV0FBVyxnQ0FBZ0MsRUFBRTs7QUFFN0MsaUJBQWlCLDJCQUEyQixFQUFFO0FBQzlDLHVCQUF1QixZQUFZLEVBQUU7QUFDckMsd0JBQXdCLFlBQVksRUFBRTtBQUN0QywwQ0FBMEM7QUFDMUMsYUFBYSw2QkFBNkIsRUFBRTtBQUM1QyxtQkFBbUIsWUFBWSxFQUFFO0FBQ2pDLG9CQUFvQixZQUFZLEVBQUU7QUFDbEMsc0NBQXNDO0FBQ3RDLGVBQWUsK0JBQStCLEVBQUU7QUFDaEQscUJBQXFCLFlBQVksRUFBRTtBQUNuQyxzQkFBc0IsWUFBWSxFQUFFO0FBQ3BDLG1DQUFtQztBQUNuQyxZQUFZLCtCQUErQixFQUFFO0FBQzdDLGtCQUFrQixZQUFZLEVBQUU7QUFDaEMsbUJBQW1CLFVBQVUsRUFBRTtBQUMvQixrQ0FBa0M7QUFDbEMsWUFBWSw2QkFBNkIsRUFBRTtBQUMzQyxrQkFBa0IsWUFBWSxFQUFFO0FBQ2hDLG1CQUFtQixVQUFVLEVBQUU7QUFDL0Isa0NBQWtDOzs7QUFHbEM7SUFDSSxxRkFBcUY7SUFDckYsb0JBQW9CO0lBQ3BCLDhDQUE4QztJQUM5QyxzQ0FBc0M7QUFDMUNcIixcInNvdXJjZXNDb250ZW50XCI6W1wiLm1hbmEge1xcbiAgICBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoJy4uLy4uL2ltZy9tYW5hLXN5bWJvbHMvbWFuYS5zdmcnKTtcXG4gICAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcXG4gICAgYmFja2dyb3VuZC1zaXplOiBhdXRvIDcwMCU7XFxuICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gICAgZm9udC1zaXplOiAxMDAlO1xcbn1cXG5cXG4ubWFuYS54cyB7XFxuICAgIHdpZHRoOiAxLjVyZW07XFxuICAgIGhlaWdodDogMS41cmVtO1xcbn1cXG5cXG4ubWFuYS5zbWFsbCB7XFxuICAgIGhlaWdodDogMnJlbTtcXG4gICAgd2lkdGg6IDJyZW07XFxufVxcbi5tYW5hLm1lZGl1bSB7XFxuICAgIGhlaWdodDogMmVtO1xcbiAgICB3aWR0aDogMmVtO1xcbn1cXG4ubWFuYS5sYXJnZSB7XFxuICAgIGhlaWdodDogNGVtO1xcbiAgICB3aWR0aDogNGVtO1xcbn1cXG4ubWFuYS5zIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMCAwOyB9XFxuLm1hbmEuczEgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAxMS4xJSAwOyB9XFxuLm1hbmEuczIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAyMi4yJSAwOyB9XFxuLm1hbmEuczMgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAzMy4zJSAwOyB9XFxuLm1hbmEuczQgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA0NC40JSAwOyB9XFxuLm1hbmEuczUgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA1NS41JSAwOyB9XFxuLm1hbmEuczYgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA2Ni42JSAwOyB9XFxuLm1hbmEuczcgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA3Ny43JSAwOyB9XFxuLm1hbmEuczggeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4OC44JSAwOyB9XFxuLm1hbmEuczkgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA5OS45JSAwOyB9XFxuXFxuLm1hbmEuczEwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMCAxNiU7IH1cXG4ubWFuYS5zMTEgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAxMS4xJSAxNi42JTsgfVxcbi5tYW5hLnMxMiB7IGJhY2tncm91bmQtcG9zaXRpb246IDIyLjIlIDE2LjYlOyB9XFxuLm1hbmEuczEzIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMzMuMyUgMTYuNiU7IH1cXG4ubWFuYS5zMTQgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA0NC40JSAxNi42JTsgfVxcbi5tYW5hLnMxNSB7IGJhY2tncm91bmQtcG9zaXRpb246IDU1LjUlIDE2LjYlOyB9XFxuLm1hbmEuczE2IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNjYuNiUgMTYuNiU7IH1cXG4ubWFuYS5zMTcgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA3Ny43JSAxNi42JTsgfVxcbi5tYW5hLnMxOCB7IGJhY2tncm91bmQtcG9zaXRpb246IDg4LjglIDE2LjYlOyB9XFxuLm1hbmEuczE5IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogOTkuOSUgMTYuNiU7IH1cXG5cXG4ubWFuYS5zMjAgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwIDMzJTsgfVxcbi5tYW5hLnN4IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMTEuMSUgMzMuMyU7IH1cXG4ubWFuYS5zeSB7IGJhY2tncm91bmQtcG9zaXRpb246IDIyLjIlIDMzLjMlOyB9XFxuLm1hbmEuc3ogeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAzMy4zJSAzMy4zJTsgfVxcbi5tYW5hLnN3IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNDQuNCUgMzMuMyU7IH1cXG4ubWFuYS5zdSB7IGJhY2tncm91bmQtcG9zaXRpb246IDU1LjUlIDMzLjMlOyB9XFxuLm1hbmEuc2IgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA2Ni42JSAzMy4zJTsgfVxcbi5tYW5hLnNyIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNzcuNyUgMzMuMyU7IH1cXG4ubWFuYS5zZyB7IGJhY2tncm91bmQtcG9zaXRpb246IDg4LjglIDMzLjMlOyB9XFxuLm1hbmEuc3MgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA5OS45JSAzMy4zJTsgfVxcblxcbi5tYW5hLnN3dSB7IGJhY2tncm91bmQtcG9zaXRpb246IDAgNTAlOyB9XFxuLm1hbmEuc3diIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMTEuMSUgNTAlOyB9XFxuLm1hbmEuc3ViIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMjIuMiUgNTAlOyB9XFxuLm1hbmEuc3VyIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMzMuMyUgNTAlOyB9XFxuLm1hbmEuc2JyIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNDQuNCUgNTAlOyB9XFxuLm1hbmEuc2JnIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNTUuNSUgNTAlOyB9XFxuLm1hbmEuc3J3IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNjYuNiUgNTAlOyB9XFxuLm1hbmEuc3JnIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNzcuNyUgNTAlOyB9XFxuLm1hbmEuc2d3IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogODguOCUgNTAlOyB9XFxuLm1hbmEuc2d1IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogOTkuOSUgNTAlOyB9XFxuXFxuLm1hbmEuczJ3IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMCA2Ni42JTsgfVxcbi5tYW5hLnMydSB7IGJhY2tncm91bmQtcG9zaXRpb246IDExLjElIDY2LjYlOyB9XFxuLm1hbmEuczJiIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMjIuMiUgNjYuNiU7IH1cXG4ubWFuYS5zMnIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAzMy4zJSA2Ni42JTsgfVxcbi5tYW5hLnMyZyB7IGJhY2tncm91bmQtcG9zaXRpb246IDQ0LjQlIDY2LjYlOyB9XFxuLm1hbmEuc3dwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNTUuNSUgNjYuNiU7IH1cXG4ubWFuYS5zdXAgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA2Ni42JSA2Ni42JTsgfVxcbi5tYW5hLnNicCB7IGJhY2tncm91bmQtcG9zaXRpb246IDc3LjclIDY2LjYlOyB9XFxuLm1hbmEuc3JwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogODguOCUgNjYuNiU7IH1cXG4ubWFuYS5zZ3AgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA5OS45JSA2Ni42JTsgfVxcblxcbi5tYW5hLnN0IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMCUgODMuMyU7IH1cXG4ubWFuYS5zcSB7IGJhY2tncm91bmQtcG9zaXRpb246IDExLjElIDgzLjMlOyB9XFxuXFxuLm1hbmEuc2MgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA3Ny43JSA4My4zJTsgfVxcblxcbi5tYW5hLnNlIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogODguOCUgODMuMyU7IH1cXG5cXG4ubWFuYS5zMTAwMDAwMCB7IGJhY2tncm91bmQtcG9zaXRpb246IDAgMTAwJTsgfVxcbi5tYW5hLnMxMDAwMDAwLnNtYWxsIHsgd2lkdGg6IDQuOWVtOyB9XFxuLm1hbmEuczEwMDAwMDAubWVkaXVtIHsgd2lkdGg6IDkuN2VtOyB9XFxuLyoubWFuYS5zMTAwMDAwMC5sYXJnZSB7IHdpZHRoOiAxOC44ZW07IH0qL1xcbi5tYW5hLnMxMDAgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA2MCUgMTAwJTsgfVxcbi5tYW5hLnMxMDAuc21hbGwgeyB3aWR0aDogMS44ZW07IH1cXG4ubWFuYS5zMTAwLm1lZGl1bSB7IHdpZHRoOiAzLjdlbTsgfVxcbi8qLm1hbmEuczEwMC5sYXJnZSB7IHdpZHRoOiAxMC44ZW07IH0qL1xcbi5tYW5hLnNjaGFvcyB7IGJhY2tncm91bmQtcG9zaXRpb246IDc2LjUlIDEwMCU7IH1cXG4ubWFuYS5zY2hhb3Muc21hbGwgeyB3aWR0aDogMS4yZW07IH1cXG4ubWFuYS5zY2hhb3MubWVkaXVtIHsgd2lkdGg6IDIuM2VtOyB9XFxuLyoubWFuYS5zYy5sYXJnZSB7IHdpZHRoOiA0LjZlbTsgfSovXFxuLm1hbmEuc2h3IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogODMuNSUgMTAwJTsgfVxcbi5tYW5hLnNody5zbWFsbCB7IHdpZHRoOiAwLjVlbTsgfVxcbi5tYW5hLnNody5tZWRpdW0geyB3aWR0aDogMWVtOyB9XFxuLyoubWFuYS5zaHcubGFyZ2UgeyB3aWR0aDogMmVtOyB9Ki9cXG4ubWFuYS5zaHIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4OSUgMTAwJTsgfVxcbi5tYW5hLnNoci5zbWFsbCB7IHdpZHRoOiAwLjVlbTsgfVxcbi5tYW5hLnNoci5tZWRpdW0geyB3aWR0aDogMWVtOyB9XFxuLyoubWFuYS5zaHIubGFyZ2UgeyB3aWR0aDogMmVtOyB9Ki9cXG5cXG5cXG4uc2hhZG93IHtcXG4gICAgZmlsdGVyOiBcXFwicHJvZ2lkOkRYSW1hZ2VUcmFuc2Zvcm0uTWljcm9zb2Z0LkRyb3BzaGFkb3coT2ZmWD0tMSwgT2ZmWT0xLCBDb2xvcj0nIzAwMCcpXFxcIjtcXG4gICAgZmlsdGVyOiB1cmwoI3NoYWRvdyk7XFxuICAgIC13ZWJraXQtZmlsdGVyOiBkcm9wLXNoYWRvdygtMXB4IDFweCAwcHggIzAwMCk7XFxuICAgIGZpbHRlcjogZHJvcC1zaGFkb3coLTFweCAxcHggMHB4ICMwMDApO1xcbn1cIl0sXCJzb3VyY2VSb290XCI6XCJcIn1dKTtcbi8vIEV4cG9ydHNcbmV4cG9ydCBkZWZhdWx0IF9fX0NTU19MT0FERVJfRVhQT1JUX19fO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4gIE1JVCBMaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4gIEF1dGhvciBUb2JpYXMgS29wcGVycyBAc29rcmFcbiovXG4vLyBjc3MgYmFzZSBjb2RlLCBpbmplY3RlZCBieSB0aGUgY3NzLWxvYWRlclxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGZ1bmMtbmFtZXNcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcpIHtcbiAgdmFyIGxpc3QgPSBbXTsgLy8gcmV0dXJuIHRoZSBsaXN0IG9mIG1vZHVsZXMgYXMgY3NzIHN0cmluZ1xuXG4gIGxpc3QudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHZhciBjb250ZW50ID0gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtKTtcblxuICAgICAgaWYgKGl0ZW1bMl0pIHtcbiAgICAgICAgcmV0dXJuIFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpLmNvbmNhdChjb250ZW50LCBcIn1cIik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjb250ZW50O1xuICAgIH0pLmpvaW4oJycpO1xuICB9OyAvLyBpbXBvcnQgYSBsaXN0IG9mIG1vZHVsZXMgaW50byB0aGUgbGlzdFxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuXG5cbiAgbGlzdC5pID0gZnVuY3Rpb24gKG1vZHVsZXMsIG1lZGlhUXVlcnksIGRlZHVwZSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlcyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICAgICAgbW9kdWxlcyA9IFtbbnVsbCwgbW9kdWxlcywgJyddXTtcbiAgICB9XG5cbiAgICB2YXIgYWxyZWFkeUltcG9ydGVkTW9kdWxlcyA9IHt9O1xuXG4gICAgaWYgKGRlZHVwZSkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBwcmVmZXItZGVzdHJ1Y3R1cmluZ1xuICAgICAgICB2YXIgaWQgPSB0aGlzW2ldWzBdO1xuXG4gICAgICAgIGlmIChpZCAhPSBudWxsKSB7XG4gICAgICAgICAgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpZF0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IG1vZHVsZXMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICB2YXIgaXRlbSA9IFtdLmNvbmNhdChtb2R1bGVzW19pXSk7XG5cbiAgICAgIGlmIChkZWR1cGUgJiYgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpdGVtWzBdXSkge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29udGludWVcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChtZWRpYVF1ZXJ5KSB7XG4gICAgICAgIGlmICghaXRlbVsyXSkge1xuICAgICAgICAgIGl0ZW1bMl0gPSBtZWRpYVF1ZXJ5O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMl0gPSBcIlwiLmNvbmNhdChtZWRpYVF1ZXJ5LCBcIiBhbmQgXCIpLmNvbmNhdChpdGVtWzJdKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBsaXN0LnB1c2goaXRlbSk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBsaXN0O1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gX3NsaWNlZFRvQXJyYXkoYXJyLCBpKSB7IHJldHVybiBfYXJyYXlXaXRoSG9sZXMoYXJyKSB8fCBfaXRlcmFibGVUb0FycmF5TGltaXQoYXJyLCBpKSB8fCBfdW5zdXBwb3J0ZWRJdGVyYWJsZVRvQXJyYXkoYXJyLCBpKSB8fCBfbm9uSXRlcmFibGVSZXN0KCk7IH1cblxuZnVuY3Rpb24gX25vbkl0ZXJhYmxlUmVzdCgpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgYXR0ZW1wdCB0byBkZXN0cnVjdHVyZSBub24taXRlcmFibGUgaW5zdGFuY2UuXFxuSW4gb3JkZXIgdG8gYmUgaXRlcmFibGUsIG5vbi1hcnJheSBvYmplY3RzIG11c3QgaGF2ZSBhIFtTeW1ib2wuaXRlcmF0b3JdKCkgbWV0aG9kLlwiKTsgfVxuXG5mdW5jdGlvbiBfdW5zdXBwb3J0ZWRJdGVyYWJsZVRvQXJyYXkobywgbWluTGVuKSB7IGlmICghbykgcmV0dXJuOyBpZiAodHlwZW9mIG8gPT09IFwic3RyaW5nXCIpIHJldHVybiBfYXJyYXlMaWtlVG9BcnJheShvLCBtaW5MZW4pOyB2YXIgbiA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKS5zbGljZSg4LCAtMSk7IGlmIChuID09PSBcIk9iamVjdFwiICYmIG8uY29uc3RydWN0b3IpIG4gPSBvLmNvbnN0cnVjdG9yLm5hbWU7IGlmIChuID09PSBcIk1hcFwiIHx8IG4gPT09IFwiU2V0XCIpIHJldHVybiBBcnJheS5mcm9tKG8pOyBpZiAobiA9PT0gXCJBcmd1bWVudHNcIiB8fCAvXig/OlVpfEkpbnQoPzo4fDE2fDMyKSg/OkNsYW1wZWQpP0FycmF5JC8udGVzdChuKSkgcmV0dXJuIF9hcnJheUxpa2VUb0FycmF5KG8sIG1pbkxlbik7IH1cblxuZnVuY3Rpb24gX2FycmF5TGlrZVRvQXJyYXkoYXJyLCBsZW4pIHsgaWYgKGxlbiA9PSBudWxsIHx8IGxlbiA+IGFyci5sZW5ndGgpIGxlbiA9IGFyci5sZW5ndGg7IGZvciAodmFyIGkgPSAwLCBhcnIyID0gbmV3IEFycmF5KGxlbik7IGkgPCBsZW47IGkrKykgeyBhcnIyW2ldID0gYXJyW2ldOyB9IHJldHVybiBhcnIyOyB9XG5cbmZ1bmN0aW9uIF9pdGVyYWJsZVRvQXJyYXlMaW1pdChhcnIsIGkpIHsgaWYgKHR5cGVvZiBTeW1ib2wgPT09IFwidW5kZWZpbmVkXCIgfHwgIShTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KGFycikpKSByZXR1cm47IHZhciBfYXJyID0gW107IHZhciBfbiA9IHRydWU7IHZhciBfZCA9IGZhbHNlOyB2YXIgX2UgPSB1bmRlZmluZWQ7IHRyeSB7IGZvciAodmFyIF9pID0gYXJyW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3M7ICEoX24gPSAoX3MgPSBfaS5uZXh0KCkpLmRvbmUpOyBfbiA9IHRydWUpIHsgX2Fyci5wdXNoKF9zLnZhbHVlKTsgaWYgKGkgJiYgX2Fyci5sZW5ndGggPT09IGkpIGJyZWFrOyB9IH0gY2F0Y2ggKGVycikgeyBfZCA9IHRydWU7IF9lID0gZXJyOyB9IGZpbmFsbHkgeyB0cnkgeyBpZiAoIV9uICYmIF9pW1wicmV0dXJuXCJdICE9IG51bGwpIF9pW1wicmV0dXJuXCJdKCk7IH0gZmluYWxseSB7IGlmIChfZCkgdGhyb3cgX2U7IH0gfSByZXR1cm4gX2FycjsgfVxuXG5mdW5jdGlvbiBfYXJyYXlXaXRoSG9sZXMoYXJyKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHJldHVybiBhcnI7IH1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKGl0ZW0pIHtcbiAgdmFyIF9pdGVtID0gX3NsaWNlZFRvQXJyYXkoaXRlbSwgNCksXG4gICAgICBjb250ZW50ID0gX2l0ZW1bMV0sXG4gICAgICBjc3NNYXBwaW5nID0gX2l0ZW1bM107XG5cbiAgaWYgKHR5cGVvZiBidG9hID09PSAnZnVuY3Rpb24nKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG4gICAgdmFyIGJhc2U2NCA9IGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KGNzc01hcHBpbmcpKSkpO1xuICAgIHZhciBkYXRhID0gXCJzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04O2Jhc2U2NCxcIi5jb25jYXQoYmFzZTY0KTtcbiAgICB2YXIgc291cmNlTWFwcGluZyA9IFwiLyojIFwiLmNvbmNhdChkYXRhLCBcIiAqL1wiKTtcbiAgICB2YXIgc291cmNlVVJMcyA9IGNzc01hcHBpbmcuc291cmNlcy5tYXAoZnVuY3Rpb24gKHNvdXJjZSkge1xuICAgICAgcmV0dXJuIFwiLyojIHNvdXJjZVVSTD1cIi5jb25jYXQoY3NzTWFwcGluZy5zb3VyY2VSb290IHx8ICcnKS5jb25jYXQoc291cmNlLCBcIiAqL1wiKTtcbiAgICB9KTtcbiAgICByZXR1cm4gW2NvbnRlbnRdLmNvbmNhdChzb3VyY2VVUkxzKS5jb25jYXQoW3NvdXJjZU1hcHBpbmddKS5qb2luKCdcXG4nKTtcbiAgfVxuXG4gIHJldHVybiBbY29udGVudF0uam9pbignXFxuJyk7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh1cmwsIG9wdGlvbnMpIHtcbiAgaWYgKCFvcHRpb25zKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gICAgb3B0aW9ucyA9IHt9O1xuICB9IC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlcnNjb3JlLWRhbmdsZSwgbm8tcGFyYW0tcmVhc3NpZ25cblxuXG4gIHVybCA9IHVybCAmJiB1cmwuX19lc01vZHVsZSA/IHVybC5kZWZhdWx0IDogdXJsO1xuXG4gIGlmICh0eXBlb2YgdXJsICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiB1cmw7XG4gIH0gLy8gSWYgdXJsIGlzIGFscmVhZHkgd3JhcHBlZCBpbiBxdW90ZXMsIHJlbW92ZSB0aGVtXG5cblxuICBpZiAoL15bJ1wiXS4qWydcIl0kLy50ZXN0KHVybCkpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgICB1cmwgPSB1cmwuc2xpY2UoMSwgLTEpO1xuICB9XG5cbiAgaWYgKG9wdGlvbnMuaGFzaCkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICAgIHVybCArPSBvcHRpb25zLmhhc2g7XG4gIH0gLy8gU2hvdWxkIHVybCBiZSB3cmFwcGVkP1xuICAvLyBTZWUgaHR0cHM6Ly9kcmFmdHMuY3Nzd2cub3JnL2Nzcy12YWx1ZXMtMy8jdXJsc1xuXG5cbiAgaWYgKC9bXCInKCkgXFx0XFxuXS8udGVzdCh1cmwpIHx8IG9wdGlvbnMubmVlZFF1b3Rlcykge1xuICAgIHJldHVybiBcIlxcXCJcIi5jb25jYXQodXJsLnJlcGxhY2UoL1wiL2csICdcXFxcXCInKS5yZXBsYWNlKC9cXG4vZywgJ1xcXFxuJyksIFwiXFxcIlwiKTtcbiAgfVxuXG4gIHJldHVybiB1cmw7XG59OyIsImV4cG9ydCBkZWZhdWx0IF9fd2VicGFja19wdWJsaWNfcGF0aF9fICsgXCI4ZjRiOWQwNDc2ZTYyMGQxZmVmNTBjOTUwNDQzNjQ1Ni5zdmdcIjsiLCJleHBvcnQgZGVmYXVsdCBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiYzg5YTAzMDVjNmViZmYzODU4ODc4ZGY2MTM2ODc2N2Euc3ZnXCI7IiwiaW1wb3J0IGFwaSBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qc1wiO1xuICAgICAgICAgICAgaW1wb3J0IGNvbnRlbnQgZnJvbSBcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi9zdHlsZS5jc3NcIjtcblxudmFyIG9wdGlvbnMgPSB7fTtcblxub3B0aW9ucy5pbnNlcnQgPSBcImhlYWRcIjtcbm9wdGlvbnMuc2luZ2xldG9uID0gZmFsc2U7XG5cbnZhciB1cGRhdGUgPSBhcGkoY29udGVudCwgb3B0aW9ucyk7XG5cblxuXG5leHBvcnQgZGVmYXVsdCBjb250ZW50LmxvY2FscyB8fCB7fTsiLCJpbXBvcnQgYXBpIGZyb20gXCIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzXCI7XG4gICAgICAgICAgICBpbXBvcnQgY29udGVudCBmcm9tIFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL21hbmEuY3NzXCI7XG5cbnZhciBvcHRpb25zID0ge307XG5cbm9wdGlvbnMuaW5zZXJ0ID0gXCJoZWFkXCI7XG5vcHRpb25zLnNpbmdsZXRvbiA9IGZhbHNlO1xuXG52YXIgdXBkYXRlID0gYXBpKGNvbnRlbnQsIG9wdGlvbnMpO1xuXG5cblxuZXhwb3J0IGRlZmF1bHQgY29udGVudC5sb2NhbHMgfHwge307IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBpc09sZElFID0gZnVuY3Rpb24gaXNPbGRJRSgpIHtcbiAgdmFyIG1lbW87XG4gIHJldHVybiBmdW5jdGlvbiBtZW1vcml6ZSgpIHtcbiAgICBpZiAodHlwZW9mIG1lbW8gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAvLyBUZXN0IGZvciBJRSA8PSA5IGFzIHByb3Bvc2VkIGJ5IEJyb3dzZXJoYWNrc1xuICAgICAgLy8gQHNlZSBodHRwOi8vYnJvd3NlcmhhY2tzLmNvbS8jaGFjay1lNzFkODY5MmY2NTMzNDE3M2ZlZTcxNWMyMjJjYjgwNVxuICAgICAgLy8gVGVzdHMgZm9yIGV4aXN0ZW5jZSBvZiBzdGFuZGFyZCBnbG9iYWxzIGlzIHRvIGFsbG93IHN0eWxlLWxvYWRlclxuICAgICAgLy8gdG8gb3BlcmF0ZSBjb3JyZWN0bHkgaW50byBub24tc3RhbmRhcmQgZW52aXJvbm1lbnRzXG4gICAgICAvLyBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS93ZWJwYWNrLWNvbnRyaWIvc3R5bGUtbG9hZGVyL2lzc3Vlcy8xNzdcbiAgICAgIG1lbW8gPSBCb29sZWFuKHdpbmRvdyAmJiBkb2N1bWVudCAmJiBkb2N1bWVudC5hbGwgJiYgIXdpbmRvdy5hdG9iKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWVtbztcbiAgfTtcbn0oKTtcblxudmFyIGdldFRhcmdldCA9IGZ1bmN0aW9uIGdldFRhcmdldCgpIHtcbiAgdmFyIG1lbW8gPSB7fTtcbiAgcmV0dXJuIGZ1bmN0aW9uIG1lbW9yaXplKHRhcmdldCkge1xuICAgIGlmICh0eXBlb2YgbWVtb1t0YXJnZXRdID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdmFyIHN0eWxlVGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpOyAvLyBTcGVjaWFsIGNhc2UgdG8gcmV0dXJuIGhlYWQgb2YgaWZyYW1lIGluc3RlYWQgb2YgaWZyYW1lIGl0c2VsZlxuXG4gICAgICBpZiAod2luZG93LkhUTUxJRnJhbWVFbGVtZW50ICYmIHN0eWxlVGFyZ2V0IGluc3RhbmNlb2Ygd2luZG93LkhUTUxJRnJhbWVFbGVtZW50KSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgLy8gVGhpcyB3aWxsIHRocm93IGFuIGV4Y2VwdGlvbiBpZiBhY2Nlc3MgdG8gaWZyYW1lIGlzIGJsb2NrZWRcbiAgICAgICAgICAvLyBkdWUgdG8gY3Jvc3Mtb3JpZ2luIHJlc3RyaWN0aW9uc1xuICAgICAgICAgIHN0eWxlVGFyZ2V0ID0gc3R5bGVUYXJnZXQuY29udGVudERvY3VtZW50LmhlYWQ7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAvLyBpc3RhbmJ1bCBpZ25vcmUgbmV4dFxuICAgICAgICAgIHN0eWxlVGFyZ2V0ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBtZW1vW3RhcmdldF0gPSBzdHlsZVRhcmdldDtcbiAgICB9XG5cbiAgICByZXR1cm4gbWVtb1t0YXJnZXRdO1xuICB9O1xufSgpO1xuXG52YXIgc3R5bGVzSW5Eb20gPSBbXTtcblxuZnVuY3Rpb24gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcikge1xuICB2YXIgcmVzdWx0ID0gLTE7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHlsZXNJbkRvbS5sZW5ndGg7IGkrKykge1xuICAgIGlmIChzdHlsZXNJbkRvbVtpXS5pZGVudGlmaWVyID09PSBpZGVudGlmaWVyKSB7XG4gICAgICByZXN1bHQgPSBpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gbW9kdWxlc1RvRG9tKGxpc3QsIG9wdGlvbnMpIHtcbiAgdmFyIGlkQ291bnRNYXAgPSB7fTtcbiAgdmFyIGlkZW50aWZpZXJzID0gW107XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSBsaXN0W2ldO1xuICAgIHZhciBpZCA9IG9wdGlvbnMuYmFzZSA/IGl0ZW1bMF0gKyBvcHRpb25zLmJhc2UgOiBpdGVtWzBdO1xuICAgIHZhciBjb3VudCA9IGlkQ291bnRNYXBbaWRdIHx8IDA7XG4gICAgdmFyIGlkZW50aWZpZXIgPSBcIlwiLmNvbmNhdChpZCwgXCIgXCIpLmNvbmNhdChjb3VudCk7XG4gICAgaWRDb3VudE1hcFtpZF0gPSBjb3VudCArIDE7XG4gICAgdmFyIGluZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gICAgdmFyIG9iaiA9IHtcbiAgICAgIGNzczogaXRlbVsxXSxcbiAgICAgIG1lZGlhOiBpdGVtWzJdLFxuICAgICAgc291cmNlTWFwOiBpdGVtWzNdXG4gICAgfTtcblxuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgIHN0eWxlc0luRG9tW2luZGV4XS5yZWZlcmVuY2VzKys7XG4gICAgICBzdHlsZXNJbkRvbVtpbmRleF0udXBkYXRlcihvYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHlsZXNJbkRvbS5wdXNoKHtcbiAgICAgICAgaWRlbnRpZmllcjogaWRlbnRpZmllcixcbiAgICAgICAgdXBkYXRlcjogYWRkU3R5bGUob2JqLCBvcHRpb25zKSxcbiAgICAgICAgcmVmZXJlbmNlczogMVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWRlbnRpZmllcnMucHVzaChpZGVudGlmaWVyKTtcbiAgfVxuXG4gIHJldHVybiBpZGVudGlmaWVycztcbn1cblxuZnVuY3Rpb24gaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpIHtcbiAgdmFyIHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgdmFyIGF0dHJpYnV0ZXMgPSBvcHRpb25zLmF0dHJpYnV0ZXMgfHwge307XG5cbiAgaWYgKHR5cGVvZiBhdHRyaWJ1dGVzLm5vbmNlID09PSAndW5kZWZpbmVkJykge1xuICAgIHZhciBub25jZSA9IHR5cGVvZiBfX3dlYnBhY2tfbm9uY2VfXyAhPT0gJ3VuZGVmaW5lZCcgPyBfX3dlYnBhY2tfbm9uY2VfXyA6IG51bGw7XG5cbiAgICBpZiAobm9uY2UpIHtcbiAgICAgIGF0dHJpYnV0ZXMubm9uY2UgPSBub25jZTtcbiAgICB9XG4gIH1cblxuICBPYmplY3Qua2V5cyhhdHRyaWJ1dGVzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICBzdHlsZS5zZXRBdHRyaWJ1dGUoa2V5LCBhdHRyaWJ1dGVzW2tleV0pO1xuICB9KTtcblxuICBpZiAodHlwZW9mIG9wdGlvbnMuaW5zZXJ0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgb3B0aW9ucy5pbnNlcnQoc3R5bGUpO1xuICB9IGVsc2Uge1xuICAgIHZhciB0YXJnZXQgPSBnZXRUYXJnZXQob3B0aW9ucy5pbnNlcnQgfHwgJ2hlYWQnKTtcblxuICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZG4ndCBmaW5kIGEgc3R5bGUgdGFyZ2V0LiBUaGlzIHByb2JhYmx5IG1lYW5zIHRoYXQgdGhlIHZhbHVlIGZvciB0aGUgJ2luc2VydCcgcGFyYW1ldGVyIGlzIGludmFsaWQuXCIpO1xuICAgIH1cblxuICAgIHRhcmdldC5hcHBlbmRDaGlsZChzdHlsZSk7XG4gIH1cblxuICByZXR1cm4gc3R5bGU7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZSkge1xuICAvLyBpc3RhbmJ1bCBpZ25vcmUgaWZcbiAgaWYgKHN0eWxlLnBhcmVudE5vZGUgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBzdHlsZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHN0eWxlKTtcbn1cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuXG5cbnZhciByZXBsYWNlVGV4dCA9IGZ1bmN0aW9uIHJlcGxhY2VUZXh0KCkge1xuICB2YXIgdGV4dFN0b3JlID0gW107XG4gIHJldHVybiBmdW5jdGlvbiByZXBsYWNlKGluZGV4LCByZXBsYWNlbWVudCkge1xuICAgIHRleHRTdG9yZVtpbmRleF0gPSByZXBsYWNlbWVudDtcbiAgICByZXR1cm4gdGV4dFN0b3JlLmZpbHRlcihCb29sZWFuKS5qb2luKCdcXG4nKTtcbiAgfTtcbn0oKTtcblxuZnVuY3Rpb24gYXBwbHlUb1NpbmdsZXRvblRhZyhzdHlsZSwgaW5kZXgsIHJlbW92ZSwgb2JqKSB7XG4gIHZhciBjc3MgPSByZW1vdmUgPyAnJyA6IG9iai5tZWRpYSA/IFwiQG1lZGlhIFwiLmNvbmNhdChvYmoubWVkaWEsIFwiIHtcIikuY29uY2F0KG9iai5jc3MsIFwifVwiKSA6IG9iai5jc3M7IC8vIEZvciBvbGQgSUVcblxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgICovXG5cbiAgaWYgKHN0eWxlLnN0eWxlU2hlZXQpIHtcbiAgICBzdHlsZS5zdHlsZVNoZWV0LmNzc1RleHQgPSByZXBsYWNlVGV4dChpbmRleCwgY3NzKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgY3NzTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcyk7XG4gICAgdmFyIGNoaWxkTm9kZXMgPSBzdHlsZS5jaGlsZE5vZGVzO1xuXG4gICAgaWYgKGNoaWxkTm9kZXNbaW5kZXhdKSB7XG4gICAgICBzdHlsZS5yZW1vdmVDaGlsZChjaGlsZE5vZGVzW2luZGV4XSk7XG4gICAgfVxuXG4gICAgaWYgKGNoaWxkTm9kZXMubGVuZ3RoKSB7XG4gICAgICBzdHlsZS5pbnNlcnRCZWZvcmUoY3NzTm9kZSwgY2hpbGROb2Rlc1tpbmRleF0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHlsZS5hcHBlbmRDaGlsZChjc3NOb2RlKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gYXBwbHlUb1RhZyhzdHlsZSwgb3B0aW9ucywgb2JqKSB7XG4gIHZhciBjc3MgPSBvYmouY3NzO1xuICB2YXIgbWVkaWEgPSBvYmoubWVkaWE7XG4gIHZhciBzb3VyY2VNYXAgPSBvYmouc291cmNlTWFwO1xuXG4gIGlmIChtZWRpYSkge1xuICAgIHN0eWxlLnNldEF0dHJpYnV0ZSgnbWVkaWEnLCBtZWRpYSk7XG4gIH0gZWxzZSB7XG4gICAgc3R5bGUucmVtb3ZlQXR0cmlidXRlKCdtZWRpYScpO1xuICB9XG5cbiAgaWYgKHNvdXJjZU1hcCAmJiB0eXBlb2YgYnRvYSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBjc3MgKz0gXCJcXG4vKiMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LFwiLmNvbmNhdChidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShzb3VyY2VNYXApKSkpLCBcIiAqL1wiKTtcbiAgfSAvLyBGb3Igb2xkIElFXG5cbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICAqL1xuXG5cbiAgaWYgKHN0eWxlLnN0eWxlU2hlZXQpIHtcbiAgICBzdHlsZS5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3M7XG4gIH0gZWxzZSB7XG4gICAgd2hpbGUgKHN0eWxlLmZpcnN0Q2hpbGQpIHtcbiAgICAgIHN0eWxlLnJlbW92ZUNoaWxkKHN0eWxlLmZpcnN0Q2hpbGQpO1xuICAgIH1cblxuICAgIHN0eWxlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcykpO1xuICB9XG59XG5cbnZhciBzaW5nbGV0b24gPSBudWxsO1xudmFyIHNpbmdsZXRvbkNvdW50ZXIgPSAwO1xuXG5mdW5jdGlvbiBhZGRTdHlsZShvYmosIG9wdGlvbnMpIHtcbiAgdmFyIHN0eWxlO1xuICB2YXIgdXBkYXRlO1xuICB2YXIgcmVtb3ZlO1xuXG4gIGlmIChvcHRpb25zLnNpbmdsZXRvbikge1xuICAgIHZhciBzdHlsZUluZGV4ID0gc2luZ2xldG9uQ291bnRlcisrO1xuICAgIHN0eWxlID0gc2luZ2xldG9uIHx8IChzaW5nbGV0b24gPSBpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucykpO1xuICAgIHVwZGF0ZSA9IGFwcGx5VG9TaW5nbGV0b25UYWcuYmluZChudWxsLCBzdHlsZSwgc3R5bGVJbmRleCwgZmFsc2UpO1xuICAgIHJlbW92ZSA9IGFwcGx5VG9TaW5nbGV0b25UYWcuYmluZChudWxsLCBzdHlsZSwgc3R5bGVJbmRleCwgdHJ1ZSk7XG4gIH0gZWxzZSB7XG4gICAgc3R5bGUgPSBpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucyk7XG4gICAgdXBkYXRlID0gYXBwbHlUb1RhZy5iaW5kKG51bGwsIHN0eWxlLCBvcHRpb25zKTtcblxuICAgIHJlbW92ZSA9IGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZSk7XG4gICAgfTtcbiAgfVxuXG4gIHVwZGF0ZShvYmopO1xuICByZXR1cm4gZnVuY3Rpb24gdXBkYXRlU3R5bGUobmV3T2JqKSB7XG4gICAgaWYgKG5ld09iaikge1xuICAgICAgaWYgKG5ld09iai5jc3MgPT09IG9iai5jc3MgJiYgbmV3T2JqLm1lZGlhID09PSBvYmoubWVkaWEgJiYgbmV3T2JqLnNvdXJjZU1hcCA9PT0gb2JqLnNvdXJjZU1hcCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHVwZGF0ZShvYmogPSBuZXdPYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICByZW1vdmUoKTtcbiAgICB9XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGxpc3QsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307IC8vIEZvcmNlIHNpbmdsZS10YWcgc29sdXRpb24gb24gSUU2LTksIHdoaWNoIGhhcyBhIGhhcmQgbGltaXQgb24gdGhlICMgb2YgPHN0eWxlPlxuICAvLyB0YWdzIGl0IHdpbGwgYWxsb3cgb24gYSBwYWdlXG5cbiAgaWYgKCFvcHRpb25zLnNpbmdsZXRvbiAmJiB0eXBlb2Ygb3B0aW9ucy5zaW5nbGV0b24gIT09ICdib29sZWFuJykge1xuICAgIG9wdGlvbnMuc2luZ2xldG9uID0gaXNPbGRJRSgpO1xuICB9XG5cbiAgbGlzdCA9IGxpc3QgfHwgW107XG4gIHZhciBsYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucyk7XG4gIHJldHVybiBmdW5jdGlvbiB1cGRhdGUobmV3TGlzdCkge1xuICAgIG5ld0xpc3QgPSBuZXdMaXN0IHx8IFtdO1xuXG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChuZXdMaXN0KSAhPT0gJ1tvYmplY3QgQXJyYXldJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGFzdElkZW50aWZpZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaWRlbnRpZmllciA9IGxhc3RJZGVudGlmaWVyc1tpXTtcbiAgICAgIHZhciBpbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgICAgc3R5bGVzSW5Eb21baW5kZXhdLnJlZmVyZW5jZXMtLTtcbiAgICB9XG5cbiAgICB2YXIgbmV3TGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKG5ld0xpc3QsIG9wdGlvbnMpO1xuXG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGxhc3RJZGVudGlmaWVycy5sZW5ndGg7IF9pKyspIHtcbiAgICAgIHZhciBfaWRlbnRpZmllciA9IGxhc3RJZGVudGlmaWVyc1tfaV07XG5cbiAgICAgIHZhciBfaW5kZXggPSBnZXRJbmRleEJ5SWRlbnRpZmllcihfaWRlbnRpZmllcik7XG5cbiAgICAgIGlmIChzdHlsZXNJbkRvbVtfaW5kZXhdLnJlZmVyZW5jZXMgPT09IDApIHtcbiAgICAgICAgc3R5bGVzSW5Eb21bX2luZGV4XS51cGRhdGVyKCk7XG5cbiAgICAgICAgc3R5bGVzSW5Eb20uc3BsaWNlKF9pbmRleCwgMSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGFzdElkZW50aWZpZXJzID0gbmV3TGFzdElkZW50aWZpZXJzO1xuICB9O1xufTsiLCJpbXBvcnQgJy4uL2Nzcy9zdHlsZS5jc3MnO1xuaW1wb3J0ICcuLi9jc3MvdmVuZG9yL21hbmEuY3NzJztcbmltcG9ydCBTZWFyY2ggZnJvbSAnLi9tb2RlbHMvU2VhcmNoJztcbmltcG9ydCAqIGFzIHNlYXJjaFZpZXcgZnJvbSAnLi92aWV3cy9zZWFyY2hWaWV3JztcbmltcG9ydCAqIGFzIHJlc3VsdHNWaWV3IGZyb20gJy4vdmlld3MvcmVzdWx0c1ZpZXcnO1xuaW1wb3J0ICogYXMgY2FyZFZpZXcgZnJvbSAnLi92aWV3cy9jYXJkVmlldyc7XG5pbXBvcnQgKiBhcyBpbnZlbnRvcnlWaWV3IGZyb20gJy4vdmlld3MvaW52ZW50b3J5Vmlldyc7XG5pbXBvcnQgKiBhcyBpbnZTZWFyY2ggZnJvbSAnLi92aWV3cy9pbnZlbnRvcnlTZWFyY2hWaWV3JztcbmltcG9ydCB7IGVsZW1lbnRzIH0gZnJvbSAnLi92aWV3cy9iYXNlJztcblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKiBIb21lIFBhZ2UgKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuaWYgKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSA9PT0gJy8nKSBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7XG5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqIFF1aWNrIFNlYXJjaCAqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbmVsZW1lbnRzLm5hdi5xdWlja1NlYXJjaEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgY29uc3Qgc2VhcmNoID0gbmV3IFNlYXJjaCgpO1xuXG4gIGlmIChlbGVtZW50cy5uYXYuc2VhcmNoSW5wdXQudmFsdWUgIT09ICcnKSB7XG4gICAgY29uc3QgcXVlcnkgPSBzZWFyY2gucXVpY2tTZWFyY2goKTtcbiAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGAvcmVzdWx0cy9saXN0LyR7cXVlcnl9Jm9yZGVyPW5hbWVgO1xuICB9XG59KTtcblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKiogU2VhcmNoIFBhZ2UgKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuaWYgKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSA9PT0gJy9zZWFyY2gnKSB7XG4gIGRvY3VtZW50LmJvZHkuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJyNmZGZkZmQnO1xuXG4gIGNvbnN0IHNlYXJjaCA9IG5ldyBTZWFyY2goKTtcblxuICAvLyBFdmVudCBsaXN0ZW5lciBmb3IgdGhlIHN1Ym1pdCBzZWFyY2ggYnV0dG9uLiBUaGlzIGdvZXMgdGhyb3VnaCB0aGUgZm9ybSBhbmQgZ2VuZXJhdGVzXG4gIC8vIHRoZSBxdWplcnkgc3RyaW5nLiBJdCB0aGVuIHBhc3NlcyB0aGUgc3RyaW5nIHRvIHRoZSBzZXJ2ZXIgdGhyb3VnaCB0aGUgVVJMXG4gIGVsZW1lbnRzLmFwaVNlYXJjaC5zdWJtaXRCdG4ub25jbGljayA9IGFzeW5jIChlKSA9PiB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgLy8gQ2xlYXIgYW55IGV4aXN0aW5nIHF1ZXJ5IHN0cmluZ1xuICAgIHNlYXJjaC5yZXNldFNlYXJjaFF1ZXJ5KCk7XG5cbiAgICAvLyBCdWlsZCB0aGUgcXVlcnkgc3RyaW5nXG4gICAgY29uc3QgcXVlcnkgPSBzZWFyY2guYnVpbGRTZWFyY2hRdWVyeSgpO1xuXG4gICAgLy8gR2V0IHRoZSBkaXNwbGF5IG1ldGhvZFxuICAgIGNvbnN0IGRpc3BsYXlNZXRob2QgPSBzZWFyY2guZGlzcGxheU1ldGhvZCgpO1xuXG4gICAgLy8gQ3JlYXRlIGEgZ2V0IHJlcXVlc3Qgd2l0aCB0aGUgcXVlcnkgc3RyaW5nXG4gICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBgL3Jlc3VsdHMvJHtkaXNwbGF5TWV0aG9kfS8ke3F1ZXJ5fWA7XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cbiAgZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVMaW5lLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgIC8vIERpc3BsYXkgdGhlIGRyb3Bkb3duXG4gICAgc2VhcmNoVmlldy5zaG93VHlwZXNEcm9wRG93bigpO1xuICAgIHNlYXJjaFZpZXcuc3RhcnRUeXBlc0Ryb3BEb3duTmF2aWdhdGlvbigpO1xuXG4gICAgLy8gU3RhcnQgYW4gZXZlbnQgbGlzdGVuZXIgb24gdGhlIGRvY3VtZW50LiBUaGlzIHdpbGwgY2xvc2UgdGhlIGRyb3Bkb3duIGlmIHRoZSB1c2VyIGNsaWNrc1xuICAgIC8vIG91dHNpZGUgb2YgdGhlIGlucHV0IG9yIGRyb3Bkb3duLiBUaGlzIHdpbGwgYWxzbyBjYW5jZWwgdGhlIGV2ZW50IGxpc3RlbmVyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzZWFyY2hWaWV3LnR5cGVMaW5lTGlzdGVuZXIpO1xuICB9KTtcblxuICBlbGVtZW50cy5hcGlTZWFyY2gudHlwZUxpbmUuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XG4gICAgaWYgKGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlRHJvcERvd24uaGFzQXR0cmlidXRlKCdoaWRkZW4nKSkge1xuICAgICAgc2VhcmNoVmlldy5zaG93VHlwZXNEcm9wRG93bigpO1xuICAgIH1cblxuICAgIHNlYXJjaFZpZXcuZmlsdGVyVHlwZXMoZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVMaW5lLnZhbHVlKTtcbiAgICBzZWFyY2hWaWV3LmZpbHRlclR5cGVIZWFkZXJzKCk7XG4gICAgc2VhcmNoVmlldy5zdGFydFR5cGVzRHJvcERvd25OYXZpZ2F0aW9uKCk7XG4gIH0pO1xuXG4gIGVsZW1lbnRzLmFwaVNlYXJjaC5zZXRJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAvLyBEaXNwbGF5IHRoZSBkcm9wZG93blxuICAgIHNlYXJjaFZpZXcuc2hvd1NldHNEcm9wRG93bigpO1xuICAgIHNlYXJjaFZpZXcuc3RhcnRTZXRzRHJvcERvd25OYXZpZ2F0aW9uKCk7XG5cbiAgICAvLyBTdGFydCBhbiBldmVudCBsaXN0ZW5lciBvbiB0aGUgZG9jdW1lbnQuIFRoaXMgd2lsbCBjbG9zZSB0aGUgZHJvcGRvd24gaWYgdGhlIHVzZXIgY2xpY2tzXG4gICAgLy8gb3V0c2lkZSBvZiB0aGUgaW5wdXQgb3IgZHJvcGRvd24uIFRoaXMgd2lsbCBhbHNvIGNhbmNlbCB0aGUgZXZlbnQgbGlzdGVuZXJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNlYXJjaFZpZXcuc2V0SW5wdXRMaXN0ZW5lcik7XG4gIH0pO1xuXG4gIGVsZW1lbnRzLmFwaVNlYXJjaC5zZXRJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsICgpID0+IHtcbiAgICBpZiAoZWxlbWVudHMuYXBpU2VhcmNoLnNldERyb3BEb3duLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIHtcbiAgICAgIHNlYXJjaFZpZXcuc2hvd1NldHNEcm9wRG93bigpO1xuICAgIH1cblxuICAgIHNlYXJjaFZpZXcuZmlsdGVyU2V0cyhlbGVtZW50cy5hcGlTZWFyY2guc2V0SW5wdXQudmFsdWUpO1xuICAgIHNlYXJjaFZpZXcuZmlsdGVyU2V0SGVhZGVycygpO1xuICAgIHNlYXJjaFZpZXcuc3RhcnRTZXRzRHJvcERvd25OYXZpZ2F0aW9uKCk7XG4gIH0pO1xuXG4gIGVsZW1lbnRzLmFwaVNlYXJjaC5zdGF0VmFsdWUuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAnaW5wdXQnLFxuICAgIHNlYXJjaFZpZXcuc3RhdExpbmVDb250cm9sbGVyXG4gICk7XG5cbiAgZWxlbWVudHMuYXBpU2VhcmNoLmZvcm1hdC5hZGRFdmVudExpc3RlbmVyKFxuICAgICdjaGFuZ2UnLFxuICAgIHNlYXJjaFZpZXcuZm9ybWF0TGluZUNvbnRyb2xsZXJcbiAgKTtcbn1cblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKiogUmVzdWx0cyBQYWdlICoqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuaWYgKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zdWJzdHJpbmcoMSwgOCkgPT09ICdyZXN1bHRzJykge1xuICBkb2N1bWVudC5ib2R5LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcjZjVmNmY3JztcblxuICBjb25zdCBzdGF0ZSA9IHtcbiAgICBzZWFyY2g6IG5ldyBTZWFyY2goKSxcblxuICAgIC8vIEdldCB0aGUgZGlzcGxheSBtZXRob2QsIHNvcnQgbWV0aG9kLCBhbmQgcXVlcnkgZnJvbSB0aGUgVVJMXG4gICAgZGlzcGxheTogd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnN1YnN0cmluZyhcbiAgICAgIDksXG4gICAgICB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUubGFzdEluZGV4T2YoJy8nKVxuICAgICksXG4gICAgcXVlcnk6IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zdWJzdHJpbmcoXG4gICAgICB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUubGFzdEluZGV4T2YoJy8nKSArIDFcbiAgICApLFxuICAgIHNvcnRNZXRob2Q6IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zdWJzdHJpbmcoXG4gICAgICB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUubGFzdEluZGV4T2YoJz0nKSArIDFcbiAgICApLFxuXG4gICAgYWxsQ2FyZHM6IFtdLFxuICAgIGN1cnJlbnRJbmRleDogMCxcbiAgICBhbGxSZXN1bHRzTG9hZGVkOiBmYWxzZSxcbiAgfTtcblxuICAvLyBXaGVuIHRoZSByZXN1bHRzIHBhZ2UgaXMgcmVmcmVzaGVkLCBkaXNwbGF5IHRoZSBjYXJkcyBhcyBhIGNoZWNrbGlzdCBieSBkZWZhdWx0XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBhc3luYyAoKSA9PiB7XG4gICAgLy8gVXBkYXRlIHRoZSBzb3J0IGJ5IGFuZCBkaXNwbGF5IGFzZCBtZW51cyBzbyB0aGUgc2VsZWN0ZWQgb3B0aW9uIGlzIHdoYXQgdGhlIHVzZXIgc2VsZWN0ZWRcbiAgICByZXN1bHRzVmlldy5jaG9zZVNlbGVjdE1lbnVTb3J0KGVsZW1lbnRzLnJlc3VsdHNQYWdlLnNvcnRCeS5vcHRpb25zLCBzdGF0ZSk7XG4gICAgcmVzdWx0c1ZpZXcuY2hvc2VTZWxlY3RNZW51RGlzcGxheShcbiAgICAgIGVsZW1lbnRzLnJlc3VsdHNQYWdlLmRpc3BsYXlTZWxlY3RvcixcbiAgICAgIHN0YXRlXG4gICAgKTtcblxuICAgIC8vIFJ1biB0aGUgZ2V0IGNhcmRzIGZ1bmN0aW9uLCB0aGVuIHVwZGF0ZSB0aGUgZGlzcGxheSBiYXIgd2l0aCB0aGUgdG90YWwgY2FyZCBjb3VudFxuICAgIGF3YWl0IHN0YXRlLnNlYXJjaC5nZXRDYXJkcyhzdGF0ZSk7XG5cbiAgICBpZiAoc3RhdGUuYWxsQ2FyZHNbMF0gPT09IDQwNCkge1xuICAgICAgcmVzdWx0c1ZpZXcuZGlzcGxheTQwNCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHJlc3VsdHNWaWV3LnVwZGF0ZURpc3BsYXlCYXIoc3RhdGUpO1xuXG4gICAgLy8gSW4gdGhlIGJhY2tncm91bmQsIGdldCBhbGwgY2FyZHNcbiAgICBzdGF0ZS5zZWFyY2guZ2V0QWxsQ2FyZHMoc3RhdGUsIHJlc3VsdHNWaWV3LmVuYWJsZUJ0bik7XG5cbiAgICAvLyBPbiBsb2FkaW5nIHRoZSBwYWdlIGRpc3BsYXkgdGhlIGNhcmRzIGluIGEgY2hlY2tsaXN0XG4gICAgcmVzdWx0c1ZpZXcudXBkYXRlRGlzcGxheShzdGF0ZSk7XG4gIH0pO1xuXG4gIC8vIEV2ZW50IGxpc3RlbmVyIGZvciB0aGUgY2hhbmdlIGRpc3BsYXkgbWV0aG9kIGJ1dHRvblxuICBlbGVtZW50cy5yZXN1bHRzUGFnZS5idG4ub25jbGljayA9IGFzeW5jICgpID0+IHtcbiAgICAvLyBVcGRhdGUgdGhlIGRpc3BsYXkgbWV0aG9kIGJldHdlZW4gY2hlY2tsaXN0IGFuZCBjYXJkcyBpZiB0aGUgdXNlciBjaGFuZ2VkIGl0XG4gICAgcmVzdWx0c1ZpZXcuY2hhbmdlRGlzcGxheUFuZFVybChzdGF0ZSk7XG5cbiAgICAvLyBJZiBhIG5ldyBzb3J0aW5nIG1ldGhvZCBpcyBzZWxlY3RlZCwgYSByZXF1ZXN0IGlzIHNlbnQgdG8gdGhlIHNlcnZlciBhbmQgdGhlIHBhZ2UgaXMgcmVmcmVzaGVkLlxuICAgIC8vIFRoaXMgcmVzZXRzIHRoZSBzdGF0ZSBhbmQgYXN5bmMgdGFza3NcbiAgICByZXN1bHRzVmlldy5jaGFuZ2VTb3J0TWV0aG9kKHN0YXRlKTtcblxuICAgIC8vIFVwZGF0ZSB0aGUgZGlzcGxheSB3aXRoIGEgbmV3IHNvcnQgbWV0aG9kIGFuZCBkaXNwbGF5IG1ldGhvZCBpZiBlaXRoZXIgd2VyZSBnaXZlblxuICAgIHJlc3VsdHNWaWV3LnVwZGF0ZURpc3BsYXkoc3RhdGUpO1xuICB9O1xuXG4gIC8vIEV2ZW50IExpc3RlbmVyIGZvciBuZXh0IHBhZ2UgYnV0dG9uXG4gIGVsZW1lbnRzLnJlc3VsdHNQYWdlLm5leHRQYWdlQnRuLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgLy8gVXBkYXRlIHRoZSBpbmRleFxuICAgIHN0YXRlLmN1cnJlbnRJbmRleCsrO1xuXG4gICAgLy8gVXBkYXRlIHRoZSBkaXNwbGF5IGJhc2VkIG9uIHRoZSBtZXRob2Qgc3RvcmVkIGluIHRoZSBzdGF0ZVxuICAgIHJlc3VsdHNWaWV3LnVwZGF0ZURpc3BsYXkoc3RhdGUpO1xuXG4gICAgLy8gVXBkYXRlIHRoZSBkaXNwbGF5IGJhclxuICAgIHJlc3VsdHNWaWV3LnVwZGF0ZURpc3BsYXlCYXIoc3RhdGUpO1xuXG4gICAgLy8gRW5hYmxlIHRoZSBwcmV2aW91cyBwYWdlIGFuZCBmaXJzdCBwYWdlIGJ0bnNcbiAgICByZXN1bHRzVmlldy5lbmFibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UucHJldmlvdXNQYWdlQnRuKTtcbiAgICByZXN1bHRzVmlldy5lbmFibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UuZmlyc3RQYWdlQnRuKTtcblxuICAgIC8vIElmIG9uIHRoZSBsYXN0IHBhZ2UsIGRpc2FibGUgdGhlIG5leHQgcGFnZSBidG4gYW5kIGxhc3QgcGFnZSBidG5cbiAgICBpZiAoc3RhdGUuY3VycmVudEluZGV4ID09PSBzdGF0ZS5hbGxDYXJkcy5sZW5ndGggLSAxKSB7XG4gICAgICByZXN1bHRzVmlldy5kaXNhYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLm5leHRQYWdlQnRuKTtcbiAgICAgIHJlc3VsdHNWaWV3LmRpc2FibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UubGFzdFBhZ2VCdG4pO1xuICAgIH1cbiAgfTtcblxuICAvLyBFdmVudCBsaXN0ZW5lciBmb3IgdGhlIGxhc3QgcGFnZSBidG5cbiAgZWxlbWVudHMucmVzdWx0c1BhZ2UubGFzdFBhZ2VCdG4ub25jbGljayA9ICgpID0+IHtcbiAgICAvLyBVcGRhdGUgdGhlIGluZGV4XG4gICAgc3RhdGUuY3VycmVudEluZGV4ID0gc3RhdGUuYWxsQ2FyZHMubGVuZ3RoIC0gMTtcblxuICAgIC8vIFVwZGF0ZSB0aGUgZGlzcGxheSBiYXNlZCBvbiB0aGUgbWV0aG9kIHN0b3JlZCBpbiB0aGUgc3RhdGVcbiAgICByZXN1bHRzVmlldy51cGRhdGVEaXNwbGF5KHN0YXRlKTtcblxuICAgIC8vIFVwZGF0ZSB0aGUgZGlzcGxheSBiYXJcbiAgICByZXN1bHRzVmlldy51cGRhdGVEaXNwbGF5QmFyKHN0YXRlKTtcblxuICAgIC8vIERpc2FibGUgdGhlIG5leHQgYW5kIGxhc3QgcGFnZSBidXR0b25zXG4gICAgcmVzdWx0c1ZpZXcuZGlzYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5uZXh0UGFnZUJ0bik7XG4gICAgcmVzdWx0c1ZpZXcuZGlzYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5sYXN0UGFnZUJ0bik7XG5cbiAgICAvLyBFbmFibGUgdGhlIHByZXZpb3VzIGFuZCBmaXJzdCBwYWdlIGJ1dHRvbnNcbiAgICByZXN1bHRzVmlldy5lbmFibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UucHJldmlvdXNQYWdlQnRuKTtcbiAgICByZXN1bHRzVmlldy5lbmFibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UuZmlyc3RQYWdlQnRuKTtcbiAgfTtcblxuICAvLyBFdmVudCBsaXN0ZW5lciBmb3IgdGhlIHByZXZpb3VzIHBhZ2UgYnV0dG9uXG4gIGVsZW1lbnRzLnJlc3VsdHNQYWdlLnByZXZpb3VzUGFnZUJ0bi5vbmNsaWNrID0gKCkgPT4ge1xuICAgIC8vIFVwZGF0ZSB0aGUgaW5kZXhcbiAgICBzdGF0ZS5jdXJyZW50SW5kZXgtLTtcblxuICAgIC8vIFVwZGF0ZSB0aGUgZGlzcGxheSBiYXNlZCBvbiB0aGUgbWV0aG9kIHN0b3JlZCBpbiB0aGUgc3RhdGVcbiAgICByZXN1bHRzVmlldy51cGRhdGVEaXNwbGF5KHN0YXRlKTtcblxuICAgIC8vIFVwZGF0ZSB0aGUgZGlzcGxheSBiYXJcbiAgICByZXN1bHRzVmlldy51cGRhdGVEaXNwbGF5QmFyKHN0YXRlKTtcblxuICAgIC8vIElmIG9uIHRoZSBmaXJzdCBwYWdlLCBkaXNhYmxlIHRoZSBwcmV2aW91cyBhbmQgZmlyc3QgcGFnZSBidXR0b25zXG4gICAgaWYgKHN0YXRlLmN1cnJlbnRJbmRleCA9PT0gMCkge1xuICAgICAgcmVzdWx0c1ZpZXcuZGlzYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5wcmV2aW91c1BhZ2VCdG4pO1xuICAgICAgcmVzdWx0c1ZpZXcuZGlzYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5maXJzdFBhZ2VCdG4pO1xuICAgIH1cblxuICAgIC8vIEVuYWJsZSB0aGUgbmV4dCBhbmQgbGFzdCBwYWdlIGJ1dHRvbnMuIFRoZSBsYXN0IHBhZ2UgYnV0dG9uIHNob3VsZCBvbmx5IGJlXG4gICAgLy8gZW5hYmxlZCBpZiBhbGwgcmVzdWx0cyBoYXZlIGJlZW4gbG9hZGVkXG4gICAgcmVzdWx0c1ZpZXcuZW5hYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLm5leHRQYWdlQnRuKTtcbiAgICBpZiAoc3RhdGUuYWxsUmVzdWx0c0xvYWRlZClcbiAgICAgIHJlc3VsdHNWaWV3LmVuYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5sYXN0UGFnZUJ0bik7XG4gIH07XG5cbiAgLy8gRXZlbnQgbGlzdGVuZXIgZm9yIHRoZSBmaXJzdCBwYWdlIGJ0blxuICBlbGVtZW50cy5yZXN1bHRzUGFnZS5maXJzdFBhZ2VCdG4ub25jbGljayA9ICgpID0+IHtcbiAgICAvLyBVcGRhdGUgdGhlIGluZGV4XG4gICAgc3RhdGUuY3VycmVudEluZGV4ID0gMDtcblxuICAgIC8vIFVwZGF0ZSB0aGUgZGlzcGxheSBiYXNlZCBvbiB0aGUgbWV0aG9kIHN0b3JlZCBpbiB0aGUgc3RhdGVcbiAgICByZXN1bHRzVmlldy51cGRhdGVEaXNwbGF5KHN0YXRlKTtcblxuICAgIC8vIFVwZGF0ZSB0aGUgZGlzcGxheSBiYXJcbiAgICByZXN1bHRzVmlldy51cGRhdGVEaXNwbGF5QmFyKHN0YXRlKTtcblxuICAgIC8vIERpc2FibGUgdGhlIHByZXZpb3VzIGFuZCBmaXJzdCBwYWdlIGJ1dHRvbnNcbiAgICByZXN1bHRzVmlldy5kaXNhYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLnByZXZpb3VzUGFnZUJ0bik7XG4gICAgcmVzdWx0c1ZpZXcuZGlzYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5maXJzdFBhZ2VCdG4pO1xuXG4gICAgLy8gRW5hYmxlIHRoZSBuZXh0IGFuZCBsYXN0IHBhZ2UgYnV0dG9ucy4gVGhlIGxhc3QgcGFnZSBidXR0b24gc2hvdWxkIG9ubHkgYmVcbiAgICAvLyBlbmFibGVkIGlmIGFsbCByZXN1bHRzIGhhdmUgYmVlbiBsb2FkZWRcbiAgICByZXN1bHRzVmlldy5lbmFibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UubmV4dFBhZ2VCdG4pO1xuICAgIGlmIChzdGF0ZS5hbGxSZXN1bHRzTG9hZGVkKVxuICAgICAgcmVzdWx0c1ZpZXcuZW5hYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLmxhc3RQYWdlQnRuKTtcbiAgfTtcblxuICB3aW5kb3cub25wb3BzdGF0ZSA9IChlKSA9PiB7XG4gICAgLy8gY29uc3QgZGF0YSA9IGUuc3RhdGU7XG4gICAgLy8gaWYgKGRhdGEgIT09IG51bGwpIHJlc3VsdHNWaWV3LnVwZGF0ZURpc3BsYXlPblBvcFN0YXRlKHN0YXRlLCBkYXRhKTtcblxuICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gYC9zZWFyY2hgO1xuICB9O1xufVxuXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqIENhcmQgUGFnZSAqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG5pZiAod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnN1YnN0cmluZygxLCA1KSA9PT0gJ2NhcmQnKSB7XG4gIGNhcmRWaWV3Lmluc2VydE1hbmFDb3N0VG9DYXJkVGV4dFRpdGxlKCk7XG4gIGNhcmRWaWV3Lmluc2VydE1hbmFDb3N0VG9PcmFjbGVUZXh0KCk7XG4gIGNhcmRWaWV3LnJlbW92ZVVuZGVyU2NvcmVGcm9tTGVnYWxTdGF0dXMoKTtcbiAgY2FyZFZpZXcuZml4Q2FyZFByaWNlcygpO1xuICBjYXJkVmlldy5zZXRQcmludExpbmtIcmVmKCk7XG4gIGNhcmRWaWV3LnByaW50TGlzdEhvdmVyRXZlbnRzKCk7XG5cbiAgLy8gSWYgdGhlIHRyYW5zZm9ybSBidG4gaXMgb24gdGhlIGRvbSAoaWYgdGhlIGNhcmQgaXMgZG91YmxlIHNpZGVkKSBzZXRcbiAgLy8gdGhlIGV2ZW50IGxpc3RlbmVyIGZvciB0aGUgY2FyZCB0byBiZSBmbGlwcGVkIGJhY2sgYW5kIGZvcnRoXG4gIGlmIChlbGVtZW50cy5jYXJkLnRyYW5zZm9ybUJ0bikge1xuICAgIGVsZW1lbnRzLmNhcmQudHJhbnNmb3JtQnRuLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAnY2xpY2snLFxuICAgICAgY2FyZFZpZXcuZmxpcFRvQmFja1NpZGVcbiAgICApO1xuICB9XG5cbiAgZG9jdW1lbnRcbiAgICAucXVlcnlTZWxlY3RvcignLmpzLS1hZGQtdG8taW52LXN1Ym1pdCcpXG4gICAgLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2FyZFZpZXcuY2hlY2tQcmljZUlucHV0Rm9yRGlnaXRzKTtcbn1cblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqIEludmVudG9yeSBQYWdlICoqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuaWYgKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zdWJzdHJpbmcoMSwgMTApID09PSAnaW52ZW50b3J5Jykge1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFxuICAgICdET01Db250ZW50TG9hZGVkJyxcbiAgICBpbnZlbnRvcnlWaWV3LmFsdGVySW52ZW50b3J5VGFibGVcbiAgKTtcbn1cblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqIEludmVudG9yeSBTZWFyY2ggUGFnZSAqKioqIFxcXFxcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuaWYgKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zdWJzdHJpbmcoMSwgMTcpID09PSAnaW52ZW50b3J5L3NlYXJjaCcpIHtcbiAgZG9jdW1lbnQuYm9keS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnI2ZkZmRmZCc7XG5cbiAgZG9jdW1lbnRcbiAgICAucXVlcnlTZWxlY3RvcignLmpzLS1pbnYtc2VhcmNoLWJ0bicpXG4gICAgLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaW52U2VhcmNoLmNoZWNrUHJpY2VJbnB1dEZvckRpZ2l0cyk7XG5cbiAgZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVMaW5lLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgIC8vIERpc3BsYXkgdGhlIGRyb3Bkb3duXG4gICAgc2VhcmNoVmlldy5zaG93VHlwZXNEcm9wRG93bigpO1xuICAgIGludlNlYXJjaC5zdGFydFR5cGVzRHJvcERvd25OYXZpZ2F0aW9uKCk7XG5cbiAgICAvLyBTdGFydCBhbiBldmVudCBsaXN0ZW5lciBvbiB0aGUgZG9jdW1lbnQuIFRoaXMgd2lsbCBjbG9zZSB0aGUgZHJvcGRvd24gaWYgdGhlIHVzZXIgY2xpY2tzXG4gICAgLy8gb3V0c2lkZSBvZiB0aGUgaW5wdXQgb3IgZHJvcGRvd24uIFRoaXMgd2lsbCBhbHNvIGNhbmNlbCB0aGUgZXZlbnQgbGlzdGVuZXJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGludlNlYXJjaC50eXBlTGluZUxpc3RlbmVyKTtcbiAgfSk7XG5cbiAgZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVMaW5lLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xuICAgIGlmIChlbGVtZW50cy5hcGlTZWFyY2gudHlwZURyb3BEb3duLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIHtcbiAgICAgIHNlYXJjaFZpZXcuc2hvd1R5cGVzRHJvcERvd24oKTtcbiAgICB9XG5cbiAgICBzZWFyY2hWaWV3LmZpbHRlclR5cGVzKGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlTGluZS52YWx1ZSk7XG4gICAgc2VhcmNoVmlldy5maWx0ZXJUeXBlSGVhZGVycygpO1xuICAgIGludlNlYXJjaC5zdGFydFR5cGVzRHJvcERvd25OYXZpZ2F0aW9uKCk7XG4gIH0pO1xuXG4gIGVsZW1lbnRzLmFwaVNlYXJjaC5zZXRJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAvLyBEaXNwbGF5IHRoZSBkcm9wZG93blxuICAgIHNlYXJjaFZpZXcuc2hvd1NldHNEcm9wRG93bigpO1xuICAgIGludlNlYXJjaC5zdGFydFNldHNEcm9wRG93bk5hdmlnYXRpb24oKTtcblxuICAgIC8vIFN0YXJ0IGFuIGV2ZW50IGxpc3RlbmVyIG9uIHRoZSBkb2N1bWVudC4gVGhpcyB3aWxsIGNsb3NlIHRoZSBkcm9wZG93biBpZiB0aGUgdXNlciBjbGlja3NcbiAgICAvLyBvdXRzaWRlIG9mIHRoZSBpbnB1dCBvciBkcm9wZG93bi4gVGhpcyB3aWxsIGFsc28gY2FuY2VsIHRoZSBldmVudCBsaXN0ZW5lclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaW52U2VhcmNoLnNldElucHV0TGlzdGVuZXIpO1xuICB9KTtcblxuICBlbGVtZW50cy5hcGlTZWFyY2guc2V0SW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XG4gICAgaWYgKGVsZW1lbnRzLmFwaVNlYXJjaC5zZXREcm9wRG93bi5oYXNBdHRyaWJ1dGUoJ2hpZGRlbicpKSB7XG4gICAgICBzZWFyY2hWaWV3LnNob3dTZXRzRHJvcERvd24oKTtcbiAgICB9XG5cbiAgICBzZWFyY2hWaWV3LmZpbHRlclNldHMoZWxlbWVudHMuYXBpU2VhcmNoLnNldElucHV0LnZhbHVlKTtcbiAgICBzZWFyY2hWaWV3LmZpbHRlclNldEhlYWRlcnMoKTtcbiAgICBpbnZTZWFyY2guc3RhcnRTZXRzRHJvcERvd25OYXZpZ2F0aW9uKCk7XG4gIH0pO1xufVxuIiwiaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJztcblxuaW1wb3J0IHsgZWxlbWVudHMgfSBmcm9tICcuLi92aWV3cy9iYXNlJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2VhcmNoIHtcbiAgc2VhcmNoQnlOYW1lKCkge1xuICAgIGxldCBjYXJkTmFtZSA9IGVsZW1lbnRzLmFwaVNlYXJjaC5jYXJkTmFtZS52YWx1ZTtcbiAgICBjYXJkTmFtZSA9IGNhcmROYW1lLnJlcGxhY2UoJyAnLCAnKycpO1xuXG4gICAgaWYgKGNhcmROYW1lKSB0aGlzLnNlYXJjaCArPSBjYXJkTmFtZTtcbiAgfVxuXG4gIHNlYXJjaEJ5T3RleHQoKSB7XG4gICAgY29uc3Qgb3JhY2xlVGV4dCA9IGVsZW1lbnRzLmFwaVNlYXJjaC5vcmFjbGVUZXh0LnZhbHVlO1xuXG4gICAgLy8gSWYgdGhlIG9yYWNsZSB0ZXh0IGluY2x1ZGVzIG1vcmUgdGhhbiBvbmUgd29yZCwgd2UgbmVlZCB0byBzZWFyY2ggdGhlIHRlcm1zIGluZGl2aWR1YWxseVxuICAgIGlmIChcbiAgICAgIG9yYWNsZVRleHQuaW5jbHVkZXMoJyAnKSAmJlxuICAgICAgb3JhY2xlVGV4dC5pbmRleE9mKCcgJykgIT09IG9yYWNsZVRleHQubGVuZ3RoIC0gMVxuICAgICkge1xuICAgICAgbGV0IHRlbXBvcmFyeVN0ciA9ICcnO1xuICAgICAgY29uc3QgdGV4dHMgPSBvcmFjbGVUZXh0LnNwbGl0KCcgJyk7XG5cbiAgICAgIHRleHRzLmZvckVhY2goKHRleHQpID0+IHtcbiAgICAgICAgaWYgKHRleHQubGVuZ3RoID4gMCkgdGVtcG9yYXJ5U3RyICs9IGBvcmFjbGUlM0Eke3RleHR9K2A7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5zZWFyY2ggKz0gYCslMjgke3RlbXBvcmFyeVN0ci5zbGljZSgwLCAtMSl9JTI5YDtcbiAgICB9IGVsc2UgaWYgKG9yYWNsZVRleHQpIHRoaXMuc2VhcmNoICs9IGArb3JhY2xlJTNBJHtvcmFjbGVUZXh0fWA7XG4gIH1cblxuICBzZWFyY2hCeUNhcmRUeXBlKCkge1xuICAgIGNvbnN0IHR5cGVzVG9JbmNsdWRlID0gQXJyYXkuZnJvbShcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWluY2x1ZGUtdHlwZV0nKVxuICAgICk7XG4gICAgY29uc3QgdHlwZXNUb0V4Y2x1ZGUgPSBBcnJheS5mcm9tKFxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZXhjbHVkZS10eXBlXScpXG4gICAgKTtcbiAgICBjb25zdCBpbmNsdWRlUGFydGlhbFR5cGVzID0gZWxlbWVudHMuYXBpU2VhcmNoLmluY2x1ZGVQYXJ0aWFsVHlwZXMuY2hlY2tlZDtcbiAgICBsZXQgdGVtcG9yYXJ5U3RyID0gJyc7XG5cbiAgICBpZiAodHlwZXNUb0luY2x1ZGUgJiYgIWluY2x1ZGVQYXJ0aWFsVHlwZXMpIHtcbiAgICAgIHR5cGVzVG9JbmNsdWRlLmZvckVhY2goKHR5cGUpID0+IHtcbiAgICAgICAgdGhpcy5zZWFyY2ggKz0gYCt0eXBlJTNBJHt0eXBlLmdldEF0dHJpYnV0ZSgnZGF0YS1pbmNsdWRlLXR5cGUnKX1gO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVzVG9JbmNsdWRlLmxlbmd0aCA+IDAgJiYgaW5jbHVkZVBhcnRpYWxUeXBlcykge1xuICAgICAgdHlwZXNUb0luY2x1ZGUuZm9yRWFjaCgodHlwZSkgPT4ge1xuICAgICAgICB0ZW1wb3JhcnlTdHIgKz0gYHR5cGUlM0Eke3R5cGUuZ2V0QXR0cmlidXRlKCdkYXRhLWluY2x1ZGUtdHlwZScpfStPUitgO1xuICAgICAgfSk7XG5cbiAgICAgIHRlbXBvcmFyeVN0ciA9IHRlbXBvcmFyeVN0ci5zbGljZSgwLCAtNCk7XG4gICAgICB0aGlzLnNlYXJjaCArPSBgKyUyOCR7dGVtcG9yYXJ5U3RyfSUyOWA7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVzVG9FeGNsdWRlKSB7XG4gICAgICB0eXBlc1RvRXhjbHVkZS5mb3JFYWNoKCh0eXBlKSA9PiB7XG4gICAgICAgIHRoaXMuc2VhcmNoICs9IGArLXR5cGUlM0Eke3R5cGUuZ2V0QXR0cmlidXRlKCdkYXRhLWV4Y2x1ZGUtdHlwZScpfWA7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBzZWFyY2hCeUNvbG9yKCkge1xuICAgIGxldCBib3hlcyA9IGVsZW1lbnRzLmFwaVNlYXJjaC5jb2xvckJveGVzO1xuXG4gICAgLy8gTG9vcCB0aHJvdWdoIGNoZWNrYm94ZXMgdG8gZ2V0IGFsbCBjb2xvcnMgZ2l2ZW5cbiAgICB2YXIgY29sb3JzID0gJyc7XG4gICAgYm94ZXMuZm9yRWFjaCgoYm94KSA9PiB7XG4gICAgICBpZiAoYm94LmNoZWNrZWQpIGNvbG9ycyArPSBib3gudmFsdWU7XG4gICAgfSk7XG5cbiAgICBjb25zdCBzb3J0QnkgPSBlbGVtZW50cy5hcGlTZWFyY2guY29sb3JTb3J0QnkudmFsdWU7XG5cbiAgICBpZiAoY29sb3JzKSB0aGlzLnNlYXJjaCArPSBgK2NvbG9yJHtzb3J0Qnl9JHtjb2xvcnN9YDtcbiAgfVxuXG4gIHNlYXJjaEJ5U3RhdHMoKSB7XG4gICAgY29uc3Qgc3RhdExpbmVzID0gQXJyYXkuZnJvbShcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tYXBpLXN0YXRzLXdyYXBwZXInKVxuICAgICk7XG5cbiAgICBzdGF0TGluZXMuZm9yRWFjaCgobGluZSkgPT4ge1xuICAgICAgY29uc3Qgc3RhdCA9IGxpbmUucXVlcnlTZWxlY3RvcignLmpzLS1hcGktc3RhdCcpLnZhbHVlO1xuICAgICAgY29uc3Qgc29ydEJ5ID0gbGluZS5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1zdGF0LWZpbHRlcicpLnZhbHVlO1xuICAgICAgY29uc3Qgc29ydFZhbHVlID0gbGluZS5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1zdGF0LXZhbHVlJykudmFsdWU7XG5cbiAgICAgIGlmIChzdGF0ICYmIHNvcnRCeSAmJiBzb3J0VmFsdWUpIHtcbiAgICAgICAgdGhpcy5zZWFyY2ggKz0gYCske3N0YXR9JHtzb3J0Qnl9JHtzb3J0VmFsdWV9YDtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHNlYXJjaEJ5Rm9ybWF0KCkge1xuICAgIGNvbnN0IGZvcm1hdExpbmVzID0gQXJyYXkuZnJvbShcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tYXBpLWZvcm1hdC13cmFwcGVyJylcbiAgICApO1xuXG4gICAgZm9ybWF0TGluZXMuZm9yRWFjaCgobGluZSkgPT4ge1xuICAgICAgY29uc3Qgc3RhdHVzID0gbGluZS5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1sZWdhbC1zdGF0dXMnKS52YWx1ZTtcbiAgICAgIGNvbnN0IGZvcm1hdCA9IGxpbmUucXVlcnlTZWxlY3RvcignLmpzLS1hcGktZm9ybWF0JykudmFsdWU7XG5cbiAgICAgIGlmIChmb3JtYXQgJiYgc3RhdHVzKSB0aGlzLnNlYXJjaCArPSBgKyR7c3RhdHVzfSUzQSR7Zm9ybWF0fWA7XG4gICAgfSk7XG4gIH1cblxuICBzZWFyY2hCeVNldCgpIHtcbiAgICBjb25zdCBzZXRzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1pbmNsdWRlLXNldF0nKSk7XG4gICAgbGV0IHRlbXBvcmFyeVN0ciA9ICcnO1xuXG4gICAgaWYgKHNldHMubGVuZ3RoID4gMCkge1xuICAgICAgc2V0cy5mb3JFYWNoKFxuICAgICAgICAocykgPT5cbiAgICAgICAgICAodGVtcG9yYXJ5U3RyICs9IGBzZXQlM0Eke3MuZ2V0QXR0cmlidXRlKCdkYXRhLWluY2x1ZGUtc2V0Jyl9K09SK2ApXG4gICAgICApO1xuXG4gICAgICB0ZW1wb3JhcnlTdHIgPSB0ZW1wb3JhcnlTdHIuc2xpY2UoMCwgLTQpO1xuICAgICAgdGhpcy5zZWFyY2ggKz0gYCslMjgke3RlbXBvcmFyeVN0cn0lMjlgO1xuICAgIH1cbiAgfVxuXG4gIHNlYXJjaEJ5UmFyaXR5KCkge1xuICAgIGNvbnN0IGJveGVzID0gZWxlbWVudHMuYXBpU2VhcmNoLnJhcml0eUJveGVzO1xuICAgIHZhciB2YWx1ZXMgPSBbXTtcbiAgICBsZXQgdGVtcG9yYXJ5U3RyID0gJyc7XG5cbiAgICAvLyBQdXNoIGFsbCByYXJpdGllcyBnaXZlbiBieSB0aGUgdXNlciBpbnRvIHRoZSB2YWx1ZXMgYXJyYXlcbiAgICBib3hlcy5mb3JFYWNoKChib3gpID0+IHtcbiAgICAgIGlmIChib3guY2hlY2tlZCkgdmFsdWVzLnB1c2goYm94LnZhbHVlKTtcbiAgICB9KTtcblxuICAgIGlmICh2YWx1ZXMubGVuZ3RoID4gMCkge1xuICAgICAgLy8gV2UgbmVlZCBhIHN0YXJ0ZXIgc3RyaW5nIHNvIHdlIGNhbiBzbGljZSBpdCBsYXRlciAlMjggaXMgYW4gb3BlbiBwYXJlbnRoZXNlc1xuICAgICAgdGVtcG9yYXJ5U3RyICs9ICclMjgnO1xuXG4gICAgICAvLyBGb3IgZXZlcnkgdmFsdWUgZ2l2ZW4gYnkgdGhlIHVzZXIgd2UgbmVlZCB0byBhZGQgdGhlICtPUitcbiAgICAgIC8vIHRvIHRoZSBlbmQgZm9yIGdyb3VwaW5nLiBXZSB3aWxsIHJlbW92ZSB0aGUgK09SKyBmcm9tIHRoZSBsYXN0XG4gICAgICAvLyBpdGVyYXRpb24gb2YgdGhlIGxvb3BcbiAgICAgIHZhbHVlcy5mb3JFYWNoKCh2YWx1ZSkgPT4gKHRlbXBvcmFyeVN0ciArPSBgcmFyaXR5JTNBJHt2YWx1ZX0rT1IrYCkpO1xuXG4gICAgICAvLyBSZW1vdmUgdGhlIHVubmVjZXNzYXJ5ICtPUisgYXQgdGhlIGVuZFxuICAgICAgdGVtcG9yYXJ5U3RyID0gdGVtcG9yYXJ5U3RyLnNsaWNlKDAsIC00KTtcblxuICAgICAgLy8gQ2xvc2UgdGhlIHBhcmVudGhlc2VzXG4gICAgICB0ZW1wb3JhcnlTdHIgKz0gYCUyOWA7XG5cbiAgICAgIHRoaXMuc2VhcmNoICs9IGArJHt0ZW1wb3JhcnlTdHJ9YDtcbiAgICB9XG4gIH1cblxuICBzZWFyY2hCeUNvc3QoKSB7XG4gICAgY29uc3QgZGVub21pbmF0aW9uID0gZWxlbWVudHMuYXBpU2VhcmNoLmRlbm9taW5hdGlvbi52YWx1ZTtcbiAgICBjb25zdCBzb3J0QnkgPSBlbGVtZW50cy5hcGlTZWFyY2guZGVub21pbmF0aW9uU29ydEJ5LnZhbHVlO1xuICAgIGNvbnN0IGlucHV0VmFsID0gZWxlbWVudHMuYXBpU2VhcmNoLmRlbm9taW5hdGlvblNvcnRWYWx1ZS52YWx1ZTtcblxuICAgIGlmIChpbnB1dFZhbCkgdGhpcy5zZWFyY2ggKz0gYCske2Rlbm9taW5hdGlvbn0ke3NvcnRCeX0ke2lucHV0VmFsfWA7XG4gIH1cblxuICBxdWlja1NlYXJjaCgpIHtcbiAgICBsZXQgY2FyZE5hbWUgPSBlbGVtZW50cy5uYXYuc2VhcmNoSW5wdXQudmFsdWU7XG4gICAgY2FyZE5hbWUgPSBjYXJkTmFtZS5yZXBsYWNlKCcgJywgJysnKTtcbiAgICByZXR1cm4gY2FyZE5hbWU7XG4gIH1cblxuICBzb3J0UmVzdWx0cygpIHtcbiAgICBjb25zdCBzb3J0QnkgPSBlbGVtZW50cy5hcGlTZWFyY2guY2FyZFNvcnRlci52YWx1ZTtcbiAgICB0aGlzLnNlYXJjaCArPSBgJm9yZGVyPSR7c29ydEJ5fWA7XG4gIH1cblxuICAvLyBUaGlzIG1ldGhvZCB3aWxsIHJ1biBlYWNoIG9mIHRoZSBpbmRpdmlkdWFsIHNlYXJjaCBtZXRob2RzIHRvIGJ1aWxkIHRoZSBmaW5hbCBzZWFyY2ggcXVlcnlcbiAgYnVpbGRTZWFyY2hRdWVyeSgpIHtcbiAgICB0aGlzLnNlYXJjaEJ5TmFtZSgpO1xuICAgIHRoaXMuc2VhcmNoQnlPdGV4dCgpO1xuICAgIHRoaXMuc2VhcmNoQnlDYXJkVHlwZSgpO1xuICAgIHRoaXMuc2VhcmNoQnlDb2xvcigpO1xuICAgIHRoaXMuc2VhcmNoQnlTdGF0cygpO1xuICAgIHRoaXMuc2VhcmNoQnlGb3JtYXQoKTtcbiAgICB0aGlzLnNlYXJjaEJ5U2V0KCk7XG4gICAgdGhpcy5zZWFyY2hCeVJhcml0eSgpO1xuICAgIHRoaXMuc2VhcmNoQnlDb3N0KCk7XG4gICAgdGhpcy5zb3J0UmVzdWx0cygpO1xuXG4gICAgcmV0dXJuIHRoaXMuc2VhcmNoO1xuICB9XG5cbiAgcmVzZXRTZWFyY2hRdWVyeSgpIHtcbiAgICB0aGlzLnNlYXJjaCA9ICcnO1xuICB9XG5cbiAgZGlzcGxheU1ldGhvZCgpIHtcbiAgICByZXR1cm4gZWxlbWVudHMuYXBpU2VhcmNoLmRpc3BsYXlBcy52YWx1ZTtcbiAgfVxuXG4gIC8vIFJldHVucyB0aGUgZmlyc3QgcGFnZSBvZiBjYXJkc1xuICBhc3luYyBnZXRDYXJkcyhzdGF0ZSkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBheGlvc1xuICAgICAgICAuZ2V0KGBodHRwczovL2FwaS5zY3J5ZmFsbC5jb20vY2FyZHMvc2VhcmNoP3E9JHtzdGF0ZS5xdWVyeX1gKVxuICAgICAgICAudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgLy8gVXBkYXRlIHRoZSBzZWFyY2hcbiAgICAgICAgICB0aGlzLnJlc3VsdHMgPSByZXMuZGF0YTtcbiAgICAgICAgICB0aGlzLmNhcmRzID0gcmVzLmRhdGEuZGF0YTtcblxuICAgICAgICAgIC8vIFN0b3JlIHRoZSBjYXJkcyBpbiB0aGUgYWxsQ2FyZHMgYXJyYXlcbiAgICAgICAgICBzdGF0ZS5hbGxDYXJkcy5wdXNoKHJlcy5kYXRhLmRhdGEpO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICBpZiAoZXJyLnJlc3BvbnNlLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICAgICAgICBzdGF0ZS5hbGxDYXJkcy5wdXNoKDQwNCk7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFVzZWQgYnkgZ2V0QWxsQ2FyZHMgdG8gZ2V0IGVhY2ggYXJyYXkgb2YgMTc1IGNhcmRzXG4gIGFzeW5jIGxvb3BOZXh0UGFnZShzdGF0ZSwgZW5hYmxlQnRuKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGF4aW9zLmdldCh0aGlzLnJlc3VsdHMubmV4dF9wYWdlKS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgLy8gVXBkYXRlIHRoZSByZXN1bHRzIG9iamVjdFxuICAgICAgICB0aGlzLnJlc3VsdHMgPSByZXMuZGF0YTtcblxuICAgICAgICAvLyBQdXNoIHRoZSBjYXJkcyBmcm9tIHRoaXMgcmVzdWx0IGludG8gdGhlIGFsbENhcmRzIGFycmF5XG4gICAgICAgIHN0YXRlLmFsbENhcmRzLnB1c2gocmVzLmRhdGEuZGF0YSk7XG5cbiAgICAgICAgLy8gRW5hYmxlIHRoZSBuZXh0IHBhZ2UgYnRuIGFuZCByZXNvbHZlIHRoZSBwcm9taXNlXG4gICAgICAgIGVuYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5uZXh0UGFnZUJ0bik7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gV2lsbCBydW4gaW4gdGhlIGJhY2tncm91bmQgYWZ0ZXIgdGhlIGZpcnN0IHNldCBvZiBjYXJkcyBpcyByZXRyaWV2ZWQgdG8gbWFrZSBtb3ZpbmcgYmV0d2VlbiByZXN1bHRzXG4gIC8vIHBhZ2VzIGZhc3RlclxuICBhc3luYyBnZXRBbGxDYXJkcyhzdGF0ZSwgZW5hYmxlQnRuKSB7XG4gICAgLy8gQXMgbG9uZyBhcyB0aGVyZSBpcyBhIG5leHRfcGFnZSBrZWVwIGxvYWRpbmcgdGhlIGNhcmRzXG4gICAgd2hpbGUgKHRoaXMucmVzdWx0cy5uZXh0X3BhZ2UpIGF3YWl0IHRoaXMubG9vcE5leHRQYWdlKHN0YXRlLCBlbmFibGVCdG4pO1xuXG4gICAgLy8gVXBkYXRlIHRoZSBzdGF0ZSBvbmNlIGFsbCBjYXJkcyBoYXZlIGJlZW4gcmV0cmVpZXZlZFxuICAgIHN0YXRlLmFsbFJlc3VsdHNMb2FkZWQgPSB0cnVlO1xuXG4gICAgLy8gSWYgdGhlcmUgaXMgYXQgbGVhc3QgMiBwYWdlcyBvZiBjYXJkcywgZW5hYmxlIHRoZSBsYXN0IHBhZ2UgYnRuLlxuICAgIGlmIChzdGF0ZS5hbGxDYXJkcy5sZW5ndGggPiAxKSBlbmFibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UubGFzdFBhZ2VCdG4pO1xuICB9XG59XG4iLCJleHBvcnQgY29uc3QgZWxlbWVudHMgPSB7XG4gIG5hdjoge1xuICAgIHF1aWNrU2VhcmNoQnRuOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLW5hdi1zZWFyY2gnKSxcbiAgICBzZWFyY2hJbnB1dDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1uYXYtc2VhcmNoLWlucHV0JyksXG4gIH0sXG4gIGFwaVNlYXJjaDoge1xuICAgIGNhcmROYW1lOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1jYXJkLW5hbWUnKSxcbiAgICBvcmFjbGVUZXh0OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1vLXRleHQnKSxcbiAgICB0eXBlTGluZTogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktdHlwZS1saW5lJyksXG4gICAgc2VsZWN0ZWRUeXBlczogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktc2VsZWN0ZWQtdHlwZXMnKSxcbiAgICBpbmNsdWRlUGFydGlhbFR5cGVzOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS10eXBlLWJveCcpLFxuICAgIHR5cGVEcm9wRG93bjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktdHlwZXMtZHJvcGRvd24nKSxcbiAgICBjb2xvckJveGVzOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWFwaS1jb2xvci1ib3gnKSxcbiAgICBjb2xvclNvcnRCeTogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktY29sb3Itc29ydGVyJyksXG4gICAgc3RhdDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktc3RhdCcpLFxuICAgIHN0YXRGaWx0ZXI6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXN0YXQtZmlsdGVyJyksXG4gICAgc3RhdFZhbHVlOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1zdGF0LXZhbHVlJyksXG4gICAgbGVnYWxTdGF0dXM6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLWxlZ2FsLXN0YXR1cycpLFxuICAgIGZvcm1hdDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktZm9ybWF0JyksXG4gICAgc2V0SW5wdXQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXNldCcpLFxuICAgIHNldERyb3BEb3duOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1zZXQtZHJvcGRvd24nKSxcbiAgICBzZWxlY3RlZFNldHM6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXNlbGVjdGVkLXNldHMnKSxcbiAgICBibG9jazogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktYmxvY2snKSxcbiAgICByYXJpdHlCb3hlczogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1hcGktcmFyaXR5LWJveCcpLFxuICAgIGRlbm9taW5hdGlvbjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktZGVub21pbmF0aW9uJyksXG4gICAgZGVub21pbmF0aW9uU29ydEJ5OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1kZW5vbWluYXRpb24tc29ydC1ieScpLFxuICAgIGRlbm9taW5hdGlvblNvcnRWYWx1ZTogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICcuanMtLWFwaS1kZW5vbWluYXRpb24tc29ydC12YWx1ZSdcbiAgICApLFxuICAgIGNhcmRTb3J0ZXI6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXJlc3VsdHMtc29ydGVyJyksXG4gICAgZGlzcGxheUFzOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1zZWFyY2gtZGlzcGxheS1zZWxlY3RvcicpLFxuICAgIHN1Ym1pdEJ0bjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktYnRuJyksXG4gIH0sXG4gIHJlc3VsdHNQYWdlOiB7XG4gICAgcmVzdWx0c0NvbnRhaW5lcjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktcmVzdWx0cy1kaXNwbGF5JyksXG4gICAgZGlzcGxheVNlbGVjdG9yOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXJlc3VsdHMtZGlzcGxheS1vcHRpb24nKSxcbiAgICBzb3J0Qnk6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tcmVzdWx0cy1zb3J0LW9wdGlvbnMnKSxcbiAgICBidG46IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tcmVzdWx0cy1zdWJtaXQtYnRuJyksXG4gICAgY2FyZENoZWNrbGlzdDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1jYXJkLWNoZWNrbGlzdCcpLFxuICAgIGltYWdlR3JpZDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1pbWFnZS1ncmlkJyksXG4gICAgZGlzcGxheUJhcjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktZGlzcGxheS1iYXInKSxcbiAgICBmaXJzdFBhZ2VCdG46IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLWZpcnN0LXBhZ2UnKSxcbiAgICBwcmV2aW91c1BhZ2VCdG46IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXByZXZpb3VzLXBhZ2UnKSxcbiAgICBuZXh0UGFnZUJ0bjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktbmV4dC1wYWdlJyksXG4gICAgbGFzdFBhZ2VCdG46IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLWxhc3QtcGFnZScpLFxuICB9LFxuICBjYXJkOiB7XG4gICAgbWFuYUNvc3RUaXRsZVNwYW46IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tY2FyZC1tYW5hLWNvc3QnKSxcbiAgICBvcmFjbGVUZXh0czogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1vcmFjbGUtdGV4dC1saW5lJyksXG4gICAgbGVnYWxpdGllczogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1jYXJkLWxlZ2FsaXR5JyksXG4gICAgcHJpbnRSb3dzOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWNhcmQtcHJpbnQtcm93JyksXG4gICAgcHJpY2VzOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWNhcmQtcHJpY2UnKSxcbiAgICBjYXJkUHJpbnRMaW5rczogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1jYXJkLXByaW50LWxpbmsnKSxcbiAgICBmcm9udDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1mcm9udCcpLFxuICAgIGJhY2s6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYmFjaycpLFxuICAgIHRyYW5zZm9ybUJ0bjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1jYXJkLXRyYW5zZm9ybScpLFxuICB9LFxufTtcbiIsImltcG9ydCB7IGdlbmVyYXRlTWFuYUNvc3RJbWFnZXMgfSBmcm9tICcuL3Jlc3VsdHNWaWV3JztcbmltcG9ydCB7IGVsZW1lbnRzIH0gZnJvbSAnLi9iYXNlJztcblxuZXhwb3J0IGNvbnN0IGluc2VydE1hbmFDb3N0VG9DYXJkVGV4dFRpdGxlID0gKCkgPT4ge1xuICBjb25zdCBtYW5hQ29zdHMgPSBBcnJheS5mcm9tKGVsZW1lbnRzLmNhcmQubWFuYUNvc3RUaXRsZVNwYW4pO1xuXG4gIG1hbmFDb3N0cy5mb3JFYWNoKChjb3N0KSA9PiB7XG4gICAgY29zdC5pbm5lckhUTUwgPSBnZW5lcmF0ZU1hbmFDb3N0SW1hZ2VzKFxuICAgICAgY29zdC5nZXRBdHRyaWJ1dGUoJ2RhdGEtbWFuYS1jb3N0JylcbiAgICApO1xuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBpbnNlcnRNYW5hQ29zdFRvT3JhY2xlVGV4dCA9ICgpID0+IHtcbiAgY29uc3Qgb3JhY2xlVGV4dHMgPSBBcnJheS5mcm9tKGVsZW1lbnRzLmNhcmQub3JhY2xlVGV4dHMpO1xuXG4gIGlmIChvcmFjbGVUZXh0cy5sZW5ndGggPiAwKSB7XG4gICAgb3JhY2xlVGV4dHMuZm9yRWFjaChcbiAgICAgICh0ZXh0KSA9PiAodGV4dC5pbm5lckhUTUwgPSBnZW5lcmF0ZU1hbmFDb3N0SW1hZ2VzKHRleHQuaW5uZXJIVE1MLCAneHMnKSlcbiAgICApO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgcmVtb3ZlVW5kZXJTY29yZUZyb21MZWdhbFN0YXR1cyA9ICgpID0+IHtcbiAgY29uc3QgbGVnYWxpdGllcyA9IEFycmF5LmZyb20oZWxlbWVudHMuY2FyZC5sZWdhbGl0aWVzKTtcblxuICBsZWdhbGl0aWVzLmZvckVhY2goKGxlZ2FsaXR5KSA9PiB7XG4gICAgaWYgKGxlZ2FsaXR5LmlubmVySFRNTC5pbmNsdWRlcygnXycpKSB7XG4gICAgICBsZWdhbGl0eS5pbm5lckhUTUwgPSBsZWdhbGl0eS5pbm5lckhUTUwucmVwbGFjZSgnXycsICcgJyk7XG4gICAgfVxuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBmaXhDYXJkUHJpY2VzID0gKCkgPT4ge1xuICBjb25zdCBwcmljZXMgPSBBcnJheS5mcm9tKGVsZW1lbnRzLmNhcmQucHJpY2VzKTtcblxuICBwcmljZXMuZm9yRWFjaCgocHJpY2UpID0+IHtcbiAgICBpZiAocHJpY2UuaW5uZXJIVE1MLmluY2x1ZGVzKCdOb25lJykpIHByaWNlLmlubmVySFRNTCA9ICctJztcbiAgfSk7XG59O1xuXG5jb25zdCBmaXhEb3VibGVTaWRlZENhcmROYW1lID0gKGNhcmROYW1lKSA9PiB7XG4gIGlmIChjYXJkTmFtZS5pbmNsdWRlcygnLycpKSB7XG4gICAgY2FyZE5hbWUgPSBjYXJkTmFtZS5zdWJzdHJpbmcoMCwgY2FyZE5hbWUuaW5kZXhPZignLycpIC0gMSk7XG4gIH1cbiAgcmV0dXJuIGNhcmROYW1lO1xufTtcblxuZXhwb3J0IGNvbnN0IHNldFByaW50TGlua0hyZWYgPSAoKSA9PiB7XG4gIGNvbnN0IGxpbmtzID0gQXJyYXkuZnJvbShlbGVtZW50cy5jYXJkLmNhcmRQcmludExpbmtzKTtcblxuICBsaW5rcy5mb3JFYWNoKChsaW5rKSA9PiB7XG4gICAgbGV0IGNhcmROYW1lID0gbGluay5nZXRBdHRyaWJ1dGUoJ2RhdGEtbmFtZScpLnJlcGxhY2VBbGwoJyAnLCAnLScpO1xuICAgIGNhcmROYW1lID0gZml4RG91YmxlU2lkZWRDYXJkTmFtZShjYXJkTmFtZSk7XG4gICAgY29uc3Qgc2V0Q29kZSA9IGxpbmsuZ2V0QXR0cmlidXRlKCdkYXRhLXNldCcpO1xuXG4gICAgbGluay5ocmVmID0gYC9jYXJkLyR7c2V0Q29kZX0vJHtjYXJkTmFtZX1gO1xuICB9KTtcbn07XG5cbmNvbnN0IHNldERvdWJsZVNpZGVkVHJhbnNpdGlvbiA9ICgpID0+IHtcbiAgLy8gQ2hlY2tzIHRvIHNlZSBpZiBhbiBpbmxpbmUgc3R5bGUgaGFzIGJlZW4gc2V0IGZvciB0aGUgZnJvbnQgb2YgdGhlIGNhcmQuXG4gIC8vIElmIG5vdCwgc2V0IGEgdHJhbnNpdG9uLiBUaGlzIG1ha2VzIHN1cmUgd2UgZG9uJ3Qgc2V0IHRoZSB0cmFuc2l0b24gZXZlcnlcbiAgLy8gdGltZSB0aGUgY2FyZCBpcyBmbGlwcGVkLlxuICBpZiAoIWVsZW1lbnRzLmNhcmQuZnJvbnQuZ2V0QXR0cmlidXRlKCdzdHlsZScpKSB7XG4gICAgZWxlbWVudHMuY2FyZC5mcm9udC5zdHlsZS50cmFuc2l0aW9uID0gYGFsbCAuOHMgZWFzZWA7XG4gICAgZWxlbWVudHMuY2FyZC5iYWNrLnN0eWxlLnRyYW5zaXRpb24gPSBgYWxsIC44cyBlYXNlYDtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGZsaXBUb0JhY2tTaWRlID0gKCkgPT4ge1xuICAvLyBTZXRzIHRoZSB0cmFuc2l0aW9uIHByb3BlcnR5IG9uIGJvdGggc2lkZXMgb2YgdGhlIGNhcmQgdGhlIGZpcnN0IHRpbWUgdGhlXG4gIC8vIHRyYW5zZm9ybSBidXR0b24gaXMgY2xpY2tlZFxuICBzZXREb3VibGVTaWRlZFRyYW5zaXRpb24oKTtcblxuICAvLyBSb3RhdGVzIHRoZSBjYXJkIHRvIHNob3cgdGhlIGJhY2tzaWRlLlxuICBlbGVtZW50cy5jYXJkLmZyb250LnN0eWxlLnRyYW5zZm9ybSA9IGByb3RhdGVZKC0xODBkZWcpYDtcbiAgZWxlbWVudHMuY2FyZC5iYWNrLnN0eWxlLnRyYW5zZm9ybSA9IGByb3RhdGVZKDApYDtcblxuICAvLyBSZXNldCB0aGUgZXZlbnQgbGlzdGVuZXIgc28gdGhhdCBvbiBjbGlja2luZyB0aGUgYnV0dG9uIGl0IHdpbGwgZmxpcFxuICAvLyBiYWNrIHRvIHRoZSBmcm9udCBvZiB0aGUgY2FyZFxuICBlbGVtZW50cy5jYXJkLnRyYW5zZm9ybUJ0bi5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIGZsaXBUb0JhY2tTaWRlKTtcbiAgZWxlbWVudHMuY2FyZC50cmFuc2Zvcm1CdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmbGlwVG9Gcm9udFNpZGUpO1xufTtcblxuZXhwb3J0IGNvbnN0IGZsaXBUb0Zyb250U2lkZSA9ICgpID0+IHtcbiAgZWxlbWVudHMuY2FyZC5mcm9udC5zdHlsZS50cmFuc2Zvcm0gPSBgcm90YXRlWSgwKWA7XG4gIGVsZW1lbnRzLmNhcmQuYmFjay5zdHlsZS50cmFuc2Zvcm0gPSBgcm90YXRlWSgxODBkZWcpYDtcblxuICAvLyBSZXNldCB0aGUgZXZlbnQgbGlzdGVuZXIgc28gdGhhdCBvbiBjbGlja2luZyB0aGUgYnV0dG9uIGl0IHdpbGwgZmxpcFxuICAvLyB0byB0aGUgYmFja3NpZGUgb2YgdGhlIGNhcmRcbiAgZWxlbWVudHMuY2FyZC50cmFuc2Zvcm1CdG4ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmbGlwVG9Gcm9udFNpZGUpO1xuICBlbGVtZW50cy5jYXJkLnRyYW5zZm9ybUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZsaXBUb0JhY2tTaWRlKTtcbn07XG5cbi8vIENyZWF0ZSB0aGUgaG92ZXIgZWZmZWN0IG9uIGVhY2ggcm93IHRoYXQgZGlzcGxheXMgdGhlIGltYWdlIG9mIHRoZSBjYXJkXG5leHBvcnQgY29uc3QgcHJpbnRMaXN0SG92ZXJFdmVudHMgPSAoKSA9PiB7XG4gIC8vIEdldCB0aGUgSFRNTCBmb3IgZWFjaCB0YWJsZSByb3dcbiAgY29uc3QgcHJpbnRzID0gQXJyYXkuZnJvbShlbGVtZW50cy5jYXJkLnByaW50Um93cyk7XG5cbiAgcHJpbnRzLmZvckVhY2goKHByaW50KSA9PiB7XG4gICAgcHJpbnQub25tb3VzZW1vdmUgPSAoZSkgPT4ge1xuICAgICAgLy8gSWYgdGhlIHdpbmRvdyBpcyBzbWFsbGVyIHRoYW4gNzY4IHBpeGVscywgZG9uJ3QgZGlzcGxheSBhbnkgaW1hZ2VzXG4gICAgICBpZiAod2luZG93LmlubmVyV2lkdGggPCA3NjgpIHJldHVybiBmYWxzZTtcblxuICAgICAgLy8gSWYgdGhlcmUgaXMgYWxyZWFkeSBhbiBpbWFnZSBiZWluZyBkaXNwbGF5ZWQsIHJlbW92ZSBpdCBmcm9tIHRoZSBET01cbiAgICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudG9vbHRpcCcpKSB7XG4gICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRvb2x0aXAnKSk7XG4gICAgICB9XG5cbiAgICAgIC8vIFByZXAgdGhlIGRpdi5cbiAgICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgZGl2LmNsYXNzTmFtZSA9ICd0b29sdGlwJztcblxuICAgICAgLy8gVGhlIGRpdiBpcyBzdHlsZWQgd2l0aCBwb3NpdGlvbiBhYnNvbHV0ZS4gVGhpcyBjb2RlIHB1dHMgaXQganVzdCB0byB0aGUgcmlnaHQgb2YgdGhlIGN1cnNvclxuICAgICAgZGl2LnN0eWxlLmxlZnQgPSBlLnBhZ2VYICsgNTAgKyAncHgnO1xuICAgICAgZGl2LnN0eWxlLnRvcCA9IGUucGFnZVkgLSAzMCArICdweCc7XG5cbiAgICAgIC8vIFByZXAgdGhlIGltZyBlbGVtZW50XG4gICAgICBjb25zdCBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcbiAgICAgIGltZy5jbGFzc05hbWUgPSAndG9vbHRpcF9faW1nJztcbiAgICAgIGltZy5zcmMgPSBwcmludC5nZXRBdHRyaWJ1dGUoJ2RhdGEtY2FyZEltZycpO1xuXG4gICAgICAvLyBQdXQgdGhlIGltZyBpbnRvIHRoZSBkaXYgYW5kIHRoZW4gYXBwZW5kIHRoZSBkaXYgZGlyZWN0bHkgdG8gdGhlIGJvZHkgb2YgdGhlIGRvY3VtZW50LlxuICAgICAgZGl2LmFwcGVuZENoaWxkKGltZyk7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpdik7XG4gICAgfTtcblxuICAgIC8vIFJlbW92ZSB0aGUgaW1nIHdoZW4gdGFraW5nIHRoZSBjdXJzb3Igb2ZmIHRoZSBwcmludFxuICAgIHByaW50Lm9ubW91c2VvdXQgPSAoZSkgPT4ge1xuICAgICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50b29sdGlwJykpIHtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudG9vbHRpcCcpKTtcbiAgICAgIH1cbiAgICB9O1xuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBjaGVja1ByaWNlSW5wdXRGb3JEaWdpdHMgPSAoZSkgPT4ge1xuICBjb25zdCBwcmljZUlucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hZGQtdG8taW52LXByaWNlJykudmFsdWU7XG5cbiAgaWYgKGlzTmFOKHByaWNlSW5wdXQpICYmIHByaWNlSW5wdXQgIT09ICcnKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHJlbmRlclByaWNlSW5wdXRFcnJvck1lc3NhZ2UoKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn07XG5cbmNvbnN0IHJlbmRlclByaWNlSW5wdXRFcnJvck1lc3NhZ2UgPSAoKSA9PiB7XG4gIGNvbnN0IHByaWNlSW5wdXREaXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFkZC10by1pbnYtcHJpY2UtZGl2Jyk7XG4gIGNvbnN0IG1zZyA9IGA8cCBjbGFzcz1cImFkZC10by1pbnYtcHJpY2UtbXNnXCI+SW52YWxpZCBwcmljZS4gTXVzdCBiZSBhIG51bWJlci48L3A+YDtcblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5hZGQtdG8taW52LXByaWNlLW1zZycpKSB7XG4gICAgcHJpY2VJbnB1dERpdi5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWVuZCcsIG1zZyk7XG4gIH1cbn07XG4iLCJpbXBvcnQgeyBlbGVtZW50cyB9IGZyb20gJy4vYmFzZSc7XG5pbXBvcnQgKiBhcyBzZWFyY2hWaWV3IGZyb20gJy4vc2VhcmNoVmlldyc7XG5cbmV4cG9ydCBjb25zdCBjaGVja1ByaWNlSW5wdXRGb3JEaWdpdHMgPSAoZSkgPT4ge1xuICBjb25zdCBwcmljZUlucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1pbnYtZGVub21pbmF0aW9uLXNvcnQtdmFsdWUnKVxuICAgIC52YWx1ZTtcblxuICBpZiAoaXNOYU4ocHJpY2VJbnB1dCkgJiYgcHJpY2VJbnB1dCAhPT0gJycpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgcmVuZGVyUHJpY2VJbnB1dEVycm9yTWVzc2FnZSgpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufTtcblxuY29uc3QgcmVuZGVyUHJpY2VJbnB1dEVycm9yTWVzc2FnZSA9ICgpID0+IHtcbiAgY29uc3QgcHJpY2VJbnB1dERpdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taW52LXNlYXJjaC1wcmljZS1kaXYnKTtcbiAgY29uc3QgbXNnID0gYDxwIGNsYXNzPVwiaW52LXNlYXJjaC1wcmljZS1tc2dcIj5JbnZhbGlkIHByaWNlLiBNdXN0IGJlIGEgbnVtYmVyLjwvcD5gO1xuXG4gIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmludi1zZWFyY2gtcHJpY2UtbXNnJykpIHtcbiAgICBwcmljZUlucHV0RGl2Lmluc2VydEFkamFjZW50SFRNTCgnYmVmb3JlZW5kJywgbXNnKTtcbiAgfVxufTtcblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqIFRZUEUgTElORSAqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuXG5jb25zdCBoaWRlVHlwZXNEcm9wRG93bkJ1dEtlZXBWYWx1ZSA9ICgpID0+IHtcbiAgaWYgKCFlbGVtZW50cy5hcGlTZWFyY2gudHlwZURyb3BEb3duLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIHtcbiAgICBlbGVtZW50cy5hcGlTZWFyY2gudHlwZURyb3BEb3duLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgbmF2aWdhdGVUeXBlc0Ryb3BEb3duKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IHN0YXJ0VHlwZXNEcm9wRG93bk5hdmlnYXRpb24gPSAoKSA9PiB7XG4gIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBuYXZpZ2F0ZVR5cGVzRHJvcERvd24pO1xuICBjb25zdCBmaXJzdFR5cGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXR5cGU6bm90KFtoaWRkZW5dKScpO1xuICBzZWFyY2hWaWV3LmhpZ2hsaWdodFR5cGUoZmlyc3RUeXBlKTtcbiAgc2VhcmNoVmlldy5ob3Zlck92ZXJUeXBlc0xpc3RlbmVyKCk7XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBuYXZpZ2F0ZVR5cGVzRHJvcERvd24pO1xuICBlbGVtZW50cy5hcGlTZWFyY2gudHlwZURyb3BEb3duLnNjcm9sbFRvcCA9IDA7XG59O1xuXG5jb25zdCBuYXZpZ2F0ZVR5cGVzRHJvcERvd24gPSAoZSkgPT4ge1xuICBjb25zdCB0eXBlcyA9IEFycmF5LmZyb20oXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS10eXBlOm5vdChbaGlkZGVuXSknKVxuICApO1xuICBjb25zdCBpID0gdHlwZXMuaW5kZXhPZihkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWhpZ2hsaWdodGVkJykpO1xuXG4gIGlmIChlLmNvZGUgPT09ICdBcnJvd0Rvd24nICYmIGkgPCB0eXBlcy5sZW5ndGggLSAxKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHNlYXJjaFZpZXcucmVtb3ZlQ3VycmVudEhpZ2hsaWdodCgpO1xuICAgIHNlYXJjaFZpZXcuaGlnaGxpZ2h0VHlwZSh0eXBlc1tpICsgMV0pO1xuXG4gICAgc2VhcmNoVmlldy5zZXRTY3JvbGxUb3BPbkRvd25BcnJvdyhcbiAgICAgIHR5cGVzW2kgKyAxXSxcbiAgICAgIGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlRHJvcERvd25cbiAgICApO1xuICB9XG5cbiAgaWYgKGUuY29kZSA9PT0gJ0Fycm93VXAnKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgLy8gV2UgYWx3YXlzIHdhbnQgdG8gcHJldmVudCB0aGUgZGVmYXVsdC4gV2Ugb25seSB3YW50IHRvIGNoYW5nZSB0aGVcbiAgICAvLyBoaWdobGlnaHQgaWYgbm90IG9uIHRoZSB0b3AgdHlwZSBpbiB0aGUgZHJvcGRvd25cbiAgICBpZiAoaSA+IDApIHtcbiAgICAgIHNlYXJjaFZpZXcucmVtb3ZlQ3VycmVudEhpZ2hsaWdodCgpO1xuICAgICAgc2VhcmNoVmlldy5oaWdobGlnaHRUeXBlKHR5cGVzW2kgLSAxXSk7XG5cbiAgICAgIHNlYXJjaFZpZXcuc2V0U2Nyb2xsVG9wT25VcEFycm93KFxuICAgICAgICB0eXBlc1tpIC0gMV0sXG4gICAgICAgIGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlRHJvcERvd25cbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgaWYgKGUuY29kZSA9PT0gJ0VudGVyJykge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBzZXRJbnB1dFZhbHVlKFxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1oaWdobGlnaHRlZCcpLmdldEF0dHJpYnV0ZSgnZGF0YS10eXBlJylcbiAgICApO1xuICAgIGhpZGVUeXBlc0Ryb3BEb3duQnV0S2VlcFZhbHVlKCk7XG4gIH1cbn07XG5cbmNvbnN0IHNldElucHV0VmFsdWUgPSAodHlwZSkgPT4ge1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS10eXBlLWxpbmUnKS52YWx1ZSA9IHR5cGU7XG59O1xuXG5leHBvcnQgY29uc3QgdHlwZUxpbmVMaXN0ZW5lciA9IChlKSA9PiB7XG4gIC8vIElmIHRoZSB0YXJnZXQgaXMgbm90IFR5cGUgTGluZSBpbnB1dCBsaW5lLCBvciBhbiBlbGVtZW50IGluIHRoZSBkcm9wZG93biBsaXN0LFxuICAvLyBjbG9zZSB0aGUgZHJvcGRvd24gYW5kIHJlbW92ZSB0aGUgZXZlbnQgbGlzdGVuZXJcbiAgaWYgKFxuICAgIGUudGFyZ2V0ICE9PSBlbGVtZW50cy5hcGlTZWFyY2gudHlwZUxpbmUgJiZcbiAgICAhZS50YXJnZXQubWF0Y2hlcygnLmpzLS1hcGktZHJvcGRvd24tdHlwZXMtbGlzdCcpXG4gICkge1xuICAgIHNlYXJjaFZpZXcuaGlkZVR5cGVzRHJvcERvd24oKTtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHR5cGVMaW5lTGlzdGVuZXIpO1xuICAgIC8vIElmIHRoZSB0YXJnZXQgaXMgb25lIGlmIHR5cGVzLCBnZXQgdGhlIGRhdGEgdHlwZVxuICB9IGVsc2UgaWYgKGUudGFyZ2V0Lmhhc0F0dHJpYnV0ZSgnZGF0YS10eXBlJykpIHtcbiAgICBzZXRJbnB1dFZhbHVlKGUudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS10eXBlJykpO1xuICAgIGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlTGluZS5mb2N1cygpO1xuICAgIGhpZGVUeXBlc0Ryb3BEb3duQnV0S2VlcFZhbHVlKCk7XG4gIH1cbn07XG5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKioqKiBTRVRTICoqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcblxuY29uc3QgaGlkZVNldHNEcm9wRG93bkJ1dEtlZXBWYWx1ZSA9ICgpID0+IHtcbiAgaWYgKCFlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd24uaGFzQXR0cmlidXRlKCdoaWRkZW4nKSkge1xuICAgIGVsZW1lbnRzLmFwaVNlYXJjaC5zZXREcm9wRG93bi5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG5hdmlnYXRlU2V0c0Ryb3BEb3duKTtcbiAgfVxufTtcblxuY29uc3QgbmF2aWdhdGVTZXRzRHJvcERvd24gPSAoZSkgPT4ge1xuICBjb25zdCBzZXRzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLXNldDpub3QoW2hpZGRlbl0pJykpO1xuICBjb25zdCBpID0gc2V0cy5pbmRleE9mKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taGlnaGxpZ2h0ZWQnKSk7XG5cbiAgaWYgKGUuY29kZSA9PT0gJ0Fycm93RG93bicgJiYgaSA8IHNldHMubGVuZ3RoIC0gMSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBzZWFyY2hWaWV3LnJlbW92ZUN1cnJlbnRIaWdobGlnaHQoKTtcbiAgICBzZWFyY2hWaWV3LmhpZ2hsaWdodFNldChzZXRzW2kgKyAxXSk7XG5cbiAgICBzZWFyY2hWaWV3LnNldFNjcm9sbFRvcE9uRG93bkFycm93KFxuICAgICAgc2V0c1tpICsgMV0sXG4gICAgICBlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd25cbiAgICApO1xuICB9XG5cbiAgaWYgKGUuY29kZSA9PT0gJ0Fycm93VXAnICYmIGkgPiAwKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHNlYXJjaFZpZXcucmVtb3ZlQ3VycmVudEhpZ2hsaWdodCgpO1xuICAgIHNlYXJjaFZpZXcuaGlnaGxpZ2h0U2V0KHNldHNbaSAtIDFdKTtcblxuICAgIHNlYXJjaFZpZXcuc2V0U2Nyb2xsVG9wT25VcEFycm93KFxuICAgICAgc2V0c1tpIC0gMV0sXG4gICAgICBlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd25cbiAgICApO1xuICB9XG5cbiAgaWYgKGUuY29kZSA9PT0gJ0VudGVyJykge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIGFkZFNldChcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taGlnaGxpZ2h0ZWQnKS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2V0LW5hbWUnKVxuICAgICk7XG5cbiAgICBoaWRlU2V0c0Ryb3BEb3duQnV0S2VlcFZhbHVlKCk7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBzdGFydFNldHNEcm9wRG93bk5hdmlnYXRpb24gPSAoKSA9PiB7XG4gIGNvbnN0IGZpcnN0U2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1zZXQ6bm90KFtoaWRkZW5dKScpO1xuICBzZWFyY2hWaWV3LmhpZ2hsaWdodFNldChmaXJzdFNldCk7XG4gIHNlYXJjaFZpZXcuaG92ZXJPdmVyU2V0c0xpc3RlbmVyKCk7XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBuYXZpZ2F0ZVNldHNEcm9wRG93bik7XG4gIGVsZW1lbnRzLmFwaVNlYXJjaC5zZXREcm9wRG93bi5zY3JvbGxUb3AgPSAwO1xufTtcblxuY29uc3QgYWRkU2V0ID0gKHNldE5hbWUpID0+IHtcbiAgZWxlbWVudHMuYXBpU2VhcmNoLnNldElucHV0LnZhbHVlID0gc2V0TmFtZTtcbn07XG5cbmV4cG9ydCBjb25zdCBzZXRJbnB1dExpc3RlbmVyID0gKGUpID0+IHtcbiAgLy8gSWYgdGhlIHRhcmdldCBpcyBub3QgdGhlIHNldCBpbnB1dCBmaWVsZCwgb3IgYW4gZWxlbWVudCBpbiB0aGUgZHJvcGRvd24gbGlzdCxcbiAgLy8gY2xvc2UgdGhlIGRyb3Bkb3duIGFuZCByZW1vdmUgdGhlIGV2ZW50IGxpc3RlbmVyXG4gIGlmIChcbiAgICBlLnRhcmdldCAhPT0gZWxlbWVudHMuYXBpU2VhcmNoLnNldElucHV0ICYmXG4gICAgIWUudGFyZ2V0Lm1hdGNoZXMoJy5qcy0tYXBpLWRyb3Bkb3duLXNldHMtbGlzdCcpXG4gICkge1xuICAgIHNlYXJjaFZpZXcuaGlkZVNldHNEcm9wRG93bigpO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2V0SW5wdXRMaXN0ZW5lcik7XG4gICAgLy8gSWYgdGhlIHRhcmdldCBpcyBvbmUgb2YgdGhlIHNldCBvcHRpb25zLCB0b2dnbGUgaXQgYXMgc2VsZWN0ZWQsIGFkZCBpdCB0byB0aGUgbGlzdCxcbiAgICAvLyBhbmQgaGlkZSB0aGUgZHJvcGRvd24uXG4gIH0gZWxzZSBpZiAoZS50YXJnZXQuaGFzQXR0cmlidXRlKCdkYXRhLXNldC1uYW1lJykpIHtcbiAgICBhZGRTZXQoZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXNldC1uYW1lJykpO1xuICAgIGVsZW1lbnRzLmFwaVNlYXJjaC5zZXRJbnB1dC5mb2N1cygpO1xuICAgIGhpZGVTZXRzRHJvcERvd25CdXRLZWVwVmFsdWUoKTtcbiAgfVxufTtcbiIsImltcG9ydCB7IGdlbmVyYXRlTWFuYUNvc3RJbWFnZXMgfSBmcm9tICcuL3Jlc3VsdHNWaWV3JztcbmltcG9ydCB7IGNoZWNrTGlzdEhvdmVyRXZlbnRzIH0gZnJvbSAnLi9yZXN1bHRzVmlldyc7XG5cbmNvbnN0IHNob3J0ZW5UeXBlTGluZSA9ICgpID0+IHtcbiAgY29uc3QgdHlwZXMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0taW52LXR5cGVzJykpO1xuICB0eXBlcy5mb3JFYWNoKCh0eXBlKSA9PiB7XG4gICAgbGV0IGh0bWwgPSB0eXBlLmlubmVySFRNTDtcblxuICAgIC8vIGlmIHRoZSDigJQgZGVsaW1pdGVyIGlzIGZvdW5kIGluIHRoZSBzdHJpbmcsIHJldHVybiBldmVyeXRoaW5nIGJlZm9yZSB0aGUgZGVsaW1pdGVyXG4gICAgaWYgKGh0bWwuaW5kZXhPZign4oCUJykgIT09IC0xKSB7XG4gICAgICB0eXBlLmlubmVySFRNTCA9IGh0bWwuc3Vic3RyaW5nKDAsIGh0bWwuaW5kZXhPZign4oCUJykgLSAxKTtcbiAgICB9XG4gIH0pO1xufTtcblxuY29uc3QgYWx0ZXJNYW5hSW1hZ2VzID0gKCkgPT4ge1xuICBjb25zdCBtYW5hQ29zdHMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0taW52LW1hbmEtY29zdCcpKTtcblxuICBtYW5hQ29zdHMuZm9yRWFjaCgoY29zdCkgPT4ge1xuICAgIGNvc3QuaW5uZXJIVE1MID0gZ2VuZXJhdGVNYW5hQ29zdEltYWdlcyhjb3N0LmlubmVySFRNTCk7XG4gIH0pO1xufTtcblxuLy8gTm90IHVzaW5nIHRoaXMgcmlnaHQgbm93ICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbmNvbnN0IHNvcnRUYWJsZUFscGhhYmV0aWNhbGx5ID0gKCkgPT4ge1xuICBsZXQgcm93cyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1jaGVja2xpc3Qtcm93JykpO1xuICBjb25zdCB0YWJsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tY2FyZC1jaGVja2xpc3QnKTtcbiAgbGV0IGNhcmRzID0gW107XG5cbiAgcm93cy5mb3JFYWNoKChyb3cpID0+IHtcbiAgICBjYXJkcy5wdXNoKHJvdy5xdWVyeVNlbGVjdG9yKCcuanMtLWNoZWNrbGlzdC1jYXJkLW5hbWUnKS5pbm5lckhUTUwpO1xuICAgIHJvdy5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKHJvdyk7XG4gIH0pO1xuXG4gIGNhcmRzID0gY2FyZHMuc29ydCgpO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY2FyZHMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCByb3dJbmRleCA9IHJvd3MuaW5kZXhPZihcbiAgICAgIHJvd3MuZmluZCgocm93KSA9PiByb3cuZ2V0QXR0cmlidXRlKCdkYXRhLXJvdycpID09PSBjYXJkc1tpXSlcbiAgICApO1xuXG4gICAgdGFibGUuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdiZWZvcmVlbmQnLCByb3dzW3Jvd0luZGV4XSk7XG5cbiAgICByb3dzLnNwbGljZShyb3dJbmRleCwgMSk7XG4gIH1cbn07XG5cbmNvbnN0IGdpdmVFYXJuaW5nc0NvbHVtbk1vZGlmaWVyID0gKCkgPT4ge1xuICBjb25zdCByb3dzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWludi1lYXJuaW5ncycpKTtcbiAgY29uc29sZS5sb2cocm93cyk7XG5cbiAgcm93cy5mb3JFYWNoKChyb3cpID0+IHtcbiAgICBpZiAocm93LmlubmVyVGV4dC5zdGFydHNXaXRoKCctJykpIHtcbiAgICAgIHJvdy5jbGFzc0xpc3QuYWRkKCduZWdhdGl2ZS1lYXJuaW5ncycpO1xuICAgIH0gZWxzZSBpZiAocm93LmlubmVyVGV4dCA9PT0gJzAuMCcpIHtcbiAgICAgIHJvdy5jbGFzc0xpc3QuYWRkKCduby1lYXJuaW5ncycpO1xuICAgIH0gZWxzZSB7XG4gICAgICByb3cuY2xhc3NMaXN0LmFkZCgncG9zaXRpdmUtZWFybmluZ3MnKTtcbiAgICB9XG4gIH0pO1xufTtcblxuY29uc3QgcmVtb3ZlSGFzaFRhZ0Zyb21SYXJpdHkgPSAoKSA9PiB7XG4gIGNvbnN0IHJhcml0eXMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tcmFyaXR5JykpO1xuICByYXJpdHlzLmZvckVhY2goKHIpID0+IChyLmlubmVyVGV4dCA9IHIuaW5uZXJUZXh0LnN1YnN0cmluZygxKSkpO1xufTtcblxuZXhwb3J0IGNvbnN0IGFsdGVySW52ZW50b3J5VGFibGUgPSAoKSA9PiB7XG4gIHNob3J0ZW5UeXBlTGluZSgpO1xuICBhbHRlck1hbmFJbWFnZXMoKTtcbiAgY2hlY2tMaXN0SG92ZXJFdmVudHMoKTtcbiAgZ2l2ZUVhcm5pbmdzQ29sdW1uTW9kaWZpZXIoKTtcbiAgcmVtb3ZlSGFzaFRhZ0Zyb21SYXJpdHkoKTtcbn07XG4iLCJpbXBvcnQgeyBlbGVtZW50cyB9IGZyb20gJy4vYmFzZSc7XG5cbmNvbnN0IGNsZWFyQ2hlY2tsaXN0ID0gKCkgPT4ge1xuICBjb25zdCBjaGVja0xpc3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWNhcmQtY2hlY2tsaXN0Jyk7XG4gIGlmIChjaGVja0xpc3QpIHtcbiAgICBjaGVja0xpc3QucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChjaGVja0xpc3QpO1xuXG4gICAgLy8gUmVtb3ZlIGFueSB0b29sIHRpcCBpbWFnZXMgaWYgdXNlciB3YXMgaG92ZXJpbmdcbiAgICBjb25zdCB0b29sVGlwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRvb2x0aXAnKTtcbiAgICBpZiAodG9vbFRpcCkgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCh0b29sVGlwKTtcbiAgfVxufTtcblxuY29uc3QgY2xlYXJJbWFnZUdyaWQgPSAoKSA9PiB7XG4gIGNvbnN0IGdyaWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWltYWdlLWdyaWQnKTtcbiAgaWYgKGdyaWQpIGdyaWQucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChncmlkKTtcbn07XG5cbmNvbnN0IGNsZWFyUmVzdWx0cyA9ICgpID0+IHtcbiAgY2xlYXJDaGVja2xpc3QoKTtcbiAgY2xlYXJJbWFnZUdyaWQoKTtcbn07XG5cbmNvbnN0IHByZXBJbWFnZUNvbnRhaW5lciA9ICgpID0+IHtcbiAgY29uc3QgbWFya3VwID0gYFxuICAgICAgICA8ZGl2IGNsYXNzPVwiaW1hZ2UtZ3JpZCBqcy0taW1hZ2UtZ3JpZFwiPjwvZGl2PlxuICAgIGA7XG4gIGVsZW1lbnRzLnJlc3VsdHNQYWdlLnJlc3VsdHNDb250YWluZXIuaW5zZXJ0QWRqYWNlbnRIVE1MKCdiZWZvcmVlbmQnLCBtYXJrdXApO1xufTtcblxuY29uc3QgZ2VuZXJhdGVTaW5nbGVTaWRlZENhcmQgPSAoY2FyZCkgPT4ge1xuICBjb25zdCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgY29uc3QgaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG5cbiAgYS5jbGFzc0xpc3QgPSBgaW1hZ2UtZ3JpZF9fbGluayBqcy0taW1hZ2UtZ3JpZC1saW5rYDtcbiAgYS5ocmVmID0gYC9jYXJkLyR7Y2FyZC5zZXR9LyR7cGFyc2VDYXJkTmFtZShjYXJkLm5hbWUpfWA7XG5cbiAgZGl2LmNsYXNzTGlzdCA9IGBpbWFnZS1ncmlkX19jb250YWluZXJgO1xuICBpbWcuc3JjID0gYCR7Y2FyZC5pbWFnZV91cmlzLm5vcm1hbH1gO1xuICBpbWcuYWx0ID0gYCR7Y2FyZC5uYW1lfWA7XG4gIGltZy5jbGFzc0xpc3QgPSBgaW1hZ2UtZ3JpZF9faW1hZ2VgO1xuICBkaXYuYXBwZW5kQ2hpbGQoaW1nKTtcbiAgYS5hcHBlbmRDaGlsZChkaXYpO1xuXG4gIGRvY3VtZW50XG4gICAgLnF1ZXJ5U2VsZWN0b3IoJy5qcy0taW1hZ2UtZ3JpZCcpXG4gICAgLmluc2VydEFkamFjZW50RWxlbWVudCgnYmVmb3JlZW5kJywgYSk7XG59O1xuXG5jb25zdCBzaG93QmFja1NpZGUgPSAoY2FyZCkgPT4ge1xuICBjb25zdCBmcm9udCA9IGNhcmQucXVlcnlTZWxlY3RvcignLmpzLS1pbWFnZS1ncmlkLWNhcmQtc2lkZS1mcm9udCcpO1xuICBjb25zdCBiYWNrID0gY2FyZC5xdWVyeVNlbGVjdG9yKCcuanMtLWltYWdlLWdyaWQtY2FyZC1zaWRlLWJhY2snKTtcblxuICBmcm9udC5zdHlsZS50cmFuc2Zvcm0gPSAncm90YXRlWSgtMTgwZGVnKSc7XG4gIGJhY2suc3R5bGUudHJhbnNmb3JtID0gJ3JvdGF0ZVkoMCknO1xuXG4gIGZyb250LmNsYXNzTGlzdC5yZW1vdmUoJ2pzLS1zaG93aW5nJyk7XG4gIGJhY2suY2xhc3NMaXN0LmFkZCgnanMtLXNob3dpbmcnKTtcbn07XG5cbmNvbnN0IHNob3dGcm9udFNpZGUgPSAoY2FyZCkgPT4ge1xuICBjb25zdCBmcm9udCA9IGNhcmQucXVlcnlTZWxlY3RvcignLmpzLS1pbWFnZS1ncmlkLWNhcmQtc2lkZS1mcm9udCcpO1xuICBjb25zdCBiYWNrID0gY2FyZC5xdWVyeVNlbGVjdG9yKCcuanMtLWltYWdlLWdyaWQtY2FyZC1zaWRlLWJhY2snKTtcblxuICBmcm9udC5zdHlsZS50cmFuc2Zvcm0gPSAncm90YXRlWSgwKSc7XG4gIGJhY2suc3R5bGUudHJhbnNmb3JtID0gJ3JvdGF0ZVkoMTgwZGVnKSc7XG5cbiAgZnJvbnQuY2xhc3NMaXN0LmFkZCgnanMtLXNob3dpbmcnKTtcbiAgYmFjay5jbGFzc0xpc3QucmVtb3ZlKCdqcy0tc2hvd2luZycpO1xufTtcblxuY29uc3QgZmxpcENhcmQgPSAoZSkgPT4ge1xuICAvLyBQcmV2ZW50IHRoZSBsaW5rIGZyb20gZ29pbmcgdG8gdGhlIGNhcmQgc3BlY2lmaWMgcGFnZVxuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIGNvbnN0IGNhcmQgPSBlLnRhcmdldC5wYXJlbnRFbGVtZW50O1xuXG4gIGNvbnN0IGZyb250ID0gY2FyZC5xdWVyeVNlbGVjdG9yKCcuanMtLWltYWdlLWdyaWQtY2FyZC1zaWRlLWZyb250Jyk7XG5cbiAgLy8gSWYgdGhlIGZyb250IGlzIHNob3dpbmcsIGRpc3BsYXkgdGhlIGJhY2tzaWRlLiBPdGhlcndpc2UsIGRpc3BsYXkgdGhlIGZyb250XG4gIGlmIChmcm9udC5jbGFzc0xpc3QuY29udGFpbnMoJ2pzLS1zaG93aW5nJykpIHNob3dCYWNrU2lkZShjYXJkKTtcbiAgZWxzZSBzaG93RnJvbnRTaWRlKGNhcmQpO1xufTtcblxuY29uc3QgZ2VuZXJhdGVGbGlwQ2FyZEJ0biA9ICgpID0+IHtcbiAgY29uc3QgYnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gIGJ0bi5jbGFzc0xpc3QgPSAnaW1hZ2UtZ3JpZF9fZG91YmxlLWJ0biBqcy0taW1hZ2UtZ3JpZC1mbGlwLWNhcmQtYnRuJztcbiAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IGZsaXBDYXJkKGUpKTtcblxuICByZXR1cm4gYnRuO1xufTtcblxuY29uc3QgZ2VuZXJhdGVEb3VibGVTaWRlZENhcmQgPSAoY2FyZCkgPT4ge1xuICBjb25zdCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICBjb25zdCBvdXRlckRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBjb25zdCBpbm5lckRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBjb25zdCBpbWdGcm9udFNpZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcbiAgY29uc3QgaW1nQmFja1NpZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcbiAgY29uc3QgZmxpcENhcmRCdG4gPSBnZW5lcmF0ZUZsaXBDYXJkQnRuKCk7XG5cbiAgYS5jbGFzc0xpc3QgPSBgaW1hZ2UtZ3JpZF9fbGluayBqcy0taW1hZ2UtZ3JpZC1saW5rYDtcbiAgYS5ocmVmID0gYC9jYXJkLyR7Y2FyZC5zZXR9LyR7cGFyc2VDYXJkTmFtZShjYXJkLm5hbWUpfWA7XG5cbiAgb3V0ZXJEaXYuY2xhc3NMaXN0ID0gYGltYWdlLWdyaWRfX291dGVyLWRpdmA7XG4gIGlubmVyRGl2LmNsYXNzTGlzdCA9IGBpbWFnZS1ncmlkX19pbm5lci1kaXYganMtLWlubmVyLWRpdi0ke2NhcmQubmFtZX1gO1xuXG4gIGltZ0Zyb250U2lkZS5jbGFzc0xpc3QgPSBgaW1hZ2UtZ3JpZF9fZG91YmxlIGltYWdlLWdyaWRfX2RvdWJsZS0tZnJvbnQganMtLWltYWdlLWdyaWQtY2FyZC1zaWRlLWZyb250IGpzLS1zaG93aW5nYDtcbiAgaW1nRnJvbnRTaWRlLnNyYyA9IGNhcmQuY2FyZF9mYWNlc1swXS5pbWFnZV91cmlzLm5vcm1hbDtcbiAgaW1nRnJvbnRTaWRlLmFsdCA9IGNhcmQubmFtZTtcblxuICBpbWdCYWNrU2lkZS5jbGFzc0xpc3QgPSBgaW1hZ2UtZ3JpZF9fZG91YmxlIGltYWdlLWdyaWRfX2RvdWJsZS0tYmFjayBqcy0taW1hZ2UtZ3JpZC1jYXJkLXNpZGUtYmFja2A7XG4gIGltZ0JhY2tTaWRlLnNyYyA9IGNhcmQuY2FyZF9mYWNlc1sxXS5pbWFnZV91cmlzLm5vcm1hbDtcbiAgaW1nQmFja1NpZGUuYWx0ID0gY2FyZC5jYXJkX2ZhY2VzWzFdLm5hbWU7XG5cbiAgYS5hcHBlbmRDaGlsZChvdXRlckRpdik7XG4gIG91dGVyRGl2LmFwcGVuZENoaWxkKGlubmVyRGl2KTtcbiAgaW5uZXJEaXYuYXBwZW5kQ2hpbGQoaW1nQmFja1NpZGUpO1xuICBpbm5lckRpdi5hcHBlbmRDaGlsZChpbWdGcm9udFNpZGUpO1xuICBpbm5lckRpdi5hcHBlbmRDaGlsZChmbGlwQ2FyZEJ0bik7XG5cbiAgZG9jdW1lbnRcbiAgICAucXVlcnlTZWxlY3RvcignLmpzLS1pbWFnZS1ncmlkJylcbiAgICAuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdiZWZvcmVlbmQnLCBhKTtcbn07XG5cbmNvbnN0IGdlbmVyYXRlSW1hZ2VHcmlkID0gKGNhcmRzKSA9PiB7XG4gIGNhcmRzLmZvckVhY2goKGNhcmQpID0+IHtcbiAgICAvLyBGb3Igc2luZ2xlIHNpZGVkIGNhcmRzXG4gICAgaWYgKGNhcmQuaW1hZ2VfdXJpcykgZ2VuZXJhdGVTaW5nbGVTaWRlZENhcmQoY2FyZCk7XG4gICAgLy8gRG91YmxlIHNpZGVkIGNhcmRzXG4gICAgZWxzZSBnZW5lcmF0ZURvdWJsZVNpZGVkQ2FyZChjYXJkKTtcbiAgfSk7XG59O1xuXG4vLyBGdW5jaXRvbiB0byBiZSB1c2VkIGluIGluZGV4LmpzLiBUYWtlcyBjYXJlIG9mIGFsbCBuZWNlc3Nhcnkgc3RlcHMgdG8gZGlzcGxheSBjYXJkcyBhcyBhIGltYWdlc1xuZXhwb3J0IGNvbnN0IGRpc3BhbHlJbWFnZXMgPSAoY2FyZHMpID0+IHtcbiAgY2xlYXJSZXN1bHRzKCk7XG4gIHByZXBJbWFnZUNvbnRhaW5lcigpO1xuICBnZW5lcmF0ZUltYWdlR3JpZChjYXJkcyk7XG59O1xuXG5jb25zdCBwcmVwQ2hlY2tsaXN0Q29udGFpbmVyID0gKCkgPT4ge1xuICBjb25zdCBtYXJrdXAgPSBgXG4gICAgICAgIDx0YWJsZSBjbGFzcz1cImNhcmQtY2hlY2tsaXN0IGpzLS1jYXJkLWNoZWNrbGlzdFwiPlxuICAgICAgICAgICAgPHRoZWFkIGNsYXNzPVwianMtLWNhcmQtY2hlY2tsaXN0LWhlYWRlclwiPlxuICAgICAgICAgICAgICAgIDx0ciBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19yb3cgY2FyZC1jaGVja2xpc3RfX3Jvdy0tNyBjYXJkLWNoZWNrbGlzdF9fcm93LS1oZWFkZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGFcIj5TZXQ8L3RoPlxuICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YVwiPk5hbWU8L3RoPlxuICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YVwiPkNvc3Q8L3RoPlxuICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YVwiPlR5cGU8L3RoPlxuICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YVwiPlJhcml0eTwvdGg+XG4gICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhXCI+QXJ0aXN0PC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGFcIj5QcmljZTwvdGg+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgIDwvdGhlYWQ+XG4gICAgICAgICAgICA8dGJvZHkgY2xhc3M9XCJqcy0tY2FyZC1jaGVja2xpc3QtYm9keSBjYXJkLWNoZWNrbGlzdC1ib2R5XCI+PC90Ym9keT5cbiAgICAgICAgPC90YWJsZT5cbiAgICAgICAgYDtcbiAgZWxlbWVudHMucmVzdWx0c1BhZ2UucmVzdWx0c0NvbnRhaW5lci5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWVuZCcsIG1hcmt1cCk7XG59O1xuXG5leHBvcnQgY29uc3QgZ2VuZXJhdGVNYW5hQ29zdEltYWdlcyA9IChtYW5hQ29zdCwgc2l6ZSA9ICdzbWFsbCcpID0+IHtcbiAgLy8gSWYgdGhlcmUgaXMgbm8gbWFuYSBjb3N0IGFzc29jaWF0ZWQgd2l0aCB0aGUgY2FyZCwgdGhlbiByZXR1cm4gYW4gZW1wdHkgc3RyaW5nIHRvIGxlYXZlIHRoZSByb3cgZW1wdHlcbiAgaWYgKCFtYW5hQ29zdCkgcmV0dXJuICcnO1xuXG4gIC8vIFJlZ3VsYXIgZXhwcmVzc2lvbnMgdG8gZmluZCBlYWNoIHNldCBvZiBjdXJseSBicmFjZXMge31cbiAgbGV0IHJlID0gL1xceyguKj8pXFx9L2c7XG5cbiAgLy8gUGFyc2UgdGhlIHN0cmluZ3MgYW5kIGdldCBhbGwgbWF0Y2hlc1xuICBsZXQgbWF0Y2hlcyA9IG1hbmFDb3N0Lm1hdGNoKHJlKTtcblxuICAvLyBJZiB0aGVyZSBhcmUgYW55IG1hdGNoZXMsIGxvb3AgdGhyb3VnaCBhbmQgcmVwbGFjZSBlYWNoIHNldCBvZiBjdXJseSBicmFjZXMgd2l0aCB0aGVcbiAgLy8gaHRtbCBzcGFuIHRoYXQgY29ycmVzcG9ucyB0byBtYW5hLmNzcyB0byByZW5kZXIgdGhlIGNvcnJlY3QgaW1hZ2VcbiAgaWYgKG1hdGNoZXMpIHtcbiAgICBtYXRjaGVzLmZvckVhY2goKG0pID0+IHtcbiAgICAgIGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cChgXFx7KCR7bS5zbGljZSgxLCAtMSl9KVxcfWAsICdnJyk7XG4gICAgICAvLyBUaGlzIHdpbGwgYmUgdGhlIHN0cmluZyB1c2VkIHRvIGdldCB0aGUgcmlnaHQgY2xhc3MgZnJvbSBtYW5hLmNzc1xuICAgICAgLy8gV2Ugd2FudCB0byB0YWtlIGV2ZXJ5dGhpbmcgaW5zaWRlIHRoZSBicmFja2V0cywgYW5kIGlmIHRoZXJlIGlzIGEgL1xuICAgICAgLy8gcmVtb3ZlIGl0LlxuICAgICAgY29uc3QgbWFuYUljb25TdHIgPSBtLnNsaWNlKDEsIC0xKS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoJy8nLCAnJyk7XG4gICAgICBtYW5hQ29zdCA9IG1hbmFDb3N0LnJlcGxhY2UoXG4gICAgICAgIHJlZ2V4LFxuICAgICAgICBgPHNwYW4gY2xhc3M9XCJtYW5hICR7c2l6ZX0gcyR7bWFuYUljb25TdHJ9XCI+PC9zcGFuPmBcbiAgICAgICk7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gbWFuYUNvc3Q7XG59O1xuXG5jb25zdCBzaG9ydGVuVHlwZUxpbmUgPSAodHlwZSkgPT4ge1xuICAvLyBJZiBubyB0eXBlIGlzIGdpdmVuLCByZXR1cm4gYW4gZW1wdHkgc3RyaW5nXG4gIGlmICghdHlwZSkgcmV0dXJuICcnO1xuXG4gIC8vIGlmIHRoZSDigJQgZGVsaW1pdGVyIGlzIGZvdW5kIGluIHRoZSBzdHJpbmcsIHJldHVybiBldmVyeXRoaW5nIGJlZm9yZSB0aGUgZGVsaW1pdGVyXG4gIGlmICh0eXBlLmluZGV4T2YoJ+KAlCcpICE9PSAtMSkgcmV0dXJuIHR5cGUuc3Vic3RyaW5nKDAsIHR5cGUuaW5kZXhPZign4oCUJykgLSAxKTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyBkZWxpbWl0ZXIsIHJldHVybiB0aGUgdHlwZSBhcyBnaXZlbiBpbiB0aGUgY2FyZCBvYmplY3RcbiAgcmV0dXJuIHR5cGU7XG59O1xuXG5jb25zdCBwYXJzZUNhcmROYW1lID0gKGNhcmROYW1lKSA9PiB7XG4gIGlmIChjYXJkTmFtZS5pbmRleE9mKCcvJykgIT09IC0xKSB7XG4gICAgcmV0dXJuIGNhcmROYW1lLnNsaWNlKDAsIGNhcmROYW1lLmluZGV4T2YoJy8nKSAtIDEpLnJlcGxhY2VBbGwoJyAnLCAnLScpO1xuICB9XG5cbiAgcmV0dXJuIGNhcmROYW1lLnJlcGxhY2VBbGwoJyAnLCAnLScpO1xufTtcblxuY29uc3QgZ2VuZXJhdGVDaGVja2xpc3QgPSAoY2FyZHMpID0+IHtcbiAgLy8gQ3JlYXRlIGEgbmV3IHRhYmxlIHJvdyBmb3IgZWFjaCBjYXJkIG9iamVjdFxuICBjYXJkcy5mb3JFYWNoKChjYXJkKSA9PiB7XG4gICAgY29uc3QgY2FyZE5hbWVGb3JVcmwgPSBwYXJzZUNhcmROYW1lKGNhcmQubmFtZSk7XG5cbiAgICBjb25zdCBtYXJrdXAgPSBgXG4gICAgICAgICAgICA8dHIgY2xhc3M9XCJqcy0tY2hlY2tsaXN0LXJvdyBjYXJkLWNoZWNrbGlzdF9fcm93ICR7XG4gICAgICAgICAgICAgIGNhcmRzLmxlbmd0aCA8IDMwID8gJ2NhcmQtY2hlY2tsaXN0X19yb3ctLWJvZHknIDogJydcbiAgICAgICAgICAgIH0gY2FyZC1jaGVja2xpc3RfX3Jvdy0tNyBkYXRhLWNvbXBvbmVudD1cImNhcmQtdG9vbHRpcFwiIGRhdGEtY2FyZC1pbWc9JHtjaGVja0ZvckltZyhcbiAgICAgIGNhcmRcbiAgICApfT5cbiAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YSBjYXJkLWNoZWNrbGlzdF9fZGF0YS0tc2V0XCI+PGEgaHJlZj1cIi9jYXJkLyR7XG4gICAgICAgICAgICAgICAgICBjYXJkLnNldFxuICAgICAgICAgICAgICAgIH0vJHtjYXJkTmFtZUZvclVybH1cIiBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmsgY2FyZC1jaGVja2xpc3RfX2RhdGEtbGluay0tY2VudGVyXCI+JHtcbiAgICAgIGNhcmQuc2V0XG4gICAgfTwvYT48L3RkPlxuICAgICAgICAgICAgICAgIDx0ZCBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhXCI+PGEgaHJlZj1cIi9jYXJkLyR7XG4gICAgICAgICAgICAgICAgICBjYXJkLnNldFxuICAgICAgICAgICAgICAgIH0vJHtjYXJkTmFtZUZvclVybH1cIiBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmsgY2FyZC1jaGVja2xpc3RfX2RhdGEtbGluay0tc3RhcnRcIj4ke1xuICAgICAgY2FyZC5uYW1lXG4gICAgfTwvYT48L3RkPlxuICAgICAgICAgICAgICAgIDx0ZCBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhXCI+PGEgaHJlZj1cIi9jYXJkLyR7XG4gICAgICAgICAgICAgICAgICBjYXJkLnNldFxuICAgICAgICAgICAgICAgIH0vJHtjYXJkTmFtZUZvclVybH1cIiBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmsgY2FyZC1jaGVja2xpc3RfX2RhdGEtbGluay0tY2VudGVyXCI+JHtnZW5lcmF0ZU1hbmFDb3N0SW1hZ2VzKFxuICAgICAgY2hlY2tGb3JNYW5hQ29zdChjYXJkKVxuICAgICl9PC9hPjwvdGQ+XG4gICAgICAgICAgICAgICAgPHRkIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGFcIj48YSBocmVmPVwiL2NhcmQvJHtcbiAgICAgICAgICAgICAgICAgIGNhcmQuc2V0XG4gICAgICAgICAgICAgICAgfS8ke2NhcmROYW1lRm9yVXJsfVwiIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGEtbGluayBjYXJkLWNoZWNrbGlzdF9fZGF0YS1saW5rLS1jZW50ZXJcIj4ke3Nob3J0ZW5UeXBlTGluZShcbiAgICAgIGNhcmQudHlwZV9saW5lXG4gICAgKX08L2E+PC90ZD5cbiAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YSBjYXJkLWNoZWNrbGlzdF9fZGF0YS0tcmFyaXR5XCI+PGEgaHJlZj1cIi9jYXJkLyR7XG4gICAgICAgICAgICAgICAgICBjYXJkLnNldFxuICAgICAgICAgICAgICAgIH0vJHtjYXJkTmFtZUZvclVybH1cIiBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmsgY2FyZC1jaGVja2xpc3RfX2RhdGEtbGluay0tY2VudGVyXCI+JHtcbiAgICAgIGNhcmQucmFyaXR5XG4gICAgfTwvYT48L3RkPlxuICAgICAgICAgICAgICAgIDx0ZCBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhXCI+PGEgaHJlZj1cIi9jYXJkLyR7XG4gICAgICAgICAgICAgICAgICBjYXJkLnNldFxuICAgICAgICAgICAgICAgIH0vJHtjYXJkTmFtZUZvclVybH1cIiBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmsgY2FyZC1jaGVja2xpc3RfX2RhdGEtbGluay0tY2VudGVyXCI+JHtcbiAgICAgIGNhcmQuYXJ0aXN0XG4gICAgfTwvYT48L3RkPlxuICAgICAgICAgICAgICAgIDx0ZCBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhXCI+PGEgaHJlZj1cIi9jYXJkLyR7XG4gICAgICAgICAgICAgICAgICBjYXJkLnNldFxuICAgICAgICAgICAgICAgIH0vJHtjYXJkTmFtZUZvclVybH1cIiBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmsgY2FyZC1jaGVja2xpc3RfX2RhdGEtbGluay0tcHJpY2UganMtLXByaWNlIGNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmstLWNlbnRlclwiPiQgJHtcbiAgICAgIGNhcmQucHJpY2VzLnVzZCB8fCAnLSdcbiAgICB9PC9hPjwvdGQ+XG4gICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgYDtcbiAgICAvLyBQdXQgdGhlIHJvdyBpbiB0aGUgdGFibGVcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tY2FyZC1jaGVja2xpc3QtYm9keScpXG4gICAgICAuaW5zZXJ0QWRqYWNlbnRIVE1MKCdiZWZvcmVlbmQnLCBtYXJrdXApO1xuICB9KTtcbn07XG5cbmNvbnN0IGNoZWNrRm9yTWlzc2luZ1ByaWNlID0gKCkgPT4ge1xuICBjb25zdCBwcmljZXMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tcHJpY2UnKSk7XG5cbiAgcHJpY2VzLmZvckVhY2goKHByaWNlKSA9PiB7XG4gICAgaWYgKHByaWNlLmlubmVyVGV4dC5pbmNsdWRlcygnLScpKSBwcmljZS5pbm5lclRleHQgPSAnJztcbiAgfSk7XG59O1xuXG5jb25zdCBjaGVja0Zvck1hbmFDb3N0ID0gKGNhcmQpID0+IHtcbiAgaWYgKGNhcmQubWFuYV9jb3N0KSB7XG4gICAgcmV0dXJuIGNhcmQubWFuYV9jb3N0O1xuICB9IGVsc2UgaWYgKGNhcmQuY2FyZF9mYWNlcykge1xuICAgIHJldHVybiBjYXJkLmNhcmRfZmFjZXNbMF0ubWFuYV9jb3N0O1xuICB9XG59O1xuXG5jb25zdCBjaGVja0ZvckltZyA9IChjYXJkKSA9PiB7XG4gIGlmIChjYXJkLmltYWdlX3VyaXMpIHJldHVybiBjYXJkLmltYWdlX3VyaXMubm9ybWFsO1xuICAvLyBJZiB0aGVyZSBpcyBubyBjYXJkLmltYWdlX3VyaXMsIHRoZW4gaXQncyBhIGRvdWJsZSBzaWRlZCBjYXJkLiBJbiB0aGlzXG4gIC8vIGNhc2Ugd2Ugd2FudCB0byBkaXNwbGF5IHRoZSBpbWFnZSBmcm9tIGZhY2Ugb25lIG9mIHRoZSBjYXJkLlxuICBlbHNlIHJldHVybiBjYXJkLmNhcmRfZmFjZXNbMF0uaW1hZ2VfdXJpcy5ub3JtYWw7XG59O1xuXG4vLyBDcmVhdGUgdGhlIGhvdmVyIGVmZmVjdCBvbiBlYWNoIHJvdyB0aGF0IGRpc3BsYXlzIHRoZSBpbWFnZSBvZiB0aGUgY2FyZFxuZXhwb3J0IGNvbnN0IGNoZWNrTGlzdEhvdmVyRXZlbnRzID0gKCkgPT4ge1xuICAvLyBHZXQgdGhlIEhUTUwgZm9yIGVhY2ggdGFibGUgcm93XG4gIGNvbnN0IHJvd3MgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tY2hlY2tsaXN0LXJvdycpKTtcblxuICByb3dzLmZvckVhY2goKHJvdykgPT4ge1xuICAgIHJvdy5vbm1vdXNlbW92ZSA9IChlKSA9PiB7XG4gICAgICAvLyBJZiB0aGUgd2luZG93IGlzIHNtYWxsZXIgdGhhbiA3NjggcGl4ZWxzLCBkb24ndCBkaXNwbGF5IGFueSBpbWFnZXNcbiAgICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA8IDc2OCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAvLyBJZiB0aGVyZSBpcyBhbHJlYWR5IGFuIGltYWdlIGJlaW5nIGRpc3BsYXllZCwgcmVtb3ZlIGl0IGZyb20gdGhlIERPTVxuICAgICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50b29sdGlwJykpIHtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudG9vbHRpcCcpKTtcbiAgICAgIH1cblxuICAgICAgLy8gUHJlcCB0aGUgZGl2LlxuICAgICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBkaXYuY2xhc3NOYW1lID0gJ3Rvb2x0aXAnO1xuXG4gICAgICAvLyBUaGUgZGl2IGlzIHN0eWxlZCB3aXRoIHBvc2l0aW9uIGFic29sdXRlLiBUaGlzIGNvZGUgcHV0cyBpdCBqdXN0IHRvIHRoZSByaWdodCBvZiB0aGUgY3Vyc29yXG4gICAgICBkaXYuc3R5bGUubGVmdCA9IGUucGFnZVggKyA1MCArICdweCc7XG4gICAgICBkaXYuc3R5bGUudG9wID0gZS5wYWdlWSAtIDMwICsgJ3B4JztcblxuICAgICAgLy8gUHJlcCB0aGUgaW1nIGVsZW1lbnRcbiAgICAgIGNvbnN0IGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuICAgICAgaW1nLmNsYXNzTmFtZSA9ICd0b29sdGlwX19pbWcnO1xuICAgICAgaW1nLnNyYyA9IHJvdy5kYXRhc2V0LmNhcmRJbWc7XG5cbiAgICAgIC8vIFB1dCB0aGUgaW1nIGludG8gdGhlIGRpdiBhbmQgdGhlbiBhcHBlbmQgdGhlIGRpdiBkaXJlY3RseSB0byB0aGUgYm9keSBvZiB0aGUgZG9jdW1lbnQuXG4gICAgICBkaXYuYXBwZW5kQ2hpbGQoaW1nKTtcbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZGl2KTtcbiAgICB9O1xuXG4gICAgLy8gUmVtb3ZlIHRoZSBpbWcgd2hlbiB0YWtpbmcgdGhlIGN1cnNvciBvZmYgdGhlIHJvd1xuICAgIHJvdy5vbm1vdXNlb3V0ID0gKGUpID0+IHtcbiAgICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudG9vbHRpcCcpKSB7XG4gICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRvb2x0aXAnKSk7XG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG59O1xuXG5jb25zdCBjaGFuZ2VIZWFkZXJGb3JTbWFsbENoZWNrbGlzdCA9IChjYXJkcykgPT4ge1xuICBpZiAoY2FyZHMubGVuZ3RoIDwgMzApXG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yKCcuanMtLWNhcmQtY2hlY2tsaXN0LWhlYWRlcicpXG4gICAgICAuY2xhc3NMaXN0LmFkZCgnY2FyZC1jaGVja2xpc3QtaGVhZGVyJyk7XG59O1xuXG4vLyBGdW5jaXRvbiB0byBiZSB1c2VkIGluIGluZGV4LmpzLiBUYWtlcyBjYXJlIG9mIGFsbCBuZWNlc3Nhcnkgc3RlcHMgdG8gZGlzcGxheSBjYXJkcyBhcyBhIGNoZWNrbGlzdFxuZXhwb3J0IGNvbnN0IGRpc3BsYXlDaGVja2xpc3QgPSAoY2FyZHMpID0+IHtcbiAgY2xlYXJSZXN1bHRzKCk7XG4gIHByZXBDaGVja2xpc3RDb250YWluZXIoKTtcbiAgY2hhbmdlSGVhZGVyRm9yU21hbGxDaGVja2xpc3QoY2FyZHMpO1xuICBnZW5lcmF0ZUNoZWNrbGlzdChjYXJkcyk7XG4gIGNoZWNrRm9yTWlzc2luZ1ByaWNlKCk7XG4gIGNoZWNrTGlzdEhvdmVyRXZlbnRzKCk7XG59O1xuXG5leHBvcnQgY29uc3QgY2hvc2VTZWxlY3RNZW51U29ydCA9IChtZW51LCBzdGF0ZSkgPT4ge1xuICAvLyBDcmVhdGUgYW4gYXJyYXkgZnJvbSB0aGUgSFRNTCBzZWxlY3QgbWVudVxuICBjb25zdCBvcHRpb25zID0gQXJyYXkuZnJvbShtZW51KTtcblxuICBvcHRpb25zLmZvckVhY2goKG9wdGlvbiwgaSkgPT4ge1xuICAgIC8vIElmIHRoZSBvcHRpb24gdmFsdWUgbWF0Y2hlcyB0aGUgc29ydCBtZXRob2QgZnJvbSB0aGUgVVJMLCBzZXQgaXQgdG8gdGhlIHNlbGVjdGVkIGl0ZW1cbiAgICBpZiAob3B0aW9uLnZhbHVlID09PSBzdGF0ZS5zb3J0TWV0aG9kKSBtZW51LnNlbGVjdGVkSW5kZXggPSBpO1xuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBjaG9zZVNlbGVjdE1lbnVEaXNwbGF5ID0gKG1lbnUsIHN0YXRlKSA9PiB7XG4gIC8vIENyZWF0ZSBhbiBhcnJheSBmcm9tIHRoZSBIVE1MIHNlbGVjdCBtZW51XG4gIGNvbnN0IG9wdGlvbnMgPSBBcnJheS5mcm9tKG1lbnUpO1xuXG4gIG9wdGlvbnMuZm9yRWFjaCgob3B0aW9uLCBpKSA9PiB7XG4gICAgLy8gSWYgdGhlIG9wdGlvbiB2YWx1ZSBtYXRjaGVzIHRoZSBzb3J0IG1ldGhvZCBmcm9tIHRoZSBVUkwsIHNldCBpdCB0byB0aGUgc2VsZWN0ZWQgaXRlbVxuICAgIGlmIChvcHRpb24udmFsdWUgPT09IHN0YXRlLmRpc3BsYXkpIG1lbnUuc2VsZWN0ZWRJbmRleCA9IGk7XG4gIH0pO1xufTtcblxuLy8gRnVuY3Rpb24gdG8gY2hhbmdlIHRoZSBzb3J0IG1ldGhvZCBiYXNlZCBvbiB0aGUgaW5wdXQgZnJvbSB0aGUgdXNlclxuZXhwb3J0IGNvbnN0IGNoYW5nZVNvcnRNZXRob2QgPSAoc3RhdGUpID0+IHtcbiAgLy8gR2V0IHRoZSBjdXJyZW50IHNvcnQgbWV0aG9kIGZyb20gdGhlIGVuZCBvZiB0aGUgVVJMXG4gIGNvbnN0IGN1cnJlbnRTb3J0TWV0aG9kID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnN1YnN0cmluZyhcbiAgICB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUubGFzdEluZGV4T2YoJz0nKSArIDFcbiAgKTtcblxuICAvLyBHcmFiIHRoZSBkZXNpcmVkIHNvcnQgbWV0aG9kIGZyb20gdGhlIHVzZXJcbiAgY29uc3QgbmV3U29ydE1ldGhvZCA9IGVsZW1lbnRzLnJlc3VsdHNQYWdlLnNvcnRCeS52YWx1ZTtcblxuICAvLyBJZiB0aGUgbmV3IHNvcnQgbWV0aG9kIGlzIG5vdCBkaWZmZXJlbnQsIGV4aXQgdGhlIGZ1bmN0aW9uIGFzIHRvIG5vdCBwdXNoIGEgbmV3IHN0YXRlXG4gIGlmIChjdXJyZW50U29ydE1ldGhvZCA9PT0gbmV3U29ydE1ldGhvZCkge1xuICAgIHJldHVybjtcbiAgfSBlbHNlIHtcbiAgICAvLyBEaXNhYmxlIGFsbCBmb3VyIGJ1dHRvbnNcbiAgICAvLyBPbmx5IGRvaW5nIHRoaXMgYmVjYXVzZSBmaXJlZm94IHJlcXVpcmVzIGEgY3RybCBmNVxuICAgIGRpc2FibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UuZmlyc3RQYWdlQnRuKTtcbiAgICBkaXNhYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLm5leHRQYWdlQnRuKTtcbiAgICBkaXNhYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLnByZXZpb3VzUGFnZUJ0bik7XG4gICAgZGlzYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5sYXN0UGFnZUJ0bik7XG5cbiAgICBjb25zdCBjdXJyZW50UGF0aE5hbWUgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3Vic3RyaW5nKFxuICAgICAgMCxcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5sYXN0SW5kZXhPZignPScpICsgMVxuICAgICk7XG5cbiAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGN1cnJlbnRQYXRoTmFtZSArIG5ld1NvcnRNZXRob2Q7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBjaGFuZ2VEaXNwbGF5QW5kVXJsID0gKHN0YXRlKSA9PiB7XG4gIGNvbnN0IGN1cnJlbnRNZXRob2QgPSBzdGF0ZS5kaXNwbGF5O1xuICBjb25zdCBuZXdNZXRob2QgPSBlbGVtZW50cy5yZXN1bHRzUGFnZS5kaXNwbGF5U2VsZWN0b3IudmFsdWU7XG5cbiAgaWYgKG5ld01ldGhvZCA9PT0gY3VycmVudE1ldGhvZCkgcmV0dXJuO1xuXG4gIC8vIFVwZGF0ZSB0aGUgc3RhdGUgd2l0aCBuZXcgZGlzcGxheSBtZXRob2RcbiAgc3RhdGUuZGlzcGxheSA9IG5ld01ldGhvZDtcblxuICAvLyBVcGRhdGUgdGhlIHVybCB3aXRob3V0IHB1c2hpbmcgdG8gdGhlIHNlcnZlclxuICBjb25zdCB0aXRsZSA9IGRvY3VtZW50LnRpdGxlO1xuICBjb25zdCBwYXRoTmFtZSA9IGAvcmVzdWx0cy8ke25ld01ldGhvZH0vJHtzdGF0ZS5xdWVyeX1gO1xuICBoaXN0b3J5LnB1c2hTdGF0ZShcbiAgICB7XG4gICAgICBjdXJyZW50SW5kZXg6IHN0YXRlLmN1cnJlbnRJbmRleCxcbiAgICAgIGRpc3BsYXk6IHN0YXRlLmRpc3BsYXksXG4gICAgfSxcbiAgICB0aXRsZSxcbiAgICBwYXRoTmFtZVxuICApO1xufTtcblxuZXhwb3J0IGNvbnN0IHVwZGF0ZURpc3BsYXkgPSAoc3RhdGUpID0+IHtcbiAgLy8gQ2xlYXIgYW55IGV4aXN0aW5nIEhUTUwgaW4gdGhlIGRpc3BsYXlcbiAgY2xlYXJSZXN1bHRzKCk7XG5cbiAgLy8gUmVmcmVzaCB0aGUgZGlzcGxheVxuICBpZiAoc3RhdGUuZGlzcGxheSA9PT0gJ2xpc3QnKVxuICAgIGRpc3BsYXlDaGVja2xpc3Qoc3RhdGUuYWxsQ2FyZHNbc3RhdGUuY3VycmVudEluZGV4XSk7XG4gIGlmIChzdGF0ZS5kaXNwbGF5ID09PSAnaW1hZ2VzJylcbiAgICBkaXNwYWx5SW1hZ2VzKHN0YXRlLmFsbENhcmRzW3N0YXRlLmN1cnJlbnRJbmRleF0pO1xufTtcblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKiogUEFHSU5BVElPTiAqKioqKioqKioqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuXG4vLyBXaWxsIGJlIGNhbGxlZCBkdXJpbmcgY2hhbmdpbmcgcGFnZXMuIFJlbW92ZXMgdGhlIGN1cnJlbnQgZWxlbWVudCBpbiB0aGUgYmFyXG5jb25zdCBjbGVhckRpc3BsYXlCYXIgPSAoKSA9PiB7XG4gIGNvbnN0IGRpc3BsYXlCYXJUZXh0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1kaXNwbGF5LWJhci10ZXh0Jyk7XG4gIGlmIChkaXNwbGF5QmFyVGV4dCkgZGlzcGxheUJhclRleHQucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChkaXNwbGF5QmFyVGV4dCk7XG59O1xuXG4vLyBLZWVwcyB0cmFjayBvZiB3aGVyZSB0aGUgdXNlciBpcyBpbiB0aGVyZSBsaXN0IG9mIGNhcmRzXG5jb25zdCBwYWdpbmF0aW9uVHJhY2tlciA9IChzdGF0ZSkgPT4ge1xuICB2YXIgYmVnLCBlbmQ7XG4gIGJlZyA9IChzdGF0ZS5jdXJyZW50SW5kZXggKyAxKSAqIDE3NSAtIDE3NDtcbiAgZW5kID0gc3RhdGUuY3VycmVudEluZGV4ICogMTc1ICsgc3RhdGUuYWxsQ2FyZHNbc3RhdGUuY3VycmVudEluZGV4XS5sZW5ndGg7XG5cbiAgcmV0dXJuIHsgYmVnLCBlbmQgfTtcbn07XG5cbmV4cG9ydCBjb25zdCB1cGRhdGVEaXNwbGF5QmFyID0gKHN0YXRlKSA9PiB7XG4gIGNvbnN0IG1hcmt1cCA9IGBcbiAgICAgICAgPHAgY2xhc3M9XCJhcGktcmVzdWx0cy1kaXNwbGF5X19kaXNwbGF5LWJhci10ZXh0IGpzLS1kaXNwbGF5LWJhci10ZXh0XCI+XG4gICAgICAgICAgICBEaXNwbGF5aW5nICR7cGFnaW5hdGlvblRyYWNrZXIoc3RhdGUpLmJlZ30gLSAke1xuICAgIHBhZ2luYXRpb25UcmFja2VyKHN0YXRlKS5lbmRcbiAgfSBvZiAke3N0YXRlLnNlYXJjaC5yZXN1bHRzLnRvdGFsX2NhcmRzfSBjYXJkc1xuICAgICAgICA8L3A+XG4gICAgYDtcblxuICBjbGVhckRpc3BsYXlCYXIoKTtcbiAgZWxlbWVudHMucmVzdWx0c1BhZ2UuZGlzcGxheUJhci5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWVuZCcsIG1hcmt1cCk7XG59O1xuXG5leHBvcnQgY29uc3QgZW5hYmxlQnRuID0gKGJ0bikgPT4ge1xuICBpZiAoYnRuLmRpc2FibGVkKSB7XG4gICAgYnRuLmNsYXNzTGlzdC5yZW1vdmUoXG4gICAgICAnYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXBhZ2luYXRpb24tY29udGFpbmVyLS1kaXNhYmxlZCdcbiAgICApO1xuICAgIGJ0bi5kaXNhYmxlZCA9IGZhbHNlO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgZGlzYWJsZUJ0biA9IChidG4pID0+IHtcbiAgaWYgKCFidG4uZGlzYWJsZWQpIHtcbiAgICBidG4uY2xhc3NMaXN0LmFkZChcbiAgICAgICdhcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtcGFnaW5hdGlvbi1jb250YWluZXItLWRpc2FibGVkJ1xuICAgICk7XG4gICAgYnRuLmRpc2FibGVkID0gdHJ1ZTtcbiAgfVxufTtcblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKioqKioqKiogNDA0ICoqKioqKioqKioqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuXG5leHBvcnQgY29uc3QgZGlzcGxheTQwNCA9ICgpID0+IHtcbiAgY29uc3QgZGl2ID0gY3JlYXRlNDA0TWVzc2FnZSgpO1xuICBlbGVtZW50cy5yZXN1bHRzUGFnZS5yZXN1bHRzQ29udGFpbmVyLmFwcGVuZENoaWxkKGRpdik7XG59O1xuXG5jb25zdCBjcmVhdGU0MDREaXYgPSAoKSA9PiB7XG4gIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBkaXYuY2xhc3NMaXN0ID0gYG5vLXJlc3VsdHNgO1xuICByZXR1cm4gZGl2O1xufTtcblxuY29uc3QgY3JlYXRlNDA0aDMgPSAoKSA9PiB7XG4gIGNvbnN0IGgzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDMnKTtcbiAgaDMuY2xhc3NMaXN0ID0gYG5vLXJlc3VsdHNfX2gzYDtcbiAgaDMuaW5uZXJIVE1MID0gYE5vIGNhcmRzIGZvdW5kYDtcbiAgcmV0dXJuIGgzO1xufTtcblxuY29uc3QgY3JlYXRlNDA0cEVsZW1lbnQgPSAoKSA9PiB7XG4gIGNvbnN0IHAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XG4gIHAuY2xhc3NMaXN0ID0gYG5vLXJlc3VsdHNfX3BgO1xuICBwLmlubmVySFRNTCA9XG4gICAgXCJZb3VyIHNlYXJjaCBkaWRuJ3QgbWF0Y2ggYW55IGNhcmRzLiBHbyBiYWNrIHRvIHRoZSBzZWFyY2ggcGFnZSBhbmQgZWRpdCB5b3VyIHNlYXJjaFwiO1xuICByZXR1cm4gcDtcbn07XG5cbmNvbnN0IGNyZWF0ZTQwNEJ0biA9ICgpID0+IHtcbiAgY29uc3QgYnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICBidG4uY2xhc3NMaXN0ID0gYGJ0biBuby1yZXN1bHRzX19idG5gO1xuICBidG4uaHJlZiA9ICcvc2VhcmNoJztcbiAgYnRuLmlubmVySFRNTCA9ICdHbyBCYWNrJztcbiAgcmV0dXJuIGJ0bjtcbn07XG5cbmNvbnN0IGNyZWF0ZTQwNE1lc3NhZ2UgPSAoKSA9PiB7XG4gIGNvbnN0IGRpdiA9IGNyZWF0ZTQwNERpdigpO1xuICBjb25zdCBoMyA9IGNyZWF0ZTQwNGgzKCk7XG4gIGNvbnN0IHAgPSBjcmVhdGU0MDRwRWxlbWVudCgpO1xuICBjb25zdCBidG4gPSBjcmVhdGU0MDRCdG4oKTtcblxuICBkaXYuYXBwZW5kQ2hpbGQoaDMpO1xuICBkaXYuYXBwZW5kQ2hpbGQocCk7XG4gIGRpdi5hcHBlbmRDaGlsZChidG4pO1xuXG4gIHJldHVybiBkaXY7XG59O1xuIiwiaW1wb3J0IHsgZWxlbWVudHMgfSBmcm9tICcuL2Jhc2UnO1xuXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKiogVFlQRSBMSU5FICoqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG5cbmV4cG9ydCBjb25zdCBzaG93VHlwZXNEcm9wRG93biA9ICgpID0+IHtcbiAgaWYgKGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlRHJvcERvd24uaGFzQXR0cmlidXRlKCdoaWRkZW4nKSkge1xuICAgIGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlRHJvcERvd24ucmVtb3ZlQXR0cmlidXRlKCdoaWRkZW4nKTtcbiAgICBlbGVtZW50cy5hcGlTZWFyY2gudHlwZURyb3BEb3duLnNjcm9sbFRvcCA9IDA7XG4gICAgY29uc29sZS5sb2coJ3R5cGVzIGRyb3Bkb3duJyk7XG5cbiAgICAvLyBNYWtlIHN1cmUgdG8gZGlzcGxheSBhbGwgdHlwZXMgd2hlbiBvcGVuaW5nIHRoZSBkcm9wZG93biBhbmQgYmVmb3JlIHRha2luZyBpbnB1dFxuICAgIGZpbHRlclR5cGVzKCcnKTtcbiAgICBmaWx0ZXJTZWxlY3RlZFR5cGVzKCk7XG4gICAgZmlsdGVyVHlwZUhlYWRlcnMoKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGhpZGVUeXBlc0Ryb3BEb3duID0gKCkgPT4ge1xuICBpZiAoIWVsZW1lbnRzLmFwaVNlYXJjaC50eXBlRHJvcERvd24uaGFzQXR0cmlidXRlKCdoaWRkZW4nKSkge1xuICAgIGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlTGluZS52YWx1ZSA9ICcnO1xuICAgIGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlRHJvcERvd24uc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBuYXZpZ2F0ZVR5cGVzRHJvcERvd24pO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgZmlsdGVyVHlwZUhlYWRlcnMgPSAoKSA9PiB7XG4gIC8vIE9uIGV2ZXJ5IGlucHV0IGludG8gdGhlIHR5cGVsaW5lIGJhciwgbWFrZSBhbGwgaGVhZGVycyB2aXNpYmxlXG4gIGNvbnN0IGhlYWRlcnMgPSBBcnJheS5mcm9tKFxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tdHlwZXMtY2F0ZWdvcnktaGVhZGVyJylcbiAgKTtcbiAgaGVhZGVycy5mb3JFYWNoKChoZWFkZXIpID0+IHtcbiAgICBpZiAoaGVhZGVyLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIGhlYWRlci5yZW1vdmVBdHRyaWJ1dGUoJ2hpZGRlbicpO1xuICB9KTtcblxuICAvLyBGb3IgZWFjaCBjYXRlZ29yeSBvZiB0eXBlLCBpZiB0aGVyZSBhcmUgbm90IGFueSB2aXNpYmxlIGJlY2F1c2UgdGhleSB3ZXJlIGZpbHRlcmVkIG91dFxuICAvLyBoaWRlIHRoZSBoZWFkZXIgZm9yIHRoYXQgY2F0ZWdvcnlcbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWJhc2ljOm5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYmFzaWMtaGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXN1cGVyOm5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tc3VwZXItaGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFydGlmYWN0Om5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcignLmpzLS1hcnRpZmFjdC1oZWFkZXInKVxuICAgICAgLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgfVxuXG4gIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1lbmNoYW50bWVudDpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tZW5jaGFudG1lbnQtaGVhZGVyJylcbiAgICAgIC5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gIH1cblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tbGFuZDpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWxhbmQtaGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXNwZWxsOm5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tc3BlbGwtaGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXBsYW5lc3dhbGtlcjpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tcGxhbmVzd2Fsa2VyLWhlYWRlcicpXG4gICAgICAuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWNyZWF0dXJlOm5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcignLmpzLS1jcmVhdHVyZS1oZWFkZXInKVxuICAgICAgLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGZpbHRlclNlbGVjdGVkVHlwZXMgPSAoKSA9PiB7XG4gIGNvbnN0IHR5cGVzID0gQXJyYXkuZnJvbShcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS10eXBlXVtkYXRhLXNlbGVjdGVkXScpXG4gICk7XG5cbiAgdHlwZXMuZm9yRWFjaCgodHlwZSkgPT4ge1xuICAgIGlmICh0eXBlLmdldEF0dHJpYnV0ZSgnZGF0YS1zZWxlY3RlZCcpID09PSAndHJ1ZScpIHtcbiAgICAgIGlmICghdHlwZS5oYXNBdHRyaWJ1dGUoJ2hpZGRlbicpKSB0eXBlLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICB9XG4gIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IGZpbHRlclR5cGVzID0gKHN0cikgPT4ge1xuICBjb25zdCB0eXBlcyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtdHlwZV0nKSk7XG5cbiAgLy8gUmVtb3ZlIHRoZSBoaWRkZW4gYXR0cmlidXRlIGlmIGl0IGV4aXN0cyBvbiBhbnkgZWxlbWVudCwgYW5kIHRoZW4gaGlkZSBhbnkgZWxlbWVudHNcbiAgLy8gdGhhdCBkb24ndCBpbmNsdWRlIHRoZSBzdHJpbmcgZ2l2ZW4gaW4gdGhlIGlucHV0IGZyb20gdGhlIHVzZXJcbiAgdHlwZXMuZm9yRWFjaCgodHlwZSkgPT4ge1xuICAgIGlmICh0eXBlLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIHR5cGUucmVtb3ZlQXR0cmlidXRlKCdoaWRkZW4nKTtcbiAgICBpZiAoXG4gICAgICAhdHlwZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtdHlwZScpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc3RyLnRvTG93ZXJDYXNlKCkpXG4gICAgKSB7XG4gICAgICB0eXBlLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICB9XG4gIH0pO1xuXG4gIGZpbHRlclNlbGVjdGVkVHlwZXMoKTtcbn07XG5cbmV4cG9ydCBjb25zdCBoaWdobGlnaHRUeXBlID0gKHR5cGUpID0+IHtcbiAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taGlnaGxpZ2h0ZWQnKSkgcmVtb3ZlQ3VycmVudEhpZ2hsaWdodCgpO1xuXG4gIGlmICh0eXBlKSB7XG4gICAgdHlwZS5jbGFzc0xpc3QuYWRkKFxuICAgICAgJ2pzLS1oaWdobGlnaHRlZCcsXG4gICAgICAnc2VhcmNoLWZvcm1fX2Ryb3Bkb3duLWxpc3Qtb3B0aW9uLS1oaWdobGlnaHRlZCdcbiAgICApO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgcmVtb3ZlQ3VycmVudEhpZ2hsaWdodCA9ICgpID0+IHtcbiAgZG9jdW1lbnRcbiAgICAucXVlcnlTZWxlY3RvcignLmpzLS1oaWdobGlnaHRlZCcpXG4gICAgLmNsYXNzTGlzdC5yZW1vdmUoXG4gICAgICAnanMtLWhpZ2hsaWdodGVkJyxcbiAgICAgICdzZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1vcHRpb24tLWhpZ2hsaWdodGVkJ1xuICAgICk7XG59O1xuXG5leHBvcnQgY29uc3Qgc2V0U2Nyb2xsVG9wT25Eb3duQXJyb3cgPSAoZWwsIGRyb3Bkb3duKSA9PiB7XG4gIGlmIChcbiAgICBlbC5vZmZzZXRUb3AgPiBkcm9wZG93bi5vZmZzZXRIZWlnaHQgLSBlbC5vZmZzZXRIZWlnaHQgJiZcbiAgICBkcm9wZG93bi5zY3JvbGxUb3AgKyBkcm9wZG93bi5vZmZzZXRIZWlnaHQgLSBlbC5vZmZzZXRIZWlnaHQgPCBlbC5vZmZzZXRUb3BcbiAgKSB7XG4gICAgZHJvcGRvd24uc2Nyb2xsVG9wID0gZWwub2Zmc2V0VG9wIC0gZHJvcGRvd24ub2Zmc2V0SGVpZ2h0ICsgZWwub2Zmc2V0SGVpZ2h0O1xuICB9XG59O1xuXG5leHBvcnQgY29uc3Qgc2V0U2Nyb2xsVG9wT25VcEFycm93ID0gKGVsLCBkcm9wZG93bikgPT4ge1xuICBpZiAoZWwub2Zmc2V0VG9wIDwgZHJvcGRvd24uc2Nyb2xsVG9wKSB7XG4gICAgZHJvcGRvd24uc2Nyb2xsVG9wID0gZWwub2Zmc2V0VG9wO1xuXG4gICAgLy8gMzAgaXMgdGhlIGhlaWdodCBvZiBjYXRlZ29yeSBoZWFkZXJzLiBJZiB0aGUgY2F0ZWdvcnkgaGVhZGVyIGlzXG4gICAgLy8gdGhlIG9ubHkgZWxlbWVudCBsZWZ0IHRoYXQgaXMgbm90IHJldmVhbGVkLCBzZXQgdGVoIHNjcm9sbCB0b3AgdG8gMFxuICAgIGlmIChkcm9wZG93bi5zY3JvbGxUb3AgPD0gMzApIGRyb3Bkb3duLnNjcm9sbFRvcCA9IDA7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBuYXZpZ2F0ZVR5cGVzRHJvcERvd24gPSAoZSkgPT4ge1xuICBjb25zdCB0eXBlcyA9IEFycmF5LmZyb20oXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS10eXBlOm5vdChbaGlkZGVuXSknKVxuICApO1xuICBjb25zdCBpID0gdHlwZXMuaW5kZXhPZihkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWhpZ2hsaWdodGVkJykpO1xuXG4gIGlmIChlLmNvZGUgPT09ICdBcnJvd0Rvd24nICYmIGkgPCB0eXBlcy5sZW5ndGggLSAxKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHJlbW92ZUN1cnJlbnRIaWdobGlnaHQoKTtcbiAgICBoaWdobGlnaHRUeXBlKHR5cGVzW2kgKyAxXSk7XG5cbiAgICBzZXRTY3JvbGxUb3BPbkRvd25BcnJvdyh0eXBlc1tpICsgMV0sIGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlRHJvcERvd24pO1xuICB9XG5cbiAgaWYgKGUuY29kZSA9PT0gJ0Fycm93VXAnKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgLy8gV2UgYWx3YXlzIHdhbnQgdG8gcHJldmVudCB0aGUgZGVmYXVsdC4gV2Ugb25seSB3YW50IHRvIGNoYW5nZSB0aGVcbiAgICAvLyBoaWdobGlnaHQgaWYgbm90IG9uIHRoZSB0b3AgdHlwZSBpbiB0aGUgZHJvcGRvd25cbiAgICBpZiAoaSA+IDApIHtcbiAgICAgIHJlbW92ZUN1cnJlbnRIaWdobGlnaHQoKTtcbiAgICAgIGhpZ2hsaWdodFR5cGUodHlwZXNbaSAtIDFdKTtcblxuICAgICAgc2V0U2Nyb2xsVG9wT25VcEFycm93KHR5cGVzW2kgLSAxXSwgZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVEcm9wRG93bik7XG4gICAgfVxuICB9XG5cbiAgaWYgKGUuY29kZSA9PT0gJ0VudGVyJykge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIHRvZ2dsZURhdGFTZWxlY3RlZChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWhpZ2hsaWdodGVkJykpO1xuICAgIGFkZFR5cGUoXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWhpZ2hsaWdodGVkJykuZ2V0QXR0cmlidXRlKCdkYXRhLXR5cGUnKVxuICAgICk7XG4gICAgaGlkZVR5cGVzRHJvcERvd24oKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGhvdmVyT3ZlclR5cGVzTGlzdGVuZXIgPSAoKSA9PiB7XG4gIGNvbnN0IHR5cGVzID0gQXJyYXkuZnJvbShcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLXR5cGU6bm90KFtoaWRkZW5dKScpXG4gICk7XG5cbiAgdHlwZXMuZm9yRWFjaCgodHlwZSkgPT4ge1xuICAgIHR5cGUuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsICgpID0+IGhpZ2hsaWdodFR5cGUodHlwZSkpO1xuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBzdGFydFR5cGVzRHJvcERvd25OYXZpZ2F0aW9uID0gKCkgPT4ge1xuICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgbmF2aWdhdGVUeXBlc0Ryb3BEb3duKTtcbiAgY29uc3QgZmlyc3RUeXBlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS10eXBlOm5vdChbaGlkZGVuXSknKTtcbiAgaGlnaGxpZ2h0VHlwZShmaXJzdFR5cGUpO1xuICBob3Zlck92ZXJUeXBlc0xpc3RlbmVyKCk7XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBuYXZpZ2F0ZVR5cGVzRHJvcERvd24pO1xuICBlbGVtZW50cy5hcGlTZWFyY2gudHlwZURyb3BEb3duLnNjcm9sbFRvcCA9IDA7XG59O1xuXG5jb25zdCByZW1vdmVUeXBlQnRuID0gKCkgPT4ge1xuICAvLyBTcGFuIHdpbGwgYWN0IGFzIHRoZSBidXR0b24gdG8gcmVtb3ZlIHR5cGVzIGZyb20gdGhlIFwic2VsZWN0ZWRcIiBsaXN0XG4gIGNvbnN0IGJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgYnRuLmNsYXNzTGlzdCA9XG4gICAgJ3NlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy1yZW1vdmUtYnRuIGpzLS1hcGktdHlwZXMtY2xvc2UtYnRuJztcbiAgYnRuLmlubmVySFRNTCA9ICd4JztcblxuICBidG4ub25jbGljayA9ICgpID0+IHtcbiAgICBjb25zdCB0eXBlTmFtZSA9IGJ0bi5uZXh0RWxlbWVudFNpYmxpbmcubmV4dEVsZW1lbnRTaWJsaW5nLmlubmVySFRNTDtcblxuICAgIGNvbnN0IHR5cGVUb1RvZ2dsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLXR5cGV8PSR7dHlwZU5hbWV9XWApO1xuXG4gICAgdG9nZ2xlRGF0YVNlbGVjdGVkKHR5cGVUb1RvZ2dsZSk7XG5cbiAgICBidG4ucGFyZW50RWxlbWVudC5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKGJ0bi5wYXJlbnRFbGVtZW50KTtcbiAgfTtcblxuICByZXR1cm4gYnRuO1xufTtcblxuY29uc3QgdHlwZVRvZ2dsZUJ0biA9ICgpID0+IHtcbiAgLy8gU3BhbiB3aWxsIGFjdCBhcyB0aGUgYnV0dG9uIHRvIHRvZ2dsZSB3aGV0aGVyIG9yIG5vdCBhIHR5cGUgaXMgaW5jbHVkZWQgb3IgZXhjbHVkZWQgZnJvbSB0aGUgc2VhcmNoXG4gIGNvbnN0IGJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgYnRuLmNsYXNzTGlzdCA9XG4gICAgJ3NlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy10b2dnbGVyIHNlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy10b2dnbGVyLS1pcyBqcy0tYXBpLXR5cGVzLXRvZ2dsZXInO1xuICBidG4uaW5uZXJIVE1MID0gJ0lTJztcblxuICAvKlxuICAgICAgICBUaGlzIHdpbGwgdG9nZ2xlIGJldHdlZW4gc2VhcmNoaW5nIGZvciBjYXJkcyB0aGF0IGluY2x1ZGUgdGhlIGdpdmVuIHR5cGUgYW5kIGV4Y2x1ZGUgdGhlIGdpdmVuIHR5cGUuXG4gICAgICAgIEl0IHdpbGwgbWFrZSBzdXJlIHRoYXQgdGhlIGFwcHJvcHJpYXRlIGRhdGEgdHlwZSBpcyBnaXZlbiB0byB0aGUgc3BhbiBlbGVtZW50IHRoYXQgY29udGFpbnMgdGhlIHR5cGVcbiAgICAgICAgU28gdGhhdCB0aGUgc2VhcmNoIGZ1bmN0aW9uYWxpdHkgY3JlYXRlcyB0aGUgYXBwcm9wcmlhdGUgcXVlcnkgc3RyaW5nXG5cbiAgICAqL1xuICBidG4ub25jbGljayA9ICgpID0+IHtcbiAgICBpZiAoYnRuLmlubmVySFRNTCA9PT0gJ0lTJykge1xuICAgICAgYnRuLmNsYXNzTGlzdCA9XG4gICAgICAgICdzZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlciBzZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlci0tbm90IGpzLS1hcGktdHlwZXMtdG9nZ2xlcic7XG4gICAgICBidG4ubmV4dEVsZW1lbnRTaWJsaW5nLnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS1pbmNsdWRlLXR5cGUnKTtcbiAgICAgIGJ0bi5uZXh0RWxlbWVudFNpYmxpbmcuc2V0QXR0cmlidXRlKFxuICAgICAgICAnZGF0YS1leGNsdWRlLXR5cGUnLFxuICAgICAgICBidG4ubmV4dEVsZW1lbnRTaWJsaW5nLmlubmVySFRNTFxuICAgICAgKTtcbiAgICAgIGJ0bi5pbm5lckhUTUwgPSAnTk9UJztcbiAgICB9IGVsc2Uge1xuICAgICAgYnRuLmNsYXNzTGlzdCA9XG4gICAgICAgICdzZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlciBzZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlci0taXMganMtLWFwaS10eXBlcy10b2dnbGVyJztcbiAgICAgIGJ0bi5uZXh0RWxlbWVudFNpYmxpbmcucmVtb3ZlQXR0cmlidXRlKCdkYXRhLWV4Y2x1ZGUtdHlwZScpO1xuICAgICAgYnRuLm5leHRFbGVtZW50U2libGluZy5zZXRBdHRyaWJ1dGUoXG4gICAgICAgICdkYXRhLWluY2x1ZGUtdHlwZScsXG4gICAgICAgIGJ0bi5uZXh0RWxlbWVudFNpYmxpbmcuaW5uZXJIVE1MXG4gICAgICApO1xuICAgICAgYnRuLmlubmVySFRNTCA9ICdJUyc7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBidG47XG59O1xuXG5leHBvcnQgY29uc3QgdG9nZ2xlRGF0YVNlbGVjdGVkID0gKHR5cGVPclNldCkgPT4ge1xuICBpZiAodHlwZU9yU2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1zZWxlY3RlZCcpID09PSAndHJ1ZScpIHtcbiAgICB0eXBlT3JTZXQuc2V0QXR0cmlidXRlKCdkYXRhLXNlbGVjdGVkJywgJ2ZhbHNlJyk7XG4gIH0gZWxzZSB7XG4gICAgdHlwZU9yU2V0LnNldEF0dHJpYnV0ZSgnZGF0YS1zZWxlY3RlZCcsICd0cnVlJyk7XG4gIH1cbn07XG5cbmNvbnN0IGFkZFR5cGUgPSAodHlwZSkgPT4ge1xuICAvLyBDcmVhdGUgdGhlIGVtcHR5IGxpIGVsZW1lbnQgdG8gaG9sZCB0aGUgdHlwZXMgdGhhdCB0aGUgdXNlciBzZWxlY3RzLiBTZXQgdGhlIGNsYXNzIGxpc3QsXG4gIC8vIGFuZCB0aGUgZGF0YS1zZWxlY3RlZCBhdHRyaWJ1dGUgdG8gdHJ1ZS5cbiAgY29uc3QgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuICBsaS5jbGFzc0xpc3QgPSAnc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLWxpc3QtaXRlbSBqcy0tYXBpLXNlbGVjdGVkLXR5cGUnO1xuXG4gIC8vIFRoZSB0eXBlU3BhbiBob2xkcyB0aGUgdHlwZSBzZWxlY3RlZCBieSB0aGUgdXNlciBmcm9tIHRoZSBkcm9wZG93bi4gVGhlIGRhdGEgYXR0cmlidXRlXG4gIC8vIGlzIHVzZWQgaW4gU2VhcmNoLmpzIHRvIGJ1aWxkIHRoZSBxdWVyeSBzdHJpbmdcbiAgY29uc3QgdHlwZVNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gIHR5cGVTcGFuLnNldEF0dHJpYnV0ZSgnZGF0YS1pbmNsdWRlLXR5cGUnLCB0eXBlKTtcbiAgdHlwZVNwYW4uaW5uZXJIVE1MID0gdHlwZTtcblxuICAvLyBDb25zdHJ1Y3QgdGhlIGxpIGVsZW1lbnQuIFRoZSByZW1vdmVUeXBlQnRuIGFuZCB0eXBlVG9nZ2xlQnRuIGZ1bmNpdG9ucyByZXR1cm4gaHRtbCBlbGVtZW50c1xuICBsaS5hcHBlbmRDaGlsZChyZW1vdmVUeXBlQnRuKCkpO1xuICBsaS5hcHBlbmRDaGlsZCh0eXBlVG9nZ2xlQnRuKCkpO1xuICBsaS5hcHBlbmRDaGlsZCh0eXBlU3Bhbik7XG5cbiAgZWxlbWVudHMuYXBpU2VhcmNoLnNlbGVjdGVkVHlwZXMuYXBwZW5kQ2hpbGQobGkpO1xufTtcblxuZXhwb3J0IGNvbnN0IHR5cGVMaW5lTGlzdGVuZXIgPSAoZSkgPT4ge1xuICAvLyBJZiB0aGUgdGFyZ2V0IGlzIG5vdCBUeXBlIExpbmUgaW5wdXQgbGluZSwgb3IgYW4gZWxlbWVudCBpbiB0aGUgZHJvcGRvd24gbGlzdCxcbiAgLy8gY2xvc2UgdGhlIGRyb3Bkb3duIGFuZCByZW1vdmUgdGhlIGV2ZW50IGxpc3RlbmVyXG4gIGlmIChcbiAgICBlLnRhcmdldCAhPT0gZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVMaW5lICYmXG4gICAgIWUudGFyZ2V0Lm1hdGNoZXMoJy5qcy0tYXBpLWRyb3Bkb3duLXR5cGVzLWxpc3QnKVxuICApIHtcbiAgICBoaWRlVHlwZXNEcm9wRG93bigpO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdHlwZUxpbmVMaXN0ZW5lcik7XG4gICAgLy8gSWYgdGhlIHRhcmdldCBpcyBvbmUgaWYgdHlwZXMsIGdldCB0aGUgZGF0YSB0eXBlXG4gIH0gZWxzZSBpZiAoZS50YXJnZXQuaGFzQXR0cmlidXRlKCdkYXRhLXR5cGUnKSkge1xuICAgIHRvZ2dsZURhdGFTZWxlY3RlZChlLnRhcmdldCk7XG4gICAgYWRkVHlwZShlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdHlwZScpKTtcbiAgICBlbGVtZW50cy5hcGlTZWFyY2gudHlwZUxpbmUuZm9jdXMoKTtcbiAgICBoaWRlVHlwZXNEcm9wRG93bigpO1xuICB9XG59O1xuXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKiogU0VUUyAqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG5cbmV4cG9ydCBjb25zdCBzaG93U2V0c0Ryb3BEb3duID0gKCkgPT4ge1xuICBpZiAoZWxlbWVudHMuYXBpU2VhcmNoLnNldERyb3BEb3duLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIHtcbiAgICBlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd24ucmVtb3ZlQXR0cmlidXRlKCdoaWRkZW4nKTtcbiAgICBlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd24uc2Nyb2xsVG9wID0gMDtcblxuICAgIGZpbHRlclNldHMoJycpO1xuICAgIGZpbHRlclNlbGVjdGVkU2V0cygpO1xuICAgIGZpbHRlclNldEhlYWRlcnMoKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGhpZGVTZXRzRHJvcERvd24gPSAoKSA9PiB7XG4gIGlmICghZWxlbWVudHMuYXBpU2VhcmNoLnNldERyb3BEb3duLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIHtcbiAgICBlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd24uc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIGVsZW1lbnRzLmFwaVNlYXJjaC5zZXRJbnB1dC52YWx1ZSA9ICcnO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBuYXZpZ2F0ZVNldHNEcm9wRG93bik7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBmaWx0ZXJTZXRIZWFkZXJzID0gKCkgPT4ge1xuICAvLyBPbiBldmVyeSBpbnB1dCBpbnRvIHRoZSB0eXBlbGluZSBiYXIsIG1ha2UgYWxsIGhlYWRlcnMgdmlzaWJsZVxuICBjb25zdCBoZWFkZXJzID0gQXJyYXkuZnJvbShcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLXNldHMtY2F0ZWdvcnktaGVhZGVyJylcbiAgKTtcbiAgaGVhZGVycy5mb3JFYWNoKChoZWFkZXIpID0+IHtcbiAgICBpZiAoaGVhZGVyLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIGhlYWRlci5yZW1vdmVBdHRyaWJ1dGUoJ2hpZGRlbicpO1xuICB9KTtcblxuICAvLyBGb3IgZWFjaCBjYXRlZ29yeSBvZiB0eXBlLCBpZiB0aGVyZSBhcmUgbm90IGFueSB2aXNpYmxlIGJlY2F1c2UgdGhleSB3ZXJlIGZpbHRlcmVkIG91dFxuICAvLyBoaWRlIHRoZSBoZWFkZXIgZm9yIHRoYXQgY2F0ZWdvcnlcbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWV4cGFuc2lvbjpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tZXhwYW5zaW9uLWhlYWRlcicpXG4gICAgICAuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWNvcmU6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1jb3JlLWhlYWRlcicpLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgfVxuXG4gIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1tYXN0ZXJzOm5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcignLmpzLS1tYXN0ZXJzLWhlYWRlcicpXG4gICAgICAuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWRyYWZ0Om5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tZHJhZnQtaGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWR1ZWxfZGVjazpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tZHVlbF9kZWNrLWhlYWRlcicpXG4gICAgICAuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFyY2hlbmVteTpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXJjaGVuZW15LWhlYWRlcicpXG4gICAgICAuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWJveDpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWJveC1oZWFkZXInKS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gIH1cblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tY29tbWFuZGVyOm5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcignLmpzLS1jb21tYW5kZXItaGVhZGVyJylcbiAgICAgIC5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gIH1cblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tdmF1bHQ6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS12YXVsdC1oZWFkZXInKS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gIH1cblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tZnVubnk6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1mdW5ueS1oZWFkZXInKS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gIH1cblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tbWFzdGVycGllY2U6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yKCcuanMtLW1hc3RlcnBpZWNlLWhlYWRlcicpXG4gICAgICAuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLW1lbW9yYWJpbGlhOm5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcignLmpzLS1tZW1vcmFiaWxpYS1oZWFkZXInKVxuICAgICAgLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgfVxuXG4gIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1wbGFuZWNoYXNlOm5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcignLmpzLS1wbGFuZWNoYXNlLWhlYWRlcicpXG4gICAgICAuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXByZW1pdW1fZGVjazpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tcHJlbWl1bV9kZWNrLWhlYWRlcicpXG4gICAgICAuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXByb21vOm5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tcHJvbW8taGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXNwZWxsYm9vazpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tc3BlbGxib29rLWhlYWRlcicpXG4gICAgICAuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXN0YXJ0ZXI6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yKCcuanMtLXN0YXJ0ZXItaGVhZGVyJylcbiAgICAgIC5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gIH1cblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tdG9rZW46bm90KFtoaWRkZW5dKScpKSB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS10b2tlbi1oZWFkZXInKS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gIH1cblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tdHJlYXN1cmVfY2hlc3Q6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yKCcuanMtLXRyZWFzdXJlX2NoZXN0LWhlYWRlcicpXG4gICAgICAuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXZhbmd1YXJkOm5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcignLmpzLS12YW5ndWFyZC1oZWFkZXInKVxuICAgICAgLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGZpbHRlclNldHMgPSAoc3RyKSA9PiB7XG4gIC8vIGdldCBhbGwgb2YgdGhlIHNldHMgb3V0IG9mIHRoZSBkcm9wZG93biBsaXN0XG4gIGNvbnN0IHNldHMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLXNldC1uYW1lXScpKTtcblxuICAvLyBSZW1vdmUgdGhlIGhpZGRlbiBhdHRyaWJ1dGUgaWYgaXQgZXhpc3RzIG9uIGFueSBlbGVtZW50LCBhbmQgdGhlbiBoaWRlIGFueSBlbGVtZW50c1xuICAvLyB0aGF0IGRvbid0IGluY2x1ZGUgdGhlIHN0cmluZyBnaXZlbiBpbiB0aGUgaW5wdXQgZnJvbSB0aGUgdXNlclxuICBzZXRzLmZvckVhY2goKHMpID0+IHtcbiAgICBpZiAocy5oYXNBdHRyaWJ1dGUoJ2hpZGRlbicpKSBzLnJlbW92ZUF0dHJpYnV0ZSgnaGlkZGVuJyk7XG5cbiAgICBmaWx0ZXJTZWxlY3RlZFNldHMoKTtcblxuICAgIGlmIChcbiAgICAgICFzXG4gICAgICAgIC5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2V0LW5hbWUnKVxuICAgICAgICAudG9Mb3dlckNhc2UoKVxuICAgICAgICAuaW5jbHVkZXMoc3RyLnRvTG93ZXJDYXNlKCkpICYmXG4gICAgICAhcy5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2V0LWNvZGUnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHN0ci50b0xvd2VyQ2FzZSgpKVxuICAgICkge1xuICAgICAgcy5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gICAgfVxuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBmaWx0ZXJTZWxlY3RlZFNldHMgPSAoKSA9PiB7XG4gIGNvbnN0IHNldHMgPSBBcnJheS5mcm9tKFxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLXNldC1uYW1lXVtkYXRhLXNlbGVjdGVkXScpXG4gICk7XG5cbiAgc2V0cy5mb3JFYWNoKChzKSA9PiB7XG4gICAgaWYgKHMuZ2V0QXR0cmlidXRlKCdkYXRhLXNlbGVjdGVkJykgPT09ICd0cnVlJykge1xuICAgICAgaWYgKCFzLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIHMuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5leHBvcnQgY29uc3QgaGlnaGxpZ2h0U2V0ID0gKHNldHQpID0+IHtcbiAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taGlnaGxpZ2h0ZWQnKSkgcmVtb3ZlQ3VycmVudEhpZ2hsaWdodCgpO1xuXG4gIGlmIChzZXR0KSB7XG4gICAgc2V0dC5jbGFzc0xpc3QuYWRkKFxuICAgICAgJ2pzLS1oaWdobGlnaHRlZCcsXG4gICAgICAnc2VhcmNoLWZvcm1fX2Ryb3Bkb3duLWxpc3Qtb3B0aW9uLS1oaWdobGlnaHRlZCdcbiAgICApO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgbmF2aWdhdGVTZXRzRHJvcERvd24gPSAoZSkgPT4ge1xuICBjb25zdCBzZXRzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLXNldDpub3QoW2hpZGRlbl0pJykpO1xuICBjb25zdCBpID0gc2V0cy5pbmRleE9mKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taGlnaGxpZ2h0ZWQnKSk7XG5cbiAgaWYgKGUuY29kZSA9PT0gJ0Fycm93RG93bicgJiYgaSA8IHNldHMubGVuZ3RoIC0gMSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICByZW1vdmVDdXJyZW50SGlnaGxpZ2h0KCk7XG4gICAgaGlnaGxpZ2h0U2V0KHNldHNbaSArIDFdKTtcblxuICAgIHNldFNjcm9sbFRvcE9uRG93bkFycm93KHNldHNbaSArIDFdLCBlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd24pO1xuICB9XG5cbiAgaWYgKGUuY29kZSA9PT0gJ0Fycm93VXAnICYmIGkgPiAwKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHJlbW92ZUN1cnJlbnRIaWdobGlnaHQoKTtcbiAgICBoaWdobGlnaHRTZXQoc2V0c1tpIC0gMV0pO1xuXG4gICAgc2V0U2Nyb2xsVG9wT25VcEFycm93KHNldHNbaSAtIDFdLCBlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd24pO1xuICB9XG5cbiAgaWYgKGUuY29kZSA9PT0gJ0VudGVyJykge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIHRvZ2dsZURhdGFTZWxlY3RlZChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWhpZ2hsaWdodGVkJykpO1xuICAgIGFkZFNldChcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taGlnaGxpZ2h0ZWQnKS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2V0LW5hbWUnKSxcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taGlnaGxpZ2h0ZWQnKS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2V0LWNvZGUnKVxuICAgICk7XG4gICAgaGlkZVNldHNEcm9wRG93bigpO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgaG92ZXJPdmVyU2V0c0xpc3RlbmVyID0gKCkgPT4ge1xuICBjb25zdCBzZXRzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLXNldDpub3QoW2hpZGRlbl0pJykpO1xuXG4gIHNldHMuZm9yRWFjaCgocykgPT4ge1xuICAgIHMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsICgpID0+IGhpZ2hsaWdodFR5cGUocykpO1xuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBzdGFydFNldHNEcm9wRG93bk5hdmlnYXRpb24gPSAoKSA9PiB7XG4gIGNvbnN0IGZpcnN0U2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1zZXQ6bm90KFtoaWRkZW5dKScpO1xuICBoaWdobGlnaHRTZXQoZmlyc3RTZXQpO1xuICBob3Zlck92ZXJTZXRzTGlzdGVuZXIoKTtcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG5hdmlnYXRlU2V0c0Ryb3BEb3duKTtcbiAgZWxlbWVudHMuYXBpU2VhcmNoLnNldERyb3BEb3duLnNjcm9sbFRvcCA9IDA7XG59O1xuXG5jb25zdCByZW1vdmVTZXRCdG4gPSAoKSA9PiB7XG4gIC8vIFNwYW4gd2lsbCBhY3QgYXMgdGhlIGJ1dHRvbiB0byByZW1vdmUgc2V0cyBmcm9tIHRoZSBcInNlbGVjdGVkXCIgbGlzdFxuICBjb25zdCBidG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gIGJ0bi5jbGFzc0xpc3QgPVxuICAgICdzZWFyY2gtZm9ybV9fc2VsZWN0ZWQtc2V0cy1yZW1vdmUtYnRuIGpzLS1hcGktc2V0cy1jbG9zZS1idG4nO1xuICBidG4uaW5uZXJIVE1MID0gJ3gnO1xuXG4gIGJ0bi5vbmNsaWNrID0gKCkgPT4ge1xuICAgIGNvbnN0IHNldE5hbWUgPSBidG4ubmV4dEVsZW1lbnRTaWJsaW5nLmlubmVySFRNTDtcbiAgICBjb25zdCBzZXRUb1RvZ2dsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLXNldC1uYW1lfD0ke3NldE5hbWV9XWApO1xuICAgIHRvZ2dsZURhdGFTZWxlY3RlZChzZXRUb1RvZ2dsZSk7XG5cbiAgICBidG4ucGFyZW50RWxlbWVudC5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKGJ0bi5wYXJlbnRFbGVtZW50KTtcbiAgfTtcblxuICByZXR1cm4gYnRuO1xufTtcblxuY29uc3QgYWRkU2V0ID0gKHNldE5hbWUsIHNldENvZGUpID0+IHtcbiAgLy8gQ3JlYXRlIHRoZSBlbXB0eSBsaSBlbGVtZW50IHRvIGhvbGQgdGhlIHR5cGVzIHRoYXQgdGhlIHVzZXIgc2VsZWN0cy4gU2V0IHRoZSBjbGFzcyBsaXN0LFxuICAvLyBhbmQgdGhlIGRhdGEtc2VsZWN0ZWQgYXR0cmlidXRlIHRvIHRydWUuXG4gIGNvbnN0IGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgbGkuY2xhc3NMaXN0ID0gJ3NlYXJjaC1mb3JtX19zZWxlY3RlZC1zZXRzLWxpc3QtaXRlbSBqcy0tYXBpLXNlbGVjdGVkLXNldCc7XG5cbiAgLy8gVGhlIHR5cGVTcGFuIGhvbGRzIHRoZSB0eXBlIHNlbGVjdGVkIGJ5IHRoZSB1c2VyIGZyb20gdGhlIGRyb3Bkb3duLiBUaGUgZGF0YSBhdHRyaWJ1dGVcbiAgLy8gaXMgdXNlZCBpbiBTZWFyY2guanMgdG8gYnVpbGQgdGhlIHF1ZXJ5IHN0cmluZ1xuICBjb25zdCBzZXRTcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICBzZXRTcGFuLnNldEF0dHJpYnV0ZSgnZGF0YS1pbmNsdWRlLXNldCcsIHNldENvZGUpO1xuICBzZXRTcGFuLmlubmVySFRNTCA9IHNldE5hbWU7XG5cbiAgbGkuYXBwZW5kQ2hpbGQocmVtb3ZlU2V0QnRuKCkpO1xuICBsaS5hcHBlbmRDaGlsZChzZXRTcGFuKTtcblxuICBlbGVtZW50cy5hcGlTZWFyY2guc2VsZWN0ZWRTZXRzLmFwcGVuZENoaWxkKGxpKTtcbn07XG5cbmV4cG9ydCBjb25zdCBzZXRJbnB1dExpc3RlbmVyID0gKGUpID0+IHtcbiAgLy8gSWYgdGhlIHRhcmdldCBpcyBub3QgdGhlIHNldCBpbnB1dCBmaWVsZCwgb3IgYW4gZWxlbWVudCBpbiB0aGUgZHJvcGRvd24gbGlzdCxcbiAgLy8gY2xvc2UgdGhlIGRyb3Bkb3duIGFuZCByZW1vdmUgdGhlIGV2ZW50IGxpc3RlbmVyXG4gIGlmIChcbiAgICBlLnRhcmdldCAhPT0gZWxlbWVudHMuYXBpU2VhcmNoLnNldElucHV0ICYmXG4gICAgIWUudGFyZ2V0Lm1hdGNoZXMoJy5qcy0tYXBpLWRyb3Bkb3duLXNldHMtbGlzdCcpXG4gICkge1xuICAgIGhpZGVTZXRzRHJvcERvd24oKTtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHNldElucHV0TGlzdGVuZXIpO1xuICAgIC8vIElmIHRoZSB0YXJnZXQgaXMgb25lIG9mIHRoZSBzZXQgb3B0aW9ucywgdG9nZ2xlIGl0IGFzIHNlbGVjdGVkLCBhZGQgaXQgdG8gdGhlIGxpc3QsXG4gICAgLy8gYW5kIGhpZGUgdGhlIGRyb3Bkb3duLlxuICB9IGVsc2UgaWYgKGUudGFyZ2V0Lmhhc0F0dHJpYnV0ZSgnZGF0YS1zZXQtbmFtZScpKSB7XG4gICAgdG9nZ2xlRGF0YVNlbGVjdGVkKGUudGFyZ2V0KTtcbiAgICBhZGRTZXQoXG4gICAgICBlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2V0LW5hbWUnKSxcbiAgICAgIGUudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1zZXQtY29kZScpXG4gICAgKTtcbiAgICBlbGVtZW50cy5hcGlTZWFyY2guc2V0SW5wdXQuZm9jdXMoKTtcbiAgICBoaWRlU2V0c0Ryb3BEb3duKCk7XG4gIH1cbn07XG5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKioqIFNUQVRTICoqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcblxuZXhwb3J0IGNvbnN0IHN0YXRMaW5lQ29udHJvbGxlciA9ICgpID0+IHtcbiAgaWYgKGNoZWNrU3RhdExpbmVGb3JJbnRlZ2VyKCkgJiYgY2hlY2tGb3JMZXNzVGhhbkZvdXJTdGF0TGluZXMoKSkge1xuICAgIGNvbnN0IGNsb25lID0gY3JlYXRlU3RhdHNDbG9uZSgpO1xuICAgIGVkaXRTdGF0c0Nsb25lKGNsb25lKTtcbiAgICBpbnNlcnRTdGF0c0Nsb25lKGNsb25lKTtcbiAgICByZXNldFN0YXRMaW5lRXZlbnRMaXN0ZW5lcigpO1xuICB9XG59O1xuXG5jb25zdCBjaGVja1N0YXRMaW5lRm9ySW50ZWdlciA9ICgpID0+IHtcbiAgY29uc3Qgc3RhdFZhbCA9IEFycmF5LmZyb20oXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1hcGktc3RhdC12YWx1ZScpXG4gICkuc2xpY2UoLTEpWzBdO1xuXG4gIHJldHVybiBwYXJzZUludChzdGF0VmFsLnZhbHVlKSA+PSAwID8gdHJ1ZSA6IGZhbHNlO1xufTtcblxuY29uc3QgY2hlY2tGb3JMZXNzVGhhbkZvdXJTdGF0TGluZXMgPSAoKSA9PiB7XG4gIGNvbnN0IHN0YXRzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWFwaS1zdGF0LXZhbHVlJykpO1xuXG4gIHJldHVybiBzdGF0cy5sZW5ndGggPCA0ID8gdHJ1ZSA6IGZhbHNlO1xufTtcblxuY29uc3QgY3JlYXRlU3RhdHNDbG9uZSA9ICgpID0+IHtcbiAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXN0YXRzLXdyYXBwZXInKS5jbG9uZU5vZGUodHJ1ZSk7XG59O1xuXG5jb25zdCBlZGl0U3RhdHNDbG9uZSA9IChjbG9uZSkgPT4ge1xuICBjbG9uZS5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1zdGF0JykudmFsdWUgPSAnJztcbiAgY2xvbmUucXVlcnlTZWxlY3RvcignLmpzLS1hcGktc3RhdC1maWx0ZXInKS52YWx1ZSA9ICcnO1xuICBjbG9uZS5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1zdGF0LXZhbHVlJykudmFsdWUgPSAnJztcbn07XG5cbmNvbnN0IGluc2VydFN0YXRzQ2xvbmUgPSAoY2xvbmUpID0+IHtcbiAgY29uc3QgbGFzdFN0YXRMaW5lID0gQXJyYXkuZnJvbShcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWFwaS1zdGF0cy13cmFwcGVyJylcbiAgKS5zbGljZSgtMSlbMF07XG5cbiAgbGFzdFN0YXRMaW5lLmluc2VydEFkamFjZW50RWxlbWVudCgnYWZ0ZXJlbmQnLCBjbG9uZSk7XG59O1xuXG5jb25zdCByZXNldFN0YXRMaW5lRXZlbnRMaXN0ZW5lciA9ICgpID0+IHtcbiAgY29uc3Qgc3RhdFZhbHVlcyA9IEFycmF5LmZyb20oXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1hcGktc3RhdC12YWx1ZScpXG4gICk7XG4gIHN0YXRWYWx1ZXMuc2xpY2UoLTIpWzBdLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2lucHV0Jywgc3RhdExpbmVDb250cm9sbGVyKTtcbiAgc3RhdFZhbHVlcy5zbGljZSgtMSlbMF0uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCBzdGF0TGluZUNvbnRyb2xsZXIpO1xufTtcblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKiogTEVHQUwgU1RBVFVTICoqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuXG5leHBvcnQgY29uc3QgZm9ybWF0TGluZUNvbnRyb2xsZXIgPSAoKSA9PiB7XG4gIGNvbnNvbGUubG9nKGNoZWNrRm9yRm91ckxlc3NUaGFuRm9ybWF0TGluZXMoKSk7XG4gIGlmIChjaGVja0ZvckZvdXJMZXNzVGhhbkZvcm1hdExpbmVzKCkgJiYgY2hlY2tGb3JtYXRMaW5lRm9yVmFsdWUoKSkge1xuICAgIGNvbnN0IGNsb25lID0gY3JlYXRlRm9ybWF0Q2xvbmUoKTtcbiAgICBlZGl0Rm9ybWF0Q2xvbmUoY2xvbmUpO1xuICAgIGluc2VydEZvcm1hdENsb25lKGNsb25lKTtcbiAgICByZXNldEZvcm1hdExpbmVFdmVudExpc3RlbmVyKCk7XG4gIH1cbn07XG5cbmNvbnN0IGNoZWNrRm9ybWF0TGluZUZvclZhbHVlID0gKCkgPT4ge1xuICBjb25zdCBmb3JtYXQgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tYXBpLWZvcm1hdCcpKS5zbGljZShcbiAgICAtMVxuICApWzBdO1xuXG4gIHJldHVybiBmb3JtYXQudmFsdWUgIT09ICcnID8gdHJ1ZSA6IGZhbHNlO1xufTtcblxuY29uc3QgY2hlY2tGb3JGb3VyTGVzc1RoYW5Gb3JtYXRMaW5lcyA9ICgpID0+IHtcbiAgY29uc3QgZm9ybWF0cyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1hcGktZm9ybWF0JykpO1xuICByZXR1cm4gZm9ybWF0cy5sZW5ndGggPCA0ID8gdHJ1ZSA6IGZhbHNlO1xufTtcblxuY29uc3QgY3JlYXRlRm9ybWF0Q2xvbmUgPSAoKSA9PiB7XG4gIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1mb3JtYXQtd3JhcHBlcicpLmNsb25lTm9kZSh0cnVlKTtcbn07XG5cbmNvbnN0IGVkaXRGb3JtYXRDbG9uZSA9IChjbG9uZSkgPT4ge1xuICBjbG9uZS5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1sZWdhbC1zdGF0dXMnKS52YWx1ZSA9ICcnO1xuICBjbG9uZS5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1mb3JtYXQnKS52YWx1ZSA9ICcnO1xufTtcblxuY29uc3QgaW5zZXJ0Rm9ybWF0Q2xvbmUgPSAoY2xvbmUpID0+IHtcbiAgY29uc3QgbGFzdEZvcm1hdExpbmUgPSBBcnJheS5mcm9tKFxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tYXBpLWZvcm1hdC13cmFwcGVyJylcbiAgKS5zbGljZSgtMSlbMF07XG5cbiAgbGFzdEZvcm1hdExpbmUuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdhZnRlcmVuZCcsIGNsb25lKTtcbn07XG5cbmNvbnN0IHJlc2V0Rm9ybWF0TGluZUV2ZW50TGlzdGVuZXIgPSAoKSA9PiB7XG4gIGNvbnN0IGZvcm1hdHMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tYXBpLWZvcm1hdCcpKTtcbiAgZm9ybWF0cy5zbGljZSgtMilbMF0ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZm9ybWF0TGluZUNvbnRyb2xsZXIpO1xuICBmb3JtYXRzLnNsaWNlKC0xKVswXS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmb3JtYXRMaW5lQ29udHJvbGxlcik7XG59O1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0aWYoX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSkge1xuXHRcdHJldHVybiBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0aWQ6IG1vZHVsZUlkLFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiBtb2R1bGVbJ2RlZmF1bHQnXSA6XG5cdFx0KCkgPT4gbW9kdWxlO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5nID0gKGZ1bmN0aW9uKCkge1xuXHRpZiAodHlwZW9mIGdsb2JhbFRoaXMgPT09ICdvYmplY3QnKSByZXR1cm4gZ2xvYmFsVGhpcztcblx0dHJ5IHtcblx0XHRyZXR1cm4gdGhpcyB8fCBuZXcgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JykgcmV0dXJuIHdpbmRvdztcblx0fVxufSkoKTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsInZhciBzY3JpcHRVcmw7XG5pZiAoX193ZWJwYWNrX3JlcXVpcmVfXy5nLmltcG9ydFNjcmlwdHMpIHNjcmlwdFVybCA9IF9fd2VicGFja19yZXF1aXJlX18uZy5sb2NhdGlvbiArIFwiXCI7XG52YXIgZG9jdW1lbnQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLmcuZG9jdW1lbnQ7XG5pZiAoIXNjcmlwdFVybCAmJiBkb2N1bWVudCkge1xuXHRpZiAoZG9jdW1lbnQuY3VycmVudFNjcmlwdClcblx0XHRzY3JpcHRVcmwgPSBkb2N1bWVudC5jdXJyZW50U2NyaXB0LnNyY1xuXHRpZiAoIXNjcmlwdFVybCkge1xuXHRcdHZhciBzY3JpcHRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJzY3JpcHRcIik7XG5cdFx0aWYoc2NyaXB0cy5sZW5ndGgpIHNjcmlwdFVybCA9IHNjcmlwdHNbc2NyaXB0cy5sZW5ndGggLSAxXS5zcmNcblx0fVxufVxuLy8gV2hlbiBzdXBwb3J0aW5nIGJyb3dzZXJzIHdoZXJlIGFuIGF1dG9tYXRpYyBwdWJsaWNQYXRoIGlzIG5vdCBzdXBwb3J0ZWQgeW91IG11c3Qgc3BlY2lmeSBhbiBvdXRwdXQucHVibGljUGF0aCBtYW51YWxseSB2aWEgY29uZmlndXJhdGlvblxuLy8gb3IgcGFzcyBhbiBlbXB0eSBzdHJpbmcgKFwiXCIpIGFuZCBzZXQgdGhlIF9fd2VicGFja19wdWJsaWNfcGF0aF9fIHZhcmlhYmxlIGZyb20geW91ciBjb2RlIHRvIHVzZSB5b3VyIG93biBsb2dpYy5cbmlmICghc2NyaXB0VXJsKSB0aHJvdyBuZXcgRXJyb3IoXCJBdXRvbWF0aWMgcHVibGljUGF0aCBpcyBub3Qgc3VwcG9ydGVkIGluIHRoaXMgYnJvd3NlclwiKTtcbnNjcmlwdFVybCA9IHNjcmlwdFVybC5yZXBsYWNlKC8jLiokLywgXCJcIikucmVwbGFjZSgvXFw/LiokLywgXCJcIikucmVwbGFjZSgvXFwvW15cXC9dKyQvLCBcIi9cIik7XG5fX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBzY3JpcHRVcmw7IiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGVcbl9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9qcy9pbmRleC5qc1wiKTtcbi8vIFRoaXMgZW50cnkgbW9kdWxlIHVzZWQgJ2V4cG9ydHMnIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbiJdLCJzb3VyY2VSb290IjoiIn0=