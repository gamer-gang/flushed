/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(function(e, a) { for(var i in a) e[i] = a[i]; if(a.__esModule) Object.defineProperty(e, "__esModule", { value: true }); }(exports,
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/game.ts":
/*!*********************!*\
  !*** ./src/game.ts ***!
  \*********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\nvar __importDefault = (this && this.__importDefault) || function (mod) {\n    return (mod && mod.__esModule) ? mod : { \"default\": mod };\n};\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.GameServer = void 0;\nconst cors_1 = __importDefault(__webpack_require__(/*! cors */ \"cors\"));\nconst express_1 = __importDefault(__webpack_require__(/*! express */ \"express\"));\nconst http_1 = __webpack_require__(/*! http */ \"http\");\nconst socket_io_1 = __webpack_require__(/*! socket.io */ \"socket.io\");\nclass GameServer {\n    constructor() {\n        this.app = express_1.default();\n        this.server = new http_1.Server(this.app);\n        this.io = new socket_io_1.Server(this.server, {\n            cors: {\n                origin: 'http://localhost:8081',\n            },\n        });\n        this.state = new Map();\n        this.io.on('connection', (socket) => {\n            console.log('poooooooooooooooooOOOOOP');\n        });\n        this.app.use(cors_1.default());\n        this.app.get('/', (req, res) => {\n            res.send('OK');\n        });\n        this.listen();\n    }\n    listen() {\n        return new Promise(resolve => {\n            this.server.listen(GameServer.port, () => resolve());\n        });\n    }\n}\nexports.GameServer = GameServer;\nGameServer.port = parseInt(process.env.PORT || '8080');\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvZ2FtZS50cy5qcyIsInNvdXJjZXMiOlsiL2hvbWUvZ2FtZXIvY29kaW5nL2NhcmRzL3NlcnZlci9zcmMvZ2FtZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgY29ycyBmcm9tICdjb3JzJztcbmltcG9ydCBleHByZXNzIGZyb20gJ2V4cHJlc3MnO1xuaW1wb3J0IHsgU2VydmVyIGFzIEh0dHBTZXJ2ZXIgfSBmcm9tICdodHRwJztcbmltcG9ydCB7IFNlcnZlciwgU29ja2V0IH0gZnJvbSAnc29ja2V0LmlvJztcbmltcG9ydCB7IEdhbWVTdGF0ZSB9IGZyb20gJy4vc3RhdGUnO1xuXG5leHBvcnQgY2xhc3MgR2FtZVNlcnZlciB7XG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgcG9ydDogbnVtYmVyID0gcGFyc2VJbnQocHJvY2Vzcy5lbnYuUE9SVCB8fCAnODA4MCcpO1xuICBhcHA6IGV4cHJlc3MuQXBwbGljYXRpb24gPSBleHByZXNzKCk7XG4gIHNlcnZlcjogSHR0cFNlcnZlciA9IG5ldyBIdHRwU2VydmVyKHRoaXMuYXBwKTtcbiAgaW86IFNlcnZlciA9IG5ldyBTZXJ2ZXIodGhpcy5zZXJ2ZXIsIHtcbiAgICBjb3JzOiB7XG4gICAgICBvcmlnaW46ICdodHRwOi8vbG9jYWxob3N0OjgwODEnLFxuICAgIH0sXG4gIH0pO1xuXG4gIHN0YXRlOiBNYXA8c3RyaW5nLCBHYW1lU3RhdGU+ID0gbmV3IE1hcCgpO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuaW8ub24oJ2Nvbm5lY3Rpb24nLCAoc29ja2V0OiBTb2NrZXQpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKCdwb29vb29vb29vb29vb29vb29PT09PT1AnKTtcbiAgICB9KTtcblxuICAgIHRoaXMuYXBwLnVzZShjb3JzKCkpO1xuXG4gICAgdGhpcy5hcHAuZ2V0KCcvJywgKHJlcSwgcmVzKSA9PiB7XG4gICAgICByZXMuc2VuZCgnT0snKTtcbiAgICB9KTtcblxuICAgIHRoaXMubGlzdGVuKCk7XG4gIH1cblxuICBsaXN0ZW4oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KHJlc29sdmUgPT4ge1xuICAgICAgdGhpcy5zZXJ2ZXIubGlzdGVuKEdhbWVTZXJ2ZXIucG9ydCwgKCkgPT4gcmVzb2x2ZSgpKTtcbiAgICB9KTtcbiAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUdBO0FBWUE7QUFWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBR0E7QUFDQTtBQUNBO0FBRUE7QUFFQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUE5QkE7QUFDQTsiLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/game.ts\n");

/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("var __dirname = \"src\";\n\nvar __importDefault = (this && this.__importDefault) || function (mod) {\n    return (mod && mod.__esModule) ? mod : { \"default\": mod };\n};\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nconst dotenv_1 = __importDefault(__webpack_require__(/*! dotenv */ \"dotenv\"));\nconst path_1 = __importDefault(__webpack_require__(/*! path */ \"path\"));\nconst game_1 = __webpack_require__(/*! ./game */ \"./src/game.ts\");\ndotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });\nconst game = new game_1.GameServer();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvaW5kZXgudHMuanMiLCJzb3VyY2VzIjpbIi9ob21lL2dhbWVyL2NvZGluZy9jYXJkcy9zZXJ2ZXIvc3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBkb3RlbnYgZnJvbSAnZG90ZW52JztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgR2FtZVNlcnZlciB9IGZyb20gJy4vZ2FtZSc7XG5cbmRvdGVudi5jb25maWcoeyBwYXRoOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vLmVudicpIH0pO1xuXG5jb25zdCBnYW1lID0gbmV3IEdhbWVTZXJ2ZXIoKTtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBRUE7QUFFQTsiLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/index.ts\n");

/***/ }),

/***/ "cors":
/*!***********************!*\
  !*** external "cors" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("cors");;

/***/ }),

/***/ "dotenv":
/*!*************************!*\
  !*** external "dotenv" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("dotenv");;

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("express");;

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");;

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");;

/***/ }),

/***/ "socket.io":
/*!****************************!*\
  !*** external "socket.io" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("socket.io");;

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
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__("./src/index.ts");
/******/ })()

));