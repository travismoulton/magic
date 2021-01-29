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
___CSS_LOADER_EXPORT___.push([module.id, "*,\n*::after,\n*::before {\n  margin: 0;\n  padding: 0;\n  box-sizing: inherit; }\n\nhtml {\n  font-size: 62.5%; }\n\nbody {\n  box-sizing: border-box;\n  font-size: 1.6rem;\n  background-size: cover;\n  background-repeat: no-repeat;\n  height: 127.5rem;\n  font-family: 'Lato', sans-serif;\n  position: relative; }\n\n[hidden] {\n  display: none !important; }\n\n.heading-tertiary {\n  font-size: 2.4rem;\n  text-transform: uppercase; }\n  .heading-tertiary--white {\n    color: #fff; }\n\n.heading-primary {\n  font-size: 3rem;\n  text-transform: uppercase;\n  font-weight: 300;\n  color: #fff; }\n\n.mb-10 {\n  margin-bottom: 1rem; }\n\n.mb-20 {\n  margin-bottom: 2rem; }\n\n.mt-50 {\n  margin-top: 5rem; }\n\n.btn, .btn:link, .btn:visited {\n  padding: .75rem 2rem;\n  border-radius: .5rem;\n  background-color: #f2f2f2;\n  font-weight: 400;\n  display: inline-block; }\n\n.btn:active, .btn:focus {\n  outline: none;\n  transform: translateY(-1px);\n  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.2); }\n\n.login,\n.register {\n  min-height: calc(100vh - 6.1rem);\n  width: 100vw;\n  background: linear-gradient(to top, #5f4f66, #342332);\n  background-repeat: no-repeat;\n  background-size: cover;\n  display: flex;\n  justify-content: center;\n  align-items: center; }\n  .login-img,\n  .register-img {\n    position: absolute;\n    border-radius: 100%;\n    height: 8.5rem;\n    width: 8.5rem;\n    top: -15%; }\n  .login__form,\n  .register__form {\n    position: relative;\n    background-color: #1e2a38;\n    border: 2px solid #1e2a38;\n    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.25);\n    max-width: 32rem;\n    display: flex;\n    flex-flow: column nowrap;\n    align-items: center;\n    padding: 4rem 0 2.6rem 0;\n    transform: translateY(-25%); }\n  .login__form-instructions,\n  .register__form-instructions {\n    color: #fff;\n    font-size: 1.4rem;\n    text-align: center;\n    margin-bottom: 1rem;\n    width: 90%; }\n  .login__form-group,\n  .register__form-group {\n    width: 90%; }\n  .login__form-input,\n  .register__form-input {\n    width: 100%;\n    margin: 0 auto;\n    border: 1px solid rgba(255, 255, 255, 0.2);\n    background-color: rgba(0, 0, 0, 0.1);\n    box-shadow: rgba(0, 0, 0, 0.5);\n    border-radius: 2px;\n    margin-bottom: 1rem;\n    line-height: 1.25;\n    text-align: center;\n    height: 4.2rem;\n    padding: 1rem 1.4rem;\n    caret-color: #fff;\n    color: rgba(255, 255, 255, 0.75); }\n    .login__form-input::placeholder,\n    .register__form-input::placeholder {\n      font-weight: 300;\n      color: #e6e6e6;\n      font-size: 1.8rem; }\n    .login__form-input:focus,\n    .register__form-input:focus {\n      border: 1px solid rgba(255, 255, 255, 0.75); }\n  .login__form-btn,\n  .register__form-btn {\n    width: 90%;\n    border-radius: 2px;\n    padding: 0 1.4rem;\n    margin: 1rem auto 0 auto;\n    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25);\n    cursor: pointer;\n    display: flex;\n    justify-content: space-around;\n    align-items: center;\n    height: 4.2rem; }\n    .login__form-btn--login,\n    .register__form-btn--login {\n      background-color: rgba(255, 255, 255, 0.87);\n      color: #16161d;\n      border: 1px solid #fff; }\n      .login__form-btn--login:hover,\n      .register__form-btn--login:hover {\n        background-color: #fff;\n        color: #342442; }\n      .login__form-btn--login:hover .login__form-icon-path--login,\n      .register__form-btn--login:hover .login__form-icon-path--login {\n        fill: #342442; }\n      .login__form-btn--login::after,\n      .register__form-btn--login::after {\n        margin-bottom: 1px solid white; }\n    .login__form-btn--register,\n    .register__form-btn--register {\n      text-decoration: none;\n      background-color: rgba(255, 255, 255, 0.1);\n      border: 1px solid rgba(255, 255, 255, 0.05);\n      color: rgba(255, 255, 255, 0.75); }\n      .login__form-btn--register:hover,\n      .register__form-btn--register:hover {\n        background-color: rgba(255, 255, 255, 0.25);\n        color: #fff; }\n      .login__form-btn--register:hover .login__form-icon-path--login,\n      .register__form-btn--register:hover .login__form-icon-path--login {\n        fill: #fff; }\n    .login__form-btn span,\n    .register__form-btn span {\n      margin-right: 1rem; }\n  .login__form-icon,\n  .register__form-icon {\n    height: 1.5rem;\n    width: 1.5rem;\n    transform: translateY(17%); }\n  .login__form-icon-path--login,\n  .register__form-icon-path--login {\n    fill: #16161d; }\n  .login__form-icon-path--register,\n  .register__form-icon-path--register {\n    fill: #fff; }\n  .login__form-hr,\n  .register__form-hr {\n    width: 90%;\n    margin: 2rem 0 1rem 0;\n    margin-bottom: 0.25px solid rgba(255, 255, 255, 0.25); }\n\n.nav {\n  display: flex;\n  align-items: center;\n  padding: 1rem 16%;\n  background-color: #2b253a;\n  border-bottom: 1px solid #000; }\n  @media only screen and (max-width: 71.875em) {\n    .nav {\n      padding: 1.2rem 5%; } }\n  @media only screen and (max-width: 43.75em) {\n    .nav {\n      padding: 1rem; } }\n  .nav__left {\n    display: flex;\n    flex: 0 0 50%; }\n  .nav__right {\n    display: flex;\n    border-right: 1px solid #fff;\n    border-left: 1px solid #fff;\n    padding-left: 1rem;\n    margin-left: auto; }\n    @media only screen and (max-width: 37.5em) {\n      .nav__right {\n        display: none; } }\n    .nav__right > * {\n      margin-right: 1rem; }\n  .nav__item--search {\n    flex: 0 0 25%; }\n    @media only screen and (max-width: 37.5em) {\n      .nav__item--search {\n        display: none; } }\n  .nav__item--home {\n    margin-right: 3rem; }\n  .nav__link {\n    text-decoration: none;\n    color: rgba(255, 255, 255, 0.75);\n    transition: all 0.2s; }\n    .nav__link:hover {\n      margin-bottom: 2px;\n      color: #fff;\n      border-bottom: 1px solid #fff; }\n    .nav__link--home:hover .nav__icon-path--home {\n      fill: #fff; }\n  .nav__search {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    position: relative; }\n    .nav__search-input {\n      border: none;\n      padding: 1rem 2rem;\n      background-color: #2b253a;\n      caret-color: rgba(255, 255, 255, 0.75);\n      color: #fff; }\n      .nav__search-input::placeholder {\n        color: rgba(255, 255, 255, 0.75); }\n      .nav__search-input:focus {\n        outline: none; }\n    .nav__search-btn {\n      cursor: pointer;\n      position: absolute;\n      left: 2rem;\n      top: 1rem; }\n      .nav__search-btn:hover .nav__icon-path--search {\n        fill: #fff; }\n  .nav__icon-sizing--home {\n    width: 3rem;\n    height: 3rem; }\n  .nav__icon-sizing--search {\n    width: 2rem;\n    height: 2rem;\n    transform: translateX(-150%); }\n  .nav__icon-path--home {\n    fill: rgba(255, 255, 255, 0.75); }\n  .nav__icon-path--search {\n    fill: #bfbfbf; }\n  .nav__mobile {\n    display: none; }\n    @media only screen and (max-width: 37.5em) {\n      .nav__mobile {\n        display: flex;\n        flex: 0 0 50%;\n        align-items: center;\n        justify-content: end; } }\n    .nav__mobile-links {\n      background-color: #2b253a;\n      flex-flow: wrap;\n      padding: 1rem 0;\n      justify-content: flex-start;\n      display: none; }\n    .nav__mobile-link {\n      flex: 0 0 48%;\n      border: 1px solid rgba(85, 26, 139, 0.5);\n      border-color: rgba(255, 255, 255, 0.6);\n      background-color: rgba(255, 255, 255, 0.1);\n      border-radius: 3px;\n      margin-top: 0.6rem;\n      margin-left: 1%;\n      text-decoration: none;\n      color: #fff;\n      cursor: pointer;\n      line-height: 1.4;\n      padding: 0.2rem 1rem 0 1rem;\n      height: 2.8rem;\n      transition: all 0.2s;\n      box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06);\n      text-align: center;\n      transition: all 0.2s; }\n      .nav__mobile-link:hover {\n        background-color: rgba(255, 255, 255, 0.25); }\n    .nav__mobile-hamburger-wrapper {\n      display: flex;\n      align-items: center;\n      margin-right: 1rem;\n      height: 3rem;\n      width: 3rem; }\n    .nav__mobile-hamburger {\n      position: relative; }\n      .nav__mobile-hamburger, .nav__mobile-hamburger::before, .nav__mobile-hamburger::after {\n        width: 3rem;\n        height: 2px;\n        background-color: rgba(255, 255, 255, 0.75);\n        display: inline-block; }\n      .nav__mobile-hamburger::before, .nav__mobile-hamburger::after {\n        content: '';\n        position: absolute;\n        left: 0; }\n      .nav__mobile-hamburger::before {\n        margin-top: -0.8rem; }\n      .nav__mobile-hamburger::after {\n        margin-top: 0.8rem; }\n\n.error {\n  margin-top: 2rem;\n  text-align: center;\n  background-color: #ff8080;\n  border-radius: 10px;\n  padding: 2rem;\n  font-size: 2rem;\n  grid-column: center-start / center-end;\n  font-weight: 700; }\n\n.search-form {\n  padding: 2rem 25rem;\n  background-color: #fdfdfd;\n  min-height: calc(100vh - 6.2rem); }\n  @media only screen and (max-width: 81.25em) {\n    .search-form {\n      padding: 2rem 15rem; } }\n  @media only screen and (max-width: 62.5em) {\n    .search-form {\n      padding: 2rem 5rem; } }\n  @media only screen and (max-width: 56.25em) {\n    .search-form {\n      padding: 2rem 1rem; } }\n  .search-form__group {\n    width: 75%;\n    display: flex;\n    margin-bottom: 3rem;\n    align-items: flex-start;\n    padding: 0.5rem 4rem 0.5rem 0;\n    border-bottom: 1px solid rgba(0, 0, 0, 0.2); }\n    @media only screen and (max-width: 93.75em) {\n      .search-form__group {\n        width: 100%; } }\n    @media only screen and (max-width: 46.875em) {\n      .search-form__group {\n        flex-direction: column; } }\n    .search-form__group:nth-child(10) {\n      border-bottom: none; }\n    .search-form__group--no-border {\n      border-bottom: none; }\n  .search-form__label {\n    flex: 0 0 20%;\n    display: flex;\n    align-items: flex-start;\n    font-weight: 300;\n    margin-top: 0.7rem;\n    color: #551a8b; }\n    @media only screen and (max-width: 46.875em) {\n      .search-form__label {\n        margin-bottom: 1.2rem;\n        margin-left: 1rem; } }\n  .search-form__group-input-wrapper {\n    flex: 0 0 80%; }\n    @media only screen and (max-width: 46.875em) {\n      .search-form__group-input-wrapper {\n        flex: 0 0 100%;\n        width: 100%; } }\n  .search-form__input-wrapper {\n    flex: 0 0 80%; }\n    @media only screen and (max-width: 46.875em) {\n      .search-form__input-wrapper {\n        flex: 0 0 100%;\n        width: 100%; } }\n  .search-form__tip {\n    font-size: 1rem;\n    line-height: 1.4;\n    width: 70%; }\n  .search-form__input-text {\n    width: 40rem;\n    height: 4rem;\n    margin-bottom: 1rem;\n    padding: 1rem;\n    border: solid 1px #bfbfbf;\n    border-radius: 5px; }\n    @media only screen and (max-width: 28.125em) {\n      .search-form__input-text {\n        width: 30rem; } }\n    @media only screen and (max-width: 21.875em) {\n      .search-form__input-text {\n        width: 20rem; } }\n    .search-form__input-text:focus {\n      border: solid 1px #000; }\n  .search-form__input-integer {\n    border: 1px solid #aeaeae;\n    height: 3.5rem;\n    border-radius: 3px;\n    padding-left: 0.5rem;\n    padding-right: 0.5rem;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06); }\n    .search-form__input-integer--relative {\n      position: relative; }\n    @media only screen and (max-width: 37.5em) {\n      .search-form__input-integer {\n        max-width: 30%; } }\n  .search-form__group--checkbox {\n    display: flex;\n    margin-bottom: 1rem; }\n  .search-form__group-colors-left, .search-form__group-colors-right {\n    display: flex; }\n    @media only screen and (max-width: 81.25em) {\n      .search-form__group-colors-left, .search-form__group-colors-right {\n        flex-direction: column; } }\n  @media only screen and (max-width: 81.25em) {\n    .search-form__group-colors-left {\n      margin-right: 3rem; } }\n  .search-form__group-rarity-left, .search-form__group-rarity-right {\n    display: flex; }\n    @media only screen and (max-width: 28.125em) {\n      .search-form__group-rarity-left, .search-form__group-rarity-right {\n        flex-direction: column; } }\n  @media only screen and (max-width: 81.25em) {\n    .search-form__group-rarity-left {\n      margin-right: 3rem; } }\n  .search-form__label--checkbox {\n    margin-right: 1rem; }\n  .search-form__input-checkbox {\n    width: 2.25rem;\n    height: 2.25rem;\n    margin-right: 0.8rem; }\n    @media only screen and (max-width: 93.75em) {\n      .search-form__input-checkbox {\n        margin-bottom: 0.3rem; } }\n  .search-form__checkbox-wrapper {\n    display: flex;\n    align-items: center; }\n  .search-form__select-menu {\n    margin-bottom: 1rem;\n    color: #343242;\n    margin-right: 1rem;\n    border: 1px solid #aeaeae;\n    border-radius: 3px;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06);\n    padding: 0 2.2rem 0 0.5rem;\n    height: 3.4rem;\n    font-size: 1.4rem;\n    text-indent: 0;\n    -webkit-appearance: none;\n    -moz-appearance: none;\n    text-overflow: '';\n    background-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\n    background-repeat: no-repeat;\n    background-position: right 0.8rem center;\n    background-size: 1.2rem 1rem;\n    background-color: #fff; }\n    @media only screen and (max-width: 81.25em) {\n      .search-form__select-menu {\n        margin-right: 0.3rem; } }\n    @media only screen and (max-width: 37.5em) {\n      .search-form__select-menu--2 {\n        max-width: 49%; } }\n    @media only screen and (max-width: 37.5em) {\n      .search-form__select-menu--3 {\n        max-width: 32%; } }\n  .search-form__svg-size {\n    height: 2rem;\n    width: 2rem;\n    margin-right: 1rem; }\n  .search-form__svg-color {\n    fill: #551a8b; }\n  .search-form__submit-wrapper {\n    position: sticky;\n    bottom: 0;\n    width: 100%;\n    display: flex;\n    margin-bottom: 3rem;\n    border-top: 1px solid rgba(0, 0, 0, 0.2);\n    align-items: flex-start;\n    padding: 1.5rem 4rem 1.5rem 0;\n    background-color: #fdfdfd;\n    z-index: 1; }\n  .search-form__submit {\n    border-radius: 3px;\n    padding: 0.7rem;\n    background-color: #f9f7f5;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    color: #551a8b;\n    font-weight: 500;\n    transition: all 0.2s;\n    margin-left: 20%; }\n    .search-form__submit:hover {\n      cursor: pointer;\n      background-color: #fff; }\n  .search-form__dropdown-span {\n    display: flex;\n    flex-direction: column; }\n  .search-form__selected-types, .search-form__selected-sets {\n    display: flex;\n    flex-direction: column;\n    list-style: none;\n    margin-bottom: 0.3rem; }\n  .search-form__selected-types-list-item, .search-form__selected-sets-list-item {\n    display: flex;\n    margin-bottom: 0.7rem; }\n  .search-form__selected-types-remove-btn, .search-form__selected-sets-remove-btn {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    cursor: pointer;\n    height: 2rem;\n    width: 2rem;\n    font-size: 1.3rem;\n    background-color: #f2f2f2;\n    margin-right: 0.7rem; }\n  .search-form__selected-types-toggler {\n    height: 2rem;\n    width: 2.75rem;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    cursor: pointer;\n    font-size: 1.3rem;\n    margin-right: 0.7rem; }\n    .search-form__selected-types-toggler--is {\n      background-color: #47d147; }\n    .search-form__selected-types-toggler--not {\n      background-color: #ff0000; }\n  .search-form__dropdown {\n    position: absolute;\n    max-height: 28rem;\n    background-color: #fff;\n    z-index: 2;\n    top: 100%;\n    width: 40rem;\n    margin-top: -1rem;\n    overflow-y: auto;\n    border: 1px solid #000; }\n    .search-form__dropdown-list {\n      list-style: none; }\n      .search-form__dropdown-list-category {\n        padding: 0.5rem; }\n      .search-form__dropdown-list-option {\n        padding: 0.3rem 2rem;\n        display: flex;\n        align-items: center; }\n        .search-form__dropdown-list-option:hover {\n          cursor: pointer; }\n        .search-form__dropdown-list-option--highlighted {\n          background-color: #ccd8ff; }\n        .search-form__dropdown-list-option span {\n          text-transform: uppercase;\n          margin-left: 1rem; }\n      .search-form__dropdown-list-img {\n        width: 2rem;\n        height: 2rem;\n        margin-right: 0.7rem; }\n\n.dropdown-wrapper {\n  position: relative; }\n\n.inv-search-price-msg {\n  position: absolute;\n  bottom: 0;\n  right: 0;\n  color: red; }\n\n.relative {\n  position: relative; }\n\n.api-results-display__nav {\n  background-color: #f3f5f8;\n  border-bottom: 1px solid rgba(99, 68, 150, 0.1);\n  width: 100%;\n  display: flex;\n  justify-content: space-between;\n  padding: 1.2rem 16%;\n  margin-bottom: 0.1rem;\n  height: 5.2rem; }\n  @media only screen and (max-width: 71.875em) {\n    .api-results-display__nav {\n      padding: 1.2rem 5%; } }\n  @media only screen and (max-width: 53.125em) {\n    .api-results-display__nav {\n      display: none; } }\n  .api-results-display__nav-select {\n    color: #b300b3;\n    margin-right: 1rem;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    border-radius: 3px;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06);\n    padding: 0.1rem 2.2rem 0 0.5rem;\n    color: #551a8b;\n    height: 2.8rem;\n    font-size: 1.4rem;\n    text-indent: 0;\n    -webkit-appearance: none;\n    -moz-appearance: none;\n    text-overflow: '';\n    background-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\n    background-repeat: no-repeat;\n    background-position: right 0.8rem center;\n    background-size: 1.2rem 1rem; }\n    .api-results-display__nav-select:hover {\n      cursor: pointer;\n      background-color: #fff; }\n  .api-results-display__nav-label {\n    color: #551a8b; }\n  .api-results-display__nav-btn {\n    border-radius: 3px;\n    background-color: #f9f7f5;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    color: #551a8b;\n    font-weight: 500;\n    transition: all 0.2s;\n    height: 2.8rem;\n    padding: 0.1rem 0.7rem 0 0.7rem;\n    font-size: 1.4rem;\n    margin: auto 0;\n    text-align: center;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06); }\n    .api-results-display__nav-btn:hover {\n      cursor: pointer;\n      background-color: #fff; }\n  .api-results-display__nav-right {\n    display: flex;\n    align-items: center; }\n  .api-results-display__nav-pagination-container {\n    display: flex;\n    align-items: center;\n    background-color: #f9f7f5;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    color: #551a8b;\n    padding: 0.2rem 0.7rem;\n    cursor: pointer;\n    height: 2.8rem;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06); }\n    .api-results-display__nav-pagination-container:not(:last-child) {\n      margin-right: 1rem; }\n    .api-results-display__nav-pagination-container:nth-child(2) svg {\n      margin-right: 1rem; }\n    .api-results-display__nav-pagination-container:nth-child(3) svg {\n      margin-left: 1rem; }\n    .api-results-display__nav-pagination-container--disabled {\n      cursor: not-allowed;\n      color: rgba(0, 0, 0, 0.25);\n      background-color: #f5f6f7; }\n    @media only screen and (max-width: 31.5em) {\n      .api-results-display__nav-pagination-container {\n        margin: 0; } }\n  .api-results-display__nav-svg-size {\n    height: 2rem;\n    width: 2rem; }\n  .api-results-display__nav-svg-color {\n    fill: #551a8b; }\n\n.api-results-display__display-bar {\n  width: 100%;\n  border-bottom: 1px solid rgba(99, 68, 150, 0.1);\n  background-color: #f6f4fa;\n  color: #535353;\n  padding-left: 16%;\n  margin-bottom: 2rem;\n  height: 2.1rem; }\n  @media only screen and (max-width: 71.875em) {\n    .api-results-display__display-bar {\n      padding-left: 5%; } }\n\n.api-results-display__mobile {\n  background-color: #f3f5f8;\n  border-bottom: 1px solid rgba(99, 68, 150, 0.1);\n  justify-content: space-between;\n  margin-bottom: 0.1rem;\n  height: 5.2rem;\n  display: none; }\n  @media only screen and (max-width: 53.125em) {\n    .api-results-display__mobile {\n      display: flex;\n      padding: 1.2rem 5%; } }\n  @media only screen and (max-width: 31.5em) {\n    .api-results-display__mobile {\n      padding: 1.2rem; } }\n  .api-results-display__mobile-svg-size {\n    width: 1.4rem;\n    height: 1.4rem; }\n\n.api-results-display__mobile-display-options {\n  background-color: #f3f5f8;\n  border-bottom: 1px solid rgba(99, 68, 150, 0.1);\n  flex-direction: column;\n  align-items: flex-start;\n  padding: 1.2rem 0;\n  display: none; }\n\n.api-results-display__mobile-display-options-group {\n  display: flex;\n  justify-content: space-between;\n  width: 45%;\n  margin: 0 auto 1rem auto; }\n  @media only screen and (max-width: 51.5625em) {\n    .api-results-display__mobile-display-options-group {\n      width: 60%; } }\n  @media only screen and (max-width: 37.5em) {\n    .api-results-display__mobile-display-options-group {\n      width: 80%; } }\n  @media only screen and (max-width: 28.125em) {\n    .api-results-display__mobile-display-options-group {\n      width: 95%; } }\n  .api-results-display__mobile-display-options-group label {\n    margin-right: 1rem; }\n\n.api-results-display__nav-select--mobile {\n  width: 24rem; }\n  @media only screen and (max-width: 21.875em) {\n    .api-results-display__nav-select--mobile {\n      width: 16rem; } }\n\n.api-results-mobile-display-btn {\n  align-self: center; }\n\n.wrapper {\n  overflow-x: scroll;\n  overflow-y: hidden;\n  position: relative;\n  display: flex; }\n\n.card-checklist {\n  width: 68%;\n  justify-self: center; }\n  @media only screen and (max-width: 71.875em) {\n    .card-checklist {\n      width: 90%; } }\n  .card-checklist__row {\n    display: grid;\n    height: 3rem; }\n    .card-checklist__row--7 {\n      grid-template-columns: 10% 22.5% 10% 17.5% 15% 15% 10%; }\n    .card-checklist__row--9 {\n      grid-template-columns: repeat(9, 1fr); }\n    .card-checklist__row--header {\n      border-bottom: 1px solid #000;\n      color: #531a8b;\n      text-transform: uppercase;\n      font-size: 1.2rem !important;\n      font-weight: 200 !important; }\n    .card-checklist__row--grey {\n      background-color: #f2f2f2; }\n    .card-checklist__row:nth-child(even) {\n      background-color: #f2f2f2; }\n    .card-checklist__row--header {\n      height: 3.5rem; }\n  .card-checklist__data {\n    width: 100%;\n    display: flex;\n    flex-wrap: nowrap;\n    justify-content: flex-start;\n    font-size: 1.4rem; }\n    .card-checklist__data--set {\n      text-transform: uppercase;\n      padding-left: 0.5rem; }\n    .card-checklist__data--name {\n      justify-content: flex-start; }\n    .card-checklist__data--rarity {\n      text-transform: capitalize; }\n  .card-checklist__data-link {\n    padding: 1rem 0;\n    display: block;\n    text-decoration: none;\n    width: 100%;\n    color: #000;\n    white-space: nowrap;\n    overflow: hidden;\n    text-overflow: ellipsis; }\n    .card-checklist__data-link--price {\n      color: #006885; }\n\n.tooltip {\n  position: absolute;\n  z-index: 5;\n  width: 24rem;\n  height: 34rem; }\n  .tooltip__img {\n    width: 100%;\n    height: 100%; }\n\n.negative-earnings {\n  color: red; }\n\n.positive-earnings {\n  color: green; }\n\n.image-grid {\n  padding: 7rem 16%;\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(25rem, 1fr));\n  grid-column-gap: 2rem;\n  grid-row-gap: 1rem; }\n  .image-grid__outer-div {\n    position: relative; }\n  .image-grid__inner-div {\n    perspective: 150rem;\n    height: 34rem;\n    width: 24rem; }\n  .image-grid__double {\n    height: 34rem;\n    width: 24rem;\n    position: absolute;\n    top: 0;\n    left: 0;\n    backface-visibility: hidden;\n    overflow: hidden;\n    transition: all 0.8s ease; }\n    .image-grid__double--back {\n      transform: rotateY(180deg); }\n  .image-grid__double-btn {\n    position: absolute;\n    top: 26%;\n    left: 75%;\n    width: 4.4rem;\n    height: 4.4rem;\n    border-radius: 50%;\n    background-color: rgba(255, 255, 255, 0.6);\n    border: 2px solid #342442;\n    transition: all 0.2s;\n    display: flex;\n    justify-content: center;\n    align-items: center; }\n    .image-grid__double-btn:hover {\n      cursor: pointer;\n      background-color: #fff; }\n  .image-grid__double-btn-svg {\n    height: 2.5rem;\n    width: 2.5rem;\n    pointer-events: none; }\n  .image-grid__dobule-btn-svg-color {\n    color: #16161d; }\n  .image-grid__container {\n    width: 24rem;\n    height: 34rem; }\n  .image-grid__image {\n    width: 100%;\n    height: 100%; }\n\n.card {\n  width: 100%;\n  padding: 0 16%;\n  display: flex;\n  margin-top: 3rem;\n  padding-bottom: 0.7rem;\n  border-bottom: 1px dashed rgba(0, 0, 0, 0.7); }\n  .card__img-container {\n    z-index: 2;\n    border-radius: 100%; }\n  .card__img {\n    width: 33rem;\n    height: 46rem;\n    box-shadow: 1px 1px 8px rgba(0, 0, 0, 0.5);\n    border-radius: 4.75% / 3.5%; }\n  .card__img-left {\n    width: 33rem;\n    display: flex;\n    flex-direction: column;\n    z-index: 2; }\n  .card__img-btn {\n    align-self: center;\n    margin-top: 1rem;\n    height: 2.8rem;\n    font-size: 1.4rem;\n    line-height: 1.8;\n    color: #551a8b;\n    background-color: #f9f7f5;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    border-radius: 3px;\n    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06);\n    transition: all 0.2s;\n    padding: 0.2rem 0.5rem;\n    text-align: center;\n    display: flex;\n    align-items: center; }\n    .card__img-btn:hover {\n      cursor: pointer;\n      background-color: #fff;\n      border-color: #634496; }\n  .card__img-svg {\n    height: 1.4rem;\n    width: 1.4rem;\n    margin-right: 0.3rem;\n    pointer-events: none; }\n  .card__img-svg-color {\n    fill: #551a8b; }\n  .card__img-double-area {\n    position: relative; }\n  .card__img-double-sided {\n    perspective: 150rem;\n    height: 46rem; }\n  .card__img-double {\n    width: 33rem;\n    height: 46rem;\n    position: absolute;\n    top: 0;\n    left: 0;\n    backface-visibility: hidden;\n    overflow: hidden; }\n    .card__img-double--back {\n      transform: rotateY(180deg); }\n  .card__text {\n    background-color: #fff;\n    border-radius: 4px;\n    border: 1px solid rgba(0, 0, 0, 0.25);\n    border-top: 3px solid #000;\n    border-bottom: 3px solid #000;\n    margin-top: 2rem;\n    width: 34rem;\n    display: flex;\n    flex-direction: column;\n    padding: 3rem;\n    margin-right: 3rem;\n    margin-left: -2rem; }\n    .card__text-flex {\n      margin-bottom: 1rem;\n      border-bottom: 1px solid #bfbfbf; }\n    .card__text-title {\n      display: flex;\n      align-items: center; }\n      .card__text-title-h3 {\n        font-size: 1.8rem;\n        font-weight: 400;\n        margin-right: 1rem; }\n    .card__text-color-indicator {\n      width: 1.3rem;\n      height: 1.3rem;\n      border: 1px solid #333;\n      border-radius: 50%;\n      box-shadow: 0px 0px 0px 2px rgba(0, 0, 0, 0.2);\n      margin-right: 0.7rem;\n      display: inline-block; }\n      .card__text-color-indicator--U {\n        background-color: rgba(128, 128, 255, 0.7); }\n      .card__text-color-indicator--B {\n        background-color: rgba(0, 0, 0, 0.7); }\n      .card__text-color-indicator--R {\n        background-color: rgba(255, 77, 77, 0.7); }\n      .card__text-color-indicator--W {\n        background-color: rgba(255, 255, 255, 0.7); }\n      .card__text-color-indicator--G {\n        background-color: rgba(0, 255, 0, 0.7); }\n    .card__text-oracle-p {\n      margin-bottom: 1rem;\n      font-size: 1.3rem; }\n    .card__text-oracle-flavor {\n      font-size: 1.3rem;\n      font-style: italic; }\n    .card__text-illustrator {\n      font-size: 1.2rem;\n      font-style: italic; }\n    .card__text-legal {\n      display: flex;\n      flex-direction: row;\n      justify-content: space-between; }\n      .card__text-legal-half {\n        display: flex;\n        flex-direction: column; }\n      .card__text-legal-span-container {\n        display: flex;\n        align-items: center;\n        font-size: 1.4rem; }\n        .card__text-legal-span-container:not(:last-child) {\n          margin-bottom: 0.5rem; }\n      .card__text-legal-span-box {\n        width: 6rem;\n        height: 2.5rem;\n        margin-right: 0.3rem;\n        font-size: 1rem;\n        text-transform: uppercase;\n        display: flex;\n        justify-content: center;\n        align-items: center;\n        border-radius: 3px; }\n        .card__text-legal-span-box--not_legal {\n          background-color: #e60000; }\n        .card__text-legal-span-box--legal {\n          background-color: #009900; }\n      .card__text-legal-span-box {\n        color: #fff; }\n  .card__set {\n    display: flex;\n    flex-direction: column; }\n    .card__set-banner {\n      display: flex;\n      border: 1px solid #bfbfbf;\n      width: 40rem;\n      background-color: #49465c;\n      color: #fdfdfd;\n      padding: 0.7rem;\n      border-radius: 3px; }\n      .card__set-banner-svg-container {\n        margin-right: 1rem; }\n      .card__set-banner-svg {\n        width: 2.4rem;\n        height: 2.4rem;\n        filter: invert(100%); }\n    .card__set-details {\n      display: flex;\n      flex-direction: column; }\n    .card__set-header-name {\n      font-size: 1.7remrem; }\n    .card__set-header-code {\n      text-transform: uppercase; }\n    .card__set-prints-header {\n      display: flex;\n      justify-content: space-between;\n      background-color: #49465c;\n      color: #fdfdfd;\n      font-size: 1.3rem;\n      text-transform: uppercase;\n      border: 1px solid #bfbfbf;\n      border-radius: 3px;\n      padding: 0.3rem 0.7rem; }\n    .card__set-prints-svg-container {\n      height: 1.8rem;\n      width: 1.8rem;\n      border: 1px solid #bfbfbf;\n      display: flex;\n      justify-content: center;\n      align-items: center;\n      border-radius: 100%; }\n    .card__set-prints-svg--common {\n      fill: #000; }\n    .card__set-prints-svg--uncommon {\n      fill: #e6e6e6; }\n    .card__set-prints-svg--rare {\n      fill: #e6c300; }\n    .card__set-prints-svg--mythic {\n      fill: #ff0000; }\n    .card__set-prints-list {\n      list-style: none;\n      border-radius: 3px; }\n      .card__set-prints-list-link:link, .card__set-prints-list-link:visited {\n        text-decoration: none;\n        color: #000; }\n      .card__set-prints-list-item {\n        display: flex;\n        justify-content: space-between;\n        cursor: pointer;\n        border-bottom: 1px solid #e7e9ec;\n        border-left: 1px solid #cdcdcd;\n        background-color: #fff;\n        padding: 0.25rem 0; }\n        .card__set-prints-list-item--pl-14 {\n          padding-left: 1.4rem;\n          border-bottom: 3px solid #000; }\n        .card__set-prints-list-item:hover {\n          background-color: #f2f2f2; }\n      .card__set-prints-list-item-name-wrapper {\n        display: flex;\n        align-items: center;\n        margin-left: -1rem; }\n      .card__set-prints-list-item-set-name {\n        margin-left: 0.5rem; }\n      .card__set-prints-list-item-price {\n        margin-right: 0.7rem;\n        color: #006885; }\n\n.card-page {\n  display: flex;\n  flex-direction: column;\n  grid-column: 1 / -1;\n  position: relative; }\n\n.add-to-inv,\n.remove-from-inv {\n  margin-top: 3rem;\n  width: 50%;\n  margin-left: 50%;\n  transform: translateX(-50%);\n  display: flex;\n  flex-direction: column; }\n  .add-to-inv__header,\n  .remove-from-inv__header {\n    color: #16161d;\n    font-size: 2.2rem;\n    font-weight: 300;\n    margin: 0 auto 1rem auto; }\n  .add-to-inv__form,\n  .remove-from-inv__form {\n    display: flex;\n    flex-direction: column; }\n    .add-to-inv__form-price,\n    .remove-from-inv__form-price {\n      width: 20rem;\n      height: 3.5rem;\n      margin-bottom: 1rem;\n      padding: 1rem;\n      border: solid 1px #bfbfbf;\n      border-radius: 5px; }\n      .add-to-inv__form-price:focus,\n      .remove-from-inv__form-price:focus {\n        border: solid 1px #000; }\n    .add-to-inv__form-group,\n    .remove-from-inv__form-group {\n      display: flex;\n      justify-content: space-evenly;\n      align-content: center;\n      margin-bottom: 1.5rem;\n      position: relative; }\n    .add-to-inv__form-label,\n    .remove-from-inv__form-label {\n      margin-right: 0.3rem;\n      display: flex;\n      align-content: center;\n      justify-content: center;\n      color: #16161d;\n      margin-top: 0.45rem; }\n  .add-to-inv-price-msg,\n  .remove-from-inv-price-msg {\n    position: absolute;\n    bottom: -1.8rem;\n    right: 25%;\n    color: red; }\n  .add-to-inv__submit,\n  .remove-from-inv__submit {\n    align-self: center;\n    height: 3.1rem;\n    font-size: 1.4rem;\n    line-height: 1.8;\n    color: #551a8b;\n    background-color: #f9f7f5;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    border-radius: 3px;\n    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06);\n    transition: all 0.2s;\n    padding: 0.2rem 0.75rem;\n    text-align: center;\n    display: flex;\n    align-items: center;\n    margin-bottom: 1rem; }\n    .add-to-inv__submit:hover,\n    .remove-from-inv__submit:hover {\n      cursor: pointer;\n      background-color: #fff;\n      border-color: #634496; }\n\n.util-space::before,\n.util-space::after {\n  content: '';\n  margin: 0 0.2rem; }\n\n.no-results {\n  justify-self: center; }\n\n.homepage {\n  background: linear-gradient(to bottom, #1d1c25, #431e3f);\n  background-repeat: no-repeat;\n  height: 100vh;\n  display: flex;\n  overflow-x: hidden !important;\n  justify-content: center;\n  position: relative;\n  background-size: cover; }\n  .homepage__center {\n    align-self: center;\n    display: flex;\n    flex-direction: column; }\n    @media only screen and (max-width: 28.125em) {\n      .homepage__center {\n        margin-top: -12rem; } }\n  @media only screen and (max-width: 40.625em) {\n    .homepage__center-heading-wrapper {\n      margin: 0 auto 0.5rem auto;\n      width: 75%;\n      display: flex;\n      justify-content: center;\n      text-align: center; } }\n  .homepage__search {\n    position: relative; }\n  .homepage__search-input {\n    padding: 1.2rem 1.4rem 1.2rem 6.2rem;\n    font-size: 3rem;\n    background-color: #242031;\n    color: #d7d7d7;\n    border-radius: 4px;\n    box-shadow: 0px 0px 0px 2px rgba(0, 0, 0, 0.5);\n    width: 100%;\n    border: 1px solid rgba(255, 255, 255, 0.5); }\n    .homepage__search-input::placeholder {\n      text-align: center; }\n    @media only screen and (max-width: 40.625em) {\n      .homepage__search-input {\n        width: 80%;\n        margin-left: 10%; } }\n  .homepage__search-btn {\n    position: absolute;\n    left: 6rem;\n    top: 2rem; }\n    @media only screen and (max-width: 40.625em) {\n      .homepage__search-btn {\n        left: 12rem; } }\n    @media only screen and (max-width: 28.125em) {\n      .homepage__search-btn {\n        left: 10rem; } }\n  .homepage__icon-sizing--search {\n    width: 3rem;\n    height: 3rem;\n    transform: translateX(-150%); }\n  .homepage__icon-path {\n    fill: #bfbfbf; }\n  .homepage__links {\n    display: flex;\n    justify-content: center; }\n    @media only screen and (max-width: 40.625em) {\n      .homepage__links {\n        flex-direction: column; } }\n    @media only screen and (max-width: 28.125em) {\n      .homepage__links {\n        margin-left: 7.5%; } }\n  .homepage__link {\n    text-decoration: none;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    border-color: rgba(255, 255, 255, 0.6);\n    border-radius: 3px;\n    color: #fff;\n    margin-top: 0.6rem;\n    margin-right: 3rem;\n    cursor: pointer;\n    line-height: 1.4;\n    padding: 0.2rem 1rem 0 1rem;\n    height: 2.8rem;\n    transition: all 0.2s;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06);\n    min-width: 9rem;\n    text-align: center; }\n    @media only screen and (max-width: 40.625em) {\n      .homepage__link {\n        align-self: center;\n        width: 14.5rem; } }\n    .homepage__link:hover {\n      background-color: rgba(255, 255, 255, 0.09); }\n\n.inventory-details {\n  grid-column: 1 / -1;\n  border-bottom: 1px solid rgba(99, 68, 150, 0.1);\n  background-color: #f6f4fa;\n  color: #535353;\n  padding: 1rem 16%;\n  margin-bottom: 2rem;\n  position: relative;\n  display: flex;\n  justify-content: space-between; }\n  .inventory-details__link {\n    text-decoration: none;\n    color: rgba(83, 83, 83, 0.75);\n    transition: all 0.2s;\n    padding: 0 0.6rem;\n    border-left: 1px solid #535353;\n    border-right: 1px solid #535353; }\n    .inventory-details__link:hover {\n      color: #535353; }\n  .inventory-details span {\n    color: #006885; }\n\n.homepage__colage,\n.cardpage__colage {\n  position: absolute;\n  overflow: hidden;\n  left: 0;\n  height: 15rem;\n  width: 100%; }\n\n.homepage__colage {\n  bottom: 0; }\n\n.cardpage__colage {\n  bottom: -2.6rem; }\n\n.homepage__colage-inner,\n.cardpage__colage-inner {\n  position: relative;\n  height: 100%;\n  margin-left: 50%;\n  transform: translateX(-50%);\n  width: 65.5rem; }\n\n.homepage__colage-card,\n.cardpage__colage-card {\n  width: 16.8rem;\n  height: 23.4rem;\n  position: absolute;\n  border-radius: 5% / 3.75%;\n  transform: translateY(0);\n  transition: all 0.3s;\n  box-shadow: inset 0 0 3px 3px #000; }\n  .homepage__colage-card:nth-child(1),\n  .cardpage__colage-card:nth-child(1) {\n    top: 2.2rem; }\n  .homepage__colage-card:nth-child(2),\n  .cardpage__colage-card:nth-child(2) {\n    top: 6.2rem;\n    left: 3.5rem; }\n  .homepage__colage-card:nth-child(3),\n  .cardpage__colage-card:nth-child(3) {\n    top: 1rem;\n    left: 17.4rem; }\n  .homepage__colage-card:nth-child(4),\n  .cardpage__colage-card:nth-child(4) {\n    top: 4.5rem;\n    left: 20.6rem; }\n  .homepage__colage-card:nth-child(5),\n  .cardpage__colage-card:nth-child(5) {\n    top: 1.6rem;\n    left: 34.7rem; }\n  .homepage__colage-card:nth-child(6),\n  .cardpage__colage-card:nth-child(6) {\n    top: 6.5rem;\n    left: 38rem; }\n  .homepage__colage-card:nth-child(7),\n  .cardpage__colage-card:nth-child(7) {\n    top: 3.5rem;\n    right: 0; }\n  .homepage__colage-card:hover,\n  .cardpage__colage-card:hover {\n    transform: translateY(-5%); }\n\n.container {\n  display: grid;\n  grid-template-columns: [full-start] minmax(6rem, 1fr) [center-start] repeat(8, [col-start] minmax(min-content, 14rem) [col-end]) [center-end] minmax(6rem, 1fr) [full-end];\n  background-color: #f5f6f7;\n  background-size: cover;\n  position: relative; }\n\n.search {\n  grid-column: full-start / full-end;\n  background-color: #fff; }\n\n.api-results-display {\n  grid-column: full-start / full-end;\n  background-color: #f5f6f7;\n  background-size: cover;\n  display: grid; }\n", "",{"version":3,"sources":["webpack://./src/css/style.css"],"names":[],"mappings":"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","sourcesContent":["*,\n*::after,\n*::before {\n  margin: 0;\n  padding: 0;\n  box-sizing: inherit; }\n\nhtml {\n  font-size: 62.5%; }\n\nbody {\n  box-sizing: border-box;\n  font-size: 1.6rem;\n  background-size: cover;\n  background-repeat: no-repeat;\n  height: 127.5rem;\n  font-family: 'Lato', sans-serif;\n  position: relative; }\n\n[hidden] {\n  display: none !important; }\n\n.heading-tertiary {\n  font-size: 2.4rem;\n  text-transform: uppercase; }\n  .heading-tertiary--white {\n    color: #fff; }\n\n.heading-primary {\n  font-size: 3rem;\n  text-transform: uppercase;\n  font-weight: 300;\n  color: #fff; }\n\n.mb-10 {\n  margin-bottom: 1rem; }\n\n.mb-20 {\n  margin-bottom: 2rem; }\n\n.mt-50 {\n  margin-top: 5rem; }\n\n.btn, .btn:link, .btn:visited {\n  padding: .75rem 2rem;\n  border-radius: .5rem;\n  background-color: #f2f2f2;\n  font-weight: 400;\n  display: inline-block; }\n\n.btn:active, .btn:focus {\n  outline: none;\n  transform: translateY(-1px);\n  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.2); }\n\n.login,\n.register {\n  min-height: calc(100vh - 6.1rem);\n  width: 100vw;\n  background: linear-gradient(to top, #5f4f66, #342332);\n  background-repeat: no-repeat;\n  background-size: cover;\n  display: flex;\n  justify-content: center;\n  align-items: center; }\n  .login-img,\n  .register-img {\n    position: absolute;\n    border-radius: 100%;\n    height: 8.5rem;\n    width: 8.5rem;\n    top: -15%; }\n  .login__form,\n  .register__form {\n    position: relative;\n    background-color: #1e2a38;\n    border: 2px solid #1e2a38;\n    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.25);\n    max-width: 32rem;\n    display: flex;\n    flex-flow: column nowrap;\n    align-items: center;\n    padding: 4rem 0 2.6rem 0;\n    transform: translateY(-25%); }\n  .login__form-instructions,\n  .register__form-instructions {\n    color: #fff;\n    font-size: 1.4rem;\n    text-align: center;\n    margin-bottom: 1rem;\n    width: 90%; }\n  .login__form-group,\n  .register__form-group {\n    width: 90%; }\n  .login__form-input,\n  .register__form-input {\n    width: 100%;\n    margin: 0 auto;\n    border: 1px solid rgba(255, 255, 255, 0.2);\n    background-color: rgba(0, 0, 0, 0.1);\n    box-shadow: rgba(0, 0, 0, 0.5);\n    border-radius: 2px;\n    margin-bottom: 1rem;\n    line-height: 1.25;\n    text-align: center;\n    height: 4.2rem;\n    padding: 1rem 1.4rem;\n    caret-color: #fff;\n    color: rgba(255, 255, 255, 0.75); }\n    .login__form-input::placeholder,\n    .register__form-input::placeholder {\n      font-weight: 300;\n      color: #e6e6e6;\n      font-size: 1.8rem; }\n    .login__form-input:focus,\n    .register__form-input:focus {\n      border: 1px solid rgba(255, 255, 255, 0.75); }\n  .login__form-btn,\n  .register__form-btn {\n    width: 90%;\n    border-radius: 2px;\n    padding: 0 1.4rem;\n    margin: 1rem auto 0 auto;\n    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25);\n    cursor: pointer;\n    display: flex;\n    justify-content: space-around;\n    align-items: center;\n    height: 4.2rem; }\n    .login__form-btn--login,\n    .register__form-btn--login {\n      background-color: rgba(255, 255, 255, 0.87);\n      color: #16161d;\n      border: 1px solid #fff; }\n      .login__form-btn--login:hover,\n      .register__form-btn--login:hover {\n        background-color: #fff;\n        color: #342442; }\n      .login__form-btn--login:hover .login__form-icon-path--login,\n      .register__form-btn--login:hover .login__form-icon-path--login {\n        fill: #342442; }\n      .login__form-btn--login::after,\n      .register__form-btn--login::after {\n        margin-bottom: 1px solid white; }\n    .login__form-btn--register,\n    .register__form-btn--register {\n      text-decoration: none;\n      background-color: rgba(255, 255, 255, 0.1);\n      border: 1px solid rgba(255, 255, 255, 0.05);\n      color: rgba(255, 255, 255, 0.75); }\n      .login__form-btn--register:hover,\n      .register__form-btn--register:hover {\n        background-color: rgba(255, 255, 255, 0.25);\n        color: #fff; }\n      .login__form-btn--register:hover .login__form-icon-path--login,\n      .register__form-btn--register:hover .login__form-icon-path--login {\n        fill: #fff; }\n    .login__form-btn span,\n    .register__form-btn span {\n      margin-right: 1rem; }\n  .login__form-icon,\n  .register__form-icon {\n    height: 1.5rem;\n    width: 1.5rem;\n    transform: translateY(17%); }\n  .login__form-icon-path--login,\n  .register__form-icon-path--login {\n    fill: #16161d; }\n  .login__form-icon-path--register,\n  .register__form-icon-path--register {\n    fill: #fff; }\n  .login__form-hr,\n  .register__form-hr {\n    width: 90%;\n    margin: 2rem 0 1rem 0;\n    margin-bottom: 0.25px solid rgba(255, 255, 255, 0.25); }\n\n.nav {\n  display: flex;\n  align-items: center;\n  padding: 1rem 16%;\n  background-color: #2b253a;\n  border-bottom: 1px solid #000; }\n  @media only screen and (max-width: 71.875em) {\n    .nav {\n      padding: 1.2rem 5%; } }\n  @media only screen and (max-width: 43.75em) {\n    .nav {\n      padding: 1rem; } }\n  .nav__left {\n    display: flex;\n    flex: 0 0 50%; }\n  .nav__right {\n    display: flex;\n    border-right: 1px solid #fff;\n    border-left: 1px solid #fff;\n    padding-left: 1rem;\n    margin-left: auto; }\n    @media only screen and (max-width: 37.5em) {\n      .nav__right {\n        display: none; } }\n    .nav__right > * {\n      margin-right: 1rem; }\n  .nav__item--search {\n    flex: 0 0 25%; }\n    @media only screen and (max-width: 37.5em) {\n      .nav__item--search {\n        display: none; } }\n  .nav__item--home {\n    margin-right: 3rem; }\n  .nav__link {\n    text-decoration: none;\n    color: rgba(255, 255, 255, 0.75);\n    transition: all 0.2s; }\n    .nav__link:hover {\n      margin-bottom: 2px;\n      color: #fff;\n      border-bottom: 1px solid #fff; }\n    .nav__link--home:hover .nav__icon-path--home {\n      fill: #fff; }\n  .nav__search {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    position: relative; }\n    .nav__search-input {\n      border: none;\n      padding: 1rem 2rem;\n      background-color: #2b253a;\n      caret-color: rgba(255, 255, 255, 0.75);\n      color: #fff; }\n      .nav__search-input::placeholder {\n        color: rgba(255, 255, 255, 0.75); }\n      .nav__search-input:focus {\n        outline: none; }\n    .nav__search-btn {\n      cursor: pointer;\n      position: absolute;\n      left: 2rem;\n      top: 1rem; }\n      .nav__search-btn:hover .nav__icon-path--search {\n        fill: #fff; }\n  .nav__icon-sizing--home {\n    width: 3rem;\n    height: 3rem; }\n  .nav__icon-sizing--search {\n    width: 2rem;\n    height: 2rem;\n    transform: translateX(-150%); }\n  .nav__icon-path--home {\n    fill: rgba(255, 255, 255, 0.75); }\n  .nav__icon-path--search {\n    fill: #bfbfbf; }\n  .nav__mobile {\n    display: none; }\n    @media only screen and (max-width: 37.5em) {\n      .nav__mobile {\n        display: flex;\n        flex: 0 0 50%;\n        align-items: center;\n        justify-content: end; } }\n    .nav__mobile-links {\n      background-color: #2b253a;\n      flex-flow: wrap;\n      padding: 1rem 0;\n      justify-content: flex-start;\n      display: none; }\n    .nav__mobile-link {\n      flex: 0 0 48%;\n      border: 1px solid rgba(85, 26, 139, 0.5);\n      border-color: rgba(255, 255, 255, 0.6);\n      background-color: rgba(255, 255, 255, 0.1);\n      border-radius: 3px;\n      margin-top: 0.6rem;\n      margin-left: 1%;\n      text-decoration: none;\n      color: #fff;\n      cursor: pointer;\n      line-height: 1.4;\n      padding: 0.2rem 1rem 0 1rem;\n      height: 2.8rem;\n      transition: all 0.2s;\n      box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06);\n      text-align: center;\n      transition: all 0.2s; }\n      .nav__mobile-link:hover {\n        background-color: rgba(255, 255, 255, 0.25); }\n    .nav__mobile-hamburger-wrapper {\n      display: flex;\n      align-items: center;\n      margin-right: 1rem;\n      height: 3rem;\n      width: 3rem; }\n    .nav__mobile-hamburger {\n      position: relative; }\n      .nav__mobile-hamburger, .nav__mobile-hamburger::before, .nav__mobile-hamburger::after {\n        width: 3rem;\n        height: 2px;\n        background-color: rgba(255, 255, 255, 0.75);\n        display: inline-block; }\n      .nav__mobile-hamburger::before, .nav__mobile-hamburger::after {\n        content: '';\n        position: absolute;\n        left: 0; }\n      .nav__mobile-hamburger::before {\n        margin-top: -0.8rem; }\n      .nav__mobile-hamburger::after {\n        margin-top: 0.8rem; }\n\n.error {\n  margin-top: 2rem;\n  text-align: center;\n  background-color: #ff8080;\n  border-radius: 10px;\n  padding: 2rem;\n  font-size: 2rem;\n  grid-column: center-start / center-end;\n  font-weight: 700; }\n\n.search-form {\n  padding: 2rem 25rem;\n  background-color: #fdfdfd;\n  min-height: calc(100vh - 6.2rem); }\n  @media only screen and (max-width: 81.25em) {\n    .search-form {\n      padding: 2rem 15rem; } }\n  @media only screen and (max-width: 62.5em) {\n    .search-form {\n      padding: 2rem 5rem; } }\n  @media only screen and (max-width: 56.25em) {\n    .search-form {\n      padding: 2rem 1rem; } }\n  .search-form__group {\n    width: 75%;\n    display: flex;\n    margin-bottom: 3rem;\n    align-items: flex-start;\n    padding: 0.5rem 4rem 0.5rem 0;\n    border-bottom: 1px solid rgba(0, 0, 0, 0.2); }\n    @media only screen and (max-width: 93.75em) {\n      .search-form__group {\n        width: 100%; } }\n    @media only screen and (max-width: 46.875em) {\n      .search-form__group {\n        flex-direction: column; } }\n    .search-form__group:nth-child(10) {\n      border-bottom: none; }\n    .search-form__group--no-border {\n      border-bottom: none; }\n  .search-form__label {\n    flex: 0 0 20%;\n    display: flex;\n    align-items: flex-start;\n    font-weight: 300;\n    margin-top: 0.7rem;\n    color: #551a8b; }\n    @media only screen and (max-width: 46.875em) {\n      .search-form__label {\n        margin-bottom: 1.2rem;\n        margin-left: 1rem; } }\n  .search-form__group-input-wrapper {\n    flex: 0 0 80%; }\n    @media only screen and (max-width: 46.875em) {\n      .search-form__group-input-wrapper {\n        flex: 0 0 100%;\n        width: 100%; } }\n  .search-form__input-wrapper {\n    flex: 0 0 80%; }\n    @media only screen and (max-width: 46.875em) {\n      .search-form__input-wrapper {\n        flex: 0 0 100%;\n        width: 100%; } }\n  .search-form__tip {\n    font-size: 1rem;\n    line-height: 1.4;\n    width: 70%; }\n  .search-form__input-text {\n    width: 40rem;\n    height: 4rem;\n    margin-bottom: 1rem;\n    padding: 1rem;\n    border: solid 1px #bfbfbf;\n    border-radius: 5px; }\n    @media only screen and (max-width: 28.125em) {\n      .search-form__input-text {\n        width: 30rem; } }\n    @media only screen and (max-width: 21.875em) {\n      .search-form__input-text {\n        width: 20rem; } }\n    .search-form__input-text:focus {\n      border: solid 1px #000; }\n  .search-form__input-integer {\n    border: 1px solid #aeaeae;\n    height: 3.5rem;\n    border-radius: 3px;\n    padding-left: 0.5rem;\n    padding-right: 0.5rem;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06); }\n    .search-form__input-integer--relative {\n      position: relative; }\n    @media only screen and (max-width: 37.5em) {\n      .search-form__input-integer {\n        max-width: 30%; } }\n  .search-form__group--checkbox {\n    display: flex;\n    margin-bottom: 1rem; }\n  .search-form__group-colors-left, .search-form__group-colors-right {\n    display: flex; }\n    @media only screen and (max-width: 81.25em) {\n      .search-form__group-colors-left, .search-form__group-colors-right {\n        flex-direction: column; } }\n  @media only screen and (max-width: 81.25em) {\n    .search-form__group-colors-left {\n      margin-right: 3rem; } }\n  .search-form__group-rarity-left, .search-form__group-rarity-right {\n    display: flex; }\n    @media only screen and (max-width: 28.125em) {\n      .search-form__group-rarity-left, .search-form__group-rarity-right {\n        flex-direction: column; } }\n  @media only screen and (max-width: 81.25em) {\n    .search-form__group-rarity-left {\n      margin-right: 3rem; } }\n  .search-form__label--checkbox {\n    margin-right: 1rem; }\n  .search-form__input-checkbox {\n    width: 2.25rem;\n    height: 2.25rem;\n    margin-right: 0.8rem; }\n    @media only screen and (max-width: 93.75em) {\n      .search-form__input-checkbox {\n        margin-bottom: 0.3rem; } }\n  .search-form__checkbox-wrapper {\n    display: flex;\n    align-items: center; }\n  .search-form__select-menu {\n    margin-bottom: 1rem;\n    color: #343242;\n    margin-right: 1rem;\n    border: 1px solid #aeaeae;\n    border-radius: 3px;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06);\n    padding: 0 2.2rem 0 0.5rem;\n    height: 3.4rem;\n    font-size: 1.4rem;\n    text-indent: 0;\n    -webkit-appearance: none;\n    -moz-appearance: none;\n    text-overflow: '';\n    background-image: url(../../app/static/img/SVG/arrow-down2.svg);\n    background-repeat: no-repeat;\n    background-position: right 0.8rem center;\n    background-size: 1.2rem 1rem;\n    background-color: #fff; }\n    @media only screen and (max-width: 81.25em) {\n      .search-form__select-menu {\n        margin-right: 0.3rem; } }\n    @media only screen and (max-width: 37.5em) {\n      .search-form__select-menu--2 {\n        max-width: 49%; } }\n    @media only screen and (max-width: 37.5em) {\n      .search-form__select-menu--3 {\n        max-width: 32%; } }\n  .search-form__svg-size {\n    height: 2rem;\n    width: 2rem;\n    margin-right: 1rem; }\n  .search-form__svg-color {\n    fill: #551a8b; }\n  .search-form__submit-wrapper {\n    position: sticky;\n    bottom: 0;\n    width: 100%;\n    display: flex;\n    margin-bottom: 3rem;\n    border-top: 1px solid rgba(0, 0, 0, 0.2);\n    align-items: flex-start;\n    padding: 1.5rem 4rem 1.5rem 0;\n    background-color: #fdfdfd;\n    z-index: 1; }\n  .search-form__submit {\n    border-radius: 3px;\n    padding: 0.7rem;\n    background-color: #f9f7f5;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    color: #551a8b;\n    font-weight: 500;\n    transition: all 0.2s;\n    margin-left: 20%; }\n    .search-form__submit:hover {\n      cursor: pointer;\n      background-color: #fff; }\n  .search-form__dropdown-span {\n    display: flex;\n    flex-direction: column; }\n  .search-form__selected-types, .search-form__selected-sets {\n    display: flex;\n    flex-direction: column;\n    list-style: none;\n    margin-bottom: 0.3rem; }\n  .search-form__selected-types-list-item, .search-form__selected-sets-list-item {\n    display: flex;\n    margin-bottom: 0.7rem; }\n  .search-form__selected-types-remove-btn, .search-form__selected-sets-remove-btn {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    cursor: pointer;\n    height: 2rem;\n    width: 2rem;\n    font-size: 1.3rem;\n    background-color: #f2f2f2;\n    margin-right: 0.7rem; }\n  .search-form__selected-types-toggler {\n    height: 2rem;\n    width: 2.75rem;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    cursor: pointer;\n    font-size: 1.3rem;\n    margin-right: 0.7rem; }\n    .search-form__selected-types-toggler--is {\n      background-color: #47d147; }\n    .search-form__selected-types-toggler--not {\n      background-color: #ff0000; }\n  .search-form__dropdown {\n    position: absolute;\n    max-height: 28rem;\n    background-color: #fff;\n    z-index: 2;\n    top: 100%;\n    width: 40rem;\n    margin-top: -1rem;\n    overflow-y: auto;\n    border: 1px solid #000; }\n    .search-form__dropdown-list {\n      list-style: none; }\n      .search-form__dropdown-list-category {\n        padding: 0.5rem; }\n      .search-form__dropdown-list-option {\n        padding: 0.3rem 2rem;\n        display: flex;\n        align-items: center; }\n        .search-form__dropdown-list-option:hover {\n          cursor: pointer; }\n        .search-form__dropdown-list-option--highlighted {\n          background-color: #ccd8ff; }\n        .search-form__dropdown-list-option span {\n          text-transform: uppercase;\n          margin-left: 1rem; }\n      .search-form__dropdown-list-img {\n        width: 2rem;\n        height: 2rem;\n        margin-right: 0.7rem; }\n\n.dropdown-wrapper {\n  position: relative; }\n\n.inv-search-price-msg {\n  position: absolute;\n  bottom: 0;\n  right: 0;\n  color: red; }\n\n.relative {\n  position: relative; }\n\n.api-results-display__nav {\n  background-color: #f3f5f8;\n  border-bottom: 1px solid rgba(99, 68, 150, 0.1);\n  width: 100%;\n  display: flex;\n  justify-content: space-between;\n  padding: 1.2rem 16%;\n  margin-bottom: 0.1rem;\n  height: 5.2rem; }\n  @media only screen and (max-width: 71.875em) {\n    .api-results-display__nav {\n      padding: 1.2rem 5%; } }\n  @media only screen and (max-width: 53.125em) {\n    .api-results-display__nav {\n      display: none; } }\n  .api-results-display__nav-select {\n    color: #b300b3;\n    margin-right: 1rem;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    border-radius: 3px;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06);\n    padding: 0.1rem 2.2rem 0 0.5rem;\n    color: #551a8b;\n    height: 2.8rem;\n    font-size: 1.4rem;\n    text-indent: 0;\n    -webkit-appearance: none;\n    -moz-appearance: none;\n    text-overflow: '';\n    background-image: url(../../app/static/img/SVG/arrow-down2.svg);\n    background-repeat: no-repeat;\n    background-position: right 0.8rem center;\n    background-size: 1.2rem 1rem; }\n    .api-results-display__nav-select:hover {\n      cursor: pointer;\n      background-color: #fff; }\n  .api-results-display__nav-label {\n    color: #551a8b; }\n  .api-results-display__nav-btn {\n    border-radius: 3px;\n    background-color: #f9f7f5;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    color: #551a8b;\n    font-weight: 500;\n    transition: all 0.2s;\n    height: 2.8rem;\n    padding: 0.1rem 0.7rem 0 0.7rem;\n    font-size: 1.4rem;\n    margin: auto 0;\n    text-align: center;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06); }\n    .api-results-display__nav-btn:hover {\n      cursor: pointer;\n      background-color: #fff; }\n  .api-results-display__nav-right {\n    display: flex;\n    align-items: center; }\n  .api-results-display__nav-pagination-container {\n    display: flex;\n    align-items: center;\n    background-color: #f9f7f5;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    color: #551a8b;\n    padding: 0.2rem 0.7rem;\n    cursor: pointer;\n    height: 2.8rem;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06); }\n    .api-results-display__nav-pagination-container:not(:last-child) {\n      margin-right: 1rem; }\n    .api-results-display__nav-pagination-container:nth-child(2) svg {\n      margin-right: 1rem; }\n    .api-results-display__nav-pagination-container:nth-child(3) svg {\n      margin-left: 1rem; }\n    .api-results-display__nav-pagination-container--disabled {\n      cursor: not-allowed;\n      color: rgba(0, 0, 0, 0.25);\n      background-color: #f5f6f7; }\n    @media only screen and (max-width: 31.5em) {\n      .api-results-display__nav-pagination-container {\n        margin: 0; } }\n  .api-results-display__nav-svg-size {\n    height: 2rem;\n    width: 2rem; }\n  .api-results-display__nav-svg-color {\n    fill: #551a8b; }\n\n.api-results-display__display-bar {\n  width: 100%;\n  border-bottom: 1px solid rgba(99, 68, 150, 0.1);\n  background-color: #f6f4fa;\n  color: #535353;\n  padding-left: 16%;\n  margin-bottom: 2rem;\n  height: 2.1rem; }\n  @media only screen and (max-width: 71.875em) {\n    .api-results-display__display-bar {\n      padding-left: 5%; } }\n\n.api-results-display__mobile {\n  background-color: #f3f5f8;\n  border-bottom: 1px solid rgba(99, 68, 150, 0.1);\n  justify-content: space-between;\n  margin-bottom: 0.1rem;\n  height: 5.2rem;\n  display: none; }\n  @media only screen and (max-width: 53.125em) {\n    .api-results-display__mobile {\n      display: flex;\n      padding: 1.2rem 5%; } }\n  @media only screen and (max-width: 31.5em) {\n    .api-results-display__mobile {\n      padding: 1.2rem; } }\n  .api-results-display__mobile-svg-size {\n    width: 1.4rem;\n    height: 1.4rem; }\n\n.api-results-display__mobile-display-options {\n  background-color: #f3f5f8;\n  border-bottom: 1px solid rgba(99, 68, 150, 0.1);\n  flex-direction: column;\n  align-items: flex-start;\n  padding: 1.2rem 0;\n  display: none; }\n\n.api-results-display__mobile-display-options-group {\n  display: flex;\n  justify-content: space-between;\n  width: 45%;\n  margin: 0 auto 1rem auto; }\n  @media only screen and (max-width: 51.5625em) {\n    .api-results-display__mobile-display-options-group {\n      width: 60%; } }\n  @media only screen and (max-width: 37.5em) {\n    .api-results-display__mobile-display-options-group {\n      width: 80%; } }\n  @media only screen and (max-width: 28.125em) {\n    .api-results-display__mobile-display-options-group {\n      width: 95%; } }\n  .api-results-display__mobile-display-options-group label {\n    margin-right: 1rem; }\n\n.api-results-display__nav-select--mobile {\n  width: 24rem; }\n  @media only screen and (max-width: 21.875em) {\n    .api-results-display__nav-select--mobile {\n      width: 16rem; } }\n\n.api-results-mobile-display-btn {\n  align-self: center; }\n\n.wrapper {\n  overflow-x: scroll;\n  overflow-y: hidden;\n  position: relative;\n  display: flex; }\n\n.card-checklist {\n  width: 68%;\n  justify-self: center; }\n  @media only screen and (max-width: 71.875em) {\n    .card-checklist {\n      width: 90%; } }\n  .card-checklist__row {\n    display: grid;\n    height: 3rem; }\n    .card-checklist__row--7 {\n      grid-template-columns: 10% 22.5% 10% 17.5% 15% 15% 10%; }\n    .card-checklist__row--9 {\n      grid-template-columns: repeat(9, 1fr); }\n    .card-checklist__row--header {\n      border-bottom: 1px solid #000;\n      color: #531a8b;\n      text-transform: uppercase;\n      font-size: 1.2rem !important;\n      font-weight: 200 !important; }\n    .card-checklist__row--grey {\n      background-color: #f2f2f2; }\n    .card-checklist__row:nth-child(even) {\n      background-color: #f2f2f2; }\n    .card-checklist__row--header {\n      height: 3.5rem; }\n  .card-checklist__data {\n    width: 100%;\n    display: flex;\n    flex-wrap: nowrap;\n    justify-content: flex-start;\n    font-size: 1.4rem; }\n    .card-checklist__data--set {\n      text-transform: uppercase;\n      padding-left: 0.5rem; }\n    .card-checklist__data--name {\n      justify-content: flex-start; }\n    .card-checklist__data--rarity {\n      text-transform: capitalize; }\n  .card-checklist__data-link {\n    padding: 1rem 0;\n    display: block;\n    text-decoration: none;\n    width: 100%;\n    color: #000;\n    white-space: nowrap;\n    overflow: hidden;\n    text-overflow: ellipsis; }\n    .card-checklist__data-link--price {\n      color: #006885; }\n\n.tooltip {\n  position: absolute;\n  z-index: 5;\n  width: 24rem;\n  height: 34rem; }\n  .tooltip__img {\n    width: 100%;\n    height: 100%; }\n\n.negative-earnings {\n  color: red; }\n\n.positive-earnings {\n  color: green; }\n\n.image-grid {\n  padding: 7rem 16%;\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(25rem, 1fr));\n  grid-column-gap: 2rem;\n  grid-row-gap: 1rem; }\n  .image-grid__outer-div {\n    position: relative; }\n  .image-grid__inner-div {\n    perspective: 150rem;\n    height: 34rem;\n    width: 24rem; }\n  .image-grid__double {\n    height: 34rem;\n    width: 24rem;\n    position: absolute;\n    top: 0;\n    left: 0;\n    backface-visibility: hidden;\n    overflow: hidden;\n    transition: all 0.8s ease; }\n    .image-grid__double--back {\n      transform: rotateY(180deg); }\n  .image-grid__double-btn {\n    position: absolute;\n    top: 26%;\n    left: 75%;\n    width: 4.4rem;\n    height: 4.4rem;\n    border-radius: 50%;\n    background-color: rgba(255, 255, 255, 0.6);\n    border: 2px solid #342442;\n    transition: all 0.2s;\n    display: flex;\n    justify-content: center;\n    align-items: center; }\n    .image-grid__double-btn:hover {\n      cursor: pointer;\n      background-color: #fff; }\n  .image-grid__double-btn-svg {\n    height: 2.5rem;\n    width: 2.5rem;\n    pointer-events: none; }\n  .image-grid__dobule-btn-svg-color {\n    color: #16161d; }\n  .image-grid__container {\n    width: 24rem;\n    height: 34rem; }\n  .image-grid__image {\n    width: 100%;\n    height: 100%; }\n\n.card {\n  width: 100%;\n  padding: 0 16%;\n  display: flex;\n  margin-top: 3rem;\n  padding-bottom: 0.7rem;\n  border-bottom: 1px dashed rgba(0, 0, 0, 0.7); }\n  .card__img-container {\n    z-index: 2;\n    border-radius: 100%; }\n  .card__img {\n    width: 33rem;\n    height: 46rem;\n    box-shadow: 1px 1px 8px rgba(0, 0, 0, 0.5);\n    border-radius: 4.75% / 3.5%; }\n  .card__img-left {\n    width: 33rem;\n    display: flex;\n    flex-direction: column;\n    z-index: 2; }\n  .card__img-btn {\n    align-self: center;\n    margin-top: 1rem;\n    height: 2.8rem;\n    font-size: 1.4rem;\n    line-height: 1.8;\n    color: #551a8b;\n    background-color: #f9f7f5;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    border-radius: 3px;\n    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06);\n    transition: all 0.2s;\n    padding: 0.2rem 0.5rem;\n    text-align: center;\n    display: flex;\n    align-items: center; }\n    .card__img-btn:hover {\n      cursor: pointer;\n      background-color: #fff;\n      border-color: #634496; }\n  .card__img-svg {\n    height: 1.4rem;\n    width: 1.4rem;\n    margin-right: 0.3rem;\n    pointer-events: none; }\n  .card__img-svg-color {\n    fill: #551a8b; }\n  .card__img-double-area {\n    position: relative; }\n  .card__img-double-sided {\n    perspective: 150rem;\n    height: 46rem; }\n  .card__img-double {\n    width: 33rem;\n    height: 46rem;\n    position: absolute;\n    top: 0;\n    left: 0;\n    backface-visibility: hidden;\n    overflow: hidden; }\n    .card__img-double--back {\n      transform: rotateY(180deg); }\n  .card__text {\n    background-color: #fff;\n    border-radius: 4px;\n    border: 1px solid rgba(0, 0, 0, 0.25);\n    border-top: 3px solid #000;\n    border-bottom: 3px solid #000;\n    margin-top: 2rem;\n    width: 34rem;\n    display: flex;\n    flex-direction: column;\n    padding: 3rem;\n    margin-right: 3rem;\n    margin-left: -2rem; }\n    .card__text-flex {\n      margin-bottom: 1rem;\n      border-bottom: 1px solid #bfbfbf; }\n    .card__text-title {\n      display: flex;\n      align-items: center; }\n      .card__text-title-h3 {\n        font-size: 1.8rem;\n        font-weight: 400;\n        margin-right: 1rem; }\n    .card__text-color-indicator {\n      width: 1.3rem;\n      height: 1.3rem;\n      border: 1px solid #333;\n      border-radius: 50%;\n      box-shadow: 0px 0px 0px 2px rgba(0, 0, 0, 0.2);\n      margin-right: 0.7rem;\n      display: inline-block; }\n      .card__text-color-indicator--U {\n        background-color: rgba(128, 128, 255, 0.7); }\n      .card__text-color-indicator--B {\n        background-color: rgba(0, 0, 0, 0.7); }\n      .card__text-color-indicator--R {\n        background-color: rgba(255, 77, 77, 0.7); }\n      .card__text-color-indicator--W {\n        background-color: rgba(255, 255, 255, 0.7); }\n      .card__text-color-indicator--G {\n        background-color: rgba(0, 255, 0, 0.7); }\n    .card__text-oracle-p {\n      margin-bottom: 1rem;\n      font-size: 1.3rem; }\n    .card__text-oracle-flavor {\n      font-size: 1.3rem;\n      font-style: italic; }\n    .card__text-illustrator {\n      font-size: 1.2rem;\n      font-style: italic; }\n    .card__text-legal {\n      display: flex;\n      flex-direction: row;\n      justify-content: space-between; }\n      .card__text-legal-half {\n        display: flex;\n        flex-direction: column; }\n      .card__text-legal-span-container {\n        display: flex;\n        align-items: center;\n        font-size: 1.4rem; }\n        .card__text-legal-span-container:not(:last-child) {\n          margin-bottom: 0.5rem; }\n      .card__text-legal-span-box {\n        width: 6rem;\n        height: 2.5rem;\n        margin-right: 0.3rem;\n        font-size: 1rem;\n        text-transform: uppercase;\n        display: flex;\n        justify-content: center;\n        align-items: center;\n        border-radius: 3px; }\n        .card__text-legal-span-box--not_legal {\n          background-color: #e60000; }\n        .card__text-legal-span-box--legal {\n          background-color: #009900; }\n      .card__text-legal-span-box {\n        color: #fff; }\n  .card__set {\n    display: flex;\n    flex-direction: column; }\n    .card__set-banner {\n      display: flex;\n      border: 1px solid #bfbfbf;\n      width: 40rem;\n      background-color: #49465c;\n      color: #fdfdfd;\n      padding: 0.7rem;\n      border-radius: 3px; }\n      .card__set-banner-svg-container {\n        margin-right: 1rem; }\n      .card__set-banner-svg {\n        width: 2.4rem;\n        height: 2.4rem;\n        filter: invert(100%); }\n    .card__set-details {\n      display: flex;\n      flex-direction: column; }\n    .card__set-header-name {\n      font-size: 1.7remrem; }\n    .card__set-header-code {\n      text-transform: uppercase; }\n    .card__set-prints-header {\n      display: flex;\n      justify-content: space-between;\n      background-color: #49465c;\n      color: #fdfdfd;\n      font-size: 1.3rem;\n      text-transform: uppercase;\n      border: 1px solid #bfbfbf;\n      border-radius: 3px;\n      padding: 0.3rem 0.7rem; }\n    .card__set-prints-svg-container {\n      height: 1.8rem;\n      width: 1.8rem;\n      border: 1px solid #bfbfbf;\n      display: flex;\n      justify-content: center;\n      align-items: center;\n      border-radius: 100%; }\n    .card__set-prints-svg--common {\n      fill: #000; }\n    .card__set-prints-svg--uncommon {\n      fill: #e6e6e6; }\n    .card__set-prints-svg--rare {\n      fill: #e6c300; }\n    .card__set-prints-svg--mythic {\n      fill: #ff0000; }\n    .card__set-prints-list {\n      list-style: none;\n      border-radius: 3px; }\n      .card__set-prints-list-link:link, .card__set-prints-list-link:visited {\n        text-decoration: none;\n        color: #000; }\n      .card__set-prints-list-item {\n        display: flex;\n        justify-content: space-between;\n        cursor: pointer;\n        border-bottom: 1px solid #e7e9ec;\n        border-left: 1px solid #cdcdcd;\n        background-color: #fff;\n        padding: 0.25rem 0; }\n        .card__set-prints-list-item--pl-14 {\n          padding-left: 1.4rem;\n          border-bottom: 3px solid #000; }\n        .card__set-prints-list-item:hover {\n          background-color: #f2f2f2; }\n      .card__set-prints-list-item-name-wrapper {\n        display: flex;\n        align-items: center;\n        margin-left: -1rem; }\n      .card__set-prints-list-item-set-name {\n        margin-left: 0.5rem; }\n      .card__set-prints-list-item-price {\n        margin-right: 0.7rem;\n        color: #006885; }\n\n.card-page {\n  display: flex;\n  flex-direction: column;\n  grid-column: 1 / -1;\n  position: relative; }\n\n.add-to-inv,\n.remove-from-inv {\n  margin-top: 3rem;\n  width: 50%;\n  margin-left: 50%;\n  transform: translateX(-50%);\n  display: flex;\n  flex-direction: column; }\n  .add-to-inv__header,\n  .remove-from-inv__header {\n    color: #16161d;\n    font-size: 2.2rem;\n    font-weight: 300;\n    margin: 0 auto 1rem auto; }\n  .add-to-inv__form,\n  .remove-from-inv__form {\n    display: flex;\n    flex-direction: column; }\n    .add-to-inv__form-price,\n    .remove-from-inv__form-price {\n      width: 20rem;\n      height: 3.5rem;\n      margin-bottom: 1rem;\n      padding: 1rem;\n      border: solid 1px #bfbfbf;\n      border-radius: 5px; }\n      .add-to-inv__form-price:focus,\n      .remove-from-inv__form-price:focus {\n        border: solid 1px #000; }\n    .add-to-inv__form-group,\n    .remove-from-inv__form-group {\n      display: flex;\n      justify-content: space-evenly;\n      align-content: center;\n      margin-bottom: 1.5rem;\n      position: relative; }\n    .add-to-inv__form-label,\n    .remove-from-inv__form-label {\n      margin-right: 0.3rem;\n      display: flex;\n      align-content: center;\n      justify-content: center;\n      color: #16161d;\n      margin-top: 0.45rem; }\n  .add-to-inv-price-msg,\n  .remove-from-inv-price-msg {\n    position: absolute;\n    bottom: -1.8rem;\n    right: 25%;\n    color: red; }\n  .add-to-inv__submit,\n  .remove-from-inv__submit {\n    align-self: center;\n    height: 3.1rem;\n    font-size: 1.4rem;\n    line-height: 1.8;\n    color: #551a8b;\n    background-color: #f9f7f5;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    border-radius: 3px;\n    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06);\n    transition: all 0.2s;\n    padding: 0.2rem 0.75rem;\n    text-align: center;\n    display: flex;\n    align-items: center;\n    margin-bottom: 1rem; }\n    .add-to-inv__submit:hover,\n    .remove-from-inv__submit:hover {\n      cursor: pointer;\n      background-color: #fff;\n      border-color: #634496; }\n\n.util-space::before,\n.util-space::after {\n  content: '';\n  margin: 0 0.2rem; }\n\n.no-results {\n  justify-self: center; }\n\n.homepage {\n  background: linear-gradient(to bottom, #1d1c25, #431e3f);\n  background-repeat: no-repeat;\n  height: 100vh;\n  display: flex;\n  overflow-x: hidden !important;\n  justify-content: center;\n  position: relative;\n  background-size: cover; }\n  .homepage__center {\n    align-self: center;\n    display: flex;\n    flex-direction: column; }\n    @media only screen and (max-width: 28.125em) {\n      .homepage__center {\n        margin-top: -12rem; } }\n  @media only screen and (max-width: 40.625em) {\n    .homepage__center-heading-wrapper {\n      margin: 0 auto 0.5rem auto;\n      width: 75%;\n      display: flex;\n      justify-content: center;\n      text-align: center; } }\n  .homepage__search {\n    position: relative; }\n  .homepage__search-input {\n    padding: 1.2rem 1.4rem 1.2rem 6.2rem;\n    font-size: 3rem;\n    background-color: #242031;\n    color: #d7d7d7;\n    border-radius: 4px;\n    box-shadow: 0px 0px 0px 2px rgba(0, 0, 0, 0.5);\n    width: 100%;\n    border: 1px solid rgba(255, 255, 255, 0.5); }\n    .homepage__search-input::placeholder {\n      text-align: center; }\n    @media only screen and (max-width: 40.625em) {\n      .homepage__search-input {\n        width: 80%;\n        margin-left: 10%; } }\n  .homepage__search-btn {\n    position: absolute;\n    left: 6rem;\n    top: 2rem; }\n    @media only screen and (max-width: 40.625em) {\n      .homepage__search-btn {\n        left: 12rem; } }\n    @media only screen and (max-width: 28.125em) {\n      .homepage__search-btn {\n        left: 10rem; } }\n  .homepage__icon-sizing--search {\n    width: 3rem;\n    height: 3rem;\n    transform: translateX(-150%); }\n  .homepage__icon-path {\n    fill: #bfbfbf; }\n  .homepage__links {\n    display: flex;\n    justify-content: center; }\n    @media only screen and (max-width: 40.625em) {\n      .homepage__links {\n        flex-direction: column; } }\n    @media only screen and (max-width: 28.125em) {\n      .homepage__links {\n        margin-left: 7.5%; } }\n  .homepage__link {\n    text-decoration: none;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    border-color: rgba(255, 255, 255, 0.6);\n    border-radius: 3px;\n    color: #fff;\n    margin-top: 0.6rem;\n    margin-right: 3rem;\n    cursor: pointer;\n    line-height: 1.4;\n    padding: 0.2rem 1rem 0 1rem;\n    height: 2.8rem;\n    transition: all 0.2s;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06);\n    min-width: 9rem;\n    text-align: center; }\n    @media only screen and (max-width: 40.625em) {\n      .homepage__link {\n        align-self: center;\n        width: 14.5rem; } }\n    .homepage__link:hover {\n      background-color: rgba(255, 255, 255, 0.09); }\n\n.inventory-details {\n  grid-column: 1 / -1;\n  border-bottom: 1px solid rgba(99, 68, 150, 0.1);\n  background-color: #f6f4fa;\n  color: #535353;\n  padding: 1rem 16%;\n  margin-bottom: 2rem;\n  position: relative;\n  display: flex;\n  justify-content: space-between; }\n  .inventory-details__link {\n    text-decoration: none;\n    color: rgba(83, 83, 83, 0.75);\n    transition: all 0.2s;\n    padding: 0 0.6rem;\n    border-left: 1px solid #535353;\n    border-right: 1px solid #535353; }\n    .inventory-details__link:hover {\n      color: #535353; }\n  .inventory-details span {\n    color: #006885; }\n\n.homepage__colage,\n.cardpage__colage {\n  position: absolute;\n  overflow: hidden;\n  left: 0;\n  height: 15rem;\n  width: 100%; }\n\n.homepage__colage {\n  bottom: 0; }\n\n.cardpage__colage {\n  bottom: -2.6rem; }\n\n.homepage__colage-inner,\n.cardpage__colage-inner {\n  position: relative;\n  height: 100%;\n  margin-left: 50%;\n  transform: translateX(-50%);\n  width: 65.5rem; }\n\n.homepage__colage-card,\n.cardpage__colage-card {\n  width: 16.8rem;\n  height: 23.4rem;\n  position: absolute;\n  border-radius: 5% / 3.75%;\n  transform: translateY(0);\n  transition: all 0.3s;\n  box-shadow: inset 0 0 3px 3px #000; }\n  .homepage__colage-card:nth-child(1),\n  .cardpage__colage-card:nth-child(1) {\n    top: 2.2rem; }\n  .homepage__colage-card:nth-child(2),\n  .cardpage__colage-card:nth-child(2) {\n    top: 6.2rem;\n    left: 3.5rem; }\n  .homepage__colage-card:nth-child(3),\n  .cardpage__colage-card:nth-child(3) {\n    top: 1rem;\n    left: 17.4rem; }\n  .homepage__colage-card:nth-child(4),\n  .cardpage__colage-card:nth-child(4) {\n    top: 4.5rem;\n    left: 20.6rem; }\n  .homepage__colage-card:nth-child(5),\n  .cardpage__colage-card:nth-child(5) {\n    top: 1.6rem;\n    left: 34.7rem; }\n  .homepage__colage-card:nth-child(6),\n  .cardpage__colage-card:nth-child(6) {\n    top: 6.5rem;\n    left: 38rem; }\n  .homepage__colage-card:nth-child(7),\n  .cardpage__colage-card:nth-child(7) {\n    top: 3.5rem;\n    right: 0; }\n  .homepage__colage-card:hover,\n  .cardpage__colage-card:hover {\n    transform: translateY(-5%); }\n\n.container {\n  display: grid;\n  grid-template-columns: [full-start] minmax(6rem, 1fr) [center-start] repeat(8, [col-start] minmax(min-content, 14rem) [col-end]) [center-end] minmax(6rem, 1fr) [full-end];\n  background-color: #f5f6f7;\n  background-size: cover;\n  position: relative; }\n\n.search {\n  grid-column: full-start / full-end;\n  background-color: #fff; }\n\n.api-results-display {\n  grid-column: full-start / full-end;\n  background-color: #f5f6f7;\n  background-size: cover;\n  display: grid; }\n"],"sourceRoot":""}]);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9pbmRleC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvYWRhcHRlcnMveGhyLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9heGlvcy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbFRva2VuLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvaXNDYW5jZWwuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvQXhpb3MuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvSW50ZXJjZXB0b3JNYW5hZ2VyLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2J1aWxkRnVsbFBhdGguanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvY3JlYXRlRXJyb3IuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvZGlzcGF0Y2hSZXF1ZXN0LmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2VuaGFuY2VFcnJvci5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9tZXJnZUNvbmZpZy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9zZXR0bGUuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvdHJhbnNmb3JtRGF0YS5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvZGVmYXVsdHMuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYmluZC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9idWlsZFVSTC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9jb21iaW5lVVJMcy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9jb29raWVzLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzQWJzb2x1dGVVUkwuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNBeGlvc0Vycm9yLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzVVJMU2FtZU9yaWdpbi5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3BhcnNlSGVhZGVycy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9zcHJlYWQuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL3V0aWxzLmpzIiwid2VicGFjazovL21hZ2ljLy4vc3JjL2Nzcy9zdHlsZS5jc3MiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9zcmMvY3NzL3ZlbmRvci9tYW5hLmNzcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvY3NzV2l0aE1hcHBpbmdUb1N0cmluZy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9nZXRVcmwuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9hcHAvc3RhdGljL2ltZy9TVkcvYXJyb3ctZG93bjIuc3ZnIiwid2VicGFjazovL21hZ2ljLy4vc3JjL2ltZy9tYW5hLXN5bWJvbHMvbWFuYS5zdmciLCJ3ZWJwYWNrOi8vbWFnaWMvLi9zcmMvY3NzL3N0eWxlLmNzcz85ZmNkIiwid2VicGFjazovL21hZ2ljLy4vc3JjL2Nzcy92ZW5kb3IvbWFuYS5jc3M/MDcwMiIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL3NyYy9qcy9pbmRleC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL3NyYy9qcy9tb2RlbHMvU2VhcmNoLmpzIiwid2VicGFjazovL21hZ2ljLy4vc3JjL2pzL3ZpZXdzL2Jhc2UuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9zcmMvanMvdmlld3MvY2FyZFZpZXcuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9zcmMvanMvdmlld3MvaW52ZW50b3J5U2VhcmNoVmlldy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL3NyYy9qcy92aWV3cy9pbnZlbnRvcnlWaWV3LmpzIiwid2VicGFjazovL21hZ2ljLy4vc3JjL2pzL3ZpZXdzL3Jlc3VsdHNWaWV3LmpzIiwid2VicGFjazovL21hZ2ljLy4vc3JjL2pzL3ZpZXdzL3NlYXJjaFZpZXcuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vbWFnaWMvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vbWFnaWMvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL21hZ2ljL3dlYnBhY2svcnVudGltZS9nbG9iYWwiLCJ3ZWJwYWNrOi8vbWFnaWMvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9tYWdpYy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL21hZ2ljL3dlYnBhY2svcnVudGltZS9wdWJsaWNQYXRoIiwid2VicGFjazovL21hZ2ljL3dlYnBhY2svc3RhcnR1cCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSw0RkFBdUMsQzs7Ozs7Ozs7Ozs7QUNBMUI7O0FBRWIsWUFBWSxtQkFBTyxDQUFDLHFEQUFZO0FBQ2hDLGFBQWEsbUJBQU8sQ0FBQyxpRUFBa0I7QUFDdkMsY0FBYyxtQkFBTyxDQUFDLHlFQUFzQjtBQUM1QyxlQUFlLG1CQUFPLENBQUMsMkVBQXVCO0FBQzlDLG9CQUFvQixtQkFBTyxDQUFDLDZFQUF1QjtBQUNuRCxtQkFBbUIsbUJBQU8sQ0FBQyxtRkFBMkI7QUFDdEQsc0JBQXNCLG1CQUFPLENBQUMseUZBQThCO0FBQzVELGtCQUFrQixtQkFBTyxDQUFDLHlFQUFxQjs7QUFFL0M7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw0Q0FBNEM7QUFDNUM7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7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TUFBTSxVQUFVLFlBQVksYUFBYSxhQUFhLGtCQUFrQixNQUFNLEtBQUssb0JBQW9CLE1BQU0saUJBQWlCLE1BQU0sZUFBZSxLQUFLLEtBQUssb0JBQW9CLE1BQU0saUJBQWlCLE1BQU0sWUFBWSxhQUFhLGtCQUFrQixNQUFNLFlBQVksV0FBVyxpQkFBaUIsTUFBTSxlQUFlLE1BQU0sVUFBVSxZQUFZLGFBQWEsa0JBQWtCLE1BQU0sVUFBVSxZQUFZLGFBQWEsYUFBYSxnQkFBZ0IsS0FBSyxpQkFBaUIsTUFBTSxlQUFlLE1BQU0sVUFBVSxZQUFZLFdBQVcsZUFBZSxLQUFLLGVBQWUsTUFBTSxVQUFVLGVBQWUsTUFBTSxVQUFVLFVBQVUsaUJBQWlCLE1BQU0saUJBQWlCLE1BQU0sZUFBZSxNQUFNLGVBQWUsS0FBSyxLQUFLLFVBQVUsVUFBVSxZQUFZLHVCQUF1QixNQUFNLFlBQVksV0FBVyxVQUFVLFlBQVksZ0JBQWdCLE1BQU0sVUFBVSxZQUFZLGFBQWEsYUFBYSxhQUFhLGFBQWEsV0FBVyxZQUFZLFdBQVcsVUFBVSxZQUFZLGFBQWEsV0FBVyxZQUFZLGFBQWEsYUFBYSxrQkFBa0IsTUFBTSxpQkFBaUIsTUFBTSxVQUFVLFlBQVksYUFBYSxXQUFXLGVBQWUsS0FBSyxpQkFBaUIsTUFBTSxVQUFVLFVBQVUsWUFBWSxrQkFBa0IsTUFBTSxVQUFVLFlBQVksZ0JBQWdCLEtBQUssaUJBQWlCLE1BQU0sa0JBQWtCLE1BQU0sWUFBWSxhQUFhLGFBQWEsYUFBYSxXQUFXLFVBQVUsWUFBWSxtQkFBbUIsTUFBTSxZQUFZLGFBQWEsa0JBQWtCLE1BQU0sS0FBSyxzQkFBc0IsTUFBTSxLQUFLLHNCQUFzQixNQUFNLEtBQUssc0JBQXNCLE1BQU0sVUFBVSxVQUFVLFlBQVksYUFBYSxhQUFhLGtCQUFrQixNQUFNLEtBQUssb0JBQW9CLE1BQU0sS0FBSyxzQkFBc0IsTUFBTSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxVQUFVLFVBQVUsWUFBWSxhQUFhLGFBQWEsZ0JBQWdCLE1BQU0sS0FBSyxZQUFZLHVCQUF1QixNQUFNLGVBQWUsS0FBSyxLQUFLLFVBQVUsb0JBQW9CLE1BQU0sZUFBZSxLQUFLLEtBQUssVUFBVSxvQkFBb0IsTUFBTSxVQUFVLFlBQVksZ0JBQWdCLEtBQUssVUFBVSxVQUFVLFlBQVksV0FBVyxZQUFZLGtCQUFrQixNQUFNLEtBQUssb0JBQW9CLE1BQU0sS0FBSyxvQkFBb0IsTUFBTSxpQkFBaUIsTUFBTSxZQUFZLFdBQVcsWUFBWSxhQUFhLGFBQWEsa0JBQWtCLE1BQU0saUJBQWlCLE1BQU0sS0FBSyxvQkFBb0IsTUFBTSxVQUFVLGlCQUFpQixNQUFNLGVBQWUsS0FBSyxLQUFLLHNCQUFzQixNQUFNLEtBQUssc0JBQXNCLE1BQU0sZUFBZSxLQUFLLEtBQUssc0JBQXNCLE1BQU0sS0FBSyxzQkFBc0IsTUFBTSxpQkFBaUIsTUFBTSxVQUFVLFVBQVUsaUJBQWlCLE1BQU0sS0FBSyxzQkFBc0IsTUFBTSxVQUFVLGlCQUFpQixNQUFNLFlBQVksV0FBVyxZQUFZLGFBQWEsYUFBYSxhQUFhLGFBQWEsV0FBVyxZQUFZLFdBQVcsWUFBWSxhQUFhLGFBQWEsYUFBYSxhQUFhLGFBQWEsYUFBYSxrQkFBa0IsTUFBTSxLQUFLLHNCQUFzQixNQUFNLEtBQUssb0JBQW9CLE1BQU0sS0FBSyxvQkFBb0IsTUFBTSxVQUFVLFVBQVUsaUJBQWlCLE1BQU0sZUFBZSxNQUFNLFlBQVksV0FBVyxVQUFVLFVBQVUsWUFBWSxhQUFhLGFBQWEsYUFBYSxhQUFhLGdCQUFnQixLQUFLLFlBQVksV0FBVyxZQUFZLGFBQWEsV0FBVyxZQUFZLGFBQWEsa0JBQWtCLE1BQU0sVUFBVSxpQkFBaUIsTUFBTSxVQUFVLGlCQUFpQixNQUFNLFVBQVUsWUFBWSxhQUFhLGtCQUFrQixNQUFNLFVBQVUsaUJBQWlCLE1BQU0sVUFBVSxZQUFZLGFBQWEsV0FBVyxVQUFVLFVBQVUsWUFBWSxhQUFhLGtCQUFrQixNQUFNLFVBQVUsVUFBVSxVQUFVLFlBQVksYUFBYSxXQUFXLFlBQVksa0JBQWtCLE1BQU0saUJBQWlCLE1BQU0saUJBQWlCLE1BQU0sWUFBWSxhQUFhLGFBQWEsV0FBVyxVQUFVLFVBQVUsWUFBWSxhQUFhLGtCQUFrQixNQUFNLGlCQUFpQixNQUFNLGVBQWUsTUFBTSxZQUFZLFdBQVcsaUJBQWlCLE1BQU0sZUFBZSxNQUFNLGlCQUFpQixNQUFNLFlBQVksa0JBQWtCLE1BQU0sVUFBVSxVQUFVLGtCQUFrQixNQUFNLGtCQUFrQixNQUFNLFlBQVksV0FBVyxVQUFVLGdCQUFnQixLQUFLLGtCQUFrQixNQUFNLFlBQVksYUFBYSxXQUFXLFVBQVUsWUFBWSxhQUFhLGFBQWEsZ0JBQWdCLE1BQU0sS0FBSyxzQkFBc0IsTUFBTSxLQUFLLG9CQUFvQixNQUFNLFVBQVUsWUFBWSxhQUFhLGFBQWEsYUFBYSxhQUFhLFdBQVcsVUFBVSxZQUFZLFdBQVcsWUFBWSxhQUFhLGFBQWEsYUFBYSxhQUFhLGFBQWEsa0JBQWtCLE1BQU0sVUFBVSxpQkFBaUIsTUFBTSxlQUFlLE1BQU0sWUFBWSxhQUFhLGFBQWEsV0FBVyxZQUFZLGFBQWEsV0FBVyxZQUFZLGFBQWEsV0FBVyxZQUFZLGtCQUFrQixNQUFNLFVBQVUsaUJBQWlCLE1BQU0sVUFBVSxpQkFBaUIsTUFBTSxVQUFVLFlBQVksYUFBYSxhQUFhLFdBQVcsWUFBWSxXQUFXLFVBQVUsaUJBQWlCLE1BQU0saUJBQWlCLE1BQU0saUJBQWlCLE1BQU0saUJBQWlCLE1BQU0sWUFBWSxhQUFhLGtCQUFrQixNQUFNLEtBQUssb0JBQW9CLE1BQU0sVUFBVSxlQUFlLEtBQUssZ0JBQWdCLE1BQU0sVUFBVSxZQUFZLGFBQWEsV0FBVyxZQUFZLGFBQWEsZ0JBQWdCLE1BQU0sS0FBSyx1QkFBdUIsTUFBTSxZQUFZLGFBQWEsYUFBYSxhQUFhLFdBQVcsZUFBZSxLQUFLLEtBQUssVUFBVSxzQkFBc0IsTUFBTSxLQUFLLG9CQUFvQixNQUFNLFVBQVUsZ0JBQWdCLE1BQU0sWUFBWSxhQUFhLGFBQWEsYUFBYSxhQUFhLGlCQUFpQixNQUFNLFVBQVUsWUFBWSxXQUFXLGlCQUFpQixNQUFNLEtBQUssb0JBQW9CLE1BQU0sS0FBSyxvQkFBb0IsTUFBTSxLQUFLLG9CQUFvQixNQUFNLGtCQUFrQixNQUFNLGVBQWUsS0FBSyxLQUFLLHFCQUFxQixNQUFNLGtCQUFrQixNQUFNLFlBQVksYUFBYSxhQUFhLGlCQUFpQixNQUFNLFVBQVUsaUJBQWlCLE1BQU0sS0FBSyxvQkFBb0IsTUFBTSxVQUFVLGVBQWUsS0FBSyxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxZQUFZLFdBQVcsWUFBWSxhQUFhLGtCQUFrQixNQUFNLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLGVBQWUsTUFBTSxVQUFVLFVBQVUsWUFBWSxhQUFhLGtCQUFrQixNQUFNLFlBQVksa0JBQWtCLE1BQU0saUJBQWlCLE1BQU0saUJBQWlCLE1BQU0sVUFBVSxVQUFVLFlBQVksV0FBVyxVQUFVLFlBQVksYUFBYSxrQkFBa0IsTUFBTSxnQkFBZ0IsTUFBTSxZQUFZLFdBQVcsVUFBVSxlQUFlLEtBQUssVUFBVSxnQkFBZ0IsTUFBTSxnQkFBZ0IsS0FBSyxnQkFBZ0IsTUFBTSxZQUFZLFdBQVcsWUFBWSxhQUFhLGtCQUFrQixNQUFNLGlCQUFpQixNQUFNLFlBQVksV0FBVyxlQUFlLE1BQU0sVUFBVSxVQUFVLFlBQVksV0FBVyxVQUFVLFlBQVksYUFBYSxrQkFBa0IsTUFBTSxpQkFBaUIsTUFBTSxZQUFZLFdBQVcsVUFBVSxVQUFVLFVBQVUsWUFBWSxhQUFhLGFBQWEsYUFBYSxXQUFXLFlBQVksa0JBQWtCLE1BQU0sVUFBVSxpQkFBaUIsTUFBTSxVQUFVLFVBQVUsaUJBQWlCLE1BQU0sZUFBZSxNQUFNLFVBQVUsZUFBZSxNQUFNLFVBQVUsZ0JBQWdCLE1BQU0sVUFBVSxVQUFVLFVBQVUsWUFBWSxhQUFhLGtCQUFrQixNQUFNLFVBQVUsaUJBQWlCLE1BQU0sVUFBVSxVQUFVLFlBQVksa0JBQWtCLE1BQU0sVUFBVSxVQUFVLFlBQVksZ0JBQWdCLEtBQUssWUFBWSxhQUFhLFdBQVcsWUFBWSxhQUFhLFdBQVcsWUFBWSxhQUFhLGFBQWEsYUFBYSxhQUFhLGFBQWEsYUFBYSxXQUFXLGlCQUFpQixNQUFNLFVBQVUsWUFBWSxrQkFBa0IsTUFBTSxVQUFVLFVBQVUsWUFBWSxrQkFBa0IsTUFBTSxlQUFlLE1BQU0saUJBQWlCLE1BQU0sWUFBWSxnQkFBZ0IsTUFBTSxVQUFVLFVBQVUsWUFBWSxXQUFXLFVBQVUsWUFBWSxrQkFBa0IsTUFBTSxpQkFBaUIsTUFBTSxZQUFZLGFBQWEsYUFBYSxhQUFhLGFBQWEsYUFBYSxXQUFXLFVBQVUsWUFBWSxXQUFXLFlBQVksa0JBQWtCLE1BQU0sWUFBWSxrQkFBa0IsTUFBTSxVQUFVLGlCQUFpQixNQUFNLFlBQVksYUFBYSxrQkFBa0IsTUFBTSxVQUFVLFVBQVUsWUFBWSxhQUFhLGFBQWEsYUFBYSxrQkFBa0IsTUFBTSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxZQUFZLGtCQUFrQixNQUFNLFlBQVksa0JBQWtCLE1BQU0sWUFBWSxrQkFBa0IsTUFBTSxVQUFVLFlBQVksa0JBQWtCLE1BQU0sVUFBVSxpQkFBaUIsTUFBTSxVQUFVLFlBQVksa0JBQWtCLE1BQU0saUJBQWlCLE1BQU0sVUFBVSxVQUFVLFlBQVksV0FBVyxZQUFZLFdBQVcsWUFBWSxhQUFhLGtCQUFrQixNQUFNLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLGVBQWUsTUFBTSxVQUFVLGlCQUFpQixNQUFNLFVBQVUsWUFBWSxXQUFXLFlBQVksV0FBVyxVQUFVLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLFVBQVUsVUFBVSxpQkFBaUIsTUFBTSxVQUFVLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLFVBQVUsWUFBWSxhQUFhLFdBQVcsWUFBWSxhQUFhLGFBQWEsYUFBYSxrQkFBa0IsTUFBTSxVQUFVLFVBQVUsWUFBWSxXQUFXLFlBQVksYUFBYSxrQkFBa0IsTUFBTSxlQUFlLEtBQUssZUFBZSxNQUFNLGVBQWUsTUFBTSxlQUFlLE1BQU0sWUFBWSxrQkFBa0IsTUFBTSxZQUFZLGdCQUFnQixLQUFLLFVBQVUsWUFBWSxXQUFXLFlBQVksYUFBYSxhQUFhLGtCQUFrQixNQUFNLFlBQVksa0JBQWtCLE1BQU0saUJBQWlCLE1BQU0sVUFBVSxZQUFZLGtCQUFrQixNQUFNLGlCQUFpQixNQUFNLFlBQVksaUJBQWlCLE1BQU0sVUFBVSxZQUFZLGFBQWEsbUJBQW1CLE9BQU8sWUFBWSxXQUFXLFlBQVksYUFBYSxXQUFXLGlCQUFpQixPQUFPLFVBQVUsWUFBWSxhQUFhLGtCQUFrQixPQUFPLFVBQVUsaUJBQWlCLE9BQU8sVUFBVSxVQUFVLFlBQVksV0FBVyxZQUFZLGtCQUFrQixPQUFPLGlCQUFpQixPQUFPLFVBQVUsWUFBWSxhQUFhLGFBQWEsa0JBQWtCLE9BQU8sWUFBWSxXQUFXLFlBQVksYUFBYSxXQUFXLGlCQUFpQixPQUFPLFlBQVksV0FBVyxVQUFVLGVBQWUsTUFBTSxZQUFZLFdBQVcsWUFBWSxhQUFhLFdBQVcsWUFBWSxhQUFhLGFBQWEsYUFBYSxhQUFhLGFBQWEsYUFBYSxXQUFXLFlBQVksa0JBQWtCLE9BQU8sVUFBVSxZQUFZLG1CQUFtQixPQUFPLFVBQVUsa0JBQWtCLE1BQU0sa0JBQWtCLE1BQU0sWUFBWSxhQUFhLFdBQVcsVUFBVSxZQUFZLGFBQWEsYUFBYSxrQkFBa0IsTUFBTSxZQUFZLFdBQVcsaUJBQWlCLE1BQU0sS0FBSyxzQkFBc0IsTUFBTSxLQUFLLFlBQVksV0FBVyxVQUFVLFlBQVksdUJBQXVCLE1BQU0saUJBQWlCLE1BQU0sWUFBWSxXQUFXLFlBQVksV0FBVyxZQUFZLGFBQWEsV0FBVyxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxLQUFLLFVBQVUsc0JBQXNCLE1BQU0sWUFBWSxXQUFXLGVBQWUsS0FBSyxLQUFLLG9CQUFvQixNQUFNLEtBQUssb0JBQW9CLE1BQU0sVUFBVSxVQUFVLGlCQUFpQixNQUFNLGVBQWUsTUFBTSxVQUFVLGlCQUFpQixNQUFNLEtBQUssc0JBQXNCLE1BQU0sS0FBSyxzQkFBc0IsTUFBTSxZQUFZLGFBQWEsYUFBYSxhQUFhLFdBQVcsWUFBWSxhQUFhLFdBQVcsWUFBWSxhQUFhLFdBQVcsWUFBWSxhQUFh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Q0E7QUFDQTs7QUFFTztBQUNQO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFTztBQUNQOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTs7QUFFTztBQUNQOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFTztBQUNQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFTztBQUNQO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLDBDQUEwQyxrRUFBK0I7QUFDekU7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLDBDQUEwQyxrRUFBK0I7QUFDekU7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVPO0FBQ1A7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7O0FBRU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRSw0RUFBeUM7QUFDM0M7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsK0RBQStELFNBQVM7O0FBRXhFOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVPO0FBQ1A7QUFDQTtBQUNBLEdBQUc7QUFD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QTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O1VDOXJCQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0NyQkE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLGdDQUFnQyxZQUFZO1dBQzVDO1dBQ0EsRTs7Ozs7V0NQQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHdDQUF3Qyx5Q0FBeUM7V0FDakY7V0FDQTtXQUNBLEU7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQSxFQUFFO1dBQ0Y7V0FDQTtXQUNBLENBQUMsSTs7Ozs7V0NQRCxzRjs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSxzREFBc0Qsa0JBQWtCO1dBQ3hFO1dBQ0EsK0NBQStDLGNBQWM7V0FDN0QsRTs7Ozs7V0NOQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxrQzs7OztVQ2ZBO1VBQ0E7VUFDQTtVQUNBIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvYXhpb3MnKTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBzZXR0bGUgPSByZXF1aXJlKCcuLy4uL2NvcmUvc2V0dGxlJyk7XG52YXIgY29va2llcyA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9jb29raWVzJyk7XG52YXIgYnVpbGRVUkwgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvYnVpbGRVUkwnKTtcbnZhciBidWlsZEZ1bGxQYXRoID0gcmVxdWlyZSgnLi4vY29yZS9idWlsZEZ1bGxQYXRoJyk7XG52YXIgcGFyc2VIZWFkZXJzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL3BhcnNlSGVhZGVycycpO1xudmFyIGlzVVJMU2FtZU9yaWdpbiA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9pc1VSTFNhbWVPcmlnaW4nKTtcbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4uL2NvcmUvY3JlYXRlRXJyb3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB4aHJBZGFwdGVyKGNvbmZpZykge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gZGlzcGF0Y2hYaHJSZXF1ZXN0KHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciByZXF1ZXN0RGF0YSA9IGNvbmZpZy5kYXRhO1xuICAgIHZhciByZXF1ZXN0SGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzO1xuXG4gICAgaWYgKHV0aWxzLmlzRm9ybURhdGEocmVxdWVzdERhdGEpKSB7XG4gICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddOyAvLyBMZXQgdGhlIGJyb3dzZXIgc2V0IGl0XG4gICAgfVxuXG4gICAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgIC8vIEhUVFAgYmFzaWMgYXV0aGVudGljYXRpb25cbiAgICBpZiAoY29uZmlnLmF1dGgpIHtcbiAgICAgIHZhciB1c2VybmFtZSA9IGNvbmZpZy5hdXRoLnVzZXJuYW1lIHx8ICcnO1xuICAgICAgdmFyIHBhc3N3b3JkID0gY29uZmlnLmF1dGgucGFzc3dvcmQgPyB1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoY29uZmlnLmF1dGgucGFzc3dvcmQpKSA6ICcnO1xuICAgICAgcmVxdWVzdEhlYWRlcnMuQXV0aG9yaXphdGlvbiA9ICdCYXNpYyAnICsgYnRvYSh1c2VybmFtZSArICc6JyArIHBhc3N3b3JkKTtcbiAgICB9XG5cbiAgICB2YXIgZnVsbFBhdGggPSBidWlsZEZ1bGxQYXRoKGNvbmZpZy5iYXNlVVJMLCBjb25maWcudXJsKTtcbiAgICByZXF1ZXN0Lm9wZW4oY29uZmlnLm1ldGhvZC50b1VwcGVyQ2FzZSgpLCBidWlsZFVSTChmdWxsUGF0aCwgY29uZmlnLnBhcmFtcywgY29uZmlnLnBhcmFtc1NlcmlhbGl6ZXIpLCB0cnVlKTtcblxuICAgIC8vIFNldCB0aGUgcmVxdWVzdCB0aW1lb3V0IGluIE1TXG4gICAgcmVxdWVzdC50aW1lb3V0ID0gY29uZmlnLnRpbWVvdXQ7XG5cbiAgICAvLyBMaXN0ZW4gZm9yIHJlYWR5IHN0YXRlXG4gICAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiBoYW5kbGVMb2FkKCkge1xuICAgICAgaWYgKCFyZXF1ZXN0IHx8IHJlcXVlc3QucmVhZHlTdGF0ZSAhPT0gNCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFRoZSByZXF1ZXN0IGVycm9yZWQgb3V0IGFuZCB3ZSBkaWRuJ3QgZ2V0IGEgcmVzcG9uc2UsIHRoaXMgd2lsbCBiZVxuICAgICAgLy8gaGFuZGxlZCBieSBvbmVycm9yIGluc3RlYWRcbiAgICAgIC8vIFdpdGggb25lIGV4Y2VwdGlvbjogcmVxdWVzdCB0aGF0IHVzaW5nIGZpbGU6IHByb3RvY29sLCBtb3N0IGJyb3dzZXJzXG4gICAgICAvLyB3aWxsIHJldHVybiBzdGF0dXMgYXMgMCBldmVuIHRob3VnaCBpdCdzIGEgc3VjY2Vzc2Z1bCByZXF1ZXN0XG4gICAgICBpZiAocmVxdWVzdC5zdGF0dXMgPT09IDAgJiYgIShyZXF1ZXN0LnJlc3BvbnNlVVJMICYmIHJlcXVlc3QucmVzcG9uc2VVUkwuaW5kZXhPZignZmlsZTonKSA9PT0gMCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBQcmVwYXJlIHRoZSByZXNwb25zZVxuICAgICAgdmFyIHJlc3BvbnNlSGVhZGVycyA9ICdnZXRBbGxSZXNwb25zZUhlYWRlcnMnIGluIHJlcXVlc3QgPyBwYXJzZUhlYWRlcnMocmVxdWVzdC5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSkgOiBudWxsO1xuICAgICAgdmFyIHJlc3BvbnNlRGF0YSA9ICFjb25maWcucmVzcG9uc2VUeXBlIHx8IGNvbmZpZy5yZXNwb25zZVR5cGUgPT09ICd0ZXh0JyA/IHJlcXVlc3QucmVzcG9uc2VUZXh0IDogcmVxdWVzdC5yZXNwb25zZTtcbiAgICAgIHZhciByZXNwb25zZSA9IHtcbiAgICAgICAgZGF0YTogcmVzcG9uc2VEYXRhLFxuICAgICAgICBzdGF0dXM6IHJlcXVlc3Quc3RhdHVzLFxuICAgICAgICBzdGF0dXNUZXh0OiByZXF1ZXN0LnN0YXR1c1RleHQsXG4gICAgICAgIGhlYWRlcnM6IHJlc3BvbnNlSGVhZGVycyxcbiAgICAgICAgY29uZmlnOiBjb25maWcsXG4gICAgICAgIHJlcXVlc3Q6IHJlcXVlc3RcbiAgICAgIH07XG5cbiAgICAgIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHJlc3BvbnNlKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSBicm93c2VyIHJlcXVlc3QgY2FuY2VsbGF0aW9uIChhcyBvcHBvc2VkIHRvIGEgbWFudWFsIGNhbmNlbGxhdGlvbilcbiAgICByZXF1ZXN0Lm9uYWJvcnQgPSBmdW5jdGlvbiBoYW5kbGVBYm9ydCgpIHtcbiAgICAgIGlmICghcmVxdWVzdCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcignUmVxdWVzdCBhYm9ydGVkJywgY29uZmlnLCAnRUNPTk5BQk9SVEVEJywgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIGxvdyBsZXZlbCBuZXR3b3JrIGVycm9yc1xuICAgIHJlcXVlc3Qub25lcnJvciA9IGZ1bmN0aW9uIGhhbmRsZUVycm9yKCkge1xuICAgICAgLy8gUmVhbCBlcnJvcnMgYXJlIGhpZGRlbiBmcm9tIHVzIGJ5IHRoZSBicm93c2VyXG4gICAgICAvLyBvbmVycm9yIHNob3VsZCBvbmx5IGZpcmUgaWYgaXQncyBhIG5ldHdvcmsgZXJyb3JcbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcignTmV0d29yayBFcnJvcicsIGNvbmZpZywgbnVsbCwgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIHRpbWVvdXRcbiAgICByZXF1ZXN0Lm9udGltZW91dCA9IGZ1bmN0aW9uIGhhbmRsZVRpbWVvdXQoKSB7XG4gICAgICB2YXIgdGltZW91dEVycm9yTWVzc2FnZSA9ICd0aW1lb3V0IG9mICcgKyBjb25maWcudGltZW91dCArICdtcyBleGNlZWRlZCc7XG4gICAgICBpZiAoY29uZmlnLnRpbWVvdXRFcnJvck1lc3NhZ2UpIHtcbiAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZSA9IGNvbmZpZy50aW1lb3V0RXJyb3JNZXNzYWdlO1xuICAgICAgfVxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKHRpbWVvdXRFcnJvck1lc3NhZ2UsIGNvbmZpZywgJ0VDT05OQUJPUlRFRCcsXG4gICAgICAgIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEFkZCB4c3JmIGhlYWRlclxuICAgIC8vIFRoaXMgaXMgb25seSBkb25lIGlmIHJ1bm5pbmcgaW4gYSBzdGFuZGFyZCBicm93c2VyIGVudmlyb25tZW50LlxuICAgIC8vIFNwZWNpZmljYWxseSBub3QgaWYgd2UncmUgaW4gYSB3ZWIgd29ya2VyLCBvciByZWFjdC1uYXRpdmUuXG4gICAgaWYgKHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkpIHtcbiAgICAgIC8vIEFkZCB4c3JmIGhlYWRlclxuICAgICAgdmFyIHhzcmZWYWx1ZSA9IChjb25maWcud2l0aENyZWRlbnRpYWxzIHx8IGlzVVJMU2FtZU9yaWdpbihmdWxsUGF0aCkpICYmIGNvbmZpZy54c3JmQ29va2llTmFtZSA/XG4gICAgICAgIGNvb2tpZXMucmVhZChjb25maWcueHNyZkNvb2tpZU5hbWUpIDpcbiAgICAgICAgdW5kZWZpbmVkO1xuXG4gICAgICBpZiAoeHNyZlZhbHVlKSB7XG4gICAgICAgIHJlcXVlc3RIZWFkZXJzW2NvbmZpZy54c3JmSGVhZGVyTmFtZV0gPSB4c3JmVmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQWRkIGhlYWRlcnMgdG8gdGhlIHJlcXVlc3RcbiAgICBpZiAoJ3NldFJlcXVlc3RIZWFkZXInIGluIHJlcXVlc3QpIHtcbiAgICAgIHV0aWxzLmZvckVhY2gocmVxdWVzdEhlYWRlcnMsIGZ1bmN0aW9uIHNldFJlcXVlc3RIZWFkZXIodmFsLCBrZXkpIHtcbiAgICAgICAgaWYgKHR5cGVvZiByZXF1ZXN0RGF0YSA9PT0gJ3VuZGVmaW5lZCcgJiYga2V5LnRvTG93ZXJDYXNlKCkgPT09ICdjb250ZW50LXR5cGUnKSB7XG4gICAgICAgICAgLy8gUmVtb3ZlIENvbnRlbnQtVHlwZSBpZiBkYXRhIGlzIHVuZGVmaW5lZFxuICAgICAgICAgIGRlbGV0ZSByZXF1ZXN0SGVhZGVyc1trZXldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIE90aGVyd2lzZSBhZGQgaGVhZGVyIHRvIHRoZSByZXF1ZXN0XG4gICAgICAgICAgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKGtleSwgdmFsKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQWRkIHdpdGhDcmVkZW50aWFscyB0byByZXF1ZXN0IGlmIG5lZWRlZFxuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnLndpdGhDcmVkZW50aWFscykpIHtcbiAgICAgIHJlcXVlc3Qud2l0aENyZWRlbnRpYWxzID0gISFjb25maWcud2l0aENyZWRlbnRpYWxzO1xuICAgIH1cblxuICAgIC8vIEFkZCByZXNwb25zZVR5cGUgdG8gcmVxdWVzdCBpZiBuZWVkZWRcbiAgICBpZiAoY29uZmlnLnJlc3BvbnNlVHlwZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSBjb25maWcucmVzcG9uc2VUeXBlO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBFeHBlY3RlZCBET01FeGNlcHRpb24gdGhyb3duIGJ5IGJyb3dzZXJzIG5vdCBjb21wYXRpYmxlIFhNTEh0dHBSZXF1ZXN0IExldmVsIDIuXG4gICAgICAgIC8vIEJ1dCwgdGhpcyBjYW4gYmUgc3VwcHJlc3NlZCBmb3IgJ2pzb24nIHR5cGUgYXMgaXQgY2FuIGJlIHBhcnNlZCBieSBkZWZhdWx0ICd0cmFuc2Zvcm1SZXNwb25zZScgZnVuY3Rpb24uXG4gICAgICAgIGlmIChjb25maWcucmVzcG9uc2VUeXBlICE9PSAnanNvbicpIHtcbiAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIHByb2dyZXNzIGlmIG5lZWRlZFxuICAgIGlmICh0eXBlb2YgY29uZmlnLm9uRG93bmxvYWRQcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGNvbmZpZy5vbkRvd25sb2FkUHJvZ3Jlc3MpO1xuICAgIH1cblxuICAgIC8vIE5vdCBhbGwgYnJvd3NlcnMgc3VwcG9ydCB1cGxvYWQgZXZlbnRzXG4gICAgaWYgKHR5cGVvZiBjb25maWcub25VcGxvYWRQcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJyAmJiByZXF1ZXN0LnVwbG9hZCkge1xuICAgICAgcmVxdWVzdC51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBjb25maWcub25VcGxvYWRQcm9ncmVzcyk7XG4gICAgfVxuXG4gICAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgICAgLy8gSGFuZGxlIGNhbmNlbGxhdGlvblxuICAgICAgY29uZmlnLmNhbmNlbFRva2VuLnByb21pc2UudGhlbihmdW5jdGlvbiBvbkNhbmNlbGVkKGNhbmNlbCkge1xuICAgICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICByZXF1ZXN0LmFib3J0KCk7XG4gICAgICAgIHJlamVjdChjYW5jZWwpO1xuICAgICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKCFyZXF1ZXN0RGF0YSkge1xuICAgICAgcmVxdWVzdERhdGEgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIFNlbmQgdGhlIHJlcXVlc3RcbiAgICByZXF1ZXN0LnNlbmQocmVxdWVzdERhdGEpO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbnZhciBiaW5kID0gcmVxdWlyZSgnLi9oZWxwZXJzL2JpbmQnKTtcbnZhciBBeGlvcyA9IHJlcXVpcmUoJy4vY29yZS9BeGlvcycpO1xudmFyIG1lcmdlQ29uZmlnID0gcmVxdWlyZSgnLi9jb3JlL21lcmdlQ29uZmlnJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIGluc3RhbmNlIG9mIEF4aW9zXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRlZmF1bHRDb25maWcgVGhlIGRlZmF1bHQgY29uZmlnIGZvciB0aGUgaW5zdGFuY2VcbiAqIEByZXR1cm4ge0F4aW9zfSBBIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICovXG5mdW5jdGlvbiBjcmVhdGVJbnN0YW5jZShkZWZhdWx0Q29uZmlnKSB7XG4gIHZhciBjb250ZXh0ID0gbmV3IEF4aW9zKGRlZmF1bHRDb25maWcpO1xuICB2YXIgaW5zdGFuY2UgPSBiaW5kKEF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0LCBjb250ZXh0KTtcblxuICAvLyBDb3B5IGF4aW9zLnByb3RvdHlwZSB0byBpbnN0YW5jZVxuICB1dGlscy5leHRlbmQoaW5zdGFuY2UsIEF4aW9zLnByb3RvdHlwZSwgY29udGV4dCk7XG5cbiAgLy8gQ29weSBjb250ZXh0IHRvIGluc3RhbmNlXG4gIHV0aWxzLmV4dGVuZChpbnN0YW5jZSwgY29udGV4dCk7XG5cbiAgcmV0dXJuIGluc3RhbmNlO1xufVxuXG4vLyBDcmVhdGUgdGhlIGRlZmF1bHQgaW5zdGFuY2UgdG8gYmUgZXhwb3J0ZWRcbnZhciBheGlvcyA9IGNyZWF0ZUluc3RhbmNlKGRlZmF1bHRzKTtcblxuLy8gRXhwb3NlIEF4aW9zIGNsYXNzIHRvIGFsbG93IGNsYXNzIGluaGVyaXRhbmNlXG5heGlvcy5BeGlvcyA9IEF4aW9zO1xuXG4vLyBGYWN0b3J5IGZvciBjcmVhdGluZyBuZXcgaW5zdGFuY2VzXG5heGlvcy5jcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUoaW5zdGFuY2VDb25maWcpIHtcbiAgcmV0dXJuIGNyZWF0ZUluc3RhbmNlKG1lcmdlQ29uZmlnKGF4aW9zLmRlZmF1bHRzLCBpbnN0YW5jZUNvbmZpZykpO1xufTtcblxuLy8gRXhwb3NlIENhbmNlbCAmIENhbmNlbFRva2VuXG5heGlvcy5DYW5jZWwgPSByZXF1aXJlKCcuL2NhbmNlbC9DYW5jZWwnKTtcbmF4aW9zLkNhbmNlbFRva2VuID0gcmVxdWlyZSgnLi9jYW5jZWwvQ2FuY2VsVG9rZW4nKTtcbmF4aW9zLmlzQ2FuY2VsID0gcmVxdWlyZSgnLi9jYW5jZWwvaXNDYW5jZWwnKTtcblxuLy8gRXhwb3NlIGFsbC9zcHJlYWRcbmF4aW9zLmFsbCA9IGZ1bmN0aW9uIGFsbChwcm9taXNlcykge1xuICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xufTtcbmF4aW9zLnNwcmVhZCA9IHJlcXVpcmUoJy4vaGVscGVycy9zcHJlYWQnKTtcblxuLy8gRXhwb3NlIGlzQXhpb3NFcnJvclxuYXhpb3MuaXNBeGlvc0Vycm9yID0gcmVxdWlyZSgnLi9oZWxwZXJzL2lzQXhpb3NFcnJvcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGF4aW9zO1xuXG4vLyBBbGxvdyB1c2Ugb2YgZGVmYXVsdCBpbXBvcnQgc3ludGF4IGluIFR5cGVTY3JpcHRcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBheGlvcztcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBBIGBDYW5jZWxgIGlzIGFuIG9iamVjdCB0aGF0IGlzIHRocm93biB3aGVuIGFuIG9wZXJhdGlvbiBpcyBjYW5jZWxlZC5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7c3RyaW5nPX0gbWVzc2FnZSBUaGUgbWVzc2FnZS5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsKG1lc3NhZ2UpIHtcbiAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbn1cblxuQ2FuY2VsLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICByZXR1cm4gJ0NhbmNlbCcgKyAodGhpcy5tZXNzYWdlID8gJzogJyArIHRoaXMubWVzc2FnZSA6ICcnKTtcbn07XG5cbkNhbmNlbC5wcm90b3R5cGUuX19DQU5DRUxfXyA9IHRydWU7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ2FuY2VsID0gcmVxdWlyZSgnLi9DYW5jZWwnKTtcblxuLyoqXG4gKiBBIGBDYW5jZWxUb2tlbmAgaXMgYW4gb2JqZWN0IHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVxdWVzdCBjYW5jZWxsYXRpb24gb2YgYW4gb3BlcmF0aW9uLlxuICpcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZXhlY3V0b3IgVGhlIGV4ZWN1dG9yIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBDYW5jZWxUb2tlbihleGVjdXRvcikge1xuICBpZiAodHlwZW9mIGV4ZWN1dG9yICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZXhlY3V0b3IgbXVzdCBiZSBhIGZ1bmN0aW9uLicpO1xuICB9XG5cbiAgdmFyIHJlc29sdmVQcm9taXNlO1xuICB0aGlzLnByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiBwcm9taXNlRXhlY3V0b3IocmVzb2x2ZSkge1xuICAgIHJlc29sdmVQcm9taXNlID0gcmVzb2x2ZTtcbiAgfSk7XG5cbiAgdmFyIHRva2VuID0gdGhpcztcbiAgZXhlY3V0b3IoZnVuY3Rpb24gY2FuY2VsKG1lc3NhZ2UpIHtcbiAgICBpZiAodG9rZW4ucmVhc29uKSB7XG4gICAgICAvLyBDYW5jZWxsYXRpb24gaGFzIGFscmVhZHkgYmVlbiByZXF1ZXN0ZWRcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0b2tlbi5yZWFzb24gPSBuZXcgQ2FuY2VsKG1lc3NhZ2UpO1xuICAgIHJlc29sdmVQcm9taXNlKHRva2VuLnJlYXNvbik7XG4gIH0pO1xufVxuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbkNhbmNlbFRva2VuLnByb3RvdHlwZS50aHJvd0lmUmVxdWVzdGVkID0gZnVuY3Rpb24gdGhyb3dJZlJlcXVlc3RlZCgpIHtcbiAgaWYgKHRoaXMucmVhc29uKSB7XG4gICAgdGhyb3cgdGhpcy5yZWFzb247XG4gIH1cbn07XG5cbi8qKlxuICogUmV0dXJucyBhbiBvYmplY3QgdGhhdCBjb250YWlucyBhIG5ldyBgQ2FuY2VsVG9rZW5gIGFuZCBhIGZ1bmN0aW9uIHRoYXQsIHdoZW4gY2FsbGVkLFxuICogY2FuY2VscyB0aGUgYENhbmNlbFRva2VuYC5cbiAqL1xuQ2FuY2VsVG9rZW4uc291cmNlID0gZnVuY3Rpb24gc291cmNlKCkge1xuICB2YXIgY2FuY2VsO1xuICB2YXIgdG9rZW4gPSBuZXcgQ2FuY2VsVG9rZW4oZnVuY3Rpb24gZXhlY3V0b3IoYykge1xuICAgIGNhbmNlbCA9IGM7XG4gIH0pO1xuICByZXR1cm4ge1xuICAgIHRva2VuOiB0b2tlbixcbiAgICBjYW5jZWw6IGNhbmNlbFxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW5jZWxUb2tlbjtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0NhbmNlbCh2YWx1ZSkge1xuICByZXR1cm4gISEodmFsdWUgJiYgdmFsdWUuX19DQU5DRUxfXyk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgYnVpbGRVUkwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2J1aWxkVVJMJyk7XG52YXIgSW50ZXJjZXB0b3JNYW5hZ2VyID0gcmVxdWlyZSgnLi9JbnRlcmNlcHRvck1hbmFnZXInKTtcbnZhciBkaXNwYXRjaFJlcXVlc3QgPSByZXF1aXJlKCcuL2Rpc3BhdGNoUmVxdWVzdCcpO1xudmFyIG1lcmdlQ29uZmlnID0gcmVxdWlyZSgnLi9tZXJnZUNvbmZpZycpO1xuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBpbnN0YW5jZUNvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICovXG5mdW5jdGlvbiBBeGlvcyhpbnN0YW5jZUNvbmZpZykge1xuICB0aGlzLmRlZmF1bHRzID0gaW5zdGFuY2VDb25maWc7XG4gIHRoaXMuaW50ZXJjZXB0b3JzID0ge1xuICAgIHJlcXVlc3Q6IG5ldyBJbnRlcmNlcHRvck1hbmFnZXIoKSxcbiAgICByZXNwb25zZTogbmV3IEludGVyY2VwdG9yTWFuYWdlcigpXG4gIH07XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnIHNwZWNpZmljIGZvciB0aGlzIHJlcXVlc3QgKG1lcmdlZCB3aXRoIHRoaXMuZGVmYXVsdHMpXG4gKi9cbkF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0ID0gZnVuY3Rpb24gcmVxdWVzdChjb25maWcpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIC8vIEFsbG93IGZvciBheGlvcygnZXhhbXBsZS91cmwnWywgY29uZmlnXSkgYSBsYSBmZXRjaCBBUElcbiAgaWYgKHR5cGVvZiBjb25maWcgPT09ICdzdHJpbmcnKSB7XG4gICAgY29uZmlnID0gYXJndW1lbnRzWzFdIHx8IHt9O1xuICAgIGNvbmZpZy51cmwgPSBhcmd1bWVudHNbMF07XG4gIH0gZWxzZSB7XG4gICAgY29uZmlnID0gY29uZmlnIHx8IHt9O1xuICB9XG5cbiAgY29uZmlnID0gbWVyZ2VDb25maWcodGhpcy5kZWZhdWx0cywgY29uZmlnKTtcblxuICAvLyBTZXQgY29uZmlnLm1ldGhvZFxuICBpZiAoY29uZmlnLm1ldGhvZCkge1xuICAgIGNvbmZpZy5tZXRob2QgPSBjb25maWcubWV0aG9kLnRvTG93ZXJDYXNlKCk7XG4gIH0gZWxzZSBpZiAodGhpcy5kZWZhdWx0cy5tZXRob2QpIHtcbiAgICBjb25maWcubWV0aG9kID0gdGhpcy5kZWZhdWx0cy5tZXRob2QudG9Mb3dlckNhc2UoKTtcbiAgfSBlbHNlIHtcbiAgICBjb25maWcubWV0aG9kID0gJ2dldCc7XG4gIH1cblxuICAvLyBIb29rIHVwIGludGVyY2VwdG9ycyBtaWRkbGV3YXJlXG4gIHZhciBjaGFpbiA9IFtkaXNwYXRjaFJlcXVlc3QsIHVuZGVmaW5lZF07XG4gIHZhciBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKGNvbmZpZyk7XG5cbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVxdWVzdC5mb3JFYWNoKGZ1bmN0aW9uIHVuc2hpZnRSZXF1ZXN0SW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgY2hhaW4udW5zaGlmdChpbnRlcmNlcHRvci5mdWxmaWxsZWQsIGludGVyY2VwdG9yLnJlamVjdGVkKTtcbiAgfSk7XG5cbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVzcG9uc2UuZm9yRWFjaChmdW5jdGlvbiBwdXNoUmVzcG9uc2VJbnRlcmNlcHRvcnMoaW50ZXJjZXB0b3IpIHtcbiAgICBjaGFpbi5wdXNoKGludGVyY2VwdG9yLmZ1bGZpbGxlZCwgaW50ZXJjZXB0b3IucmVqZWN0ZWQpO1xuICB9KTtcblxuICB3aGlsZSAoY2hhaW4ubGVuZ3RoKSB7XG4gICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihjaGFpbi5zaGlmdCgpLCBjaGFpbi5zaGlmdCgpKTtcbiAgfVxuXG4gIHJldHVybiBwcm9taXNlO1xufTtcblxuQXhpb3MucHJvdG90eXBlLmdldFVyaSA9IGZ1bmN0aW9uIGdldFVyaShjb25maWcpIHtcbiAgY29uZmlnID0gbWVyZ2VDb25maWcodGhpcy5kZWZhdWx0cywgY29uZmlnKTtcbiAgcmV0dXJuIGJ1aWxkVVJMKGNvbmZpZy51cmwsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKS5yZXBsYWNlKC9eXFw/LywgJycpO1xufTtcblxuLy8gUHJvdmlkZSBhbGlhc2VzIGZvciBzdXBwb3J0ZWQgcmVxdWVzdCBtZXRob2RzXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ29wdGlvbnMnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZE5vRGF0YShtZXRob2QpIHtcbiAgLyplc2xpbnQgZnVuYy1uYW1lczowKi9cbiAgQXhpb3MucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih1cmwsIGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QobWVyZ2VDb25maWcoY29uZmlnIHx8IHt9LCB7XG4gICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgIHVybDogdXJsLFxuICAgICAgZGF0YTogKGNvbmZpZyB8fCB7fSkuZGF0YVxuICAgIH0pKTtcbiAgfTtcbn0pO1xuXG51dGlscy5mb3JFYWNoKFsncG9zdCcsICdwdXQnLCAncGF0Y2gnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZFdpdGhEYXRhKG1ldGhvZCkge1xuICAvKmVzbGludCBmdW5jLW5hbWVzOjAqL1xuICBBeGlvcy5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgY29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChtZXJnZUNvbmZpZyhjb25maWcgfHwge30sIHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgdXJsOiB1cmwsXG4gICAgICBkYXRhOiBkYXRhXG4gICAgfSkpO1xuICB9O1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQXhpb3M7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuZnVuY3Rpb24gSW50ZXJjZXB0b3JNYW5hZ2VyKCkge1xuICB0aGlzLmhhbmRsZXJzID0gW107XG59XG5cbi8qKlxuICogQWRkIGEgbmV3IGludGVyY2VwdG9yIHRvIHRoZSBzdGFja1xuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bGZpbGxlZCBUaGUgZnVuY3Rpb24gdG8gaGFuZGxlIGB0aGVuYCBmb3IgYSBgUHJvbWlzZWBcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlamVjdGVkIFRoZSBmdW5jdGlvbiB0byBoYW5kbGUgYHJlamVjdGAgZm9yIGEgYFByb21pc2VgXG4gKlxuICogQHJldHVybiB7TnVtYmVyfSBBbiBJRCB1c2VkIHRvIHJlbW92ZSBpbnRlcmNlcHRvciBsYXRlclxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uIHVzZShmdWxmaWxsZWQsIHJlamVjdGVkKSB7XG4gIHRoaXMuaGFuZGxlcnMucHVzaCh7XG4gICAgZnVsZmlsbGVkOiBmdWxmaWxsZWQsXG4gICAgcmVqZWN0ZWQ6IHJlamVjdGVkXG4gIH0pO1xuICByZXR1cm4gdGhpcy5oYW5kbGVycy5sZW5ndGggLSAxO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYW4gaW50ZXJjZXB0b3IgZnJvbSB0aGUgc3RhY2tcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gaWQgVGhlIElEIHRoYXQgd2FzIHJldHVybmVkIGJ5IGB1c2VgXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUuZWplY3QgPSBmdW5jdGlvbiBlamVjdChpZCkge1xuICBpZiAodGhpcy5oYW5kbGVyc1tpZF0pIHtcbiAgICB0aGlzLmhhbmRsZXJzW2lkXSA9IG51bGw7XG4gIH1cbn07XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFsbCB0aGUgcmVnaXN0ZXJlZCBpbnRlcmNlcHRvcnNcbiAqXG4gKiBUaGlzIG1ldGhvZCBpcyBwYXJ0aWN1bGFybHkgdXNlZnVsIGZvciBza2lwcGluZyBvdmVyIGFueVxuICogaW50ZXJjZXB0b3JzIHRoYXQgbWF5IGhhdmUgYmVjb21lIGBudWxsYCBjYWxsaW5nIGBlamVjdGAuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggaW50ZXJjZXB0b3JcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gZm9yRWFjaChmbikge1xuICB1dGlscy5mb3JFYWNoKHRoaXMuaGFuZGxlcnMsIGZ1bmN0aW9uIGZvckVhY2hIYW5kbGVyKGgpIHtcbiAgICBpZiAoaCAhPT0gbnVsbCkge1xuICAgICAgZm4oaCk7XG4gICAgfVxuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJjZXB0b3JNYW5hZ2VyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaXNBYnNvbHV0ZVVSTCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvaXNBYnNvbHV0ZVVSTCcpO1xudmFyIGNvbWJpbmVVUkxzID0gcmVxdWlyZSgnLi4vaGVscGVycy9jb21iaW5lVVJMcycpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgVVJMIGJ5IGNvbWJpbmluZyB0aGUgYmFzZVVSTCB3aXRoIHRoZSByZXF1ZXN0ZWRVUkwsXG4gKiBvbmx5IHdoZW4gdGhlIHJlcXVlc3RlZFVSTCBpcyBub3QgYWxyZWFkeSBhbiBhYnNvbHV0ZSBVUkwuXG4gKiBJZiB0aGUgcmVxdWVzdFVSTCBpcyBhYnNvbHV0ZSwgdGhpcyBmdW5jdGlvbiByZXR1cm5zIHRoZSByZXF1ZXN0ZWRVUkwgdW50b3VjaGVkLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlcXVlc3RlZFVSTCBBYnNvbHV0ZSBvciByZWxhdGl2ZSBVUkwgdG8gY29tYmluZVxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGNvbWJpbmVkIGZ1bGwgcGF0aFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJ1aWxkRnVsbFBhdGgoYmFzZVVSTCwgcmVxdWVzdGVkVVJMKSB7XG4gIGlmIChiYXNlVVJMICYmICFpc0Fic29sdXRlVVJMKHJlcXVlc3RlZFVSTCkpIHtcbiAgICByZXR1cm4gY29tYmluZVVSTHMoYmFzZVVSTCwgcmVxdWVzdGVkVVJMKTtcbiAgfVxuICByZXR1cm4gcmVxdWVzdGVkVVJMO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGVuaGFuY2VFcnJvciA9IHJlcXVpcmUoJy4vZW5oYW5jZUVycm9yJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBtZXNzYWdlLCBjb25maWcsIGVycm9yIGNvZGUsIHJlcXVlc3QgYW5kIHJlc3BvbnNlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIFRoZSBlcnJvciBtZXNzYWdlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBjcmVhdGVkIGVycm9yLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZUVycm9yKG1lc3NhZ2UsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgdmFyIGVycm9yID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xuICByZXR1cm4gZW5oYW5jZUVycm9yKGVycm9yLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciB0cmFuc2Zvcm1EYXRhID0gcmVxdWlyZSgnLi90cmFuc2Zvcm1EYXRhJyk7XG52YXIgaXNDYW5jZWwgPSByZXF1aXJlKCcuLi9jYW5jZWwvaXNDYW5jZWwnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4uL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogVGhyb3dzIGEgYENhbmNlbGAgaWYgY2FuY2VsbGF0aW9uIGhhcyBiZWVuIHJlcXVlc3RlZC5cbiAqL1xuZnVuY3Rpb24gdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpIHtcbiAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgIGNvbmZpZy5jYW5jZWxUb2tlbi50aHJvd0lmUmVxdWVzdGVkKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBEaXNwYXRjaCBhIHJlcXVlc3QgdG8gdGhlIHNlcnZlciB1c2luZyB0aGUgY29uZmlndXJlZCBhZGFwdGVyLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZyB0aGF0IGlzIHRvIGJlIHVzZWQgZm9yIHRoZSByZXF1ZXN0XG4gKiBAcmV0dXJucyB7UHJvbWlzZX0gVGhlIFByb21pc2UgdG8gYmUgZnVsZmlsbGVkXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGlzcGF0Y2hSZXF1ZXN0KGNvbmZpZykge1xuICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgLy8gRW5zdXJlIGhlYWRlcnMgZXhpc3RcbiAgY29uZmlnLmhlYWRlcnMgPSBjb25maWcuaGVhZGVycyB8fCB7fTtcblxuICAvLyBUcmFuc2Zvcm0gcmVxdWVzdCBkYXRhXG4gIGNvbmZpZy5kYXRhID0gdHJhbnNmb3JtRGF0YShcbiAgICBjb25maWcuZGF0YSxcbiAgICBjb25maWcuaGVhZGVycyxcbiAgICBjb25maWcudHJhbnNmb3JtUmVxdWVzdFxuICApO1xuXG4gIC8vIEZsYXR0ZW4gaGVhZGVyc1xuICBjb25maWcuaGVhZGVycyA9IHV0aWxzLm1lcmdlKFxuICAgIGNvbmZpZy5oZWFkZXJzLmNvbW1vbiB8fCB7fSxcbiAgICBjb25maWcuaGVhZGVyc1tjb25maWcubWV0aG9kXSB8fCB7fSxcbiAgICBjb25maWcuaGVhZGVyc1xuICApO1xuXG4gIHV0aWxzLmZvckVhY2goXG4gICAgWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnLCAncG9zdCcsICdwdXQnLCAncGF0Y2gnLCAnY29tbW9uJ10sXG4gICAgZnVuY3Rpb24gY2xlYW5IZWFkZXJDb25maWcobWV0aG9kKSB7XG4gICAgICBkZWxldGUgY29uZmlnLmhlYWRlcnNbbWV0aG9kXTtcbiAgICB9XG4gICk7XG5cbiAgdmFyIGFkYXB0ZXIgPSBjb25maWcuYWRhcHRlciB8fCBkZWZhdWx0cy5hZGFwdGVyO1xuXG4gIHJldHVybiBhZGFwdGVyKGNvbmZpZykudGhlbihmdW5jdGlvbiBvbkFkYXB0ZXJSZXNvbHV0aW9uKHJlc3BvbnNlKSB7XG4gICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgLy8gVHJhbnNmb3JtIHJlc3BvbnNlIGRhdGFcbiAgICByZXNwb25zZS5kYXRhID0gdHJhbnNmb3JtRGF0YShcbiAgICAgIHJlc3BvbnNlLmRhdGEsXG4gICAgICByZXNwb25zZS5oZWFkZXJzLFxuICAgICAgY29uZmlnLnRyYW5zZm9ybVJlc3BvbnNlXG4gICAgKTtcblxuICAgIHJldHVybiByZXNwb25zZTtcbiAgfSwgZnVuY3Rpb24gb25BZGFwdGVyUmVqZWN0aW9uKHJlYXNvbikge1xuICAgIGlmICghaXNDYW5jZWwocmVhc29uKSkge1xuICAgICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgICAvLyBUcmFuc2Zvcm0gcmVzcG9uc2UgZGF0YVxuICAgICAgaWYgKHJlYXNvbiAmJiByZWFzb24ucmVzcG9uc2UpIHtcbiAgICAgICAgcmVhc29uLnJlc3BvbnNlLmRhdGEgPSB0cmFuc2Zvcm1EYXRhKFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhLFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5oZWFkZXJzLFxuICAgICAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChyZWFzb24pO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVXBkYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBjb25maWcsIGVycm9yIGNvZGUsIGFuZCByZXNwb25zZS5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJvciBUaGUgZXJyb3IgdG8gdXBkYXRlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBlcnJvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgZXJyb3IuY29uZmlnID0gY29uZmlnO1xuICBpZiAoY29kZSkge1xuICAgIGVycm9yLmNvZGUgPSBjb2RlO1xuICB9XG5cbiAgZXJyb3IucmVxdWVzdCA9IHJlcXVlc3Q7XG4gIGVycm9yLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gIGVycm9yLmlzQXhpb3NFcnJvciA9IHRydWU7XG5cbiAgZXJyb3IudG9KU09OID0gZnVuY3Rpb24gdG9KU09OKCkge1xuICAgIHJldHVybiB7XG4gICAgICAvLyBTdGFuZGFyZFxuICAgICAgbWVzc2FnZTogdGhpcy5tZXNzYWdlLFxuICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgLy8gTWljcm9zb2Z0XG4gICAgICBkZXNjcmlwdGlvbjogdGhpcy5kZXNjcmlwdGlvbixcbiAgICAgIG51bWJlcjogdGhpcy5udW1iZXIsXG4gICAgICAvLyBNb3ppbGxhXG4gICAgICBmaWxlTmFtZTogdGhpcy5maWxlTmFtZSxcbiAgICAgIGxpbmVOdW1iZXI6IHRoaXMubGluZU51bWJlcixcbiAgICAgIGNvbHVtbk51bWJlcjogdGhpcy5jb2x1bW5OdW1iZXIsXG4gICAgICBzdGFjazogdGhpcy5zdGFjayxcbiAgICAgIC8vIEF4aW9zXG4gICAgICBjb25maWc6IHRoaXMuY29uZmlnLFxuICAgICAgY29kZTogdGhpcy5jb2RlXG4gICAgfTtcbiAgfTtcbiAgcmV0dXJuIGVycm9yO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxuLyoqXG4gKiBDb25maWctc3BlY2lmaWMgbWVyZ2UtZnVuY3Rpb24gd2hpY2ggY3JlYXRlcyBhIG5ldyBjb25maWctb2JqZWN0XG4gKiBieSBtZXJnaW5nIHR3byBjb25maWd1cmF0aW9uIG9iamVjdHMgdG9nZXRoZXIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZzFcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcyXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBOZXcgb2JqZWN0IHJlc3VsdGluZyBmcm9tIG1lcmdpbmcgY29uZmlnMiB0byBjb25maWcxXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbWVyZ2VDb25maWcoY29uZmlnMSwgY29uZmlnMikge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgY29uZmlnMiA9IGNvbmZpZzIgfHwge307XG4gIHZhciBjb25maWcgPSB7fTtcblxuICB2YXIgdmFsdWVGcm9tQ29uZmlnMktleXMgPSBbJ3VybCcsICdtZXRob2QnLCAnZGF0YSddO1xuICB2YXIgbWVyZ2VEZWVwUHJvcGVydGllc0tleXMgPSBbJ2hlYWRlcnMnLCAnYXV0aCcsICdwcm94eScsICdwYXJhbXMnXTtcbiAgdmFyIGRlZmF1bHRUb0NvbmZpZzJLZXlzID0gW1xuICAgICdiYXNlVVJMJywgJ3RyYW5zZm9ybVJlcXVlc3QnLCAndHJhbnNmb3JtUmVzcG9uc2UnLCAncGFyYW1zU2VyaWFsaXplcicsXG4gICAgJ3RpbWVvdXQnLCAndGltZW91dE1lc3NhZ2UnLCAnd2l0aENyZWRlbnRpYWxzJywgJ2FkYXB0ZXInLCAncmVzcG9uc2VUeXBlJywgJ3hzcmZDb29raWVOYW1lJyxcbiAgICAneHNyZkhlYWRlck5hbWUnLCAnb25VcGxvYWRQcm9ncmVzcycsICdvbkRvd25sb2FkUHJvZ3Jlc3MnLCAnZGVjb21wcmVzcycsXG4gICAgJ21heENvbnRlbnRMZW5ndGgnLCAnbWF4Qm9keUxlbmd0aCcsICdtYXhSZWRpcmVjdHMnLCAndHJhbnNwb3J0JywgJ2h0dHBBZ2VudCcsXG4gICAgJ2h0dHBzQWdlbnQnLCAnY2FuY2VsVG9rZW4nLCAnc29ja2V0UGF0aCcsICdyZXNwb25zZUVuY29kaW5nJ1xuICBdO1xuICB2YXIgZGlyZWN0TWVyZ2VLZXlzID0gWyd2YWxpZGF0ZVN0YXR1cyddO1xuXG4gIGZ1bmN0aW9uIGdldE1lcmdlZFZhbHVlKHRhcmdldCwgc291cmNlKSB7XG4gICAgaWYgKHV0aWxzLmlzUGxhaW5PYmplY3QodGFyZ2V0KSAmJiB1dGlscy5pc1BsYWluT2JqZWN0KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiB1dGlscy5tZXJnZSh0YXJnZXQsIHNvdXJjZSk7XG4gICAgfSBlbHNlIGlmICh1dGlscy5pc1BsYWluT2JqZWN0KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiB1dGlscy5tZXJnZSh7fSwgc291cmNlKTtcbiAgICB9IGVsc2UgaWYgKHV0aWxzLmlzQXJyYXkoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHNvdXJjZS5zbGljZSgpO1xuICAgIH1cbiAgICByZXR1cm4gc291cmNlO1xuICB9XG5cbiAgZnVuY3Rpb24gbWVyZ2VEZWVwUHJvcGVydGllcyhwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUoY29uZmlnMVtwcm9wXSwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMVtwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9XG5cbiAgdXRpbHMuZm9yRWFjaCh2YWx1ZUZyb21Db25maWcyS2V5cywgZnVuY3Rpb24gdmFsdWVGcm9tQ29uZmlnMihwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcyW3Byb3BdKTtcbiAgICB9XG4gIH0pO1xuXG4gIHV0aWxzLmZvckVhY2gobWVyZ2VEZWVwUHJvcGVydGllc0tleXMsIG1lcmdlRGVlcFByb3BlcnRpZXMpO1xuXG4gIHV0aWxzLmZvckVhY2goZGVmYXVsdFRvQ29uZmlnMktleXMsIGZ1bmN0aW9uIGRlZmF1bHRUb0NvbmZpZzIocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMVtwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9KTtcblxuICB1dGlscy5mb3JFYWNoKGRpcmVjdE1lcmdlS2V5cywgZnVuY3Rpb24gbWVyZ2UocHJvcCkge1xuICAgIGlmIChwcm9wIGluIGNvbmZpZzIpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKGNvbmZpZzFbcHJvcF0sIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAocHJvcCBpbiBjb25maWcxKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIGF4aW9zS2V5cyA9IHZhbHVlRnJvbUNvbmZpZzJLZXlzXG4gICAgLmNvbmNhdChtZXJnZURlZXBQcm9wZXJ0aWVzS2V5cylcbiAgICAuY29uY2F0KGRlZmF1bHRUb0NvbmZpZzJLZXlzKVxuICAgIC5jb25jYXQoZGlyZWN0TWVyZ2VLZXlzKTtcblxuICB2YXIgb3RoZXJLZXlzID0gT2JqZWN0XG4gICAgLmtleXMoY29uZmlnMSlcbiAgICAuY29uY2F0KE9iamVjdC5rZXlzKGNvbmZpZzIpKVxuICAgIC5maWx0ZXIoZnVuY3Rpb24gZmlsdGVyQXhpb3NLZXlzKGtleSkge1xuICAgICAgcmV0dXJuIGF4aW9zS2V5cy5pbmRleE9mKGtleSkgPT09IC0xO1xuICAgIH0pO1xuXG4gIHV0aWxzLmZvckVhY2gob3RoZXJLZXlzLCBtZXJnZURlZXBQcm9wZXJ0aWVzKTtcblxuICByZXR1cm4gY29uZmlnO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNyZWF0ZUVycm9yID0gcmVxdWlyZSgnLi9jcmVhdGVFcnJvcicpO1xuXG4vKipcbiAqIFJlc29sdmUgb3IgcmVqZWN0IGEgUHJvbWlzZSBiYXNlZCBvbiByZXNwb25zZSBzdGF0dXMuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVzb2x2ZSBBIGZ1bmN0aW9uIHRoYXQgcmVzb2x2ZXMgdGhlIHByb21pc2UuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWplY3QgQSBmdW5jdGlvbiB0aGF0IHJlamVjdHMgdGhlIHByb21pc2UuXG4gKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgVGhlIHJlc3BvbnNlLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHJlc3BvbnNlKSB7XG4gIHZhciB2YWxpZGF0ZVN0YXR1cyA9IHJlc3BvbnNlLmNvbmZpZy52YWxpZGF0ZVN0YXR1cztcbiAgaWYgKCFyZXNwb25zZS5zdGF0dXMgfHwgIXZhbGlkYXRlU3RhdHVzIHx8IHZhbGlkYXRlU3RhdHVzKHJlc3BvbnNlLnN0YXR1cykpIHtcbiAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgfSBlbHNlIHtcbiAgICByZWplY3QoY3JlYXRlRXJyb3IoXG4gICAgICAnUmVxdWVzdCBmYWlsZWQgd2l0aCBzdGF0dXMgY29kZSAnICsgcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgcmVzcG9uc2UuY29uZmlnLFxuICAgICAgbnVsbCxcbiAgICAgIHJlc3BvbnNlLnJlcXVlc3QsXG4gICAgICByZXNwb25zZVxuICAgICkpO1xuICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbi8qKlxuICogVHJhbnNmb3JtIHRoZSBkYXRhIGZvciBhIHJlcXVlc3Qgb3IgYSByZXNwb25zZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gZGF0YSBUaGUgZGF0YSB0byBiZSB0cmFuc2Zvcm1lZFxuICogQHBhcmFtIHtBcnJheX0gaGVhZGVycyBUaGUgaGVhZGVycyBmb3IgdGhlIHJlcXVlc3Qgb3IgcmVzcG9uc2VcbiAqIEBwYXJhbSB7QXJyYXl8RnVuY3Rpb259IGZucyBBIHNpbmdsZSBmdW5jdGlvbiBvciBBcnJheSBvZiBmdW5jdGlvbnNcbiAqIEByZXR1cm5zIHsqfSBUaGUgcmVzdWx0aW5nIHRyYW5zZm9ybWVkIGRhdGFcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0cmFuc2Zvcm1EYXRhKGRhdGEsIGhlYWRlcnMsIGZucykge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgdXRpbHMuZm9yRWFjaChmbnMsIGZ1bmN0aW9uIHRyYW5zZm9ybShmbikge1xuICAgIGRhdGEgPSBmbihkYXRhLCBoZWFkZXJzKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGRhdGE7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgbm9ybWFsaXplSGVhZGVyTmFtZSA9IHJlcXVpcmUoJy4vaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lJyk7XG5cbnZhciBERUZBVUxUX0NPTlRFTlRfVFlQRSA9IHtcbiAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG59O1xuXG5mdW5jdGlvbiBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgdmFsdWUpIHtcbiAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzKSAmJiB1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzWydDb250ZW50LVR5cGUnXSkpIHtcbiAgICBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9IHZhbHVlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldERlZmF1bHRBZGFwdGVyKCkge1xuICB2YXIgYWRhcHRlcjtcbiAgaWYgKHR5cGVvZiBYTUxIdHRwUmVxdWVzdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBGb3IgYnJvd3NlcnMgdXNlIFhIUiBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4vYWRhcHRlcnMveGhyJyk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChwcm9jZXNzKSA9PT0gJ1tvYmplY3QgcHJvY2Vzc10nKSB7XG4gICAgLy8gRm9yIG5vZGUgdXNlIEhUVFAgYWRhcHRlclxuICAgIGFkYXB0ZXIgPSByZXF1aXJlKCcuL2FkYXB0ZXJzL2h0dHAnKTtcbiAgfVxuICByZXR1cm4gYWRhcHRlcjtcbn1cblxudmFyIGRlZmF1bHRzID0ge1xuICBhZGFwdGVyOiBnZXREZWZhdWx0QWRhcHRlcigpLFxuXG4gIHRyYW5zZm9ybVJlcXVlc3Q6IFtmdW5jdGlvbiB0cmFuc2Zvcm1SZXF1ZXN0KGRhdGEsIGhlYWRlcnMpIHtcbiAgICBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsICdBY2NlcHQnKTtcbiAgICBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsICdDb250ZW50LVR5cGUnKTtcbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNBcnJheUJ1ZmZlcihkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzU3RyZWFtKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0ZpbGUoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQmxvYihkYXRhKVxuICAgICkge1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc0FycmF5QnVmZmVyVmlldyhkYXRhKSkge1xuICAgICAgcmV0dXJuIGRhdGEuYnVmZmVyO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMoZGF0YSkpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc09iamVjdChkYXRhKSkge1xuICAgICAgc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsICdhcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIHRyYW5zZm9ybVJlc3BvbnNlOiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVzcG9uc2UoZGF0YSkge1xuICAgIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGRhdGEgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgfSBjYXRjaCAoZSkgeyAvKiBJZ25vcmUgKi8gfVxuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgLyoqXG4gICAqIEEgdGltZW91dCBpbiBtaWxsaXNlY29uZHMgdG8gYWJvcnQgYSByZXF1ZXN0LiBJZiBzZXQgdG8gMCAoZGVmYXVsdCkgYVxuICAgKiB0aW1lb3V0IGlzIG5vdCBjcmVhdGVkLlxuICAgKi9cbiAgdGltZW91dDogMCxcblxuICB4c3JmQ29va2llTmFtZTogJ1hTUkYtVE9LRU4nLFxuICB4c3JmSGVhZGVyTmFtZTogJ1gtWFNSRi1UT0tFTicsXG5cbiAgbWF4Q29udGVudExlbmd0aDogLTEsXG4gIG1heEJvZHlMZW5ndGg6IC0xLFxuXG4gIHZhbGlkYXRlU3RhdHVzOiBmdW5jdGlvbiB2YWxpZGF0ZVN0YXR1cyhzdGF0dXMpIHtcbiAgICByZXR1cm4gc3RhdHVzID49IDIwMCAmJiBzdGF0dXMgPCAzMDA7XG4gIH1cbn07XG5cbmRlZmF1bHRzLmhlYWRlcnMgPSB7XG4gIGNvbW1vbjoge1xuICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbiwgdGV4dC9wbGFpbiwgKi8qJ1xuICB9XG59O1xuXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2ROb0RhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHt9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHV0aWxzLm1lcmdlKERFRkFVTFRfQ09OVEVOVF9UWVBFKTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmF1bHRzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJpbmQoZm4sIHRoaXNBcmcpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHdyYXAoKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhcmdzW2ldID0gYXJndW1lbnRzW2ldO1xuICAgIH1cbiAgICByZXR1cm4gZm4uYXBwbHkodGhpc0FyZywgYXJncyk7XG4gIH07XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbmZ1bmN0aW9uIGVuY29kZSh2YWwpIHtcbiAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudCh2YWwpLlxuICAgIHJlcGxhY2UoLyUzQS9naSwgJzonKS5cbiAgICByZXBsYWNlKC8lMjQvZywgJyQnKS5cbiAgICByZXBsYWNlKC8lMkMvZ2ksICcsJykuXG4gICAgcmVwbGFjZSgvJTIwL2csICcrJykuXG4gICAgcmVwbGFjZSgvJTVCL2dpLCAnWycpLlxuICAgIHJlcGxhY2UoLyU1RC9naSwgJ10nKTtcbn1cblxuLyoqXG4gKiBCdWlsZCBhIFVSTCBieSBhcHBlbmRpbmcgcGFyYW1zIHRvIHRoZSBlbmRcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIFRoZSBiYXNlIG9mIHRoZSB1cmwgKGUuZy4sIGh0dHA6Ly93d3cuZ29vZ2xlLmNvbSlcbiAqIEBwYXJhbSB7b2JqZWN0fSBbcGFyYW1zXSBUaGUgcGFyYW1zIHRvIGJlIGFwcGVuZGVkXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgZm9ybWF0dGVkIHVybFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJ1aWxkVVJMKHVybCwgcGFyYW1zLCBwYXJhbXNTZXJpYWxpemVyKSB7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICBpZiAoIXBhcmFtcykge1xuICAgIHJldHVybiB1cmw7XG4gIH1cblxuICB2YXIgc2VyaWFsaXplZFBhcmFtcztcbiAgaWYgKHBhcmFtc1NlcmlhbGl6ZXIpIHtcbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFyYW1zU2VyaWFsaXplcihwYXJhbXMpO1xuICB9IGVsc2UgaWYgKHV0aWxzLmlzVVJMU2VhcmNoUGFyYW1zKHBhcmFtcykpIHtcbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFyYW1zLnRvU3RyaW5nKCk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIHBhcnRzID0gW107XG5cbiAgICB1dGlscy5mb3JFYWNoKHBhcmFtcywgZnVuY3Rpb24gc2VyaWFsaXplKHZhbCwga2V5KSB7XG4gICAgICBpZiAodmFsID09PSBudWxsIHx8IHR5cGVvZiB2YWwgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHV0aWxzLmlzQXJyYXkodmFsKSkge1xuICAgICAgICBrZXkgPSBrZXkgKyAnW10nO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsID0gW3ZhbF07XG4gICAgICB9XG5cbiAgICAgIHV0aWxzLmZvckVhY2godmFsLCBmdW5jdGlvbiBwYXJzZVZhbHVlKHYpIHtcbiAgICAgICAgaWYgKHV0aWxzLmlzRGF0ZSh2KSkge1xuICAgICAgICAgIHYgPSB2LnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodXRpbHMuaXNPYmplY3QodikpIHtcbiAgICAgICAgICB2ID0gSlNPTi5zdHJpbmdpZnkodik7XG4gICAgICAgIH1cbiAgICAgICAgcGFydHMucHVzaChlbmNvZGUoa2V5KSArICc9JyArIGVuY29kZSh2KSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJ0cy5qb2luKCcmJyk7XG4gIH1cblxuICBpZiAoc2VyaWFsaXplZFBhcmFtcykge1xuICAgIHZhciBoYXNobWFya0luZGV4ID0gdXJsLmluZGV4T2YoJyMnKTtcbiAgICBpZiAoaGFzaG1hcmtJbmRleCAhPT0gLTEpIHtcbiAgICAgIHVybCA9IHVybC5zbGljZSgwLCBoYXNobWFya0luZGV4KTtcbiAgICB9XG5cbiAgICB1cmwgKz0gKHVybC5pbmRleE9mKCc/JykgPT09IC0xID8gJz8nIDogJyYnKSArIHNlcmlhbGl6ZWRQYXJhbXM7XG4gIH1cblxuICByZXR1cm4gdXJsO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IFVSTCBieSBjb21iaW5pbmcgdGhlIHNwZWNpZmllZCBVUkxzXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VVUkwgVGhlIGJhc2UgVVJMXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpdmVVUkwgVGhlIHJlbGF0aXZlIFVSTFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGNvbWJpbmVkIFVSTFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNvbWJpbmVVUkxzKGJhc2VVUkwsIHJlbGF0aXZlVVJMKSB7XG4gIHJldHVybiByZWxhdGl2ZVVSTFxuICAgID8gYmFzZVVSTC5yZXBsYWNlKC9cXC8rJC8sICcnKSArICcvJyArIHJlbGF0aXZlVVJMLnJlcGxhY2UoL15cXC8rLywgJycpXG4gICAgOiBiYXNlVVJMO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChcbiAgdXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSA/XG5cbiAgLy8gU3RhbmRhcmQgYnJvd3NlciBlbnZzIHN1cHBvcnQgZG9jdW1lbnQuY29va2llXG4gICAgKGZ1bmN0aW9uIHN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHdyaXRlOiBmdW5jdGlvbiB3cml0ZShuYW1lLCB2YWx1ZSwgZXhwaXJlcywgcGF0aCwgZG9tYWluLCBzZWN1cmUpIHtcbiAgICAgICAgICB2YXIgY29va2llID0gW107XG4gICAgICAgICAgY29va2llLnB1c2gobmFtZSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpO1xuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzTnVtYmVyKGV4cGlyZXMpKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnZXhwaXJlcz0nICsgbmV3IERhdGUoZXhwaXJlcykudG9HTVRTdHJpbmcoKSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzU3RyaW5nKHBhdGgpKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgncGF0aD0nICsgcGF0aCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzU3RyaW5nKGRvbWFpbikpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdkb21haW49JyArIGRvbWFpbik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHNlY3VyZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ3NlY3VyZScpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGRvY3VtZW50LmNvb2tpZSA9IGNvb2tpZS5qb2luKCc7ICcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlYWQ6IGZ1bmN0aW9uIHJlYWQobmFtZSkge1xuICAgICAgICAgIHZhciBtYXRjaCA9IGRvY3VtZW50LmNvb2tpZS5tYXRjaChuZXcgUmVnRXhwKCcoXnw7XFxcXHMqKSgnICsgbmFtZSArICcpPShbXjtdKiknKSk7XG4gICAgICAgICAgcmV0dXJuIChtYXRjaCA/IGRlY29kZVVSSUNvbXBvbmVudChtYXRjaFszXSkgOiBudWxsKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZShuYW1lKSB7XG4gICAgICAgICAgdGhpcy53cml0ZShuYW1lLCAnJywgRGF0ZS5ub3coKSAtIDg2NDAwMDAwKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KSgpIDpcblxuICAvLyBOb24gc3RhbmRhcmQgYnJvd3NlciBlbnYgKHdlYiB3b3JrZXJzLCByZWFjdC1uYXRpdmUpIGxhY2sgbmVlZGVkIHN1cHBvcnQuXG4gICAgKGZ1bmN0aW9uIG5vblN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHdyaXRlOiBmdW5jdGlvbiB3cml0ZSgpIHt9LFxuICAgICAgICByZWFkOiBmdW5jdGlvbiByZWFkKCkgeyByZXR1cm4gbnVsbDsgfSxcbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7fVxuICAgICAgfTtcbiAgICB9KSgpXG4pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVGhlIFVSTCB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBYnNvbHV0ZVVSTCh1cmwpIHtcbiAgLy8gQSBVUkwgaXMgY29uc2lkZXJlZCBhYnNvbHV0ZSBpZiBpdCBiZWdpbnMgd2l0aCBcIjxzY2hlbWU+Oi8vXCIgb3IgXCIvL1wiIChwcm90b2NvbC1yZWxhdGl2ZSBVUkwpLlxuICAvLyBSRkMgMzk4NiBkZWZpbmVzIHNjaGVtZSBuYW1lIGFzIGEgc2VxdWVuY2Ugb2YgY2hhcmFjdGVycyBiZWdpbm5pbmcgd2l0aCBhIGxldHRlciBhbmQgZm9sbG93ZWRcbiAgLy8gYnkgYW55IGNvbWJpbmF0aW9uIG9mIGxldHRlcnMsIGRpZ2l0cywgcGx1cywgcGVyaW9kLCBvciBoeXBoZW4uXG4gIHJldHVybiAvXihbYS16XVthLXpcXGRcXCtcXC1cXC5dKjopP1xcL1xcLy9pLnRlc3QodXJsKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBwYXlsb2FkIGlzIGFuIGVycm9yIHRocm93biBieSBBeGlvc1xuICpcbiAqIEBwYXJhbSB7Kn0gcGF5bG9hZCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHBheWxvYWQgaXMgYW4gZXJyb3IgdGhyb3duIGJ5IEF4aW9zLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0F4aW9zRXJyb3IocGF5bG9hZCkge1xuICByZXR1cm4gKHR5cGVvZiBwYXlsb2FkID09PSAnb2JqZWN0JykgJiYgKHBheWxvYWQuaXNBeGlvc0Vycm9yID09PSB0cnVlKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoXG4gIHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkgP1xuXG4gIC8vIFN0YW5kYXJkIGJyb3dzZXIgZW52cyBoYXZlIGZ1bGwgc3VwcG9ydCBvZiB0aGUgQVBJcyBuZWVkZWQgdG8gdGVzdFxuICAvLyB3aGV0aGVyIHRoZSByZXF1ZXN0IFVSTCBpcyBvZiB0aGUgc2FtZSBvcmlnaW4gYXMgY3VycmVudCBsb2NhdGlvbi5cbiAgICAoZnVuY3Rpb24gc3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgdmFyIG1zaWUgPSAvKG1zaWV8dHJpZGVudCkvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuICAgICAgdmFyIHVybFBhcnNpbmdOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgdmFyIG9yaWdpblVSTDtcblxuICAgICAgLyoqXG4gICAgKiBQYXJzZSBhIFVSTCB0byBkaXNjb3ZlciBpdCdzIGNvbXBvbmVudHNcbiAgICAqXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsIFRoZSBVUkwgdG8gYmUgcGFyc2VkXG4gICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgICovXG4gICAgICBmdW5jdGlvbiByZXNvbHZlVVJMKHVybCkge1xuICAgICAgICB2YXIgaHJlZiA9IHVybDtcblxuICAgICAgICBpZiAobXNpZSkge1xuICAgICAgICAvLyBJRSBuZWVkcyBhdHRyaWJ1dGUgc2V0IHR3aWNlIHRvIG5vcm1hbGl6ZSBwcm9wZXJ0aWVzXG4gICAgICAgICAgdXJsUGFyc2luZ05vZGUuc2V0QXR0cmlidXRlKCdocmVmJywgaHJlZik7XG4gICAgICAgICAgaHJlZiA9IHVybFBhcnNpbmdOb2RlLmhyZWY7XG4gICAgICAgIH1cblxuICAgICAgICB1cmxQYXJzaW5nTm9kZS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBocmVmKTtcblxuICAgICAgICAvLyB1cmxQYXJzaW5nTm9kZSBwcm92aWRlcyB0aGUgVXJsVXRpbHMgaW50ZXJmYWNlIC0gaHR0cDovL3VybC5zcGVjLndoYXR3Zy5vcmcvI3VybHV0aWxzXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaHJlZjogdXJsUGFyc2luZ05vZGUuaHJlZixcbiAgICAgICAgICBwcm90b2NvbDogdXJsUGFyc2luZ05vZGUucHJvdG9jb2wgPyB1cmxQYXJzaW5nTm9kZS5wcm90b2NvbC5yZXBsYWNlKC86JC8sICcnKSA6ICcnLFxuICAgICAgICAgIGhvc3Q6IHVybFBhcnNpbmdOb2RlLmhvc3QsXG4gICAgICAgICAgc2VhcmNoOiB1cmxQYXJzaW5nTm9kZS5zZWFyY2ggPyB1cmxQYXJzaW5nTm9kZS5zZWFyY2gucmVwbGFjZSgvXlxcPy8sICcnKSA6ICcnLFxuICAgICAgICAgIGhhc2g6IHVybFBhcnNpbmdOb2RlLmhhc2ggPyB1cmxQYXJzaW5nTm9kZS5oYXNoLnJlcGxhY2UoL14jLywgJycpIDogJycsXG4gICAgICAgICAgaG9zdG5hbWU6IHVybFBhcnNpbmdOb2RlLmhvc3RuYW1lLFxuICAgICAgICAgIHBvcnQ6IHVybFBhcnNpbmdOb2RlLnBvcnQsXG4gICAgICAgICAgcGF0aG5hbWU6ICh1cmxQYXJzaW5nTm9kZS5wYXRobmFtZS5jaGFyQXQoMCkgPT09ICcvJykgP1xuICAgICAgICAgICAgdXJsUGFyc2luZ05vZGUucGF0aG5hbWUgOlxuICAgICAgICAgICAgJy8nICsgdXJsUGFyc2luZ05vZGUucGF0aG5hbWVcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgb3JpZ2luVVJMID0gcmVzb2x2ZVVSTCh3aW5kb3cubG9jYXRpb24uaHJlZik7XG5cbiAgICAgIC8qKlxuICAgICogRGV0ZXJtaW5lIGlmIGEgVVJMIHNoYXJlcyB0aGUgc2FtZSBvcmlnaW4gYXMgdGhlIGN1cnJlbnQgbG9jYXRpb25cbiAgICAqXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gcmVxdWVzdFVSTCBUaGUgVVJMIHRvIHRlc3RcbiAgICAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIFVSTCBzaGFyZXMgdGhlIHNhbWUgb3JpZ2luLCBvdGhlcndpc2UgZmFsc2VcbiAgICAqL1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIGlzVVJMU2FtZU9yaWdpbihyZXF1ZXN0VVJMKSB7XG4gICAgICAgIHZhciBwYXJzZWQgPSAodXRpbHMuaXNTdHJpbmcocmVxdWVzdFVSTCkpID8gcmVzb2x2ZVVSTChyZXF1ZXN0VVJMKSA6IHJlcXVlc3RVUkw7XG4gICAgICAgIHJldHVybiAocGFyc2VkLnByb3RvY29sID09PSBvcmlnaW5VUkwucHJvdG9jb2wgJiZcbiAgICAgICAgICAgIHBhcnNlZC5ob3N0ID09PSBvcmlnaW5VUkwuaG9zdCk7XG4gICAgICB9O1xuICAgIH0pKCkgOlxuXG4gIC8vIE5vbiBzdGFuZGFyZCBicm93c2VyIGVudnMgKHdlYiB3b3JrZXJzLCByZWFjdC1uYXRpdmUpIGxhY2sgbmVlZGVkIHN1cHBvcnQuXG4gICAgKGZ1bmN0aW9uIG5vblN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiBpc1VSTFNhbWVPcmlnaW4oKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfTtcbiAgICB9KSgpXG4pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgbm9ybWFsaXplZE5hbWUpIHtcbiAgdXRpbHMuZm9yRWFjaChoZWFkZXJzLCBmdW5jdGlvbiBwcm9jZXNzSGVhZGVyKHZhbHVlLCBuYW1lKSB7XG4gICAgaWYgKG5hbWUgIT09IG5vcm1hbGl6ZWROYW1lICYmIG5hbWUudG9VcHBlckNhc2UoKSA9PT0gbm9ybWFsaXplZE5hbWUudG9VcHBlckNhc2UoKSkge1xuICAgICAgaGVhZGVyc1tub3JtYWxpemVkTmFtZV0gPSB2YWx1ZTtcbiAgICAgIGRlbGV0ZSBoZWFkZXJzW25hbWVdO1xuICAgIH1cbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbi8vIEhlYWRlcnMgd2hvc2UgZHVwbGljYXRlcyBhcmUgaWdub3JlZCBieSBub2RlXG4vLyBjLmYuIGh0dHBzOi8vbm9kZWpzLm9yZy9hcGkvaHR0cC5odG1sI2h0dHBfbWVzc2FnZV9oZWFkZXJzXG52YXIgaWdub3JlRHVwbGljYXRlT2YgPSBbXG4gICdhZ2UnLCAnYXV0aG9yaXphdGlvbicsICdjb250ZW50LWxlbmd0aCcsICdjb250ZW50LXR5cGUnLCAnZXRhZycsXG4gICdleHBpcmVzJywgJ2Zyb20nLCAnaG9zdCcsICdpZi1tb2RpZmllZC1zaW5jZScsICdpZi11bm1vZGlmaWVkLXNpbmNlJyxcbiAgJ2xhc3QtbW9kaWZpZWQnLCAnbG9jYXRpb24nLCAnbWF4LWZvcndhcmRzJywgJ3Byb3h5LWF1dGhvcml6YXRpb24nLFxuICAncmVmZXJlcicsICdyZXRyeS1hZnRlcicsICd1c2VyLWFnZW50J1xuXTtcblxuLyoqXG4gKiBQYXJzZSBoZWFkZXJzIGludG8gYW4gb2JqZWN0XG4gKlxuICogYGBgXG4gKiBEYXRlOiBXZWQsIDI3IEF1ZyAyMDE0IDA4OjU4OjQ5IEdNVFxuICogQ29udGVudC1UeXBlOiBhcHBsaWNhdGlvbi9qc29uXG4gKiBDb25uZWN0aW9uOiBrZWVwLWFsaXZlXG4gKiBUcmFuc2Zlci1FbmNvZGluZzogY2h1bmtlZFxuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGhlYWRlcnMgSGVhZGVycyBuZWVkaW5nIHRvIGJlIHBhcnNlZFxuICogQHJldHVybnMge09iamVjdH0gSGVhZGVycyBwYXJzZWQgaW50byBhbiBvYmplY3RcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwYXJzZUhlYWRlcnMoaGVhZGVycykge1xuICB2YXIgcGFyc2VkID0ge307XG4gIHZhciBrZXk7XG4gIHZhciB2YWw7XG4gIHZhciBpO1xuXG4gIGlmICghaGVhZGVycykgeyByZXR1cm4gcGFyc2VkOyB9XG5cbiAgdXRpbHMuZm9yRWFjaChoZWFkZXJzLnNwbGl0KCdcXG4nKSwgZnVuY3Rpb24gcGFyc2VyKGxpbmUpIHtcbiAgICBpID0gbGluZS5pbmRleE9mKCc6Jyk7XG4gICAga2V5ID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cigwLCBpKSkudG9Mb3dlckNhc2UoKTtcbiAgICB2YWwgPSB1dGlscy50cmltKGxpbmUuc3Vic3RyKGkgKyAxKSk7XG5cbiAgICBpZiAoa2V5KSB7XG4gICAgICBpZiAocGFyc2VkW2tleV0gJiYgaWdub3JlRHVwbGljYXRlT2YuaW5kZXhPZihrZXkpID49IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGtleSA9PT0gJ3NldC1jb29raWUnKSB7XG4gICAgICAgIHBhcnNlZFtrZXldID0gKHBhcnNlZFtrZXldID8gcGFyc2VkW2tleV0gOiBbXSkuY29uY2F0KFt2YWxdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcnNlZFtrZXldID0gcGFyc2VkW2tleV0gPyBwYXJzZWRba2V5XSArICcsICcgKyB2YWwgOiB2YWw7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gcGFyc2VkO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBTeW50YWN0aWMgc3VnYXIgZm9yIGludm9raW5nIGEgZnVuY3Rpb24gYW5kIGV4cGFuZGluZyBhbiBhcnJheSBmb3IgYXJndW1lbnRzLlxuICpcbiAqIENvbW1vbiB1c2UgY2FzZSB3b3VsZCBiZSB0byB1c2UgYEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseWAuXG4gKlxuICogIGBgYGpzXG4gKiAgZnVuY3Rpb24gZih4LCB5LCB6KSB7fVxuICogIHZhciBhcmdzID0gWzEsIDIsIDNdO1xuICogIGYuYXBwbHkobnVsbCwgYXJncyk7XG4gKiAgYGBgXG4gKlxuICogV2l0aCBgc3ByZWFkYCB0aGlzIGV4YW1wbGUgY2FuIGJlIHJlLXdyaXR0ZW4uXG4gKlxuICogIGBgYGpzXG4gKiAgc3ByZWFkKGZ1bmN0aW9uKHgsIHksIHopIHt9KShbMSwgMiwgM10pO1xuICogIGBgYFxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc3ByZWFkKGNhbGxiYWNrKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKGFycikge1xuICAgIHJldHVybiBjYWxsYmFjay5hcHBseShudWxsLCBhcnIpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGJpbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvYmluZCcpO1xuXG4vKmdsb2JhbCB0b1N0cmluZzp0cnVlKi9cblxuLy8gdXRpbHMgaXMgYSBsaWJyYXJ5IG9mIGdlbmVyaWMgaGVscGVyIGZ1bmN0aW9ucyBub24tc3BlY2lmaWMgdG8gYXhpb3NcblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyB1bmRlZmluZWRcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmFsdWUgaXMgdW5kZWZpbmVkLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVbmRlZmluZWQodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgQnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNCdWZmZXIodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgIWlzVW5kZWZpbmVkKHZhbCkgJiYgdmFsLmNvbnN0cnVjdG9yICE9PSBudWxsICYmICFpc1VuZGVmaW5lZCh2YWwuY29uc3RydWN0b3IpXG4gICAgJiYgdHlwZW9mIHZhbC5jb25zdHJ1Y3Rvci5pc0J1ZmZlciA9PT0gJ2Z1bmN0aW9uJyAmJiB2YWwuY29uc3RydWN0b3IuaXNCdWZmZXIodmFsKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5QnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlcih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZvcm1EYXRhXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gRm9ybURhdGEsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Zvcm1EYXRhKHZhbCkge1xuICByZXR1cm4gKHR5cGVvZiBGb3JtRGF0YSAhPT0gJ3VuZGVmaW5lZCcpICYmICh2YWwgaW5zdGFuY2VvZiBGb3JtRGF0YSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSB2aWV3IG9uIGFuIEFycmF5QnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSB2aWV3IG9uIGFuIEFycmF5QnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlclZpZXcodmFsKSB7XG4gIHZhciByZXN1bHQ7XG4gIGlmICgodHlwZW9mIEFycmF5QnVmZmVyICE9PSAndW5kZWZpbmVkJykgJiYgKEFycmF5QnVmZmVyLmlzVmlldykpIHtcbiAgICByZXN1bHQgPSBBcnJheUJ1ZmZlci5pc1ZpZXcodmFsKTtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQgPSAodmFsKSAmJiAodmFsLmJ1ZmZlcikgJiYgKHZhbC5idWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcik7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFN0cmluZ1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgU3RyaW5nLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTdHJpbmcodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAnc3RyaW5nJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIE51bWJlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgTnVtYmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNOdW1iZXIodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAnbnVtYmVyJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBPYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBPYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0Jztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIHBsYWluIE9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBwbGFpbiBPYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1BsYWluT2JqZWN0KHZhbCkge1xuICBpZiAodG9TdHJpbmcuY2FsbCh2YWwpICE9PSAnW29iamVjdCBPYmplY3RdJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBwcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsKTtcbiAgcmV0dXJuIHByb3RvdHlwZSA9PT0gbnVsbCB8fCBwcm90b3R5cGUgPT09IE9iamVjdC5wcm90b3R5cGU7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBEYXRlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBEYXRlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNEYXRlKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGaWxlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBGaWxlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGaWxlKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGaWxlXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBCbG9iXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBCbG9iLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNCbG9iKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBCbG9iXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGdW5jdGlvblxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRnVuY3Rpb24sIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgU3RyZWFtXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBTdHJlYW0sIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N0cmVhbSh2YWwpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHZhbCkgJiYgaXNGdW5jdGlvbih2YWwucGlwZSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVUkxTZWFyY2hQYXJhbXModmFsKSB7XG4gIHJldHVybiB0eXBlb2YgVVJMU2VhcmNoUGFyYW1zICE9PSAndW5kZWZpbmVkJyAmJiB2YWwgaW5zdGFuY2VvZiBVUkxTZWFyY2hQYXJhbXM7XG59XG5cbi8qKlxuICogVHJpbSBleGNlc3Mgd2hpdGVzcGFjZSBvZmYgdGhlIGJlZ2lubmluZyBhbmQgZW5kIG9mIGEgc3RyaW5nXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0ciBUaGUgU3RyaW5nIHRvIHRyaW1cbiAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBTdHJpbmcgZnJlZWQgb2YgZXhjZXNzIHdoaXRlc3BhY2VcbiAqL1xuZnVuY3Rpb24gdHJpbShzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzKi8sICcnKS5yZXBsYWNlKC9cXHMqJC8sICcnKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgd2UncmUgcnVubmluZyBpbiBhIHN0YW5kYXJkIGJyb3dzZXIgZW52aXJvbm1lbnRcbiAqXG4gKiBUaGlzIGFsbG93cyBheGlvcyB0byBydW4gaW4gYSB3ZWIgd29ya2VyLCBhbmQgcmVhY3QtbmF0aXZlLlxuICogQm90aCBlbnZpcm9ubWVudHMgc3VwcG9ydCBYTUxIdHRwUmVxdWVzdCwgYnV0IG5vdCBmdWxseSBzdGFuZGFyZCBnbG9iYWxzLlxuICpcbiAqIHdlYiB3b3JrZXJzOlxuICogIHR5cGVvZiB3aW5kb3cgLT4gdW5kZWZpbmVkXG4gKiAgdHlwZW9mIGRvY3VtZW50IC0+IHVuZGVmaW5lZFxuICpcbiAqIHJlYWN0LW5hdGl2ZTpcbiAqICBuYXZpZ2F0b3IucHJvZHVjdCAtPiAnUmVhY3ROYXRpdmUnXG4gKiBuYXRpdmVzY3JpcHRcbiAqICBuYXZpZ2F0b3IucHJvZHVjdCAtPiAnTmF0aXZlU2NyaXB0JyBvciAnTlMnXG4gKi9cbmZ1bmN0aW9uIGlzU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICBpZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgKG5hdmlnYXRvci5wcm9kdWN0ID09PSAnUmVhY3ROYXRpdmUnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLnByb2R1Y3QgPT09ICdOYXRpdmVTY3JpcHQnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLnByb2R1Y3QgPT09ICdOUycpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiAoXG4gICAgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnXG4gICk7XG59XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFuIEFycmF5IG9yIGFuIE9iamVjdCBpbnZva2luZyBhIGZ1bmN0aW9uIGZvciBlYWNoIGl0ZW0uXG4gKlxuICogSWYgYG9iamAgaXMgYW4gQXJyYXkgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgcGFzc2luZ1xuICogdGhlIHZhbHVlLCBpbmRleCwgYW5kIGNvbXBsZXRlIGFycmF5IGZvciBlYWNoIGl0ZW0uXG4gKlxuICogSWYgJ29iaicgaXMgYW4gT2JqZWN0IGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIHBhc3NpbmdcbiAqIHRoZSB2YWx1ZSwga2V5LCBhbmQgY29tcGxldGUgb2JqZWN0IGZvciBlYWNoIHByb3BlcnR5LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fEFycmF5fSBvYmogVGhlIG9iamVjdCB0byBpdGVyYXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgY2FsbGJhY2sgdG8gaW52b2tlIGZvciBlYWNoIGl0ZW1cbiAqL1xuZnVuY3Rpb24gZm9yRWFjaChvYmosIGZuKSB7XG4gIC8vIERvbid0IGJvdGhlciBpZiBubyB2YWx1ZSBwcm92aWRlZFxuICBpZiAob2JqID09PSBudWxsIHx8IHR5cGVvZiBvYmogPT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gRm9yY2UgYW4gYXJyYXkgaWYgbm90IGFscmVhZHkgc29tZXRoaW5nIGl0ZXJhYmxlXG4gIGlmICh0eXBlb2Ygb2JqICE9PSAnb2JqZWN0Jykge1xuICAgIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAgIG9iaiA9IFtvYmpdO1xuICB9XG5cbiAgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgIC8vIEl0ZXJhdGUgb3ZlciBhcnJheSB2YWx1ZXNcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IG9iai5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGZuLmNhbGwobnVsbCwgb2JqW2ldLCBpLCBvYmopO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBJdGVyYXRlIG92ZXIgb2JqZWN0IGtleXNcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkge1xuICAgICAgICBmbi5jYWxsKG51bGwsIG9ialtrZXldLCBrZXksIG9iaik7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQWNjZXB0cyB2YXJhcmdzIGV4cGVjdGluZyBlYWNoIGFyZ3VtZW50IHRvIGJlIGFuIG9iamVjdCwgdGhlblxuICogaW1tdXRhYmx5IG1lcmdlcyB0aGUgcHJvcGVydGllcyBvZiBlYWNoIG9iamVjdCBhbmQgcmV0dXJucyByZXN1bHQuXG4gKlxuICogV2hlbiBtdWx0aXBsZSBvYmplY3RzIGNvbnRhaW4gdGhlIHNhbWUga2V5IHRoZSBsYXRlciBvYmplY3QgaW5cbiAqIHRoZSBhcmd1bWVudHMgbGlzdCB3aWxsIHRha2UgcHJlY2VkZW5jZS5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqIGBgYGpzXG4gKiB2YXIgcmVzdWx0ID0gbWVyZ2Uoe2ZvbzogMTIzfSwge2ZvbzogNDU2fSk7XG4gKiBjb25zb2xlLmxvZyhyZXN1bHQuZm9vKTsgLy8gb3V0cHV0cyA0NTZcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmoxIE9iamVjdCB0byBtZXJnZVxuICogQHJldHVybnMge09iamVjdH0gUmVzdWx0IG9mIGFsbCBtZXJnZSBwcm9wZXJ0aWVzXG4gKi9cbmZ1bmN0aW9uIG1lcmdlKC8qIG9iajEsIG9iajIsIG9iajMsIC4uLiAqLykge1xuICB2YXIgcmVzdWx0ID0ge307XG4gIGZ1bmN0aW9uIGFzc2lnblZhbHVlKHZhbCwga2V5KSB7XG4gICAgaWYgKGlzUGxhaW5PYmplY3QocmVzdWx0W2tleV0pICYmIGlzUGxhaW5PYmplY3QodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSBtZXJnZShyZXN1bHRba2V5XSwgdmFsKTtcbiAgICB9IGVsc2UgaWYgKGlzUGxhaW5PYmplY3QodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSBtZXJnZSh7fSwgdmFsKTtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWwuc2xpY2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWw7XG4gICAgfVxuICB9XG5cbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgZm9yRWFjaChhcmd1bWVudHNbaV0sIGFzc2lnblZhbHVlKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEV4dGVuZHMgb2JqZWN0IGEgYnkgbXV0YWJseSBhZGRpbmcgdG8gaXQgdGhlIHByb3BlcnRpZXMgb2Ygb2JqZWN0IGIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGEgVGhlIG9iamVjdCB0byBiZSBleHRlbmRlZFxuICogQHBhcmFtIHtPYmplY3R9IGIgVGhlIG9iamVjdCB0byBjb3B5IHByb3BlcnRpZXMgZnJvbVxuICogQHBhcmFtIHtPYmplY3R9IHRoaXNBcmcgVGhlIG9iamVjdCB0byBiaW5kIGZ1bmN0aW9uIHRvXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSByZXN1bHRpbmcgdmFsdWUgb2Ygb2JqZWN0IGFcbiAqL1xuZnVuY3Rpb24gZXh0ZW5kKGEsIGIsIHRoaXNBcmcpIHtcbiAgZm9yRWFjaChiLCBmdW5jdGlvbiBhc3NpZ25WYWx1ZSh2YWwsIGtleSkge1xuICAgIGlmICh0aGlzQXJnICYmIHR5cGVvZiB2YWwgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGFba2V5XSA9IGJpbmQodmFsLCB0aGlzQXJnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYVtrZXldID0gdmFsO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBhO1xufVxuXG4vKipcbiAqIFJlbW92ZSBieXRlIG9yZGVyIG1hcmtlci4gVGhpcyBjYXRjaGVzIEVGIEJCIEJGICh0aGUgVVRGLTggQk9NKVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZW50IHdpdGggQk9NXG4gKiBAcmV0dXJuIHtzdHJpbmd9IGNvbnRlbnQgdmFsdWUgd2l0aG91dCBCT01cbiAqL1xuZnVuY3Rpb24gc3RyaXBCT00oY29udGVudCkge1xuICBpZiAoY29udGVudC5jaGFyQ29kZUF0KDApID09PSAweEZFRkYpIHtcbiAgICBjb250ZW50ID0gY29udGVudC5zbGljZSgxKTtcbiAgfVxuICByZXR1cm4gY29udGVudDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzQXJyYXk6IGlzQXJyYXksXG4gIGlzQXJyYXlCdWZmZXI6IGlzQXJyYXlCdWZmZXIsXG4gIGlzQnVmZmVyOiBpc0J1ZmZlcixcbiAgaXNGb3JtRGF0YTogaXNGb3JtRGF0YSxcbiAgaXNBcnJheUJ1ZmZlclZpZXc6IGlzQXJyYXlCdWZmZXJWaWV3LFxuICBpc1N0cmluZzogaXNTdHJpbmcsXG4gIGlzTnVtYmVyOiBpc051bWJlcixcbiAgaXNPYmplY3Q6IGlzT2JqZWN0LFxuICBpc1BsYWluT2JqZWN0OiBpc1BsYWluT2JqZWN0LFxuICBpc1VuZGVmaW5lZDogaXNVbmRlZmluZWQsXG4gIGlzRGF0ZTogaXNEYXRlLFxuICBpc0ZpbGU6IGlzRmlsZSxcbiAgaXNCbG9iOiBpc0Jsb2IsXG4gIGlzRnVuY3Rpb246IGlzRnVuY3Rpb24sXG4gIGlzU3RyZWFtOiBpc1N0cmVhbSxcbiAgaXNVUkxTZWFyY2hQYXJhbXM6IGlzVVJMU2VhcmNoUGFyYW1zLFxuICBpc1N0YW5kYXJkQnJvd3NlckVudjogaXNTdGFuZGFyZEJyb3dzZXJFbnYsXG4gIGZvckVhY2g6IGZvckVhY2gsXG4gIG1lcmdlOiBtZXJnZSxcbiAgZXh0ZW5kOiBleHRlbmQsXG4gIHRyaW06IHRyaW0sXG4gIHN0cmlwQk9NOiBzdHJpcEJPTVxufTtcbiIsIi8vIEltcG9ydHNcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fIGZyb20gXCIuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvY3NzV2l0aE1hcHBpbmdUb1N0cmluZy5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyBmcm9tIFwiLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfR0VUX1VSTF9JTVBPUlRfX18gZnJvbSBcIi4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9nZXRVcmwuanNcIjtcbmltcG9ydCBfX19DU1NfTE9BREVSX1VSTF9JTVBPUlRfMF9fXyBmcm9tIFwiLi4vLi4vYXBwL3N0YXRpYy9pbWcvU1ZHL2Fycm93LWRvd24yLnN2Z1wiO1xudmFyIF9fX0NTU19MT0FERVJfRVhQT1JUX19fID0gX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fKF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18pO1xudmFyIF9fX0NTU19MT0FERVJfVVJMX1JFUExBQ0VNRU5UXzBfX18gPSBfX19DU1NfTE9BREVSX0dFVF9VUkxfSU1QT1JUX19fKF9fX0NTU19MT0FERVJfVVJMX0lNUE9SVF8wX19fKTtcbi8vIE1vZHVsZVxuX19fQ1NTX0xPQURFUl9FWFBPUlRfX18ucHVzaChbbW9kdWxlLmlkLCBcIiosXFxuKjo6YWZ0ZXIsXFxuKjo6YmVmb3JlIHtcXG4gIG1hcmdpbjogMDtcXG4gIHBhZGRpbmc6IDA7XFxuICBib3gtc2l6aW5nOiBpbmhlcml0OyB9XFxuXFxuaHRtbCB7XFxuICBmb250LXNpemU6IDYyLjUlOyB9XFxuXFxuYm9keSB7XFxuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbiAgZm9udC1zaXplOiAxLjZyZW07XFxuICBiYWNrZ3JvdW5kLXNpemU6IGNvdmVyO1xcbiAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcXG4gIGhlaWdodDogMTI3LjVyZW07XFxuICBmb250LWZhbWlseTogJ0xhdG8nLCBzYW5zLXNlcmlmO1xcbiAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuXFxuW2hpZGRlbl0ge1xcbiAgZGlzcGxheTogbm9uZSAhaW1wb3J0YW50OyB9XFxuXFxuLmhlYWRpbmctdGVydGlhcnkge1xcbiAgZm9udC1zaXplOiAyLjRyZW07XFxuICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOyB9XFxuICAuaGVhZGluZy10ZXJ0aWFyeS0td2hpdGUge1xcbiAgICBjb2xvcjogI2ZmZjsgfVxcblxcbi5oZWFkaW5nLXByaW1hcnkge1xcbiAgZm9udC1zaXplOiAzcmVtO1xcbiAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcXG4gIGZvbnQtd2VpZ2h0OiAzMDA7XFxuICBjb2xvcjogI2ZmZjsgfVxcblxcbi5tYi0xMCB7XFxuICBtYXJnaW4tYm90dG9tOiAxcmVtOyB9XFxuXFxuLm1iLTIwIHtcXG4gIG1hcmdpbi1ib3R0b206IDJyZW07IH1cXG5cXG4ubXQtNTAge1xcbiAgbWFyZ2luLXRvcDogNXJlbTsgfVxcblxcbi5idG4sIC5idG46bGluaywgLmJ0bjp2aXNpdGVkIHtcXG4gIHBhZGRpbmc6IC43NXJlbSAycmVtO1xcbiAgYm9yZGVyLXJhZGl1czogLjVyZW07XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjJmMmYyO1xcbiAgZm9udC13ZWlnaHQ6IDQwMDtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jazsgfVxcblxcbi5idG46YWN0aXZlLCAuYnRuOmZvY3VzIHtcXG4gIG91dGxpbmU6IG5vbmU7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTFweCk7XFxuICBib3gtc2hhZG93OiAwIDAuNXJlbSAxcmVtIHJnYmEoMCwgMCwgMCwgMC4yKTsgfVxcblxcbi5sb2dpbixcXG4ucmVnaXN0ZXIge1xcbiAgbWluLWhlaWdodDogY2FsYygxMDB2aCAtIDYuMXJlbSk7XFxuICB3aWR0aDogMTAwdnc7XFxuICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQodG8gdG9wLCAjNWY0ZjY2LCAjMzQyMzMyKTtcXG4gIGJhY2tncm91bmQtcmVwZWF0OiBuby1yZXBlYXQ7XFxuICBiYWNrZ3JvdW5kLXNpemU6IGNvdmVyO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfVxcbiAgLmxvZ2luLWltZyxcXG4gIC5yZWdpc3Rlci1pbWcge1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIGJvcmRlci1yYWRpdXM6IDEwMCU7XFxuICAgIGhlaWdodDogOC41cmVtO1xcbiAgICB3aWR0aDogOC41cmVtO1xcbiAgICB0b3A6IC0xNSU7IH1cXG4gIC5sb2dpbl9fZm9ybSxcXG4gIC5yZWdpc3Rlcl9fZm9ybSB7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzFlMmEzODtcXG4gICAgYm9yZGVyOiAycHggc29saWQgIzFlMmEzODtcXG4gICAgYm94LXNoYWRvdzogMHB4IDJweCA1cHggcmdiYSgwLCAwLCAwLCAwLjI1KTtcXG4gICAgbWF4LXdpZHRoOiAzMnJlbTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1mbG93OiBjb2x1bW4gbm93cmFwO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBwYWRkaW5nOiA0cmVtIDAgMi42cmVtIDA7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtMjUlKTsgfVxcbiAgLmxvZ2luX19mb3JtLWluc3RydWN0aW9ucyxcXG4gIC5yZWdpc3Rlcl9fZm9ybS1pbnN0cnVjdGlvbnMge1xcbiAgICBjb2xvcjogI2ZmZjtcXG4gICAgZm9udC1zaXplOiAxLjRyZW07XFxuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcXG4gICAgd2lkdGg6IDkwJTsgfVxcbiAgLmxvZ2luX19mb3JtLWdyb3VwLFxcbiAgLnJlZ2lzdGVyX19mb3JtLWdyb3VwIHtcXG4gICAgd2lkdGg6IDkwJTsgfVxcbiAgLmxvZ2luX19mb3JtLWlucHV0LFxcbiAgLnJlZ2lzdGVyX19mb3JtLWlucHV0IHtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIG1hcmdpbjogMCBhdXRvO1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMik7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMCwgMCwgMC4xKTtcXG4gICAgYm94LXNoYWRvdzogcmdiYSgwLCAwLCAwLCAwLjUpO1xcbiAgICBib3JkZXItcmFkaXVzOiAycHg7XFxuICAgIG1hcmdpbi1ib3R0b206IDFyZW07XFxuICAgIGxpbmUtaGVpZ2h0OiAxLjI1O1xcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICAgIGhlaWdodDogNC4ycmVtO1xcbiAgICBwYWRkaW5nOiAxcmVtIDEuNHJlbTtcXG4gICAgY2FyZXQtY29sb3I6ICNmZmY7XFxuICAgIGNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNzUpOyB9XFxuICAgIC5sb2dpbl9fZm9ybS1pbnB1dDo6cGxhY2Vob2xkZXIsXFxuICAgIC5yZWdpc3Rlcl9fZm9ybS1pbnB1dDo6cGxhY2Vob2xkZXIge1xcbiAgICAgIGZvbnQtd2VpZ2h0OiAzMDA7XFxuICAgICAgY29sb3I6ICNlNmU2ZTY7XFxuICAgICAgZm9udC1zaXplOiAxLjhyZW07IH1cXG4gICAgLmxvZ2luX19mb3JtLWlucHV0OmZvY3VzLFxcbiAgICAucmVnaXN0ZXJfX2Zvcm0taW5wdXQ6Zm9jdXMge1xcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC43NSk7IH1cXG4gIC5sb2dpbl9fZm9ybS1idG4sXFxuICAucmVnaXN0ZXJfX2Zvcm0tYnRuIHtcXG4gICAgd2lkdGg6IDkwJTtcXG4gICAgYm9yZGVyLXJhZGl1czogMnB4O1xcbiAgICBwYWRkaW5nOiAwIDEuNHJlbTtcXG4gICAgbWFyZ2luOiAxcmVtIGF1dG8gMCBhdXRvO1xcbiAgICBib3gtc2hhZG93OiAwIDJweCA1cHggcmdiYSgwLCAwLCAwLCAwLjI1KTtcXG4gICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWFyb3VuZDtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgaGVpZ2h0OiA0LjJyZW07IH1cXG4gICAgLmxvZ2luX19mb3JtLWJ0bi0tbG9naW4sXFxuICAgIC5yZWdpc3Rlcl9fZm9ybS1idG4tLWxvZ2luIHtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuODcpO1xcbiAgICAgIGNvbG9yOiAjMTYxNjFkO1xcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkICNmZmY7IH1cXG4gICAgICAubG9naW5fX2Zvcm0tYnRuLS1sb2dpbjpob3ZlcixcXG4gICAgICAucmVnaXN0ZXJfX2Zvcm0tYnRuLS1sb2dpbjpob3ZlciB7XFxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgICAgICAgY29sb3I6ICMzNDI0NDI7IH1cXG4gICAgICAubG9naW5fX2Zvcm0tYnRuLS1sb2dpbjpob3ZlciAubG9naW5fX2Zvcm0taWNvbi1wYXRoLS1sb2dpbixcXG4gICAgICAucmVnaXN0ZXJfX2Zvcm0tYnRuLS1sb2dpbjpob3ZlciAubG9naW5fX2Zvcm0taWNvbi1wYXRoLS1sb2dpbiB7XFxuICAgICAgICBmaWxsOiAjMzQyNDQyOyB9XFxuICAgICAgLmxvZ2luX19mb3JtLWJ0bi0tbG9naW46OmFmdGVyLFxcbiAgICAgIC5yZWdpc3Rlcl9fZm9ybS1idG4tLWxvZ2luOjphZnRlciB7XFxuICAgICAgICBtYXJnaW4tYm90dG9tOiAxcHggc29saWQgd2hpdGU7IH1cXG4gICAgLmxvZ2luX19mb3JtLWJ0bi0tcmVnaXN0ZXIsXFxuICAgIC5yZWdpc3Rlcl9fZm9ybS1idG4tLXJlZ2lzdGVyIHtcXG4gICAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpO1xcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNSk7XFxuICAgICAgY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC43NSk7IH1cXG4gICAgICAubG9naW5fX2Zvcm0tYnRuLS1yZWdpc3Rlcjpob3ZlcixcXG4gICAgICAucmVnaXN0ZXJfX2Zvcm0tYnRuLS1yZWdpc3Rlcjpob3ZlciB7XFxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMjUpO1xcbiAgICAgICAgY29sb3I6ICNmZmY7IH1cXG4gICAgICAubG9naW5fX2Zvcm0tYnRuLS1yZWdpc3Rlcjpob3ZlciAubG9naW5fX2Zvcm0taWNvbi1wYXRoLS1sb2dpbixcXG4gICAgICAucmVnaXN0ZXJfX2Zvcm0tYnRuLS1yZWdpc3Rlcjpob3ZlciAubG9naW5fX2Zvcm0taWNvbi1wYXRoLS1sb2dpbiB7XFxuICAgICAgICBmaWxsOiAjZmZmOyB9XFxuICAgIC5sb2dpbl9fZm9ybS1idG4gc3BhbixcXG4gICAgLnJlZ2lzdGVyX19mb3JtLWJ0biBzcGFuIHtcXG4gICAgICBtYXJnaW4tcmlnaHQ6IDFyZW07IH1cXG4gIC5sb2dpbl9fZm9ybS1pY29uLFxcbiAgLnJlZ2lzdGVyX19mb3JtLWljb24ge1xcbiAgICBoZWlnaHQ6IDEuNXJlbTtcXG4gICAgd2lkdGg6IDEuNXJlbTtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDE3JSk7IH1cXG4gIC5sb2dpbl9fZm9ybS1pY29uLXBhdGgtLWxvZ2luLFxcbiAgLnJlZ2lzdGVyX19mb3JtLWljb24tcGF0aC0tbG9naW4ge1xcbiAgICBmaWxsOiAjMTYxNjFkOyB9XFxuICAubG9naW5fX2Zvcm0taWNvbi1wYXRoLS1yZWdpc3RlcixcXG4gIC5yZWdpc3Rlcl9fZm9ybS1pY29uLXBhdGgtLXJlZ2lzdGVyIHtcXG4gICAgZmlsbDogI2ZmZjsgfVxcbiAgLmxvZ2luX19mb3JtLWhyLFxcbiAgLnJlZ2lzdGVyX19mb3JtLWhyIHtcXG4gICAgd2lkdGg6IDkwJTtcXG4gICAgbWFyZ2luOiAycmVtIDAgMXJlbSAwO1xcbiAgICBtYXJnaW4tYm90dG9tOiAwLjI1cHggc29saWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjI1KTsgfVxcblxcbi5uYXYge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICBwYWRkaW5nOiAxcmVtIDE2JTtcXG4gIGJhY2tncm91bmQtY29sb3I6ICMyYjI1M2E7XFxuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgIzAwMDsgfVxcbiAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA3MS44NzVlbSkge1xcbiAgICAubmF2IHtcXG4gICAgICBwYWRkaW5nOiAxLjJyZW0gNSU7IH0gfVxcbiAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA0My43NWVtKSB7XFxuICAgIC5uYXYge1xcbiAgICAgIHBhZGRpbmc6IDFyZW07IH0gfVxcbiAgLm5hdl9fbGVmdCB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXg6IDAgMCA1MCU7IH1cXG4gIC5uYXZfX3JpZ2h0IHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgYm9yZGVyLXJpZ2h0OiAxcHggc29saWQgI2ZmZjtcXG4gICAgYm9yZGVyLWxlZnQ6IDFweCBzb2xpZCAjZmZmO1xcbiAgICBwYWRkaW5nLWxlZnQ6IDFyZW07XFxuICAgIG1hcmdpbi1sZWZ0OiBhdXRvOyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogMzcuNWVtKSB7XFxuICAgICAgLm5hdl9fcmlnaHQge1xcbiAgICAgICAgZGlzcGxheTogbm9uZTsgfSB9XFxuICAgIC5uYXZfX3JpZ2h0ID4gKiB7XFxuICAgICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuICAubmF2X19pdGVtLS1zZWFyY2gge1xcbiAgICBmbGV4OiAwIDAgMjUlOyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogMzcuNWVtKSB7XFxuICAgICAgLm5hdl9faXRlbS0tc2VhcmNoIHtcXG4gICAgICAgIGRpc3BsYXk6IG5vbmU7IH0gfVxcbiAgLm5hdl9faXRlbS0taG9tZSB7XFxuICAgIG1hcmdpbi1yaWdodDogM3JlbTsgfVxcbiAgLm5hdl9fbGluayB7XFxuICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gICAgY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC43NSk7XFxuICAgIHRyYW5zaXRpb246IGFsbCAwLjJzOyB9XFxuICAgIC5uYXZfX2xpbms6aG92ZXIge1xcbiAgICAgIG1hcmdpbi1ib3R0b206IDJweDtcXG4gICAgICBjb2xvcjogI2ZmZjtcXG4gICAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2ZmZjsgfVxcbiAgICAubmF2X19saW5rLS1ob21lOmhvdmVyIC5uYXZfX2ljb24tcGF0aC0taG9tZSB7XFxuICAgICAgZmlsbDogI2ZmZjsgfVxcbiAgLm5hdl9fc2VhcmNoIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcbiAgICAubmF2X19zZWFyY2gtaW5wdXQge1xcbiAgICAgIGJvcmRlcjogbm9uZTtcXG4gICAgICBwYWRkaW5nOiAxcmVtIDJyZW07XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzJiMjUzYTtcXG4gICAgICBjYXJldC1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjc1KTtcXG4gICAgICBjb2xvcjogI2ZmZjsgfVxcbiAgICAgIC5uYXZfX3NlYXJjaC1pbnB1dDo6cGxhY2Vob2xkZXIge1xcbiAgICAgICAgY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC43NSk7IH1cXG4gICAgICAubmF2X19zZWFyY2gtaW5wdXQ6Zm9jdXMge1xcbiAgICAgICAgb3V0bGluZTogbm9uZTsgfVxcbiAgICAubmF2X19zZWFyY2gtYnRuIHtcXG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICAgIGxlZnQ6IDJyZW07XFxuICAgICAgdG9wOiAxcmVtOyB9XFxuICAgICAgLm5hdl9fc2VhcmNoLWJ0bjpob3ZlciAubmF2X19pY29uLXBhdGgtLXNlYXJjaCB7XFxuICAgICAgICBmaWxsOiAjZmZmOyB9XFxuICAubmF2X19pY29uLXNpemluZy0taG9tZSB7XFxuICAgIHdpZHRoOiAzcmVtO1xcbiAgICBoZWlnaHQ6IDNyZW07IH1cXG4gIC5uYXZfX2ljb24tc2l6aW5nLS1zZWFyY2gge1xcbiAgICB3aWR0aDogMnJlbTtcXG4gICAgaGVpZ2h0OiAycmVtO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTE1MCUpOyB9XFxuICAubmF2X19pY29uLXBhdGgtLWhvbWUge1xcbiAgICBmaWxsOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNzUpOyB9XFxuICAubmF2X19pY29uLXBhdGgtLXNlYXJjaCB7XFxuICAgIGZpbGw6ICNiZmJmYmY7IH1cXG4gIC5uYXZfX21vYmlsZSB7XFxuICAgIGRpc3BsYXk6IG5vbmU7IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiAzNy41ZW0pIHtcXG4gICAgICAubmF2X19tb2JpbGUge1xcbiAgICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICAgIGZsZXg6IDAgMCA1MCU7XFxuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBlbmQ7IH0gfVxcbiAgICAubmF2X19tb2JpbGUtbGlua3Mge1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICMyYjI1M2E7XFxuICAgICAgZmxleC1mbG93OiB3cmFwO1xcbiAgICAgIHBhZGRpbmc6IDFyZW0gMDtcXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtc3RhcnQ7XFxuICAgICAgZGlzcGxheTogbm9uZTsgfVxcbiAgICAubmF2X19tb2JpbGUtbGluayB7XFxuICAgICAgZmxleDogMCAwIDQ4JTtcXG4gICAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDg1LCAyNiwgMTM5LCAwLjUpO1xcbiAgICAgIGJvcmRlci1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjYpO1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKTtcXG4gICAgICBib3JkZXItcmFkaXVzOiAzcHg7XFxuICAgICAgbWFyZ2luLXRvcDogMC42cmVtO1xcbiAgICAgIG1hcmdpbi1sZWZ0OiAxJTtcXG4gICAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICAgICAgY29sb3I6ICNmZmY7XFxuICAgICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICAgIGxpbmUtaGVpZ2h0OiAxLjQ7XFxuICAgICAgcGFkZGluZzogMC4ycmVtIDFyZW0gMCAxcmVtO1xcbiAgICAgIGhlaWdodDogMi44cmVtO1xcbiAgICAgIHRyYW5zaXRpb246IGFsbCAwLjJzO1xcbiAgICAgIGJveC1zaGFkb3c6IDAgMXB4IDFweCAwIHJnYmEoMCwgMCwgMCwgMC4wNik7XFxuICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgICAgIHRyYW5zaXRpb246IGFsbCAwLjJzOyB9XFxuICAgICAgLm5hdl9fbW9iaWxlLWxpbms6aG92ZXIge1xcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjI1KTsgfVxcbiAgICAubmF2X19tb2JpbGUtaGFtYnVyZ2VyLXdyYXBwZXIge1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgICBtYXJnaW4tcmlnaHQ6IDFyZW07XFxuICAgICAgaGVpZ2h0OiAzcmVtO1xcbiAgICAgIHdpZHRoOiAzcmVtOyB9XFxuICAgIC5uYXZfX21vYmlsZS1oYW1idXJnZXIge1xcbiAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcbiAgICAgIC5uYXZfX21vYmlsZS1oYW1idXJnZXIsIC5uYXZfX21vYmlsZS1oYW1idXJnZXI6OmJlZm9yZSwgLm5hdl9fbW9iaWxlLWhhbWJ1cmdlcjo6YWZ0ZXIge1xcbiAgICAgICAgd2lkdGg6IDNyZW07XFxuICAgICAgICBoZWlnaHQ6IDJweDtcXG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC43NSk7XFxuICAgICAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7IH1cXG4gICAgICAubmF2X19tb2JpbGUtaGFtYnVyZ2VyOjpiZWZvcmUsIC5uYXZfX21vYmlsZS1oYW1idXJnZXI6OmFmdGVyIHtcXG4gICAgICAgIGNvbnRlbnQ6ICcnO1xcbiAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICAgICAgbGVmdDogMDsgfVxcbiAgICAgIC5uYXZfX21vYmlsZS1oYW1idXJnZXI6OmJlZm9yZSB7XFxuICAgICAgICBtYXJnaW4tdG9wOiAtMC44cmVtOyB9XFxuICAgICAgLm5hdl9fbW9iaWxlLWhhbWJ1cmdlcjo6YWZ0ZXIge1xcbiAgICAgICAgbWFyZ2luLXRvcDogMC44cmVtOyB9XFxuXFxuLmVycm9yIHtcXG4gIG1hcmdpbi10b3A6IDJyZW07XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmY4MDgwO1xcbiAgYm9yZGVyLXJhZGl1czogMTBweDtcXG4gIHBhZGRpbmc6IDJyZW07XFxuICBmb250LXNpemU6IDJyZW07XFxuICBncmlkLWNvbHVtbjogY2VudGVyLXN0YXJ0IC8gY2VudGVyLWVuZDtcXG4gIGZvbnQtd2VpZ2h0OiA3MDA7IH1cXG5cXG4uc2VhcmNoLWZvcm0ge1xcbiAgcGFkZGluZzogMnJlbSAyNXJlbTtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZGZkZmQ7XFxuICBtaW4taGVpZ2h0OiBjYWxjKDEwMHZoIC0gNi4ycmVtKTsgfVxcbiAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA4MS4yNWVtKSB7XFxuICAgIC5zZWFyY2gtZm9ybSB7XFxuICAgICAgcGFkZGluZzogMnJlbSAxNXJlbTsgfSB9XFxuICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDYyLjVlbSkge1xcbiAgICAuc2VhcmNoLWZvcm0ge1xcbiAgICAgIHBhZGRpbmc6IDJyZW0gNXJlbTsgfSB9XFxuICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDU2LjI1ZW0pIHtcXG4gICAgLnNlYXJjaC1mb3JtIHtcXG4gICAgICBwYWRkaW5nOiAycmVtIDFyZW07IH0gfVxcbiAgLnNlYXJjaC1mb3JtX19ncm91cCB7XFxuICAgIHdpZHRoOiA3NSU7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIG1hcmdpbi1ib3R0b206IDNyZW07XFxuICAgIGFsaWduLWl0ZW1zOiBmbGV4LXN0YXJ0O1xcbiAgICBwYWRkaW5nOiAwLjVyZW0gNHJlbSAwLjVyZW0gMDtcXG4gICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHJnYmEoMCwgMCwgMCwgMC4yKTsgfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDkzLjc1ZW0pIHtcXG4gICAgICAuc2VhcmNoLWZvcm1fX2dyb3VwIHtcXG4gICAgICAgIHdpZHRoOiAxMDAlOyB9IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA0Ni44NzVlbSkge1xcbiAgICAgIC5zZWFyY2gtZm9ybV9fZ3JvdXAge1xcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgfSB9XFxuICAgIC5zZWFyY2gtZm9ybV9fZ3JvdXA6bnRoLWNoaWxkKDEwKSB7XFxuICAgICAgYm9yZGVyLWJvdHRvbTogbm9uZTsgfVxcbiAgICAuc2VhcmNoLWZvcm1fX2dyb3VwLS1uby1ib3JkZXIge1xcbiAgICAgIGJvcmRlci1ib3R0b206IG5vbmU7IH1cXG4gIC5zZWFyY2gtZm9ybV9fbGFiZWwge1xcbiAgICBmbGV4OiAwIDAgMjAlO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogZmxleC1zdGFydDtcXG4gICAgZm9udC13ZWlnaHQ6IDMwMDtcXG4gICAgbWFyZ2luLXRvcDogMC43cmVtO1xcbiAgICBjb2xvcjogIzU1MWE4YjsgfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDQ2Ljg3NWVtKSB7XFxuICAgICAgLnNlYXJjaC1mb3JtX19sYWJlbCB7XFxuICAgICAgICBtYXJnaW4tYm90dG9tOiAxLjJyZW07XFxuICAgICAgICBtYXJnaW4tbGVmdDogMXJlbTsgfSB9XFxuICAuc2VhcmNoLWZvcm1fX2dyb3VwLWlucHV0LXdyYXBwZXIge1xcbiAgICBmbGV4OiAwIDAgODAlOyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNDYuODc1ZW0pIHtcXG4gICAgICAuc2VhcmNoLWZvcm1fX2dyb3VwLWlucHV0LXdyYXBwZXIge1xcbiAgICAgICAgZmxleDogMCAwIDEwMCU7XFxuICAgICAgICB3aWR0aDogMTAwJTsgfSB9XFxuICAuc2VhcmNoLWZvcm1fX2lucHV0LXdyYXBwZXIge1xcbiAgICBmbGV4OiAwIDAgODAlOyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNDYuODc1ZW0pIHtcXG4gICAgICAuc2VhcmNoLWZvcm1fX2lucHV0LXdyYXBwZXIge1xcbiAgICAgICAgZmxleDogMCAwIDEwMCU7XFxuICAgICAgICB3aWR0aDogMTAwJTsgfSB9XFxuICAuc2VhcmNoLWZvcm1fX3RpcCB7XFxuICAgIGZvbnQtc2l6ZTogMXJlbTtcXG4gICAgbGluZS1oZWlnaHQ6IDEuNDtcXG4gICAgd2lkdGg6IDcwJTsgfVxcbiAgLnNlYXJjaC1mb3JtX19pbnB1dC10ZXh0IHtcXG4gICAgd2lkdGg6IDQwcmVtO1xcbiAgICBoZWlnaHQ6IDRyZW07XFxuICAgIG1hcmdpbi1ib3R0b206IDFyZW07XFxuICAgIHBhZGRpbmc6IDFyZW07XFxuICAgIGJvcmRlcjogc29saWQgMXB4ICNiZmJmYmY7XFxuICAgIGJvcmRlci1yYWRpdXM6IDVweDsgfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDI4LjEyNWVtKSB7XFxuICAgICAgLnNlYXJjaC1mb3JtX19pbnB1dC10ZXh0IHtcXG4gICAgICAgIHdpZHRoOiAzMHJlbTsgfSB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogMjEuODc1ZW0pIHtcXG4gICAgICAuc2VhcmNoLWZvcm1fX2lucHV0LXRleHQge1xcbiAgICAgICAgd2lkdGg6IDIwcmVtOyB9IH1cXG4gICAgLnNlYXJjaC1mb3JtX19pbnB1dC10ZXh0OmZvY3VzIHtcXG4gICAgICBib3JkZXI6IHNvbGlkIDFweCAjMDAwOyB9XFxuICAuc2VhcmNoLWZvcm1fX2lucHV0LWludGVnZXIge1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCAjYWVhZWFlO1xcbiAgICBoZWlnaHQ6IDMuNXJlbTtcXG4gICAgYm9yZGVyLXJhZGl1czogM3B4O1xcbiAgICBwYWRkaW5nLWxlZnQ6IDAuNXJlbTtcXG4gICAgcGFkZGluZy1yaWdodDogMC41cmVtO1xcbiAgICBib3gtc2hhZG93OiAwIDFweCAxcHggMCByZ2JhKDAsIDAsIDAsIDAuMDYpOyB9XFxuICAgIC5zZWFyY2gtZm9ybV9faW5wdXQtaW50ZWdlci0tcmVsYXRpdmUge1xcbiAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDM3LjVlbSkge1xcbiAgICAgIC5zZWFyY2gtZm9ybV9faW5wdXQtaW50ZWdlciB7XFxuICAgICAgICBtYXgtd2lkdGg6IDMwJTsgfSB9XFxuICAuc2VhcmNoLWZvcm1fX2dyb3VwLS1jaGVja2JveCB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIG1hcmdpbi1ib3R0b206IDFyZW07IH1cXG4gIC5zZWFyY2gtZm9ybV9fZ3JvdXAtY29sb3JzLWxlZnQsIC5zZWFyY2gtZm9ybV9fZ3JvdXAtY29sb3JzLXJpZ2h0IHtcXG4gICAgZGlzcGxheTogZmxleDsgfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDgxLjI1ZW0pIHtcXG4gICAgICAuc2VhcmNoLWZvcm1fX2dyb3VwLWNvbG9ycy1sZWZ0LCAuc2VhcmNoLWZvcm1fX2dyb3VwLWNvbG9ycy1yaWdodCB7XFxuICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9IH1cXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogODEuMjVlbSkge1xcbiAgICAuc2VhcmNoLWZvcm1fX2dyb3VwLWNvbG9ycy1sZWZ0IHtcXG4gICAgICBtYXJnaW4tcmlnaHQ6IDNyZW07IH0gfVxcbiAgLnNlYXJjaC1mb3JtX19ncm91cC1yYXJpdHktbGVmdCwgLnNlYXJjaC1mb3JtX19ncm91cC1yYXJpdHktcmlnaHQge1xcbiAgICBkaXNwbGF5OiBmbGV4OyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogMjguMTI1ZW0pIHtcXG4gICAgICAuc2VhcmNoLWZvcm1fX2dyb3VwLXJhcml0eS1sZWZ0LCAuc2VhcmNoLWZvcm1fX2dyb3VwLXJhcml0eS1yaWdodCB7XFxuICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9IH1cXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogODEuMjVlbSkge1xcbiAgICAuc2VhcmNoLWZvcm1fX2dyb3VwLXJhcml0eS1sZWZ0IHtcXG4gICAgICBtYXJnaW4tcmlnaHQ6IDNyZW07IH0gfVxcbiAgLnNlYXJjaC1mb3JtX19sYWJlbC0tY2hlY2tib3gge1xcbiAgICBtYXJnaW4tcmlnaHQ6IDFyZW07IH1cXG4gIC5zZWFyY2gtZm9ybV9faW5wdXQtY2hlY2tib3gge1xcbiAgICB3aWR0aDogMi4yNXJlbTtcXG4gICAgaGVpZ2h0OiAyLjI1cmVtO1xcbiAgICBtYXJnaW4tcmlnaHQ6IDAuOHJlbTsgfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDkzLjc1ZW0pIHtcXG4gICAgICAuc2VhcmNoLWZvcm1fX2lucHV0LWNoZWNrYm94IHtcXG4gICAgICAgIG1hcmdpbi1ib3R0b206IDAuM3JlbTsgfSB9XFxuICAuc2VhcmNoLWZvcm1fX2NoZWNrYm94LXdyYXBwZXIge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAuc2VhcmNoLWZvcm1fX3NlbGVjdC1tZW51IHtcXG4gICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcXG4gICAgY29sb3I6ICMzNDMyNDI7XFxuICAgIG1hcmdpbi1yaWdodDogMXJlbTtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgI2FlYWVhZTtcXG4gICAgYm9yZGVyLXJhZGl1czogM3B4O1xcbiAgICBib3gtc2hhZG93OiAwIDFweCAxcHggMCByZ2JhKDAsIDAsIDAsIDAuMDYpO1xcbiAgICBwYWRkaW5nOiAwIDIuMnJlbSAwIDAuNXJlbTtcXG4gICAgaGVpZ2h0OiAzLjRyZW07XFxuICAgIGZvbnQtc2l6ZTogMS40cmVtO1xcbiAgICB0ZXh0LWluZGVudDogMDtcXG4gICAgLXdlYmtpdC1hcHBlYXJhbmNlOiBub25lO1xcbiAgICAtbW96LWFwcGVhcmFuY2U6IG5vbmU7XFxuICAgIHRleHQtb3ZlcmZsb3c6ICcnO1xcbiAgICBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXCIgKyBfX19DU1NfTE9BREVSX1VSTF9SRVBMQUNFTUVOVF8wX19fICsgXCIpO1xcbiAgICBiYWNrZ3JvdW5kLXJlcGVhdDogbm8tcmVwZWF0O1xcbiAgICBiYWNrZ3JvdW5kLXBvc2l0aW9uOiByaWdodCAwLjhyZW0gY2VudGVyO1xcbiAgICBiYWNrZ3JvdW5kLXNpemU6IDEuMnJlbSAxcmVtO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmOyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogODEuMjVlbSkge1xcbiAgICAgIC5zZWFyY2gtZm9ybV9fc2VsZWN0LW1lbnUge1xcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAwLjNyZW07IH0gfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDM3LjVlbSkge1xcbiAgICAgIC5zZWFyY2gtZm9ybV9fc2VsZWN0LW1lbnUtLTIge1xcbiAgICAgICAgbWF4LXdpZHRoOiA0OSU7IH0gfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDM3LjVlbSkge1xcbiAgICAgIC5zZWFyY2gtZm9ybV9fc2VsZWN0LW1lbnUtLTMge1xcbiAgICAgICAgbWF4LXdpZHRoOiAzMiU7IH0gfVxcbiAgLnNlYXJjaC1mb3JtX19zdmctc2l6ZSB7XFxuICAgIGhlaWdodDogMnJlbTtcXG4gICAgd2lkdGg6IDJyZW07XFxuICAgIG1hcmdpbi1yaWdodDogMXJlbTsgfVxcbiAgLnNlYXJjaC1mb3JtX19zdmctY29sb3Ige1xcbiAgICBmaWxsOiAjNTUxYThiOyB9XFxuICAuc2VhcmNoLWZvcm1fX3N1Ym1pdC13cmFwcGVyIHtcXG4gICAgcG9zaXRpb246IHN0aWNreTtcXG4gICAgYm90dG9tOiAwO1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgbWFyZ2luLWJvdHRvbTogM3JlbTtcXG4gICAgYm9yZGVyLXRvcDogMXB4IHNvbGlkIHJnYmEoMCwgMCwgMCwgMC4yKTtcXG4gICAgYWxpZ24taXRlbXM6IGZsZXgtc3RhcnQ7XFxuICAgIHBhZGRpbmc6IDEuNXJlbSA0cmVtIDEuNXJlbSAwO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmRmZGZkO1xcbiAgICB6LWluZGV4OiAxOyB9XFxuICAuc2VhcmNoLWZvcm1fX3N1Ym1pdCB7XFxuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgcGFkZGluZzogMC43cmVtO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjlmN2Y1O1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDg1LCAyNiwgMTM5LCAwLjUpO1xcbiAgICBjb2xvcjogIzU1MWE4YjtcXG4gICAgZm9udC13ZWlnaHQ6IDUwMDtcXG4gICAgdHJhbnNpdGlvbjogYWxsIDAuMnM7XFxuICAgIG1hcmdpbi1sZWZ0OiAyMCU7IH1cXG4gICAgLnNlYXJjaC1mb3JtX19zdWJtaXQ6aG92ZXIge1xcbiAgICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmOyB9XFxuICAuc2VhcmNoLWZvcm1fX2Ryb3Bkb3duLXNwYW4ge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9XFxuICAuc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLCAuc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXNldHMge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgICBsaXN0LXN0eWxlOiBub25lO1xcbiAgICBtYXJnaW4tYm90dG9tOiAwLjNyZW07IH1cXG4gIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtbGlzdC1pdGVtLCAuc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXNldHMtbGlzdC1pdGVtIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgbWFyZ2luLWJvdHRvbTogMC43cmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLXJlbW92ZS1idG4sIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtc2V0cy1yZW1vdmUtYnRuIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgaGVpZ2h0OiAycmVtO1xcbiAgICB3aWR0aDogMnJlbTtcXG4gICAgZm9udC1zaXplOiAxLjNyZW07XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmMmYyZjI7XFxuICAgIG1hcmdpbi1yaWdodDogMC43cmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLXRvZ2dsZXIge1xcbiAgICBoZWlnaHQ6IDJyZW07XFxuICAgIHdpZHRoOiAyLjc1cmVtO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICBmb250LXNpemU6IDEuM3JlbTtcXG4gICAgbWFyZ2luLXJpZ2h0OiAwLjdyZW07IH1cXG4gICAgLnNlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy10b2dnbGVyLS1pcyB7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzQ3ZDE0NzsgfVxcbiAgICAuc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLXRvZ2dsZXItLW5vdCB7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmMDAwMDsgfVxcbiAgLnNlYXJjaC1mb3JtX19kcm9wZG93biB7XFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgbWF4LWhlaWdodDogMjhyZW07XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxuICAgIHotaW5kZXg6IDI7XFxuICAgIHRvcDogMTAwJTtcXG4gICAgd2lkdGg6IDQwcmVtO1xcbiAgICBtYXJnaW4tdG9wOiAtMXJlbTtcXG4gICAgb3ZlcmZsb3cteTogYXV0bztcXG4gICAgYm9yZGVyOiAxcHggc29saWQgIzAwMDsgfVxcbiAgICAuc2VhcmNoLWZvcm1fX2Ryb3Bkb3duLWxpc3Qge1xcbiAgICAgIGxpc3Qtc3R5bGU6IG5vbmU7IH1cXG4gICAgICAuc2VhcmNoLWZvcm1fX2Ryb3Bkb3duLWxpc3QtY2F0ZWdvcnkge1xcbiAgICAgICAgcGFkZGluZzogMC41cmVtOyB9XFxuICAgICAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0LW9wdGlvbiB7XFxuICAgICAgICBwYWRkaW5nOiAwLjNyZW0gMnJlbTtcXG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAgICAgICAuc2VhcmNoLWZvcm1fX2Ryb3Bkb3duLWxpc3Qtb3B0aW9uOmhvdmVyIHtcXG4gICAgICAgICAgY3Vyc29yOiBwb2ludGVyOyB9XFxuICAgICAgICAuc2VhcmNoLWZvcm1fX2Ryb3Bkb3duLWxpc3Qtb3B0aW9uLS1oaWdobGlnaHRlZCB7XFxuICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6ICNjY2Q4ZmY7IH1cXG4gICAgICAgIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1vcHRpb24gc3BhbiB7XFxuICAgICAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICAgICAgICAgIG1hcmdpbi1sZWZ0OiAxcmVtOyB9XFxuICAgICAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0LWltZyB7XFxuICAgICAgICB3aWR0aDogMnJlbTtcXG4gICAgICAgIGhlaWdodDogMnJlbTtcXG4gICAgICAgIG1hcmdpbi1yaWdodDogMC43cmVtOyB9XFxuXFxuLmRyb3Bkb3duLXdyYXBwZXIge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuXFxuLmludi1zZWFyY2gtcHJpY2UtbXNnIHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIGJvdHRvbTogMDtcXG4gIHJpZ2h0OiAwO1xcbiAgY29sb3I6IHJlZDsgfVxcblxcbi5yZWxhdGl2ZSB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7IH1cXG5cXG4uYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2IHtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmM2Y1Zjg7XFxuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgcmdiYSg5OSwgNjgsIDE1MCwgMC4xKTtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcXG4gIHBhZGRpbmc6IDEuMnJlbSAxNiU7XFxuICBtYXJnaW4tYm90dG9tOiAwLjFyZW07XFxuICBoZWlnaHQ6IDUuMnJlbTsgfVxcbiAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA3MS44NzVlbSkge1xcbiAgICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2IHtcXG4gICAgICBwYWRkaW5nOiAxLjJyZW0gNSU7IH0gfVxcbiAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA1My4xMjVlbSkge1xcbiAgICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2IHtcXG4gICAgICBkaXNwbGF5OiBub25lOyB9IH1cXG4gIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtc2VsZWN0IHtcXG4gICAgY29sb3I6ICNiMzAwYjM7XFxuICAgIG1hcmdpbi1yaWdodDogMXJlbTtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSg4NSwgMjYsIDEzOSwgMC41KTtcXG4gICAgYm9yZGVyLXJhZGl1czogM3B4O1xcbiAgICBib3gtc2hhZG93OiAwIDFweCAxcHggMCByZ2JhKDAsIDAsIDAsIDAuMDYpO1xcbiAgICBwYWRkaW5nOiAwLjFyZW0gMi4ycmVtIDAgMC41cmVtO1xcbiAgICBjb2xvcjogIzU1MWE4YjtcXG4gICAgaGVpZ2h0OiAyLjhyZW07XFxuICAgIGZvbnQtc2l6ZTogMS40cmVtO1xcbiAgICB0ZXh0LWluZGVudDogMDtcXG4gICAgLXdlYmtpdC1hcHBlYXJhbmNlOiBub25lO1xcbiAgICAtbW96LWFwcGVhcmFuY2U6IG5vbmU7XFxuICAgIHRleHQtb3ZlcmZsb3c6ICcnO1xcbiAgICBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXCIgKyBfX19DU1NfTE9BREVSX1VSTF9SRVBMQUNFTUVOVF8wX19fICsgXCIpO1xcbiAgICBiYWNrZ3JvdW5kLXJlcGVhdDogbm8tcmVwZWF0O1xcbiAgICBiYWNrZ3JvdW5kLXBvc2l0aW9uOiByaWdodCAwLjhyZW0gY2VudGVyO1xcbiAgICBiYWNrZ3JvdW5kLXNpemU6IDEuMnJlbSAxcmVtOyB9XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtc2VsZWN0OmhvdmVyIHtcXG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjsgfVxcbiAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1sYWJlbCB7XFxuICAgIGNvbG9yOiAjNTUxYThiOyB9XFxuICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LWJ0biB7XFxuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2Y5ZjdmNTtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSg4NSwgMjYsIDEzOSwgMC41KTtcXG4gICAgY29sb3I6ICM1NTFhOGI7XFxuICAgIGZvbnQtd2VpZ2h0OiA1MDA7XFxuICAgIHRyYW5zaXRpb246IGFsbCAwLjJzO1xcbiAgICBoZWlnaHQ6IDIuOHJlbTtcXG4gICAgcGFkZGluZzogMC4xcmVtIDAuN3JlbSAwIDAuN3JlbTtcXG4gICAgZm9udC1zaXplOiAxLjRyZW07XFxuICAgIG1hcmdpbjogYXV0byAwO1xcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICAgIGJveC1zaGFkb3c6IDAgMXB4IDFweCAwIHJnYmEoMCwgMCwgMCwgMC4wNik7IH1cXG4gICAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1idG46aG92ZXIge1xcbiAgICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmOyB9XFxuICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXJpZ2h0IHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfVxcbiAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1wYWdpbmF0aW9uLWNvbnRhaW5lciB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmOWY3ZjU7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoODUsIDI2LCAxMzksIDAuNSk7XFxuICAgIGNvbG9yOiAjNTUxYThiO1xcbiAgICBwYWRkaW5nOiAwLjJyZW0gMC43cmVtO1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgIGhlaWdodDogMi44cmVtO1xcbiAgICBib3gtc2hhZG93OiAwIDFweCAxcHggMCByZ2JhKDAsIDAsIDAsIDAuMDYpOyB9XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtcGFnaW5hdGlvbi1jb250YWluZXI6bm90KDpsYXN0LWNoaWxkKSB7XFxuICAgICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtcGFnaW5hdGlvbi1jb250YWluZXI6bnRoLWNoaWxkKDIpIHN2ZyB7XFxuICAgICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtcGFnaW5hdGlvbi1jb250YWluZXI6bnRoLWNoaWxkKDMpIHN2ZyB7XFxuICAgICAgbWFyZ2luLWxlZnQ6IDFyZW07IH1cXG4gICAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1wYWdpbmF0aW9uLWNvbnRhaW5lci0tZGlzYWJsZWQge1xcbiAgICAgIGN1cnNvcjogbm90LWFsbG93ZWQ7XFxuICAgICAgY29sb3I6IHJnYmEoMCwgMCwgMCwgMC4yNSk7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2Y1ZjZmNzsgfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDMxLjVlbSkge1xcbiAgICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtcGFnaW5hdGlvbi1jb250YWluZXIge1xcbiAgICAgICAgbWFyZ2luOiAwOyB9IH1cXG4gIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtc3ZnLXNpemUge1xcbiAgICBoZWlnaHQ6IDJyZW07XFxuICAgIHdpZHRoOiAycmVtOyB9XFxuICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXN2Zy1jb2xvciB7XFxuICAgIGZpbGw6ICM1NTFhOGI7IH1cXG5cXG4uYXBpLXJlc3VsdHMtZGlzcGxheV9fZGlzcGxheS1iYXIge1xcbiAgd2lkdGg6IDEwMCU7XFxuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgcmdiYSg5OSwgNjgsIDE1MCwgMC4xKTtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmNmY0ZmE7XFxuICBjb2xvcjogIzUzNTM1MztcXG4gIHBhZGRpbmctbGVmdDogMTYlO1xcbiAgbWFyZ2luLWJvdHRvbTogMnJlbTtcXG4gIGhlaWdodDogMi4xcmVtOyB9XFxuICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDcxLjg3NWVtKSB7XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19kaXNwbGF5LWJhciB7XFxuICAgICAgcGFkZGluZy1sZWZ0OiA1JTsgfSB9XFxuXFxuLmFwaS1yZXN1bHRzLWRpc3BsYXlfX21vYmlsZSB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjNmNWY4O1xcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHJnYmEoOTksIDY4LCAxNTAsIDAuMSk7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxuICBtYXJnaW4tYm90dG9tOiAwLjFyZW07XFxuICBoZWlnaHQ6IDUuMnJlbTtcXG4gIGRpc3BsYXk6IG5vbmU7IH1cXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNTMuMTI1ZW0pIHtcXG4gICAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX21vYmlsZSB7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBwYWRkaW5nOiAxLjJyZW0gNSU7IH0gfVxcbiAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiAzMS41ZW0pIHtcXG4gICAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX21vYmlsZSB7XFxuICAgICAgcGFkZGluZzogMS4ycmVtOyB9IH1cXG4gIC5hcGktcmVzdWx0cy1kaXNwbGF5X19tb2JpbGUtc3ZnLXNpemUge1xcbiAgICB3aWR0aDogMS40cmVtO1xcbiAgICBoZWlnaHQ6IDEuNHJlbTsgfVxcblxcbi5hcGktcmVzdWx0cy1kaXNwbGF5X19tb2JpbGUtZGlzcGxheS1vcHRpb25zIHtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmM2Y1Zjg7XFxuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgcmdiYSg5OSwgNjgsIDE1MCwgMC4xKTtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICBhbGlnbi1pdGVtczogZmxleC1zdGFydDtcXG4gIHBhZGRpbmc6IDEuMnJlbSAwO1xcbiAgZGlzcGxheTogbm9uZTsgfVxcblxcbi5hcGktcmVzdWx0cy1kaXNwbGF5X19tb2JpbGUtZGlzcGxheS1vcHRpb25zLWdyb3VwIHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxuICB3aWR0aDogNDUlO1xcbiAgbWFyZ2luOiAwIGF1dG8gMXJlbSBhdXRvOyB9XFxuICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDUxLjU2MjVlbSkge1xcbiAgICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbW9iaWxlLWRpc3BsYXktb3B0aW9ucy1ncm91cCB7XFxuICAgICAgd2lkdGg6IDYwJTsgfSB9XFxuICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDM3LjVlbSkge1xcbiAgICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbW9iaWxlLWRpc3BsYXktb3B0aW9ucy1ncm91cCB7XFxuICAgICAgd2lkdGg6IDgwJTsgfSB9XFxuICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDI4LjEyNWVtKSB7XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19tb2JpbGUtZGlzcGxheS1vcHRpb25zLWdyb3VwIHtcXG4gICAgICB3aWR0aDogOTUlOyB9IH1cXG4gIC5hcGktcmVzdWx0cy1kaXNwbGF5X19tb2JpbGUtZGlzcGxheS1vcHRpb25zLWdyb3VwIGxhYmVsIHtcXG4gICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuXFxuLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1zZWxlY3QtLW1vYmlsZSB7XFxuICB3aWR0aDogMjRyZW07IH1cXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogMjEuODc1ZW0pIHtcXG4gICAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1zZWxlY3QtLW1vYmlsZSB7XFxuICAgICAgd2lkdGg6IDE2cmVtOyB9IH1cXG5cXG4uYXBpLXJlc3VsdHMtbW9iaWxlLWRpc3BsYXktYnRuIHtcXG4gIGFsaWduLXNlbGY6IGNlbnRlcjsgfVxcblxcbi53cmFwcGVyIHtcXG4gIG92ZXJmbG93LXg6IHNjcm9sbDtcXG4gIG92ZXJmbG93LXk6IGhpZGRlbjtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIGRpc3BsYXk6IGZsZXg7IH1cXG5cXG4uY2FyZC1jaGVja2xpc3Qge1xcbiAgd2lkdGg6IDY4JTtcXG4gIGp1c3RpZnktc2VsZjogY2VudGVyOyB9XFxuICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDcxLjg3NWVtKSB7XFxuICAgIC5jYXJkLWNoZWNrbGlzdCB7XFxuICAgICAgd2lkdGg6IDkwJTsgfSB9XFxuICAuY2FyZC1jaGVja2xpc3RfX3JvdyB7XFxuICAgIGRpc3BsYXk6IGdyaWQ7XFxuICAgIGhlaWdodDogM3JlbTsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX3Jvdy0tNyB7XFxuICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiAxMCUgMjIuNSUgMTAlIDE3LjUlIDE1JSAxNSUgMTAlOyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fcm93LS05IHtcXG4gICAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCg5LCAxZnIpOyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fcm93LS1oZWFkZXIge1xcbiAgICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjMDAwO1xcbiAgICAgIGNvbG9yOiAjNTMxYThiO1xcbiAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICAgICAgZm9udC1zaXplOiAxLjJyZW0gIWltcG9ydGFudDtcXG4gICAgICBmb250LXdlaWdodDogMjAwICFpbXBvcnRhbnQ7IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19yb3ctLWdyZXkge1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmMmYyZjI7IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19yb3c6bnRoLWNoaWxkKGV2ZW4pIHtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjJmMmYyOyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fcm93LS1oZWFkZXIge1xcbiAgICAgIGhlaWdodDogMy41cmVtOyB9XFxuICAuY2FyZC1jaGVja2xpc3RfX2RhdGEge1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC13cmFwOiBub3dyYXA7XFxuICAgIGp1c3RpZnktY29udGVudDogZmxleC1zdGFydDtcXG4gICAgZm9udC1zaXplOiAxLjRyZW07IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19kYXRhLS1zZXQge1xcbiAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICAgICAgcGFkZGluZy1sZWZ0OiAwLjVyZW07IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19kYXRhLS1uYW1lIHtcXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtc3RhcnQ7IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19kYXRhLS1yYXJpdHkge1xcbiAgICAgIHRleHQtdHJhbnNmb3JtOiBjYXBpdGFsaXplOyB9XFxuICAuY2FyZC1jaGVja2xpc3RfX2RhdGEtbGluayB7XFxuICAgIHBhZGRpbmc6IDFyZW0gMDtcXG4gICAgZGlzcGxheTogYmxvY2s7XFxuICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGNvbG9yOiAjMDAwO1xcbiAgICB3aGl0ZS1zcGFjZTogbm93cmFwO1xcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xcbiAgICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpczsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX2RhdGEtbGluay0tcHJpY2Uge1xcbiAgICAgIGNvbG9yOiAjMDA2ODg1OyB9XFxuXFxuLnRvb2x0aXAge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgei1pbmRleDogNTtcXG4gIHdpZHRoOiAyNHJlbTtcXG4gIGhlaWdodDogMzRyZW07IH1cXG4gIC50b29sdGlwX19pbWcge1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgaGVpZ2h0OiAxMDAlOyB9XFxuXFxuLm5lZ2F0aXZlLWVhcm5pbmdzIHtcXG4gIGNvbG9yOiByZWQ7IH1cXG5cXG4ucG9zaXRpdmUtZWFybmluZ3Mge1xcbiAgY29sb3I6IGdyZWVuOyB9XFxuXFxuLmltYWdlLWdyaWQge1xcbiAgcGFkZGluZzogN3JlbSAxNiU7XFxuICBkaXNwbGF5OiBncmlkO1xcbiAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoYXV0by1maXQsIG1pbm1heCgyNXJlbSwgMWZyKSk7XFxuICBncmlkLWNvbHVtbi1nYXA6IDJyZW07XFxuICBncmlkLXJvdy1nYXA6IDFyZW07IH1cXG4gIC5pbWFnZS1ncmlkX19vdXRlci1kaXYge1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7IH1cXG4gIC5pbWFnZS1ncmlkX19pbm5lci1kaXYge1xcbiAgICBwZXJzcGVjdGl2ZTogMTUwcmVtO1xcbiAgICBoZWlnaHQ6IDM0cmVtO1xcbiAgICB3aWR0aDogMjRyZW07IH1cXG4gIC5pbWFnZS1ncmlkX19kb3VibGUge1xcbiAgICBoZWlnaHQ6IDM0cmVtO1xcbiAgICB3aWR0aDogMjRyZW07XFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgdG9wOiAwO1xcbiAgICBsZWZ0OiAwO1xcbiAgICBiYWNrZmFjZS12aXNpYmlsaXR5OiBoaWRkZW47XFxuICAgIG92ZXJmbG93OiBoaWRkZW47XFxuICAgIHRyYW5zaXRpb246IGFsbCAwLjhzIGVhc2U7IH1cXG4gICAgLmltYWdlLWdyaWRfX2RvdWJsZS0tYmFjayB7XFxuICAgICAgdHJhbnNmb3JtOiByb3RhdGVZKDE4MGRlZyk7IH1cXG4gIC5pbWFnZS1ncmlkX19kb3VibGUtYnRuIHtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICB0b3A6IDI2JTtcXG4gICAgbGVmdDogNzUlO1xcbiAgICB3aWR0aDogNC40cmVtO1xcbiAgICBoZWlnaHQ6IDQuNHJlbTtcXG4gICAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNik7XFxuICAgIGJvcmRlcjogMnB4IHNvbGlkICMzNDI0NDI7XFxuICAgIHRyYW5zaXRpb246IGFsbCAwLjJzO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfVxcbiAgICAuaW1hZ2UtZ3JpZF9fZG91YmxlLWJ0bjpob3ZlciB7XFxuICAgICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmZmY7IH1cXG4gIC5pbWFnZS1ncmlkX19kb3VibGUtYnRuLXN2ZyB7XFxuICAgIGhlaWdodDogMi41cmVtO1xcbiAgICB3aWR0aDogMi41cmVtO1xcbiAgICBwb2ludGVyLWV2ZW50czogbm9uZTsgfVxcbiAgLmltYWdlLWdyaWRfX2RvYnVsZS1idG4tc3ZnLWNvbG9yIHtcXG4gICAgY29sb3I6ICMxNjE2MWQ7IH1cXG4gIC5pbWFnZS1ncmlkX19jb250YWluZXIge1xcbiAgICB3aWR0aDogMjRyZW07XFxuICAgIGhlaWdodDogMzRyZW07IH1cXG4gIC5pbWFnZS1ncmlkX19pbWFnZSB7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBoZWlnaHQ6IDEwMCU7IH1cXG5cXG4uY2FyZCB7XFxuICB3aWR0aDogMTAwJTtcXG4gIHBhZGRpbmc6IDAgMTYlO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIG1hcmdpbi10b3A6IDNyZW07XFxuICBwYWRkaW5nLWJvdHRvbTogMC43cmVtO1xcbiAgYm9yZGVyLWJvdHRvbTogMXB4IGRhc2hlZCByZ2JhKDAsIDAsIDAsIDAuNyk7IH1cXG4gIC5jYXJkX19pbWctY29udGFpbmVyIHtcXG4gICAgei1pbmRleDogMjtcXG4gICAgYm9yZGVyLXJhZGl1czogMTAwJTsgfVxcbiAgLmNhcmRfX2ltZyB7XFxuICAgIHdpZHRoOiAzM3JlbTtcXG4gICAgaGVpZ2h0OiA0NnJlbTtcXG4gICAgYm94LXNoYWRvdzogMXB4IDFweCA4cHggcmdiYSgwLCAwLCAwLCAwLjUpO1xcbiAgICBib3JkZXItcmFkaXVzOiA0Ljc1JSAvIDMuNSU7IH1cXG4gIC5jYXJkX19pbWctbGVmdCB7XFxuICAgIHdpZHRoOiAzM3JlbTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gICAgei1pbmRleDogMjsgfVxcbiAgLmNhcmRfX2ltZy1idG4ge1xcbiAgICBhbGlnbi1zZWxmOiBjZW50ZXI7XFxuICAgIG1hcmdpbi10b3A6IDFyZW07XFxuICAgIGhlaWdodDogMi44cmVtO1xcbiAgICBmb250LXNpemU6IDEuNHJlbTtcXG4gICAgbGluZS1oZWlnaHQ6IDEuODtcXG4gICAgY29sb3I6ICM1NTFhOGI7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmOWY3ZjU7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoODUsIDI2LCAxMzksIDAuNSk7XFxuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgYm94LXNoYWRvdzogMCAxcHggMCByZ2JhKDAsIDAsIDAsIDAuMDYpO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgMC4ycztcXG4gICAgcGFkZGluZzogMC4ycmVtIDAuNXJlbTtcXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAgIC5jYXJkX19pbWctYnRuOmhvdmVyIHtcXG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gICAgICBib3JkZXItY29sb3I6ICM2MzQ0OTY7IH1cXG4gIC5jYXJkX19pbWctc3ZnIHtcXG4gICAgaGVpZ2h0OiAxLjRyZW07XFxuICAgIHdpZHRoOiAxLjRyZW07XFxuICAgIG1hcmdpbi1yaWdodDogMC4zcmVtO1xcbiAgICBwb2ludGVyLWV2ZW50czogbm9uZTsgfVxcbiAgLmNhcmRfX2ltZy1zdmctY29sb3Ige1xcbiAgICBmaWxsOiAjNTUxYThiOyB9XFxuICAuY2FyZF9faW1nLWRvdWJsZS1hcmVhIHtcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuICAuY2FyZF9faW1nLWRvdWJsZS1zaWRlZCB7XFxuICAgIHBlcnNwZWN0aXZlOiAxNTByZW07XFxuICAgIGhlaWdodDogNDZyZW07IH1cXG4gIC5jYXJkX19pbWctZG91YmxlIHtcXG4gICAgd2lkdGg6IDMzcmVtO1xcbiAgICBoZWlnaHQ6IDQ2cmVtO1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIHRvcDogMDtcXG4gICAgbGVmdDogMDtcXG4gICAgYmFja2ZhY2UtdmlzaWJpbGl0eTogaGlkZGVuO1xcbiAgICBvdmVyZmxvdzogaGlkZGVuOyB9XFxuICAgIC5jYXJkX19pbWctZG91YmxlLS1iYWNrIHtcXG4gICAgICB0cmFuc2Zvcm06IHJvdGF0ZVkoMTgwZGVnKTsgfVxcbiAgLmNhcmRfX3RleHQge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgICBib3JkZXItcmFkaXVzOiA0cHg7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMCwgMCwgMCwgMC4yNSk7XFxuICAgIGJvcmRlci10b3A6IDNweCBzb2xpZCAjMDAwO1xcbiAgICBib3JkZXItYm90dG9tOiAzcHggc29saWQgIzAwMDtcXG4gICAgbWFyZ2luLXRvcDogMnJlbTtcXG4gICAgd2lkdGg6IDM0cmVtO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgICBwYWRkaW5nOiAzcmVtO1xcbiAgICBtYXJnaW4tcmlnaHQ6IDNyZW07XFxuICAgIG1hcmdpbi1sZWZ0OiAtMnJlbTsgfVxcbiAgICAuY2FyZF9fdGV4dC1mbGV4IHtcXG4gICAgICBtYXJnaW4tYm90dG9tOiAxcmVtO1xcbiAgICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjYmZiZmJmOyB9XFxuICAgIC5jYXJkX190ZXh0LXRpdGxlIHtcXG4gICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cXG4gICAgICAuY2FyZF9fdGV4dC10aXRsZS1oMyB7XFxuICAgICAgICBmb250LXNpemU6IDEuOHJlbTtcXG4gICAgICAgIGZvbnQtd2VpZ2h0OiA0MDA7XFxuICAgICAgICBtYXJnaW4tcmlnaHQ6IDFyZW07IH1cXG4gICAgLmNhcmRfX3RleHQtY29sb3ItaW5kaWNhdG9yIHtcXG4gICAgICB3aWR0aDogMS4zcmVtO1xcbiAgICAgIGhlaWdodDogMS4zcmVtO1xcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkICMzMzM7XFxuICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgICAgIGJveC1zaGFkb3c6IDBweCAwcHggMHB4IDJweCByZ2JhKDAsIDAsIDAsIDAuMik7XFxuICAgICAgbWFyZ2luLXJpZ2h0OiAwLjdyZW07XFxuICAgICAgZGlzcGxheTogaW5saW5lLWJsb2NrOyB9XFxuICAgICAgLmNhcmRfX3RleHQtY29sb3ItaW5kaWNhdG9yLS1VIHtcXG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMTI4LCAxMjgsIDI1NSwgMC43KTsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWNvbG9yLWluZGljYXRvci0tQiB7XFxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuNyk7IH1cXG4gICAgICAuY2FyZF9fdGV4dC1jb2xvci1pbmRpY2F0b3ItLVIge1xcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsIDc3LCA3NywgMC43KTsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWNvbG9yLWluZGljYXRvci0tVyB7XFxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNyk7IH1cXG4gICAgICAuY2FyZF9fdGV4dC1jb2xvci1pbmRpY2F0b3ItLUcge1xcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAyNTUsIDAsIDAuNyk7IH1cXG4gICAgLmNhcmRfX3RleHQtb3JhY2xlLXAge1xcbiAgICAgIG1hcmdpbi1ib3R0b206IDFyZW07XFxuICAgICAgZm9udC1zaXplOiAxLjNyZW07IH1cXG4gICAgLmNhcmRfX3RleHQtb3JhY2xlLWZsYXZvciB7XFxuICAgICAgZm9udC1zaXplOiAxLjNyZW07XFxuICAgICAgZm9udC1zdHlsZTogaXRhbGljOyB9XFxuICAgIC5jYXJkX190ZXh0LWlsbHVzdHJhdG9yIHtcXG4gICAgICBmb250LXNpemU6IDEuMnJlbTtcXG4gICAgICBmb250LXN0eWxlOiBpdGFsaWM7IH1cXG4gICAgLmNhcmRfX3RleHQtbGVnYWwge1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgZmxleC1kaXJlY3Rpb246IHJvdztcXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47IH1cXG4gICAgICAuY2FyZF9fdGV4dC1sZWdhbC1oYWxmIHtcXG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9XFxuICAgICAgLmNhcmRfX3RleHQtbGVnYWwtc3Bhbi1jb250YWluZXIge1xcbiAgICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgICAgICBmb250LXNpemU6IDEuNHJlbTsgfVxcbiAgICAgICAgLmNhcmRfX3RleHQtbGVnYWwtc3Bhbi1jb250YWluZXI6bm90KDpsYXN0LWNoaWxkKSB7XFxuICAgICAgICAgIG1hcmdpbi1ib3R0b206IDAuNXJlbTsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWxlZ2FsLXNwYW4tYm94IHtcXG4gICAgICAgIHdpZHRoOiA2cmVtO1xcbiAgICAgICAgaGVpZ2h0OiAyLjVyZW07XFxuICAgICAgICBtYXJnaW4tcmlnaHQ6IDAuM3JlbTtcXG4gICAgICAgIGZvbnQtc2l6ZTogMXJlbTtcXG4gICAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICAgICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICAgICAgYm9yZGVyLXJhZGl1czogM3B4OyB9XFxuICAgICAgICAuY2FyZF9fdGV4dC1sZWdhbC1zcGFuLWJveC0tbm90X2xlZ2FsIHtcXG4gICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2U2MDAwMDsgfVxcbiAgICAgICAgLmNhcmRfX3RleHQtbGVnYWwtc3Bhbi1ib3gtLWxlZ2FsIHtcXG4gICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzAwOTkwMDsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWxlZ2FsLXNwYW4tYm94IHtcXG4gICAgICAgIGNvbG9yOiAjZmZmOyB9XFxuICAuY2FyZF9fc2V0IHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgfVxcbiAgICAuY2FyZF9fc2V0LWJhbm5lciB7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBib3JkZXI6IDFweCBzb2xpZCAjYmZiZmJmO1xcbiAgICAgIHdpZHRoOiA0MHJlbTtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDk0NjVjO1xcbiAgICAgIGNvbG9yOiAjZmRmZGZkO1xcbiAgICAgIHBhZGRpbmc6IDAuN3JlbTtcXG4gICAgICBib3JkZXItcmFkaXVzOiAzcHg7IH1cXG4gICAgICAuY2FyZF9fc2V0LWJhbm5lci1zdmctY29udGFpbmVyIHtcXG4gICAgICAgIG1hcmdpbi1yaWdodDogMXJlbTsgfVxcbiAgICAgIC5jYXJkX19zZXQtYmFubmVyLXN2ZyB7XFxuICAgICAgICB3aWR0aDogMi40cmVtO1xcbiAgICAgICAgaGVpZ2h0OiAyLjRyZW07XFxuICAgICAgICBmaWx0ZXI6IGludmVydCgxMDAlKTsgfVxcbiAgICAuY2FyZF9fc2V0LWRldGFpbHMge1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgfVxcbiAgICAuY2FyZF9fc2V0LWhlYWRlci1uYW1lIHtcXG4gICAgICBmb250LXNpemU6IDEuN3JlbXJlbTsgfVxcbiAgICAuY2FyZF9fc2V0LWhlYWRlci1jb2RlIHtcXG4gICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOyB9XFxuICAgIC5jYXJkX19zZXQtcHJpbnRzLWhlYWRlciB7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzQ5NDY1YztcXG4gICAgICBjb2xvcjogI2ZkZmRmZDtcXG4gICAgICBmb250LXNpemU6IDEuM3JlbTtcXG4gICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkICNiZmJmYmY7XFxuICAgICAgYm9yZGVyLXJhZGl1czogM3B4O1xcbiAgICAgIHBhZGRpbmc6IDAuM3JlbSAwLjdyZW07IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtc3ZnLWNvbnRhaW5lciB7XFxuICAgICAgaGVpZ2h0OiAxLjhyZW07XFxuICAgICAgd2lkdGg6IDEuOHJlbTtcXG4gICAgICBib3JkZXI6IDFweCBzb2xpZCAjYmZiZmJmO1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgICBib3JkZXItcmFkaXVzOiAxMDAlOyB9XFxuICAgIC5jYXJkX19zZXQtcHJpbnRzLXN2Zy0tY29tbW9uIHtcXG4gICAgICBmaWxsOiAjMDAwOyB9XFxuICAgIC5jYXJkX19zZXQtcHJpbnRzLXN2Zy0tdW5jb21tb24ge1xcbiAgICAgIGZpbGw6ICNlNmU2ZTY7IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtc3ZnLS1yYXJlIHtcXG4gICAgICBmaWxsOiAjZTZjMzAwOyB9XFxuICAgIC5jYXJkX19zZXQtcHJpbnRzLXN2Zy0tbXl0aGljIHtcXG4gICAgICBmaWxsOiAjZmYwMDAwOyB9XFxuICAgIC5jYXJkX19zZXQtcHJpbnRzLWxpc3Qge1xcbiAgICAgIGxpc3Qtc3R5bGU6IG5vbmU7XFxuICAgICAgYm9yZGVyLXJhZGl1czogM3B4OyB9XFxuICAgICAgLmNhcmRfX3NldC1wcmludHMtbGlzdC1saW5rOmxpbmssIC5jYXJkX19zZXQtcHJpbnRzLWxpc3QtbGluazp2aXNpdGVkIHtcXG4gICAgICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gICAgICAgIGNvbG9yOiAjMDAwOyB9XFxuICAgICAgLmNhcmRfX3NldC1wcmludHMtbGlzdC1pdGVtIHtcXG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxuICAgICAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgICAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2U3ZTllYztcXG4gICAgICAgIGJvcmRlci1sZWZ0OiAxcHggc29saWQgI2NkY2RjZDtcXG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxuICAgICAgICBwYWRkaW5nOiAwLjI1cmVtIDA7IH1cXG4gICAgICAgIC5jYXJkX19zZXQtcHJpbnRzLWxpc3QtaXRlbS0tcGwtMTQge1xcbiAgICAgICAgICBwYWRkaW5nLWxlZnQ6IDEuNHJlbTtcXG4gICAgICAgICAgYm9yZGVyLWJvdHRvbTogM3B4IHNvbGlkICMwMDA7IH1cXG4gICAgICAgIC5jYXJkX19zZXQtcHJpbnRzLWxpc3QtaXRlbTpob3ZlciB7XFxuICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmMmYyZjI7IH1cXG4gICAgICAuY2FyZF9fc2V0LXByaW50cy1saXN0LWl0ZW0tbmFtZS13cmFwcGVyIHtcXG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICAgICAgbWFyZ2luLWxlZnQ6IC0xcmVtOyB9XFxuICAgICAgLmNhcmRfX3NldC1wcmludHMtbGlzdC1pdGVtLXNldC1uYW1lIHtcXG4gICAgICAgIG1hcmdpbi1sZWZ0OiAwLjVyZW07IH1cXG4gICAgICAuY2FyZF9fc2V0LXByaW50cy1saXN0LWl0ZW0tcHJpY2Uge1xcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAwLjdyZW07XFxuICAgICAgICBjb2xvcjogIzAwNjg4NTsgfVxcblxcbi5jYXJkLXBhZ2Uge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICBncmlkLWNvbHVtbjogMSAvIC0xO1xcbiAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuXFxuLmFkZC10by1pbnYsXFxuLnJlbW92ZS1mcm9tLWludiB7XFxuICBtYXJnaW4tdG9wOiAzcmVtO1xcbiAgd2lkdGg6IDUwJTtcXG4gIG1hcmdpbi1sZWZ0OiA1MCU7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTUwJSk7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgfVxcbiAgLmFkZC10by1pbnZfX2hlYWRlcixcXG4gIC5yZW1vdmUtZnJvbS1pbnZfX2hlYWRlciB7XFxuICAgIGNvbG9yOiAjMTYxNjFkO1xcbiAgICBmb250LXNpemU6IDIuMnJlbTtcXG4gICAgZm9udC13ZWlnaHQ6IDMwMDtcXG4gICAgbWFyZ2luOiAwIGF1dG8gMXJlbSBhdXRvOyB9XFxuICAuYWRkLXRvLWludl9fZm9ybSxcXG4gIC5yZW1vdmUtZnJvbS1pbnZfX2Zvcm0ge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9XFxuICAgIC5hZGQtdG8taW52X19mb3JtLXByaWNlLFxcbiAgICAucmVtb3ZlLWZyb20taW52X19mb3JtLXByaWNlIHtcXG4gICAgICB3aWR0aDogMjByZW07XFxuICAgICAgaGVpZ2h0OiAzLjVyZW07XFxuICAgICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcXG4gICAgICBwYWRkaW5nOiAxcmVtO1xcbiAgICAgIGJvcmRlcjogc29saWQgMXB4ICNiZmJmYmY7XFxuICAgICAgYm9yZGVyLXJhZGl1czogNXB4OyB9XFxuICAgICAgLmFkZC10by1pbnZfX2Zvcm0tcHJpY2U6Zm9jdXMsXFxuICAgICAgLnJlbW92ZS1mcm9tLWludl9fZm9ybS1wcmljZTpmb2N1cyB7XFxuICAgICAgICBib3JkZXI6IHNvbGlkIDFweCAjMDAwOyB9XFxuICAgIC5hZGQtdG8taW52X19mb3JtLWdyb3VwLFxcbiAgICAucmVtb3ZlLWZyb20taW52X19mb3JtLWdyb3VwIHtcXG4gICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtZXZlbmx5O1xcbiAgICAgIGFsaWduLWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgICBtYXJnaW4tYm90dG9tOiAxLjVyZW07XFxuICAgICAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuICAgIC5hZGQtdG8taW52X19mb3JtLWxhYmVsLFxcbiAgICAucmVtb3ZlLWZyb20taW52X19mb3JtLWxhYmVsIHtcXG4gICAgICBtYXJnaW4tcmlnaHQ6IDAuM3JlbTtcXG4gICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgIGFsaWduLWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgICBjb2xvcjogIzE2MTYxZDtcXG4gICAgICBtYXJnaW4tdG9wOiAwLjQ1cmVtOyB9XFxuICAuYWRkLXRvLWludi1wcmljZS1tc2csXFxuICAucmVtb3ZlLWZyb20taW52LXByaWNlLW1zZyB7XFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgYm90dG9tOiAtMS44cmVtO1xcbiAgICByaWdodDogMjUlO1xcbiAgICBjb2xvcjogcmVkOyB9XFxuICAuYWRkLXRvLWludl9fc3VibWl0LFxcbiAgLnJlbW92ZS1mcm9tLWludl9fc3VibWl0IHtcXG4gICAgYWxpZ24tc2VsZjogY2VudGVyO1xcbiAgICBoZWlnaHQ6IDMuMXJlbTtcXG4gICAgZm9udC1zaXplOiAxLjRyZW07XFxuICAgIGxpbmUtaGVpZ2h0OiAxLjg7XFxuICAgIGNvbG9yOiAjNTUxYThiO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjlmN2Y1O1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDg1LCAyNiwgMTM5LCAwLjUpO1xcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XFxuICAgIGJveC1zaGFkb3c6IDAgMXB4IDAgcmdiYSgwLCAwLCAwLCAwLjA2KTtcXG4gICAgdHJhbnNpdGlvbjogYWxsIDAuMnM7XFxuICAgIHBhZGRpbmc6IDAuMnJlbSAwLjc1cmVtO1xcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIG1hcmdpbi1ib3R0b206IDFyZW07IH1cXG4gICAgLmFkZC10by1pbnZfX3N1Ym1pdDpob3ZlcixcXG4gICAgLnJlbW92ZS1mcm9tLWludl9fc3VibWl0OmhvdmVyIHtcXG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gICAgICBib3JkZXItY29sb3I6ICM2MzQ0OTY7IH1cXG5cXG4udXRpbC1zcGFjZTo6YmVmb3JlLFxcbi51dGlsLXNwYWNlOjphZnRlciB7XFxuICBjb250ZW50OiAnJztcXG4gIG1hcmdpbjogMCAwLjJyZW07IH1cXG5cXG4ubm8tcmVzdWx0cyB7XFxuICBqdXN0aWZ5LXNlbGY6IGNlbnRlcjsgfVxcblxcbi5ob21lcGFnZSB7XFxuICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQodG8gYm90dG9tLCAjMWQxYzI1LCAjNDMxZTNmKTtcXG4gIGJhY2tncm91bmQtcmVwZWF0OiBuby1yZXBlYXQ7XFxuICBoZWlnaHQ6IDEwMHZoO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIG92ZXJmbG93LXg6IGhpZGRlbiAhaW1wb3J0YW50O1xcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBiYWNrZ3JvdW5kLXNpemU6IGNvdmVyOyB9XFxuICAuaG9tZXBhZ2VfX2NlbnRlciB7XFxuICAgIGFsaWduLXNlbGY6IGNlbnRlcjtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDI4LjEyNWVtKSB7XFxuICAgICAgLmhvbWVwYWdlX19jZW50ZXIge1xcbiAgICAgICAgbWFyZ2luLXRvcDogLTEycmVtOyB9IH1cXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNDAuNjI1ZW0pIHtcXG4gICAgLmhvbWVwYWdlX19jZW50ZXItaGVhZGluZy13cmFwcGVyIHtcXG4gICAgICBtYXJnaW46IDAgYXV0byAwLjVyZW0gYXV0bztcXG4gICAgICB3aWR0aDogNzUlO1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgICAgdGV4dC1hbGlnbjogY2VudGVyOyB9IH1cXG4gIC5ob21lcGFnZV9fc2VhcmNoIHtcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuICAuaG9tZXBhZ2VfX3NlYXJjaC1pbnB1dCB7XFxuICAgIHBhZGRpbmc6IDEuMnJlbSAxLjRyZW0gMS4ycmVtIDYuMnJlbTtcXG4gICAgZm9udC1zaXplOiAzcmVtO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMjQyMDMxO1xcbiAgICBjb2xvcjogI2Q3ZDdkNztcXG4gICAgYm9yZGVyLXJhZGl1czogNHB4O1xcbiAgICBib3gtc2hhZG93OiAwcHggMHB4IDBweCAycHggcmdiYSgwLCAwLCAwLCAwLjUpO1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjUpOyB9XFxuICAgIC5ob21lcGFnZV9fc2VhcmNoLWlucHV0OjpwbGFjZWhvbGRlciB7XFxuICAgICAgdGV4dC1hbGlnbjogY2VudGVyOyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNDAuNjI1ZW0pIHtcXG4gICAgICAuaG9tZXBhZ2VfX3NlYXJjaC1pbnB1dCB7XFxuICAgICAgICB3aWR0aDogODAlO1xcbiAgICAgICAgbWFyZ2luLWxlZnQ6IDEwJTsgfSB9XFxuICAuaG9tZXBhZ2VfX3NlYXJjaC1idG4ge1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIGxlZnQ6IDZyZW07XFxuICAgIHRvcDogMnJlbTsgfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDQwLjYyNWVtKSB7XFxuICAgICAgLmhvbWVwYWdlX19zZWFyY2gtYnRuIHtcXG4gICAgICAgIGxlZnQ6IDEycmVtOyB9IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiAyOC4xMjVlbSkge1xcbiAgICAgIC5ob21lcGFnZV9fc2VhcmNoLWJ0biB7XFxuICAgICAgICBsZWZ0OiAxMHJlbTsgfSB9XFxuICAuaG9tZXBhZ2VfX2ljb24tc2l6aW5nLS1zZWFyY2gge1xcbiAgICB3aWR0aDogM3JlbTtcXG4gICAgaGVpZ2h0OiAzcmVtO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTE1MCUpOyB9XFxuICAuaG9tZXBhZ2VfX2ljb24tcGF0aCB7XFxuICAgIGZpbGw6ICNiZmJmYmY7IH1cXG4gIC5ob21lcGFnZV9fbGlua3Mge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsgfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDQwLjYyNWVtKSB7XFxuICAgICAgLmhvbWVwYWdlX19saW5rcyB7XFxuICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiAyOC4xMjVlbSkge1xcbiAgICAgIC5ob21lcGFnZV9fbGlua3Mge1xcbiAgICAgICAgbWFyZ2luLWxlZnQ6IDcuNSU7IH0gfVxcbiAgLmhvbWVwYWdlX19saW5rIHtcXG4gICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDg1LCAyNiwgMTM5LCAwLjUpO1xcbiAgICBib3JkZXItY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC42KTtcXG4gICAgYm9yZGVyLXJhZGl1czogM3B4O1xcbiAgICBjb2xvcjogI2ZmZjtcXG4gICAgbWFyZ2luLXRvcDogMC42cmVtO1xcbiAgICBtYXJnaW4tcmlnaHQ6IDNyZW07XFxuICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgbGluZS1oZWlnaHQ6IDEuNDtcXG4gICAgcGFkZGluZzogMC4ycmVtIDFyZW0gMCAxcmVtO1xcbiAgICBoZWlnaHQ6IDIuOHJlbTtcXG4gICAgdHJhbnNpdGlvbjogYWxsIDAuMnM7XFxuICAgIGJveC1zaGFkb3c6IDAgMXB4IDFweCAwIHJnYmEoMCwgMCwgMCwgMC4wNik7XFxuICAgIG1pbi13aWR0aDogOXJlbTtcXG4gICAgdGV4dC1hbGlnbjogY2VudGVyOyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNDAuNjI1ZW0pIHtcXG4gICAgICAuaG9tZXBhZ2VfX2xpbmsge1xcbiAgICAgICAgYWxpZ24tc2VsZjogY2VudGVyO1xcbiAgICAgICAgd2lkdGg6IDE0LjVyZW07IH0gfVxcbiAgICAuaG9tZXBhZ2VfX2xpbms6aG92ZXIge1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wOSk7IH1cXG5cXG4uaW52ZW50b3J5LWRldGFpbHMge1xcbiAgZ3JpZC1jb2x1bW46IDEgLyAtMTtcXG4gIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCByZ2JhKDk5LCA2OCwgMTUwLCAwLjEpO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2Y2ZjRmYTtcXG4gIGNvbG9yOiAjNTM1MzUzO1xcbiAgcGFkZGluZzogMXJlbSAxNiU7XFxuICBtYXJnaW4tYm90dG9tOiAycmVtO1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjsgfVxcbiAgLmludmVudG9yeS1kZXRhaWxzX19saW5rIHtcXG4gICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgICBjb2xvcjogcmdiYSg4MywgODMsIDgzLCAwLjc1KTtcXG4gICAgdHJhbnNpdGlvbjogYWxsIDAuMnM7XFxuICAgIHBhZGRpbmc6IDAgMC42cmVtO1xcbiAgICBib3JkZXItbGVmdDogMXB4IHNvbGlkICM1MzUzNTM7XFxuICAgIGJvcmRlci1yaWdodDogMXB4IHNvbGlkICM1MzUzNTM7IH1cXG4gICAgLmludmVudG9yeS1kZXRhaWxzX19saW5rOmhvdmVyIHtcXG4gICAgICBjb2xvcjogIzUzNTM1MzsgfVxcbiAgLmludmVudG9yeS1kZXRhaWxzIHNwYW4ge1xcbiAgICBjb2xvcjogIzAwNjg4NTsgfVxcblxcbi5ob21lcGFnZV9fY29sYWdlLFxcbi5jYXJkcGFnZV9fY29sYWdlIHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIG92ZXJmbG93OiBoaWRkZW47XFxuICBsZWZ0OiAwO1xcbiAgaGVpZ2h0OiAxNXJlbTtcXG4gIHdpZHRoOiAxMDAlOyB9XFxuXFxuLmhvbWVwYWdlX19jb2xhZ2Uge1xcbiAgYm90dG9tOiAwOyB9XFxuXFxuLmNhcmRwYWdlX19jb2xhZ2Uge1xcbiAgYm90dG9tOiAtMi42cmVtOyB9XFxuXFxuLmhvbWVwYWdlX19jb2xhZ2UtaW5uZXIsXFxuLmNhcmRwYWdlX19jb2xhZ2UtaW5uZXIge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgaGVpZ2h0OiAxMDAlO1xcbiAgbWFyZ2luLWxlZnQ6IDUwJTtcXG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtNTAlKTtcXG4gIHdpZHRoOiA2NS41cmVtOyB9XFxuXFxuLmhvbWVwYWdlX19jb2xhZ2UtY2FyZCxcXG4uY2FyZHBhZ2VfX2NvbGFnZS1jYXJkIHtcXG4gIHdpZHRoOiAxNi44cmVtO1xcbiAgaGVpZ2h0OiAyMy40cmVtO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgYm9yZGVyLXJhZGl1czogNSUgLyAzLjc1JTtcXG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTtcXG4gIHRyYW5zaXRpb246IGFsbCAwLjNzO1xcbiAgYm94LXNoYWRvdzogaW5zZXQgMCAwIDNweCAzcHggIzAwMDsgfVxcbiAgLmhvbWVwYWdlX19jb2xhZ2UtY2FyZDpudGgtY2hpbGQoMSksXFxuICAuY2FyZHBhZ2VfX2NvbGFnZS1jYXJkOm50aC1jaGlsZCgxKSB7XFxuICAgIHRvcDogMi4ycmVtOyB9XFxuICAuaG9tZXBhZ2VfX2NvbGFnZS1jYXJkOm50aC1jaGlsZCgyKSxcXG4gIC5jYXJkcGFnZV9fY29sYWdlLWNhcmQ6bnRoLWNoaWxkKDIpIHtcXG4gICAgdG9wOiA2LjJyZW07XFxuICAgIGxlZnQ6IDMuNXJlbTsgfVxcbiAgLmhvbWVwYWdlX19jb2xhZ2UtY2FyZDpudGgtY2hpbGQoMyksXFxuICAuY2FyZHBhZ2VfX2NvbGFnZS1jYXJkOm50aC1jaGlsZCgzKSB7XFxuICAgIHRvcDogMXJlbTtcXG4gICAgbGVmdDogMTcuNHJlbTsgfVxcbiAgLmhvbWVwYWdlX19jb2xhZ2UtY2FyZDpudGgtY2hpbGQoNCksXFxuICAuY2FyZHBhZ2VfX2NvbGFnZS1jYXJkOm50aC1jaGlsZCg0KSB7XFxuICAgIHRvcDogNC41cmVtO1xcbiAgICBsZWZ0OiAyMC42cmVtOyB9XFxuICAuaG9tZXBhZ2VfX2NvbGFnZS1jYXJkOm50aC1jaGlsZCg1KSxcXG4gIC5jYXJkcGFnZV9fY29sYWdlLWNhcmQ6bnRoLWNoaWxkKDUpIHtcXG4gICAgdG9wOiAxLjZyZW07XFxuICAgIGxlZnQ6IDM0LjdyZW07IH1cXG4gIC5ob21lcGFnZV9fY29sYWdlLWNhcmQ6bnRoLWNoaWxkKDYpLFxcbiAgLmNhcmRwYWdlX19jb2xhZ2UtY2FyZDpudGgtY2hpbGQoNikge1xcbiAgICB0b3A6IDYuNXJlbTtcXG4gICAgbGVmdDogMzhyZW07IH1cXG4gIC5ob21lcGFnZV9fY29sYWdlLWNhcmQ6bnRoLWNoaWxkKDcpLFxcbiAgLmNhcmRwYWdlX19jb2xhZ2UtY2FyZDpudGgtY2hpbGQoNykge1xcbiAgICB0b3A6IDMuNXJlbTtcXG4gICAgcmlnaHQ6IDA7IH1cXG4gIC5ob21lcGFnZV9fY29sYWdlLWNhcmQ6aG92ZXIsXFxuICAuY2FyZHBhZ2VfX2NvbGFnZS1jYXJkOmhvdmVyIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC01JSk7IH1cXG5cXG4uY29udGFpbmVyIHtcXG4gIGRpc3BsYXk6IGdyaWQ7XFxuICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IFtmdWxsLXN0YXJ0XSBtaW5tYXgoNnJlbSwgMWZyKSBbY2VudGVyLXN0YXJ0XSByZXBlYXQoOCwgW2NvbC1zdGFydF0gbWlubWF4KG1pbi1jb250ZW50LCAxNHJlbSkgW2NvbC1lbmRdKSBbY2VudGVyLWVuZF0gbWlubWF4KDZyZW0sIDFmcikgW2Z1bGwtZW5kXTtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmNWY2Zjc7XFxuICBiYWNrZ3JvdW5kLXNpemU6IGNvdmVyO1xcbiAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuXFxuLnNlYXJjaCB7XFxuICBncmlkLWNvbHVtbjogZnVsbC1zdGFydCAvIGZ1bGwtZW5kO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjsgfVxcblxcbi5hcGktcmVzdWx0cy1kaXNwbGF5IHtcXG4gIGdyaWQtY29sdW1uOiBmdWxsLXN0YXJ0IC8gZnVsbC1lbmQ7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjVmNmY3O1xcbiAgYmFja2dyb3VuZC1zaXplOiBjb3ZlcjtcXG4gIGRpc3BsYXk6IGdyaWQ7IH1cXG5cIiwgXCJcIix7XCJ2ZXJzaW9uXCI6MyxcInNvdXJjZXNcIjpbXCJ3ZWJwYWNrOi8vLi9zcmMvY3NzL3N0eWxlLmNzc1wiXSxcIm5hbWVzXCI6W10sXCJtYXBwaW5nc1wiOlwiQUFBQTs7O0VBR0UsU0FBUztFQUNULFVBQVU7RUFDVixtQkFBbUIsRUFBRTs7QUFFdkI7RUFDRSxnQkFBZ0IsRUFBRTs7QUFFcEI7RUFDRSxzQkFBc0I7RUFDdEIsaUJBQWlCO0VBQ2pCLHNCQUFzQjtFQUN0Qiw0QkFBNEI7RUFDNUIsZ0JBQWdCO0VBQ2hCLCtCQUErQjtFQUMvQixrQkFBa0IsRUFBRTs7QUFFdEI7RUFDRSx3QkFBd0IsRUFBRTs7QUFFNUI7RUFDRSxpQkFBaUI7RUFDakIseUJBQXlCLEVBQUU7RUFDM0I7SUFDRSxXQUFXLEVBQUU7O0FBRWpCO0VBQ0UsZUFBZTtFQUNmLHlCQUF5QjtFQUN6QixnQkFBZ0I7RUFDaEIsV0FBVyxFQUFFOztBQUVmO0VBQ0UsbUJBQW1CLEVBQUU7O0FBRXZCO0VBQ0UsbUJBQW1CLEVBQUU7O0FBRXZCO0VBQ0UsZ0JBQWdCLEVBQUU7O0FBRXBCO0VBQ0Usb0JBQW9CO0VBQ3BCLG9CQUFvQjtFQUNwQix5QkFBeUI7RUFDekIsZ0JBQWdCO0VBQ2hCLHFCQUFxQixFQUFFOztBQUV6QjtFQUNFLGFBQWE7RUFDYiwyQkFBMkI7RUFDM0IsNENBQTRDLEVBQUU7O0FBRWhEOztFQUVFLGdDQUFnQztFQUNoQyxZQUFZO0VBQ1oscURBQXFEO0VBQ3JELDRCQUE0QjtFQUM1QixzQkFBc0I7RUFDdEIsYUFBYTtFQUNiLHVCQUF1QjtFQUN2QixtQkFBbUIsRUFBRTtFQUNyQjs7SUFFRSxrQkFBa0I7SUFDbEIsbUJB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MUsseUJBQXlCO0VBQ3pCLHNCQUFzQjtFQUN0QixrQkFBa0IsRUFBRTs7QUFFdEI7RUFDRSxrQ0FBa0M7RUFDbEMsc0JBQXNCLEVBQUU7O0FBRTFCO0VBQ0Usa0NBQWtDO0VBQ2xDLHlCQUF5QjtFQUN6QixzQkFBc0I7RUFDdEIsYUFBYSxFQUFFXCIsXCJzb3VyY2VzQ29udGVudFwiOltcIiosXFxuKjo6YWZ0ZXIsXFxuKjo6YmVmb3JlIHtcXG4gIG1hcmdpbjogMDtcXG4gIHBhZGRpbmc6IDA7XFxuICBib3gtc2l6aW5nOiBpbmhlcml0OyB9XFxuXFxuaHRtbCB7XFxuICBmb250LXNpemU6IDYyLjUlOyB9XFxuXFxuYm9keSB7XFxuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbiAgZm9udC1zaXplOiAxLjZyZW07XFxuICBiYWNrZ3JvdW5kLXNpemU6IGNvdmVyO1xcbiAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcXG4gIGhlaWdodDogMTI3LjVyZW07XFxuICBmb250LWZhbWlseTogJ0xhdG8nLCBzYW5zLXNlcmlmO1xcbiAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuXFxuW2hpZGRlbl0ge1xcbiAgZGlzcGxheTogbm9uZSAhaW1wb3J0YW50OyB9XFxuXFxuLmhlYWRpbmctdGVydGlhcnkge1xcbiAgZm9udC1zaXplOiAyLjRyZW07XFxuICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOyB9XFxuICAuaGVhZGluZy10ZXJ0aWFyeS0td2hpdGUge1xcbiAgICBjb2xvcjogI2ZmZjsgfVxcblxcbi5oZWFkaW5nLXByaW1hcnkge1xcbiAgZm9udC1zaXplOiAzcmVtO1xcbiAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcXG4gIGZvbnQtd2VpZ2h0OiAzMDA7XFxuICBjb2xvcjogI2ZmZjsgfVxcblxcbi5tYi0xMCB7XFxuICBtYXJnaW4tYm90dG9tOiAxcmVtOyB9XFxuXFxuLm1iLTIwIHtcXG4gIG1hcmdpbi1ib3R0b206IDJyZW07IH1cXG5cXG4ubXQtNTAge1xcbiAgbWFyZ2luLXRvcDogNXJlbTsgfVxcblxcbi5idG4sIC5idG46bGluaywgLmJ0bjp2aXNpdGVkIHtcXG4gIHBhZGRpbmc6IC43NXJlbSAycmVtO1xcbiAgYm9yZGVyLXJhZGl1czogLjVyZW07XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjJmMmYyO1xcbiAgZm9udC13ZWlnaHQ6IDQwMDtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jazsgfVxcblxcbi5idG46YWN0aXZlLCAuYnRuOmZvY3VzIHtcXG4gIG91dGxpbmU6IG5vbmU7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTFweCk7XFxuICBib3gtc2hhZG93OiAwIDAuNXJlbSAxcmVtIHJnYmEoMCwgMCwgMCwgMC4yKTsgfVxcblxcbi5sb2dpbixcXG4ucmVnaXN0ZXIge1xcbiAgbWluLWhlaWdodDogY2FsYygxMDB2aCAtIDYuMXJlbSk7XFxuICB3aWR0aDogMTAwdnc7XFxuICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQodG8gdG9wLCAjNWY0ZjY2LCAjMzQyMzMyKTtcXG4gIGJhY2tncm91bmQtcmVwZWF0OiBuby1yZXBlYXQ7XFxuICBiYWNrZ3JvdW5kLXNpemU6IGNvdmVyO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfVxcbiAgLmxvZ2luLWltZyxcXG4gIC5yZWdpc3Rlci1pbWcge1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIGJvcmRlci1yYWRpdXM6IDEwMCU7XFxuICAgIGhlaWdodDogOC41cmVtO1xcbiAgICB3aWR0aDogOC41cmVtO1xcbiAgICB0b3A6IC0xNSU7IH1cXG4gIC5sb2dpbl9fZm9ybSxcXG4gIC5yZWdpc3Rlcl9fZm9ybSB7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzFlMmEzODtcXG4gICAgYm9yZGVyOiAycHggc29saWQgIzFlMmEzODtcXG4gICAgYm94LXNoYWRvdzogMHB4IDJweCA1cHggcmdiYSgwLCAwLCAwLCAwLjI1KTtcXG4gICAgbWF4LXdpZHRoOiAzMnJlbTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1mbG93OiBjb2x1bW4gbm93cmFwO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBwYWRkaW5nOiA0cmVtIDAgMi42cmVtIDA7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtMjUlKTsgfVxcbiAgLmxvZ2luX19mb3JtLWluc3RydWN0aW9ucyxcXG4gIC5yZWdpc3Rlcl9fZm9ybS1pbnN0cnVjdGlvbnMge1xcbiAgICBjb2xvcjogI2ZmZjtcXG4gICAgZm9udC1zaXplOiAxLjRyZW07XFxuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcXG4gICAgd2lkdGg6IDkwJTsgfVxcbiAgLmxvZ2luX19mb3JtLWdyb3VwLFxcbiAgLnJlZ2lzdGVyX19mb3JtLWdyb3VwIHtcXG4gICAgd2lkdGg6IDkwJTsgfVxcbiAgLmxvZ2luX19mb3JtLWlucHV0LFxcbiAgLnJlZ2lzdGVyX19mb3JtLWlucHV0IHtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIG1hcmdpbjogMCBhdXRvO1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMik7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMCwgMCwgMC4xKTtcXG4gICAgYm94LXNoYWRvdzogcmdiYSgwLCAwLCAwLCAwLjUpO1xcbiAgICBib3JkZXItcmFkaXVzOiAycHg7XFxuICAgIG1hcmdpbi1ib3R0b206IDFyZW07XFxuICAgIGxpbmUtaGVpZ2h0OiAxLjI1O1xcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICAgIGhlaWdodDogNC4ycmVtO1xcbiAgICBwYWRkaW5nOiAxcmVtIDEuNHJlbTtcXG4gICAgY2FyZXQtY29sb3I6ICNmZmY7XFxuICAgIGNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNzUpOyB9XFxuICAgIC5sb2dpbl9fZm9ybS1pbnB1dDo6cGxhY2Vob2xkZXIsXFxuICAgIC5yZWdpc3Rlcl9fZm9ybS1pbnB1dDo6cGxhY2Vob2xkZXIge1xcbiAgICAgIGZvbnQtd2VpZ2h0OiAzMDA7XFxuICAgICAgY29sb3I6ICNlNmU2ZTY7XFxuICAgICAgZm9udC1zaXplOiAxLjhyZW07IH1cXG4gICAgLmxvZ2luX19mb3JtLWlucHV0OmZvY3VzLFxcbiAgICAucmVnaXN0ZXJfX2Zvcm0taW5wdXQ6Zm9jdXMge1xcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC43NSk7IH1cXG4gIC5sb2dpbl9fZm9ybS1idG4sXFxuICAucmVnaXN0ZXJfX2Zvcm0tYnRuIHtcXG4gICAgd2lkdGg6IDkwJTtcXG4gICAgYm9yZGVyLXJhZGl1czogMnB4O1xcbiAgICBwYWRkaW5nOiAwIDEuNHJlbTtcXG4gICAgbWFyZ2luOiAxcmVtIGF1dG8gMCBhdXRvO1xcbiAgICBib3gtc2hhZG93OiAwIDJweCA1cHggcmdiYSgwLCAwLCAwLCAwLjI1KTtcXG4gICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWFyb3VuZDtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgaGVpZ2h0OiA0LjJyZW07IH1cXG4gICAgLmxvZ2luX19mb3JtLWJ0bi0tbG9naW4sXFxuICAgIC5yZWdpc3Rlcl9fZm9ybS1idG4tLWxvZ2luIHtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuODcpO1xcbiAgICAgIGNvbG9yOiAjMTYxNjFkO1xcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkICNmZmY7IH1cXG4gICAgICAubG9naW5fX2Zvcm0tYnRuLS1sb2dpbjpob3ZlcixcXG4gICAgICAucmVnaXN0ZXJfX2Zvcm0tYnRuLS1sb2dpbjpob3ZlciB7XFxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgICAgICAgY29sb3I6ICMzNDI0NDI7IH1cXG4gICAgICAubG9naW5fX2Zvcm0tYnRuLS1sb2dpbjpob3ZlciAubG9naW5fX2Zvcm0taWNvbi1wYXRoLS1sb2dpbixcXG4gICAgICAucmVnaXN0ZXJfX2Zvcm0tYnRuLS1sb2dpbjpob3ZlciAubG9naW5fX2Zvcm0taWNvbi1wYXRoLS1sb2dpbiB7XFxuICAgICAgICBmaWxsOiAjMzQyNDQyOyB9XFxuICAgICAgLmxvZ2luX19mb3JtLWJ0bi0tbG9naW46OmFmdGVyLFxcbiAgICAgIC5yZWdpc3Rlcl9fZm9ybS1idG4tLWxvZ2luOjphZnRlciB7XFxuICAgICAgICBtYXJnaW4tYm90dG9tOiAxcHggc29saWQgd2hpdGU7IH1cXG4gICAgLmxvZ2luX19mb3JtLWJ0bi0tcmVnaXN0ZXIsXFxuICAgIC5yZWdpc3Rlcl9fZm9ybS1idG4tLXJlZ2lzdGVyIHtcXG4gICAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpO1xcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNSk7XFxuICAgICAgY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC43NSk7IH1cXG4gICAgICAubG9naW5fX2Zvcm0tYnRuLS1yZWdpc3Rlcjpob3ZlcixcXG4gICAgICAucmVnaXN0ZXJfX2Zvcm0tYnRuLS1yZWdpc3Rlcjpob3ZlciB7XFxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMjUpO1xcbiAgICAgICAgY29sb3I6ICNmZmY7IH1cXG4gICAgICAubG9naW5fX2Zvcm0tYnRuLS1yZWdpc3Rlcjpob3ZlciAubG9naW5fX2Zvcm0taWNvbi1wYXRoLS1sb2dpbixcXG4gICAgICAucmVnaXN0ZXJfX2Zvcm0tYnRuLS1yZWdpc3Rlcjpob3ZlciAubG9naW5fX2Zvcm0taWNvbi1wYXRoLS1sb2dpbiB7XFxuICAgICAgICBmaWxsOiAjZmZmOyB9XFxuICAgIC5sb2dpbl9fZm9ybS1idG4gc3BhbixcXG4gICAgLnJlZ2lzdGVyX19mb3JtLWJ0biBzcGFuIHtcXG4gICAgICBtYXJnaW4tcmlnaHQ6IDFyZW07IH1cXG4gIC5sb2dpbl9fZm9ybS1pY29uLFxcbiAgLnJlZ2lzdGVyX19mb3JtLWljb24ge1xcbiAgICBoZWlnaHQ6IDEuNXJlbTtcXG4gICAgd2lkdGg6IDEuNXJlbTtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDE3JSk7IH1cXG4gIC5sb2dpbl9fZm9ybS1pY29uLXBhdGgtLWxvZ2luLFxcbiAgLnJlZ2lzdGVyX19mb3JtLWljb24tcGF0aC0tbG9naW4ge1xcbiAgICBmaWxsOiAjMTYxNjFkOyB9XFxuICAubG9naW5fX2Zvcm0taWNvbi1wYXRoLS1yZWdpc3RlcixcXG4gIC5yZWdpc3Rlcl9fZm9ybS1pY29uLXBhdGgtLXJlZ2lzdGVyIHtcXG4gICAgZmlsbDogI2ZmZjsgfVxcbiAgLmxvZ2luX19mb3JtLWhyLFxcbiAgLnJlZ2lzdGVyX19mb3JtLWhyIHtcXG4gICAgd2lkdGg6IDkwJTtcXG4gICAgbWFyZ2luOiAycmVtIDAgMXJlbSAwO1xcbiAgICBtYXJnaW4tYm90dG9tOiAwLjI1cHggc29saWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjI1KTsgfVxcblxcbi5uYXYge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICBwYWRkaW5nOiAxcmVtIDE2JTtcXG4gIGJhY2tncm91bmQtY29sb3I6ICMyYjI1M2E7XFxuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgIzAwMDsgfVxcbiAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA3MS44NzVlbSkge1xcbiAgICAubmF2IHtcXG4gICAgICBwYWRkaW5nOiAxLjJyZW0gNSU7IH0gfVxcbiAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA0My43NWVtKSB7XFxuICAgIC5uYXYge1xcbiAgICAgIHBhZGRpbmc6IDFyZW07IH0gfVxcbiAgLm5hdl9fbGVmdCB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXg6IDAgMCA1MCU7IH1cXG4gIC5uYXZfX3JpZ2h0IHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgYm9yZGVyLXJpZ2h0OiAxcHggc29saWQgI2ZmZjtcXG4gICAgYm9yZGVyLWxlZnQ6IDFweCBzb2xpZCAjZmZmO1xcbiAgICBwYWRkaW5nLWxlZnQ6IDFyZW07XFxuICAgIG1hcmdpbi1sZWZ0OiBhdXRvOyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogMzcuNWVtKSB7XFxuICAgICAgLm5hdl9fcmlnaHQge1xcbiAgICAgICAgZGlzcGxheTogbm9uZTsgfSB9XFxuICAgIC5uYXZfX3JpZ2h0ID4gKiB7XFxuICAgICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuICAubmF2X19pdGVtLS1zZWFyY2gge1xcbiAgICBmbGV4OiAwIDAgMjUlOyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogMzcuNWVtKSB7XFxuICAgICAgLm5hdl9faXRlbS0tc2VhcmNoIHtcXG4gICAgICAgIGRpc3BsYXk6IG5vbmU7IH0gfVxcbiAgLm5hdl9faXRlbS0taG9tZSB7XFxuICAgIG1hcmdpbi1yaWdodDogM3JlbTsgfVxcbiAgLm5hdl9fbGluayB7XFxuICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gICAgY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC43NSk7XFxuICAgIHRyYW5zaXRpb246IGFsbCAwLjJzOyB9XFxuICAgIC5uYXZfX2xpbms6aG92ZXIge1xcbiAgICAgIG1hcmdpbi1ib3R0b206IDJweDtcXG4gICAgICBjb2xvcjogI2ZmZjtcXG4gICAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2ZmZjsgfVxcbiAgICAubmF2X19saW5rLS1ob21lOmhvdmVyIC5uYXZfX2ljb24tcGF0aC0taG9tZSB7XFxuICAgICAgZmlsbDogI2ZmZjsgfVxcbiAgLm5hdl9fc2VhcmNoIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcbiAgICAubmF2X19zZWFyY2gtaW5wdXQge1xcbiAgICAgIGJvcmRlcjogbm9uZTtcXG4gICAgICBwYWRkaW5nOiAxcmVtIDJyZW07XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzJiMjUzYTtcXG4gICAgICBjYXJldC1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjc1KTtcXG4gICAgICBjb2xvcjogI2ZmZjsgfVxcbiAgICAgIC5uYXZfX3NlYXJjaC1pbnB1dDo6cGxhY2Vob2xkZXIge1xcbiAgICAgICAgY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC43NSk7IH1cXG4gICAgICAubmF2X19zZWFyY2gtaW5wdXQ6Zm9jdXMge1xcbiAgICAgICAgb3V0bGluZTogbm9uZTsgfVxcbiAgICAubmF2X19zZWFyY2gtYnRuIHtcXG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICAgIGxlZnQ6IDJyZW07XFxuICAgICAgdG9wOiAxcmVtOyB9XFxuICAgICAgLm5hdl9fc2VhcmNoLWJ0bjpob3ZlciAubmF2X19pY29uLXBhdGgtLXNlYXJjaCB7XFxuICAgICAgICBmaWxsOiAjZmZmOyB9XFxuICAubmF2X19pY29uLXNpemluZy0taG9tZSB7XFxuICAgIHdpZHRoOiAzcmVtO1xcbiAgICBoZWlnaHQ6IDNyZW07IH1cXG4gIC5uYXZfX2ljb24tc2l6aW5nLS1zZWFyY2gge1xcbiAgICB3aWR0aDogMnJlbTtcXG4gICAgaGVpZ2h0OiAycmVtO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTE1MCUpOyB9XFxuICAubmF2X19pY29uLXBhdGgtLWhvbWUge1xcbiAgICBmaWxsOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNzUpOyB9XFxuICAubmF2X19pY29uLXBhdGgtLXNlYXJjaCB7XFxuICAgIGZpbGw6ICNiZmJmYmY7IH1cXG4gIC5uYXZfX21vYmlsZSB7XFxuICAgIGRpc3BsYXk6IG5vbmU7IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiAzNy41ZW0pIHtcXG4gICAgICAubmF2X19tb2JpbGUge1xcbiAgICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICAgIGZsZXg6IDAgMCA1MCU7XFxuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBlbmQ7IH0gfVxcbiAgICAubmF2X19tb2JpbGUtbGlua3Mge1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICMyYjI1M2E7XFxuICAgICAgZmxleC1mbG93OiB3cmFwO1xcbiAgICAgIHBhZGRpbmc6IDFyZW0gMDtcXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtc3RhcnQ7XFxuICAgICAgZGlzcGxheTogbm9uZTsgfVxcbiAgICAubmF2X19tb2JpbGUtbGluayB7XFxuICAgICAgZmxleDogMCAwIDQ4JTtcXG4gICAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDg1LCAyNiwgMTM5LCAwLjUpO1xcbiAgICAgIGJvcmRlci1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjYpO1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKTtcXG4gICAgICBib3JkZXItcmFkaXVzOiAzcHg7XFxuICAgICAgbWFyZ2luLXRvcDogMC42cmVtO1xcbiAgICAgIG1hcmdpbi1sZWZ0OiAxJTtcXG4gICAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICAgICAgY29sb3I6ICNmZmY7XFxuICAgICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICAgIGxpbmUtaGVpZ2h0OiAxLjQ7XFxuICAgICAgcGFkZGluZzogMC4ycmVtIDFyZW0gMCAxcmVtO1xcbiAgICAgIGhlaWdodDogMi44cmVtO1xcbiAgICAgIHRyYW5zaXRpb246IGFsbCAwLjJzO1xcbiAgICAgIGJveC1zaGFkb3c6IDAgMXB4IDFweCAwIHJnYmEoMCwgMCwgMCwgMC4wNik7XFxuICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgICAgIHRyYW5zaXRpb246IGFsbCAwLjJzOyB9XFxuICAgICAgLm5hdl9fbW9iaWxlLWxpbms6aG92ZXIge1xcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjI1KTsgfVxcbiAgICAubmF2X19tb2JpbGUtaGFtYnVyZ2VyLXdyYXBwZXIge1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgICBtYXJnaW4tcmlnaHQ6IDFyZW07XFxuICAgICAgaGVpZ2h0OiAzcmVtO1xcbiAgICAgIHdpZHRoOiAzcmVtOyB9XFxuICAgIC5uYXZfX21vYmlsZS1oYW1idXJnZXIge1xcbiAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcbiAgICAgIC5uYXZfX21vYmlsZS1oYW1idXJnZXIsIC5uYXZfX21vYmlsZS1oYW1idXJnZXI6OmJlZm9yZSwgLm5hdl9fbW9iaWxlLWhhbWJ1cmdlcjo6YWZ0ZXIge1xcbiAgICAgICAgd2lkdGg6IDNyZW07XFxuICAgICAgICBoZWlnaHQ6IDJweDtcXG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC43NSk7XFxuICAgICAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7IH1cXG4gICAgICAubmF2X19tb2JpbGUtaGFtYnVyZ2VyOjpiZWZvcmUsIC5uYXZfX21vYmlsZS1oYW1idXJnZXI6OmFmdGVyIHtcXG4gICAgICAgIGNvbnRlbnQ6ICcnO1xcbiAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICAgICAgbGVmdDogMDsgfVxcbiAgICAgIC5uYXZfX21vYmlsZS1oYW1idXJnZXI6OmJlZm9yZSB7XFxuICAgICAgICBtYXJnaW4tdG9wOiAtMC44cmVtOyB9XFxuICAgICAgLm5hdl9fbW9iaWxlLWhhbWJ1cmdlcjo6YWZ0ZXIge1xcbiAgICAgICAgbWFyZ2luLXRvcDogMC44cmVtOyB9XFxuXFxuLmVycm9yIHtcXG4gIG1hcmdpbi10b3A6IDJyZW07XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmY4MDgwO1xcbiAgYm9yZGVyLXJhZGl1czogMTBweDtcXG4gIHBhZGRpbmc6IDJyZW07XFxuICBmb250LXNpemU6IDJyZW07XFxuICBncmlkLWNvbHVtbjogY2VudGVyLXN0YXJ0IC8gY2VudGVyLWVuZDtcXG4gIGZvbnQtd2VpZ2h0OiA3MDA7IH1cXG5cXG4uc2VhcmNoLWZvcm0ge1xcbiAgcGFkZGluZzogMnJlbSAyNXJlbTtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZGZkZmQ7XFxuICBtaW4taGVpZ2h0OiBjYWxjKDEwMHZoIC0gNi4ycmVtKTsgfVxcbiAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA4MS4yNWVtKSB7XFxuICAgIC5zZWFyY2gtZm9ybSB7XFxuICAgICAgcGFkZGluZzogMnJlbSAxNXJlbTsgfSB9XFxuICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDYyLjVlbSkge1xcbiAgICAuc2VhcmNoLWZvcm0ge1xcbiAgICAgIHBhZGRpbmc6IDJyZW0gNXJlbTsgfSB9XFxuICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDU2LjI1ZW0pIHtcXG4gICAgLnNlYXJjaC1mb3JtIHtcXG4gICAgICBwYWRkaW5nOiAycmVtIDFyZW07IH0gfVxcbiAgLnNlYXJjaC1mb3JtX19ncm91cCB7XFxuICAgIHdpZHRoOiA3NSU7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIG1hcmdpbi1ib3R0b206IDNyZW07XFxuICAgIGFsaWduLWl0ZW1zOiBmbGV4LXN0YXJ0O1xcbiAgICBwYWRkaW5nOiAwLjVyZW0gNHJlbSAwLjVyZW0gMDtcXG4gICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHJnYmEoMCwgMCwgMCwgMC4yKTsgfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDkzLjc1ZW0pIHtcXG4gICAgICAuc2VhcmNoLWZvcm1fX2dyb3VwIHtcXG4gICAgICAgIHdpZHRoOiAxMDAlOyB9IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA0Ni44NzVlbSkge1xcbiAgICAgIC5zZWFyY2gtZm9ybV9fZ3JvdXAge1xcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgfSB9XFxuICAgIC5zZWFyY2gtZm9ybV9fZ3JvdXA6bnRoLWNoaWxkKDEwKSB7XFxuICAgICAgYm9yZGVyLWJvdHRvbTogbm9uZTsgfVxcbiAgICAuc2VhcmNoLWZvcm1fX2dyb3VwLS1uby1ib3JkZXIge1xcbiAgICAgIGJvcmRlci1ib3R0b206IG5vbmU7IH1cXG4gIC5zZWFyY2gtZm9ybV9fbGFiZWwge1xcbiAgICBmbGV4OiAwIDAgMjAlO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogZmxleC1zdGFydDtcXG4gICAgZm9udC13ZWlnaHQ6IDMwMDtcXG4gICAgbWFyZ2luLXRvcDogMC43cmVtO1xcbiAgICBjb2xvcjogIzU1MWE4YjsgfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDQ2Ljg3NWVtKSB7XFxuICAgICAgLnNlYXJjaC1mb3JtX19sYWJlbCB7XFxuICAgICAgICBtYXJnaW4tYm90dG9tOiAxLjJyZW07XFxuICAgICAgICBtYXJnaW4tbGVmdDogMXJlbTsgfSB9XFxuICAuc2VhcmNoLWZvcm1fX2dyb3VwLWlucHV0LXdyYXBwZXIge1xcbiAgICBmbGV4OiAwIDAgODAlOyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNDYuODc1ZW0pIHtcXG4gICAgICAuc2VhcmNoLWZvcm1fX2dyb3VwLWlucHV0LXdyYXBwZXIge1xcbiAgICAgICAgZmxleDogMCAwIDEwMCU7XFxuICAgICAgICB3aWR0aDogMTAwJTsgfSB9XFxuICAuc2VhcmNoLWZvcm1fX2lucHV0LXdyYXBwZXIge1xcbiAgICBmbGV4OiAwIDAgODAlOyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNDYuODc1ZW0pIHtcXG4gICAgICAuc2VhcmNoLWZvcm1fX2lucHV0LXdyYXBwZXIge1xcbiAgICAgICAgZmxleDogMCAwIDEwMCU7XFxuICAgICAgICB3aWR0aDogMTAwJTsgfSB9XFxuICAuc2VhcmNoLWZvcm1fX3RpcCB7XFxuICAgIGZvbnQtc2l6ZTogMXJlbTtcXG4gICAgbGluZS1oZWlnaHQ6IDEuNDtcXG4gICAgd2lkdGg6IDcwJTsgfVxcbiAgLnNlYXJjaC1mb3JtX19pbnB1dC10ZXh0IHtcXG4gICAgd2lkdGg6IDQwcmVtO1xcbiAgICBoZWlnaHQ6IDRyZW07XFxuICAgIG1hcmdpbi1ib3R0b206IDFyZW07XFxuICAgIHBhZGRpbmc6IDFyZW07XFxuICAgIGJvcmRlcjogc29saWQgMXB4ICNiZmJmYmY7XFxuICAgIGJvcmRlci1yYWRpdXM6IDVweDsgfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDI4LjEyNWVtKSB7XFxuICAgICAgLnNlYXJjaC1mb3JtX19pbnB1dC10ZXh0IHtcXG4gICAgICAgIHdpZHRoOiAzMHJlbTsgfSB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogMjEuODc1ZW0pIHtcXG4gICAgICAuc2VhcmNoLWZvcm1fX2lucHV0LXRleHQge1xcbiAgICAgICAgd2lkdGg6IDIwcmVtOyB9IH1cXG4gICAgLnNlYXJjaC1mb3JtX19pbnB1dC10ZXh0OmZvY3VzIHtcXG4gICAgICBib3JkZXI6IHNvbGlkIDFweCAjMDAwOyB9XFxuICAuc2VhcmNoLWZvcm1fX2lucHV0LWludGVnZXIge1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCAjYWVhZWFlO1xcbiAgICBoZWlnaHQ6IDMuNXJlbTtcXG4gICAgYm9yZGVyLXJhZGl1czogM3B4O1xcbiAgICBwYWRkaW5nLWxlZnQ6IDAuNXJlbTtcXG4gICAgcGFkZGluZy1yaWdodDogMC41cmVtO1xcbiAgICBib3gtc2hhZG93OiAwIDFweCAxcHggMCByZ2JhKDAsIDAsIDAsIDAuMDYpOyB9XFxuICAgIC5zZWFyY2gtZm9ybV9faW5wdXQtaW50ZWdlci0tcmVsYXRpdmUge1xcbiAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDM3LjVlbSkge1xcbiAgICAgIC5zZWFyY2gtZm9ybV9faW5wdXQtaW50ZWdlciB7XFxuICAgICAgICBtYXgtd2lkdGg6IDMwJTsgfSB9XFxuICAuc2VhcmNoLWZvcm1fX2dyb3VwLS1jaGVja2JveCB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIG1hcmdpbi1ib3R0b206IDFyZW07IH1cXG4gIC5zZWFyY2gtZm9ybV9fZ3JvdXAtY29sb3JzLWxlZnQsIC5zZWFyY2gtZm9ybV9fZ3JvdXAtY29sb3JzLXJpZ2h0IHtcXG4gICAgZGlzcGxheTogZmxleDsgfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDgxLjI1ZW0pIHtcXG4gICAgICAuc2VhcmNoLWZvcm1fX2dyb3VwLWNvbG9ycy1sZWZ0LCAuc2VhcmNoLWZvcm1fX2dyb3VwLWNvbG9ycy1yaWdodCB7XFxuICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9IH1cXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogODEuMjVlbSkge1xcbiAgICAuc2VhcmNoLWZvcm1fX2dyb3VwLWNvbG9ycy1sZWZ0IHtcXG4gICAgICBtYXJnaW4tcmlnaHQ6IDNyZW07IH0gfVxcbiAgLnNlYXJjaC1mb3JtX19ncm91cC1yYXJpdHktbGVmdCwgLnNlYXJjaC1mb3JtX19ncm91cC1yYXJpdHktcmlnaHQge1xcbiAgICBkaXNwbGF5OiBmbGV4OyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogMjguMTI1ZW0pIHtcXG4gICAgICAuc2VhcmNoLWZvcm1fX2dyb3VwLXJhcml0eS1sZWZ0LCAuc2VhcmNoLWZvcm1fX2dyb3VwLXJhcml0eS1yaWdodCB7XFxuICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9IH1cXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogODEuMjVlbSkge1xcbiAgICAuc2VhcmNoLWZvcm1fX2dyb3VwLXJhcml0eS1sZWZ0IHtcXG4gICAgICBtYXJnaW4tcmlnaHQ6IDNyZW07IH0gfVxcbiAgLnNlYXJjaC1mb3JtX19sYWJlbC0tY2hlY2tib3gge1xcbiAgICBtYXJnaW4tcmlnaHQ6IDFyZW07IH1cXG4gIC5zZWFyY2gtZm9ybV9faW5wdXQtY2hlY2tib3gge1xcbiAgICB3aWR0aDogMi4yNXJlbTtcXG4gICAgaGVpZ2h0OiAyLjI1cmVtO1xcbiAgICBtYXJnaW4tcmlnaHQ6IDAuOHJlbTsgfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDkzLjc1ZW0pIHtcXG4gICAgICAuc2VhcmNoLWZvcm1fX2lucHV0LWNoZWNrYm94IHtcXG4gICAgICAgIG1hcmdpbi1ib3R0b206IDAuM3JlbTsgfSB9XFxuICAuc2VhcmNoLWZvcm1fX2NoZWNrYm94LXdyYXBwZXIge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAuc2VhcmNoLWZvcm1fX3NlbGVjdC1tZW51IHtcXG4gICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcXG4gICAgY29sb3I6ICMzNDMyNDI7XFxuICAgIG1hcmdpbi1yaWdodDogMXJlbTtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgI2FlYWVhZTtcXG4gICAgYm9yZGVyLXJhZGl1czogM3B4O1xcbiAgICBib3gtc2hhZG93OiAwIDFweCAxcHggMCByZ2JhKDAsIDAsIDAsIDAuMDYpO1xcbiAgICBwYWRkaW5nOiAwIDIuMnJlbSAwIDAuNXJlbTtcXG4gICAgaGVpZ2h0OiAzLjRyZW07XFxuICAgIGZvbnQtc2l6ZTogMS40cmVtO1xcbiAgICB0ZXh0LWluZGVudDogMDtcXG4gICAgLXdlYmtpdC1hcHBlYXJhbmNlOiBub25lO1xcbiAgICAtbW96LWFwcGVhcmFuY2U6IG5vbmU7XFxuICAgIHRleHQtb3ZlcmZsb3c6ICcnO1xcbiAgICBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoLi4vLi4vYXBwL3N0YXRpYy9pbWcvU1ZHL2Fycm93LWRvd24yLnN2Zyk7XFxuICAgIGJhY2tncm91bmQtcmVwZWF0OiBuby1yZXBlYXQ7XFxuICAgIGJhY2tncm91bmQtcG9zaXRpb246IHJpZ2h0IDAuOHJlbSBjZW50ZXI7XFxuICAgIGJhY2tncm91bmQtc2l6ZTogMS4ycmVtIDFyZW07XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmZmY7IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA4MS4yNWVtKSB7XFxuICAgICAgLnNlYXJjaC1mb3JtX19zZWxlY3QtbWVudSB7XFxuICAgICAgICBtYXJnaW4tcmlnaHQ6IDAuM3JlbTsgfSB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogMzcuNWVtKSB7XFxuICAgICAgLnNlYXJjaC1mb3JtX19zZWxlY3QtbWVudS0tMiB7XFxuICAgICAgICBtYXgtd2lkdGg6IDQ5JTsgfSB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogMzcuNWVtKSB7XFxuICAgICAgLnNlYXJjaC1mb3JtX19zZWxlY3QtbWVudS0tMyB7XFxuICAgICAgICBtYXgtd2lkdGg6IDMyJTsgfSB9XFxuICAuc2VhcmNoLWZvcm1fX3N2Zy1zaXplIHtcXG4gICAgaGVpZ2h0OiAycmVtO1xcbiAgICB3aWR0aDogMnJlbTtcXG4gICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX3N2Zy1jb2xvciB7XFxuICAgIGZpbGw6ICM1NTFhOGI7IH1cXG4gIC5zZWFyY2gtZm9ybV9fc3VibWl0LXdyYXBwZXIge1xcbiAgICBwb3NpdGlvbjogc3RpY2t5O1xcbiAgICBib3R0b206IDA7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBtYXJnaW4tYm90dG9tOiAzcmVtO1xcbiAgICBib3JkZXItdG9wOiAxcHggc29saWQgcmdiYSgwLCAwLCAwLCAwLjIpO1xcbiAgICBhbGlnbi1pdGVtczogZmxleC1zdGFydDtcXG4gICAgcGFkZGluZzogMS41cmVtIDRyZW0gMS41cmVtIDA7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmZGZkZmQ7XFxuICAgIHotaW5kZXg6IDE7IH1cXG4gIC5zZWFyY2gtZm9ybV9fc3VibWl0IHtcXG4gICAgYm9yZGVyLXJhZGl1czogM3B4O1xcbiAgICBwYWRkaW5nOiAwLjdyZW07XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmOWY3ZjU7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoODUsIDI2LCAxMzksIDAuNSk7XFxuICAgIGNvbG9yOiAjNTUxYThiO1xcbiAgICBmb250LXdlaWdodDogNTAwO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgMC4ycztcXG4gICAgbWFyZ2luLWxlZnQ6IDIwJTsgfVxcbiAgICAuc2VhcmNoLWZvcm1fX3N1Ym1pdDpob3ZlciB7XFxuICAgICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmZmY7IH1cXG4gIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tc3BhbiB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH1cXG4gIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMsIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtc2V0cyB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICAgIGxpc3Qtc3R5bGU6IG5vbmU7XFxuICAgIG1hcmdpbi1ib3R0b206IDAuM3JlbTsgfVxcbiAgLnNlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy1saXN0LWl0ZW0sIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtc2V0cy1saXN0LWl0ZW0ge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBtYXJnaW4tYm90dG9tOiAwLjdyZW07IH1cXG4gIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtcmVtb3ZlLWJ0biwgLnNlYXJjaC1mb3JtX19zZWxlY3RlZC1zZXRzLXJlbW92ZS1idG4ge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICBoZWlnaHQ6IDJyZW07XFxuICAgIHdpZHRoOiAycmVtO1xcbiAgICBmb250LXNpemU6IDEuM3JlbTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2YyZjJmMjtcXG4gICAgbWFyZ2luLXJpZ2h0OiAwLjdyZW07IH1cXG4gIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlciB7XFxuICAgIGhlaWdodDogMnJlbTtcXG4gICAgd2lkdGg6IDIuNzVyZW07XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgIGZvbnQtc2l6ZTogMS4zcmVtO1xcbiAgICBtYXJnaW4tcmlnaHQ6IDAuN3JlbTsgfVxcbiAgICAuc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLXRvZ2dsZXItLWlzIHtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDdkMTQ3OyB9XFxuICAgIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlci0tbm90IHtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmYwMDAwOyB9XFxuICAuc2VhcmNoLWZvcm1fX2Ryb3Bkb3duIHtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICBtYXgtaGVpZ2h0OiAyOHJlbTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gICAgei1pbmRleDogMjtcXG4gICAgdG9wOiAxMDAlO1xcbiAgICB3aWR0aDogNDByZW07XFxuICAgIG1hcmdpbi10b3A6IC0xcmVtO1xcbiAgICBvdmVyZmxvdy15OiBhdXRvO1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCAjMDAwOyB9XFxuICAgIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdCB7XFxuICAgICAgbGlzdC1zdHlsZTogbm9uZTsgfVxcbiAgICAgIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1jYXRlZ29yeSB7XFxuICAgICAgICBwYWRkaW5nOiAwLjVyZW07IH1cXG4gICAgICAuc2VhcmNoLWZvcm1fX2Ryb3Bkb3duLWxpc3Qtb3B0aW9uIHtcXG4gICAgICAgIHBhZGRpbmc6IDAuM3JlbSAycmVtO1xcbiAgICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cXG4gICAgICAgIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1vcHRpb246aG92ZXIge1xcbiAgICAgICAgICBjdXJzb3I6IHBvaW50ZXI7IH1cXG4gICAgICAgIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1vcHRpb24tLWhpZ2hsaWdodGVkIHtcXG4gICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2NjZDhmZjsgfVxcbiAgICAgICAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0LW9wdGlvbiBzcGFuIHtcXG4gICAgICAgICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcXG4gICAgICAgICAgbWFyZ2luLWxlZnQ6IDFyZW07IH1cXG4gICAgICAuc2VhcmNoLWZvcm1fX2Ryb3Bkb3duLWxpc3QtaW1nIHtcXG4gICAgICAgIHdpZHRoOiAycmVtO1xcbiAgICAgICAgaGVpZ2h0OiAycmVtO1xcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAwLjdyZW07IH1cXG5cXG4uZHJvcGRvd24td3JhcHBlciB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7IH1cXG5cXG4uaW52LXNlYXJjaC1wcmljZS1tc2cge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgYm90dG9tOiAwO1xcbiAgcmlnaHQ6IDA7XFxuICBjb2xvcjogcmVkOyB9XFxuXFxuLnJlbGF0aXZlIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcblxcbi5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2YzZjVmODtcXG4gIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCByZ2JhKDk5LCA2OCwgMTUwLCAwLjEpO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgcGFkZGluZzogMS4ycmVtIDE2JTtcXG4gIG1hcmdpbi1ib3R0b206IDAuMXJlbTtcXG4gIGhlaWdodDogNS4ycmVtOyB9XFxuICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDcxLjg3NWVtKSB7XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYge1xcbiAgICAgIHBhZGRpbmc6IDEuMnJlbSA1JTsgfSB9XFxuICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDUzLjEyNWVtKSB7XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYge1xcbiAgICAgIGRpc3BsYXk6IG5vbmU7IH0gfVxcbiAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1zZWxlY3Qge1xcbiAgICBjb2xvcjogI2IzMDBiMztcXG4gICAgbWFyZ2luLXJpZ2h0OiAxcmVtO1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDg1LCAyNiwgMTM5LCAwLjUpO1xcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XFxuICAgIGJveC1zaGFkb3c6IDAgMXB4IDFweCAwIHJnYmEoMCwgMCwgMCwgMC4wNik7XFxuICAgIHBhZGRpbmc6IDAuMXJlbSAyLjJyZW0gMCAwLjVyZW07XFxuICAgIGNvbG9yOiAjNTUxYThiO1xcbiAgICBoZWlnaHQ6IDIuOHJlbTtcXG4gICAgZm9udC1zaXplOiAxLjRyZW07XFxuICAgIHRleHQtaW5kZW50OiAwO1xcbiAgICAtd2Via2l0LWFwcGVhcmFuY2U6IG5vbmU7XFxuICAgIC1tb3otYXBwZWFyYW5jZTogbm9uZTtcXG4gICAgdGV4dC1vdmVyZmxvdzogJyc7XFxuICAgIGJhY2tncm91bmQtaW1hZ2U6IHVybCguLi8uLi9hcHAvc3RhdGljL2ltZy9TVkcvYXJyb3ctZG93bjIuc3ZnKTtcXG4gICAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcXG4gICAgYmFja2dyb3VuZC1wb3NpdGlvbjogcmlnaHQgMC44cmVtIGNlbnRlcjtcXG4gICAgYmFja2dyb3VuZC1zaXplOiAxLjJyZW0gMXJlbTsgfVxcbiAgICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXNlbGVjdDpob3ZlciB7XFxuICAgICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmZmY7IH1cXG4gIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtbGFiZWwge1xcbiAgICBjb2xvcjogIzU1MWE4YjsgfVxcbiAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1idG4ge1xcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmOWY3ZjU7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoODUsIDI2LCAxMzksIDAuNSk7XFxuICAgIGNvbG9yOiAjNTUxYThiO1xcbiAgICBmb250LXdlaWdodDogNTAwO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgMC4ycztcXG4gICAgaGVpZ2h0OiAyLjhyZW07XFxuICAgIHBhZGRpbmc6IDAuMXJlbSAwLjdyZW0gMCAwLjdyZW07XFxuICAgIGZvbnQtc2l6ZTogMS40cmVtO1xcbiAgICBtYXJnaW46IGF1dG8gMDtcXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgICBib3gtc2hhZG93OiAwIDFweCAxcHggMCByZ2JhKDAsIDAsIDAsIDAuMDYpOyB9XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtYnRuOmhvdmVyIHtcXG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjsgfVxcbiAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1yaWdodCB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cXG4gIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtcGFnaW5hdGlvbi1jb250YWluZXIge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjlmN2Y1O1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDg1LCAyNiwgMTM5LCAwLjUpO1xcbiAgICBjb2xvcjogIzU1MWE4YjtcXG4gICAgcGFkZGluZzogMC4ycmVtIDAuN3JlbTtcXG4gICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICBoZWlnaHQ6IDIuOHJlbTtcXG4gICAgYm94LXNoYWRvdzogMCAxcHggMXB4IDAgcmdiYSgwLCAwLCAwLCAwLjA2KTsgfVxcbiAgICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXBhZ2luYXRpb24tY29udGFpbmVyOm5vdCg6bGFzdC1jaGlsZCkge1xcbiAgICAgIG1hcmdpbi1yaWdodDogMXJlbTsgfVxcbiAgICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXBhZ2luYXRpb24tY29udGFpbmVyOm50aC1jaGlsZCgyKSBzdmcge1xcbiAgICAgIG1hcmdpbi1yaWdodDogMXJlbTsgfVxcbiAgICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXBhZ2luYXRpb24tY29udGFpbmVyOm50aC1jaGlsZCgzKSBzdmcge1xcbiAgICAgIG1hcmdpbi1sZWZ0OiAxcmVtOyB9XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtcGFnaW5hdGlvbi1jb250YWluZXItLWRpc2FibGVkIHtcXG4gICAgICBjdXJzb3I6IG5vdC1hbGxvd2VkO1xcbiAgICAgIGNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuMjUpO1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmNWY2Zjc7IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiAzMS41ZW0pIHtcXG4gICAgICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXBhZ2luYXRpb24tY29udGFpbmVyIHtcXG4gICAgICAgIG1hcmdpbjogMDsgfSB9XFxuICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXN2Zy1zaXplIHtcXG4gICAgaGVpZ2h0OiAycmVtO1xcbiAgICB3aWR0aDogMnJlbTsgfVxcbiAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1zdmctY29sb3Ige1xcbiAgICBmaWxsOiAjNTUxYThiOyB9XFxuXFxuLmFwaS1yZXN1bHRzLWRpc3BsYXlfX2Rpc3BsYXktYmFyIHtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHJnYmEoOTksIDY4LCAxNTAsIDAuMSk7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjZmNGZhO1xcbiAgY29sb3I6ICM1MzUzNTM7XFxuICBwYWRkaW5nLWxlZnQ6IDE2JTtcXG4gIG1hcmdpbi1ib3R0b206IDJyZW07XFxuICBoZWlnaHQ6IDIuMXJlbTsgfVxcbiAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA3MS44NzVlbSkge1xcbiAgICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fZGlzcGxheS1iYXIge1xcbiAgICAgIHBhZGRpbmctbGVmdDogNSU7IH0gfVxcblxcbi5hcGktcmVzdWx0cy1kaXNwbGF5X19tb2JpbGUge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2YzZjVmODtcXG4gIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCByZ2JhKDk5LCA2OCwgMTUwLCAwLjEpO1xcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgbWFyZ2luLWJvdHRvbTogMC4xcmVtO1xcbiAgaGVpZ2h0OiA1LjJyZW07XFxuICBkaXNwbGF5OiBub25lOyB9XFxuICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDUzLjEyNWVtKSB7XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19tb2JpbGUge1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgcGFkZGluZzogMS4ycmVtIDUlOyB9IH1cXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogMzEuNWVtKSB7XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19tb2JpbGUge1xcbiAgICAgIHBhZGRpbmc6IDEuMnJlbTsgfSB9XFxuICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbW9iaWxlLXN2Zy1zaXplIHtcXG4gICAgd2lkdGg6IDEuNHJlbTtcXG4gICAgaGVpZ2h0OiAxLjRyZW07IH1cXG5cXG4uYXBpLXJlc3VsdHMtZGlzcGxheV9fbW9iaWxlLWRpc3BsYXktb3B0aW9ucyB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjNmNWY4O1xcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHJnYmEoOTksIDY4LCAxNTAsIDAuMSk7XFxuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgYWxpZ24taXRlbXM6IGZsZXgtc3RhcnQ7XFxuICBwYWRkaW5nOiAxLjJyZW0gMDtcXG4gIGRpc3BsYXk6IG5vbmU7IH1cXG5cXG4uYXBpLXJlc3VsdHMtZGlzcGxheV9fbW9iaWxlLWRpc3BsYXktb3B0aW9ucy1ncm91cCB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgd2lkdGg6IDQ1JTtcXG4gIG1hcmdpbjogMCBhdXRvIDFyZW0gYXV0bzsgfVxcbiAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA1MS41NjI1ZW0pIHtcXG4gICAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX21vYmlsZS1kaXNwbGF5LW9wdGlvbnMtZ3JvdXAge1xcbiAgICAgIHdpZHRoOiA2MCU7IH0gfVxcbiAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiAzNy41ZW0pIHtcXG4gICAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX21vYmlsZS1kaXNwbGF5LW9wdGlvbnMtZ3JvdXAge1xcbiAgICAgIHdpZHRoOiA4MCU7IH0gfVxcbiAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiAyOC4xMjVlbSkge1xcbiAgICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbW9iaWxlLWRpc3BsYXktb3B0aW9ucy1ncm91cCB7XFxuICAgICAgd2lkdGg6IDk1JTsgfSB9XFxuICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbW9iaWxlLWRpc3BsYXktb3B0aW9ucy1ncm91cCBsYWJlbCB7XFxuICAgIG1hcmdpbi1yaWdodDogMXJlbTsgfVxcblxcbi5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtc2VsZWN0LS1tb2JpbGUge1xcbiAgd2lkdGg6IDI0cmVtOyB9XFxuICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDIxLjg3NWVtKSB7XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtc2VsZWN0LS1tb2JpbGUge1xcbiAgICAgIHdpZHRoOiAxNnJlbTsgfSB9XFxuXFxuLmFwaS1yZXN1bHRzLW1vYmlsZS1kaXNwbGF5LWJ0biB7XFxuICBhbGlnbi1zZWxmOiBjZW50ZXI7IH1cXG5cXG4ud3JhcHBlciB7XFxuICBvdmVyZmxvdy14OiBzY3JvbGw7XFxuICBvdmVyZmxvdy15OiBoaWRkZW47XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBkaXNwbGF5OiBmbGV4OyB9XFxuXFxuLmNhcmQtY2hlY2tsaXN0IHtcXG4gIHdpZHRoOiA2OCU7XFxuICBqdXN0aWZ5LXNlbGY6IGNlbnRlcjsgfVxcbiAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA3MS44NzVlbSkge1xcbiAgICAuY2FyZC1jaGVja2xpc3Qge1xcbiAgICAgIHdpZHRoOiA5MCU7IH0gfVxcbiAgLmNhcmQtY2hlY2tsaXN0X19yb3cge1xcbiAgICBkaXNwbGF5OiBncmlkO1xcbiAgICBoZWlnaHQ6IDNyZW07IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19yb3ctLTcge1xcbiAgICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogMTAlIDIyLjUlIDEwJSAxNy41JSAxNSUgMTUlIDEwJTsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX3Jvdy0tOSB7XFxuICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoOSwgMWZyKTsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX3Jvdy0taGVhZGVyIHtcXG4gICAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgIzAwMDtcXG4gICAgICBjb2xvcjogIzUzMWE4YjtcXG4gICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xcbiAgICAgIGZvbnQtc2l6ZTogMS4ycmVtICFpbXBvcnRhbnQ7XFxuICAgICAgZm9udC13ZWlnaHQ6IDIwMCAhaW1wb3J0YW50OyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fcm93LS1ncmV5IHtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjJmMmYyOyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fcm93Om50aC1jaGlsZChldmVuKSB7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2YyZjJmMjsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX3Jvdy0taGVhZGVyIHtcXG4gICAgICBoZWlnaHQ6IDMuNXJlbTsgfVxcbiAgLmNhcmQtY2hlY2tsaXN0X19kYXRhIHtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtd3JhcDogbm93cmFwO1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtc3RhcnQ7XFxuICAgIGZvbnQtc2l6ZTogMS40cmVtOyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fZGF0YS0tc2V0IHtcXG4gICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xcbiAgICAgIHBhZGRpbmctbGVmdDogMC41cmVtOyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fZGF0YS0tbmFtZSB7XFxuICAgICAganVzdGlmeS1jb250ZW50OiBmbGV4LXN0YXJ0OyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fZGF0YS0tcmFyaXR5IHtcXG4gICAgICB0ZXh0LXRyYW5zZm9ybTogY2FwaXRhbGl6ZTsgfVxcbiAgLmNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmsge1xcbiAgICBwYWRkaW5nOiAxcmVtIDA7XFxuICAgIGRpc3BsYXk6IGJsb2NrO1xcbiAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBjb2xvcjogIzAwMDtcXG4gICAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcXG4gICAgb3ZlcmZsb3c6IGhpZGRlbjtcXG4gICAgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmstLXByaWNlIHtcXG4gICAgICBjb2xvcjogIzAwNjg4NTsgfVxcblxcbi50b29sdGlwIHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHotaW5kZXg6IDU7XFxuICB3aWR0aDogMjRyZW07XFxuICBoZWlnaHQ6IDM0cmVtOyB9XFxuICAudG9vbHRpcF9faW1nIHtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGhlaWdodDogMTAwJTsgfVxcblxcbi5uZWdhdGl2ZS1lYXJuaW5ncyB7XFxuICBjb2xvcjogcmVkOyB9XFxuXFxuLnBvc2l0aXZlLWVhcm5pbmdzIHtcXG4gIGNvbG9yOiBncmVlbjsgfVxcblxcbi5pbWFnZS1ncmlkIHtcXG4gIHBhZGRpbmc6IDdyZW0gMTYlO1xcbiAgZGlzcGxheTogZ3JpZDtcXG4gIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KGF1dG8tZml0LCBtaW5tYXgoMjVyZW0sIDFmcikpO1xcbiAgZ3JpZC1jb2x1bW4tZ2FwOiAycmVtO1xcbiAgZ3JpZC1yb3ctZ2FwOiAxcmVtOyB9XFxuICAuaW1hZ2UtZ3JpZF9fb3V0ZXItZGl2IHtcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuICAuaW1hZ2UtZ3JpZF9faW5uZXItZGl2IHtcXG4gICAgcGVyc3BlY3RpdmU6IDE1MHJlbTtcXG4gICAgaGVpZ2h0OiAzNHJlbTtcXG4gICAgd2lkdGg6IDI0cmVtOyB9XFxuICAuaW1hZ2UtZ3JpZF9fZG91YmxlIHtcXG4gICAgaGVpZ2h0OiAzNHJlbTtcXG4gICAgd2lkdGg6IDI0cmVtO1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIHRvcDogMDtcXG4gICAgbGVmdDogMDtcXG4gICAgYmFja2ZhY2UtdmlzaWJpbGl0eTogaGlkZGVuO1xcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgMC44cyBlYXNlOyB9XFxuICAgIC5pbWFnZS1ncmlkX19kb3VibGUtLWJhY2sge1xcbiAgICAgIHRyYW5zZm9ybTogcm90YXRlWSgxODBkZWcpOyB9XFxuICAuaW1hZ2UtZ3JpZF9fZG91YmxlLWJ0biB7XFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgdG9wOiAyNiU7XFxuICAgIGxlZnQ6IDc1JTtcXG4gICAgd2lkdGg6IDQuNHJlbTtcXG4gICAgaGVpZ2h0OiA0LjRyZW07XFxuICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjYpO1xcbiAgICBib3JkZXI6IDJweCBzb2xpZCAjMzQyNDQyO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgMC4ycztcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cXG4gICAgLmltYWdlLWdyaWRfX2RvdWJsZS1idG46aG92ZXIge1xcbiAgICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmOyB9XFxuICAuaW1hZ2UtZ3JpZF9fZG91YmxlLWJ0bi1zdmcge1xcbiAgICBoZWlnaHQ6IDIuNXJlbTtcXG4gICAgd2lkdGg6IDIuNXJlbTtcXG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7IH1cXG4gIC5pbWFnZS1ncmlkX19kb2J1bGUtYnRuLXN2Zy1jb2xvciB7XFxuICAgIGNvbG9yOiAjMTYxNjFkOyB9XFxuICAuaW1hZ2UtZ3JpZF9fY29udGFpbmVyIHtcXG4gICAgd2lkdGg6IDI0cmVtO1xcbiAgICBoZWlnaHQ6IDM0cmVtOyB9XFxuICAuaW1hZ2UtZ3JpZF9faW1hZ2Uge1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgaGVpZ2h0OiAxMDAlOyB9XFxuXFxuLmNhcmQge1xcbiAgd2lkdGg6IDEwMCU7XFxuICBwYWRkaW5nOiAwIDE2JTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBtYXJnaW4tdG9wOiAzcmVtO1xcbiAgcGFkZGluZy1ib3R0b206IDAuN3JlbTtcXG4gIGJvcmRlci1ib3R0b206IDFweCBkYXNoZWQgcmdiYSgwLCAwLCAwLCAwLjcpOyB9XFxuICAuY2FyZF9faW1nLWNvbnRhaW5lciB7XFxuICAgIHotaW5kZXg6IDI7XFxuICAgIGJvcmRlci1yYWRpdXM6IDEwMCU7IH1cXG4gIC5jYXJkX19pbWcge1xcbiAgICB3aWR0aDogMzNyZW07XFxuICAgIGhlaWdodDogNDZyZW07XFxuICAgIGJveC1zaGFkb3c6IDFweCAxcHggOHB4IHJnYmEoMCwgMCwgMCwgMC41KTtcXG4gICAgYm9yZGVyLXJhZGl1czogNC43NSUgLyAzLjUlOyB9XFxuICAuY2FyZF9faW1nLWxlZnQge1xcbiAgICB3aWR0aDogMzNyZW07XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICAgIHotaW5kZXg6IDI7IH1cXG4gIC5jYXJkX19pbWctYnRuIHtcXG4gICAgYWxpZ24tc2VsZjogY2VudGVyO1xcbiAgICBtYXJnaW4tdG9wOiAxcmVtO1xcbiAgICBoZWlnaHQ6IDIuOHJlbTtcXG4gICAgZm9udC1zaXplOiAxLjRyZW07XFxuICAgIGxpbmUtaGVpZ2h0OiAxLjg7XFxuICAgIGNvbG9yOiAjNTUxYThiO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjlmN2Y1O1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDg1LCAyNiwgMTM5LCAwLjUpO1xcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XFxuICAgIGJveC1zaGFkb3c6IDAgMXB4IDAgcmdiYSgwLCAwLCAwLCAwLjA2KTtcXG4gICAgdHJhbnNpdGlvbjogYWxsIDAuMnM7XFxuICAgIHBhZGRpbmc6IDAuMnJlbSAwLjVyZW07XFxuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfVxcbiAgICAuY2FyZF9faW1nLWJ0bjpob3ZlciB7XFxuICAgICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxuICAgICAgYm9yZGVyLWNvbG9yOiAjNjM0NDk2OyB9XFxuICAuY2FyZF9faW1nLXN2ZyB7XFxuICAgIGhlaWdodDogMS40cmVtO1xcbiAgICB3aWR0aDogMS40cmVtO1xcbiAgICBtYXJnaW4tcmlnaHQ6IDAuM3JlbTtcXG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7IH1cXG4gIC5jYXJkX19pbWctc3ZnLWNvbG9yIHtcXG4gICAgZmlsbDogIzU1MWE4YjsgfVxcbiAgLmNhcmRfX2ltZy1kb3VibGUtYXJlYSB7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcbiAgLmNhcmRfX2ltZy1kb3VibGUtc2lkZWQge1xcbiAgICBwZXJzcGVjdGl2ZTogMTUwcmVtO1xcbiAgICBoZWlnaHQ6IDQ2cmVtOyB9XFxuICAuY2FyZF9faW1nLWRvdWJsZSB7XFxuICAgIHdpZHRoOiAzM3JlbTtcXG4gICAgaGVpZ2h0OiA0NnJlbTtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICB0b3A6IDA7XFxuICAgIGxlZnQ6IDA7XFxuICAgIGJhY2tmYWNlLXZpc2liaWxpdHk6IGhpZGRlbjtcXG4gICAgb3ZlcmZsb3c6IGhpZGRlbjsgfVxcbiAgICAuY2FyZF9faW1nLWRvdWJsZS0tYmFjayB7XFxuICAgICAgdHJhbnNmb3JtOiByb3RhdGVZKDE4MGRlZyk7IH1cXG4gIC5jYXJkX190ZXh0IHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gICAgYm9yZGVyLXJhZGl1czogNHB4O1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDAsIDAsIDAsIDAuMjUpO1xcbiAgICBib3JkZXItdG9wOiAzcHggc29saWQgIzAwMDtcXG4gICAgYm9yZGVyLWJvdHRvbTogM3B4IHNvbGlkICMwMDA7XFxuICAgIG1hcmdpbi10b3A6IDJyZW07XFxuICAgIHdpZHRoOiAzNHJlbTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gICAgcGFkZGluZzogM3JlbTtcXG4gICAgbWFyZ2luLXJpZ2h0OiAzcmVtO1xcbiAgICBtYXJnaW4tbGVmdDogLTJyZW07IH1cXG4gICAgLmNhcmRfX3RleHQtZmxleCB7XFxuICAgICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcXG4gICAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2JmYmZiZjsgfVxcbiAgICAuY2FyZF9fdGV4dC10aXRsZSB7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAgICAgLmNhcmRfX3RleHQtdGl0bGUtaDMge1xcbiAgICAgICAgZm9udC1zaXplOiAxLjhyZW07XFxuICAgICAgICBmb250LXdlaWdodDogNDAwO1xcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuICAgIC5jYXJkX190ZXh0LWNvbG9yLWluZGljYXRvciB7XFxuICAgICAgd2lkdGg6IDEuM3JlbTtcXG4gICAgICBoZWlnaHQ6IDEuM3JlbTtcXG4gICAgICBib3JkZXI6IDFweCBzb2xpZCAjMzMzO1xcbiAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gICAgICBib3gtc2hhZG93OiAwcHggMHB4IDBweCAycHggcmdiYSgwLCAwLCAwLCAwLjIpO1xcbiAgICAgIG1hcmdpbi1yaWdodDogMC43cmVtO1xcbiAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jazsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWNvbG9yLWluZGljYXRvci0tVSB7XFxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDEyOCwgMTI4LCAyNTUsIDAuNyk7IH1cXG4gICAgICAuY2FyZF9fdGV4dC1jb2xvci1pbmRpY2F0b3ItLUIge1xcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAwLCAwLCAwLjcpOyB9XFxuICAgICAgLmNhcmRfX3RleHQtY29sb3ItaW5kaWNhdG9yLS1SIHtcXG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjU1LCA3NywgNzcsIDAuNyk7IH1cXG4gICAgICAuY2FyZF9fdGV4dC1jb2xvci1pbmRpY2F0b3ItLVcge1xcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjcpOyB9XFxuICAgICAgLmNhcmRfX3RleHQtY29sb3ItaW5kaWNhdG9yLS1HIHtcXG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMjU1LCAwLCAwLjcpOyB9XFxuICAgIC5jYXJkX190ZXh0LW9yYWNsZS1wIHtcXG4gICAgICBtYXJnaW4tYm90dG9tOiAxcmVtO1xcbiAgICAgIGZvbnQtc2l6ZTogMS4zcmVtOyB9XFxuICAgIC5jYXJkX190ZXh0LW9yYWNsZS1mbGF2b3Ige1xcbiAgICAgIGZvbnQtc2l6ZTogMS4zcmVtO1xcbiAgICAgIGZvbnQtc3R5bGU6IGl0YWxpYzsgfVxcbiAgICAuY2FyZF9fdGV4dC1pbGx1c3RyYXRvciB7XFxuICAgICAgZm9udC1zaXplOiAxLjJyZW07XFxuICAgICAgZm9udC1zdHlsZTogaXRhbGljOyB9XFxuICAgIC5jYXJkX190ZXh0LWxlZ2FsIHtcXG4gICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgIGZsZXgtZGlyZWN0aW9uOiByb3c7XFxuICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuOyB9XFxuICAgICAgLmNhcmRfX3RleHQtbGVnYWwtaGFsZiB7XFxuICAgICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWxlZ2FsLXNwYW4tY29udGFpbmVyIHtcXG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICAgICAgZm9udC1zaXplOiAxLjRyZW07IH1cXG4gICAgICAgIC5jYXJkX190ZXh0LWxlZ2FsLXNwYW4tY29udGFpbmVyOm5vdCg6bGFzdC1jaGlsZCkge1xcbiAgICAgICAgICBtYXJnaW4tYm90dG9tOiAwLjVyZW07IH1cXG4gICAgICAuY2FyZF9fdGV4dC1sZWdhbC1zcGFuLWJveCB7XFxuICAgICAgICB3aWR0aDogNnJlbTtcXG4gICAgICAgIGhlaWdodDogMi41cmVtO1xcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAwLjNyZW07XFxuICAgICAgICBmb250LXNpemU6IDFyZW07XFxuICAgICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xcbiAgICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDNweDsgfVxcbiAgICAgICAgLmNhcmRfX3RleHQtbGVnYWwtc3Bhbi1ib3gtLW5vdF9sZWdhbCB7XFxuICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6ICNlNjAwMDA7IH1cXG4gICAgICAgIC5jYXJkX190ZXh0LWxlZ2FsLXNwYW4tYm94LS1sZWdhbCB7XFxuICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6ICMwMDk5MDA7IH1cXG4gICAgICAuY2FyZF9fdGV4dC1sZWdhbC1zcGFuLWJveCB7XFxuICAgICAgICBjb2xvcjogI2ZmZjsgfVxcbiAgLmNhcmRfX3NldCB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH1cXG4gICAgLmNhcmRfX3NldC1iYW5uZXIge1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgYm9yZGVyOiAxcHggc29saWQgI2JmYmZiZjtcXG4gICAgICB3aWR0aDogNDByZW07XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzQ5NDY1YztcXG4gICAgICBjb2xvcjogI2ZkZmRmZDtcXG4gICAgICBwYWRkaW5nOiAwLjdyZW07XFxuICAgICAgYm9yZGVyLXJhZGl1czogM3B4OyB9XFxuICAgICAgLmNhcmRfX3NldC1iYW5uZXItc3ZnLWNvbnRhaW5lciB7XFxuICAgICAgICBtYXJnaW4tcmlnaHQ6IDFyZW07IH1cXG4gICAgICAuY2FyZF9fc2V0LWJhbm5lci1zdmcge1xcbiAgICAgICAgd2lkdGg6IDIuNHJlbTtcXG4gICAgICAgIGhlaWdodDogMi40cmVtO1xcbiAgICAgICAgZmlsdGVyOiBpbnZlcnQoMTAwJSk7IH1cXG4gICAgLmNhcmRfX3NldC1kZXRhaWxzIHtcXG4gICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH1cXG4gICAgLmNhcmRfX3NldC1oZWFkZXItbmFtZSB7XFxuICAgICAgZm9udC1zaXplOiAxLjdyZW1yZW07IH1cXG4gICAgLmNhcmRfX3NldC1oZWFkZXItY29kZSB7XFxuICAgICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTsgfVxcbiAgICAuY2FyZF9fc2V0LXByaW50cy1oZWFkZXIge1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICM0OTQ2NWM7XFxuICAgICAgY29sb3I6ICNmZGZkZmQ7XFxuICAgICAgZm9udC1zaXplOiAxLjNyZW07XFxuICAgICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcXG4gICAgICBib3JkZXI6IDFweCBzb2xpZCAjYmZiZmJmO1xcbiAgICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgICBwYWRkaW5nOiAwLjNyZW0gMC43cmVtOyB9XFxuICAgIC5jYXJkX19zZXQtcHJpbnRzLXN2Zy1jb250YWluZXIge1xcbiAgICAgIGhlaWdodDogMS44cmVtO1xcbiAgICAgIHdpZHRoOiAxLjhyZW07XFxuICAgICAgYm9yZGVyOiAxcHggc29saWQgI2JmYmZiZjtcXG4gICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgICAgYm9yZGVyLXJhZGl1czogMTAwJTsgfVxcbiAgICAuY2FyZF9fc2V0LXByaW50cy1zdmctLWNvbW1vbiB7XFxuICAgICAgZmlsbDogIzAwMDsgfVxcbiAgICAuY2FyZF9fc2V0LXByaW50cy1zdmctLXVuY29tbW9uIHtcXG4gICAgICBmaWxsOiAjZTZlNmU2OyB9XFxuICAgIC5jYXJkX19zZXQtcHJpbnRzLXN2Zy0tcmFyZSB7XFxuICAgICAgZmlsbDogI2U2YzMwMDsgfVxcbiAgICAuY2FyZF9fc2V0LXByaW50cy1zdmctLW15dGhpYyB7XFxuICAgICAgZmlsbDogI2ZmMDAwMDsgfVxcbiAgICAuY2FyZF9fc2V0LXByaW50cy1saXN0IHtcXG4gICAgICBsaXN0LXN0eWxlOiBub25lO1xcbiAgICAgIGJvcmRlci1yYWRpdXM6IDNweDsgfVxcbiAgICAgIC5jYXJkX19zZXQtcHJpbnRzLWxpc3QtbGluazpsaW5rLCAuY2FyZF9fc2V0LXByaW50cy1saXN0LWxpbms6dmlzaXRlZCB7XFxuICAgICAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICAgICAgICBjb2xvcjogIzAwMDsgfVxcbiAgICAgIC5jYXJkX19zZXQtcHJpbnRzLWxpc3QtaXRlbSB7XFxuICAgICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICAgICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNlN2U5ZWM7XFxuICAgICAgICBib3JkZXItbGVmdDogMXB4IHNvbGlkICNjZGNkY2Q7XFxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgICAgICAgcGFkZGluZzogMC4yNXJlbSAwOyB9XFxuICAgICAgICAuY2FyZF9fc2V0LXByaW50cy1saXN0LWl0ZW0tLXBsLTE0IHtcXG4gICAgICAgICAgcGFkZGluZy1sZWZ0OiAxLjRyZW07XFxuICAgICAgICAgIGJvcmRlci1ib3R0b206IDNweCBzb2xpZCAjMDAwOyB9XFxuICAgICAgICAuY2FyZF9fc2V0LXByaW50cy1saXN0LWl0ZW06aG92ZXIge1xcbiAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjJmMmYyOyB9XFxuICAgICAgLmNhcmRfX3NldC1wcmludHMtbGlzdC1pdGVtLW5hbWUtd3JhcHBlciB7XFxuICAgICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgICAgIG1hcmdpbi1sZWZ0OiAtMXJlbTsgfVxcbiAgICAgIC5jYXJkX19zZXQtcHJpbnRzLWxpc3QtaXRlbS1zZXQtbmFtZSB7XFxuICAgICAgICBtYXJnaW4tbGVmdDogMC41cmVtOyB9XFxuICAgICAgLmNhcmRfX3NldC1wcmludHMtbGlzdC1pdGVtLXByaWNlIHtcXG4gICAgICAgIG1hcmdpbi1yaWdodDogMC43cmVtO1xcbiAgICAgICAgY29sb3I6ICMwMDY4ODU7IH1cXG5cXG4uY2FyZC1wYWdlIHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgZ3JpZC1jb2x1bW46IDEgLyAtMTtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcblxcbi5hZGQtdG8taW52LFxcbi5yZW1vdmUtZnJvbS1pbnYge1xcbiAgbWFyZ2luLXRvcDogM3JlbTtcXG4gIHdpZHRoOiA1MCU7XFxuICBtYXJnaW4tbGVmdDogNTAlO1xcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC01MCUpO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH1cXG4gIC5hZGQtdG8taW52X19oZWFkZXIsXFxuICAucmVtb3ZlLWZyb20taW52X19oZWFkZXIge1xcbiAgICBjb2xvcjogIzE2MTYxZDtcXG4gICAgZm9udC1zaXplOiAyLjJyZW07XFxuICAgIGZvbnQtd2VpZ2h0OiAzMDA7XFxuICAgIG1hcmdpbjogMCBhdXRvIDFyZW0gYXV0bzsgfVxcbiAgLmFkZC10by1pbnZfX2Zvcm0sXFxuICAucmVtb3ZlLWZyb20taW52X19mb3JtIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgfVxcbiAgICAuYWRkLXRvLWludl9fZm9ybS1wcmljZSxcXG4gICAgLnJlbW92ZS1mcm9tLWludl9fZm9ybS1wcmljZSB7XFxuICAgICAgd2lkdGg6IDIwcmVtO1xcbiAgICAgIGhlaWdodDogMy41cmVtO1xcbiAgICAgIG1hcmdpbi1ib3R0b206IDFyZW07XFxuICAgICAgcGFkZGluZzogMXJlbTtcXG4gICAgICBib3JkZXI6IHNvbGlkIDFweCAjYmZiZmJmO1xcbiAgICAgIGJvcmRlci1yYWRpdXM6IDVweDsgfVxcbiAgICAgIC5hZGQtdG8taW52X19mb3JtLXByaWNlOmZvY3VzLFxcbiAgICAgIC5yZW1vdmUtZnJvbS1pbnZfX2Zvcm0tcHJpY2U6Zm9jdXMge1xcbiAgICAgICAgYm9yZGVyOiBzb2xpZCAxcHggIzAwMDsgfVxcbiAgICAuYWRkLXRvLWludl9fZm9ybS1ncm91cCxcXG4gICAgLnJlbW92ZS1mcm9tLWludl9fZm9ybS1ncm91cCB7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWV2ZW5seTtcXG4gICAgICBhbGlnbi1jb250ZW50OiBjZW50ZXI7XFxuICAgICAgbWFyZ2luLWJvdHRvbTogMS41cmVtO1xcbiAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcbiAgICAuYWRkLXRvLWludl9fZm9ybS1sYWJlbCxcXG4gICAgLnJlbW92ZS1mcm9tLWludl9fZm9ybS1sYWJlbCB7XFxuICAgICAgbWFyZ2luLXJpZ2h0OiAwLjNyZW07XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBhbGlnbi1jb250ZW50OiBjZW50ZXI7XFxuICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgICAgY29sb3I6ICMxNjE2MWQ7XFxuICAgICAgbWFyZ2luLXRvcDogMC40NXJlbTsgfVxcbiAgLmFkZC10by1pbnYtcHJpY2UtbXNnLFxcbiAgLnJlbW92ZS1mcm9tLWludi1wcmljZS1tc2cge1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIGJvdHRvbTogLTEuOHJlbTtcXG4gICAgcmlnaHQ6IDI1JTtcXG4gICAgY29sb3I6IHJlZDsgfVxcbiAgLmFkZC10by1pbnZfX3N1Ym1pdCxcXG4gIC5yZW1vdmUtZnJvbS1pbnZfX3N1Ym1pdCB7XFxuICAgIGFsaWduLXNlbGY6IGNlbnRlcjtcXG4gICAgaGVpZ2h0OiAzLjFyZW07XFxuICAgIGZvbnQtc2l6ZTogMS40cmVtO1xcbiAgICBsaW5lLWhlaWdodDogMS44O1xcbiAgICBjb2xvcjogIzU1MWE4YjtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2Y5ZjdmNTtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSg4NSwgMjYsIDEzOSwgMC41KTtcXG4gICAgYm9yZGVyLXJhZGl1czogM3B4O1xcbiAgICBib3gtc2hhZG93OiAwIDFweCAwIHJnYmEoMCwgMCwgMCwgMC4wNik7XFxuICAgIHRyYW5zaXRpb246IGFsbCAwLjJzO1xcbiAgICBwYWRkaW5nOiAwLjJyZW0gMC43NXJlbTtcXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBtYXJnaW4tYm90dG9tOiAxcmVtOyB9XFxuICAgIC5hZGQtdG8taW52X19zdWJtaXQ6aG92ZXIsXFxuICAgIC5yZW1vdmUtZnJvbS1pbnZfX3N1Ym1pdDpob3ZlciB7XFxuICAgICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxuICAgICAgYm9yZGVyLWNvbG9yOiAjNjM0NDk2OyB9XFxuXFxuLnV0aWwtc3BhY2U6OmJlZm9yZSxcXG4udXRpbC1zcGFjZTo6YWZ0ZXIge1xcbiAgY29udGVudDogJyc7XFxuICBtYXJnaW46IDAgMC4ycmVtOyB9XFxuXFxuLm5vLXJlc3VsdHMge1xcbiAganVzdGlmeS1zZWxmOiBjZW50ZXI7IH1cXG5cXG4uaG9tZXBhZ2Uge1xcbiAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KHRvIGJvdHRvbSwgIzFkMWMyNSwgIzQzMWUzZik7XFxuICBiYWNrZ3JvdW5kLXJlcGVhdDogbm8tcmVwZWF0O1xcbiAgaGVpZ2h0OiAxMDB2aDtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBvdmVyZmxvdy14OiBoaWRkZW4gIWltcG9ydGFudDtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgYmFja2dyb3VuZC1zaXplOiBjb3ZlcjsgfVxcbiAgLmhvbWVwYWdlX19jZW50ZXIge1xcbiAgICBhbGlnbi1zZWxmOiBjZW50ZXI7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiAyOC4xMjVlbSkge1xcbiAgICAgIC5ob21lcGFnZV9fY2VudGVyIHtcXG4gICAgICAgIG1hcmdpbi10b3A6IC0xMnJlbTsgfSB9XFxuICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDQwLjYyNWVtKSB7XFxuICAgIC5ob21lcGFnZV9fY2VudGVyLWhlYWRpbmctd3JhcHBlciB7XFxuICAgICAgbWFyZ2luOiAwIGF1dG8gMC41cmVtIGF1dG87XFxuICAgICAgd2lkdGg6IDc1JTtcXG4gICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICAgIHRleHQtYWxpZ246IGNlbnRlcjsgfSB9XFxuICAuaG9tZXBhZ2VfX3NlYXJjaCB7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcbiAgLmhvbWVwYWdlX19zZWFyY2gtaW5wdXQge1xcbiAgICBwYWRkaW5nOiAxLjJyZW0gMS40cmVtIDEuMnJlbSA2LjJyZW07XFxuICAgIGZvbnQtc2l6ZTogM3JlbTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzI0MjAzMTtcXG4gICAgY29sb3I6ICNkN2Q3ZDc7XFxuICAgIGJvcmRlci1yYWRpdXM6IDRweDtcXG4gICAgYm94LXNoYWRvdzogMHB4IDBweCAwcHggMnB4IHJnYmEoMCwgMCwgMCwgMC41KTtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC41KTsgfVxcbiAgICAuaG9tZXBhZ2VfX3NlYXJjaC1pbnB1dDo6cGxhY2Vob2xkZXIge1xcbiAgICAgIHRleHQtYWxpZ246IGNlbnRlcjsgfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDQwLjYyNWVtKSB7XFxuICAgICAgLmhvbWVwYWdlX19zZWFyY2gtaW5wdXQge1xcbiAgICAgICAgd2lkdGg6IDgwJTtcXG4gICAgICAgIG1hcmdpbi1sZWZ0OiAxMCU7IH0gfVxcbiAgLmhvbWVwYWdlX19zZWFyY2gtYnRuIHtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICBsZWZ0OiA2cmVtO1xcbiAgICB0b3A6IDJyZW07IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA0MC42MjVlbSkge1xcbiAgICAgIC5ob21lcGFnZV9fc2VhcmNoLWJ0biB7XFxuICAgICAgICBsZWZ0OiAxMnJlbTsgfSB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogMjguMTI1ZW0pIHtcXG4gICAgICAuaG9tZXBhZ2VfX3NlYXJjaC1idG4ge1xcbiAgICAgICAgbGVmdDogMTByZW07IH0gfVxcbiAgLmhvbWVwYWdlX19pY29uLXNpemluZy0tc2VhcmNoIHtcXG4gICAgd2lkdGg6IDNyZW07XFxuICAgIGhlaWdodDogM3JlbTtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC0xNTAlKTsgfVxcbiAgLmhvbWVwYWdlX19pY29uLXBhdGgge1xcbiAgICBmaWxsOiAjYmZiZmJmOyB9XFxuICAuaG9tZXBhZ2VfX2xpbmtzIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA0MC42MjVlbSkge1xcbiAgICAgIC5ob21lcGFnZV9fbGlua3Mge1xcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgfSB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogMjguMTI1ZW0pIHtcXG4gICAgICAuaG9tZXBhZ2VfX2xpbmtzIHtcXG4gICAgICAgIG1hcmdpbi1sZWZ0OiA3LjUlOyB9IH1cXG4gIC5ob21lcGFnZV9fbGluayB7XFxuICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSg4NSwgMjYsIDEzOSwgMC41KTtcXG4gICAgYm9yZGVyLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNik7XFxuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgY29sb3I6ICNmZmY7XFxuICAgIG1hcmdpbi10b3A6IDAuNnJlbTtcXG4gICAgbWFyZ2luLXJpZ2h0OiAzcmVtO1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgIGxpbmUtaGVpZ2h0OiAxLjQ7XFxuICAgIHBhZGRpbmc6IDAuMnJlbSAxcmVtIDAgMXJlbTtcXG4gICAgaGVpZ2h0OiAyLjhyZW07XFxuICAgIHRyYW5zaXRpb246IGFsbCAwLjJzO1xcbiAgICBib3gtc2hhZG93OiAwIDFweCAxcHggMCByZ2JhKDAsIDAsIDAsIDAuMDYpO1xcbiAgICBtaW4td2lkdGg6IDlyZW07XFxuICAgIHRleHQtYWxpZ246IGNlbnRlcjsgfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDQwLjYyNWVtKSB7XFxuICAgICAgLmhvbWVwYWdlX19saW5rIHtcXG4gICAgICAgIGFsaWduLXNlbGY6IGNlbnRlcjtcXG4gICAgICAgIHdpZHRoOiAxNC41cmVtOyB9IH1cXG4gICAgLmhvbWVwYWdlX19saW5rOmhvdmVyIHtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDkpOyB9XFxuXFxuLmludmVudG9yeS1kZXRhaWxzIHtcXG4gIGdyaWQtY29sdW1uOiAxIC8gLTE7XFxuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgcmdiYSg5OSwgNjgsIDE1MCwgMC4xKTtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmNmY0ZmE7XFxuICBjb2xvcjogIzUzNTM1MztcXG4gIHBhZGRpbmc6IDFyZW0gMTYlO1xcbiAgbWFyZ2luLWJvdHRvbTogMnJlbTtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47IH1cXG4gIC5pbnZlbnRvcnktZGV0YWlsc19fbGluayB7XFxuICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gICAgY29sb3I6IHJnYmEoODMsIDgzLCA4MywgMC43NSk7XFxuICAgIHRyYW5zaXRpb246IGFsbCAwLjJzO1xcbiAgICBwYWRkaW5nOiAwIDAuNnJlbTtcXG4gICAgYm9yZGVyLWxlZnQ6IDFweCBzb2xpZCAjNTM1MzUzO1xcbiAgICBib3JkZXItcmlnaHQ6IDFweCBzb2xpZCAjNTM1MzUzOyB9XFxuICAgIC5pbnZlbnRvcnktZGV0YWlsc19fbGluazpob3ZlciB7XFxuICAgICAgY29sb3I6ICM1MzUzNTM7IH1cXG4gIC5pbnZlbnRvcnktZGV0YWlscyBzcGFuIHtcXG4gICAgY29sb3I6ICMwMDY4ODU7IH1cXG5cXG4uaG9tZXBhZ2VfX2NvbGFnZSxcXG4uY2FyZHBhZ2VfX2NvbGFnZSB7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICBvdmVyZmxvdzogaGlkZGVuO1xcbiAgbGVmdDogMDtcXG4gIGhlaWdodDogMTVyZW07XFxuICB3aWR0aDogMTAwJTsgfVxcblxcbi5ob21lcGFnZV9fY29sYWdlIHtcXG4gIGJvdHRvbTogMDsgfVxcblxcbi5jYXJkcGFnZV9fY29sYWdlIHtcXG4gIGJvdHRvbTogLTIuNnJlbTsgfVxcblxcbi5ob21lcGFnZV9fY29sYWdlLWlubmVyLFxcbi5jYXJkcGFnZV9fY29sYWdlLWlubmVyIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIGhlaWdodDogMTAwJTtcXG4gIG1hcmdpbi1sZWZ0OiA1MCU7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTUwJSk7XFxuICB3aWR0aDogNjUuNXJlbTsgfVxcblxcbi5ob21lcGFnZV9fY29sYWdlLWNhcmQsXFxuLmNhcmRwYWdlX19jb2xhZ2UtY2FyZCB7XFxuICB3aWR0aDogMTYuOHJlbTtcXG4gIGhlaWdodDogMjMuNHJlbTtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIGJvcmRlci1yYWRpdXM6IDUlIC8gMy43NSU7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMCk7XFxuICB0cmFuc2l0aW9uOiBhbGwgMC4zcztcXG4gIGJveC1zaGFkb3c6IGluc2V0IDAgMCAzcHggM3B4ICMwMDA7IH1cXG4gIC5ob21lcGFnZV9fY29sYWdlLWNhcmQ6bnRoLWNoaWxkKDEpLFxcbiAgLmNhcmRwYWdlX19jb2xhZ2UtY2FyZDpudGgtY2hpbGQoMSkge1xcbiAgICB0b3A6IDIuMnJlbTsgfVxcbiAgLmhvbWVwYWdlX19jb2xhZ2UtY2FyZDpudGgtY2hpbGQoMiksXFxuICAuY2FyZHBhZ2VfX2NvbGFnZS1jYXJkOm50aC1jaGlsZCgyKSB7XFxuICAgIHRvcDogNi4ycmVtO1xcbiAgICBsZWZ0OiAzLjVyZW07IH1cXG4gIC5ob21lcGFnZV9fY29sYWdlLWNhcmQ6bnRoLWNoaWxkKDMpLFxcbiAgLmNhcmRwYWdlX19jb2xhZ2UtY2FyZDpudGgtY2hpbGQoMykge1xcbiAgICB0b3A6IDFyZW07XFxuICAgIGxlZnQ6IDE3LjRyZW07IH1cXG4gIC5ob21lcGFnZV9fY29sYWdlLWNhcmQ6bnRoLWNoaWxkKDQpLFxcbiAgLmNhcmRwYWdlX19jb2xhZ2UtY2FyZDpudGgtY2hpbGQoNCkge1xcbiAgICB0b3A6IDQuNXJlbTtcXG4gICAgbGVmdDogMjAuNnJlbTsgfVxcbiAgLmhvbWVwYWdlX19jb2xhZ2UtY2FyZDpudGgtY2hpbGQoNSksXFxuICAuY2FyZHBhZ2VfX2NvbGFnZS1jYXJkOm50aC1jaGlsZCg1KSB7XFxuICAgIHRvcDogMS42cmVtO1xcbiAgICBsZWZ0OiAzNC43cmVtOyB9XFxuICAuaG9tZXBhZ2VfX2NvbGFnZS1jYXJkOm50aC1jaGlsZCg2KSxcXG4gIC5jYXJkcGFnZV9fY29sYWdlLWNhcmQ6bnRoLWNoaWxkKDYpIHtcXG4gICAgdG9wOiA2LjVyZW07XFxuICAgIGxlZnQ6IDM4cmVtOyB9XFxuICAuaG9tZXBhZ2VfX2NvbGFnZS1jYXJkOm50aC1jaGlsZCg3KSxcXG4gIC5jYXJkcGFnZV9fY29sYWdlLWNhcmQ6bnRoLWNoaWxkKDcpIHtcXG4gICAgdG9wOiAzLjVyZW07XFxuICAgIHJpZ2h0OiAwOyB9XFxuICAuaG9tZXBhZ2VfX2NvbGFnZS1jYXJkOmhvdmVyLFxcbiAgLmNhcmRwYWdlX19jb2xhZ2UtY2FyZDpob3ZlciB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtNSUpOyB9XFxuXFxuLmNvbnRhaW5lciB7XFxuICBkaXNwbGF5OiBncmlkO1xcbiAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiBbZnVsbC1zdGFydF0gbWlubWF4KDZyZW0sIDFmcikgW2NlbnRlci1zdGFydF0gcmVwZWF0KDgsIFtjb2wtc3RhcnRdIG1pbm1heChtaW4tY29udGVudCwgMTRyZW0pIFtjb2wtZW5kXSkgW2NlbnRlci1lbmRdIG1pbm1heCg2cmVtLCAxZnIpIFtmdWxsLWVuZF07XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjVmNmY3O1xcbiAgYmFja2dyb3VuZC1zaXplOiBjb3ZlcjtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcblxcbi5zZWFyY2gge1xcbiAgZ3JpZC1jb2x1bW46IGZ1bGwtc3RhcnQgLyBmdWxsLWVuZDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZmY7IH1cXG5cXG4uYXBpLXJlc3VsdHMtZGlzcGxheSB7XFxuICBncmlkLWNvbHVtbjogZnVsbC1zdGFydCAvIGZ1bGwtZW5kO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2Y1ZjZmNztcXG4gIGJhY2tncm91bmQtc2l6ZTogY292ZXI7XFxuICBkaXNwbGF5OiBncmlkOyB9XFxuXCJdLFwic291cmNlUm9vdFwiOlwiXCJ9XSk7XG4vLyBFeHBvcnRzXG5leHBvcnQgZGVmYXVsdCBfX19DU1NfTE9BREVSX0VYUE9SVF9fXztcbiIsIi8vIEltcG9ydHNcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fIGZyb20gXCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvY3NzV2l0aE1hcHBpbmdUb1N0cmluZy5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyBmcm9tIFwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfR0VUX1VSTF9JTVBPUlRfX18gZnJvbSBcIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9nZXRVcmwuanNcIjtcbmltcG9ydCBfX19DU1NfTE9BREVSX1VSTF9JTVBPUlRfMF9fXyBmcm9tIFwiLi4vLi4vaW1nL21hbmEtc3ltYm9scy9tYW5hLnN2Z1wiO1xudmFyIF9fX0NTU19MT0FERVJfRVhQT1JUX19fID0gX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fKF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18pO1xudmFyIF9fX0NTU19MT0FERVJfVVJMX1JFUExBQ0VNRU5UXzBfX18gPSBfX19DU1NfTE9BREVSX0dFVF9VUkxfSU1QT1JUX19fKF9fX0NTU19MT0FERVJfVVJMX0lNUE9SVF8wX19fKTtcbi8vIE1vZHVsZVxuX19fQ1NTX0xPQURFUl9FWFBPUlRfX18ucHVzaChbbW9kdWxlLmlkLCBcIi5tYW5hIHtcXG4gICAgYmFja2dyb3VuZC1pbWFnZTogdXJsKFwiICsgX19fQ1NTX0xPQURFUl9VUkxfUkVQTEFDRU1FTlRfMF9fXyArIFwiKTtcXG4gICAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcXG4gICAgYmFja2dyb3VuZC1zaXplOiBhdXRvIDcwMCU7XFxuICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gICAgZm9udC1zaXplOiAxMDAlO1xcbn1cXG5cXG4ubWFuYS54cyB7XFxuICAgIHdpZHRoOiAxLjVyZW07XFxuICAgIGhlaWdodDogMS41cmVtO1xcbn1cXG5cXG4ubWFuYS5zbWFsbCB7XFxuICAgIGhlaWdodDogMnJlbTtcXG4gICAgd2lkdGg6IDJyZW07XFxufVxcbi5tYW5hLm1lZGl1bSB7XFxuICAgIGhlaWdodDogMmVtO1xcbiAgICB3aWR0aDogMmVtO1xcbn1cXG4ubWFuYS5sYXJnZSB7XFxuICAgIGhlaWdodDogNGVtO1xcbiAgICB3aWR0aDogNGVtO1xcbn1cXG4ubWFuYS5zIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMCAwOyB9XFxuLm1hbmEuczEgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAxMS4xJSAwOyB9XFxuLm1hbmEuczIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAyMi4yJSAwOyB9XFxuLm1hbmEuczMgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAzMy4zJSAwOyB9XFxuLm1hbmEuczQgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA0NC40JSAwOyB9XFxuLm1hbmEuczUgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA1NS41JSAwOyB9XFxuLm1hbmEuczYgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA2Ni42JSAwOyB9XFxuLm1hbmEuczcgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA3Ny43JSAwOyB9XFxuLm1hbmEuczggeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4OC44JSAwOyB9XFxuLm1hbmEuczkgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA5OS45JSAwOyB9XFxuXFxuLm1hbmEuczEwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMCAxNiU7IH1cXG4ubWFuYS5zMTEgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAxMS4xJSAxNi42JTsgfVxcbi5tYW5hLnMxMiB7IGJhY2tncm91bmQtcG9zaXRpb246IDIyLjIlIDE2LjYlOyB9XFxuLm1hbmEuczEzIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMzMuMyUgMTYuNiU7IH1cXG4ubWFuYS5zMTQgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA0NC40JSAxNi42JTsgfVxcbi5tYW5hLnMxNSB7IGJhY2tncm91bmQtcG9zaXRpb246IDU1LjUlIDE2LjYlOyB9XFxuLm1hbmEuczE2IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNjYuNiUgMTYuNiU7IH1cXG4ubWFuYS5zMTcgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA3Ny43JSAxNi42JTsgfVxcbi5tYW5hLnMxOCB7IGJhY2tncm91bmQtcG9zaXRpb246IDg4LjglIDE2LjYlOyB9XFxuLm1hbmEuczE5IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogOTkuOSUgMTYuNiU7IH1cXG5cXG4ubWFuYS5zMjAgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwIDMzJTsgfVxcbi5tYW5hLnN4IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMTEuMSUgMzMuMyU7IH1cXG4ubWFuYS5zeSB7IGJhY2tncm91bmQtcG9zaXRpb246IDIyLjIlIDMzLjMlOyB9XFxuLm1hbmEuc3ogeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAzMy4zJSAzMy4zJTsgfVxcbi5tYW5hLnN3IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNDQuNCUgMzMuMyU7IH1cXG4ubWFuYS5zdSB7IGJhY2tncm91bmQtcG9zaXRpb246IDU1LjUlIDMzLjMlOyB9XFxuLm1hbmEuc2IgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA2Ni42JSAzMy4zJTsgfVxcbi5tYW5hLnNyIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNzcuNyUgMzMuMyU7IH1cXG4ubWFuYS5zZyB7IGJhY2tncm91bmQtcG9zaXRpb246IDg4LjglIDMzLjMlOyB9XFxuLm1hbmEuc3MgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA5OS45JSAzMy4zJTsgfVxcblxcbi5tYW5hLnN3dSB7IGJhY2tncm91bmQtcG9zaXRpb246IDAgNTAlOyB9XFxuLm1hbmEuc3diIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMTEuMSUgNTAlOyB9XFxuLm1hbmEuc3ViIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMjIuMiUgNTAlOyB9XFxuLm1hbmEuc3VyIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMzMuMyUgNTAlOyB9XFxuLm1hbmEuc2JyIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNDQuNCUgNTAlOyB9XFxuLm1hbmEuc2JnIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNTUuNSUgNTAlOyB9XFxuLm1hbmEuc3J3IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNjYuNiUgNTAlOyB9XFxuLm1hbmEuc3JnIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNzcuNyUgNTAlOyB9XFxuLm1hbmEuc2d3IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogODguOCUgNTAlOyB9XFxuLm1hbmEuc2d1IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogOTkuOSUgNTAlOyB9XFxuXFxuLm1hbmEuczJ3IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMCA2Ni42JTsgfVxcbi5tYW5hLnMydSB7IGJhY2tncm91bmQtcG9zaXRpb246IDExLjElIDY2LjYlOyB9XFxuLm1hbmEuczJiIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMjIuMiUgNjYuNiU7IH1cXG4ubWFuYS5zMnIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAzMy4zJSA2Ni42JTsgfVxcbi5tYW5hLnMyZyB7IGJhY2tncm91bmQtcG9zaXRpb246IDQ0LjQlIDY2LjYlOyB9XFxuLm1hbmEuc3dwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNTUuNSUgNjYuNiU7IH1cXG4ubWFuYS5zdXAgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA2Ni42JSA2Ni42JTsgfVxcbi5tYW5hLnNicCB7IGJhY2tncm91bmQtcG9zaXRpb246IDc3LjclIDY2LjYlOyB9XFxuLm1hbmEuc3JwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogODguOCUgNjYuNiU7IH1cXG4ubWFuYS5zZ3AgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA5OS45JSA2Ni42JTsgfVxcblxcbi5tYW5hLnN0IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMCUgODMuMyU7IH1cXG4ubWFuYS5zcSB7IGJhY2tncm91bmQtcG9zaXRpb246IDExLjElIDgzLjMlOyB9XFxuXFxuLm1hbmEuc2MgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA3Ny43JSA4My4zJTsgfVxcblxcbi5tYW5hLnNlIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogODguOCUgODMuMyU7IH1cXG5cXG4ubWFuYS5zMTAwMDAwMCB7IGJhY2tncm91bmQtcG9zaXRpb246IDAgMTAwJTsgfVxcbi5tYW5hLnMxMDAwMDAwLnNtYWxsIHsgd2lkdGg6IDQuOWVtOyB9XFxuLm1hbmEuczEwMDAwMDAubWVkaXVtIHsgd2lkdGg6IDkuN2VtOyB9XFxuLyoubWFuYS5zMTAwMDAwMC5sYXJnZSB7IHdpZHRoOiAxOC44ZW07IH0qL1xcbi5tYW5hLnMxMDAgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA2MCUgMTAwJTsgfVxcbi5tYW5hLnMxMDAuc21hbGwgeyB3aWR0aDogMS44ZW07IH1cXG4ubWFuYS5zMTAwLm1lZGl1bSB7IHdpZHRoOiAzLjdlbTsgfVxcbi8qLm1hbmEuczEwMC5sYXJnZSB7IHdpZHRoOiAxMC44ZW07IH0qL1xcbi5tYW5hLnNjaGFvcyB7IGJhY2tncm91bmQtcG9zaXRpb246IDc2LjUlIDEwMCU7IH1cXG4ubWFuYS5zY2hhb3Muc21hbGwgeyB3aWR0aDogMS4yZW07IH1cXG4ubWFuYS5zY2hhb3MubWVkaXVtIHsgd2lkdGg6IDIuM2VtOyB9XFxuLyoubWFuYS5zYy5sYXJnZSB7IHdpZHRoOiA0LjZlbTsgfSovXFxuLm1hbmEuc2h3IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogODMuNSUgMTAwJTsgfVxcbi5tYW5hLnNody5zbWFsbCB7IHdpZHRoOiAwLjVlbTsgfVxcbi5tYW5hLnNody5tZWRpdW0geyB3aWR0aDogMWVtOyB9XFxuLyoubWFuYS5zaHcubGFyZ2UgeyB3aWR0aDogMmVtOyB9Ki9cXG4ubWFuYS5zaHIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4OSUgMTAwJTsgfVxcbi5tYW5hLnNoci5zbWFsbCB7IHdpZHRoOiAwLjVlbTsgfVxcbi5tYW5hLnNoci5tZWRpdW0geyB3aWR0aDogMWVtOyB9XFxuLyoubWFuYS5zaHIubGFyZ2UgeyB3aWR0aDogMmVtOyB9Ki9cXG5cXG5cXG4uc2hhZG93IHtcXG4gICAgZmlsdGVyOiBcXFwicHJvZ2lkOkRYSW1hZ2VUcmFuc2Zvcm0uTWljcm9zb2Z0LkRyb3BzaGFkb3coT2ZmWD0tMSwgT2ZmWT0xLCBDb2xvcj0nIzAwMCcpXFxcIjtcXG4gICAgZmlsdGVyOiB1cmwoI3NoYWRvdyk7XFxuICAgIC13ZWJraXQtZmlsdGVyOiBkcm9wLXNoYWRvdygtMXB4IDFweCAwcHggIzAwMCk7XFxuICAgIGZpbHRlcjogZHJvcC1zaGFkb3coLTFweCAxcHggMHB4ICMwMDApO1xcbn1cIiwgXCJcIix7XCJ2ZXJzaW9uXCI6MyxcInNvdXJjZXNcIjpbXCJ3ZWJwYWNrOi8vLi9zcmMvY3NzL3ZlbmRvci9tYW5hLmNzc1wiXSxcIm5hbWVzXCI6W10sXCJtYXBwaW5nc1wiOlwiQUFBQTtJQUNJLHlEQUF3RDtJQUN4RCw0QkFBNEI7SUFDNUIsMEJBQTBCO0lBQzFCLHFCQUFxQjtJQUNyQixlQUFlO0FBQ25COztBQUVBO0lBQ0ksYUFBYTtJQUNiLGNBQWM7QUFDbEI7O0FBRUE7SUFDSSxZQUFZO0lBQ1osV0FBVztBQUNmO0FBQ0E7SUFDSSxXQUFXO0lBQ1gsVUFBVTtBQUNkO0FBQ0E7SUFDSSxXQUFXO0lBQ1gsVUFBVTtBQUNkO0FBQ0EsVUFBVSx3QkFBd0IsRUFBRTtBQUNwQyxXQUFXLDRCQUE0QixFQUFFO0FBQ3pDLFdBQVcsNEJBQTRCLEVBQUU7QUFDekMsV0FBVyw0QkFBNEIsRUFBRTtBQUN6QyxXQUFXLDRCQUE0QixFQUFFO0FBQ3pDLFdBQVcsNEJBQTRCLEVBQUU7QUFDekMsV0FBVyw0QkFBNEIsRUFBRTtBQUN6QyxXQUFXLDRCQUE0QixFQUFFO0FBQ3pDLFdBQVcsNEJBQTRCLEVBQUU7QUFDekMsV0FBVyw0QkFBNEIsRUFBRTs7QUFFekMsWUFBWSwwQkFBMEIsRUFBRTtBQUN4QyxZQUFZLGdDQUFnQyxFQUFFO0FBQzlDLFlBQVksZ0NBQWdDLEVBQUU7QUFDOUMsWUFBWSxnQ0FBZ0MsRUFBRTtBQUM5QyxZQUFZLGdDQUFnQyxFQUFFO0FBQzlDLFlBQVksZ0NBQWdDLEVBQUU7QUFDOUMsWUFBWSxnQ0FBZ0MsRUFBRTtBQUM5QyxZQUFZLGdDQUFnQyxFQUFFO0FBQzlDLFlBQVksZ0NBQWdDLEVBQUU7QUFDOUMsWUFBWSxnQ0FBZ0MsRUFBRTs7QUFFOUMsWUFBWSwwQkFBMEIsRUFBRTtBQUN4QyxXQUFXLGdDQUFnQyxFQUFFO0FBQzdDLFdBQVcsZ0NBQWdDLEVBQUU7QUFDN0MsV0FBVyxnQ0FBZ0MsRUFBRTtBQUM3QyxXQUFXLGdDQUFnQyxFQUFFO0FBQzdDLFdBQVcsZ0NBQWdDLEVBQUU7QUFDN0MsV0FBVyxnQ0FBZ0MsRUFBRTtBQUM3QyxXQUFXLGdDQUFnQyxFQUFFO0FBQzdDLFdBQVcsZ0NBQWdDLEVBQUU7QUFDN0MsV0FBVyxnQ0FBZ0MsRUFBRTs7QUFFN0MsWUFBWSwwQkFBMEIsRUFBRTtBQUN4QyxZQUFZLDhCQUE4QixFQUFFO0FBQzVDLFlBQVksOEJBQThCLEVBQUU7QUFDNUMsWUFBWSw4QkFBOEIsRUFBRTtBQUM1QyxZQUFZLDhCQUE4QixFQUFFO0FBQzVDLFlBQVksOEJBQThCLEVBQUU7QUFDNUMsWUFBWSw4QkFBOEIsRUFBRTtBQUM1QyxZQUFZLDhCQUE4QixFQUFFO0FBQzVDLFlBQVksOEJBQThCLEVBQUU7QUFDNUMsWUFBWSw4QkFBOEIsRUFBRTs7QUFFNUMsWUFBWSw0QkFBNEIsRUFBRTtBQUMxQyxZQUFZLGdDQUFnQyxFQUFFO0FBQzlDLFlBQVksZ0NBQWdDLEVBQUU7QUFDOUMsWUFBWSxnQ0FBZ0MsRUFBRTtBQUM5QyxZQUFZLGdDQUFnQyxFQUFFO0FBQzlDLFlBQVksZ0NBQWdDLEVBQUU7QUFDOUMsWUFBWSxnQ0FBZ0MsRUFBRTtBQUM5QyxZQUFZLGdDQUFnQyxFQUFFO0FBQzlDLFlBQVksZ0NBQWdDLEVBQUU7QUFDOUMsWUFBWSxnQ0FBZ0MsRUFBRTs7QUFFOUMsV0FBVyw2QkFBNkIsRUFBRTtBQUMxQyxXQUFXLGdDQUFnQyxFQUFFOztBQUU3QyxXQUFXLGdDQUFnQyxFQUFFOztBQUU3QyxXQUFXLGdDQUFnQyxFQUFFOztBQUU3QyxpQkFBaUIsMkJBQTJCLEVBQUU7QUFDOUMsdUJBQXVCLFlBQVksRUFBRTtBQUNyQyx3QkFBd0IsWUFBWSxFQUFFO0FBQ3RDLDBDQUEwQztBQUMxQyxhQUFhLDZCQUE2QixFQUFFO0FBQzVDLG1CQUFtQixZQUFZLEVBQUU7QUFDakMsb0JBQW9CLFlBQVksRUFBRTtBQUNsQyxzQ0FBc0M7QUFDdEMsZUFBZSwrQkFBK0IsRUFBRTtBQUNoRCxxQkFBcUIsWUFBWSxFQUFFO0FBQ25DLHNCQUFzQixZQUFZLEVBQUU7QUFDcEMsbUNBQW1DO0FBQ25DLFlBQVksK0JBQStCLEVBQUU7QUFDN0Msa0JBQWtCLFlBQVksRUFBRTtBQUNoQyxtQkFBbUIsVUFBVSxFQUFFO0FBQy9CLGtDQUFrQztBQUNsQyxZQUFZLDZCQUE2QixFQUFFO0FBQzNDLGtCQUFrQixZQUFZLEVBQUU7QUFDaEMsbUJBQW1CLFVBQVUsRUFBRTtBQUMvQixrQ0FBa0M7OztBQUdsQztJQUNJLHFGQUFxRjtJQUNyRixvQkFBb0I7SUFDcEIsOENBQThDO0lBQzlDLHNDQUFzQztBQUMxQ1wiLFwic291cmNlc0NvbnRlbnRcIjpbXCIubWFuYSB7XFxuICAgIGJhY2tncm91bmQtaW1hZ2U6IHVybCgnLi4vLi4vaW1nL21hbmEtc3ltYm9scy9tYW5hLnN2ZycpO1xcbiAgICBiYWNrZ3JvdW5kLXJlcGVhdDogbm8tcmVwZWF0O1xcbiAgICBiYWNrZ3JvdW5kLXNpemU6IGF1dG8gNzAwJTtcXG4gICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgICBmb250LXNpemU6IDEwMCU7XFxufVxcblxcbi5tYW5hLnhzIHtcXG4gICAgd2lkdGg6IDEuNXJlbTtcXG4gICAgaGVpZ2h0OiAxLjVyZW07XFxufVxcblxcbi5tYW5hLnNtYWxsIHtcXG4gICAgaGVpZ2h0OiAycmVtO1xcbiAgICB3aWR0aDogMnJlbTtcXG59XFxuLm1hbmEubWVkaXVtIHtcXG4gICAgaGVpZ2h0OiAyZW07XFxuICAgIHdpZHRoOiAyZW07XFxufVxcbi5tYW5hLmxhcmdlIHtcXG4gICAgaGVpZ2h0OiA0ZW07XFxuICAgIHdpZHRoOiA0ZW07XFxufVxcbi5tYW5hLnMgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwIDA7IH1cXG4ubWFuYS5zMSB7IGJhY2tncm91bmQtcG9zaXRpb246IDExLjElIDA7IH1cXG4ubWFuYS5zMiB7IGJhY2tncm91bmQtcG9zaXRpb246IDIyLjIlIDA7IH1cXG4ubWFuYS5zMyB7IGJhY2tncm91bmQtcG9zaXRpb246IDMzLjMlIDA7IH1cXG4ubWFuYS5zNCB7IGJhY2tncm91bmQtcG9zaXRpb246IDQ0LjQlIDA7IH1cXG4ubWFuYS5zNSB7IGJhY2tncm91bmQtcG9zaXRpb246IDU1LjUlIDA7IH1cXG4ubWFuYS5zNiB7IGJhY2tncm91bmQtcG9zaXRpb246IDY2LjYlIDA7IH1cXG4ubWFuYS5zNyB7IGJhY2tncm91bmQtcG9zaXRpb246IDc3LjclIDA7IH1cXG4ubWFuYS5zOCB7IGJhY2tncm91bmQtcG9zaXRpb246IDg4LjglIDA7IH1cXG4ubWFuYS5zOSB7IGJhY2tncm91bmQtcG9zaXRpb246IDk5LjklIDA7IH1cXG5cXG4ubWFuYS5zMTAgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwIDE2JTsgfVxcbi5tYW5hLnMxMSB7IGJhY2tncm91bmQtcG9zaXRpb246IDExLjElIDE2LjYlOyB9XFxuLm1hbmEuczEyIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMjIuMiUgMTYuNiU7IH1cXG4ubWFuYS5zMTMgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAzMy4zJSAxNi42JTsgfVxcbi5tYW5hLnMxNCB7IGJhY2tncm91bmQtcG9zaXRpb246IDQ0LjQlIDE2LjYlOyB9XFxuLm1hbmEuczE1IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNTUuNSUgMTYuNiU7IH1cXG4ubWFuYS5zMTYgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA2Ni42JSAxNi42JTsgfVxcbi5tYW5hLnMxNyB7IGJhY2tncm91bmQtcG9zaXRpb246IDc3LjclIDE2LjYlOyB9XFxuLm1hbmEuczE4IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogODguOCUgMTYuNiU7IH1cXG4ubWFuYS5zMTkgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA5OS45JSAxNi42JTsgfVxcblxcbi5tYW5hLnMyMCB7IGJhY2tncm91bmQtcG9zaXRpb246IDAgMzMlOyB9XFxuLm1hbmEuc3ggeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAxMS4xJSAzMy4zJTsgfVxcbi5tYW5hLnN5IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMjIuMiUgMzMuMyU7IH1cXG4ubWFuYS5zeiB7IGJhY2tncm91bmQtcG9zaXRpb246IDMzLjMlIDMzLjMlOyB9XFxuLm1hbmEuc3cgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA0NC40JSAzMy4zJTsgfVxcbi5tYW5hLnN1IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNTUuNSUgMzMuMyU7IH1cXG4ubWFuYS5zYiB7IGJhY2tncm91bmQtcG9zaXRpb246IDY2LjYlIDMzLjMlOyB9XFxuLm1hbmEuc3IgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA3Ny43JSAzMy4zJTsgfVxcbi5tYW5hLnNnIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogODguOCUgMzMuMyU7IH1cXG4ubWFuYS5zcyB7IGJhY2tncm91bmQtcG9zaXRpb246IDk5LjklIDMzLjMlOyB9XFxuXFxuLm1hbmEuc3d1IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMCA1MCU7IH1cXG4ubWFuYS5zd2IgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAxMS4xJSA1MCU7IH1cXG4ubWFuYS5zdWIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAyMi4yJSA1MCU7IH1cXG4ubWFuYS5zdXIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAzMy4zJSA1MCU7IH1cXG4ubWFuYS5zYnIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA0NC40JSA1MCU7IH1cXG4ubWFuYS5zYmcgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA1NS41JSA1MCU7IH1cXG4ubWFuYS5zcncgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA2Ni42JSA1MCU7IH1cXG4ubWFuYS5zcmcgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA3Ny43JSA1MCU7IH1cXG4ubWFuYS5zZ3cgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4OC44JSA1MCU7IH1cXG4ubWFuYS5zZ3UgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA5OS45JSA1MCU7IH1cXG5cXG4ubWFuYS5zMncgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwIDY2LjYlOyB9XFxuLm1hbmEuczJ1IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMTEuMSUgNjYuNiU7IH1cXG4ubWFuYS5zMmIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAyMi4yJSA2Ni42JTsgfVxcbi5tYW5hLnMyciB7IGJhY2tncm91bmQtcG9zaXRpb246IDMzLjMlIDY2LjYlOyB9XFxuLm1hbmEuczJnIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNDQuNCUgNjYuNiU7IH1cXG4ubWFuYS5zd3AgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA1NS41JSA2Ni42JTsgfVxcbi5tYW5hLnN1cCB7IGJhY2tncm91bmQtcG9zaXRpb246IDY2LjYlIDY2LjYlOyB9XFxuLm1hbmEuc2JwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNzcuNyUgNjYuNiU7IH1cXG4ubWFuYS5zcnAgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4OC44JSA2Ni42JTsgfVxcbi5tYW5hLnNncCB7IGJhY2tncm91bmQtcG9zaXRpb246IDk5LjklIDY2LjYlOyB9XFxuXFxuLm1hbmEuc3QgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwJSA4My4zJTsgfVxcbi5tYW5hLnNxIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMTEuMSUgODMuMyU7IH1cXG5cXG4ubWFuYS5zYyB7IGJhY2tncm91bmQtcG9zaXRpb246IDc3LjclIDgzLjMlOyB9XFxuXFxuLm1hbmEuc2UgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4OC44JSA4My4zJTsgfVxcblxcbi5tYW5hLnMxMDAwMDAwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMCAxMDAlOyB9XFxuLm1hbmEuczEwMDAwMDAuc21hbGwgeyB3aWR0aDogNC45ZW07IH1cXG4ubWFuYS5zMTAwMDAwMC5tZWRpdW0geyB3aWR0aDogOS43ZW07IH1cXG4vKi5tYW5hLnMxMDAwMDAwLmxhcmdlIHsgd2lkdGg6IDE4LjhlbTsgfSovXFxuLm1hbmEuczEwMCB7IGJhY2tncm91bmQtcG9zaXRpb246IDYwJSAxMDAlOyB9XFxuLm1hbmEuczEwMC5zbWFsbCB7IHdpZHRoOiAxLjhlbTsgfVxcbi5tYW5hLnMxMDAubWVkaXVtIHsgd2lkdGg6IDMuN2VtOyB9XFxuLyoubWFuYS5zMTAwLmxhcmdlIHsgd2lkdGg6IDEwLjhlbTsgfSovXFxuLm1hbmEuc2NoYW9zIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNzYuNSUgMTAwJTsgfVxcbi5tYW5hLnNjaGFvcy5zbWFsbCB7IHdpZHRoOiAxLjJlbTsgfVxcbi5tYW5hLnNjaGFvcy5tZWRpdW0geyB3aWR0aDogMi4zZW07IH1cXG4vKi5tYW5hLnNjLmxhcmdlIHsgd2lkdGg6IDQuNmVtOyB9Ki9cXG4ubWFuYS5zaHcgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4My41JSAxMDAlOyB9XFxuLm1hbmEuc2h3LnNtYWxsIHsgd2lkdGg6IDAuNWVtOyB9XFxuLm1hbmEuc2h3Lm1lZGl1bSB7IHdpZHRoOiAxZW07IH1cXG4vKi5tYW5hLnNody5sYXJnZSB7IHdpZHRoOiAyZW07IH0qL1xcbi5tYW5hLnNociB7IGJhY2tncm91bmQtcG9zaXRpb246IDg5JSAxMDAlOyB9XFxuLm1hbmEuc2hyLnNtYWxsIHsgd2lkdGg6IDAuNWVtOyB9XFxuLm1hbmEuc2hyLm1lZGl1bSB7IHdpZHRoOiAxZW07IH1cXG4vKi5tYW5hLnNoci5sYXJnZSB7IHdpZHRoOiAyZW07IH0qL1xcblxcblxcbi5zaGFkb3cge1xcbiAgICBmaWx0ZXI6IFxcXCJwcm9naWQ6RFhJbWFnZVRyYW5zZm9ybS5NaWNyb3NvZnQuRHJvcHNoYWRvdyhPZmZYPS0xLCBPZmZZPTEsIENvbG9yPScjMDAwJylcXFwiO1xcbiAgICBmaWx0ZXI6IHVybCgjc2hhZG93KTtcXG4gICAgLXdlYmtpdC1maWx0ZXI6IGRyb3Atc2hhZG93KC0xcHggMXB4IDBweCAjMDAwKTtcXG4gICAgZmlsdGVyOiBkcm9wLXNoYWRvdygtMXB4IDFweCAwcHggIzAwMCk7XFxufVwiXSxcInNvdXJjZVJvb3RcIjpcIlwifV0pO1xuLy8gRXhwb3J0c1xuZXhwb3J0IGRlZmF1bHQgX19fQ1NTX0xPQURFUl9FWFBPUlRfX187XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAgTUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAgQXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cbi8vIGNzcyBiYXNlIGNvZGUsIGluamVjdGVkIGJ5IHRoZSBjc3MtbG9hZGVyXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY3NzV2l0aE1hcHBpbmdUb1N0cmluZykge1xuICB2YXIgbGlzdCA9IFtdOyAvLyByZXR1cm4gdGhlIGxpc3Qgb2YgbW9kdWxlcyBhcyBjc3Mgc3RyaW5nXG5cbiAgbGlzdC50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiB0aGlzLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgdmFyIGNvbnRlbnQgPSBjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKGl0ZW0pO1xuXG4gICAgICBpZiAoaXRlbVsyXSkge1xuICAgICAgICByZXR1cm4gXCJAbWVkaWEgXCIuY29uY2F0KGl0ZW1bMl0sIFwiIHtcIikuY29uY2F0KGNvbnRlbnQsIFwifVwiKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNvbnRlbnQ7XG4gICAgfSkuam9pbignJyk7XG4gIH07IC8vIGltcG9ydCBhIGxpc3Qgb2YgbW9kdWxlcyBpbnRvIHRoZSBsaXN0XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG5cblxuICBsaXN0LmkgPSBmdW5jdGlvbiAobW9kdWxlcywgbWVkaWFRdWVyeSwgZGVkdXBlKSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGVzID09PSAnc3RyaW5nJykge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gICAgICBtb2R1bGVzID0gW1tudWxsLCBtb2R1bGVzLCAnJ11dO1xuICAgIH1cblxuICAgIHZhciBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzID0ge307XG5cbiAgICBpZiAoZGVkdXBlKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByZWZlci1kZXN0cnVjdHVyaW5nXG4gICAgICAgIHZhciBpZCA9IHRoaXNbaV1bMF07XG5cbiAgICAgICAgaWYgKGlkICE9IG51bGwpIHtcbiAgICAgICAgICBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2lkXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgbW9kdWxlcy5sZW5ndGg7IF9pKyspIHtcbiAgICAgIHZhciBpdGVtID0gW10uY29uY2F0KG1vZHVsZXNbX2ldKTtcblxuICAgICAgaWYgKGRlZHVwZSAmJiBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2l0ZW1bMF1dKSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb250aW51ZVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKG1lZGlhUXVlcnkpIHtcbiAgICAgICAgaWYgKCFpdGVtWzJdKSB7XG4gICAgICAgICAgaXRlbVsyXSA9IG1lZGlhUXVlcnk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsyXSA9IFwiXCIuY29uY2F0KG1lZGlhUXVlcnksIFwiIGFuZCBcIikuY29uY2F0KGl0ZW1bMl0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGxpc3QucHVzaChpdGVtKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIGxpc3Q7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5mdW5jdGlvbiBfc2xpY2VkVG9BcnJheShhcnIsIGkpIHsgcmV0dXJuIF9hcnJheVdpdGhIb2xlcyhhcnIpIHx8IF9pdGVyYWJsZVRvQXJyYXlMaW1pdChhcnIsIGkpIHx8IF91bnN1cHBvcnRlZEl0ZXJhYmxlVG9BcnJheShhcnIsIGkpIHx8IF9ub25JdGVyYWJsZVJlc3QoKTsgfVxuXG5mdW5jdGlvbiBfbm9uSXRlcmFibGVSZXN0KCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZS5cXG5JbiBvcmRlciB0byBiZSBpdGVyYWJsZSwgbm9uLWFycmF5IG9iamVjdHMgbXVzdCBoYXZlIGEgW1N5bWJvbC5pdGVyYXRvcl0oKSBtZXRob2QuXCIpOyB9XG5cbmZ1bmN0aW9uIF91bnN1cHBvcnRlZEl0ZXJhYmxlVG9BcnJheShvLCBtaW5MZW4pIHsgaWYgKCFvKSByZXR1cm47IGlmICh0eXBlb2YgbyA9PT0gXCJzdHJpbmdcIikgcmV0dXJuIF9hcnJheUxpa2VUb0FycmF5KG8sIG1pbkxlbik7IHZhciBuID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pLnNsaWNlKDgsIC0xKTsgaWYgKG4gPT09IFwiT2JqZWN0XCIgJiYgby5jb25zdHJ1Y3RvcikgbiA9IG8uY29uc3RydWN0b3IubmFtZTsgaWYgKG4gPT09IFwiTWFwXCIgfHwgbiA9PT0gXCJTZXRcIikgcmV0dXJuIEFycmF5LmZyb20obyk7IGlmIChuID09PSBcIkFyZ3VtZW50c1wiIHx8IC9eKD86VWl8SSludCg/Ojh8MTZ8MzIpKD86Q2xhbXBlZCk/QXJyYXkkLy50ZXN0KG4pKSByZXR1cm4gX2FycmF5TGlrZVRvQXJyYXkobywgbWluTGVuKTsgfVxuXG5mdW5jdGlvbiBfYXJyYXlMaWtlVG9BcnJheShhcnIsIGxlbikgeyBpZiAobGVuID09IG51bGwgfHwgbGVuID4gYXJyLmxlbmd0aCkgbGVuID0gYXJyLmxlbmd0aDsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBuZXcgQXJyYXkobGVuKTsgaSA8IGxlbjsgaSsrKSB7IGFycjJbaV0gPSBhcnJbaV07IH0gcmV0dXJuIGFycjI7IH1cblxuZnVuY3Rpb24gX2l0ZXJhYmxlVG9BcnJheUxpbWl0KGFyciwgaSkgeyBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJ1bmRlZmluZWRcIiB8fCAhKFN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QoYXJyKSkpIHJldHVybjsgdmFyIF9hcnIgPSBbXTsgdmFyIF9uID0gdHJ1ZTsgdmFyIF9kID0gZmFsc2U7IHZhciBfZSA9IHVuZGVmaW5lZDsgdHJ5IHsgZm9yICh2YXIgX2kgPSBhcnJbU3ltYm9sLml0ZXJhdG9yXSgpLCBfczsgIShfbiA9IChfcyA9IF9pLm5leHQoKSkuZG9uZSk7IF9uID0gdHJ1ZSkgeyBfYXJyLnB1c2goX3MudmFsdWUpOyBpZiAoaSAmJiBfYXJyLmxlbmd0aCA9PT0gaSkgYnJlYWs7IH0gfSBjYXRjaCAoZXJyKSB7IF9kID0gdHJ1ZTsgX2UgPSBlcnI7IH0gZmluYWxseSB7IHRyeSB7IGlmICghX24gJiYgX2lbXCJyZXR1cm5cIl0gIT0gbnVsbCkgX2lbXCJyZXR1cm5cIl0oKTsgfSBmaW5hbGx5IHsgaWYgKF9kKSB0aHJvdyBfZTsgfSB9IHJldHVybiBfYXJyOyB9XG5cbmZ1bmN0aW9uIF9hcnJheVdpdGhIb2xlcyhhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgcmV0dXJuIGFycjsgfVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcoaXRlbSkge1xuICB2YXIgX2l0ZW0gPSBfc2xpY2VkVG9BcnJheShpdGVtLCA0KSxcbiAgICAgIGNvbnRlbnQgPSBfaXRlbVsxXSxcbiAgICAgIGNzc01hcHBpbmcgPSBfaXRlbVszXTtcblxuICBpZiAodHlwZW9mIGJ0b2EgPT09ICdmdW5jdGlvbicpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcbiAgICB2YXIgYmFzZTY0ID0gYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoY3NzTWFwcGluZykpKSk7XG4gICAgdmFyIGRhdGEgPSBcInNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LFwiLmNvbmNhdChiYXNlNjQpO1xuICAgIHZhciBzb3VyY2VNYXBwaW5nID0gXCIvKiMgXCIuY29uY2F0KGRhdGEsIFwiICovXCIpO1xuICAgIHZhciBzb3VyY2VVUkxzID0gY3NzTWFwcGluZy5zb3VyY2VzLm1hcChmdW5jdGlvbiAoc291cmNlKSB7XG4gICAgICByZXR1cm4gXCIvKiMgc291cmNlVVJMPVwiLmNvbmNhdChjc3NNYXBwaW5nLnNvdXJjZVJvb3QgfHwgJycpLmNvbmNhdChzb3VyY2UsIFwiICovXCIpO1xuICAgIH0pO1xuICAgIHJldHVybiBbY29udGVudF0uY29uY2F0KHNvdXJjZVVSTHMpLmNvbmNhdChbc291cmNlTWFwcGluZ10pLmpvaW4oJ1xcbicpO1xuICB9XG5cbiAgcmV0dXJuIFtjb250ZW50XS5qb2luKCdcXG4nKTtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHVybCwgb3B0aW9ucykge1xuICBpZiAoIW9wdGlvbnMpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgICBvcHRpb25zID0ge307XG4gIH0gLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVyc2NvcmUtZGFuZ2xlLCBuby1wYXJhbS1yZWFzc2lnblxuXG5cbiAgdXJsID0gdXJsICYmIHVybC5fX2VzTW9kdWxlID8gdXJsLmRlZmF1bHQgOiB1cmw7XG5cbiAgaWYgKHR5cGVvZiB1cmwgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHVybDtcbiAgfSAvLyBJZiB1cmwgaXMgYWxyZWFkeSB3cmFwcGVkIGluIHF1b3RlcywgcmVtb3ZlIHRoZW1cblxuXG4gIGlmICgvXlsnXCJdLipbJ1wiXSQvLnRlc3QodXJsKSkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICAgIHVybCA9IHVybC5zbGljZSgxLCAtMSk7XG4gIH1cblxuICBpZiAob3B0aW9ucy5oYXNoKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gICAgdXJsICs9IG9wdGlvbnMuaGFzaDtcbiAgfSAvLyBTaG91bGQgdXJsIGJlIHdyYXBwZWQ/XG4gIC8vIFNlZSBodHRwczovL2RyYWZ0cy5jc3N3Zy5vcmcvY3NzLXZhbHVlcy0zLyN1cmxzXG5cblxuICBpZiAoL1tcIicoKSBcXHRcXG5dLy50ZXN0KHVybCkgfHwgb3B0aW9ucy5uZWVkUXVvdGVzKSB7XG4gICAgcmV0dXJuIFwiXFxcIlwiLmNvbmNhdCh1cmwucmVwbGFjZSgvXCIvZywgJ1xcXFxcIicpLnJlcGxhY2UoL1xcbi9nLCAnXFxcXG4nKSwgXCJcXFwiXCIpO1xuICB9XG5cbiAgcmV0dXJuIHVybDtcbn07IiwiZXhwb3J0IGRlZmF1bHQgX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcIjhmNGI5ZDA0NzZlNjIwZDFmZWY1MGM5NTA0NDM2NDU2LnN2Z1wiOyIsImV4cG9ydCBkZWZhdWx0IF9fd2VicGFja19wdWJsaWNfcGF0aF9fICsgXCJjODlhMDMwNWM2ZWJmZjM4NTg4NzhkZjYxMzY4NzY3YS5zdmdcIjsiLCJpbXBvcnQgYXBpIGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzXCI7XG4gICAgICAgICAgICBpbXBvcnQgY29udGVudCBmcm9tIFwiISEuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL3N0eWxlLmNzc1wiO1xuXG52YXIgb3B0aW9ucyA9IHt9O1xuXG5vcHRpb25zLmluc2VydCA9IFwiaGVhZFwiO1xub3B0aW9ucy5zaW5nbGV0b24gPSBmYWxzZTtcblxudmFyIHVwZGF0ZSA9IGFwaShjb250ZW50LCBvcHRpb25zKTtcblxuXG5cbmV4cG9ydCBkZWZhdWx0IGNvbnRlbnQubG9jYWxzIHx8IHt9OyIsImltcG9ydCBhcGkgZnJvbSBcIiEuLi8uLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanNcIjtcbiAgICAgICAgICAgIGltcG9ydCBjb250ZW50IGZyb20gXCIhIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vbWFuYS5jc3NcIjtcblxudmFyIG9wdGlvbnMgPSB7fTtcblxub3B0aW9ucy5pbnNlcnQgPSBcImhlYWRcIjtcbm9wdGlvbnMuc2luZ2xldG9uID0gZmFsc2U7XG5cbnZhciB1cGRhdGUgPSBhcGkoY29udGVudCwgb3B0aW9ucyk7XG5cblxuXG5leHBvcnQgZGVmYXVsdCBjb250ZW50LmxvY2FscyB8fCB7fTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIGlzT2xkSUUgPSBmdW5jdGlvbiBpc09sZElFKCkge1xuICB2YXIgbWVtbztcbiAgcmV0dXJuIGZ1bmN0aW9uIG1lbW9yaXplKCkge1xuICAgIGlmICh0eXBlb2YgbWVtbyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIC8vIFRlc3QgZm9yIElFIDw9IDkgYXMgcHJvcG9zZWQgYnkgQnJvd3NlcmhhY2tzXG4gICAgICAvLyBAc2VlIGh0dHA6Ly9icm93c2VyaGFja3MuY29tLyNoYWNrLWU3MWQ4NjkyZjY1MzM0MTczZmVlNzE1YzIyMmNiODA1XG4gICAgICAvLyBUZXN0cyBmb3IgZXhpc3RlbmNlIG9mIHN0YW5kYXJkIGdsb2JhbHMgaXMgdG8gYWxsb3cgc3R5bGUtbG9hZGVyXG4gICAgICAvLyB0byBvcGVyYXRlIGNvcnJlY3RseSBpbnRvIG5vbi1zdGFuZGFyZCBlbnZpcm9ubWVudHNcbiAgICAgIC8vIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3dlYnBhY2stY29udHJpYi9zdHlsZS1sb2FkZXIvaXNzdWVzLzE3N1xuICAgICAgbWVtbyA9IEJvb2xlYW4od2luZG93ICYmIGRvY3VtZW50ICYmIGRvY3VtZW50LmFsbCAmJiAhd2luZG93LmF0b2IpO1xuICAgIH1cblxuICAgIHJldHVybiBtZW1vO1xuICB9O1xufSgpO1xuXG52YXIgZ2V0VGFyZ2V0ID0gZnVuY3Rpb24gZ2V0VGFyZ2V0KCkge1xuICB2YXIgbWVtbyA9IHt9O1xuICByZXR1cm4gZnVuY3Rpb24gbWVtb3JpemUodGFyZ2V0KSB7XG4gICAgaWYgKHR5cGVvZiBtZW1vW3RhcmdldF0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB2YXIgc3R5bGVUYXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCk7IC8vIFNwZWNpYWwgY2FzZSB0byByZXR1cm4gaGVhZCBvZiBpZnJhbWUgaW5zdGVhZCBvZiBpZnJhbWUgaXRzZWxmXG5cbiAgICAgIGlmICh3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQgJiYgc3R5bGVUYXJnZXQgaW5zdGFuY2VvZiB3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAvLyBUaGlzIHdpbGwgdGhyb3cgYW4gZXhjZXB0aW9uIGlmIGFjY2VzcyB0byBpZnJhbWUgaXMgYmxvY2tlZFxuICAgICAgICAgIC8vIGR1ZSB0byBjcm9zcy1vcmlnaW4gcmVzdHJpY3Rpb25zXG4gICAgICAgICAgc3R5bGVUYXJnZXQgPSBzdHlsZVRhcmdldC5jb250ZW50RG9jdW1lbnQuaGVhZDtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIC8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0XG4gICAgICAgICAgc3R5bGVUYXJnZXQgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIG1lbW9bdGFyZ2V0XSA9IHN0eWxlVGFyZ2V0O1xuICAgIH1cblxuICAgIHJldHVybiBtZW1vW3RhcmdldF07XG4gIH07XG59KCk7XG5cbnZhciBzdHlsZXNJbkRvbSA9IFtdO1xuXG5mdW5jdGlvbiBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKSB7XG4gIHZhciByZXN1bHQgPSAtMTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0eWxlc0luRG9tLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHN0eWxlc0luRG9tW2ldLmlkZW50aWZpZXIgPT09IGlkZW50aWZpZXIpIHtcbiAgICAgIHJlc3VsdCA9IGk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucykge1xuICB2YXIgaWRDb3VudE1hcCA9IHt9O1xuICB2YXIgaWRlbnRpZmllcnMgPSBbXTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaXRlbSA9IGxpc3RbaV07XG4gICAgdmFyIGlkID0gb3B0aW9ucy5iYXNlID8gaXRlbVswXSArIG9wdGlvbnMuYmFzZSA6IGl0ZW1bMF07XG4gICAgdmFyIGNvdW50ID0gaWRDb3VudE1hcFtpZF0gfHwgMDtcbiAgICB2YXIgaWRlbnRpZmllciA9IFwiXCIuY29uY2F0KGlkLCBcIiBcIikuY29uY2F0KGNvdW50KTtcbiAgICBpZENvdW50TWFwW2lkXSA9IGNvdW50ICsgMTtcbiAgICB2YXIgaW5kZXggPSBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgICB2YXIgb2JqID0ge1xuICAgICAgY3NzOiBpdGVtWzFdLFxuICAgICAgbWVkaWE6IGl0ZW1bMl0sXG4gICAgICBzb3VyY2VNYXA6IGl0ZW1bM11cbiAgICB9O1xuXG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgc3R5bGVzSW5Eb21baW5kZXhdLnJlZmVyZW5jZXMrKztcbiAgICAgIHN0eWxlc0luRG9tW2luZGV4XS51cGRhdGVyKG9iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0eWxlc0luRG9tLnB1c2goe1xuICAgICAgICBpZGVudGlmaWVyOiBpZGVudGlmaWVyLFxuICAgICAgICB1cGRhdGVyOiBhZGRTdHlsZShvYmosIG9wdGlvbnMpLFxuICAgICAgICByZWZlcmVuY2VzOiAxXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZGVudGlmaWVycy5wdXNoKGlkZW50aWZpZXIpO1xuICB9XG5cbiAgcmV0dXJuIGlkZW50aWZpZXJzO1xufVxuXG5mdW5jdGlvbiBpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucykge1xuICB2YXIgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICB2YXIgYXR0cmlidXRlcyA9IG9wdGlvbnMuYXR0cmlidXRlcyB8fCB7fTtcblxuICBpZiAodHlwZW9mIGF0dHJpYnV0ZXMubm9uY2UgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgdmFyIG5vbmNlID0gdHlwZW9mIF9fd2VicGFja19ub25jZV9fICE9PSAndW5kZWZpbmVkJyA/IF9fd2VicGFja19ub25jZV9fIDogbnVsbDtcblxuICAgIGlmIChub25jZSkge1xuICAgICAgYXR0cmlidXRlcy5ub25jZSA9IG5vbmNlO1xuICAgIH1cbiAgfVxuXG4gIE9iamVjdC5rZXlzKGF0dHJpYnV0ZXMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIHN0eWxlLnNldEF0dHJpYnV0ZShrZXksIGF0dHJpYnV0ZXNba2V5XSk7XG4gIH0pO1xuXG4gIGlmICh0eXBlb2Ygb3B0aW9ucy5pbnNlcnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICBvcHRpb25zLmluc2VydChzdHlsZSk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIHRhcmdldCA9IGdldFRhcmdldChvcHRpb25zLmluc2VydCB8fCAnaGVhZCcpO1xuXG4gICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkbid0IGZpbmQgYSBzdHlsZSB0YXJnZXQuIFRoaXMgcHJvYmFibHkgbWVhbnMgdGhhdCB0aGUgdmFsdWUgZm9yIHRoZSAnaW5zZXJ0JyBwYXJhbWV0ZXIgaXMgaW52YWxpZC5cIik7XG4gICAgfVxuXG4gICAgdGFyZ2V0LmFwcGVuZENoaWxkKHN0eWxlKTtcbiAgfVxuXG4gIHJldHVybiBzdHlsZTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlKSB7XG4gIC8vIGlzdGFuYnVsIGlnbm9yZSBpZlxuICBpZiAoc3R5bGUucGFyZW50Tm9kZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHN0eWxlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc3R5bGUpO1xufVxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5cblxudmFyIHJlcGxhY2VUZXh0ID0gZnVuY3Rpb24gcmVwbGFjZVRleHQoKSB7XG4gIHZhciB0ZXh0U3RvcmUgPSBbXTtcbiAgcmV0dXJuIGZ1bmN0aW9uIHJlcGxhY2UoaW5kZXgsIHJlcGxhY2VtZW50KSB7XG4gICAgdGV4dFN0b3JlW2luZGV4XSA9IHJlcGxhY2VtZW50O1xuICAgIHJldHVybiB0ZXh0U3RvcmUuZmlsdGVyKEJvb2xlYW4pLmpvaW4oJ1xcbicpO1xuICB9O1xufSgpO1xuXG5mdW5jdGlvbiBhcHBseVRvU2luZ2xldG9uVGFnKHN0eWxlLCBpbmRleCwgcmVtb3ZlLCBvYmopIHtcbiAgdmFyIGNzcyA9IHJlbW92ZSA/ICcnIDogb2JqLm1lZGlhID8gXCJAbWVkaWEgXCIuY29uY2F0KG9iai5tZWRpYSwgXCIge1wiKS5jb25jYXQob2JqLmNzcywgXCJ9XCIpIDogb2JqLmNzczsgLy8gRm9yIG9sZCBJRVxuXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAgKi9cblxuICBpZiAoc3R5bGUuc3R5bGVTaGVldCkge1xuICAgIHN0eWxlLnN0eWxlU2hlZXQuY3NzVGV4dCA9IHJlcGxhY2VUZXh0KGluZGV4LCBjc3MpO1xuICB9IGVsc2Uge1xuICAgIHZhciBjc3NOb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKTtcbiAgICB2YXIgY2hpbGROb2RlcyA9IHN0eWxlLmNoaWxkTm9kZXM7XG5cbiAgICBpZiAoY2hpbGROb2Rlc1tpbmRleF0pIHtcbiAgICAgIHN0eWxlLnJlbW92ZUNoaWxkKGNoaWxkTm9kZXNbaW5kZXhdKTtcbiAgICB9XG5cbiAgICBpZiAoY2hpbGROb2Rlcy5sZW5ndGgpIHtcbiAgICAgIHN0eWxlLmluc2VydEJlZm9yZShjc3NOb2RlLCBjaGlsZE5vZGVzW2luZGV4XSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0eWxlLmFwcGVuZENoaWxkKGNzc05vZGUpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBhcHBseVRvVGFnKHN0eWxlLCBvcHRpb25zLCBvYmopIHtcbiAgdmFyIGNzcyA9IG9iai5jc3M7XG4gIHZhciBtZWRpYSA9IG9iai5tZWRpYTtcbiAgdmFyIHNvdXJjZU1hcCA9IG9iai5zb3VyY2VNYXA7XG5cbiAgaWYgKG1lZGlhKSB7XG4gICAgc3R5bGUuc2V0QXR0cmlidXRlKCdtZWRpYScsIG1lZGlhKTtcbiAgfSBlbHNlIHtcbiAgICBzdHlsZS5yZW1vdmVBdHRyaWJ1dGUoJ21lZGlhJyk7XG4gIH1cblxuICBpZiAoc291cmNlTWFwICYmIHR5cGVvZiBidG9hICE9PSAndW5kZWZpbmVkJykge1xuICAgIGNzcyArPSBcIlxcbi8qIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsXCIuY29uY2F0KGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHNvdXJjZU1hcCkpKSksIFwiICovXCIpO1xuICB9IC8vIEZvciBvbGQgSUVcblxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgICovXG5cblxuICBpZiAoc3R5bGUuc3R5bGVTaGVldCkge1xuICAgIHN0eWxlLnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcbiAgfSBlbHNlIHtcbiAgICB3aGlsZSAoc3R5bGUuZmlyc3RDaGlsZCkge1xuICAgICAgc3R5bGUucmVtb3ZlQ2hpbGQoc3R5bGUuZmlyc3RDaGlsZCk7XG4gICAgfVxuXG4gICAgc3R5bGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKSk7XG4gIH1cbn1cblxudmFyIHNpbmdsZXRvbiA9IG51bGw7XG52YXIgc2luZ2xldG9uQ291bnRlciA9IDA7XG5cbmZ1bmN0aW9uIGFkZFN0eWxlKG9iaiwgb3B0aW9ucykge1xuICB2YXIgc3R5bGU7XG4gIHZhciB1cGRhdGU7XG4gIHZhciByZW1vdmU7XG5cbiAgaWYgKG9wdGlvbnMuc2luZ2xldG9uKSB7XG4gICAgdmFyIHN0eWxlSW5kZXggPSBzaW5nbGV0b25Db3VudGVyKys7XG4gICAgc3R5bGUgPSBzaW5nbGV0b24gfHwgKHNpbmdsZXRvbiA9IGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKSk7XG4gICAgdXBkYXRlID0gYXBwbHlUb1NpbmdsZXRvblRhZy5iaW5kKG51bGwsIHN0eWxlLCBzdHlsZUluZGV4LCBmYWxzZSk7XG4gICAgcmVtb3ZlID0gYXBwbHlUb1NpbmdsZXRvblRhZy5iaW5kKG51bGwsIHN0eWxlLCBzdHlsZUluZGV4LCB0cnVlKTtcbiAgfSBlbHNlIHtcbiAgICBzdHlsZSA9IGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKTtcbiAgICB1cGRhdGUgPSBhcHBseVRvVGFnLmJpbmQobnVsbCwgc3R5bGUsIG9wdGlvbnMpO1xuXG4gICAgcmVtb3ZlID0gZnVuY3Rpb24gcmVtb3ZlKCkge1xuICAgICAgcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlKTtcbiAgICB9O1xuICB9XG5cbiAgdXBkYXRlKG9iaik7XG4gIHJldHVybiBmdW5jdGlvbiB1cGRhdGVTdHlsZShuZXdPYmopIHtcbiAgICBpZiAobmV3T2JqKSB7XG4gICAgICBpZiAobmV3T2JqLmNzcyA9PT0gb2JqLmNzcyAmJiBuZXdPYmoubWVkaWEgPT09IG9iai5tZWRpYSAmJiBuZXdPYmouc291cmNlTWFwID09PSBvYmouc291cmNlTWFwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdXBkYXRlKG9iaiA9IG5ld09iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlbW92ZSgpO1xuICAgIH1cbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobGlzdCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTsgLy8gRm9yY2Ugc2luZ2xlLXRhZyBzb2x1dGlvbiBvbiBJRTYtOSwgd2hpY2ggaGFzIGEgaGFyZCBsaW1pdCBvbiB0aGUgIyBvZiA8c3R5bGU+XG4gIC8vIHRhZ3MgaXQgd2lsbCBhbGxvdyBvbiBhIHBhZ2VcblxuICBpZiAoIW9wdGlvbnMuc2luZ2xldG9uICYmIHR5cGVvZiBvcHRpb25zLnNpbmdsZXRvbiAhPT0gJ2Jvb2xlYW4nKSB7XG4gICAgb3B0aW9ucy5zaW5nbGV0b24gPSBpc09sZElFKCk7XG4gIH1cblxuICBsaXN0ID0gbGlzdCB8fCBbXTtcbiAgdmFyIGxhc3RJZGVudGlmaWVycyA9IG1vZHVsZXNUb0RvbShsaXN0LCBvcHRpb25zKTtcbiAgcmV0dXJuIGZ1bmN0aW9uIHVwZGF0ZShuZXdMaXN0KSB7XG4gICAgbmV3TGlzdCA9IG5ld0xpc3QgfHwgW107XG5cbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG5ld0xpc3QpICE9PSAnW29iamVjdCBBcnJheV0nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBpZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW2ldO1xuICAgICAgdmFyIGluZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gICAgICBzdHlsZXNJbkRvbVtpbmRleF0ucmVmZXJlbmNlcy0tO1xuICAgIH1cblxuICAgIHZhciBuZXdMYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obmV3TGlzdCwgb3B0aW9ucyk7XG5cbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgbGFzdElkZW50aWZpZXJzLmxlbmd0aDsgX2krKykge1xuICAgICAgdmFyIF9pZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW19pXTtcblxuICAgICAgdmFyIF9pbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKF9pZGVudGlmaWVyKTtcblxuICAgICAgaWYgKHN0eWxlc0luRG9tW19pbmRleF0ucmVmZXJlbmNlcyA9PT0gMCkge1xuICAgICAgICBzdHlsZXNJbkRvbVtfaW5kZXhdLnVwZGF0ZXIoKTtcblxuICAgICAgICBzdHlsZXNJbkRvbS5zcGxpY2UoX2luZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsYXN0SWRlbnRpZmllcnMgPSBuZXdMYXN0SWRlbnRpZmllcnM7XG4gIH07XG59OyIsImltcG9ydCAnLi4vY3NzL3N0eWxlLmNzcyc7XG5pbXBvcnQgJy4uL2Nzcy92ZW5kb3IvbWFuYS5jc3MnO1xuaW1wb3J0IFNlYXJjaCBmcm9tICcuL21vZGVscy9TZWFyY2gnO1xuaW1wb3J0ICogYXMgc2VhcmNoVmlldyBmcm9tICcuL3ZpZXdzL3NlYXJjaFZpZXcnO1xuaW1wb3J0ICogYXMgcmVzdWx0c1ZpZXcgZnJvbSAnLi92aWV3cy9yZXN1bHRzVmlldyc7XG5pbXBvcnQgKiBhcyBjYXJkVmlldyBmcm9tICcuL3ZpZXdzL2NhcmRWaWV3JztcbmltcG9ydCAqIGFzIGludmVudG9yeVZpZXcgZnJvbSAnLi92aWV3cy9pbnZlbnRvcnlWaWV3JztcbmltcG9ydCAqIGFzIGludlNlYXJjaCBmcm9tICcuL3ZpZXdzL2ludmVudG9yeVNlYXJjaFZpZXcnO1xuaW1wb3J0IHsgZWxlbWVudHMgfSBmcm9tICcuL3ZpZXdzL2Jhc2UnO1xuXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqIEhvbWUgUGFnZSAqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG5pZiAod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lID09PSAnLycpIGRvY3VtZW50LmJvZHkuc3R5bGUub3ZlcmZsb3cgPSAnaGlkZGVuJztcblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKiogUXVpY2sgU2VhcmNoICoqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuZWxlbWVudHMubmF2LnF1aWNrU2VhcmNoQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICBjb25zdCBzZWFyY2ggPSBuZXcgU2VhcmNoKCk7XG5cbiAgaWYgKGVsZW1lbnRzLm5hdi5zZWFyY2hJbnB1dC52YWx1ZSAhPT0gJycpIHtcbiAgICBjb25zdCBxdWVyeSA9IHNlYXJjaC5xdWlja1NlYXJjaCgpO1xuICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gYC9yZXN1bHRzL2xpc3QvJHtxdWVyeX0mb3JkZXI9bmFtZWA7XG4gIH1cbn0pO1xuXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKiBTZWFyY2ggUGFnZSAqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG5pZiAod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lID09PSAnL3NlYXJjaCcpIHtcbiAgZG9jdW1lbnQuYm9keS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnI2ZkZmRmZCc7XG5cbiAgY29uc3Qgc2VhcmNoID0gbmV3IFNlYXJjaCgpO1xuXG4gIC8vIEV2ZW50IGxpc3RlbmVyIGZvciB0aGUgc3VibWl0IHNlYXJjaCBidXR0b24uIFRoaXMgZ29lcyB0aHJvdWdoIHRoZSBmb3JtIGFuZCBnZW5lcmF0ZXNcbiAgLy8gdGhlIHF1amVyeSBzdHJpbmcuIEl0IHRoZW4gcGFzc2VzIHRoZSBzdHJpbmcgdG8gdGhlIHNlcnZlciB0aHJvdWdoIHRoZSBVUkxcbiAgZWxlbWVudHMuYXBpU2VhcmNoLnN1Ym1pdEJ0bi5vbmNsaWNrID0gYXN5bmMgKGUpID0+IHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAvLyBDbGVhciBhbnkgZXhpc3RpbmcgcXVlcnkgc3RyaW5nXG4gICAgc2VhcmNoLnJlc2V0U2VhcmNoUXVlcnkoKTtcblxuICAgIC8vIEJ1aWxkIHRoZSBxdWVyeSBzdHJpbmdcbiAgICBjb25zdCBxdWVyeSA9IHNlYXJjaC5idWlsZFNlYXJjaFF1ZXJ5KCk7XG5cbiAgICAvLyBHZXQgdGhlIGRpc3BsYXkgbWV0aG9kXG4gICAgY29uc3QgZGlzcGxheU1ldGhvZCA9IHNlYXJjaC5kaXNwbGF5TWV0aG9kKCk7XG5cbiAgICAvLyBDcmVhdGUgYSBnZXQgcmVxdWVzdCB3aXRoIHRoZSBxdWVyeSBzdHJpbmdcbiAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGAvcmVzdWx0cy8ke2Rpc3BsYXlNZXRob2R9LyR7cXVlcnl9YDtcblxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcblxuICBlbGVtZW50cy5hcGlTZWFyY2gudHlwZUxpbmUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgLy8gRGlzcGxheSB0aGUgZHJvcGRvd25cbiAgICBzZWFyY2hWaWV3LnNob3dUeXBlc0Ryb3BEb3duKCk7XG4gICAgc2VhcmNoVmlldy5zdGFydFR5cGVzRHJvcERvd25OYXZpZ2F0aW9uKCk7XG5cbiAgICAvLyBTdGFydCBhbiBldmVudCBsaXN0ZW5lciBvbiB0aGUgZG9jdW1lbnQuIFRoaXMgd2lsbCBjbG9zZSB0aGUgZHJvcGRvd24gaWYgdGhlIHVzZXIgY2xpY2tzXG4gICAgLy8gb3V0c2lkZSBvZiB0aGUgaW5wdXQgb3IgZHJvcGRvd24uIFRoaXMgd2lsbCBhbHNvIGNhbmNlbCB0aGUgZXZlbnQgbGlzdGVuZXJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNlYXJjaFZpZXcudHlwZUxpbmVMaXN0ZW5lcik7XG4gIH0pO1xuXG4gIGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlTGluZS5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsICgpID0+IHtcbiAgICBpZiAoZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVEcm9wRG93bi5oYXNBdHRyaWJ1dGUoJ2hpZGRlbicpKSB7XG4gICAgICBzZWFyY2hWaWV3LnNob3dUeXBlc0Ryb3BEb3duKCk7XG4gICAgfVxuXG4gICAgc2VhcmNoVmlldy5maWx0ZXJUeXBlcyhlbGVtZW50cy5hcGlTZWFyY2gudHlwZUxpbmUudmFsdWUpO1xuICAgIHNlYXJjaFZpZXcuZmlsdGVyVHlwZUhlYWRlcnMoKTtcbiAgICBzZWFyY2hWaWV3LnN0YXJ0VHlwZXNEcm9wRG93bk5hdmlnYXRpb24oKTtcbiAgfSk7XG5cbiAgZWxlbWVudHMuYXBpU2VhcmNoLnNldElucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgIC8vIERpc3BsYXkgdGhlIGRyb3Bkb3duXG4gICAgc2VhcmNoVmlldy5zaG93U2V0c0Ryb3BEb3duKCk7XG4gICAgc2VhcmNoVmlldy5zdGFydFNldHNEcm9wRG93bk5hdmlnYXRpb24oKTtcblxuICAgIC8vIFN0YXJ0IGFuIGV2ZW50IGxpc3RlbmVyIG9uIHRoZSBkb2N1bWVudC4gVGhpcyB3aWxsIGNsb3NlIHRoZSBkcm9wZG93biBpZiB0aGUgdXNlciBjbGlja3NcbiAgICAvLyBvdXRzaWRlIG9mIHRoZSBpbnB1dCBvciBkcm9wZG93bi4gVGhpcyB3aWxsIGFsc28gY2FuY2VsIHRoZSBldmVudCBsaXN0ZW5lclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2VhcmNoVmlldy5zZXRJbnB1dExpc3RlbmVyKTtcbiAgfSk7XG5cbiAgZWxlbWVudHMuYXBpU2VhcmNoLnNldElucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xuICAgIGlmIChlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd24uaGFzQXR0cmlidXRlKCdoaWRkZW4nKSkge1xuICAgICAgc2VhcmNoVmlldy5zaG93U2V0c0Ryb3BEb3duKCk7XG4gICAgfVxuXG4gICAgc2VhcmNoVmlldy5maWx0ZXJTZXRzKGVsZW1lbnRzLmFwaVNlYXJjaC5zZXRJbnB1dC52YWx1ZSk7XG4gICAgc2VhcmNoVmlldy5maWx0ZXJTZXRIZWFkZXJzKCk7XG4gICAgc2VhcmNoVmlldy5zdGFydFNldHNEcm9wRG93bk5hdmlnYXRpb24oKTtcbiAgfSk7XG5cbiAgZWxlbWVudHMuYXBpU2VhcmNoLnN0YXRWYWx1ZS5hZGRFdmVudExpc3RlbmVyKFxuICAgICdpbnB1dCcsXG4gICAgc2VhcmNoVmlldy5zdGF0TGluZUNvbnRyb2xsZXJcbiAgKTtcblxuICBlbGVtZW50cy5hcGlTZWFyY2guZm9ybWF0LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgJ2NoYW5nZScsXG4gICAgc2VhcmNoVmlldy5mb3JtYXRMaW5lQ29udHJvbGxlclxuICApO1xufVxuXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKiBSZXN1bHRzIFBhZ2UgKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG5pZiAod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnN1YnN0cmluZygxLCA4KSA9PT0gJ3Jlc3VsdHMnKSB7XG4gIGRvY3VtZW50LmJvZHkuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJyNmNWY2ZjcnO1xuXG4gIGNvbnN0IHN0YXRlID0ge1xuICAgIHNlYXJjaDogbmV3IFNlYXJjaCgpLFxuXG4gICAgLy8gR2V0IHRoZSBkaXNwbGF5IG1ldGhvZCwgc29ydCBtZXRob2QsIGFuZCBxdWVyeSBmcm9tIHRoZSBVUkxcbiAgICBkaXNwbGF5OiB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3Vic3RyaW5nKFxuICAgICAgOSxcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5sYXN0SW5kZXhPZignLycpXG4gICAgKSxcbiAgICBxdWVyeTogd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnN1YnN0cmluZyhcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5sYXN0SW5kZXhPZignLycpICsgMVxuICAgICksXG4gICAgc29ydE1ldGhvZDogd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnN1YnN0cmluZyhcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5sYXN0SW5kZXhPZignPScpICsgMVxuICAgICksXG5cbiAgICBhbGxDYXJkczogW10sXG4gICAgY3VycmVudEluZGV4OiAwLFxuICAgIGFsbFJlc3VsdHNMb2FkZWQ6IGZhbHNlLFxuICB9O1xuXG4gIC8vIFdoZW4gdGhlIHJlc3VsdHMgcGFnZSBpcyByZWZyZXNoZWQsIGRpc3BsYXkgdGhlIGNhcmRzIGFzIGEgY2hlY2tsaXN0IGJ5IGRlZmF1bHRcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGFzeW5jICgpID0+IHtcbiAgICAvLyBVcGRhdGUgdGhlIHNvcnQgYnkgYW5kIGRpc3BsYXkgYXNkIG1lbnVzIHNvIHRoZSBzZWxlY3RlZCBvcHRpb24gaXMgd2hhdCB0aGUgdXNlciBzZWxlY3RlZFxuICAgIHJlc3VsdHNWaWV3LmNob3NlU2VsZWN0TWVudVNvcnQoXG4gICAgICBlbGVtZW50cy5yZXN1bHRzUGFnZS5zb3J0QnkoKS5vcHRpb25zLFxuICAgICAgc3RhdGVcbiAgICApO1xuICAgIHJlc3VsdHNWaWV3LmNob3NlU2VsZWN0TWVudURpc3BsYXkoXG4gICAgICBlbGVtZW50cy5yZXN1bHRzUGFnZS5kaXNwbGF5U2VsZWN0b3IoKSxcbiAgICAgIHN0YXRlXG4gICAgKTtcblxuICAgIC8vIFJ1biB0aGUgZ2V0IGNhcmRzIGZ1bmN0aW9uLCB0aGVuIHVwZGF0ZSB0aGUgZGlzcGxheSBiYXIgd2l0aCB0aGUgdG90YWwgY2FyZCBjb3VudFxuICAgIGF3YWl0IHN0YXRlLnNlYXJjaC5nZXRDYXJkcyhzdGF0ZSk7XG5cbiAgICBpZiAoc3RhdGUuYWxsQ2FyZHNbMF0gPT09IDQwNCkge1xuICAgICAgcmVzdWx0c1ZpZXcuZGlzcGxheTQwNCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHJlc3VsdHNWaWV3LnVwZGF0ZURpc3BsYXlCYXIoc3RhdGUpO1xuXG4gICAgLy8gSW4gdGhlIGJhY2tncm91bmQsIGdldCBhbGwgY2FyZHNcbiAgICBzdGF0ZS5zZWFyY2guZ2V0QWxsQ2FyZHMoc3RhdGUsIHJlc3VsdHNWaWV3LmVuYWJsZUJ0bik7XG5cbiAgICAvLyBPbiBsb2FkaW5nIHRoZSBwYWdlIGRpc3BsYXkgdGhlIGNhcmRzIGluIGEgY2hlY2tsaXN0XG4gICAgcmVzdWx0c1ZpZXcudXBkYXRlRGlzcGxheShzdGF0ZSk7XG4gIH0pO1xuXG4gIC8vIEV2ZW50IGxpc3RlbmVyIGZvciB0aGUgY2hhbmdlIGRpc3BsYXkgbWV0aG9kIGJ1dHRvblxuICBlbGVtZW50cy5yZXN1bHRzUGFnZS5idG4oKS5vbmNsaWNrID0gYXN5bmMgKCkgPT4ge1xuICAgIC8vIFVwZGF0ZSB0aGUgZGlzcGxheSBtZXRob2QgYmV0d2VlbiBjaGVja2xpc3QgYW5kIGNhcmRzIGlmIHRoZSB1c2VyIGNoYW5nZWQgaXRcbiAgICByZXN1bHRzVmlldy5jaGFuZ2VEaXNwbGF5QW5kVXJsKHN0YXRlKTtcblxuICAgIC8vIElmIGEgbmV3IHNvcnRpbmcgbWV0aG9kIGlzIHNlbGVjdGVkLCBhIHJlcXVlc3QgaXMgc2VudCB0byB0aGUgc2VydmVyIGFuZCB0aGUgcGFnZSBpcyByZWZyZXNoZWQuXG4gICAgLy8gVGhpcyByZXNldHMgdGhlIHN0YXRlIGFuZCBhc3luYyB0YXNrc1xuICAgIHJlc3VsdHNWaWV3LmNoYW5nZVNvcnRNZXRob2Qoc3RhdGUpO1xuXG4gICAgLy8gVXBkYXRlIHRoZSBkaXNwbGF5IHdpdGggYSBuZXcgc29ydCBtZXRob2QgYW5kIGRpc3BsYXkgbWV0aG9kIGlmIGVpdGhlciB3ZXJlIGdpdmVuXG4gICAgcmVzdWx0c1ZpZXcudXBkYXRlRGlzcGxheShzdGF0ZSk7XG4gIH07XG5cbiAgLy8gRXZlbnQgTGlzdGVuZXIgZm9yIG5leHQgcGFnZSBidXR0b25cbiAgZWxlbWVudHMucmVzdWx0c1BhZ2UubmV4dFBhZ2VCdG4oKS5vbmNsaWNrID0gKCkgPT4ge1xuICAgIC8vIFVwZGF0ZSB0aGUgaW5kZXhcbiAgICBzdGF0ZS5jdXJyZW50SW5kZXgrKztcblxuICAgIC8vIFVwZGF0ZSB0aGUgZGlzcGxheSBiYXNlZCBvbiB0aGUgbWV0aG9kIHN0b3JlZCBpbiB0aGUgc3RhdGVcbiAgICByZXN1bHRzVmlldy51cGRhdGVEaXNwbGF5KHN0YXRlKTtcblxuICAgIC8vIFVwZGF0ZSB0aGUgZGlzcGxheSBiYXJcbiAgICByZXN1bHRzVmlldy51cGRhdGVEaXNwbGF5QmFyKHN0YXRlKTtcblxuICAgIC8vIEVuYWJsZSB0aGUgcHJldmlvdXMgcGFnZSBhbmQgZmlyc3QgcGFnZSBidG5zXG4gICAgcmVzdWx0c1ZpZXcuZW5hYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLnByZXZpb3VzUGFnZUJ0bigpKTtcbiAgICByZXN1bHRzVmlldy5lbmFibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UuZmlyc3RQYWdlQnRuKTtcblxuICAgIC8vIElmIG9uIHRoZSBsYXN0IHBhZ2UsIGRpc2FibGUgdGhlIG5leHQgcGFnZSBidG4gYW5kIGxhc3QgcGFnZSBidG5cbiAgICBpZiAoc3RhdGUuY3VycmVudEluZGV4ID09PSBzdGF0ZS5hbGxDYXJkcy5sZW5ndGggLSAxKSB7XG4gICAgICByZXN1bHRzVmlldy5kaXNhYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLm5leHRQYWdlQnRuKCkpO1xuICAgICAgcmVzdWx0c1ZpZXcuZGlzYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5sYXN0UGFnZUJ0bik7XG4gICAgfVxuICB9O1xuXG4gIC8vIEV2ZW50IGxpc3RlbmVyIGZvciB0aGUgbGFzdCBwYWdlIGJ0blxuICBlbGVtZW50cy5yZXN1bHRzUGFnZS5sYXN0UGFnZUJ0bi5vbmNsaWNrID0gKCkgPT4ge1xuICAgIC8vIFVwZGF0ZSB0aGUgaW5kZXhcbiAgICBzdGF0ZS5jdXJyZW50SW5kZXggPSBzdGF0ZS5hbGxDYXJkcy5sZW5ndGggLSAxO1xuXG4gICAgLy8gVXBkYXRlIHRoZSBkaXNwbGF5IGJhc2VkIG9uIHRoZSBtZXRob2Qgc3RvcmVkIGluIHRoZSBzdGF0ZVxuICAgIHJlc3VsdHNWaWV3LnVwZGF0ZURpc3BsYXkoc3RhdGUpO1xuXG4gICAgLy8gVXBkYXRlIHRoZSBkaXNwbGF5IGJhclxuICAgIHJlc3VsdHNWaWV3LnVwZGF0ZURpc3BsYXlCYXIoc3RhdGUpO1xuXG4gICAgLy8gRGlzYWJsZSB0aGUgbmV4dCBhbmQgbGFzdCBwYWdlIGJ1dHRvbnNcbiAgICByZXN1bHRzVmlldy5kaXNhYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLm5leHRQYWdlQnRuKCkpO1xuICAgIHJlc3VsdHNWaWV3LmRpc2FibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UubGFzdFBhZ2VCdG4pO1xuXG4gICAgLy8gRW5hYmxlIHRoZSBwcmV2aW91cyBhbmQgZmlyc3QgcGFnZSBidXR0b25zXG4gICAgcmVzdWx0c1ZpZXcuZW5hYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLnByZXZpb3VzUGFnZUJ0bigpKTtcbiAgICByZXN1bHRzVmlldy5lbmFibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UuZmlyc3RQYWdlQnRuKTtcbiAgfTtcblxuICAvLyBFdmVudCBsaXN0ZW5lciBmb3IgdGhlIHByZXZpb3VzIHBhZ2UgYnV0dG9uXG4gIGVsZW1lbnRzLnJlc3VsdHNQYWdlLnByZXZpb3VzUGFnZUJ0bigpLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgLy8gVXBkYXRlIHRoZSBpbmRleFxuICAgIHN0YXRlLmN1cnJlbnRJbmRleC0tO1xuXG4gICAgLy8gVXBkYXRlIHRoZSBkaXNwbGF5IGJhc2VkIG9uIHRoZSBtZXRob2Qgc3RvcmVkIGluIHRoZSBzdGF0ZVxuICAgIHJlc3VsdHNWaWV3LnVwZGF0ZURpc3BsYXkoc3RhdGUpO1xuXG4gICAgLy8gVXBkYXRlIHRoZSBkaXNwbGF5IGJhclxuICAgIHJlc3VsdHNWaWV3LnVwZGF0ZURpc3BsYXlCYXIoc3RhdGUpO1xuXG4gICAgLy8gSWYgb24gdGhlIGZpcnN0IHBhZ2UsIGRpc2FibGUgdGhlIHByZXZpb3VzIGFuZCBmaXJzdCBwYWdlIGJ1dHRvbnNcbiAgICBpZiAoc3RhdGUuY3VycmVudEluZGV4ID09PSAwKSB7XG4gICAgICByZXN1bHRzVmlldy5kaXNhYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLnByZXZpb3VzUGFnZUJ0bigpKTtcbiAgICAgIHJlc3VsdHNWaWV3LmRpc2FibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UuZmlyc3RQYWdlQnRuKTtcbiAgICB9XG5cbiAgICAvLyBFbmFibGUgdGhlIG5leHQgYW5kIGxhc3QgcGFnZSBidXR0b25zLiBUaGUgbGFzdCBwYWdlIGJ1dHRvbiBzaG91bGQgb25seSBiZVxuICAgIC8vIGVuYWJsZWQgaWYgYWxsIHJlc3VsdHMgaGF2ZSBiZWVuIGxvYWRlZFxuICAgIHJlc3VsdHNWaWV3LmVuYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5uZXh0UGFnZUJ0bigpKTtcbiAgICBpZiAoc3RhdGUuYWxsUmVzdWx0c0xvYWRlZClcbiAgICAgIHJlc3VsdHNWaWV3LmVuYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5sYXN0UGFnZUJ0bik7XG4gIH07XG5cbiAgLy8gRXZlbnQgbGlzdGVuZXIgZm9yIHRoZSBmaXJzdCBwYWdlIGJ0blxuICBlbGVtZW50cy5yZXN1bHRzUGFnZS5maXJzdFBhZ2VCdG4ub25jbGljayA9ICgpID0+IHtcbiAgICAvLyBVcGRhdGUgdGhlIGluZGV4XG4gICAgc3RhdGUuY3VycmVudEluZGV4ID0gMDtcblxuICAgIC8vIFVwZGF0ZSB0aGUgZGlzcGxheSBiYXNlZCBvbiB0aGUgbWV0aG9kIHN0b3JlZCBpbiB0aGUgc3RhdGVcbiAgICByZXN1bHRzVmlldy51cGRhdGVEaXNwbGF5KHN0YXRlKTtcblxuICAgIC8vIFVwZGF0ZSB0aGUgZGlzcGxheSBiYXJcbiAgICByZXN1bHRzVmlldy51cGRhdGVEaXNwbGF5QmFyKHN0YXRlKTtcblxuICAgIC8vIERpc2FibGUgdGhlIHByZXZpb3VzIGFuZCBmaXJzdCBwYWdlIGJ1dHRvbnNcbiAgICByZXN1bHRzVmlldy5kaXNhYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLnByZXZpb3VzUGFnZUJ0bigpKTtcbiAgICByZXN1bHRzVmlldy5kaXNhYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLmZpcnN0UGFnZUJ0bik7XG5cbiAgICAvLyBFbmFibGUgdGhlIG5leHQgYW5kIGxhc3QgcGFnZSBidXR0b25zLiBUaGUgbGFzdCBwYWdlIGJ1dHRvbiBzaG91bGQgb25seSBiZVxuICAgIC8vIGVuYWJsZWQgaWYgYWxsIHJlc3VsdHMgaGF2ZSBiZWVuIGxvYWRlZFxuICAgIHJlc3VsdHNWaWV3LmVuYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5uZXh0UGFnZUJ0bigpKTtcbiAgICBpZiAoc3RhdGUuYWxsUmVzdWx0c0xvYWRlZClcbiAgICAgIHJlc3VsdHNWaWV3LmVuYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5sYXN0UGFnZUJ0bik7XG4gIH07XG5cbiAgd2luZG93Lm9ucG9wc3RhdGUgPSAoZSkgPT4ge1xuICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gYC9zZWFyY2hgO1xuICB9O1xuXG4gIC8vIE1vYmlsZSBkaXNwbGF5IG1lbnVcbiAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tbW9iaWxlLWRpc3BsYXktb3B0aW9ucycpKSB7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yKCcuanMtLW1vYmlsZS1kaXNwbGF5LW9wdGlvbnMnKVxuICAgICAgLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1tb2JpbGUtZGlzcGxheS1tZW51Jykuc3R5bGUuZGlzcGxheSA9PT1cbiAgICAgICAgICAnZmxleCdcbiAgICAgICAgKSB7XG4gICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1tb2JpbGUtZGlzcGxheS1tZW51Jykuc3R5bGUuZGlzcGxheSA9XG4gICAgICAgICAgICAnbm9uZSc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1tb2JpbGUtZGlzcGxheS1tZW51Jykuc3R5bGUuZGlzcGxheSA9XG4gICAgICAgICAgICAnZmxleCc7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9XG59XG5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKiogQ2FyZCBQYWdlICoqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbmlmICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3Vic3RyaW5nKDEsIDUpID09PSAnY2FyZCcpIHtcbiAgY2FyZFZpZXcuaW5zZXJ0TWFuYUNvc3RUb0NhcmRUZXh0VGl0bGUoKTtcbiAgY2FyZFZpZXcuaW5zZXJ0TWFuYUNvc3RUb09yYWNsZVRleHQoKTtcbiAgY2FyZFZpZXcucmVtb3ZlVW5kZXJTY29yZUZyb21MZWdhbFN0YXR1cygpO1xuICBjYXJkVmlldy5maXhDYXJkUHJpY2VzKCk7XG4gIGNhcmRWaWV3LnNldFByaW50TGlua0hyZWYoKTtcbiAgY2FyZFZpZXcucHJpbnRMaXN0SG92ZXJFdmVudHMoKTtcbiAgY2FyZFZpZXcuc2hvcnRlbkNhcmROYW1lKCk7XG5cbiAgLy8gSWYgdGhlIHRyYW5zZm9ybSBidG4gaXMgb24gdGhlIGRvbSAoaWYgdGhlIGNhcmQgaXMgZG91YmxlIHNpZGVkKSBzZXRcbiAgLy8gdGhlIGV2ZW50IGxpc3RlbmVyIGZvciB0aGUgY2FyZCB0byBiZSBmbGlwcGVkIGJhY2sgYW5kIGZvcnRoXG4gIGlmIChlbGVtZW50cy5jYXJkLnRyYW5zZm9ybUJ0bikge1xuICAgIGVsZW1lbnRzLmNhcmQudHJhbnNmb3JtQnRuLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAnY2xpY2snLFxuICAgICAgY2FyZFZpZXcuZmxpcFRvQmFja1NpZGVcbiAgICApO1xuICB9XG5cbiAgZG9jdW1lbnRcbiAgICAucXVlcnlTZWxlY3RvcignLmpzLS1hZGQtdG8taW52LXN1Ym1pdCcpXG4gICAgLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2FyZFZpZXcuY2hlY2tQcmljZUlucHV0Rm9yRGlnaXRzKTtcbn1cblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqIEludmVudG9yeSBQYWdlICoqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuaWYgKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5lbmRzV2l0aCgnaW52ZW50b3J5JykpIHtcbiAgZG9jdW1lbnQuYm9keS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnI2Y1ZjZmNyc7XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgJ0RPTUNvbnRlbnRMb2FkZWQnLFxuICAgIGludmVudG9yeVZpZXcuYWx0ZXJJbnZlbnRvcnlUYWJsZVxuICApO1xufVxuXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbi8vICoqKiogSW52ZW50b3J5IFNlYXJjaCBQYWdlICoqKiogXFxcXFxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG5pZiAod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnN1YnN0cmluZygxLCAxNykgPT09ICdpbnZlbnRvcnkvc2VhcmNoJykge1xuICBkb2N1bWVudC5ib2R5LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcjZmRmZGZkJztcblxuICBkb2N1bWVudFxuICAgIC5xdWVyeVNlbGVjdG9yKCcuanMtLWludi1zZWFyY2gtYnRuJylcbiAgICAuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBpbnZTZWFyY2guY2hlY2tQcmljZUlucHV0Rm9yRGlnaXRzKTtcblxuICBlbGVtZW50cy5hcGlTZWFyY2gudHlwZUxpbmUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgLy8gRGlzcGxheSB0aGUgZHJvcGRvd25cbiAgICBzZWFyY2hWaWV3LnNob3dUeXBlc0Ryb3BEb3duKCk7XG4gICAgaW52U2VhcmNoLnN0YXJ0VHlwZXNEcm9wRG93bk5hdmlnYXRpb24oKTtcblxuICAgIC8vIFN0YXJ0IGFuIGV2ZW50IGxpc3RlbmVyIG9uIHRoZSBkb2N1bWVudC4gVGhpcyB3aWxsIGNsb3NlIHRoZSBkcm9wZG93biBpZiB0aGUgdXNlciBjbGlja3NcbiAgICAvLyBvdXRzaWRlIG9mIHRoZSBpbnB1dCBvciBkcm9wZG93bi4gVGhpcyB3aWxsIGFsc28gY2FuY2VsIHRoZSBldmVudCBsaXN0ZW5lclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaW52U2VhcmNoLnR5cGVMaW5lTGlzdGVuZXIpO1xuICB9KTtcblxuICBlbGVtZW50cy5hcGlTZWFyY2gudHlwZUxpbmUuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XG4gICAgaWYgKGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlRHJvcERvd24uaGFzQXR0cmlidXRlKCdoaWRkZW4nKSkge1xuICAgICAgc2VhcmNoVmlldy5zaG93VHlwZXNEcm9wRG93bigpO1xuICAgIH1cblxuICAgIHNlYXJjaFZpZXcuZmlsdGVyVHlwZXMoZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVMaW5lLnZhbHVlKTtcbiAgICBzZWFyY2hWaWV3LmZpbHRlclR5cGVIZWFkZXJzKCk7XG4gICAgaW52U2VhcmNoLnN0YXJ0VHlwZXNEcm9wRG93bk5hdmlnYXRpb24oKTtcbiAgfSk7XG5cbiAgZWxlbWVudHMuYXBpU2VhcmNoLnNldElucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgIC8vIERpc3BsYXkgdGhlIGRyb3Bkb3duXG4gICAgc2VhcmNoVmlldy5zaG93U2V0c0Ryb3BEb3duKCk7XG4gICAgaW52U2VhcmNoLnN0YXJ0U2V0c0Ryb3BEb3duTmF2aWdhdGlvbigpO1xuXG4gICAgLy8gU3RhcnQgYW4gZXZlbnQgbGlzdGVuZXIgb24gdGhlIGRvY3VtZW50LiBUaGlzIHdpbGwgY2xvc2UgdGhlIGRyb3Bkb3duIGlmIHRoZSB1c2VyIGNsaWNrc1xuICAgIC8vIG91dHNpZGUgb2YgdGhlIGlucHV0IG9yIGRyb3Bkb3duLiBUaGlzIHdpbGwgYWxzbyBjYW5jZWwgdGhlIGV2ZW50IGxpc3RlbmVyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBpbnZTZWFyY2guc2V0SW5wdXRMaXN0ZW5lcik7XG4gIH0pO1xuXG4gIGVsZW1lbnRzLmFwaVNlYXJjaC5zZXRJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsICgpID0+IHtcbiAgICBpZiAoZWxlbWVudHMuYXBpU2VhcmNoLnNldERyb3BEb3duLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIHtcbiAgICAgIHNlYXJjaFZpZXcuc2hvd1NldHNEcm9wRG93bigpO1xuICAgIH1cblxuICAgIHNlYXJjaFZpZXcuZmlsdGVyU2V0cyhlbGVtZW50cy5hcGlTZWFyY2guc2V0SW5wdXQudmFsdWUpO1xuICAgIHNlYXJjaFZpZXcuZmlsdGVyU2V0SGVhZGVycygpO1xuICAgIGludlNlYXJjaC5zdGFydFNldHNEcm9wRG93bk5hdmlnYXRpb24oKTtcbiAgfSk7XG59XG5cbmlmICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuaW5jbHVkZXMoJy9jYXJkJykpIHtcbiAgZG9jdW1lbnQuYm9keS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnI2Y1ZjZmNyc7XG59XG5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqIE1vYmlsZSBOYXYgQnV0dG9uICoqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcblxuaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tbmF2LWhhbWJ1cmdlcicpKSB7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tbmF2LWhhbWJ1cmdlcicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLW1vYmlsZS1saW5rcycpLnN0eWxlLmRpc3BsYXkgPT09ICdmbGV4Jykge1xuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1tb2JpbGUtbGlua3MnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIH0gZWxzZSB7XG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLW1vYmlsZS1saW5rcycpLnN0eWxlLmRpc3BsYXkgPSAnZmxleCc7XG4gICAgfVxuICB9KTtcbn1cbiIsImltcG9ydCBheGlvcyBmcm9tICdheGlvcyc7XG5cbmltcG9ydCB7IGVsZW1lbnRzIH0gZnJvbSAnLi4vdmlld3MvYmFzZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlYXJjaCB7XG4gIHNlYXJjaEJ5TmFtZSgpIHtcbiAgICBsZXQgY2FyZE5hbWUgPSBlbGVtZW50cy5hcGlTZWFyY2guY2FyZE5hbWUudmFsdWU7XG4gICAgY2FyZE5hbWUgPSBjYXJkTmFtZS5yZXBsYWNlKCcgJywgJysnKTtcblxuICAgIGlmIChjYXJkTmFtZSkgdGhpcy5zZWFyY2ggKz0gY2FyZE5hbWU7XG4gIH1cblxuICBzZWFyY2hCeU90ZXh0KCkge1xuICAgIGNvbnN0IG9yYWNsZVRleHQgPSBlbGVtZW50cy5hcGlTZWFyY2gub3JhY2xlVGV4dC52YWx1ZTtcblxuICAgIC8vIElmIHRoZSBvcmFjbGUgdGV4dCBpbmNsdWRlcyBtb3JlIHRoYW4gb25lIHdvcmQsIHdlIG5lZWQgdG8gc2VhcmNoIHRoZSB0ZXJtcyBpbmRpdmlkdWFsbHlcbiAgICBpZiAoXG4gICAgICBvcmFjbGVUZXh0LmluY2x1ZGVzKCcgJykgJiZcbiAgICAgIG9yYWNsZVRleHQuaW5kZXhPZignICcpICE9PSBvcmFjbGVUZXh0Lmxlbmd0aCAtIDFcbiAgICApIHtcbiAgICAgIGxldCB0ZW1wb3JhcnlTdHIgPSAnJztcbiAgICAgIGNvbnN0IHRleHRzID0gb3JhY2xlVGV4dC5zcGxpdCgnICcpO1xuXG4gICAgICB0ZXh0cy5mb3JFYWNoKCh0ZXh0KSA9PiB7XG4gICAgICAgIGlmICh0ZXh0Lmxlbmd0aCA+IDApIHRlbXBvcmFyeVN0ciArPSBgb3JhY2xlJTNBJHt0ZXh0fStgO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuc2VhcmNoICs9IGArJTI4JHt0ZW1wb3JhcnlTdHIuc2xpY2UoMCwgLTEpfSUyOWA7XG4gICAgfSBlbHNlIGlmIChvcmFjbGVUZXh0KSB0aGlzLnNlYXJjaCArPSBgK29yYWNsZSUzQSR7b3JhY2xlVGV4dH1gO1xuICB9XG5cbiAgc2VhcmNoQnlDYXJkVHlwZSgpIHtcbiAgICBjb25zdCB0eXBlc1RvSW5jbHVkZSA9IEFycmF5LmZyb20oXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1pbmNsdWRlLXR5cGVdJylcbiAgICApO1xuICAgIGNvbnN0IHR5cGVzVG9FeGNsdWRlID0gQXJyYXkuZnJvbShcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWV4Y2x1ZGUtdHlwZV0nKVxuICAgICk7XG4gICAgY29uc3QgaW5jbHVkZVBhcnRpYWxUeXBlcyA9IGVsZW1lbnRzLmFwaVNlYXJjaC5pbmNsdWRlUGFydGlhbFR5cGVzLmNoZWNrZWQ7XG4gICAgbGV0IHRlbXBvcmFyeVN0ciA9ICcnO1xuXG4gICAgaWYgKHR5cGVzVG9JbmNsdWRlICYmICFpbmNsdWRlUGFydGlhbFR5cGVzKSB7XG4gICAgICB0eXBlc1RvSW5jbHVkZS5mb3JFYWNoKCh0eXBlKSA9PiB7XG4gICAgICAgIHRoaXMuc2VhcmNoICs9IGArdHlwZSUzQSR7dHlwZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaW5jbHVkZS10eXBlJyl9YDtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICh0eXBlc1RvSW5jbHVkZS5sZW5ndGggPiAwICYmIGluY2x1ZGVQYXJ0aWFsVHlwZXMpIHtcbiAgICAgIHR5cGVzVG9JbmNsdWRlLmZvckVhY2goKHR5cGUpID0+IHtcbiAgICAgICAgdGVtcG9yYXJ5U3RyICs9IGB0eXBlJTNBJHt0eXBlLmdldEF0dHJpYnV0ZSgnZGF0YS1pbmNsdWRlLXR5cGUnKX0rT1IrYDtcbiAgICAgIH0pO1xuXG4gICAgICB0ZW1wb3JhcnlTdHIgPSB0ZW1wb3JhcnlTdHIuc2xpY2UoMCwgLTQpO1xuICAgICAgdGhpcy5zZWFyY2ggKz0gYCslMjgke3RlbXBvcmFyeVN0cn0lMjlgO1xuICAgIH1cblxuICAgIGlmICh0eXBlc1RvRXhjbHVkZSkge1xuICAgICAgdHlwZXNUb0V4Y2x1ZGUuZm9yRWFjaCgodHlwZSkgPT4ge1xuICAgICAgICB0aGlzLnNlYXJjaCArPSBgKy10eXBlJTNBJHt0eXBlLmdldEF0dHJpYnV0ZSgnZGF0YS1leGNsdWRlLXR5cGUnKX1gO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgc2VhcmNoQnlDb2xvcigpIHtcbiAgICBsZXQgYm94ZXMgPSBlbGVtZW50cy5hcGlTZWFyY2guY29sb3JCb3hlcztcblxuICAgIC8vIExvb3AgdGhyb3VnaCBjaGVja2JveGVzIHRvIGdldCBhbGwgY29sb3JzIGdpdmVuXG4gICAgdmFyIGNvbG9ycyA9ICcnO1xuICAgIGJveGVzLmZvckVhY2goKGJveCkgPT4ge1xuICAgICAgaWYgKGJveC5jaGVja2VkKSBjb2xvcnMgKz0gYm94LnZhbHVlO1xuICAgIH0pO1xuXG4gICAgY29uc3Qgc29ydEJ5ID0gZWxlbWVudHMuYXBpU2VhcmNoLmNvbG9yU29ydEJ5LnZhbHVlO1xuXG4gICAgaWYgKGNvbG9ycykgdGhpcy5zZWFyY2ggKz0gYCtjb2xvciR7c29ydEJ5fSR7Y29sb3JzfWA7XG4gIH1cblxuICBzZWFyY2hCeVN0YXRzKCkge1xuICAgIGNvbnN0IHN0YXRMaW5lcyA9IEFycmF5LmZyb20oXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWFwaS1zdGF0cy13cmFwcGVyJylcbiAgICApO1xuXG4gICAgc3RhdExpbmVzLmZvckVhY2goKGxpbmUpID0+IHtcbiAgICAgIGNvbnN0IHN0YXQgPSBsaW5lLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXN0YXQnKS52YWx1ZTtcbiAgICAgIGNvbnN0IHNvcnRCeSA9IGxpbmUucXVlcnlTZWxlY3RvcignLmpzLS1hcGktc3RhdC1maWx0ZXInKS52YWx1ZTtcbiAgICAgIGNvbnN0IHNvcnRWYWx1ZSA9IGxpbmUucXVlcnlTZWxlY3RvcignLmpzLS1hcGktc3RhdC12YWx1ZScpLnZhbHVlO1xuXG4gICAgICBpZiAoc3RhdCAmJiBzb3J0QnkgJiYgc29ydFZhbHVlKSB7XG4gICAgICAgIHRoaXMuc2VhcmNoICs9IGArJHtzdGF0fSR7c29ydEJ5fSR7c29ydFZhbHVlfWA7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBzZWFyY2hCeUZvcm1hdCgpIHtcbiAgICBjb25zdCBmb3JtYXRMaW5lcyA9IEFycmF5LmZyb20oXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWFwaS1mb3JtYXQtd3JhcHBlcicpXG4gICAgKTtcblxuICAgIGZvcm1hdExpbmVzLmZvckVhY2goKGxpbmUpID0+IHtcbiAgICAgIGNvbnN0IHN0YXR1cyA9IGxpbmUucXVlcnlTZWxlY3RvcignLmpzLS1hcGktbGVnYWwtc3RhdHVzJykudmFsdWU7XG4gICAgICBjb25zdCBmb3JtYXQgPSBsaW5lLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLWZvcm1hdCcpLnZhbHVlO1xuXG4gICAgICBpZiAoZm9ybWF0ICYmIHN0YXR1cykgdGhpcy5zZWFyY2ggKz0gYCske3N0YXR1c30lM0Eke2Zvcm1hdH1gO1xuICAgIH0pO1xuICB9XG5cbiAgc2VhcmNoQnlTZXQoKSB7XG4gICAgY29uc3Qgc2V0cyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtaW5jbHVkZS1zZXRdJykpO1xuICAgIGxldCB0ZW1wb3JhcnlTdHIgPSAnJztcblxuICAgIGlmIChzZXRzLmxlbmd0aCA+IDApIHtcbiAgICAgIHNldHMuZm9yRWFjaChcbiAgICAgICAgKHMpID0+XG4gICAgICAgICAgKHRlbXBvcmFyeVN0ciArPSBgc2V0JTNBJHtzLmdldEF0dHJpYnV0ZSgnZGF0YS1pbmNsdWRlLXNldCcpfStPUitgKVxuICAgICAgKTtcblxuICAgICAgdGVtcG9yYXJ5U3RyID0gdGVtcG9yYXJ5U3RyLnNsaWNlKDAsIC00KTtcbiAgICAgIHRoaXMuc2VhcmNoICs9IGArJTI4JHt0ZW1wb3JhcnlTdHJ9JTI5YDtcbiAgICB9XG4gIH1cblxuICBzZWFyY2hCeVJhcml0eSgpIHtcbiAgICBjb25zdCBib3hlcyA9IGVsZW1lbnRzLmFwaVNlYXJjaC5yYXJpdHlCb3hlcztcbiAgICB2YXIgdmFsdWVzID0gW107XG4gICAgbGV0IHRlbXBvcmFyeVN0ciA9ICcnO1xuXG4gICAgLy8gUHVzaCBhbGwgcmFyaXRpZXMgZ2l2ZW4gYnkgdGhlIHVzZXIgaW50byB0aGUgdmFsdWVzIGFycmF5XG4gICAgYm94ZXMuZm9yRWFjaCgoYm94KSA9PiB7XG4gICAgICBpZiAoYm94LmNoZWNrZWQpIHZhbHVlcy5wdXNoKGJveC52YWx1ZSk7XG4gICAgfSk7XG5cbiAgICBpZiAodmFsdWVzLmxlbmd0aCA+IDApIHtcbiAgICAgIC8vIFdlIG5lZWQgYSBzdGFydGVyIHN0cmluZyBzbyB3ZSBjYW4gc2xpY2UgaXQgbGF0ZXIgJTI4IGlzIGFuIG9wZW4gcGFyZW50aGVzZXNcbiAgICAgIHRlbXBvcmFyeVN0ciArPSAnJTI4JztcblxuICAgICAgLy8gRm9yIGV2ZXJ5IHZhbHVlIGdpdmVuIGJ5IHRoZSB1c2VyIHdlIG5lZWQgdG8gYWRkIHRoZSArT1IrXG4gICAgICAvLyB0byB0aGUgZW5kIGZvciBncm91cGluZy4gV2Ugd2lsbCByZW1vdmUgdGhlICtPUisgZnJvbSB0aGUgbGFzdFxuICAgICAgLy8gaXRlcmF0aW9uIG9mIHRoZSBsb29wXG4gICAgICB2YWx1ZXMuZm9yRWFjaCgodmFsdWUpID0+ICh0ZW1wb3JhcnlTdHIgKz0gYHJhcml0eSUzQSR7dmFsdWV9K09SK2ApKTtcblxuICAgICAgLy8gUmVtb3ZlIHRoZSB1bm5lY2Vzc2FyeSArT1IrIGF0IHRoZSBlbmRcbiAgICAgIHRlbXBvcmFyeVN0ciA9IHRlbXBvcmFyeVN0ci5zbGljZSgwLCAtNCk7XG5cbiAgICAgIC8vIENsb3NlIHRoZSBwYXJlbnRoZXNlc1xuICAgICAgdGVtcG9yYXJ5U3RyICs9IGAlMjlgO1xuXG4gICAgICB0aGlzLnNlYXJjaCArPSBgKyR7dGVtcG9yYXJ5U3RyfWA7XG4gICAgfVxuICB9XG5cbiAgc2VhcmNoQnlDb3N0KCkge1xuICAgIGNvbnN0IGRlbm9taW5hdGlvbiA9IGVsZW1lbnRzLmFwaVNlYXJjaC5kZW5vbWluYXRpb24udmFsdWU7XG4gICAgY29uc3Qgc29ydEJ5ID0gZWxlbWVudHMuYXBpU2VhcmNoLmRlbm9taW5hdGlvblNvcnRCeS52YWx1ZTtcbiAgICBjb25zdCBpbnB1dFZhbCA9IGVsZW1lbnRzLmFwaVNlYXJjaC5kZW5vbWluYXRpb25Tb3J0VmFsdWUudmFsdWU7XG5cbiAgICBpZiAoaW5wdXRWYWwpIHRoaXMuc2VhcmNoICs9IGArJHtkZW5vbWluYXRpb259JHtzb3J0Qnl9JHtpbnB1dFZhbH1gO1xuICB9XG5cbiAgcXVpY2tTZWFyY2goKSB7XG4gICAgbGV0IGNhcmROYW1lID0gZWxlbWVudHMubmF2LnNlYXJjaElucHV0LnZhbHVlO1xuICAgIGNhcmROYW1lID0gY2FyZE5hbWUucmVwbGFjZSgnICcsICcrJyk7XG4gICAgcmV0dXJuIGNhcmROYW1lO1xuICB9XG5cbiAgc29ydFJlc3VsdHMoKSB7XG4gICAgY29uc3Qgc29ydEJ5ID0gZWxlbWVudHMuYXBpU2VhcmNoLmNhcmRTb3J0ZXIudmFsdWU7XG4gICAgdGhpcy5zZWFyY2ggKz0gYCZvcmRlcj0ke3NvcnRCeX1gO1xuICB9XG5cbiAgLy8gVGhpcyBtZXRob2Qgd2lsbCBydW4gZWFjaCBvZiB0aGUgaW5kaXZpZHVhbCBzZWFyY2ggbWV0aG9kcyB0byBidWlsZCB0aGUgZmluYWwgc2VhcmNoIHF1ZXJ5XG4gIGJ1aWxkU2VhcmNoUXVlcnkoKSB7XG4gICAgdGhpcy5zZWFyY2hCeU5hbWUoKTtcbiAgICB0aGlzLnNlYXJjaEJ5T3RleHQoKTtcbiAgICB0aGlzLnNlYXJjaEJ5Q2FyZFR5cGUoKTtcbiAgICB0aGlzLnNlYXJjaEJ5Q29sb3IoKTtcbiAgICB0aGlzLnNlYXJjaEJ5U3RhdHMoKTtcbiAgICB0aGlzLnNlYXJjaEJ5Rm9ybWF0KCk7XG4gICAgdGhpcy5zZWFyY2hCeVNldCgpO1xuICAgIHRoaXMuc2VhcmNoQnlSYXJpdHkoKTtcbiAgICB0aGlzLnNlYXJjaEJ5Q29zdCgpO1xuICAgIHRoaXMuc29ydFJlc3VsdHMoKTtcblxuICAgIHJldHVybiB0aGlzLnNlYXJjaDtcbiAgfVxuXG4gIHJlc2V0U2VhcmNoUXVlcnkoKSB7XG4gICAgdGhpcy5zZWFyY2ggPSAnJztcbiAgfVxuXG4gIGRpc3BsYXlNZXRob2QoKSB7XG4gICAgcmV0dXJuIGVsZW1lbnRzLmFwaVNlYXJjaC5kaXNwbGF5QXMudmFsdWU7XG4gIH1cblxuICAvLyBSZXR1bnMgdGhlIGZpcnN0IHBhZ2Ugb2YgY2FyZHNcbiAgYXN5bmMgZ2V0Q2FyZHMoc3RhdGUpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgYXhpb3NcbiAgICAgICAgLmdldChgaHR0cHM6Ly9hcGkuc2NyeWZhbGwuY29tL2NhcmRzL3NlYXJjaD9xPSR7c3RhdGUucXVlcnl9YClcbiAgICAgICAgLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgc2VhcmNoXG4gICAgICAgICAgdGhpcy5yZXN1bHRzID0gcmVzLmRhdGE7XG4gICAgICAgICAgdGhpcy5jYXJkcyA9IHJlcy5kYXRhLmRhdGE7XG5cbiAgICAgICAgICAvLyBTdG9yZSB0aGUgY2FyZHMgaW4gdGhlIGFsbENhcmRzIGFycmF5XG4gICAgICAgICAgc3RhdGUuYWxsQ2FyZHMucHVzaChyZXMuZGF0YS5kYXRhKTtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgaWYgKGVyci5yZXNwb25zZS5zdGF0dXMgPT09IDQwNCkge1xuICAgICAgICAgICAgc3RhdGUuYWxsQ2FyZHMucHVzaCg0MDQpO1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvLyBVc2VkIGJ5IGdldEFsbENhcmRzIHRvIGdldCBlYWNoIGFycmF5IG9mIDE3NSBjYXJkc1xuICBhc3luYyBsb29wTmV4dFBhZ2Uoc3RhdGUsIGVuYWJsZUJ0bikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBheGlvcy5nZXQodGhpcy5yZXN1bHRzLm5leHRfcGFnZSkudGhlbigocmVzKSA9PiB7XG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgcmVzdWx0cyBvYmplY3RcbiAgICAgICAgdGhpcy5yZXN1bHRzID0gcmVzLmRhdGE7XG5cbiAgICAgICAgLy8gUHVzaCB0aGUgY2FyZHMgZnJvbSB0aGlzIHJlc3VsdCBpbnRvIHRoZSBhbGxDYXJkcyBhcnJheVxuICAgICAgICBzdGF0ZS5hbGxDYXJkcy5wdXNoKHJlcy5kYXRhLmRhdGEpO1xuXG4gICAgICAgIC8vIEVuYWJsZSB0aGUgbmV4dCBwYWdlIGJ0biBhbmQgcmVzb2x2ZSB0aGUgcHJvbWlzZVxuICAgICAgICBlbmFibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UubmV4dFBhZ2VCdG4oKSk7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gV2lsbCBydW4gaW4gdGhlIGJhY2tncm91bmQgYWZ0ZXIgdGhlIGZpcnN0IHNldCBvZiBjYXJkcyBpcyByZXRyaWV2ZWQgdG8gbWFrZSBtb3ZpbmcgYmV0d2VlbiByZXN1bHRzXG4gIC8vIHBhZ2VzIGZhc3RlclxuICBhc3luYyBnZXRBbGxDYXJkcyhzdGF0ZSwgZW5hYmxlQnRuKSB7XG4gICAgLy8gQXMgbG9uZyBhcyB0aGVyZSBpcyBhIG5leHRfcGFnZSBrZWVwIGxvYWRpbmcgdGhlIGNhcmRzXG4gICAgd2hpbGUgKHRoaXMucmVzdWx0cy5uZXh0X3BhZ2UpIGF3YWl0IHRoaXMubG9vcE5leHRQYWdlKHN0YXRlLCBlbmFibGVCdG4pO1xuXG4gICAgLy8gVXBkYXRlIHRoZSBzdGF0ZSBvbmNlIGFsbCBjYXJkcyBoYXZlIGJlZW4gcmV0cmVpZXZlZFxuICAgIHN0YXRlLmFsbFJlc3VsdHNMb2FkZWQgPSB0cnVlO1xuXG4gICAgLy8gSWYgdGhlcmUgaXMgYXQgbGVhc3QgMiBwYWdlcyBvZiBjYXJkcywgZW5hYmxlIHRoZSBsYXN0IHBhZ2UgYnRuLlxuICAgIGlmIChzdGF0ZS5hbGxDYXJkcy5sZW5ndGggPiAxKSBlbmFibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UubGFzdFBhZ2VCdG4pO1xuICB9XG59XG4iLCJleHBvcnQgY29uc3QgZWxlbWVudHMgPSB7XG4gIG5hdjoge1xuICAgIHF1aWNrU2VhcmNoQnRuOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLW5hdi1zZWFyY2gnKSxcbiAgICBzZWFyY2hJbnB1dDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1uYXYtc2VhcmNoLWlucHV0JyksXG4gIH0sXG4gIGFwaVNlYXJjaDoge1xuICAgIGNhcmROYW1lOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1jYXJkLW5hbWUnKSxcbiAgICBvcmFjbGVUZXh0OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1vLXRleHQnKSxcbiAgICB0eXBlTGluZTogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktdHlwZS1saW5lJyksXG4gICAgc2VsZWN0ZWRUeXBlczogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktc2VsZWN0ZWQtdHlwZXMnKSxcbiAgICBpbmNsdWRlUGFydGlhbFR5cGVzOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS10eXBlLWJveCcpLFxuICAgIHR5cGVEcm9wRG93bjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktdHlwZXMtZHJvcGRvd24nKSxcbiAgICBjb2xvckJveGVzOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWFwaS1jb2xvci1ib3gnKSxcbiAgICBjb2xvclNvcnRCeTogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktY29sb3Itc29ydGVyJyksXG4gICAgc3RhdDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktc3RhdCcpLFxuICAgIHN0YXRGaWx0ZXI6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXN0YXQtZmlsdGVyJyksXG4gICAgc3RhdFZhbHVlOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1zdGF0LXZhbHVlJyksXG4gICAgbGVnYWxTdGF0dXM6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLWxlZ2FsLXN0YXR1cycpLFxuICAgIGZvcm1hdDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktZm9ybWF0JyksXG4gICAgc2V0SW5wdXQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXNldCcpLFxuICAgIHNldERyb3BEb3duOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1zZXQtZHJvcGRvd24nKSxcbiAgICBzZWxlY3RlZFNldHM6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXNlbGVjdGVkLXNldHMnKSxcbiAgICBibG9jazogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktYmxvY2snKSxcbiAgICByYXJpdHlCb3hlczogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1hcGktcmFyaXR5LWJveCcpLFxuICAgIGRlbm9taW5hdGlvbjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktZGVub21pbmF0aW9uJyksXG4gICAgZGVub21pbmF0aW9uU29ydEJ5OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1kZW5vbWluYXRpb24tc29ydC1ieScpLFxuICAgIGRlbm9taW5hdGlvblNvcnRWYWx1ZTogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICcuanMtLWFwaS1kZW5vbWluYXRpb24tc29ydC12YWx1ZSdcbiAgICApLFxuICAgIGNhcmRTb3J0ZXI6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXJlc3VsdHMtc29ydGVyJyksXG4gICAgZGlzcGxheUFzOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1zZWFyY2gtZGlzcGxheS1zZWxlY3RvcicpLFxuICAgIHN1Ym1pdEJ0bjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktYnRuJyksXG4gIH0sXG4gIHJlc3VsdHNQYWdlOiB7XG4gICAgcmVzdWx0c0NvbnRhaW5lcjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktcmVzdWx0cy1kaXNwbGF5JyksXG4gICAgZGlzcGxheVNlbGVjdG9yOiAoKSA9PiB7XG4gICAgICBpZiAod2luZG93LmlubmVyV2lkdGggPCA4NTEpXG4gICAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXJlc3VsdHMtZGlzcGxheS1vcHRpb24tbW9iaWxlJyk7XG4gICAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1yZXN1bHRzLWRpc3BsYXktb3B0aW9uJyk7XG4gICAgfSxcbiAgICBzb3J0Qnk6ICgpID0+IHtcbiAgICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA8IDg1MSlcbiAgICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tcmVzdWx0cy1zb3J0LW9wdGlvbnMtbW9iaWxlJyk7XG4gICAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1yZXN1bHRzLXNvcnQtb3B0aW9ucycpO1xuICAgIH0sXG4gICAgYnRuOiAoKSA9PiB7XG4gICAgICBpZiAod2luZG93LmlubmVyV2lkdGggPCA4NTEpXG4gICAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXJlc3VsdHMtc3VibWl0LWJ0bi1tb2JpbGUnKTtcbiAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXJlc3VsdHMtc3VibWl0LWJ0bicpO1xuICAgIH0sXG4gICAgY2FyZENoZWNrbGlzdDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1jYXJkLWNoZWNrbGlzdCcpLFxuICAgIGltYWdlR3JpZDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1pbWFnZS1ncmlkJyksXG4gICAgZGlzcGxheUJhcjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktZGlzcGxheS1iYXInKSxcbiAgICBmaXJzdFBhZ2VCdG46IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLWZpcnN0LXBhZ2UnKSxcbiAgICBsYXN0UGFnZUJ0bjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktbGFzdC1wYWdlJyksXG4gICAgcHJldmlvdXNQYWdlQnRuOiAoKSA9PiB7XG4gICAgICBpZiAod2luZG93LmlubmVyV2lkdGggPCA4NTEpXG4gICAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1wcmV2aW91cy1wYWdlLW1vYmlsZScpO1xuICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXByZXZpb3VzLXBhZ2UnKTtcbiAgICB9LFxuICAgIG5leHRQYWdlQnRuOiAoKSA9PiB7XG4gICAgICBpZiAod2luZG93LmlubmVyV2lkdGggPCA4NTEpXG4gICAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1uZXh0LXBhZ2UtbW9iaWxlJyk7XG4gICAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktbmV4dC1wYWdlJyk7XG4gICAgfSxcbiAgfSxcbiAgY2FyZDoge1xuICAgIG1hbmFDb3N0VGl0bGVTcGFuOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWNhcmQtbWFuYS1jb3N0JyksXG4gICAgb3JhY2xlVGV4dHM6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tb3JhY2xlLXRleHQtbGluZScpLFxuICAgIGxlZ2FsaXRpZXM6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tY2FyZC1sZWdhbGl0eScpLFxuICAgIHByaW50Um93czogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1jYXJkLXByaW50LXJvdycpLFxuICAgIHByaWNlczogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1jYXJkLXByaWNlJyksXG4gICAgY2FyZFByaW50TGlua3M6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tY2FyZC1wcmludC1saW5rJyksXG4gICAgZnJvbnQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tZnJvbnQnKSxcbiAgICBiYWNrOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWJhY2snKSxcbiAgICB0cmFuc2Zvcm1CdG46IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tY2FyZC10cmFuc2Zvcm0nKSxcbiAgfSxcbn07XG4iLCJpbXBvcnQgeyBnZW5lcmF0ZU1hbmFDb3N0SW1hZ2VzIH0gZnJvbSAnLi9yZXN1bHRzVmlldyc7XG5pbXBvcnQgeyBlbGVtZW50cyB9IGZyb20gJy4vYmFzZSc7XG5cbmV4cG9ydCBjb25zdCBpbnNlcnRNYW5hQ29zdFRvQ2FyZFRleHRUaXRsZSA9ICgpID0+IHtcbiAgY29uc3QgbWFuYUNvc3RzID0gQXJyYXkuZnJvbShlbGVtZW50cy5jYXJkLm1hbmFDb3N0VGl0bGVTcGFuKTtcblxuICBtYW5hQ29zdHMuZm9yRWFjaCgoY29zdCkgPT4ge1xuICAgIGNvc3QuaW5uZXJIVE1MID0gZ2VuZXJhdGVNYW5hQ29zdEltYWdlcyhcbiAgICAgIGNvc3QuZ2V0QXR0cmlidXRlKCdkYXRhLW1hbmEtY29zdCcpXG4gICAgKTtcbiAgfSk7XG59O1xuXG5leHBvcnQgY29uc3QgaW5zZXJ0TWFuYUNvc3RUb09yYWNsZVRleHQgPSAoKSA9PiB7XG4gIGNvbnN0IG9yYWNsZVRleHRzID0gQXJyYXkuZnJvbShlbGVtZW50cy5jYXJkLm9yYWNsZVRleHRzKTtcblxuICBpZiAob3JhY2xlVGV4dHMubGVuZ3RoID4gMCkge1xuICAgIG9yYWNsZVRleHRzLmZvckVhY2goXG4gICAgICAodGV4dCkgPT4gKHRleHQuaW5uZXJIVE1MID0gZ2VuZXJhdGVNYW5hQ29zdEltYWdlcyh0ZXh0LmlubmVySFRNTCwgJ3hzJykpXG4gICAgKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IHJlbW92ZVVuZGVyU2NvcmVGcm9tTGVnYWxTdGF0dXMgPSAoKSA9PiB7XG4gIGNvbnN0IGxlZ2FsaXRpZXMgPSBBcnJheS5mcm9tKGVsZW1lbnRzLmNhcmQubGVnYWxpdGllcyk7XG5cbiAgbGVnYWxpdGllcy5mb3JFYWNoKChsZWdhbGl0eSkgPT4ge1xuICAgIGlmIChsZWdhbGl0eS5pbm5lckhUTUwuaW5jbHVkZXMoJ18nKSkge1xuICAgICAgbGVnYWxpdHkuaW5uZXJIVE1MID0gbGVnYWxpdHkuaW5uZXJIVE1MLnJlcGxhY2UoJ18nLCAnICcpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5leHBvcnQgY29uc3QgZml4Q2FyZFByaWNlcyA9ICgpID0+IHtcbiAgY29uc3QgcHJpY2VzID0gQXJyYXkuZnJvbShlbGVtZW50cy5jYXJkLnByaWNlcyk7XG5cbiAgcHJpY2VzLmZvckVhY2goKHByaWNlKSA9PiB7XG4gICAgaWYgKHByaWNlLmlubmVySFRNTC5pbmNsdWRlcygnTm9uZScpKSBwcmljZS5pbm5lckhUTUwgPSAnLSc7XG4gIH0pO1xufTtcblxuY29uc3QgZml4RG91YmxlU2lkZWRDYXJkTmFtZSA9IChjYXJkTmFtZSkgPT4ge1xuICBpZiAoY2FyZE5hbWUuaW5jbHVkZXMoJy8nKSkge1xuICAgIGNhcmROYW1lID0gY2FyZE5hbWUuc3Vic3RyaW5nKDAsIGNhcmROYW1lLmluZGV4T2YoJy8nKSAtIDEpO1xuICB9XG4gIHJldHVybiBjYXJkTmFtZTtcbn07XG5cbmV4cG9ydCBjb25zdCBzZXRQcmludExpbmtIcmVmID0gKCkgPT4ge1xuICBjb25zdCBsaW5rcyA9IEFycmF5LmZyb20oZWxlbWVudHMuY2FyZC5jYXJkUHJpbnRMaW5rcyk7XG5cbiAgbGlua3MuZm9yRWFjaCgobGluaykgPT4ge1xuICAgIGxldCBjYXJkTmFtZSA9IGxpbmsuZ2V0QXR0cmlidXRlKCdkYXRhLW5hbWUnKS5yZXBsYWNlQWxsKCcgJywgJy0nKTtcbiAgICBjYXJkTmFtZSA9IGZpeERvdWJsZVNpZGVkQ2FyZE5hbWUoY2FyZE5hbWUpO1xuICAgIGNvbnN0IHNldENvZGUgPSBsaW5rLmdldEF0dHJpYnV0ZSgnZGF0YS1zZXQnKTtcblxuICAgIGxpbmsuaHJlZiA9IGAvY2FyZC8ke3NldENvZGV9LyR7Y2FyZE5hbWV9YDtcbiAgfSk7XG59O1xuXG5jb25zdCBzZXREb3VibGVTaWRlZFRyYW5zaXRpb24gPSAoKSA9PiB7XG4gIC8vIENoZWNrcyB0byBzZWUgaWYgYW4gaW5saW5lIHN0eWxlIGhhcyBiZWVuIHNldCBmb3IgdGhlIGZyb250IG9mIHRoZSBjYXJkLlxuICAvLyBJZiBub3QsIHNldCBhIHRyYW5zaXRvbi4gVGhpcyBtYWtlcyBzdXJlIHdlIGRvbid0IHNldCB0aGUgdHJhbnNpdG9uIGV2ZXJ5XG4gIC8vIHRpbWUgdGhlIGNhcmQgaXMgZmxpcHBlZC5cblxuICBpZiAoIWVsZW1lbnRzLmNhcmQuZnJvbnQuZ2V0QXR0cmlidXRlKCdzdHlsZScpKSB7XG4gICAgZWxlbWVudHMuY2FyZC5mcm9udC5zdHlsZS50cmFuc2l0aW9uID0gYGFsbCAuOHMgZWFzZWA7XG4gICAgZWxlbWVudHMuY2FyZC5iYWNrLnN0eWxlLnRyYW5zaXRpb24gPSBgYWxsIC44cyBlYXNlYDtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGZsaXBUb0JhY2tTaWRlID0gKCkgPT4ge1xuICAvLyBTZXRzIHRoZSB0cmFuc2l0aW9uIHByb3BlcnR5IG9uIGJvdGggc2lkZXMgb2YgdGhlIGNhcmQgdGhlIGZpcnN0IHRpbWUgdGhlXG4gIC8vIHRyYW5zZm9ybSBidXR0b24gaXMgY2xpY2tlZFxuICBzZXREb3VibGVTaWRlZFRyYW5zaXRpb24oKTtcblxuICAvLyBSb3RhdGVzIHRoZSBjYXJkIHRvIHNob3cgdGhlIGJhY2tzaWRlLlxuICBlbGVtZW50cy5jYXJkLmZyb250LnN0eWxlLnRyYW5zZm9ybSA9IGByb3RhdGVZKC0xODBkZWcpYDtcbiAgZWxlbWVudHMuY2FyZC5iYWNrLnN0eWxlLnRyYW5zZm9ybSA9IGByb3RhdGVZKDApYDtcblxuICAvLyBSZXNldCB0aGUgZXZlbnQgbGlzdGVuZXIgc28gdGhhdCBvbiBjbGlja2luZyB0aGUgYnV0dG9uIGl0IHdpbGwgZmxpcFxuICAvLyBiYWNrIHRvIHRoZSBmcm9udCBvZiB0aGUgY2FyZFxuICBlbGVtZW50cy5jYXJkLnRyYW5zZm9ybUJ0bi5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIGZsaXBUb0JhY2tTaWRlKTtcbiAgZWxlbWVudHMuY2FyZC50cmFuc2Zvcm1CdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmbGlwVG9Gcm9udFNpZGUpO1xufTtcblxuZXhwb3J0IGNvbnN0IGZsaXBUb0Zyb250U2lkZSA9ICgpID0+IHtcbiAgZWxlbWVudHMuY2FyZC5mcm9udC5zdHlsZS50cmFuc2Zvcm0gPSBgcm90YXRlWSgwKWA7XG4gIGVsZW1lbnRzLmNhcmQuYmFjay5zdHlsZS50cmFuc2Zvcm0gPSBgcm90YXRlWSgxODBkZWcpYDtcblxuICAvLyBSZXNldCB0aGUgZXZlbnQgbGlzdGVuZXIgc28gdGhhdCBvbiBjbGlja2luZyB0aGUgYnV0dG9uIGl0IHdpbGwgZmxpcFxuICAvLyB0byB0aGUgYmFja3NpZGUgb2YgdGhlIGNhcmRcbiAgZWxlbWVudHMuY2FyZC50cmFuc2Zvcm1CdG4ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmbGlwVG9Gcm9udFNpZGUpO1xuICBlbGVtZW50cy5jYXJkLnRyYW5zZm9ybUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZsaXBUb0JhY2tTaWRlKTtcbn07XG5cbi8vIENyZWF0ZSB0aGUgaG92ZXIgZWZmZWN0IG9uIGVhY2ggcm93IHRoYXQgZGlzcGxheXMgdGhlIGltYWdlIG9mIHRoZSBjYXJkXG5leHBvcnQgY29uc3QgcHJpbnRMaXN0SG92ZXJFdmVudHMgPSAoKSA9PiB7XG4gIC8vIEdldCB0aGUgSFRNTCBmb3IgZWFjaCB0YWJsZSByb3dcbiAgY29uc3QgcHJpbnRzID0gQXJyYXkuZnJvbShlbGVtZW50cy5jYXJkLnByaW50Um93cyk7XG5cbiAgcHJpbnRzLmZvckVhY2goKHByaW50KSA9PiB7XG4gICAgcHJpbnQub25tb3VzZW1vdmUgPSAoZSkgPT4ge1xuICAgICAgLy8gSWYgdGhlIHdpbmRvdyBpcyBzbWFsbGVyIHRoYW4gNzY4IHBpeGVscywgZG9uJ3QgZGlzcGxheSBhbnkgaW1hZ2VzXG4gICAgICBpZiAod2luZG93LmlubmVyV2lkdGggPCA3NjgpIHJldHVybiBmYWxzZTtcblxuICAgICAgLy8gSWYgdGhlcmUgaXMgYWxyZWFkeSBhbiBpbWFnZSBiZWluZyBkaXNwbGF5ZWQsIHJlbW92ZSBpdCBmcm9tIHRoZSBET01cbiAgICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudG9vbHRpcCcpKSB7XG4gICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRvb2x0aXAnKSk7XG4gICAgICB9XG5cbiAgICAgIC8vIFByZXAgdGhlIGRpdi5cbiAgICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgZGl2LmNsYXNzTmFtZSA9ICd0b29sdGlwJztcblxuICAgICAgLy8gVGhlIGRpdiBpcyBzdHlsZWQgd2l0aCBwb3NpdGlvbiBhYnNvbHV0ZS4gVGhpcyBjb2RlIHB1dHMgaXQganVzdCB0byB0aGUgcmlnaHQgb2YgdGhlIGN1cnNvclxuICAgICAgZGl2LnN0eWxlLmxlZnQgPSBlLnBhZ2VYICsgNTAgKyAncHgnO1xuICAgICAgZGl2LnN0eWxlLnRvcCA9IGUucGFnZVkgLSAzMCArICdweCc7XG5cbiAgICAgIC8vIFByZXAgdGhlIGltZyBlbGVtZW50XG4gICAgICBjb25zdCBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcbiAgICAgIGltZy5jbGFzc05hbWUgPSAndG9vbHRpcF9faW1nJztcbiAgICAgIGltZy5zcmMgPSBwcmludC5nZXRBdHRyaWJ1dGUoJ2RhdGEtY2FyZEltZycpO1xuXG4gICAgICAvLyBQdXQgdGhlIGltZyBpbnRvIHRoZSBkaXYgYW5kIHRoZW4gYXBwZW5kIHRoZSBkaXYgZGlyZWN0bHkgdG8gdGhlIGJvZHkgb2YgdGhlIGRvY3VtZW50LlxuICAgICAgZGl2LmFwcGVuZENoaWxkKGltZyk7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpdik7XG4gICAgfTtcblxuICAgIC8vIFJlbW92ZSB0aGUgaW1nIHdoZW4gdGFraW5nIHRoZSBjdXJzb3Igb2ZmIHRoZSBwcmludFxuICAgIHByaW50Lm9ubW91c2VvdXQgPSAoZSkgPT4ge1xuICAgICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50b29sdGlwJykpIHtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudG9vbHRpcCcpKTtcbiAgICAgIH1cbiAgICB9O1xuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBzaG9ydGVuQ2FyZE5hbWUgPSAoKSA9PiB7XG4gIGNvbnN0IG5hbWVzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWNhcmQtbmFtZScpKTtcbiAgY29uc29sZS5sb2cobmFtZXMpO1xuXG4gIG5hbWVzLmZvckVhY2goKG4pID0+IHtcbiAgICBpZiAobi5pbm5lclRleHQuaW5jbHVkZXMoJy8nKSkge1xuICAgICAgbi5pbm5lckhUTUwgPSBuLmlubmVySFRNTC5zdWJzdHJpbmcoMCwgbi5pbm5lckhUTUwuaW5kZXhPZignLycpIC0gMSk7XG4gICAgfVxuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBjaGVja1ByaWNlSW5wdXRGb3JEaWdpdHMgPSAoZSkgPT4ge1xuICBjb25zdCBwcmljZUlucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hZGQtdG8taW52LXByaWNlJykudmFsdWU7XG5cbiAgaWYgKGlzTmFOKHByaWNlSW5wdXQpICYmIHByaWNlSW5wdXQgIT09ICcnKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHJlbmRlclByaWNlSW5wdXRFcnJvck1lc3NhZ2UoKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn07XG5cbmNvbnN0IHJlbmRlclByaWNlSW5wdXRFcnJvck1lc3NhZ2UgPSAoKSA9PiB7XG4gIGNvbnN0IHByaWNlSW5wdXREaXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFkZC10by1pbnYtcHJpY2UtZGl2Jyk7XG4gIGNvbnN0IG1zZyA9IGA8cCBjbGFzcz1cImFkZC10by1pbnYtcHJpY2UtbXNnXCI+SW52YWxpZCBwcmljZS4gTXVzdCBiZSBhIG51bWJlci48L3A+YDtcblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5hZGQtdG8taW52LXByaWNlLW1zZycpKSB7XG4gICAgcHJpY2VJbnB1dERpdi5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWVuZCcsIG1zZyk7XG4gIH1cbn07XG4iLCJpbXBvcnQgeyBlbGVtZW50cyB9IGZyb20gJy4vYmFzZSc7XG5pbXBvcnQgKiBhcyBzZWFyY2hWaWV3IGZyb20gJy4vc2VhcmNoVmlldyc7XG5cbmV4cG9ydCBjb25zdCBjaGVja1ByaWNlSW5wdXRGb3JEaWdpdHMgPSAoZSkgPT4ge1xuICBjb25zdCBwcmljZUlucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1pbnYtZGVub21pbmF0aW9uLXNvcnQtdmFsdWUnKVxuICAgIC52YWx1ZTtcblxuICBpZiAoaXNOYU4ocHJpY2VJbnB1dCkgJiYgcHJpY2VJbnB1dCAhPT0gJycpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgcmVuZGVyUHJpY2VJbnB1dEVycm9yTWVzc2FnZSgpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufTtcblxuY29uc3QgcmVuZGVyUHJpY2VJbnB1dEVycm9yTWVzc2FnZSA9ICgpID0+IHtcbiAgY29uc3QgcHJpY2VJbnB1dERpdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taW52LXNlYXJjaC1wcmljZS1kaXYnKTtcbiAgY29uc3QgbXNnID0gYDxwIGNsYXNzPVwiaW52LXNlYXJjaC1wcmljZS1tc2dcIj5JbnZhbGlkIHByaWNlLiBNdXN0IGJlIGEgbnVtYmVyLjwvcD5gO1xuXG4gIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmludi1zZWFyY2gtcHJpY2UtbXNnJykpIHtcbiAgICBwcmljZUlucHV0RGl2Lmluc2VydEFkamFjZW50SFRNTCgnYmVmb3JlZW5kJywgbXNnKTtcbiAgfVxufTtcblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqIFRZUEUgTElORSAqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuXG5jb25zdCBoaWRlVHlwZXNEcm9wRG93bkJ1dEtlZXBWYWx1ZSA9ICgpID0+IHtcbiAgaWYgKCFlbGVtZW50cy5hcGlTZWFyY2gudHlwZURyb3BEb3duLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIHtcbiAgICBlbGVtZW50cy5hcGlTZWFyY2gudHlwZURyb3BEb3duLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgbmF2aWdhdGVUeXBlc0Ryb3BEb3duKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IHN0YXJ0VHlwZXNEcm9wRG93bk5hdmlnYXRpb24gPSAoKSA9PiB7XG4gIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBuYXZpZ2F0ZVR5cGVzRHJvcERvd24pO1xuICBjb25zdCBmaXJzdFR5cGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXR5cGU6bm90KFtoaWRkZW5dKScpO1xuICBzZWFyY2hWaWV3LmhpZ2hsaWdodFR5cGUoZmlyc3RUeXBlKTtcbiAgc2VhcmNoVmlldy5ob3Zlck92ZXJUeXBlc0xpc3RlbmVyKCk7XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBuYXZpZ2F0ZVR5cGVzRHJvcERvd24pO1xuICBlbGVtZW50cy5hcGlTZWFyY2gudHlwZURyb3BEb3duLnNjcm9sbFRvcCA9IDA7XG59O1xuXG5jb25zdCBuYXZpZ2F0ZVR5cGVzRHJvcERvd24gPSAoZSkgPT4ge1xuICBjb25zdCB0eXBlcyA9IEFycmF5LmZyb20oXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS10eXBlOm5vdChbaGlkZGVuXSknKVxuICApO1xuICBjb25zdCBpID0gdHlwZXMuaW5kZXhPZihkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWhpZ2hsaWdodGVkJykpO1xuXG4gIGlmIChlLmNvZGUgPT09ICdBcnJvd0Rvd24nICYmIGkgPCB0eXBlcy5sZW5ndGggLSAxKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHNlYXJjaFZpZXcucmVtb3ZlQ3VycmVudEhpZ2hsaWdodCgpO1xuICAgIHNlYXJjaFZpZXcuaGlnaGxpZ2h0VHlwZSh0eXBlc1tpICsgMV0pO1xuXG4gICAgc2VhcmNoVmlldy5zZXRTY3JvbGxUb3BPbkRvd25BcnJvdyhcbiAgICAgIHR5cGVzW2kgKyAxXSxcbiAgICAgIGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlRHJvcERvd25cbiAgICApO1xuICB9XG5cbiAgaWYgKGUuY29kZSA9PT0gJ0Fycm93VXAnKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgLy8gV2UgYWx3YXlzIHdhbnQgdG8gcHJldmVudCB0aGUgZGVmYXVsdC4gV2Ugb25seSB3YW50IHRvIGNoYW5nZSB0aGVcbiAgICAvLyBoaWdobGlnaHQgaWYgbm90IG9uIHRoZSB0b3AgdHlwZSBpbiB0aGUgZHJvcGRvd25cbiAgICBpZiAoaSA+IDApIHtcbiAgICAgIHNlYXJjaFZpZXcucmVtb3ZlQ3VycmVudEhpZ2hsaWdodCgpO1xuICAgICAgc2VhcmNoVmlldy5oaWdobGlnaHRUeXBlKHR5cGVzW2kgLSAxXSk7XG5cbiAgICAgIHNlYXJjaFZpZXcuc2V0U2Nyb2xsVG9wT25VcEFycm93KFxuICAgICAgICB0eXBlc1tpIC0gMV0sXG4gICAgICAgIGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlRHJvcERvd25cbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgaWYgKGUuY29kZSA9PT0gJ0VudGVyJykge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBzZXRJbnB1dFZhbHVlKFxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1oaWdobGlnaHRlZCcpLmdldEF0dHJpYnV0ZSgnZGF0YS10eXBlJylcbiAgICApO1xuICAgIGhpZGVUeXBlc0Ryb3BEb3duQnV0S2VlcFZhbHVlKCk7XG4gIH1cbn07XG5cbmNvbnN0IHNldElucHV0VmFsdWUgPSAodHlwZSkgPT4ge1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS10eXBlLWxpbmUnKS52YWx1ZSA9IHR5cGU7XG59O1xuXG5leHBvcnQgY29uc3QgdHlwZUxpbmVMaXN0ZW5lciA9IChlKSA9PiB7XG4gIC8vIElmIHRoZSB0YXJnZXQgaXMgbm90IFR5cGUgTGluZSBpbnB1dCBsaW5lLCBvciBhbiBlbGVtZW50IGluIHRoZSBkcm9wZG93biBsaXN0LFxuICAvLyBjbG9zZSB0aGUgZHJvcGRvd24gYW5kIHJlbW92ZSB0aGUgZXZlbnQgbGlzdGVuZXJcbiAgaWYgKFxuICAgIGUudGFyZ2V0ICE9PSBlbGVtZW50cy5hcGlTZWFyY2gudHlwZUxpbmUgJiZcbiAgICAhZS50YXJnZXQubWF0Y2hlcygnLmpzLS1hcGktZHJvcGRvd24tdHlwZXMtbGlzdCcpXG4gICkge1xuICAgIHNlYXJjaFZpZXcuaGlkZVR5cGVzRHJvcERvd24oKTtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHR5cGVMaW5lTGlzdGVuZXIpO1xuICAgIC8vIElmIHRoZSB0YXJnZXQgaXMgb25lIGlmIHR5cGVzLCBnZXQgdGhlIGRhdGEgdHlwZVxuICB9IGVsc2UgaWYgKGUudGFyZ2V0Lmhhc0F0dHJpYnV0ZSgnZGF0YS10eXBlJykpIHtcbiAgICBzZXRJbnB1dFZhbHVlKGUudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS10eXBlJykpO1xuICAgIGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlTGluZS5mb2N1cygpO1xuICAgIGhpZGVUeXBlc0Ryb3BEb3duQnV0S2VlcFZhbHVlKCk7XG4gIH1cbn07XG5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKioqKiBTRVRTICoqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcblxuY29uc3QgaGlkZVNldHNEcm9wRG93bkJ1dEtlZXBWYWx1ZSA9ICgpID0+IHtcbiAgaWYgKCFlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd24uaGFzQXR0cmlidXRlKCdoaWRkZW4nKSkge1xuICAgIGVsZW1lbnRzLmFwaVNlYXJjaC5zZXREcm9wRG93bi5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG5hdmlnYXRlU2V0c0Ryb3BEb3duKTtcbiAgfVxufTtcblxuY29uc3QgbmF2aWdhdGVTZXRzRHJvcERvd24gPSAoZSkgPT4ge1xuICBjb25zdCBzZXRzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLXNldDpub3QoW2hpZGRlbl0pJykpO1xuICBjb25zdCBpID0gc2V0cy5pbmRleE9mKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taGlnaGxpZ2h0ZWQnKSk7XG5cbiAgaWYgKGUuY29kZSA9PT0gJ0Fycm93RG93bicgJiYgaSA8IHNldHMubGVuZ3RoIC0gMSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBzZWFyY2hWaWV3LnJlbW92ZUN1cnJlbnRIaWdobGlnaHQoKTtcbiAgICBzZWFyY2hWaWV3LmhpZ2hsaWdodFNldChzZXRzW2kgKyAxXSk7XG5cbiAgICBzZWFyY2hWaWV3LnNldFNjcm9sbFRvcE9uRG93bkFycm93KFxuICAgICAgc2V0c1tpICsgMV0sXG4gICAgICBlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd25cbiAgICApO1xuICB9XG5cbiAgaWYgKGUuY29kZSA9PT0gJ0Fycm93VXAnICYmIGkgPiAwKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHNlYXJjaFZpZXcucmVtb3ZlQ3VycmVudEhpZ2hsaWdodCgpO1xuICAgIHNlYXJjaFZpZXcuaGlnaGxpZ2h0U2V0KHNldHNbaSAtIDFdKTtcblxuICAgIHNlYXJjaFZpZXcuc2V0U2Nyb2xsVG9wT25VcEFycm93KFxuICAgICAgc2V0c1tpIC0gMV0sXG4gICAgICBlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd25cbiAgICApO1xuICB9XG5cbiAgaWYgKGUuY29kZSA9PT0gJ0VudGVyJykge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIGFkZFNldChcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taGlnaGxpZ2h0ZWQnKS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2V0LW5hbWUnKVxuICAgICk7XG5cbiAgICBoaWRlU2V0c0Ryb3BEb3duQnV0S2VlcFZhbHVlKCk7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBzdGFydFNldHNEcm9wRG93bk5hdmlnYXRpb24gPSAoKSA9PiB7XG4gIGNvbnN0IGZpcnN0U2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1zZXQ6bm90KFtoaWRkZW5dKScpO1xuICBzZWFyY2hWaWV3LmhpZ2hsaWdodFNldChmaXJzdFNldCk7XG4gIHNlYXJjaFZpZXcuaG92ZXJPdmVyU2V0c0xpc3RlbmVyKCk7XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBuYXZpZ2F0ZVNldHNEcm9wRG93bik7XG4gIGVsZW1lbnRzLmFwaVNlYXJjaC5zZXREcm9wRG93bi5zY3JvbGxUb3AgPSAwO1xufTtcblxuY29uc3QgYWRkU2V0ID0gKHNldE5hbWUpID0+IHtcbiAgZWxlbWVudHMuYXBpU2VhcmNoLnNldElucHV0LnZhbHVlID0gc2V0TmFtZTtcbn07XG5cbmV4cG9ydCBjb25zdCBzZXRJbnB1dExpc3RlbmVyID0gKGUpID0+IHtcbiAgLy8gSWYgdGhlIHRhcmdldCBpcyBub3QgdGhlIHNldCBpbnB1dCBmaWVsZCwgb3IgYW4gZWxlbWVudCBpbiB0aGUgZHJvcGRvd24gbGlzdCxcbiAgLy8gY2xvc2UgdGhlIGRyb3Bkb3duIGFuZCByZW1vdmUgdGhlIGV2ZW50IGxpc3RlbmVyXG4gIGlmIChcbiAgICBlLnRhcmdldCAhPT0gZWxlbWVudHMuYXBpU2VhcmNoLnNldElucHV0ICYmXG4gICAgIWUudGFyZ2V0Lm1hdGNoZXMoJy5qcy0tYXBpLWRyb3Bkb3duLXNldHMtbGlzdCcpXG4gICkge1xuICAgIHNlYXJjaFZpZXcuaGlkZVNldHNEcm9wRG93bigpO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2V0SW5wdXRMaXN0ZW5lcik7XG4gICAgLy8gSWYgdGhlIHRhcmdldCBpcyBvbmUgb2YgdGhlIHNldCBvcHRpb25zLCB0b2dnbGUgaXQgYXMgc2VsZWN0ZWQsIGFkZCBpdCB0byB0aGUgbGlzdCxcbiAgICAvLyBhbmQgaGlkZSB0aGUgZHJvcGRvd24uXG4gIH0gZWxzZSBpZiAoZS50YXJnZXQuaGFzQXR0cmlidXRlKCdkYXRhLXNldC1uYW1lJykpIHtcbiAgICBhZGRTZXQoZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXNldC1uYW1lJykpO1xuICAgIGVsZW1lbnRzLmFwaVNlYXJjaC5zZXRJbnB1dC5mb2N1cygpO1xuICAgIGhpZGVTZXRzRHJvcERvd25CdXRLZWVwVmFsdWUoKTtcbiAgfVxufTtcbiIsImltcG9ydCB7IGdlbmVyYXRlTWFuYUNvc3RJbWFnZXMgfSBmcm9tICcuL3Jlc3VsdHNWaWV3JztcbmltcG9ydCB7IGNoZWNrTGlzdEhvdmVyRXZlbnRzIH0gZnJvbSAnLi9yZXN1bHRzVmlldyc7XG5cbmNvbnN0IHNob3J0ZW5UeXBlTGluZSA9ICgpID0+IHtcbiAgY29uc3QgdHlwZXMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0taW52LXR5cGVzJykpO1xuICB0eXBlcy5mb3JFYWNoKCh0eXBlKSA9PiB7XG4gICAgbGV0IGh0bWwgPSB0eXBlLmlubmVySFRNTDtcblxuICAgIC8vIGlmIHRoZSDigJQgZGVsaW1pdGVyIGlzIGZvdW5kIGluIHRoZSBzdHJpbmcsIHJldHVybiBldmVyeXRoaW5nIGJlZm9yZSB0aGUgZGVsaW1pdGVyXG4gICAgaWYgKGh0bWwuaW5kZXhPZign4oCUJykgIT09IC0xKSB7XG4gICAgICB0eXBlLmlubmVySFRNTCA9IGh0bWwuc3Vic3RyaW5nKDAsIGh0bWwuaW5kZXhPZign4oCUJykgLSAxKTtcbiAgICB9XG4gIH0pO1xufTtcblxuY29uc3QgYWx0ZXJNYW5hSW1hZ2VzID0gKCkgPT4ge1xuICBjb25zdCBtYW5hQ29zdHMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0taW52LW1hbmEtY29zdCcpKTtcblxuICBtYW5hQ29zdHMuZm9yRWFjaCgoY29zdCkgPT4ge1xuICAgIGNvc3QuaW5uZXJIVE1MID0gZ2VuZXJhdGVNYW5hQ29zdEltYWdlcyhjb3N0LmlubmVySFRNTCk7XG4gIH0pO1xufTtcblxuLy8gTm90IHVzaW5nIHRoaXMgcmlnaHQgbm93ICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbmNvbnN0IHNvcnRUYWJsZUFscGhhYmV0aWNhbGx5ID0gKCkgPT4ge1xuICBsZXQgcm93cyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1jaGVja2xpc3Qtcm93JykpO1xuICBjb25zdCB0YWJsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tY2FyZC1jaGVja2xpc3QnKTtcbiAgbGV0IGNhcmRzID0gW107XG5cbiAgcm93cy5mb3JFYWNoKChyb3cpID0+IHtcbiAgICBjYXJkcy5wdXNoKHJvdy5xdWVyeVNlbGVjdG9yKCcuanMtLWNoZWNrbGlzdC1jYXJkLW5hbWUnKS5pbm5lckhUTUwpO1xuICAgIHJvdy5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKHJvdyk7XG4gIH0pO1xuXG4gIGNhcmRzID0gY2FyZHMuc29ydCgpO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY2FyZHMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCByb3dJbmRleCA9IHJvd3MuaW5kZXhPZihcbiAgICAgIHJvd3MuZmluZCgocm93KSA9PiByb3cuZ2V0QXR0cmlidXRlKCdkYXRhLXJvdycpID09PSBjYXJkc1tpXSlcbiAgICApO1xuXG4gICAgdGFibGUuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdiZWZvcmVlbmQnLCByb3dzW3Jvd0luZGV4XSk7XG5cbiAgICByb3dzLnNwbGljZShyb3dJbmRleCwgMSk7XG4gIH1cbn07XG5cbmNvbnN0IGdpdmVFYXJuaW5nc0NvbHVtbk1vZGlmaWVyID0gKCkgPT4ge1xuICBjb25zdCByb3dzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWludi1lYXJuaW5ncycpKTtcbiAgY29uc29sZS5sb2cocm93cyk7XG5cbiAgcm93cy5mb3JFYWNoKChyb3cpID0+IHtcbiAgICBpZiAocm93LmlubmVyVGV4dC5zdGFydHNXaXRoKCctJykpIHtcbiAgICAgIHJvdy5jbGFzc0xpc3QuYWRkKCduZWdhdGl2ZS1lYXJuaW5ncycpO1xuICAgIH0gZWxzZSBpZiAocm93LmlubmVyVGV4dCA9PT0gJzAuMCcpIHtcbiAgICAgIHJvdy5jbGFzc0xpc3QuYWRkKCduby1lYXJuaW5ncycpO1xuICAgIH0gZWxzZSB7XG4gICAgICByb3cuY2xhc3NMaXN0LmFkZCgncG9zaXRpdmUtZWFybmluZ3MnKTtcbiAgICB9XG4gIH0pO1xufTtcblxuY29uc3QgcmVtb3ZlSGFzaFRhZ0Zyb21SYXJpdHkgPSAoKSA9PiB7XG4gIGNvbnN0IHJhcml0eXMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tcmFyaXR5JykpO1xuICByYXJpdHlzLmZvckVhY2goKHIpID0+IChyLmlubmVyVGV4dCA9IHIuaW5uZXJUZXh0LnN1YnN0cmluZygxKSkpO1xufTtcblxuZXhwb3J0IGNvbnN0IGFsdGVySW52ZW50b3J5VGFibGUgPSAoKSA9PiB7XG4gIHNob3J0ZW5UeXBlTGluZSgpO1xuICBhbHRlck1hbmFJbWFnZXMoKTtcbiAgY2hlY2tMaXN0SG92ZXJFdmVudHMoKTtcbiAgZ2l2ZUVhcm5pbmdzQ29sdW1uTW9kaWZpZXIoKTtcbiAgcmVtb3ZlSGFzaFRhZ0Zyb21SYXJpdHkoKTtcbn07XG4iLCJpbXBvcnQgeyBlbGVtZW50cyB9IGZyb20gJy4vYmFzZSc7XG5cbmNvbnN0IGNsZWFyQ2hlY2tsaXN0ID0gKCkgPT4ge1xuICBjb25zdCBjaGVja0xpc3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWNhcmQtY2hlY2tsaXN0Jyk7XG4gIGlmIChjaGVja0xpc3QpIHtcbiAgICBjaGVja0xpc3QucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChjaGVja0xpc3QpO1xuXG4gICAgLy8gUmVtb3ZlIGFueSB0b29sIHRpcCBpbWFnZXMgaWYgdXNlciB3YXMgaG92ZXJpbmdcbiAgICBjb25zdCB0b29sVGlwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRvb2x0aXAnKTtcbiAgICBpZiAodG9vbFRpcCkgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCh0b29sVGlwKTtcbiAgfVxufTtcblxuY29uc3QgY2xlYXJJbWFnZUdyaWQgPSAoKSA9PiB7XG4gIGNvbnN0IGdyaWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWltYWdlLWdyaWQnKTtcbiAgaWYgKGdyaWQpIGdyaWQucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChncmlkKTtcbn07XG5cbmNvbnN0IGNsZWFyUmVzdWx0cyA9ICgpID0+IHtcbiAgY2xlYXJDaGVja2xpc3QoKTtcbiAgY2xlYXJJbWFnZUdyaWQoKTtcbn07XG5cbmNvbnN0IHByZXBJbWFnZUNvbnRhaW5lciA9ICgpID0+IHtcbiAgY29uc3QgbWFya3VwID0gYFxuICAgICAgICA8ZGl2IGNsYXNzPVwiaW1hZ2UtZ3JpZCBqcy0taW1hZ2UtZ3JpZFwiPjwvZGl2PlxuICAgIGA7XG4gIGVsZW1lbnRzLnJlc3VsdHNQYWdlLnJlc3VsdHNDb250YWluZXIuaW5zZXJ0QWRqYWNlbnRIVE1MKCdiZWZvcmVlbmQnLCBtYXJrdXApO1xufTtcblxuY29uc3QgZ2VuZXJhdGVTaW5nbGVTaWRlZENhcmQgPSAoY2FyZCkgPT4ge1xuICBjb25zdCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgY29uc3QgaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG5cbiAgYS5jbGFzc0xpc3QgPSBgaW1hZ2UtZ3JpZF9fbGluayBqcy0taW1hZ2UtZ3JpZC1saW5rYDtcbiAgYS5ocmVmID0gYC9jYXJkLyR7Y2FyZC5zZXR9LyR7cGFyc2VDYXJkTmFtZShjYXJkLm5hbWUpfWA7XG5cbiAgZGl2LmNsYXNzTGlzdCA9IGBpbWFnZS1ncmlkX19jb250YWluZXJgO1xuICBpbWcuc3JjID0gYCR7Y2FyZC5pbWFnZV91cmlzLm5vcm1hbH1gO1xuICBpbWcuYWx0ID0gYCR7Y2FyZC5uYW1lfWA7XG4gIGltZy5jbGFzc0xpc3QgPSBgaW1hZ2UtZ3JpZF9faW1hZ2VgO1xuICBkaXYuYXBwZW5kQ2hpbGQoaW1nKTtcbiAgYS5hcHBlbmRDaGlsZChkaXYpO1xuXG4gIGRvY3VtZW50XG4gICAgLnF1ZXJ5U2VsZWN0b3IoJy5qcy0taW1hZ2UtZ3JpZCcpXG4gICAgLmluc2VydEFkamFjZW50RWxlbWVudCgnYmVmb3JlZW5kJywgYSk7XG59O1xuXG5jb25zdCBzaG93QmFja1NpZGUgPSAoY2FyZCkgPT4ge1xuICBjb25zdCBmcm9udCA9IGNhcmQucXVlcnlTZWxlY3RvcignLmpzLS1pbWFnZS1ncmlkLWNhcmQtc2lkZS1mcm9udCcpO1xuICBjb25zdCBiYWNrID0gY2FyZC5xdWVyeVNlbGVjdG9yKCcuanMtLWltYWdlLWdyaWQtY2FyZC1zaWRlLWJhY2snKTtcblxuICBmcm9udC5zdHlsZS50cmFuc2Zvcm0gPSAncm90YXRlWSgtMTgwZGVnKSc7XG4gIGJhY2suc3R5bGUudHJhbnNmb3JtID0gJ3JvdGF0ZVkoMCknO1xuXG4gIGZyb250LmNsYXNzTGlzdC5yZW1vdmUoJ2pzLS1zaG93aW5nJyk7XG4gIGJhY2suY2xhc3NMaXN0LmFkZCgnanMtLXNob3dpbmcnKTtcbn07XG5cbmNvbnN0IHNob3dGcm9udFNpZGUgPSAoY2FyZCkgPT4ge1xuICBjb25zdCBmcm9udCA9IGNhcmQucXVlcnlTZWxlY3RvcignLmpzLS1pbWFnZS1ncmlkLWNhcmQtc2lkZS1mcm9udCcpO1xuICBjb25zdCBiYWNrID0gY2FyZC5xdWVyeVNlbGVjdG9yKCcuanMtLWltYWdlLWdyaWQtY2FyZC1zaWRlLWJhY2snKTtcblxuICBmcm9udC5zdHlsZS50cmFuc2Zvcm0gPSAncm90YXRlWSgwKSc7XG4gIGJhY2suc3R5bGUudHJhbnNmb3JtID0gJ3JvdGF0ZVkoMTgwZGVnKSc7XG5cbiAgZnJvbnQuY2xhc3NMaXN0LmFkZCgnanMtLXNob3dpbmcnKTtcbiAgYmFjay5jbGFzc0xpc3QucmVtb3ZlKCdqcy0tc2hvd2luZycpO1xufTtcblxuY29uc3QgZmxpcENhcmQgPSAoZSkgPT4ge1xuICAvLyBQcmV2ZW50IHRoZSBsaW5rIGZyb20gZ29pbmcgdG8gdGhlIGNhcmQgc3BlY2lmaWMgcGFnZVxuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIGNvbnN0IGNhcmQgPSBlLnRhcmdldC5wYXJlbnRFbGVtZW50O1xuICBjb25zb2xlLmxvZyhjYXJkKTtcblxuICBjb25zdCBmcm9udCA9IGNhcmQucXVlcnlTZWxlY3RvcignLmpzLS1pbWFnZS1ncmlkLWNhcmQtc2lkZS1mcm9udCcpO1xuXG4gIC8vIElmIHRoZSBmcm9udCBpcyBzaG93aW5nLCBkaXNwbGF5IHRoZSBiYWNrc2lkZS4gT3RoZXJ3aXNlLCBkaXNwbGF5IHRoZSBmcm9udFxuICBpZiAoZnJvbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdqcy0tc2hvd2luZycpKSBzaG93QmFja1NpZGUoY2FyZCk7XG4gIGVsc2Ugc2hvd0Zyb250U2lkZShjYXJkKTtcbn07XG5cbmNvbnN0IGdlbmVyYXRlRmxpcENhcmRCdG4gPSAoKSA9PiB7XG4gIGNvbnN0IGJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICBidG4uY2xhc3NMaXN0ID0gJ2ltYWdlLWdyaWRfX2RvdWJsZS1idG4ganMtLWltYWdlLWdyaWQtZmxpcC1jYXJkLWJ0bic7XG4gIGJ0bi5pbm5lckhUTUwgPSBgXG4gICAgPHN2ZyB2ZXJzaW9uPVwiMS4xXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHdpZHRoPVwiMzBcIiBoZWlnaHQ9XCIzMFwiIHZpZXdCb3g9XCIwIDAgMTAyNCAxMDI0XCIgY2xhc3M9XCJpbWFnZS1ncmlkX19kb3VibGUtYnRuLXN2Z1wiPlxuXG4gICAgPHBhdGggZD1cIk04ODQuMywzNTcuNmMxMTYuOCwxMTcuNywxNTEuNywyNzctMzYyLjIsMzIwVjQ5Ni40TDI0My4yLDc2My44TDUyMiwxMDMxLjNWODYwLjhDODI4LjgsODM5LjQsMTI0NC45LDYwNC41LDg4NC4zLDM1Ny42elwiIGNsYXNzPVwiaW1hZ2UtZ3JpZF9fZG91YmxlLWJ0bi1zdmdcIi1jb2xvcj48L3BhdGg+XG4gICAgPHBhdGggZD1cIk01NTcuOCwyODguMnYxMzguNGwyMzAuOC0yMTMuNEw1NTcuOCwwdjE0Mi44Yy0zMDkuMiwxNS42LTc5Mi4xLDI1My42LTQyNi41LDUwMy44QzEzLjYsNTI3LjksMzAsMzMwLjEsNTU3LjgsMjg4LjJ6XCIgY2xhc3M9XCJpbWFnZS1ncmlkX19kb3VibGUtYnRuLXN2Zy1jb2xvclwiPjwvcGF0aD5cbiAgICA8L3N2Zz5cbiAgYDtcblxuICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4gZmxpcENhcmQoZSkpO1xuXG4gIHJldHVybiBidG47XG59O1xuXG5jb25zdCBnZW5lcmF0ZURvdWJsZVNpZGVkQ2FyZCA9IChjYXJkKSA9PiB7XG4gIGNvbnN0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gIGNvbnN0IG91dGVyRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGNvbnN0IGlubmVyRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGNvbnN0IGltZ0Zyb250U2lkZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuICBjb25zdCBpbWdCYWNrU2lkZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuICBjb25zdCBmbGlwQ2FyZEJ0biA9IGdlbmVyYXRlRmxpcENhcmRCdG4oKTtcblxuICBhLmNsYXNzTGlzdCA9IGBpbWFnZS1ncmlkX19saW5rIGpzLS1pbWFnZS1ncmlkLWxpbmtgO1xuICBhLmhyZWYgPSBgL2NhcmQvJHtjYXJkLnNldH0vJHtwYXJzZUNhcmROYW1lKGNhcmQubmFtZSl9YDtcblxuICBvdXRlckRpdi5jbGFzc0xpc3QgPSBgaW1hZ2UtZ3JpZF9fb3V0ZXItZGl2YDtcbiAgaW5uZXJEaXYuY2xhc3NMaXN0ID0gYGltYWdlLWdyaWRfX2lubmVyLWRpdiBqcy0taW5uZXItZGl2LSR7Y2FyZC5uYW1lfWA7XG5cbiAgaW1nRnJvbnRTaWRlLmNsYXNzTGlzdCA9IGBpbWFnZS1ncmlkX19kb3VibGUgaW1hZ2UtZ3JpZF9fZG91YmxlLS1mcm9udCBqcy0taW1hZ2UtZ3JpZC1jYXJkLXNpZGUtZnJvbnQganMtLXNob3dpbmdgO1xuICBpbWdGcm9udFNpZGUuc3JjID0gY2FyZC5jYXJkX2ZhY2VzWzBdLmltYWdlX3VyaXMubm9ybWFsO1xuICBpbWdGcm9udFNpZGUuYWx0ID0gY2FyZC5uYW1lO1xuXG4gIGltZ0JhY2tTaWRlLmNsYXNzTGlzdCA9IGBpbWFnZS1ncmlkX19kb3VibGUgaW1hZ2UtZ3JpZF9fZG91YmxlLS1iYWNrIGpzLS1pbWFnZS1ncmlkLWNhcmQtc2lkZS1iYWNrYDtcbiAgaW1nQmFja1NpZGUuc3JjID0gY2FyZC5jYXJkX2ZhY2VzWzFdLmltYWdlX3VyaXMubm9ybWFsO1xuICBpbWdCYWNrU2lkZS5hbHQgPSBjYXJkLmNhcmRfZmFjZXNbMV0ubmFtZTtcblxuICBhLmFwcGVuZENoaWxkKG91dGVyRGl2KTtcbiAgb3V0ZXJEaXYuYXBwZW5kQ2hpbGQoaW5uZXJEaXYpO1xuICBpbm5lckRpdi5hcHBlbmRDaGlsZChpbWdCYWNrU2lkZSk7XG4gIGlubmVyRGl2LmFwcGVuZENoaWxkKGltZ0Zyb250U2lkZSk7XG4gIGlubmVyRGl2LmFwcGVuZENoaWxkKGZsaXBDYXJkQnRuKTtcblxuICBkb2N1bWVudFxuICAgIC5xdWVyeVNlbGVjdG9yKCcuanMtLWltYWdlLWdyaWQnKVxuICAgIC5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2JlZm9yZWVuZCcsIGEpO1xufTtcblxuY29uc3QgZ2VuZXJhdGVJbWFnZUdyaWQgPSAoY2FyZHMpID0+IHtcbiAgY2FyZHMuZm9yRWFjaCgoY2FyZCkgPT4ge1xuICAgIC8vIEZvciBzaW5nbGUgc2lkZWQgY2FyZHNcbiAgICBpZiAoY2FyZC5pbWFnZV91cmlzKSBnZW5lcmF0ZVNpbmdsZVNpZGVkQ2FyZChjYXJkKTtcbiAgICAvLyBEb3VibGUgc2lkZWQgY2FyZHNcbiAgICBlbHNlIGdlbmVyYXRlRG91YmxlU2lkZWRDYXJkKGNhcmQpO1xuICB9KTtcbn07XG5cbi8vIEZ1bmNpdG9uIHRvIGJlIHVzZWQgaW4gaW5kZXguanMuIFRha2VzIGNhcmUgb2YgYWxsIG5lY2Vzc2FyeSBzdGVwcyB0byBkaXNwbGF5IGNhcmRzIGFzIGEgaW1hZ2VzXG5leHBvcnQgY29uc3QgZGlzcGFseUltYWdlcyA9IChjYXJkcykgPT4ge1xuICBjbGVhclJlc3VsdHMoKTtcbiAgcHJlcEltYWdlQ29udGFpbmVyKCk7XG4gIGdlbmVyYXRlSW1hZ2VHcmlkKGNhcmRzKTtcbn07XG5cbmNvbnN0IHByZXBDaGVja2xpc3RDb250YWluZXIgPSAoKSA9PiB7XG4gIGNvbnN0IG1hcmt1cCA9IGBcbiAgICAgICAgPGRpdiBjbGFzcz1cIndyYXBwZXJcIj48dGFibGUgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdCBqcy0tY2FyZC1jaGVja2xpc3RcIj5cbiAgICAgICAgICAgIDx0aGVhZCBjbGFzcz1cImpzLS1jYXJkLWNoZWNrbGlzdC1oZWFkZXJcIj5cbiAgICAgICAgICAgICAgICA8dHIgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fcm93IGNhcmQtY2hlY2tsaXN0X19yb3ctLTcgY2FyZC1jaGVja2xpc3RfX3Jvdy0taGVhZGVyXCI+XG4gICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhIHJlc3BvbnNpdmUtLXNldFwiPlNldDwvdGg+XG4gICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhIHJlc3BvbnNpdmUtLW5hbWVcIj5OYW1lPC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGEgcmVzcG9uc2l2ZS0tY29zdFwiPkNvc3Q8L3RoPlxuICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YSByZXNwb25zaXZlLS10eXBlXCI+VHlwZTwvdGg+XG4gICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhIHJlc3BvbnNpdmUtLXJhcml0eVwiPlJhcml0eTwvdGg+XG4gICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhIHJlc3BvbnNpdmUtLWFydGlzdFwiPkFydGlzdDwvdGg+XG4gICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhIHJlc3BvbnNpdmUtLXByaWNlXCI+UHJpY2U8L3RoPlxuICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICA8L3RoZWFkPlxuICAgICAgICAgICAgPHRib2R5IGNsYXNzPVwianMtLWNhcmQtY2hlY2tsaXN0LWJvZHkgY2FyZC1jaGVja2xpc3QtYm9keVwiPjwvdGJvZHk+XG4gICAgICAgIDwvdGFibGU+PC9kaXY+XG4gICAgICAgIGA7XG4gIGVsZW1lbnRzLnJlc3VsdHNQYWdlLnJlc3VsdHNDb250YWluZXIuaW5zZXJ0QWRqYWNlbnRIVE1MKCdiZWZvcmVlbmQnLCBtYXJrdXApO1xufTtcblxuZXhwb3J0IGNvbnN0IGdlbmVyYXRlTWFuYUNvc3RJbWFnZXMgPSAobWFuYUNvc3QsIHNpemUgPSAnc21hbGwnKSA9PiB7XG4gIC8vIElmIHRoZXJlIGlzIG5vIG1hbmEgY29zdCBhc3NvY2lhdGVkIHdpdGggdGhlIGNhcmQsIHRoZW4gcmV0dXJuIGFuIGVtcHR5IHN0cmluZyB0byBsZWF2ZSB0aGUgcm93IGVtcHR5XG4gIGlmICghbWFuYUNvc3QpIHJldHVybiAnJztcblxuICAvLyBSZWd1bGFyIGV4cHJlc3Npb25zIHRvIGZpbmQgZWFjaCBzZXQgb2YgY3VybHkgYnJhY2VzIHt9XG4gIGxldCByZSA9IC9cXHsoLio/KVxcfS9nO1xuXG4gIC8vIFBhcnNlIHRoZSBzdHJpbmdzIGFuZCBnZXQgYWxsIG1hdGNoZXNcbiAgbGV0IG1hdGNoZXMgPSBtYW5hQ29zdC5tYXRjaChyZSk7XG5cbiAgLy8gSWYgdGhlcmUgYXJlIGFueSBtYXRjaGVzLCBsb29wIHRocm91Z2ggYW5kIHJlcGxhY2UgZWFjaCBzZXQgb2YgY3VybHkgYnJhY2VzIHdpdGggdGhlXG4gIC8vIGh0bWwgc3BhbiB0aGF0IGNvcnJlc3BvbnMgdG8gbWFuYS5jc3MgdG8gcmVuZGVyIHRoZSBjb3JyZWN0IGltYWdlXG4gIGlmIChtYXRjaGVzKSB7XG4gICAgbWF0Y2hlcy5mb3JFYWNoKChtKSA9PiB7XG4gICAgICBjb25zdCByZWdleCA9IG5ldyBSZWdFeHAoYFxceygke20uc2xpY2UoMSwgLTEpfSlcXH1gLCAnZycpO1xuICAgICAgLy8gVGhpcyB3aWxsIGJlIHRoZSBzdHJpbmcgdXNlZCB0byBnZXQgdGhlIHJpZ2h0IGNsYXNzIGZyb20gbWFuYS5jc3NcbiAgICAgIC8vIFdlIHdhbnQgdG8gdGFrZSBldmVyeXRoaW5nIGluc2lkZSB0aGUgYnJhY2tldHMsIGFuZCBpZiB0aGVyZSBpcyBhIC9cbiAgICAgIC8vIHJlbW92ZSBpdC5cbiAgICAgIGNvbnN0IG1hbmFJY29uU3RyID0gbS5zbGljZSgxLCAtMSkudG9Mb3dlckNhc2UoKS5yZXBsYWNlKCcvJywgJycpO1xuICAgICAgbWFuYUNvc3QgPSBtYW5hQ29zdC5yZXBsYWNlKFxuICAgICAgICByZWdleCxcbiAgICAgICAgYDxzcGFuIGNsYXNzPVwibWFuYSAke3NpemV9IHMke21hbmFJY29uU3RyfVwiPjwvc3Bhbj5gXG4gICAgICApO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIG1hbmFDb3N0O1xufTtcblxuY29uc3Qgc2hvcnRlblR5cGVMaW5lID0gKHR5cGUpID0+IHtcbiAgLy8gSWYgbm8gdHlwZSBpcyBnaXZlbiwgcmV0dXJuIGFuIGVtcHR5IHN0cmluZ1xuICBpZiAoIXR5cGUpIHJldHVybiAnJztcblxuICAvLyBpZiB0aGUg4oCUIGRlbGltaXRlciBpcyBmb3VuZCBpbiB0aGUgc3RyaW5nLCByZXR1cm4gZXZlcnl0aGluZyBiZWZvcmUgdGhlIGRlbGltaXRlclxuICBpZiAodHlwZS5pbmRleE9mKCfigJQnKSAhPT0gLTEpIHJldHVybiB0eXBlLnN1YnN0cmluZygwLCB0eXBlLmluZGV4T2YoJ+KAlCcpIC0gMSk7XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gZGVsaW1pdGVyLCByZXR1cm4gdGhlIHR5cGUgYXMgZ2l2ZW4gaW4gdGhlIGNhcmQgb2JqZWN0XG4gIHJldHVybiB0eXBlO1xufTtcblxuY29uc3QgcGFyc2VDYXJkTmFtZSA9IChjYXJkTmFtZSkgPT4ge1xuICBpZiAoY2FyZE5hbWUuaW5kZXhPZignLycpICE9PSAtMSkge1xuICAgIHJldHVybiBjYXJkTmFtZS5zbGljZSgwLCBjYXJkTmFtZS5pbmRleE9mKCcvJykgLSAxKS5yZXBsYWNlQWxsKCcgJywgJy0nKTtcbiAgfVxuXG4gIHJldHVybiBjYXJkTmFtZS5yZXBsYWNlQWxsKCcgJywgJy0nKTtcbn07XG5cbmNvbnN0IGdlbmVyYXRlQ2hlY2tsaXN0ID0gKGNhcmRzKSA9PiB7XG4gIGNvbnNvbGUubG9nKGNhcmRzKTtcbiAgLy8gQ3JlYXRlIGEgbmV3IHRhYmxlIHJvdyBmb3IgZWFjaCBjYXJkIG9iamVjdFxuICBjYXJkcy5mb3JFYWNoKChjYXJkKSA9PiB7XG4gICAgY29uc3QgY2FyZE5hbWVGb3JVcmwgPSBwYXJzZUNhcmROYW1lKGNhcmQubmFtZSk7XG5cbiAgICBjb25zdCBtYXJrdXAgPSBgXG4gICAgICAgICAgICA8dHIgY2xhc3M9XCJqcy0tY2hlY2tsaXN0LXJvdyBjYXJkLWNoZWNrbGlzdF9fcm93ICR7XG4gICAgICAgICAgICAgIGNhcmRzLmxlbmd0aCA8IDMwID8gJ2NhcmQtY2hlY2tsaXN0X19yb3ctLWJvZHknIDogJydcbiAgICAgICAgICAgIH0gY2FyZC1jaGVja2xpc3RfX3Jvdy0tNyBkYXRhLWNvbXBvbmVudD1cImNhcmQtdG9vbHRpcFwiIGRhdGEtY2FyZC1pbWc9JHtjaGVja0ZvckltZyhcbiAgICAgIGNhcmRcbiAgICApfT5cbiAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YSBjYXJkLWNoZWNrbGlzdF9fZGF0YS0tc2V0IHJlc3BvbnNpdmUtLXNldFwiPjxhIGhyZWY9XCIvY2FyZC8ke1xuICAgICAgICAgICAgICAgICAgY2FyZC5zZXRcbiAgICAgICAgICAgICAgICB9LyR7Y2FyZE5hbWVGb3JVcmx9XCIgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YS1saW5rXCI+JHtcbiAgICAgIGNhcmQuc2V0XG4gICAgfTwvYT48L3RkPlxuICAgICAgICAgICAgICAgIDx0ZCBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhIGNhcmQtY2hlY2tsaXN0X19kYXRhLS1uYW1lIHJlc3BvbnNpdmUtLW5hbWVcIj48YSBocmVmPVwiL2NhcmQvJHtcbiAgICAgICAgICAgICAgICAgIGNhcmQuc2V0XG4gICAgICAgICAgICAgICAgfS8ke2NhcmROYW1lRm9yVXJsfVwiIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGEtbGlua1wiPiR7XG4gICAgICBjYXJkLm5hbWVcbiAgICB9PC9hPjwvdGQ+XG4gICAgICAgICAgICAgICAgPHRkIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGEgcmVzcG9uc2l2ZS0tY29zdFwiPjxhIGhyZWY9XCIvY2FyZC8ke1xuICAgICAgICAgICAgICAgICAgY2FyZC5zZXRcbiAgICAgICAgICAgICAgICB9LyR7Y2FyZE5hbWVGb3JVcmx9XCIgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YS1saW5rXCI+JHtnZW5lcmF0ZU1hbmFDb3N0SW1hZ2VzKFxuICAgICAgY2hlY2tGb3JNYW5hQ29zdChjYXJkKVxuICAgICl9PC9hPjwvdGQ+XG4gICAgICAgICAgICAgICAgPHRkIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGEgcmVzcG9uc2l2ZS0tdHlwZVwiPjxhIGhyZWY9XCIvY2FyZC8ke1xuICAgICAgICAgICAgICAgICAgY2FyZC5zZXRcbiAgICAgICAgICAgICAgICB9LyR7Y2FyZE5hbWVGb3JVcmx9XCIgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YS1saW5rXCI+JHtzaG9ydGVuVHlwZUxpbmUoXG4gICAgICBjYXJkLnR5cGVfbGluZVxuICAgICl9PC9hPjwvdGQ+XG4gICAgICAgICAgICAgICAgPHRkIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGEgY2FyZC1jaGVja2xpc3RfX2RhdGEtLXJhcml0eSByZXNwb25zaXZlLS1yYXJpdHlcIj48YSBocmVmPVwiL2NhcmQvJHtcbiAgICAgICAgICAgICAgICAgIGNhcmQuc2V0XG4gICAgICAgICAgICAgICAgfS8ke2NhcmROYW1lRm9yVXJsfVwiIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGEtbGlua1wiPiR7XG4gICAgICBjYXJkLnJhcml0eVxuICAgIH08L2E+PC90ZD5cbiAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YSByZXNwb25zaXZlLS1hcnRpc3RcIj48YSBocmVmPVwiL2NhcmQvJHtcbiAgICAgICAgICAgICAgICAgIGNhcmQuc2V0XG4gICAgICAgICAgICAgICAgfS8ke2NhcmROYW1lRm9yVXJsfVwiIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGEtbGlua1wiPiR7XG4gICAgICBjYXJkLmFydGlzdFxuICAgIH08L2E+PC90ZD5cbiAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YSBjYXJkLWNoZWNrbGlzdF9fZGF0YS0tcHJpY2UgcmVzcG9uc2l2ZS0tcHJpY2VcIj48YSBocmVmPVwiL2NhcmQvJHtcbiAgICAgICAgICAgICAgICAgIGNhcmQuc2V0XG4gICAgICAgICAgICAgICAgfS8ke2NhcmROYW1lRm9yVXJsfVwiIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGEtbGluayBjYXJkLWNoZWNrbGlzdF9fZGF0YS1saW5rLS1wcmljZSBqcy0tcHJpY2UgY2FyZC1jaGVja2xpc3RfX2RhdGEtbGluay0tY2VudGVyXCI+JCAke1xuICAgICAgY2FyZC5wcmljZXMudXNkIHx8ICctJ1xuICAgIH08L2E+PC90ZD5cbiAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICBgO1xuICAgIC8vIFB1dCB0aGUgcm93IGluIHRoZSB0YWJsZVxuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcignLmpzLS1jYXJkLWNoZWNrbGlzdC1ib2R5JylcbiAgICAgIC5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWVuZCcsIG1hcmt1cCk7XG4gIH0pO1xufTtcblxuY29uc3QgY2hlY2tGb3JNaXNzaW5nUHJpY2UgPSAoKSA9PiB7XG4gIGNvbnN0IHByaWNlcyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1wcmljZScpKTtcblxuICBwcmljZXMuZm9yRWFjaCgocHJpY2UpID0+IHtcbiAgICBpZiAocHJpY2UuaW5uZXJUZXh0LmluY2x1ZGVzKCctJykpIHByaWNlLmlubmVyVGV4dCA9ICcnO1xuICB9KTtcbn07XG5cbmNvbnN0IGNoZWNrRm9yTWFuYUNvc3QgPSAoY2FyZCkgPT4ge1xuICBpZiAoY2FyZC5tYW5hX2Nvc3QpIHtcbiAgICByZXR1cm4gY2FyZC5tYW5hX2Nvc3Q7XG4gIH0gZWxzZSBpZiAoY2FyZC5jYXJkX2ZhY2VzKSB7XG4gICAgcmV0dXJuIGNhcmQuY2FyZF9mYWNlc1swXS5tYW5hX2Nvc3Q7XG4gIH1cbn07XG5cbmNvbnN0IGNoZWNrRm9ySW1nID0gKGNhcmQpID0+IHtcbiAgaWYgKGNhcmQuaW1hZ2VfdXJpcykgcmV0dXJuIGNhcmQuaW1hZ2VfdXJpcy5ub3JtYWw7XG4gIC8vIElmIHRoZXJlIGlzIG5vIGNhcmQuaW1hZ2VfdXJpcywgdGhlbiBpdCdzIGEgZG91YmxlIHNpZGVkIGNhcmQuIEluIHRoaXNcbiAgLy8gY2FzZSB3ZSB3YW50IHRvIGRpc3BsYXkgdGhlIGltYWdlIGZyb20gZmFjZSBvbmUgb2YgdGhlIGNhcmQuXG4gIGVsc2UgcmV0dXJuIGNhcmQuY2FyZF9mYWNlc1swXS5pbWFnZV91cmlzLm5vcm1hbDtcbn07XG5cbi8vIENyZWF0ZSB0aGUgaG92ZXIgZWZmZWN0IG9uIGVhY2ggcm93IHRoYXQgZGlzcGxheXMgdGhlIGltYWdlIG9mIHRoZSBjYXJkXG5leHBvcnQgY29uc3QgY2hlY2tMaXN0SG92ZXJFdmVudHMgPSAoKSA9PiB7XG4gIC8vIEdldCB0aGUgSFRNTCBmb3IgZWFjaCB0YWJsZSByb3dcbiAgY29uc3Qgcm93cyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1jaGVja2xpc3Qtcm93JykpO1xuXG4gIHJvd3MuZm9yRWFjaCgocm93KSA9PiB7XG4gICAgcm93Lm9ubW91c2Vtb3ZlID0gKGUpID0+IHtcbiAgICAgIC8vIElmIHRoZSB3aW5kb3cgaXMgc21hbGxlciB0aGFuIDc2OCBwaXhlbHMsIGRvbid0IGRpc3BsYXkgYW55IGltYWdlc1xuICAgICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoIDwgNzY4KSByZXR1cm4gZmFsc2U7XG5cbiAgICAgIC8vIElmIHRoZXJlIGlzIGFscmVhZHkgYW4gaW1hZ2UgYmVpbmcgZGlzcGxheWVkLCByZW1vdmUgaXQgZnJvbSB0aGUgRE9NXG4gICAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRvb2x0aXAnKSkge1xuICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50b29sdGlwJykpO1xuICAgICAgfVxuXG4gICAgICAvLyBQcmVwIHRoZSBkaXYuXG4gICAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGRpdi5jbGFzc05hbWUgPSAndG9vbHRpcCc7XG5cbiAgICAgIC8vIFRoZSBkaXYgaXMgc3R5bGVkIHdpdGggcG9zaXRpb24gYWJzb2x1dGUuIFRoaXMgY29kZSBwdXRzIGl0IGp1c3QgdG8gdGhlIHJpZ2h0IG9mIHRoZSBjdXJzb3JcbiAgICAgIGRpdi5zdHlsZS5sZWZ0ID0gZS5wYWdlWCArIDUwICsgJ3B4JztcbiAgICAgIGRpdi5zdHlsZS50b3AgPSBlLnBhZ2VZIC0gMzAgKyAncHgnO1xuXG4gICAgICAvLyBQcmVwIHRoZSBpbWcgZWxlbWVudFxuICAgICAgY29uc3QgaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG4gICAgICBpbWcuY2xhc3NOYW1lID0gJ3Rvb2x0aXBfX2ltZyc7XG4gICAgICBpbWcuc3JjID0gcm93LmRhdGFzZXQuY2FyZEltZztcblxuICAgICAgLy8gUHV0IHRoZSBpbWcgaW50byB0aGUgZGl2IGFuZCB0aGVuIGFwcGVuZCB0aGUgZGl2IGRpcmVjdGx5IHRvIHRoZSBib2R5IG9mIHRoZSBkb2N1bWVudC5cbiAgICAgIGRpdi5hcHBlbmRDaGlsZChpbWcpO1xuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkaXYpO1xuICAgIH07XG5cbiAgICAvLyBSZW1vdmUgdGhlIGltZyB3aGVuIHRha2luZyB0aGUgY3Vyc29yIG9mZiB0aGUgcm93XG4gICAgcm93Lm9ubW91c2VvdXQgPSAoZSkgPT4ge1xuICAgICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50b29sdGlwJykpIHtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudG9vbHRpcCcpKTtcbiAgICAgIH1cbiAgICB9O1xuICB9KTtcbn07XG5cbmNvbnN0IGNoYW5nZUhlYWRlckZvclNtYWxsQ2hlY2tsaXN0ID0gKGNhcmRzKSA9PiB7XG4gIGlmIChjYXJkcy5sZW5ndGggPCAzMClcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tY2FyZC1jaGVja2xpc3QtaGVhZGVyJylcbiAgICAgIC5jbGFzc0xpc3QuYWRkKCdjYXJkLWNoZWNrbGlzdC1oZWFkZXInKTtcbn07XG5cbi8vIEZ1bmNpdG9uIHRvIGJlIHVzZWQgaW4gaW5kZXguanMuIFRha2VzIGNhcmUgb2YgYWxsIG5lY2Vzc2FyeSBzdGVwcyB0byBkaXNwbGF5IGNhcmRzIGFzIGEgY2hlY2tsaXN0XG5leHBvcnQgY29uc3QgZGlzcGxheUNoZWNrbGlzdCA9IChjYXJkcykgPT4ge1xuICBjbGVhclJlc3VsdHMoKTtcbiAgcHJlcENoZWNrbGlzdENvbnRhaW5lcigpO1xuICBjaGFuZ2VIZWFkZXJGb3JTbWFsbENoZWNrbGlzdChjYXJkcyk7XG4gIGdlbmVyYXRlQ2hlY2tsaXN0KGNhcmRzKTtcbiAgY2hlY2tGb3JNaXNzaW5nUHJpY2UoKTtcbiAgY2hlY2tMaXN0SG92ZXJFdmVudHMoKTtcbn07XG5cbmV4cG9ydCBjb25zdCBjaG9zZVNlbGVjdE1lbnVTb3J0ID0gKG1lbnUsIHN0YXRlKSA9PiB7XG4gIC8vIENyZWF0ZSBhbiBhcnJheSBmcm9tIHRoZSBIVE1MIHNlbGVjdCBtZW51XG4gIGNvbnN0IG9wdGlvbnMgPSBBcnJheS5mcm9tKG1lbnUpO1xuXG4gIG9wdGlvbnMuZm9yRWFjaCgob3B0aW9uLCBpKSA9PiB7XG4gICAgLy8gSWYgdGhlIG9wdGlvbiB2YWx1ZSBtYXRjaGVzIHRoZSBzb3J0IG1ldGhvZCBmcm9tIHRoZSBVUkwsIHNldCBpdCB0byB0aGUgc2VsZWN0ZWQgaXRlbVxuICAgIGlmIChvcHRpb24udmFsdWUgPT09IHN0YXRlLnNvcnRNZXRob2QpIG1lbnUuc2VsZWN0ZWRJbmRleCA9IGk7XG4gIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IGNob3NlU2VsZWN0TWVudURpc3BsYXkgPSAobWVudSwgc3RhdGUpID0+IHtcbiAgLy8gQ3JlYXRlIGFuIGFycmF5IGZyb20gdGhlIEhUTUwgc2VsZWN0IG1lbnVcbiAgY29uc3Qgb3B0aW9ucyA9IEFycmF5LmZyb20obWVudSk7XG5cbiAgb3B0aW9ucy5mb3JFYWNoKChvcHRpb24sIGkpID0+IHtcbiAgICAvLyBJZiB0aGUgb3B0aW9uIHZhbHVlIG1hdGNoZXMgdGhlIHNvcnQgbWV0aG9kIGZyb20gdGhlIFVSTCwgc2V0IGl0IHRvIHRoZSBzZWxlY3RlZCBpdGVtXG4gICAgaWYgKG9wdGlvbi52YWx1ZSA9PT0gc3RhdGUuZGlzcGxheSkgbWVudS5zZWxlY3RlZEluZGV4ID0gaTtcbiAgfSk7XG59O1xuXG4vLyBGdW5jdGlvbiB0byBjaGFuZ2UgdGhlIHNvcnQgbWV0aG9kIGJhc2VkIG9uIHRoZSBpbnB1dCBmcm9tIHRoZSB1c2VyXG5leHBvcnQgY29uc3QgY2hhbmdlU29ydE1ldGhvZCA9IChzdGF0ZSkgPT4ge1xuICAvLyBHZXQgdGhlIGN1cnJlbnQgc29ydCBtZXRob2QgZnJvbSB0aGUgZW5kIG9mIHRoZSBVUkxcbiAgY29uc3QgY3VycmVudFNvcnRNZXRob2QgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3Vic3RyaW5nKFxuICAgIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5sYXN0SW5kZXhPZignPScpICsgMVxuICApO1xuXG4gIC8vIEdyYWIgdGhlIGRlc2lyZWQgc29ydCBtZXRob2QgZnJvbSB0aGUgdXNlclxuICBjb25zdCBuZXdTb3J0TWV0aG9kID0gZWxlbWVudHMucmVzdWx0c1BhZ2Uuc29ydEJ5KCkudmFsdWU7XG5cbiAgLy8gSWYgdGhlIG5ldyBzb3J0IG1ldGhvZCBpcyBub3QgZGlmZmVyZW50LCBleGl0IHRoZSBmdW5jdGlvbiBhcyB0byBub3QgcHVzaCBhIG5ldyBzdGF0ZVxuICBpZiAoY3VycmVudFNvcnRNZXRob2QgPT09IG5ld1NvcnRNZXRob2QpIHtcbiAgICByZXR1cm47XG4gIH0gZWxzZSB7XG4gICAgLy8gRGlzYWJsZSBhbGwgZm91ciBidXR0b25zXG4gICAgLy8gT25seSBkb2luZyB0aGlzIGJlY2F1c2UgZmlyZWZveCByZXF1aXJlcyBhIGN0cmwgZjVcbiAgICBkaXNhYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLmZpcnN0UGFnZUJ0bik7XG4gICAgZGlzYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5uZXh0UGFnZUJ0bigpKTtcbiAgICBkaXNhYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLnByZXZpb3VzUGFnZUJ0bigpKTtcbiAgICBkaXNhYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLmxhc3RQYWdlQnRuKTtcblxuICAgIGNvbnN0IGN1cnJlbnRQYXRoTmFtZSA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zdWJzdHJpbmcoXG4gICAgICAwLFxuICAgICAgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLmxhc3RJbmRleE9mKCc9JykgKyAxXG4gICAgKTtcblxuICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gY3VycmVudFBhdGhOYW1lICsgbmV3U29ydE1ldGhvZDtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGNoYW5nZURpc3BsYXlBbmRVcmwgPSAoc3RhdGUpID0+IHtcbiAgY29uc3QgY3VycmVudE1ldGhvZCA9IHN0YXRlLmRpc3BsYXk7XG4gIGNvbnN0IG5ld01ldGhvZCA9IGVsZW1lbnRzLnJlc3VsdHNQYWdlLmRpc3BsYXlTZWxlY3RvcigpLnZhbHVlO1xuXG4gIGlmIChuZXdNZXRob2QgPT09IGN1cnJlbnRNZXRob2QpIHJldHVybjtcblxuICAvLyBVcGRhdGUgdGhlIHN0YXRlIHdpdGggbmV3IGRpc3BsYXkgbWV0aG9kXG4gIHN0YXRlLmRpc3BsYXkgPSBuZXdNZXRob2Q7XG5cbiAgLy8gVXBkYXRlIHRoZSB1cmwgd2l0aG91dCBwdXNoaW5nIHRvIHRoZSBzZXJ2ZXJcbiAgY29uc3QgdGl0bGUgPSBkb2N1bWVudC50aXRsZTtcbiAgY29uc3QgcGF0aE5hbWUgPSBgL3Jlc3VsdHMvJHtuZXdNZXRob2R9LyR7c3RhdGUucXVlcnl9YDtcbiAgaGlzdG9yeS5wdXNoU3RhdGUoXG4gICAge1xuICAgICAgY3VycmVudEluZGV4OiBzdGF0ZS5jdXJyZW50SW5kZXgsXG4gICAgICBkaXNwbGF5OiBzdGF0ZS5kaXNwbGF5LFxuICAgIH0sXG4gICAgdGl0bGUsXG4gICAgcGF0aE5hbWVcbiAgKTtcbn07XG5cbmV4cG9ydCBjb25zdCB1cGRhdGVEaXNwbGF5ID0gKHN0YXRlKSA9PiB7XG4gIC8vIENsZWFyIGFueSBleGlzdGluZyBIVE1MIGluIHRoZSBkaXNwbGF5XG4gIGNsZWFyUmVzdWx0cygpO1xuXG4gIC8vIFJlZnJlc2ggdGhlIGRpc3BsYXlcbiAgaWYgKHN0YXRlLmRpc3BsYXkgPT09ICdsaXN0JylcbiAgICBkaXNwbGF5Q2hlY2tsaXN0KHN0YXRlLmFsbENhcmRzW3N0YXRlLmN1cnJlbnRJbmRleF0pO1xuICBpZiAoc3RhdGUuZGlzcGxheSA9PT0gJ2ltYWdlcycpXG4gICAgZGlzcGFseUltYWdlcyhzdGF0ZS5hbGxDYXJkc1tzdGF0ZS5jdXJyZW50SW5kZXhdKTtcbn07XG5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKioqKioqIFBBR0lOQVRJT04gKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcblxuLy8gV2lsbCBiZSBjYWxsZWQgZHVyaW5nIGNoYW5naW5nIHBhZ2VzLiBSZW1vdmVzIHRoZSBjdXJyZW50IGVsZW1lbnQgaW4gdGhlIGJhclxuY29uc3QgY2xlYXJEaXNwbGF5QmFyID0gKCkgPT4ge1xuICBjb25zdCBkaXNwbGF5QmFyVGV4dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tZGlzcGxheS1iYXItdGV4dCcpO1xuICBpZiAoZGlzcGxheUJhclRleHQpIGRpc3BsYXlCYXJUZXh0LnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQoZGlzcGxheUJhclRleHQpO1xufTtcblxuLy8gS2VlcHMgdHJhY2sgb2Ygd2hlcmUgdGhlIHVzZXIgaXMgaW4gdGhlcmUgbGlzdCBvZiBjYXJkc1xuY29uc3QgcGFnaW5hdGlvblRyYWNrZXIgPSAoc3RhdGUpID0+IHtcbiAgdmFyIGJlZywgZW5kO1xuICBiZWcgPSAoc3RhdGUuY3VycmVudEluZGV4ICsgMSkgKiAxNzUgLSAxNzQ7XG4gIGVuZCA9IHN0YXRlLmN1cnJlbnRJbmRleCAqIDE3NSArIHN0YXRlLmFsbENhcmRzW3N0YXRlLmN1cnJlbnRJbmRleF0ubGVuZ3RoO1xuXG4gIHJldHVybiB7IGJlZywgZW5kIH07XG59O1xuXG5leHBvcnQgY29uc3QgdXBkYXRlRGlzcGxheUJhciA9IChzdGF0ZSkgPT4ge1xuICBjb25zdCBtYXJrdXAgPSBgXG4gICAgICAgIDxwIGNsYXNzPVwiYXBpLXJlc3VsdHMtZGlzcGxheV9fZGlzcGxheS1iYXItdGV4dCBqcy0tZGlzcGxheS1iYXItdGV4dFwiPlxuICAgICAgICAgICAgRGlzcGxheWluZyAke3BhZ2luYXRpb25UcmFja2VyKHN0YXRlKS5iZWd9IC0gJHtcbiAgICBwYWdpbmF0aW9uVHJhY2tlcihzdGF0ZSkuZW5kXG4gIH0gb2YgJHtzdGF0ZS5zZWFyY2gucmVzdWx0cy50b3RhbF9jYXJkc30gY2FyZHNcbiAgICAgICAgPC9wPlxuICAgIGA7XG5cbiAgY2xlYXJEaXNwbGF5QmFyKCk7XG4gIGVsZW1lbnRzLnJlc3VsdHNQYWdlLmRpc3BsYXlCYXIuaW5zZXJ0QWRqYWNlbnRIVE1MKCdiZWZvcmVlbmQnLCBtYXJrdXApO1xufTtcblxuZXhwb3J0IGNvbnN0IGVuYWJsZUJ0biA9IChidG4pID0+IHtcbiAgaWYgKGJ0bi5kaXNhYmxlZCkge1xuICAgIGJ0bi5jbGFzc0xpc3QucmVtb3ZlKFxuICAgICAgJ2FwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1wYWdpbmF0aW9uLWNvbnRhaW5lci0tZGlzYWJsZWQnXG4gICAgKTtcbiAgICBidG4uZGlzYWJsZWQgPSBmYWxzZTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGRpc2FibGVCdG4gPSAoYnRuKSA9PiB7XG4gIGlmICghYnRuLmRpc2FibGVkKSB7XG4gICAgYnRuLmNsYXNzTGlzdC5hZGQoXG4gICAgICAnYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXBhZ2luYXRpb24tY29udGFpbmVyLS1kaXNhYmxlZCdcbiAgICApO1xuICAgIGJ0bi5kaXNhYmxlZCA9IHRydWU7XG4gIH1cbn07XG5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKioqKioqKioqKioqIDQwNCAqKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcblxuZXhwb3J0IGNvbnN0IGRpc3BsYXk0MDQgPSAoKSA9PiB7XG4gIGNvbnN0IGRpdiA9IGNyZWF0ZTQwNE1lc3NhZ2UoKTtcbiAgZWxlbWVudHMucmVzdWx0c1BhZ2UucmVzdWx0c0NvbnRhaW5lci5hcHBlbmRDaGlsZChkaXYpO1xufTtcblxuY29uc3QgY3JlYXRlNDA0RGl2ID0gKCkgPT4ge1xuICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgZGl2LmNsYXNzTGlzdCA9IGBuby1yZXN1bHRzYDtcbiAgcmV0dXJuIGRpdjtcbn07XG5cbmNvbnN0IGNyZWF0ZTQwNGgzID0gKCkgPT4ge1xuICBjb25zdCBoMyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gzJyk7XG4gIGgzLmNsYXNzTGlzdCA9IGBuby1yZXN1bHRzX19oM2A7XG4gIGgzLmlubmVySFRNTCA9IGBObyBjYXJkcyBmb3VuZGA7XG4gIHJldHVybiBoMztcbn07XG5cbmNvbnN0IGNyZWF0ZTQwNHBFbGVtZW50ID0gKCkgPT4ge1xuICBjb25zdCBwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xuICBwLmNsYXNzTGlzdCA9IGBuby1yZXN1bHRzX19wYDtcbiAgcC5pbm5lckhUTUwgPVxuICAgIFwiWW91ciBzZWFyY2ggZGlkbid0IG1hdGNoIGFueSBjYXJkcy4gR28gYmFjayB0byB0aGUgc2VhcmNoIHBhZ2UgYW5kIGVkaXQgeW91ciBzZWFyY2hcIjtcbiAgcmV0dXJuIHA7XG59O1xuXG5jb25zdCBjcmVhdGU0MDRCdG4gPSAoKSA9PiB7XG4gIGNvbnN0IGJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgYnRuLmNsYXNzTGlzdCA9IGBidG4gbm8tcmVzdWx0c19fYnRuYDtcbiAgYnRuLmhyZWYgPSAnL3NlYXJjaCc7XG4gIGJ0bi5pbm5lckhUTUwgPSAnR28gQmFjayc7XG4gIHJldHVybiBidG47XG59O1xuXG5jb25zdCBjcmVhdGU0MDRNZXNzYWdlID0gKCkgPT4ge1xuICBjb25zdCBkaXYgPSBjcmVhdGU0MDREaXYoKTtcbiAgY29uc3QgaDMgPSBjcmVhdGU0MDRoMygpO1xuICBjb25zdCBwID0gY3JlYXRlNDA0cEVsZW1lbnQoKTtcbiAgY29uc3QgYnRuID0gY3JlYXRlNDA0QnRuKCk7XG5cbiAgZGl2LmFwcGVuZENoaWxkKGgzKTtcbiAgZGl2LmFwcGVuZENoaWxkKHApO1xuICBkaXYuYXBwZW5kQ2hpbGQoYnRuKTtcblxuICByZXR1cm4gZGl2O1xufTtcbiIsImltcG9ydCB7IGVsZW1lbnRzIH0gZnJvbSAnLi9iYXNlJztcblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqIFRZUEUgTElORSAqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuXG5leHBvcnQgY29uc3Qgc2hvd1R5cGVzRHJvcERvd24gPSAoKSA9PiB7XG4gIGlmIChlbGVtZW50cy5hcGlTZWFyY2gudHlwZURyb3BEb3duLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIHtcbiAgICBlbGVtZW50cy5hcGlTZWFyY2gudHlwZURyb3BEb3duLnJlbW92ZUF0dHJpYnV0ZSgnaGlkZGVuJyk7XG4gICAgZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVEcm9wRG93bi5zY3JvbGxUb3AgPSAwO1xuICAgIGNvbnNvbGUubG9nKCd0eXBlcyBkcm9wZG93bicpO1xuXG4gICAgLy8gTWFrZSBzdXJlIHRvIGRpc3BsYXkgYWxsIHR5cGVzIHdoZW4gb3BlbmluZyB0aGUgZHJvcGRvd24gYW5kIGJlZm9yZSB0YWtpbmcgaW5wdXRcbiAgICBmaWx0ZXJUeXBlcygnJyk7XG4gICAgZmlsdGVyU2VsZWN0ZWRUeXBlcygpO1xuICAgIGZpbHRlclR5cGVIZWFkZXJzKCk7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBoaWRlVHlwZXNEcm9wRG93biA9ICgpID0+IHtcbiAgaWYgKCFlbGVtZW50cy5hcGlTZWFyY2gudHlwZURyb3BEb3duLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIHtcbiAgICBlbGVtZW50cy5hcGlTZWFyY2gudHlwZUxpbmUudmFsdWUgPSAnJztcbiAgICBlbGVtZW50cy5hcGlTZWFyY2gudHlwZURyb3BEb3duLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgbmF2aWdhdGVUeXBlc0Ryb3BEb3duKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGZpbHRlclR5cGVIZWFkZXJzID0gKCkgPT4ge1xuICAvLyBPbiBldmVyeSBpbnB1dCBpbnRvIHRoZSB0eXBlbGluZSBiYXIsIG1ha2UgYWxsIGhlYWRlcnMgdmlzaWJsZVxuICBjb25zdCBoZWFkZXJzID0gQXJyYXkuZnJvbShcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLXR5cGVzLWNhdGVnb3J5LWhlYWRlcicpXG4gICk7XG4gIGhlYWRlcnMuZm9yRWFjaCgoaGVhZGVyKSA9PiB7XG4gICAgaWYgKGhlYWRlci5oYXNBdHRyaWJ1dGUoJ2hpZGRlbicpKSBoZWFkZXIucmVtb3ZlQXR0cmlidXRlKCdoaWRkZW4nKTtcbiAgfSk7XG5cbiAgLy8gRm9yIGVhY2ggY2F0ZWdvcnkgb2YgdHlwZSwgaWYgdGhlcmUgYXJlIG5vdCBhbnkgdmlzaWJsZSBiZWNhdXNlIHRoZXkgd2VyZSBmaWx0ZXJlZCBvdXRcbiAgLy8gaGlkZSB0aGUgaGVhZGVyIGZvciB0aGF0IGNhdGVnb3J5XG4gIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1iYXNpYzpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWJhc2ljLWhlYWRlcicpLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgfVxuXG4gIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1zdXBlcjpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXN1cGVyLWhlYWRlcicpLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgfVxuXG4gIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcnRpZmFjdDpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXJ0aWZhY3QtaGVhZGVyJylcbiAgICAgIC5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gIH1cblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tZW5jaGFudG1lbnQ6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yKCcuanMtLWVuY2hhbnRtZW50LWhlYWRlcicpXG4gICAgICAuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWxhbmQ6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1sYW5kLWhlYWRlcicpLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgfVxuXG4gIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1zcGVsbDpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXNwZWxsLWhlYWRlcicpLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgfVxuXG4gIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1wbGFuZXN3YWxrZXI6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yKCcuanMtLXBsYW5lc3dhbGtlci1oZWFkZXInKVxuICAgICAgLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgfVxuXG4gIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1jcmVhdHVyZTpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tY3JlYXR1cmUtaGVhZGVyJylcbiAgICAgIC5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBmaWx0ZXJTZWxlY3RlZFR5cGVzID0gKCkgPT4ge1xuICBjb25zdCB0eXBlcyA9IEFycmF5LmZyb20oXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtdHlwZV1bZGF0YS1zZWxlY3RlZF0nKVxuICApO1xuXG4gIHR5cGVzLmZvckVhY2goKHR5cGUpID0+IHtcbiAgICBpZiAodHlwZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2VsZWN0ZWQnKSA9PT0gJ3RydWUnKSB7XG4gICAgICBpZiAoIXR5cGUuaGFzQXR0cmlidXRlKCdoaWRkZW4nKSkgdHlwZS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gICAgfVxuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBmaWx0ZXJUeXBlcyA9IChzdHIpID0+IHtcbiAgY29uc3QgdHlwZXMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLXR5cGVdJykpO1xuXG4gIC8vIFJlbW92ZSB0aGUgaGlkZGVuIGF0dHJpYnV0ZSBpZiBpdCBleGlzdHMgb24gYW55IGVsZW1lbnQsIGFuZCB0aGVuIGhpZGUgYW55IGVsZW1lbnRzXG4gIC8vIHRoYXQgZG9uJ3QgaW5jbHVkZSB0aGUgc3RyaW5nIGdpdmVuIGluIHRoZSBpbnB1dCBmcm9tIHRoZSB1c2VyXG4gIHR5cGVzLmZvckVhY2goKHR5cGUpID0+IHtcbiAgICBpZiAodHlwZS5oYXNBdHRyaWJ1dGUoJ2hpZGRlbicpKSB0eXBlLnJlbW92ZUF0dHJpYnV0ZSgnaGlkZGVuJyk7XG4gICAgaWYgKFxuICAgICAgIXR5cGUuZ2V0QXR0cmlidXRlKCdkYXRhLXR5cGUnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHN0ci50b0xvd2VyQ2FzZSgpKVxuICAgICkge1xuICAgICAgdHlwZS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gICAgfVxuICB9KTtcblxuICBmaWx0ZXJTZWxlY3RlZFR5cGVzKCk7XG59O1xuXG5leHBvcnQgY29uc3QgaGlnaGxpZ2h0VHlwZSA9ICh0eXBlKSA9PiB7XG4gIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWhpZ2hsaWdodGVkJykpIHJlbW92ZUN1cnJlbnRIaWdobGlnaHQoKTtcblxuICBpZiAodHlwZSkge1xuICAgIHR5cGUuY2xhc3NMaXN0LmFkZChcbiAgICAgICdqcy0taGlnaGxpZ2h0ZWQnLFxuICAgICAgJ3NlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0LW9wdGlvbi0taGlnaGxpZ2h0ZWQnXG4gICAgKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IHJlbW92ZUN1cnJlbnRIaWdobGlnaHQgPSAoKSA9PiB7XG4gIGRvY3VtZW50XG4gICAgLnF1ZXJ5U2VsZWN0b3IoJy5qcy0taGlnaGxpZ2h0ZWQnKVxuICAgIC5jbGFzc0xpc3QucmVtb3ZlKFxuICAgICAgJ2pzLS1oaWdobGlnaHRlZCcsXG4gICAgICAnc2VhcmNoLWZvcm1fX2Ryb3Bkb3duLWxpc3Qtb3B0aW9uLS1oaWdobGlnaHRlZCdcbiAgICApO1xufTtcblxuZXhwb3J0IGNvbnN0IHNldFNjcm9sbFRvcE9uRG93bkFycm93ID0gKGVsLCBkcm9wZG93bikgPT4ge1xuICBpZiAoXG4gICAgZWwub2Zmc2V0VG9wID4gZHJvcGRvd24ub2Zmc2V0SGVpZ2h0IC0gZWwub2Zmc2V0SGVpZ2h0ICYmXG4gICAgZHJvcGRvd24uc2Nyb2xsVG9wICsgZHJvcGRvd24ub2Zmc2V0SGVpZ2h0IC0gZWwub2Zmc2V0SGVpZ2h0IDwgZWwub2Zmc2V0VG9wXG4gICkge1xuICAgIGRyb3Bkb3duLnNjcm9sbFRvcCA9IGVsLm9mZnNldFRvcCAtIGRyb3Bkb3duLm9mZnNldEhlaWdodCArIGVsLm9mZnNldEhlaWdodDtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IHNldFNjcm9sbFRvcE9uVXBBcnJvdyA9IChlbCwgZHJvcGRvd24pID0+IHtcbiAgaWYgKGVsLm9mZnNldFRvcCA8IGRyb3Bkb3duLnNjcm9sbFRvcCkge1xuICAgIGRyb3Bkb3duLnNjcm9sbFRvcCA9IGVsLm9mZnNldFRvcDtcblxuICAgIC8vIDMwIGlzIHRoZSBoZWlnaHQgb2YgY2F0ZWdvcnkgaGVhZGVycy4gSWYgdGhlIGNhdGVnb3J5IGhlYWRlciBpc1xuICAgIC8vIHRoZSBvbmx5IGVsZW1lbnQgbGVmdCB0aGF0IGlzIG5vdCByZXZlYWxlZCwgc2V0IHRlaCBzY3JvbGwgdG9wIHRvIDBcbiAgICBpZiAoZHJvcGRvd24uc2Nyb2xsVG9wIDw9IDMwKSBkcm9wZG93bi5zY3JvbGxUb3AgPSAwO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgbmF2aWdhdGVUeXBlc0Ryb3BEb3duID0gKGUpID0+IHtcbiAgY29uc3QgdHlwZXMgPSBBcnJheS5mcm9tKFxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tdHlwZTpub3QoW2hpZGRlbl0pJylcbiAgKTtcbiAgY29uc3QgaSA9IHR5cGVzLmluZGV4T2YoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1oaWdobGlnaHRlZCcpKTtcblxuICBpZiAoZS5jb2RlID09PSAnQXJyb3dEb3duJyAmJiBpIDwgdHlwZXMubGVuZ3RoIC0gMSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICByZW1vdmVDdXJyZW50SGlnaGxpZ2h0KCk7XG4gICAgaGlnaGxpZ2h0VHlwZSh0eXBlc1tpICsgMV0pO1xuXG4gICAgc2V0U2Nyb2xsVG9wT25Eb3duQXJyb3codHlwZXNbaSArIDFdLCBlbGVtZW50cy5hcGlTZWFyY2gudHlwZURyb3BEb3duKTtcbiAgfVxuXG4gIGlmIChlLmNvZGUgPT09ICdBcnJvd1VwJykge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIC8vIFdlIGFsd2F5cyB3YW50IHRvIHByZXZlbnQgdGhlIGRlZmF1bHQuIFdlIG9ubHkgd2FudCB0byBjaGFuZ2UgdGhlXG4gICAgLy8gaGlnaGxpZ2h0IGlmIG5vdCBvbiB0aGUgdG9wIHR5cGUgaW4gdGhlIGRyb3Bkb3duXG4gICAgaWYgKGkgPiAwKSB7XG4gICAgICByZW1vdmVDdXJyZW50SGlnaGxpZ2h0KCk7XG4gICAgICBoaWdobGlnaHRUeXBlKHR5cGVzW2kgLSAxXSk7XG5cbiAgICAgIHNldFNjcm9sbFRvcE9uVXBBcnJvdyh0eXBlc1tpIC0gMV0sIGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlRHJvcERvd24pO1xuICAgIH1cbiAgfVxuXG4gIGlmIChlLmNvZGUgPT09ICdFbnRlcicpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB0b2dnbGVEYXRhU2VsZWN0ZWQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1oaWdobGlnaHRlZCcpKTtcbiAgICBhZGRUeXBlKFxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1oaWdobGlnaHRlZCcpLmdldEF0dHJpYnV0ZSgnZGF0YS10eXBlJylcbiAgICApO1xuICAgIGhpZGVUeXBlc0Ryb3BEb3duKCk7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBob3Zlck92ZXJUeXBlc0xpc3RlbmVyID0gKCkgPT4ge1xuICBjb25zdCB0eXBlcyA9IEFycmF5LmZyb20oXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS10eXBlOm5vdChbaGlkZGVuXSknKVxuICApO1xuXG4gIHR5cGVzLmZvckVhY2goKHR5cGUpID0+IHtcbiAgICB0eXBlLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCAoKSA9PiBoaWdobGlnaHRUeXBlKHR5cGUpKTtcbiAgfSk7XG59O1xuXG5leHBvcnQgY29uc3Qgc3RhcnRUeXBlc0Ryb3BEb3duTmF2aWdhdGlvbiA9ICgpID0+IHtcbiAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG5hdmlnYXRlVHlwZXNEcm9wRG93bik7XG4gIGNvbnN0IGZpcnN0VHlwZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tdHlwZTpub3QoW2hpZGRlbl0pJyk7XG4gIGhpZ2hsaWdodFR5cGUoZmlyc3RUeXBlKTtcbiAgaG92ZXJPdmVyVHlwZXNMaXN0ZW5lcigpO1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgbmF2aWdhdGVUeXBlc0Ryb3BEb3duKTtcbiAgZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVEcm9wRG93bi5zY3JvbGxUb3AgPSAwO1xufTtcblxuY29uc3QgcmVtb3ZlVHlwZUJ0biA9ICgpID0+IHtcbiAgLy8gU3BhbiB3aWxsIGFjdCBhcyB0aGUgYnV0dG9uIHRvIHJlbW92ZSB0eXBlcyBmcm9tIHRoZSBcInNlbGVjdGVkXCIgbGlzdFxuICBjb25zdCBidG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gIGJ0bi5jbGFzc0xpc3QgPVxuICAgICdzZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtcmVtb3ZlLWJ0biBqcy0tYXBpLXR5cGVzLWNsb3NlLWJ0bic7XG4gIGJ0bi5pbm5lckhUTUwgPSAneCc7XG5cbiAgYnRuLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgY29uc3QgdHlwZU5hbWUgPSBidG4ubmV4dEVsZW1lbnRTaWJsaW5nLm5leHRFbGVtZW50U2libGluZy5pbm5lckhUTUw7XG5cbiAgICBjb25zdCB0eXBlVG9Ub2dnbGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbZGF0YS10eXBlfD0ke3R5cGVOYW1lfV1gKTtcblxuICAgIHRvZ2dsZURhdGFTZWxlY3RlZCh0eXBlVG9Ub2dnbGUpO1xuXG4gICAgYnRuLnBhcmVudEVsZW1lbnQucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChidG4ucGFyZW50RWxlbWVudCk7XG4gIH07XG5cbiAgcmV0dXJuIGJ0bjtcbn07XG5cbmNvbnN0IHR5cGVUb2dnbGVCdG4gPSAoKSA9PiB7XG4gIC8vIFNwYW4gd2lsbCBhY3QgYXMgdGhlIGJ1dHRvbiB0byB0b2dnbGUgd2hldGhlciBvciBub3QgYSB0eXBlIGlzIGluY2x1ZGVkIG9yIGV4Y2x1ZGVkIGZyb20gdGhlIHNlYXJjaFxuICBjb25zdCBidG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gIGJ0bi5jbGFzc0xpc3QgPVxuICAgICdzZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlciBzZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlci0taXMganMtLWFwaS10eXBlcy10b2dnbGVyJztcbiAgYnRuLmlubmVySFRNTCA9ICdJUyc7XG5cbiAgLypcbiAgICAgICAgVGhpcyB3aWxsIHRvZ2dsZSBiZXR3ZWVuIHNlYXJjaGluZyBmb3IgY2FyZHMgdGhhdCBpbmNsdWRlIHRoZSBnaXZlbiB0eXBlIGFuZCBleGNsdWRlIHRoZSBnaXZlbiB0eXBlLlxuICAgICAgICBJdCB3aWxsIG1ha2Ugc3VyZSB0aGF0IHRoZSBhcHByb3ByaWF0ZSBkYXRhIHR5cGUgaXMgZ2l2ZW4gdG8gdGhlIHNwYW4gZWxlbWVudCB0aGF0IGNvbnRhaW5zIHRoZSB0eXBlXG4gICAgICAgIFNvIHRoYXQgdGhlIHNlYXJjaCBmdW5jdGlvbmFsaXR5IGNyZWF0ZXMgdGhlIGFwcHJvcHJpYXRlIHF1ZXJ5IHN0cmluZ1xuXG4gICAgKi9cbiAgYnRuLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgaWYgKGJ0bi5pbm5lckhUTUwgPT09ICdJUycpIHtcbiAgICAgIGJ0bi5jbGFzc0xpc3QgPVxuICAgICAgICAnc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLXRvZ2dsZXIgc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLXRvZ2dsZXItLW5vdCBqcy0tYXBpLXR5cGVzLXRvZ2dsZXInO1xuICAgICAgYnRuLm5leHRFbGVtZW50U2libGluZy5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtaW5jbHVkZS10eXBlJyk7XG4gICAgICBidG4ubmV4dEVsZW1lbnRTaWJsaW5nLnNldEF0dHJpYnV0ZShcbiAgICAgICAgJ2RhdGEtZXhjbHVkZS10eXBlJyxcbiAgICAgICAgYnRuLm5leHRFbGVtZW50U2libGluZy5pbm5lckhUTUxcbiAgICAgICk7XG4gICAgICBidG4uaW5uZXJIVE1MID0gJ05PVCc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJ0bi5jbGFzc0xpc3QgPVxuICAgICAgICAnc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLXRvZ2dsZXIgc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLXRvZ2dsZXItLWlzIGpzLS1hcGktdHlwZXMtdG9nZ2xlcic7XG4gICAgICBidG4ubmV4dEVsZW1lbnRTaWJsaW5nLnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS1leGNsdWRlLXR5cGUnKTtcbiAgICAgIGJ0bi5uZXh0RWxlbWVudFNpYmxpbmcuc2V0QXR0cmlidXRlKFxuICAgICAgICAnZGF0YS1pbmNsdWRlLXR5cGUnLFxuICAgICAgICBidG4ubmV4dEVsZW1lbnRTaWJsaW5nLmlubmVySFRNTFxuICAgICAgKTtcbiAgICAgIGJ0bi5pbm5lckhUTUwgPSAnSVMnO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gYnRuO1xufTtcblxuZXhwb3J0IGNvbnN0IHRvZ2dsZURhdGFTZWxlY3RlZCA9ICh0eXBlT3JTZXQpID0+IHtcbiAgaWYgKHR5cGVPclNldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2VsZWN0ZWQnKSA9PT0gJ3RydWUnKSB7XG4gICAgdHlwZU9yU2V0LnNldEF0dHJpYnV0ZSgnZGF0YS1zZWxlY3RlZCcsICdmYWxzZScpO1xuICB9IGVsc2Uge1xuICAgIHR5cGVPclNldC5zZXRBdHRyaWJ1dGUoJ2RhdGEtc2VsZWN0ZWQnLCAndHJ1ZScpO1xuICB9XG59O1xuXG5jb25zdCBhZGRUeXBlID0gKHR5cGUpID0+IHtcbiAgLy8gQ3JlYXRlIHRoZSBlbXB0eSBsaSBlbGVtZW50IHRvIGhvbGQgdGhlIHR5cGVzIHRoYXQgdGhlIHVzZXIgc2VsZWN0cy4gU2V0IHRoZSBjbGFzcyBsaXN0LFxuICAvLyBhbmQgdGhlIGRhdGEtc2VsZWN0ZWQgYXR0cmlidXRlIHRvIHRydWUuXG4gIGNvbnN0IGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgbGkuY2xhc3NMaXN0ID0gJ3NlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy1saXN0LWl0ZW0ganMtLWFwaS1zZWxlY3RlZC10eXBlJztcblxuICAvLyBUaGUgdHlwZVNwYW4gaG9sZHMgdGhlIHR5cGUgc2VsZWN0ZWQgYnkgdGhlIHVzZXIgZnJvbSB0aGUgZHJvcGRvd24uIFRoZSBkYXRhIGF0dHJpYnV0ZVxuICAvLyBpcyB1c2VkIGluIFNlYXJjaC5qcyB0byBidWlsZCB0aGUgcXVlcnkgc3RyaW5nXG4gIGNvbnN0IHR5cGVTcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICB0eXBlU3Bhbi5zZXRBdHRyaWJ1dGUoJ2RhdGEtaW5jbHVkZS10eXBlJywgdHlwZSk7XG4gIHR5cGVTcGFuLmlubmVySFRNTCA9IHR5cGU7XG5cbiAgLy8gQ29uc3RydWN0IHRoZSBsaSBlbGVtZW50LiBUaGUgcmVtb3ZlVHlwZUJ0biBhbmQgdHlwZVRvZ2dsZUJ0biBmdW5jaXRvbnMgcmV0dXJuIGh0bWwgZWxlbWVudHNcbiAgbGkuYXBwZW5kQ2hpbGQocmVtb3ZlVHlwZUJ0bigpKTtcbiAgbGkuYXBwZW5kQ2hpbGQodHlwZVRvZ2dsZUJ0bigpKTtcbiAgbGkuYXBwZW5kQ2hpbGQodHlwZVNwYW4pO1xuXG4gIGVsZW1lbnRzLmFwaVNlYXJjaC5zZWxlY3RlZFR5cGVzLmFwcGVuZENoaWxkKGxpKTtcbn07XG5cbmV4cG9ydCBjb25zdCB0eXBlTGluZUxpc3RlbmVyID0gKGUpID0+IHtcbiAgLy8gSWYgdGhlIHRhcmdldCBpcyBub3QgVHlwZSBMaW5lIGlucHV0IGxpbmUsIG9yIGFuIGVsZW1lbnQgaW4gdGhlIGRyb3Bkb3duIGxpc3QsXG4gIC8vIGNsb3NlIHRoZSBkcm9wZG93biBhbmQgcmVtb3ZlIHRoZSBldmVudCBsaXN0ZW5lclxuICBpZiAoXG4gICAgZS50YXJnZXQgIT09IGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlTGluZSAmJlxuICAgICFlLnRhcmdldC5tYXRjaGVzKCcuanMtLWFwaS1kcm9wZG93bi10eXBlcy1saXN0JylcbiAgKSB7XG4gICAgaGlkZVR5cGVzRHJvcERvd24oKTtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHR5cGVMaW5lTGlzdGVuZXIpO1xuICAgIC8vIElmIHRoZSB0YXJnZXQgaXMgb25lIGlmIHR5cGVzLCBnZXQgdGhlIGRhdGEgdHlwZVxuICB9IGVsc2UgaWYgKGUudGFyZ2V0Lmhhc0F0dHJpYnV0ZSgnZGF0YS10eXBlJykpIHtcbiAgICB0b2dnbGVEYXRhU2VsZWN0ZWQoZS50YXJnZXQpO1xuICAgIGFkZFR5cGUoZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXR5cGUnKSk7XG4gICAgZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVMaW5lLmZvY3VzKCk7XG4gICAgaGlkZVR5cGVzRHJvcERvd24oKTtcbiAgfVxufTtcblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqIFNFVFMgKioqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuXG5leHBvcnQgY29uc3Qgc2hvd1NldHNEcm9wRG93biA9ICgpID0+IHtcbiAgaWYgKGVsZW1lbnRzLmFwaVNlYXJjaC5zZXREcm9wRG93bi5oYXNBdHRyaWJ1dGUoJ2hpZGRlbicpKSB7XG4gICAgZWxlbWVudHMuYXBpU2VhcmNoLnNldERyb3BEb3duLnJlbW92ZUF0dHJpYnV0ZSgnaGlkZGVuJyk7XG4gICAgZWxlbWVudHMuYXBpU2VhcmNoLnNldERyb3BEb3duLnNjcm9sbFRvcCA9IDA7XG5cbiAgICBmaWx0ZXJTZXRzKCcnKTtcbiAgICBmaWx0ZXJTZWxlY3RlZFNldHMoKTtcbiAgICBmaWx0ZXJTZXRIZWFkZXJzKCk7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBoaWRlU2V0c0Ryb3BEb3duID0gKCkgPT4ge1xuICBpZiAoIWVsZW1lbnRzLmFwaVNlYXJjaC5zZXREcm9wRG93bi5oYXNBdHRyaWJ1dGUoJ2hpZGRlbicpKSB7XG4gICAgZWxlbWVudHMuYXBpU2VhcmNoLnNldERyb3BEb3duLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICBlbGVtZW50cy5hcGlTZWFyY2guc2V0SW5wdXQudmFsdWUgPSAnJztcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgbmF2aWdhdGVTZXRzRHJvcERvd24pO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgZmlsdGVyU2V0SGVhZGVycyA9ICgpID0+IHtcbiAgLy8gT24gZXZlcnkgaW5wdXQgaW50byB0aGUgdHlwZWxpbmUgYmFyLCBtYWtlIGFsbCBoZWFkZXJzIHZpc2libGVcbiAgY29uc3QgaGVhZGVycyA9IEFycmF5LmZyb20oXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1zZXRzLWNhdGVnb3J5LWhlYWRlcicpXG4gICk7XG4gIGhlYWRlcnMuZm9yRWFjaCgoaGVhZGVyKSA9PiB7XG4gICAgaWYgKGhlYWRlci5oYXNBdHRyaWJ1dGUoJ2hpZGRlbicpKSBoZWFkZXIucmVtb3ZlQXR0cmlidXRlKCdoaWRkZW4nKTtcbiAgfSk7XG5cbiAgLy8gRm9yIGVhY2ggY2F0ZWdvcnkgb2YgdHlwZSwgaWYgdGhlcmUgYXJlIG5vdCBhbnkgdmlzaWJsZSBiZWNhdXNlIHRoZXkgd2VyZSBmaWx0ZXJlZCBvdXRcbiAgLy8gaGlkZSB0aGUgaGVhZGVyIGZvciB0aGF0IGNhdGVnb3J5XG4gIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1leHBhbnNpb246bm90KFtoaWRkZW5dKScpKSB7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yKCcuanMtLWV4cGFuc2lvbi1oZWFkZXInKVxuICAgICAgLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgfVxuXG4gIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1jb3JlOm5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tY29yZS1oZWFkZXInKS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gIH1cblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tbWFzdGVyczpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tbWFzdGVycy1oZWFkZXInKVxuICAgICAgLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgfVxuXG4gIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1kcmFmdDpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWRyYWZ0LWhlYWRlcicpLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgfVxuXG4gIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1kdWVsX2RlY2s6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yKCcuanMtLWR1ZWxfZGVjay1oZWFkZXInKVxuICAgICAgLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgfVxuXG4gIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcmNoZW5lbXk6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yKCcuanMtLWFyY2hlbmVteS1oZWFkZXInKVxuICAgICAgLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgfVxuXG4gIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1ib3g6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1ib3gtaGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWNvbW1hbmRlcjpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tY29tbWFuZGVyLWhlYWRlcicpXG4gICAgICAuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXZhdWx0Om5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tdmF1bHQtaGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWZ1bm55Om5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tZnVubnktaGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLW1hc3RlcnBpZWNlOm5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcignLmpzLS1tYXN0ZXJwaWVjZS1oZWFkZXInKVxuICAgICAgLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgfVxuXG4gIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1tZW1vcmFiaWxpYTpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tbWVtb3JhYmlsaWEtaGVhZGVyJylcbiAgICAgIC5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gIH1cblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tcGxhbmVjaGFzZTpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tcGxhbmVjaGFzZS1oZWFkZXInKVxuICAgICAgLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgfVxuXG4gIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1wcmVtaXVtX2RlY2s6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yKCcuanMtLXByZW1pdW1fZGVjay1oZWFkZXInKVxuICAgICAgLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgfVxuXG4gIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1wcm9tbzpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXByb21vLWhlYWRlcicpLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgfVxuXG4gIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1zcGVsbGJvb2s6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yKCcuanMtLXNwZWxsYm9vay1oZWFkZXInKVxuICAgICAgLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgfVxuXG4gIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1zdGFydGVyOm5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcignLmpzLS1zdGFydGVyLWhlYWRlcicpXG4gICAgICAuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXRva2VuOm5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tdG9rZW4taGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXRyZWFzdXJlX2NoZXN0Om5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcignLmpzLS10cmVhc3VyZV9jaGVzdC1oZWFkZXInKVxuICAgICAgLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgfVxuXG4gIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS12YW5ndWFyZDpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tdmFuZ3VhcmQtaGVhZGVyJylcbiAgICAgIC5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBmaWx0ZXJTZXRzID0gKHN0cikgPT4ge1xuICAvLyBnZXQgYWxsIG9mIHRoZSBzZXRzIG91dCBvZiB0aGUgZHJvcGRvd24gbGlzdFxuICBjb25zdCBzZXRzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1zZXQtbmFtZV0nKSk7XG5cbiAgLy8gUmVtb3ZlIHRoZSBoaWRkZW4gYXR0cmlidXRlIGlmIGl0IGV4aXN0cyBvbiBhbnkgZWxlbWVudCwgYW5kIHRoZW4gaGlkZSBhbnkgZWxlbWVudHNcbiAgLy8gdGhhdCBkb24ndCBpbmNsdWRlIHRoZSBzdHJpbmcgZ2l2ZW4gaW4gdGhlIGlucHV0IGZyb20gdGhlIHVzZXJcbiAgc2V0cy5mb3JFYWNoKChzKSA9PiB7XG4gICAgaWYgKHMuaGFzQXR0cmlidXRlKCdoaWRkZW4nKSkgcy5yZW1vdmVBdHRyaWJ1dGUoJ2hpZGRlbicpO1xuXG4gICAgZmlsdGVyU2VsZWN0ZWRTZXRzKCk7XG5cbiAgICBpZiAoXG4gICAgICAhc1xuICAgICAgICAuZ2V0QXR0cmlidXRlKCdkYXRhLXNldC1uYW1lJylcbiAgICAgICAgLnRvTG93ZXJDYXNlKClcbiAgICAgICAgLmluY2x1ZGVzKHN0ci50b0xvd2VyQ2FzZSgpKSAmJlxuICAgICAgIXMuZ2V0QXR0cmlidXRlKCdkYXRhLXNldC1jb2RlJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzdHIudG9Mb3dlckNhc2UoKSlcbiAgICApIHtcbiAgICAgIHMuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5leHBvcnQgY29uc3QgZmlsdGVyU2VsZWN0ZWRTZXRzID0gKCkgPT4ge1xuICBjb25zdCBzZXRzID0gQXJyYXkuZnJvbShcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1zZXQtbmFtZV1bZGF0YS1zZWxlY3RlZF0nKVxuICApO1xuXG4gIHNldHMuZm9yRWFjaCgocykgPT4ge1xuICAgIGlmIChzLmdldEF0dHJpYnV0ZSgnZGF0YS1zZWxlY3RlZCcpID09PSAndHJ1ZScpIHtcbiAgICAgIGlmICghcy5oYXNBdHRyaWJ1dGUoJ2hpZGRlbicpKSBzLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICB9XG4gIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IGhpZ2hsaWdodFNldCA9IChzZXR0KSA9PiB7XG4gIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWhpZ2hsaWdodGVkJykpIHJlbW92ZUN1cnJlbnRIaWdobGlnaHQoKTtcblxuICBpZiAoc2V0dCkge1xuICAgIHNldHQuY2xhc3NMaXN0LmFkZChcbiAgICAgICdqcy0taGlnaGxpZ2h0ZWQnLFxuICAgICAgJ3NlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0LW9wdGlvbi0taGlnaGxpZ2h0ZWQnXG4gICAgKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IG5hdmlnYXRlU2V0c0Ryb3BEb3duID0gKGUpID0+IHtcbiAgY29uc3Qgc2V0cyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1zZXQ6bm90KFtoaWRkZW5dKScpKTtcbiAgY29uc3QgaSA9IHNldHMuaW5kZXhPZihkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWhpZ2hsaWdodGVkJykpO1xuXG4gIGlmIChlLmNvZGUgPT09ICdBcnJvd0Rvd24nICYmIGkgPCBzZXRzLmxlbmd0aCAtIDEpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgcmVtb3ZlQ3VycmVudEhpZ2hsaWdodCgpO1xuICAgIGhpZ2hsaWdodFNldChzZXRzW2kgKyAxXSk7XG5cbiAgICBzZXRTY3JvbGxUb3BPbkRvd25BcnJvdyhzZXRzW2kgKyAxXSwgZWxlbWVudHMuYXBpU2VhcmNoLnNldERyb3BEb3duKTtcbiAgfVxuXG4gIGlmIChlLmNvZGUgPT09ICdBcnJvd1VwJyAmJiBpID4gMCkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICByZW1vdmVDdXJyZW50SGlnaGxpZ2h0KCk7XG4gICAgaGlnaGxpZ2h0U2V0KHNldHNbaSAtIDFdKTtcblxuICAgIHNldFNjcm9sbFRvcE9uVXBBcnJvdyhzZXRzW2kgLSAxXSwgZWxlbWVudHMuYXBpU2VhcmNoLnNldERyb3BEb3duKTtcbiAgfVxuXG4gIGlmIChlLmNvZGUgPT09ICdFbnRlcicpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICB0b2dnbGVEYXRhU2VsZWN0ZWQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1oaWdobGlnaHRlZCcpKTtcbiAgICBhZGRTZXQoXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWhpZ2hsaWdodGVkJykuZ2V0QXR0cmlidXRlKCdkYXRhLXNldC1uYW1lJyksXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWhpZ2hsaWdodGVkJykuZ2V0QXR0cmlidXRlKCdkYXRhLXNldC1jb2RlJylcbiAgICApO1xuICAgIGhpZGVTZXRzRHJvcERvd24oKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGhvdmVyT3ZlclNldHNMaXN0ZW5lciA9ICgpID0+IHtcbiAgY29uc3Qgc2V0cyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1zZXQ6bm90KFtoaWRkZW5dKScpKTtcblxuICBzZXRzLmZvckVhY2goKHMpID0+IHtcbiAgICBzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCAoKSA9PiBoaWdobGlnaHRUeXBlKHMpKTtcbiAgfSk7XG59O1xuXG5leHBvcnQgY29uc3Qgc3RhcnRTZXRzRHJvcERvd25OYXZpZ2F0aW9uID0gKCkgPT4ge1xuICBjb25zdCBmaXJzdFNldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tc2V0Om5vdChbaGlkZGVuXSknKTtcbiAgaGlnaGxpZ2h0U2V0KGZpcnN0U2V0KTtcbiAgaG92ZXJPdmVyU2V0c0xpc3RlbmVyKCk7XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBuYXZpZ2F0ZVNldHNEcm9wRG93bik7XG4gIGVsZW1lbnRzLmFwaVNlYXJjaC5zZXREcm9wRG93bi5zY3JvbGxUb3AgPSAwO1xufTtcblxuY29uc3QgcmVtb3ZlU2V0QnRuID0gKCkgPT4ge1xuICAvLyBTcGFuIHdpbGwgYWN0IGFzIHRoZSBidXR0b24gdG8gcmVtb3ZlIHNldHMgZnJvbSB0aGUgXCJzZWxlY3RlZFwiIGxpc3RcbiAgY29uc3QgYnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICBidG4uY2xhc3NMaXN0ID1cbiAgICAnc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXNldHMtcmVtb3ZlLWJ0biBqcy0tYXBpLXNldHMtY2xvc2UtYnRuJztcbiAgYnRuLmlubmVySFRNTCA9ICd4JztcblxuICBidG4ub25jbGljayA9ICgpID0+IHtcbiAgICBjb25zdCBzZXROYW1lID0gYnRuLm5leHRFbGVtZW50U2libGluZy5pbm5lckhUTUw7XG4gICAgY29uc3Qgc2V0VG9Ub2dnbGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbZGF0YS1zZXQtbmFtZXw9JHtzZXROYW1lfV1gKTtcbiAgICB0b2dnbGVEYXRhU2VsZWN0ZWQoc2V0VG9Ub2dnbGUpO1xuXG4gICAgYnRuLnBhcmVudEVsZW1lbnQucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChidG4ucGFyZW50RWxlbWVudCk7XG4gIH07XG5cbiAgcmV0dXJuIGJ0bjtcbn07XG5cbmNvbnN0IGFkZFNldCA9IChzZXROYW1lLCBzZXRDb2RlKSA9PiB7XG4gIC8vIENyZWF0ZSB0aGUgZW1wdHkgbGkgZWxlbWVudCB0byBob2xkIHRoZSB0eXBlcyB0aGF0IHRoZSB1c2VyIHNlbGVjdHMuIFNldCB0aGUgY2xhc3MgbGlzdCxcbiAgLy8gYW5kIHRoZSBkYXRhLXNlbGVjdGVkIGF0dHJpYnV0ZSB0byB0cnVlLlxuICBjb25zdCBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG4gIGxpLmNsYXNzTGlzdCA9ICdzZWFyY2gtZm9ybV9fc2VsZWN0ZWQtc2V0cy1saXN0LWl0ZW0ganMtLWFwaS1zZWxlY3RlZC1zZXQnO1xuXG4gIC8vIFRoZSB0eXBlU3BhbiBob2xkcyB0aGUgdHlwZSBzZWxlY3RlZCBieSB0aGUgdXNlciBmcm9tIHRoZSBkcm9wZG93bi4gVGhlIGRhdGEgYXR0cmlidXRlXG4gIC8vIGlzIHVzZWQgaW4gU2VhcmNoLmpzIHRvIGJ1aWxkIHRoZSBxdWVyeSBzdHJpbmdcbiAgY29uc3Qgc2V0U3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgc2V0U3Bhbi5zZXRBdHRyaWJ1dGUoJ2RhdGEtaW5jbHVkZS1zZXQnLCBzZXRDb2RlKTtcbiAgc2V0U3Bhbi5pbm5lckhUTUwgPSBzZXROYW1lO1xuXG4gIGxpLmFwcGVuZENoaWxkKHJlbW92ZVNldEJ0bigpKTtcbiAgbGkuYXBwZW5kQ2hpbGQoc2V0U3Bhbik7XG5cbiAgZWxlbWVudHMuYXBpU2VhcmNoLnNlbGVjdGVkU2V0cy5hcHBlbmRDaGlsZChsaSk7XG59O1xuXG5leHBvcnQgY29uc3Qgc2V0SW5wdXRMaXN0ZW5lciA9IChlKSA9PiB7XG4gIC8vIElmIHRoZSB0YXJnZXQgaXMgbm90IHRoZSBzZXQgaW5wdXQgZmllbGQsIG9yIGFuIGVsZW1lbnQgaW4gdGhlIGRyb3Bkb3duIGxpc3QsXG4gIC8vIGNsb3NlIHRoZSBkcm9wZG93biBhbmQgcmVtb3ZlIHRoZSBldmVudCBsaXN0ZW5lclxuICBpZiAoXG4gICAgZS50YXJnZXQgIT09IGVsZW1lbnRzLmFwaVNlYXJjaC5zZXRJbnB1dCAmJlxuICAgICFlLnRhcmdldC5tYXRjaGVzKCcuanMtLWFwaS1kcm9wZG93bi1zZXRzLWxpc3QnKVxuICApIHtcbiAgICBoaWRlU2V0c0Ryb3BEb3duKCk7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzZXRJbnB1dExpc3RlbmVyKTtcbiAgICAvLyBJZiB0aGUgdGFyZ2V0IGlzIG9uZSBvZiB0aGUgc2V0IG9wdGlvbnMsIHRvZ2dsZSBpdCBhcyBzZWxlY3RlZCwgYWRkIGl0IHRvIHRoZSBsaXN0LFxuICAgIC8vIGFuZCBoaWRlIHRoZSBkcm9wZG93bi5cbiAgfSBlbHNlIGlmIChlLnRhcmdldC5oYXNBdHRyaWJ1dGUoJ2RhdGEtc2V0LW5hbWUnKSkge1xuICAgIHRvZ2dsZURhdGFTZWxlY3RlZChlLnRhcmdldCk7XG4gICAgYWRkU2V0KFxuICAgICAgZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXNldC1uYW1lJyksXG4gICAgICBlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2V0LWNvZGUnKVxuICAgICk7XG4gICAgZWxlbWVudHMuYXBpU2VhcmNoLnNldElucHV0LmZvY3VzKCk7XG4gICAgaGlkZVNldHNEcm9wRG93bigpO1xuICB9XG59O1xuXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKiBTVEFUUyAqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG5cbmV4cG9ydCBjb25zdCBzdGF0TGluZUNvbnRyb2xsZXIgPSAoKSA9PiB7XG4gIGlmIChjaGVja1N0YXRMaW5lRm9ySW50ZWdlcigpICYmIGNoZWNrRm9yTGVzc1RoYW5Gb3VyU3RhdExpbmVzKCkpIHtcbiAgICBjb25zdCBjbG9uZSA9IGNyZWF0ZVN0YXRzQ2xvbmUoKTtcbiAgICBlZGl0U3RhdHNDbG9uZShjbG9uZSk7XG4gICAgaW5zZXJ0U3RhdHNDbG9uZShjbG9uZSk7XG4gICAgcmVzZXRTdGF0TGluZUV2ZW50TGlzdGVuZXIoKTtcbiAgfVxufTtcblxuY29uc3QgY2hlY2tTdGF0TGluZUZvckludGVnZXIgPSAoKSA9PiB7XG4gIGNvbnN0IHN0YXRWYWwgPSBBcnJheS5mcm9tKFxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tYXBpLXN0YXQtdmFsdWUnKVxuICApLnNsaWNlKC0xKVswXTtcblxuICByZXR1cm4gcGFyc2VJbnQoc3RhdFZhbC52YWx1ZSkgPj0gMCA/IHRydWUgOiBmYWxzZTtcbn07XG5cbmNvbnN0IGNoZWNrRm9yTGVzc1RoYW5Gb3VyU3RhdExpbmVzID0gKCkgPT4ge1xuICBjb25zdCBzdGF0cyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1hcGktc3RhdC12YWx1ZScpKTtcblxuICByZXR1cm4gc3RhdHMubGVuZ3RoIDwgNCA/IHRydWUgOiBmYWxzZTtcbn07XG5cbmNvbnN0IGNyZWF0ZVN0YXRzQ2xvbmUgPSAoKSA9PiB7XG4gIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1zdGF0cy13cmFwcGVyJykuY2xvbmVOb2RlKHRydWUpO1xufTtcblxuY29uc3QgZWRpdFN0YXRzQ2xvbmUgPSAoY2xvbmUpID0+IHtcbiAgY2xvbmUucXVlcnlTZWxlY3RvcignLmpzLS1hcGktc3RhdCcpLnZhbHVlID0gJyc7XG4gIGNsb25lLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXN0YXQtZmlsdGVyJykudmFsdWUgPSAnJztcbiAgY2xvbmUucXVlcnlTZWxlY3RvcignLmpzLS1hcGktc3RhdC12YWx1ZScpLnZhbHVlID0gJyc7XG59O1xuXG5jb25zdCBpbnNlcnRTdGF0c0Nsb25lID0gKGNsb25lKSA9PiB7XG4gIGNvbnN0IGxhc3RTdGF0TGluZSA9IEFycmF5LmZyb20oXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1hcGktc3RhdHMtd3JhcHBlcicpXG4gICkuc2xpY2UoLTEpWzBdO1xuXG4gIGxhc3RTdGF0TGluZS5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2FmdGVyZW5kJywgY2xvbmUpO1xufTtcblxuY29uc3QgcmVzZXRTdGF0TGluZUV2ZW50TGlzdGVuZXIgPSAoKSA9PiB7XG4gIGNvbnN0IHN0YXRWYWx1ZXMgPSBBcnJheS5mcm9tKFxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tYXBpLXN0YXQtdmFsdWUnKVxuICApO1xuICBzdGF0VmFsdWVzLnNsaWNlKC0yKVswXS5yZW1vdmVFdmVudExpc3RlbmVyKCdpbnB1dCcsIHN0YXRMaW5lQ29udHJvbGxlcik7XG4gIHN0YXRWYWx1ZXMuc2xpY2UoLTEpWzBdLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0Jywgc3RhdExpbmVDb250cm9sbGVyKTtcbn07XG5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqIExFR0FMIFNUQVRVUyAqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcblxuZXhwb3J0IGNvbnN0IGZvcm1hdExpbmVDb250cm9sbGVyID0gKCkgPT4ge1xuICBjb25zb2xlLmxvZyhjaGVja0ZvckZvdXJMZXNzVGhhbkZvcm1hdExpbmVzKCkpO1xuICBpZiAoY2hlY2tGb3JGb3VyTGVzc1RoYW5Gb3JtYXRMaW5lcygpICYmIGNoZWNrRm9ybWF0TGluZUZvclZhbHVlKCkpIHtcbiAgICBjb25zdCBjbG9uZSA9IGNyZWF0ZUZvcm1hdENsb25lKCk7XG4gICAgZWRpdEZvcm1hdENsb25lKGNsb25lKTtcbiAgICBpbnNlcnRGb3JtYXRDbG9uZShjbG9uZSk7XG4gICAgcmVzZXRGb3JtYXRMaW5lRXZlbnRMaXN0ZW5lcigpO1xuICB9XG59O1xuXG5jb25zdCBjaGVja0Zvcm1hdExpbmVGb3JWYWx1ZSA9ICgpID0+IHtcbiAgY29uc3QgZm9ybWF0ID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWFwaS1mb3JtYXQnKSkuc2xpY2UoXG4gICAgLTFcbiAgKVswXTtcblxuICByZXR1cm4gZm9ybWF0LnZhbHVlICE9PSAnJyA/IHRydWUgOiBmYWxzZTtcbn07XG5cbmNvbnN0IGNoZWNrRm9yRm91ckxlc3NUaGFuRm9ybWF0TGluZXMgPSAoKSA9PiB7XG4gIGNvbnN0IGZvcm1hdHMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tYXBpLWZvcm1hdCcpKTtcbiAgcmV0dXJuIGZvcm1hdHMubGVuZ3RoIDwgNCA/IHRydWUgOiBmYWxzZTtcbn07XG5cbmNvbnN0IGNyZWF0ZUZvcm1hdENsb25lID0gKCkgPT4ge1xuICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktZm9ybWF0LXdyYXBwZXInKS5jbG9uZU5vZGUodHJ1ZSk7XG59O1xuXG5jb25zdCBlZGl0Rm9ybWF0Q2xvbmUgPSAoY2xvbmUpID0+IHtcbiAgY2xvbmUucXVlcnlTZWxlY3RvcignLmpzLS1hcGktbGVnYWwtc3RhdHVzJykudmFsdWUgPSAnJztcbiAgY2xvbmUucXVlcnlTZWxlY3RvcignLmpzLS1hcGktZm9ybWF0JykudmFsdWUgPSAnJztcbn07XG5cbmNvbnN0IGluc2VydEZvcm1hdENsb25lID0gKGNsb25lKSA9PiB7XG4gIGNvbnN0IGxhc3RGb3JtYXRMaW5lID0gQXJyYXkuZnJvbShcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWFwaS1mb3JtYXQtd3JhcHBlcicpXG4gICkuc2xpY2UoLTEpWzBdO1xuXG4gIGxhc3RGb3JtYXRMaW5lLmluc2VydEFkamFjZW50RWxlbWVudCgnYWZ0ZXJlbmQnLCBjbG9uZSk7XG59O1xuXG5jb25zdCByZXNldEZvcm1hdExpbmVFdmVudExpc3RlbmVyID0gKCkgPT4ge1xuICBjb25zdCBmb3JtYXRzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWFwaS1mb3JtYXQnKSk7XG4gIGZvcm1hdHMuc2xpY2UoLTIpWzBdLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZvcm1hdExpbmVDb250cm9sbGVyKTtcbiAgZm9ybWF0cy5zbGljZSgtMSlbMF0uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZm9ybWF0TGluZUNvbnRyb2xsZXIpO1xufTtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdGlmKF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0pIHtcblx0XHRyZXR1cm4gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdGlkOiBtb2R1bGVJZCxcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IChtb2R1bGUpID0+IHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0KCkgPT4gbW9kdWxlWydkZWZhdWx0J10gOlxuXHRcdCgpID0+IG1vZHVsZTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18uZyA9IChmdW5jdGlvbigpIHtcblx0aWYgKHR5cGVvZiBnbG9iYWxUaGlzID09PSAnb2JqZWN0JykgcmV0dXJuIGdsb2JhbFRoaXM7XG5cdHRyeSB7XG5cdFx0cmV0dXJuIHRoaXMgfHwgbmV3IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHJldHVybiB3aW5kb3c7XG5cdH1cbn0pKCk7IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJ2YXIgc2NyaXB0VXJsO1xuaWYgKF9fd2VicGFja19yZXF1aXJlX18uZy5pbXBvcnRTY3JpcHRzKSBzY3JpcHRVcmwgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLmcubG9jYXRpb24gKyBcIlwiO1xudmFyIGRvY3VtZW50ID0gX193ZWJwYWNrX3JlcXVpcmVfXy5nLmRvY3VtZW50O1xuaWYgKCFzY3JpcHRVcmwgJiYgZG9jdW1lbnQpIHtcblx0aWYgKGRvY3VtZW50LmN1cnJlbnRTY3JpcHQpXG5cdFx0c2NyaXB0VXJsID0gZG9jdW1lbnQuY3VycmVudFNjcmlwdC5zcmNcblx0aWYgKCFzY3JpcHRVcmwpIHtcblx0XHR2YXIgc2NyaXB0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwic2NyaXB0XCIpO1xuXHRcdGlmKHNjcmlwdHMubGVuZ3RoKSBzY3JpcHRVcmwgPSBzY3JpcHRzW3NjcmlwdHMubGVuZ3RoIC0gMV0uc3JjXG5cdH1cbn1cbi8vIFdoZW4gc3VwcG9ydGluZyBicm93c2VycyB3aGVyZSBhbiBhdXRvbWF0aWMgcHVibGljUGF0aCBpcyBub3Qgc3VwcG9ydGVkIHlvdSBtdXN0IHNwZWNpZnkgYW4gb3V0cHV0LnB1YmxpY1BhdGggbWFudWFsbHkgdmlhIGNvbmZpZ3VyYXRpb25cbi8vIG9yIHBhc3MgYW4gZW1wdHkgc3RyaW5nIChcIlwiKSBhbmQgc2V0IHRoZSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyB2YXJpYWJsZSBmcm9tIHlvdXIgY29kZSB0byB1c2UgeW91ciBvd24gbG9naWMuXG5pZiAoIXNjcmlwdFVybCkgdGhyb3cgbmV3IEVycm9yKFwiQXV0b21hdGljIHB1YmxpY1BhdGggaXMgbm90IHN1cHBvcnRlZCBpbiB0aGlzIGJyb3dzZXJcIik7XG5zY3JpcHRVcmwgPSBzY3JpcHRVcmwucmVwbGFjZSgvIy4qJC8sIFwiXCIpLnJlcGxhY2UoL1xcPy4qJC8sIFwiXCIpLnJlcGxhY2UoL1xcL1teXFwvXSskLywgXCIvXCIpO1xuX193ZWJwYWNrX3JlcXVpcmVfXy5wID0gc2NyaXB0VXJsOyIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlXG5fX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvanMvaW5kZXguanNcIik7XG4vLyBUaGlzIGVudHJ5IG1vZHVsZSB1c2VkICdleHBvcnRzJyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG4iXSwic291cmNlUm9vdCI6IiJ9