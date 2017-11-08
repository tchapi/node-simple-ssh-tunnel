/**
 * @fileoverview Wrapper for a simple SSH tunnel
 * @author tchapi
 */

'use strict'

const {exec, spawn} = require('child_process')

let config = {
    user: null,
    server: null,
    port: 22,
    timeout: 10000,
    verbose: true
}

let state = {
    port: null
}

let child = null
let retry = null

/**
 * Sets the global configuration.
 *
 * @param {object} options The options object (see default above)
 */
let setConfig = function(options) {
    config = options
}

/**
 * Returns the current tunnel state.
 *
 * @return {object} state The current state
 */
let getState = function() {
    return state
}

/**
 * Starts the tunnel.
 *
 * @param {function} success_cb The success callback
 * @param {function} error_cb The error callback
 */
let start = function(success_cb, error_cb) {

    if (config.verbose) { console.log('[info] Starting tunnel to ' + config.user + '@' + config.server) }

    child = spawn("ssh", [
        config.user + '@' + config.server,
        "-o PasswordAuthentication=no",
        "-o ServerAliveInterval=30",
        "-N",
        "-R 0:localhost:" + config.port
    ])

    child.stdout.on('data', function(data) {
        if (config.verbose) { console.log('[info] ', data.toString().replace(/\r?\n|\r/g, " ")) }
    });
    child.stderr.on('data', function(data) {
        if (config.verbose) { console.log('[info] ', data.toString().replace(/\r?\n|\r/g, " ")) }
        var tokens = data.toString().split(" ")
        var port = null
        if (tokens.length > 2 && tokens[0] == "Allocated") {
            state.port = tokens[2]
            if (config.verbose) { console.log('[success] Tunnel active at ' + state.port) }
            if (success_cb && typeof(success_cb) == 'function') {
                success_cb()
            }
        } else {
            state.port = null
            if (config.verbose) { console.log('[error] Unable to open tunnel to ' + config.server) }
            if (error_cb && typeof(error_cb) == 'function') {
                error_cb()
            }
        }
    })

    child.on('close', function(code) {
        if (config.verbose) { console.log('[error] Tunnel closed with code: ' + code + ', restarting in ' + (config.timeout/1000) + ' secs ...') }
        retry = setTimeout(start, config.timeout)
    })
}

/**
 * Stops the tunnel.
 *
 */
let stop = function() {
    clearTimeout(retry)
    child.stdin.pause()
    child.kill()
    state.port = null
}

module.exports.start = start
module.exports.stop = stop
module.exports.setConfig = setConfig
module.exports.getState = getState
