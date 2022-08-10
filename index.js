"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const callback = async (instance, { path, middleware }) => {
    try {
        const rootDir = path;
        const rootMiddleware = middleware && await Promise.resolve().then(() => __importStar(require(middleware)));
        const getController = (path) => {
            node_fs_1.default.readdirSync(path).map((file) => {
                const dirFile = node_path_1.default.join(path, file);
                if (node_fs_1.default.statSync(dirFile).isDirectory()) {
                    return getController(dirFile);
                }
                const url = dirFile
                    .replace(path, "")
                    .replace('.js', "")
                    .replace('.ts', "")
                    .replace('index', "")
                    .replace(/\[/g, ":")
                    .replace(/\]/g, "");
                const urlDir = path.replace(rootDir, "");
                Promise.resolve().then(() => __importStar(require(dirFile))).then((cont) => {
                    const execute = cont.default;
                    const { access, method, controller, ...prevAtr } = execute;
                    instance.route({
                        method: method,
                        url: `${node_path_1.default.join(urlDir, url)}`,
                        preHandler: async (request, reply) => rootMiddleware ?
                            await rootMiddleware.default(instance, execute, request, reply) : true,
                        handler: async (request, reply) => controller(instance, request, reply),
                        ...prevAtr
                    });
                    console.log(`[${method}] ${node_path_1.default.join(urlDir, url)}`);
                });
            });
        };
        getController(path);
    }
    catch (err) {
        console.log(err);
    }
};
exports.default = (0, fastify_plugin_1.default)(callback);
