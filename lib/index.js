/**
 * @dsh-external/dsh-wechat-chat — host half.
 * 提供 webServer 前缀路由:
 *   GET /@dsh-external/dsh-wechat-chat/api/audit?data=<json>
 * 把 client 半区回传的 DOM 审计写入 ~/.dsh/wechat-chat-audit.json,
 * 供开发调试校准。模块格式与已装配 bundle 插件一致(ESM)。
 */
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { homedir } from 'node:os'

export const name = '@dsh-external/dsh-wechat-chat'
export const inject = ['webServer']

const PREFIX = '/@dsh-external/dsh-wechat-chat/api'

export function apply(ctx) {
  ctx.effect(() => ctx.webServer.register({
    kind: 'prefix',
    path: PREFIX,
    handler: async (req, res) => {
      try {
        const url = new URL(req.url ?? '/', 'http://localhost')
        if (url.pathname.endsWith('/audit')) {
          const data = url.searchParams.get('data') ?? ''
          const file = join(homedir(), '.dsh', 'wechat-chat-audit.json')
          await writeFile(file, data, 'utf8')
          res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
          res.end(JSON.stringify({ ok: true, file }))
          return
        }
        res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify({ ok: true, name }))
      } catch (err) {
        res.writeHead(500, { 'content-type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify({ ok: false, error: String(err?.message ?? err) }))
      }
    },
  }), '@dsh-external/dsh-wechat-chat: audit api')
}
