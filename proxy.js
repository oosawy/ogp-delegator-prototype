const http = require('http')
const stream = require('stream')

const SERVER = 'http://localhost:9001'

const server = http.createServer((req, res) => {
  req.pipe(
    http
      .request(SERVER, {
        method: req.method,
        path: req.url,
        headers: req.headers,
      })
      .on('error', () => res.writeHead(502).end())
      .on('timeout', () => res.writeHead(504).end())
      .on('response', (subRes) => {
        delete subRes.headers['content-length']
        res.writeHead(subRes.statusCode, subRes.headers)

        if (subRes.headers['content-type']?.startsWith('text/html')) {
          const url = new URL(req.url, SERVER).toString()
          subRes.pipe(new OGPDelegatorReplacer(url)).pipe(res)
        } else {
          subRes.pipe(res)
        }
      }),
  )
})

server.listen(9000)

class OGPDelegatorReplacer extends stream.Transform {
  REGEX = /<meta\s+property=(["'])ogp-delegator\1\s+content=(["'])(?<url>[^\2]+)\2\s*\/?>/
  found = false
  searchBuffer = ''
  requesting = false
  waitingBuffer = ''

  constructor(pageURL) {
    super()
    this.url = pageURL
  }

  _transform(chunk, _encoding, callback) {
    if (this.requesting) {
      this.waitingBuffer += chunk.toString()
      return
    }
    if (this.found) return callback(chunk)

    const html = this.searchBuffer + chunk.toString()

    const index = html.indexOf('ogp-delegator')

    if (index !== -1) {
      const match = html.match(this.REGEX)

      if (match) {
        this.found = true

        const url = new URL(match.groups.url)
        url.searchParams.set('url', this.url)

        const head = html.slice(0, match.index)
        const tail = html.slice(match.index + match[0].length)

        this.requesting = true
        http.get(url, (res) => {
          let ogp = ''
          res.on('data', (chunk) => {
            ogp += chunk
          })

          res.on('end', () => {
            callback(null, head + ogp + tail + this.waitingBuffer)
            this.requesting = false
          })
        })

        return
      }
    }

    // buffering the range potentially contain the tag
    const head = html.slice(0, -50)
    callback(null, head)

    const tail = html.slice(-50)
    this.searchBuffer = tail
  }

  _flush(callback) {
    if (this.searchBuffer) {
      callback(null, this.searchBuffer)
    }

    callback(null, null)
  }
}
