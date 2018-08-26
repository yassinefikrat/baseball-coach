const {send, json} = require('micro')

const { router, get } = require('microrouter')

const got = require('got')

const teamHandler = async (req, res) => {

	const urlOf = (team) => 'https://api.mysportsfeeds.com/v2.0/pull/mlb/2018-regular/team_stats_totals.json?team=' + team

	const options = {
		'auth': '78065931-6ba8-463c-ae1f-b9224f:MYSPORTSFEEDS',
		'json': true
	}

	try{

  		const response = await got(urlOf(req.params.team), options)

  		if(response.body.teamStatsTotals.length === 0) {
	  		return send(res, 404, 'No team by this name')
	  	}

  		return send(res, 200, response.body)

	} catch (error) {
		return send(res, 500, error)
	}

}

const routes = [
	get('/team/:team', teamHandler),
	get('/*', (req, res) => send(res, 404, 'Not a valid route'))
]

module.exports = router(...routes)