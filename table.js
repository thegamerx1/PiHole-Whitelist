const fsp = require("fs/promises")
const util = require("util")
const exec = util.promisify(require("child_process").exec)

isWindows = process.platform === "win32"
var ipList = []

class table {
	async init() {
		await fsp.stat("allowed.list").catch(async err => {
			await fsp.writeFile("allowed.list", "127.0.0.1\n")
		})

		console.log("Preparing table")
		await this.flush()
		await run("-I DOCKER-USER -i eth0 -p tcp --dport 53 -j DROP")
		await run("-I DOCKER-USER -i eth0 -p udp --dport 53 -j DROP")
		await fsp.readFile("allowed.list", "utf8").then(data => {
			ipList = data.split("\n").filter(ip => ip !== "")
		})
		ipList.forEach(async ip => {
			await this.add(ip)
		})
		console.log("Table ready")
	}

	async add(ip) {
		await run(`-I DOCKER-USER -i eth0 -s ${ip}/32 -j ACCEPT`)
		ipList.push(ip)
		await saveFile()
		console.log(ip + " was added")
	}

	async remove(ip) {
		await run(`-D DOCKER-USER -s ${ip}/32`)
		ipList.splice(ipList.indexOf(ip), 1)
		await saveFile()
		console.log(ip + " was removed")
	}

	async exist(ip) {
		return ipList.includes(ip)
	}

	async flush() {
		await run("-F DOCKER-USER")
	}
}

async function run(command) {
	if (isWindows) {
		console.log(`Run "sudo iptables ${command}"`)
		return
	}
	const { error } = await exec("sudo iptables " + command)
	if (error) {
		console.error(`"${command}" failed: `)
		console.error(error)
		throw error
	}
}

async function saveFile() {
	await fsp.writeFile("allowed.list", ipList.join("\n"))
}

module.exports = new table()
