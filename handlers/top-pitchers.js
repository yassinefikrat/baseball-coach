// handler for /team/:team/top-pitchers

const {send} = require('micro')

const got = require('got')

const handler = async (req, res) => {

	const team = req.params.team

	let teamInningsPitched
	let pitchers = []

	const teamUrl = 'https://api.mysportsfeeds.com/v2.0/pull/mlb/2018-regular/team_stats_totals.json?team=' + team

	const options = {
		'auth': '78065931-6ba8-463c-ae1f-b9224f:MYSPORTSFEEDS',
		'json': true
	}

	try{

  		const response = await got(teamUrl, options)

  		if(response.body.teamStatsTotals.length === 0) {
	  		return send(res, 404, 'No team by the name ' + team)
	  	}

	  	// Retrieve team innings pitched
	  	teamInningsPitched = response.body.teamStatsTotals[0].stats.pitching.inningsPitched

	  	const pitchers = await getAllPitchers(team)

  		return send(res, 200, compute(teamInningsPitched, pitchers))

	} catch (error) {
		console.log(error)
		return send(res, 500, error)
	}

}

const getAllPitchers = async (team) => {
	
	const options = {
		query: {
			team,
			position: 'p'
		},
		auth: '78065931-6ba8-463c-ae1f-b9224f:MYSPORTSFEEDS',
		json: true
	}

	const response = await got('https://api.mysportsfeeds.com/v2.0/pull/mlb/2018-regular/player_stats_totals.json', options)

	return response.body.playerStatsTotals.map(e => ({
		id: e.player.id,
		fullName: `${e.player.firstName} ${e.player.lastName}`,
		inningsPitched: e.stats.pitching.inningsPitched
	}))

}

const compute = (teamInningsPitched, pitchers) => {
	return pitchers
		.sort((a, b) => b.inningsPitched - a.inningsPitched)
		.map((player, index) => ({
			...player, 
			playTimePercentage: (player.inningsPitched / teamInningsPitched) * 100, 
			order: index + 1}
			))
}

module.exports = handler