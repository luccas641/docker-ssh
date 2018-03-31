module.exports = (container, stream) => {
  container.attach({
    stream: true,
    stdout: true,
    stderr: true
  }, function (err, containerStream) {

    containerStream.on('data', (t) => {
      stream.write(t.slice(8).toString())
    })
    containerStream.on('close', () => {
      stream.exit(1)
      stream.end()
    })
  })
}