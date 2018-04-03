const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const inspect = require('util').inspect
const Docker = require('dockerode')
const minimist = require('minimist')
const buffersEqual = require('buffer-equal-constant-time')
const ssh2 = require('ssh2')
const readline = require('readline')
const commands = require('./commands/index.js')
require('dotenv').config()

const docker = new Docker()
const utils = ssh2.utils
let pubKeys = []
let keysReader = readline.createInterface({
  input: fs.createReadStream(path.join(__dirname, '../config', process.env.AUTHORIZED_KEYS_FILE || 'authorized_keys'))
})

keysReader.on('line', (line) => {
  pubKeys.push(utils.genPublicKey(utils.parseKey(line)))
})

keysReader.on('close', () => {
  new ssh2.Server({
    hostKeys: [fs.readFileSync(path.join(__dirname, '../config', process.env.SERVER_KEY || 'id_rsa'))],
  }, function (client) {
    let stream
    client.on('authentication', function (ctx) {
      let valid = false
      if (ctx.method === 'publickey') {
        for (let pubKey of pubKeys) {
          if (ctx.key.algo === pubKey.fulltype &&
            buffersEqual(ctx.key.data, pubKey.public)) {
            if (ctx.signature) {
              let verifier = crypto.createVerify(ctx.sigAlgo)
              verifier.update(ctx.blob)
              if (verifier.verify(pubKey.publicOrig, ctx.signature))
                valid |= true
            } else {
              valid |= true
            }
          }
        }
        valid ? ctx.accept() : ctx.reject()
      } else {
        ctx.reject()
      }

    }).on('ready', function () {
      let rows
      let cols
      let term
      client.on('session', function (accept, reject) {
        let session = accept()
        session.on('window-change', function (accept, reject, info) {
            rows = info.rows
            cols = info.cols
            if (stream) {
              stream.rows = rows
              stream.columns = cols
              stream.emit('resize')
            }
            accept && accept()
          })
          .once('pty', function (accept, reject, info) {
            rows = info.rows
            cols = info.cols
            term = info.term
            accept && accept()
          })
          .once('exec', (accept, reject, info) => {
            let stream = accept()
            stream.rows = rows || 24
            stream.columns = cols || 80

            let argv = minimist(info.command.split(' '))
            let container = docker.getContainer(argv._[1])
            let cmd = argv._[0]

            if (cmd == 'exec') {
              commands.exec(container, stream, argv)
            } else if (cmd == 'logs') {
              commands.logs(container, stream)
            } else {
              stream.write('Command not found.')
              stream.exit(1)
              stream.env()
            }
          })
      })
    })
  }).listen(process.env.SSH_PORT || 2222, process.env.SSH_HOST || '0.0.0.0', function () {
    console.log('Listening on port ' + this.address().port)
  })
})