const fsp = require("fs/promises")
const util = require("util")
const exec = util.promisify(require("child_process").exec)

const FILE = "allowed.json"
isWindows = process.platform === "win32"
var ipList = []

class table {
	async init() {
		await fsp.stat(FILE).catch(async err => {
			await fsp.writeFile(FILE, JSON.stringify(["127.0.0.1"]))
		})

		console.log("Preparing table")
		await this.flush()
		await run("-I DOCKER-USER -i eth0 -p tcp --dport 53 -j DROP")
		await run("-I DOCKER-USER -i eth0 -p udp --dport 53 -j DROP")
		await fsp.readFile(FILE, "utf8").then(data => {
			JSON.parse(data).forEach(async ip => {
				await this.add(ip)
			})
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
	await fsp.writeFile(FILE, JSON.stringify(ipList))
}

module.exports = new table()
