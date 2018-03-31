module.exports = (container, stream, argv) => {
  container.exec({
    Cmd: argv._.splice(2),
    Tty: true,
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true
  }, function (err, exec) {
    if (err) {
      stream.write('Error while connecting ti the container')
      stream.exit(1)
      stream.end()
      return
    }
    exec.start({
      hijack: true,
      stdin: true
    }, (err, containerStream) => {
      if (err) {
        stream.write('Error while connecting ti the container')
        stream.exit(1)
        stream.end()
        return
      }

      stream.pipe(containerStream)
      containerStream.on('data', (t) => {
        stream.write(t.slice(8).toString())
      })
      containerStream.on('close', () => {
        stream.exit(1)
        stream.end()
      })
    })
  })
}