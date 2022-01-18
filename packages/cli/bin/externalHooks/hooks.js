// require('dotenv').config();

module.exports = {
	workflow: {
		afterUpdate: [
			async (workflow) => {
				// console.log('process.env => ', process.env);
				const smartcloudServerUrl = "ramacorp.outsystemscloud.com"
				const endpoint = "/SmartCloud/rest/api/updateN8nWorkflowConfig/" + workflow.id
				const https = require('https')

				const data = JSON.stringify({
					stringifiedConfiguration: JSON.stringify(workflow)
				})

				const options = {
					hostname: smartcloudServerUrl,
					port: 443,
					path: endpoint,
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Content-Length': data.length
					}
				}

				const req = https.request(options, res => {
					console.log(`statusCode: ${res.statusCode}`)

					res.on('data', d => {
						process.stdout.write(d)
					})
				})

				req.on('error', error => {
					console.error(error)
				})

				req.write(data)
				req.end()

				// console.log('Hook after workflow has been updated', workflow);
			},
		]
	}
};
