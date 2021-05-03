const R = require('ramda');

    
const groupByTeams = JSONObj => {
    const getTeamsNames = JSONObj => R.pluck('equipo', JSONObj.jugadores);
    const removeDuplicatedTeamsNames = teamsNamesList => R.uniq(teamsNamesList);
    const filterByTeam = teamName => R.filter(R.pathEq(['equipo'], teamName), JSONObj.jugadores);
    const groupPlayersByTeam = teamsNamesList => R.map(filterByTeam, teamsNamesList);
    const updateJSONObj = teamsList => R.set(R.lensProp('jugadores'), teamsList, JSONObj);
    
    return R.compose(updateJSONObj, groupPlayersByTeam, removeDuplicatedTeamsNames, getTeamsNames)(JSONObj);
};

const setTeamsMinGoals = (config, JSONObj) => {

    const setMinGoalsByPlayer = player => {
        const rank2MinGoals = player => {
            const mappedConfig = R.map(n => R.pair(R.equals(n[0]), R.always(n[1])), R.toPairs(player.rankeo_config.rankeo));
            return R.cond(mappedConfig)(player.nivel);
        }; 

        const setPlayerConfig = player => {
            const customConfig = R.filter(R.pathEq(['nombre'], player.equipo), config.equipos);
            const defaultConfig = R.filter(R.pathEq(['nombre'], 'Resuelve FC'), config.equipos);
            const setConfig = config => R.set(R.lensProp('rankeo_config'), R.head(config), player);

            return R.ifElse(R.isEmpty, R.always(setConfig(defaultConfig)), R.always(setConfig(customConfig)))(customConfig);
        };

        const setPlayerMinGoals = player => R.set(R.lensProp('minimo_goles'), rank2MinGoals(player), player);
        return R.compose(setPlayerMinGoals, setPlayerConfig)(player);
    };

    const setMinGoalsByTeam = team => R.map(setMinGoalsByPlayer, team);
    const setMinGoals = teams => R.map(setMinGoalsByTeam, teams);

    return R.set(R.lensProp('jugadores'), setMinGoals(JSONObj.jugadores), JSONObj);
};

const setTeamsThrowput = JSONObj => {

    const sumTeamMinGoals = team => R.sum(R.pluck('minimo_goles', team));
    const sumTeamScoredGoals = team => R.sum(R.pluck('goles', team));
    const getTeamThrowput = team => R.divide(sumTeamScoredGoals(team), sumTeamMinGoals(team));
    const truncateTeamThrowput = team => R.when(R.gte(R.__, 1), R.always(1))(getTeamThrowput(team));

    const setThrowputByTeam = team => R.map(R.set(R.lensProp('alcance_equipo'), truncateTeamThrowput(team)), team);
    const setThrowput = teams => R.map(setThrowputByTeam, teams);

    return R.set(R.lensProp('jugadores'), setThrowput(JSONObj.jugadores), JSONObj);
};

const setIndividualsThrowput = JSONObj => {

    const getPlayerThrowput = player => R.divide(player.goles, player.minimo_goles);
    const truncatePlayerThrowput = player => R.when(R.gte(R.__, 1), R.always(1))(getPlayerThrowput(player));

    const setIThrowputByPlayer = player => R.set(R.lensProp('alcance_individual'), truncatePlayerThrowput(player), player);
    const setIThrowputByTeam = team => R.map(setIThrowputByPlayer, team);
    const setIThrowput = teams => R.map(setIThrowputByTeam, teams);

    return R.set(R.lensProp('jugadores'), setIThrowput(JSONObj.jugadores), JSONObj);
};

const setSalary = JSONObj => {

    const getBonus = player => R.multiply(player.bono, R.mean([player.alcance_equipo, player.alcance_individual]));

    const setCompleteSalaryByPlayer = player => R.set(R.lensProp('sueldo_completo'), R.sum([player.sueldo, getBonus(player)]), player);
    const setCompleteSalaryByTeam = team => R.map(setCompleteSalaryByPlayer, team);
    const setCompleteSalary = teams => R.map(setCompleteSalaryByTeam, teams);

    return R.set(R.lensProp('jugadores'), R.flatten(setCompleteSalary(JSONObj.jugadores)), JSONObj);
};

const setSalaries = (JSONObj, config) => R.compose(setSalary, setIndividualsThrowput, setTeamsThrowput, R.curry(setTeamsMinGoals)(config), groupByTeams)(JSONObj);
exports.setSalaries = setSalaries;
