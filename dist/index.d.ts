/// <reference types="node" />
import { FastifyInstance, FastifyPluginCallback, FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
export declare type TController<T> = (fastify: FastifyInstance, request: T, reply: FastifyReply) => void;
export declare type IExecute<T> = {
    method: HTTPMethods;
    access: ExecuteAccess;
    controller: TController<T>;
} & Record<string, any>;
export interface Controller {
    method: HTTPMethods;
    access: {
        [key: string]: boolean;
    };
    controller: TController<FastifyRequest>;
}
export declare type ExecuteAccess = {
    [key: string]: boolean;
};
declare type TCallbackOpts = {
    path: string;
    middleware?: string;
};
declare const _default: FastifyPluginCallback<TCallbackOpts, import("http").Server, import("fastify").FastifyTypeProviderDefault>;
export default _default;
