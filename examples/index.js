'use strict'

const tunnel = require('../ssh_tunnel')

tunnel.setConfig({
    user: "foo",
    server: "central.example.org",
    port: 3000,
    timeout: 10000, // in milliseconds
    verbose: true
})

tunnel.start(function() {
    console.log(tunnel.getState())

    // Later ...
    tunnel.stop()
})
    