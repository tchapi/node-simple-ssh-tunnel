Simple SSH tunnel for Node
---

> This script has no dependency on other Node modules.

See the article at https://www.foobarflies.io/tunnel-all-the-things/

#### Usage :

    const tunnel = require('ssh_tunnel')
    
    tunnel.setConfig({
        user: "tunnel_user",
        server: "central.example.org",
        port: 22,
        timeout: 10000, // in milliseconds
        verbose: true // will output logs to the console if true
    })
    
    tunnel.start(function() {
        console.log(tunnel.getState())
        
        // Later ...
        tunnel.stop()
    }, function() {
        console.log("There has been an error ...")
    })
