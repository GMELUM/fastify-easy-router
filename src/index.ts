import { FastifyInstance, FastifyPluginCallback, FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import fp from "fastify-plugin";
import fs from "node:fs";
import p from "node:path";

export type TController<T> = (fastify: FastifyInstance, request: T, reply: FastifyReply) => void;

export type IExecute<T> = {
  method: HTTPMethods;
  access: ExecuteAccess;
  controller: TController<T>;
} & Record<string, any>;

export interface Controller {
  method: HTTPMethods;
  access: { [key: string]: boolean };
  controller: TController<FastifyRequest>
}

export type ExecuteAccess = { [key: string]: boolean };

type TCallbackOpts = {
  path: string;
  middleware?: string;
}

const callback: FastifyPluginCallback<TCallbackOpts> = async (
  instance,
  { path, middleware }
) => {
  try {
    const rootDir = path;
    const rootMiddleware = middleware && await import(middleware);
    const getController = (path: string) => {

      fs.readdirSync(path).map((file) => {
        const dirFile = p.join(path, file);
        if (fs.statSync(dirFile).isDirectory()) { return getController(dirFile); }

        const url = dirFile
          .replace(path, "")
          .replace('.js', "")
          .replace('.ts', "")
          .replace('index', "")
          .replace(/\[/g, ":")
          .replace(/\]/g, "");

        const urlDir = path.replace(rootDir, "");
        import(dirFile).then((cont: { default: Controller }) => {
          const execute = cont.default;
          const { access, method, controller, ...prevAtr } = execute;
          instance.route({
            method: method,
            url: `${p.join(urlDir, url)}`,
            preHandler: async (request, reply) => rootMiddleware ?
              await rootMiddleware.default(instance, execute, request, reply) : true,
            handler: async (request, reply) => controller(instance, request, reply),
            ...prevAtr
          })
          console.log(`[${method}] ${p.join(urlDir, url)}`);
        });
      })

    }

    getController(path);
  } catch (err) { console.log(err) }
}

export default fp(callback);
