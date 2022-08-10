import fp from "fastify-plugin";
import fs from "node:fs";
import p from "node:path";
const callback = async (instance, { path, middleware }) => {
    try {
        const rootDir = path;
        const rootMiddleware = middleware && await import(middleware);
        const getController = (path) => {
            fs.readdirSync(path).map((file) => {
                const dirFile = p.join(path, file);
                if (fs.statSync(dirFile).isDirectory()) {
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
                import(dirFile).then((cont) => {
                    const execute = cont.default;
                    const { access, method, controller, ...prevAtr } = execute;
                    instance.route({
                        method: method,
                        url: `${p.join(urlDir, url)}`,
                        preHandler: async (request, reply) => rootMiddleware ?
                            await rootMiddleware.default(instance, execute, request, reply) : true,
                        handler: async (request, reply) => controller(instance, request, reply),
                        ...prevAtr
                    });
                    console.log(`[${method}] ${p.join(urlDir, url)}`);
                });
            });
        };
        getController(path);
    }
    catch (err) {
        console.log(err);
    }
};
export default fp(callback);
