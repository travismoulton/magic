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
___CSS_LOADER_EXPORT___.push([module.id, "*,\n*::after,\n*::before {\n  margin: 0;\n  padding: 0;\n  box-sizing: inherit; }\n\nhtml {\n  font-size: 62.5%; }\n\nbody {\n  box-sizing: border-box;\n  font-size: 1.6rem;\n  background-size: cover;\n  background-repeat: no-repeat;\n  height: 127.5rem;\n  font-family: 'Lato', sans-serif;\n  position: relative; }\n\n[hidden] {\n  display: none !important; }\n\n.heading-tertiary {\n  font-size: 2.4rem;\n  text-transform: uppercase; }\n  .heading-tertiary--white {\n    color: #fff; }\n\n.heading-primary {\n  font-size: 3rem;\n  text-transform: uppercase;\n  font-weight: 300;\n  color: #fff; }\n\n.mb-10 {\n  margin-bottom: 1rem; }\n\n.mb-20 {\n  margin-bottom: 2rem; }\n\n.mt-50 {\n  margin-top: 5rem; }\n\n.btn, .btn:link, .btn:visited {\n  padding: .75rem 2rem;\n  border-radius: .5rem;\n  background-color: #f2f2f2;\n  font-weight: 400;\n  display: inline-block; }\n\n.btn:active, .btn:focus {\n  outline: none;\n  transform: translateY(-1px);\n  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.2); }\n\n.login,\n.register {\n  min-height: calc(100vh - 6.1rem);\n  width: 100vw;\n  background: linear-gradient(to top, #5f4f66, #342332);\n  background-repeat: no-repeat;\n  background-size: cover;\n  display: flex;\n  justify-content: center;\n  align-items: center; }\n  .login-img,\n  .register-img {\n    position: absolute;\n    border-radius: 100%;\n    height: 8.5rem;\n    width: 8.5rem;\n    top: -15%; }\n  .login__form,\n  .register__form {\n    position: relative;\n    background-color: #1e2a38;\n    border: 2px solid #1e2a38;\n    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.25);\n    max-width: 32rem;\n    display: flex;\n    flex-flow: column nowrap;\n    align-items: center;\n    padding: 4rem 0 2.6rem 0;\n    transform: translateY(-25%); }\n  .login__form-instructions,\n  .register__form-instructions {\n    color: #fff;\n    font-size: 1.4rem;\n    text-align: center;\n    margin-bottom: 1rem;\n    width: 90%; }\n  .login__form-group,\n  .register__form-group {\n    width: 90%; }\n  .login__form-input,\n  .register__form-input {\n    width: 100%;\n    margin: 0 auto;\n    border: 1px solid rgba(255, 255, 255, 0.2);\n    background-color: rgba(0, 0, 0, 0.1);\n    box-shadow: rgba(0, 0, 0, 0.5);\n    border-radius: 2px;\n    margin-bottom: 1rem;\n    line-height: 1.25;\n    text-align: center;\n    height: 4.2rem;\n    padding: 1rem 1.4rem;\n    caret-color: #fff;\n    color: rgba(255, 255, 255, 0.75); }\n    .login__form-input::placeholder,\n    .register__form-input::placeholder {\n      font-weight: 300;\n      color: #e6e6e6;\n      font-size: 1.8rem; }\n    .login__form-input:focus,\n    .register__form-input:focus {\n      border: 1px solid rgba(255, 255, 255, 0.75); }\n  .login__form-btn,\n  .register__form-btn {\n    width: 90%;\n    border-radius: 2px;\n    padding: 0 1.4rem;\n    margin: 1rem auto 0 auto;\n    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25);\n    cursor: pointer;\n    display: flex;\n    justify-content: space-around;\n    align-items: center;\n    height: 4.2rem; }\n    .login__form-btn--login,\n    .register__form-btn--login {\n      background-color: rgba(255, 255, 255, 0.87);\n      color: #16161d;\n      border: 1px solid #fff; }\n      .login__form-btn--login:hover,\n      .register__form-btn--login:hover {\n        background-color: #fff;\n        color: #342442; }\n      .login__form-btn--login:hover .login__form-icon-path--login,\n      .register__form-btn--login:hover .login__form-icon-path--login {\n        fill: #342442; }\n      .login__form-btn--login::after,\n      .register__form-btn--login::after {\n        margin-bottom: 1px solid white; }\n    .login__form-btn--register,\n    .register__form-btn--register {\n      text-decoration: none;\n      background-color: rgba(255, 255, 255, 0.1);\n      border: 1px solid rgba(255, 255, 255, 0.05);\n      color: rgba(255, 255, 255, 0.75); }\n      .login__form-btn--register:hover,\n      .register__form-btn--register:hover {\n        background-color: rgba(255, 255, 255, 0.25);\n        color: #fff; }\n      .login__form-btn--register:hover .login__form-icon-path--login,\n      .register__form-btn--register:hover .login__form-icon-path--login {\n        fill: #fff; }\n    .login__form-btn span,\n    .register__form-btn span {\n      margin-right: 1rem; }\n  .login__form-icon,\n  .register__form-icon {\n    height: 1.5rem;\n    width: 1.5rem;\n    transform: translateY(17%); }\n  .login__form-icon-path--login,\n  .register__form-icon-path--login {\n    fill: #16161d; }\n  .login__form-icon-path--register,\n  .register__form-icon-path--register {\n    fill: #fff; }\n  .login__form-hr,\n  .register__form-hr {\n    width: 90%;\n    margin: 2rem 0 1rem 0;\n    margin-bottom: 0.25px solid rgba(255, 255, 255, 0.25); }\n\n.nav {\n  display: flex;\n  align-items: center;\n  padding: 1rem 16%;\n  background-color: #2b253a;\n  border-bottom: 1px solid #000; }\n  @media only screen and (max-width: 75rem) {\n    .nav {\n      padding: 1.2rem 2.5%; } }\n  @media only screen and (max-width: 43.75em) {\n    .nav {\n      padding: 1rem; } }\n  .nav__left {\n    display: flex;\n    flex: 0 0 50%; }\n  .nav__right {\n    display: flex;\n    border-right: 1px solid #fff;\n    border-left: 1px solid #fff;\n    padding-left: 1rem;\n    margin-left: auto; }\n    @media only screen and (max-width: 40.625em) {\n      .nav__right {\n        display: none; } }\n    .nav__right > * {\n      margin-right: 1rem; }\n  .nav__item--search {\n    flex: 0 0 25%; }\n    @media only screen and (max-width: 40.625em) {\n      .nav__item--search {\n        display: none; } }\n  .nav__item--home {\n    margin-right: 3rem; }\n  .nav__link {\n    text-decoration: none;\n    color: rgba(255, 255, 255, 0.75);\n    transition: all 0.2s; }\n    .nav__link:hover {\n      margin-bottom: 2px;\n      color: #fff;\n      border-bottom: 1px solid #fff; }\n    .nav__link--home:hover .nav__icon-path--home {\n      fill: #fff; }\n  .nav__search {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    position: relative; }\n    .nav__search-input {\n      border: none;\n      padding: 1rem 2rem;\n      background-color: #2b253a;\n      caret-color: rgba(255, 255, 255, 0.75);\n      color: #fff; }\n      .nav__search-input::placeholder {\n        color: rgba(255, 255, 255, 0.75); }\n      .nav__search-input:focus {\n        outline: none; }\n    .nav__search-btn {\n      cursor: pointer;\n      position: absolute;\n      left: 2rem;\n      top: 1rem; }\n      .nav__search-btn:hover .nav__icon-path--search {\n        fill: #fff; }\n  .nav__icon-sizing--home {\n    width: 3rem;\n    height: 3rem; }\n  .nav__icon-sizing--search {\n    width: 2rem;\n    height: 2rem;\n    transform: translateX(-150%); }\n  .nav__icon-path--home {\n    fill: rgba(255, 255, 255, 0.75); }\n  .nav__icon-path--search {\n    fill: #bfbfbf; }\n  .nav__mobile {\n    display: none; }\n    @media only screen and (max-width: 40.625em) {\n      .nav__mobile {\n        display: flex;\n        flex: 0 0 50%;\n        align-items: center;\n        justify-content: end; } }\n    .nav__mobile-links {\n      background-color: #2b253a;\n      flex-flow: wrap;\n      padding: 1rem 0;\n      justify-content: flex-start;\n      display: none; }\n    .nav__mobile-link {\n      flex: 0 0 48%;\n      border: 1px solid rgba(85, 26, 139, 0.5);\n      border-color: rgba(255, 255, 255, 0.6);\n      background-color: rgba(255, 255, 255, 0.1);\n      border-radius: 3px;\n      margin-top: 0.6rem;\n      margin-left: 1%;\n      text-decoration: none;\n      color: #fff;\n      cursor: pointer;\n      line-height: 1.4;\n      padding: 0.2rem 1rem 0 1rem;\n      height: 2.8rem;\n      transition: all 0.2s;\n      box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06);\n      text-align: center;\n      transition: all 0.2s; }\n      .nav__mobile-link:hover {\n        background-color: rgba(255, 255, 255, 0.25); }\n    .nav__mobile-hamburger-wrapper {\n      display: flex;\n      align-items: center;\n      margin-right: 1rem;\n      height: 3rem;\n      width: 3rem; }\n    .nav__mobile-hamburger {\n      position: relative; }\n      .nav__mobile-hamburger, .nav__mobile-hamburger::before, .nav__mobile-hamburger::after {\n        width: 3rem;\n        height: 2px;\n        background-color: rgba(255, 255, 255, 0.75);\n        display: inline-block; }\n      .nav__mobile-hamburger::before, .nav__mobile-hamburger::after {\n        content: '';\n        position: absolute;\n        left: 0; }\n      .nav__mobile-hamburger::before {\n        margin-top: -0.8rem; }\n      .nav__mobile-hamburger::after {\n        margin-top: 0.8rem; }\n\n.error {\n  margin-top: 2rem;\n  text-align: center;\n  background-color: #ff8080;\n  border-radius: 10px;\n  padding: 2rem;\n  font-size: 2rem;\n  grid-column: center-start / center-end;\n  font-weight: 700; }\n\n.search-form {\n  padding: 2rem 25rem;\n  background-color: #fdfdfd;\n  min-height: calc(100vh - 6.2rem); }\n  @media only screen and (max-width: 81.25em) {\n    .search-form {\n      padding: 2rem 15rem; } }\n  @media only screen and (max-width: 62.5em) {\n    .search-form {\n      padding: 2rem 5rem; } }\n  @media only screen and (max-width: 56.25em) {\n    .search-form {\n      padding: 2rem 1rem; } }\n  .search-form__group {\n    width: 75%;\n    display: flex;\n    margin-bottom: 3rem;\n    align-items: flex-start;\n    padding: 0.5rem 4rem 0.5rem 0;\n    border-bottom: 1px solid rgba(0, 0, 0, 0.2); }\n    @media only screen and (max-width: 93.75em) {\n      .search-form__group {\n        width: 100%; } }\n    @media only screen and (max-width: 46.875em) {\n      .search-form__group {\n        flex-direction: column; } }\n    .search-form__group:nth-child(10) {\n      border-bottom: none; }\n    .search-form__group--no-border {\n      border-bottom: none; }\n  .search-form__label {\n    flex: 0 0 20%;\n    display: flex;\n    align-items: flex-start;\n    font-weight: 300;\n    margin-top: 0.7rem;\n    color: #551a8b; }\n    @media only screen and (max-width: 46.875em) {\n      .search-form__label {\n        margin-bottom: 1.2rem;\n        margin-left: 1rem; } }\n  .search-form__group-input-wrapper {\n    flex: 0 0 80%; }\n    @media only screen and (max-width: 46.875em) {\n      .search-form__group-input-wrapper {\n        flex: 0 0 100%;\n        width: 100%; } }\n  .search-form__input-wrapper {\n    flex: 0 0 80%; }\n    @media only screen and (max-width: 46.875em) {\n      .search-form__input-wrapper {\n        flex: 0 0 100%;\n        width: 100%; } }\n  .search-form__tip {\n    font-size: 1rem;\n    line-height: 1.4;\n    width: 70%; }\n  .search-form__input-text {\n    width: 40rem;\n    height: 4rem;\n    margin-bottom: 1rem;\n    padding: 1rem;\n    border: solid 1px #bfbfbf;\n    border-radius: 5px; }\n    @media only screen and (max-width: 28.125em) {\n      .search-form__input-text {\n        width: 30rem; } }\n    @media only screen and (max-width: 21.875em) {\n      .search-form__input-text {\n        width: 20rem; } }\n    .search-form__input-text:focus {\n      border: solid 1px #000; }\n  .search-form__input-integer {\n    border: 1px solid #aeaeae;\n    height: 3.5rem;\n    border-radius: 3px;\n    padding-left: 0.5rem;\n    padding-right: 0.5rem;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06); }\n    .search-form__input-integer--relative {\n      position: relative; }\n    @media only screen and (max-width: 37.5em) {\n      .search-form__input-integer {\n        max-width: 30%; } }\n  .search-form__group--checkbox {\n    display: flex;\n    margin-bottom: 1rem; }\n  .search-form__group-colors-left, .search-form__group-colors-right {\n    display: flex; }\n    @media only screen and (max-width: 81.25em) {\n      .search-form__group-colors-left, .search-form__group-colors-right {\n        flex-direction: column; } }\n  @media only screen and (max-width: 81.25em) {\n    .search-form__group-colors-left {\n      margin-right: 3rem; } }\n  .search-form__group-rarity-left, .search-form__group-rarity-right {\n    display: flex; }\n    @media only screen and (max-width: 28.125em) {\n      .search-form__group-rarity-left, .search-form__group-rarity-right {\n        flex-direction: column; } }\n  @media only screen and (max-width: 81.25em) {\n    .search-form__group-rarity-left {\n      margin-right: 3rem; } }\n  .search-form__label--checkbox {\n    margin-right: 1rem; }\n  .search-form__input-checkbox {\n    width: 2.25rem;\n    height: 2.25rem;\n    margin-right: 0.8rem; }\n    @media only screen and (max-width: 93.75em) {\n      .search-form__input-checkbox {\n        margin-bottom: 0.3rem; } }\n  .search-form__checkbox-wrapper {\n    display: flex;\n    align-items: center; }\n  .search-form__select-menu {\n    margin-bottom: 1rem;\n    color: #343242;\n    margin-right: 1rem;\n    border: 1px solid #aeaeae;\n    border-radius: 3px;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06);\n    padding: 0 2.2rem 0 0.5rem;\n    height: 3.4rem;\n    font-size: 1.4rem;\n    text-indent: 0;\n    -webkit-appearance: none;\n    -moz-appearance: none;\n    text-overflow: '';\n    background-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\n    background-repeat: no-repeat;\n    background-position: right 0.8rem center;\n    background-size: 1.2rem 1rem;\n    background-color: #fff; }\n    @media only screen and (max-width: 81.25em) {\n      .search-form__select-menu {\n        margin-right: 0.3rem; } }\n    @media only screen and (max-width: 37.5em) {\n      .search-form__select-menu--2 {\n        max-width: 49%; } }\n    @media only screen and (max-width: 37.5em) {\n      .search-form__select-menu--3 {\n        max-width: 32%; } }\n  .search-form__svg-size {\n    height: 2rem;\n    width: 2rem;\n    margin-right: 1rem; }\n  .search-form__svg-color {\n    fill: #551a8b; }\n  .search-form__submit-wrapper {\n    position: sticky;\n    bottom: 0;\n    width: 100%;\n    display: flex;\n    margin-bottom: 3rem;\n    border-top: 1px solid rgba(0, 0, 0, 0.2);\n    align-items: flex-start;\n    padding: 1.5rem 4rem 1.5rem 0;\n    background-color: #fdfdfd;\n    z-index: 1; }\n  .search-form__submit {\n    border-radius: 3px;\n    padding: 0.7rem;\n    background-color: #f9f7f5;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    color: #551a8b;\n    font-weight: 500;\n    transition: all 0.2s;\n    margin-left: 20%; }\n    .search-form__submit:hover {\n      cursor: pointer;\n      background-color: #fff; }\n  .search-form__dropdown-span {\n    display: flex;\n    flex-direction: column; }\n  .search-form__selected-types, .search-form__selected-sets {\n    display: flex;\n    flex-direction: column;\n    list-style: none;\n    margin-bottom: 0.3rem; }\n  .search-form__selected-types-list-item, .search-form__selected-sets-list-item {\n    display: flex;\n    margin-bottom: 0.7rem; }\n  .search-form__selected-types-remove-btn, .search-form__selected-sets-remove-btn {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    cursor: pointer;\n    height: 2rem;\n    width: 2rem;\n    font-size: 1.3rem;\n    background-color: #f2f2f2;\n    margin-right: 0.7rem; }\n  .search-form__selected-types-toggler {\n    height: 2rem;\n    width: 2.75rem;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    cursor: pointer;\n    font-size: 1.3rem;\n    margin-right: 0.7rem; }\n    .search-form__selected-types-toggler--is {\n      background-color: #47d147; }\n    .search-form__selected-types-toggler--not {\n      background-color: #ff0000; }\n  .search-form__dropdown {\n    position: absolute;\n    max-height: 28rem;\n    background-color: #fff;\n    z-index: 2;\n    top: 100%;\n    width: 40rem;\n    margin-top: -1rem;\n    overflow-y: auto;\n    border: 1px solid #000; }\n    .search-form__dropdown-list {\n      list-style: none; }\n      .search-form__dropdown-list-category {\n        padding: 0.5rem; }\n      .search-form__dropdown-list-option {\n        padding: 0.3rem 2rem;\n        display: flex;\n        align-items: center; }\n        .search-form__dropdown-list-option:hover {\n          cursor: pointer; }\n        .search-form__dropdown-list-option--highlighted {\n          background-color: #ccd8ff; }\n        .search-form__dropdown-list-option span {\n          text-transform: uppercase;\n          margin-left: 1rem; }\n      .search-form__dropdown-list-img {\n        width: 2rem;\n        height: 2rem;\n        margin-right: 0.7rem; }\n\n.dropdown-wrapper {\n  position: relative; }\n\n.inv-search-price-msg {\n  position: absolute;\n  bottom: 0;\n  right: 0;\n  color: red; }\n\n.relative {\n  position: relative; }\n\n.api-results-display__nav {\n  background-color: #f3f5f8;\n  border-bottom: 1px solid rgba(99, 68, 150, 0.1);\n  width: 100%;\n  display: flex;\n  justify-content: space-between;\n  padding: 1.2rem 16%;\n  margin-bottom: 0.1rem;\n  height: 5.2rem; }\n  @media only screen and (max-width: 75rem) {\n    .api-results-display__nav {\n      padding: 1.2rem 2.5%; } }\n  @media only screen and (max-width: 53.125em) {\n    .api-results-display__nav {\n      display: none; } }\n  .api-results-display__nav-select {\n    color: #b300b3;\n    margin-right: 1rem;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    border-radius: 3px;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06);\n    padding: 0.1rem 2.2rem 0 0.5rem;\n    color: #551a8b;\n    height: 2.8rem;\n    font-size: 1.4rem;\n    text-indent: 0;\n    -webkit-appearance: none;\n    -moz-appearance: none;\n    text-overflow: '';\n    background-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\n    background-repeat: no-repeat;\n    background-position: right 0.8rem center;\n    background-size: 1.2rem 1rem; }\n    .api-results-display__nav-select:hover {\n      cursor: pointer;\n      background-color: #fff; }\n  .api-results-display__nav-label {\n    color: #551a8b; }\n  .api-results-display__nav-btn {\n    border-radius: 3px;\n    background-color: #f9f7f5;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    color: #551a8b;\n    font-weight: 500;\n    transition: all 0.2s;\n    height: 2.8rem;\n    padding: 0.1rem 0.7rem 0 0.7rem;\n    font-size: 1.4rem;\n    margin: auto 0;\n    text-align: center;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06); }\n    .api-results-display__nav-btn:hover {\n      cursor: pointer;\n      background-color: #fff; }\n  .api-results-display__nav-right {\n    display: flex;\n    align-items: center; }\n  .api-results-display__nav-pagination-container {\n    display: flex;\n    align-items: center;\n    background-color: #f9f7f5;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    color: #551a8b;\n    padding: 0.2rem 0.7rem;\n    cursor: pointer;\n    height: 2.8rem;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06); }\n    .api-results-display__nav-pagination-container:not(:last-child) {\n      margin-right: 1rem; }\n    .api-results-display__nav-pagination-container:nth-child(2) svg {\n      margin-right: 1rem; }\n    .api-results-display__nav-pagination-container:nth-child(3) svg {\n      margin-left: 1rem; }\n    .api-results-display__nav-pagination-container--disabled {\n      cursor: not-allowed;\n      color: rgba(0, 0, 0, 0.25);\n      background-color: #f5f6f7; }\n    @media only screen and (max-width: 31.5em) {\n      .api-results-display__nav-pagination-container {\n        margin: 0; } }\n  .api-results-display__nav-svg-size {\n    height: 2rem;\n    width: 2rem; }\n  .api-results-display__nav-svg-color {\n    fill: #551a8b; }\n\n.api-results-display__display-bar {\n  width: 100%;\n  border-bottom: 1px solid rgba(99, 68, 150, 0.1);\n  background-color: #f6f4fa;\n  color: #535353;\n  padding-left: 16%;\n  margin-bottom: 2rem;\n  height: 2.1rem; }\n  @media only screen and (max-width: 75rem) {\n    .api-results-display__display-bar {\n      padding-left: 2.5%; } }\n\n.api-results-display__mobile {\n  background-color: #f3f5f8;\n  border-bottom: 1px solid rgba(99, 68, 150, 0.1);\n  justify-content: space-between;\n  margin-bottom: 0.1rem;\n  height: 5.2rem;\n  display: none; }\n  @media only screen and (max-width: 53.125em) {\n    .api-results-display__mobile {\n      display: flex;\n      padding: 1.2rem 2.5%; } }\n  @media only screen and (max-width: 31.5em) {\n    .api-results-display__mobile {\n      padding: 1.2rem; } }\n  .api-results-display__mobile-svg-size {\n    width: 1.4rem;\n    height: 1.4rem; }\n\n.api-results-display__mobile-display-options {\n  background-color: #f3f5f8;\n  border-bottom: 1px solid rgba(99, 68, 150, 0.1);\n  flex-direction: column;\n  align-items: flex-start;\n  padding: 1.2rem 0;\n  display: none; }\n\n.api-results-display__mobile-display-options-group {\n  display: flex;\n  justify-content: space-between;\n  width: 45%;\n  margin: 0 auto 1rem auto; }\n  @media only screen and (max-width: 51.5625em) {\n    .api-results-display__mobile-display-options-group {\n      width: 60%; } }\n  @media only screen and (max-width: 37.5em) {\n    .api-results-display__mobile-display-options-group {\n      width: 80%; } }\n  @media only screen and (max-width: 28.125em) {\n    .api-results-display__mobile-display-options-group {\n      width: 95%; } }\n  .api-results-display__mobile-display-options-group label {\n    margin-right: 1rem; }\n\n.api-results-display__nav-select--mobile {\n  width: 24rem; }\n  @media only screen and (max-width: 21.875em) {\n    .api-results-display__nav-select--mobile {\n      width: 16rem; } }\n\n.api-results-mobile-display-btn {\n  align-self: center; }\n\n.wrapper {\n  overflow-x: scroll;\n  overflow-y: hidden;\n  position: relative;\n  display: flex;\n  margin: 0 auto;\n  width: 68%; }\n  @media only screen and (max-width: 75rem) {\n    .wrapper {\n      width: 905; } }\n\n.card-checklist {\n  width: 100%;\n  justify-self: center; }\n  .card-checklist__row {\n    display: grid;\n    height: 3rem; }\n    .card-checklist__row--7 {\n      grid-template-columns: 10% 22.5% 10% 17.5% 15% 15% 10%; }\n    .card-checklist__row--9 {\n      grid-template-columns: repeat(9, 1fr); }\n    .card-checklist__row--header {\n      border-bottom: 1px solid #000;\n      color: #531a8b;\n      text-transform: uppercase;\n      font-size: 1.2rem !important;\n      font-weight: 200 !important; }\n    .card-checklist__row--grey {\n      background-color: #f2f2f2; }\n    .card-checklist__row:nth-child(even) {\n      background-color: #f2f2f2; }\n    .card-checklist__row--header {\n      height: 3.5rem; }\n  .card-checklist__data {\n    width: 100%;\n    display: flex;\n    flex-wrap: nowrap;\n    justify-content: flex-start;\n    font-size: 1.4rem; }\n    .card-checklist__data--set {\n      text-transform: uppercase;\n      padding-left: 0.5rem; }\n    .card-checklist__data--name {\n      justify-content: flex-start; }\n    .card-checklist__data--rarity {\n      text-transform: capitalize; }\n  .card-checklist__data-link {\n    padding: 1rem 0;\n    display: block;\n    text-decoration: none;\n    width: 100%;\n    color: #000;\n    white-space: nowrap;\n    overflow: hidden;\n    text-overflow: ellipsis; }\n    .card-checklist__data-link--price {\n      color: #006885; }\n\n.tooltip {\n  position: absolute;\n  z-index: 5;\n  width: 24rem;\n  height: 34rem; }\n  .tooltip__img {\n    width: 100%;\n    height: 100%; }\n\n.negative-earnings {\n  color: red; }\n\n.positive-earnings {\n  color: green; }\n\n.image-grid {\n  padding: 7rem 16%;\n  display: flex;\n  justify-content: space-between;\n  flex-wrap: wrap; }\n  @media only screen and (max-width: 75rem) {\n    .image-grid {\n      padding: 4rem 2.5%; } }\n  @media only screen and (max-width: 62.5em) {\n    .image-grid {\n      grid-column-gap: 1rem; } }\n  .image-grid__outer-div {\n    position: relative;\n    height: 100%; }\n  .image-grid__inner-div {\n    perspective: 150rem;\n    width: 100%;\n    height: 100%; }\n  .image-grid__double {\n    width: 100%;\n    height: 100%;\n    position: absolute;\n    top: 0;\n    left: 0;\n    backface-visibility: hidden;\n    overflow: hidden;\n    transition: all 0.8s ease; }\n    .image-grid__double--back {\n      transform: rotateY(180deg); }\n  .image-grid__double-btn {\n    position: absolute;\n    top: 26%;\n    left: 75%;\n    width: 4.4rem;\n    height: 4.4rem;\n    border-radius: 50%;\n    background-color: rgba(255, 255, 255, 0.6);\n    border: 2px solid #342442;\n    transition: all 0.2s;\n    display: flex;\n    justify-content: center;\n    align-items: center; }\n    .image-grid__double-btn:hover {\n      cursor: pointer;\n      background-color: #fff; }\n  .image-grid__double-btn-svg {\n    height: 2.5rem;\n    width: 2.5rem;\n    pointer-events: none; }\n  .image-grid__dobule-btn-svg-color {\n    color: #16161d; }\n  .image-grid__container {\n    width: 100%;\n    height: 100%; }\n  .image-grid__image {\n    width: 100%;\n    height: 100%;\n    box-shadow: 1px 1px 6px rgba(0, 0, 0, 0.45);\n    border-radius: 4.75% / 3.5%; }\n  .image-grid__link {\n    margin-bottom: 0.9rem;\n    width: 24.25%;\n    height: auto;\n    margin-bottom: 0.9rem;\n    page-break-after: auto;\n    page-break-before: auto;\n    page-break-inside: avoid;\n    display: block; }\n    @media only screen and (max-width: 59.375em) {\n      .image-grid__link {\n        width: 31.75%; } }\n    @media only screen and (max-width: 40.625em) {\n      .image-grid__link {\n        width: 47.25%; } }\n\n.card {\n  width: 100%;\n  padding: 0 16%;\n  display: flex;\n  margin-top: 3rem;\n  padding-bottom: 0.7rem;\n  border-bottom: 1px dashed rgba(0, 0, 0, 0.7); }\n  .card__img-container {\n    z-index: 2;\n    border-radius: 100%; }\n  .card__img {\n    width: 33rem;\n    height: 46rem;\n    box-shadow: 1px 1px 8px rgba(0, 0, 0, 0.5);\n    border-radius: 4.75% / 3.5%; }\n  .card__img-left {\n    width: 33rem;\n    display: flex;\n    flex-direction: column;\n    z-index: 2; }\n  .card__img-btn {\n    align-self: center;\n    margin-top: 1rem;\n    height: 2.8rem;\n    font-size: 1.4rem;\n    line-height: 1.8;\n    color: #551a8b;\n    background-color: #f9f7f5;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    border-radius: 3px;\n    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06);\n    transition: all 0.2s;\n    padding: 0.2rem 0.5rem;\n    text-align: center;\n    display: flex;\n    align-items: center; }\n    .card__img-btn:hover {\n      cursor: pointer;\n      background-color: #fff;\n      border-color: #634496; }\n  .card__img-svg {\n    height: 1.4rem;\n    width: 1.4rem;\n    margin-right: 0.3rem;\n    pointer-events: none; }\n  .card__img-svg-color {\n    fill: #551a8b; }\n  .card__img-double-area {\n    position: relative; }\n  .card__img-double-sided {\n    perspective: 150rem;\n    height: 46rem; }\n  .card__img-double {\n    width: 33rem;\n    height: 46rem;\n    position: absolute;\n    top: 0;\n    left: 0;\n    backface-visibility: hidden;\n    overflow: hidden; }\n    .card__img-double--back {\n      transform: rotateY(180deg); }\n  .card__text {\n    background-color: #fff;\n    border-radius: 4px;\n    border: 1px solid rgba(0, 0, 0, 0.25);\n    border-top: 3px solid #000;\n    border-bottom: 3px solid #000;\n    margin-top: 2rem;\n    width: 34rem;\n    display: flex;\n    flex-direction: column;\n    padding: 3rem;\n    margin-right: 3rem;\n    margin-left: -2rem; }\n    .card__text-flex {\n      margin-bottom: 1rem;\n      border-bottom: 1px solid #bfbfbf; }\n    .card__text-title {\n      display: flex;\n      align-items: center; }\n      .card__text-title-h3 {\n        font-size: 1.8rem;\n        font-weight: 400;\n        margin-right: 1rem; }\n    .card__text-color-indicator {\n      width: 1.3rem;\n      height: 1.3rem;\n      border: 1px solid #333;\n      border-radius: 50%;\n      box-shadow: 0px 0px 0px 2px rgba(0, 0, 0, 0.2);\n      margin-right: 0.7rem;\n      display: inline-block; }\n      .card__text-color-indicator--U {\n        background-color: rgba(128, 128, 255, 0.7); }\n      .card__text-color-indicator--B {\n        background-color: rgba(0, 0, 0, 0.7); }\n      .card__text-color-indicator--R {\n        background-color: rgba(255, 77, 77, 0.7); }\n      .card__text-color-indicator--W {\n        background-color: rgba(255, 255, 255, 0.7); }\n      .card__text-color-indicator--G {\n        background-color: rgba(0, 255, 0, 0.7); }\n    .card__text-oracle-p {\n      margin-bottom: 1rem;\n      font-size: 1.3rem; }\n    .card__text-oracle-flavor {\n      font-size: 1.3rem;\n      font-style: italic; }\n    .card__text-illustrator {\n      font-size: 1.2rem;\n      font-style: italic; }\n    .card__text-legal {\n      display: flex;\n      flex-direction: row;\n      justify-content: space-between; }\n      .card__text-legal-half {\n        display: flex;\n        flex-direction: column; }\n      .card__text-legal-span-container {\n        display: flex;\n        align-items: center;\n        font-size: 1.4rem; }\n        .card__text-legal-span-container:not(:last-child) {\n          margin-bottom: 0.5rem; }\n      .card__text-legal-span-box {\n        width: 6rem;\n        height: 2.5rem;\n        margin-right: 0.3rem;\n        font-size: 1rem;\n        text-transform: uppercase;\n        display: flex;\n        justify-content: center;\n        align-items: center;\n        border-radius: 3px; }\n        .card__text-legal-span-box--not_legal {\n          background-color: #e60000; }\n        .card__text-legal-span-box--legal {\n          background-color: #009900; }\n      .card__text-legal-span-box {\n        color: #fff; }\n  .card__set {\n    display: flex;\n    flex-direction: column; }\n    .card__set-banner {\n      display: flex;\n      border: 1px solid #bfbfbf;\n      width: 40rem;\n      background-color: #49465c;\n      color: #fdfdfd;\n      padding: 0.7rem;\n      border-radius: 3px; }\n      .card__set-banner-svg-container {\n        margin-right: 1rem; }\n      .card__set-banner-svg {\n        width: 2.4rem;\n        height: 2.4rem;\n        filter: invert(100%); }\n    .card__set-details {\n      display: flex;\n      flex-direction: column; }\n    .card__set-header-name {\n      font-size: 1.7remrem; }\n    .card__set-header-code {\n      text-transform: uppercase; }\n    .card__set-prints-header {\n      display: flex;\n      justify-content: space-between;\n      background-color: #49465c;\n      color: #fdfdfd;\n      font-size: 1.3rem;\n      text-transform: uppercase;\n      border: 1px solid #bfbfbf;\n      border-radius: 3px;\n      padding: 0.3rem 0.7rem; }\n    .card__set-prints-svg-container {\n      height: 1.8rem;\n      width: 1.8rem;\n      border: 1px solid #bfbfbf;\n      display: flex;\n      justify-content: center;\n      align-items: center;\n      border-radius: 100%; }\n    .card__set-prints-svg--common {\n      fill: #000; }\n    .card__set-prints-svg--uncommon {\n      fill: #e6e6e6; }\n    .card__set-prints-svg--rare {\n      fill: #e6c300; }\n    .card__set-prints-svg--mythic {\n      fill: #ff0000; }\n    .card__set-prints-list {\n      list-style: none;\n      border-radius: 3px; }\n      .card__set-prints-list-link:link, .card__set-prints-list-link:visited {\n        text-decoration: none;\n        color: #000; }\n      .card__set-prints-list-item {\n        display: flex;\n        justify-content: space-between;\n        cursor: pointer;\n        border-bottom: 1px solid #e7e9ec;\n        border-left: 1px solid #cdcdcd;\n        background-color: #fff;\n        padding: 0.25rem 0; }\n        .card__set-prints-list-item--pl-14 {\n          padding-left: 1.4rem;\n          border-bottom: 3px solid #000; }\n        .card__set-prints-list-item:hover {\n          background-color: #f2f2f2; }\n      .card__set-prints-list-item-name-wrapper {\n        display: flex;\n        align-items: center;\n        margin-left: -1rem; }\n      .card__set-prints-list-item-set-name {\n        margin-left: 0.5rem; }\n      .card__set-prints-list-item-price {\n        margin-right: 0.7rem;\n        color: #006885; }\n\n.card-page {\n  display: flex;\n  flex-direction: column;\n  grid-column: 1 / -1;\n  position: relative; }\n\n.add-to-inv,\n.remove-from-inv {\n  margin-top: 3rem;\n  width: 50%;\n  margin-left: 50%;\n  transform: translateX(-50%);\n  display: flex;\n  flex-direction: column; }\n  .add-to-inv__header,\n  .remove-from-inv__header {\n    color: #16161d;\n    font-size: 2.2rem;\n    font-weight: 300;\n    margin: 0 auto 1rem auto; }\n  .add-to-inv__form,\n  .remove-from-inv__form {\n    display: flex;\n    flex-direction: column; }\n    .add-to-inv__form-price,\n    .remove-from-inv__form-price {\n      width: 20rem;\n      height: 3.5rem;\n      margin-bottom: 1rem;\n      padding: 1rem;\n      border: solid 1px #bfbfbf;\n      border-radius: 5px; }\n      .add-to-inv__form-price:focus,\n      .remove-from-inv__form-price:focus {\n        border: solid 1px #000; }\n    .add-to-inv__form-group,\n    .remove-from-inv__form-group {\n      display: flex;\n      justify-content: space-evenly;\n      align-content: center;\n      margin-bottom: 1.5rem;\n      position: relative; }\n    .add-to-inv__form-label,\n    .remove-from-inv__form-label {\n      margin-right: 0.3rem;\n      display: flex;\n      align-content: center;\n      justify-content: center;\n      color: #16161d;\n      margin-top: 0.45rem; }\n  .add-to-inv-price-msg,\n  .remove-from-inv-price-msg {\n    position: absolute;\n    bottom: -1.8rem;\n    right: 25%;\n    color: red; }\n  .add-to-inv__submit,\n  .remove-from-inv__submit {\n    align-self: center;\n    height: 3.1rem;\n    font-size: 1.4rem;\n    line-height: 1.8;\n    color: #551a8b;\n    background-color: #f9f7f5;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    border-radius: 3px;\n    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06);\n    transition: all 0.2s;\n    padding: 0.2rem 0.75rem;\n    text-align: center;\n    display: flex;\n    align-items: center;\n    margin-bottom: 1rem; }\n    .add-to-inv__submit:hover,\n    .remove-from-inv__submit:hover {\n      cursor: pointer;\n      background-color: #fff;\n      border-color: #634496; }\n\n.util-space::before,\n.util-space::after {\n  content: '';\n  margin: 0 0.2rem; }\n\n.no-results {\n  justify-self: center; }\n\n.homepage {\n  background: linear-gradient(to bottom, #1d1c25, #431e3f);\n  background-repeat: no-repeat;\n  height: 100vh;\n  display: flex;\n  overflow-x: hidden !important;\n  justify-content: center;\n  position: relative;\n  background-size: cover; }\n  .homepage__center {\n    align-self: center;\n    display: flex;\n    flex-direction: column; }\n    @media only screen and (max-width: 28.125em) {\n      .homepage__center {\n        margin-top: -12rem; } }\n  @media only screen and (max-width: 40.625em) {\n    .homepage__center-heading-wrapper {\n      margin: 0 auto 0.5rem auto;\n      width: 75%;\n      display: flex;\n      justify-content: center;\n      text-align: center; } }\n  .homepage__search {\n    position: relative; }\n  .homepage__search-input {\n    padding: 1.2rem 1.4rem 1.2rem 6.2rem;\n    font-size: 3rem;\n    background-color: #242031;\n    color: #d7d7d7;\n    border-radius: 4px;\n    box-shadow: 0px 0px 0px 2px rgba(0, 0, 0, 0.5);\n    width: 100%;\n    border: 1px solid rgba(255, 255, 255, 0.5); }\n    .homepage__search-input::placeholder {\n      text-align: center; }\n    @media only screen and (max-width: 40.625em) {\n      .homepage__search-input {\n        width: 80%;\n        margin-left: 10%; } }\n  .homepage__search-btn {\n    position: absolute;\n    left: 6rem;\n    top: 2rem; }\n    @media only screen and (max-width: 40.625em) {\n      .homepage__search-btn {\n        left: 12rem; } }\n    @media only screen and (max-width: 28.125em) {\n      .homepage__search-btn {\n        left: 10rem; } }\n  .homepage__icon-sizing--search {\n    width: 3rem;\n    height: 3rem;\n    transform: translateX(-150%); }\n  .homepage__icon-path {\n    fill: #bfbfbf; }\n  .homepage__links {\n    display: flex;\n    justify-content: center; }\n    @media only screen and (max-width: 40.625em) {\n      .homepage__links {\n        flex-direction: column; } }\n    @media only screen and (max-width: 28.125em) {\n      .homepage__links {\n        margin-left: 7.5%; } }\n  .homepage__link {\n    text-decoration: none;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    border-color: rgba(255, 255, 255, 0.6);\n    border-radius: 3px;\n    color: #fff;\n    margin-top: 0.6rem;\n    margin-right: 3rem;\n    cursor: pointer;\n    line-height: 1.4;\n    padding: 0.2rem 1rem 0 1rem;\n    height: 2.8rem;\n    transition: all 0.2s;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06);\n    min-width: 9rem;\n    text-align: center; }\n    @media only screen and (max-width: 40.625em) {\n      .homepage__link {\n        align-self: center;\n        width: 14.5rem; } }\n    .homepage__link:hover {\n      background-color: rgba(255, 255, 255, 0.09); }\n\n.inventory-details {\n  grid-column: 1 / -1;\n  border-bottom: 1px solid rgba(99, 68, 150, 0.1);\n  background-color: #f6f4fa;\n  color: #535353;\n  padding: 1rem 16%;\n  margin-bottom: 2rem;\n  position: relative;\n  display: flex;\n  justify-content: space-between; }\n  .inventory-details__link {\n    text-decoration: none;\n    color: rgba(83, 83, 83, 0.75);\n    transition: all 0.2s;\n    padding: 0 0.6rem;\n    border-left: 1px solid #535353;\n    border-right: 1px solid #535353; }\n    .inventory-details__link:hover {\n      color: #535353; }\n  .inventory-details span {\n    color: #006885; }\n\n.homepage__colage,\n.cardpage__colage {\n  position: absolute;\n  overflow: hidden;\n  left: 0;\n  height: 15rem;\n  width: 100%; }\n\n.homepage__colage {\n  bottom: 0; }\n\n.cardpage__colage {\n  bottom: -2.6rem; }\n\n.homepage__colage-inner,\n.cardpage__colage-inner {\n  position: relative;\n  height: 100%;\n  margin-left: 50%;\n  transform: translateX(-50%);\n  width: 65.5rem; }\n\n.homepage__colage-card,\n.cardpage__colage-card {\n  width: 16.8rem;\n  height: 23.4rem;\n  position: absolute;\n  border-radius: 5% / 3.75%;\n  transform: translateY(0);\n  transition: all 0.3s;\n  box-shadow: inset 0 0 3px 3px #000; }\n  .homepage__colage-card:nth-child(1),\n  .cardpage__colage-card:nth-child(1) {\n    top: 2.2rem; }\n  .homepage__colage-card:nth-child(2),\n  .cardpage__colage-card:nth-child(2) {\n    top: 6.2rem;\n    left: 3.5rem; }\n  .homepage__colage-card:nth-child(3),\n  .cardpage__colage-card:nth-child(3) {\n    top: 1rem;\n    left: 17.4rem; }\n  .homepage__colage-card:nth-child(4),\n  .cardpage__colage-card:nth-child(4) {\n    top: 4.5rem;\n    left: 20.6rem; }\n  .homepage__colage-card:nth-child(5),\n  .cardpage__colage-card:nth-child(5) {\n    top: 1.6rem;\n    left: 34.7rem; }\n  .homepage__colage-card:nth-child(6),\n  .cardpage__colage-card:nth-child(6) {\n    top: 6.5rem;\n    left: 38rem; }\n  .homepage__colage-card:nth-child(7),\n  .cardpage__colage-card:nth-child(7) {\n    top: 3.5rem;\n    right: 0; }\n  .homepage__colage-card:hover,\n  .cardpage__colage-card:hover {\n    transform: translateY(-5%); }\n\n.container {\n  display: grid;\n  grid-template-columns: [full-start] minmax(6rem, 1fr) [center-start] repeat(8, [col-start] minmax(min-content, 14rem) [col-end]) [center-end] minmax(6rem, 1fr) [full-end];\n  background-color: #f5f6f7;\n  background-size: cover;\n  position: relative; }\n\n.search {\n  grid-column: full-start / full-end;\n  background-color: #fff; }\n\n.api-results-display {\n  grid-column: full-start / full-end;\n  background-color: #f5f6f7;\n  background-size: cover;\n  display: grid; }\n", "",{"version":3,"sources":["webpack://./src/css/style.css"],"names":[],"mappings":"AAAA;;;EAGE,SAAS;EACT,UAAU;EACV,mBAAmB,EAAE;;AAEvB;EACE,gBAAgB,EAAE;;AAEpB;EACE,sBAAsB;EACtB,iBAAiB;EACjB,sBAAsB;EACtB,4BAA4B;EAC5B,gBAAgB;EAChB,+BAA+B;EAC/B,kBAAkB,EAAE;;AAEtB;EACE,wBAAwB,EAAE;;AAE5B;EACE,iBAAiB;EACjB,yBAAyB,EAAE;EAC3B;IACE,WAAW,EAAE;;AAEjB;EACE,eAAe;EACf,yBAAyB;EACzB,gBAAgB;EAChB,WAAW,EAAE;;AAEf;EACE,mBAAmB,EAAE;;AAEvB;EACE,mBAAmB,EAAE;;AAEvB;EACE,gBAAgB,EAAE;;AAEpB;EACE,oBAAoB;EACpB,oBAAoB;EACpB,yBAAyB;EACzB,gBAAgB;EAChB,qBAAqB,EAAE;;AAEzB;EACE,aAAa;EACb,2BAA2B;EAC3B,4CAA4C,EAAE;;AAEhD;;EAEE,gCAAgC;EAChC,YAAY;EACZ,qDAAqD;EACrD,4BAA4B;EAC5B,sBAAsB;EACtB,aAAa;EACb,uBAAuB;EACvB,mBAAmB,EAAE;EACrB;;IAEE,kBAAkB;IAClB,mBAAmB;IACnB,cAAc;IACd,aAAa;IACb,SAAS,EAAE;EACb;;IAEE,kBAAkB;IAClB,yBAAyB;IACzB,yBAAyB;IACzB,2CAA2C;IAC3C,gBAAgB;IAChB,aAAa;IACb,wBAAwB;IACxB,mBAAmB;IACnB,wBAAwB;IACxB,2BAA2B,EAAE;EAC/B;;IAEE,WAAW;IACX,iBAAiB;IACjB,kBAAkB;IAClB,mBAAmB;IACnB,UAAU,EAAE;EACd;;IAEE,UAAU,EAAE;EACd;;IAEE,WAAW;IACX,cAAc;IACd,0CAA0C;IAC1C,oCAAoC;IACpC,8BAA8B;IAC9B,kBAAkB;IAClB,mBAAmB;IACnB,iBAAiB;IACjB,kBAAkB;IAClB,cAAc;IACd,oBAAoB;IACpB,iBAAiB;IACjB,gCAAgC,EAAE;IAClC;;MAEE,gBAAgB;MAChB,cAAc;MACd,iBAAiB,EAAE;IACrB;;MAEE,2CAA2C,EAAE;EACjD;;IAEE,UAAU;IACV,kBAAkB;IAClB,iBAAiB;IACjB,wBAAwB;IACxB,yCAAyC;IACzC,eAAe;IACf,aAAa;IACb,6BAA6B;IAC7B,mBAAmB;IACnB,cAAc,EAAE;IAChB;;MAEE,2CAA2C;MAC3C,cAAc;MACd,sBAAsB,EAAE;MACxB;;QAEE,sBAAsB;QACtB,cAAc,EAAE;MAClB;;QAEE,aAAa,EAAE;MACjB;;QAEE,8BAA8B,EAAE;IACpC;;MAEE,qBAAqB;MACrB,0CAA0C;MAC1C,2CAA2C;MAC3C,gCAAgC,EAAE;MAClC;;QAEE,2CAA2C;QAC3C,WAAW,EAAE;MACf;;QAEE,UAAU,EAAE;IAChB;;MAEE,kBAAkB,EAAE;EACxB;;IAEE,cAAc;IACd,aAAa;IACb,0BAA0B,EAAE;EAC9B;;IAEE,aAAa,EAAE;EACjB;;IAEE,UAAU,EAAE;EACd;;IAEE,UAAU;IACV,qBAAqB;IACrB,qDAAqD,EAAE;;AAE3D;EACE,aAAa;EACb,mBAAmB;EACnB,iBAAiB;EACjB,yBAAyB;EACzB,6BAA6B,EAAE;EAC/B;IACE;MACE,oBAAoB,EAAE,EAAE;EAC5B;IACE;MACE,aAAa,EAAE,EAAE;EACrB;IACE,aAAa;IACb,aAAa,EAAE;EACjB;IACE,aAAa;IACb,4BAA4B;IAC5B,2BAA2B;IAC3B,kBAAkB;IAClB,iBAAiB,EAAE;IACnB;MACE;QACE,aAAa,EAAE,EAAE;IACrB;MACE,kBAAkB,EAAE;EACxB;IACE,aAAa,EAAE;IACf;MACE;QACE,aAAa,EAAE,EAAE;EACvB;IACE,kBAAkB,EAAE;EACtB;IACE,qBAAqB;IACrB,gCAAgC;IAChC,oBAAoB,EAAE;IACtB;MACE,kBAAkB;MAClB,WAAW;MACX,6BAA6B,EAAE;IACjC;MACE,UAAU,EAAE;EAChB;IACE,aAAa;IACb,uBAAuB;IACvB,mBAAmB;IACnB,kBAAkB,EAAE;IACpB;MACE,YAAY;MACZ,kBAAkB;MAClB,yBAAyB;MACzB,sCAAsC;MACtC,WAAW,EAAE;MACb;QACE,gCAAgC,EAAE;MACpC;QACE,aAAa,EAAE;IACnB;MACE,eAAe;MACf,kBAAkB;MAClB,UAAU;MACV,SAAS,EAAE;MACX;QACE,UAAU,EAAE;EAClB;IACE,WAAW;IACX,YAAY,EAAE;EAChB;IACE,WAAW;IACX,YAAY;IACZ,4BAA4B,EAAE;EAChC;IACE,+BAA+B,EAAE;EACnC;IACE,aAAa,EAAE;EACjB;IACE,aAAa,EAAE;IACf;MACE;QACE,aAAa;QACb,aAAa;QACb,mBAAmB;QACnB,oBAAoB,EAAE,EAAE;IAC5B;MACE,yBAAyB;MACzB,eAAe;MACf,eAAe;MACf,2BAA2B;MAC3B,aAAa,EAAE;IACjB;MACE,aAAa;MACb,wCAAwC;MACxC,sCAAsC;MACtC,0CAA0C;MAC1C,kBAAkB;MAClB,kBAAkB;MAClB,eAAe;MACf,qBAAqB;MACrB,WAAW;MACX,eAAe;MACf,gBAAgB;MAChB,2BAA2B;MAC3B,cAAc;MACd,oBAAoB;MACpB,2CAA2C;MAC3C,kBAAkB;MAClB,oBAAoB,EAAE;MACtB;QACE,2CAA2C,EAAE;IACjD;MACE,aAAa;MACb,mBAAmB;MACnB,kBAAkB;MAClB,YAAY;MACZ,WAAW,EAAE;IACf;MACE,kBAAkB,EAAE;MACpB;QACE,WAAW;QACX,WAAW;QACX,2CAA2C;QAC3C,qBAAqB,EAAE;MACzB;QACE,WAAW;QACX,kBAAkB;QAClB,OAAO,EAAE;MACX;QACE,mBAAmB,EAAE;MACvB;QACE,kBAAkB,EAAE;;AAE5B;EACE,gBAAgB;EAChB,kBAAkB;EAClB,yBAAyB;EACzB,mBAAmB;EACnB,aAAa;EACb,eAAe;EACf,sCAAsC;EACtC,gBAAgB,EAAE;;AAEpB;EACE,mBAAmB;EACnB,yBAAyB;EACzB,gCAAgC,EAAE;EAClC;IACE;MACE,mBAAmB,EAAE,EAAE;EAC3B;IACE;MACE,kBAAkB,EAAE,EAAE;EAC1B;IACE;MACE,kBAAkB,EAAE,EAAE;EAC1B;IACE,UAAU;IACV,aAAa;IACb,mBAAmB;IACnB,uBAAuB;IACvB,6BAA6B;IAC7B,2CAA2C,EAAE;IAC7C;MACE;QACE,WAAW,EAAE,EAAE;IACnB;MACE;QACE,sBAAsB,EAAE,EAAE;IAC9B;MACE,mBAAmB,EAAE;IACvB;MACE,mBAAmB,EAAE;EACzB;IACE,aAAa;IACb,aAAa;IACb,uBAAuB;IACvB,gBAAgB;IAChB,kBAAkB;IAClB,cAAc,EAAE;IAChB;MACE;QACE,qBAAqB;QACrB,iBAAiB,EAAE,EAAE;EAC3B;IACE,aAAa,EAAE;IACf;MACE;QACE,cAAc;QACd,WAAW,EAAE,EAAE;EACrB;IACE,aAAa,EAAE;IACf;MACE;QACE,cAAc;QACd,WAAW,EAAE,EAAE;EACrB;IACE,eAAe;IACf,gBAAgB;IAChB,UAAU,EAAE;EACd;IACE,YAAY;IACZ,YAAY;IACZ,mBAAmB;IACnB,aAAa;IACb,yBAAyB;IACzB,kBAAkB,EAAE;IACpB;MACE;QACE,YAAY,EAAE,EAAE;IACpB;MACE;QACE,YAAY,EAAE,EAAE;IACpB;MACE,sBAAsB,EAAE;EAC5B;IACE,yBAAyB;IACzB,cAAc;IACd,kBAAkB;IAClB,oBAAoB;IACpB,qBAAqB;IACrB,2CAA2C,EAAE;IAC7C;MACE,kBAAkB,EAAE;IACtB;MACE;QACE,cAAc,EAAE,EAAE;EACxB;IACE,aAAa;IACb,mBAAmB,EAAE;EACvB;IACE,aAAa,EAAE;IACf;MACE;QACE,sBAAsB,EAAE,EAAE;EAChC;IACE;MACE,kBAAkB,EAAE,EAAE;EAC1B;IACE,aAAa,EAAE;IACf;MACE;QACE,sBAAsB,EAAE,EAAE;EAChC;IACE;MACE,kBAAkB,EAAE,EAAE;EAC1B;IACE,kBAAkB,EAAE;EACtB;IACE,cAAc;IACd,eAAe;IACf,oBAAoB,EAAE;IACtB;MACE;QACE,qBAAqB,EAAE,EAAE;EAC/B;IACE,aAAa;IACb,mBAAmB,EAAE;EACvB;IACE,mBAAmB;IACnB,cAAc;IACd,kBAAkB;IAClB,yBAAyB;IACzB,kBAAkB;IAClB,2CAA2C;IAC3C,0BAA0B;IAC1B,cAAc;IACd,iBAAiB;IACjB,cAAc;IACd,wBAAwB;IACxB,qBAAqB;IACrB,iBAAiB;IACjB,yDAA+D;IAC/D,4BAA4B;IAC5B,wCAAwC;IACxC,4BAA4B;IAC5B,sBAAsB,EAAE;IACxB;MACE;QACE,oBAAoB,EAAE,EAAE;IAC5B;MACE;QACE,cAAc,EAAE,EAAE;IACtB;MACE;QACE,cAAc,EAAE,EAAE;EACxB;IACE,YAAY;IACZ,WAAW;IACX,kBAAkB,EAAE;EACtB;IACE,aAAa,EAAE;EACjB;IACE,gBAAgB;IAChB,SAAS;IACT,WAAW;IACX,aAAa;IACb,mBAAmB;IACnB,wCAAwC;IACxC,uBAAuB;IACvB,6BAA6B;IAC7B,yBAAyB;IACzB,UAAU,EAAE;EACd;IACE,kBAAkB;IAClB,eAAe;IACf,yBAAyB;IACzB,wCAAwC;IACxC,cAAc;IACd,gBAAgB;IAChB,oBAAoB;IACpB,gBAAgB,EAAE;IAClB;MACE,eAAe;MACf,sBAAsB,EAAE;EAC5B;IACE,aAAa;IACb,sBAAsB,EAAE;EAC1B;IACE,aAAa;IACb,sBAAsB;IACtB,gBAAgB;IAChB,qBAAqB,EAAE;EACzB;IACE,aAAa;IACb,qBAAqB,EAAE;EACzB;IACE,aAAa;IACb,uBAAuB;IACvB,mBAAmB;IACnB,eAAe;IACf,YAAY;IACZ,WAAW;IACX,iBAAiB;IACjB,yBAAyB;IACzB,oBAAoB,EAAE;EACxB;IACE,YAAY;IACZ,cAAc;IACd,aAAa;IACb,uBAAuB;IACvB,mBAAmB;IACnB,eAAe;IACf,iBAAiB;IACjB,oBAAoB,EAAE;IACtB;MACE,yBAAyB,EAAE;IAC7B;MACE,yBAAyB,EAAE;EAC/B;IACE,kBAAkB;IAClB,iBAAiB;IACjB,sBAAsB;IACtB,UAAU;IACV,SAAS;IACT,YAAY;IACZ,iBAAiB;IACjB,gBAAgB;IAChB,sBAAsB,EAAE;IACxB;MACE,gBAAgB,EAAE;MAClB;QACE,eAAe,EAAE;MACnB;QACE,oBAAoB;QACpB,aAAa;QACb,mBAAmB,EAAE;QACrB;UACE,eAAe,EAAE;QACnB;UACE,yBAAyB,EAAE;QAC7B;UACE,yBAAyB;UACzB,iBAAiB,EAAE;MACvB;QACE,WAAW;QACX,YAAY;QACZ,oBAAoB,EAAE;;AAE9B;EACE,kBAAkB,EAAE;;AAEtB;EACE,kBAAkB;EAClB,SAAS;EACT,QAAQ;EACR,UAAU,EAAE;;AAEd;EACE,kBAAkB,EAAE;;AAEtB;EACE,yBAAyB;EACzB,+CAA+C;EAC/C,WAAW;EACX,aAAa;EACb,8BAA8B;EAC9B,mBAAmB;EACnB,qBAAqB;EACrB,cAAc,EAAE;EAChB;IACE;MACE,oBAAoB,EAAE,EAAE;EAC5B;IACE;MACE,aAAa,EAAE,EAAE;EACrB;IACE,cAAc;IACd,kBAAkB;IAClB,wCAAwC;IACxC,kBAAkB;IAClB,2CAA2C;IAC3C,+BAA+B;IAC/B,cAAc;IACd,cAAc;IACd,iBAAiB;IACjB,cAAc;IACd,wBAAwB;IACxB,qBAAqB;IACrB,iBAAiB;IACjB,yDAA+D;IAC/D,4BAA4B;IAC5B,wCAAwC;IACxC,4BAA4B,EAAE;IAC9B;MACE,eAAe;MACf,sBAAsB,EAAE;EAC5B;IACE,cAAc,EAAE;EAClB;IACE,kBAAkB;IAClB,yBAAyB;IACzB,wCAAwC;IACxC,cAAc;IACd,gBAAgB;IAChB,oBAAoB;IACpB,cAAc;IACd,+BAA+B;IAC/B,iBAAiB;IACjB,cAAc;IACd,kBAAkB;IAClB,2CAA2C,EAAE;IAC7C;MACE,eAAe;MACf,sBAAsB,EAAE;EAC5B;IACE,aAAa;IACb,mBAAmB,EAAE;EACvB;IACE,aAAa;IACb,mBAAmB;IACnB,yBAAyB;IACzB,wCAAwC;IACxC,cAAc;IACd,sBAAsB;IACtB,eAAe;IACf,cAAc;IACd,2CAA2C,EAAE;IAC7C;MACE,kBAAkB,EAAE;IACtB;MACE,kBAAkB,EAAE;IACtB;MACE,iBAAiB,EAAE;IACrB;MACE,mBAAmB;MACnB,0BAA0B;MAC1B,yBAAyB,EAAE;IAC7B;MACE;QACE,SAAS,EAAE,EAAE;EACnB;IACE,YAAY;IACZ,WAAW,EAAE;EACf;IACE,aAAa,EAAE;;AAEnB;EACE,WAAW;EACX,+CAA+C;EAC/C,yBAAyB;EACzB,cAAc;EACd,iBAAiB;EACjB,mBAAmB;EACnB,cAAc,EAAE;EAChB;IACE;MACE,kBAAkB,EAAE,EAAE;;AAE5B;EACE,yBAAyB;EACzB,+CAA+C;EAC/C,8BAA8B;EAC9B,qBAAqB;EACrB,cAAc;EACd,aAAa,EAAE;EACf;IACE;MACE,aAAa;MACb,oBAAoB,EAAE,EAAE;EAC5B;IACE;MACE,eAAe,EAAE,EAAE;EACvB;IACE,aAAa;IACb,cAAc,EAAE;;AAEpB;EACE,yBAAyB;EACzB,+CAA+C;EAC/C,sBAAsB;EACtB,uBAAuB;EACvB,iBAAiB;EACjB,aAAa,EAAE;;AAEjB;EACE,aAAa;EACb,8BAA8B;EAC9B,UAAU;EACV,wBAAwB,EAAE;EAC1B;IACE;MACE,UAAU,EAAE,EAAE;EAClB;IACE;MACE,UAAU,EAAE,EAAE;EAClB;IACE;MACE,UAAU,EAAE,EAAE;EAClB;IACE,kBAAkB,EAAE;;AAExB;EACE,YAAY,EAAE;EACd;IACE;MACE,YAAY,EAAE,EAAE;;AAEtB;EACE,kBAAkB,EAAE;;AAEtB;EACE,kBAAkB;EAClB,kBAAkB;EAClB,kBAAkB;EAClB,aAAa;EACb,cAAc;EACd,UAAU,EAAE;EACZ;IACE;MACE,UAAU,EAAE,EAAE;;AAEpB;EACE,WAAW;EACX,oBAAoB,EAAE;EACtB;IACE,aAAa;IACb,YAAY,EAAE;IACd;MACE,sDAAsD,EAAE;IAC1D;MACE,qCAAqC,EAAE;IACzC;MACE,6BAA6B;MAC7B,cAAc;MACd,yBAAyB;MACzB,4BAA4B;MAC5B,2BAA2B,EAAE;IAC/B;MACE,yBAAyB,EAAE;IAC7B;MACE,yBAAyB,EAAE;IAC7B;MACE,cAAc,EAAE;EACpB;IACE,WAAW;IACX,aAAa;IACb,iBAAiB;IACjB,2BAA2B;IAC3B,iBAAiB,EAAE;IACnB;MACE,yBAAyB;MACzB,oBAAoB,EAAE;IACxB;MACE,2BAA2B,EAAE;IAC/B;MACE,0BAA0B,EAAE;EAChC;IACE,eAAe;IACf,cAAc;IACd,qBAAqB;IACrB,WAAW;IACX,WAAW;IACX,mBAAmB;IACnB,gBAAgB;IAChB,uBAAuB,EAAE;IACzB;MACE,cAAc,EAAE;;AAEtB;EACE,kBAAkB;EAClB,UAAU;EACV,YAAY;EACZ,aAAa,EAAE;EACf;IACE,WAAW;IACX,YAAY,EAAE;;AAElB;EACE,UAAU,EAAE;;AAEd;EACE,YAAY,EAAE;;AAEhB;EACE,iBAAiB;EACjB,aAAa;EACb,8BAA8B;EAC9B,eAAe,EAAE;EACjB;IACE;MACE,kBAAkB,EAAE,EAAE;EAC1B;IACE;MACE,qBAAqB,EAAE,EAAE;EAC7B;IACE,kBAAkB;IAClB,YAAY,EAAE;EAChB;IACE,mBAAmB;IACnB,WAAW;IACX,YAAY,EAAE;EAChB;IACE,WAAW;IACX,YAAY;IACZ,kBAAkB;IAClB,MAAM;IACN,OAAO;IACP,2BAA2B;IAC3B,gBAAgB;IAChB,yBAAyB,EAAE;IAC3B;MACE,0BAA0B,EAAE;EAChC;IACE,kBAAkB;IAClB,QAAQ;IACR,SAAS;IACT,aAAa;IACb,cAAc;IACd,kBAAkB;IAClB,0CAA0C;IAC1C,yBAAyB;IACzB,oBAAoB;IACpB,aAAa;IACb,uBAAuB;IACvB,mBAAmB,EAAE;IACrB;MACE,eAAe;MACf,sBAAsB,EAAE;EAC5B;IACE,cAAc;IACd,aAAa;IACb,oBAAoB,EAAE;EACxB;IACE,cAAc,EAAE;EAClB;IACE,WAAW;IACX,YAAY,EAAE;EAChB;IACE,WAAW;IACX,YAAY;IACZ,2CAA2C;IAC3C,2BAA2B,EAAE;EAC/B;IACE,qBAAqB;IACrB,aAAa;IACb,YAAY;IACZ,qBAAqB;IACrB,sBAAsB;IACtB,uBAAuB;IACvB,wBAAwB;IACxB,cAAc,EAAE;IAChB;MACE;QACE,aAAa,EAAE,EAAE;IACrB;MACE;QACE,aAAa,EAAE,EAAE;;AAEzB;EACE,WAAW;EACX,cAAc;EACd,aAAa;EACb,gBAAgB;EAChB,sBAAsB;EACtB,4CAA4C,EAAE;EAC9C;IACE,UAAU;IACV,mBAAmB,EAAE;EACvB;IACE,YAAY;IACZ,aAAa;IACb,0CAA0C;IAC1C,2BAA2B,EAAE;EAC/B;IACE,YAAY;IACZ,aAAa;IACb,sBAAsB;IACtB,UAAU,EAAE;EACd;IACE,kBAAkB;IAClB,gBAAgB;IAChB,cAAc;IACd,iBAAiB;IACjB,gBAAgB;IAChB,cAAc;IACd,yBAAyB;IACzB,wCAAwC;IACxC,kBAAkB;IAClB,uCAAuC;IACvC,oBAAoB;IACpB,sBAAsB;IACtB,kBAAkB;IAClB,aAAa;IACb,mBAAmB,EAAE;IACrB;MACE,eAAe;MACf,sBAAsB;MACtB,qBAAqB,EAAE;EAC3B;IACE,cAAc;IACd,aAAa;IACb,oBAAoB;IACpB,oBAAoB,EAAE;EACxB;IACE,aAAa,EAAE;EACjB;IACE,kBAAkB,EAAE;EACtB;IACE,mBAAmB;IACnB,aAAa,EAAE;EACjB;IACE,YAAY;IACZ,aAAa;IACb,kBAAkB;IAClB,MAAM;IACN,OAAO;IACP,2BAA2B;IAC3B,gBAAgB,EAAE;IAClB;MACE,0BAA0B,EAAE;EAChC;IACE,sBAAsB;IACtB,kBAAkB;IAClB,qCAAqC;IACrC,0BAA0B;IAC1B,6BAA6B;IAC7B,gBAAgB;IAChB,YAAY;IACZ,aAAa;IACb,sBAAsB;IACtB,aAAa;IACb,kBAAkB;IAClB,kBAAkB,EAAE;IACpB;MACE,mBAAmB;MACnB,gCAAgC,EAAE;IACpC;MACE,aAAa;MACb,mBAAmB,EAAE;MACrB;QACE,iBAAiB;QACjB,gBAAgB;QAChB,kBAAkB,EAAE;IACxB;MACE,aAAa;MACb,cAAc;MACd,sBAAsB;MACtB,kBAAkB;MAClB,8CAA8C;MAC9C,oBAAoB;MACpB,qBAAqB,EAAE;MACvB;QACE,0CAA0C,EAAE;MAC9C;QACE,oCAAoC,EAAE;MACxC;QACE,wCAAwC,EAAE;MAC5C;QACE,0CAA0C,EAAE;MAC9C;QACE,sCAAsC,EAAE;IAC5C;MACE,mBAAmB;MACnB,iBAAiB,EAAE;IACrB;MACE,iBAAiB;MACjB,kBAAkB,EAAE;IACtB;MACE,iBAAiB;MACjB,kBAAkB,EAAE;IACtB;MACE,aAAa;MACb,mBAAmB;MACnB,8BAA8B,EAAE;MAChC;QACE,aAAa;QACb,sBAAsB,EAAE;MAC1B;QACE,aAAa;QACb,mBAAmB;QACnB,iBAAiB,EAAE;QACnB;UACE,qBAAqB,EAAE;MAC3B;QACE,WAAW;QACX,cAAc;QACd,oBAAoB;QACpB,eAAe;QACf,yBAAyB;QACzB,aAAa;QACb,uBAAuB;QACvB,mBAAmB;QACnB,kBAAkB,EAAE;QACpB;UACE,yBAAyB,EAAE;QAC7B;UACE,yBAAyB,EAAE;MAC/B;QACE,WAAW,EAAE;EACnB;IACE,aAAa;IACb,sBAAsB,EAAE;IACxB;MACE,aAAa;MACb,yBAAyB;MACzB,YAAY;MACZ,yBAAyB;MACzB,cAAc;MACd,eAAe;MACf,kBAAkB,EAAE;MACpB;QACE,kBAAkB,EAAE;MACtB;QACE,aAAa;QACb,cAAc;QACd,oBAAoB,EAAE;IAC1B;MACE,aAAa;MACb,sBAAsB,EAAE;IAC1B;MACE,oBAAoB,EAAE;IACxB;MACE,yBAAyB,EAAE;IAC7B;MACE,aAAa;MACb,8BAA8B;MAC9B,yBAAyB;MACzB,cAAc;MACd,iBAAiB;MACjB,yBAAyB;MACzB,yBAAyB;MACzB,kBAAkB;MAClB,sBAAsB,EAAE;IAC1B;MACE,cAAc;MACd,aAAa;MACb,yBAAyB;MACzB,aAAa;MACb,uBAAuB;MACvB,mBAAmB;MACnB,mBAAmB,EAAE;IACvB;MACE,UAAU,EAAE;IACd;MACE,aAAa,EAAE;IACjB;MACE,aAAa,EAAE;IACjB;MACE,aAAa,EAAE;IACjB;MACE,gBAAgB;MAChB,kBAAkB,EAAE;MACpB;QACE,qBAAqB;QACrB,WAAW,EAAE;MACf;QACE,aAAa;QACb,8BAA8B;QAC9B,eAAe;QACf,gCAAgC;QAChC,8BAA8B;QAC9B,sBAAsB;QACtB,kBAAkB,EAAE;QACpB;UACE,oBAAoB;UACpB,6BAA6B,EAAE;QACjC;UACE,yBAAyB,EAAE;MAC/B;QACE,aAAa;QACb,mBAAmB;QACnB,kBAAkB,EAAE;MACtB;QACE,mBAAmB,EAAE;MACvB;QACE,oBAAoB;QACpB,cAAc,EAAE;;AAExB;EACE,aAAa;EACb,sBAAsB;EACtB,mBAAmB;EACnB,kBAAkB,EAAE;;AAEtB;;EAEE,gBAAgB;EAChB,UAAU;EACV,gBAAgB;EAChB,2BAA2B;EAC3B,aAAa;EACb,sBAAsB,EAAE;EACxB;;IAEE,cAAc;IACd,iBAAiB;IACjB,gBAAgB;IAChB,wBAAwB,EAAE;EAC5B;;IAEE,aAAa;IACb,sBAAsB,EAAE;IACxB;;MAEE,YAAY;MACZ,cAAc;MACd,mBAAmB;MACnB,aAAa;MACb,yBAAyB;MACzB,kBAAkB,EAAE;MACpB;;QAEE,sBAAsB,EAAE;IAC5B;;MAEE,aAAa;MACb,6BAA6B;MAC7B,qBAAqB;MACrB,qBAAqB;MACrB,kBAAkB,EAAE;IACtB;;MAEE,oBAAoB;MACpB,aAAa;MACb,qBAAqB;MACrB,uBAAuB;MACvB,cAAc;MACd,mBAAmB,EAAE;EACzB;;IAEE,kBAAkB;IAClB,eAAe;IACf,UAAU;IACV,UAAU,EAAE;EACd;;IAEE,kBAAkB;IAClB,cAAc;IACd,iBAAiB;IACjB,gBAAgB;IAChB,cAAc;IACd,yBAAyB;IACzB,wCAAwC;IACxC,kBAAkB;IAClB,uCAAuC;IACvC,oBAAoB;IACpB,uBAAuB;IACvB,kBAAkB;IAClB,aAAa;IACb,mBAAmB;IACnB,mBAAmB,EAAE;IACrB;;MAEE,eAAe;MACf,sBAAsB;MACtB,qBAAqB,EAAE;;AAE7B;;EAEE,WAAW;EACX,gBAAgB,EAAE;;AAEpB;EACE,oBAAoB,EAAE;;AAExB;EACE,wDAAwD;EACxD,4BAA4B;EAC5B,aAAa;EACb,aAAa;EACb,6BAA6B;EAC7B,uBAAuB;EACvB,kBAAkB;EAClB,sBAAsB,EAAE;EACxB;IACE,kBAAkB;IAClB,aAAa;IACb,sBAAsB,EAAE;IACxB;MACE;QACE,kBAAkB,EAAE,EAAE;EAC5B;IACE;MACE,0BAA0B;MAC1B,UAAU;MACV,aAAa;MACb,uBAAuB;MACvB,kBAAkB,EAAE,EAAE;EAC1B;IACE,kBAAkB,EAAE;EACtB;IACE,oCAAoC;IACpC,eAAe;IACf,yBAAyB;IACzB,cAAc;IACd,kBAAkB;IAClB,8CAA8C;IAC9C,WAAW;IACX,0CAA0C,EAAE;IAC5C;MACE,kBAAkB,EAAE;IACtB;MACE;QACE,UAAU;QACV,gBAAgB,EAAE,EAAE;EAC1B;IACE,kBAAkB;IAClB,UAAU;IACV,SAAS,EAAE;IACX;MACE;QACE,WAAW,EAAE,EAAE;IACnB;MACE;QACE,WAAW,EAAE,EAAE;EACrB;IACE,WAAW;IACX,YAAY;IACZ,4BAA4B,EAAE;EAChC;IACE,aAAa,EAAE;EACjB;IACE,aAAa;IACb,uBAAuB,EAAE;IACzB;MACE;QACE,sBAAsB,EAAE,EAAE;IAC9B;MACE;QACE,iBAAiB,EAAE,EAAE;EAC3B;IACE,qBAAqB;IACrB,wCAAwC;IACxC,sCAAsC;IACtC,kBAAkB;IAClB,WAAW;IACX,kBAAkB;IAClB,kBAAkB;IAClB,eAAe;IACf,gBAAgB;IAChB,2BAA2B;IAC3B,cAAc;IACd,oBAAoB;IACpB,2CAA2C;IAC3C,eAAe;IACf,kBAAkB,EAAE;IACpB;MACE;QACE,kBAAkB;QAClB,cAAc,EAAE,EAAE;IACtB;MACE,2CAA2C,EAAE;;AAEnD;EACE,mBAAmB;EACnB,+CAA+C;EAC/C,yBAAyB;EACzB,cAAc;EACd,iBAAiB;EACjB,mBAAmB;EACnB,kBAAkB;EAClB,aAAa;EACb,8BAA8B,EAAE;EAChC;IACE,qBAAqB;IACrB,6BAA6B;IAC7B,oBAAoB;IACpB,iBAAiB;IACjB,8BAA8B;IAC9B,+BAA+B,EAAE;IACjC;MACE,cAAc,EAAE;EACpB;IACE,cAAc,EAAE;;AAEpB;;EAEE,kBAAkB;EAClB,gBAAgB;EAChB,OAAO;EACP,aAAa;EACb,WAAW,EAAE;;AAEf;EACE,SAAS,EAAE;;AAEb;EACE,eAAe,EAAE;;AAEnB;;EAEE,kBAAkB;EAClB,YAAY;EACZ,gBAAgB;EAChB,2BAA2B;EAC3B,cAAc,EAAE;;AAElB;;EAEE,cAAc;EACd,eAAe;EACf,kBAAkB;EAClB,yBAAyB;EACzB,wBAAwB;EACxB,oBAAoB;EACpB,kCAAkC,EAAE;EACpC;;IAEE,WAAW,EAAE;EACf;;IAEE,WAAW;IACX,YAAY,EAAE;EAChB;;IAEE,SAAS;IACT,aAAa,EAAE;EACjB;;IAEE,WAAW;IACX,aAAa,EAAE;EACjB;;IAEE,WAAW;IACX,aAAa,EAAE;EACjB;;IAEE,WAAW;IACX,WAAW,EAAE;EACf;;IAEE,WAAW;IACX,QAAQ,EAAE;EACZ;;IAEE,0BAA0B,EAAE;;AAEhC;EACE,aAAa;EACb,0KAA0K;EAC1K,yBAAyB;EACzB,sBAAsB;EACtB,kBAAkB,EAAE;;AAEtB;EACE,kCAAkC;EAClC,sBAAsB,EAAE;;AAE1B;EACE,kCAAkC;EAClC,yBAAyB;EACzB,sBAAsB;EACtB,aAAa,EAAE","sourcesContent":["*,\n*::after,\n*::before {\n  margin: 0;\n  padding: 0;\n  box-sizing: inherit; }\n\nhtml {\n  font-size: 62.5%; }\n\nbody {\n  box-sizing: border-box;\n  font-size: 1.6rem;\n  background-size: cover;\n  background-repeat: no-repeat;\n  height: 127.5rem;\n  font-family: 'Lato', sans-serif;\n  position: relative; }\n\n[hidden] {\n  display: none !important; }\n\n.heading-tertiary {\n  font-size: 2.4rem;\n  text-transform: uppercase; }\n  .heading-tertiary--white {\n    color: #fff; }\n\n.heading-primary {\n  font-size: 3rem;\n  text-transform: uppercase;\n  font-weight: 300;\n  color: #fff; }\n\n.mb-10 {\n  margin-bottom: 1rem; }\n\n.mb-20 {\n  margin-bottom: 2rem; }\n\n.mt-50 {\n  margin-top: 5rem; }\n\n.btn, .btn:link, .btn:visited {\n  padding: .75rem 2rem;\n  border-radius: .5rem;\n  background-color: #f2f2f2;\n  font-weight: 400;\n  display: inline-block; }\n\n.btn:active, .btn:focus {\n  outline: none;\n  transform: translateY(-1px);\n  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.2); }\n\n.login,\n.register {\n  min-height: calc(100vh - 6.1rem);\n  width: 100vw;\n  background: linear-gradient(to top, #5f4f66, #342332);\n  background-repeat: no-repeat;\n  background-size: cover;\n  display: flex;\n  justify-content: center;\n  align-items: center; }\n  .login-img,\n  .register-img {\n    position: absolute;\n    border-radius: 100%;\n    height: 8.5rem;\n    width: 8.5rem;\n    top: -15%; }\n  .login__form,\n  .register__form {\n    position: relative;\n    background-color: #1e2a38;\n    border: 2px solid #1e2a38;\n    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.25);\n    max-width: 32rem;\n    display: flex;\n    flex-flow: column nowrap;\n    align-items: center;\n    padding: 4rem 0 2.6rem 0;\n    transform: translateY(-25%); }\n  .login__form-instructions,\n  .register__form-instructions {\n    color: #fff;\n    font-size: 1.4rem;\n    text-align: center;\n    margin-bottom: 1rem;\n    width: 90%; }\n  .login__form-group,\n  .register__form-group {\n    width: 90%; }\n  .login__form-input,\n  .register__form-input {\n    width: 100%;\n    margin: 0 auto;\n    border: 1px solid rgba(255, 255, 255, 0.2);\n    background-color: rgba(0, 0, 0, 0.1);\n    box-shadow: rgba(0, 0, 0, 0.5);\n    border-radius: 2px;\n    margin-bottom: 1rem;\n    line-height: 1.25;\n    text-align: center;\n    height: 4.2rem;\n    padding: 1rem 1.4rem;\n    caret-color: #fff;\n    color: rgba(255, 255, 255, 0.75); }\n    .login__form-input::placeholder,\n    .register__form-input::placeholder {\n      font-weight: 300;\n      color: #e6e6e6;\n      font-size: 1.8rem; }\n    .login__form-input:focus,\n    .register__form-input:focus {\n      border: 1px solid rgba(255, 255, 255, 0.75); }\n  .login__form-btn,\n  .register__form-btn {\n    width: 90%;\n    border-radius: 2px;\n    padding: 0 1.4rem;\n    margin: 1rem auto 0 auto;\n    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25);\n    cursor: pointer;\n    display: flex;\n    justify-content: space-around;\n    align-items: center;\n    height: 4.2rem; }\n    .login__form-btn--login,\n    .register__form-btn--login {\n      background-color: rgba(255, 255, 255, 0.87);\n      color: #16161d;\n      border: 1px solid #fff; }\n      .login__form-btn--login:hover,\n      .register__form-btn--login:hover {\n        background-color: #fff;\n        color: #342442; }\n      .login__form-btn--login:hover .login__form-icon-path--login,\n      .register__form-btn--login:hover .login__form-icon-path--login {\n        fill: #342442; }\n      .login__form-btn--login::after,\n      .register__form-btn--login::after {\n        margin-bottom: 1px solid white; }\n    .login__form-btn--register,\n    .register__form-btn--register {\n      text-decoration: none;\n      background-color: rgba(255, 255, 255, 0.1);\n      border: 1px solid rgba(255, 255, 255, 0.05);\n      color: rgba(255, 255, 255, 0.75); }\n      .login__form-btn--register:hover,\n      .register__form-btn--register:hover {\n        background-color: rgba(255, 255, 255, 0.25);\n        color: #fff; }\n      .login__form-btn--register:hover .login__form-icon-path--login,\n      .register__form-btn--register:hover .login__form-icon-path--login {\n        fill: #fff; }\n    .login__form-btn span,\n    .register__form-btn span {\n      margin-right: 1rem; }\n  .login__form-icon,\n  .register__form-icon {\n    height: 1.5rem;\n    width: 1.5rem;\n    transform: translateY(17%); }\n  .login__form-icon-path--login,\n  .register__form-icon-path--login {\n    fill: #16161d; }\n  .login__form-icon-path--register,\n  .register__form-icon-path--register {\n    fill: #fff; }\n  .login__form-hr,\n  .register__form-hr {\n    width: 90%;\n    margin: 2rem 0 1rem 0;\n    margin-bottom: 0.25px solid rgba(255, 255, 255, 0.25); }\n\n.nav {\n  display: flex;\n  align-items: center;\n  padding: 1rem 16%;\n  background-color: #2b253a;\n  border-bottom: 1px solid #000; }\n  @media only screen and (max-width: 75rem) {\n    .nav {\n      padding: 1.2rem 2.5%; } }\n  @media only screen and (max-width: 43.75em) {\n    .nav {\n      padding: 1rem; } }\n  .nav__left {\n    display: flex;\n    flex: 0 0 50%; }\n  .nav__right {\n    display: flex;\n    border-right: 1px solid #fff;\n    border-left: 1px solid #fff;\n    padding-left: 1rem;\n    margin-left: auto; }\n    @media only screen and (max-width: 40.625em) {\n      .nav__right {\n        display: none; } }\n    .nav__right > * {\n      margin-right: 1rem; }\n  .nav__item--search {\n    flex: 0 0 25%; }\n    @media only screen and (max-width: 40.625em) {\n      .nav__item--search {\n        display: none; } }\n  .nav__item--home {\n    margin-right: 3rem; }\n  .nav__link {\n    text-decoration: none;\n    color: rgba(255, 255, 255, 0.75);\n    transition: all 0.2s; }\n    .nav__link:hover {\n      margin-bottom: 2px;\n      color: #fff;\n      border-bottom: 1px solid #fff; }\n    .nav__link--home:hover .nav__icon-path--home {\n      fill: #fff; }\n  .nav__search {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    position: relative; }\n    .nav__search-input {\n      border: none;\n      padding: 1rem 2rem;\n      background-color: #2b253a;\n      caret-color: rgba(255, 255, 255, 0.75);\n      color: #fff; }\n      .nav__search-input::placeholder {\n        color: rgba(255, 255, 255, 0.75); }\n      .nav__search-input:focus {\n        outline: none; }\n    .nav__search-btn {\n      cursor: pointer;\n      position: absolute;\n      left: 2rem;\n      top: 1rem; }\n      .nav__search-btn:hover .nav__icon-path--search {\n        fill: #fff; }\n  .nav__icon-sizing--home {\n    width: 3rem;\n    height: 3rem; }\n  .nav__icon-sizing--search {\n    width: 2rem;\n    height: 2rem;\n    transform: translateX(-150%); }\n  .nav__icon-path--home {\n    fill: rgba(255, 255, 255, 0.75); }\n  .nav__icon-path--search {\n    fill: #bfbfbf; }\n  .nav__mobile {\n    display: none; }\n    @media only screen and (max-width: 40.625em) {\n      .nav__mobile {\n        display: flex;\n        flex: 0 0 50%;\n        align-items: center;\n        justify-content: end; } }\n    .nav__mobile-links {\n      background-color: #2b253a;\n      flex-flow: wrap;\n      padding: 1rem 0;\n      justify-content: flex-start;\n      display: none; }\n    .nav__mobile-link {\n      flex: 0 0 48%;\n      border: 1px solid rgba(85, 26, 139, 0.5);\n      border-color: rgba(255, 255, 255, 0.6);\n      background-color: rgba(255, 255, 255, 0.1);\n      border-radius: 3px;\n      margin-top: 0.6rem;\n      margin-left: 1%;\n      text-decoration: none;\n      color: #fff;\n      cursor: pointer;\n      line-height: 1.4;\n      padding: 0.2rem 1rem 0 1rem;\n      height: 2.8rem;\n      transition: all 0.2s;\n      box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06);\n      text-align: center;\n      transition: all 0.2s; }\n      .nav__mobile-link:hover {\n        background-color: rgba(255, 255, 255, 0.25); }\n    .nav__mobile-hamburger-wrapper {\n      display: flex;\n      align-items: center;\n      margin-right: 1rem;\n      height: 3rem;\n      width: 3rem; }\n    .nav__mobile-hamburger {\n      position: relative; }\n      .nav__mobile-hamburger, .nav__mobile-hamburger::before, .nav__mobile-hamburger::after {\n        width: 3rem;\n        height: 2px;\n        background-color: rgba(255, 255, 255, 0.75);\n        display: inline-block; }\n      .nav__mobile-hamburger::before, .nav__mobile-hamburger::after {\n        content: '';\n        position: absolute;\n        left: 0; }\n      .nav__mobile-hamburger::before {\n        margin-top: -0.8rem; }\n      .nav__mobile-hamburger::after {\n        margin-top: 0.8rem; }\n\n.error {\n  margin-top: 2rem;\n  text-align: center;\n  background-color: #ff8080;\n  border-radius: 10px;\n  padding: 2rem;\n  font-size: 2rem;\n  grid-column: center-start / center-end;\n  font-weight: 700; }\n\n.search-form {\n  padding: 2rem 25rem;\n  background-color: #fdfdfd;\n  min-height: calc(100vh - 6.2rem); }\n  @media only screen and (max-width: 81.25em) {\n    .search-form {\n      padding: 2rem 15rem; } }\n  @media only screen and (max-width: 62.5em) {\n    .search-form {\n      padding: 2rem 5rem; } }\n  @media only screen and (max-width: 56.25em) {\n    .search-form {\n      padding: 2rem 1rem; } }\n  .search-form__group {\n    width: 75%;\n    display: flex;\n    margin-bottom: 3rem;\n    align-items: flex-start;\n    padding: 0.5rem 4rem 0.5rem 0;\n    border-bottom: 1px solid rgba(0, 0, 0, 0.2); }\n    @media only screen and (max-width: 93.75em) {\n      .search-form__group {\n        width: 100%; } }\n    @media only screen and (max-width: 46.875em) {\n      .search-form__group {\n        flex-direction: column; } }\n    .search-form__group:nth-child(10) {\n      border-bottom: none; }\n    .search-form__group--no-border {\n      border-bottom: none; }\n  .search-form__label {\n    flex: 0 0 20%;\n    display: flex;\n    align-items: flex-start;\n    font-weight: 300;\n    margin-top: 0.7rem;\n    color: #551a8b; }\n    @media only screen and (max-width: 46.875em) {\n      .search-form__label {\n        margin-bottom: 1.2rem;\n        margin-left: 1rem; } }\n  .search-form__group-input-wrapper {\n    flex: 0 0 80%; }\n    @media only screen and (max-width: 46.875em) {\n      .search-form__group-input-wrapper {\n        flex: 0 0 100%;\n        width: 100%; } }\n  .search-form__input-wrapper {\n    flex: 0 0 80%; }\n    @media only screen and (max-width: 46.875em) {\n      .search-form__input-wrapper {\n        flex: 0 0 100%;\n        width: 100%; } }\n  .search-form__tip {\n    font-size: 1rem;\n    line-height: 1.4;\n    width: 70%; }\n  .search-form__input-text {\n    width: 40rem;\n    height: 4rem;\n    margin-bottom: 1rem;\n    padding: 1rem;\n    border: solid 1px #bfbfbf;\n    border-radius: 5px; }\n    @media only screen and (max-width: 28.125em) {\n      .search-form__input-text {\n        width: 30rem; } }\n    @media only screen and (max-width: 21.875em) {\n      .search-form__input-text {\n        width: 20rem; } }\n    .search-form__input-text:focus {\n      border: solid 1px #000; }\n  .search-form__input-integer {\n    border: 1px solid #aeaeae;\n    height: 3.5rem;\n    border-radius: 3px;\n    padding-left: 0.5rem;\n    padding-right: 0.5rem;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06); }\n    .search-form__input-integer--relative {\n      position: relative; }\n    @media only screen and (max-width: 37.5em) {\n      .search-form__input-integer {\n        max-width: 30%; } }\n  .search-form__group--checkbox {\n    display: flex;\n    margin-bottom: 1rem; }\n  .search-form__group-colors-left, .search-form__group-colors-right {\n    display: flex; }\n    @media only screen and (max-width: 81.25em) {\n      .search-form__group-colors-left, .search-form__group-colors-right {\n        flex-direction: column; } }\n  @media only screen and (max-width: 81.25em) {\n    .search-form__group-colors-left {\n      margin-right: 3rem; } }\n  .search-form__group-rarity-left, .search-form__group-rarity-right {\n    display: flex; }\n    @media only screen and (max-width: 28.125em) {\n      .search-form__group-rarity-left, .search-form__group-rarity-right {\n        flex-direction: column; } }\n  @media only screen and (max-width: 81.25em) {\n    .search-form__group-rarity-left {\n      margin-right: 3rem; } }\n  .search-form__label--checkbox {\n    margin-right: 1rem; }\n  .search-form__input-checkbox {\n    width: 2.25rem;\n    height: 2.25rem;\n    margin-right: 0.8rem; }\n    @media only screen and (max-width: 93.75em) {\n      .search-form__input-checkbox {\n        margin-bottom: 0.3rem; } }\n  .search-form__checkbox-wrapper {\n    display: flex;\n    align-items: center; }\n  .search-form__select-menu {\n    margin-bottom: 1rem;\n    color: #343242;\n    margin-right: 1rem;\n    border: 1px solid #aeaeae;\n    border-radius: 3px;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06);\n    padding: 0 2.2rem 0 0.5rem;\n    height: 3.4rem;\n    font-size: 1.4rem;\n    text-indent: 0;\n    -webkit-appearance: none;\n    -moz-appearance: none;\n    text-overflow: '';\n    background-image: url(../../app/static/img/SVG/arrow-down2.svg);\n    background-repeat: no-repeat;\n    background-position: right 0.8rem center;\n    background-size: 1.2rem 1rem;\n    background-color: #fff; }\n    @media only screen and (max-width: 81.25em) {\n      .search-form__select-menu {\n        margin-right: 0.3rem; } }\n    @media only screen and (max-width: 37.5em) {\n      .search-form__select-menu--2 {\n        max-width: 49%; } }\n    @media only screen and (max-width: 37.5em) {\n      .search-form__select-menu--3 {\n        max-width: 32%; } }\n  .search-form__svg-size {\n    height: 2rem;\n    width: 2rem;\n    margin-right: 1rem; }\n  .search-form__svg-color {\n    fill: #551a8b; }\n  .search-form__submit-wrapper {\n    position: sticky;\n    bottom: 0;\n    width: 100%;\n    display: flex;\n    margin-bottom: 3rem;\n    border-top: 1px solid rgba(0, 0, 0, 0.2);\n    align-items: flex-start;\n    padding: 1.5rem 4rem 1.5rem 0;\n    background-color: #fdfdfd;\n    z-index: 1; }\n  .search-form__submit {\n    border-radius: 3px;\n    padding: 0.7rem;\n    background-color: #f9f7f5;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    color: #551a8b;\n    font-weight: 500;\n    transition: all 0.2s;\n    margin-left: 20%; }\n    .search-form__submit:hover {\n      cursor: pointer;\n      background-color: #fff; }\n  .search-form__dropdown-span {\n    display: flex;\n    flex-direction: column; }\n  .search-form__selected-types, .search-form__selected-sets {\n    display: flex;\n    flex-direction: column;\n    list-style: none;\n    margin-bottom: 0.3rem; }\n  .search-form__selected-types-list-item, .search-form__selected-sets-list-item {\n    display: flex;\n    margin-bottom: 0.7rem; }\n  .search-form__selected-types-remove-btn, .search-form__selected-sets-remove-btn {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    cursor: pointer;\n    height: 2rem;\n    width: 2rem;\n    font-size: 1.3rem;\n    background-color: #f2f2f2;\n    margin-right: 0.7rem; }\n  .search-form__selected-types-toggler {\n    height: 2rem;\n    width: 2.75rem;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    cursor: pointer;\n    font-size: 1.3rem;\n    margin-right: 0.7rem; }\n    .search-form__selected-types-toggler--is {\n      background-color: #47d147; }\n    .search-form__selected-types-toggler--not {\n      background-color: #ff0000; }\n  .search-form__dropdown {\n    position: absolute;\n    max-height: 28rem;\n    background-color: #fff;\n    z-index: 2;\n    top: 100%;\n    width: 40rem;\n    margin-top: -1rem;\n    overflow-y: auto;\n    border: 1px solid #000; }\n    .search-form__dropdown-list {\n      list-style: none; }\n      .search-form__dropdown-list-category {\n        padding: 0.5rem; }\n      .search-form__dropdown-list-option {\n        padding: 0.3rem 2rem;\n        display: flex;\n        align-items: center; }\n        .search-form__dropdown-list-option:hover {\n          cursor: pointer; }\n        .search-form__dropdown-list-option--highlighted {\n          background-color: #ccd8ff; }\n        .search-form__dropdown-list-option span {\n          text-transform: uppercase;\n          margin-left: 1rem; }\n      .search-form__dropdown-list-img {\n        width: 2rem;\n        height: 2rem;\n        margin-right: 0.7rem; }\n\n.dropdown-wrapper {\n  position: relative; }\n\n.inv-search-price-msg {\n  position: absolute;\n  bottom: 0;\n  right: 0;\n  color: red; }\n\n.relative {\n  position: relative; }\n\n.api-results-display__nav {\n  background-color: #f3f5f8;\n  border-bottom: 1px solid rgba(99, 68, 150, 0.1);\n  width: 100%;\n  display: flex;\n  justify-content: space-between;\n  padding: 1.2rem 16%;\n  margin-bottom: 0.1rem;\n  height: 5.2rem; }\n  @media only screen and (max-width: 75rem) {\n    .api-results-display__nav {\n      padding: 1.2rem 2.5%; } }\n  @media only screen and (max-width: 53.125em) {\n    .api-results-display__nav {\n      display: none; } }\n  .api-results-display__nav-select {\n    color: #b300b3;\n    margin-right: 1rem;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    border-radius: 3px;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06);\n    padding: 0.1rem 2.2rem 0 0.5rem;\n    color: #551a8b;\n    height: 2.8rem;\n    font-size: 1.4rem;\n    text-indent: 0;\n    -webkit-appearance: none;\n    -moz-appearance: none;\n    text-overflow: '';\n    background-image: url(../../app/static/img/SVG/arrow-down2.svg);\n    background-repeat: no-repeat;\n    background-position: right 0.8rem center;\n    background-size: 1.2rem 1rem; }\n    .api-results-display__nav-select:hover {\n      cursor: pointer;\n      background-color: #fff; }\n  .api-results-display__nav-label {\n    color: #551a8b; }\n  .api-results-display__nav-btn {\n    border-radius: 3px;\n    background-color: #f9f7f5;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    color: #551a8b;\n    font-weight: 500;\n    transition: all 0.2s;\n    height: 2.8rem;\n    padding: 0.1rem 0.7rem 0 0.7rem;\n    font-size: 1.4rem;\n    margin: auto 0;\n    text-align: center;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06); }\n    .api-results-display__nav-btn:hover {\n      cursor: pointer;\n      background-color: #fff; }\n  .api-results-display__nav-right {\n    display: flex;\n    align-items: center; }\n  .api-results-display__nav-pagination-container {\n    display: flex;\n    align-items: center;\n    background-color: #f9f7f5;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    color: #551a8b;\n    padding: 0.2rem 0.7rem;\n    cursor: pointer;\n    height: 2.8rem;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06); }\n    .api-results-display__nav-pagination-container:not(:last-child) {\n      margin-right: 1rem; }\n    .api-results-display__nav-pagination-container:nth-child(2) svg {\n      margin-right: 1rem; }\n    .api-results-display__nav-pagination-container:nth-child(3) svg {\n      margin-left: 1rem; }\n    .api-results-display__nav-pagination-container--disabled {\n      cursor: not-allowed;\n      color: rgba(0, 0, 0, 0.25);\n      background-color: #f5f6f7; }\n    @media only screen and (max-width: 31.5em) {\n      .api-results-display__nav-pagination-container {\n        margin: 0; } }\n  .api-results-display__nav-svg-size {\n    height: 2rem;\n    width: 2rem; }\n  .api-results-display__nav-svg-color {\n    fill: #551a8b; }\n\n.api-results-display__display-bar {\n  width: 100%;\n  border-bottom: 1px solid rgba(99, 68, 150, 0.1);\n  background-color: #f6f4fa;\n  color: #535353;\n  padding-left: 16%;\n  margin-bottom: 2rem;\n  height: 2.1rem; }\n  @media only screen and (max-width: 75rem) {\n    .api-results-display__display-bar {\n      padding-left: 2.5%; } }\n\n.api-results-display__mobile {\n  background-color: #f3f5f8;\n  border-bottom: 1px solid rgba(99, 68, 150, 0.1);\n  justify-content: space-between;\n  margin-bottom: 0.1rem;\n  height: 5.2rem;\n  display: none; }\n  @media only screen and (max-width: 53.125em) {\n    .api-results-display__mobile {\n      display: flex;\n      padding: 1.2rem 2.5%; } }\n  @media only screen and (max-width: 31.5em) {\n    .api-results-display__mobile {\n      padding: 1.2rem; } }\n  .api-results-display__mobile-svg-size {\n    width: 1.4rem;\n    height: 1.4rem; }\n\n.api-results-display__mobile-display-options {\n  background-color: #f3f5f8;\n  border-bottom: 1px solid rgba(99, 68, 150, 0.1);\n  flex-direction: column;\n  align-items: flex-start;\n  padding: 1.2rem 0;\n  display: none; }\n\n.api-results-display__mobile-display-options-group {\n  display: flex;\n  justify-content: space-between;\n  width: 45%;\n  margin: 0 auto 1rem auto; }\n  @media only screen and (max-width: 51.5625em) {\n    .api-results-display__mobile-display-options-group {\n      width: 60%; } }\n  @media only screen and (max-width: 37.5em) {\n    .api-results-display__mobile-display-options-group {\n      width: 80%; } }\n  @media only screen and (max-width: 28.125em) {\n    .api-results-display__mobile-display-options-group {\n      width: 95%; } }\n  .api-results-display__mobile-display-options-group label {\n    margin-right: 1rem; }\n\n.api-results-display__nav-select--mobile {\n  width: 24rem; }\n  @media only screen and (max-width: 21.875em) {\n    .api-results-display__nav-select--mobile {\n      width: 16rem; } }\n\n.api-results-mobile-display-btn {\n  align-self: center; }\n\n.wrapper {\n  overflow-x: scroll;\n  overflow-y: hidden;\n  position: relative;\n  display: flex;\n  margin: 0 auto;\n  width: 68%; }\n  @media only screen and (max-width: 75rem) {\n    .wrapper {\n      width: 905; } }\n\n.card-checklist {\n  width: 100%;\n  justify-self: center; }\n  .card-checklist__row {\n    display: grid;\n    height: 3rem; }\n    .card-checklist__row--7 {\n      grid-template-columns: 10% 22.5% 10% 17.5% 15% 15% 10%; }\n    .card-checklist__row--9 {\n      grid-template-columns: repeat(9, 1fr); }\n    .card-checklist__row--header {\n      border-bottom: 1px solid #000;\n      color: #531a8b;\n      text-transform: uppercase;\n      font-size: 1.2rem !important;\n      font-weight: 200 !important; }\n    .card-checklist__row--grey {\n      background-color: #f2f2f2; }\n    .card-checklist__row:nth-child(even) {\n      background-color: #f2f2f2; }\n    .card-checklist__row--header {\n      height: 3.5rem; }\n  .card-checklist__data {\n    width: 100%;\n    display: flex;\n    flex-wrap: nowrap;\n    justify-content: flex-start;\n    font-size: 1.4rem; }\n    .card-checklist__data--set {\n      text-transform: uppercase;\n      padding-left: 0.5rem; }\n    .card-checklist__data--name {\n      justify-content: flex-start; }\n    .card-checklist__data--rarity {\n      text-transform: capitalize; }\n  .card-checklist__data-link {\n    padding: 1rem 0;\n    display: block;\n    text-decoration: none;\n    width: 100%;\n    color: #000;\n    white-space: nowrap;\n    overflow: hidden;\n    text-overflow: ellipsis; }\n    .card-checklist__data-link--price {\n      color: #006885; }\n\n.tooltip {\n  position: absolute;\n  z-index: 5;\n  width: 24rem;\n  height: 34rem; }\n  .tooltip__img {\n    width: 100%;\n    height: 100%; }\n\n.negative-earnings {\n  color: red; }\n\n.positive-earnings {\n  color: green; }\n\n.image-grid {\n  padding: 7rem 16%;\n  display: flex;\n  justify-content: space-between;\n  flex-wrap: wrap; }\n  @media only screen and (max-width: 75rem) {\n    .image-grid {\n      padding: 4rem 2.5%; } }\n  @media only screen and (max-width: 62.5em) {\n    .image-grid {\n      grid-column-gap: 1rem; } }\n  .image-grid__outer-div {\n    position: relative;\n    height: 100%; }\n  .image-grid__inner-div {\n    perspective: 150rem;\n    width: 100%;\n    height: 100%; }\n  .image-grid__double {\n    width: 100%;\n    height: 100%;\n    position: absolute;\n    top: 0;\n    left: 0;\n    backface-visibility: hidden;\n    overflow: hidden;\n    transition: all 0.8s ease; }\n    .image-grid__double--back {\n      transform: rotateY(180deg); }\n  .image-grid__double-btn {\n    position: absolute;\n    top: 26%;\n    left: 75%;\n    width: 4.4rem;\n    height: 4.4rem;\n    border-radius: 50%;\n    background-color: rgba(255, 255, 255, 0.6);\n    border: 2px solid #342442;\n    transition: all 0.2s;\n    display: flex;\n    justify-content: center;\n    align-items: center; }\n    .image-grid__double-btn:hover {\n      cursor: pointer;\n      background-color: #fff; }\n  .image-grid__double-btn-svg {\n    height: 2.5rem;\n    width: 2.5rem;\n    pointer-events: none; }\n  .image-grid__dobule-btn-svg-color {\n    color: #16161d; }\n  .image-grid__container {\n    width: 100%;\n    height: 100%; }\n  .image-grid__image {\n    width: 100%;\n    height: 100%;\n    box-shadow: 1px 1px 6px rgba(0, 0, 0, 0.45);\n    border-radius: 4.75% / 3.5%; }\n  .image-grid__link {\n    margin-bottom: 0.9rem;\n    width: 24.25%;\n    height: auto;\n    margin-bottom: 0.9rem;\n    page-break-after: auto;\n    page-break-before: auto;\n    page-break-inside: avoid;\n    display: block; }\n    @media only screen and (max-width: 59.375em) {\n      .image-grid__link {\n        width: 31.75%; } }\n    @media only screen and (max-width: 40.625em) {\n      .image-grid__link {\n        width: 47.25%; } }\n\n.card {\n  width: 100%;\n  padding: 0 16%;\n  display: flex;\n  margin-top: 3rem;\n  padding-bottom: 0.7rem;\n  border-bottom: 1px dashed rgba(0, 0, 0, 0.7); }\n  .card__img-container {\n    z-index: 2;\n    border-radius: 100%; }\n  .card__img {\n    width: 33rem;\n    height: 46rem;\n    box-shadow: 1px 1px 8px rgba(0, 0, 0, 0.5);\n    border-radius: 4.75% / 3.5%; }\n  .card__img-left {\n    width: 33rem;\n    display: flex;\n    flex-direction: column;\n    z-index: 2; }\n  .card__img-btn {\n    align-self: center;\n    margin-top: 1rem;\n    height: 2.8rem;\n    font-size: 1.4rem;\n    line-height: 1.8;\n    color: #551a8b;\n    background-color: #f9f7f5;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    border-radius: 3px;\n    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06);\n    transition: all 0.2s;\n    padding: 0.2rem 0.5rem;\n    text-align: center;\n    display: flex;\n    align-items: center; }\n    .card__img-btn:hover {\n      cursor: pointer;\n      background-color: #fff;\n      border-color: #634496; }\n  .card__img-svg {\n    height: 1.4rem;\n    width: 1.4rem;\n    margin-right: 0.3rem;\n    pointer-events: none; }\n  .card__img-svg-color {\n    fill: #551a8b; }\n  .card__img-double-area {\n    position: relative; }\n  .card__img-double-sided {\n    perspective: 150rem;\n    height: 46rem; }\n  .card__img-double {\n    width: 33rem;\n    height: 46rem;\n    position: absolute;\n    top: 0;\n    left: 0;\n    backface-visibility: hidden;\n    overflow: hidden; }\n    .card__img-double--back {\n      transform: rotateY(180deg); }\n  .card__text {\n    background-color: #fff;\n    border-radius: 4px;\n    border: 1px solid rgba(0, 0, 0, 0.25);\n    border-top: 3px solid #000;\n    border-bottom: 3px solid #000;\n    margin-top: 2rem;\n    width: 34rem;\n    display: flex;\n    flex-direction: column;\n    padding: 3rem;\n    margin-right: 3rem;\n    margin-left: -2rem; }\n    .card__text-flex {\n      margin-bottom: 1rem;\n      border-bottom: 1px solid #bfbfbf; }\n    .card__text-title {\n      display: flex;\n      align-items: center; }\n      .card__text-title-h3 {\n        font-size: 1.8rem;\n        font-weight: 400;\n        margin-right: 1rem; }\n    .card__text-color-indicator {\n      width: 1.3rem;\n      height: 1.3rem;\n      border: 1px solid #333;\n      border-radius: 50%;\n      box-shadow: 0px 0px 0px 2px rgba(0, 0, 0, 0.2);\n      margin-right: 0.7rem;\n      display: inline-block; }\n      .card__text-color-indicator--U {\n        background-color: rgba(128, 128, 255, 0.7); }\n      .card__text-color-indicator--B {\n        background-color: rgba(0, 0, 0, 0.7); }\n      .card__text-color-indicator--R {\n        background-color: rgba(255, 77, 77, 0.7); }\n      .card__text-color-indicator--W {\n        background-color: rgba(255, 255, 255, 0.7); }\n      .card__text-color-indicator--G {\n        background-color: rgba(0, 255, 0, 0.7); }\n    .card__text-oracle-p {\n      margin-bottom: 1rem;\n      font-size: 1.3rem; }\n    .card__text-oracle-flavor {\n      font-size: 1.3rem;\n      font-style: italic; }\n    .card__text-illustrator {\n      font-size: 1.2rem;\n      font-style: italic; }\n    .card__text-legal {\n      display: flex;\n      flex-direction: row;\n      justify-content: space-between; }\n      .card__text-legal-half {\n        display: flex;\n        flex-direction: column; }\n      .card__text-legal-span-container {\n        display: flex;\n        align-items: center;\n        font-size: 1.4rem; }\n        .card__text-legal-span-container:not(:last-child) {\n          margin-bottom: 0.5rem; }\n      .card__text-legal-span-box {\n        width: 6rem;\n        height: 2.5rem;\n        margin-right: 0.3rem;\n        font-size: 1rem;\n        text-transform: uppercase;\n        display: flex;\n        justify-content: center;\n        align-items: center;\n        border-radius: 3px; }\n        .card__text-legal-span-box--not_legal {\n          background-color: #e60000; }\n        .card__text-legal-span-box--legal {\n          background-color: #009900; }\n      .card__text-legal-span-box {\n        color: #fff; }\n  .card__set {\n    display: flex;\n    flex-direction: column; }\n    .card__set-banner {\n      display: flex;\n      border: 1px solid #bfbfbf;\n      width: 40rem;\n      background-color: #49465c;\n      color: #fdfdfd;\n      padding: 0.7rem;\n      border-radius: 3px; }\n      .card__set-banner-svg-container {\n        margin-right: 1rem; }\n      .card__set-banner-svg {\n        width: 2.4rem;\n        height: 2.4rem;\n        filter: invert(100%); }\n    .card__set-details {\n      display: flex;\n      flex-direction: column; }\n    .card__set-header-name {\n      font-size: 1.7remrem; }\n    .card__set-header-code {\n      text-transform: uppercase; }\n    .card__set-prints-header {\n      display: flex;\n      justify-content: space-between;\n      background-color: #49465c;\n      color: #fdfdfd;\n      font-size: 1.3rem;\n      text-transform: uppercase;\n      border: 1px solid #bfbfbf;\n      border-radius: 3px;\n      padding: 0.3rem 0.7rem; }\n    .card__set-prints-svg-container {\n      height: 1.8rem;\n      width: 1.8rem;\n      border: 1px solid #bfbfbf;\n      display: flex;\n      justify-content: center;\n      align-items: center;\n      border-radius: 100%; }\n    .card__set-prints-svg--common {\n      fill: #000; }\n    .card__set-prints-svg--uncommon {\n      fill: #e6e6e6; }\n    .card__set-prints-svg--rare {\n      fill: #e6c300; }\n    .card__set-prints-svg--mythic {\n      fill: #ff0000; }\n    .card__set-prints-list {\n      list-style: none;\n      border-radius: 3px; }\n      .card__set-prints-list-link:link, .card__set-prints-list-link:visited {\n        text-decoration: none;\n        color: #000; }\n      .card__set-prints-list-item {\n        display: flex;\n        justify-content: space-between;\n        cursor: pointer;\n        border-bottom: 1px solid #e7e9ec;\n        border-left: 1px solid #cdcdcd;\n        background-color: #fff;\n        padding: 0.25rem 0; }\n        .card__set-prints-list-item--pl-14 {\n          padding-left: 1.4rem;\n          border-bottom: 3px solid #000; }\n        .card__set-prints-list-item:hover {\n          background-color: #f2f2f2; }\n      .card__set-prints-list-item-name-wrapper {\n        display: flex;\n        align-items: center;\n        margin-left: -1rem; }\n      .card__set-prints-list-item-set-name {\n        margin-left: 0.5rem; }\n      .card__set-prints-list-item-price {\n        margin-right: 0.7rem;\n        color: #006885; }\n\n.card-page {\n  display: flex;\n  flex-direction: column;\n  grid-column: 1 / -1;\n  position: relative; }\n\n.add-to-inv,\n.remove-from-inv {\n  margin-top: 3rem;\n  width: 50%;\n  margin-left: 50%;\n  transform: translateX(-50%);\n  display: flex;\n  flex-direction: column; }\n  .add-to-inv__header,\n  .remove-from-inv__header {\n    color: #16161d;\n    font-size: 2.2rem;\n    font-weight: 300;\n    margin: 0 auto 1rem auto; }\n  .add-to-inv__form,\n  .remove-from-inv__form {\n    display: flex;\n    flex-direction: column; }\n    .add-to-inv__form-price,\n    .remove-from-inv__form-price {\n      width: 20rem;\n      height: 3.5rem;\n      margin-bottom: 1rem;\n      padding: 1rem;\n      border: solid 1px #bfbfbf;\n      border-radius: 5px; }\n      .add-to-inv__form-price:focus,\n      .remove-from-inv__form-price:focus {\n        border: solid 1px #000; }\n    .add-to-inv__form-group,\n    .remove-from-inv__form-group {\n      display: flex;\n      justify-content: space-evenly;\n      align-content: center;\n      margin-bottom: 1.5rem;\n      position: relative; }\n    .add-to-inv__form-label,\n    .remove-from-inv__form-label {\n      margin-right: 0.3rem;\n      display: flex;\n      align-content: center;\n      justify-content: center;\n      color: #16161d;\n      margin-top: 0.45rem; }\n  .add-to-inv-price-msg,\n  .remove-from-inv-price-msg {\n    position: absolute;\n    bottom: -1.8rem;\n    right: 25%;\n    color: red; }\n  .add-to-inv__submit,\n  .remove-from-inv__submit {\n    align-self: center;\n    height: 3.1rem;\n    font-size: 1.4rem;\n    line-height: 1.8;\n    color: #551a8b;\n    background-color: #f9f7f5;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    border-radius: 3px;\n    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06);\n    transition: all 0.2s;\n    padding: 0.2rem 0.75rem;\n    text-align: center;\n    display: flex;\n    align-items: center;\n    margin-bottom: 1rem; }\n    .add-to-inv__submit:hover,\n    .remove-from-inv__submit:hover {\n      cursor: pointer;\n      background-color: #fff;\n      border-color: #634496; }\n\n.util-space::before,\n.util-space::after {\n  content: '';\n  margin: 0 0.2rem; }\n\n.no-results {\n  justify-self: center; }\n\n.homepage {\n  background: linear-gradient(to bottom, #1d1c25, #431e3f);\n  background-repeat: no-repeat;\n  height: 100vh;\n  display: flex;\n  overflow-x: hidden !important;\n  justify-content: center;\n  position: relative;\n  background-size: cover; }\n  .homepage__center {\n    align-self: center;\n    display: flex;\n    flex-direction: column; }\n    @media only screen and (max-width: 28.125em) {\n      .homepage__center {\n        margin-top: -12rem; } }\n  @media only screen and (max-width: 40.625em) {\n    .homepage__center-heading-wrapper {\n      margin: 0 auto 0.5rem auto;\n      width: 75%;\n      display: flex;\n      justify-content: center;\n      text-align: center; } }\n  .homepage__search {\n    position: relative; }\n  .homepage__search-input {\n    padding: 1.2rem 1.4rem 1.2rem 6.2rem;\n    font-size: 3rem;\n    background-color: #242031;\n    color: #d7d7d7;\n    border-radius: 4px;\n    box-shadow: 0px 0px 0px 2px rgba(0, 0, 0, 0.5);\n    width: 100%;\n    border: 1px solid rgba(255, 255, 255, 0.5); }\n    .homepage__search-input::placeholder {\n      text-align: center; }\n    @media only screen and (max-width: 40.625em) {\n      .homepage__search-input {\n        width: 80%;\n        margin-left: 10%; } }\n  .homepage__search-btn {\n    position: absolute;\n    left: 6rem;\n    top: 2rem; }\n    @media only screen and (max-width: 40.625em) {\n      .homepage__search-btn {\n        left: 12rem; } }\n    @media only screen and (max-width: 28.125em) {\n      .homepage__search-btn {\n        left: 10rem; } }\n  .homepage__icon-sizing--search {\n    width: 3rem;\n    height: 3rem;\n    transform: translateX(-150%); }\n  .homepage__icon-path {\n    fill: #bfbfbf; }\n  .homepage__links {\n    display: flex;\n    justify-content: center; }\n    @media only screen and (max-width: 40.625em) {\n      .homepage__links {\n        flex-direction: column; } }\n    @media only screen and (max-width: 28.125em) {\n      .homepage__links {\n        margin-left: 7.5%; } }\n  .homepage__link {\n    text-decoration: none;\n    border: 1px solid rgba(85, 26, 139, 0.5);\n    border-color: rgba(255, 255, 255, 0.6);\n    border-radius: 3px;\n    color: #fff;\n    margin-top: 0.6rem;\n    margin-right: 3rem;\n    cursor: pointer;\n    line-height: 1.4;\n    padding: 0.2rem 1rem 0 1rem;\n    height: 2.8rem;\n    transition: all 0.2s;\n    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06);\n    min-width: 9rem;\n    text-align: center; }\n    @media only screen and (max-width: 40.625em) {\n      .homepage__link {\n        align-self: center;\n        width: 14.5rem; } }\n    .homepage__link:hover {\n      background-color: rgba(255, 255, 255, 0.09); }\n\n.inventory-details {\n  grid-column: 1 / -1;\n  border-bottom: 1px solid rgba(99, 68, 150, 0.1);\n  background-color: #f6f4fa;\n  color: #535353;\n  padding: 1rem 16%;\n  margin-bottom: 2rem;\n  position: relative;\n  display: flex;\n  justify-content: space-between; }\n  .inventory-details__link {\n    text-decoration: none;\n    color: rgba(83, 83, 83, 0.75);\n    transition: all 0.2s;\n    padding: 0 0.6rem;\n    border-left: 1px solid #535353;\n    border-right: 1px solid #535353; }\n    .inventory-details__link:hover {\n      color: #535353; }\n  .inventory-details span {\n    color: #006885; }\n\n.homepage__colage,\n.cardpage__colage {\n  position: absolute;\n  overflow: hidden;\n  left: 0;\n  height: 15rem;\n  width: 100%; }\n\n.homepage__colage {\n  bottom: 0; }\n\n.cardpage__colage {\n  bottom: -2.6rem; }\n\n.homepage__colage-inner,\n.cardpage__colage-inner {\n  position: relative;\n  height: 100%;\n  margin-left: 50%;\n  transform: translateX(-50%);\n  width: 65.5rem; }\n\n.homepage__colage-card,\n.cardpage__colage-card {\n  width: 16.8rem;\n  height: 23.4rem;\n  position: absolute;\n  border-radius: 5% / 3.75%;\n  transform: translateY(0);\n  transition: all 0.3s;\n  box-shadow: inset 0 0 3px 3px #000; }\n  .homepage__colage-card:nth-child(1),\n  .cardpage__colage-card:nth-child(1) {\n    top: 2.2rem; }\n  .homepage__colage-card:nth-child(2),\n  .cardpage__colage-card:nth-child(2) {\n    top: 6.2rem;\n    left: 3.5rem; }\n  .homepage__colage-card:nth-child(3),\n  .cardpage__colage-card:nth-child(3) {\n    top: 1rem;\n    left: 17.4rem; }\n  .homepage__colage-card:nth-child(4),\n  .cardpage__colage-card:nth-child(4) {\n    top: 4.5rem;\n    left: 20.6rem; }\n  .homepage__colage-card:nth-child(5),\n  .cardpage__colage-card:nth-child(5) {\n    top: 1.6rem;\n    left: 34.7rem; }\n  .homepage__colage-card:nth-child(6),\n  .cardpage__colage-card:nth-child(6) {\n    top: 6.5rem;\n    left: 38rem; }\n  .homepage__colage-card:nth-child(7),\n  .cardpage__colage-card:nth-child(7) {\n    top: 3.5rem;\n    right: 0; }\n  .homepage__colage-card:hover,\n  .cardpage__colage-card:hover {\n    transform: translateY(-5%); }\n\n.container {\n  display: grid;\n  grid-template-columns: [full-start] minmax(6rem, 1fr) [center-start] repeat(8, [col-start] minmax(min-content, 14rem) [col-end]) [center-end] minmax(6rem, 1fr) [full-end];\n  background-color: #f5f6f7;\n  background-size: cover;\n  position: relative; }\n\n.search {\n  grid-column: full-start / full-end;\n  background-color: #fff; }\n\n.api-results-display {\n  grid-column: full-start / full-end;\n  background-color: #f5f6f7;\n  background-size: cover;\n  display: grid; }\n"],"sourceRoot":""}]);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9pbmRleC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvYWRhcHRlcnMveGhyLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9heGlvcy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbFRva2VuLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvaXNDYW5jZWwuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvQXhpb3MuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvSW50ZXJjZXB0b3JNYW5hZ2VyLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2J1aWxkRnVsbFBhdGguanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvY3JlYXRlRXJyb3IuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvZGlzcGF0Y2hSZXF1ZXN0LmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2VuaGFuY2VFcnJvci5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9tZXJnZUNvbmZpZy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9zZXR0bGUuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvdHJhbnNmb3JtRGF0YS5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvZGVmYXVsdHMuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYmluZC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9idWlsZFVSTC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9jb21iaW5lVVJMcy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9jb29raWVzLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzQWJzb2x1dGVVUkwuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNBeGlvc0Vycm9yLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzVVJMU2FtZU9yaWdpbi5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lLmpzIiwid2VicGFjazovL21hZ2ljLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3BhcnNlSGVhZGVycy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9zcHJlYWQuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL3V0aWxzLmpzIiwid2VicGFjazovL21hZ2ljLy4vc3JjL2Nzcy9zdHlsZS5jc3MiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9zcmMvY3NzL3ZlbmRvci9tYW5hLmNzcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvY3NzV2l0aE1hcHBpbmdUb1N0cmluZy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9nZXRVcmwuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9hcHAvc3RhdGljL2ltZy9TVkcvYXJyb3ctZG93bjIuc3ZnIiwid2VicGFjazovL21hZ2ljLy4vc3JjL2ltZy9tYW5hLXN5bWJvbHMvbWFuYS5zdmciLCJ3ZWJwYWNrOi8vbWFnaWMvLi9zcmMvY3NzL3N0eWxlLmNzcz85ZmNkIiwid2VicGFjazovL21hZ2ljLy4vc3JjL2Nzcy92ZW5kb3IvbWFuYS5jc3M/MDcwMiIsIndlYnBhY2s6Ly9tYWdpYy8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL3NyYy9qcy9pbmRleC5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL3NyYy9qcy9tb2RlbHMvU2VhcmNoLmpzIiwid2VicGFjazovL21hZ2ljLy4vc3JjL2pzL3ZpZXdzL2Jhc2UuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9zcmMvanMvdmlld3MvY2FyZFZpZXcuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvLi9zcmMvanMvdmlld3MvaW52ZW50b3J5U2VhcmNoVmlldy5qcyIsIndlYnBhY2s6Ly9tYWdpYy8uL3NyYy9qcy92aWV3cy9pbnZlbnRvcnlWaWV3LmpzIiwid2VicGFjazovL21hZ2ljLy4vc3JjL2pzL3ZpZXdzL3Jlc3VsdHNWaWV3LmpzIiwid2VicGFjazovL21hZ2ljLy4vc3JjL2pzL3ZpZXdzL3NlYXJjaFZpZXcuanMiLCJ3ZWJwYWNrOi8vbWFnaWMvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vbWFnaWMvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vbWFnaWMvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL21hZ2ljL3dlYnBhY2svcnVudGltZS9nbG9iYWwiLCJ3ZWJwYWNrOi8vbWFnaWMvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9tYWdpYy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL21hZ2ljL3dlYnBhY2svcnVudGltZS9wdWJsaWNQYXRoIiwid2VicGFjazovL21hZ2ljL3dlYnBhY2svc3RhcnR1cCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSw0RkFBdUMsQzs7Ozs7Ozs7Ozs7QUNBMUI7O0FBRWIsWUFBWSxtQkFBTyxDQUFDLHFEQUFZO0FBQ2hDLGFBQWEsbUJBQU8sQ0FBQyxpRUFBa0I7QUFDdkMsY0FBYyxtQkFBTyxDQUFDLHlFQUFzQjtBQUM1QyxlQUFlLG1CQUFPLENBQUMsMkVBQXVCO0FBQzlDLG9CQUFvQixtQkFBTyxDQUFDLDZFQUF1QjtBQUNuRCxtQkFBbUIsbUJBQU8sQ0FBQyxtRkFBMkI7QUFDdEQsc0JBQXNCLG1CQUFPLENBQUMseUZBQThCO0FBQzVELGtCQUFrQixtQkFBTyxDQUFDLHlFQUFxQjs7QUFFL0M7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw0Q0FBNEM7QUFDNUM7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7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QUFhLGtCQUFrQixNQUFNLEtBQUssc0JBQXNCLE1BQU0sS0FBSyxzQkFBc0IsTUFBTSxLQUFLLHNCQUFzQixNQUFNLFVBQVUsVUFBVSxZQUFZLGFBQWEsYUFBYSxrQkFBa0IsTUFBTSxLQUFLLG9CQUFvQixNQUFNLEtBQUssc0JBQXNCLE1BQU0saUJBQWlCLE1BQU0saUJBQWlCLE1BQU0sVUFBVSxVQUFVLFlBQVksYUFBYSxhQUFhLGdCQUFnQixNQUFNLEtBQUssWUFBWSx1QkFBdUIsTUFBTSxlQUFlLEtBQUssS0FBSyxVQUFVLG9CQUFvQixNQUFNLGVBQWUsS0FBSyxLQUFLLFVBQVUsb0JBQW9CLE1BQU0sVUFBVSxZQUFZLGdCQUFnQixLQUFLLFVBQVUsVUFBVSxZQUFZLFdBQVcsWUFBWSxrQkFBa0IsTUFBTSxLQUFLLG9CQUFvQixNQUFNLEtBQUssb0JBQW9CLE1BQU0saUJBQWlCLE1BQU0sWUFBWSxXQUFXLFlBQVksYUFBYSxhQUFhLGtCQUFrQixNQUFNLGlCQUFpQixNQUFNLEtBQUssb0JBQW9CLE1BQU0sVUFBVSxpQkFBaUIsTUFBTSxlQUFlLEtBQUssS0FBSyxzQkFBc0IsTUFBTSxLQUFLLHNCQUFzQixNQUFNLGVBQWUsS0FBSyxLQUFLLHNCQUFzQixNQUFNLEtBQUssc0JBQXNCLE1BQU0saUJBQWlCLE1BQU0sVUFBVSxVQUFVLGlCQUFpQixNQUFNLEtBQUssc0JBQXNCLE1BQU0sVUFBVSxpQkFBaUIsTUFBTSxZQUFZLFdBQVcsWUFBWSxhQUFhLGFBQWEsYUFBYSxhQUFhLFdBQVcsWUFBWSxXQUFXLFlBQVksYUFBYSxhQUFhLGFBQWEsYUFBYSxhQUFhLGFBQWEsa0JBQWtCLE1BQU0sS0FBSyxzQkFBc0IsTUFBTSxLQUFLLG9CQUFvQixNQUFNLEtBQUssb0JBQW9CLE1BQU0sVUFBVSxVQUFVLGlCQUFpQixNQUFNLGVBQWUsTUFBTSxZQUFZLFdBQVcsVUFBVSxVQUFVLFlBQVksYUFBYSxhQUFhLGFBQWEsYUFBYSxnQkFBZ0IsS0FBSyxZQUFZLFdBQVcsWUFBWSxhQUFhLFdBQVcsWUFBWSxhQUFhLGtCQUFrQixNQUFNLFVBQVUsaUJBQWlCLE1BQU0sVUFBVSxpQkFBaUIsTUFBTSxVQUFVLFlBQVksYUFBYSxrQkFBa0IsTUFBTSxVQUFVLGlCQUFpQixNQUFNLFVBQVUsWUFBWSxhQUFhLFdBQVcsVUFBVSxVQUFVLFlBQVksYUFBYSxrQkFBa0IsTUFBTSxVQUFVLFVBQVUsVUFBVSxZQUFZLGFBQWEsV0FBVyxZQUFZLGtCQUFrQixNQUFNLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLFlBQVksYUFBYSxhQUFhLFdBQVcsVUFBVSxVQUFVLFlBQVksYUFBYSxrQkFBa0IsTUFBTSxpQkFBaUIsTUFBTSxlQUFlLE1BQU0sWUFBWSxXQUFXLGlCQUFpQixNQUFNLGVBQWUsTUFBTSxpQkFBaUIsTUFBTSxZQUFZLGtCQUFrQixNQUFNLFVBQVUsVUFBVSxrQkFBa0IsTUFBTSxrQkFBa0IsTUFBTSxZQUFZLFdBQVcsVUFBVSxnQkFBZ0IsS0FBSyxrQkFBa0IsTUFBTSxZQUFZLGFBQWEsV0FBVyxVQUFVLFlBQVksYUFBYSxhQUFhLGdCQUFnQixNQUFNLEtBQUssc0JBQXNCLE1BQU0sS0FBSyxvQkFBb0IsTUFBTSxVQUFVLFlBQVksYUFBYSxhQUFhLGFBQWEsYUFBYSxXQUFXLFVBQVUsWUFBWSxXQUFXLFlBQVksYUFBYSxhQUFhLGFBQWEsYUFBYSxhQUFhLGtCQUFrQixNQUFNLFVBQVUsaUJBQWlCLE1BQU0sZUFBZSxNQUFNLFlBQVksYUFBYSxhQUFhLFdBQVcsWUFBWSxhQUFhLFdBQVcsWUFBWSxhQUFhLFdBQVcsWUFBWSxrQkFBa0IsTUFBTSxVQUFVLGlCQUFpQixNQUFNLFVBQVUsaUJBQWlCLE1BQU0sVUFBVSxZQUFZLGFBQWEsYUFBYSxXQUFXLFlBQVksV0FBVyxVQUFVLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLFlBQVksYUFBYSxrQkFBa0IsTUFBTSxLQUFLLG9CQUFvQixNQUFNLFVBQVUsZUFBZSxLQUFLLGdCQUFnQixNQUFNLFVBQVUsWUFBWSxhQUFhLFdBQVcsWUFBWSxhQUFhLGdCQUFnQixNQUFNLEtBQUssdUJBQXVCLE1BQU0sWUFBWSxhQUFhLGFBQWEsYUFBYSxXQUFXLGVBQWUsS0FBSyxLQUFLLFVBQVUsc0JBQXNCLE1BQU0sS0FBSyxvQkFBb0IsTUFBTSxVQUFVLGdCQUFnQixNQUFNLFlBQVksYUFBYSxhQUFhLGFBQWEsYUFBYSxpQkFBaUIsTUFBTSxVQUFVLFlBQVksV0FBVyxpQkFBaUIsTUFBTSxLQUFLLG9CQUFvQixNQUFNLEtBQUssb0JBQW9CLE1BQU0sS0FBSyxvQkFBb0IsTUFBTSxrQkFBa0IsTUFBTSxlQUFlLEtBQUssS0FBSyxxQkFBcUIsTUFBTSxrQkFBa0IsTUFBTSxZQUFZLGFBQWEsYUFBYSxXQUFXLFVBQVUsZUFBZSxLQUFLLEtBQUsscUJBQXFCLE1BQU0sVUFBVSxpQkFBaUIsTUFBTSxVQUFVLGVBQWUsS0FBSyxpQkFBaUIsTUFBTSxpQkFBaUIsTUFBTSxZQUFZLFdBQVcsWUFBWSxhQUFhLGtCQUFrQixNQUFNLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLGVBQWUsTUFBTSxVQUFVLFVBQVUsWUFBWSxhQUFhLGtCQUFrQixNQUFNLFlBQVksa0JBQWtCLE1BQU0saUJBQWlCLE1BQU0saUJBQWlCLE1BQU0sVUFBVSxVQUFVLFlBQVksV0FBVyxVQUFVLFlBQVksYUFBYSxrQkFBa0IsTUFBTSxnQkFBZ0IsTUFBTSxZQUFZLFdBQVcsVUFBVSxlQUFlLEtBQUssVUFBVSxnQkFBZ0IsTUFBTSxnQkFBZ0IsS0FBSyxnQkFBZ0IsTUFBTSxZQUFZLFdBQVcsWUFBWSxnQkFBZ0IsTUFBTSxLQUFLLHNCQUFzQixNQUFNLEtBQUssc0JBQXNCLE1BQU0sWUFBWSxnQkFBZ0IsTUFBTSxZQUFZLFdBQVcsZUFBZSxNQUFNLFVBQVUsVUFBVSxZQUFZLFdBQVcsVUFBVSxZQUFZLGFBQWEsa0JBQWtCLE1BQU0saUJBQWlCLE1BQU0sWUFBWSxXQUFXLFVBQVUsVUFBVSxVQUFVLFlBQVksYUFBYSxhQUFhLGFBQWEsV0FBVyxZQUFZLGtCQUFrQixNQUFNLFVBQVUsaUJBQWlCLE1BQU0sVUFBVSxVQUFVLGlCQUFpQixNQUFNLGVBQWUsTUFBTSxVQUFVLGVBQWUsTUFBTSxVQUFVLFVBQVUsWUFBWSxrQkFBa0IsTUFBTSxZQUFZLFdBQVcsVUFBVSxZQUFZLGFBQWEsYUFBYSxhQUFhLGdCQUFnQixNQUFNLEtBQUssb0JBQW9CLE1BQU0sS0FBSyxxQkFBcUIsTUFBTSxVQUFVLFVBQVUsVUFBVSxZQUFZLGFBQWEsa0JBQWtCLE1BQU0sVUFBVSxpQkFBaUIsTUFBTSxVQUFVLFVBQVUsWUFBWSxrQkFBa0IsTUFBTSxVQUFVLFVBQVUsWUFBWSxnQkFBZ0IsS0FBSyxZQUFZLGFBQWEsV0FBVyxZQUFZLGFBQWEsV0FBVyxZQUFZLGFBQWEsYUFBYSxhQUFhLGFBQWEsYUFBYSxhQUFhLFdBQVcsaUJBQWlCLE1BQU0sVUFBVSxZQUFZLGtCQUFrQixNQUFNLFVBQVUsVUFBVSxZQUFZLGtCQUFrQixNQUFNLGVBQWUsTUFBTSxpQkFBaUIsTUFBTSxZQUFZLGdCQUFnQixNQUFNLFVBQVUsVUFBVSxZQUFZLFdBQVcsVUFBVSxZQUFZLGtCQUFrQixNQUFNLGlCQUFpQixNQUFNLFlBQVksYUFBYSxhQUFhLGFBQWEsYUFBYSxhQUFhLFdBQVcsVUFBVSxZQUFZLFdBQVcsWUFBWSxrQkFBa0IsTUFBTSxZQUFZLGtCQUFrQixNQUFNLFVBQVUsaUJBQWlCLE1BQU0sWUFBWSxhQUFhLGtCQUFrQixNQUFNLFVBQVUsVUFBVSxZQUFZLGFBQWEsYUFBYSxhQUFhLGtCQUFrQixNQUFNLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLFlBQVksa0JBQWtCLE1BQU0sWUFBWSxrQkFBa0IsTUFBTSxZQUFZLGtCQUFrQixNQUFNLFVBQVUsWUFBWSxrQkFBa0IsTUFBTSxVQUFVLGlCQUFpQixNQUFNLFVBQVUsWUFBWSxrQkFBa0IsTUFBTSxpQkFBaUIsTUFBTSxVQUFVLFVBQVUsWUFBWSxXQUFXLFlBQVksV0FBVyxZQUFZLGFBQWEsa0JBQWtCLE1BQU0saUJBQWlCLE1BQU0saUJBQWlCLE1BQU0sZUFBZSxNQUFNLFVBQVUsaUJBQWlCLE1BQU0sVUFBVSxZQUFZLFdBQVcsWUFBWSxXQUFXLFVBQVUsaUJBQWlCLE1BQU0saUJBQWlCLE1BQU0sVUFBVSxVQUFVLGlCQUFpQixNQUFNLFVBQVUsaUJBQWlCLE1BQU0saUJBQWlCLE1BQU0saUJBQWlCLE1BQU0sVUFBVSxZQUFZLGFBQWEsV0FBVyxZQUFZLGFBQWEsYUFBYSxhQUFhLGtCQUFrQixNQUFNLFVBQVUsVUFBVSxZQUFZLFdBQVcsWUFBWSxhQUFhLGtCQUFrQixNQUFNLGVBQWUsS0FBSyxlQUFlLE1BQU0sZUFBZSxNQUFNLGVBQWUsTUFBTSxZQUFZLGtCQUFrQixNQUFNLFlBQVksZ0JBQWdCLEtBQUssVUFBVSxZQUFZLFdBQVcsWUFBWSxhQUFhLGFBQWEsa0JBQWtCLE1BQU0sWUFBWSxrQkFBa0IsTUFBTSxpQkFBaUIsTUFBTSxVQUFVLFlBQVksa0JBQWtCLE1BQU0saUJBQWlCLE1BQU0sWUFBWSxpQkFBaUIsTUFBTSxVQUFVLFlBQVksYUFBYSxtQkFBbUIsT0FBTyxZQUFZLFdBQVcsWUFBWSxhQUFhLFdBQVcsaUJBQWlCLE9BQU8sVUFBVSxZQUFZLGFBQWEsa0JBQWtCLE9BQU8sVUFBVSxpQkFBaUIsT0FBTyxVQUFVLFVBQVUsWUFBWSxXQUFXLFlBQVksa0JBQWtCLE9BQU8saUJBQWlCLE9BQU8sVUFBVSxZQUFZLGFBQWEsYUFBYSxrQkFBa0IsT0FBTyxZQUFZLFdBQVcsWUFBWSxhQUFhLFdBQVcsaUJBQWlCLE9BQU8sWUFBWSxXQUFXLFVBQVUsZUFBZSxNQUFNLFlBQVksV0FBVyxZQUFZLGFBQWEsV0FBVyxZQUFZLGFBQWEsYUFBYSxhQUFhLGFBQWEsYUFBYSxhQUFhLFdBQVcsWUFBWSxrQkFBa0IsT0FBTyxVQUFVLFlBQVksbUJBQW1CLE9BQU8sVUFBVSxrQkFBa0IsTUFBTSxrQkFBa0IsTUFBTSxZQUFZLGFBQWEsV0FBVyxVQUFVLFlBQVksYUFBYSxhQUFhLGtCQUFrQixNQUFNLFlBQVksV0FBVyxpQkFBaUIs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R0FBRyxXQUFXLDBCQUEwQixFQUFFLFlBQVksOEJBQThCLEVBQUUsWUFBWSw4QkFBOEIsRUFBRSxZQUFZLDhCQUE4QixFQUFFLFlBQVksOEJBQThCLEVBQUUsWUFBWSw4QkFBOEIsRUFBRSxZQUFZLDhCQUE4QixFQUFFLFlBQVksOEJBQThCLEVBQUUsWUFBWSw4QkFBOEIsRUFBRSxZQUFZLDhCQUE4QixFQUFFLGVBQWUsNEJBQTRCLEVBQUUsYUFBYSxrQ0FBa0MsRUFBRSxhQUFhLGtDQUFrQyxFQUFFLGFBQWEsa0NBQWtDLEVBQUUsYUFBYSxrQ0FBa0MsRUFBRSxhQUFhLGtDQUFrQyxFQUFFLGFBQWEsa0NBQWtDLEVBQUUsYUFBYSxrQ0FBa0MsRUFBRSxhQUFhLGtDQUFrQyxFQUFFLGFBQWEsa0NBQWtDLEVBQUUsZUFBZSw0QkFBNEIsRUFBRSxZQUFZLGtDQUFrQyxFQUFFLFlBQVksa0NBQWtDLEVBQUUsWUFBWSxrQ0FBa0MsRUFBRSxZQUFZLGtDQUFrQyxFQUFFLFlBQVksa0NBQWtDLEVBQUUsWUFBWSxrQ0FBa0MsRUFBRSxZQUFZLGtDQUFrQyxFQUFFLFlBQVksa0NBQWtDLEVBQUUsWUFBWSxrQ0FBa0MsRUFBRSxlQUFlLDRCQUE0QixFQUFFLGFBQWEsZ0NBQWdDLEVBQUUsYUFBYSxnQ0FBZ0MsRUFBRSxhQUFhLGdDQUFnQyxFQUFFLGFBQWEsZ0NBQWdDLEVBQUUsYUFBYSxnQ0FBZ0MsRUFBRSxhQUFhLGdDQUFnQyxFQUFFLGFBQWEsZ0NBQWdDLEVBQUUsYUFBYSxnQ0FBZ0MsRUFBRSxhQUFhLGdDQUFnQyxFQUFFLGVBQWUsOEJBQThCLEVBQUUsYUFBYSxrQ0FBa0MsRUFBRSxhQUFhLGtDQUFrQyxFQUFFLGFBQWEsa0NBQWtDLEVBQUUsYUFBYSxrQ0FBa0MsRUFBRSxhQUFhLGtDQUFrQyxFQUFFLGFBQWEsa0NBQWtDLEVBQUUsYUFBYSxrQ0FBa0MsRUFBRSxhQUFhLGtDQUFrQyxFQUFFLGFBQWEsa0NBQWtDLEVBQUUsY0FBYywrQkFBK0IsRUFBRSxZQUFZLGtDQUFrQyxFQUFFLGNBQWMsa0NBQWtD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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUMxaEJrQzs7QUFFbEM7QUFDQTtBQUNBOztBQUVPO0FBQ1AsTUFBTSwrRUFBNEM7QUFDbEQsSUFBSSxrRkFBK0M7QUFDbkQsSUFBSSw0RUFBeUM7QUFDN0M7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVPO0FBQ1AsT0FBTywrRUFBNEM7QUFDbkQsSUFBSSxvRUFBaUM7QUFDckMsSUFBSSwrRUFBNEM7QUFDaEQ7QUFDQTtBQUNBOztBQUVPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFTztBQUNQO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFTztBQUNQOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTs7QUFFTztBQUNQOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFTztBQUNQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFTztBQUNQO0FB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O0FBQ3JFOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFTztBQUNQOztBQUVBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7O0FBRU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUUsMkVBQXdDO0FBQzFDOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esa0VBQWtFLFFBQVE7QUFDMUU7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBLEVBQUUsOEVBQTJDO0FBQzdDOztBQUVPO0FBQ1A7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCLDhEQUEyQjtBQUM1QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksb0VBQWlDO0FBQ3JDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O1VDOXJCQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0NyQkE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLGdDQUFnQyxZQUFZO1dBQzVDO1dBQ0EsRTs7Ozs7V0NQQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHdDQUF3Qyx5Q0FBeUM7V0FDakY7V0FDQTtXQUNBLEU7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQSxFQUFFO1dBQ0Y7V0FDQTtXQUNBLENBQUMsSTs7Ozs7V0NQRCxzRjs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSxzREFBc0Qsa0JBQWtCO1dBQ3hFO1dBQ0EsK0NBQStDLGNBQWM7V0FDN0QsRTs7Ozs7V0NOQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxrQzs7OztVQ2ZBO1VBQ0E7VUFDQTtVQUNBIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvYXhpb3MnKTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBzZXR0bGUgPSByZXF1aXJlKCcuLy4uL2NvcmUvc2V0dGxlJyk7XG52YXIgY29va2llcyA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9jb29raWVzJyk7XG52YXIgYnVpbGRVUkwgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvYnVpbGRVUkwnKTtcbnZhciBidWlsZEZ1bGxQYXRoID0gcmVxdWlyZSgnLi4vY29yZS9idWlsZEZ1bGxQYXRoJyk7XG52YXIgcGFyc2VIZWFkZXJzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL3BhcnNlSGVhZGVycycpO1xudmFyIGlzVVJMU2FtZU9yaWdpbiA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9pc1VSTFNhbWVPcmlnaW4nKTtcbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4uL2NvcmUvY3JlYXRlRXJyb3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB4aHJBZGFwdGVyKGNvbmZpZykge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gZGlzcGF0Y2hYaHJSZXF1ZXN0KHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciByZXF1ZXN0RGF0YSA9IGNvbmZpZy5kYXRhO1xuICAgIHZhciByZXF1ZXN0SGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzO1xuXG4gICAgaWYgKHV0aWxzLmlzRm9ybURhdGEocmVxdWVzdERhdGEpKSB7XG4gICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddOyAvLyBMZXQgdGhlIGJyb3dzZXIgc2V0IGl0XG4gICAgfVxuXG4gICAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgIC8vIEhUVFAgYmFzaWMgYXV0aGVudGljYXRpb25cbiAgICBpZiAoY29uZmlnLmF1dGgpIHtcbiAgICAgIHZhciB1c2VybmFtZSA9IGNvbmZpZy5hdXRoLnVzZXJuYW1lIHx8ICcnO1xuICAgICAgdmFyIHBhc3N3b3JkID0gY29uZmlnLmF1dGgucGFzc3dvcmQgPyB1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoY29uZmlnLmF1dGgucGFzc3dvcmQpKSA6ICcnO1xuICAgICAgcmVxdWVzdEhlYWRlcnMuQXV0aG9yaXphdGlvbiA9ICdCYXNpYyAnICsgYnRvYSh1c2VybmFtZSArICc6JyArIHBhc3N3b3JkKTtcbiAgICB9XG5cbiAgICB2YXIgZnVsbFBhdGggPSBidWlsZEZ1bGxQYXRoKGNvbmZpZy5iYXNlVVJMLCBjb25maWcudXJsKTtcbiAgICByZXF1ZXN0Lm9wZW4oY29uZmlnLm1ldGhvZC50b1VwcGVyQ2FzZSgpLCBidWlsZFVSTChmdWxsUGF0aCwgY29uZmlnLnBhcmFtcywgY29uZmlnLnBhcmFtc1NlcmlhbGl6ZXIpLCB0cnVlKTtcblxuICAgIC8vIFNldCB0aGUgcmVxdWVzdCB0aW1lb3V0IGluIE1TXG4gICAgcmVxdWVzdC50aW1lb3V0ID0gY29uZmlnLnRpbWVvdXQ7XG5cbiAgICAvLyBMaXN0ZW4gZm9yIHJlYWR5IHN0YXRlXG4gICAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiBoYW5kbGVMb2FkKCkge1xuICAgICAgaWYgKCFyZXF1ZXN0IHx8IHJlcXVlc3QucmVhZHlTdGF0ZSAhPT0gNCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFRoZSByZXF1ZXN0IGVycm9yZWQgb3V0IGFuZCB3ZSBkaWRuJ3QgZ2V0IGEgcmVzcG9uc2UsIHRoaXMgd2lsbCBiZVxuICAgICAgLy8gaGFuZGxlZCBieSBvbmVycm9yIGluc3RlYWRcbiAgICAgIC8vIFdpdGggb25lIGV4Y2VwdGlvbjogcmVxdWVzdCB0aGF0IHVzaW5nIGZpbGU6IHByb3RvY29sLCBtb3N0IGJyb3dzZXJzXG4gICAgICAvLyB3aWxsIHJldHVybiBzdGF0dXMgYXMgMCBldmVuIHRob3VnaCBpdCdzIGEgc3VjY2Vzc2Z1bCByZXF1ZXN0XG4gICAgICBpZiAocmVxdWVzdC5zdGF0dXMgPT09IDAgJiYgIShyZXF1ZXN0LnJlc3BvbnNlVVJMICYmIHJlcXVlc3QucmVzcG9uc2VVUkwuaW5kZXhPZignZmlsZTonKSA9PT0gMCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBQcmVwYXJlIHRoZSByZXNwb25zZVxuICAgICAgdmFyIHJlc3BvbnNlSGVhZGVycyA9ICdnZXRBbGxSZXNwb25zZUhlYWRlcnMnIGluIHJlcXVlc3QgPyBwYXJzZUhlYWRlcnMocmVxdWVzdC5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSkgOiBudWxsO1xuICAgICAgdmFyIHJlc3BvbnNlRGF0YSA9ICFjb25maWcucmVzcG9uc2VUeXBlIHx8IGNvbmZpZy5yZXNwb25zZVR5cGUgPT09ICd0ZXh0JyA/IHJlcXVlc3QucmVzcG9uc2VUZXh0IDogcmVxdWVzdC5yZXNwb25zZTtcbiAgICAgIHZhciByZXNwb25zZSA9IHtcbiAgICAgICAgZGF0YTogcmVzcG9uc2VEYXRhLFxuICAgICAgICBzdGF0dXM6IHJlcXVlc3Quc3RhdHVzLFxuICAgICAgICBzdGF0dXNUZXh0OiByZXF1ZXN0LnN0YXR1c1RleHQsXG4gICAgICAgIGhlYWRlcnM6IHJlc3BvbnNlSGVhZGVycyxcbiAgICAgICAgY29uZmlnOiBjb25maWcsXG4gICAgICAgIHJlcXVlc3Q6IHJlcXVlc3RcbiAgICAgIH07XG5cbiAgICAgIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHJlc3BvbnNlKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSBicm93c2VyIHJlcXVlc3QgY2FuY2VsbGF0aW9uIChhcyBvcHBvc2VkIHRvIGEgbWFudWFsIGNhbmNlbGxhdGlvbilcbiAgICByZXF1ZXN0Lm9uYWJvcnQgPSBmdW5jdGlvbiBoYW5kbGVBYm9ydCgpIHtcbiAgICAgIGlmICghcmVxdWVzdCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcignUmVxdWVzdCBhYm9ydGVkJywgY29uZmlnLCAnRUNPTk5BQk9SVEVEJywgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIGxvdyBsZXZlbCBuZXR3b3JrIGVycm9yc1xuICAgIHJlcXVlc3Qub25lcnJvciA9IGZ1bmN0aW9uIGhhbmRsZUVycm9yKCkge1xuICAgICAgLy8gUmVhbCBlcnJvcnMgYXJlIGhpZGRlbiBmcm9tIHVzIGJ5IHRoZSBicm93c2VyXG4gICAgICAvLyBvbmVycm9yIHNob3VsZCBvbmx5IGZpcmUgaWYgaXQncyBhIG5ldHdvcmsgZXJyb3JcbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcignTmV0d29yayBFcnJvcicsIGNvbmZpZywgbnVsbCwgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIHRpbWVvdXRcbiAgICByZXF1ZXN0Lm9udGltZW91dCA9IGZ1bmN0aW9uIGhhbmRsZVRpbWVvdXQoKSB7XG4gICAgICB2YXIgdGltZW91dEVycm9yTWVzc2FnZSA9ICd0aW1lb3V0IG9mICcgKyBjb25maWcudGltZW91dCArICdtcyBleGNlZWRlZCc7XG4gICAgICBpZiAoY29uZmlnLnRpbWVvdXRFcnJvck1lc3NhZ2UpIHtcbiAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZSA9IGNvbmZpZy50aW1lb3V0RXJyb3JNZXNzYWdlO1xuICAgICAgfVxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKHRpbWVvdXRFcnJvck1lc3NhZ2UsIGNvbmZpZywgJ0VDT05OQUJPUlRFRCcsXG4gICAgICAgIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEFkZCB4c3JmIGhlYWRlclxuICAgIC8vIFRoaXMgaXMgb25seSBkb25lIGlmIHJ1bm5pbmcgaW4gYSBzdGFuZGFyZCBicm93c2VyIGVudmlyb25tZW50LlxuICAgIC8vIFNwZWNpZmljYWxseSBub3QgaWYgd2UncmUgaW4gYSB3ZWIgd29ya2VyLCBvciByZWFjdC1uYXRpdmUuXG4gICAgaWYgKHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkpIHtcbiAgICAgIC8vIEFkZCB4c3JmIGhlYWRlclxuICAgICAgdmFyIHhzcmZWYWx1ZSA9IChjb25maWcud2l0aENyZWRlbnRpYWxzIHx8IGlzVVJMU2FtZU9yaWdpbihmdWxsUGF0aCkpICYmIGNvbmZpZy54c3JmQ29va2llTmFtZSA/XG4gICAgICAgIGNvb2tpZXMucmVhZChjb25maWcueHNyZkNvb2tpZU5hbWUpIDpcbiAgICAgICAgdW5kZWZpbmVkO1xuXG4gICAgICBpZiAoeHNyZlZhbHVlKSB7XG4gICAgICAgIHJlcXVlc3RIZWFkZXJzW2NvbmZpZy54c3JmSGVhZGVyTmFtZV0gPSB4c3JmVmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQWRkIGhlYWRlcnMgdG8gdGhlIHJlcXVlc3RcbiAgICBpZiAoJ3NldFJlcXVlc3RIZWFkZXInIGluIHJlcXVlc3QpIHtcbiAgICAgIHV0aWxzLmZvckVhY2gocmVxdWVzdEhlYWRlcnMsIGZ1bmN0aW9uIHNldFJlcXVlc3RIZWFkZXIodmFsLCBrZXkpIHtcbiAgICAgICAgaWYgKHR5cGVvZiByZXF1ZXN0RGF0YSA9PT0gJ3VuZGVmaW5lZCcgJiYga2V5LnRvTG93ZXJDYXNlKCkgPT09ICdjb250ZW50LXR5cGUnKSB7XG4gICAgICAgICAgLy8gUmVtb3ZlIENvbnRlbnQtVHlwZSBpZiBkYXRhIGlzIHVuZGVmaW5lZFxuICAgICAgICAgIGRlbGV0ZSByZXF1ZXN0SGVhZGVyc1trZXldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIE90aGVyd2lzZSBhZGQgaGVhZGVyIHRvIHRoZSByZXF1ZXN0XG4gICAgICAgICAgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKGtleSwgdmFsKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQWRkIHdpdGhDcmVkZW50aWFscyB0byByZXF1ZXN0IGlmIG5lZWRlZFxuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnLndpdGhDcmVkZW50aWFscykpIHtcbiAgICAgIHJlcXVlc3Qud2l0aENyZWRlbnRpYWxzID0gISFjb25maWcud2l0aENyZWRlbnRpYWxzO1xuICAgIH1cblxuICAgIC8vIEFkZCByZXNwb25zZVR5cGUgdG8gcmVxdWVzdCBpZiBuZWVkZWRcbiAgICBpZiAoY29uZmlnLnJlc3BvbnNlVHlwZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSBjb25maWcucmVzcG9uc2VUeXBlO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBFeHBlY3RlZCBET01FeGNlcHRpb24gdGhyb3duIGJ5IGJyb3dzZXJzIG5vdCBjb21wYXRpYmxlIFhNTEh0dHBSZXF1ZXN0IExldmVsIDIuXG4gICAgICAgIC8vIEJ1dCwgdGhpcyBjYW4gYmUgc3VwcHJlc3NlZCBmb3IgJ2pzb24nIHR5cGUgYXMgaXQgY2FuIGJlIHBhcnNlZCBieSBkZWZhdWx0ICd0cmFuc2Zvcm1SZXNwb25zZScgZnVuY3Rpb24uXG4gICAgICAgIGlmIChjb25maWcucmVzcG9uc2VUeXBlICE9PSAnanNvbicpIHtcbiAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIHByb2dyZXNzIGlmIG5lZWRlZFxuICAgIGlmICh0eXBlb2YgY29uZmlnLm9uRG93bmxvYWRQcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGNvbmZpZy5vbkRvd25sb2FkUHJvZ3Jlc3MpO1xuICAgIH1cblxuICAgIC8vIE5vdCBhbGwgYnJvd3NlcnMgc3VwcG9ydCB1cGxvYWQgZXZlbnRzXG4gICAgaWYgKHR5cGVvZiBjb25maWcub25VcGxvYWRQcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJyAmJiByZXF1ZXN0LnVwbG9hZCkge1xuICAgICAgcmVxdWVzdC51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBjb25maWcub25VcGxvYWRQcm9ncmVzcyk7XG4gICAgfVxuXG4gICAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgICAgLy8gSGFuZGxlIGNhbmNlbGxhdGlvblxuICAgICAgY29uZmlnLmNhbmNlbFRva2VuLnByb21pc2UudGhlbihmdW5jdGlvbiBvbkNhbmNlbGVkKGNhbmNlbCkge1xuICAgICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICByZXF1ZXN0LmFib3J0KCk7XG4gICAgICAgIHJlamVjdChjYW5jZWwpO1xuICAgICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKCFyZXF1ZXN0RGF0YSkge1xuICAgICAgcmVxdWVzdERhdGEgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIFNlbmQgdGhlIHJlcXVlc3RcbiAgICByZXF1ZXN0LnNlbmQocmVxdWVzdERhdGEpO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbnZhciBiaW5kID0gcmVxdWlyZSgnLi9oZWxwZXJzL2JpbmQnKTtcbnZhciBBeGlvcyA9IHJlcXVpcmUoJy4vY29yZS9BeGlvcycpO1xudmFyIG1lcmdlQ29uZmlnID0gcmVxdWlyZSgnLi9jb3JlL21lcmdlQ29uZmlnJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIGluc3RhbmNlIG9mIEF4aW9zXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRlZmF1bHRDb25maWcgVGhlIGRlZmF1bHQgY29uZmlnIGZvciB0aGUgaW5zdGFuY2VcbiAqIEByZXR1cm4ge0F4aW9zfSBBIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICovXG5mdW5jdGlvbiBjcmVhdGVJbnN0YW5jZShkZWZhdWx0Q29uZmlnKSB7XG4gIHZhciBjb250ZXh0ID0gbmV3IEF4aW9zKGRlZmF1bHRDb25maWcpO1xuICB2YXIgaW5zdGFuY2UgPSBiaW5kKEF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0LCBjb250ZXh0KTtcblxuICAvLyBDb3B5IGF4aW9zLnByb3RvdHlwZSB0byBpbnN0YW5jZVxuICB1dGlscy5leHRlbmQoaW5zdGFuY2UsIEF4aW9zLnByb3RvdHlwZSwgY29udGV4dCk7XG5cbiAgLy8gQ29weSBjb250ZXh0IHRvIGluc3RhbmNlXG4gIHV0aWxzLmV4dGVuZChpbnN0YW5jZSwgY29udGV4dCk7XG5cbiAgcmV0dXJuIGluc3RhbmNlO1xufVxuXG4vLyBDcmVhdGUgdGhlIGRlZmF1bHQgaW5zdGFuY2UgdG8gYmUgZXhwb3J0ZWRcbnZhciBheGlvcyA9IGNyZWF0ZUluc3RhbmNlKGRlZmF1bHRzKTtcblxuLy8gRXhwb3NlIEF4aW9zIGNsYXNzIHRvIGFsbG93IGNsYXNzIGluaGVyaXRhbmNlXG5heGlvcy5BeGlvcyA9IEF4aW9zO1xuXG4vLyBGYWN0b3J5IGZvciBjcmVhdGluZyBuZXcgaW5zdGFuY2VzXG5heGlvcy5jcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUoaW5zdGFuY2VDb25maWcpIHtcbiAgcmV0dXJuIGNyZWF0ZUluc3RhbmNlKG1lcmdlQ29uZmlnKGF4aW9zLmRlZmF1bHRzLCBpbnN0YW5jZUNvbmZpZykpO1xufTtcblxuLy8gRXhwb3NlIENhbmNlbCAmIENhbmNlbFRva2VuXG5heGlvcy5DYW5jZWwgPSByZXF1aXJlKCcuL2NhbmNlbC9DYW5jZWwnKTtcbmF4aW9zLkNhbmNlbFRva2VuID0gcmVxdWlyZSgnLi9jYW5jZWwvQ2FuY2VsVG9rZW4nKTtcbmF4aW9zLmlzQ2FuY2VsID0gcmVxdWlyZSgnLi9jYW5jZWwvaXNDYW5jZWwnKTtcblxuLy8gRXhwb3NlIGFsbC9zcHJlYWRcbmF4aW9zLmFsbCA9IGZ1bmN0aW9uIGFsbChwcm9taXNlcykge1xuICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xufTtcbmF4aW9zLnNwcmVhZCA9IHJlcXVpcmUoJy4vaGVscGVycy9zcHJlYWQnKTtcblxuLy8gRXhwb3NlIGlzQXhpb3NFcnJvclxuYXhpb3MuaXNBeGlvc0Vycm9yID0gcmVxdWlyZSgnLi9oZWxwZXJzL2lzQXhpb3NFcnJvcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGF4aW9zO1xuXG4vLyBBbGxvdyB1c2Ugb2YgZGVmYXVsdCBpbXBvcnQgc3ludGF4IGluIFR5cGVTY3JpcHRcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBheGlvcztcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBBIGBDYW5jZWxgIGlzIGFuIG9iamVjdCB0aGF0IGlzIHRocm93biB3aGVuIGFuIG9wZXJhdGlvbiBpcyBjYW5jZWxlZC5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7c3RyaW5nPX0gbWVzc2FnZSBUaGUgbWVzc2FnZS5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsKG1lc3NhZ2UpIHtcbiAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbn1cblxuQ2FuY2VsLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICByZXR1cm4gJ0NhbmNlbCcgKyAodGhpcy5tZXNzYWdlID8gJzogJyArIHRoaXMubWVzc2FnZSA6ICcnKTtcbn07XG5cbkNhbmNlbC5wcm90b3R5cGUuX19DQU5DRUxfXyA9IHRydWU7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ2FuY2VsID0gcmVxdWlyZSgnLi9DYW5jZWwnKTtcblxuLyoqXG4gKiBBIGBDYW5jZWxUb2tlbmAgaXMgYW4gb2JqZWN0IHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVxdWVzdCBjYW5jZWxsYXRpb24gb2YgYW4gb3BlcmF0aW9uLlxuICpcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZXhlY3V0b3IgVGhlIGV4ZWN1dG9yIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBDYW5jZWxUb2tlbihleGVjdXRvcikge1xuICBpZiAodHlwZW9mIGV4ZWN1dG9yICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZXhlY3V0b3IgbXVzdCBiZSBhIGZ1bmN0aW9uLicpO1xuICB9XG5cbiAgdmFyIHJlc29sdmVQcm9taXNlO1xuICB0aGlzLnByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiBwcm9taXNlRXhlY3V0b3IocmVzb2x2ZSkge1xuICAgIHJlc29sdmVQcm9taXNlID0gcmVzb2x2ZTtcbiAgfSk7XG5cbiAgdmFyIHRva2VuID0gdGhpcztcbiAgZXhlY3V0b3IoZnVuY3Rpb24gY2FuY2VsKG1lc3NhZ2UpIHtcbiAgICBpZiAodG9rZW4ucmVhc29uKSB7XG4gICAgICAvLyBDYW5jZWxsYXRpb24gaGFzIGFscmVhZHkgYmVlbiByZXF1ZXN0ZWRcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0b2tlbi5yZWFzb24gPSBuZXcgQ2FuY2VsKG1lc3NhZ2UpO1xuICAgIHJlc29sdmVQcm9taXNlKHRva2VuLnJlYXNvbik7XG4gIH0pO1xufVxuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbkNhbmNlbFRva2VuLnByb3RvdHlwZS50aHJvd0lmUmVxdWVzdGVkID0gZnVuY3Rpb24gdGhyb3dJZlJlcXVlc3RlZCgpIHtcbiAgaWYgKHRoaXMucmVhc29uKSB7XG4gICAgdGhyb3cgdGhpcy5yZWFzb247XG4gIH1cbn07XG5cbi8qKlxuICogUmV0dXJucyBhbiBvYmplY3QgdGhhdCBjb250YWlucyBhIG5ldyBgQ2FuY2VsVG9rZW5gIGFuZCBhIGZ1bmN0aW9uIHRoYXQsIHdoZW4gY2FsbGVkLFxuICogY2FuY2VscyB0aGUgYENhbmNlbFRva2VuYC5cbiAqL1xuQ2FuY2VsVG9rZW4uc291cmNlID0gZnVuY3Rpb24gc291cmNlKCkge1xuICB2YXIgY2FuY2VsO1xuICB2YXIgdG9rZW4gPSBuZXcgQ2FuY2VsVG9rZW4oZnVuY3Rpb24gZXhlY3V0b3IoYykge1xuICAgIGNhbmNlbCA9IGM7XG4gIH0pO1xuICByZXR1cm4ge1xuICAgIHRva2VuOiB0b2tlbixcbiAgICBjYW5jZWw6IGNhbmNlbFxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW5jZWxUb2tlbjtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0NhbmNlbCh2YWx1ZSkge1xuICByZXR1cm4gISEodmFsdWUgJiYgdmFsdWUuX19DQU5DRUxfXyk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgYnVpbGRVUkwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2J1aWxkVVJMJyk7XG52YXIgSW50ZXJjZXB0b3JNYW5hZ2VyID0gcmVxdWlyZSgnLi9JbnRlcmNlcHRvck1hbmFnZXInKTtcbnZhciBkaXNwYXRjaFJlcXVlc3QgPSByZXF1aXJlKCcuL2Rpc3BhdGNoUmVxdWVzdCcpO1xudmFyIG1lcmdlQ29uZmlnID0gcmVxdWlyZSgnLi9tZXJnZUNvbmZpZycpO1xuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBpbnN0YW5jZUNvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICovXG5mdW5jdGlvbiBBeGlvcyhpbnN0YW5jZUNvbmZpZykge1xuICB0aGlzLmRlZmF1bHRzID0gaW5zdGFuY2VDb25maWc7XG4gIHRoaXMuaW50ZXJjZXB0b3JzID0ge1xuICAgIHJlcXVlc3Q6IG5ldyBJbnRlcmNlcHRvck1hbmFnZXIoKSxcbiAgICByZXNwb25zZTogbmV3IEludGVyY2VwdG9yTWFuYWdlcigpXG4gIH07XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnIHNwZWNpZmljIGZvciB0aGlzIHJlcXVlc3QgKG1lcmdlZCB3aXRoIHRoaXMuZGVmYXVsdHMpXG4gKi9cbkF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0ID0gZnVuY3Rpb24gcmVxdWVzdChjb25maWcpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIC8vIEFsbG93IGZvciBheGlvcygnZXhhbXBsZS91cmwnWywgY29uZmlnXSkgYSBsYSBmZXRjaCBBUElcbiAgaWYgKHR5cGVvZiBjb25maWcgPT09ICdzdHJpbmcnKSB7XG4gICAgY29uZmlnID0gYXJndW1lbnRzWzFdIHx8IHt9O1xuICAgIGNvbmZpZy51cmwgPSBhcmd1bWVudHNbMF07XG4gIH0gZWxzZSB7XG4gICAgY29uZmlnID0gY29uZmlnIHx8IHt9O1xuICB9XG5cbiAgY29uZmlnID0gbWVyZ2VDb25maWcodGhpcy5kZWZhdWx0cywgY29uZmlnKTtcblxuICAvLyBTZXQgY29uZmlnLm1ldGhvZFxuICBpZiAoY29uZmlnLm1ldGhvZCkge1xuICAgIGNvbmZpZy5tZXRob2QgPSBjb25maWcubWV0aG9kLnRvTG93ZXJDYXNlKCk7XG4gIH0gZWxzZSBpZiAodGhpcy5kZWZhdWx0cy5tZXRob2QpIHtcbiAgICBjb25maWcubWV0aG9kID0gdGhpcy5kZWZhdWx0cy5tZXRob2QudG9Mb3dlckNhc2UoKTtcbiAgfSBlbHNlIHtcbiAgICBjb25maWcubWV0aG9kID0gJ2dldCc7XG4gIH1cblxuICAvLyBIb29rIHVwIGludGVyY2VwdG9ycyBtaWRkbGV3YXJlXG4gIHZhciBjaGFpbiA9IFtkaXNwYXRjaFJlcXVlc3QsIHVuZGVmaW5lZF07XG4gIHZhciBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKGNvbmZpZyk7XG5cbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVxdWVzdC5mb3JFYWNoKGZ1bmN0aW9uIHVuc2hpZnRSZXF1ZXN0SW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgY2hhaW4udW5zaGlmdChpbnRlcmNlcHRvci5mdWxmaWxsZWQsIGludGVyY2VwdG9yLnJlamVjdGVkKTtcbiAgfSk7XG5cbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVzcG9uc2UuZm9yRWFjaChmdW5jdGlvbiBwdXNoUmVzcG9uc2VJbnRlcmNlcHRvcnMoaW50ZXJjZXB0b3IpIHtcbiAgICBjaGFpbi5wdXNoKGludGVyY2VwdG9yLmZ1bGZpbGxlZCwgaW50ZXJjZXB0b3IucmVqZWN0ZWQpO1xuICB9KTtcblxuICB3aGlsZSAoY2hhaW4ubGVuZ3RoKSB7XG4gICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihjaGFpbi5zaGlmdCgpLCBjaGFpbi5zaGlmdCgpKTtcbiAgfVxuXG4gIHJldHVybiBwcm9taXNlO1xufTtcblxuQXhpb3MucHJvdG90eXBlLmdldFVyaSA9IGZ1bmN0aW9uIGdldFVyaShjb25maWcpIHtcbiAgY29uZmlnID0gbWVyZ2VDb25maWcodGhpcy5kZWZhdWx0cywgY29uZmlnKTtcbiAgcmV0dXJuIGJ1aWxkVVJMKGNvbmZpZy51cmwsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKS5yZXBsYWNlKC9eXFw/LywgJycpO1xufTtcblxuLy8gUHJvdmlkZSBhbGlhc2VzIGZvciBzdXBwb3J0ZWQgcmVxdWVzdCBtZXRob2RzXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ29wdGlvbnMnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZE5vRGF0YShtZXRob2QpIHtcbiAgLyplc2xpbnQgZnVuYy1uYW1lczowKi9cbiAgQXhpb3MucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih1cmwsIGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QobWVyZ2VDb25maWcoY29uZmlnIHx8IHt9LCB7XG4gICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgIHVybDogdXJsLFxuICAgICAgZGF0YTogKGNvbmZpZyB8fCB7fSkuZGF0YVxuICAgIH0pKTtcbiAgfTtcbn0pO1xuXG51dGlscy5mb3JFYWNoKFsncG9zdCcsICdwdXQnLCAncGF0Y2gnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZFdpdGhEYXRhKG1ldGhvZCkge1xuICAvKmVzbGludCBmdW5jLW5hbWVzOjAqL1xuICBBeGlvcy5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgY29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChtZXJnZUNvbmZpZyhjb25maWcgfHwge30sIHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgdXJsOiB1cmwsXG4gICAgICBkYXRhOiBkYXRhXG4gICAgfSkpO1xuICB9O1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQXhpb3M7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuZnVuY3Rpb24gSW50ZXJjZXB0b3JNYW5hZ2VyKCkge1xuICB0aGlzLmhhbmRsZXJzID0gW107XG59XG5cbi8qKlxuICogQWRkIGEgbmV3IGludGVyY2VwdG9yIHRvIHRoZSBzdGFja1xuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bGZpbGxlZCBUaGUgZnVuY3Rpb24gdG8gaGFuZGxlIGB0aGVuYCBmb3IgYSBgUHJvbWlzZWBcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlamVjdGVkIFRoZSBmdW5jdGlvbiB0byBoYW5kbGUgYHJlamVjdGAgZm9yIGEgYFByb21pc2VgXG4gKlxuICogQHJldHVybiB7TnVtYmVyfSBBbiBJRCB1c2VkIHRvIHJlbW92ZSBpbnRlcmNlcHRvciBsYXRlclxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uIHVzZShmdWxmaWxsZWQsIHJlamVjdGVkKSB7XG4gIHRoaXMuaGFuZGxlcnMucHVzaCh7XG4gICAgZnVsZmlsbGVkOiBmdWxmaWxsZWQsXG4gICAgcmVqZWN0ZWQ6IHJlamVjdGVkXG4gIH0pO1xuICByZXR1cm4gdGhpcy5oYW5kbGVycy5sZW5ndGggLSAxO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYW4gaW50ZXJjZXB0b3IgZnJvbSB0aGUgc3RhY2tcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gaWQgVGhlIElEIHRoYXQgd2FzIHJldHVybmVkIGJ5IGB1c2VgXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUuZWplY3QgPSBmdW5jdGlvbiBlamVjdChpZCkge1xuICBpZiAodGhpcy5oYW5kbGVyc1tpZF0pIHtcbiAgICB0aGlzLmhhbmRsZXJzW2lkXSA9IG51bGw7XG4gIH1cbn07XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFsbCB0aGUgcmVnaXN0ZXJlZCBpbnRlcmNlcHRvcnNcbiAqXG4gKiBUaGlzIG1ldGhvZCBpcyBwYXJ0aWN1bGFybHkgdXNlZnVsIGZvciBza2lwcGluZyBvdmVyIGFueVxuICogaW50ZXJjZXB0b3JzIHRoYXQgbWF5IGhhdmUgYmVjb21lIGBudWxsYCBjYWxsaW5nIGBlamVjdGAuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggaW50ZXJjZXB0b3JcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gZm9yRWFjaChmbikge1xuICB1dGlscy5mb3JFYWNoKHRoaXMuaGFuZGxlcnMsIGZ1bmN0aW9uIGZvckVhY2hIYW5kbGVyKGgpIHtcbiAgICBpZiAoaCAhPT0gbnVsbCkge1xuICAgICAgZm4oaCk7XG4gICAgfVxuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJjZXB0b3JNYW5hZ2VyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaXNBYnNvbHV0ZVVSTCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvaXNBYnNvbHV0ZVVSTCcpO1xudmFyIGNvbWJpbmVVUkxzID0gcmVxdWlyZSgnLi4vaGVscGVycy9jb21iaW5lVVJMcycpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgVVJMIGJ5IGNvbWJpbmluZyB0aGUgYmFzZVVSTCB3aXRoIHRoZSByZXF1ZXN0ZWRVUkwsXG4gKiBvbmx5IHdoZW4gdGhlIHJlcXVlc3RlZFVSTCBpcyBub3QgYWxyZWFkeSBhbiBhYnNvbHV0ZSBVUkwuXG4gKiBJZiB0aGUgcmVxdWVzdFVSTCBpcyBhYnNvbHV0ZSwgdGhpcyBmdW5jdGlvbiByZXR1cm5zIHRoZSByZXF1ZXN0ZWRVUkwgdW50b3VjaGVkLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlcXVlc3RlZFVSTCBBYnNvbHV0ZSBvciByZWxhdGl2ZSBVUkwgdG8gY29tYmluZVxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGNvbWJpbmVkIGZ1bGwgcGF0aFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJ1aWxkRnVsbFBhdGgoYmFzZVVSTCwgcmVxdWVzdGVkVVJMKSB7XG4gIGlmIChiYXNlVVJMICYmICFpc0Fic29sdXRlVVJMKHJlcXVlc3RlZFVSTCkpIHtcbiAgICByZXR1cm4gY29tYmluZVVSTHMoYmFzZVVSTCwgcmVxdWVzdGVkVVJMKTtcbiAgfVxuICByZXR1cm4gcmVxdWVzdGVkVVJMO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGVuaGFuY2VFcnJvciA9IHJlcXVpcmUoJy4vZW5oYW5jZUVycm9yJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBtZXNzYWdlLCBjb25maWcsIGVycm9yIGNvZGUsIHJlcXVlc3QgYW5kIHJlc3BvbnNlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIFRoZSBlcnJvciBtZXNzYWdlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBjcmVhdGVkIGVycm9yLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZUVycm9yKG1lc3NhZ2UsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgdmFyIGVycm9yID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xuICByZXR1cm4gZW5oYW5jZUVycm9yKGVycm9yLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciB0cmFuc2Zvcm1EYXRhID0gcmVxdWlyZSgnLi90cmFuc2Zvcm1EYXRhJyk7XG52YXIgaXNDYW5jZWwgPSByZXF1aXJlKCcuLi9jYW5jZWwvaXNDYW5jZWwnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4uL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogVGhyb3dzIGEgYENhbmNlbGAgaWYgY2FuY2VsbGF0aW9uIGhhcyBiZWVuIHJlcXVlc3RlZC5cbiAqL1xuZnVuY3Rpb24gdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpIHtcbiAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgIGNvbmZpZy5jYW5jZWxUb2tlbi50aHJvd0lmUmVxdWVzdGVkKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBEaXNwYXRjaCBhIHJlcXVlc3QgdG8gdGhlIHNlcnZlciB1c2luZyB0aGUgY29uZmlndXJlZCBhZGFwdGVyLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZyB0aGF0IGlzIHRvIGJlIHVzZWQgZm9yIHRoZSByZXF1ZXN0XG4gKiBAcmV0dXJucyB7UHJvbWlzZX0gVGhlIFByb21pc2UgdG8gYmUgZnVsZmlsbGVkXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGlzcGF0Y2hSZXF1ZXN0KGNvbmZpZykge1xuICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgLy8gRW5zdXJlIGhlYWRlcnMgZXhpc3RcbiAgY29uZmlnLmhlYWRlcnMgPSBjb25maWcuaGVhZGVycyB8fCB7fTtcblxuICAvLyBUcmFuc2Zvcm0gcmVxdWVzdCBkYXRhXG4gIGNvbmZpZy5kYXRhID0gdHJhbnNmb3JtRGF0YShcbiAgICBjb25maWcuZGF0YSxcbiAgICBjb25maWcuaGVhZGVycyxcbiAgICBjb25maWcudHJhbnNmb3JtUmVxdWVzdFxuICApO1xuXG4gIC8vIEZsYXR0ZW4gaGVhZGVyc1xuICBjb25maWcuaGVhZGVycyA9IHV0aWxzLm1lcmdlKFxuICAgIGNvbmZpZy5oZWFkZXJzLmNvbW1vbiB8fCB7fSxcbiAgICBjb25maWcuaGVhZGVyc1tjb25maWcubWV0aG9kXSB8fCB7fSxcbiAgICBjb25maWcuaGVhZGVyc1xuICApO1xuXG4gIHV0aWxzLmZvckVhY2goXG4gICAgWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnLCAncG9zdCcsICdwdXQnLCAncGF0Y2gnLCAnY29tbW9uJ10sXG4gICAgZnVuY3Rpb24gY2xlYW5IZWFkZXJDb25maWcobWV0aG9kKSB7XG4gICAgICBkZWxldGUgY29uZmlnLmhlYWRlcnNbbWV0aG9kXTtcbiAgICB9XG4gICk7XG5cbiAgdmFyIGFkYXB0ZXIgPSBjb25maWcuYWRhcHRlciB8fCBkZWZhdWx0cy5hZGFwdGVyO1xuXG4gIHJldHVybiBhZGFwdGVyKGNvbmZpZykudGhlbihmdW5jdGlvbiBvbkFkYXB0ZXJSZXNvbHV0aW9uKHJlc3BvbnNlKSB7XG4gICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgLy8gVHJhbnNmb3JtIHJlc3BvbnNlIGRhdGFcbiAgICByZXNwb25zZS5kYXRhID0gdHJhbnNmb3JtRGF0YShcbiAgICAgIHJlc3BvbnNlLmRhdGEsXG4gICAgICByZXNwb25zZS5oZWFkZXJzLFxuICAgICAgY29uZmlnLnRyYW5zZm9ybVJlc3BvbnNlXG4gICAgKTtcblxuICAgIHJldHVybiByZXNwb25zZTtcbiAgfSwgZnVuY3Rpb24gb25BZGFwdGVyUmVqZWN0aW9uKHJlYXNvbikge1xuICAgIGlmICghaXNDYW5jZWwocmVhc29uKSkge1xuICAgICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgICAvLyBUcmFuc2Zvcm0gcmVzcG9uc2UgZGF0YVxuICAgICAgaWYgKHJlYXNvbiAmJiByZWFzb24ucmVzcG9uc2UpIHtcbiAgICAgICAgcmVhc29uLnJlc3BvbnNlLmRhdGEgPSB0cmFuc2Zvcm1EYXRhKFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhLFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5oZWFkZXJzLFxuICAgICAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChyZWFzb24pO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVXBkYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBjb25maWcsIGVycm9yIGNvZGUsIGFuZCByZXNwb25zZS5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJvciBUaGUgZXJyb3IgdG8gdXBkYXRlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBlcnJvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgZXJyb3IuY29uZmlnID0gY29uZmlnO1xuICBpZiAoY29kZSkge1xuICAgIGVycm9yLmNvZGUgPSBjb2RlO1xuICB9XG5cbiAgZXJyb3IucmVxdWVzdCA9IHJlcXVlc3Q7XG4gIGVycm9yLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gIGVycm9yLmlzQXhpb3NFcnJvciA9IHRydWU7XG5cbiAgZXJyb3IudG9KU09OID0gZnVuY3Rpb24gdG9KU09OKCkge1xuICAgIHJldHVybiB7XG4gICAgICAvLyBTdGFuZGFyZFxuICAgICAgbWVzc2FnZTogdGhpcy5tZXNzYWdlLFxuICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgLy8gTWljcm9zb2Z0XG4gICAgICBkZXNjcmlwdGlvbjogdGhpcy5kZXNjcmlwdGlvbixcbiAgICAgIG51bWJlcjogdGhpcy5udW1iZXIsXG4gICAgICAvLyBNb3ppbGxhXG4gICAgICBmaWxlTmFtZTogdGhpcy5maWxlTmFtZSxcbiAgICAgIGxpbmVOdW1iZXI6IHRoaXMubGluZU51bWJlcixcbiAgICAgIGNvbHVtbk51bWJlcjogdGhpcy5jb2x1bW5OdW1iZXIsXG4gICAgICBzdGFjazogdGhpcy5zdGFjayxcbiAgICAgIC8vIEF4aW9zXG4gICAgICBjb25maWc6IHRoaXMuY29uZmlnLFxuICAgICAgY29kZTogdGhpcy5jb2RlXG4gICAgfTtcbiAgfTtcbiAgcmV0dXJuIGVycm9yO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxuLyoqXG4gKiBDb25maWctc3BlY2lmaWMgbWVyZ2UtZnVuY3Rpb24gd2hpY2ggY3JlYXRlcyBhIG5ldyBjb25maWctb2JqZWN0XG4gKiBieSBtZXJnaW5nIHR3byBjb25maWd1cmF0aW9uIG9iamVjdHMgdG9nZXRoZXIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZzFcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcyXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBOZXcgb2JqZWN0IHJlc3VsdGluZyBmcm9tIG1lcmdpbmcgY29uZmlnMiB0byBjb25maWcxXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbWVyZ2VDb25maWcoY29uZmlnMSwgY29uZmlnMikge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgY29uZmlnMiA9IGNvbmZpZzIgfHwge307XG4gIHZhciBjb25maWcgPSB7fTtcblxuICB2YXIgdmFsdWVGcm9tQ29uZmlnMktleXMgPSBbJ3VybCcsICdtZXRob2QnLCAnZGF0YSddO1xuICB2YXIgbWVyZ2VEZWVwUHJvcGVydGllc0tleXMgPSBbJ2hlYWRlcnMnLCAnYXV0aCcsICdwcm94eScsICdwYXJhbXMnXTtcbiAgdmFyIGRlZmF1bHRUb0NvbmZpZzJLZXlzID0gW1xuICAgICdiYXNlVVJMJywgJ3RyYW5zZm9ybVJlcXVlc3QnLCAndHJhbnNmb3JtUmVzcG9uc2UnLCAncGFyYW1zU2VyaWFsaXplcicsXG4gICAgJ3RpbWVvdXQnLCAndGltZW91dE1lc3NhZ2UnLCAnd2l0aENyZWRlbnRpYWxzJywgJ2FkYXB0ZXInLCAncmVzcG9uc2VUeXBlJywgJ3hzcmZDb29raWVOYW1lJyxcbiAgICAneHNyZkhlYWRlck5hbWUnLCAnb25VcGxvYWRQcm9ncmVzcycsICdvbkRvd25sb2FkUHJvZ3Jlc3MnLCAnZGVjb21wcmVzcycsXG4gICAgJ21heENvbnRlbnRMZW5ndGgnLCAnbWF4Qm9keUxlbmd0aCcsICdtYXhSZWRpcmVjdHMnLCAndHJhbnNwb3J0JywgJ2h0dHBBZ2VudCcsXG4gICAgJ2h0dHBzQWdlbnQnLCAnY2FuY2VsVG9rZW4nLCAnc29ja2V0UGF0aCcsICdyZXNwb25zZUVuY29kaW5nJ1xuICBdO1xuICB2YXIgZGlyZWN0TWVyZ2VLZXlzID0gWyd2YWxpZGF0ZVN0YXR1cyddO1xuXG4gIGZ1bmN0aW9uIGdldE1lcmdlZFZhbHVlKHRhcmdldCwgc291cmNlKSB7XG4gICAgaWYgKHV0aWxzLmlzUGxhaW5PYmplY3QodGFyZ2V0KSAmJiB1dGlscy5pc1BsYWluT2JqZWN0KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiB1dGlscy5tZXJnZSh0YXJnZXQsIHNvdXJjZSk7XG4gICAgfSBlbHNlIGlmICh1dGlscy5pc1BsYWluT2JqZWN0KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiB1dGlscy5tZXJnZSh7fSwgc291cmNlKTtcbiAgICB9IGVsc2UgaWYgKHV0aWxzLmlzQXJyYXkoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHNvdXJjZS5zbGljZSgpO1xuICAgIH1cbiAgICByZXR1cm4gc291cmNlO1xuICB9XG5cbiAgZnVuY3Rpb24gbWVyZ2VEZWVwUHJvcGVydGllcyhwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUoY29uZmlnMVtwcm9wXSwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMVtwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9XG5cbiAgdXRpbHMuZm9yRWFjaCh2YWx1ZUZyb21Db25maWcyS2V5cywgZnVuY3Rpb24gdmFsdWVGcm9tQ29uZmlnMihwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcyW3Byb3BdKTtcbiAgICB9XG4gIH0pO1xuXG4gIHV0aWxzLmZvckVhY2gobWVyZ2VEZWVwUHJvcGVydGllc0tleXMsIG1lcmdlRGVlcFByb3BlcnRpZXMpO1xuXG4gIHV0aWxzLmZvckVhY2goZGVmYXVsdFRvQ29uZmlnMktleXMsIGZ1bmN0aW9uIGRlZmF1bHRUb0NvbmZpZzIocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMVtwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9KTtcblxuICB1dGlscy5mb3JFYWNoKGRpcmVjdE1lcmdlS2V5cywgZnVuY3Rpb24gbWVyZ2UocHJvcCkge1xuICAgIGlmIChwcm9wIGluIGNvbmZpZzIpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKGNvbmZpZzFbcHJvcF0sIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAocHJvcCBpbiBjb25maWcxKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIGF4aW9zS2V5cyA9IHZhbHVlRnJvbUNvbmZpZzJLZXlzXG4gICAgLmNvbmNhdChtZXJnZURlZXBQcm9wZXJ0aWVzS2V5cylcbiAgICAuY29uY2F0KGRlZmF1bHRUb0NvbmZpZzJLZXlzKVxuICAgIC5jb25jYXQoZGlyZWN0TWVyZ2VLZXlzKTtcblxuICB2YXIgb3RoZXJLZXlzID0gT2JqZWN0XG4gICAgLmtleXMoY29uZmlnMSlcbiAgICAuY29uY2F0KE9iamVjdC5rZXlzKGNvbmZpZzIpKVxuICAgIC5maWx0ZXIoZnVuY3Rpb24gZmlsdGVyQXhpb3NLZXlzKGtleSkge1xuICAgICAgcmV0dXJuIGF4aW9zS2V5cy5pbmRleE9mKGtleSkgPT09IC0xO1xuICAgIH0pO1xuXG4gIHV0aWxzLmZvckVhY2gob3RoZXJLZXlzLCBtZXJnZURlZXBQcm9wZXJ0aWVzKTtcblxuICByZXR1cm4gY29uZmlnO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNyZWF0ZUVycm9yID0gcmVxdWlyZSgnLi9jcmVhdGVFcnJvcicpO1xuXG4vKipcbiAqIFJlc29sdmUgb3IgcmVqZWN0IGEgUHJvbWlzZSBiYXNlZCBvbiByZXNwb25zZSBzdGF0dXMuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVzb2x2ZSBBIGZ1bmN0aW9uIHRoYXQgcmVzb2x2ZXMgdGhlIHByb21pc2UuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWplY3QgQSBmdW5jdGlvbiB0aGF0IHJlamVjdHMgdGhlIHByb21pc2UuXG4gKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgVGhlIHJlc3BvbnNlLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHJlc3BvbnNlKSB7XG4gIHZhciB2YWxpZGF0ZVN0YXR1cyA9IHJlc3BvbnNlLmNvbmZpZy52YWxpZGF0ZVN0YXR1cztcbiAgaWYgKCFyZXNwb25zZS5zdGF0dXMgfHwgIXZhbGlkYXRlU3RhdHVzIHx8IHZhbGlkYXRlU3RhdHVzKHJlc3BvbnNlLnN0YXR1cykpIHtcbiAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgfSBlbHNlIHtcbiAgICByZWplY3QoY3JlYXRlRXJyb3IoXG4gICAgICAnUmVxdWVzdCBmYWlsZWQgd2l0aCBzdGF0dXMgY29kZSAnICsgcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgcmVzcG9uc2UuY29uZmlnLFxuICAgICAgbnVsbCxcbiAgICAgIHJlc3BvbnNlLnJlcXVlc3QsXG4gICAgICByZXNwb25zZVxuICAgICkpO1xuICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbi8qKlxuICogVHJhbnNmb3JtIHRoZSBkYXRhIGZvciBhIHJlcXVlc3Qgb3IgYSByZXNwb25zZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gZGF0YSBUaGUgZGF0YSB0byBiZSB0cmFuc2Zvcm1lZFxuICogQHBhcmFtIHtBcnJheX0gaGVhZGVycyBUaGUgaGVhZGVycyBmb3IgdGhlIHJlcXVlc3Qgb3IgcmVzcG9uc2VcbiAqIEBwYXJhbSB7QXJyYXl8RnVuY3Rpb259IGZucyBBIHNpbmdsZSBmdW5jdGlvbiBvciBBcnJheSBvZiBmdW5jdGlvbnNcbiAqIEByZXR1cm5zIHsqfSBUaGUgcmVzdWx0aW5nIHRyYW5zZm9ybWVkIGRhdGFcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0cmFuc2Zvcm1EYXRhKGRhdGEsIGhlYWRlcnMsIGZucykge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgdXRpbHMuZm9yRWFjaChmbnMsIGZ1bmN0aW9uIHRyYW5zZm9ybShmbikge1xuICAgIGRhdGEgPSBmbihkYXRhLCBoZWFkZXJzKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGRhdGE7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgbm9ybWFsaXplSGVhZGVyTmFtZSA9IHJlcXVpcmUoJy4vaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lJyk7XG5cbnZhciBERUZBVUxUX0NPTlRFTlRfVFlQRSA9IHtcbiAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG59O1xuXG5mdW5jdGlvbiBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgdmFsdWUpIHtcbiAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzKSAmJiB1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzWydDb250ZW50LVR5cGUnXSkpIHtcbiAgICBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9IHZhbHVlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldERlZmF1bHRBZGFwdGVyKCkge1xuICB2YXIgYWRhcHRlcjtcbiAgaWYgKHR5cGVvZiBYTUxIdHRwUmVxdWVzdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBGb3IgYnJvd3NlcnMgdXNlIFhIUiBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4vYWRhcHRlcnMveGhyJyk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChwcm9jZXNzKSA9PT0gJ1tvYmplY3QgcHJvY2Vzc10nKSB7XG4gICAgLy8gRm9yIG5vZGUgdXNlIEhUVFAgYWRhcHRlclxuICAgIGFkYXB0ZXIgPSByZXF1aXJlKCcuL2FkYXB0ZXJzL2h0dHAnKTtcbiAgfVxuICByZXR1cm4gYWRhcHRlcjtcbn1cblxudmFyIGRlZmF1bHRzID0ge1xuICBhZGFwdGVyOiBnZXREZWZhdWx0QWRhcHRlcigpLFxuXG4gIHRyYW5zZm9ybVJlcXVlc3Q6IFtmdW5jdGlvbiB0cmFuc2Zvcm1SZXF1ZXN0KGRhdGEsIGhlYWRlcnMpIHtcbiAgICBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsICdBY2NlcHQnKTtcbiAgICBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsICdDb250ZW50LVR5cGUnKTtcbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNBcnJheUJ1ZmZlcihkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzU3RyZWFtKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0ZpbGUoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQmxvYihkYXRhKVxuICAgICkge1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc0FycmF5QnVmZmVyVmlldyhkYXRhKSkge1xuICAgICAgcmV0dXJuIGRhdGEuYnVmZmVyO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMoZGF0YSkpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc09iamVjdChkYXRhKSkge1xuICAgICAgc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsICdhcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIHRyYW5zZm9ybVJlc3BvbnNlOiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVzcG9uc2UoZGF0YSkge1xuICAgIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGRhdGEgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgfSBjYXRjaCAoZSkgeyAvKiBJZ25vcmUgKi8gfVxuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgLyoqXG4gICAqIEEgdGltZW91dCBpbiBtaWxsaXNlY29uZHMgdG8gYWJvcnQgYSByZXF1ZXN0LiBJZiBzZXQgdG8gMCAoZGVmYXVsdCkgYVxuICAgKiB0aW1lb3V0IGlzIG5vdCBjcmVhdGVkLlxuICAgKi9cbiAgdGltZW91dDogMCxcblxuICB4c3JmQ29va2llTmFtZTogJ1hTUkYtVE9LRU4nLFxuICB4c3JmSGVhZGVyTmFtZTogJ1gtWFNSRi1UT0tFTicsXG5cbiAgbWF4Q29udGVudExlbmd0aDogLTEsXG4gIG1heEJvZHlMZW5ndGg6IC0xLFxuXG4gIHZhbGlkYXRlU3RhdHVzOiBmdW5jdGlvbiB2YWxpZGF0ZVN0YXR1cyhzdGF0dXMpIHtcbiAgICByZXR1cm4gc3RhdHVzID49IDIwMCAmJiBzdGF0dXMgPCAzMDA7XG4gIH1cbn07XG5cbmRlZmF1bHRzLmhlYWRlcnMgPSB7XG4gIGNvbW1vbjoge1xuICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbiwgdGV4dC9wbGFpbiwgKi8qJ1xuICB9XG59O1xuXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2ROb0RhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHt9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHV0aWxzLm1lcmdlKERFRkFVTFRfQ09OVEVOVF9UWVBFKTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmF1bHRzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJpbmQoZm4sIHRoaXNBcmcpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHdyYXAoKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhcmdzW2ldID0gYXJndW1lbnRzW2ldO1xuICAgIH1cbiAgICByZXR1cm4gZm4uYXBwbHkodGhpc0FyZywgYXJncyk7XG4gIH07XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbmZ1bmN0aW9uIGVuY29kZSh2YWwpIHtcbiAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudCh2YWwpLlxuICAgIHJlcGxhY2UoLyUzQS9naSwgJzonKS5cbiAgICByZXBsYWNlKC8lMjQvZywgJyQnKS5cbiAgICByZXBsYWNlKC8lMkMvZ2ksICcsJykuXG4gICAgcmVwbGFjZSgvJTIwL2csICcrJykuXG4gICAgcmVwbGFjZSgvJTVCL2dpLCAnWycpLlxuICAgIHJlcGxhY2UoLyU1RC9naSwgJ10nKTtcbn1cblxuLyoqXG4gKiBCdWlsZCBhIFVSTCBieSBhcHBlbmRpbmcgcGFyYW1zIHRvIHRoZSBlbmRcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIFRoZSBiYXNlIG9mIHRoZSB1cmwgKGUuZy4sIGh0dHA6Ly93d3cuZ29vZ2xlLmNvbSlcbiAqIEBwYXJhbSB7b2JqZWN0fSBbcGFyYW1zXSBUaGUgcGFyYW1zIHRvIGJlIGFwcGVuZGVkXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgZm9ybWF0dGVkIHVybFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJ1aWxkVVJMKHVybCwgcGFyYW1zLCBwYXJhbXNTZXJpYWxpemVyKSB7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICBpZiAoIXBhcmFtcykge1xuICAgIHJldHVybiB1cmw7XG4gIH1cblxuICB2YXIgc2VyaWFsaXplZFBhcmFtcztcbiAgaWYgKHBhcmFtc1NlcmlhbGl6ZXIpIHtcbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFyYW1zU2VyaWFsaXplcihwYXJhbXMpO1xuICB9IGVsc2UgaWYgKHV0aWxzLmlzVVJMU2VhcmNoUGFyYW1zKHBhcmFtcykpIHtcbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFyYW1zLnRvU3RyaW5nKCk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIHBhcnRzID0gW107XG5cbiAgICB1dGlscy5mb3JFYWNoKHBhcmFtcywgZnVuY3Rpb24gc2VyaWFsaXplKHZhbCwga2V5KSB7XG4gICAgICBpZiAodmFsID09PSBudWxsIHx8IHR5cGVvZiB2YWwgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHV0aWxzLmlzQXJyYXkodmFsKSkge1xuICAgICAgICBrZXkgPSBrZXkgKyAnW10nO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsID0gW3ZhbF07XG4gICAgICB9XG5cbiAgICAgIHV0aWxzLmZvckVhY2godmFsLCBmdW5jdGlvbiBwYXJzZVZhbHVlKHYpIHtcbiAgICAgICAgaWYgKHV0aWxzLmlzRGF0ZSh2KSkge1xuICAgICAgICAgIHYgPSB2LnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodXRpbHMuaXNPYmplY3QodikpIHtcbiAgICAgICAgICB2ID0gSlNPTi5zdHJpbmdpZnkodik7XG4gICAgICAgIH1cbiAgICAgICAgcGFydHMucHVzaChlbmNvZGUoa2V5KSArICc9JyArIGVuY29kZSh2KSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJ0cy5qb2luKCcmJyk7XG4gIH1cblxuICBpZiAoc2VyaWFsaXplZFBhcmFtcykge1xuICAgIHZhciBoYXNobWFya0luZGV4ID0gdXJsLmluZGV4T2YoJyMnKTtcbiAgICBpZiAoaGFzaG1hcmtJbmRleCAhPT0gLTEpIHtcbiAgICAgIHVybCA9IHVybC5zbGljZSgwLCBoYXNobWFya0luZGV4KTtcbiAgICB9XG5cbiAgICB1cmwgKz0gKHVybC5pbmRleE9mKCc/JykgPT09IC0xID8gJz8nIDogJyYnKSArIHNlcmlhbGl6ZWRQYXJhbXM7XG4gIH1cblxuICByZXR1cm4gdXJsO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IFVSTCBieSBjb21iaW5pbmcgdGhlIHNwZWNpZmllZCBVUkxzXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VVUkwgVGhlIGJhc2UgVVJMXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpdmVVUkwgVGhlIHJlbGF0aXZlIFVSTFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGNvbWJpbmVkIFVSTFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNvbWJpbmVVUkxzKGJhc2VVUkwsIHJlbGF0aXZlVVJMKSB7XG4gIHJldHVybiByZWxhdGl2ZVVSTFxuICAgID8gYmFzZVVSTC5yZXBsYWNlKC9cXC8rJC8sICcnKSArICcvJyArIHJlbGF0aXZlVVJMLnJlcGxhY2UoL15cXC8rLywgJycpXG4gICAgOiBiYXNlVVJMO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChcbiAgdXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSA/XG5cbiAgLy8gU3RhbmRhcmQgYnJvd3NlciBlbnZzIHN1cHBvcnQgZG9jdW1lbnQuY29va2llXG4gICAgKGZ1bmN0aW9uIHN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHdyaXRlOiBmdW5jdGlvbiB3cml0ZShuYW1lLCB2YWx1ZSwgZXhwaXJlcywgcGF0aCwgZG9tYWluLCBzZWN1cmUpIHtcbiAgICAgICAgICB2YXIgY29va2llID0gW107XG4gICAgICAgICAgY29va2llLnB1c2gobmFtZSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpO1xuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzTnVtYmVyKGV4cGlyZXMpKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnZXhwaXJlcz0nICsgbmV3IERhdGUoZXhwaXJlcykudG9HTVRTdHJpbmcoKSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzU3RyaW5nKHBhdGgpKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgncGF0aD0nICsgcGF0aCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzU3RyaW5nKGRvbWFpbikpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdkb21haW49JyArIGRvbWFpbik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHNlY3VyZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ3NlY3VyZScpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGRvY3VtZW50LmNvb2tpZSA9IGNvb2tpZS5qb2luKCc7ICcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlYWQ6IGZ1bmN0aW9uIHJlYWQobmFtZSkge1xuICAgICAgICAgIHZhciBtYXRjaCA9IGRvY3VtZW50LmNvb2tpZS5tYXRjaChuZXcgUmVnRXhwKCcoXnw7XFxcXHMqKSgnICsgbmFtZSArICcpPShbXjtdKiknKSk7XG4gICAgICAgICAgcmV0dXJuIChtYXRjaCA/IGRlY29kZVVSSUNvbXBvbmVudChtYXRjaFszXSkgOiBudWxsKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZShuYW1lKSB7XG4gICAgICAgICAgdGhpcy53cml0ZShuYW1lLCAnJywgRGF0ZS5ub3coKSAtIDg2NDAwMDAwKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KSgpIDpcblxuICAvLyBOb24gc3RhbmRhcmQgYnJvd3NlciBlbnYgKHdlYiB3b3JrZXJzLCByZWFjdC1uYXRpdmUpIGxhY2sgbmVlZGVkIHN1cHBvcnQuXG4gICAgKGZ1bmN0aW9uIG5vblN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHdyaXRlOiBmdW5jdGlvbiB3cml0ZSgpIHt9LFxuICAgICAgICByZWFkOiBmdW5jdGlvbiByZWFkKCkgeyByZXR1cm4gbnVsbDsgfSxcbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7fVxuICAgICAgfTtcbiAgICB9KSgpXG4pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVGhlIFVSTCB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBYnNvbHV0ZVVSTCh1cmwpIHtcbiAgLy8gQSBVUkwgaXMgY29uc2lkZXJlZCBhYnNvbHV0ZSBpZiBpdCBiZWdpbnMgd2l0aCBcIjxzY2hlbWU+Oi8vXCIgb3IgXCIvL1wiIChwcm90b2NvbC1yZWxhdGl2ZSBVUkwpLlxuICAvLyBSRkMgMzk4NiBkZWZpbmVzIHNjaGVtZSBuYW1lIGFzIGEgc2VxdWVuY2Ugb2YgY2hhcmFjdGVycyBiZWdpbm5pbmcgd2l0aCBhIGxldHRlciBhbmQgZm9sbG93ZWRcbiAgLy8gYnkgYW55IGNvbWJpbmF0aW9uIG9mIGxldHRlcnMsIGRpZ2l0cywgcGx1cywgcGVyaW9kLCBvciBoeXBoZW4uXG4gIHJldHVybiAvXihbYS16XVthLXpcXGRcXCtcXC1cXC5dKjopP1xcL1xcLy9pLnRlc3QodXJsKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBwYXlsb2FkIGlzIGFuIGVycm9yIHRocm93biBieSBBeGlvc1xuICpcbiAqIEBwYXJhbSB7Kn0gcGF5bG9hZCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHBheWxvYWQgaXMgYW4gZXJyb3IgdGhyb3duIGJ5IEF4aW9zLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0F4aW9zRXJyb3IocGF5bG9hZCkge1xuICByZXR1cm4gKHR5cGVvZiBwYXlsb2FkID09PSAnb2JqZWN0JykgJiYgKHBheWxvYWQuaXNBeGlvc0Vycm9yID09PSB0cnVlKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoXG4gIHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkgP1xuXG4gIC8vIFN0YW5kYXJkIGJyb3dzZXIgZW52cyBoYXZlIGZ1bGwgc3VwcG9ydCBvZiB0aGUgQVBJcyBuZWVkZWQgdG8gdGVzdFxuICAvLyB3aGV0aGVyIHRoZSByZXF1ZXN0IFVSTCBpcyBvZiB0aGUgc2FtZSBvcmlnaW4gYXMgY3VycmVudCBsb2NhdGlvbi5cbiAgICAoZnVuY3Rpb24gc3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgdmFyIG1zaWUgPSAvKG1zaWV8dHJpZGVudCkvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuICAgICAgdmFyIHVybFBhcnNpbmdOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgdmFyIG9yaWdpblVSTDtcblxuICAgICAgLyoqXG4gICAgKiBQYXJzZSBhIFVSTCB0byBkaXNjb3ZlciBpdCdzIGNvbXBvbmVudHNcbiAgICAqXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsIFRoZSBVUkwgdG8gYmUgcGFyc2VkXG4gICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgICovXG4gICAgICBmdW5jdGlvbiByZXNvbHZlVVJMKHVybCkge1xuICAgICAgICB2YXIgaHJlZiA9IHVybDtcblxuICAgICAgICBpZiAobXNpZSkge1xuICAgICAgICAvLyBJRSBuZWVkcyBhdHRyaWJ1dGUgc2V0IHR3aWNlIHRvIG5vcm1hbGl6ZSBwcm9wZXJ0aWVzXG4gICAgICAgICAgdXJsUGFyc2luZ05vZGUuc2V0QXR0cmlidXRlKCdocmVmJywgaHJlZik7XG4gICAgICAgICAgaHJlZiA9IHVybFBhcnNpbmdOb2RlLmhyZWY7XG4gICAgICAgIH1cblxuICAgICAgICB1cmxQYXJzaW5nTm9kZS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBocmVmKTtcblxuICAgICAgICAvLyB1cmxQYXJzaW5nTm9kZSBwcm92aWRlcyB0aGUgVXJsVXRpbHMgaW50ZXJmYWNlIC0gaHR0cDovL3VybC5zcGVjLndoYXR3Zy5vcmcvI3VybHV0aWxzXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaHJlZjogdXJsUGFyc2luZ05vZGUuaHJlZixcbiAgICAgICAgICBwcm90b2NvbDogdXJsUGFyc2luZ05vZGUucHJvdG9jb2wgPyB1cmxQYXJzaW5nTm9kZS5wcm90b2NvbC5yZXBsYWNlKC86JC8sICcnKSA6ICcnLFxuICAgICAgICAgIGhvc3Q6IHVybFBhcnNpbmdOb2RlLmhvc3QsXG4gICAgICAgICAgc2VhcmNoOiB1cmxQYXJzaW5nTm9kZS5zZWFyY2ggPyB1cmxQYXJzaW5nTm9kZS5zZWFyY2gucmVwbGFjZSgvXlxcPy8sICcnKSA6ICcnLFxuICAgICAgICAgIGhhc2g6IHVybFBhcnNpbmdOb2RlLmhhc2ggPyB1cmxQYXJzaW5nTm9kZS5oYXNoLnJlcGxhY2UoL14jLywgJycpIDogJycsXG4gICAgICAgICAgaG9zdG5hbWU6IHVybFBhcnNpbmdOb2RlLmhvc3RuYW1lLFxuICAgICAgICAgIHBvcnQ6IHVybFBhcnNpbmdOb2RlLnBvcnQsXG4gICAgICAgICAgcGF0aG5hbWU6ICh1cmxQYXJzaW5nTm9kZS5wYXRobmFtZS5jaGFyQXQoMCkgPT09ICcvJykgP1xuICAgICAgICAgICAgdXJsUGFyc2luZ05vZGUucGF0aG5hbWUgOlxuICAgICAgICAgICAgJy8nICsgdXJsUGFyc2luZ05vZGUucGF0aG5hbWVcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgb3JpZ2luVVJMID0gcmVzb2x2ZVVSTCh3aW5kb3cubG9jYXRpb24uaHJlZik7XG5cbiAgICAgIC8qKlxuICAgICogRGV0ZXJtaW5lIGlmIGEgVVJMIHNoYXJlcyB0aGUgc2FtZSBvcmlnaW4gYXMgdGhlIGN1cnJlbnQgbG9jYXRpb25cbiAgICAqXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gcmVxdWVzdFVSTCBUaGUgVVJMIHRvIHRlc3RcbiAgICAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIFVSTCBzaGFyZXMgdGhlIHNhbWUgb3JpZ2luLCBvdGhlcndpc2UgZmFsc2VcbiAgICAqL1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIGlzVVJMU2FtZU9yaWdpbihyZXF1ZXN0VVJMKSB7XG4gICAgICAgIHZhciBwYXJzZWQgPSAodXRpbHMuaXNTdHJpbmcocmVxdWVzdFVSTCkpID8gcmVzb2x2ZVVSTChyZXF1ZXN0VVJMKSA6IHJlcXVlc3RVUkw7XG4gICAgICAgIHJldHVybiAocGFyc2VkLnByb3RvY29sID09PSBvcmlnaW5VUkwucHJvdG9jb2wgJiZcbiAgICAgICAgICAgIHBhcnNlZC5ob3N0ID09PSBvcmlnaW5VUkwuaG9zdCk7XG4gICAgICB9O1xuICAgIH0pKCkgOlxuXG4gIC8vIE5vbiBzdGFuZGFyZCBicm93c2VyIGVudnMgKHdlYiB3b3JrZXJzLCByZWFjdC1uYXRpdmUpIGxhY2sgbmVlZGVkIHN1cHBvcnQuXG4gICAgKGZ1bmN0aW9uIG5vblN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiBpc1VSTFNhbWVPcmlnaW4oKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfTtcbiAgICB9KSgpXG4pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgbm9ybWFsaXplZE5hbWUpIHtcbiAgdXRpbHMuZm9yRWFjaChoZWFkZXJzLCBmdW5jdGlvbiBwcm9jZXNzSGVhZGVyKHZhbHVlLCBuYW1lKSB7XG4gICAgaWYgKG5hbWUgIT09IG5vcm1hbGl6ZWROYW1lICYmIG5hbWUudG9VcHBlckNhc2UoKSA9PT0gbm9ybWFsaXplZE5hbWUudG9VcHBlckNhc2UoKSkge1xuICAgICAgaGVhZGVyc1tub3JtYWxpemVkTmFtZV0gPSB2YWx1ZTtcbiAgICAgIGRlbGV0ZSBoZWFkZXJzW25hbWVdO1xuICAgIH1cbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbi8vIEhlYWRlcnMgd2hvc2UgZHVwbGljYXRlcyBhcmUgaWdub3JlZCBieSBub2RlXG4vLyBjLmYuIGh0dHBzOi8vbm9kZWpzLm9yZy9hcGkvaHR0cC5odG1sI2h0dHBfbWVzc2FnZV9oZWFkZXJzXG52YXIgaWdub3JlRHVwbGljYXRlT2YgPSBbXG4gICdhZ2UnLCAnYXV0aG9yaXphdGlvbicsICdjb250ZW50LWxlbmd0aCcsICdjb250ZW50LXR5cGUnLCAnZXRhZycsXG4gICdleHBpcmVzJywgJ2Zyb20nLCAnaG9zdCcsICdpZi1tb2RpZmllZC1zaW5jZScsICdpZi11bm1vZGlmaWVkLXNpbmNlJyxcbiAgJ2xhc3QtbW9kaWZpZWQnLCAnbG9jYXRpb24nLCAnbWF4LWZvcndhcmRzJywgJ3Byb3h5LWF1dGhvcml6YXRpb24nLFxuICAncmVmZXJlcicsICdyZXRyeS1hZnRlcicsICd1c2VyLWFnZW50J1xuXTtcblxuLyoqXG4gKiBQYXJzZSBoZWFkZXJzIGludG8gYW4gb2JqZWN0XG4gKlxuICogYGBgXG4gKiBEYXRlOiBXZWQsIDI3IEF1ZyAyMDE0IDA4OjU4OjQ5IEdNVFxuICogQ29udGVudC1UeXBlOiBhcHBsaWNhdGlvbi9qc29uXG4gKiBDb25uZWN0aW9uOiBrZWVwLWFsaXZlXG4gKiBUcmFuc2Zlci1FbmNvZGluZzogY2h1bmtlZFxuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGhlYWRlcnMgSGVhZGVycyBuZWVkaW5nIHRvIGJlIHBhcnNlZFxuICogQHJldHVybnMge09iamVjdH0gSGVhZGVycyBwYXJzZWQgaW50byBhbiBvYmplY3RcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwYXJzZUhlYWRlcnMoaGVhZGVycykge1xuICB2YXIgcGFyc2VkID0ge307XG4gIHZhciBrZXk7XG4gIHZhciB2YWw7XG4gIHZhciBpO1xuXG4gIGlmICghaGVhZGVycykgeyByZXR1cm4gcGFyc2VkOyB9XG5cbiAgdXRpbHMuZm9yRWFjaChoZWFkZXJzLnNwbGl0KCdcXG4nKSwgZnVuY3Rpb24gcGFyc2VyKGxpbmUpIHtcbiAgICBpID0gbGluZS5pbmRleE9mKCc6Jyk7XG4gICAga2V5ID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cigwLCBpKSkudG9Mb3dlckNhc2UoKTtcbiAgICB2YWwgPSB1dGlscy50cmltKGxpbmUuc3Vic3RyKGkgKyAxKSk7XG5cbiAgICBpZiAoa2V5KSB7XG4gICAgICBpZiAocGFyc2VkW2tleV0gJiYgaWdub3JlRHVwbGljYXRlT2YuaW5kZXhPZihrZXkpID49IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGtleSA9PT0gJ3NldC1jb29raWUnKSB7XG4gICAgICAgIHBhcnNlZFtrZXldID0gKHBhcnNlZFtrZXldID8gcGFyc2VkW2tleV0gOiBbXSkuY29uY2F0KFt2YWxdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcnNlZFtrZXldID0gcGFyc2VkW2tleV0gPyBwYXJzZWRba2V5XSArICcsICcgKyB2YWwgOiB2YWw7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gcGFyc2VkO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBTeW50YWN0aWMgc3VnYXIgZm9yIGludm9raW5nIGEgZnVuY3Rpb24gYW5kIGV4cGFuZGluZyBhbiBhcnJheSBmb3IgYXJndW1lbnRzLlxuICpcbiAqIENvbW1vbiB1c2UgY2FzZSB3b3VsZCBiZSB0byB1c2UgYEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseWAuXG4gKlxuICogIGBgYGpzXG4gKiAgZnVuY3Rpb24gZih4LCB5LCB6KSB7fVxuICogIHZhciBhcmdzID0gWzEsIDIsIDNdO1xuICogIGYuYXBwbHkobnVsbCwgYXJncyk7XG4gKiAgYGBgXG4gKlxuICogV2l0aCBgc3ByZWFkYCB0aGlzIGV4YW1wbGUgY2FuIGJlIHJlLXdyaXR0ZW4uXG4gKlxuICogIGBgYGpzXG4gKiAgc3ByZWFkKGZ1bmN0aW9uKHgsIHksIHopIHt9KShbMSwgMiwgM10pO1xuICogIGBgYFxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc3ByZWFkKGNhbGxiYWNrKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKGFycikge1xuICAgIHJldHVybiBjYWxsYmFjay5hcHBseShudWxsLCBhcnIpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGJpbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvYmluZCcpO1xuXG4vKmdsb2JhbCB0b1N0cmluZzp0cnVlKi9cblxuLy8gdXRpbHMgaXMgYSBsaWJyYXJ5IG9mIGdlbmVyaWMgaGVscGVyIGZ1bmN0aW9ucyBub24tc3BlY2lmaWMgdG8gYXhpb3NcblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyB1bmRlZmluZWRcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmFsdWUgaXMgdW5kZWZpbmVkLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVbmRlZmluZWQodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgQnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNCdWZmZXIodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgIWlzVW5kZWZpbmVkKHZhbCkgJiYgdmFsLmNvbnN0cnVjdG9yICE9PSBudWxsICYmICFpc1VuZGVmaW5lZCh2YWwuY29uc3RydWN0b3IpXG4gICAgJiYgdHlwZW9mIHZhbC5jb25zdHJ1Y3Rvci5pc0J1ZmZlciA9PT0gJ2Z1bmN0aW9uJyAmJiB2YWwuY29uc3RydWN0b3IuaXNCdWZmZXIodmFsKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5QnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlcih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZvcm1EYXRhXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gRm9ybURhdGEsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Zvcm1EYXRhKHZhbCkge1xuICByZXR1cm4gKHR5cGVvZiBGb3JtRGF0YSAhPT0gJ3VuZGVmaW5lZCcpICYmICh2YWwgaW5zdGFuY2VvZiBGb3JtRGF0YSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSB2aWV3IG9uIGFuIEFycmF5QnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSB2aWV3IG9uIGFuIEFycmF5QnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlclZpZXcodmFsKSB7XG4gIHZhciByZXN1bHQ7XG4gIGlmICgodHlwZW9mIEFycmF5QnVmZmVyICE9PSAndW5kZWZpbmVkJykgJiYgKEFycmF5QnVmZmVyLmlzVmlldykpIHtcbiAgICByZXN1bHQgPSBBcnJheUJ1ZmZlci5pc1ZpZXcodmFsKTtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQgPSAodmFsKSAmJiAodmFsLmJ1ZmZlcikgJiYgKHZhbC5idWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcik7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFN0cmluZ1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgU3RyaW5nLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTdHJpbmcodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAnc3RyaW5nJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIE51bWJlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgTnVtYmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNOdW1iZXIodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAnbnVtYmVyJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBPYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBPYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0Jztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIHBsYWluIE9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBwbGFpbiBPYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1BsYWluT2JqZWN0KHZhbCkge1xuICBpZiAodG9TdHJpbmcuY2FsbCh2YWwpICE9PSAnW29iamVjdCBPYmplY3RdJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBwcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsKTtcbiAgcmV0dXJuIHByb3RvdHlwZSA9PT0gbnVsbCB8fCBwcm90b3R5cGUgPT09IE9iamVjdC5wcm90b3R5cGU7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBEYXRlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBEYXRlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNEYXRlKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGaWxlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBGaWxlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGaWxlKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGaWxlXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBCbG9iXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBCbG9iLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNCbG9iKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBCbG9iXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGdW5jdGlvblxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRnVuY3Rpb24sIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgU3RyZWFtXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBTdHJlYW0sIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N0cmVhbSh2YWwpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHZhbCkgJiYgaXNGdW5jdGlvbih2YWwucGlwZSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVUkxTZWFyY2hQYXJhbXModmFsKSB7XG4gIHJldHVybiB0eXBlb2YgVVJMU2VhcmNoUGFyYW1zICE9PSAndW5kZWZpbmVkJyAmJiB2YWwgaW5zdGFuY2VvZiBVUkxTZWFyY2hQYXJhbXM7XG59XG5cbi8qKlxuICogVHJpbSBleGNlc3Mgd2hpdGVzcGFjZSBvZmYgdGhlIGJlZ2lubmluZyBhbmQgZW5kIG9mIGEgc3RyaW5nXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0ciBUaGUgU3RyaW5nIHRvIHRyaW1cbiAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBTdHJpbmcgZnJlZWQgb2YgZXhjZXNzIHdoaXRlc3BhY2VcbiAqL1xuZnVuY3Rpb24gdHJpbShzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzKi8sICcnKS5yZXBsYWNlKC9cXHMqJC8sICcnKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgd2UncmUgcnVubmluZyBpbiBhIHN0YW5kYXJkIGJyb3dzZXIgZW52aXJvbm1lbnRcbiAqXG4gKiBUaGlzIGFsbG93cyBheGlvcyB0byBydW4gaW4gYSB3ZWIgd29ya2VyLCBhbmQgcmVhY3QtbmF0aXZlLlxuICogQm90aCBlbnZpcm9ubWVudHMgc3VwcG9ydCBYTUxIdHRwUmVxdWVzdCwgYnV0IG5vdCBmdWxseSBzdGFuZGFyZCBnbG9iYWxzLlxuICpcbiAqIHdlYiB3b3JrZXJzOlxuICogIHR5cGVvZiB3aW5kb3cgLT4gdW5kZWZpbmVkXG4gKiAgdHlwZW9mIGRvY3VtZW50IC0+IHVuZGVmaW5lZFxuICpcbiAqIHJlYWN0LW5hdGl2ZTpcbiAqICBuYXZpZ2F0b3IucHJvZHVjdCAtPiAnUmVhY3ROYXRpdmUnXG4gKiBuYXRpdmVzY3JpcHRcbiAqICBuYXZpZ2F0b3IucHJvZHVjdCAtPiAnTmF0aXZlU2NyaXB0JyBvciAnTlMnXG4gKi9cbmZ1bmN0aW9uIGlzU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICBpZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgKG5hdmlnYXRvci5wcm9kdWN0ID09PSAnUmVhY3ROYXRpdmUnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLnByb2R1Y3QgPT09ICdOYXRpdmVTY3JpcHQnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLnByb2R1Y3QgPT09ICdOUycpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiAoXG4gICAgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnXG4gICk7XG59XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFuIEFycmF5IG9yIGFuIE9iamVjdCBpbnZva2luZyBhIGZ1bmN0aW9uIGZvciBlYWNoIGl0ZW0uXG4gKlxuICogSWYgYG9iamAgaXMgYW4gQXJyYXkgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgcGFzc2luZ1xuICogdGhlIHZhbHVlLCBpbmRleCwgYW5kIGNvbXBsZXRlIGFycmF5IGZvciBlYWNoIGl0ZW0uXG4gKlxuICogSWYgJ29iaicgaXMgYW4gT2JqZWN0IGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIHBhc3NpbmdcbiAqIHRoZSB2YWx1ZSwga2V5LCBhbmQgY29tcGxldGUgb2JqZWN0IGZvciBlYWNoIHByb3BlcnR5LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fEFycmF5fSBvYmogVGhlIG9iamVjdCB0byBpdGVyYXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgY2FsbGJhY2sgdG8gaW52b2tlIGZvciBlYWNoIGl0ZW1cbiAqL1xuZnVuY3Rpb24gZm9yRWFjaChvYmosIGZuKSB7XG4gIC8vIERvbid0IGJvdGhlciBpZiBubyB2YWx1ZSBwcm92aWRlZFxuICBpZiAob2JqID09PSBudWxsIHx8IHR5cGVvZiBvYmogPT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gRm9yY2UgYW4gYXJyYXkgaWYgbm90IGFscmVhZHkgc29tZXRoaW5nIGl0ZXJhYmxlXG4gIGlmICh0eXBlb2Ygb2JqICE9PSAnb2JqZWN0Jykge1xuICAgIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAgIG9iaiA9IFtvYmpdO1xuICB9XG5cbiAgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgIC8vIEl0ZXJhdGUgb3ZlciBhcnJheSB2YWx1ZXNcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IG9iai5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGZuLmNhbGwobnVsbCwgb2JqW2ldLCBpLCBvYmopO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBJdGVyYXRlIG92ZXIgb2JqZWN0IGtleXNcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkge1xuICAgICAgICBmbi5jYWxsKG51bGwsIG9ialtrZXldLCBrZXksIG9iaik7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQWNjZXB0cyB2YXJhcmdzIGV4cGVjdGluZyBlYWNoIGFyZ3VtZW50IHRvIGJlIGFuIG9iamVjdCwgdGhlblxuICogaW1tdXRhYmx5IG1lcmdlcyB0aGUgcHJvcGVydGllcyBvZiBlYWNoIG9iamVjdCBhbmQgcmV0dXJucyByZXN1bHQuXG4gKlxuICogV2hlbiBtdWx0aXBsZSBvYmplY3RzIGNvbnRhaW4gdGhlIHNhbWUga2V5IHRoZSBsYXRlciBvYmplY3QgaW5cbiAqIHRoZSBhcmd1bWVudHMgbGlzdCB3aWxsIHRha2UgcHJlY2VkZW5jZS5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqIGBgYGpzXG4gKiB2YXIgcmVzdWx0ID0gbWVyZ2Uoe2ZvbzogMTIzfSwge2ZvbzogNDU2fSk7XG4gKiBjb25zb2xlLmxvZyhyZXN1bHQuZm9vKTsgLy8gb3V0cHV0cyA0NTZcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmoxIE9iamVjdCB0byBtZXJnZVxuICogQHJldHVybnMge09iamVjdH0gUmVzdWx0IG9mIGFsbCBtZXJnZSBwcm9wZXJ0aWVzXG4gKi9cbmZ1bmN0aW9uIG1lcmdlKC8qIG9iajEsIG9iajIsIG9iajMsIC4uLiAqLykge1xuICB2YXIgcmVzdWx0ID0ge307XG4gIGZ1bmN0aW9uIGFzc2lnblZhbHVlKHZhbCwga2V5KSB7XG4gICAgaWYgKGlzUGxhaW5PYmplY3QocmVzdWx0W2tleV0pICYmIGlzUGxhaW5PYmplY3QodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSBtZXJnZShyZXN1bHRba2V5XSwgdmFsKTtcbiAgICB9IGVsc2UgaWYgKGlzUGxhaW5PYmplY3QodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSBtZXJnZSh7fSwgdmFsKTtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWwuc2xpY2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWw7XG4gICAgfVxuICB9XG5cbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgZm9yRWFjaChhcmd1bWVudHNbaV0sIGFzc2lnblZhbHVlKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEV4dGVuZHMgb2JqZWN0IGEgYnkgbXV0YWJseSBhZGRpbmcgdG8gaXQgdGhlIHByb3BlcnRpZXMgb2Ygb2JqZWN0IGIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGEgVGhlIG9iamVjdCB0byBiZSBleHRlbmRlZFxuICogQHBhcmFtIHtPYmplY3R9IGIgVGhlIG9iamVjdCB0byBjb3B5IHByb3BlcnRpZXMgZnJvbVxuICogQHBhcmFtIHtPYmplY3R9IHRoaXNBcmcgVGhlIG9iamVjdCB0byBiaW5kIGZ1bmN0aW9uIHRvXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSByZXN1bHRpbmcgdmFsdWUgb2Ygb2JqZWN0IGFcbiAqL1xuZnVuY3Rpb24gZXh0ZW5kKGEsIGIsIHRoaXNBcmcpIHtcbiAgZm9yRWFjaChiLCBmdW5jdGlvbiBhc3NpZ25WYWx1ZSh2YWwsIGtleSkge1xuICAgIGlmICh0aGlzQXJnICYmIHR5cGVvZiB2YWwgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGFba2V5XSA9IGJpbmQodmFsLCB0aGlzQXJnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYVtrZXldID0gdmFsO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBhO1xufVxuXG4vKipcbiAqIFJlbW92ZSBieXRlIG9yZGVyIG1hcmtlci4gVGhpcyBjYXRjaGVzIEVGIEJCIEJGICh0aGUgVVRGLTggQk9NKVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZW50IHdpdGggQk9NXG4gKiBAcmV0dXJuIHtzdHJpbmd9IGNvbnRlbnQgdmFsdWUgd2l0aG91dCBCT01cbiAqL1xuZnVuY3Rpb24gc3RyaXBCT00oY29udGVudCkge1xuICBpZiAoY29udGVudC5jaGFyQ29kZUF0KDApID09PSAweEZFRkYpIHtcbiAgICBjb250ZW50ID0gY29udGVudC5zbGljZSgxKTtcbiAgfVxuICByZXR1cm4gY29udGVudDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzQXJyYXk6IGlzQXJyYXksXG4gIGlzQXJyYXlCdWZmZXI6IGlzQXJyYXlCdWZmZXIsXG4gIGlzQnVmZmVyOiBpc0J1ZmZlcixcbiAgaXNGb3JtRGF0YTogaXNGb3JtRGF0YSxcbiAgaXNBcnJheUJ1ZmZlclZpZXc6IGlzQXJyYXlCdWZmZXJWaWV3LFxuICBpc1N0cmluZzogaXNTdHJpbmcsXG4gIGlzTnVtYmVyOiBpc051bWJlcixcbiAgaXNPYmplY3Q6IGlzT2JqZWN0LFxuICBpc1BsYWluT2JqZWN0OiBpc1BsYWluT2JqZWN0LFxuICBpc1VuZGVmaW5lZDogaXNVbmRlZmluZWQsXG4gIGlzRGF0ZTogaXNEYXRlLFxuICBpc0ZpbGU6IGlzRmlsZSxcbiAgaXNCbG9iOiBpc0Jsb2IsXG4gIGlzRnVuY3Rpb246IGlzRnVuY3Rpb24sXG4gIGlzU3RyZWFtOiBpc1N0cmVhbSxcbiAgaXNVUkxTZWFyY2hQYXJhbXM6IGlzVVJMU2VhcmNoUGFyYW1zLFxuICBpc1N0YW5kYXJkQnJvd3NlckVudjogaXNTdGFuZGFyZEJyb3dzZXJFbnYsXG4gIGZvckVhY2g6IGZvckVhY2gsXG4gIG1lcmdlOiBtZXJnZSxcbiAgZXh0ZW5kOiBleHRlbmQsXG4gIHRyaW06IHRyaW0sXG4gIHN0cmlwQk9NOiBzdHJpcEJPTVxufTtcbiIsIi8vIEltcG9ydHNcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fIGZyb20gXCIuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvY3NzV2l0aE1hcHBpbmdUb1N0cmluZy5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyBmcm9tIFwiLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfR0VUX1VSTF9JTVBPUlRfX18gZnJvbSBcIi4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9nZXRVcmwuanNcIjtcbmltcG9ydCBfX19DU1NfTE9BREVSX1VSTF9JTVBPUlRfMF9fXyBmcm9tIFwiLi4vLi4vYXBwL3N0YXRpYy9pbWcvU1ZHL2Fycm93LWRvd24yLnN2Z1wiO1xudmFyIF9fX0NTU19MT0FERVJfRVhQT1JUX19fID0gX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fKF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18pO1xudmFyIF9fX0NTU19MT0FERVJfVVJMX1JFUExBQ0VNRU5UXzBfX18gPSBfX19DU1NfTE9BREVSX0dFVF9VUkxfSU1QT1JUX19fKF9fX0NTU19MT0FERVJfVVJMX0lNUE9SVF8wX19fKTtcbi8vIE1vZHVsZVxuX19fQ1NTX0xPQURFUl9FWFBPUlRfX18ucHVzaChbbW9kdWxlLmlkLCBcIiosXFxuKjo6YWZ0ZXIsXFxuKjo6YmVmb3JlIHtcXG4gIG1hcmdpbjogMDtcXG4gIHBhZGRpbmc6IDA7XFxuICBib3gtc2l6aW5nOiBpbmhlcml0OyB9XFxuXFxuaHRtbCB7XFxuICBmb250LXNpemU6IDYyLjUlOyB9XFxuXFxuYm9keSB7XFxuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbiAgZm9udC1zaXplOiAxLjZyZW07XFxuICBiYWNrZ3JvdW5kLXNpemU6IGNvdmVyO1xcbiAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcXG4gIGhlaWdodDogMTI3LjVyZW07XFxuICBmb250LWZhbWlseTogJ0xhdG8nLCBzYW5zLXNlcmlmO1xcbiAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuXFxuW2hpZGRlbl0ge1xcbiAgZGlzcGxheTogbm9uZSAhaW1wb3J0YW50OyB9XFxuXFxuLmhlYWRpbmctdGVydGlhcnkge1xcbiAgZm9udC1zaXplOiAyLjRyZW07XFxuICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOyB9XFxuICAuaGVhZGluZy10ZXJ0aWFyeS0td2hpdGUge1xcbiAgICBjb2xvcjogI2ZmZjsgfVxcblxcbi5oZWFkaW5nLXByaW1hcnkge1xcbiAgZm9udC1zaXplOiAzcmVtO1xcbiAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcXG4gIGZvbnQtd2VpZ2h0OiAzMDA7XFxuICBjb2xvcjogI2ZmZjsgfVxcblxcbi5tYi0xMCB7XFxuICBtYXJnaW4tYm90dG9tOiAxcmVtOyB9XFxuXFxuLm1iLTIwIHtcXG4gIG1hcmdpbi1ib3R0b206IDJyZW07IH1cXG5cXG4ubXQtNTAge1xcbiAgbWFyZ2luLXRvcDogNXJlbTsgfVxcblxcbi5idG4sIC5idG46bGluaywgLmJ0bjp2aXNpdGVkIHtcXG4gIHBhZGRpbmc6IC43NXJlbSAycmVtO1xcbiAgYm9yZGVyLXJhZGl1czogLjVyZW07XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjJmMmYyO1xcbiAgZm9udC13ZWlnaHQ6IDQwMDtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jazsgfVxcblxcbi5idG46YWN0aXZlLCAuYnRuOmZvY3VzIHtcXG4gIG91dGxpbmU6IG5vbmU7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTFweCk7XFxuICBib3gtc2hhZG93OiAwIDAuNXJlbSAxcmVtIHJnYmEoMCwgMCwgMCwgMC4yKTsgfVxcblxcbi5sb2dpbixcXG4ucmVnaXN0ZXIge1xcbiAgbWluLWhlaWdodDogY2FsYygxMDB2aCAtIDYuMXJlbSk7XFxuICB3aWR0aDogMTAwdnc7XFxuICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQodG8gdG9wLCAjNWY0ZjY2LCAjMzQyMzMyKTtcXG4gIGJhY2tncm91bmQtcmVwZWF0OiBuby1yZXBlYXQ7XFxuICBiYWNrZ3JvdW5kLXNpemU6IGNvdmVyO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfVxcbiAgLmxvZ2luLWltZyxcXG4gIC5yZWdpc3Rlci1pbWcge1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIGJvcmRlci1yYWRpdXM6IDEwMCU7XFxuICAgIGhlaWdodDogOC41cmVtO1xcbiAgICB3aWR0aDogOC41cmVtO1xcbiAgICB0b3A6IC0xNSU7IH1cXG4gIC5sb2dpbl9fZm9ybSxcXG4gIC5yZWdpc3Rlcl9fZm9ybSB7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzFlMmEzODtcXG4gICAgYm9yZGVyOiAycHggc29saWQgIzFlMmEzODtcXG4gICAgYm94LXNoYWRvdzogMHB4IDJweCA1cHggcmdiYSgwLCAwLCAwLCAwLjI1KTtcXG4gICAgbWF4LXdpZHRoOiAzMnJlbTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1mbG93OiBjb2x1bW4gbm93cmFwO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBwYWRkaW5nOiA0cmVtIDAgMi42cmVtIDA7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtMjUlKTsgfVxcbiAgLmxvZ2luX19mb3JtLWluc3RydWN0aW9ucyxcXG4gIC5yZWdpc3Rlcl9fZm9ybS1pbnN0cnVjdGlvbnMge1xcbiAgICBjb2xvcjogI2ZmZjtcXG4gICAgZm9udC1zaXplOiAxLjRyZW07XFxuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcXG4gICAgd2lkdGg6IDkwJTsgfVxcbiAgLmxvZ2luX19mb3JtLWdyb3VwLFxcbiAgLnJlZ2lzdGVyX19mb3JtLWdyb3VwIHtcXG4gICAgd2lkdGg6IDkwJTsgfVxcbiAgLmxvZ2luX19mb3JtLWlucHV0LFxcbiAgLnJlZ2lzdGVyX19mb3JtLWlucHV0IHtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIG1hcmdpbjogMCBhdXRvO1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMik7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMCwgMCwgMC4xKTtcXG4gICAgYm94LXNoYWRvdzogcmdiYSgwLCAwLCAwLCAwLjUpO1xcbiAgICBib3JkZXItcmFkaXVzOiAycHg7XFxuICAgIG1hcmdpbi1ib3R0b206IDFyZW07XFxuICAgIGxpbmUtaGVpZ2h0OiAxLjI1O1xcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICAgIGhlaWdodDogNC4ycmVtO1xcbiAgICBwYWRkaW5nOiAxcmVtIDEuNHJlbTtcXG4gICAgY2FyZXQtY29sb3I6ICNmZmY7XFxuICAgIGNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNzUpOyB9XFxuICAgIC5sb2dpbl9fZm9ybS1pbnB1dDo6cGxhY2Vob2xkZXIsXFxuICAgIC5yZWdpc3Rlcl9fZm9ybS1pbnB1dDo6cGxhY2Vob2xkZXIge1xcbiAgICAgIGZvbnQtd2VpZ2h0OiAzMDA7XFxuICAgICAgY29sb3I6ICNlNmU2ZTY7XFxuICAgICAgZm9udC1zaXplOiAxLjhyZW07IH1cXG4gICAgLmxvZ2luX19mb3JtLWlucHV0OmZvY3VzLFxcbiAgICAucmVnaXN0ZXJfX2Zvcm0taW5wdXQ6Zm9jdXMge1xcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC43NSk7IH1cXG4gIC5sb2dpbl9fZm9ybS1idG4sXFxuICAucmVnaXN0ZXJfX2Zvcm0tYnRuIHtcXG4gICAgd2lkdGg6IDkwJTtcXG4gICAgYm9yZGVyLXJhZGl1czogMnB4O1xcbiAgICBwYWRkaW5nOiAwIDEuNHJlbTtcXG4gICAgbWFyZ2luOiAxcmVtIGF1dG8gMCBhdXRvO1xcbiAgICBib3gtc2hhZG93OiAwIDJweCA1cHggcmdiYSgwLCAwLCAwLCAwLjI1KTtcXG4gICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWFyb3VuZDtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgaGVpZ2h0OiA0LjJyZW07IH1cXG4gICAgLmxvZ2luX19mb3JtLWJ0bi0tbG9naW4sXFxuICAgIC5yZWdpc3Rlcl9fZm9ybS1idG4tLWxvZ2luIHtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuODcpO1xcbiAgICAgIGNvbG9yOiAjMTYxNjFkO1xcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkICNmZmY7IH1cXG4gICAgICAubG9naW5fX2Zvcm0tYnRuLS1sb2dpbjpob3ZlcixcXG4gICAgICAucmVnaXN0ZXJfX2Zvcm0tYnRuLS1sb2dpbjpob3ZlciB7XFxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgICAgICAgY29sb3I6ICMzNDI0NDI7IH1cXG4gICAgICAubG9naW5fX2Zvcm0tYnRuLS1sb2dpbjpob3ZlciAubG9naW5fX2Zvcm0taWNvbi1wYXRoLS1sb2dpbixcXG4gICAgICAucmVnaXN0ZXJfX2Zvcm0tYnRuLS1sb2dpbjpob3ZlciAubG9naW5fX2Zvcm0taWNvbi1wYXRoLS1sb2dpbiB7XFxuICAgICAgICBmaWxsOiAjMzQyNDQyOyB9XFxuICAgICAgLmxvZ2luX19mb3JtLWJ0bi0tbG9naW46OmFmdGVyLFxcbiAgICAgIC5yZWdpc3Rlcl9fZm9ybS1idG4tLWxvZ2luOjphZnRlciB7XFxuICAgICAgICBtYXJnaW4tYm90dG9tOiAxcHggc29saWQgd2hpdGU7IH1cXG4gICAgLmxvZ2luX19mb3JtLWJ0bi0tcmVnaXN0ZXIsXFxuICAgIC5yZWdpc3Rlcl9fZm9ybS1idG4tLXJlZ2lzdGVyIHtcXG4gICAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpO1xcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNSk7XFxuICAgICAgY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC43NSk7IH1cXG4gICAgICAubG9naW5fX2Zvcm0tYnRuLS1yZWdpc3Rlcjpob3ZlcixcXG4gICAgICAucmVnaXN0ZXJfX2Zvcm0tYnRuLS1yZWdpc3Rlcjpob3ZlciB7XFxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMjUpO1xcbiAgICAgICAgY29sb3I6ICNmZmY7IH1cXG4gICAgICAubG9naW5fX2Zvcm0tYnRuLS1yZWdpc3Rlcjpob3ZlciAubG9naW5fX2Zvcm0taWNvbi1wYXRoLS1sb2dpbixcXG4gICAgICAucmVnaXN0ZXJfX2Zvcm0tYnRuLS1yZWdpc3Rlcjpob3ZlciAubG9naW5fX2Zvcm0taWNvbi1wYXRoLS1sb2dpbiB7XFxuICAgICAgICBmaWxsOiAjZmZmOyB9XFxuICAgIC5sb2dpbl9fZm9ybS1idG4gc3BhbixcXG4gICAgLnJlZ2lzdGVyX19mb3JtLWJ0biBzcGFuIHtcXG4gICAgICBtYXJnaW4tcmlnaHQ6IDFyZW07IH1cXG4gIC5sb2dpbl9fZm9ybS1pY29uLFxcbiAgLnJlZ2lzdGVyX19mb3JtLWljb24ge1xcbiAgICBoZWlnaHQ6IDEuNXJlbTtcXG4gICAgd2lkdGg6IDEuNXJlbTtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDE3JSk7IH1cXG4gIC5sb2dpbl9fZm9ybS1pY29uLXBhdGgtLWxvZ2luLFxcbiAgLnJlZ2lzdGVyX19mb3JtLWljb24tcGF0aC0tbG9naW4ge1xcbiAgICBmaWxsOiAjMTYxNjFkOyB9XFxuICAubG9naW5fX2Zvcm0taWNvbi1wYXRoLS1yZWdpc3RlcixcXG4gIC5yZWdpc3Rlcl9fZm9ybS1pY29uLXBhdGgtLXJlZ2lzdGVyIHtcXG4gICAgZmlsbDogI2ZmZjsgfVxcbiAgLmxvZ2luX19mb3JtLWhyLFxcbiAgLnJlZ2lzdGVyX19mb3JtLWhyIHtcXG4gICAgd2lkdGg6IDkwJTtcXG4gICAgbWFyZ2luOiAycmVtIDAgMXJlbSAwO1xcbiAgICBtYXJnaW4tYm90dG9tOiAwLjI1cHggc29saWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjI1KTsgfVxcblxcbi5uYXYge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICBwYWRkaW5nOiAxcmVtIDE2JTtcXG4gIGJhY2tncm91bmQtY29sb3I6ICMyYjI1M2E7XFxuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgIzAwMDsgfVxcbiAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA3NXJlbSkge1xcbiAgICAubmF2IHtcXG4gICAgICBwYWRkaW5nOiAxLjJyZW0gMi41JTsgfSB9XFxuICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDQzLjc1ZW0pIHtcXG4gICAgLm5hdiB7XFxuICAgICAgcGFkZGluZzogMXJlbTsgfSB9XFxuICAubmF2X19sZWZ0IHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleDogMCAwIDUwJTsgfVxcbiAgLm5hdl9fcmlnaHQge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBib3JkZXItcmlnaHQ6IDFweCBzb2xpZCAjZmZmO1xcbiAgICBib3JkZXItbGVmdDogMXB4IHNvbGlkICNmZmY7XFxuICAgIHBhZGRpbmctbGVmdDogMXJlbTtcXG4gICAgbWFyZ2luLWxlZnQ6IGF1dG87IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA0MC42MjVlbSkge1xcbiAgICAgIC5uYXZfX3JpZ2h0IHtcXG4gICAgICAgIGRpc3BsYXk6IG5vbmU7IH0gfVxcbiAgICAubmF2X19yaWdodCA+ICoge1xcbiAgICAgIG1hcmdpbi1yaWdodDogMXJlbTsgfVxcbiAgLm5hdl9faXRlbS0tc2VhcmNoIHtcXG4gICAgZmxleDogMCAwIDI1JTsgfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDQwLjYyNWVtKSB7XFxuICAgICAgLm5hdl9faXRlbS0tc2VhcmNoIHtcXG4gICAgICAgIGRpc3BsYXk6IG5vbmU7IH0gfVxcbiAgLm5hdl9faXRlbS0taG9tZSB7XFxuICAgIG1hcmdpbi1yaWdodDogM3JlbTsgfVxcbiAgLm5hdl9fbGluayB7XFxuICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gICAgY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC43NSk7XFxuICAgIHRyYW5zaXRpb246IGFsbCAwLjJzOyB9XFxuICAgIC5uYXZfX2xpbms6aG92ZXIge1xcbiAgICAgIG1hcmdpbi1ib3R0b206IDJweDtcXG4gICAgICBjb2xvcjogI2ZmZjtcXG4gICAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2ZmZjsgfVxcbiAgICAubmF2X19saW5rLS1ob21lOmhvdmVyIC5uYXZfX2ljb24tcGF0aC0taG9tZSB7XFxuICAgICAgZmlsbDogI2ZmZjsgfVxcbiAgLm5hdl9fc2VhcmNoIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcbiAgICAubmF2X19zZWFyY2gtaW5wdXQge1xcbiAgICAgIGJvcmRlcjogbm9uZTtcXG4gICAgICBwYWRkaW5nOiAxcmVtIDJyZW07XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzJiMjUzYTtcXG4gICAgICBjYXJldC1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjc1KTtcXG4gICAgICBjb2xvcjogI2ZmZjsgfVxcbiAgICAgIC5uYXZfX3NlYXJjaC1pbnB1dDo6cGxhY2Vob2xkZXIge1xcbiAgICAgICAgY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC43NSk7IH1cXG4gICAgICAubmF2X19zZWFyY2gtaW5wdXQ6Zm9jdXMge1xcbiAgICAgICAgb3V0bGluZTogbm9uZTsgfVxcbiAgICAubmF2X19zZWFyY2gtYnRuIHtcXG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICAgIGxlZnQ6IDJyZW07XFxuICAgICAgdG9wOiAxcmVtOyB9XFxuICAgICAgLm5hdl9fc2VhcmNoLWJ0bjpob3ZlciAubmF2X19pY29uLXBhdGgtLXNlYXJjaCB7XFxuICAgICAgICBmaWxsOiAjZmZmOyB9XFxuICAubmF2X19pY29uLXNpemluZy0taG9tZSB7XFxuICAgIHdpZHRoOiAzcmVtO1xcbiAgICBoZWlnaHQ6IDNyZW07IH1cXG4gIC5uYXZfX2ljb24tc2l6aW5nLS1zZWFyY2gge1xcbiAgICB3aWR0aDogMnJlbTtcXG4gICAgaGVpZ2h0OiAycmVtO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTE1MCUpOyB9XFxuICAubmF2X19pY29uLXBhdGgtLWhvbWUge1xcbiAgICBmaWxsOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNzUpOyB9XFxuICAubmF2X19pY29uLXBhdGgtLXNlYXJjaCB7XFxuICAgIGZpbGw6ICNiZmJmYmY7IH1cXG4gIC5uYXZfX21vYmlsZSB7XFxuICAgIGRpc3BsYXk6IG5vbmU7IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA0MC42MjVlbSkge1xcbiAgICAgIC5uYXZfX21vYmlsZSB7XFxuICAgICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgICAgZmxleDogMCAwIDUwJTtcXG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGVuZDsgfSB9XFxuICAgIC5uYXZfX21vYmlsZS1saW5rcyB7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzJiMjUzYTtcXG4gICAgICBmbGV4LWZsb3c6IHdyYXA7XFxuICAgICAgcGFkZGluZzogMXJlbSAwO1xcbiAgICAgIGp1c3RpZnktY29udGVudDogZmxleC1zdGFydDtcXG4gICAgICBkaXNwbGF5OiBub25lOyB9XFxuICAgIC5uYXZfX21vYmlsZS1saW5rIHtcXG4gICAgICBmbGV4OiAwIDAgNDglO1xcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoODUsIDI2LCAxMzksIDAuNSk7XFxuICAgICAgYm9yZGVyLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNik7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpO1xcbiAgICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgICBtYXJnaW4tdG9wOiAwLjZyZW07XFxuICAgICAgbWFyZ2luLWxlZnQ6IDElO1xcbiAgICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gICAgICBjb2xvcjogI2ZmZjtcXG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgICAgbGluZS1oZWlnaHQ6IDEuNDtcXG4gICAgICBwYWRkaW5nOiAwLjJyZW0gMXJlbSAwIDFyZW07XFxuICAgICAgaGVpZ2h0OiAyLjhyZW07XFxuICAgICAgdHJhbnNpdGlvbjogYWxsIDAuMnM7XFxuICAgICAgYm94LXNoYWRvdzogMCAxcHggMXB4IDAgcmdiYSgwLCAwLCAwLCAwLjA2KTtcXG4gICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICAgICAgdHJhbnNpdGlvbjogYWxsIDAuMnM7IH1cXG4gICAgICAubmF2X19tb2JpbGUtbGluazpob3ZlciB7XFxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMjUpOyB9XFxuICAgIC5uYXZfX21vYmlsZS1oYW1idXJnZXItd3JhcHBlciB7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICAgIG1hcmdpbi1yaWdodDogMXJlbTtcXG4gICAgICBoZWlnaHQ6IDNyZW07XFxuICAgICAgd2lkdGg6IDNyZW07IH1cXG4gICAgLm5hdl9fbW9iaWxlLWhhbWJ1cmdlciB7XFxuICAgICAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuICAgICAgLm5hdl9fbW9iaWxlLWhhbWJ1cmdlciwgLm5hdl9fbW9iaWxlLWhhbWJ1cmdlcjo6YmVmb3JlLCAubmF2X19tb2JpbGUtaGFtYnVyZ2VyOjphZnRlciB7XFxuICAgICAgICB3aWR0aDogM3JlbTtcXG4gICAgICAgIGhlaWdodDogMnB4O1xcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjc1KTtcXG4gICAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jazsgfVxcbiAgICAgIC5uYXZfX21vYmlsZS1oYW1idXJnZXI6OmJlZm9yZSwgLm5hdl9fbW9iaWxlLWhhbWJ1cmdlcjo6YWZ0ZXIge1xcbiAgICAgICAgY29udGVudDogJyc7XFxuICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgICAgICBsZWZ0OiAwOyB9XFxuICAgICAgLm5hdl9fbW9iaWxlLWhhbWJ1cmdlcjo6YmVmb3JlIHtcXG4gICAgICAgIG1hcmdpbi10b3A6IC0wLjhyZW07IH1cXG4gICAgICAubmF2X19tb2JpbGUtaGFtYnVyZ2VyOjphZnRlciB7XFxuICAgICAgICBtYXJnaW4tdG9wOiAwLjhyZW07IH1cXG5cXG4uZXJyb3Ige1xcbiAgbWFyZ2luLXRvcDogMnJlbTtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZjgwODA7XFxuICBib3JkZXItcmFkaXVzOiAxMHB4O1xcbiAgcGFkZGluZzogMnJlbTtcXG4gIGZvbnQtc2l6ZTogMnJlbTtcXG4gIGdyaWQtY29sdW1uOiBjZW50ZXItc3RhcnQgLyBjZW50ZXItZW5kO1xcbiAgZm9udC13ZWlnaHQ6IDcwMDsgfVxcblxcbi5zZWFyY2gtZm9ybSB7XFxuICBwYWRkaW5nOiAycmVtIDI1cmVtO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2ZkZmRmZDtcXG4gIG1pbi1oZWlnaHQ6IGNhbGMoMTAwdmggLSA2LjJyZW0pOyB9XFxuICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDgxLjI1ZW0pIHtcXG4gICAgLnNlYXJjaC1mb3JtIHtcXG4gICAgICBwYWRkaW5nOiAycmVtIDE1cmVtOyB9IH1cXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNjIuNWVtKSB7XFxuICAgIC5zZWFyY2gtZm9ybSB7XFxuICAgICAgcGFkZGluZzogMnJlbSA1cmVtOyB9IH1cXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNTYuMjVlbSkge1xcbiAgICAuc2VhcmNoLWZvcm0ge1xcbiAgICAgIHBhZGRpbmc6IDJyZW0gMXJlbTsgfSB9XFxuICAuc2VhcmNoLWZvcm1fX2dyb3VwIHtcXG4gICAgd2lkdGg6IDc1JTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgbWFyZ2luLWJvdHRvbTogM3JlbTtcXG4gICAgYWxpZ24taXRlbXM6IGZsZXgtc3RhcnQ7XFxuICAgIHBhZGRpbmc6IDAuNXJlbSA0cmVtIDAuNXJlbSAwO1xcbiAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgcmdiYSgwLCAwLCAwLCAwLjIpOyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogOTMuNzVlbSkge1xcbiAgICAgIC5zZWFyY2gtZm9ybV9fZ3JvdXAge1xcbiAgICAgICAgd2lkdGg6IDEwMCU7IH0gfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDQ2Ljg3NWVtKSB7XFxuICAgICAgLnNlYXJjaC1mb3JtX19ncm91cCB7XFxuICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9IH1cXG4gICAgLnNlYXJjaC1mb3JtX19ncm91cDpudGgtY2hpbGQoMTApIHtcXG4gICAgICBib3JkZXItYm90dG9tOiBub25lOyB9XFxuICAgIC5zZWFyY2gtZm9ybV9fZ3JvdXAtLW5vLWJvcmRlciB7XFxuICAgICAgYm9yZGVyLWJvdHRvbTogbm9uZTsgfVxcbiAgLnNlYXJjaC1mb3JtX19sYWJlbCB7XFxuICAgIGZsZXg6IDAgMCAyMCU7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBmbGV4LXN0YXJ0O1xcbiAgICBmb250LXdlaWdodDogMzAwO1xcbiAgICBtYXJnaW4tdG9wOiAwLjdyZW07XFxuICAgIGNvbG9yOiAjNTUxYThiOyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNDYuODc1ZW0pIHtcXG4gICAgICAuc2VhcmNoLWZvcm1fX2xhYmVsIHtcXG4gICAgICAgIG1hcmdpbi1ib3R0b206IDEuMnJlbTtcXG4gICAgICAgIG1hcmdpbi1sZWZ0OiAxcmVtOyB9IH1cXG4gIC5zZWFyY2gtZm9ybV9fZ3JvdXAtaW5wdXQtd3JhcHBlciB7XFxuICAgIGZsZXg6IDAgMCA4MCU7IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA0Ni44NzVlbSkge1xcbiAgICAgIC5zZWFyY2gtZm9ybV9fZ3JvdXAtaW5wdXQtd3JhcHBlciB7XFxuICAgICAgICBmbGV4OiAwIDAgMTAwJTtcXG4gICAgICAgIHdpZHRoOiAxMDAlOyB9IH1cXG4gIC5zZWFyY2gtZm9ybV9faW5wdXQtd3JhcHBlciB7XFxuICAgIGZsZXg6IDAgMCA4MCU7IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA0Ni44NzVlbSkge1xcbiAgICAgIC5zZWFyY2gtZm9ybV9faW5wdXQtd3JhcHBlciB7XFxuICAgICAgICBmbGV4OiAwIDAgMTAwJTtcXG4gICAgICAgIHdpZHRoOiAxMDAlOyB9IH1cXG4gIC5zZWFyY2gtZm9ybV9fdGlwIHtcXG4gICAgZm9udC1zaXplOiAxcmVtO1xcbiAgICBsaW5lLWhlaWdodDogMS40O1xcbiAgICB3aWR0aDogNzAlOyB9XFxuICAuc2VhcmNoLWZvcm1fX2lucHV0LXRleHQge1xcbiAgICB3aWR0aDogNDByZW07XFxuICAgIGhlaWdodDogNHJlbTtcXG4gICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcXG4gICAgcGFkZGluZzogMXJlbTtcXG4gICAgYm9yZGVyOiBzb2xpZCAxcHggI2JmYmZiZjtcXG4gICAgYm9yZGVyLXJhZGl1czogNXB4OyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogMjguMTI1ZW0pIHtcXG4gICAgICAuc2VhcmNoLWZvcm1fX2lucHV0LXRleHQge1xcbiAgICAgICAgd2lkdGg6IDMwcmVtOyB9IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiAyMS44NzVlbSkge1xcbiAgICAgIC5zZWFyY2gtZm9ybV9faW5wdXQtdGV4dCB7XFxuICAgICAgICB3aWR0aDogMjByZW07IH0gfVxcbiAgICAuc2VhcmNoLWZvcm1fX2lucHV0LXRleHQ6Zm9jdXMge1xcbiAgICAgIGJvcmRlcjogc29saWQgMXB4ICMwMDA7IH1cXG4gIC5zZWFyY2gtZm9ybV9faW5wdXQtaW50ZWdlciB7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkICNhZWFlYWU7XFxuICAgIGhlaWdodDogMy41cmVtO1xcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XFxuICAgIHBhZGRpbmctbGVmdDogMC41cmVtO1xcbiAgICBwYWRkaW5nLXJpZ2h0OiAwLjVyZW07XFxuICAgIGJveC1zaGFkb3c6IDAgMXB4IDFweCAwIHJnYmEoMCwgMCwgMCwgMC4wNik7IH1cXG4gICAgLnNlYXJjaC1mb3JtX19pbnB1dC1pbnRlZ2VyLS1yZWxhdGl2ZSB7XFxuICAgICAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogMzcuNWVtKSB7XFxuICAgICAgLnNlYXJjaC1mb3JtX19pbnB1dC1pbnRlZ2VyIHtcXG4gICAgICAgIG1heC13aWR0aDogMzAlOyB9IH1cXG4gIC5zZWFyY2gtZm9ybV9fZ3JvdXAtLWNoZWNrYm94IHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgbWFyZ2luLWJvdHRvbTogMXJlbTsgfVxcbiAgLnNlYXJjaC1mb3JtX19ncm91cC1jb2xvcnMtbGVmdCwgLnNlYXJjaC1mb3JtX19ncm91cC1jb2xvcnMtcmlnaHQge1xcbiAgICBkaXNwbGF5OiBmbGV4OyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogODEuMjVlbSkge1xcbiAgICAgIC5zZWFyY2gtZm9ybV9fZ3JvdXAtY29sb3JzLWxlZnQsIC5zZWFyY2gtZm9ybV9fZ3JvdXAtY29sb3JzLXJpZ2h0IHtcXG4gICAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH0gfVxcbiAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA4MS4yNWVtKSB7XFxuICAgIC5zZWFyY2gtZm9ybV9fZ3JvdXAtY29sb3JzLWxlZnQge1xcbiAgICAgIG1hcmdpbi1yaWdodDogM3JlbTsgfSB9XFxuICAuc2VhcmNoLWZvcm1fX2dyb3VwLXJhcml0eS1sZWZ0LCAuc2VhcmNoLWZvcm1fX2dyb3VwLXJhcml0eS1yaWdodCB7XFxuICAgIGRpc3BsYXk6IGZsZXg7IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiAyOC4xMjVlbSkge1xcbiAgICAgIC5zZWFyY2gtZm9ybV9fZ3JvdXAtcmFyaXR5LWxlZnQsIC5zZWFyY2gtZm9ybV9fZ3JvdXAtcmFyaXR5LXJpZ2h0IHtcXG4gICAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH0gfVxcbiAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA4MS4yNWVtKSB7XFxuICAgIC5zZWFyY2gtZm9ybV9fZ3JvdXAtcmFyaXR5LWxlZnQge1xcbiAgICAgIG1hcmdpbi1yaWdodDogM3JlbTsgfSB9XFxuICAuc2VhcmNoLWZvcm1fX2xhYmVsLS1jaGVja2JveCB7XFxuICAgIG1hcmdpbi1yaWdodDogMXJlbTsgfVxcbiAgLnNlYXJjaC1mb3JtX19pbnB1dC1jaGVja2JveCB7XFxuICAgIHdpZHRoOiAyLjI1cmVtO1xcbiAgICBoZWlnaHQ6IDIuMjVyZW07XFxuICAgIG1hcmdpbi1yaWdodDogMC44cmVtOyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogOTMuNzVlbSkge1xcbiAgICAgIC5zZWFyY2gtZm9ybV9faW5wdXQtY2hlY2tib3gge1xcbiAgICAgICAgbWFyZ2luLWJvdHRvbTogMC4zcmVtOyB9IH1cXG4gIC5zZWFyY2gtZm9ybV9fY2hlY2tib3gtd3JhcHBlciB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cXG4gIC5zZWFyY2gtZm9ybV9fc2VsZWN0LW1lbnUge1xcbiAgICBtYXJnaW4tYm90dG9tOiAxcmVtO1xcbiAgICBjb2xvcjogIzM0MzI0MjtcXG4gICAgbWFyZ2luLXJpZ2h0OiAxcmVtO1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCAjYWVhZWFlO1xcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XFxuICAgIGJveC1zaGFkb3c6IDAgMXB4IDFweCAwIHJnYmEoMCwgMCwgMCwgMC4wNik7XFxuICAgIHBhZGRpbmc6IDAgMi4ycmVtIDAgMC41cmVtO1xcbiAgICBoZWlnaHQ6IDMuNHJlbTtcXG4gICAgZm9udC1zaXplOiAxLjRyZW07XFxuICAgIHRleHQtaW5kZW50OiAwO1xcbiAgICAtd2Via2l0LWFwcGVhcmFuY2U6IG5vbmU7XFxuICAgIC1tb3otYXBwZWFyYW5jZTogbm9uZTtcXG4gICAgdGV4dC1vdmVyZmxvdzogJyc7XFxuICAgIGJhY2tncm91bmQtaW1hZ2U6IHVybChcIiArIF9fX0NTU19MT0FERVJfVVJMX1JFUExBQ0VNRU5UXzBfX18gKyBcIik7XFxuICAgIGJhY2tncm91bmQtcmVwZWF0OiBuby1yZXBlYXQ7XFxuICAgIGJhY2tncm91bmQtcG9zaXRpb246IHJpZ2h0IDAuOHJlbSBjZW50ZXI7XFxuICAgIGJhY2tncm91bmQtc2l6ZTogMS4ycmVtIDFyZW07XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmZmY7IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA4MS4yNWVtKSB7XFxuICAgICAgLnNlYXJjaC1mb3JtX19zZWxlY3QtbWVudSB7XFxuICAgICAgICBtYXJnaW4tcmlnaHQ6IDAuM3JlbTsgfSB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogMzcuNWVtKSB7XFxuICAgICAgLnNlYXJjaC1mb3JtX19zZWxlY3QtbWVudS0tMiB7XFxuICAgICAgICBtYXgtd2lkdGg6IDQ5JTsgfSB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogMzcuNWVtKSB7XFxuICAgICAgLnNlYXJjaC1mb3JtX19zZWxlY3QtbWVudS0tMyB7XFxuICAgICAgICBtYXgtd2lkdGg6IDMyJTsgfSB9XFxuICAuc2VhcmNoLWZvcm1fX3N2Zy1zaXplIHtcXG4gICAgaGVpZ2h0OiAycmVtO1xcbiAgICB3aWR0aDogMnJlbTtcXG4gICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX3N2Zy1jb2xvciB7XFxuICAgIGZpbGw6ICM1NTFhOGI7IH1cXG4gIC5zZWFyY2gtZm9ybV9fc3VibWl0LXdyYXBwZXIge1xcbiAgICBwb3NpdGlvbjogc3RpY2t5O1xcbiAgICBib3R0b206IDA7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBtYXJnaW4tYm90dG9tOiAzcmVtO1xcbiAgICBib3JkZXItdG9wOiAxcHggc29saWQgcmdiYSgwLCAwLCAwLCAwLjIpO1xcbiAgICBhbGlnbi1pdGVtczogZmxleC1zdGFydDtcXG4gICAgcGFkZGluZzogMS41cmVtIDRyZW0gMS41cmVtIDA7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmZGZkZmQ7XFxuICAgIHotaW5kZXg6IDE7IH1cXG4gIC5zZWFyY2gtZm9ybV9fc3VibWl0IHtcXG4gICAgYm9yZGVyLXJhZGl1czogM3B4O1xcbiAgICBwYWRkaW5nOiAwLjdyZW07XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmOWY3ZjU7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoODUsIDI2LCAxMzksIDAuNSk7XFxuICAgIGNvbG9yOiAjNTUxYThiO1xcbiAgICBmb250LXdlaWdodDogNTAwO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgMC4ycztcXG4gICAgbWFyZ2luLWxlZnQ6IDIwJTsgfVxcbiAgICAuc2VhcmNoLWZvcm1fX3N1Ym1pdDpob3ZlciB7XFxuICAgICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmZmY7IH1cXG4gIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tc3BhbiB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH1cXG4gIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMsIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtc2V0cyB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICAgIGxpc3Qtc3R5bGU6IG5vbmU7XFxuICAgIG1hcmdpbi1ib3R0b206IDAuM3JlbTsgfVxcbiAgLnNlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy1saXN0LWl0ZW0sIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtc2V0cy1saXN0LWl0ZW0ge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBtYXJnaW4tYm90dG9tOiAwLjdyZW07IH1cXG4gIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtcmVtb3ZlLWJ0biwgLnNlYXJjaC1mb3JtX19zZWxlY3RlZC1zZXRzLXJlbW92ZS1idG4ge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICBoZWlnaHQ6IDJyZW07XFxuICAgIHdpZHRoOiAycmVtO1xcbiAgICBmb250LXNpemU6IDEuM3JlbTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2YyZjJmMjtcXG4gICAgbWFyZ2luLXJpZ2h0OiAwLjdyZW07IH1cXG4gIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlciB7XFxuICAgIGhlaWdodDogMnJlbTtcXG4gICAgd2lkdGg6IDIuNzVyZW07XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgIGZvbnQtc2l6ZTogMS4zcmVtO1xcbiAgICBtYXJnaW4tcmlnaHQ6IDAuN3JlbTsgfVxcbiAgICAuc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLXRvZ2dsZXItLWlzIHtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDdkMTQ3OyB9XFxuICAgIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlci0tbm90IHtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmYwMDAwOyB9XFxuICAuc2VhcmNoLWZvcm1fX2Ryb3Bkb3duIHtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICBtYXgtaGVpZ2h0OiAyOHJlbTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gICAgei1pbmRleDogMjtcXG4gICAgdG9wOiAxMDAlO1xcbiAgICB3aWR0aDogNDByZW07XFxuICAgIG1hcmdpbi10b3A6IC0xcmVtO1xcbiAgICBvdmVyZmxvdy15OiBhdXRvO1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCAjMDAwOyB9XFxuICAgIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdCB7XFxuICAgICAgbGlzdC1zdHlsZTogbm9uZTsgfVxcbiAgICAgIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1jYXRlZ29yeSB7XFxuICAgICAgICBwYWRkaW5nOiAwLjVyZW07IH1cXG4gICAgICAuc2VhcmNoLWZvcm1fX2Ryb3Bkb3duLWxpc3Qtb3B0aW9uIHtcXG4gICAgICAgIHBhZGRpbmc6IDAuM3JlbSAycmVtO1xcbiAgICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cXG4gICAgICAgIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1vcHRpb246aG92ZXIge1xcbiAgICAgICAgICBjdXJzb3I6IHBvaW50ZXI7IH1cXG4gICAgICAgIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1vcHRpb24tLWhpZ2hsaWdodGVkIHtcXG4gICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2NjZDhmZjsgfVxcbiAgICAgICAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0LW9wdGlvbiBzcGFuIHtcXG4gICAgICAgICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcXG4gICAgICAgICAgbWFyZ2luLWxlZnQ6IDFyZW07IH1cXG4gICAgICAuc2VhcmNoLWZvcm1fX2Ryb3Bkb3duLWxpc3QtaW1nIHtcXG4gICAgICAgIHdpZHRoOiAycmVtO1xcbiAgICAgICAgaGVpZ2h0OiAycmVtO1xcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAwLjdyZW07IH1cXG5cXG4uZHJvcGRvd24td3JhcHBlciB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7IH1cXG5cXG4uaW52LXNlYXJjaC1wcmljZS1tc2cge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgYm90dG9tOiAwO1xcbiAgcmlnaHQ6IDA7XFxuICBjb2xvcjogcmVkOyB9XFxuXFxuLnJlbGF0aXZlIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcblxcbi5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2YzZjVmODtcXG4gIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCByZ2JhKDk5LCA2OCwgMTUwLCAwLjEpO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgcGFkZGluZzogMS4ycmVtIDE2JTtcXG4gIG1hcmdpbi1ib3R0b206IDAuMXJlbTtcXG4gIGhlaWdodDogNS4ycmVtOyB9XFxuICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDc1cmVtKSB7XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYge1xcbiAgICAgIHBhZGRpbmc6IDEuMnJlbSAyLjUlOyB9IH1cXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNTMuMTI1ZW0pIHtcXG4gICAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdiB7XFxuICAgICAgZGlzcGxheTogbm9uZTsgfSB9XFxuICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXNlbGVjdCB7XFxuICAgIGNvbG9yOiAjYjMwMGIzO1xcbiAgICBtYXJnaW4tcmlnaHQ6IDFyZW07XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoODUsIDI2LCAxMzksIDAuNSk7XFxuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgYm94LXNoYWRvdzogMCAxcHggMXB4IDAgcmdiYSgwLCAwLCAwLCAwLjA2KTtcXG4gICAgcGFkZGluZzogMC4xcmVtIDIuMnJlbSAwIDAuNXJlbTtcXG4gICAgY29sb3I6ICM1NTFhOGI7XFxuICAgIGhlaWdodDogMi44cmVtO1xcbiAgICBmb250LXNpemU6IDEuNHJlbTtcXG4gICAgdGV4dC1pbmRlbnQ6IDA7XFxuICAgIC13ZWJraXQtYXBwZWFyYW5jZTogbm9uZTtcXG4gICAgLW1vei1hcHBlYXJhbmNlOiBub25lO1xcbiAgICB0ZXh0LW92ZXJmbG93OiAnJztcXG4gICAgYmFja2dyb3VuZC1pbWFnZTogdXJsKFwiICsgX19fQ1NTX0xPQURFUl9VUkxfUkVQTEFDRU1FTlRfMF9fXyArIFwiKTtcXG4gICAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcXG4gICAgYmFja2dyb3VuZC1wb3NpdGlvbjogcmlnaHQgMC44cmVtIGNlbnRlcjtcXG4gICAgYmFja2dyb3VuZC1zaXplOiAxLjJyZW0gMXJlbTsgfVxcbiAgICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXNlbGVjdDpob3ZlciB7XFxuICAgICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmZmY7IH1cXG4gIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtbGFiZWwge1xcbiAgICBjb2xvcjogIzU1MWE4YjsgfVxcbiAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1idG4ge1xcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmOWY3ZjU7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoODUsIDI2LCAxMzksIDAuNSk7XFxuICAgIGNvbG9yOiAjNTUxYThiO1xcbiAgICBmb250LXdlaWdodDogNTAwO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgMC4ycztcXG4gICAgaGVpZ2h0OiAyLjhyZW07XFxuICAgIHBhZGRpbmc6IDAuMXJlbSAwLjdyZW0gMCAwLjdyZW07XFxuICAgIGZvbnQtc2l6ZTogMS40cmVtO1xcbiAgICBtYXJnaW46IGF1dG8gMDtcXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgICBib3gtc2hhZG93OiAwIDFweCAxcHggMCByZ2JhKDAsIDAsIDAsIDAuMDYpOyB9XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtYnRuOmhvdmVyIHtcXG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjsgfVxcbiAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1yaWdodCB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cXG4gIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtcGFnaW5hdGlvbi1jb250YWluZXIge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjlmN2Y1O1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDg1LCAyNiwgMTM5LCAwLjUpO1xcbiAgICBjb2xvcjogIzU1MWE4YjtcXG4gICAgcGFkZGluZzogMC4ycmVtIDAuN3JlbTtcXG4gICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICBoZWlnaHQ6IDIuOHJlbTtcXG4gICAgYm94LXNoYWRvdzogMCAxcHggMXB4IDAgcmdiYSgwLCAwLCAwLCAwLjA2KTsgfVxcbiAgICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXBhZ2luYXRpb24tY29udGFpbmVyOm5vdCg6bGFzdC1jaGlsZCkge1xcbiAgICAgIG1hcmdpbi1yaWdodDogMXJlbTsgfVxcbiAgICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXBhZ2luYXRpb24tY29udGFpbmVyOm50aC1jaGlsZCgyKSBzdmcge1xcbiAgICAgIG1hcmdpbi1yaWdodDogMXJlbTsgfVxcbiAgICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXBhZ2luYXRpb24tY29udGFpbmVyOm50aC1jaGlsZCgzKSBzdmcge1xcbiAgICAgIG1hcmdpbi1sZWZ0OiAxcmVtOyB9XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtcGFnaW5hdGlvbi1jb250YWluZXItLWRpc2FibGVkIHtcXG4gICAgICBjdXJzb3I6IG5vdC1hbGxvd2VkO1xcbiAgICAgIGNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuMjUpO1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmNWY2Zjc7IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiAzMS41ZW0pIHtcXG4gICAgICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXBhZ2luYXRpb24tY29udGFpbmVyIHtcXG4gICAgICAgIG1hcmdpbjogMDsgfSB9XFxuICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXN2Zy1zaXplIHtcXG4gICAgaGVpZ2h0OiAycmVtO1xcbiAgICB3aWR0aDogMnJlbTsgfVxcbiAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1zdmctY29sb3Ige1xcbiAgICBmaWxsOiAjNTUxYThiOyB9XFxuXFxuLmFwaS1yZXN1bHRzLWRpc3BsYXlfX2Rpc3BsYXktYmFyIHtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHJnYmEoOTksIDY4LCAxNTAsIDAuMSk7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjZmNGZhO1xcbiAgY29sb3I6ICM1MzUzNTM7XFxuICBwYWRkaW5nLWxlZnQ6IDE2JTtcXG4gIG1hcmdpbi1ib3R0b206IDJyZW07XFxuICBoZWlnaHQ6IDIuMXJlbTsgfVxcbiAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA3NXJlbSkge1xcbiAgICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fZGlzcGxheS1iYXIge1xcbiAgICAgIHBhZGRpbmctbGVmdDogMi41JTsgfSB9XFxuXFxuLmFwaS1yZXN1bHRzLWRpc3BsYXlfX21vYmlsZSB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjNmNWY4O1xcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHJnYmEoOTksIDY4LCAxNTAsIDAuMSk7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxuICBtYXJnaW4tYm90dG9tOiAwLjFyZW07XFxuICBoZWlnaHQ6IDUuMnJlbTtcXG4gIGRpc3BsYXk6IG5vbmU7IH1cXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNTMuMTI1ZW0pIHtcXG4gICAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX21vYmlsZSB7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBwYWRkaW5nOiAxLjJyZW0gMi41JTsgfSB9XFxuICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDMxLjVlbSkge1xcbiAgICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbW9iaWxlIHtcXG4gICAgICBwYWRkaW5nOiAxLjJyZW07IH0gfVxcbiAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX21vYmlsZS1zdmctc2l6ZSB7XFxuICAgIHdpZHRoOiAxLjRyZW07XFxuICAgIGhlaWdodDogMS40cmVtOyB9XFxuXFxuLmFwaS1yZXN1bHRzLWRpc3BsYXlfX21vYmlsZS1kaXNwbGF5LW9wdGlvbnMge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2YzZjVmODtcXG4gIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCByZ2JhKDk5LCA2OCwgMTUwLCAwLjEpO1xcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gIGFsaWduLWl0ZW1zOiBmbGV4LXN0YXJ0O1xcbiAgcGFkZGluZzogMS4ycmVtIDA7XFxuICBkaXNwbGF5OiBub25lOyB9XFxuXFxuLmFwaS1yZXN1bHRzLWRpc3BsYXlfX21vYmlsZS1kaXNwbGF5LW9wdGlvbnMtZ3JvdXAge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcXG4gIHdpZHRoOiA0NSU7XFxuICBtYXJnaW46IDAgYXV0byAxcmVtIGF1dG87IH1cXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNTEuNTYyNWVtKSB7XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19tb2JpbGUtZGlzcGxheS1vcHRpb25zLWdyb3VwIHtcXG4gICAgICB3aWR0aDogNjAlOyB9IH1cXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogMzcuNWVtKSB7XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19tb2JpbGUtZGlzcGxheS1vcHRpb25zLWdyb3VwIHtcXG4gICAgICB3aWR0aDogODAlOyB9IH1cXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogMjguMTI1ZW0pIHtcXG4gICAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX21vYmlsZS1kaXNwbGF5LW9wdGlvbnMtZ3JvdXAge1xcbiAgICAgIHdpZHRoOiA5NSU7IH0gfVxcbiAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX21vYmlsZS1kaXNwbGF5LW9wdGlvbnMtZ3JvdXAgbGFiZWwge1xcbiAgICBtYXJnaW4tcmlnaHQ6IDFyZW07IH1cXG5cXG4uYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXNlbGVjdC0tbW9iaWxlIHtcXG4gIHdpZHRoOiAyNHJlbTsgfVxcbiAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiAyMS44NzVlbSkge1xcbiAgICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXNlbGVjdC0tbW9iaWxlIHtcXG4gICAgICB3aWR0aDogMTZyZW07IH0gfVxcblxcbi5hcGktcmVzdWx0cy1tb2JpbGUtZGlzcGxheS1idG4ge1xcbiAgYWxpZ24tc2VsZjogY2VudGVyOyB9XFxuXFxuLndyYXBwZXIge1xcbiAgb3ZlcmZsb3cteDogc2Nyb2xsO1xcbiAgb3ZlcmZsb3cteTogaGlkZGVuO1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIG1hcmdpbjogMCBhdXRvO1xcbiAgd2lkdGg6IDY4JTsgfVxcbiAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA3NXJlbSkge1xcbiAgICAud3JhcHBlciB7XFxuICAgICAgd2lkdGg6IDkwNTsgfSB9XFxuXFxuLmNhcmQtY2hlY2tsaXN0IHtcXG4gIHdpZHRoOiAxMDAlO1xcbiAganVzdGlmeS1zZWxmOiBjZW50ZXI7IH1cXG4gIC5jYXJkLWNoZWNrbGlzdF9fcm93IHtcXG4gICAgZGlzcGxheTogZ3JpZDtcXG4gICAgaGVpZ2h0OiAzcmVtOyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fcm93LS03IHtcXG4gICAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IDEwJSAyMi41JSAxMCUgMTcuNSUgMTUlIDE1JSAxMCU7IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19yb3ctLTkge1xcbiAgICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KDksIDFmcik7IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19yb3ctLWhlYWRlciB7XFxuICAgICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICMwMDA7XFxuICAgICAgY29sb3I6ICM1MzFhOGI7XFxuICAgICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcXG4gICAgICBmb250LXNpemU6IDEuMnJlbSAhaW1wb3J0YW50O1xcbiAgICAgIGZvbnQtd2VpZ2h0OiAyMDAgIWltcG9ydGFudDsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX3Jvdy0tZ3JleSB7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2YyZjJmMjsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX3JvdzpudGgtY2hpbGQoZXZlbikge1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmMmYyZjI7IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19yb3ctLWhlYWRlciB7XFxuICAgICAgaGVpZ2h0OiAzLjVyZW07IH1cXG4gIC5jYXJkLWNoZWNrbGlzdF9fZGF0YSB7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LXdyYXA6IG5vd3JhcDtcXG4gICAganVzdGlmeS1jb250ZW50OiBmbGV4LXN0YXJ0O1xcbiAgICBmb250LXNpemU6IDEuNHJlbTsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX2RhdGEtLXNldCB7XFxuICAgICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcXG4gICAgICBwYWRkaW5nLWxlZnQ6IDAuNXJlbTsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX2RhdGEtLW5hbWUge1xcbiAgICAgIGp1c3RpZnktY29udGVudDogZmxleC1zdGFydDsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX2RhdGEtLXJhcml0eSB7XFxuICAgICAgdGV4dC10cmFuc2Zvcm06IGNhcGl0YWxpemU7IH1cXG4gIC5jYXJkLWNoZWNrbGlzdF9fZGF0YS1saW5rIHtcXG4gICAgcGFkZGluZzogMXJlbSAwO1xcbiAgICBkaXNwbGF5OiBibG9jaztcXG4gICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgY29sb3I6ICMwMDA7XFxuICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7XFxuICAgIG92ZXJmbG93OiBoaWRkZW47XFxuICAgIHRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzOyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fZGF0YS1saW5rLS1wcmljZSB7XFxuICAgICAgY29sb3I6ICMwMDY4ODU7IH1cXG5cXG4udG9vbHRpcCB7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB6LWluZGV4OiA1O1xcbiAgd2lkdGg6IDI0cmVtO1xcbiAgaGVpZ2h0OiAzNHJlbTsgfVxcbiAgLnRvb2x0aXBfX2ltZyB7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBoZWlnaHQ6IDEwMCU7IH1cXG5cXG4ubmVnYXRpdmUtZWFybmluZ3Mge1xcbiAgY29sb3I6IHJlZDsgfVxcblxcbi5wb3NpdGl2ZS1lYXJuaW5ncyB7XFxuICBjb2xvcjogZ3JlZW47IH1cXG5cXG4uaW1hZ2UtZ3JpZCB7XFxuICBwYWRkaW5nOiA3cmVtIDE2JTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxuICBmbGV4LXdyYXA6IHdyYXA7IH1cXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNzVyZW0pIHtcXG4gICAgLmltYWdlLWdyaWQge1xcbiAgICAgIHBhZGRpbmc6IDRyZW0gMi41JTsgfSB9XFxuICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDYyLjVlbSkge1xcbiAgICAuaW1hZ2UtZ3JpZCB7XFxuICAgICAgZ3JpZC1jb2x1bW4tZ2FwOiAxcmVtOyB9IH1cXG4gIC5pbWFnZS1ncmlkX19vdXRlci1kaXYge1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICAgIGhlaWdodDogMTAwJTsgfVxcbiAgLmltYWdlLWdyaWRfX2lubmVyLWRpdiB7XFxuICAgIHBlcnNwZWN0aXZlOiAxNTByZW07XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBoZWlnaHQ6IDEwMCU7IH1cXG4gIC5pbWFnZS1ncmlkX19kb3VibGUge1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgaGVpZ2h0OiAxMDAlO1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIHRvcDogMDtcXG4gICAgbGVmdDogMDtcXG4gICAgYmFja2ZhY2UtdmlzaWJpbGl0eTogaGlkZGVuO1xcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgMC44cyBlYXNlOyB9XFxuICAgIC5pbWFnZS1ncmlkX19kb3VibGUtLWJhY2sge1xcbiAgICAgIHRyYW5zZm9ybTogcm90YXRlWSgxODBkZWcpOyB9XFxuICAuaW1hZ2UtZ3JpZF9fZG91YmxlLWJ0biB7XFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgdG9wOiAyNiU7XFxuICAgIGxlZnQ6IDc1JTtcXG4gICAgd2lkdGg6IDQuNHJlbTtcXG4gICAgaGVpZ2h0OiA0LjRyZW07XFxuICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjYpO1xcbiAgICBib3JkZXI6IDJweCBzb2xpZCAjMzQyNDQyO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgMC4ycztcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cXG4gICAgLmltYWdlLWdyaWRfX2RvdWJsZS1idG46aG92ZXIge1xcbiAgICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmOyB9XFxuICAuaW1hZ2UtZ3JpZF9fZG91YmxlLWJ0bi1zdmcge1xcbiAgICBoZWlnaHQ6IDIuNXJlbTtcXG4gICAgd2lkdGg6IDIuNXJlbTtcXG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7IH1cXG4gIC5pbWFnZS1ncmlkX19kb2J1bGUtYnRuLXN2Zy1jb2xvciB7XFxuICAgIGNvbG9yOiAjMTYxNjFkOyB9XFxuICAuaW1hZ2UtZ3JpZF9fY29udGFpbmVyIHtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGhlaWdodDogMTAwJTsgfVxcbiAgLmltYWdlLWdyaWRfX2ltYWdlIHtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGhlaWdodDogMTAwJTtcXG4gICAgYm94LXNoYWRvdzogMXB4IDFweCA2cHggcmdiYSgwLCAwLCAwLCAwLjQ1KTtcXG4gICAgYm9yZGVyLXJhZGl1czogNC43NSUgLyAzLjUlOyB9XFxuICAuaW1hZ2UtZ3JpZF9fbGluayB7XFxuICAgIG1hcmdpbi1ib3R0b206IDAuOXJlbTtcXG4gICAgd2lkdGg6IDI0LjI1JTtcXG4gICAgaGVpZ2h0OiBhdXRvO1xcbiAgICBtYXJnaW4tYm90dG9tOiAwLjlyZW07XFxuICAgIHBhZ2UtYnJlYWstYWZ0ZXI6IGF1dG87XFxuICAgIHBhZ2UtYnJlYWstYmVmb3JlOiBhdXRvO1xcbiAgICBwYWdlLWJyZWFrLWluc2lkZTogYXZvaWQ7XFxuICAgIGRpc3BsYXk6IGJsb2NrOyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNTkuMzc1ZW0pIHtcXG4gICAgICAuaW1hZ2UtZ3JpZF9fbGluayB7XFxuICAgICAgICB3aWR0aDogMzEuNzUlOyB9IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA0MC42MjVlbSkge1xcbiAgICAgIC5pbWFnZS1ncmlkX19saW5rIHtcXG4gICAgICAgIHdpZHRoOiA0Ny4yNSU7IH0gfVxcblxcbi5jYXJkIHtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgcGFkZGluZzogMCAxNiU7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgbWFyZ2luLXRvcDogM3JlbTtcXG4gIHBhZGRpbmctYm90dG9tOiAwLjdyZW07XFxuICBib3JkZXItYm90dG9tOiAxcHggZGFzaGVkIHJnYmEoMCwgMCwgMCwgMC43KTsgfVxcbiAgLmNhcmRfX2ltZy1jb250YWluZXIge1xcbiAgICB6LWluZGV4OiAyO1xcbiAgICBib3JkZXItcmFkaXVzOiAxMDAlOyB9XFxuICAuY2FyZF9faW1nIHtcXG4gICAgd2lkdGg6IDMzcmVtO1xcbiAgICBoZWlnaHQ6IDQ2cmVtO1xcbiAgICBib3gtc2hhZG93OiAxcHggMXB4IDhweCByZ2JhKDAsIDAsIDAsIDAuNSk7XFxuICAgIGJvcmRlci1yYWRpdXM6IDQuNzUlIC8gMy41JTsgfVxcbiAgLmNhcmRfX2ltZy1sZWZ0IHtcXG4gICAgd2lkdGg6IDMzcmVtO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgICB6LWluZGV4OiAyOyB9XFxuICAuY2FyZF9faW1nLWJ0biB7XFxuICAgIGFsaWduLXNlbGY6IGNlbnRlcjtcXG4gICAgbWFyZ2luLXRvcDogMXJlbTtcXG4gICAgaGVpZ2h0OiAyLjhyZW07XFxuICAgIGZvbnQtc2l6ZTogMS40cmVtO1xcbiAgICBsaW5lLWhlaWdodDogMS44O1xcbiAgICBjb2xvcjogIzU1MWE4YjtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2Y5ZjdmNTtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSg4NSwgMjYsIDEzOSwgMC41KTtcXG4gICAgYm9yZGVyLXJhZGl1czogM3B4O1xcbiAgICBib3gtc2hhZG93OiAwIDFweCAwIHJnYmEoMCwgMCwgMCwgMC4wNik7XFxuICAgIHRyYW5zaXRpb246IGFsbCAwLjJzO1xcbiAgICBwYWRkaW5nOiAwLjJyZW0gMC41cmVtO1xcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cXG4gICAgLmNhcmRfX2ltZy1idG46aG92ZXIge1xcbiAgICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgICAgIGJvcmRlci1jb2xvcjogIzYzNDQ5NjsgfVxcbiAgLmNhcmRfX2ltZy1zdmcge1xcbiAgICBoZWlnaHQ6IDEuNHJlbTtcXG4gICAgd2lkdGg6IDEuNHJlbTtcXG4gICAgbWFyZ2luLXJpZ2h0OiAwLjNyZW07XFxuICAgIHBvaW50ZXItZXZlbnRzOiBub25lOyB9XFxuICAuY2FyZF9faW1nLXN2Zy1jb2xvciB7XFxuICAgIGZpbGw6ICM1NTFhOGI7IH1cXG4gIC5jYXJkX19pbWctZG91YmxlLWFyZWEge1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7IH1cXG4gIC5jYXJkX19pbWctZG91YmxlLXNpZGVkIHtcXG4gICAgcGVyc3BlY3RpdmU6IDE1MHJlbTtcXG4gICAgaGVpZ2h0OiA0NnJlbTsgfVxcbiAgLmNhcmRfX2ltZy1kb3VibGUge1xcbiAgICB3aWR0aDogMzNyZW07XFxuICAgIGhlaWdodDogNDZyZW07XFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgdG9wOiAwO1xcbiAgICBsZWZ0OiAwO1xcbiAgICBiYWNrZmFjZS12aXNpYmlsaXR5OiBoaWRkZW47XFxuICAgIG92ZXJmbG93OiBoaWRkZW47IH1cXG4gICAgLmNhcmRfX2ltZy1kb3VibGUtLWJhY2sge1xcbiAgICAgIHRyYW5zZm9ybTogcm90YXRlWSgxODBkZWcpOyB9XFxuICAuY2FyZF9fdGV4dCB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxuICAgIGJvcmRlci1yYWRpdXM6IDRweDtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSgwLCAwLCAwLCAwLjI1KTtcXG4gICAgYm9yZGVyLXRvcDogM3B4IHNvbGlkICMwMDA7XFxuICAgIGJvcmRlci1ib3R0b206IDNweCBzb2xpZCAjMDAwO1xcbiAgICBtYXJnaW4tdG9wOiAycmVtO1xcbiAgICB3aWR0aDogMzRyZW07XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICAgIHBhZGRpbmc6IDNyZW07XFxuICAgIG1hcmdpbi1yaWdodDogM3JlbTtcXG4gICAgbWFyZ2luLWxlZnQ6IC0ycmVtOyB9XFxuICAgIC5jYXJkX190ZXh0LWZsZXgge1xcbiAgICAgIG1hcmdpbi1ib3R0b206IDFyZW07XFxuICAgICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNiZmJmYmY7IH1cXG4gICAgLmNhcmRfX3RleHQtdGl0bGUge1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfVxcbiAgICAgIC5jYXJkX190ZXh0LXRpdGxlLWgzIHtcXG4gICAgICAgIGZvbnQtc2l6ZTogMS44cmVtO1xcbiAgICAgICAgZm9udC13ZWlnaHQ6IDQwMDtcXG4gICAgICAgIG1hcmdpbi1yaWdodDogMXJlbTsgfVxcbiAgICAuY2FyZF9fdGV4dC1jb2xvci1pbmRpY2F0b3Ige1xcbiAgICAgIHdpZHRoOiAxLjNyZW07XFxuICAgICAgaGVpZ2h0OiAxLjNyZW07XFxuICAgICAgYm9yZGVyOiAxcHggc29saWQgIzMzMztcXG4gICAgICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICAgICAgYm94LXNoYWRvdzogMHB4IDBweCAwcHggMnB4IHJnYmEoMCwgMCwgMCwgMC4yKTtcXG4gICAgICBtYXJnaW4tcmlnaHQ6IDAuN3JlbTtcXG4gICAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7IH1cXG4gICAgICAuY2FyZF9fdGV4dC1jb2xvci1pbmRpY2F0b3ItLVUge1xcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgxMjgsIDEyOCwgMjU1LCAwLjcpOyB9XFxuICAgICAgLmNhcmRfX3RleHQtY29sb3ItaW5kaWNhdG9yLS1CIHtcXG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMCwgMCwgMC43KTsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWNvbG9yLWluZGljYXRvci0tUiB7XFxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1NSwgNzcsIDc3LCAwLjcpOyB9XFxuICAgICAgLmNhcmRfX3RleHQtY29sb3ItaW5kaWNhdG9yLS1XIHtcXG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC43KTsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWNvbG9yLWluZGljYXRvci0tRyB7XFxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDI1NSwgMCwgMC43KTsgfVxcbiAgICAuY2FyZF9fdGV4dC1vcmFjbGUtcCB7XFxuICAgICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcXG4gICAgICBmb250LXNpemU6IDEuM3JlbTsgfVxcbiAgICAuY2FyZF9fdGV4dC1vcmFjbGUtZmxhdm9yIHtcXG4gICAgICBmb250LXNpemU6IDEuM3JlbTtcXG4gICAgICBmb250LXN0eWxlOiBpdGFsaWM7IH1cXG4gICAgLmNhcmRfX3RleHQtaWxsdXN0cmF0b3Ige1xcbiAgICAgIGZvbnQtc2l6ZTogMS4ycmVtO1xcbiAgICAgIGZvbnQtc3R5bGU6IGl0YWxpYzsgfVxcbiAgICAuY2FyZF9fdGV4dC1sZWdhbCB7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBmbGV4LWRpcmVjdGlvbjogcm93O1xcbiAgICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWxlZ2FsLWhhbGYge1xcbiAgICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH1cXG4gICAgICAuY2FyZF9fdGV4dC1sZWdhbC1zcGFuLWNvbnRhaW5lciB7XFxuICAgICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgICAgIGZvbnQtc2l6ZTogMS40cmVtOyB9XFxuICAgICAgICAuY2FyZF9fdGV4dC1sZWdhbC1zcGFuLWNvbnRhaW5lcjpub3QoOmxhc3QtY2hpbGQpIHtcXG4gICAgICAgICAgbWFyZ2luLWJvdHRvbTogMC41cmVtOyB9XFxuICAgICAgLmNhcmRfX3RleHQtbGVnYWwtc3Bhbi1ib3gge1xcbiAgICAgICAgd2lkdGg6IDZyZW07XFxuICAgICAgICBoZWlnaHQ6IDIuNXJlbTtcXG4gICAgICAgIG1hcmdpbi1yaWdodDogMC4zcmVtO1xcbiAgICAgICAgZm9udC1zaXplOiAxcmVtO1xcbiAgICAgICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcXG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgICAgICBib3JkZXItcmFkaXVzOiAzcHg7IH1cXG4gICAgICAgIC5jYXJkX190ZXh0LWxlZ2FsLXNwYW4tYm94LS1ub3RfbGVnYWwge1xcbiAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZTYwMDAwOyB9XFxuICAgICAgICAuY2FyZF9fdGV4dC1sZWdhbC1zcGFuLWJveC0tbGVnYWwge1xcbiAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMDA5OTAwOyB9XFxuICAgICAgLmNhcmRfX3RleHQtbGVnYWwtc3Bhbi1ib3gge1xcbiAgICAgICAgY29sb3I6ICNmZmY7IH1cXG4gIC5jYXJkX19zZXQge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9XFxuICAgIC5jYXJkX19zZXQtYmFubmVyIHtcXG4gICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkICNiZmJmYmY7XFxuICAgICAgd2lkdGg6IDQwcmVtO1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICM0OTQ2NWM7XFxuICAgICAgY29sb3I6ICNmZGZkZmQ7XFxuICAgICAgcGFkZGluZzogMC43cmVtO1xcbiAgICAgIGJvcmRlci1yYWRpdXM6IDNweDsgfVxcbiAgICAgIC5jYXJkX19zZXQtYmFubmVyLXN2Zy1jb250YWluZXIge1xcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuICAgICAgLmNhcmRfX3NldC1iYW5uZXItc3ZnIHtcXG4gICAgICAgIHdpZHRoOiAyLjRyZW07XFxuICAgICAgICBoZWlnaHQ6IDIuNHJlbTtcXG4gICAgICAgIGZpbHRlcjogaW52ZXJ0KDEwMCUpOyB9XFxuICAgIC5jYXJkX19zZXQtZGV0YWlscyB7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9XFxuICAgIC5jYXJkX19zZXQtaGVhZGVyLW5hbWUge1xcbiAgICAgIGZvbnQtc2l6ZTogMS43cmVtcmVtOyB9XFxuICAgIC5jYXJkX19zZXQtaGVhZGVyLWNvZGUge1xcbiAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtaGVhZGVyIHtcXG4gICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDk0NjVjO1xcbiAgICAgIGNvbG9yOiAjZmRmZGZkO1xcbiAgICAgIGZvbnQtc2l6ZTogMS4zcmVtO1xcbiAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICAgICAgYm9yZGVyOiAxcHggc29saWQgI2JmYmZiZjtcXG4gICAgICBib3JkZXItcmFkaXVzOiAzcHg7XFxuICAgICAgcGFkZGluZzogMC4zcmVtIDAuN3JlbTsgfVxcbiAgICAuY2FyZF9fc2V0LXByaW50cy1zdmctY29udGFpbmVyIHtcXG4gICAgICBoZWlnaHQ6IDEuOHJlbTtcXG4gICAgICB3aWR0aDogMS44cmVtO1xcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkICNiZmJmYmY7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICAgIGJvcmRlci1yYWRpdXM6IDEwMCU7IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtc3ZnLS1jb21tb24ge1xcbiAgICAgIGZpbGw6ICMwMDA7IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtc3ZnLS11bmNvbW1vbiB7XFxuICAgICAgZmlsbDogI2U2ZTZlNjsgfVxcbiAgICAuY2FyZF9fc2V0LXByaW50cy1zdmctLXJhcmUge1xcbiAgICAgIGZpbGw6ICNlNmMzMDA7IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtc3ZnLS1teXRoaWMge1xcbiAgICAgIGZpbGw6ICNmZjAwMDA7IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtbGlzdCB7XFxuICAgICAgbGlzdC1zdHlsZTogbm9uZTtcXG4gICAgICBib3JkZXItcmFkaXVzOiAzcHg7IH1cXG4gICAgICAuY2FyZF9fc2V0LXByaW50cy1saXN0LWxpbms6bGluaywgLmNhcmRfX3NldC1wcmludHMtbGlzdC1saW5rOnZpc2l0ZWQge1xcbiAgICAgICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgICAgICAgY29sb3I6ICMwMDA7IH1cXG4gICAgICAuY2FyZF9fc2V0LXByaW50cy1saXN0LWl0ZW0ge1xcbiAgICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcXG4gICAgICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjZTdlOWVjO1xcbiAgICAgICAgYm9yZGVyLWxlZnQ6IDFweCBzb2xpZCAjY2RjZGNkO1xcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gICAgICAgIHBhZGRpbmc6IDAuMjVyZW0gMDsgfVxcbiAgICAgICAgLmNhcmRfX3NldC1wcmludHMtbGlzdC1pdGVtLS1wbC0xNCB7XFxuICAgICAgICAgIHBhZGRpbmctbGVmdDogMS40cmVtO1xcbiAgICAgICAgICBib3JkZXItYm90dG9tOiAzcHggc29saWQgIzAwMDsgfVxcbiAgICAgICAgLmNhcmRfX3NldC1wcmludHMtbGlzdC1pdGVtOmhvdmVyIHtcXG4gICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2YyZjJmMjsgfVxcbiAgICAgIC5jYXJkX19zZXQtcHJpbnRzLWxpc3QtaXRlbS1uYW1lLXdyYXBwZXIge1xcbiAgICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgICAgICBtYXJnaW4tbGVmdDogLTFyZW07IH1cXG4gICAgICAuY2FyZF9fc2V0LXByaW50cy1saXN0LWl0ZW0tc2V0LW5hbWUge1xcbiAgICAgICAgbWFyZ2luLWxlZnQ6IDAuNXJlbTsgfVxcbiAgICAgIC5jYXJkX19zZXQtcHJpbnRzLWxpc3QtaXRlbS1wcmljZSB7XFxuICAgICAgICBtYXJnaW4tcmlnaHQ6IDAuN3JlbTtcXG4gICAgICAgIGNvbG9yOiAjMDA2ODg1OyB9XFxuXFxuLmNhcmQtcGFnZSB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gIGdyaWQtY29sdW1uOiAxIC8gLTE7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7IH1cXG5cXG4uYWRkLXRvLWludixcXG4ucmVtb3ZlLWZyb20taW52IHtcXG4gIG1hcmdpbi10b3A6IDNyZW07XFxuICB3aWR0aDogNTAlO1xcbiAgbWFyZ2luLWxlZnQ6IDUwJTtcXG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtNTAlKTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9XFxuICAuYWRkLXRvLWludl9faGVhZGVyLFxcbiAgLnJlbW92ZS1mcm9tLWludl9faGVhZGVyIHtcXG4gICAgY29sb3I6ICMxNjE2MWQ7XFxuICAgIGZvbnQtc2l6ZTogMi4ycmVtO1xcbiAgICBmb250LXdlaWdodDogMzAwO1xcbiAgICBtYXJnaW46IDAgYXV0byAxcmVtIGF1dG87IH1cXG4gIC5hZGQtdG8taW52X19mb3JtLFxcbiAgLnJlbW92ZS1mcm9tLWludl9fZm9ybSB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH1cXG4gICAgLmFkZC10by1pbnZfX2Zvcm0tcHJpY2UsXFxuICAgIC5yZW1vdmUtZnJvbS1pbnZfX2Zvcm0tcHJpY2Uge1xcbiAgICAgIHdpZHRoOiAyMHJlbTtcXG4gICAgICBoZWlnaHQ6IDMuNXJlbTtcXG4gICAgICBtYXJnaW4tYm90dG9tOiAxcmVtO1xcbiAgICAgIHBhZGRpbmc6IDFyZW07XFxuICAgICAgYm9yZGVyOiBzb2xpZCAxcHggI2JmYmZiZjtcXG4gICAgICBib3JkZXItcmFkaXVzOiA1cHg7IH1cXG4gICAgICAuYWRkLXRvLWludl9fZm9ybS1wcmljZTpmb2N1cyxcXG4gICAgICAucmVtb3ZlLWZyb20taW52X19mb3JtLXByaWNlOmZvY3VzIHtcXG4gICAgICAgIGJvcmRlcjogc29saWQgMXB4ICMwMDA7IH1cXG4gICAgLmFkZC10by1pbnZfX2Zvcm0tZ3JvdXAsXFxuICAgIC5yZW1vdmUtZnJvbS1pbnZfX2Zvcm0tZ3JvdXAge1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1ldmVubHk7XFxuICAgICAgYWxpZ24tY29udGVudDogY2VudGVyO1xcbiAgICAgIG1hcmdpbi1ib3R0b206IDEuNXJlbTtcXG4gICAgICBwb3NpdGlvbjogcmVsYXRpdmU7IH1cXG4gICAgLmFkZC10by1pbnZfX2Zvcm0tbGFiZWwsXFxuICAgIC5yZW1vdmUtZnJvbS1pbnZfX2Zvcm0tbGFiZWwge1xcbiAgICAgIG1hcmdpbi1yaWdodDogMC4zcmVtO1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgYWxpZ24tY29udGVudDogY2VudGVyO1xcbiAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICAgIGNvbG9yOiAjMTYxNjFkO1xcbiAgICAgIG1hcmdpbi10b3A6IDAuNDVyZW07IH1cXG4gIC5hZGQtdG8taW52LXByaWNlLW1zZyxcXG4gIC5yZW1vdmUtZnJvbS1pbnYtcHJpY2UtbXNnIHtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICBib3R0b206IC0xLjhyZW07XFxuICAgIHJpZ2h0OiAyNSU7XFxuICAgIGNvbG9yOiByZWQ7IH1cXG4gIC5hZGQtdG8taW52X19zdWJtaXQsXFxuICAucmVtb3ZlLWZyb20taW52X19zdWJtaXQge1xcbiAgICBhbGlnbi1zZWxmOiBjZW50ZXI7XFxuICAgIGhlaWdodDogMy4xcmVtO1xcbiAgICBmb250LXNpemU6IDEuNHJlbTtcXG4gICAgbGluZS1oZWlnaHQ6IDEuODtcXG4gICAgY29sb3I6ICM1NTFhOGI7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmOWY3ZjU7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoODUsIDI2LCAxMzksIDAuNSk7XFxuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgYm94LXNoYWRvdzogMCAxcHggMCByZ2JhKDAsIDAsIDAsIDAuMDYpO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgMC4ycztcXG4gICAgcGFkZGluZzogMC4ycmVtIDAuNzVyZW07XFxuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgbWFyZ2luLWJvdHRvbTogMXJlbTsgfVxcbiAgICAuYWRkLXRvLWludl9fc3VibWl0OmhvdmVyLFxcbiAgICAucmVtb3ZlLWZyb20taW52X19zdWJtaXQ6aG92ZXIge1xcbiAgICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgICAgIGJvcmRlci1jb2xvcjogIzYzNDQ5NjsgfVxcblxcbi51dGlsLXNwYWNlOjpiZWZvcmUsXFxuLnV0aWwtc3BhY2U6OmFmdGVyIHtcXG4gIGNvbnRlbnQ6ICcnO1xcbiAgbWFyZ2luOiAwIDAuMnJlbTsgfVxcblxcbi5uby1yZXN1bHRzIHtcXG4gIGp1c3RpZnktc2VsZjogY2VudGVyOyB9XFxuXFxuLmhvbWVwYWdlIHtcXG4gIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCh0byBib3R0b20sICMxZDFjMjUsICM0MzFlM2YpO1xcbiAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcXG4gIGhlaWdodDogMTAwdmg7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgb3ZlcmZsb3cteDogaGlkZGVuICFpbXBvcnRhbnQ7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIGJhY2tncm91bmQtc2l6ZTogY292ZXI7IH1cXG4gIC5ob21lcGFnZV9fY2VudGVyIHtcXG4gICAgYWxpZ24tc2VsZjogY2VudGVyO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogMjguMTI1ZW0pIHtcXG4gICAgICAuaG9tZXBhZ2VfX2NlbnRlciB7XFxuICAgICAgICBtYXJnaW4tdG9wOiAtMTJyZW07IH0gfVxcbiAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA0MC42MjVlbSkge1xcbiAgICAuaG9tZXBhZ2VfX2NlbnRlci1oZWFkaW5nLXdyYXBwZXIge1xcbiAgICAgIG1hcmdpbjogMCBhdXRvIDAuNXJlbSBhdXRvO1xcbiAgICAgIHdpZHRoOiA3NSU7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7IH0gfVxcbiAgLmhvbWVwYWdlX19zZWFyY2gge1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7IH1cXG4gIC5ob21lcGFnZV9fc2VhcmNoLWlucHV0IHtcXG4gICAgcGFkZGluZzogMS4ycmVtIDEuNHJlbSAxLjJyZW0gNi4ycmVtO1xcbiAgICBmb250LXNpemU6IDNyZW07XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICMyNDIwMzE7XFxuICAgIGNvbG9yOiAjZDdkN2Q3O1xcbiAgICBib3JkZXItcmFkaXVzOiA0cHg7XFxuICAgIGJveC1zaGFkb3c6IDBweCAwcHggMHB4IDJweCByZ2JhKDAsIDAsIDAsIDAuNSk7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNSk7IH1cXG4gICAgLmhvbWVwYWdlX19zZWFyY2gtaW5wdXQ6OnBsYWNlaG9sZGVyIHtcXG4gICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA0MC42MjVlbSkge1xcbiAgICAgIC5ob21lcGFnZV9fc2VhcmNoLWlucHV0IHtcXG4gICAgICAgIHdpZHRoOiA4MCU7XFxuICAgICAgICBtYXJnaW4tbGVmdDogMTAlOyB9IH1cXG4gIC5ob21lcGFnZV9fc2VhcmNoLWJ0biB7XFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgbGVmdDogNnJlbTtcXG4gICAgdG9wOiAycmVtOyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNDAuNjI1ZW0pIHtcXG4gICAgICAuaG9tZXBhZ2VfX3NlYXJjaC1idG4ge1xcbiAgICAgICAgbGVmdDogMTJyZW07IH0gfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDI4LjEyNWVtKSB7XFxuICAgICAgLmhvbWVwYWdlX19zZWFyY2gtYnRuIHtcXG4gICAgICAgIGxlZnQ6IDEwcmVtOyB9IH1cXG4gIC5ob21lcGFnZV9faWNvbi1zaXppbmctLXNlYXJjaCB7XFxuICAgIHdpZHRoOiAzcmVtO1xcbiAgICBoZWlnaHQ6IDNyZW07XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtMTUwJSk7IH1cXG4gIC5ob21lcGFnZV9faWNvbi1wYXRoIHtcXG4gICAgZmlsbDogI2JmYmZiZjsgfVxcbiAgLmhvbWVwYWdlX19saW5rcyB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyOyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNDAuNjI1ZW0pIHtcXG4gICAgICAuaG9tZXBhZ2VfX2xpbmtzIHtcXG4gICAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH0gfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDI4LjEyNWVtKSB7XFxuICAgICAgLmhvbWVwYWdlX19saW5rcyB7XFxuICAgICAgICBtYXJnaW4tbGVmdDogNy41JTsgfSB9XFxuICAuaG9tZXBhZ2VfX2xpbmsge1xcbiAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoODUsIDI2LCAxMzksIDAuNSk7XFxuICAgIGJvcmRlci1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjYpO1xcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XFxuICAgIGNvbG9yOiAjZmZmO1xcbiAgICBtYXJnaW4tdG9wOiAwLjZyZW07XFxuICAgIG1hcmdpbi1yaWdodDogM3JlbTtcXG4gICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICBsaW5lLWhlaWdodDogMS40O1xcbiAgICBwYWRkaW5nOiAwLjJyZW0gMXJlbSAwIDFyZW07XFxuICAgIGhlaWdodDogMi44cmVtO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgMC4ycztcXG4gICAgYm94LXNoYWRvdzogMCAxcHggMXB4IDAgcmdiYSgwLCAwLCAwLCAwLjA2KTtcXG4gICAgbWluLXdpZHRoOiA5cmVtO1xcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA0MC42MjVlbSkge1xcbiAgICAgIC5ob21lcGFnZV9fbGluayB7XFxuICAgICAgICBhbGlnbi1zZWxmOiBjZW50ZXI7XFxuICAgICAgICB3aWR0aDogMTQuNXJlbTsgfSB9XFxuICAgIC5ob21lcGFnZV9fbGluazpob3ZlciB7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjA5KTsgfVxcblxcbi5pbnZlbnRvcnktZGV0YWlscyB7XFxuICBncmlkLWNvbHVtbjogMSAvIC0xO1xcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHJnYmEoOTksIDY4LCAxNTAsIDAuMSk7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjZmNGZhO1xcbiAgY29sb3I6ICM1MzUzNTM7XFxuICBwYWRkaW5nOiAxcmVtIDE2JTtcXG4gIG1hcmdpbi1ib3R0b206IDJyZW07XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuOyB9XFxuICAuaW52ZW50b3J5LWRldGFpbHNfX2xpbmsge1xcbiAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICAgIGNvbG9yOiByZ2JhKDgzLCA4MywgODMsIDAuNzUpO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgMC4ycztcXG4gICAgcGFkZGluZzogMCAwLjZyZW07XFxuICAgIGJvcmRlci1sZWZ0OiAxcHggc29saWQgIzUzNTM1MztcXG4gICAgYm9yZGVyLXJpZ2h0OiAxcHggc29saWQgIzUzNTM1MzsgfVxcbiAgICAuaW52ZW50b3J5LWRldGFpbHNfX2xpbms6aG92ZXIge1xcbiAgICAgIGNvbG9yOiAjNTM1MzUzOyB9XFxuICAuaW52ZW50b3J5LWRldGFpbHMgc3BhbiB7XFxuICAgIGNvbG9yOiAjMDA2ODg1OyB9XFxuXFxuLmhvbWVwYWdlX19jb2xhZ2UsXFxuLmNhcmRwYWdlX19jb2xhZ2Uge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcXG4gIGxlZnQ6IDA7XFxuICBoZWlnaHQ6IDE1cmVtO1xcbiAgd2lkdGg6IDEwMCU7IH1cXG5cXG4uaG9tZXBhZ2VfX2NvbGFnZSB7XFxuICBib3R0b206IDA7IH1cXG5cXG4uY2FyZHBhZ2VfX2NvbGFnZSB7XFxuICBib3R0b206IC0yLjZyZW07IH1cXG5cXG4uaG9tZXBhZ2VfX2NvbGFnZS1pbm5lcixcXG4uY2FyZHBhZ2VfX2NvbGFnZS1pbm5lciB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBoZWlnaHQ6IDEwMCU7XFxuICBtYXJnaW4tbGVmdDogNTAlO1xcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC01MCUpO1xcbiAgd2lkdGg6IDY1LjVyZW07IH1cXG5cXG4uaG9tZXBhZ2VfX2NvbGFnZS1jYXJkLFxcbi5jYXJkcGFnZV9fY29sYWdlLWNhcmQge1xcbiAgd2lkdGg6IDE2LjhyZW07XFxuICBoZWlnaHQ6IDIzLjRyZW07XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICBib3JkZXItcmFkaXVzOiA1JSAvIDMuNzUlO1xcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApO1xcbiAgdHJhbnNpdGlvbjogYWxsIDAuM3M7XFxuICBib3gtc2hhZG93OiBpbnNldCAwIDAgM3B4IDNweCAjMDAwOyB9XFxuICAuaG9tZXBhZ2VfX2NvbGFnZS1jYXJkOm50aC1jaGlsZCgxKSxcXG4gIC5jYXJkcGFnZV9fY29sYWdlLWNhcmQ6bnRoLWNoaWxkKDEpIHtcXG4gICAgdG9wOiAyLjJyZW07IH1cXG4gIC5ob21lcGFnZV9fY29sYWdlLWNhcmQ6bnRoLWNoaWxkKDIpLFxcbiAgLmNhcmRwYWdlX19jb2xhZ2UtY2FyZDpudGgtY2hpbGQoMikge1xcbiAgICB0b3A6IDYuMnJlbTtcXG4gICAgbGVmdDogMy41cmVtOyB9XFxuICAuaG9tZXBhZ2VfX2NvbGFnZS1jYXJkOm50aC1jaGlsZCgzKSxcXG4gIC5jYXJkcGFnZV9fY29sYWdlLWNhcmQ6bnRoLWNoaWxkKDMpIHtcXG4gICAgdG9wOiAxcmVtO1xcbiAgICBsZWZ0OiAxNy40cmVtOyB9XFxuICAuaG9tZXBhZ2VfX2NvbGFnZS1jYXJkOm50aC1jaGlsZCg0KSxcXG4gIC5jYXJkcGFnZV9fY29sYWdlLWNhcmQ6bnRoLWNoaWxkKDQpIHtcXG4gICAgdG9wOiA0LjVyZW07XFxuICAgIGxlZnQ6IDIwLjZyZW07IH1cXG4gIC5ob21lcGFnZV9fY29sYWdlLWNhcmQ6bnRoLWNoaWxkKDUpLFxcbiAgLmNhcmRwYWdlX19jb2xhZ2UtY2FyZDpudGgtY2hpbGQoNSkge1xcbiAgICB0b3A6IDEuNnJlbTtcXG4gICAgbGVmdDogMzQuN3JlbTsgfVxcbiAgLmhvbWVwYWdlX19jb2xhZ2UtY2FyZDpudGgtY2hpbGQoNiksXFxuICAuY2FyZHBhZ2VfX2NvbGFnZS1jYXJkOm50aC1jaGlsZCg2KSB7XFxuICAgIHRvcDogNi41cmVtO1xcbiAgICBsZWZ0OiAzOHJlbTsgfVxcbiAgLmhvbWVwYWdlX19jb2xhZ2UtY2FyZDpudGgtY2hpbGQoNyksXFxuICAuY2FyZHBhZ2VfX2NvbGFnZS1jYXJkOm50aC1jaGlsZCg3KSB7XFxuICAgIHRvcDogMy41cmVtO1xcbiAgICByaWdodDogMDsgfVxcbiAgLmhvbWVwYWdlX19jb2xhZ2UtY2FyZDpob3ZlcixcXG4gIC5jYXJkcGFnZV9fY29sYWdlLWNhcmQ6aG92ZXIge1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTUlKTsgfVxcblxcbi5jb250YWluZXIge1xcbiAgZGlzcGxheTogZ3JpZDtcXG4gIGdyaWQtdGVtcGxhdGUtY29sdW1uczogW2Z1bGwtc3RhcnRdIG1pbm1heCg2cmVtLCAxZnIpIFtjZW50ZXItc3RhcnRdIHJlcGVhdCg4LCBbY29sLXN0YXJ0XSBtaW5tYXgobWluLWNvbnRlbnQsIDE0cmVtKSBbY29sLWVuZF0pIFtjZW50ZXItZW5kXSBtaW5tYXgoNnJlbSwgMWZyKSBbZnVsbC1lbmRdO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2Y1ZjZmNztcXG4gIGJhY2tncm91bmQtc2l6ZTogY292ZXI7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7IH1cXG5cXG4uc2VhcmNoIHtcXG4gIGdyaWQtY29sdW1uOiBmdWxsLXN0YXJ0IC8gZnVsbC1lbmQ7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmOyB9XFxuXFxuLmFwaS1yZXN1bHRzLWRpc3BsYXkge1xcbiAgZ3JpZC1jb2x1bW46IGZ1bGwtc3RhcnQgLyBmdWxsLWVuZDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmNWY2Zjc7XFxuICBiYWNrZ3JvdW5kLXNpemU6IGNvdmVyO1xcbiAgZGlzcGxheTogZ3JpZDsgfVxcblwiLCBcIlwiLHtcInZlcnNpb25cIjozLFwic291cmNlc1wiOltcIndlYnBhY2s6Ly8uL3NyYy9jc3Mvc3R5bGUuY3NzXCJdLFwibmFtZXNcIjpbXSxcIm1hcHBpbmdzXCI6XCJBQUFBOzs7RUFHRSxTQUFTO0VBQ1QsVUFBVTtFQUNWLG1CQUFtQixFQUFFOztBQUV2QjtFQUNFLGdCQUFnQixFQUFFOztBQUVwQjtFQUNFLHNCQUFzQjtFQUN0QixpQkFBaUI7RUFDakIsc0JBQXNCO0VBQ3RCLDRCQUE0QjtFQUM1QixnQkFBZ0I7RUFDaEIsK0JBQStCO0VBQy9CLGtCQUFrQixFQUFFOztBQUV0QjtFQUNFLHdCQUF3QixFQUFFOztBQUU1QjtFQUNFLGlCQUFpQjtFQUNqQix5QkFBeUIsRUFBRTtF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QixFQUFFO0VBQ2hDO0lBQ0UscUJBQXFCO0lBQ3JCLDZCQUE2QjtJQUM3QixvQkFBb0I7SUFDcEIsaUJBQWlCO0lBQ2pCLDhCQUE4QjtJQUM5QiwrQkFBK0IsRUFBRTtJQUNqQztNQUNFLGNBQWMsRUFBRTtFQUNwQjtJQUNFLGNBQWMsRUFBRTs7QUFFcEI7O0VBRUUsa0JBQWtCO0VBQ2xCLGdCQUFnQjtFQUNoQixPQUFPO0VBQ1AsYUFBYTtFQUNiLFdBQVcsRUFBRTs7QUFFZjtFQUNFLFNBQVMsRUFBRTs7QUFFYjtFQUNFLGVBQWUsRUFBRTs7QUFFbkI7O0VBRUUsa0JBQWtCO0VBQ2xCLFlBQVk7RUFDWixnQkFBZ0I7RUFDaEIsMkJBQTJCO0VBQzNCLGNBQWMsRUFBRTs7QUFFbEI7O0VBRUUsY0FBYztFQUNkLGVBQWU7RUFDZixrQkFBa0I7RUFDbEIseUJBQXlCO0VBQ3pCLHdCQUF3QjtFQUN4QixvQkFBb0I7RUFDcEIsa0NBQWtDLEVBQUU7RUFDcEM7O0lBRUUsV0FBVyxFQUFFO0VBQ2Y7O0lBRUUsV0FBVztJQUNYLFlBQVksRUFBRTtFQUNoQjs7SUFFRSxTQUFTO0lBQ1QsYUFBYSxFQUFFO0VBQ2pCOztJQUVFLFdBQVc7SUFDWCxhQUFhLEVBQUU7RUFDakI7O0lBRUUsV0FBVztJQUNYLGFBQWEsRUFBRTtFQUNqQjs7SUFFRSxXQUFXO0lBQ1gsV0FBVyxFQUFFO0VBQ2Y7O0lBRUUsV0FBVztJQUNYLFFBQVEsRUFBRTtFQUNaOztJQUVFLDBCQUEwQixFQUFFOztBQUVoQztFQUNFLGFBQWE7RUFDYiwwS0FBMEs7RUFDMUsseUJBQXlCO0VBQ3pCLHNCQUFzQjtFQUN0QixrQkFBa0IsRUFBRTs7QUFFdEI7RUFDRSxrQ0FBa0M7RUFDbEMsc0JBQXNCLEVBQUU7O0FBRTFCO0VBQ0Usa0NBQWtDO0VBQ2xDLHlCQUF5QjtFQUN6QixzQkFBc0I7RUFDdEIsYUFBYSxFQUFFXCIsXCJzb3VyY2VzQ29udGVudFwiOltcIiosXFxuKjo6YWZ0ZXIsXFxuKjo6YmVmb3JlIHtcXG4gIG1hcmdpbjogMDtcXG4gIHBhZGRpbmc6IDA7XFxuICBib3gtc2l6aW5nOiBpbmhlcml0OyB9XFxuXFxuaHRtbCB7XFxuICBmb250LXNpemU6IDYyLjUlOyB9XFxuXFxuYm9keSB7XFxuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbiAgZm9udC1zaXplOiAxLjZyZW07XFxuICBiYWNrZ3JvdW5kLXNpemU6IGNvdmVyO1xcbiAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcXG4gIGhlaWdodDogMTI3LjVyZW07XFxuICBmb250LWZhbWlseTogJ0xhdG8nLCBzYW5zLXNlcmlmO1xcbiAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuXFxuW2hpZGRlbl0ge1xcbiAgZGlzcGxheTogbm9uZSAhaW1wb3J0YW50OyB9XFxuXFxuLmhlYWRpbmctdGVydGlhcnkge1xcbiAgZm9udC1zaXplOiAyLjRyZW07XFxuICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOyB9XFxuICAuaGVhZGluZy10ZXJ0aWFyeS0td2hpdGUge1xcbiAgICBjb2xvcjogI2ZmZjsgfVxcblxcbi5oZWFkaW5nLXByaW1hcnkge1xcbiAgZm9udC1zaXplOiAzcmVtO1xcbiAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcXG4gIGZvbnQtd2VpZ2h0OiAzMDA7XFxuICBjb2xvcjogI2ZmZjsgfVxcblxcbi5tYi0xMCB7XFxuICBtYXJnaW4tYm90dG9tOiAxcmVtOyB9XFxuXFxuLm1iLTIwIHtcXG4gIG1hcmdpbi1ib3R0b206IDJyZW07IH1cXG5cXG4ubXQtNTAge1xcbiAgbWFyZ2luLXRvcDogNXJlbTsgfVxcblxcbi5idG4sIC5idG46bGluaywgLmJ0bjp2aXNpdGVkIHtcXG4gIHBhZGRpbmc6IC43NXJlbSAycmVtO1xcbiAgYm9yZGVyLXJhZGl1czogLjVyZW07XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjJmMmYyO1xcbiAgZm9udC13ZWlnaHQ6IDQwMDtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jazsgfVxcblxcbi5idG46YWN0aXZlLCAuYnRuOmZvY3VzIHtcXG4gIG91dGxpbmU6IG5vbmU7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTFweCk7XFxuICBib3gtc2hhZG93OiAwIDAuNXJlbSAxcmVtIHJnYmEoMCwgMCwgMCwgMC4yKTsgfVxcblxcbi5sb2dpbixcXG4ucmVnaXN0ZXIge1xcbiAgbWluLWhlaWdodDogY2FsYygxMDB2aCAtIDYuMXJlbSk7XFxuICB3aWR0aDogMTAwdnc7XFxuICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQodG8gdG9wLCAjNWY0ZjY2LCAjMzQyMzMyKTtcXG4gIGJhY2tncm91bmQtcmVwZWF0OiBuby1yZXBlYXQ7XFxuICBiYWNrZ3JvdW5kLXNpemU6IGNvdmVyO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfVxcbiAgLmxvZ2luLWltZyxcXG4gIC5yZWdpc3Rlci1pbWcge1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIGJvcmRlci1yYWRpdXM6IDEwMCU7XFxuICAgIGhlaWdodDogOC41cmVtO1xcbiAgICB3aWR0aDogOC41cmVtO1xcbiAgICB0b3A6IC0xNSU7IH1cXG4gIC5sb2dpbl9fZm9ybSxcXG4gIC5yZWdpc3Rlcl9fZm9ybSB7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzFlMmEzODtcXG4gICAgYm9yZGVyOiAycHggc29saWQgIzFlMmEzODtcXG4gICAgYm94LXNoYWRvdzogMHB4IDJweCA1cHggcmdiYSgwLCAwLCAwLCAwLjI1KTtcXG4gICAgbWF4LXdpZHRoOiAzMnJlbTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1mbG93OiBjb2x1bW4gbm93cmFwO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBwYWRkaW5nOiA0cmVtIDAgMi42cmVtIDA7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtMjUlKTsgfVxcbiAgLmxvZ2luX19mb3JtLWluc3RydWN0aW9ucyxcXG4gIC5yZWdpc3Rlcl9fZm9ybS1pbnN0cnVjdGlvbnMge1xcbiAgICBjb2xvcjogI2ZmZjtcXG4gICAgZm9udC1zaXplOiAxLjRyZW07XFxuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcXG4gICAgd2lkdGg6IDkwJTsgfVxcbiAgLmxvZ2luX19mb3JtLWdyb3VwLFxcbiAgLnJlZ2lzdGVyX19mb3JtLWdyb3VwIHtcXG4gICAgd2lkdGg6IDkwJTsgfVxcbiAgLmxvZ2luX19mb3JtLWlucHV0LFxcbiAgLnJlZ2lzdGVyX19mb3JtLWlucHV0IHtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIG1hcmdpbjogMCBhdXRvO1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMik7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMCwgMCwgMC4xKTtcXG4gICAgYm94LXNoYWRvdzogcmdiYSgwLCAwLCAwLCAwLjUpO1xcbiAgICBib3JkZXItcmFkaXVzOiAycHg7XFxuICAgIG1hcmdpbi1ib3R0b206IDFyZW07XFxuICAgIGxpbmUtaGVpZ2h0OiAxLjI1O1xcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICAgIGhlaWdodDogNC4ycmVtO1xcbiAgICBwYWRkaW5nOiAxcmVtIDEuNHJlbTtcXG4gICAgY2FyZXQtY29sb3I6ICNmZmY7XFxuICAgIGNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNzUpOyB9XFxuICAgIC5sb2dpbl9fZm9ybS1pbnB1dDo6cGxhY2Vob2xkZXIsXFxuICAgIC5yZWdpc3Rlcl9fZm9ybS1pbnB1dDo6cGxhY2Vob2xkZXIge1xcbiAgICAgIGZvbnQtd2VpZ2h0OiAzMDA7XFxuICAgICAgY29sb3I6ICNlNmU2ZTY7XFxuICAgICAgZm9udC1zaXplOiAxLjhyZW07IH1cXG4gICAgLmxvZ2luX19mb3JtLWlucHV0OmZvY3VzLFxcbiAgICAucmVnaXN0ZXJfX2Zvcm0taW5wdXQ6Zm9jdXMge1xcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC43NSk7IH1cXG4gIC5sb2dpbl9fZm9ybS1idG4sXFxuICAucmVnaXN0ZXJfX2Zvcm0tYnRuIHtcXG4gICAgd2lkdGg6IDkwJTtcXG4gICAgYm9yZGVyLXJhZGl1czogMnB4O1xcbiAgICBwYWRkaW5nOiAwIDEuNHJlbTtcXG4gICAgbWFyZ2luOiAxcmVtIGF1dG8gMCBhdXRvO1xcbiAgICBib3gtc2hhZG93OiAwIDJweCA1cHggcmdiYSgwLCAwLCAwLCAwLjI1KTtcXG4gICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWFyb3VuZDtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgaGVpZ2h0OiA0LjJyZW07IH1cXG4gICAgLmxvZ2luX19mb3JtLWJ0bi0tbG9naW4sXFxuICAgIC5yZWdpc3Rlcl9fZm9ybS1idG4tLWxvZ2luIHtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuODcpO1xcbiAgICAgIGNvbG9yOiAjMTYxNjFkO1xcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkICNmZmY7IH1cXG4gICAgICAubG9naW5fX2Zvcm0tYnRuLS1sb2dpbjpob3ZlcixcXG4gICAgICAucmVnaXN0ZXJfX2Zvcm0tYnRuLS1sb2dpbjpob3ZlciB7XFxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgICAgICAgY29sb3I6ICMzNDI0NDI7IH1cXG4gICAgICAubG9naW5fX2Zvcm0tYnRuLS1sb2dpbjpob3ZlciAubG9naW5fX2Zvcm0taWNvbi1wYXRoLS1sb2dpbixcXG4gICAgICAucmVnaXN0ZXJfX2Zvcm0tYnRuLS1sb2dpbjpob3ZlciAubG9naW5fX2Zvcm0taWNvbi1wYXRoLS1sb2dpbiB7XFxuICAgICAgICBmaWxsOiAjMzQyNDQyOyB9XFxuICAgICAgLmxvZ2luX19mb3JtLWJ0bi0tbG9naW46OmFmdGVyLFxcbiAgICAgIC5yZWdpc3Rlcl9fZm9ybS1idG4tLWxvZ2luOjphZnRlciB7XFxuICAgICAgICBtYXJnaW4tYm90dG9tOiAxcHggc29saWQgd2hpdGU7IH1cXG4gICAgLmxvZ2luX19mb3JtLWJ0bi0tcmVnaXN0ZXIsXFxuICAgIC5yZWdpc3Rlcl9fZm9ybS1idG4tLXJlZ2lzdGVyIHtcXG4gICAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpO1xcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNSk7XFxuICAgICAgY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC43NSk7IH1cXG4gICAgICAubG9naW5fX2Zvcm0tYnRuLS1yZWdpc3Rlcjpob3ZlcixcXG4gICAgICAucmVnaXN0ZXJfX2Zvcm0tYnRuLS1yZWdpc3Rlcjpob3ZlciB7XFxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMjUpO1xcbiAgICAgICAgY29sb3I6ICNmZmY7IH1cXG4gICAgICAubG9naW5fX2Zvcm0tYnRuLS1yZWdpc3Rlcjpob3ZlciAubG9naW5fX2Zvcm0taWNvbi1wYXRoLS1sb2dpbixcXG4gICAgICAucmVnaXN0ZXJfX2Zvcm0tYnRuLS1yZWdpc3Rlcjpob3ZlciAubG9naW5fX2Zvcm0taWNvbi1wYXRoLS1sb2dpbiB7XFxuICAgICAgICBmaWxsOiAjZmZmOyB9XFxuICAgIC5sb2dpbl9fZm9ybS1idG4gc3BhbixcXG4gICAgLnJlZ2lzdGVyX19mb3JtLWJ0biBzcGFuIHtcXG4gICAgICBtYXJnaW4tcmlnaHQ6IDFyZW07IH1cXG4gIC5sb2dpbl9fZm9ybS1pY29uLFxcbiAgLnJlZ2lzdGVyX19mb3JtLWljb24ge1xcbiAgICBoZWlnaHQ6IDEuNXJlbTtcXG4gICAgd2lkdGg6IDEuNXJlbTtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDE3JSk7IH1cXG4gIC5sb2dpbl9fZm9ybS1pY29uLXBhdGgtLWxvZ2luLFxcbiAgLnJlZ2lzdGVyX19mb3JtLWljb24tcGF0aC0tbG9naW4ge1xcbiAgICBmaWxsOiAjMTYxNjFkOyB9XFxuICAubG9naW5fX2Zvcm0taWNvbi1wYXRoLS1yZWdpc3RlcixcXG4gIC5yZWdpc3Rlcl9fZm9ybS1pY29uLXBhdGgtLXJlZ2lzdGVyIHtcXG4gICAgZmlsbDogI2ZmZjsgfVxcbiAgLmxvZ2luX19mb3JtLWhyLFxcbiAgLnJlZ2lzdGVyX19mb3JtLWhyIHtcXG4gICAgd2lkdGg6IDkwJTtcXG4gICAgbWFyZ2luOiAycmVtIDAgMXJlbSAwO1xcbiAgICBtYXJnaW4tYm90dG9tOiAwLjI1cHggc29saWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjI1KTsgfVxcblxcbi5uYXYge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICBwYWRkaW5nOiAxcmVtIDE2JTtcXG4gIGJhY2tncm91bmQtY29sb3I6ICMyYjI1M2E7XFxuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgIzAwMDsgfVxcbiAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA3NXJlbSkge1xcbiAgICAubmF2IHtcXG4gICAgICBwYWRkaW5nOiAxLjJyZW0gMi41JTsgfSB9XFxuICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDQzLjc1ZW0pIHtcXG4gICAgLm5hdiB7XFxuICAgICAgcGFkZGluZzogMXJlbTsgfSB9XFxuICAubmF2X19sZWZ0IHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleDogMCAwIDUwJTsgfVxcbiAgLm5hdl9fcmlnaHQge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBib3JkZXItcmlnaHQ6IDFweCBzb2xpZCAjZmZmO1xcbiAgICBib3JkZXItbGVmdDogMXB4IHNvbGlkICNmZmY7XFxuICAgIHBhZGRpbmctbGVmdDogMXJlbTtcXG4gICAgbWFyZ2luLWxlZnQ6IGF1dG87IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA0MC42MjVlbSkge1xcbiAgICAgIC5uYXZfX3JpZ2h0IHtcXG4gICAgICAgIGRpc3BsYXk6IG5vbmU7IH0gfVxcbiAgICAubmF2X19yaWdodCA+ICoge1xcbiAgICAgIG1hcmdpbi1yaWdodDogMXJlbTsgfVxcbiAgLm5hdl9faXRlbS0tc2VhcmNoIHtcXG4gICAgZmxleDogMCAwIDI1JTsgfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDQwLjYyNWVtKSB7XFxuICAgICAgLm5hdl9faXRlbS0tc2VhcmNoIHtcXG4gICAgICAgIGRpc3BsYXk6IG5vbmU7IH0gfVxcbiAgLm5hdl9faXRlbS0taG9tZSB7XFxuICAgIG1hcmdpbi1yaWdodDogM3JlbTsgfVxcbiAgLm5hdl9fbGluayB7XFxuICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gICAgY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC43NSk7XFxuICAgIHRyYW5zaXRpb246IGFsbCAwLjJzOyB9XFxuICAgIC5uYXZfX2xpbms6aG92ZXIge1xcbiAgICAgIG1hcmdpbi1ib3R0b206IDJweDtcXG4gICAgICBjb2xvcjogI2ZmZjtcXG4gICAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2ZmZjsgfVxcbiAgICAubmF2X19saW5rLS1ob21lOmhvdmVyIC5uYXZfX2ljb24tcGF0aC0taG9tZSB7XFxuICAgICAgZmlsbDogI2ZmZjsgfVxcbiAgLm5hdl9fc2VhcmNoIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcbiAgICAubmF2X19zZWFyY2gtaW5wdXQge1xcbiAgICAgIGJvcmRlcjogbm9uZTtcXG4gICAgICBwYWRkaW5nOiAxcmVtIDJyZW07XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzJiMjUzYTtcXG4gICAgICBjYXJldC1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjc1KTtcXG4gICAgICBjb2xvcjogI2ZmZjsgfVxcbiAgICAgIC5uYXZfX3NlYXJjaC1pbnB1dDo6cGxhY2Vob2xkZXIge1xcbiAgICAgICAgY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC43NSk7IH1cXG4gICAgICAubmF2X19zZWFyY2gtaW5wdXQ6Zm9jdXMge1xcbiAgICAgICAgb3V0bGluZTogbm9uZTsgfVxcbiAgICAubmF2X19zZWFyY2gtYnRuIHtcXG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICAgIGxlZnQ6IDJyZW07XFxuICAgICAgdG9wOiAxcmVtOyB9XFxuICAgICAgLm5hdl9fc2VhcmNoLWJ0bjpob3ZlciAubmF2X19pY29uLXBhdGgtLXNlYXJjaCB7XFxuICAgICAgICBmaWxsOiAjZmZmOyB9XFxuICAubmF2X19pY29uLXNpemluZy0taG9tZSB7XFxuICAgIHdpZHRoOiAzcmVtO1xcbiAgICBoZWlnaHQ6IDNyZW07IH1cXG4gIC5uYXZfX2ljb24tc2l6aW5nLS1zZWFyY2gge1xcbiAgICB3aWR0aDogMnJlbTtcXG4gICAgaGVpZ2h0OiAycmVtO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTE1MCUpOyB9XFxuICAubmF2X19pY29uLXBhdGgtLWhvbWUge1xcbiAgICBmaWxsOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNzUpOyB9XFxuICAubmF2X19pY29uLXBhdGgtLXNlYXJjaCB7XFxuICAgIGZpbGw6ICNiZmJmYmY7IH1cXG4gIC5uYXZfX21vYmlsZSB7XFxuICAgIGRpc3BsYXk6IG5vbmU7IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA0MC42MjVlbSkge1xcbiAgICAgIC5uYXZfX21vYmlsZSB7XFxuICAgICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgICAgZmxleDogMCAwIDUwJTtcXG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGVuZDsgfSB9XFxuICAgIC5uYXZfX21vYmlsZS1saW5rcyB7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzJiMjUzYTtcXG4gICAgICBmbGV4LWZsb3c6IHdyYXA7XFxuICAgICAgcGFkZGluZzogMXJlbSAwO1xcbiAgICAgIGp1c3RpZnktY29udGVudDogZmxleC1zdGFydDtcXG4gICAgICBkaXNwbGF5OiBub25lOyB9XFxuICAgIC5uYXZfX21vYmlsZS1saW5rIHtcXG4gICAgICBmbGV4OiAwIDAgNDglO1xcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoODUsIDI2LCAxMzksIDAuNSk7XFxuICAgICAgYm9yZGVyLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNik7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpO1xcbiAgICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgICBtYXJnaW4tdG9wOiAwLjZyZW07XFxuICAgICAgbWFyZ2luLWxlZnQ6IDElO1xcbiAgICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gICAgICBjb2xvcjogI2ZmZjtcXG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgICAgbGluZS1oZWlnaHQ6IDEuNDtcXG4gICAgICBwYWRkaW5nOiAwLjJyZW0gMXJlbSAwIDFyZW07XFxuICAgICAgaGVpZ2h0OiAyLjhyZW07XFxuICAgICAgdHJhbnNpdGlvbjogYWxsIDAuMnM7XFxuICAgICAgYm94LXNoYWRvdzogMCAxcHggMXB4IDAgcmdiYSgwLCAwLCAwLCAwLjA2KTtcXG4gICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICAgICAgdHJhbnNpdGlvbjogYWxsIDAuMnM7IH1cXG4gICAgICAubmF2X19tb2JpbGUtbGluazpob3ZlciB7XFxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMjUpOyB9XFxuICAgIC5uYXZfX21vYmlsZS1oYW1idXJnZXItd3JhcHBlciB7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICAgIG1hcmdpbi1yaWdodDogMXJlbTtcXG4gICAgICBoZWlnaHQ6IDNyZW07XFxuICAgICAgd2lkdGg6IDNyZW07IH1cXG4gICAgLm5hdl9fbW9iaWxlLWhhbWJ1cmdlciB7XFxuICAgICAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuICAgICAgLm5hdl9fbW9iaWxlLWhhbWJ1cmdlciwgLm5hdl9fbW9iaWxlLWhhbWJ1cmdlcjo6YmVmb3JlLCAubmF2X19tb2JpbGUtaGFtYnVyZ2VyOjphZnRlciB7XFxuICAgICAgICB3aWR0aDogM3JlbTtcXG4gICAgICAgIGhlaWdodDogMnB4O1xcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjc1KTtcXG4gICAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jazsgfVxcbiAgICAgIC5uYXZfX21vYmlsZS1oYW1idXJnZXI6OmJlZm9yZSwgLm5hdl9fbW9iaWxlLWhhbWJ1cmdlcjo6YWZ0ZXIge1xcbiAgICAgICAgY29udGVudDogJyc7XFxuICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgICAgICBsZWZ0OiAwOyB9XFxuICAgICAgLm5hdl9fbW9iaWxlLWhhbWJ1cmdlcjo6YmVmb3JlIHtcXG4gICAgICAgIG1hcmdpbi10b3A6IC0wLjhyZW07IH1cXG4gICAgICAubmF2X19tb2JpbGUtaGFtYnVyZ2VyOjphZnRlciB7XFxuICAgICAgICBtYXJnaW4tdG9wOiAwLjhyZW07IH1cXG5cXG4uZXJyb3Ige1xcbiAgbWFyZ2luLXRvcDogMnJlbTtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZjgwODA7XFxuICBib3JkZXItcmFkaXVzOiAxMHB4O1xcbiAgcGFkZGluZzogMnJlbTtcXG4gIGZvbnQtc2l6ZTogMnJlbTtcXG4gIGdyaWQtY29sdW1uOiBjZW50ZXItc3RhcnQgLyBjZW50ZXItZW5kO1xcbiAgZm9udC13ZWlnaHQ6IDcwMDsgfVxcblxcbi5zZWFyY2gtZm9ybSB7XFxuICBwYWRkaW5nOiAycmVtIDI1cmVtO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2ZkZmRmZDtcXG4gIG1pbi1oZWlnaHQ6IGNhbGMoMTAwdmggLSA2LjJyZW0pOyB9XFxuICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDgxLjI1ZW0pIHtcXG4gICAgLnNlYXJjaC1mb3JtIHtcXG4gICAgICBwYWRkaW5nOiAycmVtIDE1cmVtOyB9IH1cXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNjIuNWVtKSB7XFxuICAgIC5zZWFyY2gtZm9ybSB7XFxuICAgICAgcGFkZGluZzogMnJlbSA1cmVtOyB9IH1cXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNTYuMjVlbSkge1xcbiAgICAuc2VhcmNoLWZvcm0ge1xcbiAgICAgIHBhZGRpbmc6IDJyZW0gMXJlbTsgfSB9XFxuICAuc2VhcmNoLWZvcm1fX2dyb3VwIHtcXG4gICAgd2lkdGg6IDc1JTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgbWFyZ2luLWJvdHRvbTogM3JlbTtcXG4gICAgYWxpZ24taXRlbXM6IGZsZXgtc3RhcnQ7XFxuICAgIHBhZGRpbmc6IDAuNXJlbSA0cmVtIDAuNXJlbSAwO1xcbiAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgcmdiYSgwLCAwLCAwLCAwLjIpOyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogOTMuNzVlbSkge1xcbiAgICAgIC5zZWFyY2gtZm9ybV9fZ3JvdXAge1xcbiAgICAgICAgd2lkdGg6IDEwMCU7IH0gfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDQ2Ljg3NWVtKSB7XFxuICAgICAgLnNlYXJjaC1mb3JtX19ncm91cCB7XFxuICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9IH1cXG4gICAgLnNlYXJjaC1mb3JtX19ncm91cDpudGgtY2hpbGQoMTApIHtcXG4gICAgICBib3JkZXItYm90dG9tOiBub25lOyB9XFxuICAgIC5zZWFyY2gtZm9ybV9fZ3JvdXAtLW5vLWJvcmRlciB7XFxuICAgICAgYm9yZGVyLWJvdHRvbTogbm9uZTsgfVxcbiAgLnNlYXJjaC1mb3JtX19sYWJlbCB7XFxuICAgIGZsZXg6IDAgMCAyMCU7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBmbGV4LXN0YXJ0O1xcbiAgICBmb250LXdlaWdodDogMzAwO1xcbiAgICBtYXJnaW4tdG9wOiAwLjdyZW07XFxuICAgIGNvbG9yOiAjNTUxYThiOyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNDYuODc1ZW0pIHtcXG4gICAgICAuc2VhcmNoLWZvcm1fX2xhYmVsIHtcXG4gICAgICAgIG1hcmdpbi1ib3R0b206IDEuMnJlbTtcXG4gICAgICAgIG1hcmdpbi1sZWZ0OiAxcmVtOyB9IH1cXG4gIC5zZWFyY2gtZm9ybV9fZ3JvdXAtaW5wdXQtd3JhcHBlciB7XFxuICAgIGZsZXg6IDAgMCA4MCU7IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA0Ni44NzVlbSkge1xcbiAgICAgIC5zZWFyY2gtZm9ybV9fZ3JvdXAtaW5wdXQtd3JhcHBlciB7XFxuICAgICAgICBmbGV4OiAwIDAgMTAwJTtcXG4gICAgICAgIHdpZHRoOiAxMDAlOyB9IH1cXG4gIC5zZWFyY2gtZm9ybV9faW5wdXQtd3JhcHBlciB7XFxuICAgIGZsZXg6IDAgMCA4MCU7IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA0Ni44NzVlbSkge1xcbiAgICAgIC5zZWFyY2gtZm9ybV9faW5wdXQtd3JhcHBlciB7XFxuICAgICAgICBmbGV4OiAwIDAgMTAwJTtcXG4gICAgICAgIHdpZHRoOiAxMDAlOyB9IH1cXG4gIC5zZWFyY2gtZm9ybV9fdGlwIHtcXG4gICAgZm9udC1zaXplOiAxcmVtO1xcbiAgICBsaW5lLWhlaWdodDogMS40O1xcbiAgICB3aWR0aDogNzAlOyB9XFxuICAuc2VhcmNoLWZvcm1fX2lucHV0LXRleHQge1xcbiAgICB3aWR0aDogNDByZW07XFxuICAgIGhlaWdodDogNHJlbTtcXG4gICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcXG4gICAgcGFkZGluZzogMXJlbTtcXG4gICAgYm9yZGVyOiBzb2xpZCAxcHggI2JmYmZiZjtcXG4gICAgYm9yZGVyLXJhZGl1czogNXB4OyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogMjguMTI1ZW0pIHtcXG4gICAgICAuc2VhcmNoLWZvcm1fX2lucHV0LXRleHQge1xcbiAgICAgICAgd2lkdGg6IDMwcmVtOyB9IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiAyMS44NzVlbSkge1xcbiAgICAgIC5zZWFyY2gtZm9ybV9faW5wdXQtdGV4dCB7XFxuICAgICAgICB3aWR0aDogMjByZW07IH0gfVxcbiAgICAuc2VhcmNoLWZvcm1fX2lucHV0LXRleHQ6Zm9jdXMge1xcbiAgICAgIGJvcmRlcjogc29saWQgMXB4ICMwMDA7IH1cXG4gIC5zZWFyY2gtZm9ybV9faW5wdXQtaW50ZWdlciB7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkICNhZWFlYWU7XFxuICAgIGhlaWdodDogMy41cmVtO1xcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XFxuICAgIHBhZGRpbmctbGVmdDogMC41cmVtO1xcbiAgICBwYWRkaW5nLXJpZ2h0OiAwLjVyZW07XFxuICAgIGJveC1zaGFkb3c6IDAgMXB4IDFweCAwIHJnYmEoMCwgMCwgMCwgMC4wNik7IH1cXG4gICAgLnNlYXJjaC1mb3JtX19pbnB1dC1pbnRlZ2VyLS1yZWxhdGl2ZSB7XFxuICAgICAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogMzcuNWVtKSB7XFxuICAgICAgLnNlYXJjaC1mb3JtX19pbnB1dC1pbnRlZ2VyIHtcXG4gICAgICAgIG1heC13aWR0aDogMzAlOyB9IH1cXG4gIC5zZWFyY2gtZm9ybV9fZ3JvdXAtLWNoZWNrYm94IHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgbWFyZ2luLWJvdHRvbTogMXJlbTsgfVxcbiAgLnNlYXJjaC1mb3JtX19ncm91cC1jb2xvcnMtbGVmdCwgLnNlYXJjaC1mb3JtX19ncm91cC1jb2xvcnMtcmlnaHQge1xcbiAgICBkaXNwbGF5OiBmbGV4OyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogODEuMjVlbSkge1xcbiAgICAgIC5zZWFyY2gtZm9ybV9fZ3JvdXAtY29sb3JzLWxlZnQsIC5zZWFyY2gtZm9ybV9fZ3JvdXAtY29sb3JzLXJpZ2h0IHtcXG4gICAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH0gfVxcbiAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA4MS4yNWVtKSB7XFxuICAgIC5zZWFyY2gtZm9ybV9fZ3JvdXAtY29sb3JzLWxlZnQge1xcbiAgICAgIG1hcmdpbi1yaWdodDogM3JlbTsgfSB9XFxuICAuc2VhcmNoLWZvcm1fX2dyb3VwLXJhcml0eS1sZWZ0LCAuc2VhcmNoLWZvcm1fX2dyb3VwLXJhcml0eS1yaWdodCB7XFxuICAgIGRpc3BsYXk6IGZsZXg7IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiAyOC4xMjVlbSkge1xcbiAgICAgIC5zZWFyY2gtZm9ybV9fZ3JvdXAtcmFyaXR5LWxlZnQsIC5zZWFyY2gtZm9ybV9fZ3JvdXAtcmFyaXR5LXJpZ2h0IHtcXG4gICAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH0gfVxcbiAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA4MS4yNWVtKSB7XFxuICAgIC5zZWFyY2gtZm9ybV9fZ3JvdXAtcmFyaXR5LWxlZnQge1xcbiAgICAgIG1hcmdpbi1yaWdodDogM3JlbTsgfSB9XFxuICAuc2VhcmNoLWZvcm1fX2xhYmVsLS1jaGVja2JveCB7XFxuICAgIG1hcmdpbi1yaWdodDogMXJlbTsgfVxcbiAgLnNlYXJjaC1mb3JtX19pbnB1dC1jaGVja2JveCB7XFxuICAgIHdpZHRoOiAyLjI1cmVtO1xcbiAgICBoZWlnaHQ6IDIuMjVyZW07XFxuICAgIG1hcmdpbi1yaWdodDogMC44cmVtOyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogOTMuNzVlbSkge1xcbiAgICAgIC5zZWFyY2gtZm9ybV9faW5wdXQtY2hlY2tib3gge1xcbiAgICAgICAgbWFyZ2luLWJvdHRvbTogMC4zcmVtOyB9IH1cXG4gIC5zZWFyY2gtZm9ybV9fY2hlY2tib3gtd3JhcHBlciB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cXG4gIC5zZWFyY2gtZm9ybV9fc2VsZWN0LW1lbnUge1xcbiAgICBtYXJnaW4tYm90dG9tOiAxcmVtO1xcbiAgICBjb2xvcjogIzM0MzI0MjtcXG4gICAgbWFyZ2luLXJpZ2h0OiAxcmVtO1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCAjYWVhZWFlO1xcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XFxuICAgIGJveC1zaGFkb3c6IDAgMXB4IDFweCAwIHJnYmEoMCwgMCwgMCwgMC4wNik7XFxuICAgIHBhZGRpbmc6IDAgMi4ycmVtIDAgMC41cmVtO1xcbiAgICBoZWlnaHQ6IDMuNHJlbTtcXG4gICAgZm9udC1zaXplOiAxLjRyZW07XFxuICAgIHRleHQtaW5kZW50OiAwO1xcbiAgICAtd2Via2l0LWFwcGVhcmFuY2U6IG5vbmU7XFxuICAgIC1tb3otYXBwZWFyYW5jZTogbm9uZTtcXG4gICAgdGV4dC1vdmVyZmxvdzogJyc7XFxuICAgIGJhY2tncm91bmQtaW1hZ2U6IHVybCguLi8uLi9hcHAvc3RhdGljL2ltZy9TVkcvYXJyb3ctZG93bjIuc3ZnKTtcXG4gICAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcXG4gICAgYmFja2dyb3VuZC1wb3NpdGlvbjogcmlnaHQgMC44cmVtIGNlbnRlcjtcXG4gICAgYmFja2dyb3VuZC1zaXplOiAxLjJyZW0gMXJlbTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjsgfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDgxLjI1ZW0pIHtcXG4gICAgICAuc2VhcmNoLWZvcm1fX3NlbGVjdC1tZW51IHtcXG4gICAgICAgIG1hcmdpbi1yaWdodDogMC4zcmVtOyB9IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiAzNy41ZW0pIHtcXG4gICAgICAuc2VhcmNoLWZvcm1fX3NlbGVjdC1tZW51LS0yIHtcXG4gICAgICAgIG1heC13aWR0aDogNDklOyB9IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiAzNy41ZW0pIHtcXG4gICAgICAuc2VhcmNoLWZvcm1fX3NlbGVjdC1tZW51LS0zIHtcXG4gICAgICAgIG1heC13aWR0aDogMzIlOyB9IH1cXG4gIC5zZWFyY2gtZm9ybV9fc3ZnLXNpemUge1xcbiAgICBoZWlnaHQ6IDJyZW07XFxuICAgIHdpZHRoOiAycmVtO1xcbiAgICBtYXJnaW4tcmlnaHQ6IDFyZW07IH1cXG4gIC5zZWFyY2gtZm9ybV9fc3ZnLWNvbG9yIHtcXG4gICAgZmlsbDogIzU1MWE4YjsgfVxcbiAgLnNlYXJjaC1mb3JtX19zdWJtaXQtd3JhcHBlciB7XFxuICAgIHBvc2l0aW9uOiBzdGlja3k7XFxuICAgIGJvdHRvbTogMDtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIG1hcmdpbi1ib3R0b206IDNyZW07XFxuICAgIGJvcmRlci10b3A6IDFweCBzb2xpZCByZ2JhKDAsIDAsIDAsIDAuMik7XFxuICAgIGFsaWduLWl0ZW1zOiBmbGV4LXN0YXJ0O1xcbiAgICBwYWRkaW5nOiAxLjVyZW0gNHJlbSAxLjVyZW0gMDtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2ZkZmRmZDtcXG4gICAgei1pbmRleDogMTsgfVxcbiAgLnNlYXJjaC1mb3JtX19zdWJtaXQge1xcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XFxuICAgIHBhZGRpbmc6IDAuN3JlbTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2Y5ZjdmNTtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSg4NSwgMjYsIDEzOSwgMC41KTtcXG4gICAgY29sb3I6ICM1NTFhOGI7XFxuICAgIGZvbnQtd2VpZ2h0OiA1MDA7XFxuICAgIHRyYW5zaXRpb246IGFsbCAwLjJzO1xcbiAgICBtYXJnaW4tbGVmdDogMjAlOyB9XFxuICAgIC5zZWFyY2gtZm9ybV9fc3VibWl0OmhvdmVyIHtcXG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjsgfVxcbiAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1zcGFuIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgfVxcbiAgLnNlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcywgLnNlYXJjaC1mb3JtX19zZWxlY3RlZC1zZXRzIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gICAgbGlzdC1zdHlsZTogbm9uZTtcXG4gICAgbWFyZ2luLWJvdHRvbTogMC4zcmVtOyB9XFxuICAuc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLWxpc3QtaXRlbSwgLnNlYXJjaC1mb3JtX19zZWxlY3RlZC1zZXRzLWxpc3QtaXRlbSB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIG1hcmdpbi1ib3R0b206IDAuN3JlbTsgfVxcbiAgLnNlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy1yZW1vdmUtYnRuLCAuc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXNldHMtcmVtb3ZlLWJ0biB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgIGhlaWdodDogMnJlbTtcXG4gICAgd2lkdGg6IDJyZW07XFxuICAgIGZvbnQtc2l6ZTogMS4zcmVtO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjJmMmYyO1xcbiAgICBtYXJnaW4tcmlnaHQ6IDAuN3JlbTsgfVxcbiAgLnNlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy10b2dnbGVyIHtcXG4gICAgaGVpZ2h0OiAycmVtO1xcbiAgICB3aWR0aDogMi43NXJlbTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgZm9udC1zaXplOiAxLjNyZW07XFxuICAgIG1hcmdpbi1yaWdodDogMC43cmVtOyB9XFxuICAgIC5zZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlci0taXMge1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICM0N2QxNDc7IH1cXG4gICAgLnNlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy10b2dnbGVyLS1ub3Qge1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmZjAwMDA7IH1cXG4gIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24ge1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIG1heC1oZWlnaHQ6IDI4cmVtO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgICB6LWluZGV4OiAyO1xcbiAgICB0b3A6IDEwMCU7XFxuICAgIHdpZHRoOiA0MHJlbTtcXG4gICAgbWFyZ2luLXRvcDogLTFyZW07XFxuICAgIG92ZXJmbG93LXk6IGF1dG87XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkICMwMDA7IH1cXG4gICAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0IHtcXG4gICAgICBsaXN0LXN0eWxlOiBub25lOyB9XFxuICAgICAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0LWNhdGVnb3J5IHtcXG4gICAgICAgIHBhZGRpbmc6IDAuNXJlbTsgfVxcbiAgICAgIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1vcHRpb24ge1xcbiAgICAgICAgcGFkZGluZzogMC4zcmVtIDJyZW07XFxuICAgICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfVxcbiAgICAgICAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0LW9wdGlvbjpob3ZlciB7XFxuICAgICAgICAgIGN1cnNvcjogcG9pbnRlcjsgfVxcbiAgICAgICAgLnNlYXJjaC1mb3JtX19kcm9wZG93bi1saXN0LW9wdGlvbi0taGlnaGxpZ2h0ZWQge1xcbiAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjY2NkOGZmOyB9XFxuICAgICAgICAuc2VhcmNoLWZvcm1fX2Ryb3Bkb3duLWxpc3Qtb3B0aW9uIHNwYW4ge1xcbiAgICAgICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xcbiAgICAgICAgICBtYXJnaW4tbGVmdDogMXJlbTsgfVxcbiAgICAgIC5zZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1pbWcge1xcbiAgICAgICAgd2lkdGg6IDJyZW07XFxuICAgICAgICBoZWlnaHQ6IDJyZW07XFxuICAgICAgICBtYXJnaW4tcmlnaHQ6IDAuN3JlbTsgfVxcblxcbi5kcm9wZG93bi13cmFwcGVyIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxcblxcbi5pbnYtc2VhcmNoLXByaWNlLW1zZyB7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICBib3R0b206IDA7XFxuICByaWdodDogMDtcXG4gIGNvbG9yOiByZWQ7IH1cXG5cXG4ucmVsYXRpdmUge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuXFxuLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdiB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjNmNWY4O1xcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHJnYmEoOTksIDY4LCAxNTAsIDAuMSk7XFxuICB3aWR0aDogMTAwJTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxuICBwYWRkaW5nOiAxLjJyZW0gMTYlO1xcbiAgbWFyZ2luLWJvdHRvbTogMC4xcmVtO1xcbiAgaGVpZ2h0OiA1LjJyZW07IH1cXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNzVyZW0pIHtcXG4gICAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdiB7XFxuICAgICAgcGFkZGluZzogMS4ycmVtIDIuNSU7IH0gfVxcbiAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA1My4xMjVlbSkge1xcbiAgICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2IHtcXG4gICAgICBkaXNwbGF5OiBub25lOyB9IH1cXG4gIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtc2VsZWN0IHtcXG4gICAgY29sb3I6ICNiMzAwYjM7XFxuICAgIG1hcmdpbi1yaWdodDogMXJlbTtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSg4NSwgMjYsIDEzOSwgMC41KTtcXG4gICAgYm9yZGVyLXJhZGl1czogM3B4O1xcbiAgICBib3gtc2hhZG93OiAwIDFweCAxcHggMCByZ2JhKDAsIDAsIDAsIDAuMDYpO1xcbiAgICBwYWRkaW5nOiAwLjFyZW0gMi4ycmVtIDAgMC41cmVtO1xcbiAgICBjb2xvcjogIzU1MWE4YjtcXG4gICAgaGVpZ2h0OiAyLjhyZW07XFxuICAgIGZvbnQtc2l6ZTogMS40cmVtO1xcbiAgICB0ZXh0LWluZGVudDogMDtcXG4gICAgLXdlYmtpdC1hcHBlYXJhbmNlOiBub25lO1xcbiAgICAtbW96LWFwcGVhcmFuY2U6IG5vbmU7XFxuICAgIHRleHQtb3ZlcmZsb3c6ICcnO1xcbiAgICBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoLi4vLi4vYXBwL3N0YXRpYy9pbWcvU1ZHL2Fycm93LWRvd24yLnN2Zyk7XFxuICAgIGJhY2tncm91bmQtcmVwZWF0OiBuby1yZXBlYXQ7XFxuICAgIGJhY2tncm91bmQtcG9zaXRpb246IHJpZ2h0IDAuOHJlbSBjZW50ZXI7XFxuICAgIGJhY2tncm91bmQtc2l6ZTogMS4ycmVtIDFyZW07IH1cXG4gICAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1zZWxlY3Q6aG92ZXIge1xcbiAgICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmOyB9XFxuICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LWxhYmVsIHtcXG4gICAgY29sb3I6ICM1NTFhOGI7IH1cXG4gIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtYnRuIHtcXG4gICAgYm9yZGVyLXJhZGl1czogM3B4O1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjlmN2Y1O1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDg1LCAyNiwgMTM5LCAwLjUpO1xcbiAgICBjb2xvcjogIzU1MWE4YjtcXG4gICAgZm9udC13ZWlnaHQ6IDUwMDtcXG4gICAgdHJhbnNpdGlvbjogYWxsIDAuMnM7XFxuICAgIGhlaWdodDogMi44cmVtO1xcbiAgICBwYWRkaW5nOiAwLjFyZW0gMC43cmVtIDAgMC43cmVtO1xcbiAgICBmb250LXNpemU6IDEuNHJlbTtcXG4gICAgbWFyZ2luOiBhdXRvIDA7XFxuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gICAgYm94LXNoYWRvdzogMCAxcHggMXB4IDAgcmdiYSgwLCAwLCAwLCAwLjA2KTsgfVxcbiAgICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LWJ0bjpob3ZlciB7XFxuICAgICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmZmY7IH1cXG4gIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtcmlnaHQge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXBhZ2luYXRpb24tY29udGFpbmVyIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2Y5ZjdmNTtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSg4NSwgMjYsIDEzOSwgMC41KTtcXG4gICAgY29sb3I6ICM1NTFhOGI7XFxuICAgIHBhZGRpbmc6IDAuMnJlbSAwLjdyZW07XFxuICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgaGVpZ2h0OiAyLjhyZW07XFxuICAgIGJveC1zaGFkb3c6IDAgMXB4IDFweCAwIHJnYmEoMCwgMCwgMCwgMC4wNik7IH1cXG4gICAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1wYWdpbmF0aW9uLWNvbnRhaW5lcjpub3QoOmxhc3QtY2hpbGQpIHtcXG4gICAgICBtYXJnaW4tcmlnaHQ6IDFyZW07IH1cXG4gICAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1wYWdpbmF0aW9uLWNvbnRhaW5lcjpudGgtY2hpbGQoMikgc3ZnIHtcXG4gICAgICBtYXJnaW4tcmlnaHQ6IDFyZW07IH1cXG4gICAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1wYWdpbmF0aW9uLWNvbnRhaW5lcjpudGgtY2hpbGQoMykgc3ZnIHtcXG4gICAgICBtYXJnaW4tbGVmdDogMXJlbTsgfVxcbiAgICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXBhZ2luYXRpb24tY29udGFpbmVyLS1kaXNhYmxlZCB7XFxuICAgICAgY3Vyc29yOiBub3QtYWxsb3dlZDtcXG4gICAgICBjb2xvcjogcmdiYSgwLCAwLCAwLCAwLjI1KTtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjVmNmY3OyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogMzEuNWVtKSB7XFxuICAgICAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1wYWdpbmF0aW9uLWNvbnRhaW5lciB7XFxuICAgICAgICBtYXJnaW46IDA7IH0gfVxcbiAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1zdmctc2l6ZSB7XFxuICAgIGhlaWdodDogMnJlbTtcXG4gICAgd2lkdGg6IDJyZW07IH1cXG4gIC5hcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtc3ZnLWNvbG9yIHtcXG4gICAgZmlsbDogIzU1MWE4YjsgfVxcblxcbi5hcGktcmVzdWx0cy1kaXNwbGF5X19kaXNwbGF5LWJhciB7XFxuICB3aWR0aDogMTAwJTtcXG4gIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCByZ2JhKDk5LCA2OCwgMTUwLCAwLjEpO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2Y2ZjRmYTtcXG4gIGNvbG9yOiAjNTM1MzUzO1xcbiAgcGFkZGluZy1sZWZ0OiAxNiU7XFxuICBtYXJnaW4tYm90dG9tOiAycmVtO1xcbiAgaGVpZ2h0OiAyLjFyZW07IH1cXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNzVyZW0pIHtcXG4gICAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX2Rpc3BsYXktYmFyIHtcXG4gICAgICBwYWRkaW5nLWxlZnQ6IDIuNSU7IH0gfVxcblxcbi5hcGktcmVzdWx0cy1kaXNwbGF5X19tb2JpbGUge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2YzZjVmODtcXG4gIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCByZ2JhKDk5LCA2OCwgMTUwLCAwLjEpO1xcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgbWFyZ2luLWJvdHRvbTogMC4xcmVtO1xcbiAgaGVpZ2h0OiA1LjJyZW07XFxuICBkaXNwbGF5OiBub25lOyB9XFxuICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDUzLjEyNWVtKSB7XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19tb2JpbGUge1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgcGFkZGluZzogMS4ycmVtIDIuNSU7IH0gfVxcbiAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiAzMS41ZW0pIHtcXG4gICAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX21vYmlsZSB7XFxuICAgICAgcGFkZGluZzogMS4ycmVtOyB9IH1cXG4gIC5hcGktcmVzdWx0cy1kaXNwbGF5X19tb2JpbGUtc3ZnLXNpemUge1xcbiAgICB3aWR0aDogMS40cmVtO1xcbiAgICBoZWlnaHQ6IDEuNHJlbTsgfVxcblxcbi5hcGktcmVzdWx0cy1kaXNwbGF5X19tb2JpbGUtZGlzcGxheS1vcHRpb25zIHtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmM2Y1Zjg7XFxuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgcmdiYSg5OSwgNjgsIDE1MCwgMC4xKTtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICBhbGlnbi1pdGVtczogZmxleC1zdGFydDtcXG4gIHBhZGRpbmc6IDEuMnJlbSAwO1xcbiAgZGlzcGxheTogbm9uZTsgfVxcblxcbi5hcGktcmVzdWx0cy1kaXNwbGF5X19tb2JpbGUtZGlzcGxheS1vcHRpb25zLWdyb3VwIHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxuICB3aWR0aDogNDUlO1xcbiAgbWFyZ2luOiAwIGF1dG8gMXJlbSBhdXRvOyB9XFxuICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDUxLjU2MjVlbSkge1xcbiAgICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbW9iaWxlLWRpc3BsYXktb3B0aW9ucy1ncm91cCB7XFxuICAgICAgd2lkdGg6IDYwJTsgfSB9XFxuICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDM3LjVlbSkge1xcbiAgICAuYXBpLXJlc3VsdHMtZGlzcGxheV9fbW9iaWxlLWRpc3BsYXktb3B0aW9ucy1ncm91cCB7XFxuICAgICAgd2lkdGg6IDgwJTsgfSB9XFxuICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDI4LjEyNWVtKSB7XFxuICAgIC5hcGktcmVzdWx0cy1kaXNwbGF5X19tb2JpbGUtZGlzcGxheS1vcHRpb25zLWdyb3VwIHtcXG4gICAgICB3aWR0aDogOTUlOyB9IH1cXG4gIC5hcGktcmVzdWx0cy1kaXNwbGF5X19tb2JpbGUtZGlzcGxheS1vcHRpb25zLWdyb3VwIGxhYmVsIHtcXG4gICAgbWFyZ2luLXJpZ2h0OiAxcmVtOyB9XFxuXFxuLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1zZWxlY3QtLW1vYmlsZSB7XFxuICB3aWR0aDogMjRyZW07IH1cXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogMjEuODc1ZW0pIHtcXG4gICAgLmFwaS1yZXN1bHRzLWRpc3BsYXlfX25hdi1zZWxlY3QtLW1vYmlsZSB7XFxuICAgICAgd2lkdGg6IDE2cmVtOyB9IH1cXG5cXG4uYXBpLXJlc3VsdHMtbW9iaWxlLWRpc3BsYXktYnRuIHtcXG4gIGFsaWduLXNlbGY6IGNlbnRlcjsgfVxcblxcbi53cmFwcGVyIHtcXG4gIG92ZXJmbG93LXg6IHNjcm9sbDtcXG4gIG92ZXJmbG93LXk6IGhpZGRlbjtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBtYXJnaW46IDAgYXV0bztcXG4gIHdpZHRoOiA2OCU7IH1cXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNzVyZW0pIHtcXG4gICAgLndyYXBwZXIge1xcbiAgICAgIHdpZHRoOiA5MDU7IH0gfVxcblxcbi5jYXJkLWNoZWNrbGlzdCB7XFxuICB3aWR0aDogMTAwJTtcXG4gIGp1c3RpZnktc2VsZjogY2VudGVyOyB9XFxuICAuY2FyZC1jaGVja2xpc3RfX3JvdyB7XFxuICAgIGRpc3BsYXk6IGdyaWQ7XFxuICAgIGhlaWdodDogM3JlbTsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX3Jvdy0tNyB7XFxuICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiAxMCUgMjIuNSUgMTAlIDE3LjUlIDE1JSAxNSUgMTAlOyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fcm93LS05IHtcXG4gICAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCg5LCAxZnIpOyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fcm93LS1oZWFkZXIge1xcbiAgICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjMDAwO1xcbiAgICAgIGNvbG9yOiAjNTMxYThiO1xcbiAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICAgICAgZm9udC1zaXplOiAxLjJyZW0gIWltcG9ydGFudDtcXG4gICAgICBmb250LXdlaWdodDogMjAwICFpbXBvcnRhbnQ7IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19yb3ctLWdyZXkge1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmMmYyZjI7IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19yb3c6bnRoLWNoaWxkKGV2ZW4pIHtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjJmMmYyOyB9XFxuICAgIC5jYXJkLWNoZWNrbGlzdF9fcm93LS1oZWFkZXIge1xcbiAgICAgIGhlaWdodDogMy41cmVtOyB9XFxuICAuY2FyZC1jaGVja2xpc3RfX2RhdGEge1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC13cmFwOiBub3dyYXA7XFxuICAgIGp1c3RpZnktY29udGVudDogZmxleC1zdGFydDtcXG4gICAgZm9udC1zaXplOiAxLjRyZW07IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19kYXRhLS1zZXQge1xcbiAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICAgICAgcGFkZGluZy1sZWZ0OiAwLjVyZW07IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19kYXRhLS1uYW1lIHtcXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtc3RhcnQ7IH1cXG4gICAgLmNhcmQtY2hlY2tsaXN0X19kYXRhLS1yYXJpdHkge1xcbiAgICAgIHRleHQtdHJhbnNmb3JtOiBjYXBpdGFsaXplOyB9XFxuICAuY2FyZC1jaGVja2xpc3RfX2RhdGEtbGluayB7XFxuICAgIHBhZGRpbmc6IDFyZW0gMDtcXG4gICAgZGlzcGxheTogYmxvY2s7XFxuICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGNvbG9yOiAjMDAwO1xcbiAgICB3aGl0ZS1zcGFjZTogbm93cmFwO1xcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xcbiAgICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpczsgfVxcbiAgICAuY2FyZC1jaGVja2xpc3RfX2RhdGEtbGluay0tcHJpY2Uge1xcbiAgICAgIGNvbG9yOiAjMDA2ODg1OyB9XFxuXFxuLnRvb2x0aXAge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgei1pbmRleDogNTtcXG4gIHdpZHRoOiAyNHJlbTtcXG4gIGhlaWdodDogMzRyZW07IH1cXG4gIC50b29sdGlwX19pbWcge1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgaGVpZ2h0OiAxMDAlOyB9XFxuXFxuLm5lZ2F0aXZlLWVhcm5pbmdzIHtcXG4gIGNvbG9yOiByZWQ7IH1cXG5cXG4ucG9zaXRpdmUtZWFybmluZ3Mge1xcbiAgY29sb3I6IGdyZWVuOyB9XFxuXFxuLmltYWdlLWdyaWQge1xcbiAgcGFkZGluZzogN3JlbSAxNiU7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgZmxleC13cmFwOiB3cmFwOyB9XFxuICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDc1cmVtKSB7XFxuICAgIC5pbWFnZS1ncmlkIHtcXG4gICAgICBwYWRkaW5nOiA0cmVtIDIuNSU7IH0gfVxcbiAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA2Mi41ZW0pIHtcXG4gICAgLmltYWdlLWdyaWQge1xcbiAgICAgIGdyaWQtY29sdW1uLWdhcDogMXJlbTsgfSB9XFxuICAuaW1hZ2UtZ3JpZF9fb3V0ZXItZGl2IHtcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgICBoZWlnaHQ6IDEwMCU7IH1cXG4gIC5pbWFnZS1ncmlkX19pbm5lci1kaXYge1xcbiAgICBwZXJzcGVjdGl2ZTogMTUwcmVtO1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgaGVpZ2h0OiAxMDAlOyB9XFxuICAuaW1hZ2UtZ3JpZF9fZG91YmxlIHtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGhlaWdodDogMTAwJTtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICB0b3A6IDA7XFxuICAgIGxlZnQ6IDA7XFxuICAgIGJhY2tmYWNlLXZpc2liaWxpdHk6IGhpZGRlbjtcXG4gICAgb3ZlcmZsb3c6IGhpZGRlbjtcXG4gICAgdHJhbnNpdGlvbjogYWxsIDAuOHMgZWFzZTsgfVxcbiAgICAuaW1hZ2UtZ3JpZF9fZG91YmxlLS1iYWNrIHtcXG4gICAgICB0cmFuc2Zvcm06IHJvdGF0ZVkoMTgwZGVnKTsgfVxcbiAgLmltYWdlLWdyaWRfX2RvdWJsZS1idG4ge1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIHRvcDogMjYlO1xcbiAgICBsZWZ0OiA3NSU7XFxuICAgIHdpZHRoOiA0LjRyZW07XFxuICAgIGhlaWdodDogNC40cmVtO1xcbiAgICBib3JkZXItcmFkaXVzOiA1MCU7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC42KTtcXG4gICAgYm9yZGVyOiAycHggc29saWQgIzM0MjQ0MjtcXG4gICAgdHJhbnNpdGlvbjogYWxsIDAuMnM7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAgIC5pbWFnZS1ncmlkX19kb3VibGUtYnRuOmhvdmVyIHtcXG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjsgfVxcbiAgLmltYWdlLWdyaWRfX2RvdWJsZS1idG4tc3ZnIHtcXG4gICAgaGVpZ2h0OiAyLjVyZW07XFxuICAgIHdpZHRoOiAyLjVyZW07XFxuICAgIHBvaW50ZXItZXZlbnRzOiBub25lOyB9XFxuICAuaW1hZ2UtZ3JpZF9fZG9idWxlLWJ0bi1zdmctY29sb3Ige1xcbiAgICBjb2xvcjogIzE2MTYxZDsgfVxcbiAgLmltYWdlLWdyaWRfX2NvbnRhaW5lciB7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBoZWlnaHQ6IDEwMCU7IH1cXG4gIC5pbWFnZS1ncmlkX19pbWFnZSB7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBoZWlnaHQ6IDEwMCU7XFxuICAgIGJveC1zaGFkb3c6IDFweCAxcHggNnB4IHJnYmEoMCwgMCwgMCwgMC40NSk7XFxuICAgIGJvcmRlci1yYWRpdXM6IDQuNzUlIC8gMy41JTsgfVxcbiAgLmltYWdlLWdyaWRfX2xpbmsge1xcbiAgICBtYXJnaW4tYm90dG9tOiAwLjlyZW07XFxuICAgIHdpZHRoOiAyNC4yNSU7XFxuICAgIGhlaWdodDogYXV0bztcXG4gICAgbWFyZ2luLWJvdHRvbTogMC45cmVtO1xcbiAgICBwYWdlLWJyZWFrLWFmdGVyOiBhdXRvO1xcbiAgICBwYWdlLWJyZWFrLWJlZm9yZTogYXV0bztcXG4gICAgcGFnZS1icmVhay1pbnNpZGU6IGF2b2lkO1xcbiAgICBkaXNwbGF5OiBibG9jazsgfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDU5LjM3NWVtKSB7XFxuICAgICAgLmltYWdlLWdyaWRfX2xpbmsge1xcbiAgICAgICAgd2lkdGg6IDMxLjc1JTsgfSB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNDAuNjI1ZW0pIHtcXG4gICAgICAuaW1hZ2UtZ3JpZF9fbGluayB7XFxuICAgICAgICB3aWR0aDogNDcuMjUlOyB9IH1cXG5cXG4uY2FyZCB7XFxuICB3aWR0aDogMTAwJTtcXG4gIHBhZGRpbmc6IDAgMTYlO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIG1hcmdpbi10b3A6IDNyZW07XFxuICBwYWRkaW5nLWJvdHRvbTogMC43cmVtO1xcbiAgYm9yZGVyLWJvdHRvbTogMXB4IGRhc2hlZCByZ2JhKDAsIDAsIDAsIDAuNyk7IH1cXG4gIC5jYXJkX19pbWctY29udGFpbmVyIHtcXG4gICAgei1pbmRleDogMjtcXG4gICAgYm9yZGVyLXJhZGl1czogMTAwJTsgfVxcbiAgLmNhcmRfX2ltZyB7XFxuICAgIHdpZHRoOiAzM3JlbTtcXG4gICAgaGVpZ2h0OiA0NnJlbTtcXG4gICAgYm94LXNoYWRvdzogMXB4IDFweCA4cHggcmdiYSgwLCAwLCAwLCAwLjUpO1xcbiAgICBib3JkZXItcmFkaXVzOiA0Ljc1JSAvIDMuNSU7IH1cXG4gIC5jYXJkX19pbWctbGVmdCB7XFxuICAgIHdpZHRoOiAzM3JlbTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gICAgei1pbmRleDogMjsgfVxcbiAgLmNhcmRfX2ltZy1idG4ge1xcbiAgICBhbGlnbi1zZWxmOiBjZW50ZXI7XFxuICAgIG1hcmdpbi10b3A6IDFyZW07XFxuICAgIGhlaWdodDogMi44cmVtO1xcbiAgICBmb250LXNpemU6IDEuNHJlbTtcXG4gICAgbGluZS1oZWlnaHQ6IDEuODtcXG4gICAgY29sb3I6ICM1NTFhOGI7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmOWY3ZjU7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoODUsIDI2LCAxMzksIDAuNSk7XFxuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgYm94LXNoYWRvdzogMCAxcHggMCByZ2JhKDAsIDAsIDAsIDAuMDYpO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgMC4ycztcXG4gICAgcGFkZGluZzogMC4ycmVtIDAuNXJlbTtcXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyOyB9XFxuICAgIC5jYXJkX19pbWctYnRuOmhvdmVyIHtcXG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gICAgICBib3JkZXItY29sb3I6ICM2MzQ0OTY7IH1cXG4gIC5jYXJkX19pbWctc3ZnIHtcXG4gICAgaGVpZ2h0OiAxLjRyZW07XFxuICAgIHdpZHRoOiAxLjRyZW07XFxuICAgIG1hcmdpbi1yaWdodDogMC4zcmVtO1xcbiAgICBwb2ludGVyLWV2ZW50czogbm9uZTsgfVxcbiAgLmNhcmRfX2ltZy1zdmctY29sb3Ige1xcbiAgICBmaWxsOiAjNTUxYThiOyB9XFxuICAuY2FyZF9faW1nLWRvdWJsZS1hcmVhIHtcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuICAuY2FyZF9faW1nLWRvdWJsZS1zaWRlZCB7XFxuICAgIHBlcnNwZWN0aXZlOiAxNTByZW07XFxuICAgIGhlaWdodDogNDZyZW07IH1cXG4gIC5jYXJkX19pbWctZG91YmxlIHtcXG4gICAgd2lkdGg6IDMzcmVtO1xcbiAgICBoZWlnaHQ6IDQ2cmVtO1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIHRvcDogMDtcXG4gICAgbGVmdDogMDtcXG4gICAgYmFja2ZhY2UtdmlzaWJpbGl0eTogaGlkZGVuO1xcbiAgICBvdmVyZmxvdzogaGlkZGVuOyB9XFxuICAgIC5jYXJkX19pbWctZG91YmxlLS1iYWNrIHtcXG4gICAgICB0cmFuc2Zvcm06IHJvdGF0ZVkoMTgwZGVnKTsgfVxcbiAgLmNhcmRfX3RleHQge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgICBib3JkZXItcmFkaXVzOiA0cHg7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMCwgMCwgMCwgMC4yNSk7XFxuICAgIGJvcmRlci10b3A6IDNweCBzb2xpZCAjMDAwO1xcbiAgICBib3JkZXItYm90dG9tOiAzcHggc29saWQgIzAwMDtcXG4gICAgbWFyZ2luLXRvcDogMnJlbTtcXG4gICAgd2lkdGg6IDM0cmVtO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgICBwYWRkaW5nOiAzcmVtO1xcbiAgICBtYXJnaW4tcmlnaHQ6IDNyZW07XFxuICAgIG1hcmdpbi1sZWZ0OiAtMnJlbTsgfVxcbiAgICAuY2FyZF9fdGV4dC1mbGV4IHtcXG4gICAgICBtYXJnaW4tYm90dG9tOiAxcmVtO1xcbiAgICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjYmZiZmJmOyB9XFxuICAgIC5jYXJkX190ZXh0LXRpdGxlIHtcXG4gICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cXG4gICAgICAuY2FyZF9fdGV4dC10aXRsZS1oMyB7XFxuICAgICAgICBmb250LXNpemU6IDEuOHJlbTtcXG4gICAgICAgIGZvbnQtd2VpZ2h0OiA0MDA7XFxuICAgICAgICBtYXJnaW4tcmlnaHQ6IDFyZW07IH1cXG4gICAgLmNhcmRfX3RleHQtY29sb3ItaW5kaWNhdG9yIHtcXG4gICAgICB3aWR0aDogMS4zcmVtO1xcbiAgICAgIGhlaWdodDogMS4zcmVtO1xcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkICMzMzM7XFxuICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgICAgIGJveC1zaGFkb3c6IDBweCAwcHggMHB4IDJweCByZ2JhKDAsIDAsIDAsIDAuMik7XFxuICAgICAgbWFyZ2luLXJpZ2h0OiAwLjdyZW07XFxuICAgICAgZGlzcGxheTogaW5saW5lLWJsb2NrOyB9XFxuICAgICAgLmNhcmRfX3RleHQtY29sb3ItaW5kaWNhdG9yLS1VIHtcXG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMTI4LCAxMjgsIDI1NSwgMC43KTsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWNvbG9yLWluZGljYXRvci0tQiB7XFxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuNyk7IH1cXG4gICAgICAuY2FyZF9fdGV4dC1jb2xvci1pbmRpY2F0b3ItLVIge1xcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsIDc3LCA3NywgMC43KTsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWNvbG9yLWluZGljYXRvci0tVyB7XFxuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNyk7IH1cXG4gICAgICAuY2FyZF9fdGV4dC1jb2xvci1pbmRpY2F0b3ItLUcge1xcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAyNTUsIDAsIDAuNyk7IH1cXG4gICAgLmNhcmRfX3RleHQtb3JhY2xlLXAge1xcbiAgICAgIG1hcmdpbi1ib3R0b206IDFyZW07XFxuICAgICAgZm9udC1zaXplOiAxLjNyZW07IH1cXG4gICAgLmNhcmRfX3RleHQtb3JhY2xlLWZsYXZvciB7XFxuICAgICAgZm9udC1zaXplOiAxLjNyZW07XFxuICAgICAgZm9udC1zdHlsZTogaXRhbGljOyB9XFxuICAgIC5jYXJkX190ZXh0LWlsbHVzdHJhdG9yIHtcXG4gICAgICBmb250LXNpemU6IDEuMnJlbTtcXG4gICAgICBmb250LXN0eWxlOiBpdGFsaWM7IH1cXG4gICAgLmNhcmRfX3RleHQtbGVnYWwge1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgZmxleC1kaXJlY3Rpb246IHJvdztcXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47IH1cXG4gICAgICAuY2FyZF9fdGV4dC1sZWdhbC1oYWxmIHtcXG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9XFxuICAgICAgLmNhcmRfX3RleHQtbGVnYWwtc3Bhbi1jb250YWluZXIge1xcbiAgICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgICAgICBmb250LXNpemU6IDEuNHJlbTsgfVxcbiAgICAgICAgLmNhcmRfX3RleHQtbGVnYWwtc3Bhbi1jb250YWluZXI6bm90KDpsYXN0LWNoaWxkKSB7XFxuICAgICAgICAgIG1hcmdpbi1ib3R0b206IDAuNXJlbTsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWxlZ2FsLXNwYW4tYm94IHtcXG4gICAgICAgIHdpZHRoOiA2cmVtO1xcbiAgICAgICAgaGVpZ2h0OiAyLjVyZW07XFxuICAgICAgICBtYXJnaW4tcmlnaHQ6IDAuM3JlbTtcXG4gICAgICAgIGZvbnQtc2l6ZTogMXJlbTtcXG4gICAgICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICAgICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICAgICAgYm9yZGVyLXJhZGl1czogM3B4OyB9XFxuICAgICAgICAuY2FyZF9fdGV4dC1sZWdhbC1zcGFuLWJveC0tbm90X2xlZ2FsIHtcXG4gICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2U2MDAwMDsgfVxcbiAgICAgICAgLmNhcmRfX3RleHQtbGVnYWwtc3Bhbi1ib3gtLWxlZ2FsIHtcXG4gICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzAwOTkwMDsgfVxcbiAgICAgIC5jYXJkX190ZXh0LWxlZ2FsLXNwYW4tYm94IHtcXG4gICAgICAgIGNvbG9yOiAjZmZmOyB9XFxuICAuY2FyZF9fc2V0IHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgfVxcbiAgICAuY2FyZF9fc2V0LWJhbm5lciB7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBib3JkZXI6IDFweCBzb2xpZCAjYmZiZmJmO1xcbiAgICAgIHdpZHRoOiA0MHJlbTtcXG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjNDk0NjVjO1xcbiAgICAgIGNvbG9yOiAjZmRmZGZkO1xcbiAgICAgIHBhZGRpbmc6IDAuN3JlbTtcXG4gICAgICBib3JkZXItcmFkaXVzOiAzcHg7IH1cXG4gICAgICAuY2FyZF9fc2V0LWJhbm5lci1zdmctY29udGFpbmVyIHtcXG4gICAgICAgIG1hcmdpbi1yaWdodDogMXJlbTsgfVxcbiAgICAgIC5jYXJkX19zZXQtYmFubmVyLXN2ZyB7XFxuICAgICAgICB3aWR0aDogMi40cmVtO1xcbiAgICAgICAgaGVpZ2h0OiAyLjRyZW07XFxuICAgICAgICBmaWx0ZXI6IGludmVydCgxMDAlKTsgfVxcbiAgICAuY2FyZF9fc2V0LWRldGFpbHMge1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgfVxcbiAgICAuY2FyZF9fc2V0LWhlYWRlci1uYW1lIHtcXG4gICAgICBmb250LXNpemU6IDEuN3JlbXJlbTsgfVxcbiAgICAuY2FyZF9fc2V0LWhlYWRlci1jb2RlIHtcXG4gICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOyB9XFxuICAgIC5jYXJkX19zZXQtcHJpbnRzLWhlYWRlciB7XFxuICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzQ5NDY1YztcXG4gICAgICBjb2xvcjogI2ZkZmRmZDtcXG4gICAgICBmb250LXNpemU6IDEuM3JlbTtcXG4gICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xcbiAgICAgIGJvcmRlcjogMXB4IHNvbGlkICNiZmJmYmY7XFxuICAgICAgYm9yZGVyLXJhZGl1czogM3B4O1xcbiAgICAgIHBhZGRpbmc6IDAuM3JlbSAwLjdyZW07IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtc3ZnLWNvbnRhaW5lciB7XFxuICAgICAgaGVpZ2h0OiAxLjhyZW07XFxuICAgICAgd2lkdGg6IDEuOHJlbTtcXG4gICAgICBib3JkZXI6IDFweCBzb2xpZCAjYmZiZmJmO1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgICBib3JkZXItcmFkaXVzOiAxMDAlOyB9XFxuICAgIC5jYXJkX19zZXQtcHJpbnRzLXN2Zy0tY29tbW9uIHtcXG4gICAgICBmaWxsOiAjMDAwOyB9XFxuICAgIC5jYXJkX19zZXQtcHJpbnRzLXN2Zy0tdW5jb21tb24ge1xcbiAgICAgIGZpbGw6ICNlNmU2ZTY7IH1cXG4gICAgLmNhcmRfX3NldC1wcmludHMtc3ZnLS1yYXJlIHtcXG4gICAgICBmaWxsOiAjZTZjMzAwOyB9XFxuICAgIC5jYXJkX19zZXQtcHJpbnRzLXN2Zy0tbXl0aGljIHtcXG4gICAgICBmaWxsOiAjZmYwMDAwOyB9XFxuICAgIC5jYXJkX19zZXQtcHJpbnRzLWxpc3Qge1xcbiAgICAgIGxpc3Qtc3R5bGU6IG5vbmU7XFxuICAgICAgYm9yZGVyLXJhZGl1czogM3B4OyB9XFxuICAgICAgLmNhcmRfX3NldC1wcmludHMtbGlzdC1saW5rOmxpbmssIC5jYXJkX19zZXQtcHJpbnRzLWxpc3QtbGluazp2aXNpdGVkIHtcXG4gICAgICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gICAgICAgIGNvbG9yOiAjMDAwOyB9XFxuICAgICAgLmNhcmRfX3NldC1wcmludHMtbGlzdC1pdGVtIHtcXG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxuICAgICAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgICAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2U3ZTllYztcXG4gICAgICAgIGJvcmRlci1sZWZ0OiAxcHggc29saWQgI2NkY2RjZDtcXG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxuICAgICAgICBwYWRkaW5nOiAwLjI1cmVtIDA7IH1cXG4gICAgICAgIC5jYXJkX19zZXQtcHJpbnRzLWxpc3QtaXRlbS0tcGwtMTQge1xcbiAgICAgICAgICBwYWRkaW5nLWxlZnQ6IDEuNHJlbTtcXG4gICAgICAgICAgYm9yZGVyLWJvdHRvbTogM3B4IHNvbGlkICMwMDA7IH1cXG4gICAgICAgIC5jYXJkX19zZXQtcHJpbnRzLWxpc3QtaXRlbTpob3ZlciB7XFxuICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmMmYyZjI7IH1cXG4gICAgICAuY2FyZF9fc2V0LXByaW50cy1saXN0LWl0ZW0tbmFtZS13cmFwcGVyIHtcXG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICAgICAgbWFyZ2luLWxlZnQ6IC0xcmVtOyB9XFxuICAgICAgLmNhcmRfX3NldC1wcmludHMtbGlzdC1pdGVtLXNldC1uYW1lIHtcXG4gICAgICAgIG1hcmdpbi1sZWZ0OiAwLjVyZW07IH1cXG4gICAgICAuY2FyZF9fc2V0LXByaW50cy1saXN0LWl0ZW0tcHJpY2Uge1xcbiAgICAgICAgbWFyZ2luLXJpZ2h0OiAwLjdyZW07XFxuICAgICAgICBjb2xvcjogIzAwNjg4NTsgfVxcblxcbi5jYXJkLXBhZ2Uge1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICBncmlkLWNvbHVtbjogMSAvIC0xO1xcbiAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuXFxuLmFkZC10by1pbnYsXFxuLnJlbW92ZS1mcm9tLWludiB7XFxuICBtYXJnaW4tdG9wOiAzcmVtO1xcbiAgd2lkdGg6IDUwJTtcXG4gIG1hcmdpbi1sZWZ0OiA1MCU7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTUwJSk7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgfVxcbiAgLmFkZC10by1pbnZfX2hlYWRlcixcXG4gIC5yZW1vdmUtZnJvbS1pbnZfX2hlYWRlciB7XFxuICAgIGNvbG9yOiAjMTYxNjFkO1xcbiAgICBmb250LXNpemU6IDIuMnJlbTtcXG4gICAgZm9udC13ZWlnaHQ6IDMwMDtcXG4gICAgbWFyZ2luOiAwIGF1dG8gMXJlbSBhdXRvOyB9XFxuICAuYWRkLXRvLWludl9fZm9ybSxcXG4gIC5yZW1vdmUtZnJvbS1pbnZfX2Zvcm0ge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9XFxuICAgIC5hZGQtdG8taW52X19mb3JtLXByaWNlLFxcbiAgICAucmVtb3ZlLWZyb20taW52X19mb3JtLXByaWNlIHtcXG4gICAgICB3aWR0aDogMjByZW07XFxuICAgICAgaGVpZ2h0OiAzLjVyZW07XFxuICAgICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcXG4gICAgICBwYWRkaW5nOiAxcmVtO1xcbiAgICAgIGJvcmRlcjogc29saWQgMXB4ICNiZmJmYmY7XFxuICAgICAgYm9yZGVyLXJhZGl1czogNXB4OyB9XFxuICAgICAgLmFkZC10by1pbnZfX2Zvcm0tcHJpY2U6Zm9jdXMsXFxuICAgICAgLnJlbW92ZS1mcm9tLWludl9fZm9ybS1wcmljZTpmb2N1cyB7XFxuICAgICAgICBib3JkZXI6IHNvbGlkIDFweCAjMDAwOyB9XFxuICAgIC5hZGQtdG8taW52X19mb3JtLWdyb3VwLFxcbiAgICAucmVtb3ZlLWZyb20taW52X19mb3JtLWdyb3VwIHtcXG4gICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtZXZlbmx5O1xcbiAgICAgIGFsaWduLWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgICBtYXJnaW4tYm90dG9tOiAxLjVyZW07XFxuICAgICAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuICAgIC5hZGQtdG8taW52X19mb3JtLWxhYmVsLFxcbiAgICAucmVtb3ZlLWZyb20taW52X19mb3JtLWxhYmVsIHtcXG4gICAgICBtYXJnaW4tcmlnaHQ6IDAuM3JlbTtcXG4gICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgIGFsaWduLWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgICBjb2xvcjogIzE2MTYxZDtcXG4gICAgICBtYXJnaW4tdG9wOiAwLjQ1cmVtOyB9XFxuICAuYWRkLXRvLWludi1wcmljZS1tc2csXFxuICAucmVtb3ZlLWZyb20taW52LXByaWNlLW1zZyB7XFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgYm90dG9tOiAtMS44cmVtO1xcbiAgICByaWdodDogMjUlO1xcbiAgICBjb2xvcjogcmVkOyB9XFxuICAuYWRkLXRvLWludl9fc3VibWl0LFxcbiAgLnJlbW92ZS1mcm9tLWludl9fc3VibWl0IHtcXG4gICAgYWxpZ24tc2VsZjogY2VudGVyO1xcbiAgICBoZWlnaHQ6IDMuMXJlbTtcXG4gICAgZm9udC1zaXplOiAxLjRyZW07XFxuICAgIGxpbmUtaGVpZ2h0OiAxLjg7XFxuICAgIGNvbG9yOiAjNTUxYThiO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjlmN2Y1O1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDg1LCAyNiwgMTM5LCAwLjUpO1xcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XFxuICAgIGJveC1zaGFkb3c6IDAgMXB4IDAgcmdiYSgwLCAwLCAwLCAwLjA2KTtcXG4gICAgdHJhbnNpdGlvbjogYWxsIDAuMnM7XFxuICAgIHBhZGRpbmc6IDAuMnJlbSAwLjc1cmVtO1xcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIG1hcmdpbi1ib3R0b206IDFyZW07IH1cXG4gICAgLmFkZC10by1pbnZfX3N1Ym1pdDpob3ZlcixcXG4gICAgLnJlbW92ZS1mcm9tLWludl9fc3VibWl0OmhvdmVyIHtcXG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gICAgICBib3JkZXItY29sb3I6ICM2MzQ0OTY7IH1cXG5cXG4udXRpbC1zcGFjZTo6YmVmb3JlLFxcbi51dGlsLXNwYWNlOjphZnRlciB7XFxuICBjb250ZW50OiAnJztcXG4gIG1hcmdpbjogMCAwLjJyZW07IH1cXG5cXG4ubm8tcmVzdWx0cyB7XFxuICBqdXN0aWZ5LXNlbGY6IGNlbnRlcjsgfVxcblxcbi5ob21lcGFnZSB7XFxuICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQodG8gYm90dG9tLCAjMWQxYzI1LCAjNDMxZTNmKTtcXG4gIGJhY2tncm91bmQtcmVwZWF0OiBuby1yZXBlYXQ7XFxuICBoZWlnaHQ6IDEwMHZoO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIG92ZXJmbG93LXg6IGhpZGRlbiAhaW1wb3J0YW50O1xcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICBiYWNrZ3JvdW5kLXNpemU6IGNvdmVyOyB9XFxuICAuaG9tZXBhZ2VfX2NlbnRlciB7XFxuICAgIGFsaWduLXNlbGY6IGNlbnRlcjtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDI4LjEyNWVtKSB7XFxuICAgICAgLmhvbWVwYWdlX19jZW50ZXIge1xcbiAgICAgICAgbWFyZ2luLXRvcDogLTEycmVtOyB9IH1cXG4gIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNDAuNjI1ZW0pIHtcXG4gICAgLmhvbWVwYWdlX19jZW50ZXItaGVhZGluZy13cmFwcGVyIHtcXG4gICAgICBtYXJnaW46IDAgYXV0byAwLjVyZW0gYXV0bztcXG4gICAgICB3aWR0aDogNzUlO1xcbiAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgICAgdGV4dC1hbGlnbjogY2VudGVyOyB9IH1cXG4gIC5ob21lcGFnZV9fc2VhcmNoIHtcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuICAuaG9tZXBhZ2VfX3NlYXJjaC1pbnB1dCB7XFxuICAgIHBhZGRpbmc6IDEuMnJlbSAxLjRyZW0gMS4ycmVtIDYuMnJlbTtcXG4gICAgZm9udC1zaXplOiAzcmVtO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMjQyMDMxO1xcbiAgICBjb2xvcjogI2Q3ZDdkNztcXG4gICAgYm9yZGVyLXJhZGl1czogNHB4O1xcbiAgICBib3gtc2hhZG93OiAwcHggMHB4IDBweCAycHggcmdiYSgwLCAwLCAwLCAwLjUpO1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjUpOyB9XFxuICAgIC5ob21lcGFnZV9fc2VhcmNoLWlucHV0OjpwbGFjZWhvbGRlciB7XFxuICAgICAgdGV4dC1hbGlnbjogY2VudGVyOyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNDAuNjI1ZW0pIHtcXG4gICAgICAuaG9tZXBhZ2VfX3NlYXJjaC1pbnB1dCB7XFxuICAgICAgICB3aWR0aDogODAlO1xcbiAgICAgICAgbWFyZ2luLWxlZnQ6IDEwJTsgfSB9XFxuICAuaG9tZXBhZ2VfX3NlYXJjaC1idG4ge1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIGxlZnQ6IDZyZW07XFxuICAgIHRvcDogMnJlbTsgfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDQwLjYyNWVtKSB7XFxuICAgICAgLmhvbWVwYWdlX19zZWFyY2gtYnRuIHtcXG4gICAgICAgIGxlZnQ6IDEycmVtOyB9IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiAyOC4xMjVlbSkge1xcbiAgICAgIC5ob21lcGFnZV9fc2VhcmNoLWJ0biB7XFxuICAgICAgICBsZWZ0OiAxMHJlbTsgfSB9XFxuICAuaG9tZXBhZ2VfX2ljb24tc2l6aW5nLS1zZWFyY2gge1xcbiAgICB3aWR0aDogM3JlbTtcXG4gICAgaGVpZ2h0OiAzcmVtO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTE1MCUpOyB9XFxuICAuaG9tZXBhZ2VfX2ljb24tcGF0aCB7XFxuICAgIGZpbGw6ICNiZmJmYmY7IH1cXG4gIC5ob21lcGFnZV9fbGlua3Mge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsgfVxcbiAgICBAbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDQwLjYyNWVtKSB7XFxuICAgICAgLmhvbWVwYWdlX19saW5rcyB7XFxuICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9IH1cXG4gICAgQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiAyOC4xMjVlbSkge1xcbiAgICAgIC5ob21lcGFnZV9fbGlua3Mge1xcbiAgICAgICAgbWFyZ2luLWxlZnQ6IDcuNSU7IH0gfVxcbiAgLmhvbWVwYWdlX19saW5rIHtcXG4gICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDg1LCAyNiwgMTM5LCAwLjUpO1xcbiAgICBib3JkZXItY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC42KTtcXG4gICAgYm9yZGVyLXJhZGl1czogM3B4O1xcbiAgICBjb2xvcjogI2ZmZjtcXG4gICAgbWFyZ2luLXRvcDogMC42cmVtO1xcbiAgICBtYXJnaW4tcmlnaHQ6IDNyZW07XFxuICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgbGluZS1oZWlnaHQ6IDEuNDtcXG4gICAgcGFkZGluZzogMC4ycmVtIDFyZW0gMCAxcmVtO1xcbiAgICBoZWlnaHQ6IDIuOHJlbTtcXG4gICAgdHJhbnNpdGlvbjogYWxsIDAuMnM7XFxuICAgIGJveC1zaGFkb3c6IDAgMXB4IDFweCAwIHJnYmEoMCwgMCwgMCwgMC4wNik7XFxuICAgIG1pbi13aWR0aDogOXJlbTtcXG4gICAgdGV4dC1hbGlnbjogY2VudGVyOyB9XFxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNDAuNjI1ZW0pIHtcXG4gICAgICAuaG9tZXBhZ2VfX2xpbmsge1xcbiAgICAgICAgYWxpZ24tc2VsZjogY2VudGVyO1xcbiAgICAgICAgd2lkdGg6IDE0LjVyZW07IH0gfVxcbiAgICAuaG9tZXBhZ2VfX2xpbms6aG92ZXIge1xcbiAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wOSk7IH1cXG5cXG4uaW52ZW50b3J5LWRldGFpbHMge1xcbiAgZ3JpZC1jb2x1bW46IDEgLyAtMTtcXG4gIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCByZ2JhKDk5LCA2OCwgMTUwLCAwLjEpO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2Y2ZjRmYTtcXG4gIGNvbG9yOiAjNTM1MzUzO1xcbiAgcGFkZGluZzogMXJlbSAxNiU7XFxuICBtYXJnaW4tYm90dG9tOiAycmVtO1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjsgfVxcbiAgLmludmVudG9yeS1kZXRhaWxzX19saW5rIHtcXG4gICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgICBjb2xvcjogcmdiYSg4MywgODMsIDgzLCAwLjc1KTtcXG4gICAgdHJhbnNpdGlvbjogYWxsIDAuMnM7XFxuICAgIHBhZGRpbmc6IDAgMC42cmVtO1xcbiAgICBib3JkZXItbGVmdDogMXB4IHNvbGlkICM1MzUzNTM7XFxuICAgIGJvcmRlci1yaWdodDogMXB4IHNvbGlkICM1MzUzNTM7IH1cXG4gICAgLmludmVudG9yeS1kZXRhaWxzX19saW5rOmhvdmVyIHtcXG4gICAgICBjb2xvcjogIzUzNTM1MzsgfVxcbiAgLmludmVudG9yeS1kZXRhaWxzIHNwYW4ge1xcbiAgICBjb2xvcjogIzAwNjg4NTsgfVxcblxcbi5ob21lcGFnZV9fY29sYWdlLFxcbi5jYXJkcGFnZV9fY29sYWdlIHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIG92ZXJmbG93OiBoaWRkZW47XFxuICBsZWZ0OiAwO1xcbiAgaGVpZ2h0OiAxNXJlbTtcXG4gIHdpZHRoOiAxMDAlOyB9XFxuXFxuLmhvbWVwYWdlX19jb2xhZ2Uge1xcbiAgYm90dG9tOiAwOyB9XFxuXFxuLmNhcmRwYWdlX19jb2xhZ2Uge1xcbiAgYm90dG9tOiAtMi42cmVtOyB9XFxuXFxuLmhvbWVwYWdlX19jb2xhZ2UtaW5uZXIsXFxuLmNhcmRwYWdlX19jb2xhZ2UtaW5uZXIge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgaGVpZ2h0OiAxMDAlO1xcbiAgbWFyZ2luLWxlZnQ6IDUwJTtcXG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtNTAlKTtcXG4gIHdpZHRoOiA2NS41cmVtOyB9XFxuXFxuLmhvbWVwYWdlX19jb2xhZ2UtY2FyZCxcXG4uY2FyZHBhZ2VfX2NvbGFnZS1jYXJkIHtcXG4gIHdpZHRoOiAxNi44cmVtO1xcbiAgaGVpZ2h0OiAyMy40cmVtO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgYm9yZGVyLXJhZGl1czogNSUgLyAzLjc1JTtcXG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTtcXG4gIHRyYW5zaXRpb246IGFsbCAwLjNzO1xcbiAgYm94LXNoYWRvdzogaW5zZXQgMCAwIDNweCAzcHggIzAwMDsgfVxcbiAgLmhvbWVwYWdlX19jb2xhZ2UtY2FyZDpudGgtY2hpbGQoMSksXFxuICAuY2FyZHBhZ2VfX2NvbGFnZS1jYXJkOm50aC1jaGlsZCgxKSB7XFxuICAgIHRvcDogMi4ycmVtOyB9XFxuICAuaG9tZXBhZ2VfX2NvbGFnZS1jYXJkOm50aC1jaGlsZCgyKSxcXG4gIC5jYXJkcGFnZV9fY29sYWdlLWNhcmQ6bnRoLWNoaWxkKDIpIHtcXG4gICAgdG9wOiA2LjJyZW07XFxuICAgIGxlZnQ6IDMuNXJlbTsgfVxcbiAgLmhvbWVwYWdlX19jb2xhZ2UtY2FyZDpudGgtY2hpbGQoMyksXFxuICAuY2FyZHBhZ2VfX2NvbGFnZS1jYXJkOm50aC1jaGlsZCgzKSB7XFxuICAgIHRvcDogMXJlbTtcXG4gICAgbGVmdDogMTcuNHJlbTsgfVxcbiAgLmhvbWVwYWdlX19jb2xhZ2UtY2FyZDpudGgtY2hpbGQoNCksXFxuICAuY2FyZHBhZ2VfX2NvbGFnZS1jYXJkOm50aC1jaGlsZCg0KSB7XFxuICAgIHRvcDogNC41cmVtO1xcbiAgICBsZWZ0OiAyMC42cmVtOyB9XFxuICAuaG9tZXBhZ2VfX2NvbGFnZS1jYXJkOm50aC1jaGlsZCg1KSxcXG4gIC5jYXJkcGFnZV9fY29sYWdlLWNhcmQ6bnRoLWNoaWxkKDUpIHtcXG4gICAgdG9wOiAxLjZyZW07XFxuICAgIGxlZnQ6IDM0LjdyZW07IH1cXG4gIC5ob21lcGFnZV9fY29sYWdlLWNhcmQ6bnRoLWNoaWxkKDYpLFxcbiAgLmNhcmRwYWdlX19jb2xhZ2UtY2FyZDpudGgtY2hpbGQoNikge1xcbiAgICB0b3A6IDYuNXJlbTtcXG4gICAgbGVmdDogMzhyZW07IH1cXG4gIC5ob21lcGFnZV9fY29sYWdlLWNhcmQ6bnRoLWNoaWxkKDcpLFxcbiAgLmNhcmRwYWdlX19jb2xhZ2UtY2FyZDpudGgtY2hpbGQoNykge1xcbiAgICB0b3A6IDMuNXJlbTtcXG4gICAgcmlnaHQ6IDA7IH1cXG4gIC5ob21lcGFnZV9fY29sYWdlLWNhcmQ6aG92ZXIsXFxuICAuY2FyZHBhZ2VfX2NvbGFnZS1jYXJkOmhvdmVyIHtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC01JSk7IH1cXG5cXG4uY29udGFpbmVyIHtcXG4gIGRpc3BsYXk6IGdyaWQ7XFxuICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IFtmdWxsLXN0YXJ0XSBtaW5tYXgoNnJlbSwgMWZyKSBbY2VudGVyLXN0YXJ0XSByZXBlYXQoOCwgW2NvbC1zdGFydF0gbWlubWF4KG1pbi1jb250ZW50LCAxNHJlbSkgW2NvbC1lbmRdKSBbY2VudGVyLWVuZF0gbWlubWF4KDZyZW0sIDFmcikgW2Z1bGwtZW5kXTtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmNWY2Zjc7XFxuICBiYWNrZ3JvdW5kLXNpemU6IGNvdmVyO1xcbiAgcG9zaXRpb246IHJlbGF0aXZlOyB9XFxuXFxuLnNlYXJjaCB7XFxuICBncmlkLWNvbHVtbjogZnVsbC1zdGFydCAvIGZ1bGwtZW5kO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjsgfVxcblxcbi5hcGktcmVzdWx0cy1kaXNwbGF5IHtcXG4gIGdyaWQtY29sdW1uOiBmdWxsLXN0YXJ0IC8gZnVsbC1lbmQ7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjVmNmY3O1xcbiAgYmFja2dyb3VuZC1zaXplOiBjb3ZlcjtcXG4gIGRpc3BsYXk6IGdyaWQ7IH1cXG5cIl0sXCJzb3VyY2VSb290XCI6XCJcIn1dKTtcbi8vIEV4cG9ydHNcbmV4cG9ydCBkZWZhdWx0IF9fX0NTU19MT0FERVJfRVhQT1JUX19fO1xuIiwiLy8gSW1wb3J0c1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18gZnJvbSBcIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9jc3NXaXRoTWFwcGluZ1RvU3RyaW5nLmpzXCI7XG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fIGZyb20gXCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzXCI7XG5pbXBvcnQgX19fQ1NTX0xPQURFUl9HRVRfVVJMX0lNUE9SVF9fXyBmcm9tIFwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2dldFVybC5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfVVJMX0lNUE9SVF8wX19fIGZyb20gXCIuLi8uLi9pbWcvbWFuYS1zeW1ib2xzL21hbmEuc3ZnXCI7XG52YXIgX19fQ1NTX0xPQURFUl9FWFBPUlRfX18gPSBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18oX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyk7XG52YXIgX19fQ1NTX0xPQURFUl9VUkxfUkVQTEFDRU1FTlRfMF9fXyA9IF9fX0NTU19MT0FERVJfR0VUX1VSTF9JTVBPUlRfX18oX19fQ1NTX0xPQURFUl9VUkxfSU1QT1JUXzBfX18pO1xuLy8gTW9kdWxlXG5fX19DU1NfTE9BREVSX0VYUE9SVF9fXy5wdXNoKFttb2R1bGUuaWQsIFwiLm1hbmEge1xcbiAgICBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXCIgKyBfX19DU1NfTE9BREVSX1VSTF9SRVBMQUNFTUVOVF8wX19fICsgXCIpO1xcbiAgICBiYWNrZ3JvdW5kLXJlcGVhdDogbm8tcmVwZWF0O1xcbiAgICBiYWNrZ3JvdW5kLXNpemU6IGF1dG8gNzAwJTtcXG4gICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgICBmb250LXNpemU6IDEwMCU7XFxufVxcblxcbi5tYW5hLnhzIHtcXG4gICAgd2lkdGg6IDEuNXJlbTtcXG4gICAgaGVpZ2h0OiAxLjVyZW07XFxufVxcblxcbi5tYW5hLnNtYWxsIHtcXG4gICAgaGVpZ2h0OiAycmVtO1xcbiAgICB3aWR0aDogMnJlbTtcXG59XFxuLm1hbmEubWVkaXVtIHtcXG4gICAgaGVpZ2h0OiAyZW07XFxuICAgIHdpZHRoOiAyZW07XFxufVxcbi5tYW5hLmxhcmdlIHtcXG4gICAgaGVpZ2h0OiA0ZW07XFxuICAgIHdpZHRoOiA0ZW07XFxufVxcbi5tYW5hLnMgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwIDA7IH1cXG4ubWFuYS5zMSB7IGJhY2tncm91bmQtcG9zaXRpb246IDExLjElIDA7IH1cXG4ubWFuYS5zMiB7IGJhY2tncm91bmQtcG9zaXRpb246IDIyLjIlIDA7IH1cXG4ubWFuYS5zMyB7IGJhY2tncm91bmQtcG9zaXRpb246IDMzLjMlIDA7IH1cXG4ubWFuYS5zNCB7IGJhY2tncm91bmQtcG9zaXRpb246IDQ0LjQlIDA7IH1cXG4ubWFuYS5zNSB7IGJhY2tncm91bmQtcG9zaXRpb246IDU1LjUlIDA7IH1cXG4ubWFuYS5zNiB7IGJhY2tncm91bmQtcG9zaXRpb246IDY2LjYlIDA7IH1cXG4ubWFuYS5zNyB7IGJhY2tncm91bmQtcG9zaXRpb246IDc3LjclIDA7IH1cXG4ubWFuYS5zOCB7IGJhY2tncm91bmQtcG9zaXRpb246IDg4LjglIDA7IH1cXG4ubWFuYS5zOSB7IGJhY2tncm91bmQtcG9zaXRpb246IDk5LjklIDA7IH1cXG5cXG4ubWFuYS5zMTAgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwIDE2JTsgfVxcbi5tYW5hLnMxMSB7IGJhY2tncm91bmQtcG9zaXRpb246IDExLjElIDE2LjYlOyB9XFxuLm1hbmEuczEyIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMjIuMiUgMTYuNiU7IH1cXG4ubWFuYS5zMTMgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAzMy4zJSAxNi42JTsgfVxcbi5tYW5hLnMxNCB7IGJhY2tncm91bmQtcG9zaXRpb246IDQ0LjQlIDE2LjYlOyB9XFxuLm1hbmEuczE1IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNTUuNSUgMTYuNiU7IH1cXG4ubWFuYS5zMTYgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA2Ni42JSAxNi42JTsgfVxcbi5tYW5hLnMxNyB7IGJhY2tncm91bmQtcG9zaXRpb246IDc3LjclIDE2LjYlOyB9XFxuLm1hbmEuczE4IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogODguOCUgMTYuNiU7IH1cXG4ubWFuYS5zMTkgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA5OS45JSAxNi42JTsgfVxcblxcbi5tYW5hLnMyMCB7IGJhY2tncm91bmQtcG9zaXRpb246IDAgMzMlOyB9XFxuLm1hbmEuc3ggeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAxMS4xJSAzMy4zJTsgfVxcbi5tYW5hLnN5IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMjIuMiUgMzMuMyU7IH1cXG4ubWFuYS5zeiB7IGJhY2tncm91bmQtcG9zaXRpb246IDMzLjMlIDMzLjMlOyB9XFxuLm1hbmEuc3cgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA0NC40JSAzMy4zJTsgfVxcbi5tYW5hLnN1IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNTUuNSUgMzMuMyU7IH1cXG4ubWFuYS5zYiB7IGJhY2tncm91bmQtcG9zaXRpb246IDY2LjYlIDMzLjMlOyB9XFxuLm1hbmEuc3IgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA3Ny43JSAzMy4zJTsgfVxcbi5tYW5hLnNnIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogODguOCUgMzMuMyU7IH1cXG4ubWFuYS5zcyB7IGJhY2tncm91bmQtcG9zaXRpb246IDk5LjklIDMzLjMlOyB9XFxuXFxuLm1hbmEuc3d1IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMCA1MCU7IH1cXG4ubWFuYS5zd2IgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAxMS4xJSA1MCU7IH1cXG4ubWFuYS5zdWIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAyMi4yJSA1MCU7IH1cXG4ubWFuYS5zdXIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAzMy4zJSA1MCU7IH1cXG4ubWFuYS5zYnIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA0NC40JSA1MCU7IH1cXG4ubWFuYS5zYmcgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA1NS41JSA1MCU7IH1cXG4ubWFuYS5zcncgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA2Ni42JSA1MCU7IH1cXG4ubWFuYS5zcmcgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA3Ny43JSA1MCU7IH1cXG4ubWFuYS5zZ3cgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4OC44JSA1MCU7IH1cXG4ubWFuYS5zZ3UgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA5OS45JSA1MCU7IH1cXG5cXG4ubWFuYS5zMncgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwIDY2LjYlOyB9XFxuLm1hbmEuczJ1IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMTEuMSUgNjYuNiU7IH1cXG4ubWFuYS5zMmIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAyMi4yJSA2Ni42JTsgfVxcbi5tYW5hLnMyciB7IGJhY2tncm91bmQtcG9zaXRpb246IDMzLjMlIDY2LjYlOyB9XFxuLm1hbmEuczJnIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNDQuNCUgNjYuNiU7IH1cXG4ubWFuYS5zd3AgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA1NS41JSA2Ni42JTsgfVxcbi5tYW5hLnN1cCB7IGJhY2tncm91bmQtcG9zaXRpb246IDY2LjYlIDY2LjYlOyB9XFxuLm1hbmEuc2JwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNzcuNyUgNjYuNiU7IH1cXG4ubWFuYS5zcnAgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4OC44JSA2Ni42JTsgfVxcbi5tYW5hLnNncCB7IGJhY2tncm91bmQtcG9zaXRpb246IDk5LjklIDY2LjYlOyB9XFxuXFxuLm1hbmEuc3QgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwJSA4My4zJTsgfVxcbi5tYW5hLnNxIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMTEuMSUgODMuMyU7IH1cXG5cXG4ubWFuYS5zYyB7IGJhY2tncm91bmQtcG9zaXRpb246IDc3LjclIDgzLjMlOyB9XFxuXFxuLm1hbmEuc2UgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4OC44JSA4My4zJTsgfVxcblxcbi5tYW5hLnMxMDAwMDAwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMCAxMDAlOyB9XFxuLm1hbmEuczEwMDAwMDAuc21hbGwgeyB3aWR0aDogNC45ZW07IH1cXG4ubWFuYS5zMTAwMDAwMC5tZWRpdW0geyB3aWR0aDogOS43ZW07IH1cXG4vKi5tYW5hLnMxMDAwMDAwLmxhcmdlIHsgd2lkdGg6IDE4LjhlbTsgfSovXFxuLm1hbmEuczEwMCB7IGJhY2tncm91bmQtcG9zaXRpb246IDYwJSAxMDAlOyB9XFxuLm1hbmEuczEwMC5zbWFsbCB7IHdpZHRoOiAxLjhlbTsgfVxcbi5tYW5hLnMxMDAubWVkaXVtIHsgd2lkdGg6IDMuN2VtOyB9XFxuLyoubWFuYS5zMTAwLmxhcmdlIHsgd2lkdGg6IDEwLjhlbTsgfSovXFxuLm1hbmEuc2NoYW9zIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNzYuNSUgMTAwJTsgfVxcbi5tYW5hLnNjaGFvcy5zbWFsbCB7IHdpZHRoOiAxLjJlbTsgfVxcbi5tYW5hLnNjaGFvcy5tZWRpdW0geyB3aWR0aDogMi4zZW07IH1cXG4vKi5tYW5hLnNjLmxhcmdlIHsgd2lkdGg6IDQuNmVtOyB9Ki9cXG4ubWFuYS5zaHcgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4My41JSAxMDAlOyB9XFxuLm1hbmEuc2h3LnNtYWxsIHsgd2lkdGg6IDAuNWVtOyB9XFxuLm1hbmEuc2h3Lm1lZGl1bSB7IHdpZHRoOiAxZW07IH1cXG4vKi5tYW5hLnNody5sYXJnZSB7IHdpZHRoOiAyZW07IH0qL1xcbi5tYW5hLnNociB7IGJhY2tncm91bmQtcG9zaXRpb246IDg5JSAxMDAlOyB9XFxuLm1hbmEuc2hyLnNtYWxsIHsgd2lkdGg6IDAuNWVtOyB9XFxuLm1hbmEuc2hyLm1lZGl1bSB7IHdpZHRoOiAxZW07IH1cXG4vKi5tYW5hLnNoci5sYXJnZSB7IHdpZHRoOiAyZW07IH0qL1xcblxcblxcbi5zaGFkb3cge1xcbiAgICBmaWx0ZXI6IFxcXCJwcm9naWQ6RFhJbWFnZVRyYW5zZm9ybS5NaWNyb3NvZnQuRHJvcHNoYWRvdyhPZmZYPS0xLCBPZmZZPTEsIENvbG9yPScjMDAwJylcXFwiO1xcbiAgICBmaWx0ZXI6IHVybCgjc2hhZG93KTtcXG4gICAgLXdlYmtpdC1maWx0ZXI6IGRyb3Atc2hhZG93KC0xcHggMXB4IDBweCAjMDAwKTtcXG4gICAgZmlsdGVyOiBkcm9wLXNoYWRvdygtMXB4IDFweCAwcHggIzAwMCk7XFxufVwiLCBcIlwiLHtcInZlcnNpb25cIjozLFwic291cmNlc1wiOltcIndlYnBhY2s6Ly8u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LG1CQUFtQixVQUFVLEVBQUU7QUFDL0Isa0NBQWtDO0FBQ2xDLFlBQVksNkJBQTZCLEVBQUU7QUFDM0Msa0JBQWtCLFlBQVksRUFBRTtBQUNoQyxtQkFBbUIsVUFBVSxFQUFFO0FBQy9CLGtDQUFrQzs7O0FBR2xDO0lBQ0kscUZBQXFGO0lBQ3JGLG9CQUFvQjtJQUNwQiw4Q0FBOEM7SUFDOUMsc0NBQXNDO0FBQzFDXCIsXCJzb3VyY2VzQ29udGVudFwiOltcIi5tYW5hIHtcXG4gICAgYmFja2dyb3VuZC1pbWFnZTogdXJsKCcuLi8uLi9pbWcvbWFuYS1zeW1ib2xzL21hbmEuc3ZnJyk7XFxuICAgIGJhY2tncm91bmQtcmVwZWF0OiBuby1yZXBlYXQ7XFxuICAgIGJhY2tncm91bmQtc2l6ZTogYXV0byA3MDAlO1xcbiAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICAgIGZvbnQtc2l6ZTogMTAwJTtcXG59XFxuXFxuLm1hbmEueHMge1xcbiAgICB3aWR0aDogMS41cmVtO1xcbiAgICBoZWlnaHQ6IDEuNXJlbTtcXG59XFxuXFxuLm1hbmEuc21hbGwge1xcbiAgICBoZWlnaHQ6IDJyZW07XFxuICAgIHdpZHRoOiAycmVtO1xcbn1cXG4ubWFuYS5tZWRpdW0ge1xcbiAgICBoZWlnaHQ6IDJlbTtcXG4gICAgd2lkdGg6IDJlbTtcXG59XFxuLm1hbmEubGFyZ2Uge1xcbiAgICBoZWlnaHQ6IDRlbTtcXG4gICAgd2lkdGg6IDRlbTtcXG59XFxuLm1hbmEucyB7IGJhY2tncm91bmQtcG9zaXRpb246IDAgMDsgfVxcbi5tYW5hLnMxIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMTEuMSUgMDsgfVxcbi5tYW5hLnMyIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMjIuMiUgMDsgfVxcbi5tYW5hLnMzIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMzMuMyUgMDsgfVxcbi5tYW5hLnM0IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNDQuNCUgMDsgfVxcbi5tYW5hLnM1IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNTUuNSUgMDsgfVxcbi5tYW5hLnM2IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNjYuNiUgMDsgfVxcbi5tYW5hLnM3IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNzcuNyUgMDsgfVxcbi5tYW5hLnM4IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogODguOCUgMDsgfVxcbi5tYW5hLnM5IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogOTkuOSUgMDsgfVxcblxcbi5tYW5hLnMxMCB7IGJhY2tncm91bmQtcG9zaXRpb246IDAgMTYlOyB9XFxuLm1hbmEuczExIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMTEuMSUgMTYuNiU7IH1cXG4ubWFuYS5zMTIgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAyMi4yJSAxNi42JTsgfVxcbi5tYW5hLnMxMyB7IGJhY2tncm91bmQtcG9zaXRpb246IDMzLjMlIDE2LjYlOyB9XFxuLm1hbmEuczE0IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNDQuNCUgMTYuNiU7IH1cXG4ubWFuYS5zMTUgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA1NS41JSAxNi42JTsgfVxcbi5tYW5hLnMxNiB7IGJhY2tncm91bmQtcG9zaXRpb246IDY2LjYlIDE2LjYlOyB9XFxuLm1hbmEuczE3IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNzcuNyUgMTYuNiU7IH1cXG4ubWFuYS5zMTggeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4OC44JSAxNi42JTsgfVxcbi5tYW5hLnMxOSB7IGJhY2tncm91bmQtcG9zaXRpb246IDk5LjklIDE2LjYlOyB9XFxuXFxuLm1hbmEuczIwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMCAzMyU7IH1cXG4ubWFuYS5zeCB7IGJhY2tncm91bmQtcG9zaXRpb246IDExLjElIDMzLjMlOyB9XFxuLm1hbmEuc3kgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAyMi4yJSAzMy4zJTsgfVxcbi5tYW5hLnN6IHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMzMuMyUgMzMuMyU7IH1cXG4ubWFuYS5zdyB7IGJhY2tncm91bmQtcG9zaXRpb246IDQ0LjQlIDMzLjMlOyB9XFxuLm1hbmEuc3UgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA1NS41JSAzMy4zJTsgfVxcbi5tYW5hLnNiIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNjYuNiUgMzMuMyU7IH1cXG4ubWFuYS5zciB7IGJhY2tncm91bmQtcG9zaXRpb246IDc3LjclIDMzLjMlOyB9XFxuLm1hbmEuc2cgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA4OC44JSAzMy4zJTsgfVxcbi5tYW5hLnNzIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogOTkuOSUgMzMuMyU7IH1cXG5cXG4ubWFuYS5zd3UgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwIDUwJTsgfVxcbi5tYW5hLnN3YiB7IGJhY2tncm91bmQtcG9zaXRpb246IDExLjElIDUwJTsgfVxcbi5tYW5hLnN1YiB7IGJhY2tncm91bmQtcG9zaXRpb246IDIyLjIlIDUwJTsgfVxcbi5tYW5hLnN1ciB7IGJhY2tncm91bmQtcG9zaXRpb246IDMzLjMlIDUwJTsgfVxcbi5tYW5hLnNiciB7IGJhY2tncm91bmQtcG9zaXRpb246IDQ0LjQlIDUwJTsgfVxcbi5tYW5hLnNiZyB7IGJhY2tncm91bmQtcG9zaXRpb246IDU1LjUlIDUwJTsgfVxcbi5tYW5hLnNydyB7IGJhY2tncm91bmQtcG9zaXRpb246IDY2LjYlIDUwJTsgfVxcbi5tYW5hLnNyZyB7IGJhY2tncm91bmQtcG9zaXRpb246IDc3LjclIDUwJTsgfVxcbi5tYW5hLnNndyB7IGJhY2tncm91bmQtcG9zaXRpb246IDg4LjglIDUwJTsgfVxcbi5tYW5hLnNndSB7IGJhY2tncm91bmQtcG9zaXRpb246IDk5LjklIDUwJTsgfVxcblxcbi5tYW5hLnMydyB7IGJhY2tncm91bmQtcG9zaXRpb246IDAgNjYuNiU7IH1cXG4ubWFuYS5zMnUgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAxMS4xJSA2Ni42JTsgfVxcbi5tYW5hLnMyYiB7IGJhY2tncm91bmQtcG9zaXRpb246IDIyLjIlIDY2LjYlOyB9XFxuLm1hbmEuczJyIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogMzMuMyUgNjYuNiU7IH1cXG4ubWFuYS5zMmcgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA0NC40JSA2Ni42JTsgfVxcbi5tYW5hLnN3cCB7IGJhY2tncm91bmQtcG9zaXRpb246IDU1LjUlIDY2LjYlOyB9XFxuLm1hbmEuc3VwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNjYuNiUgNjYuNiU7IH1cXG4ubWFuYS5zYnAgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA3Ny43JSA2Ni42JTsgfVxcbi5tYW5hLnNycCB7IGJhY2tncm91bmQtcG9zaXRpb246IDg4LjglIDY2LjYlOyB9XFxuLm1hbmEuc2dwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogOTkuOSUgNjYuNiU7IH1cXG5cXG4ubWFuYS5zdCB7IGJhY2tncm91bmQtcG9zaXRpb246IDAlIDgzLjMlOyB9XFxuLm1hbmEuc3EgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAxMS4xJSA4My4zJTsgfVxcblxcbi5tYW5hLnNjIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNzcuNyUgODMuMyU7IH1cXG5cXG4ubWFuYS5zZSB7IGJhY2tncm91bmQtcG9zaXRpb246IDg4LjglIDgzLjMlOyB9XFxuXFxuLm1hbmEuczEwMDAwMDAgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwIDEwMCU7IH1cXG4ubWFuYS5zMTAwMDAwMC5zbWFsbCB7IHdpZHRoOiA0LjllbTsgfVxcbi5tYW5hLnMxMDAwMDAwLm1lZGl1bSB7IHdpZHRoOiA5LjdlbTsgfVxcbi8qLm1hbmEuczEwMDAwMDAubGFyZ2UgeyB3aWR0aDogMTguOGVtOyB9Ki9cXG4ubWFuYS5zMTAwIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogNjAlIDEwMCU7IH1cXG4ubWFuYS5zMTAwLnNtYWxsIHsgd2lkdGg6IDEuOGVtOyB9XFxuLm1hbmEuczEwMC5tZWRpdW0geyB3aWR0aDogMy43ZW07IH1cXG4vKi5tYW5hLnMxMDAubGFyZ2UgeyB3aWR0aDogMTAuOGVtOyB9Ki9cXG4ubWFuYS5zY2hhb3MgeyBiYWNrZ3JvdW5kLXBvc2l0aW9uOiA3Ni41JSAxMDAlOyB9XFxuLm1hbmEuc2NoYW9zLnNtYWxsIHsgd2lkdGg6IDEuMmVtOyB9XFxuLm1hbmEuc2NoYW9zLm1lZGl1bSB7IHdpZHRoOiAyLjNlbTsgfVxcbi8qLm1hbmEuc2MubGFyZ2UgeyB3aWR0aDogNC42ZW07IH0qL1xcbi5tYW5hLnNodyB7IGJhY2tncm91bmQtcG9zaXRpb246IDgzLjUlIDEwMCU7IH1cXG4ubWFuYS5zaHcuc21hbGwgeyB3aWR0aDogMC41ZW07IH1cXG4ubWFuYS5zaHcubWVkaXVtIHsgd2lkdGg6IDFlbTsgfVxcbi8qLm1hbmEuc2h3LmxhcmdlIHsgd2lkdGg6IDJlbTsgfSovXFxuLm1hbmEuc2hyIHsgYmFja2dyb3VuZC1wb3NpdGlvbjogODklIDEwMCU7IH1cXG4ubWFuYS5zaHIuc21hbGwgeyB3aWR0aDogMC41ZW07IH1cXG4ubWFuYS5zaHIubWVkaXVtIHsgd2lkdGg6IDFlbTsgfVxcbi8qLm1hbmEuc2hyLmxhcmdlIHsgd2lkdGg6IDJlbTsgfSovXFxuXFxuXFxuLnNoYWRvdyB7XFxuICAgIGZpbHRlcjogXFxcInByb2dpZDpEWEltYWdlVHJhbnNmb3JtLk1pY3Jvc29mdC5Ecm9wc2hhZG93KE9mZlg9LTEsIE9mZlk9MSwgQ29sb3I9JyMwMDAnKVxcXCI7XFxuICAgIGZpbHRlcjogdXJsKCNzaGFkb3cpO1xcbiAgICAtd2Via2l0LWZpbHRlcjogZHJvcC1zaGFkb3coLTFweCAxcHggMHB4ICMwMDApO1xcbiAgICBmaWx0ZXI6IGRyb3Atc2hhZG93KC0xcHggMXB4IDBweCAjMDAwKTtcXG59XCJdLFwic291cmNlUm9vdFwiOlwiXCJ9XSk7XG4vLyBFeHBvcnRzXG5leHBvcnQgZGVmYXVsdCBfX19DU1NfTE9BREVSX0VYUE9SVF9fXztcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKlxuICBNSVQgTGljZW5zZSBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuICBBdXRob3IgVG9iaWFzIEtvcHBlcnMgQHNva3JhXG4qL1xuLy8gY3NzIGJhc2UgY29kZSwgaW5qZWN0ZWQgYnkgdGhlIGNzcy1sb2FkZXJcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKSB7XG4gIHZhciBsaXN0ID0gW107IC8vIHJldHVybiB0aGUgbGlzdCBvZiBtb2R1bGVzIGFzIGNzcyBzdHJpbmdcblxuICBsaXN0LnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICB2YXIgY29udGVudCA9IGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcoaXRlbSk7XG5cbiAgICAgIGlmIChpdGVtWzJdKSB7XG4gICAgICAgIHJldHVybiBcIkBtZWRpYSBcIi5jb25jYXQoaXRlbVsyXSwgXCIge1wiKS5jb25jYXQoY29udGVudCwgXCJ9XCIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY29udGVudDtcbiAgICB9KS5qb2luKCcnKTtcbiAgfTsgLy8gaW1wb3J0IGEgbGlzdCBvZiBtb2R1bGVzIGludG8gdGhlIGxpc3RcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGZ1bmMtbmFtZXNcblxuXG4gIGxpc3QuaSA9IGZ1bmN0aW9uIChtb2R1bGVzLCBtZWRpYVF1ZXJ5LCBkZWR1cGUpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZXMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgICAgIG1vZHVsZXMgPSBbW251bGwsIG1vZHVsZXMsICcnXV07XG4gICAgfVxuXG4gICAgdmFyIGFscmVhZHlJbXBvcnRlZE1vZHVsZXMgPSB7fTtcblxuICAgIGlmIChkZWR1cGUpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcHJlZmVyLWRlc3RydWN0dXJpbmdcbiAgICAgICAgdmFyIGlkID0gdGhpc1tpXVswXTtcblxuICAgICAgICBpZiAoaWQgIT0gbnVsbCkge1xuICAgICAgICAgIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaWRdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBtb2R1bGVzLmxlbmd0aDsgX2krKykge1xuICAgICAgdmFyIGl0ZW0gPSBbXS5jb25jYXQobW9kdWxlc1tfaV0pO1xuXG4gICAgICBpZiAoZGVkdXBlICYmIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaXRlbVswXV0pIHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnRpbnVlXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAobWVkaWFRdWVyeSkge1xuICAgICAgICBpZiAoIWl0ZW1bMl0pIHtcbiAgICAgICAgICBpdGVtWzJdID0gbWVkaWFRdWVyeTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzJdID0gXCJcIi5jb25jYXQobWVkaWFRdWVyeSwgXCIgYW5kIFwiKS5jb25jYXQoaXRlbVsyXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbGlzdC5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gbGlzdDtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIF9zbGljZWRUb0FycmF5KGFyciwgaSkgeyByZXR1cm4gX2FycmF5V2l0aEhvbGVzKGFycikgfHwgX2l0ZXJhYmxlVG9BcnJheUxpbWl0KGFyciwgaSkgfHwgX3Vuc3VwcG9ydGVkSXRlcmFibGVUb0FycmF5KGFyciwgaSkgfHwgX25vbkl0ZXJhYmxlUmVzdCgpOyB9XG5cbmZ1bmN0aW9uIF9ub25JdGVyYWJsZVJlc3QoKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlLlxcbkluIG9yZGVyIHRvIGJlIGl0ZXJhYmxlLCBub24tYXJyYXkgb2JqZWN0cyBtdXN0IGhhdmUgYSBbU3ltYm9sLml0ZXJhdG9yXSgpIG1ldGhvZC5cIik7IH1cblxuZnVuY3Rpb24gX3Vuc3VwcG9ydGVkSXRlcmFibGVUb0FycmF5KG8sIG1pbkxlbikgeyBpZiAoIW8pIHJldHVybjsgaWYgKHR5cGVvZiBvID09PSBcInN0cmluZ1wiKSByZXR1cm4gX2FycmF5TGlrZVRvQXJyYXkobywgbWluTGVuKTsgdmFyIG4gPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobykuc2xpY2UoOCwgLTEpOyBpZiAobiA9PT0gXCJPYmplY3RcIiAmJiBvLmNvbnN0cnVjdG9yKSBuID0gby5jb25zdHJ1Y3Rvci5uYW1lOyBpZiAobiA9PT0gXCJNYXBcIiB8fCBuID09PSBcIlNldFwiKSByZXR1cm4gQXJyYXkuZnJvbShvKTsgaWYgKG4gPT09IFwiQXJndW1lbnRzXCIgfHwgL14oPzpVaXxJKW50KD86OHwxNnwzMikoPzpDbGFtcGVkKT9BcnJheSQvLnRlc3QobikpIHJldHVybiBfYXJyYXlMaWtlVG9BcnJheShvLCBtaW5MZW4pOyB9XG5cbmZ1bmN0aW9uIF9hcnJheUxpa2VUb0FycmF5KGFyciwgbGVuKSB7IGlmIChsZW4gPT0gbnVsbCB8fCBsZW4gPiBhcnIubGVuZ3RoKSBsZW4gPSBhcnIubGVuZ3RoOyBmb3IgKHZhciBpID0gMCwgYXJyMiA9IG5ldyBBcnJheShsZW4pOyBpIDwgbGVuOyBpKyspIHsgYXJyMltpXSA9IGFycltpXTsgfSByZXR1cm4gYXJyMjsgfVxuXG5mdW5jdGlvbiBfaXRlcmFibGVUb0FycmF5TGltaXQoYXJyLCBpKSB7IGlmICh0eXBlb2YgU3ltYm9sID09PSBcInVuZGVmaW5lZFwiIHx8ICEoU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdChhcnIpKSkgcmV0dXJuOyB2YXIgX2FyciA9IFtdOyB2YXIgX24gPSB0cnVlOyB2YXIgX2QgPSBmYWxzZTsgdmFyIF9lID0gdW5kZWZpbmVkOyB0cnkgeyBmb3IgKHZhciBfaSA9IGFycltTeW1ib2wuaXRlcmF0b3JdKCksIF9zOyAhKF9uID0gKF9zID0gX2kubmV4dCgpKS5kb25lKTsgX24gPSB0cnVlKSB7IF9hcnIucHVzaChfcy52YWx1ZSk7IGlmIChpICYmIF9hcnIubGVuZ3RoID09PSBpKSBicmVhazsgfSB9IGNhdGNoIChlcnIpIHsgX2QgPSB0cnVlOyBfZSA9IGVycjsgfSBmaW5hbGx5IHsgdHJ5IHsgaWYgKCFfbiAmJiBfaVtcInJldHVyblwiXSAhPSBudWxsKSBfaVtcInJldHVyblwiXSgpOyB9IGZpbmFsbHkgeyBpZiAoX2QpIHRocm93IF9lOyB9IH0gcmV0dXJuIF9hcnI7IH1cblxuZnVuY3Rpb24gX2FycmF5V2l0aEhvbGVzKGFycikgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSByZXR1cm4gYXJyOyB9XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtKSB7XG4gIHZhciBfaXRlbSA9IF9zbGljZWRUb0FycmF5KGl0ZW0sIDQpLFxuICAgICAgY29udGVudCA9IF9pdGVtWzFdLFxuICAgICAgY3NzTWFwcGluZyA9IF9pdGVtWzNdO1xuXG4gIGlmICh0eXBlb2YgYnRvYSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxuICAgIHZhciBiYXNlNjQgPSBidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShjc3NNYXBwaW5nKSkpKTtcbiAgICB2YXIgZGF0YSA9IFwic291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsXCIuY29uY2F0KGJhc2U2NCk7XG4gICAgdmFyIHNvdXJjZU1hcHBpbmcgPSBcIi8qIyBcIi5jb25jYXQoZGF0YSwgXCIgKi9cIik7XG4gICAgdmFyIHNvdXJjZVVSTHMgPSBjc3NNYXBwaW5nLnNvdXJjZXMubWFwKGZ1bmN0aW9uIChzb3VyY2UpIHtcbiAgICAgIHJldHVybiBcIi8qIyBzb3VyY2VVUkw9XCIuY29uY2F0KGNzc01hcHBpbmcuc291cmNlUm9vdCB8fCAnJykuY29uY2F0KHNvdXJjZSwgXCIgKi9cIik7XG4gICAgfSk7XG4gICAgcmV0dXJuIFtjb250ZW50XS5jb25jYXQoc291cmNlVVJMcykuY29uY2F0KFtzb3VyY2VNYXBwaW5nXSkuam9pbignXFxuJyk7XG4gIH1cblxuICByZXR1cm4gW2NvbnRlbnRdLmpvaW4oJ1xcbicpO1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAodXJsLCBvcHRpb25zKSB7XG4gIGlmICghb3B0aW9ucykge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICAgIG9wdGlvbnMgPSB7fTtcbiAgfSAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZXJzY29yZS1kYW5nbGUsIG5vLXBhcmFtLXJlYXNzaWduXG5cblxuICB1cmwgPSB1cmwgJiYgdXJsLl9fZXNNb2R1bGUgPyB1cmwuZGVmYXVsdCA6IHVybDtcblxuICBpZiAodHlwZW9mIHVybCAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gdXJsO1xuICB9IC8vIElmIHVybCBpcyBhbHJlYWR5IHdyYXBwZWQgaW4gcXVvdGVzLCByZW1vdmUgdGhlbVxuXG5cbiAgaWYgKC9eWydcIl0uKlsnXCJdJC8udGVzdCh1cmwpKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gICAgdXJsID0gdXJsLnNsaWNlKDEsIC0xKTtcbiAgfVxuXG4gIGlmIChvcHRpb25zLmhhc2gpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgICB1cmwgKz0gb3B0aW9ucy5oYXNoO1xuICB9IC8vIFNob3VsZCB1cmwgYmUgd3JhcHBlZD9cbiAgLy8gU2VlIGh0dHBzOi8vZHJhZnRzLmNzc3dnLm9yZy9jc3MtdmFsdWVzLTMvI3VybHNcblxuXG4gIGlmICgvW1wiJygpIFxcdFxcbl0vLnRlc3QodXJsKSB8fCBvcHRpb25zLm5lZWRRdW90ZXMpIHtcbiAgICByZXR1cm4gXCJcXFwiXCIuY29uY2F0KHVybC5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJykucmVwbGFjZSgvXFxuL2csICdcXFxcbicpLCBcIlxcXCJcIik7XG4gIH1cblxuICByZXR1cm4gdXJsO1xufTsiLCJleHBvcnQgZGVmYXVsdCBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiOGY0YjlkMDQ3NmU2MjBkMWZlZjUwYzk1MDQ0MzY0NTYuc3ZnXCI7IiwiZXhwb3J0IGRlZmF1bHQgX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcImM4OWEwMzA1YzZlYmZmMzg1ODg3OGRmNjEzNjg3NjdhLnN2Z1wiOyIsImltcG9ydCBhcGkgZnJvbSBcIiEuLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanNcIjtcbiAgICAgICAgICAgIGltcG9ydCBjb250ZW50IGZyb20gXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vc3R5bGUuY3NzXCI7XG5cbnZhciBvcHRpb25zID0ge307XG5cbm9wdGlvbnMuaW5zZXJ0ID0gXCJoZWFkXCI7XG5vcHRpb25zLnNpbmdsZXRvbiA9IGZhbHNlO1xuXG52YXIgdXBkYXRlID0gYXBpKGNvbnRlbnQsIG9wdGlvbnMpO1xuXG5cblxuZXhwb3J0IGRlZmF1bHQgY29udGVudC5sb2NhbHMgfHwge307IiwiaW1wb3J0IGFwaSBmcm9tIFwiIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qc1wiO1xuICAgICAgICAgICAgaW1wb3J0IGNvbnRlbnQgZnJvbSBcIiEhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi9tYW5hLmNzc1wiO1xuXG52YXIgb3B0aW9ucyA9IHt9O1xuXG5vcHRpb25zLmluc2VydCA9IFwiaGVhZFwiO1xub3B0aW9ucy5zaW5nbGV0b24gPSBmYWxzZTtcblxudmFyIHVwZGF0ZSA9IGFwaShjb250ZW50LCBvcHRpb25zKTtcblxuXG5cbmV4cG9ydCBkZWZhdWx0IGNvbnRlbnQubG9jYWxzIHx8IHt9OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgaXNPbGRJRSA9IGZ1bmN0aW9uIGlzT2xkSUUoKSB7XG4gIHZhciBtZW1vO1xuICByZXR1cm4gZnVuY3Rpb24gbWVtb3JpemUoKSB7XG4gICAgaWYgKHR5cGVvZiBtZW1vID09PSAndW5kZWZpbmVkJykge1xuICAgICAgLy8gVGVzdCBmb3IgSUUgPD0gOSBhcyBwcm9wb3NlZCBieSBCcm93c2VyaGFja3NcbiAgICAgIC8vIEBzZWUgaHR0cDovL2Jyb3dzZXJoYWNrcy5jb20vI2hhY2stZTcxZDg2OTJmNjUzMzQxNzNmZWU3MTVjMjIyY2I4MDVcbiAgICAgIC8vIFRlc3RzIGZvciBleGlzdGVuY2Ugb2Ygc3RhbmRhcmQgZ2xvYmFscyBpcyB0byBhbGxvdyBzdHlsZS1sb2FkZXJcbiAgICAgIC8vIHRvIG9wZXJhdGUgY29ycmVjdGx5IGludG8gbm9uLXN0YW5kYXJkIGVudmlyb25tZW50c1xuICAgICAgLy8gQHNlZSBodHRwczovL2dpdGh1Yi5jb20vd2VicGFjay1jb250cmliL3N0eWxlLWxvYWRlci9pc3N1ZXMvMTc3XG4gICAgICBtZW1vID0gQm9vbGVhbih3aW5kb3cgJiYgZG9jdW1lbnQgJiYgZG9jdW1lbnQuYWxsICYmICF3aW5kb3cuYXRvYik7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1lbW87XG4gIH07XG59KCk7XG5cbnZhciBnZXRUYXJnZXQgPSBmdW5jdGlvbiBnZXRUYXJnZXQoKSB7XG4gIHZhciBtZW1vID0ge307XG4gIHJldHVybiBmdW5jdGlvbiBtZW1vcml6ZSh0YXJnZXQpIHtcbiAgICBpZiAodHlwZW9mIG1lbW9bdGFyZ2V0XSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHZhciBzdHlsZVRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyZ2V0KTsgLy8gU3BlY2lhbCBjYXNlIHRvIHJldHVybiBoZWFkIG9mIGlmcmFtZSBpbnN0ZWFkIG9mIGlmcmFtZSBpdHNlbGZcblxuICAgICAgaWYgKHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCAmJiBzdHlsZVRhcmdldCBpbnN0YW5jZW9mIHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIC8vIFRoaXMgd2lsbCB0aHJvdyBhbiBleGNlcHRpb24gaWYgYWNjZXNzIHRvIGlmcmFtZSBpcyBibG9ja2VkXG4gICAgICAgICAgLy8gZHVlIHRvIGNyb3NzLW9yaWdpbiByZXN0cmljdGlvbnNcbiAgICAgICAgICBzdHlsZVRhcmdldCA9IHN0eWxlVGFyZ2V0LmNvbnRlbnREb2N1bWVudC5oZWFkO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgLy8gaXN0YW5idWwgaWdub3JlIG5leHRcbiAgICAgICAgICBzdHlsZVRhcmdldCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbWVtb1t0YXJnZXRdID0gc3R5bGVUYXJnZXQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1lbW9bdGFyZ2V0XTtcbiAgfTtcbn0oKTtcblxudmFyIHN0eWxlc0luRG9tID0gW107XG5cbmZ1bmN0aW9uIGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpIHtcbiAgdmFyIHJlc3VsdCA9IC0xO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3R5bGVzSW5Eb20ubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoc3R5bGVzSW5Eb21baV0uaWRlbnRpZmllciA9PT0gaWRlbnRpZmllcikge1xuICAgICAgcmVzdWx0ID0gaTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIG1vZHVsZXNUb0RvbShsaXN0LCBvcHRpb25zKSB7XG4gIHZhciBpZENvdW50TWFwID0ge307XG4gIHZhciBpZGVudGlmaWVycyA9IFtdO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gbGlzdFtpXTtcbiAgICB2YXIgaWQgPSBvcHRpb25zLmJhc2UgPyBpdGVtWzBdICsgb3B0aW9ucy5iYXNlIDogaXRlbVswXTtcbiAgICB2YXIgY291bnQgPSBpZENvdW50TWFwW2lkXSB8fCAwO1xuICAgIHZhciBpZGVudGlmaWVyID0gXCJcIi5jb25jYXQoaWQsIFwiIFwiKS5jb25jYXQoY291bnQpO1xuICAgIGlkQ291bnRNYXBbaWRdID0gY291bnQgKyAxO1xuICAgIHZhciBpbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgIHZhciBvYmogPSB7XG4gICAgICBjc3M6IGl0ZW1bMV0sXG4gICAgICBtZWRpYTogaXRlbVsyXSxcbiAgICAgIHNvdXJjZU1hcDogaXRlbVszXVxuICAgIH07XG5cbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICBzdHlsZXNJbkRvbVtpbmRleF0ucmVmZXJlbmNlcysrO1xuICAgICAgc3R5bGVzSW5Eb21baW5kZXhdLnVwZGF0ZXIob2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3R5bGVzSW5Eb20ucHVzaCh7XG4gICAgICAgIGlkZW50aWZpZXI6IGlkZW50aWZpZXIsXG4gICAgICAgIHVwZGF0ZXI6IGFkZFN0eWxlKG9iaiwgb3B0aW9ucyksXG4gICAgICAgIHJlZmVyZW5jZXM6IDFcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlkZW50aWZpZXJzLnB1c2goaWRlbnRpZmllcik7XG4gIH1cblxuICByZXR1cm4gaWRlbnRpZmllcnM7XG59XG5cbmZ1bmN0aW9uIGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKSB7XG4gIHZhciBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gIHZhciBhdHRyaWJ1dGVzID0gb3B0aW9ucy5hdHRyaWJ1dGVzIHx8IHt9O1xuXG4gIGlmICh0eXBlb2YgYXR0cmlidXRlcy5ub25jZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICB2YXIgbm9uY2UgPSB0eXBlb2YgX193ZWJwYWNrX25vbmNlX18gIT09ICd1bmRlZmluZWQnID8gX193ZWJwYWNrX25vbmNlX18gOiBudWxsO1xuXG4gICAgaWYgKG5vbmNlKSB7XG4gICAgICBhdHRyaWJ1dGVzLm5vbmNlID0gbm9uY2U7XG4gICAgfVxuICB9XG5cbiAgT2JqZWN0LmtleXMoYXR0cmlidXRlcykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgc3R5bGUuc2V0QXR0cmlidXRlKGtleSwgYXR0cmlidXRlc1trZXldKTtcbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBvcHRpb25zLmluc2VydCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIG9wdGlvbnMuaW5zZXJ0KHN0eWxlKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgdGFyZ2V0ID0gZ2V0VGFyZ2V0KG9wdGlvbnMuaW5zZXJ0IHx8ICdoZWFkJyk7XG5cbiAgICBpZiAoIXRhcmdldCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ291bGRuJ3QgZmluZCBhIHN0eWxlIHRhcmdldC4gVGhpcyBwcm9iYWJseSBtZWFucyB0aGF0IHRoZSB2YWx1ZSBmb3IgdGhlICdpbnNlcnQnIHBhcmFtZXRlciBpcyBpbnZhbGlkLlwiKTtcbiAgICB9XG5cbiAgICB0YXJnZXQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xuICB9XG5cbiAgcmV0dXJuIHN0eWxlO1xufVxuXG5mdW5jdGlvbiByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGUpIHtcbiAgLy8gaXN0YW5idWwgaWdub3JlIGlmXG4gIGlmIChzdHlsZS5wYXJlbnROb2RlID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgc3R5bGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzdHlsZSk7XG59XG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cblxuXG52YXIgcmVwbGFjZVRleHQgPSBmdW5jdGlvbiByZXBsYWNlVGV4dCgpIHtcbiAgdmFyIHRleHRTdG9yZSA9IFtdO1xuICByZXR1cm4gZnVuY3Rpb24gcmVwbGFjZShpbmRleCwgcmVwbGFjZW1lbnQpIHtcbiAgICB0ZXh0U3RvcmVbaW5kZXhdID0gcmVwbGFjZW1lbnQ7XG4gICAgcmV0dXJuIHRleHRTdG9yZS5maWx0ZXIoQm9vbGVhbikuam9pbignXFxuJyk7XG4gIH07XG59KCk7XG5cbmZ1bmN0aW9uIGFwcGx5VG9TaW5nbGV0b25UYWcoc3R5bGUsIGluZGV4LCByZW1vdmUsIG9iaikge1xuICB2YXIgY3NzID0gcmVtb3ZlID8gJycgOiBvYmoubWVkaWEgPyBcIkBtZWRpYSBcIi5jb25jYXQob2JqLm1lZGlhLCBcIiB7XCIpLmNvbmNhdChvYmouY3NzLCBcIn1cIikgOiBvYmouY3NzOyAvLyBGb3Igb2xkIElFXG5cbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICAqL1xuXG4gIGlmIChzdHlsZS5zdHlsZVNoZWV0KSB7XG4gICAgc3R5bGUuc3R5bGVTaGVldC5jc3NUZXh0ID0gcmVwbGFjZVRleHQoaW5kZXgsIGNzcyk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGNzc05vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpO1xuICAgIHZhciBjaGlsZE5vZGVzID0gc3R5bGUuY2hpbGROb2RlcztcblxuICAgIGlmIChjaGlsZE5vZGVzW2luZGV4XSkge1xuICAgICAgc3R5bGUucmVtb3ZlQ2hpbGQoY2hpbGROb2Rlc1tpbmRleF0pO1xuICAgIH1cblxuICAgIGlmIChjaGlsZE5vZGVzLmxlbmd0aCkge1xuICAgICAgc3R5bGUuaW5zZXJ0QmVmb3JlKGNzc05vZGUsIGNoaWxkTm9kZXNbaW5kZXhdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3R5bGUuYXBwZW5kQ2hpbGQoY3NzTm9kZSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGFwcGx5VG9UYWcoc3R5bGUsIG9wdGlvbnMsIG9iaikge1xuICB2YXIgY3NzID0gb2JqLmNzcztcbiAgdmFyIG1lZGlhID0gb2JqLm1lZGlhO1xuICB2YXIgc291cmNlTWFwID0gb2JqLnNvdXJjZU1hcDtcblxuICBpZiAobWVkaWEpIHtcbiAgICBzdHlsZS5zZXRBdHRyaWJ1dGUoJ21lZGlhJywgbWVkaWEpO1xuICB9IGVsc2Uge1xuICAgIHN0eWxlLnJlbW92ZUF0dHJpYnV0ZSgnbWVkaWEnKTtcbiAgfVxuXG4gIGlmIChzb3VyY2VNYXAgJiYgdHlwZW9mIGJ0b2EgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgY3NzICs9IFwiXFxuLyojIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxcIi5jb25jYXQoYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoc291cmNlTWFwKSkpKSwgXCIgKi9cIik7XG4gIH0gLy8gRm9yIG9sZCBJRVxuXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAgKi9cblxuXG4gIGlmIChzdHlsZS5zdHlsZVNoZWV0KSB7XG4gICAgc3R5bGUuc3R5bGVTaGVldC5jc3NUZXh0ID0gY3NzO1xuICB9IGVsc2Uge1xuICAgIHdoaWxlIChzdHlsZS5maXJzdENoaWxkKSB7XG4gICAgICBzdHlsZS5yZW1vdmVDaGlsZChzdHlsZS5maXJzdENoaWxkKTtcbiAgICB9XG5cbiAgICBzdHlsZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcbiAgfVxufVxuXG52YXIgc2luZ2xldG9uID0gbnVsbDtcbnZhciBzaW5nbGV0b25Db3VudGVyID0gMDtcblxuZnVuY3Rpb24gYWRkU3R5bGUob2JqLCBvcHRpb25zKSB7XG4gIHZhciBzdHlsZTtcbiAgdmFyIHVwZGF0ZTtcbiAgdmFyIHJlbW92ZTtcblxuICBpZiAob3B0aW9ucy5zaW5nbGV0b24pIHtcbiAgICB2YXIgc3R5bGVJbmRleCA9IHNpbmdsZXRvbkNvdW50ZXIrKztcbiAgICBzdHlsZSA9IHNpbmdsZXRvbiB8fCAoc2luZ2xldG9uID0gaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpKTtcbiAgICB1cGRhdGUgPSBhcHBseVRvU2luZ2xldG9uVGFnLmJpbmQobnVsbCwgc3R5bGUsIHN0eWxlSW5kZXgsIGZhbHNlKTtcbiAgICByZW1vdmUgPSBhcHBseVRvU2luZ2xldG9uVGFnLmJpbmQobnVsbCwgc3R5bGUsIHN0eWxlSW5kZXgsIHRydWUpO1xuICB9IGVsc2Uge1xuICAgIHN0eWxlID0gaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpO1xuICAgIHVwZGF0ZSA9IGFwcGx5VG9UYWcuYmluZChudWxsLCBzdHlsZSwgb3B0aW9ucyk7XG5cbiAgICByZW1vdmUgPSBmdW5jdGlvbiByZW1vdmUoKSB7XG4gICAgICByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGUpO1xuICAgIH07XG4gIH1cblxuICB1cGRhdGUob2JqKTtcbiAgcmV0dXJuIGZ1bmN0aW9uIHVwZGF0ZVN0eWxlKG5ld09iaikge1xuICAgIGlmIChuZXdPYmopIHtcbiAgICAgIGlmIChuZXdPYmouY3NzID09PSBvYmouY3NzICYmIG5ld09iai5tZWRpYSA9PT0gb2JqLm1lZGlhICYmIG5ld09iai5zb3VyY2VNYXAgPT09IG9iai5zb3VyY2VNYXApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB1cGRhdGUob2JqID0gbmV3T2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVtb3ZlKCk7XG4gICAgfVxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChsaXN0LCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9OyAvLyBGb3JjZSBzaW5nbGUtdGFnIHNvbHV0aW9uIG9uIElFNi05LCB3aGljaCBoYXMgYSBoYXJkIGxpbWl0IG9uIHRoZSAjIG9mIDxzdHlsZT5cbiAgLy8gdGFncyBpdCB3aWxsIGFsbG93IG9uIGEgcGFnZVxuXG4gIGlmICghb3B0aW9ucy5zaW5nbGV0b24gJiYgdHlwZW9mIG9wdGlvbnMuc2luZ2xldG9uICE9PSAnYm9vbGVhbicpIHtcbiAgICBvcHRpb25zLnNpbmdsZXRvbiA9IGlzT2xkSUUoKTtcbiAgfVxuXG4gIGxpc3QgPSBsaXN0IHx8IFtdO1xuICB2YXIgbGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKGxpc3QsIG9wdGlvbnMpO1xuICByZXR1cm4gZnVuY3Rpb24gdXBkYXRlKG5ld0xpc3QpIHtcbiAgICBuZXdMaXN0ID0gbmV3TGlzdCB8fCBbXTtcblxuICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobmV3TGlzdCkgIT09ICdbb2JqZWN0IEFycmF5XScpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxhc3RJZGVudGlmaWVycy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGlkZW50aWZpZXIgPSBsYXN0SWRlbnRpZmllcnNbaV07XG4gICAgICB2YXIgaW5kZXggPSBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgICAgIHN0eWxlc0luRG9tW2luZGV4XS5yZWZlcmVuY2VzLS07XG4gICAgfVxuXG4gICAgdmFyIG5ld0xhc3RJZGVudGlmaWVycyA9IG1vZHVsZXNUb0RvbShuZXdMaXN0LCBvcHRpb25zKTtcblxuICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICB2YXIgX2lkZW50aWZpZXIgPSBsYXN0SWRlbnRpZmllcnNbX2ldO1xuXG4gICAgICB2YXIgX2luZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoX2lkZW50aWZpZXIpO1xuXG4gICAgICBpZiAoc3R5bGVzSW5Eb21bX2luZGV4XS5yZWZlcmVuY2VzID09PSAwKSB7XG4gICAgICAgIHN0eWxlc0luRG9tW19pbmRleF0udXBkYXRlcigpO1xuXG4gICAgICAgIHN0eWxlc0luRG9tLnNwbGljZShfaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxhc3RJZGVudGlmaWVycyA9IG5ld0xhc3RJZGVudGlmaWVycztcbiAgfTtcbn07IiwiaW1wb3J0ICcuLi9jc3Mvc3R5bGUuY3NzJztcbmltcG9ydCAnLi4vY3NzL3ZlbmRvci9tYW5hLmNzcyc7XG5pbXBvcnQgU2VhcmNoIGZyb20gJy4vbW9kZWxzL1NlYXJjaCc7XG5pbXBvcnQgKiBhcyBzZWFyY2hWaWV3IGZyb20gJy4vdmlld3Mvc2VhcmNoVmlldyc7XG5pbXBvcnQgKiBhcyByZXN1bHRzVmlldyBmcm9tICcuL3ZpZXdzL3Jlc3VsdHNWaWV3JztcbmltcG9ydCAqIGFzIGNhcmRWaWV3IGZyb20gJy4vdmlld3MvY2FyZFZpZXcnO1xuaW1wb3J0ICogYXMgaW52ZW50b3J5VmlldyBmcm9tICcuL3ZpZXdzL2ludmVudG9yeVZpZXcnO1xuaW1wb3J0ICogYXMgaW52U2VhcmNoIGZyb20gJy4vdmlld3MvaW52ZW50b3J5U2VhcmNoVmlldyc7XG5pbXBvcnQgeyBlbGVtZW50cyB9IGZyb20gJy4vdmlld3MvYmFzZSc7XG5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKiogSG9tZSBQYWdlICoqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbmlmICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgPT09ICcvJykgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW4nO1xuXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKiBRdWljayBTZWFyY2ggKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG5lbGVtZW50cy5uYXYucXVpY2tTZWFyY2hCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gIGNvbnN0IHNlYXJjaCA9IG5ldyBTZWFyY2goKTtcblxuICBpZiAoZWxlbWVudHMubmF2LnNlYXJjaElucHV0LnZhbHVlICE9PSAnJykge1xuICAgIGNvbnN0IHF1ZXJ5ID0gc2VhcmNoLnF1aWNrU2VhcmNoKCk7XG4gICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBgL3Jlc3VsdHMvbGlzdC8ke3F1ZXJ5fSZvcmRlcj1uYW1lYDtcbiAgfVxufSk7XG5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqIFNlYXJjaCBQYWdlICoqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbmlmICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgPT09ICcvc2VhcmNoJykge1xuICBkb2N1bWVudC5ib2R5LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcjZmRmZGZkJztcblxuICBjb25zdCBzZWFyY2ggPSBuZXcgU2VhcmNoKCk7XG5cbiAgLy8gRXZlbnQgbGlzdGVuZXIgZm9yIHRoZSBzdWJtaXQgc2VhcmNoIGJ1dHRvbi4gVGhpcyBnb2VzIHRocm91Z2ggdGhlIGZvcm0gYW5kIGdlbmVyYXRlc1xuICAvLyB0aGUgcXVqZXJ5IHN0cmluZy4gSXQgdGhlbiBwYXNzZXMgdGhlIHN0cmluZyB0byB0aGUgc2VydmVyIHRocm91Z2ggdGhlIFVSTFxuICBlbGVtZW50cy5hcGlTZWFyY2guc3VibWl0QnRuLm9uY2xpY2sgPSBhc3luYyAoZSkgPT4ge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIC8vIENsZWFyIGFueSBleGlzdGluZyBxdWVyeSBzdHJpbmdcbiAgICBzZWFyY2gucmVzZXRTZWFyY2hRdWVyeSgpO1xuXG4gICAgLy8gQnVpbGQgdGhlIHF1ZXJ5IHN0cmluZ1xuICAgIGNvbnN0IHF1ZXJ5ID0gc2VhcmNoLmJ1aWxkU2VhcmNoUXVlcnkoKTtcblxuICAgIC8vIEdldCB0aGUgZGlzcGxheSBtZXRob2RcbiAgICBjb25zdCBkaXNwbGF5TWV0aG9kID0gc2VhcmNoLmRpc3BsYXlNZXRob2QoKTtcblxuICAgIC8vIENyZWF0ZSBhIGdldCByZXF1ZXN0IHdpdGggdGhlIHF1ZXJ5IHN0cmluZ1xuICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gYC9yZXN1bHRzLyR7ZGlzcGxheU1ldGhvZH0vJHtxdWVyeX1gO1xuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG4gIGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlTGluZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAvLyBEaXNwbGF5IHRoZSBkcm9wZG93blxuICAgIHNlYXJjaFZpZXcuc2hvd1R5cGVzRHJvcERvd24oKTtcbiAgICBzZWFyY2hWaWV3LnN0YXJ0VHlwZXNEcm9wRG93bk5hdmlnYXRpb24oKTtcblxuICAgIC8vIFN0YXJ0IGFuIGV2ZW50IGxpc3RlbmVyIG9uIHRoZSBkb2N1bWVudC4gVGhpcyB3aWxsIGNsb3NlIHRoZSBkcm9wZG93biBpZiB0aGUgdXNlciBjbGlja3NcbiAgICAvLyBvdXRzaWRlIG9mIHRoZSBpbnB1dCBvciBkcm9wZG93bi4gVGhpcyB3aWxsIGFsc28gY2FuY2VsIHRoZSBldmVudCBsaXN0ZW5lclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2VhcmNoVmlldy50eXBlTGluZUxpc3RlbmVyKTtcbiAgfSk7XG5cbiAgZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVMaW5lLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xuICAgIGlmIChlbGVtZW50cy5hcGlTZWFyY2gudHlwZURyb3BEb3duLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIHtcbiAgICAgIHNlYXJjaFZpZXcuc2hvd1R5cGVzRHJvcERvd24oKTtcbiAgICB9XG5cbiAgICBzZWFyY2hWaWV3LmZpbHRlclR5cGVzKGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlTGluZS52YWx1ZSk7XG4gICAgc2VhcmNoVmlldy5maWx0ZXJUeXBlSGVhZGVycygpO1xuICAgIHNlYXJjaFZpZXcuc3RhcnRUeXBlc0Ryb3BEb3duTmF2aWdhdGlvbigpO1xuICB9KTtcblxuICBlbGVtZW50cy5hcGlTZWFyY2guc2V0SW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgLy8gRGlzcGxheSB0aGUgZHJvcGRvd25cbiAgICBzZWFyY2hWaWV3LnNob3dTZXRzRHJvcERvd24oKTtcbiAgICBzZWFyY2hWaWV3LnN0YXJ0U2V0c0Ryb3BEb3duTmF2aWdhdGlvbigpO1xuXG4gICAgLy8gU3RhcnQgYW4gZXZlbnQgbGlzdGVuZXIgb24gdGhlIGRvY3VtZW50LiBUaGlzIHdpbGwgY2xvc2UgdGhlIGRyb3Bkb3duIGlmIHRoZSB1c2VyIGNsaWNrc1xuICAgIC8vIG91dHNpZGUgb2YgdGhlIGlucHV0IG9yIGRyb3Bkb3duLiBUaGlzIHdpbGwgYWxzbyBjYW5jZWwgdGhlIGV2ZW50IGxpc3RlbmVyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzZWFyY2hWaWV3LnNldElucHV0TGlzdGVuZXIpO1xuICB9KTtcblxuICBlbGVtZW50cy5hcGlTZWFyY2guc2V0SW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XG4gICAgaWYgKGVsZW1lbnRzLmFwaVNlYXJjaC5zZXREcm9wRG93bi5oYXNBdHRyaWJ1dGUoJ2hpZGRlbicpKSB7XG4gICAgICBzZWFyY2hWaWV3LnNob3dTZXRzRHJvcERvd24oKTtcbiAgICB9XG5cbiAgICBzZWFyY2hWaWV3LmZpbHRlclNldHMoZWxlbWVudHMuYXBpU2VhcmNoLnNldElucHV0LnZhbHVlKTtcbiAgICBzZWFyY2hWaWV3LmZpbHRlclNldEhlYWRlcnMoKTtcbiAgICBzZWFyY2hWaWV3LnN0YXJ0U2V0c0Ryb3BEb3duTmF2aWdhdGlvbigpO1xuICB9KTtcblxuICBlbGVtZW50cy5hcGlTZWFyY2guc3RhdFZhbHVlLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgJ2lucHV0JyxcbiAgICBzZWFyY2hWaWV3LnN0YXRMaW5lQ29udHJvbGxlclxuICApO1xuXG4gIGVsZW1lbnRzLmFwaVNlYXJjaC5mb3JtYXQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAnY2hhbmdlJyxcbiAgICBzZWFyY2hWaWV3LmZvcm1hdExpbmVDb250cm9sbGVyXG4gICk7XG59XG5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqIFJlc3VsdHMgUGFnZSAqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbmlmICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3Vic3RyaW5nKDEsIDgpID09PSAncmVzdWx0cycpIHtcbiAgZG9jdW1lbnQuYm9keS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnI2Y1ZjZmNyc7XG5cbiAgY29uc3Qgc3RhdGUgPSB7XG4gICAgc2VhcmNoOiBuZXcgU2VhcmNoKCksXG5cbiAgICAvLyBHZXQgdGhlIGRpc3BsYXkgbWV0aG9kLCBzb3J0IG1ldGhvZCwgYW5kIHF1ZXJ5IGZyb20gdGhlIFVSTFxuICAgIGRpc3BsYXk6IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zdWJzdHJpbmcoXG4gICAgICA5LFxuICAgICAgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLmxhc3RJbmRleE9mKCcvJylcbiAgICApLFxuICAgIHF1ZXJ5OiB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3Vic3RyaW5nKFxuICAgICAgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLmxhc3RJbmRleE9mKCcvJykgKyAxXG4gICAgKSxcbiAgICBzb3J0TWV0aG9kOiB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3Vic3RyaW5nKFxuICAgICAgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLmxhc3RJbmRleE9mKCc9JykgKyAxXG4gICAgKSxcblxuICAgIGFsbENhcmRzOiBbXSxcbiAgICBjdXJyZW50SW5kZXg6IDAsXG4gICAgYWxsUmVzdWx0c0xvYWRlZDogZmFsc2UsXG4gIH07XG5cbiAgLy8gV2hlbiB0aGUgcmVzdWx0cyBwYWdlIGlzIHJlZnJlc2hlZCwgZGlzcGxheSB0aGUgY2FyZHMgYXMgYSBjaGVja2xpc3QgYnkgZGVmYXVsdFxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgYXN5bmMgKCkgPT4ge1xuICAgIC8vIFVwZGF0ZSB0aGUgc29ydCBieSBhbmQgZGlzcGxheSBhc2QgbWVudXMgc28gdGhlIHNlbGVjdGVkIG9wdGlvbiBpcyB3aGF0IHRoZSB1c2VyIHNlbGVjdGVkXG4gICAgcmVzdWx0c1ZpZXcuY2hvc2VTZWxlY3RNZW51U29ydChcbiAgICAgIGVsZW1lbnRzLnJlc3VsdHNQYWdlLnNvcnRCeSgpLm9wdGlvbnMsXG4gICAgICBzdGF0ZVxuICAgICk7XG4gICAgcmVzdWx0c1ZpZXcuY2hvc2VTZWxlY3RNZW51RGlzcGxheShcbiAgICAgIGVsZW1lbnRzLnJlc3VsdHNQYWdlLmRpc3BsYXlTZWxlY3RvcigpLFxuICAgICAgc3RhdGVcbiAgICApO1xuXG4gICAgLy8gUnVuIHRoZSBnZXQgY2FyZHMgZnVuY3Rpb24sIHRoZW4gdXBkYXRlIHRoZSBkaXNwbGF5IGJhciB3aXRoIHRoZSB0b3RhbCBjYXJkIGNvdW50XG4gICAgYXdhaXQgc3RhdGUuc2VhcmNoLmdldENhcmRzKHN0YXRlKTtcblxuICAgIGlmIChzdGF0ZS5hbGxDYXJkc1swXSA9PT0gNDA0KSB7XG4gICAgICByZXN1bHRzVmlldy5kaXNwbGF5NDA0KCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcmVzdWx0c1ZpZXcudXBkYXRlRGlzcGxheUJhcihzdGF0ZSk7XG5cbiAgICAvLyBJbiB0aGUgYmFja2dyb3VuZCwgZ2V0IGFsbCBjYXJkc1xuICAgIHN0YXRlLnNlYXJjaC5nZXRBbGxDYXJkcyhzdGF0ZSwgcmVzdWx0c1ZpZXcuZW5hYmxlQnRuKTtcblxuICAgIC8vIE9uIGxvYWRpbmcgdGhlIHBhZ2UgZGlzcGxheSB0aGUgY2FyZHMgaW4gYSBjaGVja2xpc3RcbiAgICByZXN1bHRzVmlldy51cGRhdGVEaXNwbGF5KHN0YXRlKTtcbiAgfSk7XG5cbiAgLy8gRXZlbnQgbGlzdGVuZXIgZm9yIHRoZSBjaGFuZ2UgZGlzcGxheSBtZXRob2QgYnV0dG9uXG4gIGVsZW1lbnRzLnJlc3VsdHNQYWdlLmJ0bigpLm9uY2xpY2sgPSBhc3luYyAoKSA9PiB7XG4gICAgLy8gVXBkYXRlIHRoZSBkaXNwbGF5IG1ldGhvZCBiZXR3ZWVuIGNoZWNrbGlzdCBhbmQgY2FyZHMgaWYgdGhlIHVzZXIgY2hhbmdlZCBpdFxuICAgIHJlc3VsdHNWaWV3LmNoYW5nZURpc3BsYXlBbmRVcmwoc3RhdGUpO1xuXG4gICAgLy8gSWYgYSBuZXcgc29ydGluZyBtZXRob2QgaXMgc2VsZWN0ZWQsIGEgcmVxdWVzdCBpcyBzZW50IHRvIHRoZSBzZXJ2ZXIgYW5kIHRoZSBwYWdlIGlzIHJlZnJlc2hlZC5cbiAgICAvLyBUaGlzIHJlc2V0cyB0aGUgc3RhdGUgYW5kIGFzeW5jIHRhc2tzXG4gICAgcmVzdWx0c1ZpZXcuY2hhbmdlU29ydE1ldGhvZChzdGF0ZSk7XG5cbiAgICAvLyBVcGRhdGUgdGhlIGRpc3BsYXkgd2l0aCBhIG5ldyBzb3J0IG1ldGhvZCBhbmQgZGlzcGxheSBtZXRob2QgaWYgZWl0aGVyIHdlcmUgZ2l2ZW5cbiAgICByZXN1bHRzVmlldy51cGRhdGVEaXNwbGF5KHN0YXRlKTtcbiAgfTtcblxuICAvLyBFdmVudCBMaXN0ZW5lciBmb3IgbmV4dCBwYWdlIGJ1dHRvblxuICBlbGVtZW50cy5yZXN1bHRzUGFnZS5uZXh0UGFnZUJ0bigpLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgLy8gVXBkYXRlIHRoZSBpbmRleFxuICAgIHN0YXRlLmN1cnJlbnRJbmRleCsrO1xuXG4gICAgLy8gVXBkYXRlIHRoZSBkaXNwbGF5IGJhc2VkIG9uIHRoZSBtZXRob2Qgc3RvcmVkIGluIHRoZSBzdGF0ZVxuICAgIHJlc3VsdHNWaWV3LnVwZGF0ZURpc3BsYXkoc3RhdGUpO1xuXG4gICAgLy8gVXBkYXRlIHRoZSBkaXNwbGF5IGJhclxuICAgIHJlc3VsdHNWaWV3LnVwZGF0ZURpc3BsYXlCYXIoc3RhdGUpO1xuXG4gICAgLy8gRW5hYmxlIHRoZSBwcmV2aW91cyBwYWdlIGFuZCBmaXJzdCBwYWdlIGJ0bnNcbiAgICByZXN1bHRzVmlldy5lbmFibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UucHJldmlvdXNQYWdlQnRuKCkpO1xuICAgIHJlc3VsdHNWaWV3LmVuYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5maXJzdFBhZ2VCdG4pO1xuXG4gICAgLy8gSWYgb24gdGhlIGxhc3QgcGFnZSwgZGlzYWJsZSB0aGUgbmV4dCBwYWdlIGJ0biBhbmQgbGFzdCBwYWdlIGJ0blxuICAgIGlmIChzdGF0ZS5jdXJyZW50SW5kZXggPT09IHN0YXRlLmFsbENhcmRzLmxlbmd0aCAtIDEpIHtcbiAgICAgIHJlc3VsdHNWaWV3LmRpc2FibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UubmV4dFBhZ2VCdG4oKSk7XG4gICAgICByZXN1bHRzVmlldy5kaXNhYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLmxhc3RQYWdlQnRuKTtcbiAgICB9XG4gIH07XG5cbiAgLy8gRXZlbnQgbGlzdGVuZXIgZm9yIHRoZSBsYXN0IHBhZ2UgYnRuXG4gIGVsZW1lbnRzLnJlc3VsdHNQYWdlLmxhc3RQYWdlQnRuLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgLy8gVXBkYXRlIHRoZSBpbmRleFxuICAgIHN0YXRlLmN1cnJlbnRJbmRleCA9IHN0YXRlLmFsbENhcmRzLmxlbmd0aCAtIDE7XG5cbiAgICAvLyBVcGRhdGUgdGhlIGRpc3BsYXkgYmFzZWQgb24gdGhlIG1ldGhvZCBzdG9yZWQgaW4gdGhlIHN0YXRlXG4gICAgcmVzdWx0c1ZpZXcudXBkYXRlRGlzcGxheShzdGF0ZSk7XG5cbiAgICAvLyBVcGRhdGUgdGhlIGRpc3BsYXkgYmFyXG4gICAgcmVzdWx0c1ZpZXcudXBkYXRlRGlzcGxheUJhcihzdGF0ZSk7XG5cbiAgICAvLyBEaXNhYmxlIHRoZSBuZXh0IGFuZCBsYXN0IHBhZ2UgYnV0dG9uc1xuICAgIHJlc3VsdHNWaWV3LmRpc2FibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UubmV4dFBhZ2VCdG4oKSk7XG4gICAgcmVzdWx0c1ZpZXcuZGlzYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5sYXN0UGFnZUJ0bik7XG5cbiAgICAvLyBFbmFibGUgdGhlIHByZXZpb3VzIGFuZCBmaXJzdCBwYWdlIGJ1dHRvbnNcbiAgICByZXN1bHRzVmlldy5lbmFibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UucHJldmlvdXNQYWdlQnRuKCkpO1xuICAgIHJlc3VsdHNWaWV3LmVuYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5maXJzdFBhZ2VCdG4pO1xuICB9O1xuXG4gIC8vIEV2ZW50IGxpc3RlbmVyIGZvciB0aGUgcHJldmlvdXMgcGFnZSBidXR0b25cbiAgZWxlbWVudHMucmVzdWx0c1BhZ2UucHJldmlvdXNQYWdlQnRuKCkub25jbGljayA9ICgpID0+IHtcbiAgICAvLyBVcGRhdGUgdGhlIGluZGV4XG4gICAgc3RhdGUuY3VycmVudEluZGV4LS07XG5cbiAgICAvLyBVcGRhdGUgdGhlIGRpc3BsYXkgYmFzZWQgb24gdGhlIG1ldGhvZCBzdG9yZWQgaW4gdGhlIHN0YXRlXG4gICAgcmVzdWx0c1ZpZXcudXBkYXRlRGlzcGxheShzdGF0ZSk7XG5cbiAgICAvLyBVcGRhdGUgdGhlIGRpc3BsYXkgYmFyXG4gICAgcmVzdWx0c1ZpZXcudXBkYXRlRGlzcGxheUJhcihzdGF0ZSk7XG5cbiAgICAvLyBJZiBvbiB0aGUgZmlyc3QgcGFnZSwgZGlzYWJsZSB0aGUgcHJldmlvdXMgYW5kIGZpcnN0IHBhZ2UgYnV0dG9uc1xuICAgIGlmIChzdGF0ZS5jdXJyZW50SW5kZXggPT09IDApIHtcbiAgICAgIHJlc3VsdHNWaWV3LmRpc2FibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UucHJldmlvdXNQYWdlQnRuKCkpO1xuICAgICAgcmVzdWx0c1ZpZXcuZGlzYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5maXJzdFBhZ2VCdG4pO1xuICAgIH1cblxuICAgIC8vIEVuYWJsZSB0aGUgbmV4dCBhbmQgbGFzdCBwYWdlIGJ1dHRvbnMuIFRoZSBsYXN0IHBhZ2UgYnV0dG9uIHNob3VsZCBvbmx5IGJlXG4gICAgLy8gZW5hYmxlZCBpZiBhbGwgcmVzdWx0cyBoYXZlIGJlZW4gbG9hZGVkXG4gICAgcmVzdWx0c1ZpZXcuZW5hYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLm5leHRQYWdlQnRuKCkpO1xuICAgIGlmIChzdGF0ZS5hbGxSZXN1bHRzTG9hZGVkKVxuICAgICAgcmVzdWx0c1ZpZXcuZW5hYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLmxhc3RQYWdlQnRuKTtcbiAgfTtcblxuICAvLyBFdmVudCBsaXN0ZW5lciBmb3IgdGhlIGZpcnN0IHBhZ2UgYnRuXG4gIGVsZW1lbnRzLnJlc3VsdHNQYWdlLmZpcnN0UGFnZUJ0bi5vbmNsaWNrID0gKCkgPT4ge1xuICAgIC8vIFVwZGF0ZSB0aGUgaW5kZXhcbiAgICBzdGF0ZS5jdXJyZW50SW5kZXggPSAwO1xuXG4gICAgLy8gVXBkYXRlIHRoZSBkaXNwbGF5IGJhc2VkIG9uIHRoZSBtZXRob2Qgc3RvcmVkIGluIHRoZSBzdGF0ZVxuICAgIHJlc3VsdHNWaWV3LnVwZGF0ZURpc3BsYXkoc3RhdGUpO1xuXG4gICAgLy8gVXBkYXRlIHRoZSBkaXNwbGF5IGJhclxuICAgIHJlc3VsdHNWaWV3LnVwZGF0ZURpc3BsYXlCYXIoc3RhdGUpO1xuXG4gICAgLy8gRGlzYWJsZSB0aGUgcHJldmlvdXMgYW5kIGZpcnN0IHBhZ2UgYnV0dG9uc1xuICAgIHJlc3VsdHNWaWV3LmRpc2FibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UucHJldmlvdXNQYWdlQnRuKCkpO1xuICAgIHJlc3VsdHNWaWV3LmRpc2FibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UuZmlyc3RQYWdlQnRuKTtcblxuICAgIC8vIEVuYWJsZSB0aGUgbmV4dCBhbmQgbGFzdCBwYWdlIGJ1dHRvbnMuIFRoZSBsYXN0IHBhZ2UgYnV0dG9uIHNob3VsZCBvbmx5IGJlXG4gICAgLy8gZW5hYmxlZCBpZiBhbGwgcmVzdWx0cyBoYXZlIGJlZW4gbG9hZGVkXG4gICAgcmVzdWx0c1ZpZXcuZW5hYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLm5leHRQYWdlQnRuKCkpO1xuICAgIGlmIChzdGF0ZS5hbGxSZXN1bHRzTG9hZGVkKVxuICAgICAgcmVzdWx0c1ZpZXcuZW5hYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLmxhc3RQYWdlQnRuKTtcbiAgfTtcblxuICB3aW5kb3cub25wb3BzdGF0ZSA9IChlKSA9PiB7XG4gICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBgL3NlYXJjaGA7XG4gIH07XG5cbiAgLy8gTW9iaWxlIGRpc3BsYXkgbWVudVxuICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1tb2JpbGUtZGlzcGxheS1vcHRpb25zJykpIHtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tbW9iaWxlLWRpc3BsYXktb3B0aW9ucycpXG4gICAgICAuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLW1vYmlsZS1kaXNwbGF5LW1lbnUnKS5zdHlsZS5kaXNwbGF5ID09PVxuICAgICAgICAgICdmbGV4J1xuICAgICAgICApIHtcbiAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLW1vYmlsZS1kaXNwbGF5LW1lbnUnKS5zdHlsZS5kaXNwbGF5ID1cbiAgICAgICAgICAgICdub25lJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLW1vYmlsZS1kaXNwbGF5LW1lbnUnKS5zdHlsZS5kaXNwbGF5ID1cbiAgICAgICAgICAgICdmbGV4JztcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cbn1cblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKiBDYXJkIFBhZ2UgKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuaWYgKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zdWJzdHJpbmcoMSwgNSkgPT09ICdjYXJkJykge1xuICBjYXJkVmlldy5pbnNlcnRNYW5hQ29zdFRvQ2FyZFRleHRUaXRsZSgpO1xuICBjYXJkVmlldy5pbnNlcnRNYW5hQ29zdFRvT3JhY2xlVGV4dCgpO1xuICBjYXJkVmlldy5yZW1vdmVVbmRlclNjb3JlRnJvbUxlZ2FsU3RhdHVzKCk7XG4gIGNhcmRWaWV3LmZpeENhcmRQcmljZXMoKTtcbiAgY2FyZFZpZXcuc2V0UHJpbnRMaW5rSHJlZigpO1xuICBjYXJkVmlldy5wcmludExpc3RIb3ZlckV2ZW50cygpO1xuICBjYXJkVmlldy5zaG9ydGVuQ2FyZE5hbWUoKTtcblxuICAvLyBJZiB0aGUgdHJhbnNmb3JtIGJ0biBpcyBvbiB0aGUgZG9tIChpZiB0aGUgY2FyZCBpcyBkb3VibGUgc2lkZWQpIHNldFxuICAvLyB0aGUgZXZlbnQgbGlzdGVuZXIgZm9yIHRoZSBjYXJkIHRvIGJlIGZsaXBwZWQgYmFjayBhbmQgZm9ydGhcbiAgaWYgKGVsZW1lbnRzLmNhcmQudHJhbnNmb3JtQnRuKSB7XG4gICAgZWxlbWVudHMuY2FyZC50cmFuc2Zvcm1CdG4uYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICdjbGljaycsXG4gICAgICBjYXJkVmlldy5mbGlwVG9CYWNrU2lkZVxuICAgICk7XG4gIH1cblxuICBkb2N1bWVudFxuICAgIC5xdWVyeVNlbGVjdG9yKCcuanMtLWFkZC10by1pbnYtc3VibWl0JylcbiAgICAuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjYXJkVmlldy5jaGVja1ByaWNlSW5wdXRGb3JEaWdpdHMpO1xufVxuXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbi8vICoqKioqKiogSW52ZW50b3J5IFBhZ2UgKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG5pZiAod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLmVuZHNXaXRoKCdpbnZlbnRvcnknKSkge1xuICBkb2N1bWVudC5ib2R5LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcjZjVmNmY3JztcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAnRE9NQ29udGVudExvYWRlZCcsXG4gICAgaW52ZW50b3J5Vmlldy5hbHRlckludmVudG9yeVRhYmxlXG4gICk7XG59XG5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuLy8gKioqKiBJbnZlbnRvcnkgU2VhcmNoIFBhZ2UgKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbmlmICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3Vic3RyaW5nKDEsIDE3KSA9PT0gJ2ludmVudG9yeS9zZWFyY2gnKSB7XG4gIGRvY3VtZW50LmJvZHkuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJyNmZGZkZmQnO1xuXG4gIGRvY3VtZW50XG4gICAgLnF1ZXJ5U2VsZWN0b3IoJy5qcy0taW52LXNlYXJjaC1idG4nKVxuICAgIC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGludlNlYXJjaC5jaGVja1ByaWNlSW5wdXRGb3JEaWdpdHMpO1xuXG4gIGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlTGluZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAvLyBEaXNwbGF5IHRoZSBkcm9wZG93blxuICAgIHNlYXJjaFZpZXcuc2hvd1R5cGVzRHJvcERvd24oKTtcbiAgICBpbnZTZWFyY2guc3RhcnRUeXBlc0Ryb3BEb3duTmF2aWdhdGlvbigpO1xuXG4gICAgLy8gU3RhcnQgYW4gZXZlbnQgbGlzdGVuZXIgb24gdGhlIGRvY3VtZW50LiBUaGlzIHdpbGwgY2xvc2UgdGhlIGRyb3Bkb3duIGlmIHRoZSB1c2VyIGNsaWNrc1xuICAgIC8vIG91dHNpZGUgb2YgdGhlIGlucHV0IG9yIGRyb3Bkb3duLiBUaGlzIHdpbGwgYWxzbyBjYW5jZWwgdGhlIGV2ZW50IGxpc3RlbmVyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBpbnZTZWFyY2gudHlwZUxpbmVMaXN0ZW5lcik7XG4gIH0pO1xuXG4gIGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlTGluZS5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsICgpID0+IHtcbiAgICBpZiAoZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVEcm9wRG93bi5oYXNBdHRyaWJ1dGUoJ2hpZGRlbicpKSB7XG4gICAgICBzZWFyY2hWaWV3LnNob3dUeXBlc0Ryb3BEb3duKCk7XG4gICAgfVxuXG4gICAgc2VhcmNoVmlldy5maWx0ZXJUeXBlcyhlbGVtZW50cy5hcGlTZWFyY2gudHlwZUxpbmUudmFsdWUpO1xuICAgIHNlYXJjaFZpZXcuZmlsdGVyVHlwZUhlYWRlcnMoKTtcbiAgICBpbnZTZWFyY2guc3RhcnRUeXBlc0Ryb3BEb3duTmF2aWdhdGlvbigpO1xuICB9KTtcblxuICBlbGVtZW50cy5hcGlTZWFyY2guc2V0SW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgLy8gRGlzcGxheSB0aGUgZHJvcGRvd25cbiAgICBzZWFyY2hWaWV3LnNob3dTZXRzRHJvcERvd24oKTtcbiAgICBpbnZTZWFyY2guc3RhcnRTZXRzRHJvcERvd25OYXZpZ2F0aW9uKCk7XG5cbiAgICAvLyBTdGFydCBhbiBldmVudCBsaXN0ZW5lciBvbiB0aGUgZG9jdW1lbnQuIFRoaXMgd2lsbCBjbG9zZSB0aGUgZHJvcGRvd24gaWYgdGhlIHVzZXIgY2xpY2tzXG4gICAgLy8gb3V0c2lkZSBvZiB0aGUgaW5wdXQgb3IgZHJvcGRvd24uIFRoaXMgd2lsbCBhbHNvIGNhbmNlbCB0aGUgZXZlbnQgbGlzdGVuZXJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGludlNlYXJjaC5zZXRJbnB1dExpc3RlbmVyKTtcbiAgfSk7XG5cbiAgZWxlbWVudHMuYXBpU2VhcmNoLnNldElucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xuICAgIGlmIChlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd24uaGFzQXR0cmlidXRlKCdoaWRkZW4nKSkge1xuICAgICAgc2VhcmNoVmlldy5zaG93U2V0c0Ryb3BEb3duKCk7XG4gICAgfVxuXG4gICAgc2VhcmNoVmlldy5maWx0ZXJTZXRzKGVsZW1lbnRzLmFwaVNlYXJjaC5zZXRJbnB1dC52YWx1ZSk7XG4gICAgc2VhcmNoVmlldy5maWx0ZXJTZXRIZWFkZXJzKCk7XG4gICAgaW52U2VhcmNoLnN0YXJ0U2V0c0Ryb3BEb3duTmF2aWdhdGlvbigpO1xuICB9KTtcbn1cblxuaWYgKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5pbmNsdWRlcygnL2NhcmQnKSkge1xuICBkb2N1bWVudC5ib2R5LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcjZjVmNmY3Jztcbn1cblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKiogTW9iaWxlIE5hdiBCdXR0b24gKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuXG5pZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1uYXYtaGFtYnVyZ2VyJykpIHtcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1uYXYtaGFtYnVyZ2VyJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tbW9iaWxlLWxpbmtzJykuc3R5bGUuZGlzcGxheSA9PT0gJ2ZsZXgnKSB7XG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLW1vYmlsZS1saW5rcycpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tbW9iaWxlLWxpbmtzJykuc3R5bGUuZGlzcGxheSA9ICdmbGV4JztcbiAgICB9XG4gIH0pO1xufVxuIiwiaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJztcblxuaW1wb3J0IHsgZWxlbWVudHMgfSBmcm9tICcuLi92aWV3cy9iYXNlJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2VhcmNoIHtcbiAgc2VhcmNoQnlOYW1lKCkge1xuICAgIGxldCBjYXJkTmFtZSA9IGVsZW1lbnRzLmFwaVNlYXJjaC5jYXJkTmFtZS52YWx1ZTtcbiAgICBjYXJkTmFtZSA9IGNhcmROYW1lLnJlcGxhY2UoJyAnLCAnKycpO1xuXG4gICAgaWYgKGNhcmROYW1lKSB0aGlzLnNlYXJjaCArPSBjYXJkTmFtZTtcbiAgfVxuXG4gIHNlYXJjaEJ5T3RleHQoKSB7XG4gICAgY29uc3Qgb3JhY2xlVGV4dCA9IGVsZW1lbnRzLmFwaVNlYXJjaC5vcmFjbGVUZXh0LnZhbHVlO1xuXG4gICAgLy8gSWYgdGhlIG9yYWNsZSB0ZXh0IGluY2x1ZGVzIG1vcmUgdGhhbiBvbmUgd29yZCwgd2UgbmVlZCB0byBzZWFyY2ggdGhlIHRlcm1zIGluZGl2aWR1YWxseVxuICAgIGlmIChcbiAgICAgIG9yYWNsZVRleHQuaW5jbHVkZXMoJyAnKSAmJlxuICAgICAgb3JhY2xlVGV4dC5pbmRleE9mKCcgJykgIT09IG9yYWNsZVRleHQubGVuZ3RoIC0gMVxuICAgICkge1xuICAgICAgbGV0IHRlbXBvcmFyeVN0ciA9ICcnO1xuICAgICAgY29uc3QgdGV4dHMgPSBvcmFjbGVUZXh0LnNwbGl0KCcgJyk7XG5cbiAgICAgIHRleHRzLmZvckVhY2goKHRleHQpID0+IHtcbiAgICAgICAgaWYgKHRleHQubGVuZ3RoID4gMCkgdGVtcG9yYXJ5U3RyICs9IGBvcmFjbGUlM0Eke3RleHR9K2A7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5zZWFyY2ggKz0gYCslMjgke3RlbXBvcmFyeVN0ci5zbGljZSgwLCAtMSl9JTI5YDtcbiAgICB9IGVsc2UgaWYgKG9yYWNsZVRleHQpIHRoaXMuc2VhcmNoICs9IGArb3JhY2xlJTNBJHtvcmFjbGVUZXh0fWA7XG4gIH1cblxuICBzZWFyY2hCeUNhcmRUeXBlKCkge1xuICAgIGNvbnN0IHR5cGVzVG9JbmNsdWRlID0gQXJyYXkuZnJvbShcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWluY2x1ZGUtdHlwZV0nKVxuICAgICk7XG4gICAgY29uc3QgdHlwZXNUb0V4Y2x1ZGUgPSBBcnJheS5mcm9tKFxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZXhjbHVkZS10eXBlXScpXG4gICAgKTtcbiAgICBjb25zdCBpbmNsdWRlUGFydGlhbFR5cGVzID0gZWxlbWVudHMuYXBpU2VhcmNoLmluY2x1ZGVQYXJ0aWFsVHlwZXMuY2hlY2tlZDtcbiAgICBsZXQgdGVtcG9yYXJ5U3RyID0gJyc7XG5cbiAgICBpZiAodHlwZXNUb0luY2x1ZGUgJiYgIWluY2x1ZGVQYXJ0aWFsVHlwZXMpIHtcbiAgICAgIHR5cGVzVG9JbmNsdWRlLmZvckVhY2goKHR5cGUpID0+IHtcbiAgICAgICAgdGhpcy5zZWFyY2ggKz0gYCt0eXBlJTNBJHt0eXBlLmdldEF0dHJpYnV0ZSgnZGF0YS1pbmNsdWRlLXR5cGUnKX1gO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVzVG9JbmNsdWRlLmxlbmd0aCA+IDAgJiYgaW5jbHVkZVBhcnRpYWxUeXBlcykge1xuICAgICAgdHlwZXNUb0luY2x1ZGUuZm9yRWFjaCgodHlwZSkgPT4ge1xuICAgICAgICB0ZW1wb3JhcnlTdHIgKz0gYHR5cGUlM0Eke3R5cGUuZ2V0QXR0cmlidXRlKCdkYXRhLWluY2x1ZGUtdHlwZScpfStPUitgO1xuICAgICAgfSk7XG5cbiAgICAgIHRlbXBvcmFyeVN0ciA9IHRlbXBvcmFyeVN0ci5zbGljZSgwLCAtNCk7XG4gICAgICB0aGlzLnNlYXJjaCArPSBgKyUyOCR7dGVtcG9yYXJ5U3RyfSUyOWA7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVzVG9FeGNsdWRlKSB7XG4gICAgICB0eXBlc1RvRXhjbHVkZS5mb3JFYWNoKCh0eXBlKSA9PiB7XG4gICAgICAgIHRoaXMuc2VhcmNoICs9IGArLXR5cGUlM0Eke3R5cGUuZ2V0QXR0cmlidXRlKCdkYXRhLWV4Y2x1ZGUtdHlwZScpfWA7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBzZWFyY2hCeUNvbG9yKCkge1xuICAgIGxldCBib3hlcyA9IGVsZW1lbnRzLmFwaVNlYXJjaC5jb2xvckJveGVzO1xuXG4gICAgLy8gTG9vcCB0aHJvdWdoIGNoZWNrYm94ZXMgdG8gZ2V0IGFsbCBjb2xvcnMgZ2l2ZW5cbiAgICB2YXIgY29sb3JzID0gJyc7XG4gICAgYm94ZXMuZm9yRWFjaCgoYm94KSA9PiB7XG4gICAgICBpZiAoYm94LmNoZWNrZWQpIGNvbG9ycyArPSBib3gudmFsdWU7XG4gICAgfSk7XG5cbiAgICBjb25zdCBzb3J0QnkgPSBlbGVtZW50cy5hcGlTZWFyY2guY29sb3JTb3J0QnkudmFsdWU7XG5cbiAgICBpZiAoY29sb3JzKSB0aGlzLnNlYXJjaCArPSBgK2NvbG9yJHtzb3J0Qnl9JHtjb2xvcnN9YDtcbiAgfVxuXG4gIHNlYXJjaEJ5U3RhdHMoKSB7XG4gICAgY29uc3Qgc3RhdExpbmVzID0gQXJyYXkuZnJvbShcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tYXBpLXN0YXRzLXdyYXBwZXInKVxuICAgICk7XG5cbiAgICBzdGF0TGluZXMuZm9yRWFjaCgobGluZSkgPT4ge1xuICAgICAgY29uc3Qgc3RhdCA9IGxpbmUucXVlcnlTZWxlY3RvcignLmpzLS1hcGktc3RhdCcpLnZhbHVlO1xuICAgICAgY29uc3Qgc29ydEJ5ID0gbGluZS5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1zdGF0LWZpbHRlcicpLnZhbHVlO1xuICAgICAgY29uc3Qgc29ydFZhbHVlID0gbGluZS5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1zdGF0LXZhbHVlJykudmFsdWU7XG5cbiAgICAgIGlmIChzdGF0ICYmIHNvcnRCeSAmJiBzb3J0VmFsdWUpIHtcbiAgICAgICAgdGhpcy5zZWFyY2ggKz0gYCske3N0YXR9JHtzb3J0Qnl9JHtzb3J0VmFsdWV9YDtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHNlYXJjaEJ5Rm9ybWF0KCkge1xuICAgIGNvbnN0IGZvcm1hdExpbmVzID0gQXJyYXkuZnJvbShcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tYXBpLWZvcm1hdC13cmFwcGVyJylcbiAgICApO1xuXG4gICAgZm9ybWF0TGluZXMuZm9yRWFjaCgobGluZSkgPT4ge1xuICAgICAgY29uc3Qgc3RhdHVzID0gbGluZS5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1sZWdhbC1zdGF0dXMnKS52YWx1ZTtcbiAgICAgIGNvbnN0IGZvcm1hdCA9IGxpbmUucXVlcnlTZWxlY3RvcignLmpzLS1hcGktZm9ybWF0JykudmFsdWU7XG5cbiAgICAgIGlmIChmb3JtYXQgJiYgc3RhdHVzKSB0aGlzLnNlYXJjaCArPSBgKyR7c3RhdHVzfSUzQSR7Zm9ybWF0fWA7XG4gICAgfSk7XG4gIH1cblxuICBzZWFyY2hCeVNldCgpIHtcbiAgICBjb25zdCBzZXRzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1pbmNsdWRlLXNldF0nKSk7XG4gICAgbGV0IHRlbXBvcmFyeVN0ciA9ICcnO1xuXG4gICAgaWYgKHNldHMubGVuZ3RoID4gMCkge1xuICAgICAgc2V0cy5mb3JFYWNoKFxuICAgICAgICAocykgPT5cbiAgICAgICAgICAodGVtcG9yYXJ5U3RyICs9IGBzZXQlM0Eke3MuZ2V0QXR0cmlidXRlKCdkYXRhLWluY2x1ZGUtc2V0Jyl9K09SK2ApXG4gICAgICApO1xuXG4gICAgICB0ZW1wb3JhcnlTdHIgPSB0ZW1wb3JhcnlTdHIuc2xpY2UoMCwgLTQpO1xuICAgICAgdGhpcy5zZWFyY2ggKz0gYCslMjgke3RlbXBvcmFyeVN0cn0lMjlgO1xuICAgIH1cbiAgfVxuXG4gIHNlYXJjaEJ5UmFyaXR5KCkge1xuICAgIGNvbnN0IGJveGVzID0gZWxlbWVudHMuYXBpU2VhcmNoLnJhcml0eUJveGVzO1xuICAgIHZhciB2YWx1ZXMgPSBbXTtcbiAgICBsZXQgdGVtcG9yYXJ5U3RyID0gJyc7XG5cbiAgICAvLyBQdXNoIGFsbCByYXJpdGllcyBnaXZlbiBieSB0aGUgdXNlciBpbnRvIHRoZSB2YWx1ZXMgYXJyYXlcbiAgICBib3hlcy5mb3JFYWNoKChib3gpID0+IHtcbiAgICAgIGlmIChib3guY2hlY2tlZCkgdmFsdWVzLnB1c2goYm94LnZhbHVlKTtcbiAgICB9KTtcblxuICAgIGlmICh2YWx1ZXMubGVuZ3RoID4gMCkge1xuICAgICAgLy8gV2UgbmVlZCBhIHN0YXJ0ZXIgc3RyaW5nIHNvIHdlIGNhbiBzbGljZSBpdCBsYXRlciAlMjggaXMgYW4gb3BlbiBwYXJlbnRoZXNlc1xuICAgICAgdGVtcG9yYXJ5U3RyICs9ICclMjgnO1xuXG4gICAgICAvLyBGb3IgZXZlcnkgdmFsdWUgZ2l2ZW4gYnkgdGhlIHVzZXIgd2UgbmVlZCB0byBhZGQgdGhlICtPUitcbiAgICAgIC8vIHRvIHRoZSBlbmQgZm9yIGdyb3VwaW5nLiBXZSB3aWxsIHJlbW92ZSB0aGUgK09SKyBmcm9tIHRoZSBsYXN0XG4gICAgICAvLyBpdGVyYXRpb24gb2YgdGhlIGxvb3BcbiAgICAgIHZhbHVlcy5mb3JFYWNoKCh2YWx1ZSkgPT4gKHRlbXBvcmFyeVN0ciArPSBgcmFyaXR5JTNBJHt2YWx1ZX0rT1IrYCkpO1xuXG4gICAgICAvLyBSZW1vdmUgdGhlIHVubmVjZXNzYXJ5ICtPUisgYXQgdGhlIGVuZFxuICAgICAgdGVtcG9yYXJ5U3RyID0gdGVtcG9yYXJ5U3RyLnNsaWNlKDAsIC00KTtcblxuICAgICAgLy8gQ2xvc2UgdGhlIHBhcmVudGhlc2VzXG4gICAgICB0ZW1wb3JhcnlTdHIgKz0gYCUyOWA7XG5cbiAgICAgIHRoaXMuc2VhcmNoICs9IGArJHt0ZW1wb3JhcnlTdHJ9YDtcbiAgICB9XG4gIH1cblxuICBzZWFyY2hCeUNvc3QoKSB7XG4gICAgY29uc3QgZGVub21pbmF0aW9uID0gZWxlbWVudHMuYXBpU2VhcmNoLmRlbm9taW5hdGlvbi52YWx1ZTtcbiAgICBjb25zdCBzb3J0QnkgPSBlbGVtZW50cy5hcGlTZWFyY2guZGVub21pbmF0aW9uU29ydEJ5LnZhbHVlO1xuICAgIGNvbnN0IGlucHV0VmFsID0gZWxlbWVudHMuYXBpU2VhcmNoLmRlbm9taW5hdGlvblNvcnRWYWx1ZS52YWx1ZTtcblxuICAgIGlmIChpbnB1dFZhbCkgdGhpcy5zZWFyY2ggKz0gYCske2Rlbm9taW5hdGlvbn0ke3NvcnRCeX0ke2lucHV0VmFsfWA7XG4gIH1cblxuICBxdWlja1NlYXJjaCgpIHtcbiAgICBsZXQgY2FyZE5hbWUgPSBlbGVtZW50cy5uYXYuc2VhcmNoSW5wdXQudmFsdWU7XG4gICAgY2FyZE5hbWUgPSBjYXJkTmFtZS5yZXBsYWNlKCcgJywgJysnKTtcbiAgICByZXR1cm4gY2FyZE5hbWU7XG4gIH1cblxuICBzb3J0UmVzdWx0cygpIHtcbiAgICBjb25zdCBzb3J0QnkgPSBlbGVtZW50cy5hcGlTZWFyY2guY2FyZFNvcnRlci52YWx1ZTtcbiAgICB0aGlzLnNlYXJjaCArPSBgJm9yZGVyPSR7c29ydEJ5fWA7XG4gIH1cblxuICAvLyBUaGlzIG1ldGhvZCB3aWxsIHJ1biBlYWNoIG9mIHRoZSBpbmRpdmlkdWFsIHNlYXJjaCBtZXRob2RzIHRvIGJ1aWxkIHRoZSBmaW5hbCBzZWFyY2ggcXVlcnlcbiAgYnVpbGRTZWFyY2hRdWVyeSgpIHtcbiAgICB0aGlzLnNlYXJjaEJ5TmFtZSgpO1xuICAgIHRoaXMuc2VhcmNoQnlPdGV4dCgpO1xuICAgIHRoaXMuc2VhcmNoQnlDYXJkVHlwZSgpO1xuICAgIHRoaXMuc2VhcmNoQnlDb2xvcigpO1xuICAgIHRoaXMuc2VhcmNoQnlTdGF0cygpO1xuICAgIHRoaXMuc2VhcmNoQnlGb3JtYXQoKTtcbiAgICB0aGlzLnNlYXJjaEJ5U2V0KCk7XG4gICAgdGhpcy5zZWFyY2hCeVJhcml0eSgpO1xuICAgIHRoaXMuc2VhcmNoQnlDb3N0KCk7XG4gICAgdGhpcy5zb3J0UmVzdWx0cygpO1xuXG4gICAgcmV0dXJuIHRoaXMuc2VhcmNoO1xuICB9XG5cbiAgcmVzZXRTZWFyY2hRdWVyeSgpIHtcbiAgICB0aGlzLnNlYXJjaCA9ICcnO1xuICB9XG5cbiAgZGlzcGxheU1ldGhvZCgpIHtcbiAgICByZXR1cm4gZWxlbWVudHMuYXBpU2VhcmNoLmRpc3BsYXlBcy52YWx1ZTtcbiAgfVxuXG4gIC8vIFJldHVucyB0aGUgZmlyc3QgcGFnZSBvZiBjYXJkc1xuICBhc3luYyBnZXRDYXJkcyhzdGF0ZSkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBheGlvc1xuICAgICAgICAuZ2V0KGBodHRwczovL2FwaS5zY3J5ZmFsbC5jb20vY2FyZHMvc2VhcmNoP3E9JHtzdGF0ZS5xdWVyeX1gKVxuICAgICAgICAudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgLy8gVXBkYXRlIHRoZSBzZWFyY2hcbiAgICAgICAgICB0aGlzLnJlc3VsdHMgPSByZXMuZGF0YTtcbiAgICAgICAgICB0aGlzLmNhcmRzID0gcmVzLmRhdGEuZGF0YTtcblxuICAgICAgICAgIC8vIFN0b3JlIHRoZSBjYXJkcyBpbiB0aGUgYWxsQ2FyZHMgYXJyYXlcbiAgICAgICAgICBzdGF0ZS5hbGxDYXJkcy5wdXNoKHJlcy5kYXRhLmRhdGEpO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICBpZiAoZXJyLnJlc3BvbnNlLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICAgICAgICBzdGF0ZS5hbGxDYXJkcy5wdXNoKDQwNCk7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFVzZWQgYnkgZ2V0QWxsQ2FyZHMgdG8gZ2V0IGVhY2ggYXJyYXkgb2YgMTc1IGNhcmRzXG4gIGFzeW5jIGxvb3BOZXh0UGFnZShzdGF0ZSwgZW5hYmxlQnRuKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGF4aW9zLmdldCh0aGlzLnJlc3VsdHMubmV4dF9wYWdlKS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgLy8gVXBkYXRlIHRoZSByZXN1bHRzIG9iamVjdFxuICAgICAgICB0aGlzLnJlc3VsdHMgPSByZXMuZGF0YTtcblxuICAgICAgICAvLyBQdXNoIHRoZSBjYXJkcyBmcm9tIHRoaXMgcmVzdWx0IGludG8gdGhlIGFsbENhcmRzIGFycmF5XG4gICAgICAgIHN0YXRlLmFsbENhcmRzLnB1c2gocmVzLmRhdGEuZGF0YSk7XG5cbiAgICAgICAgLy8gRW5hYmxlIHRoZSBuZXh0IHBhZ2UgYnRuIGFuZCByZXNvbHZlIHRoZSBwcm9taXNlXG4gICAgICAgIGVuYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5uZXh0UGFnZUJ0bigpKTtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvLyBXaWxsIHJ1biBpbiB0aGUgYmFja2dyb3VuZCBhZnRlciB0aGUgZmlyc3Qgc2V0IG9mIGNhcmRzIGlzIHJldHJpZXZlZCB0byBtYWtlIG1vdmluZyBiZXR3ZWVuIHJlc3VsdHNcbiAgLy8gcGFnZXMgZmFzdGVyXG4gIGFzeW5jIGdldEFsbENhcmRzKHN0YXRlLCBlbmFibGVCdG4pIHtcbiAgICAvLyBBcyBsb25nIGFzIHRoZXJlIGlzIGEgbmV4dF9wYWdlIGtlZXAgbG9hZGluZyB0aGUgY2FyZHNcbiAgICB3aGlsZSAodGhpcy5yZXN1bHRzLm5leHRfcGFnZSkgYXdhaXQgdGhpcy5sb29wTmV4dFBhZ2Uoc3RhdGUsIGVuYWJsZUJ0bik7XG5cbiAgICAvLyBVcGRhdGUgdGhlIHN0YXRlIG9uY2UgYWxsIGNhcmRzIGhhdmUgYmVlbiByZXRyZWlldmVkXG4gICAgc3RhdGUuYWxsUmVzdWx0c0xvYWRlZCA9IHRydWU7XG5cbiAgICAvLyBJZiB0aGVyZSBpcyBhdCBsZWFzdCAyIHBhZ2VzIG9mIGNhcmRzLCBlbmFibGUgdGhlIGxhc3QgcGFnZSBidG4uXG4gICAgaWYgKHN0YXRlLmFsbENhcmRzLmxlbmd0aCA+IDEpIGVuYWJsZUJ0bihlbGVtZW50cy5yZXN1bHRzUGFnZS5sYXN0UGFnZUJ0bik7XG4gIH1cbn1cbiIsImV4cG9ydCBjb25zdCBlbGVtZW50cyA9IHtcbiAgbmF2OiB7XG4gICAgcXVpY2tTZWFyY2hCdG46IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tbmF2LXNlYXJjaCcpLFxuICAgIHNlYXJjaElucHV0OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLW5hdi1zZWFyY2gtaW5wdXQnKSxcbiAgfSxcbiAgYXBpU2VhcmNoOiB7XG4gICAgY2FyZE5hbWU6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLWNhcmQtbmFtZScpLFxuICAgIG9yYWNsZVRleHQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLW8tdGV4dCcpLFxuICAgIHR5cGVMaW5lOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS10eXBlLWxpbmUnKSxcbiAgICBzZWxlY3RlZFR5cGVzOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1zZWxlY3RlZC10eXBlcycpLFxuICAgIGluY2x1ZGVQYXJ0aWFsVHlwZXM6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXR5cGUtYm94JyksXG4gICAgdHlwZURyb3BEb3duOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS10eXBlcy1kcm9wZG93bicpLFxuICAgIGNvbG9yQm94ZXM6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tYXBpLWNvbG9yLWJveCcpLFxuICAgIGNvbG9yU29ydEJ5OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1jb2xvci1zb3J0ZXInKSxcbiAgICBzdGF0OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1zdGF0JyksXG4gICAgc3RhdEZpbHRlcjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktc3RhdC1maWx0ZXInKSxcbiAgICBzdGF0VmFsdWU6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXN0YXQtdmFsdWUnKSxcbiAgICBsZWdhbFN0YXR1czogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktbGVnYWwtc3RhdHVzJyksXG4gICAgZm9ybWF0OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1mb3JtYXQnKSxcbiAgICBzZXRJbnB1dDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktc2V0JyksXG4gICAgc2V0RHJvcERvd246IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXNldC1kcm9wZG93bicpLFxuICAgIHNlbGVjdGVkU2V0czogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktc2VsZWN0ZWQtc2V0cycpLFxuICAgIGJsb2NrOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1ibG9jaycpLFxuICAgIHJhcml0eUJveGVzOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWFwaS1yYXJpdHktYm94JyksXG4gICAgZGVub21pbmF0aW9uOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1kZW5vbWluYXRpb24nKSxcbiAgICBkZW5vbWluYXRpb25Tb3J0Qnk6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLWRlbm9taW5hdGlvbi1zb3J0LWJ5JyksXG4gICAgZGVub21pbmF0aW9uU29ydFZhbHVlOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgJy5qcy0tYXBpLWRlbm9taW5hdGlvbi1zb3J0LXZhbHVlJ1xuICAgICksXG4gICAgY2FyZFNvcnRlcjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktcmVzdWx0cy1zb3J0ZXInKSxcbiAgICBkaXNwbGF5QXM6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXNlYXJjaC1kaXNwbGF5LXNlbGVjdG9yJyksXG4gICAgc3VibWl0QnRuOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1idG4nKSxcbiAgfSxcbiAgcmVzdWx0c1BhZ2U6IHtcbiAgICByZXN1bHRzQ29udGFpbmVyOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1yZXN1bHRzLWRpc3BsYXknKSxcbiAgICBkaXNwbGF5U2VsZWN0b3I6ICgpID0+IHtcbiAgICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA8IDg1MSlcbiAgICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tcmVzdWx0cy1kaXNwbGF5LW9wdGlvbi1tb2JpbGUnKTtcbiAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXJlc3VsdHMtZGlzcGxheS1vcHRpb24nKTtcbiAgICB9LFxuICAgIHNvcnRCeTogKCkgPT4ge1xuICAgICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoIDwgODUxKVxuICAgICAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1yZXN1bHRzLXNvcnQtb3B0aW9ucy1tb2JpbGUnKTtcbiAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXJlc3VsdHMtc29ydC1vcHRpb25zJyk7XG4gICAgfSxcbiAgICBidG46ICgpID0+IHtcbiAgICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA8IDg1MSlcbiAgICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tcmVzdWx0cy1zdWJtaXQtYnRuLW1vYmlsZScpO1xuICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tcmVzdWx0cy1zdWJtaXQtYnRuJyk7XG4gICAgfSxcbiAgICBjYXJkQ2hlY2tsaXN0OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWNhcmQtY2hlY2tsaXN0JyksXG4gICAgaW1hZ2VHcmlkOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWltYWdlLWdyaWQnKSxcbiAgICBkaXNwbGF5QmFyOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1kaXNwbGF5LWJhcicpLFxuICAgIGZpcnN0UGFnZUJ0bjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktZmlyc3QtcGFnZScpLFxuICAgIGxhc3RQYWdlQnRuOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1sYXN0LXBhZ2UnKSxcbiAgICBwcmV2aW91c1BhZ2VCdG46ICgpID0+IHtcbiAgICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA8IDg1MSlcbiAgICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXByZXZpb3VzLXBhZ2UtbW9iaWxlJyk7XG4gICAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1hcGktcHJldmlvdXMtcGFnZScpO1xuICAgIH0sXG4gICAgbmV4dFBhZ2VCdG46ICgpID0+IHtcbiAgICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA8IDg1MSlcbiAgICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLW5leHQtcGFnZS1tb2JpbGUnKTtcbiAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1uZXh0LXBhZ2UnKTtcbiAgICB9LFxuICB9LFxuICBjYXJkOiB7XG4gICAgbWFuYUNvc3RUaXRsZVNwYW46IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tY2FyZC1tYW5hLWNvc3QnKSxcbiAgICBvcmFjbGVUZXh0czogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1vcmFjbGUtdGV4dC1saW5lJyksXG4gICAgbGVnYWxpdGllczogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1jYXJkLWxlZ2FsaXR5JyksXG4gICAgcHJpbnRSb3dzOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWNhcmQtcHJpbnQtcm93JyksXG4gICAgcHJpY2VzOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWNhcmQtcHJpY2UnKSxcbiAgICBjYXJkUHJpbnRMaW5rczogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1jYXJkLXByaW50LWxpbmsnKSxcbiAgICBmcm9udDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1mcm9udCcpLFxuICAgIGJhY2s6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYmFjaycpLFxuICAgIHRyYW5zZm9ybUJ0bjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1jYXJkLXRyYW5zZm9ybScpLFxuICB9LFxufTtcbiIsImltcG9ydCB7IGdlbmVyYXRlTWFuYUNvc3RJbWFnZXMgfSBmcm9tICcuL3Jlc3VsdHNWaWV3JztcbmltcG9ydCB7IGVsZW1lbnRzIH0gZnJvbSAnLi9iYXNlJztcblxuZXhwb3J0IGNvbnN0IGluc2VydE1hbmFDb3N0VG9DYXJkVGV4dFRpdGxlID0gKCkgPT4ge1xuICBjb25zdCBtYW5hQ29zdHMgPSBBcnJheS5mcm9tKGVsZW1lbnRzLmNhcmQubWFuYUNvc3RUaXRsZVNwYW4pO1xuXG4gIG1hbmFDb3N0cy5mb3JFYWNoKChjb3N0KSA9PiB7XG4gICAgY29zdC5pbm5lckhUTUwgPSBnZW5lcmF0ZU1hbmFDb3N0SW1hZ2VzKFxuICAgICAgY29zdC5nZXRBdHRyaWJ1dGUoJ2RhdGEtbWFuYS1jb3N0JylcbiAgICApO1xuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBpbnNlcnRNYW5hQ29zdFRvT3JhY2xlVGV4dCA9ICgpID0+IHtcbiAgY29uc3Qgb3JhY2xlVGV4dHMgPSBBcnJheS5mcm9tKGVsZW1lbnRzLmNhcmQub3JhY2xlVGV4dHMpO1xuXG4gIGlmIChvcmFjbGVUZXh0cy5sZW5ndGggPiAwKSB7XG4gICAgb3JhY2xlVGV4dHMuZm9yRWFjaChcbiAgICAgICh0ZXh0KSA9PiAodGV4dC5pbm5lckhUTUwgPSBnZW5lcmF0ZU1hbmFDb3N0SW1hZ2VzKHRleHQuaW5uZXJIVE1MLCAneHMnKSlcbiAgICApO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgcmVtb3ZlVW5kZXJTY29yZUZyb21MZWdhbFN0YXR1cyA9ICgpID0+IHtcbiAgY29uc3QgbGVnYWxpdGllcyA9IEFycmF5LmZyb20oZWxlbWVudHMuY2FyZC5sZWdhbGl0aWVzKTtcblxuICBsZWdhbGl0aWVzLmZvckVhY2goKGxlZ2FsaXR5KSA9PiB7XG4gICAgaWYgKGxlZ2FsaXR5LmlubmVySFRNTC5pbmNsdWRlcygnXycpKSB7XG4gICAgICBsZWdhbGl0eS5pbm5lckhUTUwgPSBsZWdhbGl0eS5pbm5lckhUTUwucmVwbGFjZSgnXycsICcgJyk7XG4gICAgfVxuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBmaXhDYXJkUHJpY2VzID0gKCkgPT4ge1xuICBjb25zdCBwcmljZXMgPSBBcnJheS5mcm9tKGVsZW1lbnRzLmNhcmQucHJpY2VzKTtcblxuICBwcmljZXMuZm9yRWFjaCgocHJpY2UpID0+IHtcbiAgICBpZiAocHJpY2UuaW5uZXJIVE1MLmluY2x1ZGVzKCdOb25lJykpIHByaWNlLmlubmVySFRNTCA9ICctJztcbiAgfSk7XG59O1xuXG5jb25zdCBmaXhEb3VibGVTaWRlZENhcmROYW1lID0gKGNhcmROYW1lKSA9PiB7XG4gIGlmIChjYXJkTmFtZS5pbmNsdWRlcygnLycpKSB7XG4gICAgY2FyZE5hbWUgPSBjYXJkTmFtZS5zdWJzdHJpbmcoMCwgY2FyZE5hbWUuaW5kZXhPZignLycpIC0gMSk7XG4gIH1cbiAgcmV0dXJuIGNhcmROYW1lO1xufTtcblxuZXhwb3J0IGNvbnN0IHNldFByaW50TGlua0hyZWYgPSAoKSA9PiB7XG4gIGNvbnN0IGxpbmtzID0gQXJyYXkuZnJvbShlbGVtZW50cy5jYXJkLmNhcmRQcmludExpbmtzKTtcblxuICBsaW5rcy5mb3JFYWNoKChsaW5rKSA9PiB7XG4gICAgbGV0IGNhcmROYW1lID0gbGluay5nZXRBdHRyaWJ1dGUoJ2RhdGEtbmFtZScpLnJlcGxhY2VBbGwoJyAnLCAnLScpO1xuICAgIGNhcmROYW1lID0gZml4RG91YmxlU2lkZWRDYXJkTmFtZShjYXJkTmFtZSk7XG4gICAgY29uc3Qgc2V0Q29kZSA9IGxpbmsuZ2V0QXR0cmlidXRlKCdkYXRhLXNldCcpO1xuXG4gICAgbGluay5ocmVmID0gYC9jYXJkLyR7c2V0Q29kZX0vJHtjYXJkTmFtZX1gO1xuICB9KTtcbn07XG5cbmNvbnN0IHNldERvdWJsZVNpZGVkVHJhbnNpdGlvbiA9ICgpID0+IHtcbiAgLy8gQ2hlY2tzIHRvIHNlZSBpZiBhbiBpbmxpbmUgc3R5bGUgaGFzIGJlZW4gc2V0IGZvciB0aGUgZnJvbnQgb2YgdGhlIGNhcmQuXG4gIC8vIElmIG5vdCwgc2V0IGEgdHJhbnNpdG9uLiBUaGlzIG1ha2VzIHN1cmUgd2UgZG9uJ3Qgc2V0IHRoZSB0cmFuc2l0b24gZXZlcnlcbiAgLy8gdGltZSB0aGUgY2FyZCBpcyBmbGlwcGVkLlxuXG4gIGlmICghZWxlbWVudHMuY2FyZC5mcm9udC5nZXRBdHRyaWJ1dGUoJ3N0eWxlJykpIHtcbiAgICBlbGVtZW50cy5jYXJkLmZyb250LnN0eWxlLnRyYW5zaXRpb24gPSBgYWxsIC44cyBlYXNlYDtcbiAgICBlbGVtZW50cy5jYXJkLmJhY2suc3R5bGUudHJhbnNpdGlvbiA9IGBhbGwgLjhzIGVhc2VgO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgZmxpcFRvQmFja1NpZGUgPSAoKSA9PiB7XG4gIC8vIFNldHMgdGhlIHRyYW5zaXRpb24gcHJvcGVydHkgb24gYm90aCBzaWRlcyBvZiB0aGUgY2FyZCB0aGUgZmlyc3QgdGltZSB0aGVcbiAgLy8gdHJhbnNmb3JtIGJ1dHRvbiBpcyBjbGlja2VkXG4gIHNldERvdWJsZVNpZGVkVHJhbnNpdGlvbigpO1xuXG4gIC8vIFJvdGF0ZXMgdGhlIGNhcmQgdG8gc2hvdyB0aGUgYmFja3NpZGUuXG4gIGVsZW1lbnRzLmNhcmQuZnJvbnQuc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZVkoLTE4MGRlZylgO1xuICBlbGVtZW50cy5jYXJkLmJhY2suc3R5bGUudHJhbnNmb3JtID0gYHJvdGF0ZVkoMClgO1xuXG4gIC8vIFJlc2V0IHRoZSBldmVudCBsaXN0ZW5lciBzbyB0aGF0IG9uIGNsaWNraW5nIHRoZSBidXR0b24gaXQgd2lsbCBmbGlwXG4gIC8vIGJhY2sgdG8gdGhlIGZyb250IG9mIHRoZSBjYXJkXG4gIGVsZW1lbnRzLmNhcmQudHJhbnNmb3JtQnRuLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZmxpcFRvQmFja1NpZGUpO1xuICBlbGVtZW50cy5jYXJkLnRyYW5zZm9ybUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZsaXBUb0Zyb250U2lkZSk7XG59O1xuXG5leHBvcnQgY29uc3QgZmxpcFRvRnJvbnRTaWRlID0gKCkgPT4ge1xuICBlbGVtZW50cy5jYXJkLmZyb250LnN0eWxlLnRyYW5zZm9ybSA9IGByb3RhdGVZKDApYDtcbiAgZWxlbWVudHMuY2FyZC5iYWNrLnN0eWxlLnRyYW5zZm9ybSA9IGByb3RhdGVZKDE4MGRlZylgO1xuXG4gIC8vIFJlc2V0IHRoZSBldmVudCBsaXN0ZW5lciBzbyB0aGF0IG9uIGNsaWNraW5nIHRoZSBidXR0b24gaXQgd2lsbCBmbGlwXG4gIC8vIHRvIHRoZSBiYWNrc2lkZSBvZiB0aGUgY2FyZFxuICBlbGVtZW50cy5jYXJkLnRyYW5zZm9ybUJ0bi5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIGZsaXBUb0Zyb250U2lkZSk7XG4gIGVsZW1lbnRzLmNhcmQudHJhbnNmb3JtQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZmxpcFRvQmFja1NpZGUpO1xufTtcblxuLy8gQ3JlYXRlIHRoZSBob3ZlciBlZmZlY3Qgb24gZWFjaCByb3cgdGhhdCBkaXNwbGF5cyB0aGUgaW1hZ2Ugb2YgdGhlIGNhcmRcbmV4cG9ydCBjb25zdCBwcmludExpc3RIb3ZlckV2ZW50cyA9ICgpID0+IHtcbiAgLy8gR2V0IHRoZSBIVE1MIGZvciBlYWNoIHRhYmxlIHJvd1xuICBjb25zdCBwcmludHMgPSBBcnJheS5mcm9tKGVsZW1lbnRzLmNhcmQucHJpbnRSb3dzKTtcblxuICBwcmludHMuZm9yRWFjaCgocHJpbnQpID0+IHtcbiAgICBwcmludC5vbm1vdXNlbW92ZSA9IChlKSA9PiB7XG4gICAgICAvLyBJZiB0aGUgd2luZG93IGlzIHNtYWxsZXIgdGhhbiA3NjggcGl4ZWxzLCBkb24ndCBkaXNwbGF5IGFueSBpbWFnZXNcbiAgICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA8IDc2OCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAvLyBJZiB0aGVyZSBpcyBhbHJlYWR5IGFuIGltYWdlIGJlaW5nIGRpc3BsYXllZCwgcmVtb3ZlIGl0IGZyb20gdGhlIERPTVxuICAgICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50b29sdGlwJykpIHtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudG9vbHRpcCcpKTtcbiAgICAgIH1cblxuICAgICAgLy8gUHJlcCB0aGUgZGl2LlxuICAgICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBkaXYuY2xhc3NOYW1lID0gJ3Rvb2x0aXAnO1xuXG4gICAgICAvLyBUaGUgZGl2IGlzIHN0eWxlZCB3aXRoIHBvc2l0aW9uIGFic29sdXRlLiBUaGlzIGNvZGUgcHV0cyBpdCBqdXN0IHRvIHRoZSByaWdodCBvZiB0aGUgY3Vyc29yXG4gICAgICBkaXYuc3R5bGUubGVmdCA9IGUucGFnZVggKyA1MCArICdweCc7XG4gICAgICBkaXYuc3R5bGUudG9wID0gZS5wYWdlWSAtIDMwICsgJ3B4JztcblxuICAgICAgLy8gUHJlcCB0aGUgaW1nIGVsZW1lbnRcbiAgICAgIGNvbnN0IGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuICAgICAgaW1nLmNsYXNzTmFtZSA9ICd0b29sdGlwX19pbWcnO1xuICAgICAgaW1nLnNyYyA9IHByaW50LmdldEF0dHJpYnV0ZSgnZGF0YS1jYXJkSW1nJyk7XG5cbiAgICAgIC8vIFB1dCB0aGUgaW1nIGludG8gdGhlIGRpdiBhbmQgdGhlbiBhcHBlbmQgdGhlIGRpdiBkaXJlY3RseSB0byB0aGUgYm9keSBvZiB0aGUgZG9jdW1lbnQuXG4gICAgICBkaXYuYXBwZW5kQ2hpbGQoaW1nKTtcbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZGl2KTtcbiAgICB9O1xuXG4gICAgLy8gUmVtb3ZlIHRoZSBpbWcgd2hlbiB0YWtpbmcgdGhlIGN1cnNvciBvZmYgdGhlIHByaW50XG4gICAgcHJpbnQub25tb3VzZW91dCA9IChlKSA9PiB7XG4gICAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRvb2x0aXAnKSkge1xuICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50b29sdGlwJykpO1xuICAgICAgfVxuICAgIH07XG4gIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IHNob3J0ZW5DYXJkTmFtZSA9ICgpID0+IHtcbiAgY29uc3QgbmFtZXMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tY2FyZC1uYW1lJykpO1xuICBjb25zb2xlLmxvZyhuYW1lcyk7XG5cbiAgbmFtZXMuZm9yRWFjaCgobikgPT4ge1xuICAgIGlmIChuLmlubmVyVGV4dC5pbmNsdWRlcygnLycpKSB7XG4gICAgICBuLmlubmVySFRNTCA9IG4uaW5uZXJIVE1MLnN1YnN0cmluZygwLCBuLmlubmVySFRNTC5pbmRleE9mKCcvJykgLSAxKTtcbiAgICB9XG4gIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IGNoZWNrUHJpY2VJbnB1dEZvckRpZ2l0cyA9IChlKSA9PiB7XG4gIGNvbnN0IHByaWNlSW5wdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFkZC10by1pbnYtcHJpY2UnKS52YWx1ZTtcblxuICBpZiAoaXNOYU4ocHJpY2VJbnB1dCkgJiYgcHJpY2VJbnB1dCAhPT0gJycpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgcmVuZGVyUHJpY2VJbnB1dEVycm9yTWVzc2FnZSgpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufTtcblxuY29uc3QgcmVuZGVyUHJpY2VJbnB1dEVycm9yTWVzc2FnZSA9ICgpID0+IHtcbiAgY29uc3QgcHJpY2VJbnB1dERpdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYWRkLXRvLWludi1wcmljZS1kaXYnKTtcbiAgY29uc3QgbXNnID0gYDxwIGNsYXNzPVwiYWRkLXRvLWludi1wcmljZS1tc2dcIj5JbnZhbGlkIHByaWNlLiBNdXN0IGJlIGEgbnVtYmVyLjwvcD5gO1xuXG4gIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmFkZC10by1pbnYtcHJpY2UtbXNnJykpIHtcbiAgICBwcmljZUlucHV0RGl2Lmluc2VydEFkamFjZW50SFRNTCgnYmVmb3JlZW5kJywgbXNnKTtcbiAgfVxufTtcbiIsImltcG9ydCB7IGVsZW1lbnRzIH0gZnJvbSAnLi9iYXNlJztcbmltcG9ydCAqIGFzIHNlYXJjaFZpZXcgZnJvbSAnLi9zZWFyY2hWaWV3JztcblxuZXhwb3J0IGNvbnN0IGNoZWNrUHJpY2VJbnB1dEZvckRpZ2l0cyA9IChlKSA9PiB7XG4gIGNvbnN0IHByaWNlSW5wdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWludi1kZW5vbWluYXRpb24tc29ydC12YWx1ZScpXG4gICAgLnZhbHVlO1xuXG4gIGlmIChpc05hTihwcmljZUlucHV0KSAmJiBwcmljZUlucHV0ICE9PSAnJykge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICByZW5kZXJQcmljZUlucHV0RXJyb3JNZXNzYWdlKCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59O1xuXG5jb25zdCByZW5kZXJQcmljZUlucHV0RXJyb3JNZXNzYWdlID0gKCkgPT4ge1xuICBjb25zdCBwcmljZUlucHV0RGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1pbnYtc2VhcmNoLXByaWNlLWRpdicpO1xuICBjb25zdCBtc2cgPSBgPHAgY2xhc3M9XCJpbnYtc2VhcmNoLXByaWNlLW1zZ1wiPkludmFsaWQgcHJpY2UuIE11c3QgYmUgYSBudW1iZXIuPC9wPmA7XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuaW52LXNlYXJjaC1wcmljZS1tc2cnKSkge1xuICAgIHByaWNlSW5wdXREaXYuaW5zZXJ0QWRqYWNlbnRIVE1MKCdiZWZvcmVlbmQnLCBtc2cpO1xuICB9XG59O1xuXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKiogVFlQRSBMSU5FICoqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG5cbmNvbnN0IGhpZGVUeXBlc0Ryb3BEb3duQnV0S2VlcFZhbHVlID0gKCkgPT4ge1xuICBpZiAoIWVsZW1lbnRzLmFwaVNlYXJjaC50eXBlRHJvcERvd24uaGFzQXR0cmlidXRlKCdoaWRkZW4nKSkge1xuICAgIGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlRHJvcERvd24uc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBuYXZpZ2F0ZVR5cGVzRHJvcERvd24pO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3Qgc3RhcnRUeXBlc0Ryb3BEb3duTmF2aWdhdGlvbiA9ICgpID0+IHtcbiAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG5hdmlnYXRlVHlwZXNEcm9wRG93bik7XG4gIGNvbnN0IGZpcnN0VHlwZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tdHlwZTpub3QoW2hpZGRlbl0pJyk7XG4gIHNlYXJjaFZpZXcuaGlnaGxpZ2h0VHlwZShmaXJzdFR5cGUpO1xuICBzZWFyY2hWaWV3LmhvdmVyT3ZlclR5cGVzTGlzdGVuZXIoKTtcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG5hdmlnYXRlVHlwZXNEcm9wRG93bik7XG4gIGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlRHJvcERvd24uc2Nyb2xsVG9wID0gMDtcbn07XG5cbmNvbnN0IG5hdmlnYXRlVHlwZXNEcm9wRG93biA9IChlKSA9PiB7XG4gIGNvbnN0IHR5cGVzID0gQXJyYXkuZnJvbShcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLXR5cGU6bm90KFtoaWRkZW5dKScpXG4gICk7XG4gIGNvbnN0IGkgPSB0eXBlcy5pbmRleE9mKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taGlnaGxpZ2h0ZWQnKSk7XG5cbiAgaWYgKGUuY29kZSA9PT0gJ0Fycm93RG93bicgJiYgaSA8IHR5cGVzLmxlbmd0aCAtIDEpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgc2VhcmNoVmlldy5yZW1vdmVDdXJyZW50SGlnaGxpZ2h0KCk7XG4gICAgc2VhcmNoVmlldy5oaWdobGlnaHRUeXBlKHR5cGVzW2kgKyAxXSk7XG5cbiAgICBzZWFyY2hWaWV3LnNldFNjcm9sbFRvcE9uRG93bkFycm93KFxuICAgICAgdHlwZXNbaSArIDFdLFxuICAgICAgZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVEcm9wRG93blxuICAgICk7XG4gIH1cblxuICBpZiAoZS5jb2RlID09PSAnQXJyb3dVcCcpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAvLyBXZSBhbHdheXMgd2FudCB0byBwcmV2ZW50IHRoZSBkZWZhdWx0LiBXZSBvbmx5IHdhbnQgdG8gY2hhbmdlIHRoZVxuICAgIC8vIGhpZ2hsaWdodCBpZiBub3Qgb24gdGhlIHRvcCB0eXBlIGluIHRoZSBkcm9wZG93blxuICAgIGlmIChpID4gMCkge1xuICAgICAgc2VhcmNoVmlldy5yZW1vdmVDdXJyZW50SGlnaGxpZ2h0KCk7XG4gICAgICBzZWFyY2hWaWV3LmhpZ2hsaWdodFR5cGUodHlwZXNbaSAtIDFdKTtcblxuICAgICAgc2VhcmNoVmlldy5zZXRTY3JvbGxUb3BPblVwQXJyb3coXG4gICAgICAgIHR5cGVzW2kgLSAxXSxcbiAgICAgICAgZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVEcm9wRG93blxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBpZiAoZS5jb2RlID09PSAnRW50ZXInKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHNldElucHV0VmFsdWUoXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWhpZ2hsaWdodGVkJykuZ2V0QXR0cmlidXRlKCdkYXRhLXR5cGUnKVxuICAgICk7XG4gICAgaGlkZVR5cGVzRHJvcERvd25CdXRLZWVwVmFsdWUoKTtcbiAgfVxufTtcblxuY29uc3Qgc2V0SW5wdXRWYWx1ZSA9ICh0eXBlKSA9PiB7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXR5cGUtbGluZScpLnZhbHVlID0gdHlwZTtcbn07XG5cbmV4cG9ydCBjb25zdCB0eXBlTGluZUxpc3RlbmVyID0gKGUpID0+IHtcbiAgLy8gSWYgdGhlIHRhcmdldCBpcyBub3QgVHlwZSBMaW5lIGlucHV0IGxpbmUsIG9yIGFuIGVsZW1lbnQgaW4gdGhlIGRyb3Bkb3duIGxpc3QsXG4gIC8vIGNsb3NlIHRoZSBkcm9wZG93biBhbmQgcmVtb3ZlIHRoZSBldmVudCBsaXN0ZW5lclxuICBpZiAoXG4gICAgZS50YXJnZXQgIT09IGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlTGluZSAmJlxuICAgICFlLnRhcmdldC5tYXRjaGVzKCcuanMtLWFwaS1kcm9wZG93bi10eXBlcy1saXN0JylcbiAgKSB7XG4gICAgc2VhcmNoVmlldy5oaWRlVHlwZXNEcm9wRG93bigpO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdHlwZUxpbmVMaXN0ZW5lcik7XG4gICAgLy8gSWYgdGhlIHRhcmdldCBpcyBvbmUgaWYgdHlwZXMsIGdldCB0aGUgZGF0YSB0eXBlXG4gIH0gZWxzZSBpZiAoZS50YXJnZXQuaGFzQXR0cmlidXRlKCdkYXRhLXR5cGUnKSkge1xuICAgIHNldElucHV0VmFsdWUoZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXR5cGUnKSk7XG4gICAgZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVMaW5lLmZvY3VzKCk7XG4gICAgaGlkZVR5cGVzRHJvcERvd25CdXRLZWVwVmFsdWUoKTtcbiAgfVxufTtcblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqIFNFVFMgKioqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuXG5jb25zdCBoaWRlU2V0c0Ryb3BEb3duQnV0S2VlcFZhbHVlID0gKCkgPT4ge1xuICBpZiAoIWVsZW1lbnRzLmFwaVNlYXJjaC5zZXREcm9wRG93bi5oYXNBdHRyaWJ1dGUoJ2hpZGRlbicpKSB7XG4gICAgZWxlbWVudHMuYXBpU2VhcmNoLnNldERyb3BEb3duLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgbmF2aWdhdGVTZXRzRHJvcERvd24pO1xuICB9XG59O1xuXG5jb25zdCBuYXZpZ2F0ZVNldHNEcm9wRG93biA9IChlKSA9PiB7XG4gIGNvbnN0IHNldHMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tc2V0Om5vdChbaGlkZGVuXSknKSk7XG4gIGNvbnN0IGkgPSBzZXRzLmluZGV4T2YoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1oaWdobGlnaHRlZCcpKTtcblxuICBpZiAoZS5jb2RlID09PSAnQXJyb3dEb3duJyAmJiBpIDwgc2V0cy5sZW5ndGggLSAxKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHNlYXJjaFZpZXcucmVtb3ZlQ3VycmVudEhpZ2hsaWdodCgpO1xuICAgIHNlYXJjaFZpZXcuaGlnaGxpZ2h0U2V0KHNldHNbaSArIDFdKTtcblxuICAgIHNlYXJjaFZpZXcuc2V0U2Nyb2xsVG9wT25Eb3duQXJyb3coXG4gICAgICBzZXRzW2kgKyAxXSxcbiAgICAgIGVsZW1lbnRzLmFwaVNlYXJjaC5zZXREcm9wRG93blxuICAgICk7XG4gIH1cblxuICBpZiAoZS5jb2RlID09PSAnQXJyb3dVcCcgJiYgaSA+IDApIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgc2VhcmNoVmlldy5yZW1vdmVDdXJyZW50SGlnaGxpZ2h0KCk7XG4gICAgc2VhcmNoVmlldy5oaWdobGlnaHRTZXQoc2V0c1tpIC0gMV0pO1xuXG4gICAgc2VhcmNoVmlldy5zZXRTY3JvbGxUb3BPblVwQXJyb3coXG4gICAgICBzZXRzW2kgLSAxXSxcbiAgICAgIGVsZW1lbnRzLmFwaVNlYXJjaC5zZXREcm9wRG93blxuICAgICk7XG4gIH1cblxuICBpZiAoZS5jb2RlID09PSAnRW50ZXInKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgYWRkU2V0KFxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1oaWdobGlnaHRlZCcpLmdldEF0dHJpYnV0ZSgnZGF0YS1zZXQtbmFtZScpXG4gICAgKTtcblxuICAgIGhpZGVTZXRzRHJvcERvd25CdXRLZWVwVmFsdWUoKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IHN0YXJ0U2V0c0Ryb3BEb3duTmF2aWdhdGlvbiA9ICgpID0+IHtcbiAgY29uc3QgZmlyc3RTZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXNldDpub3QoW2hpZGRlbl0pJyk7XG4gIHNlYXJjaFZpZXcuaGlnaGxpZ2h0U2V0KGZpcnN0U2V0KTtcbiAgc2VhcmNoVmlldy5ob3Zlck92ZXJTZXRzTGlzdGVuZXIoKTtcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG5hdmlnYXRlU2V0c0Ryb3BEb3duKTtcbiAgZWxlbWVudHMuYXBpU2VhcmNoLnNldERyb3BEb3duLnNjcm9sbFRvcCA9IDA7XG59O1xuXG5jb25zdCBhZGRTZXQgPSAoc2V0TmFtZSkgPT4ge1xuICBlbGVtZW50cy5hcGlTZWFyY2guc2V0SW5wdXQudmFsdWUgPSBzZXROYW1lO1xufTtcblxuZXhwb3J0IGNvbnN0IHNldElucHV0TGlzdGVuZXIgPSAoZSkgPT4ge1xuICAvLyBJZiB0aGUgdGFyZ2V0IGlzIG5vdCB0aGUgc2V0IGlucHV0IGZpZWxkLCBvciBhbiBlbGVtZW50IGluIHRoZSBkcm9wZG93biBsaXN0LFxuICAvLyBjbG9zZSB0aGUgZHJvcGRvd24gYW5kIHJlbW92ZSB0aGUgZXZlbnQgbGlzdGVuZXJcbiAgaWYgKFxuICAgIGUudGFyZ2V0ICE9PSBlbGVtZW50cy5hcGlTZWFyY2guc2V0SW5wdXQgJiZcbiAgICAhZS50YXJnZXQubWF0Y2hlcygnLmpzLS1hcGktZHJvcGRvd24tc2V0cy1saXN0JylcbiAgKSB7XG4gICAgc2VhcmNoVmlldy5oaWRlU2V0c0Ryb3BEb3duKCk7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzZXRJbnB1dExpc3RlbmVyKTtcbiAgICAvLyBJZiB0aGUgdGFyZ2V0IGlzIG9uZSBvZiB0aGUgc2V0IG9wdGlvbnMsIHRvZ2dsZSBpdCBhcyBzZWxlY3RlZCwgYWRkIGl0IHRvIHRoZSBsaXN0LFxuICAgIC8vIGFuZCBoaWRlIHRoZSBkcm9wZG93bi5cbiAgfSBlbHNlIGlmIChlLnRhcmdldC5oYXNBdHRyaWJ1dGUoJ2RhdGEtc2V0LW5hbWUnKSkge1xuICAgIGFkZFNldChlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2V0LW5hbWUnKSk7XG4gICAgZWxlbWVudHMuYXBpU2VhcmNoLnNldElucHV0LmZvY3VzKCk7XG4gICAgaGlkZVNldHNEcm9wRG93bkJ1dEtlZXBWYWx1ZSgpO1xuICB9XG59O1xuIiwiaW1wb3J0IHsgZ2VuZXJhdGVNYW5hQ29zdEltYWdlcyB9IGZyb20gJy4vcmVzdWx0c1ZpZXcnO1xuaW1wb3J0IHsgY2hlY2tMaXN0SG92ZXJFdmVudHMgfSBmcm9tICcuL3Jlc3VsdHNWaWV3JztcblxuY29uc3Qgc2hvcnRlblR5cGVMaW5lID0gKCkgPT4ge1xuICBjb25zdCB0eXBlcyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1pbnYtdHlwZXMnKSk7XG4gIHR5cGVzLmZvckVhY2goKHR5cGUpID0+IHtcbiAgICBsZXQgaHRtbCA9IHR5cGUuaW5uZXJIVE1MO1xuXG4gICAgLy8gaWYgdGhlIOKAlCBkZWxpbWl0ZXIgaXMgZm91bmQgaW4gdGhlIHN0cmluZywgcmV0dXJuIGV2ZXJ5dGhpbmcgYmVmb3JlIHRoZSBkZWxpbWl0ZXJcbiAgICBpZiAoaHRtbC5pbmRleE9mKCfigJQnKSAhPT0gLTEpIHtcbiAgICAgIHR5cGUuaW5uZXJIVE1MID0gaHRtbC5zdWJzdHJpbmcoMCwgaHRtbC5pbmRleE9mKCfigJQnKSAtIDEpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5jb25zdCBhbHRlck1hbmFJbWFnZXMgPSAoKSA9PiB7XG4gIGNvbnN0IG1hbmFDb3N0cyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1pbnYtbWFuYS1jb3N0JykpO1xuXG4gIG1hbmFDb3N0cy5mb3JFYWNoKChjb3N0KSA9PiB7XG4gICAgY29zdC5pbm5lckhUTUwgPSBnZW5lcmF0ZU1hbmFDb3N0SW1hZ2VzKGNvc3QuaW5uZXJIVE1MKTtcbiAgfSk7XG59O1xuXG4vLyBOb3QgdXNpbmcgdGhpcyByaWdodCBub3cgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuY29uc3Qgc29ydFRhYmxlQWxwaGFiZXRpY2FsbHkgPSAoKSA9PiB7XG4gIGxldCByb3dzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWNoZWNrbGlzdC1yb3cnKSk7XG4gIGNvbnN0IHRhYmxlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1jYXJkLWNoZWNrbGlzdCcpO1xuICBsZXQgY2FyZHMgPSBbXTtcblxuICByb3dzLmZvckVhY2goKHJvdykgPT4ge1xuICAgIGNhcmRzLnB1c2gocm93LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tY2hlY2tsaXN0LWNhcmQtbmFtZScpLmlubmVySFRNTCk7XG4gICAgcm93LnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQocm93KTtcbiAgfSk7XG5cbiAgY2FyZHMgPSBjYXJkcy5zb3J0KCk7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjYXJkcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHJvd0luZGV4ID0gcm93cy5pbmRleE9mKFxuICAgICAgcm93cy5maW5kKChyb3cpID0+IHJvdy5nZXRBdHRyaWJ1dGUoJ2RhdGEtcm93JykgPT09IGNhcmRzW2ldKVxuICAgICk7XG5cbiAgICB0YWJsZS5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2JlZm9yZWVuZCcsIHJvd3Nbcm93SW5kZXhdKTtcblxuICAgIHJvd3Muc3BsaWNlKHJvd0luZGV4LCAxKTtcbiAgfVxufTtcblxuY29uc3QgZ2l2ZUVhcm5pbmdzQ29sdW1uTW9kaWZpZXIgPSAoKSA9PiB7XG4gIGNvbnN0IHJvd3MgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0taW52LWVhcm5pbmdzJykpO1xuICBjb25zb2xlLmxvZyhyb3dzKTtcblxuICByb3dzLmZvckVhY2goKHJvdykgPT4ge1xuICAgIGlmIChyb3cuaW5uZXJUZXh0LnN0YXJ0c1dpdGgoJy0nKSkge1xuICAgICAgcm93LmNsYXNzTGlzdC5hZGQoJ25lZ2F0aXZlLWVhcm5pbmdzJyk7XG4gICAgfSBlbHNlIGlmIChyb3cuaW5uZXJUZXh0ID09PSAnMC4wJykge1xuICAgICAgcm93LmNsYXNzTGlzdC5hZGQoJ25vLWVhcm5pbmdzJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJvdy5jbGFzc0xpc3QuYWRkKCdwb3NpdGl2ZS1lYXJuaW5ncycpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5jb25zdCByZW1vdmVIYXNoVGFnRnJvbVJhcml0eSA9ICgpID0+IHtcbiAgY29uc3QgcmFyaXR5cyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1yYXJpdHknKSk7XG4gIHJhcml0eXMuZm9yRWFjaCgocikgPT4gKHIuaW5uZXJUZXh0ID0gci5pbm5lclRleHQuc3Vic3RyaW5nKDEpKSk7XG59O1xuXG5leHBvcnQgY29uc3QgYWx0ZXJJbnZlbnRvcnlUYWJsZSA9ICgpID0+IHtcbiAgc2hvcnRlblR5cGVMaW5lKCk7XG4gIGFsdGVyTWFuYUltYWdlcygpO1xuICBjaGVja0xpc3RIb3ZlckV2ZW50cygpO1xuICBnaXZlRWFybmluZ3NDb2x1bW5Nb2RpZmllcigpO1xuICByZW1vdmVIYXNoVGFnRnJvbVJhcml0eSgpO1xufTtcbiIsImltcG9ydCB7IGVsZW1lbnRzIH0gZnJvbSAnLi9iYXNlJztcblxuY29uc3QgY2xlYXJDaGVja2xpc3QgPSAoKSA9PiB7XG4gIGNvbnN0IGNoZWNrTGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tY2FyZC1jaGVja2xpc3QnKTtcbiAgaWYgKGNoZWNrTGlzdCkge1xuICAgIGNoZWNrTGlzdC5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKGNoZWNrTGlzdCk7XG5cbiAgICAvLyBSZW1vdmUgYW55IHRvb2wgdGlwIGltYWdlcyBpZiB1c2VyIHdhcyBob3ZlcmluZ1xuICAgIGNvbnN0IHRvb2xUaXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudG9vbHRpcCcpO1xuICAgIGlmICh0b29sVGlwKSBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKHRvb2xUaXApO1xuICB9XG59O1xuXG5jb25zdCBjbGVhckltYWdlR3JpZCA9ICgpID0+IHtcbiAgY29uc3QgZ3JpZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taW1hZ2UtZ3JpZCcpO1xuICBpZiAoZ3JpZCkgZ3JpZC5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKGdyaWQpO1xufTtcblxuY29uc3QgY2xlYXJSZXN1bHRzID0gKCkgPT4ge1xuICBjbGVhckNoZWNrbGlzdCgpO1xuICBjbGVhckltYWdlR3JpZCgpO1xufTtcblxuY29uc3QgcHJlcEltYWdlQ29udGFpbmVyID0gKCkgPT4ge1xuICBjb25zdCBtYXJrdXAgPSBgXG4gICAgICAgIDxkaXYgY2xhc3M9XCJpbWFnZS1ncmlkIGpzLS1pbWFnZS1ncmlkXCI+PC9kaXY+XG4gICAgYDtcbiAgZWxlbWVudHMucmVzdWx0c1BhZ2UucmVzdWx0c0NvbnRhaW5lci5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWVuZCcsIG1hcmt1cCk7XG59O1xuXG5jb25zdCBnZW5lcmF0ZVNpbmdsZVNpZGVkQ2FyZCA9IChjYXJkKSA9PiB7XG4gIGNvbnN0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBjb25zdCBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcblxuICBhLmNsYXNzTGlzdCA9IGBpbWFnZS1ncmlkX19saW5rIGpzLS1pbWFnZS1ncmlkLWxpbmtgO1xuICBhLmhyZWYgPSBgL2NhcmQvJHtjYXJkLnNldH0vJHtwYXJzZUNhcmROYW1lKGNhcmQubmFtZSl9YDtcblxuICBkaXYuY2xhc3NMaXN0ID0gYGltYWdlLWdyaWRfX2NvbnRhaW5lcmA7XG4gIGltZy5zcmMgPSBgJHtjYXJkLmltYWdlX3VyaXMubm9ybWFsfWA7XG4gIGltZy5hbHQgPSBgJHtjYXJkLm5hbWV9YDtcbiAgaW1nLmNsYXNzTGlzdCA9IGBpbWFnZS1ncmlkX19pbWFnZWA7XG4gIGRpdi5hcHBlbmRDaGlsZChpbWcpO1xuICBhLmFwcGVuZENoaWxkKGRpdik7XG5cbiAgZG9jdW1lbnRcbiAgICAucXVlcnlTZWxlY3RvcignLmpzLS1pbWFnZS1ncmlkJylcbiAgICAuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdiZWZvcmVlbmQnLCBhKTtcbn07XG5cbmNvbnN0IHNob3dCYWNrU2lkZSA9IChjYXJkKSA9PiB7XG4gIGNvbnN0IGZyb250ID0gY2FyZC5xdWVyeVNlbGVjdG9yKCcuanMtLWltYWdlLWdyaWQtY2FyZC1zaWRlLWZyb250Jyk7XG4gIGNvbnN0IGJhY2sgPSBjYXJkLnF1ZXJ5U2VsZWN0b3IoJy5qcy0taW1hZ2UtZ3JpZC1jYXJkLXNpZGUtYmFjaycpO1xuXG4gIGZyb250LnN0eWxlLnRyYW5zZm9ybSA9ICdyb3RhdGVZKC0xODBkZWcpJztcbiAgYmFjay5zdHlsZS50cmFuc2Zvcm0gPSAncm90YXRlWSgwKSc7XG5cbiAgZnJvbnQuY2xhc3NMaXN0LnJlbW92ZSgnanMtLXNob3dpbmcnKTtcbiAgYmFjay5jbGFzc0xpc3QuYWRkKCdqcy0tc2hvd2luZycpO1xufTtcblxuY29uc3Qgc2hvd0Zyb250U2lkZSA9IChjYXJkKSA9PiB7XG4gIGNvbnN0IGZyb250ID0gY2FyZC5xdWVyeVNlbGVjdG9yKCcuanMtLWltYWdlLWdyaWQtY2FyZC1zaWRlLWZyb250Jyk7XG4gIGNvbnN0IGJhY2sgPSBjYXJkLnF1ZXJ5U2VsZWN0b3IoJy5qcy0taW1hZ2UtZ3JpZC1jYXJkLXNpZGUtYmFjaycpO1xuXG4gIGZyb250LnN0eWxlLnRyYW5zZm9ybSA9ICdyb3RhdGVZKDApJztcbiAgYmFjay5zdHlsZS50cmFuc2Zvcm0gPSAncm90YXRlWSgxODBkZWcpJztcblxuICBmcm9udC5jbGFzc0xpc3QuYWRkKCdqcy0tc2hvd2luZycpO1xuICBiYWNrLmNsYXNzTGlzdC5yZW1vdmUoJ2pzLS1zaG93aW5nJyk7XG59O1xuXG5jb25zdCBmbGlwQ2FyZCA9IChlKSA9PiB7XG4gIC8vIFByZXZlbnQgdGhlIGxpbmsgZnJvbSBnb2luZyB0byB0aGUgY2FyZCBzcGVjaWZpYyBwYWdlXG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgY29uc3QgY2FyZCA9IGUudGFyZ2V0LnBhcmVudEVsZW1lbnQ7XG4gIGNvbnNvbGUubG9nKGNhcmQpO1xuXG4gIGNvbnN0IGZyb250ID0gY2FyZC5xdWVyeVNlbGVjdG9yKCcuanMtLWltYWdlLWdyaWQtY2FyZC1zaWRlLWZyb250Jyk7XG5cbiAgLy8gSWYgdGhlIGZyb250IGlzIHNob3dpbmcsIGRpc3BsYXkgdGhlIGJhY2tzaWRlLiBPdGhlcndpc2UsIGRpc3BsYXkgdGhlIGZyb250XG4gIGlmIChmcm9udC5jbGFzc0xpc3QuY29udGFpbnMoJ2pzLS1zaG93aW5nJykpIHNob3dCYWNrU2lkZShjYXJkKTtcbiAgZWxzZSBzaG93RnJvbnRTaWRlKGNhcmQpO1xufTtcblxuY29uc3QgZ2VuZXJhdGVGbGlwQ2FyZEJ0biA9ICgpID0+IHtcbiAgY29uc3QgYnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gIGJ0bi5jbGFzc0xpc3QgPSAnaW1hZ2UtZ3JpZF9fZG91YmxlLWJ0biBqcy0taW1hZ2UtZ3JpZC1mbGlwLWNhcmQtYnRuJztcbiAgYnRuLmlubmVySFRNTCA9IGBcbiAgICA8c3ZnIHZlcnNpb249XCIxLjFcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgd2lkdGg9XCIzMFwiIGhlaWdodD1cIjMwXCIgdmlld0JveD1cIjAgMCAxMDI0IDEwMjRcIiBjbGFzcz1cImltYWdlLWdyaWRfX2RvdWJsZS1idG4tc3ZnXCI+XG5cbiAgICA8cGF0aCBkPVwiTTg4NC4zLDM1Ny42YzExNi44LDExNy43LDE1MS43LDI3Ny0zNjIuMiwzMjBWNDk2LjRMMjQzLjIsNzYzLjhMNTIyLDEwMzEuM1Y4NjAuOEM4MjguOCw4MzkuNCwxMjQ0LjksNjA0LjUsODg0LjMsMzU3LjZ6XCIgY2xhc3M9XCJpbWFnZS1ncmlkX19kb3VibGUtYnRuLXN2Z1wiLWNvbG9yPjwvcGF0aD5cbiAgICA8cGF0aCBkPVwiTTU1Ny44LDI4OC4ydjEzOC40bDIzMC44LTIxMy40TDU1Ny44LDB2MTQyLjhjLTMwOS4yLDE1LjYtNzkyLjEsMjUzLjYtNDI2LjUsNTAzLjhDMTMuNiw1MjcuOSwzMCwzMzAuMSw1NTcuOCwyODguMnpcIiBjbGFzcz1cImltYWdlLWdyaWRfX2RvdWJsZS1idG4tc3ZnLWNvbG9yXCI+PC9wYXRoPlxuICAgIDwvc3ZnPlxuICBgO1xuXG4gIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiBmbGlwQ2FyZChlKSk7XG5cbiAgcmV0dXJuIGJ0bjtcbn07XG5cbmNvbnN0IGdlbmVyYXRlRG91YmxlU2lkZWRDYXJkID0gKGNhcmQpID0+IHtcbiAgY29uc3QgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgY29uc3Qgb3V0ZXJEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgY29uc3QgaW5uZXJEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgY29uc3QgaW1nRnJvbnRTaWRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG4gIGNvbnN0IGltZ0JhY2tTaWRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG4gIGNvbnN0IGZsaXBDYXJkQnRuID0gZ2VuZXJhdGVGbGlwQ2FyZEJ0bigpO1xuXG4gIGEuY2xhc3NMaXN0ID0gYGltYWdlLWdyaWRfX2xpbmsganMtLWltYWdlLWdyaWQtbGlua2A7XG4gIGEuaHJlZiA9IGAvY2FyZC8ke2NhcmQuc2V0fS8ke3BhcnNlQ2FyZE5hbWUoY2FyZC5uYW1lKX1gO1xuXG4gIG91dGVyRGl2LmNsYXNzTGlzdCA9IGBpbWFnZS1ncmlkX19vdXRlci1kaXZgO1xuICBpbm5lckRpdi5jbGFzc0xpc3QgPSBgaW1hZ2UtZ3JpZF9faW5uZXItZGl2IGpzLS1pbm5lci1kaXYtJHtjYXJkLm5hbWV9YDtcblxuICBpbWdGcm9udFNpZGUuY2xhc3NMaXN0ID0gYGltYWdlLWdyaWRfX2RvdWJsZSBpbWFnZS1ncmlkX19kb3VibGUtLWZyb250IGpzLS1pbWFnZS1ncmlkLWNhcmQtc2lkZS1mcm9udCBqcy0tc2hvd2luZ2A7XG4gIGltZ0Zyb250U2lkZS5zcmMgPSBjYXJkLmNhcmRfZmFjZXNbMF0uaW1hZ2VfdXJpcy5ub3JtYWw7XG4gIGltZ0Zyb250U2lkZS5hbHQgPSBjYXJkLm5hbWU7XG5cbiAgaW1nQmFja1NpZGUuY2xhc3NMaXN0ID0gYGltYWdlLWdyaWRfX2RvdWJsZSBpbWFnZS1ncmlkX19kb3VibGUtLWJhY2sganMtLWltYWdlLWdyaWQtY2FyZC1zaWRlLWJhY2tgO1xuICBpbWdCYWNrU2lkZS5zcmMgPSBjYXJkLmNhcmRfZmFjZXNbMV0uaW1hZ2VfdXJpcy5ub3JtYWw7XG4gIGltZ0JhY2tTaWRlLmFsdCA9IGNhcmQuY2FyZF9mYWNlc1sxXS5uYW1lO1xuXG4gIGEuYXBwZW5kQ2hpbGQob3V0ZXJEaXYpO1xuICBvdXRlckRpdi5hcHBlbmRDaGlsZChpbm5lckRpdik7XG4gIGlubmVyRGl2LmFwcGVuZENoaWxkKGltZ0JhY2tTaWRlKTtcbiAgaW5uZXJEaXYuYXBwZW5kQ2hpbGQoaW1nRnJvbnRTaWRlKTtcbiAgaW5uZXJEaXYuYXBwZW5kQ2hpbGQoZmxpcENhcmRCdG4pO1xuXG4gIGRvY3VtZW50XG4gICAgLnF1ZXJ5U2VsZWN0b3IoJy5qcy0taW1hZ2UtZ3JpZCcpXG4gICAgLmluc2VydEFkamFjZW50RWxlbWVudCgnYmVmb3JlZW5kJywgYSk7XG59O1xuXG5jb25zdCBnZW5lcmF0ZUltYWdlR3JpZCA9IChjYXJkcykgPT4ge1xuICBjYXJkcy5mb3JFYWNoKChjYXJkKSA9PiB7XG4gICAgLy8gRm9yIHNpbmdsZSBzaWRlZCBjYXJkc1xuICAgIGlmIChjYXJkLmltYWdlX3VyaXMpIGdlbmVyYXRlU2luZ2xlU2lkZWRDYXJkKGNhcmQpO1xuICAgIC8vIERvdWJsZSBzaWRlZCBjYXJkc1xuICAgIGVsc2UgZ2VuZXJhdGVEb3VibGVTaWRlZENhcmQoY2FyZCk7XG4gIH0pO1xufTtcblxuLy8gRnVuY2l0b24gdG8gYmUgdXNlZCBpbiBpbmRleC5qcy4gVGFrZXMgY2FyZSBvZiBhbGwgbmVjZXNzYXJ5IHN0ZXBzIHRvIGRpc3BsYXkgY2FyZHMgYXMgYSBpbWFnZXNcbmV4cG9ydCBjb25zdCBkaXNwYWx5SW1hZ2VzID0gKGNhcmRzKSA9PiB7XG4gIGNsZWFyUmVzdWx0cygpO1xuICBwcmVwSW1hZ2VDb250YWluZXIoKTtcbiAgZ2VuZXJhdGVJbWFnZUdyaWQoY2FyZHMpO1xufTtcblxuY29uc3QgcHJlcENoZWNrbGlzdENvbnRhaW5lciA9ICgpID0+IHtcbiAgY29uc3QgbWFya3VwID0gYFxuICAgICAgICA8ZGl2IGNsYXNzPVwid3JhcHBlclwiPjx0YWJsZSBjbGFzcz1cImNhcmQtY2hlY2tsaXN0IGpzLS1jYXJkLWNoZWNrbGlzdFwiPlxuICAgICAgICAgICAgPHRoZWFkIGNsYXNzPVwianMtLWNhcmQtY2hlY2tsaXN0LWhlYWRlclwiPlxuICAgICAgICAgICAgICAgIDx0ciBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19yb3cgY2FyZC1jaGVja2xpc3RfX3Jvdy0tNyBjYXJkLWNoZWNrbGlzdF9fcm93LS1oZWFkZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGEgcmVzcG9uc2l2ZS0tc2V0XCI+U2V0PC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGEgcmVzcG9uc2l2ZS0tbmFtZVwiPk5hbWU8L3RoPlxuICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YSByZXNwb25zaXZlLS1jb3N0XCI+Q29zdDwvdGg+XG4gICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhIHJlc3BvbnNpdmUtLXR5cGVcIj5UeXBlPC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGEgcmVzcG9uc2l2ZS0tcmFyaXR5XCI+UmFyaXR5PC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGEgcmVzcG9uc2l2ZS0tYXJ0aXN0XCI+QXJ0aXN0PC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGEgcmVzcG9uc2l2ZS0tcHJpY2VcIj5QcmljZTwvdGg+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgIDwvdGhlYWQ+XG4gICAgICAgICAgICA8dGJvZHkgY2xhc3M9XCJqcy0tY2FyZC1jaGVja2xpc3QtYm9keSBjYXJkLWNoZWNrbGlzdC1ib2R5XCI+PC90Ym9keT5cbiAgICAgICAgPC90YWJsZT48L2Rpdj5cbiAgICAgICAgYDtcbiAgZWxlbWVudHMucmVzdWx0c1BhZ2UucmVzdWx0c0NvbnRhaW5lci5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWVuZCcsIG1hcmt1cCk7XG59O1xuXG5leHBvcnQgY29uc3QgZ2VuZXJhdGVNYW5hQ29zdEltYWdlcyA9IChtYW5hQ29zdCwgc2l6ZSA9ICdzbWFsbCcpID0+IHtcbiAgLy8gSWYgdGhlcmUgaXMgbm8gbWFuYSBjb3N0IGFzc29jaWF0ZWQgd2l0aCB0aGUgY2FyZCwgdGhlbiByZXR1cm4gYW4gZW1wdHkgc3RyaW5nIHRvIGxlYXZlIHRoZSByb3cgZW1wdHlcbiAgaWYgKCFtYW5hQ29zdCkgcmV0dXJuICcnO1xuXG4gIC8vIFJlZ3VsYXIgZXhwcmVzc2lvbnMgdG8gZmluZCBlYWNoIHNldCBvZiBjdXJseSBicmFjZXMge31cbiAgbGV0IHJlID0gL1xceyguKj8pXFx9L2c7XG5cbiAgLy8gUGFyc2UgdGhlIHN0cmluZ3MgYW5kIGdldCBhbGwgbWF0Y2hlc1xuICBsZXQgbWF0Y2hlcyA9IG1hbmFDb3N0Lm1hdGNoKHJlKTtcblxuICAvLyBJZiB0aGVyZSBhcmUgYW55IG1hdGNoZXMsIGxvb3AgdGhyb3VnaCBhbmQgcmVwbGFjZSBlYWNoIHNldCBvZiBjdXJseSBicmFjZXMgd2l0aCB0aGVcbiAgLy8gaHRtbCBzcGFuIHRoYXQgY29ycmVzcG9ucyB0byBtYW5hLmNzcyB0byByZW5kZXIgdGhlIGNvcnJlY3QgaW1hZ2VcbiAgaWYgKG1hdGNoZXMpIHtcbiAgICBtYXRjaGVzLmZvckVhY2goKG0pID0+IHtcbiAgICAgIGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cChgXFx7KCR7bS5zbGljZSgxLCAtMSl9KVxcfWAsICdnJyk7XG4gICAgICAvLyBUaGlzIHdpbGwgYmUgdGhlIHN0cmluZyB1c2VkIHRvIGdldCB0aGUgcmlnaHQgY2xhc3MgZnJvbSBtYW5hLmNzc1xuICAgICAgLy8gV2Ugd2FudCB0byB0YWtlIGV2ZXJ5dGhpbmcgaW5zaWRlIHRoZSBicmFja2V0cywgYW5kIGlmIHRoZXJlIGlzIGEgL1xuICAgICAgLy8gcmVtb3ZlIGl0LlxuICAgICAgY29uc3QgbWFuYUljb25TdHIgPSBtLnNsaWNlKDEsIC0xKS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoJy8nLCAnJyk7XG4gICAgICBtYW5hQ29zdCA9IG1hbmFDb3N0LnJlcGxhY2UoXG4gICAgICAgIHJlZ2V4LFxuICAgICAgICBgPHNwYW4gY2xhc3M9XCJtYW5hICR7c2l6ZX0gcyR7bWFuYUljb25TdHJ9XCI+PC9zcGFuPmBcbiAgICAgICk7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gbWFuYUNvc3Q7XG59O1xuXG5jb25zdCBzaG9ydGVuVHlwZUxpbmUgPSAodHlwZSkgPT4ge1xuICAvLyBJZiBubyB0eXBlIGlzIGdpdmVuLCByZXR1cm4gYW4gZW1wdHkgc3RyaW5nXG4gIGlmICghdHlwZSkgcmV0dXJuICcnO1xuXG4gIC8vIGlmIHRoZSDigJQgZGVsaW1pdGVyIGlzIGZvdW5kIGluIHRoZSBzdHJpbmcsIHJldHVybiBldmVyeXRoaW5nIGJlZm9yZSB0aGUgZGVsaW1pdGVyXG4gIGlmICh0eXBlLmluZGV4T2YoJ+KAlCcpICE9PSAtMSkgcmV0dXJuIHR5cGUuc3Vic3RyaW5nKDAsIHR5cGUuaW5kZXhPZign4oCUJykgLSAxKTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyBkZWxpbWl0ZXIsIHJldHVybiB0aGUgdHlwZSBhcyBnaXZlbiBpbiB0aGUgY2FyZCBvYmplY3RcbiAgcmV0dXJuIHR5cGU7XG59O1xuXG5jb25zdCBwYXJzZUNhcmROYW1lID0gKGNhcmROYW1lKSA9PiB7XG4gIGlmIChjYXJkTmFtZS5pbmRleE9mKCcvJykgIT09IC0xKSB7XG4gICAgcmV0dXJuIGNhcmROYW1lLnNsaWNlKDAsIGNhcmROYW1lLmluZGV4T2YoJy8nKSAtIDEpLnJlcGxhY2VBbGwoJyAnLCAnLScpO1xuICB9XG5cbiAgcmV0dXJuIGNhcmROYW1lLnJlcGxhY2VBbGwoJyAnLCAnLScpO1xufTtcblxuY29uc3QgZ2VuZXJhdGVDaGVja2xpc3QgPSAoY2FyZHMpID0+IHtcbiAgY29uc29sZS5sb2coY2FyZHMpO1xuICAvLyBDcmVhdGUgYSBuZXcgdGFibGUgcm93IGZvciBlYWNoIGNhcmQgb2JqZWN0XG4gIGNhcmRzLmZvckVhY2goKGNhcmQpID0+IHtcbiAgICBjb25zdCBjYXJkTmFtZUZvclVybCA9IHBhcnNlQ2FyZE5hbWUoY2FyZC5uYW1lKTtcblxuICAgIGNvbnN0IG1hcmt1cCA9IGBcbiAgICAgICAgICAgIDx0ciBjbGFzcz1cImpzLS1jaGVja2xpc3Qtcm93IGNhcmQtY2hlY2tsaXN0X19yb3cgJHtcbiAgICAgICAgICAgICAgY2FyZHMubGVuZ3RoIDwgMzAgPyAnY2FyZC1jaGVja2xpc3RfX3Jvdy0tYm9keScgOiAnJ1xuICAgICAgICAgICAgfSBjYXJkLWNoZWNrbGlzdF9fcm93LS03IGRhdGEtY29tcG9uZW50PVwiY2FyZC10b29sdGlwXCIgZGF0YS1jYXJkLWltZz0ke2NoZWNrRm9ySW1nKFxuICAgICAgY2FyZFxuICAgICl9PlxuICAgICAgICAgICAgICAgIDx0ZCBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhIGNhcmQtY2hlY2tsaXN0X19kYXRhLS1zZXQgcmVzcG9uc2l2ZS0tc2V0XCI+PGEgaHJlZj1cIi9jYXJkLyR7XG4gICAgICAgICAgICAgICAgICBjYXJkLnNldFxuICAgICAgICAgICAgICAgIH0vJHtjYXJkTmFtZUZvclVybH1cIiBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmtcIj4ke1xuICAgICAgY2FyZC5zZXRcbiAgICB9PC9hPjwvdGQ+XG4gICAgICAgICAgICAgICAgPHRkIGNsYXNzPVwiY2FyZC1jaGVja2xpc3RfX2RhdGEgY2FyZC1jaGVja2xpc3RfX2RhdGEtLW5hbWUgcmVzcG9uc2l2ZS0tbmFtZVwiPjxhIGhyZWY9XCIvY2FyZC8ke1xuICAgICAgICAgICAgICAgICAgY2FyZC5zZXRcbiAgICAgICAgICAgICAgICB9LyR7Y2FyZE5hbWVGb3JVcmx9XCIgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YS1saW5rXCI+JHtcbiAgICAgIGNhcmQubmFtZVxuICAgIH08L2E+PC90ZD5cbiAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YSByZXNwb25zaXZlLS1jb3N0XCI+PGEgaHJlZj1cIi9jYXJkLyR7XG4gICAgICAgICAgICAgICAgICBjYXJkLnNldFxuICAgICAgICAgICAgICAgIH0vJHtjYXJkTmFtZUZvclVybH1cIiBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmtcIj4ke2dlbmVyYXRlTWFuYUNvc3RJbWFnZXMoXG4gICAgICBjaGVja0Zvck1hbmFDb3N0KGNhcmQpXG4gICAgKX08L2E+PC90ZD5cbiAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YSByZXNwb25zaXZlLS10eXBlXCI+PGEgaHJlZj1cIi9jYXJkLyR7XG4gICAgICAgICAgICAgICAgICBjYXJkLnNldFxuICAgICAgICAgICAgICAgIH0vJHtjYXJkTmFtZUZvclVybH1cIiBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmtcIj4ke3Nob3J0ZW5UeXBlTGluZShcbiAgICAgIGNhcmQudHlwZV9saW5lXG4gICAgKX08L2E+PC90ZD5cbiAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YSBjYXJkLWNoZWNrbGlzdF9fZGF0YS0tcmFyaXR5IHJlc3BvbnNpdmUtLXJhcml0eVwiPjxhIGhyZWY9XCIvY2FyZC8ke1xuICAgICAgICAgICAgICAgICAgY2FyZC5zZXRcbiAgICAgICAgICAgICAgICB9LyR7Y2FyZE5hbWVGb3JVcmx9XCIgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YS1saW5rXCI+JHtcbiAgICAgIGNhcmQucmFyaXR5XG4gICAgfTwvYT48L3RkPlxuICAgICAgICAgICAgICAgIDx0ZCBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhIHJlc3BvbnNpdmUtLWFydGlzdFwiPjxhIGhyZWY9XCIvY2FyZC8ke1xuICAgICAgICAgICAgICAgICAgY2FyZC5zZXRcbiAgICAgICAgICAgICAgICB9LyR7Y2FyZE5hbWVGb3JVcmx9XCIgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YS1saW5rXCI+JHtcbiAgICAgIGNhcmQuYXJ0aXN0XG4gICAgfTwvYT48L3RkPlxuICAgICAgICAgICAgICAgIDx0ZCBjbGFzcz1cImNhcmQtY2hlY2tsaXN0X19kYXRhIGNhcmQtY2hlY2tsaXN0X19kYXRhLS1wcmljZSByZXNwb25zaXZlLS1wcmljZVwiPjxhIGhyZWY9XCIvY2FyZC8ke1xuICAgICAgICAgICAgICAgICAgY2FyZC5zZXRcbiAgICAgICAgICAgICAgICB9LyR7Y2FyZE5hbWVGb3JVcmx9XCIgY2xhc3M9XCJjYXJkLWNoZWNrbGlzdF9fZGF0YS1saW5rIGNhcmQtY2hlY2tsaXN0X19kYXRhLWxpbmstLXByaWNlIGpzLS1wcmljZSBjYXJkLWNoZWNrbGlzdF9fZGF0YS1saW5rLS1jZW50ZXJcIj4kICR7XG4gICAgICBjYXJkLnByaWNlcy51c2QgfHwgJy0nXG4gICAgfTwvYT48L3RkPlxuICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgIGA7XG4gICAgLy8gUHV0IHRoZSByb3cgaW4gdGhlIHRhYmxlXG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yKCcuanMtLWNhcmQtY2hlY2tsaXN0LWJvZHknKVxuICAgICAgLmluc2VydEFkamFjZW50SFRNTCgnYmVmb3JlZW5kJywgbWFya3VwKTtcbiAgfSk7XG59O1xuXG5jb25zdCBjaGVja0Zvck1pc3NpbmdQcmljZSA9ICgpID0+IHtcbiAgY29uc3QgcHJpY2VzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLXByaWNlJykpO1xuXG4gIHByaWNlcy5mb3JFYWNoKChwcmljZSkgPT4ge1xuICAgIGlmIChwcmljZS5pbm5lclRleHQuaW5jbHVkZXMoJy0nKSkgcHJpY2UuaW5uZXJUZXh0ID0gJyc7XG4gIH0pO1xufTtcblxuY29uc3QgY2hlY2tGb3JNYW5hQ29zdCA9IChjYXJkKSA9PiB7XG4gIGlmIChjYXJkLm1hbmFfY29zdCkge1xuICAgIHJldHVybiBjYXJkLm1hbmFfY29zdDtcbiAgfSBlbHNlIGlmIChjYXJkLmNhcmRfZmFjZXMpIHtcbiAgICByZXR1cm4gY2FyZC5jYXJkX2ZhY2VzWzBdLm1hbmFfY29zdDtcbiAgfVxufTtcblxuY29uc3QgY2hlY2tGb3JJbWcgPSAoY2FyZCkgPT4ge1xuICBpZiAoY2FyZC5pbWFnZV91cmlzKSByZXR1cm4gY2FyZC5pbWFnZV91cmlzLm5vcm1hbDtcbiAgLy8gSWYgdGhlcmUgaXMgbm8gY2FyZC5pbWFnZV91cmlzLCB0aGVuIGl0J3MgYSBkb3VibGUgc2lkZWQgY2FyZC4gSW4gdGhpc1xuICAvLyBjYXNlIHdlIHdhbnQgdG8gZGlzcGxheSB0aGUgaW1hZ2UgZnJvbSBmYWNlIG9uZSBvZiB0aGUgY2FyZC5cbiAgZWxzZSByZXR1cm4gY2FyZC5jYXJkX2ZhY2VzWzBdLmltYWdlX3VyaXMubm9ybWFsO1xufTtcblxuLy8gQ3JlYXRlIHRoZSBob3ZlciBlZmZlY3Qgb24gZWFjaCByb3cgdGhhdCBkaXNwbGF5cyB0aGUgaW1hZ2Ugb2YgdGhlIGNhcmRcbmV4cG9ydCBjb25zdCBjaGVja0xpc3RIb3ZlckV2ZW50cyA9ICgpID0+IHtcbiAgLy8gR2V0IHRoZSBIVE1MIGZvciBlYWNoIHRhYmxlIHJvd1xuICBjb25zdCByb3dzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWNoZWNrbGlzdC1yb3cnKSk7XG5cbiAgcm93cy5mb3JFYWNoKChyb3cpID0+IHtcbiAgICByb3cub25tb3VzZW1vdmUgPSAoZSkgPT4ge1xuICAgICAgLy8gSWYgdGhlIHdpbmRvdyBpcyBzbWFsbGVyIHRoYW4gNzY4IHBpeGVscywgZG9uJ3QgZGlzcGxheSBhbnkgaW1hZ2VzXG4gICAgICBpZiAod2luZG93LmlubmVyV2lkdGggPCA3NjgpIHJldHVybiBmYWxzZTtcblxuICAgICAgLy8gSWYgdGhlcmUgaXMgYWxyZWFkeSBhbiBpbWFnZSBiZWluZyBkaXNwbGF5ZWQsIHJlbW92ZSBpdCBmcm9tIHRoZSBET01cbiAgICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudG9vbHRpcCcpKSB7XG4gICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRvb2x0aXAnKSk7XG4gICAgICB9XG5cbiAgICAgIC8vIFByZXAgdGhlIGRpdi5cbiAgICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgZGl2LmNsYXNzTmFtZSA9ICd0b29sdGlwJztcblxuICAgICAgLy8gVGhlIGRpdiBpcyBzdHlsZWQgd2l0aCBwb3NpdGlvbiBhYnNvbHV0ZS4gVGhpcyBjb2RlIHB1dHMgaXQganVzdCB0byB0aGUgcmlnaHQgb2YgdGhlIGN1cnNvclxuICAgICAgZGl2LnN0eWxlLmxlZnQgPSBlLnBhZ2VYICsgNTAgKyAncHgnO1xuICAgICAgZGl2LnN0eWxlLnRvcCA9IGUucGFnZVkgLSAzMCArICdweCc7XG5cbiAgICAgIC8vIFByZXAgdGhlIGltZyBlbGVtZW50XG4gICAgICBjb25zdCBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcbiAgICAgIGltZy5jbGFzc05hbWUgPSAndG9vbHRpcF9faW1nJztcbiAgICAgIGltZy5zcmMgPSByb3cuZGF0YXNldC5jYXJkSW1nO1xuXG4gICAgICAvLyBQdXQgdGhlIGltZyBpbnRvIHRoZSBkaXYgYW5kIHRoZW4gYXBwZW5kIHRoZSBkaXYgZGlyZWN0bHkgdG8gdGhlIGJvZHkgb2YgdGhlIGRvY3VtZW50LlxuICAgICAgZGl2LmFwcGVuZENoaWxkKGltZyk7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpdik7XG4gICAgfTtcblxuICAgIC8vIFJlbW92ZSB0aGUgaW1nIHdoZW4gdGFraW5nIHRoZSBjdXJzb3Igb2ZmIHRoZSByb3dcbiAgICByb3cub25tb3VzZW91dCA9IChlKSA9PiB7XG4gICAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRvb2x0aXAnKSkge1xuICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50b29sdGlwJykpO1xuICAgICAgfVxuICAgIH07XG4gIH0pO1xufTtcblxuY29uc3QgY2hhbmdlSGVhZGVyRm9yU21hbGxDaGVja2xpc3QgPSAoY2FyZHMpID0+IHtcbiAgaWYgKGNhcmRzLmxlbmd0aCA8IDMwKVxuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcignLmpzLS1jYXJkLWNoZWNrbGlzdC1oZWFkZXInKVxuICAgICAgLmNsYXNzTGlzdC5hZGQoJ2NhcmQtY2hlY2tsaXN0LWhlYWRlcicpO1xufTtcblxuLy8gRnVuY2l0b24gdG8gYmUgdXNlZCBpbiBpbmRleC5qcy4gVGFrZXMgY2FyZSBvZiBhbGwgbmVjZXNzYXJ5IHN0ZXBzIHRvIGRpc3BsYXkgY2FyZHMgYXMgYSBjaGVja2xpc3RcbmV4cG9ydCBjb25zdCBkaXNwbGF5Q2hlY2tsaXN0ID0gKGNhcmRzKSA9PiB7XG4gIGNsZWFyUmVzdWx0cygpO1xuICBwcmVwQ2hlY2tsaXN0Q29udGFpbmVyKCk7XG4gIGNoYW5nZUhlYWRlckZvclNtYWxsQ2hlY2tsaXN0KGNhcmRzKTtcbiAgZ2VuZXJhdGVDaGVja2xpc3QoY2FyZHMpO1xuICBjaGVja0Zvck1pc3NpbmdQcmljZSgpO1xuICBjaGVja0xpc3RIb3ZlckV2ZW50cygpO1xufTtcblxuZXhwb3J0IGNvbnN0IGNob3NlU2VsZWN0TWVudVNvcnQgPSAobWVudSwgc3RhdGUpID0+IHtcbiAgLy8gQ3JlYXRlIGFuIGFycmF5IGZyb20gdGhlIEhUTUwgc2VsZWN0IG1lbnVcbiAgY29uc3Qgb3B0aW9ucyA9IEFycmF5LmZyb20obWVudSk7XG5cbiAgb3B0aW9ucy5mb3JFYWNoKChvcHRpb24sIGkpID0+IHtcbiAgICAvLyBJZiB0aGUgb3B0aW9uIHZhbHVlIG1hdGNoZXMgdGhlIHNvcnQgbWV0aG9kIGZyb20gdGhlIFVSTCwgc2V0IGl0IHRvIHRoZSBzZWxlY3RlZCBpdGVtXG4gICAgaWYgKG9wdGlvbi52YWx1ZSA9PT0gc3RhdGUuc29ydE1ldGhvZCkgbWVudS5zZWxlY3RlZEluZGV4ID0gaTtcbiAgfSk7XG59O1xuXG5leHBvcnQgY29uc3QgY2hvc2VTZWxlY3RNZW51RGlzcGxheSA9IChtZW51LCBzdGF0ZSkgPT4ge1xuICAvLyBDcmVhdGUgYW4gYXJyYXkgZnJvbSB0aGUgSFRNTCBzZWxlY3QgbWVudVxuICBjb25zdCBvcHRpb25zID0gQXJyYXkuZnJvbShtZW51KTtcblxuICBvcHRpb25zLmZvckVhY2goKG9wdGlvbiwgaSkgPT4ge1xuICAgIC8vIElmIHRoZSBvcHRpb24gdmFsdWUgbWF0Y2hlcyB0aGUgc29ydCBtZXRob2QgZnJvbSB0aGUgVVJMLCBzZXQgaXQgdG8gdGhlIHNlbGVjdGVkIGl0ZW1cbiAgICBpZiAob3B0aW9uLnZhbHVlID09PSBzdGF0ZS5kaXNwbGF5KSBtZW51LnNlbGVjdGVkSW5kZXggPSBpO1xuICB9KTtcbn07XG5cbi8vIEZ1bmN0aW9uIHRvIGNoYW5nZSB0aGUgc29ydCBtZXRob2QgYmFzZWQgb24gdGhlIGlucHV0IGZyb20gdGhlIHVzZXJcbmV4cG9ydCBjb25zdCBjaGFuZ2VTb3J0TWV0aG9kID0gKHN0YXRlKSA9PiB7XG4gIC8vIEdldCB0aGUgY3VycmVudCBzb3J0IG1ldGhvZCBmcm9tIHRoZSBlbmQgb2YgdGhlIFVSTFxuICBjb25zdCBjdXJyZW50U29ydE1ldGhvZCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zdWJzdHJpbmcoXG4gICAgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLmxhc3RJbmRleE9mKCc9JykgKyAxXG4gICk7XG5cbiAgLy8gR3JhYiB0aGUgZGVzaXJlZCBzb3J0IG1ldGhvZCBmcm9tIHRoZSB1c2VyXG4gIGNvbnN0IG5ld1NvcnRNZXRob2QgPSBlbGVtZW50cy5yZXN1bHRzUGFnZS5zb3J0QnkoKS52YWx1ZTtcblxuICAvLyBJZiB0aGUgbmV3IHNvcnQgbWV0aG9kIGlzIG5vdCBkaWZmZXJlbnQsIGV4aXQgdGhlIGZ1bmN0aW9uIGFzIHRvIG5vdCBwdXNoIGEgbmV3IHN0YXRlXG4gIGlmIChjdXJyZW50U29ydE1ldGhvZCA9PT0gbmV3U29ydE1ldGhvZCkge1xuICAgIHJldHVybjtcbiAgfSBlbHNlIHtcbiAgICAvLyBEaXNhYmxlIGFsbCBmb3VyIGJ1dHRvbnNcbiAgICAvLyBPbmx5IGRvaW5nIHRoaXMgYmVjYXVzZSBmaXJlZm94IHJlcXVpcmVzIGEgY3RybCBmNVxuICAgIGRpc2FibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UuZmlyc3RQYWdlQnRuKTtcbiAgICBkaXNhYmxlQnRuKGVsZW1lbnRzLnJlc3VsdHNQYWdlLm5leHRQYWdlQnRuKCkpO1xuICAgIGRpc2FibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UucHJldmlvdXNQYWdlQnRuKCkpO1xuICAgIGRpc2FibGVCdG4oZWxlbWVudHMucmVzdWx0c1BhZ2UubGFzdFBhZ2VCdG4pO1xuXG4gICAgY29uc3QgY3VycmVudFBhdGhOYW1lID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnN1YnN0cmluZyhcbiAgICAgIDAsXG4gICAgICB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUubGFzdEluZGV4T2YoJz0nKSArIDFcbiAgICApO1xuXG4gICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBjdXJyZW50UGF0aE5hbWUgKyBuZXdTb3J0TWV0aG9kO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgY2hhbmdlRGlzcGxheUFuZFVybCA9IChzdGF0ZSkgPT4ge1xuICBjb25zdCBjdXJyZW50TWV0aG9kID0gc3RhdGUuZGlzcGxheTtcbiAgY29uc3QgbmV3TWV0aG9kID0gZWxlbWVudHMucmVzdWx0c1BhZ2UuZGlzcGxheVNlbGVjdG9yKCkudmFsdWU7XG5cbiAgaWYgKG5ld01ldGhvZCA9PT0gY3VycmVudE1ldGhvZCkgcmV0dXJuO1xuXG4gIC8vIFVwZGF0ZSB0aGUgc3RhdGUgd2l0aCBuZXcgZGlzcGxheSBtZXRob2RcbiAgc3RhdGUuZGlzcGxheSA9IG5ld01ldGhvZDtcblxuICAvLyBVcGRhdGUgdGhlIHVybCB3aXRob3V0IHB1c2hpbmcgdG8gdGhlIHNlcnZlclxuICBjb25zdCB0aXRsZSA9IGRvY3VtZW50LnRpdGxlO1xuICBjb25zdCBwYXRoTmFtZSA9IGAvcmVzdWx0cy8ke25ld01ldGhvZH0vJHtzdGF0ZS5xdWVyeX1gO1xuICBoaXN0b3J5LnB1c2hTdGF0ZShcbiAgICB7XG4gICAgICBjdXJyZW50SW5kZXg6IHN0YXRlLmN1cnJlbnRJbmRleCxcbiAgICAgIGRpc3BsYXk6IHN0YXRlLmRpc3BsYXksXG4gICAgfSxcbiAgICB0aXRsZSxcbiAgICBwYXRoTmFtZVxuICApO1xufTtcblxuZXhwb3J0IGNvbnN0IHVwZGF0ZURpc3BsYXkgPSAoc3RhdGUpID0+IHtcbiAgLy8gQ2xlYXIgYW55IGV4aXN0aW5nIEhUTUwgaW4gdGhlIGRpc3BsYXlcbiAgY2xlYXJSZXN1bHRzKCk7XG5cbiAgLy8gUmVmcmVzaCB0aGUgZGlzcGxheVxuICBpZiAoc3RhdGUuZGlzcGxheSA9PT0gJ2xpc3QnKVxuICAgIGRpc3BsYXlDaGVja2xpc3Qoc3RhdGUuYWxsQ2FyZHNbc3RhdGUuY3VycmVudEluZGV4XSk7XG4gIGlmIChzdGF0ZS5kaXNwbGF5ID09PSAnaW1hZ2VzJylcbiAgICBkaXNwYWx5SW1hZ2VzKHN0YXRlLmFsbENhcmRzW3N0YXRlLmN1cnJlbnRJbmRleF0pO1xufTtcblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKiogUEFHSU5BVElPTiAqKioqKioqKioqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuXG4vLyBXaWxsIGJlIGNhbGxlZCBkdXJpbmcgY2hhbmdpbmcgcGFnZXMuIFJlbW92ZXMgdGhlIGN1cnJlbnQgZWxlbWVudCBpbiB0aGUgYmFyXG5jb25zdCBjbGVhckRpc3BsYXlCYXIgPSAoKSA9PiB7XG4gIGNvbnN0IGRpc3BsYXlCYXJUZXh0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1kaXNwbGF5LWJhci10ZXh0Jyk7XG4gIGlmIChkaXNwbGF5QmFyVGV4dCkgZGlzcGxheUJhclRleHQucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChkaXNwbGF5QmFyVGV4dCk7XG59O1xuXG4vLyBLZWVwcyB0cmFjayBvZiB3aGVyZSB0aGUgdXNlciBpcyBpbiB0aGVyZSBsaXN0IG9mIGNhcmRzXG5jb25zdCBwYWdpbmF0aW9uVHJhY2tlciA9IChzdGF0ZSkgPT4ge1xuICB2YXIgYmVnLCBlbmQ7XG4gIGJlZyA9IChzdGF0ZS5jdXJyZW50SW5kZXggKyAxKSAqIDE3NSAtIDE3NDtcbiAgZW5kID0gc3RhdGUuY3VycmVudEluZGV4ICogMTc1ICsgc3RhdGUuYWxsQ2FyZHNbc3RhdGUuY3VycmVudEluZGV4XS5sZW5ndGg7XG5cbiAgcmV0dXJuIHsgYmVnLCBlbmQgfTtcbn07XG5cbmV4cG9ydCBjb25zdCB1cGRhdGVEaXNwbGF5QmFyID0gKHN0YXRlKSA9PiB7XG4gIGNvbnN0IG1hcmt1cCA9IGBcbiAgICAgICAgPHAgY2xhc3M9XCJhcGktcmVzdWx0cy1kaXNwbGF5X19kaXNwbGF5LWJhci10ZXh0IGpzLS1kaXNwbGF5LWJhci10ZXh0XCI+XG4gICAgICAgICAgICBEaXNwbGF5aW5nICR7cGFnaW5hdGlvblRyYWNrZXIoc3RhdGUpLmJlZ30gLSAke1xuICAgIHBhZ2luYXRpb25UcmFja2VyKHN0YXRlKS5lbmRcbiAgfSBvZiAke3N0YXRlLnNlYXJjaC5yZXN1bHRzLnRvdGFsX2NhcmRzfSBjYXJkc1xuICAgICAgICA8L3A+XG4gICAgYDtcblxuICBjbGVhckRpc3BsYXlCYXIoKTtcbiAgZWxlbWVudHMucmVzdWx0c1BhZ2UuZGlzcGxheUJhci5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWVuZCcsIG1hcmt1cCk7XG59O1xuXG5leHBvcnQgY29uc3QgZW5hYmxlQnRuID0gKGJ0bikgPT4ge1xuICBpZiAoYnRuLmRpc2FibGVkKSB7XG4gICAgYnRuLmNsYXNzTGlzdC5yZW1vdmUoXG4gICAgICAnYXBpLXJlc3VsdHMtZGlzcGxheV9fbmF2LXBhZ2luYXRpb24tY29udGFpbmVyLS1kaXNhYmxlZCdcbiAgICApO1xuICAgIGJ0bi5kaXNhYmxlZCA9IGZhbHNlO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgZGlzYWJsZUJ0biA9IChidG4pID0+IHtcbiAgaWYgKCFidG4uZGlzYWJsZWQpIHtcbiAgICBidG4uY2xhc3NMaXN0LmFkZChcbiAgICAgICdhcGktcmVzdWx0cy1kaXNwbGF5X19uYXYtcGFnaW5hdGlvbi1jb250YWluZXItLWRpc2FibGVkJ1xuICAgICk7XG4gICAgYnRuLmRpc2FibGVkID0gdHJ1ZTtcbiAgfVxufTtcblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKioqKioqKiogNDA0ICoqKioqKioqKioqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuXG5leHBvcnQgY29uc3QgZGlzcGxheTQwNCA9ICgpID0+IHtcbiAgY29uc3QgZGl2ID0gY3JlYXRlNDA0TWVzc2FnZSgpO1xuICBlbGVtZW50cy5yZXN1bHRzUGFnZS5yZXN1bHRzQ29udGFpbmVyLmFwcGVuZENoaWxkKGRpdik7XG59O1xuXG5jb25zdCBjcmVhdGU0MDREaXYgPSAoKSA9PiB7XG4gIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBkaXYuY2xhc3NMaXN0ID0gYG5vLXJlc3VsdHNgO1xuICByZXR1cm4gZGl2O1xufTtcblxuY29uc3QgY3JlYXRlNDA0aDMgPSAoKSA9PiB7XG4gIGNvbnN0IGgzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDMnKTtcbiAgaDMuY2xhc3NMaXN0ID0gYG5vLXJlc3VsdHNfX2gzYDtcbiAgaDMuaW5uZXJIVE1MID0gYE5vIGNhcmRzIGZvdW5kYDtcbiAgcmV0dXJuIGgzO1xufTtcblxuY29uc3QgY3JlYXRlNDA0cEVsZW1lbnQgPSAoKSA9PiB7XG4gIGNvbnN0IHAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XG4gIHAuY2xhc3NMaXN0ID0gYG5vLXJlc3VsdHNfX3BgO1xuICBwLmlubmVySFRNTCA9XG4gICAgXCJZb3VyIHNlYXJjaCBkaWRuJ3QgbWF0Y2ggYW55IGNhcmRzLiBHbyBiYWNrIHRvIHRoZSBzZWFyY2ggcGFnZSBhbmQgZWRpdCB5b3VyIHNlYXJjaFwiO1xuICByZXR1cm4gcDtcbn07XG5cbmNvbnN0IGNyZWF0ZTQwNEJ0biA9ICgpID0+IHtcbiAgY29uc3QgYnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICBidG4uY2xhc3NMaXN0ID0gYGJ0biBuby1yZXN1bHRzX19idG5gO1xuICBidG4uaHJlZiA9ICcvc2VhcmNoJztcbiAgYnRuLmlubmVySFRNTCA9ICdHbyBCYWNrJztcbiAgcmV0dXJuIGJ0bjtcbn07XG5cbmNvbnN0IGNyZWF0ZTQwNE1lc3NhZ2UgPSAoKSA9PiB7XG4gIGNvbnN0IGRpdiA9IGNyZWF0ZTQwNERpdigpO1xuICBjb25zdCBoMyA9IGNyZWF0ZTQwNGgzKCk7XG4gIGNvbnN0IHAgPSBjcmVhdGU0MDRwRWxlbWVudCgpO1xuICBjb25zdCBidG4gPSBjcmVhdGU0MDRCdG4oKTtcblxuICBkaXYuYXBwZW5kQ2hpbGQoaDMpO1xuICBkaXYuYXBwZW5kQ2hpbGQocCk7XG4gIGRpdi5hcHBlbmRDaGlsZChidG4pO1xuXG4gIHJldHVybiBkaXY7XG59O1xuIiwiaW1wb3J0IHsgZWxlbWVudHMgfSBmcm9tICcuL2Jhc2UnO1xuXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKiogVFlQRSBMSU5FICoqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG5cbmV4cG9ydCBjb25zdCBzaG93VHlwZXNEcm9wRG93biA9ICgpID0+IHtcbiAgaWYgKGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlRHJvcERvd24uaGFzQXR0cmlidXRlKCdoaWRkZW4nKSkge1xuICAgIGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlRHJvcERvd24ucmVtb3ZlQXR0cmlidXRlKCdoaWRkZW4nKTtcbiAgICBlbGVtZW50cy5hcGlTZWFyY2gudHlwZURyb3BEb3duLnNjcm9sbFRvcCA9IDA7XG4gICAgY29uc29sZS5sb2coJ3R5cGVzIGRyb3Bkb3duJyk7XG5cbiAgICAvLyBNYWtlIHN1cmUgdG8gZGlzcGxheSBhbGwgdHlwZXMgd2hlbiBvcGVuaW5nIHRoZSBkcm9wZG93biBhbmQgYmVmb3JlIHRha2luZyBpbnB1dFxuICAgIGZpbHRlclR5cGVzKCcnKTtcbiAgICBmaWx0ZXJTZWxlY3RlZFR5cGVzKCk7XG4gICAgZmlsdGVyVHlwZUhlYWRlcnMoKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGhpZGVUeXBlc0Ryb3BEb3duID0gKCkgPT4ge1xuICBpZiAoIWVsZW1lbnRzLmFwaVNlYXJjaC50eXBlRHJvcERvd24uaGFzQXR0cmlidXRlKCdoaWRkZW4nKSkge1xuICAgIGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlTGluZS52YWx1ZSA9ICcnO1xuICAgIGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlRHJvcERvd24uc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBuYXZpZ2F0ZVR5cGVzRHJvcERvd24pO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgZmlsdGVyVHlwZUhlYWRlcnMgPSAoKSA9PiB7XG4gIC8vIE9uIGV2ZXJ5IGlucHV0IGludG8gdGhlIHR5cGVsaW5lIGJhciwgbWFrZSBhbGwgaGVhZGVycyB2aXNpYmxlXG4gIGNvbnN0IGhlYWRlcnMgPSBBcnJheS5mcm9tKFxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tdHlwZXMtY2F0ZWdvcnktaGVhZGVyJylcbiAgKTtcbiAgaGVhZGVycy5mb3JFYWNoKChoZWFkZXIpID0+IHtcbiAgICBpZiAoaGVhZGVyLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIGhlYWRlci5yZW1vdmVBdHRyaWJ1dGUoJ2hpZGRlbicpO1xuICB9KTtcblxuICAvLyBGb3IgZWFjaCBjYXRlZ29yeSBvZiB0eXBlLCBpZiB0aGVyZSBhcmUgbm90IGFueSB2aXNpYmxlIGJlY2F1c2UgdGhleSB3ZXJlIGZpbHRlcmVkIG91dFxuICAvLyBoaWRlIHRoZSBoZWFkZXIgZm9yIHRoYXQgY2F0ZWdvcnlcbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWJhc2ljOm5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYmFzaWMtaGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXN1cGVyOm5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tc3VwZXItaGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFydGlmYWN0Om5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcignLmpzLS1hcnRpZmFjdC1oZWFkZXInKVxuICAgICAgLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgfVxuXG4gIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1lbmNoYW50bWVudDpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tZW5jaGFudG1lbnQtaGVhZGVyJylcbiAgICAgIC5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gIH1cblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tbGFuZDpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWxhbmQtaGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXNwZWxsOm5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tc3BlbGwtaGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXBsYW5lc3dhbGtlcjpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tcGxhbmVzd2Fsa2VyLWhlYWRlcicpXG4gICAgICAuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWNyZWF0dXJlOm5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcignLmpzLS1jcmVhdHVyZS1oZWFkZXInKVxuICAgICAgLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGZpbHRlclNlbGVjdGVkVHlwZXMgPSAoKSA9PiB7XG4gIGNvbnN0IHR5cGVzID0gQXJyYXkuZnJvbShcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS10eXBlXVtkYXRhLXNlbGVjdGVkXScpXG4gICk7XG5cbiAgdHlwZXMuZm9yRWFjaCgodHlwZSkgPT4ge1xuICAgIGlmICh0eXBlLmdldEF0dHJpYnV0ZSgnZGF0YS1zZWxlY3RlZCcpID09PSAndHJ1ZScpIHtcbiAgICAgIGlmICghdHlwZS5oYXNBdHRyaWJ1dGUoJ2hpZGRlbicpKSB0eXBlLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICB9XG4gIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IGZpbHRlclR5cGVzID0gKHN0cikgPT4ge1xuICBjb25zdCB0eXBlcyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtdHlwZV0nKSk7XG5cbiAgLy8gUmVtb3ZlIHRoZSBoaWRkZW4gYXR0cmlidXRlIGlmIGl0IGV4aXN0cyBvbiBhbnkgZWxlbWVudCwgYW5kIHRoZW4gaGlkZSBhbnkgZWxlbWVudHNcbiAgLy8gdGhhdCBkb24ndCBpbmNsdWRlIHRoZSBzdHJpbmcgZ2l2ZW4gaW4gdGhlIGlucHV0IGZyb20gdGhlIHVzZXJcbiAgdHlwZXMuZm9yRWFjaCgodHlwZSkgPT4ge1xuICAgIGlmICh0eXBlLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIHR5cGUucmVtb3ZlQXR0cmlidXRlKCdoaWRkZW4nKTtcbiAgICBpZiAoXG4gICAgICAhdHlwZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtdHlwZScpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc3RyLnRvTG93ZXJDYXNlKCkpXG4gICAgKSB7XG4gICAgICB0eXBlLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgICB9XG4gIH0pO1xuXG4gIGZpbHRlclNlbGVjdGVkVHlwZXMoKTtcbn07XG5cbmV4cG9ydCBjb25zdCBoaWdobGlnaHRUeXBlID0gKHR5cGUpID0+IHtcbiAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taGlnaGxpZ2h0ZWQnKSkgcmVtb3ZlQ3VycmVudEhpZ2hsaWdodCgpO1xuXG4gIGlmICh0eXBlKSB7XG4gICAgdHlwZS5jbGFzc0xpc3QuYWRkKFxuICAgICAgJ2pzLS1oaWdobGlnaHRlZCcsXG4gICAgICAnc2VhcmNoLWZvcm1fX2Ryb3Bkb3duLWxpc3Qtb3B0aW9uLS1oaWdobGlnaHRlZCdcbiAgICApO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgcmVtb3ZlQ3VycmVudEhpZ2hsaWdodCA9ICgpID0+IHtcbiAgZG9jdW1lbnRcbiAgICAucXVlcnlTZWxlY3RvcignLmpzLS1oaWdobGlnaHRlZCcpXG4gICAgLmNsYXNzTGlzdC5yZW1vdmUoXG4gICAgICAnanMtLWhpZ2hsaWdodGVkJyxcbiAgICAgICdzZWFyY2gtZm9ybV9fZHJvcGRvd24tbGlzdC1vcHRpb24tLWhpZ2hsaWdodGVkJ1xuICAgICk7XG59O1xuXG5leHBvcnQgY29uc3Qgc2V0U2Nyb2xsVG9wT25Eb3duQXJyb3cgPSAoZWwsIGRyb3Bkb3duKSA9PiB7XG4gIGlmIChcbiAgICBlbC5vZmZzZXRUb3AgPiBkcm9wZG93bi5vZmZzZXRIZWlnaHQgLSBlbC5vZmZzZXRIZWlnaHQgJiZcbiAgICBkcm9wZG93bi5zY3JvbGxUb3AgKyBkcm9wZG93bi5vZmZzZXRIZWlnaHQgLSBlbC5vZmZzZXRIZWlnaHQgPCBlbC5vZmZzZXRUb3BcbiAgKSB7XG4gICAgZHJvcGRvd24uc2Nyb2xsVG9wID0gZWwub2Zmc2V0VG9wIC0gZHJvcGRvd24ub2Zmc2V0SGVpZ2h0ICsgZWwub2Zmc2V0SGVpZ2h0O1xuICB9XG59O1xuXG5leHBvcnQgY29uc3Qgc2V0U2Nyb2xsVG9wT25VcEFycm93ID0gKGVsLCBkcm9wZG93bikgPT4ge1xuICBpZiAoZWwub2Zmc2V0VG9wIDwgZHJvcGRvd24uc2Nyb2xsVG9wKSB7XG4gICAgZHJvcGRvd24uc2Nyb2xsVG9wID0gZWwub2Zmc2V0VG9wO1xuXG4gICAgLy8gMzAgaXMgdGhlIGhlaWdodCBvZiBjYXRlZ29yeSBoZWFkZXJzLiBJZiB0aGUgY2F0ZWdvcnkgaGVhZGVyIGlzXG4gICAgLy8gdGhlIG9ubHkgZWxlbWVudCBsZWZ0IHRoYXQgaXMgbm90IHJldmVhbGVkLCBzZXQgdGVoIHNjcm9sbCB0b3AgdG8gMFxuICAgIGlmIChkcm9wZG93bi5zY3JvbGxUb3AgPD0gMzApIGRyb3Bkb3duLnNjcm9sbFRvcCA9IDA7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBuYXZpZ2F0ZVR5cGVzRHJvcERvd24gPSAoZSkgPT4ge1xuICBjb25zdCB0eXBlcyA9IEFycmF5LmZyb20oXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS10eXBlOm5vdChbaGlkZGVuXSknKVxuICApO1xuICBjb25zdCBpID0gdHlwZXMuaW5kZXhPZihkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWhpZ2hsaWdodGVkJykpO1xuXG4gIGlmIChlLmNvZGUgPT09ICdBcnJvd0Rvd24nICYmIGkgPCB0eXBlcy5sZW5ndGggLSAxKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHJlbW92ZUN1cnJlbnRIaWdobGlnaHQoKTtcbiAgICBoaWdobGlnaHRUeXBlKHR5cGVzW2kgKyAxXSk7XG5cbiAgICBzZXRTY3JvbGxUb3BPbkRvd25BcnJvdyh0eXBlc1tpICsgMV0sIGVsZW1lbnRzLmFwaVNlYXJjaC50eXBlRHJvcERvd24pO1xuICB9XG5cbiAgaWYgKGUuY29kZSA9PT0gJ0Fycm93VXAnKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgLy8gV2UgYWx3YXlzIHdhbnQgdG8gcHJldmVudCB0aGUgZGVmYXVsdC4gV2Ugb25seSB3YW50IHRvIGNoYW5nZSB0aGVcbiAgICAvLyBoaWdobGlnaHQgaWYgbm90IG9uIHRoZSB0b3AgdHlwZSBpbiB0aGUgZHJvcGRvd25cbiAgICBpZiAoaSA+IDApIHtcbiAgICAgIHJlbW92ZUN1cnJlbnRIaWdobGlnaHQoKTtcbiAgICAgIGhpZ2hsaWdodFR5cGUodHlwZXNbaSAtIDFdKTtcblxuICAgICAgc2V0U2Nyb2xsVG9wT25VcEFycm93KHR5cGVzW2kgLSAxXSwgZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVEcm9wRG93bik7XG4gICAgfVxuICB9XG5cbiAgaWYgKGUuY29kZSA9PT0gJ0VudGVyJykge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIHRvZ2dsZURhdGFTZWxlY3RlZChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWhpZ2hsaWdodGVkJykpO1xuICAgIGFkZFR5cGUoXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWhpZ2hsaWdodGVkJykuZ2V0QXR0cmlidXRlKCdkYXRhLXR5cGUnKVxuICAgICk7XG4gICAgaGlkZVR5cGVzRHJvcERvd24oKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGhvdmVyT3ZlclR5cGVzTGlzdGVuZXIgPSAoKSA9PiB7XG4gIGNvbnN0IHR5cGVzID0gQXJyYXkuZnJvbShcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLXR5cGU6bm90KFtoaWRkZW5dKScpXG4gICk7XG5cbiAgdHlwZXMuZm9yRWFjaCgodHlwZSkgPT4ge1xuICAgIHR5cGUuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsICgpID0+IGhpZ2hsaWdodFR5cGUodHlwZSkpO1xuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBzdGFydFR5cGVzRHJvcERvd25OYXZpZ2F0aW9uID0gKCkgPT4ge1xuICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgbmF2aWdhdGVUeXBlc0Ryb3BEb3duKTtcbiAgY29uc3QgZmlyc3RUeXBlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS10eXBlOm5vdChbaGlkZGVuXSknKTtcbiAgaGlnaGxpZ2h0VHlwZShmaXJzdFR5cGUpO1xuICBob3Zlck92ZXJUeXBlc0xpc3RlbmVyKCk7XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBuYXZpZ2F0ZVR5cGVzRHJvcERvd24pO1xuICBlbGVtZW50cy5hcGlTZWFyY2gudHlwZURyb3BEb3duLnNjcm9sbFRvcCA9IDA7XG59O1xuXG5jb25zdCByZW1vdmVUeXBlQnRuID0gKCkgPT4ge1xuICAvLyBTcGFuIHdpbGwgYWN0IGFzIHRoZSBidXR0b24gdG8gcmVtb3ZlIHR5cGVzIGZyb20gdGhlIFwic2VsZWN0ZWRcIiBsaXN0XG4gIGNvbnN0IGJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgYnRuLmNsYXNzTGlzdCA9XG4gICAgJ3NlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy1yZW1vdmUtYnRuIGpzLS1hcGktdHlwZXMtY2xvc2UtYnRuJztcbiAgYnRuLmlubmVySFRNTCA9ICd4JztcblxuICBidG4ub25jbGljayA9ICgpID0+IHtcbiAgICBjb25zdCB0eXBlTmFtZSA9IGJ0bi5uZXh0RWxlbWVudFNpYmxpbmcubmV4dEVsZW1lbnRTaWJsaW5nLmlubmVySFRNTDtcblxuICAgIGNvbnN0IHR5cGVUb1RvZ2dsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLXR5cGV8PSR7dHlwZU5hbWV9XWApO1xuXG4gICAgdG9nZ2xlRGF0YVNlbGVjdGVkKHR5cGVUb1RvZ2dsZSk7XG5cbiAgICBidG4ucGFyZW50RWxlbWVudC5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKGJ0bi5wYXJlbnRFbGVtZW50KTtcbiAgfTtcblxuICByZXR1cm4gYnRuO1xufTtcblxuY29uc3QgdHlwZVRvZ2dsZUJ0biA9ICgpID0+IHtcbiAgLy8gU3BhbiB3aWxsIGFjdCBhcyB0aGUgYnV0dG9uIHRvIHRvZ2dsZSB3aGV0aGVyIG9yIG5vdCBhIHR5cGUgaXMgaW5jbHVkZWQgb3IgZXhjbHVkZWQgZnJvbSB0aGUgc2VhcmNoXG4gIGNvbnN0IGJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgYnRuLmNsYXNzTGlzdCA9XG4gICAgJ3NlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy10b2dnbGVyIHNlYXJjaC1mb3JtX19zZWxlY3RlZC10eXBlcy10b2dnbGVyLS1pcyBqcy0tYXBpLXR5cGVzLXRvZ2dsZXInO1xuICBidG4uaW5uZXJIVE1MID0gJ0lTJztcblxuICAvKlxuICAgICAgICBUaGlzIHdpbGwgdG9nZ2xlIGJldHdlZW4gc2VhcmNoaW5nIGZvciBjYXJkcyB0aGF0IGluY2x1ZGUgdGhlIGdpdmVuIHR5cGUgYW5kIGV4Y2x1ZGUgdGhlIGdpdmVuIHR5cGUuXG4gICAgICAgIEl0IHdpbGwgbWFrZSBzdXJlIHRoYXQgdGhlIGFwcHJvcHJpYXRlIGRhdGEgdHlwZSBpcyBnaXZlbiB0byB0aGUgc3BhbiBlbGVtZW50IHRoYXQgY29udGFpbnMgdGhlIHR5cGVcbiAgICAgICAgU28gdGhhdCB0aGUgc2VhcmNoIGZ1bmN0aW9uYWxpdHkgY3JlYXRlcyB0aGUgYXBwcm9wcmlhdGUgcXVlcnkgc3RyaW5nXG5cbiAgICAqL1xuICBidG4ub25jbGljayA9ICgpID0+IHtcbiAgICBpZiAoYnRuLmlubmVySFRNTCA9PT0gJ0lTJykge1xuICAgICAgYnRuLmNsYXNzTGlzdCA9XG4gICAgICAgICdzZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlciBzZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlci0tbm90IGpzLS1hcGktdHlwZXMtdG9nZ2xlcic7XG4gICAgICBidG4ubmV4dEVsZW1lbnRTaWJsaW5nLnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS1pbmNsdWRlLXR5cGUnKTtcbiAgICAgIGJ0bi5uZXh0RWxlbWVudFNpYmxpbmcuc2V0QXR0cmlidXRlKFxuICAgICAgICAnZGF0YS1leGNsdWRlLXR5cGUnLFxuICAgICAgICBidG4ubmV4dEVsZW1lbnRTaWJsaW5nLmlubmVySFRNTFxuICAgICAgKTtcbiAgICAgIGJ0bi5pbm5lckhUTUwgPSAnTk9UJztcbiAgICB9IGVsc2Uge1xuICAgICAgYnRuLmNsYXNzTGlzdCA9XG4gICAgICAgICdzZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlciBzZWFyY2gtZm9ybV9fc2VsZWN0ZWQtdHlwZXMtdG9nZ2xlci0taXMganMtLWFwaS10eXBlcy10b2dnbGVyJztcbiAgICAgIGJ0bi5uZXh0RWxlbWVudFNpYmxpbmcucmVtb3ZlQXR0cmlidXRlKCdkYXRhLWV4Y2x1ZGUtdHlwZScpO1xuICAgICAgYnRuLm5leHRFbGVtZW50U2libGluZy5zZXRBdHRyaWJ1dGUoXG4gICAgICAgICdkYXRhLWluY2x1ZGUtdHlwZScsXG4gICAgICAgIGJ0bi5uZXh0RWxlbWVudFNpYmxpbmcuaW5uZXJIVE1MXG4gICAgICApO1xuICAgICAgYnRuLmlubmVySFRNTCA9ICdJUyc7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBidG47XG59O1xuXG5leHBvcnQgY29uc3QgdG9nZ2xlRGF0YVNlbGVjdGVkID0gKHR5cGVPclNldCkgPT4ge1xuICBpZiAodHlwZU9yU2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1zZWxlY3RlZCcpID09PSAndHJ1ZScpIHtcbiAgICB0eXBlT3JTZXQuc2V0QXR0cmlidXRlKCdkYXRhLXNlbGVjdGVkJywgJ2ZhbHNlJyk7XG4gIH0gZWxzZSB7XG4gICAgdHlwZU9yU2V0LnNldEF0dHJpYnV0ZSgnZGF0YS1zZWxlY3RlZCcsICd0cnVlJyk7XG4gIH1cbn07XG5cbmNvbnN0IGFkZFR5cGUgPSAodHlwZSkgPT4ge1xuICAvLyBDcmVhdGUgdGhlIGVtcHR5IGxpIGVsZW1lbnQgdG8gaG9sZCB0aGUgdHlwZXMgdGhhdCB0aGUgdXNlciBzZWxlY3RzLiBTZXQgdGhlIGNsYXNzIGxpc3QsXG4gIC8vIGFuZCB0aGUgZGF0YS1zZWxlY3RlZCBhdHRyaWJ1dGUgdG8gdHJ1ZS5cbiAgY29uc3QgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuICBsaS5jbGFzc0xpc3QgPSAnc2VhcmNoLWZvcm1fX3NlbGVjdGVkLXR5cGVzLWxpc3QtaXRlbSBqcy0tYXBpLXNlbGVjdGVkLXR5cGUnO1xuXG4gIC8vIFRoZSB0eXBlU3BhbiBob2xkcyB0aGUgdHlwZSBzZWxlY3RlZCBieSB0aGUgdXNlciBmcm9tIHRoZSBkcm9wZG93bi4gVGhlIGRhdGEgYXR0cmlidXRlXG4gIC8vIGlzIHVzZWQgaW4gU2VhcmNoLmpzIHRvIGJ1aWxkIHRoZSBxdWVyeSBzdHJpbmdcbiAgY29uc3QgdHlwZVNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gIHR5cGVTcGFuLnNldEF0dHJpYnV0ZSgnZGF0YS1pbmNsdWRlLXR5cGUnLCB0eXBlKTtcbiAgdHlwZVNwYW4uaW5uZXJIVE1MID0gdHlwZTtcblxuICAvLyBDb25zdHJ1Y3QgdGhlIGxpIGVsZW1lbnQuIFRoZSByZW1vdmVUeXBlQnRuIGFuZCB0eXBlVG9nZ2xlQnRuIGZ1bmNpdG9ucyByZXR1cm4gaHRtbCBlbGVtZW50c1xuICBsaS5hcHBlbmRDaGlsZChyZW1vdmVUeXBlQnRuKCkpO1xuICBsaS5hcHBlbmRDaGlsZCh0eXBlVG9nZ2xlQnRuKCkpO1xuICBsaS5hcHBlbmRDaGlsZCh0eXBlU3Bhbik7XG5cbiAgZWxlbWVudHMuYXBpU2VhcmNoLnNlbGVjdGVkVHlwZXMuYXBwZW5kQ2hpbGQobGkpO1xufTtcblxuZXhwb3J0IGNvbnN0IHR5cGVMaW5lTGlzdGVuZXIgPSAoZSkgPT4ge1xuICAvLyBJZiB0aGUgdGFyZ2V0IGlzIG5vdCBUeXBlIExpbmUgaW5wdXQgbGluZSwgb3IgYW4gZWxlbWVudCBpbiB0aGUgZHJvcGRvd24gbGlzdCxcbiAgLy8gY2xvc2UgdGhlIGRyb3Bkb3duIGFuZCByZW1vdmUgdGhlIGV2ZW50IGxpc3RlbmVyXG4gIGlmIChcbiAgICBlLnRhcmdldCAhPT0gZWxlbWVudHMuYXBpU2VhcmNoLnR5cGVMaW5lICYmXG4gICAgIWUudGFyZ2V0Lm1hdGNoZXMoJy5qcy0tYXBpLWRyb3Bkb3duLXR5cGVzLWxpc3QnKVxuICApIHtcbiAgICBoaWRlVHlwZXNEcm9wRG93bigpO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdHlwZUxpbmVMaXN0ZW5lcik7XG4gICAgLy8gSWYgdGhlIHRhcmdldCBpcyBvbmUgaWYgdHlwZXMsIGdldCB0aGUgZGF0YSB0eXBlXG4gIH0gZWxzZSBpZiAoZS50YXJnZXQuaGFzQXR0cmlidXRlKCdkYXRhLXR5cGUnKSkge1xuICAgIHRvZ2dsZURhdGFTZWxlY3RlZChlLnRhcmdldCk7XG4gICAgYWRkVHlwZShlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdHlwZScpKTtcbiAgICBlbGVtZW50cy5hcGlTZWFyY2gudHlwZUxpbmUuZm9jdXMoKTtcbiAgICBoaWRlVHlwZXNEcm9wRG93bigpO1xuICB9XG59O1xuXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKiogU0VUUyAqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG5cbmV4cG9ydCBjb25zdCBzaG93U2V0c0Ryb3BEb3duID0gKCkgPT4ge1xuICBpZiAoZWxlbWVudHMuYXBpU2VhcmNoLnNldERyb3BEb3duLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIHtcbiAgICBlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd24ucmVtb3ZlQXR0cmlidXRlKCdoaWRkZW4nKTtcbiAgICBlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd24uc2Nyb2xsVG9wID0gMDtcblxuICAgIGZpbHRlclNldHMoJycpO1xuICAgIGZpbHRlclNlbGVjdGVkU2V0cygpO1xuICAgIGZpbHRlclNldEhlYWRlcnMoKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGhpZGVTZXRzRHJvcERvd24gPSAoKSA9PiB7XG4gIGlmICghZWxlbWVudHMuYXBpU2VhcmNoLnNldERyb3BEb3duLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIHtcbiAgICBlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd24uc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIGVsZW1lbnRzLmFwaVNlYXJjaC5zZXRJbnB1dC52YWx1ZSA9ICcnO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBuYXZpZ2F0ZVNldHNEcm9wRG93bik7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBmaWx0ZXJTZXRIZWFkZXJzID0gKCkgPT4ge1xuICAvLyBPbiBldmVyeSBpbnB1dCBpbnRvIHRoZSB0eXBlbGluZSBiYXIsIG1ha2UgYWxsIGhlYWRlcnMgdmlzaWJsZVxuICBjb25zdCBoZWFkZXJzID0gQXJyYXkuZnJvbShcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLXNldHMtY2F0ZWdvcnktaGVhZGVyJylcbiAgKTtcbiAgaGVhZGVycy5mb3JFYWNoKChoZWFkZXIpID0+IHtcbiAgICBpZiAoaGVhZGVyLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIGhlYWRlci5yZW1vdmVBdHRyaWJ1dGUoJ2hpZGRlbicpO1xuICB9KTtcblxuICAvLyBGb3IgZWFjaCBjYXRlZ29yeSBvZiB0eXBlLCBpZiB0aGVyZSBhcmUgbm90IGFueSB2aXNpYmxlIGJlY2F1c2UgdGhleSB3ZXJlIGZpbHRlcmVkIG91dFxuICAvLyBoaWRlIHRoZSBoZWFkZXIgZm9yIHRoYXQgY2F0ZWdvcnlcbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWV4cGFuc2lvbjpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tZXhwYW5zaW9uLWhlYWRlcicpXG4gICAgICAuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWNvcmU6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1jb3JlLWhlYWRlcicpLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgfVxuXG4gIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1tYXN0ZXJzOm5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcignLmpzLS1tYXN0ZXJzLWhlYWRlcicpXG4gICAgICAuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWRyYWZ0Om5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tZHJhZnQtaGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWR1ZWxfZGVjazpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tZHVlbF9kZWNrLWhlYWRlcicpXG4gICAgICAuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFyY2hlbmVteTpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXJjaGVuZW15LWhlYWRlcicpXG4gICAgICAuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWJveDpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWJveC1oZWFkZXInKS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gIH1cblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tY29tbWFuZGVyOm5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcignLmpzLS1jb21tYW5kZXItaGVhZGVyJylcbiAgICAgIC5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gIH1cblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tdmF1bHQ6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS12YXVsdC1oZWFkZXInKS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gIH1cblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tZnVubnk6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1mdW5ueS1oZWFkZXInKS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gIH1cblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tbWFzdGVycGllY2U6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yKCcuanMtLW1hc3RlcnBpZWNlLWhlYWRlcicpXG4gICAgICAuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLW1lbW9yYWJpbGlhOm5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcignLmpzLS1tZW1vcmFiaWxpYS1oZWFkZXInKVxuICAgICAgLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgfVxuXG4gIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1wbGFuZWNoYXNlOm5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcignLmpzLS1wbGFuZWNoYXNlLWhlYWRlcicpXG4gICAgICAuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXByZW1pdW1fZGVjazpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tcHJlbWl1bV9kZWNrLWhlYWRlcicpXG4gICAgICAuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXByb21vOm5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tcHJvbW8taGVhZGVyJykuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXNwZWxsYm9vazpub3QoW2hpZGRlbl0pJykpIHtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoJy5qcy0tc3BlbGxib29rLWhlYWRlcicpXG4gICAgICAuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXN0YXJ0ZXI6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yKCcuanMtLXN0YXJ0ZXItaGVhZGVyJylcbiAgICAgIC5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gIH1cblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tdG9rZW46bm90KFtoaWRkZW5dKScpKSB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS10b2tlbi1oZWFkZXInKS5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gIH1cblxuICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tdHJlYXN1cmVfY2hlc3Q6bm90KFtoaWRkZW5dKScpKSB7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yKCcuanMtLXRyZWFzdXJlX2NoZXN0LWhlYWRlcicpXG4gICAgICAuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICB9XG5cbiAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLXZhbmd1YXJkOm5vdChbaGlkZGVuXSknKSkge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcignLmpzLS12YW5ndWFyZC1oZWFkZXInKVxuICAgICAgLnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJ3RydWUnKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGZpbHRlclNldHMgPSAoc3RyKSA9PiB7XG4gIC8vIGdldCBhbGwgb2YgdGhlIHNldHMgb3V0IG9mIHRoZSBkcm9wZG93biBsaXN0XG4gIGNvbnN0IHNldHMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLXNldC1uYW1lXScpKTtcblxuICAvLyBSZW1vdmUgdGhlIGhpZGRlbiBhdHRyaWJ1dGUgaWYgaXQgZXhpc3RzIG9uIGFueSBlbGVtZW50LCBhbmQgdGhlbiBoaWRlIGFueSBlbGVtZW50c1xuICAvLyB0aGF0IGRvbid0IGluY2x1ZGUgdGhlIHN0cmluZyBnaXZlbiBpbiB0aGUgaW5wdXQgZnJvbSB0aGUgdXNlclxuICBzZXRzLmZvckVhY2goKHMpID0+IHtcbiAgICBpZiAocy5oYXNBdHRyaWJ1dGUoJ2hpZGRlbicpKSBzLnJlbW92ZUF0dHJpYnV0ZSgnaGlkZGVuJyk7XG5cbiAgICBmaWx0ZXJTZWxlY3RlZFNldHMoKTtcblxuICAgIGlmIChcbiAgICAgICFzXG4gICAgICAgIC5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2V0LW5hbWUnKVxuICAgICAgICAudG9Mb3dlckNhc2UoKVxuICAgICAgICAuaW5jbHVkZXMoc3RyLnRvTG93ZXJDYXNlKCkpICYmXG4gICAgICAhcy5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2V0LWNvZGUnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHN0ci50b0xvd2VyQ2FzZSgpKVxuICAgICkge1xuICAgICAgcy5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICd0cnVlJyk7XG4gICAgfVxuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBmaWx0ZXJTZWxlY3RlZFNldHMgPSAoKSA9PiB7XG4gIGNvbnN0IHNldHMgPSBBcnJheS5mcm9tKFxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLXNldC1uYW1lXVtkYXRhLXNlbGVjdGVkXScpXG4gICk7XG5cbiAgc2V0cy5mb3JFYWNoKChzKSA9PiB7XG4gICAgaWYgKHMuZ2V0QXR0cmlidXRlKCdkYXRhLXNlbGVjdGVkJykgPT09ICd0cnVlJykge1xuICAgICAgaWYgKCFzLmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykpIHMuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAndHJ1ZScpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5leHBvcnQgY29uc3QgaGlnaGxpZ2h0U2V0ID0gKHNldHQpID0+IHtcbiAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taGlnaGxpZ2h0ZWQnKSkgcmVtb3ZlQ3VycmVudEhpZ2hsaWdodCgpO1xuXG4gIGlmIChzZXR0KSB7XG4gICAgc2V0dC5jbGFzc0xpc3QuYWRkKFxuICAgICAgJ2pzLS1oaWdobGlnaHRlZCcsXG4gICAgICAnc2VhcmNoLWZvcm1fX2Ryb3Bkb3duLWxpc3Qtb3B0aW9uLS1oaWdobGlnaHRlZCdcbiAgICApO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgbmF2aWdhdGVTZXRzRHJvcERvd24gPSAoZSkgPT4ge1xuICBjb25zdCBzZXRzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLXNldDpub3QoW2hpZGRlbl0pJykpO1xuICBjb25zdCBpID0gc2V0cy5pbmRleE9mKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taGlnaGxpZ2h0ZWQnKSk7XG5cbiAgaWYgKGUuY29kZSA9PT0gJ0Fycm93RG93bicgJiYgaSA8IHNldHMubGVuZ3RoIC0gMSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICByZW1vdmVDdXJyZW50SGlnaGxpZ2h0KCk7XG4gICAgaGlnaGxpZ2h0U2V0KHNldHNbaSArIDFdKTtcblxuICAgIHNldFNjcm9sbFRvcE9uRG93bkFycm93KHNldHNbaSArIDFdLCBlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd24pO1xuICB9XG5cbiAgaWYgKGUuY29kZSA9PT0gJ0Fycm93VXAnICYmIGkgPiAwKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHJlbW92ZUN1cnJlbnRIaWdobGlnaHQoKTtcbiAgICBoaWdobGlnaHRTZXQoc2V0c1tpIC0gMV0pO1xuXG4gICAgc2V0U2Nyb2xsVG9wT25VcEFycm93KHNldHNbaSAtIDFdLCBlbGVtZW50cy5hcGlTZWFyY2guc2V0RHJvcERvd24pO1xuICB9XG5cbiAgaWYgKGUuY29kZSA9PT0gJ0VudGVyJykge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIHRvZ2dsZURhdGFTZWxlY3RlZChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWhpZ2hsaWdodGVkJykpO1xuICAgIGFkZFNldChcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taGlnaGxpZ2h0ZWQnKS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2V0LW5hbWUnKSxcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0taGlnaGxpZ2h0ZWQnKS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2V0LWNvZGUnKVxuICAgICk7XG4gICAgaGlkZVNldHNEcm9wRG93bigpO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgaG92ZXJPdmVyU2V0c0xpc3RlbmVyID0gKCkgPT4ge1xuICBjb25zdCBzZXRzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLXNldDpub3QoW2hpZGRlbl0pJykpO1xuXG4gIHNldHMuZm9yRWFjaCgocykgPT4ge1xuICAgIHMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsICgpID0+IGhpZ2hsaWdodFR5cGUocykpO1xuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBzdGFydFNldHNEcm9wRG93bk5hdmlnYXRpb24gPSAoKSA9PiB7XG4gIGNvbnN0IGZpcnN0U2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLS1zZXQ6bm90KFtoaWRkZW5dKScpO1xuICBoaWdobGlnaHRTZXQoZmlyc3RTZXQpO1xuICBob3Zlck92ZXJTZXRzTGlzdGVuZXIoKTtcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG5hdmlnYXRlU2V0c0Ryb3BEb3duKTtcbiAgZWxlbWVudHMuYXBpU2VhcmNoLnNldERyb3BEb3duLnNjcm9sbFRvcCA9IDA7XG59O1xuXG5jb25zdCByZW1vdmVTZXRCdG4gPSAoKSA9PiB7XG4gIC8vIFNwYW4gd2lsbCBhY3QgYXMgdGhlIGJ1dHRvbiB0byByZW1vdmUgc2V0cyBmcm9tIHRoZSBcInNlbGVjdGVkXCIgbGlzdFxuICBjb25zdCBidG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gIGJ0bi5jbGFzc0xpc3QgPVxuICAgICdzZWFyY2gtZm9ybV9fc2VsZWN0ZWQtc2V0cy1yZW1vdmUtYnRuIGpzLS1hcGktc2V0cy1jbG9zZS1idG4nO1xuICBidG4uaW5uZXJIVE1MID0gJ3gnO1xuXG4gIGJ0bi5vbmNsaWNrID0gKCkgPT4ge1xuICAgIGNvbnN0IHNldE5hbWUgPSBidG4ubmV4dEVsZW1lbnRTaWJsaW5nLmlubmVySFRNTDtcbiAgICBjb25zdCBzZXRUb1RvZ2dsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLXNldC1uYW1lfD0ke3NldE5hbWV9XWApO1xuICAgIHRvZ2dsZURhdGFTZWxlY3RlZChzZXRUb1RvZ2dsZSk7XG5cbiAgICBidG4ucGFyZW50RWxlbWVudC5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKGJ0bi5wYXJlbnRFbGVtZW50KTtcbiAgfTtcblxuICByZXR1cm4gYnRuO1xufTtcblxuY29uc3QgYWRkU2V0ID0gKHNldE5hbWUsIHNldENvZGUpID0+IHtcbiAgLy8gQ3JlYXRlIHRoZSBlbXB0eSBsaSBlbGVtZW50IHRvIGhvbGQgdGhlIHR5cGVzIHRoYXQgdGhlIHVzZXIgc2VsZWN0cy4gU2V0IHRoZSBjbGFzcyBsaXN0LFxuICAvLyBhbmQgdGhlIGRhdGEtc2VsZWN0ZWQgYXR0cmlidXRlIHRvIHRydWUuXG4gIGNvbnN0IGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgbGkuY2xhc3NMaXN0ID0gJ3NlYXJjaC1mb3JtX19zZWxlY3RlZC1zZXRzLWxpc3QtaXRlbSBqcy0tYXBpLXNlbGVjdGVkLXNldCc7XG5cbiAgLy8gVGhlIHR5cGVTcGFuIGhvbGRzIHRoZSB0eXBlIHNlbGVjdGVkIGJ5IHRoZSB1c2VyIGZyb20gdGhlIGRyb3Bkb3duLiBUaGUgZGF0YSBhdHRyaWJ1dGVcbiAgLy8gaXMgdXNlZCBpbiBTZWFyY2guanMgdG8gYnVpbGQgdGhlIHF1ZXJ5IHN0cmluZ1xuICBjb25zdCBzZXRTcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICBzZXRTcGFuLnNldEF0dHJpYnV0ZSgnZGF0YS1pbmNsdWRlLXNldCcsIHNldENvZGUpO1xuICBzZXRTcGFuLmlubmVySFRNTCA9IHNldE5hbWU7XG5cbiAgbGkuYXBwZW5kQ2hpbGQocmVtb3ZlU2V0QnRuKCkpO1xuICBsaS5hcHBlbmRDaGlsZChzZXRTcGFuKTtcblxuICBlbGVtZW50cy5hcGlTZWFyY2guc2VsZWN0ZWRTZXRzLmFwcGVuZENoaWxkKGxpKTtcbn07XG5cbmV4cG9ydCBjb25zdCBzZXRJbnB1dExpc3RlbmVyID0gKGUpID0+IHtcbiAgLy8gSWYgdGhlIHRhcmdldCBpcyBub3QgdGhlIHNldCBpbnB1dCBmaWVsZCwgb3IgYW4gZWxlbWVudCBpbiB0aGUgZHJvcGRvd24gbGlzdCxcbiAgLy8gY2xvc2UgdGhlIGRyb3Bkb3duIGFuZCByZW1vdmUgdGhlIGV2ZW50IGxpc3RlbmVyXG4gIGlmIChcbiAgICBlLnRhcmdldCAhPT0gZWxlbWVudHMuYXBpU2VhcmNoLnNldElucHV0ICYmXG4gICAgIWUudGFyZ2V0Lm1hdGNoZXMoJy5qcy0tYXBpLWRyb3Bkb3duLXNldHMtbGlzdCcpXG4gICkge1xuICAgIGhpZGVTZXRzRHJvcERvd24oKTtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHNldElucHV0TGlzdGVuZXIpO1xuICAgIC8vIElmIHRoZSB0YXJnZXQgaXMgb25lIG9mIHRoZSBzZXQgb3B0aW9ucywgdG9nZ2xlIGl0IGFzIHNlbGVjdGVkLCBhZGQgaXQgdG8gdGhlIGxpc3QsXG4gICAgLy8gYW5kIGhpZGUgdGhlIGRyb3Bkb3duLlxuICB9IGVsc2UgaWYgKGUudGFyZ2V0Lmhhc0F0dHJpYnV0ZSgnZGF0YS1zZXQtbmFtZScpKSB7XG4gICAgdG9nZ2xlRGF0YVNlbGVjdGVkKGUudGFyZ2V0KTtcbiAgICBhZGRTZXQoXG4gICAgICBlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2V0LW5hbWUnKSxcbiAgICAgIGUudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1zZXQtY29kZScpXG4gICAgKTtcbiAgICBlbGVtZW50cy5hcGlTZWFyY2guc2V0SW5wdXQuZm9jdXMoKTtcbiAgICBoaWRlU2V0c0Ryb3BEb3duKCk7XG4gIH1cbn07XG5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuLy8gKioqKioqKioqKioqIFNUQVRTICoqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxcXFxcblxuZXhwb3J0IGNvbnN0IHN0YXRMaW5lQ29udHJvbGxlciA9ICgpID0+IHtcbiAgaWYgKGNoZWNrU3RhdExpbmVGb3JJbnRlZ2VyKCkgJiYgY2hlY2tGb3JMZXNzVGhhbkZvdXJTdGF0TGluZXMoKSkge1xuICAgIGNvbnN0IGNsb25lID0gY3JlYXRlU3RhdHNDbG9uZSgpO1xuICAgIGVkaXRTdGF0c0Nsb25lKGNsb25lKTtcbiAgICBpbnNlcnRTdGF0c0Nsb25lKGNsb25lKTtcbiAgICByZXNldFN0YXRMaW5lRXZlbnRMaXN0ZW5lcigpO1xuICB9XG59O1xuXG5jb25zdCBjaGVja1N0YXRMaW5lRm9ySW50ZWdlciA9ICgpID0+IHtcbiAgY29uc3Qgc3RhdFZhbCA9IEFycmF5LmZyb20oXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1hcGktc3RhdC12YWx1ZScpXG4gICkuc2xpY2UoLTEpWzBdO1xuXG4gIHJldHVybiBwYXJzZUludChzdGF0VmFsLnZhbHVlKSA+PSAwID8gdHJ1ZSA6IGZhbHNlO1xufTtcblxuY29uc3QgY2hlY2tGb3JMZXNzVGhhbkZvdXJTdGF0TGluZXMgPSAoKSA9PiB7XG4gIGNvbnN0IHN0YXRzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWFwaS1zdGF0LXZhbHVlJykpO1xuXG4gIHJldHVybiBzdGF0cy5sZW5ndGggPCA0ID8gdHJ1ZSA6IGZhbHNlO1xufTtcblxuY29uc3QgY3JlYXRlU3RhdHNDbG9uZSA9ICgpID0+IHtcbiAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy0tYXBpLXN0YXRzLXdyYXBwZXInKS5jbG9uZU5vZGUodHJ1ZSk7XG59O1xuXG5jb25zdCBlZGl0U3RhdHNDbG9uZSA9IChjbG9uZSkgPT4ge1xuICBjbG9uZS5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1zdGF0JykudmFsdWUgPSAnJztcbiAgY2xvbmUucXVlcnlTZWxlY3RvcignLmpzLS1hcGktc3RhdC1maWx0ZXInKS52YWx1ZSA9ICcnO1xuICBjbG9uZS5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1zdGF0LXZhbHVlJykudmFsdWUgPSAnJztcbn07XG5cbmNvbnN0IGluc2VydFN0YXRzQ2xvbmUgPSAoY2xvbmUpID0+IHtcbiAgY29uc3QgbGFzdFN0YXRMaW5lID0gQXJyYXkuZnJvbShcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtLWFwaS1zdGF0cy13cmFwcGVyJylcbiAgKS5zbGljZSgtMSlbMF07XG5cbiAgbGFzdFN0YXRMaW5lLmluc2VydEFkamFjZW50RWxlbWVudCgnYWZ0ZXJlbmQnLCBjbG9uZSk7XG59O1xuXG5jb25zdCByZXNldFN0YXRMaW5lRXZlbnRMaXN0ZW5lciA9ICgpID0+IHtcbiAgY29uc3Qgc3RhdFZhbHVlcyA9IEFycmF5LmZyb20oXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1hcGktc3RhdC12YWx1ZScpXG4gICk7XG4gIHN0YXRWYWx1ZXMuc2xpY2UoLTIpWzBdLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2lucHV0Jywgc3RhdExpbmVDb250cm9sbGVyKTtcbiAgc3RhdFZhbHVlcy5zbGljZSgtMSlbMF0uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCBzdGF0TGluZUNvbnRyb2xsZXIpO1xufTtcblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcXFxcXG4vLyAqKioqKioqKiogTEVHQUwgU1RBVFVTICoqKioqKioqIFxcXFxcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXFxcXFxuXG5leHBvcnQgY29uc3QgZm9ybWF0TGluZUNvbnRyb2xsZXIgPSAoKSA9PiB7XG4gIGNvbnNvbGUubG9nKGNoZWNrRm9yRm91ckxlc3NUaGFuRm9ybWF0TGluZXMoKSk7XG4gIGlmIChjaGVja0ZvckZvdXJMZXNzVGhhbkZvcm1hdExpbmVzKCkgJiYgY2hlY2tGb3JtYXRMaW5lRm9yVmFsdWUoKSkge1xuICAgIGNvbnN0IGNsb25lID0gY3JlYXRlRm9ybWF0Q2xvbmUoKTtcbiAgICBlZGl0Rm9ybWF0Q2xvbmUoY2xvbmUpO1xuICAgIGluc2VydEZvcm1hdENsb25lKGNsb25lKTtcbiAgICByZXNldEZvcm1hdExpbmVFdmVudExpc3RlbmVyKCk7XG4gIH1cbn07XG5cbmNvbnN0IGNoZWNrRm9ybWF0TGluZUZvclZhbHVlID0gKCkgPT4ge1xuICBjb25zdCBmb3JtYXQgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tYXBpLWZvcm1hdCcpKS5zbGljZShcbiAgICAtMVxuICApWzBdO1xuXG4gIHJldHVybiBmb3JtYXQudmFsdWUgIT09ICcnID8gdHJ1ZSA6IGZhbHNlO1xufTtcblxuY29uc3QgY2hlY2tGb3JGb3VyTGVzc1RoYW5Gb3JtYXRMaW5lcyA9ICgpID0+IHtcbiAgY29uc3QgZm9ybWF0cyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLS1hcGktZm9ybWF0JykpO1xuICByZXR1cm4gZm9ybWF0cy5sZW5ndGggPCA0ID8gdHJ1ZSA6IGZhbHNlO1xufTtcblxuY29uc3QgY3JlYXRlRm9ybWF0Q2xvbmUgPSAoKSA9PiB7XG4gIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1mb3JtYXQtd3JhcHBlcicpLmNsb25lTm9kZSh0cnVlKTtcbn07XG5cbmNvbnN0IGVkaXRGb3JtYXRDbG9uZSA9IChjbG9uZSkgPT4ge1xuICBjbG9uZS5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1sZWdhbC1zdGF0dXMnKS52YWx1ZSA9ICcnO1xuICBjbG9uZS5xdWVyeVNlbGVjdG9yKCcuanMtLWFwaS1mb3JtYXQnKS52YWx1ZSA9ICcnO1xufTtcblxuY29uc3QgaW5zZXJ0Rm9ybWF0Q2xvbmUgPSAoY2xvbmUpID0+IHtcbiAgY29uc3QgbGFzdEZvcm1hdExpbmUgPSBBcnJheS5mcm9tKFxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tYXBpLWZvcm1hdC13cmFwcGVyJylcbiAgKS5zbGljZSgtMSlbMF07XG5cbiAgbGFzdEZvcm1hdExpbmUuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KCdhZnRlcmVuZCcsIGNsb25lKTtcbn07XG5cbmNvbnN0IHJlc2V0Rm9ybWF0TGluZUV2ZW50TGlzdGVuZXIgPSAoKSA9PiB7XG4gIGNvbnN0IGZvcm1hdHMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy0tYXBpLWZvcm1hdCcpKTtcbiAgZm9ybWF0cy5zbGljZSgtMilbMF0ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZm9ybWF0TGluZUNvbnRyb2xsZXIpO1xuICBmb3JtYXRzLnNsaWNlKC0xKVswXS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmb3JtYXRMaW5lQ29udHJvbGxlcik7XG59O1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0aWYoX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSkge1xuXHRcdHJldHVybiBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0aWQ6IG1vZHVsZUlkLFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiBtb2R1bGVbJ2RlZmF1bHQnXSA6XG5cdFx0KCkgPT4gbW9kdWxlO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5nID0gKGZ1bmN0aW9uKCkge1xuXHRpZiAodHlwZW9mIGdsb2JhbFRoaXMgPT09ICdvYmplY3QnKSByZXR1cm4gZ2xvYmFsVGhpcztcblx0dHJ5IHtcblx0XHRyZXR1cm4gdGhpcyB8fCBuZXcgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JykgcmV0dXJuIHdpbmRvdztcblx0fVxufSkoKTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsInZhciBzY3JpcHRVcmw7XG5pZiAoX193ZWJwYWNrX3JlcXVpcmVfXy5nLmltcG9ydFNjcmlwdHMpIHNjcmlwdFVybCA9IF9fd2VicGFja19yZXF1aXJlX18uZy5sb2NhdGlvbiArIFwiXCI7XG52YXIgZG9jdW1lbnQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLmcuZG9jdW1lbnQ7XG5pZiAoIXNjcmlwdFVybCAmJiBkb2N1bWVudCkge1xuXHRpZiAoZG9jdW1lbnQuY3VycmVudFNjcmlwdClcblx0XHRzY3JpcHRVcmwgPSBkb2N1bWVudC5jdXJyZW50U2NyaXB0LnNyY1xuXHRpZiAoIXNjcmlwdFVybCkge1xuXHRcdHZhciBzY3JpcHRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJzY3JpcHRcIik7XG5cdFx0aWYoc2NyaXB0cy5sZW5ndGgpIHNjcmlwdFVybCA9IHNjcmlwdHNbc2NyaXB0cy5sZW5ndGggLSAxXS5zcmNcblx0fVxufVxuLy8gV2hlbiBzdXBwb3J0aW5nIGJyb3dzZXJzIHdoZXJlIGFuIGF1dG9tYXRpYyBwdWJsaWNQYXRoIGlzIG5vdCBzdXBwb3J0ZWQgeW91IG11c3Qgc3BlY2lmeSBhbiBvdXRwdXQucHVibGljUGF0aCBtYW51YWxseSB2aWEgY29uZmlndXJhdGlvblxuLy8gb3IgcGFzcyBhbiBlbXB0eSBzdHJpbmcgKFwiXCIpIGFuZCBzZXQgdGhlIF9fd2VicGFja19wdWJsaWNfcGF0aF9fIHZhcmlhYmxlIGZyb20geW91ciBjb2RlIHRvIHVzZSB5b3VyIG93biBsb2dpYy5cbmlmICghc2NyaXB0VXJsKSB0aHJvdyBuZXcgRXJyb3IoXCJBdXRvbWF0aWMgcHVibGljUGF0aCBpcyBub3Qgc3VwcG9ydGVkIGluIHRoaXMgYnJvd3NlclwiKTtcbnNjcmlwdFVybCA9IHNjcmlwdFVybC5yZXBsYWNlKC8jLiokLywgXCJcIikucmVwbGFjZSgvXFw/LiokLywgXCJcIikucmVwbGFjZSgvXFwvW15cXC9dKyQvLCBcIi9cIik7XG5fX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBzY3JpcHRVcmw7IiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGVcbl9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9qcy9pbmRleC5qc1wiKTtcbi8vIFRoaXMgZW50cnkgbW9kdWxlIHVzZWQgJ2V4cG9ydHMnIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbiJdLCJzb3VyY2VSb290IjoiIn0=